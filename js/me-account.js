/* @family. — me.js ONE FILE, SPLIT. § */



/* THE SCREENS. One function each, returning markup. § */

/* ---------- YOU § */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */





/* ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT § */
/* THE BUILD CARD IS ITS LINES, so they are no grey clutter (A+): `build-said` keeps them past the rule that hides a card's grey lines. */
function versionSaid_() {
  const f = DATA.fileVersions || {};
  const names = Object.keys(f);
  const newest = names.map(k => f[k]).sort().pop();
  const stale = names.length < 2 ? [] : names.filter(k => f[k] !== newest);
  /* A ONE-OFF JOB THAT FAILED (22 Nov): the setup status's FAILED_ ids and words, here where the admin already looks for "not deployed". */
  const failed = ((DATA.setup && DATA.setup.jobs) || []).filter(j => j && j.error);
  return cardBlocks_([{ type: 'group', tag: 'p', look: 'build-said', text: ['@family. · Merton & Wandsworth', { br: true },
      'site ' + SITE_VERSION + ' · css ' + cssVersion(), { br: true }, 'backend ' + dash_(DATA.version)] },
    stale.length ? { type: 'group', tag: 'p', look: 'build-said is-warn', text: text_('not-deployed') + stale.map(k => k + '.gs (' + f[k] + ')').join(', ')
      + '. Paste ' + (stale.length === 1 ? 'that file' : 'those files') + ' into Apps Script.' } : null,
    failed.length ? { type: 'group', tag: 'p', look: 'build-said is-warn', text: 'Failing: ' + failed.map(j => j.id + ' (' + String(j.error).slice(0, 120) + ')').join('; ')
      + '.' } : null]);
}

/* ---------- APPLY TO TEACH (400): Staff only by application and an admin's yes ----------
   On You, for a signed-in adult who is not staff yet; no date of birth is underage (450), so the card asks for it. */
