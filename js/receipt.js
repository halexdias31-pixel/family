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


/* The one entry point. Everything that changes an answer calls this, and it is the only thing
   that calls `drawBooker_` — so nothing can redraw the sheet without keeping its place. */
/* ---------- THE RECEIPT AS A PICTURE --------------------------------------------------------------
   Drawn onto a canvas from the same booking the card is drawn from, then handed to the phone's own
   share sheet.

   WHY NOT SCREENSHOT THE ELEMENT. There is no way to do it without a library — html2canvas and its
   kind are a hundred kilobytes and a fourth permanent file — and the SVG-foreignObject trick that
   avoids them is worse: it silently drops remote images and any font the page did not inline. So
   the receipt is drawn twice, once in HTML and once here. That is real duplication and the honest
   cost of not taking a dependency; the ROW DATA is shared, so what differs between them is only
   how a row is painted.

   THE PHOTOGRAPHS ARE THE HARD PART. Drawing a remote image onto a canvas TAINTS it — the browser
   refuses `toBlob` afterwards, on the reasoning that a page should not be able to read pixels it
   was only allowed to display. Drive does not send the header that would allow it. So each photo is
   attempted with CORS and, when that fails, a drawn frame takes its place: the share always works,
   and it never half-works.
--------------------------------------------------------------------------------------------- */

/** Load an image for canvas use, or nothing. Never rejects — a missing photo is not a failed share. */
function corsImage_(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    /* Some hosts neither load nor error — they hang. A share that never happens is worse than one
       without pictures. */
    setTimeout(() => resolve(img.complete && img.naturalWidth ? img : null), 2500);
  });
}

/* ---------- THE PICTURE IS OF WHATEVER YOU SHARED ------------------------------------------------
   IT ALWAYS DREW A RECEIPT. Whatever was on screen — a blank screen card, an application waiting to
   be accepted, a place on a waiting list — the shared image came out as a finished receipt, headed
   with the same three lines and stamped with nothing.

   THE SCREEN SHOWS FOUR DIFFERENT DOCUMENTS and they are different on purpose: an application is
   not a receipt, and sharing one as though it were is telling somebody a thing has been paid for
   when it has not. The stage is what the card already knows about itself; the picture just never
   asked. */
