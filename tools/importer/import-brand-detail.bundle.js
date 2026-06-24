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

  // tools/importer/import-brand-detail.js
  var import_brand_detail_exports = {};
  __export(import_brand_detail_exports, {
    default: () => import_brand_detail_default
  });

  // tools/importer/parsers/brand-hero.js
  var VIDEO_HOST = "https://www.paramount.com";
  function absolutize(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return VIDEO_HOST + (src.startsWith("/") ? src : `/${src}`);
  }
  function parse(element, { document }) {
    const title = element.querySelector(".header-text-container h1, h1.coh-heading, h1");
    let videoSrc = "";
    const desktopSource = element.querySelector(
      "video.heroMediaVid-video-desktop source[src], .heroMediaVid-video-desktop source[src]"
    );
    if (desktopSource) {
      videoSrc = desktopSource.getAttribute("src") || "";
    }
    if (!videoSrc) {
      const anyMp4 = Array.from(element.querySelectorAll("video source[src]")).map((s) => s.getAttribute("src") || "").find((s) => /\.mp4(\?|$)/i.test(s));
      if (anyMp4) videoSrc = anyMp4;
    }
    let bannerImg = null;
    if (!videoSrc) {
      const candidates = Array.from(element.querySelectorAll("img.desktop-image, .header-media img, img")).filter((img) => {
        const src2 = img.getAttribute("src") || "";
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(src2) && !/mobile/i.test(img.className);
      });
      const src = candidates.length ? candidates[0].getAttribute("src") || "" : "";
      if (src) {
        bannerImg = document.createElement("img");
        bannerImg.setAttribute("src", absolutize(src));
        bannerImg.setAttribute("alt", title ? (title.textContent || "").trim() : "");
      }
    }
    const breadcrumbOl = element.querySelector("ol.breadcrumb");
    let breadcrumbBlock = null;
    if (breadcrumbOl) {
      const items = Array.from(breadcrumbOl.querySelectorAll(":scope > li"));
      const cell = [];
      items.forEach((li) => {
        const link = li.querySelector("a[href]");
        const p = document.createElement("p");
        if (link) {
          const text = (link.textContent || "").trim();
          if (!text) return;
          const a = document.createElement("a");
          a.setAttribute("href", link.getAttribute("href"));
          a.textContent = text;
          p.append(a);
        } else {
          const text = (li.textContent || "").trim();
          if (!text) return;
          p.textContent = text;
        }
        cell.push(p);
      });
      if (cell.length) {
        breadcrumbBlock = WebImporter.Blocks.createBlock(document, {
          name: "breadcrumb",
          cells: [[cell]]
        });
      }
    }
    if (!title && !videoSrc && !bannerImg && !breadcrumbBlock) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const out = [];
    if (breadcrumbBlock) {
      out.push(breadcrumbBlock);
    }
    if (videoSrc) {
      const videoLink = document.createElement("a");
      const href = absolutize(videoSrc);
      videoLink.setAttribute("href", href);
      videoLink.textContent = href;
      const videoBlock = WebImporter.Blocks.createBlock(document, {
        name: "video (autoplay)",
        cells: [[videoLink]]
      });
      out.push(videoBlock);
    }
    const contentCell = [];
    if (title) {
      const h1 = document.createElement("h1");
      h1.textContent = (title.textContent || "").trim();
      contentCell.push(h1);
    }
    if (bannerImg) {
      contentCell.push(bannerImg);
    }
    const heroBlock = WebImporter.Blocks.createBlock(document, {
      name: "brand-hero",
      cells: [[contentCell]]
    });
    out.push(heroBlock);
    element.replaceWith(...out);
  }

  // tools/importer/parsers/columns-info.js
  function parse2(element, { document }) {
    const leftCell = [];
    const heading = element.querySelector(".content-desc-content h4, .content-desc-content h1, .content-desc-content h2, .content-desc-content h3");
    if (heading) leftCell.push(heading);
    const desc = element.querySelector(".content-desc-txt p, .content-desc-txt");
    if (desc) leftCell.push(desc);
    const rightCell = [];
    const eyebrow = element.querySelector(".content-desc-links .eyebrow-text span, .content-desc-links .eyebrow-text");
    if (eyebrow && (eyebrow.textContent || "").trim()) {
      const label = document.createElement("p");
      label.textContent = (eyebrow.textContent || "").trim();
      rightCell.push(label);
    }
    const linkAnchors = Array.from(element.querySelectorAll(".content-links-list a[href]"));
    if (linkAnchors.length) {
      const ul = document.createElement("ul");
      linkAnchors.forEach((a) => {
        const text = (a.textContent || "").trim();
        if (!text) return;
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = text;
        li.append(link);
        ul.append(li);
      });
      if (ul.children.length) rightCell.push(ul);
    }
    if (leftCell.length === 0 && rightCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[
      leftCell.length ? leftCell : "",
      rightCell.length ? rightCell : ""
    ]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-info", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-show.js
  function parse3(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(":scope > .brand-tile-slide, .brand-tile-slide"));
    if (tiles.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const poster = tile.querySelector('img.coh-image, .coh-image, img:not([src^="data:"])');
      const titleEl = tile.querySelector(".brand-tile-details h6, .brand-tile-details .coh-heading, h6.coh-heading, h6");
      const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
      const contentCell = [];
      if (titleText && href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = titleText;
        contentCell.push(a);
      } else if (titleText) {
        contentCell.push(document.createTextNode(titleText));
      } else if (href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = href;
        contentCell.push(a);
      }
      if (!poster && contentCell.length === 0) return;
      cells.push([poster || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-show", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-brand.js
  function parse4(element, { document }) {
    const labelFromHref = (href) => {
      if (!href) return "";
      const slug = href.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "";
      return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };
    const cells = [];
    const relatedTiles = Array.from(element.querySelectorAll(".related-brand-item"));
    if (relatedTiles.length > 0) {
      relatedTiles.forEach((tile) => {
        const link = tile.querySelector("a.related-brand-container[href], a[href]");
        const href = link ? link.getAttribute("href") : "";
        const poster = tile.querySelector('a > img.coh-image, img.coh-image, img:not([src^="data:"])');
        const contentCell = [];
        const logo = tile.querySelector(".related-brand-logo img");
        const brandName = labelFromHref(href);
        if (logo) {
          if (brandName && !logo.getAttribute("alt")) logo.setAttribute("alt", brandName);
          contentCell.push(logo);
        } else if (brandName) {
          const h = document.createElement("h3");
          h.textContent = brandName;
          contentCell.push(h);
        }
        if (href) {
          const cta = document.createElement("a");
          cta.setAttribute("href", href);
          cta.textContent = brandName || "Learn More";
          contentCell.push(cta);
        }
        if (!poster && contentCell.length === 0) return;
        cells.push([poster || "", contentCell.length ? contentCell : ""]);
      });
    } else {
      const tiles = Array.from(element.querySelectorAll(".hm-brand-grid"));
      if (tiles.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
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
          if (!label && href) label = labelFromHref(href);
          const cta = document.createElement("a");
          cta.setAttribute("href", href);
          cta.textContent = label || "Learn More";
          contentCell.push(cta);
        }
        cells.push([poster || "", contentCell]);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-brand", cells });
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
      WebImporter.DOMUtils.remove(element, [
        ".pagination-container",
        ".pagination-control",
        ".pagination_count_text",
        ".pagination_prev_arrow",
        ".pagination_next_arrow"
      ]);
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
    }
  }

  // tools/importer/transformers/paramount-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findSectionAnchor(element, section) {
    if (section.selector) {
      const bySelector = element.querySelector(section.selector);
      if (bySelector) return bySelector;
    }
    const firstBlock = Array.isArray(section.blocks) && section.blocks.length ? section.blocks[0] : null;
    if (firstBlock) {
      const byBlock = element.querySelector(`.${firstBlock}`);
      if (byBlock) return byBlock;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const target = findSectionAnchor(element, section);
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

  // tools/importer/import-brand-detail.js
  var PAGE_TEMPLATE = {
    name: "brand-detail",
    description: "Brand detail page: breadcrumb + full-bleed brand hero, a two-column description + links section, a related-content card grid, and a related-brands card grid with a View All button.",
    urls: [
      "https://www.paramount.com/about/brands/mtv"
    ],
    blocks: [
      {
        name: "brand-hero",
        instances: [".podcast-header-wrapper"]
      },
      {
        name: "columns-info",
        instances: [".wrapper-content-desc .container .row.g-0", ".wrapper-content-desc .row"]
      },
      {
        name: "cards-show",
        instances: [".wrapper-brand-tile .brand-tile-slider"]
      },
      {
        name: "cards-brand",
        instances: [".wrapper-related-brand .related-brand"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Brand hero",
        selector: ".podcast-header-wrapper.header-with-video",
        style: null,
        blocks: ["brand-hero"],
        defaultContent: []
      },
      {
        id: "section-2-desc",
        name: "Brand description + links",
        selector: ".wrapper-content-desc",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-3-related-content",
        name: "Related content",
        selector: ".wrapper-brand-tile",
        style: null,
        blocks: ["cards-show"],
        defaultContent: [".wrapper-brand-tile .coh-heading"]
      },
      {
        id: "section-4-related-brands",
        name: "Related brands",
        selector: ".wrapper-related-brand",
        style: null,
        blocks: ["cards-brand"],
        defaultContent: [".wrapper-related-brand .coh-heading", ".wrapper-related-brand .related-brand-btn"]
      }
    ]
  };
  var parsers = {
    "brand-hero": parse,
    "columns-info": parse2,
    "cards-show": parse3,
    "cards-brand": parse4
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
  var import_brand_detail_default = {
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
  return __toCommonJS(import_brand_detail_exports);
})();
