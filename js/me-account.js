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
  const f = DATA.fileVersions || {};
  const names = Object.keys(f);
  const newest = names.map(k => f[k]).sort().pop();
  const stale = names.length < 2 ? [] : names.filter(k => f[k] !== newest);
  return cardBlocks_([{ type: 'group', tag: 'p', look: 'build-said', text: ['@family. · Merton & Wandsworth', { br: true },
      'site ' + SITE_VERSION + ' · css ' + cssVersion(), { br: true }, 'backend ' + dash_(DATA.version)] },
    stale.length ? { type: 'group', tag: 'p', look: 'build-said is-warn', text: text_('not-deployed') + stale.map(k => k + '.gs (' + f[k] + ')').join(', ')
      + '. Paste ' + (stale.length === 1 ? 'that file' : 'those files') + ' into Apps Script.' } : null]);
}

/* ---------- APPLY TO TEACH (400): Staff only by application and an admin's yes ----------
   On You, for a signed-in adult who is not staff yet; no date of birth is underage (450), so the card asks for it. */
const APP_SUBJECT_ROWS = 3;
const APP_STATUS_LINE = {
  new: text_('your-application-to-teach-is-with'),
  interview: text_('we-would-like-to-talk-to'),
  approved: text_('your-application-to-teach-was-approved'),
  declined: text_('your-application-to-teach-was-not'),
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
  const dob = Number(q.dob_y) > 1900 ? q.dob_y + '-' + pad(Number(q.dob_m) || 1) + '-' + pad(Number(q.dob_d) || 1) : '';
  return { fullName: [q.first_name, q.last_name].filter(Boolean).join(' '), email: q.email || '', phone: q.phone || '', dob };
}
function applyFormHtml_() { return cardBlock_(applyFormSpec_()); }
/* THE FORM IS forms.json's `apply-teach` (foundation 2): every box a draft until it is sent; the account's own details filled in. */
function applyFormSpec_() {
  return { type: 'group', look: 'me-form app-form', inner: formOf_('apply-teach', applyKnown_(), { docs: APPLY_DOCS, draftId: String((whose_() && whose_().personId) || '') })
    + cardBlock_({ type: 'group', look: 'btn-row', tiles: [{ form: true, label: text_('send-my-application'), act: 'apply-send' }] })
    + cardBlock_({ type: 'group', tag: 'p', look: 'note me-said apply-said', attrs: { 'aria-live': 'polite' } }) };
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
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) { /* storage can be blocked; the app runs without it */ }
      toast(text_('application-sent'));
      try { paint('stuff'); } catch (e) { oops_(e, 'me:applyFormHtml_') }   /* Apply to teach is a Find › Settings › Staff card */
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
  toast(text_('signed-out'));
});

