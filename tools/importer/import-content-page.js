/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPageParser from './parsers/hero-page.js';
import cardsPeopleParser from './parsers/cards-people.js';
import columnsInfoParser from './parsers/columns-info.js';
import cardsShowParser from './parsers/cards-show.js';
import statsParser from './parsers/stats.js';
import cardsParser from './parsers/cards.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import accordionParser from './parsers/accordion.js';
import definitionListParser from './parsers/definition-list.js';
import calloutParser from './parsers/callout.js';
import jobSearchParser from './parsers/job-search.js';
import testimonialsParser from './parsers/testimonials.js';
import cardsNewsParser from './parsers/cards-news.js';
import formPlaceholderParser from './parsers/form-placeholder.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/paramount-cleanup.js';
import sectionsTransformer from './transformers/paramount-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (content-page)
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Standard corporate content page: text-only navy page hero (breadcrumb + title) followed by a flexible stack of sections — leadership/people card grids, two-column description+links, related-content card carousels, and big-number stat strips. Covers about, businesses, and careers sub-pages.',
  urls: [
    'https://www.paramount.com/about/board-of-directors',
  ],
  blocks: [
    {
      name: 'hero-page',
      instances: ['.podcast-header-wrapper', '.wrapper-hero-sec', '.wrapper-ads-banner'],
    },
    {
      name: 'cards-people',
      instances: ['.wrapper-leadership-list ul.leadership-tile-slider'],
    },
    {
      name: 'columns-info',
      instances: ['.wrapper-content-desc .container .row.g-0', '.wrapper-content-desc .row'],
    },
    {
      name: 'cards-show',
      instances: ['.wrapper-tile-carousel .carousel-with-tiles', '.wrapper-tile-carousel .brand-tile-slider', '.wrapper-brand-tile .brand-tile-slider', '.wrapper-podcast ul.podcast-listing', '.wrapper-business-cards ul.business-cards-list'],
    },
    {
      name: 'stats',
      instances: ['.wrapper-content-breaker ul.contentBreaker-list'],
    },
    {
      name: 'cards',
      instances: ['.wrapper-text-col-with-links ul.text-col-link-list', 'ul.three-col-text-card-list', '.wrapper-aboutValues ul.ourValues-list', 'ul.curated-awards', 'ul.bold-tricolumn-list', '.wrapper-bg-card-overlay', '.awards-filter-view-wrapper:not(.awards-view-mobile) ul.awards-filter'],
    },
    {
      name: 'testimonials',
      instances: ['.cardCarousel-text-slider'],
    },
    {
      name: 'columns-feature',
      instances: ['.wrapper-media-card', '.wrapper-history-carousel'],
    },
    {
      name: 'cards-news',
      instances: ['.wrapper-latestNews-tile ul.latestNews-tile-list'],
    },
    {
      name: 'form-placeholder',
      instances: ['.wrapper-ads-form', '.wrapper-contact-us .form-fields-block', '.wrapper-license-form .form-fields-block'],
    },
    {
      name: 'accordion',
      instances: ['.wrapper-accordion-faq', '.wrapper-accordion-sm-layout'],
    },
    {
      name: 'definition-list',
      instances: ['.wrapper-multiline ul.multiline-column-list'],
    },
    {
      name: 'callout',
      instances: ['.pusher-wrapper'],
    },
    {
      name: 'job-search',
      instances: ['.wrapper-career-filter'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Page hero',
      selector: '.podcast-header-wrapper',
      style: null,
      blocks: ['hero-page'],
      defaultContent: [],
    },
    {
      id: 'section-1b-intro',
      name: 'Centered intro RTE (careers)',
      selector: '.wrapper-rte-block.wrapper-container-large',
      style: 'center',
      blocks: [],
      defaultContent: ['.wrapper-rte-block.wrapper-container-large'],
    },
    {
      id: 'section-2-leadership',
      name: 'Leadership / people listing',
      selector: '.wrapper-leadership-list',
      style: null,
      repeat: true,
      blocks: ['cards-people'],
      defaultContent: ['.wrapper-leadership-list .section-heading'],
    },
    {
      id: 'section-3-desc',
      name: 'Description + links',
      selector: '.wrapper-content-desc',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-4-related-content',
      name: 'Related content',
      selector: '.wrapper-tile-carousel',
      style: null,
      blocks: ['cards-show'],
      defaultContent: ['.wrapper-tile-carousel .section-heading'],
    },
    {
      id: 'section-5-stats',
      name: 'Stat strip',
      selector: '.wrapper-content-breaker',
      style: null,
      blocks: ['stats'],
      defaultContent: [],
    },
    {
      id: 'section-6-more',
      name: 'More businesses / link grid',
      selector: '.wrapper-text-col-with-links',
      style: null,
      blocks: ['cards'],
      defaultContent: ['.wrapper-text-col-with-links .section-heading'],
    },
    {
      id: 'section-7-podcasts',
      name: 'Podcast card grids',
      selector: '.wrapper-podcast',
      style: null,
      blocks: ['cards-show'],
      defaultContent: ['.wrapper-podcast .section-heading'],
    },
    {
      id: 'section-8-values',
      name: 'Compliance / values card grid (/about)',
      selector: '.wrapper-aboutValues',
      style: null,
      repeat: true,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-9-feature',
      name: 'Media-card feature rows (careers)',
      selector: '.wrapper-media-card',
      style: null,
      repeat: true,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-10-multiline',
      name: 'Multiline definition list (benefits wellness)',
      selector: '.wrapper-multiline',
      style: null,
      blocks: ['definition-list'],
      defaultContent: ['.wrapper-multiline .section-heading'],
    },
    {
      id: 'section-11-faq',
      name: 'FAQ accordion (internships)',
      selector: '.wrapper-accordion-faq',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['.wrapper-accordion-faq .section-heading'],
    },
    {
      id: 'section-12-callout',
      name: 'Pusher callout / download CTA (grey band)',
      selector: '.pusher-wrapper',
      style: null,
      repeat: true,
      blocks: ['callout'],
      defaultContent: [],
    },
    {
      id: 'section-13-jobsearch',
      name: 'Job-search placeholder (explore the possibilities)',
      selector: '.wrapper-career-filter',
      style: null,
      blocks: ['job-search'],
      defaultContent: [],
    },
    {
      id: 'section-14-business-cards',
      name: 'Business cards grid (/about/businesses index)',
      selector: '.wrapper-business-cards',
      style: null,
      blocks: ['cards-show'],
      defaultContent: [],
    },
    {
      id: 'section-15-accordion-sm',
      name: 'Small-layout accordion (business detail "Our Approach")',
      selector: '.wrapper-accordion-sm-layout',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['.wrapper-accordion-sm-layout .section-heading'],
    },
    {
      id: 'section-16-awards',
      name: 'Awards & recognition cards (internships)',
      selector: '.curated-awards-wrapper',
      style: null,
      repeat: true,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-17-kickstart',
      name: 'Kick-start / history carousel (intro + banner)',
      selector: '.wrapper-history-carousel',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-18-testimonials',
      name: 'Intern testimonials carousel',
      selector: '.cardCarousel-text-slider',
      style: null,
      blocks: ['testimonials'],
      defaultContent: [],
    },
    {
      id: 'section-19-value-props',
      name: 'Value-prop overlay cards (advertising)',
      selector: '.wrapper-bg-card-overlay',
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-20-news',
      name: 'Latest news & insights cards (advertising)',
      selector: '.wrapper-latestNews-tile',
      style: null,
      blocks: ['cards-news'],
      defaultContent: ['.wrapper-latestNews-tile .section-heading'],
    },
    {
      id: 'section-22-awards-filter',
      name: 'Awards listing (awards page)',
      selector: '.wrrapper-awards-filter',
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-21-ads-form',
      name: 'Contact form placeholder (advertising)',
      selector: '.wrapper-ads-form',
      style: null,
      blocks: ['form-placeholder'],
      defaultContent: [],
    },
    {
      id: 'section-23-contact-form',
      name: 'Contact / licensing form placeholder (contact-us, licensing)',
      selector: '.wrapper-contact-us, .wrapper-license-form',
      style: null,
      blocks: ['form-placeholder'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-page': heroPageParser,
  'cards-people': cardsPeopleParser,
  'columns-info': columnsInfoParser,
  'cards-show': cardsShowParser,
  stats: statsParser,
  cards: cardsParser,
  'columns-feature': columnsFeatureParser,
  accordion: accordionParser,
  'definition-list': definitionListParser,
  callout: calloutParser,
  'job-search': jobSearchParser,
  testimonials: testimonialsParser,
  'cards-news': cardsNewsParser,
  'form-placeholder': formPlaceholderParser,
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
