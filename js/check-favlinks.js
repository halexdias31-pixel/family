#!/usr/bin/env node
/* node js/check-favlinks.js — FAVOURITE LINKS (509) on the real backend: signed in only, ten at most, http(s) only, the token's person, own links alone in the payload. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs'), path = require('path'), vm = require('vm');
const { backend } = require('./check-gas-load.js');

const bad = [];
const b = backend({});
const base = { pin: '0000', verified: 'TRUE', city: 'London', role: 'client' };
b.seed('people', [
  Object.assign({ person_id: 'P-A', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 'a@example.org' }, base),
  Object.assign({ person_id: 'P-B', first_name: 'Ben', last_name: 'Pupil', handle: 'benpupil', email: 'b@example.org' }, base),
]);
const tok = {};
['a@example.org', 'b@example.org'].forEach(e => {
  const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
  if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
  tok[e] = d.token;
});
const save = (who, links, extra) => b.post(Object.assign({ action: 'favLinksSave', token: who ? tok[who] : '', links: links }, extra || {}));
const rows = () => b.tabs.fav_links.slice(1);

/* SIGNED IN ONLY. */
{
  const d = save('', [{ title: 'x', url: 'https://example.org' }]);
  if (d.success || rows().length) bad.push('a signed-out save was not refused: ' + JSON.stringify(d).slice(0, 160));
}
/* ADD, IN ORDER, AND THE TOKEN'S PERSON WHOEVER THE BODY CLAIMS. */
{
  const d = save('a@example.org', [{ title: 'Bitesize', url: 'https://www.bbc.co.uk/bitesize' }, { title: '', url: 'http://example.org/a?b=1#c' }], { personId: 'P-B' });
  if (!d.success) bad.push('a good save was refused: ' + JSON.stringify(d).slice(0, 200));
  else {
    if (d.links.length !== 2 || d.links[1].title !== 'example.org') bad.push('the saved list came back ' + JSON.stringify(d.links));
    if (rows().some(r => r[0] !== 'P-A')) bad.push('a row was written for somebody other than the token\'s person: ' + JSON.stringify(rows()));
  }
  save('b@example.org', [{ title: 'Ben’s', url: 'https://ben.example.org' }]);
}
/* BAD ADDRESSES ARE REFUSED WHOLE, AND NOTHING IS WRITTEN. */
for (const u of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'JaVaScRiPt://example.org', 'ftp://example.org', 'https://', 'https://exa mple.org',
                 'https://example.org/"onmouseover=1', 'example.org', ' vbscript:x', 'https://.']) {
  const before = JSON.stringify(rows());
  const d = save('a@example.org', [{ title: 'ok', url: 'https://ok.example.org' }, { title: 'bad', url: u }]);
  if (d.success) bad.push('the address ' + JSON.stringify(u) + ' was accepted');
  if (JSON.stringify(rows()) !== before) bad.push('a refused save of ' + JSON.stringify(u) + ' still wrote rows');
}
/* TEN AT MOST. */
{
  const ten = Array.from({ length: 10 }, (_, i) => ({ title: 'L' + i, url: 'https://e' + i + '.example.org' }));
  if (!save('a@example.org', ten).success) bad.push('ten links were refused');
  const eleven = ten.concat([{ title: 'L10', url: 'https://e10.example.org' }]);
  const d = save('a@example.org', eleven);
  if (d.success) bad.push('an eleventh link was accepted');
  if (rows().filter(r => r[0] === 'P-A').length !== 10) bad.push('Ada has ' + rows().filter(r => r[0] === 'P-A').length + ' rows after ten and a refused eleventh');
  /* REMOVE AND REORDER ARE THE WHOLE LIST AGAIN. */
  const less = ten.slice(1).reverse();
  const r = save('a@example.org', less);
  if (!r.success || r.links.length !== 9 || r.links[0].title !== 'L9') bad.push('a removal and reorder came back ' + JSON.stringify(r).slice(0, 200));
}
/* ONLY YOUR OWN, IN THE PAYLOAD — and nobody signed out gets any. */
{
  const a = b.get({ token: tok['a@example.org'] }), bb = b.get({ token: tok['b@example.org'] }), none = b.get({});
  if (!Array.isArray(a.favLinks) || a.favLinks.length !== 9 || a.favLinks.some(l => /ben/.test(l.url))) bad.push('Ada\'s payload carried ' + JSON.stringify(a.favLinks).slice(0, 200));
  if (!Array.isArray(bb.favLinks) || bb.favLinks.length !== 1 || bb.favLinks[0].url !== 'https://ben.example.org') bad.push('Ben\'s payload carried ' + JSON.stringify(bb.favLinks).slice(0, 200));
  /* A SECOND LOAD COMES FROM THE CACHE, and must still be Ben's own. */
  const again = b.get({ token: tok['b@example.org'] });
  if (JSON.stringify(again.favLinks) !== JSON.stringify(bb.favLinks)) bad.push('a cached load carried other links: ' + JSON.stringify(again.favLinks).slice(0, 200));
  if (!Array.isArray(none.favLinks) || none.favLinks.length) bad.push('a signed-out payload carried links: ' + JSON.stringify(none.favLinks));
  /* A ROW TYPED BADLY INTO THE SHEET IS NOT PASSED ON. */
  b.seed('fav_links', [{ person_id: 'P-B', title: 'evil', url: 'javascript:alert(1)' }]);
  b.ev('clearCache()');
  const later = b.get({ token: tok['b@example.org'] });
  if ((later.favLinks || []).some(l => /javascript/i.test(l.url))) bad.push('a javascript: row typed into the sheet was sent');
}
/* THE PHONE'S RULE IS THE SAME RULE. */
{
  const src = fs.readFileSync(path.join(__dirname, 'favlinks.js'), 'utf8');
  const m = /function favUrlOk_\([\s\S]*?\n\}/.exec(src);
  if (!m) bad.push('favUrlOk_ not found in favlinks.js — the phone\'s rule was NOT checked');
  else {
    const ctx = vm.createContext({}); vm.runInContext(m[0], ctx);
    const phone = ctx.favUrlOk_, server = u => b.ev('favUrlOk_(' + JSON.stringify(u) + ')');
    ['https://a.example.org', 'http://x.org/p?q=1', 'javascript:alert(1)', 'data:,x', 'https://', 'https://a b', 'https://[::1]:8080/']
      .forEach(u => { if (!!phone(u) !== !!server(u)) bad.push('the phone and the server disagree on ' + JSON.stringify(u)); });
  }
}

if (bad.length) {
  console.log('check-favlinks: ' + bad.length + ' failure(s)\n  - ' + bad.join('\n  - '));
  process.exit(1);
}
console.log('check-favlinks: signed in only, ten at most, http(s) only, the token\'s person, own links alone in the payload, one rule on both ends');
