/*
 * Truck-fill estimator. Visitors add the things in their home, a truck fills
 * from the back toward the cab, and the result hands off to the quote form.
 *
 * To use it on a page:
 *   <link rel="stylesheet" href="/assets/estimator/truck-estimator.css">
 *   <div class="te" data-truck-estimator data-quote="#quote"></div>
 *   <script src="/assets/estimator/truck-estimator.js" defer></script>
 *
 * data-quote points at the quote section. Inside it the estimator looks for a
 * <form>, a #q-size select (the Home size field) and #q-from (focused after the
 * scroll if it is still empty). The inventory summary is left on the form as
 * form.dataset.inventory for the form's own submit code to include.
 *
 * It estimates the SIZE of a load, never a price.
 */
(function () {
  'use strict';

  // ---- Everything editable lives here. Volumes are cubic feet per item.
  var CONFIG = {
    rooms: [
      { id: 'living', name: 'Living room', items: [
        { id: 'sofa3', label: '3-seat sofa', cuft: 35 },
        { id: 'loveseat', label: 'Loveseat', cuft: 25 },
        { id: 'sectional', label: 'Sectional', cuft: 60 },
        { id: 'armchair', label: 'Armchair', cuft: 15 },
        { id: 'coffee', label: 'Coffee table', cuft: 5 },
        { id: 'tv', label: 'TV + stand', cuft: 15 },
        { id: 'bookcase', label: 'Bookcase', cuft: 20 },
        { id: 'rug', label: 'Rug', cuft: 5 },
        { id: 'lamp', label: 'Floor lamp', cuft: 3 },
      ] },
      { id: 'bedroom', name: 'Bedroom', multi: true, max: 8, addLabel: 'Add another bedroom', items: [
        { id: 'king', label: 'King bed', cuft: 70 },
        { id: 'queen', label: 'Queen bed', cuft: 60 },
        { id: 'full', label: 'Full bed', cuft: 50 },
        { id: 'twin', label: 'Twin bed', cuft: 40 },
        { id: 'dresser', label: 'Dresser', cuft: 30 },
        { id: 'chest', label: 'Chest of drawers', cuft: 20 },
        { id: 'nightstand', label: 'Nightstand', cuft: 5 },
        { id: 'wardrobe', label: 'Wardrobe / armoire', cuft: 40 },
        { id: 'crib', label: 'Crib', cuft: 10 },
      ] },
      { id: 'kitchen', name: 'Kitchen & dining', items: [
        { id: 'dtable', label: 'Dining table', cuft: 30 },
        { id: 'dchair', label: 'Dining chair', cuft: 5 },
        { id: 'fridge', label: 'Refrigerator', cuft: 45 },
        { id: 'washer', label: 'Washer', cuft: 25 },
        { id: 'dryer', label: 'Dryer', cuft: 25 },
        { id: 'microwave', label: 'Microwave', cuft: 3 },
      ] },
      { id: 'office', name: 'Office', items: [
        { id: 'desk', label: 'Desk', cuft: 20 },
        { id: 'ochair', label: 'Office chair', cuft: 8 },
        { id: 'filing', label: 'Filing cabinet', cuft: 10 },
        { id: 'bookshelf', label: 'Bookshelf', cuft: 20 },
      ] },
      { id: 'garage', name: 'Garage & outdoor', items: [
        { id: 'bike', label: 'Bicycle', cuft: 10 },
        { id: 'patio', label: 'Patio set', cuft: 30 },
        { id: 'grill', label: 'Grill', cuft: 10 },
        { id: 'mower', label: 'Lawn mower', cuft: 15 },
        { id: 'toolchest', label: 'Tool chest', cuft: 10 },
        { id: 'piano', label: 'Upright piano', cuft: 70 },
      ] },
      { id: 'boxes', name: 'Boxes', items: [
        { id: 'box-s', label: 'Small box', many: 'Small boxes', cuft: 1.5 },
        { id: 'box-m', label: 'Medium box', many: 'Medium boxes', cuft: 3 },
        { id: 'box-l', label: 'Large box', many: 'Large boxes', cuft: 4.5 },
        { id: 'box-w', label: 'Wardrobe box', many: 'Wardrobe boxes', cuft: 10 },
        { id: 'box-tv', label: 'TV box', many: 'TV boxes', cuft: 5 },
      ] },
    ],
    // Upper bounds are exclusive: 400 cu ft is a 1 bedroom, 399 a studio.
    // `form` is the matching option in the quote form's Home size field.
    homeSizes: [
      { under: 400, label: 'Studio', form: 'Studio' },
      { under: 700, label: '1 bedroom', form: '1 Bedroom' },
      { under: 1000, label: '2 bedrooms', form: '2 Bedrooms' },
      { under: 1400, label: '3 bedrooms', form: '3 Bedrooms' },
      { under: 1800, label: '4 bedrooms', form: '4 Bedrooms' },
      { under: Infinity, label: '5+ bedrooms', form: '5+ Bedrooms' },
    ],
    crews: [
      { under: 400, movers: 2 },
      { under: 900, movers: 3 },
      { under: 1500, movers: 4 },
      { under: Infinity, movers: 5 },
    ],
    truckFullAt: 2000,
    copy: {
      eyebrow: 'Truck-fill estimator',
      empty: 'Add a few things to see how full the truck gets.',
      largeLoad: 'Large load — we’ll plan the truck on your survey',
      disclaimer: 'This is a rough estimate. Your binding price comes from a quick video or in-home survey.',
      cta: 'Get my price for this move',
      reset: 'Start over',
    },
    // Pushed to window.dataLayer (only if the page already has one) when the
    // main button is clicked.
    event: 'estimator_quote_click',
  };

  var uid = 0;
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  // "TV + stand" -> "TV + stand", "Queen bed" -> "queen bed" for screen reader labels.
  var lower = function (s) { return s.split(' ').map(function (w) { return w === w.toUpperCase() ? w : w.toLowerCase(); }).join(' '); };
  var pick = function (list, v) { for (var i = 0; i < list.length; i++) if (v < list[i].under) return list[i]; return list[list.length - 1]; };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function truckSVG(id) {
    // Cargo box on the left (the back doors), cab on the right. The load is a
    // stack of boxes that slides in from the back as volume grows.
    return '' +
      '<svg class="te-truck" viewBox="0 0 420 184" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<clipPath id="' + id + '-hold"><rect x="17" y="21" width="273" height="116" rx="5"/></clipPath>' +
          '<pattern id="' + id + '-boxes" width="34.125" height="29" patternUnits="userSpaceOnUse" x="17" y="21">' +
            '<rect class="te-box" x="1.5" y="1.5" width="31.1" height="26" rx="2.5"/>' +
            '<path class="te-tape" d="M17 1.5v7"/>' +
          '</pattern>' +
        '</defs>' +
        '<rect class="te-cargo" x="8" y="12" width="291" height="134" rx="11"/>' +
        '<rect class="te-hold" x="17" y="21" width="273" height="116" rx="5"/>' +
        '<g class="te-ticks">' +
          '<path d="M85.25 131v6M153.5 127v10M221.75 131v6"/>' +
        '</g>' +
        '<g clip-path="url(#' + id + '-hold)">' +
          '<g class="te-load">' +
            '<rect class="te-load-fill" x="17" y="21" width="273" height="116"/>' +
            '<rect x="17" y="21" width="273" height="116" fill="url(#' + id + '-boxes)"/>' +
            '<rect class="te-load-edge" x="286" y="21" width="4" height="116"/>' +
          '</g>' +
        '</g>' +
        '<path class="te-doors" d="M17 28v102"/>' +
        '<path class="te-cab" d="M305 52h56a12 12 0 0 1 9.4 4.5l27.2 34a12 12 0 0 1 2.6 7.5V140a6 6 0 0 1-6 6H305z"/>' +
        '<path class="te-window" d="M322 64h36a6 6 0 0 1 4.7 2.3l17.6 22a3 3 0 0 1-2.3 4.7H322a3 3 0 0 1-3-3V67a3 3 0 0 1 3-3z"/>' +
        '<rect class="te-chassis" x="8" y="144" width="396" height="9" rx="4.5"/>' +
        '<g class="te-wheel"><circle cx="72" cy="158" r="17"/><circle class="te-hub" cx="72" cy="158" r="6"/></g>' +
        '<g class="te-wheel"><circle cx="230" cy="158" r="17"/><circle class="te-hub" cx="230" cy="158" r="6"/></g>' +
        '<g class="te-wheel"><circle cx="352" cy="158" r="17"/><circle class="te-hub" cx="352" cy="158" r="6"/></g>' +
      '</svg>';
  }

  function Estimator(root) {
    var self = this;
    var id = 'te' + (++uid);
    this.root = root;
    this.quote = document.querySelector(root.dataset.quote || '#quote');
    this.counts = {};        // { instanceId: { itemId: n } }
    this.instances = {};     // { roomId: [instanceId, ...] }
    this.seq = {};           // next instance number per room
    CONFIG.rooms.forEach(function (r) { self.instances[r.id] = [r.id + '-1']; self.seq[r.id] = 2; });

    root.classList.add('te');
    root.innerHTML = '';

    // ---- Left: rooms and items
    var picker = el('div', { class: 'te-picker' });
    var tabs = el('div', { class: 'te-tabs', role: 'tablist', 'aria-label': 'Rooms' });
    this.tabs = []; this.panels = {};
    CONFIG.rooms.forEach(function (room, i) {
      var t = el('button', { type: 'button', role: 'tab', id: id + '-tab-' + room.id, 'aria-controls': id + '-panel-' + room.id,
        'aria-selected': String(i === 0), tabindex: i === 0 ? '0' : '-1', class: 'te-tab' },
        '<span>' + room.name + '</span><b class="te-badge" hidden></b>');
      t.dataset.room = room.id;
      tabs.appendChild(t); self.tabs.push(t);
      var p = el('div', { role: 'tabpanel', id: id + '-panel-' + room.id, 'aria-labelledby': t.id, class: 'te-panel', tabindex: '-1' });
      if (i !== 0) p.hidden = true;
      self.panels[room.id] = p;
    });
    picker.appendChild(tabs);
    CONFIG.rooms.forEach(function (room) { picker.appendChild(self.panels[room.id]); self.renderRoom(room); });

    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('[role="tab"]');
      if (t) self.select(t.dataset.room);
    });
    tabs.addEventListener('keydown', function (e) {
      var i = self.tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: self.tabs.length - 1 }[e.key];
      if (n == null) return;
      e.preventDefault();
      n = (n + self.tabs.length) % self.tabs.length;
      self.select(self.tabs[n].dataset.room); self.tabs[n].focus();
    });

    // One listener for every counter and bedroom button.
    picker.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]');
      if (!b) return;
      var act = b.dataset.act;
      if (act === 'add' || act === 'sub') self.bump(b.dataset.inst, b.dataset.item, act === 'add' ? 1 : -1);
      else if (act === 'add-inst') self.addInstance(b.dataset.room);
      else if (act === 'del-inst') self.removeInstance(b.dataset.room, b.dataset.inst);
    });

    // ---- Right: truck and result. On phones .te-live sticks to the top
    // while the item list scrolls under it.
    var side = el('div', { class: 'te-side' });
    var live = el('div', { class: 'te-live' },
      '<div class="te-truck-wrap">' + truckSVG(id) + '<span class="te-pct" aria-hidden="true">0%</span></div>' +
      '<div class="te-total"><span class="te-total-label">Estimated load</span>' +
        '<b class="te-total-n"><span class="te-cuft">0</span> cu ft</b>' +
        '<span class="te-meter-label">Truck <span class="te-pct-text">0</span>% full</span></div>');
    var details = el('div', { class: 'te-details' },
      '<p class="te-large" hidden>' + CONFIG.copy.largeLoad + '</p>' +
      '<dl class="te-stats">' +
        '<div><dt>Home size</dt><dd class="te-home">—</dd></div>' +
        '<div><dt>Suggested crew</dt><dd class="te-crew">—</dd></div>' +
        '<div><dt>Items</dt><dd class="te-count">0</dd></div>' +
      '</dl>' +
      '<p class="te-hint">' + CONFIG.copy.empty + '</p>' +
      '<p class="te-note">' + CONFIG.copy.disclaimer + '</p>' +
      '<div class="te-actions">' +
        '<button type="button" class="btn te-cta">' + CONFIG.copy.cta +
          ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
        '<button type="button" class="te-reset">' + CONFIG.copy.reset + '</button>' +
      '</div>' +
      '<p class="te-sr" aria-live="polite" aria-atomic="true"></p>');
    side.appendChild(live); side.appendChild(details);

    root.appendChild(picker); root.appendChild(side);

    this.q = function (s) { return root.querySelector(s); };
    this.q('.te-cta').addEventListener('click', function () { self.handoff(); });
    this.q('.te-reset').addEventListener('click', function () { self.reset(); });

    // Keep the sticky truck below the site's own sticky header.
    var nav = document.getElementById('nav') || document.querySelector('header');
    var setTop = function () { root.style.setProperty('--te-top', ((nav && nav.getBoundingClientRect().height) || 0) + 8 + 'px'); };
    setTop(); window.addEventListener('resize', setTop);

    this.update(true);
  }

  Estimator.prototype.select = function (roomId) {
    var self = this;
    this.tabs.forEach(function (t) {
      var on = t.dataset.room === roomId;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      self.panels[t.dataset.room].hidden = !on;
    });
  };

  Estimator.prototype.room = function (roomId) {
    for (var i = 0; i < CONFIG.rooms.length; i++) if (CONFIG.rooms[i].id === roomId) return CONFIG.rooms[i];
  };

  Estimator.prototype.renderRoom = function (room) {
    var self = this, panel = this.panels[room.id], list = this.instances[room.id];
    panel.innerHTML = '';
    list.forEach(function (inst, n) {
      var group = el('div', { class: 'te-group' });
      if (room.multi) {
        var name = room.name + ' ' + (n + 1);
        var head = el('div', { class: 'te-group-head' }, '<h3 tabindex="-1">' + name + '</h3>');
        if (list.length > 1) {
          head.appendChild(el('button', { type: 'button', class: 'te-del', 'data-act': 'del-inst', 'data-room': room.id, 'data-inst': inst,
            'aria-label': 'Remove ' + lower(name) }, 'Remove'));
        }
        group.appendChild(head);
      }
      var ul = el('ul', { class: 'te-items' });
      room.items.forEach(function (it) {
        var where = room.multi ? ' in ' + lower(room.name) + ' ' + (n + 1) : '';
        var c = (self.counts[inst] || {})[it.id] || 0;
        var li = el('li', { class: 'te-item' + (c ? ' has-n' : '') },
          '<span class="te-name">' + it.label + '<small>' + it.cuft + ' cu ft</small></span>' +
          '<span class="te-step">' +
            '<button type="button" class="te-btn" data-act="sub" data-inst="' + inst + '" data-item="' + it.id + '" aria-label="Remove one ' + lower(it.label) + where + '"' + (c ? '' : ' aria-disabled="true"') + '>' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>' +
            '<span class="te-n" data-n="' + inst + ':' + it.id + '">' + c + '</span>' +
            '<button type="button" class="te-btn te-btn-add" data-act="add" data-inst="' + inst + '" data-item="' + it.id + '" aria-label="Add one ' + lower(it.label) + where + '">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>' +
          '</span>');
        ul.appendChild(li);
      });
      group.appendChild(ul);
      panel.appendChild(group);
    });
    if (room.multi && list.length < (room.max || 8)) {
      panel.appendChild(el('button', { type: 'button', class: 'te-add-inst', 'data-act': 'add-inst', 'data-room': room.id },
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>' + room.addLabel));
    }
  };

  Estimator.prototype.bump = function (inst, item, d) {
    var c = this.counts[inst] = this.counts[inst] || {};
    var n = Math.max(0, Math.min(999, (c[item] || 0) + d));
    if (n === (c[item] || 0)) return;
    c[item] = n;
    var out = this.root.querySelector('[data-n="' + inst + ':' + item + '"]');
    out.textContent = n;
    out.closest('.te-item').classList.toggle('has-n', n > 0);
    var sub = out.previousElementSibling;
    if (n) sub.removeAttribute('aria-disabled'); else sub.setAttribute('aria-disabled', 'true');
    out.classList.remove('is-bump'); void out.offsetWidth; out.classList.add('is-bump');
    this.update();
  };

  Estimator.prototype.addInstance = function (roomId) {
    var room = this.room(roomId);
    this.instances[roomId].push(roomId + '-' + (this.seq[roomId]++));
    this.renderRoom(room);
    var heads = this.panels[roomId].querySelectorAll('.te-group-head h3');
    heads[heads.length - 1].focus();
    this.update();
  };

  Estimator.prototype.removeInstance = function (roomId, inst) {
    var list = this.instances[roomId];
    if (list.length < 2) return;
    list.splice(list.indexOf(inst), 1);
    delete this.counts[inst];
    this.renderRoom(this.room(roomId));
    var add = this.panels[roomId].querySelector('.te-add-inst') || this.panels[roomId].querySelector('h3');
    if (add) add.focus();
    this.update();
  };

  Estimator.prototype.reset = function () {
    var self = this;
    this.counts = {};
    CONFIG.rooms.forEach(function (r) { self.instances[r.id] = [r.id + '-1']; self.seq[r.id] = 2; self.renderRoom(r); });
    this.select(CONFIG.rooms[0].id);
    this.update();
    this.tabs[0].focus();
  };

  // Totals, plus an item summary with the same thing in several bedrooms
  // folded into one line ("Queen bed x2").
  Estimator.prototype.totals = function () {
    var self = this, cuft = 0, items = 0, lines = [], byRoom = {};
    CONFIG.rooms.forEach(function (room) {
      var roomItems = 0;
      room.items.forEach(function (it) {
        var n = 0;
        self.instances[room.id].forEach(function (inst) { n += (self.counts[inst] || {})[it.id] || 0; });
        if (!n) return;
        cuft += n * it.cuft; items += n; roomItems += n;
        lines.push((n > 1 && it.many ? it.many : it.label) + ' x' + n);
      });
      byRoom[room.id] = roomItems;
    });
    return { cuft: cuft, items: items, lines: lines, byRoom: byRoom };
  };

  Estimator.prototype.update = function (first) {
    var self = this, t = this.totals(), q = this.q;
    var pct = Math.min(1, t.cuft / CONFIG.truckFullAt);
    var home = pick(CONFIG.homeSizes, t.cuft), crew = pick(CONFIG.crews, t.cuft);
    var empty = !t.items, large = t.cuft > CONFIG.truckFullAt;

    this.root.style.setProperty('--te-fill', pct.toFixed(4));
    this.root.classList.toggle('is-empty', empty);
    this.root.classList.toggle('is-full', large);
    q('.te-cuft').textContent = fmt(t.cuft);
    q('.te-pct').textContent = Math.round(pct * 100) + '%';
    q('.te-pct-text').textContent = Math.round(pct * 100);
    q('.te-home').textContent = empty ? '—' : home.label;
    q('.te-crew').textContent = empty ? '—' : crew.movers + ' movers';
    q('.te-count').textContent = fmt(t.items);
    q('.te-large').hidden = !large;
    q('.te-hint').hidden = !empty;

    this.tabs.forEach(function (tab) {
      var n = t.byRoom[tab.dataset.room], b = tab.querySelector('.te-badge');
      b.hidden = !n; b.textContent = n || '';
      tab.setAttribute('aria-label', self.room(tab.dataset.room).name + (n ? ', ' + n + ' item' + (n > 1 ? 's' : '') : ''));
    });

    // One short sentence for screen readers, after the tapping settles.
    clearTimeout(this.srTimer);
    if (!first) this.srTimer = setTimeout(function () {
      q('.te-sr').textContent = empty ? 'Nothing added yet.' :
        'About ' + fmt(t.cuft) + ' cubic feet, truck ' + Math.round(pct * 100) + ' percent full. ' +
        home.label + ', ' + crew.movers + ' movers, ' + t.items + ' item' + (t.items > 1 ? 's' : '') + '.' + (large ? ' ' + CONFIG.copy.largeLoad + '.' : '');
    }, 600);
    this.last = { t: t, home: home, crew: crew };
  };

  Estimator.prototype.summary = function () {
    var t = this.last.t;
    if (!t.items) return '';
    return t.lines.join(', ') + ' — approx. ' + fmt(t.cuft) + ' cu ft · ' + this.last.home.label + ' · ' + this.last.crew.movers + ' movers suggested';
  };

  Estimator.prototype.handoff = function () {
    var quote = this.quote, t = this.last.t;
    var form = quote && (quote.tagName === 'FORM' ? quote : quote.querySelector('form'));
    if (form) {
      var summary = this.summary();
      if (summary) form.dataset.inventory = summary; else delete form.dataset.inventory;
      var size = form.querySelector('#q-size');
      if (size && t.items) {
        var want = this.last.home.form.toLowerCase();
        for (var i = 0; i < size.options.length; i++) {
          if (size.options[i].text.trim().toLowerCase() === want) {
            size.selectedIndex = i;
            size.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }
    }
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({ event: CONFIG.event, estimator_cuft: Math.round(t.cuft), estimator_items: t.items, estimator_home_size: t.items ? this.last.home.form : '' });
    }
    if (!quote) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nav = document.getElementById('nav');
    var top = quote.getBoundingClientRect().top + window.scrollY - ((nav && nav.offsetHeight) || 0) - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    var from = form && form.querySelector('#q-from');
    var next = from && !from.value && from.offsetParent ? from : form && form.querySelector('button[type="submit"]:not([hidden])');
    if (next) setTimeout(function () { next.focus({ preventScroll: true }); }, reduce ? 0 : 450);
  };

  function init() {
    document.querySelectorAll('[data-truck-estimator]').forEach(function (root) {
      if (!root.teReady) { root.teReady = true; new Estimator(root); }
    });
  }
  window.TruckEstimatorConfig = CONFIG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
