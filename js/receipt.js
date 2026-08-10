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

async function receiptCanvas() {
  const L = bookPrice();
  if (!L) return null;
  const rows = breakdownRows(L);

  /* Drawn at three times the size and scaled down by the device, so it is sharp on a phone and
     still sharp when somebody opens it on a laptop. */
  const S = 3, W = 380 * S, PAD = 26 * S;
  const LINE = 17 * S;

  /* Height has to be known before drawing, so the rows are measured first. Two passes over the same
     list rather than a guess: a canvas that is too short crops the total off the bottom. */
  const photoH = 96 * S;
  const headH = 92 * S;
  const footH = 118 * S;
  const H = photoH + headH + rows.length * LINE + footH;

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  if (!g) return null;

  const INK = '#2b2620', FAINT = '#8a8175', PAPER = '#f4f1e8';
  g.fillStyle = PAPER;
  g.fillRect(0, 0, W, H);

  /* The torn ends. Same zigzag the card has, drawn as triangles cut out of the paper. */
  const tooth = 10 * S;
  g.globalCompositeOperation = 'destination-out';
  for (let x = 0; x < W; x += tooth) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + tooth / 2, tooth); g.lineTo(x + tooth, 0);
    g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x, H); g.lineTo(x + tooth / 2, H - tooth); g.lineTo(x + tooth, H);
    g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over';

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
      g.fillStyle = '#e6e1d4';
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
  const cols = [PAD, PAD + 26 * S, W - PAD - 150 * S, W - PAD - 96 * S, W - PAD - 56 * S, W - PAD];
  g.font = `${9.5 * S}px ui-monospace, monospace`;
  rows.forEach(r => {
    g.textAlign = 'left';
    g.fillStyle = '#a99f8f'; g.fillText(r.n || '', cols[0], y);
    g.fillStyle = r.big ? INK : '#6a6259';
    g.font = `${r.big ? 700 : 400} ${9.5 * S}px ui-monospace, monospace`;
    g.fillText(r.k, cols[1], y);
    g.textAlign = 'right';
    g.fillStyle = INK;
    /* Trimmed to what fits. A value that runs into the next column is worse than one cut short. */
    g.fillText(String(r.v || '').slice(0, 22), cols[3] - 6 * S, y);
    g.fillStyle = '#6a6259'; g.fillText(r.mul || '', cols[4] - 6 * S, y);
    g.fillStyle = '#8a8175'; g.fillText(r.rate || '', cols[5] - 46 * S, y);
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
  el.disabled = true;
  const was = el.textContent;
  el.textContent = 'Drawing…';
  try {
    const cv = await receiptCanvas();
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
  el.textContent = was;
});

function drawBooker() { redrawBooker_(drawBooker_); }

function drawBooker_() {
  /* PLAYING WITH IT.
     Once every question is answered the card is the whole booking, and the thing somebody actually
     wants next is not to start again — it is to ask what happens if. A different tutor, one fewer
     seat, hosting it themselves. The funnel is right for BUILDING a booking, where each answer
     narrows the next, and wrong for CHANGING one, where you already know what you want to change.
     So the card becomes the control. Every chosen value on it is already underlined to say
     somebody picked it; pressing one reopens that question with everything else kept, and answering
     it comes straight back to the card with the running column moved. No mode, no edit button —
     the value IS the button, which is what the old form did with its inline selects.
     `editing` is which question is open. Empty means the card. */
  const step = BOOKING.editing
    ? (bookStep_(BOOKING.editing) || nextBookStep())
    : nextBookStep();
  const L = bookPrice();

  /* WHAT HAS BEEN SAID SO FAR, each one pressable to change. A wizard that hides its earlier
     answers is one you have to restart to correct. */
  const said = BOOK_STEPS.filter(bookAnswered_).map(st => {
    const v = BOOKING[st.id];
    const text = st.emails
      ? ((BOOKING.split || []).filter(x => String(x).trim()).length
          ? (BOOKING.split || []).filter(x => String(x).trim()).join(', ') : 'Just us')
      : st.grid
      ? bookRuns().map(r => r.dayName.slice(0, 3) + ' ' + r.hour + ':00').join(', ')
      : st.multi ? v.join(', ') : (st.label_ ? st.label_(v) : v);
    return `<button class="chip" data-do="book-undo" data-step="${esc(st.id)}">
      <span class="chip-k">${esc(st.label.replace(/\?$/, ''))}</span>${esc(text)}
      <span class="chip-x">✕</span></button>`;
  }).join('');

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
  const noKids = USER && !bookStep_('kids').options().length
    && !(USER.children || USER.kids || []).length
    && norm(USER.role) !== 'tutor' && norm(USER.role) !== 'kid';
  const kidsNote = noKids
    ? `<p class="note" style="margin:.2rem 0 .6rem">No children are on your account, so we cannot
         ask which of them this is for — the seats will just say <b>Child</b>.
         <span class="faint">Ask us to add them and the next booking will name them.</span></p>`
    : '';

  /* THE RUNNING BREAKDOWN. Every row says what it did to the price and what the price is with it
     applied — so the last figure IS the total, rather than a number you have to trust.
     Built from PRICE_ROWS, the same list the old card used, so a row cannot be drawn without being
     costed or costed without being drawn. */
  const money_ = bookBreakdown(L);
  if (!step) {
    openSheet('Ask for a session', `
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${kidsNote}
      ${money_ || '<p class="note">Not enough answered to price it yet.</p>'}
      <label class="field"><span>anything else we should know</span>
        <textarea id="book-note" placeholder="Optional"></textarea></label>
      <button class="btn" data-do="book-send">Ask for it</button>
      ${/* SHARING IT BEFORE SENDING IT. A parent deciding usually shows somebody else first — the
            other parent, the family they are splitting with — and until now that meant a
            screenshot, which crops badly and loses the bottom of a long receipt. */''}
      <button class="btn quiet" data-do="book-share">Share this receipt</button>
      <p class="faint" id="book-said" style="margin:.6rem 0 0">
        Nothing is booked or charged yet — this asks, and we come back to you.</p>`);
    return;
  }

  /* THE GRID IS DRAWN, not listed. Every other question is a set of options; this one is a week. */
  if (step.grid) {
    const g = slotGrid();
    const on = BOOKING.slots || [];
    const runs = bookRuns();
    openSheet(step.label, `
      ${g.anyOpen ? `
        <p class="faint">Tick the hours. Two together is a two-hour session; another day is another
          session that week.</p>
        <div class="slot-grid">
          ${g.rows.map(r => `<div class="slot-row">
            <span class="slot-day">${esc(r.label.slice(0, 3))}</span>
            <div class="slot-hours">
              ${r.hours.map(h => `<button class="hr${on.indexOf(h.code) !== -1 ? ' on' : ''}${
                h.open ? '' : ' shut'}" ${h.open ? '' : 'disabled'}
                title="${h.h}:00${h.open ? '' : ' — not available'}"
                data-do="book-slot" data-code="${esc(h.code)}">${h.h}</button>`).join('')}
            </div>
          </div>`).join('')}
        </div>
        ${runs.length ? `<p class="note">${runs.map(r =>
            esc(r.dayName) + ' ' + r.hour + ':00–' + (r.hour + r.hours) + ':00').join(' · ')}</p>
          <button class="btn" data-do="book-more" data-step="slots">Done — ${runs.length} session${
            runs.length === 1 ? '' : 's'} a week</button>` : ''}`
        /* NO HOURS AND WHY. An empty grid with no explanation reads as the app being broken; the
           reason is always something somebody can go and fix in the sheet. */
        : `<p class="note">${esc(g.why)}</p>`}
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${kidsNote}
      ${money_}`);
    return;
  }

  /* ONE BOX PER PERSON, and a ＋ for another. How many there are IS how many there are. */
  if (step.emails) {
    const list = BOOKING.split || [];
    openSheet(step.label, `
      <p class="faint">Each family pays their own share. Leave it empty if it is just you.</p>
      ${list.map((v, k) => `<label class="field"><span>their email</span>
        <input type="email" data-do="split-set" data-k="${k}" value="${esc(v)}"
               placeholder="name@example.com"></label>`).join('')}
      <div class="btn-row">
        <button class="btn quiet" data-do="split-add">＋ another</button>
        <button class="btn" data-do="split-done">
          ${list.filter(x => String(x).trim()).length
            ? 'Done — split ' + (list.filter(x => String(x).trim()).length + 1) + ' ways'
            : 'Just us'}</button>
      </div>
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${kidsNote}
      ${money_}`);
    return;
  }

  const opts = step.options().filter(Boolean);
  const chosen = step.multi ? (BOOKING[step.id] || []) : [];

  openSheet(step.label, `
    ${BOOKING.editing ? '<button class="btn quiet" data-do="book-back">Leave it as it is</button>' : ''}
    ${opts.map(v => {
      const why = step.why ? step.why(v) : '';
      const on = chosen.indexOf(v) !== -1;
      /* NOT REMOVED, MARKED. An option that does not fit is shown with the reason, because a list
         that quietly drops things is a list that seems to have decided for you — and because the
         thing it would drop is often the thing you meant. */
      return `<div class="card tap${on ? ' is-on' : ''}${why ? ' is-off' : ''}"
           data-do="book-pick" data-step="${esc(step.id)}" data-value="${esc(v)}">
        <div class="row" style="border:0;padding:0">
          <span class="k">${on ? '✓ ' : ''}${mark(step.label_ ? step.label_(v) : v)}</span>
          ${why ? `<span class="v faint">${esc(why)}</span>` : ''}
        </div>
      </div>`;
    }).join('')}
    ${step.multi && chosen.length
      ? `<button class="btn" style="margin-top:.6rem" data-do="book-more"
           data-step="${esc(step.id)}">Done — ${chosen.length} chosen</button>` : ''}
    ${/* WHAT HAS BEEN SAID, between the question and the price. Above the choices it was the first
          thing read on a screen whose whole job is the list below it; below the breakdown it would
          be past the fold. Here it separates the two and reads as the join between them. */''}
    ${said ? `<div class="chips">${said}</div>` : ''}
    ${kidsNote}
    ${money_}`);
}

