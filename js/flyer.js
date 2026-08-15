/* ==================================================================================================
   @family. — js/flyer.js   (18 of 18)

   THE FLYER MAKER, INSIDE THE APP. Campaign, style, colours, size and ten switches; the flyer is
   drawn underneath and printed straight from here.

   IT WAS A SEPARATE FILE and that was a reasonable answer to a real problem: a print tool wants a
   fixed 210mm page and this app is phone-first and fluid, and the two fight. Two things made it
   worth solving properly rather than living in a second file — a second file is a second thing to
   deploy and remember, and it had its own copy of the brand and the venue rates, which would drift
   from the sheet the first time a price changed.

   THE THREE PROBLEMS, AND WHAT EACH COSTS:

     COLOUR NAMES.  The flyer sets its own ink, accent and ground. Written as `--ink` they would
     collide with this stylesheet's own `--ink` and repaint half the app. Every one is `--fly-`
     prefixed, and the cost is that the names are uglier.

     PRINTING.  A browser prints the whole document, so printing from inside the app would put the
     column, the tab bar and the sheet chrome on the paper. `@media print` hides everything and
     lifts the sheet out of the flow — see the `.fm-out` rule in the stylesheet.

     WIDTH.  A 210mm page does not fit a phone. It is scaled down to fit the sheet and scaled back
     to 1 for printing, so what you see is the shape of the paper rather than a phone-sized guess.
================================================================================================== */

/* ---------- THE CAMPAIGNS ------------------------------------------------------------------------
   Each carries its own style and colourway, so choosing one loads a whole recipe rather than
   leaving four more things to set. The colours follow the season rather than a palette: the autumn
   ones warm, January cold, the exam ones plain. */
const FLY_ROWS = [
  ['Back to School',   'minimal',  '#16160f', '#c8452f', '#ffffff', 'Back to school,|back to the table.',
   'Sessions start the week schools go back. Maths and English, the same slot every week so it becomes a habit rather than a decision.'],
  ['Results Day',      'minimal',  '#16160f', '#c8452f', '#ffffff', 'Not the grade|you wanted?',
   'Resits open in November and the work starts now. We will look at the paper with you and say plainly whether a resit is worth it.'],
  ['New Year',         'elegant',  '#16233a', '#3f7fa8', '#f4f6f8', 'Six weeks|to the mocks.',
   'January is when it stops being far away. A weekly session between now and February is the difference for most students.'],
  ['Mocks',            'detailed', '#16160f', '#c8452f', '#ffffff', 'Mocks are|the rehearsal.',
   'They are also the first honest mark most students get. We work through the ones that came back, question by question.'],
  ['Before Christmas', 'elegant',  '#1e2a20', '#a8452f', '#f7f4ec', 'A quiet fortnight|is worth a term.',
   'Two weeks with nothing in the diary. An hour a week keeps the thread, and January starts from where December left off.'],
  ['Exam Season',      'detailed', '#16160f', '#2f6f4f', '#ffffff', 'The last|few weeks.',
   'Past papers, marked, and gone through properly. The most useful thing left to do, and the thing students are least likely to do alone.'],
  ['Half Term',        'minimal',  '#1a1a14', '#d08a2c', '#fdfaf2', 'A week off|is a week gained.',
   'Three sessions across the week so nobody comes back behind. Mornings, so the day is still free.'],
  ['Easter Revision',  'detailed', '#241a2c', '#7a5aa8', '#faf7fb', 'Easter is|the last run.',
   'Two weeks, and then it is the real thing. This is where a plan beats effort.'],
  ['Summer Holiday',   'elegant',  '#1c2620', '#3f8f6a', '#f6f8f4', 'Six weeks is a long time|to forget.',
   'Not school in the holidays. An hour or two a week to keep the thread.'],
  ['Better Call Halex','loud',     '#141208', '#c8452f', '#ffd227', 'Better|call Halex.',
   'Maths gone wrong? English gone worse? You have a mock in six weeks and nobody has looked at the paper with you.'],
  ['Open Evening',     'minimal',  '#16160f', '#c8452f', '#ffffff', 'Come and|meet us first.',
   'An evening at the community centre. Meet the tutors, see the rooms, ask what you like.'],
];

