/* @family. — cards.js ONE FILE, SPLIT. § */


/* The app STARTS at the very bottom of this file, not here. § */

/* THE FIRST SCREEN — Who. § */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE § */
/** One card. The three shapes, each carrying the class that colours its name. */
/* ---------- YOU, AS A CARD § */
/* NO `cardTiles_` CALL HERE. § */
/* ---------- ONE PERSON, ONE CARD § */
function passFor_(name) {
  const n = norm(name);
  if (!n) return null;
  return (DATA.tutors || []).find(t => norm(t.title) === n) || null;
}

/* ---------- ONE ROW FOR ONE PERSON, PASSED IN RATHER THAN LOOKED UP A SECOND TIME § */
function meCard(given) {
  if (!USER) return '';
  /* `USER.profile.photo` FIRST: § */
  const face = String((USER.profile || {}).photo || USER.photo || '');
  /* ---------- CREDITS, E-MAIL AND WHERE MOVED TO THE SETTINGS COLUMN § */

  const mine = given || passFor_(USER.name);
  if (mine) {
    /* ---------- TWO WIDGETS, NOT A CARD INSIDE A CARD § */
    return findCard({ kind: 'tutor', row: mine });
  }

  return `<div class="card is-widget">
    <div class="thing">
      ${/* THROUGH `personFace_` LIKE EVERY FACE. § */
            ''}
      ${personFace_({ pic: face, avatar: USER.avatar || '', handle: USER.handle, name: USER.name, personId: USER.personId },
                    { cls: 'thing-pic', none: 'none', size: 52 })}
      <div class="thing-body">
        <h3>${esc(nameBesideHandle_(USER.name, USER.handle))}</h3>
        <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
        ${USER.handle ? `<p class="prof-handle">@${esc(USER.handle)}</p>` : ''}
      </div>
    </div>
    ${/* THE `Sign out` BUTTON WAS HERE, briefly. § */
          ''}
  </div>`;
}

/* ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER § */
/* EACH WORD ONCE (414): a list typed twice over ("patient, driven, driven") said a trait twice on the card. The first spelling is kept; case is ignored. */
function profList_(v) {
  const seen = new Set();
  return (Array.isArray(v) ? v : String(v == null ? '' : v).split(','))
    .map(x => String(x == null ? '' : x).trim()).filter(Boolean)
    .filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

/* ---------- WHAT A TUTOR TEACHES: THE SUBJECT ONCE, ITS LEVELS RAISED AFTER IT § */
function teachGroups_(list) {
  const out = [], at = {};
  profList_(list).forEach(p => {
    const subject = subjectIn_(p), level = levelIn_(p), k = norm(subject);
    if (!k) return;
    if (!at[k]) out.push(at[k] = { subject, levels: [] });
    if (level && !at[k].levels.some(l => norm(l) === norm(level))) at[k].levels.push(level);
  });
  return out;
}
/* ONE CHIP. The levels are a `<sup>`, and each level is its own no-wrap span, so at 320px a long list breaks BETWEEN levels rather than inside `A-Level` at its § */
const teachChip_ = (g, main) => `<span class="prof-tag${main ? ' is-main' : ''}">${mark(g.subject)}${
  g.levels.length ? `<sup class="prof-lv">&nbsp;${g.levels.map(l => `<span>${mark(l)}</span>`).join(', ')}</sup>` : ''}</span>`;

/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE § */
const profQualV_ = v => String(v == null ? '' : v).trim();
const profQualNow_ = p => /^present$/i.test(profQualV_(p.received));
function profQualSay_(p) {
  const v = k => profQualV_(p[k]);
  return [v('subject'), v('level'), v('grade') && 'grade ' + v('grade'), v('board') && 'at ' + v('board'),
          profQualNow_(p) ? 'studying now' : v('received')].filter(Boolean).join(', ');
}
function profQualChip_(p) {
  const v = k => profQualV_(p[k]);
  const subject = v('subject'), level = norm(v('level')) === norm(subject) ? '' : v('level'), grade = v('grade');
  const say = esc(profQualSay_(p));
  const low = grade ? mark(grade) : profQualNow_(p) ? '<i>studying</i>' : '';
  if (p.kind === 'cert' || !(level || low)) {
    return `<span class="prof-tag" role="img" aria-label="${say}" title="${say}">${
      mark([subject, level, grade].filter(Boolean).join(' '))}</span>`;
  }
  /* THE LAST WORD OF THE SUBJECT IS HELD TO ITS NOTATION, so at 320px a long subject breaks between its own words and never leaves the stack alone at the start of § */
  const said = mark(subject), cut = profLastGap_(said);
  return `<span class="prof-tag prof-q" role="img" aria-label="${say}" title="${say}">${
    cut > 0 ? said.slice(0, cut) + ' ' : ''}<span class="prof-q-end">${said.slice(cut + 1)}<span class="prof-iso">${
    level ? `<sup>${mark(level)}</sup>` : ''}${low ? `<sub>${low}</sub>` : ''}</span></span></span>`;
}
/* THE LAST SPACE IN `mark`'s HTML THAT IS NEITHER INSIDE A TAG NOR INSIDE A COLOURED SPAN, or -1. § */
function profLastGap_(html) {
  let depth = 0, at = -1;
  for (let i = 0; i < html.length; i++) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end < 0) break;
      depth += html[i + 1] === '/' ? -1 : html[end - 1] === '/' ? 0 : 1;
      i = end;
    } else if (html[i] === ' ' && depth <= 0) at = i;
  }
  return at;
}
function profQuals_(t) {
  const parts = Array.isArray(t.qualsParts) ? t.qualsParts.filter(p => p && profQualV_(p.subject)) : [];
  let chips;
  if (parts.length) {
    const at = {}, groups = [];
    parts.forEach(p => {
      const k = norm(profQualV_(p.subject));
      if (!at[k]) groups.push(at[k] = []);
      at[k].push(p);
    });
    chips = [].concat(...groups).map(profQualChip_);
  } else {
    chips = profList_(t.quals).map(v => `<span class="prof-tag">${esc(v)}</span>`);
  }
  return chips.length
    ? `<div class="prof-cap">Qualifications</div><div class="prof-tags prof-teach prof-quals">${chips.join('')}</div>` : '';
}

/* ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents` § */
function profRange_(lo, hi, one, many) {
  const a = Number(lo) || 0, b = Number(hi) || 0;
  if (!a && !b) return '';
  const word = n => n === 1 ? one : many;
  /* `1–4 students` and `1+ hour`, ASKED FOR BY NAME over "1 to 4" and "1 hour or more": § */
  if (a && b && a !== b) return a + '–' + b + ' ' + word(b);
  if (a && b) return a + ' ' + word(a);
  if (a) return a + '+ ' + word(a);
  return 'up to ' + b + ' ' + word(b);
}

/* ---------- "Ages 8–16", AND EVERY WAY A ROW CAN HAVE ONLY HALF OF ONE § */
function profAge_(v) {
  const s = String(v == null ? '' : v).trim();
  if (/^adults?$/i.test(s) || /^18\s*\+$/.test(s)) return Infinity;
  return /^\d{1,3}$/.test(s) ? (Number(s) || null) : null;
}
function profAges_(t) {
  let a = profAge_(t.ageMin), b = profAge_(t.ageMax);
  if (a == null && b == null) return '';
  if (a != null && b != null && a > b) { const x = a; a = b; b = x; }
  if (a === Infinity) return 'Adults';
  if (a == null) return b === Infinity ? 'All ages' : 'Ages up to ' + b;
  if (b == null || b === Infinity) return 'Ages ' + a + '+';
  return a === b ? 'Age ' + a : 'Ages ' + a + '–' + b;
}

