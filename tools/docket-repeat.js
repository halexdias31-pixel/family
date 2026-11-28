#!/usr/bin/env node
/* @family. — tools/docket-repeat.js THE ONE TIME LIST REPEATS AS A CALENDAR DOES (rule 1.75; owner 27 Nov: "everything with a time follows the common
   calendar file standard (.ics)"; "repeats follow the calendar standard incl. a different first one (e.g. Sat 14:30 once, then Wed 18:00 weekly) and
   single moved occurrences"). What the owner would notice, on a made-up Saturday (no real item text here, by design):
   (1) THE DATES, js/map.js dkOccur_ run as served: the different first one and then the weekly one; a cancelled one gone (EXDATE); a moved one at its
       new time, once (RECURRENCE-ID); UNTIL and COUNT end it; every 8 hours; weekly on two days; every other week.
   (2) ON THE LIST, dkSort_ and dkTick_: the event is later ("from 14:30") until it starts, then open on top; a tick is that occurrence's, and the next
       comes back on its own day ("from Wed 18:00"); a past one-off event is not offered; an undated to-do is offered as before.
   (3) DECLARED ONCE: kinds.json docket.list declares start, rrule, rdate, exdate and moved; backend/cards-gen.gs's copy gives the site's order with
       events in it at every half hour. Each rule proved by mutating the served source (--prove prints the count). Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const { report, main, text } = require('./lib/gen.js');
const { planner } = require('./docket-plan.js');

const DAY = '2026-11-28';   // a Saturday
const LESSON = () => ({ title: 'Made-up lesson', start: '2026-12-02T18:00', rrule: 'FREQ=WEEKLY;BYDAY=WE', rdate: [DAY + 'T14:30'],
  exdate: ['2026-12-09T18:00'], moved: ['2026-12-16T18:00=2026-12-17T19:00'], minutes: 60, place: 'out' });
const LIST = () => [{ title: 'Made-up wake item', repeat: '8h', anchor: 'wake', minutes: 5 }, LESSON(), { title: 'Made-up undated to-do' },
  { title: 'Made-up past event', start: '2026-11-20T10:00', minutes: 30 }];
const occ = (P, it, a, b) => P.dkOccur_(it, P.dkMin_(a), P.dkMin_(b)).map(P.dkIso_).join(',');
const at = (P, hm, L) => P.dkSort_(L, DAY + ' ' + hm, P.dkLeaves_(L, DAY + ' ' + hm));
const RULES = [
  ['(1) a different first one: Sat 14:30 once, then Wed 18:00 weekly', P => occ(P, LESSON(), '2026-11-27', '2026-12-08') === '2026-11-28T14:30,2026-12-02T18:00'],
  ['(1) a cancelled one is gone (EXDATE 9 Dec)', P => occ(P, LESSON(), '2026-12-08', '2026-12-12') === ''],
  ['(1) a moved one is at its new time, once (16 Dec 18:00 to 17 Dec 19:00)', P => occ(P, LESSON(), '2026-12-14', '2026-12-24') === '2026-12-17T19:00,2026-12-23T18:00'],
  ['(1) UNTIL ends it (daily until 2 Dec: three days)', P => occ(P, { start: '2026-11-30T09:00', rrule: 'FREQ=DAILY;UNTIL=20261202' }, '2026-11-01', '2027-01-01') === '2026-11-30T09:00,2026-12-01T09:00,2026-12-02T09:00'],
  ['(1) COUNT ends it, the first one counted (every 8 hours, 4 times)', P => occ(P, { start: DAY + 'T06:00', rrule: 'FREQ=HOURLY;INTERVAL=8;COUNT=4' }, '2026-11-01', '2027-01-01')
    === '2026-11-28T06:00,2026-11-28T14:00,2026-11-28T22:00,2026-11-29T06:00'],
  ['(1) weekly on two days, from a start years back (BYDAY=MO,TH)', P => occ(P, { start: '2020-01-06T09:00', rrule: 'FREQ=WEEKLY;BYDAY=MO,TH' }, '2026-11-27', '2026-12-08')
    === '2026-11-30T09:00,2026-12-03T09:00,2026-12-07T09:00'],
  ['(1) every other week (INTERVAL=2)', P => occ(P, { start: '2026-11-28T10:00', rrule: 'FREQ=WEEKLY;INTERVAL=2' }, '2026-11-28', '2026-12-31') === '2026-11-28T10:00,2026-12-12T10:00,2026-12-26T10:00'],
  ['(2) before it starts it is later, "from 14:30"', P => { const L = LIST(), g = at(P, '14:00', L); return g.open.indexOf(1) < 0 && P.dkWhen_(g.when[1], DAY + ' 14:00') === 'from 14:30'; }],
  ['(2) once it starts it is open, on top (above a wake item)', P => at(P, '14:30', LIST()).open[0] === 1],
  ['(2) a tick is that occurrence\'s; done for the day, then back on its own day ("from Wed 18:00")', P => { const L = LIST(); P.dkTick_(L, 1, true, DAY + ' 14:40');
    const sun = '2026-11-29 09:00', g = P.dkSort_(L, sun, []);
    return L[1].doneOn === DAY + 'T14:30' && at(P, '16:00', L).done.indexOf(1) >= 0 && g.later.indexOf(1) >= 0 && P.dkWhen_(g.when[1], sun) === 'from Wed 18:00'; }],
  ['(2) an untick clears it', P => { const L = LIST(); P.dkTick_(L, 1, true, DAY + ' 14:40'); P.dkTick_(L, 1, false, DAY + ' 14:41'); return !L[1].doneOn && at(P, '14:45', L).open[0] === 1; }],
  ['(2) a past one-off event is not offered', P => { const g = at(P, '09:00', LIST()); return g.open.indexOf(3) < 0 && g.later.indexOf(3) < 0; }],
  ['(2) an undated to-do is offered as before', P => at(P, '09:00', LIST()).open.indexOf(2) >= 0],
  ['(2) the lesson away keeps a stay item from ending while away (owner 28 Nov: home when it ends; it may run meanwhile)', P => { const L = LIST().concat({ title: 'Made-up laundry', repeat: '8h', minutes: 5, runs: 60, stay: true, place: 'home' });
    const g = at(P, '14:00', L); return g.open.indexOf(4) < 0 && P.dkWhen_(g.when[4], DAY + ' 14:00') === 'from 14:25'; }],
];
const MUTS = [
  ['no different first (RDATE ignored)', s => s.replace('list(it.rdate).map(dkMin_).forEach(m => { if (m != null) keep(m); });', '')],
  ['EXDATE ignored', s => s.replace('if (ex.indexOf(m) >= 0) return; ', '')],
  ['a moved one left where it was', s => s.replace('const n = moved[m] != null ? moved[m] : m;', 'const n = m;')],
  ['UNTIL ignored', s => s.replace('(until != null && m > until) || ', '')],
  ['COUNT ignored', s => s.replace('(count && n >= count) || ', '')],
  ['INTERVAL ignored', s => s.replace('Math.max(1, Math.floor(+r.INTERVAL) || 1)', '1')],
  ['BYDAY ignored', s => s.replace('(days.length ? days : [(d0 + 3) % 7])', '[(d0 + 3) % 7]')],
  ['an event not pinned on top', s => s.replace('dkEv_(it) ? -1 :', '')],
  ['an event open before its time', s => s.replace('if (m <= t) return g.open.push(i);', 'return g.open.push(i);')],
  ['a tick for the day, not the occurrence', s => s.replace("if (dkEv_(it)) it.doneOn = on ? dkSlot_(it, now) : '';", "if (dkEv_(it)) it.doneOn = on ? String(now).slice(0, 10) : '';")],
  ['a past event offered', s => s.replace("if (!k) return g.done.push(i);", "if (!k) return g.open.push(i);")],
  ['events not leaves', s => s.replace("if (dkEv_(it) && n && it.place !== 'home')", 'if (false)')],
];
function run() {
  const bad = [], checks = [], js = text('js/map.js'), form = text('js/form.js'), gen = text('backend/cards-gen.gs');
  let P = null; try { P = planner(js, form); } catch (e) { bad.push(String(e.message)); }
  if (P) RULES.forEach(([n, f]) => checks.push([n, () => f(P)]));
  checks.push(['every mutation caught', () => { const missed = MUTS.filter(([, mut]) => { const s2 = mut(js);
    if (s2 === js) return true; let P2; try { P2 = planner(s2, form); } catch (e) { return false; } return RULES.every(([, f]) => { try { return f(P2); } catch (e) { return false; } }); });
    if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (MUTS.length - missed.length) + '/' + MUTS.length + ' breaks caught' + (missed.length ? '; missed ' + missed.map(x => x[0]).join(', ') : ''));
    return !missed.length; }]);
  checks.push(['(3) kinds.json docket.list declares start, rrule, rdate, exdate and moved', () => { const F = (((SD.kinds().docket || {}).list || {}).fields || []).map(x => x.f);
    return ['start', 'rrule', 'rdate', 'exdate', 'moved'].every(f => F.indexOf(f) >= 0); }]);
  checks.push(['(3) the backend gives the site\'s order with events in it, every half hour', () => { const B = planner(gen);
    for (let h = 0; h < 48; h++) { const hm = String(Math.floor(h / 2)).padStart(2, '0') + ':' + (h % 2 ? '30' : '00'), now = DAY + ' ' + hm;
      if (JSON.stringify(P.dkNowNextOf_(LIST(), now, P.dkLeaves_(LIST(), now))) !== JSON.stringify(B.dkNowNextOf_(LIST(), now, B.dkLeaves_(LIST(), now)))) return false; }
    return true; }]);
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-repeat: ' + checks.length + ' rules (the dates, on the list, declared once); ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-repeat', bad, 'repeat rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
