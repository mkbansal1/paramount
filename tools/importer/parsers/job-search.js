/* eslint-disable */
/* global WebImporter */
/**
 * Parser for job-search. Base: job-search (placeholder).
 * Source: https://www.paramount.com/careers/benefits (.wrapper-career-filter)
 * Generated: 2026-06-22
 *
 * The "explore the possibilities" job-search widget. The live page renders an
 * interactive filter (Job Function / Job Type / Location dropdowns + Go). We do
 * NOT migrate the functionality — we emit a placeholder block carrying just the
 * heading label; the block JS renders static (disabled) filter controls so the
 * section keeps its place and look.
 *
 * Block structure: 1 column, 1 row.
 *   Row 1 = block name. Row 2 = a single cell with the heading text.
 */
export default function parse(element, { document }) {
  // The visible label ("explore the possibilities") is usually a styled heading
  // or the first non-control text in the widget.
  let label = '';
  const headingEl = element.querySelector('.section-heading, h1, h2, h3, h4, .career-filter-title');
  if (headingEl) label = (headingEl.textContent || '').trim();
  if (!label) {
    // Fallback: first short text node-bearing element that isn't an option.
    const cand = Array.from(element.querySelectorAll('p, span, div'))
      .map((el) => (el.childElementCount === 0 ? (el.textContent || '').trim() : ''))
      .find((t) => t && t.length < 60);
    label = cand || 'Explore the possibilities';
  }

  const p = document.createElement('p');
  p.textContent = label;

  const block = WebImporter.Blocks.createBlock(document, { name: 'job-search', cells: [[[p]]] });
  element.replaceWith(block);
}
