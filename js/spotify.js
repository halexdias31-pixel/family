/* ---------- SPOTIFY (510): each person's OWN Spotify account, connected in this browser alone ---------- */
/* Authorization Code with PKCE: no client secret, no backend. Tokens never go to our server; docs/spotify.md has the owner's setup and the 25-user limit. */
const SP_API = 'https://api.spotify.com/v1';
const SP_AUTH = 'https://accounts.spotify.com/authorize';
const SP_TOKEN = 'https://accounts.spotify.com/api/token';
const SP_SCOPES = ['user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state', 'playlist-read-private'];
const SP = { token: '', exp: 0, now: null, lists: null, found: null, err: '', premium: '', busy: false };
const spClientId_ = () => String(brand('spotify_client_id', '') || '').trim();
/* THE REDIRECT the owner registers: this page plus ?spotify=cb — on the live site https://atfamily.co.uk/?spotify=cb. */
const spRedirect_ = () => location.origin + location.pathname + '?spotify=cb';

/* STORAGE: the access token for this tab (sessionStorage); the refresh token on this device (localStorage) so a phone stays connected — Disconnect forgets both. */
const spGet_ = (s, k) => { try { return window[s].getItem(k) || ''; } catch (e) { return ''; } };
const spSet_ = (s, k, v) => { try { v ? window[s].setItem(k, v) : window[s].removeItem(k); } catch (e) {} };
function spKeep_(t, secs, refresh) {
  SP.token = t || ''; SP.exp = t ? Date.now() + Math.max(60, (+secs || 3600) - 60) * 1000 : 0;
  spSet_('sessionStorage', 'spTok', t ? JSON.stringify({ t: SP.token, e: SP.exp }) : '');
  if (refresh !== undefined) spSet_('localStorage', 'spRefresh', refresh || '');
}
function spToken_() {
  if (SP.token && Date.now() < SP.exp) return SP.token;
  try { const s = JSON.parse(spGet_('sessionStorage', 'spTok') || 'null'); if (s && s.t && Date.now() < s.e) { SP.token = s.t; SP.exp = s.e; return s.t; } } catch (e) {}
  return '';
}
const spLinked_ = () => !!(spToken_() || spGet_('localStorage', 'spRefresh'));

/* PKCE: a random verifier, its SHA-256 as base64url is the challenge. */
const spB64_ = buf => btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function spRandom_(n) {
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  return spB64_(a.buffer).slice(0, n);
}
async function spChallenge_(v) { return spB64_(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))); }

async function spConnect_() {
  const cid = spClientId_();
  if (!cid) return;
  try {
    const v = spRandom_(64), state = spRandom_(16), ch = await spChallenge_(v);
    spSet_('sessionStorage', 'spPkce', JSON.stringify({ v, state, cid, back: spRedirect_() }));
    const q = new URLSearchParams({ client_id: cid, response_type: 'code', redirect_uri: spRedirect_(),
      code_challenge_method: 'S256', code_challenge: ch, state, scope: SP_SCOPES.join(' ') });
    spGo_(SP_AUTH + '?' + q.toString());
  } catch (e) { SP.err = 'This browser cannot connect to Spotify.'; spPaint_(); }
}
/* One seam for leaving the page, so a journey can catch the address instead of navigating. */
function spGo_(url) { location.assign(url); }

