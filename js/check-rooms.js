#!/usr/bin/env node
/* node js/check-rooms.js — A ROOM'S BLANK CELL IS ITS VENUE'S, ASKED OF THE REAL BACKEND § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (name, ok, msg) => { asked++; if (!ok) bad.push(name + ' — ' + msg); };
const J = v => JSON.stringify(v);

const CW = 'Colliers Wood Library', EH = 'Example Hall';
const label = (v, r) => v + ' — ' + r;           // what `bookableSpaces` calls a room
const VENUES = [
  { venue_id: 'V002', name: CW, cost_per_hour: 15, max_students: 4, min_students: 1,
    availability: 'm16,m17,sa10', travel_cost: 3 },
  { venue_id: 'V900', name: EH, cost_per_hour: 20, max_students: 6, min_students: 2 },
];
const ROOMS = [
  /* THE OWNER'S THREE, as the paste block has them: no rate, no minimum, no hours — only a size. */
  { room_id: 'R1', venue: CW, name: 'Small room 1', max_capacity: 4, notes: 'Same size as Small room 2', active: 'TRUE' },
  { room_id: 'R2', venue: CW, name: 'Small room 2', max_capacity: 4, notes: 'Same size as Small room 1', active: 'TRUE' },
  { room_id: 'R3', venue: CW, name: 'Large room 1', max_capacity: 10, active: 'TRUE' },
  /* AND THE CASES THEY DO NOT REACH, in an invented building: a room free on purpose, and one with a
     rate, a minimum and hours of its own but no capacity typed. */
  { room_id: 'R4', venue: EH, name: 'Small room 1', rate_per_hour: 0, max_capacity: 3, active: 'TRUE' },
  { room_id: 'R5', venue: EH, name: 'Medium room 1', rate_per_hour: 25, min_capacity: 3, availability: 'tu09', active: 'TRUE' },
];
const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London' };
const PEOPLE = [
  Object.assign({ person_id: 'P-T1', first_name: 'Ada', last_name: 'Tutor', handle: 'adatutor', email: 'tutor@example.org',
    role: 'tutor', rate_per_hour: 14, max_students: 10, min_students: 1, dbs_checked: true }, base),
  Object.assign({ person_id: 'P-C1', first_name: 'Pat', last_name: 'Parent', handle: 'patparent', email: 'parent@example.org',
    role: 'client' }, base),
];
const CONFIG = [
  { key: 'h', value: 2 }, { key: 'open_tutor_rate', value: 14 }, { key: 'waitlist_seats', value: 8 },
  { key: 'waitlist_extra_seat', value: 3 }, { key: 'max_open_requests', value: 20 },
];

function make() {
  const b = backend();
  b.seed('venues', VENUES);
  b.seed('rooms', ROOMS);
  b.seed('people', PEOPLE);
  b.seed('config', CONFIG);
  return b;
}

