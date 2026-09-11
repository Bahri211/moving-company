// Shared behaviour for generated landing pages (nav, FAQ accordion, quote form).
(function () {
  'use strict';

  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
      });
    });
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

  // ---- stepped quote form (design trial, .qf2 only) ----------------------
  // Pages without the trial card have no .qf2-panel, so this whole block is
  // inert on them and the form stays the single-panel one it has always been.
  var panels = [].slice.call(form.querySelectorAll('.qf2-panel'));
  var stepOf = function () { return 1; };
  if (panels.length) {
    var stepItems = [].slice.call(document.querySelectorAll('#qf2-steps li'));
    var nextBtn = document.getElementById('qf2-next');
    var backBtn = document.getElementById('qf2-back');
    var sendBtn = form.querySelector('.qf2-send');
    var step = 1;
    stepOf = function () { return step; };

    // Per-step gate. Step 2 is optional, so it has no entry — everything
    // required is validated again on submit regardless.
    var checks = {
      1: [
        ['qf-from', 'error-from', 'Please select your origin state.'],
        ['qf-to', 'error-to', 'Please select your destination state.'],
      ],
      3: [
        ['qf-name', 'error-name', 'Please enter your name.'],
        ['qf-email', 'error-email', 'Please enter a valid email address.'],
        ['qf-phone', 'error-phone', 'Please enter your phone number.'],
      ],
    };

    var validateStep = function (n) {
      var ok = true;
      (checks[n] || []).forEach(function (c) {
        var v = ($(c[0]).value || '').trim();
        if (c[0] === 'qf-email') {
          if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError(c[1], c[2]); ok = false; }
        } else if (!v) { setError(c[1], c[2]); ok = false; }
      });
      return ok;
    };

    var render = function (focus) {
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === String(step));
      });
      stepItems.forEach(function (li) {
        var n = Number(li.getAttribute('data-step'));
        li.classList.toggle('is-current', n === step);
        li.classList.toggle('is-done', n < step);
      });
      var fill = document.getElementById('qf2-fill');
      if (fill) fill.style.width = (step / panels.length * 100) + '%';
      backBtn.hidden = step === 1;
      nextBtn.hidden = step === panels.length;
      sendBtn.hidden = step !== panels.length;
      if (!focus) return;
      var first = panels[step - 1].querySelector('input, select');
      // Focusing a select on a phone pops the picker open unasked, so only
      // the card is scrolled into view there.
      if (first && !('ontouchstart' in window)) first.focus();
    };

    nextBtn.addEventListener('click', function () {
      if (!validateStep(step)) {
        var e1 = panels[step - 1].querySelector('.field-error:not(:empty)');
        if (e1) e1.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (step < panels.length) { step += 1; render(true); }
    });

    backBtn.addEventListener('click', function () {
      if (step > 1) { step -= 1; render(true); }
    });

    // Enter in a text field should advance the step, not submit from step 1.
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || step === panels.length) return;
      if (e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      nextBtn.click();
    });

    render(false);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var from = $('qf-from').value;
    var to = $('qf-to').value;
    var name = $('qf-name').value.trim();
    var email = $('qf-email').value.trim();
    var phone = $('qf-phone').value.trim();
    var valid = true;

    if (!from) { setError('error-from', 'Please select your origin state.'); valid = false; }
    if (!to) { setError('error-to', 'Please select your destination state.'); valid = false; }
    if (!name) { setError('error-name', 'Please enter your name.'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('error-email', 'Please enter a valid email address.'); valid = false;
    }
    if (!phone) { setError('error-phone', 'Please enter your phone number.'); valid = false; }
    if (!sms.checked) {
      setError('sms-error', 'Please agree to receive text messages to continue.'); valid = false;
    }

    if (!valid) {
      // On the stepped card the offending field may be on a panel that is not
      // showing, so walk back to it before scrolling — otherwise the message
      // is written into a hidden div and the visitor sees nothing happen.
      var firstError = form.querySelector('.field-error:not(:empty), .sms-error:not(:empty)');
      if (firstError) {
        var panel = firstError.closest && firstError.closest('.qf2-panel');
        if (panel && !panel.classList.contains('is-active') && backBtn) {
          while (stepOf() > Number(panel.getAttribute('data-panel'))) backBtn.click();
        }
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // The stepped card has two .form-submit buttons (Continue and Send), and
    // Continue comes first in the DOM — take the send button by name there.
    var btn = form.querySelector('.qf2-send') || form.querySelector('.form-submit');
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
      $('qf-notes').value.trim() ? 'Notes: ' + $('qf-notes').value.trim() : null,
      'SMS opt-in: ' + (sms.checked ? 'Yes' : 'No'),
      'Landing page: ' + window.location.pathname,
    ].filter(Boolean).join('\n');

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, message: message }),
    }).then(function (res) {
      if (res.ok) {
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
    var collapsedLabel = statesToggle.textContent;
    statesToggle.addEventListener('click', function () {
      var expanded = statesGrid.classList.toggle('expanded');
      statesToggle.setAttribute('aria-expanded', expanded);
      statesToggle.textContent = expanded ? 'Show less \u2191' : collapsedLabel;
    });
  }

  // ---- scroll reveal (same targets and stagger as index.html) -------------
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var staggerSelectors = ['.trust-item', '.service-card', '.process-step', '.gallery-item', '.footer-col', '.faq-item'];
  staggerSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      var siblings = [].slice.call(el.parentElement.children).filter(function (c) { return c.matches(sel); });
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.09, 0.36) + 's';
    });
  });

  var revealTargets = document.querySelectorAll(
    '.section-header, .trust-item, .service-card, .process-step, .gallery-item, .faq-item, ' +
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

/* Marks the nav link for the section you are currently reading.
 *
 * The state pages run to eleven screens, so without this the bar gives no
 * sense of position. Driven by whichever observed section currently covers the
 * point just below the nav, rather than by "most visible" — that flickers when
 * a short section sits between two tall ones. */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
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
    if (current) current.classList.remove('is-current');
    if (found) found.classList.add('is-current');
    current = found;
  }

  // Called straight from the scroll listener rather than gated behind a
  // requestAnimationFrame flag: the flag latches on permanently if a frame
  // never arrives, and reading six rects is cheap enough not to need it.
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
})();
