/* THE COPY: the page's children, ids off, typed values and canvases carried over; taken again when the page changes or a second has passed */
function magCopy_(page) {
  const box = document.createElement('div');
  box.className = 'mag-in';
  box.style.width = page.offsetWidth + 'px';
  box.style.height = page.offsetHeight + 'px';
  [].slice.call(page.children).forEach(k => { if (!k.classList.contains('mag')) box.appendChild(k.cloneNode(true)); });
  box.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  const from = [].slice.call(page.querySelectorAll('input, textarea, canvas')).filter(e => !e.closest('.mag'));
  const to = box.querySelectorAll('input, textarea, canvas');
  from.forEach((e, i) => {
    const c = to[i];
    if (!c) return;
    if (e.tagName === 'CANVAS') { try { c.getContext('2d').drawImage(e, 0, 0); } catch (err) { /* a tainted canvas stays blank */ } }
    else c.value = e.value;
  });
  return box;
}
function magShow_(page, cx, cy, touch) {
  if (!page) return magHide_();
  if (MAG.page !== page || !MAG.el || !MAG.el.isConnected || Date.now() - MAG.at > 1000) {
    magHide_();
    const el = document.createElement('div');
    el.className = 'mag';
    el.setAttribute('aria-hidden', 'true');
    el.appendChild(magCopy_(page));
    page.classList.add('mag-host');
    page.appendChild(el);
    MAG.el = el; MAG.page = page; MAG.at = Date.now();
  }
  const r = page.getBoundingClientRect(), k = page.offsetWidth ? r.width / page.offsetWidth : 1;
  const x = (cx - r.left) / k, y = (cy - r.top) / k;
  /* ABOVE THE FINGER, which would hide what it holds; round the pointer on a mouse */
  const up = touch ? MAG_R + 28 : 0;
  MAG.el.style.left = (x - MAG_R) + 'px';
  MAG.el.style.top = (y - MAG_R - up) + 'px';
  MAG.el.firstChild.style.transform = `translate(${MAG_R - x * MAG_Z}px, ${MAG_R - y * MAG_Z}px) scale(${MAG_Z})`;
  MAG.live = true;
}
function magHide_() {
  clearTimeout(MAG.tid); MAG.tid = 0;
  if (MAG.el) MAG.el.remove();
  if (MAG.page) MAG.page.classList.remove('mag-host');
  MAG.el = null; MAG.page = null; MAG.live = false;
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('pointermove', e => {
    if (!MAG.on) return;
    if (e.pointerType === 'touch') {
      if (e.pointerId !== MAG.pid) return;
      if (MAG.live) magShow_(MAG.page, e.clientX, e.clientY, true);
      else if (Math.abs(e.clientX - MAG.x0) > 10 || Math.abs(e.clientY - MAG.y0) > 10) { clearTimeout(MAG.tid); MAG.pid = null; }
      return;
    }
    const page = magPageAt_(e.target);
    if (page) magShow_(page, e.clientX, e.clientY, false); else if (MAG.live) magHide_();
  });
  /* A FINGER HELD STILL BRINGS IT UP; one that moves first was scrolling or turning the page, and does that */
  document.addEventListener('pointerdown', e => {
    if (!MAG.on || e.pointerType !== 'touch') return;
    const page = magPageAt_(e.target);
    if (!page) return;
    MAG.pid = e.pointerId; MAG.x0 = e.clientX; MAG.y0 = e.clientY;
    clearTimeout(MAG.tid);
    MAG.tid = setTimeout(() => { if (MAG.pid === e.pointerId) magShow_(page, MAG.x0, MAG.y0, true); }, MAG_HOLD);
  });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => {
    if (e.pointerType !== 'touch' || e.pointerId !== MAG.pid) return;
    MAG.pid = null;
    magHide_();
  }));
  document.addEventListener('mouseleave', () => { if (MAG.live && MAG.pid === null) magHide_(); });
  /* WHILE IT IS UP THE FINGER MOVES THE GLASS, NOT THE PAGE */
  document.addEventListener('touchmove', e => { if (MAG.live && e.cancelable) e.preventDefault(); }, { passive: false });
}

/* ---------- THE PADLOCK ON A QUESTION (457): the page held still while you write, draw or read (`PADLOCK`, overworld.js) ---------- */
const qLockLook_ = on => ({ icon: on ? 'lock' : 'unlock', label: on ? 'Locked' : 'Lock', note: on ? 'tap to let the page move' : 'hold this page still',
                            on: on, pressed: on });
const qLockHere_ = () => String(typeof AT !== 'undefined' ? AT : '') + ':' + String((typeof PAGE !== 'undefined' && PAGE[AT]) || 0);
const qLockOpts_ = () => Object.assign(qLockLook_(!!PADLOCK.q), { act: 'q-lock', cls: 'q-lock' });
function qLockPaint_() { document.querySelectorAll('.q-lock').forEach(el => tileSet_(el, qLockLook_(!!PADLOCK.q))); }
on('q-lock', () => { PADLOCK.q = PADLOCK.q ? '' : qLockHere_(); qLockPaint_(); });
/* LET GO WHEN A TAB OR A LINK LEAVES THE PAGE IT WAS PRESSED ON: a lock nobody can see is a broken swipe */
function qLockStray_() { if (PADLOCK.q && PADLOCK.q !== qLockHere_()) { PADLOCK.q = ''; qLockPaint_(); } }

