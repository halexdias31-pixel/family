# The perpendicular bisector by ruler and compasses (1MA1 G2): AB, equal arcs from A and from B, the line through
# where they cross. Writes its row through tools/g_figkit.py; edit and re-run: python3 tools/g_construct.py
import math
import g_figkit

A, B, R = (50, 92), (150, 92), 64
H = math.sqrt(R * R - ((B[0] - A[0]) / 2) ** 2)
M = ((A[0] + B[0]) / 2, A[1])
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')


def arc(c, a0, a1):
    p = (c[0] + R * math.cos(math.radians(a0)), c[1] - R * math.sin(math.radians(a0)))
    q = (c[0] + R * math.cos(math.radians(a1)), c[1] - R * math.sin(math.radians(a1)))
    return 'M%s %sA%d %d 0 0 0 %s %s' % (f(p[0]), f(p[1]), R, R, f(q[0]), f(q[1]))


t = math.degrees(math.atan2(H, M[0] - A[0]))
P = 'gcons'
steps = [
    '<path class="%s-ln" d="M%d %dH%d"/><circle class="%s-dot" cx="%d" cy="%d" r="2.4"/><circle class="%s-dot" cx="%d" cy="%d" r="2.4"/>'
    '<text class="%s-t" x="%d" y="%d">A</text><text class="%s-t" x="%d" y="%d">B</text>'
    % (P, A[0], A[1], B[0], P, A[0], A[1], P, B[0], B[1], P, A[0] - 9, A[1] + 4, P, B[0] + 9, B[1] + 4),
    '<path class="%s-dash" d="%s"/><path class="%s-dash" d="%s"/>' % (P, arc(A, t - 14, t + 14), P, arc(A, -t - 14, -t + 14)),
    '<path class="%s-dash" d="%s"/><path class="%s-dash" d="%s"/>' % (P, arc(B, 180 - t - 14, 180 - t + 14), P, arc(B, 180 + t - 14, 180 + t + 14)),
    '<path class="%s-hi" d="M%s %sV%s"/><path class="%s-ln" d="M%s %sh7v-7h-7"/><text class="%s-tg" x="%s" y="%s">M</text>'
    % (P, f(M[0]), f(M[1] - H - 8), f(M[1] + H + 8), P, f(M[0]), f(M[1]), P, f(M[0] - 12), f(M[1] + 14)),
]
g_figkit.write(P, 4, 'Perpendicular bisector', 'Perpendicular bisector', '0 0 200 150', steps,
               'equal arcs from A and B<br>join the crossings: AM = MB, at 90°')
