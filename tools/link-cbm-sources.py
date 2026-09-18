"""Puts a source_url on every Corbettmaths worksheet that has one in Drive.

ALL 69 OF THEM HAD NONE. A document row's URL is the point of the row -- it is what a tutor opens
to print the sheet -- and every Corbettmaths document in this library was missing it while the PDF
sat in the owner's Drive, shared `anyone: reader`. That is this repository's oldest shape again: a
thing that exists and that nothing points at.

THE MATCH IS BY NAME AND IT REFUSES TO GUESS. A Drive title is slugged, a document's own `name` is
slugged, and a row is linked only on an exact match against exactly one file. Everything else is
printed -- the sheets with no PDF, and the PDFs no sheet claims -- because a link to the wrong
worksheet is worse than no link: it prints the wrong homework.
"""
import json
import pathlib
import re

HERE = pathlib.Path(__file__).parent
FILE = HERE.parent / 'data' / 'questions.json'
INDEX = json.loads((HERE / 'data' / 'corbettmaths-drive.json').read_text())
INDEX.pop('_why', None)

# The handful of Drive titles that are not the sheet's name. Each is a real difference, not a
# typo: `fdp` is the file's abbreviation, `reverse-fractions` is what the publisher calls the
# sheet this library files as "finding the original amount".
ALIAS = {
    'fdp': 'fractions-decimals-and-percentages',
    'words': 'words-and-figures',
    'reverse-fractions': 'fractions-finding-the-original-amount',
    'equivalent-fractions': 'equivalent-fractions-simplifying-fractions',
    'top-heavy-mixed-numbers': 'top-heavy-fractions-mixed-numbers',
    'volume-of-a-cuboid': 'volume-of-a-cube-volume-of-a-cuboid',
    'types-of-angles': 'types-of-angle',
    'measuring-drawing-angles': 'angles-measuring-drawing',
    'parallel-perpendicular': 'parallel-lines-perpendicular-lines',
    '2-d-shapes': '2d-shapes',
    'multiplying-dividing-10-100-1000': 'multiplying-and-dividing-by-10-100-1000-etc',
    'times tables': 'times-tables',
}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', str(s).lower()).strip('-')


BY_SLUG = {}
for title, fid in INDEX.items():
    key = slug(ALIAS.get(title, title))
    BY_SLUG.setdefault(key, []).append((title, fid))

lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'

out, linked, already, unmatched, claimed = [], [], [], [], set()
for line in lines:
    if '"row_id"' not in line:
        out.append(line)
        continue
    row = json.loads(line.rstrip(','))
    if row.get('kind') != 'document' or row.get('company') != 'Corbettmaths':
        out.append(line)
        continue
    if str(row.get('source_url') or '').strip():
        already.append(row['paper_id'])
        out.append(line)
        continue
    hits = BY_SLUG.get(slug(row.get('name')), [])
    if len(hits) != 1:
        unmatched.append('%s (%r)' % (row['paper_id'], row.get('name')))
        out.append(line)
        continue
    title, fid = hits[0]
    claimed.add(title)
    row['source_url'] = 'https://drive.google.com/file/d/%s/view' % fid
    linked.append(row['paper_id'])
    out.append(json.dumps(row) + (',' if line.endswith(',') else ''))

FILE.write_text('\n'.join(out) + '\n')
print('linked %d, already had one %d, no match %d' % (len(linked), len(already), len(unmatched)))
for u in unmatched:
    print('  no PDF in the index for %s' % u)
spare = sorted(set(INDEX) - claimed - {t for t, _ in
                                       [h for hs in BY_SLUG.values() for h in hs]
                                       if t in claimed})
for t in sorted(set(INDEX) - claimed):
    print('  PDF no sheet claims: %s' % t)
