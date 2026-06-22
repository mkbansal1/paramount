/**
 * Breadcrumb navigation trail.
 *
 * Authored structure (.plain.html): one cell holding one <p> per crumb. Ancestor
 * crumbs wrap an <a>; the final (current page) crumb is plain text. E.g.
 *   <p><a href="/about">About</a></p>
 *   <p><a href="/about/brands">Brands</a></p>
 *   <p>MTV</p>
 *
 * Renders a semantic <nav><ol> breadcrumb with the last item marked current.
 */
export default function decorate(block) {
  // Each crumb is a <p> (preferred). Fall back to <li> or bare <a> for safety.
  let crumbs = [...block.querySelectorAll(':scope > div > div > p')];
  if (!crumbs.length) crumbs = [...block.querySelectorAll('p')];
  if (!crumbs.length) crumbs = [...block.querySelectorAll('li')];
  if (!crumbs.length) crumbs = [...block.querySelectorAll('a')];

  if (!crumbs.length) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';

  crumbs.forEach((source, idx) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    const isLast = idx === crumbs.length - 1;
    const anchor = source.tagName === 'A' ? source : source.querySelector('a');
    const text = (source.textContent || '').trim();
    if (!text) return;

    if (isLast || !anchor) {
      const span = document.createElement('span');
      span.className = 'breadcrumb-current';
      span.setAttribute('aria-current', 'page');
      span.textContent = text;
      li.append(span);
    } else {
      const a = document.createElement('a');
      a.className = 'breadcrumb-link';
      a.href = anchor.getAttribute('href');
      a.textContent = text;
      li.append(a);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
