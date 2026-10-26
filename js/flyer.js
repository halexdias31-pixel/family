/* @family. — js/flyer.js (18 of 18) THE FLYER MAKER, INSIDE THE APP. § */

/* ---------- THE CAMPAIGNS § */
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

/* THE CAMPAIGNS ABOVE ARE NOW A FALLBACK, NOT THE SOURCE. § */

/* The working set: the same eight-column shape as `FLY_ROWS`, so nothing downstream knows or cares where a campaign came from. § */
let FLY_LIVE = null;

/* WHICH WORDING IS CHOSEN, per campaign, by index into the slot's list. Kept beside the rows rather
   than inside them because it is a thing about the screen, not about the campaign. */
const FLY_PICK = {};

/* THE CAMPAIGNS AS THE APP SHOULD SEE THEM. § */
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

/* THE STYLE CLASSES, WRITTEN OUT — same reason as the sizes above. § */
const FLY_STYLES = ['minimal', 'elegant', 'detailed', 'loud'];
const FLY_CLASS = {
  minimal: 'fm-s-minimal', elegant: 'fm-s-elegant',
  detailed: 'fm-s-detailed', loud: 'fm-s-loud',
};
/* HOW MANY FIT ON A SHEET. Written once, so the grid and the count cannot disagree — which would
   print nine stickers into a two-cell grid. */
/* THE CLASS NAME IS WRITTEN OUT rather than built as `'fm-z-' + z`. § */
const FLY_PER = {
  a5: { per: 2, cls: 'fm-z-a5' },
  a6: { per: 4, cls: 'fm-z-a6' },
  sq: { per: 9, cls: 'fm-z-sq' },
};

let FLY_AT = 0;

/* ---------- THE SUM THE SITE ALREADY DOES § */
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

/* IS THIS BLOCK SWITCHED ON? § */
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

/* ---------- ONE FLYER § */
function flyOne(r) {
  const [name, style, ink, accent, ground, head, say] = r;
  /* `head` may be empty if a campaign row exists with no wording at all — a blank <h1> is a gap
     nobody can explain, so an empty headline simply does not draw one. */
  const B = flyBrand();
  const H = head.split('|').map(x => x.trim()).map(esc).join('<br>');
  const qr = flyOn('fm-qr');
  const vsel = $('fm-v');
  /* NO VENUE PICKER MEANS THE MAIN VENUE, NOT A FREE ROOM. § */
  const venues = (DATA.venues || []).filter(v => v.title);
  const main = venues.find(v => norm(v.title) === norm(B.venueMain)) || venues[0] || null;
  const room = vsel ? (Number(vsel.value) || 0) : (main ? Number(main.bestRate) || 15 : 15);
  const venue = vsel && vsel.selectedOptions[0] ? vsel.selectedOptions[0].text
              : (main ? main.title : B.venueMain);
  const ad = ($('fm-ad') || {}).value || 'wait';
  const seat = money(flySeatPrice(room));
  const priv = money(flyInstant(room));

  /* WHAT IS BEING ADVERTISED CHANGES THE OFFER. § */
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

  /* BARE WHEN THE MIDDLE IS EMPTY. § */
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
    ${/* THE NUMBER, BIG, ON THE LOUD ONE — and only when there is one. § */
          ''}
    ${style === 'loud' && B.phone
      ? `<div class="fm-ring"><span>Call</span><b>${esc(B.phone)}</b></div>` : ''}
    ${flyOn('fm-facts')
      ? `<div class="fm-facts">${facts.map(f => `<div>${f}</div>`).join('')}</div>` : ''}
    ${qr ? `<div class="fm-qr"><img alt="" decoding="async" src="${esc(flyQr(B.site))}"
             onerror="this.closest('.fm-fly').classList.add('qr-off')"></div>` : ''}
    ${flyOn('fm-foot')
      ? `<div class="fm-foot"><span>${esc(B.area)}</span><b>${esc(B.site)}</b></div>` : ''}
  </div>`;
}

/* THE QR IS DRAWN BY A PUBLIC SERVICE, and that is a real dependency: § */
const flyQr = url => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data='
  + encodeURIComponent(/^https?:/.test(url) ? url : 'https://' + url);

/* ---------- THE SHEET § */
/* ---------- IT IS A WIDGET NOW, NOT A SHEET § */
/* ---------- THE CONTROLS, WHICH NOW LIVE SOMEWHERE ELSE § */
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
      ${/* ONE LINE PER THING (421, 472): label left, its control right; the three colours are one thing, so one line. */''}
      <label>Style<select id="fm-s">${FLY_STYLES
        .map(s => `<option>${s}</option>`).join('')}</select></label>
      <div class="fm-row fm-inks" title="Ink is what it is set in · Accent marks the one thing to look at · Paper is the ground"><span>Colours</span>
        <input type="color" id="fm-k1" aria-label="Ink" title="Ink"><input type="color" id="fm-k2" aria-label="Accent" title="Accent"><input type="color" id="fm-k3" aria-label="Paper" title="Paper"></div>
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
      ${/* HOW MANY OF IT. One flyer on a mixed sheet, or the sheet filled with the same one to be guillotined — which is what the old tool's "2 up / 4 up / 9 up" was § */
            ''}
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
    `;
}

