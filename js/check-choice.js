/* ==================================================================================================
   @family. — check-choice.js

   A FACE AND A POLL VOTE ARE SET, NOT TOGGLED — asked of the real `doPost` over an in-memory ledger
   (`check-gas-load.js`).

   `reactPost` AND `votePoll` WERE ONLY TOGGLES: "the same one again takes it back". A toggle means
   something different depending on what reached the server before it, and the phone sent one per tap
   and undid each refused one on its own. Two quick taps on 😂, the first save refused and the second
   accepted, and the server held 😂 while the page showed nothing — a reload brought back a reaction the
   person had taken back (docs/history/335). The phone now sends one save at a time carrying `want`, the
   face or answer to end on ('' for none), and the server SETS it. What is held here:

     · `want` IS IDEMPOTENT: the same request twice leaves one row, as it was asked; `want: ''` twice
       leaves none — the old toggle would have put the reaction back on the second
     · A CHANGE OF FACE IS ONE ROW CHANGED, never a second row
     · EVERY ROW OF YOURS: copies an old race left behind (look-then-write with no lock) are cleared by
       the next save — set keeps one, '' keeps none — so a reaction taken away cannot come back from a
       duplicate on the next load, and the payload counts one
     · `want` IS STILL CHECKED: a face the post does not offer, or an answer the poll does not have, is
       refused and writes nothing
     · A PHONE FROM BEFORE `want` still toggles on `emoji` / `choice`, because the front end and the Apps
       Script project reach the live site by different steps (CLAUDE.md, "Deploying")
     · UNDER THE SCRIPT LOCK: a lock that cannot be had answers `why: 'busy'` and writes nothing
================================================================================================== */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load');

const bad = [];
let asked = 0;
const FACES = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

function world(lockFree) {
  let locks = 0;
  const b = backend(lockFree === false
    ? { LockService: { getScriptLock: () => ({ tryLock: () => false, waitLock: () => { throw new Error('busy'); }, releaseLock: () => {} }) } }
    : { LockService: { getScriptLock: () => ({ tryLock: () => { locks++; return true; }, waitLock: () => { locks++; }, releaseLock: () => {} }) } });
  b.seed('people', [{ person_id: 'P-A', first_name: 'Ada', last_name: 'Parent', email: 'a@example.org',
                      pin: '0000', verified: 'TRUE', role: 'client', city: 'London' }]);
  b.seed('posts', [{ post_id: 'PO1', author: '@family.', image: 'https://example.org/a.jpg', caption: 'A Tuesday',
                     poll: 'Tuesday, Thursday', active: 'TRUE' }]);
  const d = b.post({ action: 'verifyLogin', email: 'a@example.org', pin: '0000' });
  if (!d.success) bad.push('could not sign Ada in — ' + d.error + ' — so nothing below was asked');
  const tok = d.token;
  const ask = body => { asked++; return b.post(Object.assign({ token: tok, name: 'Ada Parent', personId: 'P-A', postId: 'PO1' }, body)); };
  /* THE ROWS AS THE SHEET HOLDS THEM, header off. */
  const rows = tab => { const h = b.tabs[tab][0]; return b.tabs[tab].slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; }); };
  const mine = (tab, col) => rows(tab).filter(r => r.post_id === 'PO1' && r.person_id === 'P-A').map(r => r[col]);
  return { b, ask, rows, mine, locks: () => locks };
}

