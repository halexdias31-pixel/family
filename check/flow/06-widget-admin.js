/* A COLUMN LEFT BEFORE ITS PLACEMENT HAS HAPPENED STARTS NOTHING MORE BEHIND IT. § */
check('a column left before its placement has happened starts nothing more of its widgets', async () => {
  const { w } = boot();
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  await wait(300);
  t.findGroup('Tools');
  await until_(() => t.waiting().filter(q => q.col === 'stuff').length >= 3, 8000);
  const queued = t.waiting().filter(q => q.col === 'stuff').length;
  if (queued < 3) return ['arriving at Tools left ' + queued + ' widget(s) queued, so a queue running behind a column change was not asked'];
  const raf = w.requestAnimationFrame;
  w.requestAnimationFrame = () => 0;
  /* A FRAME ALREADY BOOKED STILL RUNS — let it, on Tools, before the column changes. */
  await wait(60);
  const before = t.running().filter(r => r.col === 'stuff').length;
  const left = t.waiting().filter(q => q.col === 'stuff').length;
  t.go('account', false, true);
  await wait(600);
  const after = t.running().filter(r => r.col === 'stuff').length;
  const bad = [];
  if (t.glass().at === 'account') bad.push('Settings was placed although no frame could run, so the gap before the placement was not made and nothing was asked');
  else if (!left) bad.push('nothing was left in the queue when Tools was left, so nothing was asked');
  else if (after > before) bad.push((after - before) + ' Tools widget(s) were started after Tools was left and before its placement — the queue ran behind a column change');
  w.requestAnimationFrame = raf;
  w.placeCells('x');
  await settle_();
  await until_(() => !t.running().some(r => r.col === 'stuff') && !t.waiting().some(q => q.col === 'stuff'), 5000);
  if (t.running().some(r => r.col === 'stuff')) bad.push('once placed, Settings in front still has Tools widgets running: ' + t.running().filter(r => r.col === 'stuff').map(r => r.id).join(', '));
  if (t.waiting().some(q => q.col === 'stuff')) bad.push('once placed, Settings in front still has Tools widgets queued to start');
  return bad;
});

