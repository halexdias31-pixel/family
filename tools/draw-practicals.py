#!/usr/bin/env python3
# ==================================================================================================
# @family. — draw-practicals.py
#
# THE APPARATUS DRAWINGS, WRITTEN INTO `diagram` ON data/practicals.json. This is the only writer of
# that column: a second script would be a second hand on one cell, which is the fault CLAUDE.md
# records every time two readers or two writers of one fact appear.
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
# FOUR ROWS SHOW WHERE THAT LINE FALLS. The periscope, the slinky and the electromagnet each get a
# drawing of the CONSTRUCTION — the box, the stretched spring, the wound nail — and nothing of the
# ray path, of either wave type, or of the field. All three of those are the student's own drawing
# and all three rows say so in as many words. The lava lamp gets nothing at all, because its step 2
# is "ask which is on top and why before saying anything", and the only thing there is to draw is
# the answer to that.
#
# AND EVERY ROW WITHOUT ONE SAYS WHY, in `NO_DRAWING` in check-practicals.js: one entry, one
# sentence, and a live row with neither a drawing nor an entry fails. A printed count on its own
# reads the same whether those rows were judged or forgotten, which is what that list is for. The
# count itself is printed off the run rather than typed into a sentence here — the "all 18 checks
# pass" fault.
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
         # THE STAND'S ROD RAN THROUGH "spr", and 13 units between the rod and the pointer cannot
         # hold the word -- so it sits above the pointer, starting just inside the rod.
         spring(112, 51, 124), cap(68, 82, 'spring', 'start'), ln(78, 88, 100, 88),
         ln(112, 124, 112, 134), rect(94, 134, 36, 13), rect(94, 147, 36, 13),
         cap(112, 176, '100 g masses'),
         ln(130, 124, 158, 124), head(28, 0, 158, 124, 5.5), cap(155, 116, 'pointer', 'end'),
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
         arc(ex, ey, 34, 90 - r, 90), lbl(ex + 8, ey + 48, 'r'),       # off the ray, inside its angle
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
         # THE BEAKER WALL RAN THROUGH "pe": 43 units between the wall and the pointer cannot hold
         # the words, so they sit above the pointer, starting inside the wall.
         dash(136, 146, 184, 146), cap(73, 141, 'pencil line', 'start'), ln(114, 146, 132, 146),
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
         bunsen(76, 192),                                     # the flame and the barrel
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
         person(62, 176), ln(62, 116, 80, 110),
         dash(E[0], E[1], TOPX + 20, E[1]),
         rect(250, 66, 12, 110), circ(256, 52, 22),
         ln(E[0], E[1], top[0], top[1]), midhead(E[0], E[1], top[0], top[1], .58),
         arc(E[0], E[1], 34, 0, -math.degrees(math.atan2(E[1] - top[1], top[0] - E[0]))),
         lbl(E[0] + 44, E[1] - 4, 'θ'),        # down off the sight line, still inside the angle
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
         # EACH d\u2096 FIVE UNITS LEFT OF ITS DASHED LINE, which ran through the subscript, and the
         # subscript a unit and a half further from the italic d it was overlapping.
         lbl(103, 130, 'd'), lbl(157, 134, 'd'), lbl(211, 130, 'd'),
         txt(109.5, 134, '1', 'num'), txt(163.5, 138, '2', 'num'), txt(217.5, 134, '3', 'num'),
         cap(170, 190, 'the depth is different everywhere, so it is meaned —'),
         cap(170, 204, 'width × mean depth is the area the water flows through'),
         cap(170, 226, 'and a float only ever measures the SURFACE, which runs'),
         cap(170, 240, 'faster than the water dragging along the bed')]
    return svg(250, 'A cross-section of a river showing the water surface, the width and three '
                    'depths measured across the channel', *p)


# ==================================================================================================
# THE SECOND SET. Everything below was added when the ask was to finish the drawings for all the
# practicals; the rule is the same one, applied to the rest of the list rather than relaxed for it.
# ==================================================================================================

# ---- PR-PH02  thermal insulation -----------------------------------------------------------------
# THE LID IS THE POINT. Every other part of this is named in the kit list and needs no picture; a
# beaker with an open top loses heat off the water surface at a rate the lagging cannot touch, so
# "lid with a hole" is the one item whose PLACE has to be shown, with the bulb under it and in the
# water rather than resting on the glass.
def ph02():
    p = [beaker(112, 74, 116, 128, 100),
         rect(100, 74, 12, 128, 'pt', 'style="stroke-dasharray:5 4;opacity:.65"'),
         rect(228, 74, 12, 128, 'pt', 'style="stroke-dasharray:5 4;opacity:.65"'),
         cap(88, 130, 'one layer', 'end'), cap(88, 144, 'of material', 'end'),
         ln(92, 126, 100, 126),
         ln(96, 150, 244, 150), ln(96, 156, 244, 156), cap(266, 156, 'elastic band', 'start'),
         # the lid, in two pieces, with the gap the thermometer goes through
         rect(104, 64, 58, 10), rect(178, 64, 58, 10),
         rect(165, 18, 10, 104), circ(170, 122, 5),
         cap(200, 30, 'thermometer', 'start'), ln(178, 34, 196, 28),
         rect(94, 202, 152, 9), cap(170, 228, 'heatproof mat'),
         cap(170, 252, 'the lid is not optional — an open beaker loses heat off the'),
         cap(170, 266, 'water surface faster than any wrapping can stop, and the'),
         cap(170, 280, 'material then gets the blame for it')]
    return svg(290, 'A beaker of hot water wrapped in insulating material and held with an '
                    'elastic band, standing on a heatproof mat, with a lid in two pieces and a '
                    'thermometer through the gap', *p)


# ---- PR-PH08  the ripple tank, in section --------------------------------------------------------
# A SECTION, BECAUSE THE ARRANGEMENT IS VERTICAL. Lamp above, water in the middle, card below — and
# "project the pattern on to the card below" is a sentence that reads as though the card were a
# screen standing up behind the tank. It is on the floor, and the tank's bottom is glass.
# THE PATTERN ITSELF IS NOT DRAWN. Ten wavelengths measured off it is the reading.
def ph08():
    p = [circ(120, 34, 12), ''.join(ln(112, 28 + 6 * k, 128, 28 + 6 * k) for k in range(3)),
         cap(120, 18, 'lamp'),
         ''.join(ln(120 + 16 * k, 50, 120 + 24 * k, 84) for k in (-2, -1, 0, 1)),
         # the tank, in section
         ln(56, 104, 56, 144), ln(284, 104, 284, 144), ln(56, 144, 284, 144),
         ln(56, 122, 284, 122),
         cap(40, 118, 'water', 'end'),
         # the dipper, hung from the right so it is clear of the light
         ln(250, 56, 250, 112), rect(206, 112, 60, 9),
         cap(276, 68, 'dipper', 'start'), ln(256, 72, 272, 72),
         # the card, on the floor
         rect(56, 180, 228, 9),
         cap(170, 208, 'white card, on the FLOOR — the tank has a glass bottom'),
         cap(170, 222, 'and the pattern is projected straight down on to it'),
         cap(170, 244, 'a shallow, even depth: check the tank with a level before'),
         cap(170, 258, 'the water goes in, not after')]
    return svg(268, 'A ripple tank in section with a lamp above it and a white card on the floor '
                    'below, and a dipper hanging into the water', *p)


# ---- PR-CH01  making a soluble salt --------------------------------------------------------------
# TWO STAGES, BECAUSE THE METHOD IS TWO SET-UPS and the second one is where it goes wrong: a basin
# heated until it is dry gives a powder rather than crystals.
def ch01():
    p = [# 1 - filtration
         poly([(56, 60), (88, 112), (120, 60)]),
         path('M 62 66 L 88 108 L 114 66', 'pt', 'style="stroke-dasharray:4 3;opacity:.7"'),
         cap(88, 36, 'filter paper, folded'), cap(88, 50, 'into a cone'),
         rect(84, 112, 8, 16),
         flask(88, 128, 142, 188),
         ln(60, 180, 116, 180),
         cap(88, 212, '1 · filter off the copper oxide'),
         cap(88, 226, 'that did not dissolve'),
         # 2 - crystallisation
         poly([(212, 108), (222, 132), (270, 132), (280, 108)]),
         ln(214, 116, 278, 116),
         ln(204, 136, 288, 136),
         ln(212, 136, 204, 176), ln(280, 136, 288, 176),
         bunsen(246, 176),
         cap(246, 212, '2 · warm the blue filtrate and STOP'),
         cap(246, 226, 'the moment crystals show at the edge'),
         cap(170, 256, 'heated dry it is a powder; left to cool slowly it is crystals,'),
         cap(170, 270, 'and the crystals are what the practical is for')]
    return svg(280, 'A filter funnel with folded filter paper standing in a conical flask, and an '
                    'evaporating basin on a tripod over a Bunsen burner', *p)


# ---- PR-CH03  electrolysis of solutions ----------------------------------------------------------
# THE POLARITY IS WIRING AND IS DRAWN; WHAT COMES OFF EACH ELECTRODE IS THE ANSWER AND IS NOT.
# The electrodes are clamped so they do not touch, which is a thing you can see and cannot say.
def ch03():
    p = [rect(118, 20, 104, 28), cap(170, 38, 'd.c. supply, ≈ 4 V'),
         ln(136, 48, 136, 66), ln(204, 48, 204, 66),
         txt(126, 62, '−', 'lbl'), txt(214, 62, '+', 'lbl'),
         beaker(78, 82, 184, 118, 102),
         rect(130, 66, 12, 116), rect(198, 66, 12, 116),
         cap(68, 150, 'graphite', 'end'), cap(68, 164, 'electrodes', 'end'),
         ln(72, 152, 128, 152),
         arrow(142, 194, 198, 194), cap(170, 216, 'clamped so they do NOT touch'),
         cap(302, 106, 'the', 'start'), cap(302, 120, 'solution', 'start'),
         ln(264, 102, 298, 102),
         cap(170, 244, 'a gas is collected in a tube inverted over the electrode it'),
         cap(170, 258, 'comes off, and then tested — a glowing splint, or damp litmus')]
    return svg(268, 'A beaker of solution with two graphite electrodes clamped apart, wired to the '
                    'negative and positive terminals of a d.c. supply', *p)


# ---- PR-CH05  rates of reaction, both methods ----------------------------------------------------
def ch05():
    p = [# the disappearing cross, from the side, with the sightline that makes it work
         flask(88, 78, 120, 176),
         ln(58, 166, 118, 166),
         rect(44, 176, 88, 9),
         ln(76, 178, 100, 183), ln(100, 178, 76, 183),
         circ(88, 34, 8), ln(80, 34, 72, 30), dash(88, 44, 88, 172),
         cap(88, 20, 'you look DOWN'),
         cap(88, 206, '1 · time the cross out of sight'),
         # the gas syringe, for the marble chips
         flask(228, 96, 132, 176),
         ln(204, 168, 252, 168),
         ''.join(circ(214 + 9 * k, 172 - 3 * (k % 2), 4) for k in range(5)),
         rect(220, 88, 16, 10),
         ln(236, 93, 262, 93),
         rect(262, 82, 54, 22), ln(286, 82, 286, 104), ln(286, 93, 314, 93),
         cap(289, 74, 'gas syringe'),
         cap(228, 206, '2 · time the gas given off'),
         cap(170, 236, 'keep the TOTAL volume the same on every run — diluting'),
         cap(170, 250, 'to 40 cm³ and topping up with 10 cm³ of water, and so on')]
    return svg(260, 'A conical flask standing on paper marked with a cross, seen from the side '
                    'with the line of sight down through it, and a flask of marble chips with a '
                    'bung and a gas syringe', *p)


# ---- PR-CH07  the flame test ---------------------------------------------------------------------
# THE LOOP'S POSITION IS THE WHOLE DRAWING. "Hold it at the edge of a blue flame" is three words
# about a place, and the place is beside the pale inner cone rather than inside it.
def ch07():
    p = [rect(93, 150, 14, 34), rect(76, 184, 48, 9),
         path('M 80 150 Q 100 86 120 150'),
         path('M 90 150 Q 100 118 110 150'),
         cap(140, 132, 'the pale inner cone', 'start'), ln(116, 128, 136, 128),
         ln(122, 108, 168, 96), circ(118, 109, 5),
         # OFF THE TEST TUBE: centred at 240 both lines ran through its left wall, and they name the
         # loop, which is to the left anyway.
         cap(196, 64, 'the loop, at the'), cap(196, 78, 'EDGE of the flame'),
         # the tube the hydroxide tests are done in
         tube(268, 40, 150, 34, 14, 96),
         rect(263, 14, 10, 20), path('M 263 34 L 268 44 L 273 34'),
         cap(268, 174, 'and the hydroxide'), cap(268, 188, 'tests, dropwise'),
         cap(170, 220, 'clean the loop in acid and hold it in the flame until it shows'),
         cap(170, 234, 'no colour at all — otherwise the last sample is the reading')]
    return svg(244, 'A Bunsen burner with its pale inner cone, a nichrome loop held at the edge of '
                    'the flame, and a test tube with a dropping pipette above it', *p)

# ---- PR-BI01  mounting a slide -------------------------------------------------------------------
# THE COVERSLIP GOING DOWN AT AN ANGLE IS THE DRAWING. Everything else on this row is a named piece
# of kit; "lower the coverslip at an angle with a mounted needle to avoid air bubbles" is a MOTION,
# and a bubble is the one fault that cannot be focused out afterwards.
def bi01():
    p = [rect(46, 156, 250, 10),
         path('M 112 156 Q 158 128 204 156'), cap(158, 188, 'one drop of iodine'),
         ln(126, 156, 190, 156, 'axis'),
         cap(100, 142, 'the specimen', 'end'), ln(104, 146, 132, 152),
         # the coverslip, one edge already in the drop and the rest still up
         poly([(112, 154), (232, 84)]), poly([(114, 158), (234, 88)]),
         # LEFT OF THE NEEDLE, NOT ACROSS IT: at 256 the needle ran through "cov" (check/diagrams.js).
         cap(226, 72, 'coverslip', 'end'),
         # the needle, holding the far edge up
         ln(233, 86, 274, 62), rect(272, 52, 26, 8),
         cap(296, 106, 'mounted', 'end'), cap(296, 120, 'needle', 'end'),
         ln(266, 74, 276, 96),
         arc(112, 156, 62, -30, -4), midhead(196, 110, 178, 126, 1),
         cap(196, 132, 'and then down', 'start'),
         cap(170, 214, 'ONE EDGE TOUCHES THE DROP FIRST, and the needle lets the'),
         cap(170, 228, 'rest of it down slowly, so the water pushes the air out ahead'),
         cap(170, 242, 'of it — dropped flat, the bubble it traps is a black ring you'),
         cap(170, 256, 'cannot focus through and cannot get rid of')]
    return svg(266, 'A microscope slide with a drop of stain over the specimen and a coverslip '
                    'held at an angle on a mounted needle, one edge already touching the drop', *p)


# ---- PR-BI02  the agar plate, from above ---------------------------------------------------------
# NO ZONES. The clear ring round each disc is the reading, measured and turned into an area, so a
# plate drawn with rings on it has done the experiment. What is drawn is where the discs go and
# where the tape goes, and the control disc, which is the one people leave out.
def bi02():
    p = [circ(168, 116, 88), circ(168, 116, 82, 'pt', 'style="opacity:.5"'),
         circ(126, 78, 9), circ(210, 78, 9), circ(126, 154, 9), circ(210, 154, 9),
         circ(168, 116, 9, 'pt', 'style="stroke-dasharray:3 2"'),
         txt(126, 82, 'A', 'num'), txt(210, 82, 'B', 'num'),
         txt(126, 158, 'C', 'num'), txt(210, 158, 'D', 'num'),
         ln(168, 130, 168, 200, 'axis'),
         cap(170, 226, 'the middle disc is sterile water — the control'),
         rect(106, 22, 26, 14), rect(204, 196, 26, 14),
         cap(88, 30, 'tape', 'end'), cap(248, 208, 'tape', 'start'),
         cap(170, 254, 'TAPED IN TWO PLACES, never all the way round, and never'),
         cap(170, 268, 'reopened once it is shut'),
         cap(170, 290, 'incubated upside down at 25 °C — above that, a school plate'),
         cap(170, 304, 'starts selecting for things that grow at body temperature')]
    return svg(314, 'An agar plate seen from above with four antiseptic discs spread out on it, a '
                    'dashed control disc in the middle, and tape across the rim in two places', *p)


# ---- PR-BI03  osmosis ----------------------------------------------------------------------------
# FIVE TUBES AND ONE CYLINDER EACH, which is the set-up. The mass change is the reading and there
# is nothing of it in the picture; what the picture says is that the five cylinders start the same,
# which is the condition the whole comparison rests on.
def bi03():
    p = []
    for k, s in enumerate(('0.0', '0.25', '0.5', '0.75', '1.0')):
        cx = 58 + 56 * k
        p += [tube(cx, 76, 172, 38, 12, 96),
              rect(cx - 7, 126, 14, 34),
              txt(cx, 200, s, 'num')]
    p += [cap(170, 222, 'sucrose, mol/dm³'),
          rect(126, 26, 14, 40), arrow(150, 26, 150, 66), lbl(162, 50, 'l'),
          cap(114, 40, 'bored from', 'end'), cap(114, 54, 'ONE potato', 'end'),
          cap(230, 40, 'all trimmed to', 'start'), cap(230, 54, 'the same length', 'start'),
          cap(170, 250, 'blotted the same way before AND after, or the water still on'),
          cap(170, 264, 'the outside is the mass change you end up measuring')]
    return svg(274, 'Five boiling tubes in a row holding sucrose solutions from 0.0 to 1.0 mol per '
                    'cubic decimetre, each with one potato cylinder in it, above a cylinder bored '
                    'from a single potato and trimmed to length', *p)


# ---- PR-BI05  enzymes ----------------------------------------------------------------------------
# THE SPOTTING TILE IS THE APPARATUS PEOPLE HAVE NOT MET. "Put a drop of iodine in every well" and
# "take a drop of the mixture and add it to the next well" describe a clock you read across a tile,
# and the tile is a thing rather than a technique.
def bi05():
    p = [beaker(40, 66, 116, 116, 84),
         cap(98, 200, 'water bath at 35 °C'),
         rect(66, 30, 9, 62), circ(70, 92, 4.5),
         tube(118, 56, 164, 32, 12, 80),
         ln(146, 70, 190, 98), head(44, 28, 190, 98, 5.5),
         cap(252, 60, 'one drop, every 30 seconds'),
         rect(186, 86, 132, 66),
         ''.join(circ(200 + 26 * k, 104, 8) for k in range(5)),
         ''.join(circ(200 + 26 * k, 134, 8) for k in range(5)),
         cap(252, 172, 'a drop of iodine in every well,'),
         cap(252, 186, 'before anything is mixed'),
         cap(170, 222, 'blue-black means there is starch left. The reading is the'),
         cap(170, 236, 'time at which a drop STAYS orange, which is the first well'),
         cap(170, 250, 'that does not change colour')]
    return svg(260, 'A test tube in a water bath at 35 degrees with a thermometer, and a spotting '
                    'tile of ten wells each already holding a drop of iodine', *p)


