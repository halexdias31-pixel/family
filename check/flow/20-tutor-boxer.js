/* ---------- EVERY FIND KIND THAT IS NOT A QUESTION IS BUILT FROM THE SAME FIVE PARTS § */
check('every Find kind that is not a question is made of the shared parts: head, kicker, meta, section, list', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the cards were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects'),
      practicals: read('practicals') })));
  const p = payload();
  ['textbooks', 'boxers', 'fights', 'projects', 'practicals'].forEach(k => { p[k] = made[k] || []; });
  /* THE FILMS ARE THE FIXTURE'S THREE INVENTED ROWS, shaped as `doGet` sends an admin them — a long
     title, a series, and a placeholder with no file. Sent so their absence from Find is asked, below. */
  p.films = JSON.parse(fs.readFileSync(path.join(dir, '..', 'check', 'fixture.json'), 'utf8')).films || [];
  if (!p.films.length) return ['check/fixture.json has no films, so their absence from Find was NOT checked'];
  const { w } = boot({ payload: p });
  await wait(300);
  const bad = [];
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const all = w.stuffItemsAll_();
  /* THE CARD'S OWN MARKUP, NOT A DRAWING'S. § */
  const onCard = el => !el.closest('svg, figure, .tb-an-stage');
  const strayFilms = all.filter(x => x.kind === 'film' || p.films.some(f => f.title === x.name));
  if (strayFilms.length) bad.push(strayFilms.length + ' of the payload\'s films reached Find (' + strayFilms.map(x => x.name).join(', ') + ') — films are found in Games → Videos, not in Find');
  const KINDS_HERE =['practical', 'project', 'content', 'people', 'fight'];
  KINDS_HERE.forEach(kind => {
    const xs = all.filter(x => x.kind === kind);
    if (!xs.length) { bad.push('no ' + kind + ' reached Find, so its card was NOT checked'); return; }
    xs.forEach(x => {
      const name = kind + ' "' + x.name + '"';
      const host = box(w.stuffCard(x));
      const card = host.querySelector('.favwrap > .card') || host.firstElementChild;
      if (!card || !card.classList.contains('fc')) { bad.push(name + ' is not a `.card.fc`'); return; }
      /* A FIGHT HAS NO HEAD (490): "just have the tags of both boxes' names" -- it opens on its tag row. */
      if (kind === 'fight' || kind === 'people') {
        const tr0 = card.firstElementChild;
        if (!tr0 || !tr0.classList.contains('qtags') || card.querySelector('h3')) bad.push(name + ' does not open on its tag row');
        return;
      }
      /* THE TAGS ARE THE TITLE (499): a name the tag row already says has no head — the card opens on its row, its name its aria-label. */
      const tagTitled = card.getAttribute('aria-label') === x.name && !card.querySelector('.fc-head');
      /* TAGS AT THE TOP OF EVERY CARD (1030): the row may stand above the head instead of under it. */
      const top = card.firstElementChild, rowFirst = !!top && top.classList.contains('qtags');
      const head = tagTitled ? null : rowFirst ? top.nextElementSibling : top;
      if (tagTitled) {
        const tr0 = card.firstElementChild;
        if (!tr0 || !tr0.classList.contains('qtags') || !tr0.querySelector('.qtag[data-f="kindLabel"]')) bad.push(name + ' has no head and does not open on its tag row');
      } else {
        if (!head || !head.classList.contains('fc-head')) bad.push(name + ' does not open on `.fc-head` (or its tag row, then the head)');
        else if (!head.querySelector(':scope > h3') || head.querySelector('.fc-flag, .fc-flags')) {
          bad.push(name + '\'s head is not its title alone');
        }
        /* AND THE ONE ROW UNDER IT, opening on the What kind answer (355). */
        const tr = rowFirst ? top : head && head.nextElementSibling;
        if (!tr || !tr.classList.contains('qtags') || !tr.querySelector('.qtag[data-f="kindLabel"]')) bad.push(name + '\'s head is not followed by its tag row');
        if (card.querySelectorAll('.fc-head').length !== 1) bad.push(name + ' has ' + card.querySelectorAll('.fc-head').length + ' heads');
      }
      const stray = ['.thing', '[style]', 'p.note', '.tile-row'].filter(sel => [...card.querySelectorAll(sel)].some(onCard));
      if (stray.length) bad.push(name + ' carries ' + stray.join(', ') + ' inside the card');
      const pages = w.pageParts_(x).filter(Boolean).map(part => ({ part, el: box(w.stuffPart_(x, part)).firstElementChild }));
      pages.forEach(({ part, el }) => {
        if (!el) { bad.push(name + ' page ' + part + ' drew nothing'); return; }
        if (!el.classList.contains('fc')) bad.push(name + ' page ' + part + ' is not a `.card.fc`');
        const k = el.firstElementChild, h = k && k.nextElementSibling;
        if (!k || !k.classList.contains('fc-kick') || !h || h.tagName !== 'H3') {
          bad.push(name + ' page ' + part + ' does not open on its kicker and then its title');
        }
        if ([...el.querySelectorAll('[style], p.note, .thing')].some(onCard)) bad.push(name + ' page ' + part + ' carries a stray shape');
      });
      [card].concat(pages.map(pg => pg.el).filter(Boolean)).forEach(el => {
        el.querySelectorAll('ol').forEach(ol => {
          if (!ol.classList.contains('fc-list')) bad.push(name + ' has a numbered list that is not an `.fc-list`');
        });
      });
    });
  });
  return bad.length > 12 ? bad.slice(0, 12).concat(['… and ' + (bad.length - 12) + ' more']) : bad;
});

/* THE FIGHTER'S PROFILE — FOUR JOURNEYS OVER THE REAL FILES ASKED FOR AS § */
const boxerApp_ = async (edit) => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const raw = { boxers: read('boxers'), fights: read('fights') };
  if (edit) edit(raw);
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return { fail: 'libraryExtras_ is not reachable, so the boxers were NOT checked — not a pass' };
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, raw)));
  if (!(made.boxers || []).length) return { fail: 'the mapper made no boxers of data/boxers.json — NOT a pass' };
  const p = payload();
  p.boxers = made.boxers; p.fights = made.fights || [];
  const { w, errs } = boot({ payload: p });
  await wait(300);
  const item = name => w.stuffItemsAll_().find(x => x.kind === 'people' && x.name === name);
  const draw = html => { const d = w.document.createElement('div'); d.innerHTML = html; w.document.body.appendChild(d); return d; };
  return { w, errs, raw, made, item, draw };
};

