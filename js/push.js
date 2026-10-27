/* ---------- PHONE NOTIFICATIONS (492): opt in once on Student settings; Firebase Cloud Messaging, free. docs/push-notifications.md ---------- */
/* Firebase's scripts load only when Turn on is tapped. Pinned, from Google's own CDN — the one place the FCM web SDK is published. */
const PUSH_SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const PUSH = { state: null, asked: false, busy: false, err: '', sdk: null };

/* THE PUBLIC WEB CONFIG (apiKey, projectId, messagingSenderId, appId, vapidKey) — not a secret; brand `fcm_web_config`, JSON. */
function pushWebConfig_() {
  try {
    const raw = brand('fcm_web_config', '');
    const c = typeof raw === 'object' ? raw : JSON.parse(String(raw || '').trim() || 'null');
    return c && c.apiKey && c.projectId && c.messagingSenderId && c.appId && c.vapidKey ? c : null;
  } catch (e) { return null; }
}
/* AN IPHONE IN SAFARI CAN ONLY BE TOLD OF THINGS ONCE THE SITE IS ON ITS HOME SCREEN (iOS 16.4+). */
const pushIos_ = () => /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const pushStandalone_ = () => navigator.standalone === true || (!!window.matchMedia && matchMedia('(display-mode: standalone)').matches);
const pushCan_ = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
const pushTokenHere_ = () => { try { return localStorage.getItem('pushToken') || ''; } catch (e) { return ''; } };
const pushKeep_ = t => { try { t ? localStorage.setItem('pushToken', t) : localStorage.removeItem('pushToken'); } catch (e) {} };

function pushPaint_() {
  try { markStale_('account'); if (typeof AT !== 'undefined' && AT === 'account') paint('account'); } catch (e) {}
}
function pushAsk_(body) {
  return send_(Object.assign({ name: USER.name, personId: USER.personId || '' }, body))
    .then(d => { PUSH.state = d; PUSH.err = ''; return d; });
}
/* ONCE A VISIT, on the first draw while signed in: whether the backend has its keys, and this person's choices. */
function pushLoad_() {
  if (PUSH.asked || !USER) return;
  PUSH.asked = true;
  pushAsk_({ action: 'pushState' }).catch(e => { PUSH.err = (e && e.message) || ''; }).then(pushPaint_);
}

function pushScript_(src) {
  return new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = () => ok(); s.onerror = () => no(new Error('Firebase could not load.'));
    document.head.appendChild(s);
  });
}
function pushSdk_() {
  if (window.firebase && window.firebase.messaging) return Promise.resolve();
  if (!PUSH.sdk) PUSH.sdk = pushScript_(PUSH_SDK + 'firebase-app-compat.js')
    .then(() => pushScript_(PUSH_SDK + 'firebase-messaging-compat.js'))
    .catch(e => { PUSH.sdk = null; throw e; });
  return PUSH.sdk;
}

async function pushOn_() {
  const cfg = pushWebConfig_();
  if (!cfg || PUSH.busy) return;
  PUSH.busy = true; PUSH.err = ''; pushPaint_();
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error(perm === 'denied' ? 'Notifications are blocked for this site — allow them in the browser\'s settings.' : 'Not turned on.');
    /* OUR OWN sw.js, so Firebase does not register a second worker of its own. */
    const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }));
    await pushSdk_();
    if (!window.firebase.apps.length) window.firebase.initializeApp(cfg);
    const token = await window.firebase.messaging().getToken({ vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
    if (!token) throw new Error('This browser gave no address to send to.');
    await pushAsk_({ action: 'pushSubscribe', fcmToken: token, device: pushIos_() ? 'iPhone' : String(navigator.platform || 'browser').slice(0, 60) });
    pushKeep_(token);
  } catch (e) { if (!e.handled) PUSH.err = (e && e.message) || 'Not turned on.'; }
  PUSH.busy = false; pushPaint_();
}
async function pushOff_() {
  if (PUSH.busy) return;
  PUSH.busy = true; PUSH.err = ''; pushPaint_();
  const token = pushTokenHere_();
  try {
    await pushAsk_({ action: 'pushUnsubscribe', fcmToken: token });
    pushKeep_('');
    try { if (token && window.firebase && window.firebase.apps.length) await window.firebase.messaging().deleteToken(); } catch (e) {}
  } catch (e) { if (!e.handled) PUSH.err = (e && e.message) || 'Not turned off.'; }
  PUSH.busy = false; pushPaint_();
}

