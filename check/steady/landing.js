/* THE LANDING, REPORTED (531): layout shifts from the payload's arrival until the app went quiet (U1, U5; the feed snap, the reel neighbour). Package A gates it. */
module.exports = {
  name: 'landing',
  what: 'layout shift between the payload landing and the app going quiet (report)',
  report: true,
  run: async (page, ctx) => {
    const got = await page.evaluate(t => {
      if (!window.__steady || window.__steady.broken) return null;
      const xs = __steady.since(t[0]).filter(x => x.t <= t[1]);
      return { score: xs.reduce((a, x) => a + x.v, 0), last: xs.length ? Math.round(xs[xs.length - 1].t - t[0]) : 0,
               src: [...new Set(xs.map(x => x.src.join(' ')))].slice(0, 3) };
    }, [ctx.readyAt, ctx.quietAt]);
    if (!got) return null;
    return got.score > 0.001 ? [`shift ${got.score.toFixed(4)} as it landed, the last ${got.last} ms after the payload (${got.src.join('; ')})`] : [];
  },
};
