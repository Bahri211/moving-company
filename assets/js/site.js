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
      var firstError = form.querySelector('.field-error:not(:empty), .sms-error:not(:empty)');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var btn = form.querySelector('.form-submit');
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
      btn.textContent = 'Request a free quote';
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
