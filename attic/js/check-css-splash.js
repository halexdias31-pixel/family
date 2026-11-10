/* @family. — section 9 of js/check-css.js (attic, 88a): a splash built as one seamless loop stays one; it read the animation rows through check-anims.js. */
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
