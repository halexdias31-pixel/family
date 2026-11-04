/* A MOVE DURING A MOVE TAKES OVER FROM WHERE THE EYE IS (537, U12): layMoveShow_ twice, 120 ms apart, on the calculator's card; the second glide starts where the first had got to, and no frame jumps. */
const SPACER = 120;
module.exports = {
  name: 'interrupt',
  what: 'a layout move interrupted by another glides on without a jump',
  viewers: ['admin'],
  /* A PHONE: at 1280 the column re-centres as the card grows (package G's anchoring, U6), which is not this glide. */
  widths: [390],
  run: async page => {
    const got = await page.evaluate(async SPACER => {
      if (typeof layMoveShow_ !== 'function' || typeof layThing_ !== 'function') return null;
      const wait = ms => new Promise(r => setTimeout(r, ms));
      /* THE CALCULATOR IS A FIND CARD (790): Find › Tools, then its page. */
      finderSet_(FINDERS.stuff, { filters: [{ field: 'forLabel', value: 'Tools' }], q: '' });
      go('stuff', false, true);
      await wait(300);
      const at = inFinder_(FINDERS.stuff, () => stuffPages_().findIndex(p => p.x && p.x.widget && String(p.x.widget.id) === 'calculator'));
      if (at > -1) goPage('stuff', inFinder_(FINDERS.stuff, () => stuffFirstResult_()) + at, true);
      await wait(500);
      const card = layThing_('w', 'calculator', 'stuff');
      if (!card || !card.parentElement || !card.getClientRects().length) return null;
      const top = () => card.getBoundingClientRect().top;
      const spacer = document.createElement('div');
      spacer.style.cssText = 'flex: none; height: ' + SPACER + 'px';
      const log = [];
      let on = true;
      /* READ JUST AFTER EACH FRAME, so it is what was painted: inside a rAF it could run before the app's own rAF had placed the glide. */
      const tick = () => { setTimeout(() => log.push(top()), 0); if (on) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      layMoveShow_('w', 'calculator', 'stuff', () => card.before(spacer));
      await wait(120);
      const before = top();
      layMoveShow_('w', 'calculator', 'stuff', () => spacer.remove());
      /* RAF ASKED AFTER layMoveShow_'s OWN, so it runs after the second glide has started, in the same frame. */
      const after = await new Promise(r => requestAnimationFrame(() => r(top())));
      await wait(900);
      on = false;
      const jumps = log.slice(1).map((y, i) => Math.abs(y - log[i]));
      return { before, after, worst: Math.max(0, ...jumps), frames: log.length, rest: Math.abs(top() - log[0]) };
    }, SPACER);
    if (!got) return null;
    const bad = [];
    if (Math.abs(got.after - got.before) > 3) bad.push(`the second move started ${Math.round(got.after - got.before)} px from where the first had got to`);
    /* NO FRAME FURTHER THAN THE WHOLE MOVE: a glide gets there over frames; a jump this size is a snap (182 px with the old CSS transition). */
    if (got.worst > SPACER) bad.push(`a frame jumped ${Math.round(got.worst)} px during the two glides, more than the ${SPACER} px move itself`);
    if (got.rest > 1) bad.push(`the card ended ${Math.round(got.rest)} px from where it began`);
    if (got.frames < 10) bad.push('only ' + got.frames + ' frames were drawn — nothing was measured');
    return bad;
  },
};
