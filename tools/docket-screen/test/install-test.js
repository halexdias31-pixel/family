/* install-test.js - the Docket screen's install page in Chromium with a pretend board: node tools/docket-screen/test/install-test.js.
   No board, no network. Step 1 (Install) as attic/epaper-verse's test; step 2 (Wi-Fi and the private address) against a pretend
   docket.cpp that answers HELLO, WIFI, PASS, URL and SAVE as the firmware does. All the values are made up. */
'use strict';
const fs = require('fs'), path = require('path');
const SB = require('../../lib/site-browser.js');   // the one browser launch (tools/one-helper.js)
const DIR = path.join(__dirname, '..');

/* A pretend esptool-js: records what the page asked, fails where the case says. */
const FAKE_ESPTOOL = `
export class Transport { constructor(port) { this.port = port; } async disconnect() { LOG.push('disconnect'); }
  async setDTR(v) { LOG.push('dtr ' + v); } async setRTS(v) { LOG.push('rts ' + v); } }
export class ESPLoader {
  constructor(o) { this.t = o.transport; LOG.push('filters ' + JSON.stringify(FILTERS)); }
  async main() { if (CASE.main) { const e = new Error('x'); e.name = CASE.main; throw e; } LOG.push('main'); }
  async writeFlash(o) { LOG.push('write ' + o.fileArray[0].address + ' ' + o.fileArray[0].data.length + ' md5 ' + (o.calculateMD5Hash ? o.calculateMD5Hash() : 'none')); o.reportProgress(0, 5, 10); o.reportProgress(0, 10, 10); }
}`;

/* A pretend navigator.serial with one Espressif port whose streams answer as docket.cpp's hear() does.
   CASE.silent: never answers; CASE.verse: the old verse program; CASE.offline: saved but no Wi-Fi; CASE.slow: READY only after 3 HELLOs. */
const FAKE_SERIAL = () => {
  window.LOG = []; window.SENT = []; window.CASE = JSON.parse(decodeURIComponent(location.hash.slice(1)) || '{}');
  window.FILTERS = null;
  let push = null, held = {}, hellos = 0;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const answer = s => push && push(enc.encode(s + '\r\n'));
  const port = {
    getInfo: () => ({ usbVendorId: 0x303a }),
    async open(o) { LOG.push('open ' + o.baudRate); },
    async close() { LOG.push('close'); },
    readable: new ReadableStream({ start(c) { push = b => c.enqueue(b); } }),
    writable: new WritableStream({ write(chunk) {
      dec.decode(chunk).split('\n').filter(Boolean).forEach(l => {
        SENT.push(l);
        if (CASE.silent) return;
        if (l === 'HELLO') { if (++hellos > (CASE.slow ? 3 : 0)) answer(CASE.verse ? 'READY epaper-verse 499' : 'READY docket-screen 1'); }
        else if (/^(WIFI|PASS|URL) ?/.test(l)) { held[l.split(' ')[0]] = l.slice(l.indexOf(' ') + 1); answer('OK'); }
        else if (l === 'SAVE') { window.NVS = Object.assign({}, held); answer('SAVED'); setTimeout(() => answer(CASE.offline ? 'DRAWN offline' : 'DRAWN fresh'), 100); }
      });
    } }),
  };
  Object.defineProperty(navigator, 'serial', { value: {
    async requestPort(o) { FILTERS = o.filters; if (CASE.none) { const e = new Error('none'); e.name = 'NotFoundError'; throw e; } return port; },
    async getPorts() { return [port]; },
  } });
};

const say = (page, id = 'say') => page.locator('#' + id).textContent();
const until = (p, id, re, ms) => p.waitForFunction(([i, r]) => new RegExp(r).test(document.getElementById(i).textContent), [id, re.source], { timeout: ms || 10000 });
const SSID = 'Made-up Wifi 5G', PASS = 'not a real password', URL_OK = 'https://script.example.test/macros/s/MADEUP/exec?docket=' + 'f'.repeat(64);
const fill = async (p, ssid, pass, url) => { await p.fill('#ssid', ssid); await p.fill('#pass', pass); await p.fill('#url', url); await p.click('#send'); };
const stored = p => p.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage) + document.cookie);

