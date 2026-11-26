// install.js - step 1 writes docket-screen.bin (as attic/epaper-verse/install.js); step 2 sends the Wi-Fi name, password and private
// address to the screen over Web Serial (docket.cpp hear(): WIFI, PASS, URL, SAVE). They are never stored here, in the repo or in the .bin.
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.6.1/bundle.js';

const ESPRESSIF = 0x303a;   // the ESP32-S3's own USB: the only thing the Chrome list will show
const $ = id => document.getElementById(id);
const say = (t, id = 'say') => { $(id).textContent = t; };
const quiet = { clean() {}, writeLine() {}, write() {} };
const wait = ms => new Promise(r => setTimeout(r, ms));

$('go').addEventListener('click', async () => {
  $('go').disabled = true;
  try { await install(); } catch (e) { say('Something went wrong. Unplug the screen, plug it back in and press Install again.'); }
  $('go').disabled = false;
});

async function install() {
  let port;
  try { port = await navigator.serial.requestPort({ filters: [{ usbVendorId: ESPRESSIF }] }); }
  catch (e) { return say('No screen found. Try a different cable (some only charge).'); }
  const transport = new Transport(port, false);
  const loader = new ESPLoader({ transport, baudrate: 460800, romBaudrate: 115200, terminal: quiet });
  say('Installing...');
  try { await loader.main(); }
  catch (e) {
    try { await transport.disconnect(); } catch (_) {}
    const busy = e && (e.name === 'NetworkError' || e.name === 'InvalidStateError');
    return say(busy ? 'Close other tabs using the screen, then press Install again.'
      : 'Unplug the screen, hold ☀ while you plug it back in, then press Install again.');
  }
  const data = new Uint8Array(await (await fetch('docket-screen.bin')).arrayBuffer());
  const md5 = (await (await fetch('docket-screen.md5')).text()).trim();
  $('bar').hidden = false;
  await loader.writeFlash({ fileArray: [{ data, address: 0 }], flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep',
    eraseAll: false, compress: true, calculateMD5Hash: () => md5, reportProgress: (i, done, all) => { $('bar').value = done / all; } });
  // RTS high with DTR low resets the S3 out of its installer (attic/epaper-verse 485).
  try { await transport.setDTR(false); await transport.setRTS(true); await wait(120); await transport.setRTS(false); } catch (_) {}
  try { await transport.disconnect(); } catch (_) {}
  $('bar').hidden = true;
  say('Installed. Now unplug the screen, plug it back in, and do step 2.');
}

/* What the form may send: one line each, no line breaks; an https address that holds the docket token. */
function check(ssid, pass, url) {
  if (!ssid || /[\r\n]/.test(ssid + pass + url)) return 'Type the Wi-Fi name (and password) again.';
  if (!/^https:\/\/\S+[?&]docket=[^&\s]+/.test(url)) return 'That is not the private address. Copy it from the Docket: it starts https:// and has docket= in it.';
  return '';
}

$('cfg').addEventListener('submit', async ev => {
  ev.preventDefault();
  const ssid = $('ssid').value.trim(), pass = $('pass').value, url = $('url').value.trim(), bad = check(ssid, pass, url);
  if (bad) return say(bad, 'say2');
  $('send').disabled = true;
  try { await send(ssid, pass, url); } catch (e) { say('Something went wrong. Unplug the screen, plug it back in and press Send again.', 'say2'); }
  $('pass').value = '';
  $('send').disabled = false;
});

async function send(ssid, pass, url) {
  let port;
  try { port = await navigator.serial.requestPort({ filters: [{ usbVendorId: ESPRESSIF }] }); }
  catch (e) { return say('No screen found. Try a different cable (some only charge).', 'say2'); }
  try { await port.open({ baudRate: 115200 }); }
  catch (e) { return say('Close other tabs using the screen, then press Send again.', 'say2'); }
  const enc = new TextEncoder(), dec = new TextDecoder(), writer = port.writable.getWriter(), reader = port.readable.getReader();
  let buf = '';
  const lines = [];
  let done = false;
  (async () => { try { while (!done) { const { value, done: end } = await reader.read(); if (end) break; buf += dec.decode(value);
    let i; while ((i = buf.indexOf('\n')) >= 0) { lines.push(buf.slice(0, i).trim()); buf = buf.slice(i + 1); } } } catch (_) {} })();
  const line = s => writer.write(enc.encode(s + '\n'));
  const heard = async (re, ms) => { const end = Date.now() + ms; while (Date.now() < end) { const k = lines.findIndex(l => re.test(l)); if (k >= 0) return lines.splice(0, k + 1)[k]; await wait(50); } return null; };
  const close = async () => { done = true; try { await reader.cancel(); } catch (_) {} try { reader.releaseLock(); writer.releaseLock(); await port.close(); } catch (_) {} };
  say('Talking to the screen...', 'say2');
  /* The screen may still be drawing (up to half a minute on Wi-Fi) before it listens: ask every 2 s for a minute. */
  let ready = null;
  for (let t = 0; t < 30 && !ready; t++) { await line('HELLO'); ready = await heard(/^READY /, 2000); }
  if (!ready) { await close(); return say('The screen did not answer. Press ⏻ once, then press Send again.', 'say2'); }
  if (!/^READY docket-screen /.test(ready)) { await close(); return say('The screen has other software on it. Do step 1 (Install) first.', 'say2'); }
  for (const s of ['WIFI ' + ssid, 'PASS ' + pass, 'URL ' + url]) { await line(s); if (!(await heard(/^(OK|NO)/, 3000))) { await close(); return say('The screen stopped answering. Press Send again.', 'say2'); } }
  await line('SAVE');
  if (!(await heard(/^SAVED$/, 5000))) { await close(); return say('The screen did not keep the settings. Press Send again.', 'say2'); }
  say('Saved. The screen is joining your Wi-Fi...', 'say2');
  const drawn = await heard(/^DRAWN /, 60000);
  await close();
  if (drawn === 'DRAWN fresh') return say('Done. Your Docket is on the screen. It looks again every 10 minutes.', 'say2');
  say('Saved, but the screen could not reach the Docket. Check the Wi-Fi name and password and the address, then press Send again.', 'say2');
}
