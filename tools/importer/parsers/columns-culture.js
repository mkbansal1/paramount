/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-culture. Base: columns.
 * Source: https://www.paramount.com/
 * Generated: 2026-06-22
 *
 * Block structure (from library-description.txt): columns block.
 *   Row 1 = block name. Row 2 = two cells (one per column):
 *     cell 1 = headings ("SHAPE THE" / "FUTURE") + "Join Us" CTA,
 *     cell 2 = person image.
 *
 * userDecisions honored (authoring-analysis.json):
 *   - decoratedHeadlines: the "SHAPE THE" / "FUTURE" headings already exist as
 *     live text (<h2>/<h1>) in the source and are carried as live headings.
 *
 * Source DOM:
 *   .culture-left-block .text-section h2 / h1 -> headings
 *   .join-us-btn-wrapper a.primary-btn         -> "Join Us" CTA
 *   .culture-right-image img                    -> person image
 */
export default function parse(element, { document }) {
  // --- Cell 1: headings + CTA ---
  const contentCell = [];

  const headings = Array.from(element.querySelectorAll('.culture-left-block .text-section h1, .culture-left-block .text-section h2, .text-section h1, .text-section h2'));
  headings.forEach((h) => contentCell.push(h));

  // "Join Us" CTA. Source anchor wraps a label span + icon <code>. Rebuild a
  // clean anchor using the visible label text so the icon markup is dropped.
  const ctaSource = element.querySelector('.join-us-btn-wrapper a[href], a.primary-btn[href]');
  if (ctaSource) {
    const labelSpan = ctaSource.querySelector('span');
    const label = (labelSpan ? labelSpan.textContent : ctaSource.textContent).trim();
    const cta = document.createElement('a');
    cta.setAttribute('href', ctaSource.getAttribute('href'));
    cta.textContent = label || 'Join Us';
    contentCell.push(cta);
  }

  // --- Cell 2: person image ---
  // Prefer the desktop image variant within the right-side slide.
  const image = element.querySelector('.culture-right-image img.d-lg-block, .culture-right-image img, .culture-slider .slide img');

  // Empty-block guard.
  if (contentCell.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([contentCell, image || '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-culture', cells });
  element.replaceWith(block);
}
