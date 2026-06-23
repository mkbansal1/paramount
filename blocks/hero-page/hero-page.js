/**
 * Page hero (text-only banner) for the content-page template.
 *
 * A simple title banner that holds an (optional) breadcrumb plus a large page
 * title. By default it has no background media; the navy banner styling is
 * applied via section metadata (e.g. style="vista-navy") around the block.
 *
 * Authored structure (.plain.html):
 *   row 1: text cell with the page title heading (and optionally a breadcrumb
 *          block placed above it in the same section).
 * If a background image is authored it is placed as the first cell.
 */
export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
