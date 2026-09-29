"""Shared shape for the Corbettmaths 5-a-day Foundation books (June to December).

ONE MODULE PER MONTH (`F_06.py` … `F_12.py`) holds that month's transcription as `q(...)` and
`pre(...)` calls, and `write.py` turns every month into rows and writes `data/questions.json` once.
Months were transcribed in parallel, and a month module never touches the library file itself —
seven writers on one file is seven merge conflicts.

THE SHAPE FOLLOWS tools/insert-cbm-5ad-jan-FP.py, which is the argument for all of it: a 5-a-day is
its own `document_type`, ONE DOCUMENT ROW PER DAY because a day is the thing somebody sits, five
question rows under it, a table recovered as a real <table>, a picture that carries data described
in words AND given a `figure` label so check-library.js counts it, and every answer worked out from
the transcribed question — Corbettmaths prints no answers in these books. An answer that cannot be
derived exactly is left for a person to mark rather than guessed (see NO_SCHEME).

NO exam_board, year, month, exam_wave, exam_date, paper OR total_marks, for the reasons that file
gives: Corbettmaths is not a board, a 5-a-day has no sitting, and nothing states a total.
"""
import json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TIER = 'Foundation'
MONTHS = {6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November',
          12: 'December'}
NO_SCHEME = ('Corbettmaths publishes no mark scheme with the 5-a-day sheets, and this answer cannot'
             ' be derived exactly, so it is left for a person to mark.')

def T(head, body):
    """A printed table recovered into real markup — not a missing picture."""
    return ('<table><tr>' + ''.join('<th>%s</th>' % h for h in head) + '</tr>'
            + ''.join('<tr>' + ''.join('<td>%s</td>' % c for c in r) + '</tr>' for r in body)
            + '</table>')

def _topic_names():
    names = set()
    for t in json.load(open(ROOT / 'data' / 'topics.json')):
        names.add(t['label'].strip().lower())
        for a in str(t.get('aliases') or '').split(','):
            if a.strip(): names.add(a.strip().lower())
    return names

class Month:
    """Collects one month. `q` is one row of the page's table; `pre` is a stem several parts share."""
    def __init__(self, mm, file_id):
        self.mm, self.file_id = mm, file_id
        self.Q, self.P = [], []

    def q(self, day, pos, question, part, answer_type, topics, figure, html,
          answer='', accept='', note=''):
        self.Q.append(dict(day=day, pos=pos, question=str(question), part=part,
                           answer_type=answer_type, topics=topics, figure=figure, html=html,
                           answer=answer, accept=accept, note=note))

    def pre(self, day, question, figure, html, note=''):
        self.P.append(dict(day=day, question=str(question), figure=figure, html=html, note=note))

    def pid(self, day):
        return 'P-CBM-5AD-F-%02d%02d' % (self.mm, day)

    def rows(self):
        src = 'https://drive.google.com/file/d/%s/view' % self.file_id
        base = dict(subject='Maths', document_type='5-a-day', tier=TIER, company='Corbettmaths',
                    key_stage='KS4', band_type='stage', band_value='GCSE', level='GCSE',
                    active='True', source_url=src)
        names = _topic_names()
        days = sorted({x['day'] for x in self.Q})
        out = []
        for d in days:
            pid = self.pid(d)
            name = '5-a-day Foundation — %d %s' % (d, MONTHS[self.mm])
            out.append(dict(row_id='D-' + pid, paper_id=pid, kind='document', name=name, **base))
            for p in [p for p in self.P if p['day'] == d]:
                r = dict(row_id='Q-CBM-5AD-F-%02d%02d-pre%s' % (self.mm, d, p['question']),
                         paper_id=pid, question=p['question'], kind='preamble', html=p['html'],
                         name=name, **base)
                if p['figure']: r['figure'] = p['figure']
                if p['note']: r['examiner_note'] = p['note']
                out.append(r)
            for x in sorted([x for x in self.Q if x['day'] == d], key=lambda x: x['pos']):
                for t in x['topics'].split(','):
                    assert t.strip().lower() in names, '%s day %d: topic %r is not in data/topics.json' % (MONTHS[self.mm], d, t)
                r = dict(row_id='Q-CBM-5AD-F-%02d%02d-%d' % (self.mm, d, x['pos']), paper_id=pid,
                         question=x['question'], kind='question', html=x['html'],
                         answer_type=x['answer_type'], topics=x['topics'], name=name, **base)
                if x['part']: r['part'] = x['part']
                if x['figure']: r['figure'] = x['figure']
                if x['answer']: r['answer'] = x['answer']
                if x['accept']: r['accept'] = x['accept']
                if x['note']: r['examiner_note'] = x['note']
                out.append(r)
        return out
