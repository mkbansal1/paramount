# Paramount.com → AEM Edge Delivery — Migration Handoff

_Last updated: 2026-06-24. Use this to resume after the workspace is reset/relocated._

## 1. What this project is
Migrating `paramount.com` to AEM Edge Delivery Services (EDS), based on the aem-boilerplate.
Content is discovered from the sitemap on `cms.paramount.com` but migrated to the **canonical `www.paramount.com`** host (host rewrite is built into the cleanup transformer).

- **Working dir:** project root (was `/workspace/current` — adjust to new location).
- **Migrated content** lives in `content/**/*.plain.html` (161 files incl. nav/footer/index shell).
- **Dev server:** `npx @adobe/aem-cli up --html-folder content --port 3000` (serves `content/` locally; this session it was on **port 3000**, a prior session used 3001 — always check `ps aux | grep 'aem up'` for the actual `--port`).
- Preview a page: `http://localhost:3000/content/{path}` (rendered) or append `.plain.html` (raw).

## 2. Migration status (as of handoff)
| Template | Migrated files | Notes |
|---|---|---|
| homepage | 1 (`index`) | + `nav`, `footer` shell |
| brand-detail | 21 (`/about/brands/*`) | |
| content-page | ~20 (`/about/*`, `/about/businesses/*`, `/careers/*` + roots) | |
| press-release | 45 (`/press/*`) | |
| news-article | 31 (`/news/*`) | |
| legal-terms | 28 (root-level legal slugs) | |
| **Total** | **161** | |

`tools/importer/page-templates.json` tracks **representative/validation URLs per template** (not the full imported set) — homepage/brand-detail/news-article show only 1 there even though many files exist. The authoritative "what's migrated" list is the files on disk in `content/`.

## 3. Sitemap live-audit (the source of truth for remaining work)
Full audit in **`catalog/sitemap-live-audit.md`** (+ `.json` sidecar). Of 533 sitemap URLs:
- **79** already migrated · **117** return HTTP 403 (bot/access-blocked, need auth or Wayback) · **4** off-domain redirects (skip) · **250** redirect to a section root = archived/dead-on-live (skip) · **52** `/taxonomy/*` do-not-migrate · **31** OK-and-not-migrated real candidates.
- Of those 31 candidates, the recent batches migrated **13 legal-terms** + **8 content pages** (incl. `/careers`, `/licensing`, `/contact-us` as form-placeholder pages).
- **Remaining real candidates / intentionally skipped:** `/about/brands/chilevision` (internal redirect — skip); `/news`, `/press`, `/about/brands` (dynamic filter/listing index pages — rebuild later as an EDS index/auto-block, NOT static); `/403`, `/404` (EDS has native `404.html`); `/ir` (empty off-site stub); `/ad-sales-test`, `/timeline-bannertest-landing-page` (bespoke QA/test pages — skip).

To re-run the audit after reset: the probe scripts are in `catalog/.audit/` (`probe.mjs` = status/redirect check, `struct.mjs` = block-structure check). They launch Playwright from the importer's node_modules — see §5 for the path.

## 4. Infrastructure built (per template)
**Import scripts** (`tools/importer/import-{template}.js` + bundled `.bundle.js`):
homepage, brand-detail, content-page, news-article, press-release, legal-terms.

**Transformers** (`tools/importer/transformers/`):
- `paramount-cleanup.js` — site-wide chrome removal + **`cms.paramount.com → www.paramount.com` host rewrite** + recirculation-list stripping (More News/More Press). Has a PostToolUse validator hook.
- `paramount-sections.js` — inserts `<hr>` section breaks + Section Metadata from `page-templates.json` sections.

**Parsers** (`tools/importer/parsers/`): accordion, brand-hero, breadcrumb, callout, cards*, carousel-hero, columns*, definition-list, form-placeholder, hero-page, job-search, **legal-hero**, news-hero, news-video, **offer-table**, **press-hero**, quote, stats, testimonials.

