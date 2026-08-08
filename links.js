/* ==================================================================================================
   @family. — links.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   links.js is number 9 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- LINK LIBRARY ------------------------------------------------------------------------
   Tiles, in a grid — the one place a grid is right, because a link is a destination rather than a
   thing to read, and a wall of them is faster to scan than a list.
   The shape says what kind it is, which is why the categories no longer need headings.
--------------------------------------------------------------------------------------------- */
/* ---------- A LINK'S OWN LOGO ---------------------------------------------------------------------
   The site's favicon, which is the mark it has chosen for itself and the one somebody already
   recognises. A coloured square with "BB" in it is a thing this app invented; the BBC's own logo is
   the thing on the tab they had open yesterday.

   DUCKDUCKGO'S SERVICE, not Google's. Both are free and keyless and Google's has slightly better
   coverage — but fetching a favicon tells whoever serves it which sites this app links to, and on a
   site used by children that is ninety small disclosures to an advertising company for a marginally
   better hit rate. DuckDuckGo's exists to answer exactly this and keeps nothing.

   THE SHAPE STAYS, underneath. A favicon is a request to somebody else's server: it can 404, be
   blocked, or simply not exist for a link that points at a PDF. The coloured shape is drawn first
   and the logo sits on top of it, so a failure removes the image and reveals what was already
   there — no handler, no state, nothing to go wrong. */
/* WHERE TO ASK SECOND. DuckDuckGo keeps nothing and is the right first choice, and its coverage is
   not complete — a site it has never seen returns nothing at all. Google's has seen everything and
   returns a globe rather than a 404, which makes it the right LAST resort: by the time it is asked,
   the alternative is an empty square.
   Only the hostname goes either way, and only for the links that fail. */
const faviconAlt = url => {
  const host = hostOf_(url);
  return host ? 'https://www.google.com/s2/favicons?sz=64&domain=' + host : '';
};

/** The hostname of an address, or nothing if it is not one. */
const hostOf_ = url => {
  const m = String(url || '').match(/^\s*[a-z][a-z0-9+.-]*:\/\/([^/?#\s]+)/i);
  if (!m) return '';
  const host = m[1].replace(/^[^@]*@/, '').replace(/:\d+$/, '');
  return /\./.test(host) ? host : '';
};

const faviconFor = url => {
  /* READ WITH A PATTERN, not with `new URL`. That constructor is the tidy way and it is not
     everywhere — it is absent from the sandbox this is tested in and from browsers older than the
     phones some families are using — and when it is missing every link silently loses its logo
     rather than throwing somewhere anybody would notice.
     A hostname is the bit between the scheme and the first slash. That is a small enough job to do
     honestly. */
  const host = hostOf_(url);
  return host ? 'https://icons.duckduckgo.com/ip3/' + host + '.ico' : '';
};

/* `LINK_SHAPE` picked a shape and a colour per category — a cart for a shop, a card for a bank,
   a plain square otherwise. It went with the coloured squares: a link wears its own logo now, and
   a category has no business deciding what a site looks like. */

/* `NAMED_COLOURS` lived here — a word in a link's `colour` column became a hex for the coloured
   square it filled. Nothing reads it now: a link wears the site's own logo, so the column is a note
   to whoever keeps the sheet rather than an instruction to the app.
   Removed rather than left: a table nothing uses is one somebody will fill in expecting it to
   do something. */


/* The Library SCREEN is gone with its tab — every link is a card on Find, searchable and
   filterable, which the tile wall never was. `libraryTiles` and `libraryPages` went with it. */
/* ================================================================================================
   AVATARS.

   Carried over whole from the burned file, geometry untouched. This is the one part of that
   rewrite that could not be rebuilt from the backend: hermes holds the CATALOGUE — which items
   exist, what each costs, who may wear it — and this holds the SHAPES. `art_id` is the join
   between them, which is why an item can be renamed in the sheet without changing what it looks
   like: they are different questions.

   The split is deliberate and worth keeping. The browser has to hold the whole set of drawings in
   order to show a wardrobe, and it must hold no authority at all over who may wear what — a
   student with the developer tools open can equip anything they like here, and the server will
   refuse it.

   Deliberately ORIGINAL geometry. A famous toy figure's proportions and head are protected as
   trade dress, and "similar but changed a bit" is precisely what that protection covers. This is
   a simple round-headed blocky character of its own — nothing traced, nothing to credit.
================================================================================================ */
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
function avatarFor(handle, size, packed) {
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

  return `<svg class="avatar" viewBox="0 0 48 60" width="${s}" height="${Math.round(s * 60 / 48)}"
      aria-hidden="true">
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
  </svg>`;
}

/** Ten ticked topics is one level. Whole levels only — a fraction of a level is not a thing you
    can have, and "level 3.5" beside an item unlocking at 4 reads as nearly there when it is not. */
const levelFromXp = xp => Math.floor((Number(xp) || 0) / 10);

/**
 * EVERY WEARABLE, AND WHETHER IT IS YOURS.
 *
 * The backend sends `avatarItems` — its own answer, and the only one that counts. This falls back
 * to deriving the list from the shop rows and the drawings when it hasn't arrived, so a wardrobe
 * still appears on an older payload; what it must never do is decide anybody's unlocks, because
 * a student with the developer tools open can edit whatever this returns.
 */
function wardrobe() {
  const sent = (USER && USER.avatarItems) || DATA.avatarItems;
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