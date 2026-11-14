
/* THE SIGN-IN SLIP — the same paper wherever a handle and a PIN are handed to somebody: here, and in
   the New PIN sheet. Paper, so `--paper` and `--paper-ink`, never a literal. */
function pinSlip_(first, handle, pin) {
  return cardBlock_({ type: 'section', look: 'pin-slip', live: true, blocks: [
    { type: 'text', look: 'pin-slip-k', text: (first || 'They') + ' signs in with' }, { type: 'text', look: 'pin-slip-v', text: '@' + handle },
    { type: 'text', look: 'pin-slip-k', text: 'and the PIN' }, { type: 'text', look: 'pin-slip-v', text: String(pin) }] });
}
/* A SETTINGS CARD AS A SPEC (owner, 13 Nov: one template): its name the one tag, its look its old class, its body blocks. */
const rolesSet_ = (look, name, body, more) => renderCard(Object.assign({ kind: 'setting', look: look || '', name: name || '', tags: name ? [name] : [], body: body || [] }, more || {}));
/* MARKUP ANOTHER MAKER DREW (a hub, a form, the build line), carried as the one embed. */
const rolesDrawn_ = (draw, look) => ({ type: 'embed', tool: 'me-form', look: look || '', args: { draw } });

/* ---------- AN ADDRESS NOBODY HAS PROVED: THE MAIL IT IS NOT SENT, AND THE CHILD IT CANNOT HOLD YET § */
function pendingAddr_() { return (whose_() && whose_().pendingEmail) ? String(whose_().pendingEmail) : ''; }

/* A TILE, because the link is a thing about your account, not a field on a form (CLAUDE.md). The same
   tile in both places, so a fix to its words is one fix. `send` is the mark that means the act. */
const RESEND_LINK = { icon: 'send', label: 'Send the link again', note: 'to confirm your email', act: 'resend-link' };

/* ONE PARAGRAPH UNDER THE ROW — the house rule for a warning a tile has no room for. The address is in
   it: when it is a typo, the address is the whole of what is wrong, and the only place it shows. */
function mailHeldNote_() {
  const at = pendingAddr_();
  /* `overflow-wrap:anywhere` ON THE ADDRESS: it is one word with no space in it, and a long one at 320
     took the card sideways — the fault the dotted answer line paid for (check/states.js). */
  return at ? cardBlock_({ type: 'text', look: 'said mail-held wrap-any', text: ['We will email you once you open the link we sent to ', { b: at }, '.'] }) : '';
}

/* ---------- A NEW ADDRESS WAITING TO BE PROVED, ON THE CARD IT WAS TYPED ON § */
function movingNote_(p) {
  const to = p && p.email_moving ? String(p.email_moving) : '';
  if (!to) return '';
  const was = String((p && p.email) || '');
  return cardBlock_({ type: 'text', look: 'said mail-moving wrap-any', text: ['Your email changes to ', { b: to },
    ' once you open the link we sent there, on a phone where you are signed in.'].concat(was ? [' Until then it is still ', { b: was },
    ' — sign in with that, or your handle. Type it back here to keep it.'] : []) });
}

/* WHERE THE TWO FORMS WOULD BE, for a parent whose address is still PENDING. § */
function kidHeldSec_() {
  return { type: 'section', look: 'kid-sec kid-held', head: 'Add your child', headLook: 'kid-h', blocks: [
    { type: 'text', look: 'note wrap-any', text: ['Open the link we emailed to ', { b: pendingAddr_() }, ' first, then you can add your child.'] },
    { type: 'tiles', tiles: [RESEND_LINK] }] };
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
    return { type: 'section', look: 'kid-sec kid-list', blocks: [typeof awaiting_ === 'function' && awaiting_() ? { type: 'wait', on: true }
      : { type: 'text', look: 'empty', text: 'No child linked yet.' }] };
  }
  return { type: 'section', look: 'kid-sec kid-list', blocks: kids.map(f => {
    /* THEIR FIRST NAME, as the server calls a child (docs/history/333), without the `(@handle)` it adds
       when two children share one — the handle is printed beside it. */
    const first = String(nameBesideHandle_(f.title, f.handle) || f.title).trim();
    return { type: 'who', look: 'kid-item', whoLook: 'kid-who', name: first, handle: f.handle || '',
      face: { who: { pic: f.image, avatar: f.avatar, handle: f.handle, name: first, personId: f.personId }, o: { cls: 'kid-face', none: 'prof-none', size: 36 } },
      tiles: held ? [] : [{ icon: 'key', label: 'New PIN', note: 'to sign in with', act: 'kid-pin', data: { id: f.personId, name: first.split(' ')[0] } }] };
  }) };
}
function childManageCard_() {
  const held = !!pendingAddr_();
  return rolesSet_('kid-card kid-manage', 'Manage your child', [kidListSec_(held), held ? kidHeldSec_() : rolesDrawn_(kidAddSec_)]);
}

