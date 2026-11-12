# The 1MA1 point-by-point book's figures (TB-GCSE-MATHS-1MA1): a still diagram drawn in step by step, then held.
# Each g_<topic>.py lists its steps (SVG pieces) and caption; this writes the row through tools/anim_row.py (`whole=`).
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

BOOK = 'TB-GCSE-MATHS-1MA1'


def pc(t, T): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'


def write(P, chapter, title, about, view, steps, caption, step=1.1, hold=4.0):
    """steps: a list of SVG markup strings, each drawn in after the one before; the last frame is the still."""
    T = 0.6 + step * len(steps) + hold
    html = ['<div class="an-%s" aria-hidden="true">' % P,
            '  <svg class="%s-svg" viewBox="%s">' % (P, view)]
    for k, s in enumerate(steps):
        html.append('    <g class="%s-st %s-s%d">%s</g>' % (P, P, k, s))
    html.append('  </svg>')
    html.append('  <div class="%s-say">%s</div>' % (P, caption))
    html.append('</div>')
    css = ['.an-%s { text-align: center; }' % P,
           '.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P),
           '.%s-ln { fill: none; stroke: var(--paper); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }' % P,
           '.%s-hi { fill: none; stroke: var(--gold); stroke-width: 2.2; stroke-linecap: round; }' % P,
           '.%s-fa { fill: var(--gold); fill-opacity: .25; stroke: var(--gold); stroke-width: 1.4; }' % P,
           '.%s-dash { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; stroke-dasharray: 3 3; }' % P,
           '.%s-dot { fill: var(--gold); }' % P,
           '.%s-t { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; }' % P,
           '.%s-tg { font: 700 10px var(--mono); fill: var(--gold); text-anchor: middle; }' % P,
           '.%s-say { margin-top: .6rem; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P]
    for k in range(len(steps)):
        a = 0.6 + step * k
        css.append('.%s-s%d { animation: %s-s%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
        css.append('@keyframes %s-s%d { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } 100%% { opacity: 0; } }'
                   % (P, k, pc(a, T), pc(a + 0.5, T), pc(T - 0.5, T)))
    css.append('@media (prefers-reduced-motion: reduce) {')
    css.append('  .%s-st { animation: none; }' % P)
    css.append('}')
    anim_row.write_anim(P, html='\n'.join(html), css='\n'.join(css),
                        whole={'book_id': BOOK, 'chapter': chapter, 'title': title, 'about': about})
    print('%s: %d steps' % (P, len(steps)))
