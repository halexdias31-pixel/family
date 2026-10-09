#!/usr/bin/env node
/* ==================================================================================================
   node js/check-films.js — THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER, ASKED OF THE REAL BACKEND

   ASKED FOR AS *"Ensure the video searcher is hooked up. Let admin be able to search up films which
   are in the notflix folder on gdrive."* The card was wired; the films tab it reads was empty, and
   nothing filled it from the folder. `filmsSync_` in backend/content.gs does now, and each rule below
   is one that fails QUIETLY if it fails at all — a list that looks complete, a row that lost what the
   owner typed on it, a film that vanished because a pass ran out of time, a student's payload with a
   title in it:

     · A FIRST SYNC ADDS EVERY FILM, SERIES, DOCUMENTARY AND PLACEHOLDER ONCE, read the way the map of
       the folder found it: the audience from level one, film or TV from level two in either case, a
       show as ONE row with its seasons counted from the episodes that exist, the year and the owner's
       note out of the name, three video types and a name with no extension.
     · SUBTITLES, PICTURES, AN EXTRAS FOLDER, A LOOSE EPISODE AND AN EMPTY SHOW MAKE NO ROW.
     · A SECOND SYNC OVER AN UNCHANGED FOLDER WRITES NOTHING AT ALL.
     · WHAT A PERSON TYPED SURVIVES: a director, a note and a corrected title, through a rename and a
       new size — while the machine's columns follow the folder.
     · A RENAMED FILE'S ROW FOLLOWS THE NEW NAME — title, year and note, a note dropped included — in
       every cell nobody typed over (`drive_name` says which those are), and `drive_name` is never sent.
     · A FILE THAT LEAVES IS SWITCHED OFF, NEVER DELETED, and comes back on when it returns; so is a
       show whose every episode left. A row a person typed with no id is not touched — and is ADOPTED
       by the file of that title when it lands.
     · WHICH FOLDER: the one synced before, by its id, renamed or not and never from the bin; by name,
       this account's own over one shared with it, one shared folder alone used, and two that cannot
       be told apart REFUSED before anything is written.
     · A PLACEHOLDER (a Google Doc where a film would be) STAYS A PLACEHOLDER.
     · ONLY AN ADMIN: a student and a stranger cannot run it, are sent no film and no stamp, and their
       load never opens the films tab.
     · `drive_id` NEVER LEAVES THE SERVER, and neither does `films_folder` — the folder's only lock.
     · NO PAYLOAD IS RETIRED: the admin's next load is a cache HIT and still has the new films.
     · THE CLOCK: a pass that does not fit stops between two things, switches nothing off, and the next
       run carries on from where it stopped until the pass is whole.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`, with a Drive whose
   folder tree is INVENTED. This file is in a public repository: every title below is made up, and
   every id is `example-…`. Nothing here is, or may become, the real folder's.
================================================================================================== */
'use strict';
const { backend } = require('./check-gas-load.js');

const bad = [];
const info = [];
let asked = 0;
const fail = (rule, msg) => bad.push(rule + ' — ' + msg);

/* ---------- A DRIVE OF INVENTED THINGS ----------------------------------------------------------------
   `spec` is a nested object: a folder is `{ name, files: [...], folders: [...], owner?, trashed? }`, a
   file is `{ name, mime, gb }`. Ids are handed out in order as `example-d-001` / `example-f-001`, so a
   file keeps its id for as long as the same spec object holds it — a rename is a change to `name`, a
   removal is taking the object out of its list, exactly as Drive behaves. `clock.cost` is what one
   `getSize()` costs on the walk's clock: 0 everywhere except the test that asks whether the walk stops.
   THE ACCOUNT IS `me@example.org`: a folder with no `owner` is its own, and `spec.before` /
   `spec.elsewhere` are other folders Drive can see, listed before and after the root by a search. */
function drive(spec, clock) {
  let n = 0;
  const ids = new Map();
  const idOf = (o, k) => {
    if (!ids.has(o)) ids.set(o, 'example-' + k + '-' + String(++n).padStart(3, '0'));
    return ids.get(o);
  };
  const iter = list => { let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; };
  const fileOf = f => ({
    getId: () => idOf(f, 'f'), getName: () => f.name, getMimeType: () => f.mime || 'video/x-matroska',
    getSize: () => { clock.t += (f.cost != null ? f.cost : clock.cost); return Math.round((f.gb || 0) * 1073741824); },
  });
  const user = e => ({ getEmail: () => e });
  const folderOf = d => ({
    getId: () => idOf(d, 'd'), getName: () => d.name,
    getFiles: () => iter((d.files || []).map(fileOf)),
    getFolders: () => iter((d.folders || []).map(folderOf)),
    getOwner: () => user(d.owner || 'me@example.org'),
    isTrashed: () => !!d.trashed,
  });
  const all = [];
  const walk = d => { all.push(d); (d.folders || []).forEach(walk); };
  const everything = () => {
    all.length = 0;
    (spec.before || []).forEach(walk); walk(spec.root); (spec.elsewhere || []).forEach(walk);
    return all;
  };
  const stub = {
    /* ONLY AN ID ALREADY HANDED OUT OPENS ANYTHING — and asking hands out none, so a lookup cannot
       renumber the folders after it. */
    getFolderById: id => {
      const d = everything().find(x => ids.get(x) === id);
      if (!d) throw new Error('No item with the given ID could be found, or you do not have permission to access it.');
      return folderOf(d);
    },
    /* DRIVE'S `title contains` IS CASE-BLIND, so this is too — it hands back `Notflix adults` as well,
       which is the reason the backend tests the whole name afterwards. The bin is left out, as
       `trashed = false` asks. */
    searchFolders: q => {
      const want = (String(q).match(/title contains '([^']+)'/) || [])[1] || '';
      return iter(everything().filter(x => !x.trashed && x.name.toLowerCase().indexOf(want.toLowerCase()) !== -1).map(folderOf));
    },
    getRootFolder: () => ({ getOwner: () => user('me@example.org') }),
    getFileById: () => null,
  };
  return { stub, idOf };
}

/* ---------- THE FOLDER, IN THE SHAPE THE MAP OF THE REAL ONE FOUND (counts and levels, not names) ------
   Two audiences named `Notflix <audience>`, `Films`/`films` and `Tv shows`/`tv shows` in different case,
   a `documentaries` folder holding its file directly, one show flat with an owner's note and a name
   with no extension, one in season folders with two empty ones, one mixing release-style names into a
   season, an empty show, an empty kids `tv shows`. Plus everything that must make no row. */
