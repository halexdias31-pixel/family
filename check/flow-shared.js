/* @family. — check/flow-shared.js what js/check-flow.js's boot() reads before check/flow/ is eval'd: a const there lives in its eval, unseen by boot (1040). */
'use strict';
/* A CLIENT, signed in — the member a funnel journey browses as (400); a client sees prices, as a visitor did. */
const MEMBER_ = { name: 'Mo Member', personId: 'P-MEMBER', role: 'parent', roles: ['parent'], rank: 'client', token: 't-member', handle: 'momember' };
const signedInAs_ = u => w => { try { w.localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) { /* storage blocked: the journey runs signed out */ } };
module.exports = { MEMBER_, signedInAs_ };
