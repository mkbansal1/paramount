/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote. Base: blockquote (default-content style).
 * Source: https://www.paramount.com/news/* (.wrapper-fullWidth-quote)
 * Generated: 2026-06-23
 *
 * Full-width editorial pull quote. The live markup is a single heading holding
 * the quote text and an attribution, e.g.:
 *   "..." - Charlotte Barker
 * Rendered as a semantic <blockquote> in default content (no library block is
 * required); the attribution is split onto its own line when present.
 */
export default function parse(element, { document }) {
  const headingEl = element.querySelector('.fullWidth-quote-container h5, h5.coh-heading, h5, h4, h3, p');
  const raw = headingEl ? (headingEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
  if (!raw) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Split a trailing attribution ("... " - Name) onto its own line.
  let quoteText = raw;
  let attribution = '';
  const m = raw.match(/^(.*[”"'’])\s*[-–—]\s*(.+)$/);
  if (m) {
    quoteText = m[1].trim();
    attribution = m[2].trim();
  }

  const blockquote = document.createElement('blockquote');
  const p = document.createElement('p');
  p.textContent = quoteText;
  blockquote.append(p);
  if (attribution) {
    const cite = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = `— ${attribution}`;
    cite.append(em);
    blockquote.append(cite);
  }

  element.replaceWith(blockquote);
}
