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
  /* Inside a group already called "Library card", "library card" and "library pin" say the word
     twice and read as two different cards. The group names the thing; these name the parts. */
  library_card: 'card number', library_pin: 'PIN', library_note: 'note to yourself',
  /* ---------- AND THE TWO EXAMS, IN THE WORDS THEY WERE ASKED FOR IN ---------------------------
     `exam_small_date` UNDERSCORE-STRIPPED IS "exam small date", which reads as nothing anybody
     says — and inside a group already called "Exam dates" it says both words twice, which is the
     argument written three lines up about the library card.

     NOT SHORTENED TO "small" AND "big", WHICH IS WHERE THIS STOPS COPYING THAT ONE. There the two
     parts are self-describing once the group has named the thing ("card number", "PIN"); here
     "small" alone on a card is a size of nothing. So the repetition is kept and the caption is the
     owner's own sentence — *"like Small exam: _____ big exam:_____"* — which is also what a student
     will recognise: the mock and the real one. */
  exam_small_date: 'small exam', exam_big_date: 'big exam',
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
  if (!USER) { toast('Sign in first'); go('account'); return; }
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
  if (!USER) { toast('Sign in first'); go('account'); return; }
  /* A BUNDLE IS PAPERS, SO IT GOES IN AS PAPERS — see `cartAddBundle_` below. */
  if (el.dataset.kind === 'bundle') { cartAddBundle_(el); return; }
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

/* ---------- A BUNDLE GOES IN AS ONE LINE PER PAPER, NOT AS ONE LINE --------------------------------
   TWO SHAPES WERE POSSIBLE AND THE ASK DECIDES BETWEEN THEM. When the basket became a tool the
   owner described it as *"only recording items and sheets and wether to upgrade a specific sheet to
   lamininated"* — per SHEET. One `bundle` line would put one laminate switch over six papers, and a
   family that wants Paper 1 laminated for the fridge and the other five plain could not say so.

   IT ALSO MAKES THE ONE-PAPER ORDER POSSIBLE without a one-paper bundle: add the sitting, take the
   others out with their own ✕. And it is a shape the basket already had — `print` lines with a
   page count and a laminate flag drew and priced before this existed, and a basket saved in
   somebody's browser from then still does.

   `from` KEEPS WHERE A LINE CAME FROM, for the message to the owner, which lists what somebody asked
   for in words they would recognise rather than as a pile of papers.

   NOTHING TWICE, AND NOT BY NAME. A paper already in the basket is left alone — keyed on the paper's
   own id, because two papers share a name twenty times in this library — so pressing the same bundle
   again adds nothing and says so, and an overlapping bundle adds only what is new.

   THE IDS ARE CHECKED AGAINST THE LIBRARY, not trusted off the button. A document row the file does
   not have, or one marked not printable, is refused here as well as never being offered — the
   rule written once in `canPrint_` and asked in both places.

   ---------- AND EACH LINE KEEPS THE SHORT NAME THE CARD GAVE IT, BESIDE THE LONG ONE ----------------
   `name` IS THE LIBRARY-WIDE NAME — `Paper 1 (Non-Calculator) — May 2017 · Higher` — and it is right
   for a line read on its own. Under its bundle's title it is the title said a second time on every
   line: twelve lines of it made a basket 2,700px tall on a 390px phone and a message to the owner
   that the backend's 2,000-character cap refused outright for a bundle of English papers. `short`
   is what the bundle card drew — `Summer 2017 · Paper 1` — which is unique INSIDE the bundle, so
   the basket and the message print the bundle's title once and `short` under it. Read off the
   bundle the tile belongs to, and only when it is still the one on the screen: a tile pressed
   after the list changed underneath it falls back to `name`, which is never wrong, only long. */
function cartAddBundle_(el) {
  const ids = String(el.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const from = String(el.dataset.key || '');
  const b = typeof bundleOf_ === 'function' ? bundleOf_() : null;
  const shortOf = {};
  if (b && b.ids.join(',') === ids.join(',')) {
    b.printable.forEach(p => { shortOf[p.id] = p.short || p.label; });
  }
  let added = 0;
  let had = 0;
  ids.forEach(id => {
    const doc = typeof docById_ === 'function' ? docById_(id) : null;
    if (!doc || !canPrint_(doc)) return;
    if (CART.some(c => c.kind === 'print' && String(c.key) === id)) { had++; return; }
    CART.push({ key: id, kind: 'print', name: paperLabel_(id), short: shortOf[id] || '',
                pages: Number(doc.pages) || 0, cost: 0, from: from });
    added++;
  });
  if (!added && !had) { toast('Nothing in that bundle can be printed'); return; }
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: 'In your basket', note: '', on: true, off: true });
  toast(!added ? 'Already in your basket'
      : added + ' paper' + (added === 1 ? '' : 's') + ' in your basket'
        + (had ? ' — ' + had + ' already there' : ''));
}

/* ---------- AND THE WAY TO IT, FROM THE CARD THAT FILLED IT --------------------------------------
   THE BASKET IS A TOOL, four swipes from the Find screen, and a bundle is the first thing in this
   app that fills it with several lines at once — so the card that did it says where they went. The
   page is asked for by id off the same list the column is built from, because `widgetsOf_` hides
   the admin-only tools from everybody else and a literal index would land on the wrong card. */
