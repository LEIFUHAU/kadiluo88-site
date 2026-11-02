/* ============================================================
   CATILLO Packaging — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initI18n();
  initScrollReveal();
  initFAQ();
  initAccordion();
  initNavScroll();
  initSmoothScroll();
  initHeroParallax();
  initMouseParallax();
  initLightbox();
  initFeaturedRail();
  initProductCards();
});

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.section__head, .collections, .shapes, .craft-grid, ' +
    '.custom-wrap, .factory-grid, .certs, .details, .faq, .cta-head, .quote-form, .cat-head'
  );

  revealTargets.forEach(function (el) {
    var staggerSet = [
      'collections', 'products', 'shapes', 'craft-grid',
      'certs', 'details', 'faq', 'custom-wrap', 'factory-grid'
    ];
    var altSet = ['collections', 'custom-wrap', 'factory-grid'];
    var isStagger = staggerSet.some(function (c) { return el.classList.contains(c); });
    if (isStagger) {
      el.classList.add('reveal-stagger');
      if (altSet.some(function (c) { return el.classList.contains(c); })) {
        el.classList.add('reveal-stagger--alt');
      }
    } else {
      el.classList.add('reveal');
    }
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------- Hero subtle parallax (desktop only, respects reduced motion) ---------- */
function initHeroParallax() {
  var hero = document.querySelector('.hero');
  var imgWrap = document.querySelector('.hero__image');
  if (!hero || !imgWrap) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ticking = false;
  function update() {
    ticking = false;
    if (window.innerWidth <= 900) { imgWrap.style.transform = ''; return; }
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return;
    var p = (vh - rect.top) / (vh + rect.height);
    p = Math.max(0, Math.min(1, p));
    var y = (0.5 - p) * 26;
    imgWrap.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---------- Hero subtle mouse-follow parallax on the text layer (desktop, restrained) ---------- */
function initMouseParallax() {
  var hero = document.querySelector('.hero');
  var layer = document.querySelector('.hero__text');
  if (!hero || !layer) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targetX = 0, targetY = 0, curX = 0, curY = 0, ticking = false;
  function raf() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    layer.style.transform = 'translate3d(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px,0)';
    if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
      requestAnimationFrame(raf);
    } else { ticking = false; }
  }
  function kick() {
    if (!ticking) { ticking = true; requestAnimationFrame(raf); }
  }
  hero.addEventListener('mousemove', function (e) {
    if (window.innerWidth <= 900) return;
    var r = hero.getBoundingClientRect();
    var nx = (e.clientX - r.left) / r.width - 0.5;
    var ny = (e.clientY - r.top) / r.height - 0.5;
    targetX = nx * 8;
    targetY = ny * 5;
    kick();
  });
  hero.addEventListener('mouseleave', function () {
    targetX = 0; targetY = 0; kick();
  });
}

/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var button = item.querySelector('.faq-item__q');
    if (!button) return;

    button.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all
      faqItems.forEach(function (i) {
        i.classList.remove('is-open');
        var btn = i.querySelector('.faq-item__q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ---------- Category accordion (collapsible product catalog) ---------- */
function initAccordion() {
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section--products'));

  function setOpen(sec, btn, grid, open) {
    if (open) {
      sec.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      grid.classList.remove('anim-in');
      grid.style.height = 'auto';
      var full = grid.scrollHeight;
      grid.style.height = '0px';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          grid.style.height = full + 'px';
          grid.classList.add('anim-in');
        });
      });
      grid.addEventListener('transitionend', function onEnd(e) {
        if (e.propertyName !== 'height') return;
        if (sec.classList.contains('is-open')) grid.style.height = 'auto';
        grid.removeEventListener('transitionend', onEnd);
      });
    } else {
      sec.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      grid.classList.remove('anim-in');
      grid.style.height = grid.scrollHeight + 'px';
      requestAnimationFrame(function () {
        grid.style.height = '0px';
      });
    }
  }

  sections.forEach(function (sec) {
    var btn = sec.querySelector('.cat-toggle');
    var grid = sec.querySelector('.products');
    if (!btn || !grid) return;

    var count = sec.querySelectorAll('.product-card').length;
    var countEl = sec.querySelector('.cat-count');
    if (countEl) {
      var unit = (window.APP_I18N && APP_I18N.currentLang === 'zh') ? ' 款' : ' Models';
      countEl.textContent = count + unit;
    }

    btn.addEventListener('click', function () {
      setOpen(sec, btn, grid, !sec.classList.contains('is-open'));
    });
  });

  function openById(id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    var btn = sec.querySelector('.cat-toggle');
    var grid = sec.querySelector('.products');
    if (!sec.classList.contains('is-open')) setOpen(sec, btn, grid, true);
    setTimeout(function () {
      var y = btn.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 140);
  }

  if (location.hash) {
    var hid = location.hash.slice(1);
    if (sections.some(function (s) { return s.id === hid; })) openById(hid);
  }
  document.querySelectorAll('a[href="#round"], a[href="#square"], a[href="#special"]').forEach(function (a) {
    a.addEventListener('click', function () {
      openById(a.getAttribute('href').slice(1));
    });
  });
}

