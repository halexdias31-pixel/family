#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-rows.js EVERY COLUMN READ OFF A ROW, AGAINST THE TAB THAT ROW CAME FROM. § */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

/* THE .gs FILES, WHEREVER THEY ARE. § */
const dir = path.join(__dirname, '..');
const PLACES = [path.join(dir, 'backend'), path.join(dir, '..', 'backend'), dir];
/* `digest` too — the weekly parent email reads `submissions` and `people` rows and writes `digest_log`. */
const NAMES = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'doGet', 'doPost', 'digest'];
const NUMBERED = ['00_constants', '10_core', '20_people', '30_booking', '40_content',
                  '50_setup', '60_doGet', '70_doPost', '80_digest'];

const found = NAMES.map((n, i) => PLACES
  .flatMap(w => [NUMBERED[i], n, n.toLowerCase()].map(s => path.join(w, s + '.gs')))
  .find(p => fs.existsSync(p)));

/* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. "I did not check" and "I checked and it
   was fine" are different answers, and exit 0 says the second one to everything that reads it. */
const absent = NAMES.filter((n, i) => !found[i]);
if (absent.length) {
  console.error('check-rows: cannot find ' + absent.join(', ') + '. Looked in:\n  ' +
                PLACES.join('\n  '));
  process.exit(1);
}

const srcOf = {};
NAMES.forEach((n, i) => { srcOf[path.basename(found[i])] = fs.readFileSync(found[i], 'utf8'); });
const constants = srcOf[path.basename(found[0])];

