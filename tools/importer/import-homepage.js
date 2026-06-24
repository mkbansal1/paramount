/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsBrandParser from './parsers/cards-brand.js';
import columnsCultureParser from './parsers/columns-culture.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';
import sectionsTransformer from './transformers/paramount-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Paramount corporate homepage: full-bleed hero slider, featured brands grid, and a culture/careers section. Header and footer are auto-populated.',
  urls: [
    'https://www.paramount.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.hero-header-transparent.wrapper-hero-slider'],
    },
    {
      name: 'cards-brand',
      instances: ['.wrapper-hm-brand .hm-brand-grid-container'],
    },
    {
      name: 'columns-culture',
      instances: ['.culture-section .culture-sec-content'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Slider',
      selector: 'main #block-paramount-content article .hero-header-transparent',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-brands',
      name: 'Brands Grid',
      selector: 'main #block-paramount-content article .wrapper-hm-brand',
      style: 'brand-blue',
      blocks: ['cards-brand'],
      defaultContent: [
        '.wrapper-hm-brand .hm-brand-header',
        '.wrapper-hm-brand .brands-btn',
      ],
    },
    {
      id: 'section-3-culture',
      name: 'Culture / Shape the Future',
      selector: 'main #block-paramount-content article .culture-section',
      style: 'vista-navy',
      blocks: ['columns-culture'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-brand': cardsBrandParser,
  'columns-culture': columnsCultureParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (default homepage "/" to "index" to avoid empty path)
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
