/* ==================================================================================================
   @family. — resource.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   resource.js is number 11 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */



/* ---------- ONE RESOURCE, AND NO SHEET FOR IT --------------------------------------------------
   `on('topic')` WAS HERE and is gone. It opened a panel that repeated the card — the name, the
   subject, the page count — and then offered the ticks, the PDF, the transcription and the
   printed copy. All four are buttons on the card now; see `topicTiles_` in tiles.js.
   The panel had to repeat the card because a panel floating over a list has to say which of the
   list it belongs to. That is the tell: a screen whose first job is to identify itself is a
   screen that did not need to exist.
--------------------------------------------------------------------------------------------- */

/* ---------- EDITING A RESOURCE, FROM THE BACKEND'S OWN LIST ---------------------------------------
   The form used to name seven fields by hand while the tab had twenty-five and the allow-list
   twenty. Adding a column meant a schema edit, an allow-list edit AND a form edit — and forgetting
   the third meant a column that existed, could be written to, and had nowhere to type it in.

   `resourceFields` has been in the payload the whole time. It IS the allow-list — the same object
   the server checks writes against — so a form built from it cannot offer a field the server will
   refuse, and cannot miss one the server would accept. One list, two readers.

   The groups come with it, so the form arrives already sectioned: What it is, Level, Source,
   Flags, Pages, Costs, Admin.
--------------------------------------------------------------------------------------------- */

/* A column name as a person would say it. Everything not named here is the column with its
   underscores taken out, which is right far more often than it is wrong — `exam_board` reads
   perfectly well as "exam board". */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', resource_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');

/* The ones that are a yes or a no rather than a value. A checkbox for these and a text box for
   everything else — a boolean in a text field is somebody typing TRUE and hoping. */
const FIELD_BOOL = ['trackable', 'print_required', 'printable', 'active'];

/* Where a field's value comes from on the topic object, when it is not simply the same name.
   The payload names things as a person would — `examBoard` — and the sheet as a column does. */
const FIELD_FROM = {
  band_type: 'bandType', band_value: 'bandValue', key_stage: 'keystage',
  exam_board: 'examBoard', exam_wave: 'examWave', resource_type: 'resourceType',
  print_required: 'paper', level_required: 'level', name: 'name', link: 'link',
};

on('topic-edit', el => {
  const t = topicBy(el.dataset.key);
  if (!t) return;

  const groups = (DATA.resourceFields && Object.keys(DATA.resourceFields).length)
    ? DATA.resourceFields
    /* A backend too old to send it. The form still opens, with what this file knows about — an
       admin who cannot edit anything is worse than one who can edit seven things. */
    : { 'What it is': ['name', 'subject', 'resource_type', 'link'],
        'Level': ['band_type', 'band_value'], 'Pages': ['pages', 'printable'] };

  /* Values already known, offered as you type. Every value any resource has for that field, which
     is how "Edexcel" gets typed once and picked thereafter — and how three spellings of one board
     stop happening. */
  const known = f => {
    const from = FIELD_FROM[f] || f;
    return uniq(allTopics().map(x => String(x[from] ?? '').trim())).filter(Boolean).sort(cmpText);
  };

  openSheet('Edit — ' + t.name,
    fieldsHtml(groups, {
      attr: 'data-ed',
      /* A resource's own column names differ from the form's in places — `FIELD_FROM` is the map,
         and it belongs here rather than in the renderer, which should not need to know that this
         one editor renames things. */
      value: f => t[FIELD_FROM[f] || f] ?? '',
      /* What every other row already says, offered rather than enforced. */
      suggest: known,
    })
    + `<button class="btn" data-do="topic-save" data-key="${esc(t.id || t.name)}">Save</button>
       <p class="faint" id="ed-said" style="margin:.6rem 0 0">
         Changing the link clears the page count — it was read off the old file.</p>`);
});

