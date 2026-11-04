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
const missingFor_ = () => typeof rankAtLeast_ === 'function' && rankAtLeast_('admin') && !(typeof itemGone_ === 'function' && itemGone_(MISSING_ID));
/* THE PAGE ABOVE FIND'S QUESTION (`FINDERS.stuff.lead`, find.js): an admin's only. */
/* AND SUGGEST A CHANGE (486), as on Daive's card: one row with the item's tiles (`suggestRowIn_`, submit.js). */
/* IN FIND, NOT ABOVE IT (owner, 4 Nov): the two cards are Find cards under Site health (find.js `health`); the lead page is empty. */
const HEALTH_IN_FIND = true;
function missingLead_() { return HEALTH_IN_FIND ? [] : missingLeadCards_(); }
function missingLeadCards_() {
  const out = logicLead_();
  if (!missingFor_()) return out;
  const h = typeof itemMark_ === 'function' ? itemMark_(MISSING_ID, '', missingCard_()) : missingCard_();
  return out.concat([typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'missing-papers', 'What’s missing') : h]);
}
const missingLeadN_ = () => HEALTH_IN_FIND ? 0 : (logicFor_() ? 1 : 0) + (missingFor_() ? 1 : 0);
/* ONE CARD EACH, for Find: `logic` or `missing`, the same markup the lead page drew. */
function healthCardOf_(which) {
  const all = (() => { try { return missingLeadCards_(); } catch (e) { oops_(e, 'health card'); return []; } })();
  const l = logicFor_() ? 1 : 0;
  return (which === 'logic' ? all.slice(0, l) : all.slice(l)).join('') || '<div class="card"><p class="sub">Nothing to show yet.</p></div>';
}

/* ---------- LOGIC HEALTH (770), ABOVE WHAT'S MISSING: data/logic-health.json, measured by tools/logic-health.js — mechanical, never AI ---------- */
const LOGIC_ID = 'item:stuff:logic-health';
const LOGIC = { got: null, failed: false, asked: false, all: false };
const logicFor_ = () => typeof rankAtLeast_ === 'function' && rankAtLeast_('admin') && !(typeof itemGone_ === 'function' && itemGone_(LOGIC_ID));
function logicLead_() {
  if (!logicFor_()) return [];
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
  const s = LOGIC.got, head = '<h3>Logic health</h3>';
  if (!s) return `<div class="card logic-card">${head}${LOGIC.failed ? '<p class="muted">The score could not be read. Run node tools/logic-health.js and push.</p>' : loading_()}</div>`;
  const rules = (s.rules || []).filter(r => r.count > 0).sort((a, b) => b.count - a.count);
  const top = (s.top || []).slice(0, LOGIC.all ? 25 : 3);
  const line = t => `<li><b>${esc(t.where)}</b> · ${esc(t.asks || '')}<br><span class="faint">${esc((t.why || []).join(' · '))}</span></li>`;
  return `<div class="card logic-card">${head}<p class="stab-score">${esc(String(s.score))}%</p>
    <p class="sub">${esc(String(s.healthy))} of ${esc(String(s.questions))} questions break no rule.</p>
    <p class="faint">${rules.map(r => esc(r.label) + ': ' + esc(String(r.count))).join(' · ') || 'Every rule holds.'}</p>
    <ol class="stab-top">${top.map(line).join('')}</ol>
    <p class="faint">${esc(s.cannot || '')}</p>
    ${(s.top || []).length > 3 ? tileRow_(tile_({ icon: LOGIC.all ? 'hide' : 'show', label: LOGIC.all ? 'Show the top three' : 'Show the worst ' + Math.min(25, s.top.length), act: 'logic-all' }), '', true) : ''}</div>`;
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
  const html = missingBody_();
  if (/class="loading"/.test(html)) return;
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
  /* ONE LINE, THEN THE LIST ON A TILE (660): "needs to be smaller". The summary counts; the tile opens what it counted. */
  const papers = r.quals.reduce((n, g) => n + g.missing, 0), gaps = r.quals.filter(g => g.missing).length;
  const say = (papers ? papers + ' ' + (papers === 1 ? 'paper' : 'papers') + ' missing in ' + gaps + ' of ' + r.quals.length
    : 'All ' + r.quals.length + ' complete') + (r.waiting ? ' · ' + r.waiting + ' waiting for words' : '');
  const tile = typeof tile_ === 'function'
    ? `<div class="tile-row">${tile_({ icon: MISSING.all ? 'up' : 'down', label: MISSING.all ? 'Fewer' : 'The list', act: 'miss-all' })}</div>` : '';
  return `<p class="miss-sum">${esc(say)}</p>` + (MISSING.all ? r.quals.map(missingQual_).join('') : '') + tile + unread;
}
if (typeof on === 'function') on('miss-all', () => { MISSING.all = !MISSING.all; missingRepaint_(); });
function missingCard_() {
  const body = missingBody_();
  const waits = /class="loading"/.test(body);
  return `<div class="card miss-card"><h3>What’s missing</h3>
    <div id="miss-body"${waits ? ' aria-busy="true"' : ''}>${body}</div></div>`;
}
