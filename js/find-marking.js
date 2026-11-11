/* AN ANSWER CAME BACK (or did not): the card in front, if it was waiting, is drawn again; every other waiting card says
   where things stand without being rebuilt. */
function libLanded_() {
  try { insLanded_(); } catch (e) { oops_(e, 'find:libLanded_') }
  try {
    document.querySelectorAll('.lib-wait').forEach(el => {
      const x = libItemByKey_(el.getAttribute('data-lib') || '');
      const say = el.querySelector('.lib-say');
      if (say && x && libSlim_(x)) say.innerHTML = libSay_(x);
    });
  } catch (e) { /* a card redrawn mid-change keeps its old note */ }
  if (typeof AT === 'undefined') return;
  const F = finderOf_(AT);
  if (F) {
    /* AND THE CARDS AHEAD THAT ARE WHOLE NOW are counted again while they are off the glass, so none changes in front (447). */
    inFinder_(F, () => {
      const pages = stuffPages_(), at = (PAGE[F.id] || 0) - stuffFirstResult_();
      const end = Math.min(pages.length, Math.max(0, at) + LIB_AHEAD_BATCH * 3);
      for (let i = Math.max(0, at); i < end; i++) {
        const pg = pages[i];
        if (pg && pg.slim && !libSlim_(pg.x)) { libRepaintFinder_(F); break; }
      }
    });
    return;
  }
  /* SAVED, THE SPOTLIGHT, ANY COLUMN THAT DREW A WAITING CARD: drawn again where it stands once one of them is whole. */
  const host = $('s-' + AT);
  const ready = host && [].some.call(host.querySelectorAll('.lib-wait'), el => {
    const x = libItemByKey_(el.getAttribute('data-lib') || '');
    return x && !libSlim_(x);
  });
  if (ready) { try { repaint(true); } catch (e) { oops_(e, 'find:libLanded_') } }
}
on('lib-retry', el => {
  libRetry_();
  const card = el && el.closest ? el.closest('.lib-wait') : null;
  const x = card ? libItemByKey_(card.getAttribute('data-lib') || '') : null;
  if (x) libWant_(x);
});

/* ---------- THE WHOLE QUESTION, NOT A PEEK § */
/* ---------- SOMEWHERE TO WRITE THE ANSWER § */
/* ---------- WHOSE ANSWER IT IS, AND IT IS WHOEVER IS SIGNED IN § */
function whoIs_() {
  try {
    if (typeof USER !== 'undefined' && USER && (USER.personId || USER.name)) {
      return 'u:' + (USER.personId || USER.name);
    }
  } catch (e) { /* no one readable is signed in: the answer is the device's */ }
  return '';
}

const ansKey_ = x => 'ans:' + (whoIs_() ? whoIs_() + ':' : '') + ((x && (x.key || x.name)) || '?');

