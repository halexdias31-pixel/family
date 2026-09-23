"""The five figures AQA prints on Chemistry 8462/1H, June 2024, that the Foundation pass did not
already cover.

TWO OF THE FIVE ARE THE FOUNDATION PAPER'S OWN PICTURES, which is why this imports rather than
copies. AQA prints the same figure on both tiers -- 8462/1H Figure 2 IS 8462/1F Figure 16, the two
early models of the atom, with the same two questions under it; and 8462/1H Figure 6 is 8462/1F
Figure 14, the chemical cell, with its labels changed. CLAUDE.md records that move twice already,
for `blankgrid` (8461/1F Figure 6 is 8461/1H Figure 1) and for `scatter` (8463/2H Figure 2 is
8463/2F Figure 14): one builder, because building it twice is two chances to disagree about it.

THREE ARE NEW AND EACH IS DETERMINED BY THE ROW'S OWN WORDS. The electrolysis on filter paper is a
set-up; propane's displayed formula is a chain somebody has to count bonds along; and the four
reaction profiles differ ONLY in which way the products sit and which way the arrow points, which
is exactly what 08.2 asks about -- so a question printed without them is four identical choices.
"""

import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import importlib.util
_spec = importlib.util.spec_from_file_location(
    'chem1f', str(pathlib.Path(__file__).parent / 'draw-chem-8462-1F.py'))
F = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(F)
from svgplot import W

svg, t, line, rect, circ, path, WASH = F.svg, F.t, F.line, F.rect, F.circ, F.path, F.WASH
beaker = F.beaker
FILE = pathlib.Path(__file__).resolve().parent.parent / 'data/questions.json'


# ── FIGURE 4 and FIGURE 5, the electrolysis on filter paper ───────────────────────────────────
def _electro(spots, label, caption_rows):
    """One picture drawn twice: Figure 4 is the apparatus with the green drop in the middle and
    Figure 5 is the same apparatus after the drop has separated. Drawing them from one function is
    what stops the two disagreeing about where the electrodes are -- which is the whole of 05.5,
    because the answer is which COLOUR ended up at which electrode."""
    PX, PY, PW, PH = 58, 74, 224, 56                       # the filter paper
    out = [rect(108, 18, 124, 26), t(170, 36, 'Power supply', 'cap'),
           path('M108 31 H58 V%d' % (PY + 22), sw=1.2),
           path('M232 31 H282 V%d' % (PY + 22), sw=1.2),
           rect(PX, PY, PW, PH, sw=1.2),
           rect(PX - 16, PY + 18, 46, 9, 'currentColor" fill-opacity=".45', sw=1),
           rect(PX + PW - 30, PY + 18, 46, 9, 'currentColor" fill-opacity=".45', sw=1),
           t(PX - 4, PY + 14, '−', 'num'), t(PX + PW + 4, PY + 14, '+', 'num')]
    for cx, fill, cap in spots:
        out.append('<ellipse cx="%.1f" cy="%d" rx="20" ry="9" fill="%s" stroke="currentColor" '
                   'stroke-width="1.1"/>' % (cx, PY + 22, fill))
    out += [line(PX - 12, PY + 28, PX - 12, PY + 46, w=.7),
            t(PX - 14, PY + 58, 'Negative', 'cap', ' style="text-anchor:end"'),
            t(PX - 14, PY + 69, 'electrode', 'cap', ' style="text-anchor:end"'),
            line(PX + PW + 12, PY + 28, PX + PW + 12, PY + 46, w=.7),
            t(PX + PW + 14, PY + 58, 'Positive', 'cap', ' style="text-anchor:start"'),
            t(PX + PW + 14, PY + 69, 'electrode', 'cap', ' style="text-anchor:start"')]
    y = PY + PH + 34
    for cx, ty, words in caption_rows:
        out.append(line(cx, PY + 30, cx, y - 8, w=.7))
        for i, wline in enumerate(words):
            out.append(t(ty, y + i * 11, wline, 'cap'))
    return svg(y + 11 * max(len(w) for _, _, w in caption_rows) + 8, ''.join(out), label)

# THE THREE FILLS HAVE TO BE TELLABLE APART ON BOTH PALETTES, and none of them may be a literal
# colour: this app has a cream paper and a black screen, and a real blue is unreadable on one of
# them. 05.5's answer is WHICH COLOUR ENDED UP AT WHICH ELECTRODE, so what the picture has to
# carry is two separate patches in two separate places -- the caption under each says which is
# which, exactly as AQA's own figure does, because a printed colour name is what a mark scheme
# marks against.
GREEN = 'currentColor" fill-opacity=".34'
BLUE = 'currentColor" fill-opacity=".58'
YELLOW = 'currentColor" fill-opacity=".20'

