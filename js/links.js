/* @family. — links.js ONE FILE, SPLIT. § */


/* ---------- THE LINKS ARE GONE, AND THEIR LOGOS WITH THEM § */

/* `LINK_SHAPE` picked a shape and a colour per category — a cart for a shop, a card for a bank, a plain square otherwise. § */

/* `NAMED_COLOURS` lived here — a word in a link's `colour` column became a hex for the coloured square it filled. § */


/* The Library SCREEN is gone with its tab — every link became a card on Find, searchable and filterable, which the tile wall never was. § */
/* AVATARS. Carried over whole from the burned file, geometry untouched. § */
const AV_SKIN  = ['#f3c9a0', '#e0a878', '#c58a5b', '#8d5a3b', '#5f3a25', '#ffd9b3'];
const AV_HAIR  = ['#2b2118', '#5a3a1d', '#a8621f', '#d9b45a', '#8a8a8a', '#3a2a4a', '#7a2a2a'];
/* Colours are FREE — a palette, not a catalogue. The same eight serve shirts and hair, so a
   student can match them without either being something they had to buy. Selling colours would
   have been eight cards for one object. */
const AV_SHIRT = ['#f4f4f2', '#2f6b3f', '#1f5f8a', '#8a3a3a',
                  '#6b4d8a', '#c07a1f', '#3d4b57', '#2f6b6b'];

const AV_ART = {
  /* Hairstyles. Each covers the crown and comes DOWN the sides — the head is a 20x20 box from
     y=12, so hair starting lower than that reads as a headband, which is what the first attempt
     looked like. */
  hair: {
    crop:    c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v4H14z" fill="${c}"/>`,
    fringe:  c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v5h-2v-4H16v4h-2z" fill="${c}"/>`,
    long:    c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v15h-3V20H17v12h-3z" fill="${c}"/>`,
    bunches: c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v3H14z" fill="${c}"/><circle cx="13" cy="23" r="3.6" fill="${c}"/><circle cx="35" cy="23" r="3.6" fill="${c}"/>`,
    curls:   c => `<g fill="${c}"><circle cx="18" cy="14" r="4"/><circle cx="24" cy="12.5" r="4.4"/><circle cx="30" cy="14" r="4"/><circle cx="15" cy="18" r="3.4"/><circle cx="33" cy="18" r="3.4"/></g>`,
    mohawk:  c => `<path d="M22 12h4v-4h-4z" fill="${c}"/><path d="M21 8h6l-1-4h-4z" fill="${c}"/><path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v2H14z" fill="${c}" opacity=".45"/>`,
  },
  headwear: {
    none:     () => '',
    cap:      c => `<path d="M13 18a11 11 0 0 1 22 0v2H13z" fill="${c}"/><path d="M33 19h9v3h-9z" fill="${c}"/>`,
    beanie:   c => `<path d="M13 19a11 11 0 0 1 22 0v2H13z" fill="${c}"/><rect x="12" y="20" width="24" height="4" rx="1.5" fill="${c}" opacity=".75"/>`,
    headband: c => `<rect x="12" y="19" width="24" height="4" rx="1.5" fill="${c}"/>`,
    crown:    () => `<path d="M15 20l2-7 3.5 4L24 12l3.5 5L31 13l2 7z" fill="#e8c14a" stroke="#b8942c" stroke-width="1"/>`,
  },
  faceware: {
    none:    () => '',
    glasses: () => `<g fill="none" stroke="#2b2b2b" stroke-width="1.6"><circle cx="20" cy="25" r="3.4"/><circle cx="28" cy="25" r="3.4"/><path d="M23.4 25h1.2"/></g>`,
    shades:  () => `<g fill="#1b1b1b"><rect x="16.4" y="22.4" width="7" height="5" rx="1.6"/><rect x="24.6" y="22.4" width="7" height="5" rx="1.6"/><rect x="23.4" y="24.2" width="1.2" height="1.4"/></g>`,
    goggles: () => `<g><rect x="15" y="21.5" width="18" height="6.5" rx="3" fill="#3aa0d0" opacity=".85"/><rect x="13" y="23" width="22" height="2" fill="#2b2b2b"/></g>`,
  },
  shoulders: {
    none:     () => '',
    scarf:    c => `<path d="M18 33h12v4H18z" fill="${c}"/><path d="M27 36h4v9h-4z" fill="${c}" opacity=".9"/>`,
    backpack: c => `<rect x="6" y="36" width="5" height="17" rx="2" fill="${c}"/><rect x="37" y="36" width="5" height="17" rx="2" fill="${c}"/>`,
    cape:     c => `<path d="M12 35h24l4 21H8z" fill="${c}" opacity=".85"/>`,
  },
  handheld: {
    none:   () => '',
    book:   () => `<g><rect x="34" y="41" width="9" height="7" rx="1" fill="#b9452f"/><rect x="34" y="41" width="9" height="7" rx="1" fill="none" stroke="#7d2b1c"/><path d="M38.5 41v7" stroke="#f3e6d0"/></g>`,
    racket: () => `<g stroke="#7a5a2a" stroke-width="2" fill="none"><path d="M38 48v-4"/><ellipse cx="38" cy="39.5" rx="4.5" ry="5.5" fill="#e8e2d0"/></g>`,
    ball:   () => `<circle cx="39" cy="45" r="4.5" fill="#f2f2f2" stroke="#2b2b2b" stroke-width="1"/><path d="M39 41.5l1.8 1.6-.7 2.2h-2.2l-.7-2.2z" fill="#2b2b2b"/>`,
    wand:   () => `<g><rect x="37" y="37" width="2" height="12" rx="1" transform="rotate(12 38 43)" fill="#4a3520"/><path d="M41 35l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#ffd95e"/></g>`,
  },
  legs: {
    plain:  c => `<rect x="14" y="54" width="8" height="4" fill="${c}"/><rect x="26" y="54" width="8" height="4" fill="${c}"/>`,
    shorts: () => `<rect x="14" y="54" width="8" height="4" fill="#2f4f7a"/><rect x="26" y="54" width="8" height="4" fill="#2f4f7a"/>`,
    jeans:  () => `<rect x="14" y="54" width="8" height="5" fill="#33507a"/><rect x="26" y="54" width="8" height="5" fill="#33507a"/>`,
    skirt:  () => `<path d="M12 54h24l-2 4H14z" fill="#8a3a6b"/>`,
  },
};

