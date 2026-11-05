#!/usr/bin/env node
/* @family. — tools/isolation.js HOW CHEAPLY EACH ELEMENT COULD MOVE (920). § */
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./health.js');
const ROOT = path.resolve(__dirname, '..');

function files() { return H.git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/(check|_)/.test(f)); }
/* WHAT EACH FILE DECLARES AT THE TOP, and the DOM ids its markup makes. */
function decls(src) {
  const { code, depthAt } = H.scan(src), names = new Set(), ids = new Set();
  code.forEach((l, i) => { if (i && depthAt[i - 1]) return; const m = /^\s*(?:async\s+)?function\s+([\w$]+)|^\s*(?:const|let|var|class)\s+([\w$]+)/.exec(l); if (m) names.add(m[1] || m[2]);
    const d = /^\s*(?:const|let|var)\s+\{([^}]*)\}\s*=/.exec(l); if (d) d[1].split(',').forEach(x => { const n = x.split(':').pop().trim(); if (/^[\w$]+$/.test(n)) names.add(n); }); });
  for (const m of src.matchAll(/\bid="([\w-]+)"/g)) ids.add(m[1]);
  return { names, ids };
}
/* The pieces of me.js, shell.js and keypad.js (1040) are one caller each, as the file they were cut from was; a cut adds no coupling. */
const ONE_ = f => f.replace(/^js\/(me|shell|keypad)-[\w-]+\.js$/, 'js/$1.js');
function isolation() {
  const F = files(), S = {}, D = {}, owner = Object.create(null), idOwner = Object.create(null);
  F.forEach(f => { S[f] = H.read(f); D[f] = decls(S[f]); D[f].names.forEach(n => { if (!owner[n]) owner[n] = f; }); D[f].ids.forEach(id => { (idOwner[id] = idOwner[id] || []).push(f); }); });
  const settings = fs.readdirSync(path.join(ROOT, 'data/settings')).filter(f => f.endsWith('.json')).map(f => [f, H.read('data/settings/' + f)]);
  const R = {}; F.forEach(f => { R[f] = { file: f, inbound: new Map(), outbound: new Map(), foreignDom: [], classes: new Map() }; });
  F.forEach(f => { const B = H.blank(S[f]).split('\n');
    B.forEach((l, i) => {
      for (const m of l.matchAll(/[A-Za-z_$][\w$]*/g)) { const o = owner[m[0]]; if (!o || o === f) continue;
        const k = m[0]; if (!R[f].outbound.has(k)) R[f].outbound.set(k, f + ':' + (i + 1));
        const inn = R[o].inbound, g = ONE_(f); if (!inn.has(g)) inn.set(g, f + ':' + (i + 1) + ' ' + k); }
      for (const m of l.matchAll(/getElementById\('([\w-]+)'\)|querySelector(?:All)?\('#([\w-]+)/g)) { const id = m[1] || m[2], ow = idOwner[id];
        if (ow && !ow.includes(f)) R[f].foreignDom.push(f + ':' + (i + 1) + ' #' + id + ' (made in ' + ow[0] + ')'); }
      for (const m of l.matchAll(/class="([^"$]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach(c => { const p = c.split('-')[0]; R[f].classes.set(p, (R[f].classes.get(p) || 0) + 1); });
    }); });
  return F.map(f => { const r = R[f], base = path.basename(f, '.js');
    const total = [...r.classes.values()].reduce((a, b) => a + b, 0), top = Math.max(0, ...r.classes.values());
    const scoped = !total || top / total >= 0.5;
    const reg = settings.filter(([, t]) => new RegExp('"' + base + '"').test(t)).map(([n]) => n);
    const inbound = r.inbound.size, outbound = r.outbound.size, dom = r.foreignDom.length;
    const score = Math.max(0, Math.round(100 - Math.min(40, inbound * 2) - Math.min(30, outbound / 4) - Math.min(15, dom * 3) - (scoped ? 0 : 10) - Math.min(5, Math.max(0, reg.length - 2))));
    return { file: f, score, inbound, outbound, foreignDom: dom, scoped, registeredIn: reg, inboundFiles: [...r.inbound.keys()],
      links: [...r.inbound.values()].slice(0, 5).concat(r.foreignDom.slice(0, 3)), };
  }).sort((a, b) => a.score - b.score);
}
module.exports = { isolation };
if (require.main === module) {
  const t = Date.now(), I = isolation(), n = Number(process.argv[2]) || 12;
  const avg = Math.round(I.reduce((a, x) => a + x.score, 0) / I.length);
  console.log(`isolation: ${I.length} elements, average movability ${avg}/100 (${Date.now() - t} ms). Worst:`);
  I.slice(0, n).forEach(x => { console.log(`  ${x.score}  ${x.file}: used by ${x.inbound} files, reads ${x.outbound} names of others, ${x.foreignDom} foreign DOM ids, CSS ${x.scoped ? 'scoped' : 'not scoped'}, registered in ${x.registeredIn.length}`);
    x.links.forEach(l => console.log('       ' + l)); });
}
