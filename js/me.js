/* @family. — me.js ONE FILE, SPLIT. § */



/* THE SCREENS. One function each, returning markup. § */

/* ---------- YOU § */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) return split_(signInCard_());
  return meRest_();
}

/* ---------- SIGNING IN AND OUT BELONGS AT THE TOP OF THE FEED § */
function signInCard_() {
  return `<div class="card">
        <h3>Sign in</h3>
        <p class="sub">You need an account to book, to keep a checklist, or to spend credits.</p>
        ${/* ---------- NAME, USERNAME OR E-MAIL, AND THE LABEL HAS TO SAY SO § */
             ''}
        <label class="field"><span>email or handle</span>
          <input id="in-name" type="text" inputmode="email" autocomplete="off" autocapitalize="off"
                 spellcheck="false"></label>
        ${/* ---------- THE PIN, ON A SHARED iPAD § */
             ''}
        <label class="field"><span>PIN</span>
          <input id="in-pin" ${pinDotsOk_() ? 'type="text" class="pin-dots"' : 'type="password"'}
                 inputmode="numeric" pattern="[0-9]*" maxlength="8" enterkeyhint="go"
                 autocomplete="one-time-code" autocorrect="off" autocapitalize="off" spellcheck="false"
                 data-1p-ignore data-lpignore="true"></label>
        ${/* ---------- THREE TILES, WHERE THERE WERE TWO BUTTONS AND A CARD § */
             ''}
        <div class="tile-row">${tile_({ icon: 'in', label: 'Sign in', tone: 'buy', act: 'do-signin' })}${
          tile_({ icon: 'key', label: 'Forgotten your PIN?', act: 'forgot-pin' })}${
          tile_({ icon: 'join', label: 'Make an account', act: 'register' })}</div>
        ${/* A TILE SHOWS A MARK AND NO WORD — its name is in `title` and `aria-label`, which a finger never reads. § */
             ''}
        <p class="faint">Sign in · a new PIN by email · make an account.</p>
        ${/* ---------- AND THE OTHER DOOR § */
             ''}
        ${(DATA.googleClientId || '') ? `<div class="in-or"><span>or</span></div>
        <div id="g-btn"></div>` : ''}
        ${/* `#in-said` STOOD HERE — a faint grey line carrying a validation, a "Checking…" the button already says with a spinner on it, and a refusal that is now a toast. § */
              ''}
      </div>`;
  /* THE `No account yet?` CARD THAT STOOD HERE is the third tile in the row above now. */
}

/* ---------- `signOutCard_` WAS HERE § */

function meRest_() {
  /* `rows` WAS HERE — Name, Role, Credits, Ticks, Email, Where. They are on `meCard` in cards.js
     now, built from the same `USER` and `USER.profile` this read. */

  /* THE PHOTOGRAPH, not the figure. § */
  /* A PHOTOGRAPH IF THERE IS ONE, otherwise the figure. § */
  /* ---------- YOUR FACE AND YOUR NAME ARE ON YOUR CARD, NOT HERE § */
  return split_(`
    ${/* `installCard()` WAS HERE, "second, and that is the whole point of where it is" — and this column had stopped being drawn, so it was second on a page nobody § */
          ''}

    ${/* `Your figure` WAS A TILE ON YOUR CARD and is the last card of Settings now. § */
          ''}

    ${/* ---------- END OF THE PROFILE CARD § */
          ''}
    ${/* ---------- THE WEEK, ON A PANE OF ITS OWN § */
          ''}
    ${ME_SPLIT}
    ${/* `Your week` WAS A CARD HERE, then a tool in the drawer, and is the Timetable's now — the
          booked sessions are drawn into that week, locked. See the note where it stood in map.js. */''}
    ${ME_SPLIT}
    ${/* ---------- SOMEBODY WANTS TO ADD YOU TO THEIR FAMILY § */
          ''}
    ${(DATA.claims || []).map(claimCard_).join('')}

    ${/* ---------- AND THE OTHER END OF IT § */
          ''}
    ${/* `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the row under your own face, beside the wardrobe. § */
          ''}

    ${/* ---------- `What needs fixing` AND `Tell someone` WERE HERE § */
          ''}

    ${/* ---------- THE SECOND `Sign out` WAS HERE § */
          ''}
    ${/* ---------- THE VERSION CARD IS GONE FROM THE COLUMN § */
          ''}`);}

/* ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT § */
function versionSaid_() {
  return `<p class="faint" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · css ${esc(cssVersion())}<br>
      backend ${esc(DATA.version || '—')}</p>
      ${(() => {
        const f = DATA.fileVersions || {};
        const names = Object.keys(f);
        if (names.length < 2) return '';
        const newest = names.map(k => f[k]).sort().pop();
        const stale = names.filter(k => f[k] !== newest);
        return stale.length
          ? `<p class="sub" style="color:#c8853c">Not deployed: ${stale
              .map(k => esc(k) + '.gs (' + esc(f[k]) + ')').join(', ')}. Paste ${stale.length === 1
              ? 'that file' : 'those files'} into Apps Script.</p>`
          : '';
      })()}`;
}

/* ---------- THE SETUP CARD (361): what has set itself up since the last deploy, for an admin only ----------
   No buttons: every job runs by itself on an admin's page load, so there is nothing to press twice. */
function setupWhen_(iso) {
  const d = new Date(String(iso || ''));
  if (isNaN(d)) return String(iso || '');
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
/* A JOB'S LINK — the tidy's backup copy (379) — only when it is an https address, opened beside the app. */
function setupJobLink_(j) {
  const url = String((j && j.link) || '');
  if (url.slice(0, 8) !== 'https://') return '';
  return ` <a href="https://${esc(url.slice(8))}" target="_blank" rel="noopener">Open the backup</a>`;
}
function setupCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  const S_ = DATA && DATA.setup;
  /* IN THE BUSINESS COLUMN (400), and it glows while something is wrong — `bizNeed_` in records.js. */
  const need = (n, say) => typeof bizNeed_ === 'function' ? bizNeed_('setup', n, say) : '';
  if (!S_) {
    return typeof awaiting_ === 'function' && awaiting_()
      ? `<div class="card setup-card" data-need="setup">${need(0)}<h3>Setup</h3>${loading_()}</div>`
      : `<div class="card setup-card" data-need="setup"><h3>Setup</h3>${need(1, 'Not deployed')}<p class="sub">The live backend sends no setup report, so it is older than this site. Pull, then Deploy → New version.</p></div>`;
  }
  if (S_.error) return `<div class="card setup-card" data-need="setup"><h3>Setup</h3>${need(1, 'Setup failed')}<p class="sub">The setup report failed: ${esc(S_.error)}</p></div>`;
  const files = S_.files || {};
  const odd = Object.keys(files).filter(k => files[k] !== S_.backend);
  const jobs = Array.isArray(S_.jobs) ? S_.jobs : [];
  const failed = jobs.filter(j => j && j.error);
  const sun = S_.sunday || {};
  const mode = { send: 'on — it emails parents', preview: 'preview — it writes the log and emails nobody' }[sun.mode] || 'off — nothing is sent';
  const wrong = failed.length + (odd.length ? 1 : 0);
  return `<div class="card setup-card" data-need="setup"><h3>Setup</h3>
    ${need(wrong, wrong + (wrong === 1 ? ' thing to fix' : ' things to fix'))}
    <p class="sub">Backend live: <b>${esc(S_.backend || '—')}</b> · site ${esc(typeof SITE_VERSION !== 'undefined' ? SITE_VERSION : '—')}${odd.length
      ? ` · <span class="setup-bad">not deployed: ${odd.map(k => esc(k) + '.gs (' + esc(files[k]) + ')').join(', ')}</span>` : ' · all four files agree'}</p>
    ${failed.map(j => `<p class="setup-bad">${esc(j.id)} failed: ${esc(j.error)} — it tries again on the next page load.</p>`).join('')}
    <ul class="setup-list">${jobs.map(j => `<li><span>${j.ran ? '✓' : j.error ? '✗' : '…'}</span> ${esc(j.id)} <span class="faint">${j.ran
      ? esc(j.ran === 'yes' ? 'done' : setupWhen_(j.ran)) : j.error ? 'failed' : 'waiting'}</span>${
      /* WHAT THE JOB LEFT TO SAY — the tidy's backup copy and what it removed (379). */
      j.said ? `<br><span class="faint">${esc(j.said)}</span>` : ''}${
      setupJobLink_(j)}</li>`).join('')}</ul>
    <h4>Triggers</h4>
    <ul class="setup-list">${(S_.triggers || []).map(t => `<li>${esc(t.fn)}${t.times > 1 ? ' ×' + esc(t.times) : ''} <span class="faint">${esc(t.when)}</span></li>`).join('')
      || `<li class="faint">${S_.triggersError ? 'could not be listed: ' + esc(S_.triggersError) : 'none yet — they install on the next page load'}</li>`}</ul>
    <p class="sub">Sunday email: ${esc(mode)}. ${sun.next ? 'Next send ' + esc(setupWhen_(sun.next)) + '.' : 'Not booked yet — it books itself on the next page load.'}</p>
  </div>`;
}

/* ---------- APPLY TO TEACH (400): Staff only by application and an admin's yes ----------
   On You, for a signed-in adult who is not staff yet; no date of birth is underage (450), so the card asks for it. */
const APP_SUBJECT_ROWS = 3;
const APP_STATUS_LINE = {
  new: 'Your application to teach is with us. We will be in touch.',
  interview: 'We would like to talk to you about teaching — we will be in touch to arrange it.',
  approved: 'Your application to teach was approved.',
  declined: 'Your application to teach was not taken further this time. You can apply again.',
};
function applyAdult_() {
  const age = profileAge_(USER && USER.profile);
  return age !== null && age >= 18;
}
/* THE PADLOCK'S ONE TILE (464): Apply to teach, or where the application stands, on the tile itself; '' for a child. */
function applyTile_() {
  if (!USER || rankAtLeast_('staff')) return '';
  if (profileAge_(USER.profile) === null)
    return tileRow_(tile_({ icon: 'join', label: 'Apply to teach', note: 'add your date of birth first', act: 'apply-open', off: true }), 'apply-tiles');
  if (!applyAdult_()) return '';
  const st = USER.application && USER.application.status;
  if (st === 'new' || st === 'interview')
    return tileRow_(tile_({ icon: 'join', label: 'Application sent', note: st === 'interview' ? 'we will arrange a talk' : 'we will be in touch', act: 'apply-open', off: true }), 'apply-tiles');
  return tileRow_(tile_({ icon: 'join', label: st === 'declined' ? 'Apply again' : 'Apply to teach', note: st === 'approved' ? 'approved' : '', act: 'apply-open' }), 'apply-tiles');
}
function applyFormHtml_() {
  const noOther = h => h.replace(`<option value="${QUAL_OTHER}">Something else…</option>`, '');
  const rows = Array.from({ length: APP_SUBJECT_ROWS }, (_, i) => `<div class="q-row">
      ${noOther(qualPick_(`data-app-subj="${i}"`, '', QUAL_SUBJECTS, i ? 'Another subject' : 'Subject', 'Choose'))}
      ${noOther(qualPick_(`data-app-level="${i}"`, '', QUAL_LEVELS, 'Level', 'Choose'))}</div>`).join('');
  const codes = typeof availCodes_ === 'function' ? availCodes_() : [];
  const week = codes.length ? availGrid_(codes, {}, [], false) : '';
  const box = (k, label, o) => `<label class="field"><span>${esc(label)}</span><input data-app="${k}" autocomplete="off"${(o && o.type) ? ` type="${o.type}"` : ''}${(o && o.ph) ? ` placeholder="${esc(o.ph)}"` : ''}></label>`;
  const area = (k, label) => `<label class="field"><span>${esc(label)}</span><textarea data-app="${k}" rows="3"></textarea></label>`;
  return `<div class="me-form app-form">
    <h4>What you teach</h4>${rows}
    ${area('qualifications', 'qualifications — degrees, teaching qualifications, anything relevant')}
    <h4>Checks</h4>
    <div class="f-row" style="--n:2">${box('dbsNumber', 'DBS certificate number')}${box('dbsIssued', 'issued on', { type: 'date' })}</div>
    <label class="check"><input type="checkbox" data-app="dbsNeeded"><span class="box"></span><span>I need a DBS check</span></label>
    <label class="field"><span>right to work in the UK</span><select data-app="rightToWork"><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option></select></label>
    <h4>You</h4>
    ${area('experience', 'experience')}
    ${week ? `<div class="app-week">${week}</div>` : area('availability', 'when you can teach')}
    ${box('area', 'area and venues you can reach')}
    <h4>Two references</h4>
    <div class="f-row" style="--n:2">${box('ref1Name', 'name')}${box('ref1Contact', 'email or phone')}</div>
    <div class="f-row" style="--n:2">${box('ref2Name', 'name')}${box('ref2Contact', 'email or phone')}</div>
    ${area('statement', 'a short statement — why you want to teach')}
    ${box('cvLink', 'CV link (optional)', { ph: 'https://…', type: 'url' })}
    <label class="check"><input type="checkbox" data-app="consent"><span class="box"></span><span>I agree to @family. keeping these details to consider my application, contacting my referees and checking my DBS.</span></label>
    <div class="btn-row"><button class="btn" data-do="apply-send">Send my application</button><button class="btn quiet" data-do="apply-cancel">Cancel</button></div>
    <p class="faint me-said apply-said" aria-live="polite"></p>
  </div>`;
}
on('apply-open', () => { if (USER) openSheet('Apply to teach', applyFormHtml_()); });
on('apply-cancel', () => closeSheet());
on('apply-send', el => {
  const f = el.closest('.app-form');
  if (!f || !USER) return;
  const v = k => { const b = f.querySelector(`[data-app="${k}"]`); return !b ? '' : b.type === 'checkbox' ? (b.checked ? 'TRUE' : '') : String(b.value || '').trim(); };
  const subjects = Array.from({ length: APP_SUBJECT_ROWS }, (_, i) => {
    const s_ = (f.querySelector(`[data-app-subj="${i}"]`) || {}).value || '', l = (f.querySelector(`[data-app-level="${i}"]`) || {}).value || '';
    return s_ ? s_ + (l ? ' (' + l + ')' : '') : '';
  }).filter(Boolean).join(', ');
  const hours = [].filter.call(f.querySelectorAll('.app-week input[type="checkbox"]'), b => b.checked).map(b => b.dataset.me).join(',');
  const body = { action: 'applyTeach', personId: (USER && USER.personId) || '', subjects, qualifications: v('qualifications'), dbsNumber: v('dbsNumber'), dbsIssued: v('dbsIssued'),
    dbsNeeded: v('dbsNeeded'), rightToWork: v('rightToWork'), experience: v('experience'), availability: hours || v('availability'),
    area: v('area'), ref1Name: v('ref1Name'), ref1Contact: v('ref1Contact'), ref2Name: v('ref2Name'), ref2Contact: v('ref2Contact'),
    statement: v('statement'), cvLink: v('cvLink'), consent: v('consent') };
  send_(body, { button: el, where: f.querySelector('.apply-said'), saying: 'Sending…' })
    .then(d => {
      USER.application = d.application || { status: 'new', at: Date.now() };
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
      closeSheet();
      toast('Application sent');
      try { paint('staff'); } catch (e) {}
    })
    .catch(() => {});
});

/* THE YOU SCREEN IS ONE PAGE. § */
/* MESSAGES, ON A PANE OF ITS OWN. § */
/* `meMessagesCard` WAS HERE — one pane on `You` holding every message from everybody, filled by `fillMessages` into a single `#msg-body`. § */

/* THE MARK BETWEEN THE TWO HALVES of the You screen. A comment in the markup: it survives being
   built into a string, it cannot be mistaken for content, and it renders as nothing if it ever
   escapes. */
const ME_SPLIT = '<!--me-split-->';

const mePages = () => {
  const all = meBlocks().join('');
  /* PROFILE, then ACCOUNT, then MESSAGES. § */
  /* SPLIT ON EVERY MARKER, NOT THE FIRST. § */
  const pages = all.split(ME_SPLIT).map(x => x.trim()).filter(Boolean);

  /* ---------- YOUR SESSIONS ARE YOURS, SO THEY ARE HERE § */

  return pages.length ? pages : [all];
};

/* Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this screen's markup is in the document — the same reason a widget's § */
/* ---------- NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT § */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); });

/* ---------- `screen('me')` WAS HERE § */
function mountGoogleWhenDrawn() {
  if (!USER && typeof googleMount === 'function') requestAnimationFrame(googleMount);
}

/* `on('health')` WAS HERE — it fetched `?health=1` and drew the backend's problem list in a sheet. § */

/* ---------- MOUNTING GOOGLE'S BUTTON § */
let gLoaded = false;

function googleMount() {
  const host = $('g-btn');
  const id = DATA.googleClientId || '';
  if (!host || !id || host.childElementCount) return;

  const draw = () => {
    if (!window.google || !google.accounts || !google.accounts.id) return;
    google.accounts.id.initialize({ client_id: id, callback: googleSignedIn_ });
    google.accounts.id.renderButton(host, { theme: 'filled_black', size: 'large',
                                            text: 'signin_with', width: 260 });
  };
  if (gLoaded) { draw(); return; }
  gLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = draw;
  /* NO SCRIPT, NO BUTTON, AND A SENTENCE. A blocked or offline third party otherwise leaves an
     empty gap under the word "or", which reads as the app having lost something. */
  s.onerror = () => { host.innerHTML = '<p class="faint">Google sign-in could not load.</p>'; };
  document.head.appendChild(s);
}

/* WHAT COMES BACK IS A CLAIM AND IT IS NOT INSPECTED HERE. § */
function googleSignedIn_(res) {
  /* THE SAME VOICE AS THE PIN DOOR, which is the point: § */
  toast('Checking with Google…');
  send_({ action: 'googleLogin', credential: (res && res.credential) || '' })
    .then(d => {
      if (!d.success) { toast(d.error || 'That did not work.'); return; }
      /* ---------- EXCEPT WHEN GOOGLE HAS JUST TAKEN AWAY THE PIN § */
      if (d.pinCleared && !d.message) d.message = 'The PIN this account was made with no longer works. Sign in '
        + 'with Google, or use "Forgotten your PIN?" for a new one.';
      /* THE SAME DOOR AS THE PIN PATH — `signedIn_`, because the reply is the same reply (one function builds it on the server for exactly this reason) and both doors § */
      signedIn_(d);
    })
    /* `send_` HAS ALREADY TOASTED IT — see the note over `do-signin`. */
    .catch(() => {});
}

/* THE SIGN-IN CARD SPEAKS IN TOASTS, AND IT USED TO SAY EVERYTHING THREE TIMES. § */
/* ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE § */
on('forgot-pin', el => {
  const who = (($('in-name') || {}).value || '').trim();
  if (!who) { toast('Type your email address or your handle first.'); return; }
  send_({ action: 'forgotPin', who }, { button: el, busy: 'Sending\u2026' })
    .then(d => toast((d && d.message)
      || 'If there is an account with that email, a new PIN is on its way.'))
    /* A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that handle" \u2014 and `send_` has already toasted it. § */
    .catch(() => {});
});

on('do-signin', el => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  if (!name || !pin) { toast('Both, please.'); return; }
  /* ---------- THE BUTTON HAS TO LOOK PRESSED § */
  /* NO `where` AND NO `saying`. § */
  /* `email` AND `name`, THE SAME STRING TWICE. § */
  send_({ action: 'verifyLogin', email: name.trim(), name: name.trim(), pin },
        { button: el, busy: 'Checking…' })
    .then(d => {
      /* `send_` THROWS ON A REPLY CARRYING `error`, and `verifyLogin` refuses with one — so this branch is for a reply that says `success: false` and nothing else § */
      if (!d.success) { toast(d.error || 'That did not work.'); return; }
      /* THE REPLY, PLUS WHAT WE ALREADY KNEW. § */
      /* ---------- CLEARING THE LAST ATTEMPT'S REFUSAL IS NOT A LINE ANY MORE § */
      /* NOT THE TYPED TEXT AS A NAME FALLBACK ANY MORE — it is an e-mail address now, and a row with no first or last name would have signed in wearing its address as § */
      /* ---------- DRAWN NOW, REFRESHED AFTER § */
      signedIn_(d, name);
    })
    /* NO `.catch` THAT SPEAKS. § */
    .catch(err => {
      const why = err && err.reply && err.reply.why;
      const id = why === 'wrong-pin' ? 'in-pin' : (why === 'not-an-email' || why === 'no-such-email') ? 'in-name' : '';
      const box = id && $(id);
      if (!box) return;
      if (id === 'in-pin') box.value = '';
      box.setAttribute('aria-invalid', 'true');
      try { box.focus(); if (id === 'in-name') box.select(); } catch (e) {}
    });
});
/* THE MARK COMES OFF AT THE NEXT KEYSTROKE — a red edge round a box being corrected is the app still
   complaining about what is no longer there. */
document.addEventListener('input', e => {
  const t = e.target;
  if (t && (t.id === 'in-pin' || t.id === 'in-name') && t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
});

/* ---------- ENTER SUBMITS, BECAUSE THE KEYBOARD SAYS IT WILL § */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = e.target && e.target.id;
  if (id !== 'in-name' && id !== 'in-pin') return;
  e.preventDefault();
  const btn = document.querySelector('[data-do="do-signin"]');
  if (btn && !btn.disabled) btn.click();
});

on('signout', () => {
  /* ---------- SIGNING OUT ENDS THE SESSION ON THE SERVER TOO § */
  const tok = USER && USER.token;
  let last = Promise.resolve();
  try { if (typeof answersPush_ === 'function') last = answersPush_(true); } catch (err) {}
  /* AND THE PRESSES, WHICH SINCE 9 OCT ARE HOW A TYPED ANSWER REACHES THE ACCOUNT AT ALL — the one in flight and every one queued behind it, on this token, before § */
  let subs = Promise.resolve();
  try {
    if (typeof subDrain_ === 'function') subs = subDrain_(USER && USER.personId, tok, typeof answersCan_ === 'function' && answersCan_('submitAnswer'));
  } catch (err) {}
  /* AND THE NOTEPAD, THE DOCKET AND THE TIMETABLE, still inside their moment before they go up (`keepDue_`, data.js) — each is sent only while somebody is signed § */
  let due = Promise.resolve();
  try { if (typeof keepFlush_ === 'function') due = keepFlush_(); } catch (err) {}
  Promise.all([Promise.resolve(last).catch(() => {}), due, Promise.resolve(subs).catch(() => {})]).then(() => { try { if (tok) api({ action: 'signOut', token: tok }); } catch (err) {} });
  signedOut_();
  toast('Signed out');
});

/* ONE WAY IN AND ONE WAY OUT. § */
function signedOut_(opts) {
  opts = opts || {};
  /* WHO IS LEAVING, AND WHETHER THEY WERE AN ADMIN — read before they are forgotten, for `ended` below. */
  const was = USER;
  let wasAdmin = false;
  try { wasAdmin = (typeof isAdmin === 'function' && isAdmin()) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) {}
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch (e) {}
  /* ---------- AND WHAT THEY HAD ASKED FIND FOR GOES WITH THEM § */
  try {
    const states = typeof finderStates_ === 'function' ? finderStates_()
                 : (typeof STUFF !== 'undefined' ? [STUFF] : []);
    states.forEach(st => {
      if (opts.keepFind) { /* nobody → somebody: `signedIn_` keeps it, and says whose it is now */ }
      else if (opts.ended && was && !wasAdmin) st.whose = String(was.personId || was.name || '');
      else { st.q = ''; st.filters = []; st.whose = ''; }
    });
  } catch (err) {}
  /* THE INBOX, AND THE POLL THAT FILLS IT. `MSG_ASKING` too: a reply still on its way is the last
     person's, and `loadMessages` drops it when it lands for somebody else. */
  MESSAGES = null; MSG_FAILED = false; MSG_PENDING = []; MSG_ASKING = null;
  Object.keys(MSG_QUEUE).forEach(k => { delete MSG_QUEUE[k]; });
  try { DM_ASKED = false; DM_DONE = false; DM_LAST = 0; if (typeof dmStop_ === 'function') dmStop_(); } catch (e) {}
  /* THE STARS — the device's copy is a cache of the person, and the next person is not them. */
  try { FAVS = new Set(); localStorage.removeItem('favs'); } catch (e) {}
  /* WHAT THE LAST PERSON SENT, AS THIS DEVICE HELD IT FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN. § */
  try { if (typeof subForget_ === 'function') subForget_(); } catch (e) {}
  try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) {}
  /* AND THE CAMERA, which is kept parked while the app is open (427) — the next person's phone light is not this one's. */
  try { if (typeof camStop_ === 'function') camStop_(); } catch (e) {}
  /* AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`). § */
  try { if (typeof KP_UNDO !== 'undefined') KP_UNDO.clear(); } catch (e) {}
  try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
  /* THE PAYLOAD'S PER-PERSON KEYS. Each is already hidden from the next person by its `for` check, so
     this is not what stops a leak — it is what stops the last person's data sitting on the device. */
  try {
    DATA.submissions = { for: '', mine: {} };
    DATA.family = []; DATA.familyFor = '';
    DATA.favourites = []; DATA.everyone = [];
  } catch (e) {}
  /* ---------- AND THE FILMS, WHICH HAVE NO `for` CHECK AT ALL § */
  try { DATA.films = []; delete DATA.filmsSync; } catch (e) {}
  /* AND THE LIBRARY'S WORDS AND ANSWERS THIS VISIT FETCHED (397) — the next person signs in for their own. */
  try { if (typeof libForget_ === 'function') libForget_(); } catch (e) {}
  try { if (typeof stuffForget_ === 'function') stuffForget_(); } catch (e) {}
  try {
    if (typeof FILMSYNC !== 'undefined') { FILMSYNC.asking = null; FILMSYNC.autoFor = ''; FILMSYNC.err = ''; }
    if (typeof VID !== 'undefined') VID.q = '';
    /* AND THE PICTURES THAT FAILED, which are remembered by address — and a Drive film's address is its
       file id (`VID_BROKEN` in games.js). */
    if (typeof VID_BROKEN !== 'undefined') VID_BROKEN.clear();
  } catch (e) {}
  /* AND THE ANSWERS' READ — the next person signing in is read for, whoever they are (js/answers.js). */
  try { if (typeof answersForget_ === 'function') answersForget_(); } catch (e) {}
  /* AND THE PEN, AND THE WHITEBOARD ON A COLUMN THE REPAINT BELOW LEAVES STALE — the last person's
     board stayed armed under their key until Tools was next arrived at (`padWhoChanged_`, find.js). */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) {}
  try { if (typeof boardWhoChanged_ === 'function') boardWhoChanged_(); } catch (e) {}
  /* AND THE DEAD KEY OF THE DRAW/TYPE SWITCH, which face each drawing question was left on (327, 337). § */
  try { localStorage.removeItem('surfaceFace'); } catch (e) {}
  /* AND THE BOOKING FORM, which is the person's draft and not the next family's (`bookFollow_`, book.js;
     docs/history/317). `typeof`, because book.js loads after this file. */
  try { if (typeof bookFollow_ === 'function') bookFollow_(!!opts.quiet); } catch (e) {}
  if (!opts.quiet) repaint();
}

/* `d` is the sign-in reply; `typed` what was typed in the handle box, a name of last resort. */
function signedIn_(d, typed) {
  /* ---------- THE REPLY'S PER-PERSON EXTRAS GO ON `DATA`, NOT ON `USER` § */
  const EXTRA = ['submissions', 'favourites', 'family', 'familyFor', 'answers'];
  const got = {};
  const me = Object.assign({}, d);
  EXTRA.forEach(k => { if (k in me) { got[k] = me[k]; delete me[k]; } });
  const pid = String(me.personId || '');
  /* ---------- A DIFFERENT PERSON FROM THE ONE WHOSE THINGS ARE HELD STARTS CLEAN; NOBODY HELD KEEPS FIND § */
  const fromNobody = !USER;
  const over = !fromNobody && (String(USER.personId || '') !== pid || !pid);
  /* EVERY FINDER'S `whose` — `signedOut_` marks them together, so any one says it. */
  const finders_ = () => (typeof finderStates_ === 'function' ? finderStates_()
                         : (typeof STUFF !== 'undefined' ? [STUFF] : []));
  let whose = '';
  try { whose = String((finders_().find(st => st && st.whose) || {}).whose || ''); } catch (e) {}
  if (fromNobody) signedOut_({ quiet: true, keepFind: !whose || whose === pid });
  else if (over) signedOut_({ quiet: true });
  /* SIGNED IN, FIND IS THE PERSON'S OWN, and `USER` says whose — `whose` is only for while nobody is. */
  try { finders_().forEach(st => { st.whose = ''; }); } catch (e) {}
  /* THE REPLY, PLUS WHAT WE ALREADY KNEW — see `do-signin`. The handle when the row has no name. */
  USER = me;
  if (!USER.name) USER.name = me.handle || typed || '';
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
  /* ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED § */
  try { if (over && typeof ansSwitchedIn_ === 'function') ansSwitchedIn_(pid); } catch (e) {}
  /* EVERY COPY OF THE WHITEBOARD UNDER THE PERSON WHO IS SIGNED IN NOW, stale columns included. */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) {}
  try { if (typeof boardWhoChanged_ === 'function') boardWhoChanged_(); } catch (e) {}
  /* THE BOOKING FORM FOLLOWS — filled in signed out and signed in to send, it is theirs (book.js). */
  try { if (typeof bookFollow_ === 'function') bookFollow_(); } catch (e) {}
  try {
    if (got.submissions && typeof got.submissions === 'object' && String(got.submissions.for || '') === pid) DATA.submissions = got.submissions;
    if (Array.isArray(got.favourites)) {
      DATA.favourites = got.favourites;
      if (typeof adoptFavourites_ === 'function') adoptFavourites_();
    }
    if (Array.isArray(got.family) && String(got.familyFor || '') === pid) { DATA.family = got.family; DATA.familyFor = pid; }
  } catch (e) {}
  /* THE ANSWERS, INTO THE BOXES — the reply's copy now, and a fresh read at once beside it, which also
     sends whatever this device has had waiting for this person (js/answers.js). */
  try { if (got.answers && typeof got.answers === 'object' && typeof answersAdopt_ === 'function') answersAdopt_(pid, got.answers); } catch (e) {}
  /* AND WHAT WAS WRITTEN SIGNED OUT IS THIS PERSON'S, from nobody only — the same seat as Find above. § */
  try { if (pid && typeof answersClaim_ === 'function') answersClaim_(pid, !fromNobody); } catch (e) {}
  try { if (typeof answersPull_ === 'function') answersPull_(true); } catch (e) {}
  /* AND THE LATEST ANSWER SENT FOR EACH QUESTION — onto the cards, into the boxes, with "Signed in" — and
     whatever this device has waiting for this person goes up (js/submit.js). */
  try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) {}
  /* WHO, NOT JUST THAT. *"i feel very insecure when signing into the kids accounts"* — on an iPad passed
     between children, "Signed in" does not say into whose account. */
  const first = String(USER.name || USER.handle || '').trim().split(/\s+/)[0];
  toast(first ? 'Signed in as ' + first : 'Signed in');
  repaint();
  /* ---------- AND BACK WHERE YOU CAME FROM § */
  try {
    if (AT === 'account') {
      const kid = typeof hasRole === 'function' && (hasRole('kid') || hasRole('student'));
      const back = typeof PREV_AT === 'string' && PREV_AT && PREV_AT !== 'account' && TABS.some(t => t.id === PREV_AT)
        ? PREV_AT : (kid ? 'stuff' : '');
      if (back) go(back);
    }
  } catch (e) {}
  load();
  /* AND WHAT IS OWED ONCE IN — a sentence about held children, a move link waiting. */
  afterSignIn_(d);
}

/* NOTHING ABOUT WHO SIGNED IN IS KEPT ON THE DEVICE — the owner did not want recent usernames offered (docs/history/383). Old keys are wiped. */
function signInForgetOld_() {
  try { localStorage.removeItem('familyHandles'); localStorage.removeItem('familyAdminHint'); } catch (e) {}
}
signInForgetOld_();
/* DOTS ON A TEXT BOX, WHERE THE BROWSER CAN DRAW THEM — see `.pin-dots` and the PIN box above. Asked of
   the browser rather than of its name. */
