"""
THE LAST PICTURE MISSING FROM THE MAY 2017 FOUNDATION PAPER 1, AND THE ONLY ONE ON IT THAT THE
ROW'S OWN WORDS DETERMINE.

Q13 IS A SCALE DRAWING AND THE DRAWING IS THE QUESTION. "Write down an estimate for the real
height of the man" is answered from what an average man is; "find an estimate for the real height
of the tree" is answered by READING THE RATIO OFF THE PICTURE and multiplying. With no picture the
second half has nothing to read, so the transcription had written the ratio into the prose -- which
is the fault CLAUDE.md records under the AQA Biology pie chart: WHAT A FIGURE SHOWS IS NOT WHAT ITS
ANSWER IS, and a description carrying the answer turns a question into a sentence with the answer
in it. The picture carries the ratio now and the prose does not.

AND IT MOVES TO A PREAMBLE, because BOTH PARTS HANG FROM IT. Part (b) said only "Find an estimate
for the real height, in metres, of the tree" -- no tree, no man, no scale, nothing. That is the
Venn diagram of Q23 exactly, and the answer is the same one: one fact several questions hang from
belongs to the question, not to one part of it.

WHY THIS ONE IS SAFE TO DRAW AND THE OTHERS ON THIS PAPER ARE NOT. The rule is the row's own words
determining the picture, and here they do: two figures on one ground line, drawn to one scale, the
tree a little over five times the man. There is exactly one drawing that answers that. A scatter
graph summarised in a sentence is not.

THE RATIO IS ASSERTED AGAINST THE MARK SCHEME RATHER THAN EYEBALLED. The scheme takes 1.5 to 2
metres for the man and 7.5 to 12 for the tree, so the ratio it will accept is 5 to 6 -- and the
drawing has to be one where BOTH ends of the man band land inside the tree band, or a student who
measures our picture correctly is marked wrong. Measured off the drawn pixel heights, not typed
beside them.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                      # noqa: E402  the one place the scale lives

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')

PAPER = 'RS1786302107764-481'
QUESTION = '13'
STEM_ID = 'S-%s-q%s' % (PAPER, QUESTION)
PART_A = 'Q-1MA1-1706-1F-13a'

# What the mark scheme accepts, as printed beside the two answers.
MAN = (1.5, 2.0)
TREE = (7.5, 12.0)

H = 210                 # the drawing is tall rather than wide: a tree beside a man
GROUND = 194.0          # both of them stand on it
MAN_H = 31.0            # a man at this scale. Everything else is derived from him.
RATIO = 5.2             # "a little over five", and checked against the scheme below
TREE_H = MAN_H * RATIO
MAN_X = 258.0
TREE_X = 116.0

# ---- the ratio a student will measure, against the ratio the scheme will accept ----------------
assert 5.0 <= RATIO <= 6.0, RATIO
for m in MAN:
    assert TREE[0] <= m * RATIO <= TREE[1], (m, m * RATIO)

man_top = GROUND - MAN_H
tree_top = GROUND - TREE_H
assert abs((GROUND - tree_top) / (GROUND - man_top) - RATIO) < 1e-9


def man(x, foot, h):
    """A figure of height h standing with his feet at `foot`. Proportioned off h alone, so the
    scale cannot drift from the number the assertions above are about."""
    head_r = h * 0.10
    head_cy = foot - h + head_r
    neck = head_cy + head_r
    hip = foot - h * 0.45
    arm = neck + h * 0.10
    return (
        '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
        'stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
    ) % (
        x, head_cy, head_r,
        x, neck, x, hip,
        x - h * 0.19, arm, x + h * 0.19, arm,
        x, hip, x - h * 0.16, foot,
        x, hip, x + h * 0.16, foot,
    )


def tree(x, foot, h):
    """Trunk and canopy, both off h. The canopy is a closed path with a few bumps rather than a
    circle, because a lollipop reads as a diagram of a lollipop."""
    trunk_w = h * 0.075
    trunk_top = foot - h * 0.34
    top = foot - h
    half = h * 0.30
    mid = (trunk_top + top) / 2.0
    d = ' '.join([
        'M %.1f %.1f' % (x, trunk_top),
        'C %.1f %.1f %.1f %.1f %.1f %.1f' % (x - half, trunk_top, x - half, mid, x - half * 0.82, mid - h * 0.06),
        'C %.1f %.1f %.1f %.1f %.1f %.1f' % (x - half, mid - h * 0.16, x - half * 0.72, top, x - half * 0.30, top + h * 0.02),
        'C %.1f %.1f %.1f %.1f %.1f %.1f' % (x - half * 0.06, top - h * 0.03, x + half * 0.28, top - h * 0.01, x + half * 0.42, top + h * 0.05),
        'C %.1f %.1f %.1f %.1f %.1f %.1f' % (x + half * 0.86, top + h * 0.02, x + half, mid - h * 0.12, x + half * 0.80, mid - h * 0.04),
        'C %.1f %.1f %.1f %.1f %.1f %.1f' % (x + half, mid + h * 0.04, x + half * 0.66, trunk_top, x, trunk_top),
        'Z',
    ])
    return (
        '<path d="%s" fill="none" stroke="currentColor" stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
        '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
    ) % (
        d,
        x - trunk_w / 2, foot, x - trunk_w / 2, trunk_top + h * 0.02,
        x + trunk_w / 2, foot, x + trunk_w / 2, trunk_top + h * 0.02,
    )


svg = (
    '<svg viewBox="0 0 %d %d" role="img" aria-label="A tree and a man standing on the same '
    'ground line, drawn to the same scale. The tree is a little over five times the height of '
    'the man.">'
    '<line x1="14" y1="%.1f" x2="%d" y2="%.1f" stroke="currentColor" stroke-width="1.4"/>'
    '%s%s'
    '</svg>'
) % (W, H, GROUND, W - 14, GROUND, tree(TREE_X, GROUND, TREE_H), man(MAN_X, GROUND, MAN_H))

# ---- nothing may be painted outside the box check/cards.js measures ---------------------------
import re                                                                       # noqa: E402
nums = [(float(a), float(b)) for a, b in re.findall(
    r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', svg)]
assert nums, 'no coordinates found -- the guard below would pass on anything'
for x, y in nums:
    assert 0 <= x <= W and 0 <= y <= H, (x, y)

LEAD = ('<p>The diagram shows a tree and a man standing on the same ground line.<br>'
        'The man is of average height.<br>'
        'The tree and the man are drawn to the same scale.</p>')
ASK_A = '<p>Write down an estimate for the real height, in metres, of the man.</p>'

lines = open(FILE, encoding='utf-8').read().split('\n')
out, wrote_stem, fixed_a = [], 0, 0
for line in lines:
    bare = line.rstrip()
    trailing = bare.endswith(',')
    body = bare[:-1] if trailing else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(line)
        continue
    if row.get('row_id') == STEM_ID:
        raise SystemExit('%s already exists -- this script has run before' % STEM_ID)
    if row.get('row_id') == PART_A:
        template = dict(row)
        for k in ('part', 'marks', 'html', 'answer', 'answer_type', 'accept', 'figure'):
            template.pop(k, None)
        template['row_id'] = STEM_ID
        template['kind'] = 'preamble'
        template['question'] = QUESTION
        template['part'] = ''
        template['section'] = ''
        template['marks'] = ''
        template['figure'] = 'scale-drawing'
        template['html'] = LEAD
        template['diagram'] = svg
        template['diagram_by'] = 'family'
        template['sort_order'] = '1'
        out.append(json.dumps(template, ensure_ascii=False) + ',')
        wrote_stem += 1

        row.pop('figure', None)          # the picture lives on the preamble now
        row['html'] = ASK_A
        fixed_a += 1
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue
    out.append(line)

assert wrote_stem == 1 and fixed_a == 1, (wrote_stem, fixed_a)
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('%s: one preamble written, %d px tall, ratio %.2f (man %.1f, tree %.1f)'
      % (STEM_ID, H, RATIO, MAN_H, TREE_H))
print('  the scheme takes %s m for the man, so this drawing gives %.1f to %.1f m for the tree '
      '-- inside its %s m' % (MAN, MAN[0] * RATIO, MAN[1] * RATIO, TREE))
print('  %s keeps the ask and loses the description and the figure label' % PART_A)
