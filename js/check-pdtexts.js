#!/usr/bin/env node
/* @family. — check-pdtexts.js: the public-domain texts (514) — index and every file load and agree, each sourced and public domain. */
/* Also: no file reaches 2 MB, no etext licence is left in the words, no two cards share a place. -v prints the counts. */
const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('-v') || /^(1|true|yes)$/i.test(process.env.VERBOSE || '');
const dir = path.join(__dirname, '..', 'data', 'pdtexts');
const fail = [];
let index = null;
try { index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')); }
catch (e) { console.error('check-pdtexts: data/pdtexts/index.json did not load — NOTHING was checked: ' + e.message); process.exit(1); }
if (!index || !Array.isArray(index.texts) || !index.texts.length) { console.error('check-pdtexts: the index names no texts — NOTHING was checked'); process.exit(1); }

const SUBJECTS = ['History', 'English Literature', 'Religious Studies'];   /* Religious Studies: Ancient Egypt's texts (546) */
const seen = {}, lines = [];
let cards = 0, bytes = 0;
if (!fs.existsSync(path.join(dir, 'LICENSE'))) fail.push('data/pdtexts/LICENSE is missing');
const licence = fs.existsSync(path.join(dir, 'LICENSE')) ? fs.readFileSync(path.join(dir, 'LICENSE'), 'utf8') : '';
index.texts.forEach(w => {
  const at = w && w.id ? w.id : JSON.stringify(w).slice(0, 60);
  if (!/^TX-\d{4}$/.test(w.id) || w.file !== w.id + '.json') return fail.push(at + ': id and file must be TX-NNNN and TX-NNNN.json');
  if (seen[w.title]) fail.push(at + ': the title ' + w.title + ' is also ' + seen[w.title] + ' — the Writing tag would join them');
  seen[w.title] = w.id;
  if (SUBJECTS.indexOf(w.subject) < 0) fail.push(at + ': subject ' + w.subject + ' is not ' + SUBJECTS.join(', '));
  if (!Array.isArray(w.texts) || !w.texts.length) fail.push(at + ': names no text');
  if (!Array.isArray(w.cards) || !w.cards.length) return fail.push(at + ': has no cards');
  if (licence.indexOf(w.id + '  ' + w.title) < 0) fail.push(at + ': not listed in data/pdtexts/LICENSE');
  const file = path.join(dir, w.file);
  let raw = '', d = null;
  try { raw = fs.readFileSync(file, 'utf8'); d = JSON.parse(raw); }
  catch (e) { return fail.push(at + ': ' + w.file + ' did not load: ' + e.message); }
  const size = Buffer.byteLength(raw);
  bytes += size;
  if (size >= 2000000) fail.push(at + ': ' + w.file + ' is ' + size + ' bytes — keep a file under 2 MB');
  if (d.id !== w.id) fail.push(at + ': the file says it is ' + d.id);
  if (!Array.isArray(d.sources) || !d.sources.length) fail.push(at + ': names no source');
  (d.sources || []).forEach(s => {
    if (!s.text || !/^https:\/\//.test(s.url || '')) fail.push(at + ': a source without its name or address');
    if (!/public domain/i.test(s.licence || '')) fail.push(at + ': a source whose licence is not public domain: ' + s.licence);
  });
  if (!Array.isArray(d.cards) || d.cards.length !== w.cards.length) return fail.push(at + ': ' + (d.cards || []).length + ' cards of words for ' + w.cards.length + ' places');
  d.cards.forEach((c, i) => {
    if (!Array.isArray(c) || c.length !== w.texts.length || !c.some(x => typeof x === 'string' && x.trim())) fail.push(at + ' card ' + i + ': not one string a text');
  });
  if (/project gutenberg|gutenberg\.org/i.test(JSON.stringify(d.cards))) fail.push(at + ': an etext licence or trademark is left in the words');
  const places = new Set(w.cards.map(c => c.join('|')));
  if (places.size !== w.cards.length) fail.push(at + ': ' + (w.cards.length - places.size) + ' cards share a place with another — two cards a tag cannot tell apart');
  cards += w.cards.length * w.texts.length;
  lines.push(w.id + ' ' + w.title + ': ' + w.cards.length + ' cards x ' + w.texts.length + ' text(s), ' + size + ' bytes');
});

if (fail.length) {
  console.error('check-pdtexts: ' + fail.length + ' fault(s)');
  fail.forEach(f => console.error('  ' + f));
  process.exit(1);
}
if (VERBOSE) lines.forEach(l => console.log(l));
console.log('check-pdtexts: ' + index.texts.length + ' texts, ' + cards + ' cards, ' + bytes + ' bytes, every one sourced and public domain.');
