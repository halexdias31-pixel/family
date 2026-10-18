#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* ==================================================================================================
   @family. — check/sounds.js

   THE CHIME AND THE BUZZER, IN A REAL BROWSER: WHAT THEY SOUND LIKE, AND THAT A REAL TAP STARTS THEM.

   *"Make it make a nice noise when they get a question right and a buzzer when wrong."* — the owner,
   11 Oct (note 340). `check-flow.js` proves WHEN a sound is asked for, with a recording AudioContext that
   keeps an iPad's rules: one per press of the right kind, none for anything that only draws a verdict,
   none with the switch off, and Mark with AI's woken at its press. jsdom has no Web Audio, so two things
   live only here:

     THE SOUNDS   both built by the app's own `markTone_` into an OfflineAudioContext and rendered: the
                  chime about 0.3s and RISING (its second note higher than its first, counted in zero
                  crossings), the buzzer about 0.4s; each one's loudest sample under the Timer's flat
                  0.08, the one sound here meant to cross a room; and each SILENT BEFORE IT STARTS AND
                  AFTER IT ENDS, with no step between two samples in its first or last 2ms bigger than a
                  twentieth of its peak — a step is a click, which the Timer's beep has at both ends.
     HOW LOUD     TO AN EAR, NOT TO A METER: the loudest 85ms of each, A-weighted (how the ear hears), and
                  again through a phone's speaker (a 700 Hz high-pass, then A-weighted) — beside the
                  Timer's beep built as games.js builds it. Each at least 6 dB under the Timer to the ear,
                  and the buzzer no more than 3 dB under the chime either way. A RULE ON LOUDEST SAMPLES
                  ALONE PASSED A BUZZER HALF AS LOUD AS THE CHIME: 110 Hz through 800 Hz has its weight
                  where an ear hears least and a phone plays nothing (review of 11 Oct, note 340).
     THE TAP      Q0664 (5/8 of 24) on Find, its Send pressed by a REAL click (Playwright's, which the
                  browser trusts as a user's): nothing made at load; the AudioContext made, and every
                  `resume()` called, INSIDE THE TAP; ONE sound per press — a buzzer for 16, a chime for
                  15; the card's sound switch pressed off by a real click, then a press, and nothing; on
                  again, the chime once; a repaint, nothing; and the context AT REST (suspended) a
                  second after a sound ends and straight after the switch goes off.
                  "INSIDE THE TAP" IS A FLAG SET BY A CAPTURE-PHASE LISTENER on the press's own events and
                  cleared by a `setTimeout(0)` — the synchronous handler and nothing after it. It was
                  `navigator.userActivation.isActive`, which Chromium keeps true for seconds after a click,
                  so a sound deferred 300ms by `setTimeout` — outside the tap on an iPad — passed here
                  (review of 11 Oct). The oscillators' starts are still asked of that window, and only of
                  that: once a context is running, a sound may start whenever the app likes.
                  HEADLESS CHROMIUM LETS A CONTEXT RUN WITHOUT A TAP (measured: one made at load by a
                  mutation came up `running`, with no warning), so the proof is the flag written down at
                  the moment, not the browser refusing. Its warning, where a build does print one, is
                  listened for as well.

   The recording is a subclass of the browser's own AudioContext installed before the app runs, so every
   sound still plays — it only writes down what was made, when, and from where.

   A RULE THAT COULD NOT REACH ITS SUBJECT FAILS, SAYING SO — no `markTone_`, no Q0664, no sound switch.

     node check/sounds.js
   SOUNDS_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT_WANTED = Number(process.env.SOUNDS_PORT || 0);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* THE TIMER'S LEVEL (games.js, `timerTick`): a flat 0.08. Both marking sounds stay under it. */
const TIMER_PEAK = 0.08;

const serve = () => new Promise(ok => {
  const srv = http.createServer((q, r) => {
    const rel = decodeURIComponent(q.url.split('?')[0]);
    const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end('no'); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(p).pipe(r);
  });
  srv.listen(PORT_WANTED, () => ok(srv));
});

/* ---------- THE RECORDING, BEFORE THE APP RUNS ----------------------------------------------------------
   Every construction and every `resume()` with whether a tap was in progress, every oscillator started
   (its type, the frequency it was set to, inside a tap or not), and every node connected to the
   destination, which is one per sound. */
const RECORD = () => {
  const REAL = window.AudioContext;
  if (!REAL) return;
  const au = window.__au = { made: [], resumed: [], suspended: 0, starts: [], outs: 0 };
  const tap = () => !!(navigator.userActivation && navigator.userActivation.isActive);
  /* THE PRESS ITSELF: set before any of the app's handlers (capture, on the window), gone once the task
     that dispatched it is over. */
  let inTap = false;
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchend', 'keydown'].forEach(t =>
    window.addEventListener(t, () => { inTap = true; setTimeout(() => { inTap = false; }, 0); }, true));
  class Rec extends REAL {
    constructor(o) { super(o); au.made.push({ tap: inTap, state: this.state }); }
    resume() { au.resumed.push({ tap: inTap, state: this.state }); return super.resume(); }
    suspend() { au.suspended++; return super.suspend(); }
    createOscillator() {
      const o = super.createOscillator();
      let hz = o.frequency.value;
      const set = o.frequency.setValueAtTime.bind(o.frequency);
      o.frequency.setValueAtTime = (v, t) => { hz = v; return set(v, t); };
      const start = o.start.bind(o);
      o.start = t => { au.starts.push({ tap: tap(), type: o.type, hz: hz }); return start(t); };
      return o;
    }
    createGain() {
      const g = super.createGain();
      const connect = g.connect.bind(g);
      g.connect = (n, ...rest) => { if (n === this.destination) au.outs++; return connect(n, ...rest); };
      return g;
    }
  }
  window.AudioContext = Rec;
};

