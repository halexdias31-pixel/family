# Plan and elevations of a 4 by 3 by 2 cuboid (1MA1 G13): the solid, then its three flat views at true size.
# Writes its row through tools/g_figkit.py; edit and re-run: python3 tools/g_plans.py
import g_figkit

P, U = 'gplan', 13                     # px per cm
L, D, H = 4 * U, 3 * U, 2 * U          # length, depth, height
ox, oy = 14, 96                        # the solid's front-bottom-left corner
dx, dy = 22, -16                       # depth drawn back and up
solid = ('<path class="%s-ln" d="M%d %dh%dv%dh%dZ"/>' % (P, ox, oy, L, -H, -L) +
         '<path class="%s-ln" d="M%d %dl%d %dh%dl%d %d"/>' % (P, ox, oy - H, dx, dy, L, -dx, -dy) +
         '<path class="%s-ln" d="M%d %dl%d %dv%d"/>' % (P, ox + L, oy, dx, dy, -H) +
         '<text class="%s-t" x="%d" y="%d">front</text>' % (P, ox + L / 2, oy + 13))


def view(x, y, w, h, name, a, b):
    return ('<rect class="%s-fa" x="%d" y="%d" width="%d" height="%d"/>' % (P, x, y, w, h) +
            '<text class="%s-tg" x="%s" y="%d">%s</text>' % (P, x + w / 2, y - 5, name) +
            '<text class="%s-t" x="%s" y="%d">%s</text><text class="%s-t" x="%d" y="%s">%s</text>'
            % (P, x + w / 2, y + h + 11, a, P, x + w + 10, y + h / 2 + 3, b))


steps = [solid,
         view(112, 18, L, D, 'plan', '4', '3'),
         view(112, 98, L, H, 'front', '4', '2'),
         view(190, 98, D, H, 'side', '3', '2')]
g_figkit.write(P, 7, 'Plan, front and side', 'Plan', '0 0 250 150', steps,
               'three flat views, true size<br>no perspective')
