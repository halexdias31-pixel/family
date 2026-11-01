/* A SETTLED APP IS QUIET (531): once the payload and library are in and drawn, nothing untouched runs a task past 500 ms (244 ms was the worst seen). The 50 ms figure (U4, M1) is reported by quiet-50 until proven. */
const HARD = 500;
module.exports = {
  name: 'quiet',
  what: 'a settled, untouched app runs no long task',
  run: async page => {
    const t0 = await page.evaluate(() => (window.__jank && !window.__jank.broken ? __jank.mark() : null));
    if (t0 === null) return null;
    await page.waitForTimeout(3000);
    const got = await page.evaluate(t => ({ all: __jank.tasksSince(t).map(x => Math.round(x.d)), worst: __jank.longest(t) }), t0);
    return got.all.filter(d => d > HARD).map(d => `a ${d} ms task ran with nothing touched (budget ${HARD} ms)`);
  },
};
