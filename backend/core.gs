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
           names: [name],
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

/* ---------- THE ONE STORE (owner, 17 Nov): a tab whose kind kinds.json `ledger.moved` lists is read from, and written to, the items tab. */
/* Every reader still asks `read(tab)` and gets { sheet, headers, rows } shaped as the tab was; setCell/setCells/addRow/delRow see `t.moved`. */
/* A moved kind is the store's alone: its old tab is locked and never read or written again. */
function storeMoved_(name) {
  const K = ITEM_STORE_KINDS, out = [];
  (K.moved || []).forEach(k => { const s = K.kinds[k] && K.kinds[k].sheet; if (s && s.tab === name && !s.blob) out.push(k); });
  /* A KIND THAT RIDES ON A MOVED KIND'S TAB (tutor on people) comes with it. */
  if (out.length) Object.keys(K.kinds).forEach(k => { const s = K.kinds[k].sheet; if (s.via && out.indexOf(s.via) !== -1 && out.indexOf(k) === -1) out.push(k); });
  return out.length ? out : null;
}
/* A VALUE AS SHEETS WOULD HAVE HANDED IT OVER: {"$d": serial} is a Date in the script's time zone; numbers, ticks and text are as stored. */
function storeCell_(v) {
  if (v && typeof v === 'object' && typeof v.$d === 'number') {
    const days = Math.floor(v.$d), d = new Date(1899, 11, 30);
    d.setDate(d.getDate() + days);
    d.setMilliseconds(Math.round((v.$d - days) * 864e5));
    return d;
  }
  return v;
}
function storeCellOut_(v) {
  /* A LEADING ' MEANS "TEXT" TO SHEETS, which keeps the rest and drops the mark (`week_of` is written so); the store does the same. */
  /* AND A TYPED WORD BECOMES WHAT SHEETS MAKES OF IT: "TRUE"/"FALSE" a tick, "12" or "-0.5" a number (not "012", which cellSafe_ marks as text). */
  if (typeof v === 'string') {
    if (v.charAt(0) === "'") return v.slice(1);
    if (/^(true|false)$/i.test(v)) return /^true$/i.test(v);
    if (/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(v)) return Number(v);
    return v;
  }
  if (!(v instanceof Date) || isNaN(v)) return v;
  const base = new Date(1899, 11, 30), mid = new Date(v.getFullYear(), v.getMonth(), v.getDate());
  return { $d: Math.round((mid - base) / 864e5) + (v - mid) / 864e5 };
}
/* AN EVENT KIND'S ROWS ARE IN THE EVENTS TAB ({at, who, kind, what, item, data}), the old row whole in `data`; an item kind's in `data_1`. */
const STORE_MARK = '~moved';
function storeIsEvents_(kinds) { const s = ITEM_STORE_KINDS.kinds[kinds[0]].sheet; return s.to === 'events' ? s : null; }
/* ---------- ONLY THE ROWS A REQUEST ASKS FOR (17 Nov): the items and events tabs are read as their `kind` column first, */
/* then just the runs of rows of the kinds asked, so a request that wants the venues never reads the health log. One image */
/* per tab per request, in the request cache (`clearCache` drops it); writes go through it as through any table. */
function storeImg_(tab, kinds) {
  const ck = '~img:' + tab;
  let img = _cache[ck];
  if (!img) {
    const sheet = findSheet_(sheetFor_(tab));
    img = { sheet: sheet, headers: [], rows: [], kindOf: [], loaded: {} };
    const lr = sheet ? sheet.getLastRow() : 0, lc = sheet ? sheet.getLastColumn() : 0;
    if (lr && lc) {
      img.headers = (sheet.getRange(1, 1, 1, lc).getValues()[0] || []).map(h => String(h).trim());
      const kc = img.headers.indexOf('kind');
      if (lr > 1 && kc >= 0) img.kindOf = sheet.getRange(2, kc + 1, lr - 1, 1).getValues().map(r => S(r[0]));
    }
    _cache[ck] = img;
  }
  const need = [];
  img.kindOf.forEach((k, i) => { if (kinds.indexOf(k) !== -1 && !img.loaded[i + 2]) need.push(i + 2); });
  for (let a = 0; a < need.length;) {
    let b = a;
    while (b + 1 < need.length && need[b + 1] === need[b] + 1) b++;
    const vals = img.sheet.getRange(need[a], 1, b - a + 1, img.headers.length).getValues();
    vals.forEach((v, j) => {
      const o = { _row: need[a] + j };
      img.headers.forEach((h, c) => { if (h) o[h] = v[c]; });
      img.loaded[o._row] = o;
      img.rows.push(o);
    });
    a = b + 1;
  }
  return img;
}
function storeRead_(name, kinds) {
  const ev = storeIsEvents_(kinds), col = ev ? 'data' : 'data_1';
  const it = storeImg_(ev ? TAB.events_log : TAB.items, kinds);
  const all = it.rows.filter(r => kinds.indexOf(S(r.kind)) !== -1).sort((a, b) => a._row - b._row);
  /* THE MARKER ROW (id `~moved`, or what `~moved` for an event kind) says the kind has moved and holds its tab's columns, */
  /* so a kind whose last row was deleted stays here (never falls back to its stale old tab) and a new row gets every column. */
  const isMark = r => S(ev ? r.what : r.id) === STORE_MARK, marks = all.filter(isMark), mine = all.filter(r => !isMark(r));
  /* NO MARKER AND NO ROWS: still the store's (the fallback to the old tab is gone, 17 Nov), with SCHEMA's columns for a first row, */
  /* else the kind's own kinds.json `sheet.columns` (a kind new to the store, with no old tab: the owner's partners, food, tasks, 17 Nov). */
  const own = kinds.map(k => ITEM_STORE_KINDS.kinds[k].sheet.columns).find(Boolean) || [];
  const headers = (!mine.length && !marks.length) ? ((typeof SCHEMA === 'object' && SCHEMA[name]) || own).slice() : [], rows = [];
  marks.forEach(r => { let d = {}; try { d = JSON.parse(S(r[col]) || '{}'); } catch (err) { d = {}; } (d._headers || []).forEach(h => { if (h && headers.indexOf(h) < 0) headers.push(h); }); });
  mine.forEach((r, i) => {
    let d = {};
    try { d = JSON.parse(S(r[col]) || '{}'); } catch (err) { d = {}; }
    /* ITS ROW NUMBER AS THE OLD TAB HAD IT (the migration keeps the order): ids made of `_row` (the shop's) stay the same. */
    const row = { _row: i + 2 };
    /* THE ITEMS ROW BEHIND IT, kept out of sight so no payload carries it. */
    Object.defineProperty(row, '_item', { value: r, enumerable: false, writable: true });
    Object.keys(d).forEach(h => { if (headers.indexOf(h) < 0) headers.push(h); row[h] = storeCell_(d[h]); });
    rows.push(row);
  });
  return { sheet: it.sheet, headers, rows, moved: { name, kinds, items: it, ev, marks } };
}
/* `fields` named: only those change, laid over the row AS THE SHEET HOLDS IT NOW (read fresh), so two requests that each */
/* change a different field of one row (a PIN and an xp) both land, as two cell writes on the old tab did. */
function storeSave_(t, row, fields) {
  const it = t.moved.items, ev = t.moved.ev;
  let d = {};
  if (fields && !ev) {
    try { d = JSON.parse(S(it.sheet.getRange(row._item._row, it.headers.indexOf('data_1') + 1).getValue()) || '{}'); } catch (err) { d = {}; }
    fields.forEach(h => { d[h] = storeCellOut_(row[h]); });
  } else t.headers.forEach(h => { if (row[h] !== undefined) d[h] = storeCellOut_(row[h]); });
  const data = JSON.stringify(d);
  if (!ev) { setCell(it, row._item, 'data_1', data); return; }
  setCells(it, row._item, { at: row[ev.at] ?? '', who: row[ev.who] ?? '', what: ev.what ? row[ev.what] ?? '' : '', item: ev.item ? row[ev.item] ?? '' : '', data: data });
}
function storeAdd_(t, obj) {
  const K = ITEM_STORE_KINDS.kinds, home = t.moved.kinds.find(k => !K[k].sheet.via), sh = K[home].sheet;
  Object.keys(obj).forEach(h => { if (t.headers.indexOf(h) < 0) t.headers.push(h); });
  const id = [].concat(sh.id || []).map(c => S(obj[c])).join(':');
  const b = sh.kindBy, kind = b && norm(obj[b.column]).indexOf(b.match) !== -1 ? b.kind : home;
  const item = t.moved.ev ? addRow(t.moved.items, { at: '', who: '', kind: home, what: '', item: '', data: '{}' })
                          : addRow(t.moved.items, { id: id, kind: kind, data_1: '{}' });
  /* AND THE IMAGE KNOWS THE NEW ROW, so a read of that kind later in this request finds it. */
  if (item && t.moved.items.kindOf) { t.moved.items.kindOf[item._row - 2] = S(item.kind); t.moved.items.loaded[item._row] = item; }
  /* A NEW ROW HAS EVERY COLUMN, blank where not given, as an appended sheet row has. */
  const row = Object.assign({ _row: t.rows.length + 2 }, Object.fromEntries(t.headers.map(h => [h, ''])), obj);
  Object.defineProperty(row, '_item', { value: item, enumerable: false, writable: true });
  storeSave_(t, row);
  t.rows.push(row);
  return row;
}

