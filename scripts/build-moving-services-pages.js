#!/usr/bin/env node
/* Four landing pages in the new layout:
 *
 *   /long-distance-movers-washington-dc/   Washington, D.C. city page
 *   /long-distance-moving-services/        nationwide
 *   /cross-country-moving-services/        nationwide
 *   /interstate-moving-services/           nationwide
 *
 * The template is the live NYC Long Distance page (nyc-long-distance-movers/
 * index.html), so these pages carry its current layout, tracking and scripts
 * as they stand. Each page swaps in its own head (title, description,
 * canonical, Open Graph, JSON-LD), hero, cards, notes box, FAQ and footer.
 *
 * The hero uses the design lab's own photo: the NYC street photo is dropped
 * along with the CSS that positioned it.
 *
 * No prices, review counts or ratings, as on every other page here.
 * Every anchor string below must still exist in the template: if the NYC page
 * changes, the build fails loudly rather than shipping a half-swapped page.
 *
 *   node scripts/build-moving-services-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.50statemovers.com';
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'nyc-long-distance-movers', 'index.html'), 'utf8');

const DC = '/long-distance-movers-washington-dc/';
const LONG = '/long-distance-moving-services/';
const CROSS = '/cross-country-moving-services/';
const INTER = '/interstate-moving-services/';

// The four pages link to each other from the drawer and the footer.
const CLUSTER = [
  [LONG, 'Long-distance moving services'],
  [CROSS, 'Cross-country moving services'],
  [INTER, 'Interstate moving services'],
  [DC, 'Long distance movers Washington DC'],
];

const NATIONWIDE = {
  badge: 'USA',
  from: '',
  coverageH2: 'Every state, <em>every route.</em>',
  coverageP: 'We move homes between all 48 continental states and D.C. Pick your route to see it on the map.',
  coverage: 'burst',
};

/* ------------------------------------------------------------ copy per page */

