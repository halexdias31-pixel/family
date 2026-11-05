/* THE PAYLOAD'S LANDING EMPTIES EVERY COLUMN AND DRAWS IT AGAIN (`load`), so a widget that started beside the column in front before it landed — drawing the one § */
check('a widget beside the column in front that waits for the payload is drawn when it lands, without going there', async () => {
  let release = null;
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 't' };
  /* THE WRITTEN COLUMN ORDER, NOT THE SHEET'S: the payload is what carries the sheet's, and it is held. In
     the written order Tools sits beside Find. */
  const { w } = wideBoot_({ payload: payload(),
    serve: u => (u.indexOf('script.google.com') === -1 ? undefined : new Promise(r => { release = () => r(payload()); })),
    before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(admin)); } catch (e) {} } });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  await wait(300);
  t.findGroupOn('res', 'Tools', 'flyers');   /* Find 2 showing Tools stands beside Find as Tools did (790) */
  t.go('stuff', false, true);
  await settle_();
  const bad = [];
  if (!release) return ['the payload was never asked for, so nothing was held'];
  if (t.glass().cols.indexOf('res') === -1) return ['with Find in front and the payload held the glass is ' + JSON.stringify(t.glass().cols) + ' — Tools is not beside it, so nothing was asked'];
  const card = () => w.document.querySelector('#s-res #wgt-flyers');
  if (!card()) return ['an admin\'s Tools has no flyer maker, so nothing was asked'];
  await until_(() => t.running().some(r => r.id === 'flyers' && r.col === 'res'));
  if (!t.running().some(r => r.id === 'flyers' && r.col === 'res')) return ['the flyer maker beside Find was never started, so its wait for the payload was not asked'];
  if (!card().querySelector('.loading')) return ['the flyer maker beside Find shows no loader with the payload held, so nothing was waiting'];
  if (card().getAttribute('aria-busy') === 'true') bad.push('the flyer maker still holds the "not started" veil after it started');
  const was = card();
  /* AND NEVER BARE ON THE WAY. § */
  let bare = 0;
  const look = () => { const sl = card(); if (sl && sl !== was && !sl.getAttribute('aria-busy') && !t.running().some(r => r.slot === sl)) bare++; };
  const mo = new w.MutationObserver(look);
  mo.observe(w.document.getElementById('s-res'), { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-busy'] });
  release();
  /* WAITED FOR UNTIL IT IS DRAWN, NOT UNTIL `quiet()`: the after-slide jobs run one per task from a
     list `afterSlide_` has already emptied, so `quiet()` says yes while the restart is still in it. */
  await until_(() => card() && card() !== was && !!card().querySelector('#fm-wrap .widget-squeeze'));
  await woken_();
  mo.disconnect();
  if (bare) bad.push('the payload landed and the new flyer maker beside Find was shown without its veil and with nothing running in it, ' + bare + ' time(s) — markup nobody had started, unveiled because the one in the thrown-away markup still counted as running');
  if (card() === was) bad.push('the payload landed and Tools was not drawn again, so starting the new markup was not asked');
  if (card() && card().getAttribute('aria-busy') === 'true') bad.push('the payload landed, Tools was drawn again beside Find, and the new flyer maker sits under the "not started" veil — only going to Tools would have started it');
  else if (card() && card().querySelector('.loading')) bad.push('the payload landed and the flyer maker beside Find still shows the loader');
  /* AND DRAWN, NOT ONLY UNVEILED: § */
  if (card() && !card().querySelector('#fm-wrap .widget-squeeze')) bad.push('the payload landed and the new flyer maker beside Find was never started — its box is the empty markup');
  if (t.running().filter(r => r.id === 'flyers').length !== 1) bad.push('after the payload the flyer maker is running ' + t.running().filter(r => r.id === 'flyers').length + ' time(s), not once');
  if (t.AT() !== 'stuff') bad.push('the column in front moved to ' + t.AT());
  return bad;
});