/* THE FIGURE, OVER THE CARD, ONE TAP AWAY. § */
function figsBefore_(x) {
  if (!isQ_(x)) return [];
  const out = [];
  const k = qId_(x);
  const sib = k ? ((questionParts_()[k]) || []) : [];
  const at = sib.indexOf(x);
  const drew = sib.slice(0, at < 0 ? 0 : at);
  const seen = svg => {
    const by = drew.filter(y => { const p = padSource_(y); return p && p.svg === svg; })
      .map(y => usesMine_(y)).filter(all => all.length);
    return by.length ? usesSeen_(svg, [].concat(...by)) : '';
  };
  const pic = (p, label, onlyMarked) => {
    const marked = p.diagram ? seen(p.diagram) : '';
    if (onlyMarked && !marked) return;
    const html = (marked || (p.diagram ? `<figure>${p.diagram}</figure>` : '')) + pics_(figImgs_(p.images));
    if (html) out.push({ label: label, html: html });
  };
  /* NOT THE STEM'S PICTURE THIS PART DRAWS ON: it is under the pen on this very card (356). */
  const penOn = padSource_(x);
  /* NOR ONE AN EARLIER PART DREW ON (381): a later part that reads it says so (`uses`) and has it, marked, on its card; one that does not has nothing for it */
  const drawnOn = p => drew.some(y => { const q = padSource_(y); return q && q.from !== 'surface' && q.svg === p.diagram; });
  (x.stems || []).forEach(p => { if (stemHasFig_(p) && !(penOn && penOn.from === p) && !(p.diagram && drawnOn(p))) pic(p, figLabel_(p.html)); });
  const own = p => !!(p.diagram || figImgs_(p.images).length);
  /* ---------- AND THE PICTURE A `uses` PART READS, ONLY WITH SOMETHING ON IT § */
  const bare = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
  const used = new Set();
  for (let y = x, n = 0; y && n < 9; n++) {
    const u = bare(y.uses || (y.row && y.row.uses));
    if (!u || used.has(u)) break;
    used.add(u);
    y = sib.find(p => bare(p.qPart) === u) || null;
  }
  sib.slice(0, at < 0 ? 0 : at).forEach(p => {
    if (own(p)) pic(p, figLabel_(String(p.lead || '') + ' ' + String(p.html || '')), used.has(bare(p.qPart)));
  });
  /* NOT ITS OWN FIGURE ANY MORE: that is on its card, among its words (356). The tile is for what is NOT on
     the card -- the stems' pictures and the earlier parts'. */
  return out;
}
/* NO FIGURE TILE (463): the owner, "if they want to see the figure, they scroll up"; `figsBefore_` still tells Read aloud there is one. */

/* ---------- READ ALOUD, ON EVERY PRIMARY QUESTION (394) ---------------------------------------- */
/* PRIMARY IS THE SATs LEVEL (`levelOf_`, `ksFallback_` behind it) or a school year 1 to 6, whatever the level cell says;
   the owner's words are in docs/history/394. */
function readAloudFor_(x) {
  if (!x) return false;
  /* EVERY QUESTION (457): the toolkit's, so it can never be missing from one */
  if (isQ_(x)) return true;
  /* EVERY CONTENT CARD AT EVERY LEVEL, and every other thing with words to read (502); the SATs-and-years-1-to-6 limit is gone */
  if (isContent_(x)) return true;
  return typeof speedText_ === 'function' && (isPractical_(x) || isProject_(x) || isBible_(x)) && !!speedText_(x);
}
/* WHAT IS BEING READ, AND WHERE IT WAS PRESSED: a slide to another column or page stops it (`readAloudStray_`, from `placeCells`). */
let READ_NOW = null;
const readAloudLook_ = on => ({ icon: 'speak', label: on ? 'Stop reading' : 'Read aloud', note: on ? 'one tap' : 'reads the question out',
                                 on: !!on, pressed: !!on });
function readAloudOpts_(x) {
  if (!readAloudFor_(x) || !canSay_() || !x.key) return null;
  const on = !!READ_NOW && READ_NOW.key === x.key;
  return Object.assign(readAloudLook_(on), { act: 'read-aloud', cls: 'read-aloud', data: { key: x.key } });
}
function readAloudPaint_(k) {
  const on = !!READ_NOW && READ_NOW.key === k;
  document.querySelectorAll('.read-aloud').forEach(el => { if (el.getAttribute('data-key') === k) tileSet_(el, readAloudLook_(on)); });
}
function readAloudStop_() {
  if (!READ_NOW) return;
  const k = READ_NOW.key;
  READ_NOW = null;
  hush_();
  readAloudPaint_(k);
}
function readAloudStray_() {
  if (READ_NOW && (AT !== READ_NOW.at || (PAGE[AT] || 0) !== READ_NOW.page)) readAloudStop_();
}
/* EVERY LINE QUEUED INSIDE THE TAP, because iPhone Safari speaks only from a tap's own handler; a line at a time, because Chrome cuts one long utterance off at about fifteen seconds. */
on('read-aloud', el => {
  const k = el && el.getAttribute('data-key');
  const was = READ_NOW && READ_NOW.key;
  readAloudStop_();
  if (!k || was === k) return;
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  /* A PART'S OWN TILE READS THAT PART (owner, 7 Nov); otherwise every part, a shared stem said once */
  const parts = x && el.hasAttribute('data-part') ? [x] : x && isQ_(x) && qMulti_(x) ? questionParts_()[qId_(x)] : [x];
  const lines = [...new Set([].concat(...parts.map(readAloudLines_)))];
  if (!lines.length || !canSay_()) return;
  const me = READ_NOW = { key: k, at: AT, page: PAGE[AT] || 0 };
  readAloudPaint_(k);
  const done = () => { if (READ_NOW === me) { READ_NOW = null; readAloudPaint_(k); } };
  lines.forEach((l, i) => say_(l, { onend: i === lines.length - 1 ? done : null }));
});

/* ---------- HEAR IT, ON A LANGUAGE'S CONTENT CARD (427) ---------------------------------------- */
/* The worked lines' own-language halves (before " — "), in that language's voice; the English is on the card to read. */
const HEAR_LANG = { Spanish: 'es-ES', French: 'fr-FR', German: 'de-DE', Russian: 'ru-RU' };
const hearItLang_ = x => (x && isContent_(x) && (typeof ruleOn_ !== 'function' || ruleOn_('hear-lang')) && HEAR_LANG[x.subject]) || '';
const hearItLines_ = x => ((x && x.row && x.row.points) || []).map(p => String(p.text || '').split(' — ')[0].trim()).filter(Boolean);
function hearItOpts_(x) {
  if (!hearItLang_(x) || !canSay_() || !x.key || !hearItLines_(x).length) return null;
  return { icon: 'speak', label: 'Hear it', note: 'the ' + x.subject + ', read out', act: 'hear-it', cls: 'hear-it', data: { key: x.key } };
}
/* QUEUED INSIDE THE TAP, as Read aloud's lines are; a second tap starts it again from the top. */
on('hear-it', el => {
  const k = el && el.getAttribute('data-key');
  readAloudStop_();
  hush_();
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  const lang = hearItLang_(x);
  if (lang) hearItLines_(x).forEach(l => say_(l, { lang: lang }));
});