/* ---------- ONE PEOPLE KIND (batch D): a boxer is the same card as a historical figure, a fight their two portraits face to face ---------- */
check('a boxer is a people card: the tags over one 8-bit portrait and nothing else, no fights page; a fight is the two corners\' portraits facing each other under its tags', async () => {
  const a = await boxerApp_();
  if (a.fail) return [a.fail];
  const bad = [], w = a.w;
  w.__t.DATA().portraits = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'portraits.json'), 'utf8'));
  const x = a.item('Muhammad Ali');
  if (!x) return ['Muhammad Ali is not a people item — NOT checked'];
  if (w.pageParts_(x).length !== 1) bad.push('a boxer still has pages after his card: ' + JSON.stringify(w.pageParts_(x)));
  const card = a.draw(w.stuffCard(x)).querySelector('.card.fc.person');
  if (!card) return bad.concat(['a boxer is not drawn as `.card.fc.person`']);
  if (!card.firstElementChild.matches('.qtags')) bad.push('the boxer card does not open on its tags');
  if (card.querySelectorAll('svg.pp').length !== 1 || card.querySelector('svg.pp.is-none')) bad.push('the boxer card has no portrait of his own');
  const rest = card.cloneNode(true); rest.querySelectorAll('.qtags, svg.pp').forEach(e => e.remove());
  if (rest.textContent.trim()) bad.push('the boxer card says more than its tags: ' + JSON.stringify(rest.textContent.trim().slice(0, 60)));
  const f = w.stuffItemsAll_().find(y => y.kind === 'fight' && y.row && y.row.a === 'Muhammad Ali');
  const fc = f && a.draw(w.stuffCard(f)).querySelector('.card.fc.fight');
  if (!fc) return bad.concat(['no fight of Muhammad Ali drawn — NOT checked']);
  const pics = fc.querySelectorAll('.fight-faces svg.pp');
  if (pics.length !== 2) bad.push('a fight card has ' + pics.length + ' portraits, wanted two');
  else if (pics[0].querySelector('g[transform]') || !pics[1].querySelector('g[transform*="scale(-1 1)"]')) bad.push('the two corners do not face each other');
  if (pics[0] && pics[0].innerHTML.replace(/<\/?g[^>]*>/g, '') !== a.draw(w.personPic_(x.pixId, x.name)).querySelector('svg').innerHTML) bad.push('the fight draws Ali differently from his own card');
  return bad;
});

check('sharing a booking hands over a PNG of the receipt: share sheet, else download, else a sheet', async () => {
  const bad = [];
  const BOX = { left: 12.5, top: 30, width: 300, height: 520, right: 312.5, bottom: 550, x: 12.5, y: 30 };
  const made = [], clicks = [];
  const { w } = boot({ before: w => {
    /* AN IMAGE THAT LOADS, and a canvas that remembers its size and hands back a PNG blob. */
    w.Image = class { set src(v) { this._src = v; made.push(v); setTimeout(() => this.onload && this.onload(), 0); }
                      get src() { return this._src; } decode() { return Promise.resolve(); } };
    w.HTMLCanvasElement.prototype.getContext = function () {
      return { fillRect() {}, drawImage() {}, set fillStyle(v) {}, get fillStyle() { return ''; } };
    };
    w.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
      const b = new w.Blob(['\x89PNG'], { type });
      b.__w = this.width; b.__h = this.height;
      setTimeout(() => cb(b), 0);
    };
    /* JSDOM DOES NOT DO PSEUDO-ELEMENTS and says so on the console for every element; answered with
       the element's own style, whose `content` is empty, so the clone simply adds no `::before`. */
    const gcs = w.getComputedStyle;
    w.getComputedStyle = (el, pseudo) => gcs.call(w, el);
    w.URL.createObjectURL = () => 'blob:receipt';
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () { clicks.push({ href: this.href, download: this.download }); };
  } });
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const rc = d.querySelector('#bookr .rc');
  if (!rc) return ['the booking form draws no .rc — nothing to share'];
  const tile = rc.querySelector('[data-do="book-share"]');
  if (!tile) return ['the receipt has no Share tile on it'];
  rc.getBoundingClientRect = () => BOX;
  const press = () => w.__t.ACTIONS['book-share'](tile);
  /* UNTIL IT HAPPENS, NOT FOR A FIXED BEAT. § */
  const till = async ok => { const t0 = Date.now(); while (!ok() && Date.now() - t0 < 3000) await wait(20); };

  /* ---------- 1. A PHONE: ONE PNG FILE, TO THE SHARE SHEET ----------------------------------------- */
  const shared = [];
  w.navigator.canShare = x => !!(x && x.files && x.files.length && x.files[0].type === 'image/png');
  w.navigator.share = x => { shared.push(x); return Promise.resolve(); };
  press();
  await till(() => shared.length);
  await wait(30);
  if (shared.length !== 1) bad.push('a phone that shares files was handed ' + shared.length + ' shares, not 1');
  else {
    const f = (shared[0].files || [])[0];
    if (!f) bad.push('navigator.share was called with no file');
    else {
      if (f.type !== 'image/png') bad.push('the file shared is ' + f.type + ', not image/png');
      if (!/\.png$/.test(f.name)) bad.push('the file shared is called "' + f.name + '", not a .png');
      if (!(f instanceof w.File)) bad.push('what was shared is not a File, so a share sheet will not take it');
    }
  }
  const svg = decodeURIComponent((made[made.length - 1] || '').replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
  if (!svg) bad.push('no picture was drawn — nothing was set as an image source');
  else {
    /* THE RECEIPT'S OWN SIZE, AT TWICE THE PIXELS — the canvas and the SVG both say so. */
    if (!/<svg[^>]* width="600" height="1040"/.test(svg)) bad.push('the picture is not the receipt at 2x (300x520 → 600x1040): ' + (svg.match(/<svg[^>]*>/) || [''])[0]);
    if (!/viewBox="0 0 300 520"/.test(svg)) bad.push('the picture is not laid out at the receipt\'s own width');
    if (!/<foreignObject[^>]*width="300" height="520"/.test(svg)) bad.push('the receipt is not in a foreignObject of its own size');
    /* AND IT IS THIS RECEIPT: its first row's label is in it. (Whether the tiles are left off is a
       question about `display`, which jsdom does not compute — `check/share.js` asks it.) */
    const k = rc.querySelector('.bk-k');
    if (k && svg.indexOf(k.textContent.trim()) < 0) bad.push('the picture does not hold the receipt\'s first row, "' + k.textContent.trim() + '"');
  }

  /* ---------- 2. A LAPTOP: NO FILE SHARING, SO A DOWNLOAD ------------------------------------------ */
  w.navigator.canShare = () => false;
  shared.length = 0;
  const clicked = clicks.length;
  press();
  await till(() => clicks.length > clicked || shared.length);
  if (shared.length) bad.push('a browser that cannot share files was still sent to navigator.share');
  const dl = clicks[clicks.length - 1];
  if (!dl) bad.push('a browser that cannot share files was given no download');
  else if (!/\.png$/.test(dl.download || '')) bad.push('the download is called "' + dl.download + '", not a .png');
  const said = (d.getElementById('toast') || {}).textContent || '';
  if (!/saved/i.test(said)) bad.push('the download said "' + said + '" rather than that it saved a picture');

  /* ---------- 3. A REFUSED SHARE SHEET: THE PICTURE IN A SHEET, WITH ITS OWN SHARE ------------------ */
  w.navigator.canShare = x => !!(x && x.files);
  w.navigator.share = x => { shared.push(x); const e = new Error('no'); e.name = 'NotAllowedError'; return Promise.reject(e); };
  shared.length = 0;
  press();
  await till(() => { const t = d.getElementById('sheet'); return t && !t.classList.contains('hidden') && t.querySelector('img.rc-shot'); });
  const sheet = d.getElementById('sheet');
  const img = sheet && sheet.querySelector('img.rc-shot');
  if (!sheet || sheet.classList.contains('hidden') || !img) bad.push('a refused share sheet left nothing on the screen — the picture should be offered in a sheet');
  else if (!sheet.querySelector('[data-do="rc-shot-share"]')) bad.push('the sheet with the picture has no Share button, so a second press cannot open the share sheet');
  else {
    const before = shared.length;
    w.navigator.share = x => { shared.push(x); return Promise.resolve(); };
    w.__t.ACTIONS['rc-shot-share']();
    await wait(30);
    if (shared.length !== before + 1 || !((shared[shared.length - 1].files || [])[0] || {}).name)
      bad.push('the sheet\'s Share button did not share the picture');
  }
  return bad;
});

