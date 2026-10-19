/* @family. — resource.js ONE FILE, SPLIT. § */



/* ---------- ONE RESOURCE, AND NO SHEET FOR IT § */

/* ---------- EDITING A RESOURCE WAS HERE, AND A PAPER IS NOT EDITED FROM A PHONE NOW § */

/* A column name as a person would say it. Everything not named here is the column with its
   underscores taken out, which is right far more often than it is wrong — `exam_board` reads
   perfectly well as "exam board". */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', document_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
  /* Inside a group already called "Library card", "library card" and "library pin" say the word
     twice and read as two different cards. The group names the thing; these name the parts. */
  library_card: 'card number', library_pin: 'PIN',
  /* ---------- AND THE TWO EXAMS, IN THE WORDS THEY WERE ASKED FOR IN § */
  exam_small_date: 'small exam', exam_big_date: 'big exam',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');

/* ---------- `on('shop-item')` WAS HERE § */

/* PUTTING SOMETHING ON. § */
on('wear', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  cfg[el.dataset.slot] = el.dataset.id;
  /* SAID BEFORE IT IS TRUE, because it almost always becomes true and the wait is the only part anybody would notice. § */
  const was = { label: el.getAttribute('title') || 'Wear' };
  tileSet_(el, { label: 'Putting it on…', off: true });

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      /* NO SHEET TO CLOSE — this now runs from a row on the card itself. */
      tileSet_(el, { label: 'Wearing it', on: true, off: true });
      toast((d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Wearing it');
      /* ---------- THE ONE PLACE A REDRAW IS STILL RIGHT § */
      repaint();
    })
    .catch(err => {
      /* PUT BACK EXACTLY WHAT WAS THERE. § */
      tileSet_(el, { label: was.label, off: false });
      toast(String(err.message || err));
    });
});

/* ---------- THE BASKET § */
let CART = [];
try { CART = JSON.parse(localStorage.getItem('familyCart') || '[]'); } catch {}
const cartSave = () => { try { localStorage.setItem('familyCart', JSON.stringify(CART)); } catch {} };

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
    if (!c || c.kind !== 'shop' || !(Number(c.cost) > 0) || Number(c.money) > 0) return;
    const src = ((typeof DATA !== 'undefined' && DATA.shop) || []).find(x => norm(x.name) === norm(c.key));
    if (!src || String(src.unit || '').trim() !== 'p') return;
    Object.assign(c, cartPrice_(src));
    moved = true;
  });
  if (moved) cartSave();
}

on('cart-add', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  /* A BUNDLE IS PAPERS, SO IT GOES IN AS PAPERS — see `cartAddBundle_` below. */
  if (el.dataset.kind === 'bundle') { cartAddBundle_(el); return; }
  const key = el.dataset.key;
  const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
  /* Keyed on BOTH, because a printed copy and a shop item can share a name and they are not the
     same line. The old test dropped the second one silently. */
  if (CART.some(c => c.key === key && c.kind === kind)) { toast('Already in your basket'); return; }

  /* ---------- `print` AND `topic` WERE TWO OF THE THREE KINDS, AND BOTH LOOKED A DOCUMENT UP § */
  {
    const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
    if (!src) return;
    CART.push(Object.assign({ key, name: src.name, kind }, cartPrice_(src)));
  }

  cartSave();
  /* ---------- THE SHAPE FILLS, AND NOTHING ELSE MOVES § */
  tileSet_(el, { label: 'In your basket', note: '', on: true, off: true });
  toast('In your basket — ' + CART.length + ' item' + (CART.length === 1 ? '' : 's'));
});

/* ---------- A BUNDLE GOES IN AS ONE LINE PER PAPER, NOT AS ONE LINE § */
function cartAddBundle_(el) {
  const ids = String(el.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const from = String(el.dataset.key || '');
  /* EITHER THE ONE BUNDLE THE FUNNEL OFFERS, OR ONE OF THE SITTINGS `Bundles` LISTS — see find.js. */
  const offered = [].concat(typeof bundleOf_ === 'function' ? bundleOf_() || [] : [],
    typeof bundlesBySitting_ === 'function' && bundlesView_() ? bundlesBySitting_() : []);
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
    if (CART.some(c => c.kind === 'print' && String(c.key) === id)) { had++; return; }
    CART.push({ key: id, kind: 'print', name: paperLabel_(id), short: shortOf[id] || '',
                pages: Number(doc.pages) || 0, cost: 0, from: from });
    added++;
  });
  if (!added && !had) { toast('Nothing in that bundle can be printed'); return; }
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: 'In your basket', note: '', on: true, off: true });
  toast(!added ? 'Already in your basket'
      : added + ' paper' + (added === 1 ? '' : 's') + ' in your basket'
        + (had ? ' — ' + had + ' already there' : ''));
}

/* ---------- AND THE WAY TO IT, FROM THE CARD THAT FILLED IT § */
/* THE SHOP NOW, NOT TOOLS. The basket moved to the Shop column's first page; asked for by the same
   lookup, so the day another widget goes on top of it this still lands on the basket. */
on('cart-open', () => {
  const n = typeof widgetsOf_ === 'function'
    ? widgetsOf_('shop').findIndex(w => String(w.id) === 'cart') : -1;
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
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  /* NO PAGE COUNT TO CHANGE ANY MORE. § */
  if (typeof cartPaint_ === 'function') cartPaint_();
});

/* ---------- `on_openCart` AND `on('open-cart')` WERE HERE § */

