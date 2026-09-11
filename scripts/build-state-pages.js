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

// Canonical origin for the live site. Change here if the site moves to www.
const SITE = process.env.SITE_URL || 'https://50statemovers.com';
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
  <a href="/" class="logo" aria-label="50STATEMOVERS INC home">
    <img src="/assets/images/48-state-movers-logo-removebg-preview.png" alt="50STATEMOVERS INC" class="logo-img" />
    <span class="logo-name">50STATEMOVERS INC</span>
  </a>
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
      ${PHONE_DISPLAY}
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

const TRUST_BAR = `<div class="trust-bar">
  <div class="trust-item">
    <div class="trust-number serif">100%</div>
    <div class="trust-label">Fixed-Price Moves</div>
  </div>
  <div class="trust-item">
    <div class="trust-number serif">0.3%</div>
    <div class="trust-label">Damage claim rate</div>
  </div>
  <div class="trust-item">
    <div class="trust-number serif">24/7</div>
    <div class="trust-label">Customer support</div>
  </div>
</div>`;

// Hero video, route animation and the services closing line are lifted from
// index.html so the state pages and the homepage stay one design.
const HERO_VIDEO = `  <div class="hero-truck-img fade-in delay-3">
    <video
      id="hero-video"
      autoplay muted loop playsinline
      preload="metadata"
      poster="/assets/images/hero-poster.jpg"
      aria-label="50STATEMOVERS crew loading furniture onto the truck">
      <source src="/assets/video/Movers_loading_furniture_onto_truck_202609070457.mp4" type="video/mp4" />
      <img src="/assets/images/hero-poster.jpg" alt="50STATEMOVERS crew loading furniture onto the truck" />
    </video>
  </div>`;

const ROUTE_ANIM = `  <div class="route-anim">
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
  </div>`;

// The six service cards, verbatim from index.html — these describe the company,
// not the state, so the copy is deliberately identical everywhere.
const SERVICE_CARDS = [
  ['01', `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>`, 'Long Distance',
   `Cross-country and interstate relocations. We coordinate logistics, customs paperwork, and destination unpacking — all door to door.`],
  ['02', `<svg viewBox="0 0 24 24"><path d="M20 7 9 18l-5-5"/></svg>`, 'White Glove',
   `The top tier. Concierge-level service: we'll pack, transport, unpack, arrange, and even hang the art on the walls before we leave.`],
  ['03', `<svg viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H3V9.5Z"/><path d="M9 21v-8h6v8"/></svg>`, 'Residential',
   `From studio apartments to five-bedroom homes. We disassemble, transport, and reassemble — and we never leave before everything's in its place.`],
  ['04', `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>`, 'Commercial',
   `Office relocations handled after hours or over weekends, so your team is working from the new space on Monday morning — no downtime.`],
  ['05', `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>`, 'Packing &amp; Crating',
   `Museum-grade packing for art, antiques, and anything fragile. We build custom crates on site when off-the-shelf won't do.`],
  ['06', `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`, 'Storage',
   `Climate-controlled, 24-hour-monitored units in secure facilities. Short-term overflow or long-term, fully insured and inventoried throughout.`],
];

const SERVICE_ILLUS = {
  'Long Distance': 'svc-long-distance.png',
  'White Glove': 'svc-white-glove.png',
  'Residential': 'svc-residential.png',
  'Commercial': 'svc-commercial.png',
  'Packing &amp; Crating': 'svc-packing.png',
  'Storage': 'svc-storage.png',
};

// `illus` swaps the 54px line-icon tile for the commissioned illustrations.
// The tile is dropped rather than filled: it turns --accent on hover, which
// would swallow the terracotta the artwork is drawn in.
function servicesSection(intro, illus) {
  const cards = SERVICE_CARDS.map(([num, icon, title, body]) => {
    const art = illus && SERVICE_ILLUS[title]
      ? `      <div class="service-illus"><img src="/assets/images/gallery/${SERVICE_ILLUS[title]}" alt="" width="700" height="520" loading="lazy" decoding="async" /></div>`
      : `      <div class="service-icon">${icon}</div>`;
    return `    <div class="service-card">
      <div class="service-num">${num}</div>
${art}
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`;
  }).join('\n');
  return `<section id="services">
  <div class="section-header">
    <div class="section-kicker">What we do</div>
    <h2>Services built around <em>your</em> move.</h2>
    <p>${esc(intro)}</p>
  </div>
  <div class="services">
${cards}
  </div>
</section>`;
}

// Trial: an illustrated three-up summarising what the job actually involves.
// The artwork is flat vector in the site's own terracotta/ink, keyed to a
// transparent background — which is why this band sits on paper and never on
// one of the dark sections, where the near-black strokes disappear.
//
// Deliberately NOT folded into GALLERY: that section is photographs captioned
// "our work, up close", and illustrations sitting among crew photos read as a
// mistake rather than a change of pace.
function illustratedRow(s) {
  const items = [
    ['packing.png', 'Hand truck stacked with packed cartons',
     'Packed for the distance',
     `A box that survives a 2,000-mile ride is built differently from one that ` +
     `crosses town. We pack to the lane, not to the room count.`],
    ['routes.png', 'Map of the United States with a long-distance route marked',
     'Routed, not guessed',
     `Your ${esc(s.name)} load joins a scheduled lane rather than waiting for a ` +
     `truck to happen past. That is what fixes the transit window before you book.`],
    ['transport.png', 'Long-haul moving truck in 50STATEMOVERS livery',
     'Carried by our own crew',
     `The crew that loads your home is the crew that unloads it. No broker in ` +
     `the middle, no handoff to a carrier you have never spoken to.`],
  ];
  return `<section id="how-it-works" class="illus-band">
  <picture class="band-bg" aria-hidden="true">
    <source media="(max-width: 768px)" srcset="/assets/images/gallery/street-loading-mobile.jpg" width="1100" height="1970" />
    <img src="/assets/images/gallery/street-loading.jpg" alt="" loading="lazy" width="2200" height="1227" />
  </picture>
  <div class="section-header">
    <div class="section-kicker">At a glance</div>
    <h2>What a long-distance move <em>actually involves.</em></h2>
    <p>Three things decide whether a ${esc(s.name)} move lands well, and all three are settled before the truck arrives.</p>
  </div>
  <div class="services">
${items.map(([f, alt, h, p]) => `    <div class="service-card illus-card">
      <img class="illus" src="/assets/images/gallery/${f}" alt="${alt}" width="900" height="560" loading="lazy" decoding="async" />
      <h3>${h}</h3>
      <p>${p}</p>
    </div>`).join('\n')}
  </div>
</section>`;
}

