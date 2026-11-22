#!/usr/bin/env node
/* @family. — tools/one-action-roles.js THE NO-WIDENING CHECK (rule 1.75, owner 22 Nov: queue step 6). The old action names were folded into */
/* kind:verb items, the old names kept as aliases (actions.json `item`). Frozen in tools/data/action-roles-before.json is who might call each */
/* name before; this reads who may now, from the generated backend tables themselves (PERMISSIONS, ITEM_PERMISSIONS, postActions_, RUNNABLE), */
/* and fails the build on a name now open to a tier it was not, a name no longer answered, or an item door wider than any old name it stands for. */
'use strict';
const { text, srcFiles, report, main, read } = require('./lib/gen.js');

function run() {
  const bad = [], before = read('tools/data/action-roles-before.json'), A = read('data/settings/actions.json');
  const gs = srcFiles('backend', /\.gs$/).map(f => text(f)).join('\n');
  const table = re => { const m = gs.match(re); if (!m) { bad.push('backend/: no ' + re); return {}; } return new Function('return ' + m[1])(); };
  const P = table(/const PERMISSIONS = (\{[\s\S]*?\n\});/), IP = table(/const ITEM_PERMISSIONS = (\{[\s\S]*?\n\});/);
  const names = src => new Set([...((src || '').matchAll(/^\s*'?([\w:]+)'?:/mg))].map(m => m[1]));
  const posted = names((text('backend/dopost.gs').match(/function postActions_\(\) \{\s*return \{([\s\S]*?)\};/) || [])[1]);
  const runs = names((text('backend/access.gs').match(/const RUNNABLE = \{([\s\S]*?)\};/) || [])[1]);
  const wider = (now, was) => (now || []).filter(r => was.indexOf(r) === -1);
  let names_ = 0;
  Object.keys(before.actions).forEach(n => {
    names_++;
    const was = before.actions[n];
    if (n.indexOf('?run=') === 0) {
      /* A JOB: still runnable, and still admin's alone (getRun_ asks name and PIN of an admin). */
      if (!runs.has(n.slice(5))) bad.push(n + ': no longer a job');
      return;
    }
    if (!posted.has(n)) bad.push(n + ': no longer answered (postActions_)');
    const w = wider(P[n], was);
    if (w.length) bad.push(n + ': now open to ' + w.join(', ') + ' (was ' + was.join(', ') + ')');
  });
  /* EVERY ITEM DOOR: no wider than it was, and no wider than any old name that is now its alias. */
  Object.keys(before.items).forEach(kv => { const w = wider(IP[kv], before.items[kv]); if (w.length) bad.push('item ' + kv + ': now open to ' + w.join(', ')); });
  let aliases = 0;
  A.actions.filter(a => a.item).forEach(a => {
    aliases++;
    const was = before.actions[a.name];
    if (!was) { bad.push(a.name + ': an alias with no old tiers'); return; }
    const w = wider(IP[a.item], was);
    if (w.length) bad.push('item ' + a.item + ' (for ' + a.name + '): open to ' + w.join(', ') + ' (was ' + was.join(', ') + ')');
    /* A CHILD REFUSED MONEY at doPost by the action name; the door does not ask, so a door may not stand for a member-not-child name. */
    if (was.indexOf('member') !== -1 && was.indexOf('child') === -1) bad.push(a.name + ': a member-not-child name cannot be an item door');
  });
  /* A NEW ITEM DOOR (not before, not an alias's) must be argued for here, not slipped in. */
  const aliased = new Set(A.actions.filter(a => a.item).map(a => a.item));
  Object.keys(IP).forEach(kv => { if (!before.items[kv] && !aliased.has(kv)) bad.push('item ' + kv + ': new, with no old name it stands for'); });
  console.log('one-action-roles: ' + names_ + ' old names and ' + Object.keys(before.items).length + ' item doors held to their old tiers; ' + aliases + ' aliases');
  report('one-action-roles', bad, 'widening(s)', console.error);
}
module.exports = { run };
main(module, run);
