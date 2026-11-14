/* @family. — missing.js WHAT'S MISSING (526): an admin's card above Find, the papers data/settings/expected-papers.json expects against the covers in the library. */
/* The owner: "add a widget above Finder which tells me what stuff is missing to add". Read only; docs/library.md says how to edit the list. */

const MISSING = { list: null, asking: false, all: false, memo: { rows: null, list: null, out: null } };
/* WHICH MONTHS A SERIES' PAPERS ARE DATED: a June series sits in May and June. */
const MISSING_SERIES = { June: ['5', '6'], November: ['11'] };
/* A PAPER AS THE LIST SPELLS IT: its number (31 is Edexcel's Paper 31), then F or H when only that tier will do. */
const MISSING_CODE = /^([1-9]\d?)([FH]?)$/;
const MISSING_SITTING = /^(June|November) (\d{4})$/;
const MISSING_STAGE = { KS4: 'GCSE', KS5: 'A-Level' };
/* WHICH LINES THE CARD SHOWS (562, owner note 108): never OCR, and Edexcel only for Maths. One rule over the list, not edits to it. */
const MISSING_SHOWN = q => q.board !== 'OCR' && (q.board !== 'Edexcel' || q.subject === 'Maths');
/* WHICH QUALIFICATIONS ARE OPEN, so a redraw does not shut one (no pop-up: a <details> grows where it is). */
const MISSING_OPEN = new Set();
document.addEventListener('toggle', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('miss-q')) return;
  const k = el.getAttribute('data-q') || '';
  if (el.open) MISSING_OPEN.add(k); else MISSING_OPEN.delete(k);
}, true);

/* AN ITEM (487, layout.js `itemMark_`): Delete and Note for an admin, no move and no door — Find's own code places it. */
const MISSING_ID = 'item:stuff:missing-papers';
const missingFor_ = () => isAdmin() && !(typeof itemGone_ === 'function' && itemGone_(MISSING_ID));
/* THE PAGE ABOVE FIND'S QUESTION (`FINDERS.stuff.lead`, find.js): an admin's only. */
/* AND SUGGEST A CHANGE (486), as on Daive's card: one row with the item's tiles (`suggestRowIn_`, submit.js). */
/* IN FIND, NOT ABOVE IT (owner, 4 Nov): the two cards are Find cards under the Optimiser (find.js `health`); the lead page is empty. */
const HEALTH_IN_FIND = true;
function missingLead_() { return HEALTH_IN_FIND ? [] : missingLeadCards_(); }
function missingLeadCards_() {
  const out = logicLead_();
  if (!missingFor_()) return out;
  const h = typeof itemMark_ === 'function' ? itemMark_(MISSING_ID, '', missingCard_()) : missingCard_();
  return out.concat([typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'missing-papers', 'What’s missing') : h]);
}
const missingLeadN_ = () => HEALTH_IN_FIND ? 0 : (LOGIC_SHOWN && logicFor_() ? 1 : 0) + (missingFor_() ? 1 : 0);
/* ONE CARD EACH, for Find: `logic` or `missing`, the same markup the lead page drew. */
/* ONE SCORE (890): `health` is the Optimiser; the Logic health card stays written but is off behind LOGIC_SHOWN. */
const LOGIC_SHOWN = false;
/* SETTINGS CARDS IN FIND BESIDE THE HEALTH ONES, drawn by their own files: the business checker (1050). */
const HEALTH_MORE_ = { bizcheck: () => (typeof window.bizCheckCard_ === 'function' ? window.bizCheckCard_() : '') };
function healthCardOf_(which) {
  if (HEALTH_MORE_[which]) return HEALTH_MORE_[which]();
  /* ONE CARD (owner, 6 Nov): the Optimiser holds What's missing too, how complete Find's resources are, under its score. */
  if (which === 'health') { try { return healthWithMissing_(siteHealthCard_(true)); } catch (e) { oops_(e, 'site health'); return ''; } }
  const all = (() => { try { return missingLeadCards_(); } catch (e) { oops_(e, 'health card'); return []; } })();
  const l = LOGIC_SHOWN && logicFor_() ? 1 : 0;
  return (which === 'logic' ? all.slice(0, l) : all.slice(l)).join('') || renderCard({ kind: 'panel', body: [{ type: 'text', look: 'empty', text: typeof NOTHING_YET === 'string' ? NOTHING_YET : 'Nothing yet' }] });
}

