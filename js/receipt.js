/* ==================================================================================================
   @family. — receipt.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   receipt.js is number 15 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- SHARING IS A PRINT OF WHAT IS ON THE SCREEN -------------------------------------------
   ASKED FOR AS *"can you also wipe everything we know about the sharing reciept? I want the feature
   fully wiped and remade again. all i want is for when i share a booking/reciept it just shares a
   pdf of an exact copy of what they are seeing on the screen."*

   WHAT WENT: `receiptCanvas`, about two hundred lines of it, and `corsImage_` beside it. It drew
   the receipt A SECOND TIME onto a canvas — its own column arithmetic, its own fonts, its own
   palette read off the document, its own rules and dashes — and `js/check-canvas.js` existed for
   the one fault that arrangement has and nothing else can see: a canvas has no DOM, so a column
   landing on top of another is invisible to every other instrument here. Both are gone. So is
   `BOOK_ROWS`, which was the list the card had just drawn, put where the canvas could reach it.

   THE HONEST READING OF *"an exact copy of what they are seeing"* IS THE ELEMENT ITSELF. A second
   renderer is not a copy of the first, it is a thing that has to be kept in step with it — and this
   file's own history is the argument: the canvas drew a green terminal of a card that was cream
   paper, printed the venue and the tutor twice, drew photographs the card had stopped drawing, and
   said TO PAY where the screen said COST. Every one of those is one document told the answer twice.

   SO IT PRINTS, WHICH IS THE ROUTE THIS APP ALREADY HAS THREE OF. The cheat sheet, the flyer and
   `quiz-print` all build their paper, put a class on `body` and call `window.print()`; this does
   the same to an element that is already on the screen. A print dialogue is where every phone and
   every laptop keeps "save as PDF" and "share" — so the PDF is the platform's, made from the real
   markup with real text in it, rather than a picture of some pixels.

   AND IT IS THE `.rc` THE BUTTON IS IN, asked of the DOM rather than remembered. The share tile is
   printed on the receipt's own foot, so the document to print is the one the control is part of —
   the same move as `msg-send` walking up to its nearest `.msg-form`, and it means the form, a saved
   session and a basket all share this handler without any of them being named.
--------------------------------------------------------------------------------------------- */

/* A4 AT 96dpi, WHICH IS THE ONE PLACE THESE NUMBERS ARE WRITTEN. `@page` in the stylesheet sets the
   same size and the same margin; a scale computed against a different sheet from the one being
   printed on is a card that runs off the paper, so the pair is named here and cross-referenced
   there rather than each being a number somebody typed. */
const RC_PAGE_W = 794, RC_PAGE_H = 1123, RC_PAGE_M = 38;   /* 210mm x 297mm, 10mm margins */

