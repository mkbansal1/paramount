# Paramount.com Homepage Migration Analysis Plan

## Objective
Analyze the Paramount homepage (`https://www.paramount.com/`) to understand its content structure, sections, authoring decisions, and required block variants — producing analysis artifacts that inform a subsequent EDS migration. This is an **analysis-only** pass: no import infrastructure or content files are generated yet.

## Scope
- **Target URL:** `https://www.paramount.com/`
- **Type:** Single-page structural analysis (homepage)
- **Deliverables:** Section breakdown, identified blocks/variants, screenshots, cleaned HTML, and analysis JSON

## Approach
1. **Determine project properties** — confirm project type (doc / da / xwalk) and the relevant Block Library endpoint so analysis maps to blocks actually available for this project.
2. **Scrape & capture** — fetch the live homepage, capture full-page and section screenshots, download images, and produce cleaned HTML + page metadata.
3. **Structural analysis** — break the page into sections and content sequences, identify default content vs. blocks, and detect candidate block variants (hero, carousel, cards, navigation, footer, etc.).
4. **Block mapping** — match identified sections against available EDS blocks; flag where new block variants are needed.
5. **Report findings** — summarize the section model, recommended blocks, authoring decisions, and anything that needs your input before a full migration.

## Checklist
- [ ] Confirm project type and Block Library endpoint (project-expert)
- [ ] Scrape `https://www.paramount.com/` — capture screenshots, images, metadata, cleaned HTML
- [ ] Identify page sections and content sequences
- [ ] Classify default content vs. blocks per section
- [ ] Detect required block variants and match against available blocks
- [ ] Produce analysis artifacts (analysis JSON, screenshots, cleaned HTML)
- [ ] Summarize findings and surface open questions / decisions for review

## Notes
- This plan covers **analysis only**. Generating import scripts, parsers, transformers, and content files is a separate follow-up step.
- Execution of the steps above requires **Execute mode** — approve this plan to proceed.
