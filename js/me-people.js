/* THE PEOPLE CARDS ARE DATA (owner, 14 Nov: one card maker): a part is a `group` block, a line a `p` group, drawn by cards-render. */
const pplG_ = (look, inner, more) => cardBlock_(Object.assign({ type: 'group', look, inner: [].concat(inner == null ? [] : inner).join('') }, more || {}));
const pplP_ = (look, text, more) => cardBlock_(Object.assign({ type: 'group', tag: 'p', look, text }, more || {}));
/* A HEADED PEOPLE CARD: its heading the name and one tag, its look and data on the card, its parts the one embed. */
const pplCard_ = (look, name, parts, data) => renderCard({ kind: 'setting', look, name, tags: name ? [name] : [], data: data || {},
  body: [{ type: 'embed', tool: 'me-form', args: { draw: () => [].concat(parts).join('') } }] });
const pplSelect_ = (attrs, options) => cardBlock_({ type: 'control', tag: 'select', attrs, options });
function peopleAddPage_(col) {
  if (!peopleMay_()) return '';
  col = PEOPLE_ADD_[col] ? col : 'students';
  const F = PEOPLE_FORM_, plus = addCard_({ act: 'person-add', label: PEOPLE_ADD_[col].say, data: { col } });
  if (F && !F.id && (F.col || 'students') !== col) return plus;
  if (F && !F.id && F.made) {
    return pplCard_('person-made', F.made.first + ' is on the people tab', [pinSlip_(F.made.first, F.made.handle, F.made.pin),
      pplP_('note', 'Write it down or read it to them — the PIN is not shown again.'),
      tile_({ form: true, label: 'Done', act: 'person-cancel', kind: 'quiet' })]);
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
  return pplG_('ps-hit', [personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: first, personId: who.personId },
                  { cls: 'kid-face', none: 'prof-none', size: 36 }),
    pplP_('kid-who', [{ b: first }, { span: 'prof-handle', text: '@' + who.handle }], { inner: who.role ? qtag_(esc(who.role), '', 'ps-role') : '' }),
    tiles ? pplG_('tile-row', tiles) : '']);
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
  if (!out.length) out.push(pplP_('note ps-none', exact ? 'Nobody has that handle.' : 'Nobody’s handle starts with that.'));
  return out.join('');
}
/* ONE SEARCH BAR AND NOTHING ELSE (469, 770): the owner, "remove find button" — Return asks, on Students, for a child's exact handle. */
function peopleSearchPage_(col) {
  if (!USER) return '';
  const c = col || 'students', S = psState_(c);
  return meCard_(pplG_('ps-card', [
    pplG_('ps-bar', searchPill_(`data-psearch aria-label="Find someone by handle" placeholder="@handle" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(S.q)}"`)),
    pplG_('ps-out', psResults_(c), { attrs: { 'aria-live': 'polite' } })], { attrs: { 'data-ps-col': c } }));
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
  const head = F.id ? 'Edit ' + ((F.data && F.data.person && F.data.person.firstName) || 'them') : 'A new person', pid = { pid: F.id };
  if (!F.data) {
    if (!F.asked && !F.err) { F.asked = true; setTimeout(() => personFetch_(F), 0); }
    return pplCard_('person-form', head, F.err ? tile_({ form: true, label: 'Close', act: 'person-cancel', kind: 'quiet' }) : loading_(), pid);
  }
  const p = F.data.person || { firstName: '', lastName: '', roles: [F.role || 'student'], email: '', dob: '', parentIds: [] };
  const choices = Array.isArray(F.data.parents) ? F.data.parents : [];
  const nameOf = id => (choices.find(c => c.personId === id) || {}).name || id;
  const has = (p.parentIds || []).filter(Boolean);
  const kid = (p.roles || []).indexOf('student') !== -1;
  const box = (k, ph, v, type) => formLine_('', formInput_(`data-pf="${k}" placeholder="${esc(ph)}"
    autocomplete="off"${type ? ` type="${type}"` : ''} value="${esc(v || '')}"`));
  const said = t => cardRuns_({ span: '', text: t });
  return pplCard_('person-form', head, [
    pplG_('f-row', [box('first', 'First name', p.firstName), box('last', 'Last name', p.lastName)], { attrs: { style: '--n:2' } }),
    pplG_('pf-roles', peopleRolePicks_().map(([r, label]) => formTick_(`data-pf-role="${r}"${(p.roles || []).indexOf(r) !== -1 ? ' checked' : ''}`, said(label))),
      { attrs: { role: 'group', 'aria-label': 'Role' } }),
    box('email', 'Email (optional)', p.email, 'email'),
    formLine_('Date of birth (optional)', formInput_(`type="date" data-pf="dob" value="${esc(p.dob || '')}"`)),
    pplG_('pf-parents', [has.map(id => formTick_(`data-pf-parent="${esc(id)}" checked`, said(nameOf(id)))).join(''),
      formLine_(has.length ? 'Another parent' : 'Their parent (optional)', pplSelect_({ 'data-pf': 'parent' }, [{ value: '', text: 'None' }]
        .concat(choices.filter(c => has.indexOf(c.personId) === -1).map(c => ({ value: c.personId, text: c.name })))))], { attrs: { hidden: !kid } }),
    pplP_('note pf-said', '', { attrs: { 'aria-live': 'polite' } }),
    pplG_('pf-go', [tile_({ form: true, label: F.id ? 'Save' : 'Add them', act: 'person-save' }),
      tile_({ form: true, label: 'Cancel', act: 'person-cancel', kind: 'quiet' })])], pid);
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
      line.className = 'note person-pin';
      line.setAttribute('data-id', id);
      line.innerHTML = cardRuns_(d.pin ? ['PIN ', { b: String(d.pin) }] : String(d.said || 'No PIN'));
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

/* ---------- AN ADMIN EDITS SOMEBODY'S DETAILS ON THEIR OWN CARD (edit-person): drawn by the form maker, saved as typed by `updateProfile` ---------- */
/* THE ONE CARD OPEN FOR IT: `{ id, name, data, err }`, `data` once `personGet` answers; the server refuses anybody but an admin too (`profileWho_`). */
let PERSON_ED_ = null;
const personEdMay_ = () => peopleMay_() && typeof uiMay_ === 'function' && uiMay_('edit-person');
const PE_BOXES_ = [['first_name', 'firstName'], ['last_name', 'lastName'], ['email', 'email'], ['phone', 'phone'], ['address', 'address'], ['postcode', 'postcode']];
/* THE NAMES OF THE OTHER SIDE OF A FAMILY LINK: the payload's cards, else the parent list `personGet` sent, else the id. */
const peNameOf_ = (id, d) => ((((DATA && DATA.everyone) || []).find(p => p && String(p.personId) === String(id)) || {}).title)
  || ((((d && d.parents) || []).find(c => c.personId === id)) || {}).name || id;
function personEdHtml_(p) {
  const F = PERSON_ED_;
  if (!F || !p || !p.personId || String(p.personId) !== F.id || !personEdMay_()) return '';
  const done = tile_({ form: true, label: 'Done', act: 'person-edit-done', kind: 'quiet' });
  const at = { attrs: { 'data-pid': F.id } };
  if (!F.data) return pplG_('pe-form', F.err ? [pplP_('note pe-said', F.err), done] : loading_(), at);
  const q = F.data.person || {};
  const box = (f, k) => formField_(f, q[k] || '', { attr: 'data-pe', draft: false,
    extra: f === 'email' ? 'type="email" autocomplete="off"' : f === 'phone' ? 'type="tel"' : 'autocomplete="off"' });
  const tutor = (q.roles || []).indexOf('tutor') !== -1;
  return pplG_('pe-form', [PE_BOXES_.slice(0, 2).map(([f, k]) => box(f, k)).join(''),
    formField_('handle', q.handle ? '@' + q.handle : '', { attr: 'data-pe', draft: false, readonly: true, label: 'handle (theirs to change)' }),
    formLine_('date of birth', formInput_(`type="date" data-pe="dob" value="${esc(q.dob || '')}"`)),
    PE_BOXES_.slice(2).map(([f, k]) => box(f, k)).join(''),
    peFamHtml_(F), peNotifyHtml_(F),
    tutor ? pplP_('note pe-fam', (q.listed === '' || TRUEish_(q.listed) ? 'Listed' : 'Not listed') + ': the eye on their tutor card changes it') : '',
    pplP_('note pe-said', '', { attrs: { 'aria-live': 'polite' } }), done], at);
}
/* THEIR NOTIFICATIONS: the kinds their own card shows, ticked as the sheet says; each tick is `setNotify` with targetId (admin-checked there). */
function peNotifyHtml_(F) {
  const n = F.data && F.data.notify, opt = ((n && n.kinds) || []).filter(k => k && !k.essential);
  if (!opt.length) return '';
  return pplG_('pe-notify', [pplP_('note pe-fam', 'Notifications they get')].concat(opt.map(k => formToggle_({ act: 'pe-notify', data: { kind: k.kind },
    on: !!k.on, label: k.label, note: k.note || '' }))));
}
on('pe-notify', el => {
  const F = PERSON_ED_, kind = String((el && el.dataset.kind) || ''), want = !!(el && el.checked);
  if (!F || !F.data || !kind || !personEdMay_()) return;
  const said = el.closest('.pe-form') && el.closest('.pe-form').querySelector('.pe-said');
  send_({ action: 'setNotify', personId: (USER && USER.personId) || '', targetId: F.id, kind, on: want }, { where: said || undefined, saying: 'Saving…', lock: el.closest('label') || el })
    .then(d => {
      const on = d && typeof d.on === 'boolean' ? d.on : want;
      if (PERSON_ED_ === F && F.data.notify) F.data.notify = Object.assign({}, F.data.notify, { kinds: (F.data.notify.kinds || []).map(k => k.kind === kind ? Object.assign({}, k, { on }) : k) });
      el.checked = on;
      if (said) said.textContent = 'Saved.';
    })
    .catch(e => { el.checked = !want; if (said) said.textContent = why_(e); });
});
/* WHAT THE BOXES SAY NOW, in `updateProfile`'s names: the phone as code and number, the birthday as three boxes. */
function peFields_(form) {
  const v = f => { const b = form.querySelector('[data-pe="' + f + '"]'); return b && !b.disabled ? String(b.value || '').trim() : null; };
  const out = {};
  PE_BOXES_.forEach(([f]) => { if (f !== 'phone' && v(f) !== null) out[f] = v(f); });
  const ph = v('phone');
  if (ph !== null) { const m = /^(\+\d{1,4})\s+(.*)$/.exec(ph); out.phone_cc = m ? m[1] : '+44'; out.phone_no = m ? m[2] : ph; }
  const dob = v('dob');
  if (dob !== null) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob) || ['', '', '', '']; out.dob_y = m[1]; out.dob_m = m[2]; out.dob_d = m[3]; }
  return out;
}
const PE_WAIT_ = new WeakMap();
const peLater_ = form => { clearTimeout(PE_WAIT_.get(form)); PE_WAIT_.set(form, setTimeout(() => peSave_(form), 700)); };
function peSave_(form) {
  const F = PERSON_ED_;
  if (!form.isConnected || !F || !F.data || form.dataset.pid !== F.id || !personEdMay_()) return;
  if (form.classList.contains('is-sending')) { peLater_(form); return; }
  const fields = peFields_(form), said = form.querySelector('.pe-said'), key = JSON.stringify(fields);
  if (key === F.sent) return;
  form.classList.add('is-sending');
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '', target: F.name || '', targetId: F.id, fields }, { where: said })
    .then(d => { F.sent = key; F.moved = true; if (said) said.textContent = '✓ ' + ((d && d.said) || 'Saved'); })
    .catch(() => {})
    .then(() => form.classList.remove('is-sending'));
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const form = e.target && e.target.closest && e.target.closest('.pe-form');
  if (form && e.target.hasAttribute('data-pe')) peLater_(form);
}));
/* THE CARD DRAWN AGAIN WHEREVER IT STANDS: Find (`inFinder_`, rule 14) and the people columns. */
function peRedraw_() {
  peopleRedraw_();
  try { if (typeof paintStuff === 'function' && typeof FINDER !== 'undefined') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'person-edit:redraw'); }
}
on('person-edit', el => {
  if (!personEdMay_()) return;
  const id = el.getAttribute('data-id') || '';
  if (!id) return;
  const F = PERSON_ED_ = { id, name: el.getAttribute('data-name') || '', data: null };
  peRedraw_();
  send_({ action: 'personGet', personId: USER.personId || '', targetId: id })
    .then(d => { if (PERSON_ED_ !== F) return; F.data = { person: d.person || {}, parents: d.parents || [], notify: d.notify || null }; peRedraw_(); })
    .catch(e => { if (PERSON_ED_ !== F) return; F.err = (e && e.message) || 'Their details could not be opened.'; peRedraw_(); });
});
on('person-edit-done', () => {
  const F = PERSON_ED_;
  document.querySelectorAll('.pe-form').forEach(f => { clearTimeout(PE_WAIT_.get(f)); peSave_(f); });
  PERSON_ED_ = null;
  peRedraw_();
  if (F && F.moved && typeof load === 'function') load();
});

