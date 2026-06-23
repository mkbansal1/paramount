/**
 * Legal date — the right-aligned "As of {date}" line at the top of some
 * legal/policy documents. The importer converts the source
 * `<p class="text-align-right">` into this block because the alignment class
 * does not survive markdown conversion. Decoration just unwraps the single cell
 * to a paragraph; the right alignment comes from legal-date.css.
 */
export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  const p = document.createElement('p');
  if (inner) {
    while (inner.firstChild) p.append(inner.firstChild);
  }
  block.textContent = '';
  block.append(p);
}
