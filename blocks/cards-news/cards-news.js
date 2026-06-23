import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * News/insights card grid.
 *
 * Each card: image + eyebrow label ("Read: ...") + title + description, the whole
 * card linking to the article. Used by the advertising "Latest News and Insights".
 *
 * Authored structure (.plain.html), one row per card:
 *   cell 1: image
 *   cell 2: eyebrow (em) + title (heading) + description; a link carries the href.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-news-image';
      else div.className = 'cards-news-body';
    });

    // Make the whole card a single link if the body has one.
    const link = li.querySelector('.cards-news-body a[href]');
    if (link) {
      const href = link.getAttribute('href');
      const anchor = document.createElement('a');
      anchor.className = 'cards-news-link';
      anchor.href = href;
      // unwrap any inner anchors so we don't nest <a> inside <a>
      li.querySelectorAll('a[href]').forEach((a) => a.replaceWith(...a.childNodes));
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  });
  block.textContent = '';
  block.append(ul);
}
