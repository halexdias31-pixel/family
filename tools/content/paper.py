"""A paper's transcription helper: one past paper as rows, for the content pipeline's `spec` stage (tools/content.js).

A paper's words are private (docs/library.md), so a module that holds them may live beside the PDFs, outside the
repository; it imports this, and `node tools/content.js <module.py>` runs it. Nothing here knows a board: the card
fields (board, subject, level, band) come from the paper's family in data/settings/content.json, at the `card` stage.

    P = Paper(code='1MA1-1805-1F', paper_id='P-1MA1-1805-1F', pdf='/…/qp.pdf', name='Paper 1 (Non-calculator) — May 2018',
              year='2018', month='5', paper='1', tier='Foundation', exam_date='2018-05-24', needs='No calculator',
              spec_code='1MA1/1F', total_marks='80')
    P.stem('7', '<p>…</p>', fig=P.fig(4, (140, 100, 460, 165), 'A probability scale …'), figure='scale', topics='…')
    P.q('7a', 1, 'calculation', 'Basic Probability', '<p>…</p>', '<b>D</b> &mdash; B1. …', acc='D')
    ROWS = P.rows()

`q` takes the part's id after the question number ('7a', '24ai', '1'), its marks, its answer_type, its
topics, its html and the scheme's answer; keywords: acc (accept), mw (mark_words), lead, fig (an SVG from
`fig`), figure (the figure's kind), choices/right/ends, cells, draw (draw_answer), note (examiner_note),
print_ (needs_print), uses (the part whose drawing this one reads), verified (default True: read against the official mark scheme).
"""
import json
import re

from pdf_figure import figure as _figure

ORDER = ['row_id', 'paper_id', 'question', 'part', 'kind', 'marks', 'figure', 'answer_type', 'needs_print',
         'active', 'name', 'subject', 'key_stage', 'band_type', 'band_value', 'tier', 'source_url',
         'trackable', 'printable', 'company', 'exam_board', 'exam_wave', 'year', 'topics', 'level', 'paper',
         'month', 'document_type', 'source_id', 'exam_date', 'uses', 'diagram_by', 'verified', 'lib_pending',
         'html', 'lead', 'diagram', 'answer', 'accept', 'mark_words', 'choices', 'choice_right', 'order_ends',
         'cells', 'draw_answer', 'examiner_note']


class Paper:
    def __init__(self, code, paper_id, pdf, name, year, month, paper, exam_date, needs='', tier='',
                 wave='First wave', source_url=None, spec_code='', total_marks='', row_prefix=None):
        self.code, self.pdf = code, pdf
        self.meta = dict(paper_id=paper_id, name=name, tier=tier, exam_wave=wave, year=year, paper=paper, month=month,
                         source_id=paper_id)
        if source_url:
            self.meta['source_url'] = source_url
        self.doc = dict(exam_date=exam_date, needs=needs, spec_code=spec_code, total_marks=str(total_marks))
        self.rows_ = []
        self.pfx = row_prefix or 'Q-%s-' % code

    def fig(self, page, clip, label, **kw):
        return _figure(self.pdf, page, clip, label, **kw)

    def _split(self, qid):
        m = re.match(r'^(\d+)([a-z]*)$', qid)
        assert m, qid
        return m.group(1), m.group(2)

    def stem(self, q, html, fig=None, figure='', topics='', lead=None, note=None, rid=None):
        r = dict(row_id=rid or self.pfx + q, question=q, kind='preamble', active='True', html=html)
        if topics:
            r['topics'] = topics
        if fig:
            r['diagram'], r['diagram_by'], r['figure'] = fig, 'family', figure or 'diagram'
            if '<!--fig-->' not in html:
                r['html'] = html + '<!--fig-->'
        if lead:
            r['lead'] = lead
        if note:
            r['examiner_note'] = note
        self.rows_.append(r)

    def q(self, qid, marks, atype, topics, html, answer, acc=None, mw=None, lead=None, fig=None,
          figure='', choices=None, right=None, ends=None, cells=None, draw=None, note=None,
          print_=False, verified=True, uses=None):
        q, part = self._split(qid)
        r = dict(row_id=self.pfx + qid, question=q, part=part, kind='question', marks=str(marks),
                 answer_type=atype, needs_print='True' if print_ else 'False', active='True', topics=topics,
                 html=html, answer=answer)
        if not part:
            del r['part']
        if verified:
            r['verified'] = 'True'
        if uses:
            r['uses'] = uses
        if acc is not None:
            r['accept'] = acc
        if mw:
            r['mark_words'] = mw
        if lead:
            r['lead'] = lead
        if fig:
            r['diagram'], r['diagram_by'], r['figure'] = fig, 'family', figure or 'diagram'
            if '<!--fig-->' not in html and '<!--fig-->' not in (lead or ''):
                r['html'] = '<!--fig-->' + html
        elif figure:
            r['figure'] = figure
        if choices:
            r['choices'], r['choice_right'] = choices, right
            if ends:
                r['order_ends'] = ends
        if cells:
            r['cells'] = cells
        if draw:
            r['draw_answer'] = draw if isinstance(draw, str) else json.dumps(draw, separators=(',', ':'))
        if note:
            r['examiner_note'] = note
        self.rows_.append(r)

    def rows(self):
        """The document row, then every stem and part, each carrying the paper's own meta (a new card is lib_pending)."""
        out = [dict(self.meta, **{k: v for k, v in self.doc.items() if v}, row_id='D-' + self.meta['paper_id'],
                    kind='document')]
        for r in self.rows_:
            full = dict(self.meta)
            full.update(r)
            full['lib_pending'] = 'True'
            out.append({k: full[k] for k in ORDER if k in full and full[k] not in (None, '')}
                       | {k: v for k, v in full.items() if k not in ORDER})
        for r in out:
            for k in [k for k, v in r.items() if v in (None, '')]:
                del r[k]
        return out
