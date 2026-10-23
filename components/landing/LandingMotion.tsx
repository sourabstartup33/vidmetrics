'use client';

import { useEffect } from 'react';

// Motion for the landing page only:
// - the header takes the colour of the chapter under it (the signature move)
// - each section's parts rise in once, in reading order
// Content is visible without this script: the `js` class gates every reveal.
export default function LandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');

    // ── Header colour by chapter ─────────────────────────────
    const header = document.querySelector<HTMLElement>('.lp-header');
    const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter-bg]'));
    let frame = 0;
    const paintHeader = () => {
      frame = 0;
      if (!header) return;
      // The chapter at the header's bottom edge: the one about to slide under it
      const probe = header.offsetHeight + 1;
      const under = chapters.find(el => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      if (!under) return;
      header.style.setProperty('--header-bg', under.dataset.chapterBg ?? '');
      header.style.setProperty('--header-ink', under.dataset.chapterInk ?? 'var(--ink)');
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paintHeader);
    };
    paintHeader();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // ── Entrances, once ──────────────────────────────────────
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    const revealed = document.querySelectorAll<HTMLElement>('[data-reveal]');
    revealed.forEach(el => {
      // Anything already above the viewport (a deep link, a restored scroll) shows at once
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in');
      else io.observe(el);
    });


    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io.disconnect();
      cancelAnimationFrame(frame);
      root.classList.remove('js');
    };
  }, []);

  return null;
}