/* ---------- FAMILY PICKER: a typed search over the payload's people cards, its hits a tap each (add-person, edit-person) ---------- */
/* `want` 'student', 'client' or 'any'; `scope` 'pa' (the Add card), 'pe' (the Edit form) or 'lens', which names the tap a hit makes. */
const FAM_WANT_ = { student: /student/i, client: /client|parent/i, any: /(?:)/ };
const famIs_ = (p, want) => (FAM_WANT_[want] || FAM_WANT_.client).test(String((p && p.role) || ''));
function famHits_(q, want, skip) {
  q = String(q || '').trim().toLowerCase().replace(/^@/, '');
  if (!q) return [];
  return ((DATA && DATA.everyone) || []).filter(p => p && p.personId && famIs_(p, want) && (skip || []).indexOf(String(p.personId)) === -1
    && [p.title, p.name, p.handle].filter(Boolean).join(' ').toLowerCase().indexOf(q) !== -1).slice(0, 6);
}
/* THE TAP A HIT MAKES, by where the picker stands, and the people it leaves out. */
const FAM_ACT_ = { pa: { act: 'pa-pick', skip: () => ((PERSON_ADD_ && PERSON_ADD_.picked) || []).map(x => x.id) },
  pe: { act: 'pe-link', skip: () => peLinked_().concat([String((PERSON_ED_ || {}).id || '')]) },
  lens: { act: 'lens-pick', skip: () => [String((USER || {}).personId || '')] } };
