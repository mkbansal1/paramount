/**
 * Paramount Hero Carousel
 *
 * Three stacked z-layers:
 *   1. BACKGROUND  - large "WE ARE" display text behind the slides
 *   2. MIDDLE      - rotating, full-bleed image-only slides (cross-fade autoplay)
 *   3. FOREGROUND  - "Paramount / A Skydance Corporation" wordmark lockup
 *
 * Authored content (.plain.html):
 *   row 1: [ image cell ][ text cell: <h2>We Are</h2><p><strong>Paramount</strong></p><p>A Skydance Corporation</p> ]
 *   rows 2..n: [ image cell ][ empty cell ]
 *
 * The text cell of the first row provides the BACKGROUND + FOREGROUND copy.
 * Every row's image cell becomes a slide in the MIDDLE layer.
 */

const AUTOPLAY_INTERVAL = 5000;

function showSlide(block, index) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  const total = slides.length;
  if (!total) return;
  let next = index;
  if (next < 0) next = total - 1;
  if (next >= total) next = 0;

  slides.forEach((slide, idx) => {
    const active = idx === next;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  block.dataset.activeSlide = next;
}

function startAutoplay(block) {
  stopAutoplay(block);
  block.dataset.playing = 'true';
  block.autoplayTimer = setInterval(() => {
    const current = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, current + 1);
  }, AUTOPLAY_INTERVAL);
}

function stopAutoplay(block) {
  if (block.autoplayTimer) {
    clearInterval(block.autoplayTimer);
    block.autoplayTimer = null;
  }
  block.dataset.playing = 'false';
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // The first row's text cell holds the live-text copy for the
  // background ("We Are") and foreground (wordmark) layers.
  let bgHeading = '';
  let wordmark = '';
  let tagline = '';
  const firstTextCell = rows[0].children[1];
  if (firstTextCell) {
    const h = firstTextCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (h) bgHeading = h.textContent.trim();
    const ps = firstTextCell.querySelectorAll('p');
    if (ps[0]) wordmark = ps[0].textContent.trim();
    if (ps[1]) tagline = ps[1].textContent.trim();
  }

  // --- MIDDLE layer: image-only slides ---
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-hero-slides';

  rows.forEach((row, idx) => {
    const imageCell = row.children[0];
    const picture = imageCell ? imageCell.querySelector('picture, img') : null;
    if (!picture) return;
    const slide = document.createElement('li');
    slide.className = 'carousel-hero-slide';
    slide.dataset.slideIndex = idx;
    slide.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
    if (idx === 0) slide.classList.add('active');
    const pic = picture.tagName === 'PICTURE' ? picture : picture.closest('picture') || picture;
    slide.append(pic);
    slidesWrapper.append(slide);
  });

  // --- BACKGROUND layer: "WE ARE" display text ---
  const bg = document.createElement('div');
  bg.className = 'carousel-hero-bg';
  bg.setAttribute('aria-hidden', 'true');
  if (bgHeading) {
    const span = document.createElement('span');
    span.textContent = bgHeading;
    bg.append(span);
  }

  // --- FOREGROUND layer: Paramount wordmark lockup ---
  const fg = document.createElement('div');
  fg.className = 'carousel-hero-wordmark';
  if (wordmark) {
    const name = document.createElement('span');
    name.className = 'carousel-hero-wordmark-name';
    name.textContent = wordmark;
    fg.append(name);
  }
  if (tagline) {
    const sub = document.createElement('span');
    sub.className = 'carousel-hero-wordmark-tagline';
    sub.textContent = tagline;
    fg.append(sub);
  }

  // --- Play / pause controls ---
  const controls = document.createElement('div');
  controls.className = 'carousel-hero-controls';
  controls.innerHTML = `
    <button type="button" class="carousel-hero-play" aria-label="Play hero slider">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>
    </button>
    <button type="button" class="carousel-hero-pause" aria-label="Pause hero slider">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
    </button>
  `;

  // --- Assemble layers in stacking order ---
  block.textContent = '';
  block.append(bg, slidesWrapper, fg, controls);

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.dataset.activeSlide = 0;

  // --- Behavior ---
  const slideCount = slidesWrapper.children.length;
  if (slideCount > 1) {
    startAutoplay(block);
    controls.querySelector('.carousel-hero-play').addEventListener('click', () => {
      startAutoplay(block);
    });
    controls.querySelector('.carousel-hero-pause').addEventListener('click', () => {
      stopAutoplay(block);
    });
  } else {
    controls.remove();
  }
}
