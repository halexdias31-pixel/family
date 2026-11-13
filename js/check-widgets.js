#!/usr/bin/env node
/* @family. — check-widgets.js EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const jsDir = fs.existsSync(path.join(__dirname, 'map.js')) ? __dirname : path.join(__dirname, 'js');
const mapPath = path.join(jsDir, 'map.js');
if (!fs.existsSync(mapPath)) {
  console.log('FAILED — map.js not found, so NOTHING was checked. Looked in: ' + jsDir);
  process.exit(1);
}

const src = fs.readFileSync(mapPath, 'utf8');
let ast;
try {
  ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script' });
} catch (err) {
  console.log('FAILED — map.js does not parse: ' + err.message);
  process.exit(1);
}

/* The `WIDGETS` array literal, found by name rather than by position. */
let arr = null;
(function walk(n) {
  if (!n || typeof n !== 'object' || arr) return;
  if (n.type === 'VariableDeclarator' && n.id && n.id.name === 'WIDGETS'
      && n.init && n.init.type === 'ArrayExpression') { arr = n.init; return; }
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v.type === 'string') walk(v);
  }
})(ast);

if (!arr) {
  console.log('FAILED — no `WIDGETS` array in map.js, so NOTHING was checked.');
  process.exit(1);
}

/* Every widget, as {key: rawSourceText}. The VALUES are kept as source rather than evaluated: an
   `html` is a template string full of calls that cannot run outside a browser, and all this needs
   to know is what the text contains. */
const widgets = arr.elements.filter(Boolean).filter(e => e.type === 'ObjectExpression').map(obj => {
  const w = { _keys: [] };
  obj.properties.forEach(p => {
    if (!p.key) return;
    const k = p.key.name || p.key.value;
    w._keys.push(k);
    w[k] = src.slice(p.value.start, p.value.end);
  });
  return w;
});

