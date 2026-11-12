/* @family. — core.js ONE FILE, SPLIT. § */

/* THE RULES. Carried over whole. § */

/* The small things everything above leans on. § */

const norm = s => String(s || '').toLowerCase().trim();

/* EVERY FILE OF OUR OWN IS ASKED FOR WITH THE DEPLOY'S STAMP (546): the browser keeps an exact URL for a while, */
/* so an unstamped one would never refresh after a deploy. `check-cache.js` holds every fetch to it. */
const deployStamp_ = () => (window.LOAD ? '?t=' + window.LOAD : '');


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
const rowHtml = (label, html, extra, rowCls) =>
  `<div class="row${rowCls ? ' ' + rowCls : ''}"><span class="k">${esc(label)}</span>` +
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
        avail: r.avail, busy: r.busy || {}, rowIndex: r.rowIndex, fields: r.fields,
        minHours: v.minHours, maxHours: v.maxHours, takesAllSeats: !!v.takesAllSeats
      }));
    } else {
      out.push({ label: v.title, venue: v.title, room: '',
                 rate: Number(v.bestRate) || 0, concession: 0,
                 min: v.minCapacity || 1, max: v.maxCapacity, image: v.image,
                 avail: v.avail, minHours: v.minHours, maxHours: v.maxHours,
                 takesAllSeats: !!v.takesAllSeats });
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


/* FORMATS (owner, 8 Nov): one helper each, and check-format fails on a hand-formatted value. Times are 24-hour: 16:00. */
const time_ = t => {
  if (t instanceof Date || typeof t === 'number') { const d = new Date(t); return isNaN(d) ? '' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  const s = String(t ?? '').trim();
  if (!s) return '';
  let h, min;
  const m = s.match(/(\d{1,2}):(\d{2})\s*([ap]m)?/i);
  const a = m ? null : s.match(/^(\d{1,2})\s*([ap]m)$/i);
  if (m) { h = +m[1]; min = +m[2]; if (m[3]) h = h % 12 + (/p/i.test(m[3]) ? 12 : 0); }
  else if (a) { h = +a[1] % 12 + (/p/i.test(a[2]) ? 12 : 0); min = 0; }
  else { const d = new Date(s); if (isNaN(d)) return s; h = d.getHours(); min = d.getMinutes(); }
  return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
};
/* A VALUE THAT IS MISSING READS "—" (owner 65a, 9 Nov), the one way; 0 is a value and shows. */
/* A CANVAS PAINTS IN THE THEME'S OWN TOKENS (owner, 10 Nov): `token_('--bg', 'black')`; the keyword is only for a page whose css never came. */
function token_(name, or) {
  try { return String(getComputedStyle(document.documentElement).getPropertyValue(name) || '').trim() || or; } catch (e) { return or; }
}
const dash_ = v => (v === undefined || v === null || String(v).trim() === '' ? '—' : v);
/* A whole-hour span, 24-hour: 09:00–10:00. */
const hours_ = (a, b) => time_(a + ':00') + '–' + time_(b + ':00');
/* Money always with pence: £12.00, and a minus sign before the pound. */
const money_ = n => { const v = Number(n) || 0; return (v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(2); };
/* A RATE IS PER HOUR, £12.00/h (owner 70a, 9 Nov); a total stays a plain money_. */
const perHour_ = n => money_(n) + '/h';
/* Days of the week, short, Monday first: Mon Tue Wed Thu Fri Sat Sun. */
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const day_ = v => {
  if (v instanceof Date) return isNaN(v) ? '' : DAYS_SHORT[(v.getDay() + 6) % 7];
  const s = String(v ?? '').trim().toLowerCase();
  const pre = { m: 0, tu: 1, w: 2, th: 3, f: 4, sa: 5, su: 6 };
  if (s in pre) return DAYS_SHORT[pre[s]];
  const i = DAYS_SHORT.findIndex(d => s.slice(0, 3) === d.toLowerCase());
  return i === -1 ? String(v ?? '') : DAYS_SHORT[i];
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

/* THE ROLE WORDS ARE THE BACKEND'S `ROLE_ALIASES` (constants.gs), sent as `roleAliases`; this copy stands until the payload lands (check-payload). */
const ROLE_ALIASES = { administrator: 'admin', teacher: 'tutor', parent: 'client', guardian: 'client',
                       kid: 'student', child: 'student', pupil: 'student' };
const roleAliases_ = () => { try { return (DATA && DATA.roleAliases) || ROLE_ALIASES; } catch (e) { return ROLE_ALIASES; } };

const roleOf = r => roleAliases_()[norm(r)] || norm(r);


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


/* Dates always DD/MM/YY (08/11/26), from a Date, ms, ISO or an already-British string. */
const date_ = v => {
  if (v instanceof Date || typeof v === 'number') { const d = new Date(v); return isNaN(d) ? '' : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`; }
  const s = String(v ?? '').trim();
  if (!s) return '';
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[3].padStart(2,'0')}/${iso[2].padStart(2,'0')}/${iso[1].slice(-2)}`;
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  return isNaN(d) ? s : date_(d);
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
  const all = bookableSpaces();
  /* An older saved "At home" answer is the venue row marked `takes_all_seats`, found by its field. */
  if (want === norm('At home')) return all.find(x => x.takesAllSeats) || null;
  return all.find(x => norm(x.label) === want) || null;
}


/* A VENUE WHOSE ROW SAYS `takes_all_seats` (owner, 8 Nov: the client's house): a field, never a name — same as `takesAllSeats_` in booking.gs. */
function takesAllSeats_(loc) {
  const want = norm(loc || '');
  if (!want) return false;
  const sp = spaceFor(loc);
  if (sp) return !!sp.takesAllSeats;
  const v = (DATA.venues || []).find(x => norm(x.title) === want);
  return !!(v && v.takesAllSeats);
}

function isHome(loc) {
  const name = String(loc || '');
  if (takesAllSeats_(name)) return true;
  /* A CHILD IS SENT NO RATES (398), so "no rate" is not "a home" to her phone. */
  if (childView_()) return false;
  const sp = (typeof spaceFor === 'function') ? spaceFor(name) : null;
  if (sp) return !(Number(sp.rate) > 0);
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(name));
  return !!v && !(Number(v.bestRate) > 0);
}


/* ---------- AND A THIRD THING BOUNDS A SEAT COUNT: WHERE THE SESSION IS § */
function seatLimits(space, tutor, loc) {
  const v = (DATA.constants || {}).vars || {};
  const houseMax = Number(v.max_students_per_job) || 0;

  let max = 99, min = 1;
  const why = { max: '', min: '' };
  const capMax = (n, reason) => { if (n > 0 && n < max) { max = n; why.max = reason; } };
  const capMin = (n, reason) => { if (n > 0 && n > min) { min = n; why.min = reason; } };

  /* HOME AND ONLINE ARE VENUE ROWS LIKE ANY OTHER (owner, 8 Nov): their seats come from the row. */
  if (!space && loc) space = spaceFor(loc);
  if (space) { capMax(Number(space.max), space.label || 'this venue');
                    capMin(Number(space.min), space.label || 'this venue'); }
  /* MAX SEATS = THE SMALLER OF TUTOR AND PLACE (owner, 7 Nov); "No preference" has no tutor row, so the place alone. */
  /* A TUTOR WITH NO CAPACITY SET HOLDS 1 SEAT (owner, 7 Nov). */
  if (tutor)  { capMax(Number(tutor.maxStudents) || 1, tutor.title);
                capMin(Number(tutor.minStudents), tutor.title); }
  capMax(houseMax, 'your limit');
  /* AT HOME THE BOOKING TAKES EVERY SEAT THE TUTOR HOLDS (owner, 8 Nov): the floor is the cap, priced for all. */
  if (loc && takesAllSeats_(loc)) { min = max; why.min = 'a home session'; }
  if (min > max) min = max;

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

/* ---------- ONE RANK PER ACCOUNT (400): student < client < staff < admin, as `rankOf` (people.gs) ----------
   The server's word when the sign-in reply carried one; worked out from the roles for a copy kept before it did. */
const RANKS = ['student', 'client', 'staff', 'admin'];
const rank_ = () => {
  if (!USER) return '';
  if (RANKS.indexOf(String(USER.rank || '')) !== -1) return USER.rank;
  if (hasRole('admin')) return 'admin';
  if (tutorHeld_() && !USER.tutorPending) return 'staff';
  if (hasRole('client')) return 'client';
  return hasRole('student') ? 'student' : 'client';
};
/* AT LEAST THIS RANK; nobody signed in holds none. */
const rankAtLeast_ = want => !!USER && RANKS.indexOf(rank_()) >= RANKS.indexOf(want);
const isTutorRole = () => rankAtLeast_('staff');

/* ---------- A CHILD IS SHOWN NO PRICE (398) — the owner: "Kids' profiles shouldn't be able to see tutors' prices." */
/* Rank Student (400), the phone's half of `isChild_` (people.gs). */
const childView_ = () => rank_() === 'student';
/* WHAT SHE IS TOLD WHERE A PRICE OR A PAY BUTTON WOULD BE — the backend's `KID_ASK_PARENT` says the same. */
const KID_ASK_PARENT = 'A parent books and pays for sessions — ask yours to book this one.';

/* THE FOUR WORDS A JOB'S STATUS CAN BE, and nothing else. § */
const JOB_STATUSES = ['Unsent', 'Unconfirmed', 'Active', 'Cancelled'];


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

const pence_ = x => Math.round((Number(x) || 0) * 100) / 100;
const RATE_KEYS_ = ['base', 'subject', 'complexity', 'level', 'daytime', 'students'];

/* THE RUNNING TOTAL after a given row has applied. § */
function runningAfter(key, L) {
  let p = L.chargeRate || 0;
  const step = { subject: L.avgSubject, complexity: L.fSubjectCount,
                 level: L.L, daytime: (Number(L.D) || 1) * (Number(L.T) || 1), students: L.fChildrenAll };
  /* ROUNDED TO THE PENNY AT EVERY LINE (owner, 8 Nov), so each line's figure is the product of what the row shows. */
  for (const k of RATE_KEYS_) {
    if (k !== 'base') p = pence_(p * (Number(step[k]) || 1));
    if (k === key) return p;
  }
  /* NET ON ONE ROW (owner, 7 Nov): the venue's rate, unless the family provides the space. */
  p += L.hosting ? 0 : (L.venueRate || 0);
  if (key === 'venue') return p;
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
/* AN EXTRA SEAT COSTS AT MOST THE FIRST STUDENT (620) — the server's `SEAT_RATE_MAX`, as a share of the rate. */
const STAFF_SEAT_MAX = 1;
function seatShare_(tutorRow, c, B) {
  const v = ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
  const cv = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  if (c === undefined) c = cv('c', 'extra child rate', 'extra_child_rate');
  if (B === undefined) B = cv('B', 'boss rate', 'boss_rate');
  const asFraction = (x, fallback) => (x > 0 && x <= 2) ? x : fallback;
  /* THE TUTOR'S SEAT NEVER COSTS MORE THAN THE FIRST STUDENT (620): an older share past 1 prices as 1. */
  const seatTop = x => Math.min(x, STAFF_SEAT_MAX);
  const seatOwn = !!tutorRow && Number(tutorRow.extraSeat) > 0;
  const cRaw = seatOwn ? Number(tutorRow.extraSeat) : c;
  /* @FAMILY'S BLOCK IS B x THE EXTRA-SEAT RATE (8 Nov, the owner): one B for everyone, a tutor's own cut no longer read; bUsed is still a fraction of the rate. */
  const cUsed = seatTop(asFraction(cRaw, 0));
  return { cRaw, bRaw: B, seatOwn, cutOwn: false, cUsed, bUsed: asFraction(B, 0) * cUsed };
}
/* ---------- A TUTOR'S OWN CUT, READ THE ONE WAY THE SERVER SENDS IT (`seatCutOut_`, people.gs) § */
function seatCutOf_(v) {
  const s = typeof v === 'number' ? String(v) : String(v == null ? '' : v).trim();
  if (!/^\d*\.?\d+$/.test(s)) return NaN;
  const x = Number(s);
  return x <= 2 ? x : NaN;
}

/* NO FORMAT, PRACTICAL OR TRIP ON A BOOKING (463): those are shop items now, so a booking is teaching and a room. */
/* ---------- THE ONE SUM FROM CHARGED TO NET § */
function bookMoney_(m) {
  m = m || {};
  const pos = x => { const v = Number(x); return isFinite(v) && v > 0 ? v : 0; };
  const teaching = pos(m.tutorPay) + pos(m.profit);
  const venue = pos(m.venue);
  const gross = teaching + venue;
  const d = m.discount || {};
  const discountType = d.type === '%' ? '%' : (d.type === '£' ? '£' : '');
  const discountValue = discountType ? pos(d.value) : 0;
  /* THE DISCOUNT IS OFF THE TEACHING, NO MAXIMUM, SHARED (owner, 12 Nov): tutor and @family. each lose the same %; room and card fees are not discounted. */
  const asked = !discountValue ? 0
    : discountType === '%' ? teaching * Math.min(discountValue, 100) / 100
    : discountValue;
  const tutor = pos(m.tutorPay), p = pos(m.feePct) / 100, f = pos(m.feeFixed);
  const discount = Math.min(Math.round(asked * 100) / 100, teaching);
  const scale = teaching > 0 ? 1 - discount / teaching : 1;
  const tutorPayout = Math.round(tutor * scale * 100) / 100;
  const charged = Math.round((gross - discount) * 100) / 100;
  const cardFees = charged > 0 ? Math.round((charged * p + f) * 100) / 100 : 0;
  const net = Math.round((charged - tutorPayout - venue - cardFees) * 100) / 100;
  return {
    gross, discount, discountType, discountValue, discountCode: String(d.code || ''),
    absorbedBy: discount ? 'Shared with tutor' : '',
    charged, teaching, tutorPayout, venue, cardFees, net, margin: charged > 0 ? net / charged : 0,
  };
}

/* THE THREE FIGURES A BOOKING ROW KEEPS, per family and after the discount, so client pays = tutor + admin + room and fees to the penny. */
function bookShares_(L) {
  const e = L && L.earn;
  if (!e || !(Number(L.total) > 0)) return null;
  const n = Math.max(1, Number(L.splitShares) || 1), p2 = x => Math.round((Number(x) || 0) / n * 100) / 100;
  const pays = p2(e.charged), tutor = p2(e.tutorPayout), fees = p2(e.venue + e.cardFees);
  return { pays, tutor, fees, admin: Math.round((pays - tutor - fees) * 100) / 100 };
}