/* ---------- SITE HEALTH (890): data/health.json, written by tools/health.js — code 40%, Find logic 35%, UI 25%, mechanical ---------- */
const HEALTH = { got: null, failed: false, asked: false, all: false };
function siteHealthCard_(raw) {
  /* `raw`: its blocks, for What’s missing to join before the card is drawn. */
  const out = b => (raw ? b : healthCardSpec_(b));
  if (!HEALTH.asked && typeof fetch === 'function') {
    HEALTH.asked = true;
    Promise.resolve()
      .then(() => fetch('data/health.json' + deployStamp_(), { cache: 'default' }))
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(j => { HEALTH.got = j && typeof j.score === 'number' ? j : null; HEALTH.failed = !HEALTH.got; })
      .catch(() => { HEALTH.failed = true; })
      .then(() => { try { markStale_(['stuff']); paint('stuff'); } catch (e) { /* the finder redraws on its next paint anyway */ } });
  }
  const s = HEALTH.got;
  if (!s) return out([HEALTH.failed ? healthSaid_('The score could not be read. Run node tools/health.js and push.') : { type: 'wait', on: true }]);
  const list = (HEALTH.all ? s.all : s.top) || [];
  const said = { code: 'Code', logic: 'Find logic', ui: 'UI' };
  return out([{ type: 'group', tag: 'p', look: 'stab-score', text: String(s.score) + '%' },
    s.next ? { type: 'group', tag: 'p', text: { b: String(s.next) } } : null, healthTrend_(s.trend),
    { type: 'list', ordered: true, look: 'stab-top', items: list.map(t => [String(t.say) + ' ', { span: 'qtag', text: `${said[t.part] || t.part}, −${t.cost}` }]) },
    healthWork_(s.worklist),
    (s.all || []).length > 5 ? { type: 'tiles', tiles: [{ icon: HEALTH.all ? 'hide' : 'show', label: HEALTH.all ? 'Show the top 5' : 'Show the full list', act: 'health-all' }] } : null].filter(Boolean));
}
/* A HEALTH CARD FROM ITS BLOCKS, through the one card maker; its name is its first tag. */
const healthCardSpec_ = (body, look, name) => renderCard({ kind: 'panel', look: look || 'logic-card', name, tags: [name || 'Optimiser worklist'], body });
/* A LINE SAID ALOUD WHEN A SCORE COULD NOT BE READ. */
const healthSaid_ = text => ({ type: 'group', tag: 'p', look: 'note', attrs: { role: 'alert' }, text });
/* THE TREND (920): the last thirty full runs as one thin line in the text colour, and the commit of the worst drop. */
function healthTrend_(t) {
  const v = (t && Array.isArray(t.last) ? t.last : []).map(Number).filter(n => isFinite(n));
  if (v.length < 2) return null;
  const lo = Math.min(...v), hi = Math.max(...v), span = hi - lo || 1;
  const pts = v.map((n, i) => (i * 100 / (v.length - 1)).toFixed(1) + ',' + (22 - (n - lo) / span * 20).toFixed(1)).join(' ');
  return { type: 'drawing', node: { el: 'svg', a: { viewBox: '0 0 100 24', width: '100%', height: '24', preserveAspectRatio: 'none', role: 'img', 'aria-label': `Score over the last ${v.length} runs` },
    kids: [{ el: 'polyline', a: { points: pts, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'vector-effect': 'non-scaling-stroke' } }] } };
}
/* THE FIXER'S FIRST FIVE (920): the dearest findings of tools/health.js's worklist, each where it is and what it is, in plain words. */
const HEALTH_SAY = { 'one-off': 'A special case for one name', 'long-fn': 'A long function', 'big-file': 'A very big file',
  dup: 'A copied block', nest: 'Code nested too deep', catch: 'An error swallowed silently' };
function healthWork_(w) {
  const top = (Array.isArray(w) ? w : []).slice(0, 5);
  if (!top.length) return null;
  return { type: 'list', ordered: true, look: 'stab-top', items: top.map(f => [{ b: `${f.file}:${f.line}` }, ' · ' + (HEALTH_SAY[f.kind] || String(f.kind)) + ' ', { span: 'qtag', text: String(f.text || '') }]) };
}
on('health-all', () => { HEALTH.all = !HEALTH.all; try { markStale_(['stuff']); paint('stuff'); } catch (e) { /* the finder redraws on its next paint anyway */ } });

