/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
// NOTE: breadcrumb is intentionally NOT a block here. The brand-detail breadcrumb
// trail (About / Brands / {Brand}) is fully derivable from page hierarchy and is
// better handled by EDS navigation/auto-blocking than authored per page. It also
// lives inside the hero wrapper, which the brand-hero parser replaces wholesale.
import brandHeroParser from './parsers/brand-hero.js';
import columnsInfoParser from './parsers/columns-info.js';
import cardsShowParser from './parsers/cards-show.js';
import cardsBrandParser from './parsers/cards-brand.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';
import sectionsTransformer from './transformers/paramount-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (brand-detail)
const PAGE_TEMPLATE = {
  name: 'brand-detail',
  description: 'Brand detail page: breadcrumb + full-bleed brand hero, a two-column description + links section, a related-content card grid, and a related-brands card grid with a View All button.',
  urls: [
    'https://www.paramount.com/about/brands/mtv',
  ],
  blocks: [
    {
      name: 'brand-hero',
      instances: ['.podcast-header-wrapper'],
    },
    {
      name: 'columns-info',
      instances: ['.wrapper-content-desc .container .row.g-0', '.wrapper-content-desc .row'],
    },
    {
      name: 'cards-show',
      instances: ['.wrapper-brand-tile .brand-tile-slider'],
    },
    {
      name: 'cards-brand',
      instances: ['.wrapper-related-brand .related-brand'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Brand hero',
      selector: '.podcast-header-wrapper.header-with-video',
      style: null,
      blocks: ['brand-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-desc',
      name: 'Brand description + links',
      selector: '.wrapper-content-desc',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-3-related-content',
      name: 'Related content',
      selector: '.wrapper-brand-tile',
      style: null,
      blocks: ['cards-show'],
      defaultContent: ['.wrapper-brand-tile .coh-heading'],
    },
    {
      id: 'section-4-related-brands',
      name: 'Related brands',
      selector: '.wrapper-related-brand',
      style: null,
      blocks: ['cards-brand'],
      defaultContent: ['.wrapper-related-brand .coh-heading', '.wrapper-related-brand .related-brand-btn'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'brand-hero': brandHeroParser,
  'columns-info': columnsInfoParser,
  'cards-show': cardsShowParser,
  'cards-brand': cardsBrandParser,
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
