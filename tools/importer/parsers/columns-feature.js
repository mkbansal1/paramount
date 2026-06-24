/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://www.paramount.com/careers/life-at-paramount
 *   (.wrapper-media-card .media-card-container)
 * Generated: 2026-06-22
 *
 * The careers "media card" feature blocks: a stack of alternating image + text
 * rows. Each row has a content column (eyebrow label + heading + body + optional
 * CTA) and an image column. One `.wrapper-media-card` wrapper can hold several
 * `.media-card-container` rows.
 *
 * Block structure (columns convention): 2 columns, one row per feature.
 *   Row 1 = block name. Each subsequent row has 2 cells:
 *     cell 1 = image
 *     cell 2 = eyebrow (em) + heading + body paragraph(s) + optional CTA link
 *
 * Source DOM per feature (.media-card-container):
 *   .media-content-block .eyebrow-text            -> eyebrow label
 *   .media-content-block .media-title-txt h2/h3   -> heading
 *   .media-content-block (.media-card-desc / p)   -> body copy
 *   .media-content-block a[href]                  -> optional CTA
 *   .media-img-block img                          -> feature image
 */
function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return `https://www.paramount.com${src.startsWith('/') ? src : `/${src}`}`;
}

export default function parse(element, { document }) {
  let rows = Array.from(element.querySelectorAll('.media-card-container'));

  // History/timeline carousel variant (e.g. internships "Kick-start your career"):
  // a single image + text feature inside a slick slider. Synthesize one row from
  // the first non-cloned text slide + banner image so it maps to a feature row.
  if (rows.length === 0 && element.querySelector('.timelineCarousel-text-slider, .timeline-slide-content-wrapper')) {
    const textSlide = element.querySelector(
      '.timelineCarousel-text-slider .slick-slide:not(.slick-cloned), .timeline-slide-content-wrapper',
    ) || element;
    const imgSlide = element.querySelector(
      '.timelineCarousel-image-slider .slick-slide:not(.slick-cloned), .timeline-img-wrapper, .timeline-video-imgCanvas',
    );
    const synthetic = document.createElement('div');
    synthetic.className = 'media-card-container';
    const contentBlock = document.createElement('div');
    contentBlock.className = 'media-content-block';
    if (textSlide) {
      Array.from(textSlide.querySelectorAll('h1, h2, h3, h4, p')).forEach((n) => {
        if ((n.textContent || '').trim()) contentBlock.append(n.cloneNode(true));
      });
    }
    const imgBlock = document.createElement('div');
    imgBlock.className = 'media-img-block';
    const realImg = imgSlide && imgSlide.querySelector('img');
    if (realImg) imgBlock.append(realImg.cloneNode(true));
    synthetic.append(imgBlock, contentBlock);
    rows = [synthetic];
  }

  if (rows.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  rows.forEach((row) => {
    const content = row.querySelector('.media-content-block') || row;

    // Image cell (skip the hidden inline title image marked d-none).
    const imgEl = Array.from(row.querySelectorAll('.media-img-block img, img'))
      .find((img) => !img.closest('.d-none') && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(img.getAttribute('src') || ''));
    let img = '';
    if (imgEl) {
      img = document.createElement('img');
      img.setAttribute('src', absolutize(imgEl.getAttribute('src')));
      img.setAttribute('alt', imgEl.getAttribute('alt') || '');
    }

    // Content cell: eyebrow + heading + body + CTA.
    const contentCell = [];
    const eyebrow = content.querySelector('.eyebrow-text');
    const eyebrowText = eyebrow ? (eyebrow.textContent || '').trim() : '';
    if (eyebrowText) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = eyebrowText;
      p.append(em);
      contentCell.push(p);
    }

    const heading = content.querySelector('.media-title-txt h2, .media-title-txt h3, .media-title-txt h4, h2, h3');
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = (heading.textContent || '').trim();
      contentCell.push(h);
    }

    // Body copy: rich-text paragraphs (skip the eyebrow/heading containers).
    // Prefer a known body wrapper; otherwise fall back to all <p> in the content.
    const bodyWrap = content.querySelector('.media-card-desc, .media-content-txt, .media-desc, .rte-wrapper, .coh-wysiwyg') || content;
    Array.from(bodyWrap.querySelectorAll('p')).forEach((p) => {
      const t = (p.textContent || '').trim();
      if (t) {
        const np = document.createElement('p');
        np.textContent = t;
        contentCell.push(np);
      }
    });

    // Optional CTA link.
    const ctaSource = content.querySelector('a[href]');
    if (ctaSource) {
      const label = (ctaSource.querySelector('span')?.textContent || ctaSource.textContent || '').trim();
      if (label) {
        const a = document.createElement('a');
        a.setAttribute('href', ctaSource.getAttribute('href'));
        a.textContent = label;
        contentCell.push(a);
      }
    }

    if (!img && contentCell.length === 0) return;
    cells.push([img || '', contentCell.length ? contentCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
