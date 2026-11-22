/* @family. — cards.js ONE FILE, SPLIT. § */


/* The app STARTS at the very bottom of this file, not here. § */

/* THE FIRST SCREEN — Who. § */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE § */
/** One card. The three shapes, each carrying the class that colours its name. */
/* ---------- YOU, AS A CARD § */
/* NO `cardRow_` CALL HERE. § */
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

  return renderCard(shapeCard_('person', { kind: 'me', look: 'is-widget', name: USER.name, picture: profFace_({ kind: 'me', key: USER.personId, row: { image: face, personId: USER.personId } }),
    tags: [{ text: nameBesideHandle_(USER.name, USER.handle), colour: 0 }], body: USER.handle ? [{ type: 'text', look: 'prof-handle', text: '@' + USER.handle }] : [] }));
}

/* ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER § */
/* EACH WORD ONCE (414): "patient, driven, driven" says a trait once; the first spelling is kept, case ignored. */
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
/* ONE CHIP (a tag spec): the subject, its levels raised and each held whole so a long list breaks between levels. */
const teachChip_ = (g, main) => ({ pill: true, look: main ? 'is-main' : '', text: [{ marked: g.subject }, g.levels.length ? { levels: g.levels } : ''] });

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
  const subject = v('subject'), level = norm(v('level')) === norm(subject) ? '' : v('level'), grade = v('grade'), say = profQualSay_(p);
  const low = grade ? { marked: grade } : profQualNow_(p) ? { i: 'studying' } : null;
  if (p.kind === 'cert' || !(level || low)) return { pill: true, say, text: { marked: [subject, level, grade].filter(Boolean).join(' ') } };
  return { pill: true, look: 'prof-q', say, text: { iso: subject, sup: level ? { marked: level } : null, sub: low } };
}
/* A LONG LIST SHORTENED TO "+N" (8 Nov): the whole tutor card fits one phone screen; the rest are named in the pill's title. */
/* EVERY TAG SHOWN, never a "+N" (owner, 17 Nov). */
const profTagRow_ = (look, tags) => (tags.length ? { type: 'tags', look: 'prof-tags prof-teach ' + look, tags } : null);
/* A ROW PER LEVEL, HIGHEST FIRST (owner, 18 Nov: settings.json `levels.quals` order, `qualRank_`); each qualification its own tag, and
   within a level the subjects stay together in the order they came. Rows, like the jobs' row. */
function profQuals_(t) {
  const parts = Array.isArray(t.qualsParts) ? t.qualsParts.filter(p => p && profQualV_(p.subject)) : [];
  if (!parts.length) return [profTagRow_('prof-quals', profList_(t.quals).map(text => ({ pill: true, text })))];
  const at = {}, rows = [];
  parts.map(p => Object.assign({}, p, { level: qualLevel_(p.level) })).forEach(p => {
    const k = p.level;
    if (!at[k]) rows.push(at[k] = { rank: qualRank_(k), list: [] });
    at[k].list.push(p);
  });
  return rows.map((r, i) => [r, i]).sort((a, b) => (a[0].rank - b[0].rank) || (a[1] - b[1])).map(([r]) => {
    /* ONLY THE BEST AT THIS LEVEL (owner, 18 Nov): kinds.json `tutor.card.quals` — how many, and the one grade scale; ties keep stored order. */
    const Q = (((typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds.tutor) || {}).card || {}).quals || {}, cap = Number(Q[r.list[0].level]) || 0;
    const g = p => { const v = (Q.grades || {})[profQualV_(p.grade).toUpperCase()]; return v == null ? -1 : Number(v); };
    const list = cap ? r.list.map((p, i) => [p, i]).sort((a, b) => (g(b[0]) - g(a[0])) || (a[1] - b[1])).slice(0, cap)
      .sort((a, b) => a[1] - b[1]).map(a => a[0]) : r.list;
    const seen = {}, groups = [];
    list.forEach(p => { const k = norm(profQualV_(p.subject)); if (!seen[k]) groups.push(seen[k] = []); seen[k].push(p); });
    return profTagRow_('prof-quals', [].concat(...groups).map(profQualChip_));
  });
}