function pinDotsOk_() {
  try { return !!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc')); }
  catch (e) { return false; }
}

/* ---------- THE WARDROBE § */
/* `on('build-said')` WAS HERE, opening `versionSaid_` in a sheet from a `Build` tile on your own card. § */

/* ---------- THE WARDROBE IS ONE CARD § */
const AV_FIG = 56;
/* ---------- AND THE CARD IS A SECTION OF YOUR OWN CARD'S EDIT NOW (docs/history/339) § */
function wardrobeBody_() {
  if (!USER) return '';
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  const items = wardrobe();

  /* A CLASS, NOT AN ID — `avatarSave` redraws every `.av-figure` and there is only one now, but an
     id here is how the four-pages version once moved the wrong picture, and nothing is saved by
     going back to one. */
  const figure = `<div class="av-wrap av-figure">${
    avatarFor(USER.handle || USER.name, AV_FIG, USER.avatar)}</div>`;

  const swatches = (field, colours) => `<div class="av-swatches">
    ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
      style="background:${col}" data-do="av-colour" data-field="${field}" data-value="${i}"
      role="button" aria-label="${esc(field)} ${i + 1}" title="${esc(col)}"></span>`).join('')}
  </div>`;
  const line = (label, body) => `<div class="av-line">
      <span class="av-slot-name">${esc(label)}</span>${body}</div>`;

  const slotLine = ([slot, label]) => {
    const mine = items.filter(x => x.slot === slot);
    if (!mine.length) return '';
    return line(label, `<div class="av-opts">${mine.map(it => {
      const on = cfg[slot] === it.id;
      /* WHY it is not yours, on the item itself. "Locked" is a state; "Lv 8" is a thing you can
         count towards, which is the difference between a shop window and a list of doors. */
      const why = it.unlocked ? '' : (it.cost ? it.cost + 'cr' : 'Lv' + it.level);
      const said = it.name + (why ? ' — ' + (it.cost ? it.cost + ' credits' : 'level ' + it.level) : '');
      return `<button class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
        data-do="av-pick" data-slot="${esc(slot)}" data-id="${esc(it.id)}"
        aria-label="${esc(said)}" aria-pressed="${on ? 'true' : 'false'}" title="${esc(said)}">
        ${itemArt(slot, it.id, 24) || '<span class="av-none">—</span>'}
        ${why ? `<span class="av-why">${esc(why)}</span>` : ''}
      </button>`;
    }).join('')}</div>`);
  };

  return `<div class="av-top">
      ${figure}
      <div class="av-stats">
        <p><b>Level ${esc(String(levelFromXp(USER.xp)))}</b> · ${esc(String(USER.credits || 0))} credits</p>
      </div>
    </div>
    ${line('Skin', swatches('skin', AV_SKIN))}
    ${line('Hair', swatches('hairColour', AV_HAIR))}
    ${line('Shirt', swatches('shirt', AV_SHIRT))}
    ${AV_SLOTS.map(slotLine).join('')}`;
}

/* `on('wardrobe')` WAS HERE — the `Your figure` tile's door, which found the colour page on this column and turned to it. § */

/* A LOOK AS THE CELL HOLDS IT, `skin:2|shirt:4|…` — what `saveAvatar` answers with and `USER.avatar` keeps. */
const packLook_ = cfg => Object.keys(cfg).map(k => k + ':' + cfg[k]).join('|');
/* ---------- THE FIGURE AS IT IS DRAWN, NOT AS THE CELL SAYS IT (the review of docs/history/339) § */
const lookKey_ = (packed, handle) => {
  const c = avatarConfig(packed, handle);
  return Object.keys(c).sort().map(k => k + ':' + c[k]).join('|');
};
/* ---------- HOW MANY LOOKS ARE ON THE WIRE § */
/* ---------- AND ONE AFTER ANOTHER, IN THE ORDER THEY WERE CHOSEN (round 1 of the fixes for docs/history/339) § */
let AV_WIRE = 0;
let AV_LINE = Promise.resolve();
function avatarPost_(cfg) {
  AV_WIRE++;
  const done = () => { AV_WIRE = Math.max(0, AV_WIRE - 1); };
  const body = { action: 'saveAvatar', name: USER.name, personId: USER.personId, avatar: cfg };
  if (USER.token) body.token = USER.token;
  const sent = AV_LINE.then(() => api(body));
  AV_LINE = sent.catch(() => {});
  return sent.then(d => { done(); return d; }, e => { done(); throw e; });
}
/* ---------- EVERY FIGURE ON THE COLUMN, NOT THE FIRST ONE `$()` FINDS § */
/* ---------- THE WHOLE CARD FOLLOWS THE LOOK, NOT ONLY THE FIGURE § */
/* ---------- AND THE PICTURE'S "YOUR FIGURE" WITH IT § */
/* LIFTED OUT OF `avatarSave` (the review of docs/history/339) — a handle the server moved that keeps the face, and a refused
   keep redraw with it too, and two copies of "every figure on the page" would be the fault this note is about. */
function avatarDraw_() {
  const cards = document.querySelectorAll('.av-card');
  cards.forEach(card => { card.innerHTML = wardrobeBody_(); });
  if (!cards.length) document.querySelectorAll('.av-figure').forEach(el => {
    el.innerHTML = avatarFor(USER.handle || USER.name, AV_FIG, USER.avatar);
  });
  document.querySelectorAll('.pfp-opt[data-pic="avatar"]').forEach(b => {
    b.innerHTML = avatarFor(USER.handle || USER.name, 40, USER.avatar || '', { bust: true });
  });
  document.querySelectorAll('.ce-figv').forEach(el => { el.innerHTML = ceFigSay_(); });
  const pic = String((USER.profile && USER.profile.photo) || '').trim();
  if (picKind_(pic) === 'avatar') document.querySelectorAll('.pfp .pfp-face').forEach(f => { f.innerHTML = pfpFace_(pic); });
}

/* A colour and an item go through the SAME request, because to the server they are the same
   thing: a whole look, re-checked piece by piece. Nothing here decides what anybody may wear. */
let AV_SEQ = 0;
function avatarSave(change) {
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  Object.assign(cfg, change);
  /* ---------- AND ONLY THE LATEST TAP'S ANSWER COUNTS § */
  const seq = ++AV_SEQ;

  /* The figure redraws IMMEDIATELY, before the server answers — picking a colour and waiting a
     second to see it is the difference between a wardrobe and a form. Put back if refused. */
  const before = USER.avatar;
  USER.avatar = packLook_(cfg);
  avatarDraw_();

  avatarPost_(cfg)
    .then(d => {
      if (seq !== AV_SEQ) return;
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      /* ---------- A TOAST, BECAUSE THE PAGE NO LONGER HAS A LINE TO WRITE TO § */
      if ((d.bought || []).length) toast('Bought ' + d.bought.join(', '));
      avatarDraw_();
    })
    .catch(err => {
      if (seq !== AV_SEQ) return;
      USER.avatar = before;
      avatarDraw_();
      /* A REFUSAL IS A TOAST. This app decided that once already — see the note on `why_` in
         shell.js — and the line it used to be written to is gone. */
      toast(String(err.message || err));
    });
}

on('av-colour', el => avatarSave({ [el.dataset.field]: Number(el.dataset.value) }));
on('av-pick', el => avatarSave({ [el.dataset.slot]: el.dataset.id }));

/* ---------- MAKING AN ACCOUNT § */
const REG_PIN = /^\d{4,8}$/;
/* ---------- AND A CHILD WITH NO EMAIL OF THEIR OWN § */
/* ---------- AND WHO THE ACCOUNT IS FOR, ASKED FIRST § */
const REG_NOTE = {
  /* "ONCE YOU HAVE OPENED IT", not "once you are in": signing in waits on nothing, but a child waits on
     the parent's address being proved (`confirmFirst_` in people.gs), so the link comes first. */
  parent: 'We email you a link to open. Once you have opened it, find your child\'s handle on Student profiles '
        + 'and tap Add as my child.',
  student: 'We email a link to open. Then sign in with your handle or email and the PIN. A parent '
         + 'can also make your account, on Students.',
};
function registerSheet_() {
  openSheet('Make an account', `
    ${/* ONE ROW WITH THE PHONE'S OWN PICKER, starting on Choose: nothing is answered for anybody. */''}
    <div class="reg-who" id="reg-who" data-who="">
      <p class="reg-cap" id="reg-who-cap">Both are free; teaching starts with "Apply to teach" once you are in.</p>
      <label class="field"><span>who is the account for?</span><select id="reg-who-in" data-do="reg-who" aria-describedby="reg-who-cap">
        <option value="" selected disabled>Choose</option>
        <option value="parent" data-who="parent">Client — I book and pay</option>
        <option value="student" data-who="student">Student — I'm learning</option></select></label>
    </div>
    <div id="reg-rest" hidden>
      ${/* THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured: § */
            ''}
      ${/* THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap outside, or the page reloaded, and they were gone. § */
            ''}
      <div class="f-row" style="--n:2">
        <label class="field"><span>first name</span>
          <input id="reg-first" autocomplete="off"${draftAttr_('reg', 'first')} value="${esc(draftVal_('reg', 'first'))}"></label>
        <label class="field"><span>last name</span>
          <input id="reg-last" autocomplete="off"${draftAttr_('reg', 'last')} value="${esc(draftVal_('reg', 'last'))}"></label>
      </div>
      <label class="field"><span>email</span>
        <input id="reg-email" type="email" inputmode="email" autocomplete="off" autocapitalize="off"
               spellcheck="false" placeholder="you@example.com"${draftAttr_('reg', 'email')} value="${esc(draftVal_('reg', 'email'))}"></label>
      <label class="check reg-kid" hidden><input type="checkbox" id="reg-noemail"><span class="box"></span>
        <span>It's a grown-up's email</span></label>
      <label class="field"><span>PIN — 4 to 8 digits</span>
        <input id="reg-pin" type="password" inputmode="numeric" autocomplete="one-time-code"></label>
      <button class="btn" data-do="reg-send">Make my account</button>
      ${/* THREE LINES AT 320, MEASURED: § */
            ''}
      <p class="faint" id="reg-note" style="margin:.6rem 0 0"></p>
    </div>`);
}
on('register', () => registerSheet_());

/* `regWho_` IS THE ONE READER of the answer, so the send and the redraw cannot disagree about it. */
const regWho_ = () => {
  const w = (($('reg-who') || {}).dataset || {}).who || '';
  return w === 'parent' || w === 'student' ? w : '';
};
on('reg-who', el => {
  const row = $('reg-who');
  if (!row || !el) return;
  /* THE SELECT ON A CHANGE; a check may hand one of its options. */
  const sel = $('reg-who-in'), v = el.tagName === 'OPTION' ? el.value : (el.value || el.dataset.who);
  if (v !== 'parent' && v !== 'student') return;
  const who = v;
  row.dataset.who = who;
  if (sel) sel.value = who;
  const rest = $('reg-rest'); if (rest) rest.hidden = false;
  const tick = $('reg-noemail'), tickRow = tick && tick.closest('.reg-kid');
  if (tickRow) tickRow.hidden = who !== 'student';
  if (tick && who !== 'student') tick.checked = false;
  const note = $('reg-note'); if (note) note.textContent = REG_NOTE[who];
});

on('reg-send', el => {
  const v = id => ((($(id) || {}).value) || '').trim();
  const first = v('reg-first'), last = v('reg-last'), email = v('reg-email'), pin = v('reg-pin');
  const who = regWho_();
  /* A STUDENT'S TICK ONLY. The row is hidden for a parent and unticked when it hides, and this asks
     again rather than trusting that — a parent's address sent as `parent_email` is refused anyway. */
  const kid = who === 'student' && !!($('reg-noemail') || {}).checked;
  /* UNREACHABLE FROM THE SHEET — the button is under the question until it is answered — and said anyway, for a button pressed some other way: § */
  if (!who) { toast('Say who the account is for first — a parent or a student.'); return; }
  if (!first || !last) { toast('Your first and last name, please.'); return; }
  if (email.indexOf('@') < 0) {
    toast(kid ? 'A grown-up\'s email address, please — the link goes to them.'
              : 'An email address, please — the link goes to it.');
    return;
  }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 to 8 digits, and nothing else.'); return; }
  /* THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body` is one of the boxes `send_` knows to lock) and a refusal § */
  const body = { action: 'register', who, first_name: first, last_name: last, pin };
  if (kid) body.parent_email = email; else body.email = email;
  send_(body, { button: el, busy: 'Making it…' })
    .then(d => {
      ['first', 'last', 'email'].forEach(f => { try { draftDrop_('reg', f); } catch (e) {} });
      closeSheet();
      /* THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the email — is sign in with it, and they have just typed it once. § */
      const handle = String((d && d.handle) || '');
      const box = $('in-name'); if (box) box.value = kid && handle ? '@' + handle : email;
      /* NO WAITING ON THE LINK — see the note over `verifyLogin`'s old PENDING refusal in dopost.gs.
         The account works now; the link is said as what it is, a confirmation, not a door. */
      toast(kid ? 'Account made — sign in now as ' + (handle ? '@' + handle : 'your handle')
                  + ' with your PIN. Your grown-up has been sent a link to confirm.'
                : who === 'parent'
                  ? 'Account made — sign in now with your PIN. Open the link we have emailed you before making '
                    + 'your child\'s account.'
                  : 'Account made — sign in now with your PIN. We have also emailed you a link to confirm your address.');
    })
    .catch(() => {});      // `send_` has already said why
});

/* ---------- AND THE LINK IN THAT EMAIL § */
function verifyFromLink_(again) {
  let token = again || '';
  if (!token) try {
    const q = new URLSearchParams(location.search);
    token = (q.get('verify') || '').trim();
    if (!token) return;
    q.delete('verify');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!token) return; }
  /* ---------- `session`: WHO THIS PHONE IS SIGNED IN AS, beside the link's own token § */
  send_({ action: 'verifyEmail', token, session: (USER && USER.token) || '' })
    .then(d => {
      /* ---------- A NEW ADDRESS, MOVED § */
      if (d && d.moved) {
        accountChanged_();
        if (USER) {
          USER.profile = Object.assign({}, USER.profile || {}, { email: String(d.email || ''), email_moving: '' });
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          try { repaint(true); } catch (e) {}
        }
        toast('Your email is ' + (d.email || 'changed') + ' now — sign in with it from here on.');
        return;
      }
      /* A GROWN-UP SAYING YES FOR A CHILD WITH NO EMAIL is told the child's handle, not "sign in
         with it" — the address is theirs, and it signs nobody in for the child. */
      const first = d && d.name ? String(d.name).split(' ')[0] : '';
      if (d && d.noEmail && d.parentPending) {
        /* ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF § */
        const who = first || 'They';
        openSheet('Confirmed — one more step', `
          <p class="sub">${esc(who)} can sign in now${d.handle ? ` as <b>@${esc(d.handle)}</b>` : ''} with
            their PIN.</p>
          <p class="sub"><b>They are not on your account yet.</b> The @family. account on your email has not
            been confirmed, so we did not put ${esc(first || 'them')} on it.</p>
          <p class="sub">Open the "Confirm your @family. account" email we sent you — or sign in and press
            "Send the link again" — then add ${esc(first || 'them')} with "Add your child" on Students.
            They say yes, and they are on your account.</p>
          <p class="faint">Did you never make an account here? Then somebody else did, with your email. Use
            "Forgotten your PIN?" with your email to take it back — it signs them out.</p>
          <button class="btn quiet" data-do="sheet-done">Done</button>`);
        try { if (USER) load(); } catch (e) {}
      } else if (d && d.noEmail) {
        toast('Confirmed — ' + (first || 'they') + ' can sign in now'
              + (d.handle ? ' as @' + d.handle : '') + ' with their PIN'
              + (d.linkedTo ? ', and is on your account.' : '.'));
        try { if (USER) load(); } catch (e) {}
      } else {
        /* ---------- AND YOUR OWN, OPENED ON THE PHONE YOU ARE SIGNED IN ON § */
        const me = !!(USER && d && ((d.handle && d.handle === USER.handle) || (d.name && d.name === USER.name)));
        if (me) {
          /* AND A `myProfile` ASKED BEFORE THIS IS NOT ALLOWED TO PUT IT BACK (`ACCOUNT_AT_`) — measured by round three of the review: § */
          accountChanged_();
          USER.pendingEmail = '';
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          try { repaint(true); } catch (e) {}
        }
        toast('Email confirmed' + (first ? ', ' + first : '')
              + (!me ? ' — now sign in with it and your PIN.'
                 : mayAddChild_() ? ' — you can add your child on Student profiles now.' : '.'));
      }
      /* TO THE SIGN-IN CARD, which is where the next step is. */
      try { if (!USER) go('account'); } catch (e) {}
    })
    /* ---------- "SIGN IN, AND IT WILL FINISH BY ITSELF" § */
    .catch(err => {
      const d = err && err.reply;
      if (!d || d.why !== 'sign-in-first') return;    // `send_` has already toasted the server's sentence
      try { sessionStorage.setItem('familyVerify', token); } catch (e) {}
      try { go('account'); } catch (e) {}
    });
}

/* THE MOMENT SINCE WHICH THE PHONE KNOWS SOMETHING NEWER ABOUT THIS ACCOUNT'S ADDRESS than a `myProfile`
   asked before it — see `profileRefresh_`, which asks again rather than paint an answer older than this. */
let ACCOUNT_AT_ = 0;
function accountChanged_() { ACCOUNT_AT_ = Date.now(); }

/* ---------- WHAT EVERY DOOR IN DOES ONCE IT IS IN § */
function afterSignIn_(d) {
  if (d && (d.childrenHeld || d.pinCleared || d.pinLink || d.moveDropped || d.handleMoved) && d.message) {
    openSheet(d.pinCleared ? 'Your PIN has changed' : d.childrenHeld ? 'Signed in — one thing to know'
              : d.handleMoved ? 'Your handle has changed' : 'Signed in',
      `<p class="sub">${esc(d.message)}</p>
       <button class="btn quiet" data-do="sheet-done">Done</button>`);
  }
  let waiting = '';
  try { waiting = sessionStorage.getItem('familyVerify') || ''; sessionStorage.removeItem('familyVerify'); } catch (e) {}
  if (waiting) verifyFromLink_(waiting);
  /* AND A CARD PAYMENT THAT CAME BACK BEFORE ANYBODY WAS SIGNED IN — see `paidFromLink_`. */
  try { if (sessionStorage.getItem(PAID_KEY_)) paidFromLink_(); } catch (e) {}
}

/* ---------- AND THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL § */
function pinFromLink_() {
  let key = '';
  try {
    const q = new URLSearchParams(location.search);
    key = (q.get('signin') || '').trim();
    if (!key) return;
    q.delete('signin');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!key) return; }
  send_({ action: 'pinLink', key })
    .then(d => {
      if (!d || !d.success) { toast((d && d.error) || 'That link did not work.'); return; }
      /* THE PIN PATH'S DOOR, for its reasons — see `do-signin` and `signedIn_`. */
      signedIn_(d);
    })
    .catch(() => {});      // `send_` has already toasted the server's sentence
}

/* ---------- AND THE WAY BACK FROM STRIPE (430) ----------------------------------------------------
   `createCheckout` sends a card payment back to `?paid=1&ref=…`; `finalizePayment` asks Stripe and writes the Confirm that books it. */
/* KEPT FOR THE VISIT until the server has answered, so a sign-in, a reload or a dropped connection still finishes it. */
const PAID_KEY_ = 'familyPaid';
/* THE REF IN THE AIR — boot and a sign-in landing together ask once. The server's own guard is the Confirm event for the ref. */
let PAID_ASKING_ = '';
function paidFromLink_() {
  let ref = '';
  try {
    const q = new URLSearchParams(location.search);
    const paid = q.get('paid');
    ref = (q.get('ref') || '').trim();
    if (paid !== null || ref) {
      q.delete('paid'); q.delete('ref');
      const rest = q.toString();
      history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      if (paid !== '1' || !ref) { toast('Payment cancelled — nothing was charged. Your booking is still waiting.'); return; }
      try { sessionStorage.setItem(PAID_KEY_, ref); } catch (e) {}
    }
  } catch (e) {}
  if (!ref) try { ref = sessionStorage.getItem(PAID_KEY_) || ''; } catch (e) {}
  if (!ref || PAID_ASKING_ === ref) return;
  if (!USER || !USER.token) {
    toast('Sign in to finish your booking — your payment is safe.');
    try { go('account'); } catch (e) {}
    return;
  }
  /* A CHILD NEVER PAYS (398), so a child's phone does not ask — the parent who paid signs in and it finishes. */
  if (childView_()) { toast('A parent paid for this — they sign in to finish the booking.'); return; }
  PAID_ASKING_ = ref;
  const forget = () => { try { sessionStorage.removeItem(PAID_KEY_); } catch (e) {} };
  api({ action: 'finalizePayment', ref })
    .then(d => {
      PAID_ASKING_ = '';
      /* KEPT: the next sign-in or visit asks again. `api` has already said signed out. */
      if (d && d.why === 'signed-out') return;
      if (d && d.why === 'busy') { toast(d.error || 'Busy — open the site again in a moment to finish.'); return; }
      if (!d || !d.success) {
        forget();
        toast('Payment not confirmed — ' + ((d && d.error) || 'the server did not say why') + ' Nothing was booked.');
        return;
      }
      forget();
      toast(d.alreadyDone ? 'Payment already received — you\'re booked' : 'Payment received — you\'re booked');
      const open = () => { if (!(d.jobId && openJob_(d.jobId, true))) go('booking'); };
      load().then(open, open);
    })
    .catch(err => { PAID_ASKING_ = ''; toast(why_(err) + ' Your payment is safe — open the site again to finish booking.'); });
}

/* ---------- FRIENDS § */
const friendHandles = () =>
  String((USER && USER.friends) || '').split(',').map(x => x.trim()).filter(Boolean);

/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question with an end, which is what a sheet is for. § */
function friendsSheet() {
  openSheet('Add a friend', `
    <label class="field"><span>their handle</span>
      <input id="fr-add" placeholder="as it is on their card" autocomplete="off"></label>
    <button class="btn" data-do="friend-add">Add</button>
    <p class="faint" id="fr-said" style="margin:.6rem 0 0">
      Exactly as they have it. A search that guesses adds the wrong person, and the wrong person is
      harder to notice than nobody — they simply appear on a list you scroll past.</p>`);
}
/* `on('friends')` WAS HERE and nothing on any screen carried `data-do="friends"`. § */

on('friend-add', () => {
  const box = $('fr-add'), said = $('fr-said');
  const want = ((box && box.value) || '').trim();
  if (!want) { box && box.focus(); return; }
  /* EXACT, and it has to be. A search that guesses adds the wrong person, and the wrong person is
     harder to notice than nobody — they simply appear on a list somebody scrolls past. */
  /* NOT ON THE PHONE IS NOT NOBODY (386): a child is sent only siblings and friends, so the server says whether the handle is a child's. */
  const found = (DATA.students || []).find(s2 => norm(s2.handle) === norm(want)) || { handle: want.replace(/^@/, '') };
  if (norm(found.handle) === norm(USER.handle)) {
    if (said) said.textContent = 'That is you.'; return;
  }
  const list = friendHandles();
  if (list.some(h => norm(h) === norm(found.handle))) {
    if (said) said.textContent = found.handle + ' is already on your list.'; return;
  }
  friendsSave(list.concat([found.handle]), said);
  closeSheet();
  toast('Added ' + found.handle);
});

on('friend-drop', el => friendsSave(
  friendHandles().filter(h => norm(h) !== norm(el.dataset.handle)), $('fr-said')));

/* Adding one from the Find browse page, where the list is. */
on('friend-add-open', () => friendsSheet());

/* EVERY FINDER'S FOUND LIST FORGOTTEN, AND THE FINDER IN FRONT DRAWN — `typeof`, because find.js loads
   after this file. */
function friendsForget_() {
  if (typeof finderForgetFound_ === 'function') finderForgetFound_(); else FIND_MEMO.key = null;
  if (typeof finderOf_ === 'function' ? finderOf_(AT) : AT === 'stuff') {
    if (typeof paintFinder_ === 'function') paintFinder_(AT); else paintStuff();
  }
}
/* Written on the phone first, then sent — and the sheet redrawn either way, so removing somebody
   is visible before the round trip and put back if it fails. */
function friendsSave(list, said) {
  const before = USER.friends;
  /* A `myProfile` ASKED BEFORE THIS IS ABOUT THE LIST BEFORE IT (342) — it carries `friends` now, and landing after this it would put the old list back § */
  accountChanged_();
  USER.friends = list.join(', ');
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  /* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told, or it serves the list from before the change. § */
  friendsForget_();
  api({ action: 'saveFriends', name: USER.name, personId: USER.personId, friends: USER.friends })
    .then(d => { if (d && d.error) throw new Error(d.error); accountChanged_(); })
    .catch(err => {
      USER.friends = before;
      friendsForget_();
      const el = $('fr-said');
      if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      else toast(String(err.message || 'Not saved — no connection.'));
    });
}

/* ---------- MESSAGES § */
/* THE LIST, drawn into the widget's own space. The same markup the sheet used, so a message looks
   the same whichever way somebody reached it. */
/* WHERE MESSAGES COME FROM. § */
let MESSAGES = null;
/* ---------- WHETHER THE LAST ANSWER WAS ONE § */
let MSG_FAILED = false;

/* ---------- ONE REQUEST AT A TIME, AND ONLY FOR WHOEVER ASKED § */
let MSG_ASKING = null;
function loadMessages() {
  if (!USER) return Promise.resolve([]);
  const who = String(USER.personId || USER.name || '');
  if (MSG_ASKING && MSG_ASKING.who === who) return MSG_ASKING.p;
  const still = () => !!USER && String(USER.personId || USER.name || '') === who;
  /* `send` FOR THE SAME REASON, and the comment below was written as though it already did. § */
  const asking = { who: who, p: null };
  asking.p = send({ action: 'messages', name: USER.name, personId: USER.personId })
    .then(d => {
      if (!still()) return [];
      MSG_FAILED = false;
      return (MESSAGES = (d && d.messages) || []);
    })
    /* A failure leaves whatever was already there rather than emptying the list — an unreachable backend is not the same fact as an empty inbox, and showing the § */
    .catch(() => { if (!still()) return []; MSG_FAILED = true; return MESSAGES || []; })
    .then(v => { if (MSG_ASKING === asking) MSG_ASKING = null; return v; });
  MSG_ASKING = asking;
  return asking.p;
}

/* WRITING ONE — THE HALF THAT HAS NEVER EXISTED. § */
/* THE SHEET IS THE SAME FORM IN A SHEET. § */
function messageSheet(to, toId) {
  openSheet('Message ' + to, msgForm_(to, toId,
    'One message every five minutes. It goes to their e-mail and appears in Messages for both '
  + 'of you.', 5));
}

on('msg-open', el => messageSheet(el.dataset.to, el.dataset.id));

/* ---------- SENDING, OPTIMISTICALLY § */
let MSG_PENDING = [];
let MSG_SEQ = 0;
/* What is queued to go with the next message, per conversation. Held here rather than in the DOM so a
   repaint — the poll, a sign-in — does not drop somebody's chosen photographs. */
const MSG_QUEUE = {};

/* THE CAPS, IN BYTES, AND THE SERVER HOLDS THE SAME ONES (`MSG_FILE_MAX`, `MSG_FILES_MAX` and `MSG_FILES_COUNT` in content.gs). § */
const MSG_CAP_ = { file: 20 * 1048576, total: 32 * 1048576, count: 6 };

const msgKey_ = (to, toId) => String(toId || to || '');
const msgMB_ = n => (n / 1048576).toFixed(n < 10 * 1048576 ? 1 : 0) + 'MB';

/* A photograph over a couple of megabytes is redrawn through `camItemOf_` — the same 1600px the camera uses — because a camera roll's original is four megabytes § */
function msgRead_(q) {
  const f = q.file;
  const asIs = () => new Promise(done => {
    const r = new FileReader();
    r.onload = () => done({ name: f.name || 'file', type: f.type || 'application/octet-stream',
                            data: String(r.result || '') });
    r.onerror = () => done(null);
    try { r.readAsDataURL(f); } catch (e) { done(null); }
  });
  /* EVERY PHOTOGRAPH, NOT ONLY ONE OVER 2MB (413): a message's picture is drawn inline at phone width, and 1600px is plenty. */
  if (/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && typeof camItemOf_ === 'function') {
    return camItemOf_(f).then(it => it && it.data
      ? { name: String(f.name || 'photo').replace(/\.\w+$/, '') + '.jpg', type: 'image/jpeg', data: it.data }
      : asIs(), asIs);
  }
  return asIs();
}

function msgQueueHtml_(key) {
  const q = MSG_QUEUE[key] || [];
  return q.map((a, i) => `<span class="msg-chip">${
      /^image\//.test(a.type) ? `<img src="${esc(a.url)}" alt="" decoding="async">` : `<b>${esc(msgFileMark_(a))}</b>`}
    <span class="msg-chip-name">${esc(a.name)}</span>
    <button class="msg-chip-x" data-do="msg-unqueue" data-k="${esc(key)}" data-i="${i}"
      aria-label="Remove ${esc(a.name)}">×</button></span>`).join('');
}
function msgQueueDraw_(form) {
  const key = form && form.dataset.k;
  const box = form && form.querySelector('.msg-queue');
  if (box) box.innerHTML = msgQueueHtml_(key);
}

/* The file picker answers with `change`, which the `data-do` dispatcher does not listen for. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.msg-file-in')) return;
  const form = inp.closest('.msg-form');
  const key = form && form.dataset.k;
  if (!key) return;
  const q = MSG_QUEUE[key] = MSG_QUEUE[key] || [];
  [].slice.call(inp.files || []).forEach(f => {
    const total = q.reduce((n, a) => n + a.size, 0);
    if (q.length >= MSG_CAP_.count) { toast('Up to ' + MSG_CAP_.count + ' files in one message.'); return; }
    /* A CLIP IS TOLD HOW TO FIT. § */
    if (f.size > MSG_CAP_.file) {
      toast(f.name + ' is ' + msgMB_(f.size) + ' — over the 20MB a file can be.'
        + (msgKind_(f) === 'video' ? ' Trim the clip to about 20 seconds and choose it again.' : ''));
      return;
    }
    if (total + f.size > MSG_CAP_.total) { toast('That would be over 32MB in one message — send it on its own.'); return; }
    q.push({ file: f, name: f.name || 'file', type: f.type || '', size: f.size,
             url: URL.createObjectURL(f) });
  });
  inp.value = '';
  msgQueueDraw_(form);
});

on('msg-attach', el => {
  const inp = el.closest('.msg-form') && el.closest('.msg-form').querySelector('.msg-file-in');
  if (inp) inp.click();
});
on('msg-unqueue', el => {
  const q = MSG_QUEUE[el.dataset.k] || [];
  const gone = q.splice(+el.dataset.i, 1)[0];
  if (gone) { try { URL.revokeObjectURL(gone.url); } catch (e) {} }
  msgQueueDraw_(el.closest('.msg-form'));
});

/* THE COMPOSER GROWS WITH WHAT IS TYPED. `field-sizing: content` does this in Chromium and nowhere
   else, and Safari is where most of these messages are written. Capped by the stylesheet's own
   `max-height`, after which it scrolls. */
document.addEventListener('input', e => {
  const b = e.target;
  if (!b || !b.matches || !b.matches('.msg-text')) return;
  b.style.height = 'auto';
  b.style.height = b.scrollHeight + 2 + 'px';
});
/* ENTER SENDS ON A KEYBOARD AND NEVER ON A PHONE. § */
document.addEventListener('keydown', e => {
  const b = e.target;
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !b || !b.matches || !b.matches('.msg-text')) return;
  if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  const go = b.closest('.msg-form') && b.closest('.msg-form').querySelector('.msg-go');
  if (go) { e.preventDefault(); go.click(); }
});

function msgPost_(p) {
  p.state = 'sending'; p.err = ''; p.why = '';
  /* SENT, SO NOT A DRAFT ON ANY OTHER PAGE — a reload while the server is still answering drew these
     words back in the composer, after the server had them, for a second Send (`draftSent_`, data.js). */
  try { if (typeof draftSent_ === 'function') draftSent_('msg', p.withId, p.body); } catch (e) {}
  const files = p.queue.length ? Promise.all(p.queue.map(msgRead_)) : Promise.resolve([]);
  return files.then(read => {
    /* ---------- A FILE THAT COULD NOT BE READ IS NEVER LEFT OUT IN SILENCE § */
    const lost = p.queue.filter((q, i) => !read[i]);
    const list = read.filter(Boolean);
    if (lost.length) {
      const names = lost.map(q => q.name).join(', ');
      if (!list.length && !p.body) throw new Error(names + ' could not be read on this phone.');
      p.queue = p.queue.filter((q, i) => read[i]);
      p.attachments = (p.attachments || []).filter((a, i) => read[i]);
      MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(lost);
      toast(names + ' could not be read, so ' + (lost.length === 1 ? 'it is' : 'they are')
        + ' back in the box — the rest is going.');
    }
    return send({ action: 'sendMessage', name: USER.name, personId: USER.personId,
                  to: p.withName, toId: p.withId, body: p.body, files: list });
  }).then(d => {
    p.state = 'sent'; p.id = (d && d.id) || '';
    /* THE SERVER HAS IT, SO THE DRAFT GOES — unless the box has been written in again since Send. */
    try { if (typeof draftSentDone_ === 'function') draftSentDone_('msg', p.withId, p.body); } catch (e) {}
    toast(p.inSheet ? 'Sent to ' + p.withName : 'Sent');
    return loadMessages().then(() => {
      if (!MSG_FAILED) {
        MSG_PENDING = MSG_PENDING.filter(x => x !== p);
        p.queue.forEach(a => { try { URL.revokeObjectURL(a.url); } catch (e) {} });
      }
    });
  }).catch(err => {
    p.state = 'failed';
    /* NOT SENT, SO A DRAFT AGAIN — kept for a reload, as the bubble keeps it for this page. */
    try { if (typeof draftSentBack_ === 'function') draftSentBack_('msg', p.withId, p.body); } catch (e) {}
    /* The server's sentence says what to do — "one message every five minutes — 3 to go" — so it is
       what is shown, rather than a "Not sent" that throws that away. */
    p.err = String((err && err.message) || 'Not sent.');
    /* `why: 'files'` — the server refused the PHOTOGRAPHS, not the message, so the bubble can offer
       the words on their own. Read off the reply `send()` hangs on the error, never off the wording. */
    p.why = String((err && err.reply && err.reply.why) || '');
    if (p.inSheet) toast(p.err);
  }).then(() => dmRedraw_(p.withId || p.withName));
}

/* Repaint the column and stay on the conversation somebody is in. § */
function dmRedraw_(key) {
  if (typeof paint !== 'function' || !$('s-dm')) return;
  paint('dm');
  const at = messageThreads_().findIndex(t => t.id === key);
  /* ONE MORE THAN THE THREAD: Daive is page 0 (449). */
  if (at >= 0 && typeof goPage === 'function' && AT === 'dm') { try { goPage('dm', at + 1, true); } catch (e) {} }
  setTimeout(() => { if (typeof dmFoot_ === 'function') dmFoot_(); }, 0);
}

on('msg-send', el => {
  /* THE NEAREST FORM, not an id: the Messages column draws one composer per conversation, and an id
     would hand every Send button the first box on the page — a reply posted to somebody else. */
  const form = el.closest ? el.closest('.msg-form') : null;
  const box  = form ? form.querySelector('.msg-text') : null;
  const said = form ? form.querySelector('.msg-said') : null;
  const text = ((box && box.value) || '').trim();
  const key  = msgKey_(el.dataset.to, el.dataset.id);
  const queue = (MSG_QUEUE[key] || []).slice();
  if (!text && !queue.length) { box && box.focus(); return; }
  if (!USER) { if (said) said.textContent = 'Sign in first.'; return; }
  if (text.length > 2000) { toast('That is longer than a message should be — 2,000 characters.'); return; }

  const p = {
    tmp: 'tmp' + (++MSG_SEQ), mine: true, read: true, state: 'sending',
    withId: el.dataset.id || el.dataset.to, withName: el.dataset.to,
    fromName: USER.name, body: text, atMs: Date.now(), at: '',
    attachments: queue.map(a => ({ url: a.url, type: a.type, name: a.name })),
    queue: queue, inSheet: !!(form && form.closest('#sheet')),
  };
  MSG_PENDING.push(p);
  delete MSG_QUEUE[key];
  if (box) { box.value = ''; box.style.height = ''; }
  if (p.inSheet) { closeSheet(); toast('Sending to ' + p.withName + '…'); }
  dmRedraw_(p.withId);
  msgPost_(p);
});

on('msg-retry', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  p.state = 'sending'; p.err = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
/* ---------- THE WORDS WITHOUT THE PHOTOGRAPHS § */
on('msg-words', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p || !p.body) return;
  if (p.queue.length) MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(p.queue);
  p.queue = []; p.attachments = [];
  p.state = 'sending'; p.err = ''; p.why = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
on('msg-drop', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  MSG_PENDING = MSG_PENDING.filter(x => x !== p);
  /* What was typed and chosen goes back in the composer rather than being thrown away with the
     bubble — Remove is "I will write it differently", not "I did not mean any of it". */
  const key = p.withId;
  if (p.queue.length) MSG_QUEUE[key] = (MSG_QUEUE[key] || []).concat(p.queue);
  dmRedraw_(key);
  if (p.body) setTimeout(() => {
    const host = $('s-dm');
    const box = host && [].slice.call(host.querySelectorAll('.msg-form'))
      .filter(f => f.dataset.k === key).map(f => f.querySelector('.msg-text'))[0];
    if (box && !box.value) box.value = p.body;
  }, 0);
});

/* REPORTING A MESSAGE (413) is `suggestTile_` and its box in submit.js since 486; the email to the admin is the backend's. */

/* ---------- AND MARKING THEM READ, WHICH NOTHING HAS EVER DONE § */
function markRead_(msgs) {
  if (!USER) return;
  (msgs || []).filter(m => m && !m.mine && !m.read && m.id).forEach(m => {
    m.read = true;                                   /* so a redraw before the reply does not re-ask */
    /* ---------- AND WHICH ONES THEY WERE STAYS ON THE SCREEN § */
    m.fresh = true;
    api({ action: 'readMessage', name: USER.name, personId: USER.personId, messageId: m.id })
      .catch(() => { m.read = false; });
  });
}

/* THE EMPTY INBOX SAYS HOW TO START ONE. § */
const emptyMessages_ = `<p class="empty">Nothing yet.<br><span class="faint">To write to a tutor,
     open their card and press Message.</span></p>`;