/* ONE WAY IN AND ONE WAY OUT. § */
function signedOut_(opts) {
  opts = opts || {};
  /* WHO IS LEAVING, AND WHETHER THEY WERE AN ADMIN — read before they are forgotten, for `ended` below. */
  const was = USER;
  let wasAdmin = false;
  try { wasAdmin = (typeof may_ === 'function' && may_('admin')) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) { oops_(e, 'me:signedOut_') }
  USER = null; LENS = null;   /* and the lens: the next admin opens their own settings */
  if (typeof SIGN !== 'undefined' && !opts.quiet) { SIGN.who = ''; SIGN.dots = 0; SIGN.pin = []; SIGN.wrong = false; SIGN.known = null; SIGN.card = ''; }
  try { localStorage.removeItem('familyUser'); } catch (e) { /* storage can be blocked; the app runs without it */ }
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
  /* NO "SIGNED IN AS" (owner, 15 Nov): the name tag first in Find says whose account it is. */
  repaint();
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
  parent: text_('we-email-you-a-link-to')
        + 'and tap Add as my child.',
  student: text_('we-email-a-link-to-open')
         + 'can also make your account, on Students.',
};
/* MAKE AN ACCOUNT IS A CARD OF ITS OWN beside Sign in, its form there from the start (no sheet, owner 7 Nov). */
const registerSpec_ = () => ({ kind: 'panel', look: 'reg-card', name: text_('make-an-account'), tags: [text_('make-an-account')], body: [{ type: 'embed', tool: 'reg-form' }] });
function registerCard_() { return renderCard(registerSpec_()); }
/* THE FORM IS THE CARD'S ONE EMBED; its send (reg-send) is unchanged. */
/* THE FORM AS ONE SPEC (owner, 14 Nov: one card maker). ONE ROW WITH THE PHONE'S OWN PICKER, starting on Choose: nothing is answered for anybody. */
/* THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured: § */
/* THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap outside, or the page reloaded, and they were gone. § */
/* THREE LINES AT 320, MEASURED: § */
function regFormHtml_() {
  const kept = (id, more) => ({ type: 'control', attrs: Object.assign({ id: 'reg-' + id, autocomplete: 'off' }, more || {},
    meAttrs_(draftAttr_('reg', id)), { value: draftVal_('reg', id) }) });
  const field = (cap, control) => ({ type: 'field', cap, blocks: [control] });
  return cardBlock_({ type: 'group', look: 'reg-form', blocks: [
    { type: 'group', look: 'reg-who', id: 'reg-who', attrs: { 'data-who': '' }, blocks: [
      { type: 'group', tag: 'p', look: 'reg-cap', id: 'reg-who-cap', text: 'Both are free; teaching starts with "Apply to teach" once you are in.' },
      field('who is the account for?', { type: 'control', tag: 'select', attrs: { id: 'reg-who-in', 'data-do': 'reg-who', 'aria-describedby': 'reg-who-cap' }, options: [
        { value: '', text: 'Choose', on: true, off: true },
        { value: 'parent', text: text_('client-i-book-and-pay'), data: { who: 'parent' } },
        { value: 'student', text: text_('student-im-learning'), data: { who: 'student' } }] })] },
    { type: 'group', look: null, id: 'reg-rest', attrs: { hidden: true }, blocks: [
      { type: 'group', look: 'f-row', blocks: [field('first name', kept('first')), field('last name', kept('last'))] },
      field('email', kept('email', { type: 'email', inputmode: 'email', autocapitalize: 'off', spellcheck: 'false', placeholder: 'you@example.com' })),
      { type: 'tick', look: 'reg-kid', labelAttrs: { hidden: true }, attrs: { id: 'reg-noemail' }, text: text_('its-a-grown-ups-email') },
      field('PIN — 4 digits', { type: 'control', attrs: { id: 'reg-pin', type: 'password', inputmode: 'numeric', autocomplete: 'one-time-code' } })],
      /* the send stands loose in the form, the note under it, as before */
      inner: tile_({ form: true, label: text_('make-my-account'), act: 'reg-send' }) + cardBlock_({ type: 'group', tag: 'p', look: 'said', id: 'reg-note' }) }] });
}
CARD_EMBEDS['reg-form'] = regFormHtml_;

/* ---------- FIND'S PIN STEP OPENS ONE CARD EACH (owner, 15 Nov): Forgot PIN, and Make an account when the name is no account. */
/* FORGOT PIN: one button, the reset link to the address on that account (`forgotPin`, the existing door). */
const signForgotSpec_ = () => ({ kind: 'panel', look: 'reg-card sign-forgot', name: 'Forgot PIN', tags: [{ text: 'Forgot PIN' }],
  body: [{ type: 'text', look: 'note', text: 'We email a link to reset your PIN to the address on this account.' }],
  tiles: [{ icon: 'send', label: 'Email me the link', act: 'forgot-pin' }] });
/* MAKE AN ACCOUNT: forms.json's `sign-join`, drawn by formOf_; its send is the existing `register`. What was typed fills the email or the first name. */
const SIGN_JOIN_WHO_ = [{ v: 'parent', t: text_('client-i-book-and-pay') }, { v: 'student', t: text_('student-im-learning') }];
const signJoinSpec_ = () => ({ kind: 'panel', look: 'reg-card sign-join', name: text_('make-an-account'), tags: [{ text: text_('make-an-account') }],
  body: [{ type: 'embed', tool: 'sign-join-form' }], tiles: [{ icon: 'plus', label: text_('make-my-account'), act: 'sign-join-send' }] });