const famPick_ = (scope, want, label) => pplG_('fam-pick', [formLine_(label, formInput_(`data-fam-q="${scope}" data-fam-want="${want}" type="search" autocomplete="off" placeholder="name or @handle"`)),
  pplG_('tile-row fam-hits', '', { attrs: { 'data-fam-hits': scope } })]);
document.addEventListener('input', e => {
  const box = e.target;
  if (!box || !box.matches || !box.matches('[data-fam-q]')) return;
  const scope = box.getAttribute('data-fam-q'), want = box.getAttribute('data-fam-want');
  const out = box.closest('.fam-pick') && box.closest('.fam-pick').querySelector('.fam-hits');
  if (!out) return;
  const at = FAM_ACT_[scope] || FAM_ACT_.pe;
  out.innerHTML = famHits_(box.value, want, at.skip()).map(p => tile_({ form: true, kind: 'quiet', label: displayName_(p) + (p.handle ? ' @' + p.handle : ''),
    act: at.act, data: { id: p.personId, name: displayName_(p), want } })).join('');
});

/* ---------- ADD A PERSON, A CARD IN FIND › PROFILES (add-person): the server's `personSave`, then `linkChild` for a parent's child ---------- */
/* `{ role, v: typed, picked: [{id, name}], made }`; null until the first tap. */
let PERSON_ADD_ = null;
const personAddMay_ = () => peopleMay_() && typeof uiMay_ === 'function' && uiMay_('add-person');
const PA_ROLES_ = [['student', 'Student'], ['client', 'Parent'], ['tutor', 'Tutor']];
const paState_ = () => PERSON_ADD_ || (PERSON_ADD_ = { role: 'student', v: {}, picked: [] });
function paPickedHtml_(F) {
  return pplG_('pa-picked', F.picked.map(x => pplG_('tile-row', [cardBlock_({ type: 'group', tag: 'span', look: 'note', text: x.name }),
    tile_({ form: true, kind: 'quiet', label: 'Remove', act: 'pa-unpick', data: { id: x.id } })])));
}
function personAddCard_() {
  if (!personAddMay_()) return '';
  const F = paState_(), v = k => esc(F.v[k] || '');
  if (F.made) {
    return pplCard_('is-prof prof-door pa-card', F.made.first + ' is added', [
      F.made.pin ? pinSlip_(F.made.first, F.made.handle, F.made.pin) + pplP_('note', 'Write it down or read it to them — the PIN is not shown again.')
        : pplP_('note', `The PIN went to ${F.made.email}, with the handle @${F.made.handle}.`),
      F.made.said ? pplP_('note', F.made.said) : '',
      tile_({ form: true, label: 'Add another', act: 'pa-again', kind: 'quiet' })]);
  }
  const kid = F.role === 'student', tutor = F.role === 'tutor';
  const box = (k, ph, type) => formLine_('', formInput_(`data-pa="${k}" placeholder="${esc(ph)}" autocomplete="off"${type ? ` type="${type}"` : ''} value="${v(k)}"`));
  return pplCard_('is-prof prof-door pa-card', 'Add a person', [box('first', 'First name'), box('last', 'Last name'),
    formLine_('Role', pplSelect_({ 'data-pa': 'role' }, PA_ROLES_.map(([r, l]) => ({ value: r, text: l, on: r === F.role })))),
    box('email', kid ? 'Email (optional)' : 'Email', 'email'),
    formLine_('Date of birth (optional)', formInput_(`type="date" data-pa="dob" value="${v('dob')}"`)),
    tutor ? '' : famPick_('pa', kid ? 'client' : 'student', kid ? 'Their parent' : 'Their child') + paPickedHtml_(F),
    pplP_('note pa-said', '', { attrs: { 'aria-live': 'polite' } }),
    pplG_('pf-go', tile_({ form: true, label: 'Add them', act: 'pa-save' }))]);
}
const paRedraw_ = () => { try { if (typeof paintStuff === 'function' && typeof FINDER !== 'undefined') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'add-person:redraw'); } };
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const k = e.target && e.target.getAttribute && e.target.getAttribute('data-pa');
  if (!k) return;
  const F = paState_();
  if (k !== 'role') { F.v[k] = e.target.value; return; }
  if (ev !== 'change' || e.target.value === F.role) return;
  /* A NEW ROLE TURNS THE PICKER ROUND (a child's parent, a parent's child), so what was picked for the other side goes. */
  F.role = e.target.value; F.picked = [];
  paRedraw_();
}));
const paPickedPaint_ = el => { const box = el && el.closest('.pa-card'), at = box && box.querySelector('.pa-picked'); if (at) at.outerHTML = paPickedHtml_(paState_()); };
on('pa-pick', el => {
  const F = paState_(), id = el.getAttribute('data-id') || '', card = el.closest('.pa-card');
  if (!id || F.picked.some(x => x.id === id)) return;
  F.picked.push({ id, name: el.getAttribute('data-name') || id });
  const q = card && card.querySelector('[data-fam-q]'), hits = card && card.querySelector('.fam-hits');
  if (q) q.value = '';
  if (hits) hits.innerHTML = '';
  paPickedPaint_(q || card);
});
on('pa-unpick', el => { const F = paState_(), id = el.getAttribute('data-id'); F.picked = F.picked.filter(x => x.id !== id); paPickedPaint_(el); });
on('pa-again', () => { PERSON_ADD_ = null; paRedraw_(); });
on('pa-save', el => {
  const F = paState_(), card = el.closest('.pa-card');
  if (!card || !personAddMay_()) return;
  const val = k => String(F.v[k] || '').trim(), said = card.querySelector('.pa-said');
  if (!val('first') || !val('last')) { if (said) said.textContent = 'A first name and a last name, please.'; return; }
  if (F.role !== 'student' && !val('email')) { if (said) said.textContent = 'An email, please — the PIN goes there.'; return; }
  const ids = F.picked.map(x => x.id);
  send_({ action: 'personSave', personId: USER.personId || '', targetId: '', firstName: val('first'), lastName: val('last'),
          roles: [F.role], email: val('email'), dob: val('dob'), parentIds: F.role === 'student' ? ids : [], invite: false },
        { button: el, where: said, lock: card })
    .then(d => {
      const pid = String((d.person && d.person.personId) || '');
      peoplePut_(d.person);
      /* A PARENT'S CHILDREN, ONE `linkChild` EACH: the account is made either way, and a link that failed says so on the slip. */
      const kids = F.role === 'client' && pid ? ids : [];
      return Promise.all(kids.map(cid => send_({ action: 'linkChild', personId: USER.personId || '', parentId: pid, childId: cid })
        .then(() => '', e => (e && e.message) || 'a link failed')))
        .then(fails => {
          const bad = fails.filter(Boolean);
          PERSON_ADD_ = { role: F.role, v: {}, picked: [], made: { first: d.first || val('first'), handle: d.handle || '', pin: d.pin || '', email: val('email'),
            said: bad.length ? 'Made, but not linked to every child: ' + bad[0] : '' } };
          paRedraw_();
          load();
        });
    })
    .catch(() => {});
});

