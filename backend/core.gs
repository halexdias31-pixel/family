/* ==================================================================================================
   @family. — 10_core.gs   (2 of 8)

   READING AND WRITING THE SHEET, and the small helpers everything uses.

   `read`, `setCell` and `addRow` are the only three things in this project that touch a
   spreadsheet cell. Everything else asks them. That is what makes the write-miss check possible:
   one place records a column that is not there, and `jsonOut` — the one exit — turns a request
   that lost a value into an error rather than a success.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */


/**
 * Drop the per-request cache. Reads are cached so doGet doesn't fetch the same tab seven times,
 * but a handler that appends events and then wants to re-fold them needs the fresh rows — and
 * anything holding a stale copy after its own write is the bug class that has bitten this code
 * more than once.
 */
function clearCache() {
  Object.keys(_cache).forEach(k => { delete _cache[k]; });
  /* The open documents go too. A handler clearing the row cache because it has just written is
     asking for the sheet as it is NOW, and a held document object is the thing it would be read
     through. */
  _open = {};
}

/* ---------- WHICH FILE, AND WHAT IT IS CALLED IN THERE --------------------------------------------
   One lookup, used by `read`, `ensureSchema` and `checkTabs`. Those are the only places that turn
   a tab name into an actual sheet, and they have to agree — if `read` fetched boxers from the
   subjects file while `ensureSchema` looked for it in the main one, `ensureSchema` would helpfully
   create a second empty `boxers` tab back in the database you just moved it out of.

   TWO NAMES, TRIED IN ORDER. The name the code asks for wins; `alsoTry` is the fallback. Renaming
   the tabs in the spreadsheet is therefore something you can do one at a time, in any order, with
   the site up the whole way through — which is the state this was actually in when it was written,
   with one of four renamed and three not. `make` is the name to use if a tab has to be CREATED,
   and it is always the plain one, so nothing new is ever born with a prefix. */
function sheetFor_(name) {
  const w = ELSEWHERE[name];
  if (!w) return { id: SPREADSHEET_ID, names: [name], make: name, away: '' };
  return { id: FILES[w.file] || '',
           names: w.alsoTry ? [name, w.alsoTry] : [name],
           make: name, away: w.file };
}

/* ---------- ONE OPEN PER FILE PER REQUEST ---------------------------------------------------------
   `openById` WAS CALLED ONCE PER TAB. `read` caches its ROWS, so a tab is only read once — but the
   cache is checked after `findSheet_` has already opened the file, and the file is opened again for
   every tab in it. A payload touches about thirty tabs across two spreadsheets, so this was thirty
   opens to reach two documents, and an open is a round trip to Google's servers whether or not
   anything is read afterwards.

   HELD BY ID, NOT BY TAB, which is why it is a second cache and not part of `_cache`: `_cache` is
   keyed on the tab name and there are thirty of those to two files. Cleared with the rest, so a
   handler that writes and re-reads gets a fresh document as it always did. */
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
  /* NO FILE, OR NO TAB UNDER EITHER NAME, is answered the same way — an empty result. That is what
     it is from every caller's point of view, and an unfilled SUBJECTS_ID is the ordinary case on
     the day this deploys. */
  const sheet = findSheet_(sheetFor_(name));
  if (!sheet) return (_cache[name] = { sheet: null, headers: [], rows: [] });
  /* ---------- THE LAST ROW WITH DATA, NOT THE LAST ROW SOMETHING TOUCHED --------------------------
     `getDataRange()` goes to the furthest cell anything has ever been done to — a paste that
     overshot, an import that filled the grid, a format applied to a whole column. On the posts tab
     that is 998 rows holding 11 posts, so every page load carried twenty-six thousand empty cells
     across the wire for eleven photographs.

     `getLastRow()` and `getLastColumn()` answer the narrower question — where the DATA ends — and
     they are the two calls this should always have used. The rows below are dropped by the filter
     at the bottom of this function anyway, so nothing downstream changes: the only difference is
     that they are no longer fetched first.

     A COMPLETELY EMPTY TAB has a last row of 0, and asking for a range of zero rows throws. That is
     the freshly-created tab, right after `ensureSchema` makes one, so it is the ordinary case on
     the day a feature is added rather than an exotic one. */
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

/** Write one cell and keep the in-memory object in step. Records a column that is not there. */
function setCell(t, row, field, value) {
  if (!t.sheet || !row) return false;
  const c = t.headers.indexOf(field);
  if (c < 0) { missedWrite_(t, field); return false; }
  t.sheet.getRange(row._row, c + 1).setValue(value);
  row[field] = value;              // read-after-write within this request now sees the truth
  POST_WROTE = true;               // the stored payload no longer matches the sheet
  return true;
}