/* ---------- Nav scroll effect ---------- */
function initNavScroll() {
  var nav = document.getElementById('nav');
  if (!nav) return;

  var lastScroll = 0;
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        var scrollY = window.scrollY;

        if (scrollY > 50) {
          nav.style.boxShadow = '0 1px 20px rgba(26, 26, 26, 0.06)';
        } else {
          nav.style.boxShadow = 'none';
        }

        lastScroll = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ---------- Smooth scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var offsetTop = target.offsetTop - 72;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });
}

/* ---------- Form submission: collect inquiry and open WhatsApp prefilled ---------- */
var WA_BUSINESS_NUMBER = '8618965869753';
function handleSubmit(e) {
  e.preventDefault();

  var form = e.target;
  var btn = form.querySelector('.btn[type="submit"]');
  var lang = (window.APP_I18N && APP_I18N.currentLang) || 'en';
  var submitText = (window.I18N && I18N[lang] && I18N[lang]['cta.submit']) || 'Send Inquiry';

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  var lines = ['Hello CATILLO, I would like to inquire about perfume packaging.'];
  var fields = [
    ['Name', 'name'],
    ['Company', 'company'],
    ['Email', 'email'],
    ['Product Type', 'product'],
    ['Estimated Quantity', 'quantity'],
    ['Message', 'message']
  ];
  fields.forEach(function (pair) {
    var v = val(pair[1]);
    if (v) lines.push(pair[0] + ': ' + v);
  });

  var url = 'https://wa.me/' + WA_BUSINESS_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  window.open(url, '_blank', 'noopener');

  btn.textContent = (window.I18N && I18N[lang] && I18N[lang]['cta.sent']) || 'Inquiry Sent ✓';
  btn.style.opacity = '1';
  btn.style.background = '#B08D57';
  btn.style.borderColor = '#B08D57';
  form.reset();

  setTimeout(function () {
    btn.textContent = submitText;
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.disabled = false;
  }, 3000);
}

/* ---------- Product card enhancements: material, finish tags, custom mark, WhatsApp ask ---------- */
function updateCardLabels() {
  var lang = (window.APP_I18N && APP_I18N.currentLang) || "en";
  var dict = {
    en: { mat: "Material · Glass", custom: "Custom Available", ask: "Inquire on WhatsApp" },
    zh: { mat: "材质 · 玻璃", custom: "支持定制", ask: "WhatsApp 询价" }
  }[lang] || {};
  document.querySelectorAll(".product-card__mat").forEach(function (el) { el.textContent = dict.mat; });
  document.querySelectorAll(".product-card__custom").forEach(function (el) { el.textContent = dict.custom; });
  document.querySelectorAll(".product-card__ask").forEach(function (el) { el.textContent = dict.ask; });
}
window.updateCardLabels = updateCardLabels;

function initProductCards() {
  var tags = {
    round:   { en: ["Spray Coating", "Frosting", "Electroplating"], zh: ["喷涂上色", "蒙砂", "电镀"] },
    square:  { en: ["Spray Coating", "Silk Printing", "Frosting"], zh: ["喷涂上色", "丝印", "蒙砂"] },
    special: { en: ["Custom Mold", "Electroplating", "Ombre / Crackle"], zh: ["开模定制", "电镀", "渐变 / 冰裂纹"] }
  };
  ["round", "square", "special"].forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    sec.querySelectorAll(".product-card").forEach(function (card) {
      var body = card.querySelector(".product-card__body");
      if (!body || body.querySelector(".product-card__meta")) return;

      var meta = document.createElement("div");
      meta.className = "product-card__meta";
      var mat = document.createElement("span");
      mat.className = "product-card__mat";
      var cust = document.createElement("span");
      cust.className = "product-card__custom";
      meta.appendChild(mat);
      meta.appendChild(cust);

      var tagWrap = document.createElement("div");
      tagWrap.className = "product-card__tags";
      var lang = (window.APP_I18N && APP_I18N.currentLang) || "en";
      (tags[id] && tags[id][lang] || []).forEach(function (t) {
        var s = document.createElement("span");
        s.className = "ptag";
        s.textContent = t;
        tagWrap.appendChild(s);
      });

      var name = (card.querySelector(".product-card__name em") || {}).textContent || "";
      var ask = document.createElement("a");
      ask.className = "product-card__ask";
      ask.target = "_blank";
      ask.rel = "noopener";
      ask.addEventListener("click", function (e) {
        e.preventDefault();
        var msg = "Hello CATILLO, I am interested in the " + name + " perfume bottle. Please share available options, finishes and a quotation.";
        window.open("https://wa.me/" + WA_BUSINESS_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      });

      body.appendChild(meta);
      body.appendChild(tagWrap);
      body.appendChild(ask);
    });
  });
  updateCardLabels();
}

