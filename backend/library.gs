/* @family. — library.gs THE LIBRARY'S PRIVATE HALF: ledger tabs, the copy, the cache, the export and import */

/* ======================== THE LIBRARY'S PRIVATE HALF, IN THE LEDGER (397) ========================
   The repo keeps card metadata; words, answers and figures are rows of four Ledger tabs (LIB_FILES), served a few at a time. */

/* EVERY TEXT CELL STARTS `~`, so the sheet never reads a JSON chunk, an id or a checksum as a number, date or formula. */
const LIB_MARK = '~';
const libCellOut_ = v => LIB_MARK + String(v);
const libCellIn_ = v => { const s = String(v == null ? '' : v); return s.charAt(0) === LIB_MARK ? s.slice(1) : s; };

/* WHICH FILE AN ID ON THE WIRE BELONGS TO: `q:` a question row, `ct:` a content card, `pr:` a practical, `pj:` a project. */
function libDefOf_(typed) {
  const m = /^([a-z]{1,3}):(.+)$/.exec(S(typed));
  if (!m) return null;
  const key = Object.keys(LIB_FILES).filter(k => LIB_FILES[k].prefix === m[1])[0];
  return key ? { key: key, def: LIB_FILES[key], id: m[2] } : null;
}
/* AN ITEM'S ID IN ITS FILE: the id columns joined by `#` (a content card is `TB-GCSE-STATS#3`). */
function libIdOf_(def, row) {
  const parts = def.id.map(c => S(row && row[c]));
  return parts.every(p => p !== '') ? parts.join('#') : '';
}
/* THE PRIVATE FIELDS A ROW HAS, in LIB_FILES order — an empty cell kept as one, so the copy is the row exactly. Null when it has none. */
function libPrivateOf_(def, row) {
  if (!row || (def.skip && S(row[def.skip]))) return null;
  const out = {};
  let any = false;
  def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(row, f)) { out[f] = row[f]; any = true; } });
  return any ? out : null;
}
/* SHA-256 OF THE JSON, base64 — written beside it, and asked again of what the cells give back. */
function libSum_(text) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8));
}
function libCells_(json) {
  const parts = [];
  for (let i = 0; i < json.length; i += LIB_CELL) parts.push(json.slice(i, i + LIB_CELL));
  if (!parts.length) parts.push('');
  if (parts.length > LIB_PARTS) throw new Error('an item is ' + json.length + ' characters, more than ' + LIB_PARTS + ' cells hold');
  return parts;
}
/* ONE SHEET ROW FOR ONE ITEM, and back. */
function libRowOut_(item) {
  const parts = libCells_(item.json);
  const row = [libCellOut_(item.id), libCellOut_(item.sum), parts.length];
  for (let i = 0; i < LIB_PARTS; i++) row.push(i < parts.length ? libCellOut_(parts[i]) : '');
  return row;
}
function libRowIn_(cells) {
  const n = Math.max(1, Math.min(LIB_PARTS, Number(cells[2]) || 1));
  let json = '';
  for (let i = 0; i < n; i++) json += libCellIn_(cells[3 + i]);
  return { id: libCellIn_(cells[0]), sum: libCellIn_(cells[1]), json: json };
}
/* THE TAB, MADE WITH ITS HEADER IF IT IS NOT THERE YET — and as tall as `rows` needs, because a range past the grid throws. */
function libSheet_(def, rows) {
  const ss = SpreadsheetApp.openById(LEDGER_ID);
  let sh = ss.getSheetByName(def.tab);
  if (!sh) {
    sh = ss.insertSheet(def.tab);
    sh.appendRow(SCHEMA[def.tab]);
    sh.setFrozenRows(1);
  }
  const need = (rows || 0) + 1;
  if (sh.getMaxRows() < need && typeof sh.insertRowsAfter === 'function') sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  const wide = 3 + LIB_PARTS;
  if (sh.getMaxColumns() < wide) sh.insertColumnsAfter(sh.getMaxColumns(), wide - sh.getMaxColumns());
  return sh;
}

