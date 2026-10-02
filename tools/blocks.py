# The blocks splash: prints the inside of index.html#splash-blocks, then the @keyframes and the
# per-block delays for style.css, from one timeline. Edit the timeline and re-run, then paste both
# halves over the old ones. Run: python3 tools/blocks.py
#
# WHAT IT DRAWS, in one loop of T seconds:
#   a small pixel runner of our own — a student in a gold mortarboard — runs in from the left along
#   the ground and hops under each of the eight blocks in turn; each block it hits bumps, and the
#   letter inside comes up out of it from BEHIND its face, until the row spells @family.; the last
#   block also gives up a coin; the runner runs off to the right; the name holds long enough to be
#   read; the letters drop back into their blocks left to right; and the loop starts again from the
#   same empty row, so 100% and 0% are the same picture and there is no seam.
#
# NOTHING OF ANYBODY ELSE'S. No plumber, no ? block, no pipe, no mushroom: a block struck from below
# that gives something up is a forty-year-old piece of game grammar that belongs to nobody, and the
# figure is drawn here, pixel by pixel, in this app's own colours.
#
# THE RHYTHM IS THE OLD ONE. The blocks were bumped .17s apart (.15s + .17s n), and they still are —
# shifted later by .35s so there is time to run in before the first one. The runner's hops are timed
# from the same list, apex on the bump, so its head and the block meet on the frame the block moves.
#
# TRANSFORM AND OPACITY ONLY. The runner travels by translateX on one element and hops by
# translateY on the one inside it; its two running frames swap by opacity; the coin spins by scaleX.
T = 6.0                      # seconds, one whole loop
FIRST, STEP = 0.5, 0.17      # the first bump, and the gap between bumps — the old .17s
RISE = 0.5                   # a letter coming up out of its block
HOLD_UNTIL = 3.9             # seconds after its own bump that a letter starts back down
DROP = 0.3
HOP = '.82rem'               # runner's head to the underside of a block — see the layout in style.css
PITCH = '(2rem + 4px)'       # one block and one gap
OFF = 6                      # rem the runner starts and ends beyond the row: off the stage at 25rem
RUN_W = 1.44                 # rem: 8 pixels of .18rem
N = 8

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def x_at(i):                 # the runner's left edge, centred under block i
    return 'calc(%d * %s + %grem)' % (i, PITCH, 1 - RUN_W / 2) if i else '%grem' % (1 - RUN_W / 2)

bump = [FIRST + STEP * i for i in range(N)]
assert bump[-1] + HOLD_UNTIL + DROP < T + FIRST       # the last letter is down before block 0's next bump
keys = []
def frames(name, stops):
    keys.append('@keyframes %s { %s }' % (name, ' '.join('%s { %s }' % s for s in stops)))

# ---- the runner across: in from the left at about the pace it keeps under the row, out to the right
out_t = bump[-1] + 0.45
frames('mb-run', [('0%', 'transform: translateX(-%drem); opacity: 1;'
                         % OFF),
                  (pct(bump[0]), 'transform: translateX(%s); opacity: 1;' % x_at(0)),
                  (pct(bump[-1]), 'transform: translateX(%s); opacity: 1;' % x_at(N - 1)),
                  (pct(out_t), 'transform: translateX(calc(%d * %s + %grem)); opacity: 1;' % (N - 1, PITCH, 1 - RUN_W / 2 + OFF)),
                  # off the stage now: hidden, carried back to the start, shown again before 100%
                  (pct(out_t + 0.05), 'transform: translateX(calc(%d * %s + %grem)); opacity: 0;' % (N - 1, PITCH, 1 - RUN_W / 2 + OFF)),
                  (pct(out_t + 0.1) + ', ' + pct(T - 0.1), 'transform: translateX(-%drem); opacity: 0;' % OFF),
                  ('100%', 'transform: translateX(-%drem); opacity: 1;' % OFF)])

