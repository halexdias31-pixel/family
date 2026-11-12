/* @family. — offline.js A PAPER ON THE DEVICE (owner, 11 Nov): its words in the library's own copy (library.js), the app in the worker's store (sw.js). */
/* Every press is the queue submit.js already keeps; an AI part waits here for a connection. Nothing of this outlives sign-out (`keptForget_`, `libDiskClear_`). */

const OFF_CACHE = 'family-offline';
/* HOW LONG A DOWNLOAD WAITS FOR ITS WORDS, and how often a waiting AI part looks for its card once online. */
const OFF_WAIT_MS = 60000, OFF_AI_EVERY_MS = 10000;
const OFF_BUSY = new Set();

/* ---------- THE THREE RECORDS, in the kept store under the signed-in person: papers, AI parts waiting, the last sync. */
const offKey_ = what => KEPT_PREFIX + payloadFor_().who + ':offline:' + what;
const offRead_ = what => (payloadFor_().who && keptGet_(offKey_(what), true)) || {};
function offWrite_(what, o) { if (payloadFor_().who) keptPut_(offKey_(what), JSON.stringify(o || {})); }
const offIsOff_ = () => typeof navigator !== 'undefined' && navigator.onLine === false;

/* ---------- A PAPER'S QUESTIONS AND THE WIRE IDS OF EVERY ROW THAT HAS WORDS, read off Find's own list. */
function offPaperItems_(pid) {
  try { return stuffItemsAll_().filter(x => isQ_(x) && String(paperIdOf_(x.row || x)) === String(pid)); } catch (e) { return []; }
}
const offWireIds_ = pid => [...new Set([].concat(...offPaperItems_(pid).map(x => libIdsFor_(x, true))))];
const offName_ = (pid, items) => { const r = ((items || offPaperItems_(pid))[0] || {}).row || {}; return String(r.name || r.paper || pid); };
/* EVERY ID A DOWNLOADED PAPER HOLDS: the library's copy never lets these go to make room (`libDiskPut_`). */
function offPinned_() {
  const s = new Set();
  try { Object.values(offRead_('papers')).forEach(p => (p.ids || []).forEach(t => s.add(t))); } catch (e) { s.clear(); }
  return s;
}
const offHas_ = pid => !!(offRead_('papers')[pid] || {}).at;

/* ---------- THE ONE TILE, on every question part's row behind ⋯ (qtools.js QT_TILE.offline). */
function offTileOpts_(x) {
  const pid = x && String(paperIdOf_(x.row || x) || '');
  if (!pid || typeof USER === 'undefined' || !USER || !USER.token) return null;
  const busy = OFF_BUSY.has(pid), has = offHas_(pid);
  return { icon: has ? 'tick' : 'down', label: busy ? 'Downloading…' : has ? 'Available offline' : 'Make available offline',
    note: has ? 'tap to remove from this device' : 'this paper, on this device', act: 'offline-get', cls: 'qt-t off-get', on: has, pressed: has, off: busy, data: { pid } };
}
function offTilePaint_(pid) {
  document.querySelectorAll('.off-get[data-pid="' + CSS.escape(pid) + '"]').forEach(el => {
    const o = offTileOpts_({ row: { paper_id: pid } });
    if (o) tileSet_(el, o);
  });
  offFrontPaint_();
}
on('offline-get', el => {
  const pid = el.getAttribute('data-pid') || '';
  if (!pid || OFF_BUSY.has(pid)) return;
  if (offHas_(pid)) offDrop_(pid); else offGet_(pid);
});