/* ---------- ONE THREAD PER PERSON § */
/* When a message was sent, as a number: § */
function msgTime_(m) {
  if (m && m.atMs) return m.atMs;
  const d = typeof parseWhen === 'function' ? parseWhen(m && m.at) : null;
  return d && !isNaN(d) ? d.getTime() : 0;
}
function messageThreads_() {
  const by = {};
  (MESSAGES || []).concat(MSG_PENDING).forEach(m => {
    const k = m.withId || m.withName || '?';
    (by[k] = by[k] || { id: k, name: m.withName || 'Someone', msgs: [] }).msgs.push(m);
  });
  const out = Object.keys(by).map(k => by[k]);
  out.forEach(t => {
    /* STABLE BY TIME, and a pending bubble always last — it is the newest thing in the thread even
       when the server's clock and this phone's disagree by a minute. */
    t.msgs.sort((a, b) => (!!a.tmp - !!b.tmp) || (msgTime_(a) - msgTime_(b)));
    t.unread = t.msgs.filter(m => !m.mine && !m.read).length;
    t.last = t.msgs[t.msgs.length - 1];
  });
  return out.sort((a, b) => msgTime_(b.last) - msgTime_(a.last));
}

/* ---------- THREADS AS WIDGETS WERE HERE, AND THEY PUT CHAT IN TOOLS § */

/* `fillMessages` WAS HERE — it filled the single `#msg-body` on `You` with every message at once.
   `fillThread_` above replaces it, one conversation at a time, into the widget that asked. */