/* Where each slot's art sits on the figure, so an item can be shown ALONE at a sensible crop.
   A shop card is selling one object, and a card-sized person wearing it makes the object the
   smallest thing on the card. */
const AV_CROP = {
  hair:      '10 6 28 20',
  headwear:  '11 10 26 14',
  faceware:  '13 19 22 12',
  shoulders: '4 31 40 26',
  handheld:  '32 32 14 20',
  legs:      '10 51 28 11',
};

/* The six slots, in the order they read on a wardrobe — top of the head downwards, which is how
   anybody describes what somebody is wearing. */
const AV_SLOTS = [['hair', 'Hairstyle'], ['headwear', 'Headwear'], ['faceware', 'Face'],
                  ['shoulders', 'Shoulders'], ['handheld', 'Holding'], ['legs', 'Legs']];

/** Just the item, cropped to itself. What a shop card shows. */
function itemArt(slot, id, size) {
  const fn = (AV_ART[slot] || {})[id];
  if (!fn) return '';
  // A neutral colour: shown off the figure, there is no shirt or hair to inherit from.
  const art = fn('#5b6470');
  return `<svg class="av-item" viewBox="${AV_CROP[slot] || '0 0 48 56'}"
    width="${size || 64}" height="${size || 64}" aria-hidden="true">${art}</svg>`;
}

/** Read a stored avatar string — "skin:2|headwear:cap" — into an object. */
function avatarConfig(packed, handle) {
  /* No choices made yet: the HASH picks a starting look, so a new student has a face rather than
     a blank. Seeded by their handle, so it is theirs and never changes on its own. */
  const h = hashOf(String(handle || '?'));
  const cfg = {
    skin: (h >>> 0) % AV_SKIN.length,
    hairColour: (h >>> 5) % AV_HAIR.length,
    shirt: 0,
    hair: 'crop', headwear: 'none', faceware: 'none',
    shoulders: 'none', handheld: 'none', legs: 'plain',
  };
  String(packed || '').split('|').forEach(pair => {
    const [k, v] = pair.split(':');
    if (!k || v === undefined) return;
    cfg[k] = /^\d+$/.test(v) ? Number(v) : v;
  });
  return cfg;
}