on('topic-save', el => {
  const said = $('ed-said');

  /* WHATEVER THE FORM PUT ON THE PAGE, read back by the name it was given. The old version listed
     the seven fields again — a third place to forget one, and the reason adding a column meant
     three edits. */
  const fields = {};
  document.querySelectorAll('#sheet-body [data-ed]').forEach(box => {
    fields[box.dataset.ed] = box.type === 'checkbox'
      ? (box.checked ? 'TRUE' : 'FALSE')
      : String(box.value || '').trim();
  });

  if (!String(fields.name || '').trim()) {
    if (said) said.textContent = 'It needs a name.';
    return;
  }

  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'editResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* Two presses, the same as a post. The button becomes the question rather than handing the screen
   to a browser dialogue that cannot speak in this app's words. */
on('topic-delete', el => {
  const restoring = !!el.dataset.on;
  if (!el.dataset.sure && !restoring) {
    el.dataset.sure = '1';
    el.textContent = 'Really delete?';
    setTimeout(() => { if (el.dataset.sure) { delete el.dataset.sure; el.textContent = 'Delete'; } }, 4000);
    return;
  }
  const said = $('topic-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deleteResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast(restoring ? 'Back on the list' : 'Deleted — still there, switched off');
      load();
    })
    .catch(err => {
      el.disabled = false; delete el.dataset.sure;
      el.textContent = restoring ? 'Restore' : 'Delete';
      if (said) said.textContent = String(err.message || 'Could not do that');
    });
});

on('shop-item', el => {
  const it = (DATA.shop || []).find(x => norm(x.name) === norm(el.dataset.key));
  if (!it) return;
  const credits = USER ? (USER.credits || 0) : 0;
  const price = Number(it.price) || 0;
  const inCart = CART.some(c => c.key === it.name && c.kind === 'shop');
  const wearable = isWearable(it);

  /* A WEARABLE IS NOT PUT IN A BASKET. There is nothing to post and nothing to collect — it is
     worn, or it is not — so it goes on straight away and the credits come off at that moment.
     Buying and equipping are ONE act, which is what stops a failed request leaving somebody
     poorer than it found them. */
  const mine = wardrobe().find(w => w.slot === it.slot && w.id === it.artId);
  const owned = wearable && mine && mine.unlocked;
  const level = levelFromXp(USER && USER.xp);
  const tooLow = wearable && it.level && level < it.level;
  const wearing = wearable && USER
    && avatarConfig(USER.avatar, USER.handle || USER.name)[it.slot] === it.artId;

  openSheet(it.name, `
    ${wearable && itemArt(it.slot, it.artId)
      ? `<div class="av-wrap">${itemArt(it.slot, it.artId, 96)}</div>`
      : it.image ? `<img src="${esc(pic(it.image))}" alt=""
           style="width:100%;margin-bottom:.7rem">` : ''}
    ${it.description ? `<p class="note" style="margin-top:0">${mark(it.description)}</p>` : ''}
    ${it.slot ? `${row('Goes on', it.slot)}` : ''}
    ${it.level
      ? `${row('Unlocks at', 'Level ' + it.level, level >= it.level ? 'gold' : '')}
         ${row('You are', 'Level ' + level)}`
      : `${row('Costs', price ? price + ' credits' : 'free')}
         ${USER ? `${row('You have', credits)}` : ''}`}

    ${wearable
      ? `<button class="btn" style="margin-top:.85rem" data-do="wear"
                 data-slot="${esc(it.slot)}" data-id="${esc(it.artId)}"
                 ${!USER || tooLow || wearing ? 'disabled' : ''}>
          ${!USER ? 'Sign in first'
          : wearing ? 'Wearing it'
          : tooLow ? (it.level * 10 - (Number(USER.xp) || 0)) + ' more ticks to go'
          : owned ? 'Put it on' : 'Buy and wear it'}
        </button>
        ${tooLow ? `<p class="faint">Every topic you tick is one XP. Ten is a level.</p>` : ''}`
      : `<button class="btn" style="margin-top:.85rem" data-do="cart-add"
                 data-key="${esc(it.name)}" data-kind="shop" ${USER ? '' : 'disabled'}>
          ${!USER ? 'Sign in first' : inCart ? 'Already in your basket' : 'Add to basket'}
        </button>`}`);
});

/* PUTTING SOMETHING ON. The WHOLE look is sent, not the one change — the server re-checks every
   piece against what this person has earned, so the phone only ever has to know how to draw.
   That is the same request the wardrobe makes, which is why buying has no separate path that
   could succeed while the wearing failed. */
on('wear', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  cfg[el.dataset.slot] = el.dataset.id;
  el.disabled = true;
  el.textContent = 'Putting it on…';

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      closeSheet();
      toast((d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Wearing it');
      repaint();
    })
    .catch(err => {
      el.disabled = false;
      el.textContent = 'Try again';
      toast(String(err.message || err));
    });
});

