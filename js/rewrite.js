/* @family. — rewrite.js THE REWRITE COACH (509), admin only for now: the AI gives ideas and words, the student writes, the AI asks questions back. Never a rewrite. */

/* THE SESSION'S WORK, IN MEMORY ONLY: never localStorage, never a sheet row — gone when the page goes (the owner's privacy rule, 509). */
const RW = { text: '', ideas: [], vocab: [], mine: [], free: '', feedback: null, sim: null, said: '', busy: false };
const RW_TARGET = 20;

/* ---------- THE COPYING CHECK, ON THE PHONE: every run of four words the student shares with the source, as a share of their words ---------- */
function rwWords_(s) {
  const out = [];
  String(s || '').replace(/[A-Za-z0-9À-ɏ]+(?:['’][A-Za-z]+)*/g, (w, at) => { out.push({ w: w.toLowerCase().replace(/’/g, "'"), at: at, end: at + w.length }); return w; });
  return out;
}
function rwSimilarity_(source, mine, n) {
  const N = n || 4;
  const src = rwWords_(source).map(x => x.w), me = rwWords_(mine);
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
  const copied = hit.filter(Boolean).length;
  return { words: me.length, copied: copied, pct: me.length ? Math.round(100 * copied / me.length) : 0, runs: runs };
}
function rwMarked_(text, runs) {
  let out = '', at = 0;
  (runs || []).forEach(r => { out += esc(text.slice(at, r.from)) + '<mark class="rw-copied">' + esc(text.slice(r.from, r.to)) + '</mark>'; at = r.to; });
  return out + esc(text.slice(at));
}
const rwMineAll_ = () => (RW.ideas.length ? RW.mine.filter(x => String(x || '').trim()).join('\n') : RW.free);

function rwDraw_(into) {
  if (!into) return;
  if (!(typeof isAdmin === 'function' && isAdmin())) { into.innerHTML = ''; return; }
  const ai = !!(typeof DATA === 'object' && DATA && DATA.aiMarking);
  const has = RW.ideas.length > 0;
  const said = RW.said ? `<p class="note rw-said">${esc(RW.said)}</p>` : '';
  const wait = RW.busy ? `<div class="rw-wait" aria-busy="true">${loading_()}</div>` : '';
  const src = has
    ? `<details class="rw-src"><summary>The text (hidden while you write)</summary><p class="rw-src-text">${esc(RW.text)}</p></details>`
    : `<label class="rw-line"><span>Paste the text</span><textarea data-rw="src" rows="6" placeholder="Paste the AI-written text here…">${esc(RW.text)}</textarea></label>`;
  const first = has ? '' : `${ai ? '' : '<p class="note rw-off">The AI is not set up yet, so the coach cannot pull out the ideas. The copying check still works: write your version below.</p>'}
    <div class="tile-row">${tile_({ icon: 'spark', label: 'Find the key ideas', act: 'rw-ideas', off: !ai || RW.busy })}</div>`;
  const vocab = RW.vocab.length ? `<h4 class="rw-h">Key words</h4><dl class="rw-vocab">${RW.vocab.map(v =>
    `<div class="rw-v"><dt>${esc(v.word)}</dt><dd>${esc(v.meaning)}</dd></div>`).join('')}</dl>` : '';
  const fb = RW.feedback || [];
  const kept = { yes: 'Meaning kept', partly: 'Partly kept', no: 'Not kept yet' };
  const boxes = has ? `<h4 class="rw-h">Each idea in your own words</h4>${RW.ideas.map((idea, i) => {
      const f = fb[i];
      return `<div class="rw-idea">
        <label class="rw-line"><span>${i + 1}. ${esc(idea)}</span><textarea data-rw="mine" data-i="${i}" rows="3" placeholder="In your own words…">${esc(RW.mine[i] || '')}</textarea></label>
        ${f ? `<div class="rw-fb">${f.kept ? `<p class="rw-kept is-${esc(f.kept)}">${kept[f.kept] || ''}</p>` : ''}${f.missing ? `<p class="note">Missing: ${esc(f.missing)}</p>` : ''}${
          (f.questions || []).length ? `<ul class="rw-qs">${f.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}</div>` : ''}
      </div>`; }).join('')}`
    : `<label class="rw-line"><span>Your own version</span><textarea data-rw="free" rows="5" placeholder="Write it again in your own words…">${esc(RW.free)}</textarea></label>`;
  const s = RW.sim;
  const sim = s ? `<div class="rw-sim">
      <p class="rw-pct ${s.pct < RW_TARGET ? 'is-ok' : 'is-high'}">${s.pct}% copied <span class="faint">— aim for under ${RW_TARGET}%</span></p>
      ${s.runs.length ? `<p class="note">Phrases of four or more words that match the text:</p><p class="rw-marked">${rwMarked_(rwMineAll_(), s.runs)}</p>`
        : '<p class="note">No run of four words matches the text.</p>'}
    </div>` : '';
  into.innerHTML = `<div class="rw">${src}${first}${vocab}${boxes}
    <div class="tile-row">${tile_({ icon: 'tick', label: 'Check', act: 'rw-check', off: RW.busy })
      }${tile_({ icon: 'again', label: 'Start again', act: 'rw-reset', off: RW.busy })}</div>
    ${wait}${said}${sim}</div>`;
}
function initRewrite_() { rwRedraw_(true); }
function rwRedraw_(force) {
  document.querySelectorAll('[id="rw-box"]').forEach(into => {
    if (force === true || !into.contains(document.activeElement)) rwDraw_(into);
  });
}

/* TYPING GOES INTO `RW` AS IT HAPPENS, so a redraw draws it back rather than losing it. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-rw]');
  if (!el) return;
  if (el.dataset.rw === 'src') RW.text = el.value;
  else if (el.dataset.rw === 'free') RW.free = el.value;
  else if (el.dataset.rw === 'mine') RW.mine[Number(el.dataset.i)] = el.value;
});

on('rw-ideas', () => {
  if (RW.busy || !USER) return;
  if (RW.text.trim().split(/\s+/).length < 20) { RW.said = 'Paste a longer text — a paragraph at least.'; rwRedraw_(true); return; }
  RW.busy = true; RW.said = ''; rwRedraw_(true);
  const done = d => {
    RW.busy = false;
    if (d && d.success && Array.isArray(d.ideas) && d.ideas.length) {
      RW.ideas = d.ideas.map(String).slice(0, 7);
      RW.vocab = Array.isArray(d.vocab) ? d.vocab : [];
      RW.mine = RW.ideas.map(() => ''); RW.feedback = null; RW.sim = null;
      RW.said = 'Read the ideas, then write each one without looking back at the text.';
    } else RW.said = (d && (d.message || d.error)) || 'The coach could not be reached — try again in a moment.';
    rwRedraw_(true);
  };
  api({ action: 'rewriteIdeas', personId: USER.personId, text: RW.text }).then(done, () => done(null));
});
on('rw-check', () => {
  if (RW.busy) return;
  const mine = rwMineAll_();
  if (!mine.trim()) { RW.said = 'Write something in your own words first.'; rwRedraw_(true); return; }
  RW.sim = rwSimilarity_(RW.text, mine);
  const ai = !!(DATA && DATA.aiMarking) && RW.ideas.length && USER;
  if (!ai) { RW.said = ''; rwRedraw_(true); return; }
  RW.busy = true; RW.said = ''; rwRedraw_(true);
  const done = d => {
    RW.busy = false;
    if (d && d.success && Array.isArray(d.feedback)) { RW.feedback = d.feedback; RW.said = ''; }
    else RW.said = (d && (d.message || d.error)) || 'The coach could not be reached — the copying check is below.';
    rwRedraw_(true);
  };
  api({ action: 'rewriteCheck', personId: USER.personId, text: RW.text, ideas: RW.ideas, mine: RW.mine }).then(done, () => done(null));
});
on('rw-reset', () => {
  Object.assign(RW, { text: '', ideas: [], vocab: [], mine: [], free: '', feedback: null, sim: null, said: '', busy: false });
  rwRedraw_(true);
});