/** Append a record. Fields not in the tab are dropped rather than shifting the row. */
function addRow(t, obj) {
  if (!t.sheet) return null;
  Object.keys(obj || {}).forEach(k => {
    if (t.headers.indexOf(k) < 0) missedWrite_(t, k);
  });
  const line = t.headers.map(h => (obj[h] !== undefined ? obj[h] : ''));
  t.sheet.appendRow(line);
  POST_WROTE = true;               // the stored payload no longer matches the sheet
  const row = Object.assign({ _row: t.sheet.getLastRow() }, obj);
  t.rows.push(row);
  return row;
}

/** One entry per tab-and-field, however many rows tried to write it. */
function missedWrite_(t, field) {
  let tab = '?';
  try { tab = t.sheet.getName(); } catch (err) {}
  if (!WRITE_MISSES.some(x => x.tab === tab && x.field === field)) {
    WRITE_MISSES.push({ tab: tab, field: field });
  }
}

/**
 * THE ONE EXIT. Every reply in this file goes through here, which is why the check belongs here
 * rather than in fifty handlers that would each have to remember it.
 *
 * A request that tried to write to a column that does not exist did not do what it was asked, so
 * it does not get to say `success`. The value is gone either way; the difference is whether
 * anybody finds out today or in three weeks when somebody notices their avatar keeps resetting.
 */
/* ---------- SET BY THE WRITES THEMSELVES ----------------------------------------------------------
   THIS WAS SET AT THE TOP OF `doPost`, ON THE GROUNDS THAT A POST IS A WRITE. It is not. `messages`
   is a POST and reads an inbox; `signOut` is a POST; several more only look things up. Opening the
   messages widget therefore emptied the payload cache, and on a signed-in phone that is a POST on
   the way in — so the cache was cleared about as often as it was filled, and the app was exactly as
   slow as it had been before any of this existed.

   SO IT IS THE WRITE THAT SAYS SO. `setCell` and `addRow` are the two functions that put anything
   into a spreadsheet, and the payload is stale if and only if one of them succeeded. A read-only
   POST now touches neither, and leaves the cache alone.

   READ BY `jsonOut`, which is the one exit every one of `doPost`'s two hundred and fifty returns
   goes through — the same reason the unwritten-column check lives there rather than in fifty
   handlers. */
let POST_WROTE = false;