/* ---------- THE COPY: `library-to-ledger`, a trigger's few minutes at a time ---------- */
const LIB_MIG_KEY = 'LIB_MIGRATION';
/* THE TRIGGER'S HANDLER — public, so a trigger can call it; running it by hand does one more safe step. */
const LIB_STEP_FN = 'libraryCopyStep';
/* A STEP STOPS STARTING NEW WORK AFTER THIS LONG, inside Apps Script's six minutes. */
const LIB_STEP_MS = 4 * 60 * 1000;
const LIB_BATCH = 200;
/* A COPY THAT FAILS ITS CHECK THREE TIMES STOPS AND SAYS SO, rather than copying for ever. */
const LIB_TRIES = 3;

function libMigState_() {
  try { const st = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_MIG_KEY) || 'null'); if (st && st.files) return st; } catch (err) { /* a malformed stored value counts as absent */ }
  return { files: {} };
}
function libMigSave_(st) { PropertiesService.getScriptProperties().setProperty(LIB_MIG_KEY, JSON.stringify(st)); }
/* READY TO SERVE: every file copied and checked. Until then `libItems` says the copy is still going. */
function libReady_() { return !!libMigState_().done; }
function libProgress_(st) {
  return Object.keys(LIB_FILES).map(k => {
    const f = st.files[k] || {};
    return k + ' ' + (f.verified ? 'checked (' + (f.rows || 0) + ')' : f.total ? (f.next || 0) + ' of ' + f.total + (f.next >= f.total ? ', checking' : '') : 'waiting');
  }).join('; ');
}
/* WHAT THE SETUP CARD SAYS WHILE IT RUNS — a job still copying is waiting, not failed (361's card). */
function libSetupSays_() {
  const st = libMigState_();
  if (st.done) return { working: false, said: 'copied from ' + S(st.commit).slice(0, 7) + ' and checked: ' + libProgress_(st) };
  if (st.stuck) return { working: false, said: 'STOPPED: ' + S(st.error) };
  return { working: true, said: 'copying in the background — ' + libProgress_(st) + (st.error ? ' (last: ' + S(st.error) + ')' : '') };
}

/* THE MIGRATIONS JOB. Cheap, on an admin's page load: it books the step and never copies itself, so nobody waits. Throws
   until the copy is checked, so the job stays pending and is asked again; returns once it is. */
function libMigrate_() {
  const st = libMigState_();
  if (st.done) return libSetupSays_().said;
  if (st.stuck) throw new Error(S(st.error) + ' — fix the cause, then ?run=rerun&arg=library-to-ledger');
  if (!st.beat || Date.now() - Number(st.beat) > 10 * 60 * 1000) libStepBook_();
  throw new Error('copying in the background — ' + libProgress_(st));
}
function libStepUnbook_() {
  try { ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === LIB_STEP_FN) ScriptApp.deleteTrigger(t); }); } catch (err) { /* a trigger left behind fires once more and does nothing */ }
}
function libStepBook_() {
  libStepUnbook_();
  ScriptApp.newTrigger(LIB_STEP_FN).timeBased().after(60 * 1000).create();
}

/* THE SOURCE: the file as it was at LIB_SOURCE_COMMIT — every row with a private field, as {id, json, sum}. */
function libSource_(def, fetchText) {
  /* A FILE WITH NO PRIVATE ROW AT THE PINNED COMMIT (`newer`) is copied as nothing; its tab is filled by import. */
  if (def.newer) return { items: [] };
  let text = '';
  try {
    if (fetchText) text = fetchText(def.file);
    else {
      const res = UrlFetchApp.fetch(LIB_SOURCE_RAW + def.file, { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' answered ' + res.getResponseCode() };
      text = String(res.getContentText('UTF-8'));
    }
  } catch (err) { return { error: def.file + ' could not be fetched (' + S(err && err.message || err).slice(0, 160) + ')' }; }
  let rows;
  try { rows = JSON.parse(text); } catch (err) { return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' is not whole JSON' }; }
  if (!Array.isArray(rows) || !rows.length) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' has no rows' };
  const items = [], seen = {};
  for (let i = 0; i < rows.length; i++) {
    const content = libPrivateOf_(def, rows[i]);
    if (!content) continue;
    const id = libIdOf_(def, rows[i]);
    if (!id) return { error: def.file + ' row ' + (i + 1) + ' has private fields and no id' };
    if (seen[id]) return { error: def.file + ' has ' + id + ' twice' };
    seen[id] = 1;
    const json = JSON.stringify(content);
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  return { items: items };
}

