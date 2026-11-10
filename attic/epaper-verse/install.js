// install.js - one button: put the verse program on the screen. Nothing to type; the screen needs no Wi-Fi.
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.6.1/bundle.js';

const ESPRESSIF = 0x303a;   // the ESP32-S3's own USB: the only thing the Chrome list will show
const $ = id => document.getElementById(id);
const say = t => { $('say').textContent = t; };
const quiet = { clean() {}, writeLine() {}, write() {} };

// The picture version is offered only once its .bin is built and published beside this page.
fetch('epaper-verse-icons.bin', { method: 'HEAD' }).then(r => { if (r.ok) $('pick').hidden = false; }).catch(() => {});

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
      : 'Hold BOOT, unplug and replug, then press Install again.');
  }
  const data = new Uint8Array(await (await fetch($('pick').hidden ? 'epaper-verse.bin' : $('kind').value)).arrayBuffer());
  $('bar').hidden = false;
  // The flash is read back against this MD5 and esptool-js throws on a mismatch (485); the picture version has no sidecar.
  const md5 = $('pick').hidden ? (await (await fetch('epaper-verse.md5')).text()).trim() : null;
  await loader.writeFlash({ fileArray: [{ data, address: 0 }], flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep',
    eraseAll: false, compress: true, ...(md5 ? { calculateMD5Hash: () => md5 } : {}), reportProgress: (i, done, all) => { $('bar').value = done / all; } });
  // esptool-js 0.6.1's hard_reset only lowers RTS, already low, so the S3 stayed in its installer: RTS high with DTR low resets it (485).
  try { await transport.setDTR(false); await transport.setRTS(true); await new Promise(r => setTimeout(r, 120)); await transport.setRTS(false); } catch (_) {}
  try { await transport.disconnect(); } catch (_) {}
  $('bar').hidden = true;
  say('Done. Now unplug the screen and plug it back in (or into its charger) — the verse appears in a few seconds.');
}
