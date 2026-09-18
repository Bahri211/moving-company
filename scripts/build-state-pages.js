#!/usr/bin/env node
/**
 * Generates one indexable landing page per state at /moving-from-<slug>/,
 * a hub page at /moving-companies-by-state/, plus sitemap.xml and robots.txt.
 *
 * Every page is assembled from the components that already exist in
 * index.html — same nav, hero, trust bar, coverage grid, services grid,
 * process steps, gallery, FAQ accordion, contact strip and footer, in the
 * same order. Only the copy inside those components changes per state.
 *
 * Run: npm run build:seo
 */
const fs = require('fs');
const path = require('path');
const { states, byAbbr } = require('./data/states.js');
const VARIANTS = require('./data/variants.js');
const TOP_CITIES = require('./data/top-cities.js');

// Canonical origin for the live site. Change here if the site moves to www.
const SITE = process.env.SITE_URL || 'https://www.50statemovers.com';
const ROOT = path.join(__dirname, '..');
const PHONE_DISPLAY = '+1 (888) 505-1086';
const PHONE_HREF = '+18885051086';
const EMAIL = 'contact@50statemovers.com';
const USDOT = '4575745';
const MC = 'MC-1820728';
const BUILT = new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- helpers */

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Straight-line distance inflated by a road-network factor, rounded to 10 mi.
function drivingMiles(a, b) {
  const R = 3958.8, rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.17 / 10) * 10;
}


function transit(miles) {
  return {
    consolidated: [Math.max(2, Math.ceil(miles / 300)), Math.max(4, Math.ceil(miles / 150))],
    dedicated: [Math.max(1, Math.ceil(miles / 550)), Math.max(2, Math.ceil(miles / 450))],
  };
}

// "a" vs "an" by pronunciation, not first letter — Utah takes "a" (YOO-tah).
const AN_STATES = new Set(['AL', 'AZ', 'AR', 'ID', 'IL', 'IN', 'IA', 'OH', 'OK', 'OR']);
const a = st => (AN_STATES.has(st.abbr) ? 'an' : 'a');

// Each state gets its own phrasing of the copy that is otherwise identical
// site-wide (data/variants.js). The rotation is positional so the variants are
// spread evenly, and each key is offset by its own name hash so two states that
// share one sentence do not share the next — every page ends up with a
// combination of wordings no other page has.
const STATE_INDEX = Object.fromEntries(states.map((s, i) => [s.slug, i]));
const keyOffset = k => [...k].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);

function pick(key, s) {
  const list = VARIANTS[key];
  if (!list) throw new Error(`Unknown copy variant "${key}"`);
  const text = s
    ? list[(STATE_INDEX[s.slug] + keyOffset(key)) % list.length]
    : list[0];
  return s
    ? text
        .replace(/\{\{state\}\}/g, esc(s.name))
        .replace(/\{\{a\}\}/g, a(s))
        .replace(/\{\{regulator\}\}/g, esc(s.regulator))
        .replace(/\{\{usdot\}\}/g, USDOT)
        .replace(/\{\{mc\}\}/g, MC)
        .replace(/\{\{phone\}\}/g, PHONE_DISPLAY)
        .replace(/\{\{phoneHref\}\}/g, PHONE_HREF)
    : text;
}

const stateUrl = s => `/moving-from-${s.slug}/`;
const HUB_URL = '/moving-companies-by-state/';

// A stable "popular destinations" set used for cross-linking every page.
const POPULAR = ['TX', 'FL', 'CA', 'NC', 'AZ', 'GA', 'TN', 'NY', 'CO', 'SC',
                 'WA', 'NV', 'PA', 'OH', 'VA', 'IL', 'UT', 'ID'];
const HUB_FEATURED = POPULAR.slice(0, 6);

/* ------------------------------------- shared chrome, copied from index.html */

const phoneIconSm = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const phoneIconLg = phoneIconSm.replace('width="16" height="16"', 'width="18" height="18"');
const checkIcon = `<svg class="state-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

const NAV = `<nav class="topnav">
  <div class="nav-left">
    <a href="/" class="logo" aria-label="50STATEMOVERS INC home">
      <img src="/assets/images/48-state-movers-logo-removebg-preview.png" alt="50STATEMOVERS INC" class="logo-img" />
      <span class="logo-name">50STATEMOVERS INC</span>
    </a>
    <span class="fmcsa-badge" role="img" aria-label="USDOT verified, MC authority active">
      <svg class="fb-seal" viewBox="0 0 36 36" aria-hidden="true">
        <defs>
          <linearGradient id="fbSealGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#5fd08b"/>
            <stop offset="1" stop-color="#2e8b57"/>
          </linearGradient>
        </defs>
        <polygon fill="url(#fbSealGrad)" points="18.00 0.50 20.97 3.09 24.70 1.83 26.44 5.36 30.37 5.63 30.64 9.56 34.17 11.30 32.91 15.03 35.50 18.00 32.91 20.97 34.17 24.70 30.64 26.44 30.37 30.37 26.44 30.64 24.70 34.17 20.97 32.91 18.00 35.50 15.03 32.91 11.30 34.17 9.56 30.64 5.63 30.37 5.36 26.44 1.83 24.70 3.09 20.97 0.50 18.00 3.09 15.03 1.83 11.30 5.36 9.56 5.63 5.63 9.56 5.36 11.30 1.83 15.03 3.09"/>
        <circle cx="18" cy="18" r="12.2" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="0.8" stroke-dasharray="1.2 1.4"/>
        <path d="M18 9.5 12 11.9v4.6c0 3.7 2.5 6.9 6 8.1 3.5-1.2 6-4.4 6-8.1v-4.6z" fill="#fff"/>
        <polyline points="15.2 17.2 17.3 19.3 21 15.3" fill="none" stroke="#2e8b57" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="fb-label"><span class="fb-verified">USDOT Verified</span> <span class="fb-sep" aria-hidden="true">•</span> <span class="fb-active">MC Active<span class="fb-dot" aria-hidden="true"></span></span></span>
    </span>
  </div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#coverage">Coverage</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
  <div class="nav-right">
    <a href="tel:${PHONE_HREF}" class="nav-phone">
      ${phoneIconSm}
      ${PHONE_DISPLAY.replace(/^(\+1 )/, '<span class="np-cc">$1</span>')}
    </a>
    <a href="#get-quote" class="nav-cta">Get a free quote</a>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span>
    </button>
  </div>
</nav>

<div class="mobile-menu" aria-hidden="true">
  <ul>
    <li><a href="#services">Services</a></li>
    <li><a href="#coverage">Coverage</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#faq">FAQ</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <div class="mobile-menu-ctas">
    <a href="tel:${PHONE_HREF}" class="call">Call ${PHONE_DISPLAY}</a>
    <a href="#get-quote" class="quote">Get a free quote</a>
  </div>
</div>`;

// The route animation and the services closing line are lifted from
// index.html so the state pages and the homepage stay one design.
const ROUTE_ANIM = `  <div class="cov-road">
    <img class="cov-road-photo" src="/assets/images/hero-bg-road.jpg" alt="" width="1920" height="1433" loading="lazy" decoding="async" aria-hidden="true" />
  <div class="route-anim">
    <svg viewBox="0 38 1200 246" role="img"
         aria-label="A 50State Movers truck driving the route from your old home to your new one: packed, on the road, delivered">

      <defs>
        <linearGradient id="roadFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="var(--line)" stop-opacity="0.5" />
          <stop offset="0.5" stop-color="var(--line)" stop-opacity="0.75" />
          <stop offset="1" stop-color="var(--line)" stop-opacity="0.5" />
        </linearGradient>
        <radialGradient id="truckShadow">
          <stop offset="0" stop-color="#1a1713" stop-opacity="0.34" />
          <stop offset="1" stop-color="#1a1713" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- ── road ── -->
      <g class="road">
        <path class="road-shadow"  d="M 90 205 C 330 205, 420 100, 640 100 S 950 140, 1110 120" />
        <path class="road-casing"  d="M 90 205 C 330 205, 420 100, 640 100 S 950 140, 1110 120" />
        <path class="road-surface" d="M 90 205 C 330 205, 420 100, 640 100 S 950 140, 1110 120" />
        <path class="road-centre"  d="M 90 205 C 330 205, 420 100, 640 100 S 950 140, 1110 120" />
        <path class="road-done"    d="M 90 205 C 330 205, 420 100, 640 100 S 950 140, 1110 120" />
      </g>

      <!-- ── milestones, lit as the truck passes ── -->
      <g class="milestone ms-1">
        <circle class="ms-dot" cx="344" cy="162" r="7" />
        <text class="ms-text" x="344" y="192">PACKED</text>
      </g>
      <g class="milestone ms-2">
        <circle class="ms-dot" cx="594" cy="102" r="7" />
        <text class="ms-text" x="594" y="132">ON THE ROAD</text>
      </g>
      <g class="milestone ms-3">
        <circle class="ms-dot" cx="852" cy="113" r="7" />
        <text class="ms-text" x="852" y="143">DELIVERED</text>
      </g>

      <!-- ── origin ── -->
      <g class="endpoint">
        <circle class="ep-disc" cx="90" cy="205" r="26" />
        <path class="ep-glyph" d="M78 205l12-10 12 10v14h-9v-9h-6v9h-9v-14Z" />
        <text class="ep-label" x="90" y="262">YOUR OLD PLACE</text>
      </g>

      <!-- ── destination ── -->
      <g class="endpoint endpoint-end">
        <circle class="ep-ring" cx="1110" cy="120" r="26" />
        <circle class="ep-disc" cx="1110" cy="120" r="26" />
        <path class="ep-glyph" d="M1098 120l12-10 12 10v14h-9v-9h-6v9h-9v-14Z" />
        <path class="ep-check" d="M1100 120l7 7 14-14" />
        <text class="ep-label" x="1110" y="177">YOUR NEW PLACE</text>
      </g>

      <!-- ── truck: rides the road via offset-path, tilting with the curve ── -->
      <g class="route-truck">
        <rect class="truck-bounds" x="-3" y="-18" width="76" height="54.5" />
        <ellipse class="truck-shadow" cx="35" cy="34.2" rx="33" ry="2.3" fill="url(#truckShadow)" />

        <g class="route-truck-bob">
          <g class="truck-exhaust">
            <circle cx="47" cy="-1" r="2.6" />
            <circle cx="51" cy="-7" r="3.4" />
            <circle cx="55" cy="-14" r="4.2" />
          </g>
          <rect class="truck-stack" x="45" y="1" width="2.6" height="7" rx="1.3" />

          <rect class="truck-body" x="0" y="0" width="48" height="28" rx="3.5" />
          <rect class="truck-stripe" x="0" y="19" width="48" height="2" />
          <text class="truck-brand" x="24" y="14">50STATE</text>

          <path class="truck-cab" d="M48 7h11l9 11v10H48V7Z" />
          <path class="truck-window" d="M50 9h8l6.5 8.5H50V9Z" />
          <rect class="truck-light" x="65" y="21" width="3" height="2.5" rx="1" />

          <g class="truck-wheel">
            <circle class="tyre" cx="13" cy="30" r="6.5" />
            <path class="spoke" d="M13 25v10M8 30h10" />
            <circle class="hub" cx="13" cy="30" r="2" />
          </g>
          <g class="truck-wheel">
            <circle class="tyre" cx="59" cy="30" r="6.5" />
            <path class="spoke" d="M59 25v10M54 30h10" />
            <circle class="hub" cx="59" cy="30" r="2" />
          </g>
        </g>
      </g>
      </g>
    </svg>
  </div>
  </div>`;

// The six service cards, verbatim from index.html — these describe the company,
// not the state, so the copy is deliberately identical everywhere.
const SERVICE_CARDS = [
  ['01', `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>`, 'Long Distance', 'svcLongDistance'],
  ['02', `<svg viewBox="0 0 24 24"><path d="M20 7 9 18l-5-5"/></svg>`, 'White Glove', 'svcWhiteGlove'],
  ['03', `<svg viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H3V9.5Z"/><path d="M9 21v-8h6v8"/></svg>`, 'Residential', 'svcResidential'],
  ['04', `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>`, 'Commercial', 'svcCommercial'],
  ['05', `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>`, 'Packing &amp; Crating', 'svcPacking'],
  ['06', `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`, 'Storage', 'svcStorage'],
];

const SERVICE_ILLUS = {
  'Long Distance': 'svc-long-distance.png',
  'White Glove': 'svc-white-glove.png',
  'Residential': 'svc-residential.png',
  'Commercial': 'svc-commercial.png',
  'Packing &amp; Crating': 'svc-packing.png',
  'Storage': 'svc-storage.png',
};

