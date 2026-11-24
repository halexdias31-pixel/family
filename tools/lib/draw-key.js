/* @family. — tools/lib/draw-key.js ONE DRAWING CANVAS (owner, 23 Nov, queue item "ONE DRAWING CANVAS"): every drawn answer's key
   (`draw_answer`) stored in the one form -- its frame (grid / line / angle) and its pieces (points, lines, curves, regions in the frame).
   The form's code is the site's own (js/find-pen.js drawOne_, drawItemOf_), run here in a vm, so the importer and the marker cannot
   differ. Applied where the words are written (lib-full.js writePrivate, beside pick-key.js and shape.js), and by
   `node tools/content.js drawkeys [--apply]` on the words as they are; held by tools/one-canvas.js. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT } = require('./gen.js');
let CTX = null;
/* the form's declarations, from `const DRAW_ONE` to the marker (`function drawMarker_`) */
function form() {
  if (CTX) return CTX;
  const src = fs.readFileSync(path.join(ROOT, 'js/find-pen.js'), 'utf8');
  const a = src.indexOf('const DRAW_ONE'), b = src.indexOf('function drawMarker_');
  if (a < 0 || b < a) throw new Error('draw-key: js/find-pen.js has no DRAW_ONE form before drawMarker_');
  CTX = vm.createContext({});
  vm.runInContext(src.slice(a, b) + '\nthis.drawOne_ = drawOne_; this.drawItemOf_ = drawItemOf_; this.DRAW_IS = DRAW_IS; this.DRAW_FRAMES = DRAW_FRAMES;', CTX);
  return CTX;
}
const isOne = v => { try { const d = typeof v === 'string' ? JSON.parse(v) : v; return !!d && d.one === 1 && Array.isArray(d.pieces); } catch (e) { return false; } };
/* ONE ROW'S KEY in the one form, as the words store it (a string); unchanged when it is already, or cannot be read */
function normalise(w, tally, id) {
  if (!w || !w.draw_answer) return false;
  const raw = w.draw_answer;
  if (isOne(raw)) return false;
  const one = form().drawOne_(typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (!one) { if (tally) (tally.not = tally.not || []).push(id || w.row_id || '?'); return false; }
  w.draw_answer = JSON.stringify(one);
  if (tally) tally.keys = (tally.keys || 0) + 1;
  return true;
}
function normaliseMap(map, tally) {
  Object.keys(map || {}).forEach(id => normalise(map[id], tally, id));
  return map;
}
module.exports = { form, isOne, normalise, normaliseMap };
