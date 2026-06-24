/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.paramount.com/about/businesses/advertising
 *   (.wrapper-latestNews-tile ul.latestNews-tile-list — "Latest News and Insights")
 * Generated: 2026-06-23
 *
 * News/insights cards: image + eyebrow label ("Read: ...") + title + description,
 * the whole card linking to the article.
 *
 * Block structure (cards convention): 2 columns, one row per card.
 *   Row 1 = block name. Each subsequent row:
 *     cell 1 = image (mandatory)
 *     cell 2 = eyebrow (em) + title (heading, linked) + description
 *
 * Source DOM per item (li):
 *   img.latest-tile-img                -> card image (desktop, skip mobile dup)
 *   span.eyebrow-text                  -> "Read: ..." label
 *   h6.latestNews-tile-heading         -> title
 *   p.latestNews-tile-desc             -> description
 *   a[href]                            -> article link (wraps the tile)
 */
function absolutize(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  return `https://www.paramount.com${src.startsWith('/') ? src : `/${src}`}`;
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > li, li.coh-list-item, li'));
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Image: desktop tile image (skip the d-lg-none mobile duplicate).
    const imgEl = Array.from(li.querySelectorAll('img.latest-tile-img, img'))
      .find((img) => !/d-lg-none/.test(img.className) && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(img.getAttribute('src') || ''))
      || li.querySelector('img');
    let img = '';
    if (imgEl) {
      img = document.createElement('img');
      img.setAttribute('src', absolutize(imgEl.getAttribute('src')));
      img.setAttribute('alt', imgEl.getAttribute('alt') || '');
    }

    const contentCell = [];
    const eyebrow = li.querySelector('.eyebrow-text');
    const eyebrowText = eyebrow ? (eyebrow.textContent || '').trim() : '';
    if (eyebrowText) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = eyebrowText;
      p.append(em);
      contentCell.push(p);
    }

    const titleEl = li.querySelector('.latestNews-tile-heading, h6, h5, h4, h3');
    const titleText = titleEl ? (titleEl.textContent || '').trim() : '';
    if (titleText) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      contentCell.push(h3);
    }

    const descEl = li.querySelector('.latestNews-tile-desc, p');
    const descText = descEl ? (descEl.textContent || '').trim() : '';
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      contentCell.push(p);
    }

    if (!img && contentCell.length === 0) return;
    cells.push([img || '', contentCell.length ? contentCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
