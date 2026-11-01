/* @family. — inbox.gs — THE EMAIL WIDGET (493): the owner's own Gmail, read-only, headers and snippets only (547), for an admin. docs/history/493-an-email-widget.md */

/* WHY THE GMAIL REST API AND NOT GmailApp: GmailApp asks for the full mail.google.com scope (send, delete);
   the REST API with the script's own token works on gmail.readonly, so this file cannot change a thing. */
const INBOX_API_ = 'https://gmail.googleapis.com/gmail/v1/users/me/';
const INBOX_PAGE_ = 20;
const INBOX_SCOPE_ = 'https://www.googleapis.com/auth/gmail.readonly';

/* NOT AUTHORISED YET is the commonest failure on the day it ships, so it is said in the owner's words. */
const INBOX_NOT_ALLOWED_ = 'Gmail is not switched on yet. In the Apps Script editor run authoriseGmail and press Allow, '
  + 'ticking every box; only then Deploy → Manage deployments → New version.';

function inboxGet_(path) {
  const r = UrlFetchApp.fetch(INBOX_API_ + path, { muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  const code = r.getResponseCode();
  /* GOOGLE'S OWN WORDS IN THE LOG: a 403 is either the permission not allowed or the Gmail API not turned on — they need different fixes. */
  if (code === 401 || code === 403) { let why = ''; try { why = JSON.parse(r.getContentText()).error.message; } catch (e) {} throw new Error(INBOX_NOT_ALLOWED_ + (why ? ' Google says: ' + why : '')); }
  if (code >= 300) throw new Error('Gmail said ' + code + '.');
  return JSON.parse(r.getContentText());
}

/* MANY AT ONCE: twenty threads fetched one by one is twenty round trips. */
function inboxGetAll_(paths) {
  if (!paths.length) return [];
  const auth = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  return UrlFetchApp.fetchAll(paths.map(p => ({ url: INBOX_API_ + p, muteHttpExceptions: true, headers: auth })))
    .map(r => { try { return r.getResponseCode() < 300 ? JSON.parse(r.getContentText()) : null; } catch (e) { return null; } });
}

function inboxHeader_(msg, name) {
  const hs = (msg && msg.payload && msg.payload.headers) || [];
  const h = hs.find(x => String(x.name).toLowerCase() === name.toLowerCase());
  return h ? String(h.value) : '';
}

/* "Ann Example <ann@example.org>" → the name, and the address only when there is no name. */
function inboxSender_(from) {
  const m = String(from || '').match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/);
  return m ? (m[1].trim() || m[2].trim()) : String(from || '').trim();
}

function inboxLabels_() {
  try {
    return (inboxGet_('labels').labels || []).filter(l => l.type === 'user')
      .map(l => String(l.name)).sort((a, b) => a.localeCompare(b)).slice(0, 30);
  } catch (e) { return []; }
}

/* ---------- inboxList {q, page}: `page` is Gmail's own page token, '' for the first. Nothing is kept or logged. */
function inboxList_(body) {
  const q = String(body.q || '').trim() || 'in:inbox';
  const page = String(body.page || '');
  try {
    const list = inboxGet_('threads?maxResults=' + INBOX_PAGE_ + '&q=' + encodeURIComponent(q)
      + (page ? '&pageToken=' + encodeURIComponent(page) : ''));
    const threads = list.threads || [];
    const full = inboxGetAll_(threads.map(t => 'threads/' + encodeURIComponent(t.id)
      + '?format=metadata&metadataHeaders=From&metadataHeaders=Subject'));
    const rows = threads.map((t, i) => {
      const msgs = (full[i] && full[i].messages) || [];
      const last = msgs[msgs.length - 1];
      if (!last) return null;
      return {
        id: String(last.id), thread: String(t.id),
        from: inboxSender_(inboxHeader_(last, 'From')),
        subject: inboxHeader_(last, 'Subject'),
        snippet: String(last.snippet || t.snippet || ''),
        at: Number(last.internalDate) || 0,
        unread: msgs.some(m => (m.labelIds || []).indexOf('UNREAD') !== -1),
        count: msgs.length,
      };
    }).filter(Boolean).sort((a, b) => b.at - a.at);
    return { success: true, q: q, rows: rows, next: String(list.nextPageToken || ''),
      labels: page ? undefined : inboxLabels_() };
  } catch (err) { return { error: String((err && err.message) || err) }; }
}

/* `inboxRead` WAS HERE: a message body reached the phone. The owner asked for "just static overview" (547), so no action returns a body. */

/* ---------- RUN ONCE FROM THE EDITOR, after syncing and BEFORE a new version — a version with an unapproved scope breaks the site for everyone. */
function authoriseGmail() {
  try {
    const p = inboxGet_('profile');
    Logger.log('READY — Gmail can be read (' + (Number(p.threadsTotal) || 0) + ' conversations). Now Deploy → Manage deployments → New version.');
  } catch (err) {
    Logger.log('NOT READY: ' + err + '\nCheck appsscript.json lists ' + INBOX_SCOPE_ + ', run this again and press Allow, ticking every box.');
  }
}
