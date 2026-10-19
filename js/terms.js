/* @family. — terms.js ONE FILE, SPLIT. § */


/* THE DOCUMENTS THE BUSINESS PUBLISHES — the tutor agreement, the client terms, the booking and safeguarding policies — held in the `terms` tab and drawn from it. § */


/* ---------- THE ROWS, GROUPED INTO DOCUMENTS § */
function termsDocs_() {
  const rows = (DATA.terms || []).filter(r => r && r.docid && r.version);
  if (!rows.length) return [];

  const by = {};
  rows.forEach(r => {
    const key = r.docid + '\u0000' + r.version;
    (by[key] = by[key] || { docid: r.docid, version: r.version, live: r.live || '',
                            audience: r.audience || '', title: r.title || r.docid,
                            mustsign: false, sections: [] });
    by[key].sections.push(r);
    if (r.mustsign) by[key].mustsign = true;
  });

  /* THE LIVE ONE, PER DOCUMENT. § */
  const best = {};
  Object.keys(by).forEach(k => {
    const d = by[k];
    if (termsWhenNum_(d.live) > termsNow_()) return;      // published, but not yet in force
    const held = best[d.docid];
    if (!held || termsWhenNum_(d.live) >= termsWhenNum_(held.live)) best[d.docid] = d;
  });

  return Object.keys(best).map(k => {
    const d = best[k];
    d.sections = d.sections.slice().sort((a, b) => (Number(a.seq) || 0) - (Number(b.seq) || 0));
    return d;
  }).sort((a, b) => cmpText(a.title, b.title));
}

/* dd/mm/yyyy to a number that sorts. Anything else — blank, an ISO string, a typo — comes back 0,
   which reads as "in force since the beginning" and is the right answer for a document somebody
   published without filling the date in. */
function termsWhenNum_(v) {
  const m = String(v || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
}
function termsNow_() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/* WHAT THIS PERSON HAS AGREED TO. The backend sends only their own — see the note in terms.gs about
   why the register is not on every parent's phone. */
function termsSigned_(docid) {
  return String((DATA.termsAccepted || {})[docid] || '');
}
function termsSignedWhen_(docid) {
  return String((DATA.termsAcceptedWhen || {})[docid] || '');
}

/* WHO A DOCUMENT IS FOR, in the words the funnel will show as an answer. The sheet says `tutor` or
   `client`; a filter answer reading "tutor" in lower case beside "Learning" and "Booking" is the
   sort of thing that looks like a bug. */
function termsAudience_(a) {
  const s = String(a || '').trim().toLowerCase();
  return s === 'tutor'  ? 'For tutors'
       : s === 'client' ? 'For families'
       : s === 'all'    ? 'For everyone'
       : (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'For everyone');
}


/* ==================================================================================================
   IN THE FUNNEL
================================================================================================== */

/* ---------- ONE ITEM PER DOCUMENT § */
function docItems_() {
  return termsDocs_().map(d => ({
    kind: 'doc',
    /* THE VERSION IS NOT IN THE NAME. § */
    name: d.title,
    key: d.docid,
    sub: termsAudience_(d.audience),
    kindLabel: termsAudience_(d.audience),
    row: d,
    image: '', cost: 0, slot: '', subject: '', grade: '', off: false,
    bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
    documentType: '', examWave: '', year: '', paper: false,
  }));
}

/* ---------- THE CARD § */
function docCard_(x) {
  const d = x.row;
  const signed = termsSigned_(d.docid);
  const when = termsSignedWhen_(d.docid);
  const current = signed && signed === d.version;
  const stale = signed && signed !== d.version;

  const state = !d.mustsign
    ? `<p class="faint">For reference. Nothing to sign.</p>`
    : current
      ? `<p class="sub ok">You agreed to this version${when ? ' on ' + esc(termsDay_(when)) : ''}.</p>`
      : stale
        ? `<p class="sub warn">You agreed to version ${esc(signed)}, and the current version is
           ${esc(d.version)}. Please read it again.</p>`
        : `<p class="sub warn">Not yet agreed.</p>`;

  return `<div class="card">
    <h3>${esc(d.title)}</h3>
    <p class="sub">${esc(termsAudience_(d.audience))}
      <span class="faint">· version ${esc(d.version)}${d.live ? ' · in force from ' + esc(d.live) : ''}</span></p>
    ${state}
    <div class="btn-row" style="margin-top:.6rem">
      <button class="btn" data-do="doc-read" data-doc="${esc(d.docid)}">Read it</button>
    </div>
  </div>`;
}

/* An ISO timestamp as a day. The register stores the moment, which is right — it is evidence — and
   nobody reading a card wants the milliseconds. */
function termsDay_(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}


/* ==================================================================================================
   READING IT
================================================================================================== */

/* ---------- THE WHOLE DOCUMENT, IN A SHEET § */
on('doc-read', el => {
  const id = el.dataset.doc;
  const d = termsDocs_().find(x => x.docid === id);
  if (!d) return toast('That document is not published.');

  const signed = termsSigned_(d.docid);
  const current = signed && signed === d.version;

  const body = d.sections.map(s => `
    <div class="doc-part">
      ${s.heading ? `<h4>${esc(s.heading)}</h4>` : ''}
      ${termsProse_(s.body)}
    </div>`).join('');

  const foot = !d.mustsign
    ? `<p class="faint">This one is for reference. There is nothing to agree to.</p>`
    : current
      ? `<p class="sub ok">You agreed to this version. Nothing more to do.</p>`
      : `<div class="btn-row">
           <button class="btn primary" data-do="doc-accept"
                   data-doc="${esc(d.docid)}" data-version="${esc(d.version)}">
             I have read this and I agree
           </button>
         </div>
         <p class="faint">Your name, the version and the date are recorded.</p>`;

  openSheet(d.title, `
    <p class="sub">${esc(termsAudience_(d.audience))}
      <span class="faint">· version ${esc(d.version)}${d.live ? ' · in force from ' + esc(d.live) : ''}</span></p>
    <div class="doc">${body}</div>
    ${USER ? foot : `<p class="faint">Sign in to agree to this.</p>`}
  `);
});

/* ---------- THE PROSE § */
function termsProse_(s) {
  const src = String(s || '').replace(/\r/g, '');
  return src.split(/\n{2,}/).map(block => {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines.length) return '';
    if (lines.every(l => /^\s*[-•]\s+/.test(l))) {
      return '<ul>' + lines.map(l =>
        '<li>' + termsMarks_(l.replace(/^\s*[-•]\s+/, '')) + '</li>').join('') + '</ul>';
    }
    return '<p>' + lines.map(l => termsMarks_(l)).join('<br>') + '</p>';
  }).join('');
}
function termsMarks_(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}


