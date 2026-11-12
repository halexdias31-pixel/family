/* ---------- WHAT YOU CAN DO WITH A SESSION § */
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN § */
function jobOpts_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return null;
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  /* THE ASKED TUTOR, OR AN ADMIN, ANSWERS IN PLACE (488) — Accept, or Decline with an optional line why. */
  const asked = requestAsked_(j);
  const answer = asked && (norm(asked) === norm(USER.name) || (typeof isAdmin === 'function' && isAdmin()))
    ? [{ icon: 'tick', label: 'Accept request', tone: 'buy', note: 'it becomes a booking', act: 'job-request-answer', data: { id: id, yes: '1' } },
      { icon: 'close', label: 'Decline request', note: 'a line why, if you like', act: 'job-request-answer', data: { id: id, yes: '' } }]
    : null;
  /* A CHILD JOINS AND PAYS THROUGH A PARENT (398) — no join tile, no Pay tile, no figure. */
  if (!mine) return [answer, jobApplyOpts_(j, id), answer || childView_() ? null : joinOpts_(j, id)];
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return [jobChooseOpts_(j, id),
    owed && !childView_() ? { icon: 'pound', label: 'Pay and confirm', tone: 'buy',
      note: typeof money_ === 'function' ? money_(j.price || 0) : '', act: 'job-pay', data: { id: id } } : null,
    { icon: 'undo', label: 'Withdraw from this', act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } }];
}

/* NO PREFERENCE (decision): tutors apply, the client picks. Apply is for an approved tutor not yet on it, while nobody is confirmed. */
const jobOpenToTutors_ = j => !!(j && j.stealable) && !(j.tutorSlots || []).some(sl => /^confirmed$/i.test(String(sl.status || '')));
function jobApplyOpts_(j, id) {
  if (!USER || !jobOpenToTutors_(j) || !(typeof isTutorRole === 'function' && isTutorRole())) return null;
  if ((j.tutorSlots || []).some(sl => norm(sl.name) === norm(USER.name))) return null;
  return ({ icon: 'join', label: 'Apply to teach', tone: 'buy', note: 'the family picks', act: 'job-apply', data: { id: id } });
}
/* THE CLIENT'S PICK: one tile per tutor who applied. */
function jobChooseOpts_(j, id) {
  if (!jobOpenToTutors_(j) || childView_()) return null;
  return (j.tutorSlots || []).filter(sl => sl && sl.name && /^applied$/i.test(String(sl.status || '')))
    .map(sl => ({ icon: 'tick', label: 'Choose ' + displayName_(sl.name), tone: 'buy', note: 'they teach it',
                       act: 'job-choose', data: { id: id, tutor: String(sl.name) } }));
}

/* WHICH TUTOR A REQUEST IS WAITING ON (488): a named tutor not yet Confirmed on a job not open to others. */
function requestAsked_(j) {
  if (!j || j.stealable) return '';
  const t = (j.tutorSlots || []).find(sl => /^applied$/i.test(String(sl.status || '')));
  return t ? String(t.name || '') : '';
}

/* WHERE A REQUEST STANDS, IN ONE LINE BOTH SIDES READ (488): waiting, accepted, or declined and why. */
function requestSaid_(j) {
  if (!j) return '';
  const asked = requestAsked_(j);
  if (asked) return 'Waiting for ' + asked + ' to accept or decline.';
  const evs = j.events || [];
  const last = evs.filter(e => e.role === 'tutor' && (e.action === 'Decline' || e.action === 'Accept')).pop();
  if (!last) return '';
  if (last.action === 'Decline' && norm(last.target) === norm(last.actor) && !(j.tutorSlots || []).length) {
    return 'Declined by ' + last.actor + (last.message && last.message !== 'declined the request' ? ': \u201c' + last.message + '\u201d' : '.');
  }
  if (last.action === 'Accept' && /^accepted the request/.test(String(last.message || ''))) {
    return 'Accepted by ' + last.actor + '.';
  }
  return '';
}

/* ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT § */
function joinOpts_(j, id) {
  if (!j || !j.canAsk || !id) return null;
  return norm(j.kind) === 'waitlist'
    ? { icon: 'join', label: 'Take a seat', tone: 'buy', note: 'charged once it fills',
              act: 'job-take-seat', data: { id: id } }
    : ({ icon: 'join', label: 'Ask to join', tone: 'buy', note: 'the family say yes first',
              act: 'job-join', data: { id: id } });
}

/* A tap on a tile row that is not on a row. § */
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES § */
function jobAdminOpts_(j, stage, accepted) {
  const id = String((j && (j.id || j.jobId)) || '');
  if (!id) return null;
  const ask = stage === 'application' || stage === 'waitlist';
  /* TILES, NOT A ROW: the receipt's foot (`jobPage_`) is the one row they go in. */
  return [ask ? { icon: 'tick', label: 'Accept', tone: 'buy', note: 'settles the terms', act: 'job-answer', data: { id: id, yes: '1' } } : null,
    ask ? { icon: 'close', label: 'Decline', note: 'turns it down', act: 'job-answer', data: { id: id, yes: '' } } : null,
    { icon: 'bin', label: 'Delete', tone: 'danger', note: 'ends it for everybody', act: 'job-delete', data: { id: id } }];
}

/* ---------- WHAT YOU CAN DO ABOUT A POST § */
function postOpts_(p) {
  const id = String((p && p.id) || '');
  if (!id) return null;
  const admin = typeof isAdmin === 'function' && isAdmin();
  const approve = { icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it', act: 'post-approve', data: { id: id, on: '1' } };
  return [{ icon: 'share', label: 'Share', note: 'as a picture', act: 'share', data: { id: id } },
    /* WAITING (413): the admin decides on the post itself; ALREADY DECLINED: only the way back. */
    (p.waiting || p.refused) && admin ? approve : null,
    p.waiting && admin ? { icon: 'close', label: 'Decline', note: 'stays hidden', act: 'post-approve', data: { id: id, on: '' } } : null,
    p.waiting && p.mine && !admin ? { icon: 'edit', label: 'Edit', note: 'until it is approved', act: 'post-edit', data: { id: id } } : null,
    /* UP IS FINAL (413): nobody changes the words; an admin still pins it or fixes its date. */
    admin && !p.waiting && !p.refused ? { icon: 'edit', label: 'Pin or date', act: 'post-edit', data: { id: id } } : null];
}
/* THE POST'S ROW: its options, the one Suggest tile (your own too, 720), then Delete for an admin or its author. */
function postRow_(p) {
  const id = String((p && p.id) || '');
  if (!id) return '';
  const del = typeof isAdmin === 'function' && isAdmin() || p.mine ? { icon: 'bin', label: 'Delete', tone: 'danger', note: 'takes it off the feed', act: 'post-delete', data: { id: id } } : null;
  return tileRow_(tile_(postOpts_(p)) + (typeof suggestTile_ === 'function' ? suggestTile_('post', id, String(p.title || p.body || '').slice(0, 80)) : '') + tile_(del));
}

on('noop', () => {});