/* ---------- DOWNLOAD: pin the ids, ask for the missing words, keep the app and the figures, then say so. */
async function offGet_(pid) {
  if (offIsOff_()) { toast('No connection — make it available offline when you are back online.'); return false; }
  OFF_BUSY.add(pid); offTilePaint_(pid);
  let ok = false;
  try {
    const items = offPaperItems_(pid), ids = offWireIds_(pid);
    const papers = offRead_('papers');
    papers[pid] = { at: 0, ids, name: offName_(pid, items) };
    offWrite_('papers', papers);
    if (!LIB.disk) await (LIB.diskP || (LIB.diskP = libDiskLoad_()));
    libAsk_(ids.filter(t => !LIB.disk.has(t)));
    const t0 = Date.now();
    const settled = () => ids.every(t => (LIB.disk && LIB.disk.has(t)) || LIB.gone.has(t) || LIB.refused.has(t));
    while (!settled() && !LIB.failed && Date.now() - t0 < OFF_WAIT_MS) await new Promise(r => setTimeout(r, 200));
    if (!settled()) throw new Error(LIB.failed || 'the words did not all come');
    await offShell_(items);
    const now = offRead_('papers');
    now[pid] = Object.assign({}, papers[pid], { at: Date.now() });
    offWrite_('papers', now);
    ok = true;
    toast('Available offline: ' + papers[pid].name);
  } catch (e) {
    const p = offRead_('papers'); delete p[pid]; offWrite_('papers', p);
    toast('Not downloaded — ' + why_(e));
  }
  OFF_BUSY.delete(pid); offTilePaint_(pid);
  return ok;
}
/* SIGN-OUT: the worker's store goes too (me-account.js), so nothing is kept for the next person. */
function offForget_() {
  if (typeof caches !== 'undefined') caches.delete(OFF_CACHE).catch(() => false);
}
function offDrop_(pid) {
  const p = offRead_('papers'); delete p[pid]; offWrite_('papers', p);
  offTilePaint_(pid);
}