/* THE STYLE CLASSES, WRITTEN OUT — same reason as the sizes above. `fm-s-${style}` is a name no
   grep will find, so the four rules that style them look unused and get deleted by somebody tidying
   up. Twice now `check-css` has caught this in one file, which is the checker doing its job and me
   reaching for the shorter thing. */
const FLY_STYLES = ['minimal', 'elegant', 'detailed', 'loud'];
const FLY_CLASS = {
  minimal: 'fm-s-minimal', elegant: 'fm-s-elegant',
  detailed: 'fm-s-detailed', loud: 'fm-s-loud',
};
/* HOW MANY FIT ON A SHEET. Written once, so the grid and the count cannot disagree — which would
   print nine stickers into a two-cell grid. */
/* THE CLASS NAME IS WRITTEN OUT rather than built as `'fm-z-' + z`. `check-css` reports a class it
   cannot find in the source, and it is right to: a name assembled from pieces is a name nobody can
   grep for, and the rule that styles it looks unused and gets deleted. Spelling all three out costs
   two lines and keeps the checker useful. */
const FLY_PER = {
  a5: { per: 2, cls: 'fm-z-a5' },
  a6: { per: 4, cls: 'fm-z-a6' },
  sq: { per: 9, cls: 'fm-z-sq' },
};

let FLY_AT = 0;

/* ---------- THE SUM THE SITE ALREADY DOES --------------------------------------------------------
   A SEAT is the room plus the open tutor rate plus the extra-seat charge for the seats past the
   first, split between the families. Rounded AT THE SEAT, because the seat is what somebody is
   charged and rounding the total first leaves four seats that do not add up to it.

   AN INSTANT CLASS IS A FLOOR AND SAYS "FROM". The real price multiplies by level, day, time and
   subject count, and a flyer cannot ask any of that. Room plus a tutor for the hours is true. */
const FLY_RATES = { openTutor: 14, extraSeat: 3, baseTutor: 22 };
const flyHrs = () => Number(($('fm-h') || {}).value) || 2;
const flySeats = () => Number(($('fm-n') || {}).value) || 4;
const flySeatPrice = room =>
  Math.round((room + FLY_RATES.openTutor + FLY_RATES.extraSeat * (flySeats() - 1))
    / flySeats() * flyHrs() * 100) / 100;
const flyInstant = room => Math.round((room + FLY_RATES.baseTutor) * flyHrs() * 100) / 100;
/* "1 hours" IS WRONG, and an hour and a half reads better written out on something held in a hand. */
const flyHoursSay = () => { const h = flyHrs();
  return h === 1 ? 'An hour' : h === 1.5 ? 'An hour and a half' : h + ' hours'; };

const flyOn = id => { const el = $(id); return !!(el && el.checked); };

/* THE BRAND, FROM THE SHEET. No copy kept here — this is inside the app now, so `DATA.brand` is
   the live thing and the reason the separate file was worth retiring. */
const flyBrand = () => {
  const b = DATA.brand || {};
  return {
    name: b.name || '@family.',
    slogan: b.slogan || 'Somebody to say why.',
    area: b.area || 'Merton & Wandsworth',
    site: b.site || 'halexdias31-pixel.github.io/family/',
    phone: b.phone || '',
    venueMain: b.venue_main || 'Colliers Wood Library',
  };
};

/* ---------- ONE FLYER ---------------------------------------------------------------------------
   Every block is optional, because a sticker is a name and a QR and nothing else, and there should
   be no way to be forced into carrying a paragraph you do not want. */
