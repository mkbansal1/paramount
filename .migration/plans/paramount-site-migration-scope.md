# Paramount.com Site Migration Scope Plan

## Objective
Perform a full **site scope analysis** of `https://www.paramount.com/` to understand the migration effort: discover all URLs, group pages into templates, catalog the reusable blocks each template needs, and produce a consolidated migration scope report. This is a **discovery/assessment pass** — it produces a plan and inventory, not migrated content.

## Context
The homepage (`/`) has already been fully migrated to EDS in this project (hero carousel, brands card grid, culture columns, plus site-wide design tokens and brand fonts). This scoping effort extends the lens from a single page to the **whole site**, so we can plan the remaining work and reuse what's already built.

## Scope
- **Target site:** `https://www.paramount.com/`
- **Type:** Full-site scope analysis (URL discovery → template cataloging → block inventory → scope report)
- **Deliverables:** URL list, page templates, block catalog, and a migration scope report

## Approach
1. **Confirm project properties** — reuse the already-detected project type (`da`) and Block Library endpoint so the scope maps to blocks available for this project.
2. **URL discovery** — fetch all URLs via the sitemap (preferred) or crawling; report the total count and URL patterns.
3. **Template cataloging** — analyze representative pages, group structurally similar URLs into page templates (e.g. homepage, brand detail, careers, news/press, about, contact), and name each template.
4. **Block inventory per template** — identify the EDS blocks each template needs, flagging reuse of the existing homepage blocks (carousel-hero, cards-brand, columns-culture) vs. net-new blocks.
5. **Scope report** — consolidate URL counts, templates, block inventory, reuse vs. new effort, and open questions into a migration scope report for review.

## Checklist
- [ ] Confirm project type (`da`) and Block Library endpoint
- [ ] Discover all site URLs (sitemap or crawl) and report count + patterns
- [ ] Group URLs into page templates with representative pages
- [ ] Catalog blocks required per template (reuse vs. new)
- [ ] Identify already-migrated coverage (homepage) and remaining work
- [ ] Generate the consolidated migration scope report
- [ ] Summarize findings, effort estimate, and open questions for review

## Notes
- This plan covers **scope analysis only** — no parsers, transformers, import scripts, content files, or styling are produced. Migrating the discovered templates is a separate follow-up.
- URL discovery scale is unknown until the sitemap is read; if the site is very large, I'll report the total and propose prioritizing a representative subset of templates before committing to full per-template analysis.
- Execution of these steps requires **Execute mode** — approve this plan to proceed.
