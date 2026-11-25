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

/* AN ITEM (487, words.js `itemMark_`): Edit words for an admin — Find's own code places it. */
const MISSING_ID = 'item:stuff:missing-papers';
const missingFor_ = () => may_('admin');
/* THE PAGE ABOVE FIND'S QUESTION (`FINDERS.stuff.lead`, find.js): an admin's only. */
/* AND SUGGEST A CHANGE (486): one row with the item's tiles (`suggestRowIn_`, submit.js). */
/* IN FIND, NOT ABOVE IT (owner, 4 Nov): the lead page is empty. Its card (Owner questions, which held What's missing) was removed (owner, 18 Nov). */
function missingLead_() { return []; }
const missingLeadN_ = () => 0;
function missingLeadCards_() {
  if (!missingFor_()) return [];
  const h = typeof itemMark_ === 'function' ? itemMark_(MISSING_ID, missingCard_()) : missingCard_();
  return [typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'missing-papers', 'What’s missing') : h];
}
/* SETTINGS CARDS IN FIND, drawn by their own files: the business checker (1050). */
const HEALTH_MORE_ = { bizcheck: () => (typeof window.bizCheckCard_ === 'function' ? window.bizCheckCard_() : '') };
function healthCardOf_(which) {
  if (HEALTH_MORE_[which]) return HEALTH_MORE_[which]();
  /* ONE CARD (owner, 6 Nov): the Optimiser holds What's missing too, how complete Find's resources are, under its score. */
  const all = (() => { try { return missingLeadCards_(); } catch (e) { oops_(e, 'health card'); return []; } })();
  return all.join('') || renderCard({ kind: 'panel', body: [{ type: 'text', look: 'empty', text: typeof NOTHING_YET === 'string' ? NOTHING_YET : text_('nothing-yet') }] });
}

/* A CARD FROM ITS BLOCKS, through the one card maker; its name is its first tag. */
const healthCardSpec_ = (body, look, name) => renderCard({ kind: 'panel', look: look || 'logic-card', name, tags: [name || 'What’s missing'], body });

/* ---------- THE LIST, FETCHED WHEN THE CARD IS FIRST DRAWN — never in the boot payload; absent or broken is an empty list ---------- */
function missingAsk_() {
  if (MISSING.list || MISSING.asking || typeof fetch !== 'function') return;
  MISSING.asking = true;
  dataFile_('data/settings/expected-papers.json')
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
  if (!r || !libIsDoc_(r) || !String(r.exam_board || '').trim()) return null;
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
function missingCard_() {
  return healthCardSpec_([missingBox_()], 'miss-card', 'What’s missing');
}
