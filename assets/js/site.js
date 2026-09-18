// Shared behaviour for generated landing pages (nav, FAQ accordion, quote form).
(function () {
  'use strict';

  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  /* The drawer closes on a tap outside it, on Escape, on any link inside it,
     and if the viewport grows past the breakpoint while it is open. Focus
     moves into the panel on open and back to the button on close, and the
     panel is inert while closed so its links stay out of the tab order.
     Mirrors the block in index.html. */
  if (toggle && mobileMenu) {
    var mmPanel = mobileMenu.querySelector('.mm-panel');
    var scrim = mobileMenu.querySelector('[data-mm-close]');

    var setMenu = function (open) {
      body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
      if (mmPanel) {
        if (open) { mmPanel.removeAttribute('inert'); } else { mmPanel.setAttribute('inert', ''); }
      }
      body.style.overflow = open ? 'hidden' : '';
      if (open) {
        if (mmPanel) mmPanel.focus({ preventScroll: true });
      } else if (document.activeElement && mobileMenu.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }
    };

    if (mmPanel) mmPanel.setAttribute('inert', '');
    toggle.addEventListener('click', function () {
      setMenu(!body.classList.contains('menu-open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    if (scrim) scrim.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
    });
    var wideMq = window.matchMedia('(min-width: 769px)');
    var closeIfWide = function (e) {
      if (e.matches && body.classList.contains('menu-open')) setMenu(false);
    };
    if (wideMq.addEventListener) wideMq.addEventListener('change', closeIfWide);
    else wideMq.addListener(closeIfWide);
  }

  // Hero video: a looping background clip is motion, so honour the OS setting
  var heroVideo = document.getElementById('hero-video');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  // SMS consent: the short line carries the load-bearing disclosure, the rest
  // expands. Desktop CSS shows it all and hides this button.
  var smsToggle = document.getElementById('sms-toggle');
  var smsMore = document.getElementById('sms-more');
  if (smsToggle && smsMore) {
    smsToggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = smsMore.hasAttribute('hidden');
      if (open) { smsMore.removeAttribute('hidden'); } else { smsMore.setAttribute('hidden', ''); }
      smsToggle.setAttribute('aria-expanded', String(open));
      smsToggle.textContent = open ? 'Show less' : 'Read more';
    });
  }

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.parentElement.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });

  var nav = document.querySelector('.topnav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  // ---- quote form -------------------------------------------------------
  var form = document.getElementById('quote-form');
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };
  var setError = function (id, msg) { var el = $(id); if (el) el.textContent = msg; };
  var clearError = function (id) { setError(id, ''); };

  // Step form (the West Virginia test): route, then move details, then contact.
  // Only the route is required to move on; each step shown is reported to GA.
  var steps = form.hasAttribute('data-steps') ? [].slice.call(form.querySelectorAll('.qs-step')) : null;
  var current = 0;
  var track = function (name, params) { if (typeof gtag === 'function') gtag('event', name, params); };

  function showStep(i) {
    steps.forEach(function (el, k) { el.hidden = k !== i; el.classList.toggle('is-active', k === i); });
    [].forEach.call(form.querySelectorAll('.qs-bar i'), function (bar, k) { bar.classList.toggle('is-done', k <= i); });
    $('qs-num').textContent = i + 1;
    current = i;
    // Mouse users land in the first field; touch skips it so no keyboard pops up.
    var first = steps[i].querySelector('select, input');
    if (first && window.matchMedia('(pointer: fine)').matches) first.focus({ preventScroll: true });
  }

  function nextStep() {
    if (current === 0) {
      var ok = true;
      if (!$('qf-from').value) { setError('error-from', 'Please select your origin state.'); ok = false; }
      if (!$('qf-to').value) { setError('error-to', 'Please select your destination state.'); ok = false; }
      if (!ok) return;
    }
    showStep(current + 1);
    track('quote_form_step', { step: current + 1, form_variant: 'steps_phone_email' });
  }

  if (steps) {
    form.addEventListener('click', function (e) {
      if (e.target.closest('.qs-next')) nextStep();
      else if (e.target.closest('.qs-back')) showStep(current - 1);
    });
  }

  // Planned move date: a native date field draws its placeholder and value in
  // the visitor's OS language (Arabic on an Arabic Mac, etc.). It rests as a
  // text field with an English MM/DD/YYYY hint, becomes a real date field when
  // touched so phones still get their native picker, and writes the chosen
  // date back as MM/DD/YYYY — which is also what goes into the quote email.
  (function () {
    var input = $('qf-date');
    if (!input) return;
    var lastPointer = '';
    function toDate() {
      if (input.type === 'date') return;
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.value);
      input.type = 'date';
      input.value = m ? m[3] + '-' + m[1] + '-' + m[2] : '';
    }
    function toText() {
      if (input.type !== 'date') return;
      var v = input.value;
      input.type = 'text';
      input.value = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.slice(5, 7) + '/' + v.slice(8, 10) + '/' + v.slice(0, 4) : '';
    }
    input.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; toDate(); });
    input.addEventListener('focus', toDate);
    input.addEventListener('blur', toText);
    // Desktop: open the calendar on click. Touch devices open their own picker.
    input.addEventListener('click', function () {
      if (lastPointer === 'mouse' && input.showPicker) { try { input.showPicker(); } catch (err) {} }
    });
    // Enter pressed inside the field submits without a blur: normalise first.
    document.addEventListener('submit', function (e) { if (e.target === form) toText(); }, true);
  })();

  [['qf-from', 'error-from'], ['qf-to', 'error-to'], ['qf-name', 'error-name'],
   ['qf-email', 'error-email'], ['qf-phone', 'error-phone']].forEach(function (pair) {
    var field = $(pair[0]);
    if (!field) return;
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', function () {
      clearError(pair[1]);
    });
  });

  var sms = $('qf-sms');
  if (sms) {
    sms.addEventListener('change', function () {
      if (sms.checked) setError('sms-error', '');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Enter pressed on an earlier step advances instead of submitting.
    if (steps && current < steps.length - 1) { nextStep(); return; }

    var from = $('qf-from').value;
    var to = $('qf-to').value;
    var nameEl = $('qf-name');
    var name = nameEl ? nameEl.value.trim() : '';
    var email = $('qf-email').value.trim();
    var phoneEl = $('qf-phone');
    var phone = phoneEl ? phoneEl.value.trim() : '';
    var valid = true;

    if (!from) { setError('error-from', 'Please select your origin state.'); valid = false; }
    if (!to) { setError('error-to', 'Please select your destination state.'); valid = false; }
    if (nameEl && !name) { setError('error-name', 'Please enter your name.'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('error-email', 'Please enter a valid email address.'); valid = false;
    }
    if (phoneEl && !phone) { setError('error-phone', 'Please enter your phone number.'); valid = false; }
    if (sms && !sms.checked) {
      setError('sms-error', 'Please agree to receive text messages to continue.'); valid = false;
    }

    if (!valid) {
      var firstError = form.querySelector('.field-error:not(:empty), .sms-error:not(:empty)');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    function showSubmitError(msg) {
      var errDiv = form.querySelector('.form-submit-error');
      if (!errDiv) {
        errDiv = document.createElement('div');
        errDiv.className = 'form-submit-error';
        btn.insertAdjacentElement('beforebegin', errDiv);
      }
      errDiv.textContent = msg;
      btn.textContent = btnLabel;
      btn.disabled = false;
    }

    var message = [
      'Moving from: ' + from,
      'Moving to: ' + to,
      $('qf-size').value ? 'Home size: ' + $('qf-size').value : null,
      $('qf-date').value ? 'Planned move date: ' + $('qf-date').value : null,
      $('qf-notes') && $('qf-notes').value.trim() ? 'Notes: ' + $('qf-notes').value.trim() : null,
      sms ? 'SMS opt-in: ' + (sms.checked ? 'Yes' : 'No') : null,
      steps ? 'Form: 3-step, phone + email (test)' : null,
      'Landing page: ' + window.location.pathname,
    ].filter(Boolean).join('\n');

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, message: message }),
    }).then(function (res) {
      if (res.ok) {
        gtag('event', 'conversion', {'send_to': 'AW-18314228447/zfVSCMKZ1PYcEN_l85xE'});
        form.innerHTML =
          '<div class="form-success">' +
          '<div class="success-icon">✓</div>' +
          '<h3>Quote request received!</h3>' +
          '<p>We\'ll send you a detailed, fixed quote same day.<br>In the meantime, feel free to call ' +
          '<a href="tel:+18885051086">+1 (888) 505-1086</a>.</p></div>';
        return;
      }
      return res.json().catch(function () { return {}; }).then(function (data) {
        showSubmitError(data.error || 'Something went wrong. Please try again or call us.');
      });
    }).catch(function () {
      showSubmitError('Could not connect. Please call us at +1 (888) 505-1086.');
    });
  });

  // ---- states / cities toggle (matches index.html's toggleStates) ---------
  var statesToggle = document.getElementById('states-toggle');
  var statesGrid = document.getElementById('states-grid');
  if (statesToggle && statesGrid) {
    var label = statesToggle.querySelector('span') || statesToggle;
    var collapsedLabel = label.textContent;
    statesToggle.addEventListener('click', function () {
      var expanded = statesGrid.classList.toggle('expanded');
      statesToggle.setAttribute('aria-expanded', expanded);
      label.textContent = expanded ? 'Show fewer' : collapsedLabel;
    });
  }

  // ---- scroll reveal (same targets and stagger as index.html) -------------
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var staggerSelectors = ['.trust-item', '.svc-row', '.service-card', '.process-step', '.gallery-item', '.footer-col', '.faq-item'];
  staggerSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      var siblings = [].slice.call(el.parentElement.children).filter(function (c) { return c.matches(sel); });
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.09, 0.36) + 's';
    });
  });

  var revealTargets = document.querySelectorAll(
    '.section-header, .svc-intro, .trust-item, .svc-row, .service-card, .process-step, .gallery-item, .faq-item, ' +
    '.footer-brand, .footer-col, .cs-text, .cs-ctas, .states-grid'
  );
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  revealTargets.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('reveal', 'visible');
    } else {
      el.classList.add('reveal');
      observer.observe(el);
    }
  });
})();

