/* ==================================================================================================
   @family. — resource.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   resource.js is number 11 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */



/* ---------- ONE RESOURCE, AND NO SHEET FOR IT --------------------------------------------------
   `on('topic')` WAS HERE and is gone. It opened a panel that repeated the card — the name, the
   subject, the page count — and then offered the ticks, the PDF, the transcription and the
   printed copy. All four are buttons on the card now; see `topicTiles_` in tiles.js.
   The panel had to repeat the card because a panel floating over a list has to say which of the
   list it belongs to. That is the tell: a screen whose first job is to identify itself is a
   screen that did not need to exist.
--------------------------------------------------------------------------------------------- */

/* ---------- EDITING A RESOURCE, FROM THE BACKEND'S OWN LIST ---------------------------------------
   The form used to name seven fields by hand while the tab had twenty-five and the allow-list
   twenty. Adding a column meant a schema edit, an allow-list edit AND a form edit — and forgetting
   the third meant a column that existed, could be written to, and had nowhere to type it in.

   `resourceFields` has been in the payload the whole time. It IS the allow-list — the same object
   the server checks writes against — so a form built from it cannot offer a field the server will
   refuse, and cannot miss one the server would accept. One list, two readers.

   The groups come with it, so the form arrives already sectioned: What it is, Level, Source,
   Flags, Pages, Costs, Admin.
--------------------------------------------------------------------------------------------- */

/* A column name as a person would say it. Everything not named here is the column with its
   underscores taken out, which is right far more often than it is wrong — `exam_board` reads
   perfectly well as "exam board". */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', resource_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');

/* The ones that are a yes or a no rather than a value. A checkbox for these and a text box for
   everything else — a boolean in a text field is somebody typing TRUE and hoping. */
const FIELD_BOOL = ['trackable', 'print_required', 'printable', 'active'];

/* Where a field's value comes from on the topic object, when it is not simply the same name.
   The payload names things as a person would — `examBoard` — and the sheet as a column does. */
const FIELD_FROM = {
  band_type: 'bandType', band_value: 'bandValue', key_stage: 'keystage',
  exam_board: 'examBoard', exam_wave: 'examWave', resource_type: 'resourceType',
  print_required: 'paper', level_required: 'level', name: 'name', link: 'link',
};

on('topic-edit', el => {
  const t = topicBy(el.dataset.key);
  if (!t) return;

  const groups = (DATA.resourceFields && Object.keys(DATA.resourceFields).length)
    ? DATA.resourceFields
    /* A backend too old to send it. The form still opens, with what this file knows about — an
       admin who cannot edit anything is worse than one who can edit seven things. */
    : { 'What it is': ['name', 'subject', 'resource_type', 'link'],
        'Level': ['band_type', 'band_value'], 'Pages': ['pages', 'printable'] };

  /* Values already known, offered as you type. Every value any resource has for that field, which
     is how "Edexcel" gets typed once and picked thereafter — and how three spellings of one board
     stop happening. */
  const known = f => {
    const from = FIELD_FROM[f] || f;
    return uniq(allTopics().map(x => String(x[from] ?? '').trim())).filter(Boolean).sort(cmpText);
  };

  openSheet('Edit — ' + t.name,
    fieldsHtml(groups, {
      attr: 'data-ed',
      /* A resource's own column names differ from the form's in places — `FIELD_FROM` is the map,
         and it belongs here rather than in the renderer, which should not need to know that this
         one editor renames things. */
      value: f => t[FIELD_FROM[f] || f] ?? '',
      /* What every other row already says, offered rather than enforced. */
      suggest: known,
    })
    + `<button class="btn" data-do="topic-save" data-key="${esc(t.id || t.name)}">Save</button>
       <p class="faint" id="ed-said" style="margin:.6rem 0 0">
         Changing the link clears the page count — it was read off the old file.</p>`);
});

