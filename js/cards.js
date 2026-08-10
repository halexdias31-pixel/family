/* ==================================================================================================
   @family. — cards.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   cards.js is number 6 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* The app STARTS at the very bottom of this file, not here.

   It used to start here, and here is above every `screen(...)` registration — so `go()` ran with
   an empty SCREENS table and `paint()` fell through to its own "Nothing here yet", on every tab,
   until the first fetch came back and repainted. The skeleton was never reached once, on any
   device: the thing it was covering had already been replaced by a sentence saying there was
   nothing to cover.

   Nothing marks the boundary in a file that is read top to bottom, which is exactly why the
   start belongs at the end — where everything it needs is behind it by construction rather than
   by somebody remembering. */

/* ================================================================================================
   THE FIRST SCREEN — Who.

   Tutors and venues, which is the simplest real screen: two lists of things the backend already
   sends. It is here to prove the shell rather than to be finished, and to be the shape every
   other screen copies:

     · a screen is ONE function returning markup
     · it never touches the tab bar, the header or another screen
     · anything needing the whole display opens a sheet
     · anything pressable carries `data-do`, so the markup can be thrown away and redrawn
================================================================================================ */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE ---------------------------------------
   The Find SCREEN is gone — it and Stuff were two tabs asking the same question, and the funnel
   can hold both lists now that it skips whatever a kind cannot answer. What survives is the three
   card shapes, because a tutor still has to look like a tutor.

   `findItems`, `findPageHtml`, `findBrowse`, `findPageCount` and the `find-kind` handler went with
   the screen. Every one of them was a smaller, worse copy of something the funnel already does:
   a browse page with three counts, a pager, and a filter that could only ever ask one question.
