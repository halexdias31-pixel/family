# The boxing splash: prints the inside of index.html#splash-box, then the @keyframes for style.css,
# from one timeline. Edit the timeline or a sprite and re-run, then paste the markup over the inside
# of #splash-box and the keyframes between the BOXING-FRAMES markers. Run: python3 tools/boxing.py
#
# ASKED FOR AS "add a boxing animation loading. like boxing in the ring 8 bit."
#
# WHAT IT DRAWS, in one loop of T seconds: a ring seen from the side, three ropes strung between two
# corner posts, a bell on a bracket over the middle. Two boxers in their guard, bobbing on the beat.
# Gold jabs and blue ducks under it; blue jabs back and lands, and gold rocks back with a spark; gold
# jabs again and lands, and blue rocks back. The bell rings, both go back to their corners, and both
# come out again to exactly where they started, so 100% and 0% are the same picture.
#
# NOBODY'S LIKENESS AND NOBODY'S GAME. The two boxers are drawn here, pixel by pixel, from nothing: a
# head, two gloves, a pair of trunks and boots in this app's colours. No real fighter, no character
# from any game, no logo on the apron. A side-on ring with a bell is the grammar of the sport, which
# belongs to nobody — the blocks splash makes the same argument about a block struck from below.
#
# EIGHT-BIT IN HOW IT MOVES AS WELL AS HOW IT LOOKS. Every animation is `step-end`, so a pose is
# swapped rather than faded and a boxer moves a whole pixel at a time; a stop is written for every
# pixel of a step. The pixels are paths in one SVG with `shape-rendering: crispEdges`, and the stage
# is sized so a pixel is 3 screen pixels wherever there is room for it.
#
# TRANSFORM AND OPACITY ONLY, ON ONE CLOCK. A pose shows by opacity; a boxer steps by translateX and
# bobs by translateY on two nested groups; the bell shakes by translateX; the sparks and the ding marks
# blink by opacity. Every one of them runs for T and is infinite — js/check-splash-loops.js reads
# that off the stylesheet.

T = 4.8                       # seconds, one whole loop
W, H = 100, 60                # the viewBox, in game pixels
FEET = 47                     # the row the boots stand on — the mat's top edge
SW, SH = 20, 22               # one sprite's box
LX = 32                       # gold's sprite box, left edge
RX = 68                       # blue's sprite box, RIGHT edge (it is drawn mirrored about it)

