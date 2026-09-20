#!/usr/bin/env python3
# ==================================================================================================
# @family. — draw-practicals.py
#
# SEVENTEEN APPARATUS DRAWINGS, WRITTEN INTO `diagram` ON data/practicals.json.
#
# THE RULE IS THE LIBRARY'S OWN AND IT IS NARROW ON PURPOSE. CLAUDE.md: draw only where the row's
# own words determine the picture. "The four sides of a 12 m by 5 m rectangle and one diagonal" is
# a drawing instruction; "a scatter graph whose thirteen points climb steadily" is a SUMMARY, and
# a picture made from it is fourteen points nobody plotted, on a card carrying the exam's
# authority. Every drawing here is a SET-UP or a CONSTRUCTION — a thing you build before the first
# reading — so the kit list and the first three steps determine it exactly.
#
# AND NOT ONE OF THEM IS A RESULT. No cooling curve, no I-V graph, no line of best fit, no density
# tower with its layers already in order — that last one is step 2 of its own method ("predict the
# order from the densities alone"), so drawing it would answer the question the practical asks.
# Same line the `science` paragraphs are written along.
#
# THIRTY-FIVE PRACTICALS GET NOTHING, and `check-practicals.js` prints that as a number rather than
# letting the silence stand — the argument this repository already makes about the 506 questions
# whose figure never came across. Some of the 35 need no picture (a ruler drop, a Punnett square in
# prose); the rest are a backlog somebody can work through.
# ==================================================================================================
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pracdraw import *          # noqa: F401,F403  — the ink, and W

ROOT = os.path.dirname(HERE)
PATH = os.path.join(ROOT, 'data', 'practicals.json')
D = {}


# ---- PR-PH03  resistance of a wire ---------------------------------------------------------------
# THE VOLTMETER IS INSIDE THE LOOP because that is where every textbook puts it, and because a
# meter hanging below the bench wire reads as being in series with it.
def ph03():
    T, B, L, R = 40, 172, 40, 300
    c1, c2 = 106, 246                                  # the two crocodile clips
    p = [hwire(L, R, T, [(92, 10), (162, 11), (252, 13)]),
         vwire(L, T, B), vwire(R, T, B), hwire(L, R, B),
         cell(92, T), switch(162, T), meter(252, T, 'A'),
         cap(92, 24, 'cell'), cap(162, 24, 'switch'),
         # the voltmeter, across the clipped length only
         vwire(c1, B, 112), vwire(c2, B, 112),
         hwire(c1, c2, 112, [(176, 13)]), meter(176, 112, 'V'),
         clip(c1, B), clip(c2, B),
         # the wire, taped along a metre rule
         rect(78, B + 8, 190, 10), ticks(78, B + 18, 190, 20),
         arrow(c1, B + 34, c2, B + 34), lbl(176, B + 30, 'l'),
         cap(176, B + 52, 'the nichrome wire, taped along a metre rule'),
         cap(176, B + 66, 'and clipped at a measured length l')]
    return svg(B + 76, 'Series circuit: cell, switch and ammeter, with a voltmeter across a '
                       'length of nichrome wire taped to a metre rule', *p)


# ---- PR-PH04  I-V characteristics ----------------------------------------------------------------
# ONE CIRCUIT AND A KEY, rather than three circuits. What changes between the three runs is the one
# component in the box; drawing the circuit three times would say the opposite.
def ph04():
    T, B, L, R = 40, 148, 40, 300
    p = [hwire(L, R, T, [(170, 17)]), vwire(L, T, B), vwire(R, T, B),
         hwire(L, R, B, [(92, 10), (170, 17), (252, 13)]),
         rect(153, T - 7, 34, 14), cap(170, 24, 'the component under test'),
         cell(92, B), variable(170, B), meter(252, B, 'A'),
         cap(92, B + 26, 'cell'), cap(170, B + 30, 'variable resistor'),
         vwire(138, T, 96), vwire(202, T, 96), hwire(138, 202, 96, [(170, 13)]),
         meter(170, 96, 'V'),
         # the key: what goes in the box, one at a time
         resistor(66, 196), lamp(170, 196), diode(274, 196),
         hwire(40, 92, 196, [(66, 16)]), hwire(144, 196, 196, [(170, 13)]),
         hwire(248, 300, 196, [(274, 10)]),
         cap(66, 222, 'fixed resistor'), cap(170, 222, 'filament lamp'), cap(274, 222, 'diode')]
    return svg(236, 'A series circuit with an ammeter and a variable resistor and a voltmeter '
                    'across the component, and the three components tested in turn', *p)


