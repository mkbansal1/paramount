/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.paramount.com/
 * Generated: 2026-06-22
 *
 * Block structure (from library-description.txt): 2 columns, multiple rows.
 *   Row 1 = block name. Each subsequent row = one slide:
 *     cell 1 = slide image (mandatory), cell 2 = optional text content.
 *
 * userDecisions honored (authoring-analysis.json):
 *   - heroSlides: slides are IMAGE-ONLY (5 slides, no per-slide text/CTA).
 *   - heroZAxisLayering / decoratedHeadlines: the decorative background
 *     "WE ARE" text and the foreground "Paramount — A Skydance Corporation"
 *     wordmark are recreated as LIVE TEXT (not carried as images). They are
 *     placed in the optional text cell of the first slide row so the parser
 *     captures them; CSS recreates the 3 z-layers.
 */
export default function parse(element, { document }) {
  // Slides: each `.slide` holds responsive <img> variants (desktop d-lg-inline-block,
  // mobile d-lg-none). Use the first image per slide (prefer the desktop variant).
  const slideContainers = Array.from(element.querySelectorAll('.hero-slider .slick-slide .slide, .hero-slider .slide'));

  // Deduplicate slick clones: slick may inject duplicate slides. Track by image src.
  const seenSrc = new Set();
  const slideImages = [];
  slideContainers.forEach((slide) => {
    const img = slide.querySelector('img.d-lg-inline-block, img');
    if (img && img.src && !seenSrc.has(img.src)) {
      seenSrc.add(img.src);
      slideImages.push(img);
    }
  });

  // Empty-block guard: if no slides found, unwrap.
  if (slideImages.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Recreate the z-layer decorative text as live text (user decision).
  const bgHeading = document.createElement('h2');
  bgHeading.textContent = 'We Are';

  const wordmark = document.createElement('p');
  const wordmarkStrong = document.createElement('strong');
  wordmarkStrong.textContent = 'Paramount';
  wordmark.appendChild(wordmarkStrong);
  const tagline = document.createElement('p');
  tagline.textContent = 'A Skydance Corporation';

  const cells = [];
  slideImages.forEach((img, index) => {
    if (index === 0) {
      // First slide carries the recreated z-layer text in the optional text cell.
      cells.push([img, [bgHeading, wordmark, tagline]]);
    } else {
      // Remaining slides are image-only; pad cell 2 to keep 2-column consistency.
      cells.push([img, '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
