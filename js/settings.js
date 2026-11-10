/* @family. — settings.js THE SETTINGS SPREADSHEET, READ OFF THE REPOSITORY INSTEAD OF OFF A SHEET. § */

/* THE TABS THIS FILE OWNS. § */
/* `settings/links` WAS ON THIS LIST, fetched on every load — 27 KB for the Links door on Find, its only reader. § */
const SETTINGS_TABS = ['settings/brand', 'settings/facets', 'settings/kinds', 'settings/laws',
                       'settings/facts',
                       'settings/campaigns', 'settings/copy', 'settings/columns',
                       'settings/spotlight', 'settings/widgets-in-find', 'settings/setting-for', 'settings/card-fields',
                       'settings/default-pictures', 'settings/permissions', 'settings/screens-moved'];

/* `norm` on the backend. § */
const setNorm_ = v => libS(v).toLowerCase().trim();

/* A ROW NUMBER THE SHEET WOULD HAVE GIVEN. § */
const setRow_ = i => i + 2;

/* WHERE A SCREEN THAT MOVED LANDS (461): one row per old id, `to` a column or `find:<kind>[:<type>]`. */
function setMoved_(d, extra) {
  const moved = {};
  (extra['settings/screens-moved'] || []).forEach(r => { const id = libS(r && r.screen), to = libS(r && r.to); if (id && to) moved[id] = to; });
  if (Object.keys(moved).length) d.columnsMoved = moved;
}

function setBrand_(d, extra) {
  /* the branding, whole ------------------------------------------------------------------- EVERY ROW, whether or not the code knows the key — the backend's own § */
  const brand = extra['settings/brand'];
  if (brand && brand.length) {
    d.brand = d.brand || {};
    brand.forEach(r => {
      const k = libS(r.key).trim();
      if (k) d.brand[k] = libS(r.value);
    });
  }
}

function setFacets_(d, extra) {
  /* what the funnel asks ------------------------------------------------------------------- `order` is THREE-STATE: § */
  const facets = extra['settings/facets'];
  if (facets && facets.length) {
    d.facets = facets.filter(r => libS(r.field).trim()).map(r => ({
      field: libS(r.field).trim(),
      label: libS(r.label),
      order: libS(r.sort_order) === '' ? null : Number(r.sort_order),
      active: libOn(r.active),
    }));
  }
}

function setKinds_(d, extra) {
  /* what the funnel's first two questions answer -------------------------------------------- A KIND MAY BE IN MORE THAN ONE GROUP and the cell says so with commas § */
  const kinds = extra['settings/kinds'];
  if (kinds && kinds.length) {
    d.kinds = kinds.filter(r => libS(r.kind).trim()).map(r => ({
      kind: libS(r.kind).trim(),
      group: libS(r.group).split(',').map(x => x.trim()).filter(Boolean),
      label: libS(r.label),
      order: libS(r.sort_order) === '' ? null : Number(r.sort_order),
      active: libOn(r.active),
    }));
  }
}

function setLaws_(d, extra) {
  /* --- the laws that paint words ---------------------------------------------------------------
     Heaviest first, so a specific law beats a general one when both match the same word. */
  const laws = extra['settings/laws'];
  if (laws && laws.length) {
    d.laws = laws
      .filter(r => (libS(r.match) || setNorm_(r.kind) === 'list') && libOn(r.active))
      .map(r => ({
        kind: setNorm_(r.kind) || 'word',
        match: libS(r.match),
        colour: setNorm_(r.colour) || 'ink',
        weight: libN(r.weight) || 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }
}

function setFacts_(d, extra) {
  /* the reels and the "one more thing" widget ------------------------------------------------ HEADING OR CLIP. § */
  const facts = extra['settings/facts'];
  if (facts && facts.length) {
    d.facts = facts
      .map((r, i) => ({ r: r, i: i }))
      .filter(x => (libS(x.r.heading) || libS(x.r.clip)) && libOn(x.r.active))
      .map(x => ({
        subject: libS(x.r.subject),
        heading: libS(x.r.heading),
        body: libS(x.r.body),
        pic: libS(x.r.pic),
        clip: libS(x.r.clip),
        /* THE MINIMUM AGE TO WATCH ITS CLIP, in whole years; blank is everyone (406). */
        age: libS(x.r.age),
        order: libN(x.r.sort_order) || 0,
        row: setRow_(x.i),
      }))
      .sort((a, b) => (a.order - b.order) || (a.row - b.row));
  }

}

function setCampaigns_(d, extra) {
  const campaigns = extra['settings/campaigns'];
  if (campaigns && campaigns.length) {
    const words = {};
    (extra['settings/copy'] || []).forEach(r => {
      if (!libOn(r.active)) return;
      const cid = libS(r.campaign_id), slot = libS(r.slot).toLowerCase(), text = libS(r.text);
      if (!cid || !slot || !text) return;
      (words[cid] || (words[cid] = {}));
      (words[cid][slot] || (words[cid][slot] = []))
        .push({ variant: libS(r.variant) || '1', text: text, note: libS(r.note) });
    });
    Object.keys(words).forEach(cid => Object.keys(words[cid]).forEach(slot =>
      words[cid][slot].sort((a, b) => (Number(a.variant) || 0) - (Number(b.variant) || 0))));

    d.campaigns = campaigns.filter(r => libOn(r.active) && libS(r.campaign_id) && libS(r.name))
      .map(r => ({
        id: libS(r.campaign_id), name: libS(r.name), when: libS(r.when), note: libS(r.note),
        style: libS(r.style), ink: libS(r.ink), accent: libS(r.accent), ground: libS(r.ground),
        blocks: libS(r.blocks),
        copy: words[libS(r.campaign_id)] || {},
      }));
  }

}

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
      .map(r => ({ screen: libS(r.screen), label: libS(r.label) || libS(r.screen), what: libS(r.notes).split(/ — |\. |\(/)[0].trim() }));
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

function settingsInto_(d, extra) {
  if (!d || !extra) return d;
  /* the link tiles WERE MAPPED HERE -------------------------------------------------------------- into `d.links` and `d.dropdowns.linkCategories`, the backend's § */
  /* the campaigns, and the words they say ---------------------------------------------------- ONE PASS OVER `copy`, INDEXED BY CAMPAIGN, so the phone never joins § */
  /* ---------- WHICH COLUMNS THE APP HAS, AND IN WHAT ORDER § */
  setBrand_(d, extra); setMoved_(d, extra); setFacets_(d, extra); setKinds_(d, extra); setLaws_(d, extra); setFacts_(d, extra);
  setCampaigns_(d, extra); setColumns_(d, extra); setSpot_(d, extra); setInFind_(d, extra); setFor_(d, extra); setCardFields_(d, extra);
  setDefaultPictures_(d, extra); setPermissions_(d, extra);
  return d;
}

