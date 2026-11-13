/* ---------- SIGNING IN IS FIND'S FIRST STEP (owner, 13 Nov): Guest or a name, then four menus of digits, each a ● chip ---------- */
/* THE WAY IN FOR EVERY JOURNEY: the name in Find's blank tag and Enter, then a digit tag per number. '' when done, else what was missing. */
async function findSign_(w, who, pin) {
  const t = w.__t, d = w.document;
  if (t.whoami()) return 'somebody is still signed in';
  t.go('stuff', false, true);
  if (!d.querySelector('#stuff-groups .sign-who')) {
    try { t.ACTIONS['sign-restart'](d.createElement('button')); } catch (e) { return 'sign-restart threw: ' + e.message; }
  }
  try { w.paintFinder_('stuff'); } catch (e) { return 'Find did not paint: ' + e.message; }
  await wait(30);
  const box = d.getElementById('in-name');
  if (!box) return 'Find has no name tag to type in';
  if (who == null) return '';
  box.value = who;
  box.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await wait(30);
  for (const c of String(pin || '')) {
    const b = d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]');
    if (!b) return 'Find has no digit tags after the name';
    t.ACTIONS['sign-digit'](b);
  }
  return '';
}
const chipsNow_ = d => [...d.querySelectorAll('#stuff-chips .chip')];
const dotsNow_ = d => chipsNow_(d).filter(c => c.classList.contains('sign-dot')).length;

check('Find signs in: Guest, a name and four digit menus each a ● chip, a wrong PIN cleared, the name chip first, and its × signs out', async () => {
  const GOOD = ['2', '4', '6', '8'].join(''), BAD = ['1', '3', '5', '7'].join('');
  const { w, sent } = boot({ reply: b => (b.action === 'verifyLogin'
    ? (b.pin === GOOD ? Object.assign({ success: true }, MEMBER_) : { success: false, why: 'wrong-pin', error: 'Wrong PIN for that handle.' })
    : { success: true, messages: [] }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const no = await findSign_(w, null);
  if (no) return [no];
  /* 1. SIGNED OUT: Guest, the blank tag, Make an account and Forgot PIN, all on show; no PIN box anywhere; no name in the top bar. */
  const tags = [...d.querySelectorAll('#stuff-groups .sign-who > *')].map(x => x.dataset.do || (x.querySelector('input') ? 'box' : x.tagName));
  if (tags.join(',') !== 'sign-guest,box,sign-join,forgot-pin') bad.push('the first menu signed out holds ' + JSON.stringify(tags) + ', wanted Guest, the name tag, Make an account, Forgot PIN');
  if (d.getElementById('in-pin') || d.querySelector('[data-do="do-signin"]')) bad.push('the old sign-in form (a PIN box or a Sign in button) is still drawn');
  if (String((d.getElementById('topbar-who') || {}).innerHTML || '').trim()) bad.push('the top bar still holds a tag of its own');
  /* 2. GUEST: the first chip, and the ordinary menus follow. */
  t.ACTIONS['sign-guest'](d.querySelector('[data-do="sign-guest"]'));
  await wait(30);
  if ((chipsNow_(d)[0] || {}).textContent !== 'Guest') bad.push('after Guest the first chip says ' + JSON.stringify((chipsNow_(d)[0] || {}).textContent));
  if (!d.querySelector('#stuff-groups [data-do="facet-pick"]')) bad.push('after Guest no ordinary Find menu followed');
  /* 3. A NAME, THEN THE DIGITS: each a ● chip, never the digit. */
  const no2 = await findSign_(w, 'momember', BAD.slice(0, 2));
  if (no2) return bad.concat([no2]);
  if (dotsNow_(d) !== 2) bad.push('two digits picked made ' + dotsNow_(d) + ' ● chips');
  if (/\d/.test(chipsNow_(d).map(c => c.textContent).join(''))) bad.push('a chip says a digit: ' + JSON.stringify(chipsNow_(d).map(c => c.textContent)));
  if (!/momember/.test((chipsNow_(d)[0] || {}).textContent || '')) bad.push('the name is not the first chip while the PIN is asked');
  /* 4. A WRONG PIN: one call, the dots cleared, the server's words in a toast, the digit menu again. */
  sent.length = 0;
  BAD.slice(2).split('').forEach(c => t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
  await wait(300);
  const asks = sent.filter(b => b.action === 'verifyLogin');
  if (asks.length !== 1 || asks[0].pin !== BAD || asks[0].email !== 'momember') bad.push('the fourth digit sent ' + asks.length + ' verifyLogin call(s), not one with the name and the four digits');
  if (t.whoami()) bad.push('a wrong PIN signed somebody in');
  if (dotsNow_(d)) bad.push('after a wrong PIN ' + dotsNow_(d) + ' ● chips are still there');
  if (!/Wrong PIN/.test(toastOf_(d))) bad.push('after a wrong PIN the toast says ' + JSON.stringify(toastOf_(d)));
  if (!d.querySelector('#stuff-groups [data-do="sign-digit"]')) bad.push('after a wrong PIN the digit menu is not asked again');
  /* 5. THE RIGHT ONE: in, one name chip first, the ordinary menus. */
  GOOD.split('').forEach(c => t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
  for (let n = 0; n < 30 && !t.whoami(); n++) await wait(50);
  if ((t.whoami() || {}).personId !== MEMBER_.personId) return bad.concat(['the right PIN did not sign in: ' + JSON.stringify(t.whoami())]);
  w.paintFinder_('stuff');
  const first = chipsNow_(d)[0];
  if (!first || first.dataset.do !== 'signout' || !/Mo Member/.test(first.textContent)) bad.push('signed in, the first chip is ' + JSON.stringify(first && first.outerHTML.slice(0, 120)));
  if (dotsNow_(d)) bad.push('signed in, ● chips are still there');
  if (!d.querySelector('#stuff-groups [data-do="facet-pick"]')) bad.push('signed in, no ordinary Find menu followed');
  /* THE DIGITS ARE NOWHERE BUT THE ONE CALL: not the URL, history or storage. */
  const kept = [w.location.href, JSON.stringify(w.history.state)];
  for (let i = 0; i < w.localStorage.length; i++) kept.push(w.localStorage.getItem(w.localStorage.key(i)));
  for (let i = 0; i < w.sessionStorage.length; i++) kept.push(w.sessionStorage.getItem(w.sessionStorage.key(i)));
  if (kept.some(s => s && (s.indexOf(GOOD) !== -1 || s.indexOf(BAD) !== -1))) bad.push('a PIN was kept in the URL, history or storage');
  /* 6. THE NAME CHIP'S × SIGNS OUT, back to step one. */
  t.ACTIONS.signout(first);
  await wait(50);
  if (t.whoami()) bad.push('the name chip\'s × did not sign out');
  if (!sent.some(b => b.action === 'signOut')) bad.push('the name chip\'s × did not end the session on the server');
  w.paintFinder_('stuff');
  if (!d.querySelector('#stuff-groups .sign-who [data-do="sign-guest"]')) bad.push('after signing out Find does not ask Guest or a name again');
  return bad;
});
