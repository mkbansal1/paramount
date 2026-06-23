import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Feature columns block (alternating image + text rows).
 *
 * Each row is a feature: one cell holds an image, the other holds an eyebrow
 * label + heading + body copy + optional CTA. Rows alternate image side
 * (left/right) automatically for a zig-zag layout.
 *
 * Authored structure (.plain.html), one row per feature:
 *   cell 1: image
 *   cell 2: eyebrow (em/strong) + heading + body paragraph(s) + optional CTA link
 * (Cell order may be reversed; the image cell is detected by its <picture>.)
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.classList.add('columns-feature-row');
    if (i % 2 === 1) row.classList.add('columns-feature-row-reverse');
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture')) cell.classList.add('columns-feature-media');
      else cell.classList.add('columns-feature-content');
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  });
}
