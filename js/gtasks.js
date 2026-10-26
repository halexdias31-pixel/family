/* ---------- GOOGLE TASKS (475): your own sessions and exam dates, copied into your own Google Tasks ---------- */
/* No backend: Google's token client in this browser, the token in memory and this tab only, never sent to us. One way, site → Google. */
const GT_SCOPE = 'https://www.googleapis.com/auth/tasks';
const GT_API = 'https://tasks.googleapis.com/tasks/v1';
const GT_LIST = '@family.';
const GT = { token: '', exp: 0, busy: false, err: '', last: '', client: null, gsi: null };
/* THE SITE'S ONE OAUTH CLIENT ID — public, not a secret; the same one Google sign-in uses (config), else the brand tab. */
const gtClientId_ = () => String((DATA && DATA.googleClientId) || brand('google_client_id', '') || '').trim();

/* THE TOKEN LIVES FOR THE TAB (sessionStorage) and no longer; a blocked storage leaves it in memory alone. */
function gtToken_() {
  if (GT.token && Date.now() < GT.exp) return GT.token;
  try {
    const s = JSON.parse(sessionStorage.getItem('gtasksTok') || 'null');
    if (s && s.t && Date.now() < s.e) { GT.token = s.t; GT.exp = s.e; return s.t; }
  } catch (e) {}
  return '';
}
function gtKeep_(t, secs) {
  GT.token = t || ''; GT.exp = t ? Date.now() + Math.max(60, (+secs || 3600) - 60) * 1000 : 0;
  try { t ? sessionStorage.setItem('gtasksTok', JSON.stringify({ t: GT.token, e: GT.exp })) : sessionStorage.removeItem('gtasksTok'); } catch (e) {}
}
const gtLast_ = () => { if (GT.last) return GT.last; try { return localStorage.getItem('gtasksLast') || ''; } catch (e) { return ''; } };

/* WHAT GOES ACROSS: the next four weeks of your sessions (`myJobs_`) and your exam dates. `key` is our id, kept in the task's notes. */
function gtItems_() {
  const out = [], link = location.origin + location.pathname;
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  try {
    (typeof myJobs_ === 'function' ? myJobs_() : []).forEach(j => {
      if (/cancel/i.test(String(j.status || '')) || typeof jobOn_ !== 'function') return;
      const id = String(j.id || j.jobId || [j.subject, j.client, j.time].join('-'));
      for (let i = 0; i <= 28; i++) {
        const d = new Date(t0.getTime()); d.setDate(d.getDate() + i);
        let on = false;
        try { on = jobOn_(j, d); } catch (e) { on = false; }
        if (!on) continue;
        const what = [j.subject, j.level].filter(Boolean).join(' · ') || 'Session';
        out.push({ key: 'job:' + id + ':' + ymd(d), title: what + (j.time ? ' · ' + j.time : ''), due: ymd(d),
          notes: [j.tutor ? 'With ' + j.tutor : '', 'Booking: ' + link + '#booking'].filter(Boolean).join('\n') });
      }
    });
  } catch (e) {}
  try {
    (typeof progressCountdownRows_ === 'function' ? progressCountdownRows_() : []).forEach(([name, days]) => {
      if (!/exam/i.test(String(name))) return;
      const d = new Date(t0.getTime()); d.setDate(d.getDate() + (+days || 0));
      out.push({ key: 'exam:' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: String(name), due: ymd(d), notes: 'Progress: ' + link + '#account' });
    });
  } catch (e) {}
  return out;
}
const gtMark_ = k => '[family:' + k + ']';
const gtKeyOf_ = notes => ((/\[family:([^\]]+)\]/.exec(String(notes || '')) || [])[1]) || '';

