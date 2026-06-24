/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the press-release banner. Emits a `hero-page` block (reused as-is).
 * Source: https://www.paramount.com/press/* (.press-release-banner-wrapper)
 * Generated: 2026-06-23
 *
 * The press banner is the same navy text-only page-hero pattern used by the
 * content-page template's hero-page block, EXCEPT the press title is an <h5>
 * (content-page heroes use <h1>). The shared hero-page parser only captures
 * h1-h3, so this dedicated parser handles the press DOM and emits a hero-page
 * block so it renders with the existing hero-page block code/CSS.
 *
 * Block structure (hero library convention): 1 column, rows.
 *   Row 1 = block name. Row 2 = title text. Row 3 = optional banner image.
 *
 * Source DOM:
 *   .header-text-container p.eyebrow-text        -> eyebrow ("Paramount Press")
 *   .header-text-container h5                     -> press release title
 *   .header-media-image img / .header-media img   -> optional banner image
 */
const MEDIA_HOST = 'https://www.paramount.com';

function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return MEDIA_HOST + (src.startsWith('/') ? src : `/${src}`);
}

export default function parse(element, { document }) {
  const titleContainer = element.querySelector('.header-text-container, .header-text') || element;

  // Eyebrow label above the title (e.g. "Paramount Press").
  const eyebrowEl = titleContainer.querySelector('p.eyebrow-text, .eyebrow-text');
  const eyebrowText = eyebrowEl ? (eyebrowEl.textContent || '').trim() : '';

  // Press release title — an <h5> on the source. Fall back to any heading.
  const titleEl = titleContainer.querySelector('h1, h2, h3, h4, h5, h6');
  const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

  // Optional banner image (most press releases have none).
  let bannerImg = null;
  const imgEl = element.querySelector('.header-media-image img, .header-media img');
  const imgSrc = imgEl ? (imgEl.getAttribute('src') || '') : '';
  if (imgSrc) {
    bannerImg = document.createElement('img');
    bannerImg.setAttribute('src', absolutize(imgSrc));
    bannerImg.setAttribute('alt', imgEl.getAttribute('alt') || titleText || '');
  }

  // Empty-block guard.
  if (!eyebrowText && !titleText && !bannerImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = eyebrowText;
    contentCell.push(eyebrow);
  }
  if (titleText) {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    contentCell.push(h1);
  }

  const out = [];
  out.push(WebImporter.Blocks.createBlock(document, {
    name: 'hero-page',
    cells: [
      [contentCell.length ? contentCell : ''],
      [bannerImg || ''],
    ],
  }));

  // Navy banner styling. The press hero always sits on a dark navy band; this
  // parser replaces the source wrapper, so the sections transformer can't anchor
  // a Section Metadata block here — emit it directly (same as hero-page parser).
  out.push(WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: { style: 'vista-navy' },
  }));

  element.replaceWith(...out);
}
