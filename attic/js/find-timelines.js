/* @family. — js/find-timelines.js THE TIMELINES (1040 batch F): each one an animation panning from event to event; after find-history.js. */
/* THE TIMELINES (batch F): one item per row of data/timelines.json (tools/timelines.py), its events by id from data/timeline.json. */
const histTimelineKey_ = id => 'hdb:tl:' + String(id).toLowerCase().replace(/^tl-/, '').replace(/[^a-z0-9]+/g, '-');
/* A ROW'S EVENTS BY ID ONLY (owner, 11 Nov: a compilation of the event items): caption and scene are the event row's own. */
const tlStops_ = t => (t.events || []).map(s => histRow_(typeof s === 'string' ? s : (s || {}).id)).filter(Boolean)
  .map(ev => ({ ev: ev, label: String(ev.label || ev.name || ''), px: Array.isArray(ev.px) ? ev.px : [] }));
let TL_MEMO = { rows: null, items: [] };
function histTimelines_() {
  const rows = (typeof DATA !== 'undefined' && DATA && DATA.timelines) || [];
  if (TL_MEMO.rows === rows && TL_MEMO.ev === DATA.timeline) return TL_MEMO.items;
  const items = rows.map(t => {
    const stops = tlStops_(t), evs = stops.map(s => s.ev);
    if (!evs.length) return null;
    const ys = evs.flatMap(e => [e.date_from, e.date_to]).filter(n => n != null && isFinite(n));
    const row = { id: t.id, name: t.name, date_from: Math.min(...ys), date_to: Math.max(...ys),
      theatre: [...new Set(evs.flatMap(e => histList_(e.theatre)))].join(' | '), events: evs, tl: t, stops: stops };
    return { kind: 'timeline', hdb: true, name: t.name, key: histTimelineKey_(t.id), image: '', sub: '', histKind: 'Timelines',
      shelf: 'History', subject: 'History', text: plainText_(t.name + ' ' + evs.map(e => e.name).join(' ')), row: row, era: t.era || '' };
  }).filter(Boolean);
  TL_MEMO = { rows: rows, ev: DATA.timeline, items: items };
  return items;
}
/* A DAY AS A LINE OF THE TIMELINE SAYS IT: 1939-09-01 → 1 Sep 1939; anything else as written. */
const histDay_ = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? +m[3] + ' ' + MONTH_NAMES[+m[2] - 1].slice(0, 3) + ' ' + m[1] : String(iso || ''); };
/* AN EVENT AS A POINT ON THE AXIS, in years: its year plus how far through it its first day is (BC years are negative). */
function tlAt_(e) {
  const m = /^-?\d+-(\d{2})-(\d{2})$/.exec(e.date_iso || '');
  return Number(e.date_from) + (m ? ((+m[1] - 1) * 30.4 + (+m[2] - 1)) / 365 : 0);
}
/* THE AXIS'S TICKS: a step that puts four or so in the window, said as the timeline's unit counts (a month, a year, a century). */
const TL_STEPS = [1 / 12, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];
function tlTicks_(from, to, win, unit) {
  const step = TL_STEPS.find(s => win / s <= 5) || 1000, out = [];
  for (let v = Math.ceil(from / step) * step; v <= to && out.length < 400; v += step) {
    const y = Math.floor(v + 1e-9), mo = Math.round((v - y) * 12);
    const say = !y && step >= 1 ? 'AD 1' : step < 1 ? (mo ? MONTH_NAMES[mo].slice(0, 3) : 'Jan') + ' ' + y : unit === 'century' || y < 0 ? histYear_(y) : String(y);
    out.push({ v: v, say: say });
  }
  return out;
}
/* THE SCENE: the event's 16x16 drawing, its date and its caption — swapped whole so it pops in each time. */
function tlScene_(s) {
  return `<figure class="tl-pic">${pixSvg_(s.px, s.label, false, ' tl-big')}</figure>
    <div class="tl-year">${esc(s.ev.date_text || histDay_(s.ev.date_iso))}</div><div class="tl-label">${esc(s.label)}</div>`;
}
/* THE GEOMETRY: the track is span ÷ window views wide, so a short window is zoomed in; it is moved to centre the event shown. */
function tlGeom_(x) {
  const r = x.row, at = r.stops.map(s => tlAt_(s.ev)), t = r.tl || {};
  const from = Math.min(...at), to = Math.max(...at), span = Math.max(to - from, 1e-3);
  const win = Math.max(Number(t.window) || span / 4, span / 400), pad = win / 2;
  const lo = from - pad, hi = to + pad, wide = (hi - lo) / win;
  return { at: at, lo: lo, hi: hi, wide: wide, pct: v => (v - lo) / (hi - lo) * 100, unit: t.unit || 'year', win: win };
}
const tlShift_ = (g, i) => (50 / g.wide - g.pct(g.at[i])).toFixed(3);
/* THE CARD'S OWN BUTTONS (one template): Play leads its row, Back and Next wait behind ⋯; the same tiles whatever is shown. */
function tlOpts_(key, i, n) {
  const playing = TL_PLAY.key === key && !!TL_PLAY.timer;
  return [{ icon: playing ? 'pause' : 'play', label: playing ? 'Pause' : 'Play', act: 'tl-play', data: { key }, pressed: playing },
    { icon: 'left', label: 'Back', act: 'tl-step', data: { key, by: -1 }, off: i === 0 },
    { icon: 'right', label: 'Next', act: 'tl-step', data: { key, by: 1 }, off: i === n - 1 }];
}
/* THE STAGE, drawn when the card is: the scene over the panning axis of small scenes, the card's picture (kc-pic) like an image card's. */
function tlStage_(x) {
  const stops = x.row.stops, n = stops.length;
  if (!n) return '';
  const key = x.key, i = Math.min(TL_AT[key] || 0, n - 1), g = tlGeom_(x);
  const ticks = tlTicks_(g.lo, g.hi, g.win, g.unit).map(k => `<span class="tl-tick" style="left:${g.pct(k.v).toFixed(3)}%"><i>${esc(k.say)}</i></span>`).join('');
  const dots = stops.map((s, k) => `<span class="tl-ev${k === i ? ' on' : k < i ? ' past' : ''}" style="left:${g.pct(g.at[k]).toFixed(3)}%">${pixSvg_(s.px, '', false, ' tl-mini')}</span>`).join('');
  return `<div class="tl-scene" aria-live="polite">${tlScene_(stops[i])}</div>
    <div class="tl-view"><div class="tl-track" style="width:${(g.wide * 100).toFixed(2)}%;transform:translateX(${tlShift_(g, i)}%)">${ticks}${dots}</div><span class="tl-pin"></span></div>`;
}
/* THE ANIMATION IS THE PICTURE (owner, 11 Nov): its stage is the timeline tool's embed; its controls join the card's one row. */
CARD_EMBEDS.timeline = a => { const x = tlItem_(a.key); return x ? tlStage_(x) : ''; };
cardKind_('timeline', x => { setTimeout(() => tlAuto_(x.key), 700);
  const stops = (x.row && x.row.stops) || [], n = stops.length;
  return { look: 'hdb hdb-tl lib-c', name: x.name, tags: kcFacetTags_(x), body: [{ type: 'embed', tool: 'timeline', look: 'tl-anim tl-art', data: { tl: x.key }, args: { key: x.key } },
    { type: 'text', look: 'tl-say', text: n + ' event' + (n === 1 ? '' : 's') + ', one at a time' }],
    tiles: n ? tlOpts_(x.key, Math.min(TL_AT[x.key] || 0, n - 1), n) : [] }; });