/* ---------- JOBS, CURRENT AND PAST (8 Nov): one pill a job — "Role · Where · 2019–now" — in the jobs colour. */
const profJobSay_ = j => [j.role, j.where, [j.from, j.to].filter(Boolean).join('–')].map(v => String(v || '').trim()).filter(Boolean).join(' · ');
function profJobs_(t) {
  /* ONLY THE CURRENT JOB (owner, 18 Nov): one with no end date `to`; none current, no job tag. Past jobs stay stored and editable. */
  const says = (Array.isArray(t.jobs) ? t.jobs : []).filter(j => j && !String(j.to || '').trim()).map(profJobSay_).filter(Boolean);
  return profTagRow_('prof-jobs', says.map(text => ({ pill: true, text })));
}

/* ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents` § */
function profRange_(lo, hi, one, many) {
  const a = Number(lo) || 0, b = Number(hi) || 0;
  /* NEVER A DEFAULT (owner, 17 Nov): one or more, with no top, is what everybody already assumes, so it says nothing. */
  if (a <= 1 && !b) return '';
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
  if (a == null) return b === Infinity ? text_('all-ages') : text_('ages-up-to') + b;
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

/* ---------- WHERE THEY TUTOR: every place by name, as tags. */
function profPlaces_(names) {
  return profTagRow_('prof-places', (names || []).map(text => ({ pill: true, text })));
}

/* ---------- WHEN THEY TEACH, AS THE RECEIPT'S WEEK § */
function profAvail_(t) {
  if (!t || typeof weekGrid_ !== 'function' || typeof availSet_ !== 'function') return null;
  /* ---------- NO `avail` KEY AT ALL IS NOT A TUTOR § */
  if (t.avail === undefined) return null;
  const on = availSet_(t.avail);
  const ticked = Object.keys(on);
  /* ---------- NO HOURS IS SAID, NOT LEFT BLANK § */
  if (!ticked.length) {
    return { type: 'text', look: 'prof-say prof-nohours', text: 'Hasn\u2019t set usual hours yet \u2014 ask for any hour; they accept or decline.'
      + (typeof may_ === 'function' && may_('admin') ? text_('they-tick-them-in-settings-under') : '') };
  }
  /* `busy` IS `{ m16: 'Ada' }` OFF `busyHours`, but the fixture once said `[]` and an older backend may say nothing; a list of § */
  const busy = {};
  const b = t.busy;
  if (Array.isArray(b)) b.forEach(c => { busy[norm(c)] = true; });
  else if (b && typeof b === 'object') Object.keys(b).forEach(c => { if (b[c]) busy[norm(c)] = b[c]; });
  /* THE BOOKING'S SPAN AND NOTHING WIDER. § */
  const hours = (typeof SLOT_HOURS !== 'undefined' && SLOT_HOURS.length) ? SLOT_HOURS : SHARED_SETTINGS.hours;
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
    return { type: 'text', look: 'prof-say prof-hid prof-nofree', text: text_('no-free-hours-this-week-2') + (typeof may_ === 'function' && may_('admin')
      ? text_('every-hour-they-have-ticked-is') + fmtDate_(hours[0], 'hours', hours[hours.length - 1]) + ', the hours a session can be booked at.' : '') };
  }
  /* ---------- SPANS, NOT THE RECEIPT'S DISABLED BUTTONS § */
  const hoursOn = which => days.map(d => {
    const hs = d.hours.filter(which).map(c => fmtDate_(c.h, 'hours', c.h + 1));
    return hs.length ? fmtDate_(d.label, 'day') + ' ' + hs.join(', ') : '';
  }).filter(Boolean).join('; ');
  const said = hoursOn(c => c.lit);
  /* THE TAUGHT HOURS, SAID AFTER THE FREE ONES — see the note over this function. § */
  const taught = hoursOn(c => c.busy);
  /* LINES, NOT A GRID (467) — the owner: "The tutor profile should fit on a normal phone even with lots of data." Hours in a row merge. */
  const line = which => profDaysRun_(SD.map(([p, label]) => {
    const d = days.find(x => x.label === label);
    const hs = d ? d.hours.filter(which).map(c => c.h) : [], spans = [];
    hs.forEach(h => { const l = spans[spans.length - 1]; if (l && l[1] === h) l[1] = h + 1; else spans.push([h, h + 1]); });
    /* ONE SPAN A DAY AND "+N": a choppy week stays one pill a day; `say` reads every hour. */
    return { day: fmtDate_(label, 'day'), hours: spans.length ? profSpan_(spans[0]) + (spans.length > 1 ? ' +' + (spans.length - 1) : '') : '' };
  }));
  return { type: 'hours', count: ticked.length, free: line(c => c.lit), busy: line(c => c.busy),
    say: (said ? 'Available ' + said : text_('no-free-hours-this-week')) + (taught ? '. Already teaching ' + taught : '') };
}
/* THE WEEK'S HOURS, REPEATS SAID ONCE (owner, 18 Nov) — the one rule wherever hours are listed: `week` is the seven days in order, Monday
   first, each { day, hours } ('' for none). Every day alike → "Every day …"; the five weekdays alike → "Weekdays …"; Saturday and Sunday
   alike → "Weekends …" (both may stand together); otherwise neighbouring days with the same hours run together ("Mon–Wed …"). */