/* ---------- LOGIC HEALTH (770), ABOVE WHAT'S MISSING: data/logic-health.json, measured by tools/logic-health.js — mechanical, never AI ---------- */
const LOGIC_ID = 'item:stuff:logic-health';
const LOGIC = { got: null, failed: false, asked: false, all: false };
const logicFor_ = () => isAdmin() && !(typeof itemGone_ === 'function' && itemGone_(LOGIC_ID));
function logicLead_() {
  if (!LOGIC_SHOWN || !logicFor_()) return [];
  const h = typeof itemMark_ === 'function' ? itemMark_(LOGIC_ID, '', logicCard_()) : logicCard_();
  return [typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'logic-health', 'Logic health') : h];
}
function logicCard_() {
  if (!LOGIC.asked && typeof fetch === 'function') {
    LOGIC.asked = true;
    Promise.resolve()
      .then(() => fetch('data/logic-health.json' + deployStamp_(), { cache: 'default' }))
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(j => { LOGIC.got = j && typeof j.score === 'number' ? j : null; LOGIC.failed = !LOGIC.got; })
      .catch(() => { LOGIC.failed = true; })
      .then(() => { try { markStale_(['stuff']); paint('stuff'); } catch (e) { /* the finder redraws on its next paint anyway */ } });
  }
  const s = LOGIC.got;
  if (!s) return healthCardSpec_([LOGIC.failed ? healthSaid_('The score could not be read. Run node tools/logic-health.js and push.') : { type: 'wait', on: true }], '', 'Logic health');
  const top = (s.top || []).slice(0, LOGIC.all ? 25 : 3);
  const line = t => [{ b: t.where }, ' · ' + (t.asks || '') + ' ', { span: 'qtag', text: (t.why || []).join(' · ') }];
  return healthCardSpec_([{ type: 'group', tag: 'p', look: 'stab-score', text: String(s.score) + '%' },
    { type: 'list', ordered: true, look: 'stab-top', items: top.map(line) },
    (s.top || []).length > 3 ? { type: 'tiles', tiles: [{ icon: LOGIC.all ? 'hide' : 'show', label: LOGIC.all ? 'Show the top 3' : 'Show the worst ' + Math.min(25, s.top.length), act: 'logic-all' }] } : null].filter(Boolean), '', 'Logic health');
}
on('logic-all', () => { LOGIC.all = !LOGIC.all; try { markStale_(['stuff']); paint('stuff'); } catch (e) { /* the finder redraws on its next paint anyway */ } });

