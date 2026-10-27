/* install-test.js - the install page in Chromium with a pretend board: node tools/epaper-verse/test/install-test.js. No board, no network. */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const DIR = path.join(__dirname, '..');

/* A pretend esptool-js: records what the page asked, fails where the case says. */
const FAKE_ESPTOOL = `
export class Transport { constructor(port) { this.port = port; } async disconnect() { LOG.push('disconnect'); }
  async setDTR(v) { LOG.push('dtr ' + v); } async setRTS(v) { LOG.push('rts ' + v); } }
export class ESPLoader {
  constructor(o) { this.t = o.transport; LOG.push('filters ' + JSON.stringify(FILTERS)); }
  async main() { if (CASE.main) { const e = new Error('x'); e.name = CASE.main; throw e; } LOG.push('main'); }
  async writeFlash(o) { LOG.push('write ' + o.fileArray[0].address + ' ' + o.fileArray[0].data.length + ' md5 ' + (o.calculateMD5Hash ? o.calculateMD5Hash() : 'none')); o.reportProgress(0, 5, 10); o.reportProgress(0, 10, 10); }
  async after(m) { LOG.push('after ' + m); }
}`;

/* A pretend navigator.serial: one Espressif port. */
const FAKE_SERIAL = () => {
  window.LOG = []; window.CASE = JSON.parse(decodeURIComponent(location.hash.slice(1)) || '{}');
  const port = { getInfo: () => ({ usbVendorId: 0x303a }) };
  window.FILTERS = null;
  Object.defineProperty(navigator, 'serial', { value: {
    async requestPort(o) { FILTERS = o.filters; if (CASE.none) { const e = new Error('none'); e.name = 'NotFoundError'; throw e; } return port; },
    async getPorts() { return [port]; },
  } });
};

const say = page => page.locator('#say').textContent();
const cases = [
  ['no board in the list', { none: 1 }, async p => (await say(p)).includes('Try a different cable')],
  ['port busy', { main: 'NetworkError' }, async p => (await say(p)).includes('Close other tabs')],
  ['will not enter download mode', { main: 'Error' }, async p => (await say(p)).includes('Hold BOOT, unplug and replug')],
  ['happy path: filtered, written at 0, reset, done', {}, async p => {
    await p.waitForFunction(() => /^Done/.test(document.getElementById('say').textContent), null, { timeout: 10000 });
    const log = await p.evaluate(() => LOG.join('; '));
    const md5 = require('crypto').createHash('md5').update(fs.readFileSync(path.join(DIR, 'epaper-verse.bin'))).digest('hex');
    /* verified against the MD5, then a real reset: RTS raised with DTR low, then lowered (485) */
    return (await say(p)) === 'Done. Now unplug the screen and plug it back in (or into its charger) — the verse appears in a few seconds.' && log.includes('filters [{"usbVendorId":12346}]')
      && log.includes('write 0 ' + fs.statSync(path.join(DIR, 'epaper-verse.bin')).size + ' md5 ' + md5) && log.includes('dtr false; rts true; rts false; disconnect')
      && !(await p.locator('input').count());
  }],
];

(async () => {
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const fails = [];
  for (const [name, c, ok] of cases) {
    const page = await browser.newPage();
    await page.addInitScript(FAKE_SERIAL);
    await page.route('https://unpkg.com/**', r => r.fulfill({ contentType: 'text/javascript', body: FAKE_ESPTOOL }));
    await page.route('https://verse.test/**', r => {
      const f = path.join(DIR, new URL(r.request().url()).pathname.slice(1));
      const type = { html: 'text/html', js: 'text/javascript', bin: 'application/octet-stream' }[f.split('.').pop()];
      return fs.existsSync(f) ? r.fulfill({ contentType: type, body: fs.readFileSync(f) }) : r.fulfill({ status: 404 });
    });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto('https://verse.test/install.html#' + encodeURIComponent(JSON.stringify(c)));
    await page.click('#go');
    let good = false;
    try { if (!c.main && !c.none) good = await ok(page); else { await page.waitForFunction(() => !document.getElementById('go').disabled, null, { timeout: 5000 }); good = await ok(page); } } catch (e) { errs.push(e.message.split('\n')[0]); }
    if (!good || errs.length) fails.push(name + ': says "' + (await say(page)) + '" ' + errs.join(' '));
    await page.close();
  }
  await browser.close();
  if (fails.length) { console.log('FAILED — install page\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('install-test: ' + cases.length + ' cases with a pretend board');
})();
