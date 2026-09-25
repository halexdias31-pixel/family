#!/usr/bin/env python3
# ===================================================================================================
# GIVE EVERY PRACTICAL A SHAPE AND EVERY KIT ITEM ITS QUANTITY.
#
# ASKED FOR AS "each item/ingredient to be like a chip ... and it's quantity", and "differentiate
# between a science experiment and a contraption/art and craft thing".
#
# IT TAKES A DECISIONS FILE AND WRITES data/practicals.json. The decisions are judgements — which
# of two shapes an afternoon is, and whether a number in a name is a count or a size — and every
# one of them was made by reading the row's own aim, outcome and steps. Nothing here derives one
# from a word: "build" is in the steps of half the experiments and "measure" is in the steps of
# most of the builds, and this repository already records what a substring over this column costs,
# where /required practical/ matched `AQA-aligned, NOT a required practical` and put a gold flag on
# five cards saying they are not one.
#
# EVERY RULE IS ASSERTED HERE AS WELL AS IN check-practicals.js, AND THAT IS DELIBERATE. The
# checker guards the FILE, which is what ships. This guards the WRITE, which is where a mistake is
# one row to look at rather than a red on a suite. CLAUDE.md records the argument the other way
# round — a rule living only in the thing that produced the data is a rule nothing enforces about
# the data — and both halves are wanted.
#
#   python3 tools/practical-chips.py decisions.json
# ===================================================================================================
import io, json, re, sys, unicodedata

TIMES = '×'
TYPES = {'experiment', 'build'}
QTY_MAX = 12

# ===================================================================================================
# NOTHING MAY BE LOST, AND THAT IS THE ONE THING THIS FILE CAN PROVE.
#
# The proposal carries the `original` string beside the two halves it was split into, so the write
# can ask the question the FILE can never ask again: does `name` plus `qty` still account for
# everything the row said? Once written, the cell holds `Name × qty` and the original is gone —
# which is why `check-practicals.js` checks the SHAPE of an item and this checks its CONTENT.
#
# THE FAULT IT EXISTS FOR IS NAMED IN CLAUDE.md: `Nichrome wire (about 1 m, taped to a metre rule)`
# quietly becoming `Nichrome wire`. A clause with real content in it, dropped, with nothing anywhere
# saying so — and the chip then sends a tutor to a client's house without the metre rule.
#
# SO EVERY WORD OF THE ORIGINAL HAS TO BE SOMEWHERE: in the name, in the quantity, or on one of the
# two lists below. Nothing else is allowed through, and a name may not invent a word either.
# ===================================================================================================

# WORDS THAT CARRY NO IDENTITY AND MAY ALWAYS GO. An article, a connector, and the spelled-out
# count words — which is the whole of the original rule, kept. 99 of the 640 items begin with `A `
# or `An `, and the SAME THING is spelled both ways across the file: `Stopwatch` and `A stopwatch`,
# `Ruler` and `A ruler`. On a chip that is a label rather than a sentence, so dropping it is the
# spelling fold this repository already makes four columns along, not a reword.
DROP = set('a an the of or and about approx approximately around roughly at least per run runs'
           ' each one two three four five six seven eight nine ten eleven twelve half couple pair'
           ' few several some'.split())

# A MEASURE WORD MAY GO ONLY WHERE A QUANTITY WAS WRITTEN, and that one condition is the whole
# difference between the two things a number in a name can be. `A teaspoon of washing-up liquid`
# gives up `teaspoon` because `1 tsp` now holds it; `250 ml beaker` gives up nothing, because its
# quantity is empty and `250 ml` is the beaker's SIZE. Getting that wrong puts a number on a card
# that nobody counted, which is the trap the whole task is written around.
MEASURE = set('teaspoon teaspoons tsp tablespoon tablespoons tbsp spoon spoonful sachet sachets'
              ' box boxes handful pinch drop drops bottle bottles pack packet packets roll sheet'
              ' sheets length lengths piece pieces bag bags jar jars cup cups glass tub tubs'
              ' ml l litre litres g kg cm mm m'.split())


def norm(s):
    return unicodedata.normalize('NFC', str(s or '')).strip()


def items(cell):
    return [t.strip() for t in norm(cell).split('|') if t.strip()]


def words(s):
    return [w for w in re.split(r'[^0-9a-z]+', norm(s).lower()) if w]


# THE TWO SHAPES A SIZE COMES IN THAT A WORD-COUNT CANNOT SEE. `250 ml beaker` and `100 ml of
# water` are the same sentence to any rule about which words moved where — one is a vessel and the
# other is a substance, and only a reader knows which. That judgement is what the refuters are for.
# These two are the half that IS structural, and both are written into the file already:
#   a hyphen — `Two-litre bottles` is a bottle's size and `Two graphite electrodes` is a count, and
#              that one character is the whole difference;
#   a bracket — `Balance (0.01 g)` and `Quadrat (0.5 m)` put a tool's own specification in
#              parentheses. Nothing in this column has ever written a COUNT in brackets.
HYPHEN_COUNT = re.compile(r'\b(' + '|'.join(sorted(
    'one two three four five six seven eight nine ten eleven twelve half'.split())) + r')-', re.I)
BRACKETED = re.compile(r'\([^()]*\)')