/* Collapsible rows (state pages only) — price drivers, local notes, quirks.
 *
 * Each is a <details open> in the markup so that with JS disabled the desktop
 * layout is correct and nothing is hidden. Below 769px these sections stack to
 * screens of solid text, so they collapse to headings and open one at a time.
 * Re-evaluated on resize; a row the visitor opened themselves is left alone
 * while they stay on that side of the breakpoint.
 *
 * .js-collapse is the behaviour hook and carries no styling — each section
 * keeps its own look. */
(function () {
  var rows = document.querySelectorAll('.js-collapse');
  if (!rows.length) return;

  var wide = window.matchMedia('(min-width: 769px)');
  var lastWide = null;

  function apply() {
    if (wide.matches === lastWide) return;
    lastWide = wide.matches;
    rows.forEach(function (row) { row.open = wide.matches; });
  }

  apply();
  if (wide.addEventListener) wide.addEventListener('change', apply);
  else wide.addListener(apply);
})();

/* Services: on phones the six colour cards collapse to an index and open one
 * at a time — six paragraphs open at once was the longest scroll on the page.
 * Wired here rather than in the markup so a browser without JS just gets all
 * six open, which is the desktop layout. Mirrors the block in index.html. */
(function () {
  var rows = [].slice.call(document.querySelectorAll('#services .svc-row'));
  if (!rows.length) return;
  var phone = window.matchMedia('(max-width: 768px)');

  function open(row, isOpen) {
    row.classList.toggle('is-open', isOpen);
    row.querySelector('.svc-head').setAttribute('aria-expanded', String(isOpen));
  }

  function sync() {
    rows.forEach(function (row, i) {
      var head = row.querySelector('.svc-head');
      var body = row.querySelector('.svc-body');
      if (!phone.matches) {
        row.classList.remove('is-collapsible', 'is-open');
        ['role', 'tabindex', 'aria-expanded', 'aria-controls'].forEach(function (attr) {
          head.removeAttribute(attr);
        });
        return;
      }
      row.classList.add('is-collapsible');
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-controls', body.id);
      // The first service stays open so the pattern is obvious on arrival.
      open(row, i === 0);
    });
  }

  rows.forEach(function (row) {
    var head = row.querySelector('.svc-head');
    head.addEventListener('click', function () {
      if (!row.classList.contains('is-collapsible')) return;
      var willOpen = !row.classList.contains('is-open');
      rows.forEach(function (r) { open(r, false); });
      open(row, willOpen);
    });
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
    });
  });

  sync();
  if (phone.addEventListener) phone.addEventListener('change', sync);
  else phone.addListener(sync);
})();

