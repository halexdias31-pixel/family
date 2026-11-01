/* THE 50 ms BUDGET FOR A SETTLED APP (U4; the 2.9 s post-boot task is M1, NEEDS PROOF), reported until package H proves and gates it. */
module.exports = {
  name: 'quiet-50',
  what: 'tasks over 50 ms in the 3 s after settling (report)',
  report: true,
  run: async page => {
    const t0 = await page.evaluate(() => (window.__jank && !window.__jank.broken ? __jank.mark() : null));
    if (t0 === null) return null;
    await page.waitForTimeout(3000);
    const all = await page.evaluate(t => __jank.tasksSince(t).map(x => Math.round(x.d)), t0);
    return all.length ? [`${all.length} task(s) over 50 ms, longest ${Math.max(...all)} ms`] : [];
  },
};
