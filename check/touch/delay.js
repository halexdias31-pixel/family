/* A TAP IS A CLICK AT ONCE (531, section 4 "holds today; pin in touch.js"): no double-tap wait between a finger lifting and the click, on the card in front. */
/* Tapped in the card's own padding, so nothing is pressed and nothing is added to the layout that a re-fit could move. */
const MAX = 50;
module.exports = {
  name: 'delay',
  what: 'a finger lifting is a click within 50 ms',
  widths: [320, 390],
  run: async page => {
    const at = await page.evaluate(() => {
      const pane = document.querySelector('#s-' + AT + ' > .page.on > .pane');
      if (!pane) return null;
      const b = pane.getBoundingClientRect();
      const x = b.left + 4, y = b.top + 4, hit = document.elementFromPoint(x, y);
      if (!hit || !pane.contains(hit)) return { hit: hit ? hit.tagName + '.' + hit.className : 'nothing' };
      window.__tp = {};
      const mine = e => pane.contains(e.target);
      addEventListener('pointerup', e => { if (mine(e)) __tp.up = e.timeStamp; }, true);
      addEventListener('click', e => { if (mine(e) && __tp.click == null) __tp.click = e.timeStamp; }, true);
      return { x, y };
    });
    if (!at) return null;
    if (at.hit) return [`the corner of the card in front is under ${at.hit}`];
    await page.touchscreen.tap(at.x, at.y);
    await page.waitForTimeout(600);
    const tp = await page.evaluate(() => window.__tp);
    if (!tp || tp.up == null) return null;
    if (tp.click == null) return ['a tap on the card in front was never a click'];
    const d = Math.round(tp.click - tp.up);
    return d > MAX ? [`a tap became a click ${d} ms after the finger lifted (budget ${MAX} ms)`] : [];
  },
};
