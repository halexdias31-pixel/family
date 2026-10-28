# Church history, 30–2026, as a time line (GCSE Religious Studies chapter 4, The Church in the world), the drawing the
# Church History timeline's Animation tile opens (516). Writes its whole row of data/textbooks.json through tools/anim_row.py.
# THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row. Run: python3 tools/h_church.py
#
# WHAT IT DRAWS, in one loop: a year axis AD 0–2030 to scale and a gold marker that steps along it, one event at a time —
# the date, what happened in two lines, and a tag (Council, East, West, Mission). The dates are the standard ones
# (Britannica; Ware, The Orthodox Church); the events are those of data/timeline.json's Church History era.
import sys, pathlib, datetime; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num, kf, fade

P = 'hch'
W, VH = 240, 146
X0, X1, Y0, YAX = 12, 228, 0, 38             # the axis runs from AD 0 to 2030, to scale
SPAN = 2030
STEP, LEAD = 1.7, 0.6
TH = {'eu': 'Council', 'pa': 'East', 'af': 'West', 'hf': 'Mission'}

# (from, to or None, the date as said, line 1, line 2, theatre)
EV = [
    ((33, 5, 24), None, 'c. AD 30–33', 'Pentecost: the', 'Church begins', 'hf'),
    ((325, 5, 20), None, 'AD 325', 'Nicaea: the first', 'ecumenical council', 'eu'),
    ((381, 5, 1), None, 'AD 381', 'Constantinople I', 'completes the Creed', 'eu'),
    ((451, 10, 8), None, 'AD 451', 'Chalcedon: one Christ', 'in two natures', 'eu'),
    ((787, 9, 24), None, 'AD 787', 'Nicaea II: the', 'icons restored', 'eu'),
    ((843, 3, 11), None, 'AD 843', 'Triumph of', 'Orthodoxy', 'pa'),
    ((988, 1, 1), None, 'AD 988', 'Baptism of Rus\u2019', 'under Vladimir', 'hf'),
    ((1054, 7, 16), None, '1054', 'The Great Schism:', 'Rome and Constantinople', 'af'),
    ((1204, 4, 12), None, '1204', 'Crusaders sack', 'Constantinople', 'af'),
    ((1439, 7, 6), None, '1439', 'Union of Florence,', 'rejected in the East', 'af'),
    ((1453, 5, 29), None, '1453', 'Constantinople falls', 'to the Ottomans', 'pa'),
    ((1517, 10, 31), None, '1517', 'Luther: the', 'Reformation begins', 'af'),
    ((1589, 1, 26), None, '1589', 'Moscow becomes', 'a patriarchate', 'pa'),
    ((1917, 11, 7), None, '1917', 'Revolution: the', 'persecution begins', 'pa'),
    ((1965, 12, 7), None, '1965', 'The anathemas of', '1054 lifted', 'af'),
    ((2019, 1, 6), None, '2019', 'Tomos for the', 'Church of Ukraine', 'pa'),
]
T = LEAD + STEP * len(EV) + 3.0
END = T - 0.6


def x_of(d):
    y, m, dd = d
    return X0 + (X1 - X0) * (y - Y0 + (m - 1) / 12.0) / SPAN


def at(i): return LEAD + STEP * i