async function gtCall_(path, opt) {
  const o = opt || {};
  const r = await fetch(GT_API + path, { method: o.method || 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + gtToken_() }, o.body ? { 'Content-Type': 'application/json' } : {}),
    body: o.body ? JSON.stringify(o.body) : undefined });
  if (r.status === 401) { gtKeep_(''); throw new Error('Google asked you to connect again.'); }
  if (!r.ok) throw new Error('Google Tasks said ' + r.status + '.');
  return r.status === 204 ? {} : r.json();
}
/* IDEMPOTENT: our key in each task's notes, so a second sync updates the same task and never makes another; a tick in Google is left alone. */
async function gtSync_() {
  if (GT.busy || !gtToken_()) return;
  GT.busy = true; GT.err = ''; gtPaint_();
  try {
    const lists = (await gtCall_('/users/@me/lists?maxResults=100')).items || [];
    let list = lists.find(l => l.title === GT_LIST);
    if (!list) list = await gtCall_('/users/@me/lists', { method: 'POST', body: { title: GT_LIST } });
    const have = {};
    let page = '';
    do {
      const r = await gtCall_('/lists/' + encodeURIComponent(list.id) + '/tasks?showCompleted=true&showHidden=true&maxResults=100' + (page ? '&pageToken=' + encodeURIComponent(page) : ''));
      (r.items || []).forEach(t => { const k = gtKeyOf_(t.notes); if (k) have[k] = t; });
      page = r.nextPageToken || '';
    } while (page);
    let made = 0, kept = 0, done = 0;
    for (const it of gtItems_()) {
      const body = { title: it.title, notes: it.notes + '\n' + gtMark_(it.key), due: it.due + 'T00:00:00.000Z' };
      const t = have[it.key];
      if (t) { if (t.status === 'completed') done++; await gtCall_('/lists/' + encodeURIComponent(list.id) + '/tasks/' + encodeURIComponent(t.id), { method: 'PATCH', body }); kept++; }
      else { await gtCall_('/lists/' + encodeURIComponent(list.id) + '/tasks', { method: 'POST', body }); made++; }
    }
    const at = new Date().toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    GT.last = 'Synced ' + at + ' · ' + (made + kept) + ' tasks' + (made ? ', ' + made + ' new' : '') + (done ? ', ' + done + ' ticked off in Google' : '');
    try { localStorage.setItem('gtasksLast', GT.last); } catch (e) {}
  } catch (e) { GT.err = (e && e.message) || 'Sync failed.'; }
  GT.busy = false; gtPaint_();
}

/* GOOGLE'S SCRIPT ONLY WHEN CONNECT IS TAPPED; sign-in may have loaded it already. */
function gtGsi_() {
  if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
  if (GT.gsi) return GT.gsi;
  GT.gsi = new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => ok(); s.onerror = () => { GT.gsi = null; no(new Error('Google could not load.')); };
    document.head.appendChild(s);
  });
  return GT.gsi;
}
async function gtConnect_() {
  const id = gtClientId_();
  if (!id) return;
  GT.err = '';
  try { await gtGsi_(); } catch (e) { GT.err = e.message; gtPaint_(); return; }
  try {
    GT.client = google.accounts.oauth2.initTokenClient({ client_id: id, scope: GT_SCOPE,
      callback: r => {
        if (!r || r.error || !r.access_token) { GT.err = 'Google did not connect.'; gtPaint_(); return; }
        gtKeep_(r.access_token, r.expires_in); gtSync_();
      },
      error_callback: () => { GT.err = 'Google did not connect.'; gtPaint_(); } });
    GT.client.requestAccessToken();
  } catch (e) { GT.err = 'Google did not connect.'; gtPaint_(); }
}
function gtDisconnect_() {
  const t = gtToken_();
  try { if (t && window.google && google.accounts && google.accounts.oauth2) google.accounts.oauth2.revoke(t, () => {}); } catch (e) {}
  gtKeep_(''); GT.last = ''; GT.err = '';
  try { localStorage.removeItem('gtasksLast'); } catch (e) {}
  gtPaint_();
}

/* THE CARD: one line per thing, tiles under it. */
function gtasksCard_() {
  if (typeof USER === 'undefined' || !USER) return '';
  const row = h => `<p class="sub">${h}</p>`;
  let body;
  if (!gtClientId_()) {
    body = row('Not switched on yet — the site\'s admin turns it on.')
      + (typeof rankAtLeast_ === 'function' && rankAtLeast_('admin') ? row('Admin: put the OAuth Client ID in the brand tab as <b>google_client_id</b> (docs/google-tasks.md).') : '');
  } else if (!gtToken_()) {
    body = tileRow_(tile_({ icon: 'in', label: 'Connect', note: 'your Google account', act: 'gtasks-connect' }), '', true);
  } else {
    body = row(GT.busy ? 'Syncing…' : esc(gtLast_() || 'Connected. Not synced yet.'))
      + row('One way: changes here reach Google; a tick in Google stays in Google.')
      + tileRow_(tile_({ icon: 'sync', label: 'Sync now', act: 'gtasks-sync' }) + tile_({ icon: 'out', label: 'Disconnect', act: 'gtasks-off' }), '', true);
  }
  return `<div class="card gtasks-card"><h3>Google Tasks</h3>${body}${GT.err ? `<p class="faint gtasks-err">${esc(GT.err)}</p>` : ''}</div>`;
}
/* A REDRAW, not an in-place swap, so the layout's what-it-is-for line and admin row stay with the card. */
function gtPaint_() { try { if (typeof repaint === 'function') repaint(true); } catch (e) {} }
on('gtasks-connect', () => gtConnect_());
on('gtasks-sync', () => gtSync_());
on('gtasks-off', () => gtDisconnect_());
try { CARD_REG.push({ id: 'acct:gtasks', col: 'account', label: 'Google Tasks', re: /^<div class="card gtasks-card/, say: 'Copy your sessions and exam dates into your own Google Tasks.' }); } catch (e) {}
