# Paramount.com — Content-Page Template Migration Plan

## Objective
Migrate all pages classified under the **content-page** template (from the `paramount.com` sitemap analysis) to AEM Edge Delivery Services. Build the import infrastructure (parsers, transformers, import script), validate on a single representative page, then bulk-import the rest in batches of 25–50, reusing the design system and blocks already established by the homepage and brand-detail migrations.

> **Mode note:** This plan is built in Plan mode. Executing it (writing parsers/transformers/scripts, running imports, generating content) requires **Execute mode**.

## Confirmed Scope Decisions
1. **URL set — exclude brand pages.** Migrate the `content-page` group *minus* `/about/brands/*` (those are already covered by the dedicated `brand-detail` template and must not be overwritten). Target groups: corporate `/about/*` (non-brand), `/about/businesses/*`, `/careers/*` sub-pages, `/inclusion-impact/*`, and standalone one-off content pages (e.g. `compliance-resources`, `calm-act-certifications`, `digital-ads`, `emerging-talent-virtual-events`).
2. **Host rewrite.** The sitemap lists `cms.paramount.com`; canonical content is served at `www.paramount.com`. Rewrite host to `www.` before fetching/import (consistent with brand-detail).
3. **Pipeline.** Validate one representative page (single-page import + preview) before batching.
4. **Batch size.** 25–50 URLs per import batch, monitoring the report for 403s/redirects/rate-limiting.
5. **Excluded.** `/taxonomy/*` pages are NOT migrated (Drupal system pages); `/careers` landing and `careers-landing` template are out of scope (separate template).

## Reuse vs. New (against existing blocks)
- **Reuse as-is where they fit:** `breadcrumb`, `columns-info`, `columns-culture`, `cards-brand`, `cards-show`, `hero`, `video` (all already built).
- **Likely default content (no block):** stacked rich-text sections — headings, paragraphs, CTAs, link lists.
- **Net-new only if encountered:** an inner-page `hero`/page-header variant, `tabs`, or a generic link-list block — created only if a representative page actually needs it.
- **Cross-cutting (already solved):** `paramount-cleanup` (host shell removal, scoped nav, slider chrome, a11y duplicates) and `paramount-sections` transformers are reused; design tokens/fonts from the homepage carry over.

## Pre-Import Checklist (from brand-detail lessons)
- Validate each URL's final state (200 + expected title; drop 403s/redirects) before importing.
- Apply `cms → www` host rewrite.
- Anchor block `instances` on stable wrappers; keep section `selector` on the surviving wrapper (don't `replaceWith` the section boundary element).
- Verify below-the-fold images via DOM `complete/naturalWidth`, not a single screenshot.
- Preview path/port: verify on the local preview at `/content/...` (port may be 3001 if 3000 is bound).

## Checklist

### Phase 0 — URL list assembly
- [ ] Extract the full content-page URL set from the catalog, **excluding** `/about/brands/*`, `/taxonomy/*`, and the `/careers` landing
- [ ] Rewrite each URL host `cms.paramount.com` → `www.paramount.com`
- [ ] Pre-validate every URL (200 + real title, not 403/redirect); drop invalid ones
- [ ] Write the cleaned list to `tools/importer/urls-content-page.txt` and report the final count

### Phase 1 — Analyze representative page
- [ ] Run page analysis on a representative URL (`/about/board-of-directors` or `/about/businesses/cbs-media-ventures`)
- [ ] Confirm sections, default-content vs. block boundaries, and whether any net-new block/variant is required
- [ ] Spot-check a second structural variant (e.g. `/inclusion-impact/sustainability`) for coverage gaps

### Phase 2 — Build import infrastructure
- [ ] Add the `content-page` template entry (blocks + sections) to `tools/importer/page-templates.json`
- [ ] Reuse/create parsers as needed in `tools/importer/parsers/`
- [ ] Reuse `paramount-cleanup` + `paramount-sections` transformers (extend only if a new pattern appears)
- [ ] Create `tools/importer/import-content-page.js` (modeled on `import-brand-detail.js`) and its bundle

### Phase 3 — Validate on one page
- [ ] Single-page import of the representative URL
- [ ] Preview the rendered page and compare against live `www.paramount.com`
- [ ] Fix parser/transformer/section issues; re-import until clean

### Phase 4 — Batch import
- [ ] Bulk-import remaining URLs in batches of 25–50
- [ ] After each batch, review the import report for failures/empties and re-run drops
- [ ] Confirm content files land under the correct paths in `content/`

### Phase 5 — Style & critique
- [ ] Visual critique of content-page blocks vs. live pages; fix CSS to match
- [ ] Final spot-check across a sample of imported pages (about / businesses / careers-sub / inclusion-impact)
- [ ] Summarize migrated page count and any skipped/failed URLs

## Notes & Open Items
- Exact final URL count is determined in Phase 0 after host-rewrite + validation (scope report estimates ~36–60 for this group once brands and taxonomy are excluded).
- If Phase 1 reveals a genuinely new structure (e.g. an inner-page hero distinct from the homepage carousel), I'll create a minimal new variant rather than overload an existing block.
- Header/footer/global navigation are out of scope here (separate orchestrated migration).