const str = v => (v == null ? '' : String(v).replace(/^['"`]|['"`]$/g, ''));

const missingKey = [], badKind = [], dupes = [], orphanInto = [], startNoInto = [], intoNoStart = [];
/* A WIDGET WHOSE OWN MARKUP HAS NO HEADING — see the note beside the rule below. */
const noTitle = [];

/* ---------- AND THE ONE THAT MEANS IT, WITH ITS REASON WRITTEN DOWN § */
const ACCEPTED_UNTITLED = {
  /* THE BOX ONLY (6d366d5): its host card carries the title, and a title here drew it twice. */
  libcards: 'the host card is titled',
};
const seen = {};

/* ---------- THE KINDS A COLUMN ASKS FOR, READ OFF THE CODE THAT ASKS § */
const ASKED_KINDS = new Set();
fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !/^check/.test(f)).forEach(f => {
  const txt = fs.readFileSync(path.join(jsDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of txt.matchAll(/\b(?:widgetsOf_|toolsStart_|widgetColumn_)\(\s*'([a-z]+)'\s*\)/g)) ASKED_KINDS.add(m[1]);
  /* AND THE KINDS FIND ASKS FOR (790, `FIND_WIDGET_KINDS`, arcade.js): a tool is a Find card, not a column's. */
  const fk = /const FIND_WIDGET_KINDS = \[([^\]]*)\]/.exec(txt);
  if (fk) for (const m of fk[1].matchAll(/'([a-z]+)'/g)) ASKED_KINDS.add(m[1]);
});
if (!ASKED_KINDS.has('tool')) {
  console.log('FAILED — could not read which widget kinds the columns ask for (found: '
              + [...ASKED_KINDS].join(', ') + '), so the kind rule was NOT checked');
  process.exit(1);
}

widgets.forEach(w => {
  const id = str(w.id) || '(no id)';

  /* THE FOUR THAT EVERY WIDGET HAS. `what` is not among them — it is the pager's caption and a
     widget without one is untidy, not broken. */
  ['id', 'kind', 'name', 'html'].forEach(k => {
    if (!w._keys.includes(k)) missingKey.push(id + ' has no `' + k + '`');
  });

  const kind = str(w.kind);
  if (kind && !ASKED_KINDS.has(kind)) {
    badKind.push(id + " has kind '" + kind + "' — `widgetsOf_` only ever asks for "
                    + [...ASKED_KINDS].map(k => "'" + k + "'").join(', ')
                    + ', so this widget is on no column at all');
  }

  if (seen[id]) dupes.push(id); else seen[id] = 1;

  /* ---------- THE WIDGET'S OWN MARKUP CARRIES ITS TITLE § */
  if (w.html && !/<h3[\s>]/.test(w.html) && !ACCEPTED_UNTITLED[id]) {
    noTitle.push(id + ' has no <h3> in its html. `widgetColumn_` draws the widget\'s own markup and '
               + 'nothing else, so this one appears on the column with no title on it.');
  }

  const into = str(w.into);
  const hasStart = w._keys.includes('start');

  /* THE ONE THAT CATCHES A DEAD WIDGET. `into` names the element `start` draws into, and the html
     is the only thing that can contain it. */
  if (into && w.html && w.html.indexOf(into) === -1) {
    orphanInto.push(id + " points `into: '" + into + "'` and its own html never mentions that id — "
                       + 'so `start` will look it up, find nothing, and the card will draw empty');
  }
  if (hasStart && !into) {
    startNoInto.push(id + ' has a `start` and no `into` — nothing tells it where to draw');
  }
  if (into && !hasStart) {
    intoNoStart.push(id + " names `into: '" + into + "'` and has no `start` to fill it");
  }
});

/* ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED § */
/* KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js use, and for the same reason: § */
const ACCEPTED_ENGINE = {
};

const starters = widgets.map(w => String(w.start || '')).join(' ');
const engineFiles = ['map.js', ...require('../tools/piece-src.js').pieceFiles('book').map(f => f.slice(3)), ...require('../tools/piece-src.js').pieceFiles('me').map(f => f.slice(3)), 'overworld.js', ...require('../tools/find-src.js').findFiles().map(f => f.slice(3)), 'receipt.js'];
const orphanEngine = [];
engineFiles.forEach(f => {
  const fp = path.join(jsDir, f);
  if (!fs.existsSync(fp)) return;
  const txt = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of txt.matchAll(/^function (init[A-Z]\w*)\s*\(/gm)) {
    const name = m[1];
    if (starters.indexOf(name) === -1 && !(name in ACCEPTED_ENGINE)) {
      orphanEngine.push(name + ' (' + f + ') \u2014 a widget starter that no widget start names');
    }
  }
});

const say = (title, list, soft) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  return soft ? 'soft' : 'hard';
};

let bad = 0, noted = 0;
[[ 'A WIDGET MISSING ONE OF THE FOUR KEYS EVERY WIDGET HAS', missingKey ],
 [ 'A `kind` NO COLUMN ASKS FOR', badKind ],
 [ 'THE SAME `id` TWICE', dupes ],
 [ 'AN `into` NAMING AN ID ITS OWN HTML DOES NOT CONTAIN', orphanInto ],
 [ 'A `start` WITH NOWHERE TO DRAW', startNoInto ],
 [ 'A WIDGET STARTER WITH NO WIDGET \u2014 deleted by accident, or never added', orphanEngine ],
 [ 'A WIDGET WITH NO TITLE \u2014 the column draws its own markup and nothing else', noTitle ],
].forEach(([t, l]) => { if (say(t, l) === 'hard') bad += l.length; });

/* SOFT: a slot waiting for its widget is how a placeholder looks, and `drill` is deliberately one. */
if (say('AN `into` WITH NO `start` YET — a placeholder, or a widget half-wired', intoNoStart, true)) {
  noted += intoNoStart.length;
}

console.log('');
/* THE ROSTER, PRINTED EVERY RUN. § */
const untitled = Object.keys(ACCEPTED_UNTITLED);
if (untitled.length) {
  console.log('');
  console.log('A WIDGET WITH NO TITLE, ON PURPOSE  (' + untitled.length + ')');
  untitled.forEach(k => console.log('  ' + k + ' \u2014 ' + ACCEPTED_UNTITLED[k]));
}

const acceptedEngine = Object.keys(ACCEPTED_ENGINE);
if (acceptedEngine.length) {
  console.log('');
  console.log('A STARTER KEPT ON PURPOSE, WITH A REASON  (' + acceptedEngine.length + ')');
  acceptedEngine.forEach(k => console.log('  ' + k + ' \u2014 ' + ACCEPTED_ENGINE[k]));
}

/* A WIDGET DRAWN AHEAD RUNS NOTHING — AND ONE THAT SAYS IT READS NO FACTS READS NONE § */
const ACCEPTED_IMPURE = {
  mat: 'reads the cheat sheet tab (`DATA.cheatsheet`), which the fixture leaves empty, so both payloads draw the built-in sheet',
  reels: 'reads the facts tab through `factsNow_`, which the fixture leaves empty, so both payloads deal the built-in facts',
  videos: 'a typed search lists the owner\'s list and an admin\'s films (`DATA.films`); the bar drawn ahead with nothing typed reads neither',
  spotify: 'reads the site\'s Spotify app id (`brand`) and this browser\'s own link to Spotify; drawn ahead it is the same not-switched-on card for everyone, and drawing it fetches nothing of its own',
  favlinks: 'reads the viewer\'s own links (`DATA.favLinks`, 509), which the fixture leaves out, so every scenario draws the empty list',
};
async function drawAheadRuntime_() {
  const out = { fails: [], pureWrong: [], drawn: 0, scenarios: 0, notes: [] };
  /* EVERY WIDGET WITH A STOP DECLARES A DRAW — read off the parsed list, as the rules above are. */
  widgets.forEach(w => {
    if (w._keys.includes('stop') && !w._keys.includes('draw')) {
      out.fails.push(str(w.id) + ' has a `stop` and no `draw` — the builder cannot draw it ahead without running it');
    }
  });
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch (e) { out.fails.push('jsdom could not be loaded (' + e.message + '), so NO draw ahead was run — not a pass'); return out; }
  const root = path.join(jsDir, '..');
  const html0 = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const fm = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html0);
  if (!fm) { out.fails.push('cannot read window.FILES out of index.html, so NO draw ahead was run'); return out; }
  const order = [...fm[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
  const appSrc = order.map(n => fs.readFileSync(path.join(jsDir, n + '.js'), 'utf8')).join('\n');
  const fixture = JSON.parse(fs.readFileSync(path.join(root, 'check', 'fixture.json'), 'utf8'));
  /* THE CHANGED PAYLOAD: § */
  const shiftDate = v => v.replace(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g, (m, d, mo, y) => {
    const t = new Date(Date.UTC(+y, +mo - 1, +d + 3));
    return String(t.getUTCDate()).padStart(2, '0') + '/' + String(t.getUTCMonth() + 1).padStart(2, '0') + '/' + t.getUTCFullYear();
  }).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m, y, mo, d) => new Date(Date.UTC(+y, +mo - 1, +d + 3)).toISOString().slice(0, 10));
  const bend = v => {
    if (typeof v === 'string') return !v ? 'x' : (shiftDate(v) !== v ? shiftDate(v) : v + ' (2)');
    if (typeof v === 'number') return v + 7;
    if (Array.isArray(v)) return v.map(bend);
    if (v && typeof v === 'object') { const o = {}; Object.keys(v).forEach(k => { o[k] = bend(v[k]); }); return o; }
    return v;
  };
  const KEEP = new Set(['version', 'cached', 'fileVersions', 'features', 'columns', 'googleClientId']);
  const changed = JSON.parse(JSON.stringify(fixture));
  Object.keys(changed).forEach(k => {
    const v = changed[k];
    if (KEEP.has(k)) return;
    if (Array.isArray(v)) changed[k] = v.length ? v.map(bend).concat([bend(v[0])]) : v;
    else if (v && typeof v === 'object') changed[k] = bend(v);
  });
  const T0 = Date.UTC(2026, 9, 7, 10, 0, 0);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const P = (id, role, extra) => Object.assign({ name: 'Test ' + id, personId: id, person_id: id, role, roles: [role],
    handle: 'test' + id.toLowerCase(), token: 't-' + id }, extra || {});
  /* WHO, OVER WHICH FACTS. § */
  const SCEN = [
    { key: 'signed out', user: null, data: fixture },
    { key: 'student', user: P('P9', 'student'), data: fixture },
    /* WITH A WEEK OF HER OWN: § */
    { key: 'student 2, changed facts', user: P('P8', 'student', { timetable: JSON.stringify({ weekend: true,
        days: [0, 1, 2, 3, 4, 5, 6].map(i => [{ id: 'L' + i, at: '09:0' + i, subject: 'Maths' }]) }) }), data: changed },
    { key: 'admin', user: P('P001', 'admin'), data: fixture },
    { key: 'tutor, changed facts', user: P('P002', 'tutor', { name: 'Ada Tutor' }), data: changed },
  ];
  const BASKET = [{ key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 }];
  const marks = {};   // id -> [{ scen, html }]
  for (const sc of SCEN) {
    let w;
    try { w = await bootFor_(sc); }
    catch (e) { out.fails.push('the app did not boot for "' + sc.key + '" (' + e.message + '), so its draws were NOT run'); continue; }
    out.scenarios++;
    const t = w.__wt;
    const seenHere = new Set();
    /* THE TOOLS ARE FIND CARDS (790): the group's every card is filled, then drawn from its slot on Find. */
    for (const [col, group] of [['stuff', 'Tools'], ['shop', '']]) {
      try {
        if (group) { t.findAll(group); await sleep(1500); }
        else if (t.STALE()[col] || !w.document.querySelector('#s-' + col + ' .widget-slot')) t.paint(col, true);
      } catch (e) {}
      const list = (() => { try { return t.widgetsOn(col); } catch (e) { return []; } })();
      for (const wd of list) {
        const id = String(wd.id);
        if (seenHere.has(id)) continue;
        const draw = typeof wd.draw === 'function' ? wd.draw : (!wd.stop && typeof wd.start === 'function' ? wd.start : null);
        if (!draw) continue;
        const slot = t.slotOn(col, id);
        if (!slot) continue;
        seenHere.add(id);
        const got = await sandboxDraw_(w, t, wd, col, slot, draw, T0);
        out.drawn++;
        got.fails.forEach(f => out.fails.push(id + ' (' + sc.key + '): ' + f));
        (marks[id] = marks[id] || []).push({ scen: sc, html: got.html });
        if (process.env.CW_DUMP && process.env.CW_DUMP.split(',').indexOf(id) !== -1) console.log('--- ' + id + ' (' + sc.key + ')\n' + got.html.slice(0, 1500));
      }
    }
    try { w.close(); } catch (e) {}
  }
  /* PURE, IF AND ONLY IF THE SAME IN EVERY SCENARIO — and drawn under two people and two sets of facts. § */
  /* An off widget (860) draws "Coming soon", not itself: its `pure` is not judged here. */
  const OFF_ = new Set(Object.entries(require('../data/settings/tiers.json').widgets || {}).filter(e => e[1] === 'off').map(e => e[0]));
  const declared = new Set(widgets.filter(x => /^\s*true\s*$/.test(String(x.pure || ''))).map(x => str(x.id)).filter(id => !OFF_.has(id)));
  Object.keys(marks).filter(id => !OFF_.has(id)).forEach(id => {
    const m = marks[id];
    const same = m.every(x => x.html === m[0].html);
    const varied = m.some(x => x.scen.data !== m[0].scen.data) && m.some(x => String((x.scen.user || {}).personId) !== String((m[0].scen.user || {}).personId));
    const isPure = same && varied;
    if (declared.has(id) && !isPure) {
      const diff = m.find(x => x.html !== m[0].html);
      out.pureWrong.push(id + ' says `pure: true` and its drawing ' + (diff
        ? 'differs between "' + m[0].scen.key + '" and "' + diff.scen.key + '" — it reads facts, and a paint would carry a stale drawing'
        : 'was drawn in only ' + m.length + ' scenario(s), which cannot prove it reads no facts'));
    }
    if (!declared.has(id) && isPure && !ACCEPTED_IMPURE[id]) {
      out.pureWrong.push(id + ' draws the same markup for every person and every payload and does not say `pure: true` — '
        + 'say it, so a paint carries its drawing instead of putting it back under the loader');
    }
  });
  declared.forEach(id => { if (!marks[id]) out.pureWrong.push(id + ' says `pure: true` and was never drawn here, so nothing proved it'); });
  out.notes.push('pure: ' + Object.keys(marks).filter(id => declared.has(id)).sort().join(', '));
  return out;

  /* ONE APP IN A REAL DOM, signed in (or not) the way the browser's own boot reads it, the builder held so
     nothing is drawn but what this asks for, and the payload landed. */
  async function bootFor_(sc) {
    const html = html0.replace(/<script[\s\S]*?<\/script>/g, '');
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
    const w = dom.window;
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.confirm = () => true;
    w.prompt = () => '';
    try {
      w.HTMLMediaElement.prototype.pause = function () {};
      w.HTMLMediaElement.prototype.load = function () {};
    } catch (e) {}
    w.__sb = { on: false, hits: [] };
    const hit = what => { if (w.__sb.on) w.__sb.hits.push(what); };
    const realFetch = (url, o) => {
      hit('a fetch of ' + String(url).slice(0, 80));
      const body = o && o.body ? { success: true } : sc.data;
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)), json: () => Promise.resolve(body) });
    };
    w.fetch = realFetch;
    const xo = w.XMLHttpRequest && w.XMLHttpRequest.prototype.open;
    if (xo) w.XMLHttpRequest.prototype.open = function () { hit('an XHR'); return xo.apply(this, arguments); };
    try { Object.defineProperty(w.navigator, 'sendBeacon', { value: () => { hit('sendBeacon'); return true; }, configurable: true }); } catch (e) {}
    try {
      Object.defineProperty(w.navigator, 'mediaDevices', { configurable: true, value: {
        getUserMedia: () => { hit('the camera (getUserMedia)'); return new Promise(() => {}); },
        enumerateDevices: () => Promise.resolve([]) } });
    } catch (e) {}
    const fake = () => new Proxy(function () {}, { get: (o, k) => (k === 'then' ? undefined : fake()), apply: () => fake(), construct: () => fake() });
    w.AudioContext = w.webkitAudioContext = function () { hit('an AudioContext'); return fake(); };
    w.speechSynthesis = { speak: () => hit('speech'), cancel() {}, pause() {}, resume() {}, getVoices: () => [], speaking: false, pending: false,
      addEventListener() {}, removeEventListener() {} };
    w.SpeechSynthesisUtterance = function () {};
    try { w.HTMLMediaElement.prototype.play = function () { hit('play() on a ' + this.tagName.toLowerCase()); return Promise.resolve(); }; } catch (e) {}
    if (sc.user) w.localStorage.setItem('familyUser', JSON.stringify(sc.user));
    w.localStorage.setItem('familyCart', JSON.stringify(BASKET));
    w.__aheadHold = true;
    w.eval(appSrc + '\n;window.__wt = { paint, findAll: g => { finderSet_(FINDERS.stuff, { filters: [{ field: "forLabel", value: g }], show: true }); go("stuff", false, true); inFinder_(FINDERS.stuff, () => { const f = stuffFirstResult_(); for (let i = 0; i < stuffPages_().length; i++) stuffFillOne_(f + i); }); }, widgetsOn: c => widgetsOn_(c), slotOn: (c, i) => slotOn_(c, i),'
      + ' HOME: WIDGET_HOME, loading: () => loading_(), STALE: () => STALE, loaded: () => LOADED, user: () => USER,'
      + ' send: typeof send_ === "function" ? send_ : null, ahead: v => { AHEAD.running = v; } };');
    if (typeof w.send_ === 'function') { const s0 = w.send_; w.send_ = function () { hit('send_'); return s0.apply(this, arguments); }; }
    for (let i = 0; i < 100 && !w.__wt.loaded(); i++) await sleep(50);
    if (!w.__wt.loaded()) throw new Error('the payload never landed');
    await sleep(100);
    return w;
  }

  /* ONE DRAW, WATCHED. The slot goes back to what `widgetOnColumn_` writes, the clocks and the dice are held still, `$` is told which copy § */
  async function sandboxDraw_(w, t, wd, col, slot, draw, T0) {
    const fails = [];
    const id = String(wd.id);
    slot.innerHTML = wd.html + t.loading();
    slot.setAttribute('aria-busy', 'true');
    const RealDate = w.Date;
    class Still extends RealDate {
      constructor(...a) { if (a.length) super(...a); else super(T0); }
      static now() { return T0; }
    }
    let seed = 12345;
    const realRandom = w.Math.random;
    w.Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    w.Date = Still;
    const mine = new Map();   // timer handle -> 'pending' | 'done'
    let inMine = 0;
    const rT = w.setTimeout, rC = w.clearTimeout, rI = w.setInterval, rA = w.requestAnimationFrame, rCA = w.cancelAnimationFrame;
    const sb = w.__sb;
    const own = el => { for (let n = el; n; n = n.parentNode) { if (n.id === 'wgt-' + id && n.classList && n.classList.contains('widget-slot')) return true; } return false; };
    const media = /^(VIDEO|AUDIO|SOURCE|IFRAME)$/;
    const mo = new w.MutationObserver(() => {});
    const probes = new Set();
    const audit = () => {
      mo.takeRecords().forEach(r => {
        const tgt = r.target;
        if (r.type === 'attributes' && r.attributeName === 'src' && tgt && media.test(tgt.tagName || '') && tgt.getAttribute('src')) {
          fails.push('gave a <' + tgt.tagName.toLowerCase() + '> a source');
        }
        (r.addedNodes ? [...r.addedNodes] : []).forEach(n => {
          if (!n.querySelectorAll) return;
          [n].concat([...n.querySelectorAll('video,audio,source,iframe')]).forEach(m => {
            if (media.test(m.tagName || '') && m.getAttribute && m.getAttribute('src')) fails.push('drew a <' + m.tagName.toLowerCase() + '> with a source');
          });
        });
        /* A PROBE IS NOT A WRITE: an element put at the end of the body to be measured and taken away in the
           same tick (the cheat sheet's x-height and page gauge, mat.js) leaves nothing behind. */
        (r.addedNodes ? [...r.addedNodes] : []).forEach(n => probes.add(n));
        const probe = r.type === 'childList' && [...(r.addedNodes || [])].every(n => !n.isConnected)
          && [...(r.removedNodes || [])].every(n => probes.has(n));
        if (!own(tgt) && !probe) fails.push('wrote outside its own slot (' + r.type + ' on <' + String(tgt.nodeName).toLowerCase()
          + (tgt.id ? '#' + tgt.id : '') + (tgt.className && typeof tgt.className === 'string' ? '.' + tgt.className.split(/\s+/)[0] : '') + '>)');
      });
    };
    const wrap = fn => function () { inMine++; try { return fn.apply(this, arguments); } finally { inMine--; audit(); } };
    w.setTimeout = function (fn, ms) {
      if (!inMine || typeof fn !== 'function') return rT.apply(w, arguments);
      const h = rT.call(w, function () { mine.set(h, 'done'); return wrap(fn).apply(this, arguments); }, ms);
      mine.set(h, 'pending');
      return h;
    };
    w.clearTimeout = function (h) { if (mine.has(h)) mine.set(h, 'done'); return rC.call(w, h); };
    w.setInterval = function () { if (inMine) fails.push('set an interval'); return rI.apply(w, arguments); };
    w.requestAnimationFrame = function (fn) {
      if (!inMine) return rT.call(w, () => fn(RealDate.now()), 16);
      const h = rT.call(w, () => { mine.set(h, 'done'); wrap(fn)(RealDate.now()); }, 16);
      mine.set(h, 'pending');
      return h;
    };
    w.cancelAnimationFrame = function (h) { if (mine.has(h)) mine.set(h, 'done'); return rC.call(w, h); };
    mo.observe(w.document, { subtree: true, childList: true, attributes: true, characterData: true });
    const had = Object.prototype.hasOwnProperty.call(t.HOME, slot.id) ? t.HOME[slot.id] : undefined;
    t.HOME[slot.id] = col;
    sb.hits = []; sb.on = true;
    /* AS THE BUILDER DRAWS IT — inside a slice (`AHEAD.running`, which `aheadSlice_` holds for the job), so a
       draw that asks whether it is being drawn ahead is asked the question the app asks it. */
    try { t.ahead('widget:' + col + ':' + id); wrap(() => draw())(); }
    catch (e) { fails.push('threw: ' + e.message); }
    finally { t.ahead(false); if (had === undefined) delete t.HOME[slot.id]; else t.HOME[slot.id] = had; }
    const htmlNow = slot.innerHTML;
    /* WHAT IT LEFT FOR LATER, given its 400ms — with the dice still held, so a timer's own redraw is as still
       as the first. */
    const until = RealDate.now() + 400;
    while (RealDate.now() < until) await new Promise(r => rT.call(w, r, 20));
    sb.on = false;
    audit();
    mo.disconnect();
    sb.hits.forEach(h => fails.push('asked for ' + h));
    const pend = [...mine.values()].filter(v => v === 'pending').length;
    if (pend) fails.push(pend + ' timer(s) or frame(s) still pending 400ms after the draw — something is still running');
    w.setTimeout = rT; w.clearTimeout = rC; w.setInterval = rI; w.requestAnimationFrame = rA; w.cancelAnimationFrame = rCA;
    w.Date = RealDate; w.Math.random = realRandom;
    return { fails: [...new Set(fails)], html: htmlNow };
  }
}

