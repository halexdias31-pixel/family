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

/* ---------- EDITING A RESOURCE WAS HERE, AND A PAPER IS NOT EDITED FROM A PHONE NOW --------------
   `on('topic-edit')`, `on('topic-save')` and `on('topic-delete')` opened a sheet over a paper, and
   the sheet was BUILT FROM `DATA.resourceFields` — the server's own allow-list — so it could not
   offer a field the server would refuse and could not miss one it would accept. One list, two
   readers, and it was the right shape.

   BOTH READERS ARE GONE. The 3,913 rows left the spreadsheet for `data/questions.json` in this
   repository, so `editResource` and `deleteResource` have nothing to write a cell to and
   `resourceFields` is no longer on the payload. Deleting the form here rather than leaving it
   pointed at a missing action is the whole point: `doGet` publishes the action list precisely so
   the app can decide whether to OFFER a button, and a form that opens and cannot save is worse
   than no button at all.

   SO A RELABEL IS A COMMIT. Change the row in `data/questions.json` and push — one JSON object per
   line, so the diff names the papers that changed. That is a deploy rather than a cell, and it is
   the trade the move was made for: `questions` is the one tab nobody hand-edits.

   `FIELD_FROM` AND `FIELD_BOOL` WENT WITH IT. `FIELD_LABEL` and `fieldLabel` below did NOT — me.js
   reads them for every other form on the site.
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
  if (!USER) { toast('Sign in first'); goFor_('You'); return; }
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
  if (!USER) { toast('Sign in first'); goFor_('You'); return; }
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

/* ---------- LAMINATE, OR BACK TO PLAIN -----------------------------------------------------------
   A FLAG ON THE LINE, NOT A SECOND LINE. Two rows saying "Paper 31" and "Laminating Paper 31" is
   the same thing counted twice in a basket somebody is reading to check what they are buying — and
   it invites the state where the upgrade survives the paper being removed.

   AND NOT A SECOND NUMBER EITHER. The price is derived by `cartMoney_` every time it is asked for,
   so this writes a boolean and nothing has to be added or subtracted. See the note on `cartMoney_`.

   THE BASKET IS LOCAL, so the press IS the change — nothing to wait for and nothing to revert, the
   same argument `cart-add` makes. A repaint rather than `tileSet_` because the line's total and the
   basket's total both move, and they are three columns apart. */
on('cart-laminate', el => {
  const line = CART.find(c => c.key === el.dataset.key && c.kind === el.dataset.kind);
  if (!line) return;
  line.laminate = el.dataset.on === '1';
  cartSave();
  /* STAY WHERE YOU ARE — the same reason `cart-drop` says it. Turning an upgrade on should not
     move you off the basket page. */
  if (typeof paintStuff === 'function' && $('s-stuff')) paintStuff(true); else repaint();
  toast(line.laminate ? 'Laminated' : 'Back to plain paper');
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
/* `PAPER_CSS` WAS A WHOLE STYLESHEET IN A STRING and had to be: the tab it filled was a blank
   document with no stylesheet of its own. There is no tab. style.css already carried a `.qpaper`
   block written for exactly this — styled, and produced by nothing. Deleting the string is what
   connects the two. */

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
      h += `<div class="qsheet-stem">${r.html || ''}${
        r.diagram ? `<figure>${r.diagram}</figure>` : ''}</div>`;
      return;
    }
    marks += Number(r.marks) || 0;
    h += `<div class="qp-part">
      ${r.part ? `<span class="qsheet-pn">(${esc(r.part)})</span>` : ''}
      <div class="qp-body">
        ${r.lead ? `<div class="qsheet-lead">${r.lead}</div>` : ''}
        ${r.html || ''}
        ${/* THE DIAGRAM AFTER THE PROSE AND BEFORE THE MARKS, which is where a printed paper puts
              it: you read what is being asked, you look at the picture, and the marks are the last
              thing on the part. A `<figure>` because `.qpaper figure` and `.qpaper figure svg` have
              been in style.css since before anything could produce one. */''}
        ${r.diagram ? `<figure>${r.diagram}</figure>` : ''}
        ${r.marks ? `<p class="qp-marks">[${esc(r.marks)} mark${
          Number(r.marks) === 1 ? '' : 's'}]</p>` : ''}
        ${ansBox_(t, r)}
        ${/* AND THE MARK SCHEME UNDER YOUR OWN ANSWER, shut until asked for — the same block the
              single-question card draws, so a part looks identical whichever way it is reached.
              Your box comes FIRST deliberately: an answer you can see before you have written one
              is not a question. */''}
        ${typeof answerBlock_ === 'function' ? answerBlock_(r) : ''}
      </div>
    </div>`;
  });
  /* THE TOTAL IS ADDED UP RATHER THAN TYPED, so it cannot disagree with the questions above it. */
  return { html: h, marks: marks };
}

/* ---------- SOMEWHERE TO WRITE THE ANSWER --------------------------------------------------------
   A BOX PER PART, because that is what the paper has. The alternative — one box at the bottom — is a
   page of prose nobody can mark against a mark scheme that is written per part.

   IT IS KEPT IN `localStorage`, AND THAT IS NOT A SHORTCUT. These cards are rebuilt on every
   repaint — a filter changing, a payload landing, signing in — and a `<textarea>` rebuilt is a
   `<textarea>` emptied. Somebody four questions into a paper losing the lot because the sheet
   answered is the kind of fault that stops people trusting an app entirely. The browser remembers it
   instead, so a redraw, a swipe away or a reload all come back to what was typed.

   NOT SENT ANYWHERE, and the card says so. There is no endpoint that takes an answer and no tab to
   hold one, so this is a workbook and not a submission — promising otherwise by looking like a form
   would be worse than the plain box it is.

   THE KEY IS PAPER + QUESTION + PART, so two papers that both have a `3(a)` do not share a box.
   Every read and write is wrapped: private mode throws on `localStorage` rather than returning
   null, and a thrown getter here would take the whole paper down with it. */
const ansKey_ = (t, r) => 'ans:' + ((t && (t.id || t.name)) || '?') + '|' + (r.q || '') + '|' + (r.part || '');

function ansRead_(k) {
  try { return localStorage.getItem(k) || ''; } catch (e) { return ''; }
}

function ansBox_(t, r) {
  const k = ansKey_(t, r);
  return `<label class="qp-ans">
    <span class="qp-ans-k">Your answer</span>
    <textarea class="qp-ans-in" data-do="qp-ans" data-k="${esc(k)}"
      rows="2" spellcheck="false" autocomplete="off">${esc(ansRead_(k))}</textarea>
  </label>`;
}

/* SAVED AS IT IS TYPED, through the same delegated `change`/`input` route book.js uses for its typed
   fields — there is no Save button because there is nothing to save it TO, and a button that only
   wrote to the same browser would be a promise the app cannot keep. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (!el) return;
  try { localStorage.setItem(el.getAttribute('data-k') || '', el.value || ''); } catch (err) {}
});

/* `openPaper_` AND `on('paper-read')` MOVED TO find.js, beside the note explaining why they came
   back. They were removed once, when the whole paper was being printed onto every card in the
   results list and a button that opened it looked redundant; the card is the cover again, so
   reading is a tap again. `paperBody_` above never moved — it was always the paper rather than the
   popup, and the sheet, the old new-tab version and the inline one all built from it. */