on('topic-save', el => {
  const said = $('ed-said');

  /* WHATEVER THE FORM PUT ON THE PAGE, read back by the name it was given. The old version listed
     the seven fields again — a third place to forget one, and the reason adding a column meant
     three edits. */
  const fields = {};
  document.querySelectorAll('#sheet-body [data-ed]').forEach(box => {
    fields[box.dataset.ed] = box.type === 'checkbox'
      ? (box.checked ? 'TRUE' : 'FALSE')
      : String(box.value || '').trim();
  });

  if (!String(fields.name || '').trim()) {
    if (said) said.textContent = 'It needs a name.';
    return;
  }

  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'editResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* Two presses, the same as a post. The button becomes the question rather than handing the screen
   to a browser dialogue that cannot speak in this app's words. */
on('topic-delete', el => {
  const restoring = !!el.dataset.on;
  if (!el.dataset.sure && !restoring) {
    el.dataset.sure = '1';
    el.textContent = 'Really delete?';
    setTimeout(() => { if (el.dataset.sure) { delete el.dataset.sure; el.textContent = 'Delete'; } }, 4000);
    return;
  }
  const said = $('topic-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deleteResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast(restoring ? 'Back on the list' : 'Deleted — still there, switched off');
      load();
    })
    .catch(err => {
      el.disabled = false; delete el.dataset.sure;
      el.textContent = restoring ? 'Restore' : 'Delete';
      if (said) said.textContent = String(err.message || 'Could not do that');
    });
});

/* ---------- `on('shop-item')` WAS HERE -----------------------------------------------------------
   THE LAST OF THEM. It opened a panel showing the drawing, the slot, the level or the price, and
   one button — over a card that already draws the object and names its slot and its cost. The
   button is `wearTiles_` in tiles.js now, and it still says which act it is: put it on, buy and
   wear it, or how many ticks away it is.
--------------------------------------------------------------------------------------------- */

/* PUTTING SOMETHING ON. The WHOLE look is sent, not the one change — the server re-checks every
   piece against what this person has earned, so the phone only ever has to know how to draw.
   That is the same request the wardrobe makes, which is why buying has no separate path that
   could succeed while the wearing failed. */
on('wear', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  cfg[el.dataset.slot] = el.dataset.id;
  /* SAID BEFORE IT IS TRUE, because it almost always becomes true and the wait is the only part
     anybody would notice.

     READ OFF `title`, NOT OFF THE SPANS. A tile has no word on it any more — the name is the title
     and the aria-label, and `.tile-k` / `.tile-v` no longer exist — so this was reading two nulls
     and putting `undefined` back on failure. One attribute holds "Wear · 40 credits" whole, which
     is exactly what has to be restored. */
  const was = { label: el.getAttribute('title') || 'Wear' };
  tileSet_(el, { label: 'Putting it on…', off: true });

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      /* NO SHEET TO CLOSE — this now runs from a row on the card itself. */
      tileSet_(el, { label: 'Wearing it', on: true, off: true });
      toast((d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Wearing it');
      /* ---------- THE ONE PLACE A REDRAW IS STILL RIGHT ------------------------------------------
         WEARING SOMETHING CHANGES OTHER CARDS. Credits came off, so every priced wearable on the
         screen can now afford differently, and whatever was in this slot before is no longer being
         worn. That is not one button changing its word — it is the list being out of date — and a
         redraw is the honest answer to that rather than a shortcut.
         The basket is the opposite case and is why it does not do this: adding a line changes
         exactly one button and nothing else on the screen knows or cares. */
      repaint();
    })
    .catch(err => {
      /* PUT BACK EXACTLY WHAT WAS THERE. `el.textContent = 'Try again'` was written here, which on
         a tile replaces both spans with one string — the word, the price and the markup with it,
         so a failed purchase left a button that could never be styled or read again. */
      tileSet_(el, { label: was.label, off: false });
      toast(String(err.message || err));
    });
});

/* ---------- THE BASKET ---------------------------------------------------------------------------
   Kept on the phone, not the server. A basket is a half-formed intention — abandoning one should
   cost nothing and leave no trace, and a row in a spreadsheet for something nobody decided on is
   a row you have to clean up later.

   It survives a refresh, because the commonest way to lose a basket is to close a tab by accident.

   TWO CURRENCIES, NEVER ADDED. Credits buy shop items; pounds pay for paper. 5 credits and £0.86
   is not 91 of anything, and a single total would be the kind of wrong that looks right until
   somebody is charged.
--------------------------------------------------------------------------------------------- */
let CART = [];
try { CART = JSON.parse(localStorage.getItem('familyCart') || '[]'); } catch {}
const cartSave = () => { try { localStorage.setItem('familyCart', JSON.stringify(CART)); } catch {} };

on('cart-add', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const key = el.dataset.key;
  const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
  /* Keyed on BOTH, because a printed copy and a shop item can share a name and they are not the
     same line. The old test dropped the second one silently. */
  if (CART.some(c => c.key === key && c.kind === kind)) { toast('Already in your basket'); return; }

  if (kind === 'print') {
    const t = topicBy(key);
    if (!t || !canPrint(t)) { toast('That one is not priced for printing'); return; }
    CART.push({ key, name: t.name, kind, cost: 0, money: printPrice(t.pages), pages: t.pages });
  } else if (kind === 'topic') {
    const t = topicBy(key);
    if (!t) return;
    CART.push({ key, name: t.name, kind, cost: 0, money: 0 });
  } else {
    const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
    if (!src) return;
    CART.push({ key, name: src.name, kind, cost: Number(src.price) || 0, money: 0 });
  }

  cartSave();
  /* ---------- THE SHAPE FILLS, AND NOTHING ELSE MOVES -------------------------------------------
     THIS CALLED `repaint()` — the whole screen rebuilt, forty cards, the search box and the pager,
     so that one button could change its word. On a list that is a visible flinch and it drops the
     keyboard with it.

     THE BASKET IS LOCAL. It lives in localStorage and nothing has to agree to it, so there is no
     request to wait for and no failure to revert: the press IS the change. That is the whole reason
     this can be the simplest of them. */
  tileSet_(el, { label: 'In your basket', note: '', on: true, off: true });
  toast('In your basket — ' + CART.length + ' item' + (CART.length === 1 ? '' : 's'));
});