/* ---------- WHAT IS SAID: THE QUESTION AS THE CARD SHOWS IT, NEVER THE ANSWER OR THE MARKS ---------- */
/* In the card's order (`partChunks_`): a stem carried onto the card, the lead, the part's words, "Look at the picture." where
   a figure stands; then the options as A, B, C, or the cards to order, and how many answers to give. */
function readAloudLines_(x) {
  if (!x) return [];
  const out = [];
  const add = h => speakLines_(h).forEach(l => out.push(l));
  if (!isQ_(x) && !isContent_(x)) return typeof speedText_ === 'function' ? speakLines_(speedText_(x).replace(/\n\s*\n/g, '. ')) : [];
  if (isContent_(x)) {
    const c = x.row || {};
    add(x.name || c.title);
    [].concat(c.words || [], c.formulas || [], c.points || []).forEach(i => {
      if (i && (i.name || i.text)) add([i.name, i.text].filter(Boolean).join(': '));
    });
    return out;
  }
  let pic = false;
  const look = () => { if (!pic) { out.push('Look at the picture.'); pic = true; } };
  [].concat(...partChunks_(x)).forEach(b => {
    if (b.k === 'sb' || b.k === 'lead' || b.k === 'pb') {
      if (/<(svg|img)\b/i.test(b.h)) look();
      add(b.h);
    } else if (b.k === 'fig' || b.k === 'use') look();
  });
  if (!pic && (questionHasFig_(x) || figsBefore_(x).length)) look();
  const ch = Array.isArray(x.choices) ? x.choices : [];
  const said = ch.map(c => speakLines_(c).join(' ').replace(/\.$/, ''));
  /* AN ORDERING WHOSE WORDS ALREADY LIST ITS CARDS IS NOT READ THE LIST TWICE. */
  const listed = said.every(c => out.join(' ').indexOf(c) >= 0);
  if (ch.length >= 2 && orderIs_(x)) {
    if (!listed) out.push('Put these in order: ' + said.join(', ') + '.');
  } else if (ch.length >= 2) {
    const need = (x.choiceRight || []).length;
    if (need > 1) out.push('Choose ' + need + '.');
    said.forEach((c, i) => out.push(String.fromCharCode(65 + i) + ': ' + c + (/[?!:]$/.test(c) ? '' : '.')));
  } else {
    let m = null;
    try { m = String(x.accept || '').trim() ? multiOf_(x) : null; } catch (e) { m = null; }
    if (m && m.n >= 2) out.push('Give ' + m.n + ' answers.');
  }
  return out;
}

/* ---------- MATHS, SAID THE WAY A TEACHER SAYS IT -------------------------------------------- */
const SAY_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const SAY_NTH = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'],
  11: ['eleventh', 'elevenths'], 12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths'], 1000: ['thousandth', 'thousandths'] };
const SAY_UNIT = { mm: 'millimetre', cm: 'centimetre', m: 'metre', km: 'kilometre', g: 'gram', kg: 'kilogram',
  ml: 'millilitre', l: 'litre' };
const SAY_ENT = { times: '×', divide: '÷', minus: '−', pound: '£', nbsp: ' ', thinsp: '', frasl: '/', deg: '°', sup2: '²',
  sup3: '³', lt: '<', gt: '>', le: '≤', ge: '≥', ndash: ' – ', mdash: ' – ', hellip: '…', amp: '&', radic: '√', pi: 'π',
  rsquo: "'", lsquo: "'", ldquo: '', rdquo: '', quot: '', eacute: 'é', percnt: '%', plus: '+', equals: '=' };
