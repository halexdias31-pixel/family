# -*- coding: utf-8 -*-
"""Every AQA GCSE English Language (8700) sitting the library names, given its questions.

WHAT WAS THERE. Measured before writing a line: **37 document rows for this qualification and ten
questions across all of them** — the two June 2023 papers, five each. Thirty-four of the rest are
`R0xxx` stubs carrying a name, `active: False`, and nothing else. The series are already named in
the data, which is the whole reason this could be done at all: I did not have to decide which
sittings exist, only to fill the ones somebody had already listed.

THE DRIVE FOLDER COULD NOT BE OPENED. `curl` to drive.google.com answers
`CONNECT tunnel failed, response 403` — every Google host is blocked from this environment by
network policy, which CLAUDE.md records in four other places. So none of the real question wording,
none of the sources and none of the mark schemes' indicative content could be read.

SO WHAT IS WRITTEN IS THE PART THAT IS NOT IN THE PAPER'S TEXT: the SHAPE. AQA 8700 is a fixed
specification and every series has the same skeleton —

  Paper 1  Section A  Q1  4   AO1   list four things
                      Q2  8   AO2   language in a named extract
                      Q3  8   AO2   structure of the whole source
                      Q4 20   AO4   evaluate a statement about the second part
           Section B  Q5 40   AO5 24 + AO6 16   descriptive or narrative

  Paper 2  Section A  Q1  4   AO1   four true statements
                      Q2  8   AO1   summarise the differences
                      Q3 12   AO2   language in Source B
                      Q4 16   AO3   compare the writers' attitudes
           Section B  Q5 40   AO5 24 + AO6 16   viewpoint writing

BOTH SUM TO 80, and that is not decoration — `check-library.js` refuses a paper that does not sum
to its own stated `total_marks`, which is the only end-to-end check this library has. A skeleton
that is wrong about the marks fails the build rather than teaching somebody the wrong weighting.

AND THE LEVELS ARE THE HALF THAT DOES NOT DEPEND ON THE SOURCE. CLAUDE.md already says this, in
the section the June 2023 transcription is recorded under: "AQA English is marked in LEVELS against
assessment objectives, not in points against a worked answer, so the bands for 'how does the writer
use language, 8 marks' are the same every series — and they are the thing a student most needs to
see. The indicative content is the half that depends on the insert, and that is said rather than
invented." Every `answer` here is bands and assessment objectives, and says outright that the
indicative content is missing.

EVERY ROW WHOSE WORDING DEPENDS ON THE PAPER IS `placeholder: True`, drawn in a dashed box by
`.qsheet-stem.is-standin`, counted by `check-library.js` on every run and listed by name. That is
the mechanism this repository already built for exactly this, and it is why a skeleton can be
committed without becoming a question somebody is taught wrongly: it is visibly a form waiting for
its paper, not a paper.
"""
import json, io, re