/* ---------- SCHEMA AND TAB, READ OUT OF THE SOURCE § */
function objectAfter_(name) {
  const at = constants.indexOf('const ' + name);
  if (at < 0) return null;
  const open = constants.indexOf('{', at);
  let depth = 0, i = open;
  for (; i < constants.length; i++) {
    if (constants[i] === '{') depth++;
    else if (constants[i] === '}') { depth--; if (!depth) break; }
  }
  return constants.slice(open, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
}

/* THE KEY OF EACH SCHEMA ENTRY IS A TAB and its array is that tab's columns. § */
const SCHEMA = {};
{
  const blk = objectAfter_('SCHEMA') || '';
  const re = /(?:^|[\n,])\s*['"]?([A-Za-z_]\w*)['"]?\s*:\s*\[/g;
  let m;
  while ((m = re.exec(blk))) {
    let depth = 0, i = blk.indexOf('[', m.index), j = i;
    for (; j < blk.length; j++) {
      if (blk[j] === '[') depth++;
      else if (blk[j] === ']') { depth--; if (!depth) break; }
    }
    /* ---------- EITHER QUOTE, BECAUSE A TAB IS NOT LESS REAL FOR BEING SINGLE-QUOTED § */
    SCHEMA[m[1]] = new Set([...blk.slice(i, j + 1).matchAll(/"([^"]+)"|'([^']+)'/g)]
      .map(x => x[1] || x[2]));
    re.lastIndex = j;
  }
}

/* `TAB.people` IS THE KEY, NOT THE VALUE. The code writes `read(TAB.people)`, and SCHEMA is keyed on
   the same word, so the map only has to exist for the handful whose value differs from their key. */
const TABKEY = {};
for (const m of (objectAfter_('TAB') || '').matchAll(/(\w+)\s*:\s*'([^']+)'/g)) TABKEY[m[1]] = m[1];

/* A FUNCTION THAT HANDS BACK `read`'s OWN SHAPE, mapped to the tab behind it — so a row off it is bound and checked exactly as a row off `read(TAB.x)` is. § */
const HELPERS = {};

const NOT_A_COLUMN = new Set(('length forEach map filter find some every reduce indexOf slice join '
  + 'split trim push pop concat sort reverse includes toString valueOf hasOwnProperty '
  + 'constructor prototype call apply bind').split(' ').filter(Boolean));

/* ---------- THE WALK -------------------------------------------------------------------------- */
const findings = [];
const untraced = new Set();
let rowsSeen = 0, readsChecked = 0;

for (const file of Object.keys(srcOf)) {
  let ast;
  try {
    ast = acorn.parse(srcOf[file], { ecmaVersion: 2022, locations: true });
  } catch (err) {
    console.error('check-rows: cannot parse ' + file + ' — ' + err.message);
    process.exit(1);
  }

  /* ---------- ONE SCOPE PER FUNCTION, AND THAT IS NOT A DETAIL § */
  const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
  const scopes = [new Map()];

  /* ONE MAP, AND A DECLARATION ALWAYS WRITES TO IT — including when the right-hand side is something this cannot identify, which is then stored as `other`. § */
  const look = name => {
    for (let i = scopes.length - 1; i >= 0; i--) {
      const v = scopes[i].get(name);
      if (v) return v;
    }
    return null;
  };
  const bind = (kind, name, tab) => scopes[scopes.length - 1].set(name, { kind, tab });
  const of = (kind, name) => { const v = look(name); return v && v.kind === kind ? v.tab : null; };
  const table = { get: n => of('table', n), set: (n, v) => bind('table', n, v) };
  const rowsList = { get: n => of('rows', n), set: (n, v) => bind('rows', n, v) };
  const row = { get: n => of('row', n), set: (n, v) => bind('row', n, v) };

  const tabOf = node => {
    if (!node || node.type !== 'CallExpression') return null;
    const c = node.callee;
    if (c.type === 'Identifier' && HELPERS[c.name]) return HELPERS[c.name];
    if (c.type === 'Identifier' && c.name === 'read') {
      const a = node.arguments[0];
      if (a && a.type === 'MemberExpression' && a.object.name === 'TAB' && !a.computed) {
        return TABKEY[a.property.name] || a.property.name;
      }
      if (a && a.type === 'Literal' && typeof a.value === 'string') return a.value;
    }
    /* `rowById_(t, …)` HANDS BACK ONE ROW of whatever table it was given. */
    if (c.type === 'Identifier' && c.name === 'rowById_') {
      const a = node.arguments[0];
      if (a && a.type === 'Identifier') return table.get(a.name) || null;
      return tabOf(a);
    }
    return null;
  };

  /* `<something>.rows` where the something is a table we know. */
  const rowsExprTab = node => {
    if (!node) return null;
    if (node.type === 'Identifier') return rowsList.get(node.name) || null;
    if (node.type === 'MemberExpression' && !node.computed && node.property.name === 'rows') {
      if (node.object.type === 'Identifier') return table.get(node.object.name) || null;
      return tabOf(node.object);
    }
    /* `.rows.filter(…)` and `.rows.slice(…)` are still that tab's rows. */
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        ['filter', 'slice', 'concat', 'sort', 'reverse'].includes(node.callee.property.name)) {
      return rowsExprTab(node.callee.object);
    }
    return null;
  };

  const ITERATORS = new Set(['forEach', 'map', 'filter', 'find', 'findIndex', 'some', 'every',
                             'flatMap', 'sort', 'reduce']);

  const pending = new Map();

  const walk = (node, parent) => {
    if (!node || typeof node.type !== 'string') return;

    const opened = FN.has(node.type);
    if (opened) {
      scopes.push(new Map());
      const p = pending.get(node);
      if (p) bind('row', p[0], p[1]);
    }

    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      const init = node.init;
      const t = init ? tabOf(init) : null;
      const rl = init ? rowsExprTab(init) : null;
      /* `const r = t.rows[i]`, and `const r = t.rows.find(…)` / `[0]` / `.pop()` — one row out of a list this already knows. § */
      let picked = null;
      if (init && init.type === 'MemberExpression' && init.computed) {
        picked = rowsExprTab(init.object);
      } else if (init && init.type === 'CallExpression' &&
                 init.callee.type === 'MemberExpression' && !init.callee.computed &&
                 ['find', 'pop', 'shift'].includes(init.callee.property.name)) {
        picked = rowsExprTab(init.callee.object);
      }

      if (picked) row.set(node.id.name, picked);
      else if (t && init.callee && init.callee.name === 'rowById_') row.set(node.id.name, t);
      else if (t) table.set(node.id.name, t);
      else if (rl) rowsList.set(node.id.name, rl);
      /* NOTHING RECOGNISED IS STILL A BINDING. See the note on scope above — without this the
         lookup walks out of the function and answers with somebody else's row. */
      else bind('other', node.id.name, null);
    }

    /* `for (const r of t.rows)` */
    if (node.type === 'ForOfStatement' && node.left.declarations &&
        node.left.declarations[0].id.type === 'Identifier') {
      const rt = rowsExprTab(node.right);
      if (rt) row.set(node.left.declarations[0].id.name, rt);
    }

    /* `<rows>.forEach(r => …)` and friends. `reduce` puts the row SECOND. */
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        !node.callee.computed && ITERATORS.has(node.callee.property.name)) {
      const rt = rowsExprTab(node.callee.object);
      const fn = node.arguments[node.callee.property.name === 'reduce' ? 0 : 0];
      if (rt && fn && (fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression')) {
        const at = node.callee.property.name === 'reduce' ? 1 : 0;
        const p = fn.params[at];
        /* BOUND INTO THE CALLBACK'S OWN SCOPE, not into the one making the call — the parameter belongs to the arrow function, and binding it here would leak it to § */
        if (p && p.type === 'Identifier') { pending.set(fn, [p.name, rt]); rowsSeen++; }
      }
    }

    /* THE QUESTION ITSELF. */
    if (node.type === 'MemberExpression' && !node.computed &&
        node.object.type === 'Identifier' && node.property.type === 'Identifier') {
      const t = row.get(node.object.name);
      const name = node.property.name;
      if (t && !name.startsWith('_') && !NOT_A_COLUMN.has(name)) {
        readsChecked++;
        const cols = SCHEMA[t];
        if (!cols) untraced.add(t);
        else if (!cols.has(name)) {
          findings.push({ file, line: node.loc.start.line, tab: t, name,
                          src: srcOf[file].split('\n')[node.loc.start.line - 1].trim().slice(0, 78) });
        }
      }
    }

    for (const k of Object.keys(node)) {
      if (k === 'loc' || k === 'start' || k === 'end') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, node));
      else if (v && typeof v.type === 'string') walk(v, node);
    }

    if (opened) scopes.pop();
  };
  walk(ast, null);
}

