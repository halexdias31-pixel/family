/* ==================================================================================================
   @family. — terms.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   terms.js is listed in index.html; the list is the order. It comes AFTER find.js, because the
   `doc` kind in find.js names `docCard_` — inside an arrow, so it is not read until a card is
   drawn, by which time this file has loaded. Before find.js would also work; after is where the
   feature is, so after is where it goes.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ==================================================================================================
   THE DOCUMENTS THE BUSINESS PUBLISHES — the tutor agreement, the client terms, the booking and
   safeguarding policies — held in the `terms` tab and drawn from it.

   NOTHING HERE KNOWS WHAT A POLICY SAYS. It moves rows. Every word a tutor reads is typed in the
   sheet, which is the only reason changing a clause does not mean changing a file, waiting for
   GitHub Pages, and hoping the phone in their hand is not still running last week's.

   ONE ROW PER SECTION, NOT ONE PER DOCUMENT. A fifteen-clause agreement in a single cell is a cell
   nobody will edit twice — and the section is the unit that actually changes: you rewrite the rate
   clause, not the agreement. `seq` orders them, `heading` titles them, `body` is the prose.

   READING AND SIGNING ARE DIFFERENT JOBS, and this is the thing the first design got wrong by
   doing only the second. The signature prompt belongs where it cannot be missed — see
   `termsPages_`, which puts anything unsigned on the account column. The LIBRARY belongs in the
   funnel, where somebody goes when they want to check what the cancellation policy actually says
   six weeks after agreeing to it. Same rows, two doors, and neither is a substitute for the other:
   a prompt you have to go looking for is not a prompt, and a document you can only reach by not
   having signed it is not a library.
================================================================================================== */


/* ---------- THE ROWS, GROUPED INTO DOCUMENTS -----------------------------------------------------
   ONLY THE LIVE VERSION OF EACH. The tab holds every version ever published — that is the point of
   `version`, and the rule that a published version is never edited in place depends on the old rows
   staying there. So the newest `live` date not in the future wins, and everything behind it is
   history rather than clutter.

   DATES ARE dd/mm/yyyy, AS THE SHEET SHOWS THEM. `Date.parse` reads that as month-first or as
   nothing at all depending on the browser, which would silently promote a document that is not in
   force yet — so it is split on the slashes rather than parsed.
--------------------------------------------------------------------------------------------- */
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

  /* THE LIVE ONE, PER DOCUMENT. Sorted by date rather than by version string, because `2026-09-b`
     sorting after `2026-09-a` is a happy accident of how they were named and not something to rely
     on the day somebody types `2026-10` or `v2`. */
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

/* ---------- ONE ITEM PER DOCUMENT ----------------------------------------------------------------
   EVERY AUDIENCE TO EVERYBODY, deliberately, and it is the same decision the backend already makes
   for the payload. A tutor being able to read the client terms is a feature: the two documents
   describe two halves of the same arrangement, and somebody who can only see their own half cannot
   check that the halves agree.

   `kindLabel` CARRIES THE AUDIENCE, so the second question — What kind — splits the library into
   `For tutors` and `For families` with no new facet, no new column, and no new line in FACETS. The
   coverage rule then keeps every other question away: a policy has no exam board, no tier and no
   key stage, so none of them is ever asked once you are in Paperwork.

   NOTHING ELSE IS FILLED IN. The fields below are the shape every item in this list has, and a doc
   answers almost none of them — which is exactly what makes the funnel stop asking.
--------------------------------------------------------------------------------------------- */
function docItems_() {
  return termsDocs_().map(d => ({
    kind: 'doc',
    /* THE VERSION IS NOT IN THE NAME. It is on the card and in the sheet, where somebody checking
       which version they agreed to will look — putting it in the title would sort `Tutor agreement
       2026-09-b` away from `Tutor agreement` the first time one is superseded. */
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

/* ---------- THE CARD -----------------------------------------------------------------------------
   WHAT IT SAYS BEFORE YOU OPEN IT: who it is for, which version, and whether you have agreed to it.
   That last line is the reason this card exists rather than the document simply opening — "you
   agreed to version 2026-09-a on 4 September" is the question somebody has when they come looking,
   and answering it on the card saves opening the thing at all.

   A SUPERSEDED SIGNATURE IS NOT A SIGNATURE, and it says so. Agreeing to `2026-09-a` when
   `2026-09-b` is live means the terms changed after you signed, which is precisely the case the
   version column exists to catch — so it is called out rather than shown as a tick.
--------------------------------------------------------------------------------------------- */
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

/* ---------- THE WHOLE DOCUMENT, IN A SHEET -------------------------------------------------------
   EVERY SECTION, IN `seq` ORDER, WITH ITS HEADING. No pagination and no accordion: a contract you
   have to expand fourteen times is a contract nobody reads to the end, and "I did not see that
   clause" is the one objection this whole feature exists to prevent.

   THE BUTTON IS AT THE BOTTOM, AFTER THE TEXT. Not because scrolling proves reading — it does not —
   but because a button above the thing it agrees to is a button somebody presses first.
--------------------------------------------------------------------------------------------- */
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

/* ---------- THE PROSE ----------------------------------------------------------------------------
   ESCAPED FIRST, THEN THE THREE MARKS THAT ARE ALLOWED BACK. The body comes out of a spreadsheet
   cell somebody typed, which is not a threat but is not markup either — and a policy that renders
   an ampersand as `&amp;` is a policy that looks broken.

   BLANK LINE IS A PARAGRAPH. A LINE STARTING `- ` IS A BULLET. `**x**` IS BOLD. Nothing else, and
   deliberately: every mark added here is a mark somebody has to know about before they can edit a
   clause, and the person editing clauses is you at eleven at night.
--------------------------------------------------------------------------------------------- */
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

/* THE TIMESTAMP IS THE BACKEND'S, not this one's — see terms.gs. What goes up is which document and
   which version was on screen, and the server checks that version against the sheet before writing
   anything, because a version that matches no published row records agreement to a document that
   does not exist.

   THE PAYLOAD IS REFRESHED AFTERWARDS rather than the answer being patched in locally. The card
   reads `DATA.termsAccepted`, so patching would mean two places that know what you signed and one
   of them being a guess. */
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

/* ---------- WHAT YOU HAVE NOT SIGNED, WHERE YOU CANNOT MISS IT -----------------------------------
   ONLY THE UNSIGNED, AND ONLY THE ONES THAT NEED SIGNING. A column that shows five documents you
   have already agreed to is a column you learn to swipe past, and then the one that matters arrives
   into a habit of ignoring it.

   AUDIENCE IS FILTERED HERE AND NOWHERE ELSE. The library shows a tutor the client terms on purpose;
   a PROMPT to sign the client terms is a different thing, and asking a tutor to agree to the
   families' cancellation policy is asking them to agree to something that does not apply to them.

   `accountPages_` IN find.js APPENDS THIS. One line: `.concat(termsPages_())`.
--------------------------------------------------------------------------------------------- */
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
