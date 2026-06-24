/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import legalHeroParser from './parsers/legal-hero.js';
import offerTableParser from './parsers/offer-table.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (legal-terms)
const PAGE_TEMPLATE = {
  name: 'legal-terms',
  description: 'Long-form legal/policy document: a navy title band (white h1) followed by a single-column dense rich-text body. The legal-hero parser owns the banner/body section break, so the sections transformer is not used.',
  urls: [
    'https://www.paramount.com/cbs-research-survey-terms-of-use',
  ],
  blocks: [
    {
      name: 'legal-hero',
      instances: ['.header-text-container'],
    },
    {
      name: 'offer-table',
      instances: ['.content-table-wrapper'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'legal-hero': legalHeroParser,
  'offer-table': offerTableParser,
};

// TRANSFORMER REGISTRY — cleanup only (host rewrite, chrome removal); the
// legal-hero parser emits its own section break + vista-navy metadata, so the
// sections transformer is intentionally omitted.
const transformers = [
  cleanupTransformer,
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
      document, url, params,
    } = payload;

    const main = document.body;

    // Preserve the right-aligned top-of-body date. Some legal pages open with a
    // `<p class="text-align-right">As of {date}</p>` line; that alignment is a CSS
    // class that does NOT survive markdown conversion. Convert it to a `legal-date`
    // BLOCK (blocks survive markdown), which the block CSS renders right-aligned.
    // Must run BEFORE cleanup strips classes / block parsing.
    const dateP = document.querySelector('p.text-align-right');
    if (dateP && /^\s*(as of|effective|last updated|last revised|updated)/i.test(dateP.textContent || '')) {
      // Move the date content into a single wrapper element so the block has
      // exactly one row / one cell (avoids malformed cell arrays).
      const cellEl = document.createElement('p');
      while (dateP.firstChild) cellEl.append(dateP.firstChild);
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'legal-date',
        cells: [[cellEl]],
      });
      dateP.replaceWith(block);
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

    // 4. afterTransform cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Tag the page with its template so EDS adds `body.legal-terms` (via
    // decorateTemplateAndTheme), letting legal-terms CSS scope to this template
    // without touching the shared hero-page block (used by content-page too).
    const metaTable = Array.from(main.querySelectorAll('table')).find((t) => {
      const h = t.querySelector('tr th, tr td');
      return h && (h.textContent || '').trim().toLowerCase() === 'metadata';
    });
    if (metaTable) {
      const body = metaTable.querySelector('tbody') || metaTable;
      const row = document.createElement('tr');
      const k = document.createElement('td');
      k.textContent = 'template';
      const v = document.createElement('td');
      v.textContent = PAGE_TEMPLATE.name;
      row.append(k, v);
      body.append(row);
    }

    // 6. Sanitized path (root-level legal slugs)
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
