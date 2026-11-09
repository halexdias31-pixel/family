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
/* A LONG LIST SHORTENED TO "+N" (8 Nov): the whole tutor card fits one phone screen; the rest are named in the pill's title. */
const PROF_MORE_ = (chips, n, names) => chips.length > n
  ? chips.slice(0, n).concat(`<span class="prof-tag prof-more" title="${esc((names || []).slice(n).join(', '))}">+${chips.length - n}</span>`) : chips;
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
  chips = PROF_MORE_(chips, 2, parts.length ? parts.map(p => profQualV_(p.subject)) : profList_(t.quals));
  return chips.length
    ? `<div class="prof-cap">Qualifications</div><div class="qtags prof-tags prof-teach prof-quals">${chips.join('')}</div>` : '';
}

/* ---------- JOBS, CURRENT AND PAST (8 Nov): one pill a job — "Role · Where · 2019–now" — in the jobs colour. */
const profJobSay_ = j => [j.role, j.where, [j.from, j.to].filter(Boolean).join('–')].map(v => String(v || '').trim()).filter(Boolean).join(' · ');
function profJobs_(t) {
  const says = (Array.isArray(t.jobs) ? t.jobs : []).map(profJobSay_).filter(Boolean);
  const chips = PROF_MORE_(says.map(v => `<span class="prof-tag">${esc(v)}</span>`), 1, says);
  return chips.length ? `<div class="prof-cap">Jobs</div><div class="qtags prof-tags prof-teach prof-jobs">${chips.join('')}</div>` : '';
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
  /* EVERY PLACE BY NAME TOO, so the card still says where when the map cannot load. */
  const tail = `<div class="qtags prof-tags prof-teach prof-places">${PROF_MORE_(names.map(n => `<span class="prof-tag">${esc(n)}</span>`), 3, names).join('')}</div>`;
  if (!pts.length) return `<div class="prof-cap">Tutors at</div>${tail}`;
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
          ? ' Every hour they have ticked is outside ' + hours_(hours[0], hours[hours.length - 1])
            + ', the hours a session can be booked at.' : ''}</p>`;
  }
  /* ---------- SPANS, NOT THE RECEIPT'S DISABLED BUTTONS § */
  const hoursOn = which => days.map(d => {
    const hs = d.hours.filter(which).map(c => hours_(c.h, c.h + 1));
    return hs.length ? day_(d.label) + ' ' + hs.join(', ') : '';
  }).filter(Boolean).join('; ');
  const said = hoursOn(c => c.lit);
  /* THE TAUGHT HOURS, SAID AFTER THE FREE ONES — see the note over this function. A day drawn only
     for a taught hour was silent to a screen reader while it took a row on screen. */
  const taught = hoursOn(c => c.busy);
  /* LINES, NOT A GRID (467) — the owner: "The tutor profile should fit on a normal phone even with lots of data." Hours in a row merge. */
  const line = which => days.map(d => {
    const hs = d.hours.filter(which).map(c => c.h), spans = [];
    hs.forEach(h => { const l = spans[spans.length - 1]; if (l && l[1] === h) l[1] = h + 1; else spans.push([h, h + 1]); });
    /* ONE SPAN A DAY AND "+N": a choppy week stays one pill a day; the aria-label above says every hour. */
    const say = !spans.length ? '' : profSpan_(spans[0]) + (spans.length > 1 ? ' +' + (spans.length - 1) : '');
    return spans.length ? `<span class="prof-day">${esc(day_(d.label))} ${esc(say)}</span>` : '';
  }).filter(Boolean).join('<span class="prof-sep"> </span>');
  const free = line(c => c.lit), busyLine = line(c => c.busy);
  return `<div class="prof-cap">Available</div>
    <div class="prof-week prof-hours" data-avail="${ticked.length}"
      aria-label="${esc((said ? 'Available ' + said : 'No free hours this week')
        + (taught ? '. Already teaching ' + taught : ''))}">${free ? `<p class="prof-hour-line">${free}</p>` : ''}${busyLine
        ? `<p class="prof-key prof-busy">Already teaching ${busyLine}</p>` : ''}</div>`;
}
/* AN HOUR SPAN, 24-hour (owner, 8 Nov): 16:00–19:00. */
const profSpan_ = ([a, b]) => hours_(a, b);

/* WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS *"a smaller rate to the side so clients can know extra cost for the extra seat"*. § */
function profSeat_(t) {
  if (!(Number(t.rate) > 0) || typeof seatShare_ !== 'function') return 0;
  const s = seatShare_(t);
  return Math.round(Number(t.rate) * (s.cUsed + s.bUsed) * 100) / 100;
}

/* A TUTOR'S RATE AS SHOWN: £first-seat–£full-class/hour, or one rate when they take one seat (549). Display only; priceFrom charges. */
function rateRange_(t) {
  const r = Number(t && t.rate);
  if (!(r > 0)) return '';
  const say = money_;
  const max = Math.round(Number(t.maxStudents)) || 1, seat = profSeat_(t);
  return max > 1 && seat > 0 ? say(r) + '–' + say(r + seat * (max - 1)).slice(1) + '/hour' : say(r) + '/hour';
}

/* ONE CARD FOR EVERY KIND (owner, 8 Nov): picture, title, tags, lines, then its tile row (`cardTiles_`).
   card-fields.json picks each part's fields; check-card-shape holds the shape. */
const KC_PARTS = ['pic', 'head', 'tags', 'lines'];
/* WHO A CARD IS DRAWN FOR: undefined is whoever is signed in; a share sets 'public' while it draws (tutorPng_). */
let CARD_VIEWER;
/* BEFORE THE SETTINGS FILE ARRIVES, OR FOR A KIND IT DOES NOT NAME: its kind's picture, its name, its facet tags. */
const KC_BARE = { cls: '', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] };
const kcRow_ = x => (x && x.row) || {};
const kcPct_ = m => (m === 1 ? dash_() : (m > 1 ? '+' : '−') + Math.abs(Math.round((m - 1) * 100)) + '%');
/* EACH FIELD A CARD CAN SHOW, BY NAME: the settings file picks, and a field with nothing to say says ''. */
const KC_FIELDS = {
  kindPic: x => libPic_(x.kind, x.name),
  name: x => `<h3>${esc(x.name || '')}</h3>`,
  /* THE TUTOR'S COMPACT ONE-SCREEN CARD (547) as fields: face, role, the name line with the rate, then pills and lines. */
  face: x => { const t = kcRow_(x); return personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title, personId: t.personId },
    { cls: 'prof-pic', none: 'prof-none', size: 44 }); },
  role: x => { const t = kcRow_(x); return `<h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))}${
    t.listed === false ? ` <span class="prof-off">· ${t.pending ? 'asked to tutor' : 'not listed'}</span>` : ''}</h3>`; },
  nameRate: x => { const t = kcRow_(x); return `<div class="prof-who">
    <span class="prof-line"><span class="prof-name">${esc(displayName_(t, CARD_VIEWER))}</span>${t.rate && !childView_()
      ? `<span class="prof-price"><span class="prof-rate">${esc(rateRange_(t).replace(/\/hour$/, ''))}<small>/hour</small></span></span>` : ''}</span>
    ${t.handle ? `<span class="prof-handle">@${esc(t.handle)}</span>` : ''}
    ${t.activity ? `<span class="prof-act">${esc(t.activity)}</span>` : ''}</div>`; },
  /* A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, answered by the eye tile; the line says what pressing it means. */
  listedNote: x => { const t = kcRow_(x); if (!(t.listed === false && isAdmin())) return '';
    return t.pending ? `<p class="prof-say prof-hid">They ticked Tutor in their settings. Until you list them they are not on the site,
      cannot be booked and cannot take a session — the crossed-out eye below approves them.</p>`
      : '<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts them back on the site.</p>'; },
  /* SUBJECT PILLS: one chip a subject, its levels raised (`teachGroups_`). */
  teaches: x => { const t = kcRow_(x), main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
    return (main.length ? `<div class="prof-cap">Teaches</div><div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(main).map(g => teachChip_(g, true)), 3).join('')}</div>` : '')
      + (also.length ? `<div class="prof-cap">Can also teach</div><div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(also).map(g => teachChip_(g, false)), 2).join('')}</div>` : ''); },
  facts: x => { const f = profFacts_(kcRow_(x));
    return f.length ? `<div class="qtags prof-tags prof-teach prof-facts">${f.map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''; },
  /* WHAT THEY WROTE: `doget.gs` already quotes it, so it is printed as said. */
  say: x => (kcRow_(x).description ? `<p class="prof-say cut2" data-do="cut-open">${esc(kcRow_(x).description)}</p>` : ''),
  photos: x => { const p = kcRow_(x).photos; return Array.isArray(p) && p.length ? `<div class="prof-photos">${PROF_MORE_(p.map(u =>
    `<span class="prof-shot"><img src="${esc(pic(u))}" alt="" loading="lazy" decoding="async"></span>`), 4).join('')}</div>` : ''; },
  words: x => { const w = profList_(kcRow_(x).tags).slice(0, 3);
    return w.length ? `<p class="prof-words">${w.map(v => `<b>${esc(v)}</b>`).join('<i aria-hidden="true">·</i>')}</p>` : ''; },
  quals: x => profQuals_(kcRow_(x)),
  jobs: x => profJobs_(kcRow_(x)),
  /* THE MAP: the venues tab's `tutors_happy_here`; an older backend sends no key and nothing is drawn. */
  places: x => profHeat_(profList_(kcRow_(x).venues)),
  /* DAY PILLS. */
  avail: x => profAvail_(kcRow_(x)),
  venueSub: x => (kcRow_(x).subtitle ? `<p class="sub">${mark(kcRow_(x).subtitle)}</p>` : ''),
  /* A CHILD IS TOLD THE SEATS AND NOT THE PRICE (398), and a room with neither says nothing. */
  rooms: x => { const t = kcRow_(x), kid = childView_();
    const say = (max, rate) => [max ? 'up to ' + max : '', kid ? '' : rate ? money_(rate) + '/h' : 'free'].filter(Boolean).join(' · ');
    const one = (label, max, rate) => (say(max, rate) ? row(label, say(max, rate)) : '');
    return (t.rooms || []).length ? t.rooms.slice(0, 4).map(r => one(r.name || 'Room', r.max, r.rate)).join('') : one('The room', t.maxCapacity, t.bestRate); },
  surcharge: x => { const t = kcRow_(x); if (x.kind === 'level' && !t.priced) return row('Surcharge', 'Not priced yet', 'bad');
    return row(t.mult === 1 ? 'No surcharge' : 'Surcharge', kcPct_(t.mult)); },
  /* THE SUBJECTS THAT RUN AT A LEVEL, green as a subject is everywhere. */
  levelSubjects: x => { const s = kcRow_(x).subjects || [];
    return s.length ? rowHtml('Subjects', s.map(v => `<span class="subject">${esc(v)}</span>`).join(', ')) : row('Subjects', 'None yet', 'bad'); },
  tutorCount: x => { const n = (kcRow_(x).tutors || []).length; return row('Tutors', n ? String(n) : 'None yet', n ? '' : 'bad'); },
  bookingForm: x => (kcRow_(x).listed ? '' : row('Booking form', 'Not offered', 'bad')),
  levels: x => { const l = (kcRow_(x).levels || []).filter(Boolean); return l.length ? row('Levels', l.join(', ')) : ''; },
  tutorNames: x => { const t = kcRow_(x).tutors || []; return t.length ? `<div class="qtags">${t.map(y => `<span class="qtag" data-tag="3">${esc(y.title)}</span>`).join('')}</div>`
    : x.kind === 'subject' ? row('Tutors', 'None yet', 'bad') : ''; },
  /* A KIND WHOSE OWN FILE WRITES ITS INSIDES (`KC_OWN`) hands them over cut into the four parts (`kcSplit_`); no tag line of its own gets its facets. */
  ownPic: x => (x.kcOwn || {}).pic || '',
  ownHead: x => (x.kcOwn || {}).head || '',
  ownTags: x => (x.kcOwn || {}).tags || (kcField_('facets') || (() => ''))(x),
  ownLines: x => (x.kcOwn || {}).lines || '',
};
/* A FIELD ITS OWN FILE DRAWS (tags, a venue's building, a manuscript, a boxer) is added to `window.KC_FIELDS_MORE` there; no load order needed. */
const kcField_ = k => KC_FIELDS[k] || (window.KC_FIELDS_MORE || {})[k];
/* THE FILE'S ROWS BEFORE IT ARRIVES (or if it never does): the same rows, held equal to the file by check-card-shape. */
const KC_DEFAULT = {
  tutor: { cls: 'is-widget is-prof tcard', pic: ['face'], title: ['role', 'nameRate'], tags: ['teaches', 'facts'], lines: ['listedNote', 'say', 'photos', 'words', 'quals', 'jobs', 'places', 'avail'], tiles: ['book-with:book:Book', 'msg-open:msg:Message'] },
  venue: { cls: 'venue-door', pic: ['venuePic'], title: ['name'], tags: ['facets'], lines: ['venueSub', 'rooms'], tiles: [] },
  level: { cls: 'is-level', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['surcharge', 'levelSubjects', 'tutorCount', 'bookingForm', 'tutorNames'], tiles: ['book-with:book:Book'] },
  subject: { cls: 'is-subject', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['surcharge', 'levels', 'tutorNames'], tiles: ['book-with:book:Book'] },
  manuscript: { cls: 'hdb hdb-msc lib-c', pic: ['msPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] },
  writing: { cls: 'hdb lib-c', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['refs'], tiles: [] },
  event: { cls: 'hdb lib-c', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['refs'], tiles: [] },
  people: { cls: 'person lib-c', pic: ['boxerPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] },
  msg: { cls: 'msg-fc', pic: ['msgPic'], title: ['msgWho'], tags: ['msgTags'], lines: ['msgBody', 'msgTiles'], tiles: [] },
  post: { cls: 'post-fc', pic: ['postPic'], title: ['postTitle'], tags: ['postTags'], lines: ['postBody', 'postTiles'], tiles: [] },
  receipt: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  bookform: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  friend: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  question: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  answer: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  shop: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  practical: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  project: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  content: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  insert: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  timeline: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  fight: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  bible: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  talmud: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  quran: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  worktext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  hadith: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  writ: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  pdtext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  orthotext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  hymn: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  mech: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  chem: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  soon: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  person: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  setting: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  health: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  offPosts: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  offShop: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  offBooking: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
};
/* A KIND'S FIELDS: its row in data/settings/card-fields.json (`DATA.cardFields`, settings.js), else the built-in row, else the bare three. */
/* A KIND THE FILE DOES NOT NAME BUT WHOSE OWN MAKER DREW IT (a verse another file draws) keeps every part it drew. */
const KC_OWN_SPEC = { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] };
function kcSpec_(kind) {
  const rows = (typeof DATA !== 'undefined' && DATA && DATA.cardFields) || KC_DEFAULT;
  return rows[kind] || KC_BARE;
}
/* EVERY CARD OF A KIND SHOWS ITS KIND'S TILES (owner 35a, 8 Nov): one this card cannot use is drawn greyed (`off`), never left out. */
function kcTilesFill_(x, html) {
  const s = x && x.key ? kcSpec_(x.kind) : null;
  if (!s || !(s.tiles || []).length) return html;
  return html + s.tiles.map(t => { const [act, icon, label] = String(t).split(':');
    return new RegExp('data-do="' + act + '"').test(html) ? '' : tile_({ icon, label: label || act, act, off: true, cls: 'kc-off' }); }).join('');
}
/* ---------- A CARD ITS OWN FILE STILL WRITES, CUT INTO THE FOUR PARTS ---------- */
const KC_VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
const KC_ATTRS = '((?:\\s+[^\\s=>\\/]+(?:\\s*=\\s*(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?)*)';
/* THE TOP-LEVEL ELEMENTS OF SOME HTML, each with its tag, class, whole html and inside; loose text is an element with no tag. */
function kcKids_(html) {
  const re = new RegExp('<!--[\\s\\S]*?-->|<(\\/?)([a-zA-Z][\\w-]*)' + KC_ATTRS + '\\s*(\\/?)>', 'g'), out = [];
  let depth = 0, start = 0, top = null;
  const loose = to => { if (html.slice(start, to).trim()) out.push({ tag: '', cls: '', html: html.slice(start, to), inner: '' }); };
  for (let m; (m = re.exec(html));) {
    if (!m[2]) continue;
    const tag = m[2].toLowerCase(), close = !!m[1], self = !close && (!!m[4] || KC_VOID.test(tag));
    if (!close && depth === 0) { loose(m.index); top = { tag, cls: (/\bclass\s*=\s*"([^"]*)"/.exec(m[3]) || [, ''])[1], attrs: m[3], at: m.index, from: re.lastIndex }; start = m.index; }
    if (self) { if (depth === 0) { out.push(Object.assign(top, { html: m[0], inner: '' })); top = null; start = re.lastIndex; } continue; }
    if (!close) { depth++; continue; }
    if (depth === 0) continue;
    if (--depth === 0 && top) { out.push(Object.assign(top, { html: html.slice(top.at, re.lastIndex), inner: html.slice(top.from, m.index) })); top = null; start = re.lastIndex; }
  }
  loose(html.length);
  return out;
}
/* ONE CARD'S HTML AS PARTS: its first picture, its heading, its tag line, the rest as lines; a `.thing` wrapper is opened. null if it is not one card. */
function kcSplit_(html) {
  const els = kcKids_(String(html || '')), card = els.length === 1 ? els[0] : null;
  if (!card || card.tag !== 'div') return null;
  const parts = { cls: card.cls, attrs: String(card.attrs || '').replace(/\s+class\s*=\s*"[^"]*"/, ''), pic: '', head: '', tags: '', lines: '' };
  const walk = list => list.forEach(k => {
    const c = ' ' + k.cls + ' ';
    if (/ thing(-body)? /.test(c)) return walk(kcKids_(k.inner));
    if (!parts.pic && (/^(img|svg|figure|canvas)$/.test(k.tag) || /[ -](pic|art) /.test(c))) parts.pic = k.html;
    else if (!parts.head && (/^h[1-4]$/.test(k.tag) || / ([\w-]+-)?(head|title) /.test(c))) parts.head = k.html;
    else if (!parts.tags && / [\w-]*tags /.test(c)) parts.tags = k.html;
    else parts.lines += k.html;
  });
  walk(kcKids_(card.inner));
  return parts;
}
/* A KIND WHOSE CARD NEEDS ITS OWN ROW OR A TAIL (a conversation's messages) sets `window.KC_AROUND[kind] = (x, draw) => html`; `draw(extra)` is this card. */
function findCard(x, credits) {
  const around = x && !x.kcIn && (window.KC_AROUND || {})[x.kind];
  if (around) return around(x, extra => findCard(Object.assign({}, x, extra || {}, { kcIn: true })));
  /* A KIND WHOSE OWN FILE STILL WRITES ITS CARD (`window.KC_OWN[kind] = (x, credits) => html`) is cut into the parts; one already in the shape is kept whole. */
  const own = x && !x.kcOwn && x.kind && (window.KC_OWN || {})[x.kind];
  if (own) {
    let got = '';
    try { got = own(x, credits); } catch (e) { oops_(e, 'card:' + x.kind); }
    if (typeof got !== 'string' || !got || /^\s*<div class="card fc kc\b/.test(got)) return got || '';
    /* SEVERAL CARDS FROM ONE MAKER (site health's) are each cut into the shape. */
    const els = kcKids_(got), many = els.length > 1 && els.every(k => k.tag === 'div' && / card /.test(' ' + k.cls + ' '));
    const cuts = (many ? els.map(k => k.html) : [got]).map(kcSplit_);
    return cuts.every(Boolean) ? cuts.map(cut => findCard(Object.assign({}, x, { kcOwn: cut }))).join('') : got;
  }
  const it = x && (x.row || x.kcOwn) ? x : { kind: 'subject', row: x || {} };
  const t = kcRow_(it), name = it.name || t.title || t.name || '';
  const one = it.name ? it : Object.assign({}, it, { name });
  const s = it.kcOwn && kcSpec_(it.kind) === KC_BARE ? KC_OWN_SPEC : kcSpec_(it.kind);
  const run = list => (list || []).map(k => { try { const f = kcField_(k); return f ? f(one) || '' : ''; } catch (e) { oops_(e, 'card:' + k); return ''; } }).join('');
  const parts = { pic: run(s.pic), head: run(s.title), tags: run(s.tags), lines: run(s.lines) };
  const off = (it.kind === 'tutor' && t.listed === false ? ' is-off' : '') + (it.cardCls ? ' ' + esc(it.cardCls) : '');
  /* `cardData` BECOMES data-* ATTRIBUTES, so a card can be found again where it stands (a post's sheet, a conversation's redraw). */
  const data = Object.keys(it.cardData || {}).map(k => ` data-${k}="${esc(it.cardData[k])}"`).join('');
  /* ITS OWN MAKER'S CLASSES AND ATTRIBUTES STAY ON IT, so every handler's `closest('.qcard')` or `[data-key]` still finds it. */
  const mine = it.kcOwn || {}, ownCls = String(mine.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' ');
  const label = /\saria-label=/.test(mine.attrs || '') ? '' : ` aria-label="${esc(name)}"`;
  return `<div class="card fc kc kc-${esc(it.kind || 'thing')}${s.cls ? ' ' + esc(s.cls) : ''}${ownCls ? ' ' + ownCls : ''}${off}"${data}${mine.attrs || ''}${label}>${
    KC_PARTS.map(p => `<div class="kc-${p}">${parts[p]}</div>`).join('')}</div>`;
}

/* Tapping one opens a sheet rather than expanding the card. § */

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
      toast(why_(err));
    });
});

/* THE OTHER HALF OF THE CLICK HANDLER. § */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && !isCheckbox_(el)) return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + why_(err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */

/* ---------- WHAT THE SITE ALREADY KNOWS IS NOT ASKED AGAIN (1040 friction) ---------- */
/* Once per form: only an EMPTY answer is filled, each still a dropdown to change; nothing here is a price, a payment or a send. */
let BOOK_PREFILLED = false;
function bookPrefill_() {
  if (BOOK_PREFILLED || !USER) return;
  BOOK_PREFILLED = true;
  const done = id => { BOOKING.done = uniq((BOOKING.done || []).concat([id])); };
  const only = st => { try { return (st.options() || []).filter(Boolean); } catch (e) { return []; } };
  /* THE USUAL CASE FIRST: an instant session, a new one, at home, no extra seats. */
  if (!BOOKING.how) BOOKING.how = 'Instant class';
  if (!BOOKING.joining) BOOKING.joining = NEW_LIST;
  /* AT HOME IS THE VENUE ROW MARKED `takes_all_seats` (48a), by its own label; none marked, the question stays open. */
  if (!BOOKING.loc) BOOKING.loc = ((bookableSpaces().find(x => x.takesAllSeats) || {}).label) || '';
  const seats = only(bookStep_('n'));
  if (!BOOKING.n && seats.length) BOOKING.n = seats[0];
  /* FIND'S CHIPS: a subject or level already picked there is the answer here. */
  const chip = f => ((typeof STUFF !== 'undefined' && STUFF.filters) || []).filter(x => x && x.field === f && !x.any).map(x => String(x.value))[0] || '';
  if (!(BOOKING.subjects || []).length && chip('subject')) { BOOKING.subjects = [chip('subject')]; done('subjects'); }
  if (!BOOKING.level && chip('level')) BOOKING.level = chip('level');
  if (!BOOKING.tutor && only(bookStep_('tutor'))[0] === 'No preference') BOOKING.tutor = 'No preference';
  /* THE FIRST TERM ON OFFER (the soonest), and the child when there is only one seat-holder to name. */
  const terms = only(bookStep_('interval'));
  if (!(BOOKING.interval || []).length && terms.length) { BOOKING.interval = [terms[0]]; done('interval'); }
  /* NEVER THE UNNAMED SEAT: it is no child the site knows, and an admin with no client yet kept it ticked beside the real child. */
  const named = only(bookStep_('kids')).filter(k => k !== UNNAMED);
  const kid = named.length === 1 ? named[0] : '';
  if (!(BOOKING.kids || []).length && kid) { BOOKING.kids = [kid]; done('kids'); }
}

/* ---------- BOOKING FROM A CARD § */
on('book-with', el => {
  closeSheet();
  /* WHAT THE CARD WAS ABOUT ANSWERS ITS ROW ON THE FORM (1040 friction): a tutor, a subject, a level. */
  const d = (el && el.dataset) || {};
  if (d.tutor) BOOKING.tutor = d.tutor;
  if (d.subject && !(BOOKING.subjects || []).length) { BOOKING.subjects = [d.subject]; BOOKING.done = uniq((BOOKING.done || []).concat(['subjects'])); }
  if (d.level && !BOOKING.level) BOOKING.level = d.level;
  BOOK_OPEN = true;
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }] });
  go('stuff');
});

