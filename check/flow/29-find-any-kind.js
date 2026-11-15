/* ---------- DOESN'T MATTER AT WHAT KIND FOLLOWS THE ONE RULE (owner 7 Nov) */
check('Find: Doesn\'t matter at the first question keeps the whole list and asks the next facet in the tab\'s order that splits it (one principle, owner 15 Nov) — for a signed-in child and an admin', async () => {
  const bad = [];
  for (const who of [ANS_ADA, RACE_ADMIN_]) {
    const b = await resBoot_({ before: signedInAs_(who) });
    if (!b) return bad.concat([who.role + ': the app did not load — NOT checked']);
    const { w } = b, t = w.__t, S = t.STUFF(), d = w.document;
    t.go('stuff', false, true);
    S.filters.length = 0;     const all = w.stuffFiltered();
    const inOrder = list => w.facetList().find(f => !S.filters.some(c => c.field === f.field) && !w.facetWhy_(list, f)) || null;
    const first = w.nextFacet(all), want0 = inOrder(all);
    if (!first || first !== want0) { bad.push(who.role + ': the first question is ' + (first && first.field) + ', the tab\'s order asks ' + (want0 && want0.field)); continue; }
    S.filters.push({ field: first.field, any: true });
    w.paintStuff();
    const list = w.stuffFiltered();
    if (list.length !== all.length) bad.push(who.role + ': Doesn\'t matter at ' + first.field + ' left ' + list.length + ' of ' + all.length + ' — it narrowed the list');
    const want = inOrder(list), got = w.nextFacet(list);
    if ((got && got.field) !== (want && want.field)) bad.push(who.role + ': after Doesn\'t matter Find asks ' + (got && got.field) + ', the tab\'s order asks ' + (want && want.field));
    const drawn = [...d.querySelectorAll('#s-stuff [data-do="facet-pick"]')].map(el => el.dataset.field);
    if (got && drawn.length && drawn.some(f => f !== got.field)) bad.push(who.role + ': the page draws answers of ' + [...new Set(drawn)].join(', ') + ', not of ' + got.field);
  }
  return bad;
});
