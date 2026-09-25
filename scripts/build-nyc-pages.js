#!/usr/bin/env node
/* NYC landing pages — four pages for New York moves, in the new layout.
 *
 * The design lab (design-lab/index.html) is the template: this reads it at
 * build time and turns it into a production page — the site's real tracking
 * and SEO head instead of the lab's noindex, the Sky blue palette fixed on
 * <html>, no palette switcher — then swaps in each page's own headline,
 * routes section and FAQ.
 *
 * No review counts, ratings or testimonials go on these pages: the review
 * section is dropped and the hero carries the licence instead, until the
 * client supplies a real, linkable rating.
 *
 * Every anchor string below must still exist in the lab: if the lab changes,
 * the build fails loudly here rather than shipping a half-swapped page.
 *
 *   node scripts/build-nyc-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.50statemovers.com';
const LAB = fs.readFileSync(path.join(ROOT, 'design-lab', 'index.html'), 'utf8');
const HOME = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ------------------------------------------------------------ copy per page */

const PAGES = [
  {
    slug: 'nyc-long-distance-movers',
    title: 'NYC Long Distance Movers | Flat-Rate Routes Nationwide — 50STATEMOVERS INC',
    description:
      'NYC long distance movers with flat-rate routes nationwide. A binding written estimate and one licensed crew from your New York door to your new one, with $1M liability coverage.',
    h1: 'NYC Long Distance<br><em>Movers</em>',
    tag: 'Flat-rate routes nationwide',
    lede: 'Leaving New York for anywhere in the continental US? One flat, written price for the whole route, and one licensed crew from your door in the city to your new one.',
    ticker: 'Flat-rate routes nationwide',
    formTo: '',
    coverage: 'wave',
    // Services as plain cards (no links), worded for moves out of New York.
    services: {
      eyebrow: 'From New York',
      h2: 'From New York to <em>anywhere in the US.</em>',
      p: 'A studio in Queens or a five-bedroom house in Westchester — we plan the crew, the truck and the packing around your home and the road to your new one, in any of the 48 continental states or D.C.',
      tiles: {
        'Long distance': 'From your New York door to any state in the continental US, on one truck from pickup to delivery.',
        'White glove': 'We pack up your New York home, move it, unpack and arrange — and hang the art before we leave.',
        'Residential': 'Walk-ups, co-ops, condos and houses across the five boroughs. Taken apart, moved, rebuilt.',
        'Commercial': 'New York offices moved out over a weekend, and working in the new city by Monday.',
        'Packing &amp; crating': 'Careful packing for city apartments, and custom crates for art, glass and antiques.',
        'Storage between homes': 'When your New York move-out and new move-in dates don\u2019t line up, we hold everything until you\u2019re ready.',
      },
    },
    formName: 'NYC Long Distance Movers page',
    routesEyebrow: 'From New York',
    routesH2: 'Popular routes <em>out of NYC.</em>',
    routesP: 'Most of our New York moves head down the East Coast or all the way across the country. Each route below has its own page with the details that matter on that drive.',
    cards: [
      { href: '/nyc-to-florida-long-distance-movers/', name: 'NYC to Florida', meta: 'Weekly departures',
        text: 'Secure transit down I-95 to Miami, Fort Lauderdale, Orlando, Tampa and Jacksonville.' },
      { href: '/nyc-to-north-carolina-and-georgia-movers/', name: 'NYC to North Carolina &amp; Georgia', meta: 'Weekly direct routes',
        text: 'Direct runs to Charlotte, Raleigh–Durham, Atlanta and Savannah on a flat, written price.' },
      { href: '/nyc-long-distance-movers-to-texas-california-chicago-and-boston/', name: 'NYC to Texas, California, Chicago &amp; Boston', meta: 'Four routes',
        text: 'From a four-hour hop up to Boston to the full crossing to Los Angeles and San Diego.' },
      { href: '/moving-from-new-york/', name: 'Anywhere else from New York', meta: '48 states + D.C.',
        text: 'Every other destination in the continental US, with the same crew and the same kind of written price.' },
    ],
    factsTitle: 'Moving out of a New York building',
    facts: [
      ['Certificate of insurance', 'Most co-ops, condos and managed rentals in Manhattan and Brooklyn will not let a crew through the lobby without one. Send us the building\'s sample and we arrange it before move day.'],
      ['Freight elevator and move window', 'Buildings hand out weekday slots for the service elevator. Book yours early; we schedule the crew and the truck around it, not the other way round.'],
      ['Curb space for the truck', 'A long distance truck needs room at the curb. We plan the arrival time and the loading spot so nobody carries your sofa half a block to reach it.'],
      ['Walk-ups and brownstones', 'Four flights and a turning staircase are an everyday job in this city. Tell us the floor and the stairs when you book, and the estimate accounts for them.'],
    ],
    note: 'A flat rate on a long distance move is a binding written estimate: the price is worked out from your inventory and the route before anything is loaded, and it is the price you pay at delivery. No hourly meter running while the truck sits in traffic on the Cross Bronx Expressway.',
    faqH2: 'NYC long distance moves, <em>answered.</em>',
    faq: [
      ['Do you handle the certificate of insurance my building asks for?',
       'Yes. Send us your building\'s COI requirements or its sample certificate when you book. We have the certificate issued to the building and its management company with the right names and limits, and you pass it to the super before move day.'],
      ['Can you move me out of a walk-up?',
       'Yes. Walk-ups are routine in New York. Tell us the floor, how wide the stairs are and anything that will not turn the corner, like a sectional or a box spring, and we size the crew and plan the time on your estimate around it.'],
      ['What does flat-rate mean for a long distance move?',
       'It means the number on your binding written estimate is the number you pay. We build it from a video or in-home survey of what you are moving and the route to your new home, and it does not change because the drive took longer or the truck sat in traffic.'],
      ['Which parts of New York do you pick up from?',
       'All five boroughs — Manhattan, Brooklyn, Queens, the Bronx and Staten Island — and the suburbs around the city. If you are not sure your address is covered, call us and we will tell you straight away.'],
      ['Do you move from NYC to states not listed on this page?',
       'Yes. The routes above are the ones we run most often, but we carry New York moves to every continental state and Washington D.C. Pick your destination in the form and we will quote the full route.'],
    ],
  },
  {
    slug: 'nyc-to-florida-long-distance-movers',
    title: 'NYC to Florida Long Distance Movers | Secure Transit, Weekly Departures — 50STATEMOVERS INC',
    description:
      'NYC to Florida long distance movers with secure transit and weekly departures. One crew from New York to Miami, Orlando, Tampa or Jacksonville on a binding written estimate.',
    h1: 'NYC to Florida<br><em>Long Distance Movers</em>',
    tag: 'Secure transit and weekly departures',
    lede: 'New York to the Sunshine State on one binding price. Your things stay on our truck with our crew for the whole drive down I-95, and trucks head south every week.',
    ticker: 'Weekly departures to Florida',
    formTo: 'Florida',
    network: 'New York>Florida,Georgia,South Carolina,North Carolina,Texas,California,Illinois',
    formName: 'NYC to Florida page',
    routesEyebrow: 'NYC to Florida',
    routesH2: 'Where we deliver <em>in Florida.</em>',
    routesP: 'Trucks leave New York for Florida every week. These are the cities we deliver to most often, with the rough road distance from Manhattan.',
    cards: [
      { name: 'Miami', meta: 'about 1,280 miles',
        text: 'High-rise condos here book service elevators by the hour and ask for insurance certificates, just like Manhattan co-ops. We arrange both before the truck arrives.' },
      { name: 'Fort Lauderdale', meta: 'about 1,250 miles',
        text: 'From Las Olas apartments to houses along the canals, we plan the unload around the building\'s rules and any gated-community access list.' },
      { name: 'West Palm Beach', meta: 'about 1,210 miles',
        text: 'A favourite for New Yorkers taking the whole household south for good. We deliver on the island and across the mainland neighborhoods alike.' },
      { name: 'Orlando', meta: 'about 1,070 miles',
        text: 'Newer suburbs around Orlando often come with HOA move-in rules about trucks and hours. Tell us yours and the crew works within them.' },
      { name: 'Tampa', meta: 'about 1,140 miles',
        text: 'Tampa Bay moves reach St. Petersburg and Clearwater too. We confirm the delivery address and the access before the truck leaves New York.' },
      { name: 'Jacksonville', meta: 'about 940 miles',
        text: 'The nearest of the big Florida cities to New York, and usually the shortest delivery window on the whole route.' },
    ],
    factsTitle: 'Secure transit, explained',
    facts: [
      ['One truck, no transfers', 'Your shipment is loaded in New York and stays on the same truck to Florida. It is not unloaded at a warehouse hub and reloaded onto somebody else\'s trailer.'],
      ['Our crew, not a broker\'s', 'The people who load your home work for us, and nobody resells your move to another company once you have booked.'],
      ['Tagged and inventoried', 'Every item gets a tag and a line on a signed inventory at pickup, and is checked off the same list as it comes off the truck in Florida.'],
      ['Wrapped for a long, warm drive', 'Blankets and shrink wrap on every piece, stacked in tiers and strapped row by row for a thousand miles of highway and the Florida heat at the far end.'],
    ],
    note: 'Because trucks head south from New York every week, your move date is set around your plans, not around waiting for a trailer to fill up.',
    faqH2: 'NYC to Florida, <em>answered.</em>',
    faq: [
      ['How do weekly departures to Florida work?',
       'We run trucks from New York to Florida every week. When you book, we match your load to the next departure that fits your move-out date, and your delivery window goes into your contract in writing.'],
      ['What does secure transit mean on this route?',
       'It means your belongings stay with one truck and one crew from your New York door to your Florida door. No cross-docking at a warehouse, no broker handing your load to a stranger, and a signed inventory at both ends.'],
      ['My Florida condo has move-in rules. Can you work with them?',
       'Yes. Many Florida condos and HOAs want a certificate of insurance, a reserved elevator or loading dock, and deliveries only on certain days or hours. Send us the association\'s rules and we plan the delivery around them.'],
      ['Should I avoid moving to Florida during hurricane season?',
       'Not necessarily. Hurricane season runs from June through November, and most moves in those months go ahead as normal. We watch the forecast before your truck heads south and will call you if a storm means shifting the delivery day, so nothing is left out in the weather.'],
      ['Can you store my things if my Florida home is not ready?',
       'Yes. If a closing slips or a lease starts late, we can hold your shipment in climate-controlled storage and deliver when the keys are in your hand. It stays inventoried and insured the whole time.'],
    ],
  },
  {
    slug: 'nyc-to-north-carolina-and-georgia-movers',
    title: 'NYC to North Carolina and Georgia Movers | Weekly Direct Routes, Flat-Rate Pricing — 50STATEMOVERS INC',
    description:
      'NYC to North Carolina and Georgia movers with weekly direct routes and flat-rate pricing. Charlotte, Raleigh–Durham, Atlanta and Savannah on one binding written estimate.',
    h1: 'NYC to North Carolina<br>and <em>Georgia Movers</em>',
    tag: 'Weekly direct routes and flat-rate pricing',
    lede: 'New York to the Carolinas and Georgia every week, on a direct route with one crew and one flat price that is written down before we load.',
    ticker: 'Weekly direct routes to NC &amp; GA',
    formTo: '',
    network: 'New York>North Carolina,Georgia,South Carolina,Tennessee,Florida,Texas,Illinois',
    formName: 'NYC to North Carolina and Georgia page',
    routesEyebrow: 'NYC to NC &amp; GA',
    routesH2: 'Where we deliver <em>in the Carolinas and Georgia.</em>',
    routesP: 'Our trucks run south from New York through Virginia on I-95 and I-85 into North Carolina, and on down to Georgia. These are the places we reach most often.',
    cards: [
      { name: 'Charlotte, NC', meta: 'about 630 miles',
        text: 'Uptown apartments and fast-growing suburbs from Ballantyne to Huntersville. Many newer communities have rules about where a truck may park, and we plan for them.' },
      { name: 'Raleigh–Durham, NC', meta: 'about 500 miles',
        text: 'The Research Triangle draws plenty of New Yorkers relocating for work. We deliver across Raleigh, Durham, Cary and Chapel Hill.' },
      { name: 'Greensboro &amp; Winston-Salem, NC', meta: 'about 540 miles',
        text: 'The Triad sits right on the way to Charlotte, which makes it a natural stop on a direct run south from the city.' },
      { name: 'Asheville, NC', meta: 'about 700 miles',
        text: 'Mountain driveways can be steep and narrow. Tell us about yours when you book, so we know how the truck will reach your door.' },
      { name: 'Atlanta, GA', meta: 'about 870 miles',
        text: 'From Midtown high-rises to houses in Decatur, Marietta and Alpharetta, we unload into the rooms you point to on the date in your contract.' },
      { name: 'Savannah, GA', meta: 'about 800 miles',
        text: 'Historic-district streets are tight and some squares restrict large trucks, so we confirm the approach to your address before we set off.' },
    ],
    factsTitle: 'Direct routes, explained',
    facts: [
      ['Straight from door to door', 'A direct route means your load travels from New York to North Carolina or Georgia without a stop at a transfer warehouse along the way.'],
      ['Weekly, so your date comes first', 'Trucks run south from New York every week, so we book around your move-out date instead of waiting until a trailer is full.'],
      ['Flat-rate, in writing', 'Your price is a binding written estimate built from a survey of your home and the route. It is set before loading and does not change at the far end.'],
      ['Placed room by room', 'At the new address the crew puts each piece in the room you choose, rebuilds the beds and takes the packing away if you ask.'],
    ],
    note: 'Whichever city you are heading to, the same crew that wraps and loads your home in New York is the one that unloads it in the Carolinas or Georgia.',
    faqH2: 'NYC to the Carolinas and Georgia, <em>answered.</em>',
    faq: [
      ['How often do trucks run from New York to North Carolina and Georgia?',
       'Every week. When you book, we place your move on the next direct departure that fits your dates and write the delivery window into your contract.'],
      ['What does flat-rate pricing mean on these routes?',
       'It means a binding written estimate: we survey your home by video or in person, work out the price for the whole route, and that is what you pay on delivery day. No hourly meter and no revised figure at the far end.'],
      ['Do you deliver outside Charlotte, Raleigh and Atlanta?',
       'Yes. We deliver anywhere in North Carolina and Georgia, from the Outer Banks to the mountains around Asheville and from the Atlanta suburbs to the coast at Savannah. The cities above are simply the ones New Yorkers choose most.'],
      ['My new neighborhood has an HOA. Anything I should do before the move?',
       'Check the HOA\'s rules on moving trucks, parking and delivery hours, and send them to us. Some communities limit where a large truck can stand or ask for notice in advance, and we plan the unload to fit.'],
      ['How far ahead should I book a move to the Carolinas or Georgia?',
       'Four to six weeks is comfortable, and six to eight in late spring and summer when these routes are busiest. If your date is sooner, call us anyway; weekly departures often leave room for a short-notice move.'],
    ],
  },
  {
    slug: 'nyc-long-distance-movers-to-texas-california-chicago-and-boston',
    title: 'NYC Long Distance Movers to Texas, California, Chicago and Boston — 50STATEMOVERS INC',
    description:
      'NYC long distance movers to Texas, California, Chicago and Boston. One licensed crew, a binding written estimate and $1M liability coverage from your New York door to the new one.',
    h1: 'NYC Long Distance Movers <em>to Texas, California, Chicago and Boston</em>',
    tag: '',
    long: true,
    lede: 'From a four-hour drive to Boston to the full crossing to Los Angeles: four of our busiest routes out of New York, each on one binding price with one crew.',
    ticker: 'Texas · California · Chicago · Boston',
    formTo: '',
    network: 'New York>Texas,California,Illinois,Massachusetts',
    formName: 'NYC to Texas, California, Chicago and Boston page',
    routesEyebrow: 'Four routes from NYC',
    routesH2: 'Four routes, <em>four different drives.</em>',
    routesP: 'Each of these routes has its own rhythm. Here is what changes on the road and at the door when you leave New York for each one.',
    cards: [
      { pin: true, name: 'Boston Route', meta: 'about 215 miles',
        lead: 'Fast, next-day flat-rate transport from NYC to Boston, MA.',
        text: 'Boston asks for a street occupancy permit to hold curb space for a moving truck, and the city is busiest around September 1, when most leases turn over. Book early and we help you arrange the permit.' },
      { pin: true, name: 'Midwest Routes', meta: 'about 790 miles to Chicago',
        lead: 'Daily departures from NYC to Chicago and the Greater Midwest.',
        text: 'Towers in the Loop and River North book loading docks and freight elevators by the hour, much like New York. We reserve the time at both ends so the truck never idles at the curb.' },
      { pin: true, name: 'Southwest Routes', meta: 'about 1,550–1,750 miles',
        lead: 'Weekly direct shuttles from NYC to Houston, Dallas, and Austin, TX.',
        text: 'Summer heat in Texas is hard on electronics, candles and anything sealed tight, so we pack and load with the temperature in mind and unload promptly on arrival.' },
      { pin: true, name: 'West Coast Routes', meta: 'about 2,800–2,900 miles',
        lead: 'Secure, long-haul transport from NYC to Los Angeles and California.',
        text: 'The longest drive we run from New York. California\'s border stations inspect for plants and fresh produce, so leave those out of the load and we plan the rest for the long haul.' },
    ],
    factsTitle: 'The same move, whatever the distance',
    facts: [
      ['One binding estimate', 'Boston or Los Angeles, the price is written down before we load and is the price you pay on delivery day.'],
      ['One crew, both ends', 'The crew that wraps your New York apartment is the crew that carries it into the new place, room by room.'],
      ['A signed inventory', 'Every item is tagged at pickup and checked off the same list at delivery, which settles any question later.'],
      ['Storage if dates don\'t line up', 'Long hauls rarely match a closing date. We can hold your shipment in climate-controlled storage and deliver when you are ready.'],
    ],
    note: 'Leaving for somewhere else? We run New York moves to every continental state — see our <a href="/nyc-long-distance-movers/">NYC long distance movers</a> page for the other routes.',
    faqH2: 'Four routes from NYC, <em>answered.</em>',
    faq: [
      ['Is a move from NYC to Boston handled differently from a move to California?',
       'The paperwork is the same: a binding written estimate, a signed inventory and your valuation choice. What changes is the planning. Boston is a same-day drive with a city permit to arrange at the far end, while California is the longest haul we run and is packed for several days on the road.'],
      ['Do I need a permit for the moving truck in Boston?',
       'Usually, yes. Boston asks for a street occupancy permit to reserve curb space for a moving truck, and parking is hardest around September 1. Tell us your new address early and we will help you apply so the space is signed and waiting.'],
      ['Can I bring my plants on a move to California?',
       'It is best not to. California inspects shipments for plants, soil and fresh produce that could carry pests, and a moving truck is no place for a houseplant on a cross-country drive. Give them away in New York or take a few with you in the car.'],
      ['How do you protect things from the heat on a move to Texas?',
       'We wrap and load with the Texas summer in mind, keep heat-sensitive things like electronics and vinyl records toward the middle of the load, and unload promptly on arrival. Pack candles, aerosols and anything that can melt or burst separately, and mention them at the survey.'],
      ['Do Chicago buildings have move-in rules like New York?',
       'Many do. Towers in the Loop, River North and the Gold Coast reserve freight elevators and loading docks, ask for a certificate of insurance and set move-in hours. Send us the building\'s rules and we plan the delivery around them.'],
    ],
  },
];

