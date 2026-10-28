// Natigilah Ventures — site interactions + order form
(function () {
'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  //Dark mode
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  function syncThemeLabel() {
    themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncThemeLabel();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    syncThemeLabel();
  });

  //Mobile nav
  const navToggle = $('#navToggle'), navMenu = $('#navMenu');
  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  }
  navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
  $$('a', navMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });

  //Header shrink, back-to-top
  const header = $('header.site'), toTop = $('#toTop');
  function onScroll() {
    header.classList.toggle('scrolled', scrollY > 30);
    toTop.classList.toggle('show', scrollY > 600);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  //Highlight current section in nav
  const links = $$('#navMenu a.link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); if (s) spy.observe(s); });

  //Tabs (About)
  const tabs = $$('.tab');
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); selectTab(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  //Product gallery + lightbox
  const photos = [
    { cat: 'Handkerchiefs', title: 'Handkerchiefs', src: '' },
    { cat: 'Nail Cutters',  title: 'Nail Cutters',  src: 'Images/Nailcutter-1.jpeg' },
    { cat: 'Face Towels',   title: 'Face Towels',   src: 'Images/Facetowel-1.jpeg' },
    { cat: 'Spices',        title: 'Spices',        src: 'Images/Spices-1.jpeg' },
    { cat: 'Handkerchiefs', title: 'Handkerchiefs ', src: '' },
    { cat: 'Nail Cutters',  title: 'Nail Cutters ',  src: 'Images/Nailcutter-2.jpeg' },
    { cat: 'Face Towels',   title: 'Face Towels ',   src: 'Images/Facetowel-2.jpeg' },
    { cat: 'Spices',        title: 'Spices ',        src: 'Images/Spices-2.jpeg' }
  ];
  const gallery = $('#gallery');
  const media = p => p.src
    ? `<img src="${p.src}" alt="${p.title}" loading="lazy">`
    : `<div class="ph" role="img" aria-label="${p.title}">${p.title}</div>`;
  gallery.innerHTML = photos.map((p, i) =>
    `<button class="g-item reveal" data-i="${i}" data-cat="${p.cat}" aria-label="View ${p.title}">${media(p)}<span class="cap">${p.title}</span></button>`
  ).join('');

  $$('.filter').forEach(f => f.addEventListener('click', () => {
    $$('.filter').forEach(x => x.classList.toggle('on', x === f));
    $$('.g-item').forEach(g => { g.hidden = f.dataset.cat !== 'all' && g.dataset.cat !== f.dataset.cat; });
  }));

  const lb = $('#lightbox'), stage = $('#lbStage');
  let cur = 0, lastFocus;
  const visible = () => $$('.g-item').filter(g => !g.hidden).map(g => +g.dataset.i);
  function show(i) {
    cur = i;
    const p = photos[i];
    stage.innerHTML = media(p) + `<p>${p.title}</p>`;
  }
  function step(d) {
    const v = visible(); if (!v.length) return;
    show(v[(v.indexOf(cur) + d + v.length) % v.length]);
  }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  gallery.addEventListener('click', e => { const g = e.target.closest('.g-item'); if (g) openLb(+g.dataset.i); });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLb(); setMenu(false); }
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    }
  });

  //Scroll reveal
  const targets = $$('.hero-grid > *, .section-head, .filters, .service-card, .step, .contact-grid > *, .tabs, .about-logo');
  targets.forEach(t => t.classList.add('reveal'));
  $$('.services-grid, .steps, .gallery').forEach(grp =>
    $$('.reveal', grp).forEach((el, i) => el.style.setProperty('--d', (i % 4) * 0.08 + 's')));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  //"Get a quote" pre-fills the form 
  $$('a.quote').forEach(link => link.addEventListener('click', () => {
    const svc = link.dataset.service, msg = $('#message');
    if (svc && !msg.value) msg.value = 'Service needed: ' + svc + '\n';
  }));

    //Hero slider
  const slider = $('#slider');
  if (slider) {
    const slides = $$('.slide', slider), dotsBox = $('.sl-dots', slider), pauseBtn = $('.sl-pause', slider);
    let idx = 0, timer = null, userPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { stop(); if (!userPaused) timer = setInterval(() => go(idx + 1), 5500); };
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsBox.appendChild(b);
      return b;
    });
    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === idx));
      dots.forEach((d, n) => d.setAttribute('aria-current', n === idx));
      play();
    }
    $('.sl-prev', slider).addEventListener('click', () => go(idx - 1));
    $('.sl-next', slider).addEventListener('click', () => go(idx + 1));
    pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
      play();
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', play);
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });
    let x0 = null;
    slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    // "See spices" etc. also selects that product in the gallery filter
    $$('[data-filter]', slider).forEach(a => a.addEventListener('click', () => {
      const f = $('.filter[data-cat="' + a.dataset.filter + '"]');
      if (f) f.click();
    }));
    go(0);
  }

  //Contact form (EmailJS)
  const CONFIG = {
    PUBLIC_KEY: "MLj1BBoLmddTyWMBg",
    SERVICE_ID: "service_23bs9ts",
    TEMPLATE_ID: "template_604awbv",
  };

  const form = $('#quoteForm'), formMsg = $('#formMsg');
  if (form) {
    const submitBtn = $('button[type="submit"]', form);
    const fields = $$('input, select, textarea', form);
    const say = (text, cls) => { formMsg.className = 'show ' + (cls || ''); formMsg.textContent = text; };
    // Read a field by name; returns '' if the form doesn't have that field.
    const val = n => (form.elements[n] ? form.elements[n].value.trim() : '');

    if (window.emailjs) emailjs.init(CONFIG.PUBLIC_KEY);

    fields.forEach(f => {
      f.addEventListener('blur', () => f.classList.toggle('invalid', !f.checkValidity()));
      f.addEventListener('input', () => { if (f.checkValidity()) f.classList.remove('invalid'); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = fields.filter(f => !f.checkValidity());
      fields.forEach(f => f.classList.toggle('invalid', bad.includes(f)));
      if (bad.length) { bad[0].focus(); return; }

      if (!window.emailjs) {
        say("Couldn't send automatically — please call us at 0715 665 980.", 'err');
        return;
      }

      const data = {
        name: val('name'),
        phone: val('phone'),
        email: val('email'),
        service: val('service'),
        location: val('location'),
        date: val('date'),
        details: val('details') || val('message')
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      say('', '');

      emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, data)
        .then(() => {
          say("Thanks you for your request — we've received it and will get in touch shortly.", 'ok');
          form.reset();
        })
        .catch(err => {
          console.error('EmailJS error:', err);
          say("Couldn't send automatically — please call us at 0715 665 980.", 'err');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send request';
        });
    });
  }
})();