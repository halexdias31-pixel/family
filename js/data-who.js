/* @family. — js/data-who.js THE PAYLOAD AND THE VIEWER (cut from data.js): DATA, USER, `$`, brand and isAdmin, which nearly every file reads; loaded just before data.js. */
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
/* THE BUSINESS'S ONE PICTURE (1040 r10): tab icon, home-screen icon, Web profile and the business's posts all read it here. */
/* A Drive share link is a page, so its picture's own address (as `pic`, posts.js). */
function brandLogo_() {
  const u = String(brand('logo_square', '') || brand('logo_circle', '') || 'icon.png').trim();
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}
/* IS THIS SOMETHING YOU WEAR? § */
const isWearable = x => {
  const k = norm(x && (x.kind || x.kindRaw));
  return k === 'wearable' || k === 'avatar';
};
/* Whether the person signed in is an admin. § */
const isAdmin = () => !!USER && rankAtLeast_('admin');
