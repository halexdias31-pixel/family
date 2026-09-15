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
  exam_board: 'exam board', exam_wave: 'exam wave', document_type: 'type',
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

  /* ---------- `print` AND `topic` WERE TWO OF THE THREE KINDS, AND BOTH LOOKED A DOCUMENT UP -----
     `topicBy` is gone with the documents — see `questionItems` in find.js. Nothing in the app now
     builds a `print` or `topic` line, so both branches were unreachable code that still named a
     function that no longer exists. The kind list above keeps them, because a basket saved in
     somebody's `localStorage` from yesterday still has such lines in it and they have to draw and
     be removable rather than throw. */
  {
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

/* ---------- `paperRows` AND `paperBody_` WERE HERE, AND SO WAS THE ANSWER BOX ---------------------
   `paperRows` gathered one paper's questions in printed order — numeric on the question, alphabetic
   on the part, because sorted as text Q10 falls between Q1 and Q2. `paperBody_` typeset them: a
   section heading where the section changed, the question number once, the stem above the parts
   that read it, then each part with its lead, its marks, a box to write in and the mark scheme shut
   underneath.

   NOTHING BUILDS A WHOLE PAPER ANY MORE. The funnel lists questions and `questionCard_` in find.js
   draws one — the same stem, lead, part, diagram and mark scheme, off the same row, for one
   question instead of forty-seven. See the note above `questionItems`.

   THE ANSWER BOX WENT WITH IT, and that is the one thing here worth wanting back. `ansBox_` gave
   every part a `<textarea>` kept in `localStorage`, keyed on paper + question + part, so a redraw
   or a reload came back to what had been typed. It belonged to reading a whole paper in order. On a
   funnel that lists 3,271 questions it would be 3,271 textareas, which is a different proposition
   entirely — so it is not quietly carried over, and if answers are wanted the place for them is a
   surface built to be worked through rather than one built to be searched.
--------------------------------------------------------------------------------------------- */

/* `openPaper_` AND `on('paper-read')` MOVED TO find.js, beside the note explaining why they came
   back. They were removed once, when the whole paper was being printed onto every card in the
   results list and a button that opened it looked redundant; the card is the cover again, so
   reading is a tap again. `paperBody_` above never moved — it was always the paper rather than the
   popup, and the sheet, the old new-tab version and the inline one all built from it. */