# ---- PR-PH01  specific heat capacity -------------------------------------------------------------
def ph01():
    p = [rect(98, 52, 144, 132, 'pt', 'style="stroke-dasharray:5 4;opacity:.6"'),
         cap(88, 122, 'lagging', 'end'), ln(92, 118, 100, 118),
         rect(110, 62, 120, 112),
         cap(170, 202, 'metal block, mass m'),
         # the heater, in the large hole
         rect(136, 62, 14, 92), ln(143, 62, 143, 20),
         ln(143, 20, 96, 20), rect(24, 8, 72, 24), cap(60, 24, 'joulemeter'),
         # the thermometer, in the small one, with a drop of water for contact
         rect(188, 62, 12, 62), rect(190, 22, 8, 96), circ(194, 122, 5),
         cap(250, 40, 'thermometer', 'start'), ln(210, 44, 244, 36),
         cap(170, 218, 'a drop of water in the small hole makes the contact')]
    return svg(228, 'A lagged metal block with an immersion heater in the large hole wired to a '
                    'joulemeter, and a thermometer in the small hole', *p)


# ---- PR-PH05  density, by displacement -----------------------------------------------------------
def ph05():
    p = [poly([(46, 52), (46, 158), (150, 158), (150, 52)]),          # eureka can, open top
         ln(150, 72, 184, 80), ln(150, 84, 184, 92),                  # the spout
         ln(184, 80, 184, 92),
         ln(46, 72, 150, 72), cap(98, 176, 'eureka can, filled to the spout'),
         ln(186, 92, 198, 116), head(12, 24, 198, 116, 6),            # the water leaving it
         circ(98, 112, 17), ln(98, 28, 98, 95), cap(98, 20, 'object on a thread'),
         poly([(184, 122), (184, 190), (232, 190), (232, 122)]),      # measuring cylinder
         ln(184, 150, 232, 150),
         ''.join(ln(184, 186 - 9 * i, 192, 186 - 9 * i) for i in range(8)),
         cap(246, 150, 'the water it', 'start'), cap(246, 164, 'pushed aside', 'start'),
         cap(120, 214, 'its volume is the volume of that water')]
    return svg(224, 'An object lowered into a eureka can filled to the spout, with the displaced '
                    'water collected in a measuring cylinder', *p)


# ---- PR-PH06  Hooke's law ------------------------------------------------------------------------
def ph06():
    p = [stand(58, 28, 226, 34, 112), rect(65, 40, 58, 11), cap(94, 34, 'clamp'),
         spring(112, 51, 124), cap(74, 92, 'spring', 'end'), ln(78, 88, 100, 88),
         ln(112, 124, 112, 134), rect(94, 134, 36, 13), rect(94, 147, 36, 13),
         cap(112, 176, '100 g masses'),
         ln(130, 124, 158, 124), head(28, 0, 158, 124, 5.5), cap(152, 116, 'pointer', 'end'),
         rect(164, 28, 18, 208),
         ''.join(ln(164, 36 + 8 * i, 164 + (9 if i % 5 else 15), 36 + 8 * i) for i in range(25)),
         cap(216, 132, 'rule, clamped', 'start'), cap(216, 146, 'beside the spring', 'start'),
         cap(170, 250, 'extension is the CHANGE in length, not the length')]
    return svg(260, 'A spring hanging from a clamp stand beside a vertical rule, with a pointer '
                    'and slotted masses on the bottom', *p)


