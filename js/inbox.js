/* @family. — inbox.js — THE EMAIL WIDGET (493): the owner's Gmail, read-only, admin only. backend/inbox.gs; docs/history/493. */

/* ONE STATE, the list as last asked. Never stored: an inbox is not kept on a phone or in a sheet. */
const INBOX_ = { rows: [], open: null, images: false, said: '', busy: false };
/* THE LAST FOUR (owner, 29 Oct): "the gmail viewer should just display your last 4 emails" -- no search, chips or More; a row still opens. */
const INBOX_SHOWN = 4;

function inboxWhen_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0, 5);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + (d.getFullYear() === now.getFullYear() ? '' : ' ' + d.getFullYear());
}
const inboxGmail_ = id => 'https://mail.google.com/mail/u/0/#all/' + encodeURIComponent(id);

/* ---------- A MESSAGE'S HTML, MADE SAFE: a real parser drops scripts, handlers, styles and javascript: links; remote images wait for Show images (493). */
function inboxClean_(html, images) {
  const doc = new DOMParser().parseFromString('<div>' + String(html || '') + '</div>', 'text/html');
  const root = doc.body.firstElementChild || doc.body;
  root.querySelectorAll('script,style,iframe,frame,frameset,object,embed,form,input,button,textarea,select,link,meta,base,noscript,template,svg,math,audio,video,source')
    .forEach(n => n.remove());
  root.querySelectorAll('*').forEach(el => {
    [].slice.call(el.attributes).forEach(a => {
      const n = a.name.toLowerCase(), v = String(a.value || '').trim();
      if (n.indexOf('on') === 0 || n === 'style' || n === 'class' || n === 'id' || n === 'srcset' || n === 'background' || n === 'formaction') el.removeAttribute(a.name);
      else if ((n === 'href' || n === 'src' || n === 'xlink:href' || n === 'action') && /^\s*(javascript|vbscript|data:text)/i.test(v)) el.removeAttribute(a.name);
    });
    if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') || '';
      if (/^https?:/i.test(src) && !images) { el.removeAttribute('src'); el.setAttribute('data-blocked', ''); el.setAttribute('alt', el.getAttribute('alt') || ''); }
      else if (!/^(https?:|data:image\/)/i.test(src)) el.remove();
    }
  });
  return root.innerHTML;
}

function inboxRowHtml_(r) {
  return `<button type="button" class="ib-row${r.unread ? ' is-unread' : ''}" data-do="inbox-open" data-id="${esc(r.id)}">
    <span class="ib-dot" aria-label="${r.unread ? 'Unread' : ''}"></span>
    <span class="ib-from">${esc(r.from || '(no sender)')}${r.count > 1 ? ` <small>${r.count}</small>` : ''}</span>
    <span class="ib-at">${esc(inboxWhen_(r.at))}</span>
    <span class="ib-subj">${esc(r.subject || '(no subject)')}</span>
    <span class="ib-snip">${esc(r.snippet)}</span>
  </button>`;
}

function inboxMsgHtml_(m) {
  if (m.loading) return `<div class="ib-msg" aria-busy="true">${loading_()}</div>`;
  if (m.error) return `<div class="ib-msg"><p class="sub">${esc(m.error)}</p><div class="tile-row">${tile_({ icon: 'left', label: 'Back', act: 'inbox-back' })}</div></div>`;
  const blocked = !!m.html && !INBOX_.images && /<img\b[^>]*\bsrc\s*=\s*["']?https?:/i.test(m.html);
  const bodyHtml = m.html ? inboxClean_(m.html, INBOX_.images) : `<pre class="ib-text">${esc(m.text || '')}</pre>`;
  return `<div class="ib-msg">
    <div class="tile-row">${tile_({ icon: 'left', label: 'Back', note: 'the list', act: 'inbox-back' })}${
      tile_({ icon: 'ext', label: 'Open in Gmail', href: inboxGmail_(m.thread || m.id) })}${
      blocked ? tile_({ icon: 'show', label: 'Show images', note: 'lets the sender see it was opened', act: 'inbox-images' }) : ''}</div>
    <h4 class="ib-h">${esc(m.subject || '(no subject)')}</h4>
    <p class="sub ib-meta">${esc(m.from)}<br>${esc(new Date(m.at || 0).toLocaleString('en-GB'))}</p>
    <div class="ib-body">${bodyHtml}</div>
  </div>`;
}

function inboxHtml_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  if (INBOX_.open) return inboxMsgHtml_(INBOX_.open);
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

on('inbox-back', () => { INBOX_.open = null; INBOX_.images = false; inboxPaint_(); });
on('inbox-images', () => { INBOX_.images = true; inboxPaint_(); });
on('inbox-open', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const id = el.dataset.id;
  INBOX_.open = { loading: true, id };
  INBOX_.images = false;
  inboxPaint_();
  send_({ action: 'inboxRead', id, name: USER.name, personId: USER.personId }, {})
    .then(d => { if (INBOX_.open && INBOX_.open.id === id) { INBOX_.open = d && !d.error ? d : { id, error: (d && d.error) || 'Gmail did not answer.' }; inboxPaint_(); } })
    .catch(err => { INBOX_.open = { id, error: String((err && err.message) || err) }; inboxPaint_(); });
});
