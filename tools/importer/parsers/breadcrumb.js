/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb. Base: breadcrumb.
 * Source: https://www.paramount.com/about/brands/mtv (.podcast-header-wrapper ol.breadcrumb)
 * Generated: 2026-06-22
 *
 * No library convention exists for "breadcrumb" — structure inferred from source HTML.
 *
 * Source DOM (ol.breadcrumb):
 *   li.breadcrumb-item > a[href]          -> ancestor crumb (keep as anchor)
 *   li.breadcrumb-item > span.breadcrumb-last -> current page crumb (plain text, no link)
 *
 * Output: a single-column breadcrumb block. One row whose single cell holds the
 * ordered trail — ancestor anchors preserved as links and the final crumb as
 * plain text — separated so each crumb renders as a distinct breadcrumb item.
 */
export default function parse(element, { document }) {
  // element is the <ol class="breadcrumb"> itself (per page-templates selector).
  const items = Array.from(element.querySelectorAll(':scope > li, li.breadcrumb-item'));

  const crumbs = [];
  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    if (link) {
      // Ancestor crumb: keep the anchor, but strip any decorative icons.
      const text = (link.textContent || '').trim();
      if (!text) return;
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = text;
      crumbs.push(a);
    } else {
      // Current (last) crumb: plain text only.
      const span = li.querySelector('.breadcrumb-last, span') || li;
      const text = (span.textContent || '').trim();
      if (text) {
        crumbs.push(document.createTextNode(text));
      }
    }
  });

  // Empty-block guard.
  if (crumbs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One cell holding each crumb in its own paragraph so they render as
  // distinct, ordered breadcrumb items.
  const cell = [];
  crumbs.forEach((crumb) => {
    const p = document.createElement('p');
    p.append(crumb);
    cell.push(p);
  });

  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  element.replaceWith(block);
}