const GALLERY = `<section id="gallery" class="gallery-section">
  <div class="section-header">
    <div class="section-kicker">Gallery</div>
    <h2>Our work, <em>up close.</em></h2>
    <p>A look at the homes, offices, and cross-country relocations we've handled across the country.</p>
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
    <div class="gallery-item">
      <img src="/assets/images/trucks/packing.jpeg" alt="Professional packing service" loading="lazy" />
      <div class="gallery-caption"><div class="label">Packing</div><div class="title">Packed right, every time</div></div>
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

function quoteForm(originState) {
  if (originState && FORM_TRIAL_STATES.has(originState.name)) return quoteFormV2(originState);
  return `  <div class="hero-form-col form-enter">
  <div class="hero-form-wrap" id="get-quote">
    <div class="hero-form-header">
      <h3>Get a free quote</h3>
      <p>Fixed price · no hidden fees · reply within same day</p>
    </div>
    <form class="quote-form" id="quote-form" novalidate>
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
      <div class="form-row form-row-2">
        <div>
          <label for="qf-size">Home size</label>
          <select id="qf-size">
            <option value="">Size…</option>
            <option>1 Bedroom</option>
            <option>2 Bedrooms</option>
            <option>3 Bedrooms</option>
            <option>4 Bedrooms</option>
            <option>5+ Bedrooms</option>
            <option>Studio</option>
            <option>Office / Commercial</option>
          </select>
        </div>
        <div>
          <label for="qf-date">Planned move date</label>
          <input type="date" id="qf-date" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div>
          <label for="qf-name">Your name</label>
          <input type="text" id="qf-name" placeholder="Jane Doe" />
          <div class="field-error" id="error-name" role="alert"></div>
        </div>
        <div>
          <label for="qf-email">Email address</label>
          <input type="email" id="qf-email" placeholder="jane@example.com" />
          <div class="field-error" id="error-email" role="alert"></div>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div>
          <label for="qf-phone">Phone number</label>
          <input type="tel" id="qf-phone" placeholder="555-000-0000" />
          <div class="field-error" id="error-phone" role="alert"></div>
        </div>
        <div>
          <label for="qf-notes">Special items<span class="lbl-tail"> or notes</span></label>
          <input type="text" id="qf-notes" placeholder="Piano, antiques…" />
        </div>
      </div>
      <div class="form-row-consent">
        <label class="sms-consent-label" for="qf-sms">
          <span class="sms-checkbox-wrap">
            <input type="checkbox" id="qf-sms" />
            <span class="sms-checkbox-box" aria-hidden="true"></span>
          </span>
          <span class="sms-consent-text">I agree to receive SMS messages from 50STATEMOVERS INC about my quote. Msg &amp; data rates may apply.<span class="sms-more" id="sms-more" hidden> Message frequency varies. Reply STOP to opt out at any time. See our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</span><button type="button" class="sms-toggle" id="sms-toggle" aria-expanded="false" aria-controls="sms-more">Read more</button></span>
        </label>
        <div class="sms-error" id="sms-error" role="alert"></div>
      </div>
      <button type="submit" class="form-submit">Request a free quote</button>
    </form>

    <ul class="form-assurances">
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Binding written estimate</li>
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Your details are never sold to brokers</li>
    </ul>
  </div>
  </div>`;
}


/* ------------------------------------------- design trial: the quote form
   Florida is the testbed for the hero form. The redesign below is scoped to
   this one page by FORM_TRIAL_HEAD, which only Florida's <head> gets, and by
   the .qf2 class on the card — the shared rules in styles.css and the shared
   handler in site.js are untouched. Widen by adding states to the set;
   retire by moving the rules into styles.css and deleting them from here. */
const FORM_TRIAL_STATES = new Set(['Florida']);

const qfLock = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const qfCheck = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Field icons. All one stroke weight on a 24 grid so they sit at the same
   optical size inside the controls, and all aria-hidden — every one of them
   repeats a label that is already there. */
const ico = (paths) =>
  `<svg class="qf2-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const icoPin = ico(`<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>`);
const icoFlag = ico(`<path d="M6 21V4"/><path d="M6 4.5h10.5l-2 3.5 2 3.5H6"/>`);
const icoHome = ico(`<path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"/><path d="M9.5 20.5v-6h5v6"/>`);
const icoCal = ico(`<rect x="3.75" y="5.5" width="16.5" height="14.5" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M3.75 10.5h16.5"/>`);
const icoBox = ico(`<path d="M3.75 8.2 12 4l8.25 4.2v7.6L12 20l-8.25-4.2V8.2Z"/><path d="m3.75 8.2 8.25 4.2 8.25-4.2M12 12.4V20"/>`);
const icoUser = ico(`<circle cx="12" cy="8.5" r="3.75"/><path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0"/>`);
const icoMail = ico(`<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>`);
const icoPhone = ico(`<path d="M7.5 3.75h3l1.5 4-2 1.5a10.5 10.5 0 0 0 4.75 4.75l1.5-2 4 1.5v3a1.75 1.75 0 0 1-1.9 1.75C10.9 19.6 4.4 13.1 3.75 5.65A1.75 1.75 0 0 1 5.5 3.75Z"/>`);