PAPER1 = [
    dict(q='1', marks=4, section='Section A: Reading', kind_of='short', ao='AO1',
         lead='The first part of the source.',
         html='<p>Read again the first part of the source.</p>'
              '<p>List <b>four</b> things from this part of the source about '
              '<span class="gap">[the subject the paper names]</span>.</p>',
         answer='<p><b>AO1 — identify and interpret (4 marks)</b></p>'
                '<p>One mark for each acceptable point, to a maximum of four. The points must come '
                'from the lines the question names; a point from outside them scores nothing however '
                'true it is. Quotation is not required and paraphrase is accepted.</p>'),
    dict(q='2', marks=8, section='Section A: Reading', kind_of='explain', ao='AO2',
         lead='A short extract the question names, from the middle of the source.',
         html='<p>Look in detail at the extract from '
              '<span class="gap">[the lines the paper names]</span> of the source.</p>'
              '<p>How does the writer use language here to describe '
              '<span class="gap">[what the paper asks about]</span>?</p>'
              '<p>You could include the writer’s choice of: words and phrases; language features '
              'and techniques; sentence forms.</p>',
         answer='<p><b>AO2 — language (8 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive, detailed</b> (7–8 marks)</li>'
                '<li><b>Level 3 — Clear, relevant</b> (5–6 marks)</li>'
                '<li><b>Level 2 — Some understanding and comment</b> (3–4 marks)</li>'
                '<li><b>Level 1 — Simple, limited</b> (1–2 marks)</li></ol>'
                '<p class="faint">The question names words and phrases, language features and '
                'sentence forms. A response that identifies a device without saying what it does '
                'stays in Level 2.</p>'),
    dict(q='3', marks=8, section='Section A: Reading', kind_of='explain', ao='AO2',
         lead='The whole of the source.',
         html='<p>You now need to think about the <b>whole</b> of the source.</p>'
              '<p>This text is from '
              '<span class="gap">[where in a longer text the paper says it comes from]</span>.</p>'
              '<p>How has the writer structured the text to interest you as a reader?</p>'
              '<p>You could write about: what the writer focuses your attention on at the beginning; '
              'how and why the focus changes as the source develops; any other structural features '
              'that interest you.</p>',
         answer='<p><b>AO2 — structure (8 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive, detailed</b> (7–8 marks)</li>'
                '<li><b>Level 3 — Clear, relevant</b> (5–6 marks)</li>'
                '<li><b>Level 2 — Some understanding and comment</b> (3–4 marks)</li>'
                '<li><b>Level 1 — Simple, limited</b> (1–2 marks)</li></ol>'
                '<p class="faint">Structure, not language. Beginnings, shifts of focus, and the '
                'order things are revealed in. Writing about word choice here scores under AO2 for '
                'the wrong question and is the commonest way this one is lost.</p>'),
    dict(q='4', marks=20, section='Section A: Reading', kind_of='explain', ao='AO4',
         lead='The second part of the source.',
         html='<p>Focus this part of your answer on the second part of the source, from '
              '<span class="gap">[the line the paper names]</span> to the end.</p>'
              '<p>A student said: “<span class="gap">[the statement the paper gives]</span>”</p>'
              '<p>To what extent do you agree?</p>'
              '<p>In your response you could: write about your own impressions; evaluate how the '
              'writer has created those impressions; support your opinion with references to the text.</p>',
         answer='<p><b>AO4 — evaluate (20 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive, detailed evaluation</b> (16–20 marks)</li>'
                '<li><b>Level 3 — Clear, relevant evaluation</b> (11–15 marks)</li>'
                '<li><b>Level 2 — Some evaluation</b> (6–10 marks)</li>'
                '<li><b>Level 1 — Simple, limited evaluation</b> (1–5 marks)</li></ol>'
                '<p class="faint">The mark is for EVALUATING the statement, not for describing what '
                'happens. Agreement or disagreement both score; an answer that never addresses the '
                'statement cannot get past Level 2 however good the analysis is.</p>'),
    dict(q='5', marks=40, section='Section B: Writing', kind_of='written', ao='AO5/AO6',
         lead='',
         html='<p>You are going to enter a creative writing competition.</p>'
              '<p><b>Either</b> Write a description suggested by this picture: '
              '<span class="gap">[the photograph the paper prints]</span></p>'
              '<p><b>Or</b> Write a story '
              '<span class="gap">[the title or opening the paper gives]</span>.</p>'
              '<p>(24 marks for content and organisation, 16 marks for technical accuracy.)</p>',
         answer='<p><b>AO5 — content and organisation (24 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Compelling, convincing</b> (19–24 marks)</li>'
                '<li><b>Level 3 — Consistent, clear</b> (13–18 marks)</li>'
                '<li><b>Level 2 — Some successful communication</b> (7–12 marks)</li>'
                '<li><b>Level 1 — Simple, limited</b> (1–6 marks)</li></ol>'
                '<p><b>AO6 — technical accuracy (16 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4</b> (13–16 marks)</li><li><b>Level 3</b> (9–12 marks)</li>'
                '<li><b>Level 2</b> (5–8 marks)</li><li><b>Level 1</b> (1–4 marks)</li></ol>'
                '<p class="faint">Sixteen of the forty marks are sentence demarcation, punctuation, '
                'spelling and vocabulary. That is two fifths of the biggest question on the paper '
                'and the half students most often leave no time for.</p>'),
]

