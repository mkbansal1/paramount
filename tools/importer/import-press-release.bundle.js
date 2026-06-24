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

  // tools/importer/import-press-release.js
  var import_press_release_exports = {};
  __export(import_press_release_exports, {
    default: () => import_press_release_default
  });

  // tools/importer/parsers/press-hero.js
  var MEDIA_HOST = "https://www.paramount.com";
  function absolutize(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return MEDIA_HOST + (src.startsWith("/") ? src : `/${src}`);
  }
  function parse(element, { document }) {
    const titleContainer = element.querySelector(".header-text-container, .header-text") || element;
    const eyebrowEl = titleContainer.querySelector("p.eyebrow-text, .eyebrow-text");
    const eyebrowText = eyebrowEl ? (eyebrowEl.textContent || "").trim() : "";
    const titleEl = titleContainer.querySelector("h1, h2, h3, h4, h5, h6");
    const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
    let bannerImg = null;
    const imgEl = element.querySelector(".header-media-image img, .header-media img");
    const imgSrc = imgEl ? imgEl.getAttribute("src") || "" : "";
    if (imgSrc) {
      bannerImg = document.createElement("img");
      bannerImg.setAttribute("src", absolutize(imgSrc));
      bannerImg.setAttribute("alt", imgEl.getAttribute("alt") || titleText || "");
    }
    if (!eyebrowText && !titleText && !bannerImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (eyebrowText) {
      const eyebrow = document.createElement("p");
      eyebrow.textContent = eyebrowText;
      contentCell.push(eyebrow);
    }
    if (titleText) {
      const h1 = document.createElement("h1");
      h1.textContent = titleText;
      contentCell.push(h1);
    }
    const out = [];
    out.push(WebImporter.Blocks.createBlock(document, {
      name: "hero-page",
      cells: [
        [contentCell.length ? contentCell : ""],
        [bannerImg || ""]
      ]
    }));
    out.push(WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: { style: "vista-navy" }
    }));
    element.replaceWith(...out);
  }

  // tools/importer/parsers/offer-table.js
  function cellText(cell) {
    const clone = cell.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    clone.querySelectorAll("p, div").forEach((b) => {
      if (b.nextSibling) b.append(" ");
    });
    return (clone.textContent || "").replace(/\s+/g, " ").trim().replace(/\|/g, "/");
  }
  function isFootnoteTable(rows) {
    if (!rows.length) return false;
    const firstText = (rows[0].textContent || "").trim();
    if (/^_+$/.test(firstText)) return true;
    const contentful = rows.filter((tr) => (tr.textContent || "").trim());
    if (!contentful.length) return false;
    return contentful.every((tr) => {
      var _a;
      const cells = Array.from(tr.children).filter((c) => (c.textContent || "").trim());
      if (cells.length > 2) return false;
      const lead = (((_a = cells[0]) == null ? void 0 : _a.textContent) || "").trim();
      return /^[_*]+$/.test(lead) || /^\(?\d{1,2}\)?[.)]?$/.test(lead);
    });
  }
  function parse2(element, { document }) {
    const srcTable = element.querySelector("table");
    if (!srcTable) {
      element.remove();
      return;
    }
    const rows = Array.from(srcTable.querySelectorAll("tr"));
    if (!rows.length) {
      element.remove();
      return;
    }
    if (isFootnoteTable(rows)) {
      const out = [];
      rows.forEach((tr) => {
        const txt = Array.from(tr.children).map((c) => cellText(c)).filter(Boolean).join(" ").trim();
        if (txt && !/^_+$/.test(txt)) {
          const p = document.createElement("p");
          p.textContent = txt;
          out.push(p);
        }
      });
      if (out.length) element.replaceWith(...out);
      else element.remove();
      return;
    }
    const dataRows = rows.map((tr) => Array.from(tr.children).map((cell) => {
      const div = document.createElement("div");
      div.textContent = cellText(cell);
      return div;
    }));
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Table",
      cells: dataRows
    });
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
      WebImporter.DOMUtils.remove(element, [
        // live (www.paramount.com) selectors
        ".wrapper-related-news",
        ".wrapper-more-news",
        ".related-news",
        ".wrapper-pressRelease-cl",
        ".wrapper-related-press-cl",
        ".wrapper-more-press",
        ".cl-pressRelease-list",
        // archived-snapshot selectors
        ".wrapper-morePress",
        ".newsPressRelease-list"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".awards-tab-list",
        ".awards-filter-dropdown",
        ".awards-filter-tab",
        ".awards-view-mobile",
        ".js-pager__items",
        ".load-more-view-award-filter",
        ".awards-filter-apply",
        ".coh-apply-filters",
        ".views-exposed-form",
        ".bef-exposed-form",
        ".awards-filter-btn"
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

  // tools/importer/import-press-release.js
  var PAGE_TEMPLATE = {
    name: "press-release",
    description: 'Corporate press release: a navy press banner (eyebrow + title), an optional byline, and a single-column rich-text body. The auto-generated "More Press" related list is template chrome and is dropped.',
    urls: [
      "https://www.paramount.com/press/paramount-global-reports-first-quarter-2025-earnings-results"
    ],
    blocks: [
      {
        name: "press-hero",
        instances: [".press-release-banner-wrapper"]
      },
      {
        name: "offer-table",
        instances: [".content-table-wrapper"]
      }
    ],
    sections: [
      {
        id: "section-1-press-banner",
        name: "Press release banner",
        selector: ".press-release-banner-wrapper",
        style: null,
        blocks: ["press-hero"],
        defaultContent: []
      },
      {
        id: "section-2-body",
        name: "Press release body",
        selector: ".wrapper-press-release-template",
        style: null,
        blocks: [],
        defaultContent: [".wrapper-press-release-template .press-release-container"]
      }
    ]
  };
  var parsers = {
    "press-hero": parse,
    "offer-table": parse2
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
  var import_press_release_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      let pressDateISO = "";
      const chrons = Array.from(document.querySelectorAll(".xn-chron"));
      for (let i = 0; i < chrons.length; i += 1) {
        const d = new Date((chrons[i].textContent || "").trim());
        if (!Number.isNaN(d.getTime())) {
          pressDateISO = d.toISOString().slice(0, 10);
          break;
        }
      }
      if (!pressDateISO) {
        const bodyEl = document.querySelector(".press-template-content, .press-release-container, .wrapper-press-release-template");
        const bodyText = bodyEl ? bodyEl.textContent || "" : "";
        const m = bodyText.match(/\b([A-Z][a-z]+\.?\s+\d{1,2},\s+\d{4})\b/);
        if (m) {
          const d = new Date(m[1].replace(".", ""));
          if (!Number.isNaN(d.getTime())) pressDateISO = d.toISOString().slice(0, 10);
        }
      }
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
      const metaTable = Array.from(main.querySelectorAll("table")).find((t) => {
        const h = t.querySelector("tr th, tr td");
        return h && (h.textContent || "").trim().toLowerCase() === "metadata";
      });
      if (metaTable) {
        const body = metaTable.querySelector("tbody") || metaTable;
        const addRow = (key, val) => {
          if (!val) return;
          const row = document.createElement("tr");
          const k = document.createElement("td");
          k.textContent = key;
          const v = document.createElement("td");
          v.textContent = val;
          row.append(k, v);
          body.append(row);
        };
        addRow("template", PAGE_TEMPLATE.name);
        addRow("press-date", pressDateISO);
      }
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
  return __toCommonJS(import_press_release_exports);
})();
