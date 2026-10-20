/* @family. — 20_people.gs (3 of 8) WHO SOMEBODY IS, and what follows from that: § */


/* A person may hold SEVERAL roles — a parent who also tutors, an admin who teaches. § */
function rolesOf(row) {
  const list = S(row && row.role).split(/[,\n]/).map(x => norm(x)).filter(Boolean);
  return list.length ? list : ['client'];
}
function hasRole(row, want) { return rolesOf(row).indexOf(norm(want)) !== -1; }
/* Which role the site should treat as their MAIN one when it has to pick just one — the most
   privileged they hold, so an admin who is also a parent gets the admin view. */
function mainRole(row) {
  const r = rolesOf(row);
  return ['admin', 'tutor', 'client', 'student'].find(x => r.indexOf(x) !== -1) || 'client';
}

/* The other half of that cell: § */
function titlesOf(row) {
  return rolesOf(row).map(x => ROLE_TITLES[x]).filter(Boolean);
}

/* ---------- THE THREE SELF-CHOSEN ROLES, AS THE WIDGET SEES THEM § */
function selfRolesOf_(row) {
  const held = rolesOf(row).map(x => SELF_ROLE_ALIASES[x] || x);
  return SELF_ROLES.filter(x => held.indexOf(x) !== -1);
}

/* A TUTOR WHO TICKED THE BOX AND HAS NOT BEEN SAID YES TO — see `LISTED_PENDING`. An admin is never
   pending: they are the person who says yes, so their own tick is its own approval. */
function tutorPending_(row) {
  return !!row && hasRole(row, 'tutor') && !hasRole(row, 'admin')
    && norm(row.listed) === norm(LISTED_PENDING);
}

/* ---------- WHAT A PERSON IS ALLOWED TO ACT AS, WHICH IS NOT ALWAYS WHAT THE CELL SAYS § */
function actingRole_(row) {
  const r = rolesOf(row).filter(x => !(x === 'tutor' && tutorPending_(row)));
  if (!r.length) return 'student';
  return ['admin', 'tutor', 'client', 'student'].find(x => r.indexOf(x) !== -1) || 'client';
}

/* ---------- THE SESSIONS SOMEBODY IS STILL SITTING IN AS A TUTOR, OR AS A CLIENT § */
function liveSeatsAs_(row, role) {
  const name = key(personDisplayName(row));
  if (!name) return [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out = [];
  read(TAB.jobs).rows.forEach(j => {
    const id = S(j.job_id) || String(j._row);
    if (!id || norm(j.status) === 'ended') return;
    const dates = sessionDatesOf(j).map(parseDate).filter(Boolean).sort((a, b) => a - b);
    if (dates.length && dates[dates.length - 1] < today) return;
    if (jobStatusOf(id) === 'cancelled') return;
    const seat = participantsOf(id).find(p => key(p.name) === name && p.role === role
                                            && p.status !== 'Withdrawn');
    if (seat) out.push(id);
  });
  return out;
}

/* Find a person by ID FIRST, then by name. § */
function findPerson(nameOrId, altId) {
  const rows = read(TAB.people).rows;
  /* The id, if one was passed and it is an id rather than something else handed in by mistake —
     `myReferral` passes the whole tab object as the second argument, which must not be stringified
     into a search term. */
  const alt = (altId && typeof altId !== 'object') ? key(altId) : '';
  if (alt) {
    const byAlt = rows.find(r => key(r.person_id) === alt);
    if (byAlt) return byAlt;
  }
  const want = key(nameOrId);
  if (!want) return null;
  // An exact id match wins outright.
  const byId = rows.find(r => key(r.person_id) === want);
  if (byId) return byId;
  /* ---------- AND AN E-MAIL ADDRESS, MATCHED AS AN ADDRESS RATHER THAN AS A NAME § */
  const mail = norm(nameOrId);
  return rows.find(r =>
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want ||
    (mail.indexOf('@') !== -1 && norm(r.email) === mail)) || null;
}

/* AN E-MAIL ADDRESS THAT ALREADY ANSWERS TO SOMEBODY ELSE. § */
function emailRefusal_(want, me) {
  const mail = norm(want);
  if (!mail) return '';                       // clearing your address is not taking anybody's
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;      // your own row is not a clash
    return !!norm(r.email) && norm(r.email) === mail;
  });
  return clash ? 'That e-mail address is already on another account.' : '';
}

/* ONE FUNCTION THAT SAYS WHY A HANDLE IS REFUSED, OR NOTHING AT ALL. § */

/* WHAT A HANDLE MEANS RATHER THAN HOW IT IS SPELLED. § */
function handleFold_(v) {
  return String(v == null ? '' : v).toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
    .replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g');
}

/**
 * Why `want` may not be this person's handle — '' when it may.
 * `me` is their row, so their own cells are not counted as a clash.
 */
function handleTrouble_(want, me) {
  /* ---------- TWO FORMS, AND WHICH ONE EACH LINE BELOW USES IS THE WHOLE OF IT § */
  const shown = String(want == null ? '' : want).trim();
  const raw = shown.toLowerCase();
  if (!raw) return 'Type the name you want.';
  if (!HANDLE_SHAPE.test(raw)) {
    return 'A handle is 3 to 20 characters, starts with a letter, and holds only letters, '
         + 'numbers and underscores.';
  }

  const folded = handleFold_(raw);

  if (HANDLE_RESERVED.indexOf(raw) !== -1 || HANDLE_RESERVED.indexOf(folded) !== -1) {
    return '"' + shown + '" is kept for the school\'s own accounts.';
  }

  /* THE ALLOW LIST IS CHECKED FIRST, or `analysis` never gets the chance. § */
  /* ---------- AND THE FIRST VERSION OF THIS LINE LET EVERY BANNED WORD THROUGH § */
  const innocent = Object.keys(HANDLE_ALLOWED).some(w =>
    folded === w || folded.startsWith(w) || folded.endsWith(w));
  if (!innocent) {
    for (let i = 0; i < HANDLE_BLOCKED.length; i++) {
      if (folded.indexOf(HANDLE_BLOCKED[i]) !== -1) {
        /* THE WORD IS NOT QUOTED BACK. Naming it is repeating it, on a site children read, and the
           person typing it already knows which one it was. */
        return 'That handle has a word in it we do not allow. Pick another.';
      }
    }
  }

  /* ---------- TAKEN, AND AGAINST ALL THREE COLUMNS § */
  /* ---------- AND AGAINST EVERY HANDLE SOMEBODY ELSE USED TO HAVE (342) § */
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;       // your own row is not a clash
    return key(r.handle) === key(raw)
        || key(S(r.first_name) + ' ' + S(r.last_name)) === key(raw)
        || S(r.handle_was).split(',').some(w => key(w) === key(raw));
  });
  if (clash) return '"' + shown + '" is taken.';

  /* ---------- AND NO MONTH, WHICH THERE USED TO BE § */
  return '';
}

/* ---------- A HANDLE IS A TEMPLATE ANYBODY CAN WORK OUT FOR THEMSELVES (docs/history/364) */
/* First and last letter of the first name and the year joined: "to2026" (372). A clash adds letters before
   the last ("tho2026"), then a counter; earliest joiner first. No surname, no birthday, nothing random. */
const HANDLE_NO_LETTER = 'x';

/* THE OLD SHAPES (342) are read, never made: an old handle is a sign-in alias in `handle_was`, and
   `handleAnswers_` still spells a long first name out in one. */
