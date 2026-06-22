import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Related-content show card grid.
 * Each card: portrait poster image + show title beneath, the whole tile links
 * to the show. Authored per row: cell 1 = poster image, cell 2 = title (with link).
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) {
        div.className = 'cards-show-card-image';
      } else {
        div.className = 'cards-show-card-body';
        // Add a right-arrow that reveals on hover (slides in beside the title),
        // matching the source's brand-tile-arr interaction.
        const arrow = document.createElement('span');
        arrow.className = 'cards-show-card-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        div.append(arrow);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