/* ---------- A REACTION ------------------------------------------------------------------------------ */
{
  const { b, ask, mine, locks } = world();
  const face = () => JSON.stringify(mine('post_reactions', 'emoji'));
  let d = ask({ action: 'reactPost', emoji: '😂', want: '😂' });
  if (!d.success || d.emoji !== '😂') bad.push('reactPost want 😂 answered ' + JSON.stringify(d));
  d = ask({ action: 'reactPost', emoji: '😂', want: '😂' });
  if (!d.success || d.emoji !== '😂') bad.push('the same want 😂 again answered ' + JSON.stringify(d) + ' — a set, not a toggle');
  if (face() !== '["😂"]') bad.push(`want 😂 sent twice left Ada's rows at ${face()} — one 😂, as asked, whatever arrived before it`);
  if (!locks()) bad.push('reactPost wrote without taking the script lock — two requests at once both read "nothing of yours" and both add a row');

  d = ask({ action: 'reactPost', emoji: '👍', want: '👍' });
  if (face() !== '["👍"]') bad.push(`moving to 👍 left ${face()} — one row changed, never a second`);

  d = ask({ action: 'reactPost', emoji: '👍', want: '' });
  if (!d.success || d.emoji !== '') bad.push("want '' answered " + JSON.stringify(d));
  d = ask({ action: 'reactPost', emoji: '👍', want: '' });
  if (!d.success || d.emoji !== '') bad.push("want '' again answered " + JSON.stringify(d) + ' — taking back what is not there is still a success');
  if (face() !== '[]') bad.push(`want '' sent twice left ${face()} — the old toggle put it back on the second`);

  /* COPIES A RACE LEFT BEHIND, cleared by the next save in either direction. */
  b.seed('post_reactions', [{ reaction_id: 'RE1', post_id: 'PO1', person_id: 'P-A', emoji: '😂' },
                            { reaction_id: 'RE2', post_id: 'PO1', person_id: 'P-A', emoji: '👍' },
                            { reaction_id: 'RE3', post_id: 'PO1', person_id: 'P-OTHER', emoji: '👍' }]);
  ask({ action: 'reactPost', emoji: '🎉', want: '🎉' });
  if (face() !== '["🎉"]') bad.push(`with two rows of Ada's on the post, want 🎉 left ${face()} — one row, 🎉`);
  b.seed('post_reactions', [{ reaction_id: 'RE4', post_id: 'PO1', person_id: 'P-A', emoji: '😮' }]);
  ask({ action: 'reactPost', emoji: '🎉', want: '' });
  if (face() !== '[]') bad.push(`with two rows of Ada's on the post, want '' left ${face()} — a copy left behind comes back on the next load`);
  const whose = b.tabs.post_reactions[0].indexOf('person_id');
  if (JSON.stringify(b.tabs.post_reactions.slice(1).map(r => r[whose])) !== '["P-OTHER"]') {
    bad.push("clearing Ada's reactions touched somebody else's row");
  }

  /* STILL CHECKED. */
  d = ask({ action: 'reactPost', emoji: '🦄', want: '🦄' });
  if (!d.error) bad.push('want 🦄, a face the post does not offer, answered ' + JSON.stringify(d));
  if (face() !== '[]') bad.push(`a refused want wrote ${face()}`);

  /* A PHONE FROM BEFORE `want`: the toggle it was written against. */
  ask({ action: 'reactPost', emoji: '😂' });
  if (face() !== '["😂"]') bad.push(`an old phone's 😂 (no want) left ${face()} — it adds`);
  d = ask({ action: 'reactPost', emoji: '😂' });
  if (face() !== '[]' || d.emoji !== '') bad.push(`an old phone's second 😂 left ${face()}, answered ${JSON.stringify(d)} — the same one again takes it back`);

  /* AND THE PAYLOAD COUNTS WHAT IS THERE. */
  ask({ action: 'reactPost', emoji: '❤️', want: '❤️' });
  b.cache.clear();
  const p = b.get({ name: 'Ada Parent', personId: 'P-A' });
  const post = (p.posts || []).find(x => x.id === 'PO1');
  const r = post && post.reactions;
  if (!r) bad.push('the payload has no PO1 with reactions to read back');
  else {
    const n = r.counts[r.emoji.indexOf('❤️')];
    if (n !== 1) bad.push(`after want ❤️ the payload counts ❤️ ${n}, not 1`);
    if (r.total !== 2) bad.push(`after want ❤️ the payload's total is ${r.total}, not 2 (Ada's ❤️ and the other 👍)`);
  }
}

/* ---------- A POLL VOTE -------------------------------------------------------------------------- */
{
  const { b, ask, mine } = world();
  const vote = () => JSON.stringify(mine('post_votes', 'choice'));
  ask({ action: 'votePoll', choice: 'Tuesday', want: 'Tuesday' });
  ask({ action: 'votePoll', choice: 'Tuesday', want: 'Tuesday' });
  if (vote() !== '["Tuesday"]') bad.push(`want Tuesday sent twice left Ada's votes at ${vote()} — one Tuesday`);
  ask({ action: 'votePoll', choice: 'Thursday', want: 'Thursday' });
  if (vote() !== '["Thursday"]') bad.push(`moving to Thursday left ${vote()}`);
  ask({ action: 'votePoll', choice: 'Thursday', want: '' });
  const d = ask({ action: 'votePoll', choice: 'Thursday', want: '' });
  if (!d.success || d.choice !== '' || vote() !== '[]') bad.push(`want '' twice left ${vote()}, answered ${JSON.stringify(d)}`);
  b.seed('post_votes', [{ vote_id: 'V1', post_id: 'PO1', person_id: 'P-A', choice: 'Tuesday' },
                        { vote_id: 'V2', post_id: 'PO1', person_id: 'P-A', choice: 'Thursday' }]);
  ask({ action: 'votePoll', choice: 'Tuesday', want: 'Tuesday' });
  if (vote() !== '["Tuesday"]') bad.push(`with two votes of Ada's, want Tuesday left ${vote()} — one vote`);
  const no = ask({ action: 'votePoll', choice: 'Friday', want: 'Friday' });
  if (!no.error || vote() !== '["Tuesday"]') bad.push(`want Friday, not an answer, answered ${JSON.stringify(no)} and left ${vote()}`);
  /* THE OLD PHONE. */
  ask({ action: 'votePoll', choice: 'Tuesday' });
  if (vote() !== '[]') bad.push(`an old phone's vote on its own answer (no want) left ${vote()} — the same one again takes it back`);
}

/* ---------- THE LOCK THAT CANNOT BE HAD ------------------------------------------------------------ */
{
  const { ask, mine } = world(false);
  const d = ask({ action: 'reactPost', emoji: '😂', want: '😂' });
  if (d.why !== 'busy' || !d.error) bad.push('with the lock held elsewhere, reactPost answered ' + JSON.stringify(d) + " — wanted why: 'busy'");
  if (mine('post_reactions', 'emoji').length) bad.push('with the lock held elsewhere, reactPost still wrote');
  const v = ask({ action: 'votePoll', choice: 'Tuesday', want: 'Tuesday' });
  if (v.why !== 'busy' || !v.error) bad.push('with the lock held elsewhere, votePoll answered ' + JSON.stringify(v));
  if (mine('post_votes', 'choice').length) bad.push('with the lock held elsewhere, votePoll still wrote');
}

console.log(`requests asked of doPost: ${asked}`);
if (bad.length) {
  console.log('\nFAILED — ' + bad.length + ':\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('OK — a face and a vote are set to what the phone asked for, once, under the lock, over every row of yours; an old phone still toggles.');