const isBox_ = s => /^\s*(\?|□|☐|)\s*$/.test(s);
/* "three quarters" where the words are plain, "17 over 40" where they are not; a box to fill is "how many twelfths". */
function sayFrac_(n, d) {
  n = String(n).trim(); d = String(d).trim();
  const nth = /^\d+$/.test(d) ? SAY_NTH[+d] : null;
  if (nth && /^\d+$/.test(n) && +n <= 12) return SAY_NUM[+n] + ' ' + nth[+n === 1 ? 0 : 1];
  if (nth && isBox_(n)) return 'how many ' + nth[1];
  return (isBox_(n) ? 'what' : n) + ' over ' + (isBox_(d) ? 'what' : d);
}
function sayMoney_(p, d) {
  const pounds = Number(String(p).replace(/,/g, '')), pence = d ? Number(d) : 0;
  if (!pounds && d) return pence + (pence === 1 ? ' penny' : ' pence');
  return String(p) + (pounds === 1 ? ' pound' : ' pounds') + (pence ? ' ' + (pence < 10 ? 'oh ' + pence : pence) : '');
}
function sayTime_(h, m) {
  return +m === 0 ? String(+h) + " o'clock" : String(+h) + ' ' + (+m < 10 ? 'oh ' + +m : m);
}
/* HTML IN, SENTENCES OUT: one per paragraph or line, table cells read across with commas. */
function speakLines_(html) {
  let s = String(html == null ? '' : html)
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<span\b[^>]*class=['"][^'"]*\bbox\b[^'"]*['"][^>]*>[\s\S]*?<\/span>/gi, '□')
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&([a-z]+\d?);/gi, (m, n) => (SAY_ENT[n.toLowerCase()] != null ? SAY_ENT[n.toLowerCase()] : ' '));
  /* A FRACTION AS THE CARD SETS IT, <sup>a</sup>⁄<sub>b</sub>, with a whole number in front making it mixed. */
  s = s.replace(/(\d+)?\s?<sup[^>]*>([^<]*)<\/sup>\s*[\/⁄]\s*<sub[^>]*>([^<]*)<\/sub>/gi,
    (m, w, n, d) => ' ' + (w ? w + ' and ' : '') + sayFrac_(n, d) + ' ')
    .replace(/<sup[^>]*>\s*2\s*<\/sup>/gi, '²').replace(/<sup[^>]*>\s*3\s*<\/sup>/gi, '³')
    .replace(/<sup[^>]*>([^<]*)<\/sup>/gi, ' to the power of $1 ')
    .replace(/<\/(p|li|tr|h\d|div)>|<br\s*\/?>/gi, '\n').replace(/<\/t[dh]>/gi, ', ')
    .replace(/<[^>]*>/g, '');
  return s.split('\n').map(sayLine_).filter(Boolean);
}
function sayLine_(t) {
  t = String(t)
    .replace(/[“”"]/g, '').replace(/[‘’]/g, "'")
    /* THE ANSWER LINE AND THE MARKS ARE NOT THE QUESTION. */
    .replace(/\.{3,}|_{3,}|…+/g, ' ')
    .replace(/[\[(]\s*\d+\s*marks?\s*[\])]|^\s*\d+\s*marks?\s*$|^\s*\(?total for question\b.*$/gi, ' ')
    .replace(/(^|[^\d])(\d{1,2})\s*\/\s*(\d{1,3})(?![\d\/])/g, (m, a, n, d) => a + sayFrac_(n, d))
    .replace(/£\s?(\d[\d,]*)(?:\.(\d\d))?/g, (m, p, d) => sayMoney_(p, d))
    .replace(/\b([01]?\d|2[0-3]):([0-5]\d)(?!\d)/g, (m, h, mm) => sayTime_(h, mm))
    .replace(/(\d)\s?([ap])m\b/g, '$1 $2.m.')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 to $2')
    .replace(/(\d)\.(\d+)/g, (m, a, b) => a + ' point ' + b.split('').join(' '))
    .replace(/(\d)\s*(mm|cm|km|kg|ml|m|g|l)([²³])?(?![a-zA-Z])/g, (m, n, u, p) =>
      n + ' ' + (p === '²' ? 'square ' : p === '³' ? 'cubic ' : '') + SAY_UNIT[u] + 's')
    .replace(/\b1 ((?:square |cubic )?[a-z]+metre|gram|kilogram|millilitre|litre)s\b/g, '1 $1')
    .replace(/\b(mm|cm|km|kg|ml)\b/g, u => SAY_UNIT[u] + 's')
    .replace(/°\s?C\b/g, ' degrees Celsius').replace(/°\s?F\b/g, ' degrees Fahrenheit').replace(/°/g, ' degrees')
    .replace(/%/g, ' percent').replace(/²/g, ' squared').replace(/³/g, ' cubed')
    .replace(/√\s*/g, ' the square root of ').replace(/π/g, ' pi ')
    .replace(/(\S)\s*=\s*(□|☐|\?)?\s*$/, '$1 equals what?')
    .replace(/(^|\s)[?□☐](?=\s|$)/g, '$1box').replace(/[□☐]/g, ' box ')
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/\+/g, ' plus ').replace(/−/g, ' minus ')
    .replace(/(\d|\s)-(?=\s|\d)/g, '$1 minus ').replace(/=/g, ' equals ')
    .replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
    .replace(/</g, ' is less than ').replace(/>/g, ' is greater than ')
    .replace(/✓/g, ' tick ').replace(/✗/g, ' cross ').replace(/△/g, ' triangle ')
    .replace(/\s+([,.?!:;)])/g, '$1').replace(/\.{2,}/g, '.').replace(/\(\s+/g, '(').replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();
  if (!t || !/[a-z0-9]/i.test(t)) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.?!:]$/.test(t) ? t : t + '.';
}

/* `on('qa-go')` WAS HERE -- the ↓ tile's handler, which turned forward by the answer's place among its
   question's pages. It went with the tile (see where `To the answer` was, above). */

/* ON THE ANSWER PAGE ITSELF, THE ONE CONTROL, BOTH WAYS -- you are already there. */
on('qa-show', (el) => {
  ansShow_(ansItem_(el.getAttribute('data-k')));
});
on('qa-hide', (el) => {
  ansHide_(ansItem_(el.getAttribute('data-k')));
});

/* `topicBy` WAS HERE — a document by id, falling back to its name. Nothing has a document to look
   up any more; see the note above `questionItems`. */

/* ---------- WHAT A PRINTED COPY COSTS, WHICH HAS A CALLER AGAIN § */
function printOffered_() {
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.print_rate_per_page);
  return !isNaN(rate) && rate > 0;
}
function printPrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0 || !printOffered_()) return null;
  const v = (DATA.constants || {}).vars || {};
  const min = num(v.print_minimum) || 0;
  return Math.max(min, Math.round(n * num(v.print_rate_per_page) * 100) / 100);
}

/* ---------- AND WHAT LAMINATING ONE COSTS § */
function laminatePrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0) return null;
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.laminate_rate_per_page);
  if (isNaN(rate) || rate <= 0) return null;      // rate not set: laminating is off, not free
  const min = num(v.laminate_minimum) || 0;
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

/* WHAT A BASKET LINE ACTUALLY COSTS, in one place. § */
/* ---------- AND A PRINTED LINE IS PRICED THE SAME WAY, WITH ONE EXCEPTION § */
const cartPrint_ = c => {
  if (!c) return null;
  if (Number(c.money) > 0) return Number(c.money);
  return isPrint_(c) ? printPrice(c.pages) : 0;
};
/* NOT YET PRICED — a paper nobody has counted the pages of, or a print when printing is off. It is
   what the basket draws as "tbc" and what the order message says will be priced when it is sent. */
const cartUnpriced_ = c => cartPrint_(c) === null;
const cartMoney_ = c => (cartPrint_(c) || 0)
  + (c && c.laminate ? (laminatePrice(c.pages) || 0) : 0);

/* WHETHER LAMINATING IS OFFERED AT ALL, which is a different question from what one costs. § */
function laminateOffered_() {
  const rate = num(((DATA.constants || {}).vars || {}).laminate_rate_per_page);
  return !isNaN(rate) && rate > 0;
}

/* ---------- `canPrint` CAME BACK WITH THE BUNDLE, AND ITS RULE CAME BACK UNCHANGED § */
const canPrint_ = doc => !!doc && String(doc.printable == null ? '' : doc.printable)
  .trim().toLowerCase() !== 'false';

/* One list, so the four controls act on everything rather than on one half — a filter that silently ignores the shop is a filter nobody trusts twice. § */
/* ---------- THE SAME LIST, NOT THE SAME LIST REBUILT § */
let ITEM_MEMO = { key: null, from: null, items: null };
/* ---------- AND THE SAME MEMO AGAIN FOR THE UNFILTERED LIST § */
let ALL_MEMO = { key: null, from: null, items: null };

