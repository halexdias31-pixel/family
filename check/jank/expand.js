/* A FOLD OR THE SHEET OPENS AND CLOSES BY ONE MOTION (537, U6): every <details> on every column and the sheet, opened and shut; a change of more than 8 px must have a composited animation playing within two frames. */
/* And it ends shut: the sheet hidden and home, every fold back as it was. */
const MOVES = /"(transform|translate|opacity|clipPath|clip-path)"/;
module.exports = {
  name: 'expand',
  what: 'every fold and the sheet move as they open and close',
  widths: [390, 1280],
  run: async page => {
    const got = await page.evaluate(async MOVES_SRC => {
      if (typeof openSheet !== 'function' || typeof TABS === 'undefined') return null;
      const MOVES = new RegExp(MOVES_SRC);
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const moving = host => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target
        && host.contains(a.effect.target) && MOVES.test(JSON.stringify(a.effect.getKeyframes()))).length;
      const out = { folds: 0, bad: [] };
      for (const t of TABS) {
        const host = document.getElementById('s-' + t.id);
        if (!host) continue;
        /* DRAWN FIRST: a column not yet visited may not be painted. */
        go(t.id, false, true);
        await wait(300);
        const ds = [...host.querySelectorAll('details')].filter(d => d.querySelector(':scope > summary'));
        for (const d of ds) {
          const pages = [...host.querySelectorAll('.page')];
          go(t.id, false, true);
          const n = pages.indexOf(d.closest('.page'));
          if (n > -1 && typeof goPage === 'function') goPage(t.id, n, true);
          await wait(500);
          if (!d.isConnected) continue;
          const pg = d.closest('.page') || host;
          const name = t.id + ' details.' + (d.className || '?');
          const was = d.open;
          for (const step of ['first', 'back']) {
            const h0 = d.getBoundingClientRect().height;
            d.querySelector(':scope > summary').click();
            await frame();
            const anims = moving(pg);
            await wait(700);
            const dh = Math.abs(d.getBoundingClientRect().height - h0);
            out.folds++;
            if (dh > 8 && !anims) out.bad.push(`${name} ${step === 'first' ? (was ? 'closed' : 'opened') : (was ? 'opened' : 'closed')}: ${Math.round(dh)} px in one frame, no motion`);
          }
          if (d.open !== was) out.bad.push(`${name} did not end as it began after two presses`);
        }
      }
      /* THE SHEET, in the card in front of the feed. */
      go('feed', false, true);
      await wait(500);
      const sh = document.getElementById('sheet');
      openSheet('Probe', '<p>' + 'A line of the sheet<br>'.repeat(12) + '</p>');
      await frame();
      /* IN THE CARD THAT HOLDS IT, not the whole screen, where the slide may be moving something else. */
      const card = sh.closest('.sheet-host') || sh;
      const opened = moving(card);
      const opens = sh.getBoundingClientRect().height;
      await wait(600);
      closeSheet();
      await frame();
      const closing = moving(card);
      await wait(800);
      const home = document.getElementById('sheet-home');
      if (opens > 8 && !opened) out.bad.push(`the sheet opened ${Math.round(opens)} px with no motion`);
      if (opens > 8 && !closing) out.bad.push('the sheet closed with no fade');
      if (!sh.classList.contains('hidden') || sh.classList.contains('is-leaving')) out.bad.push('the sheet is not hidden 800 ms after closing');
      if (!home || home.nextElementSibling !== sh) out.bad.push('the sheet did not go home after closing');
      if (opens <= 8) out.bad.push('the sheet opened only ' + Math.round(opens) + ' px — nothing to measure');
      return out;
    }, MOVES.source);
    if (!got) return null;
    /* EVERY VISITOR HAS A FOLD TODAY (the Tutor column's tick lists); none found means the scenario measured nothing. */
    if (!got.folds) got.bad.push('no <details> fold was found on any column — nothing was opened');
    return got.bad;
  },
};