def fig4():
    return _electro([(170, GREEN, '')],
                    'Figure 4: electrolysis of copper chromate on filter paper between two '
                    'electrodes',
                    [(120, 108, ['Filter paper soaked in', 'an electrolyte solution']),
                     (188, 240, ['Drop of green copper', 'chromate solution'])])

def fig5():
    return _electro([(142, BLUE, ''), (198, YELLOW, '')],
                    'Figure 5: the same apparatus after electrolysis, a blue patch nearer the '
                    'negative electrode and a yellow patch nearer the positive one',
                    [(142, 100, ['Blue colour']), (198, 232, ['Yellow colour'])])


# ── FIGURE 7 ──────────────────────────────────────────────────────────────────────────────────
def fig7():
    """Propane's displayed formula. 08.1 is *explain why propane has a low boiling point*, and the
    answer turns on it being a small MOLECULE -- which you read off the chain rather than off the
    formula C3H8. Same shape as 8462/1F Figure 10, and deliberately not the same function: that
    one is two carbons with three fluorines each and this is three carbons with eight hydrogens,
    so a shared builder would take a list of atoms and be a worse description of both."""
    out = []
    xs = (118, 170, 222)
    for cx in xs:
        out += [t(cx, 76, 'C'), line(cx, 34, cx, 58, w=1.2), line(cx, 82, cx, 106, w=1.2),
                t(cx, 28, 'H'), t(cx, 116, 'H')]
    out += [line(xs[0] + 12, 71, xs[1] - 12, 71, w=1.2),
            line(xs[1] + 12, 71, xs[2] - 12, 71, w=1.2),
            line(80, 71, xs[0] - 12, 71, w=1.2), t(72, 76, 'H'),
            line(xs[2] + 12, 71, 260, 71, w=1.2), t(268, 76, 'H')]
    return svg(128, ''.join(out), 'Figure 7: the displayed structural formula of propane')


# ── FIGURE 8 ──────────────────────────────────────────────────────────────────────────────────
# The four profiles differ in exactly two things and nothing else, which is why they can be drawn:
# where the products sit, and which way the arrow points. 08.2's answer is the one that is both
# exothermic (products lower) and labelled downwards -- B.
F8 = [('A', 'down', 'up'), ('B', 'down', 'down'), ('C', 'up', 'down'), ('D', 'up', 'up')]
F8_ANSWER = 'B'