/* ONE PLAYER FOR EVERY TIMELINE: a step moves the track (a CSS transition pans it) and swaps the scene; the tiles never move. */
const TL_AT = {}, TL_PLAY = { key: '', timer: null }, TL_STEP_MS = 2600;
const tlItem_ = key => histTimelines_().find(y => y.key === key) || null;
function tlPaint_(key) {
  const x = tlItem_(key);
  if (!x) return;
  const stops = x.row.stops, n = stops.length, i = Math.min(TL_AT[key] || 0, n - 1), g = tlGeom_(x);
  document.querySelectorAll('.tl-anim').forEach(s => {
    if (s.getAttribute('data-tl') !== key) return;
    const tr = s.querySelector('.tl-track'), sc = s.querySelector('.tl-scene'), ctl = s.closest('.card') || s;
    if (!tr || !sc) { s.innerHTML = tlStage_(x); return; }
    tr.style.transform = 'translateX(' + tlShift_(g, i) + '%)';
    tr.querySelectorAll('.tl-ev').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('past', k < i); });
    if (sc.getAttribute('data-i') !== String(i)) { sc.setAttribute('data-i', i); sc.innerHTML = tlScene_(stops[i]); }
    /* IN PLACE, NOT REDRAWN: the card's own row holds these tiles, and a tile that is not swapped cannot move. */
    const tmp = document.createElement('div'); tmp.innerHTML = tile_(tlOpts_(key, i, n));
    [...tmp.querySelectorAll('button')].forEach(b => {
      const same = [...ctl.querySelectorAll('[data-do="' + b.getAttribute('data-do') + '"][data-key="' + key + '"]')].find(o => o.getAttribute('data-by') === b.getAttribute('data-by'));
      if (same && same.outerHTML !== b.outerHTML) same.replaceWith(b);
    });
  });
}
function tlStop_() {
  if (TL_PLAY.timer) clearInterval(TL_PLAY.timer);
  const k = TL_PLAY.key;
  TL_PLAY.timer = null; TL_PLAY.key = '';
  if (k) tlPaint_(k);
}
function tlMove_(key, by) {
  const x = tlItem_(key), n = x ? x.row.stops.length : 0;
  TL_AT[key] = Math.max(0, Math.min(n - 1, (TL_AT[key] || 0) + by));
  if (TL_AT[key] >= n - 1 && TL_PLAY.key === key) return tlStop_();
  tlPaint_(key);
}
on('tl-step', el => {
  const key = el.getAttribute('data-key');
  if (TL_PLAY.key === key) tlStop_();
  tlMove_(key, +el.getAttribute('data-by'));
});
/* PLAY ADVANCES ON A TIMER that holds its own timeline's key, and stops at the last event or once the card is gone. */
const TL_HELD = new Set();
function tlStart_(key) {
  tlStop_();
  const x = tlItem_(key);
  if (!x) return;
  /* STEP MODE when stillness is asked for: Play moves one event and nothing advances by itself. */
  if (typeof motionOK_ === 'function' && !motionOK_()) return tlMove_(key, 1);
  if ((TL_AT[key] || 0) >= x.row.stops.length - 1) TL_AT[key] = 0;
  TL_PLAY.key = key;
  TL_PLAY.timer = setInterval(() => {
    if (![...document.querySelectorAll('.tl-anim')].some(s => s.getAttribute('data-tl') === key && s.isConnected)) return tlStop_();
    tlMove_(key, 1);
  }, TL_STEP_MS);
  tlPaint_(key);
}
on('tl-play', el => {
  const key = el.getAttribute('data-key');
  if (TL_PLAY.key === key) { TL_HELD.add(key); return tlStop_(); }
  tlStart_(key);
});
/* IT PLAYS BY ITSELF once its card is on screen (the owner: "auto-advancing"), unless another plays or this one was paused. */
function tlAuto_(key) {
  if (TL_PLAY.key || TL_HELD.has(key) || (TL_AT[key] || 0) > 0 || (typeof motionOK_ === 'function' && !motionOK_())) return;
  const el = [...document.querySelectorAll('.tl-anim')].find(s => s.getAttribute('data-tl') === key);
  const r = el && el.isConnected ? el.getBoundingClientRect() : null;
  if (r && r.height && r.top < innerHeight && r.bottom > 0) tlStart_(key);
}
