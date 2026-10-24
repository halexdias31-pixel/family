/* @family. — collections.js THREE COLUMNS THAT ARE ONE IDEA. § */


/* ---------- HOW MANY CARDS TO A PAGE § */
const COLL_PER = 8;


/* ---------- THE SPOTLIT SET § */
let SPOT = new Set();

/* ---------- THE SHEET IS THE AUTHORITY THE MOMENT IT HOLDS A ROW, AND THE FILE IS THE FLOOR § */
function spotNow_() {
  const sheet = (DATA && DATA.spotlight);
  /* AN ARRAY IS THE ANSWER, EMPTY OR NOT. § */
  if (Array.isArray(sheet)) return sheet.map(String);
  const file = (DATA && DATA.spotlightFile) || [];
  return (Array.isArray(file) ? file : []).map(String);
}

function adoptSpotlight_() {
  SPOT = new Set(spotNow_());
}

const isSpot = k => SPOT.has(String(k));

/* Toggled by an admin, and saved one row at a time for the reason `favourite` is: writing a whole
   list back is a read-modify-write, and two admins on two phones would lose one of the two taps. */

/* ---------- ONE PLACE THAT SAYS WHETHER A KEY IS SPOTLIT, AND EVERYTHING THAT SHOWS IT FOLLOWS § */
function spotSet_(key, on) {
  if (on) SPOT.add(key); else SPOT.delete(key);
  try { DATA.spotlight = Array.from(SPOT); } catch (e) {}
  const label = on ? 'Spotlit' : 'Spotlight';
  document.querySelectorAll('[data-do="spot"]').forEach(el => {
    if (el.getAttribute('data-key') === key) tileSet_(el, { label: label, on: on });
  });
  markStale_(TABS.map(t => t.id).filter(id => id !== AT));
  if (AT === 'spotlight') repaint(true);
}

function toggleSpot(k, kind) {
  if (!isAdmin()) return;
  const key = String(k);
  const want = !SPOT.has(key);
  /* AT ONCE, BEFORE THE SERVER HAS SAID ANYTHING. § */
  spotSet_(key, want);

  /* ---------- THIS CALLED `send` WITH TWO ARGUMENTS AND `send` TAKES ONE § */
  send({
    action: 'spotlight',
    name: USER.name,
    /* ---------- AND THE ID, BECAUSE A NAME IS A CELL SOMEBODY CAN EDIT § */
    personId: (USER && USER.personId) || '',
    /* THE KEY GOES ACROSS WHOLE and the kind is passed separately, for the same reason the star does it: § */
    kind: kind || 'item', itemId: key,
    on: want ? 'TRUE' : '',
  }).then(res => {
    /* RECONCILED WITH WHAT THE SHEET NOW HOLDS. § */
    if (res && typeof res.on === 'boolean' && res.on !== want && SPOT.has(key) === want) {
      spotSet_(key, res.on);
    }
  }).catch(err => {
    /* PUT BACK WHAT WAS NOT SAVED, and only if it is still what this tap left — a second tap has
       already said something newer. Leaving the card on (or off) the column after the save failed
       is the lie this was built on. */
    if (SPOT.has(key) === want) spotSet_(key, !want);
    toast(String((err && err.message) || 'That did not save'));
  });
}

on('spot', el => {
  /* THE TILE, THE PAYLOAD'S COPY AND THE COLUMN ARE ALL DONE IN `spotSet_`, so the press and the
     refusal that may undo it go through one function rather than two that could disagree. */
  toggleSpot(el.getAttribute('data-key'), el.getAttribute('data-kind'));
});


/* ---------- A SET, AS CARDS ----------------------------------------------------------------------
   ONE FUNCTION FOR ALL THREE, because the only thing that varies is the test. */
/* ---------- LOOKED UP IN EVERY ITEM, NOT IN THE ONES THE FUNNEL IS OFFERING § */
function collItems_(has) {
  const all = typeof stuffItemsAll_ === 'function' ? stuffItemsAll_()
            : (typeof stuffItems === 'function' ? stuffItems() : []);
  const kept = all.filter(x => x.key && has(x.key));
  /* AND THE BIBLE'S VERSES, WHICH ARE ON NO LIST HERE. § */
  return typeof bibleKept_ === 'function' ? kept.concat(bibleKept_(has)) : kept;
}

/* Empty is a SENTENCE, not a blank screen. A column with nothing in it and nothing to say reads as
   broken — and all three of these are empty for everybody on their first day. */
function collPages_(items, credits, empty) {
  if (!items.length) return [`<div class="card"><p class="note">${empty}</p></div>`];
  const out = [];
  for (let i = 0; i < items.length; i += COLL_PER) {
    out.push(items.slice(i, i + COLL_PER)
      .map(x => stuffCard(x, credits)).join(''));
  }
  return out;
}

