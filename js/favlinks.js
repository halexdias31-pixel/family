/* @family. — favlinks.js FAVOURITE LINKS, A TOOL (509). Ten links a person keeps on their account; the payload carries the viewer's own as
   `DATA.favLinks` (doGet's fresh half), and a change posts the whole list (`favLinksSave`). */

/* THE SAME RULE AS THE BACKEND'S `favUrlOk_`: http or https with a host, no spaces or quotes, so javascript: and data: never get in. */
function favUrlOk_(u) {
  const v = String(u == null ? '' : u).trim();
  if (!v || v.length > 2000 || /[\s\u0000-\u001f\u007f<>"`]/.test(v)) return '';
  const m = /^(https?):\/\/([^\/?#@\s]+@)?([a-z0-9.-]+|\[[0-9a-f:]+\])(:\d{1,5})?([\/?#].*)?$/i.exec(v);
  if (!m || !/[a-z0-9]/i.test(m[3]) || /^[.-]|[.-]$/.test(m[3])) return '';
  return v;
}
const FAV_MAX_ = 10;
const favHost_ = u => String(u).replace(/^https?:\/\//i, '').split(/[\/?#]/)[0].replace(/^[^@]*@/, '');
const favList_ = () => (typeof DATA === 'object' && DATA && Array.isArray(DATA.favLinks) ? DATA.favLinks : [])
  .filter(x => x && favUrlOk_(x.url)).slice(0, FAV_MAX_);
let FAV_SAID_ = '';
let FAV_BUSY_ = false;

function favDraw_(into) {
  if (!into) return;
  if (!USER) { into.innerHTML = `<p class="note">Sign in and your favourite links are kept here.</p>`; return; }
  if (typeof awaiting_ === 'function' && awaiting_() && !(DATA && Array.isArray(DATA.favLinks))) { into.innerHTML = loading_(); return; }
  /* WHAT IS HALF TYPED IN THE ADD ROW STAYS through a redraw — the list changes under it, not the boxes. */
  const keepT = (into.querySelector('[data-fav="title"]') || {}).value || '';
  const keepU = (into.querySelector('[data-fav="url"]') || {}).value || '';
  const list = favList_();
  const rows = list.map((l, i) => { const httpUrl = favUrlOk_(l.url); return `<div class="fav-row">
      <a class="fav-a" href="${esc(httpUrl)}" target="_blank" rel="noopener noreferrer">${esc(l.title || favHost_(l.url))}<span class="fav-host">${esc(favHost_(l.url))}</span></a>
      <div class="tile-row fav-tiles">${
        tile_({ icon: 'up', label: 'Move up', act: 'fav-move', data: { i: i, by: -1 }, off: !i || FAV_BUSY_ })
      }${tile_({ icon: 'down', label: 'Move down', act: 'fav-move', data: { i: i, by: 1 }, off: i === list.length - 1 || FAV_BUSY_ })
      }${tile_({ icon: 'bin', label: 'Remove', note: l.title, act: 'fav-del', data: { i: i }, off: FAV_BUSY_ })}</div>
    </div>`; }).join('');
  const full = list.length >= FAV_MAX_;
  into.innerHTML = `<div class="fav">
    ${rows || '<p class="note">No links yet. Add the sites you use most.</p>'}
    ${full ? `<p class="note">That is ${FAV_MAX_} — remove one to add another.</p>` : `<div class="fav-new">
      <label class="fav-line"><span>Title</span><input data-fav="title" maxlength="80" placeholder="e.g. BBC Bitesize" autocomplete="off"></label>
      <label class="fav-line"><span>Address</span><input data-fav="url" type="url" inputmode="url" maxlength="2000" placeholder="https://…" autocomplete="off"></label>
      <div class="tile-row">${tile_({ icon: 'plus', label: 'Add link', act: 'fav-add', off: FAV_BUSY_ })}</div>
    </div>`}
    <p class="faint fav-said">${esc(FAV_SAID_ || (list.length + ' of ' + FAV_MAX_))}</p>
  </div>`;
  const t = into.querySelector('[data-fav="title"]'), u = into.querySelector('[data-fav="url"]');
  if (t) t.value = keepT;
  if (u) u.value = keepU;
}
function initFavLinks_() { favRedraw_(true); }
/* EVERY COPY (Tools', and Saved's if starred) — but not one somebody is typing in, unless it is the one that asked. */
function favRedraw_(force) {
  document.querySelectorAll('[id="fav-box"]').forEach(into => {
    if (force === true || !into.contains(document.activeElement)) favDraw_(into);
  });
}

/* THE WHOLE LIST GOES, and the server's answer is what is drawn; a refusal puts the old list back and says why. */
function favSave_(next, said) {
  const was = favList_();
  DATA.favLinks = next;
  FAV_BUSY_ = true; FAV_SAID_ = 'Saving…';
  favRedraw_(true);
  const done = d => {
    FAV_BUSY_ = false;
    if (d && d.success && Array.isArray(d.links)) { DATA.favLinks = d.links; FAV_SAID_ = said; }
    else { DATA.favLinks = was; FAV_SAID_ = (d && (d.message || d.error)) || 'Could not save — try again in a moment.'; }
    favRedraw_(true);
  };
  api({ action: 'favLinksSave', personId: USER.personId, links: next }).then(done, () => done(null));
}

on('fav-add', el => {
  const box = el.closest('.fav');
  if (!box || !USER || FAV_BUSY_) return;
  const tIn = box.querySelector('[data-fav="title"]'), uIn = box.querySelector('[data-fav="url"]');
  let raw = String((uIn && uIn.value) || '').trim();
  /* A BARE ADDRESS ("bbc.co.uk") IS MEANT AS A WEB ONE; anything with its own scheme is judged as typed. */
  if (raw && !/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = 'https://' + raw;
  const url = favUrlOk_(raw);
  const list = favList_();
  if (!url) { FAV_SAID_ = 'That is not a web address — it must start https:// or http://.'; favRedraw_(true); return; }
  if (list.length >= FAV_MAX_) { FAV_SAID_ = FAV_MAX_ + ' links at most — remove one first.'; favRedraw_(true); return; }
  const title = String((tIn && tIn.value) || '').trim().slice(0, 80) || favHost_(url);
  if (tIn) tIn.value = '';
  if (uIn) uIn.value = '';
  favSave_(list.concat([{ title: title, url: url }]), 'Added.');
});
on('fav-del', el => {
  if (!USER || FAV_BUSY_) return;
  const i = Number(el.dataset.i), list = favList_();
  if (!(i >= 0 && i < list.length)) return;
  favSave_(list.filter((_, k) => k !== i), 'Removed.');
});
on('fav-move', el => {
  if (!USER || FAV_BUSY_) return;
  const i = Number(el.dataset.i), j = i + Number(el.dataset.by), list = favList_().slice();
  if (!(i >= 0 && j >= 0 && i < list.length && j < list.length)) return;
  const x = list[i]; list[i] = list[j]; list[j] = x;
  favSave_(list, 'Moved.');
});