/* WHO IS SIGNED IN, AND NOT WHETHER THEY ARE AN ADMIN. § */
const itemMemoKey_ = () => (USER ? (USER.personId || USER.name || 'u') : '-')
  + (typeof bibleFor_ === 'function' && bibleFor_() ? '+bible' : '');
/* NO AGE GATES ON LEARNING (1040): the owner, "no more one-off rules regarding that" — every viewer is shown every card. */

/* ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER § */
function stuffItemsAll_() {
  const key = itemMemoKey_();
  if (ALL_MEMO.from === DATA && ALL_MEMO.key === key) return ALL_MEMO.items;
  const built = stuffItemsRaw_();
  ALL_MEMO = { key: key, from: DATA, items: built };
  return built;
}

/* ---------- FORGET EVERY LIST BUILT FROM `DATA`, FOR A WRITE THAT CHANGED `DATA` IN PLACE § */
function stuffForget_() {
  ALL_MEMO = { key: null, from: null, items: null };
  FUNNEL_MEMO = { key: null, from: null, items: null };
  /* EVERY FINDER'S, not the bound one's: a sign-out that forgot Find's list and left Find 2's would
     hand the next child the last one's Books shelf — which is on both finders' lists (347). */
  finderEach_(() => {
    ITEM_MEMO = { key: null, from: null, items: null };
    FIND_MEMO = { key: null, from: null, items: null, total: 0 };
  });
}

/* ---------- WHERE YOU WERE IN FIND, KEPT FOR A RELOAD § */
function findPlaceKeep_(F) {
  if (!F || !F.id) { Object.keys(FINDERS).forEach(id => findPlaceKeep_(FINDERS[id])); return; }
  try {
    if (typeof AT === 'undefined' || AT !== F.id || typeof draftKeep_ !== 'function') return;
    inFinder_(F, () => {
      const at = (PAGE[F.id] || 0) - stuffFirstResult_();
      const pg = at >= 0 ? (stuffPages_()[at] || null) : null;
      const key = pg && pg.x ? String(pg.x.key || pg.x.name || '') : '';
      /* QUIET (`keepPut_`): a place is a convenience, so it never asks the browser to hold the page. */
      draftKeep_(F.place, 'place', JSON.stringify({ f: STUFF.filters || [], q: STUFF.q || '',
        key: key, part: key ? (pg.part || null) : null, at: Date.now() }), true);
    });
  } catch (e) { /* storage blocked: the place is not kept for next time */ }
}
/* EACH FINDER UNDER ITS OWN NAME — Find's `find:place` as it always was, the second finder's `res:place` — and only the one in front, which is the only one a § */
window.addEventListener('pagehide', () => findPlaceKeep_());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') findPlaceKeep_(); });
/* ONE SHARE FOR EVERY CARD (950): the phone's sheet with the card's `?card=` link, else the link copied and said so. */
const cardByKey_ = k => (k ? stuffItemsAll_().find(i => i && i.key === k) : null), cardUrl_ = k => location.origin + location.pathname + '?card=' + encodeURIComponent(k);
on('card-share', el => { const k = el.getAttribute('data-key') || '', url = cardUrl_(k), name = (cardByKey_(k) || {}).name || brand('name', '@family.');
  if (navigator.share) navigator.share({ title: name, text: name, url }).catch(() => {});
  else try { navigator.clipboard.writeText(url).then(() => toast('Link copied'), () => toast(url)); } catch (e) { toast(url); } });
/* ARRIVING ON ONE, before any kept place; the link then leaves the address, so a reload keeps its own place. */
function openSharedCard() { let x = null;
  try { x = cardByKey_(new URLSearchParams(location.search).get('card')); if (x) history.replaceState(null, '', location.pathname + location.hash); } catch (e) { oops_(e, 'find:openSharedCard'); }
  if (x) finderOpen_(x, null, null);
  return !!x; }
let FIND_PLACE_TRIED = false;
function findPlaceBack_(F) {
  if (!F || !F.id) { if (openSharedCard()) return; Object.keys(FINDERS).forEach(id => findPlaceBack_(FINDERS[id])); return; }
  if (typeof draftRead_ !== 'function') return;
  inFinder_(F, () => {
    if (FIND_PLACE_TRIED) return;
    FIND_PLACE_TRIED = true;
    try {
      const raw = draftRead_(F.place, 'place');
      if (raw === null) return;
      const p = JSON.parse(raw);
      if (!p || typeof p !== 'object' || !(Date.now() - (Number(p.at) || 0) < AWAY_AGAIN)) return;
      if (AT !== F.id || (STUFF.filters || []).length || STUFF.q) return;
      finderSet_(F, { filters: (Array.isArray(p.f) ? p.f : [])
        .filter(f => f && typeof f === 'object' && typeof f.field === 'string')
        .map(placeChipMoved_)
        .filter(f => !placeChipDead_(f)), q: typeof p.q === 'string' ? p.q : '' });
      if (!p.key) return;
      const pages = stuffPages_();
      const mine = pg => pg && pg.x && String(pg.x.key || pg.x.name || '') === p.key;
      let i = pages.findIndex(pg => mine(pg) && (pg.part || null) === (p.part || null));
      /* A PLACE KEPT ON A PART THE ITEM NO LONGER HAS -- a figure page (`fig`, `sfigN`, `use`, `nofig`), all
         gone into their cards on 18 Oct (356) -- comes back on that item's card, not on page one. */
      if (i < 0) i = pages.findIndex(pg => mine(pg) && !pg.part);
      if (i < 0) { i = pages.findIndex(pg => (pg.parts || []).some(s => String(s.key || '') === p.key)); if (i >= 0 && String(pages[i].x.key || '') !== p.key) Q_SCROLL_TO = p.key; }
      if (i >= 0) goPage(F.id, stuffFirstResult_() + i, true);
    } catch (e) { /* a kept place that no longer matches stays on page one */ }
  });
}
/* ---------- A KEPT CHIP NOTHING WILL EVER ANSWER § */
const RETIRED_SHELVES = ['@family. textbooks', 'Icons'];
/* AN ANSWER THAT WENT, by its facet: the textbooks shelf (347), and `Bundles`, which stopped being a kind to ask for (396). */
const RETIRED_ANSWERS = { shelf: RETIRED_SHELVES, kindLabel: ['Bundles', 'Icons', 'Inserts', 'Content'], documentType: ['Insert'] };
/* AN ANSWER THAT WAS RENAMED (504): the `Books` shelf is `Writings`, so a kept place on it stands on Writings. */
const MOVED_ANSWERS = { shelf: { Books: BIBLE_SHELF } };
const placeChipMoved_ = f => (f && MOVED_ANSWERS[f.field] && MOVED_ANSWERS[f.field][f.value]
  ? Object.assign({}, f, { value: MOVED_ANSWERS[f.field][f.value] }) : f && f.field === 'wText' && !f.any ? placeTextMoved_(f) : f);