/* THE CARD: one line saying what it is, then the tile, or the one thing to do first. */
function pushCard_() {
  if (typeof USER === 'undefined' || !USER) return '';
  pushLoad_();
  const row = h => `<p class="sub">${h}</p>`;
  const S0 = PUSH.state, admin = typeof rankAtLeast_ === 'function' && rankAtLeast_('admin');
  /* THE ONE LINE SAYING WHAT IT IS is the card's `say` below, drawn by the layout. */
  let body = '';
  if (!S0 && !PUSH.err) body += loading_();
  else if (!pushWebConfig_() || !S0 || !S0.ready) {
    body += row('Not switched on yet — the site\'s admin turns it on.');
    if (admin) {
      const miss = (S0 && S0.missing) || [];
      body += row('Admin: ' + [!pushWebConfig_() ? 'put the web config in the brand tab as <b>fcm_web_config</b>' : '',
        miss.length ? 'fill Script Properties ' + miss.map(k => '<b>' + esc(k) + '</b>').join(', ') : ''].filter(Boolean).join('; ') + ' (docs/push-notifications.md).');
    }
  } else if (pushIos_() && !pushStandalone_()) {
    body += row('On iPhone: in Safari tap Share, then <b>Add to Home Screen</b>, open @family. from that icon and come back here.');
  } else if (!pushCan_()) {
    body += row('This browser cannot show notifications.');
  } else if (!pushTokenHere_()) {
    body += tileRow_(tile_({ icon: 'spark', label: 'Turn on', note: 'on this device', act: 'push-on' }), '', true);
    if (S0.devices) body += row('On for ' + S0.devices + ' other device' + (S0.devices === 1 ? '' : 's') + '.');
  } else {
    const off = S0.off || [];
    /* THE EMAIL CARD'S OWN ROW (`notify-pick`), so a choice looks the same wherever it is made. */
    body += (S0.kinds || []).map(k => `<label class="check role-pick notify-pick push-pick">
      <input type="checkbox" data-push-kind="${esc(k.kind)}"${off.indexOf(k.kind) === -1 ? ' checked' : ''}${PUSH.busy ? ' disabled' : ''}>
      <span class="box"></span><span class="role-pick-say"><b>${esc(k.label)}</b></span></label>`).join('')
      + tileRow_(tile_({ icon: 'mute', label: 'Turn off', note: 'on this device', act: 'push-off' }), '', true);
  }
  if (PUSH.busy) body += loading_();
  return `<div class="card push-card"><h3>Notifications</h3>${body}${PUSH.err ? `<p class="faint push-err">${esc(PUSH.err)}</p>` : ''}</div>`;
}
on('push-on', () => pushOn_());
on('push-off', () => pushOff_());
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-push-kind]');
  if (!el || PUSH.busy) return;
  PUSH.busy = true;
  pushAsk_({ action: 'pushSet', kind: el.dataset.pushKind, on: el.checked })
    .catch(err => { if (!err.handled) PUSH.err = err.message; })
    .then(() => { PUSH.busy = false; pushPaint_(); });
});
try { CARD_REG.push({ id: 'acct:push', col: 'account', label: 'Notifications', re: /^<div class="card push-card/, say: 'Lock-screen notes, like texts, for messages and bookings.' }); } catch (e) {}

/* ---------- A TAPPED NOTIFICATION: `?push=dm:<id>|job:<id>|post:<id>` on arrival, or a word from sw.js to a window already open. */
let PUSH_LANDED = false;
function pushGo_(what) {
  const m = /^(dm|job|post):(.*)$/.exec(String(what || ''));
  if (!m) return;
  try {
    if (m[1] === 'job' && typeof openJob_ === 'function') openJob_(m[2]);
    else if (m[1] === 'post' && typeof postGo_ === 'function') postGo_(m[2]);
    else go('dm');
  } catch (e) {}
}
function pushLanding_() {
  if (PUSH_LANDED) return;
  PUSH_LANDED = true;
  let w = '';
  try { w = new URLSearchParams(location.search).get('push') || ''; } catch (e) {}
  if (!w) return;
  try { const q = new URLSearchParams(location.search); q.delete('push'); history.replaceState(null, '', location.pathname + (String(q) ? '?' + q : '') + location.hash); } catch (e) {}
  pushGo_(w);
}
try {
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => {
    const u = e.data && e.data.pushOpen;
    if (!u) return;
    try { pushGo_(new URL(u, location.href).searchParams.get('push')); } catch (err) {}
  });
} catch (e) {}
