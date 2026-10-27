#!/usr/bin/env node
/* node js/check-push.js — PHONE NOTIFICATIONS (492) against the real backend, UrlFetchApp stubbed: no keys no-ops,
   recipient-only, per-kind off, UNREGISTERED dropped, no token in doGet. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const net = { calls: [], fcm: null };
const fetchStub = (url, opts) => {
  net.calls.push({ url: String(url), opts: opts || {} });
  if (/oauth2\.googleapis\.com\/token/.test(url)) return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ access_token: 'ya29.stub', expires_in: 3600 }) };
  const r = net.fcm ? net.fcm(url, opts) : { code: 200, text: '{"name":"projects/p/messages/1"}' };
  return { getResponseCode: () => r.code, getContentText: () => r.text };
};
const KEYS = { FCM_PROJECT_ID: 'fam-test', FCM_CLIENT_EMAIL: 'push@fam-test.iam.gserviceaccount.com', FCM_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nstub\\n-----END PRIVATE KEY-----\\n' };

function world(keys) {
  net.calls = []; net.fcm = null;
  const b = backend({ UrlFetchApp: { fetch: fetchStub } });
  b.ev('Utilities.computeRsaSha256Signature = (s, k) => (globalThis.__signedWith = k, [1, 2, 3])');
  if (keys) Object.assign(b.props, KEYS);
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-AD', first_name: 'Ada', last_name: 'Boss', handle: 'adaboss', email: 'ad@example.org', role: 'admin' }, base),
    Object.assign({ person_id: 'P-C1', first_name: 'Cy', last_name: 'Client', handle: 'cyclient', email: 'c1@example.org', role: 'client' }, base),
  ]);
  const tok = {};
  [['P-AD', 'ad@example.org'], ['P-C1', 'c1@example.org']].forEach(([pid, e]) => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[pid] = d.token;
  });
  const as = (pid, body) => b.post(Object.assign({ token: tok[pid], personId: pid }, body));
  const fcmCalls = () => net.calls.filter(c => /fcm\.googleapis\.com/.test(c.url));
  return { b, as, fcmCalls };
}
const msg = (w, from, toId) => w.as(from, { action: 'sendMessage', toId, body: 'Hello there' });

/* NO KEYS: the state says not ready, an admin is told which properties, a client is not; subscribe refused; a message sends nothing. */
{
  const w = world(false);
  const st = w.as('P-C1', { action: 'pushState' });
  if (!st.success || st.ready !== false) bad.push('with no keys pushState said ' + JSON.stringify(st));
  if (st.missing) bad.push('a client was told which Script Properties are missing');
  const ad = w.as('P-AD', { action: 'pushState' });
  if (!ad.missing || ad.missing.join() !== 'FCM_PROJECT_ID,FCM_CLIENT_EMAIL,FCM_PRIVATE_KEY') bad.push('an admin was not told the missing properties: ' + JSON.stringify(ad));
  const sub = w.as('P-C1', { action: 'pushSubscribe', fcmToken: 'tok-c1' });
  if (sub.success) bad.push('with no keys a subscribe was accepted');
  const m = msg(w, 'P-AD', 'P-C1');
  if (!m.success) bad.push('with no keys the message itself failed: ' + JSON.stringify(m));
  if (net.calls.length) bad.push('with no keys the backend went to the network ' + net.calls.length + ' time(s)');
}

