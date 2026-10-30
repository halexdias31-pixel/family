/* THE MARK LASTS AS LONG AS THE FINGER (536, U9): a control held for 1.5 s is still lit, and it goes out within a few frames of the finger lifting. The old 1.2 s timer from the landing lost it at 1.2 s. */
const HOLD = 1500;
module.exports = {
  name: 'mark-lifetime',
  what: 'a held control stays lit while held and goes out when the finger lifts',
  widths: [390],
  run: async page => {
    /* A TILE ON THE CARD IN FRONT, wholly on the glass, and its click swallowed so holding it does nothing. */
    const at = await page.evaluate(() => {
      const front = document.querySelector('#s-' + AT + ' > .page.on');
      const el = front && [...front.querySelectorAll('.tile[data-do]:not([disabled]), [data-do]:not(input, select, textarea):not([disabled])')].find(e => {
        const b = e.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
        const hit = b.width && b.height && x > 0 && y > 0 && x < innerWidth && y < innerHeight && document.elementFromPoint(x, y);
        return hit && (hit === e || e.contains(hit));
      });
      if (!el) return null;
      el.setAttribute('data-touch-hold', '');
      const eat = e => { e.preventDefault(); e.stopImmediatePropagation(); };
      addEventListener('click', eat, { capture: true, once: true });
      addEventListener('contextmenu', eat, { capture: true, once: true });
      const b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, cls: String(el.className).split(' ').slice(0, 2).join('.') };
    });
    if (!at) return null;
    const cdp = await page.context().newCDPSession(page);
    const lit = () => page.evaluate(() => { const e = document.querySelector('[data-touch-hold]'); return !!e && e.classList.contains('is-pressed'); });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: at.x, y: at.y }] });
    const down = await lit();
    await page.waitForTimeout(HOLD);
    const held = await lit();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    /* THREE FRAMES after the lift: the mark goes two frames after it (`pressDone_`). */
    const after = await page.evaluate(() => new Promise(ok => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      const e = document.querySelector('[data-touch-hold]'); ok(!!e && e.classList.contains('is-pressed'));
    })))));
    await cdp.detach().catch(() => {});
    const out = [];
    if (!down) out.push(`.${at.cls} was not lit when the finger landed`);
    else if (!held) out.push(`.${at.cls} went out while the finger was still on it (${HOLD} ms)`);
    if (after) out.push(`.${at.cls} was still lit three frames after the finger lifted`);
    return out;
  },
};