/* ---------- ONE RENDERER, AND IT DREW A LOG RATHER THAN A CONVERSATION § */
/* ---------- A DAY, AND A TIME § */
function msgDay_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const gap = Math.round((day(now) - day(d)) / 864e5);
  if (gap === 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  const opt = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opt.year = 'numeric';
  try { return d.toLocaleDateString('en-GB', opt); } catch (e) { return d.toDateString(); }
}
function msgClock_(ms, raw) {
  if (!ms) return String(raw || '');
  const d = new Date(ms);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/* ---------- PICTURE, CLIP OR FILE: THE TYPE, AND THE NAME WHEN THERE IS NO TYPE § */
function msgKind_(a) {
  const t = String((a && a.type) || '').toLowerCase();
  if (/^image\//.test(t)) return 'image';
  if (/^video\//.test(t)) return 'video';
  if (t && t !== 'application/octet-stream') return 'file';
  const ext = (String((a && a.name) || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';
  if (/^(jpe?g|png|gif|webp|heic|heif)$/.test(ext)) return 'image';
  if (/^(mov|mp4|m4v|webm|3gp)$/.test(ext)) return 'video';
  return 'file';
}

/* A FILE'S MARK — its extension, because "PDF" and "DOCX" say more than any one icon would. */
function msgFileMark_(a) {
  const ext = (String(a.name || '').match(/\.(\w{1,5})$/) || [])[1];
  return ext ? ext.toUpperCase() : (String(a.type || '').split('/')[1] || 'FILE').slice(0, 4).toUpperCase();
}

/* ---------- WHAT WAS SENT WITH IT § */
function msgAttachHtml_(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="msg-att">${list.map(a => {
    const url = String(a.url || '');
    const kind = msgKind_(a);
    if (kind === 'image') {
      return `<a class="msg-pic" href="${esc(url)}" target="_blank" rel="noopener"
        aria-label="Open ${esc(a.name || 'the photo')}">
        <img src="${esc(pic(url))}" alt="${esc(a.name || 'photo')}" loading="lazy" decoding="async"></a>`;
    }
    if (kind === 'video') {
      return `<video class="msg-vid post-vid" src="${esc(/^blob:/.test(url) ? url : postVidSrc_(url))}"
        data-open="${esc(url)}" controls playsinline preload="metadata"></video>`;
    }
    return `<a class="msg-file" href="${esc(url)}" target="_blank" rel="noopener">
      <b>${esc(msgFileMark_(a))}</b><span>${esc(a.name || 'a file')}</span></a>`;
  }).join('')}</div>`;
}

/* ---------- AN ADMIN'S REFUSAL CARRIES THE FIX, AND THE FIX IS AN ADDRESS § */
function msgFixUrls_(text) {
  return (String(text || '').match(/https?:\/\/[^\s<>]+/g) || [])
    .map(u => u.replace(/[.,;:)]+$/, ''))
    /* A SCOPE IS NAMED BY WHERE IT STARTS, not by containing the words: the consent screen's own
       address carries `scope=https://www.googleapis.com/auth/drive` in its query. */
    .filter(u => /^https:\/\//.test(u) && !/^https:\/\/www\.googleapis\.com\/auth\//.test(u))
    .slice(0, 2);
}
function msgFixLinks_(text) {
  return msgFixUrls_(text).map(u => `<a class="msg-act" href="${esc(u)}" target="_blank" rel="noopener">${
    /\?setup=1/.test(u) ? 'Open ?setup=1' : /accounts\.google\.com/.test(u) ? 'Allow it' : 'Open the link'}</a>`)
    .join('');
}
/* AND THE SENTENCE WITHOUT THEM. § */
function msgFailSaid_(text) {
  let t = String(text || '');
  msgFixUrls_(t).forEach(u => {
    t = t.split('\n').filter(line => {
      const at = line.indexOf(u);
      return !(at > 0 && /^[^:]{1,40}:\s*$/.test(line.slice(0, at)) && !line.slice(at + u.length).trim());
    }).join('\n').split(u).join('the button below');
  });
  return t.trim();
}

/* ---------- THE THREAD § */
const messagesHtml_ = ms => {
  let lastDay = '';
  return (ms || []).map((m, i, all) => {
    const mine = !!m.mine;
    const t = msgTime_(m);
    const dayWord = msgDay_(t);
    const newDay = dayWord && dayWord !== lastDay;
    if (dayWord) lastDay = dayWord;
    const prev = all[i - 1], next = all[i + 1];
    const nextDay = next ? msgDay_(msgTime_(next)) : '';
    const runTop = newDay || !prev || !!prev.mine !== mine;
    const runEnd = !next || !!next.mine !== mine || (nextDay && nextDay !== dayWord)
                || !!m.tmp !== !!next.tmp;
    const words = String(m.body || '').trim();
    const state = m.state === 'failed'
      ? `<p class="msg-when msg-fail"><span class="msg-fail-why">Not sent — ${esc(msgFailSaid_(m.err) || 'try again')}</span>
           <button class="msg-act" data-do="msg-retry" data-k="${esc(m.tmp)}">Retry</button>${
           m.why === 'files' && words && (m.queue || []).length
             ? `<button class="msg-act" data-do="msg-words" data-k="${esc(m.tmp)}">Words only</button>` : ''}
           <button class="msg-act" data-do="msg-drop" data-k="${esc(m.tmp)}">Remove</button>${
           msgFixLinks_(m.err)}</p>`
      : m.state === 'sending' ? `<p class="faint msg-when">sending…</p>`
      : m.tmp ? `<p class="faint msg-when">sent</p>` : '';
    return `${newDay ? `<p class="msg-day"><span>${esc(dayWord)}</span></p>` : ''}
      <div class="msg${mine ? ' mine' : ''}${runTop ? ' run-top' : ''}${
        runEnd ? ' run-end' : ''}${!mine && (!m.read || m.fresh) ? ' unread' : ''}${
        m.state ? ' is-' + m.state : ''}">
      ${/* A MESSAGE YOU WERE SENT CAN BE REPORTED (413) — beside its bubble, for a child as much as anybody (`suggestTile_`, 486). */''}
      ${!mine && m.id && !m.tmp ? '<div class="msg-line">' : ''}<div class="msg-bub${words ? '' : ' is-bare'}">${msgAttachHtml_(m.attachments)}${
        words ? `<p class="msg-body-text">${mark(words)}</p>` : ''}</div>${!mine && m.id && !m.tmp
        ? suggestTile_('message', m.id, 'Message from ' + (m.fromName || m.withName || 'someone'), 'msg-flag') + '</div>' : ''}
      ${state || (runEnd ? `<p class="faint msg-when">${esc(mine ? 'you' : (m.fromName || 'them'))} · ${
        esc(msgClock_(t, m.at))}</p>` : '')}
    </div>`;
  }).join('');
};

/* ---------- THE COMPOSER, ONCE, WHEREVER IT IS WANTED § */
/* ---------- WHAT IS HALF WRITTEN SURVIVES A RELOAD (docs/history/317) § */
function msgDraft_(k) {
  if (typeof draftVal_ !== 'function') return '';
  const d = draftVal_('msg', k, '');
  return d && MSG_PENDING.some(p => p.withId === k && p.body === d.trim()) ? '' : d;
}
function msgForm_(to, toId, note, rows) {
  const k = msgKey_(to, toId);
  return `<div class="msg-form" data-k="${esc(k)}">
    <div class="msg-queue">${msgQueueHtml_(k)}</div>
    ${/* A CHILD SENDS WORDS ONLY (413) — no picker, and `sendMessage` refuses their files too. */
      rankAtLeast_('client') ? `<button class="btn quiet msg-clip" data-do="msg-attach"
      aria-label="Attach a photo, video or file">＋</button>
    <input type="file" class="msg-file-in" multiple hidden aria-label="Choose files to send">` : ''}
    <textarea class="msg-text" rows="${rows || 1}" maxlength="2000"
      placeholder="Message…" aria-label="Message ${esc(to)}"${draftAttr_('msg', k)}>${esc(msgDraft_(k))}</textarea>
    <button class="btn msg-go" data-do="msg-send"
      data-to="${esc(to)}" data-id="${esc(toId || '')}">Send</button>
    <p class="faint msg-said">${esc(note || '')}</p>
  </div>`;
}

/* ---------- CHECK UPLOADS: THE ADMIN'S ANSWER TO "CAN A PHOTO BE SENT YET" § */
let UPLOADS_SAID = null;

function uploadsHtml_(d) {
  const tile = `<div class="tile-row">${tile_({ icon: 'tick', label: 'Check uploads', note: 'nothing kept',
    act: 'uploads-check', tone: 'admin' })}</div>`;
  if (!d) {
    return tile + `<p class="faint up-said">Whether a photo or a clip sent in a message can be kept:
      the Ledger's column, the Drive folder and what this deployment may do. One test file is made,
      shared and binned.</p>`;
  }
  if (d.error) return tile + `<p class="up-said up-bad">${esc(d.error)}</p>`;
  const rows = (d.checks || []).map(c => `<li class="up-row ${c.ok ? 'is-ok' : 'is-bad'}">
      <b class="up-mark" role="img" aria-label="${c.ok ? 'yes' : 'no'}">${c.ok ? '✓' : '✗'}</b>
      <span><span class="up-k">${esc(c.label)}</span>
      <span class="up-v">${esc(c.said)}</span></span></li>`).join('');
  const steps = (d.steps || []).map(st => `<li>${esc(st.text)}</li>`).join('');
  /* THE ADDRESSES A STEP NEEDS ARE TILES UNDER THE LIST, not links in its sentence — a link in a line of 0.78rem type is a 14px target, and a tile is 44px from the § */
  const go = (d.steps || []).map(st => {
    const href = String(st.href || (st.setup && typeof API === 'string' ? API + '?setup=1' : ''));
    return href ? tile_({ icon: 'open', href: href,
      label: st.setup ? 'Open ?setup=1' : 'Allow it', note: st.setup ? 'adds the column' : 'consent' }) : '';
  }).filter(Boolean).join('');
  return tile + `<ul class="up-list">${rows}</ul>
    <p class="up-said ${d.ok ? 'up-good' : 'up-bad'}">${d.ok
      ? 'Ready — photos, videos and files can be sent in messages.'
      : 'Not yet. In this order:'}</p>
    ${steps ? `<ol class="up-steps">${steps}</ol>` : ''}
    ${go ? `<div class="tile-row">${go}</div>` : ''}
    <p class="faint up-ver">backend ${esc(d.version || '—')}</p>`;
}

/* EVERY `.up-box` ON THE PAGE — a class rather than the id alone, for the reason `cart-box` gives:
   two copies of one widget under one id is the `$('msg-text')` fault. */
function uploadsPaint_() {
  document.querySelectorAll('.up-box').forEach(b => { b.innerHTML = uploadsHtml_(UPLOADS_SAID); });
  /* A CARD THAT GREW IS PLACED AGAIN — "every grower in the app already calls this", in the note over `paneWatch_`. § */
  if (typeof placeCells === 'function' && (AT === 'tools' || AT === 'saved')) {
    try { placeCells('y', true, 0, AT); } catch (e) {}
  }
}

on('uploads-check', el => {
  if (!isAdmin()) return;
  /* NOT DEPLOYED YET IS THE FIRST ANSWER, and the commonest one on the day this ships: § */
  const f = (DATA && DATA.features) || [];
  if (f.length && f.indexOf('checkUploads') < 0) {
    UPLOADS_SAID = { error: 'The live backend is ' + (DATA.version || 'an older version') + ' and has no '
      + 'Check uploads yet. Sync backend/ from GitHub, then Deploy → Manage deployments → New version.' };
    uploadsPaint_();
    return;
  }
  const box = el.closest('.up-box');
  send_({ action: 'checkUploads', name: USER.name, personId: USER.personId },
        { button: el, where: box && box.querySelector('.up-said') })
    .then(d => { UPLOADS_SAID = d; uploadsPaint_(); })
    .catch(err => { UPLOADS_SAID = { error: String((err && err.message) || err) }; uploadsPaint_(); });
});

/* `on('messages')` was here — a second way to see the same thread, opened in a sheet. § */


/* ---------- YOUR OWN DETAILS § */
/* ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU § */
/* ---------- THE ANSWER HALF HAD NO DOOR EITHER, UNTIL THE ACCOUNT COLUMN DREW IT § */
function claimCard_(c) {
  return `<div class="card">
    <h3>${esc(c.from)} says they are your parent</h3>
    <p class="sub">Say yes and they will be able to book sessions for you and see how you are
      getting on. Say no and nothing happens.</p>
    <div class="btn-row">
      <button class="btn" data-do="claim-yes" data-row="${esc(c.rowIndex)}">Yes</button>
      <button class="btn quiet" data-do="claim-no" data-row="${esc(c.rowIndex)}">No</button>
    </div>
  </div>`;
}

/* WHO MAY ASK — the same test the tile carried, kept in one place so the card and its handler
   cannot disagree about it. */
function mayAddChild_() {
  const held = typeof heldRoles === 'function' ? heldRoles() : [];
  return held.indexOf('client') !== -1 || held.indexOf('parent') !== -1 || held.indexOf('admin') !== -1;
}

/* LINKING A CHILD WHO HAS AN ACCOUNT moved to the People column (442): search their handle, then the
   card's "Add as my child" tile. This section only points there. */
function kidAddSec_() {
  return `<div class="kid-sec kid-add">
    <h4 class="kid-h">Add your child</h4>
    <p class="sub">Your child makes their own account (Make an account). Then search their handle at the top of
      ${esc(tabLabel_('students', 'Student profiles'))} and tap Add as my child on their card. They say yes before anything is linked.</p>
  </div>`;
}

/* THE SIGN-IN SLIP — the same paper wherever a handle and a PIN are handed to somebody: here, and in
   the New PIN sheet. Paper, so `--paper` and `--paper-ink`, never a literal. */
function pinSlip_(first, handle, pin) {
  return `<div class="pin-slip" aria-live="polite">
    <p class="pin-slip-k">${esc(first || 'They')} signs in with</p>
    <p class="pin-slip-v">@${esc(handle)}</p>
    <p class="pin-slip-k">and the PIN</p>
    <p class="pin-slip-v">${esc(pin)}</p>
  </div>`;
}

/* THE MAKE FORM WAS HERE — the owner (461): "making a child's account shouldn't be a thing". */

/* ---------- AN ADDRESS NOBODY HAS PROVED: THE MAIL IT IS NOT SENT, AND THE CHILD IT CANNOT HOLD YET § */
function pendingAddr_() { return (USER && USER.pendingEmail) ? String(USER.pendingEmail) : ''; }

/* A TILE, because the link is a thing about your account, not a field on a form (CLAUDE.md). The same
   tile in both places, so a fix to its words is one fix. `send` is the mark that means the act. */
function resendTile_() {
  return tile_({ icon: 'send', label: 'Send the link again', note: 'to confirm your email', act: 'resend-link' });
}

/* ONE PARAGRAPH UNDER THE ROW — the house rule for a warning a tile has no room for. The address is in
   it: when it is a typo, the address is the whole of what is wrong, and the only place it shows. */
function mailHeldNote_() {
  const at = pendingAddr_();
  /* `overflow-wrap:anywhere` ON THE ADDRESS: it is one word with no space in it, and a long one at 320
     took the card sideways — the fault the dotted answer line paid for (check/states.js). */
  return at ? `<p class="faint mail-held" style="margin:.6rem 0 0">We will email you once you open the link
    we sent to <b style="overflow-wrap:anywhere">${esc(at)}</b>.</p>` : '';
}

/* ---------- A NEW ADDRESS WAITING TO BE PROVED, ON THE CARD IT WAS TYPED ON § */
function movingNote_(p) {
  const to = p && p.email_moving ? String(p.email_moving) : '';
  if (!to) return '';
  const was = String((p && p.email) || '');
  return `<p class="faint mail-moving" style="margin:.6rem 0 0">Your email changes to
    <b style="overflow-wrap:anywhere">${esc(to)}</b> once you open the link we sent there, on a phone where you
    are signed in.${was ? ` Until then it is still <b style="overflow-wrap:anywhere">${esc(was)}</b> — sign in
    with that, or your handle. Type it back here to keep it.` : ''}</p>`;
}

/* WHERE THE TWO FORMS WOULD BE, for a parent whose address is still PENDING. § */
function kidHeldSec_() {
  return `<div class="kid-sec kid-held">
    <h4 class="kid-h">Add your child</h4>
    <p class="sub">Open the link we emailed to <b style="overflow-wrap:anywhere">${esc(pendingAddr_())}</b>
      first, then you can add your child.</p>
    <div class="tile-row">${resendTile_()}</div>
  </div>`;
}

/* ---------- MANAGE YOUR CHILD: ONE CARD (docs/history/339) § */
function kidsLinked_() {
  const me = String((USER && USER.personId) || '');
  const mine = !!(me && DATA.familyFor && String(DATA.familyFor) === me);
  return (mine && Array.isArray(DATA.family) ? DATA.family : [])
    .filter(f => f && f.personId && f.title && f.relation === 'child' && String(f.personId) !== me);
}
function kidListSec_(held) {
  const kids = kidsLinked_();
  /* NOT "NONE" WHILE THE PAYLOAD IS COMING — the family arrives with it, and "no child is linked" over a
     list that is a moment away is the `nothingHere` fault. The one loader (`loading_`) until it lands. */
  if (!kids.length) {
    return `<div class="kid-sec kid-list">${typeof awaiting_ === 'function' && awaiting_() ? loading_()
      : `<p class="faint kid-none">No child is linked to you yet.</p>`}</div>`;
  }
  return `<div class="kid-sec kid-list">${kids.map(f => {
    /* THEIR FIRST NAME, as the server calls a child (docs/history/333), without the `(@handle)` it adds
       when two children share one — the handle is printed beside it. */
    const first = String(nameBesideHandle_(f.title, f.handle) || f.title).trim();
    return `<div class="kid-row">
      ${personFace_({ pic: f.image, avatar: f.avatar, handle: f.handle, name: first, personId: f.personId },
                    { cls: 'kid-face', none: 'prof-none', size: 36 })}
      <p class="kid-who"><b>${esc(first)}</b>${f.handle ? `<span class="prof-handle">@${esc(f.handle)}</span>` : ''}</p>
      ${held ? '' : `<div class="tile-row">${tile_({ icon: 'key', label: 'New PIN', note: 'to sign in with',
          act: 'kid-pin', data: { id: f.personId, name: first.split(' ')[0] } })}</div>`}
    </div>`;
  }).join('')}</div>`;
}
function childManageCard_() {
  const held = !!pendingAddr_();
  return `<div class="card kid-card kid-manage">
    <h3>Manage your child</h3>
    ${kidListSec_(held)}
    ${held ? kidHeldSec_() : kidAddSec_()}
  </div>`;
}

/* A REFUSAL THAT SAYS THE ADDRESS IS WAITING corrects the phone: § */
function heldBy_(err) {
  const d = err && err.reply;
  if (!USER || !d || d.why !== 'unconfirmed' || !d.pendingEmail) return;
  USER.pendingEmail = String(d.pendingEmail);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  try { repaint(true); } catch (e) {}
}

on('resend-link', el => {
  if (!USER) { toast('Sign in first'); return; }
  send_({ action: 'resendLink', personId: USER.personId || '' }, { button: el })
    .then(d => {
      toast(d.message || 'A new link is on its way.');
      /* ALREADY CONFIRMED — on another phone, or by Google. The cards go with it, and a `myProfile` asked
         before this answer is not allowed to bring them back (`ACCOUNT_AT_`). */
      if (d.why === 'confirmed' && USER) {
        accountChanged_();
        USER.pendingEmail = '';
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        try { repaint(true); } catch (e) {}
      }
    })
    .catch(() => {});      // `send_` has already said why
});

/* ---------- A NEW PIN FOR YOUR CHILD, OR FOR ANYBODY IF YOU ARE AN ADMIN § */
on('kid-pin', el => {
  const id = el.getAttribute('data-id') || '', who = el.getAttribute('data-name') || 'them';
  if (!id) { toast('That account has no id yet — ask us.'); return; }
  openSheet('A new PIN for ' + who, `
    <p class="sub">Their old PIN stops working, and they are signed out everywhere. You will see the
      new one once, to give them.</p>
    <button class="btn" data-do="kid-pin-go" data-id="${esc(id)}" data-name="${esc(who)}">Make a new PIN</button>`);
});

on('kid-pin-go', el => {
  if (!USER) { toast('Sign in first'); return; }
  const id = el.getAttribute('data-id') || '';
  send_({ action: 'resetPin', personId: USER.personId || '', targetId: id },
        { button: el, busy: 'Making it…' })
    .then(d => {
      const body = $('sheet-body');
      if (body) body.innerHTML = pinSlip_(d.first || el.getAttribute('data-name'), d.handle, d.pin)
        + '<p class="faint">Write it down or read it to them — it is not shown again. They can change it '
        + 'under Student settings once they are in.</p>'
        + '<button class="btn quiet" data-do="sheet-done">Done</button>';
    })
    .catch(() => {});
});
on('sheet-done', () => closeSheet());

/* YES AND NO ARE ONE HANDLER WITH A FLAG. Two handlers doing the same call with one word different
   is two places to fix when the call changes, and the second one is always the one forgotten. */
const answerClaim_ = (el, accept) => {
  /* THE THIRD OF THE THREE. § */
  if (!USER) { toast('Sign in first'); return; }
  const row = el.getAttribute('data-row');
  /* `send_` RATHER THAN `send`, for the same reason as every form here: it locks both buttons while the answer
     is on the wire, so a second tap cannot answer twice, and it says a refusal as a toast. */
  send_({
    action: 'answerClaim',
    name: USER.name, personId: (USER && USER.personId) || '',
    rowIndex: row, accept: accept,
  }, { button: el, busy: accept ? 'Linking…' : 'Saying no…' }).then(() => {
    toast(accept ? 'Linked. They can book for you now.' : 'Turned down.');
    /* GONE FROM THE SCREEN NOW, not in fifteen seconds. § */
    if (Array.isArray(DATA.claims)) DATA.claims = DATA.claims.filter(c => String(c.rowIndex) !== String(row));
    /* `repaint(true)`, NOT `paint`: a page has left the column, so it must be placed and its
       position clamped again — the Saved column's unstar records what a bare `paint` leaves. */
    if (typeof AT !== 'undefined' && AT === 'parents') repaint(true); else markStale_('parents');
    load();
  }).catch(() => {});
};
on('claim-yes', el => answerClaim_(el, true));
on('claim-no', el => answerClaim_(el, false));

/* YOUR SETTINGS, AS A COLUMN. § */
/* WHAT THE LINE UNDER YOUR HANDLE SAYS AFTER A RANDOMISE — "You were @…" — kept as STATE and drawn from it, never left on the element. § */
let HANDLE_SAID = { pid: '', text: '' };
/* ---------- WHICH FIELDS ARE YOURS TO EDIT: THE SAME CHOICE THE SHEET MADE, IN ONE PLACE § */
const GROUPS_OLD_ = { 'About you': ['first_name', 'last_name', 'photo'],
                      'Where': ['borough', 'city'], 'Contact': ['email', 'phone'] };
function myGroups_() {
  const role = roleOf((USER && USER.role) || '');
  const has = g => !!(g && Object.keys(g).length);
  return (role === 'client' && has(DATA.clientFields)) ? DATA.clientFields
    : (role === 'student' && has(DATA.studentFields)) ? DATA.studentFields
    : has(DATA.profileFields) ? DATA.profileFields
    /* A backend too old to send it. The form still opens with what this file knows about — an
       admin who can edit nothing is worse than one who can edit a few things. */
    : GROUPS_OLD_;
}
/* ---------- AND THE LIBRARY CARDS, WHICH ARE A TOOL NOW § */
function notLibrary_(groups) {
  const out = {};
  Object.keys(groups || {}).forEach(g => {
    const left = (groups[g] || []).filter(f => !isLibraryCard_(f) && RETIRED_FIELDS_.indexOf(f) === -1);
    if (left.length) out[g] = left;
  });
  return out;
}
const libFieldsOf_ = groups => [].concat(...Object.keys(groups || {}).map(g => groups[g] || [])).filter(isLibraryCard_);
/* ---------- A COLUMN PER RANK (444): YOU FOR EVERY ACCOUNT, THEN FAMILY, TUTOR AND ADMIN ----------
   The owner: one column whose contents change with rank "becomes really messy and hard for me to know what's going on". */
/* A FIELD IS A TUTOR'S WHEN NEITHER A CLIENT'S NOR A STUDENT'S GROUPS HAVE IT — the backend's lists decide, not a list here. */
const STAFF_GROUPS_ = ['Your rate and group size', 'Qualifications', 'Availability'];
function staffField_(f, g) {
  const sets = [DATA.clientFields, DATA.studentFields].filter(x => x && Object.keys(x).length);
  if (!sets.length) return STAFF_GROUPS_.indexOf(g) !== -1;
  return !sets.some(x => Object.keys(x).some(k => (x[k] || []).indexOf(f) !== -1));
}
/* A PARENT'S ALONE (469): a client's field no student's group has — else it is everybody's and lives on Student settings. */
function parentOnly_(f) {
  const c = DATA.clientFields, k = DATA.studentFields, has = x => x && Object.keys(x).length, inn = x => Object.keys(x).some(g => (x[g] || []).indexOf(f) !== -1);
  return !!(has(c) && has(k) && inn(c) && !inn(k));
}
/* WHAT A SPLIT GROUP IS CALLED ON THE TUTOR COLUMN, where "Contact & address" would mislead. */
const STAFF_GROUP_NAMES_ = { 'Contact & address': 'Where you teach', 'About you': 'About you as a tutor' };
/* YOUR SETTINGS' GROUPS, SPLIT: `{ you, staff }`, each `{ group: [fields] }`, card fields already taken out. */
function settingsSplit_() {
  const shown = notLibrary_(cardSettingsGroups_(myGroups_(), ownCardFields_()));
  /* AND STAFF SET THEIR WEEK ON THE AVAILABLE CARD (487), so the week group is not drawn here a second time. */
  if (typeof hubFor_ === 'function' && hubFor_()) Object.keys(shown).forEach(g => { if (isTimetable_(shown[g])) delete shown[g]; });
  const out = { you: {}, parent: {}, staff: {} };
  Object.keys(shown).forEach(g => {
    shown[g] = shown[g].filter(f => !hubOwns_(f));
    if (!shown[g].length) return;
    const mine = shown[g].filter(f => !staffField_(f, g)), staff = shown[g].filter(f => staffField_(f, g));
    const kid = mine.filter(f => !parentOnly_(f)), par = mine.filter(parentOnly_);
    if (kid.length) out.you[g] = kid;
    if (par.length) out.parent[g] = par;
    if (staff.length) out.staff[mine.length ? (STAFF_GROUP_NAMES_[g] || g) : g] = staff;
  });
  return out;
}
/* ONE GROUP, ONE CARD, ITS OWN SAVE — `meSave_` posts the boxes of the card it is pressed in, whichever column.
   `col` names the column, so an admin's Split (464, layout.js) can draw a group a field a card, each with its own Save. */
function settingsCards_(shown, moved, col) {
  const p = USER.profile || {};
  /* THE BUSINESS'S CUT OF AN EXTRA SEAT IS SHOWN TO A TUTOR AND NOT OFFERED (docs/history/345) — an
     admin's to set, and `seatCutRefusal_` refuses it from anybody else; a disabled box is one `meSave_` never posts. */
  const readonly = (DATA.profileReadonly || []).concat(isAdmin() ? [] : ['extra_seat_cut']);
  const one = (g, list, top, id, n, lid) => setHeldSay_(`<div class="card${id ? ' set-card' : ''}"${id ? ` data-split="${esc(id)}"` : ''}${lid ? ` data-lay-card="${esc(lid)}"` : ''}>
    ${top}
    <div class="me-form">${fieldsHtml({ [g]: list }, {
      head: 'h3',
      attr: 'data-me',
      /* THE ADDRESS WAITING TO BE PROVED, in the address's box — see `movingNote_`. */
      value: f => (f === 'email' && p.email_moving) ? p.email_moving : (p[f] ?? ''),
      raw: p,
      readonly: readonly,
      options: fieldOptions_,
    })}
      ${/* THE QUALIFICATIONS CARD HAS NO SAVE OF ITS OWN: § */
        (list || []).length && (list || []).every(isQualField_) ? ''
        : `<div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'me-save' })}${
            (list || []).indexOf('email') !== -1 && p.email_moving ? resendTile_() : ''}</div>`}
      ${(list || []).indexOf('email') !== -1 ? movingNote_(p) : ''}
      <p class="faint me-said"></p></div>
    ${id && typeof splitTiles_ === 'function' ? splitTiles_(id, n) : ''}
  </div>`);
  const out = [];
  Object.keys(shown).forEach((g, k) => {
    const list = shown[g] || [], top = k === 0 ? moved : '';
    const id = col && settingsSplittable_(list) && typeof splitId_ === 'function' ? splitId_('set', col, g) : '';
    if (id && typeof splitOn_ === 'function' && splitOn_(id))
      list.forEach((f, i) => out.push(one(String((typeof fieldLabel === 'function' && fieldLabel(f)) || ROW_LABEL[f] || g).replace(/^./, c => c.toUpperCase()), [f], i === 0 ? top : '', id, 1, typeof pieceId_ === 'function' ? pieceId_(id, f) : '')));
    else out.push(one(g, list, top, id, list.length, col && typeof splitId_ === 'function' ? splitId_('set', col, g) : ''));
  });
  return out;
}
/* A GROUP SPLITS WHEN ITS FIELDS STAND ALONE: not the qualifications (one shelf) and not a week of hours (one grid). */
const settingsSplittable_ = list => (list || []).length > 1 && !list.some(isQualField_) && !isTimetable_(list);

/* ---------- SIX COLUMNS (453): TUTORS, STUDENTS, PARENTS, THEN EACH ACCOUNT TYPE'S SETTINGS ----------
   The owner: "A user in theory could appear in each of these 3 categories" and "split account settings into 3". */
const tabLabel_ = (id, or) => ((typeof TABS_BUILT !== 'undefined' && TABS_BUILT.find(t => t.id === id)) || {}).label || or;
/* THE PEOPLE COLUMN OF YOUR RANK, where your own card is shown first (453); what you edit is on Student settings for every rank (469). */
const homeCol_ = () => rankAtLeast_('staff') ? 'tutors' : rankAtLeast_('client') ? 'parents' : 'students';
/* DO YOU BELONG IN THIS PEOPLE COLUMN — by rank, or by a family link (a parent is a parent whatever their rank). */
function peopleBelong_(col, family) {
  if (!USER) return false;
  const rel = r => (family || []).some(f => f && f.relation === r);
  if (col === homeCol_()) return true;
  if (col === 'tutors') return !!(typeof cardMine_ === 'function' && cardMine_());
  if (col === 'parents') return rel('child');
  return rel('parent');
}
/* A PEOPLE COLUMN: signed out it says where to sign in; with nobody in it, its title and one line. */
function peoplePages_(col) {
  const title = tabLabel_(col, col);
  if (!USER) return [signedOutCard_(title)];
  const out = typeof accountPages_ === 'function' ? accountPages_(col) : [];
  return out.length ? out : [rankOffCard_(title, 'Nobody to show here yet.').replace('rank-off', 'people-none')];
}

/* ---------- YOUR CARD ON YOUR ROLE'S SETTINGS COLUMN: ONLY ITS EDITING, A CARD PER THING (468) — never a preview; the person is drawn on the profile columns. */
function ownCardSetPage_(setCol) {
  const face = FACE_OF_SET_[setCol];
  if (!USER || !face || typeof ownCardSections_ !== 'function') return [];
  const secs = ownCardSections_(face);
  if (!secs.length) return [];
  const mine = typeof myCardRow_ === 'function' ? myCardRow_() : null;
  const row = face === 'tutors' ? (cardMine_() || mine) : mine;
  if (!row || !row.personId || !cardMayEdit_(row)) return [];
  return cardEditCards_(row, cardOwnOpen_(row), secs, setCol);
}
/* ALWAYS OPEN: the edit of your own card is the settings column itself, so nothing is pressed to start it. */
function cardOwnOpen_(t) {
  const now = cardEditNow_();
  if (now && now.pid === String(t.personId)) { now.col = 'settings'; return now; }
  const e = CARD_EDIT = cardEditFresh_(t.personId);
  e.pic0 = cardPicNow_(t);
  e.fig0 = String(USER.avatar || ''); e.cr0 = Number(USER.credits || 0); e.h0 = String(USER.handle || USER.name || '');
  cardRemember_(e);
  return e;
}

/* ---------- STUDENT SETTINGS: EVERY ACCOUNT'S SIGNING IN AND OUT, PIN, ROLES, NOTIFICATIONS, AND A STUDENT'S DETAILS ---------- */
function youSettingsPages_() {
  if (!USER) return [];
  /* EVERYBODY'S DETAILS, WHATEVER THE RANK (469): a parent's or tutor's own contact is edited here, as a student's is. */
  const shown = settingsSplit_().you;
  const pages = settingsCards_(shown, '', 'account');
  pages.push(`<div class="card">
    <h3>Signing in</h3>
    <div class="f-row pin-row" style="--n:3">
      <label class="field"><input id="pin-now" aria-label="current PIN" placeholder="current PIN" type="password" inputmode="numeric" autocomplete="one-time-code"></label>
      <label class="field"><input id="pin-new" aria-label="new PIN, 4 to 8 numbers, not 1234" placeholder="new PIN, 4–8 numbers" type="password" inputmode="numeric" autocomplete="one-time-code"></label>
      <label class="field"><input id="pin-again" aria-label="new PIN again" placeholder="again" type="password" inputmode="numeric" autocomplete="one-time-code"></label>
    </div>
    <button class="btn quiet" data-do="pin-save">Change my PIN</button>
    <p class="faint" id="pin-said" style="margin:.6rem 0 0"></p>
  </div>`);
  /* YOUR ROLES, THEN WHICH EMAILS YOU WANT — every signed-in person has both. */
  pages.push(rolesCard_());
  pages.push(notifyCard_());
  const voice = voiceCard_();
  if (voice) pages.push(voice);
  return pages;
}
function studentSetPages_() {
  if (!USER) {
    /* THE GOOGLE BUTTON IS MOUNTED A FRAME LATE — Google renders into an element that has to exist first. */
    if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn();
    return (typeof signInCard_ === 'function' ? [signInCard_()] : []).filter(Boolean).concat(lockedPages_('account'));
  }
  const who = nameBesideHandle_(USER.name, USER.handle) || 'you';
  /* SIGNED IN AS, AND SIGN OUT — off your card since 453, because it is a setting of every account. */
  const top = `<div class="card signed-in"><h3>Signed in</h3><p class="sub">As ${esc(who)}${USER.handle ? ` <span class="prof-handle">@${esc(USER.handle)}</span>` : ''}</p>
    ${tileRow_(tile_({ icon: 'out', label: 'Sign out', act: 'signout' })
      + (typeof pendingAddr_ === 'function' && pendingAddr_() && typeof resendTile_ === 'function' ? resendTile_() : ''), '', true)}
    ${/* "WE WILL EMAIL YOU ONCE YOU OPEN THE LINK" — one line under Sign out and Send the link again while your address is unproved. */
      typeof mailHeldNote_ === 'function' ? mailHeldNote_() : ''}</div>`;
  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  /* WHAT WAS THE PROGRESS COLUMN (461, the owner: "the progress column content can all be moved to student column account settings"). */
  const all = typeof progressCards_ === 'function' ? progressCards_() : [], isWait = c => /^<div class="loading/.test(String(c).trim());
  /* `prog-w` MARKS THEM, so a check can ask the progress widgets apart from the settings around them. */
  const prog = all.filter(c => !isWait(c)).map(c => String(c).replace('<div class="card', '<div class="card prog-w')), wait = coming.length || !all.some(isWait) ? coming : [loading_()];
  return [top].concat(ownCardSetPage_('account'), youSettingsPages_(),
    /* PHONE NOTIFICATIONS (492), push.js — here because every account has this column. Google Tasks lives in the Docket (491). */
    typeof pushCard_ === 'function' ? [pushCard_()].filter(Boolean) : [], prog, wait);
}
screen('account', () => pages('account', typeof cardsOf_ === 'function' ? cardsOf_('account') : studentSetPages_()));

/* ---------- READING ALOUD (453, 463) — no choice: the device's calmest natural voice, free; a sample is all there is to do ---------- */
function voiceCard_() {
  if (!canSay_()) return '';
  return `<div class="card voice-card"><h3>Reading aloud</h3>
    <div class="tile-row">${tile_({ icon: 'speak', label: 'Hear a sample', note: 'the reading voice', act: 'voice-try' })}</div></div>`;
}
const VOICE_SAMPLE = 'Hello. This is how your questions will be read. For example: x² ÷ 4 is less than 3/4.';
on('voice-try', () => { hush_(); say_(VOICE_SAMPLE); });

/* A COLUMN ABOVE YOUR RANK: its title, that it is not for your account, and the next step if there is one. */
const rankOffCard_ = (title, say, more) => `<div class="card rank-off"><h3>${esc(title)}</h3>
    <p class="sub rank-off-say">${esc(say)}</p>${more || ''}</div>`;
/* A SETTINGS COLUMN FOR A ROLE YOU DO NOT HOLD (464): a padlock and one short line, and nothing else — the owner, "it will just show a padlock". */
const padlockCard_ = (say, more) => `<div class="card rank-off col-lock"><span class="col-lock-i" aria-hidden="true">${tileIcon_('lock')}</span>
    <p class="sub rank-off-say">${esc(say)}</p>${more || ''}</div>`;
const signedOutCard_ = title => rankOffCard_(title, 'Sign in on ' + tabLabel_('account', 'Student settings') + ' first.');

/* ---------- EVERYBODY SEES EVERY CARD (467) — the owner: "Everybody can see everything; different things are just locked behind a padlock." § */
/* A placeholder of the column's role draws the column's real cards, so nobody's data is in them; each is then shut (`lockCard_`). */
const LOCK_AS_ = { staff: { rank: 'staff', role: 'Tutor', roles: ['tutor'] }, family: { rank: 'client', role: 'Client', roles: ['client'] },
  account: { rank: 'student', role: 'Student', roles: ['student'] } };
function lockedAs_(col, draw) {
  const real = USER;
  let out = [];
  USER = Object.assign({ name: '', handle: '', personId: '', email: '', profile: {}, lockedPreview: true }, LOCK_AS_[col] || {});
  try { out = (draw() || []).filter(Boolean); } catch (e) { out = []; } finally { USER = real; }
  return out.map(lockCard_);
}
/* SHUT: the padlock on the card, every box and tile disabled, a link made inert — what it is stays readable. */
function lockCard_(h) {
  return String(h).replace(/^(\s*<div\b[^>]*\bclass="(?:card|own-set)\b[^"]*)"/, '$1 is-locked"')
    .replace(/^(\s*<div\b[^>]*>)/, `$1<span class="card-lock" title="Locked" aria-label="Locked">${tileIcon_('lock')}</span>`)
    .replace(/<(input|select|textarea|button)\b(?![^>]*\sdisabled\b)/g, '<$1 disabled')
    .replace(/<a\b([^>]*)\shref="[^"]*"/g, '<a$1 aria-disabled="true"')
    /* NO ID OF ITS OWN — a shut copy must never be the box a real card's code finds (`pin-now`). */
    .replace(/(<[a-z]+\b[^>]*?)\sid="/g, '$1 data-lock-id="');
}
/* YOUR CARD'S PLACE ON A LOCKED COLUMN: its title only — a placeholder has no card to draw. */
const lockedOwnCards_ = col => (OWN_SEC_OF_SET_[col] || []).map(k => `<div class="card own-lock" data-lay-card="own:${col}:${k}"><h3>${esc(OWN_SEC_TITLE_[k] || k)}</h3></div>`);
/* EACH SETTINGS COLUMN'S CARDS FOR ITS ROLE, built the same way as for a holder (`staffPages_`, `familyPages_`, `youSettingsPages_`). */
const LOCKED_DRAW_ = {
  staff: () => lockedOwnCards_('staff').concat([`<div class="card staff-top"><h3>Staff hub</h3><div class="tile-row staff-tiles">${
    typeof hubTile_ === 'function' ? hubTile_() : ''}</div></div>`]).concat(settingsCards_(settingsSplit_().staff, '', 'staff')),
  family: () => lockedOwnCards_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family')),
  account: () => lockedOwnCards_('account').concat(youSettingsPages_()),
};
const lockedPages_ = col => lockedAs_(col, LOCKED_DRAW_[col]);

/* ---------- PARENT SETTINGS: A PARENT'S OR PAYER'S OWN DETAILS (453) — the children are on Students ---------- */
function familyPages_() {
  const title = tabLabel_('family', 'Parent settings');
  if (!USER) return [signedOutCard_(title)].concat(lockedPages_('family'));
  if (!rankAtLeast_('client')) return [padlockCard_('Parent settings are for parents.')].concat(lockedPages_('family'));
  const out = ownCardSetPage_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family'));
  /* NOTHING A PARENT'S ALONE (469): your picture, name and contact are everybody's, so on Student settings. */
  return out.length ? out : [rankOffCard_(title, 'Nothing here yet — your details are on ' + tabLabel_('account', 'Student settings') + '.').replace('rank-off', 'set-none')];
}
screen('family', () => pages('family', typeof cardsOf_ === 'function' ? cardsOf_('family') : familyPages_()));

/* ---------- TUTOR SETTINGS: THE STAFF HUB AND THE TEACHING SETTINGS WITH NO CARD TO LIVE ON (453) ---------- */
function staffPages_() {
  const title = tabLabel_('staff', 'Tutor settings');
  if (!USER) return [signedOutCard_(title)].concat(lockedPages_('staff'));
  /* THE PADLOCK, with Apply to teach for an adult who may apply (`applyTile_`), then every card shut (467). */
  if (!rankAtLeast_('staff')) return [padlockCard_('Tutor settings are for tutors.', typeof applyTile_ === 'function' ? applyTile_() : '')].concat(lockedPages_('staff'));
  const hub = typeof hubTile_ === 'function' ? hubTile_() : '';
  const warn = typeof hubWarn_ === 'function' ? hubWarn_() : '';
  const top = hub ? [`<div class="card staff-top"><h3>Staff hub</h3><div class="tile-row staff-tiles">${hub}</div>${warn}</div>`] : [];
  const out = ownCardSetPage_('staff').concat(top, settingsCards_(settingsSplit_().staff, '', 'staff'));
  return out.length ? out : [`<div class="card"><h3>${esc(title)}</h3></div>`];
}
screen('staff', () => pages('staff', typeof cardsOf_ === 'function' ? cardsOf_('staff') : staffPages_()));

/* ---------- ADMIN: THE BUSINESS CARDS, THEN THE BUILD STAMPS (people management is on the people columns since 453) ---------- */
function adminPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return typeof bizPages_ === 'function' ? bizPages_() : [];
}
/* THE SITE COLUMN (491): what runs the site rather than the business — setup, moderation, imports, the weekly email, the build. */
function sitePages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return (typeof siteBizPages_ === 'function' ? siteBizPages_() : [])
    .concat(typeof inboxCard_ === 'function' ? [inboxCard_()] : [])
    .concat([`<div class="card"><h3>Build</h3><div class="me-build">${versionSaid_()}</div></div>`]);
}

/* ---------- YOUR ROLE: ONE RANK (400), SO ONE CHOICE, CLIENT OR STUDENT, FOR A CLIENT ONLY (432) ----------
   Tutor comes by "Apply to teach", Admin is given, and dopost.gs refuses a student becoming a client. */
const ROLE_PICKS = [
  ['tutor', 'Tutor', 'You teach here. Teaching starts with "Apply to teach" on Tutor settings.'],
  ['client', 'Client', 'A parent or payer. You book and pay for sessions.'],
  ['student', 'Student', 'You are the one learning. Only @family. can change a student account back.'],
];
/* WHAT THE LINE UNDER THE CARD SAYS WHEN NOTHING HAS JUST HAPPENED, by rank. */
function rolesSaid_() {
  if (!USER) return '';
  if (rankAtLeast_('admin')) return '';
  if (USER.tutorPending && tutorHeld_())
    return 'Tutor is waiting for ' + brand('name', '@family.') + ' to approve you. Until then you are not on the site and '
         + 'cannot be booked — fill in your teaching pages meanwhile.';
  if (rankAtLeast_('staff')) return 'You teach here. Your hours, pricing and terms are in the Staff hub on ' + tabLabel_('staff', 'Tutor settings') + '.';
  if (rank_() === 'student') return 'A parent links you to their account from theirs.';
  return '';
}
/* THE CHOICE THE CARD OFFERS: only a Client has one. A waiting Tutor keeps the old row's tutor alongside it (`rolesPicked_`). */
const rolesPickable_ = () => !!USER && rank_() === 'client';
function rolesCard_() {
  const name = brand('name', '@family.');
  /* ONE ROW, THE PHONE'S OWN PICKER, and no notes under it (469: the owner, "so much filler space"). */
  const can = rolesPickable_() ? ROLE_PICKS.filter(([r]) => r !== 'tutor') : [];
  const picks = can.length ? `<label class="field role-pick-row"><span>You are</span><select class="role-pick-in" aria-label="Your role">${
      can.map(([r, label]) => `<option value="${r}" data-role-pick="${r}"${r === 'client' ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select></label>
`
    + `<div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'roles-save' })}</div>` : '';
  const said = rolesSaid_();
  return `<div class="card roles-card">
    <h3>Your roles</h3>
    ${rankAtLeast_('admin') ? `<p class="faint role-admin">You are Admin. That is given by ${esc(name)} and is not changed here.</p>` : ''}
    ${picks}
    ${picks || said ? `<p class="faint roles-said" aria-live="polite">${esc(said)}</p>` : ''}
  </div>`;
}
/* WHAT A SAVE POSTS: the one choice, and a waiting Tutor's `tutor`, which is kept, not added (the server refuses adding it). */
const rolesPicked_ = card => {
  const b = card.querySelector('[data-role-pick]:checked');
  if (!b) return [];
  return [b.dataset.rolePick].concat(USER && USER.tutorPending && tutorHeld_() ? ['tutor'] : []);
};

on('roles-save', el => {
  const card = el.closest('.card');
  if (!USER || !card) return;
  const said = card.querySelector('.roles-said');
  const roles = rolesPicked_(card);
  if (!roles.length) return;
  send_({ action: 'setMyRoles', name: USER.name, personId: USER.personId || '', roles },
        { button: el, where: said || undefined, saying: 'Saving…', lock: card })
    .then(d => {
      /* THE SERVER'S ANSWER IS WHAT YOU ARE NOW, not the ticks: it may have kept an admin's
         `admin`, and only it knows whether the Tutor tick is waiting. Kept like every other field
         of `USER`, so a reload does not undo it. */
      USER.role = d.role || USER.role;
      USER.roles = Array.isArray(d.roles) ? d.roles : USER.roles;
      USER.tutorPending = !!d.tutorPending;
      if (d.rank) USER.rank = String(d.rank);
      /* AND WHICH EMAILS REACH YOU NOW — they follow the roles (`notifyOf_`), so the Notifications card
         is redrawn from the server's list with them. An older backend sends none and the card keeps its own. */
      if (d.notify) USER.profile = Object.assign({}, USER.profile || {}, { notify: d.notify });
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      toast(d.changed ? 'Role saved' : 'Nothing changed');
      /* THE COLUMN IS DRAWN FROM THE ROLE — which pages of fields, the agreement card — so it is
         drawn again; then the payload, because who is a tutor is in it. */
      if (d.changed) { try { repaint(true); } catch (e) {} try { load(); } catch (e) {} }
      const now = document.querySelector('.roles-card .roles-said');
      if (now) now.textContent = d.changed && rolesPickable_() && !USER.tutorPending ? 'Saved.' : rolesSaid_();
    })
    /* A REFUSAL PUTS THE CHOICE BACK TO WHAT YOU HOLD — Client, the only rank the card is drawn with a choice for. */
    .catch(err => {
      if (!err || !err.refused) return;
      /* THE CARD ON THE PAGE NOW, as the success path asks: the payload arriving mid-request
         repaints the column, and the card held from the press would then be a detached copy. */
      const live = document.querySelector('#s-account .roles-card') || card;
      [].forEach.call(live.querySelectorAll('[data-role-pick]'), b => { b.selected = b.dataset.rolePick === 'client'; });
    });
});

/* ---------- NOTIFICATIONS: WHAT @family. EMAILS YOU, AND WHAT YOU CAN TURN OFF § */
/* WHAT A BACKEND OLDER THAN THIS SITE MEANS FOR THE PERSON READING IT: § */
const NOTIFY_OLD_SAY_ = 'The live backend does not have notification choices yet, so every email is sent as before.';
const NOTIFY_OLD_ADMIN_ = ' Sync backend/ and deploy a new version to switch them on.';
/* WHAT THE LINE UNDER THE TICKS SAYS AFTER ONE IS SAVED, kept as state for `HANDLE_SAID`'s reason: § */
let NOTIFY_SAID = { pid: '', text: '' };
const notifyList_ = () => {
  const n = USER && USER.profile && USER.profile.notify;
  return n && Array.isArray(n.kinds) ? n : null;
};
function notifyCard_() {
  const f = (DATA && Array.isArray(DATA.features)) ? DATA.features : [];
  const n = notifyList_();
  const said = t => `<p class="faint notify-said" aria-live="polite">${esc(t)}</p>`;
  let inner;
  /* AN EMPTY LIST BEFORE THE PAYLOAD HAS LANDED IS "NOT KNOWN YET", NOT "OLD" — `LOADED` says which. */
  if (f.indexOf('setNotify') === -1 && (f.length || LOADED)) {
    inner = `<p class="sub notify-old">${esc(NOTIFY_OLD_SAY_ + (isAdmin() ? NOTIFY_OLD_ADMIN_ : ''))}</p>`;
  }
  else if (!n) inner = said('Your choices are on their way from the sheet.');
  else if (!n.to) {
    /* NO ADDRESS OF THEIR OWN — `notify` writes to the row's own address and nowhere else, so nothing at
       all is sent to them; a child's forgotten PIN goes to their grown-ups (`authGrownUps_`). */
    const kid = heldRoles().map(roleOf).indexOf('student') !== -1;
    inner = `<p class="sub notify-none">${esc(kid
      ? 'There is no email address on your account, so @family. emails you nothing — there is nothing to turn off. If you forget your PIN, a new one goes to your grown-up.'
      : 'There is no email address on your account, so nothing is emailed to you. Add one on your Contact card and your choices appear here.')}</p>`;
  }
  /* A LIST WITH NOTHING IN IT. § */
  else if (!n.kinds.length) {
    inner = `<p class="sub notify-none">${esc('We could not tell which emails reach your account, so nothing here can be switched yet — everything is sent as before.')}</p>`;
  } else {
    const opt = n.kinds.filter(k => !k.essential), must = n.kinds.filter(k => k.essential);
    const mine = NOTIFY_SAID.pid && NOTIFY_SAID.pid === String(USER.personId || '') ? NOTIFY_SAID.text : '';
    /* ---------- SHORT, BECAUSE IT HAS TO FIT A 320 PHONE WITHOUT SCROLLING § */
    inner = `<p class="sub">To <b style="overflow-wrap:anywhere">${esc(n.to)}</b> · saved as you tick.</p>
      ${n.held ? `<p class="faint notify-held">Until you open the link we sent there, that link is the only
        thing we send to it.</p>` : ''}
      ${opt.map(k => `<label class="check role-pick notify-pick">
        <input type="checkbox" data-do="notify-pick" data-kind="${esc(k.kind)}"${k.on ? ' checked' : ''}>
        <span class="box"></span><span class="role-pick-say"><b>${esc(k.label)}</b>
          <span class="faint">${esc(k.note)}${k.idle ? ' — ' + esc(String(k.idle).toLowerCase()) : ''}</span></span></label>`).join('')}
      ${must.length ? `<p class="notify-cap">Always sent</p>
      <ul class="notify-always">${must.map(k => `<li title="${esc(k.note)}">${esc(k.label)}</li>`).join('')}</ul>` : ''}
      ${said(mine)}`;
  }
  return `<div class="card notify-card">
    <h3>Notifications</h3>
    ${inner}
  </div>`;
}

/* WHAT THE SERVER LAST SAID THIS KIND IS SET TO — the profile's list, not the box. */
const notifyOnNow_ = kind => {
  const n = notifyList_();
  const k = n && n.kinds.find(x => x.kind === kind);
  return !!(k && k.on);
};

on('notify-pick', el => {
  if (!USER || !el || el.disabled) return;
  const card = el.closest('.card');
  const said = card && card.querySelector('.notify-said');
  const kind = String(el.dataset.kind || '');
  const want = !!el.checked;
  const n = notifyList_();
  const label = ((n && n.kinds.find(x => x.kind === kind)) || {}).label || 'That email';
  /* ---------- THIS BOX'S ROW IS LOCKED, NOT THE CARD § */
  send_({ action: 'setNotify', name: USER.name, personId: USER.personId || '', kind: kind, on: want },
        { where: said || undefined, saying: 'Saving…', lock: el.closest('label') || el })
    .then(d => {
      /* THIS KIND'S ANSWER, MERGED INTO THE LIST WE HOLD — not the reply's whole list. § */
      const on = d && typeof d.on === 'boolean' ? d.on : want;
      const held = notifyList_();
      if (held && held.kinds.some(x => x.kind === kind)) {
        USER.profile = Object.assign({}, USER.profile, { notify: Object.assign({}, held, {
          kinds: held.kinds.map(x => x.kind === kind && !x.essential ? Object.assign({}, x, { on: on }) : x) }) });
      } else if (d && d.notify) USER.profile = Object.assign({}, USER.profile || {}, { notify: d.notify });
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      NOTIFY_SAID = { pid: String(USER.personId || ''),
        text: on ? label + ' is on.' : label + ' is off — we will not email you that.' };
      /* THE CARD ON THE PAGE NOW, for the roles card's reason: a payload landing mid-request repaints the
         column, and the card held from the press would be a detached copy. */
      const live = document.querySelector('#s-account .notify-card') || card;
      const box = live && live.querySelector('[data-kind="' + kind + '"]');
      if (box) box.checked = on;
      const line = live && live.querySelector('.notify-said');
      if (line) line.textContent = NOTIFY_SAID.text;
      toast('Saved');
    })
    /* ---------- A FAILURE PUTS THE TICK BACK TO WHAT THE SERVER HAS — REFUSED OR LOST § */
    .catch(() => {
      const live = document.querySelector('#s-account .notify-card [data-kind="' + kind + '"]') || el;
      live.checked = notifyOnNow_(kind);
    });
});

/* ---------- YOUR JOURNEY WAS HERE, AND IS THE PROGRESS COLUMN'S CARD NOW § */

/* THE TUTOR AGREEMENT (DRAFT) WAS HERE — ten points and a tick for good. It is the Tutor Terms & Conditions in the Staff hub now, versioned (405, staff.js). */


/* `on('edit-me')` WAS HERE — `go('settings')`, the door from a `Your settings` tile on your own account card. § */

/* THE HOURS SOMEBODY IS FREE, as a week you tick. § */
/* ---------- AND IT IS `weekGrid_`, BECAUSE THE COMMENT ABOVE STOPPED BEING TRUE § */
function availGrid_(codes, p, readonly, mine) {
  const ro = f => readonly.indexOf(f) !== -1;
  /* AN HOUR TICKED AND NOT YET SAVED IS A DRAFT of your own row (`fieldHtml`'s note; 317) — "Save my
     hours" took every unsaved tick with it on a reload. Only on your own week (`mine`). */
  const was = f => (TRUEish_(p[f]) ? '1' : '0');
  const keep = f => !!mine && !ro(f) && typeof draftVal_ === 'function';
  const on = f => (keep(f) ? draftVal_('set', f, was(f)) : was(f)) === '1';

  /* Grouped back into days, from the flat list the backend sends. The prefix IS the day and the
     digits ARE the hour, so nothing else has to be looked up. */
  const days = [['m', 'Mon'], ['tu', 'Tue'], ['w', 'Wed'], ['th', 'Thu'],
                ['f', 'Fri'], ['sa', 'Sat'], ['su', 'Sun']]
    .map(([prefix, label]) => ({
      label: label,
      hours: codes.filter(c => c.replace(/\d+$/, '') === prefix)
                  .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)))
                  .map(c => ({ code: c, h: Number(c.slice(prefix.length)) })),
    }))
    .filter(d => d.hours.length);

  if (!days.length) return '';
  /* ---------- `.me-week`, BECAUSE THIS WEEK IS READ AT LEISURE AND THE BOOKING ONE IS NOT § */
  return `<div class="me-week" style="--hours:${days[0].hours.length}">
    ${weekGrid_(days, (h, d) => `<label class="hr${on(h.code) ? ' on' : ''}${
      ro(h.code) ? ' shut' : ''}" aria-label="${esc(d.label)} ${h.h}:00">
      <input type="checkbox" data-me="${esc(h.code)}" ${on(h.code) ? 'checked' : ''}
             ${ro(h.code) ? 'disabled' : ''}${keep(h.code) ? draftAttr_('set', h.code, was(h.code)) : ''}>
    </label>`, { chars: 3 })}</div>`;
}

/* A ROUND TRIP THAT CANNOT FAIL SILENTLY. § */
function send_(body, o) {
  o = o || {};
  const btn = o.button;
  /* AN ID OR THE ELEMENT ITSELF. A settings card's status line is a CLASS, one per card — there are
     a dozen on one column, so it cannot be an id — and the caller already holds the element. */
  const say = msg => {
    const el = o.where && (typeof o.where === 'string' ? $(o.where) : o.where);
    if (el) el.textContent = msg; else toast(msg);
  };

  /* `is-busy` IS THE SPINNER, and it goes on whether or not there is a `busy` label -- a
     button with no relabel still has to show that it is waiting. See `.btn.is-busy`. */
  /* `data-unlocked` — SEE BELOW: a control that queues its own press behind the save is left live. */
  if (btn) { btn.disabled = !btn.hasAttribute('data-unlocked'); btn.classList.add('is-busy');
             /* A TILE HAS NO WORD TO SWAP — its face is a mark, and writing text over it would lose
                the mark for good. The ring is the whole of its busy state. */
             if (o.busy && !btn.classList.contains('tile')) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

  /* ---------- AND THE FIELDS, WHICH IS THE HALF THAT WAS MISSING § */
  const box = o.lock
    ? (typeof o.lock === 'string' ? $(o.lock) : o.lock)
    : btn && btn.closest('.me-form, .msg-form, .rc, #sheet-body, .card');
  const had = document.activeElement;
  const locked = [];
  if (box) {
    [].forEach.call(box.querySelectorAll('input, select, textarea, button'), el => {
      if (el === btn || el.disabled || el.hasAttribute('data-unlocked')) return;
      el.disabled = true;
      locked.push(el);
    });
    box.classList.add('is-sending');
  }

  const done = () => {
    locked.forEach(el => { el.disabled = false; });
    locked.length = 0;
    if (box) box.classList.remove('is-sending');
    /* ONLY IF THE PAGE STILL HOLDS IT. A reply that repaints the card replaces the element that
       had the caret, and focusing a detached node moves focus to the body -- which is worse than
       leaving it where the repaint put it. */
    if (had && had.focus && document.contains(had)) { try { had.focus(); } catch (e) {} }
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('is-busy');
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      /* AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then tell that from a reply that never came: § */
      if (!d || d.error) {
        const refusal = new Error((d && d.error) || 'That did not work.');
        refusal.refused = !!(d && d.error);
        /* AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code as well as a sentence: § */
        refusal.reply = d || null;
        throw refusal;
      }
      done();
      return d;
    })
    .catch(err => {
      done();
      /* THE MESSAGE, NOT THE STACK. And a network failure has none worth reading — `Failed to
         fetch` tells somebody on a train nothing they can act on. */
      /* THROUGH `why_`, so the same sentence appears here and in the banner — the line under the button is where somebody looks, the banner is where text can be § */
      say(typeof why_ === 'function' ? why_(err) : String(err && err.message || err));
      /* Rethrown so a caller can still react, and marked so a caller that does not care can tell
         a handled failure from a bug. */
      err.handled = true;
      throw err;
    });
}

/* ONE FIELD RENDERER. There were two, and they had different powers. § */

/* Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a
   list has to be remembered — `dbs_checked` and `is_listed` are booleans by their names. */
const FIELD_IS_BOOL = /^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)/;

/* Names whose keyboard should be a number pad, and which kind. */
const FIELD_IS_DECIMAL = /rate|price|cost|hours|km|fraction/;
const FIELD_IS_NUMERIC = /pages|year|students|days|weeks|count|level_required/;

/* ---------- AND A NAME ENDING `_date` IS A DAY ON A CALENDAR § */
const FIELD_IS_DATE = /_date$/;

/* ---------- TWO LISTS THE BACKEND HAS NEVER BEEN TOLD ABOUT § */
const FIELD_LISTS_ = {
  favourite_colour: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Navy', 'Purple', 'Pink',
                     'Brown', 'Black', 'White', 'Grey', 'Gold', 'Silver'],
};
/* ---------- WHAT A QUALIFICATION CAN BE IN, AS A LIST THAT IS SPELT RIGHT § */
const QUAL_SUBJECTS = [
  'Accounting', 'Ancient History', 'Arabic', 'Archaeology', 'Art and Design', 'Biology',
  'Business Studies', 'Chemistry', 'Chinese', 'Citizenship', 'Classical Civilisation', 'Combined Science',
  'Computer Science', 'Dance', 'Design and Technology', 'Drama', 'Economics', 'Education',
  'Electronics', 'Engineering', 'English Language', 'English Literature', 'Film Studies',
  'Food Preparation and Nutrition', 'French', 'Further Maths', 'Geography', 'Geology', 'German',
  'Greek', 'History', 'Italian', 'Latin', 'Law', 'Maths', 'Media Studies', 'Medicine', 'Music',
  'Philosophy', 'Physical Education', 'Physics', 'Politics', 'Portuguese', 'Psychology',
  'Religious Studies', 'Russian', 'Sociology', 'Spanish', 'Statistics', 'Theology',
  'PGCE', 'QTS', 'DBS', 'First Aid', 'DofE Gold',
];
/* ---------- AND THE LEVELS, WHICH STOPPED AT A-LEVEL § */
const QUAL_LEVELS = [
  'Entry Level', 'SATs', '11+', 'GCSE', 'IGCSE', 'AS', 'A-Level', 'BTEC', 'T Level',
  'International Baccalaureate', 'Access to HE', 'Foundation Degree', 'HNC', 'HND',
  "Bachelor's degree", "Master's degree", 'PGCE', 'Doctorate', 'Diploma', 'Certificate',
  'Basic', 'Standard', 'Enhanced',
];
/* AND THE GRADES, spelt right ("Distinciton" was on the sheet's list), numbered and lettered, then
   the ones a BTEC and a degree give. */
const QUAL_GRADES = [
  '9', '8', '7', '6', '5', '4', '3', '2', '1', 'A*', 'A', 'B', 'C', 'D', 'E', 'U',
  'Distinction*', 'Distinction', 'Merit', 'Pass',
  'First', '2:1', '2:2', 'Third',
];
/* FIELDS WHOSE ANSWER IS SEVERAL OF THE LIST, stored as one comma-separated cell. */
/* `venues_ok` IS NOT A COLUMN of `people` — it is the venues tab's own `tutors_happy_here`, read and
   written through this one box. See `venuesWrites_` in core.gs for why there is no second copy. */
const FIELD_MULTI = { venues_ok: true };
/* ---------- AND ONE SHELF SLOT'S LIST OFF THE FIRST SLOT'S § */
function fieldOptions_(f) {
  const v = (typeof DATA !== 'undefined' && DATA && DATA.validations) || {};
  const dd = (typeof DATA !== 'undefined' && DATA && DATA.dropdowns) || {};
  const got = x => (x && x.length ? x : null);
  const first = String(f).replace(/^qual_\d+/, 'qual_1');
  if (/^qual_\d+$/.test(String(f))) return QUAL_SUBJECTS;
  if (/^qual_\d+_level$/.test(String(f))) return QUAL_LEVELS;
  if (/^qual_\d+_grade$/.test(String(f))) return QUAL_GRADES;
  return got(v[f]) || FIELD_LISTS_[f] || got(v[first])
    /* THE VENUES ON OFFER ARE THE VENUES THE SITE HAS, by the name the booking form uses for them. */
    || (f === 'venues_ok' ? got((typeof DATA !== 'undefined' && DATA && DATA.venues || [])
                                  .map(x => x && x.title).filter(Boolean)) : null)
    || null;
}

/* ONE FIELD, drawn from what is known about it. § */
/* WHICH OF YOUR OWN FIELDS KEEP A DRAFT — see the note in `fieldHtml`. A SEVERAL-OF-A-LIST DOES NOW
   (`FIELD_MULTI` was refused here while its ticks lived in `#drop`; 315 put them in the card). */
const setDraftOk_ = name => typeof draftAttr_ === 'function'
  && !/pin/i.test(String(name)) && !/^(lib\d+_|qual_)/.test(String(name));
/* ---------- AND A CARD DRAWN HOLDING ONE SAYS SO § */
const SET_HELD_SAY = 'Not saved yet — what you typed here before is still in its box. Save keeps it.';
function setHeldSay_(html) {
  return /\sdata-draft-held\b/.test(html)
    ? html.replace('<p class="faint me-said"></p>', '<p class="faint me-said">' + esc(SET_HELD_SAY) + '</p>') : html;
}
function fieldHtml(name, value, o) {
  o = o || {};
  /* THE EXTRA-SEAT FIGURE IS A SHARE OF THE RATE, NOT POUNDS, and nothing on the box said so: § */
  if (name === 'extra_seat_rate' && !o.label && !o.placeholder) {
    o = Object.assign({}, o, { label: 'extra seat: share of your rate, 0–2 (0.5 = half)',
      extra: (o.extra || '') + ' type="number" min="0" max="2" step="0.05"' });
  }
  /* AND THE BUSINESS'S CUT OF IT, PER TUTOR SINCE docs/history/345 — the same kind of figure, so the same caption and the same bounds (`seatCutRefusal_`), and it § */
  if (name === 'extra_seat_cut' && !o.label && !o.placeholder) {
    o = Object.assign({}, o, { label: o.readonly ? "@family.'s share of an extra seat — set by @family. (blank = the usual)"
      : "@family.'s share of an extra seat, 0–2 (blank = the usual)",
      extra: (o.extra || '') + ' type="number" min="0" max="2" step="0.01" inputmode="decimal"' });
  }
  const attr = o.attr || 'data-me';
  const label = o.label || fieldLabel(name);
  const ro = !!o.readonly;
  const v0 = value ?? '';
  /* ---------- AN UNSAVED EDIT IS A DRAFT (data.js; docs/history/317) § */
  const keep = attr === 'data-me' && !ro && o.draft !== false && setDraftOk_(name);
  const saved = FIELD_IS_BOOL.test(name) ? (TRUEish_(v0) ? '1' : '0') : String(v0);
  const da = keep ? draftAttr_('set', name, saved) : '';
  const dv = keep ? draftVal_('set', name, saved) : saved;
  const v = keep && !FIELD_IS_BOOL.test(name) ? dv : v0;

  if (FIELD_IS_BOOL.test(name)) {
    return `<label class="check">
      <input type="checkbox" ${attr}="${esc(name)}" ${(keep ? dv === '1' : TRUEish_(v)) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}${da}>
      <span class="box"></span><span>${esc(label)}</span></label>`;
  }

  /* ---------- SEVERAL OF A LIST IS A LIST OF CHECKBOXES, OPENED UNDER ITS FIELD § */
  if (FIELD_MULTI[name] && (o.options || []).length) {
    const got = profList_(v);
    const on = x => got.some(g => norm(g) === norm(x));
    const opts = (o.options || []).slice();
    got.forEach(g => { if (!opts.some(x => norm(x) === norm(g))) opts.push(g); });
    const said = got.join(', ');
    const key = attr + ':' + name;
    return `<div class="field many"><span class="many-cap">${esc(label)}</span>
      <input type="hidden" ${attr}="${esc(name)}" value="${esc(said)}"${da}>
      <details class="many-d" data-many="${esc(key)}"${MANY_OPEN_ === key ? ' open' : ''}><summary class="many-sum${said ? '' : ' is-unset'}"
        aria-label="${esc(label + ': ' + (said || 'nothing chosen'))}">${esc(said || 'Tap to choose')}</summary>
        <div class="many-list" role="group" aria-label="${esc(label)}">${opts.map(x => `<label class="check many-opt">
          <input type="checkbox" data-many-of="${esc(name)}" value="${esc(x)}"${on(x) ? ' checked' : ''}${
          ro ? ' disabled' : ''}><span class="box"></span><span>${esc(x)}</span></label>`).join('')}</div>
      </details></div>`;
  }

  /* A FIXED LIST IS A SELECT. § */
  const opts = o.options || [];
  if (opts.length) {
    /* A PLACEHOLDER ON A SELECT IS ITS EMPTY OPTION, and the caption goes exactly as it does for a box below: § */
    const ph = o.placeholder || '';
    return `<label class="field">${ph ? '' : `<span>${esc(label)}</span>`}
      <select ${attr}="${esc(name)}" ${ro ? 'disabled' : ''}${ph ? ` aria-label="${esc(ph)}"` : ''}${da}>
        <option value="">${ph ? esc(ph) : NONE_LABEL}</option>
        ${(v !== '' && v != null && !opts.some(x => String(x) === String(v)) ? [String(v)] : [])
          .concat(opts).map(x => `<option value="${esc(x)}"${
          String(v) === String(x) ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>`;
  }

  /* ---------- A DAY ON A CALENDAR IS A DATE INPUT § */
  if (FIELD_IS_DATE.test(name)) {
    return `<label class="field"><span>${esc(label)}</span>
      <input type="date" ${attr}="${esc(name)}" value="${esc(String(v))}"
             ${ro ? 'disabled' : ''} ${o.extra || ''}${da}></label>`;
  }

  /* NO SUGGESTION LIST (383): the owner wants no field offering past entries, so `o.suggest` is ignored. */
  const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
            : FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';

  /* ---------- A CAPTION OR A PLACEHOLDER, NEVER BOTH § */
  const hint = o.placeholder || '';

  /* EXTRA ATTRIBUTES, FOR THE CALLERS THAT NEED ONE THE NAME CANNOT IMPLY. § */
  return `<label class="field">${hint ? '' : `<span>${esc(label)}</span>`}
    <input ${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${hint ? `placeholder="${esc(hint)}"` : ''} ${o.extra || ''}
           ${pad ? `inputmode="${pad}"` : ''}${da}>
    </label>`;
}

/* ---------- WHICH SEVERAL-OF-A-LIST FIELD IS OPEN, KEPT AS STATE RATHER THAN IN THE DOM § */
let MANY_OPEN_ = '';
document.addEventListener('toggle', e => {
  const d = e.target;
  if (!d || !d.matches || !d.matches('details.many-d')) return;
  const k = d.dataset.many || '';
  /* A PERSON OPENING IT, as against a repaint drawing it open: § */
  if (d.open && MANY_OPEN_ !== k && typeof tickListShow_ === 'function') {
    tickListShow_(() => ({ list: d.querySelector('.many-list'), head: d.querySelector('summary') }),
                  () => d.isConnected && d.open);
  }
  if (d.open) MANY_OPEN_ = k;
  else if (MANY_OPEN_ === k && d.isConnected) MANY_OPEN_ = '';
}, true);

/* ---------- A TICK UNDER A SEVERAL-OF-A-LIST FIELD § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('input[type="checkbox"][data-many-of]')) return;
  const field = t.closest('.many');
  const box = field && field.querySelector(':scope > input[type="hidden"]');
  if (!box) return;
  const got = [...field.querySelectorAll('input[type="checkbox"][data-many-of]')]
    .filter(c => c.checked).map(c => c.value);
  box.value = got.join(', ');
  /* AND KEPT AS A DRAFT, as every other box on your own card is -- `draftFrom_` (data.js) skips a hidden
     input on purpose, so the ticks hand theirs over here. The saved list is the value that takes it away. */
  const spec = box.getAttribute('data-draft');
  if (spec && typeof draftKeep_ === 'function') {
    try {
      const at = spec.indexOf(':'), surface = spec.slice(0, at), id = spec.slice(at + 1);
      const was = box.getAttribute('data-draft-was') || '';
      if (typeof draftSame_ === 'function' && draftSame_(box.value, was)) draftDrop_(surface, id);
      else draftKeep_(surface, id, box.value, false, was);
    } catch (err) {}
  }
  const sum = field.querySelector('summary');
  const cap = field.querySelector('.many-cap');
  if (sum) {
    sum.textContent = box.value || 'Tap to choose';
    sum.classList.toggle('is-unset', !got.length);
    sum.setAttribute('aria-label', ((cap && cap.textContent) || '') + ': ' + (box.value || 'nothing chosen'));
  }
});

/* ---------- A TICKED HOUR SAYS SO WITH `.on` AS WELL AS WITH `:checked` § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.hr > input[type="checkbox"]')) return;
  t.parentNode.classList.toggle('on', t.checked);
});

/* ---------- BOXES THAT ARE ONE QUESTION SIT ON ONE LINE § */
const FIELD_ROWS = [
  { fields: ['first_name', 'last_name'] },
  { fields: ['adjective_1', 'adjective_2', 'adjective_3'], cap: 'you, in three words',
    ph: ['word 1', 'word 2', 'word 3'] },
  { fields: ['years_experience', 'favourite_colour'] },
  { fields: ['photo', 'video'] },
  { fields: ['city', 'town'] },
  { fields: ['borough', 'postcode'] },
  /* A STUDENT'S TWO EXAMS SIDE BY SIDE, now they share About you with a name and a photo: two date
     pickers are one row, which is what let them join that page rather than cost a card of their own. */
  { fields: ['exam_small_date', 'exam_big_date'] },
  /* "max and min number of students could more efficiently be written as '[] - []'."* One row, one caption, a dash between — and MIN FIRST although the backend § */
  { fields: ['min_students', 'max_students'], cap: 'students', ph: ['min', 'max'], dash: true },
  /* THE AGES A TUTOR TEACHES, THE SAME `[ ] – [ ]` SHAPE AS THE STUDENTS ABOVE, so the two ranges a tutor states read alike although they live on different pages. § */
  { fields: ['age_min', 'age_max'], cap: 'ages you teach', ph: ['youngest', 'oldest'], dash: true },
  /* AND HOW LONG A SESSION IS, THE THIRD RANGE — two selects off `SESSION_OPTIONS` (constants.gs), whole hours, the same `[ ] – [ ]`. § */
  { fields: ['min_hours', 'max_hours'], cap: 'session, in hours', ph: ['shortest', 'longest'], dash: true },
];
const ROW_LABEL = {
  years_experience: 'years teaching',
  /* `photo` HAS NO LABEL because it has no box any more on your own settings — see `photoPicker_`. */
  video: 'video link',
  travel_km: 'will travel (km)', favourite_colour: 'favourite colour',
  venues_ok: 'venues you teach at',
};
function fieldRows_(list, one) {
  const out = [], done = new Set();
  list.forEach(f => {
    if (done.has(f)) return;
    /* ANY field of a row places it, not only its first: a row can now read in a different order
       from the backend's list (the students range is min–max over a list that says max, min). */
    const row = FIELD_ROWS.find(r => r.fields.indexOf(f) !== -1 && r.fields.every(x => list.indexOf(x) !== -1));
    if (!row) { out.push(one(f, {})); return; }
    row.fields.forEach(x => done.add(x));
    const boxes = row.fields.map((x, i) => one(x, row.cap ? { placeholder: row.ph[i] } : {}))
      .join(row.dash ? '<span class="f-dash" aria-hidden="true">–</span>' : '');
    out.push(row.cap
      ? `<div class="f-rowwrap"><span class="dob-cap">${esc(row.cap)}</span>
           <div class="f-row${row.dash ? ' is-range' : ''}" style="--n:${row.fields.length}">${boxes}</div></div>`
      : `<div class="f-row" style="--n:${row.fields.length}">${boxes}</div>`);
  });
  return out.join('');
}

/* A WHOLE FORM, from a group table. § */
/* A GROUP OF HOUR CODES IS A TIMETABLE. § */
const isTimetable_ = list => (list || []).length > 12
  && (list || []).every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));

/* ---------- AND A GROUP OF `libN_*` NAMES IS A SHELF OF LIBRARY CARDS § */
const isLibraryCard_ = f => /^lib\d+_(name|no|pin)$/.test(String(f || ''));

/* ---------- AND `library_note` IS NOT DRAWN, WHATEVER THE BACKEND SENDS § */
const RETIRED_FIELDS_ = ['library_note'];

/* ---------- AND A DATE OF BIRTH IS THREE BOXES, NOT ONE § */
const isDobBox_ = f => /^dob_[dmy]$/.test(String(f || ''));
const isDob_ = list => (list || []).some(isDobBox_);

function dobBoxes_(value) {
  /* NO SAVED BIRTHDAY OFFERED (383) — no field suggests; `maxlength` stops a third digit in a two-digit box. */
  const box = (f, hint, len) => fieldHtml(f, value(f), {
    placeholder: hint,
    extra: `inputmode="numeric" maxlength="${len}" autocomplete="off" size="${len}"`,
  });
  return `<div class="dob-row" role="group" aria-label="Date of birth">
    <span class="dob-cap">date of birth</span>
    <div class="dob-boxes">
      ${box('dob_d', 'DD', 2)}
      ${box('dob_m', 'MM', 2)}
      ${box('dob_y', 'YYYY', 4)}
    </div>
  </div>`;
}
const isLibrary_ = list => (list || []).some(isLibraryCard_);

/* ---------- A SHELF SHOWS WHAT IS FILLED IN, ONE EMPTY SLOT, AND A WAY TO ASK FOR ANOTHER § */
function shelfSlots_(nums, filled, draw) {
  let last = 0;
  nums.forEach((n, i) => { if (filled(n)) last = i + 1; });
  /* NO SPARE EMPTY SLOT ONCE ONE IS FILLED — `Add another` IS the empty slot, one tap away. § */
  const show = Math.min(nums.length, Math.max(1, last));
  return nums.map((n, i) => draw(n, i >= show)).join('')
    + (show < nums.length
      ? `<button class="btn quiet shelf-more" data-do="shelf-more">Add another</button>` : '');
}
const shelfFilled_ = (value, names) => names.some(f => String(value(f) ?? '').trim() !== '');

on('shelf-more', el => {
  const shelf = el.closest('.lib-shelf');
  const next = shelf && shelf.querySelector('.lib-card[hidden]');
  if (next) {
    next.hidden = false;
    const box = next.querySelector('input, select');
    try { if (box) box.focus({ preventScroll: true }); } catch {}
  }
  if (!shelf || !shelf.querySelector('.lib-card[hidden]')) el.remove();
});

/* ---------- AND A GROUP OF `qual_N*` NAMES IS A SHELF OF QUALIFICATIONS -------------------------
   RECOGNISED BY THE NAMES, NEVER BY THE GROUP'S TITLE, exactly as the library shelf is. */
const isQualField_ = f => /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/.test(String(f || ''));
const isQuals_ = list => (list || []).some(isQualField_);
/* THE SEVEN BOXES OF ONE SLOT, in the order they are read, compared and put back. */
const QUAL_KEYS = ['', '_level', '_grade', '_board', '_received', '_spec', '_teach'];
/* ---------- ONE LINE A QUALIFICATION, AND THE LINE IS THE DOOR § */
/* THE CERTIFICATES ARE THE TAILS OF THE TWO LISTS — the same tails `QUAL_CERTS` in core.gs copies, and `check-people.js` holds that copy to these. § */
const QUAL_CERT_SUBJECTS_ = QUAL_SUBJECTS.slice(QUAL_SUBJECTS.indexOf('PGCE'));
const QUAL_CERT_LEVELS_ = QUAL_LEVELS.slice(QUAL_LEVELS.indexOf('Basic'));
function qualShelf_(list, value) {
  const nums = [...new Set((list || []).filter(isQualField_)
    .map(f => String(f).match(/^qual_(\d+)/)[1]))];
  const v = (i, k) => String(value('qual_' + i + (k || '')) ?? '').trim();
  const filled = i => ['', '_level', '_board', '_grade', '_received'].some(k => v(i, k) !== '');
  const groups = [];
  const byKey = {};
  nums.filter(filled).forEach(i => {
    const key = norm(v(i)) || ('#' + i);
    if (!byKey[key]) { byKey[key] = { subject: v(i), slots: [] }; groups.push(byKey[key]); }
    byKey[key].slots.push(i);
  });
  const pool = nums.filter(i => !filled(i));
  /* YOUR SUBJECTS, for the top of every subject list — see `qualPick_`. */
  const mine = groups.map(g => g.subject).filter(Boolean);
  /* A SUBJECT'S COLUMN IS AS WIDE AS ITS OWN NAME, in `ch` because the face is monospaced — so its notation sits right after it, as on the profile chip, and its § */
  const wide = g => Math.min(18, Math.max(3, String(g.subject || '').length)) + 1;
  const empty = !groups.length;
  return `<div class="q-shelf${empty ? ' is-empty' : ''}">
    ${empty ? `<p class="q-hint">Add what you studied and the certificates you hold — the subject, then the level.</p>` : ''}
    <div class="q-list">${groups.map(g => `<div class="q-subj" style="--q-w:${wide(g)}ch">${
      g.slots.map((i, n) => qualSlot_(i, value, { first: n === 0, mine })).join('')}</div>`).join('')}</div>
    <div class="q-pool" hidden>${pool.map(i => qualSlot_(i, value, { mine })).join('')}</div>
    <div class="tile-row q-adds">${tile_({ icon: 'plus', label: 'Add a qualification', act: 'qual-add', off: !pool.length, data: { unlocked: '' },
      note: pool.length ? pool.length + ' more fit' : 'ten is the most' })}</div>
    ${pool.length ? '' : `<p class="faint q-full">Ten is the most this card holds — remove one to add another.</p>`}
  </div>`;
}
/* ---------- ONE QUALIFICATION: ITS LINE, AND ITS EDITOR UNDER IT § */
function qualSlot_(i, value, o) {
  o = o || {};
  const f = k => 'qual_' + i + k;
  const val = k => String(value(f(k)) ?? '').trim();
  const q = { subject: val(''), level: val('_level'), grade: val('_grade'), board: val('_board'),
              received: val('_received'), spec: TRUEish_(val('_spec')) };
  q.teach = q.spec || TRUEish_(val('_teach'));
  q.first = !!o.first;
  /* ONE CONTROL THAT CYCLES (440): each tap moves Not teaching → Can teach → Teaches → Not teaching. */
  /* TEACHING IS ONE ROW WITH THE PHONE'S OWN PICKER; the line's mark (`q-mark-b`) still cycles without opening it. */
  const tv = qualTeachKey_(q);
  const cyc = `<label class="field q-f q-cyc"><span>Teaching</span><select class="q-teach" data-unlocked aria-label="Teaching">${
      QUAL_TEACH_OPTS_.map(([k, say]) => `<option value="${k}"${k === tv ? ' selected' : ''}>${say}</option>`).join('')}</select></label>`;
  const said = qualSay_(q);
  /* EACH CAPTION IN TWO WORDINGS, a subject's and a certificate's, and the slot's `is-cert` says which
     is shown — so a line that becomes a DBS by a pick changes its captions with no redraw. */
  const cap = (std, cert) => `<span class="q-cap-std">${esc(std)}</span><span class="q-cap-cert">${esc(cert)}</span>`;
  return `<div class="q-slot${qualIsCert_(q) ? ' is-cert' : ''}" data-slot="${esc(i)}"${q.first ? ' data-first="1"' : ''}>
    <input type="hidden" data-me="${esc(f('_spec'))}" value="${q.spec ? 'TRUE' : 'FALSE'}">
    <input type="hidden" data-me="${esc(f('_teach'))}" value="${q.teach ? 'TRUE' : 'FALSE'}">
    <button type="button" class="q-line" data-do="qual-open" data-unlocked aria-expanded="false"
      aria-label="${esc(said)}" title="${esc(said)}">${qualFace_(q)}</button>
    <button type="button" class="q-mark-b" data-do="qual-teach" data-face="1" data-unlocked
      aria-label="Teaching: ${esc(qualTeachWord_(q))}, tap to change">${qualTeachVal_(q)}</button>
    <div class="q-ed">
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f(''))}" class="q-name"`, q.subject, QUAL_SUBJECTS, 'Subject', 'Choose', o.mine)}
        ${qualPick_(`data-me="${esc(f('_level'))}"`, q.level, QUAL_LEVELS, 'Level', 'Choose')}
      </div>
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f('_grade'))}"`, q.grade, QUAL_GRADES, 'Grade', 'None yet').replace('class="field q-f"', 'class="field q-f q-grade"')}
        <label class="field q-f">${cap('Finished', 'Year')}
          <select data-me="${esc(f('_received'))}">${qualYears_(q.received).map(y => `<option value="${esc(y)}"${
            y === q.received ? ' selected' : ''}>${esc(y === 'Present' ? 'Still studying' : y)}</option>`).join('')}
            <option value=""${q.received ? '' : ' selected'}>Not sure</option></select></label>
        <label class="field q-f q-school">${cap('School, college or uni', 'Issued by')}
          <input type="text" data-me="${esc(f('_board'))}" value="${esc(q.board)}" autocomplete="off"></label>
      </div>
      ${cyc}
      <div class="tile-row q-tiles">${tile_({ icon: 'save', label: 'Done', act: 'qual-done', data: { unlocked: '' } })}${
        tile_({ icon: 'bin', label: 'Remove', note: [q.subject, q.level].filter(Boolean).join(' ') || 'this one', act: 'qual-drop',
                data: { unlocked: '' } })}</div>
    </div>
  </div>`;
}
/* THE FACE OF A LINE: the subject (on a subject's first line only), the notation, the teaching mark —
   none on a certificate, which is held and not taught (see `qualIsCert_`). */
function qualFace_(q) {
  const who = q.first || q.fresh ? (q.subject || (q.fresh ? 'New qualification' : '')) : '';
  const cert = qualIsCert_(q);
  return `<span class="q-who${q.subject ? '' : ' is-none'}">${esc(who)}</span>`
    + `<span class="q-note">${qualIso_(q)}</span>`
    + `<span class="q-mark">${cert ? '' : q.spec ? '<span class="q-chip">Teach</span>'
      : q.teach ? '<span class="q-can">Can teach</span>' : ''}</span>`;
}
/* THE TEACHING STATE IN WORDS, and drawn: gold for Teaches, plain for Can teach, faint for Not teaching. */
const qualTeachKey_ = q => q.spec ? 'spec' : q.teach ? 'teach' : 'no';
const QUAL_TEACH_OPTS_ = [['teach', 'Can teach'], ['spec', 'Teaches'], ['no', 'Not teaching']];
function qualTeachWord_(q) { return q.spec ? 'Teaches' : q.teach ? 'Can teach' : 'Not teaching'; }
function qualTeachVal_(q) {
  return `<span class="q-cyc-v is-${q.spec ? 'spec' : q.teach ? 'teach' : 'no'}">${qualTeachWord_(q)}</span>`;
}
/* ---------- A CERTIFICATE IS HELD, NOT STUDIED AND NOT TAUGHT § */
function qualIsCert_(q) {
  const isIn = (list, x) => !!x && list.some(y => norm(y) === norm(x));
  return isIn(QUAL_CERT_SUBJECTS_, q.subject) || isIn(QUAL_CERT_LEVELS_, q.level);
}
/* ---------- THE NOTATION, BY THE PROFILE CHIP'S RULES § */
function qualIso_(q) {
  const level = norm(q.level) === norm(q.subject) ? '' : (q.level || '');
  const low = q.grade ? esc(q.grade) : /^present$/i.test(q.received || '') ? '<i>studying</i>' : '';
  if (qualIsCert_(q) || !(level || low)) {
    return `<span class="q-plain">${esc([level, q.grade].filter(Boolean).join(' '))}</span>`;
  }
  return `<span class="prof-iso">${level ? `<sup>${esc(level)}</sup>` : ''}${low ? `<sub>${low}</sub>` : ''}</span>`;
}
/* THE LINE'S NAME: the profile chip's own sentence (`profQualSay_`) and the teaching word — so a screen
   reader and a pointer get the place and the year the face leaves off. */
function qualSay_(q) {
  const base = typeof profQualSay_ === 'function' ? profQualSay_(q)
    : [q.subject, q.level, q.grade && 'grade ' + q.grade, q.board && 'at ' + q.board, q.received].filter(Boolean).join(', ');
  return (base || 'New qualification') + (q.spec ? ', teach' : q.teach ? ', can teach' : '');
}
/* ---------- A DROP-DOWN WITH A CAPTION, AND `Something else…` AT THE FOOT § */
const QUAL_OTHER = '__other';
function qualPick_(attrs, v, list, cap, none, mine) {
  v = String(v ?? '');
  const has = x => !!v && norm(x) === norm(v);
  const yours = [...new Set((mine || []).filter(Boolean))];
  const opts = (v && !list.some(has) && !yours.some(has) ? [v] : []).concat(list);
  let chosen = false;
  const opt = x => {
    const on = !chosen && has(x);
    if (on) chosen = true;
    return `<option value="${esc(x)}"${on ? ' selected' : ''}>${esc(x)}</option>`;
  };
  const body = yours.length
    ? `<optgroup label="Your subjects">${yours.map(opt).join('')}</optgroup><optgroup label="Every subject">${opts.map(opt).join('')}</optgroup>`
    : opts.map(opt).join('');
  return `<label class="field q-f"><span>${esc(cap)}</span><select ${attrs}>
      <option value="">${esc(none)}</option>
      ${body}
      <option value="${QUAL_OTHER}">Something else…</option>
    </select></label>`;
}
/* `Something else…` swaps the select for a box carrying the same attributes, so a save reads it exactly
   as it read the select — and it saves on the box's own `change`, when the typing is finished. */
document.addEventListener('change', e => {
  const sel = e.target;
  if (!sel || sel.tagName !== 'SELECT' || sel.value !== QUAL_OTHER || !sel.closest('.q-shelf')) return;
  const box = document.createElement('input');
  box.type = 'text'; box.autocomplete = 'off'; box.placeholder = 'Type it here';
  [...sel.attributes].forEach(a => box.setAttribute(a.name, a.value));
  sel.replaceWith(box);
  qualDirty_(box);
  try { box.focus({ preventScroll: true }); } catch {}
}, true);
/* THE SLOT'S ANSWERS, READ OFF ITS BOXES — `Something else…` not yet typed counts as no answer. */
function qualRead_(slot) {
  const i = slot.dataset.slot;
  const get = k => {
    const b = slot.querySelector('[data-me="qual_' + i + k + '"]');
    const x = String(b ? b.value : '').trim();
    return x === QUAL_OTHER ? '' : x;
  };
  const q = { subject: get(''), level: get('_level'), grade: get('_grade'), board: get('_board'),
              received: get('_received'), spec: TRUEish_(get('_spec')) };
  q.teach = q.spec || TRUEish_(get('_teach'));
  q.first = !!slot.dataset.first;
  q.fresh = !!slot.dataset.new;
  return q;
}
/* THE LINE FOLLOWS THE BOXES, so an open line is the preview of what is being saved. */
function qualFaceNow_(slot) {
  const line = slot && slot.querySelector(':scope > .q-line');
  if (!line) return;
  const q = qualRead_(slot);
  slot.classList.toggle('is-cert', qualIsCert_(q));
  line.innerHTML = qualFace_(q);
  const said = qualSay_(q);
  line.setAttribute('aria-label', said);
  line.setAttribute('title', said);
  const lab = 'Teaching: ' + qualTeachWord_(q) + ', tap to change';
  slot.querySelectorAll('[data-do="qual-teach"]').forEach(b => {
    b.setAttribute('aria-label', lab);
    const v = b.querySelector('.q-cyc-v');
    if (v) v.outerHTML = qualTeachVal_(q);
  });
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  const slot = t && t.closest && t.closest('.q-shelf .q-slot');
  if (slot) qualFaceNow_(slot);
}));
/* ---------- THE NEXT BOX THE PERSON NEEDS, GIVEN THE FOCUS — NOT OPENED § */
function qualNext_(sel) {
  setTimeout(() => {
    if (sel && sel.isConnected && !sel.disabled) { try { sel.focus({ preventScroll: true }); } catch (e) {} }
  }, 0);
}
/* ---------- AN ANSWER CHOSEN IS AN ANSWER SAVED § */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-me]') || t.value === QUAL_OTHER) return;
  const slot = t.closest('.q-shelf .q-slot.is-open');
  if (!slot) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && q.subject && !q.level && t.matches('.q-name')) {
    qualNext_(slot.querySelector('select[data-me$="_level"]'));
    return;
  }
  qualCommit_(slot);
});
/* PROGRAMMATIC CHANGES DO NOT FIRE `input`, so a card changed by a button marks itself dirty — see `settingsKeep_`: § */
const qualDirty_ = el => { const f = el && el.closest('.me-form'); if (f) f.dataset.dirty = '1'; };
/* NOT ON A CARD BEING EDITED: there the line is one answer among the card's, and the card stays held
   until its own Save or Cancel — a shut line is not a saved card. */
const qualClean_ = el => { const f = el && el.closest('.me-form'); if (f && !f.closest('.card-ed')) delete f.dataset.dirty; };
/* THE SLOT'S SEVEN VALUES, as they were last saved (`data-was`) and as the boxes hold them now. */
function qualValues_(slot) {
  const out = {};
  const i = slot.dataset.slot;
  QUAL_KEYS.forEach(k => { const b = slot.querySelector('[data-me="qual_' + i + k + '"]'); out['qual_' + i + k] = b ? b.value : ''; });
  return out;
}
const qualBlank_ = slot => {
  const out = {};
  QUAL_KEYS.forEach(k => { out['qual_' + slot.dataset.slot + k] = /_spec$|_teach$/.test(k) ? 'FALSE' : ''; });
  return out;
};
function qualSet_(slot, vals) {
  Object.keys(vals).forEach(f => { const b = slot.querySelector('[data-me="' + f + '"]'); if (b) b.value = vals[f]; });
}
/* ---------- REDRAWN FROM WHAT THE BOXES HOLD § */
function qualRedraw_(shelf, over, open) {
  if (!shelf || !shelf.isConnected) return null;
  /* A KEYBOARD STAYS WHERE IT WAS. The line that was pressed is replaced, and focus on a removed
     element falls to the page — so a line opened from the keyboard hands focus to its new self. */
  const had = shelf.contains(document.activeElement);
  const vals = {}, list = [];
  shelf.querySelectorAll('[data-me]').forEach(b => { list.push(b.dataset.me); vals[b.dataset.me] = b.value; });
  Object.assign(vals, over || {});
  const hold = document.createElement('div');
  hold.innerHTML = qualShelf_(list, f => vals[f] ?? '');
  const next = hold.firstElementChild;
  shelf.replaceWith(next);
  const again = open != null && next.querySelector('.q-list .q-slot[data-slot="' + open + '"]');
  if (again) {
    qualOpen_(again);
    if (had) { try { again.querySelector('.q-line').focus({ preventScroll: true }); } catch (e) {} }
  } else if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(next)); } catch (e) {} }
  /* ON A CARD BEING EDITED THE SHELF IS PART OF THE CARD'S ONE DRAFT, and a redraw is a change no
     `input` reports — a line put back to the pool, a removal — so the draft is written again here. */
  const ed = next.closest('.card-ed .me-form');
  if (ed && typeof cardKeep_ === 'function') cardKeep_(ed);
  return next;
}
/* WHICH COLUMN THE SHELF IS ON — Tutor settings, or Tutors when it is a card's (`cardEditHtml_`). */
const qualColumn_ = el => colOfEl_(el) || 'staff';
/* WHAT SHUTTING THE OPEN LINE PUTS BACK: § */
function qualOver_(shelf) {
  const over = {};
  shelf.querySelectorAll('.q-slot.is-open').forEach(s => {
    if (s.dataset.new) return Object.assign(over, qualBlank_(s));
    try { Object.assign(over, JSON.parse(s.dataset.was || '{}')); } catch (e) {}
  });
  return over;
}
function qualOpen_(slot) {
  const shelf = slot && slot.closest('.q-shelf');
  if (!shelf) return;
  slot.classList.add('is-open');
  const line = slot.querySelector(':scope > .q-line');
  if (line) line.setAttribute('aria-expanded', 'true');
  if (!slot.dataset.was) slot.dataset.was = JSON.stringify(slot.dataset.new ? qualBlank_(slot) : qualValues_(slot));
  qualDirty_(slot);
  if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(slot)); } catch (e) {} }
}
/* THE LINE OPENS — and whatever else was open shuts first, as it was last saved. § */
on('qual-open', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf) return;
  if (slot.classList.contains('is-open')) return qualDone_(slot);
  qualReopen_(shelf, slot);
});
/* THE SLOT OPEN IN A FRESH SHELF — a saved line in its place, an empty one as a new line at the foot —
   with whatever was open before shut as it was last saved. Answers the slot as it is in the new shelf. */
function qualReopen_(shelf, slot) {
  const i = slot.dataset.slot, pooled = !!slot.closest('.q-pool');
  const next = qualRedraw_(shelf, qualOver_(shelf), pooled ? null : i);
  const again = next && next.querySelector('.q-slot[data-slot="' + i + '"]');
  if (again && pooled) qualStart_(next, again);
  return again;
}
/* ---------- THE TICK: ANYTHING NOT YET SAVED IS SAVED, AND THE LINE SHUTS § */
on('qual-done', el => { if (qualWhenSaved_(el)) return; const slot = el.closest('.q-slot'); if (slot) qualDone_(slot); });
function qualDone_(slot) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && !(q.subject && q.level)) {
    qualClean_(shelf);
    qualRedraw_(shelf, qualBlank_(slot));
    if (q.subject || q.level) toast('Nothing was added — a qualification needs a subject and a level.');
    return;
  }
  qualCommit_(slot, () => { qualClean_(shelf); qualRedraw_(shelf); });
}
/* ---------- A PRESS THAT LANDS WHILE A SAVE IS OUT WAITS FOR IT § */
let QUAL_SAVING = null, QUAL_NEXT = null;
function qualSave_(el) {
  /* ---------- ON A CARD BEING EDITED, AN ANSWER IS KEPT, NOT SENT § */
  const ed = el && el.closest && el.closest('.card-ed .me-form');
  if (ed && typeof cardKeep_ === 'function') { ed.dataset.dirty = '1'; cardKeep_(ed); return Promise.resolve(true); }
  const p = meSave_(el);
  QUAL_SAVING = p;
  const clear = () => { if (QUAL_SAVING === p) QUAL_SAVING = null; };
  p.then(clear, clear);
  return p;
}
function qualWhenSaved_(el) {
  if (!QUAL_SAVING || !el) return false;
  const act = el.dataset.do, v = el.dataset.v || '';
  const slot = el.closest('.q-slot'), i = slot ? slot.dataset.slot : '';
  const form = el.closest('.me-form');
  const mine = QUAL_NEXT = {};
  QUAL_SAVING.then(ok => {
    if (QUAL_NEXT !== mine) return;
    QUAL_NEXT = null;
    if (!ok) return;
    const shelf = (form && form.isConnected && form.querySelector('.q-shelf')) || document.querySelector('#s-staff .q-shelf, #s-account .q-shelf');
    if (!shelf) return;
    const again = act === 'qual-add' ? shelf.querySelector('[data-do="qual-add"]')
      : shelf.querySelector('.q-slot[data-slot="' + i + '"] [data-do="' + act + '"]' + (v ? '[data-v="' + v + '"]' : ''));
    if (again && !again.disabled && ACTIONS[act]) ACTIONS[act](again);
  }, () => {});
  return true;
}
/* ---------- ONE SAVE: THE CARD'S OWN § */
function qualCommit_(slot, after) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const i = slot.dataset.slot;
  const q = qualRead_(slot);
  if (!q.subject || !q.level) {
    if (!slot.dataset.new) toast(q.subject ? 'Choose a level — nothing was saved.' : 'Choose a subject — nothing was saved.');
    return;
  }
  /* A CERTIFICATE KEEPS NO GRADE AND NO TEACHING TICK — its editor has neither box to show, and an answer nobody can see is one nobody can take back. § */
  if (qualIsCert_(q)) {
    qualSet_(slot, { ['qual_' + i + '_grade']: '', ['qual_' + i + '_spec']: 'FALSE', ['qual_' + i + '_teach']: 'FALSE' });
    qualFaceNow_(slot);
  }
  if (JSON.stringify(qualValues_(slot)) === slot.dataset.was) { if (after) after(); return; }
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) {}
  const moved = !!slot.dataset.new || norm(was['qual_' + i] || '') !== norm(q.subject);
  qualSave_(slot.querySelector('[data-do="qual-done"]') || slot).then(ok => {
    if (!ok || !slot.isConnected) return;
    slot.dataset.was = JSON.stringify(qualValues_(slot));
    delete slot.dataset.new;
    if (after) return after();
    qualDirty_(slot);
    if (moved) qualRedraw_(shelf, null, i);
  });
}
/* THE CYCLE, written into the two hidden boxes and saved. The line's own mark cycles without opening the line. § */
const QUAL_CYCLE_ = { no: 'teach', teach: 'spec', spec: 'no' };
on('qual-teach', el => {
  if (qualWhenSaved_(el)) return;
  let slot = el.closest('.q-slot');
  const shelf = el.closest('.q-shelf'), face = !!el.dataset.face;
  if (!slot || !shelf) return;
  if (!face && !slot.classList.contains('is-open')) {
    slot = qualReopen_(shelf, slot);
    if (!slot) return;
  }
  const q = qualRead_(slot);
  if (qualIsCert_(q)) return;
  qualTeachTo_(slot, el, face, QUAL_CYCLE_[qualTeachKey_(q)]);
});
/* THE PICKER'S ANSWER, written the same way the mark's cycle is. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.q-shelf select.q-teach')) return;
  let slot = t.closest('.q-slot');
  const shelf = t.closest('.q-shelf'), v = t.value;
  if (slot && !slot.classList.contains('is-open')) slot = qualReopen_(shelf, slot);
  if (!slot || qualIsCert_(qualRead_(slot))) return;
  qualTeachTo_(slot, t, false, v);
});
function qualTeachTo_(slot, el, face, v) {
  const i = slot.dataset.slot;
  qualSet_(slot, { ['qual_' + i + '_spec']: v === 'spec' ? 'TRUE' : 'FALSE',
                   ['qual_' + i + '_teach']: v === 'no' ? 'FALSE' : 'TRUE' });
  qualFaceNow_(slot);
  slot.querySelectorAll('select.q-teach').forEach(sel => { sel.value = v; });
  if (face && !slot.classList.contains('is-open')) { qualSave_(slot).then(ok => { if (ok && slot.isConnected) slot.dataset.was = JSON.stringify(qualValues_(slot)); }); return; }
  qualDirty_(el);
  qualCommit_(slot);
}
/* THE NEXT UNUSED SLOT. Moving the element keeps every `data-me` in the form, so a save posts it
   wherever it sits. The `+` is off once the pool is empty (see `qualShelf_`), so this sentence is for a
   press that raced a redraw. */
function qualTake_(shelf) {
  const slot = shelf && shelf.querySelector('.q-pool > .q-slot');
  if (!slot) toast('That is the most this card holds — ten qualifications in all.');
  return slot || null;
}
/* ---------- `+`: A NEW LINE AT THE FOOT, ITS SUBJECT BOX READY § */
on('qual-add', el => {
  if (qualWhenSaved_(el)) return;
  const shelf = el.closest('.q-shelf');
  if (!shelf) return;
  const next = qualRedraw_(shelf, qualOver_(shelf));
  const slot = qualTake_(next);
  if (slot) qualStart_(next, slot);
});
/* AN EMPTY SLOT, MOVED OUT OF THE POOL AS A NEW LINE AT THE FOOT OF THE LIST, open, emptied and marked
   new — so a Done or a bin before it has a subject and a level puts it back unsaved. */
function qualStart_(next, slot) {
  qualSet_(slot, qualBlank_(slot));
  slot.dataset.new = '1';
  const group = document.createElement('div');
  group.className = 'q-subj is-new';
  group.appendChild(slot);
  next.querySelector('.q-list').appendChild(group);
  qualFaceNow_(slot);
  qualOpen_(slot);
  try { slot.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  qualNext_(slot.querySelector('select.q-name'));
}
/* ---------- REMOVING SAVES AT ONCE § */
function qualRemove_(el, slots, said) {
  const shelf = el.closest('.q-shelf');
  if (!shelf || !slots.length) return;
  const was = slots.map(qualValues_);
  slots.forEach(s => qualSet_(s, qualBlank_(s)));
  qualSave_(el).then(ok => {
    /* ON A CARD THE REMOVAL WAITS FOR ITS SAVE, so "Removed" would say what has not happened. */
    if (ok) { if (!el.closest('.card-ed')) toast(said); qualRedraw_(shelf); }
    else slots.forEach((s, n) => qualSet_(s, was[n]));
  });
}
on('qual-drop', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf) return;
  if (slot.dataset.new) { qualClean_(shelf); qualRedraw_(shelf, qualBlank_(slot)); return; }
  const q = qualRead_(slot);
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) {}
  const i = slot.dataset.slot;
  /* NAMED BY WHAT WAS SAVED, which is what is being removed — not by a half-changed box. */
  const name = [was['qual_' + i] || q.subject, was['qual_' + i + '_level'] || q.level].filter(Boolean).join(' ');
  qualRemove_(el, [slot], 'Removed ' + (name || 'that qualification') + '.');
});
/* ---------- WHEN IT WAS RECEIVED, AND WHETHER YOU TEACH IT § */
/* ---------- *"phone: have field for country code, then number."* § */
function phoneRow_(value) {
  const cc = String(value('phone_cc') || '') || '+44';
  /* THE NUMBER IS A DRAFT UNTIL SAVED, as every box of your own row is (`fieldHtml`; 317). */
  const phoneNo = String(value('phone_no') || (value('phone_cc') ? '' : value('phone')) || '');
  const codes = (Array.isArray(DATA && DATA.phoneCodes) && DATA.phoneCodes.length) ? DATA.phoneCodes.slice() : ['+44'];
  if (codes.indexOf(cc) === -1) codes.unshift(cc);
  return `<div class="f-rowwrap"><span class="dob-cap">phone</span>
    <div class="f-row is-phone">
      <label class="field"><select data-me="phone_cc" aria-label="Country code">
        ${codes.map(x => `<option value="${esc(x)}"${x === cc ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>
      <label class="field"><input type="tel" data-me="phone_no" inputmode="tel" autocomplete="off"
        placeholder="Number" value="${esc(draftVal_('set', 'phone_no', phoneNo))}"${draftAttr_('set', 'phone_no', phoneNo)}></label>
    </div></div>`;
}
function qualYears_(current) {
  const now = new Date().getFullYear(), out = ['Present'];
  for (let y = now; y >= now - 60; y--) out.push(String(y));
  if (current && out.indexOf(String(current)) === -1) out.splice(1, 0, String(current));
  return out;
}
/* ---------- ONE SHELF, ONE CARD PER LIBRARY § */
function libraryShelf_(list, value) {
  const all = [...new Set((list || []).filter(isLibraryCard_)
    .map(f => String(f).match(/^lib(\d+)_/)[1]))];
  const quiet = 'spellcheck="false"';
  const has = i => shelfFilled_(value, ['lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin']);
  /* ONE CARD ONLY (489, the owner on Library cards: "change this to be only 1 card allowed") — the one already
     filled, else the first; no Add another, and a new card is written over it. */
  /* A RULE (496): `library-one-card` — Universal, every slot with Add another, like any shelf. */
  const nums = !(typeof ruleOn_ !== 'function' || ruleOn_('library-one-card')) ? all : all.length ? [all.find(has) || all[0]] : [];
  return `<div class="lib-shelf">${shelfSlots_(nums,
    has,
    (i, hide) => `
    <div class="lib-card"${hide ? ' hidden' : ''}>
      <div class="lib-face" role="group" aria-label="Library card ${esc(i)}">
        <span class="lib-cap" aria-hidden="true">Library card</span>
        <div class="lib-name">${fieldHtml('lib' + i + '_name', value('lib' + i + '_name'),
          { placeholder: 'Library name', extra: quiet + ' aria-label="Library name"' })}</div>
        <div class="lib-pin">${fieldHtml('lib' + i + '_pin', value('lib' + i + '_pin'),
          { label: 'PIN', extra: quiet + ' autocomplete="off" placeholder=" "' })}</div>
        ${libBars_(value('lib' + i + '_no'))}
        <div class="lib-no">${fieldHtml('lib' + i + '_no', value('lib' + i + '_no'),
          { placeholder: 'Card number', extra: quiet + ' autocomplete="off" aria-label="Card number"' })}</div>
      </div>
    </div>`)}</div>`;
}

/* ---------- THE BARCODE IS A PICTURE OF ONE, AND NOT ONE § */
function libBarsOf_(no) {
  const s = String(no ?? '').trim();
  const w = [];
  if (!s) { for (let i = 0; i < 24; i++) w.push(2, 2); w.pop(); return w; }
  let h = hashOf(s) || 0x9e3779b9;
  const next = n => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return 1 + (h % n); };
  w.push(1, 1, 1, 2);
  let at = 5;
  while (at < 84) { const bar = next(4), gap = next(3); w.push(bar, gap); at += bar + gap; }
  w.push(1, 1, 1);
  return w;
}
function libBars_(no) {
  const w = libBarsOf_(no);
  let x = 0, d = '';
  w.forEach((n, i) => { if (i % 2 === 0) d += 'M' + x + ' 0h' + n + 'v1h-' + n + 'z'; x += n; });
  const blank = !String(no ?? '').trim();
  return `<svg class="lib-bars${blank ? ' is-blank' : ''}" viewBox="0 0 ${x} 1" preserveAspectRatio="none"
    shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}
/* THE BARS FOLLOW THE NUMBER as it is typed, the photograph shelf's thumbnail one rule down: the card
   is a preview of itself, so what is printed under the bars and the bars cannot disagree. */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.lib-no input')) return;
  const bars = t.closest('.lib-face') && t.closest('.lib-face').querySelector('.lib-bars');
  if (bars) bars.outerHTML = libBars_(t.value);
});

/* ---------- AND A CARD GIVES UP ITS BLANK BAND BEFORE THE PAGE IS DRAWN SMALLER § */
function libFit_(pane) {
  try {
    const first = pane.querySelector('.lib-face');
    const shelf = first && first.closest('.lib-shelf');
    if (!shelf) return;
    shelf.style.removeProperty('--lib-w');
    const faces = [...shelf.querySelectorAll('.lib-card:not([hidden]) > .lib-face')];
    if (!faces.length || !(pane.clientHeight > 0)) return;
    for (let pass = 0; pass < 3; pass++) {
      const over = pane.scrollHeight - pane.clientHeight;
      if (!(over > 2)) return;
      const h = faces[0].getBoundingClientRect().height;
      /* THE BLANK BAND IS THE FACE'S THIRD ROW, `minmax(0, 1fr)`; the computed track list is in px. */
      const band = parseFloat(String(getComputedStyle(faces[0]).gridTemplateRows).split(/\s+/)[2]) || 0;
      const give = Math.min(band, over / faces.length + 0.5);
      if (!(h > 0) || !(give > 0.5)) return;
      shelf.style.setProperty('--lib-w', ((h - give) * 85.6 / 54).toFixed(2) + 'px');
    }
  } catch (e) { /* the column's width stands */ }
}

/* ---------- AND A GROUP OF `photos_N` NAMES IS A SHELF OF PHOTOGRAPHS § */
const isPhotoField_ = f => /^photos_\d+$/.test(String(f));
const isPhotos_ = list => (list || []).some(isPhotoField_);
/* `o.draft` IS PASSED THROUGH TO THE BOXES — the card editor keeps its own draft (`fieldHtml`'s note). § */
function photoShelf_(list, value, o) {
  const nums = (list || []).filter(isPhotoField_).map(f => String(f).match(/^photos_(\d+)$/)[1]);
  return `<div class="lib-shelf ph-shelf">${shelfSlots_(nums,
    i => shelfFilled_(value, ['photos_' + i]),
    (i, hide) => {
      const v = String(value('photos_' + i) || '').trim();
      return `<div class="lib-card ph-slot"${hide ? ' hidden' : ''}>
        <span class="ph-thumb">${v ? `<img src="${esc(pic(v))}" alt="" decoding="async">` : ''}</span>
        ${fieldHtml('photos_' + i, v, { placeholder: 'Another photo link', draft: (o || {}).draft,
          extra: 'type="url" inputmode="url" autocomplete="off" spellcheck="false"' })}
      </div>`;
    })}</div>`;
}
/* THE PREVIEW FOLLOWS THE BOX as it is typed into, so the check above does not wait for a Save. One
   listener for the document, which is how every other input here is heard. */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.ph-slot input')) return;
  const thumb = t.closest('.ph-slot').querySelector('.ph-thumb');
  const v = String(t.value || '').trim();
  if (thumb) thumb.innerHTML = /^https?:\/\/\S+$/i.test(v) ? `<img src="${esc(pic(v))}" alt="" decoding="async">` : '';
});

/* ---------- YOUR PICTURE, CHOSEN RATHER THAN LINKED § */
/* `o.fold`: ON YOUR CARD'S EDIT THE PICKER IS ONE LINE, the face beside "Picture", opening in place (docs/history/425). */
function photoPicker_(value, said, o) {
  const v = String(value('photo') || '').trim();
  const kind = picKind_(v);
  const chosen = (kind === 'basic' || kind === 'avatar') ? pfpChoice_(v) : '';
  const me = USER || {};
  const opt = n => {
    const label = n === 'avatar' ? 'Your figure' : PFP_ART[n].name;
    return `<button type="button" class="pfp-opt${chosen === n ? ' on' : ''}" data-do="pfp-choose" data-pic="${esc(n)}"
      aria-pressed="${chosen === n ? 'true' : 'false'}" aria-label="${esc(label)}" title="${esc(label)}">${n === 'avatar'
        ? avatarFor(me.handle || me.name, 40, me.avatar || '', { bust: true })
        : pfpArt_(n, 40)}</button>`;
  };
  const face = `<span class="pfp-face">${pfpFace_(v)}</span>`;
  const fold = !!(o && o.fold);
  return `${fold ? `<details class="pfp ce-fold" data-fold="picture" open>
    <summary class="ce-line"><span class="ce-k">Picture</span>${face}</summary>` : `<div class="pfp">${face}`}
    <div class="pfp-side">
      <div class="tile-row">
        ${/* A CHILD CHOOSES FROM THE GRID, NEVER A FILE (413) — `savePhoto` refuses one too. */
          rankAtLeast_('client') ? tile_({ icon: 'photo', label: 'Choose photo', act: 'pfp-pick' }) : ''}
        ${tile_({ icon: 'bin', label: 'Remove', act: 'pfp-remove', off: !v })}
      </div>
    </div>
    <div class="pfp-grid" role="group" aria-label="Or choose a picture">${['avatar'].concat(Object.keys(PFP_ART)).map(opt).join('')}</div>
    <p class="faint pfp-said">${esc(said || pfpSaid_(v))}</p>
    ${rankAtLeast_('client') ? '<input type="file" class="pfp-in" accept="image/*" hidden>' : ''}
  ${fold ? '</details>' : '</div>'}`;
}
/* WHAT THE PICTURE IS, IN A SENTENCE — the line's words at rest and after a save. */
function pfpSaid_(v) {
  const kind = picKind_(v);
  if (kind === 'photo') return 'Your photo is your picture.';
  if (kind === 'avatar') return 'Your figure is your picture, wearing whatever you dress it in.';
  if (kind === 'basic') return 'The ' + PFP_ART[pfpChoice_(v)].name.toLowerCase() + ' is your picture.';
  return 'No picture yet, so your card shows your initial. Choose one, or a photo.';
}
/* THE PREVIEW IS `personFace_` LIKE EVERY OTHER FACE, so what you see here is what everybody else's card draws — which is why the wardrobe figure is no longer § */
function pfpFace_(v) {
  const me = USER || {};
  return personFace_({ pic: v, personId: me.personId, avatar: me.avatar || '', handle: me.handle,
                       name: (me.profile && me.profile.first_name) || me.name || '?' },
                     { cls: 'pfp-pic', none: 'pfp-none', size: 88, alt: 'Your profile picture', eager: true });
}
/* THE RING FOLLOWS A TAP AT ONCE, and goes back where it was if the server says no. */
function pfpRing_(box, name) {
  if (!box) return;
  box.querySelectorAll('.pfp-opt').forEach(b => {
    const on = !!name && b.dataset.pic === name;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
/* ---------- A REFUSAL KEEPS THE OLD PICTURE AND SAYS SO § */
const PFP_SINCE = '2026-10-10-h-pictures';
function pfpKept_(chose) {
  const v = String((typeof DATA !== 'undefined' && DATA && DATA.version) || '');
  const old = !!chose && /^\d{4}-\d\d-\d\d/.test(v) && v < PFP_SINCE;
  return 'Your picture is unchanged.' + (old
    ? ' The server has not been updated for the pictures yet; until it is, a photo still works.' : '');
}

/* ---------- SQUARE, AND SMALL ENOUGH TO POST § */
const PFP_SIZE = 600;
function pfpPrepare_(file) {
  if (typeof camItemOf_ !== 'function') return Promise.resolve(null);
  return camItemOf_(file).then(it => {
    if (!it || it.kind !== 'image' || !it.data) return null;
    return new Promise(done => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1, h = img.naturalHeight || 1, s = Math.min(w, h);
        const out = Math.max(1, Math.min(PFP_SIZE, s));
        const cv = document.createElement('canvas');
        cv.width = cv.height = out;
        try {
          cv.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, out, out);
          done(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { done(null); }
      };
      img.onerror = () => done(null);
      img.src = it.data;
    });
  }).catch(() => null);
}

/* WHAT THE SERVER SAID THE PICTURE NOW IS, written everywhere this phone keeps it: § */
function pfpTake_(box, url, said) {
  if (!USER) return;
  USER.profile = Object.assign({}, USER.profile || {}, { photo: url });
  USER.photo = url;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
  const fig = picKind_(url) === 'avatar';
  ['tutors', 'people', 'students', 'clients', 'family', 'everyone'].forEach(k => ((DATA && DATA[k]) || []).forEach(r => {
    if (r && USER.personId && (r.personId === USER.personId || r.person_id === USER.personId || r.id === USER.personId)) {
      if ('image' in r) r.image = url;
      if ('photo' in r) r.photo = url;
      if (k !== 'students') { if (fig) r.avatar = USER.avatar || ''; else delete r.avatar; }
    }
  }));
  const onCard = !!(box && box.closest && box.closest('.card-ed'));
  if (box && box.parentNode) box.outerHTML = photoPicker_(f => (f === 'photo' ? url : ''), said, { fold: onCard });
  /* NOT WHILE THE PICKER IS ON YOUR OWN CARD'S EDIT (docs/history/339) — which is where it is now, for everybody. § */
  try { if (typeof postFacesMine_ === 'function') postFacesMine_(); } catch (e) {}
  if (onCard) return;
  try { if (typeof paint === 'function') paint('account'); } catch (e) {}
}

on('pfp-pick', el => {
  const inp = el.closest('.pfp') && el.closest('.pfp').querySelector('.pfp-in');
  if (inp) inp.click();
});
on('pfp-remove', el => {
  const box = el.closest('.pfp');
  if (!USER || !box) return;
  send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, remove: true },
        { button: el, where: box.querySelector('.pfp-said'), saying: 'Removing…', lock: box })
    .then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Removed. ' + pfpSaid_(got)); toast('Picture removed'); })
    .catch(() => { const said = box.querySelector('.pfp-said'); if (said) said.textContent += ' ' + pfpKept_(); });
});
/* ---------- ONE OF THE ELEVEN, TAPPED § */
on('pfp-choose', el => {
  const box = el.closest('.pfp');
  const name = String(el.dataset.pic || '');
  if (!USER || !box || !pfpChoice_(PFP_PREFIX + name)) return;
  const choice = PFP_PREFIX + name;
  const said = box.querySelector('.pfp-said');
  const was = String((USER.profile && USER.profile.photo) || '').trim();
  if (pfpChoice_(was) === name) { if (said) said.textContent = 'Already chosen. ' + pfpSaid_(was); return; }
  const face = box.querySelector('.pfp-face');
  if (face) face.innerHTML = pfpFace_(choice);
  pfpRing_(box, name);
  send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, choice },
        { button: el, where: said, saying: 'Saving…', lock: box })
    .then(d => {
      const got = String((d && d.photo) || '');
      pfpTake_(box, got, (pfpChoice_(got) === name ? 'Saved. ' : 'The server kept something else. ') + pfpSaid_(got));
      toast('Picture saved');
    })
    .catch(() => {
      if (face) face.innerHTML = pfpFace_(was);
      pfpRing_(box, pfpChoice_(was));
      if (said) said.textContent = String(said.textContent || '').trim() + ' ' + pfpKept_(true);
    });
});
/* `change`, NOT A `data-do` CLICK — a file input reports its choice by changing, the camera's
   `cam-pick` argument. The value is cleared so choosing the same picture again still fires. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.pfp-in')) return;
  const file = (inp.files || [])[0];
  inp.value = '';
  const box = inp.closest('.pfp');
  if (!file || !box || !USER) return;
  const said = box.querySelector('.pfp-said');
  const btn = box.querySelector('[data-do="pfp-pick"]');
  if (said) said.textContent = 'Getting it ready…';
  pfpPrepare_(file).then(data => {
    if (!data) { if (said) said.textContent = 'That file is not a picture this phone can read. Try another.'; return; }
    /* THE PREVIEW CHANGES BEFORE THE UPLOAD, so the crop is seen while it travels; if the server refuses, the line says why and the old picture comes back. § */
    const face = box.querySelector('.pfp-face');
    if (face) face.innerHTML = `<img class="pfp-pic" src="${esc(data)}" alt="Your profile picture" decoding="async">`;
    pfpRing_(box, '');
    return send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, data },
                 { button: btn, where: said, saying: 'Saving…', lock: box })
      .then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Saved. ' + pfpSaid_(got)); toast('Picture saved'); })
      .catch(() => {
        const was = (USER.profile && USER.profile.photo) || '';
        if (face) face.innerHTML = pfpFace_(was);
        pfpRing_(box, pfpChoice_(was));
        if (said) said.textContent = String(said.textContent || '').trim() + ' ' + pfpKept_();
      });
  });
});

/* THE HOUR CODES, WHEREVER THE BACKEND PUT THEM. § */
function availCodes_() {
  const groups = (DATA && DATA.profileFields) || {};
  const hit = Object.keys(groups).find(g => isTimetable_(groups[g]));
  return hit ? groups[hit] : [];
}

/* ---------- AND WHAT A GROUP HEADING IS DEPENDS ON THE SURFACE, SO THE SURFACE SAYS § */
function fieldsHtml(groups, o) {
  o = o || {};
  const head = o.head || 'h2';
  const value = o.value || (() => '');
  const plain = (f, extra) => fieldHtml(f, value(f), Object.assign({
    attr: o.attr,
    label: ROW_LABEL[f],
    options: o.options ? o.options(f) : null,
    suggest: o.suggest ? o.suggest(f) : null,
    readonly: (o.readonly || []).indexOf(f) !== -1,
  }, extra));
  return Object.keys(groups).map(g => {
    const list = (groups[g] || []).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
    const timetable = isTimetable_(list);
    /* THE SHELF, THEN WHATEVER ELSE IS IN THE GROUP. § */
    const library = !timetable && isLibrary_(list);
    const quals = !timetable && isQuals_(list);
    /* ---------- AND THE THREE DATE BOXES, WHICH REPLACE ONE FIELD RATHER THAN JOINING IT § */
    /* EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and `isDob_` is asked as well so a deployment that ever sends the § */
    const wantsDob = !timetable && (list.indexOf('date_of_birth') !== -1 || isDob_(list));
    /* THE PHONE, AS A CODE AND A NUMBER — the birthday's arrangement: § */
    const wantsPhone = !timetable && list.indexOf('phone') !== -1;
    /* THE PHOTOGRAPH SHELF GOES UNDER THE REST, not over it as the library one does: the page
       reads profile photo, video, then the others, which is the order somebody thinks of them in. */
    const photos = !timetable && isPhotos_(list);
    /* ---------- AND `photo` IS A PICTURE YOU CHOOSE, NOT A LINK YOU PASTE § */
    const picture = !timetable && o.attr === 'data-me' && list.indexOf('photo') !== -1;
    const rest = list.filter(f => !(library && isLibraryCard_(f)) && !(quals && isQualField_(f))
                              && !(photos && isPhotoField_(f)) && !(picture && f === 'photo')
                              && !(wantsDob && (f === 'date_of_birth' || isDobBox_(f))));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [], o.attr === 'data-me')
      : (picture ? photoPicker_(value) : '')
      + (library ? libraryShelf_(list, value) : '')
      + (quals ? qualShelf_(list, value) : '')
      + (wantsDob ? dobBoxes_(value) : '')
      + fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneRow_(value) : plain(f, extra))
      + (photos ? photoShelf_(list, value) : '');
    return `<${head}><span>${esc(g)}</span></${head}>` + body;
  }).join('');
}

/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

/* `initAvail` WAS HERE — the `avail` tool's week; the hours are Tutor settings' Available card now (487). */

/* YOUR LIBRARY CARDS, A TOOL (docs/history/339) § */
function libCardsDraw_(into) {
  if (!into) return;
  const held = into.querySelector('.me-form[data-dirty], .me-form.is-sending');
  if (held) return;
  if (!USER) { into.innerHTML = `<p class="note">Sign in and your library cards are kept here.</p>`; return; }
  const list = libFieldsOf_(myGroups_());
  if (!list.length && typeof awaiting_ === 'function' && awaiting_()) { into.innerHTML = loading_(); return; }
  /* AN OLDER SERVER, SAID AS ONE — `OLD_SERVER_SAY_`, the card editor's sentence for the same case. § */
  if (!list.length) {
    into.innerHTML = `<p class="note">${esc(OLD_SERVER_SAY_)}</p>`;
    return;
  }
  const p = USER.profile || {};
  into.innerHTML = `<div class="me-form">${libraryShelf_(list, f => p[f] ?? '')}
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'me-save' })}</div>
    <p class="faint me-said"></p></div>`;
}
function initLibCards_() { libCardsDraw_($('lib-box')); }
/* EVERY COPY ON THE PAGE — Tools' and, starred, Saved's — for `myProfile` landing (`profileRefresh_`): § */
function libCardsRedraw_() {
  /* NOT A COPY SOMEBODY IS IN — a box focused and not yet typed into is not dirty, and redrawing it would
     take the caret away (`landRepaint_`'s reason). It is drawn the next time it is started. */
  document.querySelectorAll('[id="lib-box"]').forEach(into => {
    if (!into.contains(document.activeElement)) libCardsDraw_(into);
  });
}

/* ---------- ONE SAVE, TWO SURFACES, AND THE DOM SAYS WHICH § */
on('me-save', el => { meSave_(el); });
/* ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT § */
function meSave_(el) {
  return new Promise(resolve => {
  /* AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN. § */
  const box = el.closest('.me-form') || el.closest('#sheet-body') || el.closest('.widget-slot')
           || document.body;
  const said = box.querySelector('.me-said');
  /* GATHERED BEFORE `send_` LOCKS THE CARD. The lock disables every box, and this skips a disabled
     one on purpose (a locked field is not an answer) — so gathering afterwards would post nothing. */
  const fields = {};
  box.querySelectorAll('[data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = box.type === 'checkbox' ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  /* A QUALIFICATION WITH NO SUBJECT. § */
  /* ASKED OF EACH SLOT: its `qual_N` box (the subject's select) is the name that is saved, and any visible box with an answer in it is a qualification. § */
  if (qualNameless_(box)) { toast(QUAL_NAMELESS_SAY_); return resolve(false); }
  /* ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE § */
  /* ---------- AND WHEN THE SERVER IS OLDER THAN THIS SITE § */
  if (!profileShapeOk_()) {
    const packed = Object.keys(fields).some(k => PACKED_FIELD_.test(k));
    const blocked = () => { if (said) said.textContent = OLD_SERVER_SAY_
      + ' Until then this card is not sent, because its boxes may be empty and saving would wipe what the sheet holds.'; };
    if (PROFILE_SERVER_OLD) { if (packed) { blocked(); return resolve(false); } return saveNow(); }
    if (said) said.textContent = 'Your saved details are still loading from the sheet, so nothing was sent. Try again in a moment.';
    profileRefresh_(true, () => (packed ? (blocked(), resolve(false)) : saveNow()));
    /* NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `saveNow` saves the card, but
       an editor waiting on this would otherwise wait for ever on the path that never calls back. */
    resolve(false);
    return;
  }
  saveNow();
  function saveNow() {
  /* `send_`, NOT `api()`. § */
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '',
          target: USER.name, targetId: USER.personId || '', fields },
        { button: el, busy: 'Saving…', where: said })
    .then(d => {
      /* THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED. § */
      USER.profile = (d && d.profile) ? d.profile : Object.assign({}, USER.profile || {}, fields);
      /* AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you (`progressRedraw_`, js/arcade.js) — not left to the payload this § */
      if (typeof progressRedraw_ === 'function') progressRedraw_();
      /* ON THE SHEET NOW, SO EACH FIELD SENT IS NO LONGER A DRAFT (`fieldHtml`; 317). */
      Object.keys(fields).forEach(f => { try { draftDrop_('set', f); } catch (e) {} });
      if (d && d.name) USER.name = d.name;
      /* A CORRECTED PENDING ADDRESS IS STILL PENDING, at the new address — the held cards say which. */
      if (d && d.pendingEmail !== undefined) { accountChanged_(); USER.pendingEmail = String(d.pendingEmail || ''); }
      /* ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED § */
      const word = (d && d.said) || 'Saved';
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      if (box.closest('#sheet-body')) closeSheet();
      /* THIS CARD IS CLEAN NOW, so a repaint may redraw it — see `settingsKeep_`. */
      const form = el.closest('.me-form');
      if (form) delete form.dataset.dirty;
      /* NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER. § */
      const quiet = !!box.querySelector('.q-shelf');
      if (said) said.textContent = quiet ? '' : word;
      toast(word);
      /* WHICH COLUMN THE CARD IS ON (453): a settings column, or a people column's card editor. */
      const col = colOfEl_(form) || 'account';
      const at = [...document.querySelectorAll('#s-' + col + ' .me-form')].indexOf(form);
      const lineAt = () => at < 0 ? null
        : (document.querySelectorAll('#s-' + col + ' .me-form')[at] || {}).querySelector?.('.me-said');
      /* THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save come and go with a waiting address, and nothing else repaints § */
      if (d && d.said) {
        try { paint(col); placeCells('y', true, 0, col); } catch (e) {}
        const el2 = lineAt(); if (el2) el2.textContent = word;
      }
      /* THE PUBLIC CARD IS BUILT BY `doGet`, so it only moves when the payload does — but only when something was written. § */
      if (!d || d.changed === undefined || d.changed > 0) sayAfterLoad_(lineAt, quiet ? '' : word);
      resolve(true);
    })
    .catch(() => { /* `send_` has already written the refusal under the card. */ resolve(false); });
  }
  });
}

/* A QUALIFICATION WITH NO SUBJECT, ASKED OF A FORM — lifted out of `meSave_` so the card's own Save
   (`card-save`) refuses exactly what a Settings card refuses, in the same words. */
const QUAL_NAMELESS_SAY_ = 'Choose a subject for each qualification first — nothing was saved.';
function qualNameless_(box) {
  return [...box.querySelectorAll('.q-shelf .q-slot')].some(slot => {
    const n = slot.querySelector('[data-me="qual_' + slot.dataset.slot + '"]');
    return !(n && String(n.value || '').trim())
      && [...slot.querySelectorAll('[data-me]')].some(b => b.type !== 'hidden' && String(b.value || '').trim());
  });
}

/* ---------- "SAVED" SURVIVES THE REPAINT IT CAUSES § */
function sayAfterLoad_(find, text) {
  Promise.resolve(load()).then(() => setTimeout(() => {
    const el = find(); if (el) el.textContent = text;
  }, 0), () => {});
}

/* THE FIELD NAMES THAT ARE HALVES OF ONE CELL — see the old-server note in `me-save`. Hour codes are
   a day prefix and an hour; the rest are the prefixes `fieldsHtml` expands a packed column into. */
const PACKED_FIELD_ = /^(phone_(cc|no)|dob_[dmy]|qual_\d+(_|$)|lib\d+_|photos_\d+|(m|tu|w|th|f|sa|su)\d{1,2})$|^(qual_\d+_\w+|lib\d+_\w+)$/;
let PROFILE_SERVER_OLD = false;
const OLD_SERVER_SAY_ = 'The server in Apps Script is older than this site. Update the backend (pull from GitHub, then Deploy \u2192 Manage deployments \u2192 New version).';

/* ---------- WHICH SETTINGS CARDS HAVE SOMETHING TYPED INTO THEM § */
/* AND THE BUSINESS COLUMN BY THE SAME RULE. § */
/* AND THE LIBRARY CARDS ON TOOLS (docs/history/339), and their starred copy on Saved — a `.me-form` in a
   widget's slot, kept by the same two lines for the same reason: they were a Settings card until 11 Oct. */
const KEEP_FORMS_ = '#s-account .me-form, #s-staff .me-form, #s-family .me-form, #s-biz .me-form, #s-tools .widget-slot .me-form, #s-saved .widget-slot .me-form';
document.addEventListener('input', e => {
  const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
  if (f) f.dataset.dirty = '1';
});
document.addEventListener('change', e => {
  const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
  if (f) f.dataset.dirty = '1';
});
function settingsKeep_(id) {
  /* AND THE YOU COLUMN, WHILE A CARD ON IT IS BEING EDITED (`cardEditHtml_`) — the same rule for the same reason: § */
  if (['account', 'tutors', 'students', 'parents'].indexOf(id) !== -1 && USER) {
    const acc = $('s-' + id);
    /* AND STUDENT SETTINGS' CARDS, and the card editors and person forms on the people columns (453). */
    return !!(acc && acc.querySelector('.card-ed .me-form[data-dirty], .is-sending .card-ed, .me-form[data-dirty], .me-form.is-sending'));
  }
  /* AND TOOLS AND SAVED, WHILE THE LIBRARY CARDS ON THEM HOLD TYPING (docs/history/339) — the one form a
     widget slot holds. The rest of the column waits with it, as the rest of Settings waits with a card. */
  if ((id === 'tools' || id === 'saved') && USER) {
    const col = $('s-' + id);
    return !!(col && col.querySelector('.widget-slot .me-form[data-dirty], .widget-slot .me-form.is-sending'));
  }
  if (['staff', 'family', 'biz'].indexOf(id) === -1 || !USER) return false;
  const el = $('s-' + id);
  return !!(el && el.querySelector('.me-form[data-dirty], .me-form.is-sending, .is-sending .card-ed'));
}

/* ---------- YOUR SETTINGS, AS THE SHEET HOLDS THEM § */
let PROFILE_ASKING = false;
function profileShapeOk_() {
  const p = USER && USER.profile;
  return !!p && Object.prototype.hasOwnProperty.call(p, 'phone_cc');
}
function profileRefresh_(loud, onOld) {
  if (!USER || !USER.token || PROFILE_ASKING) return;
  PROFILE_ASKING = true;
  const askedAt = Date.now();
  /* RETURNED, so a caller waiting on a copy it can trust (the card editor, `cardFetch_`) knows when the
     question has been answered either way — every other caller ignores it, as before. */
  return api({ action: 'myProfile', name: USER.name, personId: USER.personId || '' })
    .then(d => {
      PROFILE_ASKING = false;
      /* ---------- AN ANSWER OLDER THAN WHAT THE PHONE NOW KNOWS IS NOT PAINTED § */
      if (askedAt < ACCOUNT_AT_) { if (d && d.success) profileRefresh_(loud, onOld); return; }
      /* AN OLD SERVER, NOT A FAULT. "That action is not recognised" is the server saying it predates
         this site — remembered, so the next save does not ask again, and never shown raw. */
      if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
        PROFILE_SERVER_OLD = true;
        if (typeof onOld === 'function') return onOld();
        if (loud) toast(OLD_SERVER_SAY_);
        return;
      }
      if (!d || !d.success || !d.profile || !USER) {
        if (loud && d && d.error) toast(d.error);
        return;
      }
      /* ONLY FOR THE PERSON STILL SIGNED IN. A reply that lands after somebody else has signed in on
         this phone is about the previous person. */
      if (USER.personId && String(d.personId) !== String(USER.personId)) return;
      if (!USER.personId) USER.personId = d.personId;
      USER.profile = d.profile;
      if (d.agreementSignedAt !== undefined) {
        USER.agreementSignedAt = d.agreementSignedAt; USER.agreementVersion = d.agreementVersion;
      }
      /* ---------- AND THE ROLE, WHICH WENT STALE THE SAME WAY § */
      /* `pendingEmail` RIDES WITH THE ROLE, for the role's reason: § */
      /* ---------- AND THE NAMES, WHICH WENT STALE THE SAME WAY § */
      const roleWas = JSON.stringify([USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || ''), String(USER.friends || '')]);
      if (d.role) USER.role = d.role;
      if (Array.isArray(d.roles) && d.roles.length) USER.roles = d.roles;
      if (d.tutorPending !== undefined) USER.tutorPending = !!d.tutorPending;
      if (d.rank) USER.rank = String(d.rank);
      if (d.application !== undefined) USER.application = d.application;
      if (d.pendingEmail !== undefined) USER.pendingEmail = String(d.pendingEmail || '');
      if (d.name) USER.name = String(d.name);
      ['children', 'kids', 'parents', 'siblings'].forEach(k => { if (Array.isArray(d[k])) USER[k] = d[k]; });
      /* ---------- AND THE HANDLE, WHICH THE BUSINESS MAY HAVE MOVED UNDER THIS PHONE (342) § */
      if (d.handle && USER.handle && String(d.handle) !== String(USER.handle)) {
        HANDLE_SAID = { pid: String(USER.personId || ''), text: 'You were @' + USER.handle + '.' };
        try { toast('Your handle is @' + d.handle + ' now'); } catch (e) {}
        /* AND THE FACE THE OLD ONE DREW (round 2): the move wrote it into a blank look on the server
           (`handleFaceKept_`), and this phone's blank copy would draw the new handle's colours instead. */
        if (!String(USER.avatar || '').trim() && d.profile && d.profile.avatar) USER.avatar = String(d.profile.avatar);
      }
      if (d.handle) USER.handle = String(d.handle);
      if (typeof d.friends === 'string' && d.friends !== String(USER.friends || '')) {
        USER.friends = d.friends;
        /* THE FRIENDS LIST ON BOTH FINDERS IS MEMOISED — told, as `friendsSave` tells it. Not drawn
           here: the `landRepaint_` below draws the column in front. */
        try { if (typeof finderForgetFound_ === 'function') finderForgetFound_(); else FIND_MEMO.key = null; } catch (e) {}
      }
      const roleMoved = JSON.stringify([USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
        String(USER.name || ''), USER.children, USER.kids, String(USER.handle || ''), String(USER.friends || '')]) !== roleWas;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      /* BOTH THROUGH `landRepaint_` (shell.js), because this is a reply landing like the payload is: § */
      const land = typeof landRepaint_ === 'function' ? landRepaint_ : (f => (f || repaint)());
      if (roleMoved) { try { land(); } catch (e) {} return; }
      /* AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust (`profileShapeOk_`) is § */
      if (CARD_EDIT && CARD_EDIT.own) { try { land(() => paint(SET_OF_FACE_[CARD_EDIT.col] || 'account')); } catch (e) {} }
      /* REDRAWN IF IT IS DRAWN — and `paint` itself declines while a card has typing in it. */
      ['account', 'staff', 'family'].concat(PEOPLE_COLS_).forEach(c => {
        if (typeof screenHasMarkup_ === 'function' && screenHasMarkup_(c))
          try { land(() => { paint(c); placeCells('y', true, 0, c); }); } catch (e) {}
      });
      /* AND THE PROGRESS COLUMN, the same rule: its journey card counts down to the exam dates in this
         copy, which a Save on another phone may have moved (`progressRedraw_`, js/arcade.js). */
      if (typeof progressRedraw_ === 'function') { try { land(() => progressRedraw_()); } catch (e) {} }
      /* AND THE LIBRARY CARDS ON TOOLS, which are drawn from this copy and are a widget now, not a page this
         column repaints (docs/history/339). `libCardsDraw_` leaves a copy with typing in it alone. */
      try { land(() => libCardsRedraw_()); } catch (e) {}
    })
    .catch(() => { PROFILE_ASKING = false; });
}
/* `change-pin` opened a sheet of its own. It is three fields at the bottom of `edit-me` now — the
   sheet that already exists for changing your details, which a PIN is one of. */
on('pin-save', el => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The two new PINs do not match.'; return; }
  /* ---------- THE ONE WHERE A NAME COLLISION LOCKS SOMEBODY OUT § */
  /* `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE. § */
  const lock = $('pin-now') && $('pin-now').closest('.pin-row');
  send_({ action: 'changePin', name: USER.name, personId: (USER && USER.personId) || '',
          currentPin: v('pin-now'), newPin: v('pin-new') },
        { button: el, busy: 'Changing…', where: 'pin-said', lock: lock })
    .then(d => {
      /* ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE § */
      if (d && d.token) {
        USER.token = d.token;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      }
      ['pin-now', 'pin-new', 'pin-again'].forEach(id => { const b = $(id); if (b) b.value = ''; });
      if (said) said.textContent = 'Changed.';
      toast('PIN changed');
      /* ASKED OF THE DOM, LIKE `me-save` AND `msg-send`. */
      if (el.closest('#sheet-body')) closeSheet();
    })
    .catch(() => {});
});

