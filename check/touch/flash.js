/* NO OS TAP FLASH (531): the grey flash a phone paints on a tapped link is off on every control, because each control draws its own press look (U9). */
module.exports = {
  name: 'flash',
  what: 'no control on the glass or the chrome shows the system tap flash',
  run: async page => {
    const cs = await page.evaluate(() => (window.__touch ? __touch.controls() : null));
    if (!cs || !cs.length) return null;
    const clear = c => /^(transparent|rgba\(0, 0, 0, 0\))$/.test(c.flash);
    return cs.filter(c => !clear(c)).slice(0, 8).map(c => `a ${c.kind} (.${c.cls || '-'}) flashes ${c.flash} when tapped`);
  },
};
