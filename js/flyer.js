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
   'Sessions start the week schools go back. Maths and English, the same slot every week so it becomes a habit rather than a decision.',
   'code head slogan say facts price foot'],
  ['Results Day',      'minimal',  '#16160f', '#c8452f', '#ffffff', 'Not the grade|you wanted?',
   'Resits open in November and the work starts now. We will look at the paper with you and say plainly whether a resit is worth it.',
   'code head say facts price foot'],
  ['New Year',         'elegant',  '#16233a', '#3f7fa8', '#f4f6f8', 'Six weeks|to the mocks.',
   'January is when it stops being far away. A weekly session between now and February is the difference for most students.',
   'code head slogan say facts price foot'],
  ['Mocks',            'detailed', '#16160f', '#c8452f', '#ffffff', 'Mocks are|the rehearsal.',
   'They are also the first honest mark most students get. We work through the ones that came back, question by question.',
   'code head say facts price foot'],
  ['Before Christmas', 'elegant',  '#1e2a20', '#a8452f', '#f7f4ec', 'A quiet fortnight|is worth a term.',
   'Two weeks with nothing in the diary. An hour a week keeps the thread, and January starts from where December left off.',
   'code head slogan say facts foot'],
  ['Exam Season',      'detailed', '#16160f', '#2f6f4f', '#ffffff', 'The last|few weeks.',
   'Past papers, marked, and gone through properly. The most useful thing left to do, and the thing students are least likely to do alone.',
   'code head say facts price foot'],
  ['Half Term',        'minimal',  '#1a1a14', '#d08a2c', '#fdfaf2', 'A week off|is a week gained.',
   'Three sessions across the week so nobody comes back behind. Mornings, so the day is still free.',
   'code head slogan say facts price foot'],
  ['Easter Revision',  'detailed', '#241a2c', '#7a5aa8', '#faf7fb', 'Easter is|the last run.',
   'Two weeks, and then it is the real thing. This is where a plan beats effort.',
   'code head say facts price foot'],
  ['Summer Holiday',   'elegant',  '#1c2620', '#3f8f6a', '#f6f8f4', 'Six weeks is a long time|to forget.',
   'Not school in the holidays. An hour or two a week to keep the thread.',
   'code head slogan say facts price foot'],
  ['Better Call Halex','loud',     '#141208', '#c8452f', '#ffd227', 'Better|call Halex.',
   'Maths gone wrong? English gone worse? You have a mock in six weeks and nobody has looked at the paper with you.',
   'name head slogan facts price phone foot'],
  ['Open Evening',     'minimal',  '#16160f', '#c8452f', '#ffffff', 'Come and|meet us first.',
   'An evening at the community centre. Meet the tutors, see the rooms, ask what you like.',
   'code name head say facts foot qr'],
];

/* ==================================================================================================
   THE CAMPAIGNS ABOVE ARE NOW A FALLBACK, NOT THE SOURCE.

   `FLY_ROWS` held every word on every flyer — eleven headlines and eleven paragraphs, in code. So
   changing "Better call Halex." to "Better call Halex today." was a developer job, which is an
   absurd thing to say about a slogan. The words belong in the sheet, next to the campaign they
   belong to, where the person writing them can reach them.

   WHY IT IS STILL HERE. A tab that is empty, a phone that is not signed in as an admin, a load that
   failed — all three end with no campaigns, and a flyer maker with no campaigns is a blank page. So
   the sheet REPLACES these rows when it has something to say and is ignored when it does not. The
   worst case is the flyers you have today.

   ONE ROW PER WORDING IS WHY `copy` IS ITS OWN TAB. A campaign has one accent colour, so that is a
   column on the campaign. It does not have one headline — the whole point is four and a choice —
   and columns cannot hold four of anything without becoming head_1, head_2, head_3, which caps you
   at whatever number somebody guessed on the day.
================================================================================================== */

/* The working set: the same eight-column shape as `FLY_ROWS`, so nothing downstream knows or cares
   where a campaign came from. Built once and then MUTATED IN PLACE by the colour pickers — which is
   why this is a variable holding an array rather than a function returning a fresh one. Rebuilding
   it on every read would throw away a half-picked colour on every keystroke. */
let FLY_LIVE = null;

