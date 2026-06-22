/**
 * Brand hero.
 *
 * A single full-bleed brand banner: a large brand title/logo over an optional
 * full-bleed background image. Used at the top of brand-detail pages (e.g. MTV).
 *
 * Authored structure (.plain.html):
 *   row 1: [ image cell (background) ][ text cell: <h1>MTV</h1> ]
 * The background image is optional; when absent the block falls back to the
 * page text color (.no-image).
 */
export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