async function receiptCanvas(stage) {
  const L = bookPrice();
  if (!L) return null;
  const rows = breakdownRows(L);
  /* THE SAME WORDS THE CARD USES, so a shared picture and the screen it came from cannot say
     different things about the same booking. */
  const STAGE_SAY = {
    screen: 'Asking for a session',
    application: 'Waiting to be accepted',
    waitlist: 'On the waiting list',
    receipt: '',
  };
  const stageLine = STAGE_SAY[stage] !== undefined ? STAGE_SAY[stage] : '';

  /* Drawn at three times the size and scaled down by the device, so it is sharp on a phone and
     still sharp when somebody opens it on a laptop. */
  /* ---------- WIDE ENOUGH FOR WHAT IS ON IT ------------------------------------------------------
     380 WAS THE PHONE-CARD WIDTH and this is not a phone card, it is a picture somebody opens in
     WhatsApp and pinches to read. Sized to the columns instead: a 14-character label, a value worth
     reading, and three numeric columns that cannot be squeezed. At 380 the value column came out
     eight characters — "Summer Holiday" arriving as "Summer H", which is a clash solved by
     destroying the content, and no better than the clash. */
  const S = 3, W = 540 * S, PAD = 26 * S;
  const LINE = 17 * S;

  /* Height has to be known before drawing, so the rows are measured first. Two passes over the same
     list rather than a guess: a canvas that is too short crops the total off the bottom. */
  const photoH = 96 * S;
  /* THE HEADER GROWS WITH THE STAMP. A fixed height plus a new line is a new line drawn over the
     first row of the table — the sort of fault that only appears on the one stage that has a
     stamp, which is not the one anybody tests. */
  const headH = (stageLine ? 106 : 92) * S;
  const footH = 118 * S;
  const H = photoH + headH + rows.length * LINE + footH;

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  if (!g) return null;

  /* ---------- AND THE PAPER ITSELF, NOT JUST THE STAMP -------------------------------------------
     A STAMP ON RECEIPT PAPER IS STILL RECEIPT PAPER. The last pass added a line saying "ASKING FOR
     A SESSION" and left the picture cream, torn-edged and pocketable — so a booking nobody has
     agreed to still arrived on WhatsApp looking exactly like something paid for, with a caveat
     written on it. Text does not undo a shape; the paper is what somebody sees before they read.

     THE SCREEN ALREADY HAS THREE DIFFERENT PAPERS and they were chosen for reasons worth keeping:

       SCREEN       a dark terminal. Nothing has been asked for yet — it is the thing you are
                    typing INTO, and it should look like a device rather than a document.
       APPLICATION  a white form with a red filing edge. A form is punched and filed; a receipt is
                    torn and pocketed, and the edge is the difference.
       WAITLIST     the same form, blue, because waiting is a different sort of pending from
                    waiting to be accepted.
       RECEIPT      cream, torn, and the only one of the four that means the money moved.

     These are the same colours the stylesheet uses, restated here because a canvas cannot read
     CSS — the one honest duplication in this file, and the reason both lists name the stage. */
  const SKINS = {
    screen:      { paper: '#0d0f0e', ink: '#7fd6a4', faint: '#6f8f7c', edge: '#2a2f2c', torn: false },
    application: { paper: '#fbfaf7', ink: '#1e1c19', faint: '#7a7469', edge: '#b9312b', torn: false },
    waitlist:    { paper: '#fbfaf7', ink: '#1e1c19', faint: '#7a7469', edge: '#2f6fb0', torn: false },
    receipt:     { paper: '#f4f1e8', ink: '#2b2620', faint: '#8a8175', edge: '',        torn: true },
  };
  const skin = SKINS[stage] || SKINS.receipt;
  const INK = skin.ink, FAINT = skin.faint, PAPER = skin.paper;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, W, H);
  /* THE FILING EDGE, down the left, on the two that are forms. */
  if (skin.edge) { g.fillStyle = skin.edge; g.fillRect(0, 0, 5 * S, H); }

  /* THE TORN ENDS, AND ONLY ON THE ONE THAT IS TORN. This ran unconditionally, so a form arrived
     with a receipt's ragged edges — the same contradiction as the cream paper, in the shape rather
     than the colour. A receipt is torn off a roll; a form is punched and filed and has straight
     edges because it lives in a drawer. */
  /* THE TOOTH SIZE IS DECLARED OUT HERE, not inside the `if`. It sets where the content starts as
     well as how deep the tear is — line 143 below uses it to leave room at the top — so scoping it
     to the torn branch made every share of a non-torn document throw `tooth is not defined`, which
     is to say every share of a booking, which is the thing I had just changed. A `const` moved
     inside a block it is used outside of: the same shape of fault as `day` in the backend earlier
     tonight, and neither checker looks at scope. */
  const tooth = 10 * S;
  if (skin.torn) {
    g.globalCompositeOperation = 'destination-out';
    for (let x = 0; x < W; x += tooth) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + tooth / 2, tooth); g.lineTo(x + tooth, 0);
      g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x, H); g.lineTo(x + tooth / 2, H - tooth); g.lineTo(x + tooth, H);
      g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  let y = tooth + 8 * S;

  /* ---- the photographs, in grey ---- */
  const { venue, tutor } = facesOf_(BOOKING.loc, BOOKING.tutor);
  const shots = await Promise.all([
    corsImage_(venue && venue.image ? pic(venue.image) : ''),
    corsImage_(tutor && tutor.image ? pic(tutor.image) : ''),
  ]);
  const boxW = (W - PAD * 2 - 8 * S) / 2, boxH = photoH - 14 * S;
  shots.forEach((img, i) => {
    const x = PAD + i * (boxW + 8 * S);
    g.save();
    g.beginPath(); g.rect(x, y, boxW, boxH); g.clip();
    if (img) {
      /* ONE INK. A till roll has no colour in it, and a colour photograph is the one thing that
         gives away a screen pretending to be paper. */
      g.filter = 'grayscale(1) contrast(1.18)';
      const scale = Math.max(boxW / img.width, boxH / img.height);
      g.drawImage(img, x + (boxW - img.width * scale) / 2, y + (boxH - img.height * scale) / 2,
                  img.width * scale, img.height * scale);
      g.filter = 'none';
    } else {
      g.fillStyle = skin.torn ? '#e6e1d4' : (stage === 'screen' ? '#1c2320' : '#e8e4da');
      g.fillRect(x, y, boxW, boxH);
      g.fillStyle = FAINT;
      g.font = `${9 * S}px ui-monospace, monospace`;
      g.textAlign = 'center';
      g.fillText(i ? (BOOKING.tutor || 'no tutor') : (BOOKING.loc || 'no venue'),
                 x + boxW / 2, y + boxH / 2);
    }
    g.restore();
    g.strokeStyle = '#c9c0b0'; g.lineWidth = 1 * S;
    g.strokeRect(x, y, boxW, boxH);
  });
  y += photoH;

  /* ---- the head ---- */
  g.textAlign = 'center'; g.fillStyle = INK;
  g.font = `700 ${13 * S}px ui-monospace, monospace`;
  g.fillText('@family.', W / 2, y); y += 16 * S;
  /* WHAT THIS IS, above the details. A picture with no stamp reads as settled, which is exactly
     wrong for the three stages that are not. */
  if (stageLine) {
    g.font = `700 ${8.5 * S}px ui-monospace, monospace`;
    /* THE STAMP IN THE SKIN'S OWN INK. Brown on a dark terminal is very nearly the background —
       the one line whose whole job is to say what this is, unreadable on the one stage that most
       needs it. */
    g.fillStyle = stage === 'screen' ? skin.ink : '#8a6a3c';
    g.fillText(stageLine.toUpperCase(), W / 2, y);
    y += 14 * S;
  }
  g.font = `${9.5 * S}px ui-monospace, monospace`; g.fillStyle = FAINT;
  [BOOKING.loc || 'venue not chosen', BOOKING.tutor || 'no tutor yet',
   BOOKING.interval || 'term not chosen'].forEach(t => { g.fillText(t, W / 2, y); y += 13 * S; });
  y += 6 * S;

  const rule = () => {
    g.strokeStyle = '#b3aa9c'; g.lineWidth = 1 * S;
    g.setLineDash([3 * S, 3 * S]);
    g.beginPath(); g.moveTo(PAD, y); g.lineTo(W - PAD, y); g.stroke();
    g.setLineDash([]); y += 14 * S;
  };
  rule();

  /* ---- the rows. Same six columns as the card, in the same order. ---- */
  /* ---------- COLUMNS MEASURED FROM WHAT GOES IN THEM ---------------------------------------------
     THE RATE COLUMN RAN INTO THE MULTIPLIER BY UP TO A HUNDRED UNITS on every row that had both —
     "x 1.01" and "+ £0.10/h" drawn over each other, which is the clash. The positions were picked
     by eye and each is right-aligned, so a column has no idea how wide the one before it grew.

     WIDTHS FROM THE LONGEST THING EACH COLUMN ACTUALLY HOLDS, at this font, with a gap that cannot
     be eaten:

       total   "£1,234.56"   9 chars
       rate    "+ £10.00/h"  10 chars
       mul     "x 1.01"      6 chars

     Monospace makes this exact rather than approximate: every glyph is 0.6em, so the width of a
     column is its longest string and no measurement is a guess. A proportional font would need
     `measureText` and a fallback when it lies. */
  const CH = 9.5 * S * 0.6;                    /* one character, at the table's font */
  const GAP = 8 * S;                           /* the least space that still reads as a gap */
  const totW = 9 * CH, rateW = 10 * CH, mulW = 6 * CH;
  const totR = W - PAD;
  const rateR = totR - totW - GAP;
  const mulR = rateR - rateW - GAP;
  const valR = mulR - mulW - GAP;
  const cols = [PAD, PAD + 26 * S, valR, valR, mulR, totR];
  g.font = `${9.5 * S}px ui-monospace, monospace`;
  rows.forEach(r => {
    g.textAlign = 'left';
    g.fillStyle = FAINT; g.fillText(r.n || '', cols[0], y);
    g.fillStyle = r.big ? INK : '#6a6259';
    g.font = `${r.big ? 700 : 400} ${9.5 * S}px ui-monospace, monospace`;
    g.fillText(r.k, cols[1], y);
    g.textAlign = 'right';
    g.fillStyle = INK;
    /* Trimmed to what fits. A value that runs into the next column is worse than one cut short. */
    /* TRIMMED TO WHAT THE COLUMN HOLDS, not to a number somebody typed. 22 was a guess and the
       room is whatever is left between the label and the multiplier — computed, so it stays true
       if any of the widths above change. */
    /* AGAINST THE LONGEST LABEL, not against a guess. Reserving 15 characters when the longest
       label is 14 leaves the value one character of margin on the widest row and lies about the
       rest — measuring the label actually on this row gives each one the room it really has. */
    const valRoom = Math.max(6, Math.floor((valR - (cols[1] + (r.k || '').length * CH + GAP)) / CH));
    g.fillText(String(r.v || '').slice(0, valRoom), valR, y);
    g.fillStyle = FAINT; g.fillText(r.mul || '', mulR, y);
    g.fillStyle = FAINT; g.fillText(r.rate || '', rateR, y);
    g.fillStyle = INK; g.font = `${r.big ? 700 : 400} ${9.5 * S}px ui-monospace, monospace`;
    g.fillText(r.total || '', cols[5], y);
    y += LINE;
  });

  y += 4 * S; rule();

  /* ---- what it costs ---- */
  g.textAlign = 'left'; g.fillStyle = INK;
  g.font = `700 ${11 * S}px ui-monospace, monospace`;
  g.fillText('TO PAY', PAD, y);
  g.textAlign = 'right';
  g.font = `700 ${15 * S}px ui-monospace, monospace`;
  g.fillText(money(L.total), W - PAD, y);
  y += 22 * S;
  rule();

  /* ---- the barcode, from the same seed the card uses ---- */
  let seed = hashOf(BOOK_STEPS.map(st => {
    const v = BOOKING[st.id];
    return st.id + ':' + (Array.isArray(v) ? v.join(',') : String(v ?? ''));
  }).concat(['slots:' + (BOOKING.slots || []).join(','),
             'split:' + (BOOKING.split || []).join(',')]).join('|')) >>> 0;
  let bx = PAD;
  g.fillStyle = INK;
  for (let i = 0; i < 44 && bx < W - PAD; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const w = (1 + (seed % 3)) * S;
    if (seed % 7) g.fillRect(bx, y, w, 34 * S);
    bx += w + 2 * S;
  }
  y += 48 * S;

  g.textAlign = 'center'; g.fillStyle = FAINT;
  g.font = `${9 * S}px ui-monospace, monospace`;
  g.fillText('Nothing is booked until you ask for it.', W / 2, y);

  return cv;
}

