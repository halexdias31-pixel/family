/* THE LANDING, REPORTED (531): layout shifts in the 3 s after the payload and library arrive (U1, U5; the feed snap, the reel neighbour). Package A gates it. */
module.exports = {
  name: 'landing',
  what: 'layout shift in the 3 s after the payload lands (report)',
  report: true,
  run: async (page, ctx) => {
    const got = await page.evaluate(t => {
      if (!window.__steady || window.__steady.broken) return null;
      const xs = __steady.since(t).filter(x => x.t <= t + 3000);
      return { score: xs.reduce((a, x) => a + x.v, 0), src: [...new Set(xs.map(x => x.src.join(' ')))].slice(0, 3) };
    }, ctx.readyAt);
    if (!got) return null;
    return got.score > 0.001 ? [`shift ${got.score.toFixed(4)} as it landed (${got.src.join('; ')})`] : [];
  },
};
