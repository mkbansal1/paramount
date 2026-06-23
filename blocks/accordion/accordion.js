/**
 * Accordion block (FAQ-style expand/collapse).
 *
 * Authored structure (.plain.html), one row per item:
 *   cell 1: the question/summary text
 *   cell 2: the answer/body content
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const summaryContent = cells[0];
    const bodyContent = cells[1];
    if (!summaryContent || !bodyContent) return;

    const details = document.createElement('details');
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...summaryContent.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    body.append(...bodyContent.childNodes);

    details.append(summary, body);
    row.replaceWith(details);
  });
}
