# The Second World War, 1939–45, as a time line (GCSE History chapter 6, The road to war: its last worked line is
# 1 September 1939, and this carries the story on from there). Writes its whole row of data/textbooks.json through
# tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row. Run: python3 tools/h_ww2.py
#
# WHAT IT DRAWS, in one loop of T seconds: a year axis 1939–1945 and a gold marker that steps along it, one event at a
# time: the date, what happened in two lines, and a tag for its theatre (Europe, Pacific, Africa, Home front). Each event
# leaves a dot on the axis, and an event that lasted (Dunkirk, the Battle of Britain, the Blitz, Stalingrad, El Alamein)
# a bar the length it lasted. Dates are the standard ones (IWM, Britannica); the axis is to scale. The still (reduced
# motion) is the whole axis with the last card: Japan's surrender.
import sys, pathlib, datetime; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num, kf, fade

P = 'hww'
W, VH = 240, 146
X0, X1, Y0, YAX = 12, 228, 1939, 38          # the axis runs from 1 Jan 1939 to 1 Jan 1946
STEP, LEAD = 1.7, 0.6
TH = {'eu': 'Europe', 'pa': 'Pacific', 'af': 'Africa', 'hf': 'Home front'}

# (from, to or None, the date as said, line 1, line 2, theatre)
EV = [
    ((1939, 9, 1), None, '1 September 1939', 'Germany invades', 'Poland', 'eu'),
    ((1939, 9, 3), None, '3 September 1939', 'Britain and France', 'declare war', 'eu'),
    ((1940, 5, 26), (1940, 6, 4), '26 May – 4 June 1940', 'Dunkirk: 338,000', 'troops taken off', 'eu'),
    ((1940, 6, 22), None, '22 June 1940', 'France signs an', 'armistice', 'eu'),
    ((1940, 7, 10), (1940, 10, 31), '10 July – 31 October 1940', 'Battle of Britain:', 'the RAF holds on', 'hf'),
    ((1940, 9, 7), (1941, 5, 11), '7 Sep 1940 – 11 May 1941', 'the Blitz: bombs on', 'British cities', 'hf'),
    ((1941, 6, 22), None, '22 June 1941', 'Operation Barbarossa:', 'Germany invades USSR', 'eu'),
    ((1941, 12, 7), None, '7 December 1941', 'Japan attacks Pearl', 'Harbor; USA joins', 'pa'),
    ((1942, 6, 4), (1942, 6, 7), '4–7 June 1942', 'Midway: four Japanese', 'carriers sunk', 'pa'),
    ((1942, 8, 23), (1943, 2, 2), '23 Aug 1942 – 2 Feb 1943', 'Stalingrad: German', 'Sixth Army gives up', 'eu'),
    ((1942, 10, 23), (1942, 11, 11), '23 Oct – 11 Nov 1942', 'El Alamein: Eighth', 'Army turns the tide', 'af'),
    ((1944, 6, 6), None, '6 June 1944', 'D-Day: Allies land', 'in Normandy', 'eu'),
    ((1945, 5, 8), None, '8 May 1945', 'VE Day: war in', 'Europe ends', 'eu'),
    ((1945, 8, 6), None, '6 August 1945', 'atomic bomb on', 'Hiroshima', 'pa'),
    ((1945, 8, 9), None, '9 August 1945', 'atomic bomb on', 'Nagasaki', 'pa'),
    ((1945, 8, 15), (1945, 9, 2), '15 Aug 1945 (signed 2 Sep)', 'VJ Day: Japan', 'surrenders', 'pa'),
]
T = LEAD + STEP * len(EV) + 3.0
END = T - 0.6


def x_of(d):
    y, m, dd = d
    day = (datetime.date(y, m, dd) - datetime.date(y, 1, 1)).days
    days = (datetime.date(y + 1, 1, 1) - datetime.date(y, 1, 1)).days
    return X0 + (X1 - X0) * (y - Y0 + day / days) / 7.0


def at(i): return LEAD + STEP * i


h = ['<div class="an-hww2" aria-hidden="true">', '  <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, VH)]
for k in range(8):
    x = X0 + (X1 - X0) * k / 7.0
    h.append('    <path class="%s-tk" d="M%s %sV%s"/>' % (P, num(x), YAX - 3, YAX + 3))
    if k < 7: h.append('    <text class="%s-yr" x="%s" y="%d">%d</text>' % (P, num(x + (X1 - X0) / 14.0), YAX - 20, Y0 + k))
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

css = ['.an-hww2 { --hww-eu: #6fa8dc; --hww-pa: #6fd8a0; --hww-af: #e0a050; --hww-hf: #e0605a; text-align: center; }',
       '.%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % P,
       '.%s-ax, .%s-tk { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; }' % (P, P),
       '.%s-yr { font: 700 8px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: middle; }' % P,
       '.%s-mk { fill: var(--gold); }' % P,
       '.%s-dt { font: 700 12px var(--mono); fill: var(--gold); text-anchor: middle; }' % P,
       '.%s-nm { font: 700 13px var(--mono); fill: var(--paper); text-anchor: middle; }' % P,
       '.%s-chip { fill-opacity: .3; stroke-width: 1; }' % P,
       '.%s-cl { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; }' % P]
for th in TH:
    css.append('.%s-%s { fill: var(--hww-%s); stroke: var(--hww-%s); }' % (P, th, th, th))
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
css.append(anim_row.still_block('hww2'))

anim_row.write_anim('hww2', html='\n'.join(h), css='\n'.join(css), whole=True, place=dict(
    book_id='TB-GCSE-HIST', chapter=6, title='World War 2, 1939–45', about='1 September 1939'))
print('hww2: %d events, a %gs loop' % (len(EV), T))