/* ---------- A REPAINT AND THEN AN ARRIVAL KEEP THE WIDGET RUNNING BESIDE YOU § */
check('a repaint and then an arrival keep the widget running beside the column in front: the same slot, never the loader, the sum still in it', async () => {
  const { w } = wideBoot_();
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  await wait(300);
  t.findGroupOn('res', 'Tools');   /* Find 2 showing Tools stands beside Find as Tools did (790) */
  t.go('stuff', false, true);
  await settle_();
  const d = w.document;
  const slot = () => d.querySelector('#s-res #wgt-calculator');
  const shown = () => { const el = d.querySelector('#s-res #wgt-calculator #mc-display'); return el ? el.textContent : null; };
  await until_(() => t.running().some(r => r.id === 'calculator' && r.col === 'res') && slot() && !slot().getAttribute('aria-busy'));
  if (!t.running().some(r => r.id === 'calculator' && r.col === 'res')) return ['the calculator beside Find never started, so nothing was asked'];
  if (typeof w._mcClick !== 'function') return ['the calculator set no `_mcClick`, so nothing could be typed into it'];
  ['7', '+', '5'].forEach(k => w._mcClick(k));
  if (shown() !== '7+5') return ['typed 7+5 into the calculator beside Find and it reads ' + JSON.stringify(shown()) + ', so nothing was asked'];
  const calc = t.widgetsOf('tool').find(x => String(x.id) === 'calculator');
  let starts = 0;
  const realStart = calc.start;
  calc.start = function () { starts++; return realStart.apply(this, arguments); };
  const was = slot();
  const star = () => { const sl = slot(); const c = sl && sl.closest('.card'); return c && c.querySelector('.wgt-keep'); };
  const starWas = star();
  /* EVERY CHANGE TO THE COLUMN, ASKED: is the calculator's slot there and without the loader? */
  let veiled = 0;
  const look = () => { const sl = slot(); if (!sl || sl.getAttribute('aria-busy') === 'true' || sl.querySelector(':scope > .loading')) veiled++; };
  const mo = new w.MutationObserver(look);
  mo.observe(d.getElementById('s-res'), { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-busy'] });
  const bad = [];
  t.repaint();
  if (!t.stale('res')) bad.push('the repaint did not leave Tools stale, so its first arrival did not draw it again and nothing was asked');
  await wait(300);
  t.go('res', false, true);
  await settle_();
  await until_(() => t.AT() === 'res' && t.quiet());
  look();
  mo.disconnect();
  calc.start = realStart;
  if (t.stale('res')) bad.push('Tools is still stale after arriving at it — the column was not drawn again, so keeping the slot through a paint was not asked');
  else if (star() === starWas) bad.push('the calculator\'s star is the element it was before the arrival — the column was not drawn again, so keeping the slot through a paint was not asked');
  if (slot() !== was) bad.push('arriving at Tools after a repaint threw away the slot the calculator was running in and drew a new one');
  if (veiled) bad.push('between the repaint and arriving at Tools the calculator\'s slot was gone or held the loader ' + veiled + ' time(s): drawn, the dots, drawn');
  if (shown() !== '7+5') bad.push('the sum typed beside Find reads ' + JSON.stringify(shown()) + ' once Tools is in front — the calculator was started again from nothing');
  if (starts) bad.push('arriving at Tools started the calculator ' + starts + ' time(s) more, though it was running on Tools\' own copy');
  const on = t.running().filter(r => r.id === 'calculator');
  if (on.length !== 1 || on[0].col !== 'res') bad.push('with Tools in front the calculator runs ' + JSON.stringify(on.map(r => r.col)) + ', not once on Tools');
  return bad;
});

/* ---------- AND NOT FOR THE PERSON WHO HAS GONE § */
check('a change of person stops what its column no longer draws beside the column in front, and nothing runs on for the last person', async () => {
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 't-ann' };
  const { w } = wideBoot_({ before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(admin)); } catch (e) {} } });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  await wait(300);
  t.findGroupOn('res', 'Tools', 'flyers');   /* Find 2 showing Tools stands beside Find as Tools did (790) */
  t.go('stuff', false, true);
  await settle_();
  /* THE STUDENT SIGNED IN, FIND IS FOR MEMBERS (400), so since 790 the change of person asked is to a student; the typing tutor is the card beside the flyer maker. */
  const kid = { name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 't-s' };
  const runs = id => t.running().find(r => r.id === id && r.col === 'res');
  await until_(() => runs('typing') && runs('flyers'));
  if (!runs('flyers') || !runs('typing')) return ['with the admin signed in, the typing tutor and the flyer maker are not both running beside Find (' + JSON.stringify(t.running().map(r => r.id + '@' + r.col)) + '), so nothing was asked'];
  if (runs('typing').who !== 'P001') return ['the typing tutor beside Find says it was started for ' + JSON.stringify(runs('typing').who) + ', not for the admin, so nothing was asked'];
  const bad = [];
  if (typeof w.signedOut_ !== 'function' || typeof w.signedIn_ !== 'function') return ['signedOut_ / signedIn_ are not globals, so a change of person was NOT asked'];
  /* THE STUDENT SIGNED IN WITH BOOK IN FRONT, and nobody goes anywhere. */
  try { w.signedIn_(Object.assign({}, kid)); } catch (e) { return ['signedOut_ threw: ' + e.message]; }
  await settle_();
  await until_(() => !runs('flyers') && runs('typing') && runs('typing').who === 'P-S1');
  if (!t.stale('res')) bad.push('the sign-out did not leave Tools stale, so nothing beside Find was running in markup it would not draw now');
  if (runs('flyers')) bad.push('the student signed in with Find in front, the admin\'s flyer maker went on running on Tools beside it — a student\'s Tools does not draw it');
  if (!runs('typing')) bad.push('the student signed in with Find in front, the typing tutor on Tools beside it stopped and was not started again');
  else if (runs('typing').who !== 'P-S1') bad.push('the student signed in with Find in front, the typing tutor beside it is still the one started for ' + JSON.stringify(runs('typing').who));
  /* SIGNED IN AGAIN, then out and STRAIGHT to Tools — before anything beside Find has been started
     again — so the arrival's paint meets a slot started for the admin. It must not carry it. */
  try { w.signedIn_(Object.assign({}, admin)); } catch (e) { return bad.concat(['signedIn_ threw: ' + e.message]); }
  await settle_();
  await until_(() => runs('typing') && runs('typing').who === 'P001');
  if (!runs('typing') || runs('typing').who !== 'P001') return bad.concat(['signed in again, the typing tutor beside Find was not started for the admin (' + JSON.stringify(runs('typing') && runs('typing').who) + '), so carrying a slot across a change of person was not asked']);
  const adminSlot = runs('typing').slot;
  try { w.signedIn_(Object.assign({}, kid)); t.go('res', false, true); } catch (e) { return bad.concat(['signing out and going to Tools threw: ' + e.message]); }
  const now = w.document.querySelector('#s-res #wgt-typing');
  if (now === adminSlot) bad.push('the student signed in and straight to Tools, the new Tools markup holds the typing tutor slot that was started for the admin — carried across a change of person');
  await settle_();
  /* THE STUDENT'S LIST HAS NO FLYER MAKER, so the page in front is turned to the typing tutor's card. */
  t.findGroupOn('res', 'Tools', 'typing');
  await settle_();
  await until_(() => t.AT() === 'res' && runs('typing') && runs('typing').who === 'P-S1' && t.quiet());
  if (!runs('typing')) bad.push('the student signed in and at Tools, the typing tutor is not running');
  else if (runs('typing').who !== 'P-S1') bad.push('the student signed in and at Tools, the typing tutor in front is the one started for ' + JSON.stringify(runs('typing').who) + ' — nothing started it again for the student');
  if (runs('flyers')) bad.push('the student signed in and at Tools, the admin\'s flyer maker is running');
  return bad;
});

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

/* ---------- BOARD GAMES: CONNECT 4, OTHELLO AND SCRABBLE ARE ONE WIDGET WITH A PICKER (414) */
check('the board games are one widget: five games in its picker (461 added Chess and Maze), each drawing only its own board, the choice remembered', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  const bad = [];
  const ids = t.allWidgets().map(x => String(x.id));
  ['connect4', 'othello', 'scrabble', 'chess', 'maze'].forEach(id => { if (ids.indexOf(id) !== -1) bad.push(id + ' is still a widget of its own'); });
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'boardgames');
  if (at < 0) return bad.concat(['there is no Board games widget on the Games column']);
  t.findPage(at, true);
  await woken_();
  const pick = d.querySelector('#s-stuff #bg-pick');
  if (!pick) return bad.concat(['the Board games widget has no picker']);
  const opts = [...pick.options].map(o => o.textContent.trim());
  if (opts.join('|') !== 'Connect 4|Othello|Scrabble|Chess|Maze') bad.push('the picker offers ' + JSON.stringify(opts));
  const boards = { c4: '#c4-board', oth: '#oth-board', scr: '#scr-board', chess: '#chess-board', maze: '#maze-grid' };
  for (const k of Object.keys(boards)) {
    pick.value = k; t.ACTIONS['bg-pick'](pick);
    await wait(50);
    const here = Object.keys(boards).filter(b => d.querySelector('#s-stuff ' + boards[b]));
    if (here.join() !== k) bad.push('choosing ' + k + ' drew ' + JSON.stringify(here));
    let kept = ''; try { kept = w.localStorage.getItem('bg-game'); } catch (e) {}
    if (kept !== k) bad.push('choosing ' + k + ' remembered ' + JSON.stringify(kept));
  }
  if (!d.querySelector('#s-stuff #wgt-boardgames h3') || d.querySelector('#s-stuff #wgt-boardgames h3').textContent.trim() !== 'Board games') bad.push('the widget is not headed Board games');
  return bad;
});

