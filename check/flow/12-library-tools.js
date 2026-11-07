/* ---------- PROGRESS IN A FIELD: A CARD PER SERIES, A LINE PER PAPER, OPENED IN PLACE AND NEVER IN A POP-UP ---------- */
check('progress, papers: one card per series, one line per paper with its marks and what is left, a line opened in place (no sheet) that stays open through a redraw, and a count of papers not started', async () => {
  const { w, t, d } = await progPopulated_();
  if (!w) return ['the learner is not signed in — NOT checked'];
  const bad = [];
  const past = progCard_(d, 'Maths past papers'), ws = progCard_(d, '1st Class Maths worksheets');
  if (!past) return ['no "Maths past papers" card: ' + [...d.querySelectorAll('#s-account .card h3')].map(h => h.textContent).join(' | ')];
  if (!ws) bad.push('no "1st Class Maths worksheets" card');
  const line = past.querySelector('details.prog-paper');
  const sum = line && line.querySelector('summary');
  if (!sum || !/Paper 1H — June 2024\s*2\/5 marks · 1 left/.test(progTxt_(sum))) bad.push('the past paper line reads ' + JSON.stringify(progTxt_(sum)) + ', wanted "Paper 1H — June 2024 · 2/5 marks · 1 left"');
  if (line && line.open) bad.push('the paper line is open before anybody opened it');
  if (ws && !/Not started\s*1/.test(progTxt_(ws))) bad.push('the worksheet series does not count its one sibling not started: ' + progTxt_(ws));
  if (line) {
    line.open = true;
    line.dispatchEvent(new w.Event('toggle'));
    await wait(50);
    const qs = [...line.querySelectorAll('.prog-qs .row')].map(progRow_);
    if (qs.join(' | ') !== 'Q1 right | Q2 wrong | Q3 1/3 | Q4 not done') bad.push('opened, the paper lists ' + JSON.stringify(qs) + ', wanted Q1 right, Q2 wrong, Q3 1/3, Q4 not done');
    if (sheetOpen_(d)) bad.push('opening a paper opened a sheet — it opens in place');
    w.paint('account');
    const again = progCard_(d, 'Maths past papers');
    const l2 = again && again.querySelector('details.prog-paper');
    if (!l2 || !l2.open) bad.push('a redraw shut the paper that was open');
  }
  if (d.querySelector('#s-account .prog-w select, #s-account .prog-w [role="menu"], #s-account .prog-w [aria-haspopup]')) bad.push('a progress widget has a pop-up menu on it');
  t.USER(null);
  return bad;
});

/* ---------- GRADE ESTIMATE ---------- */
check('progress, grade estimate: a GCSE grade from the share of marks on past papers and a "working at" grade from graded worksheets, each with how many papers, said as an estimate', async () => {
  const { w, t, d } = await progPopulated_();
  if (!w) return ['the learner is not signed in — NOT checked'];
  const bad = [];
  const g = progCard_(d, 'Grade estimate');
  if (!g || g.classList.contains('is-empty')) return ['the Grade estimate widget is empty with a past paper and a worksheet marked'];
  const tx = progTxt_(g);
  /* 2 OF 5 ON THE PAST PAPER IS 40%: grade 5 by PROG_GCSE_STEPS. The grade 4 worksheet all right is "working at grade 4". */
  if (!/Maths GCSE\s*grade 5\s*from 1 paper, 40% of marks/.test(tx)) bad.push('the GCSE line reads ' + JSON.stringify(tx));
  if (!/Maths worksheets\s*working at grade 4\s*from 1 paper, 100% of marks/.test(tx)) bad.push('the worksheet line reads ' + JSON.stringify(tx));
  if (!/estimate/i.test(tx)) bad.push('the card does not say it is an estimate');
  t.USER(null);
  return bad;
});

/* ---------- A TOOLS WIDGET, ON ITS OWN PAGE, THE WAY A SWIPE ARRIVES (466): its box once drawn, or null ---------- */
async function toolBox_(w, id, sel) {
  const t = w.__t, d = w.document;
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  const n = w.widgetsOf_('tool').findIndex(x => String(x.id) === id);
  if (n < 0) return null;
  t.findPage(n, true);
  await wait(LEAVE_MS); await woken_();
  for (let i = 0; i < 40 && !d.querySelector('#s-stuff ' + sel); i++) await wait(50);
  return d.querySelector('#s-stuff ' + sel);
}