/* ---------- THE CHAT, POLISHED: WHAT WAS NEW STAYS MARKED, AND THE COMPOSER FITS § */
check('chat: what arrived unread stays outlined, the composer hint fits, a refusal sits on its side', async () => {
  const bad = [];
  const { w, sent } = boot();
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  const seed = (list, pending) => w.__t.dmSeed(JSON.parse(JSON.stringify(list)), pending);
  const m = (id, mine, read, body) => ({ id, mine, read, body, at: '2026-09-16 09:1' + id.slice(-1),
    withId: 'P009', withName: 'Ada Tutor', fromName: mine ? 'You' : 'Ada Tutor' });
  seed([m('m1', false, true, 'Tuesday?'), m('m2', true, true, 'Yes.'),
        m('m3', false, false, 'Great.'), m('m4', false, false, 'Bring a ruler.')]);
  try { w.__t.repaint(true); w.__t.go('dm', false, true); } catch (e) { return ['opening Messages threw: ' + e.message]; }
  await wait(80);
  const col = d.getElementById('s-dm');
  if (!col || !col.querySelector('.msg-bub')) return ['the Messages column drew no bubbles from a seeded thread: '
    + (col ? col.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) : 'no #s-dm')];
  const outlined = () => [].map.call(col.querySelectorAll('.msg.unread .msg-body-text'), p => p.textContent.trim());
  const head = (col.querySelector('.dm-new') || {}).textContent || '';
  if (!/2 new/.test(head)) bad.push('the head says "' + head + '", not "2 new"');
  if (JSON.stringify(outlined()) !== JSON.stringify(['Great.', 'Bring a ruler.'])) {
    bad.push('the two messages that arrived unread are not the ones outlined — outlined: ' + JSON.stringify(outlined()));
  }
  const asked = sent.filter(b => b.action === 'readMessage').map(b => b.messageId).sort();
  if (JSON.stringify(asked) !== '["m3","m4"]') bad.push('readMessage was asked for ' + JSON.stringify(asked) + ', not m3 and m4');
  /* THE POLL'S REPAINT: the outline is "new since you arrived", so a second draw keeps it. */
  w.__t.repaint(true);
  await wait(30);
  if (outlined().length !== 2) bad.push('a second paint dropped the outline — it should last until the server answers again');
  /* THE SERVER'S NEXT ANSWER: the same messages, now read, as fresh objects. Nothing is news. */
  seed([m('m1', false, true, 'Tuesday?'), m('m2', true, true, 'Yes.'),
        m('m3', false, true, 'Great.'), m('m4', false, true, 'Bring a ruler.')]);
  w.__t.repaint(true);
  await wait(30);
  if (outlined().length) bad.push('the outline outlived the server saying the messages were read: ' + JSON.stringify(outlined()));

  const box = col.querySelector('.card:not([data-daive]) .msg-form .msg-text');
  if (!box) bad.push('the thread has no composer');
  else {
    if (box.getAttribute('placeholder') !== 'Message…') bad.push('the composer\'s hint is "' + box.getAttribute('placeholder') + '", not "Message…"');
    if (!/Ada Tutor/.test(box.getAttribute('aria-label') || '')) bad.push('the composer does not name who it writes to in its aria-label');
  }

  /* A REFUSAL: its sentence in its own element, beside Retry and Remove. */
  seed([m('m1', false, true, 'Tuesday?')], [{ tmp: 'tmpX', mine: true, read: true, state: 'failed',
    err: 'One message every five minutes.', withId: 'P009', withName: 'Ada Tutor', fromName: 'Test Admin',
    body: 'Here it is', atMs: Date.now(), attachments: [], queue: [] }]);
  w.__t.repaint(true);
  await wait(30);
  const fail = col.querySelector('.msg.is-failed + .msg-fail, .msg.is-failed .msg-fail');
  if (!fail) bad.push('a failed send drew no refusal under its bubble');
  else {
    const why = fail.querySelector('.msg-fail-why');
    if (!why || !/five minutes/.test(why.textContent)) bad.push('the refusal\'s sentence is not an element of its own');
    if (!fail.querySelector('[data-do="msg-retry"]') || !fail.querySelector('[data-do="msg-drop"]')) bad.push('the refusal lost Retry or Remove');
  }

  /* AND AN EMPTY INBOX SAYS HOW ONE STARTS. */
  seed([]);
  w.__t.repaint(true);
  await wait(30);
  const empty = (col.querySelector('.empty') || {}).textContent || '';
  if (!/press Message/.test(empty)) bad.push('the empty inbox reads "' + empty.replace(/\s+/g, ' ').trim() + '" and does not say how to start a conversation');
  return bad;
});