/* ---------- THE APP'S OWN FILES, kept by the worker: every code file of this build, what this visit loaded, and the paper's figures. */
function swReg_() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.getRegistration().then(r => r || navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }));
}
async function offShell_(items) {
  if (typeof caches === 'undefined') return;
  await swReg_().catch(() => null);
  const t = deployStamp_(), urls = new Set(['index.html', 'style.css' + t, 'fonts/family-code.woff2', 'icon.png', 'favicon.png', 'manifest.webmanifest']);
  (window.FILES || []).filter(f => (window.OFF || []).indexOf(f) === -1).forEach(f => urls.add('js/' + f + '.js' + t));
  /* THE BUILD'S BUNDLES TOO (1211): an offline open asks for these, not js/, unless the page was opened with ?nobundle. */
  ['first', 'later', 'lazy'].forEach(b => urls.add('bundle/' + b + '.js' + t));
  try { performance.getEntriesByType('resource').forEach(e => { const u = new URL(e.name); if (u.origin === location.origin && u.pathname.indexOf('/sw.js') === -1) urls.add(u.pathname.replace(/^\//, '') + u.search); }); } catch (e) { oops_(e, 'offline:timings'); }
  (items || []).forEach(x => [x.row].concat(x.stems || [], (questionParts_()[qId_(x)] || [])).forEach(r => { const h = libS(r && (r.row || r).diagram_twin).trim(); if (/^[0-9a-f]{12}$/.test(h)) urls.add('data/diagrams/' + h + '.png'); }));
  const c = await caches.open(OFF_CACHE);
  await Promise.all([...urls].map(u => fetch(u, { cache: 'no-cache' }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null)));
  if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
}

/* ---------- AN AI PART PRESSED WITH NO CONNECTION: the press is queued now, the mark is asked once online. */
function offAiHold_(k, answer, out) {
  if (!offIsOff_()) return false;
  const w = offRead_('ai');
  w[k] = { a: answer, at: Date.now() };
  offWrite_('ai', w);
  try { subRecord_(k, answer, 'sent'); } catch (e) { oops_(e, 'offline:aiHold'); }
  if (out) out.textContent = 'Will mark when online';
  offAiWatch_();
  offFrontPaint_();
  return true;
}
/* ONCE ONLINE, each waiting part on the glass is pressed again for real; one not drawn waits for its card. */
function offAiFlush_() {
  if (offIsOff_()) return;
  const w = offRead_('ai');
  let moved = false;
  Object.keys(w).forEach(k => {
    const inp = [...document.querySelectorAll('.qp-multi-val, .qp-ans-in')].find(i => i.getAttribute('data-k') === k);
    const card = inp && inp.closest('.qcard'), btn = card && card.querySelector('[data-do="qp-ai"]');
    if (!btn || btn.disabled) return;
    if (inp.value !== w[k].a) { delete w[k]; moved = true; return; }
    delete w[k]; moved = true;
    if (typeof ACTIONS === 'object' && ACTIONS['qp-ai']) ACTIONS['qp-ai'](btn); else btn.click();
  });
  if (moved) { offWrite_('ai', w); offFrontPaint_(); }
}

/* ---------- WHAT IS ON THE DEVICE AND WHAT IS STILL TO GO, one line. */
function offSynced_(who) {
  if (typeof USER === 'undefined' || !USER || 'u:' + String(USER.personId) !== who) return;
  offWrite_('synced', { at: Date.now() });
}
function offSyncLine_() {
  if (typeof USER === 'undefined' || !USER || !USER.personId) return '';
  let n = 0;
  try { n = subQueue_('u:' + USER.personId).length + Object.keys(offRead_('ai')).length; } catch (e) { n = 0; }
  const at = offRead_('synced').at;
  const last = at ? 'Last synced ' + ago(at) : 'Not synced yet';
  return (offIsOff_() ? 'Offline · ' : '') + last + (n ? ' · ' + n + ' waiting to sync' : '');
}
function offFrontPaint_() {
  const line = offSyncLine_();
  document.querySelectorAll('.off-sync').forEach(el => { el.textContent = line; });
  if (typeof STALE !== 'undefined' && typeof FINDER !== 'undefined' && FINDER) STALE[FINDER.id] = 1;
}

/* ---------- FIND'S FRONT CARD: the papers on this device, each one tap from its questions, and the sync line. */
function offlinePages_() {
  if (typeof USER === 'undefined' || !USER || !USER.personId) return [];
  const papers = offRead_('papers'), ids = Object.keys(papers).filter(id => papers[id].at);
  const line = offSyncLine_();
  if (!ids.length && !/waiting/.test(line)) return [];
  const rows = ids.map(id => `<li><span class="bundle-name">${esc(papers[id].name || id)}</span>${
    tile_({ icon: 'open', label: 'Open', note: papers[id].name || id, act: 'offline-open', data: { pid: id } })}</li>`).join('');
  const lines = `<p class="off-sync">${esc(line)}</p>` + (rows ? `<ol class="bundle-list">${rows}</ol>` : '');
  const x = { kind: 'offline', name: 'On this device', key: 'offline:' + ids.join(',') };
  return [findCard(Object.assign(x, { kcOwn: { cls: 'offline', attrs: '', pic: '', head: '<h3>On this device</h3>', tags: '<div class="qtags qcard-tags"></div>', lines } }))];
}
on('offline-open', el => {
  const pid = el.getAttribute('data-pid') || '';
  if (pid) finderSet_(FINDERS.stuff, { filters: [{ field: 'paperId', value: pid }], show: true });
});

/* ---------- BACK ONLINE: the queue goes up (idempotent by event id, submit.js), AI parts are marked, the line is redrawn. */
function offOnline_() {
  try { if (typeof subPush_ === 'function') subPush_(true); } catch (e) { oops_(e, 'offline:online'); }
  offAiFlush_();
  offFrontPaint_();
}
addEventListener('online', offOnline_);
addEventListener('offline', offFrontPaint_);
/* A TIMER ONLY WHILE AN AI PART WAITS: it looks for the part's card every few seconds and stops when none is left. */
let OFF_AI_TIMER = 0;
function offAiWatch_() {
  if (OFF_AI_TIMER) return;
  OFF_AI_TIMER = setInterval(() => {
    if (!Object.keys(offRead_('ai')).length) { clearInterval(OFF_AI_TIMER); OFF_AI_TIMER = 0; return; }
    offAiFlush_();
  }, OFF_AI_EVERY_MS);
}

/* ---------- EACH VISIT ONLINE, a downloaded paper is made whole again: words a new Ledger dropped, and this build's files. */
function offTopUp_(tries) {
  const papers = offRead_('papers'), ids = Object.keys(papers).filter(id => papers[id].at);
  if (!ids.length || offIsOff_()) return;
  if (!LIB.disk && !LIB.diskP) LIB.diskP = libDiskLoad_();
  if (typeof LIBRARY_ROWS === 'undefined' || !LIBRARY_ROWS || !LIB.disk) { if ((tries || 0) < 30) setTimeout(() => offTopUp_((tries || 0) + 1), 2000); return; }
  ids.forEach(pid => libAsk_((papers[pid].ids || []).filter(t => !LIB.disk.has(t))));
  offShell_([].concat(...ids.map(offPaperItems_))).catch(() => {});
}
addEventListener('load', () => setTimeout(offTopUp_, 5000));
