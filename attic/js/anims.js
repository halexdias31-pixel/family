/* @family. — the teaching animations' engine (attic, 88a): drawn on a content card's own page, cut from find-facets.js, find-timelines.js and library.js. The rows stay in data/textbooks.json, skipped by libExtrasBooks_. */

/* A CHAPTER'S ANIMATION, ON A PAGE OF ITS OWN STRAIGHT AFTER IT. § */
let TB_AN_SEQ = 0;
/* THE PART IS STILL `an17-pyth` — the chapter's number in the file, then the drawing's id — because the number is what tells two cards' drawings apart in a class § */
function textbookAnimPart_(x, part) {
  const m = /^an(\d+)-([a-z0-9]+)$/.exec(String(part || ''));
  const c = x && x.row;
  const a = m && c && c.n === Number(m[1]) && (c.animations || []).find(y => y.id === m[2]);
  if (!a) return '';
  animStyle_(a);
  return `<div class="card fc prac prac-part tb tb-an is-${esc(part)}">
    <p class="fc-kick">${esc([c.subject, c.title].filter(Boolean).join(' · '))}${tbHigher_(c.higher)}</p>
    <h3>${esc(contentPageTitle_(x, part))}</h3>
    <div class="tb-an-stage" data-anim="${esc(a.id)}">${animIds_(a.html, ++TB_AN_SEQ)}</div>
    ${/* ITS CAPTION, NOT A SECOND WIDGET (408): the lines `about` names, under the drawing with no headings, then its tile. */''}
    <section class="tb-about">${tbSections_(c, a.about, { bare: true })}</section>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Play again', note: 'from the start', act: 'tb-an-again' })}</div>
  </div>`;
}

/* ---------- AN ANIMATION'S STYLESHEET, ONCE, SHARED WITH THE SPLASH § */
function animStyle_(a) {
  if (!a || !a.id) return;
  let st = document.head.querySelector('style[data-anim="' + a.id + '"]');
  if (st && st.getAttribute('data-h') === a.h) return;
  if (!st) {
    st = document.createElement('style');
    st.setAttribute('data-anim', a.id);
    document.head.appendChild(st);
  }
  st.textContent = a.css;
  st.setAttribute('data-h', a.h);
}

/* ---------- AN id IS ONE ELEMENT, AND A DRAWING CAN BE ON THE PAGE TWICE § */
function animIds_(html, n) {
  const ids = [...String(html).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  if (!ids.length) return String(html);
  const any = ids.map(i => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return String(html).replace(new RegExp('(\\sid="|url\\(#|href="#)(' + any + ')(?=["\\)])', 'g'),
    (all, at, id) => at + id + '-t' + n);
}

/* ---------- ONLY THE ONE ON THE PAGE IN FRONT PLAYS, AND IT PLAYS FROM THE START § */
function tbAnimWatch_() {
  Object.keys(FINDERS).forEach(id => {
    const host = $('s-' + id);
    if (!host) return;
    const stages = host.querySelectorAll('.tb-an-stage');
    if (!stages.length) return;
    const here = AT === id ? host.querySelectorAll(':scope > .page')[domIndex_(id, PAGE[id] || 0)] : null;
    tbAnimSet_(stages, here);
  });
}
function tbAnimSet_(stages, here) {
  stages.forEach(st => {
    const on = !!here && here.contains(st);
    if (on && !st.classList.contains('is-on')) {
      st.innerHTML = st.innerHTML;
      st.classList.add('is-on');
    } else if (!on && st.classList.contains('is-on')) st.classList.remove('is-on');
  });
}
/* PLAY AGAIN: the same restart, on the tile's own stage. */
on('tb-an-again', el => {
  const card = el && el.closest('.card');
  const st = card && card.querySelector('.tb-an-stage');
  if (st) st.innerHTML = st.innerHTML;
});


/* THE CHAPTER WHOSE DRAWING IS THIS TIMELINE: an animation titled with the era ("World War 2, 1939–45"). check-history-db holds it. */
function histTimelineChapter_(era) {
  if (!era) return null;
  for (const b of DATA.textbooks || []) for (const c of b.chapters || []) {
    const a = (c.animations || []).find(n => String(n.title).indexOf(era) === 0);
    if (a) return { key: 'ct:' + b.id + '-' + c.n, title: a.title };
  }
  return null;
}

/* ---------- A FINGERPRINT OF AN ANIMATION, SO A CHANGED ONE REPLACES THE COPY A DEVICE KEPT § */
function animHash_(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}

    /* IN FILE ORDER, which is page order: § */
    anims.forEach(r => {
      const b = books[libS(r.book_id).trim()];
      const c = b && b.chapters.find(ch => ch.n === libN(r.chapter));
      if (!c) return;
      const html = libS(r.html), css = libS(r.css);
      c.animations.push({ id: libS(r.anim).trim(), title: libS(r.title),
                          about: libS(r.about).split('|').map(t => t.trim()).filter(Boolean),
                          html: html, css: css, h: animHash_(html + '\u0000' + css) });
    });


function tlExtras_(x) { const ch = histTimelineChapter_(x.era); return ch ? [{ icon: 'play', label: 'Animation', note: ch.title, act: 'find-open', data: { key: ch.key } }] : null; }
