# State landing page generator

Builds one indexable page per state at `/moving-from-<slug>/`, a hub at
`/moving-companies-by-state/`, plus `sitemap.xml` and `robots.txt`.

```bash
npm run build:seo    # generate, then verify
npm run verify:seo   # verify only
```

## Design: one template, homepage components only

Every generated page is assembled from the components that already exist in
`index.html` — same nav, hero (eyebrow, headline, truck image, stat cards,
quote form), trust bar, `.coverage-section` pill grid, `.services` card grid,
dark `.process-section`, gallery, `.faq-wrap` accordion, contact strip, footer
and sticky CTA — in a section order that keeps the homepage's alternating
paper / paper-warm / dark rhythm.

The generator adds **no new visual components**. The only CSS these pages need
beyond `styles.css` as it already stood is link styling for elements that are
static on the homepage (`a.state-item`, `.eyebrow a`, `.service-card h3 a`,
`.section-header p a`) — about twenty lines, grouped at the end of the file.

Section order on a state page:

| # | Section | Component | Background |
|---|---------|-----------|------------|
| 1 | Hero | `.hero` | paper |
| 2 | Trust bar | `.trust-bar` | warm |
| 3 | Cities served | `.coverage-section` | warm |
| 4 | Popular routes | `.services` | paper |
| 5 | What shapes the price | `.coverage-section` + `.services` | warm |
| 6 | Services | `.services` | paper |
| 7 | What's different | `.process-section` | dark |
| 8 | What catches people out | `.services` | paper |
| 9 | Gallery | `.gallery-section` | warm |
| 10 | FAQ | `.faq-section` | warm |
| 11 | Nearby states | `.states-grid` | paper |
| 12 | Contact + footer | `.contact-strip`, `footer` | dark |

Card counts are chosen to fill the grids evenly: six route cards and six
price-driver cards in the 3-up services grid, four process steps, three
"catches people out" cards.

## No prices

These pages deliberately carry **no dollar figures**. Cost is addressed by
explaining what drives it — distance and lane, weight rather than room count,
access at both ends, packing scope, storage between dates, and valuation — and
by pointing to a free survey. Do not reintroduce price ranges, price tables, or
`priceSpecification` / `Offer` price fields in the JSON-LD; the route schema
uses a plain `OfferCatalog` of `Service` entries with no pricing. The one
remaining dollar figure on these pages is `$1M insurance coverage` in the trust
bar, which is copied verbatim from `index.html` and is a coverage amount, not a
price.

## Editing content

All per-state copy lives in `data/states-{a,b,c,d}.js` (49 entries, split only
to keep files readable) plus `data/services-intros.js`. `data/states.js`
merges and validates them.

Each entry carries the hand-written, state-specific fields that keep these
pages from reading as templates: `intro`, `migration`, `logistics`, `seasonal`,
`servicesIntro`, three `quirks`, and five `faqs`. Edit those directly —
everything else on the page (distances, transit windows, schema, cross-links)
is derived.

Derived values:

- **Distances** — great-circle between state hub cities × 1.17 road factor.
- **Cross-links** — from each state's `neighbors`, `routes`, and the shared
  `POPULAR` list. `data/states.js` fails the build on an unknown state code.

## Rotated copy (`data/variants.js`)

Copy that isn't state-specific used to be byte-identical on all 49 pages, which
is duplicate content. Every such block now lives in `data/variants.js` as four
hand-written phrasings of the same claim: the five generic price drivers, the
service card descriptions, the licensing FAQ answer, the illustrated band, and
the lead paragraph and `<h2>` of each section.

`pick(key, state)` in `build-state-pages.js` assigns one variant per state
positionally — `(state index + hash of the key) % variants.length` — so each
key is spread evenly over the 49 pages (12–13 each) and the keys rotate
independently, leaving every page with a combination of wordings no other page
has. Called without a state (the hub) it returns the first variant.

Variants support `{{state}}`, `{{a}}` ("a"/"an"), `{{regulator}}`, `{{usdot}}`,
`{{mc}}`, `{{phone}}` and `{{phoneHref}}`. Variants of one key must be
interchangeable in meaning — never let one promise something its siblings
don't — and should be close in length, since the cards they sit in are sized
for both extremes. Adding a fifth variant to a key is always safe.

What is still identical everywhere is chrome: the trust bar, gallery captions,
quote form and its SMS consent line, contact strip and footer. That text
describes the company (and in the consent line, must stay verbatim), so it
lives as constants in `build-state-pages.js`.

## Adding a state

Append an entry to any part file and add its `servicesIntro`. The validator
enforces required fields, unique slugs, ≥5 FAQs and ≥10 cities.

`verify-seo.js` then enforces unique titles and descriptions, one `<h1>`, valid
JSON-LD, resolvable internal links, ≥900 words, and ≥400 *distinctive* 8-word
phrases — phrases that appear on exactly one page site-wide. That last metric
is the one that matters: shared chrome pushes raw overlap to roughly 47% by
design, so the check measures distinctive content instead of capping overlap.

## Legal links

Privacy Policy and Terms of Service must be linked from **every** page. Site-wide
they use the clean-URL form `/privacy-policy` and `/terms-of-service` — absolute,
so they resolve identically from a subdirectory like `/moving-from-texas/`, and
without the `.html` suffix, which `cleanUrls` would 308-redirect away.

`verify-seo.js` enforces this across all pages including the two hand-written
legal pages, and fails the build both when a link is missing and when one
reverts to the `.html` form.

Those extensionless URLs need matching config in **both** places that serve the
site, or they 404:

- production — `"cleanUrls": true` in `vercel.json`
- local dev — `extensions: ['html']` on `express.static` in `server/server.js`

If you add another way to serve the site, it needs the same mapping.

## Canonical origin

`SITE` in `build-state-pages.js` defaults to `https://www.50statemovers.com`
— with the `www`, because that is what the live site serves: the apex
307-redirects to it, so an apex canonical would point at a redirect.
Override per build with `SITE_URL=https://example.com npm run build:seo`.