/* ---------- 1. THE PAYLOAD ----------------------------------------------------------------------- */
(() => {
  const b = make();
  const p = b.get({});
  const v = (p.venues || []).find(x => x.title === CW), e = (p.venues || []).find(x => x.title === EH);
  if (!v || !e) { rule('1. payload', false, 'doGet sent no ' + (!v ? CW : EH) + ' — nothing below could be asked'); return; }
  const rooms = v.rooms || [];
  rule('1. three rooms', J(rooms.map(r => r.name)) === J(['Small room 1', 'Small room 2', 'Large room 1']),
    CW + ' was sent rooms ' + J(rooms.map(r => r.name)));
  rooms.forEach(r => {
    rule('1. a blank rate is the venue\'s', r.rate === 15,
      r.name + ' has no rate typed and was sent rate ' + J(r.rate) + ' — the venue charges 15, and 0 is drawn "free"');
    rule('1. a blank minimum is the venue\'s', r.min === 1, r.name + ' was sent min ' + J(r.min));
    rule('1. a blank hours cell is the venue\'s', J(r.avail) === J(v.avail) && r.avail && r.avail.m16 === 'TRUE' && r.avail.tu09 === '',
      r.name + ' was sent hours ' + J(r.avail && Object.keys(r.avail).filter(k => r.avail[k])) + ', not the building\'s m16, m17, sa10');
    rule('1. the cell as typed is still blank', r.fields && r.fields.rate_per_hour === '',
      r.name + '\'s fields.rate_per_hour is ' + J(r.fields && r.fields.rate_per_hour) + ' — an editor would see a price nobody typed');
  });
  rule('1. each room\'s own capacity', J(rooms.map(r => r.max)) === J([4, 4, 10]), 'capacities sent ' + J(rooms.map(r => r.max)));
  const free = (e.rooms || []).find(r => r.name === 'Small room 1'), own = (e.rooms || []).find(r => r.name === 'Medium room 1');
  rule('1. an explicit 0 stays 0', free && free.rate === 0,
    EH + ' — Small room 1 has 0 typed and was sent rate ' + J(free && free.rate) + ' — free on purpose became the venue\'s 20');
  rule('1. a blank minimum is the venue\'s, not 1', free && free.min === 2, EH + ' — Small room 1 was sent min ' + J(free && free.min) + ', the venue\'s is 2');
  rule('1. a room\'s own rate wins', own && own.rate === 25, EH + ' — Medium room 1 was sent rate ' + J(own && own.rate) + ', its own is 25');
  rule('1. a room\'s own minimum wins', own && own.min === 3, EH + ' — Medium room 1 was sent min ' + J(own && own.min));
  rule('1. a blank capacity is the venue\'s', own && own.max === 6,
    EH + ' — Medium room 1 has no capacity typed and was sent max ' + J(own && own.max) + ' — the server caps it at the venue\'s 6');
  rule('1. a room\'s own hours win', own && own.avail && own.avail.tu09 === 'TRUE' && Object.keys(own.avail).filter(k => own.avail[k]).length === 1,
    EH + ' — Medium room 1 was sent hours ' + J(own && own.avail && Object.keys(own.avail).filter(k => own.avail[k])));
})();

/* ---------- 2. THE SEAT CAP ---------------------------------------------------------------------- */
(() => {
  const b = make();
  const cap = n => b.ev('capacityFor("venue", ' + J(n) + ')');
  [['Small room 1', 4], ['Small room 2', 4], ['Large room 1', 10]].forEach(([r, n]) =>
    rule('2. capacityFor a room', cap(label(CW, r)) === n, label(CW, r) + ' holds ' + J(cap(label(CW, r))) + ', not ' + n));
  rule('2. capacityFor the bare building', cap(CW) === 4, CW + ' holds ' + J(cap(CW)) + ', not its own 4');
  rule('2. capacityFor a room with no capacity typed', cap(label(EH, 'Medium room 1')) === 6,
    label(EH, 'Medium room 1') + ' holds ' + J(cap(label(EH, 'Medium room 1'))) + ', not the building\'s 6');
})();

/* ---------- 3. THE PRICE FLOOR ------------------------------------------------------------------- */
(() => {
  const b = make();
  const wrong = o => b.ev('priceLooksWrong(' + J(Object.assign({ hours: 2, weeks: 1, seats: 1 }, o)) + ')');
  /* (15 room + 14 cheapest tutor) x 2 hours = 58, refused below half of it. 25 covers the teaching
     alone, so it passes only if the room is judged free. */
  rule('3. a blank-rate room is judged at the venue\'s rate', !!wrong({ venue: label(CW, 'Large room 1'), price: 25 }),
    '25 for two hours in ' + label(CW, 'Large room 1') + ' was accepted — the room was judged free');
  rule('3. a price that covers the room passes', !wrong({ venue: label(CW, 'Large room 1'), price: 60 }),
    '60 for two hours in ' + label(CW, 'Large room 1') + ' was refused: ' + J(wrong({ venue: label(CW, 'Large room 1'), price: 60 })));
  rule('3. a free-on-purpose room is judged free', !wrong({ venue: label(EH, 'Small room 1'), price: 20 }),
    '20 for two hours in ' + label(EH, 'Small room 1') + ' (rate 0, typed) was refused: ' + J(wrong({ venue: label(EH, 'Small room 1'), price: 20 })));
})();

