/* @family. — push.gs — PHONE NOTIFICATIONS (492): Firebase Cloud Messaging, HTTP v1, free. docs/push-notifications.md */
/* No keys in Script Properties → every function here returns quietly; the site says "not switched on yet". */

const PUSH_PROPS = ['FCM_PROJECT_ID', 'FCM_CLIENT_EMAIL', 'FCM_PRIVATE_KEY'];
/* WHAT A PERSON CAN TURN OFF, one row each on the card. A kind not here is never sent. */
const PUSH_KINDS = {
  messages: 'Messages',
  bookings: 'Booking requests and answers',
  posts:    'Replies to your posts',
};
const PUSH_MAX_DEVICES = 10;

function pushProps_() {
  const p = PropertiesService.getScriptProperties(), o = {};
  PUSH_PROPS.forEach(k => { o[k] = S(p.getProperty(k)).trim(); });
  return o;
}
const pushMissing_ = () => { const o = pushProps_(); return PUSH_PROPS.filter(k => !o[k]); };
const pushReady_ = () => !pushMissing_().length;

/* THE SERVICE ACCOUNT'S OAUTH TOKEN: a JWT signed RS256 here, swapped at Google for an hour's token, kept 50 minutes. */
function pushAccessToken_() {
  const cache = CacheService.getScriptCache();
  const held = cache.get('fcm_oauth');
  if (held) return held;
  const o = pushProps_();
  /* A KEY PASTED AS ONE LINE carries literal "\n"; the signer needs real line breaks. */
  const key = o.FCM_PRIVATE_KEY.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const b64 = s => Utilities.base64EncodeWebSafe(s).replace(/=+$/, '');
  const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64(JSON.stringify({ iss: o.FCM_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = b64(Utilities.computeRsaSha256Signature(head + '.' + claim, key));
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', muteHttpExceptions: true,
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + claim + '.' + sig } });
  if (res.getResponseCode() !== 200) return '';
  const tok = S(JSON.parse(res.getContentText()).access_token);
  if (tok) cache.put('fcm_oauth', tok, 3000);
  return tok;
}

/* ONE PERSON'S DEVICES. `off` is the kinds they turned off, kept on every row of theirs alike. */
const pushRowsOf_ = (t, pid) => t.rows.filter(r => S(r.person_id) === S(pid) && S(r.token));
const pushOffOf_ = rows => (rows[0] ? S(rows[0].off).split(',').map(norm).filter(Boolean) : []);

/* SEND ONE KIND TO ONE PERSON, every device of theirs. Never throws: a notification is never why an action fails. */
function pushTo_(personOrName, kind, title, body, link) {
  try {
    if (!PUSH_KINDS[kind] || !pushReady_()) return 0;
    const p = typeof personOrName === 'object' ? personOrName : findPerson(S(personOrName));
    if (!p) return 0;
    const t = read(TAB.push_tokens);
    const rows = pushRowsOf_(t, p.person_id);
    if (!rows.length || pushOffOf_(rows).indexOf(kind) !== -1) return 0;
    const access = pushAccessToken_();
    if (!access) return 0;
    const url = 'https://fcm.googleapis.com/v1/projects/' + encodeURIComponent(pushProps_().FCM_PROJECT_ID) + '/messages:send';
    const open = SITE_URL + (link ? '?push=' + encodeURIComponent(link) : '');
    let sent = 0;
    const dead = [];
    rows.forEach(r => {
      /* DATA ONLY: sw.js draws the notification itself, the same on every browser. */
      const msg = { message: { token: S(r.token),
        data: { title: S(title).slice(0, 80), body: S(body).slice(0, 180), url: open, tag: kind },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } } } };
      const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + access }, payload: JSON.stringify(msg) });
      const code = res.getResponseCode();
      if (code === 200) { sent++; return; }
      /* GONE FOR GOOD — uninstalled, permission withdrawn: FCM says UNREGISTERED (404) and the row goes. */
      const text = S(res.getContentText());
      if (code === 404 || /UNREGISTERED/.test(text)) dead.push(r);
    });
    dead.sort((a, b) => b._row - a._row).forEach(r => delRow(t, r));
    return sent;
  } catch (err) {
    return 0;
  }
}

/* THE CARD'S FOUR ACTIONS. `me` is the signed-in person (ACTION_ACCESS 'self'). */
function pushAction_(action, body) {
  const me = findPerson('', S(body.personId));
  if (!me) return { error: 'Sign in first.' };
  const t = read(TAB.push_tokens);
  const mine = () => pushRowsOf_(t, me.person_id);
  const state = () => {
    const rows = mine();
    const o = { success: true, ready: pushReady_(), devices: rows.length, off: pushOffOf_(rows),
                kinds: Object.keys(PUSH_KINDS).map(k => ({ kind: k, label: PUSH_KINDS[k] })) };
    /* ONLY AN ADMIN IS TOLD WHICH PROPERTIES ARE EMPTY — their names, never a value. */
    if (rankAtLeast_(me, 'admin')) o.missing = pushMissing_();
    return o;
  };
  if (action === 'pushState') return state();
  if (!t.sheet) return { error: 'The push_tokens tab is not there yet. Open the site once as an admin.' };
  const token = S(body.fcmToken).trim();
  if (action === 'pushSubscribe') {
    if (!pushReady_()) return { error: 'Notifications are not switched on yet.' };
    if (!token || token.length > 4096) return { error: 'No device token came with that.' };
    /* A TOKEN IS ONE DEVICE: if it was somebody else's (a shared tablet), it is this person's now. */
    t.rows.filter(r => S(r.token) === token).sort((a, b) => b._row - a._row).forEach(r => delRow(t, r));
    const rows = mine();
    if (rows.length >= PUSH_MAX_DEVICES) delRow(t, rows[0]);
    addRow(t, { token_id: 'PT' + Date.now(), person_id: S(me.person_id), token: token,
      device: S(body.device).slice(0, 120), off: pushOffOf_(rows).join(','), added_on: new Date() });
    return state();
  }
  if (action === 'pushUnsubscribe') {
    t.rows.filter(r => S(r.person_id) === S(me.person_id) && (!token || S(r.token) === token))
      .sort((a, b) => b._row - a._row).forEach(r => delRow(t, r));
    return state();
  }
  if (action === 'pushSet') {
    const kind = norm(body.kind);
    if (!PUSH_KINDS[kind]) return { error: 'There is no notification called "' + S(body.kind) + '".' };
    const off = pushOffOf_(mine()).filter(k => k !== kind);
    if (!TRUE_(body.on)) off.push(kind);
    mine().forEach(r => setCell(t, r, 'off', off.join(',')));
    return state();
  }
  return { error: 'Unknown action.' };
}
