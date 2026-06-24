/* eslint-disable */
/* global WebImporter */
/**
 * Parser for brand-hero. Base: hero.
 * Source: https://www.paramount.com/about/brands/mtv (.podcast-header-wrapper.header-with-video)
 * Generated: 2026-06-22
 *
 * Structure: full-bleed dark brand banner with an autoplaying background video
 * and the brand title overlaid.
 *
 * MEDIA HANDLING — brand heroes come in two variants:
 *   A) header-with-video: an autoplaying background <video> (desktop+mobile MP4).
 *      We emit a `video (autoplay)` block referencing the desktop MP4 link; the
 *      Video block decorator renders a muted, looping, autoplaying background.
 *   B) header-with-image: a full-width photo banner (no video). We capture the
 *      desktop banner <img> and place it in the brand-hero block as the banner.
 *   In both cases the breadcrumb is emitted FIRST and the brand title as the hero.
 *   Media URLs are root-relative on the source; we absolutize them to the
 *   canonical www.paramount.com host so they resolve at render time.
 *
 * Source DOM:
 *   h1.coh-heading                                   -> brand title
 *   video.heroMediaVid-video-desktop > source[src]   -> desktop background MP4
 *   img.desktop-image / .header-media img            -> desktop banner image
 */
const VIDEO_HOST = 'https://www.paramount.com';

function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return VIDEO_HOST + (src.startsWith('/') ? src : `/${src}`);
}

export default function parse(element, { document }) {
  // Brand title (live text).
  const title = element.querySelector('.header-text-container h1, h1.coh-heading, h1');

  // Locate the desktop background video MP4 (fall back to any mp4 source).
  let videoSrc = '';
  const desktopSource = element.querySelector(
    'video.heroMediaVid-video-desktop source[src], .heroMediaVid-video-desktop source[src]',
  );
  if (desktopSource) {
    videoSrc = desktopSource.getAttribute('src') || '';
  }
  if (!videoSrc) {
    const anyMp4 = Array.from(element.querySelectorAll('video source[src]'))
      .map((s) => s.getAttribute('src') || '')
      .find((s) => /\.mp4(\?|$)/i.test(s));
    if (anyMp4) videoSrc = anyMp4;
  }

  // For image-hero variants (header-with-image), capture the desktop banner image.
  // Prefer an explicit desktop-image, else the largest raster <img> in the hero.
  let bannerImg = null;
  if (!videoSrc) {
    const candidates = Array.from(element.querySelectorAll('img.desktop-image, .header-media img, img'))
      .filter((img) => {
        const src = img.getAttribute('src') || '';
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(src) && !/mobile/i.test(img.className);
      });
    const src = candidates.length ? (candidates[0].getAttribute('src') || '') : '';
    if (src) {
      bannerImg = document.createElement('img');
      bannerImg.setAttribute('src', absolutize(src));
      bannerImg.setAttribute('alt', title ? (title.textContent || '').trim() : '');
    }
  }

  // Breadcrumb trail (lives inside the hero wrapper on the source). Extract it
  // and emit it as the FIRST block so it renders ABOVE the hero/video, matching
  // the live page (where the breadcrumb sits at the top of the header).
  const breadcrumbOl = element.querySelector('ol.breadcrumb');
  let breadcrumbBlock = null;
  if (breadcrumbOl) {
    const items = Array.from(breadcrumbOl.querySelectorAll(':scope > li'));
    const cell = [];
    items.forEach((li) => {
      const link = li.querySelector('a[href]');
      const p = document.createElement('p');
      if (link) {
        const text = (link.textContent || '').trim();
        if (!text) return;
        const a = document.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = text;
        p.append(a);
      } else {
        const text = (li.textContent || '').trim();
        if (!text) return;
        p.textContent = text;
      }
      cell.push(p);
    });
    if (cell.length) {
      breadcrumbBlock = WebImporter.Blocks.createBlock(document, {
        name: 'breadcrumb',
        cells: [[cell]],
      });
    }
  }

  // Empty-block guard.
  if (!title && !videoSrc && !bannerImg && !breadcrumbBlock) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const out = [];

  // Block 0: breadcrumb (rendered above the hero).
  if (breadcrumbBlock) {
    out.push(breadcrumbBlock);
  }

  // Block 1: autoplay background video (Video block) referencing the MP4 link.
  if (videoSrc) {
    const videoLink = document.createElement('a');
    const href = absolutize(videoSrc);
    videoLink.setAttribute('href', href);
    videoLink.textContent = href;
    const videoBlock = WebImporter.Blocks.createBlock(document, {
      name: 'video (autoplay)',
      cells: [[videoLink]],
    });
    out.push(videoBlock);
  }

  // Block 2: brand-hero carrying the title (and, for image-hero variants, the
  // full-width banner image below the title).
  const contentCell = [];
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = (title.textContent || '').trim();
    contentCell.push(h1);
  }
  if (bannerImg) {
    contentCell.push(bannerImg);
  }
  const heroBlock = WebImporter.Blocks.createBlock(document, {
    name: 'brand-hero',
    cells: [[contentCell]],
  });
  out.push(heroBlock);

  element.replaceWith(...out);
}