/* ---------- 4. A BOOKING, THROUGH doPost ----------------------------------------------------------- */
(() => {
  const b = make();
  const tk = b.post({ action: 'verifyLogin', email: 'parent@example.org', pin: '0000' });
  if (!tk || !tk.token) { rule('4. sign in', false, 'the invented parent could not sign in, so createJob was never asked'); return; }
  const day = new Date(); day.setDate(day.getDate() + 14);
  const dmy = day.getDate() + '/' + (day.getMonth() + 1) + '/' + day.getFullYear();
  const job = price => b.post({ action: 'createJob', token: tk.token, clientName: tk.name, personId: 'P-C1',
    subject: 'Maths', level: 'GCSE', day: 'Monday', time: '16:00', hours: 2, dates: dmy, n: 6,
    location: label(CW, 'Large room 1'), price, requestedTutor: 'No preference', requestId: 'rq-' + price });
  const low = job(25);
  rule('4. createJob refuses a room priced as free', !!low.error && !low.success,
    'a booking of ' + label(CW, 'Large room 1') + ' at 25 for two hours was ' + J(low).slice(0, 160));
  const ok = job(60);
  rule('4. createJob takes a room booking that covers it', !!ok.success, 'a booking at 60 was answered ' + J(ok).slice(0, 200));
  const h = b.tabs.jobs[0], row = b.tabs.jobs[b.tabs.jobs.length - 1];
  const cell = c => row[h.indexOf(c)];
  rule('4. the job is in the room', cell('venue') === label(CW, 'Large room 1'), 'the job row says venue ' + J(cell('venue')));
  rule('4. the building\'s travel, for a booking in any room', Number(cell('travel_paid')) === 3,
    'travel_paid is ' + J(cell('travel_paid')) + ' — ' + CW + ' charges 3 a journey and one session was booked');
})();

/* ---------- 5. THE WAITING LIST ------------------------------------------------------------------ */
(() => {
  const b = make();
  const w = n => b.ev('waitlistPrice(' + J(n) + ')');
  const big = w(label(CW, 'Large room 1')), small = w(label(CW, 'Small room 1'));
  /* (15 room + 14 open tutor + 3 a seat after the first) / seats — eight seats where the room holds
     ten and the config allows eight, four where it holds four. */
  rule('5. a large room\'s list', big && big.seats === 8 && big.perSeatHour === 6.25,
    label(CW, 'Large room 1') + ' prices a seat at ' + J(big) + ' — wanted 8 seats at 6.25 an hour');
  rule('5. a small room\'s list', small && small.seats === 4 && small.perSeatHour === 9.5,
    label(CW, 'Small room 1') + ' prices a seat at ' + J(small) + ' — wanted 4 seats at 9.5 an hour');
  /* ---------- AND A ROOM WHOSE RATE IS NOT ITS VENUE'S § */
  const own = w(label(EH, 'Medium room 1')), nought = w(label(EH, 'Small room 1'));
  rule('5. a room\'s own rate prices its list', own && own.seats === 6 && own.perSeatHour === 9,
    label(EH, 'Medium room 1') + ' prices a seat at ' + J(own) + ' — wanted 6 seats at 9 an hour, from the room\'s own 25');
  rule('5. a free-on-purpose room\'s list is priced free', nought && nought.seats === 3 && nought.perSeatHour === 6.67,
    label(EH, 'Small room 1') + ' prices a seat at ' + J(nought) + ' — wanted 3 seats at 6.67 an hour, the room\'s typed 0');
  const p = b.get({});
  const seats = p.waitlistSeat || {};
  ['Small room 1', 'Small room 2', 'Large room 1'].forEach(r =>
    rule('5. doGet sends a seat price under the room\'s label', seats[label(CW, r)] && seats[label(CW, r)].perHour > 0,
      'waitlistSeat has no ' + J(label(CW, r)) + ' — the booking form looks a room\'s list up by that, and found ' + J(Object.keys(seats))));
})();