const APP_SUBJECT_ROWS = 3;
/* WHOLE YEARS FROM A PROFILE'S DATE OF BIRTH (or an `age` field), or null when it says neither. */
function profileAge_(p) {
  const q = p || {};
  const y = Number(q.dob_y), m = Number(q.dob_m) || 1, d = Number(q.dob_d) || 1;
  if (y > 1900 && (typeof dobReal_ !== 'function' || dobReal_(q))) {
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
    return { icon: 'join', label: text_('apply-to-teach'), note: 'add your date of birth first', act: 'apply-open', off: true };
  if (!applyAdult_()) return null;
  const st = whose_().application && whose_().application.status;
  if (st === 'new' || st === 'interview')
    return { icon: 'join', label: text_('application-sent'), note: st === 'interview' ? 'we will arrange a talk' : 'we will be in touch', act: 'apply-open', off: true };
  return { icon: 'join', label: st === 'declined' ? text_('apply-again') : text_('apply-to-teach'), note: st === 'approved' ? 'approved' : '', act: 'apply-open' };
}
/* THE DOCUMENT PHOTOS PICKED SO FAR, as 1200px JPEG data URLs by slot (idDoc, rtwDoc, qual0…): sent with the form, kept nowhere else. */
const APPLY_DOCS = {};
const APPLY_QUAL_SLOTS = 3;
/* WHAT THE FORM HAS ALREADY: name, email, phone and date of birth from the account, so an applicant types them once. */
function applyKnown_() {
  const q = (whose_() && whose_().profile) || {};
  const pad = n => String(n).padStart(2, '0');
  const dob = Number(q.dob_y) > 1900 && (typeof dobReal_ !== 'function' || dobReal_(q)) ? q.dob_y + '-' + pad(Number(q.dob_m) || 1) + '-' + pad(Number(q.dob_d) || 1) : '';
  return { fullName: [q.first_name, q.last_name].filter(Boolean).join(' '), email: q.email || '', phone: q.phone || '', dob };
}
function applyFormHtml_() { return cardBlock_(applyFormSpec_()); }
/* THE FORM IS forms.json's `apply-teach` (foundation 2): every box a draft until it is sent; the account's own details filled in. */
function applyFormSpec_() {
  return { type: 'group', look: 'me-form app-form', inner: formOf_('apply-teach', applyKnown_(), { docs: APPLY_DOCS, draftId: String((whose_() && whose_().personId) || '') })
    + cardBlock_({ type: 'group', look: 'btn-row', tiles: [{ form: true, label: text_('send-my-application'), act: 'apply-send' }] })
    + cardBlock_({ type: 'status', saved: true, look: 'apply-said', live: true }) };
}
/* WHAT IS STILL MISSING, in the backend's words (`postApplyTeach_` asks the same), so the phone says it before anything is sent. */
const applyMissing_ = b => formGaps_(FORM_SPECS.forms['apply-teach'].gaps, b);
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
  const said = slot.querySelector('.apply-doc-said'), say = m => { if (said) tell_(said, 'info', m); };
  if (!/^image\//.test(file.type || '')) { say(text_('that-is-not-a-picture-take')); return; }
  say(text_('getting-the-photo-ready'));
  photoShrink_(file).then(data => {
    if (!data || !/^data:image\//.test(data)) { say(text_('the-phone-could-not-read-that')); return; }
    APPLY_DOCS[slot.dataset.doc] = data;
    const b = slot.querySelector('[data-do="apply-pick"]');
    if (b) b.textContent = text_('change-photo');
    say(text_('photo-ready'));
  }).catch(() => say(text_('the-phone-could-not-read-that')));
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
  if (gap.length) { const said = f.querySelector('.apply-said'); if (said) tell_(said, 'error', text_('please-add') + gap.join(', ') + '. Nothing was sent.'); return; }
  send_(body, { button: el, where: f.querySelector('.apply-said'), saying: 'Sending…' })
    .then(d => {
      USER.application = d.application || { status: 'new', at: Date.now() };
      Object.keys(APPLY_DOCS).forEach(k => { delete APPLY_DOCS[k]; });
      formDraftDrop_('apply-teach', { draftId: String((whose_() && whose_().personId) || '') });
      saveUser_();
      toast(text_('application-sent'));
      try { paint('stuff'); } catch (e) { oops_(e, 'me:applyFormHtml_') }   /* Apply to teach is a Find › Settings › Staff card */
    })
    .catch(() => {});
});

/* THE YOU SCREEN IS ONE PAGE. § */

/* THE MARK BETWEEN THE TWO HALVES of the You screen. A comment in the markup: it survives being
   built into a string, it cannot be mistaken for content, and it renders as nothing if it ever
   escapes. */


/* ---------- NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT § */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); });

/* SIGNING IN WITH GOOGLE WENT (owner, 16 Nov): one way in, a username or email and the PIN. */

/* THE SIGN-IN CARD SPEAKS IN TOASTS, AND IT USED TO SAY EVERYTHING THREE TIMES. § */
/* ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE § */
on('forgot-pin', el => {
  const who = ((($('in-name') || {}).value || '').trim() || (typeof SIGN !== 'undefined' ? SIGN.who : '')).trim();
  if (!who) { toast(text_('type-your-email-address-or-your')); return; }
  send_({ action: 'forgotPin', who }, { button: el, busy: 'Sending\u2026' })
    .then(d => toast((d && d.message)
      || text_('if-there-is-an-account-with')))
    /* A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that handle" \u2014 and `send_` has already toasted it. § */
    .catch(() => {});
});

/* THE MARK COMES OFF AT THE NEXT KEYSTROKE — a red edge round a box being corrected is the app still
   complaining about what is no longer there. */