/* ---------- ONE PADLOCK FOR EVERY GAME, AND IT HOLDS (461) */
check('every game widget has the one padlock (461); locked, no drag, flick, two fingers, touchmove, wheel or arrow key moves the column or the page, on the console, Board games and Word games; leaving lets go', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS;
  const bad = [];
  if (!A['game-lock'] || !t.padlock) return ['there is no game-lock handler or PADLOCK is not reachable'];
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const games = t.widgetsOf('game');
  games.forEach(g => {
    const card = d.querySelector('#s-stuff #wgt-' + g.id);
    const n = card ? card.closest('.is-widget').querySelectorAll('.game-lock').length : 0;
    if (n !== 1) bad.push(g.id + ' has ' + n + ' padlock tiles, not one');
  });
  if (d.querySelector('[data-do="nes-lock"], [data-do="nes-full"]')) bad.push('the console still draws its own Lock or Full screen tile');
  const ptr = (type, el, x, y, id, prim) => {
    const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1 });
    Object.defineProperty(e, 'pointerId', { value: id }); Object.defineProperty(e, 'isPrimary', { value: prim });
    Object.defineProperty(e, 'pointerType', { value: 'touch' });
    el.dispatchEvent(e);
  };
  const drag = (el, x0, y0, x1, y1, steps, id = 1, prim = true) => {
    ptr('pointerdown', el, x0, y0, id, prim);
    for (let i = 1; i <= steps; i++) ptr('pointermove', el, x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps, id, prim);
    ptr('pointerup', el, x1, y1, id, prim);
  };
  const ev = (el, e) => { el.dispatchEvent(e); return e.defaultPrevented; };
  for (const id of ['console', 'boardgames', 'wordgames']) {
    const at = games.findIndex(x => String(x.id) === id);
    if (at < 0) { bad.push('there is no ' + id + ' on the Games column'); continue; }
    t.findPage(at, true);
    await wait(80); await woken_();
    const card = d.querySelector('#s-stuff #wgt-' + id).closest('.is-widget');
    A['game-lock'](card.querySelector('.game-lock'));
    const tile = card.querySelector('.game-lock');
    if (!t.padlock().game || t.padlock().game.split('@')[0] !== id) { bad.push(id + ': the padlock did not lock'); continue; }
    if (tile.getAttribute('aria-pressed') !== 'true' || !tile.classList.contains('on') || !card.classList.contains('is-locked')) bad.push(id + ': locked, the tile or the card does not show it');
    if (!d.documentElement.classList.contains('padlocked')) bad.push(id + ': locked, the page is not marked to hold every pan');
    const game = card.querySelector('#nes-pad, #bg-slot, #wg-slot, .widget-slot') || card;
    const where = () => t.screenAt() + ':' + t.PAGE().stuff;
    const here = where();
    const moves = [
      ['a drag on the game', () => drag(game, 300, 300, 40, 300, 12)],
      ['a swipe across the card', () => drag(card, 360, 200, 20, 200, 12)],
      ['a swipe outside the card', () => drag(d.body, 360, 20, 20, 20, 12)],
      ['a swipe up', () => drag(card, 200, 600, 200, 100, 12)],
      ['a fast flick', () => drag(card, 300, 300, 60, 300, 2)],
      ['a two-finger swipe', () => { ptr('pointerdown', card, 300, 300, 1, true); ptr('pointerdown', card, 300, 360, 2, false);
        for (let i = 1; i <= 8; i++) { ptr('pointermove', card, 300 - 30 * i, 300, 1, true); ptr('pointermove', card, 300 - 30 * i, 360, 2, false); }
        ptr('pointerup', card, 60, 360, 2, false); ptr('pointerup', card, 60, 300, 1, true); }],
    ];
    for (const [say, fn] of moves) { fn(); await wait(30); if (where() !== here) { bad.push(id + ': locked, ' + say + ' moved the column to ' + where()); t.findGroup('Games'); t.findPage(at, true); } }
    if (!ev(game, new w.Event('touchmove', { bubbles: true, cancelable: true }))) bad.push(id + ': locked, a touchmove was left to pan the page');
    const wh = new w.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 300 });
    if (!ev(card, wh)) bad.push(id + ': locked, a wheel was left to scroll the page');
    if (!ev(card, new w.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 400 }))) bad.push(id + ': locked, a vertical wheel was left to scroll the page');
    await wait(30);
    for (const k of ['ArrowRight', 'ArrowDown']) {
      const e = new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
      if (!ev(d.body, e)) bad.push(id + ': locked, ' + k + ' was left to scroll the page');
    }
    await wait(30);
    if (where() !== here) bad.push(id + ': locked, a wheel or an arrow key moved the column to ' + where());
    if (!t.padlock().game) bad.push(id + ': the lock was lost during the gestures');
    /* AND IT LETS GO WHEN THE PERSON LEAVES: another page of the column, then a tab. */
    t.findPage(at ? at - 1 : at + 1, true);
    await wait(80);
    if (t.padlock().game) bad.push(id + ': another page of the column left the padlock on');
    if (d.documentElement.classList.contains('padlocked')) bad.push(id + ': let go, the page still holds every pan');
    if (ev(d.body, new w.Event('touchmove', { bubbles: true, cancelable: true }))) bad.push(id + ': let go, a touchmove is still refused');
    t.findPage(at, true);
    await wait(80);
  }
  /* A TAB AND A HIDDEN APP LET GO TOO. */
  const card = d.querySelector('#s-stuff #wgt-console').closest('.is-widget');
  t.findPage(games.findIndex(x => x.id === 'console'), true); await wait(80);
  A['game-lock'](card.querySelector('.game-lock'));
  t.go('booking', false, true); await wait(LEAVE_MS);
  if (t.padlock().game) bad.push('a tab to another column left the game padlock on');
  t.findGroup('Games'); await wait(LEAVE_MS);
  t.findPage(games.findIndex(x => x.id === 'console'), true); await wait(80);
  A['game-lock'](d.querySelector('#s-stuff #wgt-console').closest('.is-widget').querySelector('.game-lock'));
  Object.defineProperty(d, 'hidden', { value: true, configurable: true });
  d.dispatchEvent(new w.Event('visibilitychange'));
  delete d.hidden;
  if (t.padlock().game) bad.push('the app hidden left the game padlock on');
  return bad;
});

/* ---------- CHESS AND MAZE ARE BOARD GAMES, THE SPRINT A WORD & NUMBER GAME (461) */
check('chess and the maze are board games and the times tables sprint a word & number game (461): no cards of their own, old stars land on the merged widget with that game chosen, the sprint keeps its high scores', async () => {
  const { w } = boot({ member: true, before: x => { signedInAs_(MEMBER_)(x); try { x.localStorage.setItem('favs', JSON.stringify(['w:chess', 'w:tables'])); } catch (e) {} } });
  await wait(300);
  const t = w.__t, d = w.document;
  const bad = [];
  const ids = t.allWidgets().map(x => String(x.id));
  ['chess', 'maze', 'tables'].forEach(id => { if (ids.indexOf(id) !== -1) bad.push(id + ' is still a widget of its own'); });
  const ls = k => { try { return w.localStorage.getItem(k); } catch (e) { return null; } };
  if (!t.isFav('w:boardgames') || t.isFav('w:chess')) bad.push('a star on Chess did not move to Board games');
  if (!t.isFav('w:wordgames') || t.isFav('w:tables')) bad.push('a star on the sprint did not move to Word & number games');
  if (ls('bg-game') !== 'chess') bad.push('the chess star did not choose Chess: ' + ls('bg-game'));
  if (ls('wg-game') !== 'tt') bad.push('the sprint star did not choose the sprint: ' + ls('wg-game'));
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const wg = t.widgetsOf('game').findIndex(x => String(x.id) === 'wordgames');
  t.findPage(wg, true);
  await woken_();
  const h = d.querySelector('#s-stuff #wgt-wordgames h3');
  if (!h || h.textContent.trim() !== 'Word & number games') bad.push('the widget is headed ' + JSON.stringify(h && h.textContent));
  const opts = [...(d.querySelector('#s-stuff #wg-pick') || { options: [] }).options].map(o => o.textContent.trim());
  if (opts.indexOf('Times Tables Sprint') < 0) bad.push('Word & number games does not offer the sprint: ' + JSON.stringify(opts));
  if (!d.querySelector('#s-stuff #wg-slot #tt-play') || !d.querySelector('#s-stuff #wg-slot #tt-board')) bad.push('the sprint is not drawn with its Start and its high scores');
  const bg = t.widgetsOf('game').findIndex(x => String(x.id) === 'boardgames');
  t.findPage(bg, true);
  await woken_(); await wait(50);
  if (d.querySelectorAll('#s-stuff #bg-slot #chess-board .chess-sq').length !== 64) bad.push('Chess in Board games did not draw its 64 squares');
  if (!d.querySelector('#s-stuff #bg-slot .chess-ctl [data-do="chess-undo"]')) bad.push('Chess in Board games lost its Undo, turn and New game tiles');
  return bad;
});