/* ---------- COUNTDOWNS ---------- */
check('466: countdowns are a Tools widget for everyone — a Year 11\'s GCSEs and the next holiday, one line each; the config tab moves the exam and the sheet\'s holiday row wins over the defaults; signed out, the holiday alone; none on Student settings', async () => {
  const day = d0 => { const x = new Date(); x.setHours(0, 0, 0, 0); return Math.round((d0 - x) / 864e5); };
  const now = new Date();
  /* A BIRTHDAY THAT MAKES YEAR 11 NOW: 15 on the 1st of September this school year began. */
  const began = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const dob = (began - 15) + '-03-01';
  const gcse = new Date(began + 1, 4, 4);
  const hol = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9);
  const dmy = x => String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '/' + x.getFullYear();
  const p = payload();
  p.constants.vars.exam_gcse_start = (began + 1) + '-05-04';
  p.intervals = p.intervals.concat([{ rel: 'Next', term: 'Half term', label: 'Half term', kind: 'holiday', startDate: dmy(hol), endDate: dmy(new Date(hol.getTime() + 6 * 864e5)) }]);
  const U = Object.assign({}, ANS_ADA, { profile: { date_of_birth: dob } });
  const { w } = boot({ payload: p, before: signedInAs_(U) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const t = w.__t, d = w.document;
  if (!t || !t.whoami()) return ['the learner is not signed in — NOT checked'];
  t.USER(Object.assign({}, t.whoami(), { profile: { date_of_birth: dob } }));
  const bad = [];
  let c = await toolBox_(w, 'countdowns', '.cd-box');
  if (!c) return ['the Countdowns widget did not draw on Tools — NOT checked'];
  t.go('account', false, true); await wait(LEAVE_MS); await woken_(); w.paint('account');
  if (progCard_(d, 'Countdowns') || /Countdowns/.test((d.getElementById('s-account') || {}).textContent || '')) bad.push('Countdowns is still on Student settings — one home, Tools (466)');
  c = (await toolBox_(w, 'countdowns', '.cd-box')) || c;   /* Find draws its card afresh on the way back (790) */
  const rows = c ? [...c.querySelectorAll('.row')].map(progRow_) : [];
  const want = ['GCSE exams ' + day(gcse) + ' days', 'Half term ' + day(hol) + ' days'];
  if (rows.join(' | ') !== want.join(' | ')) bad.push('Countdowns reads ' + JSON.stringify(rows) + ', wanted ' + JSON.stringify(want));
  if (c && c.querySelector('.prog-sum, .prog-big, [data-do]')) bad.push('Countdowns has a box grid or a control on it');
  /* NO ROW IN THE SHEET AND NO CONFIG: the built-in exam date and the next default holiday. */
  t.DATA().intervals = [];
  delete t.DATA().constants.vars.exam_gcse_start;
  w.paintCountdowns_();
  c = d.querySelector('#s-stuff .cd-box') || c;
  const rows2 = [...c.querySelectorAll('.row')].map(progRow_);
  if (!/^GCSE exams \d+ days$/.test(rows2[0] || '') || rows2[0] === want[0]) bad.push('with the config cleared the GCSE line reads ' + JSON.stringify(rows2[0]) + ' — wanted the built-in 11 May, not the override');
  if (!/(half-term|holidays) (\d+ days?|today)$/.test(rows2[1] || '')) bad.push('with no holiday row the holiday line reads ' + JSON.stringify(rows2[1]) + ' — wanted a default holiday');
  t.USER(null);
  w.paintCountdowns_();
  c = d.querySelector('#s-stuff .cd-box') || c;
  /* SIGNED OUT (466): everyone has the widget — the holiday needs no account, the exam does. */
  const rows3 = [...c.querySelectorAll('.row')].map(progRow_);
  if (rows3.length !== 1 || !/(half-term|holidays) (\d+ days?|today)$/.test(rows3[0] || '')) bad.push('signed out, Countdowns reads ' + JSON.stringify(rows3) + ' — wanted the next holiday alone');
  return bad;
});


/* ---------- THE E-INK SCREEN (470): THE WIDGET IS THE SCREEN ---------- */
check('470, 482, 499: the E-ink screen on Tools is the real 200x200 panel — Today\'s date for everyone, Bible verses and Icons for an admin alone by a native select, Back/Next/Shuffle in place, the choice kept per person, and no tile opens another window', async () => {
  const EV = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'eink-verses.json'), 'utf8'));
  const IC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'icons.json'), 'utf8'));
  const EF = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'eink-fonts.json'), 'utf8'));
  const { w } = boot({ payload: payload(), serve: u => (/data\/eink-verses\.json/.test(u) ? EV : /data\/icons\.json/.test(u) ? IC : /data\/eink-fonts\.json/.test(u) ? EF : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  if (t.whoami()) return ['meant to start signed out — NOT checked'];
  const bad = [];
  const box = await toolBox_(w, 'verse', '.eink-box');
  if (!box) return ['signed out, Tools has no E-ink screen widget — the owner: "the person" designs their screen (470)'];
  for (let i = 0; i < 40 && !box.querySelector('.eink-panel canvas'); i++) await wait(50);
  const tile = a => box.querySelector('.tile[data-do="' + a + '"]');
  const pick = async m => { const sel = box.querySelector('select.eink-pick'); if (!sel) return false; sel.value = m; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(60); return sel.value === m; };
  const press = async el => { if (!el) return; el.click(); await wait(60); };
  const shown = () => (box.querySelector('.eink-panel') || {}).textContent || '';
  if (!box.querySelector('.eink .eink-panel')) bad.push('the widget draws no screen of its own');
  /* THE REAL PANEL (482): a 200x200 canvas the screen's own layout fills — every verse inside it, the reference under the rule. */
  const cv = box.querySelector('.eink-panel canvas.eink-px');
  if (!cv || cv.width !== 200 || cv.height !== 200) bad.push('the widget is not the 200x200 panel the owner\'s screen has: ' + (cv ? cv.width + 'x' + cv.height : 'no canvas'));
  if (typeof w.einkPage_ !== 'function') bad.push('no einkPage_ to draw the screen\'s pixels');
  else EV.forEach((v, i) => {
    const px = w.einkPage_('verse', v, null); if (!px || px.length !== 40000) { bad.push(v.ref + ': no 200x200 page'); return; }
    let ink = 0, top = 200, low = 0; for (let k = 0; k < px.length; k++) if (px[k]) { ink++; const y = Math.floor(k / 200); if (y < 176) { top = Math.min(top, y); low = Math.max(low, y); } }
    if (ink < 300 || top < 2 || low >= 176) bad.push(v.ref + ': the verse does not sit inside the panel above the rule (rows ' + top + '-' + low + ')');
  });
  /* TODAY'S DATE (499): signed out, the one choice; verses and icons are religious, an admin's alone. */
  const opts = () => [...box.querySelectorAll('select.eink-pick option')].map(o => o.value).join(' ');
  if (opts() !== 'date') bad.push('signed out, the select offers ' + JSON.stringify(opts()) + ' — Today\'s date alone');
  const today = new w.Date();
  if (shown().indexOf(String(today.getFullYear())) < 0 || shown().indexOf(today.toLocaleDateString('en-GB', { month: 'long' })) < 0) bad.push('the date mode does not say today: ' + JSON.stringify(shown().slice(0, 80)));
  if (box.querySelector('.eink-verse') || tile('eink-step') || tile('eink-shuffle')) bad.push('signed out, a verse or Back/Next/Shuffle is shown');
  const dp = w.einkPage_ && w.einkPage_('date', { wd: 3, d: 28, mo: 9, y: 2026 }, null);
  let dink = 0; if (dp) for (let k = 0; k < dp.length; k++) dink += dp[k];
  if (!dp || dink < 800) bad.push('the date page draws ' + dink + ' dots — nothing like a weekday, a big 28, a month and a year');
  await pick('verse');
  if (box.querySelector('.eink-verse')) bad.push('a forged change to Bible verses worked signed out');
  t.USER({ name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  w.paintEink_();
  if (opts() !== 'date verse icon') bad.push('an admin\'s select offers ' + JSON.stringify(opts()) + ' — date, verse, icon');
  await pick('verse');
  if (!box.querySelector('.eink-verse') || shown().indexOf(EV[0].ref) < 0) bad.push('Verse mode does not show the first verse, ' + EV[0].ref + ': ' + JSON.stringify(shown().slice(0, 80)));
  if (box.querySelector('.eink-icon')) bad.push('Verse mode also draws an icon — it is one or the other');
  for (const a of ['eink-step', 'eink-shuffle', 'eink-sync']) if (!tile(a)) bad.push('no ' + a + ' tile');
  await press(box.querySelector('.tile[data-do="eink-step"][data-d="1"]'));
  if (shown().indexOf(EV[1].ref) < 0) bad.push('Next did not move to ' + EV[1].ref);
  await pick('icon');
  if (!box.querySelector('.eink-icon') || shown().indexOf(IC[0].title) < 0) bad.push('Icon mode does not show the first icon, ' + IC[0].title + ', with its name');
  if (box.querySelector('.eink-verse')) bad.push('Icon mode still shows a verse');
  await press(box.querySelector('.tile[data-do="eink-step"][data-d="-1"]'));
  if (shown().indexOf(IC[IC.length - 1].title) < 0) bad.push('Back from the first icon did not wrap to the last, ' + IC[IC.length - 1].title);
  let kept = {};
  try { kept = JSON.parse(w.localStorage.getItem('eink:pick') || '{}'); } catch (e) {}
  if (kept.mode !== 'icon' || kept.icon !== IC.length - 1 || kept.verse !== 1) bad.push('the choice is not kept for this person: ' + JSON.stringify(kept));
  const before = shown();
  await press(tile('eink-shuffle'));
  if (shown() === before) bad.push('Shuffle did not change the icon');
  if (box.querySelector('a[target="_blank"], a[href]')) bad.push('a tile in the widget leaves the page — the owner: "I do not want that at all. Keep it in the widget."');
  /* SYNC WITHOUT WEB SERIAL: a sentence in the widget, no page opened. */
  let opened = 0; w.open = () => { opened++; return null; };
  try { delete w.navigator.serial; } catch (e) {}
  await press(tile('eink-sync')); await wait(100);
  if (opened) bad.push('Sync opened a window');
  if (!/Chrome or Edge/.test((box.querySelector('.eink-say') || {}).textContent || '')) bad.push('Sync with no Web Serial says nothing in the widget');
  /* SYNC (482, 485): not listed -> press ⏻; READY then OK -> done; silent -> "didn't answer" + Details; other text -> old software. A fresh port each time, DTR on, RTS off. */
  const say = () => (box.querySelector('.eink-say') || {}).textContent || '';
  const details = () => (box.querySelector('.eink-details') || {}).textContent || '';
  const SIG = [];
  const fakePort = answer => ({ readable: null, writable: null, getInfo: () => ({ usbVendorId: 0x303a, usbProductId: 0x1001 }),
    setSignals(o) { SIG.push(o); return Promise.resolve(); }, open() {
      let push; const sent = [];
      const reply = t => { if (push) { const p = push; push = null; p({ value: new TextEncoder().encode(t) }); } };
      this.readable = { getReader: () => ({ read: () => new Promise(r => { push = r; }), cancel: () => { if (push) push({ done: true }); }, releaseLock() {} }) };
      this.writable = { getWriter: () => ({ write: async b => { const t = new TextDecoder().decode(b); sent.push(t);
        if (answer === 'new') reply(/HELLO/.test(t) ? 'READY epaper-verse 482\r\n' : /SHOW/.test(t) ? 'OK\r\n' : '');
        else if (answer === 'old') reply('verse v1\r\n'); }, releaseLock() {} }) };
      return Promise.resolve(); }, close: () => Promise.resolve() });
  if (!w.TextDecoder) { w.TextDecoder = TextDecoder; w.TextEncoder = TextEncoder; }   // jsdom has neither; every browser with Web Serial has both
  let asked = 0;
  const serial = f => { try { Object.defineProperty(w.navigator, 'serial', { value: { requestPort: o => { asked++; return f(o); } }, configurable: true }); } catch (e) {} };
  serial(() => Promise.reject(new Error('none')));
  await wait(360); await press(tile('eink-sync')); await wait(100);
  if (!/press ⏻/.test(say())) bad.push('a screen not in the list does not say "press ⏻ once": ' + JSON.stringify(say()));
  serial(() => Promise.resolve(fakePort('new'))); asked = 0; SIG.length = 0;
  await wait(360); await press(tile('eink-sync')); for (let i = 0; i < 60 && !/Done/.test(say()); i++) await wait(100);
  if (!/Done — the screen is updating/.test(say())) bad.push('a screen that answers READY then OK does not say Done: ' + JSON.stringify(say()));
  if (!SIG.some(o => o.dataTerminalReady === true && o.requestToSend === false)) bad.push('Sync does not set DTR on and RTS off after opening: ' + JSON.stringify(SIG));
  if (!/303a:1001/.test(details()) || !/READY/.test(details())) bad.push('the Details line does not show the USB id and what came back: ' + JSON.stringify(details()));
  await wait(360); await press(tile('eink-sync')); for (let i = 0; i < 60 && !/Done/.test(say()); i++) await wait(100);
  if (asked !== 2) bad.push('Sync reused a port instead of asking Chrome each time: asked ' + asked);
  serial(() => Promise.resolve(fakePort('')));
  await wait(360); await press(tile('eink-sync')); for (let i = 0; i < 150 && !/didn’t answer/.test(say()); i++) await wait(100);
  if (!/The screen didn’t answer — unplug it, plug it back in/.test(say())) bad.push('a silent screen does not say it did not answer, with one step: ' + JSON.stringify(say()));
  if (/old software/.test(say())) bad.push('a silent screen is called old software');
  if (!/heard nothing/.test(details())) bad.push('a silent screen has no "heard nothing" Details line: ' + JSON.stringify(details()));
  serial(() => Promise.resolve(fakePort('old')));
  await wait(360); await press(tile('eink-sync')); for (let i = 0; i < 150 && !/old software/.test(say()); i++) await wait(100);
  if (!/old software — tap Install/.test(say()) || !tile('eink-install')) bad.push('a screen that answers but not READY does not say old software and offer Install: ' + JSON.stringify(say()));
  const steps = [...box.querySelectorAll('.eink-steps li')].map(li => li.textContent);
  if (steps.length < 4 || !steps.some(t => /Hold ☀/.test(t)) || !steps.some(t => /unplug the screen and plug it back in/.test(t))) bad.push('the install steps do not say hold ☀, and after installing unplug and plug back in (⏻ does not restart it, 485): ' + JSON.stringify(steps));
  return bad;
});


/* ---------- TERM DATES (491): THE YEAR AS INTERVALS — terms, half-terms and holidays, weekday-exact, with My school ---------- */
check('491: Term dates shows the current interval and the next three — a term Monday to its last day of term on a Friday, a break with its first day back — and My school moves them, kept per viewer', async () => {
  const { w } = boot();
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const box = await toolBox_(w, 'termdates', '.td-box');
  if (!box) return ['the Term dates widget did not draw on Tools — NOT checked'];
  const bad = [];
  const rows = w.termDatesRows_(new w.Date(2026, 9, 27));
  const say = rows.map(x => x.name + ' ' + x.from.toDateString() + '→' + x.to.toDateString() + (x.now ? ' now' : '')).join(' | ');
  if (say !== 'October half-term Sat Oct 24 2026→Sun Nov 01 2026 now | Autumn 2 Mon Nov 02 2026→Fri Dec 18 2026 | Christmas holidays Sat Dec 19 2026→Sun Jan 03 2027 | Spring 1 Mon Jan 04 2027→Fri Feb 12 2027')
    bad.push('27 Oct 2026 reads ' + say);
  if (!box.querySelector('.td-now') || box.querySelectorAll('.row.td-term, .row.td-half, .row.td-holiday').length !== 4) bad.push('the widget does not draw four intervals with the current one marked');
  if (!/last day of term/.test(box.textContent) || !/first day back/.test(box.textContent) || /\bends\b/.test(box.textContent)) bad.push('the lines do not say last day of term / first day back: ' + box.textContent.trim().slice(0, 200));
  if (!/Schools vary/.test(box.textContent)) bad.push('no note that schools vary');
  const sel = box.querySelector('.td-adj[data-td="e"]');
  if (!sel) return bad.concat('no My school ends setting');
  sel.value = '-2'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  const r2 = w.termDatesRows_(new w.Date(2026, 10, 10));
  if (r2[0].to.toDateString() !== 'Wed Dec 16 2026' || r2[1].from.toDateString() !== 'Thu Dec 17 2026') bad.push('ending two school days early gave ' + r2[0].to.toDateString() + ' / holidays from ' + r2[1].from.toDateString());
  if (!/familyTermShift:/.test(Object.keys(w.localStorage).join(' '))) bad.push('My school was not kept on the phone');
  Object.keys(w.localStorage).filter(k => /^familyTermShift:/.test(k)).forEach(k => w.localStorage.removeItem(k));
  return bad;
});

/* ---------- NEWSPAPER (466): A PLACEHOLDER ON REELS, ITS TITLE ALONE ---------- */
check('466: Reels holds a Newspaper widget, its title alone', async () => {
  const { w } = boot();
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const t = w.__t, d = w.document;
  const n = w.widgetsOf_('reel').findIndex(x => String(x.id) === 'newspaper');
  if (n < 0) return ['there is no newspaper widget on the Reels column'];
  t.go('reel', false, true); await wait(LEAVE_MS); await woken_();
  t.goPage('reel', n, true); await wait(LEAVE_MS); await woken_();
  const slot = d.getElementById('wgt-newspaper');
  if (!slot) return ['the Newspaper widget did not draw on Reels'];
  const txt = slot.textContent.replace(/\s+/g, ' ').trim();
  return txt === 'Newspaper' && slot.children.length === 1 ? [] : ['the Newspaper widget reads "' + txt + '" with ' + slot.children.length + ' element(s) — wanted its title alone'];
});

/* ---------- THE BUSINESS RECORDS: A COLUMN OF THEIR OWN, LAST, AND ONLY AN ADMIN'S § */
const BIZ_COLS_ = () => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'columns.json'), 'utf8'));
const BIZ_SERVE_ = cols => u => (/(^|\/)data\/settings\/columns\.json(\?|$)/.test(u) ? cols : undefined);
const BIZ_TITLES_ = ['Insurance', 'Tax', 'Legal and data', 'Safeguarding', 'Money and company'];
const BIZ_ADMIN_ = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin', handle: 'annadmin' };
const BIZ_HELD_ = [{ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
                     provider: 'Example Insure', reference: 'PL-000000', due_on: '2030-01-01' }];
/* WHAT NAMES THE COLUMN IN A PAGE: its section, the cards' own attributes and classes. Asked of the whole
   serialised document, so a comment, a hidden copy or a stray attribute is found as well as an element. */
/* AND THE PROFIT CARD (393): its attribute, its classes, its controls and its tile. */
const BIZ_NAMED_ = /\bs-biz\b|data-biz|\bbiz-(body|item|cap|when|flag|said|save)\b|class="card biz|data-profit|data-pf\b|\bpf-[a-z]|profit-reset/;
const bizNamed_ = d => { const m = d.documentElement.outerHTML.match(new RegExp('.{0,50}(' + BIZ_NAMED_.source + ').{0,30}'));
  return m ? m[0].replace(/\s+/g, ' ') : ''; };