async function spTokenCall_(body) {
  const r = await fetch(SP_TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(j.error_description || j.error || ('HTTP ' + r.status));
  spKeep_(j.access_token, j.expires_in, j.refresh_token || spGet_('localStorage', 'spRefresh'));
  return j.access_token;
}

/* THE WAY BACK: ?spotify=cb&code=…&state=… is read as this file loads, the address cleaned at once, the swap done in the background — boot never waits on it. */
function spCallback_() {
  let q;
  try { q = new URLSearchParams(location.search); } catch (e) { return; }
  if (q.get('spotify') !== 'cb') return;
  try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  let pk = null;
  try { pk = JSON.parse(spGet_('sessionStorage', 'spPkce') || 'null'); } catch (e) {}
  spSet_('sessionStorage', 'spPkce', '');
  if (q.get('error')) { SP.err = q.get('error') === 'access_denied' ? 'You said no to Spotify — nothing was connected.' : 'Spotify did not connect.'; return; }
  if (!pk || !q.get('code') || q.get('state') !== pk.state) { SP.err = 'Spotify did not connect (the reply did not match). Try again.'; return; }
  SP.busy = true;
  spTokenCall_({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: pk.back, client_id: pk.cid, code_verifier: pk.v })
    .then(() => { SP.busy = false; SP.err = ''; spRefreshAll_(); try { if (typeof toast === 'function') toast('Spotify connected'); } catch (e) {} })
    .catch(() => { SP.busy = false; SP.err = 'Spotify did not connect. Try again.'; spPaint_(); });
}

/* EVERY CALL: a fresh token if the old one ran out; 403 PREMIUM_REQUIRED is remembered and said, not thrown. */
async function spFetch_(path, o) {
  let t = spToken_();
  if (!t) {
    const rt = spGet_('localStorage', 'spRefresh'), cid = spClientId_();
    if (!rt || !cid) throw new Error('not connected');
    try { t = await spTokenCall_({ grant_type: 'refresh_token', refresh_token: rt, client_id: cid }); }
    catch (e) { spKeep_('', 0, ''); throw new Error('not connected'); }
  }
  const r = await fetch(SP_API + path, Object.assign({}, o, { headers: { Authorization: 'Bearer ' + t } }));
  if (r.status === 204) return null;
  const j = await r.json().catch(() => null);
  if (r.status === 403 && j && j.error && /PREMIUM_REQUIRED/.test(String(j.error.reason || ''))) { SP.premium = 'Play, pause and skip need Spotify Premium — your account can still see what is playing and your playlists.'; return null; }
  if (r.status === 401) { spKeep_('', 0); }
  if (!r.ok) throw new Error((j && j.error && j.error.message) || ('HTTP ' + r.status));
  return j;
}

async function spRefreshAll_() {
  if (!spLinked_()) { spPaint_(); return; }
  try {
    const [now, lists] = await Promise.all([spFetch_('/me/player/currently-playing'), spFetch_('/me/playlists?limit=20')]);
    SP.now = now && now.item ? now : null;
    SP.lists = (lists && lists.items) || [];
  } catch (e) { if (!spLinked_()) SP.err = 'Spotify signed you out — connect again.'; }
  spPaint_();
}

async function spControl_(what) {
  const m = { play: ['PUT', '/me/player/play'], pause: ['PUT', '/me/player/pause'], next: ['POST', '/me/player/next'], prev: ['POST', '/me/player/previous'] }[what];
  if (!m) return;
  try { await spFetch_(m[1], { method: m[0] }); } catch (e) { SP.err = /NO_ACTIVE_DEVICE|404/.test(e.message) ? 'Open Spotify on a device first, then try again.' : 'Spotify did not do that.'; }
  setTimeout(spRefreshAll_, 400);
  spPaint_();
}

async function spSearch_() {
  const box = typeof $ === 'function' ? $('sp-q') : null, q = box ? String(box.value || '').trim() : '';
  if (!q) return;
  try {
    const j = await spFetch_('/search?type=track,playlist&limit=5&q=' + encodeURIComponent(q));
    SP.found = [].concat(((j && j.tracks && j.tracks.items) || []), ((j && j.playlists && j.playlists.items) || [])).filter(Boolean);
  } catch (e) { SP.found = []; SP.err = 'Search did not work.'; }
  spPaint_();
}

function spDisconnect_() {
  spKeep_('', 0, ''); spSet_('sessionStorage', 'spPkce', '');
  Object.assign(SP, { now: null, lists: null, found: null, err: '', premium: '', busy: false });
  spPaint_();
}

/* STUDY FOCUS: playlists you starred, on this device only. */
const spFocus_ = () => { try { return JSON.parse(spGet_('localStorage', 'spFocus') || '[]'); } catch (e) { return []; } };
function spFocusToggle_(id) {
  const f = spFocus_(), i = f.indexOf(id);
  i === -1 ? f.push(id) : f.splice(i, 1);
  spSet_('localStorage', 'spFocus', JSON.stringify(f)); spPaint_();
}

const spOpen_ = x => (x && x.external_urls && x.external_urls.spotify) || '';
function spLine_(x, star) {
  const who = x.type === 'track' ? (x.artists || []).map(a => a.name).join(', ') : x.type === 'playlist' ? 'Playlist' : '';
  const href = spOpen_(x);
  return `<div class="sp-line"><span class="sp-name">${esc(x.name || '')}${who ? ` <span class="faint">· ${esc(who)}</span>` : ''}</span>${
    star ? tile_({ icon: 'star', label: 'Study focus', act: 'sp-focus', data: { id: x.id }, pressed: spFocus_().indexOf(x.id) !== -1, on: spFocus_().indexOf(x.id) !== -1 }) : ''}${
    href ? tile_({ icon: 'open', label: 'Open in Spotify', href }) : ''}</div>`;
}

/* THE CARD: one line per thing, tiles under it (house style). */
function spCard_() {
  const row = h => `<p class="sub">${h}</p>`;
  let body;
  if (!spClientId_()) {
    body = row('Not switched on yet — the site\'s admin turns it on.')
      + (typeof isAdmin === 'function' && isAdmin() ? row('Admin: make a Spotify app and put its Client ID in the brand tab as <b>spotify_client_id</b>; the redirect URI is <code>' + esc(spRedirect_()) + '</code> (docs/spotify.md).') : '');
  } else if (SP.busy) {
    body = typeof loading_ === 'function' ? loading_() : '';
  } else if (!spLinked_()) {
    body = row('Connect your own Spotify account. It stays in this browser; we never see it.')
      + tileRow_(tile_({ icon: 'in', label: 'Connect', note: 'your Spotify account', act: 'sp-connect' }), '', true);
  } else {
    const it = SP.now && SP.now.item, img = it && it.album && (it.album.images || []).slice(-2)[0];
    const now = it ? `<div class="sp-now">${img ? `<img class="sp-art" src="${esc(img.url)}" alt="">` : ''}<div><p class="sp-title">${esc(it.name || '')}</p><p class="faint">${esc((it.artists || []).map(a => a.name).join(', '))}</p></div></div>`
      : row(SP.lists ? 'Nothing playing right now.' : '…');
    const playing = !!(SP.now && SP.now.is_playing);
    const ctl = tileRow_(tile_({ icon: 'left', label: 'Previous', act: 'sp-ctl', data: { c: 'prev' } })
      + tile_({ icon: playing ? 'pause' : 'play', label: playing ? 'Pause' : 'Play', act: 'sp-ctl', data: { c: playing ? 'pause' : 'play' } })
      + tile_({ icon: 'right', label: 'Next', act: 'sp-ctl', data: { c: 'next' } })
      + (it && spOpen_(it) ? tile_({ icon: 'open', label: 'Open in Spotify', href: spOpen_(it) }) : ''), '', true);
    const f = spFocus_(), lists = SP.lists || [];
    const focus = lists.filter(p => p && f.indexOf(p.id) !== -1);
    body = now + ctl + (SP.premium ? `<p class="faint sp-premium">${esc(SP.premium)}</p>` : '')
      + `<div class="sp-search"><input id="sp-q" class="sp-q" type="search" placeholder="Find a song or playlist" aria-label="Find on Spotify">${tile_({ icon: 'search', label: 'Search', act: 'sp-search' })}</div>`
      + (SP.found ? (SP.found.length ? SP.found.map(x => spLine_(x)).join('') : row('Nothing found.')) : '')
      + (focus.length ? `<p class="k">Study focus</p>` + focus.map(p => spLine_(p, true)).join('') : '')
      + (lists.length ? `<p class="k">Your playlists</p>` + lists.filter(Boolean).map(p => spLine_(p, true)).join('') : '')
      + tileRow_(tile_({ icon: 'sync', label: 'Refresh', act: 'sp-refresh' }) + tile_({ icon: 'out', label: 'Disconnect', act: 'sp-off' }), '', true);
  }
  return `<div class="sp-card">${body}${SP.err ? `<p class="faint sp-err">${esc(SP.err)}</p>` : ''}</div>`;
}
function spPaint_() { try { const el = typeof $ === 'function' && $('sp-box'); if (el) el.innerHTML = spCard_(); } catch (e) {} }
function initSpotify() { spPaint_(); if (spLinked_() && spClientId_()) spRefreshAll_(); }

on('sp-connect', () => spConnect_());
on('sp-ctl', el => spControl_(el.dataset.c));
on('sp-search', () => spSearch_());
on('sp-refresh', () => { SP.err = ''; spRefreshAll_(); });
on('sp-off', () => spDisconnect_());
on('sp-focus', el => spFocusToggle_(el.dataset.id));
try { document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'sp-q') { e.preventDefault(); spSearch_(); } }); } catch (e) {}
spCallback_();