/* ---------- THE LIST, FETCHED WHEN THE CARD IS FIRST DRAWN — never in the boot payload; absent or broken is an empty list ---------- */
function missingAsk_() {
  if (MISSING.list || MISSING.asking || typeof fetch !== 'function') return;
  MISSING.asking = true;
  const stamp = deployStamp_();
  Promise.resolve()
    .then(() => fetch('data/settings/expected-papers.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok ? res.json() : null))
    .catch(() => null)
    .then(d => {
      MISSING.asking = false;
      MISSING.list = Array.isArray(d) ? d : [];
      missingRepaint_();
    });
}
function missingRepaint_() {
  const el = document.getElementById('miss-body');
  if (!el) return;
  const html = cardBlocks_(missingBody_());
  if (missingWaits_()) return;
  /* THE CARD'S OWN TILES JOINED INTO THE LIST'S ROW (tileRowsJoin_, 489) are kept, so The list never takes Delete away (660). */
  const kept = [...el.querySelectorAll('.tile-group')];
  el.innerHTML = html;
  el.removeAttribute('aria-busy');
  if (kept.length) {
    let row = [...el.children].filter(c => c.classList.contains('tile-row')).pop();
    if (!row) { row = document.createElement('div'); row.className = 'tile-row'; el.after(row); }
    kept.forEach(g => row.appendChild(g));
  }
}

/* ---------- ONE LINE OF THE LIST, READ — or null when it cannot be (counted on the card, never silent) ---------- */
function missingEntry_(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  const s = v => String(v == null ? '' : v).trim();
  const codes = a => (Array.isArray(a) ? a : []).map(s).filter(p => MISSING_CODE.test(p));
  const sits = a => (Array.isArray(a) ? a : []).map(s).filter(v => MISSING_SITTING.test(v));
  const board = s(e.board), level = s(e.level), subject = s(e.subject), papers = codes(e.papers);
  const from = Number(e.from), to = Number(e.to);
  if (!board || !level || !subject || !papers.length || !(from >= 2000 && to >= from && to - from <= 50)) return null;
  const series = (Array.isArray(e.series) && e.series.length ? e.series : ['June']).map(s).filter(x => MISSING_SERIES[x]);
  const skip = new Set(sits(e.skip));
  let sittings = [];
  for (let y = from; y <= to; y++) series.forEach(x => sittings.push(x + ' ' + y));
  sits(e.also).forEach(x => { if (sittings.indexOf(x) === -1) sittings.push(x); });
  const when = x => { const m = MISSING_SITTING.exec(x); return Number(m[2]) * 2 + (m[1] === 'November' ? 1 : 0); };
  sittings = sittings.filter(x => !skip.has(x)).sort((a, b) => when(a) - when(b));
  const papersIn = {};
  const pi = e.papers_in && typeof e.papers_in === 'object' && !Array.isArray(e.papers_in) ? e.papers_in : {};
  Object.keys(pi).forEach(k => { if (MISSING_SITTING.test(k) && codes(pi[k]).length) papersIn[k] = codes(pi[k]); });
  return { board, level, subject, spec: s(e.spec).toUpperCase(), label: s(e.label) || [board, level, subject].join(' '),
           papers, sittings, papersIn };
}

/* ---------- A PAPER'S COVER, AS THE LIST ASKS ABOUT IT — its cells first, its name where a cell is blank ---------- */
function missingCover_(r) {
  if (!r || !libIsDoc_(r) || String(r.document_type || '').trim().toLowerCase() !== 'past paper') return null;
  const t = v => String(v == null ? '' : v).trim(), name = t(r.name), m = t(r.month);
  const year = t(r.year) || ((/\b(20\d\d)\b/.exec(name) || [])[1] || '');
  const series = m === '11' ? 'November' : MISSING_SERIES.June.indexOf(m) !== -1 ? 'June'
    : /\bNovember\b/i.test(name) ? 'November' : /\b(May|June)\b/i.test(name) ? 'June' : '';
  let paper = t(r.paper);
  /* PAPER 31 IS FILED AS PAPER 3 (the schema's numbers run 1 to 7); its name says which. */
  const named = /\bPaper (\d{1,2})\b/i.exec(name);
  if (named && (!paper || named[1].indexOf(paper) === 0)) paper = named[1];
  const tier = (t(r.tier).charAt(0) || ((/\d([FH])$/i.exec(t(r.spec_code)) || [])[1] || '')).toUpperCase();
  if (!year || !series || !paper) return null;
  /* A BLANK LEVEL IS READ OFF THE KEY STAGE, as the older covers were written (AQA's RS 7062, a Physics 8463). */
  const levels = (t(r.level) || MISSING_STAGE[t(r.key_stage)] || '').split(',').map(t).filter(Boolean);
  return { board: t(r.exam_board), levels, subject: t(r.subject), spec: t(r.spec_code).toUpperCase(),
           sitting: series + ' ' + year, paper, tier, id: t(r.paper_id) };
}
/* A COVER BELONGS TO A QUALIFICATION by board, level and subject, and by spec where both name one (7062 and 7172 are both RS). */
const missingOf_ = (q, c) => c.board === q.board && c.levels.indexOf(q.level) !== -1 && c.subject === q.subject
  && (!q.spec || !c.spec || c.spec.indexOf(q.spec) === 0);
/* A COVER WITH NO SPEC IS THE FIRST LINE'S of its board, level and subject, never two lines' at once. */
const missingOwns_ = (quals, q, c) => missingOf_(q, c) && (!!c.spec || quals.find(x => missingOf_(x, c)) === q);
const missingIs_ = (c, code) => {
  const m = MISSING_CODE.exec(code);
  return !!m && c.paper === m[1] && (!m[2] || c.tier === m[2]);
};

/* ---------- THE GAPS: per qualification, each sitting's papers with no cover; and the covers whose words have not come ---------- */
function missingGaps_(quals, rows) {
  rows = Array.isArray(rows) ? rows : [];
  const covers = rows.map(missingCover_).filter(Boolean);
  const pending = new Set();
  rows.forEach(r => { if (r && r.paper_id && libTrue(r.lib_pending)) pending.add(String(r.paper_id)); });
  const docs = new Set(rows.filter(r => r && libIsDoc_(r) && r.paper_id).map(r => String(r.paper_id)));
  const out = quals.map(q => {
    const mine = covers.filter(c => missingOwns_(quals, q, c));
    let want = 0;
    const gaps = q.sittings.map(s => {
      const papers = q.papersIn[s] || q.papers;
      want += papers.length;
      return { sitting: s, papers: papers.filter(code => !mine.some(c => c.sitting === s && missingIs_(c, code))) };
    }).filter(g => g.papers.length);
    const missing = gaps.reduce((n, g) => n + g.papers.length, 0);
    const waiting = new Set(mine.filter(c => pending.has(c.id)).map(c => c.id)).size;
    return { q, gaps, want, missing, waiting };
  });
  return { quals: out, waiting: [...docs].filter(id => pending.has(id)).length };
}
function missingNow_() {
  const rows = typeof libDocRows_ === 'function' ? libDocRows_() : [];
  const memo = MISSING.memo;
  if (memo.rows === rows && memo.list === MISSING.list && memo.out) return memo.out;
  const read = (MISSING.list || []).map(missingEntry_);
  const known = read.filter(Boolean), quals = known.filter(MISSING_SHOWN);
  const out = Object.assign(missingGaps_(quals, rows), { unread: read.length - known.length });
  MISSING.memo = { rows: rows, list: MISSING.list, out: out };
  return out;
}

/* ---------- THE CARD ---------- */
const missingPapers_ = codes => (codes.length > 1 ? 'Papers ' : 'Paper ') + codes.join(', ');
const missingKV_ = (k, v) => [{ type: 'group', tag: 'span', look: 'k', text: k }, { type: 'group', tag: 'span', look: 'v', text: v }];
function missingQual_(g) {
  if (!g.missing) return { type: 'group', look: 'miss-done', blocks: [{ type: 'list', items: [{ label: g.q.label, value: 'complete' + (g.waiting ? ' · ' + g.waiting + ' waiting' : '') }] }] };
  const say = g.missing === g.want ? 'none yet' : g.missing + ' missing';
  const lines = g.gaps.map(x => ({ label: x.sitting, value: missingPapers_(x.papers) }));
  if (g.waiting) lines.push({ label: 'Waiting for their words', value: String(g.waiting) });
  const id = g.q.label;
  return { type: 'group', tag: 'details', look: 'miss-q', attrs: { 'data-q': id, open: MISSING_OPEN.has(id) }, blocks: [
    { type: 'group', tag: 'summary', look: 'row', blocks: missingKV_(g.q.label, say) },
    { type: 'group', look: 'miss-gaps', blocks: [{ type: 'list', items: lines }] }] };
}
/* IS THE LIST STILL COMING: asked of the waits, never of the HTML drawn for them. */
const missingWaits_ = () => MISSING.list === null || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null);
function missingBody_() {
  missingAsk_();
  if (missingWaits_()) return [{ type: 'wait', on: true }];
  const r = missingNow_();
  const unread = r.unread ? { type: 'group', tag: 'p', look: 'note', text: `${r.unread} ${r.unread === 1 ? 'line' : 'lines'} of expected-papers.json not understood.` } : null;
  if (!r.quals.length) return [{ type: 'group', tag: 'p', look: 'note', text: 'Nothing listed to expect yet.' }, unread].filter(Boolean);
  /* ONE LINE, THEN THE LIST ON A TILE (660): "needs to be smaller". The summary counts; the tile opens what it counted. */
  const papers = r.quals.reduce((n, g) => n + g.missing, 0), gaps = r.quals.filter(g => g.missing).length;
  const say = (papers ? papers + ' ' + (papers === 1 ? 'paper' : 'papers') + ' missing in ' + gaps + ' of ' + r.quals.length
    : 'All ' + r.quals.length + ' complete') + (r.waiting ? ' · ' + r.waiting + ' waiting for words' : '');
  return [{ type: 'group', tag: 'p', look: 'miss-sum', text: say }].concat(MISSING.all ? r.quals.map(missingQual_) : [],
    [{ type: 'tiles', tiles: [{ icon: MISSING.all ? 'up' : 'down', label: MISSING.all ? 'Fewer' : 'The list', act: 'miss-all' }] }, unread]).filter(Boolean);
}
if (typeof on === 'function') on('miss-all', () => { MISSING.all = !MISSING.all; missingRepaint_(); });
/* THE OPTIMISER'S BLOCKS WITH WHAT'S MISSING UNDER THEM (one card); `#miss-body` is what the list's arrival fills again. */
const missingBox_ = () => { const body = missingBody_(); return { type: 'group', id: 'miss-body', attrs: { 'aria-busy': missingWaits_() ? 'true' : null }, blocks: body }; };
const missingHead_ = look => ({ type: 'msgHead', look, text: 'What’s missing' });
function healthWithMissing_(blocks) {
  if (!missingFor_()) return healthCardSpec_(blocks);
  return healthCardSpec_([].concat(blocks || [], [missingHead_('miss-head'), missingBox_()]), 'logic-card miss-card');
}
function missingCard_() {
  return healthCardSpec_([missingBox_()], 'miss-card', 'What’s missing');
}