// The six services as the solid colour cards the homepage uses: the three
// colours off the stat band under the hero, cycled down the list. `illus`
// swaps the line icon for the commissioned illustration; either way the art
// sits on a paper tile inside the coloured card, since terracotta-and-navy
// line work is lost on a solid orange or navy ground. The rows collapse to a
// tapable index on phones (site.js) — six paragraphs open at once made this
// the longest scroll on the page.
function servicesSection(intro, illus, s) {
  const chev = `<svg class="svc-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
  const cards = SERVICE_CARDS.map(([num, icon, title, bodyKey], i) => {
    const body = pick(bodyKey, s);
    const art = illus && SERVICE_ILLUS[title]
      ? `<img src="/assets/images/gallery/${SERVICE_ILLUS[title]}" alt="" width="700" height="520" loading="lazy" decoding="async" />`
      : `<span class="svc-glyph">${icon}</span>`;
    return `      <li class="svc-row">
        <div class="svc-head">
          <span class="svc-art">${art}</span>
          <h3>${title}</h3>
          ${chev}
        </div>
        <div class="svc-body" id="svc-body-${i + 1}">
          <p>${body}</p>
        </div>
      </li>`;
  }).join('\n');
  return `<section id="services" class="svc-band">
  <div class="svc-inner">
    <div class="svc-intro">
      <div class="section-kicker">What we do</div>
      <h2>${pick('servicesHead', s)}</h2>
      <p>${esc(intro)}</p>
      <a href="#get-quote" class="svc-cta"><span>Get my fixed price</span><span class="svc-cta-chip" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13"/><polyline points="12 5 19 12 12 19"/></svg></span></a>
    </div>
    <ol class="svc-list">
${cards}
    </ol>
  </div>
</section>`;
}

/* On the job: four lines for the four things that happen on moving day, each
   one sentence — the length the national van lines use. The photographs are
   ours: the truck at the door leads, the other three ride under it. Every
   line, heading and caption is drawn from the variant bank, so no two state
   pages carry the same sentences. */
const JOB_STEPS = ['jobStep1', 'jobStep2', 'jobStep3', 'jobStep4'];

const JOB_THUMBS = [
  ['runner-entry.jpg', '50% 45%', 'Blue floor runner laid from the front door through the entry of {{a}} {{state}} home on moving day'],
  ['wrapped-sunroom.jpg', '50% 55%', 'Sofas, tables and a mattress blanket-wrapped and shrink-wrapped, ready to carry out of {{a}} {{state}} home'],
  ['truck-loaded.jpg', '45% 50%', 'Blanket-wrapped furniture and wardrobe cartons stacked and strapped in tiers inside the truck'],
];

const fill = (text, s) => text
  .replace(/\{\{state\}\}/g, esc(s.name))
  .replace(/\{\{a\}\}/g, a(s));

function jobBand(s) {
  return `<section id="how-it-works" class="job-band">
  <div class="job-inner">
    <div class="job-media">
      <figure class="job-fig">
        <img src="/assets/images/gallery/job/truck-branded.jpg" alt="50STATE MOVERS INC box truck in its own livery parked at the front door of a house on delivery day after ${a(s)} ${esc(s.name)} move" width="1600" height="1194" style="object-position: 50% 55%" loading="lazy" decoding="async" />
      </figure>
      <div class="job-thumbs">
${JOB_THUMBS.map(([f, pos, alt]) => `        <img src="/assets/images/gallery/job/${f}" alt="${fill(alt, s)}" width="1600" height="1200" style="object-position: ${pos}" loading="lazy" decoding="async" />`).join('\n')}
      </div>
    </div>
    <div class="job-intro">
      <span class="job-kicker">${pick('jobKicker', s)}</span>
      <h2>${pick('jobHead', s)}</h2>
      <p class="job-lede">${pick('jobLede', s)}</p>
    </div>
    <div class="job-body">
      <ol class="job-steps">
${JOB_STEPS.map((key, i) => `        <li class="job-step">
          <span class="job-num" aria-hidden="true">${i + 1}</span>
          <h3>${pick(`${key}Title`, s)}</h3>
          <p>${pick(key, s)}</p>
        </li>`).join('\n')}
      </ol>
      <div class="job-foot">
        <a href="#get-quote" class="job-cta"><span>Get my fixed price</span><span class="job-cta-chip" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13"/><polyline points="12 5 19 12 12 19"/></svg></span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* Three more frames from the same jobs close the West Virginia gallery. */
const JOB_GALLERY = [
  ['room-protected.jpg', 'Living room with wardrobe cartons stacked and a blue runner across the floor before a move', 'Floor protection', 'Runners down before the first carry'],
  ['wrapped-furniture.jpg', 'Dresser, cabinet and mattress wrapped in blue moving blankets and plastic in a bedroom', 'Wrapped for the road', 'Blankets, shrink and tape on every piece'],
  ['runner-hall.jpg', 'Blue floor runner laid down a hallway before the crew starts carrying', 'Your floors', 'Protected doorway to doorway'],
];

function galleryFor(s) {
  let html = gallery(s);
  if (TRIAL_STATES.has(s.name)) {
    html = html.replace('<div class="gallery-grid">', `<div class="gallery-grid">
    <div class="gallery-item gallery-lead">
      <img src="/assets/images/gallery/crew-packing.jpg" alt="Three 50STATEMOVERS crew taping a carton, shrink-wrapping an armchair and wrapping a mattress in ${a(s)} ${esc(s.name)} living room" loading="lazy" />
      <div class="gallery-caption"><div class="label">On the job</div><div class="title">Wrapped and boxed before anything moves</div></div>
    </div>`);
  }
  if (STEP_FORM_STATES.has(s.name)) {
    html = html.replace(`  </div>
</section>`, `${JOB_GALLERY.map(([f, alt, label, title]) => `    <div class="gallery-item">
      <img src="/assets/images/gallery/job/${f}" alt="${alt}" loading="lazy" />
      <div class="gallery-caption"><div class="label">${label}</div><div class="title">${title}</div></div>
    </div>`).join('\n')}
  </div>
</section>`);
  }
  return html;
}

const gallery = s => `<section id="gallery" class="gallery-section">
  <div class="section-header">
    <div class="section-kicker">Gallery</div>
    <h2>Our work, <em>up close.</em></h2>
    <p>${pick('galleryLede', s)}</p>
  </div>
  <div class="gallery-grid">
    <div class="gallery-item">
      <img src="/assets/images/trucks/truck-1.jpg" alt="50STATEMOVERS moving truck" loading="lazy" />
      <div class="gallery-caption"><div class="label">Our Fleet</div><div class="title">Ready for your move</div></div>
    </div>
    <div class="gallery-item">
      <img src="/assets/images/trucks/truck-2.jpg" alt="50STATEMOVERS INC moving truck on the road" loading="lazy" />
      <div class="gallery-caption"><div class="label">On the Road</div><div class="title">Coast to coast delivery</div></div>
    </div>
    <div class="gallery-item">
      <img src="/assets/images/trucks/inside-house.jpeg" alt="Moving crew inside a home" loading="lazy" />
      <div class="gallery-caption"><div class="label">White Glove Service</div><div class="title">Handled with care</div></div>
    </div>
  </div>
</section>`;

function faqSection(headerHtml, items) {
  const body = items.map(f => `    <div class="faq-item">
      <button class="faq-q" aria-expanded="false">${f.q}<span class="faq-toggle" aria-hidden="true"></span></button>
      <div class="faq-a">${f.a.map(p => `<p>${p}</p>`).join('')}</div>
    </div>`).join('\n');
  return `<section id="faq" class="faq-section">
  <div class="section-header">
${headerHtml}
  </div>
  <div class="faq-wrap">
${body}
  </div>
</section>`;
}

function stateOptions(selected) {
  return states.map(s =>
    `<option${s.name === selected ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
}


// Footer is identical to index.html except the Company column, which points at
// the state hub rather than a same-page anchor.
/* ------------------------------------------- step form test (West Virginia)
   Trial of the multi-step quote form many movers use: two fields per screen
   (route → move details → phone, email and SMS consent), no name field, in a plain white card over a photo hero. Gated on its own set
   so the other state pages keep the eight-field form and their paper hero.
   site.js drives the steps and reports each one to GA as quote_form_step. */
const STEP_FORM_STATES = new Set(['West Virginia']);

/* Every other state page and the hub wear the homepage hero: photo behind the
   headline, the 3-step quote form and the stats cards. Both pieces are lifted
   straight out of index.html at build time so the pages can't drift from it. */
const HOME_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function sliceHome(startMarker, endMarker) {
  const start = HOME_HTML.indexOf(startMarker);
  const end = start < 0 ? -1 : HOME_HTML.indexOf(endMarker, start);
  if (end < 0) throw new Error(`index.html: couldn't find ${startMarker} … ${endMarker}`);
  return HOME_HTML.slice(start, end + endMarker.length);
}
const HOME_HERO_HEAD = sliceHome('<link rel="preload" as="image" href="/assets/images/hero-bg-home.jpg"', '</style>');
/* What we do --------------------------------------------------------------
   Sliced out of index.html with the rest, so the six colour cards can't drift
   from the homepage's. Ships on every generated page. */
const SERVICES_HEAD = sliceHome('<style>\n/* What we do ---', '</style>');
/* Stats band --------------------------------------------------------------
   Ships on every generated page, after the hero head, so it also overrides the
   homepage's own treatment of this band that those pages inherit: the tinted
   cards, gradient icon tiles, tone bar, gloss sweep, pulsing dot and count-up.
   These are the claims a customer checks us on, so they are set as plain type
   on one white panel, hairlines between the four. */
/* Coverage ----------------------------------------------------------------
   Ships on every generated page, after TRIAL_HEAD, so its button rules win.
   The open-road frame sits behind the drawn route, masked out to nothing on
   every edge and warmed into the ground, so the vector route rides over a
   real road without the photograph taking the section. */
const COVERAGE_HEAD = `<style>
.cov-road { position: relative; isolation: isolate; }
.cov-road-photo {
  position: absolute; z-index: -1; inset: -8% 0 6%;
  width: 100%; height: 100%; object-fit: cover; object-position: 50% 58%;
  opacity: 0.32; filter: saturate(0.55) sepia(0.2) contrast(0.92);
  -webkit-mask-image:
    linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%),
    linear-gradient(180deg, transparent 4%, #000 34%, #000 66%, transparent 96%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%),
    linear-gradient(180deg, transparent 4%, #000 34%, #000 66%, transparent 96%);
  mask-composite: intersect;
  pointer-events: none;
}

/* The list opens on a button, so the button should look like one. */
#states-toggle {
  display: flex; align-items: center; gap: 0.5rem;
  width: fit-content; margin: 1.6rem auto 0;
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--line); border-radius: 999px;
  background: #fff; color: var(--ink);
  font-family: var(--font-body); font-size: 0.92rem; font-weight: 600;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, transform 0.25s, box-shadow 0.25s;
}
#states-toggle svg {
  width: 16px; height: 16px; fill: none; stroke: currentColor;
  stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;
  transition: transform 0.3s ease;
}
#states-toggle:hover {
  border-color: var(--accent); color: var(--accent);
  transform: translateY(-1px); box-shadow: 0 14px 26px -18px rgba(12, 26, 43, 0.6);
}
#states-toggle[aria-expanded="true"] svg { transform: rotate(180deg); }

@media (max-width: 768px) {
  .cov-road-photo { inset: -4% 0 4%; opacity: 0.24; }
  #states-toggle { margin-top: 1.2rem; padding: 0.62rem 1.15rem; font-size: 0.87rem; }
}
@media (prefers-reduced-motion: reduce) {
  #states-toggle, #states-toggle svg { transition: none; }
}
</style>`;

const STATS_HEAD = `<style>
.ph-stats {
  position: relative; z-index: 3;
  max-width: 1240px;
  margin: -4.75rem auto 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 30px 60px -34px rgba(12, 26, 43, 0.45), 0 0 0 1px rgba(12, 26, 43, 0.06);
}
.ph-stat {
  display: block; padding: 1.7rem 1.75rem;
  background: none; border-radius: 0; animation: none; transform: none;
  box-shadow: none;
}
.ph-stat::before, .ph-stat::after { content: none; }
.ph-stat:hover { transform: none; box-shadow: none; }
.ph-stat + .ph-stat { box-shadow: inset 1px 0 0 rgba(12, 26, 43, 0.09); }
.ph-stat strong {
  display: block; font-size: 2.15rem; font-weight: 700; letter-spacing: -0.04em;
  line-height: 1; color: var(--navy); font-variant-numeric: tabular-nums; white-space: nowrap;
}
.ph-stat strong i { font-style: normal; font-size: 0.6em; font-weight: 600; color: var(--muted); margin: 0 0.05em; }
.ph-stat-label { display: block; margin-top: 0.6rem; font-size: 0.93rem; font-weight: 600; letter-spacing: -0.01em; color: var(--ink); }
.ph-stat-sub { display: block; margin-top: 0.18rem; font-size: 0.8rem; line-height: 1.4; color: var(--muted); }

@media (max-width: 1100px) {
}
/* Phones: the same panel as a 2x2 — all four figures, none dropped. */
@media (max-width: 768px) {
  .ph-stats { margin-top: -3.25rem; grid-template-columns: 1fr 1fr; gap: 0; padding: 0; border-radius: 14px; }
  .ph-stat { padding: 1rem 0.9rem 1.05rem; }
  .ph-stat, .ph-stat + .ph-stat { box-shadow: none; }
  .ph-stat:nth-child(even) { box-shadow: inset 1px 0 0 rgba(12, 26, 43, 0.09); }
  .ph-stat:nth-child(n+3) { box-shadow: inset 0 1px 0 rgba(12, 26, 43, 0.09); }
  .ph-stat:nth-child(4) { box-shadow: inset 1px 0 0 rgba(12, 26, 43, 0.09), inset 0 1px 0 rgba(12, 26, 43, 0.09); }
  .ph-stat:nth-child(2), .ph-stat:nth-child(4) { display: block; }
  .ph-stat strong { font-size: 1.5rem; }
  .ph-stat-label { grid-column: auto; margin-top: 0.4rem; font-size: 0.8rem; line-height: 1.3; }
  .ph-stat-sub { display: block; margin-top: 0.12rem; font-size: 0.72rem; }
}
</style>`;

/* The four figures, shared by every generated page. */
const STATS_BAND = `<section class="ph-proof">
  <div class="ph-stats">
${[['100<i>%</i>', 'Fixed-price moves', 'Price locked at booking'],
   ['0.3<i>%</i>', 'Damage claim rate', 'Across all our moves'],
   ['24<i>/7</i>', 'Customer support', 'Real people, any hour'],
   ['<i>$</i>1<i>M</i>', 'Liability coverage', 'Bonded &amp; insured']]
  .map(([num, label, sub]) => `    <div class="ph-stat">
      <strong>${num}</strong>
      <span class="ph-stat-label">${label}</span>
      <span class="ph-stat-sub">${sub}</span>
    </div>`).join('\n')}
  </div>
</section>`;


/* A state with its own photos in assets/images/gallery/states/<slug>/ —
   hero-bg.jpg (2400 wide) and hero-bg-mobile.jpg (1000 wide, portrait) — gets
   them behind its hero in place of the homepage pair. Frame them like the
   homepage shots (truck left of centre, mid-height) so the same crop holds. */
function heroHead(s) {
  const dir = `/assets/images/gallery/states/${s.slug}`;
  const has = f => fs.existsSync(path.join(__dirname, '..', dir, f));
  let css = HOME_HERO_HEAD;
  if (has('hero-bg.jpg')) css = css.split('/assets/images/hero-bg-home.jpg').join(`${dir}/hero-bg.jpg`);
  if (has('hero-bg-mobile.jpg')) css = css.split('/assets/images/hero-bg-home-mobile.jpg').join(`${dir}/hero-bg-mobile.jpg`);
  return css;
}

const LOCK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

function quoteFormSteps(originState) {
  return `  <div class="hero-form-col form-enter">
  <div class="hero-form-wrap qs-card" id="get-quote">
    <div class="hero-form-header qs-header">
      <h3>Get a free quote</h3>
      <span class="qs-count" aria-live="polite">Step <span id="qs-num">1</span> of 3</span>
    </div>
    <form class="quote-form qs-form" id="quote-form" data-steps novalidate>
      <div class="qs-bar" aria-hidden="true"><i class="is-done"></i><i></i><i></i></div>

      <fieldset class="qs-step is-active" aria-label="Your route">
        <div class="form-row form-row-2">
          <div>
            <label for="qf-from">Moving from</label>
            <select id="qf-from"><option value="">State…</option>${stateOptions(originState && originState.name)}</select>
            <div class="field-error" id="error-from" role="alert"></div>
          </div>
          <div>
            <label for="qf-to">Moving to</label>
            <select id="qf-to"><option value="">State…</option>${stateOptions(null)}</select>
            <div class="field-error" id="error-to" role="alert"></div>
          </div>
        </div>
        <button type="button" class="form-submit qs-next">Next</button>
      </fieldset>

      <fieldset class="qs-step" aria-label="Your move" hidden>
        <div class="form-row form-row-2">
          <div>
            <label for="qf-size">Home size</label>
            <select id="qf-size">
              <option value="">Size…</option>
              <option>Studio</option>
              <option>1 Bedroom</option>
              <option>2 Bedrooms</option>
              <option>3 Bedrooms</option>
              <option>4 Bedrooms</option>
              <option>5+ Bedrooms</option>
              <option>Office / Commercial</option>
            </select>
          </div>
          <div>
            <label for="qf-date">Move date</label>
            <input type="text" id="qf-date" placeholder="MM/DD/YYYY" autocomplete="off" />
          </div>
        </div>
        <div class="qs-nav">
          <button type="button" class="qs-back" aria-label="Back">←</button>
          <button type="button" class="form-submit qs-next">Next</button>
        </div>
      </fieldset>

      <fieldset class="qs-step" aria-label="Your contact details" hidden>
        <div class="form-row form-row-2">
          <div>
            <label for="qf-phone">Phone</label>
            <input type="tel" id="qf-phone" placeholder="(555) 000-0000" autocomplete="tel" inputmode="tel" />
            <div class="field-error" id="error-phone" role="alert"></div>
          </div>
          <div>
            <label for="qf-email">Email</label>
            <input type="email" id="qf-email" placeholder="you@email.com" autocomplete="email" />
            <div class="field-error" id="error-email" role="alert"></div>
          </div>
        </div>
        <div class="form-row-consent">
          <label class="sms-consent-label" for="qf-sms">
            <span class="sms-checkbox-wrap">
              <input type="checkbox" id="qf-sms" />
              <span class="sms-checkbox-box" aria-hidden="true"></span>
            </span>
            <span class="sms-consent-text">I agree to receive SMS messages from 50STATEMOVERS INC about my quote.<span class="sms-more" id="sms-more" hidden> Msg &amp; data rates may apply. Message frequency varies. Reply STOP to opt out at any time. See our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</span><button type="button" class="sms-toggle" id="sms-toggle" aria-expanded="false" aria-controls="sms-more">Read more</button></span>
          </label>
          <div class="sms-error" id="sms-error" role="alert"></div>
        </div>
        <div class="qs-nav">
          <button type="button" class="qs-back" aria-label="Back">←</button>
          <button type="submit" class="form-submit">Submit</button>
        </div>
      </fieldset>
    </form>
    <p class="qs-secure">${LOCK_ICON}Secure · never sold to brokers</p>
  </div>
  </div>`;
}

const PH_ICONS = {
  price: `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9.5v5M17 9.5v5"/></svg>`,
  shield: `<svg viewBox="0 0 24 24"><path d="M12 2.8 4.5 5.8v5.6c0 4.9 3.2 8.8 7.5 10 4.3-1.2 7.5-5.1 7.5-10V5.8z"/><polyline points="8.8 12.2 11 14.4 15.4 9.8"/></svg>`,
  support: `<svg viewBox="0 0 24 24"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a3 3 0 0 1-3 3h-3"/></svg>`,
  cover: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.3-1.3 2.2-3 2.2-1.3 0-2.5-.6-3-1.6M12 6.3v1.5M12 16.7v1.5"/></svg>`,
};

const PH_POINT_TICK = `<span class="ph-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`;
const PH_ROW_ICONS = {
  pin: `<svg viewBox="0 0 24 24"><path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
};

/* Replaces the navy trust bar on the photo-hero page: the hero is already dark
   and the band after it is a dark photo, so this runs light — a white stats card
   lifted over the hero's bottom edge, then the intro and the state's highways. */
function photoProof(s) {
  /* Four plain figures on one white panel. No icon tiles, no tone colours and
     no count-up: these are the claims a customer checks us on, and dressing
     them up made the band read like a game dashboard. */
  const stat = (num, label, sub) => `    <div class="ph-stat">
      <strong>${num}</strong>
      <span class="ph-stat-label">${label}</span>
      <span class="ph-stat-sub">${sub}</span>
    </div>`;
  return `<section class="ph-proof">
  <div class="ph-stats">
${stat('100<i>%</i>', 'Fixed-price moves', 'Price locked at booking')}
${stat('0.3<i>%</i>', 'Damage claim rate', 'Across all our moves')}
${stat('24<i>/7</i>', 'Customer support', 'Real people, any hour')}
${stat('<i>$</i>1<i>M</i>', 'Liability coverage', 'Bonded &amp; insured')}
  </div>

  <div class="ph-about">
    <div class="ph-media">
      <figure class="ph-photo-main">
        <img src="/assets/images/gallery/in-kitchen-crew.jpg" alt="50STATEMOVERS crew packing kitchen items into moving boxes with a smiling customer before a move out of ${esc(s.name)}" width="1600" height="893" loading="lazy" decoding="async" />
      </figure>
      <figure class="ph-photo-inset">
        <img src="/assets/images/gallery/road-inset.jpg" alt="Moving truck on an open highway at sunrise" width="900" height="672" loading="lazy" decoding="async" />
      </figure>
      <div class="ph-badge">
        <span class="ph-badge-icon" aria-hidden="true">${PH_ROW_ICONS.pin}</span>
        <div><strong>Every town in ${esc(s.name)}</strong><span>Cities, villages &amp; back roads</span></div>
      </div>
    </div>

    <div class="ph-about-text">
      <span class="ph-kicker">Moving from ${esc(s.name)}</span>
      <h2>Moving out of <em>${esc(s.name)}</em>, planned to the last mile</h2>
      <p>${esc(s.intro)}</p>
      <button type="button" class="ph-more" aria-expanded="false">Read more</button>
      <ul class="ph-points">
${s.quirks.slice(0, 3).map(q => `        <li>${PH_POINT_TICK}${esc(q.title)}</li>`).join('\n')}
      </ul>
      <div class="ph-cta">
        <a href="#get-quote" class="ph-btn"><span>Get my fixed price</span><span class="ph-btn-chip" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13"/><polyline points="12 5 19 12 12 19"/></svg></span></a>
        <a href="tel:${PHONE_HREF}" class="ph-call"><span class="ph-call-icon" aria-hidden="true">${PH_PHONE_ICON}</span>${PHONE_DISPLAY}</a>
      </div>
    </div>
  </div>

  <div class="ph-roads">
    <span class="ph-kicker">On the road</span>
    <h3>The highways we run out of <em>${esc(s.name)}</em></h3>
    <ul class="ph-road-list" style="--n:${s.highways.length}">
${s.highways.map(h => `      <li class="ph-road">${hwyShield(h)}<strong>${esc(hwyName(h))}</strong><span>${esc((HIGHWAY_NOTES[s.slug] || {})[h] || '')}</span></li>`).join('\n')}
    </ul>
  </div>
</section>`;
}

const PH_PHONE_ICON = `<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>`;

/* The towns each highway strings together, shown under its sign. States
   without an entry show the sign and name only. */
const HIGHWAY_NOTES = {
  'west-virginia': {
    'I-64': 'Huntington · Charleston · Lewisburg',
    'I-77': 'Parkersburg · Charleston · Princeton',
    'I-79': 'Charleston · Clarksburg · Morgantown',
    'I-81': 'Martinsburg & the Eastern Panhandle',
    'US-19': 'Beckley · New River Gorge · Summersville',
  },
};

function hwyName(h) {
  const m = /^(I|US)-(.+)$/.exec(h);
  return m ? `${m[1] === 'I' ? 'Interstate' : 'US Route'} ${m[2]}` : h;
}

/* Highways drawn as the real signs: the red-and-blue interstate shield with
   its INTERSTATE band, the black-square US route shield, and a plain green
   plate for anything else. */
const SHIELD_PATH = 'M9 7Q30 14 50 4Q70 14 91 7Q100 42 91 67Q81 91 50 98Q19 91 9 67Q0 42 9 7Z';
function hwyShield(h) {
  const m = /^(I|US)-(.+)$/.exec(h);
  if (!m) return `<span class="ph-sign ph-sign-plate" aria-hidden="true">${esc(h)}</span>`;
  const [, type, num] = m;
  const size = num.length > 2 ? 30 : 42;
  const clip = `hw-clip-${num.replace(/[^\w]/g, '')}`;
  const svg = type === 'I'
    ? `<svg viewBox="0 0 100 100"><defs><clipPath id="${clip}"><rect width="100" height="33"/></clipPath></defs><path d="${SHIELD_PATH}" fill="#fff"/><g transform="translate(50 52) scale(.86) translate(-50 -52)"><path d="${SHIELD_PATH}" fill="#1d4d97"/><path d="${SHIELD_PATH}" fill="#c8302c" clip-path="url(#${clip})"/></g><path d="M13 35.5H87" stroke="#fff" stroke-width="2.5"/><text x="50" y="26" font-size="10.5" letter-spacing=".4" fill="#fff" text-anchor="middle">INTERSTATE</text><text x="50" y="${num.length > 2 ? 74 : 78}" font-size="${size}" fill="#fff" text-anchor="middle">${esc(num)}</text></svg>`
    : `<svg viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="9" fill="#111"/><path d="M17 12H83Q85 21 91 24Q93 51 82 69Q71 86 50 92Q29 86 18 69Q7 51 9 24Q15 21 17 12Z" fill="#fff"/><text x="50" y="${num.length > 2 ? 64 : 67}" font-size="${size}" fill="#111" text-anchor="middle">${esc(num)}</text></svg>`;
  return `<span class="ph-sign" aria-hidden="true">${svg}</span>`;
}

/* The on-the-job band rides on every state page, so its CSS is its own head
   block rather than part of the West Virginia step-form trial. */
const JOB_HEAD = `<style>
/* On the job --------------------------------------------------------------
   Built the way the large van lines build this band: one photograph doing the
   proving, and the day itself as a short numbered list — four lines, one
   sentence each — with a single button. The
   three supporting frames ride under the lead as thumbnails. Phones get the
   same thing stacked: photo, steps, button. Nothing to swipe. */
.job-band { padding: 5.5rem 2rem; background: var(--paper-warm); }
.job-inner {
  display: grid; grid-template-columns: 1.02fr 1fr; align-items: center;
  grid-template-areas: "media intro" "media body";
  gap: 1.4rem 4rem;
  max-width: 1180px; margin: 0 auto;
}
.job-media { grid-area: media; min-width: 0; }
.job-intro { grid-area: intro; align-self: end; min-width: 0; }
.job-body { grid-area: body; align-self: start; min-width: 0; }
.job-fig {
  position: relative; overflow: hidden; margin: 0;
  aspect-ratio: 4 / 3; border-radius: 20px; background: #fff;
  box-shadow: 0 30px 60px -34px rgba(12, 26, 43, 0.6);
}
.job-fig img { width: 100%; height: 100%; object-fit: cover; display: block; }
.job-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); align-items: start; gap: 0.75rem; margin-top: 0.75rem; }
.job-thumbs img {
  width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; display: block;
  border-radius: 12px; background: #fff;
}
.job-kicker { display: block; margin-bottom: 0.7rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green); }
.job-intro h2 { margin: 0 0 0.7rem; font-size: clamp(1.75rem, 2.9vw, 2.5rem); font-weight: 600; letter-spacing: -0.035em; line-height: 1.1; text-wrap: balance; color: var(--ink); }
.job-intro h2 em { font-style: normal; color: var(--accent); }
.job-lede { margin: 0 0 1.9rem; font-size: 1rem; line-height: 1.6; color: var(--ink-soft); }
.job-steps { margin: 0 0 1.9rem; padding: 0; list-style: none; }
.job-step { position: relative; padding: 0 0 1.35rem 3.1rem; }
.job-step:last-child { padding-bottom: 0; }
/* Rail down the numbers, so four lines read as one sequence. */
.job-step:not(:last-child)::before {
  content: ""; position: absolute; left: 1.07rem; top: 2.3rem; bottom: 0.35rem;
  border-left: 2px dashed rgba(12, 26, 43, 0.18);
}
.job-num {
  position: absolute; left: 0; top: 0;
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.25rem; height: 2.25rem;
  border-radius: 50%; background: #269382; color: #fff;
  font-size: 0.82rem; font-weight: 700;
}
.job-step h3 { margin: 0.25rem 0 0.25rem; font-size: 1.08rem; font-weight: 700; letter-spacing: -0.015em; color: var(--ink); }
.job-step p { margin: 0; font-size: 0.95rem; line-height: 1.55; color: var(--ink-soft); }
.job-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.9rem 1.3rem; }
/* The band carries its own button: .ph-btn only ships on the step-form pages.
   The arrow rides in its own disc inside the pill, so the shape has a centre
   of gravity instead of a floating glyph. Two shadows — a tight contact one
   and a wide ambient one — keep it sitting on the paper rather than hovering
   over it, and the disc, not the whole button, does the moving on hover. */