/* Three steps rather than one wall of eight fields. On a phone that is the
   whole point: two paired rows fit above the fold at a real tap size, where
   the old card's four paired rows were squeezed until the labels had to be
   clipped with an ellipsis. The placeholders are the short form ("State…",
   not "Select state…") so that a half-width control on a 393px screen still
   shows its whole placeholder — the label above it already says which. */
function quoteFormV2(originState) {
  const origin = originState && originState.name;
  return `  <div class="hero-form-col qf2-col">
  <div class="hero-form-wrap qf2" id="get-quote">
    <div class="qf2-head">
      <h3>Get a free quote</h3>
      <p class="qf2-sub">Three quick steps</p>
    </div>

    <ol class="qf2-steps" id="qf2-steps" aria-hidden="true">
      <li class="is-current" data-step="1"><span class="qf2-dot">1</span><span class="qf2-step-label">Route</span></li>
      <li data-step="2"><span class="qf2-dot">2</span><span class="qf2-step-label">Details</span></li>
      <li data-step="3"><span class="qf2-dot">3</span><span class="qf2-step-label">Contact</span></li>
    </ol>
    <div class="qf2-track" aria-hidden="true"><span id="qf2-fill"></span></div>

    <form class="quote-form" id="quote-form" novalidate>
      <fieldset class="qf2-panel is-active" data-panel="1">
        <legend class="qf2-legend">Where are you moving?</legend>
        <div class="form-row qf2-pair">
          <div class="qf2-field">
            <label for="qf-from">Moving from</label>
            <div class="qf2-control">${icoPin}<select id="qf-from"><option value="">State…</option>${stateOptions(origin)}</select></div>
            <div class="field-error" id="error-from" role="alert"></div>
          </div>
          <div class="qf2-arrow" aria-hidden="true">→</div>
          <div class="qf2-field">
            <label for="qf-to">Moving to</label>
            <div class="qf2-control">${icoFlag}<select id="qf-to"><option value="">State…</option>${stateOptions(null)}</select></div>
            <div class="field-error" id="error-to" role="alert"></div>
          </div>
        </div>
        <div class="form-row">
          <div class="qf2-field">
            <label for="qf-size">Home size</label>
            <div class="qf2-control">${icoHome}<select id="qf-size">
              <option value="">Select size…</option>
              <option>Studio</option>
              <option>1 Bedroom</option>
              <option>2 Bedrooms</option>
              <option>3 Bedrooms</option>
              <option>4 Bedrooms</option>
              <option>5+ Bedrooms</option>
              <option>Office / Commercial</option>
            </select></div>
          </div>
        </div>
      </fieldset>

      <fieldset class="qf2-panel" data-panel="2">
        <legend class="qf2-legend">When, and anything special?</legend>
        <div class="form-row qf2-two">
          <div class="qf2-field">
            <label for="qf-date">Move date</label>
            <div class="qf2-control">${icoCal}<input type="date" id="qf-date" /></div>
          </div>
          <div class="qf2-field">
            <label for="qf-notes">Special items</label>
            <div class="qf2-control">${icoBox}<input type="text" id="qf-notes" placeholder="Piano, stairs" /></div>
          </div>
        </div>
        <p class="qf2-hint">Date not fixed yet? Give us your best guess — it only changes the price if the season does.</p>
      </fieldset>

      <fieldset class="qf2-panel" data-panel="3">
        <legend class="qf2-legend">Where should we send the quote?</legend>
        <div class="form-row qf2-two">
          <div class="qf2-field">
            <label for="qf-name">Your name</label>
            <div class="qf2-control">${icoUser}<input type="text" id="qf-name" placeholder="Jane Doe" autocomplete="name" /></div>
            <div class="field-error" id="error-name" role="alert"></div>
          </div>
          <div class="qf2-field">
            <label for="qf-phone">Phone number</label>
            <div class="qf2-control">${icoPhone}<input type="tel" id="qf-phone" placeholder="(555) 000-0000" autocomplete="tel" /></div>
            <div class="field-error" id="error-phone" role="alert"></div>
          </div>
        </div>
        <div class="form-row">
          <div class="qf2-field">
            <!-- Full width even on a phone: an address is the one value here
                 long enough that a half-width box would scroll while typing. -->
            <label for="qf-email">Email address</label>
            <div class="qf2-control">${icoMail}<input type="email" id="qf-email" placeholder="jane@example.com" autocomplete="email" /></div>
            <div class="field-error" id="error-email" role="alert"></div>
          </div>
        </div>
        <div class="form-row-consent">
          <label class="sms-consent-label" for="qf-sms">
            <span class="sms-checkbox-wrap">
              <input type="checkbox" id="qf-sms" />
              <span class="sms-checkbox-box" aria-hidden="true"></span>
            </span>
            <span class="sms-consent-text">I agree to receive SMS messages from 50STATEMOVERS INC about my quote. Msg &amp; data rates may apply.<span class="sms-more" id="sms-more" hidden> Message frequency varies. Reply STOP to opt out at any time. See our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</span><button type="button" class="sms-toggle" id="sms-toggle" aria-expanded="false" aria-controls="sms-more">Read more</button></span>
          </label>
          <div class="sms-error" id="sms-error" role="alert"></div>
        </div>
      </fieldset>

      <div class="qf2-actions">
        <button type="button" class="qf2-back" id="qf2-back" hidden>← Back</button>
        <button type="button" class="form-submit qf2-next" id="qf2-next">Continue</button>
        <button type="submit" class="form-submit qf2-send" hidden>Request my free quote</button>
      </div>
    </form>

    <ul class="form-assurances qf2-assurances">
      <li>${qfCheck}Binding written estimate</li>
      <li>${qfLock}Never sold to brokers</li>
    </ul>
  </div>
  </div>`;
}


