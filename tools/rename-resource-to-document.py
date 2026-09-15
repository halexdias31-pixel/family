# -*- coding: utf-8 -*-
"""Rename the two things the owner could not tell apart.

THERE IS NO "RESOURCE" IN THIS APP. The word is a leftover from the `resources` tab, which was
folded into `questions` and then deleted — CLAUDE.md records the whole of it. What survived the
deletion is two column names, `resource_type` and `resource_id`, naming a thing that no longer
exists, sitting beside a `questions` file. "I don't know the difference between questions and
resource" is the correct reaction to that.

AND `kind` COLLIDED WITH TWO COLUMNS AT ONCE. Its values were `paper`, `stem` and `part` — and
`paper` is also a COLUMN (which paper of the set: 1, 2 or 3) and `part` is also a COLUMN (which part
of the question: a, b, c). So `kind: 'paper'` and `paper: '1'` were different facts one word apart,
and so were `kind: 'part'` and `part: 'a'`. Both now say what they are in words nothing else here
uses.
"""
import json, re, os

ROOT = '/home/user/family'

KIND = {'paper': 'document', 'stem': 'preamble', 'part': 'question'}

# ---------- 1. THE DATA -------------------------------------------------------------------------
P = os.path.join(ROOT, 'data/questions.json')
lines = open(P).read().split('\n')
rows = [json.loads(l.rstrip(',')) for l in lines[1:] if l.strip() not in (']', '')]
moved = {'kind': 0, 'type': 0, 'id': 0}
for r in rows:
    if r.get('kind') in KIND:
        r['kind'] = KIND[r['kind']]; moved['kind'] += 1
    if 'resource_type' in r:
        r['document_type'] = r.pop('resource_type'); moved['type'] += 1
    if 'resource_id' in r:
        r['source_id'] = r.pop('resource_id'); moved['id'] += 1
# rebuild with the key order kept stable per row
out = ['['] + [json.dumps(r, ensure_ascii=False) + ',' for r in rows]
out[-1] = out[-1][:-1]
out.append(']')
open(P, 'w').write('\n'.join(out) + '\n')
print('data:', moved)

# ---------- 2. THE CODE -------------------------------------------------------------------------
# Only the places that MEAN the row kind or the column. Written as explicit pairs rather than a
# blanket replace, because `'part'` and `'paper'` appear all over this repo as ordinary English and
# as CSS tokens — `--paper`, `.qsheet-part`, "the second part of the source".
SWAPS = [
    ("r.kind !== 'stem' && r.kind !== 'paper'", "r.kind !== 'preamble' && r.kind !== 'document'"),
    ("r.kind !== 'stem'", "r.kind !== 'preamble'"),
    ("r.kind === 'stem'", "r.kind === 'preamble'"),
    ("r.kind === 'paper'", "r.kind === 'document'"),
    ("r.kind !== 'paper'", "r.kind !== 'document'"),
    ("r.kind === 'part'", "r.kind === 'question'"),
    ("r.kind !== 'part'", "r.kind !== 'question'"),
    ("x.kind === 'paper'", "x.kind === 'document'"),
    ("norm(r.kind) || 'part'", "norm(r.kind) || 'question'"),
    ("kind:          ['paper', 'part', 'stem'],", "kind:          ['document', 'preamble', 'question'],"),
    ("resourceType: libS(r.resource_type)", "documentType: libS(r.document_type)"),
    ("resourceId: libS(r.resource_id)", "sourceId: libS(r.source_id)"),
    ("r.resource_type", "r.document_type"),
    ("r.resource_id", "r.source_id"),
    ("resourceType: r.resourceType || ''", "documentType: r.documentType || ''"),
    ("x.resourceType", "x.documentType"),
    ("field: 'resourceType'", "field: 'documentType'"),
    ("'resourceType'", "'documentType'"),
    ("one_(list, 'resourceType')", "one_(list, 'documentType')"),
    ("resourceType: one_(list, 'resourceType')", "documentType: one_(list, 'documentType')"),
]

FILES = ['js/find.js', 'js/library.js', 'js/check-library.js', 'check/cards.js',
         'js/resource.js', 'js/terms.js', 'backend/doget.gs', 'backend/dopost.gs',
         'backend/core.gs', 'backend/constants.gs', 'check/ui.js', 'check/fixture.json']
hits = {}
for f in FILES:
    path = os.path.join(ROOT, f)
    if not os.path.exists(path):
        continue
    src = open(path).read()
    before = src
    for a, b in SWAPS:
        if a in src:
            hits[f] = hits.get(f, 0) + src.count(a)
            src = src.replace(a, b)
    if src != before:
        open(path, 'w').write(src)
print('code:', hits)
