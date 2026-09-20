"""
THE QUIZ WRITER, AND WHAT IT REFUSES.

ASKED FOR AS "a quiz for each level of each topic ... just a quiz so less pressure. sort of like a
recap thing." So these are not exam questions: they are short recall, marked the moment you answer,
with one line saying WHY underneath. The library's 745 science questions cannot do this job and the
measurement is why -- every one of them has an empty `accept`, because an exam answer is marked
against a scheme by a person. A quiz that cannot mark itself is a worksheet.

EVERY RULE HERE IS A FAULT THIS REPOSITORY HAS ALREADY PAID FOR:

  * THE ANSWER MUST BE ONE OF THE CHOICES, character for character. A multiple-choice question
    whose answer is not on the list marks every attempt wrong, and reads as the student being
    wrong rather than the row being broken -- which is the failure CLAUDE.md calls the worse of
    the two.
  * NO TWO CHOICES THE SAME, because two right answers is a question with no right answer.
  * A TYPED QUESTION MUST SAY WHAT IT ACCEPTS. `markAnswer_` splits on `|`, so every spelling a
    student will really write is listed -- this is the fraction-slash lesson in a new column.
  * THE TOPIC MUST BE ONE `data/topics.json` KNOWS, exactly. The practicals' own note records a
    topic that read perfectly and joined ONE question; a quiz filed under a name the tree has
    never heard of is found by nobody.
  * NO COMMA IN A TOPIC NAME. `topics` is a comma-list read by `asList_`, so a comma is a second
    topic. Recorded in CLAUDE.md, and an assertion rather than a thing to remember.
  * CHOICES ARE PIPE-SEPARATED for the same reason the practicals' equipment is: "sodium chloride,
    dissolved in water" is one choice and no comma rule can tell it from two.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'data', 'quizzes.json')
TOPICS = os.path.join(HERE, 'data', 'topics.json')

LEVELS = {'KS3': '', 'GCSE-F': 'Foundation', 'GCSE-H': 'Higher'}
LEVEL_NAME = {'KS3': 'KS3', 'GCSE-F': 'GCSE', 'GCSE-H': 'GCSE'}
SHOWN = {'KS3': 'KS3', 'GCSE-F': 'GCSE Foundation', 'GCSE-H': 'GCSE Higher'}


def known_topics():
    """THE TREE'S OWN LABELS AND ALIASES, read rather than copied. A second list of topic names
    here would be the two-vocabularies fault this repository records four times."""
    ok = set()
    for line in open(TOPICS, encoding='utf-8'):
        line = line.strip().rstrip(',')
        if not line.startswith('{'):
            continue
        r = json.loads(line)
        if r.get('label'):
            ok.add(r['label'])
        for a in str(r.get('aliases') or '').split(','):
            if a.strip():
                ok.add(a.strip())
    return ok


KNOWN = known_topics()
ROWS = []


def quiz(subject, topic, level, asks):
    """ONE QUIZ: a subject, a topic the tree knows, a level, and its questions."""
    assert level in LEVELS, level
    assert ',' not in topic, 'a comma in a topic name is a second topic: ' + topic
    assert topic in KNOWN, 'no such topic in data/topics.json: ' + topic
    slug = re.sub(r'[^a-z0-9]+', '-', topic.lower()).strip('-')
    qid = 'QZ-' + subject[:3].upper() + '-' + slug + '-' + level
    seen = set()
    for i, a in enumerate(asks, 1):
        ask = a['ask'].strip()
        assert ask and ask not in seen, 'a quiz asking the same thing twice: ' + ask
        seen.add(ask)
        row = {
            'quiz_id': qid, 'n': str(i),
            'subject': subject, 'topic': topic,
            'level': LEVEL_NAME[level], 'tier': LEVELS[level],
            'name': topic + ' — ' + SHOWN[level],
            'ask': ask, 'why': a['why'].strip(),
        }
        if 'choices' in a:
            ch = a['choices']
            assert len(ch) >= 3, 'fewer than three choices is not a choice: ' + ask
            assert len(set(ch)) == len(ch), 'the same choice twice: ' + ask
            assert a['answer'] in ch, 'the answer is not one of the choices: ' + ask
            assert not any('|' in c for c in ch), 'a pipe inside a choice: ' + ask
            row['kind'] = 'choice'
            row['choices'] = '|'.join(ch)
            row['answer'] = a['answer']
            row['accept'] = ''
        else:
            assert a.get('accept'), 'a typed question with nothing it accepts: ' + ask
            row['kind'] = 'typed'
            row['choices'] = ''
            row['answer'] = a['answer']
            row['accept'] = a['accept']
        assert row['why'], 'every question says why: ' + ask
        ROWS.append(row)


def write():
    ids = {}
    for r in ROWS:
        k = r['quiz_id'] + '#' + r['n']
        assert k not in ids, 'two questions with one id: ' + k
        ids[k] = 1
    quizzes = sorted({r['quiz_id'] for r in ROWS})
    # ONE OBJECT PER LINE, for the reason data/questions.json has it: the next script to
    # append by splitting on newlines, and a diff that names the rows that changed.
    body = ',\n'.join(json.dumps(r, ensure_ascii=False) for r in ROWS)
    open(OUT, 'w', encoding='utf-8').write('[\n' + body + '\n]\n')
    per = {}
    for r in ROWS:
        per[r['quiz_id']] = per.get(r['quiz_id'], 0) + 1
    print('%d quizzes, %d questions (%s each)'
          % (len(quizzes), len(ROWS), '/'.join(sorted({str(v) for v in per.values()}))))
    choice = sum(1 for r in ROWS if r['kind'] == 'choice')
    print('  %d multiple choice, %d typed' % (choice, len(ROWS) - choice))
    per_sub = {}
    for r in ROWS:
        per_sub.setdefault(r['subject'], set()).add(r['quiz_id'])
    for k in sorted(per_sub):
        print('  %-10s %d quizzes' % (k, len(per_sub[k])))


if __name__ == '__main__':
    # THE CONTENT IS IN ONE FILE PER SUBJECT, because 81 quizzes in one file is a file nobody
    # reads twice -- and this is the one thing in the app that tells a child they are wrong.
    #
    # AND IT GOES THROUGH THE IMPORTED COPY OF THIS MODULE, not through the names above. Run as
    # a script this file is `__main__`; the content files say `from quizwrite import quiz`, which
    # loads it a SECOND time under its own name, with its own empty ROWS. So the rows land in
    # quizwrite.ROWS and `write()` here would read __main__.ROWS -- a different list. It printed
    # `0 quizzes, 0 questions` over 405 rows that had been built perfectly, which is this
    # repository's oldest shape one more time: I did not manage to look, reported as I looked and
    # there was nothing there.
    import quizwrite
    import quiz_biology, quiz_chemistry, quiz_physics    # noqa: F401  (importing writes the rows)
    quizwrite.write()