// Footer is identical to index.html except the Company column, which points at
// the state hub rather than a same-page anchor.
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
        <li><a href="mailto:careers@50statemovers.com">Careers</a></li>
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

const TRIAL_NAV = NAV.replace(
  /<li><a href="#services">[\s\S]*?<a href="#faq">FAQ<\/a><\/li>/g,
  TRIAL_NAV_LINKS);

/* ---------------------------------------- design trial: New York, Florida */
// New York is the testbed. A visual change lands here first — scoped to these
// pages by the <style> block below, which only their <head> gets — and is
// promoted into styles.css for all 49 states once it holds up. Widen the trial
// by adding states to the set; retire it by moving the rules into styles.css
// and deleting them from here.
//
// Florida is also FORM_TRIAL_STATES — the quote-form redesign. The two are
// independent: statePage() composes both heads and quoteForm() picks the V2
// form, so Florida carries the redesign and the new form together.
const TRIAL_STATES = new Set(['New York', 'Florida']);

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

/* Contact strip phone -----------------------------------------------------
   It was --accent, which put the page's only two "call" buttons in different
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

/* Contact strip email -----------------------------------------------------
   Given the palette's blue rather than a filled pill: calling should lead, and
   two solid buttons side by side read as equal choices. Kept as an outline so
   it stays second, but tinted so it is a colour rather than plain white — blue
   is already this page's third voice, in the trust bar and behind the gallery,
   and it avoids borrowing the terracotta that means "get a quote". */
.cs-email {
  background: rgba(70, 104, 143, 0.22);
  border-color: rgba(143, 176, 212, 0.45);
  color: #cfe0f2;
}

.cs-email:hover {
  background: rgba(70, 104, 143, 0.38);
  border-color: rgba(178, 205, 233, 0.75);
  color: #eaf2fa;
}

/* Headline on one line ----------------------------------------------------
   "Movers" was dropping to a second line. Sized to fit rather than guessed at:
   the string measures 14.624em wide in Inter 600 at this tracking, and the
   column it sits in is a steady 0.446 x viewport above 768px and viewport
   minus 40px below, where the hero goes single-column. That puts the ceiling
   at 3.04vw and 5.98vw respectively; both are set just under.

   Note this is measured for "New York State-to-State Movers" specifically. A
   longer state name — Massachusetts, North Carolina — needs its own number, so
   this cannot be promoted to the other 48 as-is. */
.hero h1 { white-space: nowrap; }

@media (min-width: 769px) {
  .hero h1 { font-size: min(3vw, 2.7rem); }
}

@media (max-width: 768px) {
  /* The state name takes 1.35em. That pushes the string from 14.624em to
     16.149em, so the base drops to keep it on one line — "New York" still ends
     up about a fifth larger than it was, and the rest a little smaller.
     Phone only: at this ratio the desktop column cannot hold one line. */
  .hero h1 { font-size: min(5.2vw, 2.15rem); }
  .hero h1 em { font-size: 1.35em; }
}

/* Footer phones -----------------------------------------------------------
   Green is the site's "call" colour — the nav phone button and the sticky call
   button both use it — so the two numbers in the footer take it rather than
   sitting in the same muted blue as every other link in the column. Lightened
   from --green, which is tuned for white-on-green buttons and goes muddy as
   text on the dark footer. */