on('book-share', el => {
  /* THE DOCUMENT THIS CONTROL IS PART OF. Nothing is cloned and nothing is rebuilt: what prints is
     the element the person is looking at, with whatever is answered in it at this moment. */
  const rc = el.closest && el.closest('.rc');
  if (!rc) return toast('There is nothing to share on this card yet');

  /* ---------- AS BIG AS THE PAPER TAKES, AND NOT ONE PIXEL RESHAPED ------------------------------
     A PHONE CARD IS ABOUT 312px WIDE and A4 is 794, so printed at its natural size the receipt is a
     third of the sheet in one corner. Scaled up it fills the page — and a TRANSFORM is what makes
     that an enlargement rather than a re-layout: setting a width instead would reflow the grid, and
     a document that re-flows is no longer a copy of what was on the screen.

     THE SMALLER OF THE TWO FITS, so a long receipt shrinks to one page rather than being cut in
     half by a page break, and a short one does not blow up past the paper. Capped at 3, because
     beyond that the thing being read is the pixels. */
  const box = rc.getBoundingClientRect();
  const k = Math.min(3,
    (RC_PAGE_W - 2 * RC_PAGE_M) / Math.max(1, box.width),
    (RC_PAGE_H - 2 * RC_PAGE_M) / Math.max(1, box.height));
  rc.style.setProperty('--rc-k', String(Math.max(1, k).toFixed(3)));
  /* ---------- AND ITS WIDTH IS PINNED TO THE ONE IT HAD ON THE SCREEN ----------------------------
     A PRINT RE-LAYS THE PAGE OUT AT THE PAPER'S WIDTH. Measured: the receipt is 327.6px on a 390px
     phone and 472 once the page box is A4, so without this the thing printed is a wider re-flow of
     the card rather than the card — different column widths, different wraps, and a scale computed
     against a box that no longer exists. Frozen in pixels, so what goes on the paper is the layout
     that was on the glass and the only thing the transform does is make it bigger. */
  rc.style.setProperty('--rc-w', box.width.toFixed(1) + 'px');
  rc.classList.add('rc-print');

  /* ---------- OUT OF THE COLUMN, BECAUSE `absolute` IS RELATIVE TO WHATEVER IS ABOVE IT ----------
     `.screen` IS `position: absolute` AND `placeCells` PUTS A TRANSFORM ON THE COLUMNS, and either
     of those makes an ancestor the containing block for an absolutely positioned child — so a
     receipt pinned to `left: 10mm` landed 10mm from the COLUMN it happens to be parked in, which on
     a screen whose columns are off-canvas either side is anywhere at all. Measured: x = 101.3 on a
     page 794 wide.

     THE OTHER THREE PRINTABLE THINGS IN THIS APP ARE CHILDREN OF `body` and never met this, because
     they build their paper rather than printing something already on screen. This is the one that
     has to move, and it moves back: a comment node holds its place, so the card returns to exactly
     where it was whether the dialogue was used or dismissed. */
  const mark = document.createComment('rc-print');
  if (rc.parentNode) rc.parentNode.insertBefore(mark, rc);
  document.body.appendChild(rc);
  document.body.classList.add('printing-rc');

  /* `afterprint` AND A FOUR-SECOND BACKSTOP, which is what the other three printable things in this
     app use and for the reason written over `quiz-print`: some browsers never fire the event when
     the dialogue is dismissed, and a body left with `printing-rc` on it is a blank app. */
  const done = () => {
    document.body.classList.remove('printing-rc');
    rc.classList.remove('rc-print');
    rc.style.removeProperty('--rc-k');
    rc.style.removeProperty('--rc-w');
    /* PUT BACK ONLY IF THE PLACE IS STILL THERE. A repaint between the print and the dismissal
       rebuilds the column, and re-inserting into a detached tree would leave the card in a document
       fragment nobody can see. If the mark has gone the card has already been redrawn, so dropping
       this one is the right answer rather than the lossy one. */
    if (mark.parentNode) mark.parentNode.insertBefore(rc, mark);
    else if (rc.parentNode === document.body) rc.remove();
    if (mark.parentNode) mark.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  window.print();
});

/* ==================================================================================================
   THE BOOKER IS NOT A SHEET ANY MORE.

   IT OPENED OVER THE TOP OF BOOK, one question at a time, and every answer redrew the panel. That
   is a modal wizard, and it is the last one in the app — the card actions stopped being a sheet,
   the paper stopped being a sheet, and this was the only place left where you press a thing and
   something covers what you pressed.

   IT IS THE SAME MARKUP IN THE SAME PLACE. `drawBooker_` was four `openSheet` calls with four
   nearly-identical bodies; it RETURNS those bodies now and `bookerCard` puts them on the Book
   screen instead. It returned a `title` too, for the heading above the card — there is no heading
   and no card, so it returns only the body. Nothing about the questions, the skipping, the pricing or the running total
   changed — only where the answer to "where does this go" is given, and it is given once.

   WHY IT WAS A SHEET AT ALL: because the funnel needs somewhere that is only the question, with
   the answers so far above it and the price below. A sheet gave that for free. A card gives it
   too, and gives it without hiding the column it belongs to. */
/* The one entry point. Everything that changes an answer calls this, and it is the only thing that
   calls `drawBooker_` — so nothing can redraw the card without keeping its place. It sat orphaned
   at the head of this file for as long as the shared picture was written between it and here. */
function drawBooker() { redrawBooker_(paintBook_); }

/** WHERE IT IS UP TO, or null when nobody is booking. Empty is the blank paper, not a form. */
function bookerCard() {
  /* ---------- OR THE LIST, ON THE SAME PAGE ------------------------------------------------------
     `#bookr` IS THE WRAPPER EITHER WAY, and that is not tidiness: `paintBook_` finds the screen to
     repaint by walking up from `#bookr`, so a picker drawn outside it would come up once and then
     be unable to redraw itself — every tick would run the handler and change nothing, which is the
     fourth of the four causes `clicks()` lists and the one that looks like the app being dead.

     A STEP THAT CANNOT BE ANSWERED CLOSES THE LIST RATHER THAN DRAWING AN UNPRESSABLE ONE. Changing
     Kind can lock the very question being picked — a joined class settles its own subjects — and a
     page of twelve greyed buttons with a Done under it is a state nobody chose to be in. */
  const pick = BOOKING.picking ? bookStep_(BOOKING.picking) : null;
  if (pick && !stepLocked_(pick)) return `<div id="bookr">${pickerCard_(pick)}</div>`;
  if (BOOKING.picking) BOOKING.picking = '';
  const out = drawBooker_();
  if (!out) return '';
  return `<div id="bookr">
    ${/* ---------- NO CARD AROUND IT ----------------------------------------------------------
          IT WAS A `.card` HOLDING AN `.rc`, which is a glass panel with a paper receipt inside it —
          two containers for one object, and the outer one said nothing. The receipt already has
          edges: it is torn at both ends, it has its own colour, and it is the most obviously
          bounded thing in the app. Putting it in a box was framing a photograph that came framed.

          THE HEADING WENT WITH IT. "How would you like to book?" named the question being asked,
          which mattered when a list of answers sat underneath. Every field is a dropdown on the
          paper now, so there is no single current question for a heading to name — the card asks
          all twelve at once and you answer whichever you like.

          What is left is the paper, and under it the note box and the buttons that send it. */''}
    ${out.html}
  </div>`;
}

function drawBooker_() {
  /* ---------- THERE IS NO SECOND THING TO DRAW ------------------------------------------------------
     THIS WAS A FUNNEL. It asked one question, drew a list of answers, and moved to the next — and
     the card underneath was where the answers landed. Every one of those questions is now answered
     ON the card: a dropdown for a list, a text box for the split, and the week grid unfolding under
     its own row. So the funnel has nothing left to render and this function returns the paper.

     `nextBookStep` HAS NOT GONE and should not. It is what knows a question with one option should
     not be asked, what knows a shared class has no subjects to pick and no venue to choose, and
     what `bookAnswered_` leans on. It decides what is ASKED; it no longer decides what is DRAWN,
     and those were only ever the same thing because the form was a funnel.

     `BOOKING.editing` SURVIVES TOO, meaning only "which row has its grid open". It used to mean
     "which question is the panel showing", which is the same fact from the days when there was a
     panel to show it in. */
  const L = bookPrice();

  /* WHAT HAS BEEN SAID SO FAR, each one pressable to change. A wizard that hides its earlier
     answers is one you have to restart to correct. */
  /* `said` WAS HERE — a chip per answered question, each with a ✕ that cleared it. It was a second
     list of the answers drawn above a receipt that lists the answers, so it went; but the ✕ was the
     ONLY way to un-answer a question rather than change it, and losing a control is not the same as
     losing a duplicate. It is a button in the edit view now, beside "Leave it as it is", which is
     where somebody who has opened a question to reconsider it is already standing. */

  /* ---------- A QUESTION THAT DID NOT GET ASKED, SAID OUT LOUD ---------------------------------
     `nextBookStep` skips any question with no options, which is right — one venue is not a choice
     and asking is the app pretending to consult you. But it means a question that SHOULD have
     appeared and did not looks exactly like a question that was never meant to.

     That is how "which of your children is this for?" came to be missing with nothing said. The
     question needs children on your account; there were none linked; so it was skipped, silently,
     and from the outside that is indistinguishable from the feature not being deployed.

     So the one case that is a GAP rather than a decision says so. A client with no children on
     their account is a real state and the fix is a person's, not a form's — the line names it and
     says who can fix it. Everyone else never sees it. */
  /* AND THE NOTE HAS TO NAME THE RIGHT ACCOUNT. "No children are on YOUR account" is wrong when an
     admin has booked for somebody else — it is that family's account with nobody on it, and telling
     the admin to add their own children is advice for a problem they do not have. */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  const mine = !USER || !forWhom || norm(forWhom) === norm(USER.name);
  /* AND NO CHILDREN NOTE AT ALL WHEN THERE IS NO CLIENT. "No children are on Nobody yet — just
     open it's account" is what happens when a placeholder is handed to a sentence expecting a
     name. A waiting list being opened empty has no family to have children, and the note has
     nothing to tell anybody. */
  const noKids = USER && forWhom && !isWaiting_()
    && !bookStep_('kids').options().length
    && norm(USER.role) !== 'tutor' && norm(USER.role) !== 'kid';
  const kidsNote = noKids
    ? `<p class="note" style="margin:.2rem 0 .6rem">No children are on
         ${mine ? 'your account' : esc(forWhom) + '&rsquo;s account'}, so we cannot ask which of
         them this is for — the seats will just say <b>Child</b>.
         <span class="faint">${mine ? 'Ask us to add them and the next booking will name them.'
           : 'Add them to that account and the next booking will name them.'}</span></p>`
    : '';

  /* THE RUNNING BREAKDOWN. Every row says what it did to the price and what the price is with it
     applied — so the last figure IS the total, rather than a number you have to trust.
     Built from PRICE_ROWS, the same list the old card used, so a row cannot be drawn without being
     costed or costed without being drawn. */
  /* ---------- THE ACTIONS ARE PRINTED ON THE PAPER ---------------------------------------------
     They were markup after the receipt, which put them on the page rather than on the document —
     and the page has no surface, so they floated. Handed to `bookBreakdown` instead, which prints
     them above the barcode where a receipt's terms go. */
  const foot = `
    ${/* ---------- TWO MARKS, NOT A BUTTON AND A MARK ---------------------------------------------
          "ASK FOR IT" WAS A FULL-WIDTH GOLD BAR with a symbol underneath it — the commit dressed as
          a different kind of control from everything else on the paper, and the one thing next to
          it that shared its job drawn a fifth the size.

          BOTH ARE ACTIONS ON THIS DOCUMENT, so both are tiles in one row, the same row every card
          in Find carries. Sending keeps the gold, because it is the one that spends something and
          the one that cannot be undone.

          THE NAMES ARE IN THE TITLES, which is where every icon-only control in this app keeps
          them — "Ask for it" and "Share this booking", unchanged. */''}
    <div class="tile-row rc-tiles">
      ${tile_({ icon: 'send', label: 'Ask for it', tone: 'buy', act: 'book-send' })}
      ${tile_({ icon: 'share', label: 'Share this booking',
                /* `data: { stage: 'screen' }` WAS HERE and it was the second half of a choice this
                   document made twice, back when sharing drew the receipt again onto a canvas.
                   Sharing IS the card now — it prints this element — so there is nothing left for
                   the button to tell it and nothing left to disagree with. */
                act: 'book-share' })}
    </div>
    ${/* ---------- THE FOOTER LINE WENT ------------------------------------------------------
          REMOVED ON REQUEST: *"remove the nothing is booked yet text."* It read "Nothing is booked
          or charged yet — this asks, and we come back to you", under the two tiles.

          WHAT IT SAID IS SAID BY THE CARD. The gold tile is "Ask for it" rather than "Pay", the
          six stage ticks along the bottom are all empty on an unsent form, and the first of them
          is `Requested` — so the document already shows, in its own shape, that nothing has
          happened yet and what the next thing to happen is. A sentence repeating it is the fault
          this file records where the roster's `name` printed an `<h3>` above every widget's own
          heading: both correct, both on the screen at once.

          `id="book-said"` WENT WITH IT AND NOTHING READ IT — measured across `js/`. It was the
          status line of a form that reports through toasts now.

          THE COPY ON THE SHARED PICTURE WENT IN THE SAME COMMIT, back when there was one to keep
          in step: the canvas drew this sentence too, and its own note said why the two had to
          agree — *"a picture of the card that promises something slightly different is a second
          promise."* What is shared is this element now, so there is one copy of everything on it
          and that class of drift is gone rather than guarded against. */''}`;
  const money_ = bookBreakdown(L, foot);

  /* ---------- THE CARD IS THE FORM, FROM THE FIRST QUESTION ---------------------------------------
     IT USED TO BE A QUESTION UNTIL IT WAS A CARD. Nine questions in a row, and only once the last
     one was answered did the thing you were building appear — so for eight of nine steps you were
     answering a form with no idea what it was adding up to, and the running price this file goes to
     such lengths to compute was on screen for exactly one of them.

     THE RECEIPT IS DRAWN FIRST NOW, on every step, with the question underneath it. Answering moves
     a figure you can already see. That was always the design — the comment above says the card
     becomes the control and every chosen value is pressable — it just started too late.

     THE `said` CHIPS ARE GONE. They were a second list of the answers so far, drawn above a receipt
     that lists the answers so far. Two of the same list, and only one of them had the prices. */
  const head = `${kidsNote}${money_ || ''}`;

  /* ONE RETURN. This was four branches — a question, a grid, a list of email boxes, and the card —
     and the last three have moved onto the paper. What is left is the paper, the note box and the
     two buttons, which is what the whole form is now. */
  /* THE PAPER IS THE WHOLE THING NOW. The note box moved into it as a row, the buttons are printed
     on it above the barcode, and what is left out here is nothing at all. */
  return { html: head || '<p class="note">Not enough answered to price it yet.</p>' };
}

on('book-send', el => {
  const said = $('book-said');
  const L = bookPrice();
  el.disabled = true;
  if (said) said.textContent = 'Asking…';

  const spec = bookSpec();

  /* ---------- A CLASS GOES SOMEWHERE ELSE ENTIRELY ------------------------------------------------
     `createJob` builds a booking out of what somebody chose: their subjects, their seats, their day,
     their tutor, and a price computed from all of it. A shared class has none of those — one seat,
     Maths and English, no tutor, no day, and a price fixed before anybody joined.

     SO IT IS `joinWaitlist`, WHICH IS A DIFFERENT HANDLER AND NOT A FLAG ON THIS ONE. It finds the
     venue's open list or starts one, checks nobody has joined twice, prices the seat from the venue
     and the seat count, and writes the asker their own receipt at their own price. Everything that
     makes a class a class is decided there, on the server, where four phones cannot each produce a
     different number.

     WHAT IS SENT IS WHAT WAS ASKED: the venue and the level. Nothing else on this form was even
     offered, and sending a subject or a day would be this file inventing an answer to a question
     nobody was asked. */
  /* ---------- ASKING TO JOIN A CLASS THAT IS ALREADY RUNNING -----------------------------------
     THREE VERBS, NOT TWO. `createJob` starts a session; `joinWaitlist` buys a seat on a list. A
     class that already runs is neither: it belongs to the family who booked it, seats in it are
     theirs to give, and joining is a REQUEST — which is exactly what `move: 'Request'` is, and what
     the "Ask to join" button on a job receipt has always sent.

     THE FORM CAN REACH IT NOW. Choosing "instant class" and then picking one that is going sends
     this instead of creating a second session at the same time in the same room. Nothing else on
     the paper applies — the subject, level, venue and seats are the class's, filled in and locked
     — so nothing else is sent. */
  const joined = typeof joinedJob_ === 'function' ? joinedJob_() : null;
  if (joined && !isWaiting_()) {
    api({ action: 'move', jobId: String(joined.id || joined.jobId || ''),
          role: 'client', name: USER.name, move: 'Request',
          text: 'asked to join', requestId: 'join-' + (joined.id || '') + '-' + Date.now() })
      .then(d => {
        el.disabled = false;
        if (d && d.error) { if (said) said.textContent = d.error; return; }
        /* THE CLASS YOU ASKED TO JOIN, kept so it comes back under the blank form — see `ASKED_JOB`
           in book.js. The id is the one we already had: this path asks to join a session that
           exists, so there is no new job to be told about. */
        ASKED_JOB = String(joined.id || joined.jobId || '');
        resetBooking_();
        toast('Asked — they will be in touch');
        load();
      })
      /* ---------- THE HANDLER TOOK NO ARGUMENT AND THEN USED ONE ---------------------------------
         `catch(() => …)` with `why_(err)` inside it. There is no `err` in that scope and no `err`
         anywhere above it, so the line threw ReferenceError — inside the very handler whose job is
         to explain a failure.

         WHICH MEANS ASKING TO JOIN A CLASS FAILED TWICE AND SAID NOTHING EITHER TIME. The request
         fails, this runs, it throws before reaching `textContent`, and the throw is inside a
         `.catch` so it becomes an unhandled rejection that no part of the app is watching. The
         button re-enables — `el.disabled = false` is above the bad line and does run — so what a
         person sees is a button that goes dead, comes back, and offers no reason at all. Pressing
         it again does the same thing.

         `why_` EXISTS FOR THIS EXACT MOMENT. It turns a bare fetch TypeError into a sentence about
         there being no connection, and it has been unreachable from here since the argument was
         dropped. The sibling handler a hundred lines below takes `err` correctly, which is what
         this should have looked like all along.

         Found by `node js/check.js` — "used but never declared", which is precisely what it was. */
      .catch(err => {
        el.disabled = false;
        if (said) said.textContent = why_(err);
      });
    return;
  }

  if (isWaiting_()) {
    /* ---------- OPENING ONE IS A DIFFERENT ACTION FROM JOINING ONE --------------------------------
       `joinWaitlist` SEATS WHOEVER CALLS IT. That is right for a family and wrong for an admin who
       has just answered "nobody yet" — they would become the first person on the list they were
       trying to open empty, which is the one thing the answer exists to avoid.

       So the answer to "who is this for" chooses the verb: nobody means `openWaitlist`, anybody
       means `joinWaitlist`. One question, two doors, and the form does not need a second button. */
    const forNobody = BOOKING.client === NOBODY;
    send_({ action: forNobody ? 'openWaitlist' : 'joinWaitlist',
      name: USER.name, personId: (USER && USER.personId) || '',
      venue: BOOKING.loc,
      level: BOOKING.level,
      /* WHEN THIS FAMILY COULD COME. Sent as the words they ticked rather than as a code — it is
         read by a person deciding what day to run the class on, and "Weekday evenings, Weekends"
         is already the sentence they want. */
      availability: (BOOKING.avail || []).filter(Boolean).join(', '),
      requestId: 'wl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    })
      .then(d => {
        /* CLOSING THE FORM, not a sheet. Sent is the one moment the booker should stop being on
           the screen — everything else about it is now a job, and jobs are the cards underneath. */
        /* WHERE IT HAS GOT TO, because that is the whole content of a waiting list. "You are on
           the list" says less than the backend already knows, and it knows it exactly: how many
           have joined and how many seats there are. */
        toast(d && d.seats
          ? 'On the list — ' + d.joined + ' of ' + d.seats + ' seats taken'
          : 'On the list');
        /* BOTH WAITLIST VERBS ANSWER WITH ONE. `joinWaitlist` and `openWaitlist` are different
           handlers reached by the same button, and each returns the `jobId` of the list it seated
           you on or opened — so one line covers the pair. */
        ASKED_JOB = String((d && d.jobId) || '');
        resetBooking_();
        load();
      })
      /* `send_` has already said what went wrong and marked the error handled — this stops it
         reaching the console as an unhandled rejection, and adds nothing a person would read. */
      .catch(() => { el.disabled = false; });
    return;
  }

  /* THE ONE THAT MATTERS MOST. Asking for a session had no failure path: with no connection the
     button did nothing and the request was never sent, and nobody was told either fact. */
  send_({ action: 'createJob',
    name: USER.name, clientName: USER.name,
    /* WHO THIS BOOKING BELONGS TO, permanently.
       `writeReceipt_` stores `person_id` and this never sent one — so every receipt ever issued has
       a blank id and is found again by MATCHING THE NAME. A name is an editable cell: change it and
       a family's receipts detach from them, silently, and there is nothing underneath to reattach
       by. It is the one identity this backend refuses to trust anywhere else, and the receipts were
       the last place still relying on it. */
    personId: USER.personId || '',
    subject: spec.subjects.join(', '), level: spec.level,
    day: spec.day, time: spec.time, location: BOOKING.loc,
    hosting: spec.hosting, hours: spec.hours, interval: spec.interval,
    requestedTutor: spec.tutor,
    dates: (L && L.sessionDates || []).map(d => fmtDate(d)).join(', '),
    price: L ? String(L.total || '') : '',
    /* WHAT THE JOB IS WORTH TO YOU, which `priceFrom` has always worked out and nothing ever
       sent — so the sheet's profit column stayed empty on every booking made through the app. */
    profit: L ? String(Math.round((L.profitTotal || 0) * 100) / 100) : '',
    /* THE PRINTED LINES, sent with the request so the backend can keep the receipt AS DRAWN.
       Regenerating it later from the job would produce a different document the day a rate moves —
       and a receipt that changes after it is issued is not a receipt. */
    /* GUARDED, because `bookPrice` returns null until enough is answered to price anything — and
       `book-send` can be pressed before that, which is exactly what the harness does. An unpriceable
       booking sends no lines rather than throwing on the way out: the request is the important
       half, and the paperwork must never be what stops it. */
    lines: JSON.stringify(((L2) => L2 ? breakdownRows(L2).map(r => ({
      n: r.n, k: r.k, v: r.v, mul: r.mul, rate: r.rate, total: r.total,
    })) : [])(bookPrice())),
    /* WHO IS ACTUALLY COMING, by name, where the parent told us. A booking has always recorded
       who PAYS and never who sits in the chair — so a tutor arrived knowing a session existed and
       not which of three children to expect. Empty is a real answer: a parent booking for somebody
       else's children ticks nothing, and the seats say "Child". */
    /* `splitOthers` was sent here too — the COUNT of other families, which nothing on the backend
       has ever read. `splitEmails` carries who they are, which is the fact that matters; a number
       that can be derived from a list is a second copy of the list. */
    /* WHETHER A FAMILY YOU HAVE NOT MET MAY ASK TO JOIN. Sent as the plain answer rather than a
       boolean, so the sheet reads as the question was asked. */
    /* ALWAYS TRUE, because the question is gone and the SEATS are the answer now. A family who
       wants the room to itself buys the remaining seats, which leaves none to ask for — a fuller
       statement than a checkbox, made with money rather than a tap.
       Written rather than dropped: `move` refuses a join unless this says so, so leaving it FALSE
       would have switched the join mechanism off while looking like a question had been tidied. */
    openToOthers: 'TRUE',
    kids: (BOOKING.kids || []).filter(Boolean).join(', '),
    service: BOOKING.service || 'Tuition',
    /* Who to invite. `createJob` has accepted this since the beginning and nothing ever sent it,
       so a split booking was priced per family and nobody else was ever told about it. */
    splitEmails: (BOOKING.split || []).filter(x => String(x).trim()).join(', '),
    /* FROM `BOOKING`, NOT FROM THE DOM. This read `#book-note` directly, which only worked while
       that box was on screen — a redraw between typing and sending would have dropped it without a
       word. */
    message: BOOKING.note || '',
    /* THE SAME ASK TWICE IS ONE ASK. A slow connection and an impatient thumb are the ordinary way
       a family ends up with two identical bookings, and the backend already refuses a repeated
       requestId — this is what gives it one. */
    requestId: 'R' + Date.now() + '-' + Math.floor(Math.random() * 1e6) })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      toast('Asked — we will come back to you');
      /* WHAT WAS JUST ASKED FOR, so it is drawn again under the emptied form — see `ASKED_JOB` in
         book.js. Set before `resetBooking_()`, which is what clears the answers this receipt is
         about. */
      ASKED_JOB = String((d && d.jobId) || '');
      /* Emptied from the step list rather than from a list of names written here — see
         `resetBooking_`. This was seven keys typed out, and it was missing `done` and `kids`: the
         next booking would arrive believing every multiple-choice question had already been
         answered, and walk past all of them. */
      resetBooking_();
      load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not ask for that');
    });
});

/* THE WHOLE RECEIPT, on tap. The stub on the list is a fold; this is the paper opened out.
   It used to build its own six-row summary here — a THIRD rendering of the same booking, after the
   card and the receipt, and the one that would quietly stop matching them. Six rows where the
   receipt has fourteen, so tapping a session told you less than the list it was on. */
/* ---------- A SESSION OPENS ON ITS OWN PAGE, NOT OVER THE TOP OF THE APP --------------------------
   REPORTED TWICE: *"your week planner has pop ups. i click on a job and it goes. i told you i don't
   like that."* — and "it goes" is the accurate description. `openSheet` lays a panel over
   everything, so the week you were reading disappears behind the one session you tapped, and
   getting back to it is a close you have to find.

   THE PAGE ALREADY EXISTED, which is what makes this a deletion rather than a design. `jobPage_`
   draws a session opened out and `bookBlocks` puts one per page on the Booking column — so this was
   the app's SECOND way of showing one session, stacked by hand out of the same pieces, in a
   different file, differing by a `moneyBlock` nobody had noticed was missing from it. Two renderers
   for one thing is the fault this repository records under `childrenOf`, under `link`/`source_url`
   and under the roster heading drawn twice.

   SO IT NAVIGATES. `jobPageAt_` asks the list that BUILDS those pages which one this is, rather
   than counting a second time, and `OPEN_JOB` covers the case the week grid creates and the Booking
   column does not: an admin's week shows every session and `myJobs_` returns only their own.

   NOT FOUND AT ALL is still said out loud. A session that has left the payload between the grid
   being drawn and the tap — declined, cancelled — has no page and no receipt, and a tap that
   silently does nothing is the thing this app keeps being reported for. */
on('job', el => {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const want = String(el.dataset.id || '');
  const j = jobs.find(x => String(x.id || x.jobId || '') === want);
  if (!j) { toast('That session is not in this list any more'); return; }
  if (!USER) { toast('Sign in to open a session'); go('account'); return; }

  OPEN_JOB = want;
  /* ---------- AND THE COLUMN HAS TO BE TOLD IT IS OUT OF DATE -------------------------------------
     `go` REPAINTS A SCREEN ONLY IF IT IS EMPTY OR STALE, deliberately — its own note says a second
     identical paint costs the slide's animation and buys nothing. `OPEN_JOB` is state the Booking
     column is BUILT from, so changing it is exactly the case `STALE` exists for: the note on it
     records signing in and finding eight screens still saying "Sign in to post".

     MEASURED, AND THIS WAS WRONG FIRST: with `OPEN_JOB` set and `jobPageAt_` answering 1, the
     column still held what it had drawn at boot. The pieces were all correct and the screen was
     the one nobody had told. */
  STALE.booking = 1;
  /* ---------- THE PAGE IS SET BEFORE THE SCREEN IS REACHED, NOT AFTER ------------------------------
     `goPage` OPENS WITH `if (!PAGER[id]) return;` and the pager for a column is built when that
     column is painted — so calling it straight after `go('booking')` asked for a page of a pager
     that did not exist yet and returned silently. Measured: the receipt was on the column and the
     column was showing page 0, the booking form, which is indistinguishable from the tap having
     done nothing.

     `openSharedPost` IN posts.js ALREADY HAD THE IDIOM — `PAGE.feed = n; go('feed');` — with its
     own note about why scrolling is not the mechanism here. Same shape: say where the column should
     be, then go to it, and the paint that `go` performs builds the pager already on that page.

     `jobPageAt_` IS ASKED FIRST because it reads `OPEN_JOB`, which is set two lines up: the page
     index and the page list are then worked out from one state in one order. */
  const n = typeof jobPageAt_ === 'function' ? jobPageAt_(want) : -1;
  if (n >= 0) PAGE.booking = n;
  go('booking');
});

/* PAYING. `createCheckout` builds a Stripe session and hands back a URL; nothing about the booking
   is recorded by it, because a client who opens the payment page and closes the tab has not paid.
   The return leg — `?paid=1&ref=…` — is what asks Stripe whether it actually happened.

   `requestId` IS THE GUARD. A double tap on this is two checkouts for one booking, and the backend
   refuses the second because it recognises the id. */
on('job-pay', el => {
  el.disabled = true;
  api({ action: 'createCheckout', jobId: el.dataset.id,
        name: USER.name, personId: USER.personId || '',
        requestId: 'pay-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      if (!d || !d.url) { toast('Stripe did not give us a payment page.'); return; }
      /* THE SAME TAB. A payment opened in a new one is a payment somebody loses track of, and the
         return leg comes back to this site anyway. */
      location.href = d.url;
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ---------- THE BUSINESS ANSWERING A REQUEST ------------------------------------------------------
   The same `move` everything else uses, so there is one machine and one set of rules — what makes
   it an admin's answer is that the backend recognises the name as an admin who is not in the job.
   Nothing here decides that; it is checked on the server, because a button that is not drawn is
   not a rule.

   ONE HANDLER FOR BOTH, because they are one decision with two answers, and two handlers would be
   two places for the request to drift out of shape. */
on('job-answer', el => {
  const yes = !!el.dataset.yes;
  /* DECLINING IS ASKED ABOUT. It removes everybody from a booking a family made and sends them an
     email saying so — one mis-tap from a list of sessions is not a thing to do silently. Accepting
     is not: it is the ordinary act, and it can be undone by declining afterwards. */
  /* TWO PRESSES, NOT A confirm(). A browser dialog is the one thing on a phone that looks like the
     page has been taken over by something else, and it cannot say what is about to happen in the
     words this app uses. The button becomes the question, and a press somewhere else leaves it as
     it was. Same pattern as `post-delete` in posts.js. */
  if (!yes && !sure_(el, 'Turn it down?')) return;
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client',
        name: USER.name, adminName: USER.name,
        move: yes ? 'Accept' : 'Decline',
        requestId: 'ans-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast(yes ? 'Accepted' : 'Declined');
      closeSheet();
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ---------- THE FAMILY LEAVING ---------------------------------------------------------------------
   THE SAME `move` EVERY OTHER ACT USES, so there is one machine and one set of rules. The backend
   checks it is really theirs; this only draws the button and asks first.

   ASKED ABOUT, ALWAYS. It removes them from a session and, once paid, puts money into a state a
   person has to resolve by hand — neither is a thing to do on one mis-tap from a list. The question
   says which of the two is about to happen, because "are you sure" without the consequence is a
   question nobody can answer. */
on('job-leave', el => {
  const paid = !!el.dataset.paid;
  if (!sure_(el, paid ? 'Mark unpaid?' : 'Mark paid?')) return;
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client',
        name: USER.name, move: 'Withdraw',
        requestId: 'wd-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast('Withdrawn');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* MARKING IT PAID BY HAND. The one action on this site that says money arrived without a payment
   processor having said so — which is why it asks HOW, and why the answer goes into the event log
   rather than being thrown away. "Cash at the library" is the whole audit trail for that payment,
   and a blank is worse than a guess because a guess can be corrected. */
on('job-paid', el => {
  /* ---------- ASKED IN A SHEET, NOT IN A prompt() ---------------------------------------------------
     `prompt()` IS A GREY OS DIALOG with the OS's typeface and the OS's buttons. It stops the page
     dead, it cannot be styled, it cannot explain itself, and on a phone it reads as the page having
     been hijacked. It is also the only place in this app where a value was typed into something the
     app did not draw.

     THE SHEET IS WHERE EVERYTHING ELSE IS ASKED. It can say why the answer matters — that "cash at
     the library" IS the audit trail — which a one-line dialog cannot.

     BACKING OUT IS STILL NOT AN EMPTY ANSWER. Closing the sheet does nothing at all; only the button
     sends. That distinction was the whole point of the `null` check this replaces. */
  askHow_(el);
});

/* Kept apart so the handler above reads as one line and this reads as one screen. */
function askHow_(el) {
  openSheet('Mark it paid', `
    <p class="sub">How was it paid? This goes in the event log and is the whole audit trail for
      the payment.</p>
    <input id="paid-how" class="search" value="cash" autocomplete="off">
    <div class="btn-row">
      <button class="btn primary" data-do="job-paid-go" data-id="${esc(el.dataset.id)}">Mark paid</button>
    </div>
    <p class="faint" id="paid-said"></p>
  `);
}

on('job-paid-go', el => {
  const how = (($('paid-how') || {}).value || '').trim();
  if (!how) { const s = $('paid-said'); if (s) s.textContent = 'Say how, even roughly.'; return; }
  el.disabled = true;
  el.textContent = 'Saving…';
  api({ action: 'markPaid', jobId: el.dataset.id,
        name: USER.name, adminName: USER.name, how: how,
        requestId: 'paid-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast(d && d.alreadyPaid ? 'Already marked paid' : 'Marked paid');
      closeSheet();
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ASKING TO JOIN. The same `move` a tutor uses to apply — one machine, one set of rules, and the
   capacity and the family's consent are both checked on the backend rather than trusted from here. */
/* TAKING A SEAT ON A CLASS SOMEBODY ELSE STARTED. The SAME action the booking form uses, because it
   is the same act — the venue is read off the job rather than typed, and everything else about a
   waitlist seat is decided on the server either way.

   IT STILL ASKS WHEN THEY CAN COME. That is the one thing `joinWaitlist` cannot work out for
   itself and the one thing the day of the class gets chosen from — a seat taken without it is a
   family nobody can schedule around. */
/* COMING ALONG. The event is created by the first family to join it — there is no "open the event"
   step, because an event nobody has joined is a row saying nothing.
   IT ASKS WHO IS COMING, because a party needs a headcount and a family with three children is
   three chairs. The answer goes on their own joining event, where it is theirs by construction. */
on('fest-join', el => {
  const f = (DATA.festive || []).find(x => String(x.id) === String(el.dataset.id));
  if (!f) { toast('That has finished.'); return; }
  /* ASKED IN A SHEET, NOT IN A prompt(). See `askHow_` above for the argument; it applies here with
     one addition — this question is asked of a PARENT rather than of the admin, and a grey OS dialog
     is a worse thing to show somebody who did not build the app. */
  openSheet(f.name || 'Join in', `
    <p class="sub">Who is coming? Names, or just how many children.</p>
    <input id="fest-kids" class="search" placeholder="e.g. Amira and Yusuf" autocomplete="off">
    <div class="btn-row">
      <button class="btn primary" data-do="fest-join-go" data-id="${esc(f.id)}">Put us down</button>
    </div>
    <p class="faint" id="fest-said"></p>
  `);
});

on('fest-join-go', el => {
  const f = (DATA.festive || []).find(x => String(x.id) === String(el.dataset.id));
  if (!f) { toast('That has finished.'); return; }
  const kids = (($('fest-kids') || {}).value || '').trim();
  if (!kids) { const s = $('fest-said'); if (s) s.textContent = 'Who is coming?'; return; }
  el.disabled = true;
  el.textContent = 'Sending…';
  api({ action: 'joinFestive', holidayId: f.id,
        name: USER.name, personId: (USER && USER.personId) || '',
        kids: kids,
        requestId: 'fest-' + f.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast(d && d.seats ? 'Coming along — ' + d.joined + ' of ' + d.seats : 'Coming along');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* ---------- TAKING A SEAT GOES TO THE FORM ---------------------------------------------------------
   IT USED TO ASK AND SEND, right here: a browser `prompt()` for availability — a grey OS dialog with
   a text box, the crudest popup in the app — and then straight to `joinWaitlist`. So there were two
   ways to join a class that shared no code and asked different questions, and this one could not
   validate its single answer or show what the seat cost.

   NOW IT ANSWERS THE FORM ON YOUR BEHALF and turns to it: the kind is a waiting list, the class is
   this one, and everything the class decides is filled in. What is left — when you could come, who
   it is for — is asked on the paper with the rest, and sent by the one send button.

   THE FIELDS ARE SET HERE RATHER THAN BY `book-set`, because nobody touched a dropdown. Same four,
   in the same order, and `joinedJob_` will find this class again from the label. */
on('job-take-seat', el => {
  const j = (DATA.liveJobs || DATA.jobs || []).find(x =>
    String(x.id || x.jobId || '') === String(el.dataset.id));
  if (!j) { toast('That class has gone.'); return; }
  BOOKING.how      = 'Waiting list class';
  BOOKING.joining  = openClassLabel_(j);
  BOOKING.subjects = j.subject ? [j.subject] : [];
  BOOKING.level    = j.level || '';
  BOOKING.loc      = j.location || j.venue || '';
  BOOKING.n        = '1';
  BOOKING.done = uniq((BOOKING.done || [])
    .concat(['how', 'joining', 'subjects', 'level', 'loc', 'n']));
  closeSheet();
  STUFF.filters = [{ field: 'forLabel', value: 'Booking' }];
  go('stuff');
  paintStuff();
  /* ONE PAGE ON FROM THE QUESTION, which is the form. */
  PAGE.stuff = stuffQuestionPage_() + 1;
  paintPager('stuff', true);
});


/* ---------- ASKING TO JOIN GOES TO THE FORM, LIKE TAKING A SEAT --------------------------------
   IT SENT STRAIGHT FROM THE BUTTON, which made it the third way to make a booking and the only one
   that showed you nothing first — no subject, no venue, no price, no chance to say who it is for.
   `job-take-seat` was moved onto the form for the same reason; this is its other half.

   THE VERB IS STILL A REQUEST. Filling the form in does not turn asking to share somebody's class
   into buying a seat — `book-send` reads which kind was chosen and sends `move: 'Request'` for a
   class that is already running. What changes is that you can see what you are asking for. */
on('job-join', el => {
  const j = (DATA.liveJobs || DATA.jobs || []).find(x =>
    String(x.id || x.jobId || '') === String(el.dataset.id));
  if (!j) { toast('That class has gone.'); return; }
  BOOKING.how      = 'Instant class';
  BOOKING.joining  = openClassLabel_(j);
  BOOKING.subjects = j.subject ? [j.subject] : [];
  BOOKING.level    = j.level || '';
  BOOKING.loc      = j.location || j.venue || '';
  BOOKING.n        = '1';
  BOOKING.done = uniq((BOOKING.done || [])
    .concat(['how', 'joining', 'subjects', 'level', 'loc', 'n']));
  closeSheet();
  STUFF.filters = [{ field: 'forLabel', value: 'Booking' }];
  go('stuff');
  paintStuff();
  PAGE.stuff = stuffQuestionPage_() + 1;
  paintPager('stuff', true);
});

/* ---------- AN ADMIN ENDS A SESSION --------------------------------------------------------------
   DELETING A JOB IS WITHDRAWING EVERYONE FROM IT, which is not a workaround — it is what the
   booking machine already means by a session being over. A job with no clients in it is
   `cancelled` and the payload does not send it, so there is no `deleted` flag to add, no second
   way for a job to be invisible, and no state a stale cell could disagree with.

   The row stays on the jobs tab and every event stays on the events tab. What happened to a
   session — who asked, who agreed, who paid — is a thing you may need months later, and it is the
   one thing a real delete would take away. */
on('job-delete', el => {
  const id = el.dataset.id;
  if (!sure_(el, 'End it?')) return;
  el.disabled = true;
  api({ action: 'deleteJob', adminName: USER.name, name: USER.name, jobId: id })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      closeSheet();
      toast('Session ended');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});



/* The state the games keep between frames — the board, the clock, the deck, which month the
   calendar is showing. Carried over WITH them: a game without its state is a function that throws
   on its first line, which is precisely what happened when I moved the functions alone. */
/* ---------- ARE YOU SURE, WITHOUT A DIALOG --------------------------------------------------------
   THE BUTTON BECOMES THE QUESTION. First press changes its words; second press does the thing; and
   four seconds of not pressing puts it back, so a stray tap cannot leave a button armed.

   `confirm()` IS THE ONE THING IT REPLACES, and the reason is the same everywhere it appeared: it
   is an OS dialog in the OS's typeface with the OS's buttons, it stops the page dead, and it cannot
   use a single word this app chose. On a phone it reads as the page having been hijacked.

   RETURNS TRUE ONLY ON THE SECOND PRESS, so every call site reads `if (!sure_(el, '…')) return;`. */
function sure_(el, ask) {
  if (!el) return true;                       // called from somewhere with no button: nothing to arm
  if (el.dataset.sure) { delete el.dataset.sure; return true; }
  el.dataset.sure = '1';
  el.dataset.was = el.textContent;
  el.textContent = ask;
  setTimeout(() => {
    if (!el.dataset.sure) return;
    delete el.dataset.sure;
    el.textContent = el.dataset.was || 'Confirm';
  }, 4000);
  return false;
}

let FEED_AT = null;
let CHESS = null, CHESS_PICK = -1, CHESS_HIST = [], CHESS_BUSY = false;
let CAL_VIEW = null;
let ttState = null;
let timerState = { total: 25*60, left: 25*60, running: false, tick: null };
/* THE SOLID GLYPHS FOR BOTH SIDES, and the colour comes from CSS.
   `♔♕♖` are the white pieces in Unicode and most fonts draw them as OUTLINES — a hollow shape in
   whatever ink the page happens to use. On this app that is pale text on a pale square, so the
   white army was a set of faint wireframes and the black one was solid: two different kinds of
   drawing for two sides of the same game.
   Filled shapes for everyone, told apart by fill and outline rather than by which glyph. That is
   what every chess site does, for exactly this reason. */
const GLYPH = { K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟', k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };
let FEED_DECK = [];
let FEED_SEEN = [];
let FEED_PASS = 0;
const FEED_BUILT = {};

/* ================================================================================================
   THE GAMES AND TOOLS, carried over.

   The chess board, the flappy loop, the times-tables clock, the calculator keypad, the timer, the
   calendar and the feed — all of it moved across whole rather than rewritten, because none of it
   was ever the problem. Only the sticky notes they used to sit on were.
================================================================================================ */

/**
 * SIZE A CANVAS TO ITS BOX, or wait until it has one.
 *
 * A canvas has two sizes — the CSS box it occupies and the `width`/`height` it draws into — and a
 * mismatch does not fail, it STRETCHES. Which is the worst kind: the game runs, the numbers are all
 * correct, and everything on screen is the wrong shape and in the wrong place.
 *
 * Returns false when the box has no size yet and asks to be called back, so a widget that starts
 * before its pane is laid out starts properly a moment later instead of drawing into a default.
 */
function fitCanvas_(canvas, again) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) {
    /* NOT AN ERROR, just early. One retry on the next frame, and one more after a beat for the
       carousel's scroll to settle — after that something is genuinely wrong and retrying for ever
       would be a loop nobody can see. */
    if (again && !canvas.dataset.waiting) {
      canvas.dataset.waiting = '1';
      requestAnimationFrame(() => {
        delete canvas.dataset.waiting;
        again();
      });
    }
    return false;
  }
  delete canvas.dataset.waiting;

  /* ON A PHONE THE BOX IS IN CSS PIXELS and the screen has more than that. Drawing at the box size
     on a 3× display is a third of the resolution the screen can show, which is what made the
     shapes soft. The context is scaled to match, so every number in the game stays in CSS pixels
     and nothing above this line has to know. */
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.round(box.width), h = Math.round(box.height);
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  /* Guarded because a context is not guaranteed — a browser with the canvas turned off returns
     null, and a harness returns a stub with only what it was asked for. Neither should stop the
     size being right, which is the part that matters. */
  if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  /* What the game should use for its own maths: the box, not the backing store. */
  canvas.dataset.w = w;
  canvas.dataset.h = h;
  return true;
}

function initFlappy() {
  const canvas = $('flappy-canvas');
  if (!canvas) return;

  /* THE BOARD IS DRAWN HERE because `startScreen_` calls this on every paint of the column, so it
     picks up the payload the moment `load()` lands and again whenever anything repaints. It is one
     innerHTML over at most six rows and it happens before the game starts. */
  paintBoard_('flappy-board', 'highscore');

  /* THE ELEMENT'S OWN SIZE, not its box. A canvas has two sizes — the CSS one it occupies and the
     `width`/`height` attributes it actually draws into — and stretching the first without the
     second draws at the old resolution and scales the result. Everything blurs, and worse, every
     number in the loop below is in drawing pixels: the bird's radius, the gap, the pipe width. A
     scaled canvas is a game where the collisions do not match what you can see.
     Set here rather than in the markup because the page is a fraction of the screen and the screen
     is not known until it exists. */
  /* MEASURED WHEN IT HAS A SIZE, and measured again when that changes.
     This measured once, at start. A canvas that is not laid out yet reports nothing, so the
     `if` fell through and the element kept its DEFAULT 300×150 backing store — which CSS then
     stretched to whatever the box turned out to be. At 355×236 that is 1.18 across and 1.57 down,
     so a circle came out an egg standing on end, and every collision was against a bird nobody
     could see.
     It fell through more often after the pages became a carousel: a pane that is not the centred
     one is scaled and clipped, and a widget starting in it is asking about a box the browser has
     not settled. */
  if (!fitCanvas_(canvas, () => initFlappy())) return;

  const ctx = canvas.getContext('2d');
  /* THE BOX, not the backing store. Those differ by the pixel ratio now, and using the backing
     store would put the bird three times too far right on a phone. */
  const W = Number(canvas.dataset.w) || canvas.width;
  const H = Number(canvas.dataset.h) || canvas.height;
  /* ---------- BLUE SKY, GREEN PIPES, AND A BIRD ---------------------------------------------------
     ASKED FOR AS "make it look more like flappy bird. blue scky green pipes and the bird", and it
     overrules a decision this file argued at length: four shades of olive green, because the panel
     the original ran on had two bits per pixel and no backlight.

     THE OLIVE ARGUMENT IS KEPT HERE BECAUSE IT IS STILL TRUE OF WHAT IT WAS ARGUING — a shell round
     an olive panel is the object itself, where a shell round a sky-blue game is fancy dress. What
     it was not is an answer to what the owner asked for: the game is called Flabby Pird, everybody
     who opens it knows what it is quoting, and the thing they know is blue. So the panel is a sky
     again — AND THE HANDHELD CASE WENT WITH IT, in the same commit, by that same sentence. See
     `.widget-full:has(.flappy)` in style.css, where the shell was.

     EIGHT COLOURS AND THEY ARE THE ORIGINAL'S OWN. A cyan sky rather than a pure blue, because that
     is what the sprite sheet holds and a flat cornflower reads as a template; a pipe that is three
     greens rather than one, because a lit edge and a shaded one are the whole of what makes a
     rectangle a tube; and one dark outline shared by the pipes, the bird and the floor, which is
     what keeps a bright palette from reading as clip art.

     DECLARED HERE RATHER THAN IN THE STYLESHEET, where `LCD` was and for its reason: the canvas is
     the only thing that paints any of them, and a colour written in two places is the pair that
     disagrees. `.flappy`'s own background is the app's sunk grey and is not a second copy of the
     sky — see the note there for the one moment it shows. */
  const SKY     = '#4ec0ca';   // the sky, flat, as the original's is
  const CLOUD   = '#e8f4f4';
  const BUSH    = '#5bc49a';   // the band of scrub between the sky and the floor
  const GRASS   = '#7ec850';
  const GRASS_D = '#4f9b28';
  const SAND    = '#ded895';   // the floor
  const SAND_D  = '#c8bd72';   // its hatch, which is the thing that makes the floor move
  const PIPE    = '#74bf2e';
  const PIPE_L  = '#a9e25c';
  const PIPE_D  = '#4f8021';
  const EDGE    = '#39301f';   // one outline for everything drawn on top of the sky
  const BODY    = '#f8d030';
  const BELLY   = '#fdf0c0';
  const WING    = '#ffffff';
  const EYE     = '#ffffff';
  const BEAK    = '#f4761e';

  // reset any previous loop
  if (flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  /* SCALED FROM THE WIDTH, which is the axis this game is played along. Scaling from the height
     was wrong twice over: the box is now portrait, so it made everything four times too big, and
     height is not what a side-scroller's difficulty depends on — how far away a pipe is when you
     first see it is a horizontal distance, and so is how long you have to react.
     The original was tuned on a 300px-wide canvas, so that is the unit. Proportions hold and the
     difficulty holds with them, which is the whole point of scaling rather than hard-coding. */
  const k = W / 300;
  const GRAV = 0.45 * k, FLAP = -7 * k, GAP = 110 * k, PIPE_W = 42 * k, SPEED = 2 * k;
  /* THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it. The bird
     died at the canvas EDGE while the old panel's two-shade band sat above that line, so the last
     few pixels of every fall were a bird inside the ground. A strip you can hit is what the game
     being quoted has, and it is the only thing that makes the bottom of the picture read as a
     floor rather than as where the picture stops.
     EVERYTHING THAT USED `H` AS THE BOTTOM NOW USES `FLOOR` — the death test, the bottom pipe, and
     where a pipe's mouth may fall. One name, so they cannot disagree about where down is. */
  const GROUND = Math.max(8, Math.round(H * 0.09));
  const FLOOR = H - GROUND;
  S.bird.r = 9 * k;
  S.bird.x = 60 * k;
  S.bird.y = FLOOR / 2;

  const reset = () => {
    S.bird.y = FLOOR/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    const sc = $('flappy-score'); if (sc) sc.textContent = '0';
  };
  const spawnPipe = () => {
    /* The margins scale too, or on a tall canvas every pipe would cluster at the top. */
    const top = 40 * k + Math.random() * Math.max(10, FLOOR - GAP - 110 * k);
    S.pipes.push({ x: W, top, scored: false });
  };
  const flap = () => {
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = ''; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = ''; loop(); }
    S.bird.vy = FLAP;
  };
  const gameOver = () => {
    S.dead = true; S.running = false;
    $('flappy-msg').textContent = `Game over — score ${S.score}. Tap to retry.`;
    // Save score if a logged-in kid or tutor
    if (canTrack()) {
      const prev = USER.highscore || 0;
      if (S.score > prev) {
        USER.highscore = S.score;
        if ($('flappy-best')) $('flappy-best').textContent = S.score;
        /* Through `send`, which refuses to resolve on a refusal. This ignored the reply entirely
           — `.then(() => …)` runs whatever came back — so a rejected save ran the success branch
           and the catch below, written for exactly this, could never fire. */
        send({ action: 'saveScore', name: USER.name,
               personId: (USER && USER.personId) || '', score: S.score })
          .then(() => {

            /* ---------- TWO HALF-TESTS FOR ONE QUESTION, REPLACED BY THE ONE THAT ASKS IT ----
               THIS MATCHED A STUDENT ON HANDLE ALONE AND A TUTOR ON `title` ALONE. Either half
               answers "not you" for somebody the other would have found — a tutor signed in with
               a handle and a display name that differ was simply never located, so a record they
               had just set was written to the sheet and never to the row the app was holding.
               `mineIs_` is the one test, id first, and it is used here and by `accountPages_`. */
            const meRow = (DATA.students || []).concat(DATA.tutors || []).filter(mineIs_)[0];
            if (meRow) meRow.highscore = S.score;
            /* The board is a list, not the game — redrawing it mid-play costs one innerHTML on a
               dead bird and is the only thing that stops the card announcing a record above a
               chart that still shows the old one. The canvas is untouched. */
            paintBoard_('flappy-board', 'highscore');
          })
          /* The screen already says "New best!". If the save never lands, a child believes a score
             was kept that was not, and finds it gone next visit with nothing to explain it. Say so
             quietly rather than lying, and put the old best back so the display is honest. */
          .catch(() => {
            USER.highscore = prev;
            if ($('flappy-best')) $('flappy-best').textContent = prev;
            if ($('flappy-msg')) $('flappy-msg').textContent =
              `${S.score}! Not saved — no connection.`;
          });
        $('flappy-msg').textContent = `New best: ${S.score}! Tap to retry.`;
      }
    }
  };

  const loop = () => {
    if (!S.running) return;
    S.frame++;
    // physics
    S.bird.vy += GRAV; S.bird.y += S.bird.vy;
    if (S.frame % 90 === 0) spawnPipe();
    S.pipes.forEach(p => p.x -= SPEED);
    S.pipes = S.pipes.filter(p => p.x + PIPE_W > 0);
    // collisions + scoring
    for (const p of S.pipes) {
      if (!p.scored && p.x + PIPE_W < S.bird.x) { p.scored = true; S.score++; $('flappy-score').textContent = S.score; }
      const inX = S.bird.x + S.bird.r > p.x && S.bird.x - S.bird.r < p.x + PIPE_W;
      const hitY = S.bird.y - S.bird.r < p.top || S.bird.y + S.bird.r > p.top + GAP;
      if (inX && hitY) return gameOver();
    }
    if (S.bird.y + S.bird.r > FLOOR || S.bird.y - S.bird.r < 0) return gameOver();
    // draw
    sky();
    S.pipes.forEach(pipe);
    bird();
    hud();
    S.raf = requestAnimationFrame(loop);
  };

  /* PAINTED RATHER THAN CLEARED — `clearRect` leaves the canvas transparent and the app's black
     shows through, which is what once made this a bird in a cave.
     FLAT, NOT A GRADIENT, and this time for the sky's own reason rather than the panel's: the game
     being quoted has a flat sky with things drawn ON it, and a vertical gradient behind clouds is
     the one detail that reads as a stock template. The depth is in the parallax instead. */
  function sky() {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, W, FLOOR);
    clouds();
    bushes();
    ground();
  }

  /* ---------- THREE LAYERS AT THREE SPEEDS, WHICH IS THE WHOLE BACKGROUND -------------------------
     The clouds crawl at a third of the pipes, the scrub at a half and the floor at the full speed.
     That is what says "far away" without drawing anything further away, and it is also the only
     thing that makes the game feel fast: with a still floor the eye reads the whole screen as
     slower than the pipes actually are.
     EVERY OFFSET COMES OFF `S.frame`, so a game that is not running holds still — a background
     scrolling under a "Tap to play" is a screen that looks like it has already started. */
  function clouds() {
    const r = Math.max(8, W * 0.075);
    const span = W + r * 6;
    const off = (S.frame * SPEED / 3) % span;
    ctx.fillStyle = CLOUD;
    for (let i = 0; i < 3; i++) {
      const cx = ((i * span / 3 - off) % span + span) % span - r * 3;
      const cy = FLOOR * (0.15 + 0.13 * (i % 2));
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx + r, cy - r * 0.4, r * 0.78, 0, Math.PI * 2);
      ctx.arc(cx + r * 1.9, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* A SCALLOPED BAND ALONG THE TOP OF THE FLOOR. Half-circles rather than a skyline, because a
     skyline is a drawing somebody has to get right and a row of arcs is three primitives that
     reads as scrub at any size. Contiguous by construction — each arc spans exactly its own step,
     so the band has no seams to line up. */
  function bushes() {
    const h = Math.max(6, FLOOR * 0.06);
    const r = h * 0.75;
    const span = r * 2;
    const off = (S.frame * SPEED / 2) % span;
    ctx.fillStyle = BUSH;
    ctx.beginPath();
    ctx.moveTo(-span, FLOOR);
    for (let x = -off - span; x < W + span; x += span) ctx.arc(x + r, FLOOR, r, Math.PI, 0);
    ctx.lineTo(W + span, FLOOR);
    ctx.closePath();
    ctx.fill();
  }

  function ground() {
    const grass = Math.max(3, Math.round(GROUND * 0.28));
    ctx.fillStyle = SAND;
    ctx.fillRect(0, FLOOR, W, GROUND);
    /* THE HATCH. Leaning parallelograms, scrolling at the pipes' own speed — the floor is the one
       layer the bird is actually travelling over, so it is the one that must not lag. */
    ctx.fillStyle = SAND_D;
    const step = Math.max(8, W * 0.05);
    const off = (S.frame * SPEED) % step;
    for (let x = -off - step; x < W + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + step * 0.34, FLOOR + grass);
      ctx.lineTo(x + step * 0.6, FLOOR + grass);
      ctx.lineTo(x + step * 0.26, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, FLOOR, W, grass);
    ctx.fillStyle = GRASS_D;
    ctx.fillRect(0, FLOOR + grass - Math.max(1, grass * 0.25), W, Math.max(1, grass * 0.25));
    ctx.fillStyle = EDGE;
    ctx.fillRect(0, FLOOR, W, Math.max(1, k));
  }

  /* ---------- A PIPE IS A TUBE WITH A MOUTH -------------------------------------------------------
     FOUR RECTANGLES, NOT TWO: the shaft and a wider cap at each end. The cap is what the bird
     actually flies between, so widening it is not decoration — it is the edge you are judging, and
     a shaft with a flat end gives the eye nothing to judge against.
     THE COLLISION IS STILL THE SHAFT. The cap overhangs it by a few pixels on each side and those
     pixels are free, deliberately: a hitbox tighter than the drawing is the version of this game
     that feels fair, and one wider than it is the version people stop playing. */
  function pipe(p) {
    const capH = Math.max(6, PIPE_W * 0.26);
    const capW = PIPE_W * 1.18;
    const capX = p.x - (capW - PIPE_W) / 2;
    const line = Math.max(1, PIPE_W * 0.05);
    const tube = (x, y, w, h) => {
      if (h <= 0) return;
      ctx.fillStyle = PIPE;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = PIPE_L;
      ctx.fillRect(x + w * 0.13, y, w * 0.17, h);
      ctx.fillStyle = PIPE_D;
      ctx.fillRect(x + w * 0.74, y, w * 0.26, h);
      ctx.strokeStyle = EDGE;
      ctx.lineWidth = line;
      ctx.strokeRect(x + line / 2, y, w - line, h);
    };
    tube(p.x, -line, PIPE_W, p.top - capH + line);
    tube(capX, p.top - capH, capW, capH);
    tube(p.x, p.top + GAP + capH, PIPE_W, FLOOR - p.top - GAP - capH);
    tube(capX, p.top + GAP, capW, capH);
  }

  /* THE SCORE IS ON THE SCREEN. It used to be two rows underneath and nothing else, in the app's
     own settings styling — a score kept on a shelf beside the game rather than in it. The `Score`
     and `Best` rows are still there and still right, because they are what a person reads when the
     go is over; this is what they read while it is running, and no version of this game has ever
     asked anybody to look away from the bird to find out how they are doing. */
  function hud() {
    /* BIG, CENTRED AND OUTLINED, which is where the original keeps it and is also the only place a
       white number survives: a sky, a green pipe and a tan floor all pass under this line, and an
       unoutlined figure disappears into whichever of them it happens to be over. */
    const px = Math.max(14, Math.round(W / 9));
    const face = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.lineJoin = 'round';
    ctx.font = `700 ${px}px ${face}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = Math.max(2, px * 0.14);
    ctx.strokeStyle = EDGE;
    ctx.strokeText(String(S.score), W / 2, px * 1.3);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(S.score), W / 2, px * 1.3);
    /* THE BEST COMES OUT OF THE ROW THAT ALREADY HOLDS IT rather than a second variable — that row
       is written by the code that decides what a best is, and two places holding one number is the
       pair that disagrees. Small and to one side: it is a fact about you, not about this go. */
    const best = ($('flappy-best') || {}).textContent || '0';
    const bp = Math.max(8, Math.round(W / 26));
    ctx.font = `700 ${bp}px ${face}`;
    ctx.textAlign = 'right';
    ctx.lineWidth = Math.max(1.5, bp * 0.16);
    ctx.strokeText('BEST ' + best, W - bp, bp * 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('BEST ' + best, W - bp, bp * 2);
  }

  /* ---------- THE BIRD, AND THE TWO THINGS THAT MAKE IT ONE --------------------------------------
     IT TILTS WITH ITS OWN VELOCITY. Nose up on the way out of a flap, nose down in a dive — which
     is not decoration: it is the only thing on the screen that tells you how fast you are falling
     before you have fallen. A bird drawn level is a bird you have to read the gap to judge.
     AND THE WING BEATS WHILE THE GAME RUNS AND HOLDS WHILE IT DOES NOT. A bird flapping over a
     "Tap to play" is a bird nobody has told to stop, and it is the same fault as a background that
     scrolls before the game has started.

     DRAWN AT THE ORIGIN AND MOVED BY THE CANVAS, because the tilt is a rotation about the bird and
     every coordinate here would otherwise have to carry `S.bird.x` through a trig function. The
     collision is untouched by it — that is a circle of `S.bird.r`, and a rotation does not move a
     circle's centre or change its radius. */
  function bird() {
    const r = S.bird.r;
    const tilt = Math.max(-0.5, Math.min(1.2, (S.bird.vy / (9 * k)) * 0.85));
    const beat = S.running ? Math.sin(S.frame * 0.35) * r * 0.3 : r * 0.1;
    ctx.save();
    ctx.translate(S.bird.x, S.bird.y);
    ctx.rotate(tilt);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = Math.max(1, r * 0.15);
    ctx.fillStyle = BODY;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = BELLY;
    ctx.beginPath();
    ctx.ellipse(r * 0.2, r * 0.4, r * 0.58, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WING;
    ctx.beginPath();
    ctx.ellipse(-r * 0.22, beat, r * 0.55, r * 0.33, -0.25, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = EYE;
    ctx.beginPath();
    ctx.arc(r * 0.5, -r * 0.4, r * 0.33, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = EDGE;
    ctx.beginPath();
    ctx.arc(r * 0.62, -r * 0.4, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BEAK;
    ctx.beginPath();
    ctx.moveTo(r * 0.85, -r * 0.12);
    ctx.lineTo(r * 1.75, r * 0.1);
    ctx.lineTo(r * 0.85, r * 0.42);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // idle draw (bird sitting) — with the score, so the panel never shows a blank corner
  sky();
  bird();
  hud();

  /* ---------- THE FLAP LANDS ON THE FINGER GOING DOWN ---------------------------------------------
     REPORTED AS "when you tap theres like a slight delay" ON AN IPAD, and the delay was the binding
     rather than anything being drawn. `click` FIRES ON THE RELEASE — so every flap this game has
     ever taken waited out the whole of a tap, the eighty to a hundred and fifty milliseconds
     between a finger landing and it lifting again, before the bird moved. There is nothing to tune:
     no part of that is removable while the event is the wrong one.
     (`.flappy` already carries `touch-action: none`, so the browser's own double-tap wait was not
     in it — that is the delay people usually reach for and it was not this one.)

     `pointerdown` FIRES THE INSTANT THE FINGER LANDS, and it answers a finger, a pen and a mouse
     from one binding, which is why it is this rather than `touchstart` beside a click.

     A SWIPE THAT BEGINS ON THE CANVAS ALREADY FLAPPED, so nothing is lost by moving off `click`.
     `PRESS_MOVED` in shell.js swallows the click a drag produces, but it does so in the document's
     own bubble handler — an element handler in the target phase runs first and always did.

     `onclick` IS CLEARED RATHER THAN LEFT ALONE. The canvas is rebuilt on every paint of the column
     so there is normally nothing on it, and a stale one would be a second flap per tap. */
  canvas.onclick = null;
  canvas.onpointerdown = e => {
    if (e.isPrimary === false) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    flap();
  };
  // space/arrow to flap (only when arcade canvas exists)
  S.keyHandler = e => { if ((e.code === 'Space' || e.code === 'ArrowUp') && $('flappy-canvas')) { e.preventDefault(); flap(); } };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}