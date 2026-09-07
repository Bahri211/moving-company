#!/usr/bin/env node
/**
 * Post-build checks: link integrity, schema validity, and content uniqueness.
 *
 * State pages deliberately share the homepage's chrome (nav, hero shell, trust
 * bar, services cards, gallery, footer), so a high raw overlap figure is
 * expected and fine. What matters is that each page carries enough prose that
 * appears nowhere else on the site — that is what `distinctive` measures, using
 * 8-word shingles counted across every page and kept only where the count is 1.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const MIN_WORDS = 900;          // total visible words on a page
const MIN_DISTINCTIVE = 400;    // 8-word phrases unique to that page

// These pages carry no prices. The only permitted dollar figure is the trust
// bar's "$1M" insurance coverage, copied verbatim from index.html.
const ALLOWED_MONEY = /^\$1M$/;

// No FAQ may ask about price. Matches the text inside a .faq-q button.
const PRICE_QUESTION = /how much (does|do|would|will) .{0,80}\bcost\b|cheapest time|is it cheaper|what (does|do) .{0,60}\bcost\b|price list|how much .{0,40}\bto move\b/i;

const pages = [];
for (const entry of fs.readdirSync(ROOT)) {
  const idx = path.join(ROOT, entry, 'index.html');
  if (entry.startsWith('moving-') && fs.existsSync(idx)) pages.push(['/' + entry + '/', idx]);
}
pages.push(['/', path.join(ROOT, 'index.html')]);

// Hand-written pages: link and price checks apply, the generated-content
// checks (word counts, JSON-LD, canonical) do not.
const HAND_WRITTEN = [
  ['/privacy-policy', path.join(ROOT, 'privacy-policy.html')],
  ['/terms-of-service', path.join(ROOT, 'terms-of-service.html')],
].filter(([, f]) => fs.existsSync(f));

// Every page on the site must link to both legal pages, in the canonical
// clean-URL form — the .html form works but costs a redirect under cleanUrls.
const LEGAL = [
  { name: 'Privacy Policy', href: '/privacy-policy', stale: /href="\/?privacy-policy\.html"/ },
  { name: 'Terms of Service', href: '/terms-of-service', stale: /href="\/?terms-of-service\.html"/ },
];

const errors = [];
const titles = new Map(), descs = new Map();
const shingleCounts = new Map();
const perPage = [];
let totalLinks = 0;

function resolve(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return path.join(ROOT, 'index.html');
  const rel = clean.replace(/^\//, '');
  return [
    path.join(ROOT, rel),
    path.join(ROOT, rel, 'index.html'),
    path.join(ROOT, rel + '.html'),
  ].find(fs.existsSync) || null;
}

function visibleWords(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase().trim().split(' ');
}

function shinglesOf(words) {
  const set = new Set();
  for (let i = 0; i + 8 <= words.length; i++) set.add(words.slice(i, i + 8).join(' '));
  return set;
}

// ---- pass 1: per-page checks, and tally every shingle across the whole site.
for (const [url, file] of [...pages, ...HAND_WRITTEN]) {
  const html = fs.readFileSync(file, 'utf8');
  for (const legal of LEGAL) {
    if (!html.includes(`href="${legal.href}"`)) {
      errors.push(`${url} has no ${legal.name} link (expected href="${legal.href}")`);
    }
    if (legal.stale.test(html)) {
      errors.push(`${url} links ${legal.name} via .html — use ${legal.href}`);
    }
  }
  if (!pages.some(([u]) => u === url)) continue;

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const h1s = html.match(/<h1[\s>]/g) || [];

  if (!title) errors.push(`${url} missing <title>`);
  if (!desc) errors.push(`${url} missing meta description`);
  if (!canonical) errors.push(`${url} missing canonical`);
  if (h1s.length !== 1) errors.push(`${url} has ${h1s.length} <h1> elements (want exactly 1)`);
  if (desc && (desc.length < 70 || desc.length > 320)) {
    errors.push(`${url} description length ${desc.length} outside 70-320`);
  }
  if (titles.has(title)) errors.push(`Duplicate title: ${url} and ${titles.get(title)}`);
  titles.set(title, url);
  if (descs.has(desc)) errors.push(`Duplicate description: ${url} and ${descs.get(desc)}`);
  descs.set(desc, url);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) errors.push(`${url} has no JSON-LD`);
  for (const [, body] of blocks) {
    try { JSON.parse(body); } catch (e) { errors.push(`${url} invalid JSON-LD: ${e.message}`); }
  }

  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    totalLinks++;
    if (!resolve(href)) errors.push(`${url} broken link -> ${href}`);
  }

  // Generated pages only — index.html's own copy is left as the client wrote it.
  if (url !== '/') {
    // FAQ text appears twice — the visible accordion button and the FAQPage
    // JSON-LD that feeds Google's rich results. Both must be clean.
    const questions = [];
    for (const [, q] of html.matchAll(/<button class="faq-q"[^>]*>([\s\S]*?)<span/g)) {
      questions.push(['accordion', q.replace(/<[^>]+>/g, '').trim()]);
    }
    for (const [, body] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      let parsed;
      try { parsed = JSON.parse(body); } catch { continue; }
      JSON.stringify(parsed, (k, v) => {
        if (k === 'name' && typeof v === 'string') questions.push(['schema', v]);
        return v;
      });
    }
    for (const [where, text] of questions) {
      if (PRICE_QUESTION.test(text)) {
        errors.push(`${url} has a price question (${where}): "${text}"`);
      }
    }
    for (const [, amount] of html.matchAll(/(\$[\d,]+(?:\.\d+)?[MKB]?)/g)) {
      if (!ALLOWED_MONEY.test(amount)) errors.push(`${url} contains a price: ${amount}`);
    }
    for (const field of ['priceSpecification', 'minPrice', 'maxPrice', 'priceCurrency']) {
      if (html.includes(`"${field}"`)) errors.push(`${url} has pricing in JSON-LD: ${field}`);
    }
  }

  const words = visibleWords(html);
  const shingles = shinglesOf(words);
  for (const sh of shingles) shingleCounts.set(sh, (shingleCounts.get(sh) || 0) + 1);
  perPage.push({ url, words: words.length, shingles });
}

// ---- pass 2: a shingle is distinctive only if it appears on exactly one page.
const stats = [];
for (const { url, words, shingles } of perPage) {
  let distinctive = 0;
  for (const sh of shingles) if (shingleCounts.get(sh) === 1) distinctive++;
  const shared = shingles.size ? 1 - distinctive / shingles.size : 0;
  stats.push({ url, words, distinctive, shared });

  if (url === '/') continue;
  if (words < MIN_WORDS) errors.push(`${url} thin: only ${words} words`);
  if (distinctive < MIN_DISTINCTIVE) {
    errors.push(`${url} only ${distinctive} distinctive phrases (want >= ${MIN_DISTINCTIVE})`);
  }
}

const gen = stats.filter(s => s.url !== '/');
const med = arr => arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)];

console.log(`Checked ${pages.length} generated pages + ${HAND_WRITTEN.length} hand-written, ${totalLinks} internal links.`);
console.log(`Legal links: Privacy Policy and Terms of Service present on all ${pages.length + HAND_WRITTEN.length} pages.`);
console.log(`Words per generated page: min ${Math.min(...gen.map(s => s.words))}, median ${med(gen.map(s => s.words))}`);
console.log(`Distinctive phrases per page: min ${Math.min(...gen.map(s => s.distinctive))}, median ${med(gen.map(s => s.distinctive))}`);
console.log(`Shared chrome: median ${(med(gen.map(s => s.shared)) * 100).toFixed(0)}% of phrases (expected — same components as the homepage)`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  errors.slice(0, 40).forEach(e => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log('All checks passed.');
