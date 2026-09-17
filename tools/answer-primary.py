#!/usr/bin/env python3
"""
tools/answer-primary.py — answer the Corbettmaths PRIMARY worksheets by COMPUTING them.

WHY THIS IS A PARSER AND NOT A PROMPT. 64 primary sets, 1,003 questions, and the overwhelming
majority of them are a bare arithmetic expression: "53 + 24", "50% of 32", "3x3". There is no
mark scheme for a Corbettmaths worksheet and there does not need to be — an answer to "453 + 219"
is not a judgement anybody has to make. Handing those to a language model to derive would be
slower, would need a second model to check it, and would still be a claim rather than a fact.

WHAT MAKES IT SAFE IS THAT IT REFUSES TO GUESS. Every parse has to consume the WHOLE question,
leaving nothing over, or the question is handed back unanswered for a reading pass. A partial
match is the one dangerous outcome: "Emma has 53 sweets and gives away 24" contains "53 + 24"
nowhere, but a sloppy regex over "53 ... 24" would happily invent 77. So the patterns are
anchored end to end and anything with prose left in it is declined. Under-reaching costs a
question; over-reaching puts a wrong answer on a card a child is marking their own work against.

FRACTIONS ARE EXACT. `Fraction` throughout, never float — 1/3 + 1/6 is one half and 0.5
recurring is not an answer. Decimals are parsed through `Decimal` for the same reason: 0.1 + 0.2
must be 0.3 on a primary worksheet, and in binary floating point it is not.

THE ANSWER IS THE ANSWER, AND THE WORKING IS THE TEACHING. Each answer leads with the value and
then says the one thing worth saying about that kind of question — carrying, lining up decimal
points, what 10% is for. A bare number is right and teaches nothing; these sheets are what a
tutor puts in front of a child who is stuck.

  python3 tools/answer-primary.py --dry      what it can and cannot parse, per set
  python3 tools/answer-primary.py            write the answers it is sure of
"""
import json, io, re, html, sys, argparse
from fractions import Fraction
from decimal import Decimal, localcontext

PATH = 'data/questions.json'


# ---------- the library, one object per line ------------------------------------------------
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


# ---------- getting from markup to something parseable --------------------------------------
# THE DOTTED ANSWER LINE IS NOT PART OF THE QUESTION. Corbettmaths prints a row of dots for the
# child to write on; it arrives in `html` as a long run of full stops or ellipses and has to go
# before anything can be matched end to end.
DOTS = re.compile(r'[.…]{3,}')

def plain(s):
    t = html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))
    t = DOTS.sub(' ', t)
    t = (t.replace('×', '*').replace('÷', '/').replace('−', '-')
          .replace('–', '-').replace('—', '-').replace(' ', ' '))
    t = re.sub(r'\s+', ' ', t).strip()
    # A WORKSHEET WRITES "TIMES" FOUR WAYS and the text layer flattens them differently:
    # "3x3", "5 x 4", "6 X 2", "7*2". Replaced only BETWEEN DIGITS, so the x of an algebra
    # question survives -- `W-CBM-substitution` and `W-CBM-equations` are full of real ones,
    # and turning "3x + 2" into "3* + 2" would make a solvable question unparseable at best.
    t = re.sub(r'(?<=\d)\s*[xX]\s*(?=\d)', '*', t)
    # "= 2,600 + 700" is what an answer-line question looks like once its box has gone.
    t = re.sub(r'^\s*=\s*', '', t)
    return t.strip()


NUM = r'-?\d[\d,]*(?:\.\d+)?'

def val(tok):
    """A number as written on a primary worksheet. Decimal, so 0.1 + 0.2 is 0.3."""
    return Decimal(tok.replace(',', ''))


def tidy(d):
    """Print a Decimal the way a child writes it: no trailing zeros, no exponent, commas over 9999."""
    if isinstance(d, Fraction):
        return frac_str(d)
    d = Decimal(d)
    if d == d.to_integral_value():
        n = int(d)
        # COMMAS FROM A THOUSAND UP, which is what the sheets themselves print: the questions
        # say "2,600 + 700", so an answer of 3300 is in a different notation from its own
        # question. Below a thousand a comma would be wrong.
        return '{:,}'.format(n) if abs(n) >= 1000 else str(n)
    s = format(d.normalize(), 'f')
    return s