/* A REFUSAL THAT SAYS THE ADDRESS IS WAITING corrects the phone: § */
function heldBy_(err) {
  const d = err && err.reply;
  if (!USER || !d || d.why !== 'unconfirmed' || !d.pendingEmail) return;
  USER.pendingEmail = String(d.pendingEmail);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
  try { repaint(true); } catch (e) { oops_(e, 'me:heldBy_') }
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
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
        try { repaint(true); } catch (e) { oops_(e, 'me:heldBy_') }
      }
    })
    .catch(() => {});      // `send_` has already said why
});

/* ---------- A NEW PIN FOR YOUR CHILD, OR FOR ANYBODY IF YOU ARE AN ADMIN § */
/* NO SHEET (owner, 8 Nov): the ask opens under the row pressed, and the new PIN replaces it there. */
on('kid-pin', el => {
  const id = el.getAttribute('data-id') || '', who = el.getAttribute('data-name') || 'them';
  if (!id) { toast('That account has no id yet — ask us.'); return; }
  const row = el.closest('.tile-row') || el;
  document.querySelectorAll('.kid-pin-ask').forEach(x => x.remove());
  row.insertAdjacentHTML('afterend', cardBlock_({ type: 'section', look: 'kid-pin-ask', blocks: [
    { type: 'text', look: 'note', text: 'A new PIN for ' + who + ': their old PIN stops working, and they are signed out everywhere. You will see the new one once, to give them.' },
    { type: 'tiles', tiles: [{ form: true, label: 'Make a new PIN', act: 'kid-pin-go', data: { id: id, name: who } }] }] }));
});