/** An <svg> figure for a person. Layer order is the drawing order, and it is the whole trick:
    shoulders behind the head, hair over the head, headwear over the hair, held things in front. */
/* ---------- AND THE SAME FIGURE AS A PICTURE: HEAD AND SHOULDERS IN A CIRCLE § */
const AV_BUST_GROUND = '#a9cfe9';
function avatarFor(handle, size, packed, o) {
  const c = avatarConfig(packed, handle);
  const skin  = AV_SKIN[c.skin % AV_SKIN.length];
  const hair  = AV_HAIR[c.hairColour % AV_HAIR.length];
  const shirt = AV_SHIRT[c.shirt % AV_SHIRT.length];
  const s = size || 46;
  const hairShape = ((AV_ART.hair || {})[c.hair] || AV_ART.hair.crop)(hair);
  const art = (slot, colour) => {
    const fn = (AV_ART[slot] || {})[c[slot]];
    return fn ? fn(colour) : '';
  };
  const bust = !!(o && o.bust);

  return `<svg class="avatar${bust ? ' is-bust' : ''}" viewBox="${bust ? '4 4 40 40' : '0 0 48 60'}"
      width="${s}" height="${bust ? s : Math.round(s * 60 / 48)}" aria-hidden="true">
    ${bust ? `<g clip-path="url(#av-clip)"><circle cx="24" cy="24" r="20" fill="${AV_BUST_GROUND}"/>` : ''}
    ${art('shoulders', shirt)}
    <rect x="14" y="12" width="20" height="20" rx="6" fill="${skin}"/>
    ${hairShape}
    ${art('headwear', hair)}
    <circle cx="20" cy="25" r="1.5" fill="#2b2b2b"/><circle cx="28" cy="25" r="1.5" fill="#2b2b2b"/>
    <path d="M21 29q3 2 6 0" stroke="#2b2b2b" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${art('faceware')}
    <rect x="20" y="32" width="8" height="4" fill="${skin}"/>
    <rect x="12" y="35" width="24" height="19" rx="3" fill="${shirt}"/>
    <rect x="8"  y="36" width="5" height="17" rx="2.2" fill="${shirt}"/>
    <rect x="35" y="36" width="5" height="17" rx="2.2" fill="${shirt}"/>
    ${art('legs', shirt)}
    ${art('handheld')}
    ${bust ? '</g>' : ''}
  </svg>`;
}

