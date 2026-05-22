/* ============================================================
   BlogScape — Home.js
   Companion script for Home.ejs
   ============================================================ */
 
(function () {
  'use strict';
 
  /* ──────────────────────────────────────────────
     1. CUSTOM CURSOR
     Dot follows mouse instantly; ring follows lazily.
  ────────────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
 
  if (cursor && ring) {
    let mx = 0, my = 0; // mouse position
    let rx = 0, ry = 0; // ring position (lagged)
 
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
 
    // Animate ring with lerp (smooth lag)
    (function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateRing);
    })();
 
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      ring.style.opacity   = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      ring.style.opacity   = '0.6';
    });
  }
 
  /* ──────────────────────────────────────────────
     2. NAVBAR — add .scrolled class on scroll
  ────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
 
  if (navbar) {
    const handleNavScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
  }
 
  /* ──────────────────────────────────────────────
     3. SCROLL-TRIGGERED REVEAL
     Watches .reveal-up, .reveal-left, .reveal-right
     and adds .visible when they enter the viewport.
  ────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after reveal so it doesn't re-trigger
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
 
  document
    .querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach((el) => revealObserver.observe(el));
 
  /* ──────────────────────────────────────────────
     4. FEATURE PILLS — staggered reveal
     Uses a separate observer so pills animate
     in one-by-one when the strip enters view.
  ────────────────────────────────────────────── */
  const featuresStrip = document.querySelector('.features-strip');
 
  if (featuresStrip) {
    const pillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pills = document.querySelectorAll('.feat-pill');
            pills.forEach((pill, i) => {
              setTimeout(() => {
                pill.style.transition =
                  'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s, color 0.3s';
                pill.style.opacity   = '1';
                pill.style.transform = 'translateY(0)';
              }, i * 60);
            });
            pillObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    pillObserver.observe(featuresStrip);
  }
 
  /* ──────────────────────────────────────────────
     5. HERO IMAGE PARALLAX
     Shifts the main hero photo slightly on scroll
     for a subtle depth effect.
  ────────────────────────────────────────────── */
  const heroMainImg = document.querySelector('.vis-img-main');
 
  if (heroMainImg) {
    window.addEventListener(
      'scroll',
      () => {
        const sy = window.scrollY;
        heroMainImg.style.transform = `translateY(${sy * 0.04}px)`;
      },
      { passive: true }
    );
  }
 
  /* ──────────────────────────────────────────────
     6. SMOOTH ANCHOR SCROLLING
     Catches all internal hash-link clicks and
     scrolls smoothly, accounting for fixed navbar.
  ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
 
      const target = document.querySelector(targetId);
      if (!target) return;
 
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
 
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
 
  /* ──────────────────────────────────────────────
     7. BLOG CARD TILT (subtle 3-D on hover)
     Adds a gentle perspective tilt to each card
     based on mouse position within the card.
  ────────────────────────────────────────────── */
  document.querySelectorAll('.blog-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const xRel   = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
      const yRel   = (e.clientY - rect.top)  / rect.height - 0.5;
      const rotY   =  xRel * 6;  // max 6 deg
      const rotX   = -yRel * 4;  // max 4 deg
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px)`;
    });
 
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s';
    });
 
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, box-shadow 0.4s';
    });
  });
 
  /* ──────────────────────────────────────────────
     8. ANIMATED COUNTER — hero stats
     Counts up numbers when they enter viewport.
  ────────────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    let start     = 0;
    const step    = target / (duration / 16);
    const isFloat = target % 1 !== 0;
 
    const tick = () => {
      start = Math.min(start + step, target);
      el.textContent = (isFloat ? start.toFixed(1) : Math.floor(start)) + suffix;
      if (start < target) requestAnimationFrame(tick);
    };
    tick();
  }
 
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
 
        const statNums = entry.target.querySelectorAll('.stat-num');
        statNums.forEach((numEl) => {
          const raw     = numEl.dataset.value || '';
          const numeric = parseFloat(raw);
          const suffix  = numEl.dataset.suffix || '';
          if (!isNaN(numeric)) {
            animateCounter(numEl.querySelector('span') || numEl, numeric, suffix, 1200);
          }
        });
        statsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
 
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);
 
})();