on('book-send', el => {
  const said = $('book-said');
  const L = bookPrice();
  el.disabled = true;
  if (said) said.textContent = 'Asking…';

  const spec = bookSpec();
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
    openToOthers: /^yes/i.test(String(BOOKING.openTo || '')) ? 'TRUE' : 'FALSE',
    kids: (BOOKING.kids || []).filter(Boolean).join(', '),
    service: BOOKING.service || 'Tuition',
    /* Who to invite. `createJob` has accepted this since the beginning and nothing ever sent it,
       so a split booking was priced per family and nobody else was ever told about it. */
    splitEmails: (BOOKING.split || []).filter(x => String(x).trim()).join(', '),
    message: ($('book-note') || {}).value || '',
    /* THE SAME ASK TWICE IS ONE ASK. A slow connection and an impatient thumb are the ordinary way
       a family ends up with two identical bookings, and the backend already refuses a repeated
       requestId — this is what gives it one. */
    requestId: 'R' + Date.now() + '-' + Math.floor(Math.random() * 1e6) })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
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
    /* AND, FOR AN ADMIN, THE WAY TO END IT. Under the receipt rather than on the stub: deleting a
       session from a list you are scanning is one mis-tap away from deleting the wrong one, and a
       receipt is the one place you can see exactly which session you are looking at. */
    + (isAdmin()
      ? `<div class="btn-row" style="margin-top:1rem">
           <button class="btn danger" data-do="job-delete" data-id="${esc(id)}">Delete this session</button>
         </div>
         <p class="faint" style="margin:.5rem 0 0">Everyone is withdrawn and it disappears from the
           list. Nothing is erased — every event stays on the events tab, so what happened is still
           on the record.</p>`
      : ''));
});

