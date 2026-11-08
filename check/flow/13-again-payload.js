check('a payload that timed out is asked for again at once, under a quiet line, and the screen fills in', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const b = flaky_(['timeout', gate]);
  await wait(400);
  const bad = [];
  if (b.asked.length !== 2) bad.push('after a timeout the payload was asked for ' + b.asked.length + ' time(s), not twice — a timeout is asked again straight away');
  if (b.line() !== 'Reconnecting…') bad.push('while it asks again the quiet line says "' + b.line() + '", not "Reconnecting…"');
  if (b.bannerUp()) bad.push('a signed-out visitor was shown the banner: ' + b.bannerText().slice(0, 120));
  if (b.arrived()) bad.push('the payload is in DATA before the retry was let through, so this journey proves nothing');
  const before = b.w.document.body.innerHTML.indexOf('Drawn from the payload') !== -1;
  open();
  await wait(500);
  if (!b.arrived()) bad.push('the retry answered and the payload is not in DATA');
  if (b.line()) bad.push('the retry succeeded and the quiet line still says "' + b.line() + '"');
  if (b.bannerUp()) bad.push('the retry succeeded and a banner is up: ' + b.bannerText().slice(0, 120));
  /* DRAWN, not only held: a post only the payload knows is on Feed once it is reached — Find is home (1070), so Feed is drawn on arrival there. */
  try { b.w.__t.go('feed'); } catch (e) { bad.push('Feed could not be reached: ' + e.message); }
  await wait(300);
  const after = b.w.document.body.innerHTML.indexOf('Drawn from the payload') !== -1;
  if (before) bad.push('a post only the payload sends was on the page before it arrived — pick another witness');
  else if (!after) bad.push('the payload arrived and nothing it carries was drawn — the success path did not repaint');
  if (b.asked.length !== 2) bad.push('a success did not stop the asking: ' + b.asked.length + ' requests');
  return bad;
});

check('no connection: a student is asked for again a few seconds later, and never shown the banner', async () => {
  const b = flaky_(['fetch'], RC_KID_);
  await wait(400);
  const bad = [];
  if (b.asked.length !== 1) bad.push('a fast failure was asked again at once (' + b.asked.length + ' requests) — it waits a few seconds');
  if (b.line() !== 'Reconnecting…') bad.push('after "Failed to fetch" the quiet line says "' + b.line() + '"');
  if (b.bannerUp()) bad.push('a student was shown the banner: ' + b.bannerText().slice(0, 120));
  if (/script\.google\.com/.test(b.w.document.body.textContent)) bad.push('the backend\'s address is on the page for a student');
  await wait(3400);
  if (b.asked.length !== 2) bad.push('three seconds after a fast failure the payload had been asked for ' + b.asked.length + ' time(s), not twice');
  if (!b.arrived()) bad.push('the second ask answered and the payload is not in DATA');
  if (b.line()) bad.push('the second ask succeeded and the quiet line still says "' + b.line() + '"');
  if (b.bannerUp()) bad.push('the second ask succeeded and a banner is up');
  return bad;
});

check('the browser saying it is online again asks at once, one request at a time', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const b = flaky_(['fetch', gate]);
  await wait(300);
  const bad = [];
  if (b.asked.length !== 1) return ['the first failure was asked again before `online` (' + b.asked.length + ' requests), so `online` cannot be measured'];
  b.w.dispatchEvent(new b.w.Event('online'));
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2) bad.push('`online` twice made ' + (b.asked.length - 1) + ' request(s) — wanted one at once, and no second while it is in the air');
  open();
  await wait(400);
  if (!b.arrived()) bad.push('the ask `online` made answered and the payload is not in DATA');
  if (b.line()) bad.push('the quiet line outlived the success: "' + b.line() + '"');
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2) bad.push('`online` after a success asked again — nothing was failing');
  return bad;
});

check('a web page instead of data: an admin is shown the diagnostic, a student only the quiet line', async () => {
  const bad = [];
  const a = flaky_(() => 'html', RC_ADMIN_);
  const k = flaky_(() => 'html', RC_KID_);
  await wait(400);
  if (!a.bannerUp()) bad.push('an admin given Apps Script\'s error page was not shown the banner');
  else {
    if (!/Authorization is required/.test(a.bannerText())) bad.push('the admin\'s banner lost its advice: ' + a.bannerText().slice(0, 160));
    if (!/Still trying by itself/.test(a.bannerText())) bad.push('the admin\'s banner does not say the app is still asking');
  }
  if (a.line()) bad.push('the quiet line speaks under the admin\'s banner: "' + a.line() + '"');
  if (k.bannerUp()) bad.push('a student was shown the diagnostic: ' + k.bannerText().slice(0, 120));
  if (k.line() !== 'Reconnecting…') bad.push('a student\'s quiet line says "' + k.line() + '"');
  return bad;
});

check('after two minutes of failures a student reads one plain sentence, never the address; an admin the banner', async () => {
  const bad = [];
  const k = flaky_(() => 'fetch', RC_KID_);
  const a = flaky_(() => 'fetch', RC_ADMIN_);
  const slow = flaky_(() => 'timeout', RC_ADMIN_);
  await wait(400);
  if (k.line() !== 'Reconnecting…') bad.push('before two minutes the student\'s line says "' + k.line() + '"');
  if (a.bannerUp()) bad.push('an admin was shown the banner for a plain lost connection before two minutes had passed');
  if (slow.bannerUp()) bad.push('an admin was shown the banner for a timeout before two minutes had passed');
  /* TWO MINUTES ON, by the app's own clock — `Date` is this window's, so only the app moves. */
  const moved = Date.now() + 125000 - 50;
  [k, a, slow].forEach(b => { const was = b.w.Date.now.bind(b.w.Date); b.w.Date.now = () => was() + 125000;
                        b.w.dispatchEvent(new b.w.Event('online')); });
  await wait(300);
  /* ASKED AFTER THE CLOCK MOVED, read off the request's own `_=` stamp rather than counted: § */
  if (!k.asked.some(u => +(String(u).split('_=')[1] || 0) >= moved)) bad.push('the student\'s `online` made no request after the clock moved, so the two-minute failure was not measured');
  if (k.line() !== RC_LATE_) bad.push('after two minutes the student\'s line says "' + k.line() + '", not "' + RC_LATE_ + '"');
  if (k.bannerUp()) bad.push('after two minutes a student was shown the banner');
  if (/script\.google\.com/.test(k.w.document.body.textContent)) bad.push('after two minutes the backend\'s address is on a student\'s page');
  if (!a.bannerUp()) bad.push('after two minutes of failures an admin was still not shown the diagnostic');
  else if (!/Manage deployments/.test(a.bannerText())) bad.push('the admin\'s two-minute banner is not the "Failed to fetch" advice: ' + a.bannerText().slice(0, 160));
  /* AND A TIMEOUT HAS ADVICE OF ITS OWN — the screenshot's "timeout" sat over "Something else went wrong". */
  if (!slow.bannerUp()) bad.push('after two minutes of timeouts an admin was not shown the diagnostic');
  else if (!/longer than a minute/.test(slow.bannerText())) bad.push('two minutes of timeouts are still "something else": ' + slow.bannerText().slice(0, 160));
  return bad;
});

/* A REFUSAL IS ASKED AGAIN — but slowly. § */
check('a refusal is asked again on the slow rung, mends when the server does, and only an admin is told what it said', async () => {
  const bad = [];
  const k = flaky_(n => (n === 0 ? 'refuse' : undefined), RC_KID_);
  const a = flaky_(n => (n === 0 ? 'refuse' : undefined), RC_ADMIN_);
  await wait(3600);
  if (k.asked.length !== 1) bad.push('a refusal was asked again within seconds (' + k.asked.length + ' requests) — it waits on the two-minute rung');
  if (k.line() !== 'Reconnecting…') bad.push('after a refusal a student\'s quiet line says "' + k.line() + '" — the app is still asking, and says so');
  if (k.bannerUp()) bad.push('a student was shown the server\'s refusal in the banner');
  if (/No people \(expected/.test(k.w.document.body.textContent)) bad.push('the server\'s refusal is written on a student\'s page');
  if (!a.bannerUp() || !/The server said/.test(a.bannerText())) bad.push('an admin was not told what the server said');
  [k, a].forEach(b => b.w.dispatchEvent(new b.w.Event('online')));
  await wait(500);
  if (k.asked.length !== 2) bad.push('after a refusal the app had stopped asking — `online` made ' + (k.asked.length - 1) + ' request(s)');
  if (!k.arrived()) bad.push('the server answered the next ask and the payload is not in DATA');
  if (k.line()) bad.push('the server answered and the quiet line still says "' + k.line() + '"');
  if (a.bannerUp()) bad.push('the server answered and the admin\'s banner is still up: ' + a.bannerText().slice(0, 120));
  return bad;
});

/* A RETRY IS THE ONLY REQUEST THIS APP EVER LEAVES IN THE AIR ON ITS OWN, so it is the one that can be overtaken: § */
check('a retry overtaken by a sign-in does not paint the stranger\'s payload over the one just asked for', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const mine = Object.assign(RC_PAYLOAD_(), { version: 'signed-in' });
  const theirs = Object.assign(RC_PAYLOAD_(), { version: 'stranger' });
  const b = flaky_(n => n === 0 ? 'fetch' : n === 1 ? gate.then(() => ({ body: theirs })) : { body: mine });
  await wait(300);
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2) return ['`online` did not send the retry (' + b.asked.length + ' requests), so the race was not run'];
  b.w.__t.USER(RC_KID_);
  b.w.load();
  await wait(400);
  const bad = [];
  if (b.asked.length !== 3) bad.push('the sign-in\'s load was not sent beside the retry (' + b.asked.length + ' requests)');
  if ((b.w.__t.DATA() || {}).version !== 'signed-in') bad.push('the sign-in\'s payload did not land: ' + (b.w.__t.DATA() || {}).version);
  open();
  await wait(400);
  if ((b.w.__t.DATA() || {}).version !== 'signed-in')
    bad.push('the retry asked as nobody landed after the sign-in and replaced its payload — DATA is "' + (b.w.__t.DATA() || {}).version + '"');
  if (b.line()) bad.push('the quiet line came back after a good payload: "' + b.line() + '"');
  return bad;
});

/* ---------- A REPLY IS CHECKED AGAINST WHOM IT WAS ASKED FOR, AND AN ASK THAT WAITED IS NOT LOST § */
check('a retry in the air when an admin signs out does not put their payload on the signed-out phone', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const theirs = Object.assign(RC_PAYLOAD_(), { version: 'admin-payload', viewerIsAdmin: true,
    films: [{ title: 'Held Film', link: 'https://drive.example/held' }] });
  const b = flaky_(n => (n === 0 ? 'fetch' : n === 1 ? gate.then(() => ({ body: theirs })) : undefined), RC_ADMIN_);
  await wait(300);
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2 || !/token=tk-admin/.test(b.asked[1] || ''))
    return ['the retry did not go out as the admin (' + b.asked.length + ' requests), so the race was not run'];
  b.w.__t.ACTIONS.signout();
  await wait(100);
  if (b.w.__t.whoami()) return ['Sign out left somebody signed in, so the race was not run'];
  open();
  await wait(500);
  const bad = [];
  const D = b.w.__t.DATA() || {};
  if (D.version === 'admin-payload' || D.viewerIsAdmin) bad.push('the admin\'s retry landed after they signed out and its payload is on the signed-out phone');
  if (JSON.stringify(D.films || []).indexOf('Held Film') !== -1) bad.push('the admin\'s films are in DATA on the signed-out phone');
  /* AND THE VISITOR IS ASKED FOR — nothing else would ask, because signing out calls no `load()`. */
  if (b.asked.length !== 3) bad.push('after the admin\'s reply was dropped the visitor was not asked for (' + b.asked.length + ' requests)');
  else if (/token=/.test(b.asked[2])) bad.push('the ask after the sign-out still carried a token');
  if (!b.arrived()) bad.push('the visitor\'s own payload did not arrive');
  if (b.line()) bad.push('the quiet line outlived the visitor\'s payload: "' + b.line() + '"');
  return bad;
});