/* ---------- THE FILMS IN THE VIDEOS CARD: AN ADMIN FINDS THEM, A STUDENT NEVER SEES THEY EXIST § */
const FILMS_ = [
  { id: 'FM001', title: 'Paper Moon Rising', year: '1993', kind: 'film', audience: 'adults', director: '', lead: '',
    seasons: '', url: 'https://drive.google.com/file/d/example-f-001/view', fileKind: 'file', sizeGb: '2.25', placeholder: false, notes: '' },
  { id: 'FM002', title: 'Invented Cartoon', year: '', kind: 'film', audience: 'kids', director: '', lead: '',
    seasons: '', url: 'https://drive.google.com/file/d/example-f-002/view', fileKind: 'file', sizeGb: '1.0', placeholder: false, notes: '' },
  { id: 'FM003', title: 'Pretend Puppets', year: '2001', kind: 'film', audience: 'kids', director: '', lead: '',
    seasons: '', url: 'https://drive.google.com/file/d/example-f-003/view', fileKind: 'file', sizeGb: '2.0', placeholder: false, notes: '' },
  { id: 'FM004', title: 'Example Flat Show', year: '', kind: 'series', audience: 'adults', director: '', lead: '',
    seasons: '3', url: 'https://drive.google.com/drive/folders/example-d-002', fileKind: 'folder', sizeGb: '18.4', placeholder: false, notes: '' },
  { id: 'FM005', title: 'Pretend Science Hour', year: '', kind: 'documentary', audience: '', director: '', lead: '',
    seasons: '', url: 'https://drive.google.com/file/d/example-f-005/view', fileKind: 'file', sizeGb: '0.5', placeholder: false, notes: 'XY9' },
  { id: 'FM006', title: 'Wanted By Name', year: '', kind: 'film', audience: 'adults', director: '', lead: '',
    seasons: '', url: '', fileKind: '', sizeGb: '', placeholder: true, notes: '' },
  { id: 'FM007', title: 'Night Ferry', year: '1987', kind: 'film', audience: 'adults', director: '', lead: '',
    seasons: '', url: 'https://drive.google.com/file/d/example-f-007/view', fileKind: 'file', sizeGb: '0.8', placeholder: false, notes: 'unfinished' },
];
const vidCard_ = async (w, who) => {
  const t = w.__t;
  for (let n = 0; n < 80 && !t; n++) await wait(100);
  if (who) t.USER(who);
  t.go('reel', false, true);
  await wait(LEAVE_MS); await woken_();
  const d = w.document;
  /* THE CARD ITSELF, WAITED FOR — see the first videos journey. */
  for (let n = 0; n < 150 && !d.querySelector('#s-reel #wgt-videos .vid-box .vid-q'); n++) await wait(100);
  const box = d.querySelector('#s-reel #wgt-videos .vid-box');
  const q = box && box.querySelector('input.vid-q');
  const type = v => { q.value = v; q.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const titles = () => [...box.querySelectorAll('.vid-results .vid-list .vid-row .vid-t')].map(e => e.textContent.trim());
  return { t, d, box, q, type, titles };
};
const vidAdmin_ = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin' };

check('the videos card finds an admin’s films by title, year, kids, series and documentaries, plays a film in Drive’s player after a tap, and a placeholder says so', async () => {
  const data = payload();
  data.films = FILMS_;
  data.filmsSync = { at: new Date(Date.now() - 2 * 3600e3).toISOString(), more: false, folder: 'Notflix',
                     found: { films: 4, series: 1, documentaries: 1, placeholders: 1 } };
  const { w, sent } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
  const { t, box, type, titles } = await vidCard_(w, vidAdmin_);
  if (!box) return ['the videos card did not draw on the Reels column'];
  const bad = [];
  /* THE ADMIN TOO OPENS ON THE BAR ALONE (note 321): no list of every film, and no Sync row. */
  const idle = vidIdle_(box);
  if (idle.length) bad.push('an admin’s card opens on more than the search bar: ' + idle.join('; '));
  type('film');
  if (vidFound_(box) !== FILMS_.length) bad.push('"film" finds ' + vidFound_(box) + ' of the admin’s ' + FILMS_.length + ' films');
  if (titles().length !== 4) bad.push('"film" draws ' + titles().length + ' rows — at most four are shown');
  const want = (q, list) => {
    type(q);
    const got = titles();
    if (got.join('|') !== list.join('|')) bad.push('typing "' + q + '" found ' + (got.join(' | ') || 'nothing') + ' — wanted ' + list.join(' | '));
  };
  want('paper moon', ['Paper Moon Rising']);
  want('1993', ['Paper Moon Rising']);
  want('kids', ['Invented Cartoon', 'Pretend Puppets']);
  want('films kids', ['Invented Cartoon', 'Pretend Puppets']);
  want('series', ['Example Flat Show']);
  want('documentaries', ['Pretend Science Hour']);
  want('ferry unfinished', ['Night Ferry']);
  /* AND THE TIE ON A DOOR: four films only by their tags — the two that play here A to Z, then the series
     that opens its folder, then the one not in the Drive yet. */
  want('adults', ['Night Ferry', 'Paper Moon Rising', 'Example Flat Show', 'Wanted By Name']);
  /* ---------- A FILM PLAYS IN THE CARD NOW, IN DRIVE'S OWN PLAYER — AFTER A TAP AND NOT BEFORE § */
  type('paper moon');
  const row = box.querySelector('.vid-results .vid-row');
  if (!row || !row.matches('button[data-do="vid-play"]')) bad.push('a film from the folder is not a row that plays here: ' + (row ? row.outerHTML.slice(0, 140) : 'no row'));
  if (box.querySelector('iframe') || /\/preview/.test(w.document.body.innerHTML)) bad.push('Drive\'s player was in the page before anybody tapped a film');
  /* ITS PICTURE IS STILL DRIVE'S OWN, its file id read from the Drive address the row carries (`drive_id`
     itself is never sent) — and a picture that fails leaves the poster drawn under it. */
  const im = box.querySelector('.vid-results .vid-row .vid-th img.vid-img');
  if (!im || im.getAttribute('src') !== 'https://drive.google.com/thumbnail?id=example-f-001&sz=w320')
    bad.push('a Drive film\'s picture is not Drive\'s thumbnail of its file: ' + (im ? im.getAttribute('src') : 'no <img>'));
  if (!box.querySelector('.vid-results .vid-row .vid-th .vid-poster')) bad.push('a Drive film has no poster under its picture');
  const badge = box.querySelector('.vid-results .vid-row .vid-badge');
  if (!badge || badge.textContent.trim() !== 'Film' || badge.querySelector('.vid-out'))
    bad.push('a film that plays here is badged "' + (badge && badge.textContent.trim()) + '"' + (badge && badge.querySelector('.vid-out') ? ' with an out-arrow, though it does not leave' : ''));
  if ((box.querySelector('.vid-results .vid-row .vid-k') || {}).textContent !== '1993')
    bad.push('a film\'s line is "' + (box.querySelector('.vid-results .vid-row .vid-k') || {}).textContent + '" — wanted its year');
  if (row && row.matches('[data-do="vid-play"]')) {
    t.ACTIONS['vid-play'](row);
    const fr = box.querySelector('.vid-stage iframe.vid-player');
    if (!fr || fr.getAttribute('src') !== 'https://drive.google.com/file/d/example-f-001/preview')
      bad.push('tapping the film did not put Drive\'s player of its file in the card: ' + (fr ? fr.getAttribute('src') : 'no iframe'));
    else {
      const allow = fr.getAttribute('allow') || '';
      if (!/\bautoplay\b/.test(allow) || !/\bfullscreen\b/.test(allow) || !fr.hasAttribute('allowfullscreen'))
        bad.push('Drive\'s player is not allowed autoplay and full screen: allow="' + allow + '"' + (fr.hasAttribute('allowfullscreen') ? '' : ', no allowfullscreen'));
    }
    if (box.querySelector('.vid-results .vid-row')) bad.push('the results are still drawn under the film');
    /* AND THE DOOR IS BESIDE FULL SCREEN, for the file Drive will not play in a frame. */
    const door = box.querySelector('.vid-acts a.tile[href]');
    if (!box.querySelector('.vid-acts .tile[data-do="vid-full"]')) bad.push('a playing film has no Full screen tile');
    if (!door || door.getAttribute('href') !== FILMS_[0].url || door.getAttribute('target') !== '_blank' || !/Open in Drive/.test(door.getAttribute('aria-label') || ''))
      bad.push('a playing film has no Open in Drive tile to its own file: ' + (door ? door.outerHTML.slice(0, 160) : 'none'));
    /* THE ADMIN'S ROW IS NOT UNDER A PLAYER. */
    if ((box.querySelector('.vid-admin') || {}).innerHTML) bad.push('the admin\'s Sync row is drawn under the film');
  }
  /* A SERIES IS ITS FOLDER: it stays a link out, with its seasons said and no picture asked for. */
  type('example flat');
  const ser = box.querySelector('.vid-results .vid-row');
  if (!ser || !ser.matches('a.vid-row.is-out') || ser.getAttribute('href') !== FILMS_[3].url || ser.getAttribute('target') !== '_blank')
    bad.push('a series is not a link out to its folder: ' + (ser ? ser.outerHTML.slice(0, 140) : 'no row'));
  const k = box.querySelector('.vid-results .vid-badge');
  if (!k || !/^Series$/.test(k.textContent.trim()) || !k.querySelector('.vid-out[aria-label="opens in a new tab"]'))
    bad.push('a series is badged "' + (k && k.textContent.trim()) + '" — wanted Series and the named out-arrow');
  if (box.querySelector('.vid-results .vid-th img')) bad.push('a series is a FOLDER and Drive has no picture of one, but its row asks for a thumbnail');
  if (!/3 seasons/.test((box.querySelector('.vid-results .vid-k') || {}).textContent || '')) bad.push('a series\' line does not say how many seasons');
  if (box.querySelector('iframe')) bad.push('a series put a player in the card');
  type('science hour');
  const k2 = box.querySelector('.vid-results .vid-badge');
  if (!k2 || !/^Documentary$/.test(k2.textContent.trim())) bad.push('a documentary is labelled "' + (k2 && k2.textContent.trim()) + '"');
  if (!box.querySelector('.vid-results button.vid-row[data-do="vid-play"]')) bad.push('a documentary in a Drive file is not a row that plays here');
  /* THE PLACEHOLDER: listed, says so, opens nothing. */
  type('wanted');
  const ph = box.querySelector('.vid-results .vid-row');
  if (!ph) bad.push('a film not in the Drive yet is not listed — the card said "Nothing matches that." where Find says "Not in the drive yet"');
  else {
    if (!ph.classList.contains('is-off') || ph.matches('a, button') || !/not in the Drive yet/.test(ph.textContent)) bad.push('the placeholder row is ' + ph.outerHTML.slice(0, 160));
  }
  /* THE ADMIN'S ROW: a silver Sync from Drive tile and when it last ran — at the FOOT of the card, under a
     search's answer: results, or "Nothing matches that.". */
  const tile = box.querySelector('.vid-admin .tile.is-admin[data-do="vid-sync"]');
  if (!tile) bad.push('an admin has no silver Sync from Drive tile under the results');
  const said = (box.querySelector('.vid-admin .vid-synced') || {}).textContent || '';
  if (!/synced from Drive 2 hours ago/.test(said) || !/7 in the folder|6 in the folder/.test(said)) bad.push('the line beside the tile says "' + said + '" — wanted when it last synced and how many are in the folder');
  if (box.lastElementChild !== box.querySelector('.vid-admin')) bad.push('the admin\'s row is not at the foot of the card');
  type('zzzz');
  if (!box.querySelector('.vid-admin [data-do="vid-sync"]') || !/Nothing matches that\./.test(box.textContent)) bad.push('under "Nothing matches that." the admin has no Sync row');
  type('');
  if ((box.querySelector('.vid-admin') || {}).innerHTML) bad.push('the admin\'s Sync row is drawn in the idle bar');
  /* A STAMP TWO HOURS OLD ASKS FOR NOTHING. */
  if (sent.some(b => b.action === 'filmsSync')) bad.push('the card synced on its own with a stamp two hours old');
  return bad;
});

check('the videos card syncs an admin’s films from Drive on its own when never synced, finishes a part-way pass, and the Sync tile refreshes the list', async () => {
  const data = payload();
  data.films = [];
  data.filmsSync = { at: '', more: false, folder: '', found: null };
  let calls = 0;
  let hold = null;
  const now = () => new Date().toISOString();
  const { w, sent } = boot({
    payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined),
    reply: b => {
      if (b.action !== 'filmsSync') return undefined;
      calls++;
      if (calls === 1) return { success: true, more: true, done: false, films: FILMS_.slice(0, 2),
                                sync: { at: '', more: true, folder: 'Notflix' }, message: 'Part-way through Notflix.' };
      if (calls === 2) return { success: true, more: false, done: true, films: FILMS_.slice(0, 4),
                                sync: { at: now(), more: false, folder: 'Notflix', found: { films: 3, series: 1, documentaries: 0, placeholders: 0 } },
                                message: 'Synced from Notflix (found by its name).' };
      if (calls === 3) return new Promise(r => { hold = () => r({ success: true, more: false, done: true, films: FILMS_,
                                sync: { at: now(), more: false, folder: 'Notflix', found: { films: 4, series: 1, documentaries: 1, placeholders: 1 } },
                                message: 'Synced from Notflix (found by its name).' }); });
      return { success: true, done: true, films: FILMS_.slice(0, 1), sync: { at: now(), more: false, folder: 'Notflix' } };
    },
  });
  const { t, box, type, titles } = await vidCard_(w, vidAdmin_);
  if (!box) return ['the videos card did not draw on the Reels column'];
  const bad = [];
  for (let n = 0; n < 40 && calls < 2; n++) await wait(50);
  await wait(50);
  const asks = sent.filter(b => b.action === 'filmsSync');
  if (asks.length !== 2) bad.push('opening the card for an admin who has never synced posted filmsSync ' + asks.length + ' time(s) — wanted once, and once more for the part-way pass');
  if (asks.some(b => b.token !== 'tk-admin')) bad.push('filmsSync went without the admin’s token');
  /* WHAT THE CARD HOLDS IS ASKED BY A SEARCH: it opens on the bar alone (note 321). Every film's kind is
     "film", so the word finds every one the reply carried — the order is the ranking's, so the names are
     compared as a set. */
  type('film');
  const four = FILMS_.slice(0, 4).map(f => f.title).sort().join('|');
  if (vidFound_(box) !== 4 || titles().slice().sort().join('|') !== four) bad.push('after the sync "film" finds ' + titles().join(' | ') + ' — wanted the four the reply carried');
  if (!/synced from Drive just now/.test((box.querySelector('.vid-synced') || {}).textContent || '')) bad.push('the line beside the tile says "' + ((box.querySelector('.vid-synced') || {}).textContent || '') + '" after a sync');
  /* AND FIND STILL HAS NONE. § */
  try {
    const n = w.stuffItemsAll_().filter(x => x.kind === 'film' || /^fm:/.test(String(x.key || ''))).length;
    if (n) bad.push('Find has ' + n + ' film(s) after the sync — films are found in Games → Videos and nowhere in Find');
  } catch (e) { bad.push('could not ask Find for its items: ' + e.message); }
  /* ONCE A VISIT: a repaint of the column does not sync again. */
  t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
  t.findGroup('Games'); await wait(LEAVE_MS); await woken_();
  if (sent.filter(b => b.action === 'filmsSync').length !== 2) bad.push('coming back to the card synced again in the same visit');
  /* THE TILE, BY HAND: busy while it asks, and the list refreshed when it answers. */
  const tile = box.querySelector('.vid-admin [data-do="vid-sync"]');
  if (!tile) return bad.concat(['there is no Sync from Drive tile to press']);
  t.ACTIONS['vid-sync'](tile);
  await wait(20);
  const busy = box.querySelector('.vid-admin [data-do="vid-sync"]');
  if (!busy || !busy.disabled || !busy.classList.contains('is-busy')) bad.push('the tile is not busy while the sync runs: ' + (busy ? busy.outerHTML.slice(0, 120) : 'gone'));
  if (!/Syncing/.test((box.querySelector('.vid-synced') || {}).textContent || '')) bad.push('the line does not say it is syncing');
  t.ACTIONS['vid-sync'](busy);
  await wait(20);
  if (calls !== 3) bad.push('pressing the tile twice while it was busy posted ' + (calls - 2) + ' syncs');
  if (hold) hold();
  await wait(80);
  if (vidFound_(box) !== FILMS_.length) bad.push('after Sync from Drive "film" finds ' + vidFound_(box) + ' — wanted all ' + FILMS_.length + ' the reply carried');
  if (titles().length !== 4) bad.push('after Sync from Drive the card draws ' + titles().length + ' rows — at most four');
  const after = box.querySelector('.vid-admin [data-do="vid-sync"]');
  if (!after || after.disabled) bad.push('the tile stayed busy after the sync answered');
  /* A REPLY FOR SOMEBODY WHO HAS GONE IS DROPPED — through the real Sign out, which takes the films with it: § */
  t.ACTIONS['vid-sync'](after);
  t.ACTIONS.signout(w.document.createElement('button'));
  await wait(80);
  const left = (t.DATA().films || []).length;
  if (left !== 0) bad.push('after a sync pressed and Sign out, DATA holds ' + left + ' film(s) — '
                           + (left === 1 ? 'the late reply was adopted for nobody' : 'the admin’s list stayed on the device'));
  if ('filmsSync' in t.DATA()) bad.push('the sync’s stamp outlived Sign out');
  return bad;
});