.job-cta {
  display: inline-flex; align-items: center; gap: 1.05rem;
  padding: 0.5rem 0.5rem 0.5rem 1.7rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff; font-size: 1rem; font-weight: 600; letter-spacing: -0.005em;
  text-decoration: none; white-space: nowrap;
  box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.5),
              0 18px 34px -20px rgba(120, 40, 15, 0.75);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.job-cta-chip {
  display: inline-grid; place-items: center;
  width: 2.5rem; height: 2.5rem; flex-shrink: 0;
  border-radius: 50%; background: #fff; color: #269382;
  transition: background 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.job-cta-chip svg {
  width: 16px; height: 16px;
  fill: none; stroke: currentColor; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.job-cta:hover {
  background: #b64c26;
  box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.55),
              0 26px 44px -22px rgba(120, 40, 15, 0.8);
  transform: translateY(-1px);
}
.job-cta:hover .job-cta-chip { color: #1f7a6c; transform: translateX(2px); }
.job-cta:hover .job-cta-chip svg { transform: translateX(1px); }
.job-cta:active { transform: translateY(0); box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.6); }
.job-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .job-cta, .job-cta-chip, .job-cta-chip svg { transition: none; }
  .job-cta:hover, .job-cta:hover .job-cta-chip, .job-cta:hover .job-cta-chip svg { transform: none; }
}

@media (max-width: 1100px) {
  .job-band { padding: 4.5rem 1.5rem; }
  .job-inner { grid-template-columns: 1fr; grid-template-areas: "intro" "media" "body"; gap: 1.6rem; }
  .job-media { max-width: none; }
  .job-fig { aspect-ratio: 16 / 10; }
}
/* Phones: heading, photograph, the four lines, one button — top to bottom. */
@media (max-width: 768px) {
  .job-band { padding: 3rem 1.25rem 3.25rem; }
  .job-intro h2 { font-size: 1.7rem; }
  .job-lede { margin-bottom: 1.4rem; font-size: 0.94rem; }
  .job-steps { margin-bottom: 1.4rem; }
  .job-step { padding: 0 0 1.1rem 2.8rem; }
  .job-num { width: 2rem; height: 2rem; font-size: 0.76rem; }
  .job-step:not(:last-child)::before { left: 0.94rem; top: 2.05rem; }
  .job-step h3 { font-size: 1rem; }
  .job-step p { font-size: 0.9rem; }
  .job-fig { border-radius: 16px; }
  .job-thumbs { gap: 0.5rem; margin-top: 0.5rem; }
  .job-foot { display: block; }
  .job-cta { display: flex; justify-content: center; gap: 0.8rem; padding: 0.45rem 0.45rem 0.45rem 1.4rem; font-size: 0.97rem; }
  .job-cta-chip { width: 2.3rem; height: 2.3rem; }
}
</style>`;

const STEP_FORM_HEAD = `<link rel="preload" as="image" href="/assets/images/hero-bg-mountain.jpg" media="(min-width: 769px)">
<link rel="preload" as="image" href="/assets/images/hero-bg-mountain-mobile.jpg" media="(max-width: 768px)">
<style>
/* Photo hero ---------------------------------------------------------------
   Truck on an open road behind the full width of the hero. The wash is darkest
   on the left under the headline and opens up to the right, where the truck
   and the sky show around the form. The left column is only the headline. */
body { overflow-x: clip; }
.hero.hero-photo {
  isolation: isolate;
  grid-template-areas: "content form";
  grid-template-rows: auto;
  column-gap: 4rem;
  row-gap: 1.1rem;
  align-content: center;
  min-height: min(840px, 100vh);
  padding-top: calc(var(--nav-h) + 3rem);
  padding-bottom: 8rem;
}
.hero.hero-photo::before {
  top: 0; bottom: 0; right: auto;
  left: calc(50% - 50vw);
  width: 100vw; height: auto;
  opacity: 1;
  z-index: -1;
  background:
    radial-gradient(ellipse 46% 30% at 25% 50%, rgba(9, 20, 34, 0.66), rgba(9, 20, 34, 0) 100%),
    linear-gradient(180deg, rgba(9, 20, 34, 0.5) 0%, rgba(9, 20, 34, 0.18) 40%, rgba(9, 20, 34, 0.1) 72%, rgba(9, 20, 34, 0.45) 100%),
    var(--navy-deep) url('/assets/images/hero-bg-mountain.jpg') 100% 0% / auto 140% no-repeat;
}
.hero-photo .hero-content { align-self: center; }
.hero-photo h1 { color: #fff; text-shadow: 0 2px 24px rgba(0, 0, 0, 0.3); }
.hero-photo h1 em { color: #f4a37f; }

/* Proof section --------------------------------------------------------- */
/* flow-root keeps the stats card's negative margin inside the section; it had
   collapsed through and pulled the cream ground up over the hero instead. */
.ph-proof { position: relative; display: flow-root; background: var(--paper); padding: 0 2rem 5.5rem; }

/* About: photo collage on the left (crew photo, road inset, a floating
   coverage badge), the intro, the three local points and two CTAs on the right. */
.ph-about {
  max-width: 1240px;
  margin: 5.5rem auto 0;
  display: grid; grid-template-columns: 1.05fr 1fr;
  gap: 5rem; align-items: center;
}
.ph-media { position: relative; padding: 0 3.5rem 3.5rem 0; }
.ph-media::before {
  content: ""; position: absolute; top: -1.6rem; right: 1.25rem;
  width: 150px; height: 150px;
  background-image: radial-gradient(var(--accent) 1.6px, transparent 1.8px);
  background-size: 15px 15px;
  opacity: 0.3;
}
.ph-media figure { margin: 0; overflow: hidden; }
.ph-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.ph-photo-main {
  position: relative;
  aspect-ratio: 1 / 0.86;
  border-radius: 26px;
  box-shadow: 0 40px 80px -40px rgba(12, 26, 43, 0.55);
}
.ph-photo-main img { object-position: 55% center; }
.ph-photo-inset {
  position: absolute; right: 0; bottom: 0;
  width: 44%; aspect-ratio: 4 / 3;
  border: 7px solid var(--paper);
  border-radius: 22px;
  box-shadow: 0 30px 50px -24px rgba(12, 26, 43, 0.55);
}
.ph-badge {
  position: absolute; left: -1.5rem; top: 2.25rem;
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.15rem 0.75rem 0.75rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 24px 44px -20px rgba(12, 26, 43, 0.45), 0 0 0 1px rgba(12, 26, 43, 0.04);
}
.ph-badge-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 12px; background: var(--accent);
}
.ph-badge-icon svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ph-badge strong { display: block; font-size: 0.92rem; font-weight: 700; color: var(--ink); line-height: 1.25; }
.ph-badge div > span { display: block; font-size: 0.76rem; color: var(--muted); }

.ph-kicker { display: block; margin-bottom: 0.7rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green); }
.ph-about h2 { margin: 0 0 1.15rem; font-size: clamp(2rem, 3.1vw, 2.75rem); font-weight: 600; letter-spacing: -0.035em; line-height: 1.08; color: var(--ink); }
.ph-about h2 em { font-style: normal; color: var(--accent); }
.ph-about-text p { max-width: 36rem; margin: 0; font-size: 1.02rem; line-height: 1.75; color: var(--ink-soft); }
.ph-more { display: none; }
.ph-points { list-style: none; margin: 1.6rem 0 0; padding: 0; display: grid; gap: 0.6rem; }
.ph-points li {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(12, 26, 43, 0.06), 0 10px 24px -18px rgba(12, 26, 43, 0.35);
  font-size: 0.98rem; font-weight: 600; color: var(--ink);
}
.ph-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; margin-top: 1.9rem; }
/* Same shape as the on-moving-day button: the arrow rides in its own disc,
   and the disc, not the whole pill, does the moving on hover. */