/* AND THE SAME, WHEN THE REPLY HAS ARRIVED AND IS WAITING FOR THE LIBRARY. § */
/* SINCE 670 THE PAYLOAD DOES NOT WAIT for the question file: it is drawn, and the library merged after. What must hold: the late library never brings the admin's payload back. */
check('a question file that lands after a sign-out changes nothing the sign-out left', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const theirs = Object.assign(RC_PAYLOAD_(), { version: 'admin-payload', viewerIsAdmin: true });
  const b = flaky_(n => (n === 0 ? { body: theirs } : undefined), RC_ADMIN_,
    { serve: url => (/data\/questions\.json/.test(url) ? gate.then(() => []) : undefined) });
  await wait(300);
  if (b.asked.length !== 1 || !/token=tk-admin/.test(b.asked[0] || '')) return ['the payload was not asked for as the admin (' + b.asked.length + ' requests), so the race was not run'];
  if ((b.w.__t.DATA() || {}).version !== 'admin-payload') return ['the admin\'s payload was not drawn before the question file (670), so the race was not run'];
  b.w.__t.ACTIONS.signout();
  await wait(300);
  if (b.w.__t.whoami()) return ['Sign out left somebody signed in, so the race was not run'];
  const was = b.w.__t.DATA(), asked = b.asked.length;
  open();
  await wait(600);
  const bad = [];
  const D = b.w.__t.DATA() || {};
  if (D.version !== (was || {}).version) bad.push('the late question file swapped the payload: ' + (was || {}).version + ' became ' + D.version);
  if (b.asked.length !== asked) bad.push('the late question file asked the backend again (' + asked + ' then ' + b.asked.length + ' requests)');
  if (b.w.__t.whoami()) bad.push('somebody is signed in again after the question file landed');
  if (!Array.isArray(D.questions)) bad.push('DATA.questions is not a list after the question file landed');
  return bad;
});

/* "THE ONE IN THE AIR BOOKS WHAT COMES NEXT" — and it did not, when the one in the air had been overtaken: § */
check('an ask that comes round while an overtaken retry is in the air is made when it lands, not lost', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const b = flaky_(n => (n === 0 ? 'fetch' : n === 1 ? gate.then(() => ({ body: RC_PAYLOAD_() })) : n === 2 ? 'fetch' : undefined));
  await wait(300);
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2) return ['`online` did not send the retry (' + b.asked.length + ' requests), so the race was not run'];
  b.w.__t.USER(RC_KID_);
  b.w.load();
  await wait(3500);
  const bad = [];
  if (b.asked.length !== 3) bad.push('the ask booked by the sign-in\'s failure was made while the retry was in the air (' + b.asked.length + ' requests) — two in the air at once');
  open();
  await wait(500);
  if (b.asked.length !== 4) bad.push('the overtaken retry landed and nothing asked for the person signed in (' + b.asked.length + ' requests)');
  else if (!/token=tk-mo/.test(b.asked[3])) bad.push('the ask after it was not for the person signed in');
  if (!b.arrived()) bad.push('the payload never arrived: the line says "' + b.line() + '" over a backend that is answering');
  if (b.line()) bad.push('the quiet line is still up: "' + b.line() + '"');
  return bad;
});

/* AND THE SAME PERSON'S PAYLOAD IS NOT THROWN AWAY FOR BEING LATE. § */
check('a retry overtaken by Try again from the same person still draws the payload it brings', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const b = flaky_(n => (n === 0 ? 'fetch' : n === 1 ? gate.then(() => ({ body: RC_PAYLOAD_() })) : n === 2 ? 'fetch' : 'fetch'), RC_KID_);
  await wait(300);
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(100);
  if (b.asked.length !== 2) return ['`online` did not send the retry (' + b.asked.length + ' requests), so the race was not run'];
  b.w.load();
  await wait(300);
  open();
  await wait(500);
  const bad = [];
  if (!b.arrived()) bad.push('the retry answered with this person\'s payload and it was thrown away');
  if (b.line()) bad.push('a good payload landed and the quiet line still says "' + b.line() + '"');
  return bad;
});

/* ---------- WHILE IT ASKS, AN EMPTY COLUMN SAYS IT IS WAITING § */
check('while the app asks again, nobody is shown the failure\'s words or a Try again in a column', async () => {
  const bad = [];
  const k = flaky_(() => 'html', RC_KID_);
  const v = flaky_(() => 'timeout');
  await wait(500);
  [['a student', k], ['a visitor', v]].forEach(([who, b]) => {
    const text = b.w.document.body.textContent;
    if (/Couldn.t load/.test(text)) bad.push(who + '\'s columns say "Couldn\'t load" while the app is asking again');
    if (/Authorization is required|timeout/.test(text))
      bad.push(who + ' was shown the failure\'s own words: ' + (text.match(/.{0,40}(Authorization is required|timeout).{0,40}/) || [''])[0]);
    if (b.w.document.querySelector('[data-do="retry"]')) bad.push(who + ' was offered a Try again while the app is already trying');
    /* THE ONE LOADER, not "Waiting for the server" — a waiting sentence of its own until 9 Oct § */
    if (!b.w.document.querySelector('#s-spotlight .loading[role="status"]')) bad.push(who + '\'s empty Spotlight column does not show the loader while the app asks again');
  });
  /* A DROPPED QUESTION FILE IS NOT MENDED BY ASKING THE BACKEND, so it keeps its sentence and its Try
     again — but its OWN reason: `why` was the backend's first, and printed Apps Script's page beside it. */
  const l = flaky_(() => 'html', RC_KID_, { serve: url => (/data\/questions\.json/.test(url) ? null : undefined) });
  await wait(500);
  const lt = l.w.document.body.textContent;
  if (/Authorization is required/.test(lt)) bad.push('with the question file dropped too, a student was shown the backend\'s reply: ' + (lt.match(/.{0,40}Authorization is required.{0,40}/) || [''])[0]);
  if (!/question file/.test(lt)) bad.push('with the question file dropped, no column says so');
  if (!l.w.document.querySelector('[data-do="retry"]')) bad.push('a dropped question file is not offered Try again — asking the backend again would never fetch it');
  return bad;
});

/* ---------- AND EVERY CARD THAT WAITS ON THE PAYLOAD WAITS THE SAME WAY WHILE IT IS ASKED FOR AGAIN § */
check('while a failed first payload is asked for again, the score board and the hours show the loader, not a sentence', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  /* THE FIRST ASK FAILS FAST, and every ask after it waits on the gate — so the retry is out, and
     the app is between "failed" and "arrived", for as long as this journey reads. */
  const b = flaky_(n => (n === 0 ? 'fetch' : gate.then(() => ({ body: RC_PAYLOAD_() }))), RC_ADMIN_);
  await wait(400);
  const t = b.w.__t, d = b.w.document;
  if (!t || typeof t.widgetsOf !== 'function') return ['the test harness did not come up'];
  if (b.line() !== 'Reconnecting…') return ['the first payload failed and the quiet line says "' + b.line() + '" — the retry is not out, so nothing here was tested'];
  if (typeof b.w.awaiting_ !== 'function' || !b.w.awaiting_()) return ['`awaiting_()` does not say the payload is on its way while the retry is out'];
  const bad = [];
  const words = /have not arrived|Scores have not|from the server yet/;
  const turnTo = async (col, id, sel) => {
    /* A TOOL OR GAME IS ITS OWN FIND CARD (790). */
    const n = t.widgetsOf(col === 'games' ? 'game' : 'tool').findIndex(x => String(x.id) === id);
    if (n < 0) { bad.push(`no "${id}" widget on ${col} for an admin`); return null; }
    t.findGroup(col === 'games' ? 'Games' : 'Tools', id);
    await wait(LEAVE_MS); await woken_();
    for (let k = 0; k < 150; k++) {
      const el = d.querySelector(sel);
      if (el && el.innerHTML.trim() && !el.closest('[aria-busy="true"]')) return el;
      await wait(100);
    }
    bad.push(`the "${id}" widget on ${col} never started — ${sel} is empty or still veiled`);
    return null;
  };
  /* THE SPRINT LIVES IN WORD GAMES NOW (461): open that widget and pick the sprint. */
  let board = null;
  if (await turnTo('games', 'wordgames', '#s-stuff #wg-pick')) {
    const pick = d.getElementById('wg-pick');
    pick.value = 'tt'; pick.dispatchEvent(new b.w.Event('change', { bubbles: true }));
    for (let k = 0; k < 150 && !board; k++) { board = d.querySelector('#s-stuff #tt-board'); if (!board || !board.innerHTML.trim()) { board = null; await wait(100); } }
    if (!board) bad.push('the Times Tables board never drew after picking the sprint in Word games (pick=' + pick.value + ', slot=' + ((d.querySelector('#s-stuff #wg-slot')||{}).innerHTML||'').slice(0,160) + ')');
  }
  if (board) {
    if (!board.querySelector('.loading[role="status"]')) bad.push('while the retry is out the Times Tables board shows no loader: "' + board.textContent.trim().slice(0, 80) + '"');
    if (words.test(board.textContent)) bad.push('while the retry is out the Times Tables board says "' + board.textContent.trim().slice(0, 80) + '" — a wait in words of its own');
  }
  /* AND THE RETRY LANDS: the dots go, and what the payload brought is drawn where they were. */
  open();
  for (let k = 0; k < 50 && !b.arrived(); k++) await wait(100);
  if (!b.arrived()) return bad.concat(['the retry was let through and the payload is not in DATA']);
  for (let k = 0; k < 50 && d.querySelector('#s-stuff #tt-board .loading'); k++) await wait(100);
  const bb = d.querySelector('#s-stuff #tt-board');
  if (bb && bb.querySelector('.loading')) bad.push('the retry landed and the Times Tables board still shows the loader');
  if (b.w.awaiting_()) bad.push('the retry landed and `awaiting_()` still says the payload is on its way');
  return bad;
});

