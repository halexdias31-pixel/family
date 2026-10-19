/* @family. — core.js ONE FILE, SPLIT. § */

/* THE RULES. Carried over whole. § */

/* The small things everything above leans on. § */

const norm = s => String(s || '').toLowerCase().trim();


const esc = s  => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* A ROW: A LABEL ON THE LEFT, A VALUE ON THE RIGHT § */
const row = (label, value, extra) => {
  const v = String(value == null ? '' : value);
  /* MONEY, A COUNT, A DATE, A PERCENTAGE — anything whose characters want to line up under one another. § */
  const looksNumeric = /^[£$€]?[\d.,\s—–-]+%?$/.test(v.trim()) || /^\d/.test(v.trim());
  const cls = ['v', looksNumeric ? 'mono' : '', extra || ''].filter(Boolean).join(' ');
  return `<div class="row"><span class="k">${esc(label)}</span>` +
         `<span class="${cls}">${esc(v)}</span></div>`;
};

/* THE SAME ROW, WITH THE VALUE ALREADY MARKED UP — a link, a coloured word, a small drawing. § */
const rowHtml = (label, html, extra) =>
  `<div class="row"><span class="k">${esc(label)}</span>` +
  `<span class="${['v', extra || ''].filter(Boolean).join(' ')}">${html}</span></div>`;

/* ---------- THE TWO SHAPES THE FIRST TWO COULD NOT MAKE § */

/* A VALUE THAT CHANGES WHILE YOU WATCH — a clock ticking down, a score going up. § */
const rowLive = (label, value, id, extra) =>
  `<div class="row"><span class="k">${esc(label)}</span>` +
  `<span class="${['v', 'mono', extra || ''].filter(Boolean).join(' ')}"` +
  ` id="${esc(id)}">${esc(String(value == null ? '' : value))}</span></div>`;

/* A ROW WITH NO LABEL — a name in a list, a line of a basket. § */
const rowValue = (html, extra) =>
  `<div class="row"><span class="${['v', extra || ''].filter(Boolean).join(' ')}">${html}</span></div>`;


function bookableSpaces() {
  const out = [];
  (DATA.venues || []).forEach(v => {
    if (v.rooms && v.rooms.length) {
      v.rooms.forEach(r => out.push({
        label: v.title + ' \u2014 ' + r.name, venue: v.title, room: r.name,
        rate: r.rate, concession: r.concession, min: r.min, max: r.max, image: v.image,
        avail: r.avail, rowIndex: r.rowIndex, fields: r.fields,
        minHours: v.minHours, maxHours: v.maxHours
      }));
    } else {
      out.push({ label: v.title, venue: v.title, room: '',
                 rate: Number(v.bestRate) || 0, concession: 0,
                 min: v.minCapacity || 1, max: v.maxCapacity, image: v.image,
                 avail: v.avail, minHours: v.minHours, maxHours: v.maxHours });
    }
  });
  return out;
}


/* ---------- THE DAYS NOBODY IS TAUGHT, AS A LOOKUP § */
let CLOSED_ = { of: null, at: {} };
function closedOn_(d) {
  const list = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.closures)) ? DATA.closures : [];
  if (CLOSED_.of !== list) {
    const at = {};
    list.forEach(c => { const x = parseDMY(c && c.date); if (x) at[x.getTime()] = c; });
    CLOSED_ = { of: list, at };
  }
  const k = new Date(d); k.setHours(0, 0, 0, 0);
  return CLOSED_.at[k.getTime()] || null;
}

/* ---------- AND THE WEEKS THEY FALL IN STILL COUNT AS WEEKS § */
function computeSessionDates(dayName, endDateStr, startDateStr) {
  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = DAYS.indexOf(String(dayName||'').toLowerCase().replace(/s$/,''));
  const end = parseDMY(endDateStr);
  if (target < 0 || !end) return [];
  const today = new Date(); today.setHours(0,0,0,0);
  const winStart = parseDMY(startDateStr);
  const d = (winStart && winStart > today) ? new Date(winStart) : new Date(today);
  while (d.getDay() !== target) d.setDate(d.getDate()+1);
  const out = [];
  while (d <= end && out.length < 60) {
    if (!closedOn_(d)) out.push(new Date(d));
    d.setDate(d.getDate()+7);
  }
  return out;
}


