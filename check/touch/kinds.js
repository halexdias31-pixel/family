/* PER KIND OF CONTROL, REPORTED (531): how many press in with an eased transform (U9 wants frame 1), and how many have selectable words or a callout (D12). Package E gates these. */
module.exports = {
  name: 'kinds',
  what: 'press-in, selection and callout per kind of control (report)',
  report: true,
  run: async page => {
    const cs = await page.evaluate(() => (window.__touch ? __touch.controls() : null));
    if (!cs || !cs.length) return null;
    const by = {};
    cs.forEach(c => {
      const k = by[c.kind] = by[c.kind] || { n: 0, eased: 0, select: 0, callout: 0 };
      k.n++;
      const props = c.props.split(/,\s*/), durs = c.durs.split(/,\s*/);
      if (props.some((p, i) => /^(transform|scale|all)$/.test(p) && parseFloat(durs[i % durs.length]) > 0)) k.eased++;
      if (c.select !== 'none') k.select++;
      if (c.callout && c.callout !== 'none') k.callout++;
    });
    return Object.keys(by).sort().map(k => `${k} ×${by[k].n}: ${by[k].eased} ease their press, ${by[k].select} selectable, ${by[k].callout} with a callout`);
  },
};