/* ---------- AND A FIXED SENTENCE IS NOT A WAIT § */
check('with the payload held, Booking says "Sign in to book" to a visitor at once, and waits for it for somebody signed in', async () => {
  let openV, openK;
  const v = flaky_([new Promise(r => { openV = r; })]);
  const k = flaky_([new Promise(r => { openK = r; })], RC_KID_);
  await wait(400);
  const bad = [];
  [['a visitor', v, false], ['a student', k, true]].forEach(([who, b, waits]) => {
    if (b.arrived()) { bad.push(`${who}'s payload arrived before it was let through, so nothing was tested`); return; }
    b.w.__t.go('booking', false, true);
  });
  await wait(LEAVE_MS);
  [['a visitor', v, false], ['a student', k, true]].forEach(([who, b, waits]) => {
    const col = b.w.document.getElementById('s-booking');
    const text = ((col && col.textContent) || '').replace(/\s+/g, ' ');
    const dots = col ? col.querySelectorAll('.loading').length : 0;
    if (!waits) {
      if (dots) bad.push(`${who}'s Booking column shows the loader while the payload is held — its sentence needs nothing from it`);
      if (!/Sign in to book/.test(text)) bad.push(`${who}'s Booking column does not say "Sign in to book" while the payload is held: "${text.trim().slice(0, 80)}"`);
    } else if (!dots) bad.push(`${who}'s Booking column shows no loader while the payload is held — the form needs it: "${text.trim().slice(0, 80)}"`);
  });
  openV(); openK();
  return bad;
});

/* ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN § */
check('a retry that succeeds does not rebuild the box somebody is typing in, and draws it once they leave', async () => {
  let open;
  const gate = new Promise(r => { open = r; });
  const b = flaky_(['fetch', gate], RC_KID_);
  await wait(300);
  const d = b.w.document;
  /* ON ITS OWN PAGE, IN FRONT — a field on a page that is not the one in front is let go of by
     `placeGrid`, which is a different rule and a right one. Its own Find card (790). */
  b.w.__t.findGroup('Tools', 'notepad');
  await wait(300);
  if (!d.querySelector('#s-stuff #notepad')) return ['Find › Tools has no notepad to type in, so nothing was tested'];
  /* AND NOTHING IS TYPED UNTIL THE NOTEPAD HAS STARTED — its veil off, which `widgetUp_` does after its `start`. § */
  await woken_();
  await until_(() => { const sl = d.querySelector('#s-stuff #wgt-notepad'); return !!sl && !sl.getAttribute('aria-busy'); }, 8000);
  const box = d.getElementById('notepad');
  box.focus();
  box.value = 'half a thought';
  if (d.activeElement !== box) return ['the notepad would not take the focus, so nothing was tested'];
  b.w.dispatchEvent(new b.w.Event('online'));
  await wait(50);
  open();
  await wait(600);
  const bad = [];
  if (!b.arrived()) return ['the retry\'s payload did not arrive, so nothing was tested'];
  if (!box.isConnected) bad.push('the payload landed and the column was rebuilt under the notepad — the box being typed in is gone');
  else if (d.activeElement !== box) bad.push('the payload landed and the notepad lost the focus');
  if (box.value !== 'half a thought') bad.push('the notepad lost what was in it: "' + box.value + '"');
  box.blur();
  await wait(600);
  if (box.isConnected) bad.push('the notepad was left and the column was never drawn with the payload');
  return bad;
});

/* ---------- COMING BACK TO THE PAGE WITHIN SECONDS OF A FAILED ASK § */
check('coming back to the page just after a failed ask asks again when five seconds are up, not a rung later', async () => {
  let mended = false;
  const b = flaky_(() => (mended ? undefined : 'fetch'));
  const d = b.w.document;
  let hidden = false;
  Object.defineProperty(d, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(d, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
  await wait(300);
  b.w.dispatchEvent(new b.w.Event('online'));   /* the second failure: the next rung is ten seconds out */
  await wait(150);
  if (b.asked.length !== 2) return ['`online` did not ask (' + b.asked.length + ' requests), so the return was not measured'];
  hidden = true; d.dispatchEvent(new b.w.Event('visibilitychange'));
  await wait(100);
  mended = true;
  hidden = false; d.dispatchEvent(new b.w.Event('visibilitychange'));
  await wait(200);
  const bad = [];
  if (b.asked.length !== 2) bad.push('coming back within five seconds of an ask asked at once — that is the flicking it is meant to absorb');
  await wait(5200);
  if (b.asked.length !== 3) bad.push('five seconds after the last ask, back on the page, nothing had asked again (' + b.asked.length + ' requests) — the mended backend waits for the next rung');
  if (!b.arrived()) bad.push('the mended backend\'s payload did not arrive');
  return bad;
});

/* ---------- AND A PAGE THAT OPENS OLDER THAN THE SITE REFRESHES ITSELF, ONCE § */
function staleBoot_(pageAt, serverAt, already) {
  const { implSymbol } = require('jsdom/lib/jsdom/living/generated/utils');
  let reloads = 0;
  const b = boot({ payload: RC_PAYLOAD_(), before: w => {
    w.LOAD_AT = pageAt;
    if (already) { try { w.sessionStorage.setItem('familyBuiltFor', already); } catch (e) {} }
    try { w.location[implSymbol].reload = () => { reloads++; }; } catch (e) {}
    const real = w.fetch;
    w.fetch = (url, o) => (o && o.method === 'HEAD')
      ? Promise.resolve({ ok: true, status: 200, headers: { get: k => ({ etag: '"build-b"',
          'last-modified': new Date(serverAt).toUTCString() })[k.toLowerCase()] || null } })
      : real(url, o);
  } });
  b.reloads = () => reloads;
  return b;
}
check('a page that opens older than the server reloads once, and never twice for one build', async () => {
  const bad = [];
  const now = Date.now() - 5000;
  const old = now - 3 * 24 * 3600e3;
  const fresh = staleBoot_(now, now);
  const stale = staleBoot_(old, now);
  const again = staleBoot_(old, now, '"build-b"');
  await wait(400);
  if (fresh.reloads()) bad.push('a page as new as the server reloaded itself');
  if (stale.reloads() !== 1) bad.push('a page three days older than the server reloaded ' + stale.reloads() + ' time(s), not once');
  let mark = null; try { mark = stale.w.sessionStorage.getItem('familyBuiltFor'); } catch (e) {}
  if (mark !== '"build-b"') bad.push('the reload was not remembered against the build it was for, so nothing stops a second');
  if (again.reloads()) bad.push('a page that had already reloaded for this build reloaded again — that is the loop');
  const ban = again.w.document.getElementById('banner');
  if (ban && !ban.classList.contains('hidden') && /newer version/i.test(ban.textContent))
    bad.push('the page asked about the new build — it must update quietly, never prompt (610)');
  return bad;
});

/* "IT CANNOT LOOP" RESTED ON A WRITE NOBODY READ BACK — found by review: § */
check('a page that cannot remember it reloaded for a build is offered the tap, not reloaded', async () => {
  const { implSymbol } = require('jsdom/lib/jsdom/living/generated/utils');
  const now = Date.now() - 5000;
  let reloads = 0;
  const b = boot({ payload: RC_PAYLOAD_(), before: w => {
    w.LOAD_AT = now - 3 * 24 * 3600e3;
    const refusing = { getItem: () => null, setItem: () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); },
      removeItem() {}, clear() {}, key: () => null, length: 0 };
    Object.defineProperty(w, 'sessionStorage', { configurable: true, get: () => refusing });
    try { w.location[implSymbol].reload = () => { reloads++; }; } catch (e) {}
    const real = w.fetch;
    w.fetch = (url, o) => (o && o.method === 'HEAD')
      ? Promise.resolve({ ok: true, status: 200, headers: { get: k => ({ etag: '"build-b"',
          'last-modified': new Date(now).toUTCString() })[k.toLowerCase()] || null } })
      : real(url, o);
  } });
  await wait(400);
  const bad = [];
  if (reloads) bad.push('storage refused the once-per-build mark and the page reloaded anyway — the next boot would too');
  const ban = b.w.document.getElementById('banner');
  if (ban && !ban.classList.contains('hidden') && /newer version/i.test(ban.textContent))
    bad.push('the page asked about the new build — it must update quietly, never prompt (610)');
  return bad;
});

/* AND AN ADMIN'S DIAGNOSTIC WRITTEN OVER THAT TAP IS NOT A DOOR — it kept `data-do="reload-build"`, so
   pressing its "Open it in a tab" reloaded the app as well (review). */