# ---- PR-PH07  force and acceleration -------------------------------------------------------------
def ph07():
    p = [ln(22, 132, 258, 122), ln(22, 132, 22, 142), cap(60, 158, 'runway, tilted just enough'),
         cap(60, 172, 'to cancel friction'),
         rect(72, 100, 52, 20), circ(82, 124, 5), circ(114, 124, 5),   # trolley
         rect(88, 74, 22, 24), cap(99, 66, 'card'),
         poly([(150, 70), (150, 118)]), poly([(150, 70), (166, 70)]),  # light gates
         poly([(196, 70), (196, 118)]), poly([(196, 70), (212, 70)]),
         cap(174, 58, 'light gates'),
         ln(124, 108, 254, 104), circ(264, 106, 11), ln(264, 95, 264, 88),  # pulley
         ln(275, 106, 275, 178), cap(292, 100, 'pulley', 'start'),
         rect(263, 178, 24, 12), rect(263, 190, 24, 12),
         cap(275, 218, 'hanger'),
         cap(170, 244, 'move masses from the trolley to the hanger, never on to it —'),
         cap(170, 258, 'the total being accelerated has to stay the same')]
    return svg(268, 'A trolley on a tilted runway pulled by a string over a pulley to a hanger, '
                    'with a card passing through two light gates', *p)


# ---- PR-PH09  reflection and refraction ----------------------------------------------------------
# THE ONE DRAWING HERE THAT IS ALSO THE CONSTRUCTION. The student draws round the block, draws the
# normal and marks the ray with crosses; this is that page.
def ph09():
    import math
    ex, ey = 140.0, 100.0                       # where the ray enters
    i, r = 30.0, 19.5                           # 30 degrees in, n = 1.5 out
    Lb = 62.0
    sx = ex + Lb * math.sin(math.radians(r)); sy = 160.0
    p = [rect(86, 100, 168, 60), cap(212, 136, 'glass block'),
         dash(ex, 46, ex, 134), dash(sx, 126, sx, 208), cap(ex, 38, 'normal'),
         ln(ex - 74 * math.sin(math.radians(i)), ey - 74 * math.cos(math.radians(i)), ex, ey),
         midhead(ex - 74 * math.sin(math.radians(i)), ey - 74 * math.cos(math.radians(i)), ex, ey),
         ln(ex, ey, sx, sy), midhead(ex, ey, sx, sy),
         ln(sx, sy, sx + 68 * math.sin(math.radians(i)), sy + 68 * math.cos(math.radians(i))),
         midhead(sx, sy, sx + 68 * math.sin(math.radians(i)),
                 sy + 68 * math.cos(math.radians(i)), .6),
         arc(ex, ey, 34, 270, 270 - i), lbl(ex - 15, ey - 42, 'i'),
         arc(ex, ey, 34, 90 - r, 90), lbl(ex + 11, ey + 48, 'r'),
         cap(170, 234, 'both angles are measured from the NORMAL, never from the surface')]
    return svg(244, 'A single ray entering a rectangular glass block, bending towards the normal, '
                    'and leaving parallel to the way it came in', *p)


# ---- PR-PH10  infrared radiation, from above -----------------------------------------------------
# A PLAN VIEW, BECAUSE THE POINT IS THAT ALL FOUR FACES EXIST. Drawn from the front, three of them
# are behind the cube and the one thing the picture has to say — turn the cube, not the detector —
# cannot be said at all.
def ph10():
    p = [rect(64, 56, 92, 92), cap(110, 106, 'Leslie cube'), cap(110, 120, 'seen from above'),
         cap(110, 46, 'shiny black'), cap(110, 166, 'matt white'),
         cap(58, 106, 'matt', 'end'), cap(58, 120, 'black', 'end'),
         cap(162, 100, 'shiny', 'start'), cap(162, 114, 'silver', 'start'),
         poly([(258, 86), (258, 118), (284, 118), (284, 86)]),
         poly([(258, 94), (248, 100), (248, 104), (258, 110)]),
         cap(271, 76, 'detector'),
         stand(294, 60, 212, 268, 66),
         arrow(158, 170, 246, 170), cap(170, 194, 'the same distance, every time'),
         cap(170, 240, 'turn the CUBE, never the detector — otherwise the surface'),
         cap(170, 254, 'is not the only thing that changed')]
    return svg(264, 'A Leslie cube seen from above with its four faces named, and an infrared '
                    'detector on a stand at a fixed distance from one face', *p)