/* KEYS: subscribe stores the token per person, a message goes to the recipient's devices only, with the thread link. */
{
  const w = world(true);
  const s1 = w.as('P-C1', { action: 'pushSubscribe', fcmToken: 'tok-c1-phone', device: 'iPhone' });
  const s2 = w.as('P-C1', { action: 'pushSubscribe', fcmToken: 'tok-c1-laptop' });
  w.as('P-AD', { action: 'pushSubscribe', fcmToken: 'tok-ad' });
  if (!s1.success || s2.devices !== 2 || !s2.ready) bad.push('two devices were not both kept: ' + JSON.stringify(s2));
  const rows = w.b.tabs.push_tokens;
  if (!rows || rows.length !== 4) bad.push('push_tokens holds ' + (rows ? rows.length - 1 : 'no tab') + ' rows, not 3');
  const m = msg(w, 'P-AD', 'P-C1');
  if (!m.success) bad.push('the message failed: ' + JSON.stringify(m));
  const sent = w.fcmCalls().map(c => JSON.parse(c.opts.payload).message);
  const to = sent.map(x => x.token).sort().join();
  if (to !== 'tok-c1-laptop,tok-c1-phone') bad.push('a message was pushed to ' + to + ', not the recipient\'s two devices');
  if (sent[0] && !/\?push=dm%3AP-AD$/.test(sent[0].data.url)) bad.push('the link does not open the thread: ' + sent[0].data.url);
  if (sent[0] && !/Ada/.test(sent[0].data.title)) bad.push('the title does not name the sender: ' + sent[0].data.title);
  const c = w.fcmCalls()[0];
  if (c && (!/projects\/fam-test\/messages:send$/.test(c.url) || c.opts.headers.Authorization !== 'Bearer ya29.stub')) bad.push('not FCM HTTP v1 with the minted token: ' + c.url);
  if (w.b.ev('globalThis.__signedWith') !== '-----BEGIN PRIVATE KEY-----\nstub\n-----END PRIVATE KEY-----\n') bad.push('the private key was not unescaped before signing');
  const oauth = net.calls.filter(x => /oauth2/.test(x.url)).length;
  if (oauth !== 1) bad.push('the OAuth token was minted ' + oauth + ' times for one message');

  /* TURNED OFF: no push of that kind. */
  const off = w.as('P-C1', { action: 'pushSet', kind: 'messages', on: false });
  if (!off.success || off.off.indexOf('messages') === -1) bad.push('turning Messages off said ' + JSON.stringify(off));
  net.calls = [];
  const n = w.b.ev('pushTo_("P-C1", "messages", "t", "b", "dm:P-AD")');
  if (n || w.fcmCalls().length) bad.push('a message kind turned off was still sent');
  w.as('P-C1', { action: 'pushSet', kind: 'messages', on: true });

  /* UNREGISTERED: that device's row goes, the other stays. */
  net.fcm = (u, o) => (JSON.parse(o.payload).message.token === 'tok-c1-phone'
    ? { code: 404, text: '{"error":{"status":"NOT_FOUND","details":[{"errorCode":"UNREGISTERED"}]}}' } : { code: 200, text: '{}' });
  const n2 = w.b.ev('pushTo_(findPerson("", "P-C1"), "messages", "t", "b", "")');
  if (n2 !== 1) bad.push('with one dead device ' + n2 + ' were sent, not 1');
  const left = w.as('P-C1', { action: 'pushState' });
  if (left.devices !== 1) bad.push('an UNREGISTERED device was not dropped: ' + left.devices + ' left');

  /* TURN OFF deletes this device's token only. */
  const un = w.as('P-C1', { action: 'pushUnsubscribe', fcmToken: 'tok-c1-laptop' });
  if (un.devices !== 0) bad.push('Turn off left ' + un.devices + ' device(s)');
  if (w.as('P-AD', { action: 'pushState' }).devices !== 1) bad.push('Turn off by one person removed another\'s device');

  /* doGet SENDS NO TOKEN. */
  const g = JSON.stringify(w.b.ev('JSON.parse(doGet({ parameter: {} }).getContent())'));
  if (/tok-ad|push_tokens/.test(g)) bad.push('doGet sent a push token');
}

/* SIGNED OUT: refused. */
{
  const w = world(true);
  const d = w.b.post({ action: 'pushSubscribe', fcmToken: 'x', personId: 'P-C1' });
  if (d.success) bad.push('a subscribe with no token was accepted');
}

if (bad.length) { console.log('FAILED — phone notifications:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — phone notifications (492): no keys no-ops and tells only an admin; subscribe, per-kind off, recipient-only, UNREGISTERED dropped, Turn off, nothing in doGet.');