check('the videos card says a failed sync in the admin’s line and does not ask again on every return', async () => {
  const data = payload();
  data.films = [];
  data.filmsSync = { at: '', more: false, folder: '', found: null };
  const { w, sent } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined),
    reply: b => (b.action === 'filmsSync' ? { error: 'No folder named Notflix is visible to this script.' } : undefined) });
  const { t, box, type } = await vidCard_(w, vidAdmin_);
  if (!box) return ['the videos card did not draw on the Reels column'];
  const bad = [];
  await wait(120);
  /* THE ADMIN'S ROW IS UNDER A SEARCH'S ANSWER (note 321) — "No videos listed yet.", with no film and no
     clip — so a word is typed for the line to be drawn. */
  type('notflix');
  const line = () => (box.querySelector('.vid-admin .vid-synced') || {}).textContent || '';
  if (sent.filter(b => b.action === 'filmsSync').length !== 1) bad.push('a never-synced admin’s card posted filmsSync ' + sent.filter(b => b.action === 'filmsSync').length + ' time(s), wanted once');
  if (!/Not synced — No folder named Notflix/.test(line())) bad.push('the refusal is not said beside the tile: "' + line() + '"');
  t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
  t.findGroup('Games'); await wait(LEAVE_MS); await woken_();
  await wait(120);
  if (sent.filter(b => b.action === 'filmsSync').length !== 1) bad.push('coming back to the card posted a failing sync again — once a visit, or it is a refusal on every swipe');
  return bad;
});