/* `on('my-referral')` WAS HERE — the referral link sheet. Its card has gone and nothing else opened
   it. The `referral_code` column stays on the people tab; nothing on a phone hands one out now. */

/* `on('ref-send')` WENT WITH IT. It was the Share button INSIDE the referral sheet — reachable from
   nowhere else, so removing the sheet stranded it. `check-doors` named it on the next run. */


/* `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state. § */

/* `skeleton()` WAS HERE — a grey post (a face, a 4:5 picture, two lines) pulsing on the feed, the reel and Messages while the payload was on its way. § */

/* YOUR CARD IS WHERE YOU EDIT IT (docs/history/330) § */

/* ---------- THE CARD'S SECTIONS, IN THE CARD'S ORDER, AND THE FIELDS EACH ONE EDITS § */
/* ---------- AND TWO SECTIONS THAT ARE YOURS ALONE, AND TWO THAT EVERY CARD HAS (docs/history/339) § */
const CARD_SECTIONS = [
  { id: 'picture', bare: true, fields: ['photo'] },
  { id: 'figure', own: true, cap: 'Your figure' },
  { id: 'name', bare: true, fields: ['first_name', 'last_name'] },
  { id: 'handle', own: true, cap: 'Handle' },
  { id: 'rate', cap: 'Rate and class size', fields: ['rate_per_hour', 'extra_seat_rate', 'extra_seat_cut', 'min_students', 'max_students'] },
  { id: 'headline', fields: ['headline'] },
  { id: 'photos', cap: 'Photographs', fields: ['video'], match: /^photos_\d+$/ },
  { id: 'words', fields: ['adjective_1', 'adjective_2', 'adjective_3'] },
  { id: 'glance', cap: 'At a glance', fields: ['years_experience', 'favourite_colour', 'age_min', 'age_max', 'min_hours', 'max_hours'] },
  { id: 'quals', cap: 'Qualifications', match: /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/ },
  { id: 'where', fields: ['venues_ok', 'travel_km'] },
  { id: 'week', cap: 'Available', match: /^(m|tu|w|th|f|sa|su)\d\d$/ },
];