function jsonOut(obj) {
  /* AFTER the write, not before it. Emptied at the top of `doPost` instead, a request arriving in
     the gap would rebuild the payload from the sheet as it was a moment BEFORE the change and
     store that — an invalidation that puts back the very thing it removed. */
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
        + '. Those columns are not in the sheet — deploy and reload, or run ensureSchema.';
    }
  }
  const body = JSON.stringify(obj);
  /* WRAPPED AND SERVED AS A SCRIPT, when a callback was asked for. The name is checked rather than
     trusted: it goes into a page as executable code, so anything but a plain identifier is refused
     — a callback of `alert(1)//` would otherwise be a way to run whatever somebody liked inside
     this page. */
  if (JSONP_CB && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(JSONP_CB)) {
    return ContentService.createTextOutput(JSONP_CB + '(' + body + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==================================================================================================
   THE PAYLOAD CACHE.

   WHY THE APP IS SLOW, stated plainly: `doGet` rebuilds the whole payload from the spreadsheet on
   every single request. Around thirty tabs, each its own `getValues()` round trip, then the folding
   and the joins on top — fifteen seconds of it, and every visitor pays the full price even though
   the answer they get is, for almost all of them, the answer the last visitor got.

   SO THE FINISHED JSON IS KEPT. Not the rows: the finished, serialised body, exactly as it went out
   last time. That matters — rows hold Date objects, and a cache that serialises rows hands back
   ISO strings that look like dates and are not, which would break `fmtDate` and everything counting
   on it in ways nobody would find for weeks. A string that was already going to be a string cannot
   change type on the way through.

   A HUNDRED KILOBYTES IS THE CEILING on one cache value, and the payload is bigger than that. So it
   is cut into numbered chunks with an index key naming them, and `getAll`/`putAll` move the lot in
   one call each rather than one per chunk. A missing chunk — they expire independently — is treated
   as a miss and the payload is rebuilt, which is the only safe reading of half an answer.

   IT IS NOT STALENESS THE WAY A BROWSER CACHE IS. Nothing is held on anybody's phone; this lives in
   the script, and `clearPayloadCache()` empties it. `doPost` calls that after anything that writes,
   so an edit made in the app is visible on the next load. A change typed straight into the
   spreadsheet is the case a write cannot see, which is what the TTL is for.
================================================================================================== */
/* SIX HOURS, WHICH IS THE MAXIMUM THE SERVICE ALLOWS, and not a compromise between freshness and
   speed — a write invalidates immediately, so freshness is not what this number controls. It was
   300, and on a site with a few dozen visits a day spread across the hours that meant almost every
   visitor found an expired entry and paid the full rebuild: a cache that never fires, and all of
   the code with none of the benefit. The only thing this number delays is an edit typed straight
   into the spreadsheet rather than made in the app. */
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

/** Store `body` under `key`. Silent on failure: a cache that cannot be written is not an error. */
function cachePut_(key, body) {
  const c = payloadCache_();
  if (!c || !body) return;
  try {
    const parts = {};
    let n = 0;
    for (let i = 0; i < body.length; i += CACHE_CHUNK) {
      parts[CACHE_TAG + key + ':' + n] = body.substr(i, CACHE_CHUNK);
      n++;
      if (n > 200) return;                 /* absurdly large: not worth caching, and not an error */
    }
    c.putAll(parts, PAYLOAD_TTL);
    /* THE INDEX IS WRITTEN LAST. Written first, a request arriving between the two calls would find
       an index promising chunks that are not there yet — which `cacheGet_` handles, but there is no
       reason to create the case. */
    c.put(CACHE_TAG + key, String(n), PAYLOAD_TTL);
  } catch (err) {}
}

/* ---------- WHO GETS WHOSE COPY -------------------------------------------------------------------
   THE PAYLOAD IS NOT THE SAME FOR EVERYBODY. `person` decides which posts come back marked as liked
   and which orders are yours; `name` decides `viewerIsAdmin`, which decides whether unlisted tutors,
   deleted posts and the print queue are in there at all. Two people sharing a cache entry across
   that line would be one of them seeing the other's answer, so both go in the key.

   EVERYTHING ELSE IS A DIFFERENT ENDPOINT — `setup`, `run`, `map`, `receipts` and the rest all
   return before the payload is built — so a request carrying one of them is not cached at all
   rather than being given a key it would never hit twice. */
function payloadKey_(p) {
  const special = ['run', 'setup', 'pages', 'map', 'receipts', 'galleryOnly',
                   'triggers', 'debugTiming', 'health'];
  for (let i = 0; i < special.length; i++) if (S(p[special[i]])) return '';
  /* THE VERSION AND THE GENERATION ARE BOTH IN IT. The version so a deploy cannot serve a body
     built by the code before it; the generation so `clearPayloadCache` can invalidate everything
     at once without being able to list what it stored. */
  return payloadGen_() + '|' + BACKEND_VERSION + '|' + S(p.person) + '|' + S(p.name);
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

/** The generation number, which prefixes every key — see `clearPayloadCache`. */
function payloadGen_() {
  try {
    return PropertiesService.getScriptProperties().getProperty('PAYLOAD_GEN') || '0';
  } catch (err) { return '0'; }
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
    /* Any formula_* row is skipped. They're no longer seeded, but a sheet that has them from
       before must not have them read as coefficients — a row whose value is the sentence
       "per hour x h x sessions" would otherwise be looked up as a number and come back NaN. */
    if (k && k.indexOf('formula_') !== 0) out[k] = r.value;
  });
  return out;
}

/* WHAT A PRINTED COPY COSTS, in pounds. The one price on this site that is not tuition and does
   not behave like it: no multipliers, no discounts, no per-child anything. Paper and toner.

   NO PAGE COUNT, NO PRICE. Zero pages means nobody has counted this one yet, and £0.00 would be
   the site answering a question it has not asked anybody. Null, and the phone renders null as a
   sentence rather than as a number. */
function printPrice(pages) {
  const n = N(pages);
  if (n <= 0) return null;
  const cfg = config();
  const rate = N(cfg.print_rate_per_page);
  if (rate <= 0) return null;                 // rate not set: printing is off, not free
  const min = N(cfg.print_minimum);
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

/** Whether a paper copy is offered at all. An explicit FALSE beats any page count — countable and
    worth printing are different questions, and a 400-page textbook answers the first one yes. */
function canPrint(row) {
  if (norm(row.printable) === 'false' || norm(row.printable) === 'no') return false;
  return printPrice(row.pages) !== null;
}

/* `optionList` was here — one named list from the options tab. `allOptions` returns every list in
   a single pass and the payload has used that since it was written, so this read the same tab again
   to answer a smaller question nobody asked. */


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

/**
 * WHAT KIND OF THING each option is — academic, sporty, creative, and so on.
 *
 * Kept beside the lists rather than inside them, because everything that reads a list wants the
 * plain values: a dropdown of subjects should be a dropdown of subjects, not of objects. Anything
 * that wants the focus asks for it separately.
 */
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