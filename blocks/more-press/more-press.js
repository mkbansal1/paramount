/**
 * More Press — auto-updating list of the latest press releases.
 *
 * Queries the published press index (/press-index.json), sorts by release date
 * descending, drops the current page, and renders the most recent few as a
 * navy-banded "More Press" list (date eyebrow + title link). Because it reads
 * the live index it never goes stale, and the same block is reused (auto-blocked)
 * on every press-release page.
 *
 * Authored/auto-blocked structure: an empty block; an optional first cell value
 * overrides how many items to show (default 5).
 */
const INDEX_URL = '/press-index.json';
const DEFAULT_LIMIT = 5;

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

export default async function decorate(block) {
  const limitText = (block.textContent || '').trim();
  const limit = Number.parseInt(limitText, 10) > 0 ? Number.parseInt(limitText, 10) : DEFAULT_LIMIT;
  block.textContent = '';

  let rows = [];
  try {
    const resp = await fetch(INDEX_URL);
    if (resp.ok) {
      const json = await resp.json();
      rows = Array.isArray(json.data) ? json.data : [];
    }
  } catch (e) {
    // index not published yet (e.g. local preview) — render nothing rather than break
    rows = [];
  }

  const here = window.location.pathname.replace(/\.html$/, '');
  const items = rows
    .filter((r) => (r.template || '').includes('press-release'))
    .filter((r) => r.path && r.path.replace(/\.html$/, '') !== here)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limit);

  if (!items.length) {
    // Nothing to show (or index unavailable, e.g. local preview before publish)
    // — remove the whole section so no empty band is left behind.
    (block.closest('.section') || block.closest('.more-press-wrapper') || block).remove();
    return;
  }

  const heading = document.createElement('a');
  heading.className = 'more-press-title';
  heading.href = '/press';
  heading.textContent = 'More Press';
  block.append(heading);

  const ul = document.createElement('ul');
  ul.className = 'more-press-list';
  items.forEach((r) => {
    const li = document.createElement('li');
    const date = document.createElement('span');
    date.className = 'more-press-date';
    date.textContent = fmtDate(r.date);
    const link = document.createElement('a');
    link.className = 'more-press-link';
    link.href = r.path;
    const h = document.createElement('h6');
    h.textContent = r.title || r.path;
    link.append(h);
    if (date.textContent) li.append(date);
    li.append(link);
    ul.append(li);
  });
  block.append(ul);
}
