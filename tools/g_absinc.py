# Area = ½ab sin C (1MA1 G23): two sides and the angle between them; the height up from side a is b sin C,
# so ½ × base × height becomes ½ab sin C. Writes its row through tools/g_figkit.py; re-run: python3 tools/g_absinc.py
import math
import g_figkit

P, ANG, b = 'gabsc', 50, 96
C, B = (30, 122), (176, 122)
A = (C[0] + b * math.cos(math.radians(ANG)), C[1] - b * math.sin(math.radians(ANG)))
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
r = 20
arc_end = (C[0] + r * math.cos(math.radians(ANG)), C[1] - r * math.sin(math.radians(ANG)))
steps = [
    '<path class="%s-ln" d="M%d %dL%d %dL%s %sZ"/>' % (P, C[0], C[1], B[0], B[1], f(A[0]), f(A[1])) +
    '<text class="%s-t" x="%d" y="%d">C</text><text class="%s-t" x="%d" y="%d">B</text><text class="%s-t" x="%s" y="%s">A</text>'
    % (P, C[0] - 8, C[1] + 4, P, B[0] + 8, B[1] + 4, P, f(A[0]), f(A[1] - 6)),
    '<path class="%s-hi" d="M%d %dH%d"/><path class="%s-hi" d="M%d %dL%s %s"/>' % (P, C[0], C[1], B[0], P, C[0], C[1], f(A[0]), f(A[1])) +
    '<text class="%s-tg" x="%d" y="%d">a</text><text class="%s-tg" x="%s" y="%s">b</text>'
    % (P, (C[0] + B[0]) / 2 + 20, C[1] + 13, P, f((C[0] + A[0]) / 2 - 9), f((C[1] + A[1]) / 2)),
    '<path class="%s-fa" d="M%d %dH%dA%d %d 0 0 0 %s %sZ"/>' % (P, C[0], C[1], C[0] + r, r, r, f(arc_end[0]), f(arc_end[1])),
    '<path class="%s-dash" d="M%s %sV%d"/><text class="%s-t" x="%s" y="%s">h = b sin C</text>'
    % (P, f(A[0]), f(A[1]), C[1], P, f(A[0] + 36), C[1] - 10),
]
g_figkit.write(P, 9, 'Two sides and the angle between', 'Included angle', '0 0 210 145', steps,
               'area = ½ × a × h<br>= ½ab sin C')