/* EVERY FIELD THE BACKEND SAYS A TUTOR EDITS, in its order — the one list `cardSections_` filters. */
function cardSent_() {
  const g = (typeof DATA !== 'undefined' && DATA && DATA.profileFields) || {};
  return [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
}
/* `o.sent` IS WHICH FIELDS MAY BE OFFERED (a tutor's, by default); `o.own` adds your own two sections; `o.bare` keeps only the sections every card prints. § */
function cardSections_(o) {
  o = o || {};
  const sent = o.sent || cardSent_();
  return CARD_SECTIONS.filter(s => (s.own ? !!o.own : (!o.bare || !!s.bare))).map(s => Object.assign({}, s, {
    list: (s.fields || []).filter(f => sent.indexOf(f) !== -1).concat(s.match ? sent.filter(f => s.match.test(f)) : []),
  })).filter(s => s.own || s.list.length);
}
const cardFields_ = () => [].concat(...cardSections_().map(s => s.list));
/* ---------- YOUR OWN CARD'S SECTIONS — FROM YOUR ROLE'S FIELDS, AND ONLY WHAT YOUR CARD PRINTS § */
function ownCardSections_(col) {
  const g = myGroups_();
  const sent = [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
  /* `col` (469): the Students face edits every account's four, whatever your rank; Tutors the rest, less what the Staff hub edits. None: both. */
  const all = cardSections_({ own: true, sent, bare: !cardMine_() });
  const you = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) !== -1);
  const staff = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) === -1)
    .map(s => Object.assign({}, s, { list: s.list.filter(f => !hubOwns_(f)) })).filter(s => s.list.length);
  if (!col) return you.concat(staff);
  /* WHAT YOU TEACH ONLY ON A PUBLIC TUTOR CARD, as on 444's Tutor column. */
  return (col === 'students' ? you : []).concat(col === 'tutors' && cardMine_() ? staff : []);
}
const OWN_CARD_SECTIONS_ = ['picture', 'figure', 'name', 'handle'];
/* EACH SECTION'S CARD TITLE, and which a locked settings column shows (468). */
/* A card whose first line is its own label (a fold's, or a field's) carries no title over it (491). */
const OWN_SEC_UNTITLED_ = ['headline', 'photos', 'words', 'glance', 'quals', 'where', 'figure', 'handle'];
const OWN_SEC_TITLE_ = { picture: 'Picture', figure: 'Your figure', name: 'Name', handle: 'Handle', rate: 'Rate and class size', headline: 'Headline',
  photos: 'Photographs', words: 'Three words', glance: 'At a glance', quals: 'Qualifications', where: 'Where you teach', week: 'Available' };