function flyOne(r) {
  const [name, style, ink, accent, ground, head, say] = r;
  const B = flyBrand();
  const H = head.split('|').map(x => x.trim()).map(esc).join('<br>');
  const qr = flyOn('fm-qr');
  const vsel = $('fm-v');
  const room = Number(vsel && vsel.value) || 0;
  const venue = (vsel && vsel.selectedOptions[0] && vsel.selectedOptions[0].text) || B.venueMain;
  const ad = ($('fm-ad') || {}).value || 'wait';
  const seat = money(flySeatPrice(room));
  const priv = money(flyInstant(room));

  /* WHAT IS BEING ADVERTISED CHANGES THE OFFER. A flyer for a waiting list and one for an instant
     class are different bargains, and one price for both would be a wrong one. "Neither" is a real
     answer — a poster with no offer on it at all. */
  const offer = {
    wait: [`<b>${esc(seat)} a seat</b>, ${flySeats()} to a class`,
           'Nobody pays until every seat is taken'],
    inst: [`<b>From ${esc(priv)}</b> a session, yours from the moment you pay`,
           'Take every seat, or leave some for others to join'],
    both: [`Share a class — <b>${esc(seat)} a seat</b>`,
           `Or have it to yourselves — <b>from ${esc(priv)}</b>`],
    none: ['Maths and English, <b>GCSE and A-Level</b>',
           'First session <b>half price</b> for new families'],
  }[ad] || [];

  const facts = [`${flyHoursSay()} a week, <b>${esc(venue)}</b>`]
    .concat(flyOn('fm-price') ? offer : [`<b>${flySeats()} to a class</b>`])
    .concat(flyOn('fm-phone') && B.phone ? [`Call <b>${esc(B.phone)}</b>`] : []);

  const spec = style === 'elegant' ? '<div class="fm-rule"></div>'
    : style === 'detailed' ? `<div class="fm-spec">
        <div><span>Where</span><b>${esc(venue)}</b></div>
        <div><span>Seats</span><b>${flySeats()} to a class</b></div>
        ${flyOn('fm-price') && ad !== 'none'
          ? `<div><span>${ad === 'inst' ? 'From' : 'A seat'}</span><b>${
              esc(ad === 'inst' ? priv : seat)}</b></div>` : ''}
        <div><span>Each week</span><b>${flyHoursSay()}</b></div>
      </div>` : '';

  /* BARE WHEN THE MIDDLE IS EMPTY. A name and a QR pushed to the top left looks like something that
     failed to load; centred, it looks deliberate. Worked out from what is switched on rather than
     from which preset was pressed, so it stays right after you depart from one. */
  const bare = !flyOn('fm-head') && !flyOn('fm-say') && !flyOn('fm-facts');

  return `<div class="fm-fly ${FLY_CLASS[style] || FLY_CLASS.minimal}${
       qr ? ' has-qr' : ''}${bare ? ' bare' : ''}"
       style="--fly-ink:${esc(ink)};--fly-accent:${esc(accent)};--fly-ground:${esc(ground)}">
    ${flyOn('fm-code') ? `<div class="fm-code">${esc(name.toUpperCase())} · ${esc(B.name)}</div>` : ''}
    ${flyOn('fm-name') ? `<div class="fm-mark">${esc(B.name)}</div>` : ''}
    ${flyOn('fm-head') ? `<h1 class="fm-head">${H}</h1>` : ''}
    ${flyOn('fm-head') && style === 'elegant' ? spec : ''}
    ${flyOn('fm-slogan') ? `<p class="fm-slogan">${esc(
      style === 'loud' ? 'When they say it is too late — it is not.' : B.slogan)}</p>` : ''}
    ${flyOn('fm-say') ? `<p class="fm-say">${esc(say)}</p>` : ''}
    ${flyOn('fm-say') && style === 'detailed' ? spec : ''}
    ${/* THE NUMBER, BIG, ON THE LOUD ONE — and only when there is one. The fallback used to be the
          site address at thirty point, which wrapped across three lines: not a joke about cheap
          adverts, just a bad advert. Put a phone in the brand tab and this appears. */''}
    ${style === 'loud' && B.phone
      ? `<div class="fm-ring"><span>Call</span><b>${esc(B.phone)}</b></div>` : ''}
    ${flyOn('fm-facts')
      ? `<div class="fm-facts">${facts.map(f => `<div>${f}</div>`).join('')}</div>` : ''}
    ${qr ? `<div class="fm-qr"><img alt="" src="${esc(flyQr(B.site))}"
             onerror="this.closest('.fm-fly').classList.add('qr-off')"></div>` : ''}
    ${flyOn('fm-foot')
      ? `<div class="fm-foot"><span>${esc(B.area)}</span><b>${esc(B.site)}</b></div>` : ''}
  </div>`;
}

/* THE QR IS DRAWN BY A PUBLIC SERVICE, and that is a real dependency: no signal, no code. Everything
   else here is type, so a flyer made offline is complete apart from one square — which is why it is
   a switch rather than a fixture, and why a failed image removes itself rather than printing a hole. */
const flyQr = url => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data='
  + encodeURIComponent(/^https?:/.test(url) ? url : 'https://' + url);

/* ---------- THE SHEET ---------------------------------------------------------------------------
   Controls, then the paper. One line of them rather than a table: you are making one flyer at a
   time, and a table of eleven rows is eleven times the interface for one job. */
