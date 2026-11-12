#!/usr/bin/env node
/* @family. — check-money-terms.js (rule 1.4): the written terms money disputes follow exist and link up, and every policy carries a date no more than a year (and a month) old. */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'docs/policies'), bad = [];
const MUST = ['family-terms.md', 'cancellation-refunds.md', 'complaints.md'];
MUST.forEach(f => { if (!fs.existsSync(path.join(dir, f))) bad.push(`docs/policies/${f} is missing`); });
const terms = fs.existsSync(path.join(dir, 'family-terms.md')) ? fs.readFileSync(path.join(dir, 'family-terms.md'), 'utf8') : '';
if (terms && !/\(cancellation-refunds\.md\)/.test(terms)) bad.push('family-terms.md does not link the cancellation and refunds policy');
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const now = new Date(), age = (mo, y) => (now.getFullYear() - y) * 12 + now.getMonth() - mo;
fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md').forEach(f => {
  const head = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').slice(0, 6).join(' ');
  const m = /(?:reviewed|version|adopted):?\s*(?:\d{1,2}\s+)?([A-Za-z]+)\s+(\d{4})/i.exec(head);
  const mo = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  if (mo < 0) bad.push(`${f}: no "Last reviewed/Version/Adopted: Month YYYY" line at the top`);
  else if (age(mo, Number(m[2])) > 13) bad.push(`${f}: dated ${m[1]} ${m[2]}, over a year old; the owner reviews it yearly`);
});
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b + ' (rule 1.4)')); process.exit(1); }
console.log('OK — terms, refunds and complaints written, linked and reviewed within the year');
