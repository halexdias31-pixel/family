/* @family. — check/touch-walk.js EVERY COLUMN'S CONTROLS, PRESSED ONE BY ONE (536): the walk the press scenarios in check/touch/ share, run once per page. */
/* Not a scenario (it lives beside the folder): `walk(page)` visits every column this visitor has and returns what each control did when `.is-pressed` went on. */
'use strict';

/* THE CONTROLS THE BASE PRESS RULE COVERS (style.css, 536); a field, the keypad's `.kp-*` and a disabled control are not pressed. */
const SEL = '[data-do], .tab, button, summary, a[href], label:has(input[type="checkbox"], input[type="radio"]), [role="button"]';
/* ONE OF A KIND IS ENOUGH: a control is its tag and classes, and a column of forty identical rows is pressed four times. */
const PER_KIND = 4, PER_COLUMN = 160;

/* IN THE PAGE: press each control of the column in front and read the look three ways — before, frame one, and settled with transitions off. */
function probe(arg) {
  const [id, SEL, PER_KIND, PER_COLUMN] = arg;
  const front = document.querySelector('#s-' + id + ' > .page.on');
  if (!front) return null;
  const PROPS = ['transform', 'background-color', 'background-image', 'filter', 'opacity', 'border-top-color', 'box-shadow', 'color', 'text-decoration-color'];
  const read = el => {
    const out = [];
    const one = (cs, tag) => out.push(tag + PROPS.map(p => cs.getPropertyValue(p)).join('|'));
    one(getComputedStyle(el), 'el:'); one(getComputedStyle(el, '::before'), 'b:'); one(getComputedStyle(el, '::after'), 'a:');
    [...el.querySelectorAll('*')].slice(0, 40).forEach((c, i) => one(getComputedStyle(c), i + ':'));
    return out;
  };
  const kind = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim()
    ? '.' + el.className.trim().split(/\s+/).filter(c => c !== 'is-pressed').slice(0, 3).join('.') : '');
  const still = document.createElement('style');
  still.textContent = '*, *::before, *::after { transition: none !important; }';
  const seen = {}, rows = [], disabled = [];
  const hidden = el => { const b = el.getBoundingClientRect(); return !b.width || !b.height || getComputedStyle(el).visibility === 'hidden'; };
  for (const el of front.querySelectorAll(SEL)) {
    if (rows.length >= PER_COLUMN) break;
    if (el.matches('input, select, textarea') || el.closest('[class^="kp-"], [class*=" kp-"]') || hidden(el)) continue;
    const k = kind(el);
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') {
      /* A DISABLED CONTROL TAKES ITS OWN TAP: what is under the finger at its centre is the control, not the card behind it. */
      const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) {
        const hit = document.elementFromPoint(x, y);
        disabled.push({ kind: k, hit: !!hit && (hit === el || el.contains(hit)), under: hit ? kind(hit) : 'nothing' });
      }
      continue;
    }
    if ((seen[k] = (seen[k] || 0) + 1) > PER_KIND) continue;
    const cs = getComputedStyle(el);
    document.head.append(still);
    const base = read(el);
    el.classList.add('is-pressed');
    const fin = read(el);
    el.classList.remove('is-pressed');
    still.remove();
    void getComputedStyle(el).color;
    el.classList.add('is-pressed');
    const first = read(el);
    const durs = getComputedStyle(el).transitionDuration;
    el.classList.remove('is-pressed');
    rows.push({ kind: k, look: base.some((v, i) => v !== fin[i]), instant: first.every((v, i) => v === fin[i]),
                durs, select: cs.userSelect || cs.webkitUserSelect, callout: cs.webkitTouchCallout || '' });
  }
  return { rows, disabled };
}

