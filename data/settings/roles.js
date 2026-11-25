/* THE ROLE HELPERS BOTH SIDES SHARE (one role check, owner 21 Nov): copied by tools/cards-gen.js into the SHARED block of js/core.js and
   backend/constants.gs, after SHARED_SETTINGS. Edit here, never there; tools/one-role.js fails the build on a twin anywhere else. Plain ES2017. */
const ROLES_ = SHARED_SETTINGS.roles;
const ROLE_IDS = Object.keys(ROLES_.ids);
const RANKS = ROLES_.ranks;
const ROLE_ALIASES = Object.fromEntries([].concat(...ROLE_IDS.map(r => (ROLES_.ids[r].aliases || []).map(a => [a, r]))));
const SEE_ROLES = ROLES_.see.roles;
const ROLE_THREE_ = ROLES_.see.words;
/* THE PERMISSION TIER A RANK HOLDS (actions.json `roles`); no rank is a guest. */
function rankTier_(rank) {
  const id = ROLE_IDS.find(r => ROLES_.ids[r].rank === rank);
  return id ? ROLES_.ids[id].tier : ROLES_.guest.tier;
}
/* A FIXED WORD (`roles.may`) for this tier, rank and owner-ness; undefined when the word is a permissions.json row instead. */
function mayWord_(what, tier, rank, isOwner) {
  const m = Object.prototype.hasOwnProperty.call(ROLES_.may, what) ? ROLES_.may[what] : null;
  if (!m) return undefined;
  let ok = m.rank ? !!rank && RANKS.indexOf(rank) >= RANKS.indexOf(m.rank)
    : m.tiers ? m.tiers.indexOf(tier) !== -1 : (m.notTiers || []).indexOf(tier) === -1;
  if (m.owner) ok = ok && !!isOwner;
  return ok;
}