/* ---------- THE EDIT FORM'S FAMILY LINKS, EDITABLE: `linkChild` adds one, `adminUnlinkFamily` takes one off; redrawn in place ---------- */
const peLinked_ = () => { const q = (PERSON_ED_ && PERSON_ED_.data && PERSON_ED_.data.person) || {}; return [].concat(q.parentIds || [], q.childIds || []).map(String); };
function peFamHtml_(F) {
  const q = (F.data && F.data.person) || {}, roles = q.roles || [];
  const side = (say, key, want, mine, add) => {
    const ids = (q[key] || []).filter(Boolean);
    if (!ids.length && roles.indexOf(mine) === -1) return '';
    return pplP_('note pe-fam', say) + ids.map(id => pplG_('tile-row', [cardBlock_({ type: 'group', tag: 'span', look: 'note', text: displayName_(peNameOf_(id, F.data)) }),
      tile_({ form: true, kind: 'quiet', label: 'Remove', act: 'pe-unlink', data: { id, side: key } })])).join('') + famPick_('pe', want, add);
  };
  return pplG_('pe-fambox', [side('Linked parents', 'parentIds', 'client', 'student', 'Add a parent'), side('Linked children', 'childIds', 'student', 'client', 'Add a child')]);
}
const peFamPaint_ = form => { const at = form && form.querySelector('.pe-fambox'); if (at && PERSON_ED_) at.outerHTML = peFamHtml_(PERSON_ED_); };
/* WHICH WAY ROUND: a hit under "Add a parent" is the parent of the card's person; a Remove names its own side. */
const peWho_ = (F, other, side) => (side === 'parentIds' ? { parentId: other, childId: F.id } : { parentId: F.id, childId: other });
function peFamSend_(el, action, side, after) {
  const F = PERSON_ED_, other = el.getAttribute('data-id') || '', form = el.closest('.pe-form');
  if (!F || !F.data || !other || !form || !personEdMay_()) return;
  const said = form.querySelector('.pe-said');
  send_(Object.assign({ action, personId: USER.personId || '' }, peWho_(F, other, side)), { button: el, where: said })
    .then(() => { const p = F.data.person; p[side] = after(p[side] || [], other); F.moved = true; if (said) said.textContent = '✓ Saved'; peFamPaint_(form); })
    .catch(() => {});
}
on('pe-link', el => peFamSend_(el, 'linkChild', el.getAttribute('data-want') === 'client' ? 'parentIds' : 'childIds', (l, id) => l.concat([id])));
on('pe-unlink', el => sure_(el, 'Tap again to confirm') && peFamSend_(el, 'adminUnlinkFamily', el.getAttribute('data-side') || '', (l, id) => l.filter(x => String(x) !== id)));
