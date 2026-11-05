function peopleAddPage_(col) {
  if (!peopleMay_()) return '';
  col = PEOPLE_ADD_[col] ? col : 'students';
  const F = PEOPLE_FORM_, plus = addCard_({ act: 'person-add', label: PEOPLE_ADD_[col].say, data: { col } });
  if (F && !F.id && (F.col || 'students') !== col) return plus;
  if (F && !F.id && F.made) {
    return `<div class="card person-made"><h3>${esc(F.made.first)} is on the people tab</h3>
      ${pinSlip_(F.made.first, F.made.handle, F.made.pin)}
      <p class="faint">Write it down or read it to them — the PIN is not shown again.</p>
      ${tile_({ form: true, label: 'Done', act: 'person-cancel', kind: 'quiet' })}</div>`;
  }
  if (F && !F.id) return personFormHtml_(F);
  return plus;
}
/* ---------- FIND BY HANDLE, THE FIRST THING ON EVERY PEOPLE COLUMN (442, 770) ---------- */
/* One search state per column (770: "add this search widget to the column to the right of it"), so typing on one card never
   repaints another's results. `q` typed; `child` the card `findChild` answered for `asked` (Students only). */
const PSEARCH_ALL_ = {};
const psState_ = col => PSEARCH_ALL_[col] || (PSEARCH_ALL_[col] = { q: '', asked: '', child: null, busy: false });
/* THE OLD NAME, Students' state, for anything that still reads it. */
const PSEARCH_ = psState_('students');
const psFold_ = v => String(v || '').trim().replace(/^@/, '').toLowerCase();
/* EVERY CARD THE COLUMN ALREADY SHOWS THIS PERSON — public, so a prefix may find them. Never a child's. */
function psPublic_() {
  const pool = [].concat(DATA.tutors || [], (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone)) ? DATA.everyone : [],
    Array.isArray(DATA.family) ? DATA.family : []);
  const seen = {};
  return pool.filter(p => p && p.handle && p.title && !seen[psFold_(p.handle)] && (seen[psFold_(p.handle)] = 1));
}
function psCard_(who, tiles) {
  const first = String(nameBesideHandle_(who.title, who.handle) || who.title || '').trim();
  return `<div class="ps-hit">
    ${personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: first, personId: who.personId },
                  { cls: 'kid-face', none: 'prof-none', size: 36 })}
    <p class="kid-who"><b>${esc(first)}</b><span class="prof-handle">@${esc(who.handle)}</span>${who.role ? `<span class="faint ps-role">${esc(who.role)}</span>` : ''}</p>
    ${tiles ? `<div class="tile-row">${tiles}</div>` : ''}
  </div>`;
}
/* WHO MAY LOOK UP A CHILD — Client and up (400); the server asks the same. Only on Students: the lookup's one use is Add as my child. */
const psMayChild_ = () => typeof rankAtLeast_ === 'function' && rankAtLeast_('client');
const psChildCol_ = col => isStudentsCol_(col) && psMayChild_();
function psResults_(col) {
  const S = psState_(col || 'students'), q = psFold_(S.q);
  if (!q) return '';
  const pub = psPublic_().filter(p => psFold_(p.handle).indexOf(q) === 0).slice(0, 8);
  const out = pub.map(p => psCard_(p, p.personId && typeof tile_ === 'function' ? tile_({ icon: 'chat', label: 'Message',
    note: 'a note to them', act: 'msg-open', data: { to: p.title, id: p.personId } }) : ''));
  const exact = S.asked && S.asked === q;
  if (S.busy) out.push(loading_());
  else if (exact && S.child) {
    const c = S.child, linked = kidsLinked_().some(f => String(f.personId) === String(c.personId));
    out.push(psCard_({ title: c.first, handle: c.handle, avatar: c.avatar, personId: c.personId, role: 'Student' },
      linked ? '' : tile_({ icon: 'join', label: 'Add as my child', note: 'they say yes first', act: 'ps-add-child',
                            data: { handle: c.handle } })));
  }
  if (!out.length) out.push(`<p class="faint ps-none">${exact ? 'Nobody has that handle.' : 'Nobody’s handle starts with that.'}</p>`);
  return out.join('');
}
/* ONE SEARCH BAR AND NOTHING ELSE (469, 770): the owner, "remove find button" — Return asks, on Students, for a child's exact handle. */
function peopleSearchPage_(col) {
  if (!USER) return '';
  const c = col || 'students', S = psState_(c);
  return `<div class="card ps-card" data-ps-col="${esc(c)}">
    <div class="ps-bar">${searchPill_(`data-psearch aria-label="Find someone by handle" placeholder="@handle" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(S.q)}"`)}</div>
    <div class="ps-out" aria-live="polite">${psResults_(c)}</div>
  </div>`;
}
const psColOf_ = el => { const card = el && el.closest ? el.closest('.ps-card') : null; return (card && card.getAttribute('data-ps-col')) || 'students'; };
/* ITS OWN CARD'S RESULTS, AND ONE RELAYOUT WHEN THE TYPING STOPS (770): re-placing every column on each key was the jump the owner saw. */
let PS_PLACE_T_ = 0;
function psPaint_(col) {
  const c = col || 'students';
  document.querySelectorAll('.ps-card[data-ps-col="' + c + '"] .ps-out').forEach(out => { out.innerHTML = psResults_(c); });
  clearTimeout(PS_PLACE_T_);
  PS_PLACE_T_ = setTimeout(() => { try { if (typeof placeCells === 'function') placeCells(); } catch (e) { oops_(e, 'me:psPaint_') } }, 300);
}
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-psearch]')) return;
  const col = psColOf_(t);
  psState_(col).q = t.value;
  psPaint_(col);
});
document.addEventListener('keydown', e => {
  const t = e.target;
  if (e.key !== 'Enter' || !t || !t.matches || !t.matches('[data-psearch]')) return;
  e.preventDefault();
  psFind_(t);
});
/* RETURN IN THE BOX (no button since 770): the exact handle looked up, for Add as my child. */
function psFind_(el) {
  const col = psColOf_(el);
  if (!USER || !psChildCol_(col)) return;
  const S = psState_(col), card = el && el.closest ? el.closest('.ps-card') : null, box = card && card.querySelector('[data-psearch]');
  if (box) S.q = box.value;
  const q = psFold_(S.q);
  if (q.length < 3) { toast('A handle is at least 3 letters'); return; }
  Object.assign(S, { asked: q, child: null, busy: true });
  psPaint_(col);
  send_({ action: 'findChild', personId: USER.personId || '', handle: q }, { button: box || el })
    .then(d => { S.child = (d && d.child && d.child.handle) ? d.child : null; })
    .catch(() => { S.asked = ''; })
    .then(() => { S.busy = false; psPaint_(col); });
}
on('ps-add-child', el => {
  if (!USER || !psMayChild_()) { toast('Sign in first'); return; }
  const handle = el.getAttribute('data-handle') || '';
  if (!handle) return;
  send_({ action: 'claimChild', name: USER.name, personId: USER.personId || '', handle }, { button: el })
    .then(() => { toast('Asked. They will see it when they next sign in.'); PSEARCH_.child = null; PSEARCH_.asked = ''; psPaint_('students'); load(); })
    .catch(heldBy_);
});

/* THE FORM IN THE CARD'S PLACE while it is open on this person. */
function personFormFor_(p, col) {
  const F = PEOPLE_FORM_;
  return F && F.id && p && p.personId && String(p.personId) === F.id && (!col || !F.col || F.col === col) && peopleMay_() ? personFormHtml_(F) : '';
}

function personFormHtml_(F) {
  const head = `<h3>${F.id ? 'Edit ' + esc((F.data && F.data.person && F.data.person.firstName) || 'them') : 'A new person'}</h3>`;
  if (!F.data) {
    if (!F.asked && !F.err) { F.asked = true; setTimeout(() => personFetch_(F), 0); }
    return `<div class="card person-form" data-pid="${esc(F.id)}">${head}${F.err
      ? `<p class="faint">${esc(F.err)}</p>${tile_({ form: true, label: 'Close', act: 'person-cancel', kind: 'quiet' })}` : loading_()}</div>`;
  }
  const p = F.data.person || { firstName: '', lastName: '', roles: [F.role || 'student'], email: '', dob: '', parentIds: [] };
  const choices = Array.isArray(F.data.parents) ? F.data.parents : [];
  const nameOf = id => (choices.find(c => c.personId === id) || {}).name || id;
  const has = (p.parentIds || []).filter(Boolean);
  const kid = (p.roles || []).indexOf('student') !== -1;
  const box = (k, ph, v, type) => `<label class="field"><input data-pf="${k}" placeholder="${esc(ph)}"
    autocomplete="off"${type ? ` type="${type}"` : ''} value="${esc(v || '')}"></label>`;
  return `<div class="card person-form" data-pid="${esc(F.id)}">${head}
    <div class="f-row" style="--n:2">${box('first', 'First name', p.firstName)}${box('last', 'Last name', p.lastName)}</div>
    ${F.id && p.handle ? `<p class="faint pf-handle">Their handle stays @${esc(p.handle)}.</p>` : ''}
    <div class="pf-roles" role="group" aria-label="Role">${peopleRolePicks_().map(([r, label]) => `<label class="check">
      <input type="checkbox" data-pf-role="${r}"${(p.roles || []).indexOf(r) !== -1 ? ' checked' : ''}><span class="box"></span>
      <span>${label}</span></label>`).join('')}</div>
    ${box('email', 'Email (optional)', p.email, 'email')}
    <label class="field"><span>Date of birth (optional)</span><input type="date" data-pf="dob" value="${esc(p.dob || '')}"></label>
    <div class="pf-parents"${kid ? '' : ' hidden'}>
      ${has.length ? '<p class="faint pf-note">Their parents — untick one to unlink.</p>' : ''}
      ${has.map(id => `<label class="check"><input type="checkbox" data-pf-parent="${esc(id)}" checked><span class="box"></span>
        <span>${esc(nameOf(id))}</span></label>`).join('')}
      <label class="field"><span>${has.length ? 'Another parent' : 'Their parent (optional)'}</span><select data-pf="parent">
        <option value="">None</option>${choices.filter(c => has.indexOf(c.personId) === -1).map(c =>
          `<option value="${esc(c.personId)}">${esc(c.name)}</option>`).join('')}</select></label>
    </div>
    <p class="faint pf-said" aria-live="polite"></p>
    <div class="pf-go">${tile_({ form: true, label: F.id ? 'Save' : 'Add them', act: 'person-save' })}
      ${tile_({ form: true, label: 'Cancel', act: 'person-cancel', kind: 'quiet' })}</div>
  </div>`;
}

function peopleRedraw_() {
  /* PEOPLE ARE ON THE THREE PEOPLE COLUMNS since 453. */
  PEOPLE_COLS_.forEach(c => { if (typeof AT !== 'undefined' && AT === c) repaint(true); else markStale_(c); });
}
function personFetch_(F) {
  send_({ action: 'personGet', personId: (USER && USER.personId) || '', targetId: F.id })
    .then(d => { if (PEOPLE_FORM_ !== F) return; F.data = { person: d.person || null, parents: d.parents || [] }; peopleRedraw_(); })
    .catch(e => { if (PEOPLE_FORM_ !== F) return; F.err = (e && e.message) || 'That could not be opened.'; peopleRedraw_(); });
}

on('person-add', el => {
  if (!peopleMay_()) return;
  const col = PEOPLE_ADD_[el && el.dataset && el.dataset.col] ? el.dataset.col : 'students';
  PEOPLE_FORM_ = { id: '', col, role: PEOPLE_ADD_[col].role };
  peopleRedraw_();
});
on('person-cancel', () => { PEOPLE_FORM_ = null; peopleRedraw_(); });

/* THE PARENTS' PART FOLLOWS THE STUDENT TICK — a parent is only asked of a child. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.person-form [data-pf-role="student"]')) return;
  const box = t.closest('.person-form').querySelector('.pf-parents');
  if (box) box.hidden = !t.checked;
});

/* THE CARD THE SERVER SENT, put where the column draws it — `everyone`, or the tutor already drawn. */
function peoplePut_(card, gone) {
  const id = String(gone || (card && card.personId) || '');
  if (!id || !DATA) return;
  const tut = (DATA.tutors || []).find(t => t && String(t.personId) === id);
  if (Array.isArray(DATA.tutors) && gone) DATA.tutors = DATA.tutors.filter(t => !(t && String(t.personId) === id));
  else if (tut) Object.assign(tut, { title: card.title, handle: card.handle });
  const list = Array.isArray(DATA.everyone) ? DATA.everyone.filter(p => !(p && String(p.personId) === id)) : [];
  if (!gone && !tut) list.push(card);
  DATA.everyone = list;
}

on('person-save', el => {
  const F = PEOPLE_FORM_, form = el.closest('.person-form');
  if (!F || !form || !peopleMay_()) return;
  const val = k => ((form.querySelector('[data-pf="' + k + '"]') || {}).value || '').trim();
  const roles = [...form.querySelectorAll('[data-pf-role]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-role'));
  const said = form.querySelector('.pf-said');
  if (!val('first') || !val('last')) { if (said) said.textContent = 'A first name and a last name, please.'; return; }
  if (!roles.length) { if (said) said.textContent = 'Tick at least one role.'; return; }
  const parentIds = roles.indexOf('student') === -1 ? []
    : [...form.querySelectorAll('[data-pf-parent]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-parent'))
      .concat(val('parent') ? [val('parent')] : []);
  send_({ action: 'personSave', personId: USER.personId || '', targetId: F.id, firstName: val('first'),
          lastName: val('last'), roles, email: val('email'), dob: val('dob'), parentIds },
        { button: el, where: said, lock: form })
    .then(d => {
      peoplePut_(d.person);
      if (!F.id) { PEOPLE_FORM_ = { id: '', made: { first: d.first || val('first'), handle: d.handle || '', pin: d.pin || '' } }; }
      else { PEOPLE_FORM_ = null; toast('Saved.'); }
      peopleRedraw_();
      load();
    })
    .catch(() => {});
});

/* ONE PRESS SENDS — the owner's word for it (378); the server's sentence is the toast, sent or why not. */
on('digest-send-now', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  if (!id) return;
  send_({ action: 'digestSendNow', personId: USER.personId || '', targetId: id }, { button: el })
    .then(d => toast((d && d.said) || 'Sent.'))
    .catch(() => {});
});

/* "SHOW PIN" (452): the PIN lives only in this one line of the card — never stored, logged or cached — and goes on a second tap, a redraw or leaving the column. */
function pinHideAll_() {
  document.querySelectorAll('.person-pin').forEach(n => n.remove());
}
on('pin-show', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  const row = el.closest('.tile-row');
  if (!id || !row) return;
  const shown = row.nextElementSibling;
  if (shown && shown.classList.contains('person-pin')) { shown.remove(); return; }
  send_({ action: 'pinShow', personId: USER.personId || '', targetId: id }, { button: el })
    .then(d => {
      if (!d || !row.isConnected) return;
      pinHideAll_();
      const line = document.createElement('p');
      line.className = 'faint person-pin';
      line.style.margin = '.6rem 0 0';
      line.setAttribute('data-id', id);
      line.innerHTML = d.pin ? 'PIN <b>' + esc(d.pin) + '</b>' : esc(d.said || 'No PIN');
      row.after(line);
    })
    .catch(() => {});
});

/* TAP AGAIN TO CONFIRM (420): the Delete tile asks on itself, never in a pop-up; the second press deletes. */
on('person-del', el => {
  if (!peopleMay_()) return;
  const id = el.getAttribute('data-id') || '';
  if (!id) return;
  if (!sure_(el, 'Tap again to confirm')) return;
  send_({ action: 'personDelete', personId: USER.personId || '', targetId: id }, { button: el })
    .then(() => {
      peoplePut_(null, id);
      if (PEOPLE_FORM_ && PEOPLE_FORM_.id === id) PEOPLE_FORM_ = null;
      toast((el.getAttribute('data-name') || 'They') + ' is deleted.');
      peopleRedraw_();
      load();
    })
    .catch(() => {});
});
