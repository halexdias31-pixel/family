/* @family. — 10_core.gs (2 of 8) READING AND WRITING THE SHEET, and the small helpers everything uses. § */


/* Drop the per-request cache. § */
function clearCache() {
  Object.keys(_cache).forEach(k => { delete _cache[k]; });
  /* The open documents go too. A handler clearing the row cache because it has just written is
     asking for the sheet as it is NOW, and a held document object is the thing it would be read
     through. */
  _open = {};
}

/* ---------- WHICH FILE, AND WHAT IT IS CALLED IN THERE § */
function sheetFor_(name) {
  const w = WHERE[name];
  if (!w) return { id: '', names: [name], make: name, away: '(not in WHERE)' };
  return { id: FILES[w.file] || '',
           names: w.alsoTry ? [name, w.alsoTry] : [name],
           make: name, away: w.file };
}

/* ---------- `documents_()` WAS HERE, AND THERE IS NOTHING LEFT FOR IT TO READ § */

/* ---------- ONE OPEN PER FILE PER REQUEST § */
let _open = {};
function openCached_(id) {
  if (_open[id] !== undefined) return _open[id];
  let ss = null;
  try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  return (_open[id] = ss);
}

/** The first of those names that actually exists, or null. */
function findSheet_(at) {
  if (!at.id) return null;
  const ss = openCached_(at.id);
  if (!ss) return null;
  for (let i = 0; i < at.names.length; i++) {
    const sh = ss.getSheetByName(at.names[i]);
    if (sh) return sh;
  }
  return null;
}

function read(name) {
  if (_cache[name]) return _cache[name];
  /* NO FILE, OR NO TAB UNDER EITHER NAME, is answered the same way — an empty result. § */
  const sheet = findSheet_(sheetFor_(name));
  if (!sheet) return (_cache[name] = { sheet: null, headers: [], rows: [] });
  /* ---------- THE LAST ROW WITH DATA, NOT THE LAST ROW SOMETHING TOUCHED § */
  const lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (!lastRow || !lastCol) return (_cache[name] = { sheet, headers: [], rows: [] });
  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = (values[0] || []).map(h => String(h).trim());
  const rows = values.slice(1).map((r, i) => {
    const o = { _row: i + 2 };
    headers.forEach((h, c) => { if (h) o[h] = r[c]; });
    return o;
  }).filter(o => headers.some(h => h && String(o[h] ?? '').trim() !== ''));
  return (_cache[name] = { sheet, headers, rows });
}

/* ---------- SOME COLUMNS OF A TAB, NOT ALL OF THEM § */
function readCols_(name, cols) {
  const sheet = findSheet_(sheetFor_(name));
  if (!sheet) return { sheet: null, headers: [], rows: [] };
  const lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (!lastRow || !lastCol) return { sheet, headers: [], rows: [] };
  const headers = (sheet.getRange(1, 1, 1, lastCol).getValues()[0] || []).map(h => String(h).trim());
  const rows = [];
  for (let i = 2; i <= lastRow; i++) rows.push({ _row: i });
  const want = (cols || []).filter(c => headers.indexOf(c) !== -1);
  if (rows.length) want.forEach(c => {
    const vals = sheet.getRange(2, headers.indexOf(c) + 1, rows.length, 1).getValues();
    vals.forEach((v, i) => { rows[i][c] = v[0]; });
  });
  return { sheet, headers, rows: rows.filter(o => want.some(c => String(o[c] ?? '').trim() !== '')) };
}

/** Write one cell and keep the in-memory object in step. Records a column that is not there. */
function setCell(t, row, field, value) {
  if (!t.sheet || !row) return false;
  const c = t.headers.indexOf(field);
  if (c < 0) { missedWrite_(t, field); return false; }
  value = kidNamesKept_(row[field], value, field);
  t.sheet.getRange(row._row, c + 1).setValue(cellSafe_(value));
  row[field] = value;              // read-after-write within this request now sees the truth
  POST_WROTE = true;               // the stored payload no longer matches the sheet
  kidMemoDrop_(t);                 // a name on the people tab may just have changed
  return true;
}

/* ---------- WHAT THE NET SHORTENED ON THE WAY OUT IS NOT WRITTEN BACK SHORT § */
function kidNamesKept_(have, want, field) {
  if (typeof have !== 'string' || typeof want !== 'string' || !have || have === want) return want;
  try { return kidNamesBack_(have, want, field); } catch (err) { return want; }
}

/* ---------- A STRING THAT STARTS LIKE A FORMULA IS WRITTEN AS TEXT § */
function cellSafe_(v) {
  if (typeof v !== 'string' || !v) return v;
  const c = v.charAt(0);
  if (c === '=' || c === '+' || c === '@') return "'" + v;
  if (c === '-' && !/^-\d+(\.\d+)?$/.test(v)) return "'" + v;
  if (/^0\d+$/.test(v)) return "'" + v;
  return v;
}

/* ---------- SEVERAL CELLS OF ONE ROW, IN AS FEW CALLS AS THE COLUMNS ALLOW § */
function setCells(t, row, values) {
  if (!t.sheet || !row) return [];
  const cells = [];
  Object.keys(values || {}).forEach(f => {
    const c = t.headers.indexOf(f);
    if (c < 0) { missedWrite_(t, f); return; }
    /* THE NET'S SHORTENING UNDONE FIRST (`kidNamesKept_`), so a box sent back as it was drawn is a box
       that did not change, and is skipped like one. */
    const v = kidNamesKept_(row[f], values[f], f);
    if (sameCell_(row[f], v)) return;
    cells.push({ c: c, f: f, v: v });
  });
  if (!cells.length) return [];
  cells.sort((a, b) => a.c - b.c);
  const runs = [];
  cells.forEach(x => {
    const run = runs[runs.length - 1];
    if (run && x.c === run[run.length - 1].c + 1) run.push(x); else runs.push([x]);
  });
  runs.forEach(run => {
    t.sheet.getRange(row._row, run[0].c + 1, 1, run.length).setValues([run.map(x => cellSafe_(x.v))]);
  });
  cells.forEach(x => { row[x.f] = x.v; });   // read-after-write within this request sees the truth
  POST_WROTE = true;                          // the stored payload no longer matches the sheet
  kidMemoDrop_(t);                            // a name on the people tab may just have changed
  return cells.map(x => x.f);
}

/* Is a cell already holding this value? § */
function sameCell_(have, want) {
  if (want instanceof Date) return false;
  const w = (want === undefined || want === null) ? '' : String(want);
  if (have instanceof Date) return !isNaN(have) && !!w && (w === fmtDate(have) || w === isoDate_(have));
  /* A TICK TYPED OR WRITTEN AS `TRUE` COMES BACK A BOOLEAN — the sheet coerces it — and the form posts the word. § */
  if (typeof have === 'boolean' && /^(true|false)$/i.test(w)) return have === /^true$/i.test(w);
  return ((have === undefined || have === null) ? '' : String(have)) === w;
}