check('an admin\'s diagnostic written over the newer-version banner does not reload the app when pressed', async () => {
  const { implSymbol } = require('jsdom/lib/jsdom/living/generated/utils');
  const now = Date.now() - 5000;
  let reloads = 0;
  const b = boot({ payload: RC_PAYLOAD_(), before: w => {
    signedInAs_(RC_ADMIN_)(w);
    w.LOAD_AT = now - 3 * 24 * 3600e3;
    try { w.sessionStorage.setItem('familyBuiltFor', '"build-b"'); } catch (e) {}
    try { w.location[implSymbol].reload = () => { reloads++; }; } catch (e) {}
    const real = w.fetch;
    w.fetch = (url, o) => {
      if (o && o.method === 'HEAD') return Promise.resolve({ ok: true, status: 200, headers: { get: k => ({ etag: '"build-b"',
        'last-modified': new Date(now).toUTCString() })[k.toLowerCase()] || null } });
      if (!(o && o.body) && /script\.google\.com\/macros\/.*[?&]_=\d+/.test(String(url)))
        return new Promise(r => setTimeout(() => r({ ok: true, status: 200, text: () => Promise.resolve(RC_PAGE_) }), 150));
      return real(url, o);
    };
  } });
  await wait(600);
  const el = b.w.document.getElementById('banner');
  if (!/Could not reach the backend/.test(el.textContent || '')) return ['the admin was not shown the diagnostic, so nothing was pressed: ' + String(el.textContent).slice(0, 100)];
  const bad = [];
  if (el.getAttribute('data-do')) bad.push('the diagnostic carries data-do="' + el.getAttribute('data-do') + '" — a press anywhere on it acts');
  const link = el.querySelector('a.link');
  if (link) link.dispatchEvent(new b.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await wait(50);
  if (reloads) bad.push('pressing "Open it in a tab" reloaded the app');
  return bad;
});

/* ---------- THE PEN IS OFF UNTIL PICKED (owner, 7 Nov, over 368): a finger on an unpicked figure scrolls and never inks; the Pen tile arms it */
check('a drawing question\'s figure draws only once its pen is picked: an untouched figure ignores a finger, a picked one takes a dot and a line', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof t.padWrap !== 'function' || typeof t.padOn !== 'function' || typeof t.padNow !== 'function' || typeof w.padDrop_ !== 'function') {
    return ['padWrap_, PAD_ON or padDrop_ is not reachable, so the pen was NOT checked — not a pass'];
  }
  const bad = [];
  const x = { key: 'q:Q-PEN', answerType: 'drawing', diagram: '<svg viewBox="0 0 340 340"></svg>' };
  const y = { key: 'q:Q-PEN-2', answerType: 'drawing', diagram: '<svg viewBox="0 0 340 340"></svg>' };
  const kx = t.padKey(x), ky = t.padKey(y);
  [kx, ky].forEach(k => { try { w.localStorage.removeItem(k); } catch (e) {} });
  w.padDrop_(); t.padOn('');
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = t.padCard(x, x.diagram, '') + t.padCard(y, y.diagram, '');
  const pads = host.querySelectorAll('.qpad');
  /* ---------- AS BUILT, NOTHING PRESSED: the figure is the pen already ---------------------------- */
  if (host.querySelector('[data-do="pad-draw"], .qpad-lock')) bad.push('a lock (or a door on the picture) is still drawn — a step before the first mark');
  if (host.querySelector('.qpad-art[data-do]')) bad.push('the picture carries an action, so the dispatcher walks up from the ink and a tap acts instead of inking');
  if (host.querySelectorAll('.qpad-ink[data-noswipe]').length !== 2) bad.push('a pen\'s ink is not `data-noswipe` from the start, so a stroke on it would be taken by the grid and slide the column');
  [[pads[0], 20], [pads[1], 420]].forEach(([p, top]) => {
    p.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: 20, top: top, width: 340, height: 340, right: 360, bottom: top + 340, x: 20, y: top });
  });
  const stored = k => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const fire = (p, type, px, py, ts) => penEv_(w, p.querySelector('.qpad-ink'), type, { id: 7, x: px, y: py, t: ts, prim: true });
  /* ---------- A FINGER'S STROKE ON THE UNPICKED FIGURE: nothing inked, the pen stays down (a scroll) ---------- */
  fire(pads[0], 'pointerdown', 60, 60, 500);
  for (let i = 1; i <= 8; i++) fire(pads[0], 'pointermove', 60, 60 + 20 * i, 500 + 16 * i);
  fire(pads[0], 'pointerup', 60, 220, 700);
  if (t.padNow()) bad.push('a finger on an unpicked figure gave it the pen (PAD_ON is "' + t.padNow() + '") -- scrolling would draw');
  if (stored(kx).length) bad.push('a finger scrolling over an unpicked figure inked ' + JSON.stringify(stored(kx)).slice(0, 80));
  /* ---------- THE PEN PICKED, THEN A TAP: a dot ------------------------------------------------------ */
  w.padToolPick_(pads[0], 'pen');
  fire(pads[0], 'pointerdown', 190, 190, 1000);
  if (t.padNow() !== kx) bad.push('picking the pen did not give the figure the pen (PAD_ON is "' + t.padNow() + '")');
  if (!pads[0].classList.contains('is-drawing')) bad.push('the touched pad is not marked as the one drawing');
  fire(pads[0], 'pointerup', 190, 190, 1060);
  if (stored(kx).length !== 1 || stored(kx)[0].length !== 2) bad.push('a first tap on the figure stored ' + JSON.stringify(stored(kx)) + ', wanted one dot');
  /* ---------- THE OTHER FIGURE'S PEN PICKED, A STROKE: it takes the pen and inks a line --------------- */
  w.padToolPick_(pads[1], 'pen');
  fire(pads[1], 'pointerdown', 60, 460, 2000);
  for (let i = 1; i <= 12; i++) fire(pads[1], 'pointermove', 60 + 15 * i, 460 + 5 * i, 2000 + 16 * i);
  fire(pads[1], 'pointerup', 240, 520, 2250);
  if (t.padNow() !== ky) bad.push('picking the second figure\'s pen did not move the pen to it');
  if (pads[0].classList.contains('is-drawing')) bad.push('the first pad still says it is the one drawing');
  if (stored(ky).length !== 1 || stored(ky)[0].length < 4) bad.push('a first stroke on the second figure stored ' + JSON.stringify(stored(ky)).slice(0, 120) + ', wanted one line');
  if (stored(kx).length !== 1) bad.push('the stroke on the second figure changed the first one\'s marks');
  /* ---------- A REPAINT KEEPS IT SO ----------------------------------------------------------------- */
  const again = d.createElement('div');
  again.innerHTML = t.padCard(x, x.diagram, '');
  if (again.querySelector('[data-do="pad-draw"], .qpad-lock') || !again.querySelector('.qpad-ink[data-noswipe]')) bad.push('a pad drawn again grew a lock or lost `data-noswipe`');
  /* ---------- A FIGURE IN A QUESTION ANSWERED IN A BOX IS ITS PAD FROM THE START TOO (1020), and the box stays its answer ---------- */
  const typed = { kind: 'question', key: 'q:Q-TYPED', name: 'Q3', qNumber: '3', answerType: 'number', accept: '12', diagram: x.diagram,
    row: { row_id: 'Q-TYPED', paper_id: 'P-TYPED', subject: 'Maths', name: 'Typed' }, stems: [], html: '<p>Work out x.</p>' };
  const tSrc = typeof w.padSource_ === 'function' ? w.padSource_(typed) : null;
  if (!tSrc || tSrc.from !== 'part') bad.push('a typed question\'s own figure is not its pad from the start (1020): ' + JSON.stringify(tSrc && tSrc.from));
  const tCard = d.createElement('div'); tCard.innerHTML = w.questionCard_(typed);
  if (!tCard.querySelector('.qp-ans-in')) bad.push('a typed question whose figure is a pad lost its answer box');
  w.padDrop_(); t.padOn('');
  [kx, ky].forEach(k => { try { w.localStorage.removeItem(k); } catch (e) {} });
  host.remove();
  return bad;
});