on('book-share', async el => {
  /* ---------- A TILE HAS NO TEXT TO REPLACE -------------------------------------------------------
     THIS WROTE "Drawing…" INTO THE BUTTON, which worked while the button was a word. It is a mark
     now, and `textContent` on it would have deleted the SVG — the control would go blank mid-press
     and never come back, because `was` would have been the empty string it started with.

     `tileSet_` IS THE WAY TO CHANGE A TILE, and what it changes is the title: the name is the only
     text a mark has. Drawing a receipt takes a moment on a long card, so saying so is still worth
     it — it is just said where an icon-only control says anything. */
  el.disabled = true;
  const was = el.getAttribute('title') || 'Share this booking';
  tileSet_(el, { label: 'Drawing…' });
  try {
    /* WHICH DOCUMENT IS ON SCREEN. Read off the button rather than worked out again here — the card
       that drew the button already decided, and deciding twice is two answers waiting to differ. */
    const cv = await receiptCanvas(el.getAttribute('data-stage') || '');
    if (!cv) throw new Error('Not enough answered to print it yet');
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) throw new Error('The picture could not be made');
    const file = new File([blob], 'family-session.png', { type: 'image/png' });

    /* THE PHONE'S OWN SHARE SHEET where there is one — that is how this reaches WhatsApp, which is
       where these actually get sent. `canShare` is checked with the FILE, not just for existence:
       a browser can have `share` and refuse files, and finding that out from a rejected promise
       means the download never happens. */
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: '@family. session' });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'family-session.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Saved to your downloads');
    }
  } catch (err) {
    /* Somebody dismissing the share sheet is not an error and must not look like one. */
    if (!/abort/i.test(String(err && err.name))) {
      toast(String(err && err.message || 'Could not share that'));
    }
  }
  el.disabled = false;
  tileSet_(el, { label: was });
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
function drawBooker() { redrawBooker_(paintBook_); }

