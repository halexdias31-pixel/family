/* @family. — resource.js ONE FILE, SPLIT. § */



/* ---------- ONE RESOURCE, AND NO SHEET FOR IT § */


/* A column name as a person would say it. § */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', document_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
  /* Inside a group already called "Library card", "library card" and "library pin" say the word twice and read as two different § */
  library_card: 'card number', library_pin: 'PIN',
  /* ---------- AND THE TWO EXAMS, IN THE WORDS THEY WERE ASKED FOR IN § */
  exam_small_date: 'small exam', exam_big_date: 'big exam',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');


/* ---------- THE BASKET § */
let CART = keep_.json('familyCart', []);
const cartSave = () => { keep_.put('familyCart', JSON.stringify(CART)); };

/* ---------- A SHOP ROW PRICED IN PENCE IS MONEY, NOT CREDITS § */
function cartPrice_(src) {
  const n = Number(src && src.price) || 0;
  return String((src && src.unit) || '').trim() === 'p'
    ? { cost: 0, money: Math.round(n) / 100 }
    : { cost: n, money: 0 };
}
/* AND A LINE SAVED BEFORE THAT, PUT RIGHT WHEN THE SHOP SAYS WHAT IT WAS. § */
function cartUnits_() {
  let moved = false;
  CART.forEach(c => {
    if (!isShop_(c) || !(Number(c.cost) > 0) || Number(c.money) > 0) return;
    const src = ((typeof DATA !== 'undefined' && DATA.shop) || []).find(x => norm(x.name) === norm(c.key));
    if (!src || String(src.unit || '').trim() !== 'p') return;
    Object.assign(c, cartPrice_(src));
    moved = true;
  });
  if (moved) cartSave();
}

/* A KIND THAT GOES IN THE BASKET ITS OWN WAY: a bundle is papers, so it goes in as papers. */
const CART_ADD_OWN = { bundle: el => cartAddBundle_(el) };
on('cart-add', el => {
  if (!USER) { toast(text_('err-sign-in-first')); go('account'); return; }
  /* A BUNDLE IS PAPERS, SO IT GOES IN AS PAPERS — see `cartAddBundle_` below. */
  if (Object.prototype.hasOwnProperty.call(CART_ADD_OWN, el.dataset.kind)) { CART_ADD_OWN[el.dataset.kind](el); return; }
  const key = el.dataset.key;
  const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
  /* Keyed on BOTH, because a printed copy and a shop item can share a name and they are not the same line. § */
  if (CART.some(c => c.key === key && c.kind === kind)) { toast(text_('already-in-your-basket')); return; }

  /* ---------- `print` AND `topic` WERE TWO OF THE THREE KINDS, AND BOTH LOOKED A DOCUMENT UP § */
  {
    const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
    if (!src) return;
    CART.push(Object.assign({ key, name: src.name, kind }, cartPrice_(src)));
  }

  cartSave();
  /* ---------- THE SHAPE FILLS, AND NOTHING ELSE MOVES § */
  tileSet_(el, { label: text_('in-your-basket'), note: '', on: true, off: true });
  toast('In your basket — ' + CART.length + ' ' + plural_(CART.length, 'item'));
});

/* ---------- A BUNDLE GOES IN AS ONE LINE PER PAPER, NOT AS ONE LINE § */
function cartAddBundle_(el) {
  const ids = String(el.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const from = String(el.dataset.key || '');
  /* THE ONE BUNDLE THE FUNNEL OFFERS — see `bundleOf_` in find.js. */
  const offered = [].concat(typeof bundleOf_ === 'function' ? bundleOf_() || [] : []);
  const b = offered.find(x => x && x.ids.join(',') === ids.join(',')) || null;
  const shortOf = {};
  if (b && b.ids.join(',') === ids.join(',')) {
    b.printable.forEach(p => { shortOf[p.id] = p.short || p.label; });
  }
  let added = 0;
  let had = 0;
  ids.forEach(id => {
    const doc = typeof docById_ === 'function' ? docById_(id) : null;
    if (!doc || !canPrint_(doc)) return;
    if (CART.some(c => isPrint_(c) && String(c.key) === id)) { had++; return; }
    CART.push({ key: id, kind: 'print', name: paperLabel_(id), short: shortOf[id] || '',
                pages: Number(doc.pages) || 0, cost: 0, from: from });
    added++;
  });
  if (!added && !had) { toast(text_('nothing-in-that-bundle-can-be')); return; }
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: text_('in-your-basket'), note: '', on: true, off: true });
  toast(!added ? text_('already-in-your-basket')
      : added + ' ' + plural_(added, 'paper') + ' in your basket'
        + (had ? ' — ' + had + ' already there' : ''));
}

/* ---------- AND THE WAY TO IT, FROM THE CARD THAT FILLED IT § */
/* THE SHOP NOW, NOT TOOLS. § */
on('cart-open', () => {
  /* A MERGED BASKET IS A PART OF ITS PAGE (480). */
  const n = typeof widgetPagesOf_ === 'function'
    ? widgetPagesOf_('shop').findIndex(w => (w.parts || [w]).some(x => String(x.id) === 'cart')) : -1;
  go('shop');
  if (n >= 0) goPage('shop', n, true);
});

/* ---------- LAMINATE, OR BACK TO PLAIN § */
on('cart-laminate', el => {
  const line = CART.find(c => c.key === el.dataset.key && c.kind === el.dataset.kind);
  if (!line) return;
  line.laminate = el.dataset.on === '1';
  cartSave();
  /* THE BOX, NOT THE SCREEN. § */
  if (typeof cartPaint_ === 'function') cartPaint_();
  toast(line.laminate ? 'Laminated' : 'Back to plain paper');
});

on('cart-drop', el => {
  if (!sure_(el, 'Take out?')) return;
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  /* NO PAGE COUNT TO CHANGE ANY MORE. § */
  if (typeof cartPaint_ === 'function') cartPaint_();
});


/* THE WHOLE PAPER, READ FROM THE ROWS THAT ALREADY DRAW ITS QUESTIONS. § */


/* `openPaper_` AND `on('paper-read')` MOVED TO find.js, beside the note explaining why they came back. § */

