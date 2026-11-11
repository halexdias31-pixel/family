/* @family. — links.js ONE FILE, SPLIT. § */



/* `LINK_SHAPE` picked a shape and a colour per category — a cart for a shop, a card for a bank, a plain square otherwise. § */

/* `NAMED_COLOURS` lived here — a word in a link's `colour` column became a hex for the coloured square it filled. § */


/* A PERSON'S PICTURE — TEN OF OURS, A PHOTOGRAPH, OR THEIR INITIAL (the figure went, 9 Nov: a stored `pfp:avatar` is no choice). */
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
  return Object.prototype.hasOwnProperty.call(PFP_ART, m[1]) ? m[1] : '';
}

/* ---------- WHAT KIND OF PICTURE A STORED VALUE IS § */
function picKind_(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '';
  const c = pfpChoice_(s);
  if (c) return 'basic';
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

/* EACH KIND OF STORED PICTURE: how it is drawn, the sentence that names it, and the art chosen (a basic picture's only). */
const PIC_KINDS = {
  photo: { face: (v, cls, size, o) => `<img class="${cls}" src="${esc(pic(v))}" alt="${esc(o.alt || '')}"${o.eager ? '' : ' loading="lazy"'} decoding="async">`,
    said: () => 'Your photo is your picture.', chosen: () => '' },
  basic: { face: (v, cls, size) => `<span class="${cls} face-pic">${pfpArt_(pfpChoice_(v), size)}</span>`,
    said: v => 'The ' + PFP_ART[pfpChoice_(v)].name.toLowerCase() + ' is your picture.', chosen: v => pfpChoice_(v) },
};
const picKindRow_ = v => (Object.prototype.hasOwnProperty.call(PIC_KINDS, picKind_(v)) ? PIC_KINDS[picKind_(v)] : null);

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
  if (Object.prototype.hasOwnProperty.call(PIC_KINDS, kind)) return PIC_KINDS[kind].face(v, cls, size, o);
  return `<span class="${cls}${o.none ? ' ' + o.none : ''}">${esc(initial(name))}</span>`;
}

/** Ten ticked topics is one level. Whole levels only — a fraction of a level is not a thing you
    can have, and "level 3.5" beside an item unlocking at 4 reads as nearly there when it is not. */
const levelFromXp = xp => Math.floor((Number(xp) || 0) / 10);
