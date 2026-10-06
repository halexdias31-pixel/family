/* ==================================================================================================
   THE PARENT EMAILS, AS AN ADMIN SEES THEM — two cards on the Settings column.

   THE WEEKLY ONE FIRST, then the one after each session (backend/recap.gs), asked for as *"like 2 hours
   after the end of each session is done it will send an automated email to them of the questions they
   got done."* Both are switched off on the server, both are switched on the same way — a cell on the
   config tab and a run in the Apps Script editor — and both cards say so and preview. Everything below
   about the weekly card is true of the second, which is why it is in this file and not a new one:
   `index.html` is unchanged, and the two cards cannot drift apart on what a mode means.

   THE WEEKLY CARD:

   ASKED FOR AS *"something which triggers every sunday. it checks what the student has done that week
   and records the questions and send it in an email to parents. for now dont actually make it but make
   the infrastructure"*. The email is backend/digest.gs and it is switched off. This card is the one
   place on the phone that says so, and the one way to read what it WOULD send without sending it.

   IT SAYS WHERE THE SWITCH IS AND DOES NOT THROW IT. `weekly_digest` is a cell on the config tab and
   the Sunday is booked from the Apps Script editor (`installWeeklyDigest`); neither is a tap here. A
   tile that started emailing forty families is not a thing to put one thumb away from the Save tiles
   on the cards either side — the owner switches it on deliberately, at a desk, after reading a preview.

   PREVIEW IS A READ. `digestPreview` (admin in `ACTION_ACCESS`) answers with this week so far — every
   email rendered, and every learner nobody can be told about, with the reason — and writes, sends and
   books nothing. The sheet prints the PLAIN body, escaped here, rather than the server's HTML: a
   question's name came off a student's phone, and the page is not the place to find out whether it was
   escaped right twice.

   A THING, SO A TILE. The card is about one thing — the weekly email — and Preview is an action on it,
   which is the tile rule in CLAUDE.md; there is no form here for a button to belong to.

   APPENDED LAST, after the business records, for the wardrobe's reason in `settingsPages_`:
   `PAGE.settings` remembers where somebody was, and a card in front would move every index behind it.
   The session card goes after the weekly one for the same reason.
================================================================================================== */
/* `got` is the last answer, so the mode on the card is the server's once it has said, and the config
   row in the payload before that. */
const DIGEST = { got: null };

const digestModeOf_ = v => {
  const m = String(v == null ? '' : v).trim().toLowerCase();
  return m === 'preview' || m === 'send' ? m : 'off';
};
function digestModeNow_() {
  if (DIGEST.got && DIGEST.got.mode) return digestModeOf_(DIGEST.got.mode);
  const vars = (DATA && DATA.constants && DATA.constants.vars) || {};
  return digestModeOf_(vars.weekly_digest);
}
/* THE SAME WORDS AS THE CONFIG TAB'S OWN NOTE, so the card and the cell say one thing. Anything that
   is not exactly preview or send is off on the server, and so it is here. */
const DIGEST_SAY = {
  off: 'Nothing is sent and nothing is written.',
  preview: 'Each Sunday, what would be sent is written to the digest_log tab. Nobody is emailed.',
  send: 'Each Sunday, parents are emailed.',
};
const digestWord_ = m => m.charAt(0).toUpperCase() + m.slice(1);

function digestCard_() {
  const mode = digestModeNow_();
  return `<div class="card digest">
    <h3 class="digest-mode">Weekly parent email: <b>${esc(digestWord_(mode))}</b></h3>
    <p class="sub">On Sundays, each parent who has accepted a link to a child gets the questions that
      child worked on that week.</p>
    <p class="faint"><span class="digest-why">${esc(DIGEST_SAY[mode])}</span> Switched on the config
      tab (<code>weekly_digest</code>); Sundays are booked from the Apps Script editor.</p>
    <div class="tile-row">${tile_({ icon: 'show', label: 'Preview', note: 'this week', act: 'digest-preview' })}</div>
    <p class="faint me-said digest-said"></p>
  </div>`;
}

/* THE CARD, OR NONE. A card is not a permission — the action is `admin` on the server — but a card a
   non-admin cannot use is a card they should not have to swipe past. */
function digestPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return [digestCard_(), recapCard_()];
}

/* THE PLAIN BODY AS PARAGRAPHS: a blank line is a paragraph, a line break is a line. Every line through
   `esc`, so nothing in a question's name is markup here. */
const digestBody_ = text => String(text || '').split(/\n{2,}/)
  .map(par => `<p>${par.split('\n').map(esc).join('<br>')}</p>`).join('');

function digestSheet_(d) {
  const emails = Array.isArray(d.emails) ? d.emails : [];
  const none = Array.isArray(d.unreachable) ? d.unreachable : [];
  const mode = digestModeOf_(d.mode);
  const hour = Number(d.hour);
  const when = 'Sundays at ' + (hour >= 0 && hour <= 23 ? String(hour).padStart(2, '0') : '18') + ':00';
  /* WHETHER A SUNDAY IS BOOKED IS THE OTHER HALF OF "IS IT ON", and the server can see it. */
  const booked = d.scheduled == null ? '' : d.scheduled ? ' · booked' : ' · no Sunday booked yet';
  const n = emails.length;
  const these = n === 1 ? 'this email' : 'these ' + n + ' emails';
  /* WHAT SUNDAY WOULD DO WITH THEM, IN THE MODE IT IS IN — "would be written" under Off was the card
     promising a log the run would never write. */
  const sunday = mode === 'send' ? 'On Sunday ' + these + ' would be sent.'
    : mode === 'preview' ? 'On Sunday ' + these + ' would be written to the digest_log tab, and none sent.'
    : 'It is off, so on Sunday nothing goes; switched on, ' + these + ' would.';
  return `<p class="faint">This week so far (${esc((d.week && d.week.span) || '')}). ${esc(n ? sunday : '')}
      ${esc(when)}${esc(booked)}. This preview sent nothing.</p>
    ${n ? emails.map(m => `<h2>To ${esc(m.parent || '')} · ${esc(m.to || '')}</h2>
      <p><b>${esc(m.subject || '')}</b></p>
      ${digestBody_(m.text)}`).join('')
      /* NO `attempts` TAB IS NOT "NOBODY DID ANYTHING" — the server says which, and the card says it. */
      : d.attempts === false ? `<p><b>${esc(d.warning || 'The Ledger has no attempts tab.')}</b></p>`
      : '<p>Nobody has done a question yet this week.</p>'}
    ${none.length ? `<h2>Nobody to tell</h2>
      ${none.map(u => `<p>${esc(u.name || u.id || '')} — ${esc(u.why || '')}</p>`).join('')}` : ''}`;
}

on('digest-preview', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const card = el.closest('.card');
  const said = card && card.querySelector('.digest-said');
  /* A BACKEND FROM BEFORE digest.gs says so here, rather than "not recognised" from the server — the
     `features` list is what the payload offers for exactly this. */
  if (!(DATA && Array.isArray(DATA.features) && DATA.features.indexOf('digestPreview') !== -1)) {
    if (said) said.textContent = 'The live backend does not have the weekly email yet — sync backend/ into Apps Script.';
    return;
  }
  send_({ action: 'digestPreview', name: USER && USER.name, personId: USER && USER.personId },
        { button: el, where: said, busy: 'Building…' })
    .then(d => {
      DIGEST.got = d;
      /* THE CARD'S OWN LINE, IN PLACE — the mode the server just read, not the one the payload had. */
      const mode = digestModeNow_();
      const b = card && card.querySelector('.digest-mode b');
      if (b) b.textContent = digestWord_(mode);
      const why = card && card.querySelector('.digest-why');
      if (why) why.textContent = DIGEST_SAY[mode];
      if (said) said.textContent = '';
      openSheet('Weekly parent email', digestSheet_(d));
    })
    .catch(() => {});
});


