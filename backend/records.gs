/* ==================================================================================================
   BUSINESS RECORDS — the business's own paperwork, for an admin and nobody else.

   Insurance, tax, registrations, policies and checks: each is a row with a category, a title, who
   provides it, its reference, the date it runs out or falls due, what it costs, and a link to the
   document itself (a Drive file, normally). The phone draws them as a register sorted by that date,
   with what is overdue or due soon marked — see `js/records.js`.

   A POST AND NEVER THE PAYLOAD. `doGet` builds one payload per viewer and caches it for six hours;
   a policy number has no business in a cache, and a read that happens only when an admin opens the
   tool is also a read nothing else pays for.

   `active` IS SET FALSE RATHER THAN THE ROW DELETED — a removed record is one you may need to show
   somebody afterwards, which is the argument `messages` makes for `flagged`.
================================================================================================== */
const RECORD_FIELDS = ['category', 'title', 'provider', 'reference', 'due_on', 'cost', 'link', 'notes'];

function recordOut_(r) {
  return {
    id: S(r.record_id), category: S(r.category), title: S(r.title), provider: S(r.provider),
    reference: S(r.reference), due_on: isoDate_(r.due_on), cost: S(r.cost), link: S(r.link),
    notes: S(r.notes), updated_at: fmtDateTime(r.updated_at),
  };
}

/* WHY A RECORD MAY NOT BE SAVED, as a sentence — beside `isoRefusal_` in shape so something can run it. */
function recordRefusal_(rec) {
  if (!S(rec.title)) return 'Give the record a name — what is it?';
  const d = isoRefusal_(rec.due_on, 'date');
  if (d) return d;
  const link = S(rec.link);
  if (link && !/^https?:\/\//i.test(link)) return 'The link has to be a web address starting https://.';
  return '';
}

function recordsAction_(action, body) {
  const t = read(TAB.records);
  if (!t.sheet) return { error: 'The sheet has no records tab. Run ensureSchema() (open /exec?setup=1) to add it.' };
  const byId = id => t.rows.find(r => S(r.record_id) === S(id));

  if (action === 'listRecords') {
    return { success: true, records: t.rows.filter(r => S(r.title) && TRUE_(r.active)).map(recordOut_) };
  }

  if (action === 'dropRecord') {
    const row = byId(body.id);
    if (!row) return { error: 'No such record.' };
    setCells(t, row, { active: 'FALSE', updated_at: new Date() });
    return { success: true };
  }

  /* saveRecord: a new one when there is no id, otherwise the row it names. Every refusal is asked
     before a cell is touched, so a refused save has written nothing. */
  const rec = {};
  RECORD_FIELDS.forEach(f => { rec[f] = S((body.record || {})[f]); });
  const no = recordRefusal_(rec);
  if (no) return { error: no };
  const values = Object.assign({}, rec, { active: 'TRUE', updated_at: new Date() });
  const id = S((body.record || {}).id);
  if (id) {
    const row = byId(id);
    if (!row) return { error: 'No such record.' };
    setCells(t, row, values);
    return { success: true, record: recordOut_(Object.assign({}, row, values)) };
  }
  const newId = 'BR' + Utilities.getUuid().slice(0, 8);
  addRow(t, Object.assign({ record_id: newId }, values));
  return { success: true, record: recordOut_(Object.assign({ record_id: newId }, values)) };
}
