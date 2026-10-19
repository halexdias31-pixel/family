#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-css.js WHAT A COMPILER WOULD HAVE DONE FOR THE STYLESHEET. § */
const fs = require('fs'), path = require('path');

const dir = path.join(__dirname, '..');
const cssPath = path.join(dir, 'style.css');
if (!fs.existsSync(cssPath)) { console.log('no style.css beside this folder'); process.exit(1); }
const css = fs.readFileSync(cssPath, 'utf8');

/* ---------- THE COMMENTS ARE NOT THE APP, AND THIS FILE IS 64% COMMENTS § */
const decomment_ = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ''))
  /* NOT `//` AT THE START OF A URL. `https://…` inside a string is the common case and eating from
     there to the end of the line takes real code with it. A `//` that follows `:` is a scheme. */
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const code = fs.readdirSync(path.join(dir, 'js'))
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js')
  .map(f => decomment_(fs.readFileSync(path.join(dir, 'js', f), 'utf8'))).join('\n')
  + (fs.existsSync(path.join(dir, 'index.html'))
     ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '') : '');


/* ---------- IS IT EVEN A STYLESHEET § */
function bracesBalance(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  let depth = 0, line = 1;
  const stray = [];
  for (const ch of clean) {
    if (ch === '\n') line++;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth < 0) { stray.push(line); depth = 0; } }
  }
  return { stray, unclosed: depth };
}

/* ---------- strip comments, then read the rules ------------------------------------------------ */
/* COMMENTS BLANKED, NOT DELETED — each one replaced by the same number of newlines it occupied. § */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
/* AS A FUNCTION, because the teaching animations' CSS is in data/textbooks.json now and section 9
   reads a row's rules the way it reads this file's. */
function readRules_(bare) {
  const rules = [];
  /* A hand-rolled reader rather than a parser from npm: § */
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(bare))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!sel || sel.startsWith('@')) continue;
    /* AT THE SELECTOR'S FIRST CHARACTER, not at `m.index`: § */
    const line = bare.slice(0, m.index + Math.max(0, m[1].search(/\S/))).split('\n').length;
    /* IS THIS RULE CONDITIONAL? § */
    let depth = 0, cond = '';
    {
      const before = bare.slice(0, m.index);
      let open = 0;
      for (let k = before.length - 1; k >= 0; k--) {
        const ch = before[k];
        if (ch === '}') open++;
        else if (ch === '{') { if (open) open--; else { 
          const head = before.lastIndexOf('@', k);
          const nl = before.lastIndexOf('\n', k);
          if (head > nl - 1 && head !== -1 && head < k) { depth++; cond = before.slice(head, k).trim().replace(/\s+/g, ' ').slice(0, 60); }
          break;
        } }
      }
    }
    const decls = m[2].split(';').map(d => d.trim()).filter(Boolean)
      .map(d => { const i = d.indexOf(':'); return i < 0 ? null : { prop: d.slice(0, i).trim(), val: d.slice(i + 1).trim() }; })
      .filter(Boolean);
    /* A COMMA IS LEFT ALONE, and that is a decision rather than an oversight. § */
    rules.push({ sel, decls, line, cond });
  }
  return rules;
}
const rules = readRules_(bare);

let fail = 0;
/* ---------- A LIST TO LOOK AT IS NOT A BROKEN BUILD § */
let noted = 0;

const say = (title, list, soft) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  if (soft) noted = 1; else fail = 1;
};

/* ---------- 1. the same property twice in one rule --------------------------------------------- */
const twice = [];
rules.forEach(r => {
  const seen = {};
  r.decls.forEach(d => {
    const k = d.prop.toLowerCase();
    if (seen[k] !== undefined && seen[k] !== d.val) {
      twice.push('line ' + r.line + '  ' + r.sel + '  →  ' + d.prop
        + ' set to "' + seen[k] + '" and then "' + d.val + '"; the first is dead');
    }
    seen[k] = d.val;
  });
});

/* ---------- 2. the same selector in two places, both setting the same property ------------------ */
const bySel = {};
rules.forEach(r => { (bySel[r.sel] = bySel[r.sel] || []).push(r); });
const dupSel = [];
Object.keys(bySel).forEach(sel => {
  const rs = bySel[sel];
  if (rs.length < 2) return;
  const props = {};
  rs.forEach(r => r.decls.forEach(d => {
    const k = d.prop.toLowerCase();
    (props[k] = props[k] || []).push({ line: r.line, val: d.val });
  }));
  Object.keys(props).forEach(k => {
    const hits = props[k];
    if (hits.length < 2) return;
    if (new Set(hits.map(h => h.val)).size < 2) return;   // saying the same thing twice is untidy, not wrong
    /* A rule inside @media or @supports applies conditionally, so it is not an override. */
    if (rs.some(r => r.cond)) return;
    dupSel.push(sel + '  →  ' + k + ' set at line ' + hits.map(h => h.line + ' ("' + h.val + '")').join(' and line ')
      + '; the last one wins');
  });
});

/* ---------- 3. an earlier rule losing to an identical later one --------------------------------- */
const order = [];
Object.keys(bySel).forEach(sel => {
  const rs = bySel[sel].slice().sort((a, b) => a.line - b.line);
  if (rs.length < 2) return;
  for (let i = 0; i < rs.length - 1; i++) {
    rs[i].decls.forEach(d => {
      const k = d.prop.toLowerCase();
      const beaten = rs.slice(i + 1).find(r => !r.cond
        && r.decls.some(x => x.prop.toLowerCase() === k && x.val !== d.val));
      if (beaten && !order.some(o => o.indexOf(sel + '  →  ' + k) === 0)) {
        order.push(sel + '  →  ' + k + ' at line ' + rs[i].line + ' never applies; line ' + beaten.line + ' overrides it');
      }
    });
  }
});

