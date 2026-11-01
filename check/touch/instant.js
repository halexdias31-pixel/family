/* PRESS-IN IS FRAME ONE (536, U9): the look `.is-pressed` gives is complete in the same task it goes on, with no transition easing it in; only the release eases. */
const { walk } = require('../touch-walk.js');
module.exports = {
  name: 'instant',
  what: 'a control is fully pressed in the first frame after the finger lands',
  widths: [390],
  viewers: ['out', 'admin'],
  run: async page => {
    const cols = await walk(page);
    if (!cols.length || !cols.some(c => c.rows.length)) return null;
    const bad = {};
    cols.forEach(c => c.rows.filter(r => r.look && (!r.instant || r.durs.split(/,\s*/).some(d => parseFloat(d) > 0)))
      .forEach(r => { bad[r.kind] = bad[r.kind] || { cols: new Set(), durs: r.durs }; bad[r.kind].cols.add(c.id); }));
    return Object.keys(bad).sort().map(k => `${k} on ${[...bad[k].cols].join(', ')} eases into its press (transition ${bad[k].durs})`);
  },
};