const HANDLE_ADJ = ['kind', 'brave', 'honest', 'patient', 'gentle', 'loyal', 'humble', 'wise',
                    'fair', 'caring', 'cheerful', 'hopeful', 'generous', 'grateful', 'faithful',
                    'joyful', 'calm', 'steady', 'true', 'careful', 'polite', 'helpful', 'bold',
                    'sincere', 'modest', 'noble', 'diligent', 'earnest', 'upright', 'valiant'];
const HANDLE_FIRST_MAX = 9;
const HANDLE_FALLBACK = 'friend';
const HANDLE_TAIL_MIN = 10, HANDLE_TAIL_MAX = 99;
const HANDLE_ORDERS = [['first', 'virtue', 'nn'], ['virtue', 'first', 'nn'],
                       ['first', 'nn', 'virtue'], ['virtue', 'nn', 'first']];

/* LETTERS NFKD DOES NOT TAKE APART — a stroke or a ligature is not an accent, so `Ł` stays `Ł` and its
   initial would otherwise be lost. The common ones, folded by hand. */
const HANDLE_KID_FOLD = { 'ł': 'l', 'ø': 'o', 'đ': 'd', 'ð': 'd', 'þ': 't', 'æ': 'a', 'œ': 'o', 'ß': 's', 'ı': 'i' };

/** The first-name part of a handle: lower-case ASCII letters and digits, starting with a letter,
    at most `HANDLE_FIRST_MAX` long. '' when nothing usable is left. */
function handleFirst_(first) {
  return String(first == null ? '' : first).toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/^[0-9]+/, '').slice(0, HANDLE_FIRST_MAX);
}

/* The pieces of a handle in the generated shape — `{ head, word, tail, order }` — or null. § */
function handleParts_(h, first) {
  const s = String(h == null ? '' : h);
  if (!s || (s.match(/_/g) || []).length > 1) return null;
  const heads = [handleFirst_(first), HANDLE_FALLBACK].filter(Boolean);
  const part = { first: '(' + heads.join('|') + ')', virtue: '(' + HANDLE_ADJ.join('|') + ')',
                 nn: '(\\d{2})' };
  const orders = HANDLE_ORDERS.concat([['first', 'virtue']]);
  for (let i = 0; i < orders.length; i++) {
    const m = s.match(new RegExp('^' + orders[i].map(p => part[p]).join('_?') + '$'));
    if (!m) continue;
    const got = { head: '', word: '', tail: '', order: orders[i].join('-') };
    orders[i].forEach((p, j) => {
      if (p === 'first') got.head = m[j + 1];
      else if (p === 'virtue') got.word = m[j + 1];
      else got.tail = m[j + 1];
    });
    if (got.tail && (+got.tail < HANDLE_TAIL_MIN || +got.tail > HANDLE_TAIL_MAX)) continue;
    return got;
  }
  return null;
}


/* A NAME'S LETTERS folded to a–z (accents off, `HANDLE_KID_FOLD` for the ones NFKD keeps), in order. */
function handleLetters_(v) {
  return Array.from(String(v == null ? '' : v).toLowerCase()).map(c => {
    try { c = c.normalize('NFKD').charAt(0); } catch (err) {}
    c = HANDLE_KID_FOLD[c] || c;
    return /^[a-z]$/.test(c) ? c : '';
  }).join('');
}

/* WHERE A PERSON FIRST SHOWS UP when their row has no joined_on: [tab, id column, date column]. */
const HANDLE_ACTIVITY = [['submissions', 'person_id', 'submitted_at'],
  ['answers', 'person_id', 'saved_at'], ['messages', 'from_id', 'sent_at'], ['receipts', 'person_id', 'issued_on'],
  ['post_reactions', 'person_id', 'reacted_on'], ['favourites', 'person_id', 'at'],
  ['family', 'parent_id', 'asked_on'], ['family', 'child_id', 'asked_on']];

/* EACH PERSON'S EARLIEST RECORDED ACTIVITY, `{ person_id: Date }` — their own dated cells and every tab above. A missing tab is skipped. */
function handleFirstSeen_(rows) {
  const out = {};
  const see = (id, v) => {
    const d = S(id) && v ? sheetDate(v) : null;
    if (d && (!out[S(id)] || d < out[S(id)])) out[S(id)] = d;
  };
  (rows || []).forEach(r => ['handle_changed_at', 'agreement_signed_at'].forEach(c => see(r.person_id, r[c])));
  HANDLE_ACTIVITY.forEach(([tab, idCol, dateCol]) => {
    if (!TAB[tab]) return;
    try { (read(TAB[tab]).rows || []).forEach(x => see(x[idCol], x[dateCol])); } catch (err) {}
  });
  return out;
}

/* WHEN THEY JOINED, as a Date, and where it came from: joined_on, else first activity (`seen`), else now. */
function handleJoined_(r, seen) {
  const own = r && S(r.joined_on) ? sheetDate(r.joined_on) : null;
  if (own) return { when: own, from: 'joined_on' };
  const act = seen && r && seen[S(r.person_id)];
  if (act) return { when: act, from: 'activity' };
  return { when: new Date(), from: 'now' };
}

/* THE STEMS (372): first letter + last letter of the first name, then one more letter from the start each
   time before the last (`to`, `tho`, `theo`); a one-letter name doubles (`aa`). */
function handleStems_(r) {
  const first = handleLetters_(r && r.first_name) || HANDLE_NO_LETTER;
  const last = first.charAt(first.length - 1);
  const out = [];
  for (let n = 1; n <= Math.max(1, first.length - 1); n++) out.push(first.slice(0, n) + last);
  return out;
}

/* The template's candidates for row `r`, in the order tried: each stem + year joined, then a counter. */
function handleCandidates_(r, seen) {
  const stems = handleStems_(r);
  const year = String(handleJoined_(r, seen).when.getFullYear());
  const out = stems.map(st => st + year);
  for (let i = 2; i <= 99; i++) out.push(stems[stems.length - 1] + year + i);
  return out;
}

/* ALREADY IN THE TEMPLATE'S SHAPE for this first name (any year) — such a handle is never moved again. */
function handleInShape_(h, r) {
  const stems = handleStems_(r);
  const m = S(h).toLowerCase().match(/^([a-z]+)(\d{4})(\d*)$/);
  return !!m && stems.indexOf(m[1]) !== -1 && (!m[3] || m[1] === stems[stems.length - 1]);
}

/* THE HANDLE THE TEMPLATE GIVES ROW `r`: the first candidate `trouble(want)` does not refuse, or ''. */
function handleTemplate_(r, trouble, seen) {
  const all = handleCandidates_(r, seen);
  for (let i = 0; i < all.length; i++) if (!trouble(all[i])) return all[i];
  return '';
}

/* One handle for a person about to be written or already on the tab — `handleTrouble_` is the gate, so somebody else's handle or old handle is never given. `me` may be a draft row. */
function handleMake_(me, seen) {
  return handleTemplate_(me || {}, want => handleTrouble_(want, me && me.person_id ? me : null), seen);
}

/* ---------- THE ROWS AN OLD HANDLE STILL SIGNS IN (342) § */
/* EACH ENTRY ANSWERS AS A CURRENT HANDLE DOES (`handleAnswers_`) — exactly, or with a long first name spelled out where the handle keeps nine letters of it. § */
function handleWasRows_(rows, typed) {
  const want = key(typed);
  if (!want) return [];
  return (rows || []).filter(r => S(r.handle_was).split(',').some(w => handleAnswers_(w, r.first_name, want)));
}
/* THE ENTRY AS IT IS STORED — what the reply says the child used to be, not what they typed. */
function handleWasEntry_(r, typed) {
  const want = key(typed);
  return S(r && r.handle_was).split(',').map(w => w.trim())
    .find(w => w && handleAnswers_(w, r && r.first_name, want)) || '';
}

