# The sieve splash ("what is left is prime"): prints the <div class="sv-grid"> and the caption for
# index.html#splash-sieve, then the @keyframes for style.css. Edit the timeline and re-run, then paste
# both halves over the old ones. Run: python3 tools/sieve.py
#
# WHAT IT DRAWS, in one loop of T seconds, on the numbers 2 to 17 in ONE LINE:
#   2 is ringed in its colour, and its multiples 4, 6 ... 16 are struck through in that colour, one
#   after another, left to right;                                    caption "multiples of 2"
#   3 is ringed in its own colour, and its multiples are walked: 9 and 15 are struck, and 6 and 12 —
#   already out — get a second, shorter line in 3's colour, so the walk visibly lands on them;
#                                                                    caption "multiples of 3"
#   then it STOPS, because the next prime is 5 and 5 x 5 = 25 is past 17: every composite up to 17
#   has a factor no bigger than its square root, so it has already been struck. The survivors
#   5, 7, 11, 13, 17 are ringed;                                     caption "what is left is prime"
#   then everything clears and the row is plain again, so 100% and 0% are the same picture.
#
# THE ORDER IS THE LESSON. The old one struck in position order — 4, 6, 8, 9, 10 — at a fixed step,
# so the method (one prime at a time, its multiples) was never shown and nothing said WHY a number
# went. Here the colour of a strike says which prime removed it.
#
# EVERYTHING MOVES BY transform OR opacity: a strike is scaleX from its left end, a ring scales up
# and fades in, a struck digit fades to a third. Nothing animates width or colour.
N = range(2, 18)
T = 7.2                 # seconds, one whole loop
RING = 0.25             # seconds for a ring to draw
STRIKE = 0.2            # seconds for a strike to draw
CLEAR = (6.4, 6.75)     # everything fades out between these, and is reset while invisible

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def smallest_factor(n):
    return next(p for p in range(2, n + 1) if n % p == 0)

primes = [n for n in N if smallest_factor(n) == n]
assert 5 * 5 > max(N)                                    # why the sieve stops after 3

# ---- the timeline --------------------------------------------------------------------------------
# when each thing happens, in seconds. `strike[n]` is when n is struck (by its smallest factor), and
# `again[n]` the second tick 3 puts on a number 2 has already taken.
ring, strike, again = {2: 0.35, 3: 2.45}, {}, {}
for k, n in enumerate(range(4, max(N) + 1, 2)):
    strike[n] = 0.75 + 0.17 * k
for k, n in enumerate(range(6, max(N) + 1, 3)):
    t = 2.85 + 0.2 * k
    (again if n in strike else strike)[n] = t
for j, n in enumerate(p for p in primes if p > 3):
    ring[n] = 4.3 + 0.12 * j
SAY = [('2', 'multiples of 2', 6.9, 2.35), ('3', 'multiples of 3', 2.35, 4.1),
       ('p', 'what is left is prime', 4.1, CLEAR[1])]
assert set(strike) | set(ring) == set(N)                 # every number is either struck or ringed
assert not set(strike) & set(ring)

ON, OFF = CLEAR
keys = []
def frames(name, stops):
    keys.append('@keyframes %s { %s }' % (name, ' '.join('%s { %s }' % s for s in stops)))

# a strike: draws from its left end, holds, fades with everything else, resets while invisible
def strike_frames(name, t):
    frames(name, [('0%%, %s' % pct(t), 'transform: scaleX(0); opacity: 1; animation-timing-function: ease-out;'),
                  ('%s, %s' % (pct(t + STRIKE), pct(ON)), 'transform: scaleX(1); opacity: 1;'),
                  ('%s' % pct(OFF), 'transform: scaleX(1); opacity: 0;'),
                  ('%s, 100%%' % pct(OFF + 0.05), 'transform: scaleX(0); opacity: 0;')])

cells = []
for n in N:
    p = smallest_factor(n)
    if n in ring:
        cls = '2' if n == 2 else '3' if n == 3 else 'p'
        frames('sv-r%d' % n, [('0%%, %s' % pct(ring[n]), 'transform: scale(.5); opacity: 0; animation-timing-function: ease-out;'),
                              ('%s, %s' % (pct(ring[n] + RING), pct(ON)), 'transform: scale(1); opacity: 1;'),
                              ('%s, 100%%' % pct(OFF), 'transform: scale(1.15); opacity: 0;')])
        cells.append('<i><b>%d</b><u class="sv-%s" style="--kf: sv-r%d"></u></i>' % (n, cls, n))
        continue
    frames('sv-d%d' % n, [('0%%, %s' % pct(strike[n]), 'opacity: 1;'),
                          ('%s, %s' % (pct(strike[n] + STRIKE), pct(ON)), 'opacity: .38;'),
                          ('%s, 100%%' % pct(OFF), 'opacity: 1;')])
    strike_frames('sv-x%d' % n, strike[n])
    lines = '<s class="sv-%d" style="--kf: sv-x%d"></s>' % (p, n)
    if n in again:
        strike_frames('sv-y%d' % n, again[n])
        lines += '<s class="sv-3 sv-again" style="--kf: sv-y%d"></s>' % n
    cells.append('<i class="sv-out"><b style="--kf: sv-d%d">%d</b>%s</i>' % (n, n, lines))

# the caption: one line per step, stacked in one place, only the current one showing. The first
# one comes up again at the very end of the loop, so the row is never without a caption to read.
says = []
for i, (cls, text, a, b) in enumerate(SAY):
    if a > b:     # wraps round the end of the loop
        frames('sv-s%d' % i, [('0%%, %s' % pct(b - 0.15), 'opacity: 1;'), ('%s, %s' % (pct(b), pct(a)), 'opacity: 0;'),
                              ('%s, 100%%' % pct(a + 0.15), 'opacity: 1;')])
    else:
        frames('sv-s%d' % i, [('0%%, %s' % pct(a), 'opacity: 0;'), ('%s, %s' % (pct(a + 0.15), pct(b - 0.15)), 'opacity: 1;'),
                              ('%s, 100%%' % pct(b), 'opacity: 0;')])
    says.append('<span class="sv-%s" style="--kf: sv-s%d">%s</span>' % (cls, i, text))

print('    <div class="sv-grid">')
for k in range(0, len(cells), 4):
    print('      ' + ''.join(cells[k:k + 4]))
print('    </div>')
print('    <div class="sv-say">' + ''.join(says) + '</div>')
print()
print('\n'.join(keys))
