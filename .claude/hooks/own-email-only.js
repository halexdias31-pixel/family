// SAFETY (owner, 25 Nov): Claude may email ONLY the owner's own inboxes. Every recipient must be one of
// the owner's addresses (stored as sha256 so no address is in this public repo); anything else is blocked.
const crypto = require('crypto');
const OWN = new Set('db9cf01f830f07feee0278c9c31ca9ffb353c09a9c7b48633bdf8b42e505aac3 43b854631cabf1212e32e81eb4e64b5cea8ab87f44d1668394e59f73beaff5e0 d2d10a780260c481fab361110a455b1cc4e1b0d6543c9641d1a7e7d8e046132e'.split(' '));
let raw = ''; process.stdin.on('data', d => raw += d).on('end', () => {
  let i = {}; try { i = JSON.parse(raw).tool_input || {}; } catch (e) {}
  const all = [].concat(i.to || [], i.cc || [], i.bcc || []).map(s => String(s).trim().toLowerCase());
  const why = i.draftId ? 'sending a saved draft (its recipients cannot be checked)'
    : !all.length ? 'no recipients to check (a reply or forward goes to other people)'
    : all.some(a => !OWN.has(crypto.createHash('sha256').update(a).digest('hex'))) ? 'a recipient is not one of the owner\'s own addresses' : '';
  if (!why) process.exit(0);
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
    permissionDecisionReason: 'Blocked: Claude may only email the owner\'s own inboxes (' + why + '). Save a draft or send it to the owner instead.' } }));
});