function ansRead_(k) {
  /* THE VISIT'S COPY OF A WRITE THE STORE REFUSED (`keepHeld_`, data.js), never the older stored one or the empty box a browser keeping nothing answers with: § */
  const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
  if (held !== undefined) return held || '';
  try {
    const v = localStorage.getItem(k);
    if (v !== null) return v;
    /* ---------- AN ANSWER TYPED BEFORE ANYBODY SIGNED IN, FOUND AND MOVED § */
    const bare = k.replace(/^ans:u:[^:]*:/, 'ans:');
    if (bare === k) return '';
    /* THE SIGNED-OUT ONE AS ITS WRITER'S OWN READER READS IT (`ansValue_`), the visit's copy of a write
       the store refused first — `padAdopt_`'s reason below (317, "Six edges"). */
    const was = typeof ansValue_ === 'function' ? ansValue_(bare) : localStorage.getItem(bare);
    if (was === null) return '';
    /* NOT INTO SOMEBODY ELSE'S BOX: § */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return '';
    if (typeof ansStore_ === 'function') ansStore_(k, was); else localStorage.setItem(k, was);
    /* AND THE SIGNED-OUT COPY GOES THROUGH THE WRITER — the stored one, the visit's held one (or the page
       going would write it back, `keepRetry_`) and its mark (`ansGoneMark_`), all at once. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else localStorage.removeItem(bare);
    return was;
  } catch (e) { return ''; }
}

/* ---------- A DONE QUESTION'S NAME, AS A PARENT READS IT § */
function doneTier_(it) {
  if (!isQ_(it)) return '';
  const t = String(it.tier || '').trim();
  if (/^(foundation|higher)$/i.test(t)) return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  const said = [t, it.bandValue, it.level, it.row && it.row.level].map(x => String(x || '').toLowerCase().replace(/[^a-z]/g, ''));
  if (said.indexOf('alevel') !== -1) return 'A-level';
  if (said.indexOf('as') !== -1 || said.indexOf('aslevel') !== -1) return 'AS';
  return '';
}
function doneLabel_(k, index) {
  try {
    const slot = /#[^#]*$/.test(k), base = slot ? k.replace(/#[^#]*$/, '') : k;
    const it = doneItem_(base, index);
    if (!it) return '';
    const subj = String(it.subject || '');
    let sub = String(it.sub || '').split(' · ').filter(x => !/^\d+ min$/.test(x.trim())).join(' · ');
    const tier = doneTier_(it);
    if (sub && tier && sub.toLowerCase().indexOf(tier.toLowerCase()) === -1) sub += ' (' + tier + ')';
    return [subj && sub.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', sub, it.name,
            slot ? 'Worksheet' : ''].filter(Boolean).join(' · ');
  } catch (e) { return ''; }
}

/* ---------- THE QUESTION ITSELF, AS A PARENT WILL READ IT § */
const DONE_WORDS_STEM = 500, DONE_WORDS_ASK = 600;
const DONE_FRAC_SPAN = /<span class="frac"><span class="frac-n">((?:(?!<\/?span\b)[\s\S])*)<\/span>(?:<span class="frac-s">[^<]*<\/span>)?<span class="frac-d">((?:(?!<\/?span\b)[\s\S])*)<\/span><\/span>/g;
const DONE_FRAC_SUP = /<sup>((?:(?!<\/?sup\b)[\s\S])*)<\/sup>\s*(?:&frasl;|&#8260;|\u2044)\s*<sub>((?:(?!<\/?sub\b)[\s\S])*)<\/sub>/g;
/* A HALF THAT ALREADY WEARS ITS OWN BRACKETS keeps them and gains no second pair: `5/((x − 9))` was the
   library's `<sub>(x &minus; 9)</sub>` bracketed again. */
const doneHalf_ = h => {
  const bare = String(h).replace(/<[^>]*>/g, '').trim();
  if (/^\(/.test(bare) && /\)$/.test(bare)) {
    let depth = 0, whole = true;
    for (let i = 0; i < bare.length; i++) {
      if (bare[i] === '(') depth++;
      else if (bare[i] === ')') { depth--; if (depth === 0 && i < bare.length - 1) { whole = false; break; } }
    }
    if (whole) return h;
  }
  return /\S\s+\S|[+\-\u2212]|&minus;/.test(bare) ? '(' + h + ')' : h;
};
/* SUPERSCRIPT AND SUBSCRIPT DIGITS, for an index or a subscript that is only digits: `x₁`, `⁴√`. */
const DONE_SUP_DIG = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079', DONE_SUB_DIG = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
const doneDigits_ = (t, map) => t.replace(/\d/g, d => map[+d]);
const doneFrac_ = (m, n, d) => doneHalf_(n) + '/' + doneHalf_(d);
function doneWordsPlain_(html) {
  const s = String(html || '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(DONE_FRAC_SPAN, doneFrac_)
    .replace(DONE_FRAC_SUP, doneFrac_)
    .replace(/<sup>2<\/sup>/g, '\u00b2').replace(/<sup>3<\/sup>/g, '\u00b3')
    .replace(DONE_FRAC_SUP, doneFrac_)
    /* AN ORDINAL IS NOT A POWER — "the 3rd term", not "the 3^rd term" — and a root's index sits on the root, ⁴√, not ^4√. § */
    .replace(/<sup>\s*(st|nd|rd|th)\s*<\/sup>/gi, '$1')
    .replace(/<sup>\s*(\d+)\s*<\/sup>(?=\s*\u221a|\s*&radic;)/g, (m, d) => doneDigits_(d, DONE_SUP_DIG))
    .replace(/<sub>\s*(\d+)\s*<\/sub>/g, (m, d) => doneDigits_(d, DONE_SUB_DIG))
    .replace(/<sub>((?:(?!<\/?sub\b)[\s\S])*)<\/sub>/g, (m, e) => '_' + doneHalf_(e))
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*)<\/sup>/g, (m, e) => '^' + doneHalf_(e))
    .replace(/&frasl;|&#8260;|\u2044/g, '/')
    /* A TABLE KEEPS ITS CELLS APART, ` | ` between them and a row a line, because two spaces did not
       survive the collapse below and "0 < t ≤ 10 20" is a class and its frequency run together. */
    .replace(/<\/t[dh]>\s*(?=<t[dh]\b)/gi, ' | ')
    .replace(/<(br|\/p|\/li|\/div|\/tr|\/h\d|\/table)\b[^>]*>/gi, '\n');
  let t = '';
  try { t = new DOMParser().parseFromString(s, 'text/html').body.textContent || ''; }
  catch (e) { t = s.replace(/<[^>]*>/g, ' '); }
  return t.split('\n').map(l => l.replace(/[ \t\u00a0]+/g, ' ').trim()).filter(Boolean).join('\n');
}
/* THE CARD FOR AN ANSWER KEY. § */
function doneItem_(k, index) {
  if (index) return index.get(k) || null;
  return stuffItemsAll_().find(y => ansKey_(y) === k) || null;
}
function doneWords_(k, index) {
  try {
    if (/#[^#]*$/.test(k)) return '';
    const it = doneItem_(k, index);
    if (!isQ_(it)) return '';
    const own = st => st && st.q !== undefined && st.q !== null && st.q !== '';
    const stems = (it.stems || []).filter(own);
    const cap = (t, n) => (t.length > n ? t.slice(0, n - 1).trim() + '…' : t);
    const stem = cap(stems.map(st => doneWordsPlain_(st.html)).filter(Boolean).join('\n'), DONE_WORDS_STEM);
    let ask = cap([it.lead, it.html].map(doneWordsPlain_).filter(Boolean).join('\n'), DONE_WORDS_ASK);
    /* THE SITE'S OWN TEST FOR A PICTURE (`questionHasFig_`, `stemHasFig_`), never the `figure` cell: § */
    const pic = questionHasFig_(it) || stems.some(stemHasFig_);
    if (pic) ask += (ask ? ' ' : '') + '(picture on the site)';
    return stem ? stem + '\n---\n' + ask : ask;
  } catch (e) { return ''; }
}

/* ---------- MARKING IT § */
function markNorm_(s) {
  return String(s == null ? '' : s)
    /* ONLY A REAL TAG IS A TAG. § */
    .replace(/<\/?[a-z][a-z0-9]*(?=[\s\/>])[^>]*>/gi, ' ')
    /* AND THE ENTITIES A CELL IS WRITTEN IN ARE THE CHARACTERS A CHILD TYPES. § */
    .replace(/&pound;/g, '£').replace(/&euro;/g, '€').replace(/&minus;/g, '−')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    /* WHAT A PASTE OR A PHONE'S SMART PUNCTUATION ADDS (508): invisible characters go, curly quotes are straight, full-width digits are digits. */
    .replace(/[\u200b-\u200d\u2060\ufeff\u00ad]/g, '')
    .replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\uff10-\uff19]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xff10 + 48))
    .toLowerCase()
    /* A LINE BREAK OR A SEMICOLON BETWEEN VALUES IS THE LIST'S COMMA (R2): 3⏎4 and 3; 4 are "3, 4". */
    .replace(/\s*[\r\n;]+\s*/g, ', ').replace(/^[,\s]+|[,\s]+$/g, '')
    .replace(/[−–—]/g, '-')          /* minus, en dash, em dash */
    /* A DECIMAL WITH NO LEADING 0 IS THE SAME NUMBER: the keypad has a '.' key, so .5 is 0.5 (R2). */
    .replace(/(^|[^\d.)a-z])\.(?=\d)/g, '$10.')
    /* ONE SPELLING PER UNIT (R2): MARK_SYNONYMS below; superscript powers are ^2 ^3, as the keypad writes them. */
    .replace(/(\d)\s*(degrees?|deg|per\s?cent|percent)(?![a-z])/g, (m, d, u) => d + MARK_SYNONYMS[u.replace(/\s/g, '')])
    .replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/[£$€]/g, '')
    /* A THOUSANDS SEPARATOR IS A COMMA, A SPACE, OR A THIN SPACE, and which one you get depends on who printed the paper. § */
    .replace(/(\d)[,\u2009\u00a0 ](?=\d\d\d\b)/g, '$1')
    /* A FRACTION HAS FOUR SPELLINGS AND A CHILD TYPES ONE OF THEM. § */
    .replace(/[\u2044\u2215]/g, '/')
    .replace(/[\u00bc\u00bd\u00be\u2150-\u215e]/g, c => ' ' + {
      '\u00bc': '1/4', '\u00bd': '1/2', '\u00be': '3/4', '\u2150': '1/7', '\u2151': '1/9',
      '\u2152': '1/10', '\u2153': '1/3', '\u2154': '2/3', '\u2155': '1/5', '\u2156': '2/5',
      '\u2157': '3/5', '\u2158': '4/5', '\u2159': '1/6', '\u215a': '5/6', '\u215b': '1/8',
      '\u215c': '3/8', '\u215d': '5/8', '\u215e': '7/8' }[c] + ' ')
    .replace(/\s*\/\s*/g, '/')
    /* ---------- WHAT THE MATHS KEYPAD WRITES, WHICH IS A BRACKET ROUND EVERY SLOT § */
    .replace(/sqrt\s*/g, '√').replace(/(^|[^a-z])root\s*(?=[\d(])/g, '$1√')
    .replace(/(^|[^a-z])pi(?![a-z])/g, '$1π')
    .replace(/(\d)\s+(?=[√π])/g, '$1')
    .replace(/([√^])\((-?[a-z0-9.π]+)\)/g, '$1$2')
    .replace(/\((-?√?[a-z0-9.π]+(?:\^-?[a-z0-9.π]+)?)\)(?=\/)/g, '$1')
    .replace(/([\/^√])\((-?√?[a-z0-9.π]+)\)/g, '$1$2')
    /* AND THE SPACES ROUND A COLON, FOR THE SAME REASON ONE LINE UP. § */
    .replace(/\s*:\s*/g, ':')
    /* ---------- AND ROUND AN OPERATOR, WHICH IS THE COLON RULE FOR A THIRD CLASS OF CHARACTER § */
    .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=')
    .replace(/\*/g, '×').replace(/([\d²³¹⁰⁴-⁹])\s*x\s*(?=\d)/g, '$1×')
    .replace(/\s*([-+×÷=<>!])\s*/g, '$1')
    .replace(/\band\b|&/g, ',')
    .replace(/[.\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* The words a unit is spelt in, each to the one symbol markNorm_ keeps. */
const MARK_SYNONYMS = { degree: '°', degrees: '°', deg: '°', percent: '%' };
/* A LIST IS A SET. "1, 2, 5, 10" and "10, 5, 2, 1" are the same answer to "list the factors", and a child who works outwards from the middle writes the second. § */
function markParts_(s) {
  return markNorm_(s).split(/\s*,\s*/).map(p => markNum_(p.trim())).filter(Boolean).sort();
}

/* A NUMBER IS COMPARED AS A NUMBER, so 8.50 is 8.5 and 07 is 7. Anything that is not a bare
   number is left as text -- "banana" has no numeric value and must not become NaN. */
function markNum_(p) {
  const m = /^-?\d+(\.\d+)?$/.exec(p);
  if (!m) return p;
  const n = Number(p);
  return isFinite(n) ? String(n) : p;
}

/* THE UNIT IS PART OF THE ANSWER'S SENTENCE AND NOT PART OF THE ANSWER. § */
/* The solidus is in the leading class because a fraction is a number too: `1/2 km` is a value
   and a unit exactly as `70.5 kg` is, and without it the km stayed attached and a student
   typing `6/12` against it was marked wrong. */
/* ---------- A UNIT, AND NOT EVERYTHING AFTER THE FIRST NUMBER § */
const MARK_NUM = '(?:√[\\d.]*\\d|π|\\d)';
const MARK_SYM = '(?:[a-z][a-z][a-z]+|[cmkd]m|kg|mg|ml|cl|hr|am|pm|pc|ly|kj|°[cf]?|%)';
const MARK_POW = '(?:\\^-?\\d+|[²³]|[23](?!\\d))';
const MARK_BARE = new RegExp('^(-?[\\d.,\\/\\s]*' + MARK_NUM + ')(?:' + MARK_SYM + MARK_POW + '?'
  + '|\\s+(?:[gmlpshkjvnw]|' + MARK_SYM + ')' + MARK_POW + '?|\\s+[a-z]+(?=\\/))'
  + '(?:\\/(?:[gmlpshkjvnw]|' + MARK_SYM + ')' + MARK_POW + '?)*'
  + '(?:\\s+per\\s+(?:[gmlpshkjvnw]|' + MARK_SYM + '))?(?:\\s+\\(.*\\))?$');
const markBare_ = s => markNorm_(s).replace(MARK_BARE, '$1').trim();

/* A FRACTION IS A NUMBER, AND "OR EQUIVALENT" IS WHAT THE MARK SCHEME ACTUALLY SAYS. § */
function markFrac_(s) {
  const t = markNorm_(s).replace(/^\(|\)$/g, '').trim();
  let m = /^(-?)(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[4]);
    if (!d) return null;
    const n = Number(m[2] || 0) * d + Number(m[3]);
    return { n: m[1] ? -n : n, d: d };
  }
  m = /^(-?\d+)(?:\.(\d+))?$/.exec(t);
  if (m) {
    const dec = m[2] || '';
    const d = Math.pow(10, dec.length);
    return { n: Number(m[1]) * d + (m[1][0] === '-' ? -1 : 1) * Number(dec || 0), d: d };
  }
  return null;
}

/* A MARK SCHEME THAT TAKES A BAND TAKES EVERY NUMBER IN IT, AND THIS ONE WAS TAKING TWO OF THEM. § */
function markRange_(w) {
  /* ---------- THE SEPARATOR IS READ BEFORE `markNorm_` FLATTENS IT § */
  const m = /^(-?\d+(?:\.\d+)?)\s*(?:to)\s*(-?\d+(?:\.\d+)?)(?:\s*([a-z\u00b0%].*))?$/
    .exec(markNorm_(String(w == null ? '' : w).replace(/[\u2013\u2014]/g, ' to ')));
  if (!m) return null;
  const lo = markFrac_(m[1]), hi = markFrac_(m[2]);
  if (!lo || !hi) return null;
  if (lo.n * hi.d > hi.n * lo.d) return null;   /* backwards is not a band */
  return { lo: lo, hi: hi, unit: (m[3] || '').trim() };
}

/* ---------- A UNIT THE CHILD TYPED, AND THE BRACKETS ROUND A COORDINATE § */
const MARK_WORD = '(?:(?:[mcdk]?m|units?)(?:\\^[23]|[23\u00b2\u00b3])|[a-z\u00b0%][a-z\u00b0%]*)';
const MARK_UNIT = new RegExp('^(-?[\\d.\\/]*' + MARK_NUM + ')\\s*(?:' + MARK_WORD + '(?:\\/' + MARK_WORD
  + ')*(?![a-z0-9\u00b0%\u00b2\u00b3^])\\.?\\s*)+$');
/* The unit a way carries, for `unitOf` in `markAnswer_` — built once, not once a way. § */
const MARK_UNIT_OF = new RegExp('^\\(?-?[\\d.,\\/\\s]*' + MARK_NUM + '\\s*(' + MARK_WORD + '(?:\\/' + MARK_WORD
  + ')*(?:\\s+' + MARK_WORD + '(?:\\/' + MARK_WORD + ')*)*)(?![a-z0-9\u00b0%\u00b2\u00b3^])');
function markUnitOff_(t) {
  let s = t.replace(/^\((.*)\)$/, '$1').trim();
  const parts = s.split(/\s*,\s*/);
  if (parts.length > 1 && parts.every(p => MARK_UNIT.test(p) || /^-?[\d.\/]+$/.test(p)))
    s = parts.map(p => p.replace(MARK_UNIT, '$1')).join(', ');
  else s = s.replace(MARK_UNIT, '$1');
  return s;
}

/* ---------- AN ANSWER WITH MANY RIGHT FORMS, MARKED BY WHAT MAKES IT RIGHT (360) */
/* `rule: count 3, distinct, each factor 36, sum 31..34` in `accept`: the typed numbers are tested, not matched. */
/* Clauses: count, distinct, mixed, decimal, each <tests>, at N <tests>, hcf N, sum, diff, from a/b/…, rounddiff R V, digits ##4###, once D, lowest, set a+b/c+d (word groups). */
function markRuleNums_(typed) {
  const t = markNorm_(typed).replace(/[,;=+×]/g, ' , ').replace(/(\d)-(?=\d)/g, '$1 , ');
  const out = [];
  const re = /(?:^|[^\d.\/a-z^])(-?)(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?(p?)(?![\d.\/a-z^\u00b2\u00b3])/g;
  let m;
  while ((m = re.exec(t))) {
    let v = m[3] ? Number(m[2]) + Number(m[3]) / Number(m[4]) : m[5] ? Number(m[2]) / Number(m[5]) : Number(m[2]);
    if (m[6]) v /= 100;
    out.push({ v: m[1] ? -v : v, s: m[0].replace(/^[^\d-]/, '').trim() });
  }
  return out;
}
function markRuleVal_(s) {
  const n = markRuleNums_(s);
  return n.length ? n[0].v : NaN;
}
/* A MARK RULE'S TESTS by name, each given the value, the rule's number and whether the value is whole. */
const markNear_ = (a, b) => Math.abs(a - b) < 1e-9;
const markPrime_ = (n, whole) => n > 1 && whole && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every(k => n % k);
const MARK_RULE_TESTS = {
  mult: (v, a, w) => w && markNear_(v % a, 0),
  notmult: (v, a, w) => w && !markNear_(v % a, 0),
  factor: (v, a, w) => w && v > 0 && markNear_(a % v, 0),
  notfactor: (v, a, w) => w && v > 0 && !markNear_(a % v, 0),
  prime: (v, a, w) => markPrime_(v, w),
  notprime: (v, a, w) => w && v >= 0 && !markPrime_(v, w),
  square: (v, a, w) => w && v >= 0 && markNear_(Math.round(Math.sqrt(v)) ** 2, v),
  cube: (v, a, w) => w && markNear_(Math.round(Math.cbrt(v)) ** 3, v),
  odd: (v, a, w) => w && Math.abs(v % 2) === 1,
  even: (v, a, w) => w && v % 2 === 0,
  over: (v, a) => v > a,
  under: (v, a) => v < a,
  eq: (v, a) => markNear_(v, a),
  ne: (v, a) => !markNear_(v, a),
};
function markRuleIs_(v, test, arg) {
  const t = Object.prototype.hasOwnProperty.call(MARK_RULE_TESTS, test) ? MARK_RULE_TESTS[test] : null;
  return t ? !!t(v, markRuleVal_(arg), markNear_(v, Math.round(v))) : false;
}
function markRuleSet_(typed, spec, spell) {
  const words = s => String(s).toLowerCase().match(/[a-z]+|\d+/g) || [];
  const fill = /^(and|with|then|a|an|the|on|of)$/;
  if (spell) return markRuleSeq_(typed, spec, spell, words, fill);
  const syn = {};
  const want = spec.split('/').map(item => item.split('+').map(w => {
    const ways = w.trim().toLowerCase().split('~');
    ways.forEach(x => (syn[x] = ways[0]));
    return ways[0];
  }).join('+').split('+').sort().join(' ')).sort();
  const got = String(typed).split(/[,;\n]+/).map(item => words(item).filter(w => !fill.test(w)).map(w => syn[w] || w).sort().join(' '))
    .filter(Boolean).sort();
  return got.length === want.length && got.every((g, i) => g === want[i]);
}
/* `spell h~heads t~tails`: each item is an ORDERED run of letters (HHT is not THH); typed as HHT, H H T, H,H,T or heads heads tails (454) */
function markRuleSeq_(typed, spec, spell, words, fill) {
  const map = {};
  spell.trim().toLowerCase().split(/\s+/).forEach(g => { const w = g.split('~'); w.forEach(x => (map[x] = w[0])); });
  const want = spec.split('/').map(x => x.trim().toLowerCase()).sort();
  const len = want[0] ? want[0].length : 0;
  if (!len || want.some(w => w.length !== len)) return false;
  let run = '';
  for (const w of words(typed)) {
    if (fill.test(w)) continue;
    if (map[w]) { run += map[w]; continue; }
    if (![...w].every(c => map[c] === c)) return false;
    run += w;
  }
  if (!run.length || run.length % len) return false;
  const got = (run.match(new RegExp('.{' + len + '}', 'g')) || []).sort();
  return got.length === want.length && got.every((g, i) => g === want[i]);
}
/* ---------- AN ALGEBRAIC ANSWER, MARKED BY ITS VALUE (365) */
/* `rule: expr R`: any expression equal to R at sample values; `v = R` wants v as the subject; `eqn A = B`: any equation a multiple of it. */
/* `fn g` makes g( a function call, not g times a bracket, so y = g(-x) is not y = -g(x) (376) */
function markExprParse_(t, fns) {
  let i = 0;
  const peek = () => t[i];
  const starts = c => !!c && /[a-z0-9.(√∛π]/.test(c);
  const atom = () => {
    const c = peek();
    if (c === '(') { i++; const n = sum(); if (!n || peek() !== ')') return null; i++; return n; }
    if (c === '√' || c === '∛') { i++; const n = power(); return n && [c, n]; }
    if (c === 'π') { i++; return ['n', Math.PI]; }
    if (fns && fns.indexOf(c) >= 0 && t[i + 1] === '(') { i++; const n = atom(); return n && ['f', c, n]; }
    if (/^[a-z]$/.test(c || '')) { i++; return ['v', c]; }
    const m = /^\d*\.?\d+/.exec(t.slice(i));
    if (!m) return null;
    i += m[0].length;
    return ['n', Number(m[0])];
  };
  const power = () => {
    const b = atom();
    if (b && peek() === '^') { i++; const e = unary(); return e && ['^', b, e]; }
    return b;
  };
  const unary = () => {
    if (peek() === '-') { i++; const n = unary(); return n && ['neg', n]; }
    if (peek() === '+') { i++; return unary(); }
    return power();
  };
  const product = () => {
    let n = unary();
    while (n) {
      if (peek() === '*' || peek() === '/') { const op = t[i++], r = unary(); n = r && [op, n, r]; }
      else if (starts(peek())) { const r = power(); n = r && ['*', n, r]; }
      else break;
    }
    return n;
  };
  const sum = () => {
    let n = product();
    while (n && (peek() === '+' || peek() === '-')) { const op = t[i++], r = product(); n = r && [op, n, r]; }
    return n;
  };
  const n = sum();
  return n && i === t.length ? n : null;
}
/* AN EXPRESSION TREE'S OPERATORS; anything else is a power. */
const MARK_EXPR_OPS = { neg: x => -x, '√': Math.sqrt, '∛': Math.cbrt, '+': (x, y) => x + y, '-': (x, y) => x - y, '*': (x, y) => x * y, '/': (x, y) => x / y };
function markExprVal_(n, at) {
  const [k, a, b] = n;
  if (k === 'n') return a;
  if (k === 'v') return at[a];
  /* a named function: one fixed curve per letter, neither odd nor even, so g(-x), -g(x) and g(x) all differ */
  if (k === 'f') { const v = markExprVal_(b, at), s = a.charCodeAt(0) % 7 + 1; return Math.exp(0.3 * v) * s + v * v * v / s + s; }
  const x = markExprVal_(a, at), y = b && markExprVal_(b, at);
  const op = Object.prototype.hasOwnProperty.call(MARK_EXPR_OPS, k) ? MARK_EXPR_OPS[k] : Math.pow;
  return op(x, y);
}
/* `{ sides: [tree, tree?], vars }`, or null for anything that is not an expression. */
function markExprRead_(s, fns) {
  const t = String(s == null ? '' : s).toLowerCase().replace(/<[^>]*>/g, '').replace(/&minus;/g, '-')
    .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[⁄∕]/g, '/')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/sqrt|root/g, '√').replace(/cbrt/g, '∛')
    .replace(/pi/g, 'π').replace(/\s+/g, '');
  if (!t || /[^a-z0-9.+\-*\/^()√∛π=]/.test(t)) return null;
  const sides = t.split('=').map(x => markExprParse_(x, fns));
  if (sides.length > 2 || sides.some(x => !x)) return null;
  return { sides: sides, vars: (t.match(/[a-z]/g) || []).filter((v, i, a) => a.indexOf(v) === i && !(fns && fns.indexOf(v) >= 0)) };
}
/* `parallel`: the gradient of a straight line in x and y, or null when it is not one (a line parallel to M, 376) */
function markExprGrad_(R) {
  if (!R || R.sides.length !== 2 || R.vars.some(v => v !== 'x' && v !== 'y')) return null;
  const F = (x, y) => markExprVal_(R.sides[0], { x: x, y: y }) - markExprVal_(R.sides[1], { x: x, y: y });
  const c = F(0, 0), a = F(1, 0) - c, b = F(0, 1) - c, size = 1 + Math.abs(a) + Math.abs(b) + Math.abs(c);
  const flat = [[1.37, 2.71], [0.53, -3.19], [-1.83, 4.07]].every(p => Math.abs(F(p[0], p[1]) - (a * p[0] + b * p[1] + c)) < 1e-7 * size);
  return flat && Math.abs(b) > 1e-12 ? -a / b : null;
}
function markExpr_(typed, want, eqn, fns) {
  const T = markExprRead_(typed, fns), W = markExprRead_(want, fns);
  if (!T || !W) return false;
  let f, g;
  if (eqn) {
    if (T.sides.length !== 2 || W.sides.length !== 2) return false;
    f = at => markExprVal_(T.sides[0], at) - markExprVal_(T.sides[1], at);
    g = at => markExprVal_(W.sides[0], at) - markExprVal_(W.sides[1], at);
  } else {
    /* a subject wants that letter alone on the left, or nothing on the left, and nowhere on the right */
    const subj = W.sides.length === 2 && W.sides[0][0] === 'v' ? W.sides[0][1] : null;
    if (W.sides.length === 2 && !subj) return false;
    let tr = T.sides;
    if (tr.length === 2) { if (!subj || tr[0][0] !== 'v' || tr[0][1] !== subj) return false; tr = [tr[1]]; }
    if (subj && T.vars.indexOf(subj) >= 0 && T.sides.length === 1) return false;
    if (subj && JSON.stringify(tr[0]).indexOf('["v","' + subj + '"]') >= 0) return false;
    const w = W.sides[W.sides.length - 1];
    f = at => markExprVal_(tr[0], at);
    g = at => markExprVal_(w, at);
  }
  const vars = T.vars.concat(W.vars).filter((v, i, a) => a.indexOf(v) === i);
  const SEEDS = [1.37, 2.71, 0.53, 3.19, 1.83, 4.07, 0.29, 2.23];
  let ratio = null, used = 0;
  for (let s = 0; s < 6; s++) {
    const at = {};
    vars.forEach((v, j) => { at[v] = SEEDS[(s + 3 * j) % SEEDS.length] + 0.11 * j; });
    const a = f(at), b = g(at);
    if (!isFinite(b) || Math.abs(b) < 1e-12) continue;
    if (!isFinite(a)) return false;
    const r = a / b;
    if (!eqn && Math.abs(r - 1) > 1e-7) return false;
    if (eqn && (Math.abs(r) < 1e-9 || (ratio !== null && Math.abs(r - ratio) > 1e-7 * Math.max(1, Math.abs(ratio))))) return false;
    ratio = r;
    used++;
  }
  return used >= 3;
}
function markRule_(typed, rule) {
  const body = String(rule || '').replace(/^\s*rule:\s*/i, '');
  /* `expr`/`eqn` is the whole rule but for `nobracket` (multiplied out), `fn g`, `parallel` and `not E` (any but that one) */
  const ex = /(?:^|,)\s*(expr|eqn)\s+([^,]+)/.exec(body);
  if (ex) {
    const eqn = ex[1] === 'eqn', fns = (/(?:^|,)\s*fn\s+([a-z]+)/.exec(body) || [])[1] || '';
    const not = /(?:^|,)\s*not\s+([^,]+)/.exec(body);
    if (not && markExpr_(typed, not[1], eqn, fns)) return false;
    if (/(?:^|,)\s*parallel\s*(?:,|$)/.test(body)) {
      const g = markExprGrad_(markExprRead_(typed)), h = markExprGrad_(markExprRead_(ex[2]));
      return g !== null && h !== null && Math.abs(g - h) < 1e-9;
    }
    return markExpr_(typed, ex[2], eqn, fns) && !(/(?:^|,)\s*nobracket\b/.test(body) && /\(/.test(String(typed)));
  }
  const set = /(?:^|,)\s*set\s+([^,]+)/.exec(body);
  if (set) return markRuleSet_(typed, set[1], (/(?:^|,)\s*spell\s+([^,]+)/.exec(body) || [])[1]);
  const nums = markRuleNums_(typed), vs = nums.map(n => n.v);
  if (!nums.length) return false;
  const sum = vs.reduce((s, v) => s + v, 0);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  return body.split(',').map(c => c.trim()).filter(Boolean).every(c => {
    const w = c.split(/\s+/), k = w[0];
    if (k === 'count') return vs.length === Number(w[1]);
    /* `decimal`: written as a decimal, where the question asks for one (0.25, not 1/4) */
    if (k === 'decimal') return nums.every(n => /^-?\d*\.\d+$/.test(n.s));
    if (k === 'mixed') return nums.every(n => {
      const q = /^\d+ (\d+)\/(\d+)$/.exec(n.s);
      return !!q && Number(q[1]) < Number(q[2]);
    });
    /* `lowest`: each written as a fraction in its lowest terms, where the question asks for the simplest form (439) */
    if (k === 'lowest') return nums.every(n => {
      const q = /(\d+)\/(\d+)$/.exec(n.s), g = (a, b) => (b ? g(b, a % b) : a);
      return !!q && g(Number(q[1]), Number(q[2])) === 1;
    });
    if (k === 'distinct') return new Set(nums.map(n => n.s)).size === nums.length;
    if (k === 'each') {
      const tests = [];
      for (let i = 1; i < w.length; i++) tests.push(/^(mult|notmult|factor|notfactor|over|under|eq|ne)$/.test(w[i]) ? [w[i], w[++i]] : [w[i]]);
      return vs.every(v => tests.every(x => markRuleIs_(v, x[0], x[1])));
    }
    /* `at 2 even`: the tests for one value by its place, where each value has its own condition (m a multiple of 5, n even) */
    if (k === 'at') {
      const v = vs[Number(w[1]) - 1];
      if (v === undefined) return false;
      for (let i = 2; i < w.length; i++) {
        const t = w[i], arg = /^(mult|notmult|factor|notfactor|over|under|eq|ne)$/.test(t) ? w[++i] : undefined;
        if (!markRuleIs_(v, t, arg)) return false;
      }
      return true;
    }
    if (k === 'hcf') {
      const g = (a, b) => (b ? g(b, a % b) : a);
      return vs.every(v => near(v, Math.round(v)) && v > 0) && near(vs.map(Math.round).reduce(g), markRuleVal_(w[1]));
    }
    if (k === 'sum') {
      const r = w[1].split('..');
      return r.length === 2 ? sum >= markRuleVal_(r[0]) - 1e-9 && sum <= markRuleVal_(r[1]) + 1e-9 : near(sum, markRuleVal_(r[0]));
    }
    /* `pairs prod 100`: the values taken two at a time, in order, each pair making it -- opposite faces of a net (366) */
    if (k === 'pairs') {
      if (vs.length % 2) return false;
      for (let i = 0; i < vs.length; i += 2) if (!near(w[1] === 'sum' ? vs[i] + vs[i + 1] : vs[i] * vs[i + 1], markRuleVal_(w[2]))) return false;
      return true;
    }
    /* `digits ##4###`: each a whole number whose digits fit, # any digit, no leading 0; `once 4`: that digit appears exactly once (439) */
    if (k === 'digits') return nums.every(n => /^\d+$/.test(n.s) && !/^0\d/.test(n.s) && n.s.length === w[1].length
      && [...w[1]].every((d, i) => d === '#' || d === n.s[i]));
    if (k === 'once') return nums.every(n => n.s.split(w[1]).length === 2);
    if (k === 'diff') return vs.length === 2 && near(Math.abs(vs[0] - vs[1]), markRuleVal_(w[1]));
    if (k === 'rounddiff') {
      const r = Number(w[1]), rd = v => Math.round(v / r) * r;
      return vs.length === 2 && near(Math.abs(rd(vs[0]) - rd(vs[1])), markRuleVal_(w[2]));
    }
    if (k === 'from') {
      const pool = w.slice(1).join(' ').split('/').map(markRuleVal_);
      return vs.every(v => {
        const i = pool.findIndex(p => near(p, v));
        return i >= 0 && pool.splice(i, 1);
      });
    }
    return false;
  });
}

/* ALGEBRA IN ANY ORDER (R3, O4): the sides' terms as a sorted list, so 4x^2-7x+x^3 is x^3+4x^2-7x; x+x is not 2x, which keeps "simplify". */
function markTerms_(s) {
  const t = markNorm_(s).replace(/×/g, '*').replace(/\s+/g, '');
  if (!/[a-z]/.test(t) || /[^a-z0-9.+\-*\/^()=√π]/.test(t) || !markExprRead_(t)) return null;
  return t.split('=').map(side => {
    const out = [];
    let depth = 0, cur = '';
    for (let i = 0; i < side.length; i++) {
      const c = side[i];
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (!depth && (c === '+' || c === '-') && cur && !/[\^*\/]$/.test(cur)) { out.push(cur); cur = ''; }
      cur += c;
    }
    out.push(cur);
    /* a monomial's letters in either order: 2yx is 2xy */
    return out.map(x => {
      const m = /^([+-]?)(\d*(?:\.\d+)?)((?:[a-z](?:\^\d+)?)+)$/.exec(x);
      const sign = x[0] === '-' ? '-' : '+';
      if (!m) return sign + x.replace(/^[+-]/, '');
      return sign + m[2] + m[3].match(/[a-z](?:\^\d+)?/g).sort().join('');
    }).sort().join('');
  }).join('=');
}

function markAnswer_(typed, accept, again) {
  /* ONE BOX PER VALUE hands the values as a list (362): read as the comma list the scheme writes. */
  if (Array.isArray(typed)) typed = typed.map(v => String(v == null ? '' : v).trim()).filter(Boolean).join(', ');
  const t = markNorm_(typed);
  if (!t) return null;                              /* nothing typed is not a wrong answer */
  /* A `rule:` WAY IS TESTED, NOT MATCHED (markRule_); the other ways are matched as before. */
  const rules = String(accept || '').split('|').filter(w => /^\s*rule:/i.test(w));
  if (rules.length) {
    if (rules.some(w => markRule_(typed, w))) return true;
    accept = String(accept).split('|').filter(w => !/^\s*rule:/i.test(w)).join('|');
    /* a form asked for (`mixed`, `decimal`) is not given by the value: beside it a written way counts only as written, so 28/5 is not 5 3/5 (376) */
    if (rules.some(w => /(?:^|[:,])\s*(mixed|decimal|lowest)\s*(?:,|$)/i.test(w))) {
      const tight = v => v.replace(/(\d)\s+(?=[a-z])/g, '$1');   // 0.25 kg is 0.25kg; 5 3/5 stays apart
      return accept.split('|').some(w => tight(markNorm_(w)) === tight(t));
    }
  }
  if (!again) {
    /* A NAME IN FRONT IS THE SENTENCE TOO. § */
    const named = t.replace(/^[a-z]+=(?=-?[\d.])/, '');
    const off = markUnitOff_(named);
    /* ONLY AGAINST A WAY THAT HAS NO UNIT, OR THE SAME ONE: § */
    const unitOf = v => ((MARK_UNIT_OF.exec(markNorm_(v)) || [])[1] || '')
      .replace(/(^|[\/\s])([mcdk]?m|units?)\^?([23\u00b2\u00b3])(?=[\/\s]|$)/g,
        (m, at, u, p) => at + u + (p === '\u00b2' ? '2' : p === '\u00b3' ? '3' : p));
    const tu = unitOf(named);
    const all = String(accept || '').split('|').map(w => w.trim()).filter(Boolean);
    /* ---------- A BARE WAY LETS A UNIT THROUGH AFTER A NUMBER, AND ONLY THERE § */
    const exact = /[√π]/.test(off);
    const strict = tu && (exact || tu.indexOf('/') >= 0);
    const units = all.map(unitOf).filter(Boolean);
    const first = u => u.split(' ')[0];
    const ways = (strict ? (units.indexOf(tu) >= 0 ? all : units.length || exact ? [] : all)
      : all.filter(w => !unitOf(w) || first(unitOf(w)) === first(tu))).join(' | ');
    if (off !== t && ways && markAnswer_(off, ways, true)) return true;
  }
  /* ---------- AND THE SPACE BETWEEN A NUMBER AND ITS LETTERS SAYS NOTHING § */
  const tight = s => s.replace(/([\dπ])\s+(?=[a-z\u00b0%])/g, '$1');
  const tt = tight(t);
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(Boolean);
  /* only where the row names no form rule (O2, O4): a `rule:` way can ask for a form the value does not give */
  const free = !rules.length;
  const pct = v => { const m = /^(-?\d+(?:\.\d+)?)%$/.exec(v), f = m && markFrac_(m[1]); return f && { n: f.n, d: f.d * 100 }; };
  const tTerms = free ? markTerms_(t) : null;
  for (let i = 0; i < ways.length; i++) {
    const w = ways[i];
    if (tt === tight(markNorm_(w))) return true;
    if (free) {
      /* 25% is 0.25, and 0.25 is 25% (O2) */
      const wn = markNorm_(w), a = pct(t) || markFrac_(t), b = pct(wn) || markFrac_(wn);
      if ((pct(t) || pct(wn)) && !(pct(t) && pct(wn)) && a && b && a.n * b.d === b.n * a.d) return true;
      if (tTerms && tTerms === markTerms_(w)) return true;
    }
    if (markNum_(t) === markNum_(markNorm_(w))) return true;
    if (t === markBare_(w) || markNum_(t) === markNum_(markBare_(w))) return true;
    const a = markParts_(t).map(tight).sort(), b = markParts_(w).map(tight).sort();
    if (a.length && a.length === b.length && a.join('|') === b.join('|')) return true;
    /* the same value written another way -- see `markFrac_` above */
    const p = markFrac_(t), q = markFrac_(markBare_(w));
    if (p && q && p.n * q.d === q.n * p.d) return true;
    /* anywhere inside a band the scheme prints -- see `markRange_` above */
    const band = markRange_(w);
    /* A READING WITH ITS UNIT OR DEGREE SIGN (385): the number inside the band, the unit the band's own or a degree */
    const ru = band && !p && /^(-?\d+(?:\.\d+)?)\s*([a-z\u00b0%]+)\.?$/.exec(t);
    if (ru && (ru[2] === band.unit || /^(\u00b0|degrees?|deg)$/.test(ru[2]))) {
      const pv = markFrac_(ru[1]);
      if (pv && pv.n * band.lo.d >= band.lo.n * pv.d && pv.n * band.hi.d <= band.hi.n * pv.d) return true;
    }
    if (p && band
      && p.n * band.lo.d >= band.lo.n * p.d
      && p.n * band.hi.d <= band.hi.n * p.d) return true;
  }
  return false;
}

/* ---------- OPTIONS ARE READ, AND THE ANSWER IS TYPED (owner, 9 Nov): one typed box for every part; the options are listed A, B, C to type. */
const CHOICE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function choiceList_(x) {
  if (!x || !Array.isArray(x.choices) || x.choices.length < 2) return '';
  const need = Math.max(1, (x.choiceRight || []).length);
  const say = orderIs_(x) ? 'Type the letters in order, e.g. B, A, C' : need > 1 ? 'Type ' + need + ' letters, e.g. A, C' : 'Type the letter';
  return `<ol class="qp-optlist" type="A">${x.choices.map((c, i) =>
    `<li class="qp-optline"><b class="qp-optl">${CHOICE_LETTERS[i] || i + 1}</b> ${typeset_(c)}</li>`).join('')}</ol>
  <span class="qp-ans-k">${esc(say)}</span>`;
}
/* WHAT WAS TYPED, AS OPTION NUMBERS (1-based): a letter, a number or an option's own words; null for nothing, [] for something that is no option. */
function choicePicks_(x, typed) {
  const opts = ((x && x.choices) || []).map(c => markNorm_(String(c).replace(/<[^>]*>/g, ' ')));
  const t = String(typed == null ? '' : typed).trim();
  if (!t) return null;
  const one = p => {
    const w = markNorm_(p);
    if (/^[a-z]$/.test(w) && w.charCodeAt(0) - 96 <= opts.length) return w.charCodeAt(0) - 96;
    if (/^\d+$/.test(w) && +w >= 1 && +w <= opts.length) return +w;
    const at = opts.indexOf(w);
    return at >= 0 ? at + 1 : 0;
  };
  const whole = one(t);
  if (whole) return [whole];
  let parts = t.split(/\s*(?:[,;>\n]|\bthen\b|\band\b)\s*/i).filter(Boolean);
  if (parts.length === 1) parts = t.split(/\s+/);
  const out = parts.map(one);
  return out.some(n => !n) ? [] : out;
}

/* EACH MARKER BY ITS KIND: `{got, of}`, or null for nothing typed. */
const markChoice_ = (x, typed, ord) => {
  const p = choicePicks_(x, typed);
  if (p === null) return null;
  /* ONE CHOICE MARKER (1200): an order is its picks in sequence, a choose is them as a set -- the same comparison, sorted */
  const set = w => (ord ? w : w.slice().sort((a, b) => a - b));
  return { got: markOrder_(set(p), ord ? orderWays_(x) : [set(x.choiceRight || [])]) ? 1 : 0, of: 1 };
};
const PART_MARKERS = {
  choice: (x, typed) => markChoice_(x, typed, false),
  order: (x, typed) => markChoice_(x, typed, true),
  accept: (x, typed) => { const v = markAnswer_(typed, x.accept); return v === null ? null : { got: v ? 1 : 0, of: 1 }; },
  words: (x, typed) => {
    const w = markWords_(typed, x.markWords);
    if (!w) return null;
    const of = Math.max(1, Math.min(w.of, Number(x.marks) || w.of));
    return { got: Math.min(w.got, of), of, words: true };
  },
};
/* ---------- ONE MARKER FOR EVERY TYPED PART (owner, 9 Nov): the mark scheme first — options, order, accepted answers, key words. `{got, of}`; null for nothing typed; `{ai:true}` where only the AI can mark. */
function markPart_(x, typed) {
  const m = markerOf_(x || {});
  const mark = Object.prototype.hasOwnProperty.call(PART_MARKERS, m.kind) ? PART_MARKERS[m.kind] : null;
  if (mark) return mark(x, typed);
  return String(typed == null ? '' : typed).trim() ? { ai: true } : null;
}

/* ---------- IS THIS ANSWER READY TO SEND: one table, a row per answer surface -- what it holds counts as an answer, and what is said when it does not. */
const qTrim_ = v => String(v == null ? '' : v).trim();
const PART_READY = {
  /* typed boxes: options, order, values, fractions, words -- `markPart_` reads them all */
  typed: { has: a => !!qTrim_(a), say: () => 'Write something first' },
  /* a table's or a sort's cells: one cell the marker can read */
  cells: { has: m => !!m && (m.each || []).some(v => v === true || v === false), say: () => 'Fill a cell first' },
  /* the pen: some ink the drawing marker can read (`padSay_`) */
  draw: { has: said => !!said, say: () => 'Draw your answer first' },
  /* the AI: the box, or a drawing or photos where the backend reads images */
  ai: { has: a => !!qTrim_(a.typed) || (a.seen && a.reads),
        say: a => a.seen ? 'Write your answer in the box too \u2014 the drawing and photos are your working' : 'Write something first' },
  /* photos of working: at least one page */
  photo: { has: pics => (pics || []).length > 0, say: () => 'Take a photo of your working first' },
};
/* '' WHEN READY, else what to say: the one test every Check and Send asks before it marks or sends */
function partReady_(kind, a) {
  const r = PART_READY[kind] || PART_READY.typed;
  return r.has(a) ? '' : r.say(a);
}

/* AN ORDERING: its options are typed in order, as letters (`choicePicks_`). */

function orderIs_(x) {
  return !!x && String(x.answerType || '').trim().toLowerCase() === 'order'
    && Array.isArray(x.choices) && x.choices.length >= 2;
}

/* THE STORED ROW READ BACK AS n PLACES, 0 FOR AN EMPTY ONE -- AND ONLY IF IT IS A ROW AT ALL. § */
function orderSeq_(v, n) {
  const out = [];
  const s = String(v == null ? '' : v);
  const parts = s.split(',');
  const row = /^\s*\d*\s*(,\s*\d*\s*)*$/.test(s) && parts.length <= n;
  const seen = new Set();
  if (row) {
    for (const t of parts) {
      if (t.trim() === '') { out.push(0); continue; }
      const m = parseInt(t, 10);
      if (!(m >= 1 && m <= n) || seen.has(m)) { out.length = 0; break; }
      seen.add(m);
      out.push(m);
    }
  }
  while (out.length < n) out.push(0);
  return out;
}
/* AND WRITTEN: `3,,5` for a hole, nothing after the last placed item, '' for an empty row. */
function orderSay_(seq) {
  const s = seq.map(m => (m ? String(m) : ''));
  while (s.length && s[s.length - 1] === '') s.pop();
  return s.join(',');
}
/* EVERY RIGHT ORDER THE ROW KNOWS. `choiceWays` from the loader; a card built by hand with only
   `choiceRight` is one order. */
function orderWays_(x) {
  const ways = (x && x.choiceWays) || [];
  if (ways.length) return ways;
  return x && (x.choiceRight || []).length ? [x.choiceRight] : [];
}

/* ---------- MARKING AN ORDER § */
function markOrder_(seq, ways) {
  const list = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(',')).map(t => String(t).trim());
  const alts = (Array.isArray(ways) ? ways : String(ways == null ? '' : ways).split('|'))
    .map(w => list(w).filter(Boolean).map(t => String(parseInt(t, 10))).join(','))
    .filter(Boolean);
  if (!alts.length) return null;
  const got = list(seq);
  if (got.length < alts[0].split(',').length || got.some(t => t === '')) return null;
  return alts.indexOf(got.map(t => String(parseInt(t, 10))).join(',')) !== -1;
}
