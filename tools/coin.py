# The coin-flip splash ("heads, about half the time"): prints the markup for index.html, then the
# @keyframes for style.css. Ten tosses of a fixed sequence that ends on exactly five heads, so the
# running share wobbles 1, .5, .33, .5, .4, .5, .43, .38, .44 and lands on a half.
# Every toss adds two whole turns plus a half turn when the face changes, so the coin lands on the
# face the tally records. Run: python3 tools/coin.py
SEQ = 'HTTHTHTTHH'
T = 9.0             # seconds, one whole run
D = 0.66            # seconds per toss
START = 0.3
UP = 2.4            # rem the coin rises

def pct(t): return '%.2f%%' % (100 * t / T)

assert SEQ.count('H') * 2 == len(SEQ) and SEQ[-1] == 'H'   # ends on half, and on the face it starts
land = [START + i * D + 0.62 * D for i in range(len(SEQ))]

# the coin
face, ang, f = 'H', 0, ['0% { transform: translateY(0) rotateX(0deg); }']
for i, c in enumerate(SEQ):
    t0 = START + i * D
    add = 720 + (0 if c == face else 180)
    f.append('%s { transform: translateY(0) rotateX(%ddeg); animation-timing-function: cubic-bezier(.2,.7,.4,1); }' % (pct(t0), ang))
    f.append('%s { transform: translateY(-%grem) rotateX(%ddeg); animation-timing-function: cubic-bezier(.6,0,.8,.3); }' % (pct(t0 + 0.31 * D), UP, ang + add // 2))
    f.append('%s { transform: translateY(0) rotateX(%ddeg); animation-timing-function: ease-out; }' % (pct(land[i]), ang + add))
    f.append('%s { transform: translateY(-.22rem) rotateX(%ddeg); animation-timing-function: ease-in; }' % (pct(land[i] + 0.07), ang + add))
    f.append('%s { transform: translateY(0) rotateX(%ddeg); }' % (pct(land[i] + 0.14), ang + add))
    ang += add; face = c
assert ang % 360 == 0            # so 100% -> 0% is the same picture
f.append('100%% { transform: translateY(0) rotateX(%ddeg); }' % ang)
keys = ['@keyframes cn-toss { %s }' % ' '.join(f)]

# the shadow shrinks while the coin is up
s = ['0% { transform: scaleX(1); opacity: .5; }']
for i in range(len(SEQ)):
    t0 = START + i * D
    s.append('%s { transform: scaleX(1); opacity: .5; }' % pct(t0))
    s.append('%s { transform: scaleX(.45); opacity: .18; }' % pct(t0 + 0.31 * D))
    s.append('%s { transform: scaleX(1); opacity: .5; }' % pct(land[i]))
s.append('100% { transform: scaleX(1); opacity: .5; }')
keys.append('@keyframes cn-shadow { %s }' % ' '.join(s))

# each tally mark appears as its coin lands, holds, and the row clears together at the end
END_HOLD, FADE = 92, 97
marks = []
for i, c in enumerate(SEQ):
    a = pct(land[i])
    keys.append('@keyframes cn-m%d { 0%%, %s { opacity: 0; transform: scale(.4); } %s { opacity: 1; transform: scale(1.18); } %s, %d%% { opacity: 1; transform: scale(1); } %d%%, 100%% { opacity: 0; transform: scale(1); } }'
                % (i, pct(land[i] - 0.01), pct(land[i] + 0.1), pct(land[i] + 0.22), END_HOLD, FADE))
    marks.append('<i class="cn-m is-%s" style="animation-name: cn-m%d">%s</i>' % (c.lower(), i, c))

# the share of heads so far, as a bar that steps at each landing
b, h = ['0%%, %s { transform: scaleX(0); }' % pct(land[0] - 0.01)], 0
for i, c in enumerate(SEQ):
    h += c == 'H'
    b.append('%s, %s { transform: scaleX(%.4f); }' % (pct(land[i] + 0.12), pct((land[i + 1] if i + 1 < len(SEQ) else T * END_HOLD / 100) - 0.01), h / (i + 1)))
b.append('%d%%, 100%% { transform: scaleX(%.4f); }' % (FADE, h / len(SEQ)))
keys.append('@keyframes cn-share { %s }' % ' '.join(b))

# the count under it: one line per toss, only the current one showing
says, h = [], 0
for i, c in enumerate(SEQ):
    h += c == 'H'
    last = i + 1 == len(SEQ)
    end = pct(T * END_HOLD / 100) if last else pct(land[i + 1])
    text = '%d heads in %d · about half' % (h, i + 1) if last else '%d head%s in %d' % (h, '' if h == 1 else 's', i + 1)
    keys.append('@keyframes cn-s%d { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
                % (i, pct(land[i] + 0.05), pct(land[i] + 0.12), end, pct(T * FADE / 100) if last else pct(land[i + 1] + 0.01)))
    says.append('<span style="animation-name: cn-s%d">%s</span>' % (i, text))

print('    <div class="cn-stage"><div class="cn-coin"><b class="cn-h">H</b><b class="cn-t">T</b></div><i class="cn-shadow"></i></div>')
print('    <div class="cn-row">' + ''.join(marks) + '</div>')
print('    <div class="cn-bar"><i></i></div>')
print('    <div class="cn-say">' + ''.join(says) + '</div>')
print()
print('\n'.join(keys))