/* ---------- THE LOGS KEEP THEIR LAST N DAYS (17 Nov): health and lens events older than config `store_trim_days` (90 if unset) */
/* are deleted from the events tab, in runs, newest first so the row numbers below stay true. Run by tidyOldRows. */
/* A MOVED TAB'S COLUMNS, as ensureSchema_ asks: SCHEMA's that its marker row lacks are added to the marker. */
function storeSchema_(name, cols) {
  const t = read(name);
  if (!t.moved) return 'moved, but the items tab has none of it yet';
  const mark = (t.moved.marks || [])[0];
  if (!mark) return 'moved, with no marker row: run the migration for it';
  const col = t.moved.ev ? 'data' : 'data_1';
  let d = {};
  try { d = JSON.parse(S(mark[col]) || '{}'); } catch (err) { d = {}; }
  const have = d._headers || [], missing = (cols || []).filter(c => have.indexOf(c) === -1);
  if (!missing.length) return 'in the store, up to date';
  d._headers = have.concat(missing);
  setCell(t.moved.items, mark, col, JSON.stringify(d));
  clearCache();
  return 'in the store: added ' + missing.length + ' column(s): ' + missing.join(', ');
}
const STORE_TRIM_KINDS = ['health', 'lens'];
function storeTrim_(days) {
  const keep = Number(days) > 0 ? Number(days) : (Number(config().store_trim_days) > 0 ? Number(config().store_trim_days) : 90);
  const cut = Date.now() - keep * 864e5, img = storeImg_(TAB.events_log, STORE_TRIM_KINDS);
  if (!img.sheet || img.headers.indexOf('data') < 0) return { kept: keep, deleted: 0 };
  const at = r => { const v = storeCell_((() => { try { return JSON.parse(S(r.data) || '{}'); } catch (err) { return {}; } })()[STORE_TRIM_AT[S(r.kind)]]); return v instanceof Date ? v.getTime() : (Date.parse(S(v)) || 0); };
  const gone = img.rows.filter(r => STORE_TRIM_KINDS.indexOf(S(r.kind)) !== -1 && S(r.what) !== STORE_MARK && at(r) && at(r) < cut)
    .map(r => r._row).sort((a, b) => b - a);
  for (let i = 0; i < gone.length;) {
    let j = i;
    while (j + 1 < gone.length && gone[j + 1] === gone[j] - 1) j++;
    img.sheet.deleteRows(gone[j], j - i + 1);
    i = j + 1;
  }
  if (gone.length) { POST_WROTE = true; clearCache(); }
  return { kept: keep, deleted: gone.length };
}
const STORE_TRIM_AT = { health: 'at', lens: 'at' };