/* ---------- 6. THE FIXTURE SENDS WHAT doGet SENDS --------------------------------------------------- */
(() => {
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'check', 'fixture.json'), 'utf8'));
  const withRooms = (fx.venues || []).filter(v => (v.rooms || []).length);
  rule('6. the fixture has a venue with rooms', withRooms.some(v => v.rooms.length >= 3),
    'no fixture venue has three rooms, so nothing on the phone side is asked about rooms');
  withRooms.forEach(v => {
    const b = backend();
    b.seed('venues', [{ name: v.title, cost_per_hour: v.bestRate, max_students: v.maxCapacity, min_students: v.minCapacity }]);
    b.seed('rooms', v.rooms.map(r => r.fields || {}));
    const got = ((b.get({}).venues || []).find(x => x.title === v.title) || {}).rooms || [];
    const strip = rs => rs.map(r => J(Object.assign({}, r, { rowIndex: 0 })));
    rule('6. the fixture\'s rooms are doGet\'s', J(strip(got)) === J(strip(v.rooms)),
      v.title + '\'s rooms in check/fixture.json are not what doGet sends for the same cells: '
      + J(v.rooms.map(r => [r.name, r.rate, r.min, r.max])) + ' against ' + J(got.map(r => [r.name, r.rate, r.min, r.max])));
  });
  /* ---------- AND SO ARE ITS ROOMS' WAITING-LIST SEATS § */
  withRooms.forEach(v => {
    const seat = (fx.waitlistSeat || {})[v.title];
    if (!seat) { rule('6. the fixture\'s building has a seat price', false, v.title + ' has rooms and no waitlistSeat entry to work the config back from'); return; }
    const b = backend();
    b.seed('venues', [{ name: v.title, cost_per_hour: v.bestRate, max_students: v.maxCapacity, min_students: v.minCapacity }]);
    b.seed('rooms', v.rooms.map(r => r.fields || {}));
    b.seed('config', [{ key: 'waitlist_seats', value: seat.seats }, { key: 'h', value: seat.hours },
      { key: 'waitlist_extra_seat', value: 0 },
      { key: 'open_tutor_rate', value: Math.round((seat.perHour * seat.seats - Number(v.bestRate)) * 100) / 100 }]);
    const sent = b.get({}).waitlistSeat || {};
    [v.title].concat(v.rooms.map(r => label(v.title, r.name))).forEach(at =>
      rule('6. the fixture\'s waiting-list seat is doGet\'s', J(sent[at]) === J((fx.waitlistSeat || {})[at]),
        J(at) + ' in check/fixture.json\'s waitlistSeat is ' + J((fx.waitlistSeat || {})[at])
        + ', and doGet sends ' + J(sent[at]) + ' for the same cells'));
  });
})();

/* ---------- 7. EVERY BOOKED HOUR HOLDS ITS ROOM AND ITS TUTOR (434) ------------------------------- */
(() => {
  const b = make();
  b.ev("(function(){ const t = read(TAB.people); const r = t.rows.find(x => x.person_id === 'P-T1'); setCell(t, r, 'availability', 'm16,m17,m18,f16,f17'); })()");
  const tk = b.post({ action: 'verifyLogin', email: 'parent@example.org', pin: '0000' });
  if (!tk || !tk.token) { rule('7. sign in', false, 'the invented parent could not sign in, so nothing was booked'); return; }
  /* RUNNING NOW (a week ago to a fortnight on), so the payload's today-window sees it. */
  const at = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); };
  const dates = [at(-7), at(7), at(14)].join(', ');
  let n = 0;
  const book = (where, day, time, hours, slots, tutor) => b.post({ action: 'createJob', token: tk.token, clientName: tk.name,
    personId: 'P-C1', subject: 'Maths', level: 'GCSE', day, time, hours, slots, dates, n: 1, location: where, price: 200,
    requestedTutor: tutor || 'No preference', requestId: 'rq7-' + (++n) });
  const rows = () => b.tabs.jobs.length - 1;
  const S1 = label(CW, 'Small room 1'), S2 = label(CW, 'Small room 2'), L1 = label(CW, 'Large room 1');

  const two = book(S1, 'Monday', '16:00', 2, 'm16,m17');
  rule('7. a two-hour booking is taken', !!two.success, 'Monday 16–18 in ' + S1 + ' was answered ' + J(two).slice(0, 200));
  const h = b.tabs.jobs[0], last = () => b.tabs.jobs[b.tabs.jobs.length - 1];
  rule('7. slot_codes holds both hours', last()[h.indexOf('slot_codes')] === 'm16,m17',
    'the job row\'s slot_codes is ' + J(last()[h.indexOf('slot_codes')]) + ', wanted "m16,m17"');
  const busy = Object.keys(b.ev('spaceBusy(' + J(S1) + ')')).sort().join(' ');
  rule('7. the room is busy both hours', busy === 'm16 m17', S1 + ' is busy [' + busy + '], wanted [m16 m17]');
  b.ev('clearCache()');
  const room = ((((b.get({}).venues || []).find(x => x.title === CW) || {}).rooms) || []).find(r => r.name === 'Small room 1') || {};
  rule('7. doGet sends the room\'s busy hours', J(Object.keys(room.busy || {}).sort()) === J(['m16', 'm17']),
    S1 + ' was sent busy ' + J(room.busy));

  const before = rows();
  const clash = book(S1, 'Monday', '17:00', 2, 'm17,m18');
  rule('7. a booking over the second hour is refused', !clash.success && /already booked at Monday 17:00/.test(String(clash.error || '')),
    'Monday 17–19 in ' + S1 + ' (17:00 already taken) was answered ' + J(clash).slice(0, 200));
  rule('7. and nothing is written', rows() === before, 'the refused booking left ' + (rows() - before) + ' job row(s)');
  const other = book(S2, 'Monday', '17:00', 2, 'm17,m18');
  rule('7. the same hours in another room are taken', !!other.success, S2 + ' at Monday 17–19 was answered ' + J(other).slice(0, 200));

  /* TWO DAYS AT TWO TIMES: the old row read Mon 16 + Fri 16, so Friday 17 was sold twice. */
  const runs = book(L1, 'Monday, Friday', '16:00', 1, 'm16,f17', 'Ada Tutor');
  rule('7. Mon 16 + Fri 17 with Ada is taken', !!runs.success, J(runs).slice(0, 200));
  rule('7. slot_codes holds both runs', last()[h.indexOf('slot_codes')] === 'm16,f17',
    'slot_codes is ' + J(last()[h.indexOf('slot_codes')]) + ', wanted "m16,f17"');
  const fri = book(L1, 'Friday', '17:00', 1, 'f17');
  rule('7. the room\'s Friday 17:00 is refused', !fri.success && /Friday 17:00/.test(String(fri.error || '')), J(fri).slice(0, 200));
  const ada = book(CW, 'Friday', '17:00', 1, 'f17', 'Ada Tutor');
  rule('7. Ada\'s Friday 17:00 is refused', !ada.success && /already teaching at Friday 17:00/.test(String(ada.error || '')), J(ada).slice(0, 200));
  const adaFree = book(CW, 'Friday', '16:00', 1, 'f16', 'Ada Tutor');
  rule('7. Ada\'s Friday 16:00 (never booked) is free', !!adaFree.success, J(adaFree).slice(0, 200));
})();