# ---- PR-BI07  the ruler drop ---------------------------------------------------------------------
# AN EARLIER VERSION OF THIS FILE SAID A RULER DROP NEEDS NO PICTURE. That was a judgement and it
# is revised here with a reason: the method has three geometric conditions in one sentence — the
# forearm FLAT, the hand PAST the edge, the gap 1 cm, the zero mark level with the THUMB — and a
# drop taken with the hand resting on the table measures the table rather than the person.
def bi07():
    p = [ln(10, 150, 150, 150), ln(150, 150, 150, 206),
         rect(16, 126, 134, 24), cap(76, 200, 'forearm flat on the table'),
         poly([(150, 116), (196, 120), (196, 130), (150, 126)]),
         poly([(150, 150), (196, 148), (196, 158), (150, 162)]),
         cap(140, 108, 'thumb', 'end'), cap(140, 176, 'finger', 'end'),
         rect(196, 10, 26, 136),
         ''.join(ln(196, 22 + 11 * k, 196 + (7 if k % 5 else 14), 22 + 11 * k) for k in range(11)),
         # ON the zero line it was struck through by it; just above, it still reads as that line's.
         txt(234, 118, '0', 'num'),
         dash(178, 120, 250, 120),
         cap(288, 60, 'the ZERO mark'), cap(288, 74, 'level with the'),
         cap(288, 88, 'top of the thumb'),
         ln(250, 96, 262, 114),
         dash(222, 130, 250, 130), dash(222, 148, 250, 148),
         arrow(256, 130, 256, 148), cap(276, 144, '1 cm', 'start'),
         cap(170, 226, 'read the number the TOP OF THE THUMB lands on, and throw'),
         cap(170, 240, 'the first two attempts away as practice'),
         cap(170, 262, 'a hand resting ON the table cannot close, so the drop'),
         cap(170, 276, 'measures the table edge rather than the person')]
    return svg(286, 'A forearm flat on a table with the hand held past the edge, thumb and finger '
                    'one centimetre apart, and a ruler held vertically with its zero mark level '
                    'with the top of the thumb', *p)


# ---- PR-BI08  three dishes, three lights ---------------------------------------------------------
# NO BENDING. A shoot leaning towards the slit is the result of the experiment; what the drawing
# has to say is that there are THREE conditions and that the dark one is a condition rather than a
# forgotten dish.
def bi08():
    def dish(cx):
        return (poly([(cx - 34, 128), (cx - 30, 146), (cx + 30, 146), (cx + 34, 128)]) +
                ln(cx - 32, 138, cx + 32, 138) +
                ''.join(ln(cx - 20 + 10 * k, 138, cx - 20 + 10 * k, 130) for k in range(5)))
    p = [dish(58), dish(170), dish(282),
         ''.join(ln(58 + 18 * k, 62, 58 + 22 * k, 96) for k in (-1, 0, 1)),
         ''.join(head(4 * k, 34, 58 + 22 * k, 96, 5) for k in (-1, 0, 1)),
         cap(58, 50, 'light all round'),
         rect(132, 62, 76, 92, 'pt', 'style="stroke-dasharray:5 4"'),
         ln(132, 96, 132, 112, 'axis'),
         ln(104, 104, 130, 104), head(26, 0, 130, 104, 5),
         cap(170, 50, 'a box with a slit'), cap(170, 172, 'on ONE side'),
         rect(244, 62, 76, 92, 'pt', 'style="stroke-dasharray:5 4"'),
         cap(282, 50, 'a closed box'),
         txt(282, 100, '—', 'lbl'),
         cap(58, 172, 'the control'), cap(282, 172, 'no light at all'),
         cap(170, 202, 'germinated in the dark for two days FIRST, or there is no'),
         cap(170, 216, 'shoot on any of the three for the light to do anything to'),
         cap(170, 238, 'the cotton wool is kept damp in all three, which is the'),
         cap(170, 252, 'variable it is easiest to lose without noticing')]
    return svg(262, 'Three petri dishes of germinated cress: one in light from all round, one '
                    'inside a box with a slit on one side, and one inside a closed box', *p)


# ---- PR-BI09  sampling ---------------------------------------------------------------------------
# TWO METHODS AND THEY ARE OPPOSITES, which is the thing that gets muddled. A quadrat for a
# population estimate goes where the dice say; a quadrat on a transect goes at a fixed interval
# whatever is there. Drawn together, "no choosing where to put it" and "at fixed intervals" stop
# reading as the same instruction.
def bi09():
    p = [ln(40, 30, 40, 126, 'axis'), ln(40, 126, 300, 126, 'axis'),
         ''.join(ln(40, 42 + 14 * k, 46, 42 + 14 * k) for k in range(6)),
         ''.join(ln(66 + 26 * k, 126, 66 + 26 * k, 120) for k in range(9)),
         rect(170, 58, 30, 30),
         dash(40, 73, 170, 73), dash(185, 88, 185, 126),
         cap(224, 62, 'the dice say', 'start'), cap(224, 76, 'WHERE', 'start'),
         cap(170, 148, '1 · at random, for a population estimate'),
         # the transect
         circ(56, 196, 15), ln(56, 211, 56, 224), ln(30, 224, 310, 224),
         cap(56, 246, 'shade'),
         ''.join(rect(92 + 42 * k, 206, 18, 18) for k in range(5)),
         arrow(92, 192, 302, 192),
         cap(240, 246, 'open ground'),
         cap(170, 268, '2 · at FIXED intervals, whatever is there, for a transect'),
         cap(170, 292, 'a quadrat moved because the patch looked better is the'),
         cap(170, 306, 'commonest way a population estimate comes out too high')]
    return svg(316, 'Two tape measures at right angles with a quadrat placed at random '
                    'coordinates, and a transect line from a tree into open ground with five '
                    'quadrats at equal intervals along it', *p)

# ---- PR-FN02  Eratosthenes' shadow ---------------------------------------------------------------
# THE DERIVATION, LIKE THE RADIUS-OF-THE-EARTH DRAWING. One shadow gives an angle and nothing else;
# it is the SECOND place, and the fact that the sun's rays arrive parallel, that turns two angles
# into a circumference. That is the step the method skips over in one line, so it is drawn.
def fn02():
    import math
    ang = 24.0
    gy, sx, h = 104.0, 92.0, 62.0
    tipx = sx + h * math.tan(math.radians(ang))
    p = [ln(26, gy, 314, gy),
         ln(sx, gy, sx, gy - h), rightangle(sx, gy, sx + 14, gy, sx, gy - 14, 8),
         arrow(sx - 18, gy - h, sx - 18, gy), cap(64, gy - 30, 'h', 'end'),
         ln(sx, gy - h, tipx, gy), midhead(sx, gy - h, tipx, gy, .62),
         ''.join(ln(sx - 34 + 30 * k, gy - h - 26,
                    sx - 34 + 30 * k + 26 * math.tan(math.radians(ang)), gy - h)
                 for k in range(3)),
         cap(200, 22, 'the sun is so far away that its', 'start'),
         cap(200, 36, 'rays arrive PARALLEL', 'start'),
         # INSIDE THE ANGLE IT NAMES: at sx + 18 the letter sat on the ray, just outside the wedge.
         # Centred between the stick and the ray's arrowhead, which a unit further right it crowded.
         arc(sx, gy - h, 26, 90 - ang, 90), lbl(sx + 6.5, gy - h + 38, '\u03b8'),
         arrow(sx, gy + 14, tipx, gy + 14), cap((sx + tipx) / 2, gy + 34, 'the shadow'),
         # FIVE UNITS UP, because the second drawing's rays start at gy + 72 and ran through the
         # descenders of this line.
         cap(170, gy + 53, '\u03b8 = inverse tan (shadow \u00f7 h): the angle the sun is off'),
         cap(170, gy + 67, 'vertical AT YOUR PLACE, on the day you measured it'),
         # the two places, on one side of the Earth so the rays have room
         circ(136, 274, 54),
         ln(136, 220, 136, 196), ln(180, 243, 200, 228),
         dot(136, 220), dot(180, 243),
         ''.join(ln(148 + 26 * k, 176, 158 + 26 * k, 192) for k in range(5)),
         ln(136, 274, 136, 220), ln(136, 274, 180, 243),
         arc(136, 274, 28, -90, -46), lbl(150, 243, '\u0394'),          # inside the angle, off the rim
         cap(266, 246, 'two places,', 'start'), cap(266, 260, 'one day,', 'start'),
         cap(266, 274, 'two angles', 'start'),
         cap(170, 344, '\u0394 is the same fraction of 360\u00b0 as the distance between'),
         cap(170, 358, 'the two places is of the whole circumference')]
    return svg(368, 'A vertical stick casting a shadow with the sun\'s parallel rays and the angle '
                    'off vertical marked, and the Earth with two sticks at two latitudes and the '
                    'difference between their angles at the centre', *p)


# ---- PR-FN07  circumference with a string --------------------------------------------------------
# THE STRING IS THE MEASUREMENT AND IT IS IN TWO PLACES AT ONCE: round the object, and straight
# against the rule. That is one object in two states, which is exactly what prose cannot put side
# by side. The gradient is the answer and it is not here.
def fn07():
    C = 2 * 3.1416 * 34
    p = [circ(62, 104, 34), circ(62, 104, 39, 'pt', 'style="stroke-dasharray:4 3"'),
         ln(62, 65, 62, 54), dot(62, 65),
         cap(62, 32, 'mark where'), cap(62, 46, 'it meets'),
         arrow(28, 104, 96, 104), lbl(62, 96, 'd'),
         cap(62, 160, 'round ONCE,'), cap(62, 174, 'and across the'),
         cap(62, 188, 'WIDEST part'),
         ln(116, 62, 116 + C, 62), dot(116, 62), dot(116 + C, 62),
         rect(112, 78, C + 12, 16),
         ''.join(ln(116 + C * k / 20.0, 78, 116 + C * k / 20.0, 78 + (6 if k % 5 else 11))
                 for k in range(21)),
         cap(224, 118, 'then straightened against'),
         cap(224, 132, 'the rule, for C'),
         cap(170, 214, 'ten objects, both measured, both written down — and the'),
         cap(170, 228, 'gradient of C against d is what you are after')]
    return svg(238, 'A round object with a string once round it and the meeting point marked, the '
                    'diameter measured across the widest part, and the same string straightened '
                    'out against a ruler', *p)


# ---- PR-FN12  terminal velocity -------------------------------------------------------------------
# THE NESTING IS THE VARIABLE. "Nest two cases together" is a sentence somebody reads as "drop two
# cases", which is a different experiment: one case of twice the mass, not two cases falling. Drawn,
# the difference is the whole picture.
def fn12():
    def case(cx, cy, n):
        out = []
        for k in range(n):
            y = cy + k * 5
            out.append(poly([(cx - 26, y), (cx - 19, y + 22), (cx + 19, y + 22), (cx + 26, y)]))
        return ''.join(out)
    p = [ln(30, 44, 128, 44), cap(79, 34, 'release line, measured'),
         case(79, 52, 1),
         dash(79, 84, 79, 196),
         arrow(40, 48, 40, 200), lbl(28, 126, 'h'),
         ln(30, 200, 310, 200),
         cap(79, 224, 'timed five times, and meaned'),
         case(172, 64, 2), case(236, 64, 4), case(300, 64, 8),
         txt(172, 56, '2', 'num'), txt(236, 56, '4', 'num'), txt(300, 56, '8', 'num'),
         cap(240, 168, 'NESTED, one inside the next —'),
         cap(240, 182, 'the same shape, more mass'),
         cap(170, 250, 'two cases side by side is two ordinary drops; two nested is'),
         cap(170, 264, 'one object of twice the mass, which is the thing being changed')]
    return svg(274, 'A cupcake case at a measured release line above a marked drop height, and '
                    'nests of two, four and eight cases stacked one inside the next', *p)


# ---- PR-HM03  electrolysis of water, with two pencils --------------------------------------------
# "SHARPEN BOTH PENCILS AT BOTH ENDS" IS THE WHOLE CONSTRUCTION and it is a sentence people read
# twice. One end presses on a battery terminal and the other is the electrode; the wood is an
# insulator and the graphite is the wire, which is why the pencil works at all.
def hm03():
    def pencil(x, top, bot):
        return (rect(x - 5, top + 10, 10, bot - top - 20) +
                path('M %g %g L %g %g L %g %g' % (x - 5, top + 10, x, top, x + 5, top + 10)) +
                path('M %g %g L %g %g L %g %g' % (x - 5, bot - 10, x, bot, x + 5, bot - 10)))
    p = [rect(122, 22, 96, 32), cap(170, 42, '9V battery'),
         txt(118, 72, '−', 'lbl'), txt(222, 72, '+', 'lbl'),
         pencil(136, 54, 168), pencil(204, 54, 168),
         beaker(74, 96, 192, 110, 116),
         cap(170, 226, 'warm water, with bicarbonate of soda stirred in'),
         # the tube, inverted over the negative pencil, filling with gas
         ln(118, 108, 118, 176), ln(154, 108, 154, 176),
         path('M 118 108 Q 136 92 154 108'),
         ln(118, 140, 154, 140),
         cap(100, 158, 'gas', 'end'), ln(104, 154, 116, 154),
         cap(170, 254, 'the hydrogen comes off the NEGATIVE pencil, so that is the'),
         cap(170, 268, 'one the tube goes over — 10 to 20 minutes to fill, so start'),
         cap(170, 282, 'it and run something else while it does'),
         cap(170, 304, 'lift the tube out mouth-DOWN, and light it at the mouth')]
    return svg(314, 'A 9V battery with a pencil sharpened at both ends pressed against each '
                    'terminal, the lower ends dipping into a glass of bicarbonate solution, and an '
                    'inverted test tube filling with gas over the negative one', *p)


# ---- PR-HM06  the bottle as a funnel -------------------------------------------------------------
# A CONSTRUCTION MADE OUT OF RUBBISH, and the one line describing it — "cut a 2 L plastic bottle in
# half and invert the top into the base" — is a thing to look at rather than read. The filter paper
# cone inside it is the second half nobody gets right first time.
def hm06():
    p = [# the base half, as the collecting vessel
         beaker(92, 148, 156, 92, 216),
         dash(88, 148, 252, 148), cap(258, 144, 'cut here', 'start'),
         # the top half, inverted into it
         poly([(96, 62), (96, 82)]), poly([(244, 62), (244, 82)]),
         ln(96, 82, 158, 130), ln(244, 82, 182, 130),
         rect(158, 130, 24, 22),
         ln(96, 62, 244, 62),
         path('M 108 76 L 170 124 L 232 76', 'pt', 'style="stroke-dasharray:4 3;opacity:.75"'),
         cap(170, 46, 'filter paper, folded into a cone'),
         cap(84, 96, 'the TOP half of', 'end'), cap(84, 110, 'the bottle,', 'end'),
         cap(84, 124, 'inverted', 'end'),
         cap(170, 268, 'the sand stays on the paper and the salt goes through in'),
         cap(170, 282, 'solution — then a shallow dish and a warm windowsill for a day')]
    return svg(292, 'The top half of a plastic bottle cut off and inverted into its own base as a '
                    'funnel, with filter paper folded into a cone inside it', *p)


# ---- PR-HM11  the volcano, and the scale behind it -----------------------------------------------
# THE RULER IS THE EXPERIMENT. Without it this is a party trick; with it standing in the tray BEHIND
# the bottle, every run is filmed against the same scale and the tallest frame can be read off. That
# is one clause in step 2 and it is the difference between a measurement and a mess.
def hm11():
    p = [rect(272, 34, 18, 172),
         ''.join(ln(272, 46 + 16 * k, 272 + (7 if k % 2 else 13), 46 + 16 * k) for k in range(10)),
         cap(304, 40, 'the', 'start'), cap(304, 54, 'ruler', 'start'),
         # the bottle, and the foil cone round it
         ln(146, 68, 146, 96), ln(178, 68, 178, 96),
         path('M 146 68 Q 162 62 178 68'),
         poly([(146, 96), (140, 118), (140, 190)]), poly([(178, 96), (184, 118), (184, 190)]),
         ln(146, 100, 74, 190), ln(178, 100, 250, 190),
         cap(92, 134, 'foil cone', 'end'), ln(96, 138, 116, 148),
         cap(170, 58, 'the neck stays CLEAR of the foil'),
         # the tray
         ln(34, 190, 34, 212), ln(306, 190, 306, 212), ln(34, 212, 306, 212),
         ln(34, 190, 306, 190, 'axis'),
         cap(170, 236, 'the ruler stands in the tray BEHIND the bottle, so every'),
         cap(170, 250, 'run is filmed against the same scale'),
         cap(170, 272, 'same 50 ml of vinegar every time; one teaspoon of bicarb,'),
         cap(170, 286, 'then two, then three — the bicarb is the only thing changing')]
    return svg(296, 'A plastic bottle inside a foil cone standing in a deep tray, with a ruler '
                    'standing in the tray behind it as a scale to film against', *p)


# ---- PR-HM29  five jars, and the fifth is the awkward one ----------------------------------------
# THE RANKING IS THE RESULT AND IS NOT DRAWN. What is drawn is five conditions, because the whole
# design is that each jar is missing one thing — and the fifth, boiled water under a layer of oil,
# is a construction rather than a filling.
def hm29():
    def jar(cx, water=None, oil=None, dry=False):
        out = [ln(cx - 21, 74, cx - 21, 158), ln(cx + 21, 74, cx + 21, 158),
               ln(cx - 21, 158, cx + 21, 158),
               rect(cx - 24, 62, 48, 12),
               ln(cx - 3, 86, cx + 3, 148)]
        if water is not None:
            out.append(ln(cx - 21, water, cx + 21, water))
        if oil is not None:
            out.append(ln(cx - 21, oil, cx + 21, oil))
            out.append(ln(cx - 21, oil + 6, cx + 21, oil + 6))
        if dry:
            out.append(txt(cx - 12, 116, '—', 'lbl'))    # beside the nail, which ran through it
        return ''.join(out)
    names = (('water', 88, None), ('salt water', 88, None), ('oil only', None, 84),
             ('dry, sealed', None, None), ('boiled water,', 100, 86))
    p = []
    for k, (nm, w, o) in enumerate(names):
        cx = 50 + 60 * k
        p.append(jar(cx, w, o, dry=(k == 3)))
        p.append(cap(cx, 180, nm))
    p += [cap(290, 194, 'oil on top'),
          cap(170, 224, 'the nail is the same in all five — plain and uncoated, so'),
          cap(170, 238, 'there is nothing on it already stopping the air'),
          cap(170, 260, 'boiling drives the dissolved air OUT of the water, and the'),
          cap(170, 274, 'oil layer is what stops it getting back in')]
    return svg(284, 'Five jars in a row each holding one iron nail: in water, in salt water, in '
                    'oil only, dry and sealed, and in boiled water under a layer of oil', *p)