/* EACH SECTION ON ONE COLUMN FOR EVERYONE, the lowest rank it applies to (469): the owner, "the lowest common denominator". */
const OWN_SEC_OF_SET_ = { account: OWN_CARD_SECTIONS_, family: [],
  staff: ['rate', 'headline', 'photos', 'words', 'glance', 'quals', 'where', 'week'] };
const OWN_SET_OF_SEC_ = sec => Object.keys(OWN_SEC_OF_SET_).find(c => OWN_SEC_OF_SET_[c].indexOf(sec) !== -1) || '';
/* WHAT THE STAFF HUB EDITS — Pricing's rate and seat — so no card offers it a second time (444); the week is Tutor settings' Available card (487). */
const hubOwns_ = f => typeof hubFor_ === 'function' && hubFor_()
  && (f === 'rate_per_hour' || f === 'extra_seat_rate');
const ownCardFields_ = () => [].concat(...ownCardSections_().map(s => s.list));

/* ---------- WHO HAS A PUBLIC CARD, AND WHAT SETTINGS STOPS DRAWING FOR THEM § */
function cardMine_() {
  if (typeof USER === 'undefined' || !USER || typeof mineIs_ !== 'function') return null;
  return ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).find(t => t && t.personId && mineIs_(t)) || null;
}
const cardHolds_ = () => !!USER && cardSent_().length > 0 && !!cardMine_();
/* THE GROUPS WITH EVERY FIELD THE CARD EDITS TAKEN OUT, AND A GROUP LEFT EMPTY DROPPED — so for a tutor with a card About you, Photos, the rate, Qualifications § */
function cardSettingsGroups_(groups, on) {
  on = new Set(on || cardFields_());
  const out = {};
  Object.keys(groups || {}).forEach(g => {
    const left = (groups[g] || []).filter(f => !on.has(f));
    if (left.length) out[g] = left;
  });
  return out;
}

/* ---------- WHICH CARD IS OPEN FOR EDITING § */
let CARD_EDIT = null;
/* WHOSE `familyCardEdit` WAS LAST READ — a person id, not a yes/no. It was a yes/no, read once a visit, so a tutor who signed out in the middle of editing § */
let CARD_EDIT_READ = '';
const CARD_EDIT_KEY = 'familyCardEdit';
function cardEditFresh_(pid) {
  const me = String((USER && USER.personId) || '');
  const own = !!me && String(pid) === me;
  return { who: me, pid: String(pid), own, col: own ? 'settings' : undefined, base: null, asking: false, err: '' };
}
function cardEditNow_() {
  if (typeof USER === 'undefined' || !USER) { CARD_EDIT = null; CARD_EDIT_READ = ''; return null; }
  const me = String(USER.personId || '');
  if (CARD_EDIT && CARD_EDIT.who !== me) CARD_EDIT = null;
  if (!CARD_EDIT && CARD_EDIT_READ !== me) {
    CARD_EDIT_READ = me;
    try {
      const k = JSON.parse(localStorage.getItem(CARD_EDIT_KEY) || 'null');
      if (k && k.pid && k.who && k.who === me) {
        CARD_EDIT = cardEditFresh_(k.pid);
        if (!CARD_EDIT.own && PEOPLE_COLS_.indexOf(k.col) !== -1) CARD_EDIT.col = k.col;
        if (typeof k.pic === 'string') CARD_EDIT.pic0 = k.pic;
        if (typeof k.fig === 'string') CARD_EDIT.fig0 = k.fig;
        if (typeof k.hd === 'string') CARD_EDIT.h0 = k.hd;
        if (typeof k.cr === 'number') CARD_EDIT.cr0 = k.cr;
      }
    } catch (e) {}
  }
  return CARD_EDIT;
}
/* `pic` IS THE PICTURE THE CARD WAS OPENED WITH, remembered beside which card is open so a Cancel after a reload can still put it back (`card-cancel`, below) § */
function cardRemember_(e) {
  const k = { who: e.who, pid: e.pid, col: e.col || cardColOf_(e) };
  if (typeof e.pic0 === 'string') k.pic = e.pic0;
  if (typeof e.fig0 === 'string') k.fig = e.fig0;
  /* NOT THE HANDLE (383): nothing about who signed in is kept beside it — it cannot change while the card is open, so the live one is the same. */
  if (typeof e.cr0 === 'number') k.cr = e.cr0;
  try { localStorage.setItem(CARD_EDIT_KEY, JSON.stringify(k)); } catch (x) {}
}
function cardForget_() { try { localStorage.removeItem(CARD_EDIT_KEY); } catch (x) {} }

/* WHO MAY EDIT THIS CARD: § */
function cardMayEdit_(t) {
  if (typeof USER === 'undefined' || !USER || !t || !t.personId) return false;
  /* YOUR OWN CARD ONLY, for every rank (467) — the owner: "Profile cards are uneditable by anyone, including admin." */
  return String(t.personId) === String(USER.personId || '');
}
/* `col` IS WHICH PEOPLE COLUMN ASKS (453): your own card's face there (`ownCardSections_`); anybody else's tutor card on Tutors. */
const PEOPLE_COLS_ = ['tutors', 'students', 'parents'];
/* YOUR OWN CARD IS EDITED ON ITS ROLE'S SETTINGS COLUMN (464), never on the profile: the owner, "they have to go to the appropriate role's account settings". */
const SET_OF_FACE_ = { tutors: 'staff', students: 'account', parents: 'family' };
const FACE_OF_SET_ = { staff: 'tutors', account: 'students', family: 'parents' };
const faceOfCol_ = c => FACE_OF_SET_[c] || c;
const cardColOf_ = e => (e && e.own ? '' : 'tutors');
/* WHICH COLUMN AN ELEMENT IS ON — the section's id without its `s-`. */
const colOfEl_ = el => String(((el && el.closest && el.closest('#screen > .screen')) || {}).id || '').replace(/^s-/, '');
function cardEditing_(t, col) {
  const e = cardEditNow_();
  return !!(e && t && t.personId && String(t.personId) === e.pid && cardMayEdit_(t) && (!col || (e.col || cardColOf_(e)) === col));
}
/* ---------- THE EDIT TILE — `x.account` IS THE YOU COLUMN, the one place the editor is drawn § */
function cardEditTile_(x) {
  const t = (x && x.row) || {};
  if (!x || !x.account || !cardMayEdit_(t)) return '';
  /* NOT ON THE CARD BEING EDITED. § */
  const own = String(t.personId) === String(USER.personId || '');
  const col = x.col || (own ? homeCol_() : 'tutors');
  if (cardEditing_(t, col)) return '';
  /* YOUR OWN CARD'S EDIT IS ON YOUR SETTINGS COLUMN ALONE (464, `ownCardSetPage_`); nobody edits somebody else's (467). */
  if (own && !x.settings) return '';
  if (own ? !ownCardSections_(col).length : col !== 'tutors') return '';
  return tile_({ icon: 'edit', label: 'Edit', note: own ? (col === 'tutors' && rankAtLeast_('staff') ? 'your tutor card' : 'your card') : 'their card', act: 'card-edit',
                 tone: own ? '' : 'admin', data: { pid: t.personId, col } });
}

/* ---------- WHAT A BOX HOLDS, COMPARED THE WAY THE SERVER WILL READ IT § */
const CARD_BOOL_ = /^(m|tu|w|th|f|sa|su)\d\d$|^qual_\d+_(teach|spec)$/;
function cardSame_(f, a, b) {
  if (CARD_BOOL_.test(f)) return TRUEish_(a) === TRUEish_(b);
  return String(a == null ? '' : a).trim() === String(b == null ? '' : b).trim();
}
/* EVERY BOX OF THE CARD'S FORM, as `meSave_` gathers a Settings card: a tick is TRUE or FALSE, and
   `Something else…` not yet typed is no answer. */
function cardFormVals_(form) {
  const out = {};
  form.querySelectorAll('[data-me]').forEach(b => {
    if (b.disabled) return;
    const v = b.type === 'checkbox' ? (b.checked ? 'TRUE' : 'FALSE') : String(b.value || '').trim();
    out[b.dataset.me] = v === QUAL_OTHER ? '' : v;
  });
  return out;
}
/* ---------- WHAT CHANGED — AND THE THREE PACKED CELLS GO WHOLE § */
const CARD_HOUR_ = /^(m|tu|w|th|f|sa|su)\d\d$/;
const CARD_WHOLE_ = [CARD_HOUR_, /^photos_\d+$/, /^qual_\d+(_\w+)?$/];
function cardChanged_(base, now) {
  const out = {};
  const moved = Object.keys(now).filter(f => !cardSame_(f, now[f], base[f]));
  moved.forEach(f => { out[f] = now[f]; });
  CARD_WHOLE_.forEach(re => {
    if (moved.some(f => re.test(f))) Object.keys(now).forEach(f => { if (re.test(f)) out[f] = now[f]; });
  });
  return out;
}

/* ---------- THE CARD'S DRAFT: ONE, FOR THE WHOLE CARD, KEYED BY WHOSE CARD IT IS § */
function cardDraft_(pid) {
  try { const s = draftRead_('card', pid); return s ? JSON.parse(s) : null; } catch (x) { return null; }
}
function cardValues_(e, base, sec) {
  const vals = Object.assign({}, base);
  let held = 0;
  const d = cardDraft_(e.pid + (sec ? ':' + sec : ''));
  if (d && d.v) {
    Object.keys(d.v).forEach(f => {
      if (d.from && Object.prototype.hasOwnProperty.call(d.from, f) && !cardSame_(f, d.from[f], base[f])) return;
      vals[f] = d.v[f]; held++;
    });
  }
  return { vals, held };
}
/* THE COPY EACH DRAWN FORM WAS DRAWN FROM, by a number on the form. § */
const CARD_DRAWN = new Map();
let CARD_DRAW_N = 0;
function cardDrawn_(base) {
  const n = String(++CARD_DRAW_N);
  CARD_DRAWN.set(n, base);
  /* A DRAW IS UP TO TWELVE FORMS NOT YET IN THE PAGE (468), so the newest 32 are never dropped. */
  if (CARD_DRAWN.size > 64) {
    const live = new Set([...document.querySelectorAll('.card-ed .me-form[data-draw]')].map(f => f.dataset.draw));
    [...CARD_DRAWN.keys()].forEach(k => { if (Number(k) <= CARD_DRAW_N - 32 && !live.has(k)) CARD_DRAWN.delete(k); });
  }
  return n;
}
function cardKeep_(form) {
  const e = CARD_EDIT;
  const card = form && form.closest('.card-ed');
  const base = form && CARD_DRAWN.get(form.dataset.draw || '');
  if (!e || !USER || !card || !base || card.dataset.pid !== e.pid) return;
  const key = e.pid + (card.dataset.sec ? ':' + card.dataset.sec : '');
  const now = cardFormVals_(form), v = {}, from = {};
  Object.keys(now).forEach(f => {
    if (cardSame_(f, now[f], base[f])) return;
    v[f] = now[f];
    from[f] = base[f] == null ? '' : String(base[f]);
  });
  try {
    if (Object.keys(v).length) draftKeep_('card', key, JSON.stringify({ v, from }));
    else draftDrop_('card', key);
  } catch (x) {}
}

/* ---------- THE COPY OF THE ROW THE FORM IS FILLED FROM § */
function cardBaseNow_(e) {
  if (!e) return null;
  if (e.own) return profileShapeOk_() ? USER.profile : null;
  return e.base;
}
function cardFetch_(e) {
  if (!e || CARD_EDIT !== e || e.asking || e.err || cardBaseNow_(e)) return;
  if (e.own) {
    if (PROFILE_SERVER_OLD) { e.err = OLD_SERVER_SAY_; cardRepaint_(); return; }
    const p = profileRefresh_(false, () => { e.err = OLD_SERVER_SAY_; });
    if (!p) return;   /* one already on its way — its landing repaints this column */
    e.asking = true;
    p.then(() => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      if (!cardBaseNow_(e) && !e.err) e.err = 'Your details did not arrive from the server, so there is nothing to edit yet. Cancel, and try again in a moment.';
      cardRepaint_();
    });
    return;
  }
  e.asking = true;
  api({ action: 'getProfile', name: USER.name, personId: USER.personId || '', target: e.pid })
    .then(d => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      /* `phone_cc` IS `profileShapeOk_`'s test, asked of their copy: an older `profileOf_` without the
         expanded boxes is the same blank-shelf danger as an old copy of your own. */
      if (d && d.success && d.profile && Object.prototype.hasOwnProperty.call(d.profile, 'phone_cc')) e.base = d.profile;
      else e.err = (d && d.error) || OLD_SERVER_SAY_;
      cardRepaint_();
    }, () => {
      e.asking = false;
      if (CARD_EDIT !== e) return;
      e.err = 'The server did not answer, so their details are not here to edit. Cancel, and try again in a moment.';
      cardRepaint_();
    });
}
function cardRepaint_() { PEOPLE_COLS_.concat(Object.keys(FACE_OF_SET_)).forEach(c => { try { paint(c); } catch (x) {} }); }

/* ---------- THE CARD, AS ITS OWN FORM § */
function cardEditHtml_(t) {
  const e = cardEditNow_();
  const pid = String(t.personId);
  const head = `<h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))} <span class="ce-what">· editing</span></h3>`;
  const base = cardBaseNow_(e);
  if (!base) {
    if (!e.err) setTimeout(() => cardFetch_(e), 0);
    return `<div class="card is-widget is-prof card-ed" data-pid="${esc(pid)}">${head}${
      e.err ? `<p class="faint me-said">${esc(e.err)}</p>` : loading_()}</div>${cardEditTiles_(pid, true)}`;
  }
  const { vals, held } = cardValues_(e, base);
  return `<div class="card is-widget is-prof card-ed" data-pid="${esc(pid)}">${head}
    <div class="me-form" data-draw="${cardDrawn_(base)}">${cardEditForm_(t, e, vals)}
      <p class="faint me-said">${held ? esc(SET_HELD_SAY) : ''}</p></div>
  </div>${cardEditTiles_(pid, false)}`;
}
/* YOUR OWN CARD'S EDIT, ONE CARD PER SECTION (468): each its own form, draft, Save and layout id — the owner, "settings is purely editing". */
function cardEditCards_(t, e, secs, setCol) {
  const pid = String(t.personId);
  const base = cardBaseNow_(e);
  if (!base && !e.err) setTimeout(() => cardFetch_(e), 0);
  return secs.map(s => {
    /* NO TITLE WHERE THE FIRST LINE SAYS IT (491, the owner: "does it need a title at the top? I don't think so"). */
    const h = OWN_SEC_UNTITLED_.indexOf(s.id) !== -1 ? '' : `<h3>${esc(OWN_SEC_TITLE_[s.id] || s.cap || s.id)}</h3>`;
    const open = `<div class="card is-prof card-ed own-sec" data-pid="${esc(pid)}" data-sec="${esc(s.id)}" data-lay-card="own:${esc(setCol)}:${esc(s.id)}" aria-label="${esc(OWN_SEC_TITLE_[s.id] || s.cap || s.id)}">${h}`;
    if (!base) return `${open}${e.err ? `<p class="faint me-said">${esc(e.err)}</p>` : loading_()}${cardEditTiles_(pid, true)}</div>`;
    const { vals, held } = cardValues_(e, base, s.id);
    return `${open}<div class="me-form" data-draw="${cardDrawn_(base)}">${cardEditForm_(t, e, vals, [s])}
      <p class="faint me-said">${held ? esc(SET_HELD_SAY) : ''}</p></div>${cardEditTiles_(pid, false)}</div>`;
  });
}
function cardEditTiles_(pid, saveOff) {
  return `<div class="tile-row ce-tiles">${tile_({ icon: 'save', label: 'Save', note: 'every change', act: 'card-save',
    off: !!saveOff, data: { pid } })}${tile_({ icon: 'close', label: 'Cancel', note: 'put it back', act: 'card-cancel',
    data: { pid } })}</div>`;
}
/* ---------- ONE LINE A THING, OPENING IN PLACE (docs/history/425) § */
/* WHICH FOLDS ARE OPEN, as state and not in the DOM, so a repaint (a save, a figure pick) draws them as they were. */
const CE_OPEN = new Set();
document.addEventListener('toggle', e => {
  const d = e.target;
  if (!d || !d.matches || !d.matches('details.ce-fold')) return;
  const k = d.dataset.fold || '';
  if (d.open) CE_OPEN.add(k); else if (d.isConnected) CE_OPEN.delete(k);
}, true);
document.addEventListener('click', e => {
  const s = e.target && e.target.closest && e.target.closest('details.ce-fold > summary');
  if (s) e.preventDefault();
}, true);
/* `val` IS MARKUP (a face, a live line); the label is text. */
/* ALWAYS OPEN (487): "it's literally just a widget of one thing so does not need to be opened" -- the line is a heading, and a tap on it does nothing. */
const ceFold_ = (key, label, val, body) => `<details class="ce-fold" data-fold="${esc(key)}" open>
  <summary class="ce-line"><span class="ce-k">${esc(label)}</span><span class="ce-v">${val}</span></summary>
  <div class="ce-body">${body}</div></details>`;
/* THE FIGURE'S LINE: a small copy of it, its level and credits — redrawn by `avatarDraw_` after a pick. */
const ceFigSay_ = () => !USER ? '' : `<span class="ce-fig" aria-hidden="true">${avatarFor(USER.handle || USER.name, 26, USER.avatar || '', { bust: true })}</span>`
  + `Lv ${esc(String(levelFromXp(USER.xp)))} · ${esc(String(USER.credits || 0))} cr`;
/* HOW MANY, for a fold's line — photographs filled, venues ticked, qualifications held. */
const ceCount_ = (n, one, many) => n ? n + ' ' + (n === 1 ? one : many) : 'none';
function ceSums_(form) {
  const sec = id => form.querySelector('.ce-sec[data-sec="' + id + '"]');
  const ph = sec('photos'), v = ph && ph.querySelector('details[data-fold="photos"] > summary .ce-v');
  if (v) v.textContent = cePhotoSay_([...ph.querySelectorAll('.ph-slot input')].filter(i => String(i.value).trim()).length,
    String((ph.querySelector('[data-me="video"]') || {}).value || '').trim());
  const q = sec('quals'), qv = q && q.querySelector('details[data-fold="quals"] > summary .ce-v');
  const gl = sec('glance'), gv = gl && gl.querySelector('details[data-fold="glance"] > summary .ce-v');
  if (gv) gv.textContent = ceGlanceSay_(f => (gl.querySelector('[data-me="' + f + '"]') || {}).value);
  const wh = sec('where'), wv = wh && wh.querySelector('details[data-fold="where"] > summary .ce-v');
  if (wv) wv.textContent = ceCount_(profList_((wh.querySelector('[data-me="venues_ok"]') || {}).value).length, 'venue', 'venues');
  if (qv) qv.textContent = ceCount_(q.querySelectorAll('.q-list .q-slot:not([data-new])').length, 'held', 'held');
}
/* AT A GLANCE IN ONE LINE: every answer in it, short, so nothing has to be opened to be read. */
function ceGlanceSay_(get) {
  const g = f => String(get(f) == null ? '' : get(f)).trim();
  const range = (a, b, unit) => (g(a) || g(b)) ? (g(a) || '?') + '–' + (g(b) || '?') + unit : '';
  return [g('years_experience') ? g('years_experience') + ' yrs' : '', g('favourite_colour'),
    range('age_min', 'age_max', ''), range('min_hours', 'max_hours', ' h')].filter(Boolean).join(' · ') || 'none';
}
/* THE VENUES OPEN ON THEIR TICKS AT ONCE. No map (491, the owner: "this column is just configuration"): the map is on the profile. */
function ceWhere_(L, val, box) {
  const n = profList_(val('venues_ok')).length;
  const ticks = L.indexOf('venues_ok') !== -1 ? box('venues_ok', {}).replace('<details class="many-d"', '<details open class="many-d"') : '';
  return ceFold_('where', 'Venues', esc(ceCount_(n, 'venue', 'venues')),
      ticks)
    + fieldRows_(L.filter(f => f !== 'venues_ok'), box);
}
const cePhotoSay_ = (n, video) => ceCount_(n, 'photo', 'photos') + (video ? ' · video' : '');
/* EACH SECTION THROUGH THE WIDGET SETTINGS DREW IT WITH: § */
function cardEditForm_(t, e, vals, only) {
  const val = f => (vals[f] == null ? '' : vals[f]);
  const ro = (DATA && DATA.profileReadonly) || [];
  const box = (f, extra) => fieldHtml(f, val(f), Object.assign({ attr: 'data-me', label: ROW_LABEL[f],
    options: fieldOptions_(f), readonly: ro.indexOf(f) !== -1, draft: false }, extra));
  /* YOUR OWN CARD'S SECTIONS ARE YOUR ROLE'S (`ownCardSections_`), with the figure and the handle;
     somebody else's are the tutor's card, as an admin has always edited it. */
  return (only || (e.own ? ownCardSections_() : cardSections_())).map(s => {
    const L = s.list;
    const filled = re => L.filter(f => re.test(f) && String(val(f)).trim() !== '').length;
    const body = s.id === 'picture' ? (e.own ? photoPicker_(val, '', { fold: true }) : cardFaceOnly_(t))
      /* THE WARDROBE, saved a pick at a time (`avatarSave`), which redraws every `.av-card` from
         `wardrobeBody_` — so the fold's inside carries that class, and the picture above follows. */
      : s.id === 'figure' ? ceFold_('figure', 'Figure', `<span class="ce-figv">${ceFigSay_()}</span>`, `<div class="av-card">${wardrobeBody_()}</div>`)
      : s.id === 'handle' ? cardHandleHtml_()
      : s.id === 'photos' ? ceFold_('photos', 'Photos', esc(cePhotoSay_(filled(/^photos_\d+$/), String(val('video')).trim())),
          fieldRows_(L.filter(f => !isPhotoField_(f)), box) + (isPhotos_(L) ? photoShelf_(L, val, { draft: false }) : ''))
      : s.id === 'quals' ? ceFold_('quals', 'Qualifications', esc(ceCount_(filled(/^qual_\d+$/), 'held', 'held')), qualShelf_(L, val))
      : s.id === 'week' ? availGrid_(L, vals, ro, false)
      : s.id === 'rate' ? cardRateHtml_(L, val, box, e)
      : s.id === 'glance' ? ceFold_('glance', 'At a glance', esc(ceGlanceSay_(val)), fieldRows_(L, box))
      : s.id === 'where' ? ceWhere_(L, val, box)
      : fieldRows_(L, box);
    /* NO CAPTION OVER A SECTION: every line names itself, and the week's days and hours name it (425). */
    return `<div class="ce-sec" data-sec="${esc(s.id)}">${body}</div>`;
  }).join('');
}
/* ---------- THE RATE, AND WHAT AN EXTRA SEAT ADDS IN POUNDS BESIDE IT (docs/history/345) § */
const pounds2_ = x => Math.round(x * 100) / 100;
/* WHAT A BLANK MEANS IN POUNDS AT THIS RATE — the config's `c` and `B` through the one reader, `seatShare_`. */
function cardSeatUsual_(rate) {
  const u = typeof seatShare_ === 'function' ? seatShare_(null) : { cUsed: 0, bUsed: 0 };
  return { extra_seat_rate: pounds2_(rate * u.cUsed), extra_seat_cut: pounds2_(rate * u.bUsed) };
}
/* A BLANK BOX SAYS "usual" AND NO MORE — "usual £3.00" was cut off in a box half a 390px card wide (measured);
   the amounts are in the line under the boxes, which has the room. Nothing without a rate: the line says why. */
const cardSeatPh_ = rate => rate > 0 ? 'usual' : '';
/* ---------- A PART IS DRAWN ONLY WHERE THE PRICE USES IT AS THE TUTOR'S OWN, AND ASKED OF `seatShare_` § */
function cardSeatShown_(f, rate, frac) {
  if (!(rate > 0) || typeof seatShare_ !== 'function') return '';
  const s = seatShare_({ extraSeat: frac, extraSeatCut: frac });
  if (f === 'extra_seat_cut') return s.cutOwn ? pounds2_(s.bRaw * rate).toFixed(2) : '';
  return s.seatOwn ? pounds2_(s.cRaw * rate).toFixed(2) : '';
}
/* POUNDS TYPED INTO A PART → THE SHARE THE HIDDEN BOX HOLDS. § */
function cardSeatShare_(f, typed, rate, was) {
  const s = String(typed == null ? '' : typed).trim(), P = num(s);
  const cell = String(was == null ? '' : was).trim();
  const usual = s === '' || isNaN(P) || (f === 'extra_seat_rate' && P === 0);
  if (cardSeatShown_(f, rate, cell) === (usual ? '' : pounds2_(P).toFixed(2))) return cell;
  return usual ? '' : String(Math.round(P / rate * 1e6) / 1e6);
}
/* A PART OUTSIDE 0 TO 2 OF THE RATE — what the server refuses for either part. Read as the typed share. */
const cardSeatOff_ = vals => vals.some(v => { const x = num(v); return !isNaN(x) && (x < 0 || x > 2); });
const cardSeatOffSay_ = rate => 'Each part is £0 to ' + money(pounds2_(rate * 2)) + '/h — twice the rate.';
/* THE SEAT AS THE CARD WILL PRINT IT — `profSeat_` over the typed row, the card's own function. § */
function cardSeatSay_(rate, seat, cut) {
  if (!(rate > 0)) return 'An extra seat is priced from the rate — set it first.';
  if (cardSeatOff_([seat, cut])) return esc(cardSeatOffSay_(rate));
  const x = typeof profSeat_ === 'function' ? profSeat_({ rate, extraSeat: seat, extraSeatCut: cut }) : 0;
  return x > 0 ? `<span class="prof-seat">+${esc(money(x))}/h a seat</span>` : 'An extra seat adds nothing.';
}
/* ---------- THE LINE UNDER IT: WHAT A BLANK AND A NOUGHT ARE, IN POUNDS, FOR BOTH PARTS § */
function cardSeatNote_(rate, cut, o) {
  const u = rate > 0 ? cardSeatUsual_(rate) : null;
  const at = k => u ? ' ' + money(u[k]) : '';
  const mine = (o.own ? 'Yours' : 'Theirs') + ': blank or £0 is the usual' + at('extra_seat_rate') + '.';
  if (!o.hasCut) return mine;
  if (o.mayCut) return mine + " @family.'s: blank is the usual" + at('extra_seat_cut') + ', £0 is no cut.';
  if (!u) return mine + " @family.'s part is set by @family.";
  const s = typeof seatShare_ === 'function' ? seatShare_({ extraSeatCut: cut }) : { bUsed: 0, cutOwn: false };
  return mine + ' ' + money(pounds2_(rate * s.bUsed)) + "/h of a seat is @family.'s" + (s.cutOwn ? '' : ', the usual')
    + ' — only @family. sets that.';
}
function cardRateHtml_(L, val, box, e) {
  const has = f => L.indexOf(f) !== -1;
  if (!has('rate_per_hour') || !has('extra_seat_rate')) return fieldRows_(L, box);
  const rate = num(val('rate_per_hour'));
  const live = rate > 0;
  const mayCut = has('extra_seat_cut') && isAdmin();
  const pound = (f, label) => fieldHtml(f, cardSeatShown_(f, rate, val(f)), { attr: 'data-pound', label, readonly: !live,
    draft: false, extra: `type="number" min="0" max="${live ? pounds2_(rate * 2) : 0}" step="0.01"${
      f === 'extra_seat_cut' ? ' inputmode="decimal"' : ''} placeholder="${esc(cardSeatPh_(rate))}"` });
  const hidden = f => has(f) ? `<input type="hidden" data-me="${f}" value="${esc(String(val(f)))}"${
    f === 'extra_seat_cut' && !mayCut ? ' disabled' : ''}>` : '';
  const own = !!(e && e.own);
  const boxes = [pound('extra_seat_rate', own ? 'yours, £/h' : 'theirs, £/h')]
    .concat(mayCut ? [pound('extra_seat_cut', "@family.'s, £/h")] : []);
  /* THE SEAT IS ONE LINE — what it adds, live — opening on its parts in pounds and what a blank is (425). */
  return box('rate_per_hour', {})
    + ceFold_('seat', 'Extra seat', `<span class="ce-seat" aria-live="polite">${cardSeatSay_(rate, val('extra_seat_rate'), val('extra_seat_cut'))}</span>`,
      `${boxes.join('')}${hidden('extra_seat_rate')}${hidden('extra_seat_cut')}
       <p class="faint ce-note ce-seat-note" data-own="${own ? '1' : ''}">${esc(cardSeatNote_(rate, val('extra_seat_cut'),
         { own, mayCut, hasCut: has('extra_seat_cut') }))}</p>`)
    + fieldRows_(L.filter(f => ['rate_per_hour', 'extra_seat_rate', 'extra_seat_cut'].indexOf(f) === -1), box);
}
/* ---------- AND AS IT IS TYPED: POUNDS INTO THE HIDDEN SHARE, THE SEAT REDRAWN § */
function cardSeatSync_(form, t, ev) {
  const sec = form.querySelector('.ce-sec[data-sec="rate"]');
  if (!sec || !t || !sec.contains(t) || !sec.querySelector('.ce-seat')) return;
  const rateBox = sec.querySelector('[data-me="rate_per_hour"]');
  const rate = num(rateBox ? rateBox.value : '');
  const hid = f => sec.querySelector('input[type="hidden"][data-me="' + f + '"]');
  const base = CARD_DRAWN.get(form.dataset.draw || '') || {};
  const share = b => {
    const f = b.dataset.pound, h = hid(f);
    if (h && !h.disabled && rate > 0) h.value = cardSeatShare_(f, b.value, rate, base[f]);
  };
  if (t.dataset && t.dataset.pound) {
    t.dataset.typed = '1';
    share(t);
    if (ev === 'change' && t.dataset.pound === 'extra_seat_rate' && String(t.value).trim() !== '' && num(t.value) === 0) t.value = '';
  }
  if (t === rateBox) {
    sec.querySelectorAll('[data-pound]').forEach(b => {
      b.disabled = !(rate > 0);
      b.max = String(rate > 0 ? pounds2_(rate * 2) : 0);
      b.placeholder = cardSeatPh_(rate);
      if (b.dataset.typed) { share(b); return; }
      const h = hid(b.dataset.pound);
      b.value = cardSeatShown_(b.dataset.pound, rate, h ? h.value : '');
    });
  }
  const seat = hid('extra_seat_rate'), cut = hid('extra_seat_cut');
  sec.querySelector('.ce-seat').innerHTML = cardSeatSay_(rate, seat ? seat.value : '', cut ? cut.value : '');
  const note = sec.querySelector('.ce-seat-note');
  if (note) note.textContent = cardSeatNote_(rate, cut ? cut.value : '', { own: note.dataset.own === '1',
    mayCut: !!sec.querySelector('[data-pound="extra_seat_cut"]'), hasCut: !!cut });
}
/* ---------- AND SAVE REFUSES A PART PAST TWICE THE RATE ITSELF, IN POUNDS § */
function cardSeatRefusal_(form, fields) {
  const sec = form.querySelector('.ce-sec[data-sec="rate"]');
  if (!sec || !sec.querySelector('.ce-seat')) return '';
  const rate = num((sec.querySelector('[data-me="rate_per_hour"]') || {}).value);
  const moved = ['extra_seat_rate', 'extra_seat_cut'].filter(f => Object.prototype.hasOwnProperty.call(fields, f));
  if (!(rate > 0) || !cardSeatOff_(moved.map(f => fields[f]))) return '';
  return cardSeatOffSay_(rate) + ' Nothing was saved.';
}
/* ---------- YOUR HANDLE, ON YOUR CARD, UNDER YOUR NAME (docs/history/339) § */
function cardHandleHtml_() {
  /* NO PRESS ANY MORE (364, 367): the handle is a template, said here so nobody has to be told it. */
  const said = (HANDLE_SAID.pid && HANDLE_SAID.pid === String(USER.personId || '') && HANDLE_SAID.text)
    || 'Your handle is the first and last letter of your first name and the year you joined. If somebody '
     + 'had it already, more letters of your first name were added, and then a number.';
  /* ONE LINE, AND THE RULE ONE TAP UNDER IT (425) — the handle is read here, never typed. */
  return ceFold_('handle', 'Handle', `<span class="handle-now" aria-live="polite"><b aria-hidden="true">@</b><span class="handle-shown">${
      esc((USER && USER.handle) || '')}</span></span>`, `<p class="faint handle-said">${esc(said)}</p>`);
}
/* SOMEBODY ELSE'S PICTURE, SHOWN AND NOT OFFERED — `savePhoto` writes the asker's own row. § */
function cardFaceOnly_(t) {
  const first = String(t.title || '').trim().split(/\s+/)[0] || 'They';
  return `<div class="ce-pic">${personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title,
    personId: t.personId }, { cls: 'prof-pic', none: 'prof-none', size: 52, eager: true })}
    <p class="faint ce-note">Only ${esc(first)} can change this picture, from their own card.</p></div>`;
}
/* ---------- WHAT IS ON THE CARD THE MOMENT IT IS SAVED § */
function cardPatchRow_(pid, all, sent) {
  const row = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === String(pid));
  if (!row) return;
  const has = k => Object.prototype.hasOwnProperty.call(sent, k);
  const txt = v => String(v == null ? '' : v).trim();
  const age = v => (/^\d+$/.test(txt(v)) ? Number(txt(v)) : txt(v));
  if (has('first_name') || has('last_name')) row.title = (txt(all.first_name) + ' ' + txt(all.last_name)).trim() || row.title;
  if (has('headline')) row.description = txt(all.headline) ? '"' + txt(all.headline) + '"' : '';
  if (has('rate_per_hour')) row.rate = Number(all.rate_per_hour) || 0;
  if (has('extra_seat_rate')) row.extraSeat = Number(all.extra_seat_rate) || 0;
  /* `doGet`'s shape (`seatCutOut_`): '' is the usual cut and nought is none, so not `Number(...) || 0` — read by
     `seatCutOf_`, the phone's copy of that one reading, so this guess and the payload that replaces it agree. */
  if (has('extra_seat_cut')) { const x = seatCutOf_(all.extra_seat_cut); row.extraSeatCut = isNaN(x) ? '' : x; }
  if (has('min_students')) row.minStudents = Number(all.min_students) || 1;
  if (has('max_students')) row.maxStudents = Number(all.max_students) || 0;
  if (has('years_experience')) row.yrsExp = txt(all.years_experience);
  if (has('age_min')) row.ageMin = age(all.age_min);
  if (has('age_max')) row.ageMax = age(all.age_max);
  /* `doGet`'s shapes: a blank shortest is one, a blank longest is no limit (0). */
  if (has('min_hours')) row.minHours = Number(all.min_hours) || 1;
  if (has('max_hours')) row.maxHours = Number(all.max_hours) || 0;
  if (has('video')) row.mediaUrl = txt(all.video);
  if (['adjective_1', 'adjective_2', 'adjective_3'].some(has)) {
    row.tags = [all.adjective_1, all.adjective_2, all.adjective_3].map(txt).filter(Boolean);
  }
  if (Object.keys(sent).some(isPhotoField_)) {
    row.photos = Object.keys(all).filter(isPhotoField_)
      .sort((a, b) => Number(a.slice(7)) - Number(b.slice(7))).map(f => txt(all[f])).filter(Boolean);
  }
  if (has('venues_ok')) row.venues = profList_(all.venues_ok);
  const hours = Object.keys(sent).filter(f => CARD_HOUR_.test(f));
  if (hours.length) {
    const a = Object.assign({}, row.avail || {});
    hours.forEach(f => { a[f] = TRUEish_(sent[f]) ? 'TRUE' : ''; });
    row.avail = a;
  }
}

