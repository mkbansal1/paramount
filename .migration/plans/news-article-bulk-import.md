# News-Article Bulk Import Plan

## Objective
Migrate all Paramount.com `news-article` pages (~293 `/news/*` URLs discovered in the catalog) to AEM Edge Delivery Services. Build the news-article import infrastructure, validate on **3 candidate pages** first, then scale to the full set in batches — dropping any URL that returns 403 (a known issue on `/news/*`, per the brand-detail lessons).

> **Mode note:** This plan is built in Plan mode. Executing it (writing parsers/template/import script, bundling, running imports, generating content) requires **Execute mode**.

## What the warm-up (.migration folder) told me
- **Template defined, not yet built.** `template-catalog.json` defines `news-article` (*"Editorial article page: title/byline header, hero image, single-column rich-text body with inline images and pull quotes"*), but `page-templates.json` has **no** news-article entry and there is **no** `import-news-article.js`.
- **Reusable infra already exists:** transformers `paramount-cleanup.js` (scoped chrome removal, host shell, slider chrome, a11y dupes) and `paramount-sections.js` (selector-then-block-class section anchoring); parsers/blocks `hero-page`, `video`, `cards-show`, `cards-news`, `columns-info`, `breadcrumb`.
- **News article structure (from catalog `page-catalog.json`):** hero (title + lead image + intro), rich-text body with inline images, a `video` block mid-article, and a related-article `carousel` at the bottom. Body is largely **default content** (headings/paragraphs), not blocks.
- **Critical lessons (brand-detail) to apply up front:**
  - `/news/*` pages are **prone to 403 "Access Denied"** — pre-validate every URL (final URL == requested, `<title>` not `403 | Paramount`) and drop failures. *(This is the user's "some pages may 403 and can be ignored.")*
  - **Host rewrite** `cms.paramount.com` → `www.paramount.com` before fetching.
  - Anchor block `instances` on **stable wrapper** classes; keep section `selector` on a **surviving** wrapper (map blocks to inner elements) so sections don't merge.
  - Verify rendering on the local preview at `/content/...` (lessons note port 3001; will confirm the live port at execution).
  - Verify images via DOM (`img.complete && naturalWidth>0`), not one screenshot.
- **Project type `da`:** content is published to `content.da.live`; rendering blocks come from the library repo, so this effort is **import infrastructure + content**, not block JS/CSS authoring.

## Proposed 3 candidate pages (structural coverage)
Chosen to exercise the hero, rich-text body + inline images, the mid-article video, and the related carousel:
1. `https://www.paramount.com/news/john-halley-on-finding-opportunity-in-change` *(representative; has hero + body + video + carousel)*
2. `https://www.paramount.com/news/olivier-jollet-on-entertaining-the-planet-with-pluto-tv` *(2nd representative; hero + body + carousel, no video — coverage of the "no-video" variant)*
3. `https://www.paramount.com/news/jeff-probst-on-the-success-of-survivor` *(third structural sample to catch pull-quotes / image-heavy body variations)*

*(If any of these 403 at validation, I'll swap in the next available `/news/*` URL.)*

## Reuse vs. New
- **Reuse as-is:** `paramount-cleanup`, `paramount-sections` transformers; `video`, `cards-show`/`carousel` (related articles), `hero-page` (or a thin `news-hero` if the byline/eyebrow layout differs).
- **Likely default content (no block):** article body — headings, paragraphs, inline images, pull quotes.
- **Net-new only if a candidate needs it:** a `news-hero` variant (title + byline/date + lead image) or a `pull-quote` block — created only if the 3 candidates actually require it.

## Checklist

### Phase 0 — URL list assembly & validation
- [ ] Extract all `/news/*` URLs from `catalog/urls-all.json` (~293) and rewrite host `cms.paramount.com` → `www.paramount.com`
- [ ] Pre-validate each URL (final URL == requested, real `<title>`, not `403 | Paramount`, not a redirect); record and **drop 403s/redirects**
- [ ] Write the validated full list to `tools/importer/urls-news-article.txt` and report the live count vs. dropped count
- [ ] Write the 3 candidate URLs to `tools/importer/urls-news-test.txt`

### Phase 1 — Analyze candidates & confirm block mapping
- [ ] Review the 3 candidates' structure (catalog `page-catalog.json` + a fresh DOM look) for sections, default-content vs. block boundaries
- [ ] Decide hero approach (reuse `hero-page` vs. minimal new `news-hero`) and whether a pull-quote block is needed
- [ ] Confirm related-article carousel maps to `cards-show` (or `cards-news`)

### Phase 2 — Build import infrastructure
- [ ] Add a `news-article` template entry (blocks + sections, with stable wrapper selectors) to `tools/importer/page-templates.json`
- [ ] Reuse/create parsers in `tools/importer/parsers/` as needed (hero, related carousel; new only if required)
- [ ] Reuse `paramount-cleanup` + `paramount-sections` (extend cleanup only with narrowly-scoped new selectors)
- [ ] Create `tools/importer/import-news-article.js` (modeled on `import-content-page.js`) and bundle it to `import-news-article.bundle.js`

### Phase 3 — Validate on the 3 candidates
- [ ] Run the import for the 3 candidate URLs (`urls-news-test.txt`)
- [ ] Preview each rendered page and compare against the live `www.paramount.com` article
- [ ] Fix parser/transformer/section issues; confirm hero, body images, video, and related carousel all render; re-import until clean

### Phase 4 — Scale to all news pages (batch import)
- [ ] Bulk-import the remaining validated URLs in batches of 25–50, monitoring each import report for failures/empties/403s
- [ ] Re-run any transient drops; permanently exclude confirmed 403s
- [ ] Confirm content files land under `content/news/...`

### Phase 5 — Critique & wrap-up
- [ ] Visual critique of news-article rendering vs. live across a sample (with/without video, image-heavy)
- [ ] Spot-check a random sample of imported pages for section integrity and image loading
- [ ] Report final migrated count, dropped 403/redirect URLs, and any skipped variants

## Notes & Open Items
- **403 handling is expected**, not exceptional — `/news/*` was explicitly parked in the brand-detail batch for access-blocking; Phase 0 validation makes the drop list explicit.
- Final live count is determined in Phase 0 after host-rewrite + validation (catalog shows 293 `/news/*` candidates pre-validation).
- Header/footer/global nav are out of scope (separate orchestrated migration).
- **Execution requires Execute mode** — approve to begin with Phase 0 (URL assembly + validation) and the 3-candidate dry run.
