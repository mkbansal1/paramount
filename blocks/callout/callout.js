/**
 * Callout block.
 *
 * A left-aligned promo band: a large display heading, supporting text, and a
 * large plain-text "Learn More" call-to-action link with a trailing arrow —
 * e.g. the "Case Study Library" / "Advertise With Us" panels on the
 * advertising Insights page. Light-grey background.
 *
 * Authored structure (.plain.html): a single cell holding the heading, text,
 * and a call-to-action link.
 */
export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div') || block;
  inner.classList.add('callout-content');

  // The CTA is a large plain text link (not a pill button). EDS may have
  // auto-decorated the standalone link as a .button — strip that styling and
  // mark it as the callout's text CTA instead.
  const link = block.querySelector('a[href]');
  if (link) {
    link.classList.remove('button');
    link.classList.add('callout-cta');
    const wrapper = link.closest('p');
    if (wrapper) wrapper.classList.remove('button-container', 'button-wrapper');
  }
}