function tree() {
  const S = (n, gb, mime) => ({ name: n, gb: gb || 0.3, mime: mime || 'video/x-matroska' });
  return {
    root: { name: 'Notflix', folders: [
      { name: 'Notflix adults', folders: [
        { name: 'Films', files: [
          { name: 'The Lighthouse Keeper', gb: 1.5, mime: 'video/matroska' },
          { name: 'Paper Moon Rising (1993)', gb: 2.25, mime: 'video/x-matroska' },
          { name: 'Night Ferry (1987) unfinished', gb: 0.8, mime: 'video/mp4' },
          { name: 'Quiet Orchard.mkv', gb: 1.1, mime: 'application/octet-stream' },
          { name: 'Glass Tide', gb: 3.0, mime: 'video/matroska' },
          { name: 'The Lighthouse Keeper.srt', mime: 'application/x-subrip' },
          { name: 'Poster.jpg', mime: 'image/jpeg' },
          { name: 'Wanted Elsewhere', mime: 'application/vnd.google-apps.document' },
        ], folders: [
          { name: 'Extras', files: [{ name: 'Behind the scenes.mkv', gb: 0.2 }] },
        ] },
        { name: 'Tv shows', files: [
          { name: 'stray.mkv', gb: 0.2 },
        ], folders: [
          { name: 'Example Flat Show', files: [
            S('1.1.mkv'), S('1.2.mkv'), S('1.10.mkv'), S('2.1.mkv'), S('2.7 note.mkv'), S('3.2'),
          ] },
          { name: 'Example Season Show', folders: [
            { name: 's1', files: [S('1.1.mkv'), S('1.2.mkv')] },
            { name: 's2', files: [S('2.1.mkv')] },
            { name: 's3', files: [S('3.1.mkv'), S('3.3.mkv')] },
            { name: 's4', files: [] },
            { name: 's5', files: [] },
          ] },
          { name: 'Example Mixed Show', folders: [
            { name: 's1', files: [S('1.1.mkv'), S('Example.Mixed.Show.S01E02.Source.720p.BluRay.x265-GRP.mkv')] },
            { name: 's2', files: [S('2.1.mkv')] },
          ] },
          { name: 'An Empty Show', folders: [{ name: 's1', files: [] }] },
        ] },
      ] },
      { name: 'Notflix kids', folders: [
        { name: 'films', files: [
          { name: 'Invented Cartoon.mp4', gb: 1.0, mime: 'video/mp4' },
          { name: 'Pretend Puppets (2001).mkv', gb: 2.0, mime: 'video/matroska' },
        ] },
        { name: 'tv shows', folders: [] },
      ] },
      { name: 'documentaries', files: [
        { name: 'Pretend Science Hour - XY9.mp4', gb: 0.5, mime: 'video/mp4' },
        { name: 'cover.png', mime: 'image/png' },
      ] },
    ] },
    /* ANOTHER FOLDER WITH THE WORD IN ITS NAME, somewhere else in Drive — never the root. */
    elsewhere: [{ name: 'notflix ideas', folders: [], files: [] }],
  };
}
/* WHAT THE TREE ABOVE SHOULD BECOME: 7 films, 3 series, 1 documentary, 1 placeholder. */
const WANT = { films: 7, series: 3, documentaries: 1, placeholders: 1 };

function world(opts) {
  opts = opts || {};
  const spec = opts.spec || tree();
  const clock = { t: Date.UTC(2026, 9, 9, 12), cost: 0 };
  const d = drive(spec, clock);
  const b = backend({ DriveApp: d.stub, __clock: () => clock.t });
  b.ev('filmsClock_ = function () { return __clock(); }');
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
  ]);
  if (opts.rows) b.seed('films', opts.rows);
  const tok = {};
  ['a1@example.org', 's1@example.org'].forEach(e => {
    const r = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!r.success) bad.push('could not sign in ' + e + ' — ' + r.error);
    tok[e] = r.token;
  });
  const sync = who => { asked++; return b.post({ action: 'filmsSync', token: who === undefined ? tok['a1@example.org'] : who }); };
  /* A FRESH REQUEST READS THE SHEET AS IT IS — Apps Script starts every request with nothing held, and
     this harness keeps one scope, so the row cache is emptied first. The PAYLOAD cache is not touched. */
  const get = params => { b.ev('clearCache()'); asked++; return b.get(params || {}); };
  const rows = () => {
    const g = b.tabs.films, h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  const setCell = (driveId, col, v) => {
    const g = b.tabs.films, h = g[0];
    const r = g.find((x, i) => i > 0 && x[h.indexOf('drive_id')] === driveId);
    r[h.indexOf(col)] = v;
  };
  return { b, d, spec, clock, tok, sync, get, rows, setCell };
}

const isOn = v => /^(true|yes|1)$/i.test(String(v));
const find = (rows, title) => rows.find(r => String(r.title) === title);

/* ---------- THE NAMES, ONE PATTERN AT A TIME --------------------------------------------------------- */
{
  const { b } = world();
  const t = n => JSON.stringify(b.ev('filmsTitle_(' + JSON.stringify(n) + ')'));
  const want = [
    ['The Lighthouse Keeper', { title: 'The Lighthouse Keeper', year: '', note: '' }],
    ['Paper Moon Rising (1993)', { title: 'Paper Moon Rising', year: '1993', note: '' }],
    ['Night Ferry (1987) unfinished', { title: 'Night Ferry', year: '1987', note: 'unfinished' }],
    ['Invented Cartoon.mp4', { title: 'Invented Cartoon', year: '', note: '' }],
    ['Pretend Puppets (2001).mkv', { title: 'Pretend Puppets', year: '2001', note: '' }],
    ['Pretend Science Hour - XY9.mp4', { title: 'Pretend Science Hour', year: '', note: 'XY9' }],
    ['Rocky Road - II', { title: 'Rocky Road - II', year: '', note: '' }],
    ['Mr. Example Goes to Town', { title: 'Mr. Example Goes to Town', year: '', note: '' }],
    ['Some.Film.Name.2008.1080p.WEB.x264-GRP.mkv', { title: 'Some Film Name', year: '2008', note: '' }],
  ];
  want.forEach(([name, w]) => {
    asked++;
    if (t(name) !== JSON.stringify(w)) fail('a name, read', JSON.stringify(name) + ' read as ' + t(name) + ', wanted ' + JSON.stringify(w));
  });
  const e = n => JSON.stringify(b.ev('filmsEpisode_(' + JSON.stringify(n) + ')'));
  [['1.1.mkv', 1, 1], ['4.9.mkv', 4, 9], ['7.15.mkv', 7, 15], ['3.7 note.mkv', 3, 7], ['8.3', 8, 3],
   ['Example.Show.S01E10.Source.720p.BluRay.x265-GRP.mkv', 1, 10]].forEach(([n, s, ep]) => {
    asked++;
    if (e(n) !== JSON.stringify({ season: s, episode: ep })) fail('an episode, read', JSON.stringify(n) + ' read as ' + e(n));
  });
}

