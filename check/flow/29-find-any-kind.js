/* ---------- DOESN'T MATTER AT WHAT KIND FOLLOWS THE ONE RULE (owner 7 Nov) */
check('Find: Doesn\'t matter at What kind keeps the whole list and asks what the one rule asks — the best split of those let through, its coarser question first — for a signed-in child and an admin', async () => {
  const bad = [];
  for (const who of [ANS_ADA, RACE_ADMIN_]) {
    const b = await resBoot_({ before: signedInAs_(who) });
    if (!b) return bad.concat([who.role + ': the app did not load — NOT checked']);
    const { w } = b, t = w.__t, S = t.STUFF(), d = w.document;
    t.go('stuff', false, true);
    S.filters.length = 0; S.q = '';
    const all = w.stuffFiltered();
    const first = w.nextFacet(all);
    if (!first || first.field !== 'kindLabel') { bad.push(who.role + ': the first question is ' + (first && first.field) + ', not What kind — NOT checked'); continue; }
    S.filters.push({ field: 'kindLabel', any: true });
    w.paintStuff();
    const list = w.stuffFiltered();
    if (list.length !== all.length) bad.push(who.role + ': Doesn\'t matter at What kind left ' + list.length + ' of ' + all.length + ' — it narrowed the list');
    /* THE RULE, RE-DERIVED HERE: of the questions facetWhy_ lets through, choose/kind-named ones first, else the most bits, then its coarser one. */
    const ok = w.facetList().filter(f => f.field !== 'kindLabel' && !w.facetWhy_(list, f));
    const lead = ok.find(f => f.choose || w.kindNamed_(w.facetValues(list, f)));
    let want = lead || ok.reduce((a, f) => (!a || w.facetBits_(list, f) > w.facetBits_(list, a) ? f : a), null);
    for (let hop = 0; !lead && want && hop < 4; hop++) {
      const up = ok.filter(f => f !== want && w.facetInside_(want, f, list) && !w.facetInside_(f, want, list))
        .reduce((a, f) => (!a || w.facetBits_(list, f) > w.facetBits_(list, a) ? f : a), null);
      if (!up) break;
      want = up;
    }
    const got = w.nextFacet(list);
    if ((got && got.field) !== (want && want.field)) bad.push(who.role + ': after Doesn\'t matter at What kind Find asks ' + (got && got.field) + ', the one rule asks ' + (want && want.field));
    const drawn = [...d.querySelectorAll('#s-stuff [data-do="facet-pick"]')].map(el => el.dataset.field);
    if (got && drawn.length && drawn.some(f => f !== got.field)) bad.push(who.role + ': the page draws answers of ' + [...new Set(drawn)].join(', ') + ', not of ' + got.field);
    /* What kind's own finer questions (Which, Level) are never its echo after Any (660). */
    if (got && /^(kindOwn|level|keystage)$/.test(got.field)) bad.push(who.role + ': after Any kind Find re-asks What kind finer as ' + got.field);
  }
  return bad;
});
