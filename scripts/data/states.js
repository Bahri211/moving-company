const parts = [
  require('./states-a.js'),
  require('./states-b.js'),
  require('./states-c.js'),
  require('./states-d.js'),
];

const servicesIntros = require('./services-intros.js');

const states = parts.flat()
  .map(s => ({ ...s, servicesIntro: servicesIntros[s.abbr] }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Integrity checks — a duplicate slug would silently overwrite a page.
const seen = new Set();
for (const s of states) {
  for (const key of ['name', 'slug', 'abbr', 'hub', 'cities', 'neighbors', 'routes',
                     'regulator', 'highways', 'intro', 'migration', 'logistics',
                     'seasonal', 'quirks', 'faqs', 'servicesIntro']) {
    if (!s[key]) throw new Error(`${s.name || 'unknown state'}: missing "${key}"`);
  }
  if (seen.has(s.slug)) throw new Error(`Duplicate slug: ${s.slug}`);
  seen.add(s.slug);
  // Four here; the generator appends a licensing FAQ, so pages render five.
  if (s.faqs.length < 4) throw new Error(`${s.name}: needs at least 4 FAQs`);
  if (s.cities.length < 10) throw new Error(`${s.name}: needs at least 10 cities`);
}

const byAbbr = Object.fromEntries(states.map(s => [s.abbr, s]));
for (const s of states) {
  for (const a of [...s.neighbors, ...s.routes]) {
    if (!byAbbr[a]) throw new Error(`${s.name}: unknown state code "${a}"`);
  }
}

module.exports = { states, byAbbr };
