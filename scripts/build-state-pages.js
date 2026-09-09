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

const SERVICES_NOTE = `  <div class="services-note">
    <span class="sn-text">Not sure which fits your move? We'll tell you straight — no upsell.</span>
    <a href="tel:${PHONE_HREF}" class="sn-link">
      Talk to a move coordinator
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
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

function servicesSection(intro) {
  const cards = SERVICE_CARDS.map(([num, icon, title, body]) => `    <div class="service-card">
      <div class="service-num">${num}</div>
      <div class="service-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n');
  return `<section id="services">
  <div class="section-header">
    <div class="section-kicker">What we do</div>
    <h2>Services built around <em>your</em> move.</h2>
    <p>${esc(intro)}</p>
  </div>
  <div class="services">
${cards}
  </div>

${SERVICES_NOTE}
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
          <input type="tel" id="qf-phone" placeholder="(555) 000-0000" />
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

const CLASSIC_FONT_STATES = new Set(['New York']);

const CLASSIC_FONT_HEAD = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Libre+Franklin:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>:root {
  --font-display: 'Playfair Display', Georgia, serif;
  /* Libre Franklin is Franklin Gothic (1902) — a classic grotesque, still
     sans-serif, so the form and buttons stay as crisp as they were. */
  --font-body: 'Libre Franklin', -apple-system, BlinkMacSystemFont, sans-serif;
}</style>`;

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
  const costCards = [
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
  ].map(([title, icon, body], i) => `    <div class="service-card">
      <div class="service-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="service-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n');

  // Local knowledge fills the homepage's dark process section.
  const localSteps = [
    ['Roads &amp; access', `${esc(s.logistics)} Main corridors: ${s.highways.map(esc).join(', ')}.`],
    ['Timing your move', esc(s.seasonal)],
    ['Who is moving, and why', esc(s.migration)],
    ['Licensing to check', `Interstate moves out of ${esc(s.name)} are federal: look for an active USDOT number and FMCSA authority. Ours are USDOT #${USDOT} and ${MC}. Movers operating only inside the state answer instead to ${esc(s.regulator)} — a registration that is not authority to take your belongings across the line.`],
  ].map(([title, body], i) => `    <div class="process-step">
      <div class="step-num">STEP ${String(i + 1).padStart(2, '0')}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n');

  // The three state-specific gotchas fill one row of the services grid.
  const quirkCards = s.quirks.map((q, i) => `    <div class="service-card">
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

  return `${head({ title, description, canonical, schema, extraHead: CLASSIC_FONT_STATES.has(s.name) ? CLASSIC_FONT_HEAD : '' })}

${NAV}

<!-- HERO -->
<header class="hero">
  <div class="hero-content">
    <div class="eyebrow fade-in">
      <a href="/">Home</a> / <a href="${HUB_URL}">Movers by state</a> / ${esc(s.name)}
    </div>
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
${servicesSection(s.servicesIntro)}

<!-- COSTS -->
<section id="costs" class="coverage-section">
  <div class="section-header">
    <div class="section-kicker">Pricing</div>
    <h2>What shapes the price of ${a(s)} <em>${esc(s.name)}</em> move.</h2>
    <p>We don't publish a price list, because a number without a survey is a guess — and a guess is exactly what turns into a bigger bill on delivery day. Here's what actually moves the figure on ${a(s)} ${esc(s.name)} move. Every one of these is itemized in your written quote before you sign, and the price we agree is the price you pay.</p>
  </div>
  <div class="services">
${costCards}
  </div>
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
  <div class="services">
${quirkCards}
  </div>
</section>

<!-- GALLERY -->
${GALLERY}

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
    <a href="${HUB_URL}" class="nav-cta">See all ${states.length} state moving guides →</a>
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