/* THE FACT CHIPS, in the order a parent asks: § */
function profFacts_(t) {
  const y = String(t.yrsExp == null ? '' : t.yrsExp).trim();
  const exp = !y || y === '0' ? '' : /^\d+$/.test(y) ? (y === '1' ? '1 year' : y + ' years') : y;
  return [exp ? exp + ' experience' : '',
          profAges_(t),
          profRange_(t.minStudents, t.maxStudents, 'student', 'students'),
          profRange_(t.minHours, t.maxHours, 'hour', 'hours')].filter(Boolean);
}

/* ---------- WHERE THEY TUTOR, AS A HEAT MAP RATHER THAN A LIST OF NAMES § */
const HEAT_W = 300, HEAT_H = 200;
const heatPx_ = (lat, lng, z) => {
  const n = 256 * Math.pow(2, z), r = lat * Math.PI / 180;
  return [(lng + 180) / 360 * n, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n];
};
function profHeat_(names) {
  if (!names || !names.length) return '';
  const byName = {};
  ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).forEach(v => {
    if (v && v.title) byName[norm(v.title)] = v; });
  const pts = names.map(n => byName[norm(n)])
    .filter(v => v && Number(v.lat) && Number(v.lng)).map(v => [Number(v.lat), Number(v.lng), v.borough || '']);
  const online = names.some(n => /^online$/i.test(String(n).trim()));
  const tail = online ? `<div class="prof-tags prof-teach"><span class="prof-tag">Online</span></div>` : '';
  if (!pts.length) return online ? `<div class="prof-cap">Tutors at</div>${tail}` : '';
  let z = 12;
  for (; z > 9; z--) {
    const px = pts.map(p => heatPx_(p[0], p[1], z));
    const xs = px.map(p => p[0]), ys = px.map(p => p[1]);
    if (Math.max(...xs) - Math.min(...xs) <= HEAT_W * .6 && Math.max(...ys) - Math.min(...ys) <= HEAT_H * .6) break;
  }
  const px = pts.map(p => heatPx_(p[0], p[1], z));
  const cx = (Math.min(...px.map(p => p[0])) + Math.max(...px.map(p => p[0]))) / 2;
  const cy = (Math.min(...px.map(p => p[1])) + Math.max(...px.map(p => p[1]))) / 2;
  /* BACKGROUND LAYERS, NOT ELEMENTS. § */
  /* `50%` IN A BACKGROUND POSITION IS NOT THE BOX'S MIDDLE. § */
  const pos = (x, y, w, h) => `calc(50% + ${Math.round(x - cx + w / 2)}px) calc(50% + ${Math.round(y - cy + h / 2)}px)`;
  const layers = [], tiles = [];
  /* A SOFT, WIDE GLOW PER VENUE, TRANSLUCENT, so the streets read through it and venues close
     together add up into a brighter patch rather than each being a hard white ball. */
  const G = 80;
  px.forEach(p => layers.push({ img: 'radial-gradient(circle closest-side, rgba(255,255,255,.55) 0, rgba(255,255,255,.25) 45%, rgba(255,255,255,0) 100%)',
    pos: pos(p[0] - G / 2, p[1] - G / 2, G, G), size: G + 'px ' + G + 'px' }));
  const t0x = Math.floor((cx - 220) / 256), t1x = Math.floor((cx + 220) / 256);
  const t0y = Math.floor((cy - 130) / 256), t1y = Math.floor((cy + 130) / 256);
  for (let tx = t0x; tx <= t1x; tx++) for (let ty = t0y; ty <= t1y; ty++) {
    /* OPENSTREETMAP'S OWN TILES, WHICH NEED NO KEY. § */
    tiles.push({ img: `url("https://tile.openstreetmap.org/${z}/${tx}/${ty}.png")`,
      pos: pos(tx * 256, ty * 256, 256, 256), size: '256px 256px' });
  }
  const bg = list => `background-image:${list.map(l => l.img).join(',')};`
    + `background-position:${list.map(l => l.pos).join(',')};`
    + `background-size:${list.map(l => l.size).join(',')};background-repeat:no-repeat`;
  const areas = [...new Set(pts.map(p => p[2]).filter(Boolean))];
  return `<div class="prof-cap">Tutors at</div>
    <div class="prof-heat" role="img" data-dots="${px.length}"
      aria-label="${esc('A map of where they tutor' + (areas.length ? ': around ' + areas.join(', ') : ''))}">
      <span class="heat-tiles" style="${esc(bg(tiles))}"></span>
      <span class="heat-glow" style="${esc(bg(layers))}"></span>
      <span class="heat-credit">© OpenStreetMap contributors</span>
    </div>${tail}`;
}