.footer-col a[href^="tel:"] {
  display: inline-flex;
  align-items: center;
  color: #6fce9b;
  font-weight: 500;
  background: rgba(111, 206, 155, 0.11);
  border: 1px solid rgba(111, 206, 155, 0.28);
  border-radius: 999px;
  padding: 0.32rem 0.8rem;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.footer-col a[href^="tel:"]:hover {
  color: #b6ebcd;
  background: rgba(111, 206, 155, 0.2);
  border-color: rgba(111, 206, 155, 0.5);
}

/* The pills are taller than the plain links they sit among, so the rows in
   this column need a little more room. */
.footer-col li:has(a[href^="tel:"]) { margin-bottom: 0.35rem; }

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

const FORM_TRIAL_HEAD = `<style>
/* Hero quote form, v2 — Florida only ---------------------------------------
   Everything here hangs off .qf2, so the shared .hero-form-wrap rules in
   styles.css still describe every other state's card. Three things changed:
   the eight fields are split across three steps, every field is a boxed
   control at a real tap size instead of a hairline underline, and the card
   leads with the credential it is actually asking the visitor to trust. */

.qf2-col { max-width: 500px; }

.qf2 {
  padding: 0;
  overflow: hidden;
  border-radius: 22px;
  border-color: #c9bda6;
  /* A touch more lift than the shared card: on this page it is the only
     thing in its column, so it carries the whole right side. */
  box-shadow: 0 32px 64px -24px rgba(18, 38, 63, 0.3), 0 4px 14px -6px rgba(18, 38, 63, 0.12);
}

/* Header ------------------------------------------------------------------ */
.qf2-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.35rem 1.5rem 1.1rem;
  background: linear-gradient(168deg, #14293f 0%, #0c1a2b 100%);
  color: var(--paper);
  position: relative;
}
/* The accent belongs to the button; a hairline of it at the top ties the two
   ends of the card together without another block of orange. */
.qf2-head::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), #e0894f 55%, transparent);
}


.qf2 .qf2-head h3 {
  /* Inter rather than the display serif: the card is a control surface, and
     it reads as one when its title is set in the same face as its labels. */
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1.45rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--paper);
}
.qf2-sub {
  flex-shrink: 0;
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--navy-text);
  line-height: 1.45;
}

/* Step rail --------------------------------------------------------------- */
.qf2-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  list-style: none;
  margin: 0;
  padding: 0.8rem 1.5rem 0;
  background: var(--paper);
}
.qf2-steps li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  position: relative;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.3s;
}
/* A single track under the rail rather than a rule between each pair of
   dots: a connector long enough to reach the next dot has to pass through
   the label in between, which read as a strikethrough. */
.qf2-track {
  height: 3px;
  margin: 0.6rem 1.5rem 0;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;
}
.qf2-track span {
  display: block;
  width: 33.33%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), #e0894f);
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.qf2-dot {
  width: 24px; height: 24px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--line);
  background: var(--paper);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--muted);
  position: relative;
  z-index: 1;
  transition: border-color 0.3s, background 0.3s, color 0.3s;
}
.qf2-steps li.is-current { color: var(--ink); }
.qf2-steps li.is-current .qf2-dot {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 0 4px rgba(200, 85, 44, 0.12);
}
.qf2-steps li.is-done { color: var(--ink-soft); }
.qf2-steps li.is-done .qf2-dot {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--paper);
  font-size: 0;
}
.qf2-steps li.is-done .qf2-dot::after {
  content: '✓';
  font-size: 12px;
  line-height: 1;
}

/* Panels ------------------------------------------------------------------ */
.qf2 .quote-form { padding: 1rem 1.5rem 1.35rem; }

.qf2-panel {
  border: 0;
  padding: 0;
  margin: 0;
  display: none;
}
.qf2-panel.is-active { display: block; animation: qf2In 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes qf2In {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: none; }
}

.qf2-legend {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.02rem;
  letter-spacing: -0.01em;
  color: var(--ink);
  padding: 0;
  margin-bottom: 0.75rem;
}

.qf2 .form-row { margin-bottom: 0.8rem; }
.qf2 .form-row:last-child { margin-bottom: 0; }

/* The route pair keeps its arrow on desktop; on a phone it stacks and the
   arrow turns down, which reads as a route rather than as two loose menus. */
.qf2-pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 0.6rem;
}
.qf2-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  align-items: start;
}

.qf2-arrow {
  padding-bottom: 0.85rem;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1;
}

.qf2 .qf2-field > label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
  /* No clipping: every field is full width or half of a two-up, and the
     labels are short enough to fit at this size. */
  white-space: normal;
  overflow: visible;
}

/* Boxed controls everywhere, not just on touch. A filled field says "this is
   where you type" at a glance, and 46px is a real target with a mouse too. */
/* The icon sits inside the control rather than beside the label, so a
   half-width field spends none of its width on it. */
.qf2-control { position: relative; display: block; }
.qf2-ico {
  position: absolute;
  left: 0.72rem;
  top: 50%;
  transform: translateY(-50%);
  width: 17px; height: 17px;
  color: var(--muted);
  pointer-events: none;
  /* The date input is position:relative so its picker overlay can stretch;
     without this the input paints over the icon that precedes it. */
  z-index: 2;
  transition: color 0.2s;
}
.qf2-control:focus-within .qf2-ico { color: var(--accent); }

.qf2 .form-row input,
.qf2 .form-row select {
  width: 100%;
  min-height: 46px;
  padding: 0.55rem 0.8rem 0.55rem 2.45rem;
  background: #fbf8f2;
  border: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--ink);
  box-shadow: none;
  text-overflow: ellipsis;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.qf2 .form-row select { background-position: right 0.7rem center; padding-right: 1.85rem; }
.qf2 .form-row input:hover,
.qf2 .form-row select:hover { border-color: var(--muted); border-bottom-color: var(--muted); }
.qf2 .form-row input:focus,
.qf2 .form-row select:focus {
  border-color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--paper);
  box-shadow: 0 0 0 3px rgba(200, 85, 44, 0.14);
}
.qf2 .form-row > div:focus-within > label,
.qf2 .form-row:focus-within > label { color: var(--ink-soft); }
/* Safari renders an empty date input as a faint stub; keep it at the same
   ink as the rest so the field does not look disabled. */
.qf2 input[type="date"] { color: var(--ink); position: relative; }
.qf2 input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  margin: 0; padding: 0;
  opacity: 0;
  cursor: pointer;
}

.qf2-hint {
  margin-top: 0.3rem;
  font-size: 0.72rem;
  color: var(--muted);
  line-height: 1.4;
}

.qf2 .field-error { font-size: 0.74rem; margin-top: 0.25rem; }

.qf2 .form-row-consent { margin-top: 0.85rem; margin-bottom: 0; }
.qf2 .sms-consent-text { font-size: 0.7rem; }

/* Actions ----------------------------------------------------------------- */
.qf2-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.1rem;
}
.qf2 .form-submit { margin-top: 0; flex: 1; }
.qf2-back {
  flex: 0 0 auto;
  border: 1px solid var(--line);
  background: transparent;
  border-radius: 999px;
  min-height: 50px;
  padding: 0 1.05rem;
  font-family: var(--font-body);
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.qf2-back:hover { border-color: var(--muted); background: var(--paper-warm); }
/* "Continue" is not the submit, so it does not get the arrow the shared
   .form-submit adds — that arrow is reserved for the action that sends. */
.qf2-next::after { content: ''; }
.qf2-next { letter-spacing: 0.01em; }
/* .form-submit is display:flex, which outranks the UA sheet's [hidden]
   rule — without this the Send button shows on every step. */
.qf2 [hidden] { display: none !important; }

/* Assurances -------------------------------------------------------------- */
.qf2-assurances {
  margin: 0;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--line);
  background: var(--paper-warm);
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem 0.9rem;
}
.qf2-assurances li { font-size: 0.72rem; align-items: center; color: var(--ink-soft); }
.qf2-assurances svg {
  width: 14px; height: 14px;
  margin-top: 0;
  stroke: var(--green-deep);
  stroke-width: 2;
}

/* The success panel replaces the form's innards, so it needs the padding the
   form was carrying. */
.qf2 .form-success { padding: 1.75rem 1.5rem; }

/* Entrance: the shared .form-enter staggers .quote-form > div, which the
   stepped form no longer has. One move for the whole card instead. */
.qf2-col { animation: qf2CardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both; }
@keyframes qf2CardIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .qf2-col, .qf2-panel.is-active { animation: none; }
}

/* Phones ------------------------------------------------------------------ */
@media (max-width: 768px) {
  .qf2 { border-radius: 18px; padding: 0; }
  .qf2-head { padding: 1rem 0.9rem 0.85rem; }
  .qf2 .qf2-head h3 { font-size: 1.45rem; }
  /* Stays on a phone: the old card dropped its subline to buy vertical
     space, and two words on the title's own line cost none. */
  .qf2-sub { font-size: 0.64rem; }

  .qf2-steps { padding: 0.7rem 0.9rem 0; }
  .qf2-track { margin: 0.5rem 0.9rem 0; }
  .qf2-steps li { font-size: 0.62rem; gap: 0.35rem; letter-spacing: 0.03em; }
  .qf2-dot { width: 22px; height: 22px; font-size: 0.68rem; }

  .qf2 .quote-form { padding: 0.9rem 0.9rem 1rem; }
  .qf2-legend { font-size: 0.95rem; margin-bottom: 0.6rem; }
  .qf2 .form-row { margin-bottom: 0.7rem; }

  /* Pairs stay side by side. What made the old card unreadable was not the
     pairing itself but the 14-character placeholders inside half-width
     boxes; these say "State…", and the icon carries the rest. */
  .qf2-two { gap: 0.5rem; }
  .qf2-pair { gap: 0.35rem; }
  .qf2-arrow { padding-bottom: 0.9rem; font-size: 0.82rem; }

  .qf2 .qf2-field > label { font-size: 0.72rem; margin-bottom: 0.25rem; white-space: normal; overflow: visible; text-overflow: clip; }
  /* 16px or iOS zooms the page on focus and the card ends up half off-screen —
     which is the cropping the old form was showing. */
  .qf2 .form-row input,
  .qf2 .form-row select { font-size: 1rem; min-height: 48px; padding: 0.6rem 0.6rem 0.6rem 2.1rem; border-radius: 10px; }
  .qf2 .form-row select { background-position: right 0.5rem center; padding-right: 1.5rem; }
  .qf2-ico { left: 0.6rem; width: 15px; height: 15px; }

  .qf2-actions { margin-top: 0.9rem; gap: 0.5rem; }
  .qf2 .form-submit { min-height: 50px; font-size: 0.92rem; padding: 0.7rem 1rem; }
  .qf2-back { min-height: 50px; padding: 0 0.9rem; font-size: 0.82rem; }

  .qf2-assurances { padding: 0.65rem 0.9rem; gap: 0.35rem 0.6rem; }
  .qf2-assurances li { font-size: 0.66rem; }
  .qf2-assurances svg { width: 12px; height: 12px; }
}

@media (max-width: 380px) {
  /* The rail's labels are the first thing to go when the dots stop fitting;
     the numbers still say where you are. */
  .qf2-step-label { display: none; }
  .qf2-steps { display: flex; gap: 0.5rem; align-items: center; }
  .qf2-steps li { flex: 1; }
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

<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18314228447"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18314228447');
  gtag('config', 'G-B6XLJ853G1');
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
     `Long-distance moves price on what your household actually weighs, not how many rooms it occupies. Two three-bedroom homes can differ by thousands of pounds. This is why we survey by video or in person before quoting rather than guessing from a bedroom count over the phone.`],
    ['Access at both ends',
     `<svg viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H3V9.5Z"/><path d="M9 21v-8h6v8"/></svg>`,
     `Whether a trailer can reach your door changes the job. Long carries, stairs, freight elevator reservations, street permits, and shuttle service where a tractor-trailer physically cannot fit are all real work — we check them at survey so they land in the quote instead of on move day.`],
    ['How much packing you want',
     `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>`,
     `Full packing is what most long-distance customers choose, and it is the single biggest factor in whether a load arrives intact — a professionally packed box is built for a 2,000-mile ride, not a car trip. Most land somewhere between, having us handle the kitchen, art, and anything fragile. Custom crating for art, antiques, and oversized items is quoted separately.`],
    ['Storage between dates',
     `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
     `Move-out and move-in dates rarely line up. Storage-in-transit holds your inventoried goods until your date, and we quote that cost up front rather than letting it accrue quietly. Climate control is worth it for wood, leather, and electronics.`],
    ['Valuation and protection',
     `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
     `Every interstate move includes the federally required minimum released-value protection at no extra charge. Full Value Protection — repair, replacement, or a cash settlement at current market value — costs more and is worth considering for a high-value inventory.`],
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

  const cityItems = s.cities.map(c =>
    `    <div class="state-item">${checkIcon}${esc(c)}</div>`).join('\n');

  const linkItems = arr => arr.map(d =>
    `    <a class="state-item" href="${stateUrl(d)}">${checkIcon}${esc(d.name)}</a>`).join('\n');

  const licensingFaq = {
    q: `Are moving companies in ${esc(s.name)} required to be licensed?`,
    a: [
      `Yes, and there are two separate authorities. Any company moving household goods across a state line must hold an active USDOT number and interstate operating authority from the FMCSA — ours are <strong>USDOT #${USDOT}</strong> and <strong>${MC}</strong>, and you can verify both on the FMCSA's public SAFER database before paying a deposit.`,
      `Companies that move households only within ${esc(s.name)} answer to ${esc(s.regulator)}. That distinction matters: an intrastate-only registration is not authority to take your belongings out of ${esc(s.name)}, and it is the most common gap we see when customers forward us a competitor's paperwork. Two other things worth checking on any quote — whether the price is binding or an estimate that can be revised at delivery, and whether the company is a carrier that owns trucks or a broker reselling your move. We are a carrier, we quote binding fixed prices, and we put our own crew and truck on the job.`,
    ],
  };

  // Five states carry their own licensing question in the data, which produced
  // the same question twice on those pages. The generated one is the fuller
  // answer (carrier vs broker, binding vs estimate), so it wins.
  const faqItems = [
    ...s.faqs.filter(f => !/licens/i.test(f.q)).map(f => ({ q: esc(f.q), a: [esc(f.a)] })),
    licensingFaq,
  ];

  return `${head({ title, description, canonical, schema, extraHead: (TRIAL_STATES.has(s.name) ? TRIAL_HEAD : '') + (FORM_TRIAL_STATES.has(s.name) ? FORM_TRIAL_HEAD : '') })}

${TRIAL_STATES.has(s.name) ? CRED_BAR + '\n' + TRIAL_NAV : NAV}

<!-- HERO -->
<header class="hero">
  <div class="hero-content">
    <div class="hero-headline-wrap fade-in delay-1">
      <h1>${headline(s)}</h1>
    </div>
  </div>

  <div class="hero-lede">
    <p class="fade-in delay-2">
      ${esc(s.intro)}
    </p>

    <div class="hero-trust fade-in delay-3">
      <div class="ht-item"><span class="ht-dot" aria-hidden="true"></span><span>Booking moves this week</span></div>
      <span class="ht-divider" aria-hidden="true"></span>
      <div class="ht-item">
        <svg class="ht-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>${s.cities.length}+</strong> ${esc(s.name)} cities</span>
      </div>
    </div>
  </div>

${HERO_VIDEO}

  <div class="hero-stat-cards fade-in delay-3">
    <div class="hero-card hc-light float">
      <div class="hc-label">${esc(s.name)} cities served</div>
      <div class="hc-val serif">${s.cities.length}+</div>
      <div class="hc-sub">${esc(s.cities.slice(0, 3).join(' · '))} and more</div>
    </div>
    <div class="hero-card hc-dark float delay-a">
      <div class="hc-label">Busiest ${esc(s.abbr)} lane</div>
      <div class="hc-val serif">${esc(s.abbr)} → ${esc(longest.dest.abbr)}</div>
      <div class="hc-sub">${esc(s.name)} to ${esc(longest.dest.name)} · ~${longest.miles.toLocaleString()} mi</div>
    </div>
    <div class="hero-card hc-accent float delay-b">
      <div class="hc-label">Free quotes</div>
      <div class="hc-val serif">Same day</div>
      <div class="hc-sub">No obligation, no hidden fees</div>
    </div>
    <div class="hero-card hc-light float delay-c">
      <div class="hc-label">Protection</div>
      <div class="hc-val serif">$1M</div>
      <div class="hc-sub">Licensed, bonded &amp; insured</div>
    </div>
  </div>

${quoteForm(s)}
</header>

${TRUST_BAR}
${TRIAL_STATES.has(s.name) ? `\n${illustratedRow(s)}\n` : ''}
<!-- COVERAGE -->
<section id="coverage" class="coverage-section">
  <div class="section-header">
    <div class="section-kicker">Coverage</div>
    <h2>Cities we serve across <em>${esc(s.name)}.</em></h2>
    <p>We pick up throughout the state, not just the metros. If your town isn't listed, it's almost certainly still on a route we run — call ${PHONE_DISPLAY} and we'll confirm access before quoting.</p>
  </div>
${ROUTE_ANIM}

  <div class="states-grid" id="states-grid">
${cityItems}
  </div>
  <button class="states-toggle" id="states-toggle" aria-expanded="false">Show all ${s.cities.length} cities ↓</button>
</section>

<!-- SERVICES -->
${servicesSection(s.servicesIntro, TRIAL_STATES.has(s.name))}

<!-- COSTS -->
<section id="costs" class="coverage-section">
  ${TRIAL_STATES.has(s.name) ? `<div class="spec-hero">
    <img src="/assets/images/gallery/loading-ramp.jpg" alt="Two 50STATEMOVERS crew carrying a blanket-wrapped item up the ramp into a loaded truck, moving blankets and cartons stacked inside" loading="lazy" width="2000" height="1116" />
    <div class="spec-hero-inner">
      <div class="section-kicker">Pricing</div>
      <h2>What shapes the price of ${a(s)} <em>${esc(s.name)}</em> move.</h2>
      <p>We don't publish a price list, because a number without a survey is a guess — and a guess is exactly what turns into a bigger bill on delivery day. Here's what actually moves the figure on ${a(s)} ${esc(s.name)} move. Every one of these is itemized in your written quote before you sign, and the price we agree is the price you pay.</p>
    </div>
  </div>
