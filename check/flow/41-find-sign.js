/* ---------- SIGNING IN IS FIND'S FIRST STEP (owner, 13 Nov): Guest or a name, then four menus of digits, each a * chip ---------- */
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

check('Find signs in: only the name tag on the keypad, digit menus each a * with its ×, Forgot PIN before the first digit, a wrong PIN shows nothing, the tags stay signed in, and the name\'s × signs out', async () => {
  const GOOD = ['2', '4', '6', '8'].join(''), BAD = ['1', '3', '5', '7'].join('');
  const { w, sent } = boot({ reply: b => (b.action === 'verifyLogin' && b.probe ? { success: false, probe: true, known: b.email === 'momember' }
    : b.action === 'verifyLogin'
    ? (b.pin === GOOD ? Object.assign({ success: true }, MEMBER_) : { success: false, why: 'wrong-pin', error: 'Wrong PIN for that handle.' })
    : { success: true, messages: [] }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const no = await findSign_(w, null);
  if (no) return [no];
  /* 1. SIGNED OUT: the blank tag and nothing else (owner, 15 Nov: no buttons); no PIN box anywhere; no name in the top bar. */
  const tags = [...d.querySelectorAll('#stuff-groups .sign-who > *')].map(x => x.dataset.do || (x.querySelector('input') ? 'box' : x.tagName));
  if (tags.join(',') !== 'sign-guest,box') bad.push('the first menu signed out holds ' + JSON.stringify(tags) + ', wanted Guest and the name tag');
  if (d.querySelector('#g-btn')) bad.push('the Google sign-in row is still drawn');
  if (!/Username or email/.test((d.getElementById('in-name') || { getAttribute: () => '' }).getAttribute('placeholder') || '')) bad.push('the name tag has no Username or email placeholder');
  if (d.querySelector('#stuff-groups [data-do="sign-join"], #stuff-groups [data-do="forgot-pin"], #stuff-groups [data-do="sign-forgot"]')) bad.push('a button is drawn beside the name tag');
  if (d.getElementById('in-pin') || d.querySelector('[data-do="do-signin"]')) bad.push('the old sign-in form (a PIN box or a Sign in button) is still drawn');
  if (String((d.getElementById('topbar-who') || {}).innerHTML || '').trim()) bad.push('the top bar still holds a tag of its own');
  /* THE SITE'S KEYPAD, NOT THE PHONE'S: no email or numeric keyboard asked for by the box itself (kpBind_ shuts the phone's out on the glass). */
  const nameBox = d.getElementById('in-name');
  if (nameBox && /^(email|numeric|tel)$/.test(nameBox.getAttribute('inputmode') || '')) bad.push('the name tag asks for the phone\'s keyboard');
  /* 2. A NAME, THEN THE DIGITS: Forgot PIN before the first, gone after; each digit a * chip with its own ×, never the digit. */
  const no2 = await findSign_(w, 'momember', '');
  if (no2) return bad.concat([no2]);
  if (!d.querySelector('#stuff-groups [data-do="sign-forgot"]')) bad.push('before the first digit there is no Forgot PIN');
  if (d.querySelector('#stuff-groups [data-do="sign-join-card"]')) bad.push('a known account was offered Make an account');
  t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="1"]'));
  if (d.querySelector('#stuff-groups [data-do="sign-forgot"]')) bad.push('Forgot PIN is still there after a digit was picked');
  t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="3"]'));
  if (dotsNow_(d) !== 2) bad.push('two digits picked made ' + dotsNow_(d) + ' * chips');
  if (chipsNow_(d).filter(c => c.classList.contains('sign-dot') && c.dataset.do === 'sign-dot-drop').length !== 2) bad.push('a * chip has no × of its own');
  if (chipsNow_(d).filter(c => c.classList.contains('sign-dot')).some(c => c.firstChild && String(c.firstChild.textContent).trim() !== '*')) bad.push('a digit tag does not show *');
  /* TAPPING THE TAG ITSELF (not only its ×) takes that digit off: a real click on the tag's face. */
  { const tag = chipsNow_(d).filter(c => c.classList.contains('sign-dot')).pop();
    if (tag) { tag.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await wait(30); }
    if (dotsNow_(d) !== 1) bad.push('a click on a * tag left ' + dotsNow_(d) + ' digit tags, wanted 1');
    t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="3"]')); }
  if (/\d/.test(chipsNow_(d).map(c => c.textContent).join(''))) bad.push('a chip says a digit: ' + JSON.stringify(chipsNow_(d).map(c => c.textContent)));
  if (!/momember/.test((chipsNow_(d)[0] || {}).textContent || '')) bad.push('the name is not the first chip while the PIN is asked');
  /* 3. A WRONG PIN: one call, NOTHING shown and nothing cleared — no toast, no menu, the four * still there. */
  sent.length = 0;
  const toastWas = toastOf_(d);
  BAD.slice(2).split('').forEach(c => t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
  await wait(300);
  const asks = sent.filter(b => b.action === 'verifyLogin' && !b.probe);
  if (asks.length !== 1 || asks[0].pin !== BAD || asks[0].email !== 'momember') bad.push('the fourth digit sent ' + asks.length + ' verifyLogin call(s), not one with the name and the four digits');
  if (t.whoami()) bad.push('a wrong PIN signed somebody in');
  if (dotsNow_(d) !== 4) bad.push('after a wrong PIN ' + dotsNow_(d) + ' * chips are left, wanted the four');
  if (/Wrong PIN/.test(toastOf_(d)) && toastOf_(d) !== toastWas) bad.push('a wrong PIN said something: ' + JSON.stringify(toastOf_(d)));
  if (d.querySelector('#stuff-groups [data-do="sign-digit"], #stuff-groups [data-do="sign-forgot"]')) bad.push('after a wrong PIN a menu is still offered');
  /* 4. THE * TAGS COME OFF ONE BY ONE, then the right digits. */
  for (let n = 0; n < 4; n++) t.ACTIONS['sign-dot-drop'](chipsNow_(d).filter(c => c.classList.contains('sign-dot')).pop());
  if (dotsNow_(d) !== 0 || !d.querySelector('#stuff-groups [data-do="sign-digit"]')) bad.push('taking the four * off did not ask the digits again');
  GOOD.split('').forEach(c => t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
  for (let n = 0; n < 30 && !t.whoami(); n++) await wait(50);
  if ((t.whoami() || {}).personId !== MEMBER_.personId) return bad.concat(['the right PIN did not sign in: ' + JSON.stringify(t.whoami())]);
  w.paintFinder_('stuff');
  /* 5. SIGNED IN: the name chip first (its × signs out), the four * kept, no "Signed in as", the ordinary menus. */
  const first = chipsNow_(d)[0];
  if (!first || first.dataset.do !== 'signout' || !/momember/.test(first.textContent)) bad.push('signed in, the first chip is ' + JSON.stringify(first && first.outerHTML.slice(0, 120)));
  if (dotsNow_(d) !== 4) bad.push('signed in, ' + dotsNow_(d) + ' * chips stayed, wanted the four');
  if (/Signed in as/.test(toastOf_(d))) bad.push('the toast still says ' + JSON.stringify(toastOf_(d)));
  if (!d.querySelector('#stuff-groups [data-do="facet-pick"]')) bad.push('signed in, no ordinary Find menu followed');
  /* THE DIGITS ARE NOWHERE BUT THE ONE CALL: not the URL, history, storage or the page. */
  const kept = [w.location.href, JSON.stringify(w.history.state), d.body.innerHTML];
  for (let i = 0; i < w.localStorage.length; i++) kept.push(w.localStorage.getItem(w.localStorage.key(i)));
  for (let i = 0; i < w.sessionStorage.length; i++) kept.push(w.sessionStorage.getItem(w.sessionStorage.key(i)));
  if (kept.some(s => s && (s.indexOf(GOOD) !== -1 || s.indexOf(BAD) !== -1))) bad.push('a PIN was kept in the URL, history, storage or the page');
  /* 6. THE NAME CHIP'S × SIGNS OUT, back to step one. */
  t.ACTIONS.signout(first);
  await wait(50);
  if (t.whoami()) bad.push('the name chip\'s × did not sign out');
  if (!sent.some(b => b.action === 'signOut')) bad.push('the name chip\'s × did not end the session on the server');
  w.paintFinder_('stuff');
  if (!d.getElementById('in-name') || dotsNow_(d)) bad.push('after signing out Find does not ask for a name again');
  return bad;
});

check('Find\'s PIN step: Forgot PIN is one card whose one button emails the reset link; a name with no account offers Make an account, one card', async () => {
  const { w, sent } = boot({ reply: b => (b.action === 'verifyLogin' && b.probe ? { success: false, probe: true, known: false }
    : b.action === 'forgotPin' ? { success: true, message: 'A link is on its way.' } : { success: true, messages: [] }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const no = await findSign_(w, 'newkid@example.org', '');
  if (no) return [no];
  await wait(50);
  t.ACTIONS['sign-forgot'](d.querySelector('#stuff-groups [data-do="sign-forgot"]'));
  const cards = d.querySelectorAll('#stuff-groups .card');
  const btns = d.querySelectorAll('#stuff-groups [data-do="forgot-pin"]');
  if (cards.length !== 1 || btns.length !== 1) bad.push('Forgot PIN drew ' + cards.length + ' card(s) and ' + btns.length + ' button(s), wanted one and one');
  sent.length = 0;
  if (btns[0]) t.ACTIONS['forgot-pin'](btns[0]);
  await wait(100);
  const ask = sent.find(b => b.action === 'forgotPin');
  if (!ask || ask.who !== 'newkid@example.org') bad.push('the button did not ask forgotPin for the typed address: ' + JSON.stringify(ask));
  t.ACTIONS['sign-card-off'](d.createElement('button'));
  if (!d.querySelector('#stuff-groups [data-do="sign-join-card"]')) bad.push('a name with no account is not offered Make an account');
  t.ACTIONS['sign-join-card'](d.querySelector('#stuff-groups [data-do="sign-join-card"]'));
  const jc = d.querySelectorAll('#stuff-groups .card');
  if (jc.length !== 1 || !d.querySelector('#stuff-groups [data-sj="first"]') || !d.querySelector('#stuff-groups [data-do="sign-join-send"]')) bad.push('Make an account is not one card with its form and its send');
  if ((d.querySelector('#stuff-groups [data-sj="email"]') || {}).value !== 'newkid@example.org') bad.push('the typed email is not in the Make an account card');
  return bad;
});