on('cart-open', () => {
  const n = typeof widgetsOf_ === 'function'
    ? widgetsOf_('tool').findIndex(w => String(w.id) === 'cart') : -1;
  go('tools');
  if (n >= 0) goPage('tools', n, true);
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
  /* THE BOX, NOT THE SCREEN. This repainted a whole column so that one line's total could move —
     and the basket is a tool now, so the thing that changed is a box with an id. See `cartPaint_`,
     which also explains why it is written to by class. */
  if (typeof cartPaint_ === 'function') cartPaint_();
  toast(line.laminate ? 'Laminated' : 'Back to plain paper');
});

on('cart-drop', el => {
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  /* NO PAGE COUNT TO CHANGE ANY MORE. This was a rebuild because the basket page stopped being
     drawn when the last line left it — which is exactly the appearing-and-vanishing page the move
     to a tool was for. The card is always there; only what is in it moves. */
  if (typeof cartPaint_ === 'function') cartPaint_();
});

/* ---------- `on_openCart` AND `on('open-cart')` WERE HERE ------------------------------------------
   A SECOND BASKET, IN A SHEET. It drew the same lines, the same total and the same Send button as
   `cartCard_` in collections.js, over the top of whatever you were looking at — two versions of
   one screen, kept in two files, and only one of them had been fixed when a long title started
   pushing prices off the edge. That is exactly how the two come to disagree about what is in your
   basket.

   The basket is a tool on the Tools column. There is nothing to pop out.

   ITS BETTER WORDING SURVIVED. "Pay £0.92" rather than "Send", "N more credits needed" on a button
   that cannot be pressed, and the line about printing being charged at cost — all of it says more
   than the page version did, and all of it moved there. */

/* ---------- SENDING THE ORDER, AS A MESSAGE TO THE OWNER -------------------------------------------
   IT SAID *"Checkout is the next thing to build"* AND DID NOTHING, which made the button the fault
   this repository calls `orderPrints`: a door drawn in gold with nothing behind it. Asked for as
   *"add to cart and have me send it to them"* — so what is needed is not a checkout, it is the owner
   finding out what somebody wants, which is a message.

   THROUGH `sendMessage`, WHICH IS LIVE TODAY. A new `placeOrder` action writing to the `orders` tab
   would be tidier — the tab exists and has the right columns — and it would not work until the
   backend deploy that is blocked on the Cloud-project switch goes through. A message works this
   afternoon, lands in the Messages column the owner already reads, and e-mails them as every
   message does. The policy is the server's: `MESSAGING` lets a student, a parent and a tutor all
   reach an admin, and it is not repeated here.

   `send_`, NOT `api`, and the reason is `check-replies.js`: this says "Sent" and empties the basket,
   so it must only do that when the server said yes. A refusal — the five-minute gap, the length cap,
   a role that may not write — is toasted in the server's own words and the basket is left exactly
   as it was, because a basket emptied by an order that never arrived is an order nobody can place
   again without remembering what was in it. */
/* WHO IT GOES TO. An admin off the payload — `doGet` sends admins among the tutors, with their
   `personId` — and a PERSON rather than the brand account where there is one: the brand row has no
   e-mail address for `notify` to reach and exists to post as the business rather than to be written
   to. It is the last resort rather than never, because a message sitting in the brand account's
   inbox is still an order the owner can read, where "nobody to send this to" is an order lost. Not
   the sender either: the server answers "That is you." and an admin testing their own basket
   should hear something better. */
function orderTo_() {
  const me = String((USER && USER.personId) || '');
  const house = norm(brand('name', '@family.'));
  const admins = (DATA.tutors || []).filter(t => t && t.personId && norm(t.role) === 'admin'
    && String(t.personId) !== me);
  return admins.find(t => norm(t.title) !== house) || admins[0] || null;
}

/* ---------- WHAT THE MESSAGE SAYS ------------------------------------------------------------------
   EVERY LINE, ITS PAGES, ITS PRICE, WHETHER IT IS LAMINATED, THE TOTAL, AND DELIVERY — in that
   order, which is the order the owner acts on it in: what to print, what to charge, where it goes.

   A BUNDLE'S PAPERS UNDER THE BUNDLE'S TITLE, EACH BY ITS SHORT NAME — `cartGroups_`, the reader the
   basket draws from, so the message and the basket cannot disagree about what went together.
   `Edexcel · Maths · GCSE · Higher · Past papers · Summer 2017` then `Paper 1`, `Paper 2`, `Paper 3`
   is how a person says it, and `short` is unique inside its bundle by construction. A line with no
   bundle — a shop item, a print line from before bundles — is written out by its library-wide
   `name`, which is unique on its own.

   THE FIRST VERSION WROTE EVERY LINE BY ITS LIBRARY-WIDE NAME and claimed twenty-four papers fitted
   under the cap "with room over". Measured, a bundle of English Language papers — the largest shelf
   `BUNDLE_MAX` admits — came to 2,721 characters in the full form and was refused outright in the
   short one, so the order the owner asked for would have been declined for the one subject whose
   paper names are sentences. Grouped, the same twenty-four are well under the cap.

   A LINE WITH NO PAGE COUNT SAYS SO rather than claiming a price — the `cost: 0` rule once more.

   THE BACKEND REFUSES ANYTHING OVER 2,000 CHARACTERS, so this degrades before it gets there: the
   whole version, then one without the per-line figures (the total still says what is owed), and
   past that it declines rather than sending an order the server would turn away. */
