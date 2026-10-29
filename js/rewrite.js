/* @family. — rewrite.js THE REWRITE COACH (509, 519), admin only for now: the facts stay, only the wording changes. The phone does the substance check itself; the AI only judges meaning. */

/* THE SESSION'S WORK, IN MEMORY ONLY: never localStorage, never a sheet row — gone when the page goes (the owner's privacy rule, 509). */
const RW_FRESH = () => ({ text: '', facts: [], vocab: [], tips: [], step: 'paste', mine: [], free: '', retry: null, peek: false, peeks: 0,
  ai: null, note: '', sim: null, said: '', busy: false, at: 0, left: 0 });
const RW = RW_FRESH();
const RW_TARGET = 20, RW_FACTS_MAX = 12, RW_TERMS_MAX = 3;

/* ---------- THE SUBSTANCE SCANNER (519): no AI. A word's weight is its rarity: stopwords drop, the commonest English words weigh little, anything else is substance ---------- */
const RW_STOP = new Set(('a about above after again against all am an and any are as at be because been before being below between both but by '
  + 'can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in '
  + 'into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should '
  + 'so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were '
  + 'what when where which while who whom why will with would you your yours yourself also may might must shall s t can\'t don\'t it\'s '
  + 'isn\'t aren\'t wasn\'t weren\'t won\'t didn\'t doesn\'t one').split(' '));
/* ROUGHLY THE 1,500 COMMONEST ENGLISH WORDS (stems are taken from them, so plurals and tenses follow): what is in here is wording, what is not is substance. */
const RW_COMMON_WORDS = ('able accept accord account across act action active activity actual actually add address admit adult affect afraid after '
  + 'afternoon age ago agree ahead air allow almost alone along already although always amount animal another answer anyone anything appear '
  + 'apply approach area argue arm around arrive art article ask attack attention away baby back bad bag ball bank bar base basic bear beat '
  + 'beautiful became become bed begin behind believe best better big bill bit black blood blue board body book born boy break bring brother '
  + 'build building business buy call came campaign cannot capital car card care career carry case cat catch cause cell center central '
  + 'centre century certain certainly chair challenge chance change character charge check child children choice choose church citizen city '
  + 'civil claim class clear clearly close coach cold collection college colour color come common community company compare complete concern '
  + 'condition consider contain continue control cost could country couple course court cover create crime cultural culture cup current '
  + 'customer cut dark data daughter day dead deal death debate decade decide decision deep defense degree describe design despite detail '
  + 'determine develop development die difference different difficult dinner direction director discover discuss disease doctor dog door '
  + 'draw dream drive drop drug due early earth easy eat economic economy edge education effect effort eight either election else employee end '
  + 'energy enjoy enough enter entire environment environmental especially establish even evening event ever every everybody everyone '
  + 'everything evidence exactly example executive exist expect experience expert explain eye face fact factor fail fall family far fast father '
  + 'fear federal feel feeling field fight figure fill film final finally financial find fine finger finish fire firm first fish five floor fly '
  + 'focus follow food foot force foreign forget form former forward four free friend front full fund future game garden gas general '
  + 'generation get girl give glass go goal good government great green ground group grow growth guess gun guy hair half hand hang happen happy '
  + 'hard head health hear heart heat heavy help herself high himself history hit hold home hope hospital hot hotel hour house however huge '
  + 'human hundred husband idea identify image imagine impact important improve include including increase indeed indicate individual industry '
  + 'information inside instead institution interest interesting international interview investment involve issue item job join keep key kid '
  + 'kill kind kitchen know knowledge land language large last late later laugh law lawyer lay lead leader learn least leave left leg legal less '
  + 'let letter level lie life light like likely line list listen little live local long look lose loss lot love low machine magazine main '
  + 'maintain major majority make man manage management manager many market marriage material matter maybe mean measure media medical meet '
  + 'meeting member memory mention message method middle might military million mind minute miss mission model modern moment money month '
  + 'morning mother mouth move movement movie much music myself name nation national natural nature near nearly necessary need network never '
  + 'new news newspaper next nice night none north note nothing notice number occur offer office officer official often oil ok old open '
  + 'operation opportunity option order organization others outside owner page pain painting paper parent part participant particular '
  + 'particularly partner party pass past patient pattern pay peace people per perform performance perhaps period person personal phone '
  + 'physical pick picture piece place plan plant play player point police policy political politics poor popular population position '
  + 'positive possible power practice prepare present president pressure pretty prevent price private probably problem process produce product '
  + 'production professional professor program programme project property protect prove provide public pull purpose push put quality question '
  + 'quickly quite race radio raise range rate rather reach read ready real reality realize really reason receive recent recently recognize '
  + 'record red reduce reflect region relate relationship religious remain remember remove report represent republican require research '
  + 'resource respond response responsibility rest result return reveal rich right rise risk road rock role room rule run safe said sale '
  + 'save say scene school science scientist score sea season seat second section security see seek seem sell send senior sense series serious '
  + 'serve service set seven several sex sexual shake share shoot short shot show side sign significant similar simple simply since sing '
  + 'single sister sit site situation six size skill skin small smile social society soldier somebody someone something sometimes son song '
  + 'soon sort sound source south southern space speak special specific speech spend sport spring staff stage stand standard star start state '
  + 'statement station stay step still stock stop store story strategy street strong structure student study stuff style subject success '
  + 'successful suddenly suffer suggest summer support sure surface system table take talk task tax teach teacher team technology television '
  + 'tell ten tend term test thank thing think third thought thousand threat three throughout throw thus time today together tonight top total '
  + 'tough toward towards town trade traditional training travel treat treatment tree trial trip trouble true truth try turn tv two type '
  + 'understand unit until upon us use usually value various view violence visit voice vote wait walk wall want war watch water way weapon wear '
  + 'week weight well west western whatever whether white whole wide wife win wind window wish within without woman wonder word work worker '
  + 'world worry write writer wrong yard yeah year yes yet young yourself '
  /* AND THE EVERYDAY WORDS OF SCHOOL WRITING, so "important", "called" and "because" never pass for substance. */
  + 'able above according across actually add added addition additional affect afterwards against ago aim allowed alongside amongst ancient '
  + 'appear approximately around arrange aspect associate assume available average avoid aware based basis became begin beginning believed '
  + 'belong beneath beside besides beyond billion born bottom brief bright broad brought built called carried causes caused certain chief '
  + 'closely combined comes coming commonly completely consist consisting considered constant contains continued correct created daily '
  + 'decrease depend depends described despite directly divided double during earlier easily effective eighteen eleven elsewhere end enormous '
  + 'entirely equal essential etc eventually exact except extra extremely fairly famous fewer fifteen fifty finding fourth frequently full '
  + 'fully gave given gives giving gradually greater greatest hardly helps highly huge hundreds ideal immediately important impossible '
  + 'increasingly inner instance known largely larger largest lasting latter leads leading least lengthy less lower main mainly makes making '
  + 'manner many massive meaning means meanwhile million millions mostly much namely nearby neither nine nineteen ninety normal normally '
  + 'numerous object obvious obviously often older once ones ongoing opposite ordinary original otherwise outer overall particular partly '
  + 'percent possibly previous previously primary principal probably produce produced proper quick quite rapid rapidly rare rarely regular '
  + 'related relatively remaining result results roughly second seen separate seventy shape similarly sixty slightly slow slowly smaller '
  + 'smallest sometimes soon specific steady still strongly sudden sufficient surround surrounding taken takes thirty though thousands three '
  + 'thus tiny together top total towards twelve twenty twice type typical typically ultimately unless unlike unusual upper useful uses using '
  + 'usual various vast vital whereas wherever widely within worldwide worse worst yet zero '
  /* AND THE IRREGULAR FORMS A STEM CANNOT REACH, so "made" and "written" are wording like "make" and "write". */
  + 'began begun brought chosen done drawn driven fallen felt found gone held kept knew led lost made meant met paid sent shown sold spent '
  + 'stood taught told understood went written wrote longer valuable oldest earliest latest newest survive surviving').split(' ');