/* ---------- DAIVE IN MESSAGES (449, 461): pinned first, drawn as a conversation, counts down after an answer, shut at 0 */
check('daive: pinned first in Messages as a conversation — the DM head, bubbles and composer, no look-alike classes', async () => {
  const bad = [];
  const { w } = boot({ reply: () => ({ success: true }) });
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Test Client', personId: 'P002', role: 'client', roles: ['client'], token: 'tk2' });
  w.__t.dmSeed([{ id: 'm1', mine: false, read: true, body: 'Hello', at: '2026-09-16 09:10', withId: 'P009', withName: 'Ada Tutor', fromName: 'Ada Tutor' }]);
  try { w.__t.repaint(true); w.__t.go('dm', false, true); } catch (e) { return ['opening Messages threw: ' + e.message]; }
  await wait(80);
  const col = d.getElementById('s-dm');
  const daive = col && col.querySelector('[data-daive]');
  if (!daive) return ['Messages has no Daive conversation'];
  if (col.querySelector('.card') !== daive) bad.push('Daive is not the first conversation in Messages');
  const ada = col.querySelector('.card:not([data-daive])');
  if (!ada) return bad.concat(['the seeded conversation is no longer drawn beside Daive']);
  const name = el => ((el.querySelector('.dm-head h3') || {}).textContent || '').trim();
  if (name(daive) !== 'Daive') bad.push('the conversation is titled "' + name(daive) + '", not "Daive"');
  if (/assistant/i.test(daive.textContent)) bad.push('the word "assistant" is still shown: ' + daive.textContent.replace(/\s+/g, ' ').slice(0, 120));
  ['.dm-head .dm-av', '.msg-body', '.msg-form .msg-text', '.msg-form .btn.msg-go'].forEach(sel => {
    if (!daive.querySelector(sel)) bad.push('Daive has no ' + sel + ', which every conversation has');
    if (!ada.querySelector(sel)) bad.push('the person\'s conversation has no ' + sel + ' (the comparison is void)');
  });
  if (daive.querySelector('[class*="asst"]')) bad.push('Daive still draws .asst-* look-alikes');
  const go = daive.querySelector('.msg-go'), box = daive.querySelector('.msg-text');
  if (go && go.textContent.trim() !== 'Send') bad.push('Daive\'s send control reads "' + go.textContent.trim() + '", not "Send"');
  if (box && box.getAttribute('placeholder') !== 'Message…') bad.push('Daive\'s box hint is "' + box.getAttribute('placeholder') + '"');
  const names = ((w.__t.PAGER || {}).dm || {}).names;
  if (Array.isArray(names) && names[0] !== 'Daive') bad.push('the pager\'s first page is named "' + names[0] + '"');
  return bad;
});

check('daive: an answer takes the count from 5 to 4 even when the reply forgets `left`; the facts are a site map with nothing of the business (547); shut at 0', async () => {
  const bad = [];
  let n = 0;
  const { w, sent } = boot({ reply: b => {
    if (b.action !== 'askAssistant') return { success: true };
    n++;
    /* THE FIRST REPLY CARRIES NO `left` — the phone must still count the answer (461). */
    if (n === 1) return { success: true, answer: 'Sessions are two hours.' };
    if (n === 2) return { success: true, answer: 'Yes.', left: 0, cap: 5 };
    return { success: false, why: 'ai-cap', left: 0, message: 'That is today’s 5 questions used — they come back tomorrow.' };
  } });
  await wait(300);
  const d = w.document;
  w.__t.DATA().brand = Object.assign({}, w.__t.DATA().brand, { name: '@family.', slogan: 'Somebody to say why.',
    tagline: 'Somebody to say why.', intro: '{{intro}}', area: 'Merton & Wandsworth', motto: 'TODO' });
  w.__t.USER({ name: 'Test Client', personId: 'P002', role: 'client', roles: ['client'], token: 'tk2' });
  w.__t.dmSeed([]);
  try { w.__t.repaint(true); w.__t.go('dm', false, true); } catch (e) { return ['opening Messages threw: ' + e.message]; }
  await wait(80);
  const col = d.getElementById('s-dm');
  const card = () => col && col.querySelector('[data-daive]');
  if (!card()) return ['Messages has no Daive conversation'];
  const line = () => ((card().querySelector('.daive-left') || {}).textContent || '').trim();
  const ask = q => { card().querySelector('.msg-text').value = q; w.__t.ACTIONS['daive-send'](card().querySelector('[data-do="daive-send"]')); };
  if (line() !== '5 of 5 questions left today') bad.push('before asking the line reads "' + line() + '"');
  ask('How long is a session?');
  await wait(60);
  const a = sent.filter(b => b.action === 'askAssistant').pop();
  if (!a) return bad.concat(['Send sent no askAssistant']);
  const facts = String(a.facts || '');
  /* SITE HELP ONLY (547): the facts are a map of the site -- no brand value, no config number -- whatever the brand tab holds. */
  const brandVals = Object.values(w.__t.DATA().brand || {}).map(v => String(v == null ? '' : v).trim()).filter(v => v.length > 3);
  const leaked = brandVals.filter(v => facts.indexOf(v) >= 0);
  if (leaked.length) bad.push('the business went into Daive\'s facts: ' + leaked.slice(0, 3).join(' | '));
  if (/hours per session|most students|business name/i.test(facts)) bad.push('a business number went into the facts: ' + facts.slice(0, 200));
  if (!/column "Find"/.test(facts) || !/column "Messages"/.test(facts)) bad.push('the site map is missing from the facts: ' + facts.slice(0, 200));
  if (!/two hours/.test(card().textContent)) bad.push('the stubbed answer was not drawn');
  if (card().querySelectorAll('.msg-bub').length !== 2) bad.push('the question and answer are not two DM bubbles');
  if (!card().querySelector('.msg.mine .msg-bub')) bad.push('the question is not drawn as the person\'s own bubble');
  if (line() !== '4 of 5 questions left today') bad.push('after one answer the line reads "' + line() + '", not "4 of 5"');
  let kept = null;
  try { kept = JSON.parse(w.localStorage.getItem('asst:P002')); } catch (e) {}
  if (!kept || kept.left !== 4 || !Array.isArray(kept.msgs) || kept.msgs.length !== 2) bad.push('the device did not keep 4 left and the two lines: ' + JSON.stringify(kept));
  try { w.__t.repaint(true); } catch (e) {}
  await wait(30);
  if (line() !== '4 of 5 questions left today') bad.push('a repaint brought back "' + line() + '"');
  ask('And another?');
  await wait(60);
  if (!/No questions left today/.test(line())) bad.push('at 0 the line reads "' + line() + '"');
  if (!card().querySelector('.msg-text').disabled || !card().querySelector('[data-do="daive-send"]').disabled) bad.push('at 0 the box or Send is still enabled');
  if (d.querySelector('dialog[open], .modal.open')) bad.push('a pop-up opened');
  return bad;
});