/* ---------- 8. THE BACKFILL, TWICE (434) ------------------------------------------------------------- */
(() => {
  const b = make();
  b.seed('jobs', [
    { job_id: 'J-OLD', weekday: 'Monday, Wednesday', start_time: '10:00', hours_per_session: 2, venue: label(CW, 'Small room 1') },
    { job_id: 'J-NEW', weekday: 'Monday', start_time: '10:00', hours_per_session: 1, slot_codes: 'm10,f16' },
    { job_id: 'J-NONE', weekday: '', start_time: '' },
  ]);
  const first = b.ev('backfillSlotCodes_()'), second = b.ev('backfillSlotCodes_()');
  const h = b.tabs.jobs[0], cell = id => b.tabs.jobs.find(r => r[h.indexOf('job_id')] === id)[h.indexOf('slot_codes')];
  rule('8. an old row is filled', cell('J-OLD') === 'm10,m11,w10,w11', 'J-OLD\'s slot_codes became ' + J(cell('J-OLD')));
  rule('8. a row that has them is left alone', cell('J-NEW') === 'm10,f16', 'J-NEW\'s slot_codes became ' + J(cell('J-NEW')));
  rule('8. a row with no hours is left blank', cell('J-NONE') === '', 'J-NONE\'s slot_codes became ' + J(cell('J-NONE')));
  rule('8. the first run wrote one row', first && first.wrote === 1 && first.noHours === 1, 'the first run said ' + J(first));
  rule('8. the second run writes nothing', second && second.wrote === 0, 'the second run said ' + J(second));
  rule('8. it is a migration', /id: 'jobs-slot-codes'[\s\S]{0,300}backfillSlotCodes_\(\)/.test(fs.readFileSync(path.join(__dirname, '..', 'backend', 'constants.gs'), 'utf8')),
    'no MIGRATIONS entry runs backfillSlotCodes_, so the setup an admin\'s page load runs (361) never fills old jobs');
})();

console.log('');
if (bad.length) {
  bad.forEach(x => console.log('  FAIL  ' + x));
  console.log('');
  console.log('FAILED — ' + bad.length + ' of ' + asked + ' rules about rooms are broken.');
  process.exit(1);
}
console.log('OK — ' + asked + ' rules hold: a room\'s blank rate, minimum, capacity and hours are its venue\'s and an explicit 0 '
  + 'stays 0, in the payload, the seat cap (4, 4 and 10), the price floor, a real booking, the travel and the waiting list; '
  + 'and the fixture\'s rooms are what doGet sends; every booked hour holds its room and tutor, and the backfill fills old jobs once.');
