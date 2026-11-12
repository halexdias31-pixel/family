# A frequency tree (1MA1 P1): 60 students split by walking or not, then by late or on time; the counts leaving a
# point add up to the count at it. Writes its row through tools/g_figkit.py; edit and re-run: python3 tools/g_freqtree.py
import g_figkit

P = 'gftree'


def node(x, y, n, name=''):
    s = '<rect class="%s-fa" x="%d" y="%d" width="26" height="16" rx="3"/><text class="%s-t" x="%d" y="%d">%s</text>' % (P, x - 13, y - 8, P, x, y + 4, n)
    return s + ('<text class="%s-tg" x="%d" y="%d">%s</text>' % (P, x, y - 12, name) if name else '')


def edge(a, b): return '<path class="%s-ln" d="M%d %dL%d %d"/>' % (P, a[0] + 13, a[1], b[0] - 13, b[1])


R, W, N = (24, 76), (104, 42), (104, 112)
L1, O1, L2, O2 = (196, 22), (196, 62), (196, 96), (196, 136)
steps = [
    node(R[0], R[1], 60, 'all'),
    edge(R, W) + edge(R, N) + node(W[0], W[1], 25, 'walk') + node(N[0], N[1], 35, 'not walk'),
    edge(W, L1) + edge(W, O1) + node(L1[0], L1[1], 10, 'late') + node(O1[0], O1[1], 15, 'on time'),
    edge(N, L2) + edge(N, O2) + node(L2[0], L2[1], 7, 'late') + node(O2[0], O2[1], 28, 'on time'),
]
g_figkit.write(P, 10, 'A frequency tree', 'Frequency tree', '0 0 220 150', steps,
               '25 + 35 = 60<br>10 + 15 = 25 &nbsp; 7 + 28 = 35')