/* ---------- A RULER AND A COMPASS ON THE PEN, WHERE THE QUESTION ASKS FOR THEM § */
check('a ruler draws a straight line and a compass a round circle or arc, offered on every question pen (457)', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (typeof t.padWrap !== 'function' || typeof t.padKey !== 'function'
      || !A['qt-inst'] || !A['pad-undo'] || typeof t.padTool !== 'function') {
    return ['padWrap_, padKey_, PAD_TOOL or the qt-inst / pad-undo handlers are not reachable — the tools were NOT checked'];
  }
  /* ---------- EVERY PART'S TOOL ROW HAS ALL FOUR, in the owner's order, whatever its words (round 3: `padTools_` and its word patterns are gone) */
  const q = (html, extra) => Object.assign({ kind: 'question', answerType: 'drawing', html: '<p>' + html + '</p>' }, extra || {});
  const barOf = x => { const h = d.createElement('div'); h.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 340"></svg>', '');
    return [...h.querySelectorAll('.qt-row .qt-t:is([data-do="qt-inst"], [data-do="qt-pen"])')].map(b => b.getAttribute('data-tool')).join(' '); };
  /* WHATEVER THE WORDS ASK FOR, the row is the same: QT_ROW's Ruler and Protractor, then the pen's tiles (owner, 8 Nov) */
  const ALL4 = 'ruler protractor pen line compass';
  const offered = [[q('Use a ruler.', { key: 'q:T-R' }), ALL4], [q('Construct the bisector.', { key: 'q:T-C' }), ALL4],
    [q('Draw the graph.', { key: 'q:T-N' }), ALL4], [q('Measure the angle.', { key: 'q:T-P', needs: ['Protractor'] }), ALL4]];
  offered.forEach(([x, want]) => {
    if (barOf(x) !== want) bad.push('the bar for "' + x.html.replace(/<[^>]*>/g, '') + '" offers [' + barOf(x) + '], wanted [' + want + ']');
  });

  /* ---------- A PAD IN THE DOCUMENT, 340 x 170 px: ONE UNIT ACROSS IS 1px, ONE UNIT DOWN 0.5px -------- */
  const x = q('Use a ruler and compasses to construct the bisector of angle ABC.', { key: 'q:Q-TOOLS-1' });
  const k = t.padKey(x);
  try { w.localStorage.removeItem(k); } catch (e) {}
  const host = d.createElement('div');
  d.body.appendChild(host);
  const L = 100, T = 50, W = 340, H = 170;
  const mount = () => {
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
    host.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
    return host.querySelector('.qpad');
  };
  let pad = mount();
  const ink = () => pad.querySelector('.qpad-ink');
  const Ev = w.PointerEvent || w.MouseEvent;
  const fire = (type, px, py) => ink().dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, clientX: px, clientY: py, pointerId: 1 }));
  const drag = pts => { fire('pointerdown', pts[0][0], pts[0][1]); pts.slice(1).forEach(p => fire('pointermove', p[0], p[1])); fire('pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1]); };
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  const tool = name => pad.closest('.qcard').querySelector('.qt-row .qt-t[data-tool="' + name + '"]');
  if (!tool('line') || !tool('compass') || !tool('pen')) return bad.concat(['the construction question\'s bar has no Pen, Straight line and Compass, so the drawing was NOT checked']);

  /* RULER */
  (e => A[e.getAttribute('data-do')](e))(tool('line'));
  if (!pad.classList.contains('is-drawing')) bad.push('pressing Straight line did not give this pad the pen');
  if (!tool('line').classList.contains('on') || tool('line').getAttribute('aria-pressed') !== 'true') bad.push('the Straight line tile is not lit and pressed once chosen');
  if (tool('pen').classList.contains('on') || tool('compass').classList.contains('on')) bad.push('another tool is lit beside Straight line');
  /* A (150,100)px is units (50,100); B (300,140)px is units (200,180). The middle of the drag wanders. */
  drag([[150, 100], [180, 60], [260, 160], [300, 140]]);
  let s = stored();
  if (s.length !== 1 || JSON.stringify(s[0]) !== '[50,100,200,180]') bad.push('a ruler drag stored ' + JSON.stringify(s) + ', wanted one stroke [50,100,200,180] -- its two ends and nothing between');
  if (pad.querySelector('.qpad-aid').innerHTML) bad.push('the ruler\'s anchor is still drawn after the finger lifted');
  pad = mount();
  const redrawn = [...pad.querySelectorAll('.qpad-g path')].map(p => p.getAttribute('d'));
  if (redrawn.join('|') !== 'M50 100L200 180') bad.push('the card drawn again shows ' + JSON.stringify(redrawn) + ', wanted the ruler\'s one line M50 100L200 180');
  if (!pad.classList.contains('is-drawing') || !tool('line').classList.contains('on')) bad.push('a card drawn again lost the pen or Straight line in hand');

  /* COMPASS: centre (270,135)px = units (170,170); out to (330,135)px, a radius of 60px. */
  (e => A[e.getAttribute('data-do')](e))(tool('compass'));
  if (!tool('compass').classList.contains('on') || tool('line').classList.contains('on')) bad.push('pressing Compass did not move the light from Straight line to Compass');
  fire('pointerdown', 270, 135);
  fire('pointermove', 300, 135);
  fire('pointermove', 330, 135);
  const aid = pad.querySelector('.qpad-aid');
  if (!aid.querySelector('.qpad-pin')) bad.push('the compass\'s point is not shown while it is open');
  const rad = aid.querySelector('.qpad-rad');
  if (!rad || rad.getAttribute('d') !== 'M170 170L230 170') bad.push('the live radius is ' + (rad ? rad.getAttribute('d') : 'not drawn') + ', wanted M170 170L230 170');
  if (!pad.querySelector('.qpad-g [data-live]')) bad.push('the ring is not previewed while it is dragged');
  fire('pointerup', 330, 135);
  if (aid.innerHTML) bad.push('the compass\'s point and width are still drawn after the finger lifted');
  s = stored();
  const ring = s[1] || [];
  const off = st => { let worst = 0; for (let i = 0; i < st.length; i += 2) worst = Math.max(worst, Math.abs(Math.hypot((st[i] - 170) * W / 340, (st[i + 1] - 170) * H / 340) - 60)); return worst; };
  if (s.length !== 2) bad.push('after the compass there are ' + s.length + ' strokes stored, wanted 2');
  else {
    if (ring.length < 40) bad.push('the ring has ' + ring.length / 2 + ' points -- not enough to be round');
    if (ring[0] !== ring[ring.length - 2] || ring[1] !== ring[ring.length - 1]) bad.push('the ring is not closed: it starts at ' + ring.slice(0, 2) + ' and ends at ' + ring.slice(-2));
    if (off(ring) > 1.2) bad.push('a point of the ring is ' + off(ring).toFixed(2) + 'px off the 60px radius on the screen -- an ellipse on a picture that is not square');
    const xs = ring.filter((v, i) => !(i % 2)), ys = ring.filter((v, i) => i % 2);
    if (Math.abs((Math.max(...xs) + Math.min(...xs)) / 2 - 170) > 1 || Math.abs((Math.max(...ys) + Math.min(...ys)) / 2 - 170) > 1) bad.push('the ring is not about the centre that was pressed');
  }
  /* AN ARC: out to 60px, then a quarter turn round the point, clockwise on the screen. */
  const arcPts = [[270, 135], [300, 135], [330, 135]];
  for (let deg = 10; deg <= 90; deg += 10) arcPts.push([270 + 60 * Math.cos(deg * Math.PI / 180), 135 + 60 * Math.sin(deg * Math.PI / 180)]);
  drag(arcPts);
  s = stored();
  const arc = s[2] || [];
  if (s.length !== 3) bad.push('after the swing there are ' + s.length + ' strokes, wanted 3');
  else {
    if (arc[0] === arc[arc.length - 2] && arc[1] === arc[arc.length - 1]) bad.push('a quarter-turn swing drew a closed ring, not an arc');
    if (off(arc) > 1.2) bad.push('the arc is ' + off(arc).toFixed(2) + 'px off its 60px width');
    const ang = (px, py) => Math.atan2((py - 170) * H / 340, (px - 170) * W / 340) * 180 / Math.PI;
    const a0 = ang(arc[0], arc[1]), a1 = ang(arc[arc.length - 2], arc[arc.length - 1]);
    if (Math.abs(a0) > 12 || Math.abs(a1 - 90) > 6) bad.push('the arc runs from ' + a0.toFixed(0) + '° to ' + a1.toFixed(0) + '°, wanted about 0° to 90°');
  }
  /* A TAP IS A SLIP. */
  fire('pointerdown', 200, 120); fire('pointerup', 200, 120);
  if (stored().length !== 3) bad.push('a tap with the compass stored a mark');
  if (pad.querySelector('.qpad-g [data-live]')) bad.push('a tap with the compass left its preview on the picture');
  /* UNDO: the arc, then the ring, then the ruler's line is what is left. */
  A['pad-undo'](pad.querySelector('[data-do="pad-undo"]'));
  A['pad-undo'](pad.querySelector('[data-do="pad-undo"]'));
  s = stored();
  if (s.length !== 1 || JSON.stringify(s[0]) !== '[50,100,200,180]') bad.push('two Undos left ' + JSON.stringify(s).slice(0, 80) + ', wanted only the ruler\'s line');
  if (pad.querySelectorAll('.qpad-g path').length !== 1) bad.push('two Undos left ' + pad.querySelectorAll('.qpad-g path').length + ' marks on the picture, wanted 1');
  /* THE PEN, STILL FREEHAND. */
  (e => A[e.getAttribute('data-do')](e))(tool('pen'));
  drag([[110, 60], [120, 70], [130, 66]]);
  s = stored();
  if (s.length !== 2 || s[1].length !== 6) bad.push('the pen did not keep every point of a freehand stroke: ' + JSON.stringify(s[1] || null));
  /* ---------- THE PROTRACTOR (458): put down beside the tool in hand, moved and turned by its own drag, drawn through, picked up ---------- */
  if (!tool('protractor')) bad.push('the construction question\'s bar has no Protractor');
  else {
    const was = stored().length;
    (e => A[e.getAttribute('data-do')](e))(tool('protractor'));
    const prot = () => pad.querySelector('.qpad-art > .qpad-prot');
    if (!prot()) bad.push('pressing Protractor put no protractor on the page');
    if (!tool('protractor').classList.contains('on') || tool('protractor').getAttribute('aria-pressed') !== 'true') bad.push('the Protractor tile is not lit while it lies on the page');
    if (!tool('pen').classList.contains('on')) bad.push('putting the protractor down took the Pen out of hand -- it must draw beside it');
    if (prot() && prot().querySelectorAll('.qprot-nums text').length !== 38) bad.push('the protractor shows ' + prot().querySelectorAll('.qprot-nums text').length + ' numbers, wanted 0 to 180 by tens on both scales (38)');
    const box = () => { const a = pad.querySelector('.qpad-art'); a.getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T }); };
    box();
    const pf = (el, type, px, py) => el.dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, clientX: px, clientY: py, pointerId: 7 }));
    /* MOVED BY ITS BODY: 34px right is 10% of the 340px picture */
    const body = prot() && prot().querySelector('.qprot-body');
    if (body) { pf(body, 'pointerdown', 200, 140); pf(body, 'pointermove', 234, 140); pf(body, 'pointerup', 234, 140); }
    const st = w.padProtOf_(k);
    if (Math.abs(st.x - 60) > 0.01 || Math.abs(st.y - 70) > 0.01) bad.push('dragging the protractor\'s body by 34px left it at ' + JSON.stringify(st) + ', wanted x 60, y 70');
    if (stored().length !== was) bad.push('dragging the protractor drew a mark');
    /* TURNED BY ITS KNOB about the pivot: a finger 50° round from upright is 50°; one within 2° of 90° settles there */
    const knob = prot() && prot().querySelector('[data-prot="turn"]');
    const cx = L + 0.6 * W, cy = T + 0.7 * H;
    if (knob) {
      pf(knob, 'pointerdown', cx, cy - 40);
      pf(knob, 'pointermove', cx + 40 * Math.sin(50 * Math.PI / 180), cy - 40 * Math.cos(50 * Math.PI / 180));
      if (w.padProtOf_(k).a !== 50) bad.push('turning the knob to 50° left the protractor at ' + w.padProtOf_(k).a + '°');
      pf(knob, 'pointermove', cx + 40, cy + 1);
      pf(knob, 'pointerup', cx + 40, cy + 1);
      if (w.padProtOf_(k).a !== 90) bad.push('a turn within 2° of upright did not settle at 90°, it is ' + w.padProtOf_(k).a + '°');
      if (!/rotate\(90deg\)/.test(prot().style.transform)) bad.push('the protractor on the page is not drawn turned 90°: ' + prot().style.transform);
    } else bad.push('the protractor has no knob to turn it by');
    /* DRAWN THROUGH: the pen still draws on the ink beside it */
    drag([[110, 60], [140, 62], [170, 64]]);
    if (stored().length !== was + 1) bad.push('the pen did not draw with the protractor down');
    pad = mount();
    if (!prot() || !/rotate\(90deg\)/.test(prot().style.transform)) bad.push('a card drawn again lost the protractor or its turn');
    (e => A[e.getAttribute('data-do')](e))(tool('protractor'));
    if (prot() || tool('protractor').classList.contains('on')) bad.push('pressing Protractor again did not pick it up');
    w.padProtOf_(k).on = false;
  }
  /* A STALE CHOICE CANNOT DRAW. A protractor held as if it drew (it is laid down, never drawn with, 458) is the pen. */
  const plain = q('Draw the graph.', { key: 'q:Q-TOOLS-2' });
  const pk = t.padKey(plain);
  try { w.localStorage.removeItem(pk); } catch (e) {}
  t.padTool().set(pk, 'protractor');
  host.innerHTML = t.padCard(plain, '<svg viewBox="0 0 340 170"></svg>', '');
  pad = host.querySelector('.qpad');
  pad.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
  /* the pad armed with the stale choice still in PAD_TOOL: the pen is off until picked (owner, 7 Nov) */
  t.padOn(pk); w.padArm_(pad, true);
  drag([[150, 100], [200, 100], [250, 120]]);
  const ps = (() => { try { return JSON.parse(w.localStorage.getItem(pk) || '[]'); } catch (e) { return []; } })();
  if (ps.length !== 1 || ps[0].length !== 6) bad.push('a pad drew with a protractor held as its drawing tool: ' + JSON.stringify(ps).slice(0, 80));
  t.padTool().delete(pk);
  try { w.localStorage.removeItem(k); w.localStorage.removeItem(pk); } catch (e) {}
  t.padOn('');
  host.remove();
  return bad;
});

/* ---------- A SWIPE SETTLES AT THE FINGER'S SPEED, WRITTEN ON THE COLUMNS AND NOT THE ROOT § */
check("a swipe settles at the finger's speed, written on the columns and not the root", async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.settleCurve_ !== 'function' || typeof w.settleFrom_ !== 'function'
      || typeof w.placeGrid !== 'function') {
    return ['settleCurve_, settleFrom_ or placeGrid is not reachable, so the settle was NOT checked — not a pass'];
  }
  const bad = [];
  /* THE SPRING ITSELF (527): `springAt_` sampled at the time `settleCurve_` gives — critically damped, so it starts at the
     finger's speed (capped where more would sail past), never overshoots, and its time follows distance and speed. */
  if (typeof w.springAt_ !== 'function' || typeof w.springOf_ !== 'function') return ['springAt_ or springOf_ is not reachable — the spring was NOT checked'];
  const W = w.SPRING_W || 0.02;
  [[300, 1.2], [-300, -1.2], [120, 0.3], [200, 4], [335, 0], [40, 0.5]].forEach(([D, v]) => {
    const c = w.settleCurve_(D, v), s = w.springOf_(D, v), dist = Math.abs(D);
    const want = Math.min(W, Math.abs(v) / dist), got = (w.springAt_(s.a, 0.01) - w.springAt_(s.a, 0)) / 0.01;
    if (Math.abs(got - want) * dist > want * dist * 0.03 + 0.005) bad.push(`a card ${D}px from home released at ${v}px/ms leaves at ${(got * dist).toFixed(2)}px/ms, not ${(want * dist).toFixed(2)}`);
    let top = 0;
    for (let t = 0; t <= c.dur; t += 4) top = Math.max(top, w.springAt_(s.a, t));
    if (top * dist > dist + 0.5) bad.push(`a ${dist}px settle at ${v}px/ms sails ${(top * dist - dist).toFixed(1)}px past its card`);
    if (Math.abs(1 - w.springAt_(s.a, c.dur)) * dist > 0.5) bad.push(`a ${dist}px settle ends ${((1 - w.springAt_(s.a, c.dur)) * dist).toFixed(1)}px short of its card`);
    if (!(c.dur >= 100 && c.dur <= 900)) bad.push(`a ${dist}px settle takes ${c.dur}ms, outside 100-900`);
    if (!/^(linear\(0, .*, 1\)|cubic-bezier\()/.test(c.tf)) bad.push(`a settle's curve is ${String(c.tf).slice(0, 40)}`);
  });
  /* LONGER FOR FURTHER, SHORTER FOR FASTER. */
  if (!(w.settleCurve_(335, 0).dur > w.settleCurve_(60, 0).dur)) bad.push('a whole step settles no slower than a sixth of one');
  if (!(w.settleCurve_(335, 3).dur < w.settleCurve_(335, 0).dur)) bad.push('a flicked card settles no sooner than one let go still');
  /* RELEASED STILL, OR PULLING BACK THE OTHER WAY: it starts from rest, or goes out a little and comes back — never leaps home. */
  if (w.springOf_(200, 0).a !== 0) bad.push('a card released still does not start from rest');
  if (!(w.springOf_(200, -1).a <= 0)) bad.push('a card whose finger was pulling the other way starts by leaping toward home');

  /* ---------- AND WHERE IT IS WRITTEN ------------------------------------------------------------ */
  w.settleFrom_('x', -1);
  w.placeGrid(false, null);
  if (w.document.documentElement.style.getPropertyValue('--slide')) {
    bad.push('the release wrote --slide on <html>, which re-styles every element in the app before the card can move');
  }
  const hosts = [...w.document.querySelectorAll('#screen > .screen')].filter(h => h.style.transform);
  if (!hosts.length) bad.push('no column was placed, so where the settle goes was NOT checked');
  else if (!hosts.some(h => /cubic-bezier|linear\(/.test(h.style.transitionTimingFunction || ''))) {
    bad.push('the settle was not written on the columns, so a release has no curve of its own');
  }
  return bad;
});