.ph-btn {
  display: inline-flex; align-items: center; gap: 1.05rem;
  padding: 0.5rem 0.5rem 0.5rem 1.7rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff; font-size: 1rem; font-weight: 600; letter-spacing: -0.005em;
  text-decoration: none; white-space: nowrap;
  box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.5),
              0 18px 34px -20px rgba(120, 40, 15, 0.75);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ph-btn-chip {
  display: inline-grid; place-items: center;
  width: 2.5rem; height: 2.5rem; flex-shrink: 0;
  border-radius: 50%; background: #fff; color: #269382;
  transition: background 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ph-btn-chip svg {
  width: 16px; height: 16px;
  fill: none; stroke: currentColor; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ph-btn:hover {
  background: #b64c26; transform: translateY(-1px);
  box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.55),
              0 26px 44px -22px rgba(120, 40, 15, 0.8);
}
.ph-btn:hover .ph-btn-chip { color: #1f7a6c; transform: translateX(2px); }
.ph-btn:hover .ph-btn-chip svg { transform: translateX(1px); }
.ph-btn:active { transform: translateY(0); box-shadow: 0 2px 4px -2px rgba(120, 40, 15, 0.6); }
@media (prefers-reduced-motion: reduce) {
  .ph-btn, .ph-btn-chip, .ph-btn-chip svg { transition: none; }
  .ph-btn:hover, .ph-btn:hover .ph-btn-chip, .ph-btn:hover .ph-btn-chip svg { transform: none; }
}
.ph-call { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.98rem; font-weight: 600; color: var(--ink); text-decoration: none; }
.ph-call:hover { color: var(--accent); }
.ph-call-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--navy);
}
.ph-call-icon svg { width: 17px; height: 17px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ph-btn:focus-visible, .ph-call:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; }
.ph-tick {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; flex-shrink: 0;
  border-radius: 50%; background: #e9f4ed;
}
.ph-tick svg { width: 14px; height: 14px; fill: none; stroke: var(--green); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }

/* Highway strip: the signs stand along a stretch of road with a dashed
   centre line, each with its name and the towns it links underneath. */