# ---- PR-HM32  the lemon chain --------------------------------------------------------------------
# "COPPER OF ONE TO THE NAIL OF THE NEXT" IS THE ONE SENTENCE THAT DECIDES WHETHER IT WORKS, and
# read off a page it is four words that could mean either. Drawn, the chain is obvious, and so is
# which two ends are left free.
def hm32():
    p = []
    cxs = (62, 134, 206, 278)
    for cx in cxs:
        p += ['<ellipse cx="%d" cy="110" rx="32" ry="24" class="pt"/>' % cx,
              ln(cx - 18, 88, cx - 18, 110), rect(cx - 22, 84, 8, 5), cap(cx - 18, 76, 'Zn'),
              rect(cx + 14, 88, 7, 22), cap(cx + 18, 76, 'Cu')]
    for k in range(3):
        a, b = cxs[k] + 18, cxs[k + 1] - 18
        p.append(path('M %d 86 Q %d 62 %d 86' % (a, (a + b) / 2, b)))
    p += [cap(170, 38, 'copper to nail, copper to nail, all the way along'),
          ln(44, 88, 30, 88), ln(30, 88, 30, 186), ln(30, 186, 140, 186),
          ln(296, 88, 310, 88), ln(310, 88, 310, 186), ln(310, 186, 196, 186),
          '<polygon points="142,174 142,198 166,186" class="pt"/>', ln(166, 174, 166, 198),
          ln(166, 186, 196, 186),
          cap(170, 224, 'LED — the LONG leg goes to the COPPER end'),
          cap(170, 252, 'roll each lemon under your hand first: it breaks the juice'),
          cap(170, 266, 'sacs, and it makes a real difference')]
    return svg(276, 'Four lemons in a row, each with a galvanised nail on one side and a copper '
                    'coin on the other, wired copper to nail along the chain, with an LED across '
                    'the two free ends', *p)


# ---- PR-HM36  strawberry DNA ---------------------------------------------------------------------
# THE POUR IS THE TECHNIQUE AND IT IS THE ONLY PART THAT CAN BE GOT WRONG. Cold alcohol run down the
# inside of a tilted glass sits in a layer; the same alcohol poured into the middle mixes, and there
# is then nothing at a boundary to lift out. What forms there is what step 7 already says it is.
def hm36():
    p = [ln(96, 66, 96, 208), ln(220, 66, 220, 208),
         path('M 96 208 Q 158 226 220 208'),
         ln(96, 148, 220, 148, 'axis'),
         cap(74, 182, 'the filtered', 'end'), cap(74, 196, 'extract', 'end'),
         ln(78, 178, 92, 178),
         cap(74, 108, 'cold', 'end'), cap(74, 122, 'alcohol', 'end'),
         ln(78, 104, 92, 104),
         # the pour, down the inside wall
         rect(238, 26, 44, 30), path('M 238 56 L 238 72 L 260 78'),
         ln(238, 72, 216, 80), path('M 216 80 Q 208 104 214 144'),
         midhead(214, 96, 216, 130, .6),
         cap(304, 46, 'poured'), cap(304, 60, 'down the'),
         cap(304, 74, 'SIDE'),
         arrow(60, 148, 88, 148), cap(44, 140, 'look', 'end'), cap(44, 154, 'here', 'end'),
         rect(124, 24, 6, 152), cap(148, 26, 'skewer', 'start'),
         cap(170, 250, 'chilled in the freezer an hour beforehand, and run down the'),
         cap(170, 264, 'inside wall so it sits ON TOP rather than mixing in'),
         cap(170, 286, 'do not stir. What you are after collects at the boundary,'),
         cap(170, 300, 'and comes out on the skewer')]
    return svg(310, 'A glass holding the filtered strawberry extract with cold alcohol poured down '
                    'the inside wall to sit as a separate layer on top, and a skewer standing in '
                    'it', *p)

# ---- PR-HM07  the shoebox projector --------------------------------------------------------------
# THE PHONE GOES IN UPSIDE DOWN AND THAT IS THE ONLY SURPRISING INSTRUCTION IN THE BUILD. A single
# lens turns the picture over, so the phone has to be upside down for the image on the wall to be
# the right way up — and step 3 gives the instruction without the reason, which is exactly the shape
# a section drawing fixes.
def hm07():
    p = [ln(52, 64, 236, 64), ln(52, 64, 52, 178), ln(52, 178, 236, 178),
         ln(236, 64, 236, 104), ln(236, 138, 236, 178),
         rect(56, 68, 6, 106, 'pt', 'style="stroke-dasharray:4 3"'),
         cap(84, 190, 'lined with black card'),
         # the phone, on a folded-card stand, upside down
         rect(78, 92, 8, 56),
         poly([(70, 148), (96, 148), (86, 130)]),
         ln(82, 112, 82, 138), head(0, 22, 82, 138, 6),
         cap(70, 84, 'the phone, UPSIDE DOWN', 'start'),
         # the lens
         path('M 236 104 Q 246 121 236 138'), path('M 236 104 Q 226 121 236 138'),
         cap(252, 162, 'lens', 'start'),
         # to the wall
         ln(82, 112, 236, 118), ln(82, 140, 236, 128),
         ln(246, 120, 306, 148), ln(246, 126, 306, 96),
         ln(306, 54, 306, 190),
         ln(306, 146, 306, 100), head(0, -40, 306, 100, 6),
         cap(292, 44, 'the wall'),
         cap(170, 216, 'one lens turns the picture over, so a phone put in the right'),
         cap(170, 230, 'way up gives an upside-down image on the wall'),
         cap(170, 252, 'brightness to maximum, auto-rotate OFF, and slide the phone'),
         cap(170, 266, 'back and forth until it focuses')]
    return svg(276, 'A shoebox in section lined with black card, a phone standing upside down '
                    'inside it on a folded card stand, and a lens in the far end throwing an '
                    'upright image on to the wall', *p)


# ---- PR-HM08  the scribble bot -------------------------------------------------------------------
# THE WEIGHT IS OFF CENTRE AND EVERYTHING ELSE IS TAPE. A balanced motor spins and the bot sits
# still; the blob is the whole mechanism, and it is one clause in step 3.
def hm08():
    p = [rect(126, 44, 44, 20), cap(148, 36, 'motor'),
         rect(180, 44, 46, 20), cap(203, 36, 'battery'),
         ln(170, 54, 186, 54),
         circ(120, 54, 3), dot(114, 48, 5.5),
         cap(92, 40, 'blob, OFF', 'end'), cap(92, 54, 'centre', 'end'),
         ln(96, 46, 108, 46),
         poly([(122, 66), (112, 130), (216, 130), (206, 66)]),
         ln(122, 66, 206, 66),
         cap(164, 100, 'cup, upside down'),
         # three felt tips as legs
         ln(118, 130, 92, 196), ln(124, 130, 98, 196),
         ln(164, 130, 164, 196), ln(170, 130, 170, 196),
         ln(210, 130, 236, 196), ln(216, 130, 242, 196),
         path('M 92 196 L 95 204 L 98 196'), path('M 164 196 L 167 204 L 170 196'),
         path('M 236 196 L 239 204 L 242 196'),
         cap(268, 168, 'felt tips,', 'start'), cap(268, 182, 'tips DOWN', 'start'),
         ln(34, 206, 306, 206), cap(170, 228, 'a large sheet of paper'),
         cap(170, 256, 'balanced, the motor spins and the bot stays put. The blob is'),
         cap(170, 270, 'what turns a spin into a wobble, and the wobble is what draws')]
    return svg(280, 'An upturned plastic cup with three felt tips taped round it as legs, a motor '
                    'and battery holder taped on top, and an off-centre blob on the motor shaft', *p)


# ---- PR-HM12  Newton's cradle --------------------------------------------------------------------
# STEP 1 SAYS THE FRAME BEING OUT OF TRUE IS THE WHOLE EXPERIMENT, so the two conditions it names —
# square, and every ball at the same height just touching — are what the drawing states. How many
# balls swing out is the reading and there is none of it here.
def hm12():
    p = [cap(170, 24, 'square, and checked BEFORE anything hangs'),
         rect(46, 48, 10, 150), rect(284, 48, 10, 150),
         rect(46, 48, 248, 10), rect(30, 198, 42, 10), rect(268, 198, 42, 10),
         rightangle(56, 58, 56, 102, 100, 58, 12),
         ''.join(ln(122 + 22 * k, 58, 122 + 22 * k, 140) for k in range(5)),
         ''.join(circ(122 + 22 * k, 151, 11) for k in range(5)),
         dash(62, 151, 278, 151),
         cap(170, 230, 'all five at the SAME height, and just touching'),
         cap(170, 252, 'one out of line and the ball beside it is hit at an angle,'),
         cap(170, 266, 'which is where the pattern goes'),
         cap(170, 288, 'lift ONE to a marked height, count what swings out, and'),
         cap(170, 302, 'write the number down before saying it out loud')]
    return svg(312, 'A Newton\'s cradle frame with five balls hanging in a line at the same '
                    'height, just touching, with a right angle marked at one corner of the '
                    'frame', *p)


# ---- PR-HM14  the periscope ----------------------------------------------------------------------
# THE CONSTRUCTION ONLY. Step 3 asks the STUDENT to draw the light path with the angles marked, and
# step 5 asks them to redraw it with one mirror tilted — so a figure with the rays already on it
# hands over both answers. This is the density-tower rule: a picture that answers the question the
# practical asks has taken the practical away.
def hm14():
    p = [# the box: both openings on the same side, which is what lets you look forwards
         ln(112, 30, 112, 46), ln(112, 82, 112, 186), ln(112, 222, 112, 238),
         ln(196, 30, 196, 238), ln(112, 30, 196, 30), ln(112, 238, 196, 238),
         cap(100, 42, 'light in', 'end'), cap(100, 226, 'out, to your eye', 'end'),
         ln(72, 64, 100, 64), head(28, 0, 100, 64, 5.5),
         ln(100, 204, 72, 204), head(-28, 0, 72, 204, 5.5),
         # top mirror, top-left to bottom-right; bottom mirror, bottom-left to top-right
         poly([(114, 44), (192, 122), (188, 126), (110, 48)]),
         poly([(114, 224), (192, 146), (188, 142), (110, 220)]),
         arc(114, 44, 40, 0, 45), lbl(160, 72, '45\u00b0'),
         arc(114, 224, 40, 0, -45), lbl(160, 198, '45\u00b0'),
         cap(268, 118, 'both mirrors at 45\u00b0'),
         cap(268, 132, 'and FACING each other'),
         cap(170, 268, 'check each mirror against the protractor as it goes in — at'),
         cap(170, 282, '40\u00b0 it still works and what you see is not where it is'),
         cap(170, 304, 'the ray diagram is YOURS to draw. This is the box, not the'),
         cap(170, 318, 'answer to step 3')]
    return svg(328, 'A periscope in section: a long box with an opening near the top and another '
                    'near the bottom on the same side, and two mirrors set at 45 degrees facing '
                    'each other', *p)


# ---- PR-HM15  gas pressure -----------------------------------------------------------------------
# THE MEASUREMENT IS ROUND A CURVED THING, which is the one part of this that has to be done the
# same way twice or the numbers mean nothing. "Measure round the widest part" is a place on a
# balloon, and a place is a picture.
def hm15():
    p = [path('M 142 92 Q 106 62 132 38 Q 158 18 186 34 Q 214 58 178 92'),
         dash(96, 58, 224, 58),
         cap(90, 44, 'round the', 'end'), cap(90, 58, 'WIDEST part,', 'end'),
         cap(90, 72, 'with string', 'end'),
         ln(142, 92, 142, 116), ln(178, 92, 178, 116),
         ln(142, 116, 128, 132), ln(178, 116, 192, 132),
         ln(128, 132, 128, 206), ln(192, 132, 192, 206), ln(128, 206, 192, 206),
         beaker(70, 150, 176, 64, 164),
         cap(56, 186, 'hot water', 'end'), ln(60, 182, 74, 182),
         rect(212, 116, 9, 58), circ(216, 174, 4.5),
         cap(268, 106, 'and the WATER\'s'), cap(268, 120, 'temperature,'),
         cap(268, 134, 'not the room\'s'),
         cap(170, 244, 'the bottle is EMPTY — what is expanding is the air inside it,'),
         cap(170, 258, 'and the balloon is only how you can see it'),
         cap(170, 280, 'straight into iced water afterwards and it goes back, which'),
         cap(170, 294, 'is the half that shows nothing has leaked out')]
    return svg(304, 'A balloon stretched over the neck of an empty glass bottle standing in a bowl '
                    'of hot water, with a string measured round the widest part of the balloon and '
                    'a thermometer in the water', *p)


# ---- PR-HM16  the pendulum -----------------------------------------------------------------------
# l IS MEASURED TO THE CENTRE OF THE MASS and that is the error everybody makes: measured to the top
# of the weight, every length is short by the same amount and the graph still looks like a graph.
def hm16():
    p = [ln(24, 52, 168, 52), ln(168, 52, 168, 74),
         rect(84, 30, 76, 22), cap(122, 24, 'a heavy book, trapping the string'),
         ln(112, 52, 112, 156), dot(112, 52, 3.4),
         rect(94, 156, 36, 30), dash(76, 171, 220, 171),
         cap(150, 200, 'to the CENTRE of the mass', 'start'),
         arrow(58, 52, 58, 171), lbl(44, 116, 'l'),
         dash(112, 52, 112, 200),
         ln(112, 52, 188, 136), rect(174, 132, 30, 26, 'pt', 'style="opacity:.55"'),
         arc(112, 52, 92, 90, 48), cap(228, 106, 'a hand-span,', 'start'),
         cap(228, 120, 'and let GO', 'start'),
         cap(170, 244, 'measured to the top of the weight, every length is short by'),
         cap(170, 258, 'the same amount and the graph still looks right'),
         cap(170, 280, 'time TEN swings and divide by ten. A push instead of a'),
         cap(170, 294, 'release is the other way this goes wrong')]
    return svg(304, 'A pendulum made by trapping a string under a heavy book at the edge of a '
                    'table, with the length measured from the pivot to the centre of the weight, '
                    'and the weight drawn again pulled aside by a hand-span', *p)


# ---- PR-HM17  the slinky -------------------------------------------------------------------------
# THE SET-UP AND THE WOOL, AND NOT THE WAVES. Step 4 asks which way the wool moves compared with
# which way the wave goes, and the outcome is a drawing of each type with both directions marked —
# so drawing either wave here answers the question. What is drawn is the spring, the two people, and
# the one coil you can follow.
def hm17():
    p = [person(46, 176), ln(46, 146, 74, 152),
         person(294, 176), ln(294, 146, 266, 152),
         ]
    pts = [(78, 152)]
    n = 34
    for i in range(1, n + 1):
        x = 78 + (262 - 78) * (i - .5) / n
        pts.append((x, 152 + (7 if i % 2 else -7)))
    pts.append((262, 152))
    p += [poly(pts),
          dot(78 + (262 - 78) * 0.62, 145, 3.6),
          # ABOVE ITS TICK, NOT PAST IT: started at 214 the words ran through the right-hand person,
          # and the 80 units between the tick and that person cannot hold them.
          cap(203, 121, 'wool, tied to ONE coil'),
          ln(196, 130, 210, 130),
          ln(24, 190, 316, 190),
          arrow(78, 208, 262, 208), cap(170, 230, 'measured end to end'),
          cap(170, 258, 'speed is TWICE that distance over the time a pulse takes to'),
          cap(170, 272, 'go down and come back'),
          cap(170, 294, 'the wool is the coil you can follow. Which way it moves'),
          cap(170, 308, 'against which way the wave goes is yours to draw')]
    return svg(318, 'A metal slinky stretched along the floor between two people, with a short '
                    'length of coloured wool tied to one coil and the distance between the two ends '
                    'marked', *p)


# ---- PR-HM18  three circuits ---------------------------------------------------------------------
# SERIES AND PARALLEL DRAWN TOGETHER, because "rebuild them in parallel" is the instruction and the
# rebuild is the whole lesson. WHICH IS BRIGHTER IS NOT MARKED — that is steps 4 and 5.
def hm18():
    p = [# series
         hwire(40, 300, 34, [(170, 13)]), vwire(40, 34, 96), vwire(300, 34, 96),
         hwire(40, 300, 96, [(120, 13), (220, 13)]),
         cell(170, 34), lamp(120, 96), lamp(220, 96),
         cap(170, 118, '1 · in series, one after the other'),
         # parallel
         hwire(40, 300, 152, [(170, 13)]), vwire(40, 152, 232), vwire(300, 152, 232),
         hwire(40, 300, 232),
         cell(170, 152),
         vwire(120, 152, 232, [(192, 13)]), vwire(220, 152, 232, [(192, 13)]),
         lamp(120, 192), lamp(220, 192),
         cap(170, 254, '2 · in parallel, each with its own loop'),
         # the test gap
         hwire(40, 300, 290, [(80, 13)]), vwire(40, 290, 340), vwire(300, 290, 340),
         hwire(40, 300, 340, [(170, 26)]),
         cell(80, 290), clip(144, 340), clip(196, 340),
         rect(156, 332, 28, 16, 'pt', 'style="stroke-dasharray:4 3"'),
         cap(170, 368, '3 · and a gap with two bare ends, bridged by each'),
         cap(170, 382, 'test object in turn'),
         cap(170, 404, 'a switch is a break you can control, which is why breaking'),
         cap(170, 418, 'the loop anywhere does the same thing')]
    return svg(428, 'Three circuits: two lamps in series with a cell, the same two lamps in '
                    'parallel each on its own branch, and a circuit with a gap held open by two '
                    'crocodile clips for a test object', *p)


# ---- PR-HM19  the electromagnet ------------------------------------------------------------------
# THE TURNS ALL GO THE SAME WAY, and a coil wound half one way and half the other is a nail that
# lifts nothing while looking exactly like one that does. The field-line sketch is step 1 and is the
# student's, so there are no iron filings here.
def hm19():
    p = [poly([(112, 60), (112, 168), (124, 192), (136, 168), (136, 60)]),
         rect(104, 52, 40, 10),
         ''.join(path('M 104 %d Q 124 %d 144 %d' % (72 + 9 * k, 76 + 9 * k, 76 + 9 * k))
                 for k in range(10)),
         cap(94, 118, 'twenty turns,', 'end'), cap(94, 132, 'neatly, and all', 'end'),
         cap(94, 146, 'the SAME way', 'end'),
         cap(94, 178, 'an iron nail', 'end'), ln(98, 174, 118, 180),
         # the circuit
         ln(104, 76, 64, 76), vwire(64, 40, 76), hwire(64, 232, 40, [(120, 16), (196, 13)]),
         ln(232, 40, 232, 76), ln(232, 76, 144, 76),
         cell(196, 40), switch(120, 40),
         cap(196, 24, 'battery'), cap(120, 24, 'switch'),
         dot(104, 76, 3), dot(144, 76, 3),
         cap(266, 128, 'sand the enamel'), cap(266, 142, 'off BOTH ends —'),
         cap(266, 156, 'it looks bare and'), cap(266, 170, 'is not'),
         # the paperclips
         ''.join(path('M %d 220 L %d 206 Q %d 198 %d 206 L %d 216'
                      % (96 + 20 * k, 96 + 20 * k, 103 + 20 * k, 110 + 20 * k, 110 + 20 * k))
                 for k in range(6)),
         ln(64, 224, 250, 224),
         cap(170, 246, 'dip, lift, count — then disconnect and watch them drop'),
         cap(170, 274, 'half the turns one way and half the other is a nail that lifts'),
         cap(170, 288, 'nothing and looks exactly like one that does')]
    return svg(298, 'Wire wound in one direction round an iron nail, its sanded ends wired to a '
                    'battery through a switch, held above a heap of paperclips', *p)


