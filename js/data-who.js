/* @family. — js/data-who.js THE PAYLOAD AND THE VIEWER (cut from data.js): DATA, USER, `$`, brand and may_, which nearly every file reads; loaded just before data.js. */
let DATA = {};
let USER = null;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch { /* a bad stored user reads as signed out */ }
/* ---------- THE SMALLEST HELPERS ---------------------------------------------------------------- */
/* ---------- AND WHEN ONE ID IS ON THE PAGE TWICE, THE COPY ON THE SCREEN IN FRONT § */
/* ---------- AND WHEN THE SCREEN IN FRONT HAS NO COPY, THE COPY ITS WIDGET WAS STARTED ON § */
const WIDGET_HOME = {};
const $ = id => {
  const el = document.getElementById(id);
  if (!el || typeof AT === 'undefined' || !AT) return el;
  const scr = document.getElementById('s-' + AT);
  if (!scr || scr.contains(el)) return el;
  try {
    const mine = scr.querySelector('#' + CSS.escape(id));
    if (mine) return mine;
    const slot = el.closest && el.closest('.widget-slot');
    const home = slot && WIDGET_HOME[slot.id];
    const host = home && home !== AT && document.getElementById('s-' + home);
    if (!host || host.contains(el)) return el;
    return host.querySelector('#' + CSS.escape(id)) || el;
  } catch { return el; }
};
/* The letter to put in a circle when there is no picture. The first LETTER, not the first
   character — punctuation is not an initial, and "@family." was giving "@", which sat next to the
   name and read as @@family. */
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();
/* Anything from the branding tab, by name, with a fallback. Never throws on a key that has not
   been filled in — the whole point of that tab is that most of it is empty most of the time. */
/* A CONTACT DETAIL NEVER LIVES IN THE PUBLIC REPO: a blank brand key falls back to the private policy values the backend sends (phone, email). */
const brand = (k, or) => ((DATA.brand || {})[k] || (DATA.policy || {})[k] || or || '');
/* ---------- WHO ARE YOU (who-1): one person, one permission role, ONE QUESTION ---------- */
/* Every "may they" asks `may_`; the backend's `whoMay_` (people.gs) answers the same fixed words by the shared `mayWord_`. Signed out = a guest, a person with no roles. */
const roleFor_ = (u = USER) => (!u ? ROLES_.guest.tier : rankTier_(rank_(u)));
/* The fixed words (`admin`, `owner`, `prices` never a child (398), `staff`, `signedIn`, `grownUp`) are settings.json `roles.may`; anything else a permissions.json action row. */
const may_ = (what, u = USER) => {
  /* A locked card's stand-in (`lockedAs_`) is not who is looking: money is the REAL viewer's call, so a child never sees a price box. */
  if (what === 'prices' && u && u.lockedPreview) return may_('prices', u.realViewer);
  /* THE FIXED WORDS ARE settings.json `roles.may`, by the shared `mayWord_`; the owner (18 Nov) is the admin the backend marks `owner`. */
  const r = roleFor_(u), fixed = mayWord_(what, r, u ? rank_(u) : '', !!(u && u.owner));
  if (fixed !== undefined) return fixed;
  return typeof can_ === 'function' ? can_(r, 'action', what) : r === 'admin';
};
/* WHOSE SETTINGS (the admin's lens): every settings card reads `whose_()`, never USER, so one path draws anybody's. */
/* LENS is the person an admin picked in Find › Settings (`lensCard_`, find-doors.js); nobody else can set it, and USER stays the asker. */
let LENS = null;
const whose_ = () => (LENS && may_('admin') ? LENS : USER);
const lensOn_ = () => !!USER && whose_() !== USER;
const whoseAtLeast_ = want => rankAtLeast_(want, whose_());
