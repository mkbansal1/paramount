/* eslint-disable */
/* global WebImporter */
/**
 * Parser for definition-list. Base: definition-list.
 * Source: https://www.paramount.com/careers/benefits
 *   (.wrapper-multiline ul.multiline-column-list)
 * Generated: 2026-06-22
 *
 * No EDS library convention for "definition-list" — structure inferred from source.
 * A 2-column grid of term + definition pairs (e.g. "Encouraging Wellness").
 *
 * Block structure: 2 columns, one row per item.
 *   Row 1 = block name. Each subsequent row:
 *     cell 1 = term (bold)
 *     cell 2 = definition / description
 *
 * Source DOM per item (li.coh-list-item):
 *   div.rte-wrapper:first  p > strong  -> term
 *   div.rte-wrapper:last   p           -> definition
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > li, li.coh-list-item, li'));
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((li) => {
    const wrappers = Array.from(li.querySelectorAll('.rte-wrapper, .coh-wysiwyg'));
    let termText = '';
    let defText = '';
    if (wrappers.length >= 2) {
      termText = (wrappers[0].textContent || '').trim();
      defText = (wrappers[1].textContent || '').trim();
    } else {
      const strong = li.querySelector('strong, b');
      termText = strong ? (strong.textContent || '').trim() : '';
      const ps = Array.from(li.querySelectorAll('p')).filter((p) => !(strong && p.contains(strong)));
      defText = ps.length ? (ps[0].textContent || '').trim() : '';
    }
    if (!termText && !defText) return;

    const termCell = [];
    if (termText) {
      const strong = document.createElement('strong');
      strong.textContent = termText;
      termCell.push(strong);
    }
    cells.push([termCell.length ? termCell : '', defText || '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'definition-list', cells });
  element.replaceWith(block);
}
