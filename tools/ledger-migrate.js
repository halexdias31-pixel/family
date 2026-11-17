#!/usr/bin/env node
/* @family. — tools/ledger-migrate.js THE LEDGER'S TABS INTO ONE ITEMS TAB AND ONE EVENTS TAB (owner, 16 Nov, "go extreme"). */
/* One mapping per tab, held in data/settings/kinds.json (a kind's `sheet`, `stored`, `ledger`); nothing here names a tab. */
/* The rows never leave the spreadsheet: this writes the Sheets formulas that build each tab's block where it lies, */
/* which are then pasted as values. Run it against a COPY only, never the live Ledger, and keep spreadsheet ids out of the repo. */
/*   node tools/ledger-migrate.js --plan heads.json   heads.json is [[tab, rowsBefore, "h1|h2|…"], …] (the copy's own header row per tab); */
/*                                                    prints {items:[{tab,kind,at,rows,formula}], events:[…], unmapped:[…]} */
/*   node tools/ledger-migrate.js --rows tab rows.json   maps rows ([{col: value}]) of one tab the same way, as JSON. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const KJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8'));

/* EVERY TAB'S ONE MAPPING: tab → { kind, sheet }. A kind whose `sheet.via` names another rides on that one's tab. */
function tabMap() {
  const out = {};
  const add = (kind, sheet) => {
    if (!sheet || !sheet.tab || sheet.via) return;
    if (out[sheet.tab]) throw new Error('ledger-migrate: tab ' + sheet.tab + ' is mapped twice (' + out[sheet.tab].kind + ', ' + kind + ')');
    out[sheet.tab] = { kind, sheet };
  };
  Object.entries(KJ.kinds).forEach(([k, v]) => add(k, v.sheet));
  Object.entries(KJ.stored || {}).forEach(([k, v]) => add(k, v.sheet));
  return out;
}

/* ONE ROW, AS AN ITEM OR AN EVENT — the same rule as backend/items.gs `itemFromRow_`. */
const ids = s => [].concat(s.id || []);
/* A CELL KEEPS ITS TYPE (owner, 17 Nov): a number stays a number, a tick a boolean, and a date is {"$d": its Sheets serial}, */
/* so the store (core.gs storeRead_) hands every reader the value Sheets would have. Text stays text, even when it looks like a number. */
const SERIAL0 = Date.UTC(1899, 11, 30);
function cellJson(v) {
  if (v instanceof Date) return { $d: (Date.UTC(v.getFullYear(), v.getMonth(), v.getDate(), v.getHours(), v.getMinutes(), v.getSeconds()) - SERIAL0) / 864e5 };
  return v;
}
const rowJson = row => JSON.stringify(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, cellJson(v)])));
function idOf(sheet, row) {
  const parts = ids(sheet).map(c => String(row[c] ?? '').trim());
  return parts.some(p => p === '') ? '' : parts.join(':');
}
function kindOf(m, row) {
  const b = m.sheet.kindBy;
  return b && String(row[b.column] || '').toLowerCase().indexOf(b.match) !== -1 ? b.kind : m.kind;
}
function mapRow(m, row) {
  const s = m.sheet;
  if (s.to === 'events') {
    return { to: 'events', row: { at: row[s.at] ?? '', who: row[s.who] ?? '', kind: m.kind, what: row[s.what] ?? '', item: s.item ? row[s.item] ?? '' : '', data: rowJson(row) } };
  }
  const id = idOf(s, row);
  if (!id) return null;
  if (s.blob) return { to: 'items', row: { id, kind: m.kind, data_1: row.content_1 || '', data_2: row.content_2 || '', data_3: row.content_3 || '', data_4: row.content_4 || '', data_5: row.content_5 || '', data_6: row.content_6 || '' } };
  return { to: 'items', row: { id, kind: kindOf(m, row), data_1: rowJson(row) } };
}

