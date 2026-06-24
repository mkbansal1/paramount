/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Paramount section breaks and section metadata.
 * Driven by payload.template.sections from tools/importer/page-templates.json.
 *
 * Runs in afterTransform, AFTER block parsers have replaced the original source
 * section elements with block divs. Because the original section selectors no
 * longer exist at this point, section boundaries are located by the FIRST block
 * of each section (section.blocks[0]) — a class present on a parser-produced
 * block div (e.g. `.brand-hero`, `.columns-info`). For sections whose first
 * mapped block did not render (page variant lacks it), we fall back to the
 * original section.selector in case an ancestor wrapper survived.
 *
 * For each section (processed in reverse so earlier inserts don't shift later ones):
 *   - if it is not the first section, insert an <hr> before the section's anchor
 *   - if section.style is set, append a Section Metadata block after the anchor
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Return the first element matching any of the candidate selectors that has not
// already been claimed by an earlier section. The `used` set lets repeated
// selectors (e.g. two `.wrapper-leadership-list` sections on a content page)
// resolve to DISTINCT anchors instead of both collapsing onto the first match.
function firstUnused(element, selector, used) {
  if (!selector) return null;
  const matches = element.querySelectorAll(selector);
  for (let i = 0; i < matches.length; i += 1) {
    if (!used.has(matches[i])) return matches[i];
  }
  return null;
}

// Block parsers replace their source wrapper with a WebImporter block TABLE whose
// header cell holds the block name in Title Case (e.g. "columns-feature" ->
// "Columns Feature"). When a section's source selector is gone, locate the
// section by finding the unclaimed block table for its first mapped block.
function blockTableName(blockName) {
  return blockName
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function findBlockTables(element, blockName, used) {
  const wanted = blockTableName(blockName).toLowerCase();
  const out = [];
  element.querySelectorAll('table').forEach((table) => {
    if (used.has(table)) return;
    const header = table.querySelector('tr th, tr td');
    const label = header ? (header.textContent || '').trim().toLowerCase() : '';
    // header may include a variant in parens, e.g. "Cards (no images)".
    if (label === wanted || label.startsWith(`${wanted} `) || label.startsWith(`${wanted}(`)) {
      out.push(table);
    }
  });
  return out;
}

function findSectionAnchor(element, section, used) {
  // Prefer the original source selector. On pages where the section selector is
  // an ancestor wrapper that survives parsing (e.g. the homepage / content-page
  // leadership wrappers), this is the exact section boundary.
  const bySelector = firstUnused(element, section.selector, used);
  if (bySelector) return bySelector;

  // Fallback: the section's source element was itself replaced by a block parser
  // (e.g. brand-detail, where section.selector IS the block source). Locate the
  // section by its first mapped block (parser output that survives). The block
  // div is the section boundary — return it directly so the <hr> is inserted
  // immediately before it (do NOT walk up: sibling blocks from different sections
  // can share one parent wrapper, and walking up would collapse them together).
  const firstBlock = Array.isArray(section.blocks) && section.blocks.length ? section.blocks[0] : null;
  if (firstBlock) {
    const byBlock = firstUnused(element, `.${firstBlock}`, used);
    if (byBlock) return byBlock;
    // The parser may have replaced the wrapper with a WebImporter block table.
    const tables = findBlockTables(element, firstBlock, used);
    if (tables.length) return tables[0];
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Resolve each section's anchor in FORWARD (document) order, claiming matched
  // elements so a repeated selector (e.g. two `.wrapper-leadership-list` sections)
  // maps to distinct anchors instead of all collapsing onto the first match.
  //
  // A section flagged `repeat: true` expands to EVERY occurrence of its selector
  // (e.g. a content page with several leadership listings) — each occurrence
  // becomes its own section break. Expansion keeps document order so the <hr>
  // boundaries are inserted in the right places.
  const used = new Set();
  const resolved = [];
  sections.forEach((section) => {
    if (section.repeat) {
      // Expand to EVERY occurrence. Prefer the original selector; if a block
      // parser already replaced those wrappers (so the selector no longer
      // matches), fall back to the section's first mapped block class — each
      // parser-produced block div is its own occurrence/anchor.
      let matches = section.selector ? Array.from(element.querySelectorAll(section.selector)) : [];
      if (matches.length === 0) {
        const firstBlock = Array.isArray(section.blocks) && section.blocks.length ? section.blocks[0] : null;
        if (firstBlock) {
          matches = Array.from(element.querySelectorAll(`.${firstBlock}`));
          // Parser may have replaced the wrapper with a WebImporter block table.
          if (matches.length === 0) matches = findBlockTables(element, firstBlock, used);
        }
      }
      matches.forEach((match) => {
        if (used.has(match)) return;
        used.add(match);
        resolved.push({ section, target: match });
      });
      return;
    }
    const target = findSectionAnchor(element, section, used);
    if (target) used.add(target);
    resolved.push({ section, target });
  });

  // Sort resolved anchors by document position so <hr> boundaries land in order
  // regardless of the template's section declaration order.
  resolved.sort((a, b) => {
    if (!a.target || !b.target) return 0;
    const pos = a.target.compareDocumentPosition(b.target);
    if (pos & 2) return 1; // a follows b
    if (pos & 4) return -1; // a precedes b
    return 0;
  });

  // Apply <hr>/metadata in REVERSE so inserting nodes for later sections does
  // not disturb the position of earlier ones.
  for (let i = resolved.length - 1; i >= 0; i -= 1) {
    const { section, target } = resolved[i];
    if (!target) continue;

    // Append Section Metadata block after the section content when a style is defined.
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      target.after(metadataBlock);
    }

    // Insert a section break before every section except the first.
    if (i > 0) {
      const hr = doc.createElement('hr');
      target.before(hr);
    }
  }
}