/* ---------- AND EVERY `friends` LIST THAT NAMED AN OLD HANDLE, MOVED TO THE NEW ONE (342) § */
function handleFriendsMove_(t, moves) {
  if (!t || !t.headers || t.headers.indexOf('friends') === -1 || !Object.keys(moves || {}).length) return 0;
  let n = 0;
  t.rows.forEach(r => {
    const list = S(r.friends).split(',').map(x => x.trim()).filter(Boolean);
    let moved = false;
    const now = list.map(h => { const to = moves[key(h)]; if (to) { moved = true; return to; } return h; });
    if (moved && setCell(t, r, 'friends', now.join(', '))) n++;   // the phone's own separator (me.js)
  });
  return n;
}

/* ---------- THE ROWS A TYPED HANDLE IS, FOR SIGNING IN AND FOR A FORGOTTEN PIN § */
function handleRows_(rows, typed) {
  const want = key(typed);
  if (!want) return [];
  return (rows || []).filter(r => handleAnswers_(r.handle, r.first_name, want));
}
/* ONE HANDLE AGAINST WHAT WAS TYPED (`want`, already through `key`), for somebody called `first`: § */
function handleAnswers_(h, first, want) {
  const have = key(h);
  if (!have || !want) return false;
  if (have === want) return true;
  const cut = handleFirst_(first);
  const whole = String(first == null ? '' : first).toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/^[0-9]+/, '');
  if (!cut || whole.length <= cut.length || !handleParts_(h, first)) return false;
  return have.replace(cut, whole) === want;
}

/* `handleBareFree_` WAS HERE. § */

/* `handle_was` with `was` added at the front: § */
function handleWasWith_(cell, was) {
  const list = String(cell == null ? '' : cell).split(',').map(x => x.trim()).filter(Boolean);
  const w = String(was == null ? '' : was).trim();
  if (w && (!list.length || key(list[0]) !== key(w))) list.unshift(w);
  return list.join(', ');
}

/* ---------- A HANDLE THE SERVER MOVES KEEPS THE FACE IT DREW (342, after review round 2) § */
const FACE_SKINS = 6;
const FACE_HAIRS = 7;
function handleFaceKept_(t, r, was) {
  const w = S(was);
  if (!t || !t.headers || t.headers.indexOf('avatar') === -1 || !r || S(r.avatar) || !w) return {};
  let h = 2166136261;
  for (let i = 0; i < w.length; i++) { h ^= w.charCodeAt(i); h = Math.imul(h, 16777619); }
  h = h >>> 0;
  return { avatar: 'hair:crop|headwear:none|faceware:none|shoulders:none|handheld:none|legs:plain'
                 + '|skin:' + (h % FACE_SKINS) + '|hairColour:' + ((h >>> 5) % FACE_HAIRS) + '|shirt:0' };
}

/* AND WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER. § */
function pricingMoved_(me, fields) {
  if (!me || !fields) return [];
  /* `N` ON BOTH SIDES, so `'4'` off a form and `4` off a sheet are the same answer. All four of these
     are numbers — two counts and two money figures — and a string compare would refuse every save. */
  return PRICING_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(fields, f)
                                 && N(fields[f]) !== N(me[f]));
}

function pricingRefusal_(me, fields, isAdmin) {
  if (!me) return '';
  if (!pricingMoved_(me, fields).length) return '';   // nothing moved: not a change at all
  /* TWO SHAPES THE PRICE CANNOT USE, refused for an admin too. § */
  const got = f => Object.prototype.hasOwnProperty.call(fields, f) ? fields[f] : me[f];
  const seat = S(got('extra_seat_rate'));
  if (seat !== '' && !(N(seat) >= 0 && N(seat) <= 2 && !isNaN(Number(seat)))) {
    /* "THE" RATE, NOT "YOUR" RATE: an admin on somebody else's row is told this too (the review of 345). */
    return 'The extra-seat rate is at most twice the hourly rate — as a share, 0 to 2, where 0.5 is half the '
         + 'rate for each extra student. Nothing was saved.';
  }
  const lo = S(got('min_students')), hi = S(got('max_students'));
  if (lo !== '' && hi !== '' && N(lo) > N(hi)) {
    return 'The fewest students (' + lo + ') is more than the most (' + hi + '). Nothing was saved.';
  }
  /* AN ADMIN FIXING A TUTOR'S RATE OR CAP IS THE REMEDY RATHER THAN THE THING BEING BRAKED — the
     same exemption, for the same reason, the handle cooldown had while there was one. */
  if (isAdmin) return '';
  /* ONE DATE AND NO COUNTER: the rule is "has a month passed", and a row that has never changed has
     no cell and is free. */
  const last = sheetDate(me.pricing_changed_at);
  if (!last) return '';
  const next = new Date(last.getTime() + PRICING_COOLDOWN_DAYS * 864e5);
  if (next <= new Date()) return '';
  /* WHAT IT SAYS IS THE GROUP, NOT THE FIELD THAT HAPPENED TO MOVE. Naming one of the four would
     read as an invitation to change the other three, which is exactly what one clock refuses. */
  return 'You changed what you charge and the class sizes you take on ' + fmtDate(last)
       + '. You can change them again on ' + fmtDate(next) + '. Nothing was saved.';
}

/* THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S TO SET, AND ONE READER FOR WHAT IS SENT. § */
function seatCutOut_(v) {
  const s = S(v);
  if (!/^\d*\.?\d+$/.test(s)) return '';
  const x = Number(s);
  return x <= 2 ? x : '';
}

function seatCutRefusal_(me, asked, isAdmin) {
  if (!me || !asked || !Object.prototype.hasOwnProperty.call(asked, SEAT_CUT_FIELD)) return '';
  const want = S(asked[SEAT_CUT_FIELD]), was = S(me[SEAT_CUT_FIELD]);
  const cut = seatCutOut_(want);
  if (want === was || (cut !== '' && cut === seatCutOut_(was))) return '';
  if (!isAdmin) return 'Only @family. sets its share of an extra seat. Nothing was saved.';
  /* WORDED FOR EITHER BOX: Settings draws the cut as a share and the card in pounds (the card refuses a part past
     twice the rate itself, in pounds, before it posts — `cardSeatRefusal_`, me.js). */
  if (want !== '' && cut === '') {
    return "@family.'s share of an extra seat is at most twice the tutor's hourly rate — as a share, 0 to 2, where "
         + '0.1 is a tenth of the rate; blank is the usual share. Nothing was saved.';
  }
  return '';
}

/* THE AGES A TUTOR TEACHES — ONE READER, AND A REFUSAL ASKED BEFORE ANYTHING IS WRITTEN. § */
function ageRank_(v) {
  const s = S(v);
  if (!s) return null;
  if (/^adults?$/i.test(s) || /^18\s*\+$/.test(s)) return Infinity;
  if (!/^\d{1,3}$/.test(s)) return NaN;
  return Number(s) || null;
}

function ageOut_(v) {
  const n = ageRank_(v);
  return n === Infinity ? 'Adults' : (n == null || isNaN(n)) ? '' : n;
}

