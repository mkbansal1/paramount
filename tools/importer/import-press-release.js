/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pressHeroParser from './parsers/press-hero.js';
import offerTableParser from './parsers/offer-table.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';
import sectionsTransformer from './transformers/paramount-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (press-release)
const PAGE_TEMPLATE = {
  name: 'press-release',
  description: 'Corporate press release: a navy press banner (eyebrow + title), an optional byline, and a single-column rich-text body. The auto-generated "More Press" related list is template chrome and is dropped.',
  urls: [
    'https://www.paramount.com/press/paramount-global-reports-first-quarter-2025-earnings-results',
  ],
  blocks: [
    {
      name: 'press-hero',
      instances: ['.press-release-banner-wrapper'],
    },
    {
      name: 'offer-table',
      instances: ['.content-table-wrapper'],
    },
  ],
  sections: [
    {
      id: 'section-1-press-banner',
      name: 'Press release banner',
      selector: '.press-release-banner-wrapper',
      style: null,
      blocks: ['press-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-body',
      name: 'Press release body',
      selector: '.wrapper-press-release-template',
      style: null,
      blocks: [],
      defaultContent: ['.wrapper-press-release-template .press-release-container'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'press-hero': pressHeroParser,
  'offer-table': offerTableParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // Capture the press release date BEFORE cleanup. PRNewswire datelines wrap
    // the date in <span class="xn-chron">, e.g. "NEW YORK, May 8, 2025 /PRNewswire/".
    // The first xn-chron that parses to a valid date is the release date; fall
    // back to a regex on the dateline paragraph. Stored as ISO yyyy-mm-dd in a
    // `press-date` metadata field so the press-index can sort the More Press list.
    let pressDateISO = '';
    const chrons = Array.from(document.querySelectorAll('.xn-chron'));
    for (let i = 0; i < chrons.length; i += 1) {
      const d = new Date((chrons[i].textContent || '').trim());
      if (!Number.isNaN(d.getTime())) { pressDateISO = d.toISOString().slice(0, 10); break; }
    }
    if (!pressDateISO) {
      // Newer releases place a subheadline before the dateline, so scan the whole
      // body text (not just the first paragraph) for the first "Month D, YYYY".
      const bodyEl = document.querySelector('.press-template-content, .press-release-container, .wrapper-press-release-template');
      const bodyText = bodyEl ? (bodyEl.textContent || '') : '';
      const m = bodyText.match(/\b([A-Z][a-z]+\.?\s+\d{1,2},\s+\d{4})\b/);
      if (m) {
        const d = new Date(m[1].replace('.', ''));
        if (!Number.isNaN(d.getTime())) pressDateISO = d.toISOString().slice(0, 10);
      }
    }

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Tag the page with its template so EDS adds `body.press-release` (via
    // decorateTemplateAndTheme), letting press-release CSS scope to this template
    // without touching the shared hero-page block (used by content-page too).
    const metaTable = Array.from(main.querySelectorAll('table')).find((t) => {
      const h = t.querySelector('tr th, tr td');
      return h && (h.textContent || '').trim().toLowerCase() === 'metadata';
    });
    if (metaTable) {
      const body = metaTable.querySelector('tbody') || metaTable;
      const addRow = (key, val) => {
        if (!val) return;
        const row = document.createElement('tr');
        const k = document.createElement('td');
        k.textContent = key;
        const v = document.createElement('td');
        v.textContent = val;
        row.append(k, v);
        body.append(row);
      };
      addRow('template', PAGE_TEMPLATE.name);
      addRow('press-date', pressDateISO);
    }

    // 6. Sanitized path (inner pages always have a path)
    let pathname = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    if (!pathname || pathname === '') {
      pathname = '/index';
    }
    const path = WebImporter.FileUtils.sanitizePath(pathname);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