const ORDER_MAX_CHARS = 2000;
function orderLine_(c, i, full, under) {
  const bits = [];
  if (c.kind === 'print') {
    if (full) {
      const p = cartPrint_(c);
      bits.push(c.pages ? c.pages + ' pages' : 'pages not counted yet');
      bits.push(p === null ? 'priced when sent' : money(p));
    }
    if (c.laminate) {
      const lam = laminatePrice(c.pages);
      bits.push('laminated' + (full && lam !== null ? ' (+' + money(lam) + ')' : ''));
    }
  } else if (c.cost) {
    bits.push(c.cost + ' credit' + (c.cost === 1 ? '' : 's'));
  } else if (full && Number(c.money) > 0) {
    bits.push(money(Number(c.money)));
  }
  const name = under && c.short ? c.short : (c.name || c.key);
  return (i + 1) + '. ' + String(name) + (bits.length ? ' — ' + bits.join(', ') : '');
}

/* WHERE IT GOES. The login reply carries `address` and `postcode` for exactly this — the note in
   `loginReplyFor_` says the basket has to know whether it can offer to post — and a profile saved
   since then carries them on `profile`. The postcode is what the message names: it is enough for the
   owner to recognise the address they already hold, and it is not the whole of somebody's home
   written into a second place. */
function orderWhere_() {
  const u = USER || {};
  const p = u.profile || {};
  const code = String(u.postcode || p.postcode || '').trim();
  const any = code || String(u.address || p.address || '').trim();
  if (!any) return 'Delivery: there is no address on my account, so I will collect it at a session.';
  return 'Delivery: post it to the address on my account' + (code ? ' (' + code + ')' : '')
    + ', or I can collect it at a session — whichever suits.';
}

function orderText_(cart) {
  const lines = (cart || CART).slice();
  const cash = lines.reduce((n, c) => n + cartMoney_(c), 0);
  const tbc = lines.filter(c => c.kind === 'print' && cartUnpriced_(c)).length;
  const credits = lines.reduce((n, c) => n + (c.cost || 0), 0);

  const head = 'An order from my basket, sent from the app — please print and send:';
  const foot = [];
  if (cash || tbc) {
    foot.push('Printing: ' + (cash ? money(cash) : 'nothing priced yet')
      + (tbc ? ' — ' + tbc + ' still to price when sent' : ''));
  }
  if (credits) foot.push('Credits: ' + credits);
  foot.push(orderWhere_());

  /* NUMBERED STRAIGHT THROUGH, not restarted under each title, so "number 7" means one line
     whichever way the owner replies about it. */
  const build = full => {
    const out = [head];
    let at = 0;
    cartGroups_(lines).forEach(g => {
      out.push('');
      if (g.from) out.push(g.from);
      g.lines.forEach(c => out.push(orderLine_(c, at++, full, !!g.from)));
    });
    return out.concat([''], foot).join('\n');
  };
  const long = build(true);
  if (long.length <= ORDER_MAX_CHARS) return long;
  const short = build(false);
  return short.length <= ORDER_MAX_CHARS ? short : '';
}

on('cart-send', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  if (!CART.length) return;
  const to = orderTo_();
  if (!to) {
    toast('There is nobody on the site to send this to yet — message @family. directly');
    return;
  }
  const text = orderText_();
  if (!text) {
    toast('That is too much for one message — send some of it now and the rest after');
    return;
  }
  send_({ action: 'sendMessage', name: USER.name, personId: USER.personId,
          to: to.title, toId: to.personId, body: text },
        { button: el, busy: 'Sending…' })
    .then(() => {
      /* SAID PLAINLY, AND THE BASKET GOES — only here, on a yes. */
      CART = [];
      cartSave();
      if (typeof cartPaint_ === 'function') cartPaint_();
      toast('Order sent to ' + to.title + ' — the reply will be in Messages');
      /* SO THE CONVERSATION IS THERE WHEN THEY LOOK, which is the first thing anybody does after
         sending something — the `msg-send` handler's own reason. NOT followed by a `repaint()`:
         this is pressed on the Tools column, and repainting that restarts every widget on it — a
         running timer put back to its start so that a column somebody is not looking at can learn
         about a message. The Messages column is drawn from `MESSAGES` when it is arrived at. */
      if (typeof loadMessages === 'function') {
        try { Promise.resolve(loadMessages()).catch(() => {}); } catch (e) {}
      }
    })
    /* `send_` HAS ALREADY SAID THE SERVER'S SENTENCE, and rethrows so a caller could react. This
       one's reaction is to keep the basket, which is doing nothing. */
    .catch(() => {});
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

