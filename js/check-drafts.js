#!/usr/bin/env node
/* @family. — check-drafts.js EVERY BOX A PERSON TYPES INTO SURVIVES A RELOAD, OR SAYS WHY NOT. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let acorn;
try { acorn = require(path.join(ROOT, 'node_modules', 'acorn')); }
catch (e) { console.log('check-drafts: acorn is not installed (npm install) — NOTHING was checked'); process.exit(1); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
if (!m) { console.log('check-drafts: cannot read window.FILES out of index.html — NOTHING was checked'); process.exit(1); }
const FILES = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1] + '.js');
const SRC = {};
FILES.forEach(f => { SRC[f] = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'); });
SRC['find.js'] = require('../tools/find-src.js').findSrc();
['me', 'shell', 'keypad', 'book'].forEach(b => { SRC[b + '.js'] = require('../tools/piece-src.js').pieceSrc(b); });
const ALL = FILES.map(f => SRC[f]).join('\n');
/* A FILE SWITCHED OFF INTO attic/ (owner, 13 Nov) takes its entries with it: they are asked again when it comes back. */
const ATTIC_ = f => !SRC[f] && fs.existsSync(path.join(ROOT, 'attic/js', f));

/* ---------- THE LISTS § */
const KEPT = [
  { file: 'keypad.js', fn: 'kpField_', has: 'Object.assign({}, lock', count: 2,
    why: 'an answer box — every kind, every card and every practical slot is drawn here, and saved on every keystroke through `ansStore_`',
    proof: [['find.js', /closest\('\[data-do="qp-ans"\]'\)[\s\S]{0,700}?ansStore_\(/], ['keypad.js', /'data-do': multi \? 'qp-multi' : 'qp-ans'/]] },
  { file: 'find.js', fn: 'cellInput_', has: "class: 'qp-cell'",
    why: 'a blank of a fill-in table — every cell of the card joined and saved on each keystroke through `ansStore_`, drawn back from `ansRead_`',
    proof: [['find.js', /classList\.contains\('qp-cell'\)[\s\S]{0,400}?ansStore_\(/]] },
  { file: 'me.js', fn: 'qualSlot_', has: "'data-me': f('_board')",
    why: 'a qualification\'s board — the shelf saves each answer on its `change` (`qualCommit_`)',
    proof: [['me.js', /qualCommit_\(slot\);/]] },
  { file: 'me.js', has: 'createElement(input)',
    why: 'the qualification shelf\'s "Something else…" box — saved on its own `change` like the select it replaces',
    proof: [['me.js', /sel\.replaceWith\(box\)/], ['me.js', /qualCommit_\(slot\);/]] },
  { file: 'find.js', fn: 'paintDocket', has: 'dock-tick',
    why: 'a docket tick — saved the moment it is ticked (`docketSave`), and sent as the page goes',
    proof: [['find.js', /keepDue_\('docket', sendTodo\)/]] },
  { file: 'map.js', has: "id: 'notepad'",
    why: 'the notepad — on the device at every keystroke (`familyUser`), on the account 1.4 s later or as the page goes',
    proof: [['find.js', /USER\.notepad = e\.target\.value/], ['find.js', /keepDue_\('notepad', padSend_\)/]] },
  { file: 'cards-render.js', fn: 'paperInput_', has: 'class="bk-in',
    why: 'the booking paper\'s typed box: the note and an admin\'s discount, answers in `BOOKING` kept whole as typed (`bookKeep_`); a saved booking\'s copy is disabled (docs/history/353)',
    proof: [['book.js', /closest\('\[data-do="book-note"\]'\)[\s\S]{0,120}?BOOKING\.note = el\.value \|\| '';\s*bookKeep_\(\);/], ['book.js', /closest\('input\[data-do="book-disc"\]'\)[\s\S]{0,160}?BOOKING\.discValue = String\(el\.value \|\| ''\); bookKeep_\(\);/]] },
  { file: 'records.js', fn: 'profitControl_', has: 'data-pf=', count: 2,
    why: 'a term of the Profit card\'s sum (393) — slider and number box, kept as they move in `PROFIT.vals` on this device (`profitKeep_`), never sent',
    proof: [['records.js', /PROFIT\.vals\[el\.dataset\.pf\] = x;\s*profitKeep_\(\);/]] },
  { file: 'map.js', has: "id: 'sr-text'",
    why: 'the speed reader\'s pasted text (403) — kept on the device as it is typed (`speedDraft`), never sent',
    proof: [['reader.js', /localStorage\.setItem\('speedDraft', e\.target\.value\)/]] },
  { file: 'reader.js', fn: 'speedSheet_', has: "id: 'rsvp-wpm'",
    why: 'the speed reader\'s words a minute (403) — kept on the device as it moves (`speedWpm`)',
    proof: [['reader.js', /localStorage\.setItem\('speedWpm', String\(SPEED\.wpm\)\)/]] },
  { file: 'mat.js', has: 'id="mat-text"',
    why: 'the cheat sheet maker\'s words — kept in `matChoice` 0.2 s after typing, and as the page goes',
    proof: [['mat.js', /keepDue_\('mat'/]] },
  { file: 'mat.js', has: 'mat-exam',
    why: 'the cheat sheet maker\'s exam tick — kept in `matChoice` as it changes',
    proof: [['mat.js', /function matRemember\(/]] },
  { file: 'mat.js', has: 'mat-tick',
    why: 'a cheat sheet maker\'s topic tick — kept in `matChoice` as it changes',
    proof: [['mat.js', /function matRemember\(/]] },
  { file: 'me.js', fn: 'fieldHtml', has: 'data-many-of',
    why: 'a settings several-of-a-list tick (the venues you teach at) — its `change` writes the hidden answer and keeps it as the field\'s draft (315 met 317)',
    proof: [['me.js', /matches\('input\[type="checkbox"\]\[data-many-of\]'\)[\s\S]{0,1500}?draftKeep_\(surface, id, box\.value/], ['me.js', /hidden: \{ attrs: meAttrs_\(`type="hidden" \$\{attr\}="\$\{esc\(name\)\}" value="\$\{esc\(said\)\}"\$\{da\}`\) \}/]] },
  { file: 'lego.js', fn: 'legoPick_', has: 'class="lego-num"',
    why: 'the LEGO piece check\'s set number (owner, 12 Nov) — kept in the kept store as it is typed (`legoWrite_`)',
    proof: [['lego.js', /legoNow_\(\)\.typed\[k\] = String\(t\.value \|\| ''\); legoWrite_\(\);/]] },
  { file: 'lego.js', fn: 'legoPick_', has: 'class="lego-parts"',
    why: 'the LEGO piece check\'s pasted parts list — kept in the kept store as it is typed (`legoWrite_`)',
    proof: [['lego.js', /legoNow_\(\)\.typed\[k\] = String\(t\.value \|\| ''\); legoWrite_\(\);/]] },
  { file: 'tools.js', fn: 'tmtRow_', has: 'tmt-in', count: 3,
    why: 'a timetable box — kept by `tmtKeep_` on every keystroke, on the account signed in and the device signed out',
    proof: [['tools.js', /document\.addEventListener\('input', tmtKeep_\)/], ['tools.js', /keepDue_\('timetable', send\)/]] },
  { file: 'tools.js', fn: 'tmtHtml_', has: 'tmt-weekend',
    why: 'the timetable\'s weekend tick — kept as it changes, like the rest of the timetable',
    proof: [['tools.js', /tmt-weekend/]] },
  { file: 'pixel.js', fn: 'pxeHtml_', has: 'data-pxe-set="colour"',
    why: 'the pixel editor\'s colour (547) -- kept in `pixelArt` on this device as it is picked (`pxeKeep_`), never sent',
    proof: [['pixel.js', /pxeSet === 'colour'[\s\S]{0,80}?PXE\.colour = [\s\S]{0,60}?pxeKeep_\(\);/]] },
];
const PIN = 'a PIN — never written to the device, by a draft or anything else';
const PEOPLE_FORM = 'an admin making or changing somebody else\'s account — a decision made and saved there and then, not left half-made on a device';
const EXEMPT = [
  { file: 'cards-render.js', fn: 'cardControl_', count: 3, why: 'the master template\'s one control (owner, 12 Nov): a spec asks for a draft with `draft: { surface, id }` (draftAttr_ and draftVal_ in it); one without is its builder\'s own, said there' },
  { file: 'spotify.js', fn: 'spCard_', has: 'id="sp-q"', why: 'a Spotify search (510) — a few words, run at once and shown as results; a reload starts a new search' },
  { file: 'favlinks.js', fn: 'favDraw_', has: 'data-fav="title"', why: 'a favourite link\'s title (509) — a few words typed and Added in one press; a redraw keeps it, a reload draws the saved list' },
  { file: 'favlinks.js', fn: 'favDraw_', has: 'data-fav="url"', why: 'a favourite link\'s address (509) — pasted and Added in one press; a redraw keeps it, a reload draws the saved list' },
  { file: 'games.js', has: 'id="tt-answer"', why: 'a times-tables round — a reload is a new round, with a new question' },
  { file: 'tools.js', fn: 'ktPaint_', has: 'kt-in', why: 'touch typing — the line being typed IS the drill; the progress is kept (`kt`)' },
  { file: 'me.js', fn: 'ceWhere_', has: 'data-where-area', why: 'an area tick on Where you teach (owner, 8 Nov) only rewrites the hidden venues_ok box, saved by the card\'s Save; a reload draws the saved areas' },
  { file: 'biz-check.js', fn: 'bcItem_', has: 'data-bc-k="expires_on"', why: 'a renewal\'s new expiry (10 Nov), picked and saved with Renewed in one press; a reload draws the saved expiry' },
  { file: 'biz-check.js', fn: 'bcItem_', has: 'data-bc-k="done_on"', why: 'the Business checker\'s done-on date (1050) — picked and Marked done in one press; a reload draws the saved tick\'s date' },
  { file: 'one-place.js', fn: 'oqItem_', has: 'data-oq-note', why: 'the owner\'s "Something else" (1060) — typed and sent at once; a reload draws the saved note from owner_answers' },
  { file: 'biz-check.js', fn: 'bcItem_', has: 'data-bc-k="note"', why: 'the Business checker\'s one-line proof (1050) — a policy number typed and Marked done at once; a reload draws the saved note' },
  { file: 'work-file.js', fn: '(top)', has: 'createElement(input)', why: 'the Work on file picker (owner, 11 Nov) — pages chosen, never typed; they live in WF until Saved' },
  { file: 'work-file.js', fn: 'wfBody_', has: "class: 'wf-title'", why: 'a scan\'s optional title, typed and Saved with the pages in one sitting; the pages themselves would not survive a reload either' },
  { file: 'work-file.js', fn: 'wfBody_', has: "class: 'wf-subject'", why: 'a scan\'s optional subject, typed and Saved with the pages in one sitting; the pages themselves would not survive a reload either' },
  { file: 'lego.js', fn: '(top)', has: 'createElement(input)', why: 'the LEGO piece check\'s camera (owner, 12 Nov) — a photo taken, never typed; a half-shot batch is retaken after a reload' },
  { file: 'working.js', fn: '(top)', has: 'createElement(input)', why: 'the photo picker of 501 — a file chosen, never typed; the photos it adds live in WORK_PICS until Marked' },
  { file: 'records.js', fn: 'digestWordsCard_', has: 'data-dw=', why: 'the weekly email\'s four lines (491) — a few words edited and Saved in one sitting, with the preview beside them; a reload draws the saved words' },
  { file: 'cards-render.js', fn: 'paperWhy_', has: 'name="why" maxlength="200"', why: 'a tutor\'s optional one-line reason for declining a request (488) — typed and sent in one press; nothing is lost but a few words' },
  { file: 'words.js', fn: 'wordsEditOn_', has: 'class="wk-ph"', why: 'a placeholder\'s words typed over in place (497) — a few words saved at once; a reload draws the saved or the code\'s wording' },
  /* THE STAFF HUB'S PRICING (405): a what-if moved and saved in one sitting; the saved rate is what a reload draws. */
  { file: 'cards-render.js', fn: 'answerBox_', has: '<input${attrs || \'\'}>', why: 'the sign-in name tag on Find (owner, 13 Nov), its only caller — half a handle is not work, and none is kept after (383)' },
  { file: 'tiles.js', fn: 'searchPill_', has: 'type="search"', why: 'the one search bar (487): Reels\' videos and the People search — a word looked up, not work, retyped in a second' },
  { file: 'me.js', fn: 'regFormHtml_', has: "id: 'reg-pin'", why: PIN },
  { file: 'form.js', fn: 'formBox_', has: 'id="${esc(b.id)}"', why: PIN + ': the Signing in boxes, forms.json\'s `signing-in`' },
  { file: 'me.js', fn: 'regFormHtml_', has: "id: 'reg-noemail'", why: 'reset by the who-is-it question above it, which is asked again on purpose (`REG_NOTE`)' },
  /* THE PEOPLE COLUMN'S PERSON FORM (373): another person's account, decided and saved there and then. */
  { file: 'me.js', fn: 'box', has: 'data-pf="${k}"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf="dob"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf-role', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf-parent', why: PEOPLE_FORM },
  /* ADD A PERSON IN FIND (add-person): like the people column's form, another person's account made there and then; the picker is a name looked up. */
  { file: 'me.js', fn: 'box', has: 'data-pa="${k}"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personAddCard_', has: 'data-pa="dob"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'famPick_', has: 'data-fam-q', why: 'a family picker: a name looked up, not work, retyped in a second' },
  { file: 'me.js', fn: 'personEdHtml_', has: 'data-pe="dob"', why: 'saved to their row within a second of typing (edit-person): the server holds it, not a draft' },
  /* APPLY TO TEACH (400): one sheet filled and sent in a sitting; a reload starts the application again. */
  { file: 'me.js', fn: 'box', has: "'data-app': k, autocomplete", why: 'the application to teach (400) — filled and sent in one sitting from its sheet' },
  { file: 'me.js', fn: 'area', has: "'data-app': k, rows", why: 'the application to teach (400) — filled and sent in one sitting from its sheet' },
  { file: 'me.js', fn: 'tick', has: "attrs: { 'data-app': k }", why: 'the application to teach (400) — its three ticks (DBS Update Service, DBS needed, consent), sent with it' },
  { file: 'push.js', fn: 'pushBody_', has: 'data-push-kind', why: 'a phone-notification tick is a `pushSet` the moment it is ticked and the card is redrawn from the server\'s answer — no Save to wait for, nothing half-made on the device (492)' },
  { file: 'form.js', fn: 'formToggle_', has: 'data-do="${esc(t.act)}"', why: 'a Notifications tick is a `setNotify` the moment it is ticked, and a failure puts it back to what the server has — the agreement\'s reason: there is no Save to wait for, so nothing is half-made on the device, and a reload draws the server\'s answer (docs/history/309)' },
  { file: 'map.js', has: "id: 'dock-add'", why: 'one line, kept the moment Enter or + puts it on the docket' },
  { file: 'find.js', has: "class: 'room-name'", why: 'a room name, a few words, prefilled and sent by the button under it' },
];
[KEPT, EXEMPT].forEach(list => { for (let i = list.length - 1; i >= 0; i--) if (ATTIC_(list[i].file)) list.splice(i, 1); });

/* ---------- THE BOXES ------------------------------------------------------------------------------------ */
/* A TAG'S OWN TEXT, from `<` to its closing `>`, stepping over `${ … }` so an attribute written as an
   expression stays part of the tag it is in. */
function tagAt(src, p) {
  let i = p, depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (depth === 0 && c === '>') return src.slice(p, i + 1);
    if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue; }
    if (depth > 0 && c === '{') depth++;
    else if (depth > 0 && c === '}') depth--;
    i++;
  }
  return src.slice(p, p + 300);
}
const sites = [];
const fnSrc = {};
/* EACH MAKER CALL AS THE TAG(S) IT DRAWS: [tag, its text, a textarea's words]; `a(i)` is argument i's source. */
const FORM_BOX_ = {
  formInput_: a => [['input', '<input ' + a(0) + '>']],
  formArea_: a => [['textarea', '<textarea ' + a(0) + '>', a(1)]],
  formTick_: a => [['input', '<input type="checkbox" ' + a(0) + '>']],
  formHidden_: a => [['input', '<input type="hidden" ' + a(0) + ' value="' + a(1) + '"' + a(2) + '>']],
  formFile_: a => [['input', '<input type="file" class="' + a(0) + '">']],
  formSlider_: a => [['input', '<input type="range" ' + a(0) + '>'], ['input', '<input type="number" class="pf-num" ' + a(0) + '>']],
  formPhone_: a => [['input', '<input type="tel" data-me="' + a(1) + '" ' + a(3) + '>']],
};
/* A MAKER OUTSIDE form.js: its call is the box, judged where the attributes are written; its own body is skipped. */
const MAKER_FILE_ = { meBox_: 'me-shelves.js' };
FORM_BOX_.meBox_ = a => [['input', '<input ' + a(1) + '>']];
const isMaker_ = (f, name) => !!FORM_BOX_[name] && (MAKER_FILE_[name] || 'form.js') === f;
/* THE GENERIC CARD BLOCKS (cards-render.js, owner 14 Nov): § */
const GENERIC_ = {
  control: o => (/\btag:\s*'select'/.test(o) ? null : 'input'),
  tick: () => 'input',
  msgForm: () => 'textarea',
  many: () => 'input',   // the ticks of a several-of-a-list (the hidden answer it holds is a draft or kept by the tick's change)
};
const PASS_THROUGH = [
  { fn: 'kcfControl_', re: /const kcfControl_ = b => \(b\.tag === 'select' \? [^\n]*`<input\$\{kcfAttrs_\(b\.attrs\)\}>`\);/ },
  { fn: 'kcfTickB_', re: /const kcfTickB_ = b => [^\n]*<input\$\{kcfAttrs_\(Object\.assign\(\{ type: 'checkbox' \}, b\.attrs\)\)\}>/ },
  { fn: 'msgFormBlock_', re: /<textarea class="msg-text"[^\n]*\$\{b\.drafted \|\| ''\}>\$\{esc\(b\.value \|\| ''\)\}<\/textarea>/ },
  /* and every attribute name a draft uses gets through the filter, written as given */
  { fn: 'kcfAttrs_', re: /const kcfAttrs_ = a => Object\.keys\(a \|\| \{\}\)\.filter\(k => \/\^\[a-z\]\[\\w:-\]\*\$\/i\.test\(k\)/ },
];
for (const f of FILES) {
  const src = SRC[f];
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true }); }
  catch (e) { console.log('check-drafts: ' + f + ' does not parse (' + e.message + ') — NOTHING was checked'); process.exit(1); }
  (function walk(n, fn) {
    if (!n || typeof n.type !== 'string') return;
    let name = fn;
    if (/Function/.test(n.type) && n.id && n.id.name) name = n.id.name;
    if (n.type === 'VariableDeclarator' && n.id && n.id.name && n.init && /Function/.test(n.init.type)) name = n.id.name;
    if (name !== fn && !fnSrc[f + ':' + name]) {
      const body = n.type === 'VariableDeclarator' ? n.init : n;
      fnSrc[f + ':' + name] = src.slice(body.start, body.end);
    }
    const spans = [];
    if (n.type === 'Literal' && typeof n.value === 'string') spans.push([n.start, n.end]);
    if (n.type === 'TemplateElement') spans.push([n.start, n.end]);
    for (const [a, b] of (isMaker_(f, name) || (f === 'cards-render.js' && PASS_THROUGH.some(p => p.fn === name)) ? [] : spans)) {
      const seg = src.slice(a, b);
      const re = /<([a-z][\w-]*)\b/gi;
      let t;
      while ((t = re.exec(seg))) {
        const tag = t[1].toLowerCase();
        const text = tagAt(src, a + t.index);
        if (!(tag === 'input' || tag === 'textarea' || /\scontenteditable\b/i.test(text))) continue;
        /* A TEXTAREA'S VALUE IS ITS WORDS, between the tag and `</textarea>` — where its draft is drawn. */
        const from = a + t.index + text.length, close = tag === 'textarea' ? src.indexOf('</textarea>', from) : -1;
        const body = close > from && close - from < 600 ? src.slice(from, close) : '';
        sites.push({ file: f, fn: name, line: src.slice(0, a + t.index).split('\n').length, tag, text: text.replace(/\s+/g, ' '), body });
      }
    }
    /* THE FORM MAKER'S BOXES (js/form.js): a call is the tag it draws, its attribute text in the tag, so a box drawn by the maker answers as if written out. */
    if (n.type === 'CallExpression' && n.callee && n.callee.type === 'Identifier' && FORM_BOX_[n.callee.name] && !isMaker_(f, name)) {
      const arg = i => { const x = n.arguments[i]; return x ? src.slice(x.start, x.end).replace(/^[`'"]|[`'"]$/g, '') : ''; };
      FORM_BOX_[n.callee.name](arg).forEach(([tag, text, body]) =>
        sites.push({ file: f, fn: name, line: n.loc.start.line, tag, text: text.replace(/\s+/g, ' '), body: body || '' }));
    }
    /* A GENERIC BLOCK'S SPEC, AT ITS CALLER: the object's own source is the tag's text (a `many`'s, its ticks'). */
    if (n.type === 'ObjectExpression' && f !== 'cards-render.js' && !isMaker_(f, name)) {
      const tp = n.properties.find(p => p.key && (p.key.name || p.key.value) === 'type' && p.value && p.value.type === 'Literal');
      const g = tp && GENERIC_[tp.value.value];
      if (g) {
        let o = src.slice(n.start, n.end);
        if (tp.value.value === 'many') { const t = n.properties.find(p => p.key && p.key.name === 'ticks'); o = t ? src.slice(t.start, t.end) : ''; }
        const tag = o && g(o);
        if (tag) {
          const ty = (/\btype:\s*'([a-z]+)'/.exec(o.replace(/^\{\s*type:\s*'\w+'/, '{')) || [])[1];
          sites.push({ file: f, fn: name, line: n.loc.start.line, tag, text: ('<' + tag + (ty ? ' type="' + ty + '"' : '') + ' ' + o + '>').replace(/\s+/g, ' '), body: '' });
        }
      }
    }
    if (n.type === 'CallExpression' && n.callee && n.callee.property && n.callee.property.name === 'createElement'
        && n.arguments[0] && /^(input|textarea)$/.test(n.arguments[0].value)) {
      sites.push({ file: f, fn: name, line: n.loc.start.line, tag: n.arguments[0].value, text: 'createElement(' + n.arguments[0].value + ')' });
    }
    for (const k in n) {
      if (k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => c && typeof c === 'object' && walk(c, name));
      else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, name);
    }
  })(ast, '(top)');
}

/* ---------- WHICH IS EACH ------------------------------------------------------------------------------- */
const bad = [];
const said = [];
const hits = new Map();
/* A cut file's pieces answer to the list's one name: find.js, me.js, shell.js (1040). */
const oneFind_ = f => { const m = /^(find|me|shell|keypad)-[\w-]+\.js$/.exec(f); return m ? m[1] + '.js' : f; };
const matches = (e, s) => oneFind_(s.file) === e.file && (!e.fn || s.fn === e.fn) && (!e.has || s.text.indexOf(e.has) !== -1);
/* A DRAFT: `draftAttr_(` in the tag, or `${name}` where the function the tag is in sets `name` from it.
   The surface, and the id as written (`'first'`, `p.id`, `item.id + ':' + k`), for `drawnBack` below. */
const ATTR = /draftAttr_\(\s*'([\w-]+)'\s*(?:,\s*([^,)]+))?/;
function draftCall(s) {
  if (/draftAttr_\(/.test(s.text)) { const m = ATTR.exec(s.text); return m ? { surface: m[1], id: (m[2] || '').trim() } : { surface: '?', id: '' }; }
  const lit = /data-draft="([\w-]+):([^"]*)"/.exec(s.text);
  if (lit) return { surface: lit[1], id: '' };
  const body = fnSrc[s.file + ':' + s.fn] || '';
  for (const x of s.text.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g)) {
    const set = new RegExp('\\b' + x[1] + '\\s*=\\s*[^;]*?' + ATTR.source).exec(body);
    if (set) return { surface: set[1], id: (set[2] || '').trim() };
  }
  return null;
}
const draftOf = s => { const c = draftCall(s); return c ? c.surface : ''; };
/* AND DRAWN BACK: `draftVal_('<surface>', <the same id>` in the tag or a textarea's words, in the function the tag is in, or in a helper either of them calls § */
const squash = x => String(x || '').replace(/\s+/g, '');
function drawnBack(s, c) {
  const want = squash("draftVal_('" + c.surface + "'," + c.id);
  const fn = fnSrc[s.file + ':' + s.fn] || '';
  const near = s.text + ' ' + (s.body || '');
  const helpers = [...near.matchAll(/\b([A-Za-z_$][\w$]*)\(/g)].map(m => fnSrc[s.file + ':' + m[1]] || '').join(' ');
  if (c.id && [near, fn, helpers].some(t => squash(t).indexOf(want) !== -1)) return true;
  const sf = c.surface.replace(/-/g, '\\-');
  const attrs = (fn.match(new RegExp("draftAttr_\\(\\s*'" + sf + "'", 'g')) || []).length;
  return attrs <= 1 && [near, fn, helpers].some(t => new RegExp("draftVal_\\(\\s*'" + sf + "'").test(t));
}
const count = { answer: 0, draft: 0, kept: 0, exempt: 0, none: 0 };
const surfaces = new Set();
for (const s of sites) {
  const where = s.file + ':' + s.line + ' (' + s.fn + ')';
  const type = (s.text.match(/\btype="([a-z-]+)"/i) || [])[1] || '';
  if (/^(hidden|file)$/i.test(type)) { count.none++; continue; }
  const c = draftCall(s);
  if (c) {
    const d = c.surface;
    count.draft++;
    surfaces.add(d);
    if (/^password$/i.test(type) || /type="password"/.test(s.text)) bad.push(where + ' is a password box carrying a draft — a PIN would be written to the device');
    if (d !== '?' && !drawnBack(s, c)) bad.push(where + ' keeps a "' + d + '" draft (' + (c.id || 'no id') + ') and never draws it back — no `draftVal_(\'' + d + '\', ' + (c.id || '…') + ', …)` in the tag, its function or a helper it calls. The device holds the words and the reload shows an empty box.');
    continue;
  }
  const k = KEPT.find(e => matches(e, s));
  if (k) { hits.set(k, (hits.get(k) || 0) + 1); if (/kpField_/.test(k.fn || '')) count.answer++; else count.kept++; continue; }
  const x = EXEMPT.find(e => matches(e, s));
  if (x) { hits.set(x, (hits.get(x) || 0) + 1); count.exempt++; continue; }
  bad.push(where + ' draws ' + s.text.slice(0, 140) + ' — not an answer, not a draft, not kept by its own code, and not on the EXEMPT list with a reason. A reload loses what is typed into it.');
}
/* EVERY ENTRY STILL NAMES A BOX, AS MANY AS IT SAYS — and every KEPT box's code is still there. */
[...KEPT, ...EXEMPT].forEach(e => {
  const n = hits.get(e) || 0, want = e.count || 1;
  if (n !== want) bad.push('the list entry ' + e.file + (e.fn ? ' ' + e.fn : '') + ' "' + e.has + '" names ' + n + ' box(es), wanted ' + want + ' — stale, or a box was added beside it');
});
KEPT.forEach(e => (e.proof || []).forEach(([f, re]) => {
  if (!SRC[f] || !re.test(SRC[f])) bad.push(e.file + ' "' + e.has + '" is listed as kept by its own code, and the code that keeps it is gone from ' + f + ': ' + re);
}));
PASS_THROUGH.forEach(p => { if (!p.re.test(SRC['cards-render.js'] || '')) bad.push('cards-render.js ' + p.fn + ' no longer passes its caller\'s attributes through as written — the boxes judged at their callers above may lose their drafts in it: ' + p.re); });
/* EVERY DRAFTED SURFACE IS DROPPED SOMEWHERE — sent, saved or started again. */
surfaces.forEach(sf => {
  if (sf === '?') { bad.push('a draft is drawn with a surface name that is not a plain string — it cannot be checked'); return; }
  if (!new RegExp('(draftDrop_|draftSentDone_)\\(\\s*\'' + sf.replace(/[-]/g, '\\-') + '\'').test(ALL)) bad.push('the "' + sf + '" drafts are kept and never dropped — what was sent comes back in the box after the next reload');
});

/* ---------- AND THE HELPER --------------------------------------------------------------------------- */
const data = SRC['data.js'] || '';
if (!/\['input', 'change'\]\.forEach\(ev => document\.addEventListener\(ev, e => \{[\s\S]{0,160}draftFrom_\(/.test(data)) {
  bad.push('data.js has no delegated input/change listener calling `draftFrom_` — every DRAFT above is drawn back and never kept');
}
const never = /const DRAFT_NEVER = (\/.+\/[a-z]*);/.exec(data);
const neverFn = /function draftNever_\(name\) \{[^\n]*\}/.exec(data);
if (!never || !neverFn) bad.push('data.js has no `DRAFT_NEVER` and `draftNever_` — nothing refuses a PIN that a draft box asks to keep');
else {
  /* THE REAL RULE, AS data.js WRITES IT — the pattern and the camelCase split together. */
  const refuses = new Function(never[0] + '\n' + neverFn[0] + '\nreturn draftNever_;')();
  ['set:lib1_pin', 'reg:pin', 'kid-new:pin', 'set:pin', 'x:password', 'set:lib3_pin',
   /* the review of 317's: camelCase, joined, and what pays */
   'set:pinNew', 'x:newPin', 'x:pincode', 'x:pinNumber', 'x:card_number', 'x:sortcode', 'x:security_code',
   'set:account_number', 'set:sort_code', 'x:cardNo', 'x:cvv2'].forEach(k => { if (!refuses(k)) bad.push('`DRAFT_NEVER` lets "' + k + '" be kept'); });
  ['set:pinned', 'post:cap', 'set:headline', 'msg:P-12', 'set:spinner', 'set:opinion', 'set:phone_no',
   'rec:R1:reference', 'post-edit:PO2:when', 'set:account_name', 'msg:P002'].forEach(k => { if (refuses(k)) bad.push('`DRAFT_NEVER` refuses "' + k + '", which is not a PIN'); });
  if (!/function draftKeep_\([^)]*\) \{\s*if \(draftNever_\(/.test(data)) bad.push('`draftKeep_` does not ask `draftNever_` first — the rule above refuses nothing');
}
if (!/\^\(password\|file\|hidden\)\$/.test(data)) bad.push('`draftFrom_` no longer skips password, file and hidden boxes');
const leave = /window\.addEventListener\('beforeunload', e => \{([\s\S]*?)\n\}\);/.exec(data);
if (!leave) bad.push('data.js has no "Leave site?" for work held by nothing but the page');
else if (!/^\s*if \(!keepAtRisk_\(\)\.length\) return;/.test(leave[1])) bad.push('the `beforeunload` in data.js does not return first when nothing is at risk — a prompt on every refresh is noise');
const others = FILES.filter(f => f !== 'data.js' && /addEventListener\(\s*'beforeunload'/.test(SRC[f]));
if (others.length) bad.push('a second "Leave site?" in ' + others.join(', ') + ' — the one in data.js asks only when the work is in nothing but the page');

/* ---------- AND THE CARD BEING EDITED, WHICH KEEPS ONE DRAFT PER SECTION CARD (docs/history/330, 468) § */
const me = SRC['me.js'] || '';
[
  [/\['input', 'change'\]\.forEach\(ev => document\.addEventListener\(ev, e => \{[\s\S]{0,160}closest\('\.card-ed \.me-form'\)[\s\S]{0,120}cardKeep_\(form\);/,
   'a delegated input/change listener on the card being edited that calls `cardKeep_`'],
  [/draftKeep_\('card', key, JSON\.stringify\(\{ v, from \}\)\)/, '`cardKeep_` writing the card\'s draft, each box with the saved value it was typed over'],
  [/draftRead_\('card', pid\)/, 'the card drawn back from its draft (`cardDraft_`)'],
  [/function qualSave_\(el\) \{[\s\S]{0,900}?cardKeep_\(ed\); return Promise\.resolve\(true\);/, 'the qualification shelf keeping an answer on a card rather than posting it (`qualSave_`)'],
  [/function cardClose_\(e, pane, sec\) \{\s*try \{ draftDrop_\('card', e\.pid \+ \(sec \? ':' \+ sec : ''\)\); \}/, 'Save and Cancel dropping the card\'s draft (`cardClose_`)'],
  [/const keep = attr === 'data-me' && !ro && o\.draft !== false && setDraftOk_\(name\);/, '`fieldHtml` honouring `draft: false`, so a box on the card does not keep a `set` draft as well'],
].forEach(([re, what]) => { if (!re.test(me)) bad.push('me.js has no ' + what + ' — a card typed into and reloaded loses what was typed'); });

said.push(sites.length + ' boxes in ' + FILES.length + ' files: ' + count.answer + ' answer boxes (kpField_), ' + count.draft + ' drafts in '
  + surfaces.size + ' surfaces (' + [...surfaces].sort().join(', ') + '), ' + count.kept + ' kept by their own code, '
  + count.exempt + ' exempt with a reason, ' + count.none + ' hidden or file; and the card being edited, one draft for the whole card');

console.log('');
said.forEach(s => console.log('  ' + s));
console.log('\nWRONG  (' + bad.length + ')');
if (!bad.length) console.log('  none');
bad.forEach(b => console.log('  ' + b));
if (bad.length) {
  console.log('\nFAILED — a box that is none of these loses what is typed into it on a reload, which is the essay of 9 Oct (docs/history/317).');
  process.exit(1);
}
console.log('\nOK — every box the app draws is an answer, a draft that is dropped when it is sent, kept by its own code, or exempt with a reason.');
