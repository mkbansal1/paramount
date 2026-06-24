/* eslint-disable */
/* global WebImporter */
/**
 * Parser for PRNewswire financial data tables on offer/tender press releases
 * (e.g. the "Type of Offer / CUSIP / Aggregate Principal Amount" tables on the
 * note tender & exchange offer releases).
 * Source: .content-table-wrapper > table.prnbcc (inside .press-template-content).
 * Generated: 2026-06-23
 *
 * Why this exists: the source tables have multi-line cells (CUSIP/ISIN codes
 * stacked with <br>, multi-paragraph headers). The importer converts default
 * content to GFM markdown, which CANNOT represent line breaks inside a table
 * cell, so the whole table was being dropped on import. This parser rebuilds
 * each table as a clean semantic <table> with single-line cells (stacked values
 * joined with " / "), which survives the markdown round-trip and renders as a
 * default-content table in EDS.
 *
 * Footnote/separator tables (a single "__________" cell + numbered notes) are
 * rebuilt as simple paragraphs rather than tables.
 */

// Collapse a cell's content to a single line: join <br>- and <p>-separated
// fragments with " / ", drop footnote superscripts' parentheses noise, squeeze
// whitespace. Keeps it GFM-safe (no newlines, no pipes).
function cellText(cell) {
  // Collapse the cell to a single line. <br> and block boundaries in these
  // PRNewswire cells are visual line-wraps (headers) or stacked codes (CUSIP/
  // ISIN), so a plain space join reads correctly in both cases. Pipes are
  // replaced (they would break a GFM/markdown table cell).
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  clone.querySelectorAll('p, div').forEach((b) => {
    if (b.nextSibling) b.append(' ');
  });
  return (clone.textContent || '').replace(/\s+/g, ' ').trim().replace(/\|/g, '/');
}

// Footnote / separator tables are NOT data tables: PRNewswire renders footnotes
// as a narrow 1- or 2-column table (a "________" separator row, or a footnote
// marker like "1"/"2" + the note text). These must become paragraphs, not a
// rendered data table (otherwise they show as a table with empty headers).
function isFootnoteTable(rows) {
  if (!rows.length) return false;
  const firstText = (rows[0].textContent || '').trim();
  if (/^_+$/.test(firstText)) return true; // pure underscore separator

  // Consider only rows that have any text (PRNewswire pads these blocks with
  // fully-empty spacer rows). A footnote block is one where every CONTENTFUL row
  // is a marker + note: at most 2 columns, with a leading column that is empty or
  // a short numeric/symbol footnote marker (e.g. "1", "(2)", "*"). A genuine data
  // table (>=3 populated columns, real header text) fails this and renders.
  const contentful = rows.filter((tr) => (tr.textContent || '').trim());
  if (!contentful.length) return false;
  return contentful.every((tr) => {
    const cells = Array.from(tr.children).filter((c) => (c.textContent || '').trim());
    if (cells.length > 2) return false;
    const lead = (cells[0]?.textContent || '').trim();
    return /^[_*]+$/.test(lead) || /^\(?\d{1,2}\)?[.)]?$/.test(lead);
  });
}

export default function parse(element, { document }) {
  const srcTable = element.querySelector('table');
  if (!srcTable) {
    element.remove();
    return;
  }
  const rows = Array.from(srcTable.querySelectorAll('tr'));
  if (!rows.length) {
    element.remove();
    return;
  }

  // Footnote/separator tables -> plain paragraphs.
  if (isFootnoteTable(rows)) {
    const out = [];
    rows.forEach((tr) => {
      const txt = Array.from(tr.children).map((c) => cellText(c)).filter(Boolean).join(' ').trim();
      if (txt && !/^_+$/.test(txt)) {
        const p = document.createElement('p');
        p.textContent = txt;
        out.push(p);
      }
    });
    if (out.length) element.replaceWith(...out);
    else element.remove();
    return;
  }

  // Data table -> a `table` BLOCK (WebImporter block table). We deliberately use
  // a block (not a bare <table>): the importer turns any default-content <table>
  // into a block named after its first header cell, which produced inconsistent,
  // non-existent block names per page (e.g. "type-of-offer",
  // "existing-tender-offer-notes-to-be-tendered"). Emitting a real `table` block
  // with a fixed name gives every offer page the same renderable block.
  //
  // The block's first row is the block name ("Table"); the remaining rows are the
  // data. Each data row is one cell array (the columns), so createBlock builds a
  // grid matching the source columns.
  const dataRows = rows.map((tr) => Array.from(tr.children).map((cell) => {
    const div = document.createElement('div');
    div.textContent = cellText(cell);
    return div;
  }));

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Table',
    cells: dataRows,
  });
  element.replaceWith(block);
}