# ---- PR-HM20  the balloon car --------------------------------------------------------------------
# THE STRAW POINTS BACKWARDS and that is the physics as well as the build: the car goes the other
# way from the air, which is step 6's "a sentence naming what is actually pushing it".
def hm20():
    p = [ln(96, 92, 250, 92), ln(96, 132, 250, 132),
         path('M 96 92 Q 82 112 96 132'),
         ln(250, 92, 264, 100), ln(250, 132, 264, 124), ln(264, 100, 264, 124),
         cap(76, 104, 'the bottle,', 'end'), cap(76, 118, 'the chassis', 'end'),
         # the two straws, across, with skewers through them and lids as wheels
         rect(118, 134, 10, 34), rect(216, 134, 10, 34),
         ln(96, 158, 148, 158), ln(196, 158, 248, 158),
         circ(104, 178, 15), circ(140, 178, 15), circ(204, 178, 15), circ(240, 178, 15),
         cap(172, 208, 'bottle lids — a hole off centre is a wheel that wobbles'),
         cap(76, 156, 'straws', 'end'), ln(80, 152, 114, 152),
         # the balloon and the wide straw
         path('M 152 76 Q 134 44 158 32 Q 178 22 196 34 Q 214 50 190 76'),
         ln(152, 76, 174, 76), ln(196, 76, 206, 80),
         ln(196, 66, 288, 78), ln(196, 76, 288, 88),
         head(92, 12, 300, 86, 7),
         cap(270, 54, 'the straw points'), cap(270, 68, 'BACKWARDS'),    # up, off the straw
         cap(170, 232, 'the air goes that way and the car goes the other — which is'),
         cap(170, 246, 'the sentence step 6 is asking for'),
         cap(170, 268, 'three runs and a mean, then change ONE thing: wheel size,'),
         cap(170, 282, 'balloon size, how much air, or where the straw points')]
    return svg(292, 'A plastic bottle chassis with two straws taped across it, skewers through them '
                    'and bottle lids as wheels, and a balloon on a wide straw taped along the top '
                    'pointing backwards', *p)


# ---- PR-HM21  the catapult -----------------------------------------------------------------------
# A BUILD OUT OF ONE MATERIAL, described in a single sentence with three parts in it — a banded stack
# for the body, two more sticks for the arm and the base, and a band at one end making the hinge.
# The marked pull-back is drawn because step 4 says it is the variable that ruins the experiment.
def hm21():
    p = [''.join(ln(96, 156 + 5 * k, 232, 156 + 5 * k) for k in range(5)),
         rect(100, 150, 9, 30), rect(220, 150, 9, 30),
         cap(164, 198, 'a stack of sticks, banded at both ends'),
         ln(88, 144, 240, 144),
         ln(88, 144, 244, 62),
         rect(84, 138, 9, 14),
         cap(70, 124, 'hinge:', 'end'), cap(70, 138, 'one band', 'end'),
         poly([(236, 52), (240, 68), (256, 68), (260, 52)]),
         circ(248, 44, 7),
         cap(282, 52, 'lid,', 'start'), cap(282, 66, 'taped on', 'start'),
         arc(88, 144, 62, 0, -28), lbl(154, 130, 'θ'),
         dash(88, 144, 240, 144),
         ln(258, 88, 258, 124), head(0, -36, 258, 88, 6),
         # RIGHT FOUR, because the pull-back arrow at 258 ran through the T of "to".
         cap(296, 100, 'pull back'), cap(296, 114, 'to a MARKED'),
         cap(296, 128, 'point'),
         ln(40, 216, 300, 216), rect(52, 216, 30, 8),
         cap(67, 240, 'the firing line'),
         cap(170, 268, 'pulled back by feel, the angle is not the only thing that'),
         cap(170, 282, 'changed and the graph means nothing'),
         cap(170, 304, 'check every angle with the protractor: 20°, 30°, 45°, 60°, 75°')]
    return svg(314, 'A catapult built from lolly sticks: a banded stack as the body, a throwing arm '
                    'and base hinged at one end by an elastic band, a bottle lid taped to the end '
                    'of the arm, and the angle and pull-back marked', *p)


# ---- PR-HM25  the pinball table ------------------------------------------------------------------
# A PLAN AND A SECTION, because the build is flat and the measurement is a slope. The angle is what
# is varied, and the books under the top edge are how it is varied — one clause in step 6.
def hm25():
    p = [# plan
         rect(30, 30, 152, 168),
         ln(160, 30, 160, 198),
         cap(171, 214, 'channel'),
         rect(150, 174, 20, 8),
         path('M 152 190 Q 160 198 168 190'),
         cap(106, 214, 'the base'),
         circ(66, 74, 11), circ(112, 58, 11), circ(94, 116, 11), circ(58, 140, 11),
         rect(116, 96, 10, 32), rect(44, 44, 10, 26),
         cap(106, 20, '1 · from above'),
         # section
         ln(214, 66, 322, 128),
         rect(198, 60, 22, 10), rect(198, 70, 22, 10), rect(198, 80, 22, 10),
         cap(209, 108, 'books'),
         ln(196, 148, 330, 148),
         dash(214, 128, 322, 128),
         arc(322, 128, 44, 180, 210), lbl(272, 120, 'θ'),
         cap(268, 40, '2 · from the side'),
         cap(268, 172, 'and the angle', 'middle'),
         cap(170, 244, 'the same pull-back on every run, or the launcher is a second'),
         cap(170, 258, 'thing changing and the angle is not what the graph shows'),
         cap(170, 280, 'five runs at each angle, timed until the ball is out of play,'),
         cap(170, 294, 'and the mean of the five')]
    return svg(304, 'A cardboard pinball table seen from above with a channel down one side, a '
                    'launcher at the bottom of it and bumpers glued on, and the same table from the '
                    'side propped on three books with the slope angle marked', *p)


# ---- PR-BI04  the four food tests, labelled by reagent and coloured nowhere ----------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: Every colour. The row's own
# why_no_drawing says "the colours ARE the reading", and it is right — so not one tube has coloured
# contents, no reagent bottle is tinted, and the two closing captions name no colour at all (they
# say "the result is the CHANGE, not the colour you end up with"). The tubes carry a plain liquid
# LEVEL line and nothing else, and they are labelled by what you put IN rather than by what comes
# out. Also withheld: the lipid test's cloudy emulsion (so the ethanol tube is drawn with nothing
# tipped into water yet), and any hint of which of the four samples is positive for what.
#
# OFF THE ROW: Equipment gives every object drawn: "Pestle and mortar" (bowl, grinding head, shaft),
# "Filter funnel and paper" (cone plus the fainter paper cone inside it), "Test tubes and rack"
# (three tubes through a rail onto a base plate), "Dropping pipettes" (bulb, stem, one drop over
# tube 1), "Water bath at 75 C" (the open vessel, its water line and the thermometer with its bulb
# under the surface), and the four reagents "Iodine solution", "Benedict's solution", "Biuret
# reagent", "Ethanol" as the four tube labels. Step 1 — "Grind the food with a little distilled
# water and filter it" — is the whole top band and the caption "grind, then filter"; that one
# filtrate feeding all four tests is why the beaker is labelled "ONE filtrate — all four tests run
# from it". Step 3 — "add Benedict's and stand in the hot water bath for five minutes" — is why
# exactly one tube is out of the rack and in the bath, and is the source of "75 °C water bath, five
# minutes". Step 2's "add a few drops of iodine" is the pipette and its caption. Step 6 — "Record
# the starting and finishing colour for every test — not just the result" — is the two closing
# lines, reworded so no colour is named. Height 334 fits the two bands plus their labels; nothing
# invented, and no second tube of water for the emulsion step because the row does not say what it
# is poured into.
def bi04():
    p = [
        # 1 - grind: the pestle and mortar
        path('M 26 58 Q 26 92 52 92 Q 78 92 78 58'), ln(22, 58, 82, 58),
        circ(50, 72, 7.5), ln(55, 66, 86, 28), ln(82, 24, 90, 32),
        arrow(96, 62, 124, 62, False),
        # 2 - filter: the funnel, the paper in it, and the beaker the filtrate runs into
        ln(142, 38, 194, 38), ln(142, 38, 164, 72), ln(194, 38, 172, 72),
        ln(164, 72, 164, 96), ln(172, 72, 172, 96),
        poly([(148, 42), (168, 68), (188, 42)], 'pt', 'style="opacity:.7"'),
        beaker(140, 84, 60, 50, 112),
        cap(66, 122, 'grind, then filter'),
        ln(204, 92, 232, 92),
        cap(274, 78, 'ONE filtrate —'), cap(274, 92, 'all four tests'),
        cap(274, 106, 'run from it'),
        # 3 - the dropping pipette over the first tube
        circ(44, 158, 7.5), ln(44, 165.5, 44, 180), dot(44, 186, 2),
        cap(76, 164, 'a few drops', 'start'),
        # 4 - three tubes in the rack
        tube(44, 184, 248, 28, 12, 210),
        tube(97, 184, 248, 28, 12, 210),
        tube(150, 184, 248, 28, 12, 210),
        rect(18, 220, 158, 9), rect(18, 264, 158, 9),
        ln(22, 229, 22, 264), ln(172, 229, 172, 264),
        cap(44, 288, 'iodine'), cap(97, 288, 'Biuret'), cap(150, 288, 'ethanol'),
        # 5 - and the fourth standing in the water bath, which is the only one that needs heat
        cap(280, 152, '75 °C water bath,'), cap(280, 166, 'five minutes'),
        beaker(206, 198, 114, 66, 218),
        rect(212, 166, 9, 62), circ(216.5, 232, 4.5),
        tube(272, 184, 246, 28, 12, 212),
        cap(272, 288, "Benedict's"),
        cap(170, 310, 'record the STARTING colour as well as the finishing one —'),
        cap(170, 324, 'the result is the CHANGE, not the colour you end up with')]
    return svg(334, 'A pestle and mortar beside a filter funnel draining into a beaker, and four '
                    'test tubes labelled by reagent: iodine, Biuret and ethanol standing in a '
                    'rack, and the Benedict’s tube standing in a water bath at 75 degrees '
                    'with a thermometer in it', *p)

# ---- PR-BI10  lipase, held outside the tube it is about to go into -------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: Nothing of the reading: no
# pink, no colourless, no time, no stopwatch face, no rate, no temperature values, no optimum and no
# denaturation. The whole answer to this practical is the time for the pink to go and the peaked
# rate-against-temperature curve, so no colour is indicated anywhere and the bath carries no number
# — its label is just "water bath". The row's own why_no_drawing names the trap as "a tube in a
# water bath, which is the shape of every water bath and assembles nothing", and what is drawn
# instead of that bare shape is the ASSEMBLY ORDER: the three measured things already in the tube,
# the tube in the bath, and the lipase held OUTSIDE, not yet added.
#
# OFF THE ROW: Step 1 gives the three contents and their exact amounts, drawn as the label block
# over the rack ("5 cm³ milk", "7 cm³ sodium carbonate", "5 drops phenolphthalein"). "Test tubes and
# rack" in the equipment gives the three tubes standing in a rack, and step 5 ("repeat at each
# temperature, keeping every volume the same") gives why there are three identical ones and the "one
# per bath" arrow. "Water baths at a range of temperatures" and "Thermometer" give the beaker with
# its water line and the thermometer with its bulb under the surface; step 2 ("stand the tube in the
# first water bath and let it reach temperature") puts the tube in it. Step 3 ("add 1 cm³ of lipase
# and start the stopwatch") gives the dropping pipette — "Dropping pipettes" is in the equipment —
# holding 1 cm³, labelled "added FOURTH" and drawn with its tip still above the tube mouth, plus the
# caption about the clock. The bottom caption pair is steps 2, 3 and 5 stated as conditions. Nothing
# in the picture comes from anywhere but those.
def bi10():
    # ---- every tube is made up first, and all of them the same -------------------------------
    p = [cap(74, 22, '5 cm³ milk'),
         cap(74, 36, '7 cm³ sodium carbonate'),
         cap(74, 50, '5 drops phenolphthalein')]
    for cx in (34, 74, 114):
        p.append(tube(cx, 60, 150, 28, 10, 94))
    p += [poly([(14, 136), (14, 156), (134, 156), (134, 136)]),
          # ---- one of them stands in a bath and comes up to its temperature -----------------
          cap(167, 87, 'one per bath'),
          ln(142, 95, 194, 95), head(52, 0, 194, 95, 6),
          beaker(200, 84, 118, 98, 98), cap(256, 200, 'water bath'),
          rect(288, 48, 9, 58), circ(292.5, 106, 4.5), cap(300, 40, 'thermometer'),
          tube(252, 58, 166, 28, 10, 112),
          # ---- and the lipase is still in the pipette ---------------------------------------
          circ(252, 18, 8), ln(249, 24, 249, 44), ln(255, 24, 255, 44),
          poly([(249, 44), (251.5, 54), (255, 44)]),
          cap(232, 20, '1 cm³ of lipase', 'end'), cap(232, 34, 'added FOURTH', 'end'),
          cap(170, 224, 'the lipase goes in only once the tube has reached the'),
          cap(170, 238, 'bath temperature, and the clock starts as it goes in'),
          cap(170, 260, 'every volume the same at every temperature, or what'),
          cap(170, 274, 'changed between two runs is the mixture and not the heat')]
    return svg(282, 'Three test tubes holding the same made-up mixture standing in a rack, beside '
                    'a water bath with one of those tubes in it, a thermometer in the water, and a '
                    'dropping pipette of lipase held just above the tube and not yet added', *p)

# ---- PR-CH04  the calorimeter before the first drop of alkali ------------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: The result and everything
# that leads to it: no graph, no axes, no peak, no temperature value anywhere, and no alkali in the
# picture at all. The row's outcome is "a peak temperature at the neutralisation point" and its
# steps end by plotting temperature against volume of alkali — so the alkali arriving in 5 cm³
# steps, the rising and then falling temperature, and the peak are all the answer this practical
# asks for, and none of them is drawn. The acid is explicitly labelled "before any alkali" to fix
# the picture at the starting state.
#
# OFF THE ROW: Every element traces to the row's own words. "Stand the polystyrene cup inside the
# beaker for insulation" gives the nesting, the air gap and — because no liquid is named for the
# outer vessel — the empty beaker, which is the bottom caption. "Polystyrene cup" and "Second cup or
# beaker for insulation" are the two vessels. "Lid with a hole" (one hole) is the lid drawn in
# section as two pieces with a 16-unit gap, and the thermometer occupies that gap rather than a
# second one being invented. "Thermometer or temperature probe" plus step 2's "record its starting
# temperature" of the acid puts the bulb under the surface. "Measure 30 cm³ of acid into the cup" is
# the liquid level and its label. The previous session's why_no_drawing named the trap exactly —
# "the temperature is the reading" — so the reading is absent and what is drawn is the assembly the
# sentence cannot settle: that the cup's rim stands above the beaker's so the lid closes the CUP,
# that the gap runs all round, and that the outer vessel holds nothing. The measuring cylinders,
# stopwatch, stirring rod and eye protection are named kit with no place to show, and are left out
# on ph02's recorded argument.
def ch04():
    p = [# the outer beaker, EMPTY, with the inner cup standing on its own floor
         beaker(90, 116, 120, 98),
         poly([(110, 94), (122, 214), (178, 214), (190, 94)]),
         cap(74, 136, 'air gap', 'end'), ln(76, 132, 102, 132), head(26, 0, 102, 132, 5.5),
         # the acid, in the inner cup only, and before anything has been added to it
         ln(116, 154, 184, 154),
         cap(226, 144, 'the acid — 30 cm³,', 'start'),
         cap(226, 158, 'before any alkali', 'start'), ln(186, 154, 222, 152),
         # the lid, in section: one lid with one hole is two pieces and the gap between them
         rect(106, 84, 36, 10), rect(158, 84, 36, 10),
         # the thermometer, down through that hole, with the bulb under the surface
         rect(145, 26, 10, 145), circ(150, 175, 5.5),
         cap(206, 38, 'thermometer', 'start'), ln(158, 42, 202, 32),
         cap(226, 192, 'the bulb IN the', 'start'),
         cap(226, 206, 'liquid, not above it', 'start'), ln(160, 180, 222, 194),
         cap(150, 236, 'the polystyrene cup, standing inside the beaker'),
         cap(170, 266, 'the outer beaker stays EMPTY — it is there for the gap,'),
         cap(170, 280, 'not as a water bath, and the lid closes the inner cup')]
    return svg(290, 'A polystyrene cup standing inside a larger empty beaker, holding acid, with a '
                    'lid over the cup and a thermometer through the hole in it so that the bulb is '
                    'under the liquid surface', *p)

# ---- PR-FN04  the microwave loaded, and nothing melted yet ---------------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: The melted patches — where
# they fall, how many there are and how far apart they sit is the entire measurement, so nothing is
# drawn on the chocolate and no ruler-and-dimension arrow spans a spacing. No standing wave inside
# the cavity either, because its antinodes ARE the patch positions. And no 3 × 10⁸ m/s: the caption
# carries the method (centre to centre is half a wavelength, c = f × 2d, which steps 4–7 state in
# words) and never the answer.
#
# OFF THE ROW: Turntable out on the bench + the "with the turntable IN…" caption: step 1 and the
# `science` paragraph about food riding through the hot spots. Chocolate drawn as a flat slab on a
# plate on the oven floor: step 2 ("lay the chocolate flat on the plate") and the "microwave-safe
# plate" in the kit. 20 s on the display: step 3. The 2450 MHz plate with a leader to the oven and
# "label at the BACK": step 6 and the kit's "frequency from the oven label, usually 2450 MHz". The
# ruler with graduations: the kit's "30 cm ruler". The caption's centre-to-centre rule and c = f ×
# 2d: steps 4, 5 and 7 and the row's `outcome`. Nothing in the picture comes from anywhere else.
def fn04():
    p = [# the 30 cm ruler, on top of the oven until the plate comes out
         cap(99, 20, '30 cm ruler'),
         rect(40, 27, 118, 11), ticks(40, 38, 118, 12),
         # the oven: cavity on the left, controls on the right
         rect(18, 38, 178, 134), rect(28, 50, 114, 110), rect(150, 50, 38, 110),
         rect(152, 56, 34, 16), txt(169, 68, '20 s', 'num'),
         ''.join(dot(x, y, 2) for y in (90, 104, 118) for x in (158, 169, 180)),
         rect(154, 132, 30, 12),
         rect(28, 172, 18, 8), rect(168, 172, 18, 8), ln(8, 180, 332, 180),
         # the plate on the oven FLOOR, and the bar lying flat on it
         poly([(42, 150), (47, 160), (127, 160), (132, 150), (42, 150)]),
         rect(56, 134, 62, 16), ln(56, 142, 118, 142),
         ''.join(ln(x, 134, x, 150) for x in (71.5, 87, 102.5)),
         cap(85, 114, 'chocolate laid FLAT'), cap(85, 126, 'on the plate'),
         # the frequency, read off the label rather than assumed
         rect(216, 22, 104, 22), txt(268, 37.5, '2450 MHz', 'num'),
         dash(214, 40, 198, 54),
         cap(268, 60, 'the frequency, off the'), cap(268, 72, 'label at the BACK'),
         # and the turntable, out on the bench
         cap(262, 96, 'the turntable,'), cap(262, 108, 'taken OUT'),
         circ(262, 150, 30), circ(262, 150, 9),
         ln(200, 164, 226, 158), head(26, -6, 226, 158, 5.5),
         cap(170, 200, 'with the turntable IN, the food rides through the hot spots'),
         cap(170, 214, 'and melts evenly, which measures nothing'),
         cap(170, 236, 'the patches are YOURS to find: measure CENTRE to CENTRE'),
         cap(170, 250, 'of two side by side, and that gap is HALF a wavelength'),
         cap(170, 264, 'so c = f × 2d')]
    return svg(278, 'A microwave oven with its door open and its turntable removed and standing on '
                    'the bench beside it, a bar of chocolate lying flat on a plate on the oven '
                    'floor, a thirty centimetre ruler on top of the oven, and the frequency label '
                    'from the back of the oven reading 2450 megahertz', *p)

