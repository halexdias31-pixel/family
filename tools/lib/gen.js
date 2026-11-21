/* @family. — tools/lib/gen.js THE ONE SET OF TOOL HELPERS (unify batch 4): every generator and check takes these, never its own copy
   (tools/one-helper.js fails the build on a copy). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
/* A JSON file under ROOT, or null when it is missing or broken. */
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
/* A value as trimmed text; null and undefined are ''. */
const S = v => String(v == null ? '' : v).trim();
/* A MARKED BLOCK: the line holding `begin` is kept, everything after it up to `end` becomes `body`.
   Absent markers: `absent(src)` when given, else the block is appended after one blank line. */
function blockInto(src, begin, end, body, absent) {
  const i = src.indexOf(begin), j = i === -1 ? -1 : src.indexOf(end, i + begin.length);
  if (i !== -1 && j !== -1) {
    const nl = src.indexOf('\n', i + begin.length - 1), head = nl !== -1 && nl < j ? nl + 1 : i + begin.length;
    return src.slice(0, head) + body + src.slice(j);
  }
  return absent ? absent(src) : src.replace(/\n*$/, '\n\n') + begin + body + end;
}
/* Writes `text` only when it differs from what is there; true when it wrote. */
function writeIfChanged(file, text) {
  let was = null; try { was = fs.readFileSync(file, 'utf8'); } catch (e) { was = null; }
  if (was === text) return false;
  fs.writeFileSync(file, text);
  return true;
}
module.exports = { ROOT, read, S, blockInto, writeIfChanged };
