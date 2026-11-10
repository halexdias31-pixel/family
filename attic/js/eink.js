/* @family. — the e-ink screen widget (attic, 88a), cut from js/records.js; its widget entry is in widgets-engines.js. */
/* THE E-PAPER VERSE SCREEN'S SETUP PAGE, findable by an admin rather than by its address (370). */
/* ---------- THE E-INK SCREEN, A TOOLS WIDGET (470) ----------
   The owner: "the widget itself will pretend to be an e-ink screen … syncing is a bonus"; "you choose whether you want icons displayed or verses displayed". */
const EINK_KEY = 'eink:pick';
const EINK = (() => {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(EINK_KEY) || '{}') || {}; } catch (e) { o = {}; }
  return { mode: ['date', 'verse', 'icon'].indexOf(o.mode) >= 0 ? o.mode : 'date', verse: Math.max(0, +o.verse || 0), icon: Math.max(0, +o.icon || 0), bare: !!o.bare,
           verses: null, icons: null, fonts: null, bits: {}, steps: '', asked: false, failed: false, say: '', busy: false, install: false };
})();
const einkKeep_ = () => { try { localStorage.setItem(EINK_KEY, JSON.stringify({ mode: EINK.mode, verse: EINK.verse, icon: EINK.icon, bare: EINK.bare })); } catch (e) {} };
/* THE SAME FILES THE SCREEN'S PROGRAM IS BUILT FROM: data/eink-verses.json is verse.cpp's list, data/icons.json the icon database; data/icons/120/ the icons' own 1-bit bitmaps. */
function einkLoad_() {
  if (EINK.asked) return;
  EINK.asked = true;
  const get = f => fetch('data/' + f + deployStamp_(), { cache: 'default' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  Promise.all([get('eink-verses.json'), get('icons.json'), get('eink-fonts.json').catch(() => null)])
    .then(([v, i, f]) => { EINK.fonts = f; EINK.verses = Array.isArray(v) ? v : []; EINK.icons = (Array.isArray(i) ? i : []).filter(x => x && x.image); })
    .catch(() => { EINK.failed = true; })
    .then(() => paintEink_());
}
/* THREE THINGS TO SHOW (499): today's date for everybody; verses and icons, being religious, an admin's alone (the owner). */
const EINK_MODES = [['date', 'Today’s date', false], ['verse', 'Bible verses', true], ['icon', 'Icons', true]];
const einkMode_ = () => (EINK.mode !== 'date' && !(typeof isAdmin === 'function' && isAdmin()) ? 'date' : EINK.mode);
const einkList_ = () => (einkMode_() === 'icon' ? EINK.icons : einkMode_() === 'verse' ? EINK.verses : [einkToday_()]) || [];
/* TODAY, as the screen's clock will say it once Sync has set it. */
function einkToday_(at) {
  const d = at || new Date();
  return { date: true, wd: d.getDay(), d: d.getDate(), mo: d.getMonth(), y: d.getFullYear(),
           text: day_(d) + ' ' + date_(d) };
}
const EINK_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EINK_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/* THE SCREEN'S OWN PIXELS (482): verse.cpp's layout, line for line, with its three Adafruit GFX fonts (data/eink-fonts.json),
   into a 200x200 1-bit page — what the widget shows is what the screen draws. */
const EINK_PX = 200;
function einkFont_(name) {
  const f = EINK.fonts && EINK.fonts[name]; if (!f) return null;
  if (!f.bits) { const b = atob(f.bitmap); f.bits = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) f.bits[i] = b.charCodeAt(i); }
  return f;
}
function einkWidth_(f, s, z) {   // Adafruit_GFX::getTextBounds' width, from x = 0, at setTextSize(z)
  let x = 0, lo = 0x7FFF, hi = -1;
  z = z || 1;
  for (const ch of String(s)) {
    const c = ch.charCodeAt(0); if (c < f.first || c > f.last) continue;
    const [, w, , xa, xo] = f.glyphs[c - f.first];
    lo = Math.min(lo, x + xo * z); hi = Math.max(hi, x + xo * z + w * z - 1); x += xa * z;
  }
  return hi >= lo ? hi - lo + 1 : 0;
}
function einkWrap_(f, text, maxW) {   // verse.cpp's wrap()
  const lines = []; let line = '';
  for (const word of String(text).split(' ').filter(Boolean)) {
    const t = line ? line + ' ' + word : word;
    if (einkWidth_(f, t) <= maxW || !line) line = t; else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}
function einkText_(px, f, s, x, y, z) {   // Adafruit_GFX::drawChar, glyph by glyph from the baseline; at size z a dot is a z-by-z square
  z = z || 1;
  for (const ch of String(s)) {
    const c = ch.charCodeAt(0); if (c < f.first || c > f.last) continue;
    const [o, w, h, xa, xo, yo] = f.glyphs[c - f.first];
    for (let k = 0; k < w * h; k++) if (f.bits[o + (k >> 3)] & (0x80 >> (k & 7))) {
      const gx = x + (xo + k % w) * z, gy = y + (yo + Math.floor(k / w)) * z;
      for (let a = 0; a < z; a++) for (let b = 0; b < z; b++) einkDot_(px, gx + a, gy + b);
    }
    x += xa * z;
  }
}
const einkDot_ = (px, x, y) => { if (x >= 0 && y >= 0 && x < EINK_PX && y < EINK_PX) px[y * EINK_PX + x] = 1; };
function einkPage_(mode, item, iconBits) {   // -> Uint8Array(200*200), 1 = black; null without the fonts
  const big = einkFont_('FreeSerif12pt7b'), small = einkFont_('FreeSerif9pt7b'), ital = einkFont_('FreeSerifItalic9pt7b');
  if (!big || !small || !ital || !item) return null;
  const px = new Uint8Array(EINK_PX * EINK_PX), M = 8, W = 200 - 2 * M, REF_TOP = 176;
  if (mode === 'date') {   // drawDate() (499): weekday, the day four times the size, month, rule, year in italic
    const mid = (f, s, y, z) => einkText_(px, f, s, Math.trunc((200 - einkWidth_(f, s, z)) / 2), y, z);
    mid(big, EINK_WEEKDAYS[item.wd % 7], 36, 1);
    mid(big, String(item.d), 124, 4);
    mid(big, EINK_MONTHS[item.mo], 158, 1);
    for (let x = 70; x < 130; x++) px[REF_TOP * EINK_PX + x] = 1;
    mid(ital, String(item.y), 194, 1);
    return px;
  }
  if (mode === 'icon') {   // drawPicture(k, titled) (491): 120x160 at 5/4 filling the height, the title vertical in the right margin
    const PX0 = item.bare ? 25 : 22;
    if (iconBits) for (let y = 0; y < 200; y++) for (let x = 0; x < 150; x++) if (iconBits[Math.trunc(y * 4 / 5) * 120 + Math.trunc(x * 4 / 5)]) einkDot_(px, PX0 + x, y);
    if (!item.bare) {
      let t = String(item.title || '');
      while (t.length > 1 && einkWidth_(ital, t) > 196) t = t.slice(0, -1);
      /* setRotation(3): a pixel at (x, y) of the turned screen is (y, 199 - x) of the panel. */
      const turned = new Uint8Array(EINK_PX * EINK_PX);
      einkText_(turned, ital, t, Math.max(0, Math.trunc((200 - einkWidth_(ital, t)) / 2)), 192);
      for (let i = 0; i < turned.length; i++) if (turned[i]) einkDot_(px, Math.floor(i / EINK_PX), 199 - (i % EINK_PX));
    }
    return px;
  }
  const fonts = [big, small], lineH = [24, 18];   // drawVerse(): the bigger font if the verse fits in it
  let f = 0, lines = [];
  for (f = 0; f < 2; f++) { lines = einkWrap_(fonts[f], item.text, W); if (lines.length * lineH[f] <= REF_TOP - M - 4 || f === 1) break; }
  lines = lines.slice(0, 14);
  const top = M + Math.trunc((REF_TOP - M - lines.length * lineH[f]) / 2);
  lines.forEach((l, i) => einkText_(px, fonts[f], l, M + Math.trunc((W - einkWidth_(fonts[f], l)) / 2), top + (i + 1) * lineH[f] - 6));
  for (let x = 70; x < 130; x++) px[REF_TOP * EINK_PX + x] = 1;
  einkText_(px, ital, item.ref, M + Math.trunc((W - einkWidth_(ital, item.ref)) / 2), 194);
  return px;
}
/* The icon's 1-bit 120x160 exactly as the screen has it (483): data/icons/120/<id>.png is the bitmap pictures.h is written from. */
function einkIconBits_(ic, then) {
  if (!ic || !ic.image) return then(null);
  if (EINK.bits[ic.id]) return then(EINK.bits[ic.id]);
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = 120; c.height = 160;
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#fff'; g.fillRect(0, 0, 120, 160); g.drawImage(img, 0, 0, 120, 160);
      const d = g.getImageData(0, 0, 120, 160).data, b = new Uint8Array(120 * 160);
      for (let i = 0; i < b.length; i++) b[i] = d[i * 4] < 128 ? 1 : 0;
      EINK.bits[ic.id] = b; then(b);
    } catch (e) { then(null); }
  };
  img.onerror = () => then(null);
  img.src = 'data/icons/120/' + ic.id + '.png';
}
/* HOW MANY DEVICE PIXELS EACH PANEL PIXEL TAKES: the most whole number that fits the panel's box. */
function einkScale_(cv) {
  const box = cv.parentElement, w = box ? box.clientWidth : 0, dpr = window.devicePixelRatio || 1;
  return Math.max(1, Math.floor((w || EINK_PX) * dpr / EINK_PX));
}
/* THE PANEL'S TWO INKS, read off its tokens (--eink-black, --eink-white), so the canvas is the colours the stylesheet names. */
function einkInk_(cv) {
  const rgb = (v, or) => { const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(v || ''); return m ? [+m[1], +m[2], +m[3]] : or; };
  let cs = null; try { cs = getComputedStyle(cv.parentElement || cv); } catch (e) {}
  return [rgb(cs && cs.color, [20, 20, 20]), rgb(cs && cs.backgroundColor, [232, 230, 222])];
}
function einkDraw_(cv) {
  const list = einkList_(), mode = einkMode_(), icon = mode === 'icon', item = list[(icon ? EINK.icon : mode === 'verse' ? EINK.verse : 0) % (list.length || 1)];
  const put = bits => {
    let g = null; try { g = cv.getContext('2d'); } catch (e) {}
    const px = einkPage_(mode, icon ? Object.assign({}, item, { bare: EINK.bare }) : item, bits); if (!g || !px) return;
    /* WHOLE DEVICE PIXELS PER PANEL PIXEL (720): a 200px page stretched to 1.75x on a phone drew some dots twice as wide as others, and a dither turned to stripes. */
    const k = einkScale_(cv), S = EINK_PX * k;
    if (cv.width !== S) { cv.width = S; cv.height = S; }
    const im = g.createImageData(S, S), dk = einkInk_(cv);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const o = (y * S + x) * 4, c = px[Math.trunc(y / k) * EINK_PX + Math.trunc(x / k)] ? dk[0] : dk[1];
      im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    cv.style.width = cv.style.height = (S / (window.devicePixelRatio || 1)) + 'px';
  };
  if (icon) einkIconBits_(item, put); else put(null);
}
function einkFace_() {
  const list = einkList_();
  if (!list.length) return '<p class="eink-none">The verses and icons did not load.</p>';
  const mode = einkMode_(), it = list[(mode === 'icon' ? EINK.icon : mode === 'verse' ? EINK.verse : 0) % list.length];
  const words = mode === 'date' ? `<p class="eink-icon">${esc(it.text)}</p>` : mode === 'icon' ? `<p class="eink-icon">${esc(it.title || '')}</p>` : `<p class="eink-verse">${esc(it.text || '')} — <span class="eink-ref">${esc(it.ref || '')}</span></p>`;
  return `<canvas class="eink-px" width="${EINK_PX}" height="${EINK_PX}" aria-hidden="true"></canvas><div class="eink-words">${words}</div>`;
}
/* THE STEPS, with the symbols printed on the screen's two buttons (482): ☀ is BOOT, ⏻ is PWR. One line each, only when it applies. */
const EINK_STEPS = {
  sync: ['Plug the screen into this computer.', 'Tap Sync and choose “@family. screen”.'],
  install: ['Unplug the screen.', 'Hold ☀ (BOOT).', 'Plug it in while holding ☀, then let go.', 'Tap Install and choose the screen — in this mode it may be called “USB JTAG/serial debug unit”.', 'When it says Installed, unplug the screen and plug it back in without touching ☀ — ⏻ does not restart it (485). Then tap Sync.'],
};
function paintEink_() {
  const mode = einkMode_(), list = einkList_(), icon = mode === 'icon', date = mode === 'date';
  const ready = list.length > 0 && (!date || !!EINK.fonts);
  const which = ready && !date ? (icon ? EINK.icon : EINK.verse) % list.length + 1 + ' of ' + list.length : '';
  const admin = typeof isAdmin === 'function' && isAdmin();
  /* THE PICKER (499): a native select, one line; verses and icons are offered to an admin only. */
  const pick = `<select class="eink-pick" aria-label="What the screen shows">${EINK_MODES.filter(m => admin || !m[2])
    .map(m => `<option value="${m[0]}"${m[0] === mode ? ' selected' : ''}>${esc(m[1])}</option>`).join('')}</select>`;
  document.querySelectorAll('.eink-box').forEach(box => {
    if (!ready && !EINK.failed) { box.setAttribute('aria-busy', 'true'); box.innerHTML = loading_(); return; }
    box.removeAttribute('aria-busy');
    box.innerHTML = `<div class="eink" aria-label="The 1.54-inch e-ink screen, 200 by 200, black and white">
        <div class="eink-panel">${einkFace_()}</div></div>
      <div class="row"><span class="k">Shows</span><span class="v">${pick}${which ? ' <span class="faint">' + which + '</span>' : ''}</span></div>
      <div class="tile-row">${[
        icon ? tile_({ icon: 'show', label: 'Title', note: EINK.bare ? 'off' : 'small, at the side', act: 'eink-title', on: !EINK.bare, pressed: !EINK.bare }) : '',
        date ? '' : tile_({ icon: 'left', label: 'Back', act: 'eink-step', data: { d: -1 }, off: !ready }),
        date ? '' : tile_({ icon: 'right', label: 'Next', act: 'eink-step', data: { d: 1 }, off: !ready }),
        date ? '' : tile_({ icon: 'again', label: 'Shuffle', act: 'eink-shuffle', off: !ready }),
        tile_({ icon: 'sync', label: 'Sync to my screen', note: 'optional, by USB', act: 'eink-sync', off: !ready || EINK.busy }),
        EINK.install ? tile_({ icon: 'in', label: 'Install', note: 'the screen’s program, by USB', act: 'eink-install', off: EINK.busy }) : '',
      ].join('')}</div>
      ${EINK.say ? `<p class="eink-say" role="status">${esc(EINK.say)}</p>` : ''}
      ${EINK.details ? `<p class="eink-say eink-details">${esc(EINK.details)}</p>` : ''}
      ${EINK.steps ? `<ol class="eink-steps">${EINK_STEPS[EINK.steps].map(t => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}`;
    const cv = box.querySelector('.eink-px'); if (cv) einkDraw_(cv);
  });
}
const einkSay_ = t => { EINK.say = t; paintEink_(); };
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('.eink-pick');
  if (!el) return;
  const v = el.value, m = EINK_MODES.find(x => x[0] === v);
  if (!m || (m[2] && !(typeof isAdmin === 'function' && isAdmin()))) return;
  EINK.mode = m[0]; EINK.say = ''; einkKeep_(); paintEink_();
});
on('eink-title', () => { EINK.bare = !EINK.bare; einkKeep_(); paintEink_(); });
on('eink-step', el => {
  const n = einkList_().length; if (!n || einkMode_() === 'date') return;
  const k = einkMode_() === 'icon' ? 'icon' : 'verse';
  EINK[k] = ((EINK[k] + (+el.dataset.d || 1)) % n + n) % n; einkKeep_(); paintEink_();
});
on('eink-shuffle', () => {
  const n = einkList_().length; if (n < 2 || einkMode_() === 'date') return;
  const k = einkMode_() === 'icon' ? 'icon' : 'verse';
  let j = EINK[k]; while (j === EINK[k]) j = Math.floor(Math.random() * n);
  EINK[k] = j; einkKeep_(); paintEink_();
});
/* SYNCING, IN PLACE: Web Serial from this widget, never another page. The program stays awake while a computer is attached (verse.cpp, 482). */
const EINK_USB = 0x303a;   // Espressif's USB id: the only thing Chrome's list shows is the screen
const EINK_GONE = 'No screen in the list — press ⏻ (PWR) once, then tap Sync again.';
async function einkPort_() {
  if (!('serial' in navigator)) { EINK.steps = ''; einkSay_('Syncing needs Chrome or Edge on a computer, with the screen plugged in by USB.'); return null; }
  EINK.steps = ''; einkSay_('Choose “@family. screen” in Chrome’s list.');
  try { return await navigator.serial.requestPort({ filters: [{ usbVendorId: EINK_USB }] }); }
  catch (e) { EINK.steps = 'sync'; einkSay_(EINK_GONE); return null; }
}
const EINK_HUSH = 'The screen didn’t answer — unplug it, plug it back in without touching ☀, then tap Sync again.';
const einkUsb_ = port => { try { const i = port.getInfo ? port.getInfo() : {}; const h = n => (n == null ? '????' : (+n).toString(16).padStart(4, '0'));
  return i && i.usbVendorId != null ? h(i.usbVendorId) + ':' + h(i.usbProductId) : 'unknown'; } catch (e) { return 'unknown'; } };
/* HELLO first, then SHOW: what came back (or nothing) is said, and a Details line keeps the bytes and USB id for the next screenshot (485). */
on('eink-sync', async () => {
  if (EINK.busy) return;
  const port = await einkPort_(); if (!port) return;   // a fresh pick every time: after an install the screen is a new USB device
  EINK.busy = true; EINK.details = '';
  let ok = false, ready = false, opened = false, got = '';
  const usb = einkUsb_(port);
  try {
    await port.open({ baudRate: 115200 }); opened = true;
    /* DTR on (TinyUSB writes only to a port with DTR), RTS off: never a step of USBCDC's DTR/RTS reboot-to-bootloader dance (485). */
    try { await port.setSignals({ dataTerminalReady: true, requestToSend: false }); } catch (e) {}
    einkSay_('Connected — asking the screen…');
    const enc = s => new TextEncoder().encode(s + '\n');
    const mode = einkMode_(), hello = enc('HELLO');
    /* THE CLOCK FIRST (499): the board's PCF85063 is set to this computer's local time on every Sync, then what to show. */
    const now = new Date(), time = enc('TIME ' + [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getDay()].join(' '));
    const show = enc(mode === 'date' ? 'SHOW DATE' : mode === 'icon' ? (EINK.bare ? 'SHOW BARE ' : 'SHOW ICON ') + EINK.icon : 'SHOW VERSE ' + EINK.verse);
    const w = port.writable.getWriter(), r = port.readable.getReader(), dec = new TextDecoder();
    const reading = (async () => { try { while (!ok) { const x = await r.read(); if (x.done) break; got += dec.decode(x.value, { stream: true });
      if (/READY/.test(got)) ready = true; if (/(^|\n)OK\b/.test(got)) ok = true; } } catch (e) {} })();
    const until = Date.now() + 10000;   // the screen may still be drawing its first picture; it reads what queued when it is done
    let last = 0;
    while (!ok && Date.now() < until) {
      if (!ready) { try { await w.write(hello); } catch (e) {} }
      else if (Date.now() - last > 1500) { if (last) einkSay_('The screen answered — sending…'); try { await w.write(time); await w.write(show); } catch (e) {} last = Date.now(); }
      await new Promise(res => setTimeout(res, ready ? 100 : 400));
    }
    try { await r.cancel(); } catch (e) {}
    await reading;
    try { r.releaseLock(); w.releaseLock(); } catch (e) {}
  } catch (e) {}
  try { await port.close(); } catch (e) {}
  EINK.busy = false;
  const tail = got.replace(/\s+/g, ' ').trim().slice(-60);
  EINK.details = 'Details: USB ' + usb + ' · ' + (got ? 'heard ' + got.length + ' bytes: “' + tail + '”' : 'heard nothing') + (opened ? '' : ' · port would not open');
  if (ok) { EINK.install = false; EINK.steps = ''; einkSay_('Done — the screen is updating.'); }
  else if (!opened) { EINK.steps = 'sync'; einkSay_('The screen is busy in another tab — close it, then tap Sync again.'); }
  else if (ready) { EINK.steps = ''; einkSay_('The screen answered but did not take the picture — tap Sync again.'); }
  else if (/waiting for download|DOWNLOAD|ESP-ROM/i.test(got)) { EINK.steps = ''; einkSay_('The screen is still in install mode — unplug it, plug it back in without touching ☀, then tap Sync again.'); }
  else if (got.trim()) { EINK.install = true; EINK.steps = 'install'; einkSay_('This screen has old software — tap Install.'); }
  else { EINK.install = true; EINK.steps = ''; einkSay_(EINK_HUSH); }
});
/* esptool-js 0.6.1's hard_reset only lowers RTS, which was already low: the S3 stayed in its installer (485). RTS high with DTR low resets it. */
async function einkReset_(t) {
  try { await t.setDTR(false); await t.setRTS(true); await new Promise(res => setTimeout(res, 120)); await t.setRTS(false); } catch (e) {}
}
/* INSTALL, IN PLACE: what install.html did, here — esptool-js writes the program; the page never changes. */
on('eink-install', async () => {
  if (EINK.busy) return;
  const port = await einkPort_(); if (!port) return;
  EINK.busy = true; einkSay_('Connected — installing…');
  try {
    const { ESPLoader, Transport } = await import('https://unpkg.com/esptool-js@0.6.1/bundle.js');
    const quiet = { clean() {}, writeLine() {}, write() {} };
    const transport = new Transport(port, false);
    const loader = new ESPLoader({ transport, baudrate: 460800, romBaudrate: 115200, terminal: quiet });
    await loader.main();
    const data = new Uint8Array(await (await fetch('tools/epaper-verse/epaper-verse.bin' + deployStamp_())).arrayBuffer());
    const md5 = (await (await fetch('tools/epaper-verse/epaper-verse.md5' + deployStamp_())).text()).trim();
    if (!/^[0-9a-f]{32}$/.test(md5)) throw new Error('no md5');
    /* calculateMD5Hash makes esptool-js read the flash back and throw on a mismatch: Installed is said only after that (485). */
    await loader.writeFlash({ fileArray: [{ data, address: 0 }], flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep', eraseAll: false, compress: true,
      calculateMD5Hash: () => md5,
      reportProgress: (i, done, all) => { EINK.say = 'Installing… ' + Math.round(100 * done / all) + '%'; paintEink_(); } });
    await einkReset_(transport);
    try { await transport.disconnect(); } catch (e) {}
    EINK.install = false; EINK.steps = ''; EINK.details = ''; EINK.say = 'Installed and checked — unplug the screen, plug it back in, then tap Sync.';
  } catch (e) { EINK.steps = 'install'; EINK.say = 'The install did not finish — follow these steps, then tap Install again.'; }
  EINK.busy = false; paintEink_();
});