# ---- PR-FN08  three cups and an empty tally sheet ------------------------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: The decision tree, which
# the row's own why_no_drawing names as the answer — no branches, no 1-in-3 or 2-in-3, and nothing
# saying which way of playing wins. Also: which cup the counter is under (it is drawn standing
# beside the cups, not concealed under any one of them, so no cup is implied to be the hiding
# place), no cup drawn lifted, and not one tally mark or count in the sheet — the numbers in those
# four cells ARE the experiment.
#
# OFF THE ROW: The three cups mouth down come from equipment "Cups or cards × 3" and from steps 2
# and 3, which say the player picks "without lifting it" and the host "lifts one of the other two
# cups" — so they start down. The numbers come from step 4, "Record the choice", which needs the
# cups named. The counter beside them is equipment "A counter or sweet to hide" plus step 1, "hides
# the counter under one of three cups". The sheet is equipment "Tally sheet"; its TWO blocks are
# step 5, "Do 50 trials always sticking, then 50 always switching", and the × 50 on each is that
# same step; the won/lost rows are step 4, "Record the choice and the result". The first foot
# caption is step 1's "while the other looks away" and step 3's "always revealing an empty one". The
# second is step 5 and 6 — two blocks, two rates to compare.
def fn08():
    TOP, TABLE = 44.0, 86.0
    def cup(cx):
        return poly([(cx - 19, TABLE), (cx - 14, TOP), (cx + 14, TOP), (cx + 19, TABLE)])
    p = [cap(170, 22, 'three identical cups, mouth down'),
         ln(40, TABLE, 276, TABLE),
         cup(100), cup(170), cup(240),
         txt(100, 104, '1', 'num'), txt(170, 104, '2', 'num'), txt(240, 104, '3', 'num'),
         circ(58, 78, 8), circ(58, 78, 3.4), cap(58, 104, 'counter'),
         # the sheet, ruled and empty
         cap(170, 140, 'ONE tally sheet, TWO separate blocks'),
         rect(44, 152, 252, 100),
         ln(44, 176, 296, 176), ln(170, 152, 170, 252), ln(44, 214, 296, 214),
         cap(107, 169, 'ALWAYS STICK  × 50'), cap(233, 169, 'ALWAYS SWITCH  × 50'),
         cap(54, 198, 'won', 'start'), cap(54, 236, 'lost', 'start'),
         cap(180, 198, 'won', 'start'), cap(180, 236, 'lost', 'start'),
         cap(170, 274, 'hidden under ONE of them while the player looks away, and'),
         cap(170, 288, 'the host always lifts an empty one — he knows which is which'),
         cap(170, 310, 'fifty sticking and fifty switching, each in its own block —'),
         cap(170, 324, 'or the two rates are one tally nobody can separate')]
    return svg(334, 'Three identical cups standing mouth down in a row on a table, numbered one to '
                    'three, with the counter on the table beside them, and below it a blank tally '
                    'sheet ruled into two separate blocks headed always stick and always switch, '
                    'each block having a won row and a lost row', *p)

# ---- PR-FN09  the trundle wheel calibrated, and a boundary that leaves the frame -----------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: No park outline, which is
# the trap the row's own why_no_drawing names: the boundary is a fragment that leaves the picture at
# both edges, so the picture claims nothing about what shape any particular park is. And no
# decomposition into rectangles and triangles (steps 4–6) — choosing those shapes and where to cut
# them IS the area answer, so drawing an example would be doing the practical on an invented park.
# No total, no section lengths, no area, no satellite image.
#
# OFF THE ROW: The wheel, the click and the 318 mm are the `science` sentence word for word — "one
# click is one circumference, usually exactly a metre — which is why the wheel is about 318 mm
# across, since C = πd" — so the caption hedges with "on most wheels" exactly as the row does. The
# two panels' geometry is step 2, "walk the perimeter with the trundle wheel, recording each
# straight section separately": a section runs from one corner to the next, and the cones marking
# those corners are `equipment`'s own "Cones to mark corners". "Add the sections for the total
# perimeter" is step 3, which is why the caption says write each one down before adding them up. The
# boundary leaving the frame is the `why_no_drawing` field answered rather than ignored. `venue:
# outdoors` is why it stands on a ground line.
def fn09():
    C = 2 * 3.1416 * 29
    end = 54 + C

    def cone(cx, y):
        return (poly([(cx - 8, y), (cx, y - 22), (cx + 8, y)]) + ln(cx - 12, y, cx + 12, y))

    p = [ln(14, 96, 330, 96),
         circ(54, 67, 29), ln(54, 67, 54, 96), dot(54, 96),
         ln(54, 67, 126, 34), ln(122.7, 26.7, 129.3, 41.3),
         arrow(25, 67, 83, 67), lbl(54, 61, 'd'),
         circ(end, 67, 29, 'pt', 'style="stroke-dasharray:4 3;opacity:.6"'),
         dash(end, 67, end, 96), dot(end, 96),
         cap(272, 62, 'one turn', 'start'), cap(272, 76, 'later', 'start'),
         dash(54, 96, 54, 116), dash(end, 96, end, 116),
         arrow(54, 124, end, 124), lbl(145, 118, '1 m'),
         cap(170, 146, 'one full turn is ONE CLICK, and on most wheels ONE METRE'),
         cap(170, 160, 'C = πd, so a one-metre wheel is about 318 mm across'),
         dash(8, 176, 112, 214), ln(112, 214, 246, 214), dash(246, 214, 332, 178),
         cone(112, 214), cone(246, 214),
         cap(179, 204, 'cone at each corner'),
         arrow(112, 236, 246, 236), cap(179, 230, 'one section'),
         cap(170, 258, 'walk it cone to cone, and write every straight section'),
         cap(170, 272, 'down on its own before adding them up'),
         cap(170, 294, 'the boundary runs off this picture on purpose: a park is'),
         cap(170, 308, 'a different shape in every town — you place the cones')]
    return svg(318, 'A trundle wheel standing on the ground with its diameter marked and a rim '
                    'mark at the contact point, shown again one full revolution later with the '
                    'metre it has rolled measured along the ground, and below it one straight '
                    'section of a park boundary running off both sides of the picture with a cone '
                    'at each of its two corners', *p)

# ---- PR-FN11  the kit each team is issued, and no tower ------------------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: Any tower at all. The row's
# science paragraph is triangles-versus-squares and step 7 is "discuss which shapes survived", so
# the shape of the tower IS the answer — a drawn frame would print one team's design, and a
# triangulated one would hand over the whole discussion. Also withheld: how tall a tower gets (the
# top is a dashed line captioned "wherever it ends up"), how much mass it carries (two masses in the
# basket rather than a filled one), and the height-against-mass graph the outcome asks for.
#
# OFF THE ROW: Step 1 names the kit exactly — "20 sticks, 20 marshmallows, one metre of tape" —
# which is the tray and its three labels, and "give each team the same materials" is the "the same
# to every team" heading. Equipment's "Metre stick" is the graduated rule; step 3 "measure each
# tower's height" is the arrowed h from the table to the top line. Step 4 "hang the basket from the
# top and add masses 50 g at a time" is the string from the dashed top, the basket (equipment:
# "Small basket or cup to hold the masses") and the slotted masses labelled 50 g. Equipment's "Eye
# protection" plus the aim's "test it to destruction" is the safety caption. Nothing in the picture
# is outside those words: the 30 cm ruler, stopwatch and camera are drawn nowhere because their
# placement is not a set-up fact.
def fn11():
    STICK = [44 + 6 * k for k in range(8)]
    MALLOW = [37, 51, 65, 79, 93]
    p = [ln(16, 206, 324, 206),
         cap(65, 32, 'the same to'), cap(65, 44, 'every team'),
         rect(18, 52, 94, 154, 'pt', 'style="stroke-dasharray:5 4;opacity:.65"'),
         ''.join(ln(x, 62, x, 102) for x in STICK),
         cap(65, 116, '20 sticks'),
         ''.join(circ(cx, 138, 6.5) for cx in MALLOW),
         cap(65, 158, '20 marshmallows'),
         circ(38, 175, 13), circ(38, 175, 5.5),
         ln(51, 169, 98, 169), ln(51, 181, 98, 181), ln(98, 169, 98, 181),
         cap(65, 201, '1 m of tape'),
         cap(151, 50, 'metre stick'),
         rect(146, 62, 11, 144),
         ''.join(ln(157, 206 - 14.4 * k, 157 + (8 if k % 5 == 0 else 4), 206 - 14.4 * k)
                 for k in range(11)),
         cap(240, 72, 'the top of your tower,'), cap(240, 86, 'wherever it ends up'),
         dash(176, 100, 296, 100),
         ln(248, 100, 248, 122), ln(248, 122, 230, 134), ln(248, 122, 266, 134),
         beaker(230, 134, 36, 26),
         rect(236, 140, 24, 8), rect(236, 149, 24, 8),
         cap(280, 142, '50 g at a', 'start'), cap(280, 156, 'time', 'start'),
         arrow(132, 100, 132, 206), lbl(124, 155, 'h', 'end'),
         cap(170, 228, 'the kit is fixed, so the shape is the only variable —'),
         cap(170, 242, 'which is why no tower is drawn here, only the rig'),
         cap(170, 264, 'eye protection on — a tower fails all at once, not slowly')]
    return svg(276, 'The kit issued to every team, laid out in a tray: twenty dried spaghetti '
                    'sticks, twenty marshmallows and a metre of masking tape. Beside it the test '
                    'rig, with a metre stick standing on the table, a dashed line marking the top '
                    'of the tower wherever it ends up, the height measured from the table to that '
                    'line, and a basket hanging from the top holding slotted masses added fifty '
                    'grams at a time', *p)

# ---- PR-FN13  the cylinder on the balance, and no layers -----------------------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: The layer order, and the
# layers themselves — step 2 is "predict the order of the layers from the densities alone", so a
# drawn tower is that answer. Also withheld: any density figure (the balance readout is an empty
# box, not a number), and where the grape, bolt, cork, bead and ping-pong ball come to rest, which
# is what steps 6 and 7 ask. The four liquids are not drawn as a row of bottles either, because any
# left-to-right arrangement of honey, washing-up liquid, water and oil reads as a claim about their
# order.
#
# OFF THE ROW: The balance, the measuring cylinder and the 50 ml level are step 1, "Weigh 50 ml of
# each liquid and calculate its density", with the balance and measuring cylinder both named in
# `equipment`. The funnel is in `equipment`, and its stem sitting just inside the rim with the
# stream running down the glass is step 3, "then each next one gently down the side of the jar" —
# the row's `science` says why in as many words: "Pouring down the side of the jar stops the layers
# mixing on the way in", which is the crossed-out centre line and the caption under it. The jar is
# the "Tall clear jar or measuring cylinder" of `equipment`, and it is empty because step 2 sits
# between weighing and pouring. Nothing in the picture comes from outside those fields: no
# colouring, no objects, no numbers.
def fn13():
    p = [# 1 · the weighing set-up. The SAME 50 ml every time is what makes step 2 arithmetic
         # rather than a guess, so the marked level and the empty readout are the whole of it.
         rect(44, 176, 88, 22), rect(60, 166, 56, 10), rect(106, 182, 20, 10),
         cap(138, 192, 'balance', 'start'),
         beaker(76, 88, 24, 78, 124),
         # the 50 ml line is the reading, so no graduation stub is drawn across it
         ''.join(ln(76, 160 - 9 * i, 82, 160 - 9 * i) for i in range(7) if i != 4),
         cap(70, 128, '50 ml', 'end'),
         # 2 · the jar, EMPTY. Which liquid goes in first is step 2 and it is not drawn here.
         beaker(202, 62, 54, 136),
         poly([(190, 20), (212, 46), (234, 20)]), rect(209, 46, 6, 30),
         cap(238, 30, 'funnel', 'start'),
         poly([(212, 76), (208, 90), (208, 180)]), head(0, 12, 208, 186, 5.5),
         dash(229, 78, 229, 176),
         ln(221, 120, 237, 136), ln(237, 120, 221, 136),
         cap(262, 128, 'NOT into', 'start'), cap(262, 142, 'the middle', 'start'),
         cap(86, 222, '1 · weigh 50 ml of each'),
         cap(232, 222, '2 · pour down the SIDE'),
         cap(170, 250, 'a stream into the middle mixes the layers on the way in'),
         cap(170, 272, 'the ORDER is YOURS, from the densities alone — step 2,'),
         cap(170, 286, 'before a single drop is poured')]
    return svg(296, 'A measuring cylinder holding 50 ml of liquid standing on a balance, and '
                    'beside it an empty tall jar with a funnel whose stem reaches just inside the '
                    'rim so the liquid runs down the inside wall, with the centre of the jar '
                    'crossed out', *p)

# ---- PR-HM01  the bottle standing in the bowl, a moment before the foam --------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: The foam. The row's own
# outcome is "a column of foam" and the previous session's note says the foam is the whole of it —
# so the bottle is drawn as it stands BEFORE step 6, with only a fifth of it filled and the yeast
# still in its own cup. Nothing anywhere suggests how high the foam goes or what it looks like,
# which is the thing the practical exists to show. The warm bottle (the exothermic half) is not
# drawn either.
#
# OFF THE ROW: Every object is a clause of steps 1-5. "Stand the bottle in the washing-up bowl" ->
# the bowl's near rim passes in front of the bottle, which is the one thing that distinguishes in-it
# from beside-it. "Empty 500 ml plastic bottle with a narrow neck" -> the neck is 34 wide against a
# 74-wide body, labelled. "Pour in 100 ml of 6% hydrogen peroxide" -> a liquid line about a fifth
# up, labelled 100 ml, with the caption naming the peroxide and the squeeze of washing-up liquid
# that shares it. "Drip food colouring down the inside of the neck so the foam comes out striped" ->
# two streaks with a bead each, INSIDE the neck and not reaching the liquid, labelled and captioned
# with the reason. "In a separate cup stir one 7 g yeast sachet into 3 tbsp of warm water. Leave one
# minute" -> a cup standing apart on the same bench, a third full, captioned with all three
# quantities. "Pour the yeast mixture into the bottle and step back" -> stated in the last caption,
# not drawn as an action, because pouring it is the run. Goggles are on the equipment list and the
# guide draws no risks column, so they are in that caption too.
def hm01():
    FLOOR, RIM = 190, 126
    p = [ln(16, FLOOR, 324, FLOOR, 'axis'),
         # the washing-up bowl. Its near rim passes IN FRONT of the bottle, which is the whole of
         # step 1: the bottle stands in the bowl rather than beside it.
         ln(40, RIM, 52, FLOOR), ln(212, RIM, 200, FLOOR), ln(52, FLOOR, 200, FLOOR),
         path('M 40 126 Q 126 142 212 126', 'pt', 'style="opacity:.8"'),
         # the 500 ml bottle: narrow neck, screw lip, shoulder, body
         ln(108, 38, 108, 68), ln(142, 38, 142, 68), ln(108, 46, 142, 46),
         path('M 108 68 Q 104 84 89 92'), path('M 142 68 Q 146 84 163 92'),
         ln(89, 92, 89, FLOOR), ln(163, 92, 163, FLOOR), ln(89, FLOOR, 163, FLOOR),
         cap(84, 110, '500 ml bottle', 'end'),
         ln(89, 166, 163, 166), cap(126, 161, '100 ml'),
         # the colouring, run down the INSIDE of the neck rather than into the liquid
         path('M 114 50 Q 109 64 116 80', 'pt', 'style="opacity:.75"'),
         path('M 136 50 Q 141 66 133 82', 'pt', 'style="opacity:.75"'),
         dot(116, 81, 1.8), dot(133, 83, 1.8),
         cap(84, 62, 'colouring', 'end'), ln(88, 58, 106, 58),
         # the yeast, standing in its own cup on the bench
         ln(244, 136, 250, FLOOR), ln(292, 136, 286, FLOOR), ln(250, FLOOR, 286, FLOOR),
         path('M 244 136 Q 268 143 292 136', 'pt', 'style="opacity:.8"'),
         path('M 292 148 Q 310 157 292 170'),
         ln(247.6, 168, 288.4, 168),
         cap(268, 94, '7 g dried yeast'), cap(268, 108, 'in 3 tbsp warm water'),
         cap(268, 122, 'stirred, left a minute'), ln(268, 127, 268, 134),
         cap(170, 210, '100 ml of 6% peroxide and a good squeeze of washing-up'),
         cap(170, 224, 'liquid, in a bottle standing IN the bowl'),
         cap(170, 246, 'drip the colouring down the INSIDE of the neck, so the'),
         cap(170, 260, 'foam comes out striped'),
         cap(170, 282, 'goggles on, then the yeast goes in LAST and you step back')]
    return svg(292, 'A 500 ml plastic bottle standing in a washing-up bowl holding 100 ml of '
                    'peroxide with washing-up liquid, food colouring striped down the inside of its '
                    'narrow neck, and a separate cup of yeast stirred into warm water standing on '
                    'the bench beside it', *p)

