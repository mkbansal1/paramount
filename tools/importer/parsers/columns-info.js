/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-info. Base: columns.
 * Source: https://www.paramount.com/about/brands/mtv (.wrapper-content-desc)
 * Generated: 2026-06-22
 *
 * Block structure (columns library convention): multiple columns/rows; first row
 * is the block name. Subsequent rows have as many cells as visual columns.
 * Here the content is visually two columns:
 *   cell 1 (left)  = heading + descriptive paragraph
 *   cell 2 (right) = eyebrow label ("links") + list of external links
 *
 * Source DOM:
 *   .content-desc-content h4              -> heading (left cell)
 *   .content-desc-txt p / .content-desc-txt -> paragraph (left cell)
 *   .content-desc-links .eyebrow-text     -> eyebrow label (right cell)
 *   .content-links-list                   -> link list <ul> (right cell)
 */
export default function parse(element, { document }) {
  // LEFT cell: heading + paragraph.
  const leftCell = [];
  const heading = element.querySelector('.content-desc-content h4, .content-desc-content h1, .content-desc-content h2, .content-desc-content h3');
  if (heading) leftCell.push(heading);

  const desc = element.querySelector('.content-desc-txt p, .content-desc-txt');
  if (desc) leftCell.push(desc);

  // RIGHT cell: eyebrow label + link list.
  const rightCell = [];
  const eyebrow = element.querySelector('.content-desc-links .eyebrow-text span, .content-desc-links .eyebrow-text');
  if (eyebrow && (eyebrow.textContent || '').trim()) {
    const label = document.createElement('p');
    label.textContent = (eyebrow.textContent || '').trim();
    rightCell.push(label);
  }

  // Rebuild the link list with clean anchors (strip external-link icons).
  const linkAnchors = Array.from(element.querySelectorAll('.content-links-list a[href]'));
  if (linkAnchors.length) {
    const ul = document.createElement('ul');
    linkAnchors.forEach((a) => {
      const text = (a.textContent || '').trim();
      if (!text) return;
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', a.getAttribute('href'));
      link.textContent = text;
      li.append(link);
      ul.append(li);
    });
    if (ul.children.length) rightCell.push(ul);
  }

  // Empty-block guard.
  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Two-column row. Pad short cells so both columns are present.
  const cells = [[
    leftCell.length ? leftCell : '',
    rightCell.length ? rightCell : '',
  ]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-info', cells });
  element.replaceWith(block);
}
