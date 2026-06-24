/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-people. Base: cards.
 * Source: https://www.paramount.com/about/board-of-directors
 *   (.wrapper-leadership-list ul.leadership-tile-slider)
 * Generated: 2026-06-22
 *
 * People / leadership card grid. Each card is a person tile: a headshot image
 * plus a name, the whole tile linking to that person's detail page. (A role/title
 * line is captured when present; board-of-directors tiles are headshot + name only.)
 *
 * Block structure (cards library convention): 2 columns, multiple rows.
 *   Row 1 = block name. Each subsequent row = one person card:
 *     cell 1 = headshot image (mandatory)
 *     cell 2 = text content — name (styled as heading, linked to the person page)
 *              + optional role/title line beneath.
 *
 * NOTE: the section heading ("Chairman of the Board" / "Board of Directors") is
 * authored as default content OUTSIDE this block — it is emitted separately by
 * the import script section handling, not by this parser.
 *
 * Source DOM per tile (li.leadership-tile-slide):
 *   > article > a[href]                          -> person link (wraps the tile)
 *   a > img.desktop-image                         -> desktop headshot (cell 1)
 *   a .leadership-tile-details h6.coh-heading     -> name (cell 2)
 *   a .leadership-tile-desc (eyebrow-text)        -> role/title line (cell 2)
 */
export default function parse(element, { document }) {
  const tiles = Array.from(element.querySelectorAll(':scope li.leadership-tile-slide, li.leadership-tile-slide'));

  // Empty-block guard.
  if (tiles.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  tiles.forEach((tile) => {
    const link = tile.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Cell 1: desktop headshot (prefer desktop-image, skip the mobile duplicate).
    const img = tile.querySelector('img.desktop-image')
      || tile.querySelector('img.coh-image:not(.mobile-image)')
      || tile.querySelector('img:not([src^="data:"])');

    // Cell 2: name (styled as a heading, linked) + optional role line.
    const nameEl = tile.querySelector('.leadership-tile-details h6, .leadership-tile-details .coh-heading, h6.coh-heading, h6');
    const nameText = nameEl ? (nameEl.textContent || '').trim() : '';
    const roleEl = tile.querySelector('.leadership-tile-desc, .eyebrow-text, .leadership-tile-designation, .designation');
    const roleText = roleEl ? (roleEl.textContent || '').trim() : '';

    const contentCell = [];
    if (nameText) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = nameText;
        h3.append(a);
      } else {
        h3.textContent = nameText;
      }
      contentCell.push(h3);
    } else if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      contentCell.push(a);
    }
    if (roleText) {
      const role = document.createElement('p');
      role.textContent = roleText;
      contentCell.push(role);
    }

    // Skip tiles with neither image nor name/link.
    if (!img && contentCell.length === 0) return;

    cells.push([img || '', contentCell.length ? contentCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-people', cells });
  element.replaceWith(block);
}
