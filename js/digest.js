/* ==================================================================================================
   THE WEEKLY PARENT EMAIL, AS AN ADMIN SEES IT — one card on the Settings column.

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
  return [digestCard_()];
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
