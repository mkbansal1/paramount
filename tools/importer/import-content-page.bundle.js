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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
  });

  // tools/importer/parsers/hero-page.js
  var MEDIA_HOST = "https://www.paramount.com";
  function absolutize(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return MEDIA_HOST + (src.startsWith("/") ? src : `/${src}`);
  }
  function parse(element, { document }) {
    const breadcrumbOl = element.querySelector("ol.breadcrumb");
    let breadcrumbBlock = null;
    if (breadcrumbOl) {
      const items = Array.from(breadcrumbOl.querySelectorAll(":scope > li, li.breadcrumb-item"));
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
          const span = li.querySelector(".breadcrumb-last, span") || li;
          const text = (span.textContent || "").trim();
          if (!text) return;
          p.textContent = text;
        }
        if (p.childNodes.length || p.textContent) cell.push(p);
      });
      if (cell.length) {
        breadcrumbBlock = WebImporter.Blocks.createBlock(document, {
          name: "breadcrumb",
          cells: [[cell]]
        });
      }
    }
    const eyebrowEl = element.querySelector(".header-text-container .eyebrow-text, .header-text .eyebrow-text, p.eyebrow-text");
    const eyebrowText = eyebrowEl ? (eyebrowEl.textContent || "").trim() : "";
    const titleContainer = element.querySelector(".header-text-container, .header-text, .hero-sec-content, .hero-text-container") || element;
    const titleHeadings = Array.from(titleContainer.querySelectorAll("h1, h2, h3")).filter((h) => !h.closest("ol.breadcrumb") && (h.textContent || "").trim());
    const titleText = titleHeadings.length ? titleHeadings.map((h) => (h.textContent || "").trim()).join(" ") : "";
    let videoSrc = "";
    const desktopSource = element.querySelector(
      "video.heroMediaVid-video-desktop source[src], .heroMediaVid-video-desktop source[src]"
    );
    if (desktopSource) videoSrc = desktopSource.getAttribute("src") || "";
    if (!videoSrc) {
      const anyMp4 = Array.from(element.querySelectorAll("video source[src]")).map((s) => s.getAttribute("src") || "").find((s) => /\.mp4(\?|$)/i.test(s));
      if (anyMp4) videoSrc = anyMp4;
    }
    let bannerImg = null;
    if (!videoSrc) {
      const candidate = Array.from(element.querySelectorAll("img.desktop-image, .header-media img, .header-image img, img")).find((img) => {
        const src2 = img.getAttribute("src") || "";
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(src2) && !/mobile/i.test(img.className);
      });
      const src = candidate ? candidate.getAttribute("src") || "" : "";
      if (src) {
        bannerImg = document.createElement("img");
        bannerImg.setAttribute("src", absolutize(src));
        bannerImg.setAttribute("alt", titleText || "");
      }
    }
    if (!breadcrumbBlock && !titleText && !eyebrowText && !videoSrc && !bannerImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const out = [];
    if (breadcrumbBlock) out.push(breadcrumbBlock);
    if (videoSrc) {
      const href = absolutize(videoSrc);
      const videoLink = document.createElement("a");
      videoLink.setAttribute("href", href);
      videoLink.textContent = href;
      out.push(WebImporter.Blocks.createBlock(document, {
        name: "video (autoplay)",
        cells: [[videoLink]]
      }));
    }
    const contentCell = [];
    if (eyebrowText) {
      const eyebrow = document.createElement("p");
      eyebrow.textContent = eyebrowText;
      contentCell.push(eyebrow);
    }
    if (titleHeadings.length) {
      titleHeadings.forEach((h, i) => {
        const el = document.createElement(i === 0 ? "h1" : "h2");
        el.textContent = (h.textContent || "").trim();
        contentCell.push(el);
      });
    } else if (titleText) {
      const h1 = document.createElement("h1");
      h1.textContent = titleText;
      contentCell.push(h1);
    }
    const heroBlock = WebImporter.Blocks.createBlock(document, {
      name: "hero-page",
      cells: [
        [contentCell.length ? contentCell : ""],
        [bannerImg || ""]
      ]
    });
    out.push(heroBlock);
    if (!videoSrc) {
      out.push(WebImporter.Blocks.createBlock(document, {
        name: "Section Metadata",
        cells: { style: "vista-navy" }
      }));
    }
    element.replaceWith(...out);
  }

  // tools/importer/parsers/cards-people.js
  function parse2(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(":scope li.leadership-tile-slide, li.leadership-tile-slide"));
    if (tiles.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const img = tile.querySelector("img.desktop-image") || tile.querySelector("img.coh-image:not(.mobile-image)") || tile.querySelector('img:not([src^="data:"])');
      const nameEl = tile.querySelector(".leadership-tile-details h6, .leadership-tile-details .coh-heading, h6.coh-heading, h6");
      const nameText = nameEl ? (nameEl.textContent || "").trim() : "";
      const roleEl = tile.querySelector(".leadership-tile-desc, .eyebrow-text, .leadership-tile-designation, .designation");
      const roleText = roleEl ? (roleEl.textContent || "").trim() : "";
      const contentCell = [];
      if (nameText) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = nameText;
          h3.append(a);
        } else {
          h3.textContent = nameText;
        }
        contentCell.push(h3);
      } else if (href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = href;
        contentCell.push(a);
      }
      if (roleText) {
        const role = document.createElement("p");
        role.textContent = roleText;
        contentCell.push(role);
      }
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-people", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-info.js
  function parse3(element, { document }) {
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
  function parse4(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(":scope > .brand-tile-slide, .brand-tile-slide"));
    let carousel = false;
    if (tiles.length === 0) {
      tiles = Array.from(element.querySelectorAll(".slick-slide:not(.slick-cloned) .carousel-tile-item"));
      if (tiles.length === 0) tiles = Array.from(element.querySelectorAll(".carousel-tile-item"));
      carousel = tiles.length > 0;
    }
    if (tiles.length === 0) {
      tiles = Array.from(element.querySelectorAll(":scope > li, li.coh-list-item"));
    }
    if (tiles.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const seenHrefs = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      if (carousel && href) {
        if (seenHrefs.has(href)) return;
        seenHrefs.add(href);
      }
      const poster = tile.querySelector('img.coh-image, .coh-image, img:not([src^="data:"])');
      const titleEl = tile.querySelector(".brand-tile-details h6, .brand-tile-details .coh-heading, .title-wrapper, .card-tile-title, h6.coh-heading, h6");
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

  // tools/importer/parsers/stats.js
  function parse5(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > li, li"));
    const cells = [];
    items.forEach((li) => {
      const valueEl = li.querySelector(".data-number");
      const descEl = li.querySelector(".data-desc");
      const valueText = valueEl ? (valueEl.textContent || "").trim() : "";
      const descText = descEl ? (descEl.textContent || "").trim() : "";
      if (!valueText && !descText) return;
      const valueCell = [];
      if (valueText) {
        const strong = document.createElement("strong");
        strong.textContent = valueText;
        valueCell.push(strong);
      }
      cells.push([valueCell.length ? valueCell : "", descText || ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse6(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > li, li"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(".bg-overlay-inner"));
    }
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const awardEyebrow = li.querySelector(".filter-item-txt-container .eyebrow-text");
      const awardName = li.querySelector(".awards-filter-txt");
      if (awardName && (awardName.textContent || "").trim()) {
        const cell2 = [];
        const eyebrowText = awardEyebrow ? (awardEyebrow.textContent || "").trim() : "";
        if (eyebrowText) {
          const p = document.createElement("p");
          const em = document.createElement("em");
          em.textContent = eyebrowText;
          p.append(em);
          cell2.push(p);
        }
        const h3 = document.createElement("h3");
        const nameText = (awardName.textContent || "").trim();
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = nameText;
          h3.append(a);
        } else {
          h3.textContent = nameText;
        }
        cell2.push(h3);
        cells.push([cell2]);
        return;
      }
      let titleEl = li.querySelector(".text-col-link-header h6, .text-col-link-header .coh-heading, h6.coh-heading, h4.coh-heading, h6, h4, h5, h3");
      let descEl = li.querySelector(".text-col-link-desc, .overlay-inner-desc, p");
      if (!titleEl) {
        const strong = li.querySelector("strong, b");
        if (strong && (strong.textContent || "").trim()) {
          titleEl = strong;
          const wrappers = Array.from(li.querySelectorAll(".rte-wrapper, .coh-wysiwyg"));
          const descWrap = wrappers.length > 1 ? wrappers[1] : null;
          descEl = descWrap && descWrap.querySelector("p") || null;
          if (!descEl) {
            const ps = Array.from(li.querySelectorAll("p")).filter((p) => !p.contains(strong));
            descEl = ps[0] || null;
          }
        }
      }
      const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
      const descText = descEl ? (descEl.textContent || "").trim() : "";
      const cell = [];
      if (titleText) {
        const h3 = document.createElement("h3");
        if (href && !descText) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        cell.push(h3);
      }
      if (descText) {
        const p = document.createElement("p");
        p.textContent = descText;
        cell.push(p);
      }
      if (href && descText) {
        const cta = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = titleText || href;
        cta.append(a);
        cell.push(cta);
      }
      if (cell.length === 0) return;
      cells.push([cell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const isFeaturedAwards = element.matches(".featured-awards, .bold-tricolumn-list.featured-awards") || element.closest(".featured-awards-wrapper");
    const blockName = isFeaturedAwards ? "cards (no images, awards-featured)" : "cards (no images)";
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function absolutize2(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return `https://www.paramount.com${src.startsWith("/") ? src : `/${src}`}`;
  }
  function parse7(element, { document }) {
    let rows = Array.from(element.querySelectorAll(".media-card-container"));
    if (rows.length === 0 && element.querySelector(".timelineCarousel-text-slider, .timeline-slide-content-wrapper")) {
      const textSlide = element.querySelector(
        ".timelineCarousel-text-slider .slick-slide:not(.slick-cloned), .timeline-slide-content-wrapper"
      ) || element;
      const imgSlide = element.querySelector(
        ".timelineCarousel-image-slider .slick-slide:not(.slick-cloned), .timeline-img-wrapper, .timeline-video-imgCanvas"
      );
      const synthetic = document.createElement("div");
      synthetic.className = "media-card-container";
      const contentBlock = document.createElement("div");
      contentBlock.className = "media-content-block";
      if (textSlide) {
        Array.from(textSlide.querySelectorAll("h1, h2, h3, h4, p")).forEach((n) => {
          if ((n.textContent || "").trim()) contentBlock.append(n.cloneNode(true));
        });
      }
      const imgBlock = document.createElement("div");
      imgBlock.className = "media-img-block";
      const realImg = imgSlide && imgSlide.querySelector("img");
      if (realImg) imgBlock.append(realImg.cloneNode(true));
      synthetic.append(imgBlock, contentBlock);
      rows = [synthetic];
    }
    if (rows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    rows.forEach((row) => {
      var _a;
      const content = row.querySelector(".media-content-block") || row;
      const imgEl = Array.from(row.querySelectorAll(".media-img-block img, img")).find((img2) => !img2.closest(".d-none") && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(img2.getAttribute("src") || ""));
      let img = "";
      if (imgEl) {
        img = document.createElement("img");
        img.setAttribute("src", absolutize2(imgEl.getAttribute("src")));
        img.setAttribute("alt", imgEl.getAttribute("alt") || "");
      }
      const contentCell = [];
      const eyebrow = content.querySelector(".eyebrow-text");
      const eyebrowText = eyebrow ? (eyebrow.textContent || "").trim() : "";
      if (eyebrowText) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = eyebrowText;
        p.append(em);
        contentCell.push(p);
      }
      const heading = content.querySelector(".media-title-txt h2, .media-title-txt h3, .media-title-txt h4, h2, h3");
      if (heading) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = (heading.textContent || "").trim();
        contentCell.push(h);
      }
      const bodyWrap = content.querySelector(".media-card-desc, .media-content-txt, .media-desc, .rte-wrapper, .coh-wysiwyg") || content;
      Array.from(bodyWrap.querySelectorAll("p")).forEach((p) => {
        const t = (p.textContent || "").trim();
        if (t) {
          const np = document.createElement("p");
          np.textContent = t;
          contentCell.push(np);
        }
      });
      const ctaSource = content.querySelector("a[href]");
      if (ctaSource) {
        const label = (((_a = ctaSource.querySelector("span")) == null ? void 0 : _a.textContent) || ctaSource.textContent || "").trim();
        if (label) {
          const a = document.createElement("a");
          a.setAttribute("href", ctaSource.getAttribute("href"));
          a.textContent = label;
          contentCell.push(a);
        }
      }
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse8(element, { document }) {
    const items = Array.from(element.querySelectorAll(".accordion-item"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const header = item.querySelector(".accordion-header, .accordion-button, button, h6, h5, h4");
      let question = "";
      if (header) {
        const clone = header.cloneNode(true);
        clone.querySelectorAll('a, code, svg, img, .copy-link, [class*="copy"], [class*="tooltip"]').forEach((n) => n.remove());
        question = (clone.textContent || "").replace(/Link Copied!?/gi, "").replace(/\s+/g, " ").trim();
      }
      const body = item.querySelector('.accordion-body, .accordion-collapse, [class*="panel"]');
      const bodyCell = [];
      if (body) {
        const ps = Array.from(body.querySelectorAll("p"));
        if (ps.length) {
          ps.forEach((p) => {
            if ((p.textContent || "").trim()) bodyCell.push(p);
          });
        } else {
          const t = (body.textContent || "").trim();
          if (t) {
            const p = document.createElement("p");
            p.textContent = t;
            bodyCell.push(p);
          }
        }
      }
      if (!question && bodyCell.length === 0) return;
      const qEl = document.createElement("p");
      qEl.textContent = question;
      cells.push([[qEl], bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/definition-list.js
  function parse9(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > li, li.coh-list-item, li"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const wrappers = Array.from(li.querySelectorAll(".rte-wrapper, .coh-wysiwyg"));
      let termText = "";
      let defText = "";
      if (wrappers.length >= 2) {
        termText = (wrappers[0].textContent || "").trim();
        defText = (wrappers[1].textContent || "").trim();
      } else {
        const strong = li.querySelector("strong, b");
        termText = strong ? (strong.textContent || "").trim() : "";
        const ps = Array.from(li.querySelectorAll("p")).filter((p) => !(strong && p.contains(strong)));
        defText = ps.length ? (ps[0].textContent || "").trim() : "";
      }
      if (!termText && !defText) return;
      const termCell = [];
      if (termText) {
        const strong = document.createElement("strong");
        strong.textContent = termText;
        termCell.push(strong);
      }
      cells.push([termCell.length ? termCell : "", defText || ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "definition-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/callout.js
  function parse10(element, { document }) {
    var _a;
    const cell = [];
    const heading = element.querySelector("h2, h3, h4, .pusher-title, .section-heading");
    if (heading && (heading.textContent || "").trim()) {
      const tag = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2";
      const h = document.createElement(tag);
      h.textContent = (heading.textContent || "").trim();
      cell.push(h);
    }
    Array.from(element.querySelectorAll("p")).forEach((p) => {
      const t = (p.textContent || "").trim();
      if (t && (!heading || t !== (heading.textContent || "").trim())) {
        const np = document.createElement("p");
        np.textContent = t;
        cell.push(np);
      }
    });
    const ctaSource = element.querySelector('a[href*=".pdf"], a[href*="/files/"], a[href]');
    if (ctaSource) {
      const label = (((_a = ctaSource.querySelector("span")) == null ? void 0 : _a.textContent) || ctaSource.textContent || "").trim();
      const a = document.createElement("a");
      a.setAttribute("href", ctaSource.getAttribute("href"));
      a.textContent = label || "Download";
      const wrap = document.createElement("p");
      wrap.append(a);
      cell.push(wrap);
    }
    if (cell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "callout", cells: [[cell]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/job-search.js
  function parse11(element, { document }) {
    let label = "";
    const headingEl = element.querySelector(".section-heading, h1, h2, h3, h4, .career-filter-title");
    if (headingEl) label = (headingEl.textContent || "").trim();
    if (!label) {
      const cand = Array.from(element.querySelectorAll("p, span, div")).map((el) => el.childElementCount === 0 ? (el.textContent || "").trim() : "").find((t) => t && t.length < 60);
      label = cand || "Explore the possibilities";
    }
    const p = document.createElement("p");
    p.textContent = label;
    const block = WebImporter.Blocks.createBlock(document, { name: "job-search", cells: [[[p]]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/testimonials.js
  function parse12(element, { document }) {
    const cards = Array.from(element.querySelectorAll(".card-slide-item"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const nameEl = card.querySelector(".card-carousel-title h2, .card-carousel-title, h2, h3");
      const name = nameEl ? (nameEl.textContent || "").trim() : "";
      if (!name || seen.has(name)) return;
      seen.add(name);
      const nameCell = [];
      const h = document.createElement("h3");
      h.textContent = name;
      nameCell.push(h);
      const bodyCell = [];
      const body = card.querySelector(".card-carousel-body-wrapper");
      if (body) {
        Array.from(body.querySelectorAll("p")).forEach((p) => {
          const t = (p.textContent || "").trim();
          if (!t) return;
          const np = document.createElement("p");
          const strong = p.querySelector("strong");
          if (strong && (strong.textContent || "").trim() === t) {
            const s = document.createElement("strong");
            s.textContent = t;
            np.append(s);
          } else {
            np.textContent = t;
          }
          bodyCell.push(np);
        });
      }
      cells.push([nameCell, bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "testimonials", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function absolutize3(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return `https://www.paramount.com${src.startsWith("/") ? src : `/${src}`}`;
  }
  function parse13(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > li, li.coh-list-item, li"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const imgEl = Array.from(li.querySelectorAll("img.latest-tile-img, img")).find((img2) => !/d-lg-none/.test(img2.className) && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(img2.getAttribute("src") || "")) || li.querySelector("img");
      let img = "";
      if (imgEl) {
        img = document.createElement("img");
        img.setAttribute("src", absolutize3(imgEl.getAttribute("src")));
        img.setAttribute("alt", imgEl.getAttribute("alt") || "");
      }
      const contentCell = [];
      const eyebrow = li.querySelector(".eyebrow-text");
      const eyebrowText = eyebrow ? (eyebrow.textContent || "").trim() : "";
      if (eyebrowText) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = eyebrowText;
        p.append(em);
        contentCell.push(p);
      }
      const titleEl = li.querySelector(".latestNews-tile-heading, h6, h5, h4, h3");
      const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
      if (titleText) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        contentCell.push(h3);
      }
      const descEl = li.querySelector(".latestNews-tile-desc, p");
      const descText = descEl ? (descEl.textContent || "").trim() : "";
      if (descText) {
        const p = document.createElement("p");
        p.textContent = descText;
        contentCell.push(p);
      }
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell.length ? contentCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-placeholder.js
  function parse14(element, { document }) {
    const cell = [];
    const heading = element.querySelector("h1, h2, h3, h4");
    if (heading && (heading.textContent || "").trim()) {
      const tag = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h4";
      const h = document.createElement(tag);
      h.textContent = (heading.textContent || "").trim();
      cell.push(h);
    }
    Array.from(element.querySelectorAll("p")).forEach((p) => {
      const t = (p.textContent || "").trim();
      if (t && t.length < 120 && (!heading || t !== (heading.textContent || "").trim())) {
        const np = document.createElement("p");
        np.textContent = t;
        cell.push(np);
      }
    });
    const socials = Array.from(element.querySelectorAll("a[href]")).filter((a) => {
      const href = a.getAttribute("href") || "";
      return href && !href.startsWith("javascript:");
    });
    if (socials.length) {
      const ul = document.createElement("ul");
      socials.forEach((a) => {
        const href = a.getAttribute("href");
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        const label = (a.textContent || "").trim() || href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
        link.textContent = label;
        li.append(link);
        ul.append(li);
      });
      if (ul.children.length) cell.push(ul);
    }
    if (cell.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Contact form";
      cell.push(p);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "form-placeholder", cells: [[cell]] });
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

  // tools/importer/import-content-page.js
  var PAGE_TEMPLATE = {
    name: "content-page",
    description: "Standard corporate content page: text-only navy page hero (breadcrumb + title) followed by a flexible stack of sections \u2014 leadership/people card grids, two-column description+links, related-content card carousels, and big-number stat strips. Covers about, businesses, and careers sub-pages.",
    urls: [
      "https://www.paramount.com/about/board-of-directors"
    ],
    blocks: [
      {
        name: "hero-page",
        instances: [".podcast-header-wrapper", ".wrapper-hero-sec", ".wrapper-ads-banner"]
      },
      {
        name: "cards-people",
        instances: [".wrapper-leadership-list ul.leadership-tile-slider"]
      },
      {
        name: "columns-info",
        instances: [".wrapper-content-desc .container .row.g-0", ".wrapper-content-desc .row"]
      },
      {
        name: "cards-show",
        instances: [".wrapper-tile-carousel .carousel-with-tiles", ".wrapper-tile-carousel .brand-tile-slider", ".wrapper-brand-tile .brand-tile-slider", ".wrapper-podcast ul.podcast-listing", ".wrapper-business-cards ul.business-cards-list"]
      },
      {
        name: "stats",
        instances: [".wrapper-content-breaker ul.contentBreaker-list"]
      },
      {
        name: "cards",
        instances: [".wrapper-text-col-with-links ul.text-col-link-list", "ul.three-col-text-card-list", ".wrapper-aboutValues ul.ourValues-list", "ul.curated-awards", "ul.bold-tricolumn-list", ".wrapper-bg-card-overlay", ".awards-filter-view-wrapper:not(.awards-view-mobile) ul.awards-filter"]
      },
      {
        name: "testimonials",
        instances: [".cardCarousel-text-slider"]
      },
      {
        name: "columns-feature",
        instances: [".wrapper-media-card", ".wrapper-history-carousel"]
      },
      {
        name: "cards-news",
        instances: [".wrapper-latestNews-tile ul.latestNews-tile-list"]
      },
      {
        name: "form-placeholder",
        instances: [".wrapper-ads-form", ".wrapper-contact-us .form-fields-block", ".wrapper-license-form .form-fields-block"]
      },
      {
        name: "accordion",
        instances: [".wrapper-accordion-faq", ".wrapper-accordion-sm-layout"]
      },
      {
        name: "definition-list",
        instances: [".wrapper-multiline ul.multiline-column-list"]
      },
      {
        name: "callout",
        instances: [".pusher-wrapper"]
      },
      {
        name: "job-search",
        instances: [".wrapper-career-filter"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Page hero",
        selector: ".podcast-header-wrapper",
        style: null,
        blocks: ["hero-page"],
        defaultContent: []
      },
      {
        id: "section-1b-intro",
        name: "Centered intro RTE (careers)",
        selector: ".wrapper-rte-block.wrapper-container-large",
        style: "center",
        blocks: [],
        defaultContent: [".wrapper-rte-block.wrapper-container-large"]
      },
      {
        id: "section-2-leadership",
        name: "Leadership / people listing",
        selector: ".wrapper-leadership-list",
        style: null,
        repeat: true,
        blocks: ["cards-people"],
        defaultContent: [".wrapper-leadership-list .section-heading"]
      },
      {
        id: "section-3-desc",
        name: "Description + links",
        selector: ".wrapper-content-desc",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-4-related-content",
        name: "Related content",
        selector: ".wrapper-tile-carousel",
        style: null,
        blocks: ["cards-show"],
        defaultContent: [".wrapper-tile-carousel .section-heading"]
      },
      {
        id: "section-5-stats",
        name: "Stat strip",
        selector: ".wrapper-content-breaker",
        style: null,
        blocks: ["stats"],
        defaultContent: []
      },
      {
        id: "section-6-more",
        name: "More businesses / link grid",
        selector: ".wrapper-text-col-with-links",
        style: null,
        blocks: ["cards"],
        defaultContent: [".wrapper-text-col-with-links .section-heading"]
      },
      {
        id: "section-7-podcasts",
        name: "Podcast card grids",
        selector: ".wrapper-podcast",
        style: null,
        blocks: ["cards-show"],
        defaultContent: [".wrapper-podcast .section-heading"]
      },
      {
        id: "section-8-values",
        name: "Compliance / values card grid (/about)",
        selector: ".wrapper-aboutValues",
        style: null,
        repeat: true,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-9-feature",
        name: "Media-card feature rows (careers)",
        selector: ".wrapper-media-card",
        style: null,
        repeat: true,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-10-multiline",
        name: "Multiline definition list (benefits wellness)",
        selector: ".wrapper-multiline",
        style: null,
        blocks: ["definition-list"],
        defaultContent: [".wrapper-multiline .section-heading"]
      },
      {
        id: "section-11-faq",
        name: "FAQ accordion (internships)",
        selector: ".wrapper-accordion-faq",
        style: null,
        blocks: ["accordion"],
        defaultContent: [".wrapper-accordion-faq .section-heading"]
      },
      {
        id: "section-12-callout",
        name: "Pusher callout / download CTA (grey band)",
        selector: ".pusher-wrapper",
        style: null,
        repeat: true,
        blocks: ["callout"],
        defaultContent: []
      },
      {
        id: "section-13-jobsearch",
        name: "Job-search placeholder (explore the possibilities)",
        selector: ".wrapper-career-filter",
        style: null,
        blocks: ["job-search"],
        defaultContent: []
      },
      {
        id: "section-14-business-cards",
        name: "Business cards grid (/about/businesses index)",
        selector: ".wrapper-business-cards",
        style: null,
        blocks: ["cards-show"],
        defaultContent: []
      },
      {
        id: "section-15-accordion-sm",
        name: 'Small-layout accordion (business detail "Our Approach")',
        selector: ".wrapper-accordion-sm-layout",
        style: null,
        blocks: ["accordion"],
        defaultContent: [".wrapper-accordion-sm-layout .section-heading"]
      },
      {
        id: "section-16-awards",
        name: "Awards & recognition cards (internships)",
        selector: ".curated-awards-wrapper",
        style: null,
        repeat: true,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-17-kickstart",
        name: "Kick-start / history carousel (intro + banner)",
        selector: ".wrapper-history-carousel",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-18-testimonials",
        name: "Intern testimonials carousel",
        selector: ".cardCarousel-text-slider",
        style: null,
        blocks: ["testimonials"],
        defaultContent: []
      },
      {
        id: "section-19-value-props",
        name: "Value-prop overlay cards (advertising)",
        selector: ".wrapper-bg-card-overlay",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-20-news",
        name: "Latest news & insights cards (advertising)",
        selector: ".wrapper-latestNews-tile",
        style: null,
        blocks: ["cards-news"],
        defaultContent: [".wrapper-latestNews-tile .section-heading"]
      },
      {
        id: "section-22-awards-filter",
        name: "Awards listing (awards page)",
        selector: ".wrrapper-awards-filter",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-21-ads-form",
        name: "Contact form placeholder (advertising)",
        selector: ".wrapper-ads-form",
        style: null,
        blocks: ["form-placeholder"],
        defaultContent: []
      },
      {
        id: "section-23-contact-form",
        name: "Contact / licensing form placeholder (contact-us, licensing)",
        selector: ".wrapper-contact-us, .wrapper-license-form",
        style: null,
        blocks: ["form-placeholder"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-page": parse,
    "cards-people": parse2,
    "columns-info": parse3,
    "cards-show": parse4,
    stats: parse5,
    cards: parse6,
    "columns-feature": parse7,
    accordion: parse8,
    "definition-list": parse9,
    callout: parse10,
    "job-search": parse11,
    testimonials: parse12,
    "cards-news": parse13,
    "form-placeholder": parse14
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
  var import_content_page_default = {
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
  return __toCommonJS(import_content_page_exports);
})();
