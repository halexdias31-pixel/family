/* @family. — rules.js THE RULES (496): every place the site does something differently registers here, and the admin decides on Site's Rules card. */
/* The owner: "a list which shows me the unique rules which apply in some places and not others". Each code path asks `ruleOn_(id)`; check-rules holds it. */

/* ONE ROW A RULE: `say` the exception, `where` it applies, `uni` what Universal does instead, `lock` why it cannot be universal (never flips). */
const RULES = [
  { id: 'tap-44', say: 'Keypad keys, multiple-choice options and every Check/Send stay 44px while every other tile is 36px', where: 'A question\'s pages (487, 508)',
    uni: 'They shrink to the 36px tile size.' },
  { id: 'search-icon', say: 'The search box\'s magnifier stays 18px while every other mark is 16px', where: 'Find and Find 2 (487)',
    uni: 'The magnifier is 16px like every tile\'s mark.' },
  { id: 'whole-widgets', say: 'Console, Board games, Word & number games, Calculator, Whiteboard and Reels cannot be merged', where: 'Widget columns (480)',
    uni: 'They get Merge with the card above like every other widget.' },
  { id: 'library-one-card', say: 'Library cards holds one card, with no Add another', where: 'Settings (489)',
    uni: 'Several cards, with Add another, like every other list.' },
  { id: 'tell-admin', say: 'Messages and posts say "Tell the admin" instead of "Suggest a change"', where: 'Messages and posts (494)',
    uni: 'They say "Suggest a change" like everything else; the admin is still emailed at once.' },
  { id: 'scripture-age', say: 'The Bible, Talmud and Quran are for 18 and over only', where: 'Find and Find 2 (490)',
    uni: 'Open to every age, like every other item.' },
  { id: 'gcse-sensitive-age', say: 'GCSE-level history, RS, philosophy, psychology and sociology (and drugs, crime, abortion anywhere), and the history database, are for 14 and over', where: 'Find and Find 2 (505)',
    uni: 'Open to every age, like every other item.' },
  { id: 'kjv-admin', say: 'The Bible is shown to admins only', where: 'Find and Find 2 (490)',
    uni: 'Anyone of age sees it, like the Talmud and the Quran.' },
  { id: 'finder-members', say: 'Signed out, Find and Find 2 are one "Members only" card', where: 'Find and Find 2 (400)',
    uni: 'Signed out sees the finders like every other column.' },
  { id: 'keep-basket', say: 'The basket can never be deleted', where: 'Shop (462)',
    uni: 'Delete on it like every other widget.', lock: 'It is the one place a shop order is paid; without it nobody could pay.' },
  { id: 'admin-cols', say: 'Business and Site cards stay on those two columns and admin-only columns made past Site (508), and no other card moves onto them', where: 'Business and Site (491)',
    uni: 'Any card moves to any column.', lock: 'A card moved onto an admin column would vanish for everyone but an admin.' },
  { id: 'people-no-merge', say: 'A card drawn a page a person (Tutor directory, Every student, Every parent) cannot be merged', where: 'Profile columns (480)',
    uni: 'Merge on them too.', lock: 'A merged card is one page, and people cannot be stacked on one.' },
  { id: 'items-no-move', say: 'The festive card, the Camera and Daive\'s card have Delete but no move tiles', where: 'Feed and Messages (487)',
    uni: 'Move tiles like every card.', lock: 'Their column\'s own code places them; there is nothing to move them with yet.' },
  { id: 'form-save-row', say: 'A settings form keeps its own Save row instead of joining the card\'s tile row', where: 'Settings (489)',
    uni: 'One joined row like every other card.', lock: 'Joining it moved Add a qualification and broke a section\'s own Save.' },
  { id: 'find-front', say: 'The booking, feed and bundle pages stand in front of Find\'s results, not Find 2\'s', where: 'Find (347)',
    uni: 'Find 2 opens on them too.', lock: 'Those pages are drawn once with fixed ids; a second copy would answer for both.' },
  /* THE TOOLS ON FIND'S ITEMS (502): what is left of where a tool appears, now that the instruments are on every figure. */
  { id: 'meas-wordy', say: 'A figure in English, a language, RS or philosophy has no Ruler or Protractor', where: 'Questions with a figure (502)',
    uni: 'Ruler and Protractor on every figure, whatever the subject.' },
  { id: 'meas-under-pen', say: 'A figure the pen draws on has its Ruler and Protractor in the pen\'s bar, not laid on the figure', where: 'Questions answered by drawing (458, 502)',
    uni: 'Both, on the figure and in the bar.', lock: 'Two of one instrument on one figure would fight over the same finger.' },
  { id: 'pen-chosen', say: 'A multiple-choice or table question has no pen', where: 'Questions answered by an option or a cell (356)',
    uni: 'A pen on those too.', lock: 'The option or the cell is what is marked; a drawing on it could not be.' },
  { id: 'mag-items', say: 'The Magnifier is on Find\'s items (questions, library cards, scripture), not on people, shop or feed cards', where: 'Every card\'s tile row (463, 502)',
    uni: 'A Magnifier on every card.' },
  { id: 'speed-long', say: 'Speed read is on long words (content, practicals, projects, a Bible verse), not on a question', where: 'Every card\'s tile row (403, 502)',
    uni: 'Speed read on a question\'s words too.' },
  { id: 'hear-lang', say: 'Hear it is only on Spanish, French and German content cards', where: 'Content cards (427)',
    uni: 'Hear it on every card.', lock: 'It reads the foreign-language half of each line; nothing else has one.' },
];
const RULE_OF_ = id => RULES.find(r => r.id === id) || null;
/* THE DEVICE'S COPY of the last rules the payload sent, so the first paint is already the admin's choice. */
const RULES_STORE = 'familyRules';
const RULES_HIST_MAX = 20;
let RULES_MEMO = { src: undefined, out: null };
let RULES_KEPT;