/* ---------- THE FIRST SYNC, THE SECOND, AND WHO IS SENT WHAT ---------------------------------------- */
{
  const w = world();
  const { b, d, spec, sync, get, rows } = w;
  if (!b.tabs.films) fail('the tab', 'there is no films tab in TAB/SCHEMA, so nothing below can be asked');
  const r1 = sync();
  if (!r1.success) fail('the first sync', 'refused: ' + JSON.stringify(r1));
  else {
    const rs = rows();
    const ids = rs.map(r => r.drive_id);
    if (new Set(ids).size !== ids.length) fail('the first sync', 'a drive_id is on two rows: ' + ids.join(', '));
    const n = k => rs.filter(r => isOn(r.active) && (k === 'placeholders' ? isOn(r.placeholder)
      : !isOn(r.placeholder) && r.kind === { films: 'film', series: 'series', documentaries: 'documentary' }[k])).length;
    Object.keys(WANT).forEach(k => {
      if (n(k) !== WANT[k]) fail('the first sync', k + ': ' + n(k) + ' rows, wanted ' + WANT[k]);
    });
    if (rs.length !== 12) fail('the first sync', rs.length + ' rows for 12 things in the folder');
    if (r1.done !== true || r1.more) fail('the first sync', 'a folder of twelve things did not finish in one run: ' + JSON.stringify({ done: r1.done, more: r1.more }));
    if (r1.folder !== 'Notflix' || r1.how !== 'name') fail('which folder', 'the reply says ' + r1.folder + ' / ' + r1.how + ' — wanted the folder named Notflix, found by its name (and never `notflix ideas`)');
    if (!/Notflix/.test(r1.message || '')) fail('which folder', 'the reply’s sentence does not name the folder it used: ' + r1.message);
    if (JSON.stringify(r1.found) !== JSON.stringify(WANT)) fail('the first sync', 'the reply counts ' + JSON.stringify(r1.found) + ', wanted ' + JSON.stringify(WANT));
    if (r1.skipped !== 5) fail('what is skipped', 'the reply counts ' + r1.skipped + ' skipped — wanted 5: the subtitle, two pictures, the extras folder and the episode loose in Tv shows');

    /* WHAT A ROW SAYS. */
    const row = t => find(rs, t) || {};
    const pm = row('Paper Moon Rising');
    if (String(pm.year) !== '1993' || pm.kind !== 'film' || pm.audience !== 'adults' || pm.file_kind !== 'file'
        || !/^https:\/\/drive\.google\.com\/file\/d\/example-f-\d+\/view$/.test(pm.drive_url) || Number(pm.size_gb) !== 2.25)
      fail('a film’s row', JSON.stringify(pm));
    const nf = row('Night Ferry');
    if (String(nf.year) !== '1987' || nf.notes !== 'unfinished') fail('the owner’s note', '"Night Ferry (1987) unfinished" became ' + JSON.stringify({ title: nf.title, year: nf.year, notes: nf.notes }) + ' — the note belongs in notes, not the title');
    if (!row('Quiet Orchard').drive_id) fail('a video by its name', 'an .mkv Drive typed as application/octet-stream made no row');
    if (row('Invented Cartoon').audience !== 'kids' || row('Pretend Puppets').audience !== 'kids' || String(row('Pretend Puppets').year) !== '2001')
      fail('the kids folder', JSON.stringify([row('Invented Cartoon'), row('Pretend Puppets')].map(r => ({ t: r.title, a: r.audience, y: r.year }))));
    const doc = row('Pretend Science Hour');
    if (doc.kind !== 'documentary' || doc.notes !== 'XY9' || doc.audience !== '') fail('the documentary', JSON.stringify({ kind: doc.kind, notes: doc.notes, audience: doc.audience }) + ' — documentaries is a kind with no audience');
    const flat = row('Example Flat Show'), seas = row('Example Season Show'), mix = row('Example Mixed Show');
    if (flat.kind !== 'series' || flat.file_kind !== 'folder' || !/\/drive\/folders\/example-d-\d+$/.test(flat.drive_url))
      fail('a series is one row, its folder', JSON.stringify(flat));
    if (Number(flat.seasons) !== 3) fail('seasons, counted from the names', 'the flat show (1.x, 2.x and a loose `3.2`) has ' + flat.seasons + ' seasons, wanted 3');
    if (Number(seas.seasons) !== 3) fail('seasons, counted from what exists', 'the show with s1..s5 and s4, s5 empty has ' + seas.seasons + ' seasons, wanted 3 — counting folders says 5');
    if (Number(mix.seasons) !== 2) fail('seasons, release names mixed in', 'the mixed show has ' + mix.seasons + ', wanted 2');
    if (Math.abs(Number(flat.size_gb) - 1.8) > 0.011) fail('a series’ size', 'six episodes of 0.3 GB came to ' + flat.size_gb);
    const ph = row('Wanted Elsewhere');
    if (!isOn(ph.placeholder) || ph.drive_url !== '' || !isOn(ph.active)) fail('a placeholder', 'a Google Doc in Films became ' + JSON.stringify(ph) + ' — wanted a live placeholder row with no link');
    ['The Lighthouse Keeper.srt', 'Poster', 'Behind the scenes', 'Extras', 'stray', 'An Empty Show', 'cover'].forEach(t => {
      if (rs.some(r => String(r.title).indexOf(t) === 0)) fail('what is skipped', '"' + t + '" made a row');
    });
    if (rs.some(r => !/^FM\d{3}$/.test(String(r.film_id)))) fail('the ids', 'a row has no FMnnn id: ' + rs.map(r => r.film_id).join(', '));

    /* THE REPLY CARRIES THE LIST, IN THE PAYLOAD'S SHAPE, WITHOUT `drive_id`. */
    if (!Array.isArray(r1.films) || r1.films.length !== 12) fail('the reply', 'carries ' + (r1.films || []).length + ' films, wanted the 12 the card should show at once');
    if (!r1.sync || !r1.sync.at || r1.sync.more) fail('the reply', 'its stamp is ' + JSON.stringify(r1.sync));
    if (/drive_?id/i.test(JSON.stringify(r1))) fail('drive_id never leaves the server', 'the sync’s reply carries a drive_id key');
    if (/The Lighthouse|Paper Moon|Night Ferry|Invented Cartoon|Example Flat/.test(String(r1.message))) fail('the sentence', 'the reply’s message names a title: ' + r1.message);
  }

  /* ---------- AGAIN, OVER THE SAME FOLDER: NOTHING ---------- */
  const r2 = sync();
  if (!r2.success) fail('the second sync', 'refused: ' + JSON.stringify(r2));
  else {
    if (r2.writes !== 0) fail('the second sync', 'an unchanged folder wrote ' + r2.writes + ' cell(s) — wanted none');
    if (r2.added || r2.refreshed || r2.off) fail('the second sync', JSON.stringify({ added: r2.added, refreshed: r2.refreshed, off: r2.off }));
    if (rows().length !== 12) fail('the second sync', 'now ' + rows().length + ' rows');
  }

  /* ---------- WHO IS SENT WHAT ---------- */
  const admin = get({ token: w.tok['a1@example.org'] });
  const pupil = get({ token: w.tok['s1@example.org'] });
  const anon = get({});
  if (!Array.isArray(admin.films) || admin.films.length !== 12) fail('the admin’s payload', (admin.films || []).length + ' films, wanted 12');
  if (!admin.filmsSync || !admin.filmsSync.at || admin.filmsSync.folder !== 'Notflix') fail('the admin’s payload', 'its stamp is ' + JSON.stringify(admin.filmsSync));
  [['a student', pupil], ['a visitor with no token', anon]].forEach(([who, p]) => {
    if (!Array.isArray(p.films) || p.films.length) fail('only an admin', who + ' was sent ' + JSON.stringify(p.films));
    if ('filmsSync' in p) fail('only an admin', who + ' was sent `filmsSync` — a key that says films exist');
    const all = JSON.stringify(p);
    const leaked = rows().map(r => r.drive_id).filter(id => all.indexOf(id) !== -1);
    if (leaked.length) fail('drive_id never leaves the server', who + '’s payload holds ' + leaked.length + ' Drive id(s)');
    if (/Lighthouse|Paper Moon|Example Flat Show/.test(all)) fail('only an admin', who + '’s payload has a film title in it');
  });
  if (/"drive_?id"/i.test(JSON.stringify(admin))) fail('drive_id never leaves the server', 'the admin’s payload has a drive_id key');

  /* AND A STUDENT CANNOT RUN IT, AND A STRANGER CANNOT. */
  const before = JSON.stringify(b.tabs.films);
  /* THE TABLE SAYS ADMIN — and the handler asks again, so the refusal below holds if either does. */
  if (b.ev('ACTION_ACCESS.filmsSync') !== 'admin') fail('only an admin', 'ACTION_ACCESS.filmsSync is ' + JSON.stringify(b.ev('ACTION_ACCESS.filmsSync')) + ', not admin');
  const rs1 = sync(w.tok['s1@example.org']);
  if (rs1.success || !rs1.error) fail('only an admin', 'a student’s filmsSync answered ' + JSON.stringify(rs1).slice(0, 200));
  if (rs1.films) fail('only an admin', 'a student’s refused sync carried films');
  const rs2 = sync('');
  if (rs2.success || !/sign in/i.test(String(rs2.error))) fail('only an admin', 'filmsSync with no token answered ' + JSON.stringify(rs2).slice(0, 200));
  if (JSON.stringify(b.tabs.films) !== before) fail('only an admin', 'a refused sync changed the films tab');

  /* ---------- AND A STUDENT'S LOAD NEVER OPENS THE TAB (note 068: the gate is the read) ---------- */
  b.ev('__filmsOpened = 0; (function () { const o = SpreadsheetApp.openById; SpreadsheetApp.openById = function (id) {'
     + ' const bk = o(id); return Object.assign({}, bk, { getSheetByName: function (n) { if (n === "films") __filmsOpened++;'
     + ' return bk.getSheetByName(n); } }); }; })()');
  b.cache.clear();
  get({ token: w.tok['s1@example.org'] });
  get({});
  const opened = b.ev('__filmsOpened');
  if (opened) fail('only an admin', 'a student’s and a stranger’s load opened the films tab ' + opened + ' time(s) — the read must be inside the guard');
  get({ token: w.tok['a1@example.org'] });
  if (!b.ev('__filmsOpened')) fail('only an admin', 'the admin’s load never opened the films tab — this rule asked nothing');
}