function profDaysRun_(week) {
  const same = list => list.length && list[0].hours && list.every(d => d.hours === list[0].hours);
  const none = list => list.every(d => !d.hours);
  if (week.length === 7) {
    const wd = week.slice(0, 5), we = week.slice(5);
    if (same(week)) return ['Every day ' + week[0].hours];
    const W = same(wd) ? 'Weekdays ' + wd[0].hours : '', E = same(we) ? 'Weekends ' + we[0].hours : '';
    if ((W || none(wd)) && (E || none(we)) && (W || E)) return [W, E].filter(Boolean);
  }
  const out = [];
  week.forEach((d, i) => {
    const l = out[out.length - 1];
    if (d.hours && l && l.hours === d.hours && l.at === i - 1) { l.to = d.day; l.at = i; }
    else if (d.hours) out.push({ from: d.day, to: '', hours: d.hours, at: i });
  });
  return out.map(r => r.from + (r.to ? '–' + r.to : '') + ' ' + r.hours);
}
/* A BOOKING'S RUNS ({ dayName, hour, hours }) SAID BY THE SAME RULE. */
const profRunsSay_ = runs => profDaysRun_(((typeof SLOT_DAYS !== 'undefined' && SLOT_DAYS) || []).map(([, label]) => ({ day: fmtDate_(label, 'day'),
  hours: runs.filter(r => r.dayName === label).map(r => fmtDate_(r.hour, 'hours', r.hour + r.hours)).join(', ') })));
/* AN HOUR SPAN, 24-hour (owner, 8 Nov): 16:00–19:00. */
const profSpan_ = ([a, b]) => fmtDate_(a, 'hours', b);

/* WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS § */
function profSeat_(t) {
  if (!(Number(t.rate) > 0) || typeof seatShare_ !== 'function') return 0;
  const s = seatShare_(t);
  return Math.round(Number(t.rate) * (s.cUsed + s.bUsed) * 100) / 100;
}

/* A TUTOR'S RATE AS SHOWN: £first-seat–full-class/h, or one rate when they take one seat (549). Display only; priceFrom charges. */
function rateRange_(t) {
  const r = Number(t && t.rate);
  if (!(r > 0)) return '';
  const say = n => fmtMoney_(n);
  const max = Math.round(Number(t.maxStudents)) || 1, seat = profSeat_(t);
  return max > 1 && seat > 0 ? say(r) + '–' + fmtMoney_(r + seat * (max - 1), 'hour').slice(1) : fmtMoney_(r, 'hour');
}