/* ---------- 4. contradictions between properties in one rule ------------------------------------ */
const clash = [];
rules.forEach(r => {
  const get = p => (r.decls.find(d => d.prop.toLowerCase() === p) || {}).val;
  const contain = get('contain') || '';
  const overflow = get('overflow') || get('overflow-y') || get('overflow-x') || '';
  if (/paint|content|strict/.test(contain) && /visible/.test(overflow)) {
    clash.push('line ' + r.line + '  ' + r.sel + '  →  contain: ' + contain
      + ' CLIPS the box, so overflow: ' + overflow + ' cannot happen');
  }
  const pos = get('position');
  if (pos === 'static' && (get('top') || get('left') || get('inset'))) {
    clash.push('line ' + r.line + '  ' + r.sel + '  →  position: static ignores top/left/inset');
  }
  if (/%\s*$/.test(get('max-height') || '') && get('height') === 'auto') {
    clash.push('line ' + r.line + '  ' + r.sel
      + '  →  max-height in % with height: auto resolves to no cap at all');
  }
});

/* ---------- 5. classes the stylesheet dresses that nothing ever produces ------------------------ */
const IGNORE = new Set(['hidden', 'on', 'far', 'no-anim', 'active', 'is-off', 'solid']);
const seenClass = new Set();
bare.replace(/\.(-?[A-Za-z_][\w-]*)/g, (_, c) => { seenClass.add(c); return _; });
/* ---------- PLAIN CONTAINMENT HID EVERY CLASS WHOSE NAME IS A PREFIX OF A LIVE ONE § */
/* ---------- AND THE ONE CASE THE HEADING HAS ALWAYS WARNED ABOUT, NOW ACTUALLY FOUND § */
const builtPrefix = new Set();
/* THE LEADING SPACE IS PART OF THE LITERAL. § */
for (const m of code.matchAll(/(['"`])\s*([A-Za-z][\w-]*-)\1\s*\+/g)) builtPrefix.add(m[2]);
const maybeBuilt = c => [...builtPrefix].some(p => c.startsWith(p) && c !== p);
const present = c => new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, m => '\\' + m)
                                + '(?![\\w-])').test(code);
const dead  = [...seenClass].filter(c => !IGNORE.has(c) && !present(c) && !maybeBuilt(c));
const built = [...seenClass].filter(c => !IGNORE.has(c) && !present(c) && maybeBuilt(c));

/* ---------- 6. THE LOADING SCREEN DRAWS ONLY WHAT THE BOOKS TEACH § */
const splashBad = [];
{
  const PARTS = ['still', 'say', 'wait'];
  const STATES = ['still', 'an'];
  const page_ = fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : '';
  if (!page_) splashBad.push('index.html could not be read — the loading screen was NOT checked');
  const html_ = page_.replace(/<!--[\s\S]*?-->/g, '');
  const ids = [...html_.matchAll(/\bid="splash-([\w-]+)"/g)].map(m => m[1]);
  ids.filter(n => !PARTS.includes(n)).forEach(n => splashBad.push('index.html has `#splash-' + n + '` — a splash drawn by the page; the loading screen is a book\'s animation, or the still name and the loader, and nothing else'));
  if (page_) PARTS.filter(n => !ids.includes(n)).forEach(n => splashBad.push('index.html has no `#splash-' + n + '` — a part of the loading screen is missing'));
  const tag = (html_.match(/<div id="splash"[^>]*>/) || [''])[0];
  if (tag && !/\sclass="is-still"/.test(tag)) splashBad.push('the splash opens as `' + tag + '` — its own class must be `is-still`, what a device with nothing kept and a browser running no script are shown');
  const pick = (/<script id="pick-splash">([\s\S]*?)<\/script>/.exec(page_) || [])[1] || '';
  const pickCode = pick.replace(/\/\*[\s\S]*?\*\//g, '');
  if (page_ && !pick) splashBad.push('index.html has no <script id="pick-splash"> — the picker was NOT read');
  if (/\bkinds\b/.test(pickCode)) splashBad.push('the picker has a `kinds` list again — an inline pool beside the books\' copy');
  const set = [...pickCode.matchAll(/className\s*=\s*('[^']*'|"[^"]*")\s*(\+?)/g)];
  set.forEach(m => {
    const c = m[1].slice(1, -1);
    if (m[2]) splashBad.push('the picker builds its class from what it picked (`className = ' + m[1] + ' + …`) — that is how an inline splash was chosen');
    else if (!STATES.map(s => 'is-' + s).includes(c)) splashBad.push('the picker sets `' + c + '` — it draws a book\'s animation (`is-an`) or leaves the still one (`is-still`), and nothing else');
  });
  if (pick && !set.length) splashBad.push('the picker sets no class with a literal — what it may set was NOT checked');
  rules.forEach(r => r.sel.split(',').map(s => s.trim()).forEach(s => {
    for (const m of s.matchAll(/#splash-([\w-]+)/g)) {
      if (!PARTS.includes(m[1])) splashBad.push('style.css line ' + r.line + '  ' + s + ' — a rule for `#splash-' + m[1] + '`, which is no part of the loading screen');
    }
    for (const m of s.matchAll(/#splash\.is-([\w-]+)/g)) {
      if (!STATES.includes(m[1])) splashBad.push('style.css line ' + r.line + '  ' + s + ' — a rule for `is-' + m[1] + '`, a splash the picker can never choose');
    }
  }));
  const HIDE = '#splash-still', SHOW = '#splash.is-still #splash-still';
  rules.filter(r => r.decls.some(d => d.prop.toLowerCase() === 'display')
      && r.sel.split(',').some(s => /#splash-still$/.test(s.trim()))).forEach(r => {
    const disp = r.decls.filter(d => d.prop.toLowerCase() === 'display').map(d => d.val).pop();
    if ((r.sel === HIDE && disp === 'none' && !r.cond) || (r.sel === SHOW && !r.cond)) return;
    splashBad.push('style.css line ' + r.line + '  ' + r.sel + (r.cond ? ' (' + r.cond + ')' : '') + ' sets `display: ' + disp
      + '` on the still splash — only `' + HIDE + ' { display: none }` and `' + SHOW + '` may, or the name is drawn over a book\'s animation');
  });
  if (!rules.some(r => r.sel === HIDE && !r.cond && r.decls.some(d => d.prop === 'display' && d.val === 'none'))) splashBad.push('nothing says `' + HIDE + ' { display: none }` — the still name would be drawn over every book\'s animation');
  if (!rules.some(r => r.sel === SHOW && !r.cond && r.decls.some(d => d.prop === 'display' && d.val !== 'none'))) splashBad.push('nothing shows `#splash-still` under `is-still` — a first visit would be a black screen');
  let sheet = null;
  try { sheet = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'settings', 'splashes.json'), 'utf8')); }
  catch (e) { splashBad.push('data/settings/splashes.json could not be read — the sheet was NOT compared'); }
  (sheet || []).filter(r => r.kind !== 'proof' && r.kind !== 'tool').forEach(r => splashBad.push('data/settings/splashes.json has "' + r.splash_id + '", kind "' + r.kind
    + '" — every row is a teaching animation in a book (proof or tool); this one switches a splash that does not exist'));
  /* ---------- AND THE PICKER IS THE FIRST THING INSIDE IT § */
  const at = html_.search(/<div id="splash"[^>]*>/);
  if (at < 0) splashBad.push('index.html has no `<div id="splash">` — the picker\'s place was NOT checked');
  else {
    const first = (html_.slice(at).replace(/^<div id="splash"[^>]*>/, '').match(/<[a-z][^>]*>/i) || [''])[0];
    if (first !== '<script id="pick-splash">') splashBad.push('the first element inside #splash is `' + first.slice(0, 60)
      + '`, not `<script id="pick-splash">` — the splash markup is parsed (and can be painted) before the pick');
  }
  /* ---------- AND NOTHING ELSE IN IT: WHAT `#splash` HOLDS IS A CLOSED LIST, NOT JUST ITS IDS § */
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const flat = html_.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, '$1$2');
  /* THE DIRECT CHILDREN OF THE FIRST ELEMENT `open` MATCHES: each child's opening tag, and any text
     that is not whitespace between them. */
  const kidsOf = open => {
    const m0 = open.exec(flat);
    if (!m0) return null;
    const re = /<(\/?)([a-z][\w-]*)\b[^>]*>/gi;
    re.lastIndex = m0.index + m0[0].length;
    const tags = [], text = [];
    let depth = 0, last = re.lastIndex, m;
    while ((m = re.exec(flat))) {
      if (!depth && flat.slice(last, m.index).trim()) text.push(flat.slice(last, m.index).trim().slice(0, 40));
      last = re.lastIndex;
      if (m[1]) { if (!depth) break; depth--; continue; }
      if (!depth) tags.push(m[0]);
      if (!VOID.has(m[2].toLowerCase()) && !/\/>$/.test(m[0])) depth++;
    }
    return { tags, text };
  };
  const attr = (tag, a) => (new RegExp('\\s' + a + '="([^"]*)"').exec(tag) || [])[1] || '';
  /* AN ELEMENT BY ITS ID WHERE IT HAS ONE, ELSE BY ITS CLASSES: `p#boot-slow`, `div.loading`. */
  const named = tag => (/^<([a-z][\w-]*)/i.exec(tag) || [])[1].toLowerCase()
    + (attr(tag, 'id') ? '#' + attr(tag, 'id') : attr(tag, 'class').trim() ? '.' + attr(tag, 'class').trim().split(/\s+/).join('.') : '');
  const closed = (where, got, allowed, why) => {
    if (!got) return;
    got.tags.map(named).forEach((n, i, all) => {
      if (!allowed.includes(n)) splashBad.push(where + ' holds `' + n + '` — ' + why);
      else if (all.indexOf(n) !== i) splashBad.push(where + ' holds `' + n + '` twice');
    });
    got.text.forEach(t => splashBad.push(where + ' holds the bare text "' + t + '" — ' + why));
  };
  const SPLASH_KIDS = ['script#pick-splash', 'div#splash-still', 'p#splash-say', 'p#splash-wait', 'p#boot-slow'];
  const kids = kidsOf(/<div id="splash"[^>]*>/);
  if (page_ && !kids) splashBad.push('index.html has no `<div id="splash">` — what it holds was NOT checked');
  closed('#splash', kids, SPLASH_KIDS, 'the loading screen is the picker, the still name and its loader, the line said out loud, the slow line and the boot caption, and nothing else; anything more is a splash drawn by the page, which is what went (docs/history/322)');
  if (kids && kids.tags.length < SPLASH_KIDS.length) splashBad.push('#splash holds ' + kids.tags.length + ' elements, not its ' + SPLASH_KIDS.length + ' parts (' + kids.tags.map(named).join(' ') + ') — the closed list was NOT compared whole');
  const still = kidsOf(/<div id="splash-still"[^>]*>/);
  closed('#splash-still', still, ['p.sp-name', 'div.loading'], 'the still one is the name and the loader under it, and nothing else');
  if (still && still.tags.map(named).join(' ') !== 'p.sp-name div.loading') splashBad.push('#splash-still holds ' + (still.tags.map(named).join(' ') || 'nothing') + ' — it is the name, then the loader under it');
  const name = kidsOf(/<p class="sp-name"[^>]*>/);
  if (name && name.tags.length) splashBad.push('the still name holds `' + name.tags.map(named).join(' ') + '` — it is the words @family. set plainly, and an element inside it is a decoration');
  const INTO = /#splash\b|\.sp-name\b|#boot-slow\b/;
  rules.forEach(r => {
    if (!r.sel.split(',').some(sel => INTO.test(sel))) return;
    r.decls.forEach(d => {
      const k = d.prop.toLowerCase();
      if (k === 'content') splashBad.push('style.css line ' + r.line + '  ' + r.sel + ' gives `content` — a thing drawn on the loading screen with no markup, which no check of the markup sees');
      if ((k === 'animation' || k === 'animation-name') && !/^none\b/.test(d.val.trim())) splashBad.push('style.css line ' + r.line + '  ' + r.sel + ' runs `' + k + ': ' + d.val + '` — nothing on the loading screen animates but a book\'s drawing (its row\'s CSS) and the loader (its own block)');
    });
  });
}

/* ---------- 7. EVERYTHING TAPPABLE MUST LOOK TAPPABLE § */
const tapBad = [];
{
  const has = (sel, prop) => rules.some(r => r.sel === sel && r.decls.some(d => d.prop === prop));
  if (!has('[data-do]', 'cursor')) {
    tapBad.push('`[data-do]` no longer sets a cursor — every tappable thing that is not a button '
      + 'now looks exactly like text that is not');
  }
  /* THIS USED TO REQUIRE `[data-do]:active` — a press state on everything — and that was the wrong thing to check for. § */
  if (!rules.some(r => /\.card\.tap::after/.test(r.sel))) {
    tapBad.push('the chevron on `.card.tap` is gone — a card the width of the screen with nothing '
      + 'at the end of it reads as a paragraph rather than a door');
  }
  if (!rules.some(r => r.decls.some(d => d.prop === 'text-decoration-style' && d.val === 'dotted'))) {
    tapBad.push('the dotted underline is gone — a word inside a line of text that acts when pressed '
      + 'now looks exactly like the words around it');
  }
}

/* ---------- 7. A RULE THAT SAYS NOTHING § */
const hollow = rules.filter(r => !r.decls.length)
  .map(r => 'line ' + r.line + '  ' + r.sel + '  is empty — delete it rather than leave it');

/* ---------- 7b. A TILE'S COLOUR WRITTEN OUT BY HAND § */
const handTone = [];
{
  const root = rules.find(r => r.sel === ':root' && !r.cond);
  const tok = {};
  (root ? root.decls : []).forEach(d => {
    const m = /^--[\w-]+$/.test(d.prop) && /^#([0-9a-f]{6})\b/i.exec(d.val);
    if (m && !/^(000000|ffffff)$/i.test(m[1])) (tok[m[1].toLowerCase()] = tok[m[1].toLowerCase()] || []).push(d.prop);
  });
  if (!Object.keys(tok).length) handTone.push(':root holds no hex colour tokens this check can read — the tiles were NOT checked');
  /* ---------- AND A WASH WITH A NAME IS A TOKEN TOO § */
  const rgbKey = s => {
    const m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[\/,]\s*([\d.]+)(%?))?\s*\)$/.exec(String(s).trim());
    if (!m) return null;
    const a = m[4] == null ? 1 : parseFloat(m[4]) / (m[5] ? 100 : 1);
    return [+m[1], +m[2], +m[3], +a.toFixed(3)].join(' ');
  };
  const wash = {};
  (root ? root.decls : []).forEach(d => {
    const k = /^--[\w-]+$/.test(d.prop) && rgbKey(d.val);
    if (k && !/^(0 0 0|255 255 255) 1$/.test(k)) (wash[k] = wash[k] || []).push(d.prop);
  });
  const hex = (a, b, c) => [a, b, c].map(n => (+n).toString(16).padStart(2, '0')).join('');
  rules.filter(r => /\.tile(?![\w-])/.test(r.sel)).forEach(r => r.decls.forEach(d => {
    if (/^--/.test(d.prop)) return;
    const seen = [];
    for (const m of d.val.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)) seen.push([m[0], hex(m[1], m[2], m[3])]);
    for (const m of d.val.matchAll(/#([0-9a-f]{6})\b/gi)) seen.push([m[0], m[1].toLowerCase()]);
    seen.forEach(([lit, h]) => {
      if (tok[h]) handTone.push('line ' + r.line + '  ' + r.sel + '  ' + d.prop + ': `' + lit + '…` is '
        + tok[h].join(' / ') + ' written out — say `color-mix(in srgb, var(' + tok[h][0] + ') N%, transparent)`');
    });
    for (const m of d.val.matchAll(/rgba?\([^)]*\)/g)) {
      const k = rgbKey(m[0]);
      if (k && wash[k]) handTone.push('line ' + r.line + '  ' + r.sel + '  ' + d.prop + ': `' + m[0] + '` is '
        + wash[k].join(' / ') + ' written out — say `var(' + wash[k][0] + ')`');
    }
  }));
}

/* ---------- 7c. THE PICTURES' COLOURS ARE THE PICTURES' OWN § */
const pfpTone = [];
{
  const linksSrc = (() => { try { return fs.readFileSync(path.join(dir, 'js', 'links.js'), 'utf8'); } catch (e) { return ''; } })();
  const start = linksSrc.indexOf('const PFP_ART = {');
  const end = start < 0 ? -1 : linksSrc.indexOf('\n};', start);
  const ground = (/const AV_BUST_GROUND = '(#[0-9a-f]{6})'/i.exec(linksSrc) || [])[1];
  if (start < 0 || end < 0) pfpTone.push('js/links.js has no `const PFP_ART = {…};` — the ten pictures were NOT checked');
  else {
    const art = linksSrc.slice(start, end) + (ground ? ' ' + ground : '');
    const root = rules.find(r => r.sel === ':root' && !r.cond);
    const tok = {};
    (root ? root.decls : []).forEach(d => {
      if (/^--pfp/i.test(d.prop)) pfpTone.push('style.css line ' + root.line + '  :root declares ' + d.prop + ' — a picture\'s colour offered to the whole app; it belongs in PFP_ART');
      const m = /^--[\w-]+$/.test(d.prop) && /^#([0-9a-f]{6})\b/i.exec(d.val);
      if (m) (tok[m[1].toLowerCase()] = tok[m[1].toLowerCase()] || []).push(d.prop);
    });
    if (!Object.keys(tok).length) pfpTone.push(':root holds no hex colour tokens this check can read — the pictures were NOT checked');
    const hexes = [...art.matchAll(/#([0-9a-f]{6})\b/gi)].map(m => m[1].toLowerCase());
    if (hexes.length < 20) pfpTone.push('only ' + hexes.length + ' colours found in PFP_ART — the drawings were not read');
    [...new Set(hexes)].forEach(h => {
      if (tok[h]) pfpTone.push('js/links.js PFP_ART paints #' + h + ', which is ' + tok[h].join(' / ') + ' — a picture\'s colours are its own, never the app\'s or the paper\'s');
    });
  }
}

/* FIRST, because everything below it reads a file it assumes is well formed. § */
const bal = bracesBalance(css);
say('A STRAY CLOSING BRACE — the browser discards from here to wherever it can resync, '
    + 'which can take the rules after it too',
    bal.stray.map(n => 'style.css line ' + n));
say('A BLOCK THAT IS NEVER CLOSED — everything after it is inside it',
    bal.unclosed ? [bal.unclosed + ' unclosed ' + (bal.unclosed === 1 ? 'block' : 'blocks')] : []);

/* ---------- ONE ID, ONE ELEMENT § */
{
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const seen = {};
  for (const m of html.matchAll(/id="([^"]+)"/g)) seen[m[1]] = (seen[m[1]] || 0) + 1;
  say('THE SAME ID ON TWO ELEMENTS — every rule for either lands on both, and '
      + 'getElementById returns whichever came first',
      Object.keys(seen).filter(k => seen[k] > 1).map(k => k + ' appears ' + seen[k] + ' times'));
}

say('THE SAME PROPERTY TWICE IN ONE RULE — the first never applies', twice);
say('ONE SELECTOR IN TWO PLACES, disagreeing about a property', dupSel);
say('A RULE OVERRIDDEN BY A LATER COPY OF ITSELF', order);
say('PROPERTIES THAT CONTRADICT EACH OTHER', clash);
say('A TILE THAT WRITES A TOKEN\'S COLOUR OUT BY HAND — a literal cannot say which token it meant', handTone);
say('A PROFILE PICTURE PAINTED IN THE APP\'S OWN COLOURS, OR ONE OFFERED TO IT — the ten are their own', pfpTone);
/* SOFT: this is the one section that cannot prove its own findings — see `say` above. */
say('CLASSES STYLED AND NOWHERE PRODUCED — no literal in the code could assemble these', dead, true);
say('CLASSES A LITERAL COULD BE ASSEMBLING — ' + [...builtPrefix].sort().join(' ')
    + ' appear before a `+`, so these may well be live', built, true);
say('A LOADING SCREEN THAT DRAWS WHAT NO BOOK TEACHES, OR SHOWS THE STILL ONE OVER A DRAWING', splashBad);
say('A RULE WITH NOTHING IN IT', hollow);
say('TAPPABLE THINGS THAT WOULD LOOK LIKE PLAIN TEXT', tapBad);

/* ---------- 8. A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS § */
{
  const html = path.join(dir, 'index.html');
  const nameless = [];
  const h = fs.existsSync(html) ? fs.readFileSync(html, 'utf8') : '';
  if (!h) nameless.push('index.html could not be read — whether the loading screen names the app was NOT checked');
  const bare_ = h.replace(/<!--[\s\S]*?-->/g, '');
  const a = bare_.indexOf('<div id="splash-still"');
  /* TO ITS OWN CLOSING TAG, counted, so the name in `#splash-say` after it cannot pass for the still
     one's — the fault this section's last version had twice, a block running on into the next. */
  let still = '';
  if (a >= 0) {
    let depth = 0, i = a;
    for (const m of bare_.slice(a).matchAll(/<(\/?)div\b[^>]*>/g)) {
      depth += m[1] ? -1 : 1;
      if (!depth) { i = a + m.index + m[0].length; break; }
    }
    still = bare_.slice(a, i);
  }
  if (h && !still) nameless.push('index.html has no `#splash-still` — a first visit has no loading screen to name the app on');
  else if (h && !/@family\./i.test(still.replace(/<[^>]*>/g, '').replace(/\s+/g, ''))) {
    nameless.push('`#splash-still` never says @family. — every first visit is a loading screen that does not name the app');
  }
  const pick = (/<script id="pick-splash">([\s\S]*?)<\/script>/.exec(h) || [])[1] || '';
  if (pick.indexOf(`insertAdjacentHTML('beforeend', '<div class="sp-sig">@family.</div>')`) < 0) {
    nameless.push('the picker does not sign a drawing it takes from the books — `<div class="sp-sig">@family.</div>` is not added to it');
  }
  say('A LOADING SCREEN THAT DOES NOT SAY WHOSE APP IT IS', nameless);
}

/* ---------- 9. A SPLASH BUILT AS ONE SEAMLESS LOOP STAYS ONE § */
{
  /* ALL FOUR ARE IN THE TEXTBOOKS — the coin, the sieve, Bayes and How many fit? § */
  const { animRow } = require('./check-anims.js');
  const markup = id => { const row = animRow(id); return row ? row.html : null; };
  /* KEYFRAMES BY NAME, read off the comment-blanked text so a keyframe described in prose is not a keyframe. § */
  const frames = {};
  const rowBare = Object.keys({ coin: 1, sieve: 1, bayes: 1, fit: 1 }).map(id => animRow(id)).filter(Boolean)
    .map(r => r.css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))).join('\n');
  for (const m of (bare + '\n' + rowBare).matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const bare_ = bare + '\n' + rowBare;
    let i = m.index + m[0].length, depth = 1;
    while (i < bare_.length && depth) { if (bare_[i] === '{') depth++; else if (bare_[i] === '}') depth--; i++; }
    const body = bare_.slice(m.index + m[0].length, i - 1);
    const props = new Set();
    for (const s of body.matchAll(/\{([^{}]*)\}/g)) {
      s[1].split(';').forEach(d => { const k = d.split(':')[0].trim().toLowerCase(); if (k) props.add(k); });
    }
    frames[m[1]] = props;
  }
  const WORDS = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'infinite', 'both',
    'forwards', 'backwards', 'none', 'alternate', 'reverse', 'alternate-reverse', 'normal',
    'running', 'paused', 'step-start', 'step-end', 'end', 'start', 'jump-none', 'jump-both']);
  const namesIn = val => val.replace(/[\w-]*\([^()]*\)/g, '').split(/[\s,]+/)
    .filter(t => /^[a-z][\w-]*$/i.test(t) && !WORDS.has(t));
  const loopBad = [];

  const LOOPED = {
    /* THE COIN'S FACES ARE ONE METAL, AND IT HAS AN EDGE. § */
    coin: (m, R) => {
      const bad = [];
      R.filter(r => /^\.cn-[ht]$/.test(r.sel) && !r.cond).forEach(r => r.decls
        .filter(d => /^(background|background-color|color|border|border-color)$/.test(d.prop))
        .forEach(d => bad.push('line ' + r.line + '  ' + r.sel + ' sets its own ' + d.prop
          + ' — the two faces of the coin are one metal, drawn once in `.cn-coin b`')));
      const coin = (m.match(/<div class="cn-coin">([\s\S]*?)<\/div>/) || [])[1] || '';
      const discs = (coin.match(/<i><\/i>/g) || []).length;
      if (discs < 4) bad.push('the coin holds ' + discs + ' edge discs — fewer than four and it is '
        + 'a hairline whenever it is edge-on (tools/coin.py prints them)');
      return bad;
    },
    /* THE SIEVE IS A SIEVE. § */
    sieve: (m, R) => {
      const bad = [];
      const least = n => { for (let p = 2; p <= n; p++) if (n % p === 0) return p; };
      const cells = [...m.matchAll(/<i[^>]*><b[^>]*>(\d+)<\/b>([\s\S]*?)<\/i>/g)];
      const seen = cells.map(c => +c[1]);
      if (seen.join() !== '2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17') {
        bad.push('the row reads ' + seen.join(' ') + ' — it is 2 to 17, in order');
      }
      cells.forEach(([, num, rest]) => {
        const n = +num, p = least(n);
        const strikes = [...rest.matchAll(/<s class="sv-(\d+)( sv-again)?"/g)].map(s => ({ by: +s[1], again: !!s[2] }));
        const ringed = /<u class="sv-/.test(rest);
        if (p === n) {
          if (strikes.length) bad.push(n + ' is prime and is struck through');
          if (!ringed) bad.push(n + ' is prime and is not ringed');
          return;
        }
        if (ringed) bad.push(n + ' is not prime and is ringed');
        const first = strikes.find(s => !s.again);
        if (!first) bad.push(n + ' is not prime and nothing strikes it');
        else if (first.by !== p) bad.push(n + ' is struck by ' + first.by + ' — its smallest factor is ' + p
          + ', so ' + p + ' is the prime that removes it');
        strikes.filter(s => s.again).forEach(s => {
          if (n % s.by || s.by === p) bad.push(n + ' has a second line for ' + s.by + ', which does not also divide it');
        });
        strikes.forEach(s => { if (s.by > 3) bad.push(n + ' is struck by ' + s.by + ' — the sieve stops at 3, since 5 × 5 > 17'); });
      });
      if (!R.some(r => r.sel === '.an-sieve .sv-grid' && r.decls.some(d => d.prop === 'flex-wrap' && d.val === 'nowrap'))) {
        bad.push('`.an-sieve .sv-grid` no longer says `flex-wrap: nowrap` — at 320px 17 wraps alone onto a second line');
      }
      return bad;
    },
    /* BAYES IS RIGHT, RECOMPUTED FROM THE DOTS. § */
    bayes: (m, R) => {
      const bad = [];
      const people = [...m.matchAll(/<g class="by-p (by-tp|by-fn|by-fp|by-tn)"([^>]*)>([\s\S]*?)<\/g>/g)];
      const N = people.length;
      if (N !== 100) bad.push(N + ' people in the grid — the picture is a hundred, so a count is a percentage');
      let HAVE = 0, TP = 0, FP = 0;
      const lands = { tp: [], fp: [] };
      people.forEach(([, cls, attrs, inner], k) => {
        const has = /class="by-gold"/.test(inner), pos = /class="by-ring"/.test(inner);
        const want = (has ? (pos ? 'by-tp' : 'by-fn') : (pos ? 'by-fp' : 'by-tn'));
        if (cls !== want) bad.push('person ' + (k + 1) + ' is ' + cls + ' but is drawn as ' + want
          + ' — the class is what moves it, the circles are what it shows');
        HAVE += has; TP += has && pos; FP += !has && pos;
        const go = attrs.match(/--go: translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);
        if (pos !== !!go) bad.push('person ' + (k + 1) + (pos ? ' tested positive and has no --go — it stays behind when the positives regroup'
          : ' tested negative and has a --go — it would join the positives'));
        if (pos && go) {
          const c = inner.match(/cx="([\d.]+)" cy="([\d.]+)"/);
          if (c) lands[has ? 'tp' : 'fp'].push([+c[1] + +go[1], +c[2] + +go[2]]);
        }
      });
      if (!TP || !FP) bad.push('TP ' + TP + ', FP ' + FP + ' — with either at nought there is no Bayes to show');
      const rowOf = list => new Set(list.map(p => p[1].toFixed(2)));
      if (rowOf(lands.tp).size !== 1 || rowOf(lands.fp).size !== 1 || [...rowOf(lands.tp)][0] === [...rowOf(lands.fp)][0])
        bad.push('the positives do not land as two rows, true over false — the regrouping is meant to be the answer');
      const spots = new Set([...lands.tp, ...lands.fp].map(p => p.map(v => v.toFixed(2)).join()));
      if (spots.size !== TP + FP) bad.push((TP + FP - spots.size) + ' positives land on top of another — the rows would show fewer than there are');
      /* A LINE ENDS AT `</span>` OR `</text>`; every other tag is inside a line (`<b>9</b> of 18`).
         Run together, "flags 9 of 90" and "9 of 18" read as "flags 9 of 909". */
      const text = m.replace(/<\/(span|text)>/g, '\n').replace(/<[^>]+>/g, '')
        .replace(/&#247;/g, '÷').replace(/&#8217;/g, '’');
      const P = TP + FP, pc = Math.round(100 * TP / P);
      const said = [
        [/(\d+) people take a test/, [N], 'the first line'],
        [/(\d+) of them have it/, [HAVE], 'the prior'],
        [/finds (\d+) of those (\d+)/, [TP, HAVE], 'the true positives'],
        [/flags (\d+) of (\d+)/, [FP, N - HAVE], 'the false positives'],
        [/= (\d+) ÷ \((\d+) \+ (\d+)\)/, [TP, TP, FP], 'the sum'],
        [/(\d+) of (\d+) positives · (\d+)%/, [TP, P, pc], 'the answer'],
      ];
      said.forEach(([re, want, what]) => {
        const got = text.match(re);
        if (!got) { bad.push(what + ' is not written — the check looks for ' + re); return; }
        if (got.slice(1).map(Number).join() !== want.join()) bad.push(what + ' says ' + got[0] + ', and the dots make it '
          + want.join(', ') + ' — P(has it | +) = ' + TP + ' / (' + TP + ' + ' + FP + ') = ' + pc + '%; re-run tools/bayes.py');
      });
      return bad;
    },
    /* HOW MANY FIT IS RIGHT, READ BACK FROM ITS OWN WORDS — and the owner's example is the still. § */
    fit: (m, R) => {
      const bad = [];
      const WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
      const UNIT = { halves: [1, 2], thirds: [1, 3], quarters: [1, 4] };
      const PART = { half: 2, third: 3, quarter: 4 };
      const plain = h => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      const q = (n, d) => { const g = gcd(n, d) || 1; return (n / g) + '/' + (d / g); };
      const scenes = m.split('<g class="fit-s"').slice(1);
      if (scenes.length < 4) bad.push(scenes.length + ' examples — the owner\'s 4 and 3, one that fits exactly, one with a half and the fractions case');
      scenes.forEach((s, k) => {
        const at = 'example ' + (k + 1);
        const ask = /^How many (\d+)s fit into (\d+)\?$/.exec(plain((/<text class="fit-q"[^>]*>([\s\S]*?)<\/text>/.exec(s) || [])[1] || ''))
          || /^How many (halves|thirds|quarters) fit into (\d+)\?$/.exec(plain((/<text class="fit-q"[^>]*>([\s\S]*?)<\/text>/.exec(s) || [])[1] || ''));
        if (!ask) { bad.push(at + ' asks no "How many …s fit into …?" this check can read'); return; }
        const div = UNIT[ask[1]] || [+ask[1], 1], n = +ask[2], word = UNIT[ask[1]] ? ask[1] : ask[1] + 's';
        const end = /<text class="fit-end"[^>]*>(\d+)<\/text>/.exec(s);
        if (!end || +end[1] !== n) bad.push(at + ' asks about ' + n + ' and its bar ends at ' + (end ? end[1] : 'nothing'));
        const sumAt = s.indexOf('<g class="fit-sum');
        const toks = [...s.slice(sumAt < 0 ? s.length : sumAt).matchAll(/<g class="[^"]*"><text[^>]*>(\d+)<\/text><path[^>]*\/><text[^>]*>(\d+)<\/text><\/g>|<text[^>]*>([^<]+)<\/text>/g)]
          .map(t => t[3] != null ? t[3] : [+t[1], +t[2]]);
        const num = t => Array.isArray(t) ? t : /^\d+$/.test(t) ? [+t, 1] : null;
        if (toks.length < 5 || toks[1] !== '÷' || toks[3] !== '=' || !num(toks[0]) || !num(toks[2]) || !num(toks[4])) { bad.push(at + "'s sum reads " + JSON.stringify(toks) + ' — not a ÷ b = c'); return; }
        const A = num(toks[0]), B = num(toks[2]), Wh = num(toks[4]), F = toks[5] ? num(toks[5]) : [0, 1];
        if (q(A[0], A[1]) !== q(n, 1) || q(B[0], B[1]) !== q(div[0], div[1])) bad.push(at + ' asks how many ' + word + ' fit into ' + n + ' and its sum is ' + q(A[0], A[1]) + ' ÷ ' + q(B[0], B[1]));
        const want = q(A[0] * B[1], A[1] * B[0]), got = q(Wh[0] * F[1] + F[0] * Wh[1], Wh[1] * F[1]);
        if (want !== got) bad.push(at + "'s sum says " + q(A[0], A[1]) + ' ÷ ' + q(B[0], B[1]) + ' = ' + got + ', and it is ' + want + ' — re-run tools/fit.py');
        const say = /^(Exactly )?(\w+)(?: and a (half|third|quarter))? (\S+) fit into (\d+)$/i.exec(plain((/<text class="fit-say[^"]*"[^>]*>([\s\S]*?)<\/text>/.exec(s) || [])[1] || ''));
        if (!say) bad.push(at + "'s sentence is not \"… fit into …\" in words");
        else {
          const whole = WORD.indexOf(say[2].toLowerCase()), part = say[3] ? [1, PART[say[3]]] : [0, 1];
          if (whole < 0 || q(whole * part[1] + part[0], part[1]) !== want) bad.push(at + ' says "' + say[0] + '" and the sum makes it ' + want);
          if (say[4] !== word || +say[5] !== n) bad.push(at + ' asks how many ' + word + ' fit into ' + n + ' and says ' + say[4] + ' fit into ' + say[5]);
          if (!!say[1] !== !say[3]) bad.push(at + ' says "' + say[0] + '" — "Exactly" is for a fit with nothing over, and only then');
        }
        const counts = [...s.matchAll(/<text class="fit-n fit-pp"[^>]*>(\d+)<\/text>/g)].map(c => +c[1]);
        const w = Wh[0] / Wh[1];
        if (counts.join() !== Array.from({ length: w }, (_, i) => i + 1).join()) bad.push(at + ' counts ' + (counts.join(', ') || 'nothing') + ' over its copies, and ' + w + ' whole ones fit');
        if (k === 0 && (n !== 4 || q(div[0], div[1]) !== '3/1')) bad.push('the first example is how many ' + word + ' fit into ' + n + ' — it is the owner\'s own, how many 3s fit into 4, and it is what less movement shows');
      });
      return bad;
    },
  };

  Object.keys(LOOPED).forEach(id => {
    const m = markup(id);
    const row = animRow(id);
    if (!m) { loopBad.push('#splash-' + id + ' is not in data/textbooks.json — this check cannot see it'); return; }
    const classes = new Set();
    for (const c of m.matchAll(/class="([^"]+)"/g)) c[1].split(/\s+/).forEach(x => x && classes.add(x));
    /* A ROW'S RULES ARE ALL ITS OWN; the stylesheet's are found by the splash's id and classes. */
    const R = row ? readRules_(row.css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))) : rules;
    const ours = r => row || r.sel.includes('#splash-' + id)
      || [...classes].some(c => new RegExp('\\.' + c + '(?![\\w-])').test(r.sel));
    const mine = R.filter(r => ours(r) && !/^\d|^from$|^to$/.test(r.sel));
    const moving = mine.filter(r => !/reduced-motion/.test(r.cond));
    const used = new Set();
    moving.forEach(r => r.decls.forEach(d => {
      const p = d.prop.toLowerCase();
      if (p === 'animation' && d.val !== 'none') {
        d.val.split(/,(?![^()]*\))/).forEach(part => {
          namesIn(part).forEach(n => used.add(n));
          if (!/\binfinite\b/.test(part) && !r.decls.some(x => x.prop === 'animation-iteration-count'
              && /infinite/.test(x.val))) {
            loopBad.push('line ' + r.line + '  ' + r.sel + '  →  `' + part.trim() + '` ends — a splash '
              + 'built as a loop must not have an animation that stops');
          }
        });
      }
      if (p === 'animation-name') namesIn(d.val).forEach(n => used.add(n));
      if (p === 'animation-duration' && !r.decls.some(x => x.prop === 'animation-iteration-count'
          && /infinite/.test(x.val))) {
        loopBad.push('line ' + r.line + '  ' + r.sel + '  gives a duration and no `infinite` — it plays once');
      }
    }));
    /* AN INLINE `animation-name` BEATS THE REDUCED-MOTION RULE. § */
    for (const s of m.matchAll(/style="[^"]*animation[\w-]*:\s*([\w-]+)/g)) {
      loopBad.push('#splash-' + id + ' sets `animation…: ' + s[1] + '` inline — an inline declaration '
        + 'beats `animation: none` under reduced motion; write `--kf: ' + s[1] + '` instead');
      used.add(s[1]);
    }
    for (const s of m.matchAll(/--kf:\s*([\w-]+)/g)) used.add(s[1]);
    used.forEach(n => {
      if (!frames[n]) { loopBad.push('#splash-' + id + ' names `' + n + '` and no @keyframes has that name'); return; }
      const other = [...frames[n]].filter(p => p !== 'transform' && p !== 'opacity'
        && p !== 'animation-timing-function');
      if (other.length) loopBad.push('@keyframes ' + n + ' (#splash-' + id + ') animates ' + other.join(', ')
        + ' — only transform and opacity run on the compositor');
    });
    if (!used.size) loopBad.push('#splash-' + id + ' has no animation at all that this check can find');
    if (!mine.some(r => /reduced-motion/.test(r.cond) && r.decls.some(d => d.prop === 'animation' && d.val === 'none'))) {
      loopBad.push('#splash-' + id + ' has no reduced-motion rule turning its animation off');
    }
    LOOPED[id](m, R).forEach(x => loopBad.push('#splash-' + id + ': ' + x));
  });
  say('A SPLASH BUILT AS ONE LOOP THAT IS NOT ONE — ' + Object.keys(LOOPED).join(', '), loopBad);
}