on('kid-pin-go', el => {
  if (!USER) { toast('Sign in first'); return; }
  const id = el.getAttribute('data-id') || '';
  send_({ action: 'resetPin', personId: USER.personId || '', targetId: id },
        { button: el, busy: 'Making it…' })
    .then(d => {
      const body = el.closest('.kid-pin-ask');
      if (body) body.innerHTML = pinSlip_(d.first || el.getAttribute('data-name'), d.handle, d.pin)
        + cardBlock_({ type: 'text', look: 'note', text: 'Write it down or read it to them — it is not shown again. They can change it under Kids settings once they are in.' });
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
  const role = roleOf((whose_() && whose_().role) || '');
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

/* ---------- READING ALOUD (453, 463) — no choice: the device's calmest natural voice, free; a sample is all there is to do ---------- */
function voiceCard_() {
  if (!canSay_()) return '';
  return rolesSet_('voice-card', 'Reading aloud', [{ type: 'tiles', tiles: [{ icon: 'speak', label: 'Hear a sample', note: 'the reading voice', act: 'voice-try' }] }]);
}
const VOICE_SAMPLE = 'Hello. This is how your questions will be read. For example: x² ÷ 4 is less than 3/4.';
on('voice-try', () => { hush_(); say_(VOICE_SAMPLE); });

/* A COLUMN ABOVE YOUR RANK, OR EMPTY: one line and the next step. Never the column's name (710, 770: "columns don't need names or a widget for the name"). */
/* `look` names it for the doors that skip it (`settingNone_`); `tiles` its next step. */
/* ITS ONE TAG SAYS THE STATE, never the column's name: the template's name is a tag (rules.md 3). */
const rankOffCard_ = (title, say, tiles, look) => renderCard({ kind: 'rank', look: look || 'rank-off', tags: [{ text: /people-none/.test(look || '') ? 'Nobody yet' : /^Sign in/.test(say || '') ? 'Signed out' : 'Nothing yet', colour: 0 }], body: say ? [{ type: 'text', text: say, look: 'note' }] : [], tiles: tiles || [] });
/* A SETTINGS COLUMN FOR A ROLE YOU DO NOT HOLD (464): a padlock and one short line, and nothing else — the owner, "it will just show a padlock". */
const padlockCard_ = say => renderCard({ kind: 'rank', look: 'rank-off col-lock', tags: [{ text: 'Locked', colour: 0 }], body: say ? [{ type: 'text', text: say, look: 'note' }] : [] });
const signedOutCard_ = title => rankOffCard_(title, 'Sign in on ' + tabLabel_('account', 'Kids settings') + ' first.');

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
    .replace(/^(\s*<div\b[^>]*>)/, (m, open) => open + cardLockMark_())
    .replace(/<(input|select|textarea|button)\b(?![^>]*\sdisabled\b)/g, '<$1 disabled')
    .replace(/<a\b([^>]*)\shref="[^"]*"/g, '<a$1 aria-disabled="true"')
    /* NO ID OF ITS OWN — a shut copy must never be the box a real card's code finds (`pin-now`). */
    .replace(/(<[a-z]+\b[^>]*?)\sid="/g, '$1 data-lock-id="');
}
/* YOUR CARD'S PLACE ON A LOCKED COLUMN: its title only — a placeholder has no card to draw. */
const lockedOwnCards_ = col => (OWN_SEC_OF_SET_[col] || []).map(k => rolesSet_('own-lock', OWN_SEC_TITLE_[k] || k, [], { data: { 'lay-card': 'own:' + col + ':' + k } }));
/* EACH SETTINGS COLUMN'S CARDS FOR ITS ROLE, built the same way as for a holder (`staffPages_`, `familyPages_`, `youSettingsPages_`). */
const LOCKED_DRAW_ = {
  staff: () => lockedOwnCards_('staff').concat([rolesSet_('staff-top', 'Staff hub', [rolesDrawn_(() => (typeof window.hubBlock_ === 'function' ? window.hubBlock_() : ''))])]).concat(settingsCards_(settingsSplit_().staff, '', 'staff')),
  family: () => lockedOwnCards_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family')),
  account: () => lockedOwnCards_('account').concat(youSettingsPages_()),
};
const lockedPages_ = col => lockedAs_(col, LOCKED_DRAW_[col]);

/* ---------- PARENT SETTINGS: A PARENT'S OR PAYER'S OWN DETAILS (453) — the children are on Students ---------- */
function familyPages_() {
  const title = tabLabel_('family', 'Parent settings');
  if (!whose_()) return [signedOutCard_(title)].concat(lockedPages_('family'));
  if (!whoseAtLeast_('client')) return [padlockCard_('Parent settings are for parents.')].concat(lockedPages_('family'));
  const out = ownCardSetPage_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family'));
  /* NOTHING A PARENT'S ALONE (469): your picture, name and contact are everybody's, so on Student settings. */
  return out.length ? out : [rankOffCard_(title, NOTHING_YET + ' Your details are on ' + tabLabel_('account', 'Kids settings') + '.', null, 'set-none')];
}
screen('family', () => pages('family', typeof cardsOf_ === 'function' ? cardsOf_('family') : familyPages_()));

/* APPLY TO TEACH IS A CARD OF ITS OWN, not a line on the padlock: Find › Settings skips a padlock, and the owner onboards through Find (1150). */
function applyCard_() {
  const open = typeof applyFormOpen_ === 'function' && applyFormOpen_();
  const body = open ? applyFormHtml_() : typeof applyOpts_ === 'function' && applyOpts_() ? tileRow_(tile_(applyOpts_()), 'apply-tiles') : '';
  const h = body ? rolesSet_('apply-card', 'Apply to teach', [{ type: 'text', look: 'note', text: 'Teach with us: tell us what you teach, and we will be in touch.' }, rolesDrawn_(() => body)], { data: { yours: '1' } }) : '';
  /* AN APPLICATION IS THE ASKER'S OWN (`applyTeach`), so in the lens it is shown shut. */
  return h ? [lensOn_() ? lockCard_(h) : h] : [];
}
/* ---------- TUTOR SETTINGS: THE STAFF HUB AND THE TEACHING SETTINGS WITH NO CARD TO LIVE ON (453) ---------- */
function staffPages_() {
  const title = tabLabel_('staff', 'Tutor settings');
  if (!whose_()) return [signedOutCard_(title)].concat(lockedPages_('staff'));
  /* THE PADLOCK, with Apply to teach for an adult who may apply (`applyOpts_`), then every card shut (467). */
  if (!whoseAtLeast_('staff')) return [padlockCard_('Tutor settings are for tutors.')].concat(applyCard_(), lockedPages_('staff'));
  const hub = typeof window.hubBlock_ === 'function' ? window.hubBlock_() : '';
  const warn = typeof window.hubWarn_ === 'function' ? window.hubWarn_() : '';
  const top = hub ? [rolesSet_('staff-top', 'Staff hub', [rolesDrawn_(() => warn + hub)])] : [];
  const out = ownCardSetPage_('staff').concat(top, typeof flyerCards_ === 'function' ? flyerCards_() : [], typeof window.legoCards_ === 'function' ? window.legoCards_() : [], settingsCards_(settingsSplit_().staff, '', 'staff'));
  return out.length ? out : [rankOffCard_('', NOTHING_YET, null, 'rank-off set-none')];
}
screen('staff', () => pages('staff', typeof cardsOf_ === 'function' ? cardsOf_('staff') : staffPages_()));

/* ---------- APPRENTICE: WORK EXPERIENCE, A PLACEHOLDER UNTIL IT IS BUILT (570) ---------- */
function apprenticePages_() {
  return [rolesSet_('appr-set', '', [{ type: 'text', look: 'note', text: brand('apprentice_blurb', 'Work experience with us. Coming soon.') }])];
}
screen('apprentice', () => pages('apprentice', typeof cardsOf_ === 'function' ? cardsOf_('apprentice') : apprenticePages_()));

/* ---------- WEB PROFILE (730): @family.'s own public card, from the brand tab, every line with its fallback ---------- */
function webProfilePages_() {
  const b = typeof window.matBrand === 'function' ? window.matBrand() : {};
  const name = b.name || brand('name', '@family.'), logo = brandLogo_();
  const lines = [brand('web_tagline', 'Tutoring for every age, at home and online.'), b.area ? 'Where: ' + b.area : '',
    b.phone ? 'Phone: ' + b.phone : '', b.site ? 'Online: ' + b.site : ''].filter(Boolean);
  return [rolesSet_('web-card', name, logo ? [{ type: 'figure', src: logo, alt: '', look: 'web-logo' }] : [])];
}
screen('web', () => pages('web', typeof cardsOf_ === 'function' ? cardsOf_('web') : webProfilePages_()));

/* ---------- APPRENTICE PROFILE (730): a card per apprentice an admin is sent (`everyone`, role Apprentice); none yet is a line from brand() ---------- */
function apprenticeProfilePages_() {
  const all = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.everyone) ? DATA.everyone : []).filter(p => p && p.title && /apprentice/i.test(String(p.role || '')));
  if (all.length) return all.map(p => rolesSet_('appr-card', p.title, p.handle ? [{ type: 'tags', tags: [{ text: '@' + p.handle, look: 'prof-handle' }] }] : []));
  return [rolesSet_('appr-card people-none', '', [{ type: 'text', look: 'empty', text: brand('apprentices_none', 'No apprentices yet.') }])];
}
screen('apprentices', () => pages('apprentices', typeof cardsOf_ === 'function' ? cardsOf_('apprentices') : apprenticeProfilePages_()));

/* ---------- ADMIN: THE BUSINESS CARDS, THEN THE BUILD STAMPS (people management is on the people columns since 453) ---------- */
function adminPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return (typeof window.bizPages_ === 'function' ? window.bizPages_() : []).concat(typeof deletedCard_ === 'function' ? [deletedCard_()] : []);
}
/* THE SITE COLUMN (491): what runs the site rather than the business — setup, moderation, imports, the weekly email, the build. */
function sitePages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return (typeof window.siteBizPages_ === 'function' ? window.siteBizPages_() : [])
    .concat(typeof inboxCard_ === 'function' ? [inboxCard_()] : [])
    .concat(STABILITY_SHOWN ? [stabilityCard_()] : [])
    .concat([rolesSet_('', 'Build', [rolesDrawn_(versionSaid_, 'me-build')])]);
}