on('cart-drop', el => {
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  /* THE PAGE COUNT CHANGES when the last thing leaves the basket — the basket page stops being
     drawn at all — so this is a rebuild rather than a repaint. `paintStuff` handles both, and
     knows not to disturb the search box while it does. */
  /* STAY WHERE YOU ARE. Taking a line off the basket should not move you off the basket. */
  if (typeof paintStuff === 'function' && $('s-stuff')) paintStuff(true); else repaint();
});

/* ---------- `on_openCart` AND `on('open-cart')` WERE HERE ------------------------------------------
   A SECOND BASKET, IN A SHEET. It drew the same lines, the same total and the same Send button as
   `basketPages` in collections.js, over the top of whatever you were looking at — two versions of
   one screen, kept in two files, and only one of them had been fixed when a long title started
   pushing prices off the edge. That is exactly how the two come to disagree about what is in your
   basket.

   The basket is a page in front of the question on Find. There is nothing to pop out.

   ITS BETTER WORDING SURVIVED. "Pay £0.92" rather than "Send", "N more credits needed" on a button
   that cannot be pressed, and the line about printing being charged at cost — all of it says more
   than the page version did, and all of it moved there. */

on('cart-send', () => {
  toast('Checkout is the next thing to build');
});
/* ==================================================================================================
   THE WHOLE PAPER, READ FROM THE ROWS THAT ALREADY DRAW ITS QUESTIONS.

   Nothing here is new data. `questions` has carried the stems, the leads and the parts since it was
   built, and the question cards have been drawing them one at a time. What was missing was the
   obvious thing to do with twenty rows that share a `paper_id`: put them in order and read them.
================================================================================================== */

/* One paper's rows, in printed order. Numeric on the question, alphabetical on the part — sorted as
   TEXT, Q10 falls between Q1 and Q2, which is right for a filing cabinet and wrong for a paper. */
function paperRows(t) {
  const id = t && (t.id || t.rowId);
  if (!id) return [];
  /* THROUGH `paperIdOf_`, which is the one reader for this column — see find.js. This was the
     fourth copy of the same three-name test, and the copy in `allTopics` was the one that had a
     name missing and emptied the entire paper list. */
  return (DATA.questions || [])
    .filter(r => paperIdOf_(r) === id)
    .sort((a, b) => (Number(a.q) || 0) - (Number(b.q) || 0)
                 || String(a.part || '').localeCompare(String(b.part || '')));
}

/* `papersWithQuestions_` WAS HERE. It answered "which paper is next" for the flick inside the open
   sheet, and there is no sheet — a paper opens in a tab of its own now. Nothing else ever called it.
   `check-dead.js` would have named it on the next run anyway. */

