/* EVERY MESSAGE IS SHOWN AND READABLE (537, U11, D10): two toasts a second apart are both on the glass, the same words again come in again, each leaves by a fade, and a long one is wide and stays up. */
const LONG = 'A message of a hundred and eighteen letters, which used to be gone in two and a half seconds at a hundred and sixty px.';
module.exports = {
  name: 'toast',
  what: 'toasts queue, enter, fade out, and a long one is wide and stays',
  viewers: ['student'],
  run: async page => {
    const got = await page.evaluate(async long => {
      if (typeof toast !== 'function') return null;
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const lines = () => [...document.querySelectorAll('#toasts .toast')];
      const moving = el => el.getAnimations().some(a => a.playState === 'running');
      /* EVERY LINE THAT LEAVES: was a fade playing on it in the 250 ms before it went? */
      const seen = new Map(), left = [];
      let on = true;
      const watch = () => {
        const now = performance.now();
        lines().forEach(el => { if (el.getAnimations().some(a => a.playState === 'running' && String((a.effect.getKeyframes().slice(-1)[0] || {}).opacity) === '0')) seen.set(el, now); });
        if (on) requestAnimationFrame(watch);
      };
      requestAnimationFrame(watch);
      const host = () => document.getElementById('toasts');
      toast('First of two messages');
      await wait(30);
      const firstIn = moving(document.getElementById('toast'));
      const mo = new MutationObserver(ms => ms.forEach(m => m.removedNodes.forEach(n => {
        if (n.nodeType === 1) left.push({ text: n.textContent, faded: seen.has(n) && performance.now() - seen.get(n) <= 250 });
      })));
      if (host()) mo.observe(host(), { childList: true });
      await wait(1000);
      toast('Second of two messages');
      await wait(100);
      const both = lines().map(el => el.textContent);
      await wait(400);
      toast('Second of two messages');
      await wait(30);
      const again = moving(document.getElementById('toast'));
      toast(long);
      await wait(400);
      const app = (() => { const p = document.createElement('div'); p.style.width = 'var(--app)'; document.body.appendChild(p);
        const w = Math.min(p.getBoundingClientRect().width, innerWidth); p.remove(); return w; })();
      const wide = (document.getElementById('toast') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width;
      await wait(4600);
      const still = lines().some(el => el.textContent === long);
      await wait(3000);
      on = false; mo.disconnect();
      return { firstIn, both, again, wide, app, still, left, rest: lines().length, live: host() && host().getAttribute('role') };
    }, LONG);
    if (!got) return null;
    const bad = [];
    if (!got.firstIn) bad.push('a toast appeared with no entering motion');
    if (!(got.both.includes('First of two messages') && got.both.includes('Second of two messages'))) bad.push('a second toast a second after the first took its place: on the glass were ' + JSON.stringify(got.both));
    if (!got.again) bad.push('the same words toasted again did not come in again');
    if (got.wide < got.app * 0.7) bad.push(`a long toast is ${Math.round(got.wide)} px wide, under 70% of the app's ${Math.round(got.app)} px`);
    if (!got.still) bad.push('a 118-letter toast was gone before 5 s');
    if (got.left.length < 3) bad.push('only ' + got.left.length + ' of 3 toasts were seen leaving');
    got.left.filter(x => !x.faded).forEach(x => bad.push('"' + x.text.slice(0, 40) + '" was taken away with no fade playing in its last 250 ms'));
    if (got.rest) bad.push(got.rest + ' toast(s) still up 8 s later');
    if (got.live !== 'status') bad.push('the toasts are not a live region (role=status)');
    return bad;
  },
};