/* ---------- REPORT ------------------------------------------------------------------------------ */
const seen = new Set();
const uniq = findings.filter(f => {
  const k = f.file + ':' + f.line + ':' + f.name;
  if (seen.has(k)) return false;
  seen.add(k); return true;
});

console.log('');
if (untraced.size) {
  console.log('A TAB WITH NO SCHEMA ENTRY, so its rows could not be checked  (' + untraced.size + ')');
  for (const t of untraced) console.log('  ' + t);
  console.log('');
}

console.log('READ FROM A COLUMN THAT TAB HAS NOT GOT  (' + uniq.length + ')');
if (!uniq.length) console.log('  none');
for (const f of uniq) {
  console.log('  %s:%d  r.%s  — the %s tab has no %s column',
              f.file, f.line, f.name, f.tab, f.name);
  console.log('      ' + f.src);
}

console.log('');
console.log('rows traced to a tab: ' + rowsSeen + '   column reads checked: ' +
            readsChecked + '   tabs in SCHEMA: ' + Object.keys(SCHEMA).length);
if (uniq.length) {
  console.log('');
  console.log('Each of these comes back undefined. S() turns that into an empty string and N() into');
  console.log('zero, so the value is simply absent and nothing anywhere says so. check-columns.js');
  console.log('cannot see them: it asks whether the name is a column of ANY tab, and these are.');
  process.exit(1);
}
console.log('OK — every column read off a row is a column of the tab that row came from.');