const PAGES = [
  {
    slug: 'long-distance-movers-washington-dc',
    title: 'Long Distance Movers Washington DC | Binding Prices — 50STATEMOVERS INC',
    description:
      'Long distance movers in Washington, DC: one licensed crew from your D.C. door to any state, a binding written estimate and $1M liability coverage.',
    h1: 'Long Distance Movers<br><em>Washington DC</em>',
    crumb: 'Long Distance Movers Washington DC',
    serviceType: 'Long distance moving',
    city: true,
    hero: 'dc',
    badge: 'D.C.',
    from: 'Washington D.C.',
    coverageH2: 'From Washington, D.C., <em>to every state.</em>',
    coverageP: 'We move homes from the District to every one of the 48 continental states. Pick your route to see it on the map.',
    coverage: 'burst',
    tag: 'One crew, one written price',
    lede: 'Leaving the District for another state? One binding, written price for the whole move, and one licensed crew from your D.C. door to your new one.',
    ticker: 'Long distance from Washington, D.C.',
    formName: 'Long Distance Movers Washington DC page',
    factsTitle: 'Moving out of a Washington, D.C. building',
    facts: [
      ['Emergency No Parking signs', 'D.C. has no loading zones you can count on. The District\'s transportation department issues temporary no-parking signs for move day; we tell you when to apply so the curb is clear when the truck pulls up.'],
      ['Reserved elevator and COI', 'Apartment and condo buildings from Navy Yard to Dupont Circle book the service elevator in set windows and want a certificate of insurance first. Send us the building\'s rules and we arrange both.'],
      ['Rowhouses and tight stairs', 'Capitol Hill and Georgetown rowhouses have narrow staircases and front steps straight onto the sidewalk. We plan the crew, the padding and any disassembly around them.'],
      ['Parkways closed to trucks', 'Commercial vehicles are barred from Rock Creek Parkway and the George Washington Memorial Parkway, so the truck\'s route in and out of your street is planned before move day.'],
    ],
    note: 'More on what we offer: <a href="' + LONG + '">long-distance moving services</a>, <a href="' + CROSS + '">cross-country moving services</a> and <a href="' + INTER + '">interstate moving services</a>, or every destination on <a href="/moving-from-washington-dc/">moving from Washington, D.C.</a>',
    faqH2: 'D.C. long distance moves, <em>answered.</em>',
    faqP: 'What Washingtonians ask before booking. If yours isn\'t here, call — a real person picks up.',
    faq: [
      ['Do I need a parking permit for the moving truck in D.C.?',
       'Usually, yes. Most D.C. streets have no space a long distance truck can rely on, so you request temporary Emergency No Parking signs from the District Department of Transportation for move day. Apply early; the signs must go up days ahead. We tell you how much curb we need and when.'],
      ['Which parts of Washington, D.C. do you pick up from?',
       'All eight wards, from Georgetown, Foggy Bottom and Dupont Circle to Capitol Hill, Navy Yard, Columbia Heights and Anacostia, plus the nearby suburbs in Maryland and Virginia. If you are not sure your address is covered, call and we will tell you straight away.'],
      ['Is my D.C. move handled by you or passed to another company?',
       'By us. We are a licensed interstate carrier (USDOT 4575745, MC-1820728), not a broker. The crew that packs your home in the District is the crew that delivers it, and your move is never sold on to someone else.'],
      ['What does a binding estimate mean on a move out of D.C.?',
       'It means the number on your written estimate is the number you pay. We build it from a video or in-home survey of what you are moving and where it is going, and it does not change because of traffic on I-95 or the Beltway.'],
      ['How far ahead should I book a long distance move from Washington?',
       'Four to six weeks is comfortable. Allow six to eight around the end of the month in late spring and summer, when leases turn over and many government and military households relocate. Shorter notice is often possible, so call anyway.'],
    ],
  },
  {
    slug: 'long-distance-moving-services',
    title: 'Long-Distance Moving Services | Packing & Storage — 50STATEMOVERS INC',
    description:
      'Long-distance moving services in all 48 states: packing, crating, furniture disassembly, climate-controlled storage and delivery, on one binding written estimate.',
    h1: 'Long-Distance<br><em>Moving Services</em>',
    crumb: 'Long-Distance Moving Services',
    serviceType: 'Long-distance moving',
    ...NATIONWIDE,
    tag: 'Everything your move needs, one crew',
    lede: 'Packing, crating, storage and delivery between any of the 48 states — chosen to fit your home and priced together on one binding written estimate.',
    ticker: 'Full-service long-distance moves',
    formName: 'Long-Distance Moving Services page',
    routesEyebrow: 'What is included',
    routesH2: 'Long-distance services, <em>built around you.</em>',
    routesP: 'Take as much or as little as you need. Each service below is carried out by our own crew and listed line by line on your written estimate, so you can see exactly what you are paying for.',
    cards: [
      { name: 'Full packing', meta: 'Whole home',
        text: 'We bring the boxes, paper and wrap, pack every room the day before loading and label each carton by room so the unload in your new home goes quickly.' },
      { name: 'Partial and fragile packing', meta: 'Your choice',
        text: 'Pack the books and clothes yourself and leave the kitchen, glassware, mirrors and lamps to us. It is the most popular way to split the work.' },
      { name: 'Custom crating', meta: 'Art &amp; antiques',
        text: 'Wooden crates built to size for marble tops, framed art, sculpture and heirloom pieces that a blanket alone will not protect over a thousand miles.' },
      { name: 'Disassembly and reassembly', meta: 'Furniture',
        text: 'Beds, dining tables, wardrobes and sectionals taken apart to clear narrow stairwells and tight corridors, then put back together at the far end.' },
      { name: 'Climate-controlled storage', meta: 'Short or long term',
        text: 'When a closing slips or a new lease starts late, your shipment waits in a monitored, climate-controlled facility, still inventoried and insured, until you are ready.' },
      { name: 'Delivery and set-up', meta: 'Room by room',
        text: 'Every piece goes into the room you point to, beds are built, and the crew takes the packing debris away before they leave, if you ask.' },
    ],
    factsTitle: 'How a long-distance move is priced',
    facts: [
      ['Weight and inventory, not room count', 'Two one-bedroom apartments can differ by thousands of pounds. A video or in-home survey of what you own is what sets the price.'],
      ['Distance and route', 'A three-hundred-mile move and a two-thousand-mile move need different trucks, drivers and days on the road. The route is fixed in the estimate.'],
      ['Access at both ends', 'Stairs, long carries, elevator windows and street permits all affect the crew size and time, so we ask about them up front.'],
      ['The services you choose', 'Packing, crating and storage are listed line by line. Add or remove them and you see the estimate change before you sign.'],
    ],
    note: 'Going coast to coast? See <a href="' + CROSS + '">cross-country moving services</a>. Moving to the next state over? See <a href="' + INTER + '">interstate moving services</a>.',
    faqH2: 'Long-distance services, <em>answered.</em>',
    faqP: 'What people ask about our long-distance services before booking. If yours isn\'t here, call — a real person picks up.',
    faq: [
      ['What is included in your long-distance moving services?',
       'Every move includes loading, padding and wrapping of furniture, transport on our own truck, and unloading into the rooms you choose. Packing, fragile-only packing, custom crating, furniture disassembly, storage and debris removal are optional, and each is listed separately on your estimate.'],
      ['Can I pack some things myself and have you pack the rest?',
       'Yes. Partial packing is common: you pack books, clothes and linens, and we pack the kitchen, glassware, art, mirrors and lamps. Tell us at the survey and the estimate reflects exactly what we pack.'],
      ['Do you offer storage between my old home and my new one?',
       'Yes. We hold your shipment in a climate-controlled, monitored facility for a few days or several months, then deliver when you have the keys. It stays on the same inventory and under the same coverage the whole time.'],
      ['How do you protect antiques and art on a long-distance move?',
       'Fine pieces are wrapped in moving blankets and stretch wrap, and anything with glass, stone or a fragile frame can travel in a custom wooden crate built to its size. Point them out at the survey so the crating is planned and priced in advance.'],
      ['What counts as a long-distance move?',
       'Generally any move of more than about 100 miles, or any move that crosses a state line. Long-distance moves are priced on the weight of your shipment and the route rather than by the hour.'],
      ['What protection do I get on my belongings?',
       'Every interstate move comes with the basic released-value liability required by federal rules, and you can choose Full Value Protection for a higher level of cover. We explain both options before you book so you can choose.'],
    ],
  },
  {
    slug: 'cross-country-moving-services',
    title: 'Cross-Country Moving Services | Coast-to-Coast Movers — 50STATEMOVERS INC',
    description:
      'Cross-country moving services coast to coast across all 48 states. One licensed crew, one truck with no transfers, and one binding written estimate.',
    h1: 'Cross-Country<br><em>Moving Services</em>',
    crumb: 'Cross-Country Moving Services',
    serviceType: 'Cross-country moving',
    ...NATIONWIDE,
    tag: 'Coast to coast on one truck',
    lede: 'From one coast to the other in a single move: your home stays on our truck with our crew for the whole drive, on a binding price written down before we load.',
    ticker: 'Coast-to-coast moves',
    formName: 'Cross-Country Moving Services page',
    routesEyebrow: 'Coast to coast',
    routesH2: 'Cross-country routes <em>we run.</em>',
    routesP: 'Some of the long hauls we run most often, with the rough road distance. Whatever your route, the transit window is written into your contract before the truck leaves.',
    cards: [
      { name: 'New York to Los Angeles', meta: 'about 2,800 miles',
        text: 'The classic crossing. California inspects loads for plants and produce at its borders, so leave those behind and we pack the rest for a week on the road.' },
      { name: 'Boston to Seattle', meta: 'about 3,050 miles',
        text: 'The longest drive in the lower 48. The route crosses the northern Rockies, so in winter we watch the mountain passes and build weather into your delivery window.' },
      { name: 'Miami to San Diego', meta: 'about 2,650 miles',
        text: 'Corner to corner along the southern interstates. Summer heat on both ends is hard on electronics and candles, so heat-sensitive items ride mid-load.' },
      { name: 'Washington, D.C. to San Francisco', meta: 'about 2,800 miles',
        text: 'Steep streets and hillside driveways at the far end mean we confirm how the truck reaches your door, and whether a smaller shuttle is needed, before delivery day.' },
      { name: 'Chicago to Phoenix', meta: 'about 1,750 miles',
        text: 'From Midwest winters to the desert. Newer Phoenix suburbs often have HOA rules on trucks and delivery hours, which the crew works within.' },
      { name: 'Atlanta to Denver', meta: 'about 1,400 miles',
        text: 'Halfway across the country and a mile high. Front Range neighbourhoods can have tight cul-de-sacs, so we check the approach before we set off.' },
    ],
    factsTitle: 'What changes on a coast-to-coast move',
    facts: [
      ['One truck, no transfers', 'Your shipment is loaded at your door and stays on the same truck to the other coast. It is not cross-docked at a warehouse and reloaded onto someone else\'s trailer.'],
      ['Packed for a week on the road', 'Three time zones of interstate means extra padding, tiered loading and straps on every row, so nothing shifts between the Atlantic and the Pacific.'],
      ['A delivery window in writing', 'Cross-country moves run on a delivery window rather than a single day. Yours is set before loading and written into your contract.'],
      ['Storage at the far end', 'If you fly ahead and your new place is not ready, we hold the shipment in climate-controlled storage and deliver when you are.'],
    ],
    note: 'Moving a shorter distance? See <a href="' + INTER + '">interstate moving services</a>, or what you can add on <a href="' + LONG + '">long-distance moving services</a>.',
    faqH2: 'Cross-country moves, <em>answered.</em>',
    faqP: 'What people moving to the other side of the country ask first. If yours isn\'t here, call — a real person picks up.',
    faq: [
      ['How long does a cross-country move take?',
       'Driving time coast to coast is roughly five to eight days for a moving truck, and your delivery window is set in your contract before we load. Distance, the season and weather in the mountain passes all play a part.'],
      ['Will my things be moved to another truck on the way?',
       'No. Your shipment is loaded onto our truck at your old home and delivered from that same truck. There is no warehouse transfer in the middle of the country and no broker passing your load to another carrier.'],
      ['Can I bring plants on a cross-country move?',
       'It is best not to. Several states, California in particular, inspect for plants, soil and fresh produce that could carry pests, and a moving truck on a week-long drive is no place for houseplants. Give them away or take a few in your car.'],
      ['What if I arrive before my new home is ready?',
       'We can hold your shipment in climate-controlled storage and deliver once you have the keys. It stays inventoried and insured, and the storage is listed on your estimate so there are no surprises.'],
      ['Do you move cars as well as household goods?',
       'Tell us about any vehicles when you request your quote and we will talk you through the options for getting them across the country alongside your household move.'],
      ['How do I prepare for a cross-country move?',
       'Book your survey four to eight weeks ahead, check parking and elevator rules at both addresses, and set aside documents, medication and valuables to travel with you rather than on the truck.'],
    ],
  },
  {
    slug: 'interstate-moving-services',
    title: 'Interstate Moving Services | Licensed State-to-State Movers — 50STATEMOVERS INC',
    description:
      'Interstate moving services from a licensed carrier (USDOT 4575745). Moves across any state line in the lower 48, on one binding written estimate.',
    h1: 'Interstate<br><em>Moving Services</em>',
    crumb: 'Interstate Moving Services',
    serviceType: 'Interstate moving',
    ...NATIONWIDE,
    tag: 'Licensed for every state line',
    lede: 'Next door or across the country, any move over a state line is an interstate move. We hold the federal authority to carry it, with one crew and one binding written price.',
    ticker: 'Licensed interstate carrier',
    formName: 'Interstate Moving Services page',
    routesEyebrow: 'State to state',
    routesH2: 'Every kind of <em>interstate move.</em>',
    routesP: 'An interstate move can be ten miles or three thousand. These are the kinds we run every week, all carried under the same federal licence and paperwork.',
    cards: [
      { name: 'Across the line next door', meta: 'under 100 miles',
        text: 'Manhattan to New Jersey, D.C. to Arlington, Kansas City across the state line. Short, but still interstate, with the same licence and protections as a long haul.' },
      { name: 'Regional moves', meta: '100–500 miles',
        text: 'Boston to Philadelphia, Chicago to Minneapolis, Dallas to Houston and on to New Orleans. Usually loaded and delivered within a few days.' },
      { name: 'Up and down the East Coast', meta: 'up to 1,300 miles',
        text: 'The I-95 corridor from New England to Florida is the busiest interstate lane in the country, and one we run constantly.' },
      { name: 'Midwest to the Sun Belt', meta: '800–1,500 miles',
        text: 'Ohio, Michigan and Illinois to Texas, Arizona, the Carolinas and Florida — warmer weather, newer homes and HOA move-in rules we plan around.' },
      { name: 'Out West', meta: '300–1,200 miles',
        text: 'California to Nevada, Arizona, Oregon, Idaho and Texas. Mountain passes and desert heat both shape how the truck is packed and when it runs.' },
      { name: 'Coast to coast', meta: '2,000+ miles',
        text: 'The longest interstate moves, packed for a week on the road. See our cross-country moving services for how those are handled.', href: CROSS },
    ],
    factsTitle: 'What makes a move interstate',
    facts: [
      ['Any state line, any distance', 'Federal rules treat a move as interstate when it crosses a state line. A short move from one state to the next qualifies just like a cross-country one.'],
      ['Federal licensing', 'Interstate movers must be registered with the FMCSA. Ours: USDOT 4575745 and MC-1820728 — you can look both up on the FMCSA website before you book.'],
      ['Your rights, in writing', 'Before your move you receive the FMCSA booklet "Your Rights and Responsibilities When You Move", along with a written estimate and an inventory.'],
      ['Liability you choose', 'Interstate moves carry basic released-value liability by law, and you can choose Full Value Protection instead. We explain both before you sign.'],
    ],
    note: 'See the packing, crating and storage you can add on <a href="' + LONG + '">long-distance moving services</a>, or our <a href="' + DC + '">long distance movers in Washington, DC</a>.',
    faqH2: 'Interstate moves, <em>answered.</em>',
    faqP: 'What people ask before moving to another state. If yours isn\'t here, call — a real person picks up.',
    faq: [
      ['What is an interstate move?',
       'Any household move that crosses a state line, whatever the distance. Interstate moves are regulated by the Federal Motor Carrier Safety Administration (FMCSA), so the mover must hold a USDOT number and interstate operating authority.'],
      ['How do I check that an interstate mover is licensed?',
       'Ask for the mover\'s USDOT and MC numbers and look them up on the FMCSA website. Ours are USDOT 4575745 and MC-1820728. A licensed interstate carrier must also give you the "Your Rights and Responsibilities When You Move" booklet.'],
      ['What is the difference between an interstate carrier and a broker?',
       'A carrier owns the trucks and employs the crew that moves you. A broker sells your move and hands it to a carrier you may never have heard of. We are the carrier: the people who survey your home are the people who move it.'],
      ['Do you charge by the hour for short interstate moves?',
       'No. Interstate moves are priced on a binding written estimate built from your inventory, access at both ends and the route, so the figure does not grow if traffic is heavy on move day.'],
      ['What paperwork will I receive for an interstate move?',
       'A written estimate, an order for service, a bill of lading and an inventory of everything loaded, plus the FMCSA rights booklet. Keep the bill of lading and inventory together until your delivery is checked off.'],
    ],
  },
];

