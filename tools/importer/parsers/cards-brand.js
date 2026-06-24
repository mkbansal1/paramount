/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-brand. Base: cards.
 * Source: https://www.paramount.com/ (homepage .hm-brand-grid)
 *         https://www.paramount.com/about/brands/mtv (.wrapper-related-brand .related-brand)
 * Generated: 2026-06-22
 *
 * Block structure (cards library-description.txt): 2 columns, multiple rows.
 *   Row 1 = block name. Each subsequent row = one card:
 *     cell 1 = poster/brand image (mandatory)
 *     cell 2 = text content (brand name/logo + optional description + CTA link)
 *
 * This parser supports BOTH source markups and emits the same row model:
 *
 *   1) HOMEPAGE tiles (.hm-brand-grid):
 *        .hm-brand-tile-img img            -> poster image (cell 1)
 *        .hm-brand-tile-hicon img          -> brand logo (cell 2, hover header)
 *        .hm-brand-tile-txt                -> description paragraph (cell 2)
 *        .tile-hover-icon a / mb-overlay a -> CTA link (cell 2)
 *
 *   2) BRAND-DETAIL tiles (.related-brand .related-brand-item):
 *        a.related-brand-container > img.coh-image -> square brand image (cell 1)
 *        .related-brand-overlay .related-brand-logo img -> brand logo (cell 2, hover overlay)
 *        a.related-brand-container[href]   -> CTA link to brand page (cell 2)
 *        (no description paragraph)
 *
 * Detection: if any .related-brand-item exists, use the brand-detail path;
 * otherwise use the homepage .hm-brand-grid path. Homepage behavior is unchanged.
 */
export default function parse(element, { document }) {
  // Helper: derive a human-readable brand name from a brand-page href slug.
  const labelFromHref = (href) => {
    if (!href) return '';
    const slug = href.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const cells = [];

  // ---- Structure detection ----
  const relatedTiles = Array.from(element.querySelectorAll('.related-brand-item'));

  if (relatedTiles.length > 0) {
    // ===== BRAND-DETAIL: .related-brand tiles =====
    relatedTiles.forEach((tile) => {
      const link = tile.querySelector('a.related-brand-container[href], a[href]');
      const href = link ? link.getAttribute('href') : '';

      // Cell 1: square brand image (real raster, skip inline icon/logo SVGs).
      const poster = tile.querySelector('a > img.coh-image, img.coh-image, img:not([src^="data:"])');

      // Cell 2 content: brand logo (hover-reveal overlay) + CTA link.
      const contentCell = [];

      const logo = tile.querySelector('.related-brand-logo img');
      const brandName = labelFromHref(href);
      if (logo) {
        // Preserve the brand logo; ensure it has an alt with the brand name.
        if (brandName && !logo.getAttribute('alt')) logo.setAttribute('alt', brandName);
        contentCell.push(logo);
      } else if (brandName) {
        const h = document.createElement('h3');
        h.textContent = brandName;
        contentCell.push(h);
      }

      // CTA link to the brand page (no description for this markup).
      if (href) {
        const cta = document.createElement('a');
        cta.setAttribute('href', href);
        cta.textContent = brandName || 'Learn More';
        contentCell.push(cta);
      }

      if (!poster && contentCell.length === 0) return;
      cells.push([poster || '', contentCell.length ? contentCell : '']);
    });
  } else {
    // ===== HOMEPAGE: .hm-brand-grid tiles (unchanged) =====
    const tiles = Array.from(element.querySelectorAll('.hm-brand-grid'));

    if (tiles.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }

    tiles.forEach((tile) => {
      // Cell 1: poster image (mandatory).
      const poster = tile.querySelector('.hm-brand-tile-img img, .hm-brand-tile-img');

      // Cell 2 content: brand logo + description + CTA.
      const contentCell = [];

      // Brand logo (revealed on hover).
      const logo = tile.querySelector('.hm-brand-tile-hicon img, .hm-brand-tile-mb-logo img');
      if (logo) contentCell.push(logo);

      // Description paragraph (hover-reveal body).
      const description = tile.querySelector('.hm-brand-tile-txt');
      if (description) contentCell.push(description);

      // CTA link to the brand page.
      const ctaSource = tile.querySelector('.tile-hover-icon a[href], .hm-brand-tile-mb-overlay > a[href]');
      if (ctaSource) {
        const href = ctaSource.getAttribute('href');
        const srLabel = tile.querySelector('.hm-brand-tile-mb-overlay .visually-hidden');
        let label = srLabel ? srLabel.textContent.trim() : '';
        if (!label && href) label = labelFromHref(href);
        const cta = document.createElement('a');
        cta.setAttribute('href', href);
        cta.textContent = label || 'Learn More';
        contentCell.push(cta);
      }

      cells.push([poster || '', contentCell]);
    });
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-brand', cells });
  element.replaceWith(block);
}