/* IN THE PAGE: one control of each kind the pressing code must light, and where its centre is on the glass. */
function samples(id) {
  const front = document.querySelector('#s-' + id + ' > .page.on');
  if (!front) return [];
  const KINDS = [['button', 'button:not([data-do])'], ['link', 'a[href]'], ['summary', 'summary'], ['label', 'label'],
                 ['role-button', '[role="button"]'], ['data-do', '[data-do]:not(input, select, textarea)']];
  const out = [];
  document.querySelectorAll('[data-touch-walk]').forEach(e => e.removeAttribute('data-touch-walk'));
  /* THE CONTROL THE FINGER MEETS IS THIS ONE, not a field or a button inside it. */
  const NEAREST = '[data-do], .tab, button, a[href], summary, label, [role="button"], input, select, textarea';
  KINDS.forEach(([k, sel]) => {
    for (const el of front.querySelectorAll(sel)) {
      if (el.disabled || el.closest('[class^="kp-"], [class*=" kp-"]')) continue;
      /* BELOW THE FOLD IS STILL ON THIS COLUMN: brought up the column, never sideways. */
      const r0 = el.getBoundingClientRect();
      if (r0.width && (r0.top < 0 || r0.bottom > innerHeight)) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (!b.width || !b.height || x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (!hit || hit.closest(NEAREST) !== el) continue;
      const tag = 'tw' + out.length;
      el.setAttribute('data-touch-walk', tag);
      out.push({ k, tag, x, y, cls: String(el.className || '').split(' ').slice(0, 2).join('.') });
      break;
    }
  });
  return out;
}

/* A FINGER ON IT, FOR REAL: a trusted touch whose click is swallowed before the app sees it, so nothing it does happens. Reports whether the mark was on during pointerdown. */
async function touchOnce(page, cdp, s) {
  await page.evaluate(tag => {
    const el = document.querySelector('[data-touch-walk="' + tag + '"]');
    window.__tw = { lit: null };
    const down = e => { __tw.lit = !!el && el.classList.contains('is-pressed');
      __tw.why = { conn: !!el && el.isConnected, tgt: e.target && (e.target.tagName + '.' + String(e.target.className).slice(0, 30)), pressed: PRESSED ? PRESSED.tagName + '.' + String(PRESSED.className).slice(0, 30) : null, sliding: PRESS_SLIDING }; };
    const eat = e => { e.preventDefault(); e.stopImmediatePropagation(); };
    addEventListener('pointerdown', down, { once: true });
    addEventListener('click', eat, { capture: true, once: true });
    __tw.off = () => { removeEventListener('pointerdown', down); removeEventListener('click', eat, { capture: true }); };
  }, s.tag);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: s.x, y: s.y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(120);
  return page.evaluate(() => { __tw.off(); return { lit: __tw.lit, why: __tw.why }; });
}

const CACHE = new WeakMap();
/* THE WALK: every column of `TABS`, instantly, then back where it started. Cached on the page, so every scenario of one visitor and width reads one walk. */
async function walk(page) {
  if (CACHE.has(page)) return CACHE.get(page);
  const job = (async () => {
    const ids = await page.evaluate(() => ({ at: AT, ids: TABS.map(t => t.id) }));
    const touch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
    const cdp = touch ? await page.context().newCDPSession(page) : null;
    const cols = [];
    for (const id of ids.ids) {
      await page.evaluate(i => go(i, false, true), id);
      await page.waitForTimeout(700);
      const got = await page.evaluate(probe, [id, SEL, PER_KIND, PER_COLUMN]);
      if (!got) continue;
      const marks = [];
      if (cdp) for (const s of await page.evaluate(samples, id)) marks.push(Object.assign(await touchOnce(page, cdp, s), s));
      cols.push(Object.assign({ id, marks }, got));
    }
    await page.evaluate(i => go(i, false, true), ids.at);
    await page.waitForTimeout(400);
    /* A LINK TILE, which the fixture draws on no column: made by the app's own `tile_({ href })`, laid at the top of the card in front, pressed, and taken away. */
    if (cdp && !cols.some(c => c.marks.some(m => m.k === 'link'))) {
      const s = await page.evaluate(() => {
        const pane = document.querySelector('#s-' + AT + ' > .page.on > .pane');
        if (!pane || typeof tile_ !== 'function') return null;
        const row = document.createElement('div');
        row.className = 'tile-row'; row.setAttribute('data-touch-made', '');
        row.innerHTML = tile_({ icon: 'play', label: 'Watch', href: 'https://example.com/' });
        pane.prepend(row);
        const el = row.querySelector('a[href]');
        if (!el) return null;
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
        el.setAttribute('data-touch-walk', 'made');
        const b = el.getBoundingClientRect();
        return { k: 'link', tag: 'made', x: b.left + b.width / 2, y: b.top + b.height / 2, cls: String(el.className).split(' ').slice(0, 2).join('.') };
      });
      if (s) {
        const got = await touchOnce(page, cdp, s);
        cols.push({ id: 'a made link tile', rows: [], disabled: [], marks: [Object.assign(got, s)] });
      }
      await page.evaluate(() => document.querySelectorAll('[data-touch-made]').forEach(e => e.remove()));
    }
    if (cdp) await cdp.detach().catch(() => {});
    return cols;
  })();
  CACHE.set(page, job);
  return job;
}

module.exports = { walk, SEL };