/* ---------- A LIBRARY CARD'S PICTURE (owner's look rule: picture first): a kind with no drawing of its own gets one 8-bit sign of its kind ---------- */
const LIB_PIX = {
  writing: ['', '...eeeeeeeeee', '..etttttttttte', '...eeeeeeeeee', '...ewwwwwwwwe', '...ewkkkkkkwe', '...ewwwwwwwwe', '...ewkkkkkwwe',
    '...ewwwwwwwwe', '...ewkkkkkkwe', '...ewwwwwwwwe', '...ewkkkwwwwe', '...eeeeeeeeee', '..etttttttttte', '...eeeeeeeeee', ''],
  event: ['', '..k', '..krrrrrrrr', '..krrrrrrrrrr', '..krrrrrrrrrrr', '..krrrrrrrrrr', '..krrrrrrrr', '..k', '..k', '..k', '..k', '..k',
    '..k', '.kkk', 'kkkkk', ''],
  content: ['', '', '..tttttttttttt', '..tywwwwwwwwwt', '..tywkkkkkkwwt', '..tywwwwwwwwwt', '..tywkkkkkwwwt', '..tywwwwwwwwwt',
    '..tywkkkkkkwwt', '..tywwwwwwwwwt', '..tywkkkkwwwwt', '..tywwwwwwwwwt', '..tttttttttttt', '..twwwwwwwwwwt', '...ttttttttttt', ''],
  project: ['', '......yyyy', '....yyyyyyyy', '...yyywwyyyyy', '...yywwyyyyyy', '...yyyyyyyyyy', '...yyyyyyyyyy', '....yyyyyyyy',
    '.....yyyyyy', '......yyyy', '......ssss', '......kkkk', '......ssss', '.......kk', '', ''],
  manuscript: ['', '..eeeeeeeeeee', '..eeeeeeeeeeee', '..ettttttttee', '..eeeeeeeeeee', '..etttttttttee', '..eeeeeeeeeeee', '..ettttttteee',
    '..eeeeeeeeeeee', '..etttttttttee', '..eeeeeeeeeee', '..ettttteeeee', '..eeeeeeeeeeee', '...eeeeeeeeeee', '', ''],
};
const libPic_ = (kind, name) => (LIB_PIX[kind] ? `<figure class="lib-pic">${pixSvg_(LIB_PIX[kind], name || '')}</figure>` : '');

/* `on('prof-shot')` WAS HERE — a tutor's extra photograph opened across its row on a tap. Taken out
   on request (10 Oct, `findCard`): the squares are pictures, not controls. */
