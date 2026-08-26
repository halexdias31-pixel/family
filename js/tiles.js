/* ==================================================================================================
   @family. — tiles.js
   THE SHEET IS GONE. Everything it offered is a button on the card itself.

   WHAT WAS WRONG WITH IT. Opening a panel to reach a tick is two taps to do a one-tap thing, and
   the panel then had to repeat the card — the name, the subject, the page count — because a panel
   floating over a list has to say which of the list it is about. So the same six facts were drawn
   twice, in two places that could disagree, and the second copy cost a tap to see and a tap to
   dismiss. A screen whose first job is to identify itself is a screen that did not need to exist.

   ---------- THREE SLOTS, ALWAYS THE SAME THREE --------------------------------------------------
   A RESOURCE CAN BE HAD IN EXACTLY THREE WAYS: read it as a PDF, read it here as HTML, or hold it
   on paper. That is not a list that varies — it is three fixed questions, and every resource
   answers each of them yes or no.

   So all three are ALWAYS DRAWN, in that order, at the same width. A missing one is drawn dim and
   dead rather than left out, because a row of two on one card and three on the next means the
   position of a control changes with what is in it — and a thumb that has learned where `paper` is
   should find `paper` there on every card, not sometimes there and sometimes where `html` was. A
   gap teaches the layout; an absence teaches nothing and costs a glance to re-read.

   ---------- WHY SYMBOLS -------------------------------------------------------------------------
   Three words of different lengths cannot be the same width without padding two of them, and that
   padding is what made the old row look like a mistake. A glyph is one character wide whatever it
   means, so three of them are uniform by construction rather than by arithmetic.

   THE DETAIL GOES UNDERNEATH, on the button that uses it. "20pp x 2p" is the reason the paper copy
   costs 40p, so it lives on the paper button and nowhere else. A number nobody acts on does not
   need to be on the screen at all.

   ---------- ONE RULE FOR ADMIN CONTROLS: THEY ARE SILVER ----------------------------------------
   Everywhere, without exception. An admin sees every card twice over — once as the app and once as
   the thing they maintain — and a colour that means "only you can see this" is the only way to tell
   those apart at a glance. Nothing a client can press is ever silver.

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice`, `canPrint` and
   `tickRow` from find, `paperRows` and `CART` from resource, and `isSpot` from collections.
   index.html lists them; the list is the order.
================================================================================================== */


/* ---------- THE THREE GLYPHS ---------------------------------------------------------------------
   IN ONE PLACE, because a symbol is a guess about what somebody reads without being told, and the
   only way to find out is to change it and look. One line each.

   `</>` IS THE SURE ONE — it has meant "the code of the thing" for twenty years and it is plain
   ASCII, so it renders identically on every phone in the country.

   `▤` IS THE WEAK ONE and worth saying so. There is no glyph anywhere in Unicode that means PDF;
   this is a framed block that reads as "a page" and nothing more. If it does not land, the three
   letters P-D-F are themselves the most recognised symbol in the set, and swapping them in here
   costs one line — the tiles stay uniform because the width comes from the layout, not the label.

   `⛁` IS ALSO THE BASKET COLUMN'S ICON, deliberately. A stack of discs reads as a pile of paper,
   and the mark meaning "your basket" in the navigation should mean "into your basket" here. */
const SYM = { pdf: '▤', html: '</>', paper: '⛁' };


/* ---------- ONE BUTTON ---------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written once so the difference is a
   parameter rather than two nearly-identical strings that drift apart — and so `target` and
   `rel="noopener"` exist in exactly one place.

   `title` AND `aria-label` ARE NOT OPTIONAL HERE. A button whose whole label is a glyph is unusable
   to a screen reader and unguessable on a long press, and the word is known — it simply is not the
   thing being drawn. */