PAPER2 = [
    dict(q='1', marks=4, section='Section A: Reading', kind_of='short', ao='AO1',
         lead='The first part of Source A.',
         html='<p>Read again the first part of <b>Source A</b>, from '
              '<span class="gap">[the lines the paper names]</span>.</p>'
              '<p>Choose <b>four</b> statements below which are <b>true</b>.</p>'
              '<p><span class="gap">[the eight statements the paper prints]</span></p>',
         answer='<p><b>AO1 — identify and interpret (4 marks)</b></p>'
                '<p>One mark for each correct statement shaded, to a maximum of four. Shading more '
                'than four scores nothing for the extra ones and AQA marks only the first four '
                'shaded, so a fifth guess can cost a mark that was already earned.</p>'),
    dict(q='2', marks=8, section='Section A: Reading', kind_of='explain', ao='AO1',
         lead='Source A and Source B together.',
         html='<p>You need to refer to <b>Source A</b> and <b>Source B</b> for this question.</p>'
              '<p>Use details from <b>both</b> sources. Write a summary of the differences between '
              '<span class="gap">[what the paper asks you to compare]</span>.</p>',
         answer='<p><b>AO1 — synthesise and summarise (8 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive summary</b> (7–8 marks)</li>'
                '<li><b>Level 3 — Clear summary</b> (5–6 marks)</li>'
                '<li><b>Level 2 — Some summary</b> (3–4 marks)</li>'
                '<li><b>Level 1 — Simple, limited summary</b> (1–2 marks)</li></ol>'
                '<p class="faint">DIFFERENCES, and from BOTH sources. An answer that summarises one '
                'source and then the other without ever putting them against each other is Level 2 '
                'at best. This is not the language question — no marks for analysing method.</p>'),
    dict(q='3', marks=12, section='Section A: Reading', kind_of='explain', ao='AO2',
         lead='Source B only.',
         html='<p>You now need to refer <b>only</b> to <b>Source B</b>.</p>'
              '<p>How does the writer use language to '
              '<span class="gap">[what the paper asks about]</span>?</p>',
         answer='<p><b>AO2 — language (12 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive, detailed</b> (10–12 marks)</li>'
                '<li><b>Level 3 — Clear, relevant</b> (7–9 marks)</li>'
                '<li><b>Level 2 — Some understanding and comment</b> (4–6 marks)</li>'
                '<li><b>Level 1 — Simple, limited</b> (1–3 marks)</li></ol>'
                '<p class="faint">Twelve marks here against eight for the same skill on Paper 1, and '
                'ONE source only. Referring to Source A wastes the time the extra four marks are for.</p>'),
    dict(q='4', marks=16, section='Section A: Reading', kind_of='explain', ao='AO3',
         lead='The whole of Source A with the whole of Source B.',
         html='<p>For this question, you need to refer to the <b>whole of Source A</b> together with '
              '<b>Source B</b>.</p>'
              '<p>Compare how the two writers convey their different '
              '<span class="gap">[views or feelings the paper names]</span>.</p>'
              '<p>In your answer, you could: compare their different attitudes; compare the methods '
              'they use to convey them; support your response with references to both texts.</p>',
         answer='<p><b>AO3 — compare across texts (16 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Perceptive, detailed comparison</b> (13–16 marks)</li>'
                '<li><b>Level 3 — Clear, relevant comparison</b> (9–12 marks)</li>'
                '<li><b>Level 2 — Some comparison</b> (5–8 marks)</li>'
                '<li><b>Level 1 — Simple, limited comparison</b> (1–4 marks)</li></ol>'
                '<p class="faint">Attitudes AND methods, across BOTH texts. The single commonest loss '
                'is writing about the two texts one after the other: without comparison the answer '
                'cannot leave Level 2, whatever the quality of each half.</p>'),
    dict(q='5', marks=40, section='Section B: Writing', kind_of='written', ao='AO5/AO6',
         lead='',
         html='<p>“<span class="gap">[the statement the paper gives]</span>”</p>'
              '<p>Write <span class="gap">[the form the paper asks for — a letter, an article, a '
              'speech or an essay]</span> in which you explain your point of view on this statement.</p>'
              '<p>(24 marks for content and organisation, 16 marks for technical accuracy.)</p>',
         answer='<p><b>AO5 — content and organisation (24 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4 — Compelling, convincing</b> (19–24 marks)</li>'
                '<li><b>Level 3 — Consistent, clear</b> (13–18 marks)</li>'
                '<li><b>Level 2 — Some successful communication</b> (7–12 marks)</li>'
                '<li><b>Level 1 — Simple, limited</b> (1–6 marks)</li></ol>'
                '<p><b>AO6 — technical accuracy (16 marks)</b></p>'
                '<ol class="levels" reversed>'
                '<li><b>Level 4</b> (13–16 marks)</li><li><b>Level 3</b> (9–12 marks)</li>'
                '<li><b>Level 2</b> (5–8 marks)</li><li><b>Level 1</b> (1–4 marks)</li></ol>'
                '<p class="faint">The FORM is assessed: a letter that never addresses anybody, or a '
                'speech with no audience, loses marks under AO5 that no amount of good argument gets '
                'back. Match register to the form the paper names.</p>'),
]

INSERT = {
    1: '<h4>Insert — Source A</h4>'
       '<p><i>One literary source, printed in a separate Insert booklet: an extract from a novel or '
       'a short story, with numbered lines. Questions 1 to 4 all refer to it.</i></p>'
       '<p class="faint"><b>Placeholder.</b> The source text is not reproduced here — AQA prints '
       'it in a separate Insert booklet and the extracts are third-party copyright. Paste the real '
       'text over this one row and every question below it has it.</p>',
    2: '<h4>Insert — Source A and Source B</h4>'
       '<p><i>Two non-fiction sources from different centuries, printed in a separate Insert booklet, '
       'on a shared subject. Source A is the twenty-first-century one and Source B the older. '
       'Questions 1 to 4 refer to them.</i></p>'
       '<p class="faint"><b>Placeholder.</b> The source texts are not reproduced here — AQA prints '
       'them in a separate Insert booklet and the extracts are third-party copyright. Paste the real '
       'texts over this one row and every question below it has them.</p>',
}