**Custom blocks** added beyond boilerplate (`blocks/`): brand-hero, cards-brand, cards-news, cards-people, cards-show, carousel-hero, columns-culture, columns-feature, columns-info, definition-list, form-placeholder, hero-page, job-search, **legal-date**, **more-press**, **share**, **table**, accordion, callout, stats, testimonials, news-hero variants.

**Other:** `helix-query.yaml` (defines `/press-index.json` for the auto-updating More Press list — only generated after publish), `styles/brand.css` (design tokens).

## 5. How to run an import (after reset)
The bulk-import tooling lives in the marketplace skill, NOT the repo:
`SCRIPTS=/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts`
(Confirm it exists after reset: `ls $SCRIPTS`. If the marketplace path changed, find `run-bulk-import.js`.)

```bash
# 1. (re)bundle an import script after editing it:
$SCRIPTS/aem-import-bundle.sh --importjs tools/importer/import-<template>.js
# 2. run a bulk import from a URL list (www host, one per line):
node $SCRIPTS/run-bulk-import.js \
  --import-script tools/importer/import-<template>.bundle.js \
  --urls tools/importer/urls-<template>.txt
# 3. register imported URLs into the template:
node $SCRIPTS/add-urls-to-template.js --template <template> --urls <file>
```
Output `.plain.html` files land in `content/`. **Always re-bundle after editing a parser/import script** (the bundle is what runs).

## 6. Key gotchas / lessons (don't relearn these)
- **Catalog URLs are stale.** Many `/press` and `/news` sitemap URLs 301/JS-redirect to `/news` or `/` on live (archived off-site). Always probe live before trusting the list; auto-drop pages where the importer logs `Found 0 block instances`.
- **Scoped CSS for template variants.** press-release and legal-terms reuse the shared `hero-page` block but need different styling (narrow 640px body column, different title size, right-aligned date). This is done via a `template:` metadata row in the import script → EDS adds `body.<template>` → CSS scoped to `body.press-release` / `body.legal-terms` in `styles/styles.css`. **Do NOT edit `hero-page.css`** (shared with content-page). ⚠️ These scoped blocks were once wiped by an external `styles.css` revert — if press/legal pages render with a 112px title or full-width body, the `body.press-release` / `body.legal-terms` blocks are missing from `styles/styles.css` and must be restored.
- **Tables can't survive GFM markdown.** PRNewswire offer tables with multi-line cells were dropped on import; fixed via `offer-table.js` parser → emits a `Table` block (`blocks/table/`). Footnote tables are detected and rendered as paragraphs.
- **Forms** (`/licensing`, `/contact-us`) → `form-placeholder` block (static disabled form); the parser drops reCAPTCHA/inputs and keeps heading+intro+links. Form-only blocks emit a "Contact form" placeholder rather than leaking field labels.
- **403 pages (117)** need authenticated access or Wayback capture — not solved.
- **Memory:** durable project notes are in the auto-memory dir (`MEMORY.md` + `project-paramount-*` files): press-release template, legal-terms template, stale-catalog finding. These persist across sessions and capture the template-specific details.

## 7. Suggested next steps
1. Decide on the **117 blocked `/news` articles** (auth/Wayback) — largest remaining gap.
2. Build EDS **index/auto-block** for `/news`, `/press`, `/about/brands` listing pages (deferred dynamic widgets).
3. **Publish** so `/press-index.json` generates and the More Press block populates.
4. Full-site **visual critique** pass vs live `www.paramount.com`.
5. Run `npm run lint` before any PR (eslint/stylelint config in repo; deps may need `npm install`).

## 8. Reference files
- Plans: `.migration/plans/` (per-template lessons + `paramount-full-site-migration.md` master backlog).
- Audit: `catalog/sitemap-live-audit.md` / `.json`.
- Templates/blocks/sections map: `tools/importer/page-templates.json`.
- URL lists: `tools/importer/urls-*.txt`.
