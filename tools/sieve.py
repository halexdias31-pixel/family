# The sieve ("what is left is prime"; the textbooks' Maths chapter 1). Run: python3 tools/sieve.py
# The numbers 2 to 17 in one line: 2 is ringed and its multiples 4, 6 … 16 are struck through in coral; 3 is ringed and
# its multiples 9 and 15 are struck in green (6 and 12 are already out). Then it stops, because the next prime is 5 and
# 5 × 5 = 25 is past 17: every composite up to 17 has a factor no bigger than its square root, so it has already been
# struck. The survivors are the primes. Drawn in the one animation format (16 Nov, tools/sa_draw.py); the numbers and
# which are struck are worked out below.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

N = range(2, 18)
W = 23.5
x = lambda n: 12 + (n - 2) * W + W / 2
d = Svg(400, 150)
for n in N:
    d.text(x(n), 50, str(n), size=13)
for p, step, cls in [(2, 's1', 'hot'), (3, 's4', 'cool')]:
    d.g(step); d.circle(x(p), 46, 10, 'pt ' + cls); d.end()
    for m in range(p * p, 18, p):
        if p == 3 and m % 2 == 0: continue
        d.g('s2' if p == 2 and m <= 10 else 's3' if p == 2 else 's5')
        d.line(x(m) - 8, 54, x(m) + 8, 38, 'pt ' + cls, 'stroke-width:2')
        d.end()
d.g('s3'); d.text(100, 84, 'multiples of 2', 'hot', size=12); d.end()
d.g('s5'); d.text(300, 84, 'multiples of 3', 'cool', size=12); d.end()
d.g('s7'); d.text(200, 112, 'next is 5, and 5 × 5 = 25 is past 17: stop', size=11); d.end()
primes = [n for n in N if all(n % k for k in range(2, n))]
d.g('s8'); d.text(200, 138, 'what is left is prime: ' + ' '.join(map(str, primes)), 'cool'); d.end()
anim_row.write_sa('sieve', d.svg('The sieve of Eratosthenes on 2 to 17: what is left is prime'))
