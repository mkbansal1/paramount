import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * People card grid (leadership / board of directors).
 *
 * Each card is a person tile: a headshot image plus a name (heading) and a
 * role/title line. The whole tile links to that person's detail page.
 *
 * Authored structure (.plain.html), one row per person:
 *   cell 1: headshot image
 *   cell 2: name (heading) + role text; the name (or a link in the cell) carries
 *           the destination URL for the tile.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-people-card-image';
      else div.className = 'cards-people-card-body';
    });

    // Make the whole tile a link when the body contains one (point to person page).
    const link = li.querySelector('.cards-people-card-body a[href]');
    if (link) {
      const href = link.getAttribute('href');
      const anchor = document.createElement('a');
      anchor.className = 'cards-people-card-link';
      anchor.href = href;
      // unwrap the inner anchor so we don't nest <a> inside <a>
      link.replaceWith(...link.childNodes);
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
