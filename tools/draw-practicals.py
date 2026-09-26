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
         cap(240, 64, 'the loop, at the'), cap(240, 78, 'EDGE of the flame'),
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
         cap(256, 76, 'coverslip', 'start'),
         # the needle, holding the far edge up
         ln(233, 86, 274, 62), rect(272, 52, 26, 8),
         cap(296, 102, 'mounted', 'end'), cap(296, 116, 'needle', 'end'),
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
         txt(234, 124, '0', 'num'),
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
         arc(sx, gy - h, 26, 90 - ang, 90), lbl(sx + 18, gy - h + 34, '\u03b8'),
         arrow(sx, gy + 14, tipx, gy + 14), cap((sx + tipx) / 2, gy + 34, 'the shadow'),
         cap(170, gy + 58, '\u03b8 = inverse tan (shadow \u00f7 h): the angle the sun is off'),
         cap(170, gy + 72, 'vertical AT YOUR PLACE, on the day you measured it'),
         # the two places, on one side of the Earth so the rays have room
         circ(136, 274, 54),
         ln(136, 220, 136, 196), ln(180, 243, 200, 228),
         dot(136, 220), dot(180, 243),
         ''.join(ln(148 + 26 * k, 176, 158 + 26 * k, 192) for k in range(5)),
         ln(136, 274, 136, 220), ln(136, 274, 180, 243),
         arc(136, 274, 28, -90, -46), lbl(160, 236, '\u0394'),
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
            out.append(txt(cx, 116, '—', 'lbl'))
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
          cap(214, 126, 'wool, tied to ONE coil', 'start'),
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
         cap(270, 56, 'the straw points'), cap(270, 70, 'BACKWARDS'),
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
         cap(292, 100, 'pull back'), cap(292, 114, 'to a MARKED'),
         cap(292, 128, 'point'),
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


D = {'PR-PH01': ph01, 'PR-PH02': ph02, 'PR-PH03': ph03, 'PR-PH04': ph04, 'PR-PH05': ph05,
     'PR-PH06': ph06, 'PR-PH07': ph07, 'PR-PH08': ph08, 'PR-PH09': ph09, 'PR-PH10': ph10,
     'PR-CH01': ch01, 'PR-CH02': ch02, 'PR-CH03': ch03, 'PR-CH05': ch05, 'PR-CH06': ch06,
     'PR-CH07': ch07, 'PR-CH08': ch08,
     'PR-BI01': bi01, 'PR-BI02': bi02, 'PR-BI03': bi03, 'PR-BI05': bi05, 'PR-BI06': bi06,
     'PR-BI07': bi07, 'PR-BI08': bi08, 'PR-BI09': bi09,
     'PR-FN01': fn01, 'PR-FN02': fn02, 'PR-FN03': fn03, 'PR-FN05': fn05, 'PR-FN06': fn06,
     'PR-FN07': fn07, 'PR-FN10': fn10, 'PR-FN12': fn12,
     'PR-HM03': hm03, 'PR-HM06': hm06, 'PR-HM07': hm07, 'PR-HM08': hm08, 'PR-HM11': hm11,
     'PR-HM12': hm12, 'PR-HM14': hm14, 'PR-HM15': hm15, 'PR-HM16': hm16, 'PR-HM17': hm17,
     'PR-HM18': hm18, 'PR-HM19': hm19, 'PR-HM20': hm20, 'PR-HM21': hm21, 'PR-HM25': hm25,
     'PR-HM29': hm29, 'PR-HM32': hm32, 'PR-HM36': hm36}


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