# ---- PR-HM02  the cabbage strained, and six tubes all the same purple ----------------------------
# WHAT IT WITHHOLDS, AND THAT IS THE WHOLE OF WHY IT IS DRAWABLE AT ALL: Every colour and every
# position. The tubes are identical and unlabelled, drawn at the moment they all hold the same
# purple liquid, so the picture cannot hand over the READING (red through green) or the ORDER (step
# 4's left-to-right ranking by pH) — which together are the whole answer. No substance is assigned
# to a tube, and no green-turning-purple neutralisation from step 5. The caption lists the six
# substances in the row's own step-3 order, which is deliberately not the pH order.
#
# OFF THE ROW: Sieve, jug and drip: `equipment` "Sieve or colander", step 1 "chop half a red
# cabbage, cover with boiling water, leave 15 minutes, strain. Keep the purple liquid in the
# fridge", and `notes` "boil and strain the night before — the one bit of prep that cannot be
# rushed" (the three right-hand caption lines are that step almost verbatim). Six tubes in a rack at
# one level: `equipment` "Glass test tubes and a rack × 6–8 tubes" and step 2 "part-fill six to
# eight test tubes with the purple liquid" — six rather than eight because step 3 names exactly six
# substances. The arrow from jug to rack is step 1 feeding step 2. The closing caption is step 3's
# own list, "a different household substance to each … and plain water as the control". Nothing in
# the picture comes from `science`, which is where the pH colours are.
def hm02():
    tubes = [58, 102, 146, 190, 234, 278]
    p = [# the night before: chopped cabbage in a sieve, straining into a jug
         path('M 66 34 L 74 22 L 82 34'), path('M 86 38 L 96 20 L 106 38'),
         path('M 110 34 L 118 23 L 126 34'),
         ln(56, 28, 136, 28), path('M 56 28 Q 96 88 136 28'),
         path('M 64 31 Q 96 68 128 31', 'pt', 'style="stroke-dasharray:3 4;opacity:.6"'),
         ln(56, 28, 38, 24),
         dash(96, 60, 96, 76),
         beaker(70, 80, 52, 42, 96), path('M 122 90 Q 137 101 122 112'),
         ln(152, 32, 136, 26),
         cap(156, 36, 'half a red cabbage, chopped,', 'start'),
         cap(156, 50, 'covered in boiling water,', 'start'),
         cap(156, 64, '15 minutes, then strained', 'start'),
         cap(156, 90, 'the purple liquid keeps in', 'start'),
         cap(156, 104, 'the fridge — the night before', 'start'),
         ln(96, 126, 96, 136), head(0, 10, 96, 136, 5.5),
         # six tubes standing in a rack, identical on purpose
         ''.join(tube(cx, 144, 214, 26, 9, 184) for cx in tubes),
         beaker(32, 200, 272, 32),
         ''.join(txt(cx, 252, str(i + 1), 'num') for i, cx in enumerate(tubes)),
         cap(170, 276, 'the same depth of purple in every tube, and nothing'),
         cap(170, 290, 'added yet — then one thing in each: vinegar, lemon,'),
         cap(170, 304, 'bicarb, soapy water, salt water, plain water as the control')]
    return svg(312, 'A sieve of chopped red cabbage draining into a jug of purple liquid, and '
                    'below it six identical test tubes standing in a rack, each part-filled to '
                    'the same depth and numbered one to six with nothing added to them yet', *p)

# ---- THE LAST SIXTEEN ------------------------------------------------------------------------------
# EVERY ONE OF THESE WAS DRAWN AND THEN ATTACKED BY A SECOND READER TOLD TO REFUSE IT, and all
# sixteen came back `needs_changes` — which is what a refuter is for and is not by itself a
# finding. TWO OF THEM GAVE THE ANSWER AWAY and would have shipped: `fn08` captioned the host's
# cup trick with "he knows which is which", which is the hinge the row's own `science` calls
# crucial and the one candidate its `variables` list flags as load-bearing; and `hm13` drew a
# stop line and a dot on a tape it had itself graduated at 10 cm a division, so the distance the
# practical exists to measure was countable straight off the card. Both are out of the drawing.
#
# AND THE REST WERE FOUND BY LOOKING, which is the twenty-fourth time this project says a
# screenshot is the last word on a drawing: a thermometer bulb the same width as its own stem, a
# liquid level drawn at exactly half a cup the method then adds more to, and a leader line that
# ran flat out of the cup and through the beaker wall so the picture showed one surface spanning
# both vessels — under a caption that had to spend a line denying it. A caption that must deny
# what the picture shows is the fault this file records where a figure and its prose disagree.

def hm04():
    p = [# the battery, brought down so that BOTH terminals sit on the pad at once
         ln(170, 20, 170, 34), head(0, 12, 170, 34, 5.5),
         rect(157, 38, 26, 34), cap(214, 50, '9V battery', 'start'), ln(186, 52, 210, 50),
         rect(160.5, 72, 5, 9), rect(174.5, 72, 5, 9),
         cap(128, 54, 'both terminals', 'end'), cap(128, 66, 'on the wool at once', 'end'),
         ln(132, 62, 161, 76.5),
         # the pad: an outline and two scribbles, because wire wool is a tangle
         path('M 136 113 Q 132 92 152 84 Q 170 78 188 84 Q 208 92 204 113'),
         poly([(144, 104), (152, 92), (158, 105), (150, 97), (165, 89), (159, 101),
               (174, 96), (168, 85), (181, 93), (176, 104), (189, 97), (184, 88),
               (195, 100)]),
         poly([(146, 110), (156, 101), (149, 106), (163, 109), (155, 112), (170, 103),
               (162, 107), (178, 111), (171, 105), (186, 108), (179, 112), (193, 106)]),
         ln(152, 86, 166, 106), ln(186, 87, 174, 107), ln(158, 95, 184, 99),
         # the tray
         poly([(86, 87), (96, 113), (244, 113), (254, 87)]),
         cap(78, 92, 'metal', 'end'), cap(78, 104, 'baking tray', 'end'), ln(82, 100, 91, 102),
         cap(170, 131, 'a 3 to 5 g pad of wire wool, grade 0000'),
         # the scale, platform empty and display blank: the readings are the experiment
         rect(32, 159, 88, 7), rect(38, 166, 76, 18), rect(63, 170, 26, 10),
         cap(76, 200, 'digital scale'),
         path('M 206 160 Q 246 206 286 160'), ln(218, 172, 274, 172),
         cap(246, 200, 'bowl of water alongside'),
         cap(170, 218, 'weigh the pad before it is lit, and again once it is'),
         cap(170, 232, 'stone cold — the two readings are the whole experiment')]
    return svg(244, 'A pad of wire wool on a metal baking tray with a 9V battery lowered onto it '
                    'so that both terminals touch the pad at once, and a digital scale with an '
                    'empty platform and a bowl of water standing alongside', *p)

def hm05():
    # THE VOLUME AND THE THERMOMETER ARE THE WHOLE METHOD, and the graph is the result, so neither
    # the graph nor a glass fizzing harder than its neighbour is here. Three identical glasses at
    # one level, before the tablet touches the water.
    G = ((112, 'cold'), (190, 'warm'), (268, 'hot'))
    p = [# the measuring jug: what makes the volume the same run after run
         beaker(26, 82, 66, 116, 126),
         path('M 26 104 Q 12 120 26 136'),                              # the handle
         ln(92, 82, 105, 78),                                           # the pouring lip
         ''.join(ln(26, 110 + 16 * k, 34, 110 + 16 * k) for k in (0, 2, 3, 4)),
         cap(59, 74, 'measuring jug'),
         ln(106, 84, 122, 112), head(16, 28, 122, 112, 6),
         # the three glasses, identical, filled to one level
         ''.join(beaker(x, 114, 60, 84, 140) for x, _ in G),
         dash(172, 140, 190, 140), dash(250, 140, 268, 140),
         ''.join(cap(x + 30, 216, nm) for x, nm in G),
         # the probe, down into the WATER of the run being set up
         rect(112, 60, 36, 20), rect(116, 64, 28, 12),
         rect(125, 80, 8, 80), path('M 125 160 L 129 168 L 133 160'),
         cap(129, 52, 'thermometer'),
         # one whole tablet, still above the water
         circ(162, 76, 8), ln(162, 88, 162, 106), head(0, 18, 162, 106, 5.5),
         cap(178, 80, 'one WHOLE tablet', 'start'),
         # the clock, at zero
         rect(297, 64, 6, 6), circ(300, 88, 18), ln(300, 88, 300, 74), dot(300, 88, 2),
         cap(300, 60, 'stopwatch'),
         cap(170, 240, 'the same volume every run — change ONE thing at a time')]
    return svg(252, 'A measuring jug standing beside three identical glasses filled to the same '
                    'level and labelled cold, warm and hot, with a digital thermometer probe in '
                    'the first glass, one whole tablet held above it, and a stopwatch at zero',
               *p)

def hm09():
    ROAD, KERB, A, B = 150, 144, 100, 270

    # THE SHADE'S BACK EDGE IS VERTICAL so the arm actually MEETS it. Drawn as a symmetric
    # trapezium its left edge runs (x+11,12) to (x+14,22), so at the two heights the arm walls
    # arrive at it sits at x+11.6 and x+13.1 -- the outer wall landed 0.6 short, which the 1.3
    # stroke hides, and the INNER wall landed 2.1 short and ended in mid air. At 20rem that is a
    # visible break between a post and its own lamp, on both posts. Caught on a screenshot, which
    # CLAUDE.md records as the last word on a drawing.
    def post(x):
        return (path('M %.1f %d L %.1f 30 Q %.1f 14 %.1f 14'
                     % (x - 2.5, ROAD, x - 2.5, x - 2.5, x + 11)) +
                path('M %.1f %d L %.1f 36 Q %.1f 19 %.1f 19'
                     % (x + 2.5, ROAD, x + 2.5, x + 2.5, x + 11)) +
                poly([(x + 11, 12), (x + 28, 12), (x + 25, 22), (x + 11, 22), (x + 11, 12)]))

    p = [# the pavement you stand on, the kerb, and the road
         ln(14, KERB, 76, KERB), ln(76, KERB, 76, ROAD), ln(76, ROAD, 330, ROAD),
         post(A), post(B),
         # one car, between the two points
         ln(150, 131, 220, 131), ln(150, 131, 150, 144), ln(220, 131, 220, 144),
         ln(150, 144, 159, 144), ln(173, 144, 191, 144), ln(205, 144, 220, 144),
         poly([(162, 131), (167, 118), (194, 118), (201, 131)]),
         circ(166, 143, 7), circ(198, 143, 7),
         ln(232, 134, 258, 134), head(26, 0, 258, 134, 5.5),
         # you, back from the kerb, a stopwatch in one hand and a blank sheet in the other
         person(38, KERB),
         ln(38, 88, 58, 96), circ(64, 99, 7), ln(64, 99, 64, 93),
         ln(38, 90, 24, 96), rect(10, 96, 18, 24), rect(15, 93, 8, 3),
         ln(13, 106, 25, 106), ln(13, 113, 25, 113),
         # the one measurement, taken once
         dash(A, ROAD, A, 176), dash(B, ROAD, B, 176),
         arrow(A, 182, B, 182), lbl(185, 177, 'd'),
         cap(170, 204, 'two fixed landmarks — consecutive lamp posts are ideal'),
         cap(170, 218, 'measured once with a tape or the tool in Google Maps'),
         cap(170, 240, 'start the watch at one post and stop it at the other'),
         cap(170, 254, 'speed = d ÷ t, and × 2.237 for mph'),
         cap(170, 276, 'you, the stopwatch and the sheet you log twenty on, all'),
         cap(170, 290, 'well back on the pavement — never in the road')]
    return svg(300, 'Two consecutive lamp posts standing beside a road with the distance between '
                    'them marked d, one car passing between them, and an observer up on the '
                    'pavement well back from the kerb holding a stopwatch and a clipboard', *p)

def hm10():
    """The recording sheet, ruled up before the first look. THE TALLY AND THE BAR CHART ARE THE
    RESULT and neither is here: every cell is empty, and what fixes the grid at eight columns is
    the row's own two minutes divided by its own fifteen seconds. The five rows are the five
    behaviours the step names and no others."""
    def fish(cx, cy):
        # THE CURVE REACHES cy +- 6, NOT cy +- 12: a quadratic sits half way to its control point,
        # so the drawn body is 12 tall and the tail corners are its widest part. Anything placed
        # against a fish is placed against cx-16..cx+9 by cy-6..cy+6.
        return (path('M %.1f %.1f Q %.1f %.1f %.1f %.1f Q %.1f %.1f %.1f %.1f'
                     % (cx - 9, cy, cx, cy - 12, cx + 9, cy, cx, cy + 12, cx - 9, cy)) +
                poly([(cx - 9, cy), (cx - 16, cy - 6), (cx - 16, cy + 6), (cx - 9, cy)]) +
                dot(cx + 4, cy - 1, 1.4))

    GL, GR, GT = 112.0, 316.0, 190.0                   # the grid: left, right, top
    COL, ROW = (GR - GL) / 8, 17.0
    behaviours = ('swimming', 'still', 'at the surface', 'hiding', 'feeding')

    p = [# the tank, and the ONE animal you stay with -- which is step 1 and the thing most likely
         # to be got wrong, so it is ringed rather than written
         rect(26, 34, 128, 66), ln(26, 44, 154, 44),
         # fish(104, 92) REACHED y=98 AGAINST A TANK FLOOR AT y=100. Two units, of which 1.3 is
         # the stroke either side, so the fish and the bottom rail merged into one line and the
         # fish read as stuck through the glass. Seven units of clearance now.
         fish(116, 56), fish(104, 87), fish(136, 82),
         # THE RING IS CENTRED ON THE FISH, NOT ON ITS Q-CURVE ORIGIN. A fish is drawn from cx-16
         # to cx+9, so its middle is cx-3.5: centred at cx the ring left 1.9 of clearance at the
         # tail and 10 at the nose, and 1.9 is narrower than the 1.3 stroke either side of it, so
         # the ring and the tail merged and the one mark that says "this is the animal you stay
         # with" read as a line cut through it. A screenshot is what showed that; nothing measures
         # it -- the glyph is inside the viewBox either way.
         fish(70, 72), circ(66.5, 72, 18, 'pt', 'style="stroke-dasharray:4 3"'),
         cap(90, 118, 'ONE animal, and'), cap(90, 132, 'stay with it'),
         # the stopwatch, with the one mark it is there for
         circ(250, 68, 24), rect(245, 38, 10, 7),
         ln(250, 46, 250, 52), ln(272, 68, 266, 68),
         ln(250, 90, 250, 84), ln(228, 68, 234, 68),
         ln(250, 68, 267, 68), dot(250, 68, 2),
         txt(292, 72, '15 s', 'num'), cap(250, 118, 'stopwatch'),
         # the sheet: eight looks across, five behaviours down, and nothing written in any of them
         cap(214, 152, 'two minutes, a look every 15 s'),
         arrow(GL, 166, GR, 166, False),
         ''.join(txt(GL + COL * (k + .5), 184, str(k + 1), 'num') for k in range(8)),
         ''.join(ln(GL, GT + ROW * k, GR, GT + ROW * k) for k in range(6)),
         ''.join(ln(GL + COL * k, GT, GL + COL * k, GT + ROW * 5) for k in range(9)),
         ''.join(cap(106, GT + ROW * k + 13, behaviours[k], 'end') for k in range(5)),
         cap(170, 297, 'a tank, a pond or birds at a window all work'),
         cap(170, 311, 'rule up TWO: one before feeding, one after'),
         cap(170, 325, 'you cannot watch it all, so you SAMPLE')]
    return svg(334, 'A fish tank holding four fish with one of them ringed, a stopwatch with its '
                    'fifteen-second mark labelled, and an empty recording grid of five behaviour '
                    'rows against eight fifteen-second columns', *p)

def hm13():
    p = [# ---- THE RUN BEFORE ANYBODY LETS GO. Everything here is a fact the row states: a hard
         #      floor about 3 m long, a start line taped onto it (step 2), and the tape measure
         #      laid from that line (step 3, "set it on the line ... measure how far it travels").
         #      The tape's left end runs on through the floor, so the line the tape reads nought
         #      at and the line the model stands on are visibly the SAME line.
         ln(14, 118, 328, 118),
         rect(22, 118, 48, 4),
         ln(70, 108, 320, 108), ln(70, 108, 70, 124), ln(320, 108, 320, 118),
         ticks(70, 118, 250, 30, 5),
         lbl(320, 102, '3 m', 'end'),
         cap(52, 140, 'taped start line'),
         cap(210, 140, 'tape measure from the line, on hard floor'),

         # ---- THE MODEL, its front edge on that line. DASHED ON PURPOSE: step 1 is "build the
         #      mechanism from the kit", so the BOOKLET fixes its shape and this row does not --
         #      a drawn assembly would be a guess at somebody else's kit printed on a card a
         #      child is following. What is solid is what the row states: two WHEELS, named by
         #      its own science ("friction between the wheels and the floor is what eventually
         #      stops it"). The stopwatch is in `equipment` and no step uses it, so where it goes
         #      is not a set-up fact and it is not drawn.
         rect(32, 80, 38, 26, 'pt', 'style="stroke-dasharray:5 4;opacity:.75"'),
         circ(41, 112.5, 5.5), circ(61, 112.5, 5.5),

         # ---- THE WINDING. The counts are steps 3 and 5 word for word.
         arc(51, 44, 14, -150, 130), head(-0.766, -0.643, 42.0, 54.7, 6),
         dash(58, 62, 58, 78),
         cap(78, 38, 'your kit, built to its', 'start'),
         cap(78, 52, 'own booklet — wind it', 'start'),
         cap(78, 66, '5, then 10, 15, 20', 'start'),

         # ---- AND THEN IT GOES, AND THAT IS WHERE THIS PICTURE STOPS. No stop line, no dot on
         #      the tape and no dimension: how far it travels at each number of winds IS the
         #      measurement, and a mark anywhere on a tape graduated in tens of centimetres is a
         #      reading whatever its caption says -- the first version put one at 2.18 m of the
         #      3 m run, countable off 22 divisions, under a caption claiming it was not drawn.
         #      The winds-against-distance graph and the point where the line stops being
         #      straight -- the whole of `outcome` -- are nowhere here either.
         cap(200, 86, 'let go — then read off where it stops'),
         ln(76, 96, 230, 96), head(28, 0, 230, 96, 6),

         # ---- and the two things the method gets wrong if nobody says them ---------------------
         cap(170, 170, 'check it runs freely before you measure anything'),
         cap(170, 192, 'three runs at each number of winds — the MIDDLE value'),
         cap(170, 206, 'is what you write down, not the best one')]
    return svg(216, 'A wind-up model standing with its front edge on a taped start line on a hard '
                    'floor, drawn as a dashed box on two wheels because the kit rather than this '
                    'row fixes its shape, with a circular arrow above it for the winding and a '
                    'three-metre tape measure running along the floor from that same line, and an '
                    'arrow along the run showing the direction it is let go in', *p)

