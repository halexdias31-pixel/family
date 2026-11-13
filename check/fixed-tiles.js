#!/usr/bin/env node
/* @family. — check/fixed-tiles.js NO DYNAMIC BUTTONS (owner, 13 Nov): a card kind's visible tile row is the same tiles in the same order in every state. */
/* In the browser: a few cards of every kind, drawn for each visitor and again with a question's pen open; each card's own row (`.kc-four`) must be */
/* four tiles, Message, Save and More in their places, and the same lead tile every time. Statically: no CSS rule shows or hides a tile on hover or focus. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const glass = require('./glass.js');

const ROOT = path.join(__dirname, '..');
const PER = Number(glass.arg('per')) || 6;
const bad = [];

/* ---------- STATIC: a :hover / :focus* selector that changes display, visibility or opacity of a tile, a button or a row's control. */
function cssPass() {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (let m; (m = re.exec(css));) {
    const sel = m[1].trim(), body = m[2];
    if (!/:(hover|focus|focus-within|focus-visible)\b/.test(sel) || !/(^|;|\s)(display|visibility|opacity)\s*:/.test(body)) continue;
    /* WHAT THE RULE CHANGES is after the last combinator that follows the hover; a control there is a button that comes and goes. */
    if (/(\.tile|\.btn|button|\[data-do|\.text-drop|\.msg-flag|\.tile-row|\.kc-four)/.test(sel.split(/:(?:hover|focus[\w-]*)/).slice(1).join(' ') || sel)) {
      const line = css.slice(0, m.index + m[1].length - m[1].trimStart().length).split('\n').length;
      bad.push(`style.css line ${line}: \`${sel.replace(/\s+/g, ' ').slice(0, 100)}\` shows or hides a control on hover or focus`);
    }
  }
}

/* ---------- IN THE PAGE: each card's own row, as a signature of slots. */
function rows(per) {
  const items = inFinder_(FINDERS.stuff, () => stuffItemsAll_());
  const by = {};
  items.forEach(x => { const k = (x && x.kind) || 'thing'; if (x && x.key) (by[k] = by[k] || []).length < per && by[k].push(x); });
  const host = document.createElement('div');
  document.body.append(host);
  const sig = x => {
    let h = '';
    try { h = inFinder_(FINDERS.stuff, () => findCard(x)); } catch (e) { return 'threw ' + e.message; }
    host.innerHTML = h;
    const four = host.querySelector('.kc-four');
    if (!four) return '';
    return [...four.children].filter(t => t.matches('.tile, button, a')).map(t => (t.hidden ? '!hidden ' : '') + (t.getAttribute('data-do') || '?')).join(' ');
  };
  const out = {};
  Object.keys(by).forEach(k => by[k].forEach(x => {
    const s = [sig(x)];
    /* A QUESTION'S PEN OPENED: the state the tool row used to grow in. */
    if (k === 'question' && typeof qtPenSet_ === 'function') { try { qtPenSet_(x, true); s.push(sig(x)); qtPenSet_(x, false); } catch (e) { s.push('threw ' + e.message); } }
    out[k + ' ' + x.key] = s;
  }));
  host.remove();
  return out;
}

(async () => {
  cssPass();
  const { chromium } = require('playwright');
  const server = await glass.serve('FIXED_TILES_PORT');
  const port = server.address().port;
  const browser = await chromium.launch();
  const seen = {};
  try {
    for (const v of glass.VIEWERS) {
      const s = await glass.open(browser, port, v, 390, 844, { settle: 300 });
      try {
        if (!s.ready) { bad.push(`${v.as}: the payload never arrived — nothing measured`); continue; }
        const got = await s.page.evaluate(rows, PER);
        Object.keys(got).forEach(id => got[id].forEach(g => (seen[id] = seen[id] || []).push([v.as, g])));
      } finally { await s.ctx.close(); }
    }
  } finally { await browser.close(); server.close(); }
  const SLOTS = /^\S+ msg-open fav kc-more$/;
  let cards = 0;
  Object.keys(seen).forEach(id => {
    const list = seen[id].filter(([, g]) => g !== '');
    if (!list.length) return;
    cards++;
    list.forEach(([as, g]) => { if (!SLOTS.test(g)) bad.push(`${id} (${as}): row is "${g}" — want lead, Message, Save, More`); });
    const kinds = [...new Set(list.map(([, g]) => g))];
    if (kinds.length > 1) bad.push(`${id}: row changes between states — ${list.map(([as, g]) => as + ': ' + g).join(' / ')}`);
  });
  if (!cards) bad.push('no card row was drawn — nothing measured');
  if (bad.length) {
    console.error(`check/fixed-tiles.js: ${bad.length} finding(s)`);
    bad.slice(0, 60).forEach(b => console.error('  ! ' + b));
    process.exit(1);
  }
  console.log(`check/fixed-tiles.js: every card row fixed — ${cards} card(s), ${glass.VIEWERS.length} visitors, CSS hover/focus clean`);
})().catch(e => { console.error('check/fixed-tiles.js: ' + e.message); process.exit(2); });
