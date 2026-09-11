/*
 * Reworded alternatives for the copy that would otherwise be byte-identical on
 * every state page.
 *
 * Each key holds several hand-written phrasings of the SAME claim — same facts,
 * same promises, different sentences. `pick()` in build-state-pages.js assigns
 * one per state deterministically, rotating each key independently so no two
 * states end up with the same overall combination.
 *
 * Rules for editing:
 *  - Variants of a key must be interchangeable in meaning. Never let one
 *    variant promise something the others don't.
 *  - No dollar figures anywhere (see scripts/README.md).
 *  - `{{state}}` is replaced with the state name, `{{a}}` with "a"/"an" for it,
 *    `{{usdot}}` / `{{mc}}` with the licence numbers, `{{regulator}}` with the
 *    state regulator, `{{phone}}` with the display phone number.
 *  - Keep every variant within roughly the same length as its siblings; the
 *    grids and cards they sit in are sized for the shortest and longest.
 */

module.exports = {
  /* ---------------------------------------------- price drivers (cost cards) */

  costWeight: [
    `Long-distance moves price on what your household actually weighs, not how many rooms it occupies. Two three-bedroom homes can differ by thousands of pounds. This is why we survey by video or in person before quoting rather than guessing from a bedroom count over the phone.`,
    `The scale decides the number, not the floor plan. One three-bedroom house can outweigh another by half a ton once the garage, the books, and the workshop are counted. A video walkthrough or an in-person visit settles it; a bedroom count over the phone never does.`,
    `What you pay on a long haul follows poundage, not square footage. Identical-looking houses routinely differ by thousands of pounds once storage rooms and hobbies are in the inventory. We survey first — on video or at your door — so the figure rests on your goods rather than an average.`,
    `Interstate tariffs are built on weight. That is why two homes with the same number of bedrooms can quote hundreds of miles apart in cost, and why we walk the whole house with you — camera or in person — before putting a number in writing.`,
  ],

  costAccess: [
    `Whether a trailer can reach your door changes the job. Long carries, stairs, freight elevator reservations, street permits, and shuttle service where a tractor-trailer physically cannot fit are all real work — we check them at survey so they land in the quote instead of on move day.`,
    `How close the truck can park is half the labour. Narrow streets, walk-ups, booked-out service elevators, city permits, and shuttling from a legal parking spot in a smaller vehicle all take crew hours. We measure the approach at both ends during the survey, not on the morning of the move.`,
    `Loading conditions swing the bill more than most people expect. A driveway you can back a fifty-three-foot trailer into is a different job from a third-floor walk-up on a permit-only street. We look at the approach at origin and destination up front so nothing is discovered with the truck already loaded.`,
    `Access is priced work, not a surprise. Distance from the truck to the door, staircases, elevator bookings, parking permits, and a shuttle where the big trailer simply will not go each add crew time. All of it is confirmed at survey and written into the quote.`,
  ],

  costPacking: [
    `Full packing is what most long-distance customers choose, and it is the single biggest factor in whether a load arrives intact — a professionally packed box is built for a 2,000-mile ride, not a car trip. Most land somewhere between, having us handle the kitchen, art, and anything fragile. Custom crating for art, antiques, and oversized items is quoted separately.`,
    `How much of the packing you hand over is yours to decide, and it changes both the price and the odds of a clean delivery. Cartons built for a cross-country haul are packed differently from ones carried down the street. Plenty of customers pack their own clothes and books and leave us the kitchen, the artwork, and the fragile shelf. Crating for oversized or valuable pieces is a separate line.`,
    `Packing scope is the lever customers control most directly. Full service is the common choice on interstate lanes because a properly packed carton is the difference between a load that arrives whole and one that doesn't. A split — you do the soft goods, we do glass, art and electronics — is just as workable. Built-to-fit crates for anything oversized are quoted on their own.`,
    `You can pack everything, nothing, or the easy half. It matters: boxes that hold up over two thousand miles are built to a standard that a cross-town move never tests. Most households keep the wardrobes and books and let our crew take the kitchen, the mirrors, and anything breakable. Custom crates for art, antiques and outsized items carry their own price.`,
  ],

  costStorage: [
    `Move-out and move-in dates rarely line up. Storage-in-transit holds your inventoried goods until your date, and we quote that cost up front rather than letting it accrue quietly. Climate control is worth it for wood, leather, and electronics.`,
    `Closing dates and lease ends seldom meet neatly. When there is a gap, your inventory sits in storage-in-transit until the new place is ready — priced in the original quote, not billed as a running surprise. Anything wooden, leather, or electronic belongs in a climate-controlled unit.`,
    `A gap between handing over one set of keys and getting the next is normal. Storage-in-transit covers it: goods stay inventoried and sealed until your date, with the holding cost agreed before the truck loads. For furniture, instruments, and electronics, pay for the climate control.`,
    `Few moves go straight from door to door on the same day. Where they don't, we hold the shipment in storage-in-transit under the same inventory, and the cost of those weeks is written into your quote from the start. Climate-controlled space is the sensible choice for wood, leather, and anything with a circuit board.`,
  ],

  costValuation: [
    `Every interstate move includes the federally required minimum released-value protection at no extra charge. Full Value Protection — repair, replacement, or a cash settlement at current market value — costs more and is worth considering for a high-value inventory.`,
    `The basic released-value coverage the federal rules require comes with every interstate shipment and costs nothing. Above it sits Full Value Protection, which pays to repair, replace, or settle in cash at today's market value — a line worth adding when the inventory is valuable.`,
    `Two levels of protection exist on any state-line move. Released value is included by law at no charge and is calculated by weight. Full Value Protection is the paid upgrade: repair, like-for-like replacement, or cash at current market value, and the right answer for a household carrying real value.`,
    `Coverage is not optional on an interstate move — the federal minimum released-value protection is built into every shipment for free. What you choose is whether to step up to Full Value Protection, which repairs, replaces, or settles at market value and is the sensible call for a high-value load.`,
  ],

  /* -------------------------------------------------------- section leads-in */

  coverageLede: [
    `We pick up throughout the state, not just the metros. If your town isn't listed, it's almost certainly still on a route we run — call {{phone}} and we'll confirm access before quoting.`,
    `Our trucks work the whole of {{state}}, small towns included. A place that isn't on this list is usually still on a lane we already run — ring {{phone}} and we'll check the access before we quote you.`,
    `Coverage here isn't limited to the big cities. If you don't see your town below, ask anyway: most addresses in {{state}} sit on an existing route. Call {{phone}} and we'll confirm the truck can reach you first.`,
    `Rural pickups are routine for us, not an exception. The list below is the largest municipalities; the routes behind it reach a great deal further. Call {{phone}} and we'll tell you straight away whether your address is on one.`,
  ],

  costsLede: [
    `We don't publish a price list, because a number without a survey is a guess — and a guess is exactly what turns into a bigger bill on delivery day. Here's what actually moves the figure on {{a}} {{state}} move. Every one of these is itemized in your written quote before you sign, and the price we agree is the price you pay.`,
    `There is no price table on this page on purpose. A figure quoted before anyone has seen your household is a guess, and guesses are what become revised invoices at the far end. What follows is what genuinely shifts the cost of {{a}} {{state}} move — each line itemized in writing before you sign, and binding once you do.`,
    `Anyone quoting {{a}} {{state}} move sight-unseen is estimating, and estimates get revised at delivery. So rather than a rate card, here is what actually decides the number. All of it appears as a line in your written quote, and the total on that quote is the total you pay.`,
    `We would rather explain the price than advertise one. A number produced without a survey has nothing behind it, which is how people end up owing more than they were told. These are the factors that move the cost of {{a}} {{state}} move — itemized up front, fixed once agreed.`,
  ],

  processLede: [
    `Every state has its own access problems, weather windows, and rules. Here's what shapes {{a}} {{state}} move in practice.`,
    `Roads, seasons, and regulators differ from one state line to the next. This is what they mean for {{a}} {{state}} move on the ground.`,
    `The practical detail changes by state — where the trucks can go, when the weather cooperates, who licenses whom. Here is how that plays out in {{state}}.`,
    `Local conditions decide how {{a}} {{state}} move actually runs. These are the four that come up on almost every job we book here.`,
  ],

  quirksLede: [
    `Three things that regularly turn a straightforward {{state}} move into an expensive one. We check all three before quoting, so they land in the price rather than on move day.`,
    `These three catch people out in {{state}} often enough that we look for all of them at survey — which is how they end up in the quote instead of on the final invoice.`,
    `Three recurring ways {{a}} {{state}} move gets costlier than expected. None of them are surprises to us; we check each one before the quote is written.`,
    `Most overruns on {{a}} {{state}} move trace back to one of the three below. We ask about all three up front so the price reflects them from the start.`,
  ],

  faqLede: [
    `The things people actually ask us before booking a move out of {{state}}.`,
    `Questions we field most often from households leaving {{state}}.`,
    `What {{state}} customers want settled before they put a date in the diary.`,
    `The answers people ask for before committing to {{a}} {{state}} move.`,
  ],

  nearbyLede: [
    `We run the full continental map. These are the states most often paired with {{a}} {{state}} move — each has its own guide covering arrival logistics, building rules, and seasonal timing.`,
    `Our lanes cover the continental US. The destinations below are the ones {{state}} households pick most; each links to a guide on arriving there — access, building rules, and the right time of year.`,
    `Anywhere in the lower 48 is a lane we run. These are simply the common pairings out of {{state}}, and each state has a guide of its own on what delivery there involves.`,
    `The whole continental map is in range. Listed here are the states we most often deliver {{state}} loads to, with a dedicated guide behind each on logistics, building access, and timing.`,
  ],

  /* ----------------------------------------------------------- licensing FAQ */

  licensingA: [
    `Yes, and there are two separate authorities. Any company moving household goods across a state line must hold an active USDOT number and interstate operating authority from the FMCSA — ours are <strong>USDOT #{{usdot}}</strong> and <strong>{{mc}}</strong>, and you can verify both on the FMCSA's public SAFER database before paying a deposit.`,
    `Yes — and the licence you need depends on where the truck is going. Crossing a state line requires an active USDOT number plus interstate operating authority from the FMCSA. Ours are <strong>USDOT #{{usdot}}</strong> and <strong>{{mc}}</strong>; both are public on the FMCSA's SAFER database, and you should look them up before any money changes hands.`,
    `Yes, under two different regimes. Household goods moving over a state line fall to the FMCSA, which issues the USDOT number and the operating authority that goes with it — we hold <strong>USDOT #{{usdot}}</strong> and <strong>{{mc}}</strong>. Check any mover's numbers on the FMCSA's free SAFER lookup before you pay a deposit.`,
    `Yes. Interstate household moving is federally licensed: the carrier needs a live USDOT registration and FMCSA operating authority, not just a business licence. Ours are <strong>USDOT #{{usdot}}</strong> and <strong>{{mc}}</strong>, and SAFER — the FMCSA's public database — will confirm them in seconds.`,
  ],

  licensingB: [
    `Companies that move households only within {{state}} answer to {{regulator}}. That distinction matters: an intrastate-only registration is not authority to take your belongings out of {{state}}, and it is the most common gap we see when customers forward us a competitor's paperwork. Two other things worth checking on any quote — whether the price is binding or an estimate that can be revised at delivery, and whether the company is a carrier that owns trucks or a broker reselling your move. We are a carrier, we quote binding fixed prices, and we put our own crew and truck on the job.`,
    `Movers working only inside {{state}} are registered instead with {{regulator}} — and that is not the same thing. An intrastate registration gives no authority to carry your goods across the {{state}} line, which is the single most frequent problem we spot in paperwork customers send us to review. While you're checking, settle two more questions: is the price binding or an estimate that can be rewritten at delivery, and is the company a carrier with its own trucks or a broker selling the job on? We are a carrier, our prices are binding, and the crew and truck are ours.`,
    `Purely local movers hold a {{regulator}} registration rather than federal authority. The difference is not paperwork pedantry — an intrastate-only registration does not permit anyone to carry your household out of {{state}}, and it is the gap we most often find in quotes customers ask us to look over. Two further questions are worth asking anyone: whether the quoted price is binding or an estimate open to revision on delivery day, and whether you are hiring a carrier or a broker. We own the trucks, employ the crew, and quote binding fixed prices.`,
    `If a company only moves people around inside {{state}}, its registration comes from {{regulator}} and stops at the state line — it is no licence to take your belongings interstate. That mismatch is the commonest fault in competitor paperwork customers forward to us. Add two more checks of your own: binding price or revisable estimate, and carrier or broker. We are a carrier quoting binding fixed prices, moving you with our own crew on our own truck.`,
  ],

  /* --------------------------------------------------------- service cards
   * Same six services, same promises, worded differently per state.        */

  svcLongDistance: [
    `Cross-country and interstate relocations. We coordinate logistics, customs paperwork, and destination unpacking — all door to door.`,
    `State-line and coast-to-coast moves, run door to door. Routing, paperwork, and unpacking at the far end are all handled by us.`,
    `Long-haul household relocations across the continental map — scheduling, documentation, and unpacking on arrival included, with one crew responsible throughout.`,
    `Interstate and cross-country moving, end to end. We plan the lane, handle the paperwork, and unpack you at the other side.`,
  ],

  svcWhiteGlove: [
    `The top tier. Concierge-level service: we'll pack, transport, unpack, arrange, and even hang the art on the walls before we leave.`,
    `Our highest tier of service. Packed, carried, unpacked, placed — down to the pictures back on the walls before the crew leaves.`,
    `Concierge moving at the top of the range: we pack every item, move it, unpack it, put the furniture where you want it, and hang the artwork.`,
    `The full-attention option. Nothing is left for you to do — packing, transport, unpacking, arranging the rooms, and hanging the art are all ours.`,
  ],

  svcResidential: [
    `From studio apartments to five-bedroom homes. We disassemble, transport, and reassemble — and we never leave before everything's in its place.`,
    `Studios through to large family houses. Furniture comes apart, travels, and goes back together — and the crew stays until each room is set.`,
    `Any size of home, from a one-room flat to a five-bedroom house. We take apart what needs taking apart, move it, rebuild it, and finish the job in place.`,
    `Household moves of every scale. Beds, wardrobes and tables are dismantled, transported and reassembled, and nobody drives off until it is all where it belongs.`,
  ],

  svcCommercial: [
    `Office relocations handled after hours or over weekends, so your team is working from the new space on Monday morning — no downtime.`,
    `Business moves scheduled for evenings and weekends, which is how your staff arrive at a working office on Monday instead of a room of boxes.`,
    `Offices, studios and workspaces relocated outside trading hours. The aim is simple: no lost working days between the old address and the new one.`,
    `Commercial relocations run overnight or across a weekend, so the business closes on Friday in one building and opens on Monday in the next.`,
  ],

  svcPacking: [
    `Museum-grade packing for art, antiques, and anything fragile. We build custom crates on site when off-the-shelf won't do.`,
    `Gallery-standard packing for artwork, antiques, and delicate pieces — and purpose-built crates made at your address when stock sizes don't fit.`,
    `Fragile, valuable and awkward items packed to museum standard. Where no ready-made carton will do the job, we build the crate on site.`,
    `Art, heirlooms, instruments, and glass packed the way galleries pack them, with bespoke crates constructed in your home for anything off-size.`,
  ],

  svcStorage: [
    `Climate-controlled, 24-hour-monitored units in secure facilities. Short-term overflow or long-term, fully insured and inventoried throughout.`,
    `Secure, climate-controlled units under round-the-clock monitoring — a few weeks or a few years, insured and inventoried the whole time.`,
    `Monitored storage in climate-controlled facilities, available for a short gap between dates or an open-ended stay. Everything stays inventoried and insured.`,
    `Warehousing with climate control and 24-hour security. Use it for a week between closings or indefinitely; the inventory and the insurance run throughout.`,
  ],

  /* ------------------------------------------------------------- headings
   * Full <h2> inner HTML. Keep one <em> per heading — the italic span is what
   * carries the section's colour accent.                                    */

  coverageHead: [
    `We service every city, village, and town in <em>{{state}}</em> and deliver to any state. Call <a href="tel:{{phoneHref}}">{{phone}}</a>.`,
    `Every town in <em>{{state}}</em> is on our map, and every state is a delivery. Call <a href="tel:{{phoneHref}}">{{phone}}</a>.`,
    `From any address in <em>{{state}}</em> to anywhere in the lower 48. Speak to us on <a href="tel:{{phoneHref}}">{{phone}}</a>.`,
    `We load anywhere in <em>{{state}}</em> and unload in any continental state. Call <a href="tel:{{phoneHref}}">{{phone}}</a>.`,
  ],

  costsHead: [
    `What shapes the price of {{a}} <em>{{state}}</em> move.`,
    `What your <em>{{state}}</em> move actually costs, and why.`,
    `The six things that set the price of {{a}} <em>{{state}}</em> move.`,
    `How {{a}} <em>{{state}}</em> move gets priced.`,
  ],

  processHead: [
    `Moving from {{state}}: what's <em>actually different.</em>`,
    `What {{state}} does to <em>a moving schedule.</em>`,
    `Leaving {{state}}: the <em>local detail</em> that matters.`,
    `{{state}} moves, and <em>how they really run.</em>`,
  ],

  quirksHead: [
    `What catches people out in <em>{{state}}.</em>`,
    `Three {{state}} problems <em>worth knowing about.</em>`,
    `Where {{state}} moves <em>go wrong.</em>`,
    `The {{state}} details that <em>cost people money.</em>`,
  ],

  faqHead: [
    `{{state}} moving <em>questions</em>, answered.`,
    `Leaving {{state}}: your <em>questions</em>, answered.`,
    `What {{state}} customers <em>ask us</em> first.`,
    `{{state}} moves: the <em>common questions.</em>`,
  ],

  nearbyHead: [
    `Nearby states &amp; <em>popular destinations.</em>`,
    `Where {{state}} households <em>usually go.</em>`,
    `Our most-run lanes out of <em>{{state}}.</em>`,
    `Neighbouring states and <em>long-haul favourites.</em>`,
  ],

  servicesHead: [
    `Services built around <em>your</em> move.`,
    `What we can <em>take off your hands.</em>`,
    `Six ways we <em>handle</em> a move.`,
    `Pick the <em>level of help</em> you want.`,
  ],

  galleryLede: [
    `A look at the homes, offices, and cross-country relocations we've handled across the country.`,
    `Recent jobs — houses, offices, and long-haul lanes run coast to coast.`,
    `Crews at work: family homes, business relocations, and cross-country hauls.`,
    `A sample of the moves behind the quotes — residential, commercial, and long distance.`,
  ],

  /* --------------------------------------------------------- illustrated band */

  bandLede: [
    `Three things decide whether a {{state}} move lands well, and all three are settled before the truck arrives.`,
    `Three decisions make or break a {{state}} move, and all three happen before loading day.`,
    `Whether {{a}} {{state}} move goes smoothly comes down to three things, each settled in advance.`,
    `Three points carry a {{state}} move, and none of them are left to the morning of the job.`,
  ],

  bandPacking: [
    `A box that survives a 2,000-mile ride is built differently from one that crosses town. We pack to the lane, not to the room count.`,
    `Cartons made for a cross-country haul are not the cartons you'd use across town. We pack for the distance your load is travelling.`,
    `The length of the trip decides how things are packed. Two thousand miles of road asks more of a box than a short hop does.`,
    `Packing is matched to the journey, not the room count — a long-haul carton is built to take vibration for days.`,
  ],

  bandCrew: [
    `The crew that loads your home is the crew that unloads it. No broker in the middle, no handoff to a carrier you have never spoken to.`,
    `Same crew at both ends. Nobody sells your job on, and no stranger's truck turns up at the far end.`,
    `Your move stays with one team from door to door — no broker taking a cut, no unknown carrier inheriting your goods.`,
    `The people who pack and load are the people who deliver. We don't broker moves out to whoever is nearest.`,
  ],
};
