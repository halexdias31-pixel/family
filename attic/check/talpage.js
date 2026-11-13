#!/usr/bin/env node
/* @family. — check/talpage.js A BALANCED DAF (494): unequal dafim laid out at 390 and 1280; no text column may end far below every other — what runs long continues full-width. Flags: --shots=DIR. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1];
const VERBOSE = process.argv.includes('-v') || process.env.VERBOSE === '1';
/* Short Gemara + long Tosafot, long Gemara + no Tosafot, no Rashi, both long, and the owner's Bava Batra 5b. */
const CASES = [['bava-batra', 0, 10], ['bava-batra', 0, 11], ['nazir', 2, 51], ['yoma', 3, 67], ['berakhot', 3, 62], ['bava-batra', 7, 148]];
const STUBS = 'function esc(s){return String(s)};function on(){};function loading_(){return ""};function brand(k,o){return o};var ANSWER_ORDERS=[],FACET_KEYS=[],TAG_OF={};';

(async () => {
  const bad = []; let n = 0;
  const b = await chromium.launch();
  try {
    for (const w of [390, 1280]) for (const [t, c, i] of CASES) {
      const file = path.join(ROOT, 'data/talmud', t, c + '.json');
      if (!fs.existsSync(file)) { bad.push(`${t}/${c}.json is missing`); continue; }
      const d = JSON.parse(fs.readFileSync(file, 'utf8'));
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.setContent(`<html><head><style>${fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8')}</style></head><body><div class="tal-page tal-card-page" id="pg" dir="rtl" style="width:${Math.min(880, w - 20)}px;max-width:none"></div></body></html>`);
      await p.addScriptTag({ content: STUBS });
      await p.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'js/talmud.js'), 'utf8') });
      const m = await p.evaluate(([d, i]) => {
        const el = document.getElementById('pg');
        el.innerHTML = talPage_({ slug: 'x', he: 'x', chapters: [{ he: 'x', from: 2 }], licences: {} }, i, d);
        const body = el.querySelector('.tal-body'); talLayout_(body);
        const top = body.getBoundingClientRect().top;
        const end = s => { const x = body.querySelector(s + ' .tal-txt'); return x && x.textContent.trim() ? Math.round(x.getBoundingClientRect().bottom - top) : 0; };
        /* the last line's width: a column that ends alone must end full-width, not as a narrow strip. */
        const last = s => { const x = body.querySelector(s + ' .tal-txt'); if (!x || !x.textContent.trim()) return 0; const r = document.createRange(); r.selectNodeContents(x); const rs = [...r.getClientRects()]; const b = Math.max(...rs.map(q => q.bottom)); const lh = parseFloat(getComputedStyle(x).lineHeight) || 12; const row = rs.filter(q => q.bottom > b - lh * 3.2 && q.width > 0); return Math.max(...row.map(q => q.right)) - Math.min(...row.map(q => q.left)); };
        const fs = parseFloat(getComputedStyle(el).getPropertyValue('--tal-fs'));
        return { H: body.offsetHeight, W: body.clientWidth, fs, r: end('.tal-rashi'), t: end('.tal-tos'), g: end('.tal-gem'), lr: last('.tal-rashi'), lt: last('.tal-tos'), lg: last('.tal-gem') };
      }, [d, i]);
      n++;
      errs.forEach(e => bad.push(`${t} ${i} @${w}: ${e}`));
      const cols = [['Rashi', m.r, m.lr], ['Tosafot', m.t, m.lt], ['Gemara', m.g, m.lg]].filter(x => x[1] > 0).sort((a, z) => z[1] - a[1]);
      const [lo, next] = cols;
      /* THE RULE: the longest column ends within a few lines of the next, or its last stretch runs (nearly) the full width. */
      const tol = m.fs * 4;
      if (next && lo[1] - next[1] > tol && lo[2] < m.W * 0.6) bad.push(`${t} amud ${i} @${w}px: ${lo[0]} runs ${lo[1] - next[1]}px alone below ${next[0]} in a ${Math.round(lo[2])}px strip of a ${m.W}px page`);
      if (m.H > Math.max(m.r, m.t, m.g) + tol) bad.push(`${t} amud ${i} @${w}px: the page is ${m.H}px but its text ends at ${Math.max(m.r, m.t, m.g)}px`);
      if (VERBOSE) console.log(w, t, i, JSON.stringify(m));
      if (SHOTS) await p.locator('#pg').screenshot({ path: path.join(SHOTS, `${t}-${i}-${w}.png`) });
      await p.close();
    }
  } finally { await b.close(); }
  if (bad.length) { bad.forEach(x => console.log('✗ ' + x)); process.exit(1); }
  console.log(`talpage: ${n} dafim balanced at 390 and 1280`);
})().catch(e => { console.log('✗ talpage could not run: ' + e.message); process.exit(1); });