/** Append a record. Fields not in the tab are dropped rather than shifting the row. */
function addRow(t, obj) {
  if (!t.sheet) return null;
  Object.keys(obj || {}).forEach(k => {
    if (t.headers.indexOf(k) < 0) missedWrite_(t, k);
  });
  const line = t.headers.map(h => (obj[h] !== undefined ? cellSafe_(obj[h]) : ''));
  t.sheet.appendRow(line);
  POST_WROTE = true;               // the stored payload no longer matches the sheet
  const row = Object.assign({ _row: t.sheet.getLastRow() }, obj);
  t.rows.push(row);
  kidMemoDrop_(t);
  return row;
}

/* ---------- THE THIRD WAY TO CHANGE A SHEET, AND IT WAS NOT WRITTEN DOWN § */
function delRow(t, row) {
  if (!t || !t.sheet || !row || !row._row) return false;
  const at = row._row;
  t.sheet.deleteRow(at);
  POST_WROTE = true;               // the stored payload still has a row the sheet no longer does
  if (Array.isArray(t.rows)) {
    const i = t.rows.indexOf(row);
    if (i >= 0) t.rows.splice(i, 1);
    t.rows.forEach(r => { if (r && r._row > at) r._row -= 1; });
  }
  kidMemoDrop_(t);
  return true;
}

/** One entry per tab-and-field, however many rows tried to write it. */
function missedWrite_(t, field) {
  let tab = '?';
  try { tab = t.sheet.getName(); } catch (err) {}
  if (!WRITE_MISSES.some(x => x.tab === tab && x.field === field)) {
    WRITE_MISSES.push({ tab: tab, field: field });
  }
}

/* THE ONE EXIT. Every reply in this file goes through here, which is why the check belongs here rather than in fifty handlers that would each have to remember it. § */
/* ---------- SET BY THE WRITES THEMSELVES § */
let POST_WROTE = false;