--------------------------------------------------------------------------------------------- */
/** One card. The three shapes, each carrying the class that colours its name. */
function findCard(x) {
  const t = x.row;
  /* ---------- A TUTOR IS A STAFF PASS ------------------------------------------------------------
     The thing a parent is actually checking, in the form they already know how to read.

     A pass carries a photograph, a name, what the person does, and — the whole reason a pass exists
     — whether they have been CLEARED. DBS was a boolean in a row of fields, which is where a fact
     goes to be skipped. On a pass it is a stamp, and a pass without one is visibly a pass without
     one, which is exactly the right amount of alarming.

     THE HOLE AT THE TOP is not decoration. It is what makes the eye read the whole thing as a card
     hanging round somebody's neck rather than as a rectangle with a photograph in it — and once it
     reads as that, the DBS stamp reads as clearance without anybody explaining it. */
  if (x.kind === 'tutor') return `
    <div class="pass tap${t.listed === false ? ' is-off' : ''}"
         data-do="who" data-kind="tutor" data-name="${esc(t.title)}">
      <span class="pass-hole"></span>
      <div class="pass-top">
        <span class="pass-org">@family.</span>
        <span class="pass-role">${esc(t.role || 'Tutor')}</span>
      </div>
      <div class="pass-body">
        ${t.image
          ? `<img class="pass-pic" src="${esc(pic(t.image))}" alt="" loading="lazy">`
          : `<span class="pass-pic pass-none">${esc((t.title || '?').slice(0, 1).toUpperCase())}</span>`}
        <div class="pass-who">
          <span class="pass-name">${esc(t.title)}</span>
          ${/* WHAT THEY TEACH, as printed lines. Two at most: a pass lists a person's post, not
                their whole history, and four subjects in this space is a paragraph. */''}
          ${(t.teaches || []).slice(0, 2).map(v =>
            `<span class="pass-line">${mark(v)}</span>`).join('')}
          ${t.rate ? `<span class="pass-line pass-rate">${money(t.rate)}/h</span>` : ''}
        </div>
      </div>
      <div class="pass-foot">
        ${/* THE STAMP. Present and green, or absent and said so — never quietly missing, which is
              what a blank field is. A parent scanning a list of these is looking for exactly one
              thing and it should be findable at arm's length. */''}
        <span class="pass-dbs ${t.dbs ? 'yes' : 'no'}">${t.dbs ? 'DBS CHECKED' : 'NO DBS ON FILE'}</span>
        ${t.listed === false ? '<span class="pass-off">NOT LISTED</span>' : ''}
      </div>
    </div>`;

  /* ---------- A VENUE IS THE SLIP ON THE DOOR ----------------------------------------------------
     The tear-off booking slip taped to a library room: where it is, which rooms, how many fit, what
     an hour costs. Everything on it is already on the venues and rooms tabs — this is not inventing
     a form, it is drawing the one the data was always describing.

     THE PERFORATION down the bottom is the whole trick. A rectangle with a torn edge is a slip you
     take away, and a slip you take away is a thing you BOOK — which is what this card does when you
     tap it. The shape says what the tap does. */
  if (x.kind === 'venue') return `
    <div class="slip tap" data-do="who" data-kind="venue" data-name="${esc(t.title)}">
      <div class="slip-head">
        <span class="slip-where">${esc(t.title)}</span>
        ${t.subtitle ? `<span class="slip-sub">${mark(t.subtitle)}</span>` : ''}
      </div>
      <div class="slip-rows">
        ${/* ONE LINE PER ROOM, which is what a venue with rooms actually is — Richmond is not one
              price, it is three rooms at three prices holding three different numbers, and a single
              "from" figure was the cheapest of them dressed as the answer. */''}
        ${(t.rooms || []).length
          ? (t.rooms || []).slice(0, 4).map(r => `
              <div class="slip-row">
                <span class="slip-room">${esc(r.name)}</span>
                <span class="slip-cap">${r.max ? 'up to ' + r.max : ''}</span>
                <span class="slip-rate mono">${r.rate ? money(r.rate) + '/h' : 'free'}</span>
              </div>`).join('')
          : `<div class="slip-row">
               <span class="slip-room">The room</span>
               <span class="slip-cap">${t.maxCapacity ? 'up to ' + t.maxCapacity : ''}</span>
               <span class="slip-rate mono">${t.bestRate ? money(t.bestRate) + '/h' : 'free'}</span>
             </div>`}
      </div>
      ${/* The perforation, and under it the stub — the part you would tear off and keep. */''}
      <div class="slip-perf"></div>
      <div class="slip-stub">
        <span>${t.minNoticeDays ? esc(t.minNoticeDays) + ' days notice' : 'Book any time'}</span>
        <span class="slip-take">Tap to book</span>
      </div>
    </div>`;

  return `
    <div class="card tap is-subject" data-do="subject" data-name="${esc(t.name)}">
      <h3>${esc(t.name)}</h3>
      ${row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
            t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;
}

/* Tapping one opens a sheet rather than expanding the card. An expanding card pushes everything
   below it down, which on a phone means the thing you were looking at moves the moment you touch
   it — a sheet leaves the list exactly where it was. */
on('who', (el) => {
  const name = el.dataset.name;
  const list = el.dataset.kind === 'tutor' ? (DATA.tutors || []) : (DATA.venues || []);
  const it = list.find(x => norm(x.title) === norm(name));
  if (!it) return;

  const rows = [
    ['Where', it.city || it.borough],
    ['Rate', it.rate ? money(it.rate) + '/h' : (it.bestRate ? money(it.bestRate) + '/h' : '')],
    ['Teaches', (it.tags || []).join(', ')],
  ].filter(([, v]) => v);

  openSheet(name, `
    ${it.image ? `<img src="${esc(it.image)}" alt="" style="width:100%;border-radius:var(--r);margin-bottom:12px">` : ''}
    ${it.subtitle ? `<p class="note" style="margin-top:0">${mark(it.subtitle)}</p>` : ''}
    ${/* `row` escapes its own label, so nothing is wrapped here — and the label is passed as a
          VALUE rather than inside quotes. It used to read `row('${esc(k)}', v)`, and a `${…}` inside
          a quoted string is six characters: every row in this sheet was labelled `${esc(k)}`. */''}
    ${rows.map(([k, v]) => row(k, v)).join('')}
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" data-do="book-with" data-name="${esc(name)}">Book with them</button>
    </div>
    ${el.dataset.kind === 'tutor' && isAdmin()
      ? `<label class="check" style="margin-top:.6rem">
           <input type="checkbox" data-do="set-listed" data-who="${esc(name)}"
                  ${it.listed === false ? '' : 'checked'}>
           <span class="box"></span>
           <span>Listed on the site<br><span class="faint">Clients only see tutors that are
             ticked.</span></span>
         </label>`
      : ''}`);
});

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  const on = el.checked;
  api({ action: 'setListed',
    adminName: USER.name, name: USER.name, who: el.dataset.who, on })
    .then(d => {
      if (d && d.error) { el.checked = !on; toast(d.error); return; }
      toast(on ? 'Listed' : 'Hidden from clients');
      load();
    })
    .catch(() => { el.checked = !on; toast('Could not reach the server.'); });
});

/* THE OTHER HALF OF THE CLICK HANDLER.
   A checkbox is not clicked in the way a button is — the change event is what tells you it
   actually flipped, and reading .checked in a click handler can catch it mid-flight. A select is
   the same problem said louder: its value only means anything after `change`.
   So both come through here, and the click handler above refuses them. */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && el.type !== 'checkbox') return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + String((err && err.message) || err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */
on('subject', el => {
  const x = subjectRows().find(s2 => norm(s2.name) === norm(el.dataset.name));
  if (!x) return;
  openSheet(x.name, `
    ${/* The LABEL changes with the value here — "No surcharge" against a dash, or "Surcharge"
          against a percentage. So it is an expression rather than a word, which is exactly the case
          `row` takes as its first argument. */''}
    ${row(x.mult === 1 ? 'No surcharge' : 'Surcharge',
          x.mult === 1 ? '—'
        : (x.mult > 1 ? '+' : '−') + Math.abs(Math.round((x.mult - 1) * 100)) + '%')}
    ${x.levels && x.levels.filter(Boolean).length
      ? `${row('Levels', x.levels.filter(Boolean).join(', '))}` : ''}
    <h2>Who teaches it</h2>
    ${x.tutors && x.tutors.length
      ? x.tutors.map(t => `<div class="card tap is-tutor" data-do="who" data-kind="tutor"
           data-name="${esc(t.title)}"><h3>${esc(t.title)}</h3>
           ${t.rate ? `<p class="sub">${money(t.rate)}/h</p>` : ''}</div>`).join('')
      : '<p class="note">Nobody yet.</p>'}
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" data-do="book-with" data-name="">Book this</button>
    </div>`);
});

on('book-with', (el) => {
  closeSheet();
  go('book');
  toast('Booking screen — not built yet');
});