/* ---------- THE BASKET ---------------------------------------------------------------------------
   Kept on the phone, not the server. A basket is a half-formed intention — abandoning one should
   cost nothing and leave no trace, and a row in a spreadsheet for something nobody decided on is
   a row you have to clean up later.

   It survives a refresh, because the commonest way to lose a basket is to close a tab by accident.

   TWO CURRENCIES, NEVER ADDED. Credits buy shop items; pounds pay for paper. 5 credits and £0.86
   is not 91 of anything, and a single total would be the kind of wrong that looks right until
   somebody is charged.
--------------------------------------------------------------------------------------------- */
let CART = [];
try { CART = JSON.parse(localStorage.getItem('familyCart') || '[]'); } catch {}
const cartSave = () => { try { localStorage.setItem('familyCart', JSON.stringify(CART)); } catch {} };

on('cart-add', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const key = el.dataset.key;
  const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
  /* Keyed on BOTH, because a printed copy and a shop item can share a name and they are not the
     same line. The old test dropped the second one silently. */
  if (CART.some(c => c.key === key && c.kind === kind)) { toast('Already in your basket'); return; }

  if (kind === 'print') {
    const t = topicBy(key);
    if (!t || !canPrint(t)) { toast('That one is not priced for printing'); return; }
    CART.push({ key, name: t.name, kind, cost: 0, money: printPrice(t.pages), pages: t.pages });
  } else if (kind === 'topic') {
    const t = topicBy(key);
    if (!t) return;
    CART.push({ key, name: t.name, kind, cost: 0, money: 0 });
  } else {
    const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
    if (!src) return;
    CART.push({ key, name: src.name, kind, cost: Number(src.price) || 0, money: 0 });
  }

  cartSave();
  /* NO SHEET TO CLOSE. This ran from inside the resource panel; it now runs from a tile on the
     list itself, and closing a sheet nobody opened is a line that does nothing on every add. */
  toast('In your basket — ' + CART.length + ' item' + (CART.length === 1 ? '' : 's'));
  repaint();
});

on('cart-drop', el => {
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  repaint();
  if (!CART.length) closeSheet(); else on_openCart();
});

function on_openCart() {
  const credits = USER ? (USER.credits || 0) : 0;
  const due   = CART.reduce((n, c) => n + (c.cost || 0), 0);
  const cash  = CART.reduce((n, c) => n + (c.money || 0), 0);
  const short = due > credits;

  openSheet('Your basket', CART.length ? `
    ${/* A BASKET LINE IS NOT A FACT ABOUT SOMETHING — it is a thing with a way to remove it, and the
          value holds a control rather than a number. `row` escapes its value precisely so a control
          cannot end up in one, so this is written out and that is the right way round. */''}
    ${CART.map(c => `<div class="row">
        <span class="k">${mark(c.name)}${c.kind === 'print'
          ? ` <span class="faint">printed · ${c.pages} pages</span>` : ''}</span>
        <span class="v mono">${c.money ? money(c.money) : (c.cost ? c.cost : 'free')}
          <span class="text-drop" data-do="cart-drop"
                data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</span></span>
      </div>`).join('')}

    ${/* THE CLASS IS COMPUTED — gold when you can afford it, red when you cannot. That is a
          decision about the value and belongs in the third argument, which is what it is for. */''}
    ${due ? row('Credits', due, 'big') + row('You have', credits, short ? 'bad' : '') : ''}
    ${/* LEFT AS "To pay". This one is a basket with a Send button under it — money genuinely is
          about to change hands, and "Cost" beside a thing you are buying reads as a price tag
          rather than the amount you are about to hand over. The booking card is the one that was
          wrong: it says "To pay" on things nobody has agreed to. */''}
    ${cash ? row('To pay', money(cash), 'big gold') : ''}

    <button class="btn" style="margin-top:.85rem" ${short ? 'disabled' : ''} data-do="cart-send">
      ${short ? (due - credits) + ' more credits needed'
              : cash ? 'Pay ' + money(cash) : 'Confirm'}
    </button>
    <p class="faint" style="margin-top:.5rem">${cash
      ? 'Printing is charged at cost — paper only. Collect from the library or a session.'
      : 'Nothing leaves your basket until you confirm.'}</p>`
    : '<p class="empty">Your basket is empty.</p>');
}
on('open-cart', on_openCart);

