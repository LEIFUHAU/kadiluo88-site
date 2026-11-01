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
});

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.section__head, .collections, .shapes, .craft-grid, ' +
    '.custom-wrap, .factory-grid, .certs, .details, .faq, .cta-head, .quote-form, .cat-head'
  );

  revealTargets.forEach(function (el) {
    if (el.classList.contains('collections') ||
        el.classList.contains('products') ||
        el.classList.contains('shapes') ||
        el.classList.contains('craft-grid') ||
        el.classList.contains('certs') ||
        el.classList.contains('details') ||
        el.classList.contains('faq')) {
      el.classList.add('reveal-stagger');
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

/* ---------- Form submission ---------- */
function handleSubmit(e) {
  e.preventDefault();

  var form = e.target;
  var btn = form.querySelector('.btn[type="submit"]');
  var lang = (window.APP_I18N && APP_I18N.currentLang) || 'en';
  var submitText = (window.I18N && I18N[lang] && I18N[lang]['cta.submit']) || 'Send Inquiry';

  btn.textContent = (window.I18N && I18N[lang] && I18N[lang]['cta.sending']) || 'Sending...';
  btn.style.opacity = '0.6';
  btn.disabled = true;

  setTimeout(function () {
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
  }, 1200);
}
