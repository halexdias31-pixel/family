/* ---------- WHAT YOU CAN DO WITH A SESSION § */
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN § */
function jobOpts_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return null;
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  /* A CHILD JOINS AND PAYS THROUGH A PARENT (398) — no join tile, no Pay tile, no figure. */
  /* NO ACCEPT/DECLINE (owner, 27 Nov): a tutor's availability is their yes in advance, so nobody answers, applies or picks. */
  if (!mine) return [!may_('prices') ? null : joinOpts_(j, id)];
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return [
    owed && !!may_('prices') ? { icon: 'pound', label: text_('pay-and-confirm'), tone: 'buy',
      note: typeof fmtMoney_ === 'function' ? fmtMoney_(j.price || 0) : '', act: 'job-pay', data: { id: id } } : null,
    { icon: 'undo', label: text_('withdraw-from-this'), act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } }];
}

/* WHERE A BOOKING STANDS: no request waits on a tutor any more (owner, 27 Nov), so nothing to say. */
function requestSaid_() { return ''; }

/* ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT § */
function joinOpts_(j, id) {
  if (!j || !j.canAsk || !id) return null;
  return norm(j.kind) === 'waitlist'
    ? { icon: 'join', label: text_('take-a-seat'), tone: 'buy', note: 'charged once it fills',
              act: 'job-take-seat', data: { id: id } }
    : ({ icon: 'join', label: text_('ask-to-join'), tone: 'buy', note: 'the family say yes first',
              act: 'job-join', data: { id: id } });
}

/* A tap on a tile row that is not on a row. § */
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES § */
function jobAdminOpts_(j, stage, accepted) {
  const id = String((j && (j.id || j.jobId)) || '');
  if (!id) return null;
  /* TILES, NOT A ROW: the receipt's foot (`jobPage_`) is the one row they go in. */
  return [{ icon: 'bin', label: 'Delete', tone: 'danger', note: 'ends it for everybody', act: 'job-delete', data: { id: id } }];
}


on('noop', () => {});

