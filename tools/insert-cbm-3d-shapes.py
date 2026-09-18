"""The Corbettmaths `3D Shapes` worksheet — the one topic in the Drive folder with no sheet.

MEASURED RATHER THAN ASSUMED, because seven other PDFs in that folder look unclaimed and are not.
`angles-in-polygons`, `ordering-fractions`, `reflections`, `similar-shapes` and `translations` all
have a sheet in the library under a `W-1CM-` id, and `area-of-squares-and-rectangles` and
`adding-decimals` under `P-1CMP-`. The question that settles whether those are the SAME sheet
mis-attributed is whether any of them points at a Corbettmaths PDF: none does, checked against
tools/data/corbettmaths-drive.json across every document row. Two publishers make a sheet on
reflections and the library holds one of each.

EULER'S FORMULA IS THE CHECK. Every count on this sheet satisfies V - E + F = 2, so the faces,
edges and vertices written into the answers are asserted against it rather than recalled -- and it
is what identifies Chloe's and Edward's shapes in questions 7 and 8, which give three numbers and
no picture at all.
"""
import json
import pathlib

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-3d-shapes'
SOURCE = 'https://drive.google.com/file/d/1V5_k8vidoLpD58_mHmnFdaUGcsP1TO5a/view'

BASE = {
    'active': 'True', 'name': '3D Shapes', 'subject': 'Maths', 'key_stage': 'KS1, KS2',
    'band_type': 'year', 'band_value': '2', 'company': 'Corbettmaths',
    'document_type': 'Worksheet',
}

# name -> (faces, edges, vertices). Every one is checked against Euler below.
SOLID = {
    'cube': (6, 12, 8),
    'cuboid': (6, 12, 8),
    'triangular prism': (5, 9, 6),
    'pentagonal prism': (7, 15, 10),
    'square-based pyramid': (5, 8, 5),
    'pentagonal pyramid': (6, 10, 6),
}
for name, (f, e, v) in SOLID.items():
    assert v - e + f == 2, '%s fails Euler: %d - %d + %d' % (name, v, e, f)

Q = []


def q(n, html, answer, accept, topics, figure=None):
    Q.append({'n': n, 'html': html, 'answer': answer, 'accept': accept, 'topics': topics,
              'figure': figure})


q(1, '<p>The names of six 3-D shapes are given below.</p><p>Cube &nbsp; Sphere &nbsp; Triangular '
     'Prism &nbsp; Cuboid &nbsp; Cylinder &nbsp; Cone</p><p>Three of them are drawn below, labelled '
     'A, B and C. What is the name of shape A? What is the name of shape B? What is the name of '
     'shape C?</p>',
  'Match each drawing to one of the six names. The three that are drawn are printed on the paper, '
  'so this one needs the sheet in front of you &mdash; but the six names are the whole list, and '
  'each has one tell: a sphere has no flat face at all, a cone has one flat face and a point, a '
  'cylinder has two circles and a curve, a cube has six squares, a cuboid six rectangles, and a '
  'triangular prism two triangles and three rectangles.', None, '3-D Shapes', 'shapes')
f, e, v = SOLID['cube']
q(2, '<p>Here is a cube.</p><p>How many faces does a cube have? How many edges does a cube have? '
     'How many vertices does a cube have?</p>',
  '<b>%d faces</b>, <b>%d edges</b> and <b>%d vertices</b> &mdash; six squares, twelve edges where '
  'two squares meet, and eight corners. A vertex is a CORNER and an edge is a LINE; counting the '
  'corners when the question says edges is the commonest slip on this sheet.' % (f, e, v), None,
  '3-D Shapes')
f, e, v = SOLID['triangular prism']
q(3, '<p>Here is a triangular prism.</p><p>How many faces does a triangular prism have? How many '
     'edges does a triangular prism have? How many vertices does a triangular prism have?</p>',
  '<b>%d faces</b>, <b>%d edges</b> and <b>%d vertices</b> &mdash; two triangles at the ends and '
  'three rectangles round the middle; three edges on each triangle and three joining them; and '
  'three corners at each end.' % (f, e, v), None, '3-D Shapes')
