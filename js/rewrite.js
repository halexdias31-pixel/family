/* @family. — rewrite.js THE REWRITE COACH (509, 519), admin only for now: the facts stay, only the wording changes. The phone does the substance check itself; the AI only judges meaning. */

/* THE SESSION'S WORK, IN MEMORY ONLY: never localStorage, never a sheet row — gone when the page goes (the owner's privacy rule, 509). */
const RW_FRESH = () => ({ text: '', facts: [], vocab: [], tips: [], step: 'paste', mine: [], free: '', retry: null, peek: false, peeks: 0,
  ai: null, note: '', sim: null, said: '', busy: false });
const RW = RW_FRESH();
const RW_TARGET = 20, RW_FACTS_MAX = 12, RW_TERMS_MAX = 6;

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
  + 'usual various vast vital whereas wherever widely within worldwide worse worst yet zero').split(' ');
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
function rwTermsOf_(text) {
  const t = String(text || ''), words = rwWords_(t), out = [], seen = new Set();
  let run = [];
  const flush = () => {
    if (run.length) {
      const term = t.slice(run[0].at, run[run.length - 1].end), k = term.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(term); }
    }
    run = [];
  };
  words.forEach((x, i) => {
    const raw = t.slice(x.at, x.end), gap = i && run.length ? t.slice(words[i - 1].end, x.at) : ' ';
    if (rwWeigh_(raw, t, x.at) >= 2 && /^[\s-]*$/.test(gap) && run.length < 4) run.push(x);
    else { flush(); if (rwWeigh_(raw, t, x.at) >= 2) run.push(x); }
  });
  flush();
  return out;
}
/* THE FACTS, SPLIT MECHANICALLY: sentences, then long sentences at a clause; the AI may only tidy them afterwards. */
function rwSplitFacts_(text) {
  const sents = String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?;])\s+(?=[A-Z0-9"“(])|;\s+/).map(s => s.trim()).filter(Boolean);
  let out = [];
  sents.forEach(s => {
    const parts = s.split(/,\s+(?=(?:which|and|but|while|whereas|so|because|although|so that)\s)/i);
    let cur = '';
    parts.forEach(p => {
      if (cur && cur.split(' ').length >= 5 && p.split(' ').length >= 5) { out.push(cur); cur = p; }
      else cur = cur ? cur + ', ' + p : p;
    });
    if (cur) out.push(cur);
  });
  out = out.filter(f => rwSubstance_(f).some(x => x.weight >= 0.5));
  while (out.length > RW_FACTS_MAX) {
    let k = 0;
    for (let i = 1; i < out.length - 1; i++) if (out[i].length + out[i + 1].length < out[k].length + out[k + 1].length) k = i;
    out.splice(k, 2, out[k] + ' ' + out[k + 1]);
  }
  return out;
}
/* A FACT AS THE SCANNER SEES IT: its substance stems that are the source's, its protected terms, and a cue that names the rarest of them. */
function rwFact_(fact, source, n) {
  const srcStems = new Set(rwSubstance_(source).map(x => x.stem));
  const srcTerms = rwTermsOf_(source), lf = String(fact).toLowerCase();
  const weigh = t => Math.max(0, ...rwSubstance_(source).filter(x => rwWords_(t).some(y => rwStem_(y.w) === x.stem)).map(x => x.weight));
  const terms = srcTerms.filter(t => lf.includes(t.toLowerCase())).map((t, i) => ({ t, i, w: weigh(t) }))
    .sort((a, b) => b.w - a.w || a.i - b.i).map(x => x.t).slice(0, RW_TERMS_MAX);
  const subs = [], seen = new Set();
  rwSubstance_(fact).forEach(x => { if (srcStems.has(x.stem) && !seen.has(x.stem)) { seen.add(x.stem); subs.push({ w: x.w, stem: x.stem, weight: x.weight }); } });
  const top = terms[0] || (subs.slice().sort((a, b) => b.weight - a.weight)[0] || {}).w;
  return { fact: String(fact), terms: terms, subs: subs,
    cue: top ? 'What did the text say about ' + top + '?' : 'What did part ' + ((n || 0) + 1) + ' of the text say?' };
}
/* THE SCORE: weighted share of the fact's (or the text's) substance present in what the student wrote, and the words missing. */
function rwCover_(subs, mine) {
  const have = new Set(rwWords_(mine).map(x => rwStem_(x.w)));
  let all = 0, got = 0;
  const missing = [];
  (subs || []).forEach(s => { all += s.weight; if (have.has(s.stem)) got += s.weight; else missing.push(s); });
  return { pct: all ? Math.round(100 * got / all) : 0, missing: missing.sort((a, b) => b.weight - a.weight) };
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
  return rwStatusBy_(rwCover_(RW.facts[i].subs, RW.mine[i] || '').pct);
}
const rwTodo_ = () => RW.facts.map((_, i) => i).filter(i => rwStatus_(i) !== 'kept');

function rwChips_(missing) {
  return missing.length ? `<span class="rw-chips">${missing.slice(0, 8).map(m => `<b class="rw-chip${m.weight >= 2 ? ' is-rare' : ''}">${esc(m.w)}</b>`).join('')}</span>` : '';
}
function rwScanHtml_() {
  const whole = RW.facts.reduce((a, f) => a.concat(f.subs), []);
  const cov = rwCover_(whole, rwMineAll_());
  return `<p class="rw-score">Substance <b>${cov.pct}%</b> of the text's words that matter</p>`;
}
function rwChecklist_() {
  return `<h4 class="rw-h">The facts to keep</h4><ol class="rw-facts">${RW.facts.map(f =>
    `<li>${esc(f.fact)}${f.terms.length ? `<span class="rw-terms">${f.terms.map(t => `<b class="rw-term">${esc(t)}</b>`).join('')}</span>` : ''}</li>`).join('')}</ol>`;
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
  const verdict = { kept: 'Kept', changed: 'Meaning changed', missing: 'Missing' };
  /* ONE BOX PER FACT, EACH UNDER ITS CUE: narrows the student's writing and the AI's judging alike. Try again shows only the facts still out. */
  const show = st === 'retry' ? (RW.retry || []) : RW.facts.map((_, i) => i);
  const boxes = !has ? `<label class="rw-line"><span>Your own version</span><textarea data-rw="free" rows="5" placeholder="Write it again in your own words…">${esc(RW.free)}</textarea></label>`
    : st === 'study' ? '' : show.map(i => {
      const f = RW.facts[i], cov = rwCover_(f.subs, RW.mine[i] || ''), a = RW.ai && RW.ai[i], s = rwStatus_(i);
      return `<div class="rw-idea">
        <label class="rw-line"><span>${i + 1}. ${esc(f.cue)}</span><textarea data-rw="mine" data-i="${i}" rows="3" placeholder="From memory…"${st === 'checked' ? ' readonly' : ''}>${esc(RW.mine[i] || '')}</textarea></label>
        <div class="rw-fb" data-rw-scan="${i}">${rwFactScan_(i, cov)}</div>
        ${st === 'checked' ? `<p class="rw-kept is-${s}">${verdict[s]}${a ? '' : ' <span class="faint">(by the words)</span>'}</p>${a && a.quote ? `<p class="rw-quote">“${esc(a.quote)}”</p>` : ''}` : ''}
      </div>`; }).join('');
  const s = RW.sim;
  const n = RW.facts.length, kept = has && st === 'checked' ? n - rwTodo_().length : null;
  const score = s ? `<p class="rw-score">${kept != null ? `Facts kept <b>${kept}/${n}</b> · ` : ''}Own wording <b class="${s.pct < RW_TARGET ? 'is-ok' : 'is-high'}">${s.own}%</b>${
      s.terms ? ` <span class="faint">(${s.terms} protected term word${s.terms === 1 ? '' : 's'} not counted)</span>` : ''}</p>` : '';
  const note = st === 'checked' && RW.note ? `<p class="note rw-note">${esc(RW.note)}</p>` : '';
  const copied = s ? (s.runs.length ? `<p class="note">Phrases of four or more words that match the text (protected terms aside):</p><p class="rw-marked">${rwMarked_(rwMineAll_(), s.runs)}</p>`
    : '<p class="note">No run of four words matches the text.</p>') : '';
  const tiles = [];
  if (!has || st === 'write' || st === 'retry') tiles.push(tile_({ icon: 'tick', label: 'Check', act: 'rw-check', off: RW.busy }));
  if (st === 'checked' && rwTodo_().length) tiles.push(tile_({ icon: 'again', label: 'Try again', act: 'rw-retry', off: RW.busy }));
  tiles.push(tile_({ icon: 'bin', label: 'Start again', act: 'rw-reset', off: RW.busy }));
  into.innerHTML = `<div class="rw">${srcBox}${first}${study}${peek}${boxes}
    ${has && st !== 'study' ? `<div data-rw-scan="all">${rwScanHtml_()}</div>` : ''}
    <div class="tile-row">${tiles.join('')}</div>
    ${wait}${said}${score}${note}${copied}</div>`;
}
/* THE MISSING WORDS OF ONE FACT, as chips — hidden with the text unless peeking, since they would be the answer. */
function rwFactScan_(i, cov) {
  const f = RW.facts[i];
  const terms = f.terms.filter(t => !String(RW.mine[i] || '').toLowerCase().includes(t.toLowerCase()));
  return `<p class="rw-cov">Substance ${cov.pct}%${RW.peek || RW.step === 'checked'
    ? (cov.missing.length ? ' · missing ' + rwChips_(cov.missing) : '') : (cov.missing.length ? ` · ${cov.missing.length} word${cov.missing.length === 1 ? '' : 's'} of substance still out${terms.length ? ', ' + terms.length + ' of them protected' : ''}` : '')}</p>`;
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
    if (line && RW.facts[i]) line.innerHTML = rwFactScan_(i, rwCover_(RW.facts[i].subs, el.value));
    if (all) all.innerHTML = rwScanHtml_();
  }
});