function jsonOut(obj) {
  /* AFTER the write, not before it. § */
  if (POST_WROTE) { POST_WROTE = false; clearPayloadCache(); }
  if (obj && typeof obj === 'object' && WRITE_MISSES.length) {
    const missed = WRITE_MISSES.slice();
    WRITE_MISSES = [];
    /* Listed whether or not it succeeded — a read-only request that somehow wrote is worth seeing
       too, and it costs one key. */
    obj.unwritten = missed;
    if (obj.success) {
      delete obj.success;
      obj.error = 'Nothing was saved for: '
        + missed.map(x => x.tab + '.' + x.field).join(', ')
        + '. Those columns are not in the sheet — deploy and reload, or open the site once as an admin.';
    }
  }
  /* NO CHILD'S SURNAME LEAVES BY THIS DOOR — the owner, 10 Oct: § */
  try { if (obj && typeof obj === 'object') kidNamesOff_(obj); } catch (err) {}
  /* AND NO PRICE TO A CHILD (398, `kidPricesOff_`, people.gs). */
  try { if (obj && typeof obj === 'object') kidPricesOff_(obj); } catch (err) {}
  const body = JSON.stringify(obj);
  /* WRAPPED AND SERVED AS A SCRIPT, when a callback was asked for. § */
  if (JSONP_CB && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(JSONP_CB)) {
    return ContentService.createTextOutput(JSONP_CB + '(' + body + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

/* THE PAYLOAD CACHE. WHY THE APP IS SLOW, stated plainly: § */
/* SIX HOURS, WHICH IS THE MAXIMUM THE SERVICE ALLOWS, and not a compromise between freshness and speed — a write invalidates immediately, so freshness is not § */
const PAYLOAD_TTL  = 21600;    /* seconds — six hours, the CacheService ceiling */
const CACHE_CHUNK  = 90000;    /* under the 100KB ceiling, with room for the key and the overhead  */
const CACHE_TAG    = 'pay:';

function payloadCache_() {
  try { return CacheService.getScriptCache(); } catch (err) { return null; }
}

/** The whole body under `key`, or '' if any part of it is missing. */
function cacheGet_(key) {
  const c = payloadCache_();
  if (!c) return '';
  try {
    const head = c.get(CACHE_TAG + key);
    if (!head) return '';
    const n = Number(head);
    if (!n || n < 1 || n > 200) return '';
    const names = [];
    for (let i = 0; i < n; i++) names.push(CACHE_TAG + key + ':' + i);
    const got = c.getAll(names);
    let out = '';
    for (let i = 0; i < n; i++) {
      const part = got[CACHE_TAG + key + ':' + i];
      /* ONE CHUNK SHORT IS A MISS, NOT A SHORTER ANSWER. Chunks expire on their own clocks, and
         half a JSON document parses as nothing at all — an error the app would report as a broken
         backend. */
      if (part === undefined || part === null) return '';
      out += part;
    }
    return out;
  } catch (err) { return ''; }
}

/* WHY THE LAST WRITE FAILED, IF IT DID. § */
let CACHE_LAST_ERR = '';

/** Store `body` under `key`. Returns '' on success or the reason it failed. */
function cachePut_(key, body) {
  const c = payloadCache_();
  if (!c) return (CACHE_LAST_ERR = 'CacheService unavailable');
  if (!body) return (CACHE_LAST_ERR = 'nothing to store');
  try {
    const parts = {};
    let n = 0;
    for (let i = 0; i < body.length; i += CACHE_CHUNK) {
      parts[CACHE_TAG + key + ':' + n] = body.substr(i, CACHE_CHUNK);
      n++;
      if (n > 200) return (CACHE_LAST_ERR = 'payload too large: over ' + (200 * CACHE_CHUNK) + ' chars');
    }
    c.putAll(parts, PAYLOAD_TTL);
    /* THE INDEX IS WRITTEN LAST. Written first, a request arriving between the two calls would find
       an index promising chunks that are not there yet — which `cacheGet_` handles, but there is no
       reason to create the case. */
    c.put(CACHE_TAG + key, String(n), PAYLOAD_TTL);
    return (CACHE_LAST_ERR = '');
  } catch (err) { return (CACHE_LAST_ERR = String(err && err.message || err)); }
}

/* RUN THIS AND IT TELLS YOU IN WORDS. § */
function testCache() {
  const out = [];
  const c = payloadCache_();
  if (!c) return 'FAIL — CacheService is not available to this script at all.';

  /* THE SAME SIZE THE REAL ONE IS, because the limits that matter are size limits. A test that
     stores the word "hello" proves nothing about an 80KB payload. */
  const body = '{"test":"' + new Array(80000).join('x') + '"}';
  const key = 'selftest|' + Date.now();

  const err = cachePut_(key, body);
  if (err) return 'FAIL — could not store: ' + err;
  out.push('stored ' + body.length + ' chars');

  const back = cacheGet_(key);
  if (!back) return 'FAIL — stored without error, but nothing came back. '
    + 'The cache is accepting writes and losing them.';
  if (back !== body) return 'FAIL — came back a different length: put ' + body.length
    + ', got ' + back.length + '. Chunking is wrong.';
  out.push('read back identical');

  /* AND THE PART THAT ACTUALLY BREAKS: § */
  const k1 = payloadKey_({}, 'P001');
  const k2 = payloadKey_({}, 'P001');
  if (k1 !== k2) return 'FAIL — the same visitor produces two different keys (' + k1 + ' / ' + k2
    + '), so nothing can ever be found again.';
  out.push('key is stable: ' + k1);

  out.push('generation is ' + payloadGen_() + ' (this only moves when something writes to the sheet '
    + '— if it climbs on every page load, a read-only POST is clearing the cache)');

  const url = webAppUrl_();
  out.push(url ? ('warmer will call: ' + url)
                : 'WARNING — no web app URL, so warmPayload can do nothing. Deploy first.');

  /* THE QUESTION THAT MATTERS IS NO LONGER "is the warmer on". § */
  const watching = ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onSheetChange').length;
  out.push(watching ? ('edit watch installed (' + watching + ' spreadsheet'
                       + (watching === 1 ? '' : 's') + ')')
                    : 'WARNING — nothing is watching the spreadsheet, so an edit typed into a tab '
                      + 'will not reach the site for up to six hours. Open /exec?triggers=1 '
                      + '(it is also installed by itself after a deploy).');

  const trig = ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'warmPayload').length;
  out.push(trig ? ('five-minute warmer installed (' + trig + ') — note it costs about five hours of '
                   + 'script time a day against an allowance of ninety minutes')
                : 'no five-minute warmer, which is the intended state: rebuilds happen a minute '
                  + 'after an edit instead. See the note in installTriggers_.');

  return 'PASS — the cache itself works.\n' + out.join('\n')
    + '\n\nIf loads are still slow with this passing, the deployed version is older than this code: '
    + 'Deploy > Manage deployments > edit > Version: New version.';
}

/* ---------- WHO GETS WHOSE COPY § */
/* ---------- KEYED ON WHO THE TOKEN SAYS, NEVER ON WHO THE URL SAYS § */
function payloadKey_(p, viewer) {
  const special = ['run', 'setup', 'pages', 'receipts',
                   'triggers', 'debugTiming', 'health'];
  for (let i = 0; i < special.length; i++) if (S(p[special[i]])) return '';
  /* THE VERSION AND THE GENERATION ARE BOTH IN IT. § */
  return payloadGen_() + '|' + BACKEND_VERSION + '|' + S(viewer);
}

/** Empty it. Called after every write, so the app's own edits are never behind. */
function clearPayloadCache() {
  const c = payloadCache_();
  if (!c) return;
  try {
    /* NO WAY TO LIST KEYS, so the generation number is bumped instead and every old key becomes
       unreachable in one property write. Cheaper than remembering what was stored, and it cannot
       miss one. */
    const props = PropertiesService.getScriptProperties();
    const n = Number(props.getProperty('PAYLOAD_GEN') || '0') + 1;
    props.setProperty('PAYLOAD_GEN', String(n));
  } catch (err) {}
}

/* ---------- `retirePayloadOf_` WAS HERE — RETIRING A FEW PEOPLE'S PAYLOADS, NOT EVERYBODY'S § */
/** The generation number, which prefixes every key — see `clearPayloadCache`. */
function payloadGen_() {
  try {
    return PropertiesService.getScriptProperties().getProperty('PAYLOAD_GEN') || '0';
  } catch (err) { return '0'; }
}

/* THE CACHE IS FILLED BEFORE ANYBODY ASKS, NOT BY THE FIRST PERSON TO ASK. § */

/** The deployed address of this web app, for the warmer to call. */
function webAppUrl_() {
  try {
    const set = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL');
    /* CHECKED, NOT TRUSTED. § */
    if (set && /^https:\/\//.test(set)) return set;
  } catch (err) {}
  /* THE SERVICE KNOWS ITS OWN ADDRESS. Only from a versioned deployment, which is the only place
     the warmer runs anyway — and the property above is the override for when it does not. */
  try { return ScriptApp.getService().getUrl() || ''; } catch (err) { return ''; }
}

/** Rebuild and store the payload for the anonymous visitor and for each admin. Called by a trigger. */
function warmPayload() {
  const url = webAppUrl_();
  if (!url) return 'no web app url — deploy first, or set WEB_APP_URL in Script properties';
  /* THE ANONYMOUS KEY AND NO OTHER. § */
  const asks = ['?warm=1'];
  const done = [];
  asks.forEach(q => {
    try {
      /* MUTED AND FOLLOWED. Apps Script answers a web app with a 302 to a content address, so the redirect has to be followed or nothing is fetched; and an error here § */
      UrlFetchApp.fetch(url + q, { muteHttpExceptions: true, followRedirects: true });
      done.push(q.indexOf('person=') === -1 ? 'anonymous' : 'admin');
    } catch (err) { done.push('failed: ' + String(err && err.message || err)); }
  });
  return 'warmed ' + done.join(', ');
}

/* `installWarmTrigger` WAS HERE (361): every five minutes ate the day's script time, nothing called it, and it was a Run-menu item to press by mistake. */

/* AN EDIT TYPED INTO THE SPREADSHEET IS A CHANGE TO THE SITE, AND UNTIL NOW IT WAS NOT. § */

/* How long after the last edit the rebuild runs. Long enough that filling in a row is one job;
   short enough that nobody who edits and immediately looks pays for the rebuild twice over. */
const EDIT_WARM_DELAY_MS = 60 * 1000;

/* How long a booked rebuild is believed in. § */
const WARM_BOOKING_MS = EDIT_WARM_DELAY_MS + 4 * 60 * 1000;

/* SOMEBODY CHANGED THE SPREADSHEET BY HAND. § */
function onSheetChange(e) {
  try { clearPayloadCache(); } catch (err) {}
  /* AN EDIT BY HAND TO A LIBRARY TAB (397): the cached items are forgotten, so the next card opened is the edit. */
  try { if (e && e.source && /^lib_/.test(e.source.getActiveSheet().getName())) libGenBump_(); } catch (err) {}
  try { scheduleWarmAfterEdit_(); } catch (err) {}
}

/** Book one rebuild for a minute from now, unless one is already booked. See the note above. */
function scheduleWarmAfterEdit_() {
  const props = PropertiesService.getScriptProperties();
  const now = Date.now();
  const booked = Number(props.getProperty('WARM_BOOKED_UNTIL') || '0');
  if (booked > now) return '';                    // one is already on its way

  /* WRITTEN BEFORE THE TRIGGER IS MADE, and cleared again if making it fails. The other order
     leaves a window in which a second edit sees no booking, makes a second trigger, and both run. */
  props.setProperty('WARM_BOOKED_UNTIL', String(now + WARM_BOOKING_MS));
  try {
    ScriptApp.newTrigger('warmAfterEdit').timeBased().after(EDIT_WARM_DELAY_MS).create();
    return 'rebuild booked';
  } catch (err) {
    try { props.deleteProperty('WARM_BOOKED_UNTIL'); } catch (err2) {}
    return 'could not book a rebuild: ' + String(err && err.message || err);
  }
}

/* THE BOOKED REBUILD. Tidies itself away first, then builds. § */
function warmAfterEdit() {
  try {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === 'warmAfterEdit') ScriptApp.deleteTrigger(t);
    });
  } catch (err) {}
  try { PropertiesService.getScriptProperties().deleteProperty('WARM_BOOKED_UNTIL'); } catch (err) {}
  try { return warmPayload(); } catch (err) { return 'warm failed: ' + String(err && err.message || err); }
}