/* A PERSON'S PICTURE — TEN OF OURS, THEIR OWN FIGURE, A PHOTOGRAPH, OR THEIR INITIAL. § */
const PFP_PREFIX = 'pfp:';
const PFP_ART = {
  fox: { name: 'Fox', ground: '#3c6fd1', art:
    `<path d="M11 9l9 9-6 7z" fill="#e8742c"/><path d="M37 9l-9 9 6 7z" fill="#e8742c"/>
     <path d="M13.5 13l4.5 5-3 3.5z" fill="#6b2f12"/><path d="M34.5 13L30 18l3 3.5z" fill="#6b2f12"/>
     <path d="M10 20q14-8 28 0l-3 12-11 8-11-8z" fill="#e8742c"/>
     <path d="M15 29l9 11 9-11q-9 4-18 0z" fill="#fff"/>
     <circle cx="18.5" cy="25" r="2" fill="#1f2328"/><circle cx="29.5" cy="25" r="2" fill="#1f2328"/>
     <circle cx="24" cy="37" r="2" fill="#1f2328"/>` },
  owl: { name: 'Owl', ground: '#2e8b7a', art:
    `<path d="M12 18l2-9 6 6z" fill="#8b5a2b"/><path d="M36 18l-2-9-6 6z" fill="#8b5a2b"/>
     <ellipse cx="24" cy="27" rx="13" ry="14" fill="#8b5a2b"/>
     <ellipse cx="24" cy="33" rx="7.5" ry="7" fill="#e3c08f"/>
     <circle cx="18.5" cy="22" r="5.2" fill="#fff"/><circle cx="29.5" cy="22" r="5.2" fill="#fff"/>
     <circle cx="18.5" cy="22.5" r="2.6" fill="#1f2328"/><circle cx="29.5" cy="22.5" r="2.6" fill="#1f2328"/>
     <path d="M21.5 27h5L24 31z" fill="#f2a516"/>` },
  cat: { name: 'Cat', ground: '#ef8fae', art:
    `<path d="M11 22l2-13 9 6z" fill="#5b6270"/><path d="M37 22l-2-13-9 6z" fill="#5b6270"/>
     <path d="M14 18l1-5 4 3z" fill="#f4b6c8"/><path d="M34 18l-1-5-4 3z" fill="#f4b6c8"/>
     <ellipse cx="24" cy="27" rx="14" ry="12" fill="#5b6270"/>
     <ellipse cx="18.5" cy="25" rx="2.2" ry="3" fill="#b6e36b"/><ellipse cx="29.5" cy="25" rx="2.2" ry="3" fill="#b6e36b"/>
     <ellipse cx="18.5" cy="25.3" rx=".9" ry="2.3" fill="#1f2328"/><ellipse cx="29.5" cy="25.3" rx=".9" ry="2.3" fill="#1f2328"/>
     <path d="M22 30h4l-2 2.4z" fill="#f4b6c8"/>
     <path d="M8 30l9 1M8 34l9-1.5M40 30l-9 1M40 34l-9-1.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>` },
  dino: { name: 'Dinosaur', ground: '#f5c542', art:
    `<path d="M15 23l2-4 2 4zM20 20l2-4.5 2 4.5zM25 19.5l2-4 2 4z" fill="#2c7a3a"/>
     <path d="M7 26q4 6 9 2" stroke="#3fa34d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
     <ellipse cx="22" cy="29" rx="11" ry="8" fill="#3fa34d"/>
     <path d="M26 25q2-11 10-12 6 0 5.5 5.5-.5 3.5-6.5 3.5L31 29z" fill="#3fa34d"/>
     <rect x="15" y="34" width="4.5" height="7" rx="2" fill="#2c7a3a"/><rect x="24" y="34" width="4.5" height="7" rx="2" fill="#2c7a3a"/>
     <circle cx="36.5" cy="16.5" r="1.7" fill="#1f2328"/>
     <path d="M37 20.5h3" stroke="#1f2328" stroke-width="1.2" stroke-linecap="round"/>` },
  robot: { name: 'Robot', ground: '#f07f4f', art:
    `<path d="M24 13V9" stroke="#5b6574" stroke-width="2"/><circle cx="24" cy="8" r="2.4" fill="#e5484d"/>
     <rect x="9" y="19" width="3.5" height="9" rx="1.5" fill="#8a96a5"/><rect x="35.5" y="19" width="3.5" height="9" rx="1.5" fill="#8a96a5"/>
     <rect x="12" y="13" width="24" height="21" rx="5" fill="#d3dbe3"/>
     <circle cx="18.5" cy="22" r="3.6" fill="#1f2328"/><circle cx="29.5" cy="22" r="3.6" fill="#1f2328"/>
     <circle cx="18.5" cy="22" r="2.2" fill="#3cc4f0"/><circle cx="29.5" cy="22" r="2.2" fill="#3cc4f0"/>
     <rect x="17" y="27.5" width="14" height="3.6" rx="1.6" fill="#1f2328"/>
     <path d="M20.5 27.5v3.6M24 27.5v3.6M27.5 27.5v3.6" stroke="#d3dbe3" stroke-width="1"/>
     <rect x="16" y="35" width="16" height="7" rx="2" fill="#8a96a5"/>` },
  rocket: { name: 'Rocket', ground: '#24366e', art:
    `<circle cx="11" cy="14" r="1.2" fill="#fff"/><circle cx="37.5" cy="12" r="1" fill="#fff"/>
     <circle cx="38" cy="33" r="1.2" fill="#fff"/><circle cx="9.5" cy="31" r="1" fill="#fff"/>
     <path d="M19.5 33q4.5 12 9 0z" fill="#ffb020"/><path d="M21.8 33q2.2 6.5 4.4 0z" fill="#ff6b2c"/>
     <path d="M17.5 25L11 34l6.5-1.5zM30.5 25L37 34l-6.5-1.5z" fill="#e5484d"/>
     <path d="M24 6q7 7 7 19v8H17v-8q0-12 7-19z" fill="#eef2f5"/>
     <path d="M24 6q5 4.5 6.3 10H17.7Q19 10.5 24 6z" fill="#e5484d"/>
     <circle cx="24" cy="22.5" r="3.6" fill="#5ec8f2" stroke="#34495e" stroke-width="1.4"/>` },
  planet: { name: 'Planet', ground: '#5b3d8f', art:
    `<circle cx="10" cy="12" r="1.1" fill="#fff"/><circle cx="38" cy="38" r="1.1" fill="#fff"/><circle cx="36" cy="10" r=".9" fill="#fff"/>
     <ellipse cx="24" cy="25" rx="17" ry="5.5" transform="rotate(-18 24 25)" fill="none" stroke="#f5c542" stroke-width="2.6"/>
     <circle cx="24" cy="24" r="10" fill="#f08a4b"/>
     <path d="M15 21q9 3 18-1M14.5 27q9 3 19-1" stroke="#c9602a" stroke-width="2" fill="none" stroke-linecap="round"/>
     <path d="M7.83 30.25A17 5.5-18 0 0 40.17 19.75" fill="none" stroke="#f5c542" stroke-width="2.6"/>` },
  football: { name: 'Football', ground: '#3a9d5d', art:
    `<circle cx="24" cy="24" r="14" fill="#fff" stroke="#1f2328" stroke-width="1.6"/>
     <path d="M24 18.5l5.2 3.8-2 6.1h-6.4l-2-6.1z" fill="#1f2328"/>
     <path d="M24 18.5V11M29.2 22.3l7-2.3M27.2 28.4l4.3 6M20.8 28.4l-4.3 6M18.8 22.3l-7-2.3" stroke="#1f2328" stroke-width="1.4"/>
     <path d="M20.5 10.6L24 11l3.5-.4L24 10z" fill="#1f2328"/>
     <path d="M36.6 17.7l-.4 4.5 1.6 1.1q.4-3-1.2-5.6zM34.4 33.6l-2.9-.7-1.6 2.6q2.8-.3 4.5-1.9zM13.6 33.6l2.9-.7 1.6 2.6q-2.8-.3-4.5-1.9zM11.4 17.7l.4 4.5-1.6 1.1q-.4-3 1.2-5.6z" fill="#1f2328"/>` },
  guitar: { name: 'Guitar', ground: '#d9534f', art:
    `<g transform="rotate(35 24 24)">
       <rect x="22.4" y="5" width="3.2" height="18" fill="#6b3f1d"/>
       <rect x="21" y="2.5" width="6" height="5.5" rx="1.2" fill="#3d2412"/>
       <circle cx="24" cy="23" r="6.4" fill="#f2a65a"/><circle cx="24" cy="32" r="8.2" fill="#f2a65a"/>
       <circle cx="24" cy="26.5" r="2.6" fill="#3d2412"/>
       <rect x="20.5" y="33.5" width="7" height="2" rx="1" fill="#3d2412"/>
       <path d="M23.2 6v28M24.8 6v28" stroke="#fde6c4" stroke-width=".6"/>
     </g>` },
  palette: { name: 'Paint palette', ground: '#6cc6e6', art:
    `<path d="M24 9c11 0 18 7 17 15-1 6-7 5-9 9-2 5-6 7-10 6C13 38 7 31 8 23 9 15 15 9 24 9z" fill="#e2b77a"/>
     <ellipse cx="27" cy="32" rx="3" ry="2.4" fill="#6cc6e6"/>
     <circle cx="16" cy="19.5" r="3.2" fill="#e5484d"/><circle cx="22.5" cy="14.5" r="3.2" fill="#f5c542"/>
     <circle cx="30.5" cy="15" r="3.2" fill="#3fa34d"/><circle cx="35.5" cy="21.5" r="3.2" fill="#3b6fd8"/>
     <circle cx="14" cy="27.5" r="3.2" fill="#8e44ad"/>` },
};

