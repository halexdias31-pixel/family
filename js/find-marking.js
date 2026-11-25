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
    const v = keep_.get(k);
    if (v !== null) return v;
    /* ---------- AN ANSWER TYPED BEFORE ANYBODY SIGNED IN, FOUND AND MOVED § */
    const bare = k.replace(/^ans:u:[^:]*:/, 'ans:');
    if (bare === k) return '';
    /* THE SIGNED-OUT ONE AS ITS WRITER'S OWN READER READS IT (`ansValue_`), the visit's copy of a write
       the store refused first — `padAdopt_`'s reason below (317, "Six edges"). */
    const was = typeof ansValue_ === 'function' ? ansValue_(bare) : keep_.get(bare);
    if (was === null) return '';
    /* NOT INTO SOMEBODY ELSE'S BOX: § */
    if (typeof ansMayMove_ === 'function' && !ansMayMove_(bare, k)) return '';
    if (typeof ansStore_ === 'function') ansStore_(k, was); else keep_.put(k, was);
    /* AND THE SIGNED-OUT COPY GOES THROUGH THE WRITER — the stored one, the visit's held one (or the page
       going would write it back, `keepRetry_`) and its mark (`ansGoneMark_`), all at once. */
    if (typeof ansLocalPut_ === 'function') ansLocalPut_(bare, null); else keep_.del(bare);
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
    .replace(/[⁰¹²³⁴-⁹⁻]+/g, m => '^' + [...m].map(c => MARK_SUPS[c]).join(''))
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
    /* the mixed-number key's whole box: (2) (1)/(3) is 2 1/3 */
    .replace(/(^|[^\w)])\((-?\d+)\)\s+(?=\(?\d+\)?\/)/g, '$1$2 ')
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
    .trim()
    /* A TICK IS A TICK HOWEVER IT IS TYPED (owner, 18 Nov: Finley's √ in a tick-or-cross table was marked wrong): the
       keypad's √ alone, ✔ or ☑ is ✓; ✘ or × alone is ✗. Only a whole answer or cell, so √9 stays a root. */
    .replace(/^[√✔☑]$/, '✓').replace(/^[✘×]$/, '✗');
}