/* ------------------------------------------------------------------ helpers */

function swapOnce(html, from, to, label) {
  const i = html.indexOf(from);
  if (i === -1) throw new Error(`build-nyc-pages: "${label}" not found in design-lab/index.html`);
  return html.slice(0, i) + to + html.slice(i + from.length);
}
function swapAll(html, from, to, label) {
  if (!html.includes(from)) throw new Error(`build-nyc-pages: "${label}" not found in design-lab/index.html`);
  return html.split(from).join(to);
}
function swapBlock(html, start, end, to, label) {
  const i = html.indexOf(start);
  const j = i === -1 ? -1 : html.indexOf(end, i);
  if (i === -1 || j === -1) throw new Error(`build-nyc-pages: block "${label}" not found in design-lab/index.html`);
  return html.slice(0, i) + to + html.slice(j + end.length);
}
const esc = s => s.replace(/&(?!amp;|#)/g, '&amp;').replace(/"/g, '&quot;');
const plain = s => s.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

// The homepage's tracking, byte for byte: GTM (both containers), Meta Pixel,
// Google Ads + GA4 and Clarity in the head; GTM's noscript frames in the body.
function tracking() {
  const a = HOME.indexOf('<!-- Google Tag Manager -->');
  const clarity = HOME.indexOf('<!-- Microsoft Clarity -->');
  const b = HOME.indexOf('</script>', clarity) + '</script>'.length;
  if (a === -1 || clarity === -1) throw new Error('build-nyc-pages: tracking snippets not found in index.html');
  const head = HOME.slice(a, b);
  const noscript = [...HOME.matchAll(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g)].map(m => m[0]).join('\n');
  return { head, noscript };
}

function schema(page) {
  const url = `${SITE}/${page.slug}/`;
  return `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MovingCompany',
      '@id': `${url}#business`,
      name: '50STATEMOVERS INC',
      url,
      description: page.description,
      telephone: '+18885051086',
      email: 'contact@50statemovers.com',
      areaServed: 'US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: plain(page.h1), item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
}, null, 2)}
</script>`;
}

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
// Lucide map-pin (ISC licence), in place of a 📍 emoji, which draws differently on every phone.
const PIN = '<svg class="rc-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

function routesSection(page) {
  const cards = page.cards.map(c => {
    const inner = `<span class="rc-meta">${c.meta}</span><h3>${c.pin ? PIN : ''}${c.name}</h3>${c.lead ? `<p class="rc-lead">${c.lead}</p>` : ''}<p>${c.text}</p>`;
    return c.href
      ? `      <a class="rc rc-link reveal" href="${c.href}">${inner}<span class="rc-go">See this route ${ARROW}</span></a>`
      : `      <div class="rc reveal">${inner}</div>`;
  }).join('\n');
  const facts = page.facts.map(([t, d]) => `        <li><i>${CHECK}</i><div><b>${t}</b><span>${d}</span></div></li>`).join('\n');
  return `<section class="section routes" id="routes">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">${page.routesEyebrow}</span><h2>${page.routesH2}</h2></div>
      <p>${page.routesP}</p>
    </div>
    <div class="rc-grid${page.cards.length === 4 ? ' rc-four' : ''}">
