/**
 * Stats / content-breaker block.
 *
 * A horizontal strip of statistic items, each a large number/value with a short
 * caption beneath it (e.g. "TOP 10" / "7 of the top 10 first-run strips").
 *
 * Authored structure (.plain.html), one row per stat:
 *   cell 1: the big value/number (heading)
 *   cell 2: the caption/description
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];

    const value = document.createElement('span');
    value.className = 'stats-value';
    if (cells[0]) value.append(...cells[0].childNodes);
    li.append(value);

    if (cells[1]) {
      const desc = document.createElement('span');
      desc.className = 'stats-desc';
      desc.append(...cells[1].childNodes);
      li.append(desc);
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