TITLE = {1: 'Paper 1: Explorations in Creative Reading and Writing',
         2: "Paper 2: Writers' Viewpoints and Perspectives"}
ENG = re.compile(r'Explorations in creative reading|Writers.{0,3} viewpoints|8700', re.I)

path = 'data/questions.json'
lines = io.open(path, encoding='utf-8').read().split('\n')
rows = [json.loads(l.rstrip().rstrip(',')) for l in lines if l.rstrip().rstrip(',').startswith('{')]

qcount = {}
for r in rows:
    if r.get('kind') == 'question':
        qcount[r.get('paper_id')] = qcount.get(r.get('paper_id'), 0) + 1


def sitting(d):
    n = str(d.get('name') or '')
    p = re.search(r'Paper (\d)', n)
    m = re.search(r'(June|November)\s+((?:19|20)\d{2})', n)
    return (int(p.group(1)), m.group(1), m.group(2)) if p and m else None


docs = [r for r in rows if r.get('kind') == 'document'
        and ENG.search(str(r.get('name') or '') + str(r.get('spec_code') or ''))]

# ONE ROW PER SITTING. A row that already has questions wins outright; otherwise the lowest
# paper_id, so the choice is stable across runs and does not depend on the file's order.
canon, extra = {}, []
for d in sorted(docs, key=lambda x: str(x.get('paper_id'))):
    k = sitting(d)
    if not k:
        continue
    if k not in canon or (qcount.get(d['paper_id'], 0) > qcount.get(canon[k]['paper_id'], 0)):
        if k in canon:
            extra.append(canon[k]['paper_id'])
        canon[k] = d
    else:
        extra.append(d['paper_id'])

todo = {k: d for k, d in canon.items() if not qcount.get(d['paper_id'], 0)}
print('sittings named: %d   already transcribed: %d   filling: %d   duplicate rows left inactive: %d'
      % (len(canon), len(canon) - len(todo), len(todo), len(extra)))

new_rows = []
inserts = [0]
for (pnum, month_word, year), d in sorted(todo.items(), key=lambda kv: (kv[0][0], kv[0][2], kv[0][1])):
    pid = d['paper_id']
    base = {
        'paper_id': pid, 'active': 'True',
        'name': '%s — %s %s' % (TITLE[pnum], month_word, year),
        'subject': 'English Language', 'key_stage': 'KS4',
        'band_type': 'stage', 'band_value': 'GCSE',
        'company': 'AQA', 'exam_board': 'AQA',
        'year': year, 'month': '6' if month_word == 'June' else '11',
        'exam_wave': 'First wave' if month_word == 'June' else 'Second wave',
        'level': 'GCSE', 'paper': str(pnum),
        'spec_code': '8700-0%d-01' % pnum, 'document_type': 'Past paper',
        'needs_print': 'True',
    }
    d.update(base)
    d['kind'] = 'document'
    d['total_marks'] = '80'
    d['row_id'] = d.get('row_id') or ('D-' + pid)

    # A PAPER THAT ALREADY HAS ITS INSERT KEEPS IT. Caught by `check-library.js` on the first run,
    # which refused a duplicate `row_id` — June 2025 Paper 1 already carries a REAL insert, typed in
    # by hand from the paper, and the first version of this script wrote a placeholder over it. That
    # is the worst thing a generator can do: replace something somebody typed with a form.
    if not any(r.get('kind') == 'preamble' and r.get('paper_id') == pid for r in rows):
        pre = dict(base)
        pre.update({'row_id': 'S-%s-A' % pid, 'kind': 'preamble',
                    'section': 'Section A: Reading', 'html': INSERT[pnum], 'placeholder': 'True'})
        new_rows.append(pre)
        inserts[0] += 1

    for spec in (PAPER1 if pnum == 1 else PAPER2):
        q = dict(base)
        q.update({'row_id': 'Q-%s-%s' % (pid, spec['q']), 'question': spec['q'], 'kind': 'question',
                  'section': spec['section'], 'marks': str(spec['marks']),
                  'lead': spec['lead'], 'html': spec['html'], 'answer': spec['answer'],
                  'answer_type': spec['kind_of'], 'placeholder': 'True'})
        new_rows.append(q)

    total = sum(s['marks'] for s in (PAPER1 if pnum == 1 else PAPER2))
    assert total == 80, '%s sums to %d, not 80' % (pid, total)

rows.extend(new_rows)
body = ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows)
io.open(path, 'w', encoding='utf-8').write('[\n' + body + '\n]')
print('wrote %d rows (%d papers x 5 questions + %d inserts; %d paper(s) already had one)'
      % (len(new_rows), len(todo), inserts[0], len(todo) - inserts[0]))