/* WHICH WORDING IS CHOSEN, per campaign, by index into the slot's list. Kept beside the rows rather
   than inside them because it is a thing about the screen, not about the campaign. */
const FLY_PICK = {};

/* THE CAMPAIGNS AS THE APP SHOULD SEE THEM. Sheet first, code second, and never a mixture: a half
   of each would mean a campaign whose colours came from one place and whose words came from
   another, which is the exact confusion this whole change exists to end. */
function flyRows() {
  if (FLY_LIVE) return FLY_LIVE;
  const from = (DATA.campaigns || []).filter(c => c && c.name);
  if (!from.length) { FLY_LIVE = FLY_ROWS.map(r => r.slice()); return FLY_LIVE; }

  FLY_LIVE = from.map((c, i) => {
    /* A ROW THAT SAYS NOTHING STILL PRINTS. Every design column falls back to the first built-in
       campaign's, so a campaign added with a name and nothing else is a working flyer rather than
       black text on black paper. */
    const d = FLY_ROWS[0];
    const head = flyText(c, 'head') || d[5];
    const say  = flyText(c, 'say')  || d[6];
    return [c.name, c.style || d[1], c.ink || d[2], c.accent || d[3], c.ground || d[4],
            head, say, c.blocks || d[7], c.id];
  });
  return FLY_LIVE;
}

/* The chosen text for one slot, or nothing when the sheet has none. */
function flyText(c, slot) {
  const list = (c && c.copy && c.copy[slot]) || [];
  if (!list.length) return '';
  const at = Math.min(FLY_PICK[(c.id || '') + ':' + slot] || 0, list.length - 1);
  return list[at].text;
}

/* The alternatives for a slot. Read off the RAW campaign, because the working row holds only the
   chosen one and has forgotten the rest. */
function flyVariants(slot) {
  const row = flyRows()[FLY_AT || 0];
  const id = row && row[8];
  const c = (DATA.campaigns || []).find(x => x && x.id === id);
  return (c && c.copy && c.copy[slot]) || [];
}

/* Writes into the working row, so the preview, the print and the menu cannot disagree. */
function flyPick(slot, at) {
  const rows = flyRows(), row = rows[FLY_AT || 0];
  if (!row) return;
  const list = flyVariants(slot);
  if (!list.length) return;
  const i = Math.max(0, Math.min(at, list.length - 1));
  FLY_PICK[(row[8] || '') + ':' + slot] = i;
  row[slot === 'head' ? 5 : 6] = list[i].text;
}

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

/* IS THIS BLOCK SWITCHED ON? `dflt` IS FOR WHEN THE SWITCH IS NOT THERE AT ALL. A flyer is drawn in
   two places now — its own tool, where every checkbox exists, and the paper maker, where a flyer is
   one piece among forty and has no checkboxes of its own. Without a default, `flyOn` read a missing
   control as OFF and a flyer placed on a mixed sheet came out as an empty coloured rectangle: every
   block switched off by a switch that was never on the screen.
   THE DEFAULTS ARE THE FLYER TOOL'S OWN. Whatever a checkbox starts as when you open the flyer
   maker is what a flyer piece draws without being asked, so the two agree without either knowing
   about the other. */