${cards}
    </div>
    <div class="facts reveal">
      <h3>${page.factsTitle}</h3>
      <ul>
${facts}
      </ul>
      <p class="facts-note">${page.note}</p>
    </div>
  </div>
</section>

`;
}

// The lab's FAQ call card, as it is there: "Talk to a moving specialist ·
// Free, no pressure" over the number.
const FAQ_CALL = (() => {
  const m = LAB.match(/      <a href="tel:\+18885051086" class="faq-person"[\s\S]*?<\/a>/);
  if (!m) throw new Error('build-nyc-pages: FAQ call card not found in design-lab/index.html');
  return m[0].trimStart();
})();

function faqSection(page) {
  return `<section class="section" id="faq" style="padding-top: 2rem;">
  <div class="wrap faq-grid">
    <div class="faq-aside reveal">
      <span class="eyebrow">FAQ</span>
      <h2>${page.faqH2}</h2>
      <p>What New Yorkers ask before booking. If yours isn't here, call — a real person picks up.</p>
${FAQ_CALL}
    </div>
    <div class="reveal">
${page.faq.map(([q, a], i) => `      <details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </div>
  </div>
</section>`;
}

// Styles only these pages use: the NYC hero photos, the headline tagline, the
// long-title size and the routes section.
const EXTRA_CSS = `<style>
/* NYC hero. The truck sits on the left of the street photo, so the copy moves
   to the right and the wash comes from that side. On phones the portrait cut
   is pulled up until the truck's lettering sits in the band under the nav. */
@media (min-width: 769px) {
  .hero::before {
    background:
      linear-gradient(270deg, rgba(var(--wash), 0.88) 0%, rgba(var(--wash), 0.62) 36%, rgba(var(--wash), 0) 62%),
      linear-gradient(180deg, rgba(var(--wash), 0.45) 0%, rgba(var(--wash), 0) 28%, rgba(var(--wash), 0) 60%, rgba(var(--wash), 0.8) 100%),
      var(--dark) url('/assets/images/nyc/hero-desktop.webp') 28% 62% / cover no-repeat;
  }
  /* A right-hand column of fixed width, whatever the screen: percentage
     padding measured against the whole window squeezed it on wide screens. */
  .hero-copy { display: grid; grid-template-columns: minmax(0, 38rem); justify-content: end; }
  .hero-copy > .hero-badge { justify-self: start; }
}
@media (max-width: 768px) {
  .hero::before {
    background:
      linear-gradient(180deg,
        rgba(var(--wash), 0.6) 0,
        rgba(var(--wash), 0.05) 17vw,
        rgba(var(--wash), 0) 44vw,
        rgba(var(--wash), 0.88) 58vw,
        var(--dark) 72vw),
      var(--dark) url('/assets/images/nyc/hero-mobile.webp') center -80vw / 100% auto no-repeat;
  }
}
@media (max-width: 768px) and (max-height: 640px) {
  .hero::before {
    background:
      linear-gradient(180deg,
        rgba(var(--wash), 0.6) 0,
        rgba(var(--wash), 0.05) 12vw,
        rgba(var(--wash), 0) 38vw,
        rgba(var(--wash), 0.88) 52vw,
        var(--dark) 66vw),
      var(--dark) url('/assets/images/nyc/hero-mobile.webp') center -86vw / 100% auto no-repeat;
  }
}
/* Static service cards: no hover lift or zoom, since they don't open. */
.tile-static, .tile-static:hover { transform: none; cursor: default; }
.tile-static:hover img { transform: none; }
.hero-tag { display: inline-flex; align-items: center; gap: 0.55rem; margin: -0.4rem 0 1.1rem; font-size: clamp(1.1rem, 1.7vw, 1.4rem); font-weight: 700; letter-spacing: -0.015em; color: #fff; }
.hero-tag::before { content: ""; width: 26px; height: 3px; border-radius: 3px; background: var(--accent); }
/* Titles here run longer than the lab's, so they sit a size down and stay
   left of the truck. */
@media (min-width: 769px) {
  .hero h1 { font-size: clamp(2.6rem, 4.3vw, 3.5rem); }
  .hero-long h1 { font-size: clamp(2.2rem, 3.5vw, 2.9rem); max-width: none; }
}
.routes { background: var(--bg); }
.rc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.rc-grid.rc-four { grid-template-columns: repeat(4, 1fr); }
.rc { display: flex; flex-direction: column; gap: 0.35rem; padding: 1.5rem; border-radius: 20px; background: var(--surface); box-shadow: 0 1px 0 var(--line), 0 18px 40px -32px rgba(0, 0, 0, 0.35); text-decoration: none; }
.rc h3 { display: flex; align-items: center; gap: 0.45rem; font-size: 1.3rem; }
.rc-pin { flex: none; width: 20px; height: 20px; color: var(--accent-ink); }
.rc .rc-lead { color: var(--ink); font-weight: 600; font-size: 0.98rem; line-height: 1.45; }
.rc p { color: var(--muted); font-size: 0.93rem; }
.rc-meta { align-self: flex-start; padding: 0.25rem 0.65rem; border-radius: 999px; background: var(--tint); color: var(--ink); font-size: 0.74rem; font-weight: 700; }
.rc-link { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s; }
.rc-link:hover { transform: translateY(-4px); box-shadow: 0 1px 0 var(--line), 0 26px 50px -30px rgba(0, 0, 0, 0.45); }
.rc-go { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: auto; padding-top: 0.8rem; font-size: 0.88rem; font-weight: 700; color: var(--accent-ink); }
.rc-go svg { width: 15px; height: 15px; transition: transform 0.2s; }
.rc-link:hover .rc-go svg { transform: translateX(3px); }
.facts { margin-top: 2.5rem; padding: 2rem; border-radius: 24px; background: var(--dark); color: var(--on-dark); }
.facts h3 { font-size: 1.5rem; margin-bottom: 1.4rem; }
.facts ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem 2rem; }
.facts li { display: flex; gap: 0.85rem; }
.facts i { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--on-accent); }
.facts i svg { width: 15px; height: 15px; }
.facts b { display: block; font-size: 1rem; }
.facts li span { display: block; margin-top: 0.15rem; font-size: 0.92rem; color: var(--on-dark-muted); }
.facts-note { margin-top: 1.6rem; padding-top: 1.3rem; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 0.95rem; color: var(--on-dark-muted); }
.facts-note a { color: var(--accent); font-weight: 700; }
@media (max-width: 1100px) {
  .rc-grid, .rc-grid.rc-four { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  /* Two lines on a phone, so the form keeps its place on the first screen. */
  .hero h1 { font-size: clamp(1.7rem, 7.7vw, 2.2rem); }
  .hero-tag { margin: 0.45rem 0 0; font-size: 0.98rem; }
  .hero-tag::before { width: 18px; }
  .hero-long h1 { font-size: clamp(1.55rem, 7vw, 1.9rem); }
  .rc-grid, .rc-grid.rc-four { grid-template-columns: 1fr; gap: 0.7rem; }
  .rc { padding: 1.2rem; border-radius: 18px; }
  .facts { margin-top: 1.6rem; padding: 1.4rem 1.2rem; border-radius: 20px; }
  .facts ul { grid-template-columns: 1fr; }
}
/* Short phones: the tagline gives way so Get my price stays clear of the
   call dock; the long title steps down again. */
@media (max-width: 768px) and (max-height: 640px) {
  .hero-tag { display: none; }
  .hero-long h1 { font-size: clamp(1.35rem, 6vw, 1.55rem); }
}
</style>
`;

/* --------------------------------------------------------------------- page */

function nycPage(page) {
  const url = `${SITE}/${page.slug}/`;
  const { head, noscript } = tracking();
  let html = LAB;

  // ---- head: the site's real head instead of the lab's
  html = swapOnce(html, '<link rel="preload" as="image" href="/assets/images/lab/hero-mountain.webp" media="(min-width: 769px)">',
    '<link rel="preload" as="image" href="/assets/images/nyc/hero-desktop.webp" media="(min-width: 769px)">', 'preload desktop');
  html = swapOnce(html, '<link rel="preload" as="image" href="/assets/images/lab/hero-mountain-mobile.webp" media="(max-width: 768px)">',
    '<link rel="preload" as="image" href="/assets/images/nyc/hero-mobile.webp" media="(max-width: 768px)">', 'preload mobile');
  html = swapOnce(html, '<html lang="en" data-palette="ember">', '<html lang="en" data-palette="skyblue">', 'html palette');
  html = swapBlock(html, '<!-- Design lab:', '<title>Design Lab — 50STATEMOVERS INC</title>', `${head}
<meta name="theme-color" content="#0f2b44" />
<meta name="description" content="${esc(page.description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(page.title)}" />
<meta property="og:description" content="${esc(page.description)}" />
<meta property="og:image" content="${SITE}/assets/images/og-cover.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="628" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${SITE}/assets/images/og-cover.jpg" />
<title>${page.title}</title>`, 'lab head');
  html = swapOnce(html, '</head>', `${EXTRA_CSS}${schema(page)}\n</head>`, '</head>');
  html = swapOnce(html, '<body>\n', `<body>\n${noscript}\n`, '<body>');

  // ---- strip: no rating; the route line leads
  html = swapAll(html, '<span>4.96★ from 2,400+ reviews</span>', '', 'ticker rating');
  html = swapAll(html, '<span>Our own trucks &amp; crews — no brokers</span>', `<span>${page.ticker}</span><span>The carrier, not a broker</span>`, 'ticker trucks');

  // ---- nav and drawer: Routes in place of Reviews
  html = swapOnce(html, '<a href="#reviews">Reviews</a><a href="#faq">FAQ</a>', '<a href="#routes">Routes</a><a href="#faq">FAQ</a>', 'nav reviews');
  html = swapOnce(html, '<a href="#reviews"><span>05</span>Reviews</a>', '<a href="#routes"><span>05</span>Routes</a>', 'drawer reviews');
  html = swapOnce(html, '<small><i></i>Real people answering now · 24/7</small>', '<small><i></i>Talk to a real person · +1 (888) 505-1086</small>', 'drawer foot');

  // ---- hero
  html = swapOnce(html, '<section class="hero">', `<section class="hero${page.long ? ' hero-long' : ''}">`, 'hero section');
  html = swapOnce(html, '<span class="hero-badge"><b>4.96★</b> Trusted by 2,400+ families</span>',
    '<span class="hero-badge"><b>NYC</b> Licensed interstate carrier · USDOT 4575745</span>', 'hero badge');
  html = swapOnce(html, '<h1>Your whole home,<br><em>state to state.</em></h1>',
    `<h1>${page.h1}</h1>${page.tag ? `\n    <p class="hero-tag">${page.tag}</p>` : ''}`, 'h1');
  html = swapBlock(html, '<p class="hero-lede">', '</p>', `<p class="hero-lede">${page.lede}</p>`, 'hero lede');
  html = swapOnce(html, '<form class="quote-card" id="lab-form" novalidate>',
    `<form class="quote-card" id="lab-form" novalidate data-from="New York"${page.formTo ? ` data-to="${page.formTo}"` : ''} data-name="${esc(page.formName)}">`, 'form');
  html = swapOnce(html, '<span class="qn-rating">★ 4.96 from 2,400+ reviews · </span>', '', 'quote note rating');


  // ---- services: plain cards worded for the page (no links, no service sheets)
  if (page.services) {
    const sv = page.services;
    const start = html.indexOf('<section class="section" id="services"');
    const end = html.indexOf('</section>', start) + '</section>'.length;
    if (start === -1) throw new Error('build-nyc-pages: services section not found');
    let sec = html.slice(start, end);
    sec = swapOnce(sec, '<span class="eyebrow">What we do</span><h2>Services built around <em>your</em> move.</h2>',
      `<span class="eyebrow">${sv.eyebrow}</span><h2>${sv.h2}</h2>`, 'services head');
    sec = sec.replace(/(<div class="section-head reveal">[\s\S]*?<\/div>\s*)<p>[\s\S]*?<\/p>/, `$1<p>${sv.p}</p>`);
    // Links become plain cards: no href, no sheet, no arrows or "explore" lines.
    sec = sec.replace(/<a href="[^"]*" class="tile ([^"]*)"[^>]*>/g, '<div class="tile tile-static $1">').replace(/<\/a>/g, '</div>');
    sec = sec.replace(/\s*<span class="tile-arrow"[^>]*><svg[\s\S]*?<\/svg><\/span>/g, '').replace(/\s*<span class="tile-more">[\s\S]*?<\/svg><\/span>/g, '');
    for (const [name, text] of Object.entries(sv.tiles)) {
      const re = new RegExp('(<h3>' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</h3>\\s*(?:<p>|<\\/h3><p>)?)([\\s\\S]*?)(</p>)');
      if (!re.test(sec)) throw new Error(`build-nyc-pages: service tile "${name}" not found`);
      sec = sec.replace(re, (m, a, b, c) => a + text + c);
    }
    html = html.slice(0, start) + sec + html.slice(end);
  }

  // ---- the page's own routes section, after the proof strip
  html = swapOnce(html, '<section class="section" id="services"', routesSection(page) + '<section class="section" id="services"', 'services section');

  // ---- map plays this page's route
  html = swapOnce(html, '<h2>Every state, <em>every route.</em></h2>', '<h2>From New York, <em>to every state.</em></h2>', 'coverage h2');
  html = swapOnce(html, 'We move homes between all 48 continental states and D.C. — these are just some of the routes we run. Pick yours to see it on the map.',
    page.coverage
      ? 'We move homes from New York to every one of the 48 continental states and D.C. Pick your route to see it on the map.'
      : 'These are some of the routes we run out of New York, and we cover all 48 continental states and D.C. Pick yours to see it on the map.', 'coverage lede');
  html = swapOnce(html, '<div class="cov-map reveal" id="cov-map">', `<div class="cov-map reveal" id="cov-map"${page.coverage ? ` data-coverage="${page.coverage}" data-home="New York"` : ` data-network="${page.network}"`}>`, 'map');

  // ---- no reviews section; the page's FAQ
  html = swapBlock(html, '<section class="section" id="reviews">', '</section>\n\n', '', 'reviews section');
  html = swapBlock(html, '<section class="section" id="faq"', '</section>', faqSection(page), 'faq section');

  // ---- closing band and quote pill: same-day, as on the live site
  html = swapOnce(html, "You'll have a fixed, written price — usually within the hour.", "You'll have a fixed, written price the same day.", 'cta line');
  html = swapOnce(html, '<small>Fixed price · reply within the hour</small>', '<small>Fixed, written price · same day</small>', 'pill line');

  // ---- footer: NYC routes and both legal pages
  html = swapOnce(html, '<li><a href="#services">White glove</a></li>',
    '<li><a href="/nyc-long-distance-movers/">NYC long distance</a></li><li><a href="/nyc-to-florida-long-distance-movers/">NYC to Florida</a></li><li><a href="/nyc-to-north-carolina-and-georgia-movers/">NYC to NC &amp; GA</a></li><li><a href="/nyc-long-distance-movers-to-texas-california-chicago-and-boston/">NYC to TX, CA, Chicago &amp; Boston</a></li>', 'footer services');
  html = swapOnce(html, '<li><a href="#reviews">Reviews</a></li>', '', 'footer reviews');
  html = swapOnce(html, '<li><a href="/privacy-policy">Privacy</a></li>', '<li><a href="/privacy-policy">Privacy</a></li><li><a href="/terms-of-service">Terms</a></li>', 'footer legal');

  // ---- no palette switcher
  html = swapBlock(html, '<div class="lab" role="group"', '<span class="lab-name" id="lab-name">Ember</span>\n</div>\n', '', 'palette switcher');

  return html;
}

for (const page of PAGES) {
  const out = path.join(ROOT, page.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, nycPage(page));
  console.log(`Generated /${page.slug}/`);
}

