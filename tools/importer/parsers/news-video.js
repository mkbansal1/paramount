/* eslint-disable */
/* global WebImporter */
/**
 * Parser for news-video. Base: video.
 * Source: https://www.paramount.com/news/* (YouTube embeds inside .wrapper-rte-block)
 * Generated: 2026-06-23
 *
 * Article-body videos are YouTube <iframe> embeds (youtube-nocookie.com/embed/ID).
 * The site-wide cleanup strips raw <iframe>s in afterTransform, so we convert the
 * embed to a Video block (an <a href> to the watch URL) during the parse phase,
 * before cleanup runs.
 *
 * Block structure (video library convention): 1 cell holding a link to the video.
 */
export default function parse(element, { document }) {
  const src = element.getAttribute('src') || '';
  // Normalise an /embed/ID URL to a canonical youtube.com/watch?v=ID link.
  let href = src;
  const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/);
  if (m) {
    href = `https://www.youtube.com/watch?v=${m[1]}`;
  } else if (/^\/\//.test(src)) {
    href = `https:${src}`;
  }

  if (!href) {
    element.remove();
    return;
  }

  const link = document.createElement('a');
  link.setAttribute('href', href);
  link.textContent = href;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'video',
    cells: [[link]],
  });

  element.replaceWith(block);
}
