#!/usr/bin/env node
/* @family. — tools/one-email.js EVERY EMAIL IS ONE EMAIL CARD (queue step 8, 22 Nov): each email the backend builds goes out through
   `emailOf_` (backend/email.gs) — {subject, heading, cards[], lines[], button, footer} in the one frame the Sunday email has. Each
   builder is run here on made-up people, the backend loaded as Apps Script loads it and MailApp STUBBED (nothing is ever sent), and
   what it would send is held against tools/data/one-email.json, what it sent before the cut: the same recipients, the same subject and
   plain text, the same links, and every line of the plain text in the HTML's words. `--write` records them anew. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const BV = require('./lib/backend-vm.js');
const { ROOT, S, report, main } = require('./lib/gen.js');
const GOLD = path.join(ROOT, 'tools/data/one-email.json');

function load(sent) {
  /* THE ONLY MAILAPP THIS FILE KNOWS: it writes down, and sends nothing. */
  const ctx = BV.load({ console: { log() {}, error: console.error }, at: true, random: 0.4242,
    google: { MailApp: { sendEmail: o => { sent.push(JSON.parse(JSON.stringify(o))); }, getRemainingDailyQuota: () => 100 } } });
  const P = (id, role, first, extra) => Object.assign({ person_id: id, role: role, roles: role, first_name: first, last_name: 'Test', handle: first.toLowerCase(),
    email: first.toLowerCase() + '@x.test', bookings_email: 'TRUE', posts_email: 'TRUE', weekly_email: 'TRUE' }, extra || {});
  const people = [P('P001', 'admin', 'Ann'), P('P002', 'tutor', 'Ada'), P('P003', 'student', 'Finn', { email: '' }), P('P004', 'client', 'Cara'), P('P005', 'student', 'Kit')]
    .map((r, i) => Object.assign({ _row: i + 2 }, r));
  Object.assign(ctx, {
    read: n => ({ sheet: { name: n }, headers: [], rows: n === 'people' ? people : [] }),
    config: () => ({}), findPerson: (name, id) => people.find(p => (id ? p.person_id === id : personName(p) === name)) || null,
    acceptedParents: of => (of === 'P003' ? [people[3]] : []), withWriteLock_: fn => fn(), setCells: () => true, authProps_: () => ({ getProperty: () => '', setProperty: () => {} }),
  });
  const personName = p => ctx.$('personDisplayName')(p);
  return { ctx, people };
}

