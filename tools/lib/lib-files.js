/* @family. — tools/lib/lib-files.js THE LIBRARY FILES, FROM kinds.json (rule 1.80): each library kind's `sheet.lib`, in its `order`.
   The one importer's definition: tools/cards-gen.js writes it into backend/cards-gen.gs as LIB_FILES, and tools/lib/lib-full.js reads it here. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
function libFiles() {
  const kinds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')).kinds;
  const out = {};
  Object.keys(kinds).map(k => ({ k, s: kinds[k].sheet })).filter(x => x.s && x.s.lib)
    .sort((a, b) => a.s.lib.order - b.s.lib.order)
    .forEach(({ k, s }) => {
      const L = s.lib, d = { tab: s.tab, file: L.file, prefix: L.prefix, id: L.key };
      if (L.skip) d.skip = L.skip;
      if (L.newer) d.newer = true;
      if (L.joined) d.joined = { from: L.joined.from, by: L.joined.by, fields: L.joined.fields };
      d.private = L.private;
      d.kind = k;
      out[L.name] = d;
    });
  return out;
}
module.exports = { libFiles };
