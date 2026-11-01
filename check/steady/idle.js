/* IDLE COLUMNS MOVE NOTHING (531, plan section 4 "measured clean - pin it"): a settled app, untouched for 1.5 s, shifts no layout, scrolls no box and moves no card in front. */
module.exports = {
  name: 'idle',
  what: 'a settled app, untouched, moves nothing',
  run: async page => {
    const before = await page.evaluate(() => {
      if (!window.__steady || window.__steady.broken) return null;
      const f = document.querySelector('#s-' + AT + ' > .page.on');
      const r = f && f.getBoundingClientRect();
      return { t: __steady.mark(), scrolls: __steady.scrolls(), front: r ? [r.left, r.top, r.width, r.height].map(Math.round) : null, at: AT };
    });
    if (!before || !before.front) return null;
    await page.waitForTimeout(1500);
    const after = await page.evaluate(b => {
      const f = document.querySelector('#s-' + b.at + ' > .page.on');
      const r = f && f.getBoundingClientRect();
      return { score: __steady.score(b.t), src: __steady.since(b.t).map(x => x.src.join(' ')), scrolls: __steady.scrolls(),
               front: r ? [r.left, r.top, r.width, r.height].map(Math.round) : null };
    }, before);
    const out = [];
    if (after.score > 0.001) out.push(`layout shifted by ${after.score.toFixed(4)} with nothing touched (${[...new Set(after.src)].slice(0, 3).join('; ')})`);
    if (JSON.stringify(after.front) !== JSON.stringify(before.front)) out.push(`the card in front (${before.at}) moved from ${before.front} to ${after.front}`);
    const keys = new Set(Object.keys(before.scrolls).concat(Object.keys(after.scrolls)));
    keys.forEach(k => { if (String(before.scrolls[k]) !== String(after.scrolls[k])) out.push(`${k} scrolled from ${before.scrolls[k] || '0,0'} to ${after.scrolls[k] || '0,0'}`); });
    return out;
  },
};
