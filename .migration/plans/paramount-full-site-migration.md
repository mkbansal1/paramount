# Paramount.com Full-Site Migration Plan

## Objective
Migrate the remaining Paramount.com pages to AEM Edge Delivery Services, template by template, in **batches**, building on the already-migrated homepage and reusing its blocks and design system. Work proceeds one template at a time: build/validate infrastructure on a representative page, then bulk-import the rest of that template's URLs in batches.

## Decisions Locked In (from review)
1. **Source host:** Discover URLs from the `cms.paramount.com` sitemap, but **migrate the canonical `www.paramount.com`** URLs (rewrite host before import).
2. **Taxonomy pages (52):** **Do not migrate.** Where a taxonomy term is actually referenced/used elsewhere on the site, capture it into a **lookup sheet** (spreadsheet) and reference it from there instead of as a page.
3. **Volume:** Migrate **all** pages, processed in **batches** per template.
4. **News vs. Press:** **Separate templates** — `news-article` is content-rich (hero, inline images, rich text); `press-release` is mostly text.
5. **Brand detail:** **Separate template** (`brand-detail`) rather than folding into the generic content page.

## Template Backlog (in recommended order)
| # | Template | Approx URLs | Notes |
|---|----------|-------------|-------|
| 0 | homepage | done | ✅ already migrated |
| 1 | press-release | done | ✅ migrated 2026-06-23 — 17 live releases imported. Of ~73 catalog URLs, 56 redirect to /news (old "Paramount Global" era, archived off live) and were auto-dropped. See template `press-release` + `press-hero` parser. |
| 2 | news-article | ~294 | Rich: hero + inline images + rich text; largest volume |
| 3 | brand-detail | ~25 | Dedicated template; reuses cards-brand / columns-culture |
| 4 | content-page | ~36 | about, businesses, careers sub-pages, inclusion-impact |
| 5 | careers-landing | ~1–7 | Hero + feature columns + CTAs |
| 6 | legal-terms | done | ✅ migrated 2026-06-23 — 15 live legal/policy pages imported (catalog had ~17 pattern-matchable; 2 recruitment privacy notices redirect off-domain to viacomcbsprivacy.com and were excluded/auto-dropped). New `legal-hero` parser (navy title band → hero-page), `legal-date` block (right-aligned "As of" date), scoped `body.legal-terms` CSS (160px title, 640px column). Reuses `offer-table`/`table` for any inline tables. |
| — | taxonomy | 52 | NOT migrated → captured in a reference sheet if used |

## Approach (per template)
1. **Analyze** the representative page(s) for the template (structure, sections, blocks).
2. **Map blocks** — reuse `carousel-hero` / `cards-brand` / `columns-culture` where they fit; create net-new variants (hero, breadcrumbs, video, tabs) only when needed.
3. **Build infrastructure** — parsers, transformers (incl. a host-rewrite `cms → www` cleanup), import script.
4. **Validate** on the representative URL (single-page import), preview, and fix.
5. **Batch import** the remaining URLs for that template (e.g. 25–50 per batch), monitoring the import report for failures/rate-limiting on the source host.
6. **Style & critique** the template's blocks against the live `www.paramount.com` page; fix to match.

## Cross-Cutting Work
- **Host rewrite:** a transformer/normalization step maps discovered `cms.paramount.com` URLs to `www.paramount.com` before fetching/import.
- **Taxonomy reference sheet:** scan migrated content for taxonomy term usage; emit a spreadsheet of term → label/target and wire references to it instead of taxonomy pages.
- **Global header & footer:** separate navigation and footer migration (run once, applies site-wide).
- **Design system:** brand tokens and fonts are already established from the homepage — reused as-is; only per-block styling is added.

## Checklist
- [ ] Confirm source-host rewrite rule (`cms.paramount.com` → `www.paramount.com`) and re-point the URL list to canonical www
- [x] Migrate **press-release** template (analyze → infra → validate → batch import → style/critique) — 17 live releases imported; stale catalog URLs auto-dropped
- [ ] Migrate **news-article** template (hero + inline images + rich text; batch import ~294 in batches)
- [ ] Migrate **brand-detail** template (dedicated; reuse cards-brand / columns-culture)
- [ ] Migrate **content-page** template (about / businesses / careers-sub / inclusion-impact)
- [ ] Migrate **careers-landing** template
- [ ] Migrate **legal-terms** template (bulk text pages)
- [ ] Build the **taxonomy reference sheet** for terms used in-site; skip taxonomy pages as standalone pages
- [ ] Migrate **global header/navigation** and **footer**
- [ ] Final full-site visual critique pass and fixes against live `www.paramount.com`

## Notes & Open Items
- **Batch size:** I'll default to ~25–50 URLs per import batch; tell me if you want larger/smaller batches.
- **News/Press split confirmed** as two templates; brand-detail confirmed as its own template.
- This is a large multi-template effort; each template is an independent, reviewable unit. I recommend completing and approving **press-release** first as the pipeline shakedown before scaling to news.
- This plan **executes in Execute mode** — approve to begin with the host-rewrite confirmation and the press-release template.
