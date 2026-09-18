"""Writes answers onto rows of data/questions.json, one sheet at a time.

WHY A SHARED WRITER AND NOT A COPY IN EVERY SHEET'S SCRIPT
`data/questions.json` is one object per line and the next script to append will split it on
newlines, so the file surgery has to be identical everywhere.  Two implementations of it is two
chances to write a file the next tool cannot read -- this repository's sentence about
`documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf`.

WHAT IT REFUSES
An answer for a row that is not in the file, an answer for a row that already has one, and a
sheet that claims to be finished while rows in it are still blank.  The last one is the point:
a script that answered what it understood and said nothing about the rest is this repository's
oldest fault -- I did not manage to look, reported as I looked and there was nothing there.
"""
import json
import pathlib
import re

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
TAG = re.compile('<[^>]+>')


def plain(html):
    return ' '.join(TAG.sub(' ', html or '').replace('…', ' ').split())


def rows_of(paper_id):
    rows = json.loads(FILE.read_text())
    return [r for r in rows
            if r.get('paper_id') == paper_id and r.get('kind') == 'question']


def write(paper_id, answers, figures=None, lost=None, overwrite=False):
    """`answers` is row_id -> (answer html, accept or None). `figures` is row_id -> label, for
    the rows whose question is ABOUT a picture the transcription lost: it does not invent the
    picture, it puts the row in the number check-library.js prints every run."""
    figures = figures or {}
    lost = lost or {}   # row_id -> what the TEXT LAYER dropped. A number the paper printed and
                        # the transcription did not is not a missing picture, and filing it as
                        # one would put it in a count of figures that is meant to mean something
                        # else. It gets an examiner_note instead, which is where this library
                        # already says "the transcriber could not recover this".
    lines = FILE.read_text().rstrip('\n').split('\n')
    assert lines[0] == '[' and lines[-1] == ']'

    present = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
    unknown = (set(answers) | set(figures) | set(lost)) - present
    assert not unknown, 'no such row: %r' % sorted(unknown)

    out, done, marked, blank = [], 0, 0, []
    for line in lines:
        if '"row_id"' not in line:
            out.append(line)
            continue
        row = json.loads(line.rstrip(','))
        rid, tail = row['row_id'], (',' if line.endswith(',') else '')
        touched = False
        if rid in answers:
            assert overwrite or not str(row.get('answer') or '').strip(), \
                '%s already has an answer' % rid
            ans, acc = answers[rid]
            row['answer'] = ans
            if acc is not None:
                row['accept'] = acc
            done += 1
            touched = True
        if rid in lost and not str(row.get('examiner_note') or '').strip():
            row['examiner_note'] = lost[rid]
            touched = True
        if rid in figures and not str(row.get('figure') or '').strip():
            row['figure'] = figures[rid]
            marked += 1
            touched = True
        if (row.get('paper_id') == paper_id and row.get('kind') == 'question'
                and rid not in answers and not str(row.get('answer') or '').strip()):
            blank.append(rid)
        out.append((json.dumps(row) + tail) if touched else line)

    FILE.write_text('\n'.join(out) + '\n')
    print('%s: %d answered, %d marked as needing a picture, %d still blank'
          % (paper_id, done, marked, len(blank)))
    for rid in blank:
        assert rid in figures or rid in lost, (
            '%s is blank and carries no reason. Every row this script leaves has to say why -- a '
            '`figures` label for a picture that never came across, or a `lost` note for a number '
            'the text layer dropped. Otherwise the count above is a silence.' % rid)
    return blank
