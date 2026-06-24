var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-news-article.js
  var import_news_article_exports = {};
  __export(import_news_article_exports, {
    default: () => import_news_article_default
  });

  // tools/importer/parsers/news-hero.js
  var MEDIA_HOST = "https://www.paramount.com";
  function absolutize(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return MEDIA_HOST + (src.startsWith("/") ? src : `/${src}`);
  }
  function parse(element, { document }) {
    const imgEl = element.querySelector("img#article-header-left-right") || Array.from(element.querySelectorAll(".news-banner-image img, img")).find((img) => !/d-md-none|news-banner-m-img/.test(img.className)) || element.querySelector("img#article-header-top") || element.querySelector("img");
    let bannerImg = null;
    if (imgEl) {
      bannerImg = document.createElement("img");
      bannerImg.setAttribute("src", absolutize(imgEl.getAttribute("src")));
      bannerImg.setAttribute("alt", imgEl.getAttribute("alt") || "");
    }
    const contentCell = [];
    const date = element.querySelector(".news-date");
    const topic = element.querySelector(".news-topic");
    const eyebrowParts = [date, topic].map((n) => n && (n.textContent || "").trim() || "").filter(Boolean);
    if (eyebrowParts.length) {
      const p = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = eyebrowParts.join(" \u2022 ");
      p.append(em);
      contentCell.push(p);
    }
    const titleEl = element.querySelector(".news-banner-text h5, .news-banner-text-content h5, h5.coh-heading, h1, h2, h3");
    const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
    if (titleText) {
      const h1 = document.createElement("h1");
      h1.textContent = titleText;
      contentCell.push(h1);
    }
    const introEl = element.querySelector(".news-banner-body p, .news-banner-body");
    const introText = introEl ? (introEl.textContent || "").trim() : "";
    if (introText) {
      const p = document.createElement("p");
      p.textContent = introText;
      contentCell.push(p);
    }
    if (!bannerImg && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const heroBlock = WebImporter.Blocks.createBlock(document, {
      name: "news-hero",
      cells: [
        [bannerImg || ""],
        [contentCell.length ? contentCell : ""]
      ]
    });
    element.replaceWith(heroBlock);
  }

  // tools/importer/parsers/news-video.js
  function parse2(element, { document }) {
    const src = element.getAttribute("src") || "";
    let href = src;
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/);
    if (m) {
      href = `https://www.youtube.com/watch?v=${m[1]}`;
    } else if (/^\/\//.test(src)) {
      href = `https:${src}`;
    }
    if (!href) {
      element.remove();
      return;
    }
    const link = document.createElement("a");
    link.setAttribute("href", href);
    link.textContent = href;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "video",
      cells: [[link]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  function parse3(element, { document }) {
    const headingEl = element.querySelector(".fullWidth-quote-container h5, h5.coh-heading, h5, h4, h3, p");
    const raw = headingEl ? (headingEl.textContent || "").replace(/\s+/g, " ").trim() : "";
    if (!raw) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let quoteText = raw;
    let attribution = "";
    const m = raw.match(/^(.*[”"'’])\s*[-–—]\s*(.+)$/);
    if (m) {
      quoteText = m[1].trim();
      attribution = m[2].trim();
    }
    const blockquote = document.createElement("blockquote");
    const p = document.createElement("p");
    p.textContent = quoteText;
    blockquote.append(p);
    if (attribution) {
      const cite = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = `\u2014 ${attribution}`;
      cite.append(em);
      blockquote.append(cite);
    }
    element.replaceWith(blockquote);
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
      Array.from(element.querySelectorAll("code")).forEach((node) => {
        if (!(node.textContent || "").trim()) node.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        ".visually-hidden"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".leadership-division"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".pagination-container",
        ".pagination-control",
        ".pagination_count_text",
        ".pagination_prev_arrow",
        ".pagination_next_arrow"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".slick-cloned",
        ".slick-dots",
        ".slick-arrow",
        ".slick-prev",
        ".slick-next",
        ".timelineCarousel-image-slider"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".metadata-share-container",
        ".share-menu-container",
        ".meta-share-btn",
        ".metaHeaderMobile"
      ]);
      Array.from(element.querySelectorAll(".section-heading")).forEach((node) => {
        const text = (node.textContent || "").trim();
        if (!text) return;
        const h2 = element.ownerDocument.createElement("h2");
        h2.textContent = text;
        node.replaceWith(h2);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".siteHeader",
        "footer",
        ".footer-wrapper",
        "nav.navbar",
        "nav.fixed-top",
        'nav[aria-label="Primary"]'
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
      element.querySelectorAll('a[href*="cms.paramount.com"], [src*="cms.paramount.com"]').forEach((node) => {
        ["href", "src"].forEach((attr) => {
          const v = node.getAttribute(attr);
          if (v && v.includes("cms.paramount.com")) {
            node.setAttribute(attr, v.replace(/cms\.paramount\.com/g, "www.paramount.com"));
          }
        });
      });
      Array.from(element.querySelectorAll("p, h1, h2, h3, h4, h5, h6")).forEach((node) => {
        if (!(node.textContent || "").trim() && !node.querySelector("img, picture, iframe, video, a[href]")) {
          node.remove();
        }
      });
      Array.from(element.querySelectorAll("a")).forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        const dead = !href || href === "#" || href.startsWith("javascript:");
        if (!dead) return;
        const hasContent = (a.textContent || "").trim() || a.querySelector("img, picture");
        if (hasContent) {
          a.replaceWith(...a.childNodes);
        } else {
          a.remove();
        }
      });
    }
  }

  // tools/importer/transformers/paramount-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function firstUnused(element, selector, used) {
    if (!selector) return null;
    const matches = element.querySelectorAll(selector);
    for (let i = 0; i < matches.length; i += 1) {
      if (!used.has(matches[i])) return matches[i];
    }
    return null;
  }
  function blockTableName(blockName) {
    return blockName.split("-").map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");
  }
  function findBlockTables(element, blockName, used) {
    const wanted = blockTableName(blockName).toLowerCase();
    const out = [];
    element.querySelectorAll("table").forEach((table) => {
      if (used.has(table)) return;
      const header = table.querySelector("tr th, tr td");
      const label = header ? (header.textContent || "").trim().toLowerCase() : "";
      if (label === wanted || label.startsWith(`${wanted} `) || label.startsWith(`${wanted}(`)) {
        out.push(table);
      }
    });
    return out;
  }
  function findSectionAnchor(element, section, used) {
    const bySelector = firstUnused(element, section.selector, used);
    if (bySelector) return bySelector;
    const firstBlock = Array.isArray(section.blocks) && section.blocks.length ? section.blocks[0] : null;
    if (firstBlock) {
      const byBlock = firstUnused(element, `.${firstBlock}`, used);
      if (byBlock) return byBlock;
      const tables = findBlockTables(element, firstBlock, used);
      if (tables.length) return tables[0];
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    const used = /* @__PURE__ */ new Set();
    const resolved = [];
    sections.forEach((section) => {
      if (section.repeat) {
        let matches = section.selector ? Array.from(element.querySelectorAll(section.selector)) : [];
        if (matches.length === 0) {
          const firstBlock = Array.isArray(section.blocks) && section.blocks.length ? section.blocks[0] : null;
          if (firstBlock) {
            matches = Array.from(element.querySelectorAll(`.${firstBlock}`));
            if (matches.length === 0) matches = findBlockTables(element, firstBlock, used);
          }
        }
        matches.forEach((match) => {
          if (used.has(match)) return;
          used.add(match);
          resolved.push({ section, target: match });
        });
        return;
      }
      const target = findSectionAnchor(element, section, used);
      if (target) used.add(target);
      resolved.push({ section, target });
    });
    resolved.sort((a, b) => {
      if (!a.target || !b.target) return 0;
      const pos = a.target.compareDocumentPosition(b.target);
      if (pos & 2) return 1;
      if (pos & 4) return -1;
      return 0;
    });
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, target } = resolved[i];
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

  // tools/importer/import-news-article.js
  var PAGE_TEMPLATE = {
    name: "news-article",
    description: "Editorial news article: a news banner hero (date/topic eyebrow + title + intro + lead image), an optional byline, then a single-column rich-text body with inline images, optional full-width pull quotes, and optional YouTube video embeds.",
    urls: [
      "https://www.paramount.com/news/inside-the-top-gun-archive-with-charlotte-barker-and-chuck-woodfill"
    ],
    blocks: [
      {
        name: "news-hero",
        instances: [".wrapper-news-banner"]
      },
      {
        name: "news-video",
        instances: ['iframe[src*="youtube"]']
      },
      {
        name: "quote",
        instances: [".wrapper-fullWidth-quote"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "News banner hero",
        selector: ".wrapper-news-banner",
        style: null,
        blocks: ["news-hero"],
        defaultContent: []
      },
      {
        id: "section-2-body",
        name: "Article body",
        selector: ".wrapper-rte-block",
        style: null,
        blocks: [],
        defaultContent: [".wrapper-rte-block"]
      }
    ]
  };
  var parsers = {
    "news-hero": parse,
    "news-video": parse2,
    quote: parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = {
      ...payload,
      template: PAGE_TEMPLATE
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_news_article_default = {
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
  return __toCommonJS(import_news_article_exports);
})();