function activePromoFactor(ctx) {
  const promos = DATA.promotions || [];
  let factor = 1;
  promos.forEach(p => {
    if (promoApplies(p, ctx)) factor *= (parseFloat(p.value) || 1);
  });
  return factor;
}


const fmtTime = t => {
  let s = String(t ?? '').trim();
  if (!s) return '';
  let h, min;
  const m = s.match(/(\d{1,2}):(\d{2})/);            // HH:MM anywhere in the string
  if (m) { h = +m[1]; min = +m[2]; }
  else {
    const d = new Date(s);
    if (isNaN(d)) return s;
    h = d.getHours(); min = d.getMinutes();
  }
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return min ? `${h12}:${String(min).padStart(2,'0')}${ampm}` : `${h12}${ampm}`;
};

const ST = {
  UNSENT:    'Unsent',      // built, not yet sent to anyone
  REQUESTED: 'Requested',   // sent; waiting for the other side
  WAITING:   'Waiting',     // in the lobby, hasn't readied up
  AGREED:    'Agreed',      // readied up; waiting on everyone else
  PAYING:    'Paying',      // terms settled, payment in flight
  BOOKED:    'Booked',      // paid and in the diary
  CONFIRMED: 'Confirmed',   // a session that has happened
  DECLINED:  'Declined',    // the other side said no
  CANCELLED: 'Cancelled',   // called off after being booked
};

const ROLE = { ADMIN: 'admin', TUTOR: 'tutor', CLIENT: 'client', STUDENT: 'student' };

const ROLE_ALIASES = {
  admin: ROLE.ADMIN, administrator: ROLE.ADMIN,
  tutor: ROLE.TUTOR, teacher: ROLE.TUTOR,
  client: ROLE.CLIENT, parent: ROLE.CLIENT, guardian: ROLE.CLIENT,
  student: ROLE.STUDENT, kid: ROLE.STUDENT, child: ROLE.STUDENT, pupil: ROLE.STUDENT,
};


const roleOf = r => ROLE_ALIASES[norm(r)] || norm(r);


const isRole = (r, want) => roleOf(r) === want;


const heldRoles = () => (USER && (USER.roles || [USER.role]) || []).map(x => String(x).toLowerCase());


const hasRole = r => heldRoles().some(h => roleOf(h) === roleOf(r));


const uniq = arr => [...new Set((arr||[]).filter(Boolean))];


const hashOf = str => {                       // FNV-1a: small, fast, well-spread
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};


function parseDMY(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  let d;
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; d = new Date(+y, +m[2] - 1, +m[1]); }
  else { d = new Date(s); }
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}


const fmtDate = v => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
};


function num(raw) {
  if (typeof raw === 'number') return raw;
  const t = String(raw == null ? '' : raw).trim().replace(/[£$,\s]/g, '');
  if (!t) return NaN;
  const frac = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (frac) { const den = parseFloat(frac[2]); return den === 0 ? NaN : parseFloat(frac[1]) / den; }
  if (t.endsWith('%')) { const p = parseFloat(t); return isNaN(p) ? NaN : p / 100; }
  return parseFloat(t);
}


function spaceFor(label) {
  const want = norm(label);
  return bookableSpaces().find(x => norm(x.label) === want) || null;
}


/* THE CLIENT'S OWN HOUSE, by name — see the note over `seatLimits` for why this is not `isHome`. */
function atClientHome_(loc) {
  return /\b(home|house|client\s*(house|home|place)|your venue)\b/i.test(String(loc || ''));
}

function isHome(loc) {
  const name = String(loc || '');
  if (/\b(home|house|client\s*(house|home|place)|your venue)\b/i.test(name)) return true;
  const sp = (typeof spaceFor === 'function') ? spaceFor(name) : null;
  if (sp) return !(Number(sp.rate) > 0);
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(name));
  return !!v && !(Number(v.bestRate) > 0);
}


