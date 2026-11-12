/* @family. — films.gs THE FILMS: whatever is in the Notflix folder, walked into the sheet */

/* THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER § */

/** The clock the budget is measured against. A function, so `check-films.js` can run the walk on a
    clock of its own and prove that it stops and resumes without waiting twenty real seconds. */
function filmsClock_() { return Date.now(); }

/** Where the last run got to. `{ at, pass, after, root, folder, how, found }` — see `filmsSync_`. */
function filmsState_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(FILMS_SYNC_PROP);
    const st = raw ? JSON.parse(raw) : {};
    return (st && typeof st === 'object') ? st : {};
  } catch (err) { return {}; }
}
function filmsStateSave_(st) {
  try { PropertiesService.getScriptProperties().setProperty(FILMS_SYNC_PROP, JSON.stringify(st || {})); }
  catch (err) {}
}

/* ---------- WHICH FOLDER § */
function filmsRoot_() {
  const cfg = config();
  const raw = S(cfg[FILMS_FOLDER_KEY]);
  if (raw) {
    let f = null;
    try { f = DriveApp.getFolderById(folderIdFrom(raw)); } catch (err) { f = null; }
    if (!f) return { error: 'The films_folder cell in the config tab does not open a folder this script can see. '
                            + 'Check it, or blank it to use the folder named Notflix.' };
    return { folder: f, name: S(f.getName()), how: 'config' };
  }
  const was = S(filmsState_().root);
  if (was) {
    let f = null;
    try { f = DriveApp.getFolderById(was); if (f && f.isTrashed && f.isTrashed()) f = null; } catch (err) { f = null; }
    if (f) return { folder: f, name: S(f.getName()), how: 'remembered' };
  }
  const found = [];
  try {
    const it = DriveApp.searchFolders("title contains '" + FILMS_FOLDER_NAME + "' and trashed = false");
    while (it.hasNext()) {
      const f = it.next();
      if (norm(f.getName()) === FILMS_FOLDER_NAME) found.push(f);
    }
  } catch (err) {
    return { error: 'Drive could not be searched — ' + S(err && err.message || err)
                    + '. Run authoriseDrive once from the Apps Script editor.' };
  }
  if (!found.length) return { error: 'No folder named Notflix is visible to this script. Put its id in '
                                      + 'films_folder on the config tab.' };
  if (found.length === 1) return { folder: found[0], name: S(found[0].getName()), how: 'name' };
  const me = filmsMe_();
  const mine = me ? found.filter(f => filmsOwner_(f) === me) : [];
  if (mine.length === 1) return { folder: mine[0], name: S(mine[0].getName()), how: 'name' };
  return { error: found.length + ' folders are named Notflix and nothing says which is the films. Put the right '
                  + 'one’s id (or its address) in films_folder on the config tab — nothing was synced.' };
}
/** This account's own address, as Drive knows it — the owner of its My Drive. '' when Drive will not say. */
function filmsMe_() {
  try { const o = DriveApp.getRootFolder().getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}
/** A folder's owner's address, or '' (a shared drive's folder has no owner). */
function filmsOwner_(f) {
  try { const o = f.getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}

/* ---------- A NAME, READ § */
function filmsTitle_(name) {
  let s = S(name).replace(/\s+/g, ' ');
  s = s.replace(FILMS_RE_VIDEO_EXT, '').trim();
  if (!/\s/.test(s) && /\.(?:19|20)\d{2}(?:\.|$)/.test(s)) {
    const m = s.match(/^(.*?)\.((?:19|20)\d{2})(?:\.|$)/);
    if (m && m[1]) return { title: m[1].replace(/[._]+/g, ' ').trim(), year: m[2], note: '' };
  }
  let m = s.match(/^(.*?)\s*\(((?:19|20)\d{2})\)\s*(.*)$/);
  if (m && S(m[1])) return { title: S(m[1]), year: m[2], note: S(m[3]) };
  m = s.match(/^(.*\S)\s+-\s+([A-Z0-9]{2,6})$/);
  if (m && /\d/.test(m[2])) return { title: S(m[1]), year: '', note: m[2] };
  return { title: s, year: '', note: '' };
}

/* AN EPISODE'S SEASON AND NUMBER from its name: `S.E.mkv`, a bare `S.E`, `S.E <a note>.mkv`, and the
   release style `Show.S01E10.720p...mkv` that four files in one season use. Null for anything else. */
function filmsEpisode_(name) {
  const s = S(name);
  let m = s.match(/(?:^|[^A-Za-z0-9])[Ss](\d{1,2})[ ._-]?[Ee](\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  m = s.match(/^(\d{1,2})\.(\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  return null;
}

/** A video by its type, or by its name when Drive did not know the type. */
function filmsIsVideo_(f) {
  return /^video\//i.test(S(f.getMimeType())) || FILMS_RE_VIDEO_EXT.test(S(f.getName()));
}

function filmsEach_(it, fn) { while (it.hasNext()) fn(it.next()); }

/** Gigabytes to two places, as Drive itself counts them (1024³). */
function filmsGb_(bytes) { return Math.round((Number(bytes) || 0) / 1073741824 * 100) / 100; }

/* ---------- THE THINGS IN THE FOLDER, LISTED BUT NOT YET WALKED § */
function filmsList_(root) {
  const out = { things: [], skipped: 0, unknown: 0 };
  const seen = {};
  const push = (x, kind, audience, fileKind, placeholder) => {
    const id = S(x.getId());
    if (!id || seen[id]) return;
    seen[id] = true;
    out.things.push({ id: id, name: S(x.getName()), kind: kind, audience: audience,
                      fileKind: fileKind, ref: x, placeholder: !!placeholder });
  };
  const fileAs = (f, kind, audience) => {
    if (S(f.getMimeType()) === FILMS_MIME_DOC) return push(f, kind, audience, 'file', true);
    if (!filmsIsVideo_(f)) { out.skipped++; return; }
    push(f, kind, audience, 'file', false);
  };
  const folderAs = (d, kind, audience) => {
    if (FILMS_RE_EXTRA.test(S(d.getName()))) { out.skipped++; return; }
    push(d, kind, audience, 'folder', false);
  };
  filmsEach_(root.getFiles(), f => fileAs(f, 'film', ''));
  filmsEach_(root.getFolders(), top => {
    const topName = S(top.getName());
    if (FILMS_RE_DOCS.test(topName)) {
      filmsEach_(top.getFiles(), f => fileAs(f, 'documentary', ''));
      filmsEach_(top.getFolders(), d => folderAs(d, 'documentary', ''));
      return;
    }
    const audience = norm(topName).replace(/^notflix\b\s*/, '').trim();
    filmsEach_(top.getFiles(), f => fileAs(f, 'film', audience));
    filmsEach_(top.getFolders(), mid => {
      const n = S(mid.getName());
      if (FILMS_RE_FILMS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'film', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'film', audience));
      } else if (FILMS_RE_TV.test(n)) {
        filmsEach_(mid.getFolders(), d => folderAs(d, 'series', audience));
        /* AN EPISODE LOOSE IN `Tv shows` BELONGS TO NO SHOW, so it is counted and not guessed at. */
        filmsEach_(mid.getFiles(), () => { out.skipped++; });
      } else if (FILMS_RE_DOCS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'documentary', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'documentary', audience));
      } else {
        out.unknown++;
      }
    });
  });
  return out;
}

/* ---------- ONE THING, LOOKED AT § */
function filmsDescribe_(th, stopAt) {
  const d = { id: th.id, name: th.name, kind: th.kind, audience: th.audience, fileKind: th.fileKind,
              placeholder: th.placeholder, sizeGb: '', seasons: '', episodes: 0, empty: false };
  if (th.placeholder) return d;
  if (th.fileKind === 'file') {
    d.sizeGb = filmsGb_(th.ref.getSize());
    return d;
  }
  const acc = { bytes: 0, videos: 0, seasons: {}, cut: false };
  filmsWalk_(th.ref, 0, acc, 0, stopAt);
  if (acc.cut) return null;
  if (!acc.videos) { d.empty = true; return d; }
  d.sizeGb = filmsGb_(acc.bytes);
  d.episodes = acc.videos;
  if (th.kind === 'series') d.seasons = Object.keys(acc.seasons).length || 1;
  return d;
}
function filmsWalk_(folder, season, acc, depth, stopAt) {
  if (acc.cut) return;
  /* THE CLOCK IS ASKED AT EVERY EPISODE, not once a folder: a show kept flat is sixty episodes in one
     folder, and a check at the door would let it run a minute past the line. */
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (filmsClock_() > stopAt) { acc.cut = true; return; }
    const f = files.next();
    if (!filmsIsVideo_(f)) continue;
    acc.videos++;
    acc.bytes += Number(f.getSize()) || 0;
    const ep = filmsEpisode_(f.getName());
    const s = season || (ep ? ep.season : 0);
    if (s) acc.seasons[s] = true;
  }
  if (depth >= 3) return;
  filmsEach_(folder.getFolders(), sub => {
    const n = S(sub.getName());
    if (FILMS_RE_EXTRA.test(n)) return;
    const m = n.match(FILMS_RE_SEASON);
    filmsWalk_(sub, m ? Number(m[1]) : season, acc, depth + 1, stopAt);
  });
}

/** The address a row opens: a file's viewer, or a series' folder — `file_kind` says which (note 068). */
function filmsUrl_(d) {
  return d.fileKind === 'folder' ? 'https://drive.google.com/drive/folders/' + d.id
                                 : 'https://drive.google.com/file/d/' + d.id + '/view';
}

/* ---------- ONE THING INTO THE TAB § */
function filmsUpsert_(t, d, ctx) {
  const tally = ctx.tally;
  let row = ctx.byId[d.id] || null;
  if (d.empty) {
    if (row && ON_(row.active)) { setCells(t, row, { active: false }); tally.off++; }
    tally.empty++;
    return;
  }
  const named = filmsTitle_(d.name);
  const machine = {
    kind: d.kind, audience: d.audience, drive_name: d.name,
    drive_url: d.placeholder ? '' : filmsUrl_(d),
    file_kind: d.placeholder ? '' : d.fileKind,
    size_gb: d.sizeGb, seasons: d.seasons,
  };
  if (!row) {
    const k = key(named.title);
    row = k ? (ctx.loose.find(r => !r._adopted && key(r.title) === k) || null) : null;
    if (row) { row._adopted = true; machine.drive_id = d.id; tally.adopted++; }
  }
  /* EVERY COLUMN BY NAME, not `Object.assign` over `machine`: `check-columns.js` reads the keys of an
     `addRow` literal, and a row assembled out of variables is a row whose columns no check can see. */
  if (!row) {
    const made = addRow(t, {
      film_id: 'FM' + String(ctx.next++).padStart(3, '0'),
      title: named.title, year: named.year, director: '', lead: '', notes: named.note,
      drive_id: d.id, drive_name: d.name, kind: machine.kind, audience: machine.audience, drive_url: machine.drive_url,
      file_kind: machine.file_kind, size_gb: machine.size_gb, seasons: machine.seasons,
      placeholder: !!d.placeholder, active: true,
    });
    if (made) { ctx.byId[d.id] = made; tally.added++; }
    return;
  }
  const want = Object.assign({}, machine);
  if (TRUE_(row.placeholder) !== !!d.placeholder) want.placeholder = !!d.placeholder;
  if (!TRUE_(row.active)) want.active = true;
  const was = filmsTitle_(row.drive_name);
  const ours = (have, said) => !S(have) || S(have) === S(said);
  if (named.title && ours(row.title, was.title)) want.title = named.title;
  if (ours(row.year, was.year)) want.year = named.year;
  if (ours(row.notes, was.note)) want.notes = named.note;
  if (!S(row.film_id)) want.film_id = 'FM' + String(ctx.next++).padStart(3, '0');
  if (setCells(t, row, want).length) tally.refreshed++;
  ctx.byId[d.id] = row;
}

/* ---------- THE SYNC § */
function filmsSync_(opts) {
  const t0 = filmsClock_();
  const budget = Math.max(1, Number(opts && opts.budgetMs) || FILMS_SYNC_BUDGET_MS);
  const ceiling = FILMS_SYNC_CEILING_MS;
  const root = filmsRoot_();
  if (root.error) return { error: root.error, why: 'folder' };
  const rootId = S(root.folder.getId());

  let list;
  try { list = filmsList_(root.folder); }
  catch (err) { return { error: 'The folder could not be read — ' + S(err && err.message || err), why: 'drive' }; }
  list.things.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const st = filmsState_();
  const resuming = !!S(st.pass) && S(st.root) === rootId;
  const after = resuming ? S(st.after) : '';
  const todo = list.things.filter(x => x.id > after);

  const looked = filmsLook_(todo, t0, budget, ceiling), done = looked.done, more = looked.more;

  const tally = { added: 0, refreshed: 0, adopted: 0, off: 0, empty: 0 };
  const wroteBefore = POST_WROTE;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — press Sync from Drive again in a minute.', why: 'busy' };
  try {
    /* FRESH ROWS UNDER THE LOCK, `submitAnswer`'s rule: a copy read before it was the copy another run was
       about to change. */
    clearCache();
    const t = read(TAB.films);
    if (!t.sheet) return { error: 'The Ledger has no films tab. Open the site once as an admin.', why: 'tab' };
    const ctx = filmsIndex_(t, tally);
    done.forEach(d => filmsUpsert_(t, d, ctx));

    const warn = filmsSwitchOff_(t, list, more, tally);

    const found = filmsFound_(t, list);
    filmsNextState_(st, rootId, root, more, resuming, after, done, found);

    const said = filmsMessage_(root, list, todo, done, more, found, tally, warn), at = said.at, message = said.message;
    return Object.assign({ done: !more, more: more, folder: root.name, how: root.how, found: found,
                           looked: at, of: list.things.length, skipped: list.skipped, unknown: list.unknown,
                           ms: filmsClock_() - t0, message: message }, tally);
  } finally {
    lock.releaseLock();
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/* EACH THING DESCRIBED, OUTSIDE THE LOCK, until the time runs out; `more` says the pass is not finished. */
function filmsLook_(todo, t0, budget, ceiling) {
  /* ---------- LOOKED AT, UNLOCKED — see the note at the top of this section ---------- */
  const done = [];
  let more = false;
  for (let i = 0; i < todo.length; i++) {
    const now = filmsClock_();
    if (now - t0 > ceiling || (done.length && now - t0 > budget)) { more = true; break; }
    const d = filmsDescribe_(todo[i], t0 + (done.length ? budget : ceiling));
    if (!d) { more = true; break; }
    done.push(d);
  }
  return { done, more };
}

/* THE ROWS BY DRIVE ID, the ones with none, and the next FM number — what `filmsUpsert_` writes against. */
function filmsIndex_(t, tally) {
  const byId = {}, loose = [];
  let top = 0;
  t.rows.forEach(r => {
    const id = S(r.drive_id);
    if (id) byId[id] = r; else loose.push(r);
    const m = S(r.film_id).match(/^FM(\d+)$/);
    if (m) top = Math.max(top, Number(m[1]));
  });
  const ctx = { byId: byId, loose: loose, next: top + 1, tally: tally };
  return ctx;
}

/* A WHOLE PASS SWITCHES OFF what the folder no longer lists; an empty folder switches off nothing and says so. */
function filmsSwitchOff_(t, list, more, tally) {
  /* ---------- A WHOLE PASS, AND ONLY A WHOLE PASS, SWITCHES OFF § */
  let warn = '';
  if (!more) {
    if (list.things.length) {
      const listed = {};
      list.things.forEach(x => { listed[x.id] = true; });
      t.rows.forEach(r => {
        const id = S(r.drive_id);
        if (id && !listed[id] && ON_(r.active)) { setCells(t, r, { active: false }); tally.off++; }
      });
    } else {
      warn = ' The folder held nothing a film could be made from, so nothing was switched off.';
    }
  }
  return warn;
}

/* THE FOLDER COUNTED, from the active rows of things it lists. */
function filmsFound_(t, list) {
  /* WHAT IS IN THE FOLDER, COUNTED FROM THE ROWS THE PASS LEFT ON — so an empty show, which is listed
     and makes no row, is not counted as a series, and a pass done over three runs counts all three. */
  const found = { films: 0, series: 0, documentaries: 0, placeholders: 0 };
  const inFolder = {};
  list.things.forEach(x => { inFolder[x.id] = true; });
  t.rows.forEach(r => {
    if (!inFolder[S(r.drive_id)] || !ON_(r.active)) return;
    if (TRUE_(r.placeholder)) found.placeholders++;
    else if (norm(r.kind) === 'series') found.series++;
    else if (norm(r.kind) === 'documentary') found.documentaries++;
    else found.films++;
  });
  return found;
}

/* WHERE THE NEXT RUN PICKS UP, or the finished pass stamped with what it found. */
function filmsNextState_(st, rootId, root, more, resuming, after, done, found) {
  const stamp = new Date(filmsClock_()).toISOString();
  const next = Object.assign({}, st, { root: rootId, folder: root.name, how: root.how });
  if (more) {
    next.pass = resuming ? S(st.pass) : stamp;
    next.after = done.length ? done[done.length - 1].id : after;
  } else {
    next.pass = '';
    next.after = '';
    next.at = stamp;
    next.found = found;
  }
  filmsStateSave_(next);
}

/* WHAT THE ADMIN IS TOLD: how far a part-pass got, or what a whole pass found and changed. */
function filmsMessage_(root, list, todo, done, more, found, tally, warn) {
  const where = root.name + (root.how === 'config' ? ' (the films_folder in config)'
                             : root.how === 'remembered' ? ' (the folder synced before)' : ' (found by its name)');
  const at = list.things.length - todo.length + done.length;
  const message = more
    ? 'Part-way through ' + where + ': ' + at + ' of ' + list.things.length
      + ' looked at. The rest follow on the next run.'
    : 'Synced from ' + where + ': ' + found.films + ' film' + (found.films === 1 ? '' : 's') + ', '
      + found.series + ' series, ' + found.documentaries + ' documentar' + (found.documentaries === 1 ? 'y' : 'ies')
      + (found.placeholders ? ', ' + found.placeholders + ' not uploaded' : '') + '. '
      + tally.added + ' new, ' + tally.refreshed + ' updated, ' + tally.off + ' switched off.' + warn;
  return { at, message };
}

/** Run from the editor's function dropdown (or `?run=syncFilms`): the editor's budget, the same sync. */
function syncFilms() {
  const out = filmsSync_({ budgetMs: FILMS_SYNC_EDITOR_MS });
  const said = out.error ? 'NOT SYNCED — ' + out.error : out.message;
  try { Logger.log(said); } catch (err) {}
  return said;
}
