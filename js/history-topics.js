/* ================= HISTORY TOPICS (owner, 16 Nov): Library › History › <topic> › Timeline, People, Sources or Items ================= */
/* One data file a topic, data/library/history/<id>.json (its list: index.json, written by tools/history-topics.js); every card is made from it here. */
/* A topic is a `histKind` answer beside Events and People; which of its four kinds is `histPart`. Each is a card on the one template (ITEM_MAPS.hist). */

const HTOP = { data: null, asking: null, failed: false, items: null, from: null };
const HTOP_DIR = 'data/library/history/';
const HTOP_PARTS = { timeline: 'Timeline', people: 'People', sources: 'Sources', items: 'Items' };

function histTopicsIndex_() {
  if (HTOP.data) return HTOP.data;
  if (HTOP.asking || HTOP.failed || typeof fetch !== 'function') return null;
  const stamp = deployStamp_();
  const get = f => Promise.resolve().then(() => fetch(HTOP_DIR + f + '.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : null).catch(() => null);
  HTOP.asking = get('index').then(ids => Promise.all((Array.isArray(ids) ? ids : []).filter(id => /^[a-z0-9-]+$/.test(String(id))).map(get))).then(all => {
    HTOP.asking = null;
    const d = (all || []).filter(t => t && t.id && t.name && t.timeline);
    if (!d.length) { HTOP.failed = true; return null; }
    HTOP.data = d;
    if (typeof lateCame_ === 'function') lateCame_();
    return d;
  });
  return null;
}

/* A TOPIC'S TIMELINE IS EVENTS (owner, 16 Nov): its `timeline` names a data/timelines.json row; the events are data/timeline.json's, never a copy. */
function htopEvents_(t) {
  const ex = (typeof LIBRARY_EXTRA !== 'undefined' && LIBRARY_EXTRA) || {};
  const tl = (ex.timelines || []).find(x => x && x.id === t.timeline);
  const by = new Map((ex.timeline || []).map(e => [e.id, e]));
  return tl ? (tl.events || []).map(r => by.get(r.id)).filter(Boolean) : [];
}
/* A YEAR OR A SPAN AS SAID; `about` marks a year known only roughly. */
const htopYears_ = (a, b, about) => (a ? (about ? 'c. ' : '') + a : '?') + (b ? '–' + b : '');

/* ONE ITEM A CARD: the topic's whole timeline is one card; each person, source and item is one. */
function histTopicItems_() {
  const d = HTOP.data;
  if (!d) return [];
  if (HTOP.items && HTOP.from === d) return HTOP.items;
  const list = [];
  d.forEach(t => {
    const one = (part, r, name, words) => list.push({
      kind: 'hist', key: 'hist:' + t.id + ':' + (part === 'timeline' ? 'timeline' : part + ':' + r.id), name, subject: 'History', image: '', row: null,
      level: t.level || '', keystage: t.keystage || '', histKind: t.name, histPart: HTOP_PARTS[part],
      text: [t.name, t.title, name].concat(words).filter(Boolean).join(' '),
      hist: { id: t.id + '-' + (r.id || part), name, part, topic: t, row: r, topicName: t.name, partName: HTOP_PARTS[part] },
    });
    one('timeline', { id: 'timeline' }, t.title + ': timeline', htopEvents_(t).map(e => e.date_from + ' ' + e.name));
    (t.people || []).forEach(r => one('people', r, r.name, [r.role].concat(r.facts || [])));
    (t.sources || []).forEach(r => one('sources', r, r.name, [r.type, r.text]));
    (t.items || []).forEach(r => one('items', r, r.name, r.facts || []));
  });
  HTOP.items = list; HTOP.from = d;
  return list;
}

/* WHERE A PICTURE CAME FROM, under it: who made it and its licence, linked to its page. */
const htopCredit_ = p => (p && p.credit ? [{ type: 'text', look: 'htop-credit', text: ['Picture: ', { link: p.credit + ' · ' + (p.licence || ''), href: p.page || '', act: 'file-view', look: 'link' }] }] : []);
const htopLink_ = (u, say) => (u ? [{ type: 'text', look: 'htop-link', text: [{ link: say, href: u, act: 'file-view', look: 'link' }] }] : []);

/* THE BODY OF EACH KIND (ITEM_MAPS.hist): no worked examples, only what happened, who, and what survives. */
function histTopicBody_(h) {
  const t = h.topic || {}, r = h.row || {};
  if (h.part === 'timeline') return [{ type: 'text', text: t.summary || '' },
    { type: 'timeline', label: t.title, events: htopEvents_(t).map(e => ({ when: htopYears_(e.date_from, e.date_to !== e.date_from ? e.date_to : ''), title: e.name, text: e.summary })) }];
  if (h.part === 'people') return [{ type: 'list', items: [{ label: 'Lived', value: htopYears_(r.born, r.died, r.about) }, { label: 'Who', value: r.role || '' },
    r.fate ? { label: 'What happened', value: r.fate } : null].filter(Boolean) }, { type: 'list', items: r.facts || [] }].concat(htopCredit_(r.pic));
  if (h.part === 'sources') return [{ type: 'list', items: [{ label: 'Kind', value: r.type || '' }, r.date ? { label: 'Made', value: r.date } : null].filter(Boolean) },
    { type: 'text', text: r.text || '' }].concat(r.quote ? [{ type: 'text', look: 'htop-quote', text: '“' + r.quote + '”' }] : [],
    htopLink_(r.url, r.type === 'Video' ? 'Watch on the BBC' : 'Read the full text'), htopCredit_(r.pic));
  return [{ type: 'list', items: [{ label: 'When', value: r.date || '' }] }, { type: 'list', items: r.facts || [] }]
    .concat(htopLink_(r.url, 'Find out more'), htopCredit_(r.pic));
}
/* ITS PICTURE: a portrait, painting or photo, hot-linked from Wikimedia Commons with its credit in the body. */
const histTopicPic_ = h => (h && h.row && h.row.pic && h.row.pic.src ? { src: h.row.pic.src, alt: h.name, look: 'kc-pan' } : null);