# ---- PR-CH02  titration --------------------------------------------------------------------------
def ch02():
    p = [stand(58, 24, 216, 30, 84),
         rect(65, 70, 86, 13), cap(108, 66, 'burette clamp'),
         rect(150, 22, 18, 140), ''.join(ln(150, 34 + 9 * k, 150 + (6 if k % 5 else 11), 34 + 9 * k)
                                         for k in range(14)),
         circ(159, 168, 7), ln(166, 168, 176, 162), cap(196, 120, 'burette', 'start'),
         ln(159, 175, 159, 186),
         rect(151, 190, 16, 14),                                    # the flask neck
         poly([(151, 204), (120, 240), (198, 240), (167, 204)]),
         ln(126, 232, 192, 232), cap(240, 220, '25.0 cm³ of', 'start'),
         cap(240, 234, 'alkali', 'start'),
         rect(106, 240, 106, 9), cap(159, 264, 'white tile — the endpoint is a colour,'),
         cap(159, 278, 'and you cannot see a colour against a bench')]
    return svg(288, 'A burette clamped above a conical flask standing on a white tile', *p)


# ---- PR-CH06  chromatography ---------------------------------------------------------------------
# THE THREE LEVELS ARE THE WHOLE PICTURE: the paper dips into the solvent, the pencil line sits
# ABOVE it, and the front is read wherever it has got to when the paper comes out.
def ch06():
    p = [ln(52, 48, 268, 48), circ(160, 48, 4),                     # rod and clip
         poly([(70, 62), (70, 196), (250, 196), (250, 62)]),        # beaker
         ln(72, 166, 248, 166), cap(292, 170, 'solvent', 'start'),
         ln(262, 166, 286, 166),
         rect(136, 48, 48, 132),                                    # the paper
         dash(136, 146, 184, 146), cap(110, 150, 'pencil line', 'end'), ln(114, 146, 132, 146),
         circ(146, 146, 3.4), circ(160, 146, 3.4), circ(174, 146, 3.4),
         dash(136, 88, 184, 88), cap(292, 92, 'solvent', 'start'), cap(292, 106, 'front', 'start'),
         ln(188, 88, 286, 88),
         cap(160, 222, 'the paper dips in; the pencil line does NOT —'),
         cap(160, 236, 'below the solvent and the spots wash straight off')]
    return svg(246, 'Chromatography paper hanging from a rod into a beaker of solvent, with the '
                    'pencil line and its spots above the solvent level', *p)


# ---- PR-CH08  distillation -----------------------------------------------------------------------
def ch08():
    p = [circ(76, 156, 30), rect(66, 88, 20, 42),                   # flask and neck
         rect(70, 24, 10, 82), circ(75, 110, 4.5),                  # thermometer and its bulb
         cap(96, 20, 'thermometer', 'start'), ln(82, 30, 92, 24),
         dash(40, 110, 152, 110),
         ln(86, 110, 152, 110),                                     # the side arm
         rect(152, 96, 122, 28), ln(148, 104, 284, 104), ln(148, 116, 284, 116),
         cap(213, 88, 'condenser'),
         ln(268, 124, 276, 140), head(8, 16, 276, 140, 5.5), cap(300, 150, 'water in', 'start'),
         ln(158, 96, 150, 80), head(-8, -16, 150, 80, 5.5), cap(140, 72, 'water out', 'end'),
         ln(284, 110, 284, 148),
         poly([(258, 152), (258, 208), (310, 208), (310, 152)]),
         ln(258, 186, 310, 186), cap(284, 226, 'distillate'),
         path('M 62 192 Q 76 166 90 192'), rect(69, 192, 14, 22),   # the flame and burner
         cap(76, 232, 'heat'),
         cap(170, 256, 'the bulb sits LEVEL with the side arm — what it has to'),
         cap(170, 270, 'measure is the VAPOUR going over, not the liquid below')]
    return svg(282, 'A distillation set-up: a flask over a flame with a thermometer whose bulb is '
                    'level with the side arm, a condenser with water flowing the other way, and a '
                    'beaker for the distillate', *p)


