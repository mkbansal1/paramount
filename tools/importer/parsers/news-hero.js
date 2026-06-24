/* eslint-disable */
/* global WebImporter */
/**
 * Parser for news-hero. Base: hero.
 * Source: https://www.paramount.com/news/* (.wrapper-news-banner)
 * Generated: 2026-06-23
 *
 * Editorial article header. The live banner stacks a date + topic eyebrow, the
 * article title, a short intro paragraph, and a banner image (image may sit left
 * or right of the text via the `news-banner-img-right` modifier).
 *
 * Block structure (hero library convention): 1 column, rows.
 *   Row 1 = block name. Row 2 = banner image (optional). Row 3 = eyebrow + title + intro.
 *
 * Source DOM:
 *   .eyebrow-text .news-date            -> date (e.g. "Jul 15, 2025")
 *   .eyebrow-text .news-topic           -> topic label (e.g. "Company News")
 *   .news-banner-text h5.coh-heading    -> article title
 *   .news-banner-body p                 -> intro paragraph
 *   img#article-header-top (desktop)    -> banner image (skip mobile/left-right dups)
 */
const MEDIA_HOST = 'https://www.paramount.com';

function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return MEDIA_HOST + (src.startsWith('/') ? src : `/${src}`);
}

export default function parse(element, { document }) {
  // Banner image: the live desktop layout is a two-column banner (text left,
  // image right) that shows the SQUARE 720x720 crop (#article-header-left-right).
  // The wide #article-header-top (1920x640) crop is hidden on desktop, so prefer
  // the square one; fall back to any non-mobile image, then the wide crop.
  const imgEl = element.querySelector('img#article-header-left-right')
    || Array.from(element.querySelectorAll('.news-banner-image img, img'))
      .find((img) => !/d-md-none|news-banner-m-img/.test(img.className))
    || element.querySelector('img#article-header-top')
    || element.querySelector('img');
  let bannerImg = null;
  if (imgEl) {
    bannerImg = document.createElement('img');
    bannerImg.setAttribute('src', absolutize(imgEl.getAttribute('src')));
    bannerImg.setAttribute('alt', imgEl.getAttribute('alt') || '');
  }

  const contentCell = [];

  // Eyebrow line: "DATE · TOPIC".
  const date = element.querySelector('.news-date');
  const topic = element.querySelector('.news-topic');
  const eyebrowParts = [date, topic]
    .map((n) => (n && (n.textContent || '').trim()) || '')
    .filter(Boolean);
  if (eyebrowParts.length) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = eyebrowParts.join(' • ');
    p.append(em);
    contentCell.push(p);
  }

  // Title.
  const titleEl = element.querySelector('.news-banner-text h5, .news-banner-text-content h5, h5.coh-heading, h1, h2, h3');
  const titleText = titleEl ? (titleEl.textContent || '').trim() : '';
  if (titleText) {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    contentCell.push(h1);
  }

  // Intro paragraph.
  const introEl = element.querySelector('.news-banner-body p, .news-banner-body');
  const introText = introEl ? (introEl.textContent || '').trim() : '';
  if (introText) {
    const p = document.createElement('p');
    p.textContent = introText;
    contentCell.push(p);
  }

  // Empty-block guard.
  if (!bannerImg && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const heroBlock = WebImporter.Blocks.createBlock(document, {
    name: 'news-hero',
    cells: [
      [bannerImg || ''],
      [contentCell.length ? contentCell : ''],
    ],
  });

  element.replaceWith(heroBlock);
}