def hm22():
    # THE RUN IS THE SET-UP AND THE BAR CHART IS THE ANSWER. `outcome` is "a bar chart of surface
    # against speed, and a ranking of the surfaces by how much friction they add", so no speed, no
    # time and no distance VALUE is on this picture: d and t are named and never given numbers.
    # An earlier version drew the four surfaces as four equal framed boxes on a common baseline
    # with a category name centred under each -- which is that bar chart's own x-axis, with all
    # four bars the same height. They are four short pieces of GROUND now, so nothing reads as a
    # bar; and they stay in the equipment list's own order, which alternates rough and smooth and
    # is therefore not the friction ranking either.
    GY, SX, FX = 104, 136, 306

    def mark(x, word):
        """A masking-tape line: the tape on the ground, and the sightline up off it."""
        return ln(x, GY, x, 74) + rect(x - 7, GY, 14, 4) + cap(x, 68, word)

    def ground(x1, x2, ink):
        """A piece of floor is a LINE with something on it, not a box. The framed version read as
        a bar; and the carpet inside it -- eleven evenly spaced equal-height risers off a baseline
        -- was the shape `ticks()` draws for the tape measure 45 units above, so one picture held
        two things that read as rules. A screenshot is what said so; nothing measures wrong."""
        return ln(x1, 200, x2, 200) + ink

    p = [ln(14, GY, 330, GY, 'axis'),
         mark(SX, 'start'), mark(FX, 'finish'),
         # THE SPAN IS THE LABELLED THING, not either line: step 4 is "use the same distance on
         # every surface, or the comparison is worthless", so what has to be seen is d itself.
         dash(SX, GY + 4, SX, 128), dash(FX, GY + 4, FX, 128),
         rect(SX, 128, FX - SX, 9), ticks(SX, 137, FX - SX, 12), lbl(221, 124, 'd'),
         # THE CAR BEFORE THE LINE AND ALREADY MOVING, which is the whole of the rolling start.
         # No aerial: the row says "a remote-control car" and nothing about one, and an aerial
         # asserts a kind of car (most are 2.4 GHz and have none) the row never states.
         circ(44, 96, 8), circ(78, 96, 8), dot(44, 96, 1.8), dot(78, 96, 1.8),
         rect(30, 78, 62, 14), poly([(42, 78), (50, 66), (72, 66), (80, 78)]),
         ln(100, 86, 128, 86), head(28, 0, 128, 86, 5.5),
         # the stopwatch, leadered to BOTH marks. Step 2 times it "between the marks", and that it
         # does not run from rest is the one thing on this card the prose cannot show.
         circ(221, 42, 12), rect(218.5, 25, 5, 5), ln(221, 42, 228, 34),
         lbl(241, 47, 't', 'start'),
         dash(212, 50, 140, 78), dash(230, 50, 302, 78),
         cap(170, 150, 'a ROLLING start: flat out BEFORE it crosses the first line'),
         cap(170, 164, 'and the SAME d on all four'),
         # FOUR PIECES OF GROUND: pile, bare, joints, blades. `hard floor` is deliberately the bare
         # line -- it is the smooth one, and a bare line states that without narrowing the named
         # object into floorboards, which is a guess the row does not make. Same for `pavement`:
         # two joints, not a brick bond.
         ground(24, 83, ''.join(path('M %g 200 q 3.2 -6.5 6.4 0' % (25 + 6.4 * k))
                                for k in range(9))),
         ground(101, 161, ''),
         ground(179, 239, ln(199, 200, 199, 207) + ln(219, 200, 219, 207)),
         ground(257, 317, ''.join(path('M %g 200 Q %g 194 %g %g'
                                       % (259 + 7.4 * k, 260.5 + 7.4 * k, 263 + 7.4 * k,
                                          186 + 3 * (k % 3)))
                                  for k in range(8))),
         cap(53, 220, 'carpet'), cap(131, 220, 'hard floor'),
         cap(209, 220, 'pavement'), cap(287, 220, 'short grass'),
         # THE ONE CAPTION THAT IS ABOUT THE PICTURE RATHER THAN ABOUT THE METHOD. Four surfaces in
         # a row invite being read as a run order, and `notes` says that reading is the confound:
         # "running carpet, then floor, then grass gives grass the flattest battery and the answer
         # everybody expected". Steps 1 and 3 are not repeated here -- the ordered list sits two
         # inches below this figure and carries both.
         cap(170, 242, 'the four are in no order: rotate which you run first,'),
         cap(170, 256, 'or a flattening battery makes the last one look slow')]
    return svg(264, 'A remote-control car on the ground short of a masking-tape start line with an '
                    'arrow showing it already moving, a second tape line further along, and a '
                    'graduated tape measure spanning the distance between the two; a stopwatch '
                    'above with dashed leaders to each line; and below them four short pieces of '
                    'ground drawn side by side and labelled, one with carpet pile, one bare, one '
                    'with paving joints and one with blades of grass', *p)

def hm23():
    # THE KIT IS DRAWN AND THE BUILD IS NOT. Step 2 gives fifteen minutes to design, so what anybody
    # makes from the ration is the variable each team chooses -- a straw cage or a parachute drawn
    # here is one team's answer printed on everybody's card, and it is also the practical's own
    # question, since `outcome` wants a reason involving stopping time. The egg is bare and `h` is
    # generic: WHICH height it survived is the recorded result, not the set-up.
    # ALL FIVE MATERIALS, because equipment reads "Paper, straws, tape, string, plastic bags" and
    # step 1's numbers are an example -- "say ten straws...". Drawing three of the five as though
    # they were the ration deletes the plastic bag and the string, which is what a parachute is made
    # of, and `science` names a parachute as one of the two mechanisms that work.
    # THE LADDER IS STATED EQUIPMENT and is what makes this a set-up rather than an egg floating on
    # a line: "a step ladder or an upstairs window, WITH AN ADULT", which is the row's one safety
    # clause on a practical whose age_min is 7.
    egg = path('M 136 48 A 10 10 0 0 0 156 48 Q 155 35 146 32 Q 137 35 136 48')
    ladder = [ln(44, 176, 62, 58), ln(96, 176, 78, 58), ln(58, 58, 82, 58),
              ln(47.7, 152, 92.3, 152), ln(51.9, 124, 88.1, 124), ln(56.2, 96, 83.8, 96)]
    p = ladder + [
        # the drop: held level with the top of the ladder, measured, over a tray on the floor
        dash(82, 58, 134, 58), egg,
        ln(157, 40, 166, 40),
        cap(170, 43, 'the egg, bare — what you', 'start'),
        cap(170, 57, 'build round it is yours', 'start'),
        cap(170, 79, 'from a step ladder or a', 'start'),
        cap(170, 93, 'window, with an adult', 'start'),
        dash(146, 62, 146, 152),
        arrow(26, 58, 26, 176), lbl(15, 121, 'h'),
        cap(170, 119, 'start low, then go higher', 'start'),
        # THE FLOOR IS BROKEN UNDER THE TRAY rather than drawn through it, which is `hwire`'s own
        # rule in this file: a tray whose base sits on a continuous line has no base you can see.
        ln(14, 176, 124, 176), ln(168, 176, 326, 176),
        poly([(120, 156), (126, 176), (166, 176), (172, 156)]),
        cap(186, 170, 'a tray or bin bag under it', 'start'),
        # the kit on the table, with step 1's example quantities on the three it gives them for
        cap(170, 200, 'set a materials limit before anybody builds'),
        ln(14, 248, 326, 248),
        ''.join(ln(22.2 + 4.4 * i, 214, 22.2 + 4.4 * i, 248) for i in range(10)),
        poly([(86, 248), (86, 208), (112, 208), (122, 218), (122, 248), (86, 248)]),
        poly([(112, 208), (112, 218), (122, 218)]),
        circ(164, 232, 16), circ(164, 232, 6),
        ln(180, 229, 196, 229), ln(180, 235, 196, 235), ln(196, 229, 196, 235),
        path('M 212 248 Q 218 230 226 242 Q 233 252 241 238 Q 249 226 256 248'),
        rect(281, 218, 31, 30),
        path('M 286 218 Q 289 206 294 218'), path('M 300 218 Q 305 206 308 218'),
        cap(42, 262, 'ten straws'), cap(104, 262, 'one sheet'),
        cap(172, 262, '50 cm of tape'), cap(234, 262, 'string'),
        cap(296, 262, 'plastic bags')]
    return svg(272, 'A bare egg held level with the top of a step ladder, above a tray standing on '
                    'the floor, with the drop height h measured down the side and a dashed line '
                    'marking the fall; and under it the build kit laid out on a table — ten straws, '
                    'a sheet of paper, a roll of tape, a length of string and a plastic bag', *p)

def hm24():
    # 12 directions, 30 degrees apart, written out because nothing here imports. A gear is a hub,
    # a rim and radial teeth -- and those teeth are the one thing in this picture that must NOT be
    # counted as a real number, which is what the closing caption says outright.
    U = [(1, 0), (.866, .5), (.5, .866), (0, 1), (-.5, .866), (-.866, .5),
         (-1, 0), (-.866, -.5), (-.5, -.866), (0, -1), (.5, -.866), (.866, -.5)]

    def gear(cx, cy, tooth, r=25, tip=6):
        out = [circ(cx, cy, r), circ(cx, cy, 7)]
        for ux, uy in U:
            out.append(ln(cx + ux * r, cy + uy * r, cx + ux * (r + tip), cy + uy * (r + tip)))
        out.append(dot(cx + U[tooth][0] * (r + tip), cy + U[tooth][1] * (r + tip), 3.4))
        return ''.join(out)

    p = [# THE TWO ENDS, EACH CAPTIONED DIRECTLY ABOVE THE THING IT NAMES, in step 2's own words.
         # An earlier layout put all three top captions on one row at one y, and the middle one was
         # centred on 155 -- which is the centre of the dashed box under it, so scanning the row
         # read three labels for three objects and called the unknown gear train "ONE tooth
         # marked", over a box already carrying its own two-line label inside it.
         cap(54, 20, 'the gear the handle'), cap(54, 34, 'or motor turns'),
         cap(272, 20, 'the gear the wheels'), cap(272, 34, 'are on'),
         # THE STICKER, ON A LINE OF ITS OWN AND JOINED TO BOTH MARKED TEETH. The leaders reach the
         # dots rather than stopping in clear space several pixels short of everything, so the note
         # is plainly about them. Teeth 11 and 7 put the two dots on the inward-facing tips, which
         # is what makes the leaders short -- and they are still at different clock positions, so
         # nothing implies the two gears start aligned.
         cap(155, 52, 'a sticker on ONE tooth of each'),
         ln(90, 57, 80.8, 76.5), ln(220, 57, 229.2, 76.5),
         # THE INPUT: ten turns, with a head on the arc, because which way you crank it is a CHOICE
         # rather than anything the practical asks anybody to work out -- and it is what makes the
         # missing head on the output legible as a question instead of as an oversight.
         gear(54, 92, 11),
         arc(54, 92, 40, 45, 135), head(-.707, -.707, 25.7, 120.3, 5.5),
         lbl(54, 150, '× 10'),
         # WHATEVER THE INSTRUCTIONS PUT BETWEEN THE TWO ENDS. The row never says how many gears,
         # and it is that unknown that keeps the output's direction genuinely open: with an unknown
         # count in between, a known input direction settles nothing.
         dash(85, 92, 96, 92), head(1, 0, 98, 92, 6),
         dash(98, 62, 212, 62), dash(212, 62, 212, 122),
         dash(212, 122, 98, 122), dash(98, 122, 98, 62),
         cap(155, 86, 'however many gears'), cap(155, 100, 'are in between'),
         dash(212, 92, 223, 92), head(1, 0, 225, 92, 6),
         # THE OUTPUT: the same arc with NO head and NO count, on the same axle as a wheel. The
         # direction and the ratio are the whole of what steps 4 to 6 ask for, so neither is here.
         gear(256, 92, 7),
         arc(256, 92, 40, 45, 135), lbl(256, 150, '× ?'),
         ln(287, 92, 300, 92), circ(314, 92, 14), circ(314, 92, 5),
         cap(170, 174, 'ten turns of the input, then count the turns the output makes'),
         cap(170, 196, 'the output arc has no arrowhead and no number: which way'),
         cap(170, 210, 'it turns and how often are what you are finding out'),
         cap(170, 232, "the train, each gear's direction and the ratio go on YOUR paper"),
         # BOTH GEARS ARE THE SAME SIZE AND BOTH CARRY TWELVE TEETH, and this line is what makes
         # that safe: step 7 has the student count real teeth, so a countable drawn number is a
         # ratio nobody measured, and two different drawn sizes would hint at which way it goes.
         cap(170, 246, 'the teeth here are a drawing — count the ones on your own gears')]
    return svg(260, 'The two ends of a gear train: the gear a handle or motor turns, a dashed box '
                    'standing for however many gears the instructions put in between, and the gear '
                    'on the same axle as a wheel, with one tooth of each marked',
               *p)

def hm26():
    p = [# the bottle, after step 1 and no further: water to a quarter and nothing above it
         path('M 80 30 Q 90 24 100 30'),
         ln(80, 30, 80, 58), ln(100, 30, 100, 58),
         ln(80, 58, 60, 76), ln(100, 58, 120, 76),
         ln(60, 76, 60, 212), ln(120, 76, 120, 212),
         ln(60, 170, 120, 170), cap(90, 194, 'water'), cap(90, 130, 'empty'),
         arrow(48, 212, 48, 170), lbl(36, 192, '¼'),
         # the tray it stands in, whose rim is the bottle's own base line
         ln(34, 212, 34, 226), ln(146, 212, 146, 226), ln(34, 226, 146, 226),
         ln(34, 212, 146, 212, 'axis'), cap(90, 244, 'the tray'),
         # the oil, still in its own bottle
         rect(190, 26, 12, 8),
         ln(190, 34, 190, 46), ln(202, 34, 202, 46),
         ln(190, 46, 176, 58), ln(202, 46, 216, 58),
         ln(176, 58, 176, 112), ln(216, 58, 216, 112), ln(176, 112, 216, 112),
         ln(176, 74, 216, 74),
         cap(196, 124, 'vegetable oil'), cap(196, 137, 'in NEXT, slowly'),
         # the food colouring
         rect(287, 30, 6, 10), rect(283, 40, 14, 6),
         ln(278, 46, 278, 112), ln(302, 46, 302, 112), ln(278, 112, 302, 112),
         ln(278, 66, 302, 66),
         cap(290, 124, 'food colouring'), cap(290, 137, '10 drops'),
         # a tablet with its quarters scored on it. IT IS NAMED, and that is not decoration: it is
         # a circle sitting beside a same-sized dial, and the one object with no label was the one
         # a reader could not identify. Every other thing here says what it is.
         circ(196, 176, 17), dash(196, 159, 196, 193), dash(179, 176, 213, 176),
         cap(196, 214, 'a tablet'), cap(196, 227, 'a QUARTER first'),
         # the stopwatch
         rect(286, 153, 8, 6), circ(290, 176, 19),
         ln(290, 176, 290, 163), ln(290, 176, 299, 182),
         cap(290, 214, 'stopwatch'), cap(290, 227, 'time each run'),
         cap(170, 270, 'the bottle after STEP 1 — water only, and only a quarter'),
         cap(170, 284, 'which of the two ends up on top, and WHY, is step 2 — so'),
         cap(170, 298, 'this figure stops before the oil goes in'),
         cap(170, 320, 'a quarter of a tablet first, then a half, then a whole one')]
    return svg(332, 'A tall clear bottle standing in a shallow tray, filled to a quarter of its '
                    'height with water and empty above that, with a bottle of vegetable oil, a '
                    'dropper bottle of food colouring, an effervescent tablet scored into quarters '
                    'and a stopwatch standing beside it', *p)

def hm27():
    def egg(cx, cy):
        return path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g '
                    'C %g %g %g %g %g %g C %g %g %g %g %g %g'
                    % (cx - 22, cy,
                       cx - 21, cy - 11, cx - 10, cy - 14, cx + 2, cy - 14,
                       cx + 15, cy - 14, cx + 22, cy - 6, cx + 22, cy,
                       cx + 22, cy + 6, cx + 15, cy + 14, cx + 2, cy + 14,
                       cx - 10, cy + 14, cx - 21, cy + 11, cx - 22, cy))
    p = [cap(70, 80, 'string round it — the'), cap(70, 94, 'SAME place each time'),
         dash(72, 104, 72, 138), egg(70, 124),
         rect(28, 138, 84, 16), rect(92, 142, 14, 8),
         cap(141, 120, 'then'), ln(124, 136, 158, 136), head(34, 0, 158, 136, 5.5),
         ln(204, 60, 258, 60), ln(208, 60, 208, 70), ln(254, 60, 254, 70),
         poly([(208, 70), (196, 84), (196, 162), (266, 162), (266, 84), (254, 70)]),
         ln(196, 106, 266, 106), egg(231, 148),
         ln(266, 106, 274, 111), cap(278, 115, 'vinegar', 'start'),
         ln(198, 41, 262, 55.9), ln(198, 46, 262, 60.9),
         ln(198, 41, 198, 46), ln(262, 55.9, 262, 68),
         ln(262, 66, 274, 75),
         cap(278, 79, 'lid on,', 'start'), cap(278, 93, 'LOOSE', 'start'),
         ln(216, 55, 164, 46), head(-52, -9, 164, 46, 5.5),
         cap(158, 40, 'the gas has to get out', 'end'),
         cap(70, 182, 'weigh it and note it'),
         cap(231, 182, 'shell still ON — this is the start'),
         cap(231, 196, '× 2 — the second jar is the same'),
         cap(170, 222, 'the vinegar has to COVER it — a shell half out of the'),
         cap(170, 236, 'liquid dissolves half, and the mass says nothing'),
         cap(170, 258, 'the lid goes on LOOSE, because this fizzes for two days')]
    return svg(272, 'An egg lying on a digital kitchen scale with a dashed line marking where the '
                    'string goes round it, and beside it a jar holding a whole egg covered by '
                    'vinegar, with the lid tipped up off one side of the rim so there is a gap for '
                    'the gas to escape', *p)

def hm28():
    BENCH = 112
    pack = ('M 53 78 L 173 78 Q 190 78 190 95 Q 190 112 173 112 '
            'L 53 112 Q 36 112 36 95 Q 36 78 53 78 Z')
    inpan = ('M 131 188 L 187 188 Q 196 188 196 195 Q 196 202 187 202 '
             'L 131 202 Q 122 202 122 195 Q 122 188 131 188 Z')
    p = [cap(170, 18, '1 · before the click — still LIQUID'),
         # the pack lying flat, with the disc in it and nothing spreading from it
         ln(22, BENCH, 318, BENCH), path(pack),
         circ(64, 95, 8), circ(64, 95, 3.5),
         cap(36, 52, 'the metal disc —', 'start'),
         cap(36, 66, 'click it, step 2', 'start'),
         ln(58, 70, 62, 86),
         # the thermometer, standing, tip pressed on the pack. The display is BLANK:
         # a number on it would be a reading, and the readings ARE the experiment.
         rect(133, 26, 26, 20), rect(137, 30, 18, 11),
         rect(143, 46, 6, 28), poly([(143, 74), (146, 78.5), (149, 74)]),
         cap(200, 32, 'digital thermometer', 'start'), ln(163, 32, 196, 32),
         cap(200, 46, 'or an infrared one', 'start'),
         cap(200, 60, 'tip pressed ON the pack', 'start'), ln(196, 57, 154, 72),
         # the reset, which is step 6 and is the tutor's job before the session.
         # WIDE AND SHALLOW, WITH THE HANDLE ON THE RIM. The first version was a beaker's
         # proportions (116 by 52) with the water 18px under an open top and a bar floating
         # above the wall, and the screenshot read as a box with shelves. Rim lips and steam
         # were both drawn and both made it worse -- a closed top line reads as a lid, which
         # is why beaker() leaves the top open, and two Q-curves read as parentheses.
         cap(170, 138, '2 · the reset — ten minutes, before the session'),
         beaker(92, 158, 134, 50, 182), rect(226, 155, 34, 6),
         path(inpan), ln(200, 195, 244, 195), cap(248, 198, 'the pack', 'start'),
         cap(84, 186, 'water', 'end'), ln(87, 182, 95, 182),
         rect(78, 208, 162, 9), cap(70, 228, 'hob', 'end'), ln(73, 224, 84, 214),
         cap(170, 250, 'boil until completely CLEAR, then cool UNDISTURBED'),
         # THE ONLY THING THE PICTURE CANNOT SAY FOR ITSELF. The blank display is deliberate
         # and without this line it reads as a drawing that forgot a number. The sampling
         # intervals are NOT here: step 3 states them and prints directly under this figure,
         # and maths_link calls choosing them "a real decision rather than a rule".
         cap(170, 276, 'the display is blank and no crystals are drawn —'),
         cap(170, 290, 'the peak and the curve are what you are here to find')]
    return svg(302, 'A sodium acetate click hand warmer lying flat on the bench before it has been '
                    'clicked, with the metal disc inside it and a digital thermometer standing with '
                    'its tip pressed on the pack and its display blank, and below it the pan of '
                    'water on a hob that the pack is boiled in to reset it', *p)

