/* @family. — missing.js WHAT'S MISSING (526): an admin's card above Find, the papers data/settings/expected-papers.json expects against the covers in the library. */
/* The owner: "add a widget above Finder which tells me what stuff is missing to add". Read only; docs/library.md says how to edit the list. */

const MISSING = { list: null, asking: false, memo: { rows: null, list: null, out: null } };
/* WHICH MONTHS A SERIES' PAPERS ARE DATED: a June series sits in May and June. */
const MISSING_SERIES = { June: ['5', '6'], November: ['11'] };
/* A PAPER AS THE LIST SPELLS IT: its number (31 is Edexcel's Paper 31), then F or H when only that tier will do. */
const MISSING_CODE = /^([1-9]\d?)([FH]?)$/;
const MISSING_SITTING = /^(June|November) (\d{4})$/;
const MISSING_STAGE = { KS4: 'GCSE', KS5: 'A-Level' };
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
const missingFor_ = () => typeof rankAtLeast_ === 'function' && rankAtLeast_('admin') && !(typeof itemGone_ === 'function' && itemGone_(MISSING_ID));
/* THE PAGE ABOVE FIND'S QUESTION (`FINDERS.stuff.lead`, find.js): an admin's only. */
/* AND SUGGEST A CHANGE (486), as on Daive's card: one row with the item's tiles (`suggestRowIn_`, submit.js). */
function missingLead_() {
  if (!missingFor_()) return [];
  const h = typeof itemMark_ === 'function' ? itemMark_(MISSING_ID, '', missingCard_()) : missingCard_();
  return [typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'missing-papers', 'What’s missing') : h];
}
const missingLeadN_ = () => (missingFor_() ? 1 : 0);

/* ---------- THE LIST, FETCHED WHEN THE CARD IS FIRST DRAWN — never in the boot payload; absent or broken is an empty list ---------- */
function missingAsk_() {
  if (MISSING.list || MISSING.asking || typeof fetch !== 'function') return;
  MISSING.asking = true;
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
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
  const html = missingBody_();
  if (/class="loading"/.test(html)) return;
  el.innerHTML = html;
  el.removeAttribute('aria-busy');
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
  const quals = read.filter(Boolean);
  const out = Object.assign(missingGaps_(quals, rows), { unread: read.length - quals.length });
  MISSING.memo = { rows: rows, list: MISSING.list, out: out };
  return out;
}

/* ---------- THE CARD ---------- */
const missingPapers_ = codes => (codes.length > 1 ? 'Papers ' : 'Paper ') + codes.join(', ');
function missingQual_(g) {
  const k = `<span class="k">${esc(g.q.label)}</span>`;
  if (!g.missing) {
    return `<div class="row miss-done">${k}<span class="v">complete${g.waiting ? ' · ' + g.waiting + ' waiting' : ''}</span></div>`;
  }
  const say = g.missing === g.want ? 'none yet' : g.missing + ' missing';
  const lines = g.gaps.map(x => `<div class="row"><span class="k">${esc(x.sitting)}</span><span class="v">${esc(missingPapers_(x.papers))}</span></div>`).join('');
  const wait = g.waiting ? `<div class="row"><span class="k">Waiting for their words</span><span class="v">${g.waiting}</span></div>` : '';
  const id = g.q.label;
  return `<details class="miss-q" data-q="${esc(id)}"${MISSING_OPEN.has(id) ? ' open' : ''}>
      <summary class="row">${k}<span class="v">${esc(say)}</span></summary>
      <div class="miss-gaps">${lines}${wait}</div>
    </details>`;
}
function missingBody_() {
  missingAsk_();
  if (MISSING.list === null || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null)) return loading_();
  const r = missingNow_();
  const unread = r.unread ? `<p class="note">${r.unread} ${r.unread === 1 ? 'line' : 'lines'} of expected-papers.json not understood.</p>` : '';
  if (!r.quals.length) return '<p class="note">Nothing listed to expect yet.</p>' + unread;
  const waiting = r.waiting ? `<p class="note">${r.waiting} ${r.waiting === 1 ? 'paper' : 'papers'} waiting for their words.</p>` : '';
  return waiting + r.quals.map(missingQual_).join('') + unread;
}
function missingCard_() {
  const body = missingBody_();
  const waits = /class="loading"/.test(body);
  return `<div class="card miss-card"><h3>What’s missing</h3>
    <div id="miss-body"${waits ? ' aria-busy="true"' : ''}>${body}</div></div>`;
}