drawAheadRuntime_().then(rt => {
  if (rt.fails.length) {
    console.log('');
    console.log('A WIDGET DRAWN AHEAD THAT RUNS SOMETHING  (' + rt.fails.length + ')');
    rt.fails.forEach(x => console.log('  ' + x));
    bad = true;
  }
  if (rt.pureWrong.length) {
    console.log('');
    console.log('`pure` SAYS SOMETHING THE DRAWING DOES NOT  (' + rt.pureWrong.length + ')');
    rt.pureWrong.forEach(x => console.log('  ' + x));
    bad = true;
  }
  console.log('');
  console.log('  drawn ahead in a sandbox: ' + rt.drawn + ' draws over ' + rt.scenarios + ' scenarios');
  rt.notes.forEach(x => console.log('  ' + x));
  finish_();
}, e => { console.log('FAILED — the draw-ahead sandbox threw: ' + (e && e.stack || e)); bad = true; finish_(); });

function finish_() {
console.log('');
console.log('  tools: ' + widgets.filter(w => str(w.kind) === 'tool').map(w => str(w.id)).join(', '));
console.log('  games: ' + widgets.filter(w => str(w.kind) === 'game').map(w => str(w.id)).join(', '));
console.log('');
console.log('widgets: ' + widgets.length
          + '   tools: ' + widgets.filter(w => str(w.kind) === 'tool').length
          + '   games: ' + widgets.filter(w => str(w.kind) === 'game').length);
console.log(bad
  ? 'FAILED — each of those is a widget that draws and does nothing.'
  : 'OK — every widget has the four keys, a kind a column asks for, a unique id, and an `into` its '
    + 'own html contains; every draw ahead runs nothing, and `pure` says what the drawing does.');
process.exit(bad ? 1 : 0);
}
