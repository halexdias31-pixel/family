/* @family. — inbox.gs — THE EMAIL WIDGET (493): the owner's own Gmail, read-only, headers and snippets only (547), for an admin. docs/history/493-an-email-widget.md */

/* WHY THE GMAIL REST API AND NOT GmailApp: GmailApp asks for the full mail.google.com scope (send, delete);
   the REST API with the script's own token works on gmail.readonly, so this file cannot change a thing. */
const INBOX_API_ = 'https://gmail.googleapis.com/gmail/v1/users/me/';
const INBOX_SCOPE_ = 'https://www.googleapis.com/auth/gmail.readonly';

/* NOT AUTHORISED YET is the commonest failure on the day it ships, so it is said in the owner's words. */
const INBOX_NOT_ALLOWED_ = 'Gmail is not switched on yet. In the Apps Script editor run authoriseGmail and press Allow, '
  + 'ticking every box; only then Deploy → Manage deployments → New version.';

function inboxGet_(path) {
  const r = UrlFetchApp.fetch(INBOX_API_ + path, { muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  const code = r.getResponseCode();
  /* GOOGLE'S OWN WORDS IN THE LOG: a 403 is either the permission not allowed or the Gmail API not turned on — they need different fixes. */
  if (code === 401 || code === 403) { let why = ''; try { why = JSON.parse(r.getContentText()).error.message; } catch (e) { /* a malformed stored value counts as absent */ } throw new Error(INBOX_NOT_ALLOWED_ + (why ? ' Google says: ' + why : '')); }
  if (code >= 300) throw new Error('Gmail said ' + code + '.');
  return JSON.parse(r.getContentText());
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