document.addEventListener('input', e => {
  const t = e.target;
  if (isSignInBox_(t) && t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
});

function signOut_() {
  /* ---------- SIGNING OUT ENDS THE SESSION ON THE SERVER TOO § */
  const tok = USER && USER.token;
  let last = Promise.resolve();
  try { if (typeof answersPush_ === 'function') last = answersPush_(true); } catch (err) { oops_(err, 'me:googleSignedIn_') }
  /* AND THE PRESSES, WHICH SINCE 9 OCT ARE HOW A TYPED ANSWER REACHES THE ACCOUNT AT ALL — the one in flight and every one queued behind it, on this token, before § */
  let subs = Promise.resolve();
  try {
    if (typeof subDrain_ === 'function') subs = subDrain_(USER && USER.personId, tok, typeof answersCan_ === 'function' && answersCan_('submitAnswer'));
  } catch (err) { /* nothing to send: the waiting answers stay on the device for next time */ }
  Promise.all([Promise.resolve(last).catch(() => {}), Promise.resolve(subs).catch(() => {})]).then(() => { try { if (tok) api({ action: 'signOut', token: tok }); } catch (err) { /* sign out goes on even if the server call cannot be made */ } });
  signedOut_();
  toast(text_('signed-out'));
}
on('signout', () => signOut_());

/* ONE WAY IN AND ONE WAY OUT. § */
function signedOut_(opts) {
  opts = opts || {};
  /* WHO IS LEAVING, AND WHETHER THEY WERE AN ADMIN — read before they are forgotten, for `ended` below. */
  const was = USER;
  let wasAdmin = false;
  try { wasAdmin = (typeof may_ === 'function' && may_('admin')) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) { oops_(e, 'me:signedOut_') }
  USER = null; LENS = null;   /* and the lens: the next admin opens their own settings */
  if (typeof SIGN !== 'undefined' && !opts.quiet) { SIGN.who = ''; SIGN.dots = 0; SIGN.pin = []; SIGN.wrong = false; SIGN.known = null; SIGN.card = ''; }
  /* EVERY KEY THE KEEPER MARKS clearOnSignOut (`KEEP`, data.js): the sign-in, the stars, the kept payload, the card being edited. */
  keep_.signOut();
  payloadForget_();   /* the device's copy of their payload goes with them (1070) */
  if (typeof window.offForget_ === 'function') window.offForget_();   /* and the app's offline copy; the words go with libDiskClear_ */
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
  /* THE STARS — the device's copy is a cache of the person, and the next person is not them. */
  FAVS = new Set();
  /* WHAT THE LAST PERSON SENT, AS THIS DEVICE HELD IT FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN. § */
  try { if (typeof subForget_ === 'function') subForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
  try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE CAMERA, which is kept parked while the app is open (427) — the next person's phone light is not this one's. */
  try { if (typeof window.camStop_ === 'function') window.camStop_(); } catch (e) { oops_(e, 'me:signedOut_') }
  /* AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`). § */
  try { if (typeof KP_UNDO !== 'undefined') KP_UNDO.clear(); } catch (e) { oops_(e, 'me:signedOut_') }
  try { if (typeof closeStep_ === 'function') closeStep_(); } catch (e) { oops_(e, 'me:signedOut_') }
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
  saveUser_();
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
  /* NO "SIGNED IN AS" (owner, 15 Nov): the name tag first in Find says whose account it is. */
  repaint();
  Object.keys(backAt).forEach(id => { if (backAt[id] > 0) { try { goPage(id, backAt[id], true); } catch (e) { oops_(e, 'me:signedIn_') } } });
  load();
  /* AND WHAT IS OWED ONCE IN — a sentence about held children, a move link waiting. */
  afterSignIn_(d);
}

/* NOTHING ABOUT WHO SIGNED IN IS KEPT ON THE DEVICE — the owner did not want recent usernames offered (docs/history/383). Old keys are wiped. */
function signInForgetOld_() {
  keep_.del('familyHandles'); keep_.del('familyAdminHint');
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
  parent: text_('we-email-you-a-link-to')
        + 'and tap Add as my child.',
  student: text_('we-email-a-link-to-open')
         + 'can also make your account, on Students.',
};
/* MAKE AN ACCOUNT, OUTSIDE FIND (the Account column and Settings' door, signed out): one tile that starts Find's own asking of it. */
const registerSpec_ = () => ({ kind: 'panel', look: 'reg-card', name: text_('make-an-account'), tags: [text_('make-an-account')],
  tiles: [{ icon: 'plus', label: text_('make-an-account'), act: 'sign-join' }] });
function registerCard_() { return renderCard(registerSpec_()); }

/* ---------- FIND'S PIN STEP OPENS Forgot PIN (owner, 15 Nov). */
/* FORGOT PIN: one button, the reset link to the address on that account (`forgotPin`, the existing door). */
const signForgotSpec_ = () => ({ kind: 'panel', look: 'reg-card sign-forgot', name: 'Forgot PIN', tags: [{ text: 'Forgot PIN' }],
  body: [{ type: 'text', look: 'note', text: 'We email a link to reset your PIN to the address on this account.' }],
  tiles: [{ icon: 'send', label: 'Email me the link', act: 'forgot-pin' }] });
/* MAKE AN ACCOUNT IS kinds.json's person form `sign-join`, asked in Find a field a step (askMenu_, form.js); what was typed as the name fills the email or the first name. */
const signJoinStart_ = who => askReset_('sign-join', String(who || '').indexOf('@') > 0 ? { email: who } : who ? { first: String(who).replace(/^@+/, '') } : {});
/* ITS SEND IS THE EXISTING `register`. A student giving a grown-up's email sends it as `parent_email`; the PIN goes with the call and nowhere else. */
FORM_SEND_['sign-join'] = (v, el) => {
  const who = v.who, first = String(v.first || '').trim(), last = String(v.last || '').trim(), email = String(v.email || '').trim(), pin = String(v.pin || '');
  const kid = who === 'student' && v.kid === 'grown-up';
  if (who !== 'parent' && who !== 'student') { toast(text_('say-who-the-account-is-for')); return askBack_('sign-join', 'who'); }
  if (!first || !last) { toast(text_('your-first-and-last-name-please')); return askBack_('sign-join', first ? 'last' : 'first'); }
  if (!FORM_TESTS.email(email)) {
    toast(kid ? 'A grown-up\'s email address, please — the link goes to them.' : text_('an-email-address-please-the-link'));
    return askBack_('sign-join', 'email');
  }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 digits.'); return askBack_('sign-join', 'pin'); }
  const body = { action: 'register', who, first_name: first, last_name: last, pin };
  if (kid) body.parent_email = email; else body.email = email;
  /* A FLYER'S SOURCE TAG (`?from=flyer-…`) goes with it, so `came_from` says which flyer brought them. */
  const from = cameFrom_(); if (from) body.from = from;
  send_(body, { button: el, busy: text_('making-it') })
    .then(d => {
      /* THE PIN IS DROPPED THE MOMENT IT IS SENT; the name it signs in with goes on to Find's PIN step. */
      askDone_('sign-join');
      const handle = String((d && d.handle) || '');
      const said = kid && handle ? '@' + handle : email, box = $('in-name'); if (box) box.value = said;
      signAfterJoin_(said);
      toast(kid ? text_('account-made-sign-in-now-as') + (handle ? '@' + handle : 'your handle')
                  + ' with your PIN. Your grown-up has been sent a link to confirm.'
                : who === 'parent'
                  ? text_('account-made-sign-in-now-with-2')
                    + 'your child\'s account.'
                  : text_('account-made-sign-in-now-with'));
    })
    .catch(() => {});      // `send_` has already said why
};
/* ---------- WHERE THEY CAME FROM (moved from flyer.js when the flyer maker went to attic/, 16 Nov): a `?from=…` tag kept on this phone until sign-up sends it (`register`, `came_from`) ---------- */
const CAME_FROM_KEY = 'came_from';
function cameFromSave_() {
  try {
    const f = String(new URLSearchParams(location.search).get('from') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (f) keep_.put(CAME_FROM_KEY, f);
  } catch (e) { /* no storage: the sign-up is simply not traced */ }
}
const cameFrom_ = () => keep_.get(CAME_FROM_KEY) || '';
cameFromSave_();
