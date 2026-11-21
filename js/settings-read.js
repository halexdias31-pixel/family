function setSpot_(d, extra) {
  /* THE SHOP WINDOW'S FLOOR, `spotlightFile` not `spotlight` § */
  const spot = extra['settings/spotlight'];
  if (spot && spot.length) {
    d.spotlightFile = spot
      .filter(r => libS(r.item_id) && libOn(r.on))
      .map(r => libS(r.item_id));
  }
}

/* THE WORDS A TYPO IS NEVER FORGIVEN TOWARDS (`markTypo_`): each row's words are different answers */
function setConfusables_(d, extra) {
  const confusables = extra['settings/confusables'];
  if (confusables && confusables.length) d.confusables = confusables.filter(r => libS(r.words).trim()).map(r => ({ words: libS(r.words) }));
}

/* THE ONE MARKING ENGINE'S TABLE (data/settings/marking.json): its methods in order, PEEL's boxes, levels and word lists (rule 1.33), distilled rule sets */
function setMarking_(d, extra) {
  const rows = extra['settings/marking'];
  if (rows && rows.length) d.marking = rows.filter(r => r && libS(r.kind)).map(r => Object.assign({}, r));
}


function setFor_(d, extra) {
  /* ---------- EACH SETTING'S NAME AND PLACE; who sees it is permissions.json's `see` rows (86a), never this file ---------- */
  const setFor = extra['settings/setting-for'];
  /* THE ROWS' ORDER IS THE ITEMS' ORDER, account types first (their menu order); `under` is only which menu types list it. */
  if (setFor && setFor.length) d.settingFor = Object.fromEntries(setFor.filter(r => libS(r.card).trim())
    .map((r, i) => [libS(r.card).trim(), { under: libS(r.under).split(',').map(t => t.trim()).filter(Boolean), name: libS(r.name).trim(), rank: i, col: libS(r.col).trim(), label: libS(r.label).trim(), admin: r.admin === true || libOn(r.admin), peek: r.peek === true || libOn(r.peek) }]));
}

function setCardFields_(d, extra) {
  /* ---------- EACH KIND'S CARD FIELDS (owner, 8 Nov): picture, title, tags and lines, comma lists of `KC_FIELDS` names (cards.js) ---------- */
  const rows = extra['settings/card-fields'];
  const list = v => libS(v).split(',').map(t => t.trim()).filter(Boolean);
  if (rows && rows.length) d.cardFields = Object.fromEntries(rows.filter(r => libS(r.kind).trim()).map(r => [libS(r.kind).trim(),
    { cls: libS(r.cls).trim(), pic: list(r.pic), title: list(r.title), tags: list(r.tags), lines: list(r.lines), tiles: list(r.tiles) }]));
  /* WHICH KINDS HAND OVER ONLY FACTS, and each kind's one outline icon (owner, 10 Nov; `kcLook_`, cards.js). */
  if (rows && rows.length) d.cardLook = Object.fromEntries(rows.filter(r => libS(r.kind).trim()).map(r => [libS(r.kind).trim(), { facts: r.facts === true || libOn(r.facts), icon: libS(r.icon).trim() }]));
}

function setDefaultPictures_(d, extra) {
  /* ---------- THE OWNER'S DEFAULT PICTURES (9 Nov): rows {picture}; a card with no picture of its own takes one (`kcPicOr_`) ---------- */
  const pics = extra['settings/default-pictures'] || [];
  d.defaultPictures = Array.isArray(pics) ? pics.map(r => libS(r.picture).trim()).filter(Boolean) : [];
}

function setPermissions_(d, extra) {
  /* ---------- THE ONE PERMISSIONS TABLE (86a): rows {kind, role, action, allow}, the backend's permissions.gs from the same file ---------- */
  const perms = extra['settings/permissions'];
  if (perms && perms.length) d.permissions = perms.filter(r => libS(r.action).trim() && libS(r.role).trim()).reduce((o, r) => {
    const k = libS(r.kind).trim() || 'action';
    ((o[k] = o[k] || {})[libS(r.action).trim()] = o[k][libS(r.action).trim()] || {})[libS(r.role).trim()] = r.allow === true || libOn(r.allow);
    return o;
  }, {});
}

/* THE WORDS THE SHOP AND HISTORY SAY, by group and key (data/settings/labels.json); `labelOf_` keeps the code's word when a row is missing */
function setLabels_(d, extra) {
  const labels = extra['settings/labels'];
  if (!labels || !labels.length) return;
  d.labels = {};
  labels.forEach(r => {
    const o = d.labels;
    if (libOn(r.active) && libS(r.group) && libS(r.key) && libS(r.label)) (o[libS(r.group)] = o[libS(r.group)] || {})[libS(r.key)] = libS(r.label);
  });
}
const labelOf_ = (group, key, fallback) => {
  try { const g = DATA && DATA.labels && DATA.labels[group]; return (g && g[key]) || fallback; } catch (e) { return fallback; }
};

function settingsInto_(d, extra) {
  if (!d || !extra) return d;
  setBrand_(d, extra); setMoved_(d, extra); setLaws_(d, extra); setFacts_(d, extra);
  setSpot_(d, extra); setConfusables_(d, extra); setMarking_(d, extra); setFor_(d, extra); setCardFields_(d, extra);
  setDefaultPictures_(d, extra); setPermissions_(d, extra); setLabels_(d, extra);
  return d;
}

