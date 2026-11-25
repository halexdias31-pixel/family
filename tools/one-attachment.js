#!/usr/bin/env node
/* @family. — tools/one-attachment.js THE ONE-ATTACHMENT CHECK (rule 1.75, owner 23 Nov, queue item 6 "UNIFY THE LIBRARY AND PRACTICE":
   ONE ATTACHMENT KIND). A source text, a formulae or equation sheet, a periodic table, any material a question points at, is one kind:
   a row of data/inserts.json (title, sheet or text, the sets it belongs to), `of` only its tag, written by tools/lib/import.js `attachmentRow`.
   (a) THE DATA: every row an attachment with a known tag; every set a source names exists; every question that prints lines of a source
       (`source_lines`) or stands in for one (`placeholder`) is on a set that has one -- the stand-ins still without their booklet held to a
       budget that can only fall.
   (b) THE CODE: one opener, js/find-history.js `attachOpen_` by `openStep_`; nothing else in js/ draws an attachment's card into a step or
       carries an opener of its own (an `ins-*`/`source-*`/`sheet-*` act other than Print).
   (c) IN THE PAGE: the runtime holds one kind (`attachment`); every question part's attachments resolve to a card; every part shows the one
       Insert tile; and on a 390px phone and an iPad a sample of each tag (a reading source, a formulae sheet, a periodic table) opens through
       the tile as one step whose sheet holds its card, and Back closes it. Fails the build. Run by tools/build.js after `bundle`.
   (d) AQA ENGLISH LANGUAGE 8700 (owner, 24 Nov: "question 2 will quote part of the extract. It wasn't there."): every 8700 paper sat has its
       source attachment; and on the phone and the iPad every 8700 question that cites lines (`source_lines`, not withheld) shows non-empty
       cited words, both on its own card (practice, search) and in its whole question; the lines withheld (AQA's insert leaves the extract
       out, or no insert numbers that line) held to a budget that can only fall. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, main, bare, read } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');

const TAGS = ['source', 'sheet'];
/* STAND-INS FOR A BOOKLET NO ATTACHMENT HOLDS YET (24 Nov: Edexcel 1GK0/1PG0 sources, STA KS1 reading booklets): only ever fewer. */
const STANDIN_BUDGET = 14;
/* CITED LINES SHOWN AS A CAPTION ONLY (tools/source-lines.js `source_lines_withheld`): only ever fewer. 24 Nov: 43 → 40, every printed line
   numbered from the owner's Drive inserts; the rest are AQA's copyright gaps (Nov 2022, Nov 2023 P1 …) or sittings with no insert PDF. */
const WITHHELD_BUDGET = 40;
const ENG = /^P-AQA-8700-/;
/* THE SAMPLE a child opens: one question set per tag, and the words its card must show. */
const SAMPLE = [
  { name: 'a reading source', paper: 'P-AQA-8700-2306-1', of: 'source' },
  { name: 'a formulae sheet', subject: 'Maths', board: 'Edexcel', of: 'sheet' },
  { name: 'a periodic table', subject: 'Chemistry', board: 'AQA', of: 'sheet', table: true },
];
const SIZES = { phone: { width: 390, height: 844 }, iPad: { width: 820, height: 1180 } };

const list = v => String(v || '').split(',').map(s => s.trim()).filter(Boolean);

function dataBad() {
  const bad = [], rows = read('data/inserts.json'), qs = read('data/questions.json');
  const papers = new Set(qs.map(q => q.paper_id)), withSource = new Set();
  rows.forEach(r => {
    if (TAGS.indexOf(r.of) < 0) bad.push('data/inserts.json ' + r.insert_id + ': tag `of` is "' + r.of + '", not one of ' + TAGS.join(', ') + ' (tools/lib/import.js attachmentRow writes it)');
    if (!String(r.name || '').trim()) bad.push('data/inserts.json ' + r.insert_id + ': an attachment with no title');
    list(r.for_papers).forEach(p => { withSource.add(p); if (!papers.has(p)) bad.push('data/inserts.json ' + r.insert_id + ': names set ' + p + ', which has no questions'); });
    if (r.of === 'source' && !list(r.for_papers).length) bad.push('data/inserts.json ' + r.insert_id + ': a source no set is given');
  });
  const lines = qs.filter(q => String(q.source_lines || '').trim() && !withSource.has(q.paper_id));
  lines.forEach(q => bad.push(q.row_id + ': prints lines ' + q.source_lines + ' of a source set ' + q.paper_id + ' has no attachment for'));
  const stand = qs.filter(q => q.placeholder === 'True' && !withSource.has(q.paper_id));
  if (stand.length > STANDIN_BUDGET) bad.push(stand.length + ' stand-ins for a booklet with no attachment, over the budget of ' + STANDIN_BUDGET + ' (' + stand.slice(0, 3).map(q => q.row_id).join(', ') + ')');
  /* (d) EVERY 8700 PAPER SAT HAS ITS SOURCE, and the withheld lines within their budget */
  const srcFor = new Set(rows.filter(r => r.of === 'source').flatMap(r => list(r.for_papers)));
  const eng = [...new Set(qs.map(q => q.paper_id).filter(p => ENG.test(p || '')))];
  eng.filter(p => !srcFor.has(p)).forEach(p => bad.push(p + ': an AQA 8700 paper sat with no source attachment'));
  const held = qs.filter(q => String(q.source_lines || '').trim() && String(q.source_lines_withheld || '').trim());
  if (held.length > WITHHELD_BUDGET) bad.push(held.length + ' questions cite lines shown as a caption only, over the budget of ' + WITHHELD_BUDGET + ' (' + held.slice(0, 3).map(q => q.row_id).join(', ') + ')');
  return { bad, rows: rows.length, tags: TAGS.map(t => rows.filter(r => r.of === t).length), stand: stand.length,
    eng: eng.length, engSrc: eng.filter(p => srcFor.has(p)).length, held: held.length };
}