function read(name) {
  if (_cache[name]) return _cache[name];
  const moved = storeMoved_(name), fromItems = moved && storeRead_(name, moved);
  if (fromItems) return (_cache[name] = fromItems);
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
  if (storeMoved_(name)) return read(name);
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
  /* THE DOCKET IS STORED AS ONE LIST, whoever writes it (post-account.gs todoOneList_). */
  if (field === 'todo' && typeof todoOneCell_ === 'function') value = todoOneCell_(value);
  if (t.moved) {
    if (t.headers.indexOf(field) < 0) t.headers.push(field);
    /* THE NET'S SHORTENED NAMES ARE NOT WRITTEN BACK SHORT, and the kid memo goes, as on a tab (below). */
    row[field] = kidNamesKept_(row[field], value, field); storeSave_(t, row, [field]); kidMemoDrop_(t); return true;
  }
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
  if (values && values.todo !== undefined && typeof todoOneCell_ === 'function') values = Object.assign({}, values, { todo: todoOneCell_(values.todo) });
  if (t.moved) {
    const want = {};
    Object.keys(values || {}).forEach(f => { want[f] = kidNamesKept_(row[f], values[f], f); });
    const changed = Object.keys(want).filter(f => !sameCell_(row[f], want[f]));
    changed.forEach(f => { if (t.headers.indexOf(f) < 0) t.headers.push(f); row[f] = want[f]; });
    if (changed.length) { storeSave_(t, row, changed); kidMemoDrop_(t); }
    return changed;
  }
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
  if (t.moved) { const r = storeAdd_(t, obj || {}); kidMemoDrop_(t); return r; }
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
  if (t.moved) {
    const ok = delRow(t.moved.items, row._item);
    kidMemoDrop_(t);
    clearCache();
    return ok;
  }
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
  try { tab = t.sheet.getName(); } catch (err) { /* a sheet with no name is just reported without one */ }
  if (!WRITE_MISSES.some(x => x.tab === tab && x.field === field)) {
    WRITE_MISSES.push({ tab: tab, field: field });
  }
}