/* ---------- A TUTOR WITH NO HOURS CANNOT BE BOOKED BY NAME § */
check('488: a tutor with no hours can be chosen and asked at any hour; a named tutor never shuts the grid; No preference still books', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t;
  const st = (t.STEPS || []).find(s => s.id === 'tutor');
  if (!st || typeof w.stepSelect_ !== 'function' || typeof w.slotGrid !== 'function') {
    return ['the tutor step / stepSelect_ / slotGrid are not reachable, so this was NOT checked — not a pass'];
  }
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const D = t.DATA();
  const avail = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) avail[p + String(h).padStart(2, '0')] = ''; });
  D.tutors = [
    { title: 'Nia Nohours', rate: 14, teaches: ['Maths (GCSE)'], listed: true, avail: Object.assign({}, avail) },
    { title: 'Ada Hours', rate: 14, teaches: ['Maths (GCSE)'], listed: true, avail: Object.assign({}, avail, { m16: 'TRUE', m17: 'TRUE' }) },
  ];
  const B = t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = ((t.STEPS.find(s => s.id === 'how') || { options: () => [] }).options().find(k => !/wait/i.test(k))) || '';
  B.level = 'GCSE'; B.loc = 'Colliers Wood Library'; B.subjects = ['Maths']; B.n = '1';
  B.hosting = 'No — we book the room'; B.interval = ['Autumn 1'];
  const bad = [];
  const box = w.document.createElement('div');
  box.innerHTML = w.stepSelect_(st);
  const nia = [...box.querySelectorAll('option')].find(o => o.value === 'Nia Nohours');
  if (!nia || nia.disabled) bad.push('Nia (no hours) is ' + (nia ? 'greyed' : 'missing') + ' — any tutor may be asked');
  B.tutor = 'Nia Nohours';
  const g = w.slotGrid();
  if (!g.anyOpen) bad.push('with Nia chosen the grid shuts, saying "' + g.why + '"');
  if (g.guide !== undefined) bad.push('the grid still carries a guide sentence: "' + g.guide + '"');
  /* ADA, ASKED AT AN HOUR OUTSIDE HER WEEK: open, and sent with the hour as `slots`. */
  B.tutor = 'Ada Hours';
  B.slots = ['sa10'];
  const cell = w.slotGrid().rows.flatMap(r => r.hours).find(h => h.code === 'sa10') || {};
  if (!cell.open) bad.push('Saturday 10:00, outside Ada\'s week, is shut');
  sent.length = 0;
  try { t.ACTIONS['book-send']({ disabled: false, dataset: {} }); } catch (e) { bad.push('book-send threw: ' + e.message); }
  await wait(200);
  const job = sent.find(x => x.action === 'createJob');
  if (!job) bad.push('a request naming Ada outside her hours was not sent');
  else if (job.slots !== 'sa10') bad.push('createJob carried slots "' + job.slots + '", wanted "sa10"');
  B.tutor = 'No preference';
  if (!w.slotGrid().anyOpen) bad.push('with No preference the grid shuts');
  return bad;
});

/* ---------- 488: A REQUEST WAITS ON ITS TUTOR, WHO ANSWERS IN PLACE ---------- */
check('488: the asked tutor (and an admin) gets Accept/Decline tiles, Decline opens a line why and posts answerRequest; both sides read the status', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'answerRequest' ? { success: true, accepted: !!b.yes } : null });
  await wait(300);
  const t = w.__t;
  if (typeof t.jobPage !== 'function') return ['`jobPage_` is not exported, so the request tiles were NOT checked — not a pass'];
  const bad = [];
  const job = { id: 'J-R', jobId: 'J-R', kind: '', subject: 'Maths', level: 'GCSE', price: 30, stealable: false,
    location: 'Online', dates: '06/12/26', slots: [{ n: 1, client: 'Pat Parent', status: 'Waiting' }],
    tutorSlots: [{ key: 'a', name: 'Ada Tutor', status: 'Applied' }], events: [] };
  const host = h => { const d = w.document.createElement('div'); d.innerHTML = h; w.document.body.appendChild(d); return d; };
  const labels = d => [...d.querySelectorAll('[data-do="job-request-answer"]')].map(x => x.dataset.yes ? 'yes' : 'no').join(',');
  t.USER({ name: 'Ada Tutor', personId: 'P2', role: 'tutor', roles: ['tutor'] });
  const ada = host(t.jobPage(job));
  if (labels(ada) !== 'yes,no') bad.push('the asked tutor sees request tiles [' + labels(ada) + '], wanted Accept and Decline');
  if (!/Waiting for Ada Tutor/.test(ada.textContent)) bad.push('the tutor does not read "Waiting for Ada Tutor…"');
  const no = ada.querySelector('[data-do="job-request-answer"]:not([data-yes="1"])');
  if (no) {
    no.click();
    await wait(50);
    const form = ada.querySelector('form.req-why');
    if (!form) bad.push('Decline did not open a line for why, in place');
    else {
      form.querySelector('input').value = 'Away that week';
      form.querySelector('button').click();
      await wait(200);
      const post = sent.find(x => x.action === 'answerRequest');
      if (!post || post.yes || post.reason !== 'Away that week' || post.jobId !== 'J-R') bad.push('the decline posted ' + JSON.stringify(post));
    }
  }
  t.USER({ name: 'Nia Other', personId: 'P5', role: 'tutor', roles: ['tutor'] });
  if (labels(host(t.jobPage(job)))) bad.push('a tutor who was not asked sees the request tiles');
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const pat = host(t.jobPage(job));
  if (labels(pat)) bad.push('the family sees the tutor\'s Accept/Decline tiles');
  if (!/Waiting for Ada Tutor/.test(pat.textContent)) bad.push('the family does not read "Waiting for Ada Tutor…"');
  const declined = Object.assign({}, job, { tutorSlots: [], events: [{ actor: 'Ada Tutor', role: 'tutor', action: 'Decline', target: 'Ada Tutor', message: 'Away that week' }] });
  if (!/Declined by Ada Tutor: .Away that week/.test(host(t.jobPage(declined)).textContent)) bad.push('the family does not read the decline and its reason');
  t.USER({ name: 'Hal Admin', personId: 'P9', role: 'admin', roles: ['admin'] });
  if (labels(host(t.jobPage(job))) !== 'yes,no') bad.push('the admin does not get the request tiles');
  return bad;
});