/* PUT THE WATCH ON THE SPREADSHEETS. § */
function installSheetWatch_() {
  const out = [];
  try {
    ScriptApp.getProjectTriggers().forEach(t => {
      const f = t.getHandlerFunction();
      if (f === 'onSheetChange' || f === 'warmAfterEdit') ScriptApp.deleteTrigger(t);
    });
  } catch (err) { out.push('could not clear the old ones: ' + String(err && err.message || err)); }

  /* A booking left over from a trigger that has just been deleted would block the first rebuild. */
  try { PropertiesService.getScriptProperties().deleteProperty('WARM_BOOKED_UNTIL'); } catch (err) {}

  const seen = {};
  Object.keys(FILES).forEach(which => {
    const id = String(FILES[which] || '');
    if (!id || seen[id]) return;
    seen[id] = true;
    try {
      ScriptApp.newTrigger('onSheetChange').forSpreadsheet(id).onChange().create();
      out.push(which + ': watching');
    } catch (err) {
      out.push(which + ': FAILED — ' + String(err && err.message || err));
    }
  });

  return { watching: out,
           means: 'an edit typed into these files now reaches the site within about a minute, '
                + 'and is correct immediately' };
}

/** What the watch is doing, without having to read the trigger list yourself. */
function sheetWatchStatus() {
  const names = {};
  try {
    ScriptApp.getProjectTriggers().forEach(t => {
      const f = t.getHandlerFunction();
      names[f] = (names[f] || 0) + 1;
    });
  } catch (err) { return { error: String(err && err.message || err) }; }

  const booked = Number((function () {
    try { return PropertiesService.getScriptProperties().getProperty('WARM_BOOKED_UNTIL') || '0'; }
    catch (err) { return '0'; }
  })());

  return {
    version: BACKEND_VERSION,
    watchingEdits: (names.onSheetChange || 0) > 0,
    fiveMinuteWarm: (names.warmPayload || 0) > 0,
    rebuildBooked: booked > Date.now(),
    generation: payloadGen_(),
    triggers: names,
    verdict: (names.onSheetChange || 0) > 0
      ? 'Edits typed into the spreadsheet retire the stored payload straight away.'
      : 'NOT WATCHING — an edit typed into the spreadsheet will not show on the site for up to six '
        + 'hours. Open /exec?triggers=1 (it is also installed by itself after a deploy).',
  };
}