/* THE SAME, AS ONE SHEETS FORMULA OVER THE WHOLE TAB: a FILTER of the rows whose id is not blank. */
function col(i) { let s = ''; i += 1; while (i) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; }
const q = t => "'" + t.replace(/'/g, "''") + "'";
function sheetFormula(m, heads) {
  const s = m.sheet, T = q(s.tab), rng = c => T + '!' + col(c) + '2:' + col(c);
  const at = name => { const i = heads.indexOf(name); if (i < 0) throw new Error(s.tab + ' has no column ' + name); return rng(i); };
  const txt = r => 'SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(TO_TEXT(' + r + '),"\\","\\\\"),CHAR(34),"\\"&CHAR(34)),CHAR(10),"\\n"),CHAR(13),"")';
  /* THE ROW AS JSON, by its own header row: {"col":"text", …}, a blank header skipped. */
  const last = col(heads.length - 1), H = T + '!A1:' + last + '1', C = 'CHAR(34)';
  /* EACH CELL BY ITS TYPE: a tick true/false, a date {"$d":serial} (a number Sheets shows with / or :), a number bare, text quoted. */
  const val = 'IF(ISLOGICAL(r),IF(r,"true","false"),IF(ISNUMBER(r),IF(REGEXMATCH(TO_TEXT(r),"[/:]"),"{"&' + C + '&"$d"&' + C + '&":"&r&"}",r&""),' + C + '&' + txt('r') + '&' + C + '))';
  const json = 'BYROW(' + T + '!A2:' + last + ',LAMBDA(r,"{"&TEXTJOIN(",",TRUE,IF(' + H + '="","",' + C + '&' + H + '&' + C + '&":"&IFERROR(' + val + ',' + C + '&"#ERROR!"&' + C + ')))&"}"))';
  /* (IFERROR: a cell holding an error, a broken formula, is written as the text Apps Script reads from it, so one bad cell never blanks a block.) */
  const keyCol = s.to === 'events' ? rng(0) : at(ids(s)[0]);
  const lit = v => 'IF(LEN(' + keyCol + '),"' + v + '")';
  let cols;
  if (s.to === 'events') {
    cols = [s.at ? at(s.at) : lit(''), s.who ? at(s.who) : lit(''), lit(m.kind), s.what ? at(s.what) : lit(''), s.item ? at(s.item) : lit(''), json];
  } else {
    const id = ids(s).map(at).join('&":"&');
    const kind = s.kindBy ? 'IF(REGEXMATCH(LOWER(' + at(s.kindBy.column) + '),"' + s.kindBy.match + '"),"' + s.kindBy.kind + '","' + m.kind + '")' : lit(m.kind);
    cols = s.blob ? [id, kind].concat([1, 2, 3, 4, 5, 6].map(n => at('content_' + n))) : [id, kind, json];
  }
  return '=ARRAYFORMULA(IFERROR(FILTER({' + cols.join(',') + '},' + keyCol + '<>""),""))';
}

/* THE MARKER ROW of a moved tab (core.gs storeRead_): the kind is moved even with no rows, and these are its columns. */
function markerRow(m, heads) {
  const data = JSON.stringify({ _headers: heads.filter(Boolean) });
  return m.sheet.to === 'events' ? { at: '', who: '', kind: m.kind, what: '~moved', item: '', data } : { id: '~moved', kind: m.kind, data_1: data };
}
function plan(heads) {
  const map = tabMap(), out = { items: [], events: [], unmapped: [] }, next = { items: 2, events: 2 };
  /* THE BIG TAB LAST, so every other block's place is known before it grows. */
  const order = heads.slice().sort((a, b) => Number(a[1]) - Number(b[1]));
  order.forEach(([tab, rows, h]) => {
    const m = map[tab];
    if (!m) { out.unmapped.push({ tab, rows: Number(rows), why: (KJ.ledger.unmapped || {})[tab] || 'no kind names this tab' }); return; }
    const to = m.sheet.to === 'events' ? 'events' : 'items', n = Number(rows);
    const heads1 = String(h).split('|');
    while (heads1.length && !heads1[heads1.length - 1]) heads1.pop();
    out[to].push({ tab, kind: m.kind, at: next[to], rows: n, formula: n ? sheetFormula(m, heads1) : '', marker: markerRow(m, heads1) });
    next[to] += n ? n + 1 : 0;
  });
  Object.keys(map).forEach(t => { if (!heads.some(x => x[0] === t)) out.unmapped.push({ tab: t, rows: 0, why: 'kinds.json maps it, the file has no such tab' }); });
  out.itemsTab = KJ.ledger.items; out.eventsTab = KJ.ledger.events;
  return out;
}

module.exports = { tabMap, mapRow, plan, markerRow };
if (require.main === module) {
  const a = process.argv;
  if (a.includes('--plan')) console.log(JSON.stringify(plan(JSON.parse(fs.readFileSync(a[a.indexOf('--plan') + 1], 'utf8'))), null, 1));
  else if (a.includes('--rows')) {
    const tab = a[a.indexOf('--rows') + 1], rows = JSON.parse(fs.readFileSync(a[a.indexOf('--rows') + 2], 'utf8')), m = tabMap()[tab];
    if (!m) throw new Error('no kind maps tab ' + tab);
    console.log(JSON.stringify(rows.map(r => mapRow(m, r))));
  } else console.log('node tools/ledger-migrate.js --plan heads.json | --rows tab rows.json');
}
