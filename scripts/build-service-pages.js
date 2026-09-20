#!/usr/bin/env node
/* Service landing pages — /long-distance-movers/ and /interstate-movers/.
 *
 * Both wear the homepage's layout, because that is the page that converts and
 * keeping three hand-maintained copies of it would guarantee drift. So the
 * homepage IS the template: this reads index.html at build time and swaps the
 * copy that has to differ — title, description, canonical, the headline, every
 * section heading and lede, the process and moving-day steps, the whole FAQ,
 * and the JSON-LD. Everything else (nav, hero form, coverage grid, service
 * cards, gallery, reviews, footer) is shared on purpose.
 *
 * Every `from` string below must still exist in index.html: if the homepage is
 * reworded, the build fails loudly here rather than shipping a page with the
 * homepage's words on it. Fix the string, don't delete the swap.
 *
 *   node scripts/build-service-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.50statemovers.com';
const HOME = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ------------------------------------------------------------ copy per page */

const PAGES = [
  {
    slug: 'long-distance-movers',
    title: 'Long Distance Movers | Fixed-Price Cross-Country Moving — 50STATEMOVERS INC',
    description:
      'Long distance movers running our own trucks and crews coast to coast. Binding fixed prices, $1M coverage, no brokers and no surprise charges on delivery day.',
    ogTitle: '50STATEMOVERS INC — Long Distance Movers',
    ogDescription:
      'Cross-country household and office moves at a binding fixed price. Licensed, bonded and insured, door to door across the continental US.',
    schemaDescription:
      'Long distance moving company handling cross-country household and office relocations across the continental United States at binding fixed prices.',
    h1: 'Long Distance <em>Movers</em>',
    coverageH2: 'Cross-country hauls, <em>coast to coast.</em>',
    coverageP:
      'Two thousand miles or two states over, the long haul is the same promise: our own crew loads you, our own truck carries you, and the delivery date is the one written in your contract.',
    servicesH2: 'Long distance moves, <em>built to the mile.</em>',
    servicesP:
      'Distance changes a move. Everything has to survive days on the road, and nothing can be driven back for. Pick the level of help you want and we plan the load around the miles it has to cover.',
    processH2: 'How a long-haul move <em>actually</em> runs.',
    processP:
      'Survey, binding quote, load, delivery. Four steps across the whole country, with the price and the dates fixed before the truck is loaded.',
    processSteps: [
      ['Survey', 'A video or in-home walkthrough. On a long haul the weight decides the price, so we count every room before quoting.'],
      ['Binding Quote', 'A written price for the full distance, itemized line by line. It does not move because the scale reading did.'],
      ['Load Day', 'Our crew loads and inventories your shipment, tiers it and straps it for days of highway, not a crosstown hop.'],
      ['Delivery', 'Unloaded into the rooms you point to at the other end, on the date in your contract, and checked off your inventory.'],
    ],
    jobH2: 'One long haul, <em>start to finish.</em>',
    jobLede: 'Photographs from our own crews — this is what the four parts of a cross-country load look like.',
    jobSteps: [
      ['Floors protected', 'Runners down and jambs padded at both ends of the country, not only at pickup.'],
      ['Wrapped for the road', 'Blankets, shrink and tape on every piece, because it has days of highway ahead of it.'],
      ['Tiered &amp; strapped', 'Stacked in tiers and strapped row by row, so a thousand miles of motorway shifts nothing.'],
      ['Delivered &amp; checked', 'Unloaded against your inventory at the far door, room by room, before we leave.'],
    ],
    galleryH2: 'Long hauls, <em>up close.</em>',
    galleryP: 'Homes and offices we have carried across the country — packed, loaded and delivered by the crews in these photographs.',
    reviewsH2: 'What our long-distance clients <em>say.</em>',
    faqH2: 'Long distance moving, <em>answered.</em>',
    faqP: 'What people ask us before booking a cross-country move. If yours is not here, call — we are around.',
    faq: [
      ['Is the quote really fixed for the whole distance?',
       '<p>Yes — binding, in writing, before anything is loaded. We survey by video or in person first, so the figure is built on what you are actually shipping and the miles it has to travel. No "fuel surcharge" produced at the far end, and no re-weigh that mysteriously goes up.</p>'],
      ['How long does a cross-country move take?',
       '<p>Roughly 2–5 days coast to coast once loaded, and 1–3 days for shorter hauls, depending on the route and the season. You get a delivery date in the contract rather than a fortnight-wide "spread" — that is the difference between a carrier with its own trucks and a broker selling your load on.</p>'],
      ['Do you use your own trucks and crews?',
       '<p>Yes. The truck at your door is ours and the crew loading it are our employees, at both ends of the move. Nothing is auctioned to a third party after you book, which is the single most common way a long distance move goes wrong.</p>'],
      ['Is my shipment insured over that distance?',
       '<p>50STATEMOVERS INC is licensed, bonded and insured, carrying $1M in General Liability Coverage. Every interstate shipment also carries Released Value Protection at no charge — the federally required minimum of 60 cents per pound per article. Full Value Protection is available instead, covering repair, replacement, or a cash settlement at current market value.</p><p>USDOT #4575745 · MC-1820728</p>'],
      ['Can you store my things between the two dates?',
       '<p>Yes. Long hauls rarely line up neatly with a closing date, so we hold shipments in climate-controlled, monitored storage and deliver when your new place is ready — inventoried in and inventoried out, fully insured throughout.</p>'],
      ['How far in advance should I book a long distance move?',
       '<p>4–6 weeks is comfortable, 6–8 in peak season (May through August), when trucks and crews book out fastest. That said, call us whatever your dates are — we run last-minute long distance moves regularly and will tell you straight away what we can do.</p>'],
    ],
  },
  {
    slug: 'interstate-movers',
    title: 'Interstate Movers | FMCSA-Licensed Moving Company — 50STATEMOVERS INC',
    description:
      'Interstate movers licensed by the FMCSA, USDOT #4575745. Binding written estimates, our own crews across state lines, $1M liability coverage. Free fixed quote.',
    ogTitle: '50STATEMOVERS INC — Interstate Movers',
    ogDescription:
      'A licensed interstate moving company: binding estimates, federal valuation coverage and our own crews on both sides of the state line.',
    schemaDescription:
      'FMCSA-licensed interstate moving company carrying household and office shipments across state lines throughout the continental United States.',
    h1: 'Interstate <em>Movers</em>',
    coverageH2: 'Over the state line, <em>into all 48.</em>',
    coverageP:
      'Cross a state line and your move stops being a local job and starts being a federally regulated one. We are licensed for all of it — every continental state, under our own USDOT authority.',
    servicesH2: 'Interstate moving, <em>done by the book.</em>',
    servicesP:
      'Pick the level of help you want. Whichever you choose, the paperwork underneath it is the same: a binding written estimate, a signed inventory, and valuation coverage set before we load.',
    processH2: 'How an interstate move <em>actually</em> works.',
    processP:
      'Survey, binding estimate, load, delivery — with the documents a regulated interstate carrier owes you at each step, not after the fact.',
    processSteps: [
      ['Survey', 'A video or in-home walkthrough, so the estimate is built on what you are actually shipping across the line.'],
      ['Binding Estimate', 'A written, binding estimate with every line itemized, plus your valuation choice, before anything is signed.'],
      ['Load &amp; Inventory', 'Our crew loads and tags every item onto a signed inventory — the document that settles any question later.'],
      ['Delivery', 'Delivered within the agreed dates, checked against that inventory, and signed off with you at the new address.'],
    ],
    jobH2: 'One state line, <em>start to finish.</em>',
    jobLede: 'Photographs from our own crews — this is what the four parts of an interstate load look like.',
    jobSteps: [
      ['Floors protected', 'Runners down and door jambs padded before a single carton leaves the house.'],
      ['Wrapped and tagged', 'Blankets and shrink on every piece, and an inventory tag on each one before it is carried out.'],
      ['Loaded &amp; strapped', 'Stacked in tiers and strapped row by row, so nothing shifts between the two states.'],
      ['Delivered on paper', 'Unloaded room by room and checked back against the inventory you signed at pickup.'],
    ],
    galleryH2: 'Across the line, <em>up close.</em>',
    galleryP: 'Homes and offices we have carried over state lines — packed, loaded and delivered by the crews in these photographs.',
    reviewsH2: 'What our interstate clients <em>say.</em>',
    faqH2: 'Interstate moving, <em>answered.</em>',
    faqP: 'The questions that come up once a move crosses a state line. If yours is not here, call — we are around.',
    faq: [
      ['Are you licensed to move across state lines?',
       '<p>Yes. 50STATEMOVERS INC holds active FMCSA operating authority for interstate household goods, and is bonded and insured with $1M in General Liability Coverage. We will send the documentation before you book — and you can check it yourself on the FMCSA register.</p><p>USDOT #4575745 · MC-1820728</p>'],
      ['What is a binding estimate, and do I get one?',
       '<p>A binding estimate is a written price the carrier cannot exceed for the services listed on it. That is what we issue, after a video or in-home survey. Non-binding estimates are legal but they are an invitation to a bigger number on delivery day, which is why we do not use them.</p>'],
      ['How is my shipment covered once it crosses a state line?',
       '<p>Interstate moves are regulated by the FMCSA, and every shipment carries Released Value Protection at no additional charge — the federal minimum of 60 cents per pound per article. Full Value Protection is available instead, covering repair, replacement, or a cash settlement at current market value. You choose in writing before we load, not afterwards.</p>'],
      ['When will my things arrive at the new state?',
       '<p>You get delivery dates in the contract, not an open-ended window: typically 1–3 days for a neighbouring state and 2–5 coast to coast once loaded. Because the crew loading you is ours and the truck is ours, nobody re-sells your shipment and nobody has to wait for a stranger\'s schedule.</p>'],
      ['Do you handle the inventory and paperwork?',
       '<p>Yes. Every item is tagged onto a signed inventory at pickup and checked back against it at delivery, and you leave with the bill of lading, the estimate and your valuation election in hand. That paperwork is what makes a claim straightforward if one is ever needed.</p>'],
      ['How far in advance should I book an interstate move?',
       '<p>4–6 weeks is comfortable, 6–8 weeks in peak season (May through August). Call us whatever your dates are, though — we handle last-minute interstate moves regularly, and we will tell you straight away what we can do rather than leaving you guessing.</p>'],
    ],
  },
  {
    slug: 'state-to-state-movers',
    title: 'State to State Movers | Moving Between States — 50STATEMOVERS INC',
    description:
      'State to state movers covering 48 states and D.C. One crew from your old door to your new one, a binding fixed price, and people who know the rules at both ends.',
    ogTitle: '50STATEMOVERS INC — State to State Movers',
    ogDescription:
      'Moving from one state to another, door to door. Fixed prices, our own crews, and a moving guide for every state we serve.',
    schemaDescription:
      'State to state moving company relocating households and offices between any two of the 48 continental states and Washington D.C.',
    h1: 'State to State <em>Movers</em>',
    coverageH2: 'Any two states, <em>one crew.</em>',
    coverageP:
      'Pick your old state and your new one: we run between all 48 and D.C., and we have a guide for each of them — what a move out of there costs you in time, season and paperwork.',
    servicesH2: 'Moving between states, <em>at your pace.</em>',
    servicesP:
      'A move between states is really two local moves with a long drive in the middle. Choose how much of it you want to hand over, and the same company handles both ends.',
    processH2: 'What moving between states <em>looks like.</em>',
    processP:
      'One survey, one price, one crew, both addresses. Nothing is handed to a partner company the moment you cross the line.',
    processSteps: [
      ['Survey', 'A video or in-home walkthrough of the house you are leaving, so the plan fits what is actually going on the truck.'],
      ['Fixed Quote', 'One written price covering both states — origin labour, the drive, and delivery — with every line itemized.'],
      ['Move Out', 'Your crew packs, protects and loads, and handles the permits or building rules where you are leaving from.'],
      ['Move In', 'The same shipment, delivered to your new state and carried into the rooms you point to. No second company, no handover.'],
    ],
    jobH2: 'Two states, <em>one day at a time.</em>',
    jobLede: 'Photographs from our own crews — this is what moving between two states looks like from the inside.',
    jobSteps: [
      ['Floors protected', 'Runners down and jambs padded in the house you are leaving and the one you are arriving at.'],
      ['Everything wrapped', 'Blankets, shrink and tape on every piece before it goes anywhere near the truck.'],
      ['Loaded for the drive', 'Stacked in tiers and strapped row by row for the miles between the two states.'],
      ['Into the new place', 'Unloaded room by room at the far address, on the date we agreed before you booked.'],
    ],
    galleryH2: 'State to state, <em>up close.</em>',
    galleryP: 'Moves between states we have run this year — packed, loaded and delivered by the crews in these photographs.',
    reviewsH2: 'What people moving states <em>say.</em>',
    faqH2: 'Moving between states, <em>answered.</em>',
    faqP: 'What people ask when they are leaving one state for another. If yours is not here, call — we are around.',
    faq: [
      ['Which states do you move between?',
       '<p>All 48 continental states and Washington D.C., in either direction. There is a moving guide for each one on this site — the routes we run most from there, the cities we cover, and what is worth knowing before you book.</p>'],
      ['Is the same crew with me at both ends?',
       '<p>It is our company at both addresses: our crew loads you and our truck delivers you. Plenty of movers hand your shipment to a partner firm at the state line — that is where a move stops being anybody\'s responsibility, and it is not how we work.</p>'],
      ['Do you know the rules where I am going?',
       '<p>Yes, and they matter more than people expect. Parking permits, elevator reservations, certificates of insurance for the building, HOA move-in windows — we sort those at both ends, because a truck that cannot park is a day you pay for twice.</p>'],
      ['What if my new place is not ready yet?',
       '<p>Very common when two closings do not line up. We hold your shipment in climate-controlled, monitored storage and deliver when you are ready — inventoried in, inventoried out, insured the whole time.</p>'],
      ['Do you take small moves between states, or only whole houses?',
       '<p>Both. A studio going three states over is as welcome as a five-bedroom house going across the country. The survey sets the price either way, so a small shipment is priced like a small shipment.</p>'],
      ['When is the best time to move between states?',
       '<p>Mid-month and midweek, outside May through August, is the quietest and the easiest to schedule. Peak season books out fastest, so if your dates fall there, get on the calendar early — and call us whatever they are, because we run last-minute moves regularly.</p>'],
    ],
  },
];

