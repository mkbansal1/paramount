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

  // tools/importer/import-legal-terms.js
  var import_legal_terms_exports = {};
  __export(import_legal_terms_exports, {
    default: () => import_legal_terms_default
  });

  // tools/importer/parsers/legal-hero.js
  function parse(element, { document }) {
    const titleContainer = element.querySelector(".header-text-container, .header-text") || element;
    const titleEl = Array.from(titleContainer.querySelectorAll("h1, h2, h3, h4, h5, h6")).find((h) => !h.classList.contains("visually-hidden") && (h.textContent || "").trim());
    const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
    if (!titleText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const h1 = document.createElement("h1");
    h1.textContent = titleText;
    const out = [];
    out.push(WebImporter.Blocks.createBlock(document, {
      name: "hero-page",
      cells: [
        [[h1]],
        [""]
      ]
    }));
    out.push(WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: { style: "vista-navy" }
    }));
    out.push(document.createElement("hr"));
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

  // tools/importer/import-legal-terms.js
  var PAGE_TEMPLATE = {
    name: "legal-terms",
    description: "Long-form legal/policy document: a navy title band (white h1) followed by a single-column dense rich-text body. The legal-hero parser owns the banner/body section break, so the sections transformer is not used.",
    urls: [
      "https://www.paramount.com/cbs-research-survey-terms-of-use"
    ],
    blocks: [
      {
        name: "legal-hero",
        instances: [".header-text-container"]
      },
      {
        name: "offer-table",
        instances: [".content-table-wrapper"]
      }
    ]
  };
  var parsers = {
    "legal-hero": parse,
    "offer-table": parse2
  };
  var transformers = [
    transform
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
            element
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_legal_terms_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      const main = document.body;
      const dateP = document.querySelector("p.text-align-right");
      if (dateP && /^\s*(as of|effective|last updated|last revised|updated)/i.test(dateP.textContent || "")) {
        const cellEl = document.createElement("p");
        while (dateP.firstChild) cellEl.append(dateP.firstChild);
        const block = WebImporter.Blocks.createBlock(document, {
          name: "legal-date",
          cells: [[cellEl]]
        });
        dateP.replaceWith(block);
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
        const row = document.createElement("tr");
        const k = document.createElement("td");
        k.textContent = "template";
        const v = document.createElement("td");
        v.textContent = PAGE_TEMPLATE.name;
        row.append(k, v);
        body.append(row);
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
  return __toCommonJS(import_legal_terms_exports);
})();