/* ASKING TO JOIN. The same `move` a tutor uses to apply — one machine, one set of rules, and the
   capacity and the family's consent are both checked on the backend rather than trusted from here. */
on('job-join', el => {
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client', name: USER.name,
        move: 'Request', requestId: 'join-' + el.dataset.id + '-' + Date.now(),
        text: 'asked to join' })
    .then(d => {
      if (d && d.error) { el.disabled = false; toast(d.error); return; }
      closeSheet();
      toast('Asked — they will be in touch');
      load();
    })
    .catch(() => { el.disabled = false; toast('Could not reach the server.'); });
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
  const GOLD = '#d4af37', GREEN = '#3cb043';
  /* SKY. The game was drawn on the app's own black, which is right for a terminal and wrong for a
     bird — the one thing everybody knows about this game is that it happens in the air. */
  const SKY = '#7ec8f2', SKY_LOW = '#bfe6ff';

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
    ctx.fillStyle = GREEN;
    S.pipes.forEach(p => { ctx.fillRect(p.x, 0, PIPE_W, p.top); ctx.fillRect(p.x, p.top+GAP, PIPE_W, H-p.top-GAP); });
    bird();
    S.raf = requestAnimationFrame(loop);
  };

  /* SKY, painted rather than cleared. `clearRect` leaves the canvas transparent and the app's own
     black shows through — which is what made this a bird in a cave. Lighter towards the horizon,
     because that is what a sky does and two flat colours would read as a stripe. */
  function sky() {
    const g2 = ctx.createLinearGradient(0, 0, 0, H);
    g2.addColorStop(0, SKY);
    g2.addColorStop(1, SKY_LOW);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  /* THE BIRD, and it is round. `arc` always draws a circle in canvas coordinates — the egg was the
     canvas being stretched, not the shape being wrong — so this is the same call it always was,
     now that the box and the backing store agree. */
  function bird() {
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI * 2);
    ctx.fill();
    /* An eye and a beak: three primitives, and the difference between a bird and a dot. */
    ctx.fillStyle = '#2b2620';
    ctx.beginPath();
    ctx.arc(S.bird.x + S.bird.r * 0.35, S.bird.y - S.bird.r * 0.3, S.bird.r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8862b';
    ctx.beginPath();
    ctx.moveTo(S.bird.x + S.bird.r * 0.8, S.bird.y);
    ctx.lineTo(S.bird.x + S.bird.r * 1.5, S.bird.y + S.bird.r * 0.18);
    ctx.lineTo(S.bird.x + S.bird.r * 0.8, S.bird.y + S.bird.r * 0.36);
    ctx.closePath();
    ctx.fill();
  }

  // idle draw (bird sitting)
  sky();
  bird();

  canvas.onclick = flap;
  // space/arrow to flap (only when arcade canvas exists)
  S.keyHandler = e => { if ((e.code === 'Space' || e.code === 'ArrowUp') && $('flappy-canvas')) { e.preventDefault(); flap(); } };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}