/* ---------- THE TWO SOUNDS, RENDERED --------------------------------------------------------------------
   48kHz, started 50ms in, so "silent before it starts" has samples to be silent in. The samples come back
   too, with the Timer's beep built as games.js builds it (880 Hz, a flat 0.08, 0.35s), for the ear. */
const RENDER = async () => {
  const out = { samples: {} };
  {
    const off = new OfflineAudioContext(1, Math.ceil(48000 * 0.8), 48000);
    const o = off.createOscillator(), g = off.createGain();
    o.connect(g); g.connect(off.destination);
    o.frequency.value = 880; g.gain.value = 0.08;
    o.start(0.05); o.stop(0.05 + 0.35);
    out.samples.timer = Array.from((await off.startRendering()).getChannelData(0));
  }
  for (const kind of ['right', 'wrong']) {
    const sr = 48000, t0 = 0.05;
    const off = new OfflineAudioContext(1, Math.ceil(sr * 0.8), sr);
    const end = markTone_(off, t0, kind, off.destination);
    const d = (await off.startRendering()).getChannelData(0);
    const a = Math.round(t0 * sr), z = Math.round(end * sr);
    let peak = 0, before = 0, after = 0, stepIn = 0, stepOut = 0;
    for (let i = 0; i < d.length; i++) {
      const v = Math.abs(d[i]);
      if (v > peak) peak = v;
      if (i < a) before = Math.max(before, v);
      if (i > z + 2) after = Math.max(after, v);
    }
    const w = Math.round(sr * 0.002);
    for (let i = a + 1; i <= a + w; i++) stepIn = Math.max(stepIn, Math.abs(d[i] - d[i - 1]));
    for (let i = z - w; i <= z + 2 && i < d.length; i++) stepOut = Math.max(stepOut, Math.abs(d[i] - d[i - 1]));
    /* HOW HIGH, roughly: zero crossings over a window, halved, per second. */
    const pitch = (s, e) => {
      let n = 0;
      for (let i = Math.round(s * sr) + 1; i < Math.round(e * sr); i++) if ((d[i - 1] < 0) !== (d[i] < 0)) n++;
      return Math.round(n / 2 / (e - s));
    };
    out.samples[kind] = Array.from(d);
    out[kind] = { length: +(end - t0).toFixed(3), peak: +peak.toFixed(4), before, after: +after.toFixed(6),
                  stepIn: +stepIn.toFixed(5), stepOut: +stepOut.toFixed(5),
                  early: pitch(t0 + 0.02, t0 + 0.08), late: pitch(t0 + 0.16, t0 + 0.26) };
  }
  return out;
};

/* ---------- HOW LOUD, TO AN EAR ---------------------------------------------------------------------------
   THE LOUDEST 85ms (4096 samples at 48kHz, Hann-windowed, every 512), weighted by `wf` per frequency, in dB.
   A-weighting is the ear's: down 19 dB at 100 Hz, level at 1 kHz. A PHONE is the same through a 700 Hz
   second-order high-pass, which is about where a phone's speaker gives out; it is a model, and it is the
   difference between "quiet" and "not there" for a buzzer whose weight is low. */
