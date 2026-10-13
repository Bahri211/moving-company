/* The layout every page in the new design shares, applied to a page's HTML:
 *
 *   - no "Talk to a moving specialist" band under the hero
 *   - on phones, the call + Free quote dock appears only once the hero form
 *     has scrolled away
 *   - What we do: White glove keeps its text over its photo; Long distance,
 *     Residential, Commercial and Packing are photo-only cards (whole photo,
 *     fitted over a blurred copy; text kept for screen readers); Long distance
 *     opens its sheet instead of leaving the page; Storage has no photo
 *   - On moving day: six frames, Everything wrapped first
 *   - phones: the headline and the quote form sit a little lower in the hero
 *
 * Every step checks whether it has already been made, so this can run over a
 * page that already has it (the NYC pages are edited in place, and the
 * moving-services build starts from the NYC Long Distance page).
 *
 * Used by scripts/build-moving-services-pages.js and scripts/apply-shared-layout.js.
 */

const LAYOUT = {
  whiteGlove: ['/assets/images/nyc-florida/slide-7.webp', 'Two movers wheeling boxes up the ramp into a moving truck', '40% 40%'],
  longDistance: ['/assets/images/nyc-florida/long-distance.webp', 'White box truck parked on a residential street'],
  // The three small What we do cards: [src, alt].
  tiles: {
    residential: ['/assets/images/nyc-florida/slide-6.webp', 'Moving truck parked in the driveway of a house'],
    commercial: ['/assets/images/nyc-florida/slide-5.webp', 'Shelving, tubs and boxes secured inside a moving truck'],
    packing: ['/assets/images/nyc-florida/slide-4.webp', 'Boxes packed floor to ceiling in the back of a moving truck'],
  },
  // On moving day, in order: [src, alt, focus, title, text]. The last frame gets the check mark.
  frames: [
    ['/assets/images/nyc-florida/settled-in.webp', 'Furniture wrapped in plastic and blankets in an empty living room', '50% 50%', 'Everything wrapped', 'Blankets, shrink and tape on every piece — not only the fragile ones.'],
    ['/assets/images/lab/runner-hall.webp', 'Blue floor runner laid down a hallway', '50% 50%', 'Floors protected', 'Runners down and door jambs padded before a single box is carried.'],
    ['/assets/images/nyc-florida/storage.webp', 'Boxes, bags and storage tubs ready to load', '40% 50%', 'Ready to load', 'Every box labelled by room and on the inventory before it goes on the truck.'],
    ['/assets/images/nyc-florida/slide-2.webp', 'Two movers loading furniture into a truck from a garage', '50% 40%', 'Loaded by your crew', 'The crew that packs your home loads the truck, tier by tier, and strapped row by row.'],
    ['/assets/images/nyc-florida/new-door.webp', 'Moving truck parked outside a house on delivery day', '74% 50%', 'At your new door', 'Unloaded into the rooms you point to, on the date in your contract.'],
    ['/assets/images/nyc-florida/slide-3.webp', 'Moving truck ramp leading to the door of a new house', '30% 50%', 'Settled in', 'Beds built, furniture placed, and we don\'t leave until you\'ve signed off.'],
  ],
  // The Long distance sheet, for pages that don't have one of their own.
  longDistanceSheet: `    'long-distance': ['Long distance', 'Moves between any of the 48 states, on one truck with one crew from pickup to delivery.',
      ['One binding written price for the whole route', 'Your things stay on our truck, no transfers', 'Every item on a signed inventory', 'Delivery window written into your contract']],
`,
};

const CSS = `/* Shared layout: photo-only What we do cards. The whole photo shows, fitted
   inside the card, with a blurred copy of it filling any space at the sides;
   the text is kept for screen readers only. Clicking still opens the card. */
.tile-only { padding: 0; gap: 0; background: var(--dark); }
.tile-pic { position: absolute; inset: 0; display: block; overflow: hidden; background: var(--dark); }
.tile-pic::before { content: ""; position: absolute; inset: -20px; background: var(--pic) center / cover no-repeat; filter: blur(18px) brightness(0.85); transform: scale(1.1); }
.tile-pic img { position: relative; display: block; width: 100%; height: 100%; object-fit: contain; transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
.tile-only:hover .tile-pic img { transform: scale(1.03); }
.tile-only h3, .tile-only p, .tile-only .tile-more, .tile-only .tile-tag { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.tile-only .tile-arrow { z-index: 1; background: rgba(255, 255, 255, 0.88); color: var(--ink); }
/* Storage between homes without a photo: the copy takes the card's width. */
.t-6.t-noimg > div { max-width: 52rem; }
@media (max-width: 768px) {
  .tile-only { min-height: 0 !important; aspect-ratio: 4 / 3; }
  .t-1.tile-only, .t-5.tile-only { aspect-ratio: 16 / 10; }
  .t-6.t-noimg { padding-top: 1.6rem; }
  /* The headline and the quote form sit a little lower in the hero. */
  .hero { padding-top: calc(55vw + 3.7rem); }
  /* The call + Free quote dock waits until the hero form has scrolled away. */
  .callbar { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s; }
  .callbar:not(.is-on) { transform: translateY(calc(100% + 1rem)); opacity: 0; pointer-events: none; }
}
@media (max-width: 768px) and (max-height: 640px) {
  .hero { padding-top: calc(49vw + 1.6rem); }
}
`;
const CSS_MARK = '/* Shared layout: photo-only What we do cards.';