/* ---------- AND A THIRD THING BOUNDS A SEAT COUNT: WHERE THE SESSION IS § */
function seatLimits(space, tutor, loc) {
  const v = (DATA.constants || {}).vars || {};
  const houseMax = Number(v.max_students_per_job) || 0;
  /* A CELL WITH A CODE FALLBACK, which is this app's pattern for every editorial number — the `brand(k, or)` argument. § */
  const homeMin = Number(v.min_seats_at_home) || 4;

  let max = 99, min = 1;
  const why = { max: '', min: '' };
  const capMax = (n, reason) => { if (n > 0 && n < max) { max = n; why.max = reason; } };
  const capMin = (n, reason) => { if (n > 0 && n > min) { min = n; why.min = reason; } };

  if (space)  { capMax(Number(space.max), space.label || 'this venue');
                capMin(Number(space.min), space.label || 'this venue'); }
  if (tutor)  { capMax(Number(tutor.maxStudents), tutor.title);
                capMin(Number(tutor.minStudents), tutor.title); }
  capMax(houseMax, 'your limit');
  if (loc && atClientHome_(loc)) capMin(homeMin, 'a session at your own home');

  return { max, min, why };
}



/* THE EIGHT THAT WERE NEVER CARRIED OVER. § */

/* R is the hourly rate, and it is the tutor's own. § */
const OPEN_RATE = 10;

/* One word for "nothing chosen yet", everywhere. The form had four — "Choose ⌄", "All Levels", an
   empty option and "No preference" — which read as four different states rather than one. */
const NONE_LABEL = '\u2014\u2014\u2014';

/** The value of an input by id, or ''. Reads a control that may not be on screen without throwing. */
const val = id => ($(id) || {}).value || '';

/* Who takes part in the checklist and the arcade: students, tutors and admins. A parent has no
   topics to tick and no score to keep. */
const canTrack = () => hasRole('kid') || hasRole('student') || hasRole('tutor') || hasRole('admin');

/* An admin is a tutor with extra powers, so everywhere gated on "tutor" admits an admin too. § */
/* AND NOT A TUTOR WHO HAS ONLY TICKED THE BOX. § */
const tutorHeld_ = () => hasRole('tutor');
const isTutorRole = () => (tutorHeld_() && !(USER && USER.tutorPending)) || hasRole('admin');

/* THE FOUR WORDS A JOB'S STATUS CAN BE, and nothing else. § */
const JOB_STATUSES = ['Unsent', 'Unconfirmed', 'Active', 'Cancelled'];
/* `jobStatus` was here — a booking's status worked out on the phone. § */


/* DOES THIS PROMOTION APPLY to this booking? § */
function promoApplies(p, ctx) {
  if (!p || !p.active) return false;
  switch (String(p.type || '').toLowerCase()) {
    case 'bulk':          return ctx.lessonCount >= (parseFloat(p.threshold) || 999);
    case 'multi_student': return ctx.n           >= (parseFloat(p.threshold) || 999);
    case 'long_term':     return ctx.weeks       >= (parseFloat(p.threshold) || 999);
    default: return false;
  }
}

/* THE RUNNING TOTAL after a given row has applied. § */
function runningAfter(key, L) {
  let p = L.chargeRate || 0;
  const step = { subject: L.avgSubject, complexity: L.fSubjectCount,
                 level: L.L, students: L.fChildrenAll };
  for (const k of ['base', 'subject', 'complexity', 'level', 'students']) {
    if (k !== 'base') p *= Number(step[k]) || 1;
    if (k === key) return p;
  }
  /* The venue always ADDS its rate and hosting TAKES IT BACK on the row below. § */
  p += (L.venueRate || 0);
  if (key === 'venue') return p;
  if (L.hosting) p -= (L.venueRate || 0);
  if (key === 'host') return p;
  p *= (L.hoursPerWeek || 0) || 1;
  if (key === 'hoursweek') return p;
  /* WEEKS, not dates. Hours-a-week already spans every day ticked, so multiplying by the date
     count — which is days × weeks — would count the days a second time. */
  p *= (L.weeksBooked || 0) || 1;
  if (key === 'term') return p;
  p /= (L.splitShares || 1);
  return p;
}

/* ---------- ONE READER FOR THE SUBJECT MULTIPLIERS § */
function subjectMult(name) {
  const m = DATA.multipliers || {};
  const table = m.subjects || m.subjectsEta || {};
  const q = num(table[name]);
  return (isNaN(q) || q <= 0) ? 1 : q;
}

/* ---------- AND ONE READER FOR THE LEVEL MULTIPLIERS § */
function levelMult(name) {
  const q = num(((DATA.multipliers || {}).levels || {})[name]);
  return (isNaN(q) || q <= 0) ? 1 : q;
}

