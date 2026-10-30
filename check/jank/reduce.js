/* LESS MOTION TAKES THE MOVEMENT AND KEEPS THE INFORMATION (537, U12, D14): with reduced motion asked for, the "here it is" rings still last, and a toast, a fold, the sheet and the board's glide move nothing. */
module.exports = {
  name: 'reduce',
  what: 'reduced motion keeps the highlight rings and moves nothing else',
  viewers: ['student'],
  widths: [390],
  run: async page => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    try {
      const got = await page.evaluate(async () => {
        if (typeof motionOK_ !== 'function' || typeof toast !== 'function') return null;
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const bad = [];
        if (motionOK_()) bad.push('motionOK_() still says yes with reduced motion asked for');
        if (MOTION_.move !== 0 || MOTION_.enter !== 0) bad.push(`MOTION_ still moves: move ${MOTION_.move} ms, enter ${MOTION_.enter} ms`);
        /* THE RINGS: information, so they last. */
        const card = document.querySelector('#s-' + AT + ' .page.on .card') || document.querySelector('#screen .card');
        if (!card) return null;
        for (const cls of ['lay-moved', 'post-lit']) {
          card.classList.add(cls);
          const s = getComputedStyle(card), sec = parseFloat(s.animationDuration) * (/ms$/.test(s.animationDuration) ? 0.001 : 1);
          if (s.animationName === 'none' || !(sec >= 1)) bad.push(`.${cls} lasts ${s.animationDuration} (${s.animationName}) with reduced motion — the ring is information, it stays`);
          card.classList.remove(cls);
        }
        /* A TOAST arrives and is simply there. */
        toast('Less motion, still a message');
        await frame();
        const t = document.getElementById('toast');
        if (!t) bad.push('no toast was drawn');
        else if (t.getAnimations().some(a => a.playState === 'running')) bad.push('a toast moved in with reduced motion');
        /* THE SHEET opens and closes at once. */
        go('feed', false, true);
        await wait(400);
        openSheet('Probe', '<p>' + 'A line<br>'.repeat(8) + '</p>');
        await frame();
        const sh = document.getElementById('sheet');
        if (document.getAnimations().some(a => a.playState === 'running' && a.effect && a.effect.target && (sh.contains(a.effect.target) || a.effect.target.contains(sh) || /expand/.test(String(a.id)))))
          bad.push('the sheet moved as it opened with reduced motion');
        closeSheet();
        if (!sh.classList.contains('hidden')) bad.push('the sheet was still drawn the moment it closed with reduced motion');
        /* THE BOARD: a glide finishes in the frame it was asked for. */
        const ids = typeof widgetsOf_ === 'function' ? widgetsOf_('tool').map(x => String(x.id)) : [];
        const n = ids.indexOf('whiteboard');
        if (n < 0) return { bad, board: 'no whiteboard among the tools' };
        go('tools', false, true); await wait(300);
        goPage('tools', n, true);
        for (let i = 0; i < 60 && !(typeof NB_LIVE !== 'undefined' && NB_LIVE.size); i++) await wait(100);
        const b = typeof NB_LIVE !== 'undefined' && [...NB_LIVE].find(x => x.el.isConnected);
        if (!b) return { bad, board: 'the whiteboard drew no notebook' };
        const st = nbState_(b.k), v = nbView_(b, st);
        v.ny = (nbTarget_(st).ny || 0) + 120;
        nbGlide_(b);
        if (b.glide || Math.abs(v.ny - nbTarget_(st).ny) > 0.01) bad.push('the board\'s glide is still running after the frame it was asked for, with reduced motion');
        return { bad };
      });
      if (!got) return null;
      if (got.board) return [got.board + ' — the glide was not measured'];
      return got.bad;
    } finally {
      await page.emulateMedia({ reducedMotion: null });
    }
  },
};
