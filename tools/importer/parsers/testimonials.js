/* eslint-disable */
/* global WebImporter */
/**
 * Parser for testimonials. Base: testimonials.
 * Source: https://www.paramount.com/careers/internships
 *   (.card-slide-item inside a slick card carousel — "Hear from our former interns")
 * Generated: 2026-06-22
 *
 * No EDS library convention for "testimonials" — structure inferred from source.
 * Quote cards: person name + role + quote. The source is a slick carousel that
 * CLONES slides, so duplicates are removed by name.
 *
 * Block structure: 2 columns, one row per testimonial.
 *   Row 1 = block name. Each subsequent row:
 *     cell 1 = name (heading)
 *     cell 2 = role + quote (paragraphs)
 *
 * Source DOM per card (.card-slide-item):
 *   .card-carousel-title h2          -> name
 *   .card-carousel-body-wrapper p    -> role (in <strong>) + quote paragraphs
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.card-slide-item'));
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const seen = new Set();
  cards.forEach((card) => {
    const nameEl = card.querySelector('.card-carousel-title h2, .card-carousel-title, h2, h3');
    const name = nameEl ? (nameEl.textContent || '').trim() : '';
    if (!name || seen.has(name)) return; // de-dupe slick clones
    seen.add(name);

    const nameCell = [];
    const h = document.createElement('h3');
    h.textContent = name;
    nameCell.push(h);

    const bodyCell = [];
    const body = card.querySelector('.card-carousel-body-wrapper');
    if (body) {
      Array.from(body.querySelectorAll('p')).forEach((p) => {
        const t = (p.textContent || '').trim();
        if (!t) return;
        const np = document.createElement('p');
        // Preserve the role line (first <strong>) as bold.
        const strong = p.querySelector('strong');
        if (strong && (strong.textContent || '').trim() === t) {
          const s = document.createElement('strong');
          s.textContent = t;
          np.append(s);
        } else {
          np.textContent = t;
        }
        bodyCell.push(np);
      });
    }

    cells.push([nameCell, bodyCell.length ? bodyCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'testimonials', cells });
  element.replaceWith(block);
}