/* ---------- THE TUTOR CARD AS A SPEC (master template): face, the name line's pills, subjects and facts, then its lines. */
/* A PERSON'S FACE (a tutor's at 96, a person's door at 160): their photo, else their avatar, else the kind's picture. */
function profFace_(x, size) {
  const t = kcRow_(x), k = typeof picKind_ === 'function' ? picKind_(t.image) : (t.image ? 'photo' : '');
  if (k === 'photo') return { src: pic(t.image), alt: '' };
  const svg = k === 'basic' && typeof pfpArt_ === 'function' ? pfpArt_(pfpChoice_(t.image), size || 96) : '';
  return { svg: svg || (typeof kcPicOr_ === 'function' ? kcPicOr_(x, '') : '') };
}
/* THE TUTOR CARD'S PIECES (one item shape): its map is ITEM_MAPS.tutor (cards-parts.js). Who sees the rate and the admin's note is the map's */
/* `childHides` and `adminOnly`, decided once as the item loads (`it.live`), never here. */
const profPill_ = (text, colour, look) => ({ pill: true, text, colour, look });
/* WHY AN UNLISTED TUTOR IS OFF THE SITE, said to an admin (the map's `adminOnly` keeps it from everyone else). */
const profNote_ = t => (t.listed === false ? (t.pending ? text_('they-ticked-tutor-in-their-settings')
  : text_('clients-cannot-see-them-the-crossed')) : '');
/* THE NAME LINE'S PILLS: their name, role and titles, the rate where `it.live` still has it, what they are doing, and why they are off. */
/* WHAT THEY ARE CALLED: their titles (a coach, the head of boxing) when they have one, else their role; staff either way (owner, 17 Nov). */
/* PLAIN "Tutor" IS NEVER SAID (owner, 17 Nov): it wastes the line; only a real title is. One rule, every role pill. */
const profRoleWords_ = t => (profList_(t.titles).length ? profList_(t.titles) : [t.role || '']).filter(v => v && !/^tutor$/i.test(String(v).trim()));
const profPills_ = (it, t) => [profPill_(fmtName_(t), 0, 'prof-tag-name')].concat(profRoleWords_(t).map(v => profPill_(v, 1)),
  'rate' in ((it.live || {}).money || {}) ? [profPill_(it.live.money.rate, 4, 'prof-tag-rate')] : [], t.activity ? [profPill_(t.activity, 3, 'prof-act')] : [],
  t.listed === false ? [profPill_(t.pending ? 'asked to tutor' : 'not listed', 9, 'prof-off')] : []);
/* SUBJECTS (main, then also) AND FACTS, a row each. */
function profTagRows_(t) {
  const main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
  return [main.length ? { look: 'prof-tags prof-teach', tags: teachGroups_(main).map(g => teachChip_(g, true)) } : null,
    also.length ? { look: 'prof-tags prof-teach', tags: teachGroups_(also).map(g => teachChip_(g, false)) } : null,
    profTagRow_('prof-facts', profFacts_(t).map(text => ({ pill: true, text })))].filter(Boolean);
}
/* ITS LINES: the note (if `it.live` kept it), the description, photos, words, qualifications, jobs, places, hours. */
function profBody_(t, L) {
  const note = ((L || {}).say || {}).note || '', words = profList_(t.tags).slice(0, 3);
  /* WHAT A PARENT ASKS FIRST, FIRST (owner, 19 Nov: "location should be at top"): where and when, then who they are, then the record. */
  return [note ? { type: 'text', look: 'prof-say prof-hid', text: note } : null,
    profPlaces_([String(t.town || '').trim()].filter(Boolean)), profAvail_(t),
    t.description ? { type: 'text', look: 'prof-say cut2', act: 'cut-open', text: t.description } : null,
    words.length ? { type: 'text', look: 'prof-words', text: words.map((v, i) => (i ? [{ i: '·' }, { b: v }] : [{ b: v }])) } : null,
    Array.isArray(t.photos) && t.photos.length ? { type: 'photos', srcs: t.photos.map(u => pic(u)), more: 4 } : null,
    profJobs_(t), ...profQuals_(t)].filter(Boolean);
}
