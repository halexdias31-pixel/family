/* HOLDING A CONTROL SELECTS NOTHING AND PREVIEWS NOTHING (536, D12): every control computes `user-select: none`; on WebKit the callout is off too (the static half is in js/check-css.js). */
const { walk } = require('../touch-walk.js');
module.exports = {
  name: 'no-select',
  what: 'no control on any column has selectable words',
  widths: [390],
  viewers: ['out', 'admin'],
  run: async page => {
    const cols = await walk(page);
    if (!cols.length || !cols.some(c => c.rows.length)) return null;
    const bad = {};
    cols.forEach(c => c.rows.filter(r => r.select !== 'none' || (r.callout && r.callout !== 'none'))
      .forEach(r => { (bad[r.kind] = bad[r.kind] || new Set()).add(c.id); }));
    return Object.keys(bad).sort().map(k => `${k} on ${[...bad[k]].join(', ')} has selectable words or a callout`);
  },
};
