/* EVERY CONTROL HAS A PRESS LOOK (536, U9): on every column, `.is-pressed` changes at least one of transform, background, filter, opacity, border, shadow or colour on the control, its pseudo-elements or what is inside it. */
const { walk } = require('../touch-walk.js');
module.exports = {
  name: 'every-control-has-a-look',
  what: 'every control on every column looks pressed when it is pressed',
  widths: [390],
  viewers: ['out', 'admin'],
  run: async page => {
    const cols = await walk(page);
    if (!cols.length || !cols.some(c => c.rows.length)) return null;
    const bad = {};
    cols.forEach(c => c.rows.filter(r => !r.look).forEach(r => { (bad[r.kind] = bad[r.kind] || new Set()).add(c.id); }));
    return Object.keys(bad).sort().map(k => `${k} on ${[...bad[k]].join(', ')} shows nothing when pressed`);
  },
};
