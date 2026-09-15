# -*- coding: utf-8 -*-
"""AQA GCSE English Language 8700, June 2023 — the insert, the mark schemes, and the paper's total.

The two papers were already transcribed and both already sum to 80. What was missing is everything
a person actually teaches FROM: the source text the reading questions are about, and the levels the
answers are marked against.
"""
import json

P = '/home/user/family/data/questions.json'

PAPER1 = 'P-AQA-8700-2306-1'
PAPER2 = 'P-AQA-8700-2306-2'

# ---------- THE INSERT, AS A PLACEHOLDER SOMEBODY CAN REPLACE IN ONE ROW ------------------------
# AQA does not print the sources in the question paper: they are a separate Insert booklet, and the
# extracts are third-party copyright. So the text is not recoverable from the paper and is not
# reproducible here either — what goes in is a description accurate enough to teach around, marked
# as a placeholder so it is impossible to mistake for the real thing.
NOTE = ('<p class="faint"><b>Placeholder.</b> The source text is not reproduced here — AQA prints '
        'it in a separate Insert booklet and the extracts are third-party copyright. Paste the '
        'real text over this one row and every question below it has it.</p>')

INSERT1 = (
  '<h4>Insert — Source A</h4>'
  '<p><i>An extract from the middle of a twentieth-century novel. The narrator describes a spotted '
  'hyena at close quarters: first what it looks like, then what it does. The extract runs to about '
  'forty numbered lines.</i></p>'
  '<p><b>Lines 1–6</b> introduce the animal and what is known about it.<br>'
  '<b>Lines 10–19</b> describe its appearance in detail.<br>'
  '<b>Line 20 to the end</b> turns to its behaviour, which is where the tension is.</p>'
  + NOTE)

INSERT2 = (
  '<h4>Insert — Source A</h4>'
  '<p><i>Twenty-first-century non-fiction. A writer nearing the end of a long train journey; the '
  'account turns to a crash. Lines 1–7 set the scene, lines 12–23 describe the crash.</i></p>'
  '<h4>Insert — Source B</h4>'
  '<p><i>Nineteenth-century non-fiction. A different writer on a train journey of their own, '
  'written in the register of its period. The pairing is what questions 2 and 4 are about: the '
  'two accounts are of the same activity a century and a half apart.</i></p>'
  + NOTE)

# ---------- THE MARK SCHEME -----------------------------------------------------------------------
# AQA English is marked in LEVELS against assessment objectives, not in points against a worked
# answer — so the mark scheme for one of these questions is the same every series, and is the thing
# a student most needs to see. The indicative content is the part that changes with the source, and
# that is said rather than invented.
INDICATIVE = ('<p class="faint">Indicative content depends on the source, which is in the Insert — '
              'see the placeholder above.</p>')

def levels(ao, bands):
    rows = ''.join('<li><b>Level %d — %s</b> (%s marks)</li>' % (n, name, marks)
                   for n, name, marks in bands)
    return '<p><b>%s</b></p><ol class="levels" reversed>%s</ol>' % (ao, rows)

WRITING = (
  levels('AO5 — content and organisation (24 marks)',
         [(4, 'Compelling, convincing', '19–24'), (3, 'Consistent, clear', '13–18'),
          (2, 'Some successful', '7–12'), (1, 'Simple, limited', '1–6')])
  + levels('AO6 — technical accuracy (16 marks)',
           [(4, 'Consistently accurate, ambitious vocabulary', '13–16'),
            (3, 'Generally accurate, varied sentences', '9–12'),
            (2, 'Some accuracy, some variety', '5–8'),
            (1, 'Occasional accuracy, simple range', '1–4')])
  + '<p class="faint">The two objectives are marked separately and added. A response that is off '
    'the task earns nothing for AO5 and can still earn AO6.</p>')

FOUR = [(4, 'Perceptive, detailed', ''), (3, 'Clear, relevant', ''),
        (2, 'Some understanding and comment', ''), (1, 'Simple, limited', '')]

def four(ao, b4, b3, b2, b1):
    return levels(ao, [(4, 'Perceptive, detailed', b4), (3, 'Clear, relevant', b3),
                       (2, 'Some understanding and comment', b2), (1, 'Simple, limited', b1)])