/* -------------------------------------------------------------- the machine */

function swapOnce(html, from, to, where) {
  const n = html.split(from).length - 1;
  if (n !== 1) {
    throw new Error(
      `build-service-pages: expected exactly 1 match for ${where} in index.html, found ${n}.\n` +
      `  Looked for: ${from.slice(0, 110)}…\n` +
      `  The homepage has been reworded — update the swap rather than dropping it.`
    );
  }
  return html.replace(from, to);
}

function swapBlock(html, startMarker, endMarker, to, where) {
  const start = html.indexOf(startMarker);
  const end = start < 0 ? -1 : html.indexOf(endMarker, start);
  if (end < 0) throw new Error(`build-service-pages: couldn't find ${where} block in index.html`);
  return html.slice(0, start) + to + html.slice(end + endMarker.length);
}

function processGrid(steps) {
  return `  <div class="process-grid">
${steps.map(([title, body], i) => `    <div class="process-step">
      <div class="step-num">STEP 0${i + 1}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`).join('\n')}
  </div>`;
}

function jobSteps(steps) {
  return `      <ol class="job-steps">
${steps.map(([title, body], i) => `        <li class="job-step">
          <span class="job-num" aria-hidden="true">${i + 1}</span>
          <h3>${title}</h3>
          <p>${body}</p>
        </li>`).join('\n')}
      </ol>`;
}

