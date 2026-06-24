/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-placeholder. Base: form-placeholder.
 * Source: https://www.paramount.com/about/businesses/advertising (.wrapper-ads-form)
 * Generated: 2026-06-23
 *
 * The "Get In Touch" contact section embeds a third-party Salesforce form
 * (an <iframe>) that cannot be migrated. We capture the heading + intro text +
 * social links and emit a single-cell block; the block JS renders a static,
 * disabled contact-form placeholder in place of the embed.
 *
 * Block structure: 1 column, 1 row.
 *   Row 1 = block name. Row 2 = heading + intro text + social links.
 *
 * Source DOM:
 *   h1..h4              -> "Get In Touch" heading
 *   p / .stay-connected -> intro text ("Stay connected")
 *   a[href]             -> social links (kept; the iframe form is dropped)
 */
export default function parse(element, { document }) {
  const cell = [];

  const heading = element.querySelector('h1, h2, h3, h4');
  if (heading && (heading.textContent || '').trim()) {
    const tag = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h4';
    const h = document.createElement(tag);
    h.textContent = (heading.textContent || '').trim();
    cell.push(h);
  }

  // Intro text (e.g. "Stay connected") — short paragraphs, skip the heading.
  Array.from(element.querySelectorAll('p')).forEach((p) => {
    const t = (p.textContent || '').trim();
    if (t && t.length < 120 && (!heading || t !== (heading.textContent || '').trim())) {
      const np = document.createElement('p');
      np.textContent = t;
      cell.push(np);
    }
  });

  // Social links (keep real external links; drop the iframe form).
  const socials = Array.from(element.querySelectorAll('a[href]'))
    .filter((a) => {
      const href = a.getAttribute('href') || '';
      return href && !href.startsWith('javascript:');
    });
  if (socials.length) {
    const ul = document.createElement('ul');
    socials.forEach((a) => {
      const href = a.getAttribute('href');
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', href);
      const label = (a.textContent || '').trim() || href.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      link.textContent = label;
      li.append(link);
      ul.append(li);
    });
    if (ul.children.length) cell.push(ul);
  }

  // Form-only blocks (e.g. contact-us / licensing) carry no heading/intro/links,
  // just input fields that cannot migrate. Emit a labeled static placeholder
  // rather than unwrapping (which would leak the raw field labels as a list).
  if (cell.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Contact form';
    cell.push(p);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-placeholder', cells: [[cell]] });
  element.replaceWith(block);
}