/* ---------- THE AGE RANGE ON A TUTOR'S CARD, AND EVERY HALF OF ONE A ROW CAN HOLD § */
check('an age range reads sensibly with both ends, one end, or neither', async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.profAges_ !== 'function' || typeof w.findCard !== 'function') {
    return ['profAges_ or findCard is not reachable, so the age range was NOT checked — not a pass'];
  }
  const bad = [];
  [[8, 16, 'Ages 8–16'], ['8', '16', 'Ages 8–16'], [10, 10, 'Age 10'],
   [11, '', 'Ages 11+'], [11, 'Adults', 'Ages 11+'], ['', 16, 'Ages up to 16'],
   ['Adults', '', 'Adults'], ['Adults', 'Adults', 'Adults'], ['', 'Adults', 'All ages'],
   [16, 8, 'Ages 8–16'], ['adults', 12, 'Ages 12+'], [0, 0, ''], ['', '', ''],
   [undefined, undefined, ''], ['teenagers', '', '']].forEach(([lo, hi, want]) => {
    const got = w.profAges_({ ageMin: lo, ageMax: hi });
    if (got !== want) bad.push(`youngest ${JSON.stringify(lo)} and oldest ${JSON.stringify(hi)} read "${got}", wanted "${want}"`);
  });
  const t = { title: 'Ada Tutor', handle: 'ada', rate: 30, yrsExp: 10, minStudents: 1, maxStudents: 4,
              ageMin: 8, ageMax: 16, teaches: [], listed: true, personId: 'P-x' };
  const html = String(w.findCard({ kind: 'tutor', row: t }) || '');
  const facts = (html.match(/prof-facts[^]*?<\/div>/) || [''])[0];
  if (!/>Ages 8–16</.test(facts)) bad.push('a tutor who teaches 8 to 16 has no "Ages 8–16" chip under At a glance');
  const none = String(w.findCard({ kind: 'tutor', row: Object.assign({}, t, { ageMin: '', ageMax: '' }) }) || '');
  if (/>Ages?\b|>Adults<|>All ages</.test(none)) bad.push('a tutor who has said nothing about ages is drawn with an age chip anyway');
  return bad;
});

/* ---------- A FRACTION ON A CARD IS DRAWN OVER ITS LINE, IN ALL FIVE PLACES A CARD DRAWS MATHS § */
check('a fraction is drawn stacked in the stem, lead, part, answer and choices, and accept is not', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.questionCard_ !== 'function') return ['questionCard_ is not reachable — renamed?'];
  const half = '<sup>1</sup>&frasl;<sub>2</sub>';
  const base = { kind: 'question', key: 'q-typeset', name: 'Q9', marks: 2,
    row: { row_id: 'Q-TYPESET-9', paper_id: 'P-TYPESET', subject: 'Maths', name: 'Typeset' },
    stems: [{ html: '<p>Stem ' + half + '</p>' }], lead: '<p>Lead ' + half + '</p>',
    html: '<p>Work out 3<sup>4</sup>&frasl;<sub>5</sub> and <i>x</i>^2</p>',
    answer: '<b><sup>32</sup>&frasl;<sub>15</sub></b>' };
  const draw = x => { const d = w.document.createElement('div'); d.innerHTML = w.questionCard_(x, 0); return d; };
  const tapped = draw(Object.assign({}, base, {
    choices: [half, '<sup>1</sup>&frasl;<sub>3</sub>'], choiceRight: [1] }));
  /* THE ANSWER IS ITS OWN PAGE NOW (`questionAnsCard_`), drawn open by `answerBlock_` -- so its
     fraction is asked of what that draws, not of the question card, which no longer carries it. */
  const ansDrawn = w.document.createElement('div');
  ansDrawn.innerHTML = typeof w.answerBlock_ === 'function' ? w.answerBlock_(base) : '';
  /* AND THE STEM IS DRAWN ONCE AT THE TOP OF ITS QUESTION'S ONE CARD (960, `questionWhole_`), so its fraction is asked of that card. */
  const stemDrawn = w.document.createElement('div');
  stemDrawn.innerHTML = typeof w.questionWhole_ === 'function' ? w.questionWhole_(base, [base], null, true) : '';
  [['.qsheet-stem', 'the stem'], ['.qsheet-lead', 'the lead'], ['.qsheet-pb', 'the part'],
   ['.qans-body', 'the answer']].forEach(([sel, what]) => {
    const el = (sel === '.qans-body' ? ansDrawn : sel === '.qsheet-stem' ? stemDrawn : tapped).querySelector(sel);
    if (!el) bad.push(what + ' was not drawn at all');
    else if (!el.querySelector('.frac .frac-n') || !el.querySelector('.frac .frac-d')) bad.push(what + ' drew its fraction slanted: ' + el.innerHTML.slice(0, 120));
  });
  const opts = [...tapped.querySelectorAll('.qp-opt')];
  if (opts.length !== 2) bad.push('the two choices drew as ' + opts.length + ' buttons');
  else if (opts.some(b => !b.querySelector('.frac .frac-n'))) bad.push('a choice drew its fraction slanted');
  const part = tapped.querySelector('.qsheet-pb');
  if (part && !part.querySelector('.frac-mixed')) bad.push('3 4/5 is not kept together as a mixed number');
  if (part && !/x<\/i><sup>2<\/sup>/.test(part.innerHTML)) bad.push('x^2 was not raised: ' + part.innerHTML);
  /* THE TYPED BOX: no choices, an `accept`, and the attribute the marker reads must be byte for byte
     what the row says. */
  const typed = draw(Object.assign({}, base, { accept: '32/15 | 2 2\u204415' }));
  const mark = typed.querySelector('.qp-mark');
  if (!mark) bad.push('a row with an accept drew no Check');
  else if (mark.getAttribute('data-accept') !== '32/15 | 2 2\u204415') bad.push('accept reached the marker changed: ' + mark.getAttribute('data-accept'));
  if (base.html.indexOf('&frasl;') === -1) bad.push('drawing the card rewrote the stored row');
  return bad;
});

/* ---------- THE ANSWER IS ITS RESULT, AND NOTHING ELSE § */
check('an answer draws its result and nothing else: no Why, no working, no examiner\'s note', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.answerBlock_ !== 'function') return ['answerBlock_ is not reachable — renamed?'];
  const draw = x => { const d = w.document.createElement('div'); d.innerHTML = w.answerBlock_(x); w.document.body.appendChild(d); return d; };
  const base = { kind: 'question', key: 'q-why', name: 'Q4', marks: 1,
    row: { row_id: 'Q-WHY-4', paper_id: 'P-WHY', subject: 'Maths', name: 'Why' },
    html: '<p>Work out 12 &divide; 4</p>' };
  const full = Object.assign({}, base, {
    answer: '<b>3</b> &mdash; B1, cao. A half of 6 is <sup>6</sup>&frasl;<sub>2</sub>, and 12 &divide; 4 = 3.',
    examinerNote: 'Most candidates were right.' });
  const card = draw(full);
  const body = card.querySelector('.qans-body');
  if (!body) bad.push('no .qans-body was drawn');
  else {
    if (body.textContent.trim() !== '3') bad.push('the result drew as "' + body.textContent.trim() + '", wanted "3"');
    if (/B1|cao|half/.test(body.textContent)) bad.push('the result carries the code or the working: ' + body.innerHTML);
  }
  const extra = sel => card.querySelector(sel);
  ['.qans-why', 'details', 'summary', '.qans-more', '.qans-note'].forEach(sel => {
    if (extra(sel)) bad.push('the answer still draws ' + sel + ' -- the owner asked for the answer and nothing else');
  });
  if (/A half of 6|Most candidates|Why/.test(card.textContent)) bad.push('the working, the note or the word "Why" is still in the answer\'s text: ' + card.textContent.replace(/\s+/g, ' ').trim().slice(0, 120));
  /* SHOWN, ON THE ANSWER PAGE: the same block, nothing more. */
  if (typeof w.questionAnsCard_ === 'function' && w.__t.ACTIONS['qa-show']) {
    const page = w.document.createElement('div');
    page.innerHTML = w.questionAnsCard_(full);
    w.document.body.appendChild(page);
    const held = w.stuffItemsAll_;
    w.stuffItemsAll_ = () => [full];
    const showBtn = page.querySelector('[data-do="qa-show"]');
    if (!showBtn) bad.push('a hidden answer page has no "Show the answer" to press');
    else try { w.__t.ACTIONS['qa-show'](showBtn); } finally { w.stuffItemsAll_ = held; }
    const opened = page.querySelector('.qans-card');
    if (!opened || opened.classList.contains('is-hidden') || !opened.querySelector('.qans-body')) bad.push('"Show the answer" did not show the answer');
    else if (opened.querySelector('details, .qans-why, .qans-note') || /A half of 6|Most candidates/.test(opened.textContent)) bad.push('the shown answer page carries the working or the note');
  } else bad.push('the answer page or its Show the answer has no handler');
  /* STILL SENT TO THE MARKER: the explanation left the page, not the row. */
  if (typeof w.aiScheme_ === 'function') {
    const sch = w.aiScheme_(full);
    if (!/half of 6/.test(sch) || !/Most candidates/.test(sch)) bad.push('Mark with AI no longer sends the working and the examiner\'s note as its scheme: ' + sch.slice(0, 120));
  } else bad.push('aiScheme_ is not reachable, so what the marker is sent was NOT checked');
  return bad;
});

/* WHAT A PAGE OF A QUESTION SAYS IT IS, read back off its tags. § */
const tagF = (root, field) => [...(root ? root.querySelectorAll('.qcard-tags .qtag[data-f="' + field + '"]') : [])]
  .map(t => t.textContent.replace(/\s+/g, ' ').trim()).join(' ');
/* `Page 2` AND `2 pages` ARE THE TAGS' OWN WORDS SINCE 396 — the value is the words — so the numbers are read out of them. */
const pageNum = root => {
  const q = tagF(root, 'qNumber'), i = tagF(root, 'qPage'), num = v => (/\d+/.exec(v) || [''])[0];
  return q ? q + tagF(root, 'qPart') + (tagF(root, 'qSub') ? '(' + tagF(root, 'qSub') + ')' : '')
    + (i ? ' · ' + num(i) + ' of ' + num(tagF(root, 'qPages')) : '') : '';
};
const tagText = (root, kind) => kind === 'number' ? pageNum(root) : kind === 'kind' ? [tagF(root, 'kindLabel'), tagF(root, 'kindOwn')].filter(Boolean).join(' ') : tagF(root, kind);

