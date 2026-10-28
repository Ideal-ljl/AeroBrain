// Nav border once the page scrolls.
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Highlight the nav link of the section in view.
const links = new Map([...document.querySelectorAll('.nav-links a')].map(a => [a.getAttribute('href').slice(1), a]));
const spy = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach(a => a.classList.remove('is-active'));
    links.get(e.target.id)?.classList.add('is-active');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

// Flight carousel: swipe, arrows, dots or arrow keys. Only the visible flight plays,
// and a finished flight moves on to the next one.
const carousel = document.querySelector('.carousel');
if (carousel) {
  const track = carousel.querySelector('.track');
  const slides = [...track.querySelectorAll('.slide')];
  const videos = slides.map(s => s.querySelector('video'));
  const dots = [...carousel.querySelectorAll('.dots button')];
  const [prev, next] = carousel.querySelectorAll('.cbtn');
  const count = carousel.querySelector('.count');
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0, inView = false;

  const sync = () => {
    videos.forEach((v, i) => {
      if (i === current && inView && autoplay) v.play().catch(() => {});
      else v.pause();
    });
    dots.forEach((d, i) => d.setAttribute('aria-current', i === current));
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    count.textContent = `${current + 1} / ${slides.length}`;
    track.style.height = `${slides[current].offsetHeight}px`;   // no gap under shorter slides
  };
  new ResizeObserver(() => { track.style.height = `${slides[current].offsetHeight}px`; }).observe(slides[0]);
  const go = i => track.scrollTo({ left: slides[(i + slides.length) % slides.length].offsetLeft });

  const slideSpy = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { current = slides.indexOf(e.target); sync(); }
  }, { root: track, threshold: 0.6 });
  slides.forEach(s => slideSpy.observe(s));

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.4 }).observe(track);

  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  videos.forEach((v, i) => v.addEventListener('ended', () => { if (i === current) go(i + 1); }));
  carousel.addEventListener('keydown', e => {
    if (e.target.tagName === 'VIDEO') return;   // the player uses arrow keys for seeking
    if (e.key === 'ArrowLeft') go(current - 1);
    if (e.key === 'ArrowRight') go(current + 1);
  });
  sync();
}

// Copy buttons.
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = document.querySelector(btn.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Press ⌘C';
      getSelection().selectAllChildren(document.querySelector(btn.dataset.copy));
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  });
});