/* ---------------------------------------------------------------- hero css */

// Hero photos per page. The D.C. truck crosses a Potomac bridge with the
// Capitol and the Monument on the skyline. On desktop the photo is pinned to
// the right edge at a set width, so on wider screens the truck moves clear of
// the copy and the space on the left runs into the dark wash; and on desktop the photo stops above the quote form (as on
// the NYC pages) so the whole truck shows.
const HERO_CSS = {
  dc: `/* D.C. hero: the truck on a Potomac bridge, the Capitol on the skyline. */
@media (min-width: 769px) {
  .hero::before {
    background:
      linear-gradient(90deg, var(--dark) calc(100% - max(1260px, 66%)), rgba(var(--wash), 0.9) calc(100% - max(1260px, 66%) + 180px), rgba(var(--wash), 0.62) max(40%, calc(100% - max(1260px, 66%) + 380px)), rgba(var(--wash), 0) max(56%, calc(100% - max(1260px, 66%) + 620px))),
      linear-gradient(180deg, rgba(var(--wash), 0.45) 0%, rgba(var(--wash), 0) 24%, rgba(var(--wash), 0) 88%, var(--dark) 100%),
      var(--dark) url('/assets/images/dc/hero-desktop.webp') right 62% / max(1260px, 66%) auto no-repeat;
    bottom: auto; height: calc(var(--photo-h, 100%) - 190px);
  }
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
      var(--dark) url('/assets/images/dc/hero-mobile.webp') center -64vw / 100% auto no-repeat;
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
      var(--dark) url('/assets/images/dc/hero-mobile.webp') center -68vw / 100% auto no-repeat;
  }
}
`,
};

