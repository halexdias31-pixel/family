// doGet since 1140: doget.gs's preamble plus the payload sections and routes in backend/get-*.gs.
// Checks that read what doGet sends read it through here, so they do not depend on which file a section is in.
const fs = require('fs');
const path = require('path');

/* doget.gs then every get-*.gs, by name. */
function getFiles(root) {
  const d = path.join(root || path.join(__dirname, '..'), 'backend');
  return ['doget.gs'].concat(fs.readdirSync(d).filter(f => /^get-.*\.gs$/.test(f)).sort()).map(f => path.join(d, f));
}

/* the same files as one text; throws if doget.gs is missing, so a check cannot pass on nothing. */
function getSrc(root) {
  return getFiles(root).map(f => fs.readFileSync(f, 'utf8')).join('\n');
}

module.exports = { getFiles, getSrc };
