/**
 * Share control — a "Share" affordance that reveals copy-link + social options
 * for the current page. Sits in the press-release byline row beside "By Paramount
 * Staff". Auto-blocked on press pages, so it needs no authored content.
 */
const NETWORKS = [
  { key: 'copy', label: 'Copy link' },
  { key: 'email', label: 'Share via Email' },
  { key: 'facebook', label: 'Share on Facebook' },
  { key: 'x', label: 'Share on X' },
  { key: 'linkedin', label: 'Share on LinkedIn' },
];

function shareUrl(key, url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (key) {
    case 'email': return `mailto:?subject=${t}&body=${u}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'x': return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    default: return url;
  }
}

export default function decorate(block) {
  block.textContent = '';
  const url = window.location.href;
  const title = document.title;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'share-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'share');
  btn.innerHTML = '<span>Share</span>';

  const menu = document.createElement('ul');
  menu.className = 'share-menu';
  NETWORKS.forEach(({ key, label }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = label;
    a.className = `share-${key}`;
    if (key === 'copy') {
      a.href = url;
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await navigator.clipboard.writeText(url); a.textContent = 'Link copied'; } catch { /* noop */ }
      });
    } else {
      a.href = shareUrl(key, url, title);
      if (key !== 'email') a.target = '_blank';
      a.rel = 'noopener';
    }
    li.append(a);
    menu.append(li);
  });

  const toggle = (open) => {
    block.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => toggle(!block.classList.contains('open')));
  document.addEventListener('click', (e) => { if (!block.contains(e.target)) toggle(false); });

  block.append(btn, menu);
}