/* ---------- IT IS A WIDGET NOW, NOT A SHEET -------------------------------------------------------
   IT OPENED IN A SHEET FROM A CARD ON THE YOU SCREEN, which worked and put a making-things tool in
   a column of settings — next to "Edit your details" and "Sign out". Tools is where somebody looks
   for a thing that makes something.

   A WIDGET RENDERS INTO ITS OWN BOX rather than opening over the app, which is what every other
   tool here does and what makes the section coherent. The markup is unchanged; only where it lands
   is different. */
function initFlyer() {
  const wrap = $('fm-wrap');
  if (!wrap) return;
  const B = flyBrand();
  const venues = (DATA.venues || []).filter(v => v.title);
  const opt = (v, sel) => `<option value="${esc(v[1])}"${sel ? ' selected' : ''}>${esc(v[0])}</option>`;
  const list = venues.map(v => [v.title, Number(v.bestRate) || 0]);
  if (!list.length) list.push([B.venueMain, 15]);

  wrap.innerHTML = `
    <div class="fm">
      <div class="fm-bar">
        <label>Campaign<select id="fm-c">${FLY_ROWS
          .map((r, i) => `<option value="${i}">${esc(r[0])}</option>`).join('')}</select></label>
        <label>Style<select id="fm-s">${FLY_STYLES
          .map(s => `<option>${s}</option>`).join('')}</select></label>
        <label>Ink<input type="color" id="fm-k1"></label>
        <label>Accent<input type="color" id="fm-k2"></label>
        <label>Paper<input type="color" id="fm-k3"></label>
      </div>
      <div class="fm-bar">
        <label>Advertising<select id="fm-ad">
          <option value="wait">Waiting list classes</option>
          <option value="inst">Instant classes</option>
          <option value="both">Both</option>
          <option value="none">Neither</option></select></label>
        <label>Venue<select id="fm-v">${list
          .map(v => opt(v, norm(v[0]) === norm(B.venueMain))).join('')}</select></label>
        <label>Hours<select id="fm-h">
          <option>1</option><option>1.5</option><option selected>2</option>
          <option>2.5</option><option>3</option></select></label>
        <label>To a class<select id="fm-n">
          <option>2</option><option>3</option><option selected>4</option>
          <option>5</option><option>6</option></select></label>
        <label>Size<select id="fm-z">
          <option value="a5">A5 · 2 up</option>
          <option value="a6">A6 · 4 up</option>
          <option value="sq">Sticker · 9 up</option></select></label>
      </div>
      <div class="fm-adds">
        ${[['fm-code', 'Header', 1], ['fm-name', 'Name', 1], ['fm-head', 'Headline', 1],
           ['fm-slogan', 'Slogan', 1], ['fm-say', 'Paragraph', 1], ['fm-facts', 'Facts', 1],
           ['fm-price', 'Price', 1], ['fm-phone', 'Phone', 0], ['fm-foot', 'Address', 1],
           ['fm-qr', 'QR', 0]]
          .map(([id, lab, on]) => `<label><input type="checkbox" id="${id}"${
            on ? ' checked' : ''}> ${lab}</label>`).join('')}
        <span class="fm-sep"></span>
        ${['flyer', 'sticker', 'poster'].map(p =>
          `<button class="fm-pre" data-do="fm-preset" data-p="${p}">${p}</button>`).join('')}
      </div>
      <p class="faint" style="margin:.4rem 0 .6rem">Ink is what it is set in · Accent marks the one
        thing to look at · Paper is the ground. Wording comes from the <b>brand</b> tab.</p>
      <button class="btn" data-do="fm-print">Print</button>
      <div class="fm-out" id="fm-out"></div>
    </div>`;

  /* EVERY CONTROL REDRAWS. Collected from the markup rather than listed, so adding a switch is
     adding a checkbox and nothing else — a list kept in two places is a list that drifts. */
  const box = document.querySelector('.fm');
  if (!box) return;
  box.querySelectorAll('select, input').forEach(el => {
    el[el.type === 'color' ? 'oninput' : 'onchange'] = () => {
      if (el.id === 'fm-c') flyLoad();
      if (el.id === 'fm-s') FLY_ROWS[FLY_AT][1] = el.value;
      if (el.id === 'fm-k1') FLY_ROWS[FLY_AT][2] = el.value;
      if (el.id === 'fm-k2') FLY_ROWS[FLY_AT][3] = el.value;
      if (el.id === 'fm-k3') FLY_ROWS[FLY_AT][4] = el.value;
      flyDraw();
    };
  });
  flyLoad();
  flyDraw();
}