const cases = [
  /* STEP 1: INSTALL */
  ['install: no board in the list', { none: 1 }, async p => { await p.click('#go'); await until(p, 'say', /Try a different cable/); return true; }],
  ['install: port busy', { main: 'NetworkError' }, async p => { await p.click('#go'); await until(p, 'say', /Close other tabs/); return true; }],
  ['install: will not enter download mode, told to hold ☀', { main: 'Error' }, async p => { await p.click('#go'); await until(p, 'say', /hold ☀/); return true; }],
  ['install: filtered, written at 0 against the md5, reset, told to replug', {}, async p => {
    await p.click('#go'); await until(p, 'say', /^Installed/);
    const log = await p.evaluate(() => LOG.join('; '));
    const bin = fs.readFileSync(path.join(DIR, 'docket-screen.bin')), md5 = require('crypto').createHash('md5').update(bin).digest('hex');
    return fs.readFileSync(path.join(DIR, 'docket-screen.md5'), 'utf8').trim() === md5 && log.includes('filters [{"usbVendorId":12346}]')
      && log.includes('write 0 ' + bin.length + ' md5 ' + md5) && log.includes('dtr false; rts true; rts false; disconnect');
  }],
  /* STEP 2: WI-FI AND THE PRIVATE ADDRESS */
  ['settings: sent in order, kept by the board, drawn, nothing kept by the page, password field cleared', {}, async p => {
    await fill(p, SSID, PASS, URL_OK); await until(p, 'say2', /^Done/);
    const sent = await p.evaluate(() => SENT.join('\n')), nvs = await p.evaluate(() => NVS), log = await p.evaluate(() => LOG.join('; '));
    return sent === ['HELLO', 'WIFI ' + SSID, 'PASS ' + PASS, 'URL ' + URL_OK, 'SAVE'].join('\n') && nvs.WIFI === SSID && nvs.PASS === PASS && nvs.URL === URL_OK
      && log.includes('open 115200') && log.includes('close') && (await p.inputValue('#pass')) === ''
      && !/password|docket=/.test(await stored(p)) && (await p.getAttribute('#cfg', 'autocomplete')) === 'off';
  }],
  ['settings: an open network (no password) is sent as an empty PASS', {}, async p => {
    await fill(p, SSID, '', URL_OK); await until(p, 'say2', /^Done/);
    return (await p.evaluate(() => SENT)).includes('PASS ');
  }],
  ['settings: a board still drawing answers after a few HELLOs', { slow: 1 }, async p => { await fill(p, SSID, PASS, URL_OK); await until(p, 'say2', /^Done/, 15000); return true; }],
  ['settings: saved but no Wi-Fi says check the Wi-Fi', { offline: 1 }, async p => { await fill(p, SSID, PASS, URL_OK); await until(p, 'say2', /could not reach the Docket/); return true; }],
  ['settings: the verse program asks for step 1', { verse: 1 }, async p => {
    await fill(p, SSID, PASS, URL_OK); await until(p, 'say2', /Do step 1/);
    return !(await p.evaluate(() => SENT.some(l => /^(WIFI|PASS|URL)/.test(l))));
  }],
  ['settings: not the private address is refused before anything is sent', {}, async p => {
    await fill(p, SSID, PASS, 'http://example.test/?docket=x'); await until(p, 'say2', /not the private address/);
    await fill(p, SSID, PASS, 'https://example.test/exec'); await until(p, 'say2', /not the private address/);
    return (await p.evaluate(() => SENT.length)) === 0;
  }],
  ['settings: no screen in the list', { none: 1 }, async p => { await fill(p, SSID, PASS, URL_OK); await until(p, 'say2', /Try a different cable/); return true; }],
];

(async () => {
  const browser = await SB.browser('chromium');
  const fails = [];
  /* The .bin and the repo hold none of the made-up secrets' shapes: no Wi-Fi details or private address are built in. */
  const bin = fs.readFileSync(path.join(DIR, 'docket-screen.bin')).toString('latin1');
  if (/docket=[0-9a-f]{16}|script\.google\.com\/macros\/s\//.test(bin)) fails.push('the .bin holds a private address');
  for (const [name, c, ok] of cases) {
    const page = await browser.newPage();
    await page.addInitScript(FAKE_SERIAL);
    await page.route('https://unpkg.com/**', r => r.fulfill({ contentType: 'text/javascript', body: FAKE_ESPTOOL }));
    await page.route('https://screen.test/**', r => {
      const f = path.join(DIR, new URL(r.request().url()).pathname.slice(1));
      const type = { html: 'text/html', js: 'text/javascript', bin: 'application/octet-stream', md5: 'text/plain' }[f.split('.').pop()];
      return fs.existsSync(f) ? r.fulfill({ contentType: type, body: fs.readFileSync(f) }) : r.fulfill({ status: 404 });
    });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto('https://screen.test/install.html#' + encodeURIComponent(JSON.stringify(c)));
    let good = false;
    try { good = await ok(page); } catch (e) { errs.push(e.message.split('\n')[0]); }
    if (!good || errs.length) fails.push(name + ': says "' + (await say(page)) + '" / "' + (await say(page, 'say2')) + '" ' + errs.join(' '));
    await page.close();
  }
  await SB.closeAll();
  if (fails.length) { console.log('FAILED — docket screen install page\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('install-test: ' + cases.length + ' cases with a pretend board');
})();
