/* @family. — settings.js THE SETTINGS SPREADSHEET, READ OFF THE REPOSITORY INSTEAD OF OFF A SHEET. § */

/* THE TABS THIS FILE OWNS. § */
/* `settings/links` WAS ON THIS LIST, fetched on every load — 27 KB for the Links door on Find, its only reader. § */
const SETTINGS_TABS = ['settings/brand', 'settings/facets', 'settings/kinds', 'settings/laws',
                       'settings/facts',
                       'settings/campaigns', 'settings/copy', 'settings/columns',
                       'settings/spotlight', 'settings/widgets-in-find', 'settings/setting-for', 'settings/card-fields',
                       'settings/default-pictures', 'settings/permissions', 'settings/screens-moved', 'settings/labels',
                       'settings/confusables'];

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
  /* the branding, whole ------------------------------------------------------------------- EVERY ROW, whether or not the code § */
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
  /* what the funnel's first two questions answer -------------------------------------------- A KIND MAY BE IN MORE THAN ONE § */
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
  /* the laws that paint words --------------------------------------------------------------- Heaviest first, so a specific law § */
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