/* A RAISED RUN IS A POWER, 10⁻¹⁴ as 10^-14 and 10²³ as 10^23, as the keypad stores it. */
const MARK_SUPS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
/* A NUMBER WRITTEN WITH A POWER, worked out: 2^3, 2**3, 2³, 2<sup>3</sup>, 6.02×10^23, 1e-14; null for anything with a letter or no power in it. */
function markPowVal_(s) {
  const raw = String(s == null ? '' : s);
  if (!/\^|\*\*|[⁰¹²³⁴-⁹⁻]|<sup>|\d\s*e\s*[-+−]?\d/i.test(raw)) return null;
  const t = raw.replace(/<sup>(.*?)<\/sup>/gi, '^($1)').replace(/<\/?[a-z][a-z0-9]*(?=[\s\/>])[^>]*>/gi, '').replace(/&minus;/g, '-').replace(/[−–—]/g, '-').replace(/\s+/g, '')
    .replace(/[⁰¹²³⁴-⁹⁻]+/g, m => '^(' + [...m].map(c => MARK_SUPS[c]).join('') + ')').replace(/\*\*/g, '^')
    .replace(/(\d)e([-+]?\d+)/gi, '$1×10^($2)').replace(/(\d)x(?=\d)/gi, '$1×');
  /* -1² IS READ TWO WAYS BY CHILDREN, so a minus in front of a bare power is left to the written ways */
  if (/[a-z]/i.test(t) || /^-[\d.]+\^/.test(t)) return null;
  const r = markExprRead_(t);
  if (!r || r.sides.length !== 1) return null;
  const v = markExprVal_(r.sides[0], {});
  return isFinite(v) ? v : null;
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
  /* A WHOLE AND A PROPER FRACTION JOINED BY + IS ONE MIXED NUMBER (2+1/3 is 2 1/3): a child with no mixed key typed it so */
  const t = markNorm_(String(typed == null ? '' : typed).replace(/^\s*(-?\d+)\s+and\s+(\d+\s*\/\s*\d+)\s*$/i, '$1 $2')).replace(/^(-?\d+)\+(\d+)\/(\d+)$/, (m, w, n, d) => (Number(n) < Number(d) ? w + ' ' + n + '/' + d : m))
    .replace(/[,;=+×]/g, ' , ').replace(/(\d)-(?=\d)/g, '$1 , ');
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
  const said = typeof typed === 'string' && markSpoken_(typed), T = (said && markExprRead_(said, fns)) || markExprRead_(typed, fns), W = markExprRead_(want, fns);
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
function markRule_(typed, rule, head) {
  const body = String(rule || '').replace(/^\s*rule:\s*/i, '');
  /* `points`: worded points counted (`markPoints_`); as a yes or no, all of the marks */
  if (/^points\b/i.test(body)) { const p = markPoints_(typed, rule, null, head ? { head } : null); return !!p && p.got >= p.of; }
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

/* ---------- A WORDED ANSWER OF UP TO ABOUT SIX MARKS, MARKED BY THE POINTS IT MAKES (owner, 16 Nov) */
/* `rule: points max 4; her head ached / headache; [2] limbs heavy~weighed; [q] heat intolerable`: `;` parts the points, `/` a point's
   wordings, `~` a word's synonyms and spellings (a space ends a synonym list, so a synonym of several words joins them with `_`:
   `remove~get_rid water`), `[2]` a point's marks (1 if none; anywhere in the point), `[q]` a quotation only; after `max N` the head may
   say `first N` (only the first N answers read) and `phrases` (a short phrase is an answer, one point each). The distinct points found
   are added up to `max`. A wording's words, stemmed and with the typo rule (`markTypo_`), must stand close, in any order, in one
   sentence that is a sentence: a bare list of key words, a sentence of nothing but key words, and a long copied passage earn little. */
const MARK_PT_GLUE = new Set(('a an the of to in on at for with by from and or but as is are was were be been being it its this that these those '
  + 'he she they his her hers their him them i we you me my our your there here has have had do does did done will would can could may might '
  + 'must should shall so because which who whom whose when while then than also very just not no into onto out up down over under about '
  + 'all some any more most less if since until after before through each every one own too such what where why how').split(' '));
const MARK_PT_CLAUSE = new Set(('is are was were be been being has have had do does did will would can could may might must should shall '
  + 'he she it they i we you there because so which who that when while since if makes make made gets get got goes go went causes cause '
  + 'turns turn becomes become became forms form changes change gives give gave shows show produces produce means mean leads lead '
  + 'takes take took keeps keep kept lets let stops stop needs need uses use add adds put puts feels feel felt sees see saw').split(' '));
const MARK_PT_NOT = new Set(['not', 'no', 'never', 'without', 'nor', 'hardly']);
/* LITTLE WORDS THAT ARE THE POINT (18 Nov): "up and down", "all directions", "given out" are not "down", "directions", "given" -- kept in a key,
   as is every word of a way that is nothing but little words */
const MARK_PT_KEEP = new Set('up down all every both each out over under into onto through before after'.split(' '));
/* DIRECTION WORDS CARRY THE MEANING ("more reactive" is not "less reactive", 18 Nov): kept in a key though little, each read with its kind
   (more~greater~higher~increase, less~fewer~lower~smaller~decrease), and a point whose key names one is not scored where its opposite stands */
const MARK_PT_DIR = (() => {
  const m = new Map();
  [['up', 'more greater higher increase increases increased increasing bigger larger rise rises raise raises raised most greatest highest biggest largest'],
    ['down', 'less fewer lower smaller decrease decreases decreased decreasing reduce reduces reduced lesser lowers lowered lowering least fewest lowest smallest'],
    ['fast', 'faster quicker fastest quickest'], ['slow', 'slower slowest']].forEach(([k, ws]) => ws.split(' ').forEach(w => m.set(w, k)));
  return m;
})();
const MARK_PT_DIR_OPP = { up: 'down', down: 'up', fast: 'slow', slow: 'fast' };
/* OPPOSITES THE TYPO RULE MUST NEVER JOIN (decreases is two letters from increases): each is a rival, so a near miss of one is that one */
const MARK_PT_RIVALS = ('increase increases increased increasing decrease decreases decreased decreasing higher lower inhale exhale import export '
  + 'inside outside above below before after maximum minimum positive negative endothermic exothermic absorb absorbs absorbed emit emits '
  + 'emitted gain gains gained loses lost oxidised reduced oxidation reduction anode cathode acid alkali alkaline insulator conductor '
  + 'diffusion osmosis mitosis meiosis').split(' ');
/* A LETTER THAT NAMES A THING IS THAT THING (21 Nov): "polymer A has crosslinks" is not "polymer B has crosslinks", so a label A-H
   (polymer B, test tube C) is read as its own word, qzbq, never the article a nor a slip of another label; an A is a label after a
   word that is no little word, or before a verb, a than or the end ("flask A stays", "A has", "than A"), and always in a key; b-h are labels */
const MARK_PT_SUBJ = /^qz[a-h]q$/;
function markPtSubjects_(s, key) {
  return String(s).replace(/(^|[^A-Za-z0-9°'’\-.\/^_])([A-Ha-h])(?![A-Za-z0-9'’\-\/^+⁺⁻²³₀-₉_=(]|\.[A-Za-z0-9])/g, (m, pre, l, at, all) => {
    if (/\d\s*$/.test(all.slice(0, at + pre.length))) return m;
    const prev = (/([A-Za-z]+)[^A-Za-z.!?;]*$/.exec(all.slice(0, at + pre.length)) || [])[1];
    const next = (/^[\s,]*([A-Za-z]+|[.!?;:)]|$)/.exec(all.slice(at + pre.length + 1)) || [])[1];
    if (/[b-h]/i.test(l)) return /[b-h]/.test(l) && prev && /^(?:vitamin|part|grade|line|row|column|option|answer)$/i.test(prev) ? m : pre + 'qz' + l.toLowerCase() + 'q';
    if (key === true && l === 'A') return pre + 'qzaq';
    const verbish = next === '' || /^[.!?;:),]$/.test(next) || /^(?:than|and|or|but|to|then|with|is|was|has|had|does|did|will|would|can|could|reacts|reacted|contains|forms|gives|makes|shows|produces|needs)$/i.test(next || '')
      || /^[a-z]{2,}(?:[^su's]s|ed)$/.test(next || '');
    const after = prev && !MARK_PT_GLUE.has(prev.toLowerCase());
    return verbish && (after || (l === 'A' && (!prev || /^(?:than|and|or|but|so|because|while|whereas|then)$/i.test(prev)))) ? pre + 'qzaq' : m;
  });
}
/* the words of a source or an answer as they are read: entities, curly quotes and n't made plain */
function markPtPlain_(s) {
  return String(s == null ? '' : s).replace(/<br\s*\/?>|<\/(p|li|div|h\d|tr)>/gi, '\n').replace(/<[^>]*>/g, ' ')
    .replace(/&(rsquo|lsquo|#8217|#8216|apos);/g, "'").replace(/&(rdquo|ldquo|quot|#8220|#8221);/g, '"')
    .replace(/&hellip;/g, '...').replace(/&(mdash|ndash);/g, ' - ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...')
    .replace(/[^]*/, markPtSubjects_).toLowerCase().replace(/n't\b/g, ' not').replace(/'s\b/g, '')
    /* A NUMBER IS ONE WORD (18 Nov): 1,000 is 1000, so its comma parts nothing */
    .replace(/(\d)[,\u2009](?=\d{3}(?!\d))/g, '$1').replace(/(\d)\s*\/\s*(?=\d)/g, '$1/').replace(/(\d)\s*(?:per\s?cent|percent)\b/g, '$1%');
}
/* A NUMBER IS ONE WORD (18 Nov): 0.95, -3, 3/4 and 1,000 are read whole, each written one way (0.950 is 0.95), and % (per cent) stays on it, so a key's
   40.5% asks for the % too; a minus is a sign only where no number stands before it (10 - 15 is a range) */
const MARK_PT_NUM = /^-?\d+(?:\.\d+)?(?:\/\d+)?%?$/;
function markPtNumOf_(w) {
  if (!MARK_PT_NUM.test(w)) return w;
  const pc = /%$/.test(w) ? '%' : '', f = w.replace('%', '').split('/');
  return (f.length > 1 ? String(Number(f[0])) + '/' + String(Number(f[1])) : String(Number(f[0]))) + pc;
}
/* a number's value, for 3/4 against 0.75; NaN for a word */
const markPtVal_ = w => { if (!MARK_PT_NUM.test(w)) return NaN; const f = w.replace('%', '').split('/'); return f.length > 1 ? Number(f[0]) / Number(f[1]) : Number(f[0]); };
function markPtWords_(s) {
  const t = String(s).replace(/(\d)\s*(?:%|per\s?cent|percent)(?![a-z])/g, '$1%')
    .replace(/(^|[\s(=:])[-−–](?=\d)/g, (m, pre, at, all) => /\d\s*$/.test(all.slice(0, at)) ? m : pre + '¬')
    .replace(/(\d)\s*\/\s*(?=\d)/g, '$1÷').replace(/(\d\.\d+)(?=[a-z])/g, '$1 ').replace(/[-–—\/]/g, ' ');
  return (t.match(/¬?\d+(?:\.\d+)?(?:÷\d+)?%?(?![a-z0-9])|[a-z0-9]+|¤/g) || [])
    .map(w => /^[¬\d]/.test(w) ? markPtNumOf_(w.replace('¬', '-').replace('÷', '/')) : w);
}
/* A LIGHT STEM: plurals, -ed, -ing, -ly, -ness and a closing e or y, so ached is ache and heavily is heavy */
function markPtStem_(w) {
  let s = w;
  if (s.length < 4) return s;
  if (/ies$/.test(s) && s.length > 4) s = s.slice(0, -3) + 'y';
  else if (/sses$/.test(s)) s = s.slice(0, -2);
  else if (/(s|x|z|ch|sh)es$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (/[^su]s$/.test(s) && !/is$/.test(s)) s = s.slice(0, -1);
  if (/ness$/.test(s) && s.length > 6) s = s.slice(0, -4);
  else if (/ingly$/.test(s) && s.length > 7) s = s.slice(0, -5);
  else if (/ing$/.test(s) && s.length > 5) s = s.slice(0, -3);
  else if (/edly$/.test(s) && s.length > 6) s = s.slice(0, -4);
  else if (/ied$/.test(s) && s.length > 4) s = s.slice(0, -3) + 'y';
  else if (/ed$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (/ly$/.test(s) && s.length > 4) s = s.slice(0, -2);
  if (/([b-df-hj-np-tv-z])\1$/.test(s) && !/(ll|ss|zz|ff)$/.test(s)) s = s.slice(0, -1);
  if (/e$/.test(s) && s.length > 3) s = s.slice(0, -1);
  if (/y$/.test(s) && s.length > 3) s = s.slice(0, -1) + 'i';
  return s;
}
/* THE KEY, read once: `{ max, points: [{ n, q, ways: [[[word, ...synonyms], ...], ...] }] }` */
function markPtRead_(rule) {
  const memo = markPtRead_.memo || (markPtRead_.memo = new Map());
  if (memo.has(rule)) return memo.get(rule);
  const parts = String(rule || '').replace(/^\s*rule:\s*/i, '').split(';').map(p => p.trim()).filter(Boolean);
  const head = /^points\b(.*)$/i.exec(parts[0] || '');
  const out = { max: 0, points: [] };
  parts.slice(1).forEach(p => {
    /* A TAG ANYWHERE IN THE POINT (queue 4i): "[2] a / [2] b" and "a [2]" are the point's marks, never a word "2"; the most it names */
    const tags = [...p.matchAll(/\[(\d*)(q?)\]/gi)];
    const tag = tags.length ? [tags[0][0], String(Math.max(0, ...tags.map(t => Number(t[1]) || 0)) || ''), tags.some(t => t[2]) ? 'q' : ''] : null;
    /* a / between two digits is a fraction (3/4), not a second wording; a key's number is one word, as an answer's (markPtWords_) */
    const ways = (tags.length ? p.replace(/\[(\d*)(q?)\]/gi, ' ') : p).replace(/\s*(?:→|->|⟶|=>)\s*/g, ' to ').replace(/[^]*/, m => markPtSubjects_(m, true)).replace(/(\d)\/(?=\d)/g, '$1÷').split('/').map(w => w.trim().toLowerCase()
      .replace(/n't\b/g, ' not').replace(/(\d),(?=\d{3}(?!\d))/g, '$1').replace(/(\d)\s*(?:%|per\s?cent|percent)(?![a-z])/g, '$1%').replace(/(\d\.\d+)(?=[a-z])/g, '$1 ').split(/\s+/)
      .map(t => t.split('~').map(a => { const n = a.replace(/[^\d.÷%-]/g, '').replace('÷', '/');
        return /\d/.test(a) && MARK_PT_NUM.test(n) && !/[a-z]/.test(a) ? markPtNumOf_(n)
          : a.replace(/[^a-z0-9'_-]/g, '').replace(/'s$/, '').replace(/-/g, '').replace(/^_+|_+$/g, ''); }).filter(Boolean))
      .map(alts => { const d = alts.map(a => MARK_PT_DIR.get(a)).find(Boolean);
        return d ? [...new Set(alts.concat([...MARK_PT_DIR].filter(e => e[1] === d).map(e => e[0])))] : alts; })
      .filter(alts => alts.length))
      .map(way => {
        const little = alts => alts.length === 1 && MARK_PT_GLUE.has(alts[0]) && !MARK_PT_NOT.has(alts[0]) && !MARK_PT_KEEP.has(alts[0]);
        /* A THAN KEEPS ITS SIDES (18 Nov): "chlorine more reactive than bromine" is found only with chlorine before bromine */
        const th = way.findIndex(alts => alts.length === 1 && alts[0] === 'than');
        const kept = way.every(little) ? way : way.filter(alts => !little(alts));
        if (th > 0) kept.than = way.slice(0, th).filter(alts => kept.indexOf(alts) >= 0).length;
        /* AN ORDERED PHRASE KEEPS ITS ORDER INSIDE A POINT (queue 4i), as markOrderBroken_ reads one alone: "high to low concentration",
           "A then B", "A → B" are found only with the word before the to ahead of the word after it; numbers either side are a band */
        kept.order = [];
        way.forEach((alts, j) => {
          if (j < 1 || j >= way.length - 1 || alts.length !== 1 || !/^(?:to|then|into|becomes)$/.test(alts[0])) return;
          const b = way.slice(0, j).filter(a => kept.indexOf(a) >= 0).length;
          if (b > 0 && b < kept.length && !(MARK_PT_NUM.test(kept[b - 1][0]) && MARK_PT_NUM.test(kept[b][0]))) kept.order.push(b);
        });
        /* "silicon below carbon" keeps its sides as a than does (21 Nov): carbon below silicon is the other way round */
        kept.forEach((alts, b) => { if (alts.some(a => /^(?:below|above)$/.test(a))) { if (b > 0) kept.order.push(b); if (b + 1 < kept.length) kept.order.push(b + 1); } });
        /* TWO LABELS KEEP THEIR ROLES (21 Nov): "A has crosslinks but B has none" is found only with A before B */
        kept.subj = kept.map((alts, j) => alts.some(a => MARK_PT_SUBJ.test(a)) ? j : -1).filter(j => j >= 0);
        return kept;
      })
      .filter(w => w.length)
      .flatMap(markPtMirror_);
    if (ways.length) out.points.push({ n: tag && tag[1] ? Number(tag[1]) : 1, q: !!(tag && tag[2]), ways });
  });
  const m = /max\s+(\d+)/i.exec(head ? head[1] : '') || /^\s*(\d+)/.exec(head ? head[1] : '');
  out.max = m ? Number(m[1]) : out.points.reduce((s, p) => s + p.n, 0);
  /* `first N`: only the first N answers are read, as an examiner reads "give two"; `phrases`: a short phrase is an answer, one point each */
  out.first = Number((/first\s+(\d+)/i.exec(head ? head[1] : '') || [])[1]) || 0;
  out.phrases = /\bphrases\b/i.test(head ? head[1] : '');
  memo.set(rule, out);
  return out;
}
/* A COMPARISON SAID THE OTHER WAY ROUND IS THE SAME POINT (21 Nov): "A more reactive than B" is "B less reactive than A", and
   "silicon less reactive" is "carbon more reactive than silicon"; never "B more reactive than A" nor "carbon less reactive than silicon".
   A way with a direction word and the words of its subject before it gets its mirror: the direction turned over and the subject found
   after the answer's than (the key's than, or one the answer writes); the way itself, with no than, keeps its subject before any than */
function markPtMirror_(way) {
  const dirs = way.map((alts, j) => alts.map(a => MARK_PT_DIR.get(a)).find(Boolean) ? j : -1).filter(j => j >= 0);
  if (dirs.length !== 1) return [way];
  const k = dirs[0], d = way[k].map(a => MARK_PT_DIR.get(a)).find(Boolean), o = MARK_PT_DIR_OPP[d];
  if (k < 1 || (way.than > 0 && (way.than <= k || way.than >= way.length))) return [way];
  const flip = [...new Set([...MARK_PT_DIR].filter(e => e[1] === o).map(e => e[0]))];
  const props = w => { w.order = []; w.subj = w.map((alts, j) => alts.some(a => MARK_PT_SUBJ.test(a)) ? j : -1).filter(j => j >= 0); return w; };
  if (way.than > 0) {
    const subj = way.slice(0, k), pred = way.slice(k, way.than), other = way.slice(way.than);
    const m = props(other.concat([flip], pred.slice(1), subj));
    m.than = other.length + pred.length;
    return [way, m];
  }
  way.thanSide = { subj: k, dir: k, after: false };
  const m = props(way.map((alts, j) => j === k ? flip : alts));
  m.thanSide = { subj: k, dir: k, after: true };
  return [way, m];
}
/* THE SOURCE A QUOTATION IS CHECKED AGAINST: the question's own words, its lead and the stems above it; '' where there is none to check */
function markPtSource_(x) {
  if (!x) return '';
  /* and the paper's reading insert, once its words are here (`insertsFor_`), its printed line numbers left out */
  const ins = typeof insertsFor_ === 'function' ? insertsFor_(x).filter(insReading_).map(r => String(r.sourceText || '').replace(/\[\d{1,3}\]/g, ' ')) : [];
  const bits = [x.lead, x.html].concat((x.stems || []).map(s => (s && (s.html || (s.row && s.row.html))) || ''), ins);
  const words = markPtWords_(markPtPlain_(bits.join('\n')));
  return words.length >= 30 ? ' ' + words.join(' ') + ' ' : '';
}
/* A WORD OF THE ANSWER IS A WORD OF THE KEY: the same stem, or a near miss the typo rule forgives */
function markPtIs_(tok, alts, opt) {
  for (const a of alts) {
    if (tok.w === a || tok.s === markPtStem_(a)) return true;
    const va = markPtVal_(a), vt = markPtVal_(tok.w);
    /* a key's 40.5% asks for the %: a bare 40.5 is not it, though 40.5% is a key's bare 40.5 */
    if (!isNaN(va) && !isNaN(vt) && Math.abs(va - vt) <= 1e-9 * Math.max(1, Math.abs(va)) && (!/%$/.test(a) || /%$/.test(tok.w))) return true;
    /* a little word (her, was) is never a near miss of a key word (hear, wax), nor a number of another */
    /* reactive is reacts, conductive conducts: an -ive word is its verb (21 Nov) */
    const sk = markPtStem_(a);
    if (sk.length >= 6 && /iv$/.test(sk) && tok.s === sk.slice(0, -2)) return true;
    if (tok.s.length >= 6 && /iv$/.test(tok.s) && sk === tok.s.slice(0, -2)) return true;
    /* a label is only itself: B is never a slip of A */
    if (MARK_PT_SUBJ.test(a) || MARK_PT_SUBJ.test(tok.w)) continue;
    if (!isNaN(va) || !isNaN(vt) || (opt && opt.strict) || MARK_PT_GLUE.has(tok.w) || !markEndsKept_(tok.w, a)) continue;
    if (markTypo_(tok.w, a, opt)) return true;
    const sa = markPtStem_(a);
    if (sa.length >= 4 && tok.s.length >= 4 && markTypo_(tok.s, sa, opt)) return true;
  }
  return false;
}
/* ONE WORDING IN A RUN OF WORDS: the closest set of places that holds every word of it, or null */
function markPtFind_(toks, way, opt, quoteOnly) {
  const negWay = way.some(a => a.some(b => MARK_PT_NOT.has(b)));
  /* A SYNONYM OF SEVERAL WORDS (21 Nov) is written with _ between them, `remove~get_rid~take_out water`: found as those words in a row */
  const alt = (alts, i) => markPtIs_(toks[i], alts.filter(a => a.indexOf('_') < 0), opt)
    || alts.some(a => a.indexOf('_') >= 0 && a.split('_').filter(Boolean).every((w, n) => toks[i + n] && toks[i + n].c === toks[i].c && markPtIs_(toks[i + n], [w], opt)));
  /* a way that names no label, in a key that names one (`polymer A has crosslinks | rule: points max 1; has crosslinks`), is said of
     that label: an answer that names another label and not it ("polymer B has crosslinks") does not make it */
  if (opt && opt.subj && !(way.subj || []).length && toks.some(t => MARK_PT_SUBJ.test(t.w)) && !toks.some(t => t.w === opt.subj)) return null;
  const at = way.map(alts => toks.map((t, i) => i).filter(i => {
    if (!alt(alts, i)) return false;
    if (quoteOnly && !toks[i].quote) return false;
    if (negWay) return true;
    /* "she was not tired" is not "she was tired"; a not stays in its own clause (queue 4d): "No, because 99.9% is reflected" keeps its point,
       so the look back stops at a comma or a because */
    for (let j = i - 1, k = 0; j >= 0 && k < 3; j--, k++) {
      if (toks[j].c !== toks[i].c || toks[j].w === 'because') break;
      if (MARK_PT_NOT.has(toks[j].w)) return false;
      if (!MARK_PT_GLUE.has(toks[j].w)) break;
    }
    return true;
  }));
  if (at.some(a => !a.length)) return null;
  const span = way.length + 4;
  let best = null;
  const attached = markPtAttached_(toks, way);
  const walk = (k, used) => {
    if (k === at.length) {
      const lo = Math.min(...used), hi = Math.max(...used);
      const sided = (!(way.than > 0 && way.than < way.length) || Math.max(...used.slice(0, way.than)) < Math.min(...used.slice(way.than)))
        && (way.order || []).every(b => used[b - 1] < used[b])
        && (way.subj || []).every((j, n, a) => !n || used[a[n - 1]] < used[j])
        && markPtThanSide_(toks, way, used);
      if (hi - lo + 1 <= span && sided && (!best || hi - lo < best.hi - best.lo) && attached(used)) best = { lo, hi, used: used.slice() };
      return;
    }
    for (const i of at[k].slice(0, 12)) if (used.indexOf(i) < 0) { used.push(i); walk(k + 1, used); used.pop(); }
  };
  walk(0, []);
  return best;
}
/* the subject of a way with no than (`markPtMirror_`) against a than the answer writes after its direction word, in the same comma-part */
function markPtThanSide_(toks, way, used) {
  const ts = way.thanSide;
  if (!ts) return true;
  const di = used[ts.dir], c = toks[di].c;
  const than = toks.findIndex((t, i) => i > di && t.c === c && t.w === 'than');
  const subj = used.slice(0, ts.subj);
  /* and where the answer compares, the subject is the one of that comparison, not a word across a because or a so before it */
  if (!ts.after) return than < 0 || subj.every(i => i < than && !toks.some((t, y) => y > i && y < di && MARK_PT_JOIN.has(t.w)));
  return than >= 0 && subj.every(i => i > than);
}
/* A DIRECTION WORD BELONGS TO ITS NOUN (18 Nov): "less reactive" is not "more reactive", and in "blockage increases, flow decreases" each noun
   has its own. A way that names a direction is found only where (1) each of its other words, in its comma-part, has no opposite direction word
   nearer to it than the nearest of the way's own kind, and (2) where the key has words both before and after a direction verb ("salt lowers
   melting point"), an answer's direction verb (-s, -ed) keeps them on the same sides, swapped after "by" ("is lowered by salt"), so
   "melting point lowers salt" is not it; an adjective ("the melting point is lower with salt") is not held to sides; and (3) a way with opposite
   directions in it ("salt increases, open stomata decreases", "rises then falls") keeps every noun, and each direction, on the same side of each of
   them, so the two are not swapped. */
const MARK_PT_JOIN = new Set('so because which who that when while then since therefore thus whereas until unless meaning causing'.split(' '));
const markPtDirOf_ = w => MARK_PT_DIR.get(w) || MARK_PT_DIR.get(w.replace(/(?:s|ed|ing)$/, '')) || MARK_PT_DIR.get(w.replace(/(?:s|d)$/, ''));
function markPtAttached_(toks, way) {
  const dirAt = way.map(alts => alts.map(a => MARK_PT_DIR.get(a)).find(Boolean));
  const ks = dirAt.map((d, j) => d ? j : -1).filter(j => j >= 0);
  if (!ks.length) return () => true;
  const k = ks[0], d = dirAt[k];
  const own = new Set(ks.map(j => dirAt[j])), opp = new Set(ks.map(j => MARK_PT_DIR_OPP[dirAt[j]]).filter(e => !own.has(e)));
  const noun = j => !dirAt[j] && !way[j].some(a => MARK_PT_NOT.has(a));
  const sides = way.map((alts, j) => noun(j) ? (j < k ? -1 : 1) : 0);
  const twoSided = ks.length === 1 && sides.includes(-1) && sides.includes(1);
  return used => {
    for (let j = 0; j < used.length; j++) {
      /* the words after a than are what is compared with, not what the direction is said of */
      if (!noun(j) || (way.than > 0 && j >= way.than)) continue;
      const i = used[j], c = toks[i].c;
      /* the nearest of the way's own direction words, as found, against the nearest opposite one that is not */
      let near = Infinity, nearOpp = Infinity;
      /* a direction across a clause word ("limits the fish caught SO more fish survive") is the other clause's, not this point's:
         neither the way's own nor an opposite one counts there (queue 4i) */
      const across = x => toks.some((t, y) => y > Math.min(x, i) && y < Math.max(x, i) && MARK_PT_JOIN.has(t.w));
      ks.forEach(q => { if (toks[used[q]].c === c && !across(used[q])) near = Math.min(near, Math.abs(used[q] - i)); });
      toks.forEach((t, x) => { if (t.c !== c || used.indexOf(x) >= 0 || across(x)) return; const e = markPtDirOf_(t.w);
        if (e && opp.has(e)) nearOpp = Math.min(nearOpp, Math.abs(x - i)); });
      if (nearOpp < near) return false;
    }
    if (ks.some(q => own.has(MARK_PT_DIR_OPP[dirAt[q]])) && !used.every((i, j) => (!noun(j) && !dirAt[j]) || ks.every(q => Math.sign(i - used[q]) === Math.sign(j - q)))) return false;
    if (!twoSided) return true;
    const di = used[k], dw = toks[di].w;
    if (!/(?:[^s]s|ed)$/.test(dw)) return true;
    const flip = toks[di + 1] && toks[di + 1].w === 'by' ? -1 : 1;
    return used.every((i, j) => !sides[j] || Math.sign(i - di) === sides[j] * flip);
  };
}
/* `{ got, of, points: true }`, or null for nothing typed. `x` is the part, for its source; `opt` the typo rule's (`markOpt_`). */
function markPoints_(typed, rule, x, opt) {
  const raw = String(Array.isArray(typed) ? typed.join('\n') : typed == null ? '' : typed);
  if (!raw.trim()) return null;
  const key = markPtRead_(rule);
  const source = markPtSource_(x);
  const essay = !!(opt && opt.essay) || Number(x && x.marks) > 6;
  /* the one label the key's written answer names, if it names one (`markPtFind_`) */
  const head = String((opt && opt.head) || (x && x.accept) || '').split('|').filter(w => !/^\s*rule:/i.test(w)).join(' ');
  const labels = [...new Set(markPtWords_(markPtPlain_(head)).filter(w => MARK_PT_SUBJ.test(w)))];
  opt = { strict: !!(opt && opt.strict), others: ((opt && opt.others) || []).concat(MARK_PT_RIVALS), subj: labels.length === 1 ? labels[0] : '' };
  /* A QUOTATION MUST BE IN THE SOURCE: one that is not is taken out, one that is is marked as quoted */
  let quotes = 0, inSource = 0, notInSource = 0;
  const text = markPtPlain_(raw).replace(/(^|[\s(\[:,])(["'])((?:(?!\2)[^\n]|'(?=[a-z]))+?)\2(?=[\s.,;:!?)\]]|$)/g, (m, pre, qm, body) => {
    const parts = body.split(/\.\.\.+/).map(p => markPtWords_(p)).filter(p => p.length);
    /* with no source to check against, a quotation is read as the student's own words, and no `[q]` point is open */
    if (!parts.length || !source) return pre + ' ' + body + ' ';
    const found = source && parts.every(p => source.indexOf(' ' + p.join(' ') + ' ') >= 0);
    quotes++;
    if (found) inSource++; else notInSource++;
    return pre + (found ?' \u0001' + quotes + ' ' + body.replace(/[.!?;]/g, ' ') + ' \u0002 ' : ' ¤ ');
  });
  const credited = new Map();
  let inQuote = 0;
  let units = text.split(key.phrases ? /[.!?]+(?=\s|$)|[;\n•,]+|\s+and\s+/ : /[.!?]+(?=\s|$)|[;\n•]+/);
  units = units.filter(u => markPtWords_(u.replace(/\u0001\d+|\u0002/g, ' ')).some(w => !/^\d{1,2}$/.test(w)));
  if (key.first) units = units.slice(0, key.first);
  units.forEach(sentence => {
    /* the sentence's words, each with its stem, its comma-part and the quotation it stands in */
    const toks = [];
    /* "but", "whereas" and "while" part a sentence as "and" does: "lower than heavy fuel oil but higher than kerosene" is two parts (18 Nov) */
    sentence.split(/,|\s+(?=(?:and|but|whereas|while)\s)|\s+-\s+/).forEach((chunk, c) => {
      chunk.replace(/\u0001(\d+)|\u0002|[^\s\u0001\u0002]+/g, m => {
        if (m[0] === '\u0001') inQuote = Number(m.slice(1));
        else if (m === '\u0002') inQuote = 0;
        else markPtWords_(m).forEach(w => toks.push({ w, s: MARK_PT_NUM.test(w) ? w : markPtStem_(w), c, quote: inQuote }));
        return m;
      });
    });
    const glue = toks.filter(t => MARK_PT_GLUE.has(t.w)).length;
    if (!key.phrases && essay && toks.length < 3) return;
    /* A LIST OF KEY WORDS: four or more comma-parts and all but one of them no clause; only the parts that are clauses are read */
    const chunks = [...new Set(toks.map(t => t.c))];
    const clause = c => toks.some(t => t.c === c && (t.quote || MARK_PT_CLAUSE.has(t.w) || (/ed$/.test(t.w) && t.w.length > 4)));
    /* a list's items are short: a long part with no verb the list knows ("split into two smaller nuclei") is still prose (18 Nov) */
    const item = c => !clause(c) && toks.filter(t => t.c === c).length <= 3;
    /* A LIST ANSWER IN A SHORT ANSWER (queue 4i): "bacteria, fungi" names two points, each item read alone for at most one of them;
       an essay's list of key words is still the density rule's below */
    const listed = !essay && !key.phrases && chunks.length >= 2 && chunks.every(item) && chunks.every(c => toks.some(t => t.c === c && /^[a-z]{2,}$/.test(t.w) && !MARK_PT_GLUE.has(t.w)));
    let scopes = listed ? chunks.map(c => toks.filter(t => t.c === c))
      : chunks.length >= 4 && chunks.filter(item).length >= chunks.length - 1
      ? chunks.filter(clause).map(c => toks.filter(t => t.c === c)) : [toks];
    if (listed && key.first) scopes = scopes.slice(0, key.first);
    const found = [];
    scopes.forEach((sc, si) => key.points.forEach((p, pi) => {
      if (p.q && !source) return;
      for (const way of p.ways) {
        const f = markPtFind_(sc, way, opt, p.q);
        if (f) { found.push({ pi, n: p.n, si, at: f.used.map(i => sc[i]) }); break; }
      }
    }));
    /* NO MORE POINTS FROM A SENTENCE THAN IT HAS LITTLE TYING WORDS (the, she, so), NOR MORE THAN ONE PAST ITS VERBS; the same words never two points, a long quotation one */
    const keyWords = new Set();
    found.forEach(f => f.at.forEach(t => keyWords.add(t)));
    const verbs = toks.filter(t => t.quote || MARK_PT_CLAUSE.has(t.w) || (/ed$/.test(t.w) && t.w.length > 4)).length;
    /* a short sentence with no little words ("Hyenas worry Pi") is one point if a word in it is no key word at all */
    const tying = toks.filter(t => !keyWords.has(t) && (MARK_PT_GLUE.has(t.w) || t.quote)).length;
    const keyish = toks.filter(t => key.points.some(p => p.ways.some(w => w.some(alts => markPtIs_(t, alts, opt))))).length, own = keyish < toks.length;
    /* and a sentence that is three parts in four key words is a list of them, whatever little word it carries */
    /* that density rule is an ESSAY's (PEEL, a distilled set, a part over six marks: rule 1.33); a short answer's sentence earns every point it
       makes, verb or not, save a bare run of key words alone (17 Nov) */
    let room = key.phrases ? 1 : listed ? scopes.length : !essay ? (glue || verbs || own ? Infinity : 1)
      : keyish > 0.75 * toks.length ? 0 : glue ? Math.min(verbs + 1, tying) : toks.length <= 6 && own ? 1 : 0;
    const kept = [], perQuote = {}, items = new Set();
    found.sort((a, b) => b.n - a.n || b.at.length - a.at.length).forEach(f => {
      if (room <= 0 || credited.has(f.pi)) return;
      if (listed && items.has(f.si)) return;
      /* ONE WORD SERVES EVERY POINT IT IS PART OF (queue 4i): "decomposed by bacteria, which respire" is the decay point and the
         bacteria point; what is never two points is the very same words found again, one word or phrase farming a second mark */
      if (kept.some(k => k.at.length === f.at.length && f.at.every(t => k.at.indexOf(t) >= 0))) return;
      if (listed) items.add(f.si);
      const q = f.at.every(t => t.quote && t.quote === f.at[0].quote) ? f.at[0].quote : 0;
      if (q && toks.filter(t => t.quote === q).length > 15 && perQuote[q]) return;
      if (q) perQuote[q] = 1;
      kept.push(f);
      room--;
    });
    kept.forEach(f => credited.set(f.pi, f.n));
  });
  const got = [...credited.values()].reduce((s, n) => s + n, 0);
  /* `quoted`: quotations found word for word in the source; `unfound`: ones that are not; `sourced`: there was a source to check */
  return { got: Math.min(got, key.max), of: key.max, points: true, quoted: inSource, unfound: notInSource, sourced: !!source };
}
/* ---------- PEEL (rule 1.33): a long English answer, by AQA level, mechanically. Its boxes (data/settings/marking.json) are each read
   by `markPoints_` for Point (the question's focus in its first sentence), Evidence (a quotation found word for word in the insert),
   Explain (a technique from the subject's one list with an explaining word) and Link (the focus again in its last sentence);
   the count across the answer is a level, and the mark in it, through the one level table. `rule: peel; <focus wordings>` */
const PEEL_SAY = { point: 'point', evidence: 'evidence', explain: 'explain', link: 'link' };
function peelRows_(kind, subject) {
  return markRows_().filter(r => r.kind === kind && (!subject || !r.subject || String(r.subject).toLowerCase() === String(subject).toLowerCase()));
}
const markIsPeel_ = accept => /(^|\|)\s*rule:\s*peel\b/i.test(String(accept || ''));
const peelBoxes_ = () => peelRows_('box').map(r => ({ name: String(r.name), marks: String(r.marks || '').split(/\s+/).filter(k => PEEL_SAY[k]) }));
/* ONE BOX'S SENTENCES, quotations kept whole */
const peelSentences_ = s => (String(s).replace(/(["“‘'])[^"”’\n]*?(["”’])/g, m => m.replace(/[.!?]/g, '\u0003')).match(/[^.!?]+[.!?]*/g) || [])
  .map(t => t.replace(/\u0003/g, '.').trim()).filter(t => /[a-z]/i.test(t));
function markPeel_(typed, accept, x, opt) {
  const raw = String(typed == null ? '' : typed);
  if (!raw.trim()) return null;
  const subject = (x && (x.subject || (x.row && x.row.subject))) || '';
  const rule = String(accept || '').split('|').find(w => /^\s*rule:\s*peel\b/i.test(w)) || '';
  const focus = rule.replace(/^\s*rule:\s*peel\b\s*;?/i, '').trim();
  const key = ways => 'points 1; ' + ways;
  opt = Object.assign({}, opt, { essay: true });
  const has = (text, ways) => !!ways && !!String(text).trim() && (markPoints_(text, key(ways), x, opt) || { got: 0 }).got >= 1;
  const tech = peelRows_('technique', subject).map(r => r.words).join(' / ');
  const expl = peelRows_('explain', subject).map(r => r.words).join(' / ');
  const boxes = peelBoxes_(), levels = peelRows_('level').map(r => ({ level: +r.level, from: +r.from, name: r.name })).sort((a, b) => a.from - b.from);
  const of = Number(x && x.marks) || 0;
  /* ONE SHEET (owner, 20 Nov): its paragraphs are its blank lines, or its lines where it has none */
  const parts = /\n\s*\n/.test(raw) ? raw.split(/\n\s*\n/) : raw.split(/\n+/);
  let count = 0, made = 0, wait = false;
  const said = boxes.map((b, i) => {
    const text = String(parts[i] || '').trim(), s = peelSentences_(text);
    const got = {};
    if (text) b.marks.forEach(m => {
      if (m === 'point') got.point = has(s[0] || '', focus);
      if (m === 'link') got.link = s.length >= 2 && has(s[s.length - 1], focus);
      if (m === 'explain') got.explain = has(text, tech) && has(text, expl);
      if (m === 'evidence') {
        const p = markPoints_(text, key(focus || 'the'), x, opt) || {};
        if (!p.sourced) wait = true;
        got.evidence = (p.quoted || 0) > 0;
        if (p.unfound) got.unfound = p.unfound;
      }
    });
    /* AN EXPLANATION AND A LINK ARE OF THE EVIDENCE: with no quotation from the extract, neither counts */
    if (b.marks.indexOf('evidence') >= 0 && !got.evidence && (got.explain || got.link)) { got.explain = got.link = false; got.noquote = true; }
    const hit = b.marks.filter(m => got[m]), miss = b.marks.filter(m => !got[m]);
    count += hit.length; made += b.marks.length;
    return b.name + (!text ? ': empty' : ': ' + (hit.length ? 'has ' + hit.map(m => PEEL_SAY[m]).join(', ') : 'has none of PEEL')
      + (miss.length ? '; missing ' + miss.map(m => PEEL_SAY[m]).join(', ') : '')
      + (got.unfound ? ' (a quotation not found word for word in the extract)' : '')
      + (got.noquote ? '; explain and link count once there is a quotation from the extract' : '')) + '.';
  });
  /* WITH NO EXTRACT TO CHECK A QUOTATION AGAINST, nothing is marked: it is asked for, and Check says to wait */
  if (wait && typeof insertsFor_ === 'function') {
    const r = insertsFor_(x).find(insReading_);
    if (r && typeof insWant_ === 'function') insWant_(r);
    return { wait: true, say: 'The extract is still loading; press Check again in a moment.' };
  }
  const lv = levels.filter(l => count >= l.from).pop();
  const n = Math.max(1, levels.length);
  let mark = 0;
  if (lv && of) {
    const k = levels.indexOf(lv), lo = Math.round(k * of / n) + 1, hi = Math.round((k + 1) * of / n);
    const top = k + 1 < levels.length ? levels[k + 1].from - 1 : made;
    mark = Math.min(hi, lo + Math.floor((count - lv.from) * (hi - lo + 1) / Math.max(1, top - lv.from + 1)));
  }
  const head = lv ? 'Level ' + lv.level + ' (' + lv.name + '): ' + mark + ' of ' + of + ' marks, from ' + count + ' of ' + made + ' PEEL elements.'
    : 'No level yet: 0 of ' + of + ' marks, from 0 of ' + made + ' PEEL elements.';
  return { got: mark, of: of, points: true, peel: { level: lv ? lv.level : 0, count, made }, say: head, why: said.join(' ') };
}
/* ---------- LEVELS (rule 1.33; queue ESSAYS, DISTILLED, 20 Nov): a long answer by AQA level, mechanically, no AI at run time.
   `rule: levels p1q4; funny rather than frightening; 'ran in circles' / circles; ...` -- the head names the question type, a row of kind
   `levels` in data/settings/marking.json per type and objective (Q5 has two: AO5 and AO6, added); the rest are the indicative points,
   `;` parting them, `/` a point's wordings. Each row weighs signals a script can see (`LEVELS_SIGNALS`) against a target each,
   `quote 3 @2` (weight 3, full at 2); the weighted share is a level through the row's `cuts`, and the mark is placed in the level by
   how far the share runs into it. Weights, targets and cuts were distilled offline from AQA's examiner-marked exemplars
   (tools/essay-cases.js scores them on every build). The feedback is the level and the two signals that would lift it most. */
const markIsLevels_ = accept => /(^|\|)\s*rule:\s*levels\b/i.test(String(accept || ''));
const levelsRow_ = (type, ao) => markRows_().filter(r => r.kind === 'levels' && r.name === type && (!ao || r.ao === ao));
const levelsList_ = name => { const r = markRows_().find(r => r.kind === 'levels-words' && r.name === name); return r ? String(r.words).split('/').map(w => w.trim().toLowerCase()).filter(Boolean) : []; };
/* THE WORD RANKS (data/word-freq.json): asked for once, lazily, for spelling and ambitious vocabulary; a node check hands them in as DATA.wordFreq */
let LEVELS_FREQ = null, LEVELS_FREQ_ASKED = false;
function levelsFreq_() {
  if (LEVELS_FREQ) return LEVELS_FREQ;
  if (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.wordFreq)) return (LEVELS_FREQ = new Map(DATA.wordFreq.map((w, i) => [w, i])));
  if (!LEVELS_FREQ_ASKED && typeof fetch === 'function') {
    LEVELS_FREQ_ASKED = true;
    fetch('data/word-freq.json').then(r => r.json()).then(j => { LEVELS_FREQ = new Map((j.words || []).map((w, i) => [w, i])); }).catch(() => { LEVELS_FREQ_ASKED = false; });
  }
  return null;
}
/* A WORD IS KNOWN in the ranks as it stands, or as a regular form of one that is (walks, walked, walking, quickly, happier, cities) */
function levelsKnown_(w, F) {
  if (F.has(w)) return true;
  const tries = [w.replace(/'s$/, ''), w.replace(/s$/, ''), w.replace(/es$/, ''), w.replace(/ies$/, 'y'), w.replace(/ed$/, ''), w.replace(/ed$/, 'e'), w.replace(/d$/, ''),
    w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/([a-z])\1ing$/, '$1'), w.replace(/([a-z])\1ed$/, '$1'), w.replace(/ly$/, ''), w.replace(/ily$/, 'y'),
    w.replace(/er$/, ''), w.replace(/est$/, ''), w.replace(/ier$/, 'y'), w.replace(/iest$/, 'y'), w.replace(/ness$/, ''), w.replace(/ful$/, ''), w.replace(/less$/, ''),
    w.replace(/^un/, ''), w.replace(/^re/, ''), w.replace(/ment$/, ''), w.replace(/ise$/, 'ize'), w.replace(/ised$/, 'ized'), w.replace(/our$/, 'or')];
  return tries.some(t => t !== w && t.length > 2 && F.has(t)) || /^\d/.test(w);
}
/* THE QUOTATIONS: '…', ‘…’, "…", “…”; an apostrophe inside a word (don't, hyena's) is no quotation mark */
function levelsQuotes_(raw) {
  const out = [];
  String(raw).replace(/(^|[^a-z0-9])(["“‘']|&lsquo;|&ldquo;)([^"“”‘’\n]{1,200}?)(["”’']|&rsquo;|&rdquo;)(?![a-z])/gi, (m, pre, o, body) => { if (/[a-z]/i.test(body)) out.push(body); return m; });
  return out;
}
/* THE SOURCE'S WORDS, only the printed lines the part names where it names them (`source_lines`, A:10-19) */
function levelsSource_(x) {
  const ins = typeof insertsFor_ === 'function' ? insertsFor_(x).filter(insReading_) : [];
  const span = typeof insRowSpan_ === 'function' ? insRowSpan_(x) : null;
  const text = (x && x.levelsSource) || ins.map(r => String(r.sourceText || '')).join('\n\n');
  if (!text.trim()) return { all: '', span: '', wait: ins.some(r => !r.sourceText) };
  /* A WITHHELD SOURCE (AQA prints only a note, no numbered lines): the answer's quotations cannot be checked against it, so all count */
  if (!/\[\d{1,3}\]/.test(text)) return { all: '', span: '' };
  const words = s => ' ' + markPtWords_(markPtPlain_(s.replace(/\[\d{1,3}\]/g, ' '))).join(' ') + ' ';
  let cut = '';
  if (span) {
    let at = 0, cur = '';
    String(text).split(/\n\s*\n/).forEach(p => {
      const m = /^# Source ([A-Z])\b/i.exec(p.trim());
      if (m) { cur = m[1].toUpperCase(); at = 0; return; }
      p.split(/\[(\d{1,3})\]\s*/).forEach((t, i) => { if (i % 2) at = +t; else if ((!span.src || !cur || cur === span.src) && at >= span.from && at <= span.to) cut += ' ' + t; });
    });
  }
  return { all: words(text), span: span && cut.trim() ? words(cut) : '' };
}
const LEVELS_SAY = { quote: 'quote short phrases from the source (in quotation marks)', inlines: 'quote from the lines the question names',
  term: 'name the methods with subject terms', analysis: 'say what each quotation suggests or makes the reader feel', content: 'cover more of the key moments and ideas',
  evaluate: 'judge how far you agree with the statement, and how well the writer does it', compare: 'compare the two sources point by point (whereas, similarly)',
  words: 'write more: develop each point', paras: 'organise your writing into paragraphs', rare: 'choose more ambitious, precise words',
  varied: 'vary your sentences: short, long, questions, openings', punct: 'use a wider range of punctuation (; : — ? !)', spell: 'check your spelling',
  demarc: 'start each sentence with a capital and end it with a full stop', imagery: 'add imagery: similes, metaphors, the senses', focus: 'keep to what the question asks about' };
/* EVERY SIGNAL, read once off the answer */
function levelsSignals_(raw, key, x) {
  const F = levelsFreq_();
  /* the answer as typed, case and punctuation kept (capitals, demarcation and punctuation range read it); `low` for word lookups */
  const text = String(raw).replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ');
  const low = ' ' + markPtPlain_(raw).replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const sents = (text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*["”’']?/g) || []).map(s => s.trim()).filter(s => /[a-z]/i.test(s));
  const words = text.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  const has = (s, list) => { const t = ' ' + s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ') + ' '; return list.filter(w => t.indexOf(' ' + w + ' ') >= 0 || (w.length > 5 && t.indexOf(' ' + w) >= 0)); };
  const src = levelsSource_(x);
  const qs = levelsQuotes_(raw).map(q => markPtWords_(markPtPlain_(q)).join(' ')).filter(Boolean);
  const qIn = src.all ? qs.filter(q => q.split(/\.\.\.+/).every(p => src.all.indexOf(' ' + p.trim() + ' ') >= 0)) : qs;
  const qSpan = src.span ? qIn.filter(q => src.span.indexOf(' ' + q + ' ') >= 0) : qIn;
  const s = {};
  s.quote = new Set(qIn).size;
  s.inlines = src.span ? new Set(qSpan).size : s.quote;
  s.term = new Set(has(text, levelsList_(key.terms || 'language'))).size;
  s.analysis = sents.filter(t => has(t, levelsList_('analysis')).length).length;
  s.evaluate = sents.filter(t => has(t, levelsList_('evaluate')).length).length;
  s.compare = sents.filter(t => has(t, levelsList_('compare')).length).length;
  s.imagery = sents.filter(t => has(t, levelsList_('imagery')).length).length;
  /* an indicative point is covered when half its content words (four letters up) stand in the answer, quoted or not */
  s.content = key.points.filter(p => p.some(w => { const cw = markPtWords_(markPtPlain_(w)).filter(t => t.length >= 4 && !MARK_PT_GLUE.has(t));
    return cw.length && cw.filter(t => low.indexOf(' ' + t) >= 0).length >= Math.ceil(cw.length / 2); })).length;
  s.points = key.points.length;
  s.words = words.length;
  s.paras = String(raw).split(/\n\s*\n|\n(?=\s*\S)/).filter(p => (p.match(/[A-Za-z]+/g) || []).length >= 8).length;
  const lens = sents.map(t => (t.match(/[A-Za-z']+/g) || []).length).filter(n => n);
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, lens.length));
  const openers = new Set(sents.map(t => (t.match(/[A-Za-z']+/) || [''])[0].toLowerCase()));
  s.varied = lens.length >= 3 ? Math.min(1, sd / Math.max(1, mean)) * 0.6 + Math.min(1, openers.size / lens.length) * 0.4 : 0;
  s.punct = [/;/, /:/, /[—–]|\s-\s/, /\?/, /!/, /["“”]/, /\(/, /\.\.\.|…/, /,/].filter(r => r.test(text)).length;
  /* demarcation: sentences that open with a capital, a lone "i" a miss */
  s.demarc = sents.length ? sents.filter(t => /^["“‘']?[A-Z0-9]/.test(t)).length / sents.length - (text.match(/(^|\s)i(?=[\s',.])/g) || []).length / Math.max(1, sents.length) : 0;
  /* spelling and range need the word ranks; without them both are left out of the sum, not counted wrong */
  if (F) {
    const lw = words.filter((w, i) => !(/^[A-Z]/.test(w) && i > 0)).map(w => w.toLowerCase().replace(/[’']s?$/, '').replace(/[’'-]/g, ''));
    const known = lw.filter(w => levelsKnown_(w, F));
    s.spell = lw.length ? known.length / lw.length : 0;
    const content = [...new Set(known.filter(w => w.length > 3 && !MARK_PT_GLUE.has(w)))];
    s.rare = content.length ? content.filter(w => (F.get(w) || 0) > 3000).length / content.length : 0;
  }
  return s;
}
/* `quote 3 @2; analysis 3 @4 ...` read as [{ sig, w, at }]; `spell` and `demarc` are rates, read from `@` low to full at 1 */
function levelsWeights_(spec) {
  return String(spec || '').split(';').map(t => /^\s*([a-z]+)\s+([\d.]+)\s*@\s*([\d.]+)\s*$/i.exec(t)).filter(Boolean).map(m => ({ sig: m[1], w: +m[2], at: +m[3] }));
}
function levelsShare_(sig, wt) {
  const v = sig[wt.sig];
  if (v === undefined) return null;
  if (wt.sig === 'spell' || wt.sig === 'demarc') return Math.max(0, Math.min(1, (v - wt.at) / (1 - wt.at)));
  return Math.max(0, Math.min(1, v / wt.at));
}
/* ONE OBJECTIVE: its share, level and mark, and what would lift it most */
function levelsScore_(sig, row) {
  const wts = levelsWeights_(row.weights).filter(w => !(w.sig === 'content' && !sig.points));
  let got = 0, tot = 0;
  const gaps = [];
  wts.forEach(w => { const sh = levelsShare_(sig, w); if (sh === null) return; got += w.w * sh; tot += w.w; gaps.push({ sig: w.sig, lift: w.w * (1 - sh) }); });
  let share = tot ? got / tot : 0;
  const cuts = String(row.cuts || '0.1 0.3 0.5 0.7').split(/\s+/).map(Number);
  /* CAPS the descriptors set: too short to show the skill is Level 1; an analysis with no quotation from the source is Level 2 at most */
  let cap = 4;
  if (sig.words < (+row.short || 40)) cap = 1;
  if (/quote|inlines/.test(row.weights) && !sig.quote) cap = Math.min(cap, 2);
  /* as many levels as the row has cuts: four on Language, six on Literature (rule 1.33, 22 Nov), three for its AO4 */
  const n = cuts.length;
  if (n > 4 && cap < 4) cap = Math.round(cap * n / 4);
  let level = 0;
  cuts.forEach((c, i) => { if (share >= c) level = i + 1; });
  if (!sig.words) level = 0;
  level = Math.min(level, cap);
  const of = +row.of || 0, band = of / n;
  let mark = 0;
  if (level) {
    const lo = cuts[level - 1], hi = level < n ? cuts[level] : 1;
    const into = Math.max(0, Math.min(0.999, (share - lo) / Math.max(0.01, hi - lo)));
    mark = Math.min(of, Math.floor((level - 1) * band) + 1 + Math.floor(into * (Math.round(level * band) - Math.floor((level - 1) * band))));
    if (level < n && share >= hi) mark = Math.round(level * band);
  }
  gaps.sort((a, b) => b.lift - a.lift);
  return { ao: row.ao, of, level, top: n, names: row.names ? ['no level yet'].concat(String(row.names).split('/').map(s => s.trim())) : null, mark, share, next: gaps.filter(g => g.lift > 0.05).slice(0, 2).map(g => g.sig) };
}
function markLevelsRead_(accept) {
  const way = String(accept || '').split('|').find(w => /^\s*rule:\s*levels\b/i.test(w)) || '';
  const parts = way.replace(/^\s*rule:\s*levels\b/i, '').split(';').map(p => p.trim());
  const head = (parts.shift() || '').split(/\s+/).filter(Boolean);
  return { type: (head[0] || '').toLowerCase(), terms: head[1] || '', points: parts.filter(Boolean).map(p => p.split('/').map(w => w.trim()).filter(Boolean)) };
}
function markLevels_(typed, accept, x) {
  const raw = String(Array.isArray(typed) ? typed.join('\n') : typed == null ? '' : typed);
  if (!raw.trim()) return null;
  const key = markLevelsRead_(accept);
  const rows = levelsRow_(key.type);
  if (!rows.length) return { error: true };
  if (!key.terms) key.terms = rows[0].terms || 'language';
  /* WITH THE SOURCE OR THE WORD RANKS STILL ON THEIR WAY, nothing is marked: they are asked for, and Check says to wait */
  if (/quote|inlines/.test(rows.map(r => r.weights).join(' ')) && levelsSource_(x).wait) {
    const r = insertsFor_(x).find(insReading_);
    if (r && typeof insWant_ === 'function') insWant_(r);
    return { wait: true, say: 'The extract is still loading; press Check again in a moment.' };
  }
  if (/spell|rare/.test(rows.map(r => r.weights).join(' ')) && !levelsFreq_()) return { wait: true, say: 'The spelling list is still loading; press Check again in a moment.' };
  const sig = levelsSignals_(raw, key, x);
  const each = rows.map(r => levelsScore_(sig, r));
  const got = each.reduce((a, e) => a + e.mark, 0), of = each.reduce((a, e) => a + e.of, 0) || Number(x && x.marks) || 0;
  const name = ['no level yet', 'simple, limited', 'some', 'clear', 'perceptive, detailed'];
  const say = each.map(e => (each.length > 1 ? e.ao + ' ' : '') + (e.level ? 'Level ' + e.level + ' (' + (e.names || name)[e.level] + '): ' : 'No level yet: ') + e.mark + ' of ' + e.of + ' marks.').join(' ');
  const next = [...new Set([].concat(...each.filter(e => e.level < e.top).map(e => e.next)))].slice(0, 2);
  const why = next.length ? 'To reach the next level: ' + next.map(n => LEVELS_SAY[n] || n).join('; ') + '.' : 'Top level.';
  return { got: Math.min(got, of), of, points: true, levels: { each: each.map(e => ({ ao: e.ao, level: e.level, mark: e.mark, of: e.of })), signals: sig }, say, why };
}
function markIsPoints_(accept) {
  return /(^|\|)\s*rule:\s*points\b/i.test(String(accept || ''));
}
function markPointsWay_(accept) {
  return String(accept || '').split('|').find(w => /^\s*rule:\s*points\b/i.test(w)) || '';
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

/* ---------- A TYPO IS FORGIVEN, A DIFFERENT ANSWER NEVER (owner, 13 Nov): edits allowed by word length, 1-3 letters none, 4-7 one, 8+ two */
const MARK_TYPO_OF = n => (n >= 8 ? 2 : n >= 4 ? 1 : 0);
/* A SLIP NEVER CHANGES A CHEMICAL ENDING (18 Nov): propane is not propene, ethanol not ethanoic, sulfate not sulfite */
const MARK_CHEM_END = /(ane|ene|yne|anol|ol|al|oic|one|ate|ite|ide|ine)$/;
const markEndsKept_ = (t, w) => { const a = MARK_CHEM_END.exec(t), b = MARK_CHEM_END.exec(w); return !a || !b || a[1] === b[1]; };
/* Damerau-Levenshtein (adjacent swap is one edit), stopped early past `cap` */
function markEdits_(a, b, cap) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const d = [];
  for (let i = 0; i <= a.length; i++) d.push([i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/* the words of a way, or null when it is not plain words: numbers, units, symbols, formulas, algebra are never forgiven */
function markTypoWords_(s, raw) {
  if (raw != null && /[A-Z][a-z]?[A-Z0-9]|[a-z][A-Z]/.test(String(raw).replace(/<[^>]*>/g, ''))) return null;   // NaCl, CO2: a formula
  const w = markNorm_(s);
  if (!w || /[^a-z' ,\-]/.test(w)) return null;
  const out = w.split(/[\s,]+/).filter(Boolean);
  return out.length ? out : null;
}
/* THE CONFUSABLES ARE DATA (data/settings/confusables.json); with the question's other options, each is an answer in its own right */
function markRivals_(opt) {
  const rows = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.confusables)) ? DATA.confusables : [];
  if (markRivals_.rows !== rows) {   /* read once per list: the marker is asked thousands of times */
    markRivals_.rows = rows;
    markRivals_.words = [];
    rows.forEach(r => String((r && r.words) || '').split(/[|,]/).forEach(w => { w = markNorm_(w); if (/^[a-z'\-]+$/.test(w)) markRivals_.words.push(w); }));
  }
  const out = markRivals_.words.slice();
  ((opt && opt.others) || []).forEach(o => String(o || '').split('|').forEach(v => (markTypoWords_(v, v) || []).forEach(w => out.push(w))));
  return out;
}
/* a British or an American spelling (vaporise, vaporize; colour, color; centre, center) is the same word, not a rival */
const markSpellOf_ = x => markPtStem_(x).replace(/z/g, 's').replace(/our/g, 'or').replace(/re$/, 'er').replace(/ae|oe/g, 'e').replace(/ogue$/, 'og').replace(/ll/g, 'l');
function markRealWord_(t, w) {
  const F = levelsFreq_();
  return !!F && t.length >= 4 && t !== w && markSpellOf_(t) !== markSpellOf_(w) && levelsKnown_(t, F);
}
/* THE SPELLING THE SCHEME WANTS when `typed` is a forgiven near miss of a way; '' when it is not one (or is exact) */
function markTypo_(typed, accept, opt) {
  if (opt && opt.strict) return '';
  const tw = markTypoWords_(typed);
  if (!tw) return '';
  const rivals = markRivals_(opt);
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  for (let k = 0; k < ways.length; k++) {
    /* cheap first: a way of a very different length cannot be a near miss */
    if (Math.abs(ways[k].length - String(typed).trim().length) > 2 * tw.length + 2) continue;
    const ww = markTypoWords_(ways[k], ways[k]);
    if (!ww) continue;
    /* HOW THE WORDS ARE SPLIT IS NOT THE ANSWER: "non renewable", "nonrenewable" and "non-renewable" are one word, so are
       "gravitationalpotential" and "gravitational potential"; the joined letters take the same typo rule and the same rivals. */
    if (ww.length !== tw.length || tw.join(' ') !== ww.join(' ')) {
      const tj = tw.join('').replace(/-/g, ''), wj = ww.join('').replace(/-/g, '');
      const cap = MARK_TYPO_OF(wj.length);
      if (tj === wj) return markNorm_(ways[k]);
      if (ww.length !== tw.length) {
        if (cap && tj[0] === wj[0] && markEndsKept_(tj, wj) && markEdits_(tj, wj, cap) <= cap && !rivals.some(r => r.replace(/-/g, '') !== wj && markEdits_(tj, r.replace(/-/g, ''), MARK_TYPO_OF(r.length)) <= MARK_TYPO_OF(r.length))) return markNorm_(ways[k]);
        continue;
      }
    }
    let near = false;
    const ok = ww.every((w, i) => {
      const t = tw[i];
      if (t === w) return true;
      const cap = MARK_TYPO_OF(w.length);
      /* A SLIP KEEPS THE FIRST LETTER: increases/decreases, efficient/inefficient, elastic/inelastic are other words, not typos. */
      if (!cap || t[0] !== w[0] || !markEndsKept_(t, w) || markEdits_(t, w, cap) > cap) return false;
      /* A REAL WORD IS NOT A SLIP OF ANOTHER (queue 4i): flatter is not fatter, move not more -- a typed word the word ranks know
         (data/word-freq.json, `levelsKnown_`) is that word, unless it is a form of the key's own (cells, cell) */
      if (markRealWord_(t, w)) return false;
      /* a near miss as near to another answer is that answer, typed: wrong */
      if (rivals.some(r => r !== w && markEdits_(t, r, MARK_TYPO_OF(r.length)) <= MARK_TYPO_OF(r.length))) return false;
      near = true;
      return true;
    });
    if (ok && near) return markNorm_(ways[k]);
  }
  return '';
}
/* WHAT A QUESTION TELLS THE MARKER: strict where spelling is marked (SPaG, a scheme crediting it, `strict_spelling`); its options are rivals */
function markOpt_(x) {
  const r = (x && x.row) || x || {};
  const said = [x && x.answer, x && x.examinerNote, r.answer, r.examiner_note].join(' ');
  const strict = [x && x.strictSpelling, x && x.strict_spelling, r.strict_spelling, r.strictSpelling].some(v => v === true || /^(true|yes|1)$/i.test(String(v || '')))
    || (/^english/i.test(String(r.subject || (x && x.subject) || '')) && /KS[12]/i.test(String(r.key_stage || (x && x.keyStage) || '')))
    || /\b(gps|spag|spelling)\b/i.test(String(r.name || (x && x.name) || '') + ' ' + String(r.topics || ''))
    || /\b(correct(ly)?\s+spel|spelling\s+(must|is)|spelt\s+correctly)/i.test(said);
  const ch = x && x.choices;
  const others = (Array.isArray(ch) ? ch : String(ch || '').split('|').filter(Boolean)).map(c => String(c).replace(/<[^>]*>/g, ' '));
  return { strict: strict, others: others, unitAsked: markUnitAsked_(x, said), formAsked: markFormAsked_(x) };
}
/* THE FORM IS ASKED FOR (18 Nov, `setting forms when-asked`): the question, or the key's `form:` option, names a form -- a fraction,
   standard form, a percentage -- and an equal value in another form is not the answer (19/100 is not 0.19); the form counts only
   where the key itself is written in it, so a key in another form is never made unreachable */
const MARK_FORMS = {
  fraction: { q: /\b(?:as|in(?:to)?)\s+(?:a\s+|its\s+)?(?:single\s+|proper\s+|improper\s+)?fraction\b|\bfraction\s+form\b/i, is: t => /\d\s*\/\s*\d/.test(t) },
  standard: { q: /\bin\s+standard\s+(?:index\s+)?form\b/i, is: t => /10\s*\^|10[⁰¹²³⁴-⁹⁻]|\de[-+]?\d/.test(t) },
  percent: { q: /\bas\s+a\s+percentage\b|\bpercentage\s+form\b/i, is: t => /%|per\s?cent/.test(t) }
};
const markFormRule_ = () => { const r = markRows_().find(r => r.kind === 'setting' && r.name === 'forms'); return r ? String(r.value || '').trim().toLowerCase() : ''; };
function markFormAsked_(x) {
  if (markFormRule_() !== 'when-asked') return '';
  const r = (x && x.row) || x || {};
  const flag = String((x && x.form) || r.form || '').trim().toLowerCase();
  if (MARK_FORMS[flag]) return flag;
  const q = [x && x.lead, x && x.html, r.html].concat(((x && x.stems) || []).map(t => (t && (t.html || (t.row && t.row.html))) || '')).join(' ').replace(/<[^>]*>/g, ' ');
  return Object.keys(MARK_FORMS).find(k => MARK_FORMS[k].q.test(q)) || '';
}
/* the typed answer, in the form asked, against the key's ways that are in it; null where the form does not apply */
function markInForm_(typed, accept, form) {
  const f = MARK_FORMS[form], t = markNorm_(Array.isArray(typed) ? typed.join(', ') : typed);
  if (!f || !t) return null;
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  return ways.some(w => f.is(markNorm_(w))) ? f.is(t) : null;
}
/* THE UNIT IS ASKED FOR (18 Nov, `setting units when-asked`): the question asks for it ("give units", "give your answer in cm", "as a
   percentage"), or the row's own scheme withholds a mark without it ("unit required", "correct unit", "1 mark for unit", "no %");
   otherwise a bare number is the answer, as GCSE and A-level schemes credit it */
const MARK_UNIT_Q = /\b(?:give|state|include|with|write|show)\s+(?:the\s+|your\s+|its\s+|an?\s+|appropriate\s+|correct\s+|suitable\s+)*units?\b|\bunits?\s+(?:must|should)\b|\b(?:give|write)\s+your\s+answer\s+in\s+(?!standard|the\b|a\b|an\b|its\b|simplest|terms|exact|surd|form|figures|words|full|ratio|fraction|decimal)[a-z\u00b0%£$]|\bas\s+a\s+percentage\b/i;
const MARK_UNIT_MS = /\bunits?\s+(?:required|needed|must|is\s+required|mark)|\bcorrect\s+units?\b|\bmark\s+for\s+(?:the\s+|correct\s+)?units?\b|\b(?:missing|without|omit\w*|wrong|incorrect|penali[sz]e\w*)\s+(?:the\s+|a\s+)?(?:units?|%|percent|per\s?cent)|\bno\s+(?:units?|%)\s*(?:=|scores?|gets?|loses?|max|\d)/i;
function markUnitAsked_(x, said) {
  const r = (x && x.row) || x || {};
  const q = [x && x.lead, x && x.html, r.html].concat(((x && x.stems) || []).map(t => (t && (t.html || (t.row && t.row.html))) || '')).join(' ').replace(/<[^>]*>/g, ' ');
  return MARK_UNIT_Q.test(q) || MARK_UNIT_MS.test(String(said || '') + ' ' + String(r.markscheme || r.mark_scheme || ''));
}

/* ---------- SEVERAL VALUES IN THE ONE BOX (owner, 20 Nov: one box, never a box a value): its values, as a child parts them --
   commas, "and", semicolons or line breaks (markNorm_ makes those commas), or only spaces; brackets off, `x = 3` kept as `x=3`. */
function markList_(t) {
  const s = String(t).replace(/^\((.*)\)$/, '$1').replace(/\b([a-z])\s*=\s*/g, '$1=').trim();
  return (/,|\sand\s|&/.test(s) ? s.split(/\s*,\s*|\s+and\s+|\s*&\s*/) : s.split(/\s+/)).filter(Boolean);
}
/* A LIST THE KEY WRITES ("x = 3, y = -4", "(3, -11)", "53° and 127°") IS EVERY VALUE OF IT, typed with spaces or commas, its names
   (`x =`) left off in the key's order, or in any order where the key names none; a `rule:` reads the values comma-listed. */
function markListed_(t, accept, opt) {
  const got = markList_(t);
  /* spaces part values only where each is a number ("3 -4"), never a sentence's words */
  if (got.length < 2 || got.length > 16 || !/,|\sand\s|&/.test(t) && got.some(v => !/\d/.test(v))) return false;
  const all = String(accept || '').split('|').map(w => w.trim()).filter(Boolean), joined = got.join(', ');
  if (joined !== t && all.some(w => /^rule:/i.test(w) && markRule_(joined, w))) return true;
  const bare = v => v.replace(/^[a-z]=/, ''), one = (a, w) => !!markAnswer_(a, w, false, opt);
  return all.filter(w => !/^rule:/i.test(w)).some(w => {
    const want = markList_(markNorm_(w));
    if (want.length !== got.length) return false;
    const named = got.every(v => /^[a-z]=/.test(v));
    if (want.every((v, i) => one(named ? got[i] : bare(got[i]), named ? v : bare(v)))) return true;
    if (want.some(v => /^[a-z]=/.test(v))) return false;
    const left = want.slice();
    return got.every(v => { const i = left.findIndex(u => one(v, u)); return i >= 0 && left.splice(i, 1); });
  });
}
/* ---------- ORDER IS PART OF THE ANSWER WHERE THE KEY WRITES IT (queue 4c, 20 Nov): a point (3, -11), an ordered phrase ("X to Y",
   "from X to Y", "A then B", "A → B") and a pair of alleles (Tt, tt) are not the same answer in another order or case. A typed answer
   that is only the key's own parts rearranged, against a key that writes an order, is wrong. A bare list ("1, 2, 5, 10", "53° and 127°")
   or a `rule: set` is a set and stays any order; names (x = …) are matched name to value by markListed_; a band of numbers
   ("16.1 to 16.2") is a band, read by markRange_. */
const MARK_ORDER_SPLIT = /\s+(?:to|then|into|becomes)\s+|\s*(?:→|->|⟶|=>)\s*/;
function markOrderSides_(s) {
  const t = String(s).toLowerCase().replace(/[−–—]/g, '-').replace(/^\s*(?:it\s+)?(?:goes\s+|changes\s+|moves\s+)?from\s+/, '').trim();
  const sides = t.split(MARK_ORDER_SPLIT).map(v => v.trim());
  return sides.length >= 2 && sides.every(Boolean) ? sides : null;
}
function markOrderBroken_(typed, accept, opt) {
  const raw = String(typed || '').trim();
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  /* "I DON'T KNOW" IS NOT AN ANSWER, though it holds a `not` a key may list */
  if (/^(?:(?:i\s+)?(?:do\s*n[o']?t|dont)\s+know|(?:i\s+have\s+)?no\s+idea|dunno)[.!]?$/i.test(raw.replace(/[‘’]/g, "'")) && !ways.some(w => /know|idea|sure/i.test(w))) return true;
  if (!ways.length) return false;
  const o = Object.assign({}, opt, { listed: true });
  const same = (a, b) => !!markAnswer_(a, b, false, o);
  /* a permutation of the key's parts that is not the key's own order */
  const shuffled = (got, want) => {
    if (got.length !== want.length || got.length < 2) return false;
    if (got.every((v, i) => same(v, want[i]))) return false;
    const left = want.slice();
    return got.every(v => { const i = left.findIndex(u => same(v, u)); return i >= 0 && left.splice(i, 1); });
  };
  /* A POINT IN BRACKETS: (x, y) is read in its order */
  const tup = ways.filter(w => /^\([^()]*,[^()]*\)$/.test(markNorm_(w)));
  if (tup.length) {
    const got = markList_(markNorm_(raw.replace(/[−–—]/g, '-')));
    if (got.length >= 2 && tup.some(w => shuffled(got, markList_(markNorm_(w))))
      && !tup.some(w => { const want = markList_(markNorm_(w)); return want.length === got.length && got.every((v, i) => same(v, want[i])); })) return true;
  }
  /* AN ORDERED PHRASE: its sides in its order (a band of numbers is not one) */
  const num = v => /^[-+]?\d[\d.,\/]*\s*[a-z°%\/^0-9]{0,6}$/.test(v.trim());
  const tSides = markOrderSides_(raw);
  if (tSides) {
    const phr = ways.map(markOrderSides_).filter(sd => sd && !sd.every(num));
    if (phr.length && phr.some(sd => shuffled(tSides, sd)) && !phr.some(sd => sd.length === tSides.length && tSides.every((v, i) => same(v, sd[i])))) return true;
  }
  /* A LIST THE KEY MARKS `rule: ordered` KEEPS ITS ORDER (queue 4d): "red, orange, yellow | rule: ordered" is a sequence, not a set */
  if (String(accept || '').split('|').some(w => /^\s*rule:(?:.*[\s,;])?ordered\b/i.test(w))) {
    const got = markList_(markNorm_(raw.replace(/[−–—]/g, '-')));
    const lists = ways.map(w => markList_(markNorm_(w.replace(/[−–—]/g, '-')))).filter(l => l.length >= 2);
    if (lists.length && lists.some(l => shuffled(got, l)) && !lists.some(l => l.length === got.length && got.every((v, i) => same(v, l[i])))) return true;
  }
  /* A PAIR OF ALLELES IS READ IN ITS CASE: Tt is not tt or TT */
  if (/^([a-z])\1$/i.test(raw) && ways.some(w => /^([a-z])\1$/i.test(w) && /[A-Z]/.test(w)) && !ways.some(w => w === raw || w.split('').sort().join('') === raw.split('').sort().join(''))) return true;
  return false;
}
/* GENOTYPES ARE READ ALLELE BY ALLELE (20 Nov): IAIO, Tt, XᴴXʰ keep their case and symbols; the two alleles of one genotype may come
   in either order (IOIA = IAIO, tT = Tt; TT is not Tt); a list of genotypes holds exactly the key's genotypes, any order. Returns
   true/false when both the typed answer and a key way are all genotypes, else null (the other ways of marking decide). */
const MARK_GENOTYPE = [/^(I[^\sI,;])(I[^\sI,;])$/u, /^([XY][^\sXY,;]?)([XY][^\sXY,;]?)$/u, /^([A-Za-z])([A-Za-z])$/];
function markGenotype_(g) {
  for (const re of MARK_GENOTYPE) {
    const m = g.match(re);
    if (m && (re !== MARK_GENOTYPE[2] || m[1].toLowerCase() === m[2].toLowerCase())) return [m[1], m[2]].sort().join('|');
  }
  return null;
}
function markGenotypes_(s) {
  const toks = String(s || '').normalize('NFC').replace(/\(\s*\d+\s*\)/g, ' ').split(/\s*(?:[,;\/&]|\band\b)\s*|\s+/).filter(Boolean);
  if (!toks.length) return null;
  const gs = toks.map(markGenotype_);
  return gs.every(Boolean) ? gs.sort().join(' ') : null;
}
function markGenotypeList_(typed, accept) {
  const keys = String(accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w)).map(markGenotypes_).filter(Boolean);
  if (!keys.length) return null;
  const got = markGenotypes_(typed);
  if (got == null) return markGenotypes_(String(typed || '').toUpperCase()) ? false : null;   /* iaio: genotypes in the wrong case */
  return keys.includes(got);
}
const MARK_STD_RULE = /(?:^|\|)\s*rule:\s*standard(?:\s+(?:index\s+)?form)?\s*(?=\||$)/i;
function markStdForm_(typed) {
  const v = String(typed == null ? '' : typed).replace(/[\u2212\u2013]/g, '-').replace(/\s+/g, ' ').trim();
  return /^-?\s*[1-9](?:\.\d+)?\s*(?:[x×*·]|\\times)\s*10\s*(?:\^\s*\(?\s*[-+]?\s*\d+\s*\)?|[⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?![\d.])(?:\s*[^\d\s].*)?$/i.test(v)
    || /^-?[1-9](?:\.\d+)?e[-+]?\d+(?:\s*[^\d\s].*)?$/i.test(v);
}
function markAnswer_(typed, accept, again, opt) {
  if (Array.isArray(typed)) typed = typed.map(v => String(v == null ? '' : v).trim()).filter(Boolean).join(', ');
  const t = markNorm_(typed);
  if (!t) return null;                              /* nothing typed is not a wrong answer */
  /* `rule: standard form` (21 Nov): the value in standard form, one non-zero digit before the point, so 89 × 10^7 is not 8.9 × 10^8 */
  if (MARK_STD_RULE.test(String(accept || ''))) {
    if (!markStdForm_(typed)) return false;
    accept = String(accept).split('|').filter(w => !MARK_STD_RULE.test('|' + w + '|')).join('|');
  }
  /* AS TYPED FIRST; THEN, NOT RIGHT, AS THE KEY'S LIST OF VALUES (markListed_) */
  if (!(opt && opt.listed)) {
    const o = Object.assign({}, opt, { listed: true });
    if (!again && markOrderBroken_(typed, accept, opt)) return false;
    const geno = Array.isArray(typed) ? null : markGenotypeList_(typed, accept);
    if (geno != null) return geno;
    const first = markAnswer_(typed, accept, again, o);
    /* the typed words, not markNorm_'s: it reads "3 -4" as the sum 3-4 */
    /* a form asked for (`mixed`, `lowest`, `decimal`) is never given back by the list's values: 2 2/6 is not 2 1/3 in its lowest terms */
    const form = /rule:[^|]*(?:^|[:,])\s*(mixed|decimal|lowest)\s*(?:,|\||$)/i.test(String(accept || ''));
    return first || (again || form ? first : markListed_(String(typed).replace(/\s*[\r\n;]+\s*/g, ', ').replace(/[\u2212\u2013\u2014]/g, '-').toLowerCase(), accept, o) || first);
  }
  const said = !again && markSpoken_(t);   /* "fifteen" IS 15: the words read as digits are tried first */
  if (said && said !== t && markAnswer_(said, accept)) return true;
  /* A `rule:` WAY IS TESTED, NOT MATCHED (markRule_); the other ways are matched as before. */
  const rules = String(accept || '').split('|').filter(w => /^\s*rule:/i.test(w));
  if (rules.length) {
    if (rules.some(w => markRule_(typed, w, accept))) return true;
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
  /* a unit in brackets is a unit the key lets go: 40.5 (%) is 40.5% or 40.5 */
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(Boolean)
    .flatMap(w => { const m = /^(-?[\d.,\/\s]*\d)\s+\(([a-z\u00b0%][a-z\u00b0%\/]*(?:\^-?\d)?)\)$/.exec(markNorm_(w)); return m ? [m[1] + m[2], m[1]] : [w]; });
  /* only where the row names no form rule (O2, O4): a `rule:` way can ask for a form the value does not give */
  const free = !rules.length;
  const pct = v => { const m = /^(-?\d+(?:\.\d+)?)%$/.exec(v), f = m && markFrac_(m[1]); return f && { n: f.n, d: f.d * 100 }; };
  const tTerms = free ? markTerms_(t) : null;
  /* A UNIT THE KEY STATES IS ASKED FOR WHERE THE ROW ASKS (18 Nov, `setting units` when-asked, markUnitAsked_): then a bare number is not 40.5% or 12 kg, as a mark
     scheme that prints the unit withholds the mark; the key opts out by a bracket, 40.5 (%), or by a bare way beside it, 40.5% | 40.5 */
  const unitRule = markUnitRule_();
  const bareTyped = !again && (unitRule === 'required' || (unitRule === 'when-asked' && !!(opt && opt.unitAsked))) && /^-?[\d.,\/\s]*\d$/.test(t);
  for (let i = 0; i < ways.length; i++) {
    const w = ways[i];
    if (tt === tight(markNorm_(w))) return true;
    const wn0 = markNorm_(w), unitAsked = bareTyped && !/\(.*\)$/.test(wn0) && /^-?[\d.,\/\s]*\d\s*(?:to\s*-?[\d.]+\s*)?[a-z°%]/.test(wn0)
      && (markBare_(w) !== wn0 || !!(markRange_(w) && markRange_(w).unit));
    const bareOf = v => unitAsked ? v + '\u0000' : markBare_(v);
    if (free) {
      /* 25% typed is a key's 0.25 (O2); a key's 95% asks for the %, so 0.95 is not it (18 Nov), as `markPtIs_` reads a key's % */
      const wn = markNorm_(w), a = pct(t) || markFrac_(t), b = pct(wn) || markFrac_(wn);
      if (pct(t) && !pct(wn) && a && b && a.n * b.d === b.n * a.d) return true;
      /* a plain word of 4+ letters is a word, not a product of letters: "recieve" is not "receive" in another order, and words keep
         their order ("chlorine is more reactive than bromine" is not "bromine is more reactive than chlorine", 18 Nov) */
      if (tTerms && !/[a-z]{4,}/.test(t) && tTerms === markTerms_(w)) return true;
    }
    if (markNum_(t) === markNum_(markNorm_(w))) return true;
    /* THE SAME NUMBER WITH A POWER IN IT (owner, 13 Nov): 2^3 is 8, 1e-14 is 10^-14, 6.02×10^23 is 6.02e23 */
    if (free) { const pv = markPowVal_(typed), wv = markPowVal_(w), tv = pv != null ? pv : markFrac_(t), qv = wv != null ? wv : markFrac_(bareOf(w));
      const num = v => (v == null ? null : typeof v === 'number' ? v : v.n / v.d), a = num(tv), b = num(qv);
      if ((pv != null || wv != null) && a != null && b != null && Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b))) return true; }
    if (t === bareOf(w) || markNum_(t) === markNum_(bareOf(w))) return true;
    const a = markParts_(t).map(tight).sort(), b = markParts_(w).map(tight).sort();
    if (a.length && a.length === b.length && a.join('|') === b.join('|')) return true;
    /* the same value written another way -- see `markFrac_` above */
    const p = markFrac_(t), q = markFrac_(bareOf(w));
    if (p && q && p.n * q.d === q.n * p.d) return true;
    /* anywhere inside a band the scheme prints -- see `markRange_` above */
    const band = !unitAsked && markRange_(w);
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
  return !again && free && !!markTypo_(typed, accept, opt);
}

/* ---------- OPTIONS ARE READ, AND THE ANSWER IS TYPED (owner, 9 Nov): one typed box for every part; the options are listed A, B, C to type. */
const CHOICE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function choiceList_(x) {
  if (!x || !Array.isArray(x.choices) || x.choices.length < 2) return '';
  const need = Math.max(1, (x.choiceRight || []).length);
  const say = orderIs_(x) ? text_('type-the-letters-in-order-e') : need > 1 ? 'Type ' + need + ' letters, e.g. A, C' : text_('type-the-letter');
  /* OPTIONS THAT ARE LETTERS ALREADY get no second letter in front ("A J, B K" read as two answers each). */
  const bare = x.choices.every(c => /^\s*[A-Za-z]\s*$/.test(String(c).replace(/<[^>]*>/g, '')));
  return cardBlocks_([{ type: 'group', tag: 'ol', look: 'qp-optlist', attrs: { type: 'A' }, blocks: x.choices.map((c, i) => ({ type: 'group', tag: 'li', look: 'qp-optline',
    blocks: bare ? [] : [{ type: 'group', tag: 'b', look: 'qp-optl', text: CHOICE_LETTERS[i] || String(i + 1) }], inner: (bare ? '' : ' ') + typeset_(c) })) },
    { type: 'group', tag: 'span', look: 'qp-ans-k', text: say }]);
}
/* THE KEYPAD OF ONLY THE OPTIONS' LETTERS (owner 23 Nov: pick merged into type): the box's attributes -- the letters its keys type
   (an option that is a letter already is its own key) and how a tap adds one: `one` replaces, `set` adds in A–Z order without repeats,
   `order` appends in sequence. null for a part with no options. */
function choiceKeysAt_(x) {
  if (!x || !Array.isArray(x.choices) || x.choices.length < 2) return null;
  const bare = x.choices.map(c => String(c).replace(/<[^>]*>/g, '').trim());
  const own = bare.every(c => /^[A-Za-z]$/.test(c)) && new Set(bare).size === bare.length;
  const letters = own ? bare.join('') : CHOICE_LETTERS.slice(0, x.choices.length);
  return { 'data-kp-letters': letters, 'data-kp-pick': orderIs_(x) ? 'order' : (x.choiceRight || []).length > 1 ? 'set' : 'one' };
}
/* WHAT WAS TYPED, AS OPTION NUMBERS (1-based): a letter, a number or an option's own words; null for nothing, [] for something that is no option. */
function choicePicks_(x, typed) {
  const opts = ((x && x.choices) || []).map(c => markNorm_(String(c).replace(/<[^>]*>/g, ' ')));
  const t = String(typed == null ? '' : typed).trim();
  if (!t) return null;
  const one = p => {
    const w = markNorm_(p);
    /* AN OPTION THAT IS ITSELF A LETTER (J, K, L, M) is read as itself first, before the A, B, C labels (owner, 18 Nov). */
    if (opts.indexOf(w) >= 0) return opts.indexOf(w) + 1;
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

/* OPTIONS, AS A SET OR IN ORDER: `{got, of}`, or null for nothing typed. */
const markChoice_ = (x, typed, ord) => {
  const p = choicePicks_(x, typed);
  if (p === null) return null;
  /* ONE CHOICE MARKER (1200): an order is its picks in sequence, a choose is them as a set -- the same comparison, sorted */
  const set = w => (ord ? w : w.slice().sort((a, b) => a - b));
  return { got: markOrder_(set(p), ord ? orderWays_(x) : [set(x.choiceRight || [])]) ? 1 : 0, of: 1 };
};
/* ---------- ONE MARKING ENGINE (owner, 17 Nov), never live AI: `mark_(x, answer, scheme)` marks a part by the most exact method its
   scheme supports -- dogma (options, cells, exact keys and aliases, numbers with tolerance and units), then mechanical rules (PEEL,
   points, key words, a graph's geometry, a rule set distilled offline) -- and else it is `unmarked`: saved, never sent to a person.
   ONE MARK RESULT (owner, 23 Nov, UNIFY item 5): `{ marks, outOf, verdict, why }` from rule and (old) AI marks alike, verdict one of
   STATUS_IDS; nothing marked is verdict `untried`, its `state` empty | wait | unmarked saying why. Also `method`, and a method's extras.
   The methods, their tiers and their order are the table data/settings/marking.json (`DATA.marking`), with PEEL's rows. */
/* `setting units`: `required`, a unit the key states is always part of the answer (markAnswer_); `when-asked`, only where `markUnitAsked_` finds it asked for; absent, never */
const markUnitRule_ = () => { const r = markRows_().find(r => r.kind === 'setting' && r.name === 'units'); return r ? String(r.value || '').trim().toLowerCase() : ''; };
const markRows_ = () => ((typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.marking)) ? DATA.marking : []);
/* A DISTILLED RULE SET (the slot): rows `{kind: 'distilled', key, points}` made offline, run here as marking points */
const markDistilled_ = x => markRows_().find(r => r.kind === 'distilled' && r.key && (r.key === (x && x.key) || r.key === (x && x.row && x.row.row_id)));
/* each method: `has(x)` its scheme is on the part; `run(x, answer)` gives `{got, of, ...}`, or null for nothing to mark */
const MARK_METHODS = {
  choice: { has: x => markerOf_(x).kind === 'choice', run: (x, a) => markChoice_(x, a, false) },
  order: { has: x => markerOf_(x).kind === 'order', run: (x, a) => markChoice_(x, a, true) },
  cells: { has: x => markerOf_(x).kind === 'cells', run: (x, a) => {
    const m = markCells_(a, cellsOf_(x), markOpt_(x), cellsOrder_(x));
    return m.each.some(v => v === true || v === false) ? { got: m.right, of: m.of, each: m.each } : null;
  } },
  accept: { has: x => markerOf_(x).kind === 'accept' && !markIsPeel_(x.accept) && !markIsPoints_(x.accept), run: (x, a) => {
    const o = markOpt_(x), v0 = markAnswer_(a, x.accept, false, o);
    if (v0 === null) return null;
    const v = v0 && markInForm_(a, x.accept, o.formAsked) !== false;
    const fix = v && !markAnswer_(a, x.accept, false, { strict: true }) ? markTypo_(a, x.accept, o) : '';
    return fix ? { got: 1, of: 1, typo: fix } : { got: v ? 1 : 0, of: 1 };
  } },
  levels: { has: x => markerOf_(x).kind === 'accept' && markIsLevels_(x.accept), run: (x, a) => markLevels_(a, x.accept, x) },
  peel: { has: x => markerOf_(x).kind === 'accept' && markIsPeel_(x.accept), run: (x, a) => markPeel_(a, x.accept, x, markOpt_(x)) },
  points: { has: x => markerOf_(x).kind === 'accept' && !markIsPeel_(x.accept) && markIsPoints_(x.accept),
    run: (x, a) => markPoints_(a, markPointsWay_(x.accept), x, markOpt_(x)) },
  words: { has: x => markerOf_(x).kind === 'words', run: (x, a) => {
    const w = markWords_(a, x.markWords);
    if (!w) return null;
    const of = Math.max(1, Math.min(w.of, Number(x.marks) || w.of));
    return { got: Math.min(w.got, of), of };
  } },
  /* a drawing or graph: `answer` is `{ strokes, fig }`, held against `draw_answer` (366) */
  graph: { has: x => markerOf_(x).kind === 'draw', run: (x, a) => (a && typeof a === 'object' && !Array.isArray(a) ? DRAW_MARK.mark(a.strokes, x.drawAnswer, a.fig, x.marks) : null) || { error: true } },
  distilled: { has: x => !!markDistilled_(x), run: (x, a) => markPoints_(a, markDistilled_(x).points, x, Object.assign({}, markOpt_(x), { essay: true })) },
};
/* THE PART'S METHODS, in the table's order: the first whose scheme is on the part marks it */
function markSchemeOf_(x) {
  const names = markRows_().filter(r => r.kind === 'method' && MARK_METHODS[r.name]).map(r => r.name);
  return (names.length ? names : Object.keys(MARK_METHODS)).filter(n => MARK_METHODS[n].has(x || {}));
}
const markTierOf_ = name => ((markRows_().find(r => r.kind === 'method' && r.name === name) || {}).tier || (name === 'unmarked' ? 'none' : 'rules'));
function mark_(x, answer, scheme) {
  x = x || {};
  const name = scheme || markSchemeOf_(x)[0] || 'unmarked';
  const max = Math.max(1, Number(x.marks) || 1);
  const out = (marks, of, why, more) => markResult_(marks, of, why, Object.assign({ method: name }, more || {}));
  const none = (state, of, why) => out(0, of, why, { state });
  const blank = answer == null || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.some(v => String(v == null ? '' : v).trim()));
  if (!MARK_METHODS[name]) return none(blank ? 'empty' : 'unmarked', max, 'No exact key or mechanical rule for this part yet: saved, not marked.');
  const r = blank && name !== 'graph' ? null : MARK_METHODS[name].run(x, answer);
  if (!r || r.empty) return none('empty', r ? r.of : max, '');
  if (r.error) return none('unmarked', max, 'Could not mark it \u2014 try again');
  if (r.wait) return none('wait', max, r.say);
  const more = {};
  ['typo', 'peel', 'levels', 'say', 'each', 'stray'].forEach(k => { if (r[k] !== undefined) more[k] = r[k]; });
  return out(r.got, r.of, r.why || '', more);
}
/* ---------- ONE STATUS SET (owner, 23 Nov, UNIFY item 4): a question is not tried, right, part right or wrong, or sent and not
   marked yet (owner, 24 Nov: stored `sent`) (and its answer hidden, only where one is); worded once, words.json `status-<id>`, said by `statusWord_` on every card, menu, history and email. */
/* TWO MENUS (owner, 25 Nov): Attempted or Unattempted, and for an attempted part its Result -- Correct, Part correct or Incorrect. A part sent and
   not marked yet is Attempted with no result (everything gets marked); there is no hidden status (Show the answer is gone). */
const STATUS_IDS = ['untried', 'attempted', 'right', 'part', 'wrong'];
/* THE ONE MARK RESULT: marks of outOf, the verdict they make, one line why. A `state` (empty | wait | unmarked) means nothing was marked. */
function markResult_(marks, outOf, why, more) {
  const m = Math.max(0, Number(marks) || 0), of = Math.max(0, Number(outOf) || 0);
  const verdict = more && more.state === 'unmarked' ? 'attempted' : (more && more.state) || !of ? 'untried' : m >= of ? 'right' : m > 0 ? 'part' : 'wrong';
  return Object.assign({ marks: m, outOf: of, verdict, why: String(why || '').split('\n')[0] }, more || {});
}
/* ANY STORED VERDICT (`right`, `wrong`, `rule:n/m`, an old `ai:n/m`, `sent`, nothing) or a mark result -> its STATUS_IDS id */
function statusOf_(v) {
  if (v && typeof v === 'object') return STATUS_IDS.includes(v.verdict) ? v.verdict : 'untried';
  const r = verdictOf_(v);
  return r ? r.verdict : 'untried';
}
const statusWord_ = v => text_('status-' + (STATUS_IDS.includes(v) ? v : statusOf_(v)));
/* THE VERDICT AS STORED (`submissions.verdict`): a one-mark exact method or graph right | wrong, a rule's marks `rule:n/m`, unmarked `sent` */
function markWord_(v) {
  if (!v || v.state === 'unmarked') return 'sent';
  return (markTierOf_(v.method) === 'dogma' || v.method === 'graph') && v.outOf === 1 ? (v.marks >= 1 ? 'right' : 'wrong') : 'rule:' + v.marks + '/' + v.outOf;
}
/* AND READ BACK: a stored verdict as the one shape; `ai:` is an old AI mark, read only, never made again */
function verdictOf_(v) {
  const t = String(v == null ? '' : v);
  if (t === 'right' || t === 'wrong') return markResult_(t === 'right' ? 1 : 0, 1, '', { method: 'dogma' });
  if (t === 'sent') return markResult_(0, 0, '', { method: 'unmarked', state: 'unmarked' });
  const m = /^(ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(t);
  if (!m) return null;
  return markResult_(+m[2], +m[3], '', { method: m[1] === 'ai' ? 'ai' : 'rules' });
}
/* ---------- IS THIS ANSWER READY TO SEND: one table, a row per answer surface -- what it holds counts as an answer, and what is said when it does not. */
const qTrim_ = v => String(v == null ? '' : v).trim();
const PART_READY = {
  /* typed boxes: options, order, values, fractions, words -- `mark_` reads them all */
  typed: { has: a => !!qTrim_(a), say: () => text_('write-something-first') },
  /* a table's or a sort's cells: one cell the marker can read */
  cells: { has: m => !!m && (m.each || []).some(v => v === true || v === false), say: () => text_('fill-a-cell-first') },
  /* the pen: some ink the drawing marker can read (`padSay_`) */
  draw: { has: said => !!said, say: () => text_('draw-your-answer-first') },
  /* saved, never marked: the box or photos of the working */
  save: { has: a => !!qTrim_(a.typed) || a.pics > 0, say: () => text_('write-something-first') },
  /* photos of working: at least one page */
  photo: { has: pics => (pics || []).length > 0, say: () => text_('take-a-photo-of-your-working') },
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