const bizSwipe_ = async (w, from) => {
  const d = w.document;
  const at = d.querySelector('#s-' + from + ' .page .pane') || d.getElementById('s-' + from);
  at.dispatchEvent(new w.WheelEvent('wheel', { deltaX: 120, deltaY: 0, bubbles: true, cancelable: true }));
  await wait(LEAVE_MS); await woken_();
};
/* THE FILE WAS READ: since 392 TAB_ORDER and columns.json agree, so the order cannot tell them apart and the payload is asked. */
const bizApplied_ = t => !!(t.DATA() && (t.DATA().columns || []).length);
/* THE ROW THE OWNER DECIDED ON 21 OCT, by purpose: social, learning, business, games, you (docs/history/392). */
/* TOOLS AND GAMES LEFT THE ROW FOR FIND IN 790. */
const ORDER_392_ = ['spotlight', 'feed', 'reel', 'dm', 'stuff', 'res', 'saved',
                    'booking', 'shop'].concat(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'columns.json'), 'utf8')).map(r => r.screen).slice(9));  /* the owner's eleven since 730, as columns.json lists them */

check('business: an admin has a Business column last, straight after Apprentice settings (730), holding the five records cards (the verse screen is a Tools widget, 461), and Save posts the card', async () => {
  const { w, sent } = boot({ serve: BIZ_SERVE_(BIZ_COLS_()),
    before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(BIZ_ADMIN_)); } catch (e) {} },
    reply: body => (body.action === 'listRecords' ? { success: true, records: BIZ_HELD_ }
      : body.action === 'saveRecordsPage' ? { success: true, records: body.records }
      /* TWO LIBRARY UPDATES WAITING IN DRIVE (407), and the press that imports them. */
      : body.action === 'libImportList' ? { success: true, pending: [{ name: 'lib-import-a.json' }, { name: 'lib-import-b.json' }],
          /* AND WHAT THE HOURLY RUN LAST DID (443). */
          auto: { auto: true, at: '2026-10-25T09:00:00Z', imported: 1, failed: 0, files: [{ name: 'lib-import-books-part-01-of-02.json', counts: { textbooks: { added: 0, replaced: 3, same: 0 } } }] } }
      : body.action === 'libImportDrive' ? { success: true, imported: 2, failed: 0, files: [
          { name: 'lib-import-a.json', counts: { questions: { added: 0, replaced: 5, same: 0 } } },
          { name: 'lib-import-b.json', counts: { practicals: { added: 1, replaced: 0, same: 0 } } }] } : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(600);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  const bad = [];
  const ids = () => t.TABS.map(x => x.id);
  if (!t.whoami() || t.whoami().role !== 'admin') return ['the admin seeded before boot is not signed in — nothing was checked'];
  if (!bizApplied_(t)) return ['columns.json was not applied — the order a phone gets was NOT checked: ' + ids().join(', ')];
  if (ids().join(' ') !== ORDER_392_.join(' ')) bad.push('an admin\'s row reads ' + ids().join(' ') + ' — wanted ' + ORDER_392_.join(' ') + ', Business then Site last (491)');
  const host = d.getElementById('s-biz');
  if (!host || host.parentElement !== d.getElementById('screen') || host.tagName !== 'SECTION') return bad.concat(['an admin has no <section id="s-biz"> in #screen to draw the column into']);

  /* THE RECORDS ARE ASKED BEFORE ANYBODY GOES THERE. § */
  for (let n = 0; n < 40 && !sent.some(b => b.action === 'listRecords'); n++) await wait(100);
  if (t.AT() === 'biz') return bad.concat(['the admin booted onto Business, so asking before arrival was NOT checked']);
  if (!sent.some(b => b.action === 'listRecords')) bad.push('the records were not asked until somebody went to the Business column — the card beside Parent stays under the loader');
  else if (host.querySelector('.me-form[data-biz-page="Insurance"] .loading')) {
    for (let n = 0; n < 30 && host.querySelector('.me-form[data-biz-page="Insurance"] .loading'); n++) await wait(100);
    if (host.querySelector('.me-form[data-biz-page="Insurance"] .loading')) bad.push('the records were asked and answered, and the Insurance card is still under the loader without anybody going there');
  }

  /* A SWIPE OFF SETTINGS, as a trackpad sends it, lands on Business; one more stays — the last column. */
  t.go('apprentice', false, true);
  await wait(LEAVE_MS); await woken_();
  if (t.AT() !== 'apprentice') return bad.concat(['go("apprentice") left the app on ' + t.AT() + ' — the swipe was NOT checked']);
  await bizSwipe_(w, 'apprentice');
  if (t.AT() !== 'biz') return bad.concat(['a sideways swipe off Apprentice settings (730) landed on ' + t.AT() + ', wanted Business']);
  /* BIZ SETTINGS IS LAST SINCE 730 (Web settings stands right of Tutor settings): one more swipe stays. */
  await bizSwipe_(w, 'biz');
  if (t.AT() !== 'biz') bad.push('a sideways swipe past the last column moved off Biz settings, to ' + t.AT());

  /* THE RECORDS WERE ASKED ONCE IN ALL — drawing asked, arriving found it asked — and the five cards are the
     column's pages, in order, the pager agreeing. */
  for (let n = 0; n < 50 && host.querySelector('.loading'); n++) await wait(100);
  const asked = sent.filter(b => b.action === 'listRecords').length;
  if (asked !== 1) bad.push('arriving on Business asked listRecords ' + asked + ' time(s), wanted once');
  const cards = [...host.querySelectorAll(':scope > .page > .pane .me-form[data-biz-page]')].map(f => f.dataset.bizPage);
  if (cards.join('|') !== BIZ_TITLES_.join('|')) bad.push('the Business column holds ' + JSON.stringify(cards) + ', wanted the five records cards ' + JSON.stringify(BIZ_TITLES_));
  /* THE BUSINESS CARDS END AT THE VERSE SCREEN; + Add a person, everybody and the build stamps follow it (444). */
  const allPg = [...host.querySelectorAll(':scope > .page')];
  const n = allPg.map(p => !!p.querySelector('[data-biz-page]')).lastIndexOf(true) + 1;
  if (n !== 10 || t.pageCount('biz') !== allPg.length) bad.push('the business cards end on page ' + n + ' and the pager counts ' + t.pageCount('biz') + ' of ' + allPg.length + ' — wanted ten: nine since 491 (Setup, Posts, Reports and Library went to Site) and the Error log (O5) (Profit and its terms, Setup, Posts waiting (413), Applications (400), Staff (405), Reports (395), Library updates (407), five records); the verse screen moved to Tools (461)');
  /* LIBRARY UPDATES (407): two files wait, so the card glows and its tile counts them; the press posts as the admin and empties it. */
  /* ON THE SITE COLUMN since 491. */
  w.paint('site');
  for (let k = 0; k < 30 && !(d.querySelector('#s-site [data-libimp].needs-you')); k++) await wait(100);
  const lib = d.querySelector('#s-site [data-libimp]');
  const libTile = () => lib && lib.querySelector('.tile[data-do="lib-import"]');
  if (!lib) bad.push('the Site column has no Library updates card');
  else {
    if (!lib.classList.contains('needs-you') || !/2 files wait/.test(lib.textContent)) bad.push('two files waiting in Drive did not make the Library updates card glow "2 files wait": ' + lib.textContent.replace(/\s+/g, ' ').slice(0, 160));
    if (!libTile() || libTile().getAttribute('aria-label').indexOf('Import library updates (2)') !== 0 || libTile().disabled) bad.push('the Library updates tile is not a live "Import library updates (2)"');
    if (!/Last automatic import .*1 file imported/.test(lib.textContent) || !/books-part-01-of-02\.json.*3 changed/.test(lib.textContent)) bad.push('the Library updates card does not say when the hourly import last ran and what it imported (443): ' + lib.textContent.replace(/\s+/g, ' ').slice(0, 240));
    const at = sent.length;
    try { t.ACTIONS['lib-import'](libTile()); } catch (e) { bad.push('lib-import threw: ' + e.message); }
    for (let k = 0; k < 30 && !sent.slice(at).some(b => b.action === 'libImportDrive'); k++) await wait(100);
    await wait(300);
    const imp = sent.slice(at).find(b => b.action === 'libImportDrive');
    if (!imp || imp.personId !== 'P001') bad.push('pressing Import library updates posted ' + JSON.stringify(imp) + ' — wanted libImportDrive as the admin');
    const lib2 = d.querySelector('#s-site [data-libimp]');
    if (!lib2 || lib2.classList.contains('needs-you') || !/lib-import-a\.json.*5 changed/.test(lib2.textContent) || !/Import library updates \(0\)/.test((lib2.querySelector('.tile[data-do="lib-import"]') || {}).getAttribute('aria-label') || '')) bad.push('after the import the card still glows, or does not say what each file did: ' + (lib2 ? lib2.textContent.replace(/\s+/g, ' ').slice(0, 200) : 'no card'));
  }
  if (sent.filter(b => b.action === 'libImportList').length !== 1) bad.push('the Business column asked libImportList ' + sent.filter(b => b.action === 'libImportList').length + ' time(s), wanted once');
  /* THE VERSE SCREEN IS THE E-INK WIDGET ON TOOLS (470): no link away to the install page, anywhere. */
  try { w.__t.findGroup('Tools'); } catch (e) {}
  if (d.querySelector('a[href*="epaper-verse/install.html"]')) bad.push('a tile still opens the verse screen\'s install page in another window — the owner: "Keep it in the widget" (470)');
  { const sp = [...d.querySelectorAll('#s-site > .page')];
    if (!sp.length || !sp[sp.length - 1].querySelector('.me-build')) bad.push('the last Site page is not the build stamps (491)'); }
  const ins = host.querySelector('.me-form[data-biz-page="Insurance"]');
  if (!ins) return bad.concat(['there is no Insurance card on the Business column']);
  if (ins.querySelector('.loading')) bad.push('the records came back and the Insurance card is still under the loader');
  const ref = ins.querySelector('[data-biz="pub_liability"][data-k="reference"]');
  if (!ref || ref.value !== 'PL-000000') bad.push('the records came back and the policy box reads ' + JSON.stringify(ref && ref.value) + ', not PL-000000');

  /* SAVE: a box typed into marks its card (so the column is not redrawn under the typing), and the
     card's Save posts that card's three items with what was typed. */
  const prov = ins.querySelector('[data-biz="prof_indemnity"][data-k="provider"]');
  if (!prov) return bad.concat(['the Insurance card has no provider box for professional indemnity']);
  prov.value = 'Pretend Mutual';
  prov.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (ins.dataset.dirty !== '1') bad.push('typing into a Business card did not mark it as typed into — a payload landing would redraw it under the typing');
  if (!w.settingsKeep_('biz')) bad.push('`settingsKeep_` lets the Business column be redrawn while a card on it holds unsaved typing');
  const save = ins.querySelector('.tile[data-do="biz-save"]');
  if (!save) return bad.concat(['the Insurance card has no Save tile']);
  const before = sent.length;
  try { t.ACTIONS['biz-save'](save); } catch (e) { return bad.concat(['biz-save threw: ' + e.message]); }
  for (let k = 0; k < 30 && !sent.slice(before).some(b => b.action === 'saveRecordsPage'); k++) await wait(100);
  await wait(300);
  const post = sent.slice(before).find(b => b.action === 'saveRecordsPage');
  if (!post) bad.push('pressing Save on the Insurance card posted no saveRecordsPage');
  else {
    const got = post.records || [];
    if (got.map(r => r.id).join() !== 'pub_liability,prof_indemnity,employers_liability') bad.push('Save posted ' + JSON.stringify(got.map(r => r.id)) + ', not the Insurance card\'s three items');
    if (!got.every(r => r.category === 'Insurance')) bad.push('Save posted items not filed under Insurance');
    if ((got.find(r => r.id === 'prof_indemnity') || {}).provider !== 'Pretend Mutual') bad.push('Save did not post the provider that was typed');
    if ((got.find(r => r.id === 'pub_liability') || {}).reference !== 'PL-000000') bad.push('Save did not post the policy number the records brought');
  }
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/Saved/.test(said)) bad.push('the save answered and the toast says ' + JSON.stringify(said) + ', not Saved');
  if (ins.dataset.dirty) bad.push('the card is still marked as typed into after it was saved');

  /* SETTINGS HOLDS NONE OF THEM, and an admin who had been on a page past its new end opens on a real one. */
  t.go('account', false, true);
  await wait(LEAVE_MS); await woken_();
  w.paint('account');
  const set = d.getElementById('s-account');
  if (!set || !set.querySelector('.page')) return bad.concat(['Student did not draw for an admin — it was NOT checked for records']);
  if (set.querySelector('[data-biz-page], [data-biz], .card.biz')) bad.push('an admin\'s Student column still holds a business-records card');
  if (/data-biz/.test(w.youSettingsPages_().join(''))) bad.push('`youSettingsPages_` still builds a business-records card');
  /* AND THE TWO CARDS THAT WERE BEHIND THE RECORDS ARE GONE FROM IT TOO (docs/history/346): the journey to
     Progress, the weekly parent email altogether — so the page past the end below is past a shorter column. */
  if (set.querySelector('.card.digest, [data-do="digest-preview"]')) bad.push('an admin\'s Student settings still holds the weekly parent email card, which is gone');
  t.PAGE().account = 999;
  t.go('feed', false, true); await wait(200);
  t.go('account', false, true);
  await wait(LEAVE_MS); await woken_();
  const last = t.pageCount('account') - 1;
  if (t.PAGE().account !== last) bad.push('an admin coming back to Student past its last page is on page ' + t.PAGE().account + ' of ' + (last + 1));
  const on = set.querySelectorAll(':scope > .page')[t.PAGE().account];
  if (!on || !on.querySelector('.pane .card')) bad.push('an admin coming back to Student past its last page is on a page with no card');
  return bad;
});