/* THE TOKEN'S NAME, OR NOTHING: § */
function pfpChoice_(v) {
  const m = /^pfp:([a-z]+)$/.exec(String(v == null ? '' : v).trim().toLowerCase());
  if (!m) return '';
  return m[1] === 'avatar' || Object.prototype.hasOwnProperty.call(PFP_ART, m[1]) ? m[1] : '';
}

/* ---------- WHAT KIND OF PICTURE A STORED VALUE IS § */
function picKind_(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '';
  const c = pfpChoice_(s);
  if (c) return c === 'avatar' ? 'avatar' : 'basic';
  if (/^(https?:)?\/\//i.test(s) || /^data:image\//i.test(s)) return 'photo';
  if (!/^[a-z][\w+.-]*:/i.test(s) && !/[|\s]/.test(s)) return 'photo';
  return '';
}

/* ONE OF THE TEN, drawn at `size` pixels. § */
function pfpArt_(name, size) {
  const p = PFP_ART[name];
  if (!p) return '';
  const s = size || 40;
  return `<svg class="pfp-art" viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true">
    <circle cx="24" cy="24" r="24" fill="${p.ground}"/>${p.art}</svg>`;
}

/* THE ONE FUNCTION THAT TURNS A PERSON'S STORED PICTURE INTO WHAT IS DRAWN. § */
function personFace_(who, o) {
  who = who || {}; o = o || {};
  const v = String(who.pic == null ? '' : who.pic).trim();
  const kind = picKind_(v);
  const cls = o.cls || 'face';
  const size = o.size || 40;
  const name = String(who.name || who.handle || '').trim();
  const mine = typeof USER !== 'undefined' && USER && USER.personId && who.personId
    && String(who.personId) === String(USER.personId);
  if (kind === 'photo') {
    return `<img class="${cls}" src="${esc(pic(v))}" alt="${esc(o.alt || '')}"${o.eager ? '' : ' loading="lazy"'} decoding="async">`;
  }
  if (kind === 'basic') return `<span class="${cls} face-pic">${pfpArt_(pfpChoice_(v), size)}</span>`;
  if (kind === 'avatar' && (mine || typeof who.avatar === 'string')) {
    const seed = mine ? (USER.handle || USER.name) : (who.handle || name);
    return `<span class="${cls} face-pic">${avatarFor(seed, size, mine ? (USER.avatar || '') : who.avatar, { bust: true })}</span>`;
  }
  return `<span class="${cls}${o.none ? ' ' + o.none : ''}">${esc(initial(name))}</span>`;
}

/** Ten ticked topics is one level. Whole levels only — a fraction of a level is not a thing you
    can have, and "level 3.5" beside an item unlocking at 4 reads as nearly there when it is not. */
const levelFromXp = xp => Math.floor((Number(xp) || 0) / 10);

/* EVERY WEARABLE, AND WHETHER IT IS YOURS. § */
function wardrobe() {
  /* `|| DATA.avatarItems` was here, and the payload has never had that key — so the fallback was to
     `undefined` dressed as a second source. The login reply sends `avatarItems` and that is the only
     place they have ever come from. */
  const sent = USER && USER.avatarItems;
  if (sent && sent.length) return sent;

  const level = levelFromXp(USER && USER.xp);
  const shop = {};
  (DATA.shop || []).forEach(x => {
    if (isWearable(x) && x.slot && x.artId) shop[x.slot + ':' + x.artId] = x;
  });
  const out = [];
  AV_SLOTS.forEach(([slot]) => {
    Object.keys(AV_ART[slot] || {}).forEach(id => {
      const row = shop[slot + ':' + id];
      const cost = row ? Number(row.price) || 0 : 0;
      const need = row ? Number(row.level) || 0 : 0;
      /* Nothing, a crop and plain legs are what everybody starts with — they are the absence of an
         item rather than an item, so they can never be locked. */
      const free = !row || (!cost && !need) || id === 'none' || id === 'crop' || id === 'plain';
      out.push({ slot, id, name: row ? row.name : id, cost, level: need,
                 unlocked: free || (need && level >= need) });
    });
  });
  return out;
}