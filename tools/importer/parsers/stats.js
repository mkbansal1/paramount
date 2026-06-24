/* eslint-disable */
/* global WebImporter */
/**
 * Parser for stats. Base: stats (content-breaker).
 * Source: https://www.paramount.com/about/businesses/cbs-media-ventures
 *   (.wrapper-content-breaker ul.contentBreaker-list)
 * Generated: 2026-06-22
 *
 * No library convention exists for "stats" — structure inferred from source HTML.
 *
 * A horizontal strip of statistic items, each a big value/number plus a short
 * caption. Emitted as a 2-column block: cell 1 = value, cell 2 = caption.
 *
 * Block structure: 2 columns, multiple rows.
 *   Row 1 = block name. Each subsequent row = one stat:
 *     cell 1 = big value/number (e.g. "TOP 10")
 *     cell 2 = caption/description (e.g. "7 of the top 10 first-run strips")
 *
 * Source DOM per item (li):
 *   span.data-number -> big value (cell 1)
 *   span.data-desc   -> caption   (cell 2)
 */
export default function parse(element, { document }) {
  // `element` is the inner ul.contentBreaker-list (mapped as an inner instance so
  // the .wrapper-content-breaker wrapper survives as the section boundary).
  const items = Array.from(element.querySelectorAll(':scope > li, li'));

  const cells = [];
  items.forEach((li) => {
    const valueEl = li.querySelector('.data-number');
    const descEl = li.querySelector('.data-desc');
    const valueText = valueEl ? (valueEl.textContent || '').trim() : '';
    const descText = descEl ? (descEl.textContent || '').trim() : '';
    if (!valueText && !descText) return;

    const valueCell = [];
    if (valueText) {
      const strong = document.createElement('strong');
      strong.textContent = valueText;
      valueCell.push(strong);
    }
    cells.push([valueCell.length ? valueCell : '', descText || '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'stats', cells });
  element.replaceWith(block);
}