def hm30():
    # NOT ONE CRYSTAL IS DRAWN, and that is the whole of the restraint. `science` says fast cooling
    # gives a great many tiny crystals and slow cooling a few large ones, which is exactly what the
    # student is sent to find out -- so the two jars are the SAME shape, the SAME width and filled
    # to the SAME level, and the only difference between them is where each one stands. The ruler
    # and the magnifier are in the kit and are not drawn either: the only thing they could be shown
    # measuring is that answer.
    # THE DOTS ARE THE ONE THING A READER COULD MISTAKE FOR THE RESULT -- a scatter on the floor of
    # a vessel, in a crystal practical -- so the caption naming them undissolved is not decoration,
    # it is what stops the picture saying the opposite of what it means.
    # THE JARS COME OUT OF THE JUG'S OWN HELPER, so "two identical jars" is true by construction
    # rather than by two hand-drawn copies agreeing. Open-topped, because the row names no lid and
    # a band across the mouth reads as one -- and a sealed jar is a different experiment.
    def jar(cx, wy):
        return beaker(cx - 21, 74, 42, 98, wy)
    p = [# the teaspoon, tipping the next spoonful in
         path('M 44 32 Q 58 46 72 26'), ln(44, 32, 72, 26), ln(72, 26, 104, 16),
         dot(47, 48, 1.7), dot(44, 57, 1.7), dot(50, 65, 1.7),
         cap(62, 60, 'Epsom salts', 'start'),
         # the mixing jug -- step 2 pours FROM something into both jars, so there is a third
         # vessel whether or not the kit list names one
         beaker(26, 74, 80, 98, 88),
         ''.join(dot(35 + 9 * k, 167 if k % 2 == 0 else 163, 1.8) for k in range(8)),
         dot(49, 158, 1.8), dot(75, 158, 1.8),
         cap(66, 198, 'hot water'),
         arrow(116, 118, 138, 118, False),
         # the two jars, the same solution to the same level and nothing grown in either
         jar(172, 112), cap(172, 198, 'somewhere warm,'), cap(172, 212, 'undisturbed'),
         jar(266, 112),
         rect(224, 58, 82, 114), ln(299, 100, 299, 130),
         cap(266, 198, 'the fridge'),
         cap(170, 234, 'a little left in the bottom of the jug: SATURATED'),
         cap(170, 252, 'pour off the CLEAR solution, not the undissolved bit')]
    return svg(260, 'A jug of hot water with Epsom salts being tipped in a spoonful at a time and '
                    'a little left undissolved on the floor of it, and the clear solution poured '
                    'into two identical open jars filled to the same level, one of them standing '
                    'inside a fridge and the other left out', *p)

def hm31():
    FLOOR = 190
    p = [ln(16, FLOOR, 324, FLOOR, 'axis'),
         ln(36, 122, 172, 122),
         path('M 36 122 Q 104 140 172 122', 'pt', 'style="opacity:.8"'),
         ln(36, 122, 58, 182), ln(172, 122, 150, 182),
         path('M 58 182 Q 104 198 150 182'),
         ln(49.9, 160, 158.1, 160),
         path('M 49.9 160 Q 104 169 158.1 160', 'pt', 'style="opacity:.8"'),
         cap(132, 153, '100 ml'),
         path('M 65 175 Q 81 176 83 160 Q 67 159 65 175'),
         ln(83, 160, 146, 100),
         cap(154, 96, 'spoon', 'start'),
         path('M 186 184 Q 196 193 206 184 Q 196 175 186 184'),
         ln(186, 184, 164, 180),
         cap(196, 166, 'half a tsp'), ln(196, 170, 196, 177),
         rect(226, 118, 44, 72),
         path('M 226 118 Q 234 106 240 104'), path('M 270 118 Q 262 106 256 104'),
         rect(240, 90, 16, 14),
         rect(232, 136, 32, 42),
         path('M 236 143 L 259 143', 'pt', 'style="opacity:.55"'),
         path('M 236 150 L 254 150', 'pt', 'style="opacity:.55"'),
         path('M 236 157 L 260 157', 'pt', 'style="opacity:.55"'),
         path('M 236 164 L 250 164', 'pt', 'style="opacity:.55"'),
         path('M 236 171 L 257 171', 'pt', 'style="opacity:.55"'),
         cap(248, 38, 'the ingredients MUST'),
         cap(248, 52, 'list boric acid or'),
         cap(248, 66, 'sodium borate — plain'),
         cap(248, 80, 'saline does nothing'),
         ln(200, 86, 231, 143),
         cap(170, 214, 'PVA glue first, with half a teaspoon of bicarb stirred in'),
         cap(170, 228, 'then the saline half a teaspoon at a time, stirring hard'),
         cap(170, 250, 'stop the moment it comes away from the bowl — this is the'),
         cap(170, 264, 'step everybody overshoots')]
    return svg(276, 'A mixing bowl holding 100 ml of PVA glue with a spoon standing in it, a '
                    'half-teaspoon measuring spoon lying on the bench beside it, and a bottle of '
                    'contact lens saline standing on the bench with its ingredients panel drawn', *p)

def hm33():
    # 20 cm to 21 px, and the ground is zero — the eight marks are the scale the film is read off.
    MARKS = [185 - 21 * k for k in range(8)]

    p = [ln(14, 206, 326, 206),
         # the cane, in the ground rather than standing on it, marked every 20 cm
         rect(158, 34, 4, 186),
         ''.join(ln(162, y, 176, y) for y in MARKS),
         cap(80, 58, 'the cane, pushed into'), cap(80, 72, 'the ground and marked'),
         cap(80, 86, 'every 20 cm'), ln(116, 92, 156, 104),
         arrow(186, MARKS[0], 186, MARKS[1]), cap(194, 178, '20 cm', 'start'),
         # THE BOTTLE IS DRAWN TO THE CANE'S OWN SCALE — 33 px for the 31 cm a two-litre bottle is.
         # The `20 cm` on the arrow CALIBRATES this picture, so unlike every other drawing here a
         # height beside the cane is a claim rather than a schematic: at 56 px it said a 2-litre
         # bottle is 53 cm, mis-stating the one instrument the practical exists to teach. Only the
         # WIDTH is generous (13 px for 10 cm), so two 1.4 px walls still read apart — the axis the
         # cane does not measure is the one that can be stretched for legibility.
         poly([(93.5, 206), (93.5, 186), (97.5, 178), (97.5, 173)]),
         poly([(106.5, 206), (106.5, 186), (102.5, 178), (102.5, 173)]),
         cap(100, 166, '2-litre bottle'),
         # the mints, still in the roll, lying where they were put down. Uniformly about 2.5x life
         # size at their true 3:1 proportions: a roll to this scale is a 9x3 sliver, and the SHAPE
         # is what makes it a roll — drawn upright with rungs across it, it read as a ladder.
         path('M 33 199 L 53 199 A 3.5 3.5 0 0 1 53 206 L 33 206 A 3.5 3.5 0 0 1 33 199 Z'),
         ln(39.5, 199.4, 39.5, 205.6), ln(46.5, 199.4, 46.5, 205.6),
         cap(41, 182, 'rough-coated'), cap(41, 194, 'mints'),
         # filmed from one marked spot, well back
         person(300, 206, 88), ln(300, 108, 282, 114),
         rect(271, 104, 11, 20), ln(273, 108, 280, 108),
         cap(280, 52, 'the phone films'), cap(280, 66, 'from the same place'),
         ln(294, 208, 306, 214), ln(294, 214, 306, 208),
         cap(170, 244, 'without the cane, three eruptions is three eruptions and'),
         cap(170, 258, 'nobody can say which was biggest'),
         cap(170, 280, 'drop the mints in and get straight back; the bottle size'),
         cap(170, 294, 'and the number of mints stay the same for every drink')]
    return svg(306, 'A two-litre bottle standing open on the ground outdoors with a cane pushed '
                    'into the ground beside it and marked every 20 centimetres as a scale, a roll '
                    'of rough-coated mints waiting beside it, and a phone held by somebody '
                    'standing well back on a marked spot on the ground', *p)

def hm34():
    p = [# THE HAIRDRYER, held nozzle-down: body, handle at the top, nozzle below.
         rect(158, 22, 32, 36), rect(190, 26, 28, 13),
         poly([(158, 58), (152, 70), (196, 70), (190, 58)]),
         # STEP 3'S OWN WORDS, SPLIT OVER TWO LINES. It can only be drawn over one strip, and
         # "over each strip" is the half a single drawn position cannot say -- without it the
         # picture reads as "write on the lemon one, heat the vinegar one" to a six-year-old.
         cap(226, 44, 'hairdryer, on hot', 'start'),
         cap(226, 58, 'over each strip', 'start')]
    for x in (164, 174, 184):
        p.append(arrow(x, 76, x, 88, both=False))
    # the cotton bud, writing on the first strip -- the strip step 1 names
    p += [ln(53, 119, 88, 76), circ(50, 122, 4.5), cap(94, 70, 'cotton bud', 'start')]
    names = (('lemon',), ('milk',), ('vinegar',), ('sugar water',), ('water', 'the control'))
    for k, nm in enumerate(names):
        cx = 50 + 62 * k
        # EVERY STRIP BLANK AND IDENTICAL. The outcome is a table of which liquids work, so a
        # browned word on the lemon one would print the answer, and drawing the water strip
        # differently would give the control's result away before it has been run.
        p.append(rect(cx - 21, 92, 42, 66))
        for j, s in enumerate(nm):
            p.append(cap(cx, 174 + 14 * j, s))
    # THE ONE CAPTION THE STEPS DO NOT ALREADY CARRY. It says why five rectangles are blank --
    # otherwise they read as an unfinished drawing -- and why they are labelled at all, which
    # step 2 makes necessary by producing five indistinguishable strips. What came out is the
    # drying warning: that was step 1 word for word, and the guide prints step 1 two inches
    # under this figure.
    p += [cap(170, 212, 'nothing shows on any of them yet, so'),
          cap(170, 226, 'keep track of which strip is which')]
    return svg(240, 'Five blank strips of white paper in a row, one written on with each liquid and '
                    'named beneath — lemon, milk, vinegar, sugar water and plain water as the '
                    'control — with a cotton bud writing on the first and a hairdryer held '
                    'nozzle-down over the middle one', *p)

def hm35():
    p = [# THE CUP AT STEP 1: the water measured, and nothing added to it yet — the same move ch04
         # makes with "before any alkali", so no reading and no reaction can be implied
         poly([(74, 100), (88, 214), (154, 214), (168, 100)]),
         ln(74.5, 104, 167.5, 104),
         ln(77.9, 132, 164.1, 132),
         cap(68, 158, 'water,', 'end'), cap(68, 172, '100 ml', 'end'),
         ln(70, 165, 92, 170),
         # the digital thermometer, and the display is BLANK: the number is the whole answer
         rect(119, 22, 30, 24), rect(124, 27, 20, 12),
         rect(129.5, 46, 9, 128),
         poly([(129.5, 174), (134, 182), (138.5, 174)]),
         cap(160, 30, 'digital', 'start'), cap(160, 44, 'thermometer', 'start'),
         ln(150, 34, 157, 33),
         # "probe UNDER" ran 4 units off the LEFT of the viewBox and arrived as "robe UNDER", which
         # is the fault check/cards.js fails on. `tip` says the same thing about the same object --
         # the label above already names it a thermometer -- and leaves 17 units of margin.
         cap(74, 198, 'tip UNDER', 'end'), cap(74, 212, 'the water', 'end'),
         ln(78, 204, 126, 182),
         # the two measuring spoons, waiting on the bench IN THE ORDER THEY GO IN — which is the
         # one thing "three things stirred into it" cannot say
         path('M 196 106 Q 209 123 222 106'), ln(196, 106, 222, 106), rect(222, 103.5, 34, 5),
         cap(262, 100, 'citric acid,', 'start'), cap(262, 114, '2 tbsp', 'start'),
         cap(262, 128, 'goes in first', 'start'),
         path('M 196 176 Q 209 193 222 176'), ln(196, 176, 222, 176), rect(222, 173.5, 34, 5),
         cap(262, 170, 'bicarbonate', 'start'), cap(262, 184, 'of soda,', 'start'),
         # the em dash took this one to the viewBox's own right edge with nothing to spare
         cap(262, 198, '1 tbsp, LAST', 'start'),
         cap(170, 246, 'a reading BEFORE anything goes in, and again once the citric'),
         cap(170, 260, 'acid has dissolved — then one every 15 s for two minutes'),
         cap(170, 282, 'feel the OUTSIDE of the cup — that is step 5, and the bit'),
         cap(170, 296, 'people remember. The curve and its lowest point are yours')]
    return svg(304, 'A plastic cup holding 100 ml of water with a digital thermometer standing in '
                    'it, its probe reaching under the surface and its display blank, and beside it '
                    'two measuring spoons in the order they go in — citric acid first, then '
                    'bicarbonate of soda', *p)


D = {'PR-BI01': bi01, 'PR-BI02': bi02, 'PR-BI03': bi03, 'PR-BI04': bi04, 'PR-BI05': bi05,
     'PR-BI06': bi06, 'PR-BI07': bi07, 'PR-BI08': bi08, 'PR-BI09': bi09, 'PR-BI10': bi10,
     'PR-CH01': ch01, 'PR-CH02': ch02, 'PR-CH03': ch03, 'PR-CH04': ch04, 'PR-CH05': ch05,
     'PR-CH06': ch06, 'PR-CH07': ch07, 'PR-CH08': ch08, 'PR-FN01': fn01, 'PR-FN02': fn02,
     'PR-FN03': fn03, 'PR-FN04': fn04, 'PR-FN05': fn05, 'PR-FN06': fn06, 'PR-FN07': fn07,
     'PR-FN08': fn08, 'PR-FN09': fn09, 'PR-FN10': fn10, 'PR-FN11': fn11, 'PR-FN12': fn12,
     'PR-FN13': fn13, 'PR-HM01': hm01, 'PR-HM02': hm02, 'PR-HM03': hm03, 'PR-HM06': hm06,
     'PR-HM04': hm04, 'PR-HM05': hm05, 'PR-HM07': hm07, 'PR-HM08': hm08, 'PR-HM09': hm09,
     'PR-HM10': hm10, 'PR-HM11': hm11, 'PR-HM12': hm12, 'PR-HM13': hm13, 'PR-HM14': hm14,
     'PR-HM15': hm15, 'PR-HM16': hm16, 'PR-HM17': hm17, 'PR-HM18': hm18, 'PR-HM19': hm19,
     'PR-HM20': hm20, 'PR-HM21': hm21, 'PR-HM22': hm22, 'PR-HM23': hm23, 'PR-HM24': hm24,
     'PR-HM25': hm25, 'PR-HM26': hm26, 'PR-HM27': hm27, 'PR-HM28': hm28, 'PR-HM29': hm29,
     'PR-HM30': hm30, 'PR-HM31': hm31, 'PR-HM32': hm32, 'PR-HM33': hm33, 'PR-HM34': hm34,
     'PR-HM35': hm35, 'PR-HM36': hm36, 'PR-PH01': ph01, 'PR-PH02': ph02, 'PR-PH03': ph03, 'PR-PH04': ph04,
     'PR-PH05': ph05, 'PR-PH06': ph06, 'PR-PH07': ph07, 'PR-PH08': ph08, 'PR-PH09': ph09,
     'PR-PH10': ph10}


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
out, seen, moved = [lines[0]], set(), []
for raw in lines[1:-1]:
    s = raw.strip(); trailing = ',' if s.endswith(',') else ''
    row = json.loads(s.rstrip(','))
    pid = row['practical_id']
    if pid in made:
        assert not row.get('excluded_reason'), pid + ' is refused and must not get a diagram'
        assert row.get('steps'), pid + ' has no method for the drawing to sit above'
        # A DRAWING ALREADY IN THE FILE MUST COME OUT THE SAME, and that is the whole reason this
        # loop reports rather than silently writes. `bunsen` and `person` were EXTRACTED out of the
        # distillation and clinometer drawings into pracdraw.py; the only thing that makes an
        # extraction safe is proving the old bytes back, which is the `libraryExtras_` rule.
        if row.get('diagram') and row['diagram'] != made[pid]:
            moved.append(pid)
        new = {}
        for k, v in row.items():
            if k == 'diagram':
                continue        # written below, at `variables`, so a CHANGED drawing actually lands
            new[k] = v
            if k == 'variables':
                new['diagram'] = made[pid]
        assert 'diagram' in new, pid + ': nowhere to put it'
        row = new; seen.add(pid)
    out.append(json.dumps(row, ensure_ascii=False) + trailing)
out.append(lines[-1])
assert set(made) == seen, 'never found: ' + ', '.join(sorted(set(made) - seen))
if moved and '--redraw' not in sys.argv:
    raise SystemExit('these drawings came out DIFFERENT from what is committed: '
                     + ', '.join(sorted(moved))
                     + '\nre-run with --redraw if that is what you meant')
open(PATH, 'w', encoding='utf-8').write('\n'.join(out) + '\n')

rows = [json.loads(l.strip().rstrip(',')) for l in out[1:-1]]
live = [r for r in rows if not r.get('excluded_reason')]
drawn = [r for r in live if r.get('diagram')]
print('drawings written : %d%s' % (len(seen), (', %d redrawn' % len(moved)) if moved else ''))
print('live practicals  : %d, of which %d carry one and %d do not'
      % (len(live), len(drawn), len(live) - len(drawn)))
print('without one      : %s' % ', '.join(r['practical_id'] for r in live if not r.get('diagram')))
print('tallest          : %s' % max((int(v.split('0 %d ' % W)[1].split('"')[0]), k)
                                    for k, v in made.items())[1])
print('total bytes      : %d' % sum(len(v) for v in made.values()))