/* ---------- A ROOM ALREADY BOOKED IS GREYED ON THE GRID (434) ---------- */
check('a room already booked at an hour greys that hour on the grid, for that room only', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof w.slotGrid !== 'function' || typeof w.spaceFor !== 'function') return ['slotGrid / spaceFor are not reachable, so this was NOT checked — not a pass'];
  const D = t.DATA();
  const cw = (D.venues || []).find(v => v.title === 'Colliers Wood Library');
  if (!cw) return ['the flow payload has no Colliers Wood Library, so nothing was asked'];
  /* TWO ROOMS AS doGet SENDS THEM, the first holding a two-hour booking (`spaceBusy`, booking.gs). */
  const room = (name, busy) => ({ rowIndex: 2, name, rate: 15, concession: 0, min: 1, max: 4, notes: '', avail: {}, busy, fields: {} });
  cw.rooms = [room('Small room 1', { m16: 'Maths', m17: 'Maths' }), room('Small room 2', {})];
  const B = t.BOOKING;
  B.tutor = 'No preference'; B.slots = [];
  const bad = [];
  const cell = (loc, code) => { B.loc = loc; return w.slotGrid().rows.flatMap(r => r.hours).find(h => h.code === code) || {}; };
  const r1 = 'Colliers Wood Library — ' + cw.rooms[0].name, r2 = 'Colliers Wood Library — ' + cw.rooms[1].name;
  ['m16', 'm17'].forEach(c => {
    const h = cell(r1, c);
    if (h.open || h.why !== 'room booked') bad.push(r1 + ' at ' + c + ' is ' + (h.open ? 'open' : 'shut') + ' saying "' + (h.why || '') + '", wanted shut saying "room booked"');
  });
  if (!cell(r1, 'm18').open) bad.push(r1 + ' at m18 (not booked) is shut');
  if (!cell(r2, 'm16').open) bad.push(r2 + ' at m16 is shut — only ' + cw.rooms[0].name + ' is booked then');
  return bad;
});

/* ---------- A CLIENT'S HOUSE KEEPS NO HOURS (445): its grid is the tutor's ---------- */
check('with Client House chosen the week grid is open every hour — the house keeps no hours, and the tutor\'s are a guide (445, 488)', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof w.slotGrid !== 'function') return ['slotGrid is not reachable, so this was NOT checked — not a pass'];
  const D = t.DATA();
  D.tutors = [{ title: 'Ada Hours', rate: 14, teaches: ['Maths (GCSE)'], listed: true, avail: { m16: 'TRUE', m17: 'TRUE', sa10: 'TRUE' } }];
  /* THE ROW AS THE SHEET HAD IT: one stray Wednesday hour, which used to be read as the house's only opening. */
  D.venues = (D.venues || []).filter(v => v.title !== 'Client House').concat([{ title: 'Client House', bestRate: 0, avail: { w15: true } }]);
  const B = t.BOOKING;
  B.tutor = 'Ada Hours'; B.slots = []; B.loc = 'Client House';
  const g = w.slotGrid();
  const all = g.rows.flatMap(r => r.hours), shut = all.filter(h => !h.open).map(h => h.code);
  const bad = [];
  if (shut.length) bad.push('at Client House these hours are shut: [' + shut.slice(0, 8).join(',') + '] — "' + g.why + '"');
  if (g.why) bad.push('an open grid explains itself: "' + g.why + '"');
  return bad;
});

/* ---------- THE TIMETABLE IS ITS OWN WEEK, ON YOUR ACCOUNT, AND NO BOOKING IS SYNCED INTO IT (466) ---------- */
check('466: the timetable holds only its own lessons — a booked session is not drawn in it — is saved to your account, and Your week is gone', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.initTimetable !== 'function' || typeof t.tmtKey !== 'function') {
    return ['the timetable is not reachable, so this was NOT checked — not a pass'];
  }
  const bad = [];
  const mon = w.mondayOf_(new Date());
  const at = n => { const x = new Date(mon); x.setDate(x.getDate() + n); return x; };
  const dmy = x => String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '/' + x.getFullYear();
  const D = t.DATA();
  D.liveJobs = D.jobs = [
    { id: 'J-MON', jobId: 'J-MON', subject: 'Physics', location: 'Mitcham library', day: 'Monday, Saturday',
      time: '10:00', hours: 2, client: 'Sam Student', tutor: 'GeorgePovey', status: 'active', slots: [],
      dates: [at(0), at(5), at(7)].map(dmy).join(', ') },
    { id: 'J-ELSE', jobId: 'J-ELSE', subject: 'Chemistry', day: 'Monday', time: '12:00', hours: 1,
      client: 'Somebody Else', tutor: 'Sasha Matola', status: 'active', slots: [], dates: dmy(at(0)) },
  ];
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'], token: 'tk' };
  /* A WEEK ALREADY ON THIS PHONE under Sam's key, from before it was kept on the account. */
  w.localStorage.setItem('tmt:u:P9', JSON.stringify({ weekend: false,
    days: [[{ id: 'L1', at: '09:00', subject: 'Maths', note: '' }, { id: 'L2', at: '13:00', subject: 'Art', note: '' }], [], [], [], [], [], []] }));
  t.USER(sam);
  try { t.findGroup('Tools', 'timetable'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 40 && !d.querySelector('.tmt-box'); n++) await wait(50);
  if (d.querySelector('#week-body')) bad.push('`Your week` is still a widget on the Tools column — it is folded into the Timetable');
  const box = () => d.querySelector('.tmt-box');
  if (!box()) return bad.concat('the timetable did not draw on the Tools column');
  const chip = d.createElement('button'); chip.setAttribute('data-day', '0');
  t.ACTIONS['tmt-day'](chip);
  const list = () => [...box().querySelectorAll('.tmt-list > *')].map(r =>
    (r.classList.contains('is-booked') ? 'BOOKED ' : '') + r.querySelector('.tmt-at').textContent.trim() + ' '
    + r.querySelector('.tmt-sub').textContent.trim());
  const got = list().join(', ');
  if (got !== '09:00 Maths, 13:00 Art') {
    bad.push('Monday reads [' + got + '], wanted [09:00 Maths, 13:00 Art] — the phone\'s week carried up and no booked session synced into it (466)');
  }
  if (box().querySelector('.tmt-row.is-booked, [data-id="J-MON"]')) bad.push('a booked session is drawn in the timetable — nothing syncs into it (466)');
  if (box().querySelectorAll('.tmt-day').length !== 5) bad.push('a session on Saturday opened the weekend: ' + box().querySelectorAll('.tmt-day').length + ' day chips, wanted 5 — only the Weekend box does (466)');
  /* THE ACCOUNT. The carry-up wrote USER.timetable; give the debounce time and look at the wire. */
  await wait(1100);
  const save = sent.filter(x => x.action === 'saveTimetable').pop();
  if (!save) bad.push('the week on this phone was not carried up to the account (no saveTimetable sent)');
  else {
    let shape = null; try { shape = JSON.parse(save.timetable); } catch (e) {}
    if (save.personId !== 'P9' || !shape || !Array.isArray(shape.days) || shape.days.length !== 7) {
      bad.push('saveTimetable carried ' + JSON.stringify({ personId: save.personId, days: shape && shape.days && shape.days.length }));
    }
    if (shape && JSON.stringify(shape).indexOf('J-MON') !== -1) bad.push('the booked session was SAVED into the timetable — a copy of a booking goes stale');
  }
  /* A LESSON TYPED WHILE SIGNED IN IS SENT. */
  sent.length = 0;
  t.ACTIONS['tmt-add'](d.createElement('button'));
  const sub = box().querySelector('.tmt-in[data-f="subject"]');
  if (sub) { sub.value = 'Latin'; sub.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await wait(1100);
  const typed = sent.filter(x => x.action === 'saveTimetable').pop();
  if (!typed || !/Latin/.test(typed.timetable || '')) bad.push('a lesson typed while signed in was not saved to the account');
  /* ANOTHER PHONE: nothing on the device, the week on the account. */
  w.localStorage.removeItem('tmt:u:P9');
  const onAccount = JSON.stringify({ weekend: false, days: [[{ id: 'L9', at: '15:00', subject: 'Greek', note: '' }], [], [], [], [], [], []] });
  t.USER(Object.assign({}, sam, { timetable: onAccount }));
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 40 && !(box() && /Greek/.test(box().textContent)); n++) await wait(50);   /* Find fills its card after the paint (790) */
  if (!box()) return bad.concat(['the repaint left no timetable on Find']);
  if (!/Greek/.test(box().textContent) || /Maths/.test(box().textContent)) bad.push('a phone with nothing on it did not draw the week kept on the account');
  /* SIGNED OUT: the device's own, under the bare key, and nothing is sent. */
  /* SIGNED OUT, Find is not offered (400, 790): a visitor reaches no timetable, so the device-only half is asked only when one is still drawn. */
  t.USER(null);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 40 && !box(); n++) await wait(50);
  if (!box()) return bad;
  sent.length = 0;
  w.localStorage.removeItem('tmt');
  t.ACTIONS['tmt-add'](d.createElement('button'));
  const sub2 = box().querySelector('.tmt-in[data-f="subject"]');
  if (sub2) { sub2.value = 'Music'; sub2.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await wait(1100);
  if (sent.some(x => x.action === 'saveTimetable')) bad.push('signed out, the timetable was posted to the server');
  if (!/Music/.test(w.localStorage.getItem('tmt') || '')) bad.push('signed out, the timetable was not kept on the device');
  if (box().querySelector('.tmt-row.is-booked')) bad.push('signed out, somebody\'s booked session is drawn');
  return bad;
});