/* ---------- ONE CONSOLE FOR EVERY GAME, AND WORD SEARCH AND SCRAMBLE IN WORD GAMES (441) */
check('the console is one widget for every game (441): game files, Flabby Pird and the racer in its picker, each in its own body, remembered; Word Search and Sentence Scramble are Word games; old stars land on the merged widget with that game chosen', async () => {
  const { w } = boot({ member: true, before: x => { signedInAs_(MEMBER_)(x); try { x.localStorage.setItem('favs', JSON.stringify(['w:racer', 'w:scramble'])); } catch (e) {} } });
  await wait(300);
  const t = w.__t, d = w.document;
  const bad = [];
  const ids = t.allWidgets().map(x => String(x.id));
  ['flabby', 'racer', 'wordsearch', 'scramble'].forEach(id => { if (ids.indexOf(id) !== -1) bad.push(id + ' is still a widget of its own'); });
  let ls = k => { try { return w.localStorage.getItem(k); } catch (e) { return null; } };
  if (!t.isFav('w:console') || t.isFav('w:racer')) bad.push('a star on the racer did not move to the Console');
  if (!t.isFav('w:wordgames') || t.isFav('w:scramble')) bad.push('a star on Sentence Scramble did not move to Word games');
  if (ls('cs-game') !== 'racer') bad.push('the racer star did not choose the racer on the Console: ' + ls('cs-game'));
  if (ls('wg-game') !== 'ss') bad.push('the scramble star did not choose Sentence Scramble: ' + ls('wg-game'));
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'console');
  if (at < 0) return bad.concat(['there is no Console on the Games column']);
  t.findPage(at, true);
  await woken_();
  const pick = d.querySelector('#s-stuff #cs-pick');
  if (!pick) return bad.concat(['the Console has no picker']);
  const opts = [...pick.options].map(o => o.textContent.trim());
  if (opts.join('|') !== 'Game files|Flabby Pird|Colliers Wood racer|Linked pictures|I can guess') bad.push('the picker offers ' + JSON.stringify(opts));
  const bodies = { file: '#nes-box', flabby: '.cs-hand #flappy-canvas', racer: '.cs-wide #race-box' };
  for (const k of ['flabby', 'racer', 'file']) {
    pick.value = k; t.ACTIONS['cs-pick'](pick);
    await wait(50);
    const here = Object.keys(bodies).filter(b => d.querySelector('#s-stuff ' + bodies[b]));
    if (here.join() !== k) bad.push('choosing ' + k + ' drew ' + JSON.stringify(here));
    if (ls('cs-game') !== k) bad.push('choosing ' + k + ' remembered ' + JSON.stringify(ls('cs-game')));
  }
  const wg = d.querySelector('#s-stuff #wg-pick');
  const wopts = wg ? [...wg.options].map(o => o.textContent.trim()) : [];
  ['Word Search', 'Sentence Scramble'].forEach(n => { if (wopts.indexOf(n) === -1) bad.push('Word games does not offer ' + n); });
  if (wg) for (const [k, sel] of [['ws', '#ws-grid'], ['ss', '#ss-box']]) {
    wg.value = k; t.ACTIONS['wg-pick'](wg);
    await wait(50);
    if (!d.querySelector('#s-stuff #wg-slot ' + sel)) bad.push('choosing ' + k + ' in Word games drew no ' + sel);
  }
  return bad;
});