/* ---------- A QUALIFICATION WITH NO LEVEL IS NOT SENT EITHER § */
const CARD_LEVELLESS_SAY_ = 'Choose a level for each qualification first — nothing was saved.';
function cardQualHole_(form, base) {
  return [...form.querySelectorAll('.q-shelf .q-list .q-slot')].some(slot => {
    const q = qualRead_(slot);
    return !!q.subject && !q.level
      && (!!slot.dataset.new || !!String(base['qual_' + slot.dataset.slot + '_level'] || '').trim());
  });
}

/* ---------- AND THE CARD IS A CARD AGAIN -------------------------------------------------------------------- */
function cardClose_(e, pane, sec) {
  try { draftDrop_('card', e.pid + (sec ? ':' + sec : '')); } catch (x) {}
  /* YOUR OWN STAYS OPEN (468) — the column is its editor — and what it would put back is what is there now. */
  if (CARD_EDIT === e && e.own && USER) {
    Object.assign(e, { pic0: cardPicNow_(), fig0: String(USER.avatar || ''), cr0: Number(USER.credits || 0), h0: String(USER.handle || USER.name || '') });
    cardRemember_(e);
  } else { if (CARD_EDIT === e) CARD_EDIT = null; cardForget_(); }
  /* CLEAN FIRST, or `settingsKeep_` holds the column and the repaint that ends the edit never happens. */
  (pane || document).querySelectorAll('.card-ed' + (sec ? '[data-sec="' + sec + '"]' : '') + ' .me-form[data-dirty]').forEach(f => { delete f.dataset.dirty; });
  if (sec) cardSecRedraw_(pane, sec);
  cardRepaint_();
}
/* ONE SECTION'S FORM DRAWN AGAIN IN PLACE (468) — the column's repaint waits while another card has typing, and this card's must not. */
function cardSecRedraw_(pane, sec) {
  const el = (pane || document).querySelector('.card-ed[data-sec="' + sec + '"]'), form = el && el.querySelector('.me-form');
  if (!form) return;
  try {
    const box = document.createElement('div');
    box.innerHTML = ownCardSetPage_(colOfEl_(el)).find(h => h.indexOf('data-sec="' + sec + '"') !== -1) || '';
    const fresh = box.querySelector('.me-form');
    if (fresh) form.replaceWith(fresh);
  } catch (x) {}
}

/* ---------- EDIT § */
on('card-edit', el => {
  if (!USER) return;
  const pid = String(el.dataset.pid || '');
  /* YOUR OWN CARD MAY HAVE NO TUTOR ROW — a parent's, a student's, an unlisted admin's — and is then the row
     `accountPages_` built from the sign-in reply (`myCardRow_`, find.js), the card the tile was under. */
  const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === pid)
    || (pid && pid === String(USER.personId || '') && typeof myCardRow_ === 'function' ? myCardRow_() : null);
  if (!t || !cardMayEdit_(t)) return;
  const col = PEOPLE_COLS_.indexOf(el.dataset.col) !== -1 ? el.dataset.col : (faceOfCol_(colOfEl_(el)) || 'tutors');
  const open = document.querySelector('.card-ed .me-form[data-dirty]');
  const openAt = open && (open.closest('.card-ed').dataset.pid + '|' + faceOfCol_(colOfEl_(open)));
  if (openAt && openAt !== pid + '|' + col) { toast('Save or cancel the card you are editing first.'); return; }
  if (CARD_EDIT && CARD_EDIT.pid === pid && (CARD_EDIT.col || cardColOf_(CARD_EDIT)) === col) return;
  CARD_EDIT = cardEditFresh_(pid);
  CARD_EDIT.col = col;
  /* THE PICTURE IT OPENED WITH, so Cancel can put it back — see `card-cancel`. Your own card only: on
     somebody else's the picture is shown and not offered (`cardFaceOnly_`). */
  if (CARD_EDIT.own) CARD_EDIT.pic0 = cardPicNow_(t);
  /* AND THE LOOK IT OPENED WITH, for the same Cancel — the wardrobe is a section of your own card now. */
  if (CARD_EDIT.own) {
    CARD_EDIT.fig0 = String(USER.avatar || ''); CARD_EDIT.cr0 = Number(USER.credits || 0);
    /* AND THE HANDLE IT IS DRAWN UNDER — see `cardRemember_`; the seed `avatarSave` reads. */
    CARD_EDIT.h0 = String(USER.handle || USER.name || '');
  }
  cardRemember_(CARD_EDIT);
  cardRepaint_();
});
/* YOUR PICTURE AS THIS PHONE LAST KEPT IT — `USER.profile.photo`, which `pfpTake_` writes on every save,
   else the sign-in reply's `USER.photo`, else your row's face. */
function cardPicNow_(t) {
  const p = (USER && USER.profile) || {};
  const v = Object.prototype.hasOwnProperty.call(p, 'photo') ? p.photo
    : (USER && USER.photo != null ? USER.photo : (t && t.image));
  return String(v == null ? '' : v).trim();
}

/* ---------- WHAT SAVED ITSELF WHILE THE CARD WAS OPEN (the review of docs/history/339) § */
function cardSelfSaved_(e) {
  if (!e || !e.own || !USER) return [];
  const h0 = typeof e.h0 === 'string' ? e.h0 : String(USER.handle || USER.name || '');
  const out = [];
  if (typeof e.pic0 === 'string' && cardPicNow_() !== e.pic0) out.push('picture');
  if (typeof e.fig0 === 'string' && lookKey_(USER.avatar, USER.handle || USER.name) !== lookKey_(e.fig0, h0)) out.push('figure');
  if (typeof e.h0 === 'string' && String(USER.handle || USER.name || '') !== e.h0) out.push('handle');
  return out;
}
function cardSelfSay_(e) {
  const l = cardSelfSaved_(e);
  if (!l.length) return '';
  const list = l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  return 'Your ' + list + (l.length === 1 ? ' was saved as you chose it.' : ' were saved as you chose them.');
}

/* ---------- SAVE: EVERY CHANGE, ONE REQUEST, THE EXISTING `updateProfile` § */
on('card-save', el => {
  const e = cardEditNow_();
  const pane = el.closest('.pane');
  /* THE CARD THE SAVE IS ON — your own card is a card per section (468). */
  const card = (el.closest('.card-ed')) || (pane && pane.querySelector('.card-ed'));
  const form = card && card.querySelector('.me-form');
  const sec = (card && card.dataset.sec) || '';
  if (!e || !USER || !form || card.dataset.pid !== e.pid || String(el.dataset.pid || '') !== e.pid) return;
  const said = form.querySelector('.me-said');
  const base = CARD_DRAWN.get(form.dataset.draw || '');
  if (!base) { cardRepaint_(); return; }
  /* ---------- NOT WHILE A SECTION THAT SAVES ITSELF IS ON THE WIRE (the review of docs/history/339) § */
  const busy = form.querySelector('.pfp.is-sending') ? 'Your picture is still saving'
    : form.querySelector('.is-sending') || form.classList.contains('is-sending') ? 'Part of your card is still saving' : '';
  if (busy) { toast(busy + ' — Save once it has.'); if (said) said.textContent = busy + ' — Save once it has.'; return; }
  if (qualNameless_(form)) { toast(QUAL_NAMELESS_SAY_); if (said) said.textContent = QUAL_NAMELESS_SAY_; return; }
  if (cardQualHole_(form, base)) { toast(CARD_LEVELLESS_SAY_); if (said) said.textContent = CARD_LEVELLESS_SAY_; return; }
  const fields = cardChanged_(base, cardFormVals_(form));
  const seatNo = cardSeatRefusal_(form, fields);
  if (seatNo) { toast(seatNo); if (said) said.textContent = seatNo; return; }
  /* NOTHING TYPED — BUT A SECTION THAT SAVES ITSELF MAY HAVE BEEN (`cardSelfSaved_`): § */
  if (!Object.keys(fields).length) { toast(cardSelfSay_(e) || 'Nothing had changed'); cardClose_(e, pane, sec); return; }
  const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === e.pid) || {};
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '',
          target: e.own ? USER.name : (t.title || ''), targetId: e.pid, fields },
        { button: el, busy: 'Saving…', where: said, lock: pane })
    .then(d => {
      if (e.own) {
        USER.profile = (d && d.profile) ? d.profile : Object.assign({}, USER.profile || {}, fields);
        if (d && d.name) USER.name = d.name;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (x) {}
        /* YOUR OWN COPY CHANGED, and the Progress column's journey card is drawn from it — see `meSave_`. */
        if (typeof progressRedraw_ === 'function') progressRedraw_();
      }
      cardPatchRow_(e.pid, Object.assign({}, base, fields), fields);
      toast((d && d.said) || 'Saved');
      cardClose_(e, pane, sec);
      /* A SAVE THAT WROTE NOTHING LEAVES THE STORED PAYLOAD ALONE — see `meSave_`. */
      if (!d || d.changed === undefined || d.changed > 0) { try { load(); } catch (x) {} }
    })
    .catch(() => { /* `send_` has written the refusal under the form, which is still open. */ });
});

/* ---------- CANCEL: WHAT WAS THERE COMES BACK — THE PICTURE TOO § */
/* ---------- AND THE FIGURE, WHICH THE WARDROBE SAVES A PICK AT A TIME (docs/history/339) § */
function figPutBack_(look, seed, el, pane, said) {
  AV_SEQ++;
  const cfg = avatarConfig(look, seed);
  return send_({ action: 'saveAvatar', name: USER.name, personId: USER.personId, avatar: cfg },
               { button: el, where: said || undefined, lock: pane || undefined })
    .then(d => {
      USER.avatar = d.avatar != null ? d.avatar : look;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (x) {}
      return true;
    }, () => false);
}
on('card-cancel', el => {
  const e = cardEditNow_();
  const pane = el.closest('.pane');
  const card = el.closest('.card-ed'), sec = (card && card.dataset.sec) || '';
  if (!e || (pane && pane.classList.contains('is-sending'))) return;
  if (pane && pane.querySelector('.card-ed .pfp.is-sending')) { toast('Your picture is still saving — Cancel once it has.'); return; }
  /* AND A LOOK STILL ON ITS WAY, for the picture's reason — see `AV_WIRE`. */
  if (AV_WIRE > 0) { toast('Your figure is still saving — Cancel once it has.'); return; }
  const was = typeof e.pic0 === 'string' ? e.pic0 : null;
  const picBack = !!((!sec || sec === 'picture') && e.own && was != null && USER && cardPicNow_() !== was);
  /* THE FIGURE AS DRAWN, under the handle each was drawn with (`lookKey_`) — see `cardSelfSaved_`. */
  const h0 = typeof e.h0 === 'string' ? e.h0 : String((USER && (USER.handle || USER.name)) || '');
  const figBack = !!((!sec || sec === 'figure') && e.own && typeof e.fig0 === 'string' && USER
    && lookKey_(USER.avatar, USER.handle || USER.name) !== lookKey_(e.fig0, h0));
  if (!picBack && !figBack) { cardClose_(e, pane, sec); return; }
  const form = (card || pane) && (card || pane).querySelector((card ? '' : '.card-ed ') + '.me-form');
  const said = form && form.querySelector('.me-said');
  const bought = typeof e.cr0 === 'number' && Number(USER.credits || 0) < e.cr0;
  /* THE LOOK FIRST, THEN THE PICTURE — one request at a time on one locked page, so the picture's own
     refusal path below is exactly what it was. */
  (figBack ? figPutBack_(e.fig0, h0, el, pane, said) : Promise.resolve(true)).then(figOk => {
    const fig = !figBack ? '' : figOk ? (bought ? ' Anything you bought is still yours.' : '') : '';
    if (!picBack) {
      cardClose_(e, pane, sec);
      toast(figOk ? 'Put back as it was — your figure too.' + fig : 'Everything else is put back, but not your figure.');
      return;
    }
    send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '', target: USER.name,
            targetId: e.pid, fields: { photo: was } },
          { button: el, where: said, lock: pane })
      .then(d => {
        const got = (d && d.profile && d.profile.photo != null) ? String(d.profile.photo) : was;
        if (d && d.profile) USER.profile = Object.assign({}, USER.profile || {}, d.profile);
        pfpTake_(null, got);
        cardClose_(e, pane, sec);
        toast(!figBack ? 'Put back as it was — your picture too'
          : figOk ? 'Put back as it was — your picture and your figure too.' + fig
          : 'Put back as it was, your picture too — but not your figure.');
      })
      .catch(() => {
        const why = String((said && said.textContent) || '').trim();
        cardClose_(e, pane, sec);
        toast('Everything else is put back, but not your picture' + (figBack && !figOk ? ' or your figure' : '') + (why ? ': ' + why : '.'));
      });
  });
});

/* ---------- EVERY BOX ON THE CARD: HELD, KEPT, AND THE MAP FOLLOWS THE TICKS § */
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  const form = t && t.closest && t.closest('.card-ed .me-form');
  if (!form) return;
  form.dataset.dirty = '1';
  cardSeatSync_(form, t, ev);
  cardKeep_(form);
  ceSums_(form);
}));

/* ---------- PEOPLE, MADE, CHANGED AND REMOVED BY AN ADMIN, ON THE PEOPLE COLUMN (373) ---------- */
/* THE ONE FORM OPEN: `{ id }` ('' for a new person), `data` once `personGet` answers, `made` for the slip. */
let PEOPLE_FORM_ = null;
/* THE ROLES CARD'S OWN WORDS (`ROLE_PICKS`), student first, and Admin, which only an admin gives. */
const peopleRolePicks_ = () => 'student client tutor'.split(' ').map(r => (ROLE_PICKS.find(x => x[0] === r) || [r, r]).slice(0, 2))
  .concat([['admin', 'Admin']]);
const peopleMay_ = () => typeof isAdmin === 'function' && isAdmin() && !!USER;
const peopleSelf_ = p => !!(USER && p && p.personId && String(p.personId) === String(USER.personId || ''));

/* DELETE, SHOW PIN AND THE DIGEST UNDER SOMEBODY ELSE'S CARD, for an admin; '' for anybody else and on your own. */
function peopleTiles_(p) {
  if (!peopleMay_() || !p || !p.personId || peopleSelf_(p)) return '';
  const first = String(nameBesideHandle_(p.title, p.handle) || p.title || '').trim().split(' ')[0] || 'them';
  /* NO EDIT (467): somebody's details are theirs to change, on their own settings; Delete, PIN and the digest stay the admin's. */
  return tile_({ icon: 'bin', label: 'Delete', note: 'their account', act: 'person-del', tone: 'danger',
              data: { id: p.personId, name: first } })
    /* "SHOW PIN" (452): fetched on the tap by `pinShow`, admin only on the server too; never in the payload. */
    + tile_({ icon: 'key', label: 'Show PIN', note: 'tap again to hide', act: 'pin-show', tone: 'admin',
              data: { id: p.personId } })
    /* AND ON A PARENT'S CARD, LAST MONDAY–SUNDAY'S WORK EMAILED NOW (378) — `digestSendNow`, admin only on the server too. */
    + (/^Client\b/.test(String(p.role || '')) ? tile_({ icon: 'send', label: 'Send last week', note: 'their child’s work, Mon–Sun',
              act: 'digest-send-now', tone: 'admin', data: { id: p.personId } }) : '');
}

/* THE TOP OF THE LIST: the "+", or the new person's form, or the slip once they are made. */
/* `col` (453): the people column it is drawn on — "Add a tutor" on Tutors, the form's role ticked to match, drawn where it was opened. */
const PEOPLE_ADD_ = { tutors: { role: 'tutor', say: 'Add a tutor' }, students: { role: 'student', say: 'Add a student' },
                      parents: { role: 'client', say: 'Add a parent' } };
function peopleAddPage_(col) {
  if (!peopleMay_()) return '';
  col = PEOPLE_ADD_[col] ? col : 'students';
  const F = PEOPLE_FORM_, plus = addCard_({ act: 'person-add', label: PEOPLE_ADD_[col].say, data: { col } });
  if (F && !F.id && (F.col || 'students') !== col) return plus;
  if (F && !F.id && F.made) {
    return `<div class="card person-made"><h3>${esc(F.made.first)} is on the people tab</h3>
      ${pinSlip_(F.made.first, F.made.handle, F.made.pin)}
      <p class="faint">Write it down or read it to them — the PIN is not shown again.</p>
      <button class="btn quiet" data-do="person-cancel">Done</button></div>`;
  }
  if (F && !F.id) return personFormHtml_(F);
  return plus;
}
/* ---------- FIND BY HANDLE, THE FIRST THING ON THE PEOPLE COLUMN (442) ---------- */
/* `q` typed; `child` the one card `findChild` answered for that exact handle (null: none), `asked` that handle. */
let PSEARCH_ = { q: '', asked: '', child: null, busy: false };
const psFold_ = v => String(v || '').trim().replace(/^@/, '').toLowerCase();
/* EVERY CARD THE COLUMN ALREADY SHOWS THIS PERSON — public, so a prefix may find them. Never a child's. */
function psPublic_() {
  const pool = [].concat(DATA.tutors || [], (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone)) ? DATA.everyone : [],
    Array.isArray(DATA.family) ? DATA.family : []);
  const seen = {};
  return pool.filter(p => p && p.handle && p.title && !seen[psFold_(p.handle)] && (seen[psFold_(p.handle)] = 1));
}
function psCard_(who, tiles) {
  const first = String(nameBesideHandle_(who.title, who.handle) || who.title || '').trim();
  return `<div class="ps-hit">
    ${personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: first, personId: who.personId },
                  { cls: 'kid-face', none: 'prof-none', size: 36 })}
    <p class="kid-who"><b>${esc(first)}</b><span class="prof-handle">@${esc(who.handle)}</span>${who.role ? `<span class="faint ps-role">${esc(who.role)}</span>` : ''}</p>
    ${tiles ? `<div class="tile-row">${tiles}</div>` : ''}
  </div>`;
}
function psResults_() {
  const q = psFold_(PSEARCH_.q);
  if (!q) return '';
  const pub = psPublic_().filter(p => psFold_(p.handle).indexOf(q) === 0).slice(0, 8);
  const out = pub.map(p => psCard_(p, p.personId && typeof tile_ === 'function' ? tile_({ icon: 'chat', label: 'Message',
    note: 'a note to them', act: 'msg-open', data: { to: p.title, id: p.personId } }) : ''));
  const exact = PSEARCH_.asked && PSEARCH_.asked === q;
  if (PSEARCH_.busy) out.push(loading_());
  else if (exact && PSEARCH_.child) {
    const c = PSEARCH_.child, linked = kidsLinked_().some(f => String(f.personId) === String(c.personId));
    out.push(psCard_({ title: c.first, handle: c.handle, avatar: c.avatar, personId: c.personId, role: 'Student' },
      linked ? '' : tile_({ icon: 'join', label: 'Add as my child', note: 'they say yes first', act: 'ps-add-child',
                            data: { handle: c.handle } })));
  }
  if (!out.length) out.push(`<p class="faint ps-none">${exact ? 'Nobody has that handle.' : 'Nobody’s handle starts with that.'}</p>`);
  return out.join('');
}
/* WHO MAY LOOK UP A CHILD — Client and up (400); the server asks the same. */
const psMayChild_ = () => typeof rankAtLeast_ === 'function' && rankAtLeast_('client');
function peopleSearchPage_() {
  if (!USER) return '';
  /* ONE SEARCH BAR, THE FIND INLINE (469) — the owner: "it just needs to be a search bar widget"; the placeholder is its label. */
  return `<div class="card ps-card">
    <div class="ps-bar">${searchPill_(`data-psearch aria-label="Find someone by handle" placeholder="@handle" autocapitalize="off" spellcheck="false" value="${esc(PSEARCH_.q)}"`)}
    ${psMayChild_() ? `<button class="btn quiet ps-go" data-do="ps-find" aria-label="Find">Find</button>` : ''}</div>
    <div class="ps-out" aria-live="polite">${psResults_()}</div>
  </div>`;
}
function psPaint_() {
  const out = document.querySelector('.ps-card .ps-out');
  if (out) out.innerHTML = psResults_();
  try { if (typeof placeCells === 'function') placeCells(); } catch (e) {}
}
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-psearch]')) return;
  PSEARCH_.q = t.value;
  psPaint_();
});
document.addEventListener('keydown', e => {
  const t = e.target;
  if (e.key !== 'Enter' || !t || !t.matches || !t.matches('[data-psearch]')) return;
  e.preventDefault();
  const b = document.querySelector('.ps-card [data-do="ps-find"]');
  if (b) b.click();
});
on('ps-find', el => {
  if (!USER || !psMayChild_()) return;
  const card = el.closest('.ps-card'), box = card && card.querySelector('[data-psearch]');
  const q = psFold_(box ? box.value : PSEARCH_.q);
  PSEARCH_.q = box ? box.value : PSEARCH_.q;
  if (q.length < 3) { toast('A handle is at least 3 letters'); return; }
  Object.assign(PSEARCH_, { asked: q, child: null, busy: true });
  psPaint_();
  send_({ action: 'findChild', personId: USER.personId || '', handle: q }, { button: el })
    .then(d => { PSEARCH_.child = (d && d.child && d.child.handle) ? d.child : null; })
    .catch(() => { PSEARCH_.asked = ''; })
    .then(() => { PSEARCH_.busy = false; psPaint_(); });
});
on('ps-add-child', el => {
  if (!USER || !psMayChild_()) { toast('Sign in first'); return; }
  const handle = el.getAttribute('data-handle') || '';
  if (!handle) return;
  send_({ action: 'claimChild', name: USER.name, personId: USER.personId || '', handle }, { button: el })
    .then(() => { toast('Asked. They will see it when they next sign in.'); PSEARCH_.child = null; PSEARCH_.asked = ''; psPaint_(); load(); })
    .catch(heldBy_);
});

/* THE FORM IN THE CARD'S PLACE while it is open on this person. */
function personFormFor_(p, col) {
  const F = PEOPLE_FORM_;
  return F && F.id && p && p.personId && String(p.personId) === F.id && (!col || !F.col || F.col === col) && peopleMay_() ? personFormHtml_(F) : '';
}

function personFormHtml_(F) {
  const head = `<h3>${F.id ? 'Edit ' + esc((F.data && F.data.person && F.data.person.firstName) || 'them') : 'A new person'}</h3>`;
  if (!F.data) {
    if (!F.asked && !F.err) { F.asked = true; setTimeout(() => personFetch_(F), 0); }
    return `<div class="card person-form" data-pid="${esc(F.id)}">${head}${F.err
      ? `<p class="faint">${esc(F.err)}</p><button class="btn quiet" data-do="person-cancel">Close</button>` : loading_()}</div>`;
  }
  const p = F.data.person || { firstName: '', lastName: '', roles: [F.role || 'student'], email: '', dob: '', parentIds: [] };
  const choices = Array.isArray(F.data.parents) ? F.data.parents : [];
  const nameOf = id => (choices.find(c => c.personId === id) || {}).name || id;
  const has = (p.parentIds || []).filter(Boolean);
  const kid = (p.roles || []).indexOf('student') !== -1;
  const box = (k, ph, v, type) => `<label class="field"><input data-pf="${k}" placeholder="${esc(ph)}"
    autocomplete="off"${type ? ` type="${type}"` : ''} value="${esc(v || '')}"></label>`;
  return `<div class="card person-form" data-pid="${esc(F.id)}">${head}
    <div class="f-row" style="--n:2">${box('first', 'First name', p.firstName)}${box('last', 'Last name', p.lastName)}</div>
    ${F.id && p.handle ? `<p class="faint pf-handle">Their handle stays @${esc(p.handle)}.</p>` : ''}
    <div class="pf-roles" role="group" aria-label="Role">${peopleRolePicks_().map(([r, label]) => `<label class="check">
      <input type="checkbox" data-pf-role="${r}"${(p.roles || []).indexOf(r) !== -1 ? ' checked' : ''}><span class="box"></span>
      <span>${label}</span></label>`).join('')}</div>
    ${box('email', 'Email (optional)', p.email, 'email')}
    <label class="field"><span>Date of birth (optional)</span><input type="date" data-pf="dob" value="${esc(p.dob || '')}"></label>
    <div class="pf-parents"${kid ? '' : ' hidden'}>
      ${has.length ? '<p class="faint pf-note">Their parents — untick one to unlink.</p>' : ''}
      ${has.map(id => `<label class="check"><input type="checkbox" data-pf-parent="${esc(id)}" checked><span class="box"></span>
        <span>${esc(nameOf(id))}</span></label>`).join('')}
      <label class="field"><span>${has.length ? 'Another parent' : 'Their parent (optional)'}</span><select data-pf="parent">
        <option value="">None</option>${choices.filter(c => has.indexOf(c.personId) === -1).map(c =>
          `<option value="${esc(c.personId)}">${esc(c.name)}</option>`).join('')}</select></label>
    </div>
    <p class="faint pf-said" aria-live="polite"></p>
    <div class="pf-go"><button class="btn" data-do="person-save">${F.id ? 'Save' : 'Add them'}</button>
      <button class="btn quiet" data-do="person-cancel">Cancel</button></div>
  </div>`;
}

function peopleRedraw_() {
  /* PEOPLE ARE ON THE THREE PEOPLE COLUMNS since 453. */
  PEOPLE_COLS_.forEach(c => { if (typeof AT !== 'undefined' && AT === c) repaint(true); else markStale_(c); });
}
function personFetch_(F) {
  send_({ action: 'personGet', personId: (USER && USER.personId) || '', targetId: F.id })
    .then(d => { if (PEOPLE_FORM_ !== F) return; F.data = { person: d.person || null, parents: d.parents || [] }; peopleRedraw_(); })
    .catch(e => { if (PEOPLE_FORM_ !== F) return; F.err = (e && e.message) || 'That could not be opened.'; peopleRedraw_(); });
}

on('person-add', el => {
  if (!peopleMay_()) return;
  const col = PEOPLE_ADD_[el && el.dataset && el.dataset.col] ? el.dataset.col : 'students';
  PEOPLE_FORM_ = { id: '', col, role: PEOPLE_ADD_[col].role };
  peopleRedraw_();
});
on('person-cancel', () => { PEOPLE_FORM_ = null; peopleRedraw_(); });

/* THE PARENTS' PART FOLLOWS THE STUDENT TICK — a parent is only asked of a child. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.person-form [data-pf-role="student"]')) return;
  const box = t.closest('.person-form').querySelector('.pf-parents');
  if (box) box.hidden = !t.checked;
});

/* THE CARD THE SERVER SENT, put where the column draws it — `everyone`, or the tutor already drawn. */
function peoplePut_(card, gone) {
  const id = String(gone || (card && card.personId) || '');
  if (!id || !DATA) return;
  const tut = (DATA.tutors || []).find(t => t && String(t.personId) === id);
  if (Array.isArray(DATA.tutors) && gone) DATA.tutors = DATA.tutors.filter(t => !(t && String(t.personId) === id));
  else if (tut) Object.assign(tut, { title: card.title, handle: card.handle });
  const list = Array.isArray(DATA.everyone) ? DATA.everyone.filter(p => !(p && String(p.personId) === id)) : [];
  if (!gone && !tut) list.push(card);
  DATA.everyone = list;
}

on('person-save', el => {
  const F = PEOPLE_FORM_, form = el.closest('.person-form');
  if (!F || !form || !peopleMay_()) return;
  const val = k => ((form.querySelector('[data-pf="' + k + '"]') || {}).value || '').trim();
  const roles = [...form.querySelectorAll('[data-pf-role]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-role'));
  const said = form.querySelector('.pf-said');
  if (!val('first') || !val('last')) { if (said) said.textContent = 'A first name and a last name, please.'; return; }
  if (!roles.length) { if (said) said.textContent = 'Tick at least one role.'; return; }
  const parentIds = roles.indexOf('student') === -1 ? []
    : [...form.querySelectorAll('[data-pf-parent]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-parent'))
      .concat(val('parent') ? [val('parent')] : []);
  send_({ action: 'personSave', personId: USER.personId || '', targetId: F.id, firstName: val('first'),
          lastName: val('last'), roles, email: val('email'), dob: val('dob'), parentIds },
        { button: el, where: said, lock: form })
    .then(d => {
      peoplePut_(d.person);
      if (!F.id) { PEOPLE_FORM_ = { id: '', made: { first: d.first || val('first'), handle: d.handle || '', pin: d.pin || '' } }; }
      else { PEOPLE_FORM_ = null; toast('Saved.'); }
      peopleRedraw_();
      load();
    })
    .catch(() => {});
});

/* ONE PRESS SENDS — the owner's word for it (378); the server's sentence is the toast, sent or why not. */
on('digest-send-now', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  if (!id) return;
  send_({ action: 'digestSendNow', personId: USER.personId || '', targetId: id }, { button: el })
    .then(d => toast((d && d.said) || 'Sent.'))
    .catch(() => {});
});

/* "SHOW PIN" (452): the PIN lives only in this one line of the card — never stored, logged or cached — and goes on a second tap, a redraw or leaving the column. */
function pinHideAll_() {
  document.querySelectorAll('.person-pin').forEach(n => n.remove());
}
on('pin-show', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  const row = el.closest('.tile-row');
  if (!id || !row) return;
  const shown = row.nextElementSibling;
  if (shown && shown.classList.contains('person-pin')) { shown.remove(); return; }
  send_({ action: 'pinShow', personId: USER.personId || '', targetId: id }, { button: el })
    .then(d => {
      if (!d || !row.isConnected) return;
      pinHideAll_();
      const line = document.createElement('p');
      line.className = 'faint person-pin';
      line.style.margin = '.6rem 0 0';
      line.setAttribute('data-id', id);
      line.innerHTML = d.pin ? 'PIN <b>' + esc(d.pin) + '</b>' : esc(d.said || 'No PIN');
      row.after(line);
    })
    .catch(() => {});
});

/* TAP AGAIN TO CONFIRM (420): the Delete tile asks on itself, never in a pop-up; the second press deletes. */
on('person-del', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  if (!id) return;
  if (!sure_(el, 'Tap again to confirm')) return;
  send_({ action: 'personDelete', personId: USER.personId || '', targetId: id }, { button: el })
    .then(() => {
      peoplePut_(null, id);
      if (PEOPLE_FORM_ && PEOPLE_FORM_.id === id) PEOPLE_FORM_ = null;
      toast((el.getAttribute('data-name') || 'They') + ' is deleted.');
      peopleRedraw_();
      load();
    })
    .catch(() => {});
});