/* CHOOSING A CAMPAIGN LOADS ITS WHOLE RECIPE — style and colours too — so it is a starting point
   rather than one more thing to set. Departing from it afterwards is the point of a preset. */
function flyLoad() {
  FLY_AT = Number(($('fm-c') || {}).value) || 0;
  const r = FLY_ROWS[FLY_AT];
  if ($('fm-s')) $('fm-s').value = r[1];
  if ($('fm-k1')) $('fm-k1').value = r[2];
  if ($('fm-k2')) $('fm-k2').value = r[3];
  if ($('fm-k3')) $('fm-k3').value = r[4];
}

function flyDraw() {
  const out = $('fm-out');
  if (!out) return;
  const z = ($('fm-z') || {}).value || 'a5';
  const size = FLY_PER[z] || FLY_PER.a5;
  out.innerHTML = `<div class="fm-sheet ${size.cls}">`
    + flyOne(FLY_ROWS[FLY_AT]).repeat(size.per) + '</div>';
  flyFit();
}

/* ---------- THE PAPER IS SCALED TO FIT THE SCREEN ------------------------------------------------
   A4 IS 210MM AND A PHONE IS NOT. Scaled down to whatever the sheet is wide, so what you see is the
   SHAPE of the page rather than a phone-sized guess at it — and reset to 1 for printing, where the
   paper really is 210mm. Measured rather than assumed, because the sheet width changes with the
   screen and a hard-coded factor would be right on one device. */
function flyFit() {
  const out = $('fm-out'), sheet = out && out.firstElementChild;
  if (!sheet) return;
  const room = out.clientWidth || 320;
  const paper = 210 * 3.7795;                     /* mm to px at 96dpi */
  const k = Math.min(1, room / paper);
  sheet.style.transform = 'scale(' + k.toFixed(4) + ')';
  /* THE SPACE IT LEAVES BEHIND. A scaled element still occupies its full height, so without this
     the sheet sits in a column of empty space taller than the phone. */
  out.style.height = (297 * 3.7795 * k) + 'px';
}

/* ---------- PRESETS, WHICH ONLY TICK BOXES -------------------------------------------------------
   A sticker is not a mode — it is most of the switches off and a smaller size, and you can watch it
   happen. A preset that hid what it did would be a fourth thing to learn and a thing to get stuck
   inside. */
const FLY_PRESETS = {
  flyer:   { z: 'a5', on: ['fm-code','fm-head','fm-slogan','fm-say','fm-facts','fm-price','fm-foot'] },
  sticker: { z: 'sq', on: ['fm-name','fm-qr','fm-foot'] },
  poster:  { z: 'a5', on: ['fm-name','fm-head','fm-slogan','fm-foot'] },
};

on('fm-preset', el => {
  const p = FLY_PRESETS[el.getAttribute('data-p')];
  if (!p) return;
  document.querySelectorAll('.fm-adds input[type=checkbox]')
    .forEach(x => { x.checked = p.on.indexOf(x.id) !== -1; });
  if ($('fm-z')) $('fm-z').value = p.z;
  flyDraw();
});

/* ---------- PRINTING ------------------------------------------------------------------------------
   THE BROWSER PRINTS THE WHOLE DOCUMENT, so without the `@media print` rules in the stylesheet this
   would put the column, the tab bar and the sheet's own chrome on the paper. The class is set here
   rather than left on, so a print started from anywhere else in the app is unaffected. */
on('fm-print', () => {
  const sheet = document.querySelector('.fm-out .fm-sheet');
  if (sheet) sheet.style.transform = 'scale(1)';   /* full size on paper */
  document.body.classList.add('printing-fly');
  const done = () => {
    document.body.classList.remove('printing-fly');
    flyFit();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER AS WELL AS THE EVENT. Some browsers never fire `afterprint` when the dialogue is
     cancelled, and the app would be left in printing mode with everything hidden — a blank screen
     that looks like a crash. */
  setTimeout(done, 4000);
  window.print();
});

window.addEventListener('resize', () => { if ($('fm-out')) flyFit(); });
