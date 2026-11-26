/* @family. — collections.js: Saved and the Basket. */


/* ---------- A SET, AS CARDS ----------------------------------------------------------------------
   ONE FUNCTION FOR ALL THREE, because the only thing that varies is the test. */

const collCredits_ = () => (USER ? (USER.credits || 0) : 0);




/* ---------- BASKET § */
/* ---------- THE BASKET IS A TOOL NOW § */
/* ---------- THE LAMINATE TOGGLE ON ONE BASKET LINE § */
/* ---------- AND ON A PAPER NOBODY HAS COUNTED THE PAGES OF, TOO § */
function lamControl_(c) {
  if (!c || c.kind !== 'print') return '';
  if (typeof laminateOffered_ === 'function' && !laminateOffered_()) return '';
  const p = typeof laminatePrice === 'function' ? laminatePrice(c.pages) : null;
  const cost = p === null ? '' : ' ' + fmtMoney_(p);
  /* ---------- ✓ LAMINATED, NOT "laminated · plain" § */
  /* A FORM'S STEP (rule 8): the form maker's one button, a word, never a raw <button>. */
  return ' ' + tile_({ form: true, kind: 'quiet', cls: 'text-action' + (c.laminate ? ' lam-on' : ''), act: 'cart-laminate',
    label: (c.laminate ? '✓ laminated' : '+ laminate') + cost, data: { on: c.laminate ? '' : '1', key: c.key, kind: c.kind } });
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
        ? `${qtag_(`${c.pages ? esc(c.pages) + 'pp' : '? pp'}`, '', `cart-pp`)}` : '';
      const drop = tile_({ icon: 'close', label: 'Take this out', act: 'cart-drop', cls: 'text-drop', data: { key: c.key, kind: c.kind } });
      /* THROUGH THE ONE CARD MAKER: spans as data, the tag and tiles their own makers' (`inner`). */
      return cardBlocks_([{ type: 'group', tag: 'span', look: 'cart-ln', blocks: [{ type: 'group', tag: 'span', look: 'cart-nm', text: under && c.short ? c.short : c.name }],
        inner: (lam ? '' : pp) + cardBlock_({ type: 'group', tag: 'span', look: 'cart-lead', attrs: { 'aria-hidden': 'true' } }) + (lam ? '' : drop) },
        lam ? { type: 'group', tag: 'span', look: 'cart-ctl', inner: pp + lam + drop } : null]);
    })(),
    mul: '',
    rate: '',
    /* CREDITS AND MONEY IN THE SAME COLUMN, because a line costs one or the other and never both —
       `cart-add` writes `money` for a paper and `cost` for anything bought with credits. */
    /* `tbc`, NOT `free`, FOR A PAPER NOBODY HAS COUNTED — the `cost: 0` fault written down four times in this repository, on the one column that is a price. § */
    total: c.kind === 'print' && cartUnpriced_(c) ? 'tbc'
         : cartMoney_(c) ? fmtMoney_(cartMoney_(c)) : (c.cost ? c.cost + ' cr' : 'free'),
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

  /* ---------- A BUNDLE'S PAPERS UNDER ITS TITLE, SAID ONCE § */
  const rows = [];
  let at = 0;
  cartGroups_(CART).forEach(g => {
    if (g.from) {
      rows.push(receiptRow({ wide: true, n: '', k: '', v: '', mul: '', rate: '', total: '',
                             sel: cardBlock_({ type: 'group', tag: 'span', look: 'cart-from', text: g.from }) }));
    }
    g.lines.forEach(c => rows.push(cartRow_(c, at++, !!g.from)));
  });
  /* AN ARRAY, NOT A STRING. § */

  /* THE WORDING OFF THE SHEET THAT USED TO DUPLICATE THIS. § */
  /* NO "SEND ORDER" (25 Nov): the order went as a message, and Messages went. The basket is a list and its terms. */
  const paper = cash || tbc;
  const foot = paper ? cardBlock_({ type: 'group', tag: 'p', look: 'rc-terms', text: 'Printing is at cost — paper only — posted or kept for you to collect. Anything marked tbc '
        + 'is priced before you are charged for it.' }) : '';

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
    total: cash ? fmtMoney_(cash) : tbc ? 'tbc' : String(due),
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
    tileSet_(el, all ? { label: text_('in-your-basket'), on: true, off: true }
                     : { label: 'Add bundle to basket', on: false, off: false });
  });
}

/* THE WIDGET'S OWN `start`. It is called when the tools column arrives and on every repaint of it,
   which is the list `toolsStart_` walks. */

/* `screen('basket')` WAS HERE. A screen with no tab is a screen nobody can reach — and the basket
   has been a page of Find and a page of Booking since. It is a tool now; see the note above. */


/* THE SHOP, A COLUMN OF ITS OWN — AND THE BASKET IS ITS FIRST PAGE § */

/* THREE TO A PAGE, MEASURED. § */
/* ---------- THE PAGERS § */
/* NO `PAGER.spotlight`. Spotlight is pages on Posts now, and Posts counts its own. */
/* NO `PAGER.favourites`. Saved is a strip on the Find controls page now, not a column, so it has
   no pages of its own to count — and a pager for a screen nobody registers is the exact thing
   check.js names. */
/* NO `PAGER.basket`. Find counts its own pages. */

