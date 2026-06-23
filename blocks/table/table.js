/**
 * Table block — renders a data table from an authored/imported block grid.
 *
 * Authored structure (.plain.html): a `table` block whose rows are the table
 * rows and whose cells are the columns. The first row is treated as the header.
 * Used by press-release offer pages (Type of Offer / CUSIP / principal amount)
 * where the source PRNewswire <table> can't survive GFM-markdown conversion, so
 * the importer's offer-table parser emits this block instead.
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  [...block.children].forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    const isHeader = rowIdx === 0;
    [...row.children].forEach((cell) => {
      const el = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) el.setAttribute('scope', 'col');
      el.innerHTML = cell.innerHTML;
      tr.append(el);
    });
    (isHeader ? thead : tbody).append(tr);
  });

  block.textContent = '';
  block.append(table);
}