/* ---------- A FIGURE'S INK THAT A MADE-UP SURFACE ON THE CARD DOES NOT GET § */
{
  const INK = ['lbl', 'num', 'ax', 'axis', 'grid', 'pt', 'coin', 'tag', 'cap'];
  const inkBad = [];
  const seen = new Set();
  rules.forEach(r => {
    const parts = r.sel.split(',').map(x => x.trim());
    INK.forEach(k => {
      if (!parts.includes('.qsheet .' + k)) return;
      seen.add(k);
      if (!parts.includes('.qp-area .' + k)) inkBad.push('line ' + r.line + '  ' + r.sel + '  →  inks `.' + k
        + '` in the card\'s sheet and not on a made-up surface beside it (`.qp-area .' + k + '`)');
      /* AND IN THE LOUPE (357): a copy of the picture on <body>, outside every card, so a rule that names only
         the card's containers leaves the magnified grid unstroked and its numbers in the wrong font. */
      if (!parts.includes('.pad-loupe .' + k)) inkBad.push('line ' + r.line + '  ' + r.sel + '  →  inks `.' + k
        + '` in the card and not in the loupe over the finger (`.pad-loupe .' + k + '`)');
    });
  });
  INK.filter(k => !seen.has(k)).forEach(k => inkBad.push('no rule inks `.qsheet .' + k + '` at all -- renamed? whether a made-up surface gets it was NOT checked'));
  say('A FIGURE\'S INK A MADE-UP SURFACE ON THE CARD DOES NOT GET (356)', inkBad);
}

