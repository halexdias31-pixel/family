/* ================= THE HYMNS SHELF (517): ONE CARD A HYMN, ITS WORDS FETCHED WHEN IT IS DRAWN ================= */
/* The owner: "database church hymns ... linked to Spotify" (517).
   data/hymns/: index when a finder paints, words in chunks when a card is drawn; never boot payload, no audio. */

const HYMNS = { index: null, asking: null, failed: false, chunks: {}, loading: {}, missed: {}, items: null, from: null };
const hymnsGet_ = file => {
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  return Promise.resolve()
    .then(() => fetch('data/hymns/' + file + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null)
    .catch(() => null);
};

/* A RELIGIOUS WORK IS FOR A VIEWER OF AGE (490), as the other writings are. */
function hymnsIndex_() {
  if (HYMNS.index) return HYMNS.index;
  if (HYMNS.asking || HYMNS.failed || typeof fetch !== 'function' || !writingFor_(WRITING_WORKS.hymns)) return null;
  HYMNS.asking = hymnsGet_('index.json').then(d => {
    const ok = !!d && Array.isArray(d.hymns) && d.hymns.every(h => h && /^HY-\d{4}$/.test(h.id) && /^w-\d{2}\.json$/.test(h.file) && h.title);
    HYMNS.asking = null;
    if (!ok) { HYMNS.failed = true; return null; }
    HYMNS.index = d;
    writingCame_('hymns');
    return d;
  });
  return null;
}

/* ---------- ONE ITEM A HYMN (520): a `writingUnit_` on the Writings shelf, its hymnal the Work, its section the Section. */
const hymnalOf_ = h => String(h.source || '').split(',')[0].trim();
function hymnsItems_() {
  const ix = HYMNS.index;
  if (!ix) return [];
  if (HYMNS.items && HYMNS.from === ix) return HYMNS.items;
  const reg = writingWork_('hymns');
  HYMNS.items = ix.hymns.map(h => writingUnit_('hymns', reg, {
    kind: 'hymn', key: 'hy:' + h.id, name: h.title, sub: h.author,
    text: [h.title, h.first, h.author, h.tune, h.tradition, h.season, h.theme, h.id].join(' '),
    w: { work: hymnalOf_(h), section: h.theme || '', unit: h.title, text: writingText_(writingTextOf_(h.language || 'English')),
         tradition: h.tradition || '', author: h.author || '', form: 'Hymn' },
    hy: h,
  }));
  HYMNS.from = ix;
  return HYMNS.items;
}

function hymnsLoad_(file) {
  if (HYMNS.chunks[file]) return Promise.resolve(HYMNS.chunks[file]);
  if (!HYMNS.loading[file]) {
    HYMNS.loading[file] = hymnsGet_(file).then(d => {
      HYMNS.loading[file] = null;
      const ok = !!d && d.file === file && d.hymns && typeof d.hymns === 'object';
      HYMNS.missed[file] = !ok;
      if (ok) HYMNS.chunks[file] = d;
      return ok ? d : null;
    });
  }
  return HYMNS.loading[file];
}

/* THE AUDIO IS SPOTIFY'S, never ours: a search for the hymn by its title and author, opened in a new tab. */
const hymnSpotify_ = h => 'https://open.spotify.com/search/' + encodeURIComponent([h.title, String(h.author || '').replace(/,? ?tr\..*$/, '')]
  .filter(s => s && s !== 'Anonymous').join(' ') + ' hymn');
function hymnsBody_(x) {
  const h = x.hy, d = HYMNS.chunks[h.file], words = d && d.hymns[h.id];
  const facts = [h.author, h.year, h.tune ? 'tune ' + h.tune + (h.meter ? ' (' + h.meter + ')' : '') : ''].filter(Boolean).join(' · ');
  const top = `<p class="hy-facts">${esc(facts)}</p>`;
  const credit = `<p class="wt-credit">${esc(h.source || '')} · ${esc(h.licence || '')}</p>`;
  if (words) return top + words.map(s => `<p class="wt-text hy-verse">${esc(s).replace(/\n/g, '<br>')}</p>`).join('') + credit;
  if (HYMNS.missed[h.file] && !HYMNS.loading[h.file]) return top + '<p class="fc-note">These words did not arrive.</p>';
  if (!HYMNS.loading[h.file]) hymnsLoad_(h.file).then(() => hymnsRedraw_(h.file));
  return top + loading_();
}
function hymnsCard_(x) {
  return `<div class="card fc hy" data-key="${esc(x.key)}">
    ${tagRow_(x)}
    <div class="hy-body" data-hy="${esc(x.hy ? x.hy.file : '')}" data-k="${esc(x.key)}">${x.hy ? hymnsBody_(x) : ''}</div>
    ${x.hy ? `<div class="tile-row">${tile_({ icon: 'play', label: 'Listen on Spotify', note: 'a search, in a new tab', href: hymnSpotify_(x.hy) })}</div>` : ''}
  </div>`;
}
/* ITS CHUNK CAME: every hymn card of that chunk on screen is filled where it stands. */
function hymnsRedraw_(file) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.hy-body[data-hy="' + file + '"]').forEach(el => {
    const x = (HYMNS.items || []).find(i => i.key === el.getAttribute('data-k'));
    if (!x) return;
    el.innerHTML = hymnsBody_(x);
    const pane = el.closest('.pane');
    if (pane && typeof paneReach_ === 'function') { try { paneReach_([pane]); } catch (e) {} }
  });
}