check('a student’s and a stranger’s videos card has no film, no Sync tile and no word that films exist', async () => {
  const data = payload();
  data.films = [];          // what `doGet` sends anybody who is not an admin — and no `filmsSync` at all
  const { w, sent } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
  const bad = [];
  const look = (who, box) => {
    if (!box) { bad.push(who + ': the videos card did not draw'); return; }
    const idle = vidIdle_(box);
    if (idle.length) bad.push(who + '’s card opens on more than the search bar: ' + idle.join('; '));
    /* AND UNDER A SEARCH'S ANSWER, which is where an admin's Sync row is drawn (note 321) — so the card is
       asked there, and not only in the idle bar where nobody's row is drawn. */
    const q = box.querySelector('input.vid-q');
    if (q) { q.value = 'film'; q.dispatchEvent(new w.Event('input', { bubbles: true })); }
    if (!/No videos listed yet\./.test(box.textContent)) bad.push(who + '’s search over an empty list says "' + box.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) + '"');
    if (box.querySelector('[data-do="vid-sync"]')) bad.push(who + ' is drawn the Sync from Drive tile');
    const adm = box.querySelector('.vid-admin');
    if (adm && adm.innerHTML.trim()) bad.push(who + '’s card has something in the admin row: ' + adm.innerHTML.slice(0, 100));
    if (/film|drive|notflix|sync/i.test(box.textContent)) bad.push(who + '’s card says "' + box.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) + '" — a word that says films exist');
    if (q) { q.value = ''; q.dispatchEvent(new w.Event('input', { bubbles: true })); }
  };
  const { t, box } = await vidCard_(w, { name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk-s' });
  look('a student', box);
  t.ACTIONS['vid-sync'] && t.ACTIONS['vid-sync'](box && box.querySelector('.vid-q'));
  await wait(50);
  t.USER(null);
  t.repaint && t.repaint(true);
  t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
  t.go('reel', false, true); await wait(LEAVE_MS); await woken_();
  look('a stranger', w.document.querySelector('#s-reel #wgt-videos .vid-box'));
  if (sent.some(b => b.action === 'filmsSync')) bad.push('a student’s or a stranger’s phone posted filmsSync');
  const name = String((t.widgetsOf('reel').find(x => String(x.id) === 'videos') || {}).name || '');
  if (/film/i.test(name)) bad.push('the videos card is called "' + name + '" on everybody’s roster');
  return bad;
});