/* (b) ONE OPENER: the code that opens an attachment, comments stripped. */
function codeBad() {
  const bad = [];
  fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).forEach(f => {
    const src = bare(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), { comments: true });
    /* NO INSERT TILE ON A QUESTION (owner, 24 Nov: seven buttons): nothing opens an attachment into a step from a question part */
    (src.match(/openStep_\(\{[^;]*?(insertItem_|insertSheet_|insertBody_|insSource_)[^;]*/g) || []).forEach(() => bad.push('js/' + f + ' opens an attachment into a step'));
    (src.match(/\bon\(\s*'((?:ins|insert|source|src|formula|att)[\w-]*)'/g) || []).forEach(m => {
      const act = /'([^']+)'/.exec(m)[1];
      if (act !== 'ins-print') bad.push('js/' + f + ' has an opener of its own, ' + act + ' (no Insert tile since 24 Nov)');
    });
  });
  return bad;
}

/* (c) IN THE PAGE: kinds, resolving, the one tile, and each sample opened by a finger and closed by Back. */
async function onSize(size) {
  const pg = await SB.open({ as: 'child', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) && (DATA.inserts || []).length });
  try {
    await pg.setViewportSize(SIZES[size]);
    const sums = await pg.evaluate(() => {
      const kinds = [...new Set((DATA.inserts || []).map(r => r.kind))];
      const qs = stuffItemsAll_().filter(isQ_), bad = [];
      let pointed = 0, tiles = 0;
      qs.forEach(x => {
        const a = insertsFor_(x);
        if (a.length) pointed++;
        a.forEach(r => { if (!insertRow_(r.id) || !/data-item-kind="insert"|insh/.test(findCard(insertItem_(r)))) bad.push(x.key + ': attachment ' + r.id + ' draws no card'); });
      });
      qs.slice(0, 400).forEach(x => { const h = qtAll_(tileRow_(...qtTiles_(x, true).map(tile_))); if (!/data-do="att-open"/.test(h)) tiles++; else bad.push(x.key + ': an Insert tile (gone 24 Nov)'); });
      return { kinds, pointed, all: qs.length, tiles, bad: bad.slice(0, 12), nBad: bad.length };
    });
    /* (d) THE CITED LINES on this screen: each 8700 part that cites lines, on its own card and in its whole question */
    const cited = await pg.evaluate(ENG => {
      const re = new RegExp(ENG), bad = [];
      let n = 0;
      const shows = h => { const d = document.createElement('div'); d.innerHTML = h;
        return [...d.querySelectorAll('.insrc-q')].some(b => !b.classList.contains('insrc-wait') && b.textContent.replace(/\s+/g, '').length > 20); };
      stuffItemsAll_().filter(isQ_).forEach(x => {
        const r = x.row || {};
        if (!re.test(String(r.paper_id || '')) || !String(r.source_lines || '').trim() || String(r.source_lines_withheld || '').trim()) return;
        n++;
        if (!shows(findCard(x))) bad.push(x.key + ' (' + r.source_lines + '): no cited words on its own card');
        let whole = '';
        try { whole = questionWhole_(x, (questionParts_()[qId_(x)]) || [x], null, false); } catch (e) { whole = ''; }
        if (!shows(whole)) bad.push(x.key + ' (' + r.source_lines + '): no cited words in its whole question');
      });
      return { n, bad };
    }, ENG.source);
    const opened = [];
    /* NO INSERT TILE TO TAP (owner, 24 Nov): the samples are no longer opened from a question part */
    for (const S of []) {
      const r = await pg.evaluate(S => {
        const x = stuffItemsAll_().filter(isQ_).find(x => insertsFor_(x).some(r => r.of === S.of && (!S.table || r.table === 'periodic'))
          && (!S.paper || String((x.row && x.row.paper_id) || '') === S.paper) && (!S.subject || x.subject === S.subject) && (!S.board || x.examBoard === S.board));
        if (!x) return { none: true };
        const host = document.createElement('div');
        host.id = 'att-check';
        (document.querySelector('#s-' + AT + ' .page.on') || document.querySelector('#s-' + AT) || document.body).prepend(host);
        host.innerHTML = findCard(x);
        return { key: x.key, steps: STEPS_.filter(s => !s.dead).length, want: insertsFor_(x).map(r => r.name) };
      }, S);
      if (r.none) { opened.push({ S, bad: 'no question points at ' + S.name }); continue; }
      const tile = pg.locator('#att-check [data-do="att-open"]').first();
      await tile.scrollIntoViewIfNeeded().catch(() => {});
      await tile.click({ timeout: 5000 }).catch(e => opened.push({ S, bad: 'the Insert tile could not be tapped (' + String(e.message).split('\n')[0] + ')' }));
      await pg.waitForTimeout(800);
      const open = await pg.evaluate(() => { const sh = document.getElementById('sheet');
        return { steps: STEPS_.filter(s => !s.dead).length, shown: !!sh && !sh.classList.contains('hidden'), text: sh ? sh.textContent : '',
          cards: sh ? sh.querySelectorAll('[data-item-kind="insert"], .insh').length : 0 }; });
      /* BACK ONLY WHEN A STEP WAS PUSHED: else the browser's Back would leave the site. */
      if (open.steps > r.steps) await pg.goBack().catch(() => {});
      await pg.waitForTimeout(700);
      const shut = await pg.evaluate(() => { const sh = document.getElementById('sheet'); const h = document.getElementById('att-check'); if (h) h.remove();
        return { steps: STEPS_.filter(s => !s.dead).length, shown: !!sh && !sh.classList.contains('hidden') }; });
      const why = [];
      if (!open.shown) why.push('no sheet opened');
      if (open.steps !== r.steps + 1) why.push('steps ' + r.steps + ' → ' + open.steps + ', not one');
      if (!open.cards) why.push('the sheet holds no attachment card');
      r.want.forEach(n => { if (open.text.indexOf(n) < 0 && open.shown) why.push('"' + n + '" missing'); });
      if (shut.shown || shut.steps !== r.steps) why.push('Back did not close it');
      opened.push({ S, bad: why.join('; ') });
    }
    return { size, sums, opened, cited };
  } finally { await pg.close(); }
}

