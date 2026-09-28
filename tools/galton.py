# The Galton board splash: prints the sixteen <circle>s for index.html, then the sixteen
# @keyframes for style.css. Every route of four left/right bounces is taken once, so the pile is
# 1, 4, 6, 4, 1 by construction. Run: python3 tools/galton.py
import itertools, re
T = 10.0            # seconds, one whole bell
GAP, R, PR = 0.45, 2.6, 1.6
ROWS = [14, 24, 34, 44]
FLOOR = 86
# all sixteen left/right routes, each exactly once, in a fixed shuffled order
routes = [''.join(p) for p in itertools.product('LR', repeat=4)]
order = [5, 12, 0, 9, 3, 14, 7, 10, 1, 13, 6, 11, 2, 15, 4, 8]
routes = [routes[i] for i in order]
filled = [0]*5
def pct(t): return '%.2f%%' % (100*t/T)
balls, keys = [], []
for i, rt in enumerate(routes):
    k = rt.count('R'); n = filled[k]; filled[k] += 1
    lx, ly = 50 + 16*(k-2), FLOOR - R - n*2*R
    s = i*GAP
    pts = [(s, 50, 2, 'ease-in', 0)]           # (time, x, y, easing into NEXT, opacity)
    x, t = 50, s + 0.18
    for r, py in enumerate(ROWS):
        cy = py - PR - R
        pts.append((t, x, cy, 'ease-out', 1))
        x += 8 if rt[r] == 'R' else -8
        pts.append((t + 0.07, x - (4 if rt[r]=='R' else -4), cy - 1.5, 'ease-in', 1))
        t += 0.2
    t += 0.08
    pts.append((t, lx, ly, 'linear', 1))
    frames = []
    frames.append('0%%, %s { opacity: 0; transform: translate(0px, %.1fpx); fill: #f0b45f; }' % (pct(s), 2 - ly + 0) if False else
                  '0%%, %s { opacity: 0; transform: translate(%.1fpx, %.1fpx); fill: #f0b45f; animation-timing-function: ease-in; }' % (pct(max(s-0.01,0)), 50-lx, 2-ly))
    for (tt, px, py, ease, op) in pts:
        frames.append('%s { opacity: 1; transform: translate(%.1fpx, %.1fpx); animation-timing-function: %s; }' % (pct(tt), px-lx, py-ly, ease))
    frames[-1] = frames[-1].replace('}', 'fill: #f0b45f; }')
    frames.append('%s { transform: translate(0px, -1.2px); fill: #6fd8c4; }' % pct(t+0.08))
    frames.append('%s, 90%% { opacity: 1; transform: none; fill: #6fd8c4; }' % pct(t+0.16))
    frames.append('96%, 100% { opacity: 0; transform: none; fill: #6fd8c4; }')
    keys.append('@keyframes gl-b%d { %s }' % (i, ' '.join(frames)))
    balls.append('<circle class="gl-b" style="animation-name: gl-b%d" cx="%g" cy="%.1f" r="%g"/>' % (i, lx, ly, R))
assert filled == [1,4,6,4,1], filled
print('\n      '.join(balls))
print('\n'.join(keys))
print('/* filled', filled, '*/')