/* ---------- A FILM SHARED WITH YOU ON DRIVE (450): the backend sends it, the card finds it, and only the admin is told who else ---------- */
check('a student sent the one film Drive shares with them finds and plays it with no sharing line, and the admin sees who each film is shared with', async () => {
  const bad = [];
  {
    const data = payload();
    data.films = [FILMS_[1]];
    const { w } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
    const { box, type, titles } = await vidCard_(w, { name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk-s' });
    if (!box) return ['the videos card did not draw for a student'];
    type('cartoon');
    if (titles().join('|') !== 'Invented Cartoon') bad.push('a student shared one film finds ' + (titles().join(' | ') || 'nothing') + ', not Invented Cartoon');
    const row = box.querySelector('.vid-results .vid-row');
    if (!row || !row.matches('button[data-do="vid-play"]')) bad.push('the shared film is not a row that plays here for the student');
    if (box.querySelector('.vid-shared') || /Shared with/.test(box.textContent)) bad.push('a student is told who a film is shared with');
    if (box.querySelector('[data-do="vid-sync"]')) bad.push('a student shared a film is drawn the Sync from Drive tile');
  }
  {
    const data = payload();
    data.films = [Object.assign({}, FILMS_[0], { sharedWith: 'child@example.org, parent@example.org' }),
                  Object.assign({}, FILMS_[1], { sharedWith: '' })];
    const { w } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
    const { box, type } = await vidCard_(w, vidAdmin_);
    if (!box) return bad.concat(['the videos card did not draw for the admin']);
    type('paper moon');
    const one = box.querySelector('.vid-results .vid-row .vid-shared');
    if (!one || one.textContent !== 'Shared with child@example.org, parent@example.org') bad.push('the admin is not told who Paper Moon is shared with: ' + (one ? one.textContent : 'no line'));
    type('cartoon');
    const none = box.querySelector('.vid-results .vid-row .vid-shared');
    if (!none || none.textContent !== 'Shared with nobody') bad.push('the admin is not told a film is shared with nobody: ' + (none ? none.textContent : 'no line'));
  }
  return bad;
});

/* ---------- SIGNING OUT TAKES THE FILMS WITH IT § */
check('signing out takes an admin’s films off the device, and a student signing in after an admin sees none before their payload lands', async () => {
  const stamp = () => ({ at: new Date(Date.now() - 2 * 3600e3).toISOString(), more: false, folder: 'Notflix',
                         found: { films: 4, series: 1, documentaries: 1, placeholders: 1 } });
  const bad = [];
  const filmsIn = w => { try { return w.stuffItemsAll_().filter(x => x.kind === 'film').length; } catch (e) { return -1; } };
  const shown = w => {
    const box = w.document.querySelector('#s-reel #wgt-videos .vid-box');
    const html = w.document.body.innerHTML;
    return { rows: box ? box.querySelectorAll('.vid-list .vid-row').length : -1,
             drive: box ? box.querySelectorAll('.vid-list a[href*="drive.google.com"]').length : -1,
             named: FILMS_.filter(f => html.indexOf(f.title) !== -1).length };
  };
  const away = async t => {
    t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
    t.go('reel', false, true); await wait(LEAVE_MS); await woken_();
  };
  /* ---- THE SIGN OUT TILE ---- */
  {
    const { w } = boot({ payload: Object.assign(payload(), { films: FILMS_, filmsSync: stamp() }),
                         serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
    const { t, box, type } = await vidCard_(w, vidAdmin_);
    if (!box) return ['the videos card did not draw on the Reels column'];
    type('film');
    if (vidFound_(box) !== FILMS_.length)
      return ['the setup: the admin’s card finds ' + vidFound_(box) + ' of ' + FILMS_.length + ' films, so Sign out was NOT checked'];
    if (filmsIn(w) !== 0) bad.push('before Sign out the admin’s Find has ' + filmsIn(w) + ' film(s) — films are not in Find for anybody');
    type('paper moon');
    /* A FILM'S PICTURE THAT FAILED is remembered by its address, and that address is the film's file id. */
    const pic = box.querySelector('.vid-list img.vid-img');
    if (pic) pic.dispatchEvent(new w.Event('error'));
    if (!(t.vidBroken() || []).some(u => /drive\.google\.com/.test(u)))
      bad.push('the setup: a film\'s failed picture was not remembered, so its clearing at Sign out was NOT checked');
    t.ACTIONS.signout(w.document.createElement('button'));
    await wait(50);
    if (t.whoami()) bad.push('Sign out left somebody signed in: ' + JSON.stringify(t.whoami()));
    if ((t.vidBroken() || []).length) bad.push('the failed pictures\' addresses — Drive file ids — outlived Sign out: ' + t.vidBroken().join(' '));
    await away(t);
    const s = shown(w);
    if (s.rows !== 0 || s.drive !== 0) bad.push('after Sign out the videos card lists ' + s.rows + ' row(s), ' + s.drive + ' of them a Drive link');
    if (s.named) bad.push('after Sign out the page still names ' + s.named + ' of the admin’s films');
    if (filmsIn(w) !== 0) bad.push('after Sign out Find still has ' + filmsIn(w) + ' films');
    if ((t.DATA().films || []).length) bad.push('DATA.films still holds ' + t.DATA().films.length + ' after Sign out');
    if ('filmsSync' in t.DATA()) bad.push('DATA.filmsSync — the folder’s name and its counts — outlived Sign out');
    const q = w.document.querySelector('#s-reel #wgt-videos .vid-q');
    if (q && q.value) bad.push('what the admin typed is still in the videos box: ' + JSON.stringify(q.value));
    /* AND A SEARCH AFTER IT FINDS NONE OF THEM — the card opens on the bar alone, so "no rows" above is
       true of an idle card whatever the device still holds; this asks the list itself. */
    if (q) {
      q.value = 'film';
      q.dispatchEvent(new w.Event('input', { bubbles: true }));
      const left = w.document.querySelectorAll('#s-reel #wgt-videos .vid-results .vid-row').length;
      if (left) bad.push('after Sign out, "film" still finds ' + left + ' row(s) on the device');
      q.value = '';
      q.dispatchEvent(new w.Event('input', { bubbles: true }));
    }
  }
  /* ---- A STUDENT SIGNS IN AFTER AN ADMIN, AND THEIR PAYLOAD IS STILL ON ITS WAY ---- */
  {
    let hold = false;
    const { w } = boot({ payload: Object.assign(payload(), { films: FILMS_, filmsSync: stamp() }),
                         serve: u => (/data\/videos\.json/.test(u) ? [] : hold ? new Promise(() => {}) : undefined) });
    const { t, box, type } = await vidCard_(w, vidAdmin_);
    if (box) type('film');
    if (!box || vidFound_(box) !== FILMS_.length) return bad.concat(['the setup: the admin’s card did not find the films, so the hand-over was NOT checked']);
    if (typeof w.signedIn_ !== 'function') return bad.concat(['signedIn_ is not reachable — the hand-over was NOT checked']);
    hold = true;   // the student's payload never lands: what is on the screen is what the device held
    w.signedIn_({ success: true, name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk-s' }, 'sam');
    if ((t.whoami() || {}).personId !== 'P-S1') return bad.concat(['the student did not sign in: ' + JSON.stringify(t.whoami())]);
    await away(t);
    const s = shown(w);
    if (s.rows !== 0 || s.named) bad.push('a student signed in after an admin is shown ' + s.rows + ' row(s) naming ' + s.named + ' of the admin’s films before their own payload lands');
    if (filmsIn(w) !== 0) bad.push('a student signed in after an admin has ' + filmsIn(w) + ' films in Find before their payload lands');
    if ('filmsSync' in t.DATA()) bad.push('a student signed in after an admin holds the admin’s DATA.filmsSync');
  }
  /* A SYNC IN FLIGHT WHEN AN ADMIN SIGNS OUT IS LET GO: § */
  {
    let hold = false, releaseA = null, releaseB = null;
    const done = films => ({ success: true, done: true, more: false, films: films,
                             sync: { at: new Date().toISOString(), more: false, folder: 'Notflix', found: null } });
    const { w, sent } = boot({ payload: Object.assign(payload(), { films: FILMS_, filmsSync: stamp() }),
      serve: u => (/data\/videos\.json/.test(u) ? [] : hold ? new Promise(() => {}) : undefined),
      reply: b => (b.action !== 'filmsSync' ? undefined
        : b.personId === 'P001' ? new Promise(r => { releaseA = () => r(done(FILMS_)); })
        : new Promise(r => { releaseB = () => r(done(FILMS_.slice(0, 1))); })) });
    const { t, box } = await vidCard_(w, vidAdmin_);
    /* THE SYNC ROW IS UNDER A SEARCH'S ANSWER (note 321), so each admin types before looking for it. */
    const typeIn = v => {
      const q = w.document.querySelector('#s-reel #wgt-videos .vid-q');
      if (q) { q.value = v; q.dispatchEvent(new w.Event('input', { bubbles: true })); }
    };
    typeIn('film');
    const tile = () => w.document.querySelector('#s-reel #wgt-videos .vid-admin [data-do="vid-sync"]');
    if (!box || !tile()) return bad.concat(['the setup: the first admin has no Sync tile, so a sync in flight was NOT checked']);
    t.ACTIONS['vid-sync'](tile());
    await wait(20);
    if (!releaseA) return bad.concat(['the setup: pressing Sync posted nothing for the first admin']);
    t.ACTIONS.signout(w.document.createElement('button'));
    hold = true;
    w.signedIn_({ success: true, name: 'Bea Admin', personId: 'P002', role: 'admin', roles: ['admin'], token: 'tk-admin2' }, 'bea');
    await away(t);
    typeIn('film');
    if (!tile()) bad.push('the second admin has no Sync tile');
    else {
      if (tile().disabled) bad.push('the second admin’s Sync tile is busy with the first admin’s sync, which they never pressed');
      t.ACTIONS['vid-sync'](tile());
      await wait(20);
      const theirs = sent.filter(b => b.action === 'filmsSync' && b.token === 'tk-admin2').length;
      if (theirs !== 1) bad.push('pressing the second admin’s Sync tile posted ' + theirs + ' sync(s) for them — wanted one');
      releaseA();
      await wait(50);
      if (!tile() || !tile().disabled) bad.push('the first admin’s late reply marked the second admin’s sync finished');
      if ((t.DATA().films || []).length) bad.push('the first admin’s late reply was adopted for the second: ' + t.DATA().films.length + ' film(s)');
      if (releaseB) releaseB();
      await wait(50);
      if ((t.DATA().films || []).length !== 1) bad.push('the second admin’s own sync was not adopted: ' + (t.DATA().films || []).length + ' film(s)');
    }
  }
  return bad;
});

/* ---------- ONCE A DAY, ON ITS OWN § */
check('the videos card syncs an admin’s films on its own once the last whole pass is over a day old, and not when it is an hour old', async () => {
  const bad = [];
  const visit = async ago => {
    const data = Object.assign(payload(), { films: FILMS_.slice(0, 2),
      filmsSync: { at: new Date(Date.now() - ago).toISOString(), more: false, folder: 'Notflix', found: { films: 2, series: 0, documentaries: 0, placeholders: 0 } } });
    const { w, sent } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined),
      reply: b => (b.action === 'filmsSync' ? { success: true, done: true, more: false, films: FILMS_,
        sync: { at: new Date().toISOString(), more: false, folder: 'Notflix', found: { films: 4, series: 1, documentaries: 1, placeholders: 1 } } } : undefined) });
    const { box, type } = await vidCard_(w, vidAdmin_);
    if (!box) { bad.push('the videos card did not draw on the Reels column'); return null; }
    for (let n = 0; n < 20 && !sent.some(b => b.action === 'filmsSync'); n++) await wait(25);
    await wait(80);
    /* ASKED BY A SEARCH — the card opens on the bar alone (note 321); every film's kind is "film". */
    type('film');
    return { asked: sent.filter(b => b.action === 'filmsSync').length, listed: vidFound_(box) };
  };
  const old = await visit(2 * 24 * 3600e3);
  if (old && old.asked !== 1) bad.push('a card whose last whole pass is two days old posted filmsSync ' + old.asked + ' time(s) — wanted once');
  if (old && old.listed !== FILMS_.length) bad.push('after the day-old card synced "film" finds ' + old.listed + ' — wanted the ' + FILMS_.length + ' the reply carried');
  const fresh = await visit(3600e3);
  if (fresh && fresh.asked !== 0) bad.push('a card synced an hour ago posted filmsSync ' + fresh.asked + ' time(s) — wanted none');
  return bad;
});

/* ---------- A SPACE TYPED INTO A SEARCH BOX IS A SPACE, AFTER THE GAMES COLUMN HAS BEEN OPENED § */
check('a Space typed into the videos search box is not eaten by Flappy Bird, and still flaps everywhere else', async () => {
  const { w } = boot({ serve: u => (/data\/videos\.json/.test(u) ? [] : undefined), before: win => { signedInAs_(MEMBER_)(win);
    const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => ({ width: 10 })), set: (o, k, v) => { o[k] = v; return true; } });
    win.HTMLCanvasElement.prototype.getContext = function () { return ctx; };
    const r0 = win.HTMLElement.prototype.getBoundingClientRect;
    win.HTMLCanvasElement.prototype.getBoundingClientRect = function () {
      return { width: 300, height: 200, left: 0, top: 0, right: 300, bottom: 200, x: 0, y: 0 };
    };
    void r0;
  } });
  const { box, q } = await vidCard_(w);
  const d = w.document;
  if (!box || !q) return ['the videos card did not draw'];
  /* FLABBY PIRD IS A CHOICE ON THE CONSOLE (441), a Find card since 790. */
  w.__t.findGroup('Games', 'console'); await wait(LEAVE_MS); await woken_();
  const csp = d.querySelector('#s-stuff #cs-pick');
  if (csp && csp.value !== 'flabby') { csp.value = 'flabby'; w.__t.ACTIONS['cs-pick'](csp); }
  const flappy = d.getElementById('flappy-canvas');
  if (!flappy) return ['there is no Flappy Bird canvas on the Games column, so this asked nothing'];
  try { w.initFlappy(); } catch (e) { return ['Flappy Bird could not set itself up here: ' + e.message]; }
  if (typeof w._flappyKey !== 'function') return ['Flappy Bird’s key handler was never installed, so this asked nothing'];
  const press = (el, code) => {
    const e = new w.KeyboardEvent('keydown', { code: code, key: code === 'Space' ? ' ' : code, bubbles: true, cancelable: true });
    el.dispatchEvent(e);
    return e.defaultPrevented;
  };
  const bad = [];
  q.focus();
  if (press(q, 'Space')) bad.push('a Space typed into the videos search box was swallowed — "two words" becomes "twowords"');
  if (press(q, 'ArrowUp')) bad.push('an ArrowUp in the search box was swallowed');
  if (!press(d.body, 'Space')) bad.push('a Space outside any box no longer flaps — the fix took the game’s key away');
  return bad;
});

/* AN ADMIN, signed in, for the journeys that ask what an admin is shown. */
const RACE_ADMIN_ = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin', handle: 'annadmin' };

