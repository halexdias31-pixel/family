#!/usr/bin/env node
/* @family. — check-lego.js THE LEGO PIECE CHECK (owner, 12 Nov): the card draws for staff, three shots a batch, the AI reply (stubbed) tallied, kept over a refresh, and Finished lists what is missing. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const bad = [];
const photo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'data/reels/archetest.jpg')).toString('base64');

const store = new Map(), handlers = {}, posts = [];
/* THE STUBBED MODEL: batch 1 sees four red 3001s and a stray, batch 2 two more red 3001s. */
const replies = [{ success: true, counts: [{ part: '3001', colour: 'Red', count: 4 }, { part: 'odd bit', colour: 'grey', count: 1 }] },
  { success: true, counts: [{ part: '3001 ', colour: 'red', count: 2 }] }];
const box = { console, setTimeout: () => 0, KEPT_PREFIX: 'kept:', USER: { name: 'Staff', personId: 'P-T1' },
  payloadFor_: () => ({ who: 'P-T1', build: 'b' }),
  keptGet_: k => (store.has(k) ? JSON.parse(store.get(k)) : null), keptPut_: (k, t) => store.set(k, t),
  esc: s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  card_: h => h, loading_: () => '<div class="loading"></div>', toast: () => {}, rankAtLeast_: () => box.staff,
  on: (a, fn) => { handlers[a] = fn; },
  tile_: o => [].concat(o).map(t => `<button data-do="${t.act}"${t.off ? ' disabled' : ''}>${t.label}</button>`).join(''),
  workShrink_: () => Promise.resolve(photo),
  api: b => { posts.push(b); return Promise.resolve(replies[posts.length - 1] || { success: false, message: 'no more' }); } };
box.staff = true;
vm.createContext(box);
vm.runInContext(read('js/lego.js') + '\nthis.T = { legoCards_, legoAdd_, legoParse_, legoResult_, now: () => LEGO, forget: () => { LEGO = null; LEGO_PICS = []; } };', box);
const T = box.T;
const el = (v, fields) => ({ dataset: { v: v || '' }, closest: () => ({ querySelector: q => fields[q] || null, querySelectorAll: () => [] }) });

(async () => {
  box.staff = false;
  if (T.legoCards_().length) bad.push('a student is shown the piece check');
  box.staff = true;
  const first = T.legoCards_().join('');
  if (!/LEGO piece check/.test(first) || !/data-do="lego-start"/.test(first)) bad.push('the card does not draw its set picker');
  const p = T.legoParse_('3001, Red, 6\n3020\tBlue\t2\n3023 Light Bluish Gray 1');
  if (p.length !== 3 || p[2].colour !== 'Light Bluish Gray' || p[1].qty !== 2) bad.push('the parts list is misread: ' + JSON.stringify(p));
  handlers['lego-start'](el('', { '.lego-num': { value: '42213' }, '.lego-parts': { value: '3001, Red, 6\n3020, Blue, 2' } }));
  if (!/Batch 1/.test(T.legoCards_().join(''))) bad.push('Start does not show Batch 1');
  for (let i = 0; i < 3; i++) await T.legoAdd_({ name: 'shot' + i });
  if (/lego-shot/.test(T.legoCards_().join(''))) bad.push('a fourth photo is offered in one batch');
  handlers['lego-next']();
  await new Promise(r => setImmediate(r));
  if (posts.length !== 1 || posts[0].action !== 'legoCount' || posts[0].images.length !== 3) bad.push('batch 1 was not one request with its three photos');
  const two = T.legoCards_().join('');
  if (!/Batch 2/.test(two) || !/Counted so far: 5 pieces in 1 batch\./.test(two)) bad.push('the tally after batch 1 is wrong: ' + two.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  /* A REFRESH: the kept store is read again. */
  T.forget();
  if (!/Batch 2/.test(T.legoCards_().join(''))) bad.push('a refresh lost the finished batch');
  await T.legoAdd_({ name: 'shot' });
  handlers['lego-done']();
  await new Promise(r => setImmediate(r));
  const end = T.legoCards_().join('').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  if (!/Found 6 of 8/.test(end) || !/3020 Blue: 2 short \(0 of 2\)/.test(end) || /3001 Red: .* short/.test(end)) bad.push('Finished shows the wrong result: ' + end);
  if (bad.length) { console.log('check-lego: ' + bad.length + ' problem(s):'); bad.forEach(b => console.log('  ' + b)); process.exit(1); }
  console.log('check-lego: drawn for staff only, 2 batches (' + posts.length + ' requests) tallied, kept over a refresh, Finished: "' + (/Found \d+ of \d+/.exec(end) || [''])[0] + '" with the missing list');
})();
