/* @family. — receipt.js ONE FILE, SPLIT. § */


/* ---------- SHARING IS A PICTURE OF WHAT IS ON THE SCREEN § */

/* TWO DEVICE PIXELS TO A CSS PIXEL. A 1x picture of a 330px card is soft on every phone sold this
   decade, and 3x makes a file twice the size for a difference nobody sees in a chat thumbnail. */
const RC_SNAP_K = 2;

/* ---------- THE FONT, CARRIED IN THE PICTURE § */
let RC_FONTS_ = null;
function rcFonts_() {
  if (RC_FONTS_) return RC_FONTS_;
  const faces = [];
  [...document.styleSheets].forEach(sh => {
    let rules = [];
    /* A STYLESHEET FROM ANOTHER ORIGIN THROWS ON `cssRules` — Google Fonts, if one is ever linked.
       Skipped rather than fatal: a face that cannot be read falls back, the rest are still carried. */
    try { rules = [...sh.cssRules]; } catch (e) { return; }
    rules.forEach(r => {
      if (r.type !== 5 && !/^@font-face/i.test(r.cssText || '')) return;
      faces.push({ css: r.cssText, base: sh.href || location.href });
    });
  });
  const inline = url => fetch(url)
    .then(r => r.ok ? r.blob() : Promise.reject(new Error(r.status)))
    .then(b => new Promise((ok, no) => {
      const fr = new FileReader();
      fr.onload = () => ok(fr.result);
      fr.onerror = () => no(fr.error);
      fr.readAsDataURL(b);
    }));
  const seen = {};
  RC_FONTS_ = Promise.all(faces.map(f => {
    const urls = [];
    f.css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => { urls.push(u); return m; });
    return Promise.all(urls.map(u => {
      const abs = new URL(u, f.base).href;
      seen[abs] = seen[abs] || inline(abs).catch(() => '');
      return seen[abs].then(d => [u, d]);
    })).then(pairs => pairs.reduce((css, [u, d]) => d ? css.split(u).join(d) : css, f.css));
  })).then(all => all.join('\n'))
    /* A FONT THAT WILL NOT LOAD IS NOT A SHARE THAT FAILS. The picture is still the booking, in the
       fallback face; refusing to share it over a typeface would be the worse answer. Not remembered,
       so the next press tries again. */
    .catch(() => { RC_FONTS_ = null; return ''; });
  return RC_FONTS_;
}

/* ---------- THE CLONE, WEARING WHAT THE BROWSER COMPUTED § */
function rcStyle_(cs) {
  let s = '';
  for (let i = 0; i < cs.length; i++) {
    const p = cs[i];
    if (/^(animation|transition)/.test(p)) continue;
    s += p + ':' + cs.getPropertyValue(p) + ';';
  }
  /* `background-position` IS COPIED BY ITS TWO HALVES, because the whole one does not come back. § */
  s += 'background-position-x:' + cs.getPropertyValue('background-position-x')
    + ';background-position-y:' + cs.getPropertyValue('background-position-y') + ';';
  return s + 'animation:none;transition:none;';
}

