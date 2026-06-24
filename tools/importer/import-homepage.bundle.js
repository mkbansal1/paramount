/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slideContainers = Array.from(element.querySelectorAll(".hero-slider .slick-slide .slide, .hero-slider .slide"));
    const seenSrc = /* @__PURE__ */ new Set();
    const slideImages = [];
    slideContainers.forEach((slide) => {
      const img = slide.querySelector("img.d-lg-inline-block, img");
      if (img && img.src && !seenSrc.has(img.src)) {
        seenSrc.add(img.src);
        slideImages.push(img);
      }
    });
    if (slideImages.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const bgHeading = document.createElement("h2");
    bgHeading.textContent = "We Are";
    const wordmark = document.createElement("p");
    const wordmarkStrong = document.createElement("strong");
    wordmarkStrong.textContent = "Paramount";
    wordmark.appendChild(wordmarkStrong);
    const tagline = document.createElement("p");
    tagline.textContent = "A Skydance Corporation";
    const cells = [];
    slideImages.forEach((img, index) => {
      if (index === 0) {
        cells.push([img, [bgHeading, wordmark, tagline]]);
      } else {
        cells.push([img, ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-brand.js
  function parse2(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(".hm-brand-grid"));
    if (tiles.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const poster = tile.querySelector(".hm-brand-tile-img img, .hm-brand-tile-img");
      const contentCell = [];
      const logo = tile.querySelector(".hm-brand-tile-hicon img, .hm-brand-tile-mb-logo img");
      if (logo) contentCell.push(logo);
      const description = tile.querySelector(".hm-brand-tile-txt");
      if (description) contentCell.push(description);
      const ctaSource = tile.querySelector(".tile-hover-icon a[href], .hm-brand-tile-mb-overlay > a[href]");
      if (ctaSource) {
        const href = ctaSource.getAttribute("href");
        const srLabel = tile.querySelector(".hm-brand-tile-mb-overlay .visually-hidden");
        let label = srLabel ? srLabel.textContent.trim() : "";
        if (!label && href) {
          const slug = href.split("/").filter(Boolean).pop() || "";
          label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        }
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = label || "Learn More";
        contentCell.push(cta);
      }
      cells.push([poster || "", contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-brand", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-culture.js
  function parse3(element, { document }) {
    const contentCell = [];
    const headings = Array.from(element.querySelectorAll(".culture-left-block .text-section h1, .culture-left-block .text-section h2, .text-section h1, .text-section h2"));
    headings.forEach((h) => contentCell.push(h));
    const ctaSource = element.querySelector(".join-us-btn-wrapper a[href], a.primary-btn[href]");
    if (ctaSource) {
      const labelSpan = ctaSource.querySelector("span");
      const label = (labelSpan ? labelSpan.textContent : ctaSource.textContent).trim();
      const cta = document.createElement("a");
      cta.setAttribute("href", ctaSource.getAttribute("href"));
      cta.textContent = label || "Join Us";
      contentCell.push(cta);
    }
    const image = element.querySelector(".culture-right-image img.d-lg-block, .culture-right-image img, .culture-slider .slide img");
    if (contentCell.length === 0 && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([contentCell, image || ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-culture", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/paramount-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#ot-sdk-btn",
        ".ot-sdk-show-settings"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "code.self_link_icon",
        "code.coh-inline-element"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".visually-hidden"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".siteHeader",
        "footer",
        ".footer-wrapper",
        "nav"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".skip-link",
        "#drupal-live-announce"
      ]);
      WebImporter.DOMUtils.remove(element, [
        'img[src*="t.co/"]',
        'img[src*="analytics.twitter.com"]',
        'img[src*="demdex.net"]',
        'img[src*="doubleclick.net"]',
        "iframe",
        "noscript",
        "link",
        "source"
      ]);
    }
  }

  // tools/importer/transformers/paramount-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const target = element.querySelector(section.selector);
      if (!target) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        target.after(metadataBlock);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        target.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Paramount corporate homepage: full-bleed hero slider, featured brands grid, and a culture/careers section. Header and footer are auto-populated.",
    urls: [
      "https://www.paramount.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".hero-header-transparent.wrapper-hero-slider"]
      },
      {
        name: "cards-brand",
        instances: [".wrapper-hm-brand .hm-brand-grid-container"]
      },
      {
        name: "columns-culture",
        instances: [".culture-section .culture-sec-content"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Slider",
        selector: "main #block-paramount-content article .hero-header-transparent",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2-brands",
        name: "Brands Grid",
        selector: "main #block-paramount-content article .wrapper-hm-brand",
        style: "brand-blue",
        blocks: ["cards-brand"],
        defaultContent: [
          ".wrapper-hm-brand .hm-brand-header",
          ".wrapper-hm-brand .brands-btn"
        ]
      },
      {
        id: "section-3-culture",
        name: "Culture / Shape the Future",
        selector: "main #block-paramount-content article .culture-section",
        style: "vista-navy",
        blocks: ["columns-culture"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "cards-brand": parse2,
    "columns-culture": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let pathname = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      if (!pathname || pathname === "") {
        pathname = "/index";
      }
      const path = WebImporter.FileUtils.sanitizePath(pathname);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