/* ---------- NO TAG IS STYLED AS A KIND OF ITS OWN (docs/history/355) § */
{
  const tagBad = [];
  rules.forEach(r => {
    if (/\[data-tag=["']?(kind|number|marks)["']?\]/.test(r.sel)) tagBad.push('line ' + r.line + '  ' + r.sel + '  →  a tag kind with a look of its own');
    if (/\.fc-flags?\b|\.qcard-top\b/.test(r.sel)) tagBad.push('line ' + r.line + '  ' + r.sel + '  →  a card-head pill beside the tag row');
    r.decls.forEach(d => { if (/^--tag-(kind|number|marks)$/.test(d.prop)) tagBad.push('line ' + r.line + '  ' + d.prop + '  →  a token for a tag kind no facet has'); });
  });
  say('A TAG STYLED AS A KIND OF ITS OWN -- every tag is a facet answer in one outline (355)', tagBad);
}

console.log('');
console.log('rules read: ' + rules.length);
console.log(fail
  ? 'FAILED — read each line above; every one is a rule that does not do what it says'
  : noted
    ? 'OK — no dead declarations, no silent overrides, no contradictions. The list above is worth '
      + 'reading and is not a failure: the check cannot see a class name built in pieces.'
    : 'OK — no dead declarations, no silent overrides, no contradictions.');
process.exit(fail ? 1 : 0);