/* ---------- PROFIT, THE BUSINESS COLUMN'S FIRST CARD (393) ---------- */
check('profit: an admin\'s Business column opens on Profit — the formula and two charts, then a page with a control per term starting from this month\'s bookings and config; a moved value recomputes, stays on the device, sends nothing; Reset goes back; nobody else is drawn it', async () => {
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
  const dmy = day => String(day).padStart(2, '0') + '/' + String(mo + 1).padStart(2, '0') + '/' + y;
  const p = payload();
  p.constants = p.constants || {}; p.constants.vars = Object.assign({}, p.constants.vars, { c: '0.25', B: '0.25', card_fee_pct: '0', card_fee_fixed: '0' });
  /* ONE JOB OF FOUR SESSIONS, ALL THIS MONTH, two seats, an hour each: £100 charged, £50 to the tutor, £25 kept — so P = 50/4/1.25 = 10, V = 25/4. */
  p.clientClasses = [{ id: 'J-PF', jobId: 'J-PF', type: 'job', kind: '', status: 'active', subject: 'Maths', level: 'GCSE',
    price: 100, tutorPay: 50, adminKeeps: 25, weeks: 4, hours: 1, currentKids: 2, maxKids: 4,
    dates: [1, 2, 3, 4].map(dmy).join(', '), slots: [], tutorSlots: [], events: [] }];
  const { w, sent } = boot({ payload: p, serve: BIZ_SERVE_(BIZ_COLS_()),
    before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(BIZ_ADMIN_)); } catch (e) {} },
    reply: body => (body.action === 'listRecords' ? { success: true, records: [] } : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(600);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  if (!t.whoami() || t.whoami().role !== 'admin') return ['the admin seeded before boot is not signed in — nothing was checked'];
  const bad = [];
  t.go('biz', false, true); await wait(LEAVE_MS); await woken_();
  if (t.AT() !== 'biz') return ['go("biz") left the admin on ' + t.AT() + ' — the Profit card was NOT checked'];
  const pgs = [...d.querySelectorAll('#s-biz > .page')];
  const sum = pgs[0] && pgs[0].querySelector('[data-profit="sum"]'), card = pgs[1] && pgs[1].querySelector('[data-profit="terms"]');
  if (!sum || !card) return ['the Business column\'s first two pages are not Profit and its terms: ' + pgs.slice(0, 2).map(g => (g.querySelector('h3') || {}).textContent).join(' | ')];
  if (!/Profit = Revenue − Tutor − Room − Fees − Other/.test(sum.textContent)) bad.push('the Profit card does not write the formula out');
  if (sum.querySelectorAll('svg.pf-chart').length !== 2) bad.push('the Profit card has ' + sum.querySelectorAll('svg.pf-chart').length + ' charts, wanted the bars and the line');
  if (card.querySelectorAll('[data-pf-var]').length !== 12) bad.push('the terms page has ' + card.querySelectorAll('[data-pf-var]').length + ' controls, wanted 12');
  const val = k => Number((card.querySelector('input.pf-num[data-pf="' + k + '"]') || {}).value);
  const from = k => ((card.querySelector('[data-pf-var="' + k + '"] .pf-from') || {}).textContent || '').trim();
  const want = { n: 2, h: 1, P: 10, V: 6.25, c: 0.25, B: 0.25 };
  for (const k of Object.keys(want)) if (Math.abs(val(k) - want[k]) > 0.01) bad.push(k + ' starts at ' + val(k) + ', wanted ' + want[k] + ' from this month\'s booking and config');
  if (from('P') !== 'this month') bad.push('P says it came from ' + JSON.stringify(from('P')) + ', wanted "this month"');
  if (from('B') !== 'config') bad.push('B says it came from ' + JSON.stringify(from('B')) + ', wanted "config"');
  if (!card.querySelector('.tile[data-do="profit-reset"]')) bad.push('there is no Reset to actual tile');
  const profit = () => ((sum.querySelector('.pf-row.is-total .pf-v') || {}).textContent || '').trim();
  const head = () => ((card.querySelector('.pf-head .pf-v') || {}).textContent || '').trim();
  /* PER MONTH, THE BOOKING ITSELF COMES BACK: S·w = 4 sessions → revenue 4·(10·1.5 + 6.25) = 85, tutor 50, room 25, profit 10. Shown as the figures, not trusted from them. */
  const sel = sum.querySelector('select[data-pf-period]');
  if (sel) { sel.value = 'month'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); }
  const before = profit();
  const nBox = card.querySelector('input[type="range"][data-pf="n"]');
  if (!nBox) return bad.concat(['there is no slider for n']);
  if (!nBox.hasAttribute('data-noswipe')) bad.push('the n slider does not keep the finger from the column swipe (`data-noswipe`)');
  const posted = sent.length;
  nBox.value = '4'; nBox.dispatchEvent(new w.Event('input', { bubbles: true }));
  const after = profit();
  if (!before || after === before) bad.push('moving n from 2 to 4 left Profit at ' + JSON.stringify(after));
  if (head() !== after) bad.push('the terms page says Profit is ' + JSON.stringify(head()) + ' and the sum page ' + JSON.stringify(after));
  if (val('n') !== 4) bad.push('moving the n slider did not move its number box (' + val('n') + ')');
  let kept = {};
  try { kept = JSON.parse(w.localStorage.getItem('profit:whatif') || '{}'); } catch (e) {}
  if (!kept.vals || kept.vals.n !== 4) bad.push('the moved n was not kept on the device: ' + JSON.stringify(kept));
  await wait(300);
  if (sent.length !== posted) bad.push('moving a value sent ' + JSON.stringify(sent.slice(posted).map(b => b.action)) + ' — a what-if is never written');
  try { t.ACTIONS['profit-reset'](card.querySelector('.tile[data-do="profit-reset"]')); } catch (e) { bad.push('profit-reset threw: ' + e.message); }
  if (val('n') !== 2) bad.push('Reset to actual left n at ' + val('n'));
  if (profit() !== before) bad.push('Reset to actual left Profit at ' + profit() + ', wanted ' + before);
  /* NOBODY ELSE: the function that draws it answers nothing, whoever else is signed in or nobody. */
  for (const u of [null, { name: 'T', role: 'tutor', roles: ['tutor'] }, { name: 'P', role: 'client', roles: ['client'] }, { name: 'S', role: 'student', roles: ['student'] }]) {
    t.USER(u);
    const html = w.profitCards_().join('') + (w.bizPages_() || []).join('');
    if (html) bad.push((u ? u.role : 'signed out') + ': profitCards_/bizPages_ drew ' + html.slice(0, 60));
  }
  t.USER(null);
  return bad;
});

check('business: a student, a parent, a tutor and a visitor have no Business column — no tab, no swipe stop, no section, nothing in the page naming it', async () => {
  const cols = BIZ_COLS_();
  const who = [['signed out', null],
    ['a student', { name: 'Test Student', personId: 'P9', role: 'student', roles: ['student'], token: 'tk' }],
    ['a parent', { name: 'Test Parent', personId: 'P8', role: 'parent', roles: ['parent'], token: 'tk' }],
    ['a tutor', { name: 'Test Tutor', personId: 'P7', role: 'tutor', roles: ['tutor'], token: 'tk' }]];
  const bad = [];
  for (const [as, u] of who) {
    const { w, sent } = boot({ serve: BIZ_SERVE_(cols),
      before: win => { try { if (u) win.localStorage.setItem('familyUser', JSON.stringify(u)); win.localStorage.setItem('familyTab', 'biz'); win.localStorage.setItem('familyTabAt', String(Date.now())); } catch (e) {} } });
    for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
    await wait(600);
    const t = w.__t, d = w.document;
    if (!t) { bad.push(as + ': the app did not finish loading'); continue; }
    if (u && (!t.whoami() || t.whoami().role !== u.role)) { bad.push(as + ': the visitor seeded before boot is not signed in — NOT checked'); continue; }
    const ids = t.TABS.map(x => x.id);
    if (!bizApplied_(t)) { bad.push(as + ': columns.json was not applied — NOT checked: ' + ids.join(', ')); continue; }
    if (ids.indexOf('biz') !== -1) bad.push(as + ': the row of columns has Business in it: ' + ids.join(', '));
    if (ids[ids.length - 1] !== 'apprentice') bad.push(as + ': the last column is ' + ids[ids.length - 1] + ', wanted Apprentice settings (730)');
    /* A REMEMBERED `biz` (an admin's, on a shared phone) IS NOT A PLACE FOR THEM: § */
    const home = typeof t.TAB_HOME === 'function' ? t.TAB_HOME() : '';
    if (!home || home === 'apprentice') bad.push(as + ': TAB_HOME is ' + JSON.stringify(home) + ' — the front door cannot be told from the column left of Business, NOT checked');
    else if (t.AT() !== home) bad.push(as + ': a remembered Business column opened them on ' + t.AT() + ', wanted ' + home + ', where a visitor with nothing remembered opens' + (t.AT() === 'apprentice' ? ' — they were moved left off a column they should never have been put on' : ''));
    /* EVERY COLUMN ARRIVED AT, so every neighbour has been painted, and the page asked after. */
    for (const id of ids) { try { t.go(id, false, true); } catch (e) { bad.push(as + ': ' + id + ' threw: ' + e.message); } }
    await wait(LEAVE_MS); await woken_();
    t.go('apprentice', false, true);
    await wait(LEAVE_MS); await woken_();
    await bizSwipe_(w, 'apprentice');
    if (t.AT() !== 'apprentice') bad.push(as + ': a swipe past Apprentice settings (730) moved to ' + t.AT() + ' — wanted to stay on the last column');
    t.go('biz', false, true);
    await wait(300);
    if (t.AT() === 'biz') bad.push(as + ': go("biz") reached a Business column');
    if (d.getElementById('s-biz')) bad.push(as + ': there is a <section id="s-biz"> in the page');
    const named = bizNamed_(d);
    if (named) bad.push(as + ': the page names the column: "…' + named + '…"');
    if (sent.some(b => b.action === 'listRecords')) bad.push(as + ': the records were asked for');
  }
  return bad;
});