function ageRefusal_(me, asked) {
  if (!me || !asked) return '';
  const has = f => Object.prototype.hasOwnProperty.call(asked, f);
  const moved = AGE_FIELDS.filter(f => has(f) && S(asked[f]) !== S(me[f]));
  if (!moved.length) return '';
  const end = f => f === 'age_min' ? 'youngest' : 'oldest';
  const off = moved.find(f => S(asked[f]) !== '' && !AGE_OPTIONS.some(o => norm(o) === norm(asked[f])));
  if (off) {
    return 'The ' + end(off) + ' age has to be one from the list — ' + AGE_OPTIONS[0] + ' to '
         + AGE_OPTIONS[AGE_OPTIONS.length - 2] + ', or ' + AGE_OPTIONS[AGE_OPTIONS.length - 1]
         + '. Nothing was saved.';
  }
  const got = f => has(f) ? asked[f] : me[f];
  const lo = ageRank_(got('age_min')), hi = ageRank_(got('age_max'));
  if (lo != null && hi != null && !isNaN(lo) && !isNaN(hi) && lo > hi) {
    return 'The youngest age you teach (' + ageOut_(got('age_min')) + ') is older than the oldest ('
         + ageOut_(got('age_max')) + '). Nothing was saved.';
  }
  return '';
}


/* ---------- HOW LONG A SESSION IS — `ageRefusal_`'S RULE FOR THE OTHER RANGE ON THE CARD § */
function hoursRank_(v) {
  const s = S(v);
  if (!s) return null;
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}
function hoursRefusal_(me, asked) {
  if (!me || !asked) return '';
  const has = f => Object.prototype.hasOwnProperty.call(asked, f);
  const moved = SESSION_FIELDS.filter(f => has(f) && S(asked[f]) !== S(me[f]));
  if (!moved.length) return '';
  const end = f => f === 'min_hours' ? 'shortest' : 'longest';
  const off = moved.find(f => S(asked[f]) !== '' && SESSION_OPTIONS.indexOf(S(asked[f])) === -1);
  if (off) {
    return 'The ' + end(off) + ' session has to be a whole number of hours from ' + SESSION_OPTIONS[0] + ' to '
         + SESSION_OPTIONS[SESSION_OPTIONS.length - 1] + '. Nothing was saved.';
  }
  const got = f => has(f) ? asked[f] : me[f];
  const lo = hoursRank_(got('min_hours')), hi = hoursRank_(got('max_hours'));
  const low = lo == null ? 1 : lo;
  if (hi != null && !isNaN(low) && !isNaN(hi) && low > hi) {
    return 'The shortest session (' + low + (low === 1 ? ' hour' : ' hours') + ') is longer than the longest ('
         + hi + (hi === 1 ? ' hour' : ' hours') + '). Nothing was saved.';
  }
  return '';
}

/** Every row that answers to this name — so a collision can be SEEN rather than silently resolved. */
function peopleNamed(name) {
  const want = key(name);
  if (!want) return [];
  return read(TAB.people).rows.filter(r =>
    key(r.person_id) === want ||
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want);
}

/** Give every row a permanent id. Rows that predate this have none, which is how they were
    identified by name in the first place. Idempotent; never changes an id that exists. */
function ensurePersonIds_() {
  const t = read(TAB.people);
  const c = t.headers.indexOf('person_id');
  if (c < 0) return 0;
  const last = t.sheet ? t.sheet.getLastRow() : 0;
  if (last < 2) return 0;

  /* Batched for the same reason the resources are. Fifteen people is not four hundred rows, but a
     write per row is a round trip per row whatever the count, and this runs on the first request
     after every deploy now. */
  const ids = t.sheet.getRange(2, c + 1, last - 1, 1).getValues();
  const stamp = Date.now();
  let added = 0;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim()) continue;
    ids[i][0] = 'P' + stamp + '-' + i;
    added++;
  }
  if (added) t.sheet.getRange(2, c + 1, last - 1, 1).setValues(ids);
  clearCache();
  return added;
}

function isAdminPerson(name) {
  const p = findPerson(name);
  return !!p && hasRole(p, 'admin');
}

/* `childrenOf` read the `children` cell and nothing else. It is above, reading the family tab
   first — see the note there on why two sources became one. */

/* ---------- `countTicks` WAS HERE § */

/**
 * WHAT THE BUSINESS IS CALLED.
 *
 * From the brand tab, with the obvious fallback — so the name on a post follows the one place it
 * is written down, and changing it is a cell rather than a search through the source.
 */
function brandName() {
  /* THE NAME CAME OFF THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW. § */
  return BRAND_NAME;
}

/** May this person write to that one? Roles in the SHEET's words. */
function mayMessage(fromRole, toRole) {
  const f = norm(fromRole), t = norm(toRole);
  return !!(MESSAGING[f] && MESSAGING[f][t]);
}

/** What the app calls this role. */
function toAppRole(sheetRole) {
  const r = norm(sheetRole);
  return ROLE_TO_APP[r] || r;
}

/* `toSheetRole` was here — the way back from the app's words to the sheet's, `parent` to `client`. § */


/* ---------- WHO IS RELATED TO WHOM § */
function acceptedLinks() {
  return read(TAB.family).rows.filter(r => norm(r.state) === 'accepted');
}

/* `seedFamilies` WAS HERE. § */

/* A PARENT'S CHILDREN, FROM THE ONE PLACE THAT HOLDS THEM. § */
/* ---------- RENAMED, BECAUSE THERE WERE TWO `childrenOf` AND THIS ONE NEVER RAN § */
function childNamesOf(personRow) {
  /* BY FIRST NAME (`nameFor_`): these fill the booking form's "Which of your children?", and what is
     ticked there is written into `for_children` and read by the tutor. The owner, 10 Oct. */
  const linked = acceptedChildren(S(personRow && personRow.person_id)).map(c => nameFor_(c));
  if (linked.length) return linked;
  return typedKids_(personRow).map(k => k.shown);
}

/* ---------- THE CHILDREN A PARENT TYPED INTO THEIR OWN `children` CELL, AS THEY MAY BE SAID § */
function typedKids_(personRow) {
  return S(personRow && personRow.children).split(/[,\n]/).map(x => x.trim()).filter(Boolean).map(typed => {
    const row = peopleNamed(typed)[0];
    return { typed: typed, shown: row ? nameFor_(row) : typed.split(/\s+/)[0] };
  });
}

/* ---------- WHO A FAMILY SAYS IT IS BRINGING, AS OTHER FAMILIES MAY READ IT (342, the review) § */
function typedFirstWords_(s) {
  return S(s).split(/(\s*(?:,|;|\/|&|\+|\n|\band\b)\s*)/i)
    .map((part, i) => (i % 2 ? part : S(part).split(/\s+/)[0] || '')).join('').trim();
}

/* `for_children` AS IT MAY BE KEPT: each name the phone sent that is one of the booker's typed-only
   children (`typedKids_`) becomes what `childNamesOf` offers for her; the rest as sent. Empty stays
   empty — a booking for yourself. */
function kidsForJob_(kids, booker) {
  const list = S(kids).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  if (!list.length || !booker) return S(kids);
  const typed = {};
  typedKids_(booker).forEach(k => { typed[key(k.typed)] = k.shown; });
  if (!Object.keys(typed).length) return S(kids);
  return list.map(x => (typed[key(x)] !== undefined ? typed[key(x)] : x)).join(', ');
}