q(4, '<p>Here is a 3-D shape. What is the name of this 3-D shape?</p>',
  'Name it from what the drawing shows: count the flat faces and look at their shapes. The shape '
  'is printed on the paper, so this question needs the sheet.', None, '3-D Shapes', 'shapes')
q(5, '<p>Here is a pentagonal prism. How many faces does a pentagonal prism have?</p>',
  '<b>%d faces</b> &mdash; two pentagons at the ends and one rectangle for each of the pentagon\'s '
  'five sides, so 2 + 5. Every prism works that way: two ends plus one face per side.'
  % SOLID['pentagonal prism'][0], '7', '3-D Shapes')
more = [n for n in ('square-based pyramid', 'triangular prism', 'cuboid', 'pentagonal pyramid')
        if SOLID[n][2] > SOLID[n][0]]
assert more == ['triangular prism', 'cuboid'], more
q(6, '<p>Here are some 3-D shapes. Tick each shape that has <b>more vertices than faces</b>.</p>'
     '<p>Square-based pyramid &nbsp; Triangular prism &nbsp; Cuboid &nbsp; Pentagonal pyramid</p>',
  '<b>Triangular prism</b> (6 vertices, 5 faces) and <b>cuboid</b> (8 vertices, 6 faces) &mdash; '
  'the two that are NOT ticked are both pyramids, and a pyramid always has the same number of each: '
  'a square-based pyramid has 5 and 5, a pentagonal pyramid 6 and 6, because every face round the '
  'side meets one corner of the base.', 'triangular prism, cuboid', '3-D Shapes', 'boxes')
chloe = [n for n, c in SOLID.items() if c == (5, 8, 5)]
assert chloe == ['square-based pyramid'], chloe
q(7, '<p>Chloe has drawn a 3-D shape. Her shape has 5 vertices. It has 8 edges. It has 5 faces. '
     'What 3-D shape has Chloe drawn?</p>',
  '<b>A square-based pyramid</b> &mdash; the square base has 4 corners and the apex is the fifth; '
  'four edges round the base and four up to the point make 8; and the base plus four triangles make '
  '5 faces. The check is Euler\'s: 5 &minus; 8 + 5 = 2, which every solid of this kind satisfies.',
  'square-based pyramid', '3-D Shapes')
edward = [n for n, c in SOLID.items() if c == (5, 9, 6)]
assert edward == ['triangular prism'], edward
q(8, '<p>Edward has drawn a 3-D shape. His shape has 6 vertices. It has 9 edges. It has 5 faces. '
     'What 3-D shape has Edward drawn?</p>',
  '<b>A triangular prism</b> &mdash; the same 5 faces as Chloe\'s shape but one more vertex and one '
  'more edge, which is exactly question 3 read backwards. 6 &minus; 9 + 5 = 2 again.',
  'triangular prism', '3-D Shapes')

assert [r['n'] for r in Q] == list(range(1, 9))
for r in Q:
    assert ',' not in r['topics'], 'a comma in a topic name is a second topic: %r' % r['topics']
    assert '&' not in r['topics'].replace(' & ', ''), 'a topic carries an entity: %r' % r['topics']

doc = dict(BASE)
doc.update({'row_id': 'D-' + PAPER, 'paper_id': PAPER, 'kind': 'document', 'source_url': SOURCE})
rows = [doc]
for r in Q:
    row = {'row_id': 'Q-CBM-3d-shapes-%d' % r['n'], 'paper_id': PAPER, 'question': str(r['n']),
           'kind': 'question'}
    if r['figure']:
        row['figure'] = r['figure']
    row['html'] = r['html']
    row['answer_type'] = 'calculation'
    row['needs_print'] = 'False'
    row.update(BASE)
    row['topics'] = r['topics']
    row['answer'] = r['answer']
    if r['accept']:
        row['accept'] = r['accept']
    rows.append(row)

lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)
lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
FILE.write_text('\n'.join(lines) + '\n')
print('%s: %d questions, %d rows, %d lack the picture they are about'
      % (PAPER, len(Q), len(rows), sum(1 for r in Q if r['figure'] == 'shapes')))
