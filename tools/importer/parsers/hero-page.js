/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-page. Base: hero.
 * Source: https://www.paramount.com/about/board-of-directors (text-only),
 *   /about/history (header-with-image), /about/businesses/see-it-now-studios
 *   (header-with-video).
 * Generated: 2026-06-22
 *
 * Interior page hero for the content-page template. Anchored on the stable
 * `.podcast-header-wrapper`, it covers three source variants:
 *   - header-text-only : solid navy banner, no media -> navy section styling.
 *   - header-with-image: full-width photo banner -> image placed in the hero.
 *   - header-with-video: autoplaying background MP4 -> emitted as a video block.
 * In every variant the breadcrumb (when present) is emitted FIRST as its own
 * block so it renders above the title, then the hero-page block with the title.
 *
 * Block structure (hero library convention): 1 column, 3 rows.
 *   Row 1 = block name. Row 2 = background image (optional). Row 3 = title.
 *
 * Source DOM:
 *   ol.breadcrumb li.breadcrumb-item > a[href]              -> ancestor crumb (link)
 *   ol.breadcrumb li.breadcrumb-item > span.breadcrumb-last -> current crumb (text)
 *   .header-text-container h1.coh-heading                   -> page title
 *   video.heroMediaVid-video-desktop source[src]            -> desktop MP4 (video variant)
 *   img.desktop-image / .header-media img                   -> banner image (image variant)
 */
const MEDIA_HOST = 'https://www.paramount.com';

function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return MEDIA_HOST + (src.startsWith('/') ? src : `/${src}`);
}

export default function parse(element, { document }) {
  // Breadcrumb trail (ol.breadcrumb inside the hero wrapper). Emit it as the
  // FIRST block so it renders above the title, matching the live page.
  const breadcrumbOl = element.querySelector('ol.breadcrumb');
  let breadcrumbBlock = null;
  if (breadcrumbOl) {
    const items = Array.from(breadcrumbOl.querySelectorAll(':scope > li, li.breadcrumb-item'));
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
        const span = li.querySelector('.breadcrumb-last, span') || li;
        const text = (span.textContent || '').trim();
        if (!text) return;
        p.textContent = text;
      }
      if (p.childNodes.length || p.textContent) cell.push(p);
    });
    if (cell.length) {
      breadcrumbBlock = WebImporter.Blocks.createBlock(document, {
        name: 'breadcrumb',
        cells: [[cell]],
      });
    }
  }

  // Eyebrow / subtitle line that sits above the page title (e.g. calm-act's
  // "Commercial Advertisement Loudness Mitigation Act"). Optional.
  const eyebrowEl = element.querySelector('.header-text-container .eyebrow-text, .header-text .eyebrow-text, p.eyebrow-text');
  const eyebrowText = eyebrowEl ? (eyebrowEl.textContent || '').trim() : '';

  // Page title (live text). Most heroes have a single h1; the /about-style
  // hero-sec stacks several heading lines (e.g. "UNLEASHING" / "The POWER OF" /
  // "CONTENT"). Capture every heading inside the hero text container in order.
  const titleContainer = element.querySelector('.header-text-container, .header-text, .hero-sec-content, .hero-text-container')
    || element;
  const titleHeadings = Array.from(titleContainer.querySelectorAll('h1, h2, h3'))
    .filter((h) => !h.closest('ol.breadcrumb') && (h.textContent || '').trim());
  const titleText = titleHeadings.length
    ? titleHeadings.map((h) => (h.textContent || '').trim()).join(' ')
    : '';

  // Background video (header-with-video): prefer the desktop MP4 source.
  let videoSrc = '';
  const desktopSource = element.querySelector(
    'video.heroMediaVid-video-desktop source[src], .heroMediaVid-video-desktop source[src]',
  );
  if (desktopSource) videoSrc = desktopSource.getAttribute('src') || '';
  if (!videoSrc) {
    const anyMp4 = Array.from(element.querySelectorAll('video source[src]'))
      .map((s) => s.getAttribute('src') || '')
      .find((s) => /\.mp4(\?|$)/i.test(s));
    if (anyMp4) videoSrc = anyMp4;
  }

  // Background image (header-with-image): the desktop banner photo.
  let bannerImg = null;
  if (!videoSrc) {
    const candidate = Array.from(element.querySelectorAll('img.desktop-image, .header-media img, .header-image img, img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(src) && !/mobile/i.test(img.className);
      });
    const src = candidate ? (candidate.getAttribute('src') || '') : '';
    if (src) {
      bannerImg = document.createElement('img');
      bannerImg.setAttribute('src', absolutize(src));
      bannerImg.setAttribute('alt', titleText || '');
    }
  }

  // Empty-block guard.
  if (!breadcrumbBlock && !titleText && !eyebrowText && !videoSrc && !bannerImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const out = [];
  if (breadcrumbBlock) out.push(breadcrumbBlock);

  // Background video variant: emit a Video (autoplay) block before the hero.
  if (videoSrc) {
    const href = absolutize(videoSrc);
    const videoLink = document.createElement('a');
    videoLink.setAttribute('href', href);
    videoLink.textContent = href;
    out.push(WebImporter.Blocks.createBlock(document, {
      name: 'video (autoplay)',
      cells: [[videoLink]],
    }));
  }

  // Title content row. Eyebrow/subtitle (when present) sits above the title.
  const contentCell = [];
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = eyebrowText;
    contentCell.push(eyebrow);
  }
  if (titleHeadings.length) {
    // Emit the primary line as h1 and any additional stacked lines as h2 so the
    // full multi-line hero title is preserved (e.g. UNLEASHING / The POWER OF / CONTENT).
    titleHeadings.forEach((h, i) => {
      const el = document.createElement(i === 0 ? 'h1' : 'h2');
      el.textContent = (h.textContent || '').trim();
      contentCell.push(el);
    });
  } else if (titleText) {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    contentCell.push(h1);
  }

  // Title band first (navy), then the full-width banner image below it. Matches
  // the live interior hero where the title sits on a dark band above the image.
  const heroBlock = WebImporter.Blocks.createBlock(document, {
    name: 'hero-page',
    cells: [
      [contentCell.length ? contentCell : ''],
      [bannerImg || ''],
    ],
  });
  out.push(heroBlock);

  // Navy section styling. On this site the interior page hero always sits on a
  // dark navy band — text-only banners are fully navy, and image banners show
  // the title on a navy band above the image. Only the video hero supplies its
  // own dark backdrop, so it is left un-styled. This parser replaces the source
  // wrapper, so the sections transformer can't anchor a Section Metadata block —
  // emit it directly.
  if (!videoSrc) {
    out.push(WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: { style: 'vista-navy' },
    }));
  }

  element.replaceWith(...out);
}
