/* `typeset_` — A FRACTION IS DRAWN OVER ITS LINE, AND A POWER IS RAISED. § */
function typeset_(html) {
  let s = String(html == null ? '' : html);
  if (s.indexOf('\u27ee') !== -1) s = vecHtml_(s);
  /* NOTHING TO DO IS THE COMMON CASE -- most of the library is prose -- so it is the first thing
     asked, before a regex is built or a tag is read. */
  if (s.indexOf('^') === -1 && !/&frasl;|\u2044|&#8260;/.test(s)) return s;

  /* AN ELEMENT A TERM MAY BE MADE OF. `<p>` and `<li>` are not -- they are where a term ends. */
  const INLINE = /^(i|b|em|strong|sup|sub|span|u|var|small)$/;
  /* ENTITIES THAT ARE OPERATORS OR SPACES, so a term stops at them. Everything else written as an
     entity -- &radic;, &pi;, &deg;, &theta; -- is part of the number it touches. */
  const OP = /^(minus|times|divide|plusmn|middot|cdot|sdot|nbsp|ensp|emsp|thinsp|mdash|ndash|frasl|lt|gt|le|ge|ne|asymp|equiv|approx|rarr|larr|harr|rArr|hellip|amp|quot|lsquo|rsquo|ldquo|rdquo|there4|#8260|#8722|#160)$/;
  /* A CHARACTER A TERM MAY BE MADE OF: § */
  const ATOM = /[0-9A-Za-z\u00b0\u00b2\u00b3\u00b9\u00bc-\u00be\u0307\u0370-\u03ff\u2070-\u209f\u2032\u2033\u2150-\u215e\u221a\u221e]/;
  const PAIR = { '(': ')', '[': ']', '{': '}' }, BACK = { ')': '(', ']': '[', '}': '{' };
  const FN = /^(sin|cos|tan|log|ln|lg|exp)$/;

  /* WHERE A POSITION SITS: inside a tag, inside an <svg>, and how many <sup>/<sub> deep. Read from
     the start each time, because the string changes under it as fractions are drawn. */
  const where = p => {
    const re = /<(\/?)([a-zA-Z][\w-]*)[^>]*>/g;
    let m, deep = 0, raw = 0;
    while ((m = re.exec(s)) && m.index < p) {
      if (p < m.index + m[0].length) return { tag: true, deep: deep, raw: raw > 0 };
      const n = m[2].toLowerCase(), by = m[1] ? -1 : (/\/>$/.test(m[0]) ? 0 : 1);
      if (n === 'sup' || n === 'sub') deep += by;
      if (n === 'svg' || n === 'math' || n === 'script' || n === 'style') raw += by;
    }
    return { tag: false, deep: deep, raw: raw > 0 };
  };
  /* THE ELEMENT CLOSING AT `end` (just past `</name>`): where its own opening tag starts. Counted,
     not matched, because a numerator holds superscripts of its own -- d<sup>2</sup>y. */
  const openOf = (end, name) => {
    const re = new RegExp('<(/?)' + name + '\\b[^>]*>', 'gi'), all = [];
    let m;
    while ((m = re.exec(s)) && m.index < end) all.push(m);
    for (let k = all.length - 1, d = 0; k >= 0; k--) {
      d += all[k][1] ? 1 : -1;
      if (d === 0) return all[k].index;
    }
    return -1;
  };
  /* AND THE OTHER WAY: the element opening at `at`, and just past its closing tag. */
  const shutOf = (at, name) => {
    const re = new RegExp('<(/?)' + name + '\\b[^>]*>', 'gi');
    re.lastIndex = at;
    for (let m, d = 0; (m = re.exec(s));) {
      d += m[1] ? -1 : 1;
      if (d === 0) return m.index + m[0].length;
    }
    return -1;
  };
  /* BRACKETS, counted in the text and stepping over tags, on any string -- `bare` asks it of an
     operand rather than of the whole. */
  const brFwd = (t, at) => {
    const o = t[at], c = PAIR[o];
    for (let i = at, d = 0; i < t.length; i++) {
      if (t[i] === '<') { const g = t.indexOf('>', i); if (g < 0) return -1; i = g; continue; }
      if (t[i] === o) d++;
      else if (t[i] === c && --d === 0) return i;
    }
    return -1;
  };
  const brBack = at => {
    const c = s[at], o = BACK[c];
    for (let i = at, d = 0; i >= 0; i--) {
      if (s[i] === '>') { const l = s.lastIndexOf('<', i); if (l < 0) return -1; i = l; continue; }
      if (s[i] === c) d++;
      else if (s[i] === o && --d === 0) return i;
    }
    return -1;
  };
  /* THE TERM ENDING AT `end`, read leftwards: elements, bracket groups, entities that are not
     operators, and the characters above, until a space or an operator. Returns where it starts. */
  const termBack = end => {
    let i = end;
    while (i > 0) {
      const c = s[i - 1];
      if (c === '>') {
        const l = s.lastIndexOf('<', i - 1), t = /^<\/([a-zA-Z]\w*)>$/.exec(s.slice(l, i));
        if (!t || !INLINE.test(t[1].toLowerCase())) break;
        const o = openOf(i, t[1].toLowerCase());
        if (o < 0) break;
        i = o;
      } else if (BACK[c]) {
        const o = brBack(i - 1);
        if (o < 0) break;
        i = o;
      } else if (c === ';') {
        const a = s.lastIndexOf('&', i - 1), e = a < 0 ? null : /^&(#?\w+);$/.exec(s.slice(a, i));
        if (!e || OP.test(e[1])) break;
        i = a;
      } else if (c === '.' && /\d/.test(s[i - 2] || '') && /\d/.test(s[i] || '')) {
        i--;
      } else if (ATOM.test(c)) {
        i--;
      } else break;
    }
    return i;
  };
  /* AND THE TERM STARTING AT `from`, read rightwards. Returns where it ends. */
  const TAG = /<([a-zA-Z]\w*)\b[^>]*>/y;
  const termFwd = from => {
    let i = from;
    while (i < s.length) {
      const c = s[i];
      if (c === '<') {
        TAG.lastIndex = i;
        const t = TAG.exec(s);
        if (!t || !INLINE.test(t[1].toLowerCase())) break;
        const z = shutOf(i, t[1].toLowerCase());
        if (z < 0) break;
        i = z;
      } else if (PAIR[c]) {
        const z = brFwd(s, i);
        if (z < 0) break;
        i = z + 1;
      } else if (c === '&') {
        const e = /^&(#?\w+);/.exec(s.slice(i, i + 12));
        if (!e || OP.test(e[1])) break;
        i += e[0].length;
      } else if (c === '.' && /\d/.test(s[i - 1] || '') && /\d/.test(s[i + 1] || '')) {
        i++;
      } else if (ATOM.test(c)) {
        i++;
      } else break;
    }
    return i;
  };
  const GAP = /^(?:\s|&nbsp;)+/;
  const gapBack = at => {
    let i = at;
    for (;;) {
      if (i > 0 && /\s/.test(s[i - 1])) i--;
      else if (s.slice(i - 6, i) === '&nbsp;') i -= 6;
      else return i;
    }
  };
  const bare = t => {
    const u = t.replace(/^(?:\s|&nbsp;)+|(?:\s|&nbsp;)+$/g, '');
    return u[0] === '(' && brFwd(u, 0) === u.length - 1 ? u.slice(1, -1) : u;
  };
  const stack = (n, d) => '<span class="frac"><span class="frac-n">' + bare(n)
    + '</span><span class="frac-s">/</span><span class="frac-d">' + bare(d) + '</span></span>';

  /* ---------- POWERS FIRST, so `x^(5/2)` is a power before anything looks at its slash ---------- */
  for (let from = 0; ;) {
    const p = s.indexOf('^', from);
    if (p === -1) break;
    from = p + 1;
    const w = where(p);
    if (w.tag || w.raw) continue;
    let exp = '', end = p + 1;
    if (PAIR[s[p + 1]]) {
      const z = brFwd(s, p + 1);
      if (z < 0) continue;
      exp = s.slice(p + 2, z);
      end = z + 1;
    } else {
      const t = /^(?:-|&minus;|\u2212|\+)?(?:\d+(?:\.\d+)?|[A-Za-z\u0370-\u03ff]+|[\u00bc-\u00be\u2150-\u215e]|<i>[^<]*<\/i>)/
        .exec(s.slice(p + 1, p + 40));
      if (!t) continue;
      exp = t[0];
      end = p + 1 + t[0].length;
    }
    if (!exp.trim()) continue;
    /* A HYPHEN IN AN INDEX IS A MINUS SIGN, and set as one: 4<sup>−2</sup>, not 4<sup>-2</sup>. */
    s = s.slice(0, p) + '<sup>' + exp.replace(/^-/, '&minus;') + '</sup>' + s.slice(end);
    from = p;
  }

  /* ---------- THEN EVERY FRACTION SLASH, left to right -------------------------------------------- */
  const SL = /&frasl;|\u2044|&#8260;/g;
  for (let from = 0; ;) {
    SL.lastIndex = from;
    const m = SL.exec(s);
    if (!m) break;
    const p = m.index, q = p + m[0].length;
    from = q;
    const w = where(p);
    if (w.tag || w.raw) continue;
    /* A FRACTIONAL INDEX LOOKS LIKE A HALF (owner, 1 Nov: "make it look more like a half. universal rule"): x<sup>1/2</sup> is a small 1 over a small 2 on a slant, like ½ -- on its line, not stacked (241). */
    if (w.deep) {
      const a = /\d+$/.exec(s.slice(Math.max(0, p - 12), p)), b = /^\d+/.exec(s.slice(q, q + 12));
      if (!a || !b) continue;
      const ix = '<span class="frac-ix"><span class="frac-ix-n">' + a[0] + '</span>&#x2044;<span class="frac-ix-d">' + b[0] + '</span></span>';
      s = s.slice(0, p - a[0].length) + ix + s.slice(q + b[0].length);
      from = p - a[0].length + ix.length;
      continue;
    }
    /* THE TOP. */
    const le = gapBack(p);
    let ls = termBack(le), whole = '', num;
    if (ls === le) continue;
    if (s.slice(le - 6, le) === '</sup>') {
      const o = openOf(le, 'sup');
      const pre = s.slice(ls, o), inner = s.slice(s.indexOf('>', o) + 1, le - 6);
      if (!pre) num = inner;
      else if (/^\(?\d+\)?$/.test(pre)) { whole = pre; num = inner; }
      else num = s.slice(ls, le);
    } else {
      const f = /(sin|cos|tan|log|ln|lg|exp)(?:\s|&nbsp;)+$/.exec(s.slice(0, ls));
      if (f && !/[A-Za-z]/.test(s[f.index - 1] || '')) ls = f.index;
      num = s.slice(ls, le);
    }
    /* THE BOTTOM. */
    const g = GAP.exec(s.slice(q, q + 40));
    const rs = q + (g ? g[0].length : 0);
    let re, den;
    if (/^<sub\b/i.test(s.slice(rs, rs + 5))) {
      re = shutOf(rs, 'sub');
      if (re < 0) continue;
      den = s.slice(s.indexOf('>', rs) + 1, re - 6);
    } else {
      re = termFwd(rs);
      if (re === rs) continue;
      if (FN.test(s.slice(rs, re))) {
        const h = GAP.exec(s.slice(re, re + 40));
        const more = h ? termFwd(re + h[0].length) : re;
        if (h && more > re + h[0].length) re = more;
      }
      den = s.slice(rs, re);
    }
    const out = whole ? '<span class="frac-mixed">' + whole + stack(num, den) + '</span>' : stack(num, den);
    s = s.slice(0, ls) + out + s.slice(re);
    /* FROM WHERE THIS ONE STARTED, not after it: a fraction inside its numerator was inside a
       <sup> a moment ago and skipped as an index, and it is in a span now and should be drawn. */
    from = ls;
  }
  return s;
}

/* ---------- THE ANSWER: SHOWN, THEN SPLIT BY WHO WAS READING, AND NOW ONE PAGE FOR EVERYBODY § */
/* ---------- THE RESULT, AND THE REASON FOR IT, AS TWO THINGS § */
function answerParts_(raw) {
  const s = String(raw || '');
  const DASH = /\s+(?:—|–|&mdash;|&ndash;|&#8212;|&#8211;)\s+/g;
  const VOID = /^(?:br|img|hr|wbr|input)$/i;
  const BLOCK = /^(?:table|thead|tbody|tfoot|tr|td|th|ul|ol|li|dl|dt|dd|div|figure)$/i;
  const CODE = '(?:[BMAPC][1-5]|SC[1-5]?|cao|oe|ft|isw|awrt)';
  const RUN = new RegExp('(?:<b>)?\\(?\\b' + CODE + '\\b\\)?(?:</b>)?(?:[\\s,]+(?:<b>)?\\(?\\b' + CODE
    + '\\b\\)?(?:</b>)?)*', 'g');
  const seen = t => String(t).replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/g, ' ').trim();
  let head = s, why = '', m;
  while ((m = DASH.exec(s))) {
    const before = s.slice(0, m.index);
    const open = [];
    const T = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
    let t;
    while ((t = T.exec(before))) {
      const name = t[2].toLowerCase();
      if (VOID.test(name)) continue;
      if (t[1]) {
        const k = open.map(o => o[0]).lastIndexOf(name);
        if (k >= 0) open.splice(k);
      } else open.push([name, t[0]]);
    }
    if (open.some(o => BLOCK.test(o[0]))) continue;
    if (!seen(before)) continue;
    head = before + open.slice().reverse().map(o => '</' + o[0] + '>').join('');
    why = open.map(o => o[1]).join('') + s.slice(m.index + m[0].length);
    break;
  }
  /* THE HEAD: every code, wherever it stands, and the commas it leaves behind. § */
  head = head.replace(/\s+(?:\(\d(?: marks?)?\)|\[\d\])|\s*✓/g, '');
  /* AN ENTITY'S OWN SEMICOLON IS NOT PUNCTUATION. The first version of `tidy` took the `;` off
     `50&deg;` because it ended the head, and drew "50&deg". Entities are parked while it works. */
  const tidy = h => h.replace(/&(#?\w+);/g, '&$1\u0001').replace(/<(b|i|em|strong)>\s*<\/\1>/g, '')
    .replace(/[ \t]+([,;.])/g, '$1').replace(/([,;])(?:\s*[,;])+/g, '$1').replace(/,(\s*[.;])/g, '$1')
    .replace(/[\s,;:]+((?:<\/[a-z]+>)*)\s*$/i, '$1').replace(/^\s*[,;]\s*/, '').trim()
    .replace(/\u0001/g, ';');
  const bare = tidy(head.replace(RUN, ''));
  /* AN ANSWER THAT IS NOTHING BUT CODES ("B1 — and the scheme accepts 8 or −8") would be drawn as
     an empty line with the meaning behind the fold, which is worse than leaving the codes in. */
  if (seen(bare)) head = bare;
  /* THE WHY: only the codes that stand alone. § */
  const KEEP_AFTER = /^[\s,]*(?:for\b|dependent\b|following\b|follows\b|is\b|mark|on\b|&rdquo;|”)/i;
  const KEEP_BEFORE = /(?:\b(?:the|a|an|its|that|this|of)\s+(?:<b>)?|&ldquo;|“)$/i;
  why = why.replace(RUN, (run, at, all) =>
    (KEEP_AFTER.test(all.slice(at + run.length, at + run.length + 16))
      || KEEP_BEFORE.test(all.slice(Math.max(0, at - 12), at))) ? run : '\u0002');
  const cap = (a, c) => a + (c || '').toUpperCase();
  why = why
    /* "— B1, cao, and nothing else scores" -- a code opening the why, or a sentence. FIRST, or
       "= 3. B1 cao. The" is read as a code closing a clause and comes out "= 3.. The". */
    .replace(/^(\s*(?:<[^>]+>)*)\u0002[\s,;:.]*(?:and\s+)?((?:[a-z](?=[a-z]))?)/, (w, a, c) => cap(a, c))
    .replace(/([.!?]\s+(?:<[^>]+>)*)\u0002[\s,;:.]*(?:and\s+)?((?:[a-z](?=[a-z]))?)/g, (w, a, c) => cap(a, c))
    /* "36, cao." -- a code closing a clause takes its comma with it. */
    .replace(/[\s,;]*\u0002[\s,;]*(?=[.!?]|$)/g, '')
    .replace(/\s*\u0002[\s,;]*/g, ' ');
  why = tidy(why);
  /* A WHY THAT STARTS MID-SENTENCE starts with a capital in the fold, which is a box of its own.
     A WORD, not a letter: "<i>x</i> = 3 is a vertical line" must not become "X = 3". */
  why = why.replace(/^((?:\s*<[a-z][^>]*>)*\s*)([a-z])(?=[a-z])/, (w, tags, c) => tags + c.toUpperCase());
  return { head: head, why: seen(why) ? why : '' };
}

function answerBlock_(x) {
  if (!x || !String(x.answer || '').trim()) return '';
  /* WHO MAY SEE THIS IS NOT DECIDED HERE. `questionAnsCard_` asks `ansOpen_` before it draws any of
     this, so a page that has not been shown holds no answer to find. */
  /* WHAT KIND OF ANSWER IT IS, over the result, when the sheet says -- "ANSWER · EXPLAIN" in the
     small capitals the answer box's "YOUR ANSWER" wears on the question card. */
  const kind = String(x.answerType || '').trim();
  /* ---------- THE ANSWER, AND NOTHING ELSE § */
  const p = answerParts_(x.answer);
  return `<div class="qans">
    <span class="qans-head">Answer${kind ? ` &middot; ${esc(kind)}` : ''}</span>
    <div class="qans-body">${typeset_(p.head)}</div>
  </div>`;
}

/* OPENING ONE SHOWS THE STEM, THE LEAD AND THE PART — in that order, because that is the order it is printed and because a part without them cannot be answered. § */

/* ---------- WHAT A PART IS CALLED § */
/* WHOLE NUMERAL FIRST, so "iv" is four and not letter i followed by v. Trying letter-then-numeral
   first would match that greedily and be wrong on exactly the parts nobody checks. */
const ROMAN_ONLY = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;
const LETTER_ROMAN = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;

function qPartBits_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return null;
  if (ROMAN_ONLY.test(s)) return { letter: '', roman: s };
  const m = s.match(LETTER_ROMAN);
  return m ? { letter: m[1], roman: m[2] } : null;
}

/* The name on a card: Q1.1 · Q5b · Q5a(i) · Q1.3(i) § */
const NUM_ROMAN = /^(\d+)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;
function qPartName_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return '';
  if (/^\d+$/.test(s)) return '.' + s;
  const n = NUM_ROMAN.exec(s);
  if (n) return '.' + n[1] + '(' + n[2].toLowerCase() + ')';
  const b = qPartBits_(s);
  return b ? b.letter + '(' + b.roman + ')' : s;
}

/* ---------- ONE READER FOR THE PAPER'S ID § */
function paperIdOf_(r) {
  return (r && (r.paperId || r.paper_id || r.paper)) || '';
}

/* ---------- THE ORDER OF A QUESTION'S PARTS, DECIDED FOR THE WHOLE QUESTION AT ONCE § */
const romanVal_ = s => {
  const v = { i: 1, v: 5, x: 10 };
  let n = 0;
  for (let k = 0; k < s.length; k++) {
    const a = v[s[k]] || 0, b = v[s[k + 1]] || 0;
    n += a < b ? -a : a;
  }
  return n;
};
const partBare_ = p => String(p == null ? '' : p).trim().toLowerCase().replace(/[()\s]/g, '');
function partKeyOf_(part, numerals) {
  const s = partBare_(part);
  if (!s) return '';
  if (/^\d+$/.test(s)) return padNums_(s);
  if (numerals && ROMAN_ONLY.test(s)) return padNums_(String(romanVal_(s)));
  /* `3ix` after `3v`, by value — as letters "ix" sorts first. */
  const n = NUM_ROMAN.exec(s);
  if (n) return padNums_(n[1]) + padNums_(String(romanVal_(n[2].toLowerCase())));
  const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
  if (m) return m[1] + (m[2] ? padNums_(String(romanVal_(m[2]))) : '');
  return padNums_(s);
}
/* THE DECISION ITSELF, ONE PER QUESTION AND KEYED BY THE ROW: § */
function partNumerals_(rows) {
  const by = {};
  (rows || []).forEach(r => {
    if (!r || isPreamble_(r) || isDocument_(r)) return;
    const k = paperIdOf_(r) + '|' + (r.q == null ? '' : r.q);
    (by[k] = by[k] || []).push(r);
  });
  const out = new Map();
  Object.keys(by).forEach(k => {
    const list = by[k];
    const numerals = list.every(r => { const s = partBare_(r.part); return !s || ROMAN_ONLY.test(s); });
    list.forEach(r => out.set(r, numerals));
  });
  return out;
}
function partKeys_(rows) {
  const numerals = partNumerals_(rows);
  const out = new Map();
  numerals.forEach((n, r) => out.set(r, partKeyOf_(r.part, n)));
  return out;
}

/* ---------- A PART, TAKEN APART FOR ITS TAGS: `ai` IS [a] [ii] § */
/* AN ITEM'S SPLIT: the one `questionItems` worked out with its question's numeral decision, or -- for an item built anywhere else, a harness's or a kept copy's § */
const qSplitOf_ = x => (isQ_(x)
  && (x.qSplit || partSplit_(x.qPart, true))) || { part: '', sub: '' };
function partSplit_(part, numerals) {
  const s = partBare_(part);
  if (!s) return { part: '', sub: '' };
  if (/^\d+$/.test(s)) return { part: '.' + Number(s), sub: '' };
  if (numerals && ROMAN_ONLY.test(s)) return { part: '', sub: s };
  const n = NUM_ROMAN.exec(s);
  if (n) return { part: '.' + Number(n[1]), sub: n[2] };
  const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
  return m ? { part: m[1], sub: m[2] || '' } : null;
}

/* ---------- WHAT A QUESTION IS ABOUT, AS WORDS § */
/* THE PUBLISHER'S NAME IN BOTH SPELLINGS, because the file holds one and people type the other. § */
function companyAtoms_(v) {
  const said = String(v || '').trim();
  if (!said) return '';
  const key = spellKey_(said);
  return key && key !== said.toLowerCase() ? said + ' ' + key : said;
}

/* ---------- THE CODE PRINTED ON THE COVER, WHICH THE SEARCH BOX COULD NOT SEE § */
/* THE CODE IS A FACT ABOUT THE PAPER, so it is read off the paper's own row rather than copied onto every question under it. § */
function specIndex_() {
  const rows = libDocRows_();
  const at = {};
  rows.forEach(r => {
    if (!libIsDoc_(r)) return;
    const pid = paperIdOf_(r);
    const code = String(r.spec_code || (r.row && r.row.spec_code) || '').trim();
    if (pid && code) at[pid] = code;
  });
  return at;
}

function paperCodeAtoms_(row, at) {
  const out = [];
  const spec = String((row && row.spec_code) || (at && at[paperIdOf_(row)]) || '').trim();
  if (spec) { out.push(spec); const k = spellKey_(spec); if (k && k !== spec.toLowerCase()) out.push(k); }
  String((row && row.paper_id) || '').split(/[^A-Za-z0-9]+/).forEach(seg => {
    if (seg.length < 4 || seg.length > 8) return;
    if (!/[A-Za-z]/.test(seg) || !/\d/.test(seg)) return;
    out.push(seg);
  });
  return out.join(' ');
}

/* ---------- MARKUP INTO WORDS, IN ONE PLACE § */
function plainText_(s) {
  return String(s == null ? '' : s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|minus|frasl|deg|pi|times|divide|radic|rsquo|ldquo|rdquo|mdash);/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchText_(r) {
  return plainText_((r && (r.html || '')) + ' ' + (r && (r.lead || '')));
}

/* `practicalText_` — THE GUIDE IS WHAT SOMEBODY IS LOOKING FOR, AND THE SEARCH COULD NOT SEE IT. § */
function practicalText_(p) {
  return plainText_([p.aim, p.outcome, p.science, p.safety, p.feasible, p.venue, p.excluded,
                     p.notes, p.mathsLink, p.specRef, p.hazard,
                     /* THE KIT IS `{name, qty}` NOW AND BOTH HALVES GO IN. § */
                     (p.equipment || []).map(e => e.name + ' ' + e.qty).join(' '),
                     (p.steps || []).join(' '),
                     (p.risks || []).join(' '), (p.variables || []).join(' '),
                     (p.log || []).join(' ')].filter(Boolean).join(' '));
}

/* `projectText_` — `practicalText_`'s move for the projects: § */
/* A COURSEWORK IS LOOKED FOR BY ITS NAMES, whether or not its row happens to say them: § */
/* ---------- THE NAMES A SUBJECT GOES BY IN A TIMETABLE § */
const PROJ_SUBJECT_SAID = { 'Design and Technology': 'DT D&T' };

function projectText_(p) {
  const said = plainText_([p.projectType === 'coursework' ? 'coursework NEA non-exam assessment' : '',
                           PROJ_SUBJECT_SAID[p.subject] || '',
                           p.board, p.specRef, p.summary, p.makes, p.safety, p.share,
                           (p.materials || []).map(e => e.name + ' ' + e.qty).join(' '),
                           (p.steps || []).join(' ')].filter(Boolean).join(' '));
  /* AND EVERY HYPHENATED WORD AGAIN WITHOUT ITS HYPHEN. § */
  const joined = (said.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+/g) || []).map(w => w.replace(/-/g, ''));
  return joined.length ? said + ' ' + joined.join(' ') : said;
}

/* ---------- EVERY PAPER, DERIVED FROM ITS OWN QUESTIONS § */
/* `allTopics()`, `topicBy`, `paperText_`, `paperPages_` AND `paperMismatches()` WERE ALL HERE. § */

/* ---------- ONE ITEM PER PART § */
/* A PREAMBLE IS ONE IDEA AT THREE SCOPES, NOT THREE FEATURES. § */
/* ---------- A SCOPE HOLDS SEVERAL PREAMBLES, AND IT USED TO HOLD EXACTLY ONE § */
/* ---------- AND A FOURTH SCOPE, A LETTER: THE "(d)" OPENING § */
const stemLetter_ = p => { const s = partBare_(p && p.part); return /^[a-z]$/.test(s) ? s : ''; };
function stemIndex_(all) {
  const at = { paper: {}, section: {}, question: {}, letter: {} };
  const put = (bag, key, r) => { (bag[key] || (bag[key] = [])).push(r); };
  all.forEach(r => {
    if (!isPreamble_(r)) return;
    const pid = paperIdOf_(r);
    if (!pid) return;
    const has = r.q !== undefined && r.q !== null && r.q !== '';
    if (has && stemLetter_(r)) put(at.letter, pid + '|' + r.q + '|' + stemLetter_(r), r);
    else if (has) put(at.question, pid + '|' + r.q, r);
    else if (r.section) put(at.section, pid + '|' + r.section, r);
    else put(at.paper, pid, r);
  });
  /* Stable, because `sort` is stable in every engine this runs on and a preamble with no
     `sort_order` must not be reordered against its neighbours by the sort that exists for the
     ones that do. */
  [at.paper, at.section, at.question, at.letter].forEach(bag => {
    Object.keys(bag).forEach(k => { bag[k].sort((a, b) => (a.order || 0) - (b.order || 0)); });
  });
  return at;
}

/* OUTERMOST FIRST, because that is the order the paper prints them in and the order they have to be read in: § */
function preamble_(r, at) {
  const pid = paperIdOf_(r);
  const out = [];
  /* EACH SCOPE IS A LIST NOW — see `stemIndex_` above for what a single row cost. `|| []` rather
     than a guard, because a scope nothing wrote has no key at all and every caller below already
     handles an empty list. */
  /* A STEM WHOSE WORDS ARE STILL IN THE LEDGER COUNTS (397): `libHasField_` reads `libHas` as well as the field. */
  const add = xs => (xs || []).forEach(x => { if (x && (x.html || x.diagram || libHasField_(x, 'html') || libHasField_(x, 'diagram'))) out.push(x); });
  add(at.paper[pid]);
  if (r.section) add(at.section[pid + '|' + r.section]);
  if (r.q !== undefined && r.q !== null && r.q !== '') {
    add(at.question[pid + '|' + r.q]);
    /* THE PART'S LETTER, read the way a typed reference is (`qRefBits_`): "d(ii)" and "dii" are (d). */
    const bits = qRefBits_(partBare_(r.part));
    if (bits && bits.letter && at.letter) add(at.letter[pid + '|' + r.q + '|' + bits.letter]);
  }
  return out;
}

/* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, FROM THE PAPER AND FROM THE QUESTION. § */
/* ---------- OFF THE FILE, FOR THE REASON `libDocRows_` IS WRITTEN DOWN ONCE § */
function needsIndex_(all) {
  const rows = (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && LIBRARY_ROWS.length)
    ? LIBRARY_ROWS : (all || []);
  const at = {};
  rows.forEach(r => {
    if (!libIsDoc_(r)) return;
    const pid = paperIdOf_(r);
    if (pid) at[pid] = asList_(String(r.needs || '').split(','));
  });
  return at;
}

/* THE CELL'S CALCULATOR, IN THE WORDS A PERSON SAYS — the value itself, so the button, the chip and the tag agree (396). */
const NEED_WORDS = { 'no calculator': 'Non-calculator', 'calculator': 'Calculator allowed' };
function needsOf_(r, at) {
  const out = [];
  const add = v => { v = NEED_WORDS[String(v || '').trim().toLowerCase()] || v; if (v && out.indexOf(v) === -1) out.push(v); };
  ((at && at[paperIdOf_(r)]) || []).forEach(add);
  asList_(String((r && r.needs) || '').split(',')).forEach(add);
  /* ---------- AND THE PRINTED SHEET, WHICH IS READ RATHER THAN RE-TYPED § */
  if (r && r.needsPrint) add('Printed sheet');
  return out;
}

/* THE SEARCH HAYSTACK FOR ONE QUESTION — see the `text` getter in `questionItems`, which is the
   only caller and the reason this is a function rather than an expression in the object literal. */
function questionText_(r, lead, spec) {
  return searchText_(r) + lead.map(p => ' ' + searchText_(p)).join('')
            + ' ' + topicAtoms_(r.row ? r.row.topics : r.topics).join(' ')
            + ' ' + companyAtoms_(r.row ? r.row.company : r.company)
            /* AND THE CODE ON THE COVER — see `paperCodeAtoms_`. Off the raw file row, because
               `spec_code` and `paper_id` are both columns of it and neither is enumerated onto the
               payload object. */
            + ' ' + paperCodeAtoms_(r.row || r, spec);
}

function questionItems() {
  const all = DATA.questions || [];
  if (!all.length) return [];

  const stems = stemIndex_(all);
  /* BUILT ONCE PER DRAW, not looked up per question — `all` is 4,682 rows and this walks it once.
     Same reason `stemIndex_` is a map rather than a filter inside the loop. */
  const kit = needsIndex_(all);
  /* AND THE CODE ON EACH PAPER'S COVER — see `specIndex_`. Built once per draw, off the file. */
  const spec = specIndex_();
  /* EACH PART'S PLACE IN ITS QUESTION -- see `partKeys_`. */
  const partKey = partKeys_(all), numerals = partNumerals_(all);

  return all.filter(r => !isPreamble_(r) && !isDocument_(r)).map(r => {
    const lead = preamble_(r, stems);
    return {
      kind: 'question',
      /* "Q5b" IS THE NAME AND THE PAPER IS THE SUBTITLE. A list of parts all called
         "Paper 31: Statistics — June 2022" is a list nobody can read down. */
      name: 'Q' + r.q + qPartName_(r.part),
      key: 'q:' + r.id,
      sub: r.name || '',
      subject: r.subject || '',
      /* THE SAME DERIVATION `allTopics` DID, and the only one it did: a grade is a band value when
         the band is a grade, and blank when it is a stage. Two ladders, one column. */
      grade: r.bandType === 'grade' ? (r.bandValue || '') : '',
      bandType: r.bandType || '', bandValue: r.bandValue || '',
      keystage: r.keystage || '', tier: r.tier || '',
      examBoard: r.examBoard || '', company: r.company || '',
      documentType: r.documentType || '', examWave: r.examWave || '',
      year: r.year || '',
      /* ---------- WHERE THIS QUESTION SITS IN ITS PAPER § */
      qNumber: r.q, qPart: r.part || '', qPartKey: partKey.get(r) || '',
      /* THE PART AS ITS TWO TAGS -- see `partSplit_`. `qPart` stays the raw cell beside it, because the
         sort, `usesAt_`, `qRef` and the checks' fixtures all read the cell. */
      qSplit: partSplit_(r.part, numerals.get(r)),
      /* THE TOPICS, RESOLVED ONCE. § */
      topic: topicOf_({ row: r.row || r }),
      marks: r.marks, section: r.section,
      /* THE WORDS, THE FIGURE AND THE MARK SCHEME — `questionContent_`, so a row whose words come later (397) is given them in place. */
      ...questionContent_(r),
      /* THE SAME SPLIT `topics` AND `keystage` GET — one helper, because a comma is a comma. */
      images: topicAtoms_(r.images || (r.row && r.row.images)),
      /* WHAT TO ANSWER ON when the answer is a mark rather than words -- see `padSurface_`. */
      surface: r.surface || '',
      /* AND WHICH EARLIER PART'S DRAWING IT READS -- see `usesOf_`. */
      uses: r.uses || '',
      /* EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST — see `preamble_`. § */
      stems: lead,
      /* THE STEM'S WORDS TOO. § */
      /* AND THE TOPICS, WHICH THE SEARCH BOX COULD NOT SEE EITHER. § */
      /* ---------- AND WHO PUBLISHED IT, WHICH WAS NEITHER ASKABLE NOR SEARCHABLE § */
      /* ---------- BUILT THE FIRST TIME SOMETHING READS IT, NOT FOR EVERY ROW AT BOOT § */
      get text() {
        const v = questionText_(r, lead, spec);
        Object.defineProperty(this, 'text', { value: v, writable: true, enumerable: true, configurable: true });
        return v;
      },
      /* THE RAW FILE ROW WHERE THERE IS ONE, not the payload object built from it — see the note on `row:` in js/library.js. § */
      /* THE PAPER'S REQUIREMENT AND THE QUESTION'S OWN, already unioned — see `needsOf_`. A list,
         so the facet is multi-valued the way `keystage` is, and so a question can need two things. */
      needs: needsOf_(r, kit),
      row: r.row || r,
    };
  });
}

/* A QUESTION ITEM'S PRIVATE HALF (397): what the Ledger sends, off the mapped row. Spread into the item when it is built,
   and assigned onto it again when the words arrive (`libMerge_`, library.js). */
function questionContent_(r) {
  return {
    lead: r.lead, html: r.html, diagram: r.diagram || '',
    /* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. § */
    answer: r.answer || '', answerType: r.answerType || '',
    /* THE EXPECTED DRAWING AS GEOMETRY, which Check marks the strokes against (366). */
    drawAnswer: r.drawAnswer || '',
    accept: r.accept || '', cells: r.cells || '', markWords: r.markWords || '',
    choices: r.choices || [], choiceRight: r.choiceRight || [],
    /* AN ORDERING'S EVERY RIGHT ORDER AND ITS TWO ENDS -- see `orderBox_` and library.js. */
    choiceWays: r.choiceWays || [], orderEnds: r.orderEnds || [],
    examinerNote: r.examinerNote || '',
  };
}

/* ================= A CARD WHOSE WORDS ARE IN THE LEDGER (397) =================
   Its title and tags, waiting, until `libItems` brings its words; a question comes with its stems and its other parts. */
function libSlim_(x) {
  if (!x) return false;
  if (isQ_(x)) return libWaits_(x.row) || (x.stems || []).some(p => libWaits_(p));
  if (isPractical_(x) || isProject_(x) || isContent_(x)) return libWaits_(x.row);
  return false;
}
function libIdsFor_(x) {
  if (!x || !x.row) return [];
  if (isPractical_(x)) return ['pr:' + x.row.id];
  if (isProject_(x)) return ['pj:' + x.row.id];
  if (isContent_(x)) return ['ct:' + x.row.bookId + '#' + x.row.n];
  if (!isQ_(x)) return [];
  const rows = [x.row].concat((x.stems || []).map(p => p.row || p));
  const k = qId_(x);
  try { if (k) (questionParts_()[k] || []).forEach(s => rows.push(s.row)); } catch (e) { oops_(e, 'find:libIdsFor_') }
  return [...new Set(rows.filter(libWaits_).map(libWireQ_))];
}
/* ASK FOR ONE CARD'S WORDS (nothing, signed out — the card says so). */
function libWant_(x) { if (libSlim_(x)) libAsk_(libIdsFor_(x)); }
/* AN ITEM BY ITS KEY, off the list both finders are built from — for a merge to give the item its words in place. */
const LIB_ITEMS = new WeakMap();
function libItemByKey_(k) {
  let all;
  try { all = typeof ALL_MEMO !== 'undefined' && ALL_MEMO.items; } catch (e) { all = null; }
  if (!Array.isArray(all)) return null;
  let m = LIB_ITEMS.get(all);
  if (!m) { m = new Map(); all.forEach(x => { if (x && x.key) m.set(x.key, x); }); LIB_ITEMS.set(all, m); }
  return m.get(k) || null;
}
/* WHAT A WAITING CARD SAYS UNDER ITS TAGS: sign in, the dots, or why it did not come and Try again. */
function libSay_(x) {
  if (typeof USER === 'undefined' || !USER || !USER.token) {
    return '<p class="sub lib-sign">Sign in to see this — your account is a few screens to the right.</p>';
  }
  /* A CARD NEWER THAN ITS WORDS (`lib_pending`, docs/library.md): the Ledger has not had them imported yet. */
  if (libIdsFor_(x).some(t => LIB.gone.has(t))) return '<p class="empty">' + (x && x.row && (x.row.pending === true || libTrue(x.row.lib_pending)) ? 'Coming soon.' : 'This one is not in the library yet.') + '</p>';
  if (LIB.failed) {
    return `<p class="empty">Couldn’t load this.<br><span class="faint">${esc(LIB.failed)}</span><br>
      <button type="button" class="text-action" data-do="lib-retry">Try again</button></p>`;
  }
  return loading_();
}
function libWaitHtml_(x) {
  const q = isQ_(x);
  return `<div class="${q ? 'qcard' : 'card fc'} lib-wait" data-lib="${esc((x && x.key) || '')}">
    ${q ? '' : `<div class="fc-head"><h3>${esc((x && x.name) || '')}</h3></div>`}
    ${tagRow_(x)}
    <div class="lib-say">${libSay_(x)}</div>
  </div>`;
}
/* THE PAGES ARE COUNTED AGAIN ONLY WHERE THEY ARE DRAWN AGAIN — counting them anywhere else would move every page under a column already drawn. */
function libPagesFresh_() {
  if (STUFF_PAGES && STUFF_PAGES.gen !== undefined && STUFF_PAGES.gen !== LIB.gen) STUFF_PAGES = { from: null, pages: [] };
}
/* WORDS AHEAD OF THE READER (447): fewer than LIB_AHEAD cards ahead whole or on their way asks the next LIB_AHEAD_BATCH
   in one call; on the question page, the first screenful once typing stops. */
function libAheadCards_(pages, from, n) {
  /* Counted by question: a waiting question's parts are a card each, but one card once its words land. */
  const out = [], seen = new Set();
  for (let i = Math.max(0, from); i < pages.length; i++) {
    const x = pages[i] && pages[i].x;
    if (!x || out.indexOf(x) !== -1) continue;
    let k = x;
    try { if (isQ_(x)) k = 'q:' + (qId_(x) || x.key); } catch (e) { k = x; }
    if (!seen.has(k) && seen.size >= n) break;
    seen.add(k);
    out.push(x);
  }
  return out;
}
const libOnWay_ = x => !libSlim_(x) || libIdsFor_(x).every(t => LIB.pending.has(t) || LIB.flying.has(t) || LIB.gone.has(t) || LIB.refused.has(t));
function libAheadAsk_(cards) {
  if (cards.slice(0, LIB_AHEAD).every(libOnWay_)) return;
  cards.forEach(x => { if (libSlim_(x)) libWant_(x); });
}
function libAhead_() {
  const F = FINDER;
  let pages, at;
  try { pages = stuffPages_(); at = (PAGE[F.id] || 0) - stuffFirstResult_(); } catch (e) { return; }
  if (!pages.length) return;
  if (at < 0) {
    /* ONE WAIT PER FINDER: the other finder filling must not cancel this one's first ask. */
    const T = LIB.ahead = (LIB.ahead && typeof LIB.ahead === 'object') ? LIB.ahead : {};
    clearTimeout(T[F.id]);
    const first = libAheadCards_(pages, 0, LIB_AHEAD);
    if (first.some(libSlim_)) {
      T[F.id] = setTimeout(() => inFinder_(F, () => { const p = stuffPages_(); if (p[0] && p[0].x === first[0]) libAheadAsk_(libAheadCards_(p, 0, LIB_AHEAD)); }), 700);
    }
    return;
  }
  libAheadAsk_(libAheadCards_(pages, at, LIB_AHEAD_BATCH));
  /* THE CARD IN FRONT WAS COUNTED BEFORE ITS WORDS CAME, and they are here: drawn again, a moment from now. */
  const pg = pages[at];
  if (pg && pg.slim && !libSlim_(pg.x)) setTimeout(() => libRepaintFinder_(F), 0);
}
/* THE FINDER DRAWN AGAIN WHERE IT STANDS, and onto the first page of the card that was waiting in front. */
function libRepaintFinder_(F) {
  if (!F || typeof AT === 'undefined') return;
  if (AT !== F.id || (typeof findKeep_ === 'function' && findKeep_(F.id))) { markStale_(F.id); return; }
  inFinder_(F, () => {
    const pg = stuffPages_()[(PAGE[F.id] || 0) - stuffFirstResult_()];
    const key = pg && pg.x ? pg.x.key : '', part = pg && !pg.slim ? (pg.part || null) : undefined;
    paintStuff(true);
    if (!key) return;
    /* THE SAME PAGE IN FRONT AFTER THE COUNT: its own part if it was whole, else the first page of the card that waited. */
    const pages = stuffPages_(), first = stuffFirstResult_();
    const now = pages[(PAGE[F.id] || 0) - first];
    const i = pages.findIndex(p => p && p.x && p.x.key === key && (part === undefined || (p.part || null) === part));
    if (i >= 0 && (!now || !now.x || now.x.key !== key || (now.part || null) !== (pages[i].part || null))) goPage(F.id, first + i, true);
  });
}