/** The reply, from a body that is already JSON. Wrapped exactly as `jsonOut` wraps one. */
function jsonRaw_(body) {
  if (JSONP_CB && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(JSONP_CB)) {
    return ContentService.createTextOutput(JSONP_CB + '(' + body + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

/** DD/MM/YYYY from a Date object, a date string, or anything else. */
function fmtDate(v) {
  if (v instanceof Date && !isNaN(v)) {
    return ('0' + v.getDate()).slice(-2) + '/' + ('0' + (v.getMonth() + 1)).slice(-2)
         + '/' + v.getFullYear();
  }
  const s = S(v);
  if (!s) return '';
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) return ('0'+m[1]).slice(-2) + '/' + ('0'+m[2]).slice(-2) + '/' +
                (m[3].length === 2 ? '20' + m[3] : m[3]);
  const d = new Date(s);
  return isNaN(d) ? s : fmtDate(d);
}

function parseDate(v) {
  if (v instanceof Date) return isNaN(v) ? null : v;
  const s = S(v);
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return new Date(+y, +m[2]-1, +m[1]); }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

/** "09:00" from a Date, "9:00", or "9". */
function fmtTime(v) {
  if (v instanceof Date && !isNaN(v)) {
    return ('0'+v.getHours()).slice(-2) + ':' + ('0'+v.getMinutes()).slice(-2);
  }
  const s = S(v);
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return ('0'+m[1]).slice(-2) + ':' + m[2];
  return /^\d{1,2}$/.test(s) ? ('0'+s).slice(-2) + ':00' : s;
}

/* ---------- CONFIG / OPTIONS / PRICING -------------------------------------------------------
   Three tabs replacing the old `category = variable`, `source_*` columns and surcharge rows. */

function config() {
  const out = {};
  read(TAB.config).rows.forEach(r => {
    const k = S(r.key);
    /* Any formula_* row is skipped. § */
    if (k && k.indexOf('formula_') !== 0) out[k] = r.value;
  });
  return out;
}

/* ---------- THE CONFIG TAB AS A PHONE MAY SEE IT § */
function configPublic_(cfg) {
  const out = {};
  Object.keys(cfg || {}).forEach(k => {
    /* `layout` is sent once, parsed, as `layout` (462) — not a second time as a string here. */
    if (CONFIG_PRIVATE.indexOf(norm(k)) === -1 && norm(k) !== LAYOUT_KEY && norm(k) !== WORDS_KEY) out[k] = cfg[k];
  });
  return out;
}

/* ---------- THE RULES (496): `{set: {id: 'universal'}, hist: [{id, was, to, at}]}`, known unlocked ids only; null when broken ---------- */
function rulesClean_(v) {
  let o = v;
  if (typeof o === 'string') {
    if (!o.trim() || o.length > LAYOUT_MAX) return null;
    try { o = JSON.parse(o); } catch (e) { return null; }
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const free = id => RULE_IDS.indexOf(String(id)) !== -1 && RULES_LOCKED.indexOf(String(id)) === -1;
  const ok = x => x === 'exception' || x === 'universal';
  const set = {}, s = o.set && typeof o.set === 'object' && !Array.isArray(o.set) ? o.set : {};
  Object.keys(s).forEach(k => { if (free(k) && s[k] === 'universal') set[k] = 'universal'; });
  const hist = (Array.isArray(o.hist) ? o.hist : []).filter(h => h && typeof h === 'object' && free(h.id) && ok(h.was) && ok(h.to))
    .slice(-RULES_HIST_MAX).map(h => ({ id: String(h.id), was: h.was, to: h.to, at: String(h.at || '').slice(0, 40) }));
  return { set: set, hist: hist };
}

/* ---------- THE SITE'S LAYOUT (462): one JSON value an admin arranges, checked whole § */
/* Shapes only, never which ids exist: the site knows its columns and widgets and ignores the rest. null when broken. */
function layoutClean_(v) {
  let o = v;
  if (typeof o === 'string') {
    if (!o.trim() || o.length > LAYOUT_MAX) return null;
    try { o = JSON.parse(o); } catch (e) { return null; }
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  /* `#` joins a split card's piece to its card (466). */
  const ID = /^[A-Za-z0-9_:.#-]{1,64}$/;
  const ids = (a, max) => (Array.isArray(a) ? a : []).map(x => String(x)).filter(x => ID.test(x))
    .filter((x, i, all) => all.indexOf(x) === i).slice(0, max);
  /* WIDGETS AND DELETED ONLY (463): a 462 value's `columns` and `hidden` are cleaned out. */
  const out = { v: 2, widgets: {}, deleted: ids(o.deleted, 300) };
  /* ONE-OFF (489): before v2 the festive card's delete left the camera looking deleted; a v1 layout gets the camera back and the festive card deleted. */
  if ((Number(o.v) || 1) < 2 && out.deleted.indexOf('item:feed:camera') !== -1) {
    out.deleted = out.deleted.filter(x => x !== 'item:feed:camera');
    if (out.deleted.indexOf('item:feed:festive') === -1) out.deleted.push('item:feed:festive');
  }
  const w = o.widgets && typeof o.widgets === 'object' && !Array.isArray(o.widgets) ? o.widgets : {};
  Object.keys(w).filter(k => ID.test(k)).slice(0, 20).forEach(k => { out.widgets[k] = ids(w[k], 300); });
  /* SPLIT CARDS (464): the ids of the settings and Business cards drawn a field a card; presentation only. */
  const split = ids(o.split, 200).filter(x => /^(set|biz):/.test(x));
  if (split.length) out.split = split;
  /* CARDS ON THE RIGHT-HAND COLUMNS (465): `cards: {col: [ids]}` and `start: {col: id}`, the right-hand columns only. */
  /* AN ADMIN'S OWN COLUMNS (466): `custom: [{id: 'custom-N', title}]`, at most twelve, each a column cards may stand on. */
  const custom = (Array.isArray(o.custom) ? o.custom : []).filter(x => x && typeof x === 'object' && /^custom-\d{1,3}$/.test(String(x.id)))
    .map(x => ({ id: String(x.id), title: String(x.title == null ? '' : x.title).replace(/\s+/g, ' ').trim().slice(0, 40) || 'New column' }))
    .filter((x, i, all) => all.findIndex(y => y.id === x.id) === i).slice(0, 12);
  if (custom.length) out.custom = custom;
  const COLS = ['family', 'staff', 'account', 'tutors', 'students', 'parents', 'biz'].concat(custom.map(x => x.id));
  const c = o.cards && typeof o.cards === 'object' && !Array.isArray(o.cards) ? o.cards : {};
  const cards = {};
  Object.keys(c).filter(k => COLS.indexOf(k) !== -1).forEach(k => { const l = ids(c[k], 300); if (l.length) cards[k] = l; });
  if (Object.keys(cards).length) out.cards = cards;
  const s = o.start && typeof o.start === 'object' && !Array.isArray(o.start) ? o.start : {};
  const start = {};
  /* A WIDGET COLUMN'S START HERE TOO (489). */
  Object.keys(s).filter(k => COLS.concat(['reel', 'tools', 'games', 'shop']).indexOf(k) !== -1 && typeof s[k] === 'string' && ID.test(s[k])).forEach(k => { start[k] = s[k]; });
  if (Object.keys(start).length) out.start = start;
  /* MERGED CARDS (480): `merged: [[top, …, bottom]]`, two to twelve ids each, an id in one group only, a hundred groups at most. */
  const used = {};
  const merged = (Array.isArray(o.merged) ? o.merged : []).filter(g => Array.isArray(g))
    .map(g => ids(g, 12).filter(x => !used[x])).filter(g => g.length > 1 && g.every(x => (used[x] = 1))).slice(0, 100);
  if (merged.length) out.merged = merged;
  /* FRONT DOOR (489): `front: {col, id}`, where everybody lands on opening the app; one at a time. */
  const fr = o.front && typeof o.front === 'object' && !Array.isArray(o.front) ? o.front : null;
  if (fr && ID.test(String(fr.col || '')) && ID.test(String(fr.id || ''))) out.front = { col: String(fr.col), id: String(fr.id) };
  /* WHO SEES WHAT (497): `seen: {id: level}`, a narrowing over the code's own gate; the site asks it, the code's gate still wins. */
  const sn = o.seen && typeof o.seen === 'object' && !Array.isArray(o.seen) ? o.seen : {}, seen = {};
  Object.keys(sn).filter(k => ID.test(k) && ['out', 'in', 'student', 'client', 'staff', 'admin'].indexOf(sn[k]) !== -1).slice(0, 300).forEach(k => { seen[k] = sn[k]; });
  if (Object.keys(seen).length) out.seen = seen;
  if (JSON.stringify(out).length > LAYOUT_MAX) return null;
  return out;
}

/* ---------- THE SITE'S OWN WORDS (497): `{key: text}`, plain text only — the site escapes it when drawn ---------- */
/* A key is a card or widget id, `|`, a slot; a value one line, at most WORDS_PIECE_MAX; {} when broken. */
function wordsClean_(v) {
  let o = v;
  if (typeof o === 'string') {
    if (!o.trim() || o.length > WORDS_MAX) return {};
    try { o = JSON.parse(o); } catch (e) { return {}; }
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
  const out = {};
  Object.keys(o).filter(k => /^[A-Za-z0-9_:.#-]{1,64}\|[a-z]{1,2}:[a-z0-9]{1,10}$/.test(k)).slice(0, 600).forEach(k => {
    const t = String(o[k] == null ? '' : o[k]).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, WORDS_PIECE_MAX);
    if (t) out[k] = t;
  });
  return out;
}

/* ---------- `printPrice` AND `canPrint` WERE HERE, AND THE BACKEND NO LONGER PRICES PAPER § */

/* `optionList` was here — one named list from the options tab. § */


function allOptions() {
  // band_type isn't a sheet list — a resource is banded by grade or by stage, and nothing else.
  // Declared here so the field renders as a dropdown rather than a free-text trap.
  const out = { band_type: ['grade', 'stage'] };
  read(TAB.options).rows.forEach(r => {
    const l = S(r.list_name), v = S(r.value);
    if (!l || !v) return;
    (out[l] = out[l] || []).push(v);
  });
  return out;
}

/* WHAT KIND OF THING each option is — academic, sporty, creative, and so on. § */
function optionFocus() {
  const out = {};
  read(TAB.options).rows.forEach(r => {
    const l = S(r.list_name), v = S(r.value), f = S(r.focus);
    if (!l || !v || !f) return;
    (out[l] = out[l] || {})[v] = f;
  });
  return out;
}

/** Per-hour surcharges, as { level: {GCSE: 1}, subject: {...}, day: {...}, time: {...} }. */
function surcharges() {
  const out = { level: {}, subject: {}, day: {}, time: {}, service: {} };
  read(TAB.pricing).rows.forEach(r => {
    const kind = norm(r.kind), label = S(r.label);
    if (!out[kind] || !label) return;
    out[kind][kind === 'time' ? fmtTime(label) : label] = N(r.surcharge_per_hour);
  });
  return out;
}

function availSet(cellValue) {
  const out = {};
  S(cellValue).split(/[,\s]+/).forEach(c => { if (c) out[norm(c)] = true; });
  return out;
}

/** The frontend still expects { m09: 'TRUE', … }, so expand on the way out. */
function availGridOut(cellValue) {
  const have = availSet(cellValue);
  const out = {};
  AVAIL_DAYS.forEach(([p]) => AVAIL_HOURS.forEach(h => {
    const code = p + String(h).padStart(2, '0');
    out[code] = have[code] ? 'TRUE' : '';
  }));
  return out;
}

/** Collapse a { m09: 'TRUE' } map back to "m09,m10" for storage. */
function availGridIn(fields) {
  const on = [];
  AVAIL_DAYS.forEach(([p]) => AVAIL_HOURS.forEach(h => {
    const code = p + String(h).padStart(2, '0');
    if (fields[code] !== undefined && TRUE_(fields[code])) on.push(code);
  }));
  return on.join(',');
}

/* ---------- A PERSON'S OWN ROWS ON A LIST TAB § */
function ownRows_(tab, r) {
  const pid = S(r && r.person_id);
  if (!pid) return [];
  return read(tab).rows.filter(x => S(x.person_id) === pid);
}
/* AND WRITTEN IN PLACE, NOT DELETED AND APPENDED. § */
function writeOwnRows_(tab, pid, list, cols) {
  const t = read(tab);
  if (!t.sheet) return { changed: 0, missing: true };
  const mine = t.rows.filter(x => S(x.person_id) === pid);
  let changed = 0;
  list.forEach((obj, i) => {
    const vals = { person_id: pid };
    cols.forEach(c => { vals[c] = obj[c] === undefined ? '' : obj[c]; });
    if (mine[i]) changed += setCells(t, mine[i], vals).length;
    else { addRow(t, vals); changed++; }
  });
  mine.slice(list.length).sort((x, y) => y._row - x._row).forEach(x => { delRow(t, x); changed++; });
  return { changed: changed, missing: false };
}

/* ---------- THE LIBRARY CARDS: ROWS ON `library_cards`, NINE BOXES ON THE FORM § */
function libCardsOut(r) {
  const rows = ownRows_(TAB.library_cards, r);
  const out = {};
  for (let i = 1; i <= LIBRARY_CARDS; i++) {
    const c = rows[i - 1] || {};
    out['lib' + i + '_name'] = S(c.library);
    out['lib' + i + '_no']   = S(c.card_number);
    out['lib' + i + '_pin']  = S(c.pin);
  }
  return out;
}
function libCardsIn(fields) {
  const list = [];
  for (let i = 1; i <= LIBRARY_CARDS; i++) {
    const library = S(fields['lib' + i + '_name']).trim();
    const card_number = S(fields['lib' + i + '_no']).trim();
    const pin = S(fields['lib' + i + '_pin']).trim();
    if (library || card_number || pin) list.push({ library, card_number, pin });
  }
  return list;
}
const LIB_COLS = ['library', 'card_number', 'pin'];

/* ---------- THE EXTRA PHOTOGRAPHS: EIGHT BOXES, ONE CELL § */
function photosOut(cellValue) {
  const items = S(cellValue).split('|').map(x => x.trim()).filter(Boolean);
  const out = {};
  for (let i = 1; i <= PHOTO_MAX; i++) out['photos_' + i] = S(items[i - 1]);
  return out;
}
function photosIn(fields) {
  const out = [];
  for (let i = 1; i <= PHOTO_MAX; i++) {
    const v = S(fields['photos_' + i]).replace(/\|/g, '%7C').trim();
    if (v && out.indexOf(v) === -1) out.push(v);
  }
  return out.join(' | ');
}
/* A PHOTOGRAPH IS A LINK, AND ANYTHING ELSE IS REFUSED BY NAME rather than kept. § */
function photosRefusal_(fields) {
  for (let i = 1; i <= PHOTO_MAX; i++) {
    const v = S(fields['photos_' + i]).trim();
    if (v && !/^https?:\/\/\S+$/i.test(v)) {
      return 'Photo ' + i + ' is not a link. Paste the address of the picture — it starts https://';
    }
  }
  return '';
}
/* THE LIST THE CARD DRAWS: § */
function photosList_(r) {
  const face = S(r.photo).trim();
  return S(r.photos).split('|').map(x => x.trim())
    .filter((v, i, all) => /^https?:\/\//i.test(v) && v !== face && all.indexOf(v) === i)
    .slice(0, PHOTO_MAX);
}

/* ---------- THE FACE CELL: A LINK, NOTHING, OR ONE OF ELEVEN TOKENS — AND THIS IS THE ONE PLACE IT IS ASKED § */
function photoChoice_(v) {
  const s = S(v).trim().toLowerCase();
  return PFP_CHOICES.indexOf(s) === -1 ? '' : s;
}
function photoRefusal_(v) {
  const s = S(v).trim();
  if (!s || /^https?:\/\/\S+$/i.test(s) || photoChoice_(s)) return '';
  return 'Your picture must be a photo, one of the pictures, or your figure — "' + s.slice(0, 40)
    + '" is none of them, so nothing was saved.';
}
/* ---------- AND WHEN THE FACE IS YOUR FIGURE, THE FIGURE GOES WITH IT, AND NOT OTHERWISE § */
function faceFig_(r) {
  return photoChoice_(r && r.photo) === PFP_AVATAR ? { avatar: S(r.avatar) } : {};
}
/* THE FACE A MESSAGE HEAD DRAWS (413): their chosen picture; none chosen, their figure if they dressed one; else nothing (the initial). */
function msgFace_(r) {
  if (!r) return { pic: '' };
  const photo = S(r.photo).trim(), fig = S(r.avatar);
  /* A CHILD'S OWN PHOTOGRAPH STAYS OFF OTHER PEOPLE'S SCREENS WHEN THEY HAVE A FIGURE — the post face's rule (doGet). */
  const kidHid = photo && !photoChoice_(photo) && isChild_(r) && !!fig;
  const pic = photo && !kidHid ? photo : (fig ? PFP_AVATAR : '');
  return photoChoice_(pic) === PFP_AVATAR ? { pic: pic, avatar: fig } : { pic: pic };
}

/* ---------- THE VENUES A TUTOR IS HAPPY TO TEACH AT, WHICH THE VENUES TAB ALREADY RECORDED § */
function venuesPersonIs_(entry, p) {
  const k = key(entry);
  if (!k || !p) return false;
  return [p.person_id, p.handle, S(p.first_name) + S(p.last_name)].some(v => S(v) && key(v) === k);
}
function venuesListOf_(r) {
  return S(r && r.tutors_happy_here).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
}
/* The names of the venues this person is on, in the tab's own order. */
function venuesFor_(p, venueRows) {
  return (venueRows || []).filter(v => S(v.name) && venuesListOf_(v).some(e => venuesPersonIs_(e, p)))
    .map(v => S(v.name));
}
/* WHAT EACH VENUE'S CELL SHOULD HOLD once this person has chosen `names`. § */
function venuesWrites_(p, chosen, venueRows) {
  const want = {};
  S(chosen).split(/[,\n]/).map(x => key(x)).filter(Boolean).forEach(k => { want[k] = true; });
  const me = S(p.person_id) || S(p.handle);
  const out = [];
  (venueRows || []).forEach(v => {
    if (!S(v.name)) return;
    const list = venuesListOf_(v);
    const mine = list.filter(e => venuesPersonIs_(e, p));
    /* IN PLACE, NOT MOVED TO THE END. § */
    let kept = false;
    const next = want[key(v.name)]
      ? (mine.length ? list.filter(e => !venuesPersonIs_(e, p) || (!kept && (kept = true))) : list.concat([me]))
      : list.filter(e => !venuesPersonIs_(e, p));
    const cell = next.join(', ');
    if (cell !== list.join(', ')) out.push({ row: v, cell: cell });
  });
  return out;
}

/* ---------- QUALIFICATIONS: ROWS ON `qualifications`, FORTY BOXES ON THE FORM § */
function qualsList_(r) {
  return ownRows_(TAB.qualifications, r).map(x => {
    const spec = TRUE_(x.teach);
    return { subject: S(x.subject), level: S(x.level), board: S(x.institution), grade: S(x.grade),
             received: S(x.completed), spec: spec, teach: spec || TRUE_(x.can_teach) };
  }).filter(q => q.subject || q.level || q.board || q.grade || q.received).slice(0, QUAL_MAX);
}
function qualsOut(r) {
  const list = qualsList_(r), out = {};
  for (let i = 1; i <= QUAL_MAX; i++) {
    const q = list[i - 1] || {};
    out['qual_' + i] = S(q.subject);
    out['qual_' + i + '_level'] = S(q.level);
    out['qual_' + i + '_board'] = S(q.board);
    out['qual_' + i + '_grade'] = S(q.grade);
    out['qual_' + i + '_received'] = S(q.received);
    out['qual_' + i + '_teach'] = q.teach ? 'TRUE' : '';
    out['qual_' + i + '_spec'] = q.spec ? 'TRUE' : '';
  }
  return out;
}
/* AND THE FORTY BOXES BACK INTO ROWS, EVERY EMPTY SLOT DROPPED — a qualification is a list rather
   than a slot anybody remembers by position, and the shelf draws the filled ones plus one empty. */
function qualsIn(fields) {
  const yes = v => /^(true|yes|1|✓)$/i.test(S(v));
  const list = [];
  for (let i = 1; i <= QUAL_MAX; i++) {
    const g = k => S(fields['qual_' + i + k]).trim();
    const q = { subject: g(''), level: g('_level'), institution: g('_board'), grade: g('_grade'),
                completed: g('_received') };
    if (!(q.subject || q.level || q.institution || q.grade || q.completed)) continue;
    const spec = yes(fields['qual_' + i + '_spec']);
    q.teach = spec ? 'TRUE' : 'FALSE';
    q.can_teach = (!spec && yes(fields['qual_' + i + '_teach'])) ? 'TRUE' : 'FALSE';
    list.push(q);
  }
  return list;
}
const QUAL_COLS = ['subject', 'level', 'grade', 'institution', 'completed', 'teach', 'can_teach'];
/* WHAT A TUTOR TEACHES, AS THE CARD PRINTS IT — `Maths (GCSE)` — derived from the ticks rather than kept in a column of its own. § */
const teachPhrase_ = q => S(q.subject) + (S(q.level) ? ' (' + S(q.level) + ')' : '');
function teachesOf_(r) {
  const list = qualsList_(r);
  const seen = {}, all = [], main = [];
  list.filter(q => q.spec).concat(list.filter(q => q.teach && !q.spec)).forEach(q => {
    if (!S(q.subject)) return;
    const p = teachPhrase_(q), k = p.toLowerCase();
    if (seen[k]) return;
    seen[k] = true; all.push(p);
    if (q.spec) main.push(p);
  });
  /* `main` is EVERY level ticked Teach, in sheet order. `first` is the first of them, for a phone
     built before several were allowed — it reads one string as `teachesMain`. */
  return { main: main, first: main[0] || '', all: all };
}

/* ---------- A QUALIFICATION AS ITS PARTS, AND THE SENTENCE OFF THE SAME PARTS § */
const QUAL_CERTS = ['PGCE', 'QTS', 'DBS', 'First Aid', 'DofE Gold'];
const QUAL_CERT_LEVELS = ['Basic', 'Standard', 'Enhanced'];
function qualsParts_(r) {
  const isIn = (list, v) => list.some(x => key(x) === key(v));
  return qualsList_(r).filter(q => S(q.subject)).map(q => ({
    subject: S(q.subject), level: S(q.level), grade: S(q.grade), board: S(q.board), received: S(q.received),
    kind: isIn(QUAL_CERTS, q.subject) || isIn(QUAL_CERT_LEVELS, q.level) ? 'cert' : 'subject'
  }));
}
/* WHERE, AFTER THE GRADE: § */
function qualSentence_(p) {
  const rec = S(p.received);
  const when = /^present$/i.test(rec) ? '— studying now' : rec ? '(' + rec + ')' : '';
  return [S(p.subject), S(p.level), S(p.grade) && ('grade ' + S(p.grade)), S(p.board) && ('at ' + S(p.board)), when]
    .filter(Boolean).join(' ');
}

/* ---------- A DATE OF BIRTH, AS THREE BOXES AND BACK § */
/* THE PHONE CELL AS TWO BOXES. § */
function phoneOut(cellValue) {
  let v = S(cellValue).replace(/^00/, '+');
  if (!v) return { phone_cc: PHONE_CODES[0], phone_no: '' };
  if (v[0] === '+') {
    const digits = v.slice(1).replace(/\D/g, '');
    const cc = PHONE_CODES.filter(c => digits.indexOf(c.slice(1)) === 0)
                          .sort((a, b) => b.length - a.length)[0];
    if (cc) {
      /* The rest keeps the spacing it was typed with, minus the code itself. */
      const rest = v.replace(/^\+\s*/, '').replace(new RegExp('^' + cc.slice(1)), '').trim();
      return { phone_cc: cc, phone_no: rest };
    }
    const m = v.match(/^\+(\d{1,4})\s*(.*)$/);
    return { phone_cc: m ? '+' + m[1] : PHONE_CODES[0], phone_no: m ? S(m[2]) : v };
  }
  return { phone_cc: PHONE_CODES[0], phone_no: v.replace(/^0(?=\d)/, '') };
}
function phoneIn(fields) {
  const cc = /^\+\d{1,4}$/.test(S(fields.phone_cc)) ? S(fields.phone_cc) : PHONE_CODES[0];
  /* Digits and spaces only, and one trunk 0 off the front — `+44 07700` is not a number anybody
     can dial. Italy keeps it, because there the 0 is part of the number. */
  let no = S(fields.phone_no).trim();
  /* A NUMBER TYPED WITH ITS OWN CODE — `+44 7700 900123`, or `0044 …` — had the code put on a second time: § */
  const ccd = cc.slice(1);
  if (/^(\+|00)/.test(no)) no = no.replace(/^(\+|00)\s*/, '').replace(new RegExp('^' + ccd + '\\s*'), '');
  no = no.replace(/[^\d ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cc !== '+39') no = no.replace(/^0(?=\d)/, '');
  return no ? cc + ' ' + no : '';
}
function dobOut(cellValue) {
  /* ---------- A REAL DATE, OR THE ONE WRITTEN FORM — AND NOTHING ELSE § */
  const d = (cellValue instanceof Date && !isNaN(cellValue)) ? cellValue
          : (/^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}$/.test(S(cellValue)) ? sheetDate(cellValue) : null);
  if (!d) return { dob_d: S(cellValue), dob_m: '', dob_y: '' };
  return { dob_d: String(d.getDate()), dob_m: String(d.getMonth() + 1), dob_y: String(d.getFullYear()) };
}

function dobIn(fields) {
  const n = v => S(v).replace(/[^0-9]/g, '');
  const d = n(fields.dob_d), m = n(fields.dob_m), y = n(fields.dob_y);
  if (!d && !m && !y) return '';
  return ('0' + d).slice(-2) + '/' + ('0' + m).slice(-2) + '/' + y;
}

/* ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE § */
function dobRefusal_(fields) {
  const n = v => S(v).replace(/[^0-9]/g, '');
  const d = n(fields.dob_d), m = n(fields.dob_m), y = n(fields.dob_y);
  if (!d && !m && !y) return '';                       // clearing it is allowed
  if (!d || !m || !y) return 'A date of birth needs all three boxes — day, month and year.';
  if (y.length !== 4) return 'Write the year in full, like 1985.';
  const dd = Number(d), mm = Number(m), yy = Number(y);
  if (mm < 1 || mm > 12) return 'There is no month ' + mm + '.';
  /* THE REAL LENGTH OF THAT MONTH IN THAT YEAR, which is what makes 29/02 right in 2024 and wrong in 2023. § */
  const last = new Date(yy, mm, 0).getDate();
  if (dd < 1 || dd > last) return 'There is no ' + dd + '/' + ('0' + mm).slice(-2) + ' in ' + yy + '.';
  const when = new Date(yy, mm - 1, dd);
  if (when.getTime() > Date.now()) return 'That is in the future.';
  if (yy < 1900) return 'Check the year.';
  return '';
}

/* ---------- A DATE AS `yyyy-mm-dd`, WHICH IS THE ONE FORM A DATE PICKER SPEAKS § */
function isoDate_(v) {
  const p = n => ('0' + n).slice(-2);
  if (v instanceof Date && !isNaN(v)) {
    return v.getFullYear() + '-' + p(v.getMonth() + 1) + '-' + p(v.getDate());
  }
  const t = S(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const dmy = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) return dmy[3] + '-' + p(dmy[2]) + '-' + p(dmy[1]);
  return '';
}

/* ---------- AND WHY IT MAY NOT BE WRITTEN, AS A SENTENCE § */
function isoRefusal_(v, what) {
  const t = S(v);
  if (!t) return '';                                   // clearing it is allowed
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return 'The ' + what + ' is not a date this form can read.';
  const yy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
  if (mm < 1 || mm > 12) return 'There is no month ' + mm + '.';
  const last = new Date(yy, mm, 0).getDate();
  if (dd < 1 || dd > last) return 'There is no ' + dd + '/' + m[2] + ' in ' + yy + '.';
  if (yy < 2000 || yy > 2100) return 'Check the year.';
  return '';
}

/** A sheet date, however it's stored. A real Date, or dd/mm/yyyy text — never mm/dd, which is
    what new Date() assumes and why "25/10/2026" parsed as an invalid month 25 and silently
    became zero sessions. */
function sheetDate(v) {
  if (v instanceof Date) return isNaN(v) ? null : v;
  const t = String(v || '').trim();
  if (!t) return null;
  const dmy = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    const yr = Number(dmy[3]) < 100 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    const d = new Date(yr, Number(dmy[2]) - 1, Number(dmy[1]));
    return isNaN(d) ? null : d;
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

/**
 * A DATE AND A TIME, for a message.
 *
 * `fmtDate` gives the day, which is enough for a booking and useless for a conversation — two
 * messages on the same afternoon would show the same thing and could not be told apart.
 */
function fmtDateTime(v) {
  const d = sheetDate(v);
  if (!d) return '';
  const p = n => String(n).padStart(2, '0');
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2)
       + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}