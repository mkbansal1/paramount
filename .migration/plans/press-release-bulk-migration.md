# Legal-Terms Bulk Migration Plan

## Objective
Migrate the Paramount **legal-terms** template to AEM Edge Delivery Services. Validate the pipeline on **3 representative candidate pages**, then scale across the full pattern-matched legal/policy URL set, auto-dropping dead/redirected URLs. This is template #6 in the full-site backlog — structurally the simplest (single-column dense rich text, no media blocks), so it should bulk-import cleanly. Reuses lessons + infrastructure patterns proven on `press-release`.

## Current State (verified)
- **No legal-terms infrastructure exists yet** — `tools/importer/` has import scripts for homepage, brand-detail, news-article, content-page, press-release only. No legal-terms parser, transformer, import script, or URL list.
- **`legal-terms` template IS in `catalog/template-catalog.json`** with 1 representative URL (`cbs-research-survey-terms-of-use`) and description: *"Long-form legal/policy document: single-column heading plus dense rich-text body with no media blocks."*
- **~17 legal/policy URLs** are pattern-matchable in `catalog/urls-all.json` (terms-of-use, privacy notices, advertising guidelines, supplier compliance, recruitment notices, content-delivery guidelines, etc.). The backlog's ~50 estimate is high vs. what's actually in the catalog.
- **Root-level slugs:** legal pages live at `cms.paramount.com/{slug}` (no `/press/`-style prefix).