${costCards}` : `<div class="section-header">
    <div class="section-kicker">Pricing</div>
    <h2>What shapes the price of ${a(s)} <em>${esc(s.name)}</em> move.</h2>
    <p>We don't publish a price list, because a number without a survey is a guess — and a guess is exactly what turns into a bigger bill on delivery day. Here's what actually moves the figure on ${a(s)} ${esc(s.name)} move. Every one of these is itemized in your written quote before you sign, and the price we agree is the price you pay.</p>
  </div>
  <div class="services">
${costCards}
  </div>`}
</section>

<!-- PROCESS -->
<section id="process" class="process-section">
  <div class="section-header">
    <div class="section-kicker">Local notes</div>
    <h2>Moving from ${esc(s.name)}: what's <em>actually different.</em></h2>
    <p>Every state has its own access problems, weather windows, and rules. Here's what shapes ${a(s)} ${esc(s.name)} move in practice.</p>
  </div>
  <div class="process-grid">
${localSteps}
  </div>
</section>

<!-- WHAT CATCHES PEOPLE OUT -->
<section id="local-notes">
  <div class="section-header">
    <div class="section-kicker">Good to know</div>
    <h2>What catches people out in <em>${esc(s.name)}.</em></h2>
    <p>Three things that regularly turn a straightforward ${esc(s.name)} move into an expensive one. We check all three before quoting, so they land in the price rather than on move day.</p>
  </div>
  ${TRIAL_STATES.has(s.name) ? `${quirkCards}` : `<div class="services">
