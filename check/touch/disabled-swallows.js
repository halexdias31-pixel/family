/* A DISABLED CONTROL TAKES ITS OWN TAP (536, U9): at its centre the finger meets the control, never the card under it (the disabled Send once passed its tap to the receipt). */
const { walk } = require('../touch-walk.js');
module.exports = {
  name: 'disabled-swallows',
  what: 'a tap on a disabled control lands on the control',
  widths: [390],
  viewers: ['admin'],
  run: async page => {
    const cols = await walk(page);
    if (!cols.length) return null;
    const met = cols.reduce((n, c) => n + c.disabled.length, 0);
    const bad = [];
    cols.forEach(c => c.disabled.filter(d => !d.hit).forEach(d => bad.push(`a disabled ${d.kind} on ${c.id} passes its tap to ${d.under}`)));
    /* THE ADMIN'S WALK MUST MEET ONE, or the rule was never tried (a stranger has none on the glass, so only the admin walks for this). */
    return met ? bad : null;
  },
};