const FLY_DEFAULT = {
  'fm-code': true, 'fm-name': true, 'fm-head': true, 'fm-slogan': true, 'fm-say': true,
  'fm-facts': true, 'fm-price': true, 'fm-phone': false, 'fm-foot': true, 'fm-qr': false,
};
const flyOn = id => {
  const el = $(id);
  return el ? !!el.checked : !!FLY_DEFAULT[id];
};

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
  /* `head` may be empty if a campaign row exists with no wording at all — a blank <h1> is a gap
     nobody can explain, so an empty headline simply does not draw one. */
  const B = flyBrand();
  const H = head.split('|').map(x => x.trim()).map(esc).join('<br>');
  const qr = flyOn('fm-qr');
  const vsel = $('fm-v');
  /* NO VENUE PICKER MEANS THE MAIN VENUE, NOT A FREE ROOM. Drawn inside the paper maker there is no
     `fm-v` on the screen, and reading a missing control as zero priced every seat as though the
     hall cost nothing — a flyer quoting a price that is not the price, printed thirty times. The
     fallback is the same one `initFlyer` uses when the venues tab is empty. */
  const venues = (DATA.venues || []).filter(v => v.title);
  const main = venues.find(v => norm(v.title) === norm(B.venueMain)) || venues[0] || null;
  const room = vsel ? (Number(vsel.value) || 0) : (main ? Number(main.bestRate) || 15 : 15);
  const venue = vsel && vsel.selectedOptions[0] ? vsel.selectedOptions[0].text
              : (main ? main.title : B.venueMain);
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
/* ---------- THE CONTROLS, WHICH NOW LIVE SOMEWHERE ELSE -------------------------------------------
   THIS WAS `initFlyer`, AND IT BUILT A WHOLE SECOND TOOL. The flyer maker had its own page, its own
   sheet, its own print button and these controls; the paper maker has all four of those already and
   places a flyer as one piece among fifty-eight. Two tools that both cut A4 is one tool and a
   duplicate.

   IT HAD TO GO RATHER THAN SIT BESIDE IT. Every control here has an id — `fm-c`, `fm-k1`, `fm-h` —
   and pages are now built five ahead, so the flyer page and the paper maker page are in the
   document AT THE SAME TIME. Two elements with one id is not a style problem: `$('fm-h')` returns
   the first one in the document, so the paper maker would have read the hours off a page nobody
   was looking at. `check-css` sweeps for exactly this.

   WHAT IS LEFT IS THE MARKUP AND THE BINDING, called by whoever is hosting the flyer. */
function flyControls() {
  const B = flyBrand();
  const venues = (DATA.venues || []).filter(v => v.title);
  const list = venues.map(v => [v.title, Number(v.bestRate) || 0]);
  if (!list.length) list.push([B.venueMain, 15]);
  const opt = (v, sel) => `<option value="${esc(v[1])}"${sel ? ' selected' : ''}>${esc(v[0])}</option>`;

  return `
    <div class="fm-bar">
      <label>Campaign<select id="fm-c">${flyRows()
        .map((r, i) => `<option value="${i}"${i === (FLY_AT || 0) ? ' selected' : ''}>${
          esc(r[0])}</option>`).join('')}</select></label>
      ${flyMenu()}
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
        <option value="a5">A5 · half a page</option>
        <option value="a6">A6 · a quarter</option>
        <option value="sq">Sticker</option></select></label>
      ${/* HOW MANY OF IT. One flyer on a mixed sheet, or the sheet filled with the same one to be
            guillotined — which is what the old tool's "2 up / 4 up / 9 up" was, kept as a choice
            rather than as three sizes that each secretly meant a count. */''}
      <label>How many<select id="fm-rep">
        <option value="1">One</option>
        <option value="fill">Fill the sheet</option></select></label>
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
      thing to look at · Paper is the ground. Wording comes from the <b>brand</b> tab.</p>`;
}

/* EVERY CONTROL REDRAWS. Collected from the markup rather than listed, so adding a switch is adding
   a checkbox and nothing else — a list kept in two places is a list that drifts.
   `redraw` IS PASSED IN because the flyer no longer owns the paper it is drawn on. */
function flyBind(scope, redraw) {
  if (!scope) return;
  scope.querySelectorAll('select, input').forEach(el => {
    el[el.type === 'color' ? 'oninput' : 'onchange'] = () => {
      /* THE CAMPAIGN CHANGED, SO THE WORDING MENU IS ABOUT THE WRONG CAMPAIGN. It is rebuilt
         rather than left — a menu offering last campaign's four headlines is worse than no menu,
         because it looks authoritative. */
      if (el.id === 'fm-c') { flyLoad(); flyBind(scope, redraw); }
      if (el.id === 'fm-wh') flyPick('head', Number(el.value) || 0);
      if (el.id === 'fm-wb') flyPick('say', Number(el.value) || 0);
      if (el.id === 'fm-s') flyRows()[FLY_AT][1] = el.value;
      if (el.id === 'fm-k1') flyRows()[FLY_AT][2] = el.value;
      if (el.id === 'fm-k2') flyRows()[FLY_AT][3] = el.value;
      if (el.id === 'fm-k3') flyRows()[FLY_AT][4] = el.value;
      redraw();
    };
  });
  flyLoad();
  redraw();
}