/* THE ONE EXIT. Every reply in this file goes through here, which is why the check belongs here rather than in fifty handlers that would each have to remember it. § */
/* ---------- SET BY THE WRITES THEMSELVES § */
let POST_WROTE = false;

/* THE ONE REFUSAL: words.json `err-*` text, a `why` the site can match on (never the text). errOf_ for a handler that returns the object to its caller. */
function errOf_(key, why, vars) { return { success: false, why: why, error: text_(key, vars) }; }
function refuse_(key, why, vars) { return jsonOut(errOf_(key, why, vars)); }

/* THE ONE SITE LINK: SITE_URL?param=value, the value as given (tokens and keys are url-safe). */
function siteLink_(param, value) { return SITE_URL + '?' + param + '=' + value; }

/* THE ONE ACCESS EMAIL: words.json `<key>-subject` and `<key>-body` (brand filled in), then `tail`, then the sign-off. Throws as `MailApp` does. */
function accessMail_(to, key, vars, tail) {
  const v = Object.assign({ brand: BRAND_NAME }, vars || {});
  deliverOrThrow_(null, 'access', { to: to, email: { subject: text_(key + '-subject', v),
    lines: emailLines_(text_(key + '-body', v) + (tail || '')), footer: text_('mail-sign-off', { brand: BRAND_NAME }) } });
}

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
  try { if (obj && typeof obj === 'object') kidNamesOff_(obj); } catch (err) { /* a strip that finds nothing to strip leaves the payload as it is */ }
  /* AND NO PRICE TO A CHILD (398, `kidPricesOff_`, people.gs). */
  try { if (obj && typeof obj === 'object') kidPricesOff_(obj); } catch (err) { /* a strip that finds nothing to strip leaves the payload as it is */ }
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
  out.push(watching ? ('edit watch installed (' + watching + ' ' + plural_(watching, 'spreadsheet') + ')')
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
  } catch (err) { /* script properties are best-effort here; the next run tries again */ }
}

/* ---------- `retirePayloadOf_` WAS HERE — RETIRING A FEW PEOPLE'S PAYLOADS, NOT EVERYBODY'S § */
/** The generation number, which prefixes every key — see `clearPayloadCache`. */
function payloadGen_() {
  let gen = '0';
  try { gen = PropertiesService.getScriptProperties().getProperty('PAYLOAD_GEN') || '0'; } catch (err) { gen = '0'; }
  return gen + '|' + ledgerStamp_();
}
/* ANY EDIT TO THE LEDGER, FROM ANYWHERE, IS A NEW COPY (owner, 17 Nov: unify): an edit by hand or by another tool never
   runs `clearPayloadCache`, so the key also carries the Ledger file's last-changed time, looked up at most once a minute. */
function ledgerStamp_() {
  const c = payloadCache_();
  const had = c ? c.get('LEDGER_STAMP') : null;
  if (had) return had;
  let at = '';
  try { at = String(DriveApp.getFileById(ledgerId_()).getLastUpdated().getTime()); } catch (err) { at = ''; }
  if (c && at) { try { c.put('LEDGER_STAMP', at, 60); } catch (err) { /* the next ask looks again */ } }
  return at;
}

