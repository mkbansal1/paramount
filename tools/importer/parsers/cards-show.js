/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-show. Base: cards.
 * Source: https://www.paramount.com/about/brands/mtv (.wrapper-brand-tile .brand-tile-slider)
 * Generated: 2026-06-22
 *
 * Block structure (cards library convention): 2 columns, multiple rows.
 *   Row 1 = block name. Each subsequent row = one card:
 *     cell 1 = image (mandatory)  -> portrait show poster
 *     cell 2 = text content       -> show title wrapped in the show link
 *
 * No hover overlay / description — each tile is just a poster + a persistent,
 * linked title beneath it.
 *
 * Two source layouts are supported:
 *   A) brand-detail "Related content" (.brand-tile-slide):
 *        > a[href]                            -> show link (wraps poster + details)
 *        a > img.coh-image                    -> portrait poster image (cell 1)
 *        a .brand-tile-details h6.coh-heading -> show title text (cell 2)
 *   B) content-page "Related content" carousel (.carousel-tile-item, a slick
 *      slider that clones slides — clones are de-duped by href):
 *        > a.carousel-tile-container[href]    -> show link
 *        a .carousel-item-img img.coh-image   -> portrait poster image (cell 1)
 *        a .title-wrapper                     -> show title text (cell 2)
 */
export default function parse(element, { document }) {
  let tiles = Array.from(element.querySelectorAll(':scope > .brand-tile-slide, .brand-tile-slide'));
  let carousel = false;
  if (tiles.length === 0) {
    // Carousel layout (slick). Take non-cloned tiles when the slider marks clones.
    tiles = Array.from(element.querySelectorAll('.slick-slide:not(.slick-cloned) .carousel-tile-item'));
    if (tiles.length === 0) tiles = Array.from(element.querySelectorAll('.carousel-tile-item'));
    carousel = tiles.length > 0;
  }
  if (tiles.length === 0) {
    // Podcast listing layout (.podcast-listing > li): each li = <a><img></a> + <h6><a>title</a></h6>.
    tiles = Array.from(element.querySelectorAll(':scope > li, li.coh-list-item'));
  }

  // Empty-block guard.
  if (tiles.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const seenHrefs = new Set();
  tiles.forEach((tile) => {
    const link = tile.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // De-dupe slick clones (same href appears multiple times in the DOM).
    if (carousel && href) {
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);
    }

    // Cell 1: portrait poster image (real raster only, skip inline icons).
    const poster = tile.querySelector('img.coh-image, .coh-image, img:not([src^="data:"])');

    // Cell 2: title wrapped in the show link. Covers brand-tile (h6), carousel
    // (.title-wrapper), podcast (h6), and business-card tiles (.card-tile-title).
    const titleEl = tile.querySelector('.brand-tile-details h6, .brand-tile-details .coh-heading, .title-wrapper, .card-tile-title, h6.coh-heading, h6');
    const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

    const contentCell = [];
    if (titleText && href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = titleText;
      contentCell.push(a);
    } else if (titleText) {
      contentCell.push(document.createTextNode(titleText));
    } else if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      contentCell.push(a);
    }

    // Skip tiles with neither image nor title.
    if (!poster && contentCell.length === 0) return;

    cells.push([poster || '', contentCell.length ? contentCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-show', cells });
  element.replaceWith(block);
}
