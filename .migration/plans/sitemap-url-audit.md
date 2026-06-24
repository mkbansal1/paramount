Let me investigate the current state — the sitemap/catalog inventory and what's already migrated — to build an accurate plan.Bash is blocked in plan mode. Let me use read-only tools.533 total pages from sitemap. Let me look at the checklist (likely tracks migration status) and the grouped URLs.The checklist is only a 30-page sample. The full sitemap (533 pages) is in urls-all.json. Let me understand its structure and what's been migrated so far.All 533 sitemap URLs are on `cms.paramount.com`. Let me see what's already migrated (content dir) and what's tracked in page-templates.json.There are ~150+ migrated files already. The user wants a **deep live-status check of all 533 sitemap URLs**, classifying each into: 403, off-domain redirect, do-not-migrate, and not-yet-migrated. This is an execution task (requires fetching every URL via the headless browser/importer, which is write/network work) — I'll lay out the plan.

Let me confirm a couple of details about scope and the "do-not-migrate" definition before finalizing.Let me check the grouped URLs to understand the taxonomy / do-not-migrate categories.I have enough to build the plan. The site has 533 sitemap URLs (all `cms.paramount.com`) across groups: /about, /careers, /inclusion-impact, /news, /press, /taxonomy, plus root-level legal pages. The user wants a deep live-status audit classifying every URL. Let me confirm a couple of scoping decisions before finalizing.# Sitemap Deep Live-Status Audit Plan

## Objective
Run a **deep live-status check of all 533 sitemap URLs** for paramount.com and classify every page into actionable buckets:
1. **403 / blocked** — pages returning HTTP 403 (access-protected) on the canonical host
2. **Off-domain redirect** — pages that navigate/redirect to a different domain (e.g. `viacomcbsprivacy.com`, `ir.paramount.com`, `paramountplus.com`)
3. **Do-not-migrate** — `/taxonomy/*` term pages and other non-content/system pages (per the migration plan, taxonomy is captured in a reference sheet, not migrated)
4. **Not yet migrated** — real content pages that resolve OK on www but have no file in `content/`, **tagged by template** (news-article / brand-detail / content-page / careers / press-release / legal-terms)

Produces a single audit report listing the paths in each bucket.

## Locked Decisions (from clarification)
- **Probe host:** rewrite `cms.paramount.com` → **`www.paramount.com`** and check the canonical live host we actually migrate to.
- **Fetch method:** **headless browser** (the same Playwright/importer engine used for migration — real Chrome TLS, follows JS redirects), not curl (curl hits bot-protection 403s that don't reflect import reality).
- **Template tagging:** **yes** — group the not-migrated list by URL-path heuristic so remaining work is actionable per template.

## Current State (verified)
- **533 URLs** in `catalog/urls-all.json` (sitemap-derived, captured 2026-06-22, all on `cms.paramount.com`).
- Path groups present: `/about`, `/about/brands`, `/about/businesses`, `/careers`, `/inclusion-impact`, `/news`, `/press`, `/taxonomy` (52), plus root-level legal slugs and `/home`.
- The 30-page checklist sample already shows **9 failures, mostly HTTP_403** (e.g. `/about/brands/chilevision`, `/about/businesses/us-distribution/leadership`) — confirming 403s are real and widespread; the full set needs the same treatment.
- **~150+ pages already migrated** in `content/` (homepage, header/footer/nav, ~30 news, ~28 brand-detail, ~20 content-page, ~45 press-release, 15 legal-terms).
- The catalog is **off-sync with live**: prior templates showed many sitemap URLs 404/redirect on `www` (e.g. 56 of 73 press URLs went to `/news`; 2 recruitment notices went off-domain).

## Template-tagging heuristic (for not-migrated pages)
| Path pattern | Template |
|---|---|
| `/news/{slug}` | news-article |
| `/press/{slug}` | press-release |
| `/about/brands/{slug}` | brand-detail |
| `/about`, `/about/businesses/*`, `/careers/*`, `/inclusion-impact/*`, `/about/{leadership,history,board-of-directors,podcasts,compliance-resources}` | content-page |
| `/careers` (root landing) | careers-landing |
| root-level legal slugs (`*-terms-of-use`, `*-privacy-*`, `*-guidelines`, `*-policy`, `*-agreement`, `*-conditions`) | legal-terms |
| `/taxonomy/*` | do-not-migrate |

## Approach
1. **Build the probe list** — extract all 533 URLs from `catalog/urls-all.json`, rewrite host `cms → www`, dedupe.
2. **Pre-classify by path** — flag `/taxonomy/*` (and any obvious system pages) as **do-not-migrate** up front (no need to fetch; saves ~52 loads).
3. **Diff against migrated** — mark URLs whose slug already exists in `content/**/*.plain.html` as **already-migrated** (exclude from the "not migrated" bucket).
4. **Live probe (headless browser)** the remaining candidate URLs on `www.paramount.com`, recording for each: final URL, final host, HTTP status. Classify:
   - final host ≠ `www.paramount.com` (and not a same-site asset) → **off-domain redirect**
   - HTTP 403 → **403 / blocked**
   - 404 / error → **dead** (note separately)
   - 200 on www, slug not in `content/` → **not yet migrated** → tag template
   - Run in **batches (~25–40)** to avoid rate-limiting; reuse the import engine's Chrome-first/HTTP1.1-fallback resilience.
5. **Compile the audit report** — `catalog/sitemap-live-audit.md` (+ a JSON sidecar) with counts and the full path list per bucket, not-migrated grouped by template.
6. **Report** the four lists back to you inline (counts + paths).

## Checklist
- [ ] Extract + host-rewrite all 533 sitemap URLs (cms → www); dedupe
- [ ] Pre-classify `/taxonomy/*` and system pages as do-not-migrate (no fetch)
- [ ] Diff candidate URLs against existing `content/**/*.plain.html`; set aside already-migrated
- [ ] Live-probe remaining URLs on www via headless browser, in batches (~25–40), capturing final host + HTTP status
- [ ] Classify each: 403 / off-domain redirect / dead / not-yet-migrated
- [ ] Tag not-yet-migrated pages by template (path heuristic)
- [ ] Write `catalog/sitemap-live-audit.md` + JSON sidecar (counts + paths per bucket)
- [ ] Report the four lists (403, off-domain, do-not-migrate, not-migrated-by-template) inline with counts

## Notes & Open Items
- **This is an audit only** — no migration/import is performed; it produces the worklist that informs the remaining template batches.
- **Volume/time:** ~480 live page loads after removing taxonomy; batched to stay under rate limits. If you'd prefer a faster sample (e.g. probe only the not-yet-migrated candidates and trust path rules for the rest), say so.
- **"Dead" (404) bucket:** I'll report these alongside the four requested buckets since the catalog is known-stale and some sitemap URLs no longer exist on www.
- **Output location:** `catalog/sitemap-live-audit.md` — tell me if you want it elsewhere.

---
*Execution requires Execute mode — approve to begin the deep live-status audit.*
