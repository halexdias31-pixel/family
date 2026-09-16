# -*- coding: utf-8 -*-
"""The date a paper was sat, and the total it is out of.

TWO COLUMNS, AND THE FIRST ONE IS HOW A PERSON NAMES A PAPER. "Thursday 25 May 2017, Paper 1
Higher" is how it was asked for, and the library held `year: 2017`, `month: 5` and nothing finer —
so the one thing a tutor and a student both say out loud was the one thing that could not be
matched on.

IT IS ALSO THE FIELD THAT SETTLES THE OPEN QUESTION IN CLAUDE.md. Two ©2021 sets of Higher papers
sit unidentified because Edexcel took the date off the front page in 2021, and the note there says
the empty document rows' `source_url`s carry the real dates (`1MA1_1H_que_20211103.pdf`). There has
been nowhere to PUT that answer once somebody works it out. Now there is.
"""
import json, datetime

P = '/home/user/family/data/questions.json'

# What was asked for, and it is right: 1 May 2017 was a Monday, so the 25th is a Thursday.
DATES = {
    'P-1MA1-1705-1H': '2017-05-25',
}

def main():
    lines = open(P).read().split('\n')
    rows = [json.loads(l.rstrip(',')) for l in lines[1:] if l.strip() not in (']', '')]

    dated = 0
    for r in rows:
        d = DATES.get(r.get('paper_id'))
        if not d:
            continue
        y, m, day = (int(x) for x in d.split('-'))
        # the date has to agree with what the row already says, or one of the two is wrong
        assert str(r.get('year')) == str(y), (r['row_id'], r.get('year'), y)
        assert str(r.get('month')) == str(m), (r['row_id'], r.get('month'), m)
        datetime.date(y, m, day)                      # refuses 31 February before it is written
        r['exam_date'] = d
        dated += 1

    # ---------- AND THE TOTAL, ON EVERY PAPER THE QUALIFICATION DEFINES ------------------------
    # `total_marks` was added so a paper states its own total rather than a check knowing about one
    # board. 104 Edexcel GCSE maths documents were still leaning on the default predicate — true,
    # and true only for as long as nobody edits that predicate again. It is written down now.
    totals = 0
    for r in rows:
        if r.get('kind') != 'document':
            continue
        if not (r.get('exam_board') == 'Edexcel' and r.get('subject') == 'Maths'
                and r.get('key_stage') == 'KS4' and r.get('document_type') == 'Past paper'
                and r.get('tier') in ('Higher', 'Foundation')):
            continue
        if r.get('total_marks'):
            continue
        r['total_marks'] = '80'
        totals += 1

    out = ['['] + [json.dumps(r, ensure_ascii=False) + ',' for r in rows]
    out[-1] = out[-1][:-1]
    out.append(']')
    open(P, 'w').write('\n'.join(out) + '\n')
    print('exam_date set on', dated, 'row(s); total_marks set on', totals, 'paper(s)')

main()
