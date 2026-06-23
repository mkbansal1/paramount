/**
 * Testimonials block.
 *
 * A grid/carousel of quote cards — each a person's name, their role, and a quote.
 * Used for the careers internships "Hear from our former interns" section.
 *
 * Authored structure (.plain.html), one row per testimonial:
 *   cell 1: name (heading)
 *   cell 2: role + quote
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');

    const name = document.createElement('div');
    name.className = 'testimonials-name';
    if (cells[0]) name.append(...cells[0].childNodes);
    li.append(name);

    if (cells[1]) {
      const body = document.createElement('div');
      body.className = 'testimonials-body';
      body.append(...cells[1].childNodes);
      li.append(body);
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
