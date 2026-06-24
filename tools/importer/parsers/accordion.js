/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion.
 * Source: https://www.paramount.com/careers/internships (.wrapper-accordion-faq)
 * Generated: 2026-06-22
 *
 * FAQ-style expand/collapse list.
 *
 * Block structure (accordion convention): 2 columns, one row per item.
 *   Row 1 = block name. Each subsequent row:
 *     cell 1 = title / question (clickable label)
 *     cell 2 = content / answer body
 *
 * Source DOM per item (.accordion-item):
 *   .accordion-header / .accordion-button -> question (strip copy-link chrome)
 *   .accordion-body                       -> answer
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.accordion-item'));
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Question: header text, minus the copy-link affordance. The question text
    // lives inside the <button> (alongside a copy-link <a>/<code>/<svg> and a
    // "Link Copied!" tooltip). Strip only those affordances, keep the label text.
    const header = item.querySelector('.accordion-header, .accordion-button, button, h6, h5, h4');
    let question = '';
    if (header) {
      const clone = header.cloneNode(true);
      // remove only the copy-link affordance bits, NOT the button (which holds the label)
      clone.querySelectorAll('a, code, svg, img, .copy-link, [class*="copy"], [class*="tooltip"]').forEach((n) => n.remove());
      question = (clone.textContent || '')
        .replace(/Link Copied!?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Answer: body content (collect paragraphs/links).
    const body = item.querySelector('.accordion-body, .accordion-collapse, [class*="panel"]');
    const bodyCell = [];
    if (body) {
      const ps = Array.from(body.querySelectorAll('p'));
      if (ps.length) {
        ps.forEach((p) => {
          if ((p.textContent || '').trim()) bodyCell.push(p);
        });
      } else {
        const t = (body.textContent || '').trim();
        if (t) {
          const p = document.createElement('p');
          p.textContent = t;
          bodyCell.push(p);
        }
      }
    }

    if (!question && bodyCell.length === 0) return;
    const qEl = document.createElement('p');
    qEl.textContent = question;
    cells.push([[qEl], bodyCell.length ? bodyCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