/* ---------- Product image lightbox (prev / next within same category) ---------- */
function initLightbox() {
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section--products'));
  if (!sections.length) return;

  var groups = sections.map(function (sec) {
    return Array.prototype.slice.call(sec.querySelectorAll('.product-card')).map(function (card) {
      var img = card.querySelector('.product-card__image img');
      var em = card.querySelector('.product-card__name em');
      var spec = card.querySelector('.product-card__spec');
      return {
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        name: em ? em.textContent : '',
        spec: spec ? spec.textContent : ''
      };
    }).filter(function (item) { return !!item.src; });
  });
  if (!groups.length) return;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML =
    '<button class="lightbox__close" aria-label="Close">✕</button>' +
    '<span class="lightbox__counter"></span>' +
    '<button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">←</button>' +
    '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" alt="" />' +
      '<figcaption class="lightbox__caption"><em></em><p></p></figcaption>' +
    '</figure>' +
    '<button class="lightbox__nav lightbox__nav--next" aria-label="Next">→</button>';
  document.body.appendChild(lb);

  var imgEl = lb.querySelector('.lightbox__img');
  var emEl = lb.querySelector('.lightbox__caption em');
  var pEl = lb.querySelector('.lightbox__caption p');
  var counter = lb.querySelector('.lightbox__counter');
  var cur = { group: 0, index: 0 };

  function render() {
    var item = groups[cur.group][cur.index];
    if (!item) return;
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    emEl.textContent = item.name;
    pEl.textContent = item.spec;
    counter.textContent = (cur.index + 1) + ' / ' + groups[cur.group].length;
  }
  function open(g, i) {
    cur = { group: g, index: i };
    render();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }
  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }
  function step(d) {
    var len = groups[cur.group].length;
    cur.index = (cur.index + d + len) % len;
    render();
  }

  sections.forEach(function (sec, g) {
    var cards = sec.querySelectorAll('.product-card');
    cards.forEach(function (card, i) {
      var wrap = card.querySelector('.product-card__image');
      if (!wrap) return;
      wrap.addEventListener('click', function () { open(g, i); });
    });
  });

  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector('.lightbox__nav--next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
}

/* ---------- Featured works horizontal rail: buttons / wheel / drag / progress ---------- */
function initFeaturedRail() {
  var rail = document.getElementById('featuredRail');
  if (!rail) return;
  var section = rail.closest('.section--featured');
  var bar = section ? section.querySelector('.featured-progress__bar') : null;
  var prev = section ? section.querySelector('.rail-btn[data-dir="-1"]') : null;
  var next = section ? section.querySelector('.rail-btn[data-dir="1"]') : null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cardStep() {
    var card = rail.querySelector('.featured-card');
    return card ? card.getBoundingClientRect().width + 24 : 280;
  }
  function updateProgress() {
    var max = rail.scrollWidth - rail.clientWidth;
    if (bar) {
      var ratio = rail.clientWidth / rail.scrollWidth;
      bar.style.width = (ratio * 100).toFixed(2) + '%';
      var p = max > 0 ? rail.scrollLeft / max : 0;
      var travel = (1 - ratio) * 100;
      bar.style.transform = 'translateX(' + (p * travel).toFixed(2) + '%)';
    }
    if (prev && next) {
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max - 2;
    }
  }

  if (prev) prev.addEventListener('click', function () {
    rail.scrollBy({ left: -cardStep(), behavior: reduced ? 'auto' : 'smooth' });
  });
  if (next) next.addEventListener('click', function () {
    rail.scrollBy({ left: cardStep(), behavior: reduced ? 'auto' : 'smooth' });
  });

  // Vertical wheel -> horizontal shift when the rail can scroll sideways
  rail.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      var max = rail.scrollWidth - rail.clientWidth;
      if (max > 0) { e.preventDefault(); rail.scrollLeft += e.deltaY; }
    }
  }, { passive: false });

  // Desktop mouse drag (touch uses native scrolling)
  var down = false, startX = 0, startLeft = 0;
  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;
    down = true; startX = e.clientX; startLeft = rail.scrollLeft;
    rail.classList.add('dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    rail.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener('pointerup', function () {
    down = false;
    rail.classList.remove('dragging');
  });

  rail.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}