/* ---------- WHAT A PERSON TYPED SURVIVES; WHAT LEAVES IS SWITCHED OFF; WHAT RETURNS COMES BACK ---------- */
{
  const w = world({ rows: [
    /* TYPED BY HAND WITH NO ID: one asked for by name (a placeholder), and one with a director on it. */
    { film_id: 'FM900', title: 'Wanted By Name', kind: 'film', placeholder: 'TRUE', active: 'TRUE', notes: 'asked for in September' },
    { film_id: 'FM901', title: 'A Row Somebody Typed', kind: 'film', director: 'A Typed Director', active: '' },
  ] });
  const { b, spec, sync, rows, setCell } = w;
  sync();
  let rs = rows();
  const glass = find(rs, 'Glass Tide');
  if (!glass) fail('the setup', 'Glass Tide made no row');
  else {
    /* THE OWNER TYPES: a director, a lead, a note, and a corrected title. */
    setCell(glass.drive_id, 'director', 'An Invented Director');
    setCell(glass.drive_id, 'notes', 'the good copy');
    setCell(glass.drive_id, 'title', 'Glass Tide (Corrected)');
    /* AND THE FILE IS RENAMED AND REPLACED WITH A BIGGER ONE. */
    const f = spec.root.folders[0].folders[0].files.find(x => x.name === 'Glass Tide');
    f.name = 'Glass Tide (2019) recut';
    f.gb = 3.5;
    const r = sync();
    rs = rows();
    const g = rs.find(x => x.drive_id === glass.drive_id) || {};
    if (g.director !== 'An Invented Director' || g.notes !== 'the good copy' || g.title !== 'Glass Tide (Corrected)')
      fail('a person’s columns survive', 'after a rename the row reads ' + JSON.stringify({ title: g.title, director: g.director, notes: g.notes }));
    if (Number(g.size_gb) !== 3.5) fail('the machine’s columns follow the folder', 'size_gb is ' + g.size_gb + ' after the file grew to 3.5');
    if (String(g.year) !== '2019') fail('a blank is filled', 'the year the new name carries was not written into the blank cell: ' + g.year);
    if (r.refreshed !== 1 || r.added) fail('a person’s columns survive', 'the sync counted ' + JSON.stringify({ added: r.added, refreshed: r.refreshed }) + ' for one changed file');
    /* RENAMED AGAIN: the year the machine wrote follows the new name; the title and the note a person
       typed do not. */
    f.name = 'Glass Tide (2020)';
    sync();
    const g2 = rows().find(x => x.drive_id === glass.drive_id) || {};
    if (g2.title !== 'Glass Tide (Corrected)' || g2.notes !== 'the good copy') fail('a person’s columns survive', 'a second rename wrote over what was typed: ' + JSON.stringify({ title: g2.title, notes: g2.notes }));
    if (String(g2.year) !== '2020') fail('the machine’s cells follow a rename', 'the year the sync wrote from the old name (2019) did not follow the new one: ' + g2.year);
  }
  /* A ROW WITH NO ID IS NOT TOUCHED BY A SYNC THAT HAS NOTHING OF THAT TITLE. */
  const typed = find(rows(), 'A Row Somebody Typed') || {};
  if (typed.director !== 'A Typed Director' || typed.drive_id || String(typed.active) !== '') fail('a row with no id', 'was changed: ' + JSON.stringify(typed));
  const wanted0 = find(rows(), 'Wanted By Name') || {};
  if (!isOn(wanted0.placeholder) || wanted0.drive_id) fail('a placeholder stays a placeholder', 'a typed placeholder with no file was changed: ' + JSON.stringify(wanted0));
  /* AND IT IS SENT AS A PLACEHOLDER, which is what the card and Find draw as "Not in the drive yet". */
  const a0 = w.get({ token: w.tok['a1@example.org'] });
  const sent = (a0.films || []).find(f => f.title === 'Wanted By Name');
  if (!sent || sent.placeholder !== true || sent.url) fail('a placeholder stays a placeholder', 'the admin is sent ' + JSON.stringify(sent));
  const typedSent = (a0.films || []).find(f => f.title === 'A Row Somebody Typed');
  if (!typedSent) fail('a blank `active` is on', 'a row typed by hand with `active` left empty is not sent — `ON_`, as every other active column reads');

  /* ---------- THE FILE ASKED FOR BY NAME ARRIVES: the typed row is ADOPTED, not duplicated ---------- */
  spec.root.folders[0].folders[0].files.push({ name: 'Wanted By Name (2020).mkv', gb: 1.2, mime: 'video/x-matroska' });
  const rA = sync();
  rs = rows();
  const wanted = rs.filter(x => String(x.title) === 'Wanted By Name');
  if (wanted.length !== 1) fail('adopted, not duplicated', wanted.length + ' rows titled "Wanted By Name" after its file arrived');
  else {
    const x = wanted[0];
    if (x.film_id !== 'FM900' || !x.drive_id || isOn(x.placeholder) || x.notes !== 'asked for in September' || String(x.year) !== '2020')
      fail('adopted, not duplicated', 'the typed row became ' + JSON.stringify({ id: x.film_id, drive_id: !!x.drive_id, placeholder: x.placeholder, notes: x.notes, year: x.year }));
  }
  if (rA.adopted !== 1) fail('adopted, not duplicated', 'the reply counts ' + rA.adopted + ' adopted');

  /* ---------- A FILE LEAVES: SWITCHED OFF, NOT DELETED ---------- */
  const films = spec.root.folders[0].folders[0].files;
  const gone = films.splice(films.findIndex(x => x.name === 'Paper Moon Rising (1993)'), 1)[0];
  const n0 = rows().length;
  const rOff = sync();
  rs = rows();
  const pm = find(rs, 'Paper Moon Rising');
  if (rs.length !== n0) fail('switched off, not deleted', 'the tab went from ' + n0 + ' rows to ' + rs.length);
  if (!pm || isOn(pm.active)) fail('switched off, not deleted', 'the row of a file that left is ' + JSON.stringify(pm && pm.active));
  if (rOff.off !== 1) fail('switched off, not deleted', 'the reply counts ' + rOff.off + ' switched off');
  const a1 = w.get({ token: w.tok['a1@example.org'] });
  if ((a1.films || []).some(f => f.title === 'Paper Moon Rising')) fail('switched off, not deleted', 'the admin is still sent a film whose file is gone');
  /* AND THE ROW WITH NO ID IS STILL NOT TOUCHED — it was never in the folder to leave it. */
  const typed2 = find(rs, 'A Row Somebody Typed') || {};
  if (String(typed2.active) !== '') fail('a row with no id', 'a whole pass switched off a row that has no drive_id');
  /* IT COMES BACK. */
  films.push(gone);
  sync();
  const back = find(rows(), 'Paper Moon Rising');
  if (!back || !isOn(back.active)) fail('switched off, not deleted', 'the file came back and its row stayed off');

  /* ---------- A FOLDER THAT LISTS NOTHING SWITCHES NOTHING OFF ---------- */
  const keep = spec.root.folders;
  spec.root.folders = [];
  const onBefore = rows().filter(r => r.drive_id && isOn(r.active)).length;
  const rE = sync();
  const onAfter = rows().filter(r => r.drive_id && isOn(r.active)).length;
  if (rE.off || onAfter !== onBefore) fail('an empty listing', 'a folder that listed nothing switched ' + (onBefore - onAfter) + ' row(s) off — the wrong folder would empty the search');
  if (!/nothing was switched off/.test(String(rE.message))) fail('an empty listing', 'the reply does not say why nothing was switched off: ' + rE.message);
  spec.root.folders = keep;
}

