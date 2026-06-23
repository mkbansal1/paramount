import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // De-duplicate the redundant CTA: many cards end with a paragraph whose only
  // content is a link repeating the card's heading text (e.g. heading "Streaming"
  // followed by a "Streaming" link). Promote the link onto the heading and drop
  // the duplicate trailing paragraph so the title isn't shown twice.
  ul.querySelectorAll('.cards-card-body').forEach((body) => {
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading || heading.querySelector('a')) return;
    const ctaP = [...body.querySelectorAll('p')].find((p) => {
      const a = p.querySelector(':scope > a');
      return a && p.textContent.trim() === a.textContent.trim();
    });
    if (!ctaP) return;
    const link = ctaP.querySelector('a');
    if (link.textContent.trim().toLowerCase() !== heading.textContent.trim().toLowerCase()) return;
    const a = document.createElement('a');
    a.href = link.href;
    a.append(...heading.childNodes);
    heading.append(a);
    ctaP.remove();
  });

  block.replaceChildren(ul);
}