/* LIGHT STEMMING, the same on both sides: a plural, a tense or a -tion ending is the same word of substance. */
function rwStem_(w) {
  let s = String(w || '').toLowerCase().replace(/’/g, "'").replace(/'s$/, '');
  if (/^\d/.test(s)) return s;
  const cuts = [['ational', 'ate'], ['ations', 'ate'], ['ation', 'ate'], ['itions', 'it'], ['ition', 'it'], ['tions', 't'], ['tion', 't'],
    ['ments', ''], ['ment', ''], ['ness', ''], ['ings', ''], ['ing', ''], ['ies', 'y'], ['ied', 'y'], ['ly', ''], ['ed', ''], ['es', ''], ['s', '']];
  for (const [end, to] of cuts) {
    if (s.length - end.length >= 3 && s.endsWith(end) && !(end === 's' && /(ss|us|is)$/.test(s))) { s = s.slice(0, -end.length) + to; break; }
  }
  return s.replace(/(.)\1$/, '$1').replace(/e$/, '');
}
const RW_COMMON = new Set(RW_COMMON_WORDS.map(rwStem_));
/* A NUMBER, A DATE OR A NAME IS SUBSTANCE WHATEVER ITS RARITY; a name is a capital not at the start of a sentence. */
function rwWeigh_(w, text, at) {
  const lw = w.toLowerCase();
  if (RW_STOP.has(lw)) return 0;
  if (/\d/.test(w)) return 3;
  const before = text.slice(Math.max(0, at - 3), at);
  if (/^[A-Z]/.test(w) && at > 0 && !/[.!?:]\s*$|^\s*$/.test(before) && !/\n\s*$/.test(before)) return 3;
  if (/^[A-Z]{2,}$/.test(w)) return 3;
  return RW_COMMON.has(rwStem_(w)) || lw.length < 3 ? 0.5 : 2;
}
/* THE TEXT'S SUBSTANCE: every word with a weight, its stem and where it stands. */
function rwSubstance_(text) {
  return rwWords_(text).map(x => {
    const raw = String(text).slice(x.at, x.end);
    return { w: raw, stem: rwStem_(x.w), at: x.at, end: x.end, weight: rwWeigh_(raw, String(text), x.at) };
  }).filter(x => x.weight > 0);
}
/* PROTECTED TERMS COME FROM THE SCANNER, NOT THE AI: each run of rare words, numbers or names in the source, kept verbatim. */
/* With `heavy`, only the names, numbers and terms of several words: a capital that only ever starts a sentence is not a name. */
function rwTermsOf_(text, heavy) {
  const t = String(text || ''), words = rwWords_(t), out = [], seen = new Map();
  let run = [];
  const flush = () => {
    if (run.length) {
      const term = t.slice(run[0].at, run[run.length - 1].end), k = term.toLowerCase();
      const big = run.length > 1 || rwWeigh_(term, t, run[0].at) >= 3;
      if (!seen.has(k)) { seen.set(k, { term, big }); out.push(k); } else if (big) seen.get(k).big = true;
    }
    run = [];
  };
  words.forEach((x, i) => {
    const raw = t.slice(x.at, x.end), gap = i && run.length ? t.slice(words[i - 1].end, x.at) : ' ';
    /* A NAME AND A WORD ARE TWO TERMS: "New Testament" and "quote", never "New Testament quote" (519). */
    const kin = run.length && /^[a-z]/.test(t.slice(run[0].at, run[0].end)) === /^[a-z]/.test(raw);
    /* A NAME RUNS ON THROUGH "of" TO A NAME: "Letter of Aristeas" is one term. */
    const nx = words[i + 1], last = run.length && t.slice(run[run.length - 1].at, run[run.length - 1].end);
    const ofName = /^[A-Z]/.test(last || '') && /^of$/.test(raw) && nx && /^[A-Z]/.test(t.slice(nx.at, nx.end)) && /^ $/.test(t.slice(x.end, nx.at));
    /* A DOING WORD ENDS A RUN: "scholars" and "translated", never "scholars translated". */
    const verb = /^[a-z]/.test(raw) && /(?:ed)$/.test(raw);
    if ((ofName || (rwWeigh_(raw, t, x.at) >= 2 && kin && !verb)) && /^[\s-]*$/.test(gap) && run.length < 4) run.push(x);
    else { flush(); if (rwWeigh_(raw, t, x.at) >= 2) run.push(x); }
  });
  flush();
  return out.map(k => seen.get(k)).filter(x => !heavy || x.big).map(x => x.term);
}
/* A FACT IS SMALL (519): at most RW_SUBS_MAX words of substance and RW_FACT_TERMS names, numbers or compound terms, or it is too much to hold. A single rare word is one of the twelve. */
const RW_SUBS_MAX = 12, RW_FACT_TERMS = 3, RW_SUBS_MIN = 3;
const rwSize_ = f => new Set(rwSubstance_(f).map(x => x.stem)).size;
const rwHeavy_ = f => rwTermsOf_(f, true);
const rwFits_ = f => rwSize_(f) <= RW_SUBS_MAX && rwHeavy_(f).length <= RW_FACT_TERMS;
/* A FACT TOO BIG IS CUT AT A CLAUSE, then a phrase, then between words as a last resort: into as few pieces as fit, as even as they can be, so no scrap is left. */
function rwCut_(s) {
  s = String(s || '').trim();
  if (!s || rwFits_(s)) return s ? [s] : [];
  const grow = (pieces, cap) => {
    const out = [];
    let cur = '';
    pieces.forEach(p => { const c = cur ? cur + ' ' + p : p; if (cur && (!rwFits_(c) || rwSize_(c) > cap)) { out.push(cur); cur = p; } else cur = c; });
    if (cur) out.push(cur);
    return out;
  };
  const even = (whole, pieces) => {
    const most = grow(pieces, RW_SUBS_MAX);
    for (let cap = Math.ceil(rwSize_(whole) / most.length); cap < RW_SUBS_MAX; cap++) { const g = grow(pieces, cap); if (g.length === most.length) return g; }
    return most;
  };
  const parts = even(s, s.split(/(?<=[,:—–])\s+|\s+(?=(?:and|but|which|who|whereas|while|because|although|when|where|after|before|from|by|into|with|for|in|of)\s)/i));
  return parts.reduce((a, p) => a.concat(rwFits_(p) ? [p] : even(p, p.split(/\s+/))), []).map(p => p.trim()).filter(Boolean);
}
const rwTrim_ = f => String(f).replace(/[,;:—–]\s*$/, '').trim();
/* A LONG TEXT IS NOT DUMPED (519): the RW_FACTS_MAX most substantial facts, in the text's order; the rest are counted for next time. */
function rwPick_(facts) {
  const all = facts || [];
  if (all.length <= RW_FACTS_MAX) return { facts: all.slice(), left: 0 };
  const w = f => rwSubstance_(f).reduce((n, x) => n + x.weight, 0);
  const keep = new Set(all.map((f, i) => ({ i, w: w(f) })).sort((a, b) => b.w - a.w || a.i - b.i).slice(0, RW_FACTS_MAX).map(x => x.i));
  return { facts: all.filter((_, i) => keep.has(i)), left: all.length - RW_FACTS_MAX };
}
const rwVerby_ = t => /(?:ed|ing|ly)$/i.test(String(t).split(/\s+/).pop());
const rwRe_ = t => new RegExp('(^|[^A-Za-z0-9À-ɏ])' + String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9À-ɏ])', 'gi');
const RW_ASK_WORDS = 8;
/* "in Greek" IS A LANGUAGE, NOT A PLACE: never asked "Where?". */
const RW_TONGUES = /^(?:Greek|Hebrew|Latin|Aramaic|Arabic|Coptic|Syriac|Sanskrit|English|French|Spanish|German|Italian|Portuguese|Russian|Chinese|Japanese|Welsh|Gaelic|\w+(?:ish|ese))$/;
/* THE FACT WITH ITS ANSWER HIDDEN: each hidden term a gap, and no more than RW_ASK_WORDS words of context, taken nearest the gaps. */
function rwGap_(fact, hide) {
  let g = String(fact);
  hide.slice().sort((x, y) => y.length - x.length).forEach(t => { g = g.replace(rwRe_(t), '$1___'); });
  const toks = g.replace(/___(?:\s+___)+/g, '___').split(/\s+/).filter(Boolean), gap = x => x.includes('___');
  const keep = new Set(toks.map((x, i) => (gap(x) ? i : -1)).filter(i => i >= 0));
  const near = toks.map((x, i) => i).filter(i => !keep.has(i))
    .sort((x, y) => Math.min(...[...keep].map(k => Math.abs(k - x))) - Math.min(...[...keep].map(k => Math.abs(k - y))) || x - y);
  near.slice(0, RW_ASK_WORDS).forEach(i => keep.add(i));
  let out = '', last = -1;
  toks.forEach((x, i) => { if (!keep.has(i)) return; out += (out ? ' ' : '') + (last >= 0 && i > last + 1 ? '… ' : '') + x; last = i; });
  out = (keep.has(0) ? '' : '… ') + out.replace(/[,;:—–.!?]$/, '') + (last < toks.length - 1 ? ' …' : '');
  return out.replace(/^[a-z]/, c => c.toUpperCase());
}
/* A CUE IS A SPECIFIC QUESTION WHOSE ANSWER IS THE FACT'S KEY WORDS (519): "What is …?" for the subject, When, How many or Where by the hidden term's role, else the fact with gaps to fill. */
function rwAsk_(f, hide) {
  const t = hide[0], at = f.fact.search(rwRe_(t)), before = f.fact.slice(0, Math.max(0, at + 1)).trim().split(/\s+/);
  const prep = (before[before.length - 1] || '').toLowerCase(), verb = (before[before.length - 2] || '').toLowerCase();
  const subj = hide.length === 1 && f.fact.match(new RegExp('^(?:the |an? )?' + rwRe_(t).source.slice(rwRe_(t).source.indexOf(')') + 1) + '\\s+(is|was|are|were)\\s+(.+?)[.!?]?$', 'i'));
  if (subj && subj[2].split(/\s+/).length <= RW_ASK_WORDS + 2) return 'What ' + subj[1].toLowerCase() + ' ' + subj[2].replace(/[,;:—–]$/, '') + '?';
  const g = rwGap_(f.fact, hide), end = /…$/.test(g) ? '' : '.';
  if (/\d/.test(t) || /\b(?:BC|AD|BCE|CE)\b/.test(t)) return (/^\d{3,4}$|\b(?:BC|AD|BCE|CE)\b/.test(t) || /centur|year/i.test(f.fact) ? 'When? ' : 'How many? ') + g + end;
  if (/^[A-Z]/.test(t) && /^(?:in|at|from|near|to|across)$/.test(prep) && !/(?:ed|en)$/.test(verb) && !RW_TONGUES.test(t)) return 'Where? ' + g + end;
  return g + ' — fill in from memory.';
}
/* CUES ARE DISTINCT (519): each hides its fact's rarest names — first those no earlier cue has asked for, so "Greek" is not the answer four times — and no two cues are the same. */
function rwCues_(facts) {
  const low = (facts || []).map(f => f.fact.toLowerCase()), df = t => low.filter(l => rwRe_(t).test(l)).length;
  const asked = new Set(), cues = new Set();
  (facts || []).forEach((f, n) => {
    let cands = (f.names || f.terms).filter(t => !rwVerby_(t));
    if (!cands.length) cands = f.subs.slice().sort((x, y) => y.weight - x.weight).slice(0, 1).map(x => x.w);
    const heavy = t => (f.heavy || []).includes(t);
    cands = cands.map((t, i) => ({ t, i, d: df(t), old: asked.has(t.toLowerCase()) }))
      .sort((x, y) => x.old - y.old || heavy(y.t) - heavy(x.t) || x.d - y.d || x.i - y.i).map(x => x.t);
    /* A FACT THAT SAYS WHAT ITS SUBJECT IS ASKS "What is …?" of it, the first time that subject is asked. */
    const lead = (f.names || [])[0], subj = lead && !asked.has(lead.toLowerCase()) && rwAsk_(f, [lead]);
    if (subj && /^What /.test(subj)) cands = [lead].concat(cands.filter(t => t !== lead));
    let hide = [], cue = '';
    for (let k = 0; k < cands.length && !cue; k++) {
      hide = [cands[k]];
      if (k === 0 && subj && /^What /.test(subj)) { if (!cues.has(subj)) cue = subj; continue; }
      const two = cands.find(t => t !== cands[k] && heavy(t) && !asked.has(t.toLowerCase()) && df(t) <= 2 && !rwRe_(t).test(cands[k]) && !rwRe_(cands[k]).test(t));
      const left = rwSubstance_(f.fact.replace(rwRe_(cands[k]), ' ').replace(two ? rwRe_(two) : /$^/, ' ')).length;
      if (two && left >= 2) hide.push(two);
      const c = rwAsk_(f, hide);
      if (!cues.has(c)) cue = c;
    }
    if (!cue) { hide = []; cue = 'Part ' + (n + 1) + ': what did the text say here?'; }
    cues.add(cue);
    hide.forEach(t => asked.add(t.toLowerCase()));
    f.hide = hide; f.cue = cue; f.key = cue;
  });
  return facts;
}
/* THE AI MAY PUT A CUE MORE NATURALLY, but only as one question that hides the fact's answer and still asks about this fact; otherwise the phone's cue stands. */
function rwAiCue_(f, q) {
  q = String(q || '').replace(/\s+/g, ' ').trim();
  if (!q || q.length > 160 || !/\?$/.test(q) || !(f.hide || []).length) return false;
  if (f.hide.some(t => rwTermSeen_(t, q))) return false;
  const shown = new Set(rwSubstance_(f.fact).filter(x => !f.hide.some(t => rwTermSeen_(t, x.w))).map(x => x.stem));
  return rwSubstance_(q).some(x => shown.has(x.stem));
}
/* SPELLING IS FORGIVEN (519): the same stem, or one slip in a word of 5–7 letters and two in 8 or more (Damerau-Levenshtein), so "Septuigint" is Septuagint. */
function rwDL_(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/* A KIN WORD IS THE SAME WORD: Jew and Jewish, Rome and Roman — one stem is the other's with a people's or a describing ending. */
function rwLike_(src, mine) {
  const a = String(src).toLowerCase(), b = String(mine).toLowerCase(), sa = rwStem_(a), sb = rwStem_(b);
  if (a === b || sa === sb) return 'same';
  const [lo, hi] = sa.length <= sb.length ? [sa, sb] : [sb, sa];
  if (lo.length >= 3 && hi.startsWith(lo) && /^(?:ish|ian|an|ic|ese|ite|ist|ism)$/.test(hi.slice(lo.length))) return 'same';
  const k = a.length >= 8 ? 2 : a.length >= 5 ? 1 : 0;
  const near = (x, y) => Math.abs(x.length - y.length) <= k && rwDL_(x, y) <= k;
  return k && (near(a, b) || (sa.length >= 4 && near(sa, sb))) ? 'near' : '';
}
/* A PROTECTED TERM IS SEEN when each of its words is in the answer, spelt right ('same') or recognisably ('near'). */
function rwTermSeen_(term, mine) {
  const have = rwWords_(mine).map(x => x.w);
  let how = 'same';
  for (const w of rwWords_(term)) {
    const best = have.reduce((b, h) => (b === 'same' ? b : rwLike_(w.w, h) || b), '');
    if (!best) return '';
    if (best === 'near') how = 'near';
  }
  return how;
}
/* THE FACTS, SPLIT MECHANICALLY: sentences, cut to size at a clause or a phrase only when too big; a scrap of one or two key words joins a neighbour it still fits with. */
function rwSplitFacts_(text) {
  const sents = String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?;])\s+(?=[A-Z0-9"“(])|;\s+/).map(s => s.trim()).filter(Boolean);
  let out = sents.reduce((a, f) => a.concat(rwCut_(f)), []).filter(f => rwSubstance_(f).some(x => x.weight >= 0.5));
  for (let i = 0; i < out.length; i++) {
    if (out.length < 2 || rwSize_(out[i]) >= RW_SUBS_MIN) continue;
    if (i > 0 && rwFits_(out[i - 1] + ' ' + out[i])) { out.splice(i - 1, 2, out[i - 1] + ' ' + out[i]); i -= 2; }
    else if (i + 1 < out.length && rwFits_(out[i] + ' ' + out[i + 1])) { out.splice(i, 2, out[i] + ' ' + out[i + 1]); i--; }
  }
  return out.map(rwTrim_).filter(Boolean);
}
/* A FACT AS THE SCANNER SEES IT: its substance stems that are the source's and its protected terms; its cue is rwCues_'s, made across all the facts. */
function rwFact_(fact, source, n) {
  const srcStems = new Set(rwSubstance_(source).map(x => x.stem));
  const srcTerms = rwTermsOf_(source), lf = String(fact).toLowerCase();
  const weigh = t => Math.max(0, ...rwSubstance_(source).filter(x => rwWords_(t).some(y => rwStem_(y.w) === x.stem)).map(x => x.weight));
  const terms = srcTerms.filter(t => lf.includes(t.toLowerCase())).map((t, i) => ({ t, i, w: weigh(t) }))
    .sort((a, b) => b.w - a.w || a.i - b.i).map(x => x.t).slice(0, RW_TERMS_MAX);
  const subs = [], seen = new Set();
  rwSubstance_(fact).forEach(x => { if (srcStems.has(x.stem) && !seen.has(x.stem)) { seen.add(x.stem); subs.push({ w: x.w, stem: x.stem, weight: x.weight }); } });
  /* EVERY TERM OF THE FACT, in the order the fact says them, a term inside a longer one left out: what a cue may name. */
  const all = srcTerms.filter(t => lf.includes(t.toLowerCase()));
  const names = all.filter(t => !all.some(u => u !== t && u.toLowerCase().includes(t.toLowerCase()) && !lf.replace(u.toLowerCase(), '').includes(t.toLowerCase())))
    .sort((x, y) => lf.indexOf(x.toLowerCase()) - lf.indexOf(y.toLowerCase()));
  const big = new Set(rwTermsOf_(source, true).map(t => t.toLowerCase()));
  return { fact: String(fact), terms: terms, subs: subs, names: names, heavy: names.filter(t => big.has(t.toLowerCase())), hide: [], key: '', cue: '' };
}
/* THE SCORE OF ONE FACT IS ON ITS KEY WORDS (519): the rare words, names and numbers (all its substance if it has none), kin words and slips of spelling counted, and the slips named gently. */
function rwCover_(subs, mine, key) {
  const words = rwWords_(mine).map(x => x.w), have = new Set(words.map(rwStem_));
  const keys = (subs || []).filter(x => x.weight >= 2), scored = keys.length ? keys : (subs || []);
  /* THE CUE'S OWN WORDS ARE GIVEN: "its the abbreviation" answers the cue's LXX — but only alongside a key word of the student's own, so "done" stays 0. */
  const given = new Set(rwWords_(key || '').map(x => rwStem_(x.w)));
  let all = 0, got = 0, cue = 0;
  const missing = [], spell = [];
  scored.forEach(s => {
    all += s.weight;
    if (have.has(s.stem) || words.some(w => rwLike_(s.w, w) === 'same')) got += s.weight;
    else if (words.some(w => rwLike_(s.w, w) === 'near')) { got += s.weight; spell.push(s.w); }
    else if (given.has(s.stem)) cue += s.weight;
    else missing.push(s);
  });
  if (got) got += cue;
  else scored.forEach(s => { if (given.has(s.stem) && !missing.includes(s)) missing.push(s); });
  return { pct: all ? Math.round(100 * got / all) : 0, missing: missing.sort((a, b) => b.weight - a.weight), spell: spell };
}
const rwScore_ = (f, mine) => rwCover_(f.subs, mine, f.key);
/* AN ANSWER IS ATTEMPTED when it earns a key word or says three words: "done" is not an attempt, and is not averaged in as a zero. */
const rwTried_ = (f, mine) => !!String(mine || '').trim() && (rwScore_(f, mine).pct > 0 || rwWords_(mine).length >= 3);
/* THE OVERALL SCORE IS THE AVERAGE OF THE FACTS ANSWERED (519), with how many of them were. */
function rwAverage_(facts, mine) {
  const tried = (facts || []).map((f, i) => i).filter(i => rwTried_(facts[i], (mine || [])[i]));
  const pct = tried.length ? Math.round(tried.reduce((n, i) => n + rwScore_(facts[i], mine[i]).pct, 0) / tried.length) : 0;
  return { pct: pct, tried: tried.length, of: (facts || []).length };
}
/* OWN WORDING IS JUDGED ONLY ON WRITING OF SUBSTANCE (519): answers of RW_OWN_MIN words or more, and RW_OWN_TOTAL in all, or it is "not enough written yet". */
const RW_OWN_MIN = 5, RW_OWN_TOTAL = 10;
function rwOwnText_(mines) {
  const own = (mines || []).map(x => String(x || '').trim()).filter(x => rwWords_(x).length >= RW_OWN_MIN).join('\n');
  return rwWords_(own).length >= RW_OWN_TOTAL ? own : '';
}
const rwStatusBy_ = pct => (pct >= 80 ? 'kept' : pct >= 40 ? 'changed' : 'missing');

/* ---------- THE COPYING CHECK: runs of four words shared with the source, protected terms left out (519) ---------- */
function rwWords_(s) {
  const out = [];
  String(s || '').replace(/[A-Za-z0-9À-ɏ]+(?:['’][A-Za-z]+)*/g, (w, at) => { out.push({ w: w.toLowerCase().replace(/’/g, "'"), at: at, end: at + w.length }); return w; });
  return out;
}
/* WHICH WORDS ARE A PROTECTED TERM: keeping "oxidative phosphorylation" is keeping the fact, never copying (519). */
function rwProtected_(words, terms) {
  const mark = new Array(words.length).fill(false);
  (terms || []).map(t => rwWords_(t).map(x => x.w)).filter(t => t.length).forEach(t => {
    for (let i = 0; i + t.length <= words.length; i++) {
      if (t.every((w, k) => words[i + k].w === w)) for (let k = 0; k < t.length; k++) mark[i + k] = true;
    }
  });
  return mark;
}
/* PROTECTED WORDS ARE SKIPPED, NOT SEPARATORS: the words around a term are still caught if they are the source's own run. */
function rwSimilarity_(source, mine, terms, n) {
  const N = n || 4;
  const sw = rwWords_(source), sp = rwProtected_(sw, terms);
  const src = sw.filter((_, i) => !sp[i]).map(x => x.w);
  const all = rwWords_(mine), mp = rwProtected_(all, terms);
  const me = all.filter((_, i) => !mp[i]);
  const grams = new Set();
  for (let i = 0; i + N <= src.length; i++) grams.add(src.slice(i, i + N).join(' '));
  const hit = new Array(me.length).fill(false);
  for (let i = 0; i + N <= me.length; i++) {
    if (grams.has(me.slice(i, i + N).map(x => x.w).join(' '))) for (let k = i; k < i + N; k++) hit[k] = true;
  }
  /* THE COPIED RUNS, as character ranges of the student's own text, so they can be marked where they stand. */
  const runs = [];
  for (let i = 0; i < me.length; i++) {
    if (!hit[i]) continue;
    let j = i;
    while (j + 1 < me.length && hit[j + 1]) j++;
    runs.push({ from: me[i].at, to: me[j].end, words: j - i + 1 });
    i = j;
  }
  const copied = hit.filter(Boolean).length, kept = all.length - me.length;
  const pct = me.length ? Math.round(100 * copied / me.length) : 0;
  return { words: me.length, terms: kept, copied: copied, pct: pct, own: me.length ? 100 - pct : 0, runs: runs };
}
function rwMarked_(text, runs) {
  let out = '', at = 0;
  (runs || []).forEach(r => { out += esc(text.slice(at, r.from)) + '<mark class="rw-copied">' + esc(text.slice(r.from, r.to)) + '</mark>'; at = r.to; });
  return out + esc(text.slice(at));
}
/* THE AI'S VERDICT ONLY STANDS WITH ITS QUOTE: a quote that is not in the student's answer is the model's words, so the fact counts as not kept. */
function rwVerdict_(v, mine) {
  const verdict = ['yes', 'partly', 'no'].indexOf(v && v.verdict) !== -1 ? v.verdict : 'no';
  const quote = String((v && v.quote) || '').trim();
  const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  if (verdict === 'no' || !quote || !norm(mine).includes(norm(quote))) return { verdict: 'no', quote: '' };
  return { verdict: verdict, quote: quote };
}

const rwAllTerms_ = () => RW.facts.reduce((a, f) => a.concat(f.terms), []);
const rwMineAll_ = () => (RW.facts.length ? RW.mine.map(x => String(x || '').trim()).filter(Boolean).join('\n') : RW.free);
/* EACH FACT'S STANDING: the AI's verdict where it gave one, else the scanner's coverage of that fact's answer. */
function rwStatus_(i) {
  const a = RW.ai && RW.ai[i];
  if (a) return a.verdict === 'yes' ? 'kept' : a.verdict === 'partly' ? 'changed' : 'missing';
  return rwStatusBy_(rwScore_(RW.facts[i], RW.mine[i] || '').pct);
}
const rwTodo_ = () => RW.facts.map((_, i) => i).filter(i => rwStatus_(i) !== 'kept');
/* THE FACTS BEING STEPPED THROUGH: all of them, or on Try again only those still out. RW.at past the last is the summary. */
const rwOrder_ = () => (RW.step === 'retry' ? (RW.retry || []) : RW.facts.map((_, i) => i));
const rwOverall_ = () => rwAverage_(RW.facts, RW.mine);

function rwChips_(missing) {
  return missing.length ? `<span class="rw-chips">${missing.slice(0, 8).map(m => `<b class="rw-chip${m.weight >= 2 ? ' is-rare' : ''}">${esc(m.w)}</b>`).join('')}</span>` : '';
}
function rwScanHtml_() {
  if (!RW.facts.length) return '';
  const o = rwOverall_();
  return `<p class="rw-score">Substance <b>${o.pct}%</b> · ${o.tried} of ${o.of} facts answered</p>`;
}
function rwChecklist_() {
  return `<h4 class="rw-h">The facts to keep</h4><ol class="rw-facts">${RW.facts.map(f =>
    `<li>${esc(f.fact)}${f.terms.length ? `<span class="rw-terms">${f.terms.map(t => `<b class="rw-term">${esc(t)}</b>`).join('')}</span>` : ''}</li>`).join('')}</ol>`;
}
const RW_VERDICT = { kept: 'Kept', changed: 'Meaning changed', missing: 'Missing' };
/* ONE FACT ON SCREEN (519): its cue, its one box and its own score; Back and Next are tiles, and the answers stay in memory either way. */
function rwOneHtml_(i, pos, of) {
  const f = RW.facts[i], st = RW.step, cov = rwScore_(f, RW.mine[i] || ''), a = RW.ai && RW.ai[i], s = rwStatus_(i);
  return `<div class="rw-idea">
    <p class="rw-step">${pos + 1} of ${of}</p>
    <label class="rw-line"><span>${esc(f.cue)}</span><textarea data-rw="mine" data-i="${i}" rows="3" placeholder="From memory…"${st === 'checked' ? ' readonly' : ''}>${esc(RW.mine[i] || '')}</textarea></label>
    <div class="rw-fb" data-rw-scan="${i}">${rwFactScan_(i, cov)}</div>
    ${st === 'checked' ? `<p class="rw-kept is-${s}">${RW_VERDICT[s]}${a ? '' : ' <span class="faint">(by the words)</span>'}</p>${a && a.quote ? `<p class="rw-quote">“${esc(a.quote)}”</p>` : ''}` : ''}
  </div>`;
}
/* THE LAST STEP: every fact's cue with its score or verdict, then Check. */
function rwSummaryHtml_(order) {
  return `<h4 class="rw-h">Your answers</h4><ol class="rw-sum">${order.map(i => {
    const f = RW.facts[i], mine = String(RW.mine[i] || '').trim();
    const said = !mine ? '<span class="faint">not attempted</span>'
      : RW.step === 'checked' ? `<b class="rw-kept is-${rwStatus_(i)}">${RW_VERDICT[rwStatus_(i)]}</b>` : rwScore_(f, mine).pct + '%';
    return `<li>${esc(f.cue)} — ${said}</li>`; }).join('')}</ol><div data-rw-scan="all">${rwScanHtml_()}</div>`;
}
function rwDraw_(into) {
  if (!into) return;
  if (!(typeof isAdmin === 'function' && isAdmin())) { into.innerHTML = ''; return; }
  const ai = !!(typeof DATA === 'object' && DATA && DATA.aiMarking);
  const st = RW.step, has = RW.facts.length > 0;
  const said = RW.said ? `<p class="note rw-said">${esc(RW.said)}</p>` : '';
  const wait = RW.busy ? `<div class="rw-wait" aria-busy="true">${loading_()}</div>` : '';
  const recall = has && st !== 'study';
  const shown = !recall || RW.peek;
  const srcBox = !has
    ? `<label class="rw-line"><span>Paste the text</span><textarea data-rw="src" rows="6" placeholder="Paste the AI-written text here…">${esc(RW.text)}</textarea></label>`
    : shown ? `<p class="rw-src-text">${esc(RW.text)}</p>${rwChecklist_()}` : `<p class="note rw-hidden">The text and the facts are hidden: write from memory.</p>`;
  const first = has ? '' : `<div class="tile-row">${tile_({ icon: 'spark', label: 'List the facts', act: 'rw-ideas', off: RW.busy })}</div>`;
  const study = has && st === 'study' ? `${RW.vocab.length ? `<h4 class="rw-h">Key words</h4><dl class="rw-vocab">${RW.vocab.map(v =>
      `<div class="rw-v"><dt>${esc(v.word)}</dt><dd>${esc(v.meaning)}</dd></div>`).join('')}</dl>` : ''}${
      RW.tips.length ? `<h4 class="rw-h">How to say it</h4><ul class="rw-tips">${RW.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    <div class="tile-row">${tile_({ icon: 'edit', label: 'Write from memory', act: 'rw-recall' })}${
      ai && !RW.vocab.length ? tile_({ icon: 'suggest', label: 'Tidy the facts with AI', act: 'rw-tidy', off: RW.busy }) : ''}</div>` : '';
  const peek = recall ? `<div class="tile-row">${RW.peek
      ? tile_({ icon: 'close', label: 'Hide again', act: 'rw-hide' })
      : tile_({ icon: 'show', label: 'Peek', note: RW.peeks + ' so far', act: 'rw-peek', off: RW.busy })}</div>` : '';
  const order = rwOrder_(), at = Math.min(RW.at, order.length), summary = recall && at >= order.length;
  const step = !has ? `<label class="rw-line"><span>Your own version</span><textarea data-rw="free" rows="5" placeholder="Write it again in your own words…">${esc(RW.free)}</textarea></label>`
    : !recall ? '' : summary ? rwSummaryHtml_(order) : rwOneHtml_(order[at], at, order.length);
  const s = RW.sim;
  const n = RW.facts.length, kept = has && st === 'checked' ? n - rwTodo_().length : null;
  const score = s && (summary || !has) ? `<p class="rw-score">${kept != null ? `Facts kept <b>${kept}/${n}</b> · ` : ''}Own wording ${s.short ? '<span class="faint">not enough written yet</span>'
    : `<b class="${s.pct < RW_TARGET ? 'is-ok' : 'is-high'}">${s.own}%</b>${s.terms ? ` <span class="faint">(${s.terms} protected term word${s.terms === 1 ? '' : 's'} not counted)</span>` : ''}`}</p>` : '';
  const note = summary && st === 'checked' && RW.note ? `<p class="note rw-note">${esc(RW.note)}</p>` : '';
  const copied = s && !s.short && (summary || !has) ? (s.runs.length ? `<p class="note">Phrases of four or more words that match the text (protected terms aside):</p><p class="rw-marked">${rwMarked_(s.text, s.runs)}</p>`
    : '<p class="note">No run of four words matches the text.</p>') : '';
  const tiles = [];
  if (recall) {
    tiles.push(tile_({ icon: 'left', label: 'Back', act: 'rw-back', off: at === 0 }));
    if (!summary) tiles.push(tile_({ icon: 'right', label: at === order.length - 1 ? 'Finish' : 'Next', act: 'rw-next' }));
  }
  if (!has || (summary && (st === 'write' || st === 'retry'))) tiles.push(tile_({ icon: 'tick', label: 'Check', act: 'rw-check', off: RW.busy }));
  if (summary && st === 'checked' && rwTodo_().length) tiles.push(tile_({ icon: 'again', label: 'Try again', act: 'rw-retry', off: RW.busy }));
  tiles.push(tile_({ icon: 'bin', label: 'Start again', act: 'rw-reset', off: RW.busy }));
  into.innerHTML = `<div class="rw">${srcBox}${first}${study}${peek}${step}
    <div class="tile-row">${tiles.join('')}</div>
    ${wait}${said}${score}${note}${copied}</div>`;
}
/* ONE FACT'S LINE: its score, how many key words are still out (named only when peeking or checked, as they are the answer), and a gentle spelling note. */
function rwFactScan_(i, cov) {
  const f = RW.facts[i], mine = String(RW.mine[i] || '');
  const seen = f.terms.map(t => ({ t, how: rwTermSeen_(t, mine) }));
  const out = seen.filter(x => !x.how).length;
  const spell = seen.filter(x => x.how === 'near').map(x => x.t)
    .concat(cov.spell.filter(w => !seen.some(x => x.t.toLowerCase().includes(w.toLowerCase()))));
  const left = RW.peek || RW.step === 'checked'
    ? (cov.missing.length ? ' · missing ' + rwChips_(cov.missing) : '')
    : (cov.missing.length ? ` · ${cov.missing.length} key word${cov.missing.length === 1 ? '' : 's'} still out${out ? ', ' + out + ' of them protected' : ''}` : '');
  return `<p class="rw-cov">Substance ${cov.pct}%${left}</p>${spell.length ? `<p class="rw-spell">Check spelling: ${spell.map(esc).join(', ')}</p>` : ''}`;
}
function initRewrite_() { rwRedraw_(true); }
function rwRedraw_(force) {
  document.querySelectorAll('[id="rw-box"]').forEach(into => {
    if (force === true || !into.contains(document.activeElement)) rwDraw_(into);
  });
}

/* TYPING GOES INTO `RW` AS IT HAPPENS, and the scanner's line under the box follows live without redrawing the box being typed in. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-rw]');
  if (!el) return;
  if (el.dataset.rw === 'src') RW.text = el.value;
  else if (el.dataset.rw === 'free') RW.free = el.value;
  else if (el.dataset.rw === 'mine') {
    const i = Number(el.dataset.i);
    RW.mine[i] = el.value;
    if (RW.ai) RW.ai[i] = null;
    const box = el.closest('.rw'), line = box && box.querySelector(`[data-rw-scan="${i}"]`), all = box && box.querySelector('[data-rw-scan="all"]');
    if (line && RW.facts[i]) line.innerHTML = rwFactScan_(i, rwScore_(RW.facts[i], el.value));
    if (all) all.innerHTML = rwScanHtml_();
  }
});

/* LISTING THE FACTS IS THE PHONE'S OWN WORK: it works with the AI off. */
on('rw-ideas', () => {
  if (RW.busy) return;
  if (RW.text.trim().split(/\s+/).length < 20) { RW.said = 'Paste a longer text — a paragraph at least.'; rwRedraw_(true); return; }
  const pick = rwPick_(rwSplitFacts_(RW.text)), facts = rwCues_(pick.facts.map((f, i) => rwFact_(f, RW.text, i)));
  if (!facts.length) { RW.said = 'There is nothing of substance to keep in that.'; rwRedraw_(true); return; }
  Object.assign(RW, { facts: facts, step: 'study', mine: facts.map(() => ''), retry: null, peek: false, peeks: 0, ai: null, note: '', sim: null,
    vocab: [], tips: [], at: 0, left: pick.left, said: 'Read the facts and their protected terms, then write each one from memory.'
      + (pick.left ? ' ' + pick.left + ' smaller fact' + (pick.left === 1 ? ' was' : 's were') + ' left for next time.' : '') });
  rwRedraw_(true);
});
/* THE AI MAY ONLY MERGE AND CLEAN THE FACTS; their terms, cues and scoring stay the scanner's. */
on('rw-tidy', () => {
  if (RW.busy || !USER || !RW.facts.length) return;
  RW.busy = true; RW.said = ''; rwRedraw_(true);
  const done = d => {
    RW.busy = false;
    /* THE AI'S FACTS ARE HELD TO THE SAME SIZE, CAP AND CUES AS THE PHONE'S. */
    /* A QUESTION THE AI WROTE STAYS WITH ITS FACT ONLY WHILE THAT FACT IS WHOLE; a fact the phone had to cut keeps the phone's cues. */
    const qs = new Map(), qa = d && Array.isArray(d.questions) ? d.questions : [];
    const pieces = d && d.success && Array.isArray(d.facts) ? d.facts.reduce((a, f, i) => {
      const cut = rwCut_(String(f || '').trim()).map(rwTrim_).filter(Boolean);
      if (cut.length === 1 && typeof qa[i] === 'string') qs.set(cut[0], qa[i]);
      return a.concat(cut);
    }, []) : [];
    const got = rwPick_(pieces);
    if (got.facts.length) {
      RW.facts = rwCues_(got.facts.map((f, i) => rwFact_(f, RW.text, i)));
      RW.facts.forEach(f => { const q = qs.get(f.fact); if (rwAiCue_(f, q)) { f.cue = String(q).replace(/\s+/g, ' ').trim(); f.key = f.cue; } });
      RW.left = got.left; RW.at = 0;
      RW.mine = RW.facts.map(() => '');
      RW.vocab = (Array.isArray(d.vocab) ? d.vocab : []).filter(v => v && v.word && v.meaning).map(v => ({ word: String(v.word), meaning: String(v.meaning) }));
      RW.tips = (Array.isArray(d.tips) ? d.tips : []).map(String).filter(Boolean);
      RW.said = '';
    } else RW.said = (d && (d.message || d.error)) || 'The coach could not be reached — the facts as split are fine to use.';
    rwRedraw_(true);
  };
  api({ action: 'rewriteIdeas', personId: USER.personId, text: RW.text, facts: RW.facts.map(f => f.fact) }).then(done, () => done(null));
});
on('rw-recall', () => { RW.step = 'write'; RW.at = 0; RW.peek = false; RW.said = ''; rwRedraw_(true); });
/* A PEEK IS ALLOWED AND COUNTED: the counting is what keeps writing from memory the default (519). */
on('rw-peek', () => { RW.peek = true; RW.peeks++; rwRedraw_(true); });
on('rw-hide', () => { RW.peek = false; rwRedraw_(true); });
on('rw-retry', () => { RW.retry = rwTodo_(); RW.step = 'retry'; RW.at = 0; RW.peek = false; RW.said = ''; rwRedraw_(true); });
on('rw-check', () => {
  if (RW.busy) return;
  const mine = rwMineAll_();
  if (!mine.trim()) { RW.said = 'Write something in your own words first.'; rwRedraw_(true); return; }
  /* OWN WORDING ONLY OVER ANSWERS OF SUBSTANCE: "done" and one-word answers would read as 100% their own. */
  const own = rwOwnText_(RW.facts.length ? RW.mine : [RW.free]);
  RW.sim = own ? Object.assign(rwSimilarity_(RW.text, own, rwAllTerms_()), { text: own }) : { short: true };
  const ask = RW.step === 'retry' ? (RW.retry || []) : RW.facts.map((_, i) => i);
  if (RW.facts.length) { RW.step = 'checked'; RW.at = RW.facts.length; }
  RW.peek = false;
  const ai = !!(DATA && DATA.aiMarking) && RW.facts.length && USER && ask.some(i => String(RW.mine[i] || '').trim());
  if (!ai) { RW.said = ''; rwRedraw_(true); return; }
  /* THE AI JUDGES ONE FACT AGAINST ITS ONE ANSWER, per item; the phone keeps a verdict only with a quote that is really there. */
  RW.busy = true; RW.said = ''; rwRedraw_(true);
  const done = d => {
    RW.busy = false;
    if (d && d.success && Array.isArray(d.facts)) {
      RW.ai = RW.ai || RW.facts.map(() => null);
      ask.forEach((i, k) => { RW.ai[i] = rwVerdict_(d.facts[k], RW.mine[i] || ''); });
      RW.note = String(d.note || ''); RW.said = '';
    } else RW.said = (d && (d.message || d.error)) || 'The coach could not be reached — the facts are judged by their words below.';
    rwRedraw_(true);
  };
  api({ action: 'rewriteCheck', personId: USER.personId, text: RW.text,
        items: ask.map(i => ({ fact: RW.facts[i].fact, mine: RW.mine[i] || '' })) }).then(done, () => done(null));
});
/* ONE FACT AT A TIME (519): Back and Next only move; what was typed stays in RW.mine. Past the last fact is the summary. */
on('rw-back', () => { RW.at = Math.max(0, Math.min(RW.at, rwOrder_().length) - 1); rwRedraw_(true); });
on('rw-next', () => { RW.at = Math.min(rwOrder_().length, RW.at + 1); rwRedraw_(true); });
on('rw-reset', () => { Object.assign(RW, RW_FRESH()); rwRedraw_(true); });
