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
  if (x.kind === 'tutor') return `
    <div class="card tap is-tutor${t.listed === false ? ' is-off' : ''}"
         data-do="who" data-kind="tutor" data-name="${esc(t.title)}">
      <h3>${esc(t.title)}${t.listed === false
        ? ' <span class="faint">— not listed</span>' : ''}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${t.rate ? `<div class="row"><span class="k">From</span>
                    <span class="v mono">${money(t.rate)}/h</span></div>` : ''}
      ${(t.tags || []).length
        ? `<p class="faint">${mark((t.tags || []).slice(0, 4).join(' · '))}</p>` : ''}
    </div>`;

  if (x.kind === 'venue') return `
    <div class="card tap is-venue" data-do="who" data-kind="venue" data-name="${esc(t.title)}">
      <h3>${esc(t.title)}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${t.bestRate
        ? `<div class="row"><span class="k">Room hire</span>
             <span class="v mono">${money(t.bestRate)}/h</span></div>`
        : '<p class="faint">No charge</p>'}
    </div>`;

  return `
    <div class="card tap is-subject" data-do="subject" data-name="${esc(t.name)}">
      <h3>${esc(t.name)}</h3>
      <div class="row">
        <span class="k">${t.mult === 1 ? 'No surcharge' : 'Surcharge'}</span>
        <span class="v mono">${t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%'}</span>
      </div>
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
    ${rows.map(([k, v]) =>
      `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
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
    <div class="row"><span class="k">${x.mult === 1 ? 'No surcharge' : 'Surcharge'}</span>
      <span class="v mono">${x.mult === 1 ? '—'
        : (x.mult > 1 ? '+' : '−') + Math.abs(Math.round((x.mult - 1) * 100)) + '%'}</span></div>
    ${x.levels && x.levels.filter(Boolean).length
      ? `<div class="row"><span class="k">Levels</span>
           <span class="v">${esc(x.levels.filter(Boolean).join(', '))}</span></div>` : ''}
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