#!/usr/bin/env node
/**
 * Builds scripts/data/top-cities.js — the most populous municipalities in each
 * state, for the "We service every city, village, and town" section.
 *
 * Source: US Census Bureau, Vintage 2023 population estimates (July 1, 2023)
 * for incorporated places and minor civil divisions:
 *   https://www2.census.gov/programs-surveys/popest/datasets/2020-2023/cities/totals/sub-est2023.csv
 *
 * Run: node scripts/build-top-cities.js [path/to/sub-est2023.csv]
 * With no path the file (about 7 MB) is downloaded to the system temp dir.
 *
 * What counts as a municipality:
 *  - Every incorporated place (SUMLEV 162): cities, towns, villages, boroughs.
 *    That includes the few rows not flagged as active governments — the
 *    "(balance)" rows of consolidated city-counties like Nashville and
 *    Indianapolis, and Baton Rouge and Lafayette — which are the cities people
 *    mean. The one exclusion is Honolulu, a census-designated place.
 *  - Where towns and townships are full municipalities that don't overlap the
 *    cities (New England, New Jersey, Pennsylvania, New York, Michigan,
 *    Wisconsin, Minnesota), active minor civil divisions (SUMLEV 061,
 *    FUNCSTAT A) too, so Edison Township and the Town of Hempstead count.
 *    Elsewhere (Ohio, Indiana, Illinois…) townships contain the cities inside
 *    them, and listing them would double up.
 *  - Unincorporated communities (Paradise, NV; Columbia, MD) aren't in this
 *    file, so they aren't listed. Nevada has only 19 incorporated cities and
 *    Rhode Island 39 municipalities, so those lists are shorter than 50.
 *    Washington D.C. is a single city and gets no list.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { states } = require('./data/states.js');

const SOURCE = 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2023/cities/totals/sub-est2023.csv';
const OUT = path.join(__dirname, 'data', 'top-cities.js');
const LIMIT = 50;

const MCD_STATES = new Set(['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire',
  'Rhode Island', 'Vermont', 'New Jersey', 'Pennsylvania', 'New York', 'Michigan',
  'Wisconsin', 'Minnesota']);

// Consolidated city-counties, shortened to the name people actually use.
const RENAME = {
  'New York city': 'New York City',
  'Nashville-Davidson metropolitan government (balance)': 'Nashville',
  'Louisville/Jefferson County metro government (balance)': 'Louisville',
  'Augusta-Richmond County consolidated government (balance)': 'Augusta',
  'Athens-Clarke County unified government (balance)': 'Athens',
  'Butte-Silver Bow (balance)': 'Butte',
  'Lexington-Fayette urban county': 'Lexington',
  'Macon-Bibb County': 'Macon',
  'Anaconda-Deer Lodge County': 'Anaconda',
};

// Census legal descriptors are lowercase, which keeps "Carson City" and the
// second "City" in "Jersey City city" intact.
const TYPE = / (city and borough|charter township|metro township|township|borough|village|town|city|municipality|plantation)$/;

function clean(name) {
  if (RENAME[name]) return { display: RENAME[name], type: 'city' };
  let n = name.replace(/ \(balance\)$/, '');
  const m = n.match(TYPE);
  const type = m ? m[1] : '';
  if (m) n = n.slice(0, -m[0].length);
  // Massachusetts towns with a city form of government: "Barnstable Town city".
  if (type === 'city') n = n.replace(/ Town$/, '');
  return { display: n, type };
}

function splitLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(download(new URL(res.headers.location, url).href, dest));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const f = fs.createWriteStream(dest);
      res.pipe(f); f.on('finish', () => f.close(() => resolve(dest)));
    }).on('error', reject);
  });
}

async function main() {
  let csv = process.argv[2];
  if (!csv) {
    csv = path.join(os.tmpdir(), 'sub-est2023.csv');
    console.log(`Downloading ${SOURCE}`);
    await download(SOURCE, csv);
  }
  const lines = fs.readFileSync(csv, 'latin1').split(/\r?\n/).filter(Boolean);
  const head = splitLine(lines[0]);
  const col = k => head.indexOf(k);
  const rows = lines.slice(1).map(l => {
    const v = splitLine(l);
    return { sumlev: v[col('SUMLEV')], state: v[col('STATE')], county: v[col('COUNTY')],
      func: v[col('FUNCSTAT')], name: v[col('NAME')], stname: v[col('STNAME')],
      pop: Number(v[col('POPESTIMATE2023')]) };
  });

  const counties = new Map(rows.filter(r => r.sumlev === '050').map(r => [r.state + r.county, r.name]));
  const out = {};
  const short = [];

  for (const s of states) {
    const mine = rows.filter(r => r.stname === s.name);
    if (!mine.length) { console.log(`  ${s.name}: not a state in the Census file — no list`); continue; }

    const cands = mine.filter(r =>
      (r.sumlev === '162' && r.func !== 'S') ||
      (r.sumlev === '061' && r.func === 'A' && MCD_STATES.has(s.name)));
    // Bigger first; on a tie prefer the place row to its township twin.
    cands.sort((a, b) => b.pop - a.pop || (a.sumlev === '162' ? -1 : 1));

    const picked = [];
    for (const r of cands) {
      const c = { ...clean(r.name), pop: r.pop, county: counties.get(r.state + r.county) || '' };
      // A town or township covering exactly the same people as a city is the
      // same municipality listed twice.
      if (picked.some(p => p.display === c.display && Math.abs(p.pop - c.pop) <= 0.01 * Math.max(p.pop, c.pop))) continue;
      picked.push(c);
      if (picked.length === LIMIT) break;
    }

    // Same name twice (the Town and the Village of Hempstead): add the type;
    // same name and type twice (two Washington Townships): add the county.
    // Counts are taken before any label changes — relabelling one member of a
    // pair mid-count would leave the other looking unique and unlabelled.
    const clashes = key => {
      const n = new Map();
      for (const p of picked) n.set(key(p), (n.get(key(p)) || 0) + 1);
      return p => n.get(key(p)) > 1;
    };
    const nameClash = clashes(p => p.display);
    for (const p of picked) p.label = nameClash(p) ? `${p.display} (${p.type || 'municipality'})` : p.display;
    const labelClash = clashes(p => p.label);
    for (const p of picked) if (labelClash(p) && p.county) {
      const t = p.type ? ' ' + p.type.replace(/\b\w/g, ch => ch.toUpperCase()) : '';
      p.label = `${p.display}${t} (${p.county})`;
    }

    out[s.slug] = picked.map(p => p.label);
    if (picked.length < LIMIT) short.push(`${s.name} ${picked.length}`);
  }

  const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  fs.writeFileSync(OUT, `// Generated by scripts/build-top-cities.js — do not edit by hand.
// US Census Bureau, Vintage 2023 population estimates (July 1, 2023), largest
// first. See the builder for which municipalities count.
module.exports = {
${body}
};
`);
  console.log(`Wrote ${Object.keys(out).length} states to ${path.relative(process.cwd(), OUT)}`);
  if (short.length) console.log(`Fewer than ${LIMIT}: ${short.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
