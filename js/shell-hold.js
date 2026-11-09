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
  } catch (e) { /* a field that cannot be quietened behaves as the browser's own */ }
}
try {
  quietFields_(document.documentElement);
  new MutationObserver(ms => ms.forEach(m => [].forEach.call(m.addedNodes || [], quietFields_)))
    .observe(document.documentElement, { childList: true, subtree: true });
} catch (e) { /* no MutationObserver: new fields keep the browser's own behaviour */ }

/* A DOUBLE TAP ZOOMS NOTHING (466): iPad Safari zoomed whatever the viewport said. Its two clicks reach the dispatcher, which drops the second on the same control (534). */
document.addEventListener('dblclick', e => { try { e.preventDefault(); } catch (err) { oops_(err, 'shell:quietFields_') } }, { passive: false });
