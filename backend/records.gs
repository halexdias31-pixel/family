/* ==================================================================================================
   BUSINESS RECORDS — the business's own paperwork, for an admin and nobody else.

   Insurance, tax, registrations, policies and checks. The phone draws them as pages of the Settings
   column: a fixed list of items, each a caption and its boxes — see `js/records.js`. Each item's
   `record_id` is its slug (`pub_liability`), so a row is found by what it IS rather than by an id
   somebody has to remember, and a page's Save is one batch that fills or updates those rows.

   A POST AND NEVER THE PAYLOAD. `doGet` builds one payload per viewer and caches it for six hours;
   a policy number has no business in a cache, and a read that happens only when an admin opens the
   column is also a read nothing else pays for.

   `saveRecord` and `dropRecord` WENT WITH THE OLD REGISTER. It added rows under invented ids and
   removed them; a form of fixed items does neither, and a handler with no door is the `orderPrints`
   shape. A row they wrote is still in the tab and still listed — the phone just draws the items it
   knows, by slug.
================================================================================================== */
const RECORD_SLUG = /^[a-z][a-z0-9_]{1,39}$/;
const RECORD_PAGE_FIELDS = ['category', 'title', 'provider', 'reference', 'due_on'];
const RECORD_PAGE_MAX = 12;

function recordOut_(r) {
  return {
    id: S(r.record_id), category: S(r.category), title: S(r.title), provider: S(r.provider),
    reference: S(r.reference), due_on: isoDate_(r.due_on), cost: S(r.cost), link: S(r.link),
    notes: S(r.notes), updated_at: fmtDateTime(r.updated_at),
  };
}

/* WHY A PAGE MAY NOT BE SAVED, as a sentence — every one asked before a cell is touched, so a
   refused page has written nothing. */
function recordsPageRefusal_(list) {
  if (!Array.isArray(list) || !list.length) return 'Nothing to save.';
  if (list.length > RECORD_PAGE_MAX) return 'That is more items than one page holds.';
  const seen = {};
  for (let i = 0; i < list.length; i++) {
    const r = list[i] || {};
    if (!RECORD_SLUG.test(S(r.id))) return 'An item on that page has no name this sheet can file it under.';
    if (seen[r.id]) return 'An item appears twice on that page.';
    seen[r.id] = 1;
    if (!S(r.title)) return 'An item on that page has no title.';
    const d = isoRefusal_(r.due_on, 'date for ' + S(r.title));
    if (d) return d;
  }
  return '';
}

function recordsAction_(action, body) {
  const t = read(TAB.records);
  if (!t.sheet) return { error: 'The sheet has no records tab. Run ensureSchema() (open /exec?setup=1) to add it.' };

  if (action === 'listRecords') {
    return { success: true, records: t.rows.filter(r => S(r.title) && TRUE_(r.active)).map(recordOut_) };
  }

  /* saveRecordsPage */
  const list = body.records;
  const no = recordsPageRefusal_(list);
  if (no) return { error: no };
  const out = list.map(raw => {
    const v = {};
    RECORD_PAGE_FIELDS.forEach(f => { v[f] = S(raw[f]); });
    const row = t.rows.find(r => S(r.record_id) === S(raw.id));
    if (row) {
      /* ONLY WHEN SOMETHING MOVED, or `updated_at` is a write on every Save and every Save retires
         the payload for nothing. */
      const moved = RECORD_PAGE_FIELDS.some(f => !sameCell_(row[f], v[f])) || !TRUE_(row.active);
      if (moved) setCells(t, row, Object.assign({}, v, { active: 'TRUE', updated_at: new Date() }));
      return recordOut_(Object.assign({}, row, v));
    }
    /* AN ITEM LEFT EMPTY IS NOT A ROW. The page posts every item on it; the sheet gets a line only
       for the ones somebody filled in. */
    if (!v.provider && !v.reference && !v.due_on) return recordOut_(Object.assign({ record_id: raw.id }, v));
    const fresh = Object.assign({ record_id: S(raw.id) }, v, { active: 'TRUE', updated_at: new Date() });
    addRow(t, fresh);
    return recordOut_(fresh);
  });
  return { success: true, records: out };
}