/* CHOOSING A CAMPAIGN SETS EVERY OPTION AND THEN GETS OUT OF THE WAY. It set the style and the
   three colours and stopped there, which meant "Better Call Halex" arrived as the right colours
   round the wrong flyer — a shouting yellow poster still carrying a header code and a paragraph,
   because those were whatever the last campaign had left ticked. A recipe that sets four of eleven
   things is not a recipe.
   THE EIGHTH COLUMN IS THE REST OF IT: which blocks that campaign wants. Applied to the tickboxes
   exactly as the shape presets below do it, so there is one idea here and not two — a campaign is
   a preset that also brings colours.
   IT OVERWRITES WHAT YOU HAD TICKED, and that is the point: pressing a preset is asking for its
   look. Departing from it afterwards is the next thing you do, and nothing here stops you. */
function flyLoad() {
  FLY_AT = Number(($('fm-c') || {}).value) || 0;
  const r = flyRows()[FLY_AT];
  if (!r) return;
  if ($('fm-s')) $('fm-s').value = r[1];
  if ($('fm-k1')) $('fm-k1').value = r[2];
  if ($('fm-k2')) $('fm-k2').value = r[3];
  if ($('fm-k3')) $('fm-k3').value = r[4];
  flyTicks(r[7]);
}

/* THE TICKBOXES, FROM A LIST OF NAMES. Written as `head slogan qr` rather than as `fm-head` and the
   rest, because the eleven campaign rows are read by a person far more often than by this. */
function flyTicks(list) {
  if (!list) return;
  const want = String(list).split(/\s+/).filter(Boolean).map(x => 'fm-' + x);
  Object.keys(FLY_DEFAULT).forEach(id => {
    const el = $(id);
    if (el) el.checked = want.indexOf(id) !== -1;
  });
}

/* `flyDraw` AND `flyFit` ARE GONE. They drew a second A4 sheet and scaled it to the screen — which
   is what `matPaint` and `matFit` do, measured against the same 262mm and shown by the same gauge.
   Keeping both would have been two answers to "how big is the paper", and they would have drifted. */

/* ---------- PRESETS, WHICH ONLY TICK BOXES -------------------------------------------------------
   A sticker is not a mode — it is most of the switches off and a smaller size, and you can watch it
   happen. A preset that hid what it did would be a fourth thing to learn and a thing to get stuck
   inside. */
/* ---------- THE WORDING MENU ----------------------------------------------------------------------
   ONLY WHEN THERE IS A CHOICE. One headline is not a decision, and a dropdown with a single entry
   is a control that teaches you to ignore controls. Two or more and it appears. */
function flyMenu() {
  const one = (slot, id, label) => {
    const list = flyVariants(slot);
    if (list.length < 2) return '';
    const at = Math.min(FLY_PICK[(flyRows()[FLY_AT || 0] || [])[8] + ':' + slot] || 0, list.length - 1);
    return `<label>${label}<select id="${id}">${list.map((w, i) =>
      `<option value="${i}"${i === at ? ' selected' : ''}>${
        esc(w.note || (w.text.split('|')[0].slice(0, 34)))}</option>`).join('')}</select></label>`;
  };
  const bits = one('head', 'fm-wh', 'Wording') + one('say', 'fm-wb', 'Paragraph');
  return bits;
}

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

/* THE PRINT HANDLER AND THE RESIZE HOOK ARE GONE TOO. `mat-print` prints the paper, from a copy
   lifted out of the app column, and `matFit` answers the resize — one path to paper for everything
   this app puts on paper. `printing-fly` and the `.fm-out` rules in the stylesheet went with them.

   WHAT SURVIVES OF THIS FILE is the part that was always the interesting bit: the campaigns, the
   sum that prices a seat, the brand read, and `flyOne` — which draws one flyer and does not care
   what it is drawn onto. */