function faqWrap(items) {
  return `  <div class="faq-wrap">
${items.map(([q, a]) => `    <div class="faq-item">
      <button class="faq-q" aria-expanded="false">${q}<span class="faq-toggle" aria-hidden="true"></span></button>
      <div class="faq-a">${a}</div>
    </div>`).join('\n')}
  </div>`;
}

// MovingCompany plus the page's own FAQ, so the questions can win their own
// result rather than repeating the homepage's entity and nothing else.
function schema(page) {
  return `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MovingCompany',
      '@id': `${SITE}/${page.slug}/#business`,
      name: '50STATEMOVERS INC',
      url: `${SITE}/${page.slug}/`,
      description: page.schemaDescription,
      telephone: '+18885051086',
      email: 'contact@50statemovers.com',
      areaServed: 'US',
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.96', reviewCount: '2400' },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}/${page.slug}/#faq`,
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() },
      })),
    },
  ],
}, null, 2)}
</script>`;
}

// index.html lives at the root, so a handful of its asset references are
// written relative ("styles.css", "assets/images/…"). One directory down they
// would resolve to /long-distance-movers/styles.css and 404 — which renders
// the page with no stylesheet at all — so they are made root-relative here.
function absolutise(html) {
  return html.replace(/(\s(?:href|src)=")(?!https?:|\/|#|tel:|mailto:|data:)/g, '$1/');
}

function servicePage(page) {
  let html = absolutise(HOME);
  const url = `${SITE}/${page.slug}/`;

  // ---- head
  html = swapOnce(html,
    '<meta name="description" content="State-to-state movers for full-house moves across the continental US. Binding fixed prices, our own trucks and crews, $1M coverage — no brokers. Free quote." />',
    `<meta name="description" content="${page.description}" />`, 'meta description');
  html = swapOnce(html,
    '<meta property="og:title" content="50STATEMOVERS INC — Long Distance Movers" />',
    `<meta property="og:title" content="${page.ogTitle}" />`, 'og:title');
  html = swapOnce(html,
    '<meta property="og:description" content="Professional long-distance moving services across all continental states. Free fixed quotes. Licensed, bonded &amp; insured." />',
    `<meta property="og:description" content="${page.ogDescription}" />`, 'og:description');
  html = swapOnce(html,
    '<title>50STATEMOVERS INC — Long Distance Movers</title>',
    `<title>${page.title}</title>`, 'title');
  html = swapOnce(html, `<link rel="canonical" href="${SITE}/" />`,
    `<link rel="canonical" href="${url}" />`, 'canonical');
  html = swapOnce(html, `<meta property="og:url" content="${SITE}/" />`,
    `<meta property="og:url" content="${url}" />`, 'og:url');
  html = swapBlock(html, '<script type="application/ld+json">', '</script>', schema(page), 'JSON-LD');

  // ---- headline and section copy
  html = swapOnce(html, '<h1>State-to-State <em>Movers</em></h1>', `<h1>${page.h1}</h1>`, 'h1');
  html = swapOnce(html, '<h2>Moving to or from <em>the Continental USA.</em></h2>',
    `<h2>${page.coverageH2}</h2>`, 'coverage h2');
  html = swapOnce(html,
    "<p>From Maine to California, Texas to Washington — wherever you're headed in the Continental US, we have a crew ready for you.</p>",
    `<p>${page.coverageP}</p>`, 'coverage lede');
  html = swapOnce(html, '<h2>Services built around <em>your</em> move.</h2>',
    `<h2>${page.servicesH2}</h2>`, 'services h2');
  html = swapOnce(html,
    "<p>Whether you're relocating an apartment or a full office, we tailor the approach to what you're actually moving — and where it needs to go.</p>",
    `<p>${page.servicesP}</p>`, 'services lede');
  html = swapOnce(html, '<h2>How a move <em>actually</em> goes.</h2>',
    `<h2>${page.processH2}</h2>`, 'process h2');
  html = swapOnce(html,
    "<p>No surprises, no vague quotes that balloon on moving day. Here's the full shape of working with us.</p>",
    `<p>${page.processP}</p>`, 'process lede');
  html = swapBlock(html, '  <div class="process-grid">', '\n  </div>', processGrid(page.processSteps), 'process grid');

  html = swapOnce(html, '<h2>One move, <em>start to finish.</em></h2>', `<h2>${page.jobH2}</h2>`, 'job h2');
  html = swapOnce(html,
    '<p class="job-lede">Photographs from our own crews — this is what the four parts of your day look like.</p>',
    `<p class="job-lede">${page.jobLede}</p>`, 'job lede');
  html = swapBlock(html, '      <ol class="job-steps">', '      </ol>', jobSteps(page.jobSteps), 'job steps');

  html = swapOnce(html, '<h2>Our work, <em>up close.</em></h2>', `<h2>${page.galleryH2}</h2>`, 'gallery h2');
  html = swapOnce(html,
    "<p>A look at the homes, offices, and cross-country relocations we've handled across the country.</p>",
    `<p>${page.galleryP}</p>`, 'gallery lede');
  html = swapOnce(html, '<h2>What our clients <em>say.</em></h2>', `<h2>${page.reviewsH2}</h2>`, 'reviews h2');

  html = swapOnce(html, '<h2>Common <em>questions</em>, answered.</h2>', `<h2>${page.faqH2}</h2>`, 'faq h2');
  html = swapOnce(html,
    "<p>The things we get asked most. If yours isn't here, just call — we're around.</p>",
    `<p>${page.faqP}</p>`, 'faq lede');
  html = swapBlock(html, '  <div class="faq-wrap">', '\n  </div>', faqWrap(page.faq), 'faq');

  return html;
}

for (const page of PAGES) {
  const out = path.join(ROOT, page.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, servicePage(page));
  console.log(`Generated /${page.slug}/`);
}