/* A TRANSLATION KEPT AS "English, King James Version (1611)" (before 546) is its translation now, or its language for an original. */
function placeTextMoved_(f) {
  const lang = writingLanguageOf_(f.value), v = writingVersionOf_(f.value);
  if (WRITING_LANGUAGES.indexOf(lang) < 0 || (!v && lang !== f.value)) return f;
  return v ? Object.assign({}, f, { value: v }) : { field: 'wLanguage', value: lang };
}
function placeChipDead_(f) {
  if (!f || typeof f.field !== 'string') return true;
  if (f.field === 'shelf' && f.value === BIBLE_SHELF) return typeof bibleFor_ === 'function' && !bibleFor_();
  if (RETIRED_FACETS[f.field]) return true;
  /* A RANGE CHIP (`bucket`) — the groupings went in 290 and their tables in 396, so nothing answers one. */
  if (f.bucket) return true;
  /* A SHELF THAT WENT. `@family. textbooks` held the books, and each chapter is a content card now with no shelf at all — so a kept place standing on it would come § */
  if ((RETIRED_ANSWERS[f.field] || []).indexOf(f.value) !== -1) return true;
  return !facetBy(f.field) && Array.isArray(DATA.facets) && DATA.facets.length > 0;
}

/* ---------- ONE LIST FOR BOTH FINDERS, COUNTED ONCE § */
let FUNNEL_MEMO = { key: null, from: null, items: null };
function stuffItems() {
  const key = itemMemoKey_();
  if (!(FUNNEL_MEMO.from === DATA && FUNNEL_MEMO.key === key)) {
    FUNNEL_MEMO = { key: key, from: DATA, items: stuffItemsBuild_() };
  }
  /* THE WRITINGS THIS FUNNEL STARTED WITH (520): an index that comes after an answer joins at the next fresh start. */
  const admit = writingAdmit_();
  if (ITEM_MEMO.from === DATA && ITEM_MEMO.key === key + '|' + admit) return ITEM_MEMO.items;
  /* ONE LIST STILL, while a finder has everything that came; a narrower set is made once and shared by every finder on it. */
  const cut = FUNNEL_MEMO.cut || (FUNNEL_MEMO.cut = {});
  const items = admit === writingNow_() ? FUNNEL_MEMO.items : cut[admit] || (cut[admit] = FUNNEL_MEMO.items.filter(x => writingAdmitted_(x, admit)));
  ITEM_MEMO = { key: key + '|' + admit, from: DATA, items: items };
  return ITEM_MEMO.items;
}

/* ---------- BOOKING IS NOT IN THE FUNNEL, AND THIS IS THE TOOLS AND GAMES DECISION AGAIN § */
/* ---------- AND THE SHOP LEFT WITH IT, ONCE IT HAD A COLUMN TO GO TO § */
const FUNNEL_NOT_FOR = [];

function stuffItemsBuild_() {
  return stuffItemsAll_().filter(x => {
    /* SIGNED OUT, ONE ANSWER (C+): Settings, which holds Sign in and Join — the same Find, never a second front door. */
    if (!USER && (typeof ruleOn_ !== 'function' || ruleOn_('finder-members')) && typeof findSignedOut_ === 'function') return findSignedOut_(x);
    /* READ EXACTLY AS THE `forLabel` FACET READS IT — `x.groups || kindOf_(x).group`, through `asList_` — so what leaves the funnel is what would have answered § */
    const g = asList_(x.groups || kindOf_(x).group);
    if (g.length && g.every(k => FUNNEL_NOT_FOR.indexOf(k) >= 0)) return false;
    /* AND NOTHING ELSE: BOTH FINDERS CARRY EVERYTHING (347). § */
    return true;
  });
}