const LOUD = (() => {
  const SR = 48000, N = 4096, HOP = 512;
  const fft = (re, im) => {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k), wi = Math.sin(ang * k), a = i + k, b = a + len / 2;
        const vr = re[b] * wr - im[b] * wi, vi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - vr; im[b] = im[a] - vi; re[a] += vr; im[a] += vi;
      }
    }
  };
  const A = f => { const f2 = f * f; return (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2)) * 10 ** (2 / 20); };
  const HP = (f, fc) => { const x = (f / fc) ** 2; return x / Math.sqrt((1 - x) ** 2 + (x / 0.7) ** 2); };
  const hann = Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
  const hw = Math.sqrt(hann.reduce((s, v) => s + v * v, 0) / N);
  const level = (d, wf) => {
    let best = 0;
    for (let s = 0; s + N <= d.length; s += HOP) {
      const re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < N; i++) re[i] = d[s + i] * hann[i];
      fft(re, im);
      let e = 0;
      for (let k = 1; k < N / 2; k++) { const f = k * SR / N; e += (re[k] ** 2 + im[k] ** 2) * wf(f) ** 2; }
      best = Math.max(best, Math.sqrt(2 * e) / N / hw);
    }
    return +(20 * Math.log10(best)).toFixed(1);
  };
  return d => ({ ear: level(d, A), phone: level(d, f => A(f) * HP(f, 700)) });
})();

