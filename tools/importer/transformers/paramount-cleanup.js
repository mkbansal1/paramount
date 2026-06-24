/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Paramount site-wide cleanup.
 * Removes non-authorable site shell/chrome from the Drupal/Cohesion (coh-*) source.
 * All selectors below were verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent widget button (OneTrust) — verified line 664: <button id="ot-sdk-btn" class="ot-sdk-show-settings">
    WebImporter.DOMUtils.remove(element, [
      '#ot-sdk-btn',
      '.ot-sdk-show-settings',
    ]);

    // Decorative inline SVG icon wrappers (Cohesion <code class="self_link_icon"><img data-uri svg></code>).
    // These become stray markdown artifacts (`` ``) when imported, so strip them before parsing.
    // The button/link text is preserved; styling adds the arrow back via CSS.
    WebImporter.DOMUtils.remove(element, [
      'code.self_link_icon',
      'code.coh-inline-element',
    ]);

    // Any remaining inline <code> wrappers used purely for decorative icons
    // (no meaningful text) — these also leak as stray `` `` markdown artifacts.
    Array.from(element.querySelectorAll('code')).forEach((node) => {
      if (!(node.textContent || '').trim()) node.remove();
    });

    // Visually-hidden accessibility duplicates (e.g. the brands "More Of What you love" h2 that
    // duplicates the visible split heading). Authored heading is recreated as visible live text.
    WebImporter.DOMUtils.remove(element, [
      '.visually-hidden',
    ]);

    // Hidden leadership-listing category labels (e.g. <span class="leadership-division d-none">
    // "Chairman and CEO" / "BOD">). These are never displayed on the live page but
    // otherwise leak into the leadership section as stray paragraph text.
    WebImporter.DOMUtils.remove(element, [
      '.leadership-division',
    ]);

    // Mobile slider pagination controls (e.g. the brand-detail related-content
    // "1 OF 8" counter + prev/next arrows). These are slider chrome, not content,
    // and otherwise leak into the section as stray "1 OF N" text.
    WebImporter.DOMUtils.remove(element, [
      '.pagination-container',
      '.pagination-control',
      '.pagination_count_text',
      '.pagination_prev_arrow',
      '.pagination_next_arrow',
    ]);

    // Slick carousel chrome and DUPLICATED clones. Slick clones slides (for the
    // infinite loop) and adds dot/arrow controls; in a static scrape these leak as
    // duplicated content (e.g. the internships testimonial carousel repeats every
    // quote) plus stray "1..N" dot numbers. Remove cloned slides and slider chrome
    // so only the real, single set of slides remains.
    WebImporter.DOMUtils.remove(element, [
      '.slick-cloned',
      '.slick-dots',
      '.slick-arrow',
      '.slick-prev',
      '.slick-next',
      '.timelineCarousel-image-slider',
    ]);

    // News-article share widget (the "Share" dropdown + social menu in the
    // article byline/metadata header). The byline text ("By {author}") is kept;
    // only the non-authorable share affordance and its dropdown menu are removed.
    WebImporter.DOMUtils.remove(element, [
      '.metadata-share-container',
      '.share-menu-container',
      '.meta-share-btn',
      '.metaHeaderMobile',
    ]);

    // Press-release recirculation lists. A press release nests TWO query-driven
    // related lists inside .wrapper-press-release-template, AFTER the real body
    // (.press-release-container): a "More News" image-tile strip and a "More
    // Press" link list. Both are auto-generated template chrome (same treatment
    // as news-article's "More News"), NOT per-page authored content. The live
    // DOM and the archived snapshot use different class names, so remove both
    // sets. Without this the news tiles leak in as stray images.
    WebImporter.DOMUtils.remove(element, [
      // live (www.paramount.com) selectors
      '.wrapper-related-news',
      '.wrapper-more-news',
      '.related-news',
      '.wrapper-pressRelease-cl',
      '.wrapper-related-press-cl',
      '.wrapper-more-press',
      '.cl-pressRelease-list',
      // archived-snapshot selectors
      '.wrapper-morePress',
      '.newsPressRelease-list',
    ]);

    // Awards page (/news/awards) dynamic filter chrome. The award entries
    // themselves are kept (mapped to a cards block via .awards-filter); only the
    // non-functional filter UI is removed: the year/category tab list, the mobile
    // filter dropdown, the mobile-duplicate result list, the "Load more" pager,
    // and the Apply button.
    WebImporter.DOMUtils.remove(element, [
      '.awards-tab-list',
      '.awards-filter-dropdown',
      '.awards-filter-tab',
      '.awards-view-mobile',
      '.js-pager__items',
      '.load-more-view-award-filter',
      '.awards-filter-apply',
      '.coh-apply-filters',
      '.views-exposed-form',
      '.bef-exposed-form',
      '.awards-filter-btn',
    ]);

    // Content-page section headings (e.g. "Board of Directors", "Related Content",
    // "More Businesses") are authored as Cohesion <div class="section-heading"> or
    // an <h4 class="section-heading">. They are emitted as default content next to
    // their block, so normalize them to a real <h2> heading element. (Brand-detail
    // has no .section-heading, so this is a no-op there.)
    Array.from(element.querySelectorAll('.section-heading')).forEach((node) => {
      const text = (node.textContent || '').trim();
      if (!text) return;
      const h2 = element.ownerDocument.createElement('h2');
      h2.textContent = text;
      node.replaceWith(h2);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell — header and footer are auto-populated by EDS.
    // Verified line 6:   <header class="... siteHeader">
    // Verified line 600: <footer class="... footer-wrapper">
    // NOTE: scope nav removal to the primary site navbar only. A blanket `nav`
    // selector also strips inner-page breadcrumb <nav> wrappers (e.g. brand-detail),
    // which must survive so the breadcrumb block is preserved.
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.siteHeader',
      'footer',
      '.footer-wrapper',
      'nav.navbar',
      'nav.fixed-top',
      'nav[aria-label="Primary"]',
    ]);

    // NOTE: the career-filter "explore the possibilities" widget is intentionally
    // NOT removed here — it is mapped to the `job-search` placeholder block (which
    // keeps the section's heading + a static, non-functional filter UI). The
    // job-search parser extracts only the heading, so the option-list dropdowns
    // never leak as content.

    // Drupal / accessibility chrome and skip links.
    // Verified line 2:   <a ... class="visually-hidden focusable skip-link">Skip to main content</a>
    // Verified line 660: <div id="drupal-live-announce" class="visually-hidden">
    WebImporter.DOMUtils.remove(element, [
      '.skip-link',
      '#drupal-live-announce',
    ]);

    // Tracking pixels and ad/sync iframes appended after </main>.
    // Verified line 662: <img src="https://t.co/i/adsct...">
    // Verified line 663: <img src="https://analytics.twitter.com/i/adsct...">
    // Verified line 665: <iframe ... src="https://cbsi.demdex.net/dest5...">
    // Verified line 667: <iframe src="https://...doubleclick.net/activityi...">
    WebImporter.DOMUtils.remove(element, [
      'img[src*="t.co/"]',
      'img[src*="analytics.twitter.com"]',
      'img[src*="demdex.net"]',
      'img[src*="doubleclick.net"]',
      'iframe',
      'noscript',
      'link',
      'source',
    ]);

    // Host normalization: the source serves some asset/PDF links from the staging
    // host cms.paramount.com. Rewrite href/src to the canonical www host so links
    // resolve on the live site.
    element.querySelectorAll('a[href*="cms.paramount.com"], [src*="cms.paramount.com"]').forEach((node) => {
      ['href', 'src'].forEach((attr) => {
        const v = node.getAttribute(attr);
        if (v && v.includes('cms.paramount.com')) {
          node.setAttribute(attr, v.replace(/cms\.paramount\.com/g, 'www.paramount.com'));
        }
      });
    });

    // Remove empty paragraphs / headings / links left behind by stripped slider
    // chrome and decorative wrappers (these render as blank gaps / stray markdown).
    Array.from(element.querySelectorAll('p, h1, h2, h3, h4, h5, h6')).forEach((node) => {
      if (!(node.textContent || '').trim() && !node.querySelector('img, picture, iframe, video, a[href]')) {
        node.remove();
      }
    });
    // Dead anchors (empty/"#"/javascript: href). If they carry text or media,
    // unwrap them (keep the content as plain text/heading); if truly empty, drop.
    Array.from(element.querySelectorAll('a')).forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      const dead = !href || href === '#' || href.startsWith('javascript:');
      if (!dead) return;
      const hasContent = (a.textContent || '').trim() || a.querySelector('img, picture');
      if (hasContent) {
        a.replaceWith(...a.childNodes);
      } else {
        a.remove();
      }
    });
  }
}