/* ---------- A FILE RENAMED IN DRIVE: ITS ROW FOLLOWS THE NEW NAME ---------------------------------------
   The title, year and note were written once and after that only into a blank cell, so a renamed file
   kept its old title for ever: the admin searched for the new name and found nothing, and a film whose
   flag the owner took off once it was mended read as not right for ever (review of 9 Oct). `drive_name`
   is how the sync tells its own cells from a typed one. */
{
  const w = world();
  const { spec, sync, rows } = w;
  sync();
  const nf0 = find(rows(), 'Night Ferry');
  if (!nf0) fail('the setup', 'Night Ferry made no row');
  else {
    if (nf0.drive_name !== 'Night Ferry (1987) unfinished') fail('drive_name', 'a new row’s drive_name is ' + JSON.stringify(nf0.drive_name) + ' — wanted the file’s own name');
    const f = spec.root.folders[0].folders[0].files.find(x => x.name === 'Night Ferry (1987) unfinished');
    f.name = 'Night Ferry Returns (1988)';
    const r = sync();
    const nf = rows().find(x => x.drive_id === nf0.drive_id) || {};
    if (nf.title !== 'Night Ferry Returns' || String(nf.year) !== '1988' || String(nf.notes) !== '')
      fail('a renamed file', 'its row reads ' + JSON.stringify({ title: nf.title, year: nf.year, notes: nf.notes })
           + ' — wanted the new title and year, and the note the new name no longer carries gone');
    if (nf.drive_name !== 'Night Ferry Returns (1988)') fail('drive_name', 'not rewritten on a rename: ' + JSON.stringify(nf.drive_name));
    if (r.refreshed !== 1 || r.added) fail('a renamed file', 'counted ' + JSON.stringify({ added: r.added, refreshed: r.refreshed }) + ' for one renamed file');
    const a = w.get({ token: w.tok['a1@example.org'] });
    if (!(a.films || []).some(x => x.title === 'Night Ferry Returns')) fail('a renamed file', 'the admin’s search is not sent the new title');
    if (/drive_?name/i.test(JSON.stringify(a))) fail('drive_name never leaves the server', 'the admin’s payload carries a drive_name key');
    const again = sync();
    if (again.writes !== 0) fail('a renamed file', 'the pass after it wrote ' + again.writes + ' cell(s)');
    if (again.refreshed) fail('a renamed file', 'the pass after it refreshed ' + again.refreshed + ' row(s) — a rename is written once');
  }
  /* A ROW WITH NO `drive_name` — made before the column — HAS ONLY ITS BLANKS FILLED: nothing says which of
     its cells the machine wrote, so none is taken for the machine's. */
  const pm = find(rows(), 'Paper Moon Rising');
  if (pm) {
    w.setCell(pm.drive_id, 'drive_name', '');
    w.setCell(pm.drive_id, 'title', 'Paper Moon Rising (typed)');
    const f = spec.root.folders[0].folders[0].files.find(x => x.name === 'Paper Moon Rising (1993)');
    f.name = 'Paper Moon Rising Again (1993)';
    sync();
    const p2 = rows().find(x => x.drive_id === pm.drive_id) || {};
    if (p2.title !== 'Paper Moon Rising (typed)') fail('a row with no drive_name', 'a title on a row the column never saw was written over: ' + p2.title);
    if (p2.drive_name !== 'Paper Moon Rising Again (1993)') fail('a row with no drive_name', 'the pass did not give it one: ' + JSON.stringify(p2.drive_name));
  }
}