/* Find's people, places, widgets, doors and subjects: the first part of stuffItemsRaw_. */
function findPeopleItems_() {
  return [
    /* ---------- PEOPLE, PLACES AND SUBJECTS § */
    ...(DATA.tutors || []).filter(t => t.title).map(t => ({
      kind: 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
      cost: priced_(t.rate), off: t.listed === false, row: t,
    })),
    ...(DATA.venues || []).filter(v => v.title).map(v => ({
      kind: 'venue', name: v.title, key: v.title, sub: v.subtitle || '', image: v.image,
      cost: priced_(v.bestRate), row: v, borough: v.borough || v.city || '',
      venueArea: v.borough || v.city || '', venueFor: v.focus || [],
      venueSize: [Number(v.maxCapacity) ? 'Up to ' + v.maxCapacity : '', (v.rooms || []).length ? (v.rooms || []).length + ' room' + ((v.rooms || []).length === 1 ? '' : 's') : ''].filter(Boolean),
    })),
    /* The widgets, findable like everything else. § */
    /* ---------- THE WIDGETS ARE IN THE FUNNEL AGAIN (790): each one data/settings/widgets-in-find.json names is a card, its kind's group (Tools, Games) its first answer. */
    ...(typeof allWidgets === 'function' && typeof widgetInFind_ === 'function' ? findWidgetList_() : []).map(w => ({
      kind: w.kind, name: w.name || w.title || w.label || String(w.id), sub: w.what || '', image: '',
      groups: w.groups, widget: w, text: [w.name, w.what, w.label].filter(Boolean).join(' '),
      /* A SHOP WIDGET (the Basket) IS ITS OWN ANSWER UNDER SHOP (batch C), beside the things' categories. */
      shopKind: w.kind === 'shop' ? (w.name || '') : '',
    })).filter(x => typeof TIER_OFF_WIDGETS === 'undefined' || TIER_OFF_WIDGETS.indexOf(String(x.widget.id)) === -1),
    ...soonItems_(),
    /* POSTS, MESSAGES, PROFILES, SETTINGS AND VIDEOS (batch C): their items and menus are find-doors.js's. */
    ...(typeof doorItems_ === 'function' ? doorItems_() : []),
    ...(typeof rankAtLeast_ === 'function' && rankAtLeast_('admin') ? [{ kind: 'health', name: 'Checks', key: 'health:checks', sub: 'Settings', image: '', which: 'checks', settingFor: 'Business',
      text: 'checks site health business checker owner questions what’s missing' }] : []),
    ...(typeof subjectRows === 'function' ? subjectRows() : []).map(x => ({
      kind: 'subject', name: x.name, key: x.name, sub: '', image: '',
      subject: x.name, row: x,
    })),
  ];
}
/* Your sessions, the levels and the shop, in stuffItemsRaw_'s order. */
function findMineItems_() {
  return [
    /* ---------- LEVELS § */
    /* ---------- YOU, ONE ROW, ONLY WHEN SIGNED IN --------------------------------------------
       Everything on it is already on this device because it is yours — see the note on the `me`
       kind above for why nobody else joins it. */
    /* ---------- WHAT YOU ARE IN, WHAT YOU ARE WAITING FOR, AND WHAT IS DONE § */
    ...(typeof myJobs_ === 'function' ? myJobs_() : []).map(j => ({
      /* ONE KIND FOR ALL OF THEM — see the note on `receipt` above. `jobIsPast_` and `isWaitJob_`
         still decide how a card DRAWS and how the widgets split their lists; they no longer decide
         which answer a session lives under. */
      kind: 'receipt',
      name: [j.subject || 'Session', j.level].filter(Boolean).join(' · '),
      key: 'job:' + (j.id || j.jobId || ''),
      sub: [j.tutor, j.venue, j.weekday].filter(Boolean).join(' · '),
      cost: priced_(j.price), subject: j.subject || '', row: j,
      bandValue: j.level || '',
    })),
    ...(typeof levelRows === 'function' ? levelRows() : []).map(x => ({
      kind: 'level', name: x.name, key: 'lvl:' + x.name,
      /* The subjects, under the name, so the list is readable before anything is opened. */
      sub: (x.subjects || []).join(' · '), image: '',
      row: x,
    })),
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      /* A SHOP ROW IS THE ONE PLACE `0` GENUINELY MEANS FREE — it is priced, and the price is
         nought. Everything else that used to write `cost: 0` was saying "I have no price", which
         is a different answer; see `priced_`. */
      /* ---------- AND A BLANK PRICE CELL IS NOT A PRICE OF NOUGHT, ON THIS MAPPER TOO § */
      cost: priced_(x.price), slot: x.slot || '',
      /* PENCE ARE MONEY (463): the basket takes them as money (`cartPrice_`), so the card says £, not credits. */
      pence: String(x.unit || '').trim() === 'p',
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH. § */
      wearable: isWearable(x),
      level: Number(x.level) || 0,
      artId: x.artId || '',
      /* ITS TAGS (499): "these need to have all the tags instead ... way more helpful ... more automatable" — read off the row's own fields. */
      ...shopTags_(x),
    })),
  ];
}
/* Fighters and bouts, which answer the funnel with PE as the subject. */
function findBoxingItems_() {
  return [
    /* A resource costs nothing, and the zero is written here rather than left undefined — so
       every sort, filter and label downstream sees a number and not a hole. */
    /* ---------- QUESTIONS, AS PARTS § */

    /* A FIGHTER ANSWERS THE FUNNEL'S QUESTIONS IN HIS OWN WORDS. § */
    ...(DATA.boxers || []).filter(b => b.name).map(b => ({
      kind: 'people', name: b.name, key: 'bx:' + (b.id || b.name), pixId: b.id,
      sub: [b.bestDivision, b.country].filter(Boolean).join(' · '), image: '',
      born: personYear_(b.dob), died: personYear_(b.dod), from: b.country || '', roles: ['Boxer'], histKind: 'People',
      /* ---------- A DIVISION IS NOT A SUBJECT § */
      /* WHICH OF THE TWO, asked before the weight. § */
      boxKind: 'Fighters', shelf: 'Boxing',
      subject: 'Physical Education', division: divisionOf_(b.bestDivision), row: b,
    })),

    /* A BOUT ANSWERS THE FUNNEL LIKE A BOXER DOES: PE as the subject (499), the weight as the
       division. Everything school-shaped stays blank, and blank is what keeps a fight out of a
       list of past papers. */
    ...(DATA.fights || []).map(f => ({
      kind: 'fight', name: f.a + ' v ' + f.b,
      key: 'ft:' + (f.id || f.a + f.b + f.date),
      sub: [(f.date || '').slice(0, 4), f.division, f.venue].filter(Boolean).join(' · '),
      image: '',
      boxKind: 'Fights', shelf: 'Boxing',
      subject: 'Physical Education', division: divisionOf_(f.division), row: f,
      year: (f.date || '').slice(0, 4),
    })),
  ];
}
/* Practicals, projects, textbook chapters and exam inserts. */
function findStudyItems_() {
  return [
    /* ---------- THE QUESTIONS, AND NOT THE DOCUMENTS THEY CAME OUT OF § */
    /* ---------- THE PRACTICALS § */
    ...(DATA.practicals || []).map(p => ({
      kind: 'practical', name: p.name, key: 'pr:' + p.id,
      sub: [p.subject, p.required ? 'Required practical' : 'Extra',
            p.minutes ? p.minutes + ' min' : ''].filter(Boolean).join(' · '),
      image: '',
      subject: p.subject, topics: p.topics, level: p.level,
      /* IN THE CARD'S SPELLING, as `projectType` is on a project: the facet reads this, so its answer,
         its chip and the card's tag say `Experiment` and never the file's `experiment`. */
      practicalType: PRAC_TYPE[p.practicalType] || p.practicalType || '',
      examBoard: p.board, company: p.board,
      /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU, in the column that already means that. A practical
         needing a lab is the same kind of fact as a question needing a compass, and `needsOf_`
         already reads `needs` as a comma-list. */
      needs: [p.venue === 'lab' ? 'Lab' : '', p.feasible === 'needs a lab' ? 'Lab' : '']
             .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      /* EVERY WORD OF THE GUIDE, so the thing you are looking for is what you can search by. § */
      text: practicalText_(p) + ' ' + topicAtoms_(p.topics).join(' '),
      row: p,
    })),

    /* ---------- THE PROJECTS § */
    ...(DATA.projects || []).map(p => ({
      kind: 'project', name: p.name, key: 'pj:' + p.id,
      sub: [p.subject, p.sessions ? p.sessions + ' sessions' : ''].filter(Boolean).join(' · '),
      image: '',
      subject: p.subject, topics: p.topics, level: p.level,
      /* ---------- PROJECT OR COURSEWORK, ASKED ONCE `Projects` IS CHOSEN § */
      projectType: projType_(p),
      /* A BOARD WHERE THE ROW NAMES ONE, in the column a practical's board already fills -- so a second coursework under another board is told apart by the Exam board § */
      examBoard: p.board || '',
      text: projectText_(p) + ' ' + topicAtoms_(p.topics).join(' '),
      row: p,
    })),

    /* ---------- THE CONTENT CARDS: ONE ITEM PER CHAPTER OF data/textbooks.json § */
    ...[].concat(...(DATA.textbooks || []).map(b => (b.chapters || []).map(c => contentItem_(b, c)))),

    /* ---------- THE EXAM INSERTS (455) */
    ...(DATA.inserts || []).map(insertItem_),
  ];
}
function stuffItemsRaw_() {
  return [
    ...findPeopleItems_(),
    ...findMineItems_(),
    ...findBoxingItems_(),
    ...findStudyItems_(),

    /* ---------- THE HISTORY DATABASE (459) */
    ...(typeof HIST_DB === 'undefined' ? [] : HIST_DB).flatMap(t => (DATA[t.file] || []).flatMap(r => histItems_(t.kind, r))),
    ...histTimelines_(),

    /* ---------- THE BIBLE, FOR AN ADMIN AND NOBODY ELSE § */
    ...bibleItems_(),

    /* ---------- THE TALMUD (473), once its index has come */
    ...(typeof talmudItems_ === 'function' ? talmudItems_() : []),

    /* ---------- THE QURAN (490), one item a verse, once its index has come */
    ...(typeof quranItems_ === 'function' ? quranItems_() : []),
    ...(typeof hadithItems_ === 'function' ? hadithItems_() : []),
    ...(typeof worksItems_ === 'function' ? worksItems_() : []),
    ...(typeof textsItems_ === 'function' ? textsItems_() : []),
    ...(typeof pdtextsItems_ === 'function' ? pdtextsItems_() : []),
    ...(typeof orthoItems_ === 'function' ? orthoItems_() : []),
    ...(typeof hymnsItems_ === 'function' ? hymnsItems_() : []),
    ...(typeof mechItems_ === 'function' ? mechItems_() : []),
    ...(typeof chemItems_ === 'function' ? chemItems_() : []),

    /* ---------- `DATA.films` WAS MAPPED HERE, ONE ITEM PER FILM OR SERIES, AND IS NOT ANY MORE § */

    ...questionItems(),
  ].filter(x => !x || OFF_KINDS[x.kind] === undefined).concat(offKindCards_());
}
/* SWITCHED OFF (owner, 4 Nov): these kinds' items leave Find; each area keeps one Coming soon card under its own answer. */
const OFF_KINDS = {};
function offKindCards_() {
  const seen = {};
  return Object.keys(OFF_KINDS).filter(k => !seen[OFF_KINDS[k]] && (seen[OFF_KINDS[k]] = true)).map(k => ({
    kind: 'off' + OFF_KINDS[k], name: OFF_KINDS[k], sub: OFF_KINDS[k], image: '', key: 'off:' + OFF_KINDS[k], soon: 'column', soonId: OFF_KINDS[k].toLowerCase(), text: OFF_KINDS[k] }));
}

