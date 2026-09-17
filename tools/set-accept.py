#!/usr/bin/env python3
"""
tools/set-accept.py — give every answered question a MACHINE-CHECKABLE answer.

WHY A SECOND COLUMN AND NOT JUST `answer`. `answer` is prose written for a person: the value,
an em dash, and then the method, the tolerance and the trap. That is the right shape for a
tutor and the wrong shape for a comparison — "16 &mdash; half it." does not equal "16".
`accept` is the bare thing a student could type and be right.

THE TWO SHAPES THE LIBRARY ALREADY USES, and nothing else is guessed at:
  "727"                        an arithmetic paper: the whole answer IS the value
  "16 &mdash; half it."        a worked answer: the value is what precedes the em dash

SEVERAL ANSWERS CAN BE RIGHT AND THE COLUMN SAYS SO, pipe-separated. "8 or 16" is two, and a
child who writes 16 has not made a mistake. This matters more than it looks: marking a correct
answer wrong is the one failure that makes a student stop trusting the marking altogether, and
they have nobody to appeal to.

WHERE IT CANNOT BE SURE IT WRITES NOTHING. A value longer than 60 characters is a sentence, not
an answer; "Any three of 1, 2, 5, 10" is a choice this cannot check mechanically; an explain or
proof question has no single right string. Those keep their written answer and simply are not
auto-marked -- `markable` stays off and the card offers "show the answer" instead of a tick.
A question marked wrong by a checker that did not understand it is worse than one not marked.
"""
import json, io, re, html, argparse

PATH = 'data/questions.json'


def load(path=PATH):
    out = []
    for line in io.open(path, encoding='utf-8'):
        s = line.strip()
        if s in ('[', ']', ''):
            continue
        if s.endswith(','):
            s = s[:-1]
        out.append(json.loads(s))
    return out


def dump(rows, path=PATH):
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write('[\n')
        for i, r in enumerate(rows):
            f.write(json.dumps(r, ensure_ascii=False))
            f.write(',\n' if i < len(rows) - 1 else '\n')
        f.write(']\n')


# A KIND OF ANSWER THAT HAS NO SINGLE RIGHT STRING. An explanation is marked by a human, and a
# proof by whether the steps hold; pretending a checker can do either is how a student gets told
# a correct answer is wrong.
NOT_MARKABLE = {'explain', 'proof', 'written', 'drawing', 'annotate'}

# "Any three of ...", "several work", a range -- real answers that a string compare cannot judge.
VAGUE = re.compile(r'^(any |several|about |approx|two of|three of|four of|all of)', re.I)


def strip(s):
    """The answer's text with its markup taken off -- and ONE space put back, in one place.

    `<b>2<sup>2</sup>&frasl;<sub>15</sub></b>` is the mixed number 2 and 2/15. Deleting the tags
    outright ran the whole number into the numerator and produced `22/15`, which is 1.47 where the
    answer is 2.13 -- a different number, written into the column a student's typing is checked
    against. A child typing the right answer was told it was wrong, and one typing 22/15 was told
    it was right. Found on Q21(a) of the June 2024 Foundation paper, the paper somebody was sitting
    at the time.

    THE RULE IS AS NARROW AS THE FAULT. Turning every tag into a space instead fixed this and broke
    141 algebraic answers the same afternoon: `<i>n</i><sup>2</sup>` became `n 2` and `4<i>n</i>-3`
    became `4 n - 3`, so a hundred answers that were right by the old rule went wrong by the new
    one. What actually needs the space is one shape -- a digit, then a superscript that IS a
    numerator, which is what the `&frasl;` after it says. Everything else loses its tags exactly as
    before. Same lesson as `check-rows.js`: one question with one right answer beats a general rule
    that is wrong 141 times.
    """
    s = re.sub(r'(\d)(<sup>[^<]*</sup>\s*&frasl;)', r'\1 \2', s or '')
    # A SUPERSCRIPT THAT IS NOT A NUMERATOR IS A POWER, and deleting its tags ran it into
    # the base: `m<sup>4</sup>` became `m4` and `10<sup>7</sup>` became `107`, so the
    # marking column held a value nobody would type and `3.42 x 10^7` was marked wrong.
    # `^` is what a keyboard has. The `&frasl;` case above is excluded because there the
    # superscript is the top of a fraction, not an index.
    s = re.sub(r'<sup>([^<]*)</sup>(?!\s*&frasl;)', r'^\1', s)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def value_of(answer_html):
    """The bare answer, or None when this is prose rather than a value."""
    a = strip(answer_html)
    if not a:
        return None
    # the worked shape: everything before the first em dash is the value
    cut = a.split('—')[0].strip() if '—' in a[:160] else a
    cut = cut.rstrip(' .').strip()
    if not cut or len(cut) > 60:
        return None
    if VAGUE.match(cut):
        return None
    # it has to contain something answer-shaped: a digit, or a short word or two
    if not re.search(r'\d', cut) and len(cut.split()) > 4:
        return None
    # PROSE THAT HAPPENS TO BE SHORT. "7 for 14, and 13 for 26" is two answers explained, not a
    # string anybody types, and a checker holding it will mark the correct "7 and 13" wrong.
    if re.search(r'\bfor\b|\bwhere\b|\bbecause\b|\bsince\b|:', cut):
        return None
    return cut


SPLIT = re.compile(r'\s+or\s+', re.I)

def variants(v):
    """"8 or 16" is two acceptable answers, and the word "or" is the only thing that says so.

    THE SOLIDUS USED TO SPLIT TOO AND IT WAS WRONG ABOUT UNITS. The rule was "/ unless a digit
    follows", written to protect 3/4 -- but `12 km/h` has a letter after the slash, so it became the
    two alternatives `12 km` and `h`, and a student typing the single letter **h** was marked RIGHT.
    `2 g/cm3` split the same way. Measured across the library when this was found: every `/` in an
    answer value is a unit or a fraction, and not one is a genuine alternative. So the slash does not
    separate anything, and "or" -- which a person wrote deliberately -- does.
    """
    parts = [p.strip(' .') for p in SPLIT.split(v) if p.strip(' .')]
    return parts if len(parts) > 1 else [v]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    rows = load()
    on = off = 0
    for r in rows:
        if r.get('kind') != 'question':
            continue
        if not str(r.get('answer') or '').strip():
            r.pop('accept', None)
            continue
        if str(r.get('answer_type') or '').strip().lower() in NOT_MARKABLE:
            r.pop('accept', None)
            off += 1
            continue
        v = value_of(r['answer'])
        if not v:
            r.pop('accept', None)
            off += 1
            continue
        r['accept'] = ' | '.join(variants(v))
        on += 1
    print('markable %d   left for a person to mark %d' % (on, off))
    if not a.dry:
        dump(rows)
        print('written.')


if __name__ == '__main__':
    main()