## Locked Decisions (from clarification)
- **URL sourcing:** Pattern-match `catalog/urls-all.json` for legal/policy/terms/guidelines/notice/agreement/compliance slugs (~17), import them, and **auto-drop any that 404 or redirect** (the dead-URL detection proven on press-release: pages that don't yield the expected body block are dropped).
- **Host + path:** **Rewrite `cms.paramount.com` → `www.paramount.com`**, same root-level slug; fetch/migrate at `www.paramount.com/{slug}`. Verify each resolves; drop those that don't.
- **Off-domain redirects:** `paramount-us-recruitment-privacy-notice` redirects to **another domain** → **exclude** it (and treat any other off-domain redirect the same way during auto-drop).

## Structural Notes (per user — parser MUST handle these)
- **Right-aligned date** at the **top of the body** on some pages (e.g. "Last updated…"/effective date) — capture and preserve it (likely a small right-aligned paragraph above the rich-text body, not page metadata).
- **Summary section at the bottom** on some pages — preserve it as part of the body (its own section/heading), not dropped as boilerplate.
- Otherwise: single-column dense rich text — headings, ordered/unordered lists, possible inline tables; no media blocks.

## Candidate Pages for Validation (3, structural variety)
1. **Standard terms-of-use (representative):**
   `www.paramount.com/cbs-research-survey-terms-of-use`
2. **Recruitment privacy notice — EEA/Switzerland (dense, multi-section; user-specified):**
   `www.paramount.com/recruitment-privacy-notice-eea-recruitment-privacy-notice-eea-switzerland`
3. **Guidelines doc (different authoring shape; user-specified):**
   `www.paramount.com/pluto-tv-advertising-guidelines`

These span the shapes the parser must handle: standard terms, dense multi-section privacy notice, and a guidelines document — and collectively should surface the top-of-body date and bottom summary variants.

## Full Candidate URL Set (~16 after excluding the off-domain privacy notice; host-rewritten to www, pending live-resolution check)
- cbs-research-survey-terms-of-use
- pluto-tv-advertising-guidelines
- paramount-studios-facilities-business-to-business-terms-of-use
- pluto-tv-content-delivery-guidelines
- paramount-press-express-terms-of-use
- pluto-tv-cla-standard-terms
- cbs-advertising-sales-agreement-terms-and-conditions
- tv-city-panel-privacy-policy
- recruitment-privacy-notices
- recruitment-privacy-notice-eea-recruitment-privacy-notice-eea-switzerland
- recruitment-privacy-notice-apac
- user-content-submission-agreement
- pluto-tv-additional-content-delivery-guidelines
- cbs-broadcasting-inc-and-turner-broadcasting-system-advertising-sales-agreement-terms-and-conditions
- supplemental-terms-and-conditions-for-political-advertising
- cbs-supplier-compliance-policy
- *(excluded: `paramount-us-recruitment-privacy-notice` — redirects off-domain)*

## Approach
1. **Analyze** the 3 candidates' structure (page title/heading, **top-of-body right-aligned date**, single-column rich-text body, sub-headings, lists, **bottom summary section**, tables if any). Confirm "no media blocks" holds.
2. **Map blocks** — expect mostly **default rich-text content** plus a simple **title hero** band. Reuse `hero-page` (or a lightweight `legal-hero` parser if the title markup differs, mirroring how `press-hero` handled the press h5). Preserve the top date (as a right-aligned paragraph) and the bottom summary (as default content) in the body. Add a `legal-terms` template entry to `page-templates.json`. Reuse the `table` block already built for press-release if any legal page inlines tables.
3. **Build infrastructure** — parser(s), reuse/extend `paramount-cleanup.js` (incl. `cms → www` host rewrite, already present), wire `paramount-sections.js`, and create `import-legal-terms.js`; bundle it.
4. **Validate** by importing the 3 candidates; preview each on the local server (port **3001** — 3000 is auth-gated); compare against live `www.paramount.com`; verify the top date and bottom summary survive; fix parser/transformer issues until clean.
5. **Scale** — generate `urls-legal-terms.txt` (all ~16, host-rewritten), run the bulk importer (single batch suffices at this volume), auto-drop dead/redirected/off-domain URLs, and report kept vs. dropped.
6. **Verify & critique** — count imported content, spot-check rendering (incl. date + summary), run a visual-critique pass for the legal-terms body/title vs. live, scope any CSS to the template (e.g. `body.legal-terms`) so shared blocks aren't disturbed.

## Checklist
- [ ] Confirm validation candidates + host-rewrite rule + off-domain exclusion — done via clarification
- [ ] Pattern-match the full legal-terms URL set from `catalog/urls-all.json` (host-rewritten to www; exclude off-domain privacy notice)
- [ ] Analyze the 3 candidate legal-terms pages (sections, blocks, top-of-body date, bottom summary, authoring decisions)
- [ ] Map blocks and add a `legal-terms` template entry to `page-templates.json`
- [ ] Build parser(s) (preserve right-aligned top date + bottom summary), transformer wiring (incl. cms→www host rewrite), and `import-legal-terms.js`; bundle
- [ ] Import the 3 candidates (single-batch validation run)
- [ ] Preview & compare the 3 against live pages (port 3001); confirm date + summary render; fix parser/transformer issues until clean
- [ ] Generate full `urls-legal-terms.txt` and run the bulk importer
- [ ] Auto-detect & drop dead/redirected/off-domain URLs; report kept vs. dropped
- [ ] Verify imported content count and spot-check rendering
- [ ] Style & visual-critique pass for legal-terms blocks vs. live site (scoped CSS)
- [ ] Add imported URLs to `page-templates.json`; update the full-site migration plan to mark legal-terms complete

## Notes & Open Items
- **Volume:** ~16 catalog URLs — a single import batch suffices; no rate-limit batching needed.
- **Dead/off-domain URLs:** legacy `cms` slugs may redirect or 404 on `www` (as ~56 press URLs did) or redirect off-domain (the excluded privacy notice); auto-drop handles this.
- **Top-of-body date & bottom summary:** the two structural variants the user flagged — the parser must keep both; validation candidates are chosen to surface them.
- **Tables/media:** template is described as "no media blocks," but guidelines/agreements may contain lists or a table — the `table` block from press-release is available if needed.
- **Title band:** if the legal title markup differs from `hero-page`'s expectations, add a small dedicated parser rather than overload the shared block.

---
*Execution requires Execute mode — approve to begin with full URL pattern-match and page analysis.*