/* WHETHER A LEVEL HAS ACTUALLY BEEN PRICED, which `levelMult` cannot say — it answers 1 for a level set to 1 on purpose and 1 for a level nobody has ever § */
function levelPriced(name) {
  const t = (DATA.multipliers || {}).levels || {};
  return Object.prototype.hasOwnProperty.call(t, name) && String(t[name]).trim() !== '';
}

/* ---------- WHAT ONE EXTRA SEAT ADDS, AS A FRACTION OF THE RATE § */
function seatShare_(tutorRow, c, B) {
  const v = ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
  const cv = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  if (c === undefined) c = cv('c', 'extra child rate', 'extra_child_rate');
  if (B === undefined) B = cv('B', 'boss rate', 'boss_rate');
  const asFraction = (x, fallback) => (x > 0 && x <= 2) ? x : fallback;
  const seatOwn = !!tutorRow && Number(tutorRow.extraSeat) > 0;
  const cRaw = seatOwn ? Number(tutorRow.extraSeat) : c;
  const own = tutorRow ? seatCutOf_(tutorRow.extraSeatCut) : NaN;
  const cutOwn = !isNaN(own);
  const bRaw = cutOwn ? own : B;
  return { cRaw, bRaw, seatOwn, cutOwn, cUsed: asFraction(cRaw, 0), bUsed: asFraction(bRaw, 0) };
}
/* ---------- A TUTOR'S OWN CUT, READ THE ONE WAY THE SERVER SENDS IT (`seatCutOut_`, people.gs) § */
function seatCutOf_(v) {
  const s = typeof v === 'number' ? String(v) : String(v == null ? '' : v).trim();
  if (!/^\d*\.?\d+$/.test(s)) return NaN;
  const x = Number(s);
  return x <= 2 ? x : NaN;
}

/* ---------- WHAT KIND OF SESSION, AND WHAT IT BRINGS WITH IT (docs/history/353) § */
const BOOK_FORMATS = ['Tutoring', 'Practical', 'Trip'];
function bookFormat_(v) {
  const k = norm(v);
  return BOOK_FORMATS.find(f => norm(f) === k) || 'Tutoring';
}
/* BY ID OR BY NAME, because the form's dropdown holds the name a person reads and the job keeps the id
   a sheet can join on. The first row that answers wins; nothing found is null, never a made-up row. */
function bookPractical_(v) {
  const k = norm(v);
  if (!k) return null;
  return ((typeof DATA !== 'undefined' && DATA && DATA.practicals) || [])
    .find(p => norm(p.id) === k || norm(p.name) === k) || null;
}
function bookTrip_(v) {
  const k = norm(v);
  if (!k) return null;
  return ((typeof DATA !== 'undefined' && DATA && DATA.trips) || [])
    .find(t => norm(t.tripId) === k || norm(t.name) === k) || null;
}
/* ---------- THE ONE SUM FROM CHARGED TO NET § */
function bookMoney_(m) {
  m = m || {};
  const pos = x => { const v = Number(x); return isFinite(v) && v > 0 ? v : 0; };
  const runs = pos(m.sessions), n = Math.max(1, pos(m.n) || 1);
  const markup = pos(m.markup) || 1;
  const pr = m.practical || null, tr = m.trip || null;
  const materialsCost = pr && runs ? pos(pr.costPerRun) * n * runs + pos(pr.setupCost) : 0;
  const materialsCharge = materialsCost * markup;
  const tickets = tr && runs ? (pos(tr.ticketChild) * n + pos(tr.ticketAdult)) * runs : 0;
  const travel = tr && runs ? pos(tr.travelPerChild) * n * runs : 0;
  const teaching = pos(m.tutorPay) + pos(m.profit);
  const venue = pos(m.venue);
  const gross = teaching + venue + materialsCharge + tickets + travel;
  const d = m.discount || {};
  const discountType = d.type === '%' ? '%' : (d.type === '£' ? '£' : '');
  const discountValue = discountType ? pos(d.value) : 0;
  const discount = !discountValue ? 0
    : discountType === '%' ? teaching * Math.min(discountValue, 100) / 100
    : Math.min(discountValue, gross);
  const shared = /^shared/i.test(String(d.by || ''));
  const scale = shared && teaching > 0 ? 1 - Math.min(discount, teaching) / teaching : 1;
  const tutorPayout = pos(m.tutorPay) * scale;
  const charged = gross - discount;
  const cardFees = charged > 0 ? charged * pos(m.feePct) / 100 + pos(m.feeFixed) : 0;
  const ticketsCost = tickets + travel;
  const net = charged - tutorPayout - venue - materialsCost - ticketsCost - cardFees;
  return {
    gross, discount, discountType, discountValue, discountCode: String(d.code || ''),
    absorbedBy: discount ? (shared ? 'Shared with tutor' : 'Business') : '',
    charged, teaching, tutorPayout, venue, materialsCharge, materialsCost,
    tickets, travel, ticketsCost, cardFees, net, margin: charged > 0 ? net / charged : 0,
    /* A PRACTICAL NOBODY HAS COSTED is not free kit: 65 of the 82 rows have no cost_per_run_gbp, and
       the Money block says "not costed" rather than printing £0.00 as though it were a price. */
    uncosted: !!pr && (pr.costPerRun == null || pr.costPerRun === ''),
  };
}

