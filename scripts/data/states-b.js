// Part B — Indiana through Montana
module.exports = [
{
  name: "Indiana", slug: "indiana", abbr: "IN",
  hub: { city: "Indianapolis", lat: 39.77, lng: -86.16 },
  cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette", "Muncie", "Noblesville", "Terre Haute", "Columbus"],
  neighbors: ["MI", "OH", "KY", "IL"],
  routes: ["FL", "TX", "NC", "TN", "AZ", "GA"],
  regulator: "the Indiana Department of Revenue Motor Carrier Services division",
  highways: ["I-65", "I-70", "I-69", "I-74", "I-80/90"],
  intro: "Indianapolis calls itself the Crossroads of America for a reason: I-65, I-69, I-70, and I-74 all meet there, which makes Indiana one of the easiest states in the country to move out of on a consolidated load. Moving companies in Indiana benefit from that density — trucks pass through constantly, so shared-load departures are frequent and transit windows short. Most long-distance moves from Indiana head south to Florida, Texas, and the Carolinas.",
  migration: "Indiana runs close to migration balance, with a modest net outflow. The Indianapolis metro — especially Carmel, Fishers, and Westfield — is a genuine inbound magnet drawing households from Chicago and the Rust Belt for cost and schools. Northwest Indiana absorbs Chicago-area families crossing the state line, while Gary, Muncie, and the older manufacturing towns lose population. Bloomington and West Lafayette run pure university cycles.",
  logistics: "Access across Indiana is unusually easy — flat terrain, a dense interstate grid, and wide suburban streets. The Indiana Toll Road (I-80/90) carries the northern cross-country traffic. The exceptions are the older Indianapolis neighborhoods like Herron-Morton and Fountain Square, where narrow streets and alley loading are normal, and southern Indiana's hill country near Brown County, where winding roads and steep drives can require a shuttle.",
  seasonal: "Peak is June through August, sharpened by IU and Purdue turnover in mid-August, which is the single hardest week to book in the state. Winter is quiet and generally workable — Indiana handles snow well — though the northern counties get lake-effect snow off Lake Michigan that can slow a South Bend or Gary move. April and May bring severe thunderstorms but rarely block a route for long.",
  quirks: [
    { title: "Crossroads consolidation advantage", body: "Because so many interstate routes converge at Indianapolis, we can usually place an Indiana shipment on a passing consolidated load quickly. That means shorter waits for a departure than similar-distance moves from less connected states." },
    { title: "University turnover weeks", body: "Bloomington and West Lafayette effectively run out of available moving capacity in mid-August. If your move is in that window, book six to eight weeks out." },
    { title: "Northwest Indiana and Chicago rules", body: "A move from Munster or Schererville into Chicago inherits Chicago's permit and building requirements even though the origin is simple. We plan the destination side accordingly." }
  ],
  faqs: [
    { q: "How long does a move from Indiana to Texas take?", a: "Roughly 950 to 1,150 miles to the major Texas metros — 4 to 8 days on a consolidated load, 2 to 3 days dedicated. We give you a delivery spread at booking and a firm 24-hour window once dispatched." },
    { q: "Do you serve Bloomington and West Lafayette student moves?", a: "Yes, including small apartment loads that ride as consolidated shipments, sharing a trailer rather than taking a dedicated truck. Book mid-August dates well ahead — that week is the tightest in the state." },
    { q: "Is winter a bad time to move in Indiana?", a: "Not particularly. Indiana clears roads well and January and February have the best availability of the year. The one caveat is the northern tier near South Bend and Gary, where lake-effect snow can occasionally add a day." },
    { q: "Can you handle a move from an older Indianapolis neighborhood?", a: "Yes. Fountain Square, Herron-Morton, and the near-east side have narrow streets and alley-only access. We stage a smaller truck where a trailer will not fit and include that in the quoted price rather than adding it later." }
  ]
},
{
  name: "Iowa", slug: "iowa", abbr: "IA",
  hub: { city: "Des Moines", lat: 41.59, lng: -93.62 },
  cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "West Des Moines", "Ames", "Council Bluffs", "Ankeny", "Dubuque", "Urbandale", "Cedar Falls", "Bettendorf"],
  neighbors: ["MN", "WI", "IL", "MO", "NE", "SD"],
  routes: ["TX", "FL", "AZ", "CO", "MN", "CA"],
  regulator: "the Iowa Department of Transportation Office of Motor Vehicle Enforcement",
  highways: ["I-80", "I-35", "I-380", "I-29"],
  intro: "Iowa sits at the crossing of I-80 and I-35, which means cross-country trucks pass through the Des Moines area constantly and consolidated space out of the state is easy to find. Moving companies in Iowa work a market defined by insurance and agribusiness employment in Des Moines, university cycles in Iowa City and Ames, and a large share of moves involving rural properties with long gravel drives. Long-distance loads from Iowa run heavily to Texas, Arizona, and Colorado.",
  migration: "Iowa runs a modest net outflow, concentrated among young adults leaving for Denver, the Twin Cities, Dallas, and Phoenix. Des Moines is the exception — the metro has grown steadily on the strength of insurance and financial services and pulls households from smaller Iowa cities and from Chicago. Retiree outbound moves to Arizona and Florida are a consistent seasonal pattern.",
  logistics: "I-80 and I-35 make interstate access straightforward, and most Iowa towns have wide streets and easy truck approach. The genuine constraint is rural: gravel county roads soften badly in spring thaw and after heavy rain, and farmsteads set a quarter-mile off the road often cannot take a loaded tractor-trailer. Those moves get a shuttle, planned in advance. Mississippi River bluff towns like Dubuque have steep grades that limit truck options.",
  seasonal: "Peak is May through August with a sharp spike around university turnover in Iowa City and Ames in mid-August. Winter is genuinely cold — loading at 5°F requires shorter shifts and careful handling of anything brittle — but roads are cleared efficiently and availability is the year's best. Spring thaw is the underrated problem: soft gravel roads and flooding along the Mississippi and Missouri can force route changes in March and April.",
  quirks: [
    { title: "Gravel road load limits", body: "Many Iowa counties post seasonal weight restrictions on gravel roads during spring thaw. A loaded trailer may be legally barred from your driveway in March even in perfect weather, which is why we survey the route." },
    { title: "Farmstead shuttles", body: "Long private drives are the norm outside the metros. We plan a shuttle from the nearest hard-surface staging point and price it in the original quote." },
    { title: "I-80 consolidation window", body: "Cross-country trucks run I-80 daily. If your dates are flexible by a few days, an Iowa shipment can often catch a passing load rather than waiting for a dedicated one." }
  ],
  faqs: [
    { q: "Can a moving truck reach a rural Iowa farmhouse?", a: "Usually, but not always in March and April. Spring thaw softens gravel county roads and some counties post weight limits. We check the route and, where a tractor-trailer cannot make it, quote a shuttle from a paved staging point up front." },
    { q: "How long does a move from Iowa to Arizona take?", a: "About 1,400 to 1,600 miles to Phoenix or Tucson — 6 to 10 days consolidated, 3 to 4 days dedicated. This is a common retiree lane, and we can split delivery and storage if your Arizona closing date is later than your Iowa move-out." },
    { q: "Is it worth moving in an Iowa winter?", a: "Yes — January and February have the best availability of the year. Loading takes longer in extreme cold and we use extra floor protection for snow and salt, but Iowa road maintenance is reliable and weather delays are uncommon." },
    { q: "Do you handle Iowa City and Ames student moves?", a: "Yes. Small apartment loads ride as consolidated shipments, sharing a trailer rather than taking a dedicated truck. The mid-August turnover week is the hardest date in the state to book, so plan six weeks ahead for it." }
  ]
},
{
  name: "Kansas", slug: "kansas", abbr: "KS",
  hub: { city: "Wichita", lat: 37.69, lng: -97.34 },
  cities: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina", "Hutchinson", "Leavenworth", "Garden City", "Dodge City"],
  neighbors: ["NE", "MO", "OK", "CO"],
  routes: ["TX", "CO", "FL", "AZ", "MO", "CA"],
  regulator: "the Kansas Corporation Commission, which regulates intrastate household-goods carriers",
  highways: ["I-70", "I-35", "I-135", "US-54"],
  intro: "Kansas splits into two distinct moving markets: the Johnson County suburbs of Kansas City — Overland Park, Olathe, Lenexa — which behave like a major metro, and everything west of Topeka, which is long-distance rural. Moving companies in Kansas mostly run I-70 east–west and I-35 southwest toward Oklahoma and Texas. Aviation employment in Wichita and Fort Riley's military rotations at Manhattan generate a steady flow of relocations with fixed dates.",
  migration: "Johnson County continues to pull households in from across the region on the strength of schools and corporate employment. Wichita's flow tracks the aerospace cycle closely. Western Kansas loses population steadily to Denver, Wichita, and the Kansas City metro. Fort Riley produces a large, predictable volume of military PCS moves that spike in early summer.",
  logistics: "I-70 crosses the state and I-35 cuts diagonally toward Oklahoma City and Dallas. Truck access in the Johnson County suburbs is straightforward; western Kansas involves genuinely long distances between towns, so a Garden City or Dodge City move carries a longer origin leg than the mileage suggests. Wind is a real operational factor — sustained high crosswinds on I-70 occasionally restrict high-profile trailers.",
  seasonal: "Peak is May through July, driven partly by the military PCS season around Fort Riley and partly by the school calendar. Spring is severe-weather season: Kansas averages among the highest tornado counts in the country, and we will hold a loaded trailer rather than run it into a warned cell. Winter is quiet and mostly reliable, though I-70 ground blizzards in the western half can close the highway with little warning.",
  quirks: [
    { title: "Fort Riley PCS season", body: "Military permanent-change-of-station moves cluster from May to July with fixed report dates. Those loads go dedicated, and we can provide the documentation and weight tickets military reimbursement requires." },
    { title: "Western Kansas distances", body: "Garden City to Wichita is a three-hour origin leg before your shipment even joins a long-haul route. We price that transparently rather than burying it." },
    { title: "High-wind advisories", body: "Sustained crosswinds on I-70 west of Salina can restrict trailer movement. It is a matter of hours, not days, but it is a real scheduling variable in spring." }
  ],
  faqs: [
    { q: "Do you handle military moves from Fort Riley?", a: "Yes. PCS moves need a fixed delivery date rather than a spread, plus weight tickets and documentation for reimbursement. We run those as dedicated shipments and provide the paperwork. Book early — May through July is saturated." },
    { q: "How long does a move from Kansas to Colorado take?", a: "Wichita or Kansas City to Denver is 520 to 600 miles, generally 2 to 5 days consolidated or next-day dedicated. Winter deliveries into the Colorado mountains can add a contingency day for pass conditions." },
    { q: "Will spring storms delay my Kansas move?", a: "Possibly by hours. April through June is the active severe-weather window and we will not run a loaded trailer into a tornado-warned area. Multi-day delays are rare; if your schedule has no slack, a fall move avoids the question." },
    { q: "Are movers in Kansas licensed by the state?", a: "Movers operating solely within Kansas are regulated by the Kansas Corporation Commission. For any interstate move, the federal FMCSA credential is what matters — check for an active USDOT and MC number. Ours are USDOT #4575745 and MC-1820728." }
  ]
},
{
  name: "Kentucky", slug: "kentucky", abbr: "KY",
  hub: { city: "Louisville", lat: 38.25, lng: -85.76 },
  cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Richmond", "Georgetown", "Florence", "Elizabethtown", "Nicholasville", "Frankfort", "Paducah", "Henderson", "Ashland"],
  neighbors: ["OH", "WV", "VA", "TN", "MO", "IL", "IN"],
  routes: ["FL", "TX", "TN", "NC", "GA", "OH"],
  regulator: "the Kentucky Transportation Cabinet, Division of Motor Carriers",
  highways: ["I-65", "I-64", "I-71", "I-75", "I-24"],
  intro: "Louisville is one of the most important air and ground logistics hubs in North America, and that infrastructure works in your favor when you move: consolidated loads out of Kentucky depart frequently in every direction. Moving companies in Kentucky handle a market that runs from Louisville and Lexington's urban housing stock to eastern Kentucky's mountain hollows, where access is the dominant planning question. Most long-distance volume heads south to Florida, Texas, and the Carolinas.",
  migration: "Kentucky's net migration is roughly flat, with meaningful internal movement toward Louisville, Lexington, and the Northern Kentucky suburbs of Cincinnati. Outbound flow goes primarily to Tennessee, Florida, and Texas, driven by taxes and jobs. Eastern Kentucky continues to lose population to the metros and out of state. Bowling Green and the Toyota corridor around Georgetown generate steady manufacturing-related inbound relocations.",
  logistics: "I-65, I-64, I-71, and I-75 give the central part of the state excellent access. The hard geography is east: the Appalachian counties have narrow, winding roads, steep hollows, and low bridge clearances that regularly make a tractor-trailer impossible, so shuttles are standard there. Louisville's Old Louisville and Highlands neighborhoods have narrow streets and alley loading; Lexington's horse-farm properties often have long private drives with gate constraints.",
  seasonal: "Peak is May through August, with a Lexington spike around University of Kentucky turnover. Ice, not snow, is Kentucky's winter risk — freezing rain events shut down the interstates for a day at a time a few times each winter. Spring is wet, and Ohio River flooding periodically affects riverfront neighborhoods in Louisville and the western counties. October is the state's best moving month by weather and availability.",
  quirks: [
    { title: "Eastern Kentucky access", body: "Hollow roads, one-lane bridges, and posted weight limits are common east of I-75. Those moves are planned as shuttle operations from a staging point, priced up front." },
    { title: "Horse-farm gates and drives", body: "Lexington-area farm properties often have gated entries and long gravel drives that a loaded trailer cannot navigate. We confirm access with the property manager before the date." },
    { title: "Freezing-rain contingencies", body: "Kentucky's characteristic winter hazard is ice rather than snow accumulation. We plan a contingency day into January and February delivery windows rather than promising a date we might miss." }
  ],
  faqs: [
    { q: "When should I schedule a Kentucky move?", a: "October is the state's best moving month — mild weather and good availability. May through August is the busiest window, with a Lexington spike around University of Kentucky turnover. Kentucky's characteristic winter hazard is freezing rain rather than snow accumulation, and it closes the interstates for a day at a time a few times each winter, so January and February delivery windows carry a contingency day." },
    { q: "Can a full-size truck reach my eastern Kentucky home?", a: "Often not. Hollow roads, low clearances, and posted bridge weight limits in the Appalachian counties frequently rule out a tractor-trailer. We check the last mile in advance and quote a shuttle rather than discovering the problem on move day." },
    { q: "How long does a Kentucky to Texas move take?", a: "Louisville to Dallas is about 850 miles and to Houston roughly 950 — typically 4 to 8 days consolidated or 2 days dedicated. Consolidated departures from Louisville are frequent because of the city's freight density." },
    { q: "Do you move from Louisville apartments and older homes?", a: "Yes. Old Louisville and the Highlands have narrow streets, alley-only loading, and tall staircases in older housing stock. We survey those in advance so the crew size and equipment match the building rather than the square footage." }
  ]
},
{
  name: "Louisiana", slug: "louisiana", abbr: "LA",
  hub: { city: "New Orleans", lat: 29.95, lng: -90.07 },
  cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Metairie", "Monroe", "Alexandria", "Slidell", "Houma", "Mandeville", "Covington"],
  neighbors: ["AR", "MS", "TX"],
  routes: ["TX", "FL", "GA", "TN", "NC", "CA"],
  regulator: "the Louisiana Public Service Commission, which regulates intrastate household-goods movers",
  highways: ["I-10", "I-12", "I-20", "I-49", "I-55"],
  intro: "Louisiana moving is dominated by two forces: the energy industry's hiring cycles along the Gulf Coast, and hurricane season, which shapes the calendar from June through November. Moving companies in Louisiana also deal with housing stock unlike anywhere else — New Orleans shotgun houses and raised Creole cottages with steep exterior stairs, narrow French Quarter streets where a truck legally cannot stop without a permit, and a high water table that makes ground-floor storage a bad idea.",
  migration: "Louisiana has one of the highest net-outbound rates in the South, with Texas absorbing the largest share by far — Houston, Dallas, and Austin are the top three destinations by volume. Storm recovery, insurance costs, and energy-sector employment shifts drive much of it. Baton Rouge and the Northshore parishes around Mandeville and Covington run counter, gaining households from New Orleans. Lake Charles and the industrial corridor track LNG and petrochemical construction cycles.",
  logistics: "I-10 and I-12 carry east–west traffic and I-49 runs north from Lafayette to Shreveport. Bridge and causeway constraints matter here more than in most states: the Lake Pontchartrain Causeway has restrictions and closes in high winds, and many bayou parish roads have posted weight limits. In New Orleans, the French Quarter, Marigny, and Garden District require permits for truck staging, and narrow streets with overhanging galleries frequently force a shuttle.",
  seasonal: "Hurricane season from June through November is the defining constraint, and it overlaps with the traditional summer moving peak. We track named storms against your route and will hold a load rather than deliver into an evacuation order. Late winter and early spring — February through April — is the best moving window in Louisiana: mild, dry, and outside storm season. Summer heat and humidity require early starts and careful handling of anything with veneer or leather.",
  quirks: [
    { title: "Hurricane-season planning", body: "A June-through-November Louisiana move gets active storm monitoring and a slightly wider delivery window. If a mandatory evacuation is issued, we hold the shipment in secure storage rather than running it — and that contingency is written into your contract." },
    { title: "French Quarter and Garden District permits", body: "Truck staging in the historic districts requires city permits and often a shuttle from a legal stopping point. Narrow streets, cast-iron galleries, and one-way lanes make this non-negotiable." },
    { title: "Raised houses and exterior stairs", body: "Post-flood elevated homes across South Louisiana have long exterior staircases. That changes the labor plan significantly and we account for it at survey rather than on the day." }
  ],
  faqs: [
    { q: "Should I move during hurricane season?", a: "You can, with planning. June through November moves get storm monitoring and a wider delivery window. We will not run a loaded trailer into a landfall forecast or an evacuation zone — we hold it in secure storage instead. February through April avoids the question entirely." },
    { q: "Can you move out of the French Quarter?", a: "Yes. It requires a city permit for truck staging and almost always a shuttle, because the narrow one-way streets and overhanging galleries will not admit a full-size trailer. We arrange the permit and price the shuttle into the quote." },
    { q: "How long does a move from Louisiana to Florida take?", a: "New Orleans to Central Florida is about 650 miles and to South Florida roughly 860 — typically 3 to 6 days consolidated, 1 to 2 days dedicated. Both ends of this lane are hurricane-exposed in season, so we build the window accordingly." },
    { q: "Is climate-controlled storage necessary in Louisiana?", a: "For anything beyond a couple of weeks, yes. Louisiana's humidity is hard on wood, leather, upholstery, paper, and electronics, and standard warehouse bays do not manage it. It is a small step to take relative to replacing a damaged piece." }
  ]
},
{
  name: "Maine", slug: "maine", abbr: "ME",
  hub: { city: "Portland", lat: 43.66, lng: -70.26 },
  cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Scarborough", "Saco", "Augusta", "Brunswick", "Westbrook", "Kennebunk", "Camden", "Bar Harbor"],
  neighbors: ["NH"],
  routes: ["FL", "NC", "MA", "TX", "SC", "NH"],
  regulator: "the Maine Department of Transportation and the Bureau of Motor Vehicles motor carrier division",
  highways: ["I-95", "I-295", "US-1", "Maine Turnpike"],
  intro: "Maine is the most seasonally driven moving market in New England. Coastal towns from Kennebunk to Bar Harbor swing between a summer population surge and a quiet winter, and that shapes truck availability and road access across the whole state. Moving companies in Maine also contend with genuine distance — Fort Kent is nearly six hours north of Portland — and with narrow coastal roads where a 53-foot trailer simply cannot go.",
  migration: "Maine flipped to strong net inbound migration during the remote-work shift, drawing households from Massachusetts, New York, and Connecticut into greater Portland and the midcoast. That flow has moderated but not reversed. Outbound moves are dominated by retirees heading to Florida and the Carolinas, and by younger residents leaving for Boston. Aroostook County and the rural north continue to lose population.",
  logistics: "I-95 and the Maine Turnpike carry everything south of Bangor; north of that, US-1 and secondary routes take over and travel times lengthen quickly. Coastal peninsulas — Harpswell, Boothbay, Deer Isle — have narrow winding roads, seasonal weight postings, and island properties that require ferry coordination. Portland's Old Port and West End have narrow one-way streets with limited truck staging and require advance planning.",
  seasonal: "Spring mud season is Maine's distinctive constraint: many towns post weight limits on secondary roads from roughly March into May, which can legally bar a loaded truck from your street. Summer is peak and complicated by tourist traffic on US-1. September and October are ideal — good weather, open roads, and easing demand. Winter moves are quiet but face real snow, and coastal storms can close routes.",
  quirks: [
    { title: "Mud season weight postings", body: "From March through May, many Maine towns legally restrict heavy vehicles on secondary roads. This is the most common cause of a Maine move needing a shuttle, and it is a legal limit rather than a judgment call." },
    { title: "Island and ferry moves", body: "Vinalhaven, Islesboro, and the other year-round islands require ferry reservations for a truck, booked well ahead and subject to weather. Those moves need a wider window by nature." },
    { title: "Long northern distances", body: "A Presque Isle or Fort Kent move involves a five- to six-hour origin leg before joining any long-haul route. We price that leg transparently rather than treating it as an afterthought." }
  ],
  faqs: [
    { q: "What is mud season and will it affect my move?", a: "From roughly March through May, Maine towns post weight limits on secondary roads as the frost leaves the ground. A loaded moving truck may be legally prohibited from your street during that window. We check local postings and plan a shuttle when needed." },
    { q: "Can you move to a Maine island?", a: "Yes — Vinalhaven, North Haven, Islesboro, and others. It requires a ferry reservation for the truck, which books up in summer and is weather-dependent. We build a wider delivery window into island moves for that reason." },
    { q: "How long does a move from Maine to North Carolina take?", a: "Roughly 900 to 1,000 miles, typically 4 to 8 days consolidated or 2 days dedicated. Southbound consolidated space out of northern New England is less frequent than in denser markets, so booking three or more weeks ahead helps." },
    { q: "Is winter moving in Maine practical?", a: "It is quite workable in the Portland area and along I-95. Coastal and northern moves face more genuine risk from nor'easters and unplowed private drives. We plan a contingency day into winter windows rather than promising a date." }
  ]
},
{
  name: "Maryland", slug: "maryland", abbr: "MD",
  hub: { city: "Baltimore", lat: 39.29, lng: -76.61 },
  cities: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf", "Rockville", "Bethesda", "Frederick", "Gaithersburg", "Annapolis", "Bowie", "Towson", "Ellicott City", "Ocean City"],
  neighbors: ["PA", "DE", "VA", "WV", "DC"],
  routes: ["FL", "NC", "TX", "SC", "GA", "PA"],
  regulator: "the Maryland Public Service Commission, which licenses intrastate household-goods carriers",
  highways: ["I-95", "I-270", "I-83", "I-695", "I-70"],
  intro: "Maryland's moving market is really three markets: the Baltimore rowhouse belt, the Montgomery County federal-employment corridor along I-270, and the Eastern Shore. Moving companies in Maryland deal with rowhouse stairs and no off-street parking in Baltimore, security-clearance and agency relocation timelines in Bethesda and Silver Spring, and Bay Bridge constraints for anything crossing to the Shore. Outbound long-distance volume runs heavily to Florida and the Carolinas.",
  migration: "Maryland has a persistent net outflow, mostly to Florida, the Carolinas, Pennsylvania, and Virginia, driven by cost of living and taxes. Montgomery and Prince George's counties lose households to Northern Virginia and to lower-cost states while continuing to receive federal and biotech transfers. Frederick County and the Eastern Shore gain from in-state migration. Annapolis produces steady Navy-related relocation volume with fixed dates.",
  logistics: "I-95 and I-695 carry Baltimore traffic, I-270 handles the federal corridor, and the Bay Bridge is the sole practical crossing to the Eastern Shore — it closes in high winds and backs up badly in summer. Baltimore rowhouses have no driveways, narrow front steps, and often alley access only; parking a truck legally frequently requires a city permit. Bethesda and Silver Spring high-rises require COIs and reserved elevators.",
  seasonal: "Peak is May through August, made worse by federal fiscal-year transitions and the end-of-August university turnover in College Park and Baltimore. Summer humidity is significant. Winter is quiet and generally workable, though Maryland's ice events close I-70 and I-68 in the western counties occasionally. Ocean City and the Shore invert the calendar with heavy summer congestion that limits truck access.",
  quirks: [
    { title: "Baltimore rowhouse access", body: "No driveway, narrow marble steps, tight interior stairs, and permit parking are the standard Baltimore combination. We plan for a city parking permit and often a shuttle, and price both up front." },
    { title: "Bay Bridge wind closures", body: "The only practical Eastern Shore crossing closes in sustained high winds and restricts high-profile vehicles. Shore moves get a contingency built into the window." },
    { title: "Federal corridor timelines", body: "Agency and contractor relocations along I-270 often have fixed report dates. Those go dedicated so delivery is a date, not a spread, and we provide the documentation relocation policies require." }
  ],
  faqs: [
    { q: "Do I need a parking permit to move in Baltimore?", a: "On most permit-parking blocks, yes — the truck needs a city permit to hold curb space legally. Without one, expect a long carry. We file the application, but it takes lead time, so tell us the address early." },
    { q: "Can you move a Baltimore rowhouse?", a: "Yes, it is routine work here. The planning issues are the narrow front steps, tight turning staircases that will not clear a large sofa or box spring, and the lack of any driveway. We assess these at survey and plan disassembly or a hoist as needed." },
    { q: "How long does a move from Maryland to North Carolina take?", a: "About 350 to 500 miles depending on destination — 2 to 5 days consolidated, next-day dedicated. It is short enough that a dedicated truck is worth considering if you want date certainty." },
    { q: "Will the Bay Bridge affect an Eastern Shore move?", a: "It can. The bridge is the only practical crossing, it closes in sustained high winds, and summer weekend backups are severe. We schedule Shore moves for weekday morning crossings and build a contingency into the delivery window." }
  ]
},
{
  name: "Massachusetts", slug: "massachusetts", abbr: "MA",
  hub: { city: "Boston", lat: 42.36, lng: -71.06 },
  cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "Quincy", "Newton", "Somerville", "Framingham", "Waltham", "Brookline", "Medford", "Plymouth"],
  neighbors: ["NH", "VT", "NY", "CT", "RI"],
  routes: ["FL", "NC", "TX", "SC", "CA", "NH"],
  regulator: "the Massachusetts Department of Public Utilities, which licenses intrastate household-goods movers",
  highways: ["I-90 (Mass Pike)", "I-93", "I-95", "I-495", "Route 128"],
  intro: "Boston has the most concentrated moving day in America: September 1, when a huge share of the region's leases turn over at once. Moving companies in Massachusetts plan their entire year around it. Beyond that, the market is defined by triple-decker walk-ups, colonial-era street grids where a 53-foot trailer cannot turn, and city permit requirements for reserving curb space. Long-distance volume out of Massachusetts runs strongly to Florida, the Carolinas, and Texas.",
  migration: "Massachusetts has a steady net outflow driven by housing costs, with Florida, New Hampshire, the Carolinas, Maine, and Texas the leading destinations. It is partly offset by a large, continuous inbound stream of students, academics, biotech workers, and healthcare professionals into Boston and Cambridge. The result is enormous gross moving volume in both directions and a market where crew availability, not distance, is often the binding constraint.",
  logistics: "I-90, I-93, and I-495 handle regional traffic, but the difficulty is local. Boston, Cambridge, and Somerville require a city permit to reserve street space for a moving truck, posted in advance. Triple-decker walk-ups with narrow turning stairs are standard housing stock, and hoisting through a window is a routine solution rather than an exotic one. Beacon Hill and the North End have streets that effectively exclude anything larger than a box truck.",
  seasonal: "September 1 is the defining date — Boston-area leases turn over en masse, trucks and crews are booked out months ahead, and streets are gridlocked. The last week of August is nearly as bad. If you have any flexibility, moving in October, or between January and March, saves real money and stress. Winter moves face nor'easters and snow-narrowed streets that make legal truck parking even harder.",
  quirks: [
    { title: "September 1", body: "Book two to three months ahead for any late-August or September 1 Boston move. This is not ordinary peak-season advice — capacity across the entire region genuinely runs out." },
    { title: "Street occupancy permits", body: "Boston, Cambridge, and Somerville require posted permits to reserve curb space for a truck. Without one, the truck cannot legally stop where you need it and you pay for a long carry instead." },
    { title: "Triple-decker stairs and hoists", body: "Narrow turning staircases are the regional norm. We plan disassembly or a window hoist at survey. The infamous Storrow Drive clearance is also why we route trucks around, not along, the river." }
  ],
  faqs: [
    { q: "Why is September 1 such a problem in Boston?", a: "An unusually large share of leases in Boston, Cambridge, Somerville, Allston, and Brighton all end on August 31. Every mover in the region is booked, streets are jammed, and pricing peaks. Book two to three months ahead or, if you can, move on a different date." },
    { q: "Do I need a permit to park a moving truck in Boston?", a: "Yes, on most streets. Boston, Cambridge, and Somerville issue street-occupancy permits that must be posted in advance to reserve the space. We handle the filing — it is the single most common avoidable problem on a Boston move." },
    { q: "Can you move furniture out of a third-floor walk-up?", a: "Yes, routinely. Triple-deckers with tight turning staircases are the standard housing stock here. Where a piece will not clear the stairs, we disassemble it or hoist it through a window, and we identify that at survey so it is in the price." },
    { q: "How long does a move from Massachusetts to Texas take?", a: "About 1,750 to 1,950 miles, typically 7 to 12 days on a consolidated load and 3 to 4 days dedicated. You get a delivery spread at booking and a confirmed 24-hour window once the truck is dispatched." }
  ]
},
{
  name: "Michigan", slug: "michigan", abbr: "MI",
  hub: { city: "Detroit", lat: 42.33, lng: -83.05 },
  cities: ["Detroit", "Grand Rapids", "Ann Arbor", "Sterling Heights", "Warren", "Lansing", "Troy", "Dearborn", "Livonia", "Kalamazoo", "Novi", "Rochester Hills", "Traverse City", "Royal Oak"],
  neighbors: ["OH", "IN", "WI"],
  routes: ["FL", "TX", "NC", "AZ", "TN", "GA"],
  regulator: "the Michigan Department of Licensing and Regulatory Affairs, which registers intrastate household-goods movers",
  highways: ["I-94", "I-96", "I-75", "I-69", "US-131"],
  intro: "Michigan generates heavy outbound long-distance volume, and the destination mix is unusually seasonal — Florida and Arizona in the fall, Texas and the Carolinas year-round for work. Moving companies in Michigan plan around two geographic realities: the Detroit metro's dense suburban grid, which is easy truck territory, and the northern Lower Peninsula and UP, where distances are long, lake-effect snow is severe, and seasonal road weight limits genuinely restrict loaded trucks in spring.",
  migration: "Michigan's net outflow has moderated but persists, with Florida, Texas, Arizona, and the Carolinas the leading destinations and retirement plus job relocation the main drivers. Grand Rapids and the west side have grown on manufacturing and healthcare, pulling households in from across the state. Ann Arbor runs a strong university and research inbound cycle. Northern Michigan — Traverse City especially — has gained remote workers and second-home conversions.",
  logistics: "I-94, I-96, and I-75 form the backbone; access in the Detroit and Grand Rapids suburbs is straightforward with wide streets and driveways. The complications are northern: US-131 and I-75 north of Grand Rapids see heavy lake-effect snow, spring frost laws restrict axle weights on secondary roads from March into May, and the Mackinac Bridge closes to high-profile vehicles in high winds. UP moves add real distance and time.",
  seasonal: "Peak is May through August with an Ann Arbor and East Lansing spike in late August. Winter is genuinely quiet in Michigan and workable in the southern metros, but lake-effect belts around Grand Rapids, Traverse City, and the UP can drop two feet in a day. Spring frost laws are the underrated issue: from roughly March through May, county road weight restrictions can legally bar a loaded trailer from rural and northern roads.",
  quirks: [
    { title: "Spring frost laws", body: "Michigan counties post seasonal axle-weight restrictions during the spring thaw. On many secondary and northern roads that legally excludes a loaded moving trailer, so we plan a shuttle or shift the date." },
    { title: "Lake-effect snow belts", body: "Snowfall west of Grand Rapids and around Traverse City is dramatically heavier than the state average. Winter delivery windows in those areas get a contingency day." },
    { title: "Snowbird split shipments", body: "A large share of Michigan outbound moves are seasonal Florida and Arizona relocations. We can split an inventory between delivery and storage, and coordinate a return leg months later on the same account." }
  ],
  faqs: [
    { q: "What are Michigan frost laws and do they affect moving?", a: "Yes, they can. From roughly March through May, Michigan counties post seasonal weight restrictions on roads softened by the thaw, and a loaded moving trailer may be legally prohibited. We check postings for your address and plan a shuttle when required." },
    { q: "How long does a move from Michigan to Texas take?", a: "Detroit to Dallas is about 1,200 miles and to Houston roughly 1,300 — typically 5 to 9 days consolidated or 2 to 3 days dedicated. Grand Rapids origins run about the same." },
    { q: "Do you move to and from the Upper Peninsula?", a: "Yes. UP moves involve real distance — Marquette is over 450 miles from Detroit — plus the Mackinac Bridge, which restricts high-profile vehicles in high winds. Winter UP moves get a wider window for snow." },
    { q: "Is winter a good time to move out of Michigan?", a: "Yes — January and February have the best availability of the year. Southern Michigan road maintenance is reliable. The risk concentrates in the lake-effect belts, where a single storm can drop two feet, so we build a contingency day into those windows." }
  ]
},
{
  name: "Minnesota", slug: "minnesota", abbr: "MN",
  hub: { city: "Minneapolis", lat: 44.98, lng: -93.27 },
  cities: ["Minneapolis", "St. Paul", "Rochester", "Bloomington", "Duluth", "Brooklyn Park", "Plymouth", "Woodbury", "Maple Grove", "St. Cloud", "Eagan", "Eden Prairie", "Edina", "Mankato"],
  neighbors: ["ND", "SD", "IA", "WI"],
  routes: ["TX", "FL", "AZ", "CO", "CA", "WI"],
  regulator: "the Minnesota Department of Transportation Office of Freight and Commercial Vehicle Operations",
  highways: ["I-35", "I-94", "I-494", "I-694", "US-169"],
  intro: "The Twin Cities anchor Minnesota's moving market, and the state's defining operational fact is winter — not because moves stop, but because they require different planning. Moving companies in Minnesota deal with subzero loading conditions, spring load restrictions that legally limit truck weights on thawing roads, and a very strong seasonal outbound flow to Arizona, Florida, and Texas. Rochester adds a distinct medical-relocation stream tied to Mayo Clinic.",
  migration: "Minnesota's net migration is modestly negative, with retirees and remote workers leaving for Arizona, Florida, and Texas, and a steady inbound flow of professionals into the Twin Cities for healthcare, medical devices, and corporate headquarters. Rochester grows on Mayo Clinic expansion. Duluth and the Iron Range have their own economic cycle, and the lake country north of Brainerd has gained from second-home conversion.",
  logistics: "I-35 and I-94 cross at the Twin Cities and handle nearly all long-haul volume. Suburban access is easy; the older Minneapolis and St. Paul neighborhoods — Uptown, Como, Cathedral Hill — have narrow streets, alley garages, and winter parking rules that restrict where a truck can stop. Snow emergency routes are strictly enforced and will get a truck towed. Northern lake properties often have long unpaved drives with seasonal limits.",
  seasonal: "Peak is May through August. Winter is quiet but demands real preparation: subzero loading requires shorter crew rotations, extra floor protection for snow and salt, and care with anything brittle or liquid. Snow emergency declarations in Minneapolis and St. Paul change parking rules overnight. Spring load restrictions from roughly March through May limit axle weights on many roads, which can force a shuttle.",
  quirks: [
    { title: "Snow emergency parking rules", body: "When Minneapolis or St. Paul declares a snow emergency, side-of-street parking rules change immediately and enforcement is aggressive. We track declarations and adjust truck staging rather than risk a tow mid-move." },
    { title: "Spring load restrictions", body: "MnDOT and counties post seasonal axle-weight limits during the thaw. A loaded trailer may be legally barred from your street in April. We check the postings and plan around them." },
    { title: "Extreme cold handling", body: "At -10°F, LCD screens, vinyl records, houseplants, liquids, and some adhesives are at genuine risk. We flag these at survey and either move them in a heated compartment or recommend you carry them." }
  ],
  faqs: [
    { q: "Can you move in a Minnesota winter?", a: "Yes, and it is the easiest time of year to get the date you want. We use shorter crew rotations in extreme cold, heavy floor protection for snow and salt, and a heated compartment for cold-sensitive items. The main variables are snow emergency parking rules and occasional blizzard delays." },
    { q: "How long does a move from Minnesota to Arizona take?", a: "Minneapolis to Phoenix is roughly 1,800 miles — 7 to 12 days consolidated, 3 to 4 days dedicated. This is a heavy fall lane with snowbird volume, so booking early for October and November matters." },
    { q: "What are spring load restrictions?", a: "From roughly March through May, MnDOT and Minnesota counties limit axle weights on roads weakened by the frost leaving the ground. A fully loaded moving trailer can be legally prohibited from your street. We check postings for your address and shuttle where required." },
    { q: "Do you handle Mayo Clinic relocations to Rochester?", a: "Yes. Medical relocations usually come with a fixed start date, so we run those as dedicated shipments with a delivery date rather than a spread, and provide the documentation most institutional relocation policies require." }
  ]
},
{
  name: "Mississippi", slug: "mississippi", abbr: "MS",
  hub: { city: "Jackson", lat: 32.30, lng: -90.18 },
  cities: ["Jackson", "Gulfport", "Southaven", "Biloxi", "Hattiesburg", "Olive Branch", "Tupelo", "Meridian", "Madison", "Ridgeland", "Starkville", "Oxford", "Pascagoula", "Vicksburg"],
  neighbors: ["TN", "AL", "LA", "AR"],
  routes: ["TX", "TN", "FL", "GA", "LA", "NC"],
  regulator: "the Mississippi Public Service Commission, which regulates intrastate household-goods carriers",
  highways: ["I-55", "I-20", "I-59", "I-10"],
  intro: "Mississippi's moving market runs on three corridors: I-55 north toward Memphis, I-20 east–west through Jackson, and I-10 along the Gulf Coast. Moving companies in Mississippi see the state's largest concentration of activity in DeSoto County — Southaven and Olive Branch function as Memphis suburbs — and along the coast, where casino and shipbuilding employment plus hurricane recovery drive turnover. Long-distance volume heads primarily to Texas and Tennessee.",
  migration: "Mississippi has a persistent net outflow, with Texas, Tennessee, Georgia, and Florida the leading destinations. DeSoto County is the state's clear growth area, absorbing households from Memphis. The Gulf Coast around Gulfport and Biloxi runs its own cycle tied to shipbuilding at Pascagoula, casino employment, and post-storm rebuilding. Oxford and Starkville produce concentrated university-driven volume each August.",
  logistics: "The interstate grid handles the metros well, but a large fraction of Mississippi addresses are rural, with long gravel drives, low tree canopy, and county bridges carrying posted weight limits. Those moves need a surveyed last mile and often a shuttle. Delta roads flood in spring. On the coast, elevated post-Katrina homes with long exterior staircases substantially change the labor plan for a move.",
  seasonal: "Peak is May through August, compounded by heat and humidity that push crews to early starts. Hurricane season from June through November affects the coastal counties directly, and we monitor named storms against coastal delivery dates. Spring brings severe weather across the state. October through April is the most comfortable stretch to move in Mississippi.",
  quirks: [
    { title: "Elevated coastal homes", body: "Post-Katrina construction along the coast is typically raised eight to fourteen feet with long exterior stairs. That changes crew size and time significantly, and we account for it at survey rather than on the day." },
    { title: "Rural bridge weight limits", body: "Posted county bridges are common on Mississippi's rural routes. A loaded tractor-trailer may be legally excluded from the last two miles, which is why we check the route before quoting." },
    { title: "Memphis-adjacent DeSoto County", body: "Southaven and Olive Branch moves are operationally Memphis moves — the metro's traffic patterns and destination-side requirements apply even though the origin is in Mississippi." }
  ],
  faqs: [
    { q: "Can a moving truck reach a rural Mississippi property?", a: "Often, but posted county bridge weight limits, soft gravel drives, and low tree canopy sometimes rule out a tractor-trailer. We survey the last mile in advance and quote a shuttle if required, rather than discovering it on move day." },
    { q: "How does hurricane season affect a Gulf Coast move?", a: "From June through November we monitor named storms against your route and dates, and we will hold a loaded trailer rather than deliver into an evacuation zone. Coastal moves in that window get a slightly wider delivery spread by design." },
    { q: "How long does a move from Mississippi to Tennessee take?", a: "Jackson to Nashville is about 410 miles and to Memphis roughly 210 — typically 1 to 4 days depending on whether you choose consolidated or dedicated service. DeSoto County origins are essentially local to Memphis." },
    { q: "Do you handle Ole Miss and Mississippi State student moves?", a: "Yes. Oxford and Starkville generate concentrated volume in August, and small apartment loads travel as consolidated shipments, sharing a trailer rather than taking a dedicated truck. Book those August dates six weeks out." }
  ]
},
{
  name: "Missouri", slug: "missouri", abbr: "MO",
  hub: { city: "St. Louis", lat: 38.63, lng: -90.20 },
  cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "Blue Springs", "Joplin", "Chesterfield", "Jefferson City", "Branson"],
  neighbors: ["IA", "IL", "KY", "TN", "AR", "OK", "KS", "NE"],
  routes: ["TX", "FL", "CO", "AZ", "TN", "CA"],
  regulator: "the Missouri Department of Transportation Motor Carrier Services division",
  highways: ["I-70", "I-44", "I-55", "I-35", "I-64"],
  intro: "Missouri borders eight states and sits at the intersection of I-70, I-44, and I-55, which makes it one of the easiest places in the country to catch a consolidated load going almost anywhere. Moving companies in Missouri work two large metros with very different housing stock — St. Louis's brick two-flats and Kansas City's sprawling suburbs — plus the Ozarks, where steep terrain and lake properties routinely require shuttle service.",
  migration: "Missouri runs close to migration balance with a slight outflow, most of it to Texas, Florida, Colorado, and Arizona. Both metros gain households from smaller Missouri cities and from Illinois — the St. Louis metro in particular absorbs families crossing from the Illinois side. Springfield and Branson have grown steadily, and the Lake of the Ozarks region has converted a substantial number of second homes into primary residences.",
  logistics: "The interstate grid is excellent and truck access in the suburbs is easy. St. Louis's city neighborhoods — Soulard, Lafayette Square, the Central West End — have narrow streets, alley loading, and historic-district restrictions. Kansas City is generally simpler. The Ozarks are the exception: steep, winding roads and lake properties on long private drives frequently require a shuttle, and low-water bridges can flood.",
  seasonal: "Peak is May through August, with a Columbia spike in mid-August for the university calendar. Missouri summers are hot and humid enough to require early starts. Winter is quiet and mostly workable, though ice storms across the middle of the state close I-70 occasionally. Spring is the flood season — the Missouri and Mississippi rivers can close secondary routes and low-water crossings in the Ozarks.",
  quirks: [
    { title: "Eight-state border advantage", body: "Missouri touches more states than almost anywhere, and I-70, I-44, and I-55 all pass through. That means unusually frequent consolidated departures and competitive shared-load pricing in most directions." },
    { title: "Ozark lake-property access", body: "Lake of the Ozarks and Table Rock homes commonly sit on steep switchback drives with limited turnaround. We survey these and plan a shuttle rather than risk a truck on a grade it cannot climb loaded." },
    { title: "St. Louis historic districts", body: "Soulard, Lafayette Square, and Benton Park have protected streetscapes, narrow lanes, and alley-only access. Truck staging there needs planning, and often a smaller vehicle at the curb." }
  ],
  faqs: [
    { q: "When should I schedule a Missouri move?", a: "October is the best month by weather and availability. May through August is peak, with a Columbia spike in mid-August for the university calendar, and Missouri summers are humid enough to require early starts. Winter is mostly workable though ice storms close I-70 across the middle of the state occasionally. Spring is flood season — the Missouri and Mississippi can close secondary routes and low-water crossings in the Ozarks." },
    { q: "How long does a move from Missouri to Colorado take?", a: "Kansas City to Denver is about 600 miles and St. Louis to Denver roughly 850 — 2 to 6 days consolidated or 1 to 2 days dedicated. Winter deliveries into the Colorado mountains get a contingency day for pass conditions." },
    { q: "Can you move a property at Lake of the Ozarks?", a: "Yes, and it usually requires a shuttle. Steep switchback drives, limited turnaround space, and lakefront lots that drop sharply from the road mean a tractor-trailer often cannot make the last quarter mile. We survey and price that in advance." },
    { q: "Are spring floods a risk for a Missouri move?", a: "In some areas. River flooding along the Missouri and Mississippi and low-water crossings in the Ozarks can close secondary routes in spring. It rarely blocks a move outright but can add a day, so we build that into spring delivery windows." }
  ]
},
{
  name: "Montana", slug: "montana", abbr: "MT",
  hub: { city: "Billings", lat: 45.79, lng: -108.50 },
  cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Whitefish", "Belgrade", "Livingston", "Miles City", "Anaconda", "Sidney"],
  neighbors: ["ND", "SD", "WY", "ID"],
  routes: ["WA", "CA", "TX", "AZ", "CO", "ID"],
  regulator: "the Montana Department of Transportation Motor Carrier Services division",
  highways: ["I-90", "I-15", "I-94", "US-93"],
  intro: "Montana is a long-haul state by definition — Billings to Seattle is over 800 miles and to Dallas nearly 1,400 — so almost every move here is a genuine long-distance move. Moving companies in Montana plan around distance, mountain passes, and a short construction-and-moving season. The Bozeman–Belgrade corridor and the Flathead Valley around Kalispell and Whitefish have absorbed the bulk of the state's recent inbound migration, mostly from California and Washington.",
  migration: "Montana became one of the highest net-inbound states per capita during the remote-work shift, with Gallatin County (Bozeman) and Flathead County (Kalispell, Whitefish) taking most of it. Origins skew heavily toward California, Washington, Colorado, and Texas. Outbound volume is modest and mostly young residents leaving for larger job markets. Eastern Montana's population tracks the Bakken energy cycle.",
  logistics: "I-90 crosses the state east–west and I-15 runs north–south; between them they carry nearly all moving freight. The passes are the scheduling variable — Lookout, Homestake, and MacDonald Pass see chain conditions from October into May. Distances between towns are large enough that a single day of driving may not clear the state. Ranch properties on long unpaved roads and mountain-valley homes routinely require a shuttle.",
  seasonal: "The practical Montana moving season is May through October. Winter moves are possible but need a genuinely flexible window: passes close, ground blizzards shut down I-90 and I-15, and unplowed private drives can make a property unreachable for days. June through September is peak for both weather and demand, and Bozeman and Kalispell book out early because crew capacity in the area is limited relative to inbound demand.",
  quirks: [
    { title: "Inbound-heavy imbalance", body: "Far more household goods come into Montana than leave. That means outbound consolidated space is often available at attractive rates, while inbound summer capacity is genuinely scarce and needs early booking." },
    { title: "Pass conditions and chain law", body: "From October through May, Montana's mountain passes see chain restrictions and closures. Winter delivery windows here are wider by necessity, and we would rather tell you that than miss a promised date." },
    { title: "Ranch and valley access", body: "Long unpaved county roads and steep valley drives are the norm outside town. We survey the last mile and plan a shuttle, which is common enough in Montana that it should be assumed rather than treated as an exception." }
  ],
  faqs: [
    { q: "Can you move to Montana in the winter?", a: "Yes, with a realistic window. Mountain passes close, I-90 and I-15 see ground blizzards, and unplowed private drives can be impassable to a truck. We plan contingency days into winter windows rather than promising a date we would have to break." },
    { q: "How long does a move from Montana to Texas take?", a: "Billings to Dallas is roughly 1,400 miles and to Houston about 1,650 — 6 to 11 days consolidated, 3 to 4 days dedicated. Montana's distance from major freight lanes means consolidated departures are less frequent, so booking ahead helps materially." },
    { q: "Will a big truck reach my Montana property?", a: "Frequently not the whole way. Long gravel county roads, steep valley drives, and seasonal mud make a shuttle common here. We check the route in advance using satellite imagery and local contact, and quote the shuttle up front." },
    { q: "When is the best time to move in Montana?", a: "Late May through early October. Passes are clear, roads are dry, and access to rural properties is reliable. If you can move in May or September rather than midsummer, you get the same conditions with far better crew availability." }
  ]
}
];