/* Marks the nav link for the section you are currently reading.
 *
 * The state pages run to eleven screens, so without this the bar gives no
 * sense of position. Driven by whichever observed section currently covers the
 * point just below the nav, rather than by "most visible" — that flickers when
 * a short section sits between two tall ones. */
(function () {
  // The drawer's rows are marked too, so opening it mid-page shows where you
  // are rather than six identical rows.
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"], .mm-nav a[href^="#"]')
  );
  if (!links.length) return;

  var pairs = links.map(function (link) {
    return { link: link, section: document.getElementById(link.hash.slice(1)) };
  }).filter(function (p) { return p.section; });
  if (!pairs.length) return;

  // Document order, not nav order — the two agree today but the nav is edited
  // far more often than this file.
  pairs.sort(function (a, b) {
    return a.section.getBoundingClientRect().top - b.section.getBoundingClientRect().top;
  });

  var current = null;

  function update() {
    var line = (parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72) + 8;
    var found = null;

    // The last section whose top has passed the line, rather than the one
    // covering it. Several sections are not in the nav at all, and requiring
    // coverage blanked the indicator out every time you scrolled through one.
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].section.getBoundingClientRect().top <= line) found = pairs[i].link;
    }


    if (found === current) return;
    links.forEach(function (l) { l.classList.remove('is-current'); });
    if (found) {
      // Mark every link pointing at that section — the bar's and the drawer's.
      links.forEach(function (l) {
        if (l.hash === found.hash) l.classList.add('is-current');
      });
    }
    current = found;
  }

  // Called straight from the scroll listener rather than gated behind a
  // requestAnimationFrame flag: the flag latches on permanently if a frame
  // never arrives, and reading six rects is cheap enough not to need it.
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
})();

/* "Read more" on the photo-hero page's state intro, which phones clamp to four
   lines. */
(function () {
  document.querySelectorAll('.ph-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.parentElement.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Show less' : 'Read more';
    });
  });
})();
