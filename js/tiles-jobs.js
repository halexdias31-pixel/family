/* ---------- WHAT YOU CAN DO WITH A SESSION § */
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN § */
function jobTiles_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return '';
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  /* THE ASKED TUTOR, OR AN ADMIN, ANSWERS IN PLACE (488) — Accept, or Decline with an optional line why. */
  const asked = requestAsked_(j);
  const answer = asked && (norm(asked) === norm(USER.name) || (typeof isAdmin === 'function' && isAdmin()))
    ? tile_({ icon: 'tick', label: 'Accept request', tone: 'buy', note: 'it becomes a booking',
              act: 'job-request-answer', data: { id: id, yes: '1' } })
      + tile_({ icon: 'close', label: 'Decline request', note: 'a line why, if you like',
                act: 'job-request-answer', data: { id: id, yes: '' } })
    : '';
  /* A CHILD JOINS AND PAYS THROUGH A PARENT (398) — no join tile, no Pay tile, no figure. */
  if (!mine) return answer + jobApplyTile_(j, id) + (answer || childView_() ? '' : joinTile_(j, id));
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return jobChooseTiles_(j, id) + `
    ${owed && !childView_() ? tile_({ icon: 'pound', label: 'Pay and confirm', tone: 'buy',
                     note: typeof money_ === 'function' ? money_(j.price || 0) : '',
                     act: 'job-pay', data: { id: id } }) : ''}
    ${tile_({ icon: 'undo', label: 'Withdraw from this',
              act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } })}
  `;
}

/* NO PREFERENCE (decision): tutors apply, the client picks. Apply is for an approved tutor not yet on it, while nobody is confirmed. */
const jobOpenToTutors_ = j => !!(j && j.stealable) && !(j.tutorSlots || []).some(sl => /^confirmed$/i.test(String(sl.status || '')));
function jobApplyTile_(j, id) {
  if (!USER || !jobOpenToTutors_(j) || !(typeof isTutorRole === 'function' && isTutorRole())) return '';
  if ((j.tutorSlots || []).some(sl => norm(sl.name) === norm(USER.name))) return '';
  return tile_({ icon: 'join', label: 'Apply to teach', tone: 'buy', note: 'the family picks', act: 'job-apply', data: { id: id } });
}
/* THE CLIENT'S PICK: one tile per tutor who applied. */
function jobChooseTiles_(j, id) {
  if (!jobOpenToTutors_(j) || childView_()) return '';
  return (j.tutorSlots || []).filter(sl => sl && sl.name && /^applied$/i.test(String(sl.status || '')))
    .map(sl => tile_({ icon: 'tick', label: 'Choose ' + displayName_(sl.name), tone: 'buy', note: 'they teach it',
                       act: 'job-choose', data: { id: id, tutor: String(sl.name) } })).join('');
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
function joinTile_(j, id) {
  if (!j || !j.canAsk || !id) return '';
  return norm(j.kind) === 'waitlist'
    ? tile_({ icon: 'join', label: 'Take a seat', tone: 'buy', note: 'charged once it fills',
              act: 'job-take-seat', data: { id: id } })
    : tile_({ icon: 'join', label: 'Ask to join', tone: 'buy', note: 'the family say yes first',
              act: 'job-join', data: { id: id } });
}

/* A tap on a tile row that is not on a row. § */
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES § */
function jobAdminTiles_(j, stage, accepted) {
  const id = String((j && (j.id || j.jobId)) || '');
  if (!id) return '';
  const rows = [];
  if (stage === 'application' || stage === 'waitlist') {
    rows.push(tile_({ icon: 'tick', label: 'Accept', tone: 'buy', note: 'settles the terms',
                      act: 'job-answer', data: { id: id, yes: '1' } }));
    rows.push(tile_({ icon: 'close', label: 'Decline', note: 'turns it down',
                      act: 'job-answer', data: { id: id, yes: '' } }));
  }
  rows.push(tile_({ icon: 'bin', label: 'Delete', tone: 'danger', note: 'ends it for everybody',
                    act: 'job-delete', data: { id: id } }));
  /* TILES, NOT A ROW. This returned its own `.tile-row`, and `jobPage_` wrapped it in another beside the client's two — a row inside a row. § */
  return rows.join('');
}

/* ---------- WHAT YOU CAN DO ABOUT A POST § */
function postTiles_(p) {
  const id = String((p && p.id) || '');
  if (!id) return '';
  const admin = typeof isAdmin === 'function' && isAdmin();
  const rows = [tile_({ icon: 'share', label: 'Share', note: 'as a picture', act: 'share', data: { id: id } })];
  /* WAITING (413): the admin decides on the post itself; its author may still change the words or take it back. */
  if (p.waiting && admin) {
    rows.push(tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it',
                      act: 'post-approve', data: { id: id, on: '1' } }));
    rows.push(tile_({ icon: 'close', label: 'Decline', note: 'stays hidden',
                      act: 'post-approve', data: { id: id, on: '' } }));
  } else if (p.refused && admin) {
    /* ALREADY DECLINED: only the way back; declining again is a control that does nothing. */
    rows.push(tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it',
                      act: 'post-approve', data: { id: id, on: '1' } }));
  }
  if (p.waiting && p.mine && !admin) rows.push(tile_({ icon: 'edit', label: 'Edit', note: 'until it is approved', act: 'post-edit', data: { id: id } }));
  /* UP IS FINAL (413): nobody changes the words; an admin still pins it or fixes its date. */
  if (admin && !p.waiting && !p.refused) rows.push(tile_({ icon: 'edit', label: 'Pin or date', act: 'post-edit', data: { id: id } }));
  /* YOUR OWN TOO (720): every thing carries the tile (486), and the owner's posts are his own. */
  if (typeof suggestTile_ === 'function') rows.push(suggestTile_('post', id, String(p.title || p.body || '').slice(0, 80)));
  if (admin || p.mine) rows.push(tile_({ icon: 'bin', label: 'Delete', tone: 'danger', note: 'takes it off the feed', act: 'post-delete', data: { id: id } }));
  return tileRow_(rows.join(''));
}

on('noop', () => {});

