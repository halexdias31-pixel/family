# Drawing in the one animation format (owner, 16 Nov): `<svg class="sa">`, parts drawn in as steps s1..s8, moving parts
# on the shared mv-* motions, words as `<text class="cap">`, all styled by `.sa` in style.css (ink, `hot` coral,
# `cool` green). The drawings that were HTML before the format are drawn with this, each by its own script, which
# writes its row with `anim_row.write_sa`. Coordinates are in a 400-wide view box, as the other drawings in the format.
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from figkit import num as _f, esc, esc_label, barbs   # noqa: F401  the primitives: tools/figkit.py


class Svg:
    def __init__(self, w=400, h=200):
        self.w, self.h, self.out, self._open = w, h, [], []

    def add(self, s):
        self.out.append(s); return self

    def g(self, cls='', style='', transform=''):
        """Open a group: a step (s1..s8), a motion (mv-*), or both, nested so each animates on its own."""
        parts = cls.split()
        steps = [c for c in parts if c[:1] == 's' and c[1:].isdigit()]
        rest = [c for c in parts if c not in steps]
        n = 0
        if steps: self.add('<g class="%s">' % ' '.join(steps)); n += 1
        if rest or style or transform:
            a = (' class="%s"' % ' '.join(rest) if rest else '') + (' style="%s"' % style if style else '') + (' transform="%s"' % transform if transform else '')
            self.add('<g%s>' % a); n += 1
        self._open.append(n)
        return self

    def end(self):
        self.add('</g>' * self._open.pop()); return self

    def text(self, x, y, s, cls='', size=None, anchor=None, weight=None, raw=False):
        st = []
        if size: st.append('font-size:%spx' % _f(size))
        if anchor: st.append('text-anchor:%s' % anchor)
        if weight: st.append('font-weight:%s' % weight)
        return self.add('<text x="%s" y="%s" class="cap%s"%s>%s</text>' % (
            _f(x), _f(y), (' ' + cls) if cls else '', (' style="%s"' % ';'.join(st)) if st else '', s if raw else esc(s)))

    def rect(self, x, y, w, h, cls='pt', rx=None, style=''):
        return self.add('<rect x="%s" y="%s" width="%s" height="%s"%s class="%s"%s/>' % (
            _f(x), _f(y), _f(w), _f(h), (' rx="%s"' % _f(rx)) if rx is not None else '', cls, (' style="%s"' % style) if style else ''))

    def circle(self, x, y, r, cls='pt', style=''):
        return self.add('<circle cx="%s" cy="%s" r="%s" class="%s"%s/>' % (_f(x), _f(y), _f(r), cls, (' style="%s"' % style) if style else ''))

    def line(self, x1, y1, x2, y2, cls='pt', style=''):
        return self.add('<line x1="%s" y1="%s" x2="%s" y2="%s" class="%s"%s/>' % (_f(x1), _f(y1), _f(x2), _f(y2), cls, (' style="%s"' % style) if style else ''))

    def path(self, d, cls='pt', style=''):
        return self.add('<path d="%s" class="%s"%s/>' % (d, cls, (' style="%s"' % style) if style else ''))

    def arrow(self, x1, y1, x2, y2, cls='pt', head=5, style=''):
        import math
        (ax, ay), (bx, by) = barbs(x2, y2, math.atan2(y2 - y1, x2 - x1), head, .5)
        return self.path('M%s,%s L%s,%s M%s,%s L%s,%s L%s,%s' % tuple(_f(v) for v in (x1, y1, x2, y2, ax, ay, x2, y2, bx, by)), cls, style)

    def box(self, x, y, w, h, s, cls='', size=None, rx=4):
        """A labelled box: the outline, and its words in the middle."""
        self.rect(x, y, w, h, 'pt' + ((' ' + cls) if cls else ''), rx=rx)
        return self.text(x + w / 2, y + h / 2 + 4, s, cls, size)

    def svg(self, label):
        assert not self._open, 'a group is still open'
        return '<svg class="sa" viewBox="0 0 %s %s" role="img" aria-label="%s">%s</svg>' % (_f(self.w), _f(self.h), esc_label(label), ''.join(self.out))