h = ['<div class="an-hchurch" aria-hidden="true">', '  <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, VH)]
for yr in range(0, 2001, 500):
    x = x_of((yr, 1, 1))
    h.append('    <path class="%s-tk" d="M%s %sV%s"/>' % (P, num(x), YAX - 3, YAX + 3))
    h.append('    <text class="%s-yr" x="%s" y="%d">%d</text>' % (P, num(x), YAX - 20, yr))
h.append('    <path class="%s-ax" d="M%d %dH%d"/>' % (P, X0, YAX, X1))
for i, (a, b, *_rest) in enumerate(EV):
    th = EV[i][5]
    if b:
        xa, xb = x_of(a), x_of(b)
        h.append('    <rect class="%s-bar %s-%s %s-e%d" x="%s" y="%d" width="%s" height="3" rx="1"/>'
                 % (P, P, th, P, i, num(xa), YAX + 4 + (i % 2) * 4, num(max(xb - xa, 1.5))))
    h.append('    <circle class="%s-dot %s-%s %s-e%d" cx="%s" cy="%d" r="2"/>' % (P, P, th, P, i, num(x_of(a)), YAX))
h.append('    <g class="%s-mk"><path d="M0 %dl-4 -6h8z"/></g>' % (P, YAX - 2))
for i, (a, b, said, l1, l2, th) in enumerate(EV):
    h.append('    <g class="%s-cd %s-c%d">' % (P, P, i))
    h.append('      <text class="%s-dt" x="%d" y="74">%s</text>' % (P, W // 2, said))
    h.append('      <text class="%s-nm" x="%d" y="95">%s</text>' % (P, W // 2, l1))
    h.append('      <text class="%s-nm" x="%d" y="112">%s</text>' % (P, W // 2, l2))
    tw = 7 * len(TH[th]) + 14
    h.append('      <rect class="%s-chip %s-%s" x="%s" y="122" width="%d" height="15" rx="7.5"/>' % (P, P, th, num(W / 2 - tw / 2), tw))
    h.append('      <text class="%s-cl" x="%d" y="133">%s</text>' % (P, W // 2, TH[th]))
    h.append('    </g>')
h.append('  </svg>')
h.append('</div>')

css = ['.an-hchurch { --hch-eu: #6fa8dc; --hch-pa: #6fd8a0; --hch-af: #e0a050; --hch-hf: #c58fe0; text-align: center; }',
       '.%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % P,
       '.%s-ax, .%s-tk { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; }' % (P, P),
       '.%s-yr { font: 700 8px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: middle; }' % P,
       '.%s-mk { fill: var(--gold); }' % P,
       '.%s-dt { font: 700 12px var(--mono); fill: var(--gold); text-anchor: middle; }' % P,
       '.%s-nm { font: 700 13px var(--mono); fill: var(--paper); text-anchor: middle; }' % P,
       '.%s-chip { fill-opacity: .3; stroke-width: 1; }' % P,
       '.%s-cl { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; }' % P]
for th in TH:
    css.append('.%s-%s { fill: var(--hch-%s); stroke: var(--hch-%s); }' % (P, th, th, th))
css.append('.%s-dot { stroke: none; }' % P)
css.append('.%s-cd { opacity: 0; }' % P)
css.append('.%s-c%d { opacity: 1; }' % (P, len(EV) - 1))
# the marker glides to each event in LEAD seconds before its card comes up, and back to the start while the loop resets
stops = [(0, 'transform: translateX(%spx);' % num(x_of(EV[0][0])))]
for i, e in enumerate(EV):
    if i: stops.append((at(i) - LEAD, 'transform: translateX(%spx);' % num(x_of(EV[i - 1][0]))))
    stops.append((at(i), 'transform: translateX(%spx);' % num(x_of(e[0]))))
stops.append((END, 'transform: translateX(%spx);' % num(x_of(EV[-1][0]))))
stops.append((T, 'transform: translateX(%spx);' % num(x_of(EV[0][0]))))
css.append('.%s-mk { transform: translateX(%spx); animation: %s-mk %ss ease-in-out infinite; }' % (P, num(x_of(EV[-1][0])), P, num(T)))
css.append(kf('%s-mk' % P, T, stops))
for i in range(len(EV)):
    a = at(i)
    css.append('.%s-e%d { animation: %s-e%d %ss linear infinite; }' % (P, i, P, i, num(T)))
    css.append(fade('%s-e%d' % (P, i), T, a, END))
    last = i == len(EV) - 1
    css.append('.%s-c%d { animation: %s-c%d %ss linear infinite; }' % (P, i, P, i, num(T)))
    css.append(fade('%s-c%d' % (P, i), T, a + 0.3, END if last else at(i + 1) - 0.3, f=0.3))
css.append(anim_row.still_block('hchurch'))

anim_row.write_anim('hchurch', html='\n'.join(h), css='\n'.join(css), whole=dict(
    book_id='TB-GCSE-RS', chapter=4, title='Church History, 30–2026', about='Mission | Persecution'))
print('hchurch: %d events, a %gs loop' % (len(EV), T))