/** The children who accepted this parent. */
function acceptedChildren(personId) {
  const ids = acceptedLinks().filter(r => S(r.parent_id) === S(personId)).map(r => S(r.child_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** The parents this child accepted. */
function acceptedParents(personId) {
  const ids = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** Everyone who shares a parent with this child — themselves excluded. */
function siblingsOf(personId) {
  const parents = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  const ids = [...new Set(acceptedLinks()
    .filter(r => parents.indexOf(S(r.parent_id)) !== -1 && S(r.child_id) !== S(personId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/* THE CHILDREN ON SOMEBODY'S ACCOUNT. § */
function childrenOf(parentId) {
  const ids = [...new Set(acceptedLinks()
    .filter(r => S(r.parent_id) === S(parentId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/* FIRST AND LAST, AND NOTHING ELSE. `full_name` was the same fact typed a third time and the people
   tab's redesign dropped it — see `SCHEMA.people`. */
function personDisplayName(r) {
  return (S(r.first_name) + ' ' + S(r.last_name)).trim();
}

/* A CHILD IS CALLED BY THEIR FIRST NAME — TO EVERYBODY, IN EVERYTHING THE SERVER SAYS THE OWNER, 10 OCT: § */
/* ---------- WHO THE NET IS WORKING FOR (342) § */
function netViewerSet_(row) {
  NET_VIEWER_ = row ? { id: key(row.person_id), admin: hasRole(row, 'admin') } : null;
  return NET_VIEWER_;
}
/* MAY THIS VIEWER SEE THIS GROWN-UP'S WHOLE NAME — themselves, an admin, or a CHILD THIS GROWN-UP IS ON
   THE FAMILY TAB WITH (`netKin_`). Nobody known is nobody. */
function netSeesWhole_(pid) {
  const v = NET_VIEWER_;
  if (!v) return false;
  if (v.admin) return true;
  if (!v.id) return false;
  const p = key(pid);
  if (v.id === p) return true;
  return !!p && netKin_(v)[p] === true;
}
/* ---------- THE GROWN-UPS ON A CHILD'S OWN FAMILY ROWS SEE HER — SHE SEES THEIR WHOLE NAMES (342, round 2) § */
const NET_KIN_STATES = ['asked', 'accepted'];
function netKin_(v) {
  let rows = [];
  try { rows = read(TAB.family).rows; } catch (err) { return {}; }
  if (v.kin && v.kin.rows === rows && v.kin.n === rows.length) return v.kin.ids;
  const ids = {};
  rows.forEach(f => {
    if (key(f.child_id) === v.id && NET_KIN_STATES.indexOf(norm(f.state)) !== -1 && key(f.parent_id)) ids[key(f.parent_id)] = true;
  });
  v.kin = { rows: rows, n: rows.length, ids: ids };
  return ids;
}
/* WHO IS CALLED BY THEIR FIRST NAME TO SOMEBODY ELSE: a child (to everybody, 333), and a grown-up who
   is neither acting as a tutor nor an admin (342) — `actingRole_`, so a Tutor tick nobody has said yes
   to is not a public card. */
function namePrivate_(r) {
  if (!r) return false;
  if (isChild_(r)) return true;
  const a = actingRole_(r);
  return a !== 'tutor' && a !== 'admin';
}
/* THE ADDRESS AN EMAIL GOES TO, AS A VIEWER: § */
function mailViewer_(to) {
  const a = norm(to);
  if (!a || /[,;]/.test(a)) return null;
  let hits = [];
  try { hits = read(TAB.people).rows.filter(r => norm(r.email) === a); } catch (err) { return null; }
  return hits.length === 1 && !addressPending_(hits[0]) ? hits[0] : null;
}

/* ---------- A WHOLE NAME TYPED TO SEE WHETHER IT IS SOMEBODY'S ACCOUNT (342, the review) § */

function isChild_(r) {
  if (!r) return false;
  const held = rolesOf(r).map(x => SELF_ROLE_ALIASES[x] || x);
  if (held.indexOf('student') === -1) return false;
  /* `actingRole_` READS THE ALIASED WORDS, so `pupil, teacher` with a PENDING tick is the same child as `student, tutor`. § */
  return actingRole_({ role: held.join(','), listed: r.listed }) === 'student';
}

/* THE FIRST NAME, or the handle when the row has none (a hand-typed row with only a surname must not
   fall back to the one word it has). */
function kidFirst_(r) {
  const first = S(r && r.first_name);
  if (first) return first;
  return S(r && r.handle) ? '@' + S(r.handle) : '';
}

/* ---------- WHAT EVERY ROW OF THE PEOPLE TAB SAYS ABOUT CHILDREN, WORKED OUT ONCE § */
function kidMemo_() {
  let rows = [];
  try { rows = read(TAB.people).rows; } catch (err) { rows = []; }
  if (KID_MEMO_ && KID_MEMO_.rows === rows && KID_MEMO_.n === rows.length) return KID_MEMO_;
  const firsts = {};
  /* EVERYBODY CALLED BY A FIRST NAME, not only the children (342): a child Sam and a parent Sam on one
     roster are two people who both read "Sam", so both are told apart by their handles. */
  rows.forEach(r => {
    if (!namePrivate_(r)) return;
    const k = norm(r.first_name);
    if (k) firsts[k] = (firsts[k] || 0) + 1;
  });
  KID_MEMO_ = { rows: rows, n: rows.length, firsts: firsts, idx: null };
  return KID_MEMO_;
}
/* A WRITE TO THE PEOPLE TAB — any table with a first and a last name — retires what was worked out. */
function kidMemoDrop_(t) {
  if (KID_MEMO_ && t && t.headers && t.headers.indexOf('first_name') !== -1 && t.headers.indexOf('last_name') !== -1) KID_MEMO_ = null;
  /* AND A WRITE TO THE FAMILY TAB retires which grown-ups this viewer sees whole (`netKin_`). */
  if (NET_VIEWER_ && t && t.headers && t.headers.indexOf('child_id') !== -1 && t.headers.indexOf('parent_id') !== -1) NET_VIEWER_.kin = null;
}

/* HOW MANY CHILDREN ANSWER TO THIS FIRST NAME — two or more and the handle goes beside it. */
function kidFirstShared_(r) {
  const k = norm(r && r.first_name);
  if (!k) return false;
  return (kidMemo_().firsts[k] || 0) > 1;
}

/* A person's name as it may leave the server, TO THIS REQUEST'S VIEWER (`NET_VIEWER_`). § */
function nameFor_(r, cardHasHandle) {
  if (!r) return '';
  if (!isChild_(r) && netSeesWhole_(r.person_id)) return personDisplayName(r);
  return nameToOthers_(r, cardHasHandle);
}
/* The name as anybody who is not this person or an admin may have it: § */
function nameToOthers_(r, cardHasHandle) {
  if (!r) return '';
  if (!namePrivate_(r)) return personDisplayName(r);
  const first = kidFirst_(r);
  if (!cardHasHandle && S(r.first_name) && S(r.handle) && kidFirstShared_(r)) {
    return first + ' (@' + S(r.handle) + ')';
  }
  return first;
}

/* ---------- A NAME SOMEBODY USED TO HAVE § */
function nameWasWith_(cell, was) {
  const list = S(cell).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  const w = S(was);
  if (w && (!list.length || key(list[0]) !== key(w))) list.unshift(w);
  return list.slice(0, NAME_WAS_KEEP).join(', ');
}

/* ---------- THE NET: EVERY CHILD'S WHOLE NAME, AND WHAT TO SAY INSTEAD § */
function kidNamesIndex_() {
  const m = kidMemo_();
  if (m.idx) return m.idx;
  /* `adult` AND `wholeAdult`: § */
  const out = { re: null, said: {}, whole: {}, wholeAny: false, adult: {}, wholeAdult: {} };
  const word = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['\u2019]/g, "(?:'|\u2019|&#39;|&#x27;|&apos;)");
  const alts = [];
  const add = (full, shown, pid) => {
    full = S(full).replace(/\s+/g, ' ').trim();
    if (!full) return;
    if (!/\s/.test(full)) {
      if (out.whole[norm(full)] === undefined) {
        out.whole[norm(full)] = shown; out.wholeAny = true;
        if (pid) out.wholeAdult[norm(full)] = pid;
      }
      return;
    }
    const k = kidNameKey_(full);
    if (out.said[k] !== undefined) return;
    out.said[k] = shown;
    if (pid) out.adult[k] = pid;
    alts.push(full.split(/\s+/).map(word).join('\\s+'));
  };
  const kids = m.rows.filter(isChild_);
  /* THE GROWN-UPS WHO ARE NOT ON A PUBLIC CARD (342) — and not one whose whole name a tutor or an admin also answers to: § */
  const pub = {};
  m.rows.forEach(r => { if (!namePrivate_(r)) pub[kidNameKey_(personDisplayName(r))] = true; });
  const grown = m.rows.filter(r => !isChild_(r) && namePrivate_(r) && !pub[kidNameKey_(personDisplayName(r))]);
  const pidOf = r => key(r.person_id) || '?';
  kids.forEach(r => { if (S(r.last_name)) add(personDisplayName(r), nameToOthers_(r)); });
  grown.forEach(r => { if (S(r.last_name)) add(personDisplayName(r), nameToOthers_(r), pidOf(r)); });
  kids.forEach(r => {
    const shown = nameToOthers_(r);
    S(r.name_was).split(/[,\n]/).forEach(w => { if (key(w) && key(w) !== key(personDisplayName(r))) add(w, shown); });
  });
  grown.forEach(r => {
    const shown = nameToOthers_(r);
    S(r.name_was).split(/[,\n]/).forEach(w => { if (key(w) && key(w) !== key(personDisplayName(r))) add(w, shown, pidOf(r)); });
  });
  if (alts.length) {
    /* LONGEST FIRST, so `Mary Ann Kind` is taken whole before a `Mary Ann` could be. */
    alts.sort((a, b) => b.length - a.length);
    out.re = new RegExp('(?<![\\p{L}\\p{N}])(?:' + alts.join('|') + ')(?![\\p{L}\\p{N}])', 'giu');
  }
  m.idx = out;
  return out;
}
function kidNameKey_(s) {
  return norm(s).replace(/&#39;|&#x27;|&apos;|\u2019/g, "'").replace(/\s+/g, ' ');
}

/* ---------- WHERE THE WHOLE-VALUE RULE DOES NOT REACH: A BOX THAT HOLDS ONE PART OF A NAME § */
function kidWholeOk_(field) { return !/^(first_?name|last_?name|surname)$/i.test(S(field)); }

/* WHERE IN `s` THE NET CHANGES SOMETHING: `[{ at, end, said }]`, in order. */
function kidNamesSpans_(s, i, wholeOk) {
  if (typeof s !== 'string' || !s) return [];
  if (wholeOk && i.wholeAny) {
    const w = i.whole[norm(s)];
    /* A GROWN-UP'S, TO THEMSELVES OR AN ADMIN, IS LEFT AS IT IS (342). */
    const own = i.wholeAdult && i.wholeAdult[norm(s)] !== undefined && netSeesWhole_(i.wholeAdult[norm(s)]);
    if (w !== undefined && !own) return [{ at: 0, end: s.length, said: w }];
  }
  /* A WHOLE NAME HAS A SPACE IN IT — the cheap test that lets nine strings in ten straight past. */
  if (!i.re || !/\s/.test(s)) return [];
  /* `exec` ON THE ONE PATTERN, not `matchAll`: § */
  const out = [];
  const re = i.re;
  re.lastIndex = 0;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const k = kidNameKey_(m[0]);
    const n = i.said[k];
    if (n === undefined) continue;
    /* A GROWN-UP'S WHOLE NAME TO THEMSELVES OR AN ADMIN IS LEFT (342) — and the search goes on from the next character rather than past it, so a child's whole name § */
    if (i.adult && i.adult[k] !== undefined && netSeesWhole_(i.adult[k])) { re.lastIndex = m.index + 1; continue; }
    out.push({ at: m.index, end: m.index + m[0].length, said: n });
  }
  re.lastIndex = 0;
  return out;
}
function kidSpansApply_(s, spans) {
  let o = '', p = 0;
  spans.forEach(z => { o += s.slice(p, z.at) + z.said; p = z.end; });
  return o + s.slice(p);
}

/** Every child's whole name in `v` (a string, or an object or array walked in place) → `nameFor_`. */
function kidNamesOff_(v, idx) {
  const i = idx || kidNamesIndex_();
  if (!i.re && !i.wholeAny) return v;
  const fix = (s, field) => {
    const sp = kidNamesSpans_(s, i, i.wholeAny && kidWholeOk_(field));
    return sp.length ? kidSpansApply_(s, sp) : s;
  };
  /* ONCE PER OBJECT. `jobs`, `liveJobs` and `clientClasses` are one array under three names, and a walk
     that followed every reference would do the rosters three times. */
  const seen = new Set();
  const walk = (x, field) => {
    if (typeof x === 'string') return fix(x, field);
    if (!x || typeof x !== 'object' || seen.has(x)) return x;
    const kind = Object.prototype.toString.call(x);
    if (kind !== '[object Object]' && kind !== '[object Array]') return x;      // a Date, a Blob
    seen.add(x);
    /* AN ARRAY'S ITEMS ARE WHAT ITS KEY SAYS THEY ARE — `forChildren: ['Thistlebrook']` is names. */
    if (Array.isArray(x)) { for (let n = 0; n < x.length; n++) x[n] = walk(x[n], field); return x; }
    Object.keys(x).forEach(k => {
      const val = walk(x[k], k);
      /* AND A KEY, because a lookup keyed by a name is a name too. */
      const k2 = fix(k, '');
      if (k2 !== k && !(k2 in x)) { delete x[k]; x[k2] = val; } else x[k] = val;
    });
    return x;
  };
  return walk(v, '');
}

/* ---------- AND ON THE WAY BACK IN: WHAT THE NET SHORTENED IS NOT WRITTEN OVER WHAT IT SHORTENED § */
function kidNamesBack_(stored, sent, field, idx) {
  if (typeof stored !== 'string' || typeof sent !== 'string' || !stored || stored === sent) return sent;
  const i = idx || kidNamesIndex_();
  const sp = kidNamesSpans_(stored, i, kidWholeOk_(field));
  if (!sp.length) return sent;
  if (kidNamesSpans_(sent, i, kidWholeOk_(field)).length) return sent;
  const shown = kidSpansApply_(stored, sp);
  if (shown === sent) return stored;
  /* WHERE EACH NAME SITS IN WHAT WAS SHOWN. */
  const segs = [];
  let shift = 0;
  sp.forEach(z => { const a = z.at - shift; segs.push({ s0: z.at, s1: z.end, n0: a, n1: a + z.said.length }); shift += (z.end - z.at) - z.said.length; });
  let p = 0;
  while (p < shown.length && p < sent.length && shown[p] === sent[p]) p++;
  let q = 0;
  while (q < shown.length - p && q < sent.length - p && shown[shown.length - 1 - q] === sent[sent.length - 1 - q]) q++;
  let a = p, b = shown.length - q;
  const letter = c => !!c && /[\p{L}\p{N}]/u.test(c);
  /* A NAME THE EDIT RUNS INTO BELONGS TO THE EDIT. Repeated until it settles, since taking one in can
     reach the next. */
  for (let moved = true; moved;) {
    moved = false;
    segs.forEach(g => {
      const sentB = sent.length - (shown.length - b), typed = a < sentB;
      if (g.n0 < a && (g.n1 > a || (g.n1 === a && typed && letter(sent[a])))) { a = g.n0; moved = true; }
      if (g.n1 > b && (g.n0 < b || (g.n0 === b && typed && letter(sent[sentB - 1])))) { b = g.n1; moved = true; }
    });
  }
  const toStored = n => { let o = n; segs.forEach(g => { if (g.n1 <= n) o += (g.s1 - g.s0) - (g.n1 - g.n0); }); return o; };
  return stored.slice(0, toStored(a)) + sent.slice(a, sent.length - (shown.length - b)) + stored.slice(toStored(b));
}

/* ---------- AND THE MAIL, THROUGH ONE DOOR § */
function mailOut_(o) {
  /* FOR THE PERSON IT GOES TO (342): § */
  /* `firstNamesOnly`: A WHOLE NAME BECOMES THE FIRST NAME ALONE, NEVER "First (@handle)". § */
  const bare = !!(o && o.firstNamesOnly);
  if (o) delete o.firstNamesOnly;
  const was = NET_VIEWER_;
  try {
    netViewerSet_(mailViewer_(o && o.to));
    const idx = bare ? kidNamesBare_(kidNamesIndex_()) : kidNamesIndex_();
    ['subject', 'body', 'htmlBody'].forEach(k => { if (typeof o[k] === 'string') o[k] = kidNamesOff_(o[k], idx); });
  } catch (err) { /* a broken people tab names no child, so there is nothing to take out */ }
  finally { NET_VIEWER_ = was; }
  return MailApp.sendEmail(o);
}
/* THE NET'S INDEX WITH EVERY " (@handle)" TAKEN OFF WHAT A NAME BECOMES — `mailOut_`'s `firstNamesOnly`. § */
function kidNamesBare_(idx) {
  const off = m => {
    const o = {};
    Object.keys(m || {}).forEach(k => { const v = S(m[k]).replace(/\s*\(@[^)]*\)\s*$/, ''); if (v && v.charAt(0) !== '@') o[k] = v; });
    return o;
  };
  const whole = off(idx.whole);
  return Object.assign({}, idx, { said: off(idx.said), whole: whole, wholeAny: Object.keys(whole).length > 0 });
}

/* WHOEVER IS ACTUALLY REACHABLE as an admin. § */
function adminName_() {
  const named = findPerson(ADMIN_NAME);
  if (named && S(named.email) && hasRole(named, 'admin')) return personDisplayName(named);
  const other = read(TAB.people).rows.find(r => hasRole(r, 'admin') && S(r.email));
  return other ? personDisplayName(other) : ADMIN_NAME;
}

/* ---------- AN ADDRESS NOBODY HAS PROVED REACHES THIS PERSON § */
function addressPending_(r) { return S(r && r.verified).toUpperCase() === 'PENDING'; }

/* THE ADDRESS THE PHONE IS TOLD IS WAITING, or blank (`pendingEmail` on the sign-in reply and on `myProfile`). § */
function pendingEmailOf_(r) { return addressPending_(r) ? S(r && r.email) : ''; }

/* ---------- "OPEN THE LINK FIRST": THE ONE ANSWER TO A CHILD-BINDING ACTION FROM AN UNPROVED ADDRESS § */
function confirmFirst_(r, then) {
  const at = S(r && r.email);
  return { error: 'Open the link we emailed to ' + (at || 'your address') + ' first — then ' + then
                  + '. "Send the link again" is on your card if it never came.',
           why: 'unconfirmed', pendingEmail: at };
}

/* ---------- DOES THIS PERSON STILL WANT THIS KIND OF EMAIL — `NOTIFY_KINDS` in constants.gs § */
function wants_(r, kind) {
  const K = NOTIFY_KINDS[S(kind)];
  if (!K || K.essential || !K.col) return true;
  return ON_(r && r[K.col]);
}

/* ---------- AND WHEN IT SAYS NO, IT IS WRITTEN DOWN, NOT DROPPED § */
function notifyHeld_(r, kind, subject) {
  try {
    console.log('notify held: ' + S(kind) + ' email not sent to ' + (S(r && r.person_id) || 'a row with no id')
      + ' — their ' + S((NOTIFY_KINDS[S(kind)] || {}).col) + ' says no. Subject: ' + S(subject));
  } catch (err) { /* a log that cannot be written must not stop the action that was being told about */ }
}

/* ---------- WHICH ROLES AN EMAIL REACHES SOMEBODY BY — ONE ANSWER FOR THE CARD AND FOR `setNotify` § */
function notifyRoles_(r) {
  const held = rolesOf(r).map(x => SELF_ROLE_ALIASES[x] || x).filter(x => NOTIFY_ALL_ROLES.indexOf(x) !== -1);
  return held.length ? held.filter((x, i) => held.indexOf(x) === i) : ['client'];
}
function notifyParent_(r) {
  /* A FAMILY TAB THAT CANNOT BE READ IS NOBODY'S CHILD — the roles still decide, which is what the card drew before this was asked. § */
  const id = S(r && r.person_id);
  if (!id) return false;
  try { return acceptedLinks().some(l => S(l.parent_id) === id); } catch (err) { return false; }
}
function notifyHow_(r, K, parent) {
  if (!K) return [];
  const mine = notifyRoles_(r).filter(x => K.roles.indexOf(x) !== -1);
  if (!mine.length && K.parents && (parent === undefined ? notifyParent_(r) : parent)) mine.push('client');
  return mine;
}

/* ---------- WHAT THE NOTIFICATIONS CARD DRAWS FOR THIS PERSON § */
function notifyOf_(r) {
  const parent = notifyParent_(r);
  let mode = 'off';
  try { mode = digestMode_(config()); } catch (err) { mode = 'off'; }
  const kinds = [];
  Object.keys(NOTIFY_KINDS).forEach(k => {
    const K = NOTIFY_KINDS[k];
    /* `hidden` — still a kind, still honoured by `wants_` and `setNotify`, just not drawn (see `referrals`). */
    if (K.hidden) return;
    const mine = notifyHow_(r, K, parent);
    if (!mine.length) return;
    const notes = [];
    mine.forEach(x => { const n = (K.noteFor && K.noteFor[x]) || K.note; if (notes.indexOf(n) === -1) notes.push(n); });
    const out = { kind: k, label: K.label, note: notes.join(' · ') };
    if (K.essential) out.essential = true;
    else out.on = wants_(r, k);
    if (k === 'weekly' && mode !== 'send') out.idle = 'Not being sent yet';
    kinds.push(out);
  });
  return { to: S(r && r.email), held: addressPending_(r), kinds: kinds };
}

/** Send an email. Skips silently when there's no address — a missing email must not break a move. */
/* ---------- `kind` IS WHICH OF `NOTIFY_KINDS` THIS IS, AND EVERY CALLER NAMES ONE § */
function notify(name, subject, body, kind) {
  try {
    const p = findPerson(name);
    const to = p ? S(p.email) : '';
    if (!to) return false;
    /* NOT TO AN ADDRESS NOBODY CONFIRMED — see `addressPending_`. False, as for no address: the caller
       carries on either way, and a booking notice in a stranger's inbox is the worse of the two. */
    if (addressPending_(p)) return false;
    /* NOT A KIND THEY HAVE TURNED OFF — see `wants_`. False, like the two above: the action that wanted
       to tell them has happened, and whether they hear of it by email was theirs to decide. */
    if (!wants_(p, kind)) { notifyHeld_(p, kind, subject); return false; }
    mailOut_({ to, subject, body, name: '@family.' });
    return true;
  } catch (err) {
    return false;
  }
}

/* The catalogue as the SHEET has it, falling back to the code list until the tab is seeded. § */
function avatarCatalogue() {
  const rows = read(TAB.shop).rows.filter(r => norm(r.kind) === 'avatar' && S(r.art_id) && S(r.slot));
  const fromShop = rows.map(r => ({
    id: S(r.art_id), slot: norm(r.slot), name: S(r.name) || S(r.art_id),
    /* ---------- `r.price` IS NOT A COLUMN OF THIS TAB § */
    level: N(r.level_required) || 0, cost: N(r.price_coins) || 0,
    free: !N(r.level_required) && !N(r.price_coins), _row: r._row
  }));

  /* THE FREE ITEMS ARE ALWAYS IN, whether or not the shop knows about them. § */
  const have = {};
  fromShop.forEach(x => { have[x.slot + ':' + x.id] = true; });
  const missing = AVATAR_ITEMS.filter(it => !have[norm(it.slot) + ':' + it.id])
    .map(it => ({ id: it.id, slot: norm(it.slot), name: it.name,
                  level: it.level || 0, cost: it.cost || 0,
                  free: !!it.free || (!it.level && !it.cost), _row: 0 }));

  return fromShop.concat(missing);
}

/** Everything this person may wear right now, and why. */
function avatarUnlocks(row) {
  const level = levelFromXp(N(row.xp));
  const owned = S(row.avatar_owned).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  return avatarCatalogue().map(it => ({
    id: it.id, slot: it.slot, name: it.name,
    level: it.level || 0, cost: it.cost || 0,
    unlocked: !!it.free || (it.level && level >= it.level) || owned.indexOf(it.slot + ':' + it.id) !== -1,
    row: it._row || 0
  }));
}

/** Ten ticked topics is one level. Whole levels only — the same rule the card shows. */
function levelFromXp(xp) { return Math.floor((N(xp) || 0) / 10); }
/* ---------- PEOPLE MADE, CHANGED AND REMOVED BY AN ADMIN (373) ---------- */
/* THE FOUR ROLES THE FORM TICKS, in the order it draws them. `client` is the sheet's word for a parent. */
const PEOPLE_ROLES_ = ['student', 'client', 'tutor', 'admin'];
function adminRolesIn_(v) {
  const list = (Array.isArray(v) ? v : S(v).split(',')).map(x => norm(x) === 'parent' ? 'client' : norm(x));
  return PEOPLE_ROLES_.filter(r => list.indexOf(r) !== -1);
}
/* A DATE PICKER'S `yyyy-mm-dd` AS THE THREE BOXES `dobRefusal_` AND `dobIn` READ; null for anything else. */
function adminDobFields_(v) {
  const t = S(v);
  if (!t) return { dob_d: '', dob_m: '', dob_y: '' };
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? { dob_d: m[3], dob_m: m[2], dob_y: m[1] } : null;
}
function adminCount_(t) { return t.rows.filter(x => hasRole(x, 'admin')).length; }

/* A PERSON AS THE ADMIN'S FORM READS THEM. `lastName` is a box the child-name net leaves whole (`kidWholeOk_`). */
function adminPersonOut_(r) {
  const pid = S(r.person_id);
  return { personId: pid, firstName: S(r.first_name), lastName: S(r.last_name), roles: rolesOf(r),
           email: S(r.email), dob: isoDate_(r.date_of_birth), handle: S(r.handle),
           parentIds: read(TAB.family).rows
             .filter(f => S(f.child_id) === pid && norm(f.state) === 'accepted').map(f => S(f.parent_id)) };
}
/* THE GROWN-UPS A CHILD CAN BE PUT ON, for the form's parent list — the people tab's parents, by whole name. */
function adminParentChoices_() {
  return read(TAB.people).rows.filter(r => S(r.person_id) && hasRole(r, 'client'))
    .map(r => ({ personId: S(r.person_id), name: personDisplayName(r) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
/* THE CARD THE COLUMN DRAWS, in `everyone`'s shape (doget.gs), so a saved person is drawn without a reload. */
function adminPersonCard_(r) {
  return Object.assign({ personId: S(r.person_id), title: nameFor_(r, true), handle: S(r.handle),
    role: ROLE_LABEL[mainRole(r)] || 'Client', image: S(r.photo) }, faceFig_(r));
}

/* EVERY REFUSAL BEFORE A CELL IS WRITTEN: '' or the sentence. `r` is the row being edited, or null for a new one. */
function adminPersonRefusal_(t, body, r) {
  const first = S(body.firstName), last = S(body.lastName), email = S(body.email);
  if (!first || !last) return 'A first name and a last name, please.';
  const roles = adminRolesIn_(body.roles);
  if (!roles.length) return 'Tick at least one role.';
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'That email address does not look right.';
  const mine = x => !!r && S(x.person_id) === S(r.person_id);
  if (email && t.rows.some(x => !mine(x) && norm(x.email) === norm(email))) return 'Somebody else already has that email address.';
  const clash = findPerson((first + ' ' + last).trim());
  if (clash && !mine(clash)) return 'There is already somebody called ' + first + ' ' + last + '.';
  const dob = adminDobFields_(body.dob);
  if (!dob) return 'The date of birth is not a date.';
  const dobSaid = dobRefusal_(dob);
  if (dobSaid) return dobSaid;
  if (r && hasRole(r, 'admin') && roles.indexOf('admin') === -1 && adminCount_(t) <= 1) {
    return S(r.first_name) + ' is the last admin — make somebody else an admin first.';
  }
  const want = Array.isArray(body.parentIds) ? body.parentIds.map(S).filter(Boolean) : [];
  for (let i = 0; i < want.length; i++) {
    const p = t.rows.find(x => S(x.person_id) === want[i]);
    if (!p) return 'One of the parents ticked is not on the people tab any more.';
    if (mine(p)) return 'Nobody is their own parent.';
    /* `linkChild`'S RULE: no child onto an account whose address nobody has proved, even by an admin. */
    if (addressPending_(p)) return personDisplayName(p) + '\'s email has not been confirmed, so no child can go on their account yet.';
  }
  return '';
}

/* THE CHILD'S ACCEPTED PARENTS MADE EXACTLY `want`: links not wanted are removed, missing ones made or settled. */
function adminParentsSet_(child, want) {
  const fam = read(TAB.family);
  if (!fam.sheet) return false;
  const cid = S(child.person_id);
  fam.rows.filter(f => S(f.child_id) === cid && norm(f.state) === 'accepted' && want.indexOf(S(f.parent_id)) === -1)
    .sort((a, b) => b._row - a._row).forEach(f => delRow(fam, f));
  want.forEach((pid, i) => {
    const had = fam.rows.find(f => S(f.child_id) === cid && S(f.parent_id) === pid);
    if (had && norm(had.state) === 'accepted') return;
    if (had) { setCells(fam, had, { state: 'accepted', answered_on: new Date() }); return; }
    addRow(fam, { link_id: 'F' + Date.now() + '-' + i, parent_id: pid, child_id: cid,
      child_typed: personDisplayName(child), state: 'accepted', asked_on: new Date(), answered_on: new Date() });
  });
  return true;
}

/* REMOVED WHOLE: every family row naming them, their sessions, then the row. Bookings and messages keep the name they had. */
function adminPersonDelete_(t, r) {
  const fam = read(TAB.family), pid = S(r.person_id);
  if (fam.sheet) {
    fam.rows.filter(f => S(f.parent_id) === pid || S(f.child_id) === pid)
      .sort((a, b) => b._row - a._row).forEach(f => delRow(fam, f));
  }
  authEndSession_(t, r);
  return delRow(t, r);
}
