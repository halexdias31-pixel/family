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

  return card_(`<div class="is-widget">
    <div class="thing">
      ${/* THROUGH `personFace_` LIKE EVERY FACE. § */
            ''}
      ${personFace_({ pic: face, avatar: USER.avatar || '', handle: USER.handle, name: USER.name, personId: USER.personId },
                    { cls: 'thing-pic', none: 'none', size: 52 })}
      <div class="thing-body">
        <h3>${esc(nameBesideHandle_(USER.name, USER.handle))}</h3>
        ${USER.handle ? `<p class="prof-handle">@${esc(USER.handle)}</p>` : ''}
      </div>
    </div>
    ${/* THE `Sign out` BUTTON WAS HERE, briefly. § */
          ''}
  </div>`);
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
    ? `<div class="qtags prof-tags prof-teach prof-quals">${chips.join('')}</div>` : '';
}

/* ---------- JOBS, CURRENT AND PAST (8 Nov): one pill a job — "Role · Where · 2019–now" — in the jobs colour. */
const profJobSay_ = j => [j.role, j.where, [j.from, j.to].filter(Boolean).join('–')].map(v => String(v || '').trim()).filter(Boolean).join(' · ');
function profJobs_(t) {
  const says = (Array.isArray(t.jobs) ? t.jobs : []).map(profJobSay_).filter(Boolean);
  const chips = PROF_MORE_(says.map(v => `<span class="prof-tag">${esc(v)}</span>`), 1, says);
  return chips.length ? `<div class="qtags prof-tags prof-teach prof-jobs">${chips.join('')}</div>` : '';
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
/* EVERY PLACE BY NAME, as tags: the card's whole answer to where, since maps went with the engines (88a). */
function profPlaces_(names) {
  return names && names.length ? `<div class="qtags prof-tags prof-teach prof-places">${PROF_MORE_(names.map(n => `<span class="prof-tag">${esc(n)}</span>`), 3, names).join('')}</div>` : '';
}

function profHeat_(names) {
  if (!names || !names.length) return '';
  const byName = {};
  ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).forEach(v => {
    if (v && v.title) byName[norm(v.title)] = v; });
  const pts = names.map(n => byName[norm(n)])
    .filter(v => v && Number(v.lat) && Number(v.lng)).map(v => [Number(v.lat), Number(v.lng), v.borough || '']);
  const tail = profPlaces_(names);
  if (!pts.length) return tail;
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
  px.forEach(p => layers.push({ img: 'radial-gradient(circle closest-side, color-mix(in srgb, var(--white) 55%, transparent) 0, color-mix(in srgb, var(--white) 25%, transparent) 45%, transparent 100%)',
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
  return `
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
    return `<p class="prof-say prof-nohours">Hasn\u2019t set usual hours yet \u2014 ask for any hour;
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
    return `<p class="prof-say prof-hid prof-nofree">No free hours this week.${typeof isAdmin === 'function' && isAdmin()
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
    return spans.length ? `<span class="prof-tag prof-day">${esc(day_(d.label))} ${esc(say)}</span>` : '';
  }).filter(Boolean).join('<span class="prof-sep"> </span>');
  const free = line(c => c.lit), busyLine = line(c => c.busy);
  return `<div class="prof-week prof-hours" data-avail="${ticked.length}"
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

/* A TUTOR'S RATE AS SHOWN: £first-seat–full-class/h, or one rate when they take one seat (549). Display only; priceFrom charges. */
function rateRange_(t) {
  const r = Number(t && t.rate);
  if (!(r > 0)) return '';
  const say = money_;
  const max = Math.round(Number(t.maxStudents)) || 1, seat = profSeat_(t);
  return max > 1 && seat > 0 ? say(r) + '–' + perHour_(r + seat * (max - 1)).slice(1) : perHour_(r);
}

/* ONE CARD FOR EVERY KIND (owner, 8 Nov): picture, title, tags, lines, then its tile row (`cardTiles_`).
   card-fields.json picks each part's fields; check-card-shape holds the shape. */
const KC_PARTS = ['pic', 'head', 'tags', 'lines', 'act'];
/* WHO A CARD IS DRAWN FOR: undefined is whoever is signed in; a share sets 'public' while it draws (tutorPng_). */
let CARD_VIEWER;
/* BEFORE THE SETTINGS FILE ARRIVES, OR FOR A KIND IT DOES NOT NAME: its kind's picture, its name, its facet tags. */
const KC_BARE = { cls: '', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] };
const kcRow_ = x => (x && x.row) || {};
const kcPct_ = m => (m === 1 ? dash_() : (m > 1 ? '+' : '−') + Math.abs(Math.round((m - 1) * 100)) + '%');
/* EACH FIELD A CARD CAN SHOW, BY NAME: the settings file picks, and a field with nothing to say says ''. */
const KC_FIELDS = {
  kindPic: () => '',
  name: x => `<h3>${esc(x.name || '')}</h3>`,
  /* THE TUTOR'S COMPACT ONE-SCREEN CARD (547) as fields: face, role, the name line with the rate, then pills and lines. */
  /* A PHOTO, ELSE A DEFAULT PICTURE (owner, 9 Nov): never an avatar figure on a card. */
  face: x => { const t = kcRow_(x), k = typeof picKind_ === 'function' ? picKind_(t.image) : (t.image ? 'photo' : '');
    if (k === 'photo') return `<img class="prof-pic" src="${esc(pic(t.image))}" alt="" loading="lazy" decoding="async">`;
    return k === 'basic' && typeof pfpArt_ === 'function' ? pfpArt_(pfpChoice_(t.image), 96) : ''; },
  /* THE NAME IS A TAG (owner, 9 Nov): first name and an initial for everyone; the role and rate are tags beside it. */
  nameTag: x => { const t = kcRow_(x), tag = (v, n, c) => `<span class="prof-tag${c ? ' ' + c : ''}" data-tag="${n}">${esc(v)}</span>`;
    return `<div class="qtags prof-tags prof-who-tags">${tag(displayName_(t, CARD_VIEWER), 0, 'prof-tag-name')}${
      [t.role || 'Tutor'].concat(profList_(t.titles)).map(v => tag(v, 1)).join('')}${
      t.rate && !childView_() ? tag(rateRange_(t), 4, 'prof-tag-rate') : ''}${t.activity ? tag(t.activity, 3, 'prof-act') : ''}${
      t.listed === false ? tag(t.pending ? 'asked to tutor' : 'not listed', 9, 'prof-off') : ''}</div>`; },
  /* A TICKED TUTOR BOX IS A QUESTION TO THE ADMIN, answered by the eye tile; the line says what pressing it means. */
  listedNote: x => { const t = kcRow_(x); if (!(t.listed === false && isAdmin())) return '';
    return t.pending ? `<p class="prof-say prof-hid">They ticked Tutor in their settings. Until you list them they are not on the site,
      cannot be booked and cannot take a session — the crossed-out eye below approves them.</p>`
      : '<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts them back on the site.</p>'; },
  /* SUBJECT PILLS: one chip a subject, its levels raised (`teachGroups_`). */
  teaches: x => { const t = kcRow_(x), main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
    return (main.length ? `<div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(main).map(g => teachChip_(g, true)), 3).join('')}</div>` : '')
      + (also.length ? `<div class="qtags prof-tags prof-teach">${
      PROF_MORE_(teachGroups_(also).map(g => teachChip_(g, false)), 2).join('')}</div>` : ''); },
  facts: x => { const f = profFacts_(kcRow_(x));
    return f.length ? `<div class="qtags prof-tags prof-teach prof-facts">${f.map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''; },
  /* WHAT THEY WROTE: `doget.gs` already quotes it, so it is printed as said. */
  say: x => (kcRow_(x).description ? `<p class="prof-say cut2" data-do="cut-open">${esc(kcRow_(x).description)}</p>` : ''),
  photos: x => { const p = kcRow_(x).photos; return Array.isArray(p) && p.length ? `<div class="prof-photos">${PROF_MORE_(p.map(u =>
    `<span class="prof-shot"><img src="${esc(pic(u))}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.remove()"></span>`), 4).join('')}</div>` : ''; },
  words: x => { const w = profList_(kcRow_(x).tags).slice(0, 3);
    return w.length ? `<p class="prof-words">${w.map(v => `<b>${esc(v)}</b>`).join('<i aria-hidden="true">·</i>')}</p>` : ''; },
  quals: x => profQuals_(kcRow_(x)),
  jobs: x => profJobs_(kcRow_(x)),
  /* THE MAP: the venues tab's `tutors_happy_here`; an older backend sends no key and nothing is drawn. */
  places: x => profPlaces_(profList_(kcRow_(x).venues)),
  /* DAY PILLS. */
  avail: x => profAvail_(kcRow_(x)),
  venueSub: () => '',
  /* A CHILD IS TOLD THE SEATS AND NOT THE PRICE (398), and a room with neither says nothing. */
  rooms: x => { const t = kcRow_(x), kid = childView_();
    const say = (max, rate) => [max ? 'up to ' + max : '', kid ? '' : rate ? perHour_(rate) : 'free'].filter(Boolean).join(' · ');
    const one = (label, max, rate) => (say(max, rate) ? row(label, say(max, rate)) : '');
    return (t.rooms || []).length ? t.rooms.slice(0, 4).map(r => one(r.name || 'Room', r.max, r.rate)).join('') : one('The room', t.maxCapacity, t.bestRate); },
  surcharge: x => { const t = kcRow_(x); if (x.kind === 'level' && !t.priced) return row('Surcharge', 'Not priced yet', 'bad');
    return row(t.mult === 1 ? 'No surcharge' : 'Surcharge', kcPct_(t.mult)); },
  /* THE SUBJECTS THAT RUN AT A LEVEL, green as a subject is everywhere. */
  levelSubjects: x => { const s = kcRow_(x).subjects || [];
    return s.length ? rowHtml('Subjects', s.map(v => `<span class="subject">${esc(v)}</span>`).join(', ')) : row('Subjects', 'None yet', 'bad'); },
  tutorCount: x => { const n = (kcRow_(x).tutors || []).length; return row('Tutors', n ? String(n) : NO_TUTOR, n ? '' : 'bad'); },
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
  tutor: { cls: 'is-widget is-prof tcard', pic: ['face'], title: [], tags: ['nameTag', 'teaches', 'facts'], lines: ['listedNote', 'say', 'photos', 'words', 'quals', 'jobs', 'places', 'avail'], tiles: ['book-with:book:Book', 'msg-open:chat:Message'] },
  venue: { cls: 'venue-door', pic: ['venuePic'], title: ['name'], tags: ['facets'], lines: ['venueSub', 'rooms'], tiles: [] },
  level: { cls: 'is-level', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['surcharge', 'levelSubjects', 'tutorCount', 'bookingForm', 'tutorNames'], tiles: ['book-with:book:Book'] },
  subject: { cls: 'is-subject', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['surcharge', 'levels', 'tutorNames'], tiles: ['book-with:book:Book'] },
  manuscript: { cls: 'hdb hdb-msc lib-c', pic: ['msPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] },
  writing: { cls: 'hdb lib-c', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['refs'], tiles: [] },
  event: { cls: 'hdb lib-c', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: ['refs'], tiles: [] },
  people: { cls: 'person lib-c', pic: ['boxerPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] },
  msg: { cls: 'msg-fc', pic: ['msgPic'], title: ['msgWho'], tags: ['msgTags'], lines: ['msgBody', 'msgTiles'], tiles: ['msg-reply:send:Reply'] },
  post: { cls: 'post-fc', pic: ['postPic'], title: [], tags: ['postTags'], lines: ['postBody', 'postTiles'], tiles: ['react:heart:Like'] },
  receipt: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['receiptTags'], lines: ['receiptSum', 'ownLines'], tiles: ['job-pay:pound:Pay'] },
  question: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  answer: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
  shop: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: ['cart-add:cart:Buy'] },
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
    /* A BODY WRAPPER (`.tx-body`, `.rd-body`) IS OPENED TOO, so its heading is the name and its first line clamps to two. A `.kc-items` list stays whole: it holds controls. */
    if (/ (thing|[\w]+-body) /.test(c) && !/ kc-items /.test(c) && k.tag === 'div') return walk(kcKids_(k.inner));
    if (!parts.pic && (/^(img|svg|figure|canvas)$/.test(k.tag) || /[ -](pic|art) /.test(c))) parts.pic = k.html;
    else if (!parts.head && (/^h[1-4]$/.test(k.tag) || / ([\w-]+-)?(head|title) /.test(c))) parts.head = k.html;
    /* A SECOND TAG LINE (a verse's translation) joins the first: one tag part, never a tag line among the lines. */
    else if (/ [\w-]*tags /.test(c)) parts.tags = !parts.tags ? k.html : /<\/div>\s*$/.test(parts.tags) ? parts.tags.replace(/<\/div>\s*$/, k.inner + '</div>') : parts.tags + k.html;
    else parts.lines += k.html;
  });
  walk(kcKids_(card.inner));
  return parts;
}
/* ---------- EVERY CARD'S FOUR BUTTONS (owner, 9 Nov): main action, Message, Star, ⋯ -- the rest waits behind ⋯, opened in place. ---------- */
const KC_TILE_RE = /<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g;
const kcAct_ = t => (/\bdata-do="([^"]*)"/.exec(t) || [])[1] || '';
/* WHAT COUNTS AS A CARD'S MAIN ACTION when its kind names none first: a Send/Check, a buy-toned tile, Open. */
const KC_MAIN_ACTS = ['find-open', 'book-with'];
function kcFour_(x, rest, main) {
  const all = String(rest || '').match(KC_TILE_RE) || [];
  const spec = x && x.kind ? kcSpec_(x.kind) : KC_BARE;
  const first = String((spec.tiles || [])[0] || '').split(':')[0];
  const pick = test => { const t = all.find(test); if (t) all.splice(all.indexOf(t), 1); return t || ''; };
  main = main || pick(t => first && kcAct_(t) === first) || pick(t => /\bis-(submit|buy)\b/.test(t))
    || pick(t => KC_MAIN_ACTS.indexOf(kcAct_(t)) >= 0) || pick(t => !/^(fav|msg-open|card-share|find-top|rep-box|game-lock)$/.test(kcAct_(t)) && !/\bis-(admin|danger)\b/.test(t));
  const r = kcRow_(x), who = r.title || r.name || '';
  const msg = pick(t => kcAct_(t) === 'msg-open')
    || (x && x.key && typeof personTiles_ === 'function' && /^(tutor|person|people)$/.test(x.kind) ? personTiles_(x) : '')
    || tile_({ icon: 'chat', label: 'Message', act: 'msg-open', off: true, data: { to: who } });
  const star = pick(t => kcAct_(t) === 'fav')
    || tile_({ icon: 'star', label: 'Save', act: 'fav', off: true, data: { key: (x && x.key) || '', kind: (x && x.kind) || 'item' } });
  /* A CARD IS STATIC (owner, 10 Nov): with no main of its own, Share leads; the card already shows everything it holds. */
  const lead = main || pick(t => kcAct_(t) === 'card-share') || tile_({ icon: 'share', label: 'Share', act: 'card-share', off: !(x && x.key), data: { key: (x && x.key) || '' } });
  /* WHAT IS NOT A TILE (a verdict, a slot) stays beside the rest, behind ⋯. */
  const left = all.reduce((h, t) => h.replace(t, ''), [main, msg, star].reduce((h, t) => (t ? h.replace(t, '') : h), String(rest || '')));
  return `<span class="kc-four">${lead}${msg}${star}${tile_({ icon: 'more', label: 'More', act: 'kc-more' })}</span><span class="kc-more" hidden>${all.join('')}${left}</span>`;
}
/* THE CARD'S OWN ROW when no tool row of its own (a question's `qtRow_`) already carries the four. */
function kcActRow_(x, html, own) {
  if (/class="[^"]*\bkc-four\b/.test(html)) return '';
  let rest = own || '';
  try { rest += x && x.key && typeof cardTiles_ === 'function' ? cardTiles_(x, true) : ''; } catch (e) { oops_(e, 'card:tiles'); }
  /* A KIND'S TILE GREYED FOR WANT OF ONE goes when its own maker's row brought the real one. */
  const real = (String(own || '').match(KC_TILE_RE) || []).map(kcAct_);
  rest = rest.replace(KC_TILE_RE, t => (/\bkc-off\b/.test(t) && real.indexOf(kcAct_(t)) >= 0 ? '' : t));
  return `<div class="tile-row kc-row">${kcFour_(x, kcTilesFill_(x, rest))}</div>`;
}
/* THE TOP-LEVEL TILE ROWS OF SOME LINES, lifted out; a form's buttons (`.btn-row`, inside the form) stay where they are. */
function kcHoist_(html, panel) {
  /* A `.kc-items` LIST KEEPS EACH THING'S TILES BESIDE IT; none is lifted into the card's row too. A panel's own lines may hold a whole card (a widget's), whose row is its own. */
  if (new RegExp('class="[^"]*\\b(' + (panel ? '' : 'kc-four|') + 'kc-items)\\b').test(html)) return { lines: html, tiles: '' };
  let tiles = '';
  const lines = kcKids_(String(html || '')).map(k => {
    if (k.tag === 'div' && / tile-row /.test(' ' + k.cls + ' ')) { tiles += k.inner; return ''; }
    return k.html;
  }).join('');
  return { lines, tiles };
}
/* WHETHER SOME TAGS ALREADY SAY A NAME, and the name put in front of them as a tag. */
const kcSays_ = (tags, name) => norm(String(tags || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&')).indexOf(norm(name)) >= 0;
function kcTagFirst_(tags, name) {
  const tag = `<span class="qtag" data-tag="0">${esc(name)}</span>`;
  return /^\s*<(div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>/.test(tags || '') ? String(tags).replace(/^(\s*<(?:div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>)/, '$1' + tag) : `<div class="qtags">${tag}</div>` + (tags || '');
}
/* TAGS ARE SHORT FACTS, LINES HAVE NO HEADINGS (owner, 9 Nov): a longer tag (a credit) becomes a later line, open-only; a heading in the lines a plain line. */
const KC_TAG_MAX = 30;
/* A QUESTION, AN ANSWER, A SETTING AND SITE HEALTH hold a whole screen whose own checks read its headings: kept as drawn. */
const KC_WHOLE_KINDS = ['question', 'answer', 'setting', 'health'];
function kcTidy_(tags, lines, name) {
  const words = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').trim();
  const moved = [];
  tags = String(tags || '').replace(/<span class="qtag\b[^"]*"([^>]*)>((?:(?!<\/?span\b)[\s\S])*)<\/span>/g, (m, at, inner) =>
    (/data-tag="0"/.test(at) || words(inner).length <= KC_TAG_MAX ? m : (moved.push(`<p class="kc-credit">${inner}</p>`), '')));
  lines = String(lines || '').replace(/<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (m, n, at, inner) => {
    if (name && norm(words(inner)) === norm(name)) return '';
    const a = /\sclass="/.test(at) ? at.replace(/\sclass="/, ' class="kc-h ') : ' class="kc-h"' + at;
    return `<p${a} role="heading" aria-level="${n}">${inner}</p>`;
  });
  return { tags, lines: lines + moved.join('') };
}
/* A TAG SAYS ONLY WHAT THE MENUS ABOVE HAVE NOT (owner, 6 Nov), on every kind: a tag whose words a picked chip already says goes. */
function kcUnpicked_(html) {
  const f0 = typeof STUFF !== 'undefined' && STUFF && STUFF.filters, f = Array.isArray(f0) ? f0 : [];
  const said = new Set();
  f.filter(c => c && !c.any).forEach(c => { said.add(norm(String(c.value))); try { if (typeof chipShow_ === 'function') said.add(norm(String(chipShow_(c) || ''))); } catch (e) { oops_(e, 'card:chip'); } });
  said.delete('');
  if (!said.size) return html;
  return String(html || '').replace(/<span class="(?:qtag|prof-tag)(?![^"]*prof-tag-name)[^"]*"[^>]*>([^<]*)<\/span>/g, (m, t) => (said.has(norm(t.replace(/&amp;/g, '&'))) ? '' : m));
}
/* IMAGE ON TOP ONLY WHEN REAL (owner, 10 Nov late): a person keeps a photo or a steady profile picture; any other kind shows a photo, figure or cover, else nothing. */
function kcPicOr_(x, html) {
  html = String(html || '');
  if (KC_PERSON_KINDS.indexOf(x && x.kind) < 0) return kcRealPic_(html) ? html : '';
  if (html.trim()) return html;
  const art = typeof PFP_ART === 'object' && PFP_ART ? PFP_ART : {};
  const named = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.defaultPictures) ? DATA.defaultPictures : []).filter(n => art[n]);
  const list = named.length ? named : Object.keys(art);
  if (!list.length || typeof pfpArt_ !== 'function') return '';
  const r = kcRow_(x), k = String(r.personId || (x && (x.key || x.name)) || ''); let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return pfpArt_(list[h % list.length], 96);
}
/* A REAL PICTURE: a photo, a clip, or a drawing of this very thing (a manuscript, a car part, a timeline stop); a kind sign or icon is not one. */
const kcRealPic_ = h => /<(img|video|picture)\b|mfrclip-|class="(mech|tl)-pic"/.test(String(h || ''));
/* ---------- A CARD NEVER DRAWS ITS OWN INSIDES (owner, 10 Nov): a facts kind hands over words; findCard lays them out one way ---------- */
/* Before card-fields.json lands: the same `facts` and `icon` columns its rows hold (settings.js reads them into DATA.cardLook). */
const KC_LOOK_DEFAULT = Object.fromEntries(Object.entries({ receipt: 'pound', shop: 'cart', practical: 'tools', project: 'spark', content: 'doc', insert: 'doc', timeline: 'line', fight: 'hand', bible: 'doc', talmud: 'doc', quran: 'doc', worktext: 'doc', hadith: 'doc', writ: 'doc', pdtext: 'doc', orthotext: 'doc', hymn: 'sound', chem: 'spark', soon: 'spark', person: '', setting: 'tools', health: 'tick', offPosts: 'spark', offShop: 'cart', offBooking: 'book' }).map(([k, icon]) => [k, { facts: true, icon }]));
/* WHO HAS A FACE: a person's card keeps its photo or chosen picture; nobody else's is ever a profile picture. */
const KC_PERSON_KINDS = ['tutor', 'person', 'people', 'msg'];
const kcLook_ = kind => ((typeof DATA !== 'undefined' && DATA && DATA.cardLook) || KC_LOOK_DEFAULT)[kind] || {};
const kcEmpty_ = () => (typeof NOTHING_YET === 'string' ? NOTHING_YET : '');
/* A FORM STAYS A FORM: its own maker draws it, whole and unclamped, as the card's open content. */
/* A LIST OF THINGS EACH WITH ITS OWN TILES (`.kc-items` of `.kc-item`s, the checklist's) holds controls too, so it is drawn open and whole. */
const KC_FORM_SEL = 'input:not([type="hidden"]), select, textarea, form, .kc-items';
const KC_BLOCK = /^(P|LI|DIV|SECTION|ARTICLE|TR|DT|DD|H[1-6]|BLOCKQUOTE|PRE|UL|OL|DL|TABLE|FIGCAPTION|HEADER|FOOTER)$/;
/* SOME KIND HTML AS FACTS: plain lines, its buttons lifted out, the original kept hidden so a late filler still finds its target. */
function kcFacts_(html) {
  const out = { lines: '', tiles: '', form: '', src: '' };
  if (typeof document === 'undefined' || !String(html || '').trim()) return out;
  const t = document.createElement('template');
  t.innerHTML = html;
  if (!t.content || !t.content.querySelector) return out;
  /* A FORM CARD'S OWN HEADING GOES: the name is already the card's first tag. */
  if (t.content.querySelector(KC_FORM_SEL)) { const h = t.content.querySelector('h1, h2, h3, h4'); if (h) h.remove(); out.form = t.innerHTML; return out; }
  /* A BUTTON OR LINK INSIDE IS NO LINE: it joins the card's row (behind ⋯ unless it is the main). */
  t.content.querySelectorAll('[data-do], a[href], button').forEach(el => { if (el.parentNode && !el.closest('[data-kc-took]')) { el.setAttribute('data-kc-took', ''); out.tiles += el.outerHTML; el.remove(); } });
  out.tiles = out.tiles.replace(/ data-kc-took=""/g, '');
  const wait = t.content.querySelector('.loading');
  const said = [];
  const walk = node => {
    let buf = '';
    const flush = () => { const s = buf.replace(/\s+/g, ' ').trim(); if (s) said.push(s); buf = ''; };
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) { buf += n.nodeValue; return; }
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|IMG|CANVAS|VIDEO|TEMPLATE)$/i.test(n.nodeName) || n.hidden || n.classList.contains('loading')) return;
      if (n.nodeName === 'BR' || n.nodeName === 'HR') { flush(); return; }
      if (n.nodeName === 'TR') { flush(); const s = [...n.children].map(c => c.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(': '); if (s) said.push(s); return; }
      if (KC_BLOCK.test(n.nodeName)) { flush(); walk(n); return; }
      buf += ' ' + n.textContent + ' ';
    });
    flush();
  };
  walk(t.content);
  out.lines = said.length ? said.map(s => `<p class="kc-line">${esc(s)}</p>`).join('') : wait ? wait.outerHTML : '';
  out.src = t.innerHTML;
  return out;
}
/* A LATE FILLER (an apps list, a count) writes into the hidden original; its card's lines are read again from it. */
function kcFactsWatch_() {
  if (kcFactsWatch_.on || typeof MutationObserver === 'undefined' || typeof document === 'undefined' || !document.body) return;
  kcFactsWatch_.on = true;
  let busy = false;
  /* A LIFTED BUTTON TAKES ITS NEW STATE (a count, disabled) from the redrawn original, matched by what it does. */
  const sync = (card, tiles) => { const t = document.createElement('template'); t.innerHTML = tiles;
    t.content.querySelectorAll('[data-do]').forEach(n => { const old = card.querySelector(`:scope > .kc-act [data-do="${n.getAttribute('data-do')}"]`); if (old) old.replaceWith(n); }); };
  const redo = src => { const card = src.closest('.card.kc'), box = card && card.querySelector(':scope > .kc-lines'); if (!box) return;
    const f = kcFacts_(src.innerHTML); box.firstChild && [...box.children].filter(k => k !== src).forEach(k => k.remove());
    box.insertAdjacentHTML('afterbegin', f.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`);
    if (f.tiles) { src.innerHTML = f.src; sync(card, f.tiles); } };
  /* AN OLD MAKER THAT REDRAWS ITS WHOLE CARD (`[data-libimp]`) has its new insides read as facts into the parts it pushed out. */
  const rewrap = (card, gone) => { const parts = gone.filter(n => n.nodeType === 1 && /^kc-(pic|head|tags|lines|form|act)$/.test(n.className)); if (!parts.length) return;
    const f = kcFacts_(card.innerHTML), lines = parts.find(n => n.className === 'kc-lines'), form = parts.find(n => n.className === 'kc-form');
    /* CONTROLS THAT ARRIVE LATE (a list loaded after the first draw) take a form part, open, in place of the lines. */
    if (f.form && !form && lines) { lines.className = 'kc-form'; lines.innerHTML = f.form; }
    else if (f.form && form) form.innerHTML = f.form;
    else if (lines) lines.innerHTML = (f.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`) + (f.src ? `<div class="kc-src" hidden>${f.src}</div>` : '');
    card.replaceChildren(...parts); if (f.tiles) sync(card, f.tiles); };
  new MutationObserver(list => { if (busy) return; busy = true; const seen = new Set();
    try {
      list.forEach(m => { const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (el && el.matches && el.matches('.card.kc.kc-facts') && m.removedNodes.length && !el.querySelector(':scope > .kc-act')) { rewrap(el, [...m.removedNodes]); return; }
        const src = el && el.closest && el.closest('.kc-src'); if (src) seen.add(src); });
      seen.forEach(redo);
    } catch (e) { oops_(e, 'card:facts'); } finally { busy = false; } }).observe(document.body, { subtree: true, childList: true, characterData: true });
}
/* ⋯ IS A CARD'S ONLY TOGGLE (owner, 10 Nov): a wrapping row of the other round buttons, under the row. */
on('kc-more', el => { const c = el.closest('.kc-row, .tile-row'), m = c && c.querySelector('.kc-more'); if (!m) return;
  m.hidden = !m.hidden; el.setAttribute('aria-expanded', m.hidden ? 'false' : 'true'); });
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
  const parts = { pic: run(s.pic), head: run(s.title), tags: run(s.tags), lines: run(s.lines), act: '' };
  parts.pic = kcPicOr_(one, parts.pic);
  /* A PANEL (card_) IS DRAWN WHILE FIND'S OWN LIST IS BEING MADE, so it never reads Find's chips back (that would build the list inside itself). */
  parts.tags = it.kcPanel ? parts.tags : kcUnpicked_(parts.tags);
  /* A CARD WITH NO TAGS OF ITS OWN STILL HAS ONE: its name (owner, 9 Nov: the name is a tag). */
  if (!parts.tags.trim() && name) parts.tags = `<div class="qtags"><span class="qtag" data-tag="0">${esc(name)}</span></div>`;
  /* NO TITLE LINE ON ANY CARD (owner, 9 Nov): the name is a tag, put first when the tags do not already say it. */
  if (name && parts.head && !kcSays_(parts.tags, name)) parts.tags = kcTagFirst_(parts.tags, name);
  parts.head = '';
  /* A ROW OF TILES ITS OWN MAKER DREW AMONG THE LINES joins the card's one row: its main leads, the rest wait behind ⋯. */
  const hoist = kcHoist_(parts.lines, it.kcPanel);
  parts.lines = hoist.lines;
  parts.act = kcActRow_(one, it.kcPanel ? '' : parts.lines, hoist.tiles);
  /* A FACTS KIND: its lines become plain words, a form its open content. */
  let facts = null;
  if (kcLook_(it.kind).facts || (it.kcPanel && KC_FORMY.test(parts.lines))) {
    facts = kcFacts_(parts.lines);
    if (facts.form) { parts.lines = ''; parts.form = facts.form; kcFactsWatch_(); }
    else { parts.lines = (facts.lines || `<p class="kc-line kc-empty">${kcEmpty_()}</p>`) + (facts.src ? `<div class="kc-src" hidden>${facts.src}</div>` : ''); kcFactsWatch_(); }
    if (facts.tiles) parts.act = kcActRow_(one, '', hoist.tiles + facts.tiles);
    parts.tags = kcTidy_(parts.tags, '', name).tags;
  }
  if (!facts && KC_WHOLE_KINDS.indexOf(it.kind) < 0) { const tidy = kcTidy_(parts.tags, parts.lines, name); parts.tags = tidy.tags; parts.lines = tidy.lines; }
  const off = (facts ? ' kc-facts' : '') + (it.kind === 'tutor' && t.listed === false ? ' is-off' : '') + (it.cardCls ? ' ' + esc(it.cardCls) : '');
  /* `cardData` BECOMES data-* ATTRIBUTES, so a card can be found again where it stands (a post's sheet, a conversation's redraw). */
  const data = Object.keys(it.cardData || {}).map(k => ` data-${k}="${esc(it.cardData[k])}"`).join('');
  /* ITS OWN MAKER'S CLASSES AND ATTRIBUTES STAY ON IT, so every handler's `closest('.qcard')` or `[data-key]` still finds it. */
  const mine = it.kcOwn || {}, ownCls = String(mine.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' ');
  const label = /\saria-label=/.test(mine.attrs || '') ? '' : ` aria-label="${esc(name)}"`;
  return `<div class="card fc kc kc-${esc(it.kind || 'thing')}${s.cls ? ' ' + esc(s.cls) : ''}${ownCls ? ' ' + ownCls : ''}${off}"${data}${mine.attrs || ''}${label}>${
    (parts.form ? ['pic', 'head', 'tags', 'lines', 'form', 'act'] : KC_PARTS).map(p => `<div class="kc-${p}">${parts[p]}</div>`).join('')}</div>`;
}

/* EVERY OTHER CARD COMES HERE TOO (owner, 11 Nov: one template): its maker writes a plain `<div class="x">…</div>`; a form inside stays whole. Only bookform draws its own. */
const KC_FORMY = /<(input(?![^>]*type="hidden")|select|textarea|form)\b|\bkc-items\b/;
function card_(html, kind, called) {
  const cut = kcSplit_(String(html || '').trim());
  if (!cut) return String(html || '');
  /* A DRAWING THAT IS NO PICTURE (a picker, an icon) stays among the lines, never dropped from the top. */
  /* A FACE BESIDE THE HEADING (a conversation's) is the card's picture when it is a real one. */
  const face = !cut.pic && /<img\b[^>]*>/.exec(cut.head || '');
  if (face) cut.pic = face[0];
  if (cut.pic && !kcRealPic_(cut.pic)) { cut.lines = cut.pic + cut.lines; cut.pic = ''; }
  const name = String((/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/.exec(cut.head || '') || [])[1] || cut.head || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  return findCard({ kind: kind || 'panel', kcOwn: cut, kcPanel: true, name: name || String(called || '') });
}

/* A CARD WHOSE INSIDES ARRIVE LATER (a list fetched after the screen drew) is built again round them, kept as the same element so its attributes stay. */
function cardFill_(el, inner, kind) {
  if (!el || typeof document === 'undefined') return;
  const cls = [...el.classList].filter(c => !/^(card|fc|kc|kc-[\w-]+)$/.test(c)).join(' ');
  const t = document.createElement('template');
  t.innerHTML = card_(`<div class="${cls}">${inner || ''}</div>`, kind);
  const fresh = t.content.firstElementChild;
  if (!fresh) return;
  el.className = fresh.className;
  el.replaceChildren(...fresh.childNodes);
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
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }], show: true });
  go('stuff');
});


/* `on('prof-shot')` WAS HERE — a tutor's extra photograph opened across its row on a tap. Taken out
   on request (10 Oct, `findCard`): the squares are pictures, not controls. */
