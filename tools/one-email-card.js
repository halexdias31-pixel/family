#!/usr/bin/env node
/* @family. — tools/one-email-card.js THE ONE-EMAIL-CARD CHECK (rule 1.75, owner 23 Nov, UNIFY AFTER 5: EVERY EMAIL CARD IS THE SITE CARD):
   every card an email draws takes its parts and their order from the card description the site draws it by, and has no list of its own.
   1. THE SOURCE: every kind with a `card.letter` (data/settings/kinds.json) is either a question (`card.question.parts`, its email card held
      by tools/one-question-card.js, which must be in tools/build.js) or a record (a booking: `card.record` and `card.tags`), whose letter
      says only HOW a site part is said (`words`, keyed by the site's parts) — never `lines` or another list of parts of its own; its `rows`
      name only site parts.
   2. THE EMAILS: the real builders run on made-up rows, the backend loaded as Apps Script loads it (tools/lib/backend-vm.js) and nothing
      sent: the client's receipt (lessonNotify_), the requested tutor's note, a child's receipt, and the cancelled note (postDeleteJob_).
      Each bullet line is matched to the site part whose made-up value it says; fails when a line says no site part (the email's own), the
      parts are out of the site card's order (read here off `card.record` itself), a part is said twice, or a price part (`money.*`) is
      said to a child or with prices off. Counted: every email card drawn. `--html <dir>` writes each sample as HTML there. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const BV = require('./lib/backend-vm.js'), SD = require('./lib/site-data.js');
const { S, text, report, main } = require('./lib/gen.js');

/* THE SITE CARD'S ORDER, read off its description here (not through the backend's reader): name, tags, pills, status, sum. */
const siteOrder = c => { const R = c.record || {};
  return [...new Set([].concat(R.name ? ['name'] : [], c.tags || [], R.pills || [], R.status ? [R.status.fact] : [], R.sum || []))]; };

/* THE MADE-UP BOOKING: each value unlike every other, so a line names the part it says. */
const BODY = { subject: 'Chemistry', level: 'A-Level', day: '2026-11-24', time: '16:30', location: 'Zed Room', dates: '24 Nov, 1 Dec', price: 87,
  requestedTutor: 'Ada Test', message: '' };
const SAYS = { name: /Chemistry/, venue: /Zed Room/, when: /16:30/, weeks: /24 Nov, 1 Dec/, 'money.total': /£\s?87/ };

function emails() {
  const sent = [];
  const B = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } });
  const P = { Cara: { person_id: 'P004', role: 'client', first_name: 'Cara', last_name: 'Test' }, Kit: { person_id: 'P005', role: 'student', first_name: 'Kit', last_name: 'Test', kid: true } };
  Object.assign(B, {
    notify: (to, subject, body) => { sent.push({ to: to, subject: subject, body: S(body) }); },
    deliver_: () => ({}), findPerson: n => P[String(n).split(' ')[0]] || null, isChild_: r => !!(r && r.kid),
    read: () => ({ sheet: {}, headers: [], rows: [{ _row: 2, job_id: 'J-ZZ', subject: BODY.subject, level: BODY.level, weekday: 'Tuesday', start_time: BODY.time, venue: BODY.location, price: BODY.price }] }),
    participantsOf: () => [{ name: 'Cara Test', role: 'client' }], logEvent: () => {}, setCell: () => true, clearCache: () => {}, jobStatusOf: () => 'cancelled', jsonOut: o => o,
  });
  const cases = [
    ['receipt to a grown-up', () => B.lessonNotify_(BODY, 'Cara Test', 'J-ZZ', false), { prices: true }],
    ['note to the requested tutor', () => B.lessonNotify_(BODY, 'Cara Test', 'J-ZZ', true), { prices: false, pick: 1 }],
    ['receipt to a child', () => B.lessonNotify_(BODY, 'Kit Test', 'J-ZZ', false), { prices: false }],
    ['cancelled note', () => B.postDeleteJob_({ jobId: 'J-ZZ', adminName: 'Ann Test' }), { prices: false, use: 'cancelled' }],
  ];
  return cases.map(([name, fn, o]) => { sent.length = 0; let threw = ''; try { fn(); } catch (e) { threw = String(e && e.message || e); }
    return { name, o, threw, mail: sent[o.pick || 0] || null }; });
}

