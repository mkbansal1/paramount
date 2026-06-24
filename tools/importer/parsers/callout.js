/* eslint-disable */
/* global WebImporter */
/**
 * Parser for callout. Base: callout.
 * Source: https://www.paramount.com/careers/benefits
 *   (.pusher-wrapper.bg-horizon — "Benefits at-a-glance")
 * Generated: 2026-06-22
 *
 * No EDS library convention for "callout" — structure inferred from source.
 * A centered promo band: heading + supporting text + a CTA button (often a
 * downloadable PDF), on a light-grey background.
 *
 * Block structure: 1 column, 1 row.
 *   Row 1 = block name. Row 2 = a single cell with heading + text + CTA link.
 *
 * Source DOM:
 *   .pusher-content / .coh-wysiwyg h2,h3,h4  -> heading
 *   p                                         -> supporting text
 *   a[href]                                   -> CTA (e.g. DOWNLOAD PDF)
 */
export default function parse(element, { document }) {
  const cell = [];

  const heading = element.querySelector('h2, h3, h4, .pusher-title, .section-heading');
  if (heading && (heading.textContent || '').trim()) {
    const tag = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2';
    const h = document.createElement(tag);
    h.textContent = (heading.textContent || '').trim();
    cell.push(h);
  }

  // Supporting paragraph(s) — skip ones that are only the heading/CTA.
  Array.from(element.querySelectorAll('p')).forEach((p) => {
    const t = (p.textContent || '').trim();
    if (t && (!heading || t !== (heading.textContent || '').trim())) {
      const np = document.createElement('p');
      np.textContent = t;
      cell.push(np);
    }
  });

  // CTA (prefer a PDF/document link; else the first link).
  const ctaSource = element.querySelector('a[href*=".pdf"], a[href*="/files/"], a[href]');
  if (ctaSource) {
    const label = (ctaSource.querySelector('span')?.textContent || ctaSource.textContent || '').trim();
    const a = document.createElement('a');
    a.setAttribute('href', ctaSource.getAttribute('href'));
    a.textContent = label || 'Download';
    const wrap = document.createElement('p');
    wrap.append(a);
    cell.push(wrap);
  }

  if (cell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'callout', cells: [[cell]] });
  element.replaceWith(block);
}