/* ONE STEP. Writes from where the last step stopped (row 2 + n is item n, always, so writing a row twice writes it the
   same), then reads every row back and checks its id and checksum against the source before the file counts as done. */
function libraryCopyStep() { return libCopy_({}); }
function libCopy_(o) {
  o = o || {};
  const budget = o.budgetMs || LIB_STEP_MS;
  /* `o.clock`, `o.batch`, `o.fetchText`, `o.afterWrite`, `o.noBook`: a check's (check-library-ledger.js) — never a trigger's. */
  const clock = o.clock || (() => Date.now());
  const t0 = clock();
  const st = libMigState_();
  if (st.done) { libStepUnbook_(); return st; }
  /* ONE STEP AT A TIME — a heartbeat younger than a step is a step still running. */
  if (st.running && Date.now() - Number(st.running) < LIB_STEP_MS + 60 * 1000 && !o.force) return { skipped: 'a step is already running' };
  libStepUnbook_();
  st.running = Date.now(); st.beat = Date.now(); delete st.error;
  libMigSave_(st);
  const late = () => clock() - t0 > budget;
  try {
    const keys = Object.keys(LIB_FILES);
    for (let k = 0; k < keys.length && !late(); k++) {
      const key = keys[k], def = LIB_FILES[key];
      const f = st.files[key] || (st.files[key] = { next: 0, checked: 0 });
      if (f.verified) continue;
      const src = libSource_(def, o.fetchText);
      if (src.error) { st.error = src.error; break; }
      /* THE SOURCE CHANGED SHAPE SINCE THE LAST STEP (it cannot at a pinned commit, but a count is cheap to ask). */
      if (f.total && f.total !== src.items.length) { f.next = 0; f.checked = 0; }
      f.total = src.items.length;
      const sh = libSheet_(def, f.total);
      while (f.next < f.total && !late()) {
        const batch = src.items.slice(f.next, f.next + (o.batch || LIB_BATCH));
        sh.getRange(2 + f.next, 1, batch.length, 3 + LIB_PARTS).setValues(batch.map(libRowOut_));
        f.next += batch.length;
        st.beat = Date.now();
        libMigSave_(st);
      }
      if (f.next < f.total) break;
      if (o.afterWrite) o.afterWrite(key);
      /* ROWS UNDER THE COPY, from a longer attempt or a hand, are cleared — the tab is the source's rows and nothing else. */
      const last = sh.getLastRow();
      if (last > 1 + f.total) sh.getRange(2 + f.total, 1, last - 1 - f.total, 3 + LIB_PARTS).clearContent();
      /* THE CHECK, A BATCH AT A TIME AND RESUMABLE: every row's id, its checksum, and the checksum of what its cells hold. */
      let bad = '';
      while (f.checked < f.total && !late() && !bad) {
        const n = Math.min(500, f.total - f.checked);
        const got = sh.getRange(2 + f.checked, 1, n, 3 + LIB_PARTS).getValues();
        for (let i = 0; i < n && !bad; i++) {
          const want = src.items[f.checked + i], have = libRowIn_(got[i]);
          if (have.id !== want.id) bad = 'row ' + (2 + f.checked + i) + ' is ' + have.id + ', not ' + want.id;
          else if (have.sum !== want.sum) bad = want.id + ' has the wrong checksum';
          else if (libSum_(have.json) !== want.sum) bad = want.id + ' does not read back as it was written';
        }
        if (!bad) { f.checked += n; st.beat = Date.now(); libMigSave_(st); }
      }
      if (bad) {
        f.tries = (f.tries || 0) + 1;
        f.next = 0; f.checked = 0;
        st.error = key + ': ' + bad;
        if (f.tries >= LIB_TRIES) st.stuck = true;
        break;
      }
      if (f.checked < f.total) break;
      f.verified = new Date().toISOString();
      f.rows = f.total;
      delete f.tries;
      libMigSave_(st);
    }
    if (keys.every(key => st.files[key] && st.files[key].verified)) {
      st.done = new Date().toISOString();
      st.commit = LIB_SOURCE_COMMIT;
      delete st.error;
      libGenBump_();
      /* WHAT THE SETUP CARD SAYS UNDER THE JOB once it is done (`SAID_<id>`, 379's note). */
      try { PropertiesService.getScriptProperties().setProperty('SAID_library-to-ledger', JSON.stringify({ said: 'copied from ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' and checked: ' + libProgress_(st) })); } catch (err) { /* script properties are best-effort here; the next run tries again */ }
    }
    return st;
  } finally {
    delete st.running;
    libMigSave_(st);
    if (!st.done && !st.stuck && !o.noBook) { try { libStepBook_(); } catch (err) { st.error = 'the next step could not be booked: ' + S(err && err.message || err); libMigSave_(st); } }
  }
}

/* ---------- SERVING: an item's private fields, by id, from the cache or the tab ---------- */
/* THE GENERATION: bumped when the copy finishes and on every import, so no cache outlives an edit. */
function libGen_() { return S(PropertiesService.getScriptProperties().getProperty('LIB_GEN')) || '0'; }
function libGenBump_() { PropertiesService.getScriptProperties().setProperty('LIB_GEN', String(Date.now())); }
/* A VALUE IS 100KB AT MOST, so anything longer is cut — 30,000 characters is under it even at three bytes a character. */
const LIB_CACHE_CHUNK = 30000;
const LIB_CACHE_S = 21600;
function libCachePut_(cache, key, text) {
  const o = {};
  const n = Math.max(1, Math.ceil(text.length / LIB_CACHE_CHUNK));
  o[key] = String(n);
  for (let i = 0; i < n; i++) o[key + '#' + i] = text.slice(i * LIB_CACHE_CHUNK, (i + 1) * LIB_CACHE_CHUNK);
  try { cache.putAll(o, LIB_CACHE_S); } catch (err) { /* a full cache costs speed, never an answer */ }
}
function libCacheGet_(cache, keys) {
  const out = {};
  let heads = {};
  try { heads = cache.getAll(keys) || {}; } catch (err) { heads = {}; }
  const parts = [];
  keys.forEach(k => { const n = Number(heads[k]) || 0; for (let i = 0; i < n; i++) parts.push(k + '#' + i); });
  let got = {};
  try { got = parts.length ? cache.getAll(parts) || {} : {}; } catch (err) { got = {}; }
  keys.forEach(k => {
    const n = Number(heads[k]) || 0;
    if (!n) return;
    let text = '';
    for (let i = 0; i < n; i++) { const p = got[k + '#' + i]; if (p == null) return; text += p; }
    out[k] = text;
  });
  return out;
}
/* WHERE EACH ID IS: column A read once, kept as {id: row}. */
function libIndex_(def, sh, gen, cache) {
  const key = 'lbi' + gen + ':' + def.tab;
  const had = cache ? libCacheGet_(cache, [key])[key] : null;
  if (had) { try { return JSON.parse(had); } catch (err) { /* a malformed stored value counts as absent */ } }
  const last = sh.getLastRow();
  const at = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach((r, i) => { const id = libCellIn_(r[0]); if (id && !at[id]) at[id] = i + 2; });
  if (cache) libCachePut_(cache, key, JSON.stringify(at));
  return at;
}
/* `ids` ARE TYPED (`q:Q-1a`). Returns { items: {typed: content}, missing: [typed] } — missing is an id the tab has no row for. */
function libContent_(ids) {
  const gen = libGen_();
  const cache = CacheService.getScriptCache();
  const items = {}, missing = [];
  const keyOf = t => 'lb' + gen + ':' + t;
  const hit = libCacheGet_(cache, ids.map(keyOf));
  const need = {};
  ids.forEach(t => {
    const text = hit[keyOf(t)];
    if (text != null) { try { items[t] = JSON.parse(text); return; } catch (err) { /* a malformed stored value counts as absent */ } }
    const d = libDefOf_(t);
    if (!d) { missing.push(t); return; }
    (need[d.key] = need[d.key] || []).push(d);
  });
  Object.keys(need).forEach(key => {
    const def = LIB_FILES[key];
    const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
    if (!sh) { need[key].forEach(d => missing.push(d.def.prefix + ':' + d.id)); return; }
    const at = libIndex_(def, sh, gen, cache);
    const rows = [];
    need[key].forEach(d => { if (at[d.id]) rows.push({ row: at[d.id], d: d }); else missing.push(def.prefix + ':' + d.id); });
    rows.sort((a, b) => a.row - b.row);
    /* NEIGHBOURS IN ONE READ: a question's parts are rows side by side, so a run of rows is one range. */
    for (let i = 0; i < rows.length; ) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].row - rows[j].row <= 3) j++;
      const lo = rows[i].row, hi = rows[j].row;
      const got = sh.getRange(lo, 1, hi - lo + 1, 3 + LIB_PARTS).getValues();
      for (let k = i; k <= j; k++) {
        const t = def.prefix + ':' + rows[k].d.id;
        const have = libRowIn_(got[rows[k].row - lo]);
        let content = null;
        try { content = have.id === rows[k].d.id ? JSON.parse(have.json) : null; } catch (err) { content = null; }
        if (!content) { missing.push(t); continue; }
        items[t] = content;
        libCachePut_(cache, keyOf(t), have.json);
      }
      i = j + 1;
    }
  });
  return { items: items, missing: missing };
}

/* ---------- THE DAY'S CAP: one `lib_log` row per person per London day, its ids so a second look is free ---------- */
const LIB_LOG_IDS_MAX = 45000;
function libCapOf_() {
  let cfg = {};
  try { cfg = config() || {}; } catch (err) { cfg = {}; }
  const cell = S(cfg.library_items_per_day);
  const n = cell === '' ? LIB_DAILY_CAP : Number(cell);
  return isFinite(n) && n >= 0 ? Math.floor(n) : LIB_DAILY_CAP;
}
/* UNDER THE LOCK: which of `ids` this person may have now. Already had today → free; new → counted until the cap. */
function libTally_(me, ids, cap) {
  const pid = S(me.person_id), day = reportDay_(new Date());
  const cache = CacheService.getScriptCache();
  const ckey = 'lbt:' + pid + ':' + day;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { busy: true };
  const wroteBefore = POST_WROTE;
  try {
    clearCache();
    const t = read(TAB.libLog);
    const row = t.sheet ? t.rows.find(r => S(r.person_id) === pid && reportDay_(r.day) === day) : null;
    const had = row ? S(row.ids).split(',').filter(Boolean) : [];
    let cached = null;
    try { cached = JSON.parse(cache.get(ckey) || 'null'); } catch (err) { cached = null; }
    const seen = {};
    had.concat(cached && Array.isArray(cached.ids) ? cached.ids : []).forEach(id => { seen[id] = 1; });
    let count = Math.max(row ? Number(row.served) || 0 : 0, cached ? Number(cached.n) || 0 : 0, Object.keys(seen).length);
    const before = count;
    const allowed = [], refused = [];
    ids.forEach(id => {
      if (seen[id]) { allowed.push(id); return; }
      if (count >= cap) { refused.push(id); return; }
      seen[id] = 1; count++; allowed.push(id);
    });
    let list = Object.keys(seen).join(',');
    if (list.length > LIB_LOG_IDS_MAX) list = list.slice(0, LIB_LOG_IDS_MAX).replace(/,[^,]*$/, '');
    if (t.sheet && (count !== before || refused.length)) {
      const vals = { served: count, ids: list, refused: (row ? Number(row.refused) || 0 : 0) + refused.length, last_at: new Date() };
      if (row) setCells(t, row, vals);
      else addRow(t, Object.assign({ day: day, person_id: pid }, vals));
    }
    try { cache.put(ckey, JSON.stringify({ n: count, ids: list.split(',') }), LIB_CACHE_S); } catch (err) { /* the cache is an optimisation; a miss just rebuilds */ }
    return { allowed: allowed, refused: refused, left: Math.max(0, cap - count) };
  } finally {
    lock.releaseLock();
    /* NO PAYLOAD CARRIES THE LOG, so the stored payload stands. */
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/* ---------- THE TOOLS' COPY: out a page at a time, and back in (an admin's, from tools/lib-private.js) ---------- */
const LIB_EXPORT_MAX = 500;
const LIB_IMPORT_MAX = 300;
function libExport_(fileKey, from, count) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
  if (!sh) return { error: 'There is no ' + def.tab + ' tab yet.' };
  const total = Math.max(0, sh.getLastRow() - 1);
  const a = Math.max(0, Math.floor(Number(from) || 0));
  const n = Math.max(0, Math.min(LIB_EXPORT_MAX, Math.floor(Number(count) || LIB_EXPORT_MAX), total - a));
  const rows = [];
  if (n) sh.getRange(2 + a, 1, n, 3 + LIB_PARTS).getValues().forEach(c => {
    const have = libRowIn_(c);
    if (!have.id) return;
    let content = null;
    try { content = JSON.parse(have.json); } catch (err) { content = null; }
    rows.push({ id: have.id, sum: have.sum, content: content });
  });
  return { success: true, file: S(fileKey), total: total, from: a, rows: rows };
}
/* AN ITEM'S OWN ANSWER AGAINST ITS OWN SHAPE (457): § */
function libSelfTest_(fileKey, c) {
  if (S(fileKey) !== 'questions' || !c) return null;
  const choices = S(c.choices).split('|').filter(o => S(o));
  const right = S(c.choice_right).split('|')[0];
  if (choices.length >= 2) {
    if (!right) return { flag: 'it has ' + choices.length + ' options and no choice_right' };
    const picks = right.split(',').map(v => S(v)).filter(v => v);
    if (!picks.length || picks.some(v => !/^\d+$/.test(v) || +v < 1 || +v > choices.length)) {
      return { refuse: 'its choice_right ' + right + ' is not among its ' + choices.length + ' options' };
    }
  }
  if (S(c.cells) && !S(c.cells).split(';').some(cell => { const w = S(cell.replace(/^[^=|]{1,12}?=/, '')); return w && w !== '-'; })) {
    return { refuse: 'its cells hold no answer to mark by' };
  }
  if (S(c.accept) && !S(c.accept).split('|').some(w => S(w))) return { refuse: 'its accept has no way in it' };
  if (S(c.draw_answer)) {
    let d = null;
    try { d = JSON.parse(S(c.draw_answer)); } catch (err) { d = null; }
    if (!d || !Array.isArray(d.items) || !d.items.length) return { refuse: 'its draw_answer is not a drawing to mark by' };
  }
  return null;
}

/* AN IMPORT REPLACES THE ROW WITH THAT ID, or adds one at the foot. Only the file's private fields, only text and numbers. */
function libImport_(fileKey, rows) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  if (!Array.isArray(rows) || !rows.length) return { error: 'No rows sent.' };
  if (rows.length > LIB_IMPORT_MAX) return { error: 'At most ' + LIB_IMPORT_MAX + ' rows at a time.' };
  const items = [], flagged = [];
  for (let i = 0; i < rows.length; i++) {
    const one = rows[i] || {}, id = S(one.id), c = one.content;
    if (!id || id.length > 160) return { error: 'Row ' + (i + 1) + ' has no id.' };
    if (!c || typeof c !== 'object' || Array.isArray(c)) return { error: id + ' has no content object.' };
    const odd = Object.keys(c).filter(k => def.private.indexOf(k) === -1 || (c[k] !== null && typeof c[k] === 'object'));
    if (odd.length) return { error: id + ' carries ' + odd.join(', ') + ' — not a private field of ' + def.file + ', or not text.' };
    const content = {};
    def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(c, f)) content[f] = c[f]; });
    const json = JSON.stringify(content);
    try { libCells_(json); } catch (err) { return { error: id + ': ' + err.message }; }
    const self = libSelfTest_(fileKey, content);
    if (self && self.refuse) return { error: id + ': ' + self.refuse + ' — nothing was written' };
    if (self && self.flag) flagged.push(id + ': ' + self.flag);
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    const sh = libSheet_(def, 0);
    const at = libIndex_(def, sh, '', null);
    let foot = Math.max(1, sh.getLastRow());
    let added = 0, replaced = 0;
    items.forEach(it => {
      let row = at[it.id];
      if (row) replaced++;
      else { foot++; row = foot; at[it.id] = row; added++; libSheet_(def, row); }
      sh.getRange(row, 1, 1, 3 + LIB_PARTS).setValues([libRowOut_(it)]);
    });
    libGenBump_();
    return { success: true, file: S(fileKey), added: added, replaced: replaced, flagged: flagged };
  } finally {
    lock.releaseLock();
  }
}