/* ---------- THE CONSOLE ON A LAPTOP (419): keys per system, a key list, nothing scrolled, and the app held still while it plays */
check('console keys: arrows and WASD steer, Z/X/Space/Enter/Shift and Q/E per system, a Keys tile shows the list, the page does not scroll, and the rest of the app holds still while a game plays; each system is its own console, its drawn buttons named as the list names them and lit by the keys, the DS hinged over its gap', async () => {
  const { w } = boot({ member: true });
  await wait(300);
  const t = w.__t, d = w.document, ev = s => t.inApp(s);
  const bad = [];
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'console');
  if (at < 0) return ['there is no Console widget on the Games column'];
  t.findPage(at, true);
  await woken_();
  if (!d.querySelector('#s-stuff #nes-wrap')) return ['the console was not drawn'];
  /* A FINE POINTER STARTS ON KEYS: the list is shown and the touch pad is not, before any game. */
  if (ev('NES_.mode') !== 'keys') bad.push('a mouse-and-keyboard device started in ' + ev('NES_.mode') + ' mode');
  if (!d.querySelector('#nes-legend').hidden) bad.push('the key list shows before its Keys tile asked (478)');
  if (d.querySelector('#nes-pad').classList.contains('on')) bad.push('the touch pad shows on a keyboard device');
  const acts = [...d.querySelectorAll('#nes-tiles [data-do]')].map(b => b.getAttribute('data-do'));
  if (acts.join() !== 'nes-play,nes-pick,nes-forget,nes-keys') bad.push('on keys the tiles are ' + JSON.stringify(acts));
  const forget = d.querySelector('#nes-tiles [data-do="nes-forget"]');
  if (!forget || !forget.disabled) bad.push('Forget file is not greyed with nothing kept');
  /* THE MAP, system by system. */
  const want = {
    nes: { ArrowUp: 'up', KeyW: 'up', KeyA: 'left', KeyS: 'down', KeyD: 'right', KeyZ: 'b', KeyX: 'a', Space: 'a', Enter: 'start', ShiftLeft: 'select', KeyQ: null },
    gb: { KeyZ: 'b', KeyX: 'a', KeyE: null }, gba: { KeyQ: 'l', KeyE: 'r', KeyC: null },
    snes: { KeyQ: 'l', KeyE: 'r', KeyC: 'y', KeyV: 'x', KeyJ: 'y', KeyI: 'x', KeyK: 'b', KeyL: 'a', ArrowRight: 'right' },
    nds: { KeyQ: 'l', KeyE: 'r', KeyC: 'y', KeyV: 'x', ShiftRight: 'select', KeyW: 'up' },
    n64: { KeyX: 'b', KeyZ: 'y', KeyC: 'l2', KeyI: 'cu', KeyL: 'cr', Enter: 'start', KeyW: 'up', ShiftLeft: 'l2' } };
  Object.keys(want).forEach(sys => Object.keys(want[sys]).forEach(code => {
    const got = ev('nesKeyFor_(' + JSON.stringify({ code }) + ', ' + JSON.stringify(sys) + ')');
    if (got !== want[sys][code]) bad.push(sys + ': ' + code + ' gives ' + JSON.stringify(got) + ', not ' + JSON.stringify(want[sys][code]));
  }));
  if (ev('nesKeyFor_({ key: "z" }, "nes")') !== 'b') bad.push('a browser with no e.code: "z" is not B');
  const say = sys => ev('nesKeyRows_(' + JSON.stringify(sys) + ').map(r => r[0] + ":" + r[1].join("/")).join(" ")');
  if (say('nes') !== 'Move:↑ ↓ ← →/W A S D A:X/L/Space B:Z/K Start:Enter Select:Shift') bad.push('the NES key list says ' + say('nes'));
  if (!/L:Q R:E/.test(say('nds')) || !/Y:C\/J/.test(say('nds'))) bad.push('the DS key list says ' + say('nds'));
  if (/Select/.test(say('n64')) || !/Z:C\/Shift/.test(say('n64')) || !/C↑:I/.test(say('n64'))) bad.push('the N64 key list says ' + say('n64'));
  /* EACH SYSTEM ITS OWN CONSOLE (437): the body says which, the buttons drawn beside the screen and the touch pad are named as the key list names them, and the DS's hinge sits over its gap. */
  const names = sel => [...d.querySelectorAll(sel + ' [data-k]')].filter(e => e.dataset.k !== 'dpad').map(e => e.textContent.trim()).sort().join(' ');
  ['nes', 'snes', 'gb', 'gbc', 'gba', 'n64', 'nds'].forEach(sys => {
    ev('nesSysSet_(' + JSON.stringify(sys) + ')');
    if (d.querySelector('#nes-wrap').dataset.sys !== sys) bad.push(sys + ': the console body does not say ' + sys);
    const listed = ev('nesKeyRows_(' + JSON.stringify(sys) + ').slice(1).map(r => r[0]).sort().join(" ")');
    if (names('#nes-deco') !== listed) bad.push(sys + ': the drawn buttons are "' + names('#nes-deco') + '", the key list "' + listed + '"');
    if (names('#nes-pad') !== listed) bad.push(sys + ': the touch pad is "' + names('#nes-pad') + '", the key list "' + listed + '"');
    if (d.querySelector('#nes-deco button')) bad.push(sys + ': a drawn button is a real button, there to be pressed');
  });
  const dsH = ev('NES_DIMS.nds[1]'), gap = ev('NES_GAP'), hinge = d.querySelector('#nes-hinge');
  if (dsH !== 384 + gap || !(gap > 0)) bad.push('the DS picture is ' + dsH + ' rows for a gap of ' + gap + ', not its two 192-row screens and the gap');
  if (!hinge || Math.abs(parseFloat(hinge.style.top) - 19200 / dsH) > 0.01 || Math.abs(parseFloat(hinge.style.height) - 100 * gap / dsH) > 0.01) bad.push('the DS hinge is at ' + (hinge && hinge.style.top) + ' / ' + (hinge && hinge.style.height) + ', not over the rows between the screens');
  ev('nesSysSet_("nes")');
  if (hinge && parseFloat(hinge.style.height) !== 0) bad.push('the NES has a hinge');
  if (!d.querySelector('#nes-wrap').classList.contains('nes-has-deco')) bad.push('on keys the console\'s buttons are not drawn beside the screen');
  /* PLAYING, with a stand-in engine: the keys reach it, the page does not scroll, and the rest of the app holds still. */
  ev('window.__pressed = []; NES_.nes = { buttonDown: (p, b) => __pressed.push("d" + b), buttonUp: (p, b) => __pressed.push("u" + b), frame() {} };');
  w.__aheadHold = false;
  const key = (type, code, k, more) => { const e = new w.KeyboardEvent(type, Object.assign({ code, key: k, bubbles: true, cancelable: true }, more || {})); d.body.dispatchEvent(e); return e.defaultPrevented; };
  if (key('keydown', 'KeyW', 'w')) bad.push('a key was taken while no game ran');
  ev('nesRun_(true)');
  if (!d.body.classList.contains('nes-on')) bad.push('the body is not marked while a game plays');
  if (w.__aheadHold !== true) bad.push('the builder is not held while a game plays');
  if (t.TOOLS_ON().some(e => String(e.w.id) !== 'console')) bad.push('other widgets still run while a game plays: ' + t.TOOLS_ON().map(e => e.w.id).join());
  if (!key('keydown', 'KeyW', 'w')) bad.push('W did not take its keydown');
  if (!ev('NES_.held.up')) bad.push('W did not hold up');
  key('keyup', 'KeyW', 'w');
  if (ev('NES_.held.up')) bad.push('W let go did not let go of up');
  ['ArrowDown', 'Space'].forEach(c => { if (!key('keydown', c, c === 'Space' ? ' ' : c)) bad.push(c + ' was left to scroll the page'); key('keyup', c, c === 'Space' ? ' ' : c); });
  if (key('keydown', 'KeyW', 'w', { ctrlKey: true })) bad.push('Ctrl+W was taken from the browser');
  key('keyup', 'KeyW', 'w');
  key('keydown', 'KeyZ', 'z'); key('keydown', 'KeyK', 'k'); key('keyup', 'KeyZ', 'z');
  if (!ev('NES_.held.b')) bad.push('Z let go while K still held let go of B');
  key('keyup', 'KeyK', 'k');
  if (ev('NES_.held.b')) bad.push('B stayed held with both keys up');
  if (ev('__pressed.join()').indexOf('d' + ev('NES_B.up')) === -1) bad.push('the engine never heard up pressed');
  /* A HELD KEY LIGHTS THE DRAWN BUTTON IT PRESSES, and letting go puts it out. */
  key('keydown', 'KeyX', 'x');
  const litA = d.querySelector('#nes-deco [data-k="a"]');
  if (!litA || !litA.classList.contains('is-down')) bad.push('X held did not light the drawn A');
  key('keyup', 'KeyX', 'x');
  if (litA && litA.classList.contains('is-down')) bad.push('X let go left the drawn A lit');
  key('keydown', 'ArrowLeft', 'ArrowLeft');
  if (!d.querySelector('#nes-deco .nes-dpad.is-down')) bad.push('← held did not light the drawn D-pad');
  key('keyup', 'ArrowLeft', 'ArrowLeft');
  /* THE KEYS TILE hides the list and shows it again, and remembers. */
  t.ACTIONS['nes-keys']();
  if (d.querySelector('#nes-legend').hidden) bad.push('the Keys tile did not show the key list');
  t.ACTIONS['nes-keys']();
  if (!d.querySelector('#nes-legend').hidden) bad.push('the Keys tile did not hide the key list again');
  t.ACTIONS['nes-keys']();
  /* NOT KEPT (481): an old remembered "show" was what still put the list in the owner's DS; it is shown only by the tile, each visit. */
  let kept = null; try { kept = w.localStorage.getItem('nes-keys'); } catch (e) {}
  if (kept !== null) bad.push('the key list choice was kept on the device: ' + JSON.stringify(kept));
  /* A FINGER ON THE CONSOLE swaps the key list for the touch pad, and the Keys tile goes; the padlock is the widget's (461). */
  d.querySelector('#nes-wrap').dispatchEvent(Object.assign(new w.Event('pointerdown', { bubbles: true }), { pointerType: 'touch' }));
  if (ev('NES_.mode') !== 'touch' || !d.querySelector('#nes-pad').classList.contains('on') || !d.querySelector('#nes-legend').hidden) bad.push('a finger did not bring the touch pad back in place of the key list');
  if (d.querySelector('#nes-wrap').classList.contains('nes-has-deco')) bad.push('with the touch pad up the drawn buttons still show beside the screen');
  const acts2 = [...d.querySelectorAll('#nes-tiles [data-do]')].map(b => b.getAttribute('data-do'));
  if (acts2.join() !== 'nes-pause,nes-pick,nes-forget') bad.push('on touch, playing, the tiles are ' + JSON.stringify(acts2));
  ev('nesStop_()');
  if (d.body.classList.contains('nes-on')) bad.push('the body is still marked after Pause');
  if (w.__aheadHold !== false) bad.push('the builder is still held after Pause');
  ev('NES_.nes = null;');
  return bad;
});

