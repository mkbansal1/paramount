/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the legal-terms title banner. Emits a `hero-page` block (reused).
 * Source: https://www.paramount.com/{legal-slug} (.header-text-container with an h1)
 * Generated: 2026-06-23
 *
 * Legal/policy pages open with a navy band holding a single white <h1> title
 * (no eyebrow). This is the same navy text-only page-hero used by content-page's
 * hero-page block. The shared hero-page parser captures h1-h3, so a dedicated
 * parser is not strictly required, but legal pages wrap the title in
 * `.header-text-container` (sometimes alongside a breadcrumb), so this parser
 * pulls just the visible title and emits a hero-page block + vista-navy section
 * metadata, mirroring press-hero.
 *
 * Block structure (hero library convention): 1 column, rows.
 *   Row 1 = block name. Row 2 = title text.
 */
export default function parse(element, { document }) {
  const titleContainer = element.querySelector('.header-text-container, .header-text') || element;

  // Visible page title. Skip the visually-hidden duplicate h1 the CMS injects.
  const titleEl = Array.from(titleContainer.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .find((h) => !h.classList.contains('visually-hidden') && (h.textContent || '').trim());
  const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

  // Empty-block guard: unwrap rather than emit an empty hero.
  if (!titleText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const h1 = document.createElement('h1');
  h1.textContent = titleText;

  const out = [];
  out.push(WebImporter.Blocks.createBlock(document, {
    name: 'hero-page',
    cells: [
      [[h1]],
      [''],
    ],
  }));

  // Navy banner styling (style="vista-navy"). The parser replaces the source
  // wrapper, so the sections transformer can't anchor metadata here — emit it
  // directly, mirroring press-hero / hero-page.
  out.push(WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: { style: 'vista-navy' },
  }));

  // Close off the navy banner section with an <hr> so the body that follows is
  // its own default (white) section. The legal title band is nested in the same
  // container as the body and body shapes vary (rich text vs PDF link list), so
  // owning the section break here is more robust than anchoring on a body selector.
  out.push(document.createElement('hr'));

  element.replaceWith(...out);
}