/* ------------------------------------------------------------------ helpers */

function swapOnce(html, from, to, label) {
  const i = html.indexOf(from);
  if (i === -1) throw new Error(`build-moving-services-pages: "${label}" not found in the NYC template`);
  return html.slice(0, i) + to + html.slice(i + from.length);
}
function swapBlock(html, start, end, to, label) {
  const i = html.indexOf(start);
  const j = i === -1 ? -1 : html.indexOf(end, i);
  if (i === -1 || j === -1) throw new Error(`build-moving-services-pages: block "${label}" not found in the NYC template`);
  return html.slice(0, i) + to + html.slice(j + end.length);
}
const esc = s => s.replace(/&(?!amp;|#)/g, '&amp;').replace(/"/g, '&quot;');
const text = s => s.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

function schema(page) {
  const url = `${SITE}/${page.slug}/`;
  const area = page.city
    ? { '@type': 'City', name: 'Washington, D.C.', containedInPlace: { '@type': 'Country', name: 'United States' } }
    : { '@type': 'Country', name: 'United States' };
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
      areaServed: area,
    },
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: text(page.h1),
      serviceType: page.serviceType,
      description: page.description,
      provider: { '@id': `${url}#business` },
      areaServed: area,
      url,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: page.crumb, item: url },
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
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

function routesSection(page) {
  const cards = page.cards.map(c => {
    const inner = `<span class="rc-meta">${c.meta}</span><h3>${c.name}</h3><p>${c.text}</p>`;
    return c.href
      ? `      <a class="rc rc-link reveal" href="${c.href}">${inner}<span class="rc-go">Read more ${ARROW}</span></a>`
      : `      <div class="rc reveal">${inner}</div>`;
  }).join('\n');
  // Sits right above the notes box, which brings its own top spacing.
  return `<section class="section routes" id="routes" style="padding-bottom: 0;">
  <div class="wrap">
    <div class="section-head reveal">
      <div><span class="eyebrow">${page.routesEyebrow}</span><h2>${page.routesH2}</h2></div>
      <p>${page.routesP}</p>
    </div>
    <div class="rc-grid${page.cards.length === 4 ? ' rc-four' : ''}">
${cards}
    </div>
  </div>
</section>`;
}

function notesSection(page) {
  const facts = page.facts.map(([t, d]) => `        <li><i>${CHECK}</i><div><b>${t}</b><span>${d}</span></div></li>`).join('\n');
  return `<div class="facts reveal" style="margin-top: 0;">
      <h3>${page.factsTitle}</h3>
      <ul>
${facts}
      </ul>
      <p class="facts-note">${page.note}</p>
    </div>`;
}

/* --------------------------------------------------------------------- page */

function buildPage(page) {
  const url = `${SITE}/${page.slug}/`;
  let html = TEMPLATE;

  // ---- head
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(page.description)}" />`);
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(page.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(page.description)}" />`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  html = swapOnce(html, '<meta name="twitter:card" content="summary_large_image" />',
    `<meta property="og:site_name" content="50STATEMOVERS INC" />\n<meta property="og:locale" content="en_US" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${esc(page.title)}" />\n<meta name="twitter:description" content="${esc(page.description)}" />`, 'twitter card');
  const heroDesk = page.hero ? `/assets/images/${page.hero}/hero-desktop.webp` : '/assets/images/lab/hero-mountain.webp';
  const heroMob = page.hero ? `/assets/images/${page.hero}/hero-mobile.webp` : '/assets/images/lab/hero-mountain-mobile.webp';
  html = swapOnce(html, '<link rel="preload" as="image" href="/assets/images/nyc/hero-desktop.webp" media="(min-width: 769px)">',
    `<link rel="preload" as="image" href="${heroDesk}" media="(min-width: 769px)">`, 'preload desktop');
  html = swapOnce(html, '<link rel="preload" as="image" href="/assets/images/nyc/hero-mobile.webp" media="(max-width: 768px)">',
    `<link rel="preload" as="image" href="${heroMob}" media="(max-width: 768px)">`, 'preload mobile');
  // The NYC street photo and its positioning go: the page's own photo takes
  // its place, or the lab's own hero stays.
  html = swapBlock(html, '/* NYC hero.', '/* Static service cards', (page.hero ? HERO_CSS[page.hero] : '') + '/* Static service cards', 'NYC hero css');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, schema(page));

  // ---- ticker, drawer
  html = html.split('<span>Flat-rate routes nationwide</span>').join(`<span>${page.ticker}</span>`);
  html = swapBlock(html, '<div class="drawer-more">', '</div>',
    `<div class="drawer-more">\n    <p>Popular</p>\n${CLUSTER.map(([h, t]) => `    <a href="${h}">${t}</a>`).join('\n')}\n  </div>`, 'drawer more');

  // ---- hero
  html = swapOnce(html, '<section class="hero">', '<section class="hero hero-long">', 'hero section');
  html = swapOnce(html, '<span class="hero-badge"><b>NYC</b>', `<span class="hero-badge"><b>${page.badge}</b>`, 'hero badge');
  html = html.replace(/<h1>[\s\S]*?<\/h1>\s*<p class="hero-tag">[^<]*<\/p>/, `<h1>${page.h1}</h1>\n    <p class="hero-tag">${page.tag}</p>`);
  html = swapBlock(html, '<p class="hero-lede">', '</p>', `<p class="hero-lede">${page.lede}</p>`, 'hero lede');
  html = swapOnce(html, 'data-from="New York" data-name="NYC Long Distance Movers page"',
    `${page.from ? `data-from="${page.from}" ` : ''}data-name="${esc(page.formName)}"`, 'form');

  // ---- coverage map
  html = swapOnce(html, '<h2>From New York City, <em>to every state.</em></h2>', `<h2>${page.coverageH2}</h2>`, 'coverage h2');
  html = swapOnce(html, 'We move homes from New York City to every one of the 48 continental states and D.C. Pick your route to see it on the map.', page.coverageP, 'coverage lede');
  html = swapOnce(html, 'data-coverage="burst" data-home="New York"',
    `data-coverage="${page.coverage}"${page.from ? ` data-home="${page.from}"` : ''}`, 'map');
  // With no home state (the nationwide pages) the colour wave rolls out from
  // the middle of the map, but no route starts there: each state's line comes
  // from a state on the far side of the country (states taken west to east,
  // each paired a third or half of the way along), and the running dots
  // follow those lines. No state is marked as home and no home dot is drawn.
  if (!page.from) {
    html = swapOnce(html, "        var p = map.s[n]; return { n: n, p: p, dist: Math.hypot(p[1] - h[1], p[2] - h[2]), d: arcPath(h, p).d };",
      "        var p = map.s[n], r = arcPath(one ? h : map.s[pair(n)], p); return { n: n, p: p, dist: Math.hypot(p[1] - h[1], p[2] - h[2]), d: r.d, len: r.len };", 'burst arcs');
    html = swapOnce(html, "      box.classList.add('is-wave', 'is-burst');\n",
      "      box.classList.add('is-wave', 'is-burst');\n" +
      "      var west = Object.keys(map.s).sort(function (a, b) { return map.s[a][1] - map.s[b][1]; });\n" +
      "      var pair = function (n) { var i = west.indexOf(n), k = west.length; return west[(i + Math.floor(k / (i % 2 ? 3 : 2))) % k]; };\n", 'burst pairs');
    html = swapOnce(html, 'dur = 1.2 + o.dist / 500;', 'dur = 1.2 + (one ? o.dist : o.len) / 500;', 'runner speed');
    html = swapOnce(html, "var home = box.dataset.home || 'New York', h = map.s[home];\n      box.classList.add('is-wave', 'is-burst');",
      "var home = box.dataset.home || '', one = map.s[home] ? 1 : 0, h = map.s[home] || [null, map.w / 2, map.h / 2];\n      box.classList.add('is-wave', 'is-burst');", 'burst home');
    html = swapOnce(html, "'<g class=\"burst-live\"></g>' +\n        '<circle class=\"map-home-ring\" cx=\"' + h[1] + '\" cy=\"' + h[2] + '\" r=\"9\"/><circle class=\"map-home\" cx=\"' + h[1] + '\" cy=\"' + h[2] + '\" r=\"8\"/>';",
      "'<g class=\"burst-live\"></g>' +\n        (one ? '<circle class=\"map-home-ring\" cx=\"' + h[1] + '\" cy=\"' + h[2] + '\" r=\"9\"/><circle class=\"map-home\" cx=\"' + h[1] + '\" cy=\"' + h[2] + '\" r=\"8\"/>' : '');", 'burst home dot');
    html = swapOnce(html, 'countEl.textContent = order.length + 1;', 'countEl.textContent = order.length + one;', 'burst settle count');
    html = swapOnce(html, "group.querySelector('[data-s=\"' + home + '\"]').classList.add('is-home');\n        box.classList.add('is-counting'); countEl.textContent = 1;",
      "if (one) group.querySelector('[data-s=\"' + home + '\"]').classList.add('is-home');\n        box.classList.add('is-counting'); countEl.textContent = one;", 'burst start count');
    html = swapOnce(html, 'countEl.textContent = next + 2;', 'countEl.textContent = next + 1 + one;', 'burst tick count');
  }

  // ---- routes: this page's cards in place of the "all 48 states" banner
  // The D.C. page has none; on the nationwide pages they sit after On moving
  // day, just above the notes box.
  html = swapBlock(html, '<section class="section routes" id="routes">', '</section>\n\n', '', 'routes section');
  if (page.cards) {
    html = swapOnce(html, '<section class="section notes" id="notes"', routesSection(page) + '\n\n<section class="section notes" id="notes"', 'notes section');
  } else {
    html = swapOnce(html, '<a href="#routes">Routes</a>', '', 'nav routes');
    html = swapOnce(html, '    <a href="#routes"><span>05</span>Routes</a>\n', '', 'drawer routes');
    html = swapOnce(html, '<a href="#faq"><span>06</span>FAQ</a>', '<a href="#faq"><span>05</span>FAQ</a>', 'drawer faq number');
  }

  // ---- notes box
  html = swapBlock(html, '<div class="facts reveal" style="margin-top: 0;">', '</p>\n    </div>', notesSection(page), 'facts');

  // ---- FAQ
  html = swapOnce(html, '<h2>NYC long distance moves, <em>answered.</em></h2>', `<h2>${page.faqH2}</h2>`, 'faq h2');
  html = swapOnce(html, "<p>What New Yorkers ask before booking. If yours isn't here, call — a real person picks up.</p>", `<p>${page.faqP}</p>`, 'faq lede');
  html = html.replace(/(<div class="reveal">\n)\s*<details open>[\s\S]*?<\/details>\n(    <\/div>\n  <\/div>\n<\/section>)/,
    (m, a, b) => a + page.faq.map(([q, ans], i) => `      <details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${ans}</p></details>`).join('\n') + '\n' + b);
  if (!html.includes(page.faq[0][0])) throw new Error('build-moving-services-pages: FAQ list not swapped');

  // ---- footer: the cluster (the nationwide pages leave out the D.C. page)
  html = html.replace(/(<div><h4>Services<\/h4><ul>)[\s\S]*?(<\/ul><\/div>)/,
    (m, open, close) => open + CLUSTER.filter(([h]) => page.city || h !== DC).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('') + close);

  // ---- scripts: New York City labels and the Manhattan point are NYC-only
  html = swapOnce(html, "sel.add(new Option(s === 'New York' ? 'New York City' : s, s));", 'sel.add(new Option(s, s));', 'nyc option');
  html = swapOnce(html, "    // These pages pick up in the city, so New York reads as New York City.\n    var place_ = function (s) { return s === 'New York' ? 'New York City' : s; };",
    '    var place_ = function (s) { return s; };', 'nyc helper');
  html = swapBlock(html, '      // These pages start in New York City: put New York', "map.s['New York'][2] = 208; }\n", '', 'nyc point');

  const left = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').match(/.{0,60}(NYC|New York City|New Yorker).{0,60}/);
  if (left) throw new Error(`build-moving-services-pages: NYC copy left on /${page.slug}/: ${left[0]}`);
  return html;
}

for (const page of PAGES) {
  const out = path.join(ROOT, page.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildPage(page));
  console.log(`Generated /${page.slug}/`);
}