SCHEME = {
  (PAPER1, '1'): '<p><b>AO1 — identify and interpret explicit information (4 marks)</b></p>'
                 '<p>One mark for each acceptable point, to a maximum of four. Points must come '
                 'from lines 1 to 6 only; a correct fact from elsewhere in the source earns '
                 'nothing. A quotation counts if it carries the point.</p>' + INDICATIVE,
  (PAPER1, '2'): four('AO2 — language (8 marks)', '7–8', '5–6', '3–4', '1–2')
                 + '<p class="faint">The question names words and phrases, language features and '
                   'sentence forms. A response that identifies a device without saying what it '
                   'does stays in Level 2.</p>' + INDICATIVE,
  (PAPER1, '3'): four('AO2 — structure (8 marks)', '7–8', '5–6', '3–4', '1–2')
                 + '<p class="faint">Structure means the whole source: where it begins, where the '
                   'focus shifts, how it ends. Analysing one paragraph’s language here is the '
                   'commonest way to lose the marks.</p>' + INDICATIVE,
  (PAPER1, '4'): levels('AO4 — evaluate critically (20 marks)',
                        [(4, 'Perceptive, detailed evaluation', '16–20'),
                         (3, 'Clear, relevant evaluation', '11–15'),
                         (2, 'Some evaluation', '6–10'),
                         (1, 'Simple, limited evaluation', '1–5')])
                 + '<p class="faint">The student’s statement is the thing being evaluated. '
                   'Agreement is not required; a response that only describes what happens, '
                   'without judging how well it is done, stays in Level 2.</p>' + INDICATIVE,
  (PAPER1, '5'): WRITING,

  (PAPER2, '1'): '<p><b>AO1 — identify and interpret explicit information (4 marks)</b></p>'
                 '<p>One mark for each of the four correct statements shaded. No marks are lost '
                 'for shading more than four, but only the first four shaded are marked.</p>'
                 + INDICATIVE,
  (PAPER2, '2'): four('AO1 — synthesis and summary (8 marks)', '7–8', '5–6', '3–4', '1–2')
                 + '<p class="faint">Differences, not two descriptions side by side. A response '
                   'that summarises each source in turn without connecting them stays in Level 2.</p>'
                 + INDICATIVE,
  (PAPER2, '3'): four('AO2 — language (12 marks)', '10–12', '7–9', '4–6', '1–3')
                 + '<p class="faint">Source A only, and only lines 12 to 23. Material from Source '
                   'B or from outside those lines earns nothing.</p>' + INDICATIVE,
  (PAPER2, '4'): levels('AO3 — compare writers’ ideas and perspectives (16 marks)',
                        [(4, 'Perceptive, detailed comparison', '13–16'),
                         (3, 'Clear, relevant comparison', '9–12'),
                         (2, 'Some comparison', '5–8'),
                         (1, 'Simple, limited comparison', '1–4')])
                 + '<p class="faint">Attitudes and how they are conveyed — both halves are '
                   'required. Comparing only the subject matter, or only the methods, caps the '
                   'response at Level 2.</p>' + INDICATIVE,
  (PAPER2, '5'): WRITING,
}

# The sentence that was repeated in five leads. It is a fact about the INSERT, not about any one
# question, and it is on the insert row now.
REPEAT = ('The source text is in the separate Insert booklet and is third-party copyright, so it '
          'is linked rather than reproduced.')

def main():
    lines = open(P).read().split('\n')
    rows = [json.loads(l.rstrip(',')) for l in lines[1:] if l.strip() not in (']', '')]
    ids = {r['row_id'] for r in rows}

    changed = {'answers': 0, 'leads': 0, 'type': 0, 'sitting': 0, 'total': 0}
    for r in rows:
        pid = r.get('paper_id')
        if pid not in (PAPER1, PAPER2):
            continue

        if r.get('kind') == 'paper':
            assert 'total_marks' not in r
            r['total_marks'] = '80'
            changed['total'] += 1

        # the sitting, so these join the funnel's Sitting and Year questions like every other paper
        if not r.get('month'):
            r['month'] = '6'; r['exam_wave'] = 'First wave'; r['level'] = 'GCSE'
            r['paper'] = pid[-1]
            changed['sitting'] += 1

        if r.get('kind') != 'part':
            continue

        # the insert sentence, said once on the insert instead of five times in five leads
        if r.get('lead') and REPEAT in r['lead']:
            r['lead'] = r['lead'].replace(REPEAT, '').strip()
            if not r['lead']:
                del r['lead']
            changed['leads'] += 1

        if (pid, r.get('question')) in SCHEME:
            assert not r.get('answer'), r['row_id']
            r['answer'] = SCHEME[(pid, r['question'])]
            changed['answers'] += 1

        # "choose four true statements" is not a calculation
        if r['row_id'] == 'Q-AQA-8700-2306-2-1':
            r['answer_type'] = 'short'; changed['type'] += 1

    # ---------- THE INSERT, ONE ROW PER SECTION ---------------------------------------------------
    def stem(pid, html, n):
        model = next(x for x in rows if x['paper_id'] == pid and x['kind'] == 'part')
        row = {k: v for k, v in model.items()
               if k in ('paper_id', 'active', 'name', 'subject', 'resource_type', 'key_stage',
                        'band_type', 'band_value', 'company', 'exam_board', 'year', 'level',
                        'month', 'exam_wave', 'paper', 'needs_print')}
        row['row_id'] = 'S-' + pid + '-A'
        row['kind'] = 'stem'
        row['section'] = 'Section A: Reading'
        row['html'] = html
        row['placeholder'] = 'True'
        assert row['row_id'] not in ids, row['row_id']
        ids.add(row['row_id'])
        return row

    new = [stem(PAPER1, INSERT1, 1), stem(PAPER2, INSERT2, 2)]
    # placed just before the first part of their paper, so a diff reads in printed order
    out = []
    put = set()
    for r in rows:
        pid = r.get('paper_id')
        if pid in (PAPER1, PAPER2) and r.get('kind') == 'part' and pid not in put:
            out.append(next(s for s in new if s['paper_id'] == pid))
            put.add(pid)
        out.append(r)
    assert len(put) == 2

    assert len(out) == len(rows) + 2
    assert len({r['row_id'] for r in out}) == len(out)
    body = ['['] + [json.dumps(r, ensure_ascii=False) + ',' for r in out]
    body[-1] = body[-1][:-1]
    body.append(']')
    open(P, 'w').write('\n'.join(body) + '\n')
    print('wrote', len(out), 'rows;', changed, '; inserts added: 2')

main()
