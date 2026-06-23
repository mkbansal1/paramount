/**
 * Job search block (placeholder).
 *
 * Renders the "explore the possibilities" job-search promo as a static
 * placeholder — a heading plus disabled filter controls and a button. The live
 * filtering functionality is intentionally NOT implemented; this preserves the
 * section's presence and layout on the page.
 *
 * Authored structure (.plain.html): a single cell with the heading text.
 */
export default function decorate(block) {
  const headingText = (block.textContent || '').trim() || 'Explore the possibilities';
  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'job-search-inner';

  const h = document.createElement('h2');
  h.textContent = headingText;
  inner.append(h);

  const controls = document.createElement('div');
  controls.className = 'job-search-controls';
  ['Job Function', 'Job Type', 'Location'].forEach((label) => {
    const select = document.createElement('select');
    select.setAttribute('aria-label', label);
    select.disabled = true;
    const opt = document.createElement('option');
    opt.textContent = label;
    select.append(opt);
    controls.append(select);
  });
  const go = document.createElement('a');
  go.className = 'button job-search-go';
  go.href = 'https://careers.paramount.com/';
  go.textContent = 'Go';
  controls.append(go);

  inner.append(controls);
  block.append(inner);
}