/* ---------- LIBRARY UPDATES FROM DRIVE (407): a session leaves lib-import-*.json in the owner's Drive; an admin's tile imports them ----------
   A session reaches Drive, not this script. docs/library.md. */
const LIB_DRIVE_FOLDER = 'family-library-imports';
const LIB_DRIVE_DONE = 'imported';
const LIB_DRIVE_NAME = /^lib-import-[A-Za-z0-9._:-]{1,80}\.json$/;
/* ONE FILE AT MOST THIS MANY ITEMS, and a press stops starting files after this long, inside Apps Script's six minutes. */
const LIB_DRIVE_MAX = 3000;
const LIB_DRIVE_MS = 4 * 60 * 1000;
const LIB_DRIVE_LAST = 'LIB_IMPORT_LAST';
/* THE HOURLY RUN (443): its handler, and the property holding what the last automatic import that found files did. */
const LIB_DRIVE_HOURLY = 'libImportHourly';
const LIB_DRIVE_AUTO = 'LIB_IMPORT_AUTO';
/* ONE ZIP OF MANY FILES: lib-import-*.zip in the folder is unpacked into lib-import-*.json beside it, then moved to `imported`. Over Apps Script's blob limit (~50 MB) it is refused. */
const LIB_DRIVE_ZIP = /^lib-import-[A-Za-z0-9._:-]{1,80}\.zip$/;
const LIB_DRIVE_ZIP_BYTES = 45 * 1024 * 1024;
const LIB_DRIVE_ZIP_FILES = 500;
/* THE WALK DOWN (an unzipped bundle is a subfolder): at most this many folders and files looked at a run; the rest wait for the next. */
const LIB_DRIVE_WALK_FOLDERS = 20;
const LIB_DRIVE_WALK_FILES = 2000;

/* WHO OWNS IT, '' WHEN DRIVE WILL NOT SAY — only this account's own folder and files are read, never one shared with it. */
const libDriveOwner_ = f => { try { const o = f.getOwner && f.getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; } };
function libDriveMine_(f) {
  if (f.isTrashed && f.isTrashed()) return false;
  let me = '';
  try { me = norm(Session.getEffectiveUser().getEmail()); } catch (err) { me = ''; }
  const owner = libDriveOwner_(f);
  return !me || !owner || owner === me;
}
function libDriveFind_(it) { while (it && it.hasNext()) { const f = it.next(); if (libDriveMine_(f)) return f; } return null; }
/* THE FOLDER, MADE IF IT IS MISSING (so a session finds it the first time), and its `imported` subfolder. */
function libDriveFolder_() {
  return libDriveFind_(DriveApp.getFoldersByName(LIB_DRIVE_FOLDER)) || DriveApp.createFolder(LIB_DRIVE_FOLDER);
}
function libDriveDone_(folder) {
  return libDriveFind_(folder.getFoldersByName(LIB_DRIVE_DONE)) || folder.createFolder(LIB_DRIVE_DONE);
}