function rcClone_(el, rules) {
  if (el.nodeType === 3) return document.createTextNode(el.nodeValue);
  if (el.nodeType !== 1) return null;
  const cs = getComputedStyle(el);
  /* NOT DRAWN IS NOT COPIED. § */
  if (cs.display === 'none') return null;

  /* ---------- A CONTROL BECOMES THE WORDS IT SHOWS § */
  const text = el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
    || (el.tagName === 'INPUT'
        && !/^(checkbox|radio|range|color|file|image|button|submit|reset|hidden)$/i.test(el.type));
  if (text) {
    const d = document.createElement('div');
    let words = el.value, ink = '';
    if (el.tagName === 'SELECT') {
      const o = el.options[el.selectedIndex];
      words = o ? o.text : '';
    } else if (!el.value && el.placeholder) {
      words = el.placeholder;
      /* BOTH PROPERTIES. The computed `-webkit-text-fill-color` is the box's own ink already
         resolved, and it is what paints — so setting `color` alone left the hint in white. */
      const hint = getComputedStyle(el, '::placeholder');
      ink = 'color:' + hint.color + ';-webkit-text-fill-color:'
        + (hint.getPropertyValue('-webkit-text-fill-color') || hint.color) + ';';
    }
    d.textContent = words;
    /* `overflow: clip` WRITTEN, NOT COPIED. § */
    d.setAttribute('style', rcStyle_(cs) + ink + 'overflow:clip;'
      + (el.tagName === 'TEXTAREA' ? 'white-space:pre-wrap;' : 'white-space:nowrap;'));
    return d;
  }

  const c = el.cloneNode(false);
  c.setAttribute('style', rcStyle_(cs));
  ['::before', '::after'].forEach(p => {
    const ps = getComputedStyle(el, p);
    const ct = ps.getPropertyValue('content');
    if (!ct || ct === 'none' || ct === 'normal') return;
    const k = 'rcp' + rules.length;
    c.classList.add(k);
    rules.push('.' + k + p + '{' + rcStyle_(ps) + '}');
  });
  [...el.childNodes].forEach(n => {
    const k = rcClone_(n, rules);
    if (k) c.appendChild(k);
  });
  /* A TICK IS A PROPERTY TOO. */
  if (el.tagName === 'INPUT') {
    if (el.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked');
  }
  return c;
}

/* ---------- WHAT IS BEHIND THE CORNERS § */
function rcBehind_(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const bg = getComputedStyle(p).backgroundColor;
    if (bg && !/^(transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\))$/.test(bg)) return bg;
  }
  return getComputedStyle(document.documentElement).backgroundColor || '#000';
}