${quirkCards}
  </div>`}
</section>

<!-- GALLERY -->
${TRIAL_STATES.has(s.name)
  ? GALLERY.replace('<div class="gallery-grid">', `<div class="gallery-grid">
    <div class="gallery-item gallery-lead">
      <img src="/assets/images/gallery/crew-packing.jpg" alt="Three 50STATEMOVERS crew taping a carton, shrink-wrapping an armchair and wrapping a mattress in a ${esc(s.name)} living room" loading="lazy" />
      <div class="gallery-caption"><div class="label">On the job</div><div class="title">Wrapped and boxed before anything moves</div></div>
    </div>`)
  : GALLERY}

<!-- FAQ -->
${faqSection(`    <div class="section-kicker">FAQ</div>
    <h2>${esc(s.name)} moving <em>questions</em>, answered.</h2>
    <p>The things people actually ask us before booking a move out of ${esc(s.name)}.</p>`, faqItems)}

<!-- NEARBY STATES -->
<section id="nearby">
  <div class="section-header">
    <div class="section-kicker">Where we go</div>
    <h2>Nearby states &amp; <em>popular destinations.</em></h2>
    <p>We run the full continental map. These are the states most often paired with ${a(s)} ${esc(s.name)} move — each has its own guide covering arrival logistics, building rules, and seasonal timing.</p>
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

  return `${head({ title, description, canonical, schema })}