/* ---------- WHEN THEY TEACH, AS THE RECEIPT'S WEEK § */
function profAvail_(t) {
  if (!t || typeof weekGrid_ !== 'function' || typeof availSet_ !== 'function') return '';
  /* ---------- NO `avail` KEY AT ALL IS NOT A TUTOR § */
  if (t.avail === undefined) return '';
  const on = availSet_(t.avail);
  const ticked = Object.keys(on);
  /* ---------- NO HOURS IS SAID, NOT LEFT BLANK § */
  if (!ticked.length) {
    return `<div class="prof-cap">Available</div>
      <p class="prof-say prof-hid prof-nohours">Hasn\u2019t set usual hours yet \u2014 ask for any hour;
        they accept or decline.${typeof isAdmin === 'function' && isAdmin()
          ? ' They tick them in Settings, under their week.' : ''}</p>`;
  }
  /* `busy` IS `{ m16: 'Ada' }` OFF `busyHours`, but the fixture once said `[]` and an older backend
     may say nothing; a list of codes is read as well, so no shape of it throws. */
  const busy = {};
  const b = t.busy;
  if (Array.isArray(b)) b.forEach(c => { busy[norm(c)] = true; });
  else if (b && typeof b === 'object') Object.keys(b).forEach(c => { if (b[c]) busy[norm(c)] = b[c]; });
  /* THE BOOKING'S SPAN AND NOTHING WIDER. § */
  const hours = (typeof SLOT_HOURS !== 'undefined' && SLOT_HOURS.length) ? SLOT_HOURS : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const SD = (typeof SLOT_DAYS !== 'undefined' && SLOT_DAYS) || [];
  const days = SD.map(([p, label]) => {
    const cells = hours.map(h => {
      const code = p + String(h).padStart(2, '0');
      return { h, code, lit: !!on[code] && !busy[code], busy: !!on[code] && !!busy[code] };
    });
    return { label, hours: cells };
  }).filter(d => d.hours.some(c => c.lit || c.busy));
  /* ---------- TICKED, BUT NOT AT AN HOUR THAT CAN BE BOOKED § */
  if (!days.length) {
    return `<div class="prof-cap">Available</div>
      <p class="prof-say prof-hid prof-nofree">No free hours this week.${typeof isAdmin === 'function' && isAdmin()
          ? ' Every hour they have ticked is outside ' + hours[0] + ':00–' + hours[hours.length - 1]
            + ':00, the hours a session can be booked at.' : ''}</p>`;
  }
  /* ---------- SPANS, NOT THE RECEIPT'S DISABLED BUTTONS § */
  const hoursOn = which => days.map(d => {
    const hs = d.hours.filter(which).map(c => c.h + ':00');
    return hs.length ? d.label + ' ' + hs.join(', ') : '';
  }).filter(Boolean).join('; ');
  const said = hoursOn(c => c.lit);
  /* THE TAUGHT HOURS, SAID AFTER THE FREE ONES — see the note over this function. A day drawn only
     for a taught hour was silent to a screen reader while it took a row on screen. */
  const taught = hoursOn(c => c.busy);
  /* LINES, NOT A GRID (467) — the owner: "The tutor profile should fit on a normal phone even with lots of data." Hours in a row merge. */
  const line = which => days.map(d => {
    const hs = d.hours.filter(which).map(c => c.h), spans = [];
    hs.forEach(h => { const l = spans[spans.length - 1]; if (l && l[1] === h) l[1] = h + 1; else spans.push([h, h + 1]); });
    return spans.length ? `<span class="prof-day">${esc(d.label.slice(0, 3))} ${esc(spans.map(profSpan_).join(', '))}</span>` : '';
  }).filter(Boolean).join('<span class="prof-sep">, </span>');
  const free = line(c => c.lit), busyLine = line(c => c.busy);
  return `<div class="prof-cap">Available</div>
    <div class="prof-week prof-hours" data-avail="${ticked.length}"
      aria-label="${esc((said ? 'Available ' + said : 'No free hours this week')
        + (taught ? '. Already teaching ' + taught : ''))}">${free ? `<p class="prof-hour-line">${free}</p>` : ''}${busyLine
        ? `<p class="prof-key faint">Already teaching ${busyLine}</p>` : ''}</div>`;
}
/* AN HOUR SPAN AS A PERSON SAYS IT: 4–7pm, 10am–1pm, 12–1pm. */
const profHr_ = h => (h % 12 || 12) + '';
const profAm_ = h => (h % 24 < 12 ? 'am' : 'pm');
const profSpan_ = ([a, b]) => profHr_(a) + (profAm_(a) === profAm_(b) ? '' : profAm_(a)) + '–' + profHr_(b) + profAm_(b);

/* WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS *"a smaller rate to the side so clients can know extra cost for the extra seat"*. § */
function profSeat_(t) {
  if (!(Number(t.rate) > 0) || typeof seatShare_ !== 'function') return 0;
  const s = seatShare_(t);
  return Math.round(Number(t.rate) * (s.cUsed + s.bUsed) * 100) / 100;
}

function findCard(x) {
  const t = x.row;
  /* ---------- A PERSON IS A WIDGET, AND THE LANYARD HAS GONE § */
  if (x.kind === 'tutor') return `
    <div class="card is-widget is-prof${t.listed === false ? ' is-off' : ''}">
      ${/* ---------- A TITLE SITS BESIDE THE ROLE, IN THE ROLE'S OWN LABEL § */
             ''}
      <h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))}${
        t.listed === false ? ` <span class="prof-off">· ${t.pending ? 'asked to tutor' : 'not listed'}</span>` : ''}</h3>
      ${/* ---------- AND WHAT `· not listed` MEANS, SAID ONCE, WHERE THE MARK IS § */
            ''}
      ${/* A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, and this is where it is answered — the same switch, so the sentence says what pressing it MEANS for somebody who § */
            ''}
      ${t.listed === false && isAdmin()
        ? (t.pending
          ? `<p class="prof-say prof-hid">They ticked Tutor in their settings. Until you list them
               they are not on the site, cannot be booked and cannot take a session — the crossed-out
               eye below approves them.</p>`
          : `<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts
             them back on the site.</p>`) : ''}
      <div class="prof-top">
        ${/* THE FACE IS `personFace_` (links.js), THE ONE FUNCTION EVERY FACE GOES THROUGH: § */
              ''}
        ${personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title, personId: t.personId },
                      { cls: 'prof-pic', none: 'prof-none', size: 52 })}
        <div class="prof-who">
          <span class="prof-name">${esc(t.title)}</span>
          ${/* ---------- AND THE HANDLE, WITH THE `@` THAT IS NOT IN THE CELL § */
                ''}
          ${t.handle ? `<span class="prof-handle">@${esc(t.handle)}</span>` : ''}
          ${/* HOW MANY QUESTIONS AND HOW RECENTLY — set only on a learner in an admin's people column,
                by `subsLine_` in find.js, off the summary of the sheet's `submissions` tab. Absent
                everywhere else. */''}
          ${t.activity ? `<span class="prof-act">${esc(t.activity)}</span>` : ''}
          ${/* ---------- THE RATE, UP HERE AND BIGGER § */
                ''}
          ${t.rate && !childView_() ? `<span class="prof-price"><span class="prof-rate">${esc(money(t.rate))}<small>/h</small></span>${
              profSeat_(t) ? `<span class="prof-seat">+${esc(money(profSeat_(t)))}/h a seat</span>` : ''}</span>` : ''}
          ${/* ---------- NO CITY AND NO DBS STAMP UP HERE § */
                ''}
        </div>
      </div>
      ${/* WHAT THEY WROTE ABOUT THEMSELVES. `doget.gs` already wraps it in quotation marks, so it
            is printed as said rather than as a field with a label — which is the difference between
            a profile and a form. */''}
      ${t.description ? `<p class="prof-say">${esc(t.description)}</p>` : ''}
      ${/* ---------- THEIR OTHER PHOTOGRAPHS, AS SMALL SQUARES § */
            ''}
      ${Array.isArray(t.photos) && t.photos.length
        ? `<div class="prof-photos">${t.photos.slice(0, 8).map(u =>
             `<span class="prof-shot"><img src="${esc(pic(u))}" alt="" loading="lazy" decoding="async"></span>`).join('')}</div>`
        : ''}
      ${/* THE THREE ADJECTIVES OFF THE SHEET, AS BOLD WORDS AND NOT CHIPS. § */
            ''}
      ${profList_(t.tags).length
        ? `<p class="prof-words">${profList_(t.tags).slice(0, 3)
             .map(v => `<b>${esc(v)}</b>`).join('<i aria-hidden="true">·</i>')}</p>` : ''}
      ${/* ---------- EXPERIENCE, GROUP SIZE AND SESSION LENGTH, AS CHIPS § */
            ''}
      ${profFacts_(t).length
        ? `<div class="prof-cap">At a glance</div><div class="prof-tags prof-teach prof-facts">${profFacts_(t)
             .map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''}
      ${/* ---------- THE ROWS, AND EVERY ONE OF THEM IS DROPPED WHEN IT IS EMPTY § */
            ''}
      ${/* ---------- WHAT THEY TEACH, AS THE SAME CHIPS THE ADJECTIVES ARE § */
            ''}
      ${/* ---------- FIVE CAPTIONS, IN THIS ORDER, AND NO OTHERS § */
            ''}
      ${/* SEVERAL TEACHES. *"when i tick teach for different levels of same subject it unticks the other one. i dont want that"* — so `teachesSpec` is a list, every one § */
            ''}
      ${/* ONE CHIP A SUBJECT, ITS LEVELS RAISED — `teachGroups_`. § */
            ''}
      ${(() => {
        const main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
        return (main.length ? `<div class="prof-cap">Teaches</div><div class="prof-tags prof-teach">${
                  teachGroups_(main).map(g => teachChip_(g, true)).join('')}</div>` : '')
             + (also.length ? `<div class="prof-cap">Can also teach</div><div class="prof-tags prof-teach">${
                  teachGroups_(also).map(g => teachChip_(g, false)).join('')}</div>` : '');
      })()}
      ${/* ---------- QUALIFICATIONS, AS THE SAME CHIPS § */
            ''}
      ${profQuals_(t)}
      ${/* WHERE THEY WILL TEACH, off the venues tab's own `tutors_happy_here` column, which a tutor
            ticks on their Contact & address page. An older backend sends no key: nothing drawn. */''}
      ${profHeat_(profList_(t.venues))}
      ${profAvail_(t)}
    </div>`;

  /* ---------- A VENUE IS AN ORDINARY CARD § */
  if (x.kind === 'venue') {
    /* A CHILD IS TOLD THE SEATS AND NOT THE PRICE (398), and a room with neither says nothing. */
    const kid = childView_();
    const say = (max, rate) => [max ? 'up to ' + max : '', kid ? '' : rate ? money(rate) + '/h' : 'free']
      .filter(Boolean).join(' · ');
    const roomRow = (label, max, rate) => say(max, rate) ? row(label, say(max, rate)) : '';
    return `
    <div class="card">
      <h3>${esc(t.title)}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${(t.rooms || []).length
        ? (t.rooms || []).slice(0, 4).map(r => roomRow(r.name || 'Room', r.max, r.rate)).join('')
        : roomRow('The room', t.maxCapacity, t.bestRate)}
      ${row('Notice', t.minNoticeDays ? t.minNoticeDays + ' days' : 'Book any time')}
    </div>`;
  }

  /* ---------- A LEVEL IS THE OTHER HALF OF A SUBJECT CARD § */
  if (x.kind === 'level') return `
    <div class="card is-level">
      <h3>${esc(t.name)}</h3>
      ${t.priced
        ? row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
              t.mult === 1 ? '—'
            : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')
        : row('Surcharge', 'Not priced yet', 'bad')}
      ${/* THE SUBJECTS THAT RUN AT IT — green, because a subject is green wherever it appears, and
            this is the fact somebody who has chosen a level is actually asking for. */''}
      ${t.subjects && t.subjects.length
        ? rowHtml('Subjects', t.subjects.map(s => `<span class="subject">${esc(s)}</span>`).join(', '))
        : row('Subjects', 'None yet', 'bad')}
      ${row('Tutors', t.tutors && t.tutors.length ? String(t.tutors.length) : 'None yet',
            t.tutors && t.tutors.length ? '' : 'bad')}
      ${t.listed ? '' : row('Booking form', 'Not offered', 'bad')}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches at this level yet</p>'}
    </div>`;

  return `
    <div class="card is-subject">
      <h3>${esc(t.name)}</h3>
      ${row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
            t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')}
      ${/* THE LEVELS, which only the sheet had. One line, and it is the fact that decides whether
            this subject is the one somebody wants at all. */''}
      ${t.levels && t.levels.filter(Boolean).length
        ? row('Levels', t.levels.filter(Boolean).join(', ')) : ''}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;
}

/* Tapping one opens a sheet rather than expanding the card. § */
/* ---------- `on('who')` WAS HERE § */

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  /* ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX § */
  const on = !el.classList.contains('on');

  /* SAID BEFORE IT IS TRUE. It almost always becomes true, and the round trip is the only part
     anybody would notice. */
  tileSet_(el, { label: on ? 'Listed' : 'Not listed', on,
                 note: on ? 'clients can see them' : 'clients cannot see them' });

  api({ action: 'setListed',
    adminName: USER.name, name: USER.name,
    who: el.dataset.who, whoId: el.dataset.pid || '', on })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      toast(on ? 'Listed' : 'Hidden from clients');
      /* `load()` WAS HERE — the whole payload fetched again to change one word. § */
      /* BY ID WHERE THERE IS ONE, for the reason the handler on the other end now records: a
         display name is derived from up to two cells and matching it is the fallback, not the
         route. */
      const id = el.dataset.pid || '';
      const t = (DATA.tutors || []).find(x => (id && String(x.personId) === id)
                                           || norm(x.title) === norm(el.dataset.who));
      /* AND NO LONGER PENDING: `setListed` writes TRUE or FALSE over the `PENDING` word either way. */
      if (t) { t.listed = on; t.pending = false; }
    })
    .catch(err => {
      /* PUT IT BACK. A switch that has not actually flipped must not keep saying it has — this is
         the one case where showing it early has a cost, and it is paid here. */
      tileSet_(el, { label: !on ? 'Listed' : 'Not listed', on: !on,
                     note: !on ? 'clients can see them' : 'clients cannot see them' });
      toast(String((err && err.message) || 'Could not reach the server.'));
    });
});

/* THE OTHER HALF OF THE CLICK HANDLER. § */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && el.type !== 'checkbox') return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + String((err && err.message) || err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */
/* ---------- `on('subject')` WAS HERE § */

/* ---------- BOOKING FROM A CARD § */
on('book-with', () => {
  closeSheet();
  STUFF.filters = [{ field: 'forLabel', value: 'Booking' }];
  go('stuff');
  paintStuff();
});

/* `on('prof-shot')` WAS HERE — a tutor's extra photograph opened across its row on a tap. Taken out
   on request (10 Oct, `findCard`): the squares are pictures, not controls. */