/* ---------- STABILITY (730): data/stability.json, written by tools/stability.js, read the first time the card is drawn ---------- */
/* ONE SCORE (890): the Optimiser in Find replaces this card; its code stays, switched off. */
const STABILITY_SHOWN = false;
const STAB = { got: null, failed: false, asked: false, all: false };
function stabilityCard_() {
  if (!STAB.asked) {
    STAB.asked = true;
    try {
      fetch('data/stability.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
        .then(j => { STAB.got = j && typeof j.score === 'number' ? j : null; STAB.failed = !STAB.got; })
        .catch(() => { STAB.failed = true; })
        .then(() => { try { markStale_(['site']); paint('site'); } catch (e) { /* the column redraws on its next paint anyway */ } });
    } catch (e) { STAB.failed = true; }
  }
  const s = STAB.got;
  if (!s) return rolesSet_('biz stability-card', 'Stability', [STAB.failed ? { type: 'paperNote', alert: true, text: 'The score could not be read. Run node tools/stability.js and push.' } : { type: 'wait', on: true }]);
  const sig = (s.signals || []).filter(x => x.off > 0);
  return rolesSet_('biz stability-card', 'Stability', [{ type: 'text', look: 'stab-score', text: String(s.score) + '%' },
    { type: 'list', ordered: true, look: 'stab-top', items: (STAB.all ? sig : sig.slice(0, 3)).map(x => x.label + ': ' + x.count + ' −' + x.off) },
    sig.length > 3 ? { type: 'tiles', tiles: [{ icon: STAB.all ? 'hide' : 'show', label: STAB.all ? 'Show the top 3' : 'Show every signal', act: 'stab-all' }] } : null]);
}
on('stab-all', () => { STAB.all = !STAB.all; try { markStale_(['site']); paint('site'); } catch (e) { /* the column redraws on its next paint anyway */ } });

/* ---------- YOUR ROLE: ONE RANK (400), SO ONE CHOICE, CLIENT OR STUDENT, FOR A CLIENT ONLY (432) ----------
   Tutor comes by "Apply to teach", Admin is given, and dopost.gs refuses a student becoming a client. */
const ROLE_PICKS = [
  ['tutor', 'Tutor', 'You teach here. Teaching starts with "Apply to teach" on Tutor settings.'],
  ['client', 'Client', 'A parent or payer. You book and pay for sessions.'],
  ['student', 'Student', 'You are the one learning. Only @family. can change a student account back.'],
];
/* WHAT THE LINE UNDER THE CARD SAYS WHEN NOTHING HAS JUST HAPPENED, by rank. */
function rolesSaid_() {
  if (!whose_()) return '';
  if (whoseAtLeast_('admin')) return '';
  if (whose_().tutorPending && hasRole('tutor', whose_()))
    return 'Tutor is waiting for ' + brand('name', '@family.') + ' to approve you. Until then you are not on the site and '
         + 'cannot be booked — fill in your teaching pages meanwhile.';
  if (whoseAtLeast_('staff')) return 'You teach here. Your hours, pricing and terms are in the Staff hub on ' + tabLabel_('staff', 'Tutor settings') + '.';
  if (rank_(whose_()) === 'student') return 'A parent links you to their account from theirs.';
  return '';
}
/* THE CHOICE THE CARD OFFERS: only a Client has one. A waiting Tutor keeps the old row's tutor alongside it (`rolesPicked_`). */
const rolesPickable_ = () => !!whose_() && rank_(whose_()) === 'client';
function rolesCard_() {
  const name = brand('name', '@family.');
  /* ONE ROW, THE PHONE'S OWN PICKER, and no notes under it (469: the owner, "so much filler space"). */
  const can = rolesPickable_() ? ROLE_PICKS.filter(([r]) => r !== 'tutor') : [];
  const picks = can.length ? [{ type: 'formRow', label: 'You are', control: { kind: 'select', look: 'role-pick-in', aria: 'Your role', value: 'client',
      options: can.map(([r, label]) => ({ value: r, text: label, data: { 'role-pick': r } })) } },
    { type: 'tiles', tiles: [{ icon: 'save', label: 'Save', act: 'roles-save' }] }] : [];
  const said = rolesSaid_();
  return rolesSet_('roles-card', 'Your roles', picks.concat(picks.length || said ? [{ type: 'paperNote', look: 'roles-said', live: true, text: said }] : []));
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
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
      toast(d.changed ? 'Role saved' : 'Nothing changed');
      /* THE COLUMN IS DRAWN FROM THE ROLE — which pages of fields, the agreement card — so it is
         drawn again; then the payload, because who is a tutor is in it. */
      if (d.changed) { try { repaint(true); } catch (e) { oops_(e, 'me:rolesCard_') } try { load(); } catch (e) { oops_(e, 'me:rolesCard_') } }
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
/* WHAT THE LINE UNDER THE TICKS SAYS AFTER ONE IS SAVED, kept as state for `HANDLE_SAID`'s reason: § */
let NOTIFY_SAID = { pid: '', text: '' };
const notifyList_ = () => {
  const n = whose_() && whose_().profile && whose_().profile.notify;
  return n && Array.isArray(n.kinds) ? n : null;
};
function notifyCard_() {
  const f = (DATA && Array.isArray(DATA.features)) ? DATA.features : [];
  const n = notifyList_();
  const said = t => cardBlock_({ type: 'paperNote', look: 'notify-said', live: true, text: t });
  let inner, toggles = [], tail = '';
  /* AN EMPTY LIST BEFORE THE PAYLOAD HAS LANDED IS "NOT KNOWN YET", NOT "OLD" — `LOADED` says which. */
  if (f.indexOf('setNotify') === -1 && (f.length || LOADED)) {
    inner = '';
  }
  else if (!n) inner = said('Your choices are on their way from the sheet.');
  else if (!n.to) {
    /* NO ADDRESS OF THEIR OWN — `notify` writes to the row's own address and nowhere else, so nothing at
       all is sent to them; a child's forgotten PIN goes to their grown-ups (`authGrownUps_`). */
    const kid = heldRoles(whose_()).map(roleOf).indexOf('student') !== -1;
    inner = cardBlock_({ type: 'text', look: 'empty', text: kid ? 'No email address, so no emails.' : 'No email address yet — add one on your Contact card.' });
  }
  /* A LIST WITH NOTHING IN IT. § */
  else if (!n.kinds.length) {
    inner = cardBlock_({ type: 'text', look: 'empty', text: 'No email choices yet.' });
  } else {
    const opt = n.kinds.filter(k => !k.essential), must = n.kinds.filter(k => k.essential);
    const mine = NOTIFY_SAID.pid && NOTIFY_SAID.pid === String(whose_().personId || '') ? NOTIFY_SAID.text : '';
    /* ---------- SHORT, BECAUSE IT HAS TO FIT A 320 PHONE WITHOUT SCROLLING § */
    inner = '';
    toggles = opt.map(k => ({ act: 'notify-pick', cls: 'notify-pick', data: { kind: k.kind }, on: k.on, label: k.label,
      note: (k.note || '') + (k.idle ? ' — ' + String(k.idle).toLowerCase() : '') }));
    tail = cardBlocks_(must.length ? [{ type: 'text', look: 'notify-cap', text: 'Always sent' }, { type: 'list', look: 'notify-always', items: must.map(k => k.label) }] : [])
      + said(mine);
  }
  /* THE ONE FORM MAKER WITHOUT A Save: each tick is saved the moment it is ticked (`notify-pick`). */
  /* PHONE NOTIFICATIONS (492, push.js) ARE PART OF THIS ONE CARD (owner, 12 Nov). */
  if (typeof pushBody_ === 'function') tail += pushBody_();
  return formCard_({ title: 'Notifications', cls: 'notify-card', body: inner, toggles: toggles, tail: tail, save: false });
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
  /* THE LENS'S PERSON BY `targetId`: the backend lets an admin (or a parent, for a child) choose for somebody else. */
  const W = whose_();
  send_(Object.assign({ action: 'setNotify', name: USER.name, personId: USER.personId || '', kind: kind, on: want }, W === USER ? {} : { targetId: W.personId || '' }),
        { where: said || undefined, saying: 'Saving…', lock: el.closest('label') || el })
    .then(d => {
      /* THIS KIND'S ANSWER, MERGED INTO THE LIST WE HOLD — not the reply's whole list. § */
      const on = d && typeof d.on === 'boolean' ? d.on : want;
      const held = notifyList_();
      if (held && held.kinds.some(x => x.kind === kind)) {
        W.profile = Object.assign({}, W.profile, { notify: Object.assign({}, held, {
          kinds: held.kinds.map(x => x.kind === kind && !x.essential ? Object.assign({}, x, { on: on }) : x) }) });
      } else if (d && d.notify) W.profile = Object.assign({}, W.profile || {}, { notify: d.notify });
      if (W === USER) keepUser_();
      NOTIFY_SAID = { pid: String(W.personId || ''),
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
  return cardBlock_({ type: 'paperBox', look: 'me-week', inner: weekGrid_(days, (h, d) => cardBlock_({ type: 'tickCell', look: 'hr' + (on(h.code) ? ' on' : '') + (ro(h.code) ? ' shut' : ''),
    label: d.label + ' ' + h.h + ':00', control: { value: on(h.code), off: ro(h.code), data: { me: h.code }, drafted: keep(h.code) ? draftAttr_('set', h.code, was(h.code)) : '' } })) });
}