/* ---------- SENDING THE ORDER, AS A MESSAGE TO THE OWNER § */
/* WHO IT GOES TO. An admin off the payload — `doGet` sends admins among the tutors, with their `personId` — and a PERSON rather than the brand account where § */
function orderTo_() {
  const me = String((USER && USER.personId) || '');
  const house = norm(brand('name', '@family.'));
  const admins = (DATA.tutors || []).filter(t => t && t.personId && norm(t.role) === 'admin'
    && String(t.personId) !== me);
  return admins.find(t => norm(t.title) !== house) || admins[0] || null;
}

/* ---------- WHAT THE MESSAGE SAYS § */
const ORDER_MAX_CHARS = 2000;
function orderLine_(c, i, full, under) {
  const bits = [];
  if (c.kind === 'print') {
    if (full) {
      const p = cartPrint_(c);
      bits.push(c.pages ? c.pages + ' page' + (c.pages === 1 ? '' : 's') : 'pages not counted yet');
      bits.push(p === null ? 'priced when sent' : money(p));
    }
    if (c.laminate) {
      const lam = laminatePrice(c.pages);
      bits.push('laminated' + (full && lam !== null ? ' (+' + money(lam) + ')' : ''));
    }
  } else if (c.cost) {
    bits.push(c.cost + ' credit' + (c.cost === 1 ? '' : 's'));
  } else if (full && Number(c.money) > 0) {
    bits.push(money(Number(c.money)));
  }
  const name = under && c.short ? c.short : (c.name || c.key);
  /* ---------- A CHEAT SHEET CARRIES ITS PIECES, AND THE MESSAGE LISTS THEM § */
  const parts = Array.isArray(c.parts) && c.parts.length ? '\n   pieces: ' + c.parts.join(', ') : '';
  return (i + 1) + '. ' + String(name) + (bits.length ? ' — ' + bits.join(', ') : '') + parts;
}

/* WHERE IT GOES. The login reply carries `address` and `postcode` for exactly this — the note in `loginReplyFor_` says the basket has to know whether it can § */
function orderWhere_() {
  const u = USER || {};
  const p = u.profile || {};
  const code = String(u.postcode || p.postcode || '').trim();
  const any = code || String(u.address || p.address || '').trim();
  if (!any) return 'Delivery: there is no address on my account, so I will collect it at a session.';
  return 'Delivery: post it to the address on my account' + (code ? ' (' + code + ')' : '')
    + ', or I can collect it at a session — whichever suits.';
}

function orderText_(cart) {
  const lines = (cart || CART).slice();
  const cash = lines.reduce((n, c) => n + cartMoney_(c), 0);
  const tbc = lines.filter(c => c.kind === 'print' && cartUnpriced_(c)).length;
  const credits = lines.reduce((n, c) => n + (c.cost || 0), 0);

  const head = 'An order from my basket, sent from the app — please print and send:';
  const foot = [];
  if (cash || tbc) {
    foot.push('Printing: ' + (cash ? money(cash) : 'nothing priced yet')
      + (tbc ? ' — ' + tbc + ' still to price when sent' : ''));
  }
  if (credits) foot.push('Credits: ' + credits);
  foot.push(orderWhere_());

  /* NUMBERED STRAIGHT THROUGH, not restarted under each title, so "number 7" means one line
     whichever way the owner replies about it. */
  const build = full => {
    const out = [head];
    let at = 0;
    cartGroups_(lines).forEach(g => {
      out.push('');
      if (g.from) out.push(g.from);
      g.lines.forEach(c => out.push(orderLine_(c, at++, full, !!g.from)));
    });
    return out.concat([''], foot).join('\n');
  };
  const long = build(true);
  if (long.length <= ORDER_MAX_CHARS) return long;
  const short = build(false);
  return short.length <= ORDER_MAX_CHARS ? short : '';
}

on('cart-send', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  if (!CART.length) return;
  const to = orderTo_();
  if (!to) {
    toast('There is nobody on the site to send this to yet — message @family. directly');
    return;
  }
  const text = orderText_();
  if (!text) {
    toast('That is too much for one message — send some of it now and the rest after');
    return;
  }
  send_({ action: 'sendMessage', name: USER.name, personId: USER.personId,
          to: to.title, toId: to.personId, body: text },
        { button: el, busy: 'Sending…' })
    .then(() => {
      /* SAID PLAINLY, AND THE BASKET GOES — only here, on a yes. */
      CART = [];
      cartSave();
      if (typeof cartPaint_ === 'function') cartPaint_();
      toast('Order sent to ' + to.title + ' — the reply will be in Messages');
      /* SO THE CONVERSATION IS THERE WHEN THEY LOOK, which is the first thing anybody does after sending something — the `msg-send` handler's own reason. § */
      if (typeof loadMessages === 'function') {
        try { Promise.resolve(loadMessages()).catch(() => {}); } catch (e) {}
      }
    })
    /* `send_` HAS ALREADY SAID THE SERVER'S SENTENCE, and rethrows so a caller could react. This
       one's reaction is to keep the basket, which is doing nothing. */
    .catch(() => {});
});
/* THE WHOLE PAPER, READ FROM THE ROWS THAT ALREADY DRAW ITS QUESTIONS. § */

/* ---------- `paperRows` AND `paperBody_` WERE HERE, AND SO WAS THE ANSWER BOX § */

/* `openPaper_` AND `on('paper-read')` MOVED TO find.js, beside the note explaining why they came back. § */