function priceFrom(spec) {
  spec = spec || {};
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
  /* A SURCHARGE IS A MULTIPLIER, so the neutral value is 1. § */
  /* LEVELS GO THROUGH `levelMult`, which is this same rule lifted out so the subject cards and the level cards can ask the question too. § */
  const sur = (group, value) => {
    if (group === 'levels') return levelMult(value);
    const x = num((m[group] || {})[value]);
    return (isNaN(x) || x <= 0) ? 1 : x;
  };

  const subjects = spec.subjects || [];
  const n = Math.max(1, parseInt(spec.n) || 1);
  const weeks = parseFloat(spec.weeks) || 1;
  const interval = spec.interval || '';
  const endDate = spec.endDate || '';
  const startDate = spec.startDate || '';
  const lastSun = spec.lastSun || endDate;
  const loc = spec.loc || '';
  const day = spec.day || '';
  const time = spec.time || '';
  const level = spec.level || '';
  const tutor = spec.tutor || '';
  const splitOthers = parseInt(spec.splitOthers) || 0;
  const i = spec.i;
  const hosting = spec.hosting;

  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(loc));
  // "I'll host the venue" — the client provides the space (or it's their home), so they don't
  // pay venue rent. Auto-on and locked for a home venue. When hosting, the V term drops to 0.
  // A room's own rate wins over the building's — a small room and a large one at Richmond are
  // different prices, and the venue's single figure could only ever be right for one of them.
  const space = spaceFor(loc);
  const venueRate = space ? space.rate : (venue ? (parseFloat(venue.bestRate) || 0) : 0);
  /* A TRIP HAS NO ROOM TO HIRE (docs/history/353): § */
  const format = bookFormat_(spec.format);
  const V = (hosting || format === 'Trip') ? 0 : venueRate;

  /* THE PRICING FORMULA ================== P = § */

  /* THE PER-HOUR MULTIPLIERS. § */
  // What the tutor is paid per hour. Each tutor row carries its own `constant`; the row named
  // "No preference" holds the default, so switching the default is a sheet edit, not a code
  // change. Only if no tutor (and no such row) resolves do we fall back to the M variable.
  /* WHAT THE CLIENT PAYS PER HOUR, before any multiplier. § */
  // Two ways to book, two rates:
  //   a named tutor  -> that tutor's own rate_per_hour
  //   No preference  -> the `open_rate` in config
  // open_rate falls back to the HIGHEST rate any tutor charges, because whoever ends up taking an
  // open job has to be covered by the price already agreed. Set it below the dearest tutor and the
  // difference comes out of your margin every time they're the one who applies.
  const tutorRow = tutor ? (DATA.tutors || []).find(t => norm(t.title) === norm(tutor)) : null;
  const tutorRate = Number(tutorRow && tutorRow.rate) || 0;
  // Named tutor: their own charge-out rate. No preference: the open rate, which is fixed because a
  // job nobody has claimed can't be priced on the rate of a tutor who hasn't taken it yet.
  const chargeRate = tutorRate > 0 ? tutorRate : OPEN_RATE;
  const usingTutorRate = tutorRate > 0;
  const M = tutorRate || cv('M', 'minimum wage', 'min wage', 'μ', 'mu');   // tutor's £/hr
  const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');  // wage multiplier (default 1)
  const L = sur('levels', level);   // level multiplier: 1.1 is "10% more", whoever teaches it
  /* With several days and times in one booking, the DEAREST applies. Averaging would let a cheap
     Monday offset a Sunday, so a booking that includes the expensive slot would cost less than one
     that is only the expensive slot. */
  const worstOf = (group, csv) => String(csv || '').split(',').map(x => x.trim()).filter(Boolean)
    /* Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the patch that hid this fault for days and times, and a patch that is no § */
    .reduce((hi, one) => Math.max(hi, sur(group, one)), 1);
  const D = worstOf('days',  day);
  const T = worstOf('times', time);

  // Subjects: the AVERAGE of the chosen subjects' multipliers — so a pricey subject among three
  // exerts only a third of its pull. (Σ Sᵢ)/k, written out.
  const subjAdds = subjects.map(subjectMult);
  const k = Math.max(1, subjAdds.length);                       // k = subject count
  // The mean of the chosen subjects' multipliers: Maths at 1.0 and Physics at 1.2 gives 1.1, so a
  // dear subject among three carries a third of its weight. No subjects chosen means no effect.
  const avgSubject = subjAdds.length ? subjAdds.reduce((x, y) => x + y, 0) / k : 1;

  // --- Rates (0 switches the effect off) ---
  const s = cv('s', 'subject count rate', 'subject_count_rate');  // 1 + s(k−1)
  const c = cv('c', 'extra child rate', 'extra_child_rate');      // tutor's share of each extra child
  const B = cv('B', 'boss rate', 'boss_rate');                    // the DEFAULT cut, for a tutor whose own is blank
  const b = cv('b', 'bulk discount rate', 'bulk_discount_rate');  // 1 − b(W−1)
  const a = cv('a', 'advance booking rate', 'early booking rate');// 1 − a(A−1)

  /* No fallback. An unchosen length is 0, not the configured default — a default here put 'x 2 hrs' on the card beside a control still reading '———', which is the § */
  const h = num(spec.hours) > 0 ? num(spec.hours) : 0;

  /* The ACTUAL sessions that will run, across EVERY run in the booking. § */
  const runList = spec.runs && spec.runs.length ? spec.runs
    : String(day || '').split(',').map(x => x.trim()).filter(Boolean).map(d => ({ dayName: d }));
  const DAY_FROM_PREFIX = { m:'Monday', tu:'Tuesday', w:'Wednesday', th:'Thursday',
                            f:'Friday', sa:'Saturday', su:'Sunday' };
  /* One date per DAY, not per run. § */
  const bookedDays = [...new Set(runList
    .map(r => r.dayName || DAY_FROM_PREFIX[r.day] || '')
    .filter(Boolean))];
  /* ---------- ONE WINDOW PER TERM, NOT ONE ACROSS ALL OF THEM § */
  const windows = (spec.windows && spec.windows.length) ? spec.windows
                                                        : [{ startDate: startDate, lastSun: lastSun }];
  const seenDay = {};
  const sessionDates = bookedDays
    .map(d => windows
      .map(w => computeSessionDates(d, w.lastSun || w.endDate, w.startDate))
      .reduce((all, list) => all.concat(list), []))
    .reduce((all, list) => all.concat(list), [])
    .filter(dt => { const k = dt.getTime(); if (seenDay[k]) return false; seenDay[k] = 1; return true; })
    .sort((a, b) => a - b);
  // A live job already knows how many sessions it runs; only a fresh booking derives them
  // from the term window. spec.slots lets a job card price itself without a term dropdown.
  /* Sessions come from the actual dates. § */
  const slots = spec.slots || sessionDates.length || 0;
  const weeksLeft = interval ? (parseFloat(spec.weeks) || 0) : 0;
  const W = slots;                             // bill by real sessions, not raw week count
  const firstDate = sessionDates[0] || null;
  const A = firstDate ? Math.max(0, Math.floor((firstDate - new Date()) / (7 * 864e5))) : 0;

  // --- The parts ------------------------------------------------------------------------------
  // Subjects and seats are FRACTIONS of the base rate, not flat amounts. A flat £5 for a second
  // seat means 36% more on a £14 tutor and 20% more on a £25 one — the same number meaning two
  // different things, and needing re-tuning every time a rate moves. As a fraction it holds its
  // meaning: 0.4 is "an extra seat costs 40% of the first", whoever is teaching.
  //
  // Both sit INSIDE the discount brackets, so a long booking discounts the extra seats too.
  // The venue stays outside: room hire doesn't change with how many people are in the room.
  // Everything in the hourly bracket is now a multiplier. One kind of thing instead of two: a
  // surcharge no longer has to be re-tuned when a tutor's rate moves, because 1.1 means "10% more"
  // whoever is teaching, where £1 meant 3.6% on one rate and 2.0% on another.
  const baseHourly = chargeRate * avgSubject * L * D * T;
  const fSubjects  = 1 + s * (k - 1);                     // each extra subject adds a fraction
  /* The tutor's own extra-seat fraction when they've set one, the config default otherwise. § */
  /* A per-seat share is a FRACTION of the rate: § */
  const { cRaw, bRaw, cutOwn, cUsed, bUsed } = seatShare_(tutorRow, c, B);
  // Which one won, for the admin view. A silent fallback and a read value look the same on a card.
  // The cut is named by where it came from too: the tutor's own, or the config default.
  const ignored = [];
  if (cRaw > 2) ignored.push(`c ${cRaw}`);
  if (bRaw > 2 || bRaw < 0) ignored.push(cutOwn ? `their cut ${bRaw}` : `B ${bRaw}`);
  const seatSource = ignored.length
    ? `ignoring ${ignored.join(' and ')} — not fractions`
    : ((tutorRow && Number(tutorRow.extraSeat) > 0) ? `tutor ${cUsed}` : `config ${cUsed}`)
      + (cutOwn ? ` + their cut ${bUsed}` : ` + B ${bUsed}`);
  const fSeats     = 1 + (cUsed + bUsed) * (n - 1);
  /* Both discounts count units BEYOND the first: § */
  /* Three discounts, all counting units BEYOND the first, all clamped at zero — a discount that goes negative becomes a surcharge, which is how booking for this § */
  /* Both neutral. The coefficients are still read from config so nothing downstream breaks, but
     they don't move the price while there's no row on the card to say they did. */
  const fBulk      = 1;
  const fAdvance   = 1;
  /* A block discount — cheaper per hour for a longer unbroken session — was asked for and isn't here, deliberately. § */
  const discountFactor = fBulk * fAdvance;
  const discountFloored = false;
  const F = 0;

  // Kept under their old names so nothing downstream had to change.
  const perChildHourly = baseHourly;
  const R = baseHourly * fSubjects;
  const addSubjects = R - baseHourly;                      // what the extra subjects added, in £
  const addChildren = R * (fSeats - 1);                    // what the extra seats added, in £
  const fSubjectCount = fSubjects, fChildrenAll = fSeats;

  const promoAdj = activePromoFactor({ subjects, n, weeks: W, day, time, level,
                                       lessonCount: spec.lessonCount || 1 });

  /* Hours a week, times weeks. Simpler and truer than sessions x session-length: a booking with
     Monday 1-3 and Tuesday 10-11 has two sessions of different lengths, which the old pair of
     numbers could not express at all. */
  /* Weeks the booking runs for. Sessions divided by runs-per-week — a Monday-and-Tuesday booking
     over 11 weeks has 22 sessions but runs for 11 weeks, and hours-a-week must multiply the
     second, not the first. */
  // Days a week, not blocks a week — for the same reason the dates are per day.
  const runsPerWeek = Math.max(1, bookedDays.length || 1);
  /* ---------- BILLED BY THE SESSIONS THAT EXIST, NOT THE WEEKS THAT REMAIN § */
  const weeksBooked = sessionDates.length
    ? Math.max(1, Math.round(sessionDates.length / runsPerWeek))
    : (slots ? Math.round(slots / runsPerWeek) : 0);
  const hoursTotal = (num(spec.hoursPerWeek) || 0) * weeksBooked;
  /* The per-hour figure is real as soon as a rate is known — it does not need a length or a term. § */
  /* SPLITTING DIVIDES BOTH FIGURES. § */
  const splitShares = splitOthers + 1;
  const chargePerHour = (R * fSeats * discountFactor * promoAdj + V) / splitShares;
  const teachTotal = hoursTotal ? chargePerHour * hoursTotal : null;

  // The three shares. They must add up to exactly what the client pays, so each is derived from
  // the same numbers rather than computed independently:
  //   the tutor is paid their own rate plus every teaching surcharge
  //   your margin is the markup M(w−1)
  //   the extra-seat money is split between you by the ratio of c to B
  const seatExtraPerHour = R * (fSeats - 1) * discountFactor * promoAdj;
  const cbTotal = (cUsed + bUsed) || 1;                            // no divide-by-zero when both are 0
  /* The tutor is paid their own rate, with every surcharge that belongs to teaching — subject, level, day, time. § */
  const tutorBase = (chargeRate * avgSubject * L * D * T) * fSubjects * discountFactor * promoAdj;
  const yourBase  = 0;

  const tutorPay    = (tutorBase + seatExtraPerHour * (cUsed / cbTotal)) * hoursTotal;
  const profitTotal = (seatExtraPerHour * (bUsed / cbTotal)) * hoursTotal;
  const venueTotal  = V * hoursTotal;                                   // venue gets
  const cost        = tutorPay + venueTotal;                            // what the job costs us

  // The tutor's effective £/hour — surfaced so you can SEE if discounts push it under minimum
  // wage (the formula doesn't silently clamp it; this just makes the number visible).
  const tutorHourly = hoursTotal ? tutorPay / hoursTotal : 0;
  const belowMinWage = M > 0 && tutorHourly > 0 && tutorHourly < M;

  // The whole booking, before it's divided — what the tutor and the venue are actually paid,
  // which is a different question from what one family hands over.
  /* ---------- WHAT THE BOOKING EARNS, AFTER EVERYTHING IT COSTS (docs/history/353) § */
  const mo = bookMoney_({
    hours: hoursTotal, sessions: hoursTotal ? Math.max(1, slots || 0) : 0, n, format,
    practical: format === 'Practical' ? bookPractical_(spec.practical) : null,
    trip: format === 'Trip' ? bookTrip_(spec.trip) : null,
    tutorPay, profit: profitTotal, venue: venueTotal,
    discount: spec.discount || null,
    markup: cvD('materials_markup', 1), feePct: cvD('card_fee_pct', 0), feeFixed: cvD('card_fee_fixed', 0),
  });
  /* THE TOTAL IS THE CHARGED FIGURE NOW, still per family. § */
  const total = teachTotal === null ? null : mo.charged / splitShares;
  const wholeTotal = total === null ? null : mo.charged;
  const shareAmount = total;
  return {
    i, total, weeks, slots, n, V, loc, day, time, level, subjects, tutor, interval, endDate, startDate, lastSun,
    // True once we know the real dates; a term-based estimate still shows, marked as provisional.
    slotsKnown: spec.slotsKnown !== false && slots > 0,
    // Weeks remaining in the chosen interval — reportable, never counted from.
    weeksLeft,
    provisional: !sessionDates.length && slots > 0,
    runs: runList,
    // What the venue WOULD cost. V is zero when hosting, so without this the saving can't be shown.
    venueRate, hosting, seatSource,
    hoursPerWeek: num(spec.hoursPerWeek) || 0, weeksBooked,
    // The two discount factors, so the card can show them as their own rows rather than folding
    // them silently into the total.
    fBulk, fAdvance, A,
    // The headline rate actually in play: this tutor's, or the open rate. The Tuition row shows it,
    // and showing anything else is how an edited rate appeared to have no effect.
    chargeRate,
    // The real dates this booking runs on. These ARE the billing basis — slots is their count —
    // so showing them is showing the client exactly what they're paying for, not a summary of it.
    sessionDates, firstDate,
    // every factor exposed so the breakdown can explain the price
    M, wMul, L, D, T, avgSubject, k, s, c, B, b, a, h, A, W,
    usingTutorRate,
    perChildHourly, addSubjects, addChildren, fSubjectCount, fChildrenAll, fBulk, fAdvance,
    discountFactor, discountFloored, F, R,
    chargePerHour, hoursTotal, tutorPay, venueTotal, cost, tutorHourly, belowMinWage,
    promoAdj, splitOthers, splitShares, shareAmount, profitTotal, wholeTotal,
    // THE MONEY BLOCK'S FIGURES, whole-booking — see `bookMoney_`. Only an admin's screen draws them.
    format, earn: mo,
    summary: { service: (typeof document !== 'undefined' ? val('c-service') : ''), level,
               subject: subjects.join(', '), location: loc, day, time, students: n,
               interval, weeks, requestedTutor: tutor }
  };
}