CARD_EMBEDS['sign-join-form'] = () => {
  const who = typeof SIGN !== 'undefined' ? SIGN.who : '';
  const pre = who.indexOf('@') > 0 ? { email: who } : { first: who.replace(/^@+/, '') };
  return cardBlock_({ type: 'group', look: 'reg-form sign-join-form', inner: formOf_('sign-join', pre, { options: f => (f === 'who' ? SIGN_JOIN_WHO_ : null) }) });
};
on('sign-join-send', el => {
  const card = (el && el.closest && el.closest('.card')) || document;
  const v = f => String((card.querySelector('[data-sj="' + f + '"]') || {}).value || '').trim();
  const who = v('who'), first = v('first'), last = v('last'), email = v('email'), pin = v('pin');
  if (who !== 'parent' && who !== 'student') { toast(text_('say-who-the-account-is-for')); return; }
  if (!first || !last) { toast(text_('your-first-and-last-name-please')); return; }
  if (email.indexOf('@') < 0) { toast(text_('an-email-address-please-the-link')); return; }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 digits.'); return; }
  const body = { action: 'register', who, first_name: first, last_name: last, pin, email };
  const from = typeof cameFrom_ === 'function' ? cameFrom_() : ''; if (from) body.from = from;
  send_(body, { button: el, busy: text_('making-it') })
    .then(() => {
      const box = card.querySelector('[data-sj="pin"]'); if (box) box.value = '';
      if (typeof signAfterJoin_ === 'function') signAfterJoin_(email);
      toast(text_('account-made-sign-in-now-with'));
    })
    .catch(() => {});      // `send_` has already said why
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
  const note = regIn_(el, 'reg-note'); if (note) tell_(note, 'info', REG_NOTE[who]);
});

on('reg-send', el => {
  const v = id => (((regIn_(el, id) || {}).value) || '').trim();
  const first = v('reg-first'), last = v('reg-last'), email = v('reg-email'), pin = v('reg-pin');
  const who = regWho_(el);
  /* A STUDENT'S TICK ONLY. The row is hidden for a parent and unticked when it hides, and this asks
     again rather than trusting that — a parent's address sent as `parent_email` is refused anyway. */
  const kid = who === 'student' && !!(regIn_(el, 'reg-noemail') || {}).checked;
  /* UNREACHABLE FROM THE CARD — the button is under the question until it is answered — and said anyway, for a button pressed some other way: § */
  if (!who) { toast(text_('say-who-the-account-is-for')); return; }
  if (!first || !last) { toast(text_('your-first-and-last-name-please')); return; }
  if (email.indexOf('@') < 0) {
    toast(kid ? 'A grown-up\'s email address, please — the link goes to them.'
              : text_('an-email-address-please-the-link'));
    return;
  }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 digits.'); return; }
  /* THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body` is one of the boxes `send_` knows to lock) and a refusal § */
  const body = { action: 'register', who, first_name: first, last_name: last, pin };
  if (kid) body.parent_email = email; else body.email = email;
  /* A FLYER'S SOURCE TAG (`?from=flyer-…`, flyer.js) goes with it, so `came_from` says which flyer brought them. */
  const from = typeof cameFrom_ === 'function' ? cameFrom_() : ''; if (from) body.from = from;
  send_(body, { button: el, busy: text_('making-it') })
    .then(d => {
      ['first', 'last', 'email'].forEach(f => { try { draftDrop_('reg', f); } catch (e) { oops_(e, 'me:registerCard_') } });
      const pinBox = regIn_(el, 'reg-pin'); if (pinBox) pinBox.value = '';
      /* THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the email — is sign in with it, and they have just typed it once. § */
      const handle = String((d && d.handle) || '');
      const said = kid && handle ? '@' + handle : email, box = $('in-name'); if (box) box.value = said;
      if (typeof signAfterJoin_ === 'function') signAfterJoin_(said);
      /* NO WAITING ON THE LINK — see the note over `verifyLogin`'s old PENDING refusal in dopost.gs.
         The account works now; the link is said as what it is, a confirmation, not a door. */
      toast(kid ? text_('account-made-sign-in-now-as') + (handle ? '@' + handle : 'your handle')
                  + ' with your PIN. Your grown-up has been sent a link to confirm.'
                : who === 'parent'
                  ? text_('account-made-sign-in-now-with-2')
                    + 'your child\'s account.'
                  : text_('account-made-sign-in-now-with'));
    })
    .catch(() => {});      // `send_` has already said why
});