/* LISTING THE FACTS IS THE PHONE'S OWN WORK: it works with the AI off. */
on('rw-ideas', () => {
  if (RW.busy) return;
  if (RW.text.trim().split(/\s+/).length < 20) { RW.said = 'Paste a longer text — a paragraph at least.'; rwRedraw_(true); return; }
  const facts = rwSplitFacts_(RW.text).map((f, i) => rwFact_(f, RW.text, i));
  if (!facts.length) { RW.said = 'There is nothing of substance to keep in that.'; rwRedraw_(true); return; }
  Object.assign(RW, { facts: facts, step: 'study', mine: facts.map(() => ''), retry: null, peek: false, peeks: 0, ai: null, note: '', sim: null,
    vocab: [], tips: [], said: 'Read the facts and their protected terms, then write each one from memory.' });
  rwRedraw_(true);
});
/* THE AI MAY ONLY MERGE AND CLEAN THE FACTS; their terms, cues and scoring stay the scanner's. */
on('rw-tidy', () => {
  if (RW.busy || !USER || !RW.facts.length) return;
  RW.busy = true; RW.said = ''; rwRedraw_(true);
  const done = d => {
    RW.busy = false;
    const got = d && d.success && Array.isArray(d.facts) ? d.facts.map(f => String(f || '').trim()).filter(Boolean).slice(0, RW_FACTS_MAX) : [];
    if (got.length) {
      RW.facts = got.map((f, i) => rwFact_(f, RW.text, i));
      RW.mine = RW.facts.map(() => '');
      RW.vocab = (Array.isArray(d.vocab) ? d.vocab : []).filter(v => v && v.word && v.meaning).map(v => ({ word: String(v.word), meaning: String(v.meaning) }));
      RW.tips = (Array.isArray(d.tips) ? d.tips : []).map(String).filter(Boolean);
      RW.said = '';
    } else RW.said = (d && (d.message || d.error)) || 'The coach could not be reached — the facts as split are fine to use.';
    rwRedraw_(true);
  };
  api({ action: 'rewriteIdeas', personId: USER.personId, text: RW.text, facts: RW.facts.map(f => f.fact) }).then(done, () => done(null));
});
on('rw-recall', () => { RW.step = 'write'; RW.peek = false; RW.said = ''; rwRedraw_(true); });
/* A PEEK IS ALLOWED AND COUNTED: the counting is what keeps writing from memory the default (519). */
on('rw-peek', () => { RW.peek = true; RW.peeks++; rwRedraw_(true); });
on('rw-hide', () => { RW.peek = false; rwRedraw_(true); });
on('rw-retry', () => { RW.retry = rwTodo_(); RW.step = 'retry'; RW.peek = false; RW.said = ''; rwRedraw_(true); });
on('rw-check', () => {
  if (RW.busy) return;
  const mine = rwMineAll_();
  if (!mine.trim()) { RW.said = 'Write something in your own words first.'; rwRedraw_(true); return; }
  RW.sim = rwSimilarity_(RW.text, mine, rwAllTerms_());
  const ask = RW.step === 'retry' ? (RW.retry || []) : RW.facts.map((_, i) => i);
  if (RW.facts.length) RW.step = 'checked';
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
on('rw-reset', () => { Object.assign(RW, RW_FRESH()); rwRedraw_(true); });
