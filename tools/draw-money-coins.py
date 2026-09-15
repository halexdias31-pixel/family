# -*- coding: utf-8 -*-
"""Coin pictures for the Corbettmaths Money worksheet.

Real UK coin diameters, scaled — a child recognises a 50p by being the big
seven-sided one, so the sizes carry information and are not decoration.
20p and 50p are drawn as heptagons for the same reason.
"""
import math

MM = {'1p': 20.3, '2p': 25.9, '5p': 18.0, '10p': 24.5,
      '20p': 21.4, '50p': 27.3, '£1': 23.4, '£2': 28.4}
HEPTA = {'20p', '50p'}
SCALE = 1.70          # mm -> px

def r(c): return round(MM[c] * SCALE / 2, 1)

def hepta(cx, cy, rad):
    pts = []
    for i in range(7):
        a = -math.pi / 2 + i * 2 * math.pi / 7
        pts.append('%.1f,%.1f' % (cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return ' '.join(pts)

def coin(cx, cy, c):
    rad = r(c)
    shape = ('<polygon points="%s" class="coin"/>' % hepta(cx, cy, rad)) if c in HEPTA \
            else ('<circle cx="%.1f" cy="%.1f" r="%.1f" class="coin"/>' % (cx, cy, rad))
    return shape + '<text x="%.1f" y="%.1f" class="num">%s</text>' % (cx, cy + 4, c)

W = 340   # every diagram is this many units wide — see below

def row_svg(coins, label=None, per_row=None):
    """Coins laid out in rows.

    EVERY DIAGRAM IS THE SAME WIDTH, AND THAT IS THE RULE THE FIRST TWO VERSIONS BOTH MISSED.
    `.qsheet figure svg` is `width: min(100%, 20rem)`, so the browser stretches whatever viewBox it
    is given to the same rendered width — which means the viewBox width IS the scale. Three coins in
    a narrow box came out enormous and two long price tags in a wide one came out unreadable, on the
    same screen, from the same stylesheet. Fixing it per picture is fixing the instance; fixing it is
    one constant, `W`, that every drawing here lays out inside and wraps to.

    THE SCALE IS SET BY THE TEXT, NOT BY THE COIN. The first version scaled the real diameters by
    0.60, which put a 5p at 5px across inside a viewBox the browser then stretched to 20rem — so the
    `13px` label was three times the width of the coin it sat in and every row read as one smeared
    blob. Nothing in the suite could see it: the SVG was valid, nothing overflowed a box, and
    `check/ui.js` has no question with a picture in it. A screenshot caught it, which is the second
    time this repository has written that sentence down.
    """
    gap = 10
    rows, cur, used = [], [], 0.0
    for c in coins:
        need = 2 * r(c) + (gap if cur else 0)
        if cur and used + need > W - 16:
            rows.append(cur); cur, used = [], 0.0
            need = 2 * r(c)
        cur.append(c); used += need
    if cur: rows.append(cur)
    widths = [sum(2 * r(c) + gap for c in rw) - gap for rw in rows]
    rowh = max(2 * r(c) for c in coins) + gap
    h = len(rows) * rowh + 12 + (16 if label else 0)
    out = []
    y = rowh / 2 + 6
    for rw, wid in zip(rows, widths):
        x = (W - wid) / 2
        for c in rw:
            out.append(coin(x + r(c), y, c))
            x += 2 * r(c) + gap
        y += rowh
    if label:
        out.append('<text x="%.1f" y="%.1f" class="cap">%s</text>' % (W / 2, h - 4, label))
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, round(h), label or 'coins', ''.join(out)))