/* ---------- THE DS LOOKS LIKE A DS (478): two screens in one clamshell, its own buttons pressing the core, and nothing repainted while it plays. */
check('console DS (478, 481): a DS Lite — two halves, a hinge, D-pad left and A/B/X/Y right of the touch screen, no key list until asked — its pad shown on keys too with L R X Y A B Start Select reaching the core, the widget not redrawn while it plays, and a save at most once a minute', async () => {
  const { w } = boot({ member: true });
  await wait(300);
  const t = w.__t, d = w.document, ev = s => t.inApp(s);
  const bad = [];
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'console');
  if (at < 0) return ['there is no Console widget on the Games column'];
  t.findPage(at, true);
  await woken_();
  if (!d.querySelector('#s-stuff #nes-wrap')) return ['the console was not drawn'];
  ev('nesSysSet_("nds")');
  const wrap = d.querySelector('#nes-wrap'), pad = d.querySelector('#nes-pad');
  if (wrap.dataset.sys !== 'nds') bad.push('the body does not say nds');
  const [W, H] = ev('NES_DIMS.nds'), gap = ev('NES_GAP');
  if (W !== 256 || H !== 2 * 192 + gap) bad.push('the DS picture is ' + W + 'x' + H + ', not two 256x192 screens and the gap');
  if (ev('nesShow_("nds")') !== W / H) bad.push('the stage is not the two screens\' shape: ' + ev('nesShow_("nds")'));
  if (!d.querySelector('#nes-hinge') || parseFloat(d.querySelector('#nes-hinge').style.height) <= 0) bad.push('the DS has no hinge between its screens');
  if (ev('NES_.mode') !== 'keys') bad.push('the journey expected a keyboard device');
  if (!pad.classList.contains('on') || !wrap.classList.contains('nes-has-pad')) bad.push('on keys the DS does not wear its own buttons');
  if (!d.querySelector('#nes-legend').hidden) bad.push('the key list shows on the DS before the Keys tile asked');
  if (ev("localStorage.getItem('nes-keys')") !== null) bad.push('a remembered key-list choice is still kept, so an old "show" can bring it back (481)');
  /* A DS LITE (481): two halves and a hinge barrel, the D-pad left of the touch screen and A/B/X/Y right of it, at the bottom screen's height. */
  ['.ds-lid', '.ds-base', '.ds-hinge', '.ds-cover-a', '.ds-cover-b'].forEach(s => { if (!wrap.querySelector(s)) bad.push('the DS has no ' + s); });
  if (wrap.querySelectorAll('.ds-grille').length !== 2) bad.push('the top half has not a speaker either side of its screen');
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const num = re => { const m = re.exec(css); return m ? parseFloat(m[1]) : NaN; };
  const sw = num(/\.nes-wrap\[data-sys="nds"\]\s*\{[^}]*--ds-s:\s*([\d.]+)/), cell = num(/--k-cell:\s*([\d.]+)cqw/);
  const dpadX = num(/\.nes-pad \.nes-dpad\s*\{[^}]*left:\s*calc\(([\d.]+)cqw/), faceX = num(/\.nes-pad \.nes-face\s*\{\s*left:\s*calc\(([\d.]+)cqw/);
  if (!(sw > 0) || !(dpadX < 50 - sw / 2)) bad.push('the D-pad is not left of the touch screen in style.css (centre ' + dpadX + ', screen from ' + (50 - sw / 2) + ')');
  if (!(faceX - 1.5 * cell > 50 + sw / 2)) bad.push('A/B/X/Y are not right of the touch screen in style.css (from ' + (faceX - 1.5 * cell) + ', screen to ' + (50 + sw / 2) + ')');
  if (!/\.nes-pad \.nes-dpad\s*\{[^}]*top:\s*calc\(var\(--ds-mid\)/.test(css) || !/\.nes-pad \.nes-face\s*\{[^}]*top:\s*calc\(var\(--ds-mid\)/.test(css)) bad.push('the D-pad and A/B/X/Y are not set at the touch screen\'s height');
  if (!/\.ds-base\s*\{\s*top:\s*calc\(\(var\(--ds-lid\) \+ var\(--ds-hh\)\)/.test(css)) bad.push('the base does not start below the lid and the hinge');
  if (!/\.nes-pad \.nes-key::before\s*\{[^}]*inset:\s*min\(0px, \(100% - 44px\) \/ 2\)/.test(css)) bad.push('the DS buttons lost their 44px reach');
  const names = [...pad.querySelectorAll('[data-k]')].map(e => e.dataset.k).sort().join();
  if (names !== 'a,b,dpad,l,r,select,start,x,y') bad.push('the DS pad holds ' + names);
  /* A STAND-IN CORE: each pad button reaches RetroPad's own number. */
  ev(`window.__in = []; EMU_.ejs = { gameManager: { simulateInput: (p, i, v) => __in.push(i + ':' + v) }, pause() {}, play() {} }; EMU_.ready = true; EMU_.sys = 'nds'; EMU_.held = {}; EMU_.ax = [];`);
  ev('nesRun_(true); NES_.running = true; emuSync_()');
  const press = (k, on) => { const el = pad.querySelector('[data-k="' + k + '"]'); const r = { clientX: 0, clientY: 0, pointerId: 7, pointerType: 'touch' };
    el.dispatchEvent(Object.assign(new w.Event(on ? 'pointerdown' : 'pointerup', { bubbles: true, cancelable: true }), r)); };
  ['a', 'b', 'x', 'y', 'l', 'r', 'start', 'select'].forEach(k => {
    ev('__in = []'); press(k, true);
    if (ev('__in.join()') !== ev('EMU_IDX.' + k) + ':1') bad.push(k + ' pressed sent ' + ev('__in.join()'));
    ev('__in = []'); pad.dispatchEvent(Object.assign(new w.Event('pointerup', { bubbles: true }), { pointerId: 7 }));
    if (ev('__in.join()') !== ev('EMU_IDX.' + k) + ':0') bad.push(k + ' let go sent ' + ev('__in.join()'));
  });
  /* NOTHING REDRAWN WHILE IT PLAYS: the builder's repaint of the widget leaves the console alone. */
  const box = d.querySelector('#nes-box');
  let muts = 0;
  const mo = new w.MutationObserver(l => { muts += l.length; });
  mo.observe(box, { childList: true, subtree: true });
  for (let i = 0; i < 5; i++) ev('consoleStill_()');
  await wait(20);
  mo.disconnect();
  if (muts) bad.push('the console was redrawn ' + muts + ' time(s) while a game played');
  /* A SAVE AT MOST ONCE A MINUTE while playing: pauses in a row take one; leaving always takes one. */
  ev(`window.__caps = 0; CSV_.hash = 'h'; CSV_.rom = 'k'; CSV_.took = 0; EMU_.key = 'k';
    EMU_.ejs.gameManager.getSaveFile = () => (__caps++, new Uint8Array([1])); EMU_.ejs.gameManager.getState = () => new Uint8Array([2]);`);
  for (let i = 0; i < 4; i++) { ev('emuPause_()'); ev('NES_.running = true'); }
  if (ev('__caps') !== 1) bad.push(ev('__caps') + ' saves were taken by four pauses inside a minute');
  ev('CSV_.took = Date.now() - 61000; emuPause_()');
  if (ev('__caps') !== 2) bad.push('a pause a minute later took no save');
  ev('emuPause_(true)');
  if (ev('__caps') !== 3) bad.push('leaving the page did not save at once');
  ev('nesRun_(false); NES_.running = false; EMU_.ejs = null; EMU_.ready = false; EMU_.key = ""; CSV_.hash = ""; nesSysSet_("nes")');
  return bad;
});

check('console saves (446): a game file\'s battery save and state are kept at a pause on the account, keyed by the file\'s hash and never the file, put back when the same file plays again; over 2 MB stays on the device, and a quiet line says when', async () => {
  let kept = null;
  const { w, sent, errs } = boot({ before: win => {
    signedInAs_(MEMBER_)(win);
    /* jsdom has no gzip stream: Node's own, so the packing is the real one. */
    win.CompressionStream = CompressionStream; win.DecompressionStream = DecompressionStream; win.Response = Response; win.Blob = Blob;
  }, reply: b => (b.action === 'consoleSave' ? (kept = { at: b.at, sys: b.sys, sram: b.sram, state: b.state }, { success: true, at: b.at })
    : b.action === 'consoleLoad' ? { success: true, save: kept } : { success: true }) });
  await wait(300);
  const t = w.__t, d = w.document, ev = s => t.inApp(s);
  const bad = [];
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'console');
  if (at < 0) return ['there is no Console widget on the Games column'];
  t.findPage(at, true);
  await woken_();
  if (!d.querySelector('#s-stuff #nes-kept')) return ['the console has no line for when the game was saved'];
  if (!d.querySelector('#nes-kept').hidden) bad.push('the saved line shows before any game was played');
  /* A STAND-IN EMULATORJS with EmulatorJS's own names: getSaveFile, getState, loadState, the save path and loadSaveFiles. */
  ev(`window.__gm = { loaded: [], written: [], big: 0,
    getSaveFile: () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), supportsStates: () => true,
    getState: () => { if (__gm.big) { const u = new Uint8Array(__gm.big); let x = 2463534242; for (let i = 0; i < u.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; u[i] = x & 255; } return u; } return new Uint8Array(4000).fill(7); },
    loadState: s => __gm.loaded.push(s.length), getSaveFilePath: () => '/data/saves/game.srm', loadSaveFiles: () => __gm.written.push('refresh'),
    FS: { writeFile: (p, b) => __gm.written.push(p + ':' + b.length) } };
    EMU_.ejs = { gameManager: __gm, pause() {}, play() {} }; EMU_.ready = true; EMU_.key = 'game-x.sfc'; EMU_.sys = 'snes';
    window.__rom = new Uint8Array(70000).map((_, i) => i % 251);`);
  await ev('csvBegin_(__rom, "snes", "game-x.sfc", csvApplyEmu_)');
  const hash = ev('CSV_.hash');
  if (!/^[0-9a-f]{16,64}$/.test(hash)) bad.push('the game file was given the key ' + JSON.stringify(hash));
  if (ev('__gm.loaded.length')) bad.push('a state was loaded for a game never saved');
  ev('emuPause_()');
  await wait(400);
  const post = sent.filter(b => b.action === 'consoleSave');
  if (post.length !== 1) bad.push('a pause posted ' + post.length + ' consoleSave(s)');
  const p = post[0] || {};
  if (p.hash !== hash || p.sys !== 'snes' || !p.sram || !p.state) bad.push('the save posted ' + JSON.stringify(Object.keys(p)) + ' for ' + p.hash);
  if (JSON.stringify(p).length > 4000) bad.push('the posted save is ' + JSON.stringify(p).length + ' characters: 4 KB of one byte was not packed, or the file went with it');
  if (/rom|game-x/.test(Object.keys(p).join()) || p.name === 'game-x.sfc') bad.push('the save names or carries the game file');
  if (!/^Saved just now to your account$/.test(d.querySelector('#nes-kept').textContent)) bad.push('after a pause the line says ' + JSON.stringify(d.querySelector('#nes-kept').textContent));
  ev('emuPause_()');
  await wait(300);
  if (sent.filter(b => b.action === 'consoleSave').length !== 1) bad.push('the same save was sent twice');
  /* THE SAME FILE AGAIN, on another device: the account's save is put back, battery file first, then the state. */
  await ev('csvBegin_(__rom, "snes", "game-x.sfc", csvApplyEmu_)');
  if (!sent.some(b => b.action === 'consoleLoad' && b.hash === hash)) bad.push('starting the game did not ask the account for its save');
  if (ev('__gm.written.join()') !== '/data/saves/game.srm:8,refresh') bad.push('the battery save was put back as ' + ev('__gm.written.join()'));
  if (ev('__gm.loaded.join()') !== '4000') bad.push('the state put back was ' + ev('__gm.loaded.join()') + ' bytes, not 4000');
  /* ANOTHER FILE is another game, and gets none of this one's save. */
  ev('__gm.loaded = []; window.__rom2 = new Uint8Array(70000).map((_, i) => i % 13)');
  await ev('csvBegin_(__rom2, "snes", "game-y.sfc", csvApplyEmu_)');
  if (ev('CSV_.hash') === hash) bad.push('two different files have one key');
  /* OVER THE CAP: nothing sent, a reason said in the line, no pop-up. */
  ev('EMU_.key = "game-y.sfc"; __gm.big = 3 * 1024 * 1024');
  const before = sent.length;
  ev('emuPause_()');
  await wait(1500);
  if (sent.slice(before).some(b => b.action === 'consoleSave')) bad.push('a save over 2 MB was sent');
  if (!/2 MB.*this device/.test(d.querySelector('#nes-kept').textContent)) bad.push('over the cap the line says ' + JSON.stringify(d.querySelector('#nes-kept').textContent));
  ev('EMU_.ejs = null; EMU_.ready = false; EMU_.key = ""');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- CONNECT 4: ONE COUNTER FALLS, INTO THE RIGHT SQUARE, AND THE FOUR THAT WON ARE RINGED § */
check('connect 4 drops exactly the counter just played into the lowest empty square, and rings the four that win', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  const W = 7, H = 6;
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  /* CONNECT 4 IS A GAME INSIDE BOARD GAMES (414), reached through its picker. */
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'boardgames');
  if (at < 0) return ['there is no Board games widget on the Games column'];
  t.findPage(at, true);
  const cells = () => [...d.querySelectorAll('#s-stuff #c4-board .c4-cell')];
  /* TURNING TO THE PAGE STARTS THE WIDGET, IT DOES NOT FINISH IT — `woken_()` above says why. § */
  await woken_();
  const pick = d.querySelector('#s-stuff #bg-pick');
  if (!pick) return ['the Board games widget has no picker'];
  pick.value = 'c4'; t.ACTIONS['bg-pick'](pick);
  for (let k = 0; k < 30 && cells().length !== W * H; k++) await wait(100);
  if (cells().length !== W * H) return ['the board did not draw ' + (W * H) + ' squares'];
  const bad = [];
  const tap = x => { const el = d.createElement('button'); el.setAttribute('data-x', String(x)); t.ACTIONS['c4-drop'](el); };
  const lowest = x => { for (let y = H - 1; y >= 0; y--) { const c = cells()[y * W + x]; if (!c.classList.contains('p1') && !c.classList.contains('p2')) return y; } return -1; };
  const fallen = () => cells().map((c, i) => c.classList.contains('c4-new') ? i : -1).filter(i => i >= 0);
  const said = () => d.querySelector('#s-stuff #c4-said');

  /* ONE TAP, ONE COUNTER FALLING, WHERE GRAVITY PUTS IT — twice in one column, so "lowest empty"
     is asked of a column that is not empty. */
  [[3, 'p1'], [3, 'p2'], [4, 'p1']].forEach(([x, side]) => {
    const y = lowest(x);
    tap(x);
    const f = fallen();
    if (f.length !== 1) { bad.push('a tap in column ' + (x + 1) + ' marked ' + f.length + ' counters to fall'); return; }
    if (f[0] !== y * W + x) bad.push('a tap in column ' + (x + 1) + ' dropped square ' + f[0] + ', not row ' + (y + 1) + ' of that column');
    const c = cells()[f[0]];
    if (!c.classList.contains(side)) bad.push('the counter that fell in column ' + (x + 1) + ' is not ' + side);
    if (!/--c4-fall:\s*\d/.test(c.getAttribute('style') || '') || Number((c.getAttribute('style').match(/--c4-fall:\s*(\d+)/) || [])[1]) !== y + 1) {
      bad.push('the counter that fell to row ' + (y + 1) + ' says it falls "' + c.getAttribute('style') + '"');
    }
  });
  /* WHOSE GO IT IS, AS A DISC IN THAT SIDE'S COLOUR — Yellow after three counters. */
  const disc = said() && said().querySelector('.c4-turn');
  if (!disc || !disc.classList.contains('p2') || disc.getAttribute('aria-hidden') !== 'true') {
    bad.push('after three counters the line reads "' + (said() || {}).innerHTML + '" — wanted a hidden yellow disc beside Yellow\'s go');
  }

  /* A FULL COLUMN PLAYS NOTHING, SO NOTHING FALLS — not even the counter that fell last time. */
  for (let i = 0; i < H; i++) tap(0);
  tap(0);
  if (!/full/.test(said().textContent)) bad.push('a tap on a full column reads "' + said().textContent + '"');
  if (fallen().length) bad.push('a tap on a full column dropped a counter again: square ' + fallen().join(', '));

  /* A WIN RINGS EXACTLY THE FOUR. Red down column 1, Yellow beside it. */
  t.ACTIONS['c4-again'](d.createElement('button'));
  if (cells().some(c => c.classList.contains('p1') || c.classList.contains('p2'))) bad.push('New game left counters on the board');
  [0, 1, 0, 1, 0, 1, 0].forEach(tap);
  const rung = cells().map((c, i) => c.classList.contains('c4-win') ? i : -1).filter(i => i >= 0);
  const four = [2, 3, 4, 5].map(y => y * W);
  if (rung.join(',') !== four.join(',')) bad.push('four Red counters down column 1 rang squares ' + rung.join(', ') + ', wanted ' + four.join(', '));
  if (!/Red wins/.test(said().textContent) || !said().querySelector('.c4-turn.p1')) bad.push('the win reads "' + said().innerHTML + '"');
  if (cells().some(c => !c.disabled)) bad.push('a won board can still be played');
  return bad;
});

/* ---------- THE MAZE: ITS WALLS ARE ITS OWN, ITS WALK SURVIVES A REPAINT, ITS KEYS ARE ITS OWN § */
/* ---------- THE COLLIERS WOOD RACER (426): the map from `?race=1`, served here from the invented check/race-fixture.json ---------- */
const RACE_FIX_ = () => JSON.parse(fs.readFileSync(path.join(dir, '..', 'check', 'race-fixture.json'), 'utf8'));
const RACE_ADMIN_ = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin', handle: 'annadmin' };
/* To the racer's page of Games, waiting for the card to settle: `want` is 'world' (the map adopted) or 'idle' (nothing asked). */
const raceOpen_ = async (w, want) => {
  const t = w.__t;
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'console');
  if (at < 0) return 'there is no console on the Games column';
  t.findPage(at, true);
  await woken_();
  /* THE RACER IS A CHOICE ON THE CONSOLE (441). */
  const pick = w.document.querySelector('#s-stuff #cs-pick');
  if (!pick) return 'the console has no picker';
  if (pick.value !== 'racer') { pick.value = 'racer'; t.ACTIONS['cs-pick'](pick); }
  for (let k = 0; k < 60; k++) {
    const R = w.racer_ ? w.racer_() : null;
    if (R && (want === 'world' ? R.world : !R.asking)) return '';
    await wait(100);
  }
  return want === 'world' ? 'the map never became a world' : 'the map was still being asked for';
};

/* THE SHIPPED MAP (464): data/race-map.json as the site serves it. */
const RACE_SHIPPED_ = () => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'race-map.json'), 'utf8'));
/* THE PRACTICE STREETS (500): the invented town the shipped file was before tools/race_map.py wrote the real Colliers Wood. */
const RACE_PRACTICE_ = () => JSON.parse(fs.readFileSync(path.join(dir, '..', 'check', 'race-practice.json'), 'utf8'));
const raceServeFix_ = (race1, shipped) => u => (u.indexOf('race=1') !== -1 ? race1
  : /data\/race-map\.json/.test(u) ? shipped : undefined);

