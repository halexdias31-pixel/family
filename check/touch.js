#!/usr/bin/env node
/* @family. — check/touch.js WHAT A FINGER MEETS (531): the computed style of every control, by kind, probed while each scenario in check/touch/ runs. */
/* Visitors out/student/admin at 320 and 390 (a touch screen) and 1280 (a mouse). --only=<scenario> --width=<px> --as=<visitor> -v. Port: TOUCH_PORT. */
'use strict';
require('./quiet');
const glass = require('./glass.js');

/* THE INSTRUMENT: `__touch.controls()` — every control on the column in front and in the chrome, with its kind and the styles a press depends on. */
function instrument() {
  const KINDS = [['tile', '.tile'], ['button', 'button, .btn, [role="button"]'], ['chip', '.chip'], ['link', 'a[href]'],
                 ['summary', 'summary'], ['label', 'label'], ['data-do', '[data-do]']];
  const T = window.__touch = {};
  T.kindOf = el => { for (const [k, sel] of KINDS) if (el.matches(sel)) return k; return null; };
  T.controls = () => {
    const front = document.querySelector('#s-' + (typeof AT === 'string' ? AT : '') + ' > .page.on');
    const roots = [front].concat([...document.body.children].filter(e => !e.closest('#screen')));
    const seen = new Set(), out = [];
    roots.filter(Boolean).forEach(r => r.querySelectorAll(KINDS.map(k => k[1]).join(',')).forEach(el => {
      if (seen.has(el)) return; seen.add(el);
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const cs = getComputedStyle(el);
      out.push({ kind: T.kindOf(el), cls: (el.className && el.className.baseVal == null ? String(el.className) : '').split(' ').slice(0, 2).join('.'),
                 flash: cs.webkitTapHighlightColor, select: cs.userSelect || cs.webkitUserSelect, callout: cs.webkitTouchCallout || '',
                 touchAction: cs.touchAction, props: cs.transitionProperty, durs: cs.transitionDuration, w: b.width, h: b.height });
    }));
    return out;
  };
}

glass.run({ tag: 'touch', dir: 'touch', portVar: 'TOUCH_PORT', init: instrument,
            green: 'every control answers a finger' })
  .catch(e => { console.error('touch: ' + e.stack); process.exit(2); });