${NAV}

<!-- HERO -->
<header class="hero">
  <div class="hero-content">
    <div class="eyebrow fade-in">
      <a href="/">Home</a> / Movers by state
    </div>
    <div class="hero-headline-wrap fade-in delay-1">
      <h1>Long-Distance Movers <em>By State</em></h1>
    </div>
  </div>

  <div class="hero-lede">
    <p class="fade-in delay-2">
      A generic quote hides the things that actually decide how your move goes — building permits, HOA approvals, mountain-pass closures, spring road weight limits, hurricane windows. So we wrote a real guide for every continental state and Washington DC: which lanes we actually run out of that state, how long each takes, and what tends to go wrong there.
    </p>

    <div class="hero-trust fade-in delay-3">
      <div class="ht-item"><span class="ht-dot" aria-hidden="true"></span><span>Booking moves this week</span></div>
      <span class="ht-divider" aria-hidden="true"></span>
      <div class="ht-item">
        <svg class="ht-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>${states.length}</strong> state guides</span>
      </div>
    </div>
  </div>

${HERO_VIDEO}

  <div class="hero-stat-cards fade-in delay-3">
    <div class="hero-card hc-light float">
      <div class="hc-label">State moving guides</div>
      <div class="hc-val serif">${states.length}</div>
      <div class="hc-sub">Every continental state plus Washington DC</div>
    </div>
    <div class="hero-card hc-dark float delay-a">
      <div class="hc-label">Average rating</div>
      <div class="hc-val serif">4.96 <span class="hc-unit">/5</span></div>
      <div class="hc-sub">Based on 2,400+ reviews</div>
    </div>
    <div class="hero-card hc-accent float delay-b">
      <div class="hc-label">Free quotes</div>
      <div class="hc-val serif">Same day</div>
      <div class="hc-sub">No obligation, no hidden fees</div>
    </div>
    <div class="hero-card hc-light float delay-c">
      <div class="hc-label">Protection</div>
      <div class="hc-val serif">$1M</div>
      <div class="hc-sub">Licensed, bonded &amp; insured</div>
    </div>
  </div>

${quoteForm(null)}
</header>

${TRUST_BAR}

<!-- COVERAGE -->
<section id="coverage" class="coverage-section">
  <div class="section-header">
    <h2>All <em>${states.length}</em> state moving guides.</h2>
    <p>Every continental state plus Washington DC. Each page covers that state's real routes, timing, access constraints, and licensing — pick yours to see what your move actually involves.</p>
  </div>
  <div class="states-grid" id="states-grid">
${allStates}
  </div>
  <button class="states-toggle" id="states-toggle" aria-expanded="false">Show all ${states.length} states ↓</button>
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
${servicesSection(`Whether you're relocating an apartment or a full office, we tailor the approach to what you're actually moving — and where it needs to go. Every service below is available in all ${states.length} states we cover.`)}

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
${GALLERY}

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
