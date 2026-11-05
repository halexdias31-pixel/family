/* @family. — resume.js A NEW BUILD ARRIVES WITHOUT DISTURBING ANYONE (970): heard of on focus and every few minutes, loaded at a quiet moment */
/* by `buildQuietly_` (shell.js), and the page comes back where it was: tab, page, scroll, answer boxes, form drafts. docs/history/970. */

/* HOW OFTEN A NEW BUILD IS ASKED FOR, AND HOW LONG UNTOUCHED BEFORE IT LOADS; a check may shorten the second with `window.BUILD_IDLE_MS`. */
const RESUME_POLL = 4 * 60 * 1000;
const RESUME_IDLE = (typeof window.BUILD_IDLE_MS === 'number' && window.BUILD_IDLE_MS) || 45000;
const RESUME_KEY = 'familyResume';
BUILD_TOUCH = Date.now();
['pointerdown', 'pointermove', 'keydown', 'input', 'touchstart', 'wheel'].forEach(ev =>
  document.addEventListener(ev, () => { BUILD_TOUCH = Date.now(); }, { passive: true, capture: true }));

/* A TAB LEFT OPEN ALL DAY STILL HEARS OF A DEPLOY: one HEAD on focus and every few minutes; a hidden page takes it at once. */
function resumeAsk_(force) {
  try {
    if (force) BUILD_ASKED = 0;
    Promise.resolve(checkBuild_()).then(() => { if (document.hidden) buildQuietly_(); }, () => null);
  } catch (e) { oops_(e, 'resume') }
}
window.addEventListener('focus', () => resumeAsk_(false));
setInterval(() => { if (!document.hidden) resumeAsk_(true); }, RESUME_POLL);
setInterval(() => {
  try { if (BUILD_WAITING && !document.hidden && Date.now() - BUILD_TOUCH > RESUME_IDLE) buildQuietly_(); } catch (e) { oops_(e, 'resume') }
}, Math.min(RESUME_IDLE, 15000));

/* ---------- THE NOTE: written as the page goes, only when this page set a new build's mark — i.e. the reload is the update's own § */
let RESUME_MARK = null;
try { RESUME_MARK = sessionStorage.getItem('familyBuiltFor'); } catch (e) { oops_(e, 'resume') }
window.addEventListener('pagehide', () => {
  try { if (sessionStorage.getItem('familyBuiltFor') !== RESUME_MARK) resumeKeep_(); } catch (e) { oops_(e, 'resume') }
});
function resumeKeep_() {
  if (typeof findPlaceKeep_ === 'function') findPlaceKeep_();
  const ans = {}, drafts = {}, scr = document.getElementById('s-' + AT);
  document.querySelectorAll('[data-do="qp-ans"][data-k], [data-do="qp-multi"][data-k]').forEach(el => {
    if (String(el.value || '')) ans[el.getAttribute('data-k') + (el.hasAttribute('data-n') ? '#' + el.getAttribute('data-n') : '')] = String(el.value).slice(0, 4000);
  });
  /* NEVER A PIN: password boxes and anything named pin stay out of the note. */
  document.querySelectorAll('[data-draft]').forEach(el => {
    if (/^(password|file|hidden)$/i.test(el.type || '') || /pin/i.test(el.id || '')) return;
    drafts[el.getAttribute('data-draft')] = String(el.type).toLowerCase() === 'checkbox' ? (el.checked ? '1' : '0') : String(el.value || '').slice(0, 4000);
  });
  sessionStorage.setItem(RESUME_KEY, JSON.stringify({ at: Date.now(), tab: AT, y: window.scrollY || 0,
    sy: scr ? scr.scrollTop : 0, page: typeof PAGE !== 'undefined' ? PAGE[AT] || 0 : 0, ans, drafts }));
}

/* ---------- AND READ BACK ONCE THE PAYLOAD HAS LANDED, retried while the card draws; any failure is a normal load § */
function resumeBack_() {
  let r = null;
  try { r = JSON.parse(sessionStorage.getItem(RESUME_KEY) || 'null'); sessionStorage.removeItem(RESUME_KEY); } catch (e) { return; }
  if (!r || typeof r !== 'object' || !(Date.now() - (Number(r.at) || 0) < 120000)) return;
  let wait = 0, tries = 0, scrolled = false;
  /* ONLY AN EMPTY BOX IS FILLED: whatever the page already drew from its own store wins. */
  const fill = (el, v) => {
    if (String(el.value || '')) return;
    el.value = v;
    if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const find = (sel, ok) => [].slice.call(document.querySelectorAll(sel)).find(ok);
  const step = () => {
    try {
      if (!LOADED) { if (++wait < 240) setTimeout(step, 250); return; }
      if (!tries && r.tab && AT !== r.tab) go(r.tab, false, true);
      if (!tries && r.page && !PAGE[AT] && typeof goPage === 'function') goPage(AT, r.page, true);
      let left = 0;
      Object.keys(r.ans || {}).forEach(k => {
        const at = k.lastIndexOf('#'), key = at > 0 ? k.slice(0, at) : k, n = at > 0 ? k.slice(at + 1) : null;
        const el = find('[data-k]', e => e.getAttribute('data-k') === key && /^qp-(ans|multi)$/.test(e.getAttribute('data-do') || '') && (n === null || e.getAttribute('data-n') === n));
        if (el) fill(el, String(r.ans[k])); else left++;
      });
      Object.keys(r.drafts || {}).forEach(spec => {
        const el = find('[data-draft]', e => e.getAttribute('data-draft') === spec);
        if (!el) { left++; return; }
        if (String(el.type).toLowerCase() !== 'checkbox') return fill(el, String(r.drafts[spec]));
        if (el.checked !== (r.drafts[spec] === '1')) { el.checked = r.drafts[spec] === '1'; el.dispatchEvent(new Event('change', { bubbles: true })); }
      });
      if (!scrolled && tries > 3) {
        scrolled = true;
        const scr = document.getElementById('s-' + AT);
        if (scr && r.sy) scr.scrollTop = r.sy;
        if (r.y) window.scrollTo(0, r.y);
      }
      if ((left || !scrolled) && ++tries < 40) setTimeout(step, 250);
    } catch (e) { oops_(e, 'resume') }
  };
  step();
}
try { resumeBack_(); } catch (e) { oops_(e, 'resume') }
