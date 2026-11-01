/* A CARD'S ZOOM NEVER FLIPS (533, U10): the library lands again on Find in front, and no card's zoom reverses within three frames, nor leaves the ladder. */
module.exports = {
  name: 'zoom-stable',
  what: 'as the library lands, no card zooms one way and back within three frames, and every zoom is on the ladder',
  viewers: ['student', 'admin'],
  run: async page => {
    const got = await page.evaluate(async () => {
      if (typeof paintStuff !== 'function' || typeof stuffForget_ !== 'function' || typeof go !== 'function') return null;
      const LADDER = [1, 0.875, 0.75];
      const frame = () => new Promise(r => requestAnimationFrame(r));
      go('stuff');
      for (let i = 0; i < 20; i++) await frame();
      const seen = new Map(), flips = [], off = new Set();
      let f = 0, cards = 0;
      const name = k => (k.closest('.screen') || {}).id + ' .' + String(k.className || k.tagName).split(/\s+/)[0];
      /* EVERY CARD IN EVERY PANE, EVERY FRAME: its zoom, the frame it last changed and which way. */
      const sample = () => {
        f++;
        document.querySelectorAll('.pane > *').forEach(k => {
          const z = parseFloat(k.style.zoom) || 1;
          if (!LADDER.some(s => Math.abs(s - z) < 1e-6)) off.add(name(k) + ' at ' + z);
          const h = seen.get(k);
          if (!h) { seen.set(k, { z, dir: 0, f }); cards++; return; }
          if (z === h.z) return;
          const dir = Math.sign(z - h.z);
          if (h.dir && dir === -h.dir && f - h.f <= 3) flips.push(`${name(k)} went ${h.z} and back within ${f - h.f} frames`);
          Object.assign(h, { z, dir, f });
        });
      };
      /* THE LANDING, AGAIN: the library held back as "the library still coming" holds it (check/states.js), then given back. */
      const held = { rows: LIBRARY_ROWS, data: {} };
      Object.keys(DATA).forEach(k => { if (Array.isArray(DATA[k])) { held.data[k] = DATA[k]; DATA[k] = []; } });
      LIBRARY_ROWS = null; stuffForget_(); STUFF.filters = []; STUFF.q = ''; paintStuff();
      for (let i = 0; i < 15; i++) { await frame(); sample(); }
      Object.keys(held.data).forEach(k => { DATA[k] = held.data[k]; });
      LIBRARY_ROWS = held.rows; stuffForget_(); paintStuff();
      for (let i = 0; i < 90; i++) { await frame(); sample(); }
      return { cards, flips: flips.slice(0, 6), off: [...off].slice(0, 6) };
    });
    if (!got || !got.cards) return null;
    return got.flips.concat(got.off.map(o => `a card off the ladder: ${o}`));
  },
};
