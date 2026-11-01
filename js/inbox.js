/* @family. — inbox.js — THE EMAIL WIDGET (493): the owner's Gmail, read-only, admin only, a static overview (547). backend/inbox.gs; docs/history/493, 547. */

/* ONE STATE, the list as last asked. Never stored: an inbox is not kept on a phone or in a sheet. */
const INBOX_ = { rows: [], said: '', busy: false };
/* THE LAST FOUR, STATIC (owner, 29 Oct and 1 Nov): "just static overview" -- sender, subject, time, snippet; nothing opens, no search, chips or More (547). */
const INBOX_SHOWN = 4;

function inboxWhen_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0, 5);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + (d.getFullYear() === now.getFullYear() ? '' : ' ' + d.getFullYear());
}
function inboxRowHtml_(r) {
  return `<div class="ib-row${r.unread ? ' is-unread' : ''}">
    <span class="ib-dot" aria-label="${r.unread ? 'Unread' : ''}"></span>
    <span class="ib-from">${esc(r.from || '(no sender)')}${r.count > 1 ? ` <small>${r.count}</small>` : ''}</span>
    <span class="ib-at">${esc(inboxWhen_(r.at))}</span>
    <span class="ib-subj">${esc(r.subject || '(no subject)')}</span>
    <span class="ib-snip">${esc(r.snippet)}</span>
  </div>`;
}

function inboxHtml_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  const list = INBOX_.rows.length ? INBOX_.rows.slice(0, INBOX_SHOWN).map(inboxRowHtml_).join('')
    : (INBOX_.busy ? '' : `<p class="sub">${esc(INBOX_.said || 'Nothing here.')}</p>`);
  return `${INBOX_.rows.length && INBOX_.said ? `<p class="sub">${esc(INBOX_.said)}</p>` : ''}
    <div class="ib-list"${INBOX_.busy ? ' aria-busy="true"' : ''}>${list}${INBOX_.busy ? loading_() : ''}</div>`;
}

/* THE CARD ON SITE (500): the owner asked for it there, beside the weekly email, not in Tools. Drawn with what is already known; initInbox asks. */
function inboxCard_() {
  return `<div class="card biz inbox-card">
    <h3>Email</h3>
    <p class="faint ib-order">A new backend needs, in order: sync, run authoriseGmail, Allow, READY, and only then Deploy → New version.</p>
    <div class="ib-box" id="ib-box">${inboxHtml_()}</div>
  </div>`;
}

function inboxPaint_() {
  document.querySelectorAll('.ib-box').forEach(b => { b.innerHTML = inboxHtml_(); });
}

/* ---------- ASKING: the inbox's newest threads, the first four kept. Read-only: nothing here writes to Gmail. */
function inboxFetch_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || INBOX_.busy) return;
  const f = (typeof DATA !== 'undefined' && DATA && DATA.features) || [];
  if (f.length && f.indexOf('inboxList') < 0) {
    INBOX_.said = 'The live backend has no Email yet. In Apps Script: sync, run authoriseGmail and Allow (tick every box), THEN Deploy → New version.';
    inboxPaint_(); return;
  }
  INBOX_.busy = true;
  INBOX_.rows = [];
  INBOX_.said = '';
  inboxPaint_();
  send_({ action: 'inboxList', q: 'in:inbox', page: '', name: USER.name, personId: USER.personId }, {})
    .then(d => {
      INBOX_.busy = false;
      if (!d || d.error) { INBOX_.said = (d && d.error) || 'Gmail did not answer.'; }
      else {
        INBOX_.rows = (d.rows || []).slice(0, INBOX_SHOWN);
        if (!INBOX_.rows.length) INBOX_.said = 'Nothing in the inbox.';
      }
      inboxPaint_();
    })
    .catch(err => { INBOX_.busy = false; INBOX_.said = String((err && err.message) || err); inboxPaint_(); });
}

function initInbox() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  inboxPaint_();
  if (!INBOX_.rows.length && !INBOX_.busy) inboxFetch_();
}
