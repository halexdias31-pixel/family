/* THE MARK IS ON EVERY KIND OF CONTROL (536, U9): a real finger landing on a button without `data-do`, a link, a summary, a label or a `[data-do]` lights it in the same task. */
const { walk } = require('../touch-walk.js');
module.exports = {
  name: 'mark-everywhere',
  what: 'a finger landing on any kind of control lights it at once',
  widths: [390],
  viewers: ['out', 'admin'],
  run: async page => {
    const cols = await walk(page);
    const marks = [].concat(...cols.map(c => c.marks.map(m => Object.assign({ id: c.id }, m))));
    if (!marks.length) return null;
    const kinds = new Set(marks.map(m => m.k));
    const bad = marks.filter(m => m.lit !== true).map(m => `a ${m.k} (.${m.cls || '-'}) on ${m.id} was not lit when the finger landed ${JSON.stringify(m.why)}`);
    /* EACH KIND THE OLD SELECTOR MISSED MUST HAVE BEEN MET, or this proved nothing about it. */
    ['button', 'link', 'data-do'].filter(k => !kinds.has(k)).forEach(k => bad.push(`no ${k} was reachable on any column — not checked`));
    return bad;
  },
};