.ph-roads { max-width: 1240px; margin: 5.5rem auto 0; text-align: center; }
.ph-roads h3 { margin: 0 auto; max-width: 48rem; font-size: clamp(1.55rem, 2.4vw, 2.1rem); font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; color: var(--ink); }
.ph-roads h3 em { font-style: normal; color: var(--accent); }
.ph-road-list {
  position: relative;
  list-style: none; margin: 2.75rem 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(var(--n, 5), 1fr); gap: 1.5rem 1rem;
}
.ph-road-list::before {
  content: ""; position: absolute; left: 4%; right: 4%; top: 44px;
  height: 18px; margin-top: -9px; border-radius: 99px;
  background: var(--navy);
  box-shadow: 0 12px 24px -12px rgba(12, 26, 43, 0.5);
}
.ph-road-list::after {
  content: ""; position: absolute; left: 5.5%; right: 5.5%; top: 43px;
  border-top: 2px dashed #f2c14e;
}
.ph-road { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
.ph-sign {
  display: block; width: 88px; height: 88px;
  filter: drop-shadow(0 12px 14px rgba(12, 26, 43, 0.3));
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.ph-road:hover .ph-sign { transform: translateY(-5px) rotate(-3deg); }
.ph-sign svg { display: block; width: 100%; height: 100%; }
.ph-sign text { font-family: inherit; font-weight: 700; }
.ph-sign-plate {
  display: inline-flex; align-items: center; justify-content: center;
  width: auto; min-width: 88px; height: 60px; margin: 14px 0; padding: 0 0.9rem;
  border: 3px solid #fff; border-radius: 10px;
  background: #1f6b3a; color: #fff; font-size: 1.1rem; font-weight: 700;
}
.ph-road strong { margin-top: 1rem; font-size: 1rem; font-weight: 700; color: var(--ink); }
.ph-road span:not(.ph-sign) { margin-top: 0.25rem; max-width: 14rem; font-size: 0.85rem; line-height: 1.45; color: var(--muted); }
.ph-road span:empty { display: none; }

/* Step form card -----------------------------------------------------------
   Plain white on the photo: a heading, a step count, the fields and one line
   of reassurance. Nothing else competes with the button. */
.hero-form-wrap.qs-card {
  background: #fff;
  border: 0;
  border-radius: 20px;
  padding: 1.6rem 1.7rem 1.25rem;
  box-shadow: 0 40px 80px -28px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.qs-card .qs-header {
  display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
  margin-bottom: 0.9rem; padding-bottom: 0; border-bottom: 0;
}
.qs-card .qs-header h3 { font-size: 1.75rem; margin: 0; color: var(--ink); }
.qs-count { font-size: 0.78rem; font-weight: 600; color: var(--muted); white-space: nowrap; }
.qs-card:has(.form-success) .qs-count { display: none; }

.qs-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 1.25rem; }
.qs-bar i { height: 4px; border-radius: 999px; background: #ebe5dc; transition: background 0.35s ease; }
.qs-bar i.is-done { background: var(--green); }

.qs-step { border: 0; margin: 0; padding: 0; min-width: 0; }
.qs-step.is-active { animation: qsIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes qsIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
.form-enter .qs-card .qs-step .form-submit { animation: none; }

.qs-card .form-row { margin-bottom: 1rem; }
.qs-card .form-row-2 { gap: 0.8rem; }
.qs-card .form-row-consent { margin: -0.15rem 0 0.95rem; }
.qs-card .form-row label { font-size: 0.84rem; font-weight: 600; color: var(--ink-soft); margin-bottom: 0.35rem; }
.qs-card .form-row > div:focus-within > label { color: var(--ink); }
.qs-card .form-row input,
.qs-card .form-row select {
  min-height: 50px;
  padding: 0.65rem 0.9rem;
  border: 1px solid #ddd6cb;
  border-radius: 10px;
  background-color: #faf8f4;
  color: var(--ink);
  font-size: 1rem;
}
.qs-card .form-row select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a7f6f' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  padding-right: 2.2rem;
}
.qs-card .form-row input:hover,
.qs-card .form-row select:hover { border-color: #bfb5a6; }
.qs-card .form-row input:focus,
.qs-card .form-row select:focus {
  border-color: var(--green);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(47, 143, 91, 0.16);
}

.qs-nav { display: flex; gap: 0.6rem; align-items: stretch; }
.qs-nav .form-submit { flex: 1; margin-top: 0; }
.qs-card .qs-step > .form-submit { margin-top: 0; }
.qs-back {
  flex: 0 0 52px;
  border-radius: 999px;
  border: 1px solid #ddd6cb;
  background: #fff;
  color: var(--ink);
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.qs-back:hover { border-color: #bfb5a6; background: #faf8f4; }
.qs-back:focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }

.qs-secure {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  margin-top: 0.95rem;
  font-size: 0.76rem; color: var(--muted);
}
.qs-secure svg { width: 13px; height: 13px; fill: none; stroke: var(--green); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }

@media (max-width: 1100px) {
  .hero.hero-photo { column-gap: 2rem; }
  .ph-stat { padding: 1.3rem 1.15rem; }
  .ph-stat strong { font-size: 1.8rem; }
  .ph-stat-label { font-size: 0.86rem; }
  .ph-stat-sub { font-size: 0.75rem; }
  .ph-about { gap: 3rem; }
  .ph-media { padding: 0 2.5rem 2.5rem 0; }
  .ph-badge { left: 1rem; top: 1rem; }
  /* Signs wrap onto two rows here, so the road behind them goes. */
  .ph-road-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem 1rem; }
  .ph-road-list::before, .ph-road-list::after { display: none; }
  .ph-road { flex: 0 0 calc((100% - 2rem) / 3); }
}
@media (max-width: 900px) {
  .ph-about { grid-template-columns: 1fr; }
  .ph-media { max-width: 640px; }
}
@media (max-width: 768px) {
  .hero.hero-photo {
    grid-template-areas: "content" "form";
    grid-template-rows: auto;
    align-content: start;
    min-height: auto;
    padding-top: calc(var(--nav-h) + 1.25rem);
    padding-bottom: 6rem;
    row-gap: 1rem;
  }
  /* Portrait cut with the branded truck a third of the way down. It sits at
     full width from the top, and the form drops below a clear band so the
     truck shows between the headline and the card; the wash is heavy under
     the headline, near clear across the truck, then heavy again behind the
     form and copy, reaching solid navy before the photo runs out. */
  .hero.hero-photo::before {
    background:
      linear-gradient(180deg,
        rgba(9, 20, 34, 0.72) 0,
        rgba(9, 20, 34, 0.5) 30vw,
        rgba(9, 20, 34, 0.05) 44vw,
        rgba(9, 20, 34, 0.08) 80vw,
        rgba(9, 20, 34, 0.86) 100vw,
        var(--navy-deep) 145vw),
      var(--navy-deep) url('/assets/images/hero-bg-mountain-mobile.jpg') center -32vw / 100% auto no-repeat;
  }
  /* Photo drawn at full width is ~179vw tall and pulled up 32vw, so the truck
     runs from ~49vw to ~80vw down.
     The form starts just under the lettering, above the wheels, so most of the
     truck shows and the card still clears the sticky call bar on common phones. */
  .hero-photo .hero-form-col { margin-top: 44vw; }
  .hero-form-wrap.qs-card { padding: 1.15rem 1.1rem 1rem; border-radius: 18px; }
  .qs-card .qs-header h3 { font-size: 1.35rem; }
  .qs-bar { margin-bottom: 1rem; }
  .qs-card .form-row { margin-bottom: 0.85rem; }
  .qs-card .form-row-2 { gap: 0.6rem; }
  .qs-card .form-row input,
  .qs-card .form-row select { min-height: 48px; border: 1px solid #ddd6cb; background-color: #faf8f4; }

  .ph-proof { padding: 0 1.25rem 2.75rem; }
  /* Compact on phones: photo first with a smaller inset and badge, smaller
     type, the local points as wrapping pills, and the at-a-glance band in
     one column. */
  .ph-about { grid-template-columns: 1fr; gap: 1.75rem; margin-top: 2.5rem; }
  .ph-media { padding: 0 0 1.75rem; }
  .ph-media::before { display: none; }
  .ph-photo-main { aspect-ratio: 4 / 3; border-radius: 18px; }
  .ph-photo-inset { right: 0.75rem; width: 40%; border-width: 4px; border-radius: 14px; }
  .ph-badge { left: 0.65rem; top: 0.65rem; gap: 0.55rem; padding: 0.5rem 0.8rem 0.5rem 0.5rem; border-radius: 12px; }
  .ph-badge-icon { width: 30px; height: 30px; border-radius: 9px; }
  .ph-badge-icon svg { width: 16px; height: 16px; }
  .ph-badge strong { font-size: 0.8rem; }
  .ph-badge div > span { font-size: 0.68rem; }
  .ph-kicker { margin-bottom: 0.45rem; font-size: 0.66rem; }
  .ph-about h2 { margin-bottom: 0.7rem; font-size: 1.5rem; }
  .ph-about-text p { font-size: 0.92rem; line-height: 1.62; }
  /* Four lines of the intro, the rest behind Read more (site.js). The full
     text stays in the markup. */
  .ph-about-text p { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .ph-about-text.is-open p { display: block; overflow: visible; }
  .ph-more {
    display: inline-block; margin-top: 0.35rem; padding: 0;
    border: 0; background: none; cursor: pointer;
    font: inherit; font-size: 0.85rem; font-weight: 600;
    color: var(--accent); text-decoration: underline; text-underline-offset: 3px;
  }
  .ph-points { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; padding-top: 0; border-top: 0; }
  .ph-points li { gap: 0.35rem; padding: 0.3rem 0.7rem 0.3rem 0.35rem; border-radius: 999px; background: #fff; box-shadow: 0 0 0 1px rgba(12, 26, 43, 0.08); font-size: 0.78rem; }
  .ph-tick { width: 18px; height: 18px; }
  .ph-tick svg { width: 10px; height: 10px; }
  /* The sticky call bar already carries the phone number on phones. */
  .ph-cta { margin-top: 1.25rem; }
  .ph-btn { flex: 1 1 100%; justify-content: center; gap: 0.8rem; padding: 0.45rem 0.45rem 0.45rem 1.4rem; font-size: 0.97rem; }
  .ph-btn-chip { width: 2.3rem; height: 2.3rem; }
  .ph-call { display: none; }
  .ph-roads { margin-top: 3rem; }
  .ph-roads h3 { font-size: 1.35rem; }
  .ph-road-list { margin-top: 1.6rem; gap: 1.4rem 0.5rem; }
  .ph-road { flex-basis: calc((100% - 1rem) / 3); }
  .ph-sign { width: 62px; height: 62px; }
  .ph-sign-plate { min-width: 62px; height: 44px; margin: 9px 0; font-size: 0.85rem; }
  .ph-road strong { margin-top: 0.6rem; font-size: 0.8rem; }
  .ph-road span:not(.ph-sign) { font-size: 0.7rem; line-height: 1.35; }
}
/* Navbar badge on phones, this page only: a bigger check seal and a smaller
   label than the shared styles.css sizing. */
@media (max-width: 768px) {
  .fmcsa-badge { height: 27px; padding-left: 0.12rem; gap: 0.2rem; font-size: 0.36rem; }
  .fmcsa-badge .fb-seal { width: 24px; height: 24px; }
}

/* Short phones: the 50vw drop pushed the Next button under the sticky call
   bar once the browser toolbars take their share of the height, so the form
   rides higher the shorter the screen, trading some truck for the button. */
@media (max-width: 768px) and (max-height: 700px) {
  .hero-photo .hero-form-col { margin-top: 36vw; }
}
@media (max-width: 768px) and (max-height: 600px) {
  .hero-photo .hero-form-col { margin-top: 18vw; }
}
/* Where svh is supported, size the drop from the small viewport instead —
   the height left while the browser toolbars show, which is shorter in
   Chrome (address bar plus toolbar) than in Safari's compact bar. About 30rem
   of that goes to the nav, headline, the card down to Next, and the call bar,
   so the form drops as far as it can (up to 50vw) without hiding Next. */
@media (max-width: 768px) {
  @supports (height: 100svh) {
    .hero-photo .hero-form-col { margin-top: clamp(4vw, calc(100svh - 31rem), 44vw); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .qs-step.is-active { animation: none; }
  .job-step img { transition: none; }
}

/* On the job, the numbers — West Virginia trial ----------------------------
   Overrides JOB_HEAD's list (this block ships after it, so equal-specificity
   rules win). The dashed hairline and small dots read as an afterthought; the
   order is the point of the list, so the numbers get weight, a solid rail runs
   through them, and each title sits on its number's centre line. */
.job-step { padding: 0 0 1.7rem 3.9rem; }
.job-step:last-child { padding-bottom: 0; }
.job-num {
  top: -0.1rem;
  width: 2.5rem; height: 2.5rem;
  background: #269382;
  box-shadow: 0 0 0 5px var(--paper-warm), 0 10px 20px -12px rgba(38, 147, 130, 0.9);
  font-size: 0.92rem;
}
.job-step:not(:last-child)::before {
  left: 1.25rem; top: 2.5rem; bottom: -0.2rem;
  border-left: 2px solid rgba(38, 147, 130, 0.28);
}
.job-step h3 { margin: 0.45rem 0 0.3rem; font-size: 1.12rem; }
.job-step p { font-size: 0.96rem; line-height: 1.6; }

@media (max-width: 768px) {
  .job-step { padding: 0 0 1.35rem 3.4rem; }
  .job-num { width: 2.2rem; height: 2.2rem; font-size: 0.84rem; box-shadow: 0 0 0 4px var(--paper-warm), 0 8px 16px -10px rgba(46, 139, 87, 0.9); }
  .job-step:not(:last-child)::before { left: 1.1rem; top: 2.2rem; }
  .job-step h3 { margin-top: 0.3rem; font-size: 1.02rem; }
  .job-step p { font-size: 0.9rem; }
}
</style>`;

const FOOTER = `<section id="contact" class="contact-strip">
  <div class="contact-strip-inner">
    <div class="cs-text">
      <h2>Still have questions?</h2>
      <p>Our team is available 24 / 7. Call us or send an email and we'll get back to you within a few hours.</p>
    </div>
    <div class="cs-ctas">
      <a href="tel:${PHONE_HREF}" class="cs-phone">
        ${phoneIconLg}
        ${PHONE_DISPLAY}
      </a>
      <a href="mailto:${EMAIL}" class="cs-email">${EMAIL}</a>
    </div>
  </div>
</section>

<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="logo">
        <img src="/assets/images/48-state-movers-logo.png" alt="50STATEMOVERS INC" class="logo-img logo-img-footer" />
      </div>
      <p>Built on trust, run on reliability. We deliver honest, fixed-price quotes with no hidden fees — and a crew that treats your home like their own. Serving families and businesses across the Continental US.</p>
      <div class="footer-social">
        <a href="#" class="social-link" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="#" class="social-link" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="#" class="social-link" aria-label="Yelp">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 2C7 2 2.5 6.5 2.5 12S7 22 12.5 22 22.5 17.5 22.5 12 18 2 12.5 2zm-1 14.5c-.3.8-1.1 1.3-2 1.1l-2.2-.6c-.9-.2-1.4-1.1-1.1-2l.1-.3c.1-.4.5-.6.9-.5l3.5 1c.4.1.7.5.6.9l-.1.3-.1.1zm5.9-3.8c.5.8.3 1.7-.5 2.2l-2 1.2c-.8.5-1.7.2-2.2-.5l-.2-.3c-.2-.4-.1-.8.3-1l3.2-1.9c.4-.2.8-.1 1 .3v.3l.4-.3zm-8.8-5.1l2.2-.4c.9-.2 1.7.4 1.9 1.3l.1.4c.1.4-.2.8-.6.9L8.5 11c-.4.1-.8-.1-.9-.5V10c0-.9.4-1.8 1-.9l.1-.1-.1-.3v-.3c-.2-.9.4-1.7 1.3-1.8h-.1zM14 8.1c.4-.8 1.3-1.1 2.1-.7l2 1.1c.8.4 1.1 1.4.7 2.2l-.2.3c-.2.4-.6.5-1 .3l-3.2-1.8c-.4-.2-.5-.6-.3-1l.2-.3-.3-.1z"/></svg>
        </a>
        <a href="#" class="social-link" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Services</h4>
      <ul>
        <li><a href="#services">Residential</a></li>
        <li><a href="#services">Commercial</a></li>
        <li><a href="#services">Packing</a></li>
        <li><a href="#services">Storage</a></li>
        <li><a href="#services">Long Distance</a></li>
        <li><a href="#services">White Glove</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="${HUB_URL}">Movers by state</a></li>
        <li><a href="#gallery">Our work</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <ul>
        <li><a href="tel:${PHONE_HREF}">${PHONE_DISPLAY}</a></li>
        <li><a href="tel:+19739658357">(973) 965-8357 — Direct</a></li>
        <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><a href="${HUB_URL}">Nationwide, USA</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div>© 2026 50STATEMOVERS INC · All rights reserved · <a href="/privacy-policy" style="color: var(--muted); text-decoration: underline;">Privacy Policy</a> · <a href="/terms-of-service" style="color: var(--muted); text-decoration: underline;">Terms of Service</a></div>
    <div>USDOT #${USDOT} · ${MC} · Licensed &amp; Insured across the Continental US</div>
  </div>
</footer>

<div class="sticky-cta" role="region" aria-label="Quick actions">
  <a href="tel:${PHONE_HREF}" class="call">
    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    Call us
  </a>
  <a href="#get-quote" class="quote">
    Get free quote
    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>
</div>`;

/* Trial nav: the shared bar lists five links in an order that predates the
   page it sits on. It has no link to #costs — now a full section with its own
   hero — and its order does not match the order you actually scroll through.
   Rewritten to page order, with Pricing added. Applies to both the desktop
   list and the mobile menu, which carry the same markup. */
const TRIAL_NAV_LINKS = `<li><a href="#coverage">Coverage</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#costs">Pricing</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#faq">FAQ</a></li>`;

/* A slim credentials strip above the bar. The prefix is inside one span so
   that hiding it on very narrow phones takes its separator with it. The icon
   is decorative — the text already says "Licensed & insured" — so it is
   aria-hidden rather than carrying its own label. */
const CRED_ICON = `<svg class="cred-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.5 4.5 5.5v5.2c0 5 3.2 9.1 7.5 10.8 4.3-1.7 7.5-5.8 7.5-10.8V5.5L12 2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M8.5 12.3 11 14.8l4.5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CRED_BAR = `<div class="nav-cred">
  ${CRED_ICON}
  <span class="cred-lead">Licensed &amp; insured · </span>${MC} · USDOT #${USDOT}
</div>`;

/* The hub's own section set — it has a destinations list where a state page
   has pricing, and no costs section at all. */
const TRIAL_HUB_NAV_LINKS = `<li><a href="#coverage">All states</a></li>
    <li><a href="#routes">Destinations</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#faq">FAQ</a></li>`;

const TRIAL_NAV = NAV.replace(
  /<li><a href="#services">[\s\S]*?<a href="#faq">FAQ<\/a><\/li>/g,
  TRIAL_NAV_LINKS);

const TRIAL_HUB_NAV = NAV.replace(
  /<li><a href="#services">[\s\S]*?<a href="#faq">FAQ<\/a><\/li>/g,
  TRIAL_HUB_NAV_LINKS);

/* --------------------------------------------- the state-page design */
// Developed on New York as a trial, now on every state page. It still lives in
// the <style> block below rather than styles.css because styles.css is shared
// with the homepage, the hub and the legal pages, and this block retokens the
// palette and type — moving it there would restyle those too. To trial a new
// change on one page again, gate it on a separate set rather than this one.
const TRIAL_STATES = new Set(states.map(s => s.name));

/* One-line hero headlines. Each title's width in em, measured in headless
   Chrome at the hero's weight and tracking: [text, desktop em, mobile em] —
   mobile is wider because the state name is set at 1.35em there. The CSS
   divides the column width by these to get a size that exactly fits.
   Keyed with the text it was measured for: if a title in SEO_TITLES changes,
   the entry no longer matches, the page drops back to an ordinary wrapping
   headline, and it needs re-measuring. */
const HEADLINE_FIT = {
  'alabama': ['Alabama State-to-State Movers', 14.272, 15.758],
  'arizona': ['Arizona Out-of-State Movers', 13.052, 14.359],
  'arkansas': ['Arkansas State-to-State Moving', 14.54, 16.139],
  'california': ['California Interstate Movers', 12.442, 14.074],
  'colorado': ['Colorado State-to-State Movers', 14.401, 15.945],
  'connecticut': ['Connecticut Out-of-State Movers', 15.083, 17.15],
  'delaware': ['Delaware Interstate Moving Services', 16.521, 18.106],
  'florida': ['Florida State-to-State Movers', 13.348, 14.51],
  'georgia': ['Georgia Out-of-State Movers', 13.103, 14.428],
  'idaho': ['Idaho State-to-State Movers', 12.792, 13.735],
  'illinois': ['Illinois Interstate Movers', 10.943, 12.025],
  'indiana': ['Indiana Out-of-State Movers', 12.852, 14.089],
  'iowa': ['Iowa State-to-State Movers', 12.413, 13.212],
  'kansas': ['Kansas Interstate Moving Services', 15.626, 16.873],
  'kentucky': ['Kentucky State-to-State Movers', 14.569, 16.172],
  'louisiana': ['Louisiana Out-of-State Movers', 13.866, 15.482],
  'maine': ['Maine Interstate Movers', 10.917, 11.953],
  'maryland': ['Maryland State-to-State Movers', 14.563, 16.164],
  'massachusetts': ['Massachusetts Out-of-State Movers', 16.465, 19.041],
  'michigan': ['Michigan Interstate Movers', 12.303, 13.86],
  'minnesota': ['Minnesota State-to-State Movers', 15.046, 16.827],
  'mississippi': ['Mississippi Out-of-State Movers', 14.592, 16.487],
  'missouri': ['Missouri Interstate Movers', 12.019, 13.478],
  'montana': ['Montana State-to-State Movers', 14.287, 15.778],
  'nebraska': ['Nebraska Out-of-State Movers', 13.912, 15.533],
  'nevada': ['Nevada Interstate Movers', 11.604, 12.894],
  'new-hampshire': ['New Hampshire State-to-State Movers', 17.477, 20.158],
  'new-jersey': ['New Jersey Out-of-State Movers', 14.918, 16.915],
  'new-mexico': ['New Mexico Interstate Movers', 13.722, 15.801],
  'new-york': ['New York State-to-State Movers', 14.624, 16.245],
  'north-carolina': ['North Carolina Interstate Movers', 14.646, 17.099],
  'north-dakota': ['North Dakota Out-of-State Movers', 15.528, 17.764],
  'ohio': ['Ohio State-to-State Movers', 12.382, 13.17],
  'oklahoma': ['Oklahoma Interstate Movers', 12.72, 14.424],
  'oregon': ['Oregon Out-of-State Movers', 12.934, 14.187],
  'pennsylvania': ['Pennsylvania State-to-State Movers', 16.315, 18.578],
  'rhode-island': ['Rhode Island Interstate Movers', 13.949, 16.133],
  'south-carolina': ['South Carolina Out-of-State Movers', 16.166, 18.649],
  'south-dakota': ['South Dakota State-to-State Movers', 16.325, 18.592],
  'tennessee': ['Tennessee Interstate Movers', 13.086, 14.931],
  'texas': ['Texas State-to-State Movers', 12.939, 13.935],
  'utah': ['Utah Out-of-State Movers', 11.702, 12.501],
  'vermont': ['Vermont Interstate Movers', 12.028, 13.479],
  'virginia': ['Virginia State-to-State Movers', 13.69, 14.984],
  'washington': ['Washington Out-of-State Movers', 14.976, 16.993],
  'washington-dc': ['Washington DC Interstate Movers', 15.149, 17.766],
  'west-virginia': ['West Virginia Interstate Movers', 14.091, 16.336],
  'wisconsin': ['Wisconsin State-to-State Movers', 15.014, 16.783],
  'wyoming': ['Wyoming Out-of-State Movers', 13.915, 15.524],
};

function headlineFit(s) {
  const fit = HEADLINE_FIT[s.slug];
  const text = headline(s).replace(/<[^>]+>/g, '');
  if (!fit || fit[0] !== text) return '';
  return ` class="h1-fit" style="--hw-d:${fit[1]};--hw-m:${fit[2]}"`;
}

const TRIAL_HEAD = `<style>
:root {
  /* One face for the whole page. Inter at 600 with tight tracking carries the
     headings; the serif is gone entirely, so the trial now loads no font of
     its own — Inter already ships with every page. */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  /* Text face back to Inter, the site default. Libre Franklin was the period
     partner for Playfair, but its narrower, older forms cost clarity at the
     sizes this page actually reads at — and Inter is markedly cleaner on
     digits, which is what the phone number, mileages and USDOT are made of.
     It also loads on every page already, so the trial now requests one font
     instead of two. */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Palette ------------------------------------------------------------
     The cream and the terracotta are unchanged — this only settles the cool
     side of the page. It had been running three separate cool hues: navy for
     the dark sections, an unrelated brighter blue for the stats band, and a
     fairly saturated green for the call buttons. Four hues with nothing
     holding them together is what made the page read generic.

     The bright blue is now the navy's own light step, so the stats band
     belongs to the dark sections instead of arriving as a fourth colour, and
     the green drops to an evergreen that sits in the same register as the
     rest. Green stays reserved for "call" — it is the one hue that carries a
     meaning, so it keeps its own identity, just at a lower volume. */
  --ink: #191612;
  --paper: #f6f1e9;
  --paper-warm: #eae1d2;
  --muted: #877c6c;
  --line: #d8cebc;

  --navy: #10243c;
  --navy-deep: #0a1727;
  --navy-soft: #1b3350;

  /* Was #1d5fa8 — a blue of its own. Now the navy two steps lighter. */
  --blue: #1a4570;
  --blue-deep: #123152;
  --blue-text: #b6cde6;

  /* Was #3fae6b. Same signal, less candy. */
  --green: #2f8f5b;
  --green-deep: #237046;
}

/* Headline ---------------------------------------------------------------
   The state name takes --accent — the same terracotta filling the "Free
   quotes / Same day" card a little further down the hero, so the two warm
   marks above the fold match. It had been a deep forest green, which made the
   H1 the only green thing on the page while green everywhere else means
   "call". */
.hero h1 em { color: var(--accent); }

/* Illustrated band -------------------------------------------------------
   Reuses .services / .service-card so this adds no new card design — only the
   image slot is new. Sits on paper: the artwork's near-black strokes vanish
   against the dark sections. */
/* Sage rather than a saturated green: the artwork is near-black over
   transparent, and on a deep forest fill the truck and dolly frames lose their
   internal detail and collapse into silhouettes. This is light enough to keep
   them readable while still clearly reading as green, and it ties the band to
   the green in the H1. */
.illus-card {
  text-align: center;
  background: #d9e5d8;
  border-color: #bed0bc;
}

.illus {
  width: 100%;
  max-width: 230px;
  height: auto;
  margin: 0 auto 1.4rem;
}

/* The shared .services grid goes 2-up under 768px, which breaks a three-step
   sequence into 2 + 1 with an orphan. These are narrative steps, so on a phone
   they stack into a single column and stay in order. */
@media (max-width: 900px) {
  .illus { width: 7.2rem; height: 5.2rem; margin-bottom: 0.9rem; }
}

@media (max-width: 768px) {
  .illus-band .services { grid-template-columns: 1fr; gap: 0.9rem; }
  .illus-band .services { gap: 2.1rem; }
}

/* Service illustrations --------------------------------------------------
   Larger than the icon tile they replace — these carry detail a 26px glyph
   cannot, so shrinking them back into a 54px chip would waste them. No hover
   colour change: the art is terracotta on transparent and would disappear
   against an --accent fill. */
.service-illus {
  margin-bottom: 1.15rem;
}

.service-illus img {
  width: 100%;
  max-width: 138px;
  height: auto;
}

@media (max-width: 900px) {
  .service-illus img { max-width: 108px; }
  .service-illus { margin-bottom: 0.9rem; }
}

/* Credentials strip -------------------------------------------------------
   A fixed band above the bar. --nav-h is what the hero pads by, what the
   mobile menu hangs from and what the scroll-spy measures against, so it grows
   to the full occupied height (strip + bar) and the bar's own min-height is
   pinned separately — otherwise the bar itself would stretch to 100px.

   The string is 28.44em wide. At 0.75rem that needs about 341px of room, so
   below 380px the "Licensed & insured" prefix drops and the registration
   numbers alone (17.27em) carry it. */
:root {
  --cred-h: 28px;
  /* Strip + bar, measured. The stock token said 72px while the bar actually
     renders 77px, so hero content tucked under it — that understatement is in
     styles.css and still affects the other 48 pages. Pinning the bar's
     min-height to the same number keeps it a uniform height across desktop
     widths, so this figure is exact rather than a worst case. */
  --nav-h: 105px;
}

.nav-cred {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 101;
  height: var(--cred-h);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 1rem;
  background: var(--navy);
  color: #a9c0d6;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
}

/* Shield-check, in the same green the rest of the page reserves for trust
   signals — separate from the muted blue-grey the credentials text uses, so
   it reads as a mark of assurance rather than just another word in the line. */
.cred-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: #6fce9b;
}

nav.topnav {
  top: var(--cred-h);
  min-height: calc(var(--nav-h) - var(--cred-h));
}

@media (max-width: 768px) {
  :root {
    --cred-h: 26px;
    --nav-h: 92px;
  }

  .nav-cred { font-size: 0.7rem; letter-spacing: 0.04em; }
  .cred-icon { width: 11px; height: 11px; }
}

@media (max-width: 380px) {
  .cred-lead { display: none; }
}

/* Nav ---------------------------------------------------------------------
   The bar's cream is hardcoded rgba(245, 240, 232, …) rather than taken from
   --paper, so it sat a shade off the page it overlays once the palette moved.
   Retinted here, and given a real resting state: no border until you scroll,
   so at the top the bar reads as part of the hero rather than a strip pinned
   over it. */
nav.topnav {
  background: rgba(246, 241, 233, 0.86);
  border-bottom: 1px solid transparent;
}

nav.topnav.scrolled {
  background: rgba(246, 241, 233, 0.97);
  border-bottom-color: var(--line);
  box-shadow: 0 1px 20px rgba(26, 23, 19, 0.06);
}

/* Six links now, so they need to sit closer. */
.nav-links { gap: 1.65rem; font-size: 0.875rem; }

.nav-links a {
  color: var(--ink-soft);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover { color: var(--ink); }

/* .nav-phone has no white-space rule of its own, so when the bar runs out of
   room the number breaks mid-string and the button balls up. */
.nav-phone { white-space: nowrap; }

/* Between 769px and roughly 960px the six links plus both buttons no longer
   fit on one line, and the bar grew to two rows — worse here than on the
   shared nav because this one carries a sixth link. Everything steps down a
   size through that range instead. */
@media (min-width: 769px) and (max-width: 960px) {
  nav.topnav { padding: 0.75rem 1.25rem; }
  .logo-img { height: 34px; }
  .nav-links { gap: 1.05rem; font-size: 0.8rem; }
  .nav-right { gap: 0.6rem; }
  .nav-phone { padding: 0.5rem 0.8rem; font-size: 0.78rem; gap: 0.35rem; }
  .topnav .nav-cta { padding: 0.55rem 0.95rem; font-size: 0.78rem; }
}

/* Set by site.js for the section currently under the nav. */
.nav-links a.is-current { color: var(--accent); }
.nav-links a.is-current::after { width: 100%; }

/* Contact strip ------------------------------------------------------------
   Background is --blue rather than --navy: the same blue already used in the
   trust bar and behind the gallery, so it joins those instead of adding a
   fourth dark tone. The terracotta glow behind the heading (styles.css,
   .contact-strip::before) needed no change — a warm accent glow reads fine
   on a cool ground either way. */
.contact-strip { background: var(--navy); }

/* It was --accent, which put the page's only two "call" buttons in different
   colours: the nav phone and the sticky call button are green, this one was
   terracotta. Green here as well, so the colour means one thing throughout —
   and it stops this button competing with the quote CTA for the same signal.
   Uses the gradient the nav phone button already carries. */
.cs-phone {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-deep) 100%);
}

.cs-phone:hover {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-deep) 100%);
  filter: brightness(1.08);
}

/* Email was tinted the same blue as the old navy background so it would read
   as a colour rather than plain white. Now that the background is that blue,
   the same tint would sit almost flush against it — so it goes neutral
   instead: a soft white fill and border, which holds contrast on any dark
   ground including this one. */
.cs-email {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: var(--paper);
}

.cs-email:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.65);
  color: #ffffff;
}

/* .cs-ctas aligns its children flex-start (styles.css), so on desktop each
   button sizes to its own text — the shorter phone number left email's wider
   edge sticking out below it, looking misaligned rather than stacked. Stretch
   makes both match the container's width at every size, not just mobile. */
.cs-ctas { align-items: stretch; }
.cs-phone, .cs-email { width: 100%; }

/* styles.css centers .cs-email's text with text-align, which does nothing
   for a flex child's content — so the email sat flush-left under a centered
   phone number. justify-content is what actually centers it. */
.cs-email { justify-content: center; }

/* Coverage city pills -------------------------------------------------------
   The grid now carries the Census list, whose names run longer than the old
   hand-picked ones — "Parsippany-Troy Hills", "Saginaw (charter township)".
   The stock pill never wraps, so on desktop those ran past the pill's edge,
   and below 768px the shared rule cut them off with an ellipsis. In this grid
   they wrap to a second line instead, with the check mark held on the first.
   #states-grid is the Coverage grid only; the nearby-states pills don't carry
   the id and are unchanged. */
#states-grid .state-item {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  align-items: flex-start;
  line-height: 1.3;
}

#states-grid .state-check { margin-top: 0.15em; }

/* A grid row stretches every item to its tallest, so one wrapped name made
   the five short pills beside it into tall boxes with empty space. Centred,
   each pill keeps its own height. */
#states-grid { align-items: center; }

/* Coverage: twelve cities, then the rest -------------------------------
   The grid opens on the twelve largest at every width — two full rows on
   desktop — and the button shows the rest. Hidden by count rather than the
   shared stylesheet's 210px phone clip, which only ran below 480px and would
   cut a row in half wherever a long name wraps. The button already works at
   any width (site.js toggles .expanded); it was only ever displayed on
   phones. */
#states-grid { max-height: none; overflow: visible; }
#states-grid:not(.expanded) .state-item:nth-child(n+13) { display: none; }

#states-toggle {
  display: block;
  margin: 1.75rem auto 0;
  background: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s;
}

#states-toggle:hover { border-color: var(--accent); color: var(--accent); }

/* The client's sentence is the Coverage title. At the display size the other
   section titles use it ran to four lines, so it sits a size down; the state
   name keeps the terracotta em every section title has, and the number is a
   tap-to-call link underlined in the accent rather than a second orange. */
#coverage .section-header { max-width: 54rem; }

#coverage .section-header h2 {
  font-size: clamp(1.45rem, 2.8vw, 2.3rem);
  line-height: 1.22;
  letter-spacing: -0.025em;
}

#coverage .section-header h2 a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.18em;
  white-space: nowrap;
}

#coverage .section-header h2 a:hover { color: var(--accent); }

/* Headline on one line ----------------------------------------------------
   Sized to fit rather than guessed at. Each h1 carries its own measured width
   (--hw-d, --hw-m, from HEADLINE_FIT), and the size is the column width
   divided by it. The column is a steady 0.446 x viewport above 768px, but
   stops growing at 644px once the hero hits its 1400px max-width, so the
   desktop numerator is min(44vw, 640px) — without that ceiling a long title
   like New Hampshire's would overflow on wide screens under a flat rem cap.
   Below 768px the hero is single-column and the column is viewport minus
   40px. Both numerators are set a little under the measured limit.

   Pages without a matching measurement don't get .h1-fit and wrap normally. */
.hero h1.h1-fit { white-space: nowrap; }

@media (min-width: 769px) {
  .hero h1.h1-fit { font-size: min(calc(min(44vw, 640px) / var(--hw-d)), 2.7rem); }
}

@media (max-width: 768px) {
  /* The state name takes 1.35em here, which is why --hw-m is the wider one. */
  .hero h1.h1-fit { font-size: min(calc((100vw - 44px) / var(--hw-m)), 2.15rem); }
  .hero h1 em { font-size: 1.35em; }
}

/* Footer contact ------------------------------------------------------
   The two phone numbers were a green pill — green is the site's "call"
   colour elsewhere, but bright green on a dark footer surrounded by plain
   links read as an alert rather than a detail, and it singled out the phone
   numbers while leaving the email looking like an afterthought below them.

   Replaced with a small icon in front of each contact line instead — phone
   for both numbers, an envelope for the email. Colour stays the same muted
   --navy-text as every other footer link and brightens the same way on
   hover, so "Contact" reads as one coherent block instead of two treatments
   glued together. The icon is a CSS mask filled with currentColor, so it
   never needs its own colour rule and no markup change was needed to add it. */
.footer-col a[href^="tel:"],
.footer-col a[href^="mailto:"] {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 500;
}

.footer-col a[href^="tel:"]::before,
.footer-col a[href^="mailto:"]::before {
  content: '';
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
}

.footer-col a[href^="tel:"]::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E");
}

.footer-col a[href^="mailto:"]::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='m22 6-10 7L2 6'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='m22 6-10 7L2 6'/%3E%3C/svg%3E");
}

/* Headings ---------------------------------------------------------------
   A display serif carries at 400 on its own shapes; a grotesque set at the
   same weight and tracking just reads as large body text. So the headings take
   600 and tighter tracking, and the emphasis inside them stops being a 300
   italic — at that weight Inter's italic went limp against the roman. It keeps
   the colour shift and matches the surrounding weight. */
.section-header h2,
.spec-hero-inner h2,
.hero h1 {
  font-weight: 600;
  letter-spacing: -0.035em;
}

.section-header h2 em,
.spec-hero-inner h2 em,
.hero h1 em {
  font-weight: 600;
  font-style: normal;
}

.service-card h3,
.illus-card h3,
.note-body h3,
.spec-row summary,
.hero-form-header h3 {
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Section grounds --------------------------------------------------------
   The page ran cream / warm-cream for nine of its twelve sections, and those
   two are close enough that the whole run read as one flat surface. Each
   section that carries a distinct job now gets its own ground, drawn from the
   palette already in play rather than new hues:

     hero        paper       trust bar   navy
     band        sage        coverage    warm
     services    paper       costs       blush
     process     navy        notes       paper
     gallery     forest      faq         warm
     nearby      paper       contact     navy

   Sage and forest are the H1 green at two lightnesses; blush is the terracotta
   at very low saturation. */
/* Photograph behind the whole band, in place of the sage fill. Decorative
   only — the three cards carry the meaning — so the img is alt="" and hidden
   from assistive tech. */
.illus-band {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

/* A <picture>, not a bare <img>: the landscape frame crops to almost nothing
   usable on a phone, so narrow screens get a portrait cut of the same scene. */
.band-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
}

.band-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

/* The shot is bright daylight on a pale street, so it needs a heavy wash to
   hold cream text and to stop the cards fighting it for attention. */
.illus-band::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(10, 23, 39, 0.82), rgba(10, 23, 39, 0.74) 55%, rgba(10, 23, 39, 0.6));
}

.illus-band .section-header h2 { color: var(--paper); text-shadow: 0 1px 22px rgba(8, 18, 31, 0.5); }

/* Terracotta landed straight on the white truck body — the weakest contrast on
   the page. Warm cream instead; the italic already carries the emphasis. */
.illus-band .section-header h2 em { color: #f2c6ac; }
.illus-band .section-header p  { color: #cfd6dd; text-shadow: 0 1px 16px rgba(8, 18, 31, 0.55); }
.illus-band .section-kicker    { color: #e8a98c; }
.illus-band .section-kicker::before,
.illus-band .section-kicker::after { background: #a8674a; }

/* No card. Three full cards spanning the width left only a sliver of the
   photograph visible and read as heavy slabs; the panel was doing nothing but
   giving the artwork a light ground to sit on. So only the artwork keeps a
   light ground — a small paper tile — and the words sit straight on the photo.
   The band gets its air back and the street shows through. */
.illus-card {
  background: none;
  border: none;
  padding: 0;
  text-align: center;
}

.illus-card::before { display: none; }   /* the .service-card top accent rule */

.illus-card h3 {
  color: var(--paper);
  font-size: 1.16rem;
  margin-bottom: 0.45rem;
}

.illus-card p {
  color: #ccd4dc;
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 19rem;
  margin: 0 auto;
}

/* The tile: the artwork is near-black and terracotta, so it needs paper under
   it whatever the section behind is doing. */
.illus {
  width: 8.6rem;
  height: 6.1rem;
  max-width: none;
  object-fit: contain;
  background: var(--paper);
  border-radius: 14px;
  padding: 0.85rem 0.9rem;
  margin: 0 auto 1.1rem;
  box-shadow: 0 10px 26px -12px rgba(8, 18, 31, 0.55);
}

.illus-band .services { gap: 2.5rem; }

#costs.coverage-section { background: #f7eade; }
.spec-list, .spec-row { border-color: #e2cdb9; }

/* Photographs carry a dark ground better than a cream one. --blue rather than
   --navy: the navy is already the process and contact sections, and at that
   depth the gallery just read as a third slab of the same colour. This is the
   same blue as the trust bar, so the two blue moments bracket the page. */
.gallery-section { background: var(--blue); }
.gallery-section .section-header h2 { color: var(--paper); }
.gallery-section .section-header p  { color: #bcd0e6; }
.gallery-section .section-kicker    { color: #8fb0d4; }
.gallery-section .section-kicker::before,
.gallery-section .section-kicker::after { background: #46688f; }

/* Price-list hero ---------------------------------------------------------
   The section heading and intro sit on the photograph rather than above it, so
   the band opens the section instead of interrupting it. Full-bleed, because a
   1000px rounded panel read as a picture dropped into the page; edge to edge it
   reads as the section's own opening.

   The photo is bright through the doorway in the middle and dark at both
   edges, so a flat tint would not carry text. The scrim is a navy wash that
   deepens toward the bottom, over a horizontal darkening at the sides — which
   is where the frame is dark anyway, so it costs the picture very little. */
.spec-hero {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-bottom: 4.5rem;
  min-height: 30rem;
  display: grid;
  place-items: center;
  overflow: hidden;
  isolation: isolate;
}

.spec-hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 45%;
  z-index: -2;
}

.spec-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(10, 23, 39, 0.55), rgba(10, 23, 39, 0.2) 35%, rgba(10, 23, 39, 0.2) 65%, rgba(10, 23, 39, 0.55)),
    linear-gradient(180deg, rgba(10, 23, 39, 0.62), rgba(10, 23, 39, 0.78));
}

.spec-hero-inner {
  max-width: 47rem;
  padding: 5rem 2rem;
  text-align: center;
}

.spec-hero-inner .section-kicker { color: #e8a98c; }
.spec-hero-inner .section-kicker::before,
.spec-hero-inner .section-kicker::after { background: #a8674a; }

/* .section-header h2 carries the display face and scale, and this markup is
   not a .section-header — so the typography is restated here rather than
   inherited. */
.spec-hero-inner h2 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2rem, 4.2vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--paper);
  margin-bottom: 1.25rem;
  text-shadow: 0 1px 24px rgba(8, 18, 31, 0.45);
}

/* Terracotta on this ground is legible but muddy — the state name lifts to a
   warm cream instead, italic already carrying the emphasis. */
.spec-hero-inner h2 em { color: #f2c6ac; }

.spec-hero-inner p {
  font-size: 1.05rem;
  max-width: 35rem;
  margin: 0 auto;
  color: #dcd6cc;
  text-shadow: 0 1px 18px rgba(8, 18, 31, 0.5);
}

/* The band is the section's top edge, so the section's own padding goes. */
#costs.coverage-section { padding-top: 0; }

@media (max-width: 768px) {
  .spec-hero {
    min-height: 22rem;
    margin-bottom: 2.5rem;
  }
  .spec-hero-inner { padding: 3.25rem 1.5rem; }
}

/* Gallery lead ------------------------------------------------------------
   A fifth photo orphans in a two-column grid, so the strongest shot runs full
   width above the other four instead of squeezing into the rhythm. */
.gallery-lead {
  grid-column: 1 / -1;
  aspect-ratio: 16 / 9;
}

/* styles.css pins .gallery-item img to a flat 140px under 768px, which left
   the lead image filling only the top of its taller box — navy gap beneath it
   and the caption stranded at the bottom. The lead opts back into filling its
   container, at the source's own 3:2 so cover crops nothing. */
@media (max-width: 768px) {
  .gallery-lead { aspect-ratio: 3 / 2; }
  .gallery-lead img { height: 100%; }
}

/* Spec list — replaces the six price-driver cards ------------------------
   Term left, explanation right, hairline between rows. Reads as reference
   material you scan for the row that applies to you. */
.spec-list {
  max-width: 1000px;
  margin: 0 auto;
  border-top: 1px solid var(--line);
}

/* Each row is a <details> emitted already open, so with JS off the desktop
   layout is exactly what it was. site.js closes them below 769px, where six
   full explanations ran to roughly four screens of solid text. */
.spec-row {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 2fr;
  gap: 1rem 2.5rem;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--line);
}

.spec-row summary {
  font-family: var(--font-display);
  font-size: 1.22rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
  display: flex;
  gap: 0.85rem;
  align-items: baseline;
  list-style: none;
  cursor: default;
}

.spec-row summary::-webkit-details-marker { display: none; }

.spec-num {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--accent);
  flex-shrink: 0;
}

.spec-body {
  color: var(--ink-soft);
  font-size: 0.95rem;
  line-height: 1.65;
}

/* Process steps and notes as collapsibles ---------------------------------
   Both are <details> now, matching the price list: open on desktop, where the
   layout is unchanged from the divs they replace, and collapsed to a tappable
   heading below 769px. The marker is suppressed everywhere; the chevron below
   is drawn on the summary instead. */
.process-step summary,
.note-row summary {
  list-style: none;
  cursor: default;
}

.process-step summary::-webkit-details-marker,
.note-row summary::-webkit-details-marker { display: none; }

/* Desktop: the summary is just a wrapper, so its children lay out exactly as
   the step-num / h3 siblings did before. */
.process-step summary { display: block; }

/* With the body in its own grid column, this row now has the price list's
   shape — term left, explanation right — so it takes the same proportions
   rather than sizing the title column to its longest heading. */
.note-row {
  grid-template-columns: minmax(15rem, 1fr) 2fr;
  gap: 1rem 2.5rem;
}

.note-row summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: baseline;
}

/* Note list — replaces the three "catches people out" cards --------------- */
.note-list {
  max-width: 860px;
  margin: 0 auto;
}

.note-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.4rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--line);
}

.note-row:first-child { border-top: 1px solid var(--line); }

.note-num {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--accent);
  line-height: 1;
  opacity: 0.55;
}

.note-body h3 {
  font-family: var(--font-display);
  font-size: 1.22rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
}

.note-body p {
  color: var(--ink-soft);
  font-size: 0.95rem;
  line-height: 1.65;
}

@media (max-width: 768px) {
  /* Local notes and quirks collapse the same way the price list does — and
     like it, in a single column. The shared grid still goes 2-up here, which
     put two narrow accordions side by side. */
  .process-grid { grid-template-columns: 1fr; gap: 0; }

  .process-step {
    border-left: none;
    border-top: 1px solid var(--navy-line);
  }

  .process-step:first-child { border-top: none; }
  .process-step::before { display: none; }

  .process-step,
  .note-row { padding: 0; }

  /* The two-column shape is a desktop thing — left here it kept the summary
     inside the left column, so the chevron sat against the title and an open
     body would land beside the heading instead of under it. */
  .note-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .process-step summary,
  .note-row summary {
    position: relative;
    cursor: pointer;
    padding: 0.95rem 2rem 0.95rem 0;
  }

  .process-step summary::after,
  .note-row summary::after {
    content: '';
    position: absolute;
    right: 0.35rem;
    top: 50%;
    width: 8px; height: 8px;
    border-right: 1.5px solid var(--accent);
    border-bottom: 1.5px solid var(--accent);
    transform: translateY(-70%) rotate(-45deg);
    transition: transform 0.2s ease;
  }

  .process-step[open] summary::after,
  .note-row[open] summary::after { transform: translateY(-30%) rotate(45deg); }

  .process-step h3,
  .note-row h3 { margin-bottom: 0; }

  .process-step .step-body,
  .note-row .note-body { padding: 0 0 1.05rem; }

  .process-step .step-body p { font-size: 0.88rem; }

  /* The rail node is anchored to the row top, which now sits on the summary. */
  .process-step::before { top: 1.15rem; }

  /* Collapsed on phones: heading row taps open one explanation at a time. */
  .spec-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0;
    border-bottom: 1px solid var(--line);
  }

  .spec-row summary {
    font-size: 1.06rem;
    padding: 0.95rem 2rem 0.95rem 0;
    position: relative;
    cursor: pointer;
    align-items: center;
  }

  /* Chevron, rotating to point down when the row is open. */
  .spec-row summary::after {
    content: '';
    position: absolute;
    right: 0.35rem;
    top: 50%;
    width: 8px; height: 8px;
    border-right: 1.5px solid var(--accent);
    border-bottom: 1.5px solid var(--accent);
    transform: translateY(-70%) rotate(-45deg);
    transition: transform 0.2s ease;
  }

  .spec-row[open] summary::after { transform: translateY(-30%) rotate(45deg); }

  .spec-row .spec-title { font-size: 1.06rem; }

  .spec-body {
    font-size: 0.9rem;
    padding-bottom: 1.05rem;
  }
  .note-row { gap: 1rem; padding: 1.25rem 0; }
  .note-num { font-size: 1.2rem; }
}

/* Trust bar --------------------------------------------------------------
   Was a 120deg gradient plus a 460px white radial hung off the top-left, which
   read as a smudge across the band rather than as lighting. Now the same flat
   --navy as the dark sections, so the band is clean and belongs to the family
   the palette pass established. */
.trust-bar { background: var(--navy); }
.trust-bar::before { display: none; }

/* Quote card ------------------------------------------------------------
   The card's own title sat at 1.3rem — a step above the field labels and
   below everything else on the screen, so the line that says what the card
   is for read as the quietest thing in it. It now carries the card. */
.hero-form-wrap {
  padding: 1.6rem 1.7rem;
  border-radius: 22px;
}

.hero-form-header {
  margin-bottom: 1rem;
  padding-bottom: 0.9rem;
}

.hero-form-header h3 {
  font-size: 2rem;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}

.hero-form-header p {
  font-size: 0.84rem;
  line-height: 1.45;
}

/* The card is the page's one conversion point, so it gets a little more
   separation from the warm wash behind it than a plain panel would. */
.hero-form-wrap {
  box-shadow:
    0 48px 90px -24px rgba(18, 38, 63, 0.26),
    0 2px 12px -4px rgba(18, 38, 63, 0.09);
}

@media (max-width: 1100px) {
  .hero-form-wrap { padding: 1.25rem 1.35rem; }
  .hero-form-header h3 { font-size: 1.6rem; }
  .hero-form-header p { font-size: 0.8rem; }
}

@media (max-width: 640px) {
  .hero-form-wrap { padding: 1.1rem 1.15rem; }
  .hero-form-header { margin-bottom: 0.75rem; padding-bottom: 0.6rem; }
  /* Kept visible here: at 1.4rem it still fits one line at 320px, and on a
     phone this heading is the first thing that explains the card. */
  .hero-form-header h3 { font-size: 1.4rem; }
}
</style>`;

function head({ title, description, canonical, schema, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NFW2KN72');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KDCJBPXX');</script>
<!-- End Google Tag Manager -->

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1413801450690954');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1413801450690954&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->

<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18314228447"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18314228447');
  gtag('config', 'G-B6XLJ853G1');
</script>

<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yhvkruedrd");
</script>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#1a1713" />
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE}/assets/images/trucks/truck-1.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<title>${esc(title)}</title>
<link rel="icon" type="image/png" href="/assets/images/48-state-movers-logo.png" />
<link rel="apple-touch-icon" href="/assets/images/48-state-movers-logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${extraHead}
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NFW2KN72"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KDCJBPXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

/* --------------------------------------------------------------- the page */

// Page titles, one per state — deliberately rotated across three phrasings
// ("state-to-state", "interstate", "out-of-state") so 49 pages don't compete
// with one identical pattern. Supplied by the client.
const SEO_TITLES = {
  "Alabama": "Alabama State-to-State Movers | Moving Anywhere in the USA",
  "Arizona": "Arizona Out-of-State Movers | Nationwide Moving Services",
  "Arkansas": "Arkansas State-to-State Moving | Moving Anywhere in the USA",
  "California": "California Interstate Movers | Nationwide Moving Services",
  "Colorado": "Colorado State-to-State Movers | Moving Anywhere in the USA",
  "Connecticut": "Connecticut Out-of-State Movers | Nationwide Moving",
  "Delaware": "Delaware Interstate Moving Services | Moving Anywhere in the USA",
  "Florida": "Florida State-to-State Movers | Nationwide Moving Services",
  "Georgia": "Georgia Out-of-State Movers | Moving Anywhere in the USA",
  "Idaho": "Idaho State-to-State Movers | Moving Anywhere in the USA",
  "Illinois": "Illinois Interstate Movers | Nationwide Moving Services",
  "Indiana": "Indiana Out-of-State Movers | Moving Anywhere in the USA",
  "Iowa": "Iowa State-to-State Movers | Nationwide Moving",
  "Kansas": "Kansas Interstate Moving Services | Moving Anywhere in the USA",
  "Kentucky": "Kentucky State-to-State Movers | Nationwide Moving Services",
  "Louisiana": "Louisiana Out-of-State Movers | Moving Anywhere in the USA",
  "Maine": "Maine Interstate Movers | Nationwide Moving",
  "Maryland": "Maryland State-to-State Movers | Moving Anywhere in the USA",
  "Massachusetts": "Massachusetts Out-of-State Movers | Nationwide Moving Services",
  "Michigan": "Michigan Interstate Movers | Moving Anywhere in the USA",
  "Minnesota": "Minnesota State-to-State Movers | Nationwide Moving",
  "Mississippi": "Mississippi Out-of-State Movers | Moving Anywhere in the USA",
  "Missouri": "Missouri Interstate Movers | Nationwide Moving Services",
  "Montana": "Montana State-to-State Movers | Moving Anywhere in the USA",
  "Nebraska": "Nebraska Out-of-State Movers | Nationwide Moving",
  "Nevada": "Nevada Interstate Movers | Moving Anywhere in the USA",
  "New Hampshire": "New Hampshire State-to-State Movers | Nationwide Moving Services",
  "New Jersey": "New Jersey Out-of-State Movers | Moving Anywhere in the USA",
  "New Mexico": "New Mexico Interstate Movers | Nationwide Moving",
  "New York": "New York State-to-State Movers | Moving Anywhere in the USA",
  "North Carolina": "North Carolina Interstate Movers | Nationwide Moving Services",
  "North Dakota": "North Dakota Out-of-State Movers | Moving Anywhere in the USA",
  "Ohio": "Ohio State-to-State Movers | Nationwide Moving",
  "Oklahoma": "Oklahoma Interstate Movers | Moving Anywhere in the USA",
  "Oregon": "Oregon Out-of-State Movers | Nationwide Moving Services",
  "Pennsylvania": "Pennsylvania State-to-State Movers | Moving Anywhere in the USA",
  "Rhode Island": "Rhode Island Interstate Movers | Nationwide Moving",
  "South Carolina": "South Carolina Out-of-State Movers | Moving Anywhere in the USA",
  "South Dakota": "South Dakota State-to-State Movers | Nationwide Moving Services",
  "Tennessee": "Tennessee Interstate Movers | Moving Anywhere in the USA",
  "Texas": "Texas State-to-State Movers | Nationwide Moving",
  "Utah": "Utah Out-of-State Movers | Moving Anywhere in the USA",
  "Vermont": "Vermont Interstate Movers | Nationwide Moving Services",
  "Virginia": "Virginia State-to-State Movers | Moving Anywhere in the USA",
  "Washington": "Washington Out-of-State Movers | Nationwide Moving",
  "West Virginia": "West Virginia Interstate Movers | Moving Anywhere in the USA",
  "Wisconsin": "Wisconsin State-to-State Movers | Nationwide Moving Services",
  "Wyoming": "Wyoming Out-of-State Movers | Moving Anywhere in the USA",
  "Washington D.C.": "Washington DC Interstate Movers | Nationwide Moving Services",
};

// The visible headline is the title's first half, with the state emphasised —
// so the page reads the same as the search result that brought the visitor.
function headline(s) {
  const title = SEO_TITLES[s.name];
  if (!title) return `Long-Distance Movers in <em>${esc(s.name)}</em>`;
  const lead = title.split(' | ')[0];
  for (const variant of [s.name, s.name.replace(/\./g, '')]) {
    if (lead.startsWith(variant + ' ')) {
      return `<em>${esc(variant)}</em>${esc(lead.slice(variant.length))}`;
    }
  }
  return esc(lead);
}

function statePage(s) {
  const routes = s.routes.map(abbr => {
    const dest = byAbbr[abbr];
    const miles = drivingMiles(s.hub, dest.hub);
    return { dest, miles, t: transit(miles) };
  }).sort((a, b) => a.miles - b.miles);

  const shortest = routes[0];
  const longest = routes[routes.length - 1];

  const neighbors = s.neighbors.map(a => byAbbr[a]);
  // The destinations we actually run to, then neighbours, then the rest of the
  // popular set — deduped. This is the page's main outbound link block.
  const routeDests = routes.map(r => r.dest);
  const seenLinks = new Set([s.abbr]);
  const nearbyLinks = [...routeDests, ...neighbors, ...POPULAR.map(a => byAbbr[a])]
    .filter(d => !seenLinks.has(d.abbr) && seenLinks.add(d.abbr));

  const canonical = `${SITE}${stateUrl(s)}`;
  const title = SEO_TITLES[s.name] || `Long-Distance Movers in ${s.name} | 50STATEMOVERS INC`;
  const topLanes = s.routes.slice(0, 2).map(a => byAbbr[a].name).join(' or ');
  const description = `Moving from ${s.name} to ${topLanes} — or any continental state. Binding fixed prices, our own crews, $1M coverage, no brokers. Free quote.`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MovingCompany',
        '@id': `${canonical}#business`,
        name: '50STATEMOVERS INC',
        url: canonical,
        telephone: '+1-888-505-1086',
        email: EMAIL,
        image: `${SITE}/assets/images/48-state-movers-logo.png`,
        description: `Long-distance moving company serving ${s.name}, including ${s.cities.slice(0, 6).join(', ')}.`,
        areaServed: {
          '@type': 'State', name: s.name,
          address: { '@type': 'PostalAddress', addressRegion: s.abbr, addressCountry: 'US' },
        },
        identifier: [
          { '@type': 'PropertyValue', name: 'USDOT', value: USDOT },
          { '@type': 'PropertyValue', name: 'MC', value: MC },
        ],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.96', reviewCount: '2400' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Long-distance moving routes from ${s.name}`,
          itemListElement: routes.map(r => ({
            '@type': 'Service',
            name: `Moving from ${s.name} to ${r.dest.name}`,
            serviceType: 'Long-distance household moving',
            provider: { '@id': `${canonical}#business` },
            areaServed: [
              { '@type': 'State', name: s.name },
              { '@type': 'State', name: r.dest.name },
            ],
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Moving companies by state', item: `${SITE}${HUB_URL}` },
          { '@type': 'ListItem', position: 3, name: `Moving from ${s.name}`, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: s.faqs.map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };


  // What drives the price, with this state's own lane range. No figures —
  // a number without a survey is a guess, and we don't publish one.
  const COST_ITEMS = [
    ['Distance and lane',
     `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>`,
     `Your route sets the floor. Our ${esc(s.name)} lanes run from about ${shortest.miles.toLocaleString()} miles to ${esc(shortest.dest.name)} out to roughly ${longest.miles.toLocaleString()} miles to ${esc(longest.dest.name)}. Sharing a trailer with other households costs less than a dedicated truck; a dedicated truck buys you a delivery date instead of a spread.`],
    ['Weight, not bedrooms',
     `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>`,
     pick('costWeight', s)],
    ['Access at both ends',
     `<svg viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H3V9.5Z"/><path d="M9 21v-8h6v8"/></svg>`,
     pick('costAccess', s)],
    ['How much packing you want',
     `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>`,
     pick('costPacking', s)],
    ['Storage between dates',
     `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
     pick('costStorage', s)],
    ['Valuation and protection',
     `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
     pick('costValuation', s)],
  ];

  // Trial: the price drivers are reference material, not parallel offerings —
  // six bordered cards made them the third identical grid on the page. A
  // numbered definition list reads the way this content is actually used
  // (scanned for the one that applies to you) and drops a card section.
  // Trial: "Weight, not bedrooms" is dropped here at the client's request. The
  // other 48 pages still carry it. Numbering is positional, so the rows
  // renumber themselves.
  const COSTS = TRIAL_STATES.has(s.name)
    ? COST_ITEMS.filter(function (c) { return c[0] !== 'Weight, not bedrooms'; })
    : COST_ITEMS;

  const costCards = TRIAL_STATES.has(s.name)
    ? `<div class="spec-list">
${COSTS.map(([title, , body], i) => `      <details class="spec-row js-collapse" open>
        <summary><span class="spec-num">${String(i + 1).padStart(2, '0')}</span><span class="spec-title">${title}</span></summary>
        <div class="spec-body">${body}</div>
      </details>`).join('\n')}
    </div>`
    : COSTS.map(([title, icon, body], i) => `    <div class="service-card">
      <div class="service-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="service-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n');

  // Local knowledge fills the homepage's dark process section.
  const LOCAL_STEPS = [
    ['Roads &amp; access', `${esc(s.logistics)} Main corridors: ${s.highways.map(esc).join(', ')}.`],
    ['Timing your move', esc(s.seasonal)],
    ['Who is moving, and why', esc(s.migration)],
    ['Licensing to check', `Interstate moves out of ${esc(s.name)} are federal: look for an active USDOT number and FMCSA authority. Ours are USDOT #${USDOT} and ${MC}. Movers operating only inside the state answer instead to ${esc(s.regulator)} — a registration that is not authority to take your belongings across the line.`],
  ];

  const localSteps = TRIAL_STATES.has(s.name)
    ? LOCAL_STEPS.map(([title, body], i) => `    <details class="process-step js-collapse" open>
      <summary>
        <span class="step-num">STEP ${String(i + 1).padStart(2, '0')}</span>
        <h3>${title}</h3>
      </summary>
      <div class="step-body"><p>${body}</p></div>
    </details>`).join('\n')
    : LOCAL_STEPS.map(([title, body], i) => `    <div class="process-step">
      <div class="step-num">STEP ${String(i + 1).padStart(2, '0')}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n');

  // The three state-specific gotchas fill one row of the services grid.
  // Trial: three warnings read better as a short stacked list than as a third
  // row of cards — see the note on costCards above.
  const quirkCards = TRIAL_STATES.has(s.name)
    ? `<div class="note-list">
${s.quirks.map((q, i) => `      <details class="note-row js-collapse" open>
        <summary>
          <span class="note-num">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(q.title)}</h3>
        </summary>
        <div class="note-body"><p>${esc(q.body)}</p></div>
      </details>`).join('\n')}
    </div>`
    : s.quirks.map((q, i) => `    <div class="service-card">
      <div class="service-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="service-icon"><svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg></div>
      <h3>${esc(q.title)}</h3>
      <p>${esc(q.body)}</p>
    </div>`).join('\n');

  // The state's largest municipalities from the Census list (data/top-cities.js),
  // largest first. Washington D.C. is a single city with no list, so it keeps
  // the hand-picked neighbourhoods in its state entry.
  const coverageCities = TOP_CITIES[s.slug] || s.cities;
  const cityItems = coverageCities.map(c =>
    `    <div class="state-item">${checkIcon}${esc(c)}</div>`).join('\n');

  const linkItems = arr => arr.map(d =>
    `    <a class="state-item" href="${stateUrl(d)}">${checkIcon}${esc(d.name)}</a>`).join('\n');

  const licensingFaq = {
    q: `Are moving companies in ${esc(s.name)} required to be licensed?`,
    a: [pick('licensingA', s), pick('licensingB', s)],
  };

  // Five states carry their own licensing question in the data, which produced
  // the same question twice on those pages. The generated one is the fuller
  // answer (carrier vs broker, binding vs estimate), so it wins.
  const faqItems = [
    ...s.faqs.filter(f => !/licens/i.test(f.q)).map(f => ({ q: esc(f.q), a: [esc(f.a)] })),
    licensingFaq,
  ];

  return `${head({ title, description, canonical, schema, extraHead: (TRIAL_STATES.has(s.name) ? TRIAL_HEAD : '') + JOB_HEAD + (STEP_FORM_STATES.has(s.name) ? STEP_FORM_HEAD : heroHead(s)) + STATS_HEAD + COVERAGE_HEAD + SERVICES_HEAD })}

${TRIAL_STATES.has(s.name) ? CRED_BAR + '\n' + TRIAL_NAV : NAV}

<!-- HERO -->
<header class="hero hero-photo">
  <div class="hero-content">
    <div class="hero-headline-wrap fade-in delay-1">
      <h1${headlineFit(s)}>${headline(s)}</h1>
    </div>
  </div>

${quoteFormSteps(s)}
</header>

${STEP_FORM_STATES.has(s.name) ? photoProof(s) : STATS_BAND}

${jobBand(s)}

<!-- COVERAGE -->
<section id="coverage" class="coverage-section">
  <div class="section-header">
    <div class="section-kicker">Coverage</div>
    <h2>${pick('coverageHead', s)}</h2>
    <p>${pick('coverageLede', s)}</p>
  </div>
${ROUTE_ANIM}

  <div class="states-grid" id="states-grid">
${cityItems}
  </div>
  ${coverageCities.length > 12 ? `<button class="states-toggle" id="states-toggle" aria-expanded="false" aria-controls="states-grid"><span>See all ${coverageCities.length} cities</span><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>` : ''}
</section>

<!-- SERVICES -->
${servicesSection(s.servicesIntro, TRIAL_STATES.has(s.name), s)}

<!-- COSTS -->
<section id="costs" class="coverage-section">
  ${TRIAL_STATES.has(s.name) ? `<div class="spec-hero">
    <img src="/assets/images/gallery/loading-ramp.jpg" alt="Two 50STATEMOVERS crew carrying a blanket-wrapped item up the ramp into a loaded truck, moving blankets and cartons stacked inside" loading="lazy" width="2000" height="1116" />
    <div class="spec-hero-inner">
      <div class="section-kicker">Pricing</div>
      <h2>${pick('costsHead', s)}</h2>
      <p>${pick('costsLede', s)}</p>
    </div>
  </div>
${costCards}` : `<div class="section-header">
    <div class="section-kicker">Pricing</div>
    <h2>${pick('costsHead', s)}</h2>
    <p>${pick('costsLede', s)}</p>
  </div>
  <div class="services">
${costCards}
  </div>`}
</section>

<!-- PROCESS -->
<section id="process" class="process-section">
  <div class="section-header">
    <div class="section-kicker">Local notes</div>
    <h2>${pick('processHead', s)}</h2>
    <p>${pick('processLede', s)}</p>
  </div>
  <div class="process-grid">
${localSteps}
  </div>
</section>

<!-- WHAT CATCHES PEOPLE OUT -->
<section id="local-notes">
  <div class="section-header">
    <div class="section-kicker">Good to know</div>
    <h2>${pick('quirksHead', s)}</h2>
    <p>${pick('quirksLede', s)}</p>
  </div>
  ${TRIAL_STATES.has(s.name) ? `${quirkCards}` : `<div class="services">
${quirkCards}
  </div>`}
</section>

<!-- GALLERY -->
${galleryFor(s)}

<!-- FAQ -->
${faqSection(`    <div class="section-kicker">FAQ</div>
    <h2>${pick('faqHead', s)}</h2>
    <p>${pick('faqLede', s)}</p>`, faqItems)}

<!-- NEARBY STATES -->
<section id="nearby">
  <div class="section-header">
    <div class="section-kicker">Where we go</div>
    <h2>${pick('nearbyHead', s)}</h2>
    <p>${pick('nearbyLede', s)}</p>
  </div>
  <div class="states-grid expanded">
${linkItems(nearbyLinks)}
  </div>
  <div class="section-cta">
    <a href="${HUB_URL}" class="nav-cta">${TRIAL_STATES.has(s.name) ? 'Show all 48 states' : `See all ${states.length} state moving guides`} →</a>
  </div>
</section>

${FOOTER}

<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------- the hub */

function hubPage() {
  const canonical = `${SITE}${HUB_URL}`;
  const title = 'Long-Distance Movers by State | 49 State Moving Guides';
  const description = 'Long-distance movers for every continental state and Washington DC. Real routes, transit times and local rules per state. Binding prices, no brokers.';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#page`,
        name: title, description, url: canonical,
        isPartOf: { '@type': 'WebSite', name: '50STATEMOVERS INC', url: `${SITE}/` },
      },
      {
        '@type': 'ItemList',
        name: 'Moving company guides by state',
        numberOfItems: states.length,
        itemListElement: states.map((s, i) => ({
          '@type': 'ListItem', position: i + 1,
          name: `Moving companies in ${s.name}`,
          url: `${SITE}${stateUrl(s)}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Moving companies by state', item: canonical },
        ],
      },
    ],
  };

  const allStates = states.map(s =>
    `    <a class="state-item" href="${stateUrl(s)}">${checkIcon}${esc(s.name)}</a>`).join('\n');

  const featured = HUB_FEATURED.map(a => byAbbr[a]).map((s, i) => `    <div class="service-card">
      <div class="service-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="service-icon"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
      <h3><a href="${stateUrl(s)}">Moving to ${esc(s.name)}</a></h3>
      <p>${esc(s.cities.slice(0, 4).join(', '))} and beyond. ${esc(s.migration.split('. ')[0])}.</p>
    </div>`).join('\n');

  const hubFaqs = [
    {
      q: 'Why does the state I&rsquo;m moving from matter?',
      a: [`Because most of what makes a move go wrong is local. A Boston move lives or dies on a street-occupancy permit and a September 1 booking; a Vermont move can be blocked outright by a mud-season weight posting; a Florida condo can hold up your date until the association approves it. Each of our ${states.length} state guides covers those specifics, along with real distances and transit windows for that state's busiest lanes.`],
    },
    {
      q: 'Do you serve every continental state?',
      a: [`Yes — all 48 continental states plus Washington DC. Our FMCSA operating authority covers interstate household moves nationwide, under USDOT #${USDOT} and ${MC}. Alaska and Hawaii are the two we don't currently serve.`],
    },
    {
      q: 'How far ahead should I book?',
      a: [`Call us whatever your timeline — we run last-minute long-distance moves every week, and we will tell you straight away whether your date works rather than leaving you guessing. If you are planning ahead: three weeks is comfortable outside peak season, and six to eight weeks for a June-through-August date. A few markets do sell out — Boston around September 1, Madison on August 15, Chicago on October 1 and May 1, Nashville and Bozeman all summer — so if your move falls on one of those, book earlier.`],
    },
    {
      q: 'What if my state isn&rsquo;t the one I&rsquo;m moving to?',
      a: [`Every lane runs both directions. Start with the state you're leaving for pickup logistics, permits, and timing, then follow the link to your destination state for arrival details — building rules, HOA approvals, and seasonal constraints on that end. Both pages are linked to each other throughout.`],
    },
  ];

  return `${head({ title, description, canonical, schema, extraHead: TRIAL_HEAD + HOME_HERO_HEAD + STATS_HEAD + COVERAGE_HEAD + SERVICES_HEAD })}

${CRED_BAR}
${TRIAL_HUB_NAV}

<!-- HERO -->
<header class="hero hero-photo">
  <div class="hero-content">
    <div class="hero-headline-wrap fade-in delay-1">
      <h1>Long-Distance Movers <em>By State</em></h1>
    </div>
  </div>

${quoteFormSteps(null)}
</header>

${STATS_BAND}

<!-- COVERAGE -->
<section id="coverage" class="coverage-section">
  <div class="section-header">
    <h2>All <em>${states.length}</em> state moving guides.</h2>
    <p>Every continental state plus Washington DC. Each page covers that state's real routes, timing, access constraints, and licensing — pick yours to see what your move actually involves.</p>
  </div>
  <div class="states-grid" id="states-grid">
${allStates}
  </div>
  <button class="states-toggle" id="states-toggle" aria-expanded="false" aria-controls="states-grid"><span>See all ${states.length} states</span><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>
</section>

<!-- POPULAR DESTINATIONS -->
<section id="routes">
  <div class="section-header">
    <h2>Most-requested <em>destinations.</em></h2>
    <p>Where the country is moving right now. Each guide covers arrival logistics, building and HOA rules, and how long the lane takes.</p>
  </div>
  <div class="services">
${featured}
  </div>
</section>

<!-- SERVICES -->
${servicesSection(`Whether you're relocating an apartment or a full office, we tailor the approach to what you're actually moving — and where it needs to go. Every service below is available in all ${states.length} states we cover.`, true)}

<!-- PROCESS -->
<section id="process" class="process-section">
  <div class="section-header">
    <div class="section-kicker">The process</div>
    <h2>How a move <em>actually</em> goes.</h2>
    <p>No surprises, no vague quotes that balloon on moving day. Here's the full shape of working with us.</p>
  </div>
  <div class="process-grid">
    <div class="process-step">
      <div class="step-num">STEP 01</div>
      <h3>Survey</h3>
      <p>A virtual or in-home walkthrough so we understand the full scope before quoting.</p>
    </div>
    <div class="process-step">
      <div class="step-num">STEP 02</div>
      <h3>Fixed Quote</h3>
      <p>A written estimate with every line itemized. What you see is what you pay.</p>
    </div>
    <div class="process-step">
      <div class="step-num">STEP 03</div>
      <h3>Move Day</h3>
      <p>Our crew arrives on schedule in uniform, with materials, protection mats, and a plan.</p>
    </div>
    <div class="process-step">
      <div class="step-num">STEP 04</div>
      <h3>Settle In</h3>
      <p>We don't leave until furniture is placed, beds are built, and you've signed off.</p>
    </div>
  </div>
</section>

<!-- GALLERY -->
${gallery()}

<!-- FAQ -->
${faqSection(`    <h2>Choosing a mover, <em>state by state.</em></h2>
    <p>How to use these guides, and what changes from one state to the next.</p>`, hubFaqs)}

${FOOTER}

<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ----------------------------------------------------------------- output */

function write(relPath, contents) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: HUB_URL, priority: '0.9', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

function sitemap() {
  const urls = [
    ...staticPages,
    ...states.map(s => ({ loc: stateUrl(s), priority: '0.8', changefreq: 'monthly' })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`;

for (const s of states) write(`moving-from-${s.slug}/index.html`, statePage(s));
write(`${HUB_URL.replace(/^\/|\/$/g, '')}/index.html`, hubPage());
write('sitemap.xml', sitemap());
write('robots.txt', robots);

console.log(`Generated ${states.length} state pages + hub, sitemap.xml, robots.txt`);
console.log(`Canonical origin: ${SITE}`);