const collCredits_ = () => (USER ? (USER.credits || 0) : 0);


/* ---------- SPOTLIGHT, ON THE FEED § */
function spotPages() {
  const items = collItems_(isSpot);
  if (!items.length) return [];
  const credits = collCredits_();
  /* THE WINDOW'S OWN CARDS KEEP THE ADMIN'S SPOTLIGHT TILE, even on a question -- see `SPOT_TILES` in
     tiles.js: Find draws a question the same for everybody, and this is not Find. */
  SPOT_TILES = true;
  try { return keptPages_(items, credits); }
  finally { SPOT_TILES = false; }
}

/* ---------- AND IT IS A COLUMN AGAIN, WHICH IS THE THIRD TIME IT HAS MOVED § */
function spotlightCards_() {
  /* THE PAYLOAD DID NOT COME. `nothingHere` is the one thing that can tell a failed request from an
     empty list, and it draws the reason and a Try again. */
  if (typeof LOAD_FAILED !== 'undefined' && LOAD_FAILED && typeof nothingHere === 'function') {
    return [nothingHere()];
  }
  /* ---------- AND THE THIRD STATE WAS MISSING: NOT ARRIVED YET § */
  if (typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
  const cards = spotPages();
  if (cards.length) return cards;
  /* EMPTY IS THE TITLE ALONE (414), for an admin too: `emptyCard_`, shell.js. */
  return [emptyCard_('Spotlight')];
}


/* ---------- FAVOURITES, ON THE FIND SCREEN § */
function savedPages_() {
  if (!USER) return [];
  const credits = collCredits_();
  /* A QUESTION'S KEPT PARTS TOGETHER, ITS OPENING ONCE -- see `keptPages_`. */
  return keptPages_(collItems_(isFav), credits);
}


/* ---------- BASKET § */
/* ---------- THE BASKET IS A TOOL NOW § */
/* ---------- THE LAMINATE TOGGLE ON ONE BASKET LINE § */
/* ---------- AND ON A PAPER NOBODY HAS COUNTED THE PAGES OF, TOO § */
function lamControl_(c) {
  if (!c || c.kind !== 'print') return '';
  if (typeof laminateOffered_ === 'function' && !laminateOffered_()) return '';
  const p = typeof laminatePrice === 'function' ? laminatePrice(c.pages) : null;
  const cost = p === null ? '' : ' ' + money(p);
  const at = ` data-key="${esc(c.key)}" data-kind="${esc(c.kind)}"`;
  /* ---------- ✓ LAMINATED, NOT "laminated · plain" § */
  return c.laminate
    ? ` <button class="text-action lam-on" data-do="cart-laminate" data-on=""${at}
        title="Laminated — press again for plain paper">✓ laminated${esc(cost)}</button>`
    : ` <button class="text-action" data-do="cart-laminate" data-on="1"${at}
        title="Laminate this copy">+ laminate${esc(cost)}</button>`;
}

/* ---------- ONE LINE OF THE BASKET § */
function cartRow_(c, i, under) {
  return receiptRow({
    /* WIDE, because a basket line is a name and a price and nothing else — see `receiptRow`. § */
    wide: true,
    n: String(i + 1).padStart(3, '0'),
    k: '',
    v: '',
    /* THE ✕ RIDES IN THE VALUE CELL. § */
    /* ---------- THE UPGRADE BELONGS WHERE THE THING IS, NOT WHERE IT WAS BOUGHT § */
    /* ---------- THE NAME, THEN ONE STRIP OF CONTROLS § */
    /* ---------- ONE STRIP ONLY WHEN IT HOLDS SOMETHING, AND A LEADER TO THE PRICE § */
    sel: (() => {
      const lam = lamControl_(c);
      const pp = c.kind === 'print'
        ? `<span class="faint cart-pp">${c.pages ? esc(c.pages) + 'pp' : '? pp'}</span>` : '';
      const drop = `<button class="text-drop" data-do="cart-drop" title="Take this out"
          data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</button>`;
      return `<span class="cart-ln"><span class="cart-nm">${esc(under && c.short ? c.short : c.name)}</span>${
        lam ? '' : pp}<i class="cart-lead" aria-hidden="true"></i>${lam ? '' : drop}</span>${
        lam ? `<span class="cart-ctl">${pp}${lam}${drop}</span>` : ''}`;
    })(),
    mul: '',
    rate: '',
    /* CREDITS AND MONEY IN THE SAME COLUMN, because a line costs one or the other and never both —
       `cart-add` writes `money` for a paper and `cost` for anything bought with credits. */
    /* `tbc`, NOT `free`, FOR A PAPER NOBODY HAS COUNTED — the `cost: 0` fault written down four times in this repository, on the one column that is a price. § */
    total: c.kind === 'print' && cartUnpriced_(c) ? 'tbc'
         : cartMoney_(c) ? money(cartMoney_(c)) : (c.cost ? c.cost + ' cr' : 'free'),
    /* THE ✕ IS THE ROW'S OWN CONTROL, drawn where a receipt's line already ends. */
    end: true,
  });
}

/* ---------- THE BASKET'S LINES, GROUPED BY THE BUNDLE THEY CAME FROM § */
function cartGroups_(lines) {
  const order = [];
  const by = {};
  (lines || []).forEach(c => {
    const f = c && c.kind === 'print' && c.short && c.from ? String(c.from) : '';
    if (!by[f]) { by[f] = []; order.push(f); }
    by[f].push(c);
  });
  return order.map(f => ({ from: f, lines: by[f] }));
}

function cartCard_() {
  /* AN EMPTY BASKET IS ITS TITLE ALONE (414) — the card's own <h3>, nothing under it. */
  if (!CART.length) return '';

  /* ---------- THE BASKET IS A RECEIPT, BECAUSE IT IS ONE § */
  /* A PENCIL SAVED AS "30 cr" BEFORE PENCE WERE READ AS MONEY is re-read first — see `cartUnits_`. */
  if (typeof cartUnits_ === 'function') cartUnits_();
  const credits = collCredits_();
  const due  = CART.reduce((n, c) => n + (c.cost || 0), 0);
  /* THROUGH `cartMoney_`, so the laminate upgrade is in the total the moment it is on the line.
     Summing `c.money` directly was the same figure in two places the day laminating was added. */
  const cash = CART.reduce((n, c) => n + cartMoney_(c), 0);
  /* A PAPER WITH NO PAGE COUNT IS NOT FREE, and the total must not add it in as nought and then
     print a figure that reads as the whole bill. Counted, and said. */
  const tbc = CART.filter(c => c.kind === 'print' && cartUnpriced_(c)).length;
  const short = due > credits;

  /* ---------- A BUNDLE'S PAPERS UNDER ITS TITLE, SAID ONCE § */
  const rows = [];
  let at = 0;
  cartGroups_(CART).forEach(g => {
    if (g.from) {
      rows.push(receiptRow({ wide: true, n: '', k: '', v: '', mul: '', rate: '', total: '',
                             sel: `<span class="cart-from">${esc(g.from)}</span>` }));
    }
    g.lines.forEach(c => rows.push(cartRow_(c, at++, !!g.from)));
  });
  /* AN ARRAY, NOT A STRING. § */

  /* THE WORDING OFF THE SHEET THAT USED TO DUPLICATE THIS. § */
  /* ---------- "SEND ORDER", NOT "PAY" — NOTHING IS PAID HERE § */
  const paper = cash || tbc;
  const foot = `
    <button class="btn rc-do" ${short ? 'disabled' : ''} data-do="cart-send">${
      short ? (due - credits) + ' more credits needed'
            : 'Send order' + (cash ? ' · ' + money(cash) + (tbc ? ' + tbc' : '') : '')}</button>
    <p class="rc-terms">${paper
      ? 'Printing is at cost — paper only — posted or kept for you to collect. Anything marked tbc '
        + 'is priced before you are charged for it.'
      : 'Nothing leaves your basket until you send it.'}</p>`;

  return receiptHtml({
    /* ---------- THE BASKET WORE THE GREEN TERMINAL, AND IT WAS THE LAST ONE WEARING ANYTHING § */
    /* ---------- ONE SHORT LINE, NOT A WRAPPED ONE § */
    lines: [due ? due + ' cr of your ' + credits : '',
            tbc ? tbc + ' tbc' : ''].filter(Boolean),
    rows: rows,
    /* "TO PAY", NOT "COST". The booking card says Cost on a thing nobody has agreed to; this one has
       a Pay button under it and money genuinely about to move. */
    /* "SO FAR" WHEN ANY LINE IS STILL TO BE PRICED, because the figure beside it is then a floor rather than the bill. § */
    totalLabel: paper ? (tbc ? 'So far' : 'Total') : 'Credits',
    total: cash ? money(cash) : tbc ? 'tbc' : String(due),
    foot: foot,
  });
}

/* ---------- AND IT IS REPAINTED WHERE IT STANDS § */
function cartPaint_() {
  document.querySelectorAll('.cart-box').forEach(el => { el.innerHTML = cartCard_(); });
  /* AND THE BUNDLE'S TROLLEY, WHEREVER IT IS DRAWN. § */
  document.querySelectorAll('[data-do="cart-add"][data-kind="bundle"]').forEach(el => {
    const ids = String(el.dataset.ids || '').split(',').filter(Boolean);
    const all = ids.length && ids.every(id => CART.some(c => c.kind === 'print' && String(c.key) === id));
    tileSet_(el, all ? { label: 'In your basket', on: true, off: true }
                     : { label: 'Add bundle to basket', on: false, off: false });
  });
}

/* THE WIDGET'S OWN `start`. It is called when the tools column arrives and on every repaint of it,
   which is the list `toolsStart_` walks. */
function initCart() { cartPaint_(); }

/* `screen('basket')` WAS HERE. A screen with no tab is a screen nobody can reach — and the basket
   has been a page of Find and a page of Booking since. It is a tool now; see the note above. */


/* THE SHOP, A COLUMN OF ITS OWN — AND THE BASKET IS ITS FIRST PAGE § */

/* THREE TO A PAGE, MEASURED. § */
const SHOP_PER = 3;

/* THE GROUPS, IN THE ORDER A FAMILY LOOKS. § */
const SHOP_GROUPS = [['bundle', 'Bundles'], ['game', 'Games'], ['kit', 'Kits'],
                     ['equipment', 'Equipment'], ['stationery', 'Stationery'],
                     ['consumable', 'Consumables'], ['service', 'Made to order']];

function shopFor_(r) {
  if (!r || (typeof isWearable === 'function' ? isWearable(r) : r.kind === 'wearable')) return false;
  /* `false` ONLY. `ON_` on the backend sends a boolean, and a payload older than that sends nothing —
     which must mean "on", or every shop on an old backend would empty itself. */
  if (r.inStock === false) return false;
  const who = String(r.audience || 'all').trim().toLowerCase();
  if (who === 'admin') return typeof isAdmin === 'function' && isAdmin();
  if (who === 'tutor') return typeof isTutorRole === 'function' && isTutorRole();
  return true;
}

/* THE THINGS, GROUPED. § */
function shopGroups_() {
  const rows = (DATA && DATA.shop) || [];
  const byKey = {};
  (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : [])
    .forEach(x => { if (x.kind === 'shop' && x.key && !byKey[x.key]) byKey[x.key] = x; });
  const groups = {};
  rows.forEach(r => {
    if (!shopFor_(r)) return;
    const x = byKey[r.name];
    if (!x || x.wearable) return;
    const k = String(r.kindRaw || 'thing').trim().toLowerCase() || 'thing';
    (groups[k] || (groups[k] = [])).push(x);
  });
  const named = SHOP_GROUPS.map(g => g[0]);
  const order = named.filter(k => groups[k])
    .concat(Object.keys(groups).filter(k => named.indexOf(k) < 0).sort());
  return order.map(k => {
    const g = SHOP_GROUPS.find(p => p[0] === k);
    return { kind: k, label: g ? g[1] : k.charAt(0).toUpperCase() + k.slice(1), items: groups[k] };
  });
}

function shopCards_() {
  /* THE BASKET, AND ANY OTHER WIDGET THE ROSTER FILES UNDER THE SHOP, drawn exactly as Tools draws
     its own — the star on it, the widget in its slot, started by `toolsStart_('shop')`. */
  const wgts = (typeof widgetsOf_ === 'function' ? widgetsOf_('shop') : [])
    .map(w => (typeof widgetOnColumn_ === 'function' ? widgetOnColumn_(w) : w.html));
  /* THE PAYLOAD DID NOT COME — the reason and a Try again, rather than an empty shop that looks open
     and is not. The basket stays above it: it is on this device and did not need the payload. */
  if (typeof LOAD_FAILED !== 'undefined' && LOAD_FAILED && typeof nothingHere === 'function') {
    return wgts.concat([nothingHere()]);
  }
  /* NOT ARRIVED IS NOT EMPTY — the Spotlight column's fault, the same line short: § */
  if (typeof awaiting_ === 'function' && awaiting_()) {
    return wgts.concat([loading_()]);
  }
  const credits = collCredits_();
  const out = wgts.slice();
  shopGroups_().forEach(g => {
    for (let i = 0; i < g.items.length; i += SHOP_PER) {
      /* AN `<h2>` BETWEEN CARDS, NOT INSIDE ONE — the rule `check-dead.js` states and `split_` cuts on. § */
      out.push(`<h2><span>${esc(g.label)}</span><span class="faint">${g.items.length}</span></h2>`
        + g.items.slice(i, i + SHOP_PER).map(x => stuffCard(x, credits)).join(''));
    }
  });
  if (out.length > wgts.length) return out;
  return out.concat([emptyCard_('Shop')]);
}

screen('shop', () => pages('shop', shopCards_()));


/* ---------- THE PAGERS § */
/* NO `PAGER.spotlight`. Spotlight is pages on Posts now, and Posts counts its own. */
/* NO `PAGER.favourites`. Saved is a strip on the Find controls page now, not a column, so it has
   no pages of its own to count — and a pager for a screen nobody registers is the exact thing
   check.js names. */
/* NO `PAGER.basket`. Find counts its own pages. */