/* ==================================================================================================
   THE EMAIL AFTER EACH SESSION — the second card, after the weekly one.

   THE SAME CONTRACT AS ABOVE: it says the mode `session_recap` is in and where the switch is, throws
   nothing, and its one tile asks `recapPreview` — a read of the last seven days that writes, sends and
   books nothing. NO SWITCH TILE, for the reason at the top of this file; if one is ever wanted it goes
   on both cards at once, or the two emails are switched two different ways.

   WHAT THE PREVIEW IS FOR is "why did nothing go after Tuesday's lesson?" — so every booked session
   is under its day with when its email falls due, every email as it would read now with what the log
   says of it, and everybody nobody can tell with the reason: not paid yet, a name that is nobody's
   child here, a parent who never confirmed their address, or — the one to look for first — nothing
   marked that day while signed in as the child, with whose account the questions went on instead.
   The two tabs it needs are named first when either is missing.
================================================================================================== */
const RECAP = { got: null };

function recapModeNow_() {
  if (RECAP.got && RECAP.got.mode) return digestModeOf_(RECAP.got.mode);
  const vars = (DATA && DATA.constants && DATA.constants.vars) || {};
  return digestModeOf_(vars.session_recap);
}
/* THE SERVER'S READING OF `session_recap_delay`: whole hours, 0 to 12, anything else 2. */
function recapDelayNow_() {
  const vars = (DATA && DATA.constants && DATA.constants.vars) || {};
  const raw = RECAP.got && RECAP.got.delay != null ? RECAP.got.delay : vars.session_recap_delay;
  const v = String(raw == null ? '' : raw).trim();
  return /^\d{1,2}$/.test(v) && Number(v) <= 12 ? Number(v) : 2;
}
const recapAfter_ = h => (h === 0 ? 'Within the hour after' : 'About ' + h + ' hour' + (h === 1 ? '' : 's') + ' after');
/* THE CONFIG TAB'S OWN WORDS FOR EACH MODE, as `DIGEST_SAY` is for Sundays. */
const RECAP_SAY = {
  off: 'Nothing is sent and nothing is written.',
  preview: 'After each session, what would be sent is written to the recap_log tab. Nobody is emailed.',
  send: 'After each session, parents are emailed.',
};

function recapCard_() {
  const mode = recapModeNow_();
  return `<div class="card recap">
    <h3 class="recap-mode">Email after each session: <b>${esc(digestWord_(mode))}</b></h3>
    <p class="sub"><span class="recap-when">${esc(recapAfter_(recapDelayNow_()))}</span> a child’s last booked session
      of the day, each parent who has accepted a link to them gets the questions that child worked on that day.</p>
    <p class="faint"><span class="recap-why">${esc(RECAP_SAY[mode])}</span> Switched on the config tab
      (<code>session_recap</code>); the hourly check is booked from the Apps Script editor
      (<code>installSessionRecap</code>).</p>
    <div class="tile-row">${tile_({ icon: 'show', label: 'Preview', note: 'last 7 days', act: 'recap-preview' })}</div>
    <p class="faint me-said recap-said"></p>
  </div>`;
}

/* ---------- WHAT EACH LINE SAYS, IN THE MODE IT IS IN ---------------------------------------------------
   THE PREVIEW IS READ BEFORE ANYTHING IS SWITCHED ON — owner step 4 is opening it with `session_recap`
   still off — and it said "email due now" over an email headed "not on the log yet", both of which
   promise a send that off will never make. The same two words also sat beside a session five days old,
   whose email is past its 24 hours and can never go, and beside a session nobody on it can be told
   about. So every line is worded from three things the reply carries: the mode, the session's or the
   email's `state` (still to come, in its hour, past), and whether anybody is on it.

   THE LOG'S OWN WORD WINS when there is a row — `sent`, `held`, `preview` — because that is what
   happened, whatever the mode is now. */