/** The `.rc` as a PNG at `RC_SNAP_K` device pixels per CSS pixel. Resolves `{ blob, w, h, svg }`. */
function rcPng_(rc) {
  /* ---------- THE SNAPSHOT IS TAKEN IN ONE GO, SYNCHRONOUSLY § */
  rc.classList.add('rc-snap');
  let box, xml, behind;
  const rules = [];
  try {
    box = rc.getBoundingClientRect();
    const clone = rcClone_(rc, rules);
    clone.classList.remove('rc-snap');
    /* AT THE ORIGIN OF THE PICTURE. Its margin placed it in the column; here there is no column. */
    clone.style.margin = '0';
    /* ---------- AND AT ITS OWN SIZE, NOT THE SIZE IT WAS SHRUNK TO § */
    const z = (() => {
      const cw0 = parseFloat(getComputedStyle(rc).width);
      return cw0 > 0 && box.width > 0 ? box.width / cw0 : 1;
    })();
    if (Math.abs(z - 1) > 0.01) {
      clone.style.zoom = '1';
      box = { width: box.width / z, height: box.height / z, left: box.left, top: box.top };
    }
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    xml = new XMLSerializer().serializeToString(clone);
    behind = rcBehind_(rc);
  } finally {
    rc.classList.remove('rc-snap');
  }
  const w = Math.max(1, box.width), h = Math.max(1, box.height);
  const cw = Math.ceil(w * RC_SNAP_K), ch = Math.ceil(h * RC_SNAP_K);
  return rcFonts_().then(fonts => {
    /* `viewBox` IS THE CSS SIZE AND `width`/`height` THE PIXEL SIZE, so the browser lays the HTML out at the width it had on the screen — the same wraps, the same § */
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" `
      + `viewBox="0 0 ${cw / RC_SNAP_K} ${ch / RC_SNAP_K}"><style>${fonts}\n${rules.join('\n')}</style>`
      + `<foreignObject x="0" y="0" width="${w}" height="${h}">${xml}</foreignObject></svg>`;
    return new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => {
        /* `decode()` BEFORE DRAWING, where there is one. Safari fires `load` on an SVG image before
           its embedded font is ready and the first draw comes out in the fallback face. */
        const ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        ready.then(() => {
          try {
            const cv = document.createElement('canvas');
            cv.width = cw; cv.height = ch;
            const g = cv.getContext('2d');
            g.fillStyle = behind;
            g.fillRect(0, 0, cw, ch);
            g.drawImage(img, 0, 0, cw, ch);
            cv.toBlob(b => b ? ok({ blob: b, w: cw, h: ch, svg })
                             : no(new Error('the browser made an empty picture')), 'image/png');
          } catch (e) { no(e); }
        });
      };
      img.onerror = () => no(new Error('the browser could not draw the receipt'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  });
}

/* ---------- WHERE THE PICTURE GOES § */
let RC_SHOT = null;   /* { file, url } — the last picture made, for the sheet's own Share button */

function rcSave_(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  if (!('download' in a)) return rcOffer_(blob, name);
  a.href = url;
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  /* NOT REVOKED AT ONCE. Some browsers start the download after the click returns, and a URL revoked
     under it is a zero-byte file. A minute is long enough and costs one picture's memory. */
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast('Saved a picture of this booking');
}

function rcOffer_(blob, name) {
  if (RC_SHOT && RC_SHOT.url) URL.revokeObjectURL(RC_SHOT.url);
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : blob;
  RC_SHOT = { file, url: URL.createObjectURL(blob), name };
  const can = !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
  /* A DIALOGUE, SO ITS ACTIONS ARE BUTTONS — CLAUDE.md's rule, and the pay sheet is the precedent. */
  openSheet('Share this booking', `
    <img class="rc-shot" src="${RC_SHOT.url}" alt="This booking, as a picture" decoding="async">
    <p class="note">${can ? 'Press Share to send it.' : 'Press and hold the picture to save it.'}</p>
    <div class="btn-row">
      ${can ? '<button class="btn primary" data-do="rc-shot-share">Share</button>' : ''}
      <a class="btn quiet" href="${RC_SHOT.url}" download="${esc(name)}">Save</a>
    </div>`);
}

on('rc-shot-share', () => {
  if (!RC_SHOT || !navigator.share) return;
  navigator.share({ files: [RC_SHOT.file], title: 'Booking' })
    .catch(e => { if (!e || e.name !== 'AbortError') toast('Could not share it — press and hold the picture to save it'); });
});

function rcHand_(blob, name) {
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
  const can = !!(file && navigator.share && navigator.canShare
                 && (() => { try { return navigator.canShare({ files: [file] }); } catch (e) { return false; } })());
  if (!can) return rcSave_(blob, name);
  return navigator.share({ files: [file], title: 'Booking' }).catch(e => {
    if (e && e.name === 'AbortError') return;
    rcOffer_(blob, name);
  });
}

on('book-share', el => {
  /* THE DOCUMENT THIS CONTROL IS PART OF, asked of the DOM rather than remembered — the same move as
     `msg-send` walking up to its nearest `.msg-form`. The form and a saved session share this handler
     without either being named. */
  const rc = el && el.closest && el.closest('.rc');
  if (!rc) return toast('There is nothing to share on this card yet');
  /* SAID AT ONCE, because the picture takes a moment and a press that answers nothing for half a
     second gets pressed again. */
  toast('Making a picture of this booking…');
  rcPng_(rc)
    .then(p => rcHand_(p.blob, 'family-booking-' + stamp_() + '.png'))
    .catch(e => toast('Could not make the picture: ' + String((e && e.message) || e)));
});

/* THE BOOKER IS NOT A SHEET ANY MORE. § */
/* The one entry point. § */
/* THE LIST OF CHECKBOXES UNDER A SEVERAL-OF-A-LIST ROW IS PART OF THE CARD — see `stepManyList_` — so this one redraw is what keeps the tick, the row's own § */
function drawBooker() {
  redrawBooker_(paintBook_);
  /* EVERY ANSWER COMES THROUGH HERE, so here is where the form is kept for a reload (`bookKeep_`, book.js). */
  if (typeof bookKeep_ === 'function') bookKeep_();
}

/** WHERE IT IS UP TO, or null when nobody is booking. Empty is the blank paper, not a form. */
function bookerCard() {
  /* ---------- THE LIST IS NOT DRAWN INSTEAD OF THE CARD § */
  const out = drawBooker_();
  if (!out) return '';
  return `<div id="bookr">
    ${/* ---------- NO CARD AROUND IT § */
          ''}
    ${out.html}
  </div>`;
}

function drawBooker_() {
  /* ---------- THERE IS NO SECOND THING TO DRAW § */
  const L = bookPrice();

  /* WHAT HAS BEEN SAID SO FAR, each one pressable to change. A wizard that hides its earlier
     answers is one you have to restart to correct. */
  /* `said` WAS HERE — a chip per answered question, each with a ✕ that cleared it. § */

  /* ---------- A QUESTION THAT DID NOT GET ASKED, SAID OUT LOUD § */
  /* AND THE NOTE HAS TO NAME THE RIGHT ACCOUNT. § */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  const mine = !USER || !forWhom || norm(forWhom) === norm(USER.name);
  /* AND NO CHILDREN NOTE AT ALL WHEN THERE IS NO CLIENT. § */
  const noKids = USER && forWhom && !isWaiting_()
    && !bookStep_('kids').options().length
    && rank_() !== 'staff' && rank_() !== 'student';
  const kidsNote = noKids
    ? `<p class="note" style="margin:.2rem 0 .6rem">No children are on
         ${mine ? 'your account' : esc(forWhom) + '&rsquo;s account'}, so we cannot ask which of
         them this is for — the seats will just say <b>Child</b>.
         <span class="faint">${mine ? 'Ask us to add them and the next booking will name them.'
           : 'Add them to that account and the next booking will name them.'}</span></p>`
    : '';

  /* THE RUNNING BREAKDOWN. § */
  /* ---------- THE ACTIONS ARE PRINTED ON THE PAPER § */
  const foot = `
    ${/* ---------- TWO MARKS, NOT A BUTTON AND A MARK § */
          ''}
    ${/* A CHILD ASKS A PARENT, NOT THE BUSINESS (398): no price reaches her, so the parent books it. Share stays — it is how she shows them. */
      childView_() ? `<p class="note rc-kid">${esc(KID_ASK_PARENT)}</p>` : ''}
    <div class="tile-row rc-tiles">
      ${childView_() ? '' : tile_({ icon: 'send', label: 'Ask for it', tone: 'buy', act: 'book-send' })}
      ${tile_({ icon: 'share', label: 'Share this booking',
                /* `data: { stage: 'screen' }` WAS HERE and it was the second half of a choice this document made twice, back when sharing drew the receipt again onto a canvas. § */
                act: 'book-share' })}
    </div>
    ${/* ---------- THE FOOTER LINE WENT § */
          ''}`;
  const money_ = bookBreakdown(L, foot);

  /* ---------- THE CARD IS THE FORM, FROM THE FIRST QUESTION § */
  const head = `${kidsNote}${money_ || ''}`;

  /* ONE RETURN. This was four branches — a question, a grid, a list of email boxes, and the card — and the last three have moved onto the paper. § */
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

  /* ---------- A CLASS GOES SOMEWHERE ELSE ENTIRELY § */
  /* ---------- ASKING TO JOIN A CLASS THAT IS ALREADY RUNNING § */
  const joined = typeof joinedJob_ === 'function' ? joinedJob_() : null;
  if (joined && !isWaiting_()) {
    /* SENT: the form's draft is not drawn by another page while this asks (`bookSending_`, book.js). */
    bookSending_(true);
    api({ action: 'move', jobId: String(joined.id || joined.jobId || ''),
          role: 'client', name: USER.name, personId: (USER && USER.personId) || '', move: 'Request',
          text: 'asked to join', requestId: 'join-' + (joined.id || '') + '-' + Date.now() })
      .then(d => {
        el.disabled = false;
        if (d && d.error) { bookSending_(false); if (said) said.textContent = d.error; return; }
        /* THE CLASS YOU ASKED TO JOIN, kept so it comes back under the blank form — see `ASKED_JOB` in book.js. § */
        ASKED_JOB = String(joined.id || joined.jobId || '');
        resetBooking_();
        toast('Asked — they will be in touch');
        load();
      })
      /* ---------- THE HANDLER TOOK NO ARGUMENT AND THEN USED ONE § */
      .catch(err => {
        el.disabled = false;
        bookSending_(false);
        if (said) said.textContent = why_(err);
      });
    return;
  }

  if (isWaiting_()) {
    /* ---------- OPENING ONE IS A DIFFERENT ACTION FROM JOINING ONE § */
    const forNobody = BOOKING.client === NOBODY;
    bookSending_(true);
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
        /* WHERE IT HAS GOT TO, because that is the whole content of a waiting list. § */
        toast(d && d.seats
          ? 'On the list — ' + d.joined + ' of ' + d.seats + ' seats taken'
          : 'On the list');
        /* BOTH WAITLIST VERBS ANSWER WITH ONE. § */
        ASKED_JOB = String((d && d.jobId) || '');
        resetBooking_();
        load();
      })
      /* `send_` has already said what went wrong and marked the error handled — this stops it
         reaching the console as an unhandled rejection, and adds nothing a person would read. */
      .catch(() => { el.disabled = false; bookSending_(false); });
    return;
  }

  /* ---------- A TUTOR WITH NO HOURS IS NOT SENT FOR § */
  if (spec.tutor && typeof tutorNoHours_ === 'function' && tutorNoHours_(spec.tutor)) {
    el.disabled = false;
    if (said) said.textContent = spec.tutor + ' hasn\u2019t set their hours yet, so they cannot be booked by name. '
      + 'Choose No preference, or another tutor.';
    return;
  }

  /* THE ONE THAT MATTERS MOST. Asking for a session had no failure path: with no connection the
     button did nothing and the request was never sent, and nobody was told either fact. */
  bookSending_(true);
  send_({ action: 'createJob',
    name: USER.name, clientName: USER.name,
    /* WHO THIS BOOKING BELONGS TO, permanently. § */
    personId: USER.personId || '',
    subject: spec.subjects.join(', '), level: spec.level,
    day: spec.day, time: spec.time, location: BOOKING.loc,
    /* EVERY HOUR TICKED, as the grid's own codes — `m16, m17, f10`. § */
    slots: (Array.isArray(BOOKING.slots) ? BOOKING.slots : []).join(','),
    hosting: spec.hosting, hours: spec.hours, interval: spec.interval,
    requestedTutor: spec.tutor,
    dates: (L && L.sessionDates || []).map(d => fmtDate(d)).join(', '),
    price: L ? String(L.total || '') : '',
    /* WHAT THE JOB IS WORTH TO YOU, which `priceFrom` has always worked out and nothing ever
       sent — so the sheet's profit column stayed empty on every booking made through the app. */
    profit: L ? String(Math.round((L.profitTotal || 0) * 100) / 100) : '',
    /* AND WHAT THE TUTOR EARNS, from the same ledger — the backend wrote `tutor_pay` blank on every
       job because nothing sent it, so a tutor's receipt had no figure to show them. */
    tutorPay: L && isFinite(Number(L.tutorPay)) ? String(Math.round(L.tutorPay * 100) / 100) : '',
    /* THE MONEY BLOCK'S FIGURES, AND WHAT KIND OF SESSION THEY PRICED (docs/history/353). § */
    ...bookMoneySend_(L),
    /* THE PRINTED LINES, sent with the request so the backend can keep the receipt AS DRAWN. § */
    /* GUARDED, because `bookPrice` returns null until enough is answered to price anything — and `book-send` can be pressed before that, which is exactly what the § */
    lines: JSON.stringify(((L2) => L2 ? breakdownRows(L2).map(r => ({
      n: r.n, k: r.k, v: r.v, mul: r.mul, rate: r.rate, total: r.total,
    })) : [])(bookPrice())),
    /* WHO IS ACTUALLY COMING, by name, where the parent told us. § */
    /* `splitOthers` was sent here too — the COUNT of other families, which nothing on the backend has ever read. § */
    /* WHETHER A FAMILY YOU HAVE NOT MET MAY ASK TO JOIN. Sent as the plain answer rather than a
       boolean, so the sheet reads as the question was asked. */
    /* ALWAYS TRUE, because the question is gone and the SEATS are the answer now. § */
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
      /* Emptied from the step list rather than from a list of names written here — see `resetBooking_`. § */
      resetBooking_();
      load();
    })
    .catch(err => {
      el.disabled = false;
      bookSending_(false);
      if (said) said.textContent = String(err.message || 'Could not ask for that');
    });
});

