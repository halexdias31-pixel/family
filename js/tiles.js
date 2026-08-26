/* ==================================================================================================
   @family. — tiles.js
   THE SHEET IS GONE. Everything it offered is a button on the card itself.

   WHAT WAS WRONG WITH IT. Opening a panel to reach a tick is two taps to do a one-tap thing, and
   the panel then had to repeat the card — the name, the subject, the page count — because a panel
   floating over a list has to say which of the list it is about. So the same six facts were drawn
   twice, in two places that could disagree, and the second copy cost a tap to see and a tap to
   dismiss.

   A DETAIL IS WRITTEN ON THE BUTTON THAT USES IT. "20 pages" is not a fact worth its own row; it
   is the reason the printed copy costs 40p, so it is on the printed-copy button. A number nobody
   acts on does not need to be on the screen at all.

   ONE RULE FOR ADMIN CONTROLS: they are PURPLE. Everywhere, without exception. An admin sees every
   card twice over — once as the app and once as the thing they maintain — and a colour that means
   "only you can see this" is the only way to tell those apart at a glance. Nothing that a client
   can press is ever purple.

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice`, `canPrint`,
   `printRatePence` and `tickRow` from find, `paperRows` and `CART` from resource, and `isSpot`
   from collections. index.html lists the order; the list is the order.
================================================================================================== */


/* ---------- ONE BUTTON --------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written as one function so that the
   difference is a parameter rather than two nearly-identical strings that drift apart — and so
   `target="_blank"` and `rel="noopener"` are in exactly one place. */
function tile_(o) {
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '')
    + (o.dim ? ' is-dim' : '');
  const note = o.note ? `<em class="tile-note">${esc(o.note)}</em>` : '';
  if (o.href) {
    return `<a class="${cls}" href="${esc(o.href)}" target="_blank" rel="noopener"
      >${esc(o.label)}${note}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${o.off ? ' disabled' : ''}
    >${esc(o.label)}${note}</button>`;
}


/* ---------- THE ADMIN PAIR ----------------------------------------------------------------------
   SPOTLIGHT, EDIT, DELETE — the three things only an admin can do to any row, drawn the same way
   on every kind of card so that they are in the same place whatever you are looking at.

   `x.key` rather than the row's id: the spotlight set is keyed on whatever the card is keyed on,
   which for a widget is `w:123` and for a venue is its name. Edit and delete want the resource's
   own id, which is a different thing, and that is why two keys go across. */
function adminTiles_(x, t) {
  if (!isAdmin()) return '';
  const id = t ? (t.id || t.name) : x.key;
  return `<div class="tile-row is-admin">
    ${tile_({ label: isSpot(x.key) ? 'Spotlit' : 'Spotlight', tone: 'admin',
              on: isSpot(x.key), act: 'spot',
              data: { key: x.key, kind: x.kind || 'item' } })}
    ${t ? tile_({ label: 'Edit', tone: 'admin', act: 'topic-edit', data: { key: id } }) : ''}
    ${t ? tile_({ label: t.active ? 'Delete' : 'Restore', tone: 'admin',
                  act: 'topic-delete', data: { key: id, on: t.active ? '' : '1' } }) : ''}
  </div>`;
}


/* ---------- A RESOURCE'S BUTTONS ------------------------------------------------------------------
   IN THE ORDER SOMEBODY REACHES FOR THEM. The ticks first, because on a resource you have already
   opened they are the whole reason you came back to it. Then the two ways to read it. Then paying
   for paper, which is the only one that costs anything and so is the only one that should ever be
   the loudest thing on the card. */
function topicTiles_(x) {
  const t = x.topic;
  if (!t) return adminTiles_(x, null);

  const price = printPrice(t.pages);
  const qs = paperRows(t).filter(r => r.kind !== 'stem').length;
  const inCart = CART.some(c => c.key === (t.id || t.name) && c.kind === 'print');

  const read = [
    /* THE TRANSCRIBED PAPER BEFORE THE PDF. When the questions are in the `questions` tab it is
       the better answer — no download, no reader, and it is the same rows the question cards draw
       from, so a fix to a question fixes it here too. */
    qs ? tile_({ label: 'HTML', note: qs + ' questions', act: 'paper-read',
                 data: { key: t.id || t.name } }) : '',
    t.link ? tile_({ label: 'PDF', href: t.link }) : '',
  ].filter(Boolean).join('');

  /* ---------- THE PRINTED COPY --------------------------------------------------------------------
     THE SUM IS ON THE BUTTON. "20pp × 2p" is checkable and "£0.40" is a figure you either believe
     or you do not — and it is on the control that charges it rather than in a row above, so the
     thing you are agreeing to is written on the thing you press.

     WHY NOT, WHEN NOT. A missing button is indistinguishable from a broken one, and the commonest
     reason is a page count nobody has run yet — which is something you can go and fix rather than
     something you have to wonder about. */
  const print = canPrint(t)
    ? tile_({ label: inCart ? 'In basket' : money(price), tone: 'buy', on: inCart,
              note: t.pages + 'pp × ' + printRatePence() + 'p',
              act: 'cart-add', off: !USER || inCart,
              data: { key: t.id || t.name, kind: 'print' } })
    : tile_({ label: 'No print', dim: true, off: true, act: 'noop',
              note: t.pages ? 'not offered' : 'pages not counted' });

  return `${tickRow(t)}
    <div class="tile-row">${read}${print}</div>
    ${adminTiles_(x, t)}`;
}


/* ---------- A SHOP THING'S BUTTONS ----------------------------------------------------------------
   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — there is nothing to
   post and nothing to collect, so it never goes in a basket — and that is a different gesture from
   everything on this page. It keeps its own sheet until it has a screen of its own. */
function shopTiles_(x) {
  if (x.wearable) return adminTiles_(x, null);
  const inCart = CART.some(c => c.key === x.key && c.kind === 'shop');
  return `<div class="tile-row">
    ${tile_({ label: inCart ? 'In basket' : (x.cost ? x.cost + ' credits' : 'free'),
              tone: 'buy', on: inCart, act: 'cart-add', off: !USER || inCart,
              data: { key: x.key, kind: 'shop' } })}
  </div>${adminTiles_(x, null)}`;
}


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   row, so a spotlight can be put on anything findable rather than only on the two kinds that
   happen to have buttons today. */
function cardTiles_(x) {
  if (x.kind === 'topic') return topicTiles_(x);
  if (x.kind === 'shop') return shopTiles_(x);
  return adminTiles_(x, null);
}

/* A tap on the tile row that is not on a tile. The rows used to sit inside a card whose whole
   surface opened a sheet; the surface no longer does anything, and this exists so that a stray tap
   is explicitly nothing rather than accidentally something later. */
on('noop', () => {});
