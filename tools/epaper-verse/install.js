// install.js - one button: put the verse program on the screen, then hand it the Wi-Fi (Improv, as improv.h speaks it).
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.6.1/bundle.js';

const ESPRESSIF = 0x303a;   // the ESP32-S3's own USB: the only thing the Chrome list will show
const $ = id => document.getElementById(id);
const say = t => { $('say').textContent = t; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const quiet = { clean() {}, writeLine() {}, write() {} };

let port, reader, packets = [];

$('go').addEventListener('click', async () => {
  $('go').disabled = true;
  try { await install(); } catch (e) { say('Something went wrong. Unplug the screen, plug it back in and press Install again.'); }
  $('go').disabled = false;
});

async function install() {
  $('wifi').hidden = true;
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
      : 'Hold BOOT, unplug and replug, then press Install again.');
  }
  const data = new Uint8Array(await (await fetch('epaper-verse.bin')).arrayBuffer());
  $('bar').hidden = false;
  await loader.writeFlash({ fileArray: [{ data, address: 0 }], flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep',
    eraseAll: false, compress: true, reportProgress: (i, done, all) => { $('bar').value = done / all; } });
  await loader.after('hard_reset');
  await transport.disconnect();
  $('bar').hidden = true;
  say('Starting up...');
  if (!(await reopen()) || !(await improvState())) return say('Unplug the screen, plug it back in, and press Install again.');
  say('');
  $('wifi').hidden = false;
  $('ssid').focus();
}

// After the reset the board comes back on USB a moment later, sometimes as a new port.
async function reopen() {
  for (let t = 0; t < 15; t++) {
    await wait(1000);
    const ports = (await navigator.serial.getPorts()).filter(p => (p.getInfo().usbVendorId || ESPRESSIF) === ESPRESSIF);
    for (const p of [port, ...ports]) {
      try { await p.open({ baudRate: 115200 }); port = p; read(); return true; } catch (e) {}
    }
  }
  return false;
}

// Improv packet: "IMPROV", 1, type, length, data, checksum (low byte of the sum), newline.
function send(type, data) {
  const p = [...new TextEncoder().encode('IMPROV'), 1, type, data.length, ...data];
  const w = port.writable.getWriter();
  return w.write(new Uint8Array([...p, p.reduce((a, b) => a + b, 0) & 255, 10])).finally(() => w.releaseLock());
}
const rpc = (cmd, data = []) => send(3, [cmd, data.length, ...data]);

async function read() {
  reader = port.readable.getReader();
  let buf = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buf.push(...value);
      for (let i; (i = findImprov(buf)) >= 0;) {
        const len = buf[i + 8];
        if (buf.length < i + 10 + len) break;
        const sum = buf.slice(i, i + 9 + len).reduce((a, b) => a + b, 0) & 255;
        if (buf[i + 9 + len] === sum) packets.push({ type: buf[i + 7], value: buf[i + 9] });
        buf = buf.slice(i + 10 + len);
      }
    }
  } catch (e) {}
}
function findImprov(b) {
  for (let i = 0; i + 9 <= b.length; i++) if (String.fromCharCode(...b.slice(i, i + 6)) === 'IMPROV') return i;
  return -1;
}
// Waits for a state (type 1) or error (type 2) packet; asks again every second while it waits.
async function next(seconds, ask) {
  for (let t = 0; t < seconds * 10; t++) {
    const p = packets.shift();
    if (p && (p.type === 1 || p.type === 2)) return p;
    if (ask && t % 10 === 0) await ask();
    await wait(100);
  }
  return null;
}
const improvState = () => next(20, () => rpc(2));

$('wifi').addEventListener('submit', async ev => {
  ev.preventDefault();
  const enc = s => [...new TextEncoder().encode(s)];
  const s = enc($('ssid').value), p = enc($('pass').value);
  $('wifi').hidden = true;
  say('Connecting to Wi-Fi...');
  packets = [];
  await rpc(1, [s.length, ...s, p.length, ...p]);
  let r;
  do r = await next(40); while (r && r.type === 1 && r.value === 3);   // 3 = still trying
  if (r && r.type === 1 && r.value === 4) {
    say('Done - your verse is on the screen.');
    try { await reader.cancel(); await port.close(); } catch (e) {}
  } else { say('That Wi-Fi did not work. Check the name and password.'); $('wifi').hidden = false; }
});
