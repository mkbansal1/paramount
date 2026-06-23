/**
 * Definition list block.
 *
 * A multi-column grid of term + definition pairs (e.g. the careers benefits
 * "Encouraging Wellness" list). No images or icons.
 *
 * Authored structure (.plain.html), one row per item:
 *   cell 1: the term (often bold)
 *   cell 2: the definition / description
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');

    const term = document.createElement('div');
    term.className = 'definition-list-term';
    if (cells[0]) term.append(...cells[0].childNodes);
    li.append(term);

    if (cells[1]) {
      const def = document.createElement('div');
      def.className = 'definition-list-def';
      def.append(...cells[1].childNodes);
      li.append(def);
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