def num_str(f):
    """A Fraction as a primary child would WRITE it.

    A PERCENTAGE OF AN AMOUNT IS A DECIMAL, NOT A MIXED NUMBER. 50% of 17 is 8.5 on every
    worksheet ever printed; rendering it 8<sup>1</sup>/<sub>2</sub> is not wrong and is not what
    anybody writes, and on a card a child is marking their own work against, "not what anybody
    writes" is close enough to wrong. So a fraction whose denominator divides a power of ten
    comes back as a decimal, and only a genuine third or seventh stays a fraction.

    AND THOUSANDS KEEP THEIR COMMAS. `frac_str` printed 23200 where the sheet says 23,200,
    because it formatted the numerator directly and never reached `tidy`.
    """
    f = Fraction(f)
    d = f.denominator
    while d % 2 == 0:
        d //= 2
    while d % 5 == 0:
        d //= 5
    if d == 1:                                  # terminates in decimal
        return tidy(Decimal(f.numerator) / Decimal(f.denominator))
    return frac_str(f)


def frac_str(f):
    f = Fraction(f)
    if f.denominator == 1:
        return str(f.numerator)
    whole, rem = divmod(abs(f.numerator), f.denominator)
    sign = '-' if f < 0 else ''
    if whole:
        return ('%s%d<sup>%d</sup>&frasl;<sub>%d</sub>' % (sign, whole, rem, f.denominator))
    return '%s<sup>%d</sup>&frasl;<sub>%d</sub>' % (sign, rem, f.denominator)


# ---------- the patterns, each anchored end to end -------------------------------------------
# EVERY ONE IS `fullmatch`. A pattern that merely finds its shape somewhere inside a sentence is
# the one way this can put a wrong answer on a card, so the expression has to BE the question.
# ---------- a real expression evaluator, because BIDMAS is the whole point of one set ----------
# NEVER `eval`. These strings come out of a content file; `eval` on one is arbitrary code
# execution over data, and the grammar needed here is four operators and a bracket. It is also
# the only way to be RIGHT about "7 + 2 x 4": a left-to-right reader gives 36 and the answer is
# 15, which is exactly what `W-CBM-order-of-operations` is teaching.
class Expr:
    def __init__(self, s):
        # COMMAS ARE THOUSANDS SEPARATORS, not tokens. "2,600 + 700" is two numbers.
        s = re.sub(r'(?<=\d),(?=\d\d\d)', '', s)
        self.t = re.findall(r'\d+(?:\.\d+)?|[-+*/()^]', s)
        self.i = 0
    def peek(self):
        return self.t[self.i] if self.i < len(self.t) else None
    def take(self):
        c = self.peek(); self.i += 1; return c
    def expr(self):
        v = self.term()
        while self.peek() in ('+', '-'):
            v = v + self.term() if self.take() == '+' else v - self.term()
        return v
    def term(self):
        v = self.power()
        while self.peek() in ('*', '/'):
            if self.take() == '*':
                v *= self.power()
            else:
                d = self.power()
                if d == 0:
                    raise ZeroDivisionError
                v /= d
        return v
    def power(self):
        v = self.atom()
        if self.peek() == '^':
            self.take()
            v = v ** int(self.atom())
        return v
    def atom(self):
        c = self.take()
        if c == '(':
            v = self.expr()
            if self.take() != ')':
                raise ValueError
            return v
        if c == '-':
            return -self.atom()
        if c is None or not re.fullmatch(r'\d+(?:\.\d+)?', c):
            raise ValueError
        return Fraction(c)
    @staticmethod
    def run(s):
        """None unless the whole string is consumed — a partial parse is never an answer."""
        e = Expr(s)
        joined = ''.join(e.t)
        if joined != re.sub(r'(?<=\d),(?=\d\d\d)', '', re.sub(r'\s+', '', s)):
            return None
        v = e.expr()
        return None if e.peek() is not None else v


SUP = {'²': '^2', '³': '^3', '⁴': '^4'}

def desup(t):
    for k, v in SUP.items():
        t = t.replace(k, v)
    return t


ROMAN = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
         (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]

def to_roman(n):
    out = ''
    for v, s in ROMAN:
        while n >= v:
            out += s; n -= v
    return out

