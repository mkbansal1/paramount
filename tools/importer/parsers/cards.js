/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards (no images variant). Base: cards.
 * Source: https://www.paramount.com/about/businesses/cbs-media-ventures
 *   (.wrapper-text-col-with-links ul.text-col-link-list)
 * Generated: 2026-06-22
 *
 * The "More businesses" link grid: a list of items, each a title + short
 * description, the whole item linking to another page. There are NO images, so
 * this maps to the cards "no images" convention (1 column, multiple rows).
 *
 * Block structure (cards no-images convention): 1 column, multiple rows.
 *   Row 1 = block name with the "(no images)" variant. Each subsequent row = one
 *   card: a single cell with heading + description + linked CTA.
 *
 * Source DOM per item (li):
 *   > a[href]                                  -> item link (wraps title + desc)
 *   a .text-col-link-header h6.coh-heading      -> title
 *   a .text-col-link-desc / a p                 -> description (optional)
 */
export default function parse(element, { document }) {
  // `element` is usually the inner list (ul) mapped as an inner instance so the
  // source wrapper survives as the section boundary. Items are <li>, or — for the
  // advertising "value props" overlay — `.bg-overlay-inner` cards.
  let items = Array.from(element.querySelectorAll(':scope > li, li'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('.bg-overlay-inner'));
  }

  const cells = [];
  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Awards-filter shape (/news/awards result list): a category eyebrow plus the
    // award name, the whole item linking out. Emit the eyebrow as an emphasized
    // line above the linked award name.
    const awardEyebrow = li.querySelector('.filter-item-txt-container .eyebrow-text');
    const awardName = li.querySelector('.awards-filter-txt');
    if (awardName && (awardName.textContent || '').trim()) {
      const cell = [];
      const eyebrowText = awardEyebrow ? (awardEyebrow.textContent || '').trim() : '';
      if (eyebrowText) {
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = eyebrowText;
        p.append(em);
        cell.push(p);
      }
      const h3 = document.createElement('h3');
      const nameText = (awardName.textContent || '').trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = nameText;
        h3.append(a);
      } else {
        h3.textContent = nameText;
      }
      cell.push(h3);
      cells.push([cell]);
      return;
    }

    let titleEl = li.querySelector('.text-col-link-header h6, .text-col-link-header .coh-heading, h6.coh-heading, h4.coh-heading, h6, h4, h5, h3');
    let descEl = li.querySelector('.text-col-link-desc, .overlay-inner-desc, p');

    // Definition-list shape (e.g. benefits "Encouraging Wellness" multiline list):
    // <li><div.rte-wrapper><p><strong>Term</strong></p></div><div.rte-wrapper><p>Definition</p></div></li>
    // No heading element exists — promote the bold term to the title and use the
    // following paragraph as the description.
    if (!titleEl) {
      const strong = li.querySelector('strong, b');
      if (strong && (strong.textContent || '').trim()) {
        titleEl = strong;
        const wrappers = Array.from(li.querySelectorAll('.rte-wrapper, .coh-wysiwyg'));
        const descWrap = wrappers.length > 1 ? wrappers[1] : null;
        descEl = (descWrap && descWrap.querySelector('p')) || null;
        if (!descEl) {
          // fall back to the last paragraph that isn't the term
          const ps = Array.from(li.querySelectorAll('p')).filter((p) => !p.contains(strong));
          descEl = ps[0] || null;
        }
      }
    }

    const titleText = titleEl ? (titleEl.textContent || '').trim() : '';
    const descText = descEl ? (descEl.textContent || '').trim() : '';

    // Single cell: heading + description + CTA link (cards no-images layout).
    const cell = [];
    if (titleText) {
      const h3 = document.createElement('h3');
      // When the card has a link but NO separate description, the whole card is
      // just a linked title (e.g. the CALM Act PDF cards) — make the heading the
      // link rather than emitting a redundant duplicate CTA line below it.
      if (href && !descText) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      cell.push(h3);
    }
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      cell.push(p);
    }
    // Separate CTA line only when there is a description (title + body + link
    // cards, e.g. "More businesses"); otherwise the linked heading above suffices.
    if (href && descText) {
      const cta = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = titleText || href;
      cta.append(a);
      cell.push(cta);
    }

    if (cell.length === 0) return;
    cells.push([cell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The /news/awards "featured" grid renders as accent-blue cards with white
  // text (vs. the plain listing below it). Detect that list and emit a variant
  // modifier so only these three cards get the blue treatment.
  const isFeaturedAwards = element.matches('.featured-awards, .bold-tricolumn-list.featured-awards')
    || element.closest('.featured-awards-wrapper');
  const blockName = isFeaturedAwards ? 'cards (no images, awards-featured)' : 'cards (no images)';

  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  element.replaceWith(block);
}