def tags(items):
    """Price tags in a row — a shop display.

    THE BOX IS FITTED TO THE WORDS. A fixed 92px tag clipped "Miles buys singles" at both ends, and
    a tag narrower than its own label is the one thing a price tag must never be. 7.2px per
    character is a serif average measured against the rendering, not guessed — the box is generous
    rather than tight, because a label touching its border reads as an error.
    """
    gap, th, pad = 14, 62, 22
    widths = [max(len(n), len(p)) * 7.2 + pad * 2 for n, p in items]
    fits = sum(widths) + gap * (len(items) - 1) <= W - 12
    out = []
    if fits:
        h = th + 12
        x = (W - (sum(widths) + gap * (len(items) - 1))) / 2
        for (name, price), tw in zip(items, widths):
            out.append(tag_(x, 6, tw, th, name, price)); x += tw + gap
    else:
        # STACKED WHEN THEY DO NOT FIT, rather than squeezed. Two tags forced side by side inside one
        # width is two tags at half the type size of every other diagram on the screen.
        h = len(items) * (th + gap) + 12 - gap
        y = 6
        for (name, price), tw in zip(items, widths):
            out.append(tag_((W - tw) / 2, y, tw, th, name, price)); y += th + gap
    return ('<svg viewBox="0 0 %d %.0f" role="img" aria-label="price list">%s</svg>' % (W, h, ''.join(out)))

def tag_(x, y, tw, th, name, price):
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%d" rx="7" class="tag"/>'
            '<text x="%.1f" y="%.1f" class="cap">%s</text>'
            '<text x="%.1f" y="%.1f" class="num">%s</text>'
            % (x, y, tw, th, x + tw / 2, y + 26, name, x + tw / 2, y + 48, price))

DIAGRAMS = {
 'Q-CBM-money-1':  (row_svg(['£1', '50p', '20p', '20p', '10p', '5p', '2p'], "Natalie's coins"),
                    '£2.07'),
 'Q-CBM-money-4':  (row_svg(['£2', '£1', '50p', '20p', '5p'], "Edward's change"),
                    '£1.25  (the change is £3.75, and £5.00 − £3.75 = £1.25)'),
 'Q-CBM-money-5':  (row_svg(['£1', '50p', '20p', '20p', '10p'], 'the coins to share'),
                    'The five coins total £2.00, so each must take £1.00. '
                    'Daniel could choose the £1 coin; Ben would be left with 50p + 20p + 20p + 10p. '
                    '(Either boy may take either half.)'),
 'Q-CBM-money-9':  (row_svg(['£1', '20p', '20p'], "Jaymin's change"),
                    '£1.20  (the change is £1.40, so three ice creams cost £3.60)'),
 'Q-CBM-money-11': (tags([('tie', '£8.50'), ('one pair of socks', '£3.25')]),
                    '£5.00  (£8.50 + 2 × £3.25 = £15.00, and £20.00 − £15.00 = £5.00)'),
 'Q-CBM-money-19': (tags([('Miles buys single cans', '65p each'),
                          ('Megan buys packs of 6', '£3.20 a pack')]),
                    '£2.80  (Miles pays 24 × 65p = £15.60; Megan pays 4 × £3.20 = £12.80)'),
}

if __name__ == '__main__':
    import json, sys
    P = '/home/user/family/data/questions.json'
    lines = open(P).read().split('\n')
    rows = [json.loads(l.rstrip(',')) for l in lines[1:] if l.strip() not in (']', '')]
    n = 0
    for r_ in rows:
        d = DIAGRAMS.get(r_.get('row_id'))
        if not d: continue
        assert not r_.get('diagram'), r_['row_id']
        r_['diagram'], r_['answer'] = d[0], d[1]
        r_['diagram_by'] = 'family'
        r_['answer_type'] = r_.get('answer_type') or 'calculation'
        n += 1
    assert n == len(DIAGRAMS), (n, len(DIAGRAMS))
    out = ['['] + [json.dumps(x, ensure_ascii=False) + ',' for x in rows]
    out[-1] = out[-1][:-1]; out.append(']')
    open(P, 'w').write('\n'.join(out) + '\n')
    print('drew', n, 'diagrams')
