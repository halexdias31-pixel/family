/* ==================================================================================================
   @family. — tiles.js
   THE SHEET IS GONE. Everything it offered is a row on the card itself.

   WHAT WAS WRONG WITH IT. Opening a panel to reach a tick is two taps to do a one-tap thing, and
   the panel then had to repeat the card — the name, the subject, the page count — because a panel
   floating over a list has to say which of the list it is about. So the same six facts were drawn
   twice, in two places that could disagree, and the second copy cost a tap to see and a tap to
   dismiss. A screen whose first job is to identify itself is a screen that did not need to exist.

   ---------- ONE ACTION, ONE LINE ----------------------------------------------------------------
   FULL WIDTH, STACKED, IN WORDS. This was a grid of three symbols across, and a grid is a promise
   that everything in it is the same size — a promise you then have to keep with flex arithmetic,
   with placeholders standing in for actions that do not exist, and with glyphs chosen because they
   are one character wide rather than because they mean anything.

   A stack keeps that promise for nothing. Every row is the width of the card, so uniformity is not
   maintained, it is simply unavoidable. And once nothing is competing for horizontal room the label
   can be the word — PDF, HTML, Paper — which needs no long-press text to explain it and no guess
   about whether a framed block reads as a document.

   WHICH ALSO REMOVES THE PLACEHOLDERS. The dim dead slots existed to hold a column position steady
   so that a thumb would find the paper copy in the same place on every card. A stacked row has no
   column to hold, so an action that is not offered is simply not drawn — and a card with two rows
   sits beside one with three without either looking wrong.

   THE DETAIL SITS ON THE RIGHT OF ITS OWN LINE — the same key-on-the-left, value-on-the-right shape
   every other row on this card already uses. "£0.40" belongs beside the thing that charges it.

   ---------- ONE RULE FOR ADMIN CONTROLS: THEY ARE SILVER ----------------------------------------
   Everywhere, without exception. An admin sees every card twice over — once as the app and once as
   the thing they maintain — and a colour that means "only you can see this" is the only way to tell
   those apart at a glance. Nothing a client can press is ever silver.

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice`, `canPrint` and
   `tickRow` from find, `paperRows` and `CART` from resource, and `isSpot` from collections.
   index.html lists them; the list is the order.
================================================================================================== */


/* ---------- ONE ROW ------------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written once so the difference is a
   parameter rather than two nearly-identical strings that drift apart — and so `target` and
   `rel="noopener"` exist in exactly one place.

   NO `title`, NO `aria-label`. The label is the word, so there is nothing a hidden one could add
   that the visible one does not already say. Both existed to rescue a glyph, and the glyphs are
   gone. A label that has to be explained twice was the wrong label. */
function tile_(o) {
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '');
  const body = `<span class="tile-k">${esc(o.label)}</span>`
    + (o.note ? `<span class="tile-v">${esc(o.note)}</span>` : '');

  if (o.href) {
    return `<a class="${cls}" href="${esc(o.href)}" target="_blank" rel="noopener">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${o.off ? ' disabled' : ''}
    >${body}</button>`;
}


/* ---------- THE ADMIN ROWS -----------------------------------------------------------------------
   SPOTLIGHT, EDIT, DELETE — the three things only an admin can do to a row, in the same order on
   every kind of card, stacked like everything else.

   `x.key` rather than the row's id: the spotlight set is keyed on whatever the CARD is keyed on,
   which for a widget is `w:123` and for a venue is its name. Edit and delete want the resource's
   own id, which is a different thing — so two keys go across. */
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


/* ---------- A RESOURCE'S WAYS IN -------------------------------------------------------------------
   PDF, HTML, PAPER — in that order, and only the ones that exist.

   THE ORDER IS EFFORT ASCENDING. The PDF is what most people came for and what most rows actually
   have; the transcription is better where it exists and exists on few; paper costs money and is
   last, which is where the only control that spends anything belongs.

   WHEN NOTHING IS OFFERED AT ALL, one line says so. That is not a placeholder — it is the answer to
   the question the card just raised by having no rows under it, and a page count nobody has run is
   something you can go and fix rather than something you have to wonder about. */
function topicTiles_(x) {
  const t = x.topic;
  if (!t) return adminTiles_(x, null);

  const price = printPrice(t.pages);
  const qs = paperRows(t).filter(r => r.kind !== 'stem').length;
  const inCart = CART.some(c => c.key === (t.id || t.name) && c.kind === 'print');

  const rows = [
    t.link ? tile_({ label: 'PDF', href: t.link }) : '',

    /* THE TRANSCRIBED PAPER. Where the questions are in the `questions` tab this is the better
       answer — no download and no reader — and it is the same rows the question cards draw from,
       so a fix to a question fixes it here too. */
    qs ? tile_({ label: 'HTML', note: qs + ' questions',
                 act: 'paper-read', data: { key: t.id || t.name } }) : '',

    /* THE PAPER COPY. The price sits on the line that charges it, so the thing you are agreeing to
       is written on the thing you press rather than in a row above it. */
    canPrint(t)
      ? tile_({ label: inCart ? 'In your basket' : 'Paper', tone: 'buy', on: inCart,
                note: inCart ? '' : money(price) + ' · ' + t.pages + 'pp',
                act: 'cart-add', off: !USER || inCart,
                data: { key: t.id || t.name, kind: 'print' } })
      : '',
  ].filter(Boolean);

  const none = rows.length ? '' : `<p class="tile-none">${
    t.pages ? 'Nothing to open on this one yet.'
            : 'Not priced and no link — nobody has counted the pages.'}</p>`;

  return `${tickRow(t)}
    ${rows.length ? `<div class="tile-row">${rows.join('')}</div>` : none}
    ${adminTiles_(x, t)}`;
}


/* ---------- A SHOP THING ---------------------------------------------------------------------------
   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — nothing to post and
   nothing to collect, so it never enters a basket — and that is a different gesture from anything
   on this row. It keeps its sheet until it has a screen of its own. */
function shopTiles_(x) {
  if (x.wearable) return adminTiles_(x, null);
  const inCart = CART.some(c => c.key === x.key && c.kind === 'shop');
  return `<div class="tile-row">
    ${tile_({ label: inCart ? 'In your basket' : 'Add to basket', tone: 'buy', on: inCart,
              note: inCart ? '' : (x.cost ? x.cost + ' credits' : 'free'),
              act: 'cart-add', off: !USER || inCart,
              data: { key: x.key, kind: 'shop' } })}
  </div>${adminTiles_(x, null)}`;
}


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   rows, so a spotlight can go on anything findable rather than only on the two kinds that happen to
   have actions today. */
function cardTiles_(x) {
  if (x.kind === 'topic') return topicTiles_(x);
  if (x.kind === 'shop') return shopTiles_(x);
  return adminTiles_(x, null);
}

/* A tap on a tile row that is not on a row. The rows used to sit inside a card whose whole surface
   opened a sheet; the surface no longer does anything, and this exists so a stray tap is explicitly
   nothing rather than accidentally something later. */
on('noop', () => {});