check('business: signing in as an admin adds Find › Settings › Admin (the Business cards, batch C) and signing out takes it away, without a reload and without moving anybody', async () => {
  const cols = BIZ_COLS_();
  /* BATCH C (1040): Business is no column; its cards are Find › Settings › Admin items, so an admin's signing in adds items, not a tab. */
  const on = cols.filter(c => /^true$/i.test(String(c.active))).map(c => c.screen);
  const away = on.filter(x => x !== 'stuff' && x !== 'biz')[0];
  if (!away) return ['columns.json has no active column but Find to stand on — NOT checked: ' + on.join(', ')];
  let hold = false;
  const { w, gets } = boot({ serve: u => (hold && /script\.google\.com/.test(u) ? new Promise(() => {}) : BIZ_SERVE_(cols)(u)),
    reply: body => (body.action === 'verifyLogin' ? Object.assign({ success: true }, BIZ_ADMIN_)
      : body.action === 'listRecords' ? { success: true, records: BIZ_HELD_ } : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(600);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  const bad = [];
  const admin = () => w.stuffItemsBuild_().filter(x => x && x.kind === 'setting' && [].concat(x.settingFor).some(t => t === 'Business' || t === 'Site'));
  if (t.whoami()) return ['the journey meant to start signed out and somebody is signed in — NOT checked'];
  if (!bizApplied_(t)) return ['columns.json was not applied — NOT checked'];
  if (admin().length) return ['signed out, Find already holds Admin settings — the sign-in was NOT checked'];
  const doc = d.documentElement;

  /* IN, THROUGH FIND'S ONE SETTINGS CARD (C+), from another column. */
  t.go(away, false, true); await wait(LEAVE_MS); await woken_();
  const sign = w.stuffItemsBuild_().find(x => x && x.signIn);
  if (!sign) return ['signed out, Find holds no Sign in card — NOT checked'];
  const host = d.createElement('div'); host.innerHTML = w.settingDoorCard_(sign); d.body.appendChild(host);
  const name = d.getElementById('in-name'), pin = d.getElementById('in-pin'), btn = host.querySelector('[data-do="do-signin"]');
  if (!name || !pin || !btn) return ['the sign-in card has no name, PIN and Sign in — NOT checked'];
  name.value = 'annadmin'; pin.value = '4826';
  const asked = () => gets.filter(u => /script\.google\.com/.test(u)).length;
  const askedBefore = asked();
  hold = true;
  try { t.ACTIONS['do-signin'](btn); } catch (e) { return ['do-signin threw: ' + e.message]; }
  for (let n = 0; n < 50 && !(t.whoami() && t.whoami().role === 'admin'); n++) await wait(100);
  await wait(LEAVE_MS); await woken_();
  host.remove();
  if (!t.whoami() || t.whoami().role !== 'admin') return ['the admin did not sign in — NOT checked'];
  if (d.documentElement !== doc) bad.push('the page was reloaded');
  if (t.AT() !== away) bad.push('signing in moved the admin from ' + away + ' to ' + t.AT());
  if (!admin().some(x => (x.parts || []).some(p => p.col === 'biz'))) bad.push('signed in as an admin, Find › Settings › Admin holds no Business card: ' + JSON.stringify(admin().map(x => x.name)));
  if (!admin().some(x => (x.parts || []).some(p => p.notify))) bad.push('signed in as an admin, Find › Settings › Admin has no Notifications');
  if (t.TABS.some(x => x.id === 'biz') || d.getElementById('s-biz')) bad.push('signed in, a Business column came back (batch C: its cards are Find items)');
  if (asked() <= askedBefore) bad.push('signing in asked for no payload — the hold proved nothing');

  /* OUT, FROM THE SAME COLUMN: the Admin items go, and the person stays where they are. */
  try { t.ACTIONS['signout'](d.createElement('button')); } catch (e) { return bad.concat(['signout threw: ' + e.message]); }
  await wait(LEAVE_MS); await woken_();
  if (t.whoami()) return bad.concat(['Sign out did not sign the admin out — NOT checked']);
  if (d.documentElement !== doc) bad.push('the page was reloaded');
  if (admin().length) bad.push('signed out, Find still holds Admin settings: ' + admin().map(x => x.name).join(', '));
  const named = bizNamed_(d);
  if (named) bad.push('signed out, the page still names Business: "…' + named + '…"');
  if (t.AT() !== away) bad.push('signing out moved the person from ' + away + ' to ' + t.AT());
  return bad;
});

/* ---------- AND A RELOAD ON BUSINESS PUTS AN ADMIN BACK ON IT § */
check('business: an admin reloading on Business is put back on it, its section in the page and its five cards drawn', async () => {
  const { w, sent } = boot({ serve: BIZ_SERVE_(BIZ_COLS_()),
    before: win => { try { win.localStorage.setItem('familyUser', JSON.stringify(BIZ_ADMIN_));
      win.localStorage.setItem('familyTab', 'biz'); win.localStorage.setItem('familyTabAt', String(Date.now())); } catch (e) {} },
    reply: body => (body.action === 'listRecords' ? { success: true, records: BIZ_HELD_ } : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(600);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  const bad = [];
  const ids = t.TABS.map(x => x.id);
  if (!t.whoami() || t.whoami().role !== 'admin') return ['the admin seeded before boot is not signed in — NOT checked'];
  if (!bizApplied_(t)) return ['columns.json was not applied — NOT checked: ' + ids.join(', ')];
  if (t.AT() !== 'biz') return ['an admin reloading on Business opened on ' + t.AT() + ' — the remembered column an admin IS given was let go'];
  const host = d.getElementById('s-biz');
  if (!host || host.parentElement !== d.getElementById('screen')) return ['an admin reloading on Business is on it with no <section id="s-biz"> in #screen'];
  for (let n = 0; n < 50 && (host.querySelector('.loading') || !host.querySelector('[data-biz-page]')); n++) await wait(100);
  const cards = [...host.querySelectorAll(':scope > .page > .pane .me-form[data-biz-page]')].map(f => f.dataset.bizPage);
  if (cards.join('|') !== BIZ_TITLES_.join('|')) bad.push('an admin reloading on Business sees ' + JSON.stringify(cards) + ', wanted the five records cards');
  if (!host.querySelector(':scope > .page.on')) bad.push('an admin reloading on Business is on a column with no page in front');
  if (!sent.some(b => b.action === 'listRecords')) bad.push('an admin reloading on Business never asked for the records');
  return bad;
});

/* ---------- WHAT A TUTOR TEACHES: ONE CHIP A SUBJECT, ITS LEVELS RAISED § */
check('what a tutor teaches is one chip a subject, its levels raised and no brackets', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const draw = row => { const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row }); return box; };
  /* A CHIP, READ BACK AS WHAT A PERSON SEES: the subject is the text outside the `<sup>`, the levels
     are the spans inside it. A row named by its caption, so the two rows cannot be confused. */
  const row = (box, cap) => {
    const c = [...box.querySelectorAll('.prof-cap')].find(x => x.textContent.trim() === cap);
    const tags = c && c.nextElementSibling ? [...c.nextElementSibling.querySelectorAll('.prof-tag')] : [];
    return tags.map(el => {
      const sup = el.querySelector('sup.prof-lv');
      return { said: (el.textContent.replace(sup ? sup.textContent : '', '').trim()
                      + (sup ? ' ^' + [...sup.querySelectorAll('span')].map(s => s.textContent.trim()).join(', ') : '')),
               main: el.classList.contains('is-main'), text: el.textContent };
    });
  };
  const bad = [];
  const want = (who, box, cap, list, main) => {
    const got = row(box, cap);
    if (JSON.stringify(got.map(g => g.said)) !== JSON.stringify(list)) {
      bad.push(who + ': "' + cap + '" reads ' + JSON.stringify(got.map(g => g.said)) + ', wanted ' + JSON.stringify(list));
    }
    if (got.some(g => g.main !== main)) bad.push(who + ': a chip under "' + cap + '" has the wrong edge (gold is the specialism)');
    if (got.some(g => /[()]/.test(g.text))) bad.push(who + ': a chip under "' + cap + '" still has a bracket in it');
  };
  /* THE CURRENT BACKEND: two specialisms in one subject, that subject again at a level that is NOT a
     specialism, a subject at two levels spelled two ways, one arriving bare AND with a level, and
     one bare and nothing else. */
  const now = draw({ title: 'Ada Tutor', personId: 'P-ada', rate: 30,
    teachesSpec: ['Maths (GCSE)', 'Maths (A-Level)'],
    teaches: ['Maths (GCSE)', 'Maths (A-Level)', 'Maths (AS)', 'English (KS3)', 'English (GCSE)',
              'English (gcse)', 'Physics', 'Physics (GCSE)', 'Chemistry'] });
  want('the current backend', now, 'Teaches', ['Maths ^GCSE, A-Level'], true);
  want('the current backend', now, 'Can also teach',
       ['Maths ^AS', 'English ^KS3, GCSE', 'Physics ^GCSE', 'Chemistry'], false);
  /* A BACKEND FROM BEFORE SEVERAL SPECIALISMS: one string, no list. The phone must not wait on a
     deploy to draw this the new way. */
  const old = draw({ title: 'Old Backend', personId: 'P-old', rate: 30, teachesMain: 'Maths (GCSE)',
    teaches: ['Maths (GCSE)', 'Maths (A-Level)'] });
  want('an older backend', old, 'Teaches', ['Maths ^GCSE'], true);
  want('an older backend', old, 'Can also teach', ['Maths ^A-Level'], false);
  return bad;
});

/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE § */
check('a qualification is written like an isotope: the level raised, the grade lowered, the place in its name', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const draw = row => { const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row }); return box; };
  const P = (subject, level, grade, board, received, kind) => ({ subject, level, grade, board, received, kind: kind || 'subject' });
  /* A CHIP, READ BACK AS WHAT IS DRAWN: the subject is what is outside the stack, the level is the
     `<sup>` in it and the grade the `<sub>`, and the order inside the stack is the order on screen. */
  const read = box => {
    const c = [...box.querySelectorAll('.prof-cap')].find(x => x.textContent.trim() === 'Qualifications');
    const row = c && c.nextElementSibling;
    return row ? [...row.querySelectorAll('.prof-tag')].map(el => {
      const iso = el.querySelector('.prof-iso');
      const kids = iso ? [...iso.children].map(k => k.tagName.toLowerCase()) : [];
      return { subject: (el.textContent.replace(iso ? iso.textContent : '', '')).trim(),
               sup: iso && iso.querySelector('sup') ? iso.querySelector('sup').textContent : null,
               sub: iso && iso.querySelector('sub') ? iso.querySelector('sub').textContent : null,
               order: kids.join(','), stray: el.querySelectorAll('sup, sub').length - kids.length,
               role: el.getAttribute('role'), label: el.getAttribute('aria-label') || '', title: el.getAttribute('title') || '',
               studying: !!(iso && iso.querySelector('sub i')) };
    }) : null;
  };
  const bad = [];
  const now = read(draw({ title: 'Iso Tutor', personId: 'P-iso', rate: 30, quals: ['the sentences, which this phone must not draw'],
    qualsParts: [P('Maths', 'A-Level', 'B', 'Edexcel', '2019'), P('English', 'GCSE', '7', 'Hill Top School', '2016'),
                 P('PGCE', '', '', 'Institute of Education', '2021', 'cert'), P('Maths', 'GCSE', '9', 'Hill Top School', '2017'),
                 P('Physics', 'AS', '', '', ''), P('Chemistry', '', 'A', '', ''),
                 P('Theology', 'Degree', '', 'UWTSD', 'Present'), P('DBS', 'Enhanced', '', '', '', 'cert'), P('', 'GCSE', 'C', '', '')] }));
  if (!now) return ['the tutor card drew no "Qualifications" row at all'];
  const by = (s, sup) => now.find(q => q.subject === s && (sup === undefined || q.sup === sup));
  /* THE ORDER: Maths's two together, where Maths first appears, in the order they were entered — the
     shelf's own order — and the row with no subject (a level of nothing) not drawn. */
  const order = now.map(q => q.subject + (q.sup ? '^' + q.sup : ''));
  const wantOrder = ['Maths^A-Level', 'Maths^GCSE', 'English^GCSE', 'PGCE', 'Physics^AS', 'Chemistry', 'Theology^Degree', 'DBS Enhanced'];
  if (JSON.stringify(order) !== JSON.stringify(wantOrder)) bad.push('the chips read ' + JSON.stringify(order) + ', wanted ' + JSON.stringify(wantOrder));
  const maths = by('Maths', 'A-Level');
  if (!maths) bad.push('no Maths chip with A-Level raised');
  else {
    if (maths.sub !== 'B') bad.push('Maths A-Level lowers ' + JSON.stringify(maths.sub) + ' where its grade, "B", belongs');
    if (maths.order !== 'sup,sub') bad.push('Maths\'s stack is ' + maths.order + ' — the level goes OVER the grade');
    if (maths.stray) bad.push('a <sup> or <sub> sits outside the stack on the Maths chip');
    if (maths.role !== 'img') bad.push('the Maths chip is not role="img", so its aria-label is not what a screen reader hears');
    if (!/^Maths, A-Level, grade B, at Edexcel, 2019$/.test(maths.label)) bad.push('the Maths chip is named ' + JSON.stringify(maths.label) + ' — the board and the year must be in the name, the notation spoken in words');
    if (maths.title !== maths.label) bad.push('the Maths chip\'s title is not its name — a pointer held over it cannot see the place');
  }
  const eng = by('English', 'GCSE');
  if (!eng || eng.sub !== '7' || !/Hill Top School/.test(eng.label)) bad.push('English is not GCSE over 7 with Hill Top School in its name: ' + JSON.stringify(eng));
  const pgce = now.find(q => /PGCE/.test(q.subject));
  if (!pgce) bad.push('the PGCE was not drawn');
  else {
    if (pgce.sup !== null || pgce.sub !== null || pgce.order) bad.push('the PGCE is drawn as notation — a certificate is a plain chip');
    if (pgce.subject !== 'PGCE') bad.push('the PGCE chip reads ' + JSON.stringify(pgce.subject) + ' — the place belongs in its name, not on its face');
    if (!/Institute of Education/.test(pgce.label)) bad.push('the PGCE chip lost where it was taken: ' + JSON.stringify(pgce.label));
  }
  const dbs = now.find(q => /^DBS/.test(q.subject));
  if (!dbs || dbs.order) bad.push('an Enhanced DBS is notation, or missing — a certificate with a level is still a plain chip');
  const phy = by('Physics');
  if (!phy || phy.sup !== 'AS' || phy.sub !== null) bad.push('a level with no grade is not just the raised level: ' + JSON.stringify(phy));
  const chem = by('Chemistry');
  if (!chem || chem.sub !== 'A' || chem.sup !== null) bad.push('a grade with no level is not just the lowered grade: ' + JSON.stringify(chem));
  const theo = by('Theology');
  if (!theo || !theo.studying || theo.sub !== 'studying' || !/studying now/.test(theo.label)) bad.push('a degree still being studied does not say so in the grade\'s place: ' + JSON.stringify(theo));
  /* A BACKEND FROM BEFORE THE PARTS: the sentences, as plain chips, exactly as they were. */
  const old = read(draw({ title: 'Old Backend', personId: 'P-oldq', rate: 30, quals: ['Maths A-Level grade B at Edexcel (2019)', 'PGCE'] }));
  if (!old || JSON.stringify(old.map(q => q.subject)) !== JSON.stringify(['Maths A-Level grade B at Edexcel (2019)', 'PGCE']) || old.some(q => q.order))
    bad.push('an older backend\'s sentences are not drawn as they were: ' + JSON.stringify(old));
  /* A LAW THAT COLOURS A TWO-WORD SUBJECT COLOURS IT WHOLE. § */
  const D = w.__t.DATA(), lawsWere = D.laws;
  D.laws = [{ kind: 'word', match: 'English Language', colour: 'green' }, { kind: 'word', match: 'Maths', colour: 'green' }];
  try {
    const box = draw({ title: 'Law Tutor', personId: 'P-lawq', rate: 30,
      qualsParts: [P('English Language', 'GCSE', '8', '', '2016'), P('Further Maths', 'A-Level', 'A*', '', '2019')] });
    const chip = s => [...box.querySelectorAll('.prof-quals .prof-q')].find(c => c.getAttribute('aria-label').startsWith(s + ','));
    const green = c => c ? [...c.querySelectorAll('.w-green')].filter(x => !x.closest('.prof-iso')).map(x => x.textContent) : null;
    const held = c => { const e = c && c.querySelector('.prof-q-end'), i = e && e.querySelector('.prof-iso');
                        return e ? e.textContent.replace(i ? i.textContent : '', '') : null; };
    const en = chip('English Language'), fm = chip('Further Maths');
    if (JSON.stringify(green(en)) !== '["English Language"]')
      bad.push('a law on "English Language" colours its chip as ' + JSON.stringify(green(en)) + ' — the subject split before it was coloured');
    if (!en || held(en) !== 'English Language' || !en.querySelector('.prof-q-end .prof-iso'))
      bad.push('"English Language", coloured whole, is not held whole to its stack: ' + JSON.stringify(held(en)));
    if (JSON.stringify(green(fm)) !== '["Maths"]' || held(fm) !== 'Maths' || !/^Further /.test(fm.textContent))
      bad.push('"Further Maths" with a law on "Maths" reads ' + JSON.stringify({ green: green(fm), held: held(fm) }) + ' — "Further" belongs outside the held word');
  } finally { D.laws = lawsWere; }
  return bad;
});