def pct(t):
    t = max(0.0, min(T, t))
    return ('%.3f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

# ---- the sprites, facing right; blue is the same drawing mirrored -------------------------------
#   h hair   s skin   e eye   g glove   w waistband   t trunks   b boots
POSES = {
'guard': [
 '....................',
 '......hhhh..........',
 '.....hhhhhh.........',
 '.....hhsssss........',
 '.....hsssses........',
 '.....hssssss........',
 '......ssss.ggg......',
 '.......ss.ggggg.....',
 '....ssssssggggg.....',
 '...ssssssssggg......',
 '...sssssgggs........',
 '...sssssgggg........',
 '....sssssggg........',
 '....wwwwwww.........',
 '....ttttttt.........',
 '....ttttttt.........',
 '....ttt..ttt........',
 '....ss....ss........',
 '...ss......ss.......',
 '...ss......ss.......',
 '..bbb......bbb......',
 '..bbb......bbbb.....',
],
'jab': [
 '....................',
 '......hhhh..........',
 '.....hhhhhh.........',
 '.....hhsssss........',
 '.....hsssses...gggg.',
 '.....hssssss..gggggg',
 '......ssss.ssssggggg',
 '.......sssssssgggggg',
 '....sssssss....gggg.',
 '...sssssssgg........',
 '...ssssssgggg.......',
 '...sssssggggg.......',
 '....sssssggg........',
 '....wwwwwww.........',
 '....ttttttt.........',
 '....ttttttt.........',
 '....ttt..ttt........',
 '....ss....ss........',
 '...ss......ss.......',
 '..ss........ss......',
 '.bbb........bbb.....',
 '.bbb........bbbb....',
],
'duck': [
 '....................',
 '....................',
 '....................',
 '....................',
 '....................',
 '....................',
 '....................',
 '......hhhh..........',
 '.....hhhhhh..gg.....',
 '.....hhssssggggg....',
 '....hsssssegggggg...',
 '...sssssssssgggg....',
 '...sssssssggg.......',
 '...ssssssgggg.......',
 '....wwwwwwggg.......',
 '....ttttttt.........',
 '...tttt..tttt.......',
 '..sss......sss......',
 '..ss........ss......',
 '..ss........ss......',
 '.bbb........bbb.....',
 '.bbb........bbbb....',
],
'hit': [
 '....................',
 '...hhhh.............',
 '..hhhhhh............',
 '..hhsssss...........',
 '..hsssses...........',
 '...sssss............',
 '....ssss............',
 '.....sss..ggg.......',
 '....sssssggggg......',
 '...ssssssggggg......',
 '...sssssssggg.......',
 '...ssssggg..........',
 '....sssgggg.........',
 '....wwwwggg.........',
 '....ttttttt.........',
 '....ttttttt.........',
 '....ttt..ttt........',
 '....ss....ss........',
 '...ss......ss.......',
 '...ss......ss.......',
 '..bbb......bbb......',
 '..bbb......bbbb.....',
],
}
FILL = {'h': 'hair', 's': 'skin', 'e': 'eye', 'g': 'glove', 'w': 'band', 't': 'trunks', 'b': 'boot'}

def runs(rows, fill_of, dx=0, dy=0):
    """One path per colour, one `h` run per stretch of a row — the blocks runner's method."""
    paths = {}
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            ch = row[x]
            if ch == '.':
                x += 1; continue
            n = 1
            while x + n < len(row) and row[x + n] == ch: n += 1
            paths.setdefault(fill_of[ch], []).append('M%d %dh%dv1h-%dz' % (x + dx, y + dy, n, n))
            x += n
    return ''.join('<path class="bx-%s" d="%s"/>' % (k, ''.join(v)) for k, v in paths.items())

for k, rows in POSES.items():
    assert len(rows) == SH, k
    assert all(len(r) == SW for r in rows), k

# ---- the timeline ------------------------------------------------------------------------------
# Each boxer: (time, pose) changes, and (time, x) steps. x is pixels TOWARD the other boxer, so
# blue's numbers mean the same as gold's; the mirror turns them round.
POSE = {
  'l': [(0, 'guard'), (0.60, 'jab'), (0.92, 'guard'), (1.60, 'hit'), (2.02, 'guard'),
        (2.50, 'jab'), (2.82, 'guard')],
  'r': [(0, 'guard'), (0.52, 'duck'), (1.00, 'guard'), (1.52, 'jab'), (1.84, 'guard'),
        (2.56, 'hit'), (3.00, 'guard')],
}
STEP = {   # (time, pixels toward the middle); between two entries it walks a pixel at a time
  'l': [(0, 0), (0.56, 0), (0.64, 3), (0.92, 3), (1.04, 0), (1.60, 0), (1.68, -2), (2.02, -2),
        (2.14, 0), (2.44, 0), (2.52, 4), (2.82, 4), (2.96, 0), (3.40, 0), (3.88, -8),
        (4.30, -8), (4.78, 0)],
  'r': [(0, 0), (0.52, 0), (0.60, -3), (1.00, -3), (1.10, 0), (1.46, 0), (1.54, 4), (1.84, 4),
        (1.98, 0), (2.56, 0), (2.64, -3), (3.00, -3), (3.10, 0), (3.40, 0), (3.88, -8),
        (4.30, -8), (4.78, 0)],
}
BOB = 0.3                       # the guard's bounce: up a pixel, down a pixel, on this beat
SPARK = {'1': (1.60, 1.80), '2': (2.56, 2.76)}       # gold is hit, then blue is hit
BELL = (3.30, 4.00)             # the bell rings, and both go back to their corners

keys = []
def frames(name, stops):
    # step-end: every stop holds until the next one, so nothing is ever between two pixels or two
    # poses. 0% and 100% are written to the same value, so there is no seam.
    keys.append('@keyframes %s { %s }' % (name, ' '.join('%s { %s }' % s for s in stops)))

def walk(points):
    """Every whole pixel between two entries gets its own stop, spread evenly over the gap."""
    out = []
    for (t0, x0), (t1, x1) in zip(points, points[1:]):
        out.append((t0, x0))
        n = abs(x1 - x0)
        for k in range(1, n):
            out.append((t0 + (t1 - t0) * k / n, x0 + (k if x1 > x0 else -k)))
    out.append(points[-1])
    return out

for side in 'lr':
    # NO SIGN FOR BLUE. Its outer group is `scale(-1 1)`, so +x inside it is LEFT on the screen —
    # toward the middle, the same meaning gold's +x has. A sign here turned blue's duck into a lunge.
    pts = walk(STEP[side])
    seen, stops = set(), []
    for t, x in pts:
        p = pct(t)
        if p in seen: continue
        seen.add(p)
        stops.append((p, 'transform: translateX(%dpx);' % x))
    assert stops[0][1] == 'transform: translateX(0px);'
    stops.append(('100%', 'transform: translateX(0px);'))
    frames('bx-%s-go' % side, stops)
    # the poses: one keyframe per pose, shown while it is the pose
    changes = POSE[side]
    for pose in sorted(set(p for _, p in changes)):
        st = []
        for i, (t, p) in enumerate(changes):
            st.append((pct(t), 'opacity: %d;' % (1 if p == pose else 0)))
        first = 1 if changes[0][1] == pose else 0
        st.append(('100%', 'opacity: %d;' % first))
        frames('bx-%s-%s' % (side, pose), st)

# the bob: up and down on the beat, the whole loop through — a boxer never stands still
bob, t, up = [], 0.0, 0
while t < T - 1e-9:
    bob.append((pct(t), 'transform: translateY(%dpx);' % (-up)))
    up ^= 1
    t += BOB
assert abs(t - T) < 1e-6, 'BOB must divide T so the bounce has no seam'
bob.append(('100%', 'transform: translateY(0px);'))
frames('bx-bob', bob)

for n, (a, b) in SPARK.items():
    frames('bx-spark-%s' % n, [('0%', 'opacity: 0;'), (pct(a), 'opacity: 1;'), (pct((a + b) / 2), 'opacity: 0;'),
                               (pct((a + b) / 2 + .05), 'opacity: 1;'), (pct(b), 'opacity: 0;'), ('100%', 'opacity: 0;')])

# THE BELL SHAKES A PIXEL EACH WAY rather than swinging. A rotation was tried first and a bell turned
# 14 degrees is a bell whose pixels are no longer on the grid — soft, diagonal edges on the one
# object in the ring that is meant to be loudest. A shake stays on whole pixels.
swing, t, k = [('0%', 'transform: translateX(0px);')], BELL[0], 0
while t < BELL[1] - 1e-9:
    swing.append((pct(t), 'transform: translateX(%dpx);' % (1 if k % 2 == 0 else -1)))
    t += 0.1; k += 1
swing.append((pct(BELL[1]), 'transform: translateX(0px);'))
swing.append(('100%', 'transform: translateX(0px);'))
frames('bx-bell', swing)
ding, t, k = [('0%', 'opacity: 0;')], BELL[0], 0
while t < BELL[1] - 1e-9:
    ding.append((pct(t), 'opacity: %d;' % (1 if k % 2 == 0 else 0)))
    t += 0.1; k += 1
ding.append((pct(BELL[1]), 'opacity: 0;'))
ding.append(('100%', 'opacity: 0;'))
frames('bx-ding', ding)

# ---- the markup --------------------------------------------------------------------------------
def boxer(side):
    poses = POSE[side]
    names = sorted(set(p for _, p in poses))
    inner = ''.join('<g class="bx-pose bx-%s-%s">%s</g>' % (side, p, runs(POSES[p], FILL)) for p in names)
    place = ('translate(%d %d)' % (LX, FEET - SH) if side == 'l'
             else 'translate(%d %d) scale(-1 1)' % (RX, FEET - SH))
    return ('<g class="bx-%s" transform="%s"><g class="bx-go bx-%s-go"><g class="bx-bob">%s</g></g></g>'
            % (side, place, side, inner))

def rect(cls, x, y, w, h):
    return '<rect class="%s" x="%d" y="%d" width="%d" height="%d"/>' % (cls, x, y, w, h)

ROPES = [(22, 'bx-rope'), (29, 'bx-rope bx-rope-mid'), (36, 'bx-rope')]
ring = []
# the posts: symmetric about the middle, which is what check-splash-loops centres on
ring.append(rect('bx-post', 3, 18, 3, FEET - 18))
ring.append(rect('bx-post', W - 6, 18, 3, FEET - 18))
for y, cls in ROPES:
    ring.append(rect(cls, 6, y, W - 12, 1))
    ring.append(rect('bx-pad bx-pad-l', 2, y - 1, 5, 3))
    ring.append(rect('bx-pad bx-pad-r', W - 7, y - 1, 5, 3))
ring.append(rect('bx-mat', 0, FEET, W, 3))
ring.append(rect('bx-mat-edge', 0, FEET, W, 1))
ring.append(rect('bx-apron', 2, FEET + 3, W - 4, 8))
ring.append(rect('bx-apron-band', 2, FEET + 5, W - 4, 1))

BELL_PX = ['...ff...',
           '..ffff..',
           '.ffffff.',
           '.ffffff.',
           'ffffffff',
           '...cc...']
bell = ('<rect class="bx-post" x="49" y="0" width="2" height="2"/>'
        '<g class="bx-bell">%s</g>' % runs(BELL_PX, {'f': 'gold', 'c': 'clapper'}, 46, 2))
ding = ('<g class="bx-ding">%s%s</g>'
        % (''.join(rect('bx-spk', x, y, 2, 1) for x, y in [(41, 3), (40, 6), (57, 3), (58, 6)]),
           ''.join(rect('bx-spk', x, y, 1, 1) for x, y in [(43, 1), (56, 1)])))
STAR = ['..s..',
        's.s.s',
        '.sgs.',
        'ssgss',
        '.sgs.',
        's.s.s',
        '..s..']
# where a glove lands: gold's face when blue jabs (1), blue's face when gold jabs (2)
spark = ''.join('<g class="bx-spark bx-spark-%s">%s</g>' % (n, runs(STAR, {'s': 'spk', 'g': 'gold'}, x, y))
                for n, x, y in [('1', 40, 27), ('2', 55, 27)])

print('    <svg class="bx-ring" viewBox="0 0 %d %d" shape-rendering="crispEdges">' % (W, H))
print('      ' + ''.join(ring))
print('      ' + bell + ding)
print('      ' + boxer('l'))
print('      ' + boxer('r'))
print('      ' + spark)
print('    </svg>')
print('    <div class="sp-sig">@family.</div>')
print()
print('\n'.join(keys))
