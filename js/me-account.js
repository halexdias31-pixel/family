/* @family. — me.js ONE FILE, SPLIT. § */



/* THE SCREENS. One function each, returning markup. § */

/* ---------- YOU § */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) return split_(registerCard_());
  return meRest_();
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
  return `<p class="build-said">@family. · Merton &amp; Wandsworth<br>
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
  const age = profileAge_(whose_() && whose_().profile);
  return age !== null && age >= 18;
}
/* THE PADLOCK'S ONE TILE (464): Apply to teach, or where the application stands, on the tile itself; null for a child. */
function applyOpts_() {
  if (!whose_() || whoseAtLeast_('staff')) return null;
  if (profileAge_(whose_().profile) === null)
    return { icon: 'join', label: 'Apply to teach', note: 'add your date of birth first', act: 'apply-open', off: true };
  if (!applyAdult_()) return null;
  const st = whose_().application && whose_().application.status;
  if (st === 'new' || st === 'interview')
    return { icon: 'join', label: 'Application sent', note: st === 'interview' ? 'we will arrange a talk' : 'we will be in touch', act: 'apply-open', off: true };
  return { icon: 'join', label: st === 'declined' ? 'Apply again' : 'Apply to teach', note: st === 'approved' ? 'approved' : '', act: 'apply-open' };
}
/* THE DOCUMENT PHOTOS PICKED SO FAR, as 1200px JPEG data URLs by slot (idDoc, rtwDoc, qual0…): sent with the form, kept nowhere else. */
const APPLY_DOCS = {};
const APPLY_QUAL_SLOTS = 3;
/* WHAT THE FORM HAS ALREADY: name, email, phone and date of birth from the account, so an applicant types them once. */
function applyKnown_() {
  const q = (whose_() && whose_().profile) || {};
  const pad = n => String(n).padStart(2, '0');
  const dob = Number(q.dob_y) > 1900 ? q.dob_y + '-' + pad(Number(q.dob_m) || 1) + '-' + pad(Number(q.dob_d) || 1) : '';
  return { fullName: [q.first_name, q.last_name].filter(Boolean).join(' '), email: q.email || '', phone: q.phone || '', dob };
}
function applyFormHtml_() {
  /* `qualPick_` returns a field block (me-shelves); here it is drawn without its Something else… option. */
  const noOther = b => { b.blocks[0].options = b.blocks[0].options.filter(o => o.value !== QUAL_OTHER); return cardBlock_(b); };
  const rows = Array.from({ length: APP_SUBJECT_ROWS }, (_, i) => `<div class="q-row">
      ${noOther(qualPick_({ 'data-app-subj': String(i) }, '', QUAL_SUBJECTS, i ? 'Another subject' : 'Subject', 'Choose'))}
      ${noOther(qualPick_({ 'data-app-level': String(i) }, '', QUAL_LEVELS, 'Level', 'Choose'))}</div>`).join('');
  const codes = typeof availCodes_ === 'function' ? availCodes_() : [];
  const week = codes.length ? availGrid_(codes, {}, [], false) : '';
  const known = applyKnown_();
  const box = (k, label, o) => formLine_(label, formInput_(`data-app="${k}" autocomplete="off"${(o && o.type) ? ` type="${o.type}"` : ''}${
    (o && o.ph) ? ` placeholder="${esc(o.ph)}"` : ''}${known[k] ? ` value="${esc(known[k])}"` : ''}${(o && o.more) ? ' ' + o.more : ''}`));
  const area = (k, label) => formLine_(label, formArea_(`data-app="${k}" rows="3"`));
  /* ONE LINE PER DOCUMENT: its name, a Choose photo button, and what was picked. */
  const doc = (k, label) => `<div class="field apply-doc" data-doc="${k}"><span>${esc(label)}</span>
      <div class="btn-row">${tile_({ form: true, kind: 'quiet', label: APPLY_DOCS[k] ? 'Change photo' : 'Choose photo', act: 'apply-pick' })}</div>
      <p class="note apply-doc-said">${APPLY_DOCS[k] ? 'Photo ready.' : ''}</p>${formFile_('apply-in', 'image/*')}</div>`;
  const ref = n => `<div class="f-row">${box(`ref${n}Name`, 'name')}${box(`ref${n}Relationship`, 'relationship to you')}</div>
    <div class="f-row">${box(`ref${n}Email`, 'email', { type: 'email' })}${box(`ref${n}Phone`, 'phone', { type: 'tel' })}</div>`;
  return `<div class="me-form app-form">
    <h4>You</h4>
    ${box('fullName', 'full name')}
    <div class="f-row">${box('phone', 'phone', { type: 'tel' })}${box('email', 'email', { type: 'email' })}</div>
    ${area('address', 'home address')}
    <div class="f-row">${box('postcode', 'postcode', { more: 'autocapitalize="characters"' })}${box('dob', 'date of birth', { type: 'date' })}</div>
    <h4>Documents</h4>
    ${doc('idDoc', 'photo ID — passport or driving licence')}
    ${formLine_('right to work in the UK', formSelect_('data-app="rightToWork"', '<option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option>'))}
    ${doc('rtwDoc', 'right-to-work document — passport, share code or visa')}
    <h4>What you teach</h4>${rows}
    ${area('qualifications', 'qualifications — degrees, teaching qualifications, anything relevant')}
    ${Array.from({ length: APPLY_QUAL_SLOTS }, (_, i) => doc('qual' + i, i ? 'another qualification certificate (optional)' : 'a qualification certificate')).join('')}
    ${box('rate', 'hourly rate (£)', { type: 'number', more: 'min="1" step="0.5" inputmode="decimal"' })}
    <h4>Checks</h4>
    <div class="f-row">${box('dbsNumber', 'enhanced DBS certificate number')}${box('dbsIssued', 'issued on', { type: 'date' })}</div>
    ${formTick_('data-app="dbsUpdate"', '<span>I consent to you checking it on the DBS Update Service</span>')}
    ${formTick_('data-app="dbsNeeded"', '<span>I need a DBS check</span>')}
    <h4>When and where</h4>
    ${week ? `<div class="app-week">${week}</div>` : area('availability', 'when you can teach')}
    ${box('area', 'area and venues you can reach')}
    ${area('experience', 'experience')}
    <h4>2 references</h4>
    ${ref(1)}
    ${ref(2)}
    ${area('statement', 'a short statement — why you want to teach')}
    ${box('cvLink', 'CV link (optional)', { ph: 'https://…', type: 'url' })}
    ${formTick_('data-app="consent"', '<span>I agree to @family. keeping these details and documents privately to consider my application, contacting my referees and checking my DBS.</span>')}
    <div class="btn-row">${tile_({ form: true, label: 'Send my application', act: 'apply-send' })}</div>
    <p class="note me-said apply-said" aria-live="polite"></p>
  </div>`;
}
/* WHAT IS STILL MISSING, in the backend's words (`postApplyTeach_` asks the same), so the phone says it before anything is sent. */
function applyMissing_(b) {
  const mail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const refOk = n => b['ref' + n + 'Name'] && b['ref' + n + 'Relationship'] && mail(b['ref' + n + 'Email']) && b['ref' + n + 'Phone'];
  return [
    [b.fullName, 'your full name'], [b.phone, 'your phone number'], [mail(b.email), 'your email address'],
    [b.address && /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(b.postcode || ''), 'your home address and postcode'],
    [/^\d{4}-\d\d-\d\d$/.test(b.dob || ''), 'your date of birth'], [b.idDoc, 'a photo of your ID'],
    [b.rtwDoc, 'a photo of your right-to-work document'], [b.subjects, 'the subjects and levels you teach'],
    [b.qualifications && b.qualDocs.length, 'your qualifications, listed and with at least one photo'],
    [b.rightToWork, 'whether you have the right to work in the UK'],
    [b.dbsNeeded || (b.dbsNumber && b.dbsUpdate), 'your enhanced DBS number and the Update Service tick, or "I need one"'],
    [refOk(1) && refOk(2), '2 references, each with a name, relationship, email and phone'],
    [b.availability, 'when you can teach'], [Number(b.rate) > 0, 'your hourly rate'], [b.statement, 'a short statement'],
    [b.consent, 'the consent tick'],
  ].filter(x => !x[0]).map(x => x[1]);
}
/* MAY THIS ACCOUNT FILL THE FORM NOW: an adult with no application waiting. The form is in its card from the start (no sheet, owner 8 Nov). */
function applyFormOpen_() {
  if (!whose_() || whoseAtLeast_('staff') || profileAge_(whose_().profile) === null || !applyAdult_()) return false;
  const st = whose_().application && whose_().application.status;
  return st !== 'new' && st !== 'interview';
}
on('apply-open', () => { const f = document.querySelector('.apply-card .app-form'); if (f) f.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
on('apply-pick', el => { const d = el.closest('.apply-doc'), inp = d && d.querySelector('.apply-in'); if (inp) inp.click(); });
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.apply-in')) return;
  const file = (inp.files || [])[0], slot = inp.closest('.apply-doc');
  inp.value = '';
  if (!file || !slot) return;
  const said = slot.querySelector('.apply-doc-said'), say = m => { if (said) said.textContent = m; };
  if (!/^image\//.test(file.type || '')) { say('That is not a picture. Take a photo of the document.'); return; }
  say('Getting the photo ready…');
  photoShrink_(file).then(data => {
    if (!data || !/^data:image\//.test(data)) { say('The phone could not read that photo. Try another.'); return; }
    APPLY_DOCS[slot.dataset.doc] = data;
    const b = slot.querySelector('[data-do="apply-pick"]');
    if (b) b.textContent = 'Change photo';
    say('Photo ready.');
  }).catch(() => say('The phone could not read that photo. Try another.'));
});
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
    dbsNeeded: v('dbsNeeded'), dbsUpdate: v('dbsUpdate'), rightToWork: v('rightToWork'), experience: v('experience'), availability: hours || v('availability'),
    area: v('area'), fullName: v('fullName'), phone: v('phone'), email: v('email'), address: v('address'), postcode: v('postcode'), dob: v('dob'), rate: v('rate'),
    ref1Name: v('ref1Name'), ref1Relationship: v('ref1Relationship'), ref1Email: v('ref1Email'), ref1Phone: v('ref1Phone'),
    ref2Name: v('ref2Name'), ref2Relationship: v('ref2Relationship'), ref2Email: v('ref2Email'), ref2Phone: v('ref2Phone'),
    idDoc: APPLY_DOCS.idDoc || '', rtwDoc: APPLY_DOCS.rtwDoc || '',
    qualDocs: Array.from({ length: APPLY_QUAL_SLOTS }, (_, i) => APPLY_DOCS['qual' + i]).filter(Boolean),
    statement: v('statement'), cvLink: v('cvLink'), consent: v('consent') };
  const gap = applyMissing_(body);
  if (gap.length) { const said = f.querySelector('.apply-said'); if (said) said.textContent = 'Please add ' + gap.join(', ') + '. Nothing was sent.'; return; }
  send_(body, { button: el, where: f.querySelector('.apply-said'), saying: 'Sending…' })
    .then(d => {
      USER.application = d.application || { status: 'new', at: Date.now() };
      Object.keys(APPLY_DOCS).forEach(k => { delete APPLY_DOCS[k]; });
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
  s.onerror = () => { host.innerHTML = ''; };
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
    /* `send_` HAS ALREADY TOASTED IT — see the note over `sign-digit` in find-account.js. */
    .catch(() => {});
}

/* THE SIGN-IN CARD SPEAKS IN TOASTS, AND IT USED TO SAY EVERYTHING THREE TIMES. § */
/* ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE § */
on('forgot-pin', el => {
  const who = ((($('in-name') || {}).value || '').trim() || (typeof SIGN !== 'undefined' ? SIGN.who : '')).trim();
  if (!who) { toast('Type your email address or your handle first.'); return; }
  send_({ action: 'forgotPin', who }, { button: el, busy: 'Sending\u2026' })
    .then(d => toast((d && d.message)
      || 'If there is an account with that email, a new PIN is on its way.'))
    /* A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that handle" \u2014 and `send_` has already toasted it. § */
    .catch(() => {});
});

/* THE MARK COMES OFF AT THE NEXT KEYSTROKE — a red edge round a box being corrected is the app still
   complaining about what is no longer there. */
document.addEventListener('input', e => {
  const t = e.target;
  if (isSignInBox_(t) && t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
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
  USER = null; LENS = null;   /* and the lens: the next admin opens their own settings */
  try { localStorage.removeItem('familyUser'); } catch (e) { /* storage can be blocked; the app runs without it */ }
  payloadForget_();   /* the device's copy of their payload goes with them (1070) */
  if (typeof offForget_ === 'function') offForget_();   /* and the app's offline copy; the words go with libDiskClear_ */
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
  try { if (typeof window.camStop_ === 'function') window.camStop_(); } catch (e) { oops_(e, 'me:signedOut_') }
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
  /* AND THE PEN — the last person's pad stayed armed under their key (`padWhoChanged_`, find-loupe.js). */
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
  /* THE REPLY, PLUS WHAT WE ALREADY KNEW — see `sign-digit`. The handle when the row has no name. */
  USER = me; LENS = null;
  if (!USER.name) USER.name = me.handle || typed || '';
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) { /* storage can be blocked; the app runs without it */ }
  /* ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED § */
  try { if (over && typeof ansSwitchedIn_ === 'function') ansSwitchedIn_(pid); } catch (e) { oops_(e, 'me:signedIn_') }
  /* THE PEN PUT DOWN FOR THE PERSON WHO IS SIGNED IN NOW. */
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

/* ---------- MAKING AN ACCOUNT § */
/* A PIN IS FOUR DIGITS (owner, 10 Nov). */
const REG_PIN = /^\d{4}$/;
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
const registerSpec_ = () => ({ kind: 'panel', look: 'reg-card', name: 'Make an account', tags: ['Make an account'], body: [{ type: 'embed', tool: 'reg-form' }] });
function registerCard_() { return renderCard(registerSpec_()); }
/* THE FORM IS THE CARD'S ONE EMBED; its send (reg-send) is unchanged. */
function regFormHtml_() {
  return `<div class="reg-form">
    ${/* ONE ROW WITH THE PHONE'S OWN PICKER, starting on Choose: nothing is answered for anybody. */''}
    <div class="reg-who" id="reg-who" data-who="">
      <p class="reg-cap" id="reg-who-cap">Both are free; teaching starts with "Apply to teach" once you are in.</p>
      ${formLine_('who is the account for?', formSelect_('id="reg-who-in" data-do="reg-who" aria-describedby="reg-who-cap"', `
        <option value="" selected disabled>Choose</option>
        <option value="parent" data-who="parent">Client — I book and pay</option>
        <option value="student" data-who="student">Student — I'm learning</option>`))}
    </div>
    <div id="reg-rest" hidden>
      ${/* THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured: § */
            ''}
      ${/* THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap outside, or the page reloaded, and they were gone. § */
            ''}
      <div class="f-row">
        ${formLine_('first name', formInput_(`id="reg-first" autocomplete="off"${draftAttr_('reg', 'first')} value="${esc(draftVal_('reg', 'first'))}"`))}
        ${formLine_('last name', formInput_(`id="reg-last" autocomplete="off"${draftAttr_('reg', 'last')} value="${esc(draftVal_('reg', 'last'))}"`))}
      </div>
      ${formLine_('email', formInput_(`id="reg-email" type="email" inputmode="email" autocomplete="off" autocapitalize="off"
               spellcheck="false" placeholder="you@example.com"${draftAttr_('reg', 'email')} value="${esc(draftVal_('reg', 'email'))}"`))}
      ${formTick_('id="reg-noemail"', "<span>It's a grown-up's email</span>", 'reg-kid', 'hidden')}
      ${formLine_('PIN — 4 digits', formInput_('id="reg-pin" type="password" inputmode="numeric" autocomplete="one-time-code"'))}
      ${tile_({ form: true, label: 'Make my account', act: 'reg-send' })}
      ${/* THREE LINES AT 320, MEASURED: § */
            ''}
      <p class="said" id="reg-note"></p>
    </div></div>`;
}
CARD_EMBEDS['reg-form'] = regFormHtml_;

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
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 digits.'); return; }
  /* THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body` is one of the boxes `send_` knows to lock) and a refusal § */
  const body = { action: 'register', who, first_name: first, last_name: last, pin };
  if (kid) body.parent_email = email; else body.email = email;
  /* A FLYER'S SOURCE TAG (`?from=flyer-…`, flyer.js) goes with it, so `came_from` says which flyer brought them. */
  const from = typeof cameFrom_ === 'function' ? cameFrom_() : ''; if (from) body.from = from;
  send_(body, { button: el, busy: 'Making it…' })
    .then(d => {
      ['first', 'last', 'email'].forEach(f => { try { draftDrop_('reg', f); } catch (e) { oops_(e, 'me:registerCard_') } });
      const pinBox = regIn_(el, 'reg-pin'); if (pinBox) pinBox.value = '';
      /* THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the email — is sign in with it, and they have just typed it once. § */
      const handle = String((d && d.handle) || '');
      const said = kid && handle ? '@' + handle : email, box = $('in-name'); if (box) box.value = said;
      if (typeof signAfterJoin_ === 'function') signAfterJoin_(said);
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
