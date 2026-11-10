/* @family. — me.js ONE FILE, SPLIT. § */



/* THE SCREENS. One function each, returning markup. § */

/* ---------- YOU § */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) return split_(signInCard_() + registerCard_());
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
    ${/* `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the row under your own face. § */
          ''}

    ${/* ---------- `What needs fixing` AND `Tell someone` WERE HERE § */
          ''}

    ${/* ---------- THE SECOND `Sign out` WAS HERE § */
          ''}
    ${/* ---------- THE VERSION CARD IS GONE FROM THE COLUMN § */
          ''}`);}

/* ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT § */
/* THE BUILD CARD IS ITS LINES, so they are no grey clutter (A+): `build-said` keeps them past the rule that hides a card's grey lines. */
function versionSaid_() {
  return `<p class="build-said" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · css ${esc(cssVersion())}<br>
      backend ${esc(dash_(DATA.version))}</p>
      ${(() => {
        const f = DATA.fileVersions || {};
        const names = Object.keys(f);
        if (names.length < 2) return '';
        const newest = names.map(k => f[k]).sort().pop();
        const stale = names.filter(k => f[k] !== newest);
        return stale.length
          ? `<p class="build-said is-warn">Not deployed: ${stale
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
  return date_(d) + ' ' + time_(d);
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
    <p class="sub">Backend live: <b>${esc(dash_(S_.backend))}</b> · site ${esc(typeof SITE_VERSION !== 'undefined' ? SITE_VERSION : dash_())}${odd.length
      ? ` · <span class="setup-bad">not deployed: ${odd.map(k => esc(k) + '.gs (' + esc(files[k]) + ')').join(', ')}</span>` : ' · all 4 files agree'}</p>
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
/* WHOLE YEARS FROM A PROFILE'S DATE OF BIRTH (or an `age` field), or null when it says neither. */
function profileAge_(p) {
  const q = p || {};
  const y = Number(q.dob_y), m = Number(q.dob_m) || 1, d = Number(q.dob_d) || 1;
  if (y > 1900) {
    const now = new Date();
    return now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
  }
  const a = String(q.age == null ? '' : q.age).match(/^\s*(\d{1,3})\s*$/);
  return a ? Number(a[1]) : null;
}
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
    <h4>2 references</h4>
    <div class="f-row" style="--n:2">${box('ref1Name', 'name')}${box('ref1Contact', 'email or phone')}</div>
    <div class="f-row" style="--n:2">${box('ref2Name', 'name')}${box('ref2Contact', 'email or phone')}</div>
    ${area('statement', 'a short statement — why you want to teach')}
    ${box('cvLink', 'CV link (optional)', { ph: 'https://…', type: 'url' })}
    <label class="check"><input type="checkbox" data-app="consent"><span class="box"></span><span>I agree to @family. keeping these details to consider my application, contacting my referees and checking my DBS.</span></label>
    <div class="btn-row">${tile_({ form: true, label: 'Send my application', act: 'apply-send' })}</div>
    <p class="faint me-said apply-said" aria-live="polite"></p>
  </div>`;
}
/* MAY THIS ACCOUNT FILL THE FORM NOW: an adult with no application waiting. The form is in its card from the start (no sheet, owner 8 Nov). */
function applyFormOpen_() {
  if (!USER || rankAtLeast_('staff') || profileAge_(USER.profile) === null || !applyAdult_()) return false;
  const st = USER.application && USER.application.status;
  return st !== 'new' && st !== 'interview';
}
on('apply-open', () => { const f = document.querySelector('.apply-card .app-form'); if (f) f.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
on('apply-send', el => {
  const f = el.closest('.app-form');
  if (!f || !USER) return;
  const v = k => { const b = f.querySelector(`[data-app="${k}"]`); return !b ? '' : isCheckbox_(b) ? (b.checked ? 'TRUE' : '') : String(b.value || '').trim(); };
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
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) { /* storage can be blocked; the app runs without it */ }
      toast('Application sent');
      try { paint('staff'); } catch (e) { oops_(e, 'me:applyFormHtml_') }
    })
    .catch(() => {});
});

/* THE YOU SCREEN IS ONE PAGE. § */
/* MESSAGES, ON A PANE OF ITS OWN. § */

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

function mountGoogleWhenDrawn() {
  if (!USER && typeof googleMount === 'function') requestAnimationFrame(googleMount);
}


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
      try { box.focus(); if (id === 'in-name') box.select(); } catch (e) { /* focus and scrolling are niceties */ }
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
  try { if (typeof answersPush_ === 'function') last = answersPush_(true); } catch (err) { oops_(err, 'me:googleSignedIn_') }
  /* AND THE PRESSES, WHICH SINCE 9 OCT ARE HOW A TYPED ANSWER REACHES THE ACCOUNT AT ALL — the one in flight and every one queued behind it, on this token, before § */
  let subs = Promise.resolve();
  try {
    if (typeof subDrain_ === 'function') subs = subDrain_(USER && USER.personId, tok, typeof answersCan_ === 'function' && answersCan_('submitAnswer'));
  } catch (err) { /* nothing to send: the waiting answers stay on the device for next time */ }
  /* AND THE NOTEPAD, THE DOCKET AND THE TIMETABLE, still inside their moment before they go up (`keepDue_`, data.js) — each is sent only while somebody is signed § */
  let due = Promise.resolve();
  try { if (typeof keepFlush_ === 'function') due = keepFlush_(); } catch (err) { oops_(err, 'me:googleSignedIn_') }
  Promise.all([Promise.resolve(last).catch(() => {}), due, Promise.resolve(subs).catch(() => {})]).then(() => { try { if (tok) api({ action: 'signOut', token: tok }); } catch (err) { /* sign out goes on even if the server call cannot be made */ } });
  signedOut_();
  toast('Signed out');
});

