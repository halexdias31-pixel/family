/* A TRANSIENT NEVER PUSHES LAYOUT (531, section 4 "true today; pin in steady"): a message shown and gone moves nothing on the glass. */
module.exports = {
  name: 'toast',
  what: 'a toast comes and goes and nothing under it moves',
  run: async page => {
    const t = await page.evaluate(() => {
      if (!window.__steady || typeof toast !== 'function') return null;
      const t0 = __steady.mark();
      toast('A message long enough to wrap onto a second line on the narrowest phone there is.');
      return { t: t0, shown: !!document.getElementById('toast') };
    });
    if (!t || !t.shown) return null;
    await page.waitForTimeout(3200);
    const got = await page.evaluate(t0 => ({ score: __steady.score(t0), src: __steady.since(t0).map(x => x.src.join(' ')) }), t.t);
    return got.score > 0.001 ? [`a toast shifted the layout by ${got.score.toFixed(4)} (${[...new Set(got.src)].slice(0, 3).join('; ')})`] : [];
  },
};
