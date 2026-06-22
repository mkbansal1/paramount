import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured brands card grid with hover-reveal overlay.
 * Authored structure (per row): cell 1 = poster image, cell 2 = description + CTA link.
 * The CTA link text (e.g. "Visit Paramount + link") carries the brand name; we use it
 * as the prominent overlay title. On hover, a colored overlay slides up revealing the
 * brand name, description, and a CTA arrow.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  // Detect the related-brands variant: square tiles whose cards have NO description
  // paragraph (just a brand name + link). Homepage brand cards have descriptions.
  const hasDescriptions = [...block.children].some((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imageCell);
    return bodyCell && [...bodyCell.querySelectorAll('p')].some((p) => !p.querySelector('a'));
  });
  if (!hasDescriptions) block.classList.add('cards-brand-square');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imageCell);

    const li = document.createElement('li');

    // --- Poster image ---
    const imageWrap = document.createElement('div');
    imageWrap.className = 'cards-brand-card-image';
    if (imageCell) {
      while (imageCell.firstChild) imageWrap.append(imageCell.firstChild);
    }
    li.append(imageWrap);

    // --- Hover overlay ---
    const overlay = document.createElement('div');
    overlay.className = 'cards-brand-card-overlay';

    const content = document.createElement('div');
    content.className = 'cards-brand-card-overlay-content';

    const link = bodyCell ? bodyCell.querySelector('a') : null;
    const paragraphs = bodyCell
      ? [...bodyCell.querySelectorAll('p')].filter((p) => !p.querySelector('a'))
      : [];

    // Brand name from CTA link text: strip leading "Visit" and trailing "link".
    let brandName = '';
    if (link) {
      brandName = link.textContent
        .replace(/^\s*visit\s+/i, '')
        .replace(/\s+link\s*$/i, '')
        .trim();
    }
    if (brandName) {
      const title = document.createElement('h3');
      title.className = 'cards-brand-card-title';
      title.textContent = brandName;
      content.append(title);
    }

    // Description paragraph(s)
    paragraphs.forEach((p) => {
      const desc = document.createElement('p');
      desc.className = 'cards-brand-card-desc';
      desc.textContent = p.textContent;
      content.append(desc);
    });

    overlay.append(content);

    // CTA: make the whole tile clickable via the link href, with a visible arrow.
    if (link) {
      const cta = document.createElement('a');
      cta.className = 'cards-brand-card-cta';
      cta.href = link.getAttribute('href');
      cta.setAttribute('aria-label', brandName || link.textContent.trim());
      cta.innerHTML = '<span class="cards-brand-card-cta-arrow" aria-hidden="true"></span>';
      overlay.append(cta);
    }

    li.append(overlay);
    ul.append(li);
  });

  // Optimize poster images.
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