/* ONE WAY IN AND ONE WAY OUT. § */
function signedOut_(opts) {
  opts = opts || {};
  /* WHO IS LEAVING, AND WHETHER THEY WERE AN ADMIN — read before they are forgotten, for `ended` below. */
  const was = USER;
  let wasAdmin = false;
  try { wasAdmin = (typeof isAdmin === 'function' && isAdmin()) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) { oops_(e, 'me:signedOut_') }
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch (e) { /* storage can be blocked; the app runs without it */ }
  payloadForget_();   /* the device's copy of their payload goes with them (1070) */
  /* ---------- AND WHAT THEY HAD ASKED FIND FOR GOES WITH THEM § */
  try {
    const states = typeof finderStates_ === 'function' ? finderStates_()
                 : (typeof STUFF !== 'undefined' ? [STUFF] : []);
    states.forEach(st => {
      if (opts.keepFind) { /* nobody → somebody: `signedIn_` keeps it, and says whose it is now */ }
      else if (opts.ended && was && !wasAdmin) st.whose = String(was.personId || was.name || '');
      else st.whose = '';
    });
    /* THE PAGE GOES WITH THE KEPT CHIPS (318): signed out the list is too short to hold it, so it is noted for the same child's return. */
    if (opts.ended && was && !wasAdmin && typeof FINDERS !== 'undefined') Object.keys(FINDERS).forEach(id => { FINDERS[id].st.whoseAt = PAGE[id] || 0; });
    /* Through the one writer, so the box and a parked typing timer go too: a quiet switch never repaints, and the box kept the last person's words (522). */
    if (!opts.keepFind && !(opts.ended && was && !wasAdmin) && typeof finderSet_ === 'function') {
      Object.keys(FINDERS).forEach(id => finderSet_(FINDERS[id], { paint: false }));
    }
  } catch (err) { /* a finder not built yet has no box to clear */ }
  /* THE INBOX, AND THE POLL THAT FILLS IT. `MSG_ASKING` too: a reply still on its way is the last
     person's, and `loadMessages` drops it when it lands for somebody else. */
  MESSAGES = null; MSG_FAILED = false; MSG_PENDING = []; MSG_ASKING = null;
  Object.keys(MSG_QUEUE).forEach(k => { delete MSG_QUEUE[k]; });
  try { DM_ASKED = false; DM_DONE = false; DM_LAST = 0; if (typeof dmStop_ === 'function') dmStop_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* THE STARS — the device's copy is a cache of the person, and the next person is not them. */
  try { FAVS = new Set(); localStorage.removeItem('favs'); } catch (e) { /* storage can be blocked; the app runs without it */ }
  /* WHAT THE LAST PERSON SENT, AS THIS DEVICE HELD IT FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN. § */
  try { if (typeof subForget_ === 'function') subForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
  try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE CAMERA, which is kept parked while the app is open (427) — the next person's phone light is not this one's. */
  try { if (typeof camStop_ === 'function') camStop_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`). § */
  try { if (typeof KP_UNDO !== 'undefined') KP_UNDO.clear(); } catch (e) { oops_(e, 'me:signedOut_') }
  try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* THE PAYLOAD'S PER-PERSON KEYS. Each is already hidden from the next person by its `for` check, so
     this is not what stops a leak — it is what stops the last person's data sitting on the device. */
  try {
    DATA.submissions = { for: '', mine: {} };
    DATA.family = []; DATA.familyFor = '';
    DATA.favourites = []; DATA.everyone = [];
  } catch (e) { /* no payload yet: nothing of the last person to clear */ }
  /* ---------- AND THE FILMS, WHICH HAVE NO `for` CHECK AT ALL § */
  try { DATA.films = []; delete DATA.filmsSync; } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE LIBRARY'S WORDS AND ANSWERS THIS VISIT FETCHED (397) — the next person signs in for their own. */
  try { if (typeof libForget_ === 'function') libForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
  try { if (typeof stuffForget_ === 'function') stuffForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE ANSWERS' READ — the next person signing in is read for, whoever they are (js/answers.js). */
  try { if (typeof answersForget_ === 'function') answersForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE PEN, AND THE WHITEBOARD ON A COLUMN THE REPAINT BELOW LEAVES STALE — the last person's
     board stayed armed under their key until Tools was next arrived at (`padWhoChanged_`, find.js). */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE DEAD KEY OF THE DRAW/TYPE SWITCH, which face each drawing question was left on (327, 337). § */
  try { localStorage.removeItem('surfaceFace'); } catch (e) { /* storage can be blocked; the app runs without it */ }
  /* AND THE BOOKING FORM, which is the person's draft and not the next family's (`bookFollow_`, book.js;
     docs/history/317). `typeof`, because book.js loads after this file. */
  try { if (typeof bookFollow_ === 'function') bookFollow_(!!opts.quiet); } catch (e) { oops_(e, 'me:signedOut_') }
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
  try { whose = String((finders_().find(st => st && st.whose) || {}).whose || ''); } catch (e) { /* no finder yet: nothing to read or clear */ }
  /* THE SAME CHILD BACK AFTER A SESSION ENDED UNDER THEM: the page Find was on, put back once their list is drawn. */
  const backAt = {};
  try { if (fromNobody && whose && whose === pid) Object.keys(FINDERS).forEach(id => { backAt[id] = FINDERS[id].st.whoseAt; }); } catch (e) { /* no finder yet: no page to put back */ }
  if (fromNobody) signedOut_({ quiet: true, keepFind: !whose || whose === pid });
  else if (over) signedOut_({ quiet: true });
  /* SIGNED IN, FIND IS THE PERSON'S OWN, and `USER` says whose — `whose` is only for while nobody is. */
  try { finders_().forEach(st => { st.whose = ''; st.whoseAt = 0; }); } catch (e) { /* no finder yet: nothing to read or clear */ }
  /* THE REPLY, PLUS WHAT WE ALREADY KNEW — see `do-signin`. The handle when the row has no name. */
  USER = me;
  if (!USER.name) USER.name = me.handle || typed || '';
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) { /* storage can be blocked; the app runs without it */ }
  /* ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED § */
  try { if (over && typeof ansSwitchedIn_ === 'function') ansSwitchedIn_(pid); } catch (e) { oops_(e, 'me:signedIn_') }
  /* EVERY COPY OF THE WHITEBOARD UNDER THE PERSON WHO IS SIGNED IN NOW, stale columns included. */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) { oops_(e, 'me:signedIn_') }
  /* THE BOOKING FORM FOLLOWS — filled in signed out and signed in to send, it is theirs (book.js). */
  try { if (typeof bookFollow_ === 'function') bookFollow_(); } catch (e) { oops_(e, 'me:signedIn_') }
  try {
    if (got.submissions && typeof got.submissions === 'object' && String(got.submissions.for || '') === pid) DATA.submissions = got.submissions;
    if (Array.isArray(got.favourites)) {
      DATA.favourites = got.favourites;
      if (typeof adoptFavourites_ === 'function') adoptFavourites_();
    }
    if (Array.isArray(got.family) && String(got.familyFor || '') === pid) { DATA.family = got.family; DATA.familyFor = pid; }
  } catch (e) { /* a reply without these keys leaves the empty ones from sign-out */ }
  /* THE ANSWERS, INTO THE BOXES — the reply's copy now, and a fresh read at once beside it, which also
     sends whatever this device has had waiting for this person (js/answers.js). */
  try { if (got.answers && typeof got.answers === 'object' && typeof answersAdopt_ === 'function') answersAdopt_(pid, got.answers); } catch (e) { oops_(e, 'me:signedIn_') }
  /* AND WHAT WAS WRITTEN SIGNED OUT IS THIS PERSON'S, from nobody only — the same seat as Find above. § */
  try { if (pid && typeof answersClaim_ === 'function') answersClaim_(pid, !fromNobody); } catch (e) { oops_(e, 'me:signedIn_') }
  try { if (typeof answersPull_ === 'function') answersPull_(true); } catch (e) { oops_(e, 'me:signedIn_') }
  /* AND THE LATEST ANSWER SENT FOR EACH QUESTION — onto the cards, into the boxes, with "Signed in" — and
     whatever this device has waiting for this person goes up (js/submit.js). */
  try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) { oops_(e, 'me:signedIn_') }
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
  } catch (e) { /* no way back: they stay on the account screen */ }
  Object.keys(backAt).forEach(id => { if (backAt[id] > 0) { try { goPage(id, backAt[id], true); } catch (e) { oops_(e, 'me:signedIn_') } } });
  load();
  /* AND WHAT IS OWED ONCE IN — a sentence about held children, a move link waiting. */
  afterSignIn_(d);
}

/* NOTHING ABOUT WHO SIGNED IN IS KEPT ON THE DEVICE — the owner did not want recent usernames offered (docs/history/383). Old keys are wiped. */
function signInForgetOld_() {
  try { localStorage.removeItem('familyHandles'); localStorage.removeItem('familyAdminHint'); } catch (e) { /* storage can be blocked; the app runs without it */ }
}
signInForgetOld_();
/* DOTS ON A TEXT BOX, WHERE THE BROWSER CAN DRAW THEM — see `.pin-dots` and the PIN box above. Asked of
   the browser rather than of its name. */
function pinDotsOk_() {
  try { return !!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc')); }
  catch (e) { return false; }
}

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
/* MAKE AN ACCOUNT IS A CARD OF ITS OWN beside Sign in, its form there from the start (no sheet, owner 7 Nov). */
function registerCard_() {
  return `<div class="card reg-card"><h3>Make an account</h3><div class="reg-form">
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
      ${tile_({ form: true, label: 'Make my account', act: 'reg-send' })}
      ${/* THREE LINES AT 320, MEASURED: § */
            ''}
      <p class="said" id="reg-note"></p>
    </div></div></div>`;
}
/* THE SIGN-IN CARD'S TILE GOES TO THE FORM: on this column if it is drawn, else on the account column. */
on('register', el => {
  const near = () => (el && el.closest && el.closest('.screen') || document).querySelector('.reg-card') || document.querySelector('.screen.on .reg-card');
  let f = near();
  if (!f && typeof go === 'function') { go('account'); f = document.querySelector('#s-account .reg-card'); }
  if (f && f.scrollIntoView) f.scrollIntoView({ block: 'start', behavior: 'smooth' });
});

/* `regWho_` IS THE ONE READER of the answer, so the send and the redraw cannot disagree about it. */
const regIn_ = (el, id) => ((el && el.closest && el.closest('.reg-form')) || document).querySelector('#' + id);
const regWho_ = el => {
  const w = ((regIn_(el, 'reg-who') || {}).dataset || {}).who || '';
  return w === 'parent' || w === 'student' ? w : '';
};
on('reg-who', el => {
  const row = regIn_(el, 'reg-who');
  if (!row || !el) return;
  /* THE SELECT ON A CHANGE; a check may hand one of its options. */
  const sel = regIn_(el, 'reg-who-in'), v = el.tagName === 'OPTION' ? el.value : (el.value || el.dataset.who);
  if (v !== 'parent' && v !== 'student') return;
  const who = v;
  row.dataset.who = who;
  if (sel) sel.value = who;
  const rest = regIn_(el, 'reg-rest'); if (rest) rest.hidden = false;
  const tick = regIn_(el, 'reg-noemail'), tickRow = tick && tick.closest('.reg-kid');
  if (tickRow) tickRow.hidden = who !== 'student';
  if (tick && who !== 'student') tick.checked = false;
  const note = regIn_(el, 'reg-note'); if (note) note.textContent = REG_NOTE[who];
});

on('reg-send', el => {
  const v = id => (((regIn_(el, id) || {}).value) || '').trim();
  const first = v('reg-first'), last = v('reg-last'), email = v('reg-email'), pin = v('reg-pin');
  const who = regWho_(el);
  /* A STUDENT'S TICK ONLY. The row is hidden for a parent and unticked when it hides, and this asks
     again rather than trusting that — a parent's address sent as `parent_email` is refused anyway. */
  const kid = who === 'student' && !!(regIn_(el, 'reg-noemail') || {}).checked;
  /* UNREACHABLE FROM THE CARD — the button is under the question until it is answered — and said anyway, for a button pressed some other way: § */
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
      ['first', 'last', 'email'].forEach(f => { try { draftDrop_('reg', f); } catch (e) { oops_(e, 'me:registerCard_') } });
      const pinBox = regIn_(el, 'reg-pin'); if (pinBox) pinBox.value = '';
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