/* ---------- A SHOW THAT LOSES EVERY EPISODE IS SWITCHED OFF ------------------------------------------------
   The `if (d.empty)` branch of `filmsUpsert_`: an empty folder makes no row, and a folder whose row exists
   and has emptied switches that row off. Only a show that never had a row was asked before — deleting the
   line that switches it off left this file green (review of 9 Oct). */
{
  const w = world();
  const { spec, sync, rows } = w;
  const r1 = sync();
  const flat = spec.root.folders[0].folders[1].folders.find(x => x.name === 'Example Flat Show');
  const keep = flat.files;
  flat.files = [];
  const r2 = sync();
  const row = find(rows(), 'Example Flat Show');
  if (!row || isOn(row.active)) fail('an emptied show', 'its row is ' + JSON.stringify(row && row.active) + ' — wanted switched off');
  if (r2.off !== 1) fail('an emptied show', 'the reply counts ' + r2.off + ' switched off, wanted 1');
  if (!r1.found || !r2.found || r2.found.series !== r1.found.series - 1) fail('an emptied show', 'series went ' + (r1.found && r1.found.series) + ' → ' + (r2.found && r2.found.series) + ', wanted one fewer');
  const a = w.get({ token: w.tok['a1@example.org'] });
  if ((a.films || []).some(x => x.title === 'Example Flat Show')) fail('an emptied show', 'the admin is still sent it');
  flat.files = keep;
  sync();
  const back = find(rows(), 'Example Flat Show');
  if (!back || !isOn(back.active)) fail('an emptied show', 'its episodes came back and the row stayed off');
}

/* ---------- WHICH FOLDER, WHEN MORE THAN ONE IS CALLED NOTFLIX ----------------------------------------------
   The name search sees folders SHARED with the account, and listed them in no fixed order, and the first
   was taken: a second folder of that name listed first made the next whole pass switch off every film in
   the right one (review of 9 Oct, reproduced here before the fix: "1 new, 0 updated, 12 switched off"). */
const another = (owner, film) => ({ name: 'Notflix', owner: owner, folders: [{ name: 'Notflix adults', folders: [
  { name: 'Films', files: [{ name: film || 'Somebody Else’s Film', gb: 1.0, mime: 'video/mp4' }] }] }] });
{
  /* ONE OF THEM THIS ACCOUNT'S, THE OTHER SHARED WITH IT AND LISTED FIRST: its own wins. */
  const spec = tree();
  spec.before = [another('someone@example.org')];
  const w = world({ spec });
  const r = w.sync();
  if (!r.success || r.added !== 12 || r.how !== 'name') fail('which folder', 'with a shared folder named Notflix listed first, the first sync answered ' + JSON.stringify({ how: r.how, added: r.added, error: r.error }) + ' — wanted this account’s own, 12 new');
  if (find(w.rows(), 'Somebody Else’s Film')) fail('which folder', 'a film from a folder shared with the account made a row');
}
{
  /* THE FLIP: one folder synced, then a second of that name appears and Drive lists it first. The folder
     the last run used is used again, by its id — nothing switched off. */
  const w = world();
  w.sync();
  w.spec.before = [another(undefined, 'A Backup Copy')];
  const r = w.sync();
  if (!r.success || r.off || r.added || r.how !== 'remembered') fail('which folder', 'a second folder named Notflix listed first changed the next pass: ' + JSON.stringify({ how: r.how, added: r.added, off: r.off, error: r.error }));
  if (!/synced before/.test(String(r.message))) fail('which folder', 'the reply does not say it used the folder synced before: ' + r.message);
  /* AND A RENAMED ROOT IS STILL THE ROOT. */
  w.spec.root.name = 'Notflix (old)';
  const r2 = w.sync();
  if (!r2.success || r2.off || r2.folder !== 'Notflix (old)') fail('which folder', 'the folder synced before, renamed, was not used: ' + JSON.stringify({ folder: r2.folder, off: r2.off, error: r2.error }));
  /* IN THE BIN, IT IS NOT: the name decides again. */
  w.spec.root.trashed = true;
  w.spec.before = [];
  w.spec.elsewhere = [another(undefined, 'A Film In The New Folder')];
  const r3 = w.sync();
  if (!r3.success || r3.how !== 'name' || !find(w.rows(), 'A Film In The New Folder')) fail('which folder', 'with the folder synced before in the bin the sync answered ' + JSON.stringify({ how: r3.how, error: r3.error }));
}
{
  /* TWO OF THIS ACCOUNT'S OWN, NOTHING REMEMBERED: refused, by a sentence naming the cell, nothing written. */
  const spec = tree();
  spec.before = [another(undefined)];
  const w = world({ spec });
  const before = JSON.stringify(w.b.tabs.films);
  const r = w.sync();
  if (r.success || !/films_folder/.test(String(r.error)) || !/Notflix/.test(String(r.error))) fail('two folders named Notflix', 'answered ' + JSON.stringify(r).slice(0, 200) + ' — wanted a refusal naming films_folder');
  if (JSON.stringify(w.b.tabs.films) !== before) fail('two folders named Notflix', 'a refused sync changed the films tab');
  /* AND NEITHER THE ACCOUNT'S: refused the same way. */
  const spec2 = tree();
  spec2.root.owner = 'family@example.org';
  spec2.elsewhere = [another('someone@example.org')];
  const r2 = world({ spec: spec2 }).sync();
  if (r2.success || !/films_folder/.test(String(r2.error))) fail('two folders named Notflix', 'two shared with the account answered ' + JSON.stringify(r2).slice(0, 200));
  /* ONE, SHARED WITH THE ACCOUNT, IS USED — the real one may live in a family member's Drive. */
  const spec3 = tree();
  spec3.root.owner = 'family@example.org';
  const r3 = world({ spec: spec3 }).sync();
  if (!r3.success || r3.added !== 12) fail('which folder', 'the one folder named Notflix, shared with the account, was not used: ' + JSON.stringify({ added: r3.added, error: r3.error }));
}