function tile_(o) {
  const cls = 'tile' + (o.sym ? ' is-sym' : '') + (o.tone ? ' is-' + o.tone : '')
    + (o.on ? ' on' : '') + (o.dim ? ' is-dim' : '');
  const say = esc(o.say || o.label);
  const body = `<span class="tile-face">${esc(o.label)}</span>`
    + (o.note ? `<em class="tile-note">${esc(o.note)}</em>` : '');

  if (o.href) {
    return `<a class="${cls}" href="${esc(o.href)}" target="_blank" rel="noopener"
      title="${say}" aria-label="${say}">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${o.off ? ' disabled' : ''}
    title="${say}" aria-label="${say}">${body}</button>`;
}

/* A SLOT NOT AVAILABLE ON THIS ROW. Same glyph, same width, dead — so the row keeps its shape and
   the reason lives in the long-press text rather than in a missing button. */
const gap_ = (sym, why) =>
  tile_({ label: sym, sym: true, say: why, dim: true, off: true, act: 'noop' });


/* ---------- THE ADMIN ROW ------------------------------------------------------------------------
   SPOTLIGHT, EDIT, DELETE — the three things only an admin can do to a row, in the same place on
   every kind of card. WORDS, NOT GLYPHS, and that is the point: these are rare, deliberate and
   destructive, and a symbol you have to be sure about before pressing is a symbol doing the wrong
   job. Uniform width still, so the row reads as a set.

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


/* ---------- A RESOURCE'S THREE WAYS IN -------------------------------------------------------------
   PDF, HTML, PAPER — in that order on every card, whether or not each is offered.

   THE ORDER IS EFFORT ASCENDING. The PDF is what most people came for and what most rows actually
   have; the transcription is better where it exists and exists on few; paper costs money and is
   last, which is also where the only control that spends anything belongs. */
function topicTiles_(x) {
  const t = x.topic;
  if (!t) return adminTiles_(x, null);

  const price = printPrice(t.pages);
  const qs = paperRows(t).filter(r => r.kind !== 'stem').length;
  const inCart = CART.some(c => c.key === (t.id || t.name) && c.kind === 'print');

  const pdf = t.link
    ? tile_({ label: SYM.pdf, sym: true, say: 'Open the PDF', href: t.link })
    : gap_(SYM.pdf, 'No PDF on this one yet');

  /* THE TRANSCRIBED PAPER. Where the questions are in the `questions` tab this is the better
     answer — no download and no reader — and it is the same rows the question cards draw from, so
     a fix to a question fixes it here too. */
  const html = qs
    ? tile_({ label: SYM.html, sym: true, say: 'Read it here', note: qs + ' qs',
              act: 'paper-read', data: { key: t.id || t.name } })
    : gap_(SYM.html, 'Not typed up here');

  /* ---------- THE PAPER COPY ---------------------------------------------------------------------
     THE PRICE IS ON THE BUTTON THAT CHARGES IT, so the thing you are agreeing to is written on the
     thing you press rather than in a row above it.

     WHY NOT, WHEN NOT. A dead button is indistinguishable from a broken one unless it says which,
     and the commonest reason here is a page count nobody has run — something you can go and fix
     rather than something you have to wonder about. It is in the long-press text. */
  const paper = !canPrint(t)
    ? gap_(SYM.paper, t.pages ? 'Not offered as a print' : 'Not priced — pages not counted')
    : tile_({ label: SYM.paper, sym: true, tone: 'buy', on: inCart,
              say: inCart ? 'Already in your basket'
                          : 'Add a paper copy — ' + money(price) + ', ' + t.pages + ' pages',
              note: inCart ? 'in basket' : money(price),
              act: 'cart-add', off: !USER || inCart,
              data: { key: t.id || t.name, kind: 'print' } });

  return `${tickRow(t)}
    <div class="tile-row is-three">${pdf}${html}${paper}</div>
    ${adminTiles_(x, t)}`;
}


/* ---------- A SHOP THING ---------------------------------------------------------------------------
   ONE WAY IN, so one tile, and it is not padded out to three: three slots are the three ways to
   have a RESOURCE, and borrowing that shape for an object with one would be two dead buttons
   meaning nothing.

   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — nothing to post and
   nothing to collect, so it never enters a basket — and that is a different gesture from anything
   on this row. It keeps its sheet until it has a screen of its own. */
function shopTiles_(x) {
  if (x.wearable) return adminTiles_(x, null);
  const inCart = CART.some(c => c.key === x.key && c.kind === 'shop');
  return `<div class="tile-row">
    ${tile_({ label: SYM.paper, sym: true, tone: 'buy', on: inCart,
              say: inCart ? 'Already in your basket' : 'Add to your basket',
              note: inCart ? 'in basket' : (x.cost ? x.cost + ' credits' : 'free'),
              act: 'cart-add', off: !USER || inCart,
              data: { key: x.key, kind: 'shop' } })}
  </div>${adminTiles_(x, null)}`;
}


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   row, so a spotlight can go on anything findable rather than only on the two kinds that happen to
   have buttons today. */
function cardTiles_(x) {
  if (x.kind === 'topic') return topicTiles_(x);
  if (x.kind === 'shop') return shopTiles_(x);
  return adminTiles_(x, null);
}

/* A tap on a tile row that is not on a tile. The rows used to sit inside a card whose whole surface
   opened a sheet; the surface no longer does anything, and this exists so a stray tap is explicitly
   nothing rather than accidentally something later. */
on('noop', () => {});