/* THE YEAR OF A THING, from the column or from the wave. § */
/* `topicOf_` — WHAT THE QUESTION IS ABOUT, WHICH THE FUNNEL HAD NEVER ASKED. § */
/* A COMMA IS A LIST SEPARATOR AND NOTHING ELSE IS. Same shape as `keystage`'s split, kept as a
   helper because two places need it and the second is the search haystack. */
const topicAtoms_ = v => String(v == null ? '' : v).split(',').map(s => s.trim()).filter(Boolean);

/* ---------- THE VOTE MOVED, AND IT NOW APPLIES TO EVERY QUESTION § */
/* Whether this item's topic is shown in the funnel at all — see `topicArea WAS HERE` among the
   facets. A practical or a project is ABOUT its topic by construction, so it answers. */
/* AND NO QUESTION AT ALL NOW, the 1st Class Maths sheets included. § */
function topicShown_(x) {
  return !isQ_(x);
}
function topicOf_(x) {
  return topicAtoms_(x && ((x.row && x.row.topics) || x.topics));
}

/* ---------- THE TOPIC TREE WAS READ HERE § */

/* THE LIBRARY'S LEVELS, ONE TABLE (R4): each level's key stages, tiers, other spellings, and rung on the ladder a range is
   read along (0: never in a range). check/schema.js reads this very literal. */
const LEVEL_TABLE = [
  /* ---------- `KS2 SATs` IS TWO FACTS, AND THE LEVEL IS ONE OF THEM § */
  { level: 'SATs',        rung: 1, stages: ['KS1', 'KS2'], tiers: [], says: ['KS1', 'KS2', 'KS1 SATs', 'KS2 SATs'] },
  { level: '11+',         rung: 0, stages: ['KS2'],        tiers: [], says: [] },
  { level: 'KS3',         rung: 2, stages: ['KS3'],        tiers: [], says: [] },
  { level: 'GCSE',        rung: 3, stages: ['KS4'],        tiers: ['Foundation', 'Higher', 'Foundation Plus', 'Higher Plus'], says: ['KS4'] },
  { level: 'Functional Skills L2', rung: 0, stages: [],    tiers: [], says: [] },
  { level: 'Level 2 Certificate', rung: 0, stages: ['KS4'], tiers: [], says: ['L2 Certificate'] },
  { level: 'A-Level',     rung: 4, stages: ['KS5'],        tiers: [], says: ['Alevel', 'A level', 'KS5'] },
  { level: 'AS',          rung: 0, stages: ['KS5'],        tiers: [], says: ['AS level', 'AS-level'] },
  { level: 'Theory test', rung: 0, stages: [],             tiers: [], says: [] },
];