def from_roman(s):
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    n = prev = 0
    for ch in reversed(s.upper()):
        if ch not in vals:
            return None
        v = vals[ch]
        n = n - v if v < prev else n + v
        prev = max(prev, v)
    return n


def solve(q):
    """Return (value_html, note) or None when the question is not a bare calculation."""
    t = q.strip().rstrip('=').strip()

    # a chain of + and - : "27 + 81 + 44", "150 - 40"
    m = re.fullmatch(r'(%s)((?:\s*[+-]\s*%s)+)' % (NUM, NUM), t)
    if m:
        total = val(m.group(1))
        parts = re.findall(r'([+-])\s*(%s)' % NUM, m.group(2))
        for op, n in parts:
            total = total + val(n) if op == '+' else total - val(n)
        dec = '.' in t
        note = ('line the decimal points up under each other and the rest is ordinary column '
                'arithmetic' if dec else
                'add the units first and carry into the tens' if '+' in t else
                'take the units first, and borrow from the tens when the top digit is smaller')
        return tidy(total), note

    # a single multiplication or division: "3x3", "6 * 7", "144 / 12"
    m = re.fullmatch(r'(%s)\s*[x*]\s*(%s)' % (NUM, NUM), t, re.I)
    if m:
        a, b = val(m.group(1)), val(m.group(2))
        return tidy(a * b), ('%s lots of %s' % (tidy(a), tidy(b)))
    m = re.fullmatch(r'(%s)\s*/\s*(%s)' % (NUM, NUM), t)
    if m:
        a, b = val(m.group(1)), val(m.group(2))
        if b == 0:
            return None
        f = Fraction(a) / Fraction(b)
        return (tidy(f) if f.denominator != 1 else tidy(Decimal(f.numerator)),
                'how many %ss fit into %s' % (tidy(b), tidy(a)))

    # "50% of 32"
    m = re.fullmatch(r'(%s)\s*%%\s*of\s*(%s)' % (NUM, NUM), t, re.I)
    if m:
        pc, amt = Fraction(val(m.group(1))), Fraction(val(m.group(2)))
        got = pc * amt / 100
        hints = {50: 'half it', 25: 'half it, then half again', 10: 'divide by 10',
                 20: 'find 10% and double it', 75: 'half, then half again, then add the two',
                 5: 'find 10% and halve it', 1: 'divide by 100'}
        note = hints.get(int(pc) if pc.denominator == 1 else -1,
                         'find 10%% first (%s), then build the rest from it' % frac_str(amt / 10))
        return num_str(got), note

    # "1/2 of 40"  and  "3/4 of 200"
    m = re.fullmatch(r'(\d+)\s*/\s*(\d+)\s*of\s*(%s)' % NUM, t, re.I)
    if m:
        f = Fraction(int(m.group(1)), int(m.group(2))) * Fraction(val(m.group(3)))
        return num_str(f), ('divide by the bottom number, then multiply by the top')

    # "Write down the value of 4³", or a bare "6³"
    m = re.fullmatch(r'(?:write down |find |work out )?(?:the value of\s*)?(\d+)\s*\^(\d+)',
                     desup(t), re.I)
    if m:
        b, e = int(m.group(1)), int(m.group(2))
        word = {2: 'squared', 3: 'cubed'}.get(e, 'to the power %d' % e)
        return (tidy(Decimal(b ** e)),
                '%d %s means %s' % (b, word, ' &times; '.join([str(b)] * e)))

    # "Write down the first five multiples of 3"
    WORDS = {'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
             'nine': 9, 'ten': 10, 'twelve': 12}
    m = re.fullmatch(r'write down the first (\w+) multiples of (\d+)', t, re.I)
    if m:
        k = WORDS.get(m.group(1).lower())
        n = int(m.group(2))
        if k:
            return (', '.join(str(n * i) for i in range(1, k + 1)),
                    'the multiples of %d are just the %d times table, so count up in %ds &mdash; '
                    'and %d itself is the first one, not %d' % (n, n, n, n, n * 2))

    # a roman numeral either way: "Write 24 in Roman numerals" / "Write XIV as a number"
    m = re.fullmatch(r'write (?:down )?(\d+) (?:in|as|using) roman numerals?', t, re.I)
    if m:
        n = int(m.group(1))
        if 0 < n < 4000:
            return to_roman(n), 'build it from the biggest pieces down, and a smaller letter in ' \
                                'front of a bigger one means subtract'
    m = re.fullmatch(r'write (?:down )?([IVXLCDM]+) (?:in figures|as a number)', t, re.I)
    if m:
        n = from_roman(m.group(1))
        if n:
            return tidy(Decimal(n)), 'read left to right and add, except where a smaller letter ' \
                                     'comes before a bigger one &mdash; then subtract it'

    # "Round 672 to the nearest 10"  (one target only; the multi-part ones go to a reading pass)
    m = re.fullmatch(r'round (%s) to the nearest (10|100|1,?000|10,?000|ten|hundred|thousand)'
                     % NUM, t, re.I)
    if m:
        n = val(m.group(1))
        k = {'ten': 10, 'hundred': 100, 'thousand': 1000}.get(m.group(2).lower(),
              int(m.group(2).replace(',', '')) if m.group(2)[0].isdigit() else 0)
        if k:
            q_, rem = divmod(int(n), k)
            up = rem * 2 >= k          # exactly half rounds UP, which is the whole of the rule
            got = (q_ + (1 if up else 0)) * k
            return (tidy(Decimal(got)),
                    'look at the digit just below the %d &mdash; it is %d, so round %s. Exactly '
                    'half always goes up' % (k, rem // (k // 10) if k >= 10 else rem,
                                             'up' if up else 'down'))

    # ANYTHING THAT IS PURELY AN EXPRESSION, with BIDMAS honoured. Last, so the friendlier
    # patterns above get first refusal on the strings they were written for.
    if re.fullmatch(r'[\d\s,+\-*/().^²³⁴]+', t) and re.search(r'\d', t):
        try:
            v = Expr.run(desup(t).replace(' ', ''))
        except Exception:
            v = None
        if v is not None:
            mixed = re.search(r'[+-]', t) and re.search(r'[*/]', t)
            return (num_str(v),
                    'multiply and divide BEFORE you add and subtract &mdash; left to right gives '
                    'the wrong answer here' if mixed else 'work left to right')

    # a bare fraction sum: "1/4 + 1/4"
    m = re.fullmatch(r'(\d+)\s*/\s*(\d+)((?:\s*[+-]\s*\d+\s*/\s*\d+)+)', t)
    if m:
        total = Fraction(int(m.group(1)), int(m.group(2)))
        for op, a, b in re.findall(r'([+-])\s*(\d+)\s*/\s*(\d+)', m.group(3)):
            f = Fraction(int(a), int(b))
            total = total + f if op == '+' else total - f
        return frac_str(total), ('same denominator, so the bottom stays put and only the tops '
                                 'move' if m.group(2) in m.group(3) else
                                 'give them the same denominator first, then the tops add')
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--only', default='')
    a = ap.parse_args()

    rows = load()
    sets = {}
    for r in rows:
        pid = str(r.get('paper_id') or '')
        if not pid.startswith('W-CBM-') or r.get('kind') != 'question':
            continue
        ks = str(r.get('key_stage') or '')
        if 'KS3' in ks or 'KS4' in ks or 'KS5' in ks:
            continue
        if 'KS1' not in ks and 'KS2' not in ks:
            continue
        if a.only and a.only not in pid:
            continue
        sets.setdefault(pid, []).append(r)

    done = skipped = already = 0
    per = []
    for pid, qs in sorted(sets.items()):
        hit = miss = 0
        for r in qs:
            if str(r.get('answer') or '').strip():
                already += 1
                continue
            got = solve(plain(r.get('html')))
            if not got:
                miss += 1
                skipped += 1
                continue
            value, note = got
            if not a.dry:
                r['answer'] = '<b>%s</b> &mdash; %s.' % (value, note)
            hit += 1
            done += 1
        per.append((pid, hit, miss, len(qs)))

    per.sort(key=lambda t: -t[1])
    print('%-52s %5s %5s' % ('set', 'done', 'left'))
    for pid, hit, miss, n in per:
        if hit or miss:
            print('  %-50s %5d %5d' % (pid, hit, miss))
    print('\ncomputed %d   not a bare calculation, left for a reading pass %d   already answered %d'
          % (done, skipped, already))
    if not a.dry:
        dump(rows)
        print('written.')


if __name__ == '__main__':
    main()