/* ---------- THE LIBRARY CARDS ARE ON TOOLS NOW (docs/history/339) § */
const libOpen_ = async (w, who) => {
  const t = w.__t;
  if (who) t.USER(who);
  try { t.findGroup('Tools', 'libcards'); } catch (e) { return null; }   /* its own card: Find fills the pages near the glass (790) */
  for (let k = 0; k < 30; k++) {
    const f = w.document.querySelector('#s-stuff #wgt-libcards #lib-box .me-form');
    if (f) return f;
    await wait(100);
  }
  return null;
};

/* ---------- AND THE LIBRARY CARDS CARRY NO NOTE, WHATEVER THE BACKEND SAYS § */
check('the library cards draw no note box, even from a backend that still lists one — on Tools, and on Settings no page is left for it', async () => {
  const libs = [];
  for (let i = 1; i <= 5; i++) ['_name', '_no', '_pin'].forEach(k => libs.push('lib' + i + k));
  const { w } = boot({ payload: Object.assign(payload(), { profileFields: { 'Library cards': libs.concat(['library_note']) } }) });
  await wait(300);
  const form = await libOpen_(w, { name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', lib1_name: 'Merton', library_note: 'old note' } });
  if (!form) return ['the Tools column drew no library cards widget, so the note box was NOT checked'];
  const bad = [];
  if (form.querySelector('[data-me="library_note"]')) bad.push('the library cards widget draws a library_note box');
  const stray = [...form.querySelectorAll('[data-me]')].map(e => e.getAttribute('data-me')).filter(f => !/^lib\d+_(name|no|pin)$/.test(f));
  if (stray.length) bad.push('the library cards widget draws boxes that are not a card: ' + stray.join(', '));
  if (/note/i.test(form.textContent)) bad.push('the library cards widget still says "note" somewhere');
  try { w.paint('account'); } catch (e) {}
  const d = w.document;
  if (d.querySelector('#s-account [data-me="library_note"], #s-account [data-me^="lib1_"]')) bad.push('Settings still draws a library card box or the note');
  if ([...d.querySelectorAll('#s-account h3')].some(h => /library/i.test(h.textContent))) bad.push('Settings still has a Library cards page');
  return bad;
});

/* ---------- EACH LIBRARY CARD IS DRAWN AS A CARD, AND ITS BARS ARE ITS NUMBER'S (docs/history/332) § */
const LIB_FIELDS_ = (() => { const o = []; for (let i = 1; i <= 5; i++) ['_name', '_no', '_pin'].forEach(k => o.push('lib' + i + k)); return o; })();
const LIB_PROFILE_ = { first_name: 'Test', last_name: 'Admin', phone_cc: '+44', headline: 'Saved headline',
  lib1_name: 'Merton', lib1_no: '2000000000000', lib1_pin: '0000',
  lib2_name: 'Sutton Central', lib2_no: '2000000000001', lib2_pin: '0000',
  lib3_name: 'Wandsworth Town and Putney', lib3_no: '2000000000002', lib3_pin: '0000' };
const LIB_USER_ = () => ({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
  profile: Object.assign({}, LIB_PROFILE_) });
const libBoot_ = (more) => {
  const sent = [];
  const b = boot(Object.assign({
    payload: Object.assign(payload(), { profileFields: { 'About you': ['headline'], 'Library cards': LIB_FIELDS_ } }),
    reply: q => { sent.push(q); return q.action === 'updateProfile' ? { success: true, profile: Object.assign({}, LIB_PROFILE_, q.fields) } : { success: true }; },
  }, more || {}));
  return Object.assign(b, { posts: sent });
};
const libDraw_ = w => libOpen_(w, LIB_USER_());
const libD_ = face => { const p = face && face.querySelector('svg.lib-bars path'); return p ? p.getAttribute('d') : null; };

check('each library card is drawn as a card: one face per entry, its three boxes on it, a name for each, the bars decoration', async () => {
  const { w } = libBoot_();
  await wait(300);
  const form = await libDraw_(w);
  if (!form) return ['the Tools column drew no library cards widget — nothing was checked'];
  const bad = [];
  const slots = [...form.querySelectorAll('.lib-shelf > .lib-card')];
  /* ONE CARD (489, the owner: "change this to be only 1 card allowed"): the first filled one, no Add another. */
  if (slots.length !== 1) bad.push('the shelf holds ' + slots.length + ' slots, wanted one');
  if (form.querySelector('[data-do="shelf-more"]')) bad.push('the shelf still offers Add another');
  const shown = slots.filter(s => !s.hidden);
  if (shown.length !== 1) bad.push(shown.length + ' cards are shown, wanted one');
  slots.forEach((s, at) => {
    const n = at + 1, faces = s.querySelectorAll('.lib-face');
    if (faces.length !== 1) { bad.push('slot ' + n + ' holds ' + faces.length + ' card faces, wanted one'); return; }
    const f = faces[0];
    const names = [...s.querySelectorAll('[data-me]')].map(e => e.getAttribute('data-me')).sort();
    const want = ['lib' + n + '_name', 'lib' + n + '_no', 'lib' + n + '_pin'].sort();
    if (JSON.stringify(names) !== JSON.stringify(want)) bad.push('slot ' + n + ' holds the boxes ' + JSON.stringify(names) + ', wanted ' + JSON.stringify(want));
    const off = [...s.querySelectorAll('[data-me]')].filter(e => !f.contains(e)).map(e => e.getAttribute('data-me'));
    if (off.length) bad.push('card ' + n + ' has boxes beside it rather than on it: ' + off.join(', '));
    if (f.getAttribute('role') !== 'group' || !/^Library card\b/.test(f.getAttribute('aria-label') || '')) bad.push('card ' + n + ' is not a group named "Library card …" for a screen reader');
    const cap = f.querySelector('.lib-cap');
    if (!cap || !/library card/i.test(cap.textContent) || cap.getAttribute('aria-hidden') !== 'true') bad.push('card ' + n + ' has no hidden "Library card" caption at its top');
    const nm = f.querySelector('[data-me$="_name"]'), no = f.querySelector('[data-me$="_no"]'), pin = f.querySelector('[data-me$="_pin"]');
    if (nm && nm.getAttribute('aria-label') !== 'Library name') bad.push('card ' + n + '\'s name box is not labelled "Library name" for a screen reader');
    if (no && no.getAttribute('aria-label') !== 'Card number') bad.push('card ' + n + '\'s number box is not labelled "Card number" for a screen reader');
    const pinCap = pin && pin.closest('label') && pin.closest('label').querySelector('span');
    if (!pinCap || pinCap.textContent.trim() !== 'PIN') bad.push('card ' + n + '\'s PIN box has no visible "PIN" caption in its label');
    const svg = f.querySelector('svg.lib-bars');
    if (!svg) bad.push('card ' + n + ' has no barcode');
    else {
      if (svg.getAttribute('aria-hidden') !== 'true') bad.push('card ' + n + '\'s barcode is not aria-hidden — it is decoration, not a code anything can read');
      if (!libD_(f)) bad.push('card ' + n + '\'s barcode draws no bars');
      if (no && svg.compareDocumentPosition(no) & w.Node.DOCUMENT_POSITION_PRECEDING) bad.push('card ' + n + '\'s number comes before its bars — it is printed under them');
    }
    /* THE DRAFT RULE DID NOT MOVE: no box of a library card is a draft, because the PIN is on it. */
    const drafted = [...f.querySelectorAll('[data-draft]')].map(e => e.getAttribute('data-me'));
    if (drafted.length) bad.push('card ' + n + ' carries drafts now: ' + drafted.join(', ') + ' — a library card was never drafted (its PIN is on it)');
  });
  /* NAME FIRST IN THE ORDER A KEYBOARD AND A READER MEET THEM, whatever the grid puts where. */
  const order = [...shown[0].querySelectorAll('input[data-me]')].map(e => e.getAttribute('data-me'));
  if (JSON.stringify(order) !== '["lib1_name","lib1_pin","lib1_no"]') bad.push('a card\'s boxes come in the order ' + JSON.stringify(order) + ', wanted the name, the PIN, then the number');
  return bad;
});

check('typing a library card number redraws its bars; the same number always draws the same bars; no number draws the even stand-in', async () => {
  const { w } = libBoot_();
  await wait(300);
  const form = await libDraw_(w);
  if (!form) return ['the Tools column drew no library cards widget — nothing was checked'];
  if (typeof w.libBarsOf_ !== 'function') return ['libBarsOf_ is not reachable — the bars were NOT checked'];
  const bad = [];
  const face = n => form.querySelector('[data-me="lib' + n + '_no"]').closest('.lib-face');
  const box = n => form.querySelector('[data-me="lib' + n + '_no"]');
  const d1 = libD_(face(1));
  draftType_(w, box(1), '2000000000005');
  if (libD_(face(1)) === d1) bad.push('typing a different number left the bars as they were');
  if (box(1).value !== '2000000000005') bad.push('the number printed under the bars reads ' + JSON.stringify(box(1).value) + ' after typing 2000000000005');
  draftType_(w, box(1), '2000000000000');
  if (libD_(face(1)) !== d1) bad.push('typing the first number back did not draw the first bars back — the bars are not the number\'s');
  if (JSON.stringify(w.libBarsOf_('2000000000000')) !== JSON.stringify(w.libBarsOf_('2000000000000'))) bad.push('libBarsOf_ gave two answers for one number');
  if (JSON.stringify(w.libBarsOf_('2000000000000')) === JSON.stringify(w.libBarsOf_('2000000000001'))) bad.push('two numbers one digit apart drew the same bars');
  /* NO NUMBER: the even stand-in, marked so the stylesheet draws it faint. */
  draftType_(w, box(1), '');
  const blank = face(1).querySelector('svg.lib-bars');
  if (!blank || !blank.classList.contains('is-blank')) bad.push('an empty number\'s bars are not marked is-blank');
  const runs = [...String(libD_(face(1)) || '').matchAll(/M(\d+) 0h(\d+)/g)].map(m => [Number(m[1]), Number(m[2])]);
  const widths = new Set(runs.map(r => r[1])), steps = new Set(runs.slice(1).map((r, i) => r[0] - runs[i][0]));
  if (runs.length < 10 || widths.size !== 1 || steps.size !== 1) bad.push('an empty number drew ' + runs.length + ' bars of ' + widths.size + ' widths at ' + steps.size + ' spacings — wanted an even pattern');
  draftType_(w, box(1), '2000000000002');
  if (face(1).querySelector('svg.lib-bars.is-blank')) bad.push('a number typed into an empty card left its bars marked blank');
  return bad;
});

check('the library card on Tools saves its three fields (489: one card), and a reload keeps Settings\' drafts but never a library card\'s', async () => {
  const one = libBoot_();
  await wait(300);
  const form1 = await libDraw_(one.w);
  if (!form1) return ['the Tools column drew no library cards widget — nothing was checked'];
  const bad = [];
  /* SETTINGS' OWN DRAFTS STILL KEEP — the headline is on Settings for an admin with no public card. */
  try { one.w.paint('account'); } catch (e) {}
  const head = one.w.document.querySelector('#s-account [data-me="headline"]');
  if (!head) return ['no headline box on the settings column — the reload was NOT checked'];
  draftType_(one.w, head, 'Typed, never saved');
  draftType_(one.w, form1.querySelector('[data-me="lib1_name"]'), 'Typed on a card, never saved');
  draftType_(one.w, form1.querySelector('[data-me="lib1_pin"]'), '0000 typed');
  one.w.dispatchEvent(new one.w.Event('pagehide'));
  const kept = keptStore_(one.w);
  const leaked = Object.keys(kept).filter(k => /^draft:/.test(k) && /lib\d|pin/i.test(k));
  if (leaked.length) bad.push('a library card box was kept on the device as a draft: ' + leaked.join(', '));
  if (Object.keys(kept).some(k => /^draft:/.test(k) && /0000 typed/.test(kept[k]))) bad.push('a PIN typed on a card was written to the device');
  /* THE RELOAD: a second boot from exactly what the first left. */
  const two = libBoot_({ before: fromStore_(kept) });
  await wait(300);
  const form = await libDraw_(two.w);
  if (!form) return bad.concat(['after the reload the Tools column drew no library cards widget']);
  const t = two.w.__t, d = two.w.document;
  try { two.w.paint('account'); } catch (e) {}
  const head2 = d.querySelector('#s-account [data-me="headline"]');
  if (!head2 || head2.value !== 'Typed, never saved') bad.push('after a reload the headline box holds ' + JSON.stringify(head2 && head2.value) + ' — the column\'s drafts were lost');
  const lib1 = form.querySelector('[data-me="lib1_name"]');
  if (lib1.value !== 'Merton') bad.push('after a reload the card holds ' + JSON.stringify(lib1.value) + ', wanted its saved name: no box of a library card is a draft');
  const savedD = (String(two.w.libBars_('2000000000000')).match(/ d="([^"]+)"/) || [])[1];
  if (!savedD || libD_(lib1.closest('.lib-face')) !== savedD) bad.push('after a reload the card\'s bars are not its saved number\'s');
  draftType_(two.w, form.querySelector('[data-me="lib1_name"]'), 'Merton Park');
  two.posts.length = 0;
  try { t.ACTIONS['me-save'](form.querySelector('[data-do="me-save"]')); } catch (e) { bad.push('Save threw: ' + e.message); }
  await wait(400);
  const post = two.posts.find(b => b.action === 'updateProfile');
  if (!post) return bad.concat(['Save posted ' + JSON.stringify(two.posts.map(b => b.action)) + ' and no updateProfile']);
  const keys = Object.keys(post.fields || {}).sort();
  if (JSON.stringify(keys) !== JSON.stringify(['lib1_name', 'lib1_no', 'lib1_pin'])) bad.push('Save posted ' + JSON.stringify(keys) + ' — wanted the one card\'s three fields');
  const want = { lib1_name: 'Merton Park', lib1_no: '2000000000000', lib1_pin: '0000' };
  Object.keys(want).forEach(k => { if ((post.fields || {})[k] !== want[k]) bad.push('Save posted ' + k + ' as ' + JSON.stringify((post.fields || {})[k]) + ', wanted ' + JSON.stringify(want[k])); });
  if (post.targetId !== 'P001' || post.personId !== 'P001') bad.push('the Tools card saved to ' + JSON.stringify(post.targetId) + ', not the person signed in');
  return bad;
});

/* ---------- THE LIBRARY CARDS ARE A TOOL FOR EVERYBODY SIGNED IN, AND HOLD WHAT IS TYPED (docs/history/339) § */
check('the library cards are on Tools for a parent, a student, a tutor and an admin and for nobody signed out, last, held while typed into without restarting the column, and redrawn when myProfile lands unless a box has the caret', async () => {
  const libs = LIB_FIELDS_;
  let mine = Object.assign({ phone_cc: '+44' }, LIB_PROFILE_);
  const { w } = boot({
    payload: Object.assign(payload(), { profileFields: { 'Library cards': libs }, clientFields: { 'Library cards': libs },
                                        studentFields: { 'Library cards': libs } }),
    reply: b => b.action === 'myProfile' ? { success: true, personId: 'P001', profile: mine } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const ids = () => (typeof w.widgetsOf_ === 'function' ? w.widgetsOf_('tool') : []).map(x => x.id);
  /* SIGNED OUT, Find is not offered (400, 790), so the list is asked: a visitor's tools hold no library cards. */
  t.USER(null);
  await wait(200);
  if (ids().indexOf('libcards') !== -1) bad.push('a visitor signed out is shown the library cards on Tools');
  for (const [role, roles] of [['client', ['client']], ['student', ['student']], ['tutor', ['tutor']], ['admin', ['admin']]]) {
    const form = await libOpen_(w, { name: 'Lee Reader', personId: 'P-L' + role, role, roles, token: 'tk',
                                     profile: Object.assign({ phone_cc: '+44' }, LIB_PROFILE_) });
    const list = ids();
    if (!form) { bad.push('a ' + role + ' has no library cards on Tools (' + JSON.stringify(list) + ')'); continue; }
    /* LAST — appended, because its gate is signing in, and above another tool it moved
       that tool's page under somebody on Tools when they signed in (the review of 339). */
    if (list[list.length - 1] !== 'libcards') bad.push('a ' + role + '\'s library cards are tool ' + list.indexOf('libcards') + ' of ' + JSON.stringify(list) + ', wanted the last');
    if (form.querySelectorAll('.lib-card:not([hidden]) .lib-face').length !== 1) bad.push('a ' + role + '\'s library cards widget draws ' + form.querySelectorAll('.lib-card:not([hidden]) .lib-face').length + ' cards, wanted one (489)');
    try { w.paint('account'); } catch (e) {}
    if (d.querySelector('#s-account .lib-face, #s-account [data-me^="lib1_"]')) bad.push('a ' + role + '\'s Settings still draws a library card');
  }
  /* TYPING HELD: the payload landing repaints the column in front, and the box is the same box with the same words. */
  const form = await libOpen_(w, { name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
                                   profile: Object.assign({ phone_cc: '+44' }, LIB_PROFILE_) });
  if (!form) return bad.concat(['the admin has no library cards on Tools, so the hold was NOT checked']);
  const box = form.querySelector('[data-me="lib1_name"]');
  draftType_(w, box, 'Merton, typed');
  await woken_();   /* Find starts its near cards one per task (790): those queued by the arrival are not a restart */
  /* AND THE REST OF THE COLUMN IS NOT RESTARTED OVER ITS OWN MARKUP (`startScreen_`'s hold, shell.js) — a repaint `paint` declined, so what runs on Tools is still § */
  const calc = w.initMiniCalc;
  let restarts = 0;
  w.initMiniCalc = function () { restarts++; return calc.apply(this, arguments); };
  try { t.repaint(true); } catch (e) { bad.push('the repaint threw: ' + e.message); }
  await wait(200);
  w.initMiniCalc = calc;
  if (restarts) bad.push('a repaint held for a library card\'s typing restarted the rest of Tools (the calculator started ' + restarts + ' time(s))');
  const now = d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_name"]');
  if (now !== box || !now || now.value !== 'Merton, typed') bad.push('a repaint of Tools threw away what was typed on a library card (' + JSON.stringify(now && now.value) + ')');
  try { w.initLibCards_(); } catch (e) {}
  if ((d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_name"]') || {}).value !== 'Merton, typed') bad.push('starting the widget again drew over a card with typing in it');
  /* AND A CLEAN ONE TAKES THE SHEET'S COPY WHEN `myProfile` LANDS. */
  delete form.dataset.dirty;
  mine = Object.assign({}, mine, { lib1_name: 'Merton from the sheet' });
  try { w.profileRefresh_(); } catch (e) { bad.push('profileRefresh_ threw: ' + e.message); }
  await wait(400);
  if ((d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_name"]') || {}).value !== 'Merton from the sheet') bad.push('myProfile landed and the library cards on Tools still show ' + JSON.stringify((d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_name"]') || {}).value));
  /* BUT NOT UNDER THE CARET — a box focused and not yet typed into is not dirty, and redrawing it takes the caret
     away (`libCardsRedraw_`). It keeps its element; it is drawn from the sheet the next time it starts. */
  const focused = d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_no"]');
  if (!focused) return bad.concat(['no second library card box to focus — the caret was NOT checked']);
  focused.focus();
  if (d.activeElement !== focused) return bad.concat(['the box could not be focused here — the caret was NOT checked']);
  mine = Object.assign({}, mine, { lib1_no: '2000000000009' });
  try { w.profileRefresh_(); } catch (e) { bad.push('profileRefresh_ threw: ' + e.message); }
  await wait(400);
  if (d.querySelector('#s-stuff #wgt-libcards [data-me="lib1_no"]') !== focused) bad.push('myProfile landed and redrew the library card a box of which had the caret');
  return bad;
});

/* ---------- THE REVIEW OF docs/history/339: WHERE THE LIBRARY CARDS SIT, AND WHAT THEY SAY WITH NOTHING TO DRAW § */
check('review 339: somebody on a Tools page keeps that tool when they sign in and when they sign out — the library cards come last', async () => {
  const { w } = boot({ payload: Object.assign(payload(), { clientFields: { 'Library cards': LIB_FIELDS_ } }), reply: () => ({ success: true }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.signedIn_ !== 'function') return ['signedIn_ is not reachable — NOT checked'];
  const front = () => { const p = d.querySelector('#s-stuff > .page.on [id^="wgt-"]'); return p ? p.id : null; };
  t.findGroup('Tools'); t.repaint(true);
  await wait(300);
  const tools = t.allWidgets().filter(x => x.kind === 'tool').map(x => String(x.id));
  if (tools[tools.length - 1] !== 'libcards') bad.push('the library cards are not the last tool: ' + tools.join(', '));
  /* FIND IS FOR MEMBERS (790): the one standing on the tool is a member, and another signing in on the phone keeps it; signing out leaves Find. */
  for (const id of ['calendar', 'whiteboard']) {
    t.findGroup('Tools', id);
    await wait(400);
    if (front() !== 'wgt-' + id) { bad.push('could not stand on the ' + id + ' (' + front() + ') — NOT checked'); continue; }
    try { w.signedIn_({ success: true, name: 'Pat Parent', personId: 'P-C1', role: 'client', roles: ['client'], token: 'tk', handle: 'pat_kind20',
                        profile: { first_name: 'Pat', last_name: 'Parent', phone_cc: '+44' } }, 'parent@example.org'); } catch (e) { bad.push('signedIn_ threw ' + e.message); }
    await wait(400);
    t.findGroup('Tools', id);
    await wait(400);
    if (front() !== 'wgt-' + id) bad.push('on the ' + id + ', signing in turned Find to ' + front());
    t.findGroup('Tools', 'libcards');
    await wait(400);
    if (!d.querySelector('#s-stuff #wgt-libcards')) bad.push('signed in, Find › Tools has no library cards');
    try { t.ACTIONS['signout'](d.createElement('button')); } catch (e) { bad.push('Sign out threw ' + e.message); }
    await wait(400);
  }
  return bad;
});

/* A PAYLOAD WHOSE ROLE MAP HAS NO LIBRARY GROUP — an older server, or `GROUPS_OLD_` with no `profileFields` at all — said § */
check('review 339: a server that sends no library group is said by the library cards to be older, not "not arrived yet"', async () => {
  const bad = [];
  for (const [label, fields] of [['a role map with no Library cards', { 'About you': ['first_name', 'last_name', 'photo'], 'Where': ['borough', 'city'] }],
                                 ['no profileFields at all', {}]]) {
    const { w } = boot({ payload: Object.assign(payload(), { profileFields: fields }) });
    await wait(300);
    const t = w.__t, d = w.document;
    t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', handle: 'testadmin',
             profile: { first_name: 'Test', last_name: 'Admin', phone_cc: '+44' } });
    try { t.findGroup('Tools', 'libcards'); } catch (e) {}
    let said = '';
    for (let k = 0; k < 30; k++) {
      said = String((d.querySelector('#s-stuff #wgt-libcards #lib-box') || {}).textContent || '').replace(/\s+/g, ' ').trim();
      if (said) break;
      await wait(100);
    }
    if (!said) { bad.push(label + ': the library cards widget drew nothing — NOT checked'); continue; }
    if (/yet/.test(said) || !/older than this site/.test(said)) bad.push(label + ': the library cards widget says ' + JSON.stringify(said));
  }
  return bad;
});

/* THREE SMALL BRANCHES NOTHING ASKED. § */
check('review 339: "Manage your child" waits with the loader while the payload comes, and the moved line falls to Signing in when no group is left', async () => {
  const W = cardWorld_();
  W.holding = true;
  const c = await cardOpen_(W, 'parent@example.org');
  if (c.err) return [c.err];
  const bad = [];
  const card = () => c.d.querySelector('#s-students .kid-manage');
  try { c.t.go('students', false, true); c.w.paint('students'); } catch (e) { bad.push('drawing Settings threw: ' + e.message); }
  await wait(200);
  if (!(typeof c.w.awaiting_ === 'function' && c.w.awaiting_())) bad.push('the payload is not being waited for — the first half was NOT checked');
  else if (!card() || /No child is linked/.test(card().textContent) || !card().querySelector('.kid-list [aria-busy="true"], .kid-list .loading')) {
    bad.push('with the payload still coming "Manage your child" says ' + JSON.stringify(card() ? (card().querySelector('.kid-list') || {}).textContent : null) + ', not the loader');
  }
  W.holding = false;
  W.release();
  for (let k = 0; k < 30 && card() && !/No child is linked/.test(card().textContent); k++) { await wait(100); try { c.w.paint('students'); } catch (e) {} }
  if (!card() || !/No child is linked/.test(card().textContent)) bad.push('the payload landed and "Manage your child" does not say no child is linked');
  /* A ROLE MAP WITH NOTHING LEFT FOR SETTINGS. */
  const { w } = boot({ payload: Object.assign(payload(), { clientFields: { 'About you': ['first_name', 'last_name', 'photo'], 'Library cards': LIB_FIELDS_ } }) });
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'client', roles: ['client'], token: 'tk', handle: 'pat_kind20',
               profile: { first_name: 'Pat', last_name: 'Parent', phone_cc: '+44' } });
  try { w.__t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing Settings threw: ' + e.message); }
  await wait(200);
  /* 469: NO FILLER LINE — with no group left, Signing in is simply there. */
  if (w.document.querySelector('#s-account .ce-moved')) bad.push('with no group left, Settings still draws a line saying where things went');
  if (!w.document.querySelector('#s-account [data-do="pin-save"]')) bad.push('with no group left, Settings has no Signing in');
  return bad;
});

check('a backend that never answers does not hang the app for ever', async () => {
  let html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8');
  const hasDeadline = /AbortController|Promise\.race|setTimeout\([^)]*abort/i.test(
    require('../tools/piece-src.js').pieceSrc('shell', path.join(dir, '..')));
  const hasWatchdog = /Still loading after/i.test(html);
  const bad = [];
  if (!hasDeadline) {
    bad.push('the payload fetch has no deadline — a slow backend leaves every wait on screen for ever, '
      + 'with nothing on screen saying why. That cost most of one day.');
  }
  if (!hasWatchdog) {
    bad.push('index.html has no load watchdog — if the code loads and the data never comes, '
      + 'nothing says so');
  }
  return bad;
});

/* ---------- A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN, QUIETLY § */
/* ONE POST, the witness that the payload was drawn (the festive card was, until 506). */
const RC_PAYLOAD_ = () => Object.assign(payload(), { features: ['editPost', 'deletePost'],
  posts: [{ id: 'PO-RC', author: '@family.', handle: '@family.', avatar: '', image: '', media: [], caption: 'Drawn from the payload', body: '', location: '',
    when: '01/09/2026', at: Date.UTC(2026, 8, 1), pinned: false, active: true, waiting: false, refused: false,
    reactions: { emoji: [], counts: [], total: 0, yours: '', by: [] }, comments: { total: 0, list: [] } }] });
const RC_PAGE_ = '<!DOCTYPE html><html><head><title>Error</title></head><body><div>Authorization is '
  + 'required to perform that action.</div></body></html>';
const RC_KID_ = { name: 'Mo Learner', personId: 'P-MO', role: 'kid', roles: ['kid'], token: 'tk-mo' };
const RC_ADMIN_ = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin' };
/* `more` goes to `boot` as it is — `serve`, to hold a static file the way `plan` holds the payload. */
function flaky_(plan, user, more) {
  const asked = [];
  const b = boot({ ...(more || {}), payload: RC_PAYLOAD_(), before: w => {
    if (user) signedInAs_(user)(w);
    const real = w.fetch;
    w.fetch = (url, o) => {
      if (!(o && o.body) && /script\.google\.com\/macros\/.*[?&]_=\d+/.test(String(url))) {
        const step = typeof plan === 'function' ? plan(asked.length) : plan[asked.length];
        asked.push(String(url));
        if (step === 'timeout') return Promise.reject(Object.assign(new Error('timeout'), { name: 'AbortError' }));
        if (step === 'fetch') return Promise.reject(new w.TypeError('Failed to fetch'));
        if (step === 'html') return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(RC_PAGE_) });
        if (step === 'refuse') return Promise.resolve({ ok: true, status: 200,
          text: () => Promise.resolve(JSON.stringify({ error: 'No people (expected in the people file)' })) });
        const reply = v => (v && v.body ? Promise.resolve({ ok: true, status: 200,
          text: () => Promise.resolve(JSON.stringify(v.body)) }) : real(url, o));
        if (step && typeof step.then === 'function') return step.then(reply);
        if (step && step.body) return reply(step);
      }
      return real(url, o);
    };
  } });
  b.asked = asked;
  b.line = () => String((b.w.document.getElementById('reconnect') || {}).textContent || '');
  b.bannerUp = () => { const el = b.w.document.getElementById('banner');
    return !!(el && !el.classList.contains('hidden') && String(el.textContent || '').trim()); };
  b.bannerText = () => String((b.w.document.getElementById('banner') || {}).textContent || '');
  b.arrived = () => { const D = b.w.__t && b.w.__t.DATA(); return !!(D && D.tutors && D.tutors.length === 2); };
  return b;
}
const RC_LATE_ = 'Can’t reach the server — still trying.';

