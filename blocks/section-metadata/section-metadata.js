import { toClassName } from '../../scripts/aem.js';

export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) {
    block.remove();
    return;
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (key === 'style') {
      value.split(',').forEach((style) => {
        const cls = toClassName(style.trim());
        if (cls) section.classList.add(cls);
      });
    } else if (key) {
      section.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
  });

  block.remove();
}