def fig8():
    """Four reaction profiles, A to D.

    THE PEAK IS DERIVED FROM THE TWO PLATEAUX RATHER THAN CHOSEN, so the activation hump cannot
    climb past the top of its own axis on the two profiles whose reactant level is the higher of
    the pair -- which is what the first version did, and which a reader would have taken for a
    drawing error rather than a coordinate one.

    AND THE 'overall energy change' LABEL IS ONE CAPTION UNDER ALL FOUR rather than a stack
    beside each. It is identical on every profile -- the question's own wording says so -- so
    repeating it four times is the AQA-insert fault, one sentence about a figure printed on
    every part that uses it. Its leader line was worse than redundant: a diagonal rule from the
    label to the middle of a graph reads as part of the graph."""
    BW, BH, X0, Y0, GX, GY = 158, 106, 6, 10, 14, 34
    out = []
    for i, (key, products, arrow) in enumerate(F8):
        bx, by = X0 + (i % 2) * (BW + GX), Y0 + (i // 2) * (BH + GY)
        L, R, T, B = bx + 34, bx + BW - 6, by + 8, by + BH - 22
        out += [line(L, T, L, B, w=1.2), line(L, B, R, B, w=1.2),
                path('M%g %g l-3.5 7 h7 Z' % (L, T - 2), fill='currentColor'),
                path('M%g %g l-7 -3.5 v7 Z' % (R + 2, B), fill='currentColor'),
                t(bx + 30, by + 52, 'Energy', 'cap', ' style="text-anchor:end"'),
                t((L + R) / 2.0, B + 14, 'Progress of reaction', 'cap'),
                t(bx + BW / 2.0, by + BH + 4, key)]
        hi, lo = T + 24, B - 18                     # the two plateau heights, both inside the axes
        a, b = (hi, lo) if products == 'down' else (lo, hi)
        peak = min(a, b) - 14
        assert peak > T, (key, peak, T)             # the hump may not climb past its own axis
        mid = (L + R) / 2.0
        out.append(path('M%g %g H%g Q%g %g %g %g Q%g %g %g %g H%g'
                        % (L + 6, a, mid - 30, mid - 14, peak - 10, mid, peak,
                           mid + 14, peak - 10, mid + 30, b, R - 6)))
        # the two plateaux carried in to the arrow, so each of its ends is visibly ON a level
        out += [line(mid - 30, a, mid, a, w=.7, dash=1),
                line(mid, b, mid + 30, b, w=.7, dash=1)]
        # 'DOWN' IS WHICH WAY IT POINTS ON THE PAGE, not which of reactants and products it runs
        # from. Written as reactants-to-products it is the same picture as an up arrow whenever
        # the products are the higher pair -- so C and D, which differ ONLY in that direction,
        # both came out pointing the same way. The paper's own wording is visual and so is this.
        top, bottom = min(a, b), max(a, b)
        y1, y2 = (top, bottom) if arrow == 'down' else (bottom, top)
        out += [line(mid, y1, mid, y2, w=1.1),
                path('M%g %g l3.5 %g h-7 Z' % (mid, y2, 7 if y2 < y1 else -7),
                     fill='currentColor')]
    foot = Y0 + 2 * BH + GY + 14
    return svg(foot + 12, ''.join(out) + t(W / 2.0, foot + 6,
               'In each profile the arrow is labelled \u2018overall energy change\u2019.', 'cap'),
               'Figure 8: four reaction profiles, A to D')


# ── WHICH DRAWING GOES ON WHICH ROW ───────────────────────────────────────────────────────────
# A figure goes on EVERY row that reads from it, not only the row that introduces it: 03.2 is
# "compare model A with the model used today" and paging to it with no picture is the fault this
# whole pass is about. Figures 1 and 3 on this paper are the two graphs, and both rows of each
# already carry one.
def plan():
    return {
        '031': F.fig16(), '032': F.fig16(),
        '055': fig4() + fig5(),
        '061': F.fig14('Nickel', 'Electrode A',
                       ('1.0 mol/dm³ sodium', 'chloride solution'),
                       'Figure 6: a chemical cell, a nickel electrode and electrode A '
                       'in sodium chloride solution with a voltmeter across them'),
        '081': fig7(),
        '082': fig8(),
    }


# ── AND THE PROSE THAT STOOD IN FOR THE PICTURE GOES WITH IT ──────────────────────────────────
# THIS IS THE HALF THAT MATTERS MORE THAN THE DRAWINGS, and on this paper two of the five hand
# over the answer doing it. 08.2 printed all four profiles as a bullet list -- "B: products lower
# than reactants, arrow pointing down" -- and the answer is B *because* the reaction is exothermic
# and so the products are lower: a student who reads the bullets has been handed the one thing
# the picture was there to make them read. 03.1 describes model A as "a shaded ball of positive
# charge with electrons dotted about inside it", which is the plum pudding model said out loud.
#
# CLAUDE.md's rule is *what a figure shows is not what its answer is*, and a description accurate
# enough to teach around is right while the picture is missing and a second source for one fact
# the moment it arrives. Each row keeps AQA's own lead-in and its ask, and loses the sentence
# that was standing in for the drawing.
#
# CUT BY ANCHOR RATHER THAN BY REWRITING THE WHOLE STRING, because 06.1 carries Table 3 -- five
# rows of voltages -- and retyping a table to delete a clause beside it is how a digit changes.
# Each cut asserts it found something to remove.
CUT = {
 '031': [('shows two early models of the atom.', '</p>', '')],
 '055': [('<b>Figure 4</b> shows the apparatus', '</p>', '.'),
         ('<b>Figure 5</b> shows the results', '</p>', '.')],
 '061': [('<b>Figure 6</b> shows the apparatus', '. This is the method used.', '')],
 '081': [('shows its displayed structural formula', '</p>', '.')],
 '082': [('shows four reaction profiles.', '</p>', ''),
         ('<b>Figure 8</b> shows four reaction profiles.</p>',
          '<p>Which is the correct reaction profile', '')],
}

def cut(html, after, upto, put):
    i = html.index(after) + len(after)
    j = html.index(upto, i)
    gone = html[i:j]
    assert gone.strip(), (after, upto)
    return html[:i] + put + html[j:], gone

# Every `examiner_note` on a drawn row said the figure was artwork in the PDF and what it shows is
# written out in the question. Both halves stop being true the moment it is drawn, and a note that
# outlives the thing it describes is the shape CLAUDE.md records under `resource_type` in `VOCAB`
# and the dead `kind === 'paper'` guard.
STALE_NOTE = re.compile(r'artwork in the PDF|is a graph in the PDF|is not transcribed|'
                        r'described rather than drawn')


# ── WHAT THE PICTURES CLAIM, ASSERTED ─────────────────────────────────────────────────────────
def check():
    """Figure 8 decides an answer, and the two shared figures decide whether the tier overlap is
    real or merely asserted -- so both are checked against what is already in the file rather
    than against this script's own belief about them."""
    # 08.2's answer is the profile that is BOTH exothermic (products lower) and labelled
    # downwards, and it is an answer only if exactly one of the four is
    both = [k for k, products, arrow in F8 if products == 'down' and arrow == 'down']
    assert both == [F8_ANSWER], both
    assert sorted(k for k, _, _ in F8) == list('ABCD')
    assert len({(p, a) for _, p, a in F8}) == 4, 'two profiles are the same picture'

    # THE TIER OVERLAP, PROVED RATHER THAN CLAIMED. 8462/1H Figure 2 is 8462/1F Figure 16 and
    # 8462/1H Figure 6 is 8462/1F Figure 14 with its labels changed -- so the shared builders have
    # to still produce, byte for byte, what the Foundation paper already shipped. `fig14` gained
    # its three arguments for this commit; without this the Foundation cell could have moved
    # underneath it and nothing would have said so.
    have = {}
    for line in FILE.read_text(encoding='utf-8').split('\n'):
        bare = line.strip().rstrip(',')
        if not bare.startswith('{'):
            continue
        row = json.loads(bare)
        rid = row.get('row_id', '')
        if rid in ('Q-AQA-8462-2406-1F-101', 'Q-AQA-8462-2406-1F-072'):
            have[rid] = row.get('diagram', '')
    assert have.get('Q-AQA-8462-2406-1F-101') == F.fig16(), 'Figure 16 has moved under 8462/1F'
    assert have.get('Q-AQA-8462-2406-1F-072') == F.fig14(), 'Figure 14 has moved under 8462/1F'

    # Every drawing lays out inside W, or two of them come out at different sizes on one screen
    for name, s in plan().items():
        for m in re.finditer(r'<svg viewBox="0 0 (\d+) (\d+)"', s):
            assert int(m.group(1)) == W, (name, m.group(0))
            assert int(m.group(2)) < 300, (name, m.group(2))
    return True


def main():
    check()
    todo = plan()
    lines = FILE.read_text(encoding='utf-8').split('\n')
    done, out, notes, cuts = {}, [], 0, 0
    for line in lines:
        bare = line.strip()
        trailing = bare.endswith(',')
        if not bare.startswith('{'):
            out.append(line); continue
        row = json.loads(bare[:-1] if trailing else bare)
        rid = row.get('row_id', '')
        tail = rid[-3:] if rid.startswith('Q-AQA-8462-2406-1H-') else None
        if tail in todo:
            assert not row.get('diagram'), '%s already carries a diagram' % rid
            assert row.get('figure'), '%s has no figure to replace' % rid
            row['diagram'] = todo[tail]
            row['diagram_by'] = 'family'
            for after, upto, put in CUT.get(tail, ()):
                row['html'], _ = cut(row['html'], after, upto, put)
                cuts += 1
            note = row.get('examiner_note', '')
            if note and STALE_NOTE.search(note):
                row.pop('examiner_note')
                notes += 1
            done[tail] = True
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
    missing = sorted(set(todo) - set(done))
    assert not missing, 'rows not found in the file: %r' % missing
    FILE.write_text('\n'.join(out), encoding='utf-8')
    print('%d rows of 8462/1H gained a drawing, across %d figures'
          % (len(done), len({v for v in todo.values()})))
    print('  Figure 2 is 8462/1F Figure 16 and Figure 6 is its Figure 14 relabelled -- one '
          'builder each, proved byte-identical against the rows already in the file')
    print('  Figure 8: %s is the only profile that is both exothermic and labelled downwards'
          % F8_ANSWER)
    print('  %d sentences that stood in for a picture removed, and %d notes saying the figure is '
          'artwork nobody transcribed' % (cuts, notes))


if __name__ == '__main__':
    main()