/* ==================================================================================================
   AGREEING
================================================================================================== */

/* THE TIMESTAMP IS THE BACKEND'S, not this one's — see terms.gs. § */
on('doc-accept', el => {
  const docid = el.dataset.doc, version = el.dataset.version;
  if (!USER) return toast('Sign in first.');
  el.disabled = true;
  el.textContent = 'Recording…';
  send({ action: 'acceptTerms', docid, version,
         name: USER.name || '', personId: USER.personId || USER.personid || '',
         agent: navigator.userAgent || '' })
    .then(() => load())
    .then(() => { closeSheet && closeSheet(); toast('Agreed. Thank you.'); })
    .catch(err => {
      el.disabled = false;
      el.textContent = 'I have read this and I agree';
      toast(String((err && err.message) || err));
    });
});


/* ==================================================================================================
   THE PROMPT, ON THE ACCOUNT COLUMN
================================================================================================== */

/* ---------- WHAT YOU HAVE NOT SIGNED, WHERE YOU CANNOT MISS IT § */
function termsPages_() {
  if (!USER) return [];
  const mine = (USER.role || '').toLowerCase() === 'tutor' ? 'tutor'
             : (USER.role || '').toLowerCase() === 'admin' ? '' : 'client';

  return termsDocs_().filter(d => {
    if (!d.mustsign) return false;
    const aud = String(d.audience || '').toLowerCase();
    if (mine && aud && aud !== 'all' && aud !== mine) return false;
    return termsSigned_(d.docid) !== d.version;
  }).map(d => {
    const signed = termsSigned_(d.docid);
    return `<div class="card">
      <h3>${esc(d.title)}</h3>
      <p class="sub warn">${signed
        ? `These terms have changed since you agreed to them.`
        : `Please read and agree to this before your first session.`}</p>
      <div class="btn-row" style="margin-top:.6rem">
        <button class="btn primary" data-do="doc-read" data-doc="${esc(d.docid)}">Read it</button>
      </div>
    </div>`;
  });
}