/** WHERE IT IS UP TO, or null when nobody is booking. Empty is the blank paper, not a form. */
function bookerCard() {
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
                act: 'book-share', data: { stage: 'screen' } })}
    </div>
    <p class="rc-terms" id="book-said">Nothing is booked or charged yet — this asks, and we come
      back to you.</p>`;
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
        resetBooking_();
        toast('Asked — they will be in touch');
        load();
      })
      .catch(() => {
        el.disabled = false;
        if (said) said.textContent = 'Could not reach the server.';
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
on('job', el => {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const j = jobs.find(x => String(x.id || x.jobId || '') === String(el.dataset.id));
  if (!j) { toast('That session is not in this list any more'); return; }
  const id = String(j.id || j.jobId || '');
  openSheet('Session ' + id, jobReceipt(j)
    /* The way in, for somebody who is not in it yet. */
    + joinBlock(j)
    /* AND THE WAY TO PAY, once it has been accepted. */
    + payBlock(j)
    /* AND, FOR AN ADMIN, THE WAY TO END IT. Under the receipt rather than on the stub: deleting a
       session from a list you are scanning is one mis-tap away from deleting the wrong one, and a
       receipt is the one place you can see exactly which session you are looking at. */
    + (isAdmin()
      ? `${/* ---------- ANSWERING IT, WHICH IS THE THING THAT WAS MISSING ---------------------------
              A client asks for a session and somebody has to say yes. There was no way to: `move`
              refused anybody not already in the booking, so a request sat at Waiting until a TUTOR
              happened to accept it — and on a job with no tutor, nothing could move it at all. The
              only admin control was Delete, which ends it for everybody.

              ACCEPT AND DECLINE ARE THE TWO HALVES OF ONE DECISION, so they sit together and above
              Delete — which is a different act: Delete ends a session that was already agreed,
              Decline turns down one that was never taken up. */''}
         ${jobStage_(j) === 'application' || jobStage_(j) === 'waitlist'
           ? `<div class="btn-row" style="margin-top:1rem">
                <button class="btn" data-do="job-answer" data-id="${esc(id)}"
                        data-yes="1">Accept this booking</button>
                <button class="btn danger" data-do="job-answer" data-id="${esc(id)}"
                        data-yes="">Decline it</button>
              </div>
              <p class="faint" style="margin:.5rem 0 0">Accepting settles the terms for everybody in
                it, and the family can pay. Declining turns the whole booking down and tells them.</p>`
           : ''}
         ${/* ---------- MARKING IT PAID, FOR MONEY THAT DID NOT COME THROUGH STRIPE ---------------
              People pay in cash at the library, or by bank transfer, or settle three sessions at
              once. None of that reaches the card flow, so a family who had genuinely paid stayed on
              an accepted application for ever and never got the receipt proving what they bought.

              ONLY ONCE IT IS ACCEPTED. Marking an unagreed booking paid puts somebody on a session
              whose price and day nobody has settled — the backend refuses it and this does not
              offer it, so the refusal is never something to run into. */''}
         ${jobStage_(j) === 'application' && jobAccepted_(j)
           ? `<div class="btn-row" style="margin-top:1rem">
                <button class="btn" data-do="job-paid" data-id="${esc(id)}">Mark as paid</button>
              </div>
              <p class="faint" style="margin:.5rem 0 0">For cash, a transfer, or anything that did
                not go through the card page. It is recorded as marked by you, with how they paid —
                never as though Stripe had confirmed it.</p>`
           : ''}
         <div class="btn-row" style="margin-top:1rem">
           <button class="btn danger" data-do="job-delete" data-id="${esc(id)}">Delete this session</button>
         </div>
         <p class="faint" style="margin:.5rem 0 0">Everyone is withdrawn and it disappears from the
           list. Nothing is erased — every event stays on the events tab, so what happened is still
           on the record.</p>`
      : ''));
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
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
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
  if (!yes && !confirm('Turn this booking down? Everybody in it is removed and told.')) return;
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
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
});

/* MARKING IT PAID BY HAND. The one action on this site that says money arrived without a payment
   processor having said so — which is why it asks HOW, and why the answer goes into the event log
   rather than being thrown away. "Cash at the library" is the whole audit trail for that payment,
   and a blank is worse than a guess because a guess can be corrected. */
on('job-paid', el => {
  const how = prompt('How was it paid? (cash, bank transfer, …)', 'cash');
  /* CANCELLED IS NOT AN EMPTY ANSWER. `prompt` gives null when somebody backs out and '' when they
     press OK on an empty box — the first must do nothing at all, and treating them alike would
     record a payment nobody meant to record. */
  if (how === null) return;
  el.disabled = true;
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
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
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
  const kids = prompt('Who is coming? (names, or how many children)', '');
  if (kids === null) return;                 // backed out — nobody is put down for it
  el.disabled = true;
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
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
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
  if (!confirm('End this session and remove it from the list?\n\n'
    + 'Everyone in it is withdrawn. The record of what happened is kept.')) return;
  el.disabled = true;
  api({ action: 'deleteJob', adminName: USER.name, name: USER.name, jobId: id })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      closeSheet();
      toast('Session ended');
      load();
    })
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
});



/* The state the games keep between frames — the board, the clock, the deck, which month the
   calendar is showing. Carried over WITH them: a game without its state is a function that throws
   on its first line, which is precisely what happened when I moved the functions alone. */
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
  /* ---------- FOUR COLOURS, WHICH IS WHAT MAKES IT A HANDHELD ------------------------------------
     THE SHELL WAS NEVER THE THING. A grey plastic case round a sky-blue game is fancy dress; the
     screen is what anybody actually recognises, and that screen could only ever show four shades of
     the same olive green — the panel had two bits per pixel and no backlight, so everything drawn
     on it, sky and bird and score alike, came out of these four.
     WHICH IS ALSO WHY IT SUITS THIS APP. A blue gradient was the brightest thing on a black screen;
     an olive LCD is dim by nature and sits beside a terminal without shouting. */
  const LCD = {
    off:  '#9bbc0f',   // the panel with nothing on it — the lightest a pixel gets
    pale: '#8bac0f',   // one shade down, for the ground and the edges
    mid:  '#306230',   // pipes
    ink:  '#0f380f',   // the bird, the score, anything that must read as ON
  };

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
  S.bird.r = 9 * k;
  S.bird.x = 60 * k;
  S.bird.y = H / 2;

  const reset = () => {
    S.bird.y = H/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    const sc = $('flappy-score'); if (sc) sc.textContent = '0';
  };
  const spawnPipe = () => {
    /* The margins scale too, or on a tall canvas every pipe would cluster at the top. */
    const top = 40 * k + Math.random() * Math.max(10, H - GAP - 110 * k);
    S.pipes.push({ x: W, top, scored: false });
  };
  const flap = () => {
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = ''; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = ''; loop(); }
    S.bird.vy = FLAP;
  };
  const gameOver = () => {
    S.dead = true; S.running = false;
    $('flappy-msg').textContent = `Game over — score ${S.score}. Click to retry.`;
    // Save score if a logged-in kid or tutor
    if (canTrack()) {
      const prev = USER.highscore || 0;
      if (S.score > prev) {
        USER.highscore = S.score;
        if ($('flappy-best')) $('flappy-best').textContent = S.score;
        /* Through `send`, which refuses to resolve on a refusal. This ignored the reply entirely
           — `.then(() => …)` runs whatever came back — so a rejected save ran the success branch
           and the catch below, written for exactly this, could never fire. */
        send({ action: 'saveScore', name: USER.name, score: S.score })
          .then(() => {

            const meS = (DATA.students||[]).find(s => norm(s.handle) === norm(USER.handle)); if (meS) meS.highscore = S.score;
            const meT = (DATA.tutors||[]).find(x => norm(x.title) === norm(USER.name)); if (meT) meT.highscore = S.score;
            // No re-render mid-game — the "Best" display already updated; cards refresh naturally later
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
        $('flappy-msg').textContent = `New best: ${S.score}! Click to retry.`;
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
    if (S.bird.y + S.bird.r > H || S.bird.y - S.bird.r < 0) return gameOver();
    // draw
    sky();
    /* PIPES IN THE MID SHADE, with a darker lip at the mouth of each. A flat rectangle is a block;
       a block with a rim is a pipe, and a rim is the only detail four colours will pay for. */
    S.pipes.forEach(p => {
      ctx.fillStyle = LCD.mid;
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
      ctx.fillStyle = LCD.ink;
      const lip = Math.max(3, PIPE_W * 0.12);
      ctx.fillRect(p.x, p.top - lip, PIPE_W, lip);
      ctx.fillRect(p.x, p.top + GAP, PIPE_W, lip);
    });
    bird();
    hud();
    S.raf = requestAnimationFrame(loop);
  };

  /* THE PANEL, painted rather than cleared — `clearRect` leaves the canvas transparent and the app's
     black shows through, which is what once made this a bird in a cave.
     FLAT, NOT A GRADIENT. The gradient was right for a sky and is wrong for this: an LCD cannot
     shade, and a graded background is the one detail that would give the whole thing away. */
  function sky() {
    ctx.fillStyle = LCD.off;
    ctx.fillRect(0, 0, W, H);
    /* A band of the next shade down along the foot — the ground. Two shades is all it takes to say
       which way is down, and it is the only depth cue a four-colour panel can give. */
    ctx.fillStyle = LCD.pale;
    ctx.fillRect(0, H - Math.max(6, H * 0.03), W, H);
  }

  /* THE SCORE, ON THE SCREEN. It was two rows underneath in the app's own settings styling, which is
     the detail that made the case look like a costume: no handheld has ever kept its score on a
     shelf beside itself.
     THE BEST COMES OUT OF THE ROW THAT ALREADY HOLDS IT rather than a second variable — that row is
     written by the code that decides what a best is, and two places holding one number is the pair
     that disagrees. */
  function hud() {
    const px = Math.max(9, Math.round(W / 22));
    ctx.font = `700 ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = LCD.ink;
    ctx.textAlign = 'left';
    ctx.fillText(String(S.score), px * 0.8, px * 1.8);
    const best = ($('flappy-best') || {}).textContent || '0';
    ctx.textAlign = 'right';
    ctx.fillStyle = LCD.mid;
    ctx.fillText('BEST ' + best, W - px * 0.8, px * 1.8);
  }

  /* THE BIRD, and it is round. `arc` always draws a circle in canvas coordinates — the egg was the
     canvas being stretched, not the shape being wrong — so this is the same call it always was,
     now that the box and the backing store agree. */
  function bird() {
    ctx.fillStyle = LCD.ink;
    ctx.beginPath();
    ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI * 2);
    ctx.fill();
    /* An eye and a beak: three primitives, and the difference between a bird and a dot. The eye is
       the PANEL colour rather than a colour of its own — on a screen with four shades you make a
       highlight by switching a pixel off, not by finding a lighter ink. */
    ctx.fillStyle = LCD.off;
    ctx.beginPath();
    ctx.arc(S.bird.x + S.bird.r * 0.35, S.bird.y - S.bird.r * 0.3, S.bird.r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = LCD.mid;
    ctx.beginPath();
    ctx.moveTo(S.bird.x + S.bird.r * 0.8, S.bird.y);
    ctx.lineTo(S.bird.x + S.bird.r * 1.5, S.bird.y + S.bird.r * 0.18);
    ctx.lineTo(S.bird.x + S.bird.r * 0.8, S.bird.y + S.bird.r * 0.36);
    ctx.closePath();
    ctx.fill();
  }

  // idle draw (bird sitting) — with the score, so the panel never shows a blank corner
  sky();
  bird();
  hud();

  canvas.onclick = flap;
  // space/arrow to flap (only when arcade canvas exists)
  S.keyHandler = e => { if ((e.code === 'Space' || e.code === 'ArrowUp') && $('flappy-canvas')) { e.preventDefault(); flap(); } };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}