/* EVERY CONTROL REDRAWS. § */
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

/* CHOOSING A CAMPAIGN SETS EVERY OPTION AND THEN GETS OUT OF THE WAY. § */
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

/* `flyDraw` AND `flyFit` WENT ONCE, when the flyer was a piece of the cheat sheet, and `flyDraw` came back with the flyer's own page. § */

/* ---------- PRESETS, WHICH ONLY TICK BOXES § */
/* ---------- THE WORDING MENU § */
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
  if (!(typeof isAdmin === 'function' && isAdmin())) return;     /* see `initFlyer` */
  const p = FLY_PRESETS[el.getAttribute('data-p')];
  if (!p) return;
  document.querySelectorAll('.fm-adds input[type=checkbox]')
    .forEach(x => { x.checked = p.on.indexOf(x.id) !== -1; });
  if ($('fm-z')) $('fm-z').value = p.z;
  flyDraw();
});

/* THE PRINT HANDLER AND THE RESIZE HOOK ARE GONE TOO. § */

/* THE FLYER MAKER IS ITS OWN TOOL AGAIN. § */
function initFlyer() {
  const wrap = $('fm-wrap');
  if (!wrap) return;
  /* ---------- ADMIN ONLY, AND THE TOOL ITSELF SAYS SO § */
  if (!(typeof isAdmin === 'function' && isAdmin())) { wrap.innerHTML = ''; return; }
  /* ---------- THE CONTROLS ARE THE PART THAT GIVES UP ITS HEIGHT § */
  wrap.innerHTML = '<div class="widget-squeeze">' + flyControls() + '</div>'
    + '<p class="fm-said" id="fm-said"></p>'
    + '<button class="btn" data-do="fm-print">Print</button>';
  flyBind(wrap, flyDraw);          /* binds, loads the campaign, and says what will print */
  /* ---------- AND NOT BEFORE THE VENUES ARE IN § */
  if (typeof awaiting_ === 'function' && awaiting_()) {
    wrap.setAttribute('aria-busy', 'true');
    wrap.insertAdjacentHTML('beforeend', loading_());
  } else if (typeof loaded_ === 'function') loaded_(wrap);
}

/* THE SHEET, FILLED WITH AS MANY AS FIT. § */
function flySheet() {
  const z = ($('fm-z') || {}).value || 'a5';
  const size = FLY_PER[z] || FLY_PER.a5;
  return `<div class="fm-sheet ${size.cls}">`
    + flyOne(flyRows()[FLY_AT] || flyRows()[0]).repeat(size.per) + '</div>';
}

/* ---------- WHAT WILL PRINT, IN WORDS § */
const FLY_SIZE_SAY = { a5: 'A5', a6: 'A6', sq: 'sticker' };
function flyDraw() {
  const said = $('fm-said');
  if (!said) return;
  const z = ($('fm-z') || {}).value || 'a5';
  const size = FLY_PER[z] || FLY_PER.a5;
  const row = flyRows()[FLY_AT] || flyRows()[0] || [];
  const on_ = [...document.querySelectorAll('.fm-adds input[type=checkbox]')]
    .filter(x => x.checked)
    .map(x => (x.parentElement ? x.parentElement.textContent : '').trim().toLowerCase())
    .filter(Boolean);
  said.innerHTML = `Prints <b>${size.per} × ${esc(FLY_SIZE_SAY[z] || z)}</b> to an A4 sheet${
    row[0] ? ' · <b>' + esc(row[0]) + '</b>' : ''}${
    on_.length ? ' · ' + esc(on_.join(', ')) : ' · nothing ticked, so a blank colour'}.`;
}

/* ---------- PRINTING § */
on('fm-print', () => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;     /* see `initFlyer` */
  const paper = document.createElement('div');
  paper.className = 'fm-out';
  paper.innerHTML = flySheet();
  document.body.appendChild(paper);
  document.body.classList.add('printing-fly');
  const done = () => {
    document.body.classList.remove('printing-fly');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER AS WELL AS THE EVENT. Some browsers never fire `afterprint` when the dialogue is
     cancelled, and the app would be left in printing mode with everything hidden — a blank screen
     that looks like a crash. */
  setTimeout(done, 4000);
  window.print();
});