def accounted(original, name, qty):
    """Every word of `original` is in `name`, in `qty`, or droppable; and `name` invents none."""
    o, n, q = words(original), set(words(name)), set(words(qty))
    if not set(n) <= set(o):
        return False, 'the name uses a word the row does not: ' + ', '.join(sorted(n - set(o)))
    left = [w for w in o if w not in n and w not in q]
    droppable = DROP | (MEASURE if qty else set())
    lost = sorted({w for w in left if w not in droppable})
    if lost:
        return False, 'these word(s) are in neither half: ' + ', '.join(lost)
    if qty:
        hy = [m.group(1).lower() for m in HYPHEN_COUNT.finditer(original)
              if m.group(1).lower() not in n]
        if hy:
            return False, ('"' + hy[0] + '-" is hyphenated, so it is a SIZE and belongs in the '
                           'name. A count is written with a space after it')
        out = set(words(BRACKETED.sub(' ', original)))
        inb = set(w for m in BRACKETED.finditer(original) for w in words(m.group(0)))
        # ONLY WHERE THE QUANTITY WAS LIFTED OUT OF THE ROW'S OWN WORDS. A quantity that is
        # nowhere in the original at all has been RENUMERALISED -- `Two ... electrodes` giving
        # `2`, `A teaspoon of ...` giving `1 tsp` -- and this rule has nothing to say about it.
        #
        # AND ONLY WHERE THE WHOLE BRACKET WENT. `Balance (0.01 g)` puts nothing but the
        # specification in its parentheses, so a name that keeps none of them has taken a size and
        # called it a count. `Paper cupcake cases (at least 20 identical)` is the other shape --
        # `identical` stays in the name, so the bracket was holding a real count beside a real
        # adjective, and this rule has no business in it.
        if (q & set(o)) and not (q & out) and not (inb & n):
            return False, ('the quantity is only inside the brackets of the original, where this '
                           "column writes a tool's own specification and never a count")
    return True, ''


def main(path):
    decisions = json.load(io.open(path, encoding='utf-8'))
    by_id = {}
    for d in decisions:
        i = d['id']
        assert i not in by_id, 'two decisions for ' + i
        by_id[i] = d

    lines = io.open('data/practicals.json', encoding='utf-8').read().split('\n')
    assert lines[0].strip() == '[', 'data/practicals.json does not open with a bare ['

    out, typed, qtys, seen = [], 0, 0, set()
    for ln in lines:
        t = ln.strip()
        if not t or t in ('[', ']'):
            out.append(ln)
            continue
        row = json.loads(t.rstrip(','))
        pid = row['practical_id']
        d = by_id.get(pid)
        assert d, 'no decision for ' + pid
        seen.add(pid)

        refused = bool(norm(row.get('excluded_reason')))
        pt = norm(d.get('practical_type'))
        if not refused:
            assert pt in TYPES, pid + ' has practical_type ' + repr(pt)
            row['practical_type'] = pt
            typed += 1
        else:
            # A REFUSED EXPERIMENT IS NOT ASKED WHICH SHAPE IT WOULD HAVE BEEN, for the reason it is
            # not asked for a method: it is a row so the reasoning is findable, not so the
            # afternoon is. check-practicals.js excuses it in the same words.
            row.pop('practical_type', None)

        was = items(row.get('equipment'))
        got = d.get('equipment') or []
        assert len(got) == len(was), (pid + ' proposes ' + str(len(got)) + ' kit items for a row '
                                      'that has ' + str(len(was)))
        rebuilt = []
        for original, e in zip(was, got):
            assert norm(e['original']) == original, (
                pid + ' proposes a kit item the row does not have:\n  row  ' + repr(original)
                + '\n  said ' + repr(norm(e['original'])))
            name, qty = norm(e['name']), norm(e['qty'])
            assert name, pid + ' proposes an empty name for ' + repr(original)
            assert TIMES not in name, pid + ' proposes a name holding a ' + TIMES + ': ' + repr(name)
            assert TIMES not in qty, pid + ' proposes a quantity holding a ' + TIMES
            assert '|' not in name and '|' not in qty, pid + ' proposes a pipe inside an item'
            ok, why = accounted(original, name, qty)
            assert ok, (pid + ' loses something splitting a kit item — ' + why + '\n'
                        '  was  ' + repr(original) + '\n  now  ' + repr(name)
                        + ('  ×  ' + repr(qty) if qty else '  (no quantity)'))
            assert qty != '1', pid + ' proposes a quantity of 1 for ' + repr(name)
            assert len(qty) <= QTY_MAX, (pid + ' proposes a ' + str(len(qty))
                                         + '-character quantity: ' + repr(qty))
            rebuilt.append(name + ' ' + TIMES + ' ' + qty if qty else name)
            if qty:
                qtys += 1
        row['equipment'] = '|'.join(rebuilt)

        # ROUND-TRIPPED, THE MOVE tools/cbmnum.py ALREADY MAKES. Reading the cell back with the
        # app's own rule has to give exactly the two halves that were written, or the chip draws
        # something nobody decided.
        for original_pair, cell in zip(got, rebuilt):
            at = cell.rfind(TIMES)
            back_name = cell[:at].strip() if at > 0 else cell
            back_qty = cell[at + 1:].strip() if at > 0 else ''
            assert back_name == norm(original_pair['name']), pid + ' does not read back: ' + cell
            assert back_qty == norm(original_pair['qty']), pid + ' does not read back: ' + cell

        out.append(json.dumps(row, ensure_ascii=False) + (',' if ln.rstrip().endswith(',') else ''))

    missing = set(by_id) - seen
    assert not missing, 'decisions for rows that are not in the file: ' + ', '.join(sorted(missing))

    io.open('data/practicals.json', 'w', encoding='utf-8').write('\n'.join(out))
    kit = sum(len(items(json.loads(l.strip().rstrip(','))['equipment']))
              for l in out if l.strip() not in ('[', ']', ''))
    print('wrote data/practicals.json')
    print('  practical_type on %d live rows' % typed)
    print('  %d of %d kit items carry a quantity' % (qtys, kit))


if __name__ == '__main__':
    assert len(sys.argv) == 2, __doc__ or 'usage: practical-chips.py decisions.json'
    main(sys.argv[1])