/* THE CACHE IS FILLED BEFORE ANYBODY ASKS, NOT BY THE FIRST PERSON TO ASK. § */

/** The deployed address of this web app, for the warmer to call. */
function webAppUrl_() {
  try {
    const set = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL');
    /* CHECKED, NOT TRUSTED. § */
    if (set && /^https:\/\//.test(set)) return set;
  } catch (err) { /* script properties are best-effort here; the next run tries again */ }
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

/* THE KEEP-AWAKE (owner, 13 Nov): a ping every 5 minutes so a visitor never waits for a cold start; `?ping=1` touches no sheet, so it is cheap. */
const KEEP_WARM_FN = 'keepWarm';
/* The trigger's handler. Public: a trigger cannot call a name ending _. */
function keepWarm() { return keepWarm_(); }
function keepWarm_() {
  try {
    const url = webAppUrl_();
    if (!url) return 'no web app url';
    const r = UrlFetchApp.fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + 'ping=1', { muteHttpExceptions: true, followRedirects: true });
    return 'pinged ' + r.getResponseCode();
  } catch (err) { return 'ping failed: ' + String((err && err.message) || err); }
}
/* KEPT BOOKED BY THE ADMIN-LOAD SETUP (361), like `libImportKeepBooked_`: exactly one trigger; null when it already is. */
function keepWarmKeepBooked_() {
  const mine = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === KEEP_WARM_FN);
  if (mine.length === 1) return null;
  mine.forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(KEEP_WARM_FN).timeBased().everyMinutes(5).create();
  return { installed: KEEP_WARM_FN, removed: mine.length };
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
  try { clearPayloadCache(); } catch (err) { /* edit hooks are best-effort; the next edit or warm run catches up */ }
  /* AN EDIT BY HAND TO A LIBRARY TAB (397): the cached items are forgotten, so the next card opened is the edit. */
  try { if (e && e.source && /^lib_/.test(e.source.getActiveSheet().getName())) libGenBump_(); } catch (err) { /* edit hooks are best-effort; the next edit or warm run catches up */ }
  try { scheduleWarmAfterEdit_(); } catch (err) { /* edit hooks are best-effort; the next edit or warm run catches up */ }
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
    try { props.deleteProperty('WARM_BOOKED_UNTIL'); } catch (err2) { /* script properties are best-effort here; the next run tries again */ }
    return 'could not book a rebuild: ' + String(err && err.message || err);
  }
}

/* THE BOOKED REBUILD. Tidies itself away first, then builds. § */
function warmAfterEdit() {
  try {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === 'warmAfterEdit') ScriptApp.deleteTrigger(t);
    });
  } catch (err) { /* a trigger left behind fires once more and does nothing */ }
  try { PropertiesService.getScriptProperties().deleteProperty('WARM_BOOKED_UNTIL'); } catch (err) { /* script properties are best-effort here; the next run tries again */ }
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
  try { PropertiesService.getScriptProperties().deleteProperty('WARM_BOOKED_UNTIL'); } catch (err) { /* script properties are best-effort here; the next run tries again */ }

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

/** DD/MM/YYYY: the site's `fmtDmy_` (cards-gen.gs) with the year written whole; anything unreadable as itself. */
function fmtDate(v) {
  if (v instanceof Date) return isNaN(v) ? '' : fmtDmy_(v).slice(0, 6) + v.getFullYear();
  const d = dateOf_(v);                                  // the one reader (cards-gen.gs, from js/core.js)
  return d ? fmtDmy_(d).slice(0, 6) + d.getFullYear() : S(v);
}

/** "09:00" from a Date, "9:00", "4:30pm" or "9": the site's `fmtTime_` (cards-gen.gs); a sheet's number is an hour. */
function fmtTime(v) { return fmtTime_(typeof v === 'number' ? String(v) : v); }

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
    /* A stale `layout` row (the columns, gone 17 Nov) stays private. */
    if (CONFIG_PRIVATE.indexOf(norm(k)) === -1 && norm(k) !== 'layout' && norm(k) !== WORDS_KEY) out[k] = cfg[k];
  });
  return out;
}

