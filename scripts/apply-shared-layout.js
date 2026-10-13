#!/usr/bin/env node
/* Applies the shared new-design layout (scripts/lib/shared-layout.js) to the
 * NYC pages, which are edited in place rather than generated. Safe to run
 * again: steps already made are skipped.
 *
 *   node scripts/apply-shared-layout.js
 */
const fs = require('fs');
const path = require('path');
const { applySharedLayout } = require('./lib/shared-layout');

const ROOT = path.join(__dirname, '..');
const PAGES = [
  'nyc-long-distance-movers', 'nyc-to-florida-long-distance-movers', 'nyc-to-north-carolina-and-georgia-movers',
  'nyc-to-texas-long-distance-movers', 'nyc-to-california-long-distance-movers', 'nyc-to-chicago-movers', 'nyc-to-boston-movers',
];
for (const slug of PAGES) {
  const file = path.join(ROOT, slug, 'index.html');
  const before = fs.readFileSync(file, 'utf8');
  const after = applySharedLayout(before);
  if (after !== before) fs.writeFileSync(file, after);
  console.log(`${after === before ? 'Unchanged' : 'Updated'} /${slug}/`);
}