/* THE WHOLE RECEIPT, on tap. § */
/* ---------- A SESSION OPENS ON ITS OWN PAGE, NOT OVER THE TOP OF THE APP § */
on('job', el => {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const want = String(el.dataset.id || '');
  const j = jobs.find(x => String(x.id || x.jobId || '') === want);
  if (!j) { toast('That session is not in this list any more'); return; }
  if (!USER) { toast('Sign in to open a session'); go('account'); return; }

  OPEN_JOB = want;
  /* ---------- AND THE COLUMN HAS TO BE TOLD IT IS OUT OF DATE § */
  markStale_('booking');
  /* ---------- THE PAGE IS SET BEFORE THE SCREEN IS REACHED, NOT AFTER § */
  const n = typeof jobPageAt_ === 'function' ? jobPageAt_(want) : -1;
  if (n >= 0) PAGE.booking = n;
  go('booking');
});

/* PAYING. `createCheckout` builds a Stripe session and hands back a URL; nothing about the booking is recorded by it, because a client who opens the payment page § */
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

/* ---------- THE BUSINESS ANSWERING A REQUEST § */
on('job-answer', el => {
  const yes = !!el.dataset.yes;
  /* DECLINING IS ASKED ABOUT. § */
  /* TWO PRESSES, NOT A confirm(). § */
  if (!yes && !sure_(el, 'Turn it down?')) return;
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client',
        name: USER.name, personId: (USER && USER.personId) || '', adminName: USER.name,
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

/* ---------- THE FAMILY LEAVING § */
on('job-leave', el => {
  const paid = !!el.dataset.paid;
  if (!sure_(el, paid ? 'Mark unpaid?' : 'Mark paid?')) return;
  el.disabled = true;
  api({ action: 'move', jobId: el.dataset.id, role: 'client',
        /* THE ID AS WELL AS THE NAME — `move` now asks WHO is posting (a tutor seat needs a tutor),
           and a display name is an editable cell; the gate fills it from the token either way. */
        name: USER.name, personId: (USER && USER.personId) || '', move: 'Withdraw',
        requestId: 'wd-' + el.dataset.id + '-' + Date.now() })
    .then(d => {
      el.disabled = false;
      if (d && d.error) { toast(d.error); return; }
      toast('Withdrawn');
      load();
    })
    .catch(err => { el.disabled = false; toast(why_(err)); });
});

/* MARKING IT PAID BY HAND. § */
on('job-paid', el => {
  /* ---------- ASKED IN A SHEET, NOT IN A prompt() § */
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
/* TAKING A SEAT ON A CLASS SOMEBODY ELSE STARTED. § */
/* COMING ALONG. The event is created by the first family to join it — there is no "open the event" step, because an event nobody has joined is a row saying § */
on('fest-join', el => {
  const f = (DATA.festive || []).find(x => String(x.id) === String(el.dataset.id));
  if (!f) { toast('That has finished.'); return; }
  /* ASKED IN A SHEET, NOT IN A prompt(). § */
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

/* ---------- TAKING A SEAT GOES TO THE FORM § */
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


/* ---------- ASKING TO JOIN GOES TO THE FORM, LIKE TAKING A SEAT § */
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

/* ---------- AN ADMIN ENDS A SESSION § */
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



/* The state the games keep between frames — the board, the clock, the deck, which month the calendar is showing. § */
/* ---------- ARE YOU SURE, WITHOUT A DIALOG § */
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
let CHESS = null, CHESS_PICK = -1, CHESS_HIST = [], CHESS_PROMO = null, CHESS_LAST = null, CHESS_ARM = 0;
let CAL_VIEW = null;
let ttState = null;
let timerState = { total: 25*60, left: 25*60, running: false, tick: null };
/* THE SOLID GLYPHS FOR BOTH SIDES, and the colour comes from CSS. § */
const GLYPH = { K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟', k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };
let FEED_DECK = [];
let FEED_SEEN = [];
let FEED_PASS = 0;
const FEED_BUILT = {};

/* THE GAMES AND TOOLS, carried over. § */

/* SIZE A CANVAS TO ITS BOX, or wait until it has one. § */
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

  /* ON A PHONE THE BOX IS IN CSS PIXELS and the screen has more than that. § */
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.round(box.width), h = Math.round(box.height);
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  /* Guarded because a context is not guaranteed — a browser with the canvas turned off returns null, and a harness returns a stub with only what it was asked for. § */
  if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  /* What the game should use for its own maths: the box, not the backing store. */
  canvas.dataset.w = w;
  canvas.dataset.h = h;
  return true;
}

/* `still`: DRAWN AHEAD OF ITS ARRIVAL (`flappyStill_`, the widget's declared `draw`) — the board, the canvas fitted to its box and one frame of the scene, and § */
function flappyStill_() { return initFlappy(true); }
function initFlappy(still) {
  const canvas = $('flappy-canvas');
  if (!canvas) return still ? false : undefined;

  /* THE BOARD IS DRAWN HERE because `startScreen_` calls this on every paint of the column, so it picks up the payload the moment `load()` lands and again whenever § */
  paintBoard_('flappy-board', 'highscore');

  /* THE ELEMENT'S OWN SIZE, not its box. § */
  /* MEASURED WHEN IT HAS A SIZE, and measured again when that changes. § */
  /* A STILL DRAWING DOES NOT WAIT FOR A BOX: § */
  if (!fitCanvas_(canvas, still ? null : () => initFlappy(still))) return still ? false : undefined;

  const ctx = canvas.getContext('2d');
  /* THE BOX, not the backing store. Those differ by the pixel ratio now, and using the backing
     store would put the bird three times too far right on a phone. */
  const W = Number(canvas.dataset.w) || canvas.width;
  const H = Number(canvas.dataset.h) || canvas.height;
  /* ---------- BLUE SKY, GREEN PIPES, AND A BIRD § */
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

  // reset any previous loop — but not from a still drawing, which the builder makes only of a game running nowhere
  if (!still && flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  /* SCALED FROM THE WIDTH, which is the axis this game is played along. § */
  const k = W / 300;
  /* THE GAP IS 98, NOT 110: § */
  const GRAV = 0.45 * k, FLAP = -7 * k, GAP = 98 * k, PIPE_W = 42 * k, SPEED = 2 * k;
  /* THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it. § */
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
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = '\u00a0'; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = '\u00a0'; loop(); }
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
        /* Through `send`, which refuses to resolve on a refusal. § */
        send({ action: 'saveScore', name: USER.name,
               personId: (USER && USER.personId) || '', score: S.score })
          .then(() => {

            /* ---------- TWO HALF-TESTS FOR ONE QUESTION, REPLACED BY THE ONE THAT ASKS IT § */
            const meRow = (DATA.students || []).concat(DATA.tutors || []).filter(mineIs_)[0];
            if (meRow) meRow.highscore = S.score;
            /* The board is a list, not the game — redrawing it mid-play costs one innerHTML on a dead bird and is the only thing that stops the card announcing a record § */
            paintBoard_('flappy-board', 'highscore');
          })
          /* The screen already says "New best!". § */
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

  /* PAINTED RATHER THAN CLEARED — `clearRect` leaves the canvas transparent and the app's black shows through, which is what once made this a bird in a cave. § */
  function sky() {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, W, FLOOR);
    clouds();
    bushes();
    ground();
  }

  /* ---------- THREE LAYERS AT THREE SPEEDS, WHICH IS THE WHOLE BACKGROUND § */
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

  /* A SCALLOPED BAND ALONG THE TOP OF THE FLOOR. § */
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

  /* ---------- A PIPE IS A TUBE WITH A MOUTH § */
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

  /* THE SCORE IS ON THE SCREEN. § */
  function hud() {
    /* BIG, CENTRED AND OUTLINED, which is where the original keeps it and is also the only place a white number survives: § */
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
    /* THE BEST COMES OUT OF THE ROW THAT ALREADY HOLDS IT rather than a second variable — that row is written by the code that decides what a best is, and two places § */
    const best = ($('flappy-best') || {}).textContent || '0';
    const bp = Math.max(8, Math.round(W / 26));
    ctx.font = `700 ${bp}px ${face}`;
    ctx.textAlign = 'right';
    ctx.lineWidth = Math.max(1.5, bp * 0.16);
    ctx.strokeText('BEST ' + best, W - bp, bp * 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('BEST ' + best, W - bp, bp * 2);
  }

  /* ---------- THE BIRD, AND THE TWO THINGS THAT MAKE IT ONE § */
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
  /* A STILL DRAWING STOPS HERE — see `flappyStill_`. Nothing below may run for somebody not looking. */
  if (still) return;

  /* ---------- THE FLAP LANDS ON THE FINGER GOING DOWN § */
  canvas.onclick = null;
  canvas.onpointerdown = e => {
    if (e.isPrimary === false) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    flap();
  };
  // space/arrow to flap (only when arcade canvas exists)
  /* ---------- NOT WHILE SOMEBODY IS TYPING § */
  S.keyHandler = e => {
    if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
    const t = e.target;
    if (t && t.closest && (t.isContentEditable || t.closest('input, textarea, select, [contenteditable]'))) return;
    if ($('flappy-canvas')) { e.preventDefault(); flap(); }
  };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}