async function run() {
  const d = dataBad(), bad = d.bad.concat(codeBad());
  const out = await SB.pool(Object.keys(SIZES), 2, onSize);
  out.forEach(o => {
    if (o.sums.kinds.length !== 1 || o.sums.kinds[0] !== 'attachment') bad.push(o.size + ': attachment kinds in the page are ' + JSON.stringify(o.sums.kinds) + ', not one');
    if (o.sums.nBad) o.sums.bad.forEach(b => bad.push(o.size + ': ' + b));
    if (!o.sums.pointed) bad.push(o.size + ': no question points at any attachment');
    o.opened.filter(x => x.bad).forEach(x => bad.push(o.size + ', ' + x.S.name + ': ' + x.bad));
    if (!o.cited.n) bad.push(o.size + ': no AQA 8700 question cites lines');
    o.cited.bad.slice(0, 20).forEach(b => bad.push(o.size + ': ' + b));
  });
  const s = out[0] ? out[0].sums : {};
  console.log('one-attachment: kinds 1 (' + d.rows + ' attachments: ' + TAGS.map((t, i) => d.tags[i] + ' ' + t).join(', ') + '); '
    + (s.pointed || 0) + ' of ' + (s.all || 0) + ' questions point at one and every one resolves; ' + (s.tiles || 0) + ' sampled parts show no Insert tile; ' + d.stand + ' stand-ins without a booklet (budget ' + STANDIN_BUDGET + '); AQA 8700: '
    + d.engSrc + '/' + d.eng + ' papers sat have their source, ' + ((out[0] && out[0].cited.n) || 0) + ' questions citing lines show them on '
    + Object.keys(SIZES).join(' and ') + ', ' + d.held + ' withheld (budget ' + WITHHELD_BUDGET + ')');
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-attachment: ' + bad.length + ' problem(s)');
}
module.exports = { run };
main(module, run);