/* ---------- THE SEVEN CONFIG ROWS docs/policies/*.md fill their placeholders from; '' when a row is absent. */
function policyContacts_(cfg) {
  const c = cfg || {}, v = k => S(c[k] == null ? '' : c[k]);
  return { dsl: v('policy_dsl_name'), deputy: v('policy_deputy_dsl'), email: v('policy_email'), phone: v('policy_phone'),
    address: v('policy_address'), ico: v('policy_ico'), insurer: v('policy_insurer') };
}

/* ---------- THE RULES (496): `{set: {id: 'universal'}, hist: [{id, was, to, at}]}`, known unlocked ids only; null when broken ---------- */
/* js/rules.js `rulesSane_` (cards-gen.gs) is the rule; the sheet's cell is capped at RULES_MAX first. `RULE_OF_` is the site's lookup, off settings.json. */
const RULE_OF_ = id => (RULE_IDS.indexOf(id) !== -1 ? { id: id, lock: RULES_LOCKED.indexOf(id) !== -1 } : null);
function rulesClean_(v) {
  if (typeof v === 'string' && (!v.trim() || v.length > RULES_MAX)) return null;
  return rulesSane_(v);
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
/* ---------- THE JOBS: FOUR BOXES A JOB, ONE CELL OF JSON (8 Nov) ---------- */
function jobsOut(cellValue) {
  const list = tutorCardOf_({ jobs: cellValue }, { jobs: JOB_MAX }).jobs, out = {};
  for (let i = 1; i <= JOB_MAX; i++) JOB_PARTS.forEach(k => { out['job_' + i + '_' + k] = S((list[i - 1] || {})[k]); });
  return out;
}
function jobsIn(fields) {
  const out = [];
  for (let i = 1; i <= JOB_MAX; i++) {
    const j = {};
    JOB_PARTS.forEach(k => { j[k] = S(fields['job_' + i + '_' + k]).slice(0, 80); });
    if (j.role || j.where) out.push(j);
  }
  return out.length ? JSON.stringify(out) : '';
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

/* ---------- THE VENUES A TUTOR IS HAPPY TO TEACH AT, WHICH THE VENUES TAB ALREADY RECORDED § */
function venuesPersonIs_(entry, p) {
  const k = key(entry);
  if (!k || !p) return false;
  return [p.person_id, p.handle, S(p.first_name) + S(p.last_name)].concat(S(p.handle_was).split(',')).some(v => S(v) && key(v) === k);
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
    return { subject: S(x.subject), level: qualLevel_(x.level), board: S(x.institution), grade: S(x.grade),
             received: S(x.completed), spec: spec, teach: spec || TRUE_(x.can_teach) };
  }).filter(q => q.subject || q.level || q.board || q.grade || q.received)
    /* HIGHEST LEVEL FIRST (owner, 18 Nov: settings.json levels.quals order), the sheet's order within a level, so the cap never drops a degree. */
    .map((q, i) => [q, i]).sort((a, b) => (qualRank_(a[0].level) - qualRank_(b[0].level)) || (a[1] - b[1])).map(a => a[0]).slice(0, QUAL_MAX);
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
/* THE PHONE CELL AS TWO BOXES: phoneOut/phoneIn are js/form.js's, copied into cards-gen.gs. */
function dobOut(cellValue) {
  /* ---------- A REAL DATE, OR THE ONE WRITTEN FORM — AND NOTHING ELSE § */
  const d = (cellValue instanceof Date && !isNaN(cellValue)) ? cellValue
          : (/^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}$/.test(S(cellValue)) ? sheetDate(cellValue) : null);
  if (!d) return { dob_d: S(cellValue), dob_m: '', dob_y: '' };
  /* EMPTY MEANS EMPTY (4h, owner 20 Nov): 1 January 2000 is the placeholder a cell was filled with, not a birthday; sent as no date. */
  if (d.getDate() === 1 && d.getMonth() === 0 && d.getFullYear() === 2000) return { dob_d: '', dob_m: '', dob_y: '' };
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
  const d = dateOf_(v);                                  // the one reader (cards-gen.gs, from js/core.js)
  return d ? d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) : '';
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
  return dateOf_(v, true);                               // the one reader (cards-gen.gs, from js/core.js)
}

/**
 * A DATE AND A TIME, for a message.
 *
 * `fmtDate` gives the day, which is enough for a booking and useless for a conversation — two
 * messages on the same afternoon would show the same thing and could not be told apart.
 */
function fmtDateTime(v) {
  const d = sheetDate(v);
  return d ? fmtDmy_(d) + ' ' + fmtTime_(d) : '';
}