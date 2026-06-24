/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import newsHeroParser from './parsers/news-hero.js';
import newsVideoParser from './parsers/news-video.js';
import quoteParser from './parsers/quote.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';
import sectionsTransformer from './transformers/paramount-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (news-article)
const PAGE_TEMPLATE = {
  name: 'news-article',
  description: 'Editorial news article: a news banner hero (date/topic eyebrow + title + intro + lead image), an optional byline, then a single-column rich-text body with inline images, optional full-width pull quotes, and optional YouTube video embeds.',
  urls: [
    'https://www.paramount.com/news/inside-the-top-gun-archive-with-charlotte-barker-and-chuck-woodfill',
  ],
  blocks: [
    {
      name: 'news-hero',
      instances: ['.wrapper-news-banner'],
    },
    {
      name: 'news-video',
      instances: ['iframe[src*="youtube"]'],
    },
    {
      name: 'quote',
      instances: ['.wrapper-fullWidth-quote'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'News banner hero',
      selector: '.wrapper-news-banner',
      style: null,
      blocks: ['news-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-body',
      name: 'Article body',
      selector: '.wrapper-rte-block',
      style: null,
      blocks: [],
      defaultContent: ['.wrapper-rte-block'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'news-hero': newsHeroParser,
  'news-video': newsVideoParser,
  quote: quoteParser,
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
