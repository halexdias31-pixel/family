#!/usr/bin/env node
/* @family. — check-flyer.js THE FLYER MAKER (owner, 11 Nov): every word on a flyer is the Web profile's or the tutor's own, nothing is typed, and every QR carries its source tag. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const bad = [];
const src = read('js/flyer.js');

/* NOTHING TO TYPE INTO: no box, no editable text, on the maker or the sheet. */
if (/<(input|textarea|select)\b|contenteditable/i.test(src)) bad.push('flyer.js draws a box to type into; a flyer is chosen, never typed');

/* THE MAKER RUN ON THE FIXTURE, as an admin (every source) and as a tutor (their own only). */
const fx = JSON.parse(read('check/fixture.json'));
const BRAND = { name: 'Biz Name', web_tagline: 'Tagline words', area: 'Some Area', phone: '0000 000000', site: 'example.test/app/', flyer_cta: 'Scan me' };
const box = { console, URLSearchParams, TextEncoder, setTimeout: () => 0,
  DATA: { tutors: fx.tutors || [] }, USER: { name: 'Admin' }, admin: true,
  esc: s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  perHour_: n => '£' + Number(n).toFixed(2) + '/h', brandLogo_: () => 'icon.png', empty_: t => t, card_: h => h, on: () => {},
  tile_: o => `<button data-do="${o.act}">${o.label}</button>`, rankAtLeast_: () => true };
box.brand = (k, or) => (k in BRAND ? BRAND[k] : or || '');
box.isAdmin = () => box.admin;
box.passFor_ = () => (fx.tutors || [])[0] || null;
vm.createContext(box);
box.DATA.campaigns = [{ id: 'C001', name: 'Camp', style: 'loud', blocks: 'head say facts foot', copy: { head: [{ text: 'Line one|line two' }], say: [{ text: 'A paragraph.' }] } }];
vm.runInContext(read('js/cards-render.js') + '\n' + read('js/qr.js') + '\n' + src + '\nthis.T = { flyerWith_, FLY_LAYOUTS, FLY_DRAW, flyerSource_, flyerSheet_, flyerUrl_, flyWhoList_, qrMatrix_ };', box);
const T = box.T;
const unesc = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

T.FLY_LAYOUTS.forEach(L => L.fields.forEach(f => { if (!T.FLY_DRAW[f]) bad.push(`${L.id}: field ${f} has no drawer`); }));
const who = T.flyWhoList_();
if (who.length < 2 || who[0].id !== 'web') bad.push('an admin is not offered the business and every listed tutor');
let sheets = 0;
who.forEach(w => {
  [null, 'C001'].forEach(camp => {
  const s = T.flyerWith_(T.flyerSource_(w.id), camp);
  if (!s) { bad.push(w.id + ': no source'); return; }
  /* THE SOURCE'S OWN VALUES: every text on the sheet must be one of them. */
  const vals = new Set();
  Object.keys(s).forEach(k => [].concat(s[k]).forEach(v => { if (typeof v === 'string' && v) vals.add(v); }));
  T.FLY_LAYOUTS.forEach(L => {
    const h = T.flyerSheet_(s, L.id, null);
    sheets++;
    const texts = h.replace(/<svg[\s\S]*?<\/svg>/g, '').split(/<[^>]+>/).map(t => unesc(t).trim()).filter(Boolean);
    texts.forEach(t => { if (!vals.has(t)) bad.push(`${w.id}/${L.id}: "${t}" is not from the profile`); });
    (h.match(/\ssrc="([^"]*)"/g) || []).forEach(m => { const v = unesc(m.slice(6, -1)); if (!vals.has(v)) bad.push(`${w.id}/${L.id}: picture ${v} is not from the profile`); });
    if (L.fields.indexOf('qr') !== -1) {
      const u = unesc((/data-url="([^"]*)"/.exec(h) || [])[1] || '');
      if (!new RegExp('[?&]from=flyer-' + L.id + '-' + s.id + (s.camp ? '-' + s.camp : '') + '$').test(u)) bad.push(`${w.id}/${L.id}: QR address ${u || '(none)'} has no from=flyer-${L.id}-${s.id}`);
      if (!/<svg[^>]*class="fl-qrsvg"/.test(h)) bad.push(`${w.id}/${L.id}: no QR drawn`);
      if (!T.qrMatrix_(u)) bad.push(`${w.id}/${L.id}: the QR address is too long for version 10`);
    }
    if (camp && /fl-price/.test(h)) bad.push(`${w.id}/${L.id}: the campaign leaves out price, and it printed`);
  });
  });
});
box.admin = false;
const mine = T.flyWhoList_();
if (mine.length !== 1 || mine[0].id === 'web') bad.push('a tutor is offered more than their own card: ' + mine.map(m => m.id).join());

/* THE TAG REACHES `came_from`: the phone sends it at sign-up and the backend writes it. */
if (!/body\.from\s*=\s*from/.test(read('js/me-account.js'))) bad.push('me-account.js register does not send the flyer tag (body.from)');
if (!/came_from:[^\n]*body\.from/.test(read('backend/post-signin.gs'))) bad.push('post-signin.gs does not write body.from into came_from');

if (bad.length) { console.log('check-flyer: ' + bad.length + ' problem(s):'); bad.forEach(b => console.log('  ' + b)); process.exit(1); }
console.log(`check-flyer: ${sheets} sheets from ${who.length} profiles, every word and picture from the profile, every QR tagged`);