/* ONE SHAPE, whatever arrived: `{ set: {id: 'universal'}, hist: [{id, was, to, at}] }`, known ids only. `rulesClean_` (core.gs) keeps the same rule. */
function rulesSane_(v) {
  let o = v;
  if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { return null; } }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const set = {}, s = o.set && typeof o.set === 'object' ? o.set : {};
  Object.keys(s).forEach(k => { const r = RULE_OF_(k); if (r && !r.lock && s[k] === 'universal') set[k] = 'universal'; });
  const ok = x => x === 'exception' || x === 'universal';
  const hist = (Array.isArray(o.hist) ? o.hist : []).filter(h => h && RULE_OF_(h.id) && ok(h.was) && ok(h.to))
    .slice(-RULES_HIST_MAX).map(h => ({ id: String(h.id), was: h.was, to: h.to, at: String(h.at || '').slice(0, 40) }));
  return { set: set, hist: hist };
}
function rulesKept_() {
  if (RULES_KEPT !== undefined) return RULES_KEPT;
  try { RULES_KEPT = rulesSane_(localStorage.getItem(RULES_STORE)); } catch (e) { RULES_KEPT = null; }
  return RULES_KEPT;
}
function rulesNow_() {
  let sent = false, src;
  try { sent = !!DATA && Object.prototype.hasOwnProperty.call(DATA, 'rules'); src = sent ? DATA.rules : undefined; } catch (e) { sent = false; }
  if (!sent) return rulesKept_();
  if (src === RULES_MEMO.src) return RULES_MEMO.out;
  const out = rulesSane_(src);
  RULES_MEMO = { src: src, out: out };
  RULES_KEPT = out;
  try { if (out) localStorage.setItem(RULES_STORE, JSON.stringify(out)); else localStorage.removeItem(RULES_STORE); } catch (e) {}
  rulesMark_();
  return out;
}
/* IS THE EXCEPTION IN FORCE HERE? True unless the admin made it universal; a locked rule, or an id nobody registered, always is. */
function ruleOn_(id) {
  const r = RULE_OF_(id);
  if (!r || r.lock) return true;
  const s = rulesNow_();
  return !(s && s.set && s.set[id] === 'universal');
}
/* THE RULES ONLY CSS CAN APPLY, said on the root as `data-uni` (style.css reads `:root[data-uni~="…"]`). */
function rulesMark_() {
  try {
    const uni = [];
    if (!ruleOn_('tap-44')) uni.push('tap-44');
    if (!ruleOn_('search-icon')) uni.push('search-icon');
    if (uni.length) document.documentElement.setAttribute('data-uni', uni.join(' '));
    else document.documentElement.removeAttribute('data-uni');
  } catch (e) {}
}
rulesMark_();

/* ---------- THE RULES CARD (Site column, admin only): one line a rule, a two-state switch, and Undo for the last change ---------- */
function rulesCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  const s = rulesNow_() || { set: {}, hist: [] };
  const last = s.hist[s.hist.length - 1];
  const lastR = last && RULE_OF_(last.id);
  const row = r => {
    const uni = !ruleOn_(r.id);
    const opt = (to, label) => `<button type="button" class="btn quiet rule-opt${(to === 'universal') === uni ? ' on' : ''}" data-do="rule-set" data-rule="${esc(r.id)}" data-to="${to}" aria-pressed="${(to === 'universal') === uni}">${label}</button>`;
    return `<div class="rule-row${r.lock ? ' is-locked' : ''}" data-rule="${esc(r.id)}">
      <p class="rule-say">${esc(r.say)} <span class="faint">· ${esc(r.where)}</span></p>
      ${r.lock ? `<p class="faint rule-lock">Locked: ${esc(r.lock)}</p>`
        : `<div class="rule-sw" role="group" aria-label="${esc(r.say)}">${opt('exception', 'Exception')}${opt('universal', 'Universal')}</div>
      <p class="faint rule-uni">Universal: ${esc(r.uni)}</p>`}</div>`;
  };
  return `<div class="card biz rules-card"><h3>Rules</h3>
    ${RULES.map(row).join('')}
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Undo', note: lastR ? 'back to ' + last.was + ': ' + lastR.say.slice(0, 60) : 'nothing to undo', act: 'rules-undo', tone: 'admin', off: !last })}</div>
    <p class="faint rules-said" aria-live="polite"></p></div>`;
}
function rulesSend_(body, el) {
  if (!USER || !(typeof isAdmin === 'function' && isAdmin())) return;
  const card = el.closest('.rules-card');
  send_(Object.assign({ action: 'rulesSave', name: USER.name, personId: USER.personId || '' }, body),
    { button: el, where: (card && card.querySelector('.rules-said')) || undefined, busy: 'Saving…' })
    .then(d => {
      if (!d || !d.success) return;
      try { DATA.rules = d.rules; } catch (e) {}
      rulesNow_();
      toast(body.undo ? 'The last rule change is undone' : 'Saved for everybody');
      /* EVERY COLUMN, because a rule reaches past this one; a finder's memo catches up on the next reload. */
      try { markStale_(TABS.map(t => t.id)); repaint(true); } catch (e) {}
    });
}
on('rule-set', el => {
  const id = el.getAttribute('data-rule'), to = el.getAttribute('data-to'), r = RULE_OF_(id);
  if (!r || r.lock || (to === 'universal') === !ruleOn_(id)) return;
  rulesSend_({ rule: id, to: to }, el);
});
on('rules-undo', el => rulesSend_({ undo: true }, el));