(async () => {
  const srv = await serve();
  const PORT = srv.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  /* `user-gesture-required`, A PHONE'S RULE, asked of a desktop browser -- which headless Chromium does not
     enforce on Web Audio (see the head of this file), so the recording's tap flag carries the proof. */
  const browser = await chromium.launch(Object.assign({ args: ['--autoplay-policy=user-gesture-required'] }, exe ? { executablePath: exe } : {}));
  const bad = [], said = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(RECORD);
    const page = await ctx.newPage();
    page.on('console', m => { if (/AudioContext/i.test(m.text())) said.push(m.text()); });
    page.on('pageerror', e => bad.push('a script error on the page: ' + e.message));
    /* NOTHING LEAVES THE MACHINE: the backend answers with the fixture; everything else is refused. */
    await page.route('**/*', r => {
      const u = r.request().url();
      if (/^http:\/\/localhost:/.test(u)) return r.continue();
      if (/script\.google\.com/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE });
      return r.abort();
    });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA && typeof stuffItemsAll_ === 'function'
      && stuffItemsAll_().length > 100 && document.getElementById('splash').classList.contains('done'), null, { timeout: 120000 });
    await page.waitForTimeout(600);
    const au = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__au || null)));
    const a0 = await au();
    if (!a0) throw new Error('this Chromium has no AudioContext — nothing could be recorded');
    if (a0.made.length || a0.outs) bad.push('at load, before any press: ' + a0.made.length + ' AudioContext(s) made and ' + a0.outs + ' sound(s)');

    /* ---- THE SOUNDS ---- */
    if (!(await page.evaluate(() => typeof markTone_ === 'function'))) bad.push('markTone_ is not on the page — the sounds were NOT rendered');
    else {
      const r = await page.evaluate(RENDER);
      const each = (kind, name, lo, hi) => {
        const s = r[kind];
        if (s.length < lo || s.length > hi) bad.push(`the ${name} lasts ${s.length}s, wanted ${lo}–${hi}s`);
        if (!(s.peak > 0.01)) bad.push(`the ${name}'s loudest sample is ${s.peak} — it is not there to hear`);
        if (s.peak >= TIMER_PEAK) bad.push(`the ${name}'s loudest sample is ${s.peak}, not under the Timer's ${TIMER_PEAK}`);
        if (s.before !== 0) bad.push(`the ${name} makes sound (${s.before}) before it starts`);
        if (s.after > 1e-4) bad.push(`the ${name} is still sounding (${s.after}) after its end`);
        if (s.stepIn > s.peak / 20) bad.push(`the ${name} starts with a click: a step of ${s.stepIn} between two samples in its first 2ms (its peak is ${s.peak})`);
        if (s.stepOut > s.peak / 20) bad.push(`the ${name} ends with a click: a step of ${s.stepOut} between two samples in its last 2ms (its peak is ${s.peak})`);
      };
      each('right', 'chime', 0.25, 0.36);
      each('wrong', 'buzzer', 0.35, 0.45);
      /* TO AN EAR: both well under the Timer, and the buzzer -- the one a child must not miss -- no more
         than 3 dB under the chime, to the ear or through a phone. */
      const L = { chime: LOUD(r.samples.right), buzzer: LOUD(r.samples.wrong), timer: LOUD(r.samples.timer) };
      ['chime', 'buzzer'].forEach(k => {
        if (L[k].ear > L.timer.ear - 6) bad.push(`the ${k} is ${L[k].ear} dB(A) over its loudest 85ms, not 6 dB under the Timer's ${L.timer.ear}`);
      });
      if (L.buzzer.ear < L.chime.ear - 3) bad.push(`the buzzer is ${L.buzzer.ear} dB(A) to the ear and the chime ${L.chime.ear}: ${(L.chime.ear - L.buzzer.ear).toFixed(1)} dB quieter, wanted no more than 3`);
      if (L.buzzer.phone < L.chime.phone - 3) bad.push(`through a phone's speaker the buzzer is ${L.buzzer.phone} dB(A) and the chime ${L.chime.phone}: ${(L.chime.phone - L.buzzer.phone).toFixed(1)} dB quieter, wanted no more than 3`);
      console.log(`  to an ear (loudest 85ms, dB(A))  chime ${L.chime.ear}, buzzer ${L.buzzer.ear}, the Timer ${L.timer.ear}; through a phone  chime ${L.chime.phone}, buzzer ${L.buzzer.phone}, the Timer ${L.timer.phone}`);
      if (!(r.right.late > r.right.early * 1.15)) bad.push(`the chime does not rise: about ${r.right.early} Hz then ${r.right.late} Hz`);
      console.log(`  the chime   ${r.right.length}s, peak ${r.right.peak}, about ${r.right.early} Hz rising to ${r.right.late} Hz, first/last 2ms steps ${r.right.stepIn}/${r.right.stepOut}`);
      console.log(`  the buzzer  ${r.wrong.length}s, peak ${r.wrong.peak}, first/last 2ms steps ${r.wrong.stepIn}/${r.wrong.stepOut}`);
    }

    /* ---- A REAL TAP: Q0664, 5/8 of 24, on Find ---- */
    const open = await page.evaluate(async () => {
      const it = stuffItemsAll_().find(x => x.kind === 'question' && x.row && x.row.row_id === 'Q0664');
      if (!it) return 'Q0664 is not in the library';
      try { localStorage.removeItem(ansKey_(it)); } catch (e) {}
      go('stuff');
      STUFF.filters = [{ field: 'paperId', value: FACETS.find(f => f.field === 'paperId').of(it) }];
      paintStuff();
      goPage('stuff', (typeof stuffFirstResult_ === 'function' ? stuffFirstResult_() : 1) + stuffPageOf_(it), true);
      for (let i = 0; i < 80; i++) {
        await new Promise(d => setTimeout(d, 100));
        const inp = [...document.querySelectorAll('#s-stuff .page.on .qp-ans-in')].find(b => b.getAttribute('data-k') === ansKey_(it));
        const card = inp && inp.closest('.qcard');
        if (!card) continue;
        card.querySelector('.qp-check').setAttribute('data-sounds', 'send');
        const tile = card.closest('.page').querySelector('.tile-row .mark-sound');
        if (tile) tile.setAttribute('data-sounds', 'switch');
        window.__soundsBox = inp;
        return tile ? '' : 'Q0664 is in front with no sound switch in its row';
      }
      return 'Q0664 never came in front';
    });
    if (open) bad.push(open + ' — the tap was NOT pressed');
    else {
      const press = async (v, ms) => {
        await page.evaluate(x => { window.__soundsBox.value = x; window.__soundsBox.dispatchEvent(new Event('input', { bubbles: true })); }, v);
        const was = await au();
        await page.click('[data-sounds="send"]');
        await page.waitForTimeout(ms || 500);
        const now = await au();
        return { outs: now.outs - was.outs, starts: now.starts.slice(was.starts.length), now };
      };
      const wrong = await press('16');
      if (wrong.outs !== 1 || !wrong.starts.length || !wrong.starts.every(s => s.hz < 300 && /sawtooth|square/.test(s.type))) {
        bad.push('a real tap on Send with 16 made ' + wrong.outs + ' sound(s) of ' + JSON.stringify(wrong.starts) + ' — wanted one buzzer');
      }
      const made = wrong.now.made;
      if (made.length !== 1 || !made[0].tap) bad.push('the AudioContext was made ' + JSON.stringify(made) + ' — wanted once, inside the tap');
      if (!wrong.starts.every(s => s.tap)) bad.push('the buzzer started outside the browser\'s activation window: ' + JSON.stringify(wrong.starts));
      /* AT REST A SECOND AFTER THE SOUND ENDS -- a running context with nothing to play holds a phone's
         audio output awake. Asked for up to 4s: a timer fires late on a loaded machine, never early. */
      const restsBy = async ms => {
        for (let t = 0; t <= ms; t += 100) {
          if (await page.evaluate(() => typeof MARK_AC !== 'undefined' && !!MARK_AC && MARK_AC.state === 'suspended')) return true;
          await page.waitForTimeout(100);
        }
        return false;
      };
      if (!(await restsBy(4000))) bad.push('four seconds after the buzzer the AudioContext is still ' + (await page.evaluate(() => typeof MARK_AC !== 'undefined' && MARK_AC ? MARK_AC.state : 'not there')) + ' — left running with nothing to play');
      const right = await press('15');
      if (right.outs !== 1 || right.starts.length !== 4 || !right.starts.every(s => s.hz >= 500 && s.type === 'sine' && s.tap)) {
        bad.push('a real tap on Send with 15 made ' + right.outs + ' sound(s) of ' + JSON.stringify(right.starts) + ' — wanted one chime, two notes of two sines, inside the tap');
      }
      /* THE SWITCH, BY A REAL CLICK -- with the chime's own rest (a second after it ends) cancelled first,
         so a rest that comes now is the switch's however loaded the machine is. */
      await page.evaluate(() => markRest_(-1));
      const restsBefore = (await au()).suspended;
      await page.click('[data-sounds="switch"]');
      await page.waitForTimeout(200);
      const off = await page.evaluate(() => { const t = document.querySelector('[data-sounds="switch"]'); return { name: t.getAttribute('aria-label'), pressed: t.getAttribute('aria-pressed'), kept: localStorage.getItem('mark-sound') }; });
      if (off.name !== 'Sound off' || off.pressed !== 'false' || off.kept !== '0') bad.push('the switch pressed off says ' + JSON.stringify(off));
      /* A NEW `suspend()`, waited for -- the context may already be at rest from the chime on a loaded machine,
         and the switch's own rest is 0.1s away. */
      let restedNow = false;
      for (let t = 0; t <= 2000 && !restedNow; t += 100) { restedNow = (await au()).suspended > restsBefore; if (!restedNow) await page.waitForTimeout(100); }
      if (!restedNow || !(await restsBy(2000))) bad.push('the switch pressed off did not put the AudioContext to rest — nothing can play');
      const hush = await press('16');
      if (hush.outs || hush.starts.length) bad.push('with the switch off a real tap made ' + hush.outs + ' sound(s)');
      const was = await au();
      await page.click('[data-sounds="switch"]');
      await page.waitForTimeout(500);
      const on = await au();
      const preview = on.starts.slice(was.starts.length);
      if (on.outs - was.outs !== 1 || !preview.every(s => s.type === 'sine' && s.tap)) bad.push('the switch pressed on made ' + (on.outs - was.outs) + ' sound(s) of ' + JSON.stringify(preview) + ' — wanted the chime once');
      /* A REPAINT, AND EVERY SLOT PAINTED AGAIN: nothing. */
      await page.evaluate(() => { repaint(); subPaintAll_(); });
      await page.waitForTimeout(400);
      const after = await au();
      if (after.outs !== on.outs) bad.push('a repaint made ' + (after.outs - on.outs) + ' sound(s)');
      if (after.made.length !== 1) bad.push(after.made.length + ' AudioContexts were made over the visit — one, woken each press');
      if (!after.resumed.length || !after.resumed.every(x => x.tap)) bad.push('resume() was called outside the tap: ' + JSON.stringify(after.resumed) + ' — an iPad wakes a context only inside one');
      await page.evaluate(() => { try { localStorage.removeItem('mark-sound'); } catch (e) {} });
    }
    if (said.length) bad.push('Chromium said: ' + said.slice(0, 3).join(' | '));
  } catch (e) {
    bad.push('COULD NOT RUN — ' + e.message);
  } finally {
    await browser.close();
    srv.close();
  }
  if (bad.length) {
    console.log('\nFAILED — ' + bad.length + ' thing(s) about the marking sounds:');
    bad.forEach(b => console.log('  ' + b));
    process.exit(1);
  }
  console.log('\nOK — the chime and the buzzer are short and quiet, the chime rises, both are silent at either end, the buzzer is as loud as the chime to an ear, one real tap is one sound, and the context rests when nothing plays.');
})();