/* ---------- NO PAYLOAD IS RETIRED, AND THE NEXT LOAD IS A HIT WITH THE NEW FILMS ---------- */
{
  const w = world();
  const { b, sync, get, spec } = w;
  sync();
  get({ token: w.tok['a1@example.org'] });
  get({ token: w.tok['s1@example.org'] });
  get({});
  const gen = b.props.PAYLOAD_GEN;
  const keys0 = [...b.cache.keys()].filter(k => /^pay:[^:]*$/.test(k)).sort().join();
  const stored = [...b.cache.keys()].filter(k => /^pay:.*:\d+$/.test(k)).map(k => b.cache.get(k)).join('');
  if (!keys0) fail('no payload retired', 'nothing was cached to begin with, so this asked nothing');
  if (/"films"\s*:\s*\[\s*\{/.test(stored) || /"filmsSync"\s*:/.test(stored)) fail('no payload retired', 'a STORED body carries the films or the stamp — a sync would have to retire it');
  spec.root.folders[1].folders[0].files.push({ name: 'Little Lantern (2021).mp4', gb: 1.0, mime: 'video/mp4' });
  const r = sync();
  if (r.added !== 1) fail('the setup', 'a new kids film was not added: ' + JSON.stringify(r.added));
  if (b.props.PAYLOAD_GEN !== gen) fail('no payload retired', 'a sync bumped PAYLOAD_GEN (' + gen + ' → ' + b.props.PAYLOAD_GEN + ') — every visitor rebuilds thirty tabs for a list only the admin is sent');
  const keys1 = [...b.cache.keys()].filter(k => /^pay:[^:]*$/.test(k)).sort().join();
  if (keys1 !== keys0) fail('no payload retired', 'the stored payloads changed: ' + keys0 + ' → ' + keys1);
  const admin = get({ token: w.tok['a1@example.org'] });
  if (!admin.cached) fail('no payload retired', 'the admin’s next load was not served from the store');
  if (!(admin.films || []).some(f => f.title === 'Little Lantern' && f.audience === 'kids')) fail('no payload retired', 'the admin’s next load (a hit) does not have the film the sync just added');
  const pupil = get({ token: w.tok['s1@example.org'] });
  if (!pupil.cached || (pupil.films || []).length || 'filmsSync' in pupil) fail('only an admin', 'a student’s cache hit was laid films: ' + JSON.stringify(pupil.films));
}

/* ---------- WHICH FOLDER: `films_folder` IN CONFIG, NEVER SENT; A WRONG ONE IS SAID; NONE IS SAID ---------- */
{
  const w = world();
  const { b, d, spec, sync, get } = w;
  const rootId = d.idOf(spec.root, 'd');
  b.seed('config', [{ key: 'films_folder', value: 'https://drive.google.com/drive/folders/' + rootId, what_it_does: 'test' }]);
  const r = sync();
  if (!r.success || r.how !== 'config' || !/films_folder/.test(r.message)) fail('which folder', 'with films_folder set the sync answered ' + JSON.stringify({ how: r.how, message: r.message, error: r.error }));
  [['the admin', get({ token: w.tok['a1@example.org'] })], ['a student', get({ token: w.tok['s1@example.org'] })], ['a stranger', get({})]].forEach(([who, p]) => {
    const all = JSON.stringify(p);
    if (all.indexOf(rootId) !== -1) fail('films_folder never leaves the server', who + '’s payload holds the folder’s id');
    if (p.constants && p.constants.vars && 'films_folder' in p.constants.vars) fail('films_folder never leaves the server', who + ' is sent constants.vars.films_folder');
  });
  if (JSON.stringify(r).indexOf(rootId) !== -1) fail('films_folder never leaves the server', 'the sync’s own reply holds the folder’s id');
  /* A WRONG ONE: said, and nothing written or switched off. */
  const g = b.tabs.config, h = g[0];
  g.find((x, i) => i > 0 && x[h.indexOf('key')] === 'films_folder')[h.indexOf('value')] = 'example-not-a-folder';
  const before = JSON.stringify(b.tabs.films);
  const bad1 = sync();
  if (bad1.success || !/films_folder/.test(String(bad1.error))) fail('a wrong films_folder', 'answered ' + JSON.stringify(bad1).slice(0, 200) + ' — wanted a sentence naming the cell');
  if (JSON.stringify(b.tabs.films) !== before) fail('a wrong films_folder', 'a sync of a folder that would not open changed the tab');
}
{
  const spec = tree();
  spec.root.name = 'Something Else';
  const w = world({ spec });
  const r = w.sync();
  if (r.success || !/Notflix/.test(String(r.error))) fail('no folder', 'with no folder named Notflix the sync answered ' + JSON.stringify(r).slice(0, 200));
}

/* ---------- THE CLOCK: IT STOPS, SWITCHES NOTHING OFF PART-WAY, AND FINISHES ON THE NEXT RUNS ---------- */
{
  const w = world({ rows: [
    /* A ROW FOR A FILE THAT IS NOT IN THE FOLDER — it must survive every part-way run and go off at the end. */
    { film_id: 'FM950', title: 'Long Gone', kind: 'film', drive_id: 'example-gone-001', drive_url: 'https://example.org/gone', file_kind: 'file', active: 'TRUE' },
  ] });
  const { b, clock, sync, rows } = w;
  /* FIVE SECONDS A FILE, so the first show in id order (six episodes) is 30s on its own — past the 20s
     budget. The first thing of a run is given the ceiling, not the budget, so a run always gets one
     thing done; without that a show bigger than the budget would be cut at the same place for ever. */
  const COST = 5000;
  clock.cost = COST;
  const runs = [];
  for (let i = 0; i < 20; i++) {
    const r = sync();
    runs.push(r);
    if (!r.success) { fail('the clock', 'run ' + (i + 1) + ' refused: ' + JSON.stringify(r).slice(0, 200)); break; }
    const gone = find(rows(), 'Long Gone');
    if (r.more && (!gone || !isOn(gone.active))) fail('the clock', 'a part-way run (' + (i + 1) + ') switched off a row the pass had not got to — "not seen yet" is not "gone"');
    if (!r.more) break;
  }
  const last = runs[runs.length - 1] || {};
  if (runs.length < 3) fail('the clock', 'the pass finished in ' + runs.length + ' run(s) at three seconds a file against a 20s budget — the bound never bit');
  if (last.more || !last.done) fail('the clock', 'twenty runs did not finish one pass');
  if (runs.slice(0, -1).some(r => !r.more || r.done)) fail('the clock', 'a run that stopped did not say `more`');
  if (runs.some((r, i) => !(r.looked > (i ? runs[i - 1].looked : 0)))) fail('the clock', 'a run made no progress — looked at, run by run: ' + runs.map(r => r.looked).join(', '));
  const live = rows().filter(r => r.drive_id && r.drive_id !== 'example-gone-001');
  if (live.length !== 12 || new Set(live.map(r => r.drive_id)).size !== 12) fail('the clock', 'after ' + runs.length + ' runs there are ' + live.length + ' rows for 12 things (each must be made once)');
  const gone = find(rows(), 'Long Gone');
  if (!gone || isOn(gone.active)) fail('the clock', 'the whole pass did not switch off the row whose file is not in the folder');
  const said = (b.get({ token: w.tok['a1@example.org'] }).filmsSync) || {};
  if (said.more || !said.at) fail('the clock', 'after the pass the admin’s stamp says ' + JSON.stringify(said));
  /* A PART-WAY PASS IS SAID TO THE ADMIN, so the card asks again. */
  const st = JSON.parse(b.props.FILMS_SYNC || '{}');
  if (st.pass || st.after) fail('the clock', 'a finished pass left a place to resume from: ' + JSON.stringify({ pass: st.pass, after: st.after }));
  /* AND NO RUN WENT PAST THE BUDGET BY MORE THAN THE ONE THING IT WAS LOOKING AT, nor past the ceiling. */
  const ceiling = b.ev('FILMS_SYNC_CEILING_MS'), budget = b.ev('FILMS_SYNC_BUDGET_MS');
  if (runs.some(r => !(r.ms >= 0) || r.ms > ceiling)) fail('the clock', 'a run went past the ceiling, or did not say how long it took: ' + runs.map(r => r.ms).join(', '));
  /* PAST THE BUDGET ONLY BY THE ONE FILE IT WAS LOOKING AT — or, when it looked at a single thing, by
     that thing: the guarantee of progress, and the only overrun allowed. */
  runs.forEach((r, i) => {
    const one = r.looked - (i ? runs[i - 1].looked : 0) === 1;
    if (!one && r.ms > budget + COST) fail('the clock', 'run ' + (i + 1) + ' took ' + r.ms / 1000 + 's against a ' + budget / 1000 + 's budget, over ' + (r.looked - (i ? runs[i - 1].looked : 0)) + ' things');
  });
  info.push('a pass at ' + COST / 1000 + ' seconds a file, against a ' + budget / 1000 + 's budget: ' + runs.length
            + ' runs, looked at ' + runs.map(r => r.looked).join(' → ') + ' of ' + last.of + ', each in ' + runs.map(r => r.ms / 1000 + 's').join(', '));
}
/* A LONG SHOW THAT IS NOT THE FIRST THING OF ITS RUN IS CUT AT THE LINE, NOT AT THE END OF ITS FOLDER —
   forty episodes kept flat, a second each, after a one-episode show: the run stops at the budget with
   the long show undone, and the next run (where it is first) does it whole. */
{
  const ep = (n, i) => ({ name: '1.' + (i + 1) + '.mkv', gb: 0.2, cost: 1000 });
  const spec = { root: { name: 'Notflix', folders: [{ name: 'Notflix adults', folders: [
    { name: 'Tv shows', folders: [
      { name: 'A Small Show', files: [ep(0, 0)] },
      { name: 'A Long Flat Show', files: Array.from({ length: 40 }, ep) },
    ] },
  ] }] } };
  const w = world({ spec });
  const r1 = w.sync();
  const budget = w.b.ev('FILMS_SYNC_BUDGET_MS');
  if (!r1.more || r1.looked !== 1) fail('the clock', 'the long show after the short one was not left for the next run: ' + JSON.stringify({ more: r1.more, looked: r1.looked }));
  if (r1.ms > budget + 1000) fail('the clock', 'a forty-episode show begun mid-run ran ' + r1.ms / 1000 + 's against a ' + budget / 1000 + 's budget — the clock is asked once a folder, not once an episode');
  const r2 = w.sync();
  const long = find(w.rows(), 'A Long Flat Show');
  if (!r2.done || !long || Math.abs(Number(long.size_gb) - 8) > 0.011) fail('the clock', 'the next run did not finish the long show whole: ' + JSON.stringify({ done: r2.done, size: long && long.size_gb }));
}

/* A RUN STARTED PART-WAY IS SENT TO THE ADMIN AS `more`, which is what makes the card ask again. */
{
  const w = world();
  w.clock.cost = 3000;
  const r = w.sync();
  const said = (w.get({ token: w.tok['a1@example.org'] }).filmsSync) || {};
  if (!r.more || said.more !== true) fail('the clock', 'a part-way pass is not said to the admin: ' + JSON.stringify(said));
}

console.log('');
console.log('THE FILMS ARE WHAT IS IN THE NOTFLIX FOLDER, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
info.forEach(x => console.log('  ' + x));
console.log('\nquestions asked: ' + asked);
if (bad.length) {
  console.log('FAILED — the films tab does not follow the folder, or something of it reached somebody it must not.');
  process.exit(1);
}
console.log('OK — every film and series once, a second pass writes nothing, typed cells survive, a missing file goes off and comes back, only an admin, no id sent, no payload retired, and the clock stops and resumes.');
