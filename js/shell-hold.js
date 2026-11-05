
async function checkBuild_() {
  /* NOT ON EVERY GLANCE. Switching apps twice in a minute is not two deploys, and a HEAD per
     switch is a request nobody asked for on somebody's data. */
  if (Date.now() - BUILD_ASKED < 30000) return;
  BUILD_ASKED = Date.now();
  const now = await buildTag_();
  if (!now || !BUILD_TAG || now === BUILD_TAG) return;
  if (buildMayReload_(now) && buildMark_(now)) {
    location.reload();
    return;
  }
  BUILD_WAITING = now;
}

/* ---------- AND ON A HOME SCREEN, IT LOADS ITSELF § */
function buildMayReload_(tag, booted) {
  /* 1. NOT TWICE FOR ONE BUILD. */
  try { if (sessionStorage.getItem('familyBuiltFor') === tag) return false; } catch (e) { return false; }
  /* 2. A RESUME, NOT A GLANCE. § */
  if (booted) {
    if (LOADED && !(typeof performance !== 'undefined' && performance.now() < EARLY_AFTER)) return false;
  } else if (!BUILD_HID || Date.now() - BUILD_HID < AWAY_AGAIN) return false;
  /* 3. NOTHING TYPED AND UNSAVED. § */
  const typed = [].slice.call(document.querySelectorAll('textarea, input[type="text"], input:not([type])'))
    .filter(el => String(el.value || '').trim())
    .filter(el => el.getAttribute('data-do') !== 'qp-ans' && el.getAttribute('data-do') !== 'qp-multi' && el.id !== 'notepad' && !el.hasAttribute('data-draft'));
  /* 4. NOTHING THE STORE REFUSED — that is in this page and nowhere else, and a reload is the loss
        (`keepAtRisk_`, data.js; 317). */
  if (typeof keepAtRisk_ === 'function' && keepAtRisk_().length) return false;
  return !typed.length;
}

/* A NEWER BUILD IS NEVER ASKED ABOUT (610). It loads at a safe moment (970): nothing focused, no keypad, no fresh touch, nothing refused, every hand-changed box one js/resume.js brings back. */
let BUILD_WAITING = null, BUILD_TOUCH = 0;
function buildQuietly_() {
  const tag = BUILD_WAITING, a = document.activeElement;
  if (!tag) return;
  try { if (sessionStorage.getItem('familyBuiltFor') === tag) { BUILD_WAITING = null; return; } } catch (e) { return; }
  if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable) || document.documentElement.classList.contains('kp-up') || Date.now() - BUILD_TOUCH < 1500) return;
  const typed = [].slice.call(document.querySelectorAll('textarea, input[type="text"], input[type="password"], input:not([type])')).filter(el => String(el.value || '').trim() && el.value !== el.defaultValue
    && (/^password$/i.test(el.type) || !(el.hasAttribute('data-draft') || /^notepad$/.test(el.id) || /^qp-(ans|multi)$/.test(el.getAttribute('data-do') || ''))));
  if (typed.length || typeof keepAtRisk_ === 'function' && keepAtRisk_().length) return;
  if (buildMark_(tag)) location.reload();
}

/* ---------- THE MARK THAT STOPS A SECOND RELOAD, WRITTEN AND READ BACK BEFORE THE FIRST § */
function buildMark_(tag) {
  try {
    sessionStorage.setItem('familyBuiltFor', tag);
    return sessionStorage.getItem('familyBuiltFor') === tag;
  } catch (e) { return false; }
}

/* A PAGE THAT OPENS OLDER THAN THE SITE IT CAME FROM REFRESHES ITSELF, ONCE. § */
function bootStale_() {
  const mine = typeof window.LOAD_AT === 'number' ? window.LOAD_AT : 0;
  if (!mine || !BUILD_AT || BUILD_AT - mine < 60000) return;
  if (buildMayReload_(BUILD_TAG, true) && buildMark_(BUILD_TAG)) {
    location.reload();
    return;
  }
  BUILD_WAITING = BUILD_TAG;
}

/* ---------- NOTHING MAY BE HELD — AND THEN SOMETHING DELIBERATELY WAS § */
/* ---------- NO FIELD REMEMBERS OR SUGGESTS (383): "every field is trying to fill in suggested memory details … i dont want that on any part". One rule for every box, drawn by any file. */
const QUIET_FIELD = { autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off',
  'data-lpignore': 'true', 'data-1p-ignore': 'true', 'data-form-type': 'other', 'data-bwignore': 'true' };
function quietField_(el) {
  if (!el || !el.setAttribute || !/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
  Object.keys(QUIET_FIELD).forEach(k => { if (el.getAttribute(k) !== QUIET_FIELD[k]) el.setAttribute(k, QUIET_FIELD[k]); });
  /* A PIN BOX: browsers ignore "off" on a password, so it is a one-time code to them. */
  if (String(el.type).toLowerCase() === 'password' || el.id === 'in-pin' || /pin/i.test(el.id || '')) el.setAttribute('autocomplete', 'one-time-code');
  if (el.tagName === 'INPUT' && el.getAttribute('spellcheck') !== 'false') el.setAttribute('spellcheck', 'false');
  if (el.hasAttribute('list')) el.removeAttribute('list');
}
function quietFields_(root) {
  try {
    if (!root) return;
    quietField_(root);
    if (root.querySelectorAll) [].forEach.call(root.querySelectorAll('input,textarea'), quietField_);
  } catch (e) {}
}
try {
  quietFields_(document.documentElement);
  new MutationObserver(ms => ms.forEach(m => [].forEach.call(m.addedNodes || [], quietFields_)))
    .observe(document.documentElement, { childList: true, subtree: true });
} catch (e) {}

/* A DOUBLE TAP ZOOMS NOTHING (466): iPad Safari zoomed whatever the viewport said. Its two clicks reach the dispatcher, which drops the second on the same control (534). */
document.addEventListener('dblclick', e => { try { e.preventDefault(); } catch (err) { oops_(err, 'shell:quietFields_') } }, { passive: false });