function fail(label) { throw new Error(`shared-layout: ${label} not found`); }
function swap(html, from, to, label) {
  const i = html.indexOf(from);
  if (i === -1) fail(label);
  return html.slice(0, i) + to + html.slice(i + from.length);
}
const tilePic = (src, alt) => `<span class="tile-pic" style="--pic: url('${src}');"><img src="${src}" alt="${alt}" loading="lazy" /></span>`;

function applySharedLayout(html) {
  // Styles, once, at the end of the page's first <style>.
  // An older copy of these styles is swapped for the current one.
  const old = html.indexOf(CSS_MARK);
  if (old !== -1) {
    const end = html.indexOf('</style>', old);
    html = html.slice(0, old) + html.slice(end);
  }
  html = swap(html, '</style>', CSS + '</style>', 'first </style>');

  // No "Talk to a moving specialist" band; the trust strip below it stays.
  const talk = html.indexOf('    <div class="talk reveal">');
  if (talk !== -1) {
    const proof = html.indexOf('    <div class="proof reveal">', talk);
    if (proof === -1) fail('trust strip');
    html = html.slice(0, talk) + html.slice(proof);
  }

  // Phones: the dock shows once the hero form is off screen.
  if (!html.includes("callbar.classList.toggle('is-on', !formOn)")) {
    html = swap(html, "  var lab = document.querySelector('.lab'), pill = document.querySelector('.float-cta');\n",
      "  var lab = document.querySelector('.lab'), pill = document.querySelector('.float-cta'), callbar = document.querySelector('.callbar');\n", 'dock var');
    html = swap(html, "      if (lab) lab.classList.toggle('is-on', !formOn);\n",
      "      if (lab) lab.classList.toggle('is-on', !formOn);\n      if (callbar) callbar.classList.toggle('is-on', !formOn);\n", 'dock toggle');
    html = swap(html, "  } else { if (lab) lab.classList.add('is-on'); pill.classList.add('is-on'); }",
      "  } else { if (lab) lab.classList.add('is-on'); pill.classList.add('is-on'); if (callbar) callbar.classList.add('is-on'); }", 'dock fallback');
  }

  // White glove: its new photo, text stays over it.
  {
    const [src, alt, pos] = LAYOUT.whiteGlove;
    const re = /(<a href="#quote" class="tile tile-photo t-2 reveal" data-service="white-glove" aria-haspopup="dialog">\n        )<img [^>]*\/>/;
    if (!re.test(html)) fail('White glove card');
    html = html.replace(re, `$1<img src="${src}" alt="${alt}" loading="lazy" style="object-position: ${pos};" />`);
  }

  // Long distance: photo only, and it opens its sheet instead of leaving the page.
  if (!html.includes('tile-only t-1')) {
    const [src, alt] = LAYOUT.longDistance;
    const re = /<a href="[^"]*" class="tile tile-photo t-1 reveal"[^>]*>\n        <img [^>]*\/>\n([\s\S]*?)<\/a>/;
    if (!re.test(html)) fail('Long distance card');
    html = html.replace(re, (m, inner) =>
      `<a href="#quote" class="tile tile-only t-1 reveal" data-service="long-distance" aria-haspopup="dialog">\n        ${tilePic(src, alt)}\n${inner}</a>`);
  }
  if (!html.includes("'long-distance': [")) html = swap(html, '  var SERVICES = {\n', '  var SERVICES = {\n' + LAYOUT.longDistanceSheet, 'services list');

  // Residential, Commercial, Packing: photo only.
  for (const [svc, [src, alt]] of Object.entries(LAYOUT.tiles)) {
    const re = new RegExp('<a href="#quote" class="tile tile-(?:dark|accent|plain) (t-[3-5]) reveal" data-service="' + svc + '" aria-haspopup="dialog">([\\s\\S]*?)</a>');
    if (!re.test(html)) {
      if (html.includes(`tile-only t-`) && html.includes(`data-service="${svc}"`)) continue;
      fail(`${svc} card`);
    }
    html = html.replace(re, (m, t, inner) => {
      inner = inner.replace(/\s*<svg class="tile-mark"[\s\S]*?<\/svg>/, '').replace(/\s*<span class="big-num">[^<]*<\/span>/, '');
      return `<a href="#quote" class="tile tile-only ${t} reveal" data-service="${svc}" aria-haspopup="dialog">\n        ${tilePic(src, alt)}${inner}</a>`;
    });
  }

  // Storage between homes: no photo.
  html = html.replace(/<a href="#quote" class="tile tile-plain t-6(?: t-noimg)? reveal" data-service="storage" aria-haspopup="dialog">\n(?:        <img [^>]*\/>\n)?/,
    '<a href="#quote" class="tile tile-plain t-6 t-noimg reveal" data-service="storage" aria-haspopup="dialog">\n');
  if (!html.includes('t-6 t-noimg')) fail('Storage card');

  // On moving day: the six frames.
  const frames = LAYOUT.frames.map(([src, alt, pos, t, d], i) =>
    `      <article class="frame"><div class="frame-img"><img src="${src}" alt="${alt}" loading="lazy" style="object-position: ${pos};" /><span class="frame-num">${i === LAYOUT.frames.length - 1 ? '✓' : i + 1}</span></div>\n        <h3>${t}</h3><p>${d}</p></article>`).join('\n');
  const a = html.indexOf('    <div class="rail reveal">'), b = a === -1 ? -1 : html.indexOf('    </div>\n    <div class="rail-bar reveal">', a);
  if (b === -1) fail('On moving day rail');
  html = html.slice(0, a) + `    <div class="rail reveal">\n${frames}\n` + html.slice(b);

  return html;
}

module.exports = { applySharedLayout, LAYOUT };