# ---- the runner up: one hop per block, apex on the bump, landing exactly as the next one leaves
half = STEP / 2
hop = [('0%%, %s' % pct(bump[0] - half), 'transform: translateY(0); animation-timing-function: cubic-bezier(.3,.7,.6,1);')]
for i, t in enumerate(bump):
    hop.append((pct(t), 'transform: translateY(-%s); animation-timing-function: cubic-bezier(.4,0,.7,.3);' % HOP))
    end = 'transform: translateY(0); animation-timing-function: cubic-bezier(.3,.7,.6,1);'
    hop.append((pct(t + half) if i + 1 < N else '%s, 100%%' % pct(t + half), end))
frames('mb-hop', hop)

# ---- a block: bumped up and dropped back, once a loop, on the old .34s stepped bump
frames('mb-bump', [('0%', 'transform: translateY(0);'), (pct(0.136), 'transform: translateY(-11px);'),
                   ('%s, 100%%' % pct(0.34), 'transform: translateY(0);')])
# ---- a letter: out of the block, held while the name is read, back in. Relative to its own bump.
frames('mb-letter', [('0%', 'transform: translateY(0); animation-timing-function: cubic-bezier(.2,.9,.3,1);'),
                     ('%s, %s' % (pct(RISE), pct(HOLD_UNTIL)), 'transform: translateY(-2.15rem); animation-timing-function: ease-in;'),
                     ('%s, 100%%' % pct(HOLD_UNTIL + DROP), 'transform: translateY(0);')])
# ---- the coin off the last block: up past the letter, over, and gone; back behind the face unseen
frames('mb-coin', [('0%', 'transform: translateY(0); opacity: 1; animation-timing-function: ease-out;'),
                   (pct(0.55), 'transform: translateY(-3.4rem); opacity: 1; animation-timing-function: ease-in;'),
                   (pct(1.0), 'transform: translateY(-2rem); opacity: 0;'),
                   ('%s, %s' % (pct(1.05), pct(T - 0.05)), 'transform: translateY(0); opacity: 0;'),
                   ('100%', 'transform: translateY(0); opacity: 1;')])

delays = ['.mb-block:nth-child(%d), .mb-block:nth-child(%d) i { animation-delay: %gs; }' % (i + 1, i + 1, round(t, 2))
          for i, t in enumerate(bump)]
delays.append('.mb-coin { animation-delay: %gs; }' % round(bump[-1] + 0.11, 2))

# ---- the runner, drawn: 8 x 11, one letter per pixel ---------------------------------------------
#   c cap (gold)   t tassel (coral)   s skin (paper)   e eye (black)   j jumper (gold)
#   d trousers (dim)   k shoes (ink)
BODY = ['.ccccccc',
        't.cccc..',
        't.ssss..',
        '..sssse.',
        '..ssss..',
        '..jjjj..',
        '.jjjjjs.',
        '..jjjj..',
        '..dddd..']
LEGS = {'a': ['.dd..dd.', 'kk....kk'],     # mid-stride
        'b': ['...dd...', '..kkk...']}     # passing
FILL = {'c': 'mb-px-gold', 't': 'mb-px-tassel', 's': 'mb-px-skin', 'e': 'mb-px-eye',
        'j': 'mb-px-gold', 'd': 'mb-px-leg', 'k': 'mb-px-shoe'}

def sprite(rows, cls):
    paths = {}
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            ch = row[x]
            if ch == '.':
                x += 1; continue
            n = 1
            while x + n < len(row) and row[x + n] == ch: n += 1
            paths.setdefault(FILL[ch], []).append('M%d %dh%dv1h-%dz' % (x, y, n, n))
            x += n
    body = ''.join('<path class="%s" d="%s"/>' % (k, ''.join(v)) for k, v in paths.items())
    return '<svg class="mb-sprite %s" viewBox="0 0 8 11" shape-rendering="crispEdges">%s</svg>' % (cls, body)

print('    <div class="mb-row">')
for i, ch in enumerate('@family.'):
    coin = '<b class="mb-coin"></b>' if i == N - 1 else ''
    print('      <span class="mb-block"><i>%s</i>%s</span>' % (ch, coin))
print('    </div>')
print('    <div class="mb-run"><div class="mb-hop">' + sprite(BODY + LEGS['a'], 'is-a') + sprite(BODY + LEGS['b'], 'is-b') + '</div></div>')
print('    <div class="mb-ground"></div>')
print()
print('\n'.join(keys))
print('\n'.join(delays))