on('cart-send', () => {
  toast('Checkout is the next thing to build');
});
/* ==================================================================================================
   THE WHOLE PAPER, READ FROM THE ROWS THAT ALREADY DRAW ITS QUESTIONS.

   Nothing here is new data. `questions` has carried the stems, the leads and the parts since it was
   built, and the question cards have been drawing them one at a time. What was missing was the
   obvious thing to do with twenty rows that share a `paper_id`: put them in order and read them.
================================================================================================== */

/* One paper's rows, in printed order. Numeric on the question, alphabetical on the part — sorted as
   TEXT, Q10 falls between Q1 and Q2, which is right for a filing cabinet and wrong for a paper. */
function paperRows(t) {
  const id = t && (t.id || t.rowId);
  if (!id) return [];
  return (DATA.questions || [])
    .filter(r => r.paper === id && r.kind !== 'paper')
    .sort((a, b) => (Number(a.q) || 0) - (Number(b.q) || 0)
                 || String(a.part || '').localeCompare(String(b.part || '')));
}

/* ---------- READING A PAPER, AND THE ONE AFTER IT --------------------------------------------------
   PULLED OUT OF THE HANDLER so it can call itself. A flick inside the open sheet asks for the next
   paper, and the next paper is opened by exactly the code that opened this one — which is the only
   way the two can be guaranteed to look the same.

   ONLY PAPERS WITH QUESTIONS WRITTEN UP ARE NEIGHBOURS. Stepping onto one with nothing in it would
   land on an empty sheet with no way back except closing, so the list is filtered first and a paper
   nobody has typed up is simply not in the sequence. */
function papersWithQuestions_() {
  return (allTopics() || []).filter(t => (paperRows(t) || []).length);
}

function openPaper_(t) {
  const rows = paperRows(t);
  if (!rows.length) { toast('No questions written up for this one yet'); return; }

  let h = '', section = null, q = null, marks = 0;
  rows.forEach(r => {
    /* A SECTION HEADING WHERE THE SECTION CHANGES, not one per question. */
    if (r.section && r.section !== section) {
      section = r.section;
      h += `<h2 class="qp-sec">Section ${esc(section)}</h2>`;
    }
    if (r.q !== q) {
      q = r.q;
      h += `<h3 class="qp-q">${esc(r.q)}</h3>`;
    }
    /* THE STEM IS THE SHARED PART and prints once, above the parts that need it — which is the
       whole reason it is a row of its own rather than a copy on each part. */
    if (r.kind === 'stem') {
      h += `<div class="qsheet-stem">${r.html || ''}</div>`;
      return;
    }
    marks += Number(r.marks) || 0;
    h += `<div class="qp-part">
      ${r.part ? `<span class="qsheet-pn">(${esc(r.part)})</span>` : ''}
      <div class="qp-body">
        ${r.lead ? `<div class="qsheet-lead">${r.lead}</div>` : ''}
        ${r.html || ''}
        ${r.marks ? `<p class="qp-marks">[${esc(r.marks)} mark${
          Number(r.marks) === 1 ? '' : 's'}]</p>` : ''}
      </div>
    </div>`;
  });

  /* THE TOTAL IS ADDED UP RATHER THAN TYPED, so it cannot disagree with the questions above it. */
  /* THE NEIGHBOURS ARE WORKED OUT AT OPENING TIME, not held from when the list was drawn: the
     sheet may sit open while a refresh arrives, and a stale index would step onto the wrong paper
     or off the end. `indexOf` on the current paper is cheap and cannot go stale. */
  openSheet(t.name, `<div class="qsheet qpaper">
    <p class="qp-head">${esc([t.examBoard, waveOf(t), t.keystage].filter(Boolean).join(' · '))}
      ${marks ? ` · <b>${marks} marks</b>` : ''}</p>
    ${h}
  </div>`, null, dir => {
    const all = papersWithQuestions_();
    const at = all.findIndex(x => (x.id || x.name) === (t.id || t.name));
    const next = all[at + dir];
    /* THE ENDS ARE ENDS. Wrapping round would mean a flick at the last paper silently showing the
       first, which reads as the app losing your place rather than as running out of papers. */
    if (at === -1 || !next) return false;
    openPaper_(next);
    return true;
  });
}

on('paper-read', el => {
  const key = el.getAttribute('data-key');
  const t = (allTopics() || []).find(x => (x.id || x.name) === key);
  if (!t) { toast('That paper is not in the sheet'); return; }
  openPaper_(t);
});