/* ---------- MARKING AND REVEALING LEAVE THE QUESTION WHERE IT IS § */
check('marking, revealing and tapping leave the question where it is, and typing clears a stale verdict', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  if (typeof w.questionCard_ !== 'function') return ['questionCard_ is not reachable — renamed?'];
  const A = w.__t.ACTIONS;
  ['qp-check', 'qa-show', 'qp-choose'].forEach(a => { if (!A[a]) bad.push(a + ' has no handler'); });
  if (bad.length) return bad;
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  /* THE TAG ROW AND THE QUESTION. There was a gold header line above the tags; everything it said is a
     tag now (`qPage_`), so the row is the card's whole head and is held as one block. */
  const still = card => {
    const top = ['.qcard-tags', '.qsheet'].map(s => card.querySelector(s));
    return { top, html: top.map(n => n && n.outerHTML), kids: [...card.children] };
  };
  const same = (a, card, when) => {
    const b = still(card);
    a.top.forEach((n, i) => {
      if (!n) return bad.push(when + ': the card has no ' + ['tag row', 'question'][i]);
      if (n !== b.top[i]) bad.push(when + ': the ' + ['tag row', 'question'][i] + ' was redrawn rather than left alone');
      else if (a.html[i] !== b.html[i]) bad.push(when + ': the ' + ['tag row', 'question'][i] + '\'s markup changed');
    });
    /* BY THE BLOCK'S FIRST CLASS, which names what it is; `is-near`, `is-done` and `is-shut` are the
       states marking is SUPPOSED to change. */
    if (a.kids.length !== b.kids.length || a.kids.some((k, i) => k.classList[0] !== b.kids[i].classList[0])) {
      bad.push(when + ': the card\'s blocks changed from [' + a.kids.map(k => k.className).join(', ')
        + '] to [' + b.kids.map(k => k.className).join(', ') + ']');
    }
  };
  const base = { kind: 'question', name: 'Q7', marks: 1,
    row: { row_id: 'Q-STILL-7', paper_id: 'P-STILL', subject: 'Maths', name: 'Still' },
    html: '<p>Work out <sup>5</sup>&frasl;<sub>8</sub> of 24</p>', answer: '<b>15</b> &mdash; 24 &divide; 8 &times; 5' };
  /* TYPED */
  const typed = draw(Object.assign({}, base, { key: 'q-still-typed', accept: '15' }));
  const t0 = still(typed);
  const slot = typed.querySelector('.qp-mark .qp-verdict');
  if (!slot) bad.push('a typed card has no verdict slot until it is marked, so the verdict arrives as a new line');
  const inp = typed.querySelector('.qp-ans-in');
  const chk = typed.querySelector('.qp-check');
  const type = v => { inp.value = v; inp.dispatchEvent(new w.Event('input', { bubbles: true })); };
  type('16'); A['qp-check'](chk);
  const mark = typed.querySelector('.qp-mark');
  if (!mark.classList.contains('is-near') || !/Not yet/.test(slot.textContent)) bad.push('a wrong answer was not marked "not yet": ' + mark.className + ' / ' + slot.textContent);
  if (typed.querySelector('.qp-mark .qp-verdict') !== slot) bad.push('the verdict was written into a new element, not the slot');
  same(t0, typed, 'after a wrong Check');
  type('15');
  if (mark.classList.contains('is-near') || mark.classList.contains('is-right') || slot.textContent) bad.push('typing a new answer left the old verdict on it: ' + mark.className + ' / ' + slot.textContent);
  same(t0, typed, 'after typing');
  A['qp-check'](chk);
  if (!mark.classList.contains('is-right')) bad.push('15 was not marked right');
  same(t0, typed, 'after a right Check');
  /* REVEALED -- by Show on the answer page, which is the page a swipe after the card. § */
  const shutX = Object.assign({}, base, { key: 'q-still-shut', row: Object.assign({}, base.row, { row_id: 'Q-STILL-8' }) });
  const shut = draw(shutX);
  const r0 = still(shut);
  shut.parentNode.insertAdjacentHTML('beforeend', '<div class="tile-row">' + '' + '</div>');
  if (shut.parentNode.querySelector('[data-do="qa-go"], .tile-i-next')) bad.push('the question\'s row still carries a tile to its answer page -- the owner asked for none');
  shut.parentNode.insertAdjacentHTML('beforeend', w.questionAnsCard_(shutX));
  const rev = shut.parentNode.querySelector('[data-do="qa-show"]');
  if (!rev) bad.push('the answer page has no Show to reveal it with');
  else {
    const heldR = w.stuffItemsAll_;
    w.stuffItemsAll_ = () => [shutX];
    try { A['qa-show'](rev); } finally { w.stuffItemsAll_ = heldR; w.ansHide_(shutX); }
    same(r0, shut, 'after "Show the answer"');
  }
  /* TAPPED -- `qp-choose` redraws the box from the stored pick and finds its question by key in the library, which this harness does not load; so the library is § */
  const mc = Object.assign({}, base, { key: 'q-still-mc', row: Object.assign({}, base.row, { row_id: 'Q-STILL-9' }),
    choices: ['14', '15', '16'], choiceRight: [2] });
  try { w.localStorage.removeItem(w.__t.ansKey(mc)); } catch (e) {}
  const tapped = draw(mc);
  const m0 = still(tapped);
  if (!tapped.querySelector('.qp-choices + .qp-mark .qp-verdict')) bad.push('a tapped card has no verdict slot until it is marked');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [mc];
  try { A['qp-choose'](tapped.querySelector('.qp-opt[data-n="1"]')); } finally { w.stuffItemsAll_ = held; }
  const box = tapped.querySelector('.qp-choices');
  if (!box || !box.classList.contains('is-miss') || box.classList.contains('is-done')) bad.push('a wrong tap settled the question (is-done) instead of leaving it open for another try (is-miss, 385)');
  if (!tapped.querySelector('.qp-opt[data-n="1"].is-picked')) bad.push('the tap did not mark the pick');
  /* A MISS DOES NOT SHOW THE ANSWER. § */
  const shownBy = tapped.querySelector('.qp-opt.is-ans');
  if (shownBy) bad.push('a wrong tap ticked option ' + shownBy.getAttribute('data-n') + ' -- the answer shown on the question card without Show');
  const said = (tapped.querySelector('.qp-verdict') || {}).textContent || '';
  if (!/^Not yet/.test(said) || /marked|is 15|\b15\b/.test(said)) bad.push('a wrong tap\'s verdict reads "' + said + '" -- "Not yet", and nothing that gives the right one away');
  /* AND IT POINTS AT THE ANSWERS CHIP, not at "the answer page": with Questions chosen there is no
     answer page after the question to point at (`questionsView_`). */
  if (said.trim() !== 'Not yet — have another go') bad.push('a wrong tap\'s verdict reads "' + said.trim() + '", wanted "Not yet — have another go"');
  same(m0, tapped, 'after a wrong tap');
  /* AND THE CHILD TAPS AGAIN: a miss is not final (385). */
  w.stuffItemsAll_ = () => [mc];
  try { A['qp-choose'](tapped.querySelector('.qp-opt[data-n="2"]')); } finally { w.stuffItemsAll_ = held; }
  if (!tapped.querySelector('.qp-choices.is-done .qp-opt[data-n="2"].is-picked.is-ans')) bad.push('a second tap after "Not yet" did not take the new pick and mark it Correct');
  try { w.localStorage.removeItem(w.__t.ansKey(mc)); } catch (e) {}
  /* AND A RIGHT ONE TICKS THE PICK -- the verdict on what you chose, which is not a reveal. */
  const mcR = Object.assign({}, mc, { key: 'q-still-mc-r', row: Object.assign({}, base.row, { row_id: 'Q-STILL-10' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(mcR)); } catch (e) {}
  const tappedR = draw(mcR);
  w.stuffItemsAll_ = () => [mcR];
  try { A['qp-choose'](tappedR.querySelector('.qp-opt[data-n="2"]')); } finally { w.stuffItemsAll_ = held; }
  if (!tappedR.querySelector('.qp-opt[data-n="2"].is-picked.is-ans') || tappedR.querySelectorAll('.qp-opt.is-ans').length !== 1) bad.push('a right tap did not tick the pick, and only the pick');
  try { w.localStorage.removeItem(w.__t.ansKey(mcR)); } catch (e) {}
  /* AND THE FIGURE IS ON THE CARD, WHERE THE PAPER PRINTS IT, AND NOTHING POINTS AT A PAGE (356): § */
  const fig = draw(Object.assign({}, base, { key: 'q-still-fig', diagram: '<svg viewBox="0 0 10 10" id="fig-end"></svg>',
    html: base.html + '<!--fig-->', row: Object.assign({}, base.row, { row_id: 'Q-STILL-10' }) }));
  const figFront = draw(Object.assign({}, base, { key: 'q-still-fig2', diagram: '<svg viewBox="0 0 10 10" id="fig-front"></svg>',
    row: Object.assign({}, base.row, { row_id: 'Q-STILL-11' }) }));
  const pb = c => c.querySelector('.qsheet-pb');
  if (!fig.querySelector('.qsheet #fig-end')) bad.push('a question with a figure did not draw it in its card');
  else if (pb(fig).lastElementChild !== fig.querySelector('#fig-end').closest('figure')) bad.push('a figure marked after the words is not after them');
  if (!figFront.querySelector('.qsheet #fig-front')) bad.push('a figure with no marker and no lead is not in its card');
  else if (!(figFront.querySelector('#fig-front').compareDocumentPosition(figFront.querySelector('.qsheet-pb p') || figFront) & 4)) bad.push('a figure with no marker and no lead is not in front of the words');
  [fig, figFront, typed].forEach(c => { if (/on the next page/i.test(c.textContent)) bad.push('a card points at a page: "' + c.textContent.match(/[^.]*on the next page/i)[0].trim() + '"'); });
  return bad;
});

/* ---------- A FRACTION, TYPED ON THE KEYPAD, MARKED RIGHT § */
check('a fraction typed on the maths keypad is drawn stacked, saved, and marked right against 0.75', async () => {
  const { w, errs } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — keypad.js did not load'];
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const base = { kind: 'question', name: 'Q4', marks: 1, answerType: 'calculation', accept: '0.75',
    row: { row_id: 'Q-KP-4', paper_id: 'P-KP', subject: 'Maths', name: 'Keypad' },
    html: '<p>Write 0.75 as a fraction.</p>', answer: '<b>3/4</b>' };
  const x = Object.assign({}, base, { key: 'q-kp-frac' });
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const card = draw(x);
  const inp = card.querySelector('.qp-ans-in');
  if (!inp || inp.tagName !== 'INPUT' || inp.getAttribute('inputmode') !== 'none' || !inp.readOnly) {
    return ['a calculation’s answer box is ' + (inp ? '<' + inp.tagName.toLowerCase() + ' inputmode="' + inp.getAttribute('inputmode') + '"'
      + (inp.readOnly ? ' readonly' : '') + '>' : 'missing')
      + ' — wanted an <input readonly inputmode="none">, so the phone’s keyboard has no way in'];
  }
  if (card.querySelector('textarea.qp-ans-in')) bad.push('the maths card drew a textarea as well as the keypad box');
  if (card.querySelector('.qp-ai')) bad.push('a maths question with a scheme was offered "Mark with AI" — Check is exact there');
  /* ---------- THE BOX IS A CHAT BAR WITH A SEND TILE § */
  const bar = card.querySelector('.qp-mark.qp-compose > .qp-bar');
  const sendT = card.querySelector('.qp-check');
  if (!bar || !bar.querySelector(':scope > .qp-ans .kp-in')) bad.push('the answer box is not in a chat bar (`.qp-mark.qp-compose > .qp-bar` holding the field)');
  if (!sendT || !sendT.matches('.qt-row > .tile:not(.is-send)[data-do="qp-check"]:last-child') || !sendT.querySelector('.tile-i-send')) bad.push('Check is not an ordinary tile with the send mark, last in the part\'s tool row: ' + (sendT ? sendT.outerHTML.slice(0, 120) : '(none)'));
  const verdictEl = card.querySelector('.qp-verdict');
  if (!verdictEl || !verdictEl.closest('.qp-mark') || verdictEl.closest('.qp-bar')) bad.push('the verdict is not a line of its own under the bar, inside `.qp-mark`');
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return bad.concat(['focusing the maths box did not open the keypad']);
  const key = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
  const WANT = { '0': 'zero', '9': 'nine', '.': 'point', '-': 'minus', '×': 'times', '÷': 'divide',
    '!frac': 'fraction', '!pow': 'power', '!sqrt': 'square root', 'π': 'pi', '(': 'open bracket',
    ')': 'close bracket', 'x': 'the letter x', '!back': 'backspace', '!done': 'the ✓ submit' };
  Object.keys(WANT).forEach(v => { if (!key(v)) bad.push('the keypad has no ' + WANT[v] + ' key'); });
  /* 44px IS THE STYLESHEET'S, MEASURED BY check/ui.js IN A REAL BROWSER; jsdom lays nothing out. What
     this can see is that every key is a button with a handler, and that nothing on the pad would
     take the focus off the box. */
  pad.querySelectorAll('.kp-key').forEach(b => {
    if (b.tagName !== 'BUTTON' || b.getAttribute('type') !== 'button') bad.push('a key is not a <button type="button">: ' + b.outerHTML.slice(0, 60));
  });
  /* ⌫ IS THE RED KEY, with a drawn mark (*"especially backspace, which i thing should be red"*), and ✓
     wears the Send tile's paper aeroplane -- one mark for "mark it" on the pad and beside the box. */
  if (key('!back') && (!key('!back').classList.contains('kp-del') || !key('!back').querySelector('svg.kp-del-i'))) bad.push('⌫ is not the red key (`kp-del`) with its drawn mark');
  if (key('!done') && !key('!done').querySelector('.tile-i-send')) bad.push('✓ does not carry the send mark the Send tile has');
  const press = v => { const b = key(v); if (b) A['kp-key'](b); else bad.push('no key ' + v + ' to press'); };
  press('!frac');
  const show = card.querySelector('.kp-show');
  if (inp.value !== '()/()') bad.push('the fraction key on an empty box typed "' + inp.value + '", wanted two slots "()/()"');
  if (!show.querySelector('.frac .frac-n .kp-hole') || !show.querySelector('.frac .frac-d .kp-hole')) bad.push('an empty fraction is not drawn as two dashed slots over a line: ' + show.innerHTML.slice(0, 160));
  if (!show.querySelector('.frac-n .kp-caret')) bad.push('the caret is not in the top slot after the fraction key');
  press('3'); press('!right'); press('4');
  if (inp.value !== '(3)/(4)') bad.push('3, →, 4 into the fraction typed "' + inp.value + '", wanted "(3)/(4)"');
  const n = show.querySelector('.frac .frac-n'), dd = show.querySelector('.frac .frac-d');
  if (!n || !dd || n.textContent.trim() !== '3' || dd.textContent.trim() !== '4') bad.push('three quarters is not drawn stacked, 3 over 4: ' + show.innerHTML.slice(0, 200));
  let kept = null;
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (kept !== '(3)/(4)') bad.push('the keypad’s answer was not saved under ansKey_ (got ' + JSON.stringify(kept) + ') — it has to go through the same input listener a typed one does');
  press('!done');
  const mark = card.querySelector('.qp-mark');
  if (!mark || !mark.classList.contains('is-right')) bad.push('✓ on (3)/(4) against 0.75 did not mark it right: ' + (mark ? mark.className + ' / ' + mark.textContent.trim() : 'no mark row'));
  if (!pad.hidden) bad.push('✓ left the keypad up');
  /* ⌫ TAKES AN EMPTY STRUCTURE AWAY WHOLE, and leaves a filled one alone. */
  const y = Object.assign({}, base, { key: 'q-kp-back', accept: 'x^2', row: Object.assign({}, base.row, { row_id: 'Q-KP-5' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(y)); } catch (e) {}
  const c2 = draw(y);
  const i2 = c2.querySelector('.qp-ans-in');
  i2.focus();
  press('x'); press('!pow');
  if (i2.value !== 'x^()') bad.push('x then the power key typed "' + i2.value + '", wanted "x^()"');
  if (!c2.querySelector('.kp-show sup .kp-hole')) bad.push('an empty power is not drawn as a raised slot');
  press('!back');
  if (i2.value !== 'x') bad.push('⌫ in an empty power left "' + i2.value + '", wanted the whole ^() gone');
  press('!frac'); press('!back');
  if (i2.value !== 'x') bad.push('⌫ in an empty fraction after x left "' + i2.value + '"');
  /* ---------- AND ⌫ NEVER LEAVES HALF A BRACKET § */
  const paired = v => { let n = 0; for (const ch of v) { n += ch === '(' ? 1 : ch === ')' ? -1 : 0; if (n < 0) return false; } return n === 0; };
  const setTo = v => { i2.value = v; i2.setSelectionRange(v.length, v.length); };
  setTo('(3)/(4)');
  press('!back');
  if (i2.value !== '(3)/(4)' || i2.selectionStart !== 6) bad.push('⌫ after a filled fraction gave "' + i2.value + '" with the caret at ' + i2.selectionStart + ' -- wanted nothing deleted and the caret stepped inside, at 6');
  press('!back');
  if (i2.value !== '(3)/()') bad.push('⌫ again gave "' + i2.value + '", wanted the 4 gone: "(3)/()"');
  setTo('123/(4)');
  press('!back'); press('5');
  if (i2.value !== '123/(45)') bad.push('123/(4), ⌫, 5 gave "' + i2.value + '" -- wanted "123/(45)": the ⌫ steps inside, it does not take the bracket');
  for (const start of ['(3)/(4)', '123/(4)', 'x^(2)+\u221a(16)']) {
    setTo(start);
    const seen = [start];
    for (let n = 0; n < 30 && i2.value; n++) {
      press('!back');
      seen.push(i2.value);
      if (!paired(i2.value)) { bad.push('⌫ from "' + start + '" left an unpaired bracket: ' + seen.join(' → ')); break; }
    }
    if (i2.value) bad.push('thirty ⌫ from "' + start + '" did not empty the box: ' + seen.slice(-4).join(' → '));
  }
  setTo('x');
  press('!pow'); press('2'); press('!done');
  if (i2.value !== 'x^(2)' || !c2.querySelector('.qp-mark.is-right')) bad.push('x^(2) against x^2 was not marked right: ' + i2.value);
  /* AND A WORDED ANSWER IS WORDS, ON THE PAD'S LETTERS -- it was the phone's own keyboard until the owner, 8 Oct: § */
  const wd = draw(Object.assign({}, base, { key: 'q-kp-words', answerType: 'explain', accept: '',
    row: Object.assign({}, base.row, { row_id: 'Q-KP-6' }) }));
  const ta = wd.querySelector('.qp-ans-in');
  if (!ta || !ta.matches('.kp-field.kp-words > textarea.kp-in[data-kp="words"][readonly][inputmode="none"]')) {
    bad.push('an explain question\'s box is not the pad\'s locked words box: ' + (ta ? ta.outerHTML.slice(0, 160) : '(none)'));
  } else {
    /* IN THE SAME BAR, saying what it is for while it is empty -- the box nobody could find in the sun.
       The words are the drawing's (`.kp-show:empty::before`), because the textarea is invisible. */
    if (!ta.closest('.qp-bar') || ta.hasAttribute('placeholder') || ta.parentNode.querySelector('.kp-show').innerHTML !== '') bad.push('the worded box is not in the chat bar with an empty drawing to say "Type your answer"');
    ta.focus();
    if (pad.hidden || pad.getAttribute('data-layer') !== 'abc' || !pad.querySelector('.kp-key[data-v="q"]')) bad.push('focusing a worded box did not open the pad on its letters (layer ' + pad.getAttribute('data-layer') + ')');
    ta.blur();
    await wait(10);
  }
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});


/* THE KEPT PAYLOAD (1070) IS ONE ACCOUNT'S AND NOBODY ELSE'S: no secret in it, gone on sign-out, never written for whoever is here after a sign-out, never read for another account. */
check('the payload kept on the device is this account\'s alone: no token in it, gone on sign-out, never filed under the next person', async () => {
  const b = flaky_([{ body: RC_PAYLOAD_() }], RC_ADMIN_);
  const bad = [], w = b.w, ls = w.localStorage;
  const kept = () => { try { return JSON.parse(ls.getItem('payload:kept') || 'null'); } catch (e) { return 'unreadable'; } };
  await wait(1700);
  const k = kept();
  if (!k || !k.d) return ['a landed payload was never kept on the device — nothing to check'];
  if (k.who !== 'P001') bad.push('the kept payload is filed under "' + k.who + '", not the admin who asked for it');
  if (/"(token|pin|password)"\s*:/i.test(JSON.stringify(k.d))) bad.push('the kept payload carries a token, PIN or password');
  /* ANOTHER ACCOUNT, SAME DEVICE: the copy is not theirs to draw. */
  w.__t.USER({ name: 'Mo Learner', personId: 'P-MO', role: 'kid', roles: ['kid'] });
  if (w.payloadKept_()) bad.push('another account on the same device was handed the admin\'s kept payload');
  w.__t.USER({ ...RC_ADMIN_ });
  if (!w.payloadKept_()) bad.push('the admin\'s own kept payload was not offered back to the admin');
  w.signedOut_();
  if (kept() !== null) bad.push('sign-out left the kept payload on the device');
  if (w.payloadKept_()) bad.push('after sign-out a visitor was offered a kept payload');
  /* A LANDING STILL OWED AT SIGN-OUT (written a second after it lands) is never written under the visitor who is left. */
  const c = flaky_([{ body: RC_PAYLOAD_() }], RC_ADMIN_);
  for (let i = 0; i < 60 && !c.arrived(); i++) await wait(20);
  if (!c.arrived()) bad.push('the second load never landed — the owed write was NOT checked');
  else {
    c.w.signedOut_();
    await wait(1500);
    if (c.w.localStorage.getItem('payload:kept') !== null) bad.push('a payload owed at sign-out was written after it, for whoever is here now');
  }
  return bad;
});