function run() {
  const bad = [], kinds = SD.json('data/settings/kinds.json').kinds;
  /* 1. THE SOURCE */
  let records = 0;
  Object.entries(kinds).forEach(([k, v]) => {
    const c = v.card || {}, L = c.letter;
    if (!L) return;
    if (c.question && c.question.parts) { if (!/'one-question-card'/.test(text('tools/build.js'))) bad.push(k + ': its email card is held by tools/one-question-card.js, which tools/build.js does not run'); return; }
    if (!c.record) { bad.push(k + ': card.letter with no site card description (`card.record` or `card.question.parts`) to take its parts from'); return; }
    records++;
    const site = siteOrder(c);
    Object.keys(L).forEach(f => { if (Array.isArray(L[f])) bad.push(k + ': card.letter.' + f + ' is a list of the email\'s own; the parts are the site card\'s'); });
    Object.keys(L.words || {}).filter(p => p !== 'say').forEach(p => { if (site.indexOf(p) < 0) bad.push(k + ': card.letter.words says "' + p + '", which is not a part of the site card (' + site.join(', ') + ')'); });
    Object.entries(L.rows || {}).filter(([n]) => n !== 'say').forEach(([n, ps]) => [].concat(ps).forEach(p => { if (site.indexOf(p) < 0) bad.push(k + ': card.letter.rows.' + n + ' names "' + p + '", not a site part'); }));
  });
  /* 2. THE EMAILS */
  const order = siteOrder(kinds.booking.card), E = emails();
  let cards = 0;
  const at = process.argv.indexOf('--html'), dir = at > 0 ? process.argv[at + 1] : '';
  E.forEach(e => {
    if (e.threw || !e.mail) { bad.push(e.name + ': the builder sent nothing' + (e.threw ? ' (' + e.threw + ')' : '')); return; }
    cards++;
    const lines = e.mail.body.split('\n').filter(l => /^• /.test(l));
    const parts = lines.map(l => { const p = Object.keys(SAYS).find(k => SAYS[k].test(l)); if (!p) bad.push(e.name + ': the line "' + l + '" says no part of the site card'); return p; }).filter(Boolean);
    if (!lines.length) bad.push(e.name + ': no card drawn');
    if (new Set(parts).size !== parts.length) bad.push(e.name + ': a part said twice (' + parts.join(', ') + ')');
    if (!parts.every((p, i) => !i || order.indexOf(parts[i - 1]) < order.indexOf(p))) bad.push(e.name + ': parts out of the site card\'s order (' + parts.join(', ') + '; the order is ' + order.join(', ') + ')');
    if (!e.o.prices && parts.some(p => /^money\./.test(p))) bad.push(e.name + ': a price said where it never is (a child, or prices off)');
    if (e.o.prices && parts.indexOf('money.total') < 0) bad.push(e.name + ': the total is not said to the grown-up who pays');
    const only = e.o.use && kinds.booking.card.letter.rows[e.o.use];
    if (only && parts.some(p => only.indexOf(p) < 0)) bad.push(e.name + ': says more than its row (' + only.join(', ') + ')');
    e.parts = parts;
    if (dir) {
      const B = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } });
      const m = B.emailOf_({ subject: e.mail.subject, lines: B.emailLines_(e.mail.body) });
      fs.writeFileSync(path.join(dir, 'email-card-' + e.name.replace(/\W+/g, '-') + '.html'), m.htmlBody);
    }
  });
  console.log('one-email-card: ' + (cards - new Set(bad.map(b => b.split(':')[0])).size) + '/' + E.length + ' booking email cards in the site card\'s parts and order ('
    + records + ' record letter(s), the question card by one-question-card) — ' + E.map(e => e.name + ': ' + (e.parts || []).join(' › ')).join('; '));
  report('one-email-card', bad, 'difference(s) between an email card and its site card');
}
module.exports = { run };
main(module, run);
