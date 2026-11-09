#!/usr/bin/env node
/* @family. — tools/facet-hues.js ONE COLOUR PER MENU (1030). Walks Find's funnel in the real app, keeps every pair of facets asked on one path */
/* (data/facet-graph.json) and colours the graph greedily from the --hue-N palette, so two menus one path can ask never share a colour. */
/* It writes the `const TAG_OF = …;` line in js/find.js. Run it after changing the library, the facets or the kinds. --check: write nothing. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
/* THE PIECE OF FIND THAT HOLDS TAG_OF (1040); none is a stop below, never a silent skip. */
const FIND = (require('./find-src.js').findFiles().map(f => path.join(ROOT, f)).find(f => /^const TAG_OF = /m.test(fs.readFileSync(f, 'utf8')))) || path.join(ROOT, 'js', 'find-bundles.js'), GRAPH = path.join(ROOT, 'data', 'facet-graph.json');
const CHECK = process.argv.includes('--check');
const MAX_NODES = Number(process.env.FH_NODES) || 700, MAX_DEPTH = 8, MAX_CHILDREN = 12;

/* GREEDY, MOST-CONNECTED FIRST; among the colours a facet may take, the one fewest facets wear yet, so menus spread over the palette. */
function colour(fields, edges, n) {
  const adj = {};
  fields.forEach(f => { adj[f] = new Set(); });
  edges.forEach(([a, b]) => { (adj[a] = adj[a] || new Set()).add(b); (adj[b] = adj[b] || new Set()).add(a); });
  const order = Object.keys(adj).sort((a, b) => adj[b].size - adj[a].size || a.localeCompare(b));
  const col = {}, used = new Array(n).fill(0);
  for (const f of order) {
    const ok = [...Array(n).keys()].filter(k => ![...adj[f]].some(g => col[g] === k));
    if (!ok.length) return { error: f + ' meets all ' + n + ' colours on its paths' };
    const k = ok.sort((a, b) => used[a] - used[b] || a - b)[0];
    col[f] = k; used[k]++;
  }
  return { col };
}

(async () => {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const N = [...css.matchAll(/--hue-(\d+):\s*#[0-9a-f]{6}/gi)].length;
  if (!N) { console.error('facet-hues: no --hue-N palette on :root in style.css'); process.exit(2); }
  const { app, tick } = require('../check/jsdom-app.js');
  const A = await app(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')));
  const ev = s => A.w.__ev(s);
  const t0 = Date.now();
  ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('facet-hues: the app never settled in 240s'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  /* AN ADMIN SEES EVERY MENU; each node is only the question asked there, so the walk can go wide. */
  const got = JSON.parse(ev(`(() => {
    USER = Object.assign({ name: 'T', personId: 'P-T' }, { role: 'Admin', roles: ['admin'] });
    stuffForget_();
    const pair = {}, asked = {}, queue = [[]];
    let nodes = 0;
    while (queue.length && nodes < ${MAX_NODES}) {
      const filters = queue.shift();
      const r = inFinder_(FINDERS.stuff, () => {
        STUFF.filters = filters; STUFF.admit = null;
        const items = stuffFiltered();
        if (!items.length) return null;
        const f = nextFacet(items) || overFacet_(items);
        return f ? { field: f.field, values: facetValues(items, f) } : null;
      });
      if (!r) continue;
      nodes++;
      asked[r.field] = 1;
      const fs_ = [...new Set(filters.map(g => g.field).concat([r.field]))].sort();
      fs_.forEach((a, i) => fs_.slice(i + 1).forEach(b => { pair[a + ' ' + b] = 1; }));
      if (filters.length >= ${MAX_DEPTH} || numberedRun_(r.values)) continue;
      r.values.slice().sort((a, b) => (b.n || 0) - (a.n || 0)).slice(0, ${MAX_CHILDREN})
        .forEach(v => queue.push(filters.concat([v.any ? { field: r.field, value: v.value, any: true } : { field: r.field, value: v.value }])));
    }
    inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.admit = null; });
    return JSON.stringify({ nodes, fields: facetList().map(G => G.field), asked: Object.keys(asked).sort(), edges: Object.keys(pair).sort().map(p => p.split(' ')) });
  })()`));
  const c = colour(got.fields, got.edges, N);
  if (c.error) { console.error('facet-hues: ' + c.error + ' — add a --hue-N token'); process.exit(2); }
  const table = {};
  got.fields.forEach(f => { table[f] = c.col[f]; });
  const line = 'const TAG_OF = ' + JSON.stringify(table).replace(/"(\w+)":/g, '$1: ').replace(/,/g, ', ') + ';';
  const src = fs.readFileSync(FIND, 'utf8'), at = /^const TAG_OF = .*;$/m;
  if (!at.test(src)) { console.error('facet-hues: no `const TAG_OF = …;` line in js/find.js'); process.exit(2); }
  const graph = JSON.stringify({ walked: { nodes: got.nodes, maxNodes: MAX_NODES, maxDepth: MAX_DEPTH, maxChildren: MAX_CHILDREN },
    asked: got.asked, edges: got.edges }, null, 0).replace(/\],\[/g, '],\n[') + '\n';
  const next = src.replace(at, line);
  if (CHECK) {
    let had = ''; try { had = fs.readFileSync(GRAPH, 'utf8'); } catch (e) { had = ''; }
    if (next === src && had === graph) { console.log('facet-hues: current'); process.exit(0); }
    console.error('facet-hues: STALE. Run: node tools/facet-hues.js'); process.exit(1);
  }
  fs.writeFileSync(FIND, next);
  fs.writeFileSync(GRAPH, graph);
  console.log(`facet-hues: ${got.nodes} nodes, ${got.asked.length} menus asked, ${got.edges.length} pairs, ${new Set(Object.values(table)).size} of ${N} colours (${Math.round((Date.now() - t0) / 1000)}s)`);
  process.exit(0);
})().catch(e => { console.error('facet-hues: ' + (e && e.stack || e)); process.exit(2); });
