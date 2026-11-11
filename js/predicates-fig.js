/* A PART THAT NAMES A PICTURE HAS ONE (2026-11-11): its words say grid, diagram, table…, and it, a stem or what it `uses`
   carries a drawing, table or surface. One rule for the Verified tag (`verifyTags_`) and js/check-figures.js. */
const FIG_WORDS = /\b(grid|diagrams?|shapes?|tables?|graphs?|charts?|histogram|pictogram|figure|drawn|shown|below|number line|axes|axis|scatter|spinner|protractor|coordinate grid|scale drawing)\b/i;
/* "in figures" and "significant figures" are digits, the National Grid a power network, "below the surface" a depth: none is a picture. */
const FIG_NOT_WORDS = /\b(in figures|national grid|below (?:the )?(?:surface|water|sea|ground|zero|freezing)|[xy]\s*-?\s*axis|significant figures?|figures? (?:on|of) )/gi;
const figWords_ = r => !!r && FIG_WORDS.test(String((r.html || '') + ' ' + (r.lead || '')).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(FIG_NOT_WORDS, ' '));
const figPictured_ = r => !!r && ((typeof r.diagram === 'string' && r.diagram.trim() !== '') ||
  (' ' + String(r.lib_has || '') + ' ').indexOf(' diagram ') !== -1 ||
  /<(table|svg|img)\b/i.test(String(r.html || '') + String(r.lead || '')) || !!r.cells || !!r.surface || figPictured_(r.row));
const figUndrawn_ = (r, around) => figWords_(r) && !figPictured_(r) && !(around || []).some(figPictured_);
