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

/* ---------- WHERE THEY TUTOR: every place by name, as tags. */
function profPlaces_(names) {
  return names && names.length ? `<div class="qtags prof-tags prof-teach prof-places">${PROF_MORE_(names.map(n => `<span class="prof-tag">${esc(n)}</span>`), 3, names).join('')}</div>` : '';
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
  const hours = (typeof SLOT_HOURS !== 'undefined' && SLOT_HOURS.length) ? SLOT_HOURS : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
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