/* ---------- A BANK HOLIDAY IS NOT A SESSION, AND IS NOT CHARGED FOR § */
check('a closed day inside a term is stepped over, and the price counts the sessions that run', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof w.computeSessionDates !== 'function' || typeof w.priceFrom !== 'function') {
    return ['computeSessionDates / priceFrom are not reachable, so closures were NOT checked — not a pass'];
  }
  const mon = w.mondayOf_(new Date()); mon.setDate(mon.getDate() + 28);
  const at = n => { const d = new Date(mon); d.setDate(d.getDate() + n); return d; };
  const dmy = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const win = { startDate: dmy(at(-14)), lastSun: dmy(at(20)) };
  const spec = { subjects: ['Maths'], level: 'GCSE', n: 1, hours: 1, hoursPerWeek: 1, day: 'Monday',
                 runs: [{ dayName: 'Monday', day: 'm', hours: 1 }], windows: [win], tutor: '' };
  const D = t.DATA();
  D.closures = [];
  const open = w.priceFrom(spec);
  D.closures = [{ date: dmy(mon), name: 'Early May bank holiday', kind: 'bank' }];
  const shut = w.priceFrom(spec);
  const bad = [];
  const list = L => (L.sessionDates || []).map(dmy).join(', ');
  if ((open.sessionDates || []).length !== 5) bad.push('with nothing closed the window holds ' + (open.sessionDates || []).length + ' Mondays, wanted 5: ' + list(open));
  if ((shut.sessionDates || []).length !== 4 || list(shut).indexOf(dmy(mon)) !== -1) {
    bad.push('with ' + dmy(mon) + ' closed the dates are [' + list(shut) + '] — the bank holiday is still a session');
  }
  if (shut.weeksBooked !== 4) bad.push('the price counts ' + shut.weeksBooked + ' sessions, wanted 4');
  if (!(shut.total > 0) || Math.abs(shut.total * 5 - open.total * 4) > 0.05 * open.total) {
    bad.push('the total did not follow the count: ' + open.total + ' for 5 sessions, ' + shut.total + ' for 4');
  }
  return bad;
});

/* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT IS THE TUTOR'S OWN, ELSE THE CONFIG DEFAULT (docs/history/345) § */
check('the business\'s cut of an extra seat is the tutor\'s own when set and the config default when blank — on the card, in the quote and in the split; nought is nought', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.priceFrom !== 'function' || typeof w.profSeat_ !== 'function' || typeof w.findCard !== 'function') {
    return ['priceFrom / profSeat_ / findCard are not reachable, so the cut was NOT checked — not a pass'];
  }
  const D = t.DATA();
  D.constants = D.constants || {};
  D.constants.vars = Object.assign({}, D.constants.vars || {}, { c: 0.3, B: 0.1 });
  D.closures = [];
  D.promotions = [];
  const ada = (D.tutors || []).find(x => x && x.personId) || {};
  const mk = (title, more) => Object.assign({}, ada, { title, personId: 'P-' + title.replace(/\W/g, ''), rate: 30, extraSeat: 0.5 }, more);
  const rows = { blank: mk('Cut Blank', { extraSeatCut: '' }), old: mk('Cut Older', {}), own: mk('Cut Own', { extraSeatCut: 0.2 }),
                 none: mk('Cut None', { extraSeatCut: 0 }), usual: mk('Cut Usual', { extraSeat: 0, extraSeatCut: '' }) };
  delete rows.old.extraSeatCut;
  D.tutors = Object.keys(rows).map(k => rows[k]).concat(D.tutors || []);
  const mon = w.mondayOf_(new Date()); mon.setDate(mon.getDate() + 28);
  const at = n => { const x = new Date(mon); x.setDate(x.getDate() + n); return x; };
  const dmy = x => String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '/' + x.getFullYear();
  const win = { startDate: dmy(at(-14)), lastSun: dmy(at(20)) };
  const quote = k => w.priceFrom({ subjects: ['Maths'], level: 'GCSE', n: 2, hours: 1, hoursPerWeek: 1, day: 'Monday',
    runs: [{ dayName: 'Monday', day: 'm', hours: 1 }], windows: [win], tutor: rows[k].title });
  const bad = [];
  const near = (a, b) => Math.abs(a - b) < 0.005;
  /* WHAT EACH ONE SHOULD BE: the tutor's share c and the business's b, of the rate, for one extra seat. */
  const WANT = { blank: [0.5, 0.1], old: [0.5, 0.1], own: [0.5, 0.2], none: [0.5, 0], usual: [0.3, 0.1] };
  const got = {};
  Object.keys(WANT).forEach(k => {
    const [c, b] = WANT[k], share = c + b;
    const L = got[k] = quote(k);
    if (!(L.hoursTotal > 0) || !(L.total > 0)) { bad.push(k + ': the quote has no hours or no total (' + L.hoursTotal + ', ' + L.total + '), so its split was NOT checked'); return; }
    /* THE CARD: the number to the right of the rate, by the function and as drawn. */
    const seat = w.profSeat_(rows[k]);
    if (!near(seat, 30 * share)) bad.push(k + ': the card\'s seat is £' + seat + '/h, wanted £' + (30 * share).toFixed(2) + ' (30 × (' + c + ' + ' + b + '))');
    const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row: rows[k] });
    /* THE RANGE REPLACED THE "+£x/h a seat" NOTE (549): the card draws rateRange_, and no note beside it. */
    const said = ((box.querySelector('.prof-rate') || {}).textContent || '').trim();
    if (said !== w.rateRange_(rows[k])) bad.push(k + ': the card draws "' + said + '", wanted "' + w.rateRange_(rows[k]) + '"');
    if (box.querySelector('.prof-seat')) bad.push(k + ': the card still draws the "+£x/h a seat" note beside the range');
    /* THE QUOTE: one extra seat adds `share` of the hourly figure. */
    if (!near(L.fChildrenAll, 1 + share)) bad.push(k + ': the quote\'s seat multiplier is ' + L.fChildrenAll + ', wanted ' + (1 + share));
    /* THE SPLIT: the seat money goes c : b, and the two add to what is paid (no venue, nobody sharing). */
    const unit = L.R * L.discountFactor * L.promoAdj * L.hoursTotal;
    const seatMoney = unit * (L.fChildrenAll - 1);
    if (!near(L.profitTotal, seatMoney * b / share)) bad.push(k + ': the business keeps £' + L.profitTotal.toFixed(2) + ' of the seat, wanted £' + (seatMoney * b / share).toFixed(2) + ' (' + b + ' of ' + share + ')');
    if (!near(L.tutorPay, unit + seatMoney * c / share)) bad.push(k + ': the tutor is paid £' + L.tutorPay.toFixed(2) + ', wanted £' + (unit + seatMoney * c / share).toFixed(2));
    if (!near(L.tutorPay + L.profitTotal, L.total)) bad.push(k + ': the tutor\'s £' + L.tutorPay.toFixed(2) + ' and the business\'s £' + L.profitTotal.toFixed(2) + ' do not add to the £' + L.total.toFixed(2) + ' paid');
  });
  /* BLANK AND AN OLDER BACKEND ARE ONE PRICE — exactly as every tutor was priced before the column existed. */
  if (got.blank && got.old && ['total', 'tutorPay', 'profitTotal', 'fChildrenAll'].some(f => got.blank[f] !== got.old[f])) {
    bad.push('a blank cut and no key at all are priced differently: ' + JSON.stringify([got.blank.total, got.old.total, got.blank.profitTotal, got.old.profitTotal]));
  }
  /* NOUGHT IS NOUGHT: nothing for the business, the whole seat for the tutor — not the default. */
  if (got.none && got.none.profitTotal !== 0) bad.push('a cut of nought still keeps £' + got.none.profitTotal + ' for the business');
  /* AND THE ADMIN'S LINE SAYS WHERE THE CUT CAME FROM — their own, or the default. */
  if (got.own && !/their cut 0\.2/.test(got.own.seatSource || '')) bad.push('the breakdown\'s source for a tutor\'s own cut reads "' + (got.own && got.own.seatSource) + '"');
  if (got.blank && !/\+ B 0\.1/.test(got.blank.seatSource || '')) bad.push('the breakdown\'s source for a blank cut reads "' + (got.blank && got.blank.seatSource) + '"');
  return bad;
});

/* ---------- A TUTOR'S RATE IS SHOWN AS A RANGE, ONE SEAT TO A FULL CLASS (549) ---------- */
check('a tutor\'s rate shows as £first-seat–£full-class/hour on the profile card and the shared picture, and booking\'s tutor choice is the name alone', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.rateRange_ !== 'function' || typeof w.findCard !== 'function' || !t.STEPS) return ['rateRange_ / findCard / BOOK_STEPS not reachable — NOT checked'];
  const D = t.DATA();
  D.constants = D.constants || {};
  D.constants.vars = Object.assign({}, D.constants.vars || {}, { c: 0.2, B: 0.1 });
  const base = (D.tutors || []).find(x => x && x.personId) || {};
  const mk = (title, more) => Object.assign({}, base, { title, personId: 'P-' + title.replace(/\W/g, ''), listed: true, rate: 10, extraSeat: 0.2, extraSeatCut: 0.1, maxStudents: 4 }, more);
  const rows = { four: mk('Range Four', {}), one: mk('Range One', { maxStudents: 1 }), none: mk('Range None', { maxStudents: '' }), free: mk('Range Free', { rate: '' }) };
  const bad = [];
  const WANT = { four: '£10.00–19.00/hour', one: '£10.00/hour', none: '£10.00/hour', free: '' };
  Object.keys(WANT).forEach(k => { const g = w.rateRange_(rows[k]); if (g !== WANT[k]) bad.push(k + ': rateRange_ says "' + g + '", wanted "' + WANT[k] + '"'); });
  const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row: rows.four });
  const card = ((box.querySelector('.prof-rate') || {}).textContent || '').trim();
  if (card !== '£10.00–19.00/hour') bad.push('the profile card draws "' + card + '", wanted "£10–19/hour"');
  if (typeof w.tpngRate_ === 'function' && w.tpngRate_(rows.four) !== '£10.00–19.00/hour') bad.push('the shared picture says "' + w.tpngRate_(rows.four) + '"');
  D.tutors = [rows.four, rows.one].concat(D.tutors || []);
  const st = t.STEPS.find(s => s.id === 'tutor');
  const said = st && st.label_ ? st.label_('Range Four') : '';
  /* THE BOOKING'S TUTOR CHOICE IS THE NAME ALONE (owner, 7 Nov): the price columns say what a tutor adds. */
  if (said !== 'Range Four') bad.push('booking\'s tutor choice says "' + said + '", wanted the name alone');
  return bad;
});