/* EACH BUILDER, on made-up rows: what it is, and how it is called. */
const CASES = [
  ['notify: a booking note to a tutor', c => c.notify('Ada Test', 'Paid: a place is confirmed', 'Hello Ada,\n\nKit is booked in for Maths.\n\nSee it at https://example.org/?tab=book\n\n— the site', 'bookings')],
  ['accessMail_: confirm an address', c => c.accessMail_('kit@x.test', 'mail-confirm', { first: 'Kit', link: c.siteLink_('verify', 'TOKEN1'), handleSaid: ' (or @kit)' })],
  ['accessMail_: an invite', c => c.accessMail_('kit@x.test', 'mail-invite', { first: 'Kit', site: c.SITE_URL, handle: 'kit', pin: '4321' })],
  ['accessMail_: a move of address', c => c.accessMail_('new@x.test', 'mail-move', { link: c.siteLink_('verify', 'MOVEKEY'), days: 3 })],
  ['accessMail_: a child made', c => c.accessMail_('cara@x.test', 'mail-child-made', { first: 'Finn', handle: '@finn', link: c.siteLink_('verify', 'KIDTOK') })],
  ['forgotPinMail_: their own', c => c.deliverOrThrow_(null, 'access', c.forgotPinMail_('kit@x.test', [], {}, true, '@kit', '1111', 'LK1'))],
  ['forgotPinMail_: a child with no address', (c, p) => c.deliverOrThrow_(null, 'access', c.forgotPinMail_('', ['cara@x.test'], p[2], false, '@finn', '2222', 'LK2'))],
  ['authWrong_: a child with no address, told to the grown-up', (c, p) => { c.$('AUTH.FREE_TRIES = 0'); c.authWrong_({}, p[2]); }],
  ['authWrong_: their own', (c, p) => { c.$('AUTH.FREE_TRIES = 0'); c.authWrong_({}, p[4]); }],
  ['applyMail_: the owner told', c => c.deliverOrThrow_(null, 'applied', c.applyOwnerMail_('ann@x.test', 'Kit Test (@kit)', 'Maths'))],
  ['applyMail_: the applicant told', c => c.deliverOrThrow_(null, 'applied', c.applyDecidedMail_('kit@x.test', 'Kit', 'Yes, welcome.'))],
  ['mailOut_: a parent\'s mail goes to the owner', c => c.notify('Cara Test', 'Accepted: Maths', 'Your request was accepted.\n\nhttps://example.org/', 'bookings')],
  ['digest: the Sunday email', (c, p) => {
    const L = { first: 'Finn', days: ['2026-11-10'], fresh: [{ key: 'q:1', label: 'Maths · Paper 1 · Q3', words: 'What is 2 + 2?', verdict: 'right', answer: '4', last: '2026-11-10' }], again: [] };
    const m = c.digestRender_(L, { first: 'Cara' }, { start: '2026-11-09', end: '2026-11-15' }, { site: 'https://example.org/', hour: 18 });
    c.deliver_(p[3], 'weekly', { subject: m.subject, body: m.text, htmlBody: m.html, firstNamesOnly: true, name: null });
  }],
];

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
const words = html => S(html).replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&(#?\w+);/g, (m, k) => ENT[k] || (k[0] === '#' ? String.fromCharCode(+k.slice(1)) : m)).replace(/\s+/g, ' ').trim();
const links = o => Array.from(new Set((S(o.body) + ' ' + S(o.htmlBody).replace(/&amp;/g, '&')).match(/https?:\/\/[^\s"'<>)]+/g) || [])).sort();

function runAll() {
  return CASES.map(([name, fn]) => {
    const sent = [], { ctx, people } = load(sent);
    let threw = '';
    try { fn(ctx, people); } catch (e) { threw = String(e && e.message || e); }
    return { name, threw, mails: sent.map(o => ({ to: o.to, name: o.name, subject: o.subject, body: o.body, links: links(o), html: S(o.htmlBody) })) };
  });
}

function run() {
  const tz = process.env.TZ;
  process.env.TZ = 'Europe/London';
  try { check(); } finally { if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz; }
}
function check() {
  const now = runAll();
  if (process.argv.includes('--write')) {
    fs.writeFileSync(GOLD, JSON.stringify(now.map(c => ({ name: c.name, threw: c.threw, mails: c.mails.map(m => { const o = Object.assign({}, m); delete o.html; return o; }) })), null, 1) + '\n');
    console.log('one-email: ' + now.length + ' emails recorded');
    return;
  }
  const gold = JSON.parse(fs.readFileSync(GOLD, 'utf8')), bad = [];
  now.forEach((c, i) => {
    const g = gold[i] || { mails: [] };
    if (c.threw) bad.push(c.name + ': threw ' + c.threw);
    if (!c.mails.length) bad.push(c.name + ': sent nothing');
    if (c.mails.length !== g.mails.length) bad.push(c.name + ': ' + c.mails.length + ' email(s), before ' + g.mails.length);
    c.mails.forEach((m, k) => {
      const b = g.mails[k] || {};
      ['to', 'name', 'subject', 'body'].forEach(f => { if (S(m[f]) !== S(b[f])) bad.push(c.name + ': ' + f + ' changed — ' + JSON.stringify(S(m[f]).slice(0, 120)) + ' was ' + JSON.stringify(S(b[f]).slice(0, 120))); });
      if (JSON.stringify(m.links) !== JSON.stringify(b.links)) bad.push(c.name + ': links ' + JSON.stringify(m.links) + ' were ' + JSON.stringify(b.links));
      /* ONE CARD: every email has the frame, and says in it every line its plain text says. */
      if (!/<!DOCTYPE html>/.test(m.html)) { bad.push(c.name + ': no HTML card'); return; }
      const w = words(m.html);
      S(m.body).split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).forEach(l => {
        if (!/^digest/.test(c.name) && w.indexOf(l) === -1) bad.push(c.name + ': the card leaves out "' + l.slice(0, 80) + '"');
      });
    });
  });
  report('one-email', bad, 'email(s) changed');
  console.log('one-email: ' + now.length + ' emails through one card, the same words, links and recipients as before');
}
module.exports = { run };
main(module, run);
