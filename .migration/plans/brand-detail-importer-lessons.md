# Brand-Detail Importer Issues — Lessons Learned & Prevention Guide

## Objective
Capture the importer/parser/transformer issues discovered and fixed during the **brand-detail** template migration, so the same mistakes are not repeated in the next batch import (content-page, careers-landing, legal-terms, and the parked press/news templates). Produce a written reference document in the repo.

## Where to write it
Create a markdown reference at **`migration-work/brand-detail-importer-lessons.md`** (analysis/working area, alongside the other migration artifacts). This keeps it with the migration context and out of the production `blocks/`/`content/` trees.

## Issues to document (all confirmed & fixed during brand-detail)

1. **URL access / page-validity pre-check**
   - `/press` and `/news` return server-side **403 Access Denied**; `chilevision` **redirects** to the Brands index; `colors`/`telefe` return **403**. These produced junk/empty imports.
   - Lesson: before batch import, validate each URL's final state (200 + expected title, not a 403/redirect) and drop invalid URLs from the list.

2. **Host rewrite**: sitemap lists `cms.paramount.com`; canonical content is `www.paramount.com`. Rewrite host before import.

3. **Hero variant coverage (selector too narrow)**
   - Initial selector `.podcast-header-wrapper.header-with-video` missed the `header-with-image` (and title-only) variants → leaked raw breadcrumb/heading as default content.
   - Lesson: anchor block selectors on the **stable wrapper** (`.podcast-header-wrapper`) and let the parser handle optional media (video OR image OR none).

4. **Section selector must survive parsing**
   - When a block parser `replaceWith()`s the same element used as the section `selector`, the sections transformer can't find the boundary → sections merge (columns-info merged into the hero; navy-on-navy invisible text).
   - Lesson: map block `instances` to an **inner** element and keep the section `selector` on the surviving **wrapper** (as cards-show/cards-brand do). Sections transformer falls back to the first block class, but inner-targeting is the robust pattern.

5. **Cleanup transformer over-broad removals**
   - Blanket `nav` removal stripped breadcrumb `<nav>`; needed scoping to `nav.navbar`/`fixed-top`/`[aria-label="Primary"]`.
   - Slider chrome (`.pagination-container`, `1 OF N`), decorative `code.*icon` wrappers (stray `` `` ``), and `.visually-hidden` a11y duplicates all leaked → must be removed in cleanup.

6. **Breadcrumb handling**
   - Breadcrumb lives inside the hero wrapper; a hero parser that replaces the wrapper destroys it. Solution: hero parser extracts the breadcrumb and emits it as its own block first; breadcrumb JS reads `<p>`-per-crumb (not `<li>`/`<a>` only, which dropped the final text-only crumb).

7. **Video → use the Video block**
   - Background `<video>` MP4s: emit a `video (autoplay)` block with an **absolutized** MP4 link; don't carry raw `<video>` or drop it to a static image.

8. **Lazy-load screenshot artifact**
   - Below-the-fold images appear as empty boxes in full-page screenshots until loaded — verify image `complete/naturalWidth` in the DOM rather than trusting a single screenshot.

9. **Block-variant reuse vs. new variation**
   - `cards-brand` needed a square, dark-gradient hover variant (`cards-brand-square`) for related-brands vs. the homepage portrait/cyan variant — auto-detected in JS. Document when to branch a variant vs. reuse.

10. **Local preview port**
    - Port 3000 is bound to another repo (502); this project previews on **port 3001 at `/content/...`**. Note for anyone verifying.

11. **`.plain.html` section model**
    - Section breaks come from top-level `<hr>`/blank-line separators; nested `<hr>` inside a block wrapper does not split sections. Title/order within a section is controlled by block emit order + CSS.

## Approach
1. Confirm the destination path and document scope with the user (below).
2. Read the current brand-detail artifacts (parsers, transformers, block JS/CSS, page-templates.json) to quote exact selectors/rules in the doc.
3. Write the lessons doc with: **Issue → Root cause → Fix applied → Prevention rule for next batch**, grouped by component (URL list, parsers, transformers, block CSS/JS, verification).
4. Add a short "Pre-import checklist" section at the top that the next batch can follow directly.

## Checklist
- [ ] Confirm doc location (`migration-work/brand-detail-importer-lessons.md`) and depth with the user
- [ ] Read brand-hero / cards-show / cards-brand / columns-info / breadcrumb parsers to cite exact selectors
- [ ] Read paramount-cleanup & paramount-sections transformers to cite the scoped rules
- [ ] Read page-templates.json brand-detail block/section mappings
- [ ] Draft the lessons doc (Issue → Root cause → Fix → Prevention, grouped by component)
- [ ] Add a top-of-doc "Pre-import checklist" for the next batch
- [ ] Summarize the documented issues back to the user

## Notes
- This is a **documentation-only** task — no parser/transformer/CSS/content changes, no re-imports.
- Writing the file requires **Execute mode**; approve to proceed.
