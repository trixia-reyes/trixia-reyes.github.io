(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Intro (once per session) ---------- */
  const intro = $('#intro');
  let seen = false;
  try { seen = sessionStorage.getItem('tar-intro') === '1'; } catch (e) {}
  if (reduceMotion || seen) {
    intro.classList.add('is-skipped');
  } else {
    document.body.classList.add('is-locked');
    setTimeout(() => {
      intro.classList.add('is-done');
      document.body.classList.remove('is-locked');
      try { sessionStorage.setItem('tar-intro', '1'); } catch (e) {}
    }, 1500);
    setTimeout(() => intro.classList.add('is-skipped'), 2700);
  }

  /* ---------- Nav: scrolled state, progress bar, active link ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('#navToggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  const links = $$('#navLinks a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // stagger siblings slightly
    revealEls.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      io.observe(el);
    });
  }

  /* ---------- Typing headline ---------- */
  const typed = $('#typed');
  const roles = ['Psychology Educator', 'Researcher', 'Certified HR Associate', 'Research Mentor', 'Lifelong Learner'];
  if (!reduceMotion && typed) {
    let r = 0, c = roles[0].length, deleting = true;
    const tick = () => {
      const word = roles[r];
      if (deleting) {
        c--;
        typed.textContent = word.slice(0, c);
        if (c === 0) { deleting = false; r = (r + 1) % roles.length; }
        setTimeout(tick, 45);
      } else {
        const next = roles[r];
        c++;
        typed.textContent = next.slice(0, c);
        if (c === next.length) { deleting = true; setTimeout(tick, 2000); }
        else setTimeout(tick, 85);
      }
    };
    setTimeout(tick, 3400);
  }

  /* ---------- Counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => cio.observe(el));

  /* ---------- Tab filters (experience + gallery) ---------- */
  const setupTabs = (tabSel, attr, itemSel, itemAttr) => {
    const tabs = $$(tabSel);
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
      const f = t.dataset[attr];
      $$(itemSel).forEach(item => {
        const show = f === 'all' || item.dataset[itemAttr] === f;
        item.classList.toggle('is-hidden', !show);
        if (show) item.classList.add('is-in');
      });
    }));
  };
  setupTabs('[data-filter]', 'filter', '.tl', 'type');
  setupTabs('[data-gfilter]', 'gfilter', '.ph', 'cat');

  /* ---------- Training list toggle ---------- */
  const tList = $('#trainingList');
  const tBtn = $('#trainingToggle');
  if (tBtn) {
    const total = $$('li', tList).length;
    tBtn.addEventListener('click', () => {
      const open = tList.classList.toggle('is-open');
      tBtn.setAttribute('aria-expanded', open);
      tBtn.textContent = open ? 'Show fewer' : `Show all ${total}`;
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let current = 0, lastFocus = null;
  const visiblePhotos = () => $$('.ph').filter(p => !p.classList.contains('is-hidden'));
  const show = i => {
    const list = visiblePhotos();
    current = (i + list.length) % list.length;
    const fig = list[current];
    const img = $('img', fig);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = $('figcaption', fig).innerHTML;
  };
  const open = fig => {
    lastFocus = document.activeElement;
    show(visiblePhotos().indexOf(fig));
    lb.hidden = false;
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  };
  $$('.ph button').forEach(b => b.addEventListener('click', () => open(b.closest('.ph'))));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(current - 1));
  $('#lbNext').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [$('#lbClose'), $('#lbPrev'), $('#lbNext')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // swipe on touch
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- Regional LinkedIn link ---------- */
  const regions = {
    'Asia/Manila': 'ph',
    'Asia/Singapore': 'sg',
    'Asia/Bangkok': 'th',
    'Asia/Ho_Chi_Minh': 'vn',
    'Asia/Saigon': 'vn',
    'Asia/Hong_Kong': 'hk',
    'Asia/Kuala_Lumpur': 'my',
    'Asia/Jakarta': 'id',
    'Asia/Kolkata': 'in',
    'Asia/Calcutta': 'in',
  };
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sub = regions[tz];
    if (sub) $('#linkedinLink').href = `https://${sub}.linkedin.com/in/trixia-anne-reyes/`;
  } catch (e) {}

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
