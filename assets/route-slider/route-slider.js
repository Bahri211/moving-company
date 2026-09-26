/*
 * "Drag the truck" route slider. A wide road scene runs from a New York
 * street to the destination town; the truck is the slider handle, and the
 * scenery, sky and journey label follow it.
 *
 * To use it on a page:
 *   <link rel="stylesheet" href="/assets/route-slider/route-slider.css">
 *   <div class="rs" data-route-slider data-route="florida"></div>
 *   <script src="/assets/route-slider/route-slider.js" defer></script>
 *
 * data-route picks one of the ROUTES below. Anything in a route can be
 * overridden per page with JSON, e.g.
 *   data-route-config='{"to":"Orlando","steps":[{"at":0,"text":"Day 1 · Loaded in Queens"}]}'
 *
 * Scene themes for the destination end: palms, pines, desert, city.
 * Everything is drawn here as inline SVG; no images are loaded.
 */
(function () {
  'use strict';

  var ROUTES = {
    florida: {
      from: 'New York City', to: 'Miami', theme: 'palms', welcome: ['Welcome to', 'Florida'],
      signs: [{ at: 0.3, title: 'I-95 South', sub: 'Richmond · Raleigh' }, { at: 0.75, state: 'Virginia' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in Brooklyn' },
        { at: 0.28, text: 'Day 1 · New Jersey Turnpike' },
        { at: 0.5, text: 'Day 2 · I-95, Virginia' },
        { at: 0.72, text: 'Day 2 · Crossing into Florida' },
        { at: 0.94, text: 'Day 3 · Delivered in Miami' },
      ],
    },
    carolinas: {
      from: 'New York City', to: 'Charlotte', theme: 'pines', welcome: ['Welcome to', 'North Carolina'],
      signs: [{ at: 0.3, title: 'I-85 South', sub: 'Durham · Charlotte' }, { at: 0.75, state: 'Virginia' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in Queens' },
        { at: 0.3, text: 'Day 1 · I-95, Virginia' },
        { at: 0.62, text: 'Day 2 · I-85 into North Carolina' },
        { at: 0.94, text: 'Day 2 · Delivered in Charlotte' },
      ],
    },
    texas: {
      from: 'New York City', to: 'Dallas', theme: 'desert', welcome: ['Welcome to', 'Texas'],
      signs: [{ at: 0.3, title: 'I-81 South', sub: 'Knoxville' }, { at: 0.75, state: 'Tennessee' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in Manhattan' },
        { at: 0.3, text: 'Day 2 · I-81, Tennessee' },
        { at: 0.62, text: 'Day 3 · I-30, Arkansas' },
        { at: 0.94, text: 'Day 4 · Delivered in Dallas' },
      ],
    },
    california: {
      from: 'New York City', to: 'Los Angeles', theme: 'desert', welcome: ['Welcome to', 'California'],
      signs: [{ at: 0.3, title: 'I-40 West', sub: 'Oklahoma City' }, { at: 0.75, state: 'New Mexico' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in Manhattan' },
        { at: 0.25, text: 'Day 2 · I-70, Ohio' },
        { at: 0.5, text: 'Day 4 · I-40, Oklahoma' },
        { at: 0.74, text: 'Day 5 · I-40, Arizona' },
        { at: 0.94, text: 'Day 6 · Delivered in Los Angeles' },
      ],
    },
    chicago: {
      from: 'New York City', to: 'Chicago', theme: 'city', welcome: ['Welcome to', 'Illinois'],
      signs: [{ at: 0.3, title: 'I-80 West', sub: 'Cleveland · Chicago' }, { at: 0.75, state: 'Ohio' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in the Bronx' },
        { at: 0.35, text: 'Day 1 · I-80, Pennsylvania' },
        { at: 0.66, text: 'Day 2 · I-90, Indiana' },
        { at: 0.94, text: 'Day 2 · Delivered in Chicago' },
      ],
    },
    boston: {
      from: 'New York City', to: 'Boston', theme: 'city', welcome: ['Welcome to', 'Massachusetts'],
      signs: [{ at: 0.3, title: 'I-95 North', sub: 'New Haven · Providence' }, { at: 0.75, state: 'Connecticut' }],
      steps: [
        { at: 0, text: 'Day 1 · Loaded in Manhattan' },
        { at: 0.4, text: 'Day 1 · I-95, Connecticut' },
        { at: 0.94, text: 'Day 1 · Delivered in Boston' },
      ],
    },
  };

  var TAGLINE = 'Same crew. Same truck. Never transferred.';
  var H = 400, NEAR_W = 3600, FAR_W = 2800;          // scene units
  var NAVY = '#0f2b44', ORANGE = '#e9541f';

  // Sky at the start, midway and destination, top and bottom colours.
  var SKY = {
    origin: ['#b9d6ee', '#eef4f8'], highway: ['#99cdef', '#e5f3fb'],
    palms: ['#ffc998', '#fff1dc'], pines: ['#a4cbe8', '#eef5ef'], desert: ['#f5bb85', '#fce9cf'], city: ['#b0cbe5', '#f0f3f8'],
  };

  // ---- small SVG helpers
  var rect = function (x, y, w, h, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>'; };
  var circ = function (x, y, r, fill, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>'; };
  var path = function (d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var mix = function (a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var c = [16, 8, 0].map(function (s) { var x = (pa >> s) & 255, y = (pb >> s) & 255; return Math.round(x + (y - x) * t); });
    return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
  };

  // ---- the truck, drawn from our branded box truck: white box with the
  // navy logo (orange US map) and name, red/white reflective stripe, silver
  // trim, white cab-over cab with orange roof lights.
  function truckSVG() {
    var wheel = function (cx) {
      return '<g class="rs-wheel" style="transform-origin:' + cx + 'px 126px">' +
        circ(cx, 126, 17, '#1b1f25') + circ(cx, 126, 8.5, '#c9ced6') +
        path('M' + cx + ' 118.5v15M' + (cx - 7.5) + ' 126h15', 'none', ' stroke="#8b939e" stroke-width="2"') + circ(cx, 126, 2.5, '#6b7380') +
        '</g>';
    };
    return '<svg viewBox="0 0 300 150" aria-hidden="true" focusable="false">' +
      '<ellipse cx="152" cy="143" rx="140" ry="5" fill="rgba(15,43,68,0.22)"/>' +
      rect(26, 114, 258, 12, '#2a2f37', ' rx="3"') +
      // box
      rect(6, 10, 196, 108, '#ffffff', ' rx="4" stroke="#cdd5de" stroke-width="1.5"') +
      rect(7, 11, 194, 5, '#e8edf2') +
      rect(196, 10, 10, 108, '#c3c9d1', ' rx="2"') +
      rect(8, 110, 188, 5, '#ffffff') +
      '<path d="M8 112.5H196" stroke="#d6402a" stroke-width="4" stroke-dasharray="8 6"/>' +
      // logo: truck silhouette with the US map, speed lines
      '<g transform="translate(46 20)">' +
        rect(8, 0, 60, 38, NAVY, ' rx="2"') +
        path('M68 10h14l10 12v16H68z', NAVY) + path('M73 14h7l6 8h-13z', '#ffffff') +
        path('M13 13l5-3 10 1 11-1 9 2 6-3 5 3-2 6-4 3 1 7-3 2-4-4-8 2-4 6-4-4-9 0-6-2-4-5z', ORANGE) +
        circ(22, 41, 5, NAVY) + circ(22, 41, 2, '#fff') + circ(34, 41, 5, NAVY) + circ(34, 41, 2, '#fff') + circ(82, 41, 5, NAVY) + circ(82, 41, 2, '#fff') +
        path('M-6 30h12M-10 35h14M-4 40h9', 'none', ' stroke="' + NAVY + '" stroke-width="2" stroke-linecap="round"') +
      '</g>' +
      '<text x="96" y="86" text-anchor="middle" font-family="Inter Tight, Inter, system-ui, sans-serif" font-weight="800" font-size="16" fill="' + NAVY + '" letter-spacing="0.3">50STATE</text>' +
      '<text x="96" y="102" text-anchor="middle" font-family="Inter Tight, Inter, system-ui, sans-serif" font-weight="800" font-size="13.5" fill="' + NAVY + '" letter-spacing="0.3">MOVERS INC</text>' +
      // cab
      path('M208 36h50c5 0 9 2 12 6l17 24c2 3 3 6 3 9v41c0 3-2 5-5 5h-77z', '#ffffff', ' stroke="#cdd5de" stroke-width="1.5"') +
      path('M233 44h24c3 0 5 1 7 3l14 20c1 2 0 4-2 4h-43c-2 0-3-1-3-3V47c0-2 1-3 3-3z', '#1d2a38') +
      path('M244 46l10 22', 'none', ' stroke="rgba(255,255,255,0.25)" stroke-width="3"') +
      rect(226, 76, 2, 30, '#d7dde4') + rect(236, 82, 9, 3, '#9aa3ae', ' rx="1.5"') +
      rect(226, 46, 4, 20, '#2a2f37', ' rx="2"') +
      rect(240, 32, 7, 4, '#f28c28', ' rx="1.5"') + rect(254, 32, 7, 4, '#f28c28', ' rx="1.5"') +
      rect(282, 88, 8, 8, '#ffe7a8', ' rx="2"') + rect(276, 110, 18, 9, '#d3d9e0', ' rx="2"') +
      wheel(76) + wheel(252) +
      '</svg>';
  }

  // ---- scenery pieces
  function brownstones(x0, x1, colors, dark) {
    var W = [168, 150, 160, 156, 172, 150, 164, 158], Hs = [214, 238, 198, 226, 248, 206, 232, 216];
    var out = '', x = x0, i = 0;
    while (x < x1) {
      var w = W[i % 8], h = Hs[i % 8], c = colors[i % colors.length], top = 300 - h;
      out += rect(x, top, w, h, c) + rect(x - 3, top - 10, w + 6, 12, dark) + rect(x, top + 2, w, 4, mix(c, '#000000', 0.18));
      var floors = Math.floor((h - 86) / 50);
      for (var f = 0; f < floors; f++) {
        for (var k = 0; k < 3; k++) {
          var wx = Math.round(x + 22 + k * (w - 66) / 2), wy = top + 26 + f * 50, lit = (i + f + k) % 3 === 0;
          out += rect(wx - 3, wy - 6, 28, 5, dark) + rect(wx, wy, 22, 30, lit ? '#f7e1b0' : '#2b4258', ' rx="2"');
        }
      }
      var sx = x + 18;
      out += rect(sx + 10, 226, 24, 46, '#3a2419', ' rx="2"') + rect(sx + 8, 222, 28, 5, dark);
      out += path('M' + sx + ' 300h44v-28h-44z', mix(c, '#000000', 0.25)) +
        path('M' + (sx + 4) + ' 290h36M' + (sx + 4) + ' 281h36', 'none', ' stroke="rgba(0,0,0,0.18)" stroke-width="2"') +
        path('M' + (sx - 4) + ' 300L' + (sx + 6) + ' 268M' + (sx + 48) + ' 300L' + (sx + 38) + ' 268', 'none', ' stroke="#1d2530" stroke-width="2.5"');
      x += w + 2; i++;
    }
    return out;
  }
  function lamp(x) {
    return rect(x, 222, 4, 100, NAVY) + rect(x - 9, 214, 22, 9, NAVY, ' rx="4"') + circ(x + 2, 226, 5, '#ffd27a', ' opacity="0.9"');
  }
  function tree(x, s, c1, c2) {
    s = s || 1;
    return rect(x - 3 * s, 322 - 50 * s, 6 * s, 50 * s, '#6b4a33') +
      circ(x, 322 - 62 * s, 26 * s, c1 || '#5c8f60') + circ(x - 18 * s, 322 - 48 * s, 18 * s, c2 || '#6fa472') + circ(x + 18 * s, 322 - 50 * s, 20 * s, c2 || '#6fa472');
  }
  function pine(x, s) {
    s = s || 1;
    var h = 120 * s, w = 46 * s, b = 322;
    return rect(x - 3 * s, b - 16 * s, 6 * s, 16 * s, '#5b4030') +
      path('M' + x + ' ' + (b - h) + 'L' + (x + w * 0.6) + ' ' + (b - h * 0.55) + 'H' + (x - w * 0.6) + 'z', '#2f6b4f') +
      path('M' + x + ' ' + (b - h * 0.78) + 'L' + (x + w * 0.8) + ' ' + (b - h * 0.3) + 'H' + (x - w * 0.8) + 'z', '#2a6147') +
      path('M' + x + ' ' + (b - h * 0.55) + 'L' + (x + w) + ' ' + (b - 14 * s) + 'H' + (x - w) + 'z', '#255a41');
  }
  function palm(x, s, lean) {
    s = s || 1; lean = lean || 1;
    var h = 170 * s, tx = x + 22 * s * lean, ty = 322 - h, out = '';
    out += path('M' + (x - 5 * s) + ' 322Q' + (x + 4 * s * lean) + ' ' + (322 - h / 2) + ' ' + (tx - 3 * s) + ' ' + ty + 'L' + (tx + 3 * s) + ' ' + ty + 'Q' + (x + 12 * s * lean) + ' ' + (322 - h / 2) + ' ' + (x + 5 * s) + ' 322z', '#8a6a4a');
    [[-70, -8], [-35, -30], [0, -38], [35, -30], [70, -6], [-50, 12], [50, 14]].forEach(function (f) {
      out += path('M' + tx + ' ' + ty + 'Q' + (tx + f[0] * s * 0.55) + ' ' + (ty + f[1] * s - 14 * s) + ' ' + (tx + f[0] * s) + ' ' + (ty + f[1] * s + 18 * s) + 'Q' + (tx + f[0] * s * 0.5) + ' ' + (ty + f[1] * s * 0.4) + ' ' + tx + ' ' + ty + 'z', f[1] > 0 ? '#357a52' : '#3f8a5f');
    });
    return out + circ(tx, ty + 4 * s, 5 * s, '#6b4a33');
  }
  function cactus(x, s) {
    s = s || 1; var c = '#5f8f5a', b = 322;
    return rect(x - 8 * s, b - 90 * s, 16 * s, 90 * s, c, ' rx="' + 8 * s + '"') +
      path('M' + (x - 8 * s) + ' ' + (b - 50 * s) + 'h-14a' + 6 * s + ' ' + 6 * s + ' 0 0 1-' + 6 * s + '-' + 6 * s + 'v-' + 22 * s + 'h' + 12 * s + 'v' + 16 * s + 'h' + 8 * s + 'z', c) +
      path('M' + (x + 8 * s) + ' ' + (b - 36 * s) + 'h' + 14 * s + 'v-' + 30 * s + 'h' + 12 * s + 'v' + 36 * s + 'a' + 6 * s + ' ' + 6 * s + ' 0 0 1-' + 6 * s + ' ' + 6 * s + 'h-' + 20 * s + 'z', c);
  }
  function house(x, wall, roof, trim) {
    return path('M' + (x - 8) + ' 214L' + (x + 85) + ' 150L' + (x + 178) + ' 214z', roof) +
      rect(x, 212, 170, 88, wall) + rect(x, 212, 170, 5, trim) +
      rect(x + 20, 236, 34, 30, '#2b4258', ' rx="2"') + rect(x + 116, 236, 34, 30, '#2b4258', ' rx="2"') +
      rect(x + 70, 244, 30, 56, NAVY, ' rx="2"') + circ(x + 94, 274, 2.5, '#f7e1b0') +
      rect(x + 62, 296, 46, 6, trim);
  }
  function lowrise(x, w, h, c, awning) {
    var top = 300 - h, out = rect(x, top, w, h, c) + rect(x - 3, top - 6, w + 6, 8, '#ffffff');
    for (var k = 0; k < Math.floor((w - 20) / 38); k++) out += rect(x + 16 + k * 38, top + 22, 24, 26, '#2d4a63', ' rx="2" opacity="0.75"');
    if (h > 130) for (var j = 0; j < Math.floor((w - 20) / 38); j++) out += rect(x + 16 + j * 38, top + 64, 24, 26, '#2d4a63', ' rx="2" opacity="0.75"');
    out += '<path d="M' + (x + 10) + ' 262h' + (w - 20) + 'v10h-' + (w - 20) + 'z" fill="' + awning + '"/>' +
      '<path d="M' + (x + 10) + ' 272h' + (w - 20) + '" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 10"/>' +
      rect(x + w / 2 - 14, 274, 28, 26, NAVY, ' rx="2"');
    return out;
  }
  function adobe(x, w, h, c) {
    var top = 300 - h, out = rect(x, top, w, h, c, ' rx="6"');
    for (var k = 0; k < Math.floor(w / 30); k++) out += rect(x + 10 + k * 30, top + 10, 8, 4, '#7a5134', ' rx="2"');
    return out + rect(x + 22, top + 34, 26, 26, '#2d4a63', ' rx="3"') + rect(x + w - 50, top + 34, 26, 26, '#2d4a63', ' rx="3"') + rect(x + w / 2 - 14, 300 - 50, 28, 50, '#7a5134', ' rx="14"');
  }
  function gantry(x, title, sub) {
    return rect(x, 150, 5, 176, '#6f7c89') + rect(x + 200, 150, 5, 176, '#6f7c89') + rect(x, 176, 205, 5, '#6f7c89') +
      rect(x + 12, 128, 181, 68, '#1f6f4a', ' rx="6" stroke="#ffffff" stroke-width="2.5"') +
      '<text x="' + (x + 102) + '" y="160" text-anchor="middle" font-family="Inter Tight, Inter, sans-serif" font-weight="800" font-size="22" fill="#ffffff">' + esc(title) + '</text>' +
      (sub ? '<text x="' + (x + 102) + '" y="182" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="13" fill="#ffffff">' + esc(sub) + '</text>' : '');
  }
  function stateSign(x, name) {
    return rect(x + 58, 236, 5, 88, '#6f7c89') + rect(x, 196, 122, 48, '#1b4f8a', ' rx="6" stroke="#ffffff" stroke-width="2"') +
      '<text x="' + (x + 61) + '" y="214" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#ffffff">Welcome to</text>' +
      '<text x="' + (x + 61) + '" y="234" text-anchor="middle" font-family="Inter Tight, Inter, sans-serif" font-weight="800" font-size="' + (name.length > 11 ? 13 : 16) + '" fill="#ffffff">' + esc(name) + '</text>';
  }
  function welcomeSign(x, lines) {
    var big = lines[1] || '';
    return rect(x + 20, 250, 6, 74, NAVY) + rect(x + 128, 250, 6, 74, NAVY) +
      rect(x, 186, 154, 70, '#ffffff', ' rx="8" stroke="' + NAVY + '" stroke-width="3"') +
      '<text x="' + (x + 77) + '" y="212" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="13" fill="' + NAVY + '">' + esc(lines[0] || '') + '</text>' +
      '<text x="' + (x + 77) + '" y="240" text-anchor="middle" font-family="Inter Tight, Inter, sans-serif" font-weight="800" font-size="' + (big.length > 11 ? 17 : 24) + '" fill="' + ORANGE + '">' + esc(big) + '</text>';
  }
  function clouds() {
    return [[120, 70, 1], [520, 110, 0.8], [900, 60, 1.1], [1300, 96, 0.9], [1700, 70, 1], [2150, 104, 0.85], [2550, 66, 1]].map(function (c) {
      var x = c[0], y = c[1], s = c[2];
      return '<g opacity="0.85" fill="#ffffff">' + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + 46 * s + '" ry="' + 16 * s + '"/>' +
        '<ellipse cx="' + (x - 22 * s) + '" cy="' + (y - 8 * s) + '" rx="' + 22 * s + '" ry="' + 16 * s + '"/>' + '<ellipse cx="' + (x + 14 * s) + '" cy="' + (y - 14 * s) + '" rx="' + 26 * s + '" ry="' + 20 * s + '"/></g>';
    }).join('');
  }

  // Far layer (moves slower): NYC skyline, rolling hills, destination backdrop.
  function farLayer(theme) {
    var out = clouds(), n = 'fill="' + NAVY + '"';
    // NYC skyline
    out += '<g ' + n + ' opacity="0.16">' + [[0, 60, 150], [70, 50, 190], [130, 70, 160], [300, 60, 200], [520, 70, 180], [600, 50, 150], [840, 80, 170]].map(function (b) { return rect(b[0], 300 - b[2], b[1], b[2], NAVY); }).join('') + '</g>';
    out += '<g ' + n + ' opacity="0.28">' +
      rect(20, 170, 50, 130, NAVY) + rect(200, 150, 64, 150, NAVY) + rect(214, 132, 36, 20, NAVY) +
      rect(390, 130, 64, 170, NAVY) + rect(402, 96, 40, 36, NAVY) + rect(412, 70, 20, 28, NAVY) + rect(420, 30, 4, 42, NAVY) +
      rect(470, 180, 56, 120, NAVY) + path('M690 300L700 70H748L758 300z', NAVY) + rect(722, 24, 4, 48, NAVY) +
      rect(780, 190, 60, 110, NAVY) + rect(280, 200, 50, 100, NAVY) +
      '</g>';
    // Rolling hills between
    var hills = path('M820 300C900 240 980 230 1060 262S1220 220 1300 250 1440 236 1520 270L1560 300z', '#8fbf9a', ' opacity="0.55"') +
      path('M760 300C860 262 940 268 1020 280S1180 250 1260 272 1400 262 1480 284L1540 300z', '#6fa57f', ' opacity="0.5"');
    out += '<g transform="translate(120 0)">' + hills + '</g><g transform="translate(760 0)">' + hills + '</g>';
    // Destination backdrop, at the far end of the layer
    out += '<g transform="translate(700 0)">';
    if (theme === 'palms') {
      out += rect(1300, 262, 900, 38, '#7cc6da', ' opacity="0.7"') + rect(1300, 258, 900, 5, '#b8e3ee', ' opacity="0.8"') +
        rect(1560, 190, 60, 72, '#ffffff', ' opacity="0.6"') + rect(1640, 166, 50, 96, '#ffffff', ' opacity="0.55"') + rect(1840, 204, 80, 58, '#ffffff', ' opacity="0.6"');
    } else if (theme === 'pines') {
      out += path('M1360 300L1480 190 1560 240 1680 150 1800 230 1880 180 2000 250V300z', '#8aa7c4', ' opacity="0.6"') +
        path('M1400 300L1520 230 1620 266 1740 214 1860 262 2000 236V300z', '#6d8db0', ' opacity="0.55"');
    } else if (theme === 'desert') {
      out += path('M1380 300V230H1440L1460 206H1560L1580 230H1600V300z', '#c98a5c', ' opacity="0.55"') +
        path('M1680 300V196H1720L1736 176H1840L1856 196H1900V300z', '#b97a50', ' opacity="0.5"') + path('M1600 300L1640 262H1700L1740 300z', '#c98a5c', ' opacity="0.45"');
    } else {
      out += '<g opacity="0.26">' + rect(1440, 150, 60, 150, NAVY) + rect(1510, 120, 70, 180, NAVY) + rect(1520, 76, 22, 46, NAVY) + rect(1552, 90, 18, 32, NAVY) +
        rect(1596, 170, 56, 130, NAVY) + rect(1680, 110, 64, 190, NAVY) + rect(1760, 176, 70, 124, NAVY) + rect(1850, 140, 60, 160, NAVY) + '</g>';
    }
    return out + '</g>';
  }

  // Near layer: NYC street, highway, destination town, and the road.
  function nearLayer(cfg) {
    var theme = cfg.theme, out = '';
    // Ground
    out += rect(0, 296, 1150, 34, '#d8d0c2') + rect(1150, 296, 1200, 34, '#a9cf9f');
    var ground = { palms: '#efdfbd', pines: '#a7cc98', desert: '#e7cc9d', city: '#d8d0c2' }[theme];
    out += rect(2350, 296, 1250, 34, ground);
    // NYC street
    out += brownstones(0, 1110, ['#9c6149', '#8a553f', '#a86d52', '#7e4b39'], '#4f2f23');
    out += tree(470, 1) + tree(800, 0.9) + lamp(300) + lamp(640) + lamp(980);
    // Highway
    out += '<path d="M1150 314H2350" stroke="#b8c2cc" stroke-width="4"/>';
    for (var gx = 1160; gx < 2350; gx += 42) out += rect(gx, 312, 3, 12, '#8c98a5');
    [[1210, 1], [1300, 0.8], [1560, 1.1], [1700, 0.85], [1960, 1], [2080, 0.8], [2250, 1.05]].forEach(function (t, i) {
      out += theme === 'desert' && t[0] > 1900 ? cactus(t[0], 0.9) : tree(t[0], t[1], i % 2 ? '#5c8f60' : '#4f8457', '#6fa472');
    });
    (cfg.signs || []).forEach(function (s) {
      var x = Math.round(1150 + s.at * 1200 - 100);
      out += s.state ? stateSign(x, s.state) : gantry(x, s.title, s.sub);
    });
    // Destination
    out += welcomeSign(2400, cfg.welcome || ['Welcome to', cfg.to]);
    if (theme === 'palms') {
      out += palm(2620, 1, 1) + lowrise(2660, 190, 150, '#f6c9b8', ORANGE) + palm(2880, 0.85, -1) + lowrise(2900, 170, 120, '#bfe3dd', '#2d8c86') +
        palm(3100, 1.05, 1) + lowrise(3130, 200, 160, '#f7e2a8', ORANGE) + palm(3370, 0.9, -1) + house(3400, '#fbe9dd', '#e07a5f', '#ffffff') + palm(3590, 0.95, -1);
    } else if (theme === 'pines') {
      out += pine(2600, 1.1) + house(2640, '#ffffff', '#4b5563', '#d9dee4') + pine(2850, 0.9) + pine(2900, 1.2) + house(2950, '#b5573f', '#3c4450', '#f3ede4') +
        pine(3160, 1) + pine(3220, 1.25) + pine(3360, 0.9) + house(3400, '#f3ede4', '#2f3a46', '#ffffff') + pine(3590, 1.1);
    } else if (theme === 'desert') {
      out += cactus(2600, 1.1) + adobe(2650, 200, 120, '#d8a878') + cactus(2890, 0.8) + adobe(2930, 170, 100, '#e2b98c') +
        cactus(3150, 1.2) + adobe(3190, 180, 130, '#cf9c6c') + cactus(3380, 0.8) + house(3400, '#f0d3ad', '#b0613f', '#ffffff') + cactus(3590, 1);
    } else {
      out += brownstones(2600, 3380, ['#a4553f', '#8e4a38', '#b0634a', '#7f4332'], '#4a2a20') + lamp(2720) + tree(3000, 0.9) + lamp(3280) +
        house(3400, '#c8d3de', '#2f3a46', '#ffffff');
    }
    // Arrival pin above the new home
    out += '<g class="rs-pin"><path d="M3485 96c-16 0-28 12-28 27 0 20 28 45 28 45s28-25 28-45c0-15-12-27-28-27z" fill="' + ORANGE + '" stroke="#ffffff" stroke-width="3"/>' +
      '<path d="M3474 122l8 8 14-15" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>';
    // Road
    out += rect(0, 324, NEAR_W, 6, '#c9c1b3') + rect(0, 330, NEAR_W, 70, '#394553') +
      '<path d="M0 338H' + NEAR_W + '" stroke="#e9e3d6" stroke-width="2" opacity="0.5"/>' +
      '<path d="M0 368H' + NEAR_W + '" stroke="#f3efe7" stroke-width="4" stroke-dasharray="30 26"/>';
    return out;
  }

  // ---- the component
  function RouteSlider(root) {
    this.root = root;
    this.p = 0; this.target = 0;
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('rs');
    root.innerHTML =
      '<div class="rs-stage">' +
        '<svg class="rs-scene" preserveAspectRatio="xMinYMin slice" aria-hidden="true" focusable="false">' +
          '<defs><linearGradient id="' + (this.gid = 'rs-sky-' + (++RouteSlider.n)) + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient></defs>' +
          '<rect class="rs-sky" x="0" y="0" height="' + H + '" fill="url(#' + this.gid + ')"/>' +
          '<circle class="rs-sun" r="34" fill="#ffd27a" opacity="0.9"/>' +
          '<g class="rs-far"></g><g class="rs-near"></g>' +
        '</svg>' +
        '<p class="rs-step" aria-hidden="true"><b class="rs-day"></b><span class="rs-where"></span></p>' +
        '<button type="button" class="rs-truck" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' + truckSVG() + '</button>' +
        '<span class="rs-hint" aria-hidden="true">Drag the truck <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
      '</div>' +
      '<div class="rs-foot">' +
        '<div class="rs-track"><span class="rs-from"></span><span class="rs-bar"><i class="rs-fill"></i></span><span class="rs-to"></span></div>' +
        '<p class="rs-tagline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>' + TAGLINE + '</p>' +
      '</div>';
    var q = function (s) { return root.querySelector(s); };
    this.stage = q('.rs-stage'); this.svg = q('.rs-scene'); this.truck = q('.rs-truck');
    this.far = q('.rs-far'); this.near = q('.rs-near'); this.sky = q('.rs-sky'); this.sun = q('.rs-sun');
    this.stops = this.svg.querySelectorAll('stop'); this.wheels = root.querySelectorAll('.rs-wheel');
    this.day = q('.rs-day'); this.where = q('.rs-where'); this.fill = q('.rs-fill');

    var cfg = ROUTES[root.dataset.route] || ROUTES.florida;
    if (root.dataset.routeConfig) { try { cfg = Object.assign({}, cfg, JSON.parse(root.dataset.routeConfig)); } catch (e) {} }
    this.setRoute(cfg);
    this.bind();
    var self = this;
    if (window.ResizeObserver) new ResizeObserver(function () { self.measure(); }).observe(this.stage);
    else window.addEventListener('resize', function () { self.measure(); });
    this.measure();
  }
  RouteSlider.n = 0;

  RouteSlider.prototype.setRoute = function (cfg) {
    if (typeof cfg === 'string') cfg = ROUTES[cfg];
    if (!cfg) return;
    this.cfg = cfg;
    this.far.innerHTML = farLayer(cfg.theme);
    this.near.innerHTML = nearLayer(cfg);
    this.pin = this.near.querySelector('.rs-pin');
    this.root.querySelector('.rs-from').textContent = cfg.from;
    this.root.querySelector('.rs-to').textContent = cfg.to;
    var bar = this.root.querySelector('.rs-bar');
    bar.querySelectorAll('.rs-tick').forEach(function (t) { t.remove(); });
    cfg.steps.forEach(function (s) { var t = document.createElement('b'); t.className = 'rs-tick'; t.style.left = (s.at * 100) + '%'; bar.appendChild(t); });
    this.truck.setAttribute('aria-label', 'Drive the truck from ' + cfg.from + ' to ' + cfg.to);
    this.stepText = null;
    this.render();
  };

  RouteSlider.prototype.measure = function () {
    var r = this.stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.W = r.width; this.Hpx = r.height;
    this.Vw = H * r.width / r.height;
    this.svg.setAttribute('viewBox', '0 0 ' + this.Vw.toFixed(1) + ' ' + H);
    this.sky.setAttribute('width', Math.ceil(this.Vw) + 2);
    this.tw = this.truck.getBoundingClientRect().width;
    this.render();
  };

  RouteSlider.prototype.render = function () {
    if (!this.cfg || !this.W) return;
    var p = this.p, Vw = this.Vw, cfg = this.cfg;
    this.near.setAttribute('transform', 'translate(' + (-p * (NEAR_W - Vw)).toFixed(1) + ' 0)');
    this.far.setAttribute('transform', 'translate(' + (-p * Math.max(0, FAR_W - Vw)).toFixed(1) + ' 0)');
    this.truck.style.transform = 'translate3d(' + (p * (this.W - this.tw)).toFixed(1) + 'px,0,0)';
    var deg = (p * 2600).toFixed(1);
    for (var i = 0; i < this.wheels.length; i++) this.wheels[i].style.transform = 'rotate(' + deg + 'deg)';
    // Sky: start → highway → destination.
    var a = SKY.origin, b = SKY.highway, t = p * 2;
    if (p > 0.5) { a = SKY.highway; b = SKY[cfg.theme] || SKY.highway; t = (p - 0.5) * 2; }
    this.stops[0].setAttribute('stop-color', mix(a[0], b[0], t));
    this.stops[1].setAttribute('stop-color', mix(a[1], b[1], t));
    this.sun.setAttribute('cx', (Vw * (0.18 + 0.64 * p)).toFixed(1));
    this.sun.setAttribute('cy', (96 - 40 * Math.sin(Math.PI * p)).toFixed(1));
    // Journey step
    var step = cfg.steps[0];
    for (var k = 0; k < cfg.steps.length; k++) if (p + 0.001 >= cfg.steps[k].at) step = cfg.steps[k];
    if (step.text !== this.stepText) {
      this.stepText = step.text;
      var parts = step.text.split(' · ');
      this.day.textContent = parts.length > 1 ? parts[0] : '';
      this.where.textContent = parts.length > 1 ? parts.slice(1).join(' · ') : parts[0];
      var el = this.day.parentNode;
      el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new');
      this.truck.setAttribute('aria-valuetext', step.text);
    }
    this.truck.setAttribute('aria-valuenow', Math.round(p * 100));
    this.fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    this.root.classList.toggle('is-arrived', p > 0.97);
  };

  RouteSlider.prototype.set = function (p) {
    this.p = Math.max(0, Math.min(1, p));
    if (this.raf) return;
    var self = this;
    this.raf = requestAnimationFrame(function () { self.raf = 0; self.render(); });
  };

  // Glide to a position (taps and keys). Direct when motion is reduced.
  RouteSlider.prototype.glide = function (to) {
    to = this.goal = Math.max(0, Math.min(1, to));
    cancelAnimationFrame(this.glideRaf); this.glideRaf = 0;
    if (this.reduce) return this.set(to);
    var self = this, from = this.p, t0 = performance.now(), dur = 280 + Math.abs(to - from) * 700;
    this.root.classList.add('is-moving');
    (function step(now) {
      var k = Math.max(0, Math.min(1, (now - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
      self.p = from + (to - from) * e; self.render();
      if (k < 1) self.glideRaf = requestAnimationFrame(step);
      else { self.glideRaf = 0; self.root.classList.remove('is-moving'); }
    })(t0);
  };

  RouteSlider.prototype.bind = function () {
    var self = this, stage = this.stage, start = null;
    var touched = function () { self.root.classList.add('has-moved'); };
    // Horizontal drags move the truck; vertical swipes are left to the page
    // (touch-action: pan-y), so the page still scrolls on phones.
    stage.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      start = { x: e.clientX, y: e.clientY, p: self.p, id: e.pointerId, drag: false };
      cancelAnimationFrame(self.glideRaf); self.glideRaf = 0;
      if (e.pointerType === 'mouse') e.preventDefault();
      if (self.truck.contains(e.target)) self.truck.focus({ preventScroll: true });
    });
    stage.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!start.drag) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
        start.drag = true;
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        self.root.classList.add('is-dragging', 'is-moving'); touched();
      }
      self.set(start.p + dx / Math.max(1, self.W - self.tw));
    });
    var end = function (e) {
      if (!start || e.pointerId !== start.id) return;
      var s = start; start = null;
      self.root.classList.remove('is-dragging', 'is-moving');
      if (s.drag || e.type === 'pointercancel') return;
      // A tap: drive the truck to that spot.
      var r = stage.getBoundingClientRect();
      if (Math.abs(e.clientY - s.y) < 10) { touched(); self.glide((e.clientX - r.left - self.tw / 2) / Math.max(1, self.W - self.tw)); }
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    this.truck.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 0.05, ArrowUp: 0.05, ArrowLeft: -0.05, ArrowDown: -0.05, PageUp: 0.2, PageDown: -0.2 }[e.key];
      if (e.key === 'Home') d = -1; if (e.key === 'End') d = 1;
      if (d == null) return;
      e.preventDefault(); touched();
      // Presses during a glide add up from where it is heading.
      self.glide((self.glideRaf ? self.goal : self.p) + d);
    });
  };

  function init() {
    document.querySelectorAll('[data-route-slider]').forEach(function (root) {
      if (!root.routeSlider) root.routeSlider = new RouteSlider(root);
    });
  }
  window.RouteSlider = { routes: ROUTES, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