/* ==================================================================================================
   THE FLYER MAKER IS ITS OWN TOOL AGAIN.

   It was folded into the maths mat on the argument that a flyer is a piece and A5 is half of A4 —
   which is true, and was never the problem. The problem was what the fold COST: the flyer maker
   stopped having a page. Its preview, its print button and its scaling all went, and what was left
   was a strip of controls that could only draw onto somebody else's sheet. To print one flyer you
   opened the maths mat, ticked a flyer onto it, and printed a maths mat that happened to be a
   flyer. Two tools had become one tool wearing the other as a hat.

   SO THE PAGE COMES BACK AND THE RENDERER STAYS SHARED. `flyOne` still draws one flyer and is still
   the only thing that knows how — nothing is duplicated, and that was the half of the merge worth
   keeping. What returns is everything around it: a sheet to see it on, a scale that fits the phone,
   and a print that puts the flyer on the paper instead of the mat.

   `flyControls` IS REUSED RATHER THAN REBUILT. The old version of this file wrote the same two rows
   of controls a second time, in its own markup, which is how two copies of one thing start drifting
   apart. The controls are built once, here and in whatever else asks for them.
================================================================================================== */
function initFlyer() {
  const wrap = $('fm-wrap');
  if (!wrap) return;
  wrap.innerHTML = flyControls()
    + '<div class="fm-out" id="fm-out"></div>'
    + '<button class="btn" data-do="fm-print" style="margin-top:.5rem">Print</button>';
  flyBind(wrap, flyDraw);          /* binds, loads the campaign, and draws once */
  flyWatch();
}

/* THE SHEET, FILLED WITH AS MANY AS FIT. `FLY_PER` knows how many of each size go on a page — two
   A5, four A6, nine stickers — so the paper is one flyer repeated rather than a layout to maintain. */
function flyDraw() {
  const out = $('fm-out');
  if (!out) return;
  const z = ($('fm-z') || {}).value || 'a5';
  const size = FLY_PER[z] || FLY_PER.a5;
  out.innerHTML = `<div class="fm-sheet ${size.cls}">`
    + flyOne(flyRows()[FLY_AT] || flyRows()[0]).repeat(size.per) + '</div>';
  flyFit();
}

/* ---------- THE PAPER IS SCALED TO FIT THE SCREEN ------------------------------------------------
   A4 IS 210MM AND A PHONE IS NOT. Scaled down to whatever the sheet is wide, so what you see is the
   SHAPE of the page rather than a phone-sized guess at it — and reset to 1 for printing, where the
   paper really is 210mm. Measured rather than assumed, because the sheet width changes with the
   screen and a hard-coded factor would be right on exactly one device. */
/* SAME FAULT THE CHEAT SHEET HAD, written into this file when its page came back: `clientWidth ||
   320` scales to a guessed phone width whenever the panel is measured before it is on screen —
   which on a phone is most of the time. It does not guess; the observer calls again. */
function flyFit() {
  const out = $('fm-out'), sheet = out && out.firstElementChild;
  if (!sheet) return;
  const room = out.getBoundingClientRect().width;
  if (!room) return;
  /* MEASURED, NOT ASSUMED — the same call the cheat sheet uses. 3.7795 is what a browser SHOULD
     make of a millimetre and it is what `matPx` returns on every ordinary page; where the two part
     company is under a page zoom or inside a transformed ancestor, and then the hard-coded one is
     silently wrong while the measured one is not. Two functions doing one job by two methods is
     one of them being right by luck. */
  const k = Math.min(1, room / (210 * matPx()));
  sheet.style.transform = 'scale(' + k.toFixed(4) + ')';
  /* THE SPACE IT LEAVES BEHIND. A scaled element still occupies its full height, so without this
     the sheet sits in a column of empty space taller than the phone. */
  out.style.height = (297 * matPx() * k) + 'px';
}

/* ---------- PRINTING ------------------------------------------------------------------------------
   THE BROWSER PRINTS THE WHOLE DOCUMENT, so without the `@media print` rules in the stylesheet this
   would put the column, the tab bar and the tool's own chrome on the paper. The class is set here
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
  setTimeout(done, 1500);
  window.print();
});

/* THE SHEET IS MEASURED, so anything that changes its box has to re-measure it — a rotation, a
   keyboard, and above all the panel becoming visible, which `resize` never reports. */
addEventListener('resize', () => { if ($('fm-out')) flyFit(); });

let FLY_WATCH = null;
function flyWatch() {
  const out = $('fm-out');
  if (!out || FLY_WATCH || typeof ResizeObserver !== 'function') return;
  FLY_WATCH = new ResizeObserver(() => flyFit());
  FLY_WATCH.observe(out);
}