const RECAP_STATE = { upcoming: 'email still to come', due: 'email due now', past: 'past' };
const RECAP_STATE_OFF = { upcoming: 'off — would go later if switched on', due: 'off — would go now if switched on', past: 'past' };
function recapSessionSay_(s, mode) {
  const head = [s.subject || 'A session', s.time].filter(Boolean).join(' ');
  /* A REASON FROM THE SERVER — not agreed, cancelled, for somebody not on the site — is the line. */
  if (!RECAP_STATE[s.state]) return head + ' · ' + (s.state || '');
  /* BOOKED, AND NOBODY ON IT CAN BE TOLD: no time for an email that will not exist. Why is under
     "Nobody to tell". */
  if (!(s.learners || []).length) return head + ' · nobody to email — see below';
  return head + ' · ' + s.learners.join(', ') + (s.dueSaid ? ' · email about ' + s.dueSaid : '')
    + ' · ' + (mode === 'off' ? RECAP_STATE_OFF : RECAP_STATE)[s.state];
}
function recapEmailSay_(m, mode) {
  if (m.status && m.status !== '—') return m.status;
  if (m.state === 'past') return 'not sent — past its 24 hours, it will not go';
  if (mode === 'off') return 'not sent — session_recap is off';
  if (mode === 'preview') return 'would be written to recap_log';
  return 'not on the log yet';
}
/* WHAT THE HOURLY CHECK DOES WITH WHAT IS BELOW, IN THE MODE IT IS IN — `digestSheet_`'s sentence. */
const RECAP_WILL = {
  off: 'It is off, so nothing below goes; switched on, the emails would.',
  preview: 'Each email is written to the recap_log tab when it falls due, and none is sent.',
  send: 'Each email is sent once, when it falls due.',
};

function recapSheet_(d) {
  const days = (Array.isArray(d.days) ? d.days : []).filter(x => x && ((x.sessions || []).length
    || (x.emails || []).length || (x.nobody || []).length));
  const mode = digestModeOf_(d.mode);
  const warn = [];
  if (d.warning) warn.push(d.warning);
  if (d.scheduled === 0) warn.push('No hourly check is booked yet — run installSessionRecap once in the Apps Script editor.');
  const booked = d.scheduled == null ? '' : d.scheduled ? ' · checked every hour · booked' : ' · not booked';
  const any = days.some(x => (x.emails || []).length);
  /* `.recap-sheet` SCOPES THE HEADINGS (style.css): a day outranks the emails under it. */
  return `<div class="recap-sheet">${warn.map(w => `<p><b>${esc(w)}</b></p>`).join('')}
    <p class="faint">${esc(digestWord_(mode) + booked + '. ' + (any ? RECAP_WILL[mode] + ' ' : ''))}This preview sent nothing.</p>
    ${days.length ? days.map(x => `<h2>${esc(x.label || x.day || '')}</h2>
      ${(x.sessions || []).map(s => `<p>${esc(recapSessionSay_(s, mode))}</p>`).join('')}
      ${(x.emails || []).map(m => `<h3>To ${esc(m.parent || '')} · ${esc(m.to || '')} — ${esc(recapEmailSay_(m, mode))}</h3>
        <p><b>${esc(m.subject || '')}</b></p>
        ${digestBody_(m.text)}`).join('')}
      ${(x.nobody || []).length ? `<h3>Nobody to tell</h3>
        ${x.nobody.map(u => `<p>${esc(u.name || '')} — ${esc(u.why || '')}${u.status && u.status !== '—'
          ? ` <span class="faint">(${esc(u.status)})</span>` : ''}</p>`).join('')}` : ''}`).join('')
      : '<p>No booked session in the last 7 days. The email follows sessions booked on the site — one that is not booked here sends nothing.</p>'}</div>`;
}

on('recap-preview', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const card = el.closest('.card');
  const said = card && card.querySelector('.recap-said');
  /* A BACKEND FROM BEFORE recap.gs says so here, rather than "not recognised" from the server. */
  if (!(DATA && Array.isArray(DATA.features) && DATA.features.indexOf('recapPreview') !== -1)) {
    if (said) said.textContent = 'The live backend does not have the email after sessions yet — sync backend/ into Apps Script.';
    return;
  }
  send_({ action: 'recapPreview', name: USER && USER.name, personId: USER && USER.personId },
        { button: el, where: said, busy: 'Building…' })
    .then(d => {
      RECAP.got = d;
      /* THE CARD'S OWN LINES, IN PLACE — the mode and the delay the server just read. */
      const mode = recapModeNow_();
      const b = card && card.querySelector('.recap-mode b');
      if (b) b.textContent = digestWord_(mode);
      const why = card && card.querySelector('.recap-why');
      if (why) why.textContent = RECAP_SAY[mode];
      const when = card && card.querySelector('.recap-when');
      if (when) when.textContent = recapAfter_(recapDelayNow_());
      if (said) said.textContent = '';
      openSheet('Email after each session', recapSheet_(d));
    })
    .catch(() => {});
});
