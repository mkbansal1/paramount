/**
 * News article hero (editorial banner) for the news-article template.
 *
 * Authored structure (.plain.html):
 *   row 1: banner image cell (optional)
 *   row 2: text cell — eyebrow (date • topic), the article <h1>, and an intro <p>
 *
 * Live design: a two-column banner with the lead image on one side and a yellow
 * text panel (navy text) on the other. The text panel carries the eyebrow, the
 * large title, and the intro paragraph.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows.find((r) => r.querySelector('picture'));
  const textRow = rows.find((r) => r !== imageRow);

  if (imageRow) imageRow.classList.add('news-hero-media');
  else block.classList.add('no-image');

  if (textRow) textRow.classList.add('news-hero-text');
}