# ---- PR-BI06  photosynthesis ---------------------------------------------------------------------
def bi06():
    p = [circ(36, 96, 13), rect(30, 109, 12, 14),
         ''.join(ln(52, 88 + 8 * k, 64, 88 + 8 * k) for k in range(3)),
         cap(36, 142, 'lamp'),
         poly([(82, 58), (82, 152), (134, 152), (134, 58)]),        # the heat shield
         ln(84, 70, 132, 70), cap(108, 172, 'beaker of water:'), cap(108, 186, 'the heat shield'),
         poly([(164, 42), (164, 150)]), poly([(200, 42), (200, 150)]),
         path('M 164 150 Q 182 166 200 150'),                       # boiling tube
         ln(164, 56, 200, 56),
         ln(182, 148, 182, 78), ''.join(path('M 182 %d Q 172 %d 176 %d' % (y, y - 5, y - 10))
                                        for y in (138, 120, 102)),
         circ(186, 70, 3), circ(191, 62, 2.4), circ(185, 54, 2),
         cap(238, 66, 'bubbles counted', 'start'), cap(238, 80, 'from the cut end', 'start'),
         ln(216, 62, 234, 62),
         arrow(36, 206, 182, 206), lbl(109, 200, 'd'),
         cap(170, 228, 'move the lamp; the beaker of water keeps the heat off')]
    return svg(238, 'A lamp shining through a beaker of water at a boiling tube of pondweed, with '
                    'the distance from lamp to tube marked d', *p)


# ---- PR-FN01  radius of the Earth ----------------------------------------------------------------
# THIS ONE IS THE DERIVATION. R = d squared over 2h is a line of algebra with a right-angled
# triangle behind it, and the triangle is what a student can actually hold on to.
def fn01():
    import math
    O = (150.0, 178.0); R = 112.0
    P = (150.0, 46.0)
    a = math.acos(R / (O[1] - P[1]))
    T = (O[0] + R * math.sin(a), O[1] - R * math.cos(a))
    p = [path('M %.1f %.1f A %.1f %.1f 0 0 1 %.1f %.1f'
              % (O[0] - R * .93, O[1] - R * .37, R, R, O[0] + R * .93, O[1] - R * .37)),
         dash(O[0], O[1], P[0], P[1]), ln(O[0], O[1], T[0], T[1]), ln(P[0], P[1], T[0], T[1]),
         dot(O[0], O[1]), dot(P[0], P[1]), dot(T[0], T[1]),
         rightangle(T[0], T[1], O[0], O[1], P[0], P[1]),
         lbl(O[0] - 8, 124, 'R + h', 'end'), lbl(196, 136, 'R'), lbl(200, 54, 'd'),
         cap(O[0], O[1] + 18, 'centre of the Earth'),
         cap(P[0] - 10, P[1] - 8, 'you, h above the ground', 'end'),
         cap(T[0] + 12, T[1] - 6, 'the horizon', 'start'),
         ln(O[0], O[1] - R, O[0], P[1]),
         cap(170, 236, 'the sightline just grazes the surface, so it is a TANGENT —'),
         cap(170, 250, 'and a tangent meets the radius at 90°')]
    return svg(260, 'The centre of the Earth, a viewpoint h above the surface, and the tangent '
                    'sightline meeting the radius at the horizon at a right angle', *p)


