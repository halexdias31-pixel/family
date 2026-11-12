# The two triangles that hold every exact trig value (1MA1 G21): half a square (1, 1, √2) and half an
# equilateral triangle (1, √3, 2). Writes its row through tools/g_figkit.py; edit and re-run: python3 tools/g_exact.py
import g_figkit

P = 'gexact'
sq = lambda x, y, sx, sy: '<path class="%s-ln" d="M%d %dh%dv%d"/>' % (P, x + 8 * sx, y, 0, 8 * sy) + \
    '<path class="%s-ln" d="M%d %dh%d"/>' % (P, x, y + 8 * sy, 8 * sx)
t = lambda x, y, s, c='t': '<text class="%s-%s" x="%s" y="%s">%s</text>' % (P, c, x, y, s)
steps = [
    '<path class="%s-ln" d="M20 122H92L20 50Z"/>' % P + sq(20, 122, 1, -1),
    t(56, 136, '1') + t(10, 90, '1') + t(64, 80, '√2', 'tg') + t(64, 117, '45°', 'tg') + t(29, 74, '45°', 'tg'),
    '<path class="%s-ln" d="M140 122H185L140 44Z"/>' % P + sq(140, 122, 1, -1),
    t(162, 136, '1') + t(128, 87, '√3') + t(174, 80, '2', 'tg') + t(170, 116, '60°', 'tg') + t(149, 74, '30°', 'tg'),
]
g_figkit.write(P, 8, 'Two triangles, every exact value', 'Half-square triangle', '0 0 210 145', steps,
               'sin 30° = ½ &nbsp; tan 60° = √3<br>cos 45° = √2 ÷ 2')
