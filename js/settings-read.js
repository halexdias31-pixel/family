function setColumns_(d, extra) {
  const columns = extra['settings/columns'];
  if (columns && columns.length) {
    const live = columns
      .map((r, i) => ({ r: r, i: i }))
      .filter(x => libS(x.r.screen) && libOn(x.r.active))
      .sort((a, b) => (libN(a.r.sort_order) - libN(b.r.sort_order)) || (a.i - b.i))
      .map(x => ({ screen: libS(x.r.screen), label: libS(x.r.label), icon: libS(x.r.icon) }));
    /* AND NOT AN EMPTY LIST. § */
    if (live.length) d.columns = live;
    /* SWITCHED OFF (880): each is a Coming soon card in Find, its first plain line its notes; switched on again, its card goes. */
    d.columnsOff = columns.filter(r => libS(r.screen) && !libOn(r.active))
      .map(r => ({ screen: libS(r.screen), label: libS(r.label) || libS(r.screen), what: libS(r.notes).split(/ — |\. |\(/)[0].trim(),
        inFind: libS(r.in_find) !== '' && libOn(r.in_find), soonKind: libS(r.soon_kind) || 'soon' }));
  }
}

function setSpot_(d, extra) {
  /* ---------- THE SHOP WINDOW'S FLOOR, AND IT IS `spotlightFile` RATHER THAN `spotlight` § */
  const spot = extra['settings/spotlight'];
  if (spot && spot.length) {
    d.spotlightFile = spot
      .filter(r => libS(r.item_id) && libOn(r.on))
      .map(r => libS(r.item_id));
  }
}

function setInFind_(d, extra) {
  /* ---------- WHICH WIDGETS ARE FIND CARDS (790): a row names a widget's kind or its id; the id's row wins (`widgetInFind_`, arcade.js) ---------- */
  const inFind = extra['settings/widgets-in-find'];
  if (inFind && inFind.length) {
    d.widgetsInFind = inFind.filter(r => libS(r.widget).trim()).map(r => ({ widget: libS(r.widget).trim(), find: libOn(r.find) }));
  }
}

function setFor_(d, extra) {
  /* ---------- EACH SETTING'S NAME AND PLACE; who sees it is permissions.json's `see` rows (86a), never this file ---------- */
  const setFor = extra['settings/setting-for'];
  /* THE ROWS' ORDER IS THE ITEMS' ORDER, account types first (their menu order); `under` is only which menu types list it. */
  if (setFor && setFor.length) d.settingFor = Object.fromEntries(setFor.filter(r => libS(r.card).trim())
    .map((r, i) => [libS(r.card).trim(), { under: libS(r.under).split(',').map(t => t.trim()).filter(Boolean), name: libS(r.name).trim(), rank: i, col: libS(r.col).trim(), peek: r.peek === true || libOn(r.peek) }]));
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
  /* the link tiles WERE MAPPED HERE -------------------------------------------------------------- into `d.links` and `d.dropdowns.linkCategories`, the backend's § */
  /* the campaigns, and the words they say ---------------------------------------------------- ONE PASS OVER `copy`, INDEXED BY CAMPAIGN, so the phone never joins § */
  /* ---------- WHICH COLUMNS THE APP HAS, AND IN WHAT ORDER § */
  setBrand_(d, extra); setMoved_(d, extra); setFacets_(d, extra); setKinds_(d, extra); setLaws_(d, extra); setFacts_(d, extra);
  setCampaigns_(d, extra); setColumns_(d, extra); setSpot_(d, extra); setInFind_(d, extra); setFor_(d, extra); setCardFields_(d, extra);
  setDefaultPictures_(d, extra); setPermissions_(d, extra); setLabels_(d, extra);
  return d;
}