# ---- PR-FN03  height by clinometer ---------------------------------------------------------------
def fn03():
    import math
    E = (62.0, 122.0); TOPX = 256.0
    top = (TOPX, 40.0)
    p = [ln(16, 176, 324, 176),
         circ(62, 98, 7), ln(62, 105, 62, 142), ln(62, 142, 53, 176), ln(62, 142, 71, 176),
         ln(62, 116, 80, 110),
         dash(E[0], E[1], TOPX + 20, E[1]),
         rect(250, 66, 12, 110), circ(256, 52, 22),
         ln(E[0], E[1], top[0], top[1]), midhead(E[0], E[1], top[0], top[1], .58),
         arc(E[0], E[1], 34, 0, -math.degrees(math.atan2(E[1] - top[1], top[0] - E[0]))),
         lbl(E[0] + 44, E[1] - 8, 'θ'),
         arrow(TOPX + 30, E[1], TOPX + 30, top[1]), cap(312, 86, 'height'),
         cap(312, 100, 'above'), cap(312, 114, 'your eye'),
         arrow(38, E[1], 38, 176), cap(30, 152, 'eye', 'end'), cap(30, 166, 'height', 'end'),
         arrow(E[0], 192, TOPX, 192), cap(159, 210, 'horizontal distance'),
         cap(170, 238, 'height = distance × tan θ + eye height — the triangle'),
         cap(170, 252, 'starts at your EYE, which is why the last term is there')]
    return svg(262, 'A person sighting the top of a tree through a clinometer, with the angle of '
                    'elevation, the horizontal distance and the eye height all marked', *p)


# ---- PR-FN05  Buffon's needle --------------------------------------------------------------------
STICKS = [((60, 55), (95, 74)), ((120, 65), (140, 100)), ((170, 45), (210, 45)),
          ((240, 62), (258, 98)), ((55, 105), (85, 131)), ((120, 125), (155, 144)),
          ((200, 140), (238, 152)), ((260, 108), (280, 143))]


def fn05():
    p = [''.join(ln(30, y, 310, y, 'axis') for y in (40, 80, 120, 160))]
    for (x1, y1), (x2, y2) in STICKS:
        p.append(ln(x1, y1, x2, y2))
        for gy in (40, 80, 120, 160):
            if (y1 - gy) * (y2 - gy) < 0:
                t = (gy - y1) / float(y2 - y1)
                p.append(circ(x1 + (x2 - x1) * t, gy, 5))
    p += [arrow(18, 40, 18, 80), cap(170, 182, 'the lines are exactly ONE STICK LENGTH apart'),
          cap(170, 196, 'count every stick dropped, and every one touching a line')]
    return svg(206, 'Sticks dropped across a set of parallel lines one stick-length apart, with '
                    'each crossing point ringed', *p)


# ---- PR-FN06  Monte Carlo pi ---------------------------------------------------------------------
# THE GRAINS ARE ALL DRAWN ALIKE. Marking the ones inside the arc would be doing the count, which
# is the experiment.
GRAINS = [(92, 44), (134, 32), (186, 58), (228, 40), (110, 88), (156, 104), (204, 92), (246, 120),
          (86, 132), (128, 150), (172, 138), (216, 166), (98, 178), (142, 192), (188, 182),
          (232, 196), (114, 62), (166, 74), (238, 70), (96, 110), (180, 118), (222, 146),
          (120, 116), (150, 58), (200, 160), (136, 172), (244, 96), (106, 152), (162, 164),
          (210, 46)]


def fn06():
    p = [rect(70, 22, 180, 180),
         path('M 250 202 A 180 180 0 0 0 70 22'),
         ''.join(dot(x, y, 2.4) for x, y in GRAINS),
         arrow(70, 216, 250, 216), lbl(160, 230, 'r'),
         arrow(262, 22, 262, 202), lbl(276, 116, 'r'),
         cap(160, 252, 'the quarter circle is πr²/4 and the square is r²,'),
         cap(160, 266, 'so the grains inside, over the total, estimates π/4')]
    return svg(276, 'A square of card with a quarter circle drawn from one corner, radius equal to '
                    'the side, with grains scattered over the whole square', *p)


