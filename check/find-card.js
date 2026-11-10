/* @family. — check/find-card.js A TOOL OR GAME IS A FIND CARD (790): the in-page steps that bring one widget's card to the glass, for the browser checks that once went to the Tools or Games column. */
'use strict';

/* IN THE PAGE (pass to page.evaluate): Find › Tools (or Games) as the first answer, then that widget's page. Returns the page index, -1 if it is not listed. */
function openWidgetCard(arg) {
  const { id, finder } = typeof arg === 'object' && arg ? arg : { id: arg };
  const fid = finder || 'stuff';
  const w = (typeof allWidgets === 'function' ? allWidgets() : []).find(x => String(x.id) === String(id));
  const group = 'Tools';
  finderSet_(FINDERS[fid], { filters: [{ field: 'forLabel', value: group }], q: '' });
  if (AT !== fid) go(fid, false, true);
  const at = inFinder_(FINDERS[fid], () => stuffPages_().findIndex(pg => pg.x && pg.x.widget && String(pg.x.widget.id) === String(id)));
  if (at < 0) return -1;
  const n = inFinder_(FINDERS[fid], () => stuffFirstResult_()) + at;
  goPage(fid, n, true);
  return n;
}

/* The CSS scope of a widget's slot once its card is open: `#s-stuff #wgt-<id>`. */
const slot = (id, finder) => `#s-${finder || 'stuff'} #wgt-${id}`;

/* FOR A CHECK WHOSE OWN page.evaluate bodies open the card: `window.__openWidgetCard(id)` on every page of that context. */
const installOpen = target => target.addInitScript('window.__openWidgetCard = ' + openWidgetCard.toString() + ';');

module.exports = { openWidgetCard, installOpen, slot };
