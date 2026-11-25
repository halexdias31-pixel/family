#!/usr/bin/env node
/* @family. — tools/one-role.js THE ONE-ROLE CHECK (rule 1.75, owner 21 Nov: unify batch 2, job F): who a person is and what they may do is written
   once — the role list, ranks, tiers, see roles and the fixed `may` words in data/settings/settings.json `roles`, the helpers that
   read them in data/settings/roles.js — and both sides carry the same copy in their generated SHARED block (cards-gen). A parent or child would
   notice a twin drifting as a button the server refuses or a card shown to the wrong person. Counted site-wide over js/*.js and backend/*.gs
   outside the SHARED block: a shared role name defined again, a literal list of role words, or a may rule answered by a hand-written tier
   comparison fails the build. tools/build.js runs it after cards-gen. */
'use strict';
const vm = require('vm');
const { text, srcFiles, report, main, bare, SHARED_RE } = require('./lib/gen.js');
/* THE NAMES ONLY THE SHARED BLOCK DEFINES. */
const NAMES = ['ROLES_', 'ROLE_IDS', 'RANKS', 'ROLE_ALIASES', 'SEE_ROLES', 'ROLE_THREE_', 'rankTier_', 'mayWord_'];

function find() {
  const bad = [];
  const roles = JSON.parse(text('data/settings/settings.json')).roles, helpers = text('data/settings/roles.js').replace(/\n*$/, '\n');
  /* EVERY ROLE WORD: ids, aliases, app words, ranks, tiers and see roles. */
  const words = new Set([].concat(Object.keys(roles.ids), ...Object.values(roles.ids).map(r => [r.rank, r.tier, r.app].concat(r.aliases || [])),
    roles.ranks, roles.tiers, roles.see.roles, Object.keys(roles.see.words)).filter(Boolean));
  const files = srcFiles('js', /\.js$/).concat(srcFiles('backend', /\.gs$/));
  let count = 0;
  for (const f of files) {
    const src = text(f), block = SHARED_RE.exec(src);
    /* 1. BOTH SIDES CARRY THE HELPERS AS THEY STAND. */
    if (f === 'js/core.js' || f === 'backend/constants.gs') {
      if (!block || block[0].indexOf(helpers) === -1) bad.push(f + ': SHARED block lacks data/settings/roles.js as it stands (run cards-gen)');
    }
    /* THE GENERATED BLOCKS ARE THE SOURCE'S OWN COPIES (SHARED here, the permissions.json tables by tools/permissions.js): kept, not looked at;
       comments are blanked too. */
    bare(src, { generated: true, comments: 'js' }).split('\n').forEach((code, i) => {
      const at = f + ':' + (i + 1);
      /* 2. A SHARED NAME DEFINED AGAIN. */
      for (const n of NAMES) if (new RegExp('^\\s*(?:const|let|var|function)\\s+' + n.replace('$', '\\$') + '\\b').test(code)) bad.push(at + ': defines ' + n + ' again (it is the SHARED block\'s)');
      /* 3. A LITERAL LIST OF ROLE WORDS (two or more, nothing else). */
      (code.match(/\[\s*'[^'\]]*'(?:\s*,\s*'[^'\]]*')+\s*\]/g) || []).forEach(lit => {
        const items = lit.slice(1, -1).split(',').map(x => x.trim().slice(1, -1));
        count++;
        /* the whole set (four or more), or any list a constant is made of; a short audience inside a rule row is that rule's own. */
        if (items.every(x => words.has(x)) && (items.length >= 4 || /^\s*const\s+\w+\s*=\s*\[/.test(code))) bad.push(at + ': a literal role list ' + lit + ' (settings.json `roles`)');
      });
      /* 4. A MAY RULE BY HAND: `if (what === 'x') return <tier> === ...`. */
      if (/what\s*===\s*'\w+'\s*\)\s*return\s+\w+\s*[!=]==\s*'/.test(code)) bad.push(at + ': a may rule by hand (settings.json `roles.may`)');
    });
  }
  /* 6. THE HELPERS ANSWER AS THE TABLE SAYS, run once over every tier and rank. */
  const ctx = { SHARED_SETTINGS: { roles } };
  vm.runInNewContext(helpers + ';this.mayWord_=mayWord_;this.rankTier_=rankTier_;', ctx);
  if (ctx.mayWord_('admin', 'admin', 'admin', false) !== true || ctx.mayWord_('prices', 'child', 'student', false) !== false
    || ctx.mayWord_('owner', 'admin', 'admin', false) !== false || ctx.mayWord_('nosuchword', 'admin', 'admin', true) !== undefined
    || ctx.rankTier_('student') !== 'child') bad.push('data/settings/roles.js: mayWord_/rankTier_ do not answer as settings.json `roles` says');
  return { bad, files: files.length, lists: count };
}

function run() {
  const { bad, files, lists } = find();
  console.log('one-role: ' + files + ' files, ' + lists + ' string lists looked at, ' + bad.length + ' role twins');
  report('one-role', bad, 'role rule(s) defined outside settings.json `roles` / data/settings/roles.js');
}
module.exports = { run, find };
main(module, run);