# ---- PR-FN10  the river, in section --------------------------------------------------------------
def fn10():
    p = [path('M 20 52 L 62 136 Q 170 176 278 136 L 320 52'),
         ln(41, 98, 299, 98),
         arrow(41, 82, 299, 82), lbl(170, 76, 'w'),
         dash(116, 98, 116, 152), dash(170, 98, 170, 157), dash(224, 98, 224, 152),
         lbl(108, 130, 'd'), lbl(162, 134, 'd'), lbl(216, 130, 'd'),
         txt(113, 134, '1', 'num'), txt(167, 138, '2', 'num'), txt(221, 134, '3', 'num'),
         cap(170, 190, 'the depth is different everywhere, so it is meaned —'),
         cap(170, 204, 'width × mean depth is the area the water flows through'),
         cap(170, 226, 'and a float only ever measures the SURFACE, which runs'),
         cap(170, 240, 'faster than the water dragging along the bed')]
    return svg(250, 'A cross-section of a river showing the water surface, the width and three '
                    'depths measured across the channel', *p)


D = {'PR-PH01': ph01, 'PR-PH03': ph03, 'PR-PH04': ph04, 'PR-PH05': ph05, 'PR-PH06': ph06,
     'PR-PH07': ph07, 'PR-PH09': ph09, 'PR-PH10': ph10, 'PR-CH02': ch02, 'PR-CH06': ch06,
     'PR-CH08': ch08, 'PR-BI06': bi06, 'PR-FN01': fn01, 'PR-FN03': fn03, 'PR-FN05': fn05,
     'PR-FN06': fn06, 'PR-FN10': fn10}


# ---- what has to be true --------------------------------------------------------------------------
def build():
    made = {}
    for pid, fn in D.items():
        s = fn()
        assert s.startswith('<svg viewBox="0 0 %d ' % W), pid + ': not laid out inside W'
        assert 'fill="' not in s.replace('fill="currentColor"', '').replace('fill="none"', ''), \
            pid + ': a fill that is neither none nor currentColor will not work on both palettes'
        assert 'text-anchor="' not in s, pid + ': an anchor ATTRIBUTE loses to .qsheet .num'
        assert 'aria-label' in s and len(s) > 400, pid + ': too thin to be a drawing'
        assert '<marker' not in s, pid + ': a marker id would collide with the next card'
        made[pid] = s
    return made


made = build()
lines = open(PATH, encoding='utf-8').read().rstrip('\n').split('\n')
assert lines[0].strip() == '[' and lines[-1].strip() == ']'
out, seen = [lines[0]], set()
for raw in lines[1:-1]:
    s = raw.strip(); trailing = ',' if s.endswith(',') else ''
    row = json.loads(s.rstrip(','))
    pid = row['practical_id']
    if pid in made:
        assert not row.get('excluded_reason'), pid + ' is refused and must not get a diagram'
        assert row.get('steps'), pid + ' has no method for the drawing to sit above'
        new = {}
        for k, v in row.items():
            new[k] = v
            if k == 'variables':
                new['diagram'] = made[pid]
        assert 'diagram' in new, pid + ': nowhere to put it'
        row = new; seen.add(pid)
    out.append(json.dumps(row, ensure_ascii=False) + trailing)
out.append(lines[-1])
assert set(made) == seen, 'never found: ' + ', '.join(sorted(set(made) - seen))
open(PATH, 'w', encoding='utf-8').write('\n'.join(out) + '\n')

rows = [json.loads(l.strip().rstrip(',')) for l in out[1:-1]]
live = [r for r in rows if not r.get('excluded_reason')]
print('drawings written : %d' % len(seen))
print('live practicals  : %d, of which %d carry one'
      % (len(live), sum(1 for r in live if r.get('diagram'))))
print('biggest          : %s'
      % max(((len(made[k]), k) for k in made))[1])
print('total bytes      : %d' % sum(len(v) for v in made.values()))