/* ==================================================================================================
   A PAPER OPENS AS A PAGE OF ITS OWN, IN A NEW TAB.

   IT WAS A SHEET — the app's overlay, sliding up over the card you pressed. That was the last sheet
   left in the app, and it was the wrong shape for this one thing above all others: a past paper is
   a DOCUMENT. You read it beside something else, you scroll it for twenty minutes, you print it,
   you keep the tab open while you work. An overlay can do none of those; it can only be dismissed.

   AND IT IS THE THING THE TROLLEY SELLS. `Paper` charges for a printed copy, and until now nothing
   in the app could actually produce one — the sheet had the app's chrome around it and the app's
   dark theme through it. A tab holding nothing but the paper is Ctrl-P away from the thing being
   bought, which makes the price honest.

   WHAT IS LOST, and it is worth saying: the sheet could be flicked left and right to the paper
   before or after this one. A tab cannot. That was a nice way to browse and a poor way to read, and
   reading is what this is for — the funnel is how you find the next one.

   ---------------------------------------------------------------------------------------------
   THE STYLES TRAVEL WITH IT. A new tab shares nothing with the app — no stylesheet, no variables —
   so the paper carries its own, inline and complete. They are deliberately NOT a copy of the app's:
   this is black on white, because that is what an exam paper is and because it is what comes out of
   a printer without anybody changing a setting.
================================================================================================== */
const PAPER_CSS = `
  :root { --ink: #14130f; --faint: #6b675e; --rule: #cfc9bd; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2.2rem 1.4rem 4rem; background: #fff; color: var(--ink);
    font: 400 15px/1.55 ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace;
  }
  main { max-width: 46rem; margin: 0 auto; }
  .qp-title { margin: 0 0 .2rem; font-size: 1.35rem; font-weight: 700; letter-spacing: -.01em; }
  .qp-head { margin: 0 0 1.6rem; padding-bottom: .9rem; color: var(--faint);
             font-size: .82rem; border-bottom: 1px solid var(--rule); }
  .qp-sec { margin: 2.2rem 0 .9rem; font-size: .78rem; font-weight: 700;
            letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .qp-q { margin: 1.9rem 0 .5rem; font-size: 1.05rem; font-weight: 700; }
  .qsheet-stem { margin: .4rem 0 .9rem; }
  .qp-part { display: flex; gap: .55rem; margin: 0 0 1.1rem; }
  .qsheet-pn { flex: 0 0 auto; font-weight: 700; }
  .qp-body { flex: 1 1 auto; min-width: 0; }
  .qsheet-lead { margin: 0 0 .35rem; }
  .qp-marks { margin: .35rem 0 0; text-align: right; color: var(--faint); font-size: .85rem; }
  .qp-end { margin: 2.5rem 0 0; padding-top: .9rem; border-top: 1px solid var(--rule);
            text-align: center; color: var(--faint); font-size: .8rem; letter-spacing: .1em; }
  img, svg, table { max-width: 100%; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid var(--rule); padding: .3rem .5rem; text-align: left; }
  /* ON PAPER: no page break inside a question, and the browser's own header is enough of a title. */
  @media print {
    body { padding: 0; font-size: 12pt; }
    .qp-q, .qp-part { break-inside: avoid; page-break-inside: avoid; }
  }
`;

/* The questions, as printed order. Shared by the tab and by nothing else — but kept separate from
   the document around it so the two can be read apart. */
function paperBody_(t) {
  const rows = paperRows(t);
  if (!rows.length) return null;

  let h = '', section = null, q = null, marks = 0;
  rows.forEach(r => {
    /* A SECTION HEADING WHERE THE SECTION CHANGES, not one per question. */
    if (r.section && r.section !== section) {
      section = r.section;
      h += `<h2 class="qp-sec">Section ${esc(section)}</h2>`;
    }
    if (r.q !== q) {
      q = r.q;
      h += `<h3 class="qp-q">${esc(r.q)}</h3>`;
    }
    /* THE STEM IS THE SHARED PART and prints once, above the parts that need it — which is the
       whole reason it is a row of its own rather than a copy on each part. */
    if (r.kind === 'stem') {
      h += `<div class="qsheet-stem">${r.html || ''}</div>`;
      return;
    }
    marks += Number(r.marks) || 0;
    h += `<div class="qp-part">
      ${r.part ? `<span class="qsheet-pn">(${esc(r.part)})</span>` : ''}
      <div class="qp-body">
        ${r.lead ? `<div class="qsheet-lead">${r.lead}</div>` : ''}
        ${r.html || ''}
        ${r.marks ? `<p class="qp-marks">[${esc(r.marks)} mark${
          Number(r.marks) === 1 ? '' : 's'}]</p>` : ''}
      </div>
    </div>`;
  });
  /* THE TOTAL IS ADDED UP RATHER THAN TYPED, so it cannot disagree with the questions above it. */
  return { html: h, marks: marks };
}

function openPaper_(t) {
  const body = paperBody_(t);
  if (!body) { toast('No questions written up for this one yet'); return; }

  /* THE TAB IS OPENED FIRST AND EMPTY, before anything is built. A browser allows a new window only
     while it can still see the click that asked for it, and building the document first hands that
     back — the tab is then a pop-up and is blocked. Opening it empty and filling it afterwards is
     the order that survives. */
  const w = window.open('', '_blank');
  if (!w) { toast('Allow pop-ups to open papers'); return; }

  const head = [t.examBoard, waveOf(t), t.keystage].filter(Boolean).join(' · ');
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(t.name)}</title><style>${PAPER_CSS}</style></head>
    <body><main>
      <h1 class="qp-title">${esc(t.name)}</h1>
      <p class="qp-head">${esc(head)}${body.marks ? (head ? ' · ' : '') + body.marks + ' marks' : ''}</p>
      ${body.html}
      <p class="qp-end">END OF QUESTIONS</p>
    </main></body></html>`);
  /* CLOSED EXPLICITLY. Without it the tab keeps its loading spinner turning for ever, which reads
     as a page that never finished. */
  w.document.close();
}

on('paper-read', el => {
  const key = el.getAttribute('data-key');
  const t = (allTopics() || []).find(x => (x.id || x.name) === key);
  if (!t) { toast('That paper is not in the sheet'); return; }
  openPaper_(t);
});
