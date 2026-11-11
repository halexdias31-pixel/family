/* @family. — predicates.js THE SHARED TESTS: pure one-line kind tests every file may call, loaded straight after core.js so none waits on Find. */
/* An item's kind, one rule each (1040); a missing item is never any kind. */
const isQ_ = x => !!x && x.kind === 'question';
const isContent_ = x => !!x && x.kind === 'content';
const isFight_ = x => !!x && x.kind === 'fight';
const isProject_ = x => !!x && x.kind === 'project';
const isShop_ = x => !!x && x.kind === 'shop';
const isPractical_ = x => !!x && x.kind === 'practical';
const isManuscript_ = x => !!x && x.kind === 'manuscript';
/* ONE PEOPLE KIND (batch D): a boxer and a historical figure are both `people`; a boxer is the person Boxing's Fighters answer holds. */
const isPerson_ = x => !!x && x.kind === 'people';
const isBoxer_ = x => isPerson_(x) && x.boxKind === 'Fighters';
const isBible_ = x => !!x && x.kind === 'bible';
const isWriting_ = x => !!x && x.kind === 'writing';
const isMeCard_ = x => !!x && x.kind === 'me';
/* A library row that is a preamble or a whole document, not a question part (1040). */
const isPreamble_ = r => !!r && r.kind === 'preamble';
const isDocument_ = r => !!r && r.kind === 'document';
/* A form field that is a checkbox; a pointer that holds still (mouse or stylus) (1040). */
const isCheckbox_ = el => !!el && el.type === 'checkbox';
const isSteadyPointer_ = c => !!c && (c.type === 'mouse' || c.type === 'pen');
const isPenPointer_ = c => !!c && c.type === 'pen';
const isTouchPointer_ = c => !!c && c.type === 'touch';
/* A file picker, and a hidden field, which holds no typing. */
const isFileBox_ = el => !!el && el.type === 'file';
const isHiddenBox_ = el => !!el && el.type === 'hidden';
/* A basket line printed on paper, and a question's marking by AI or by its own words list (1040). */
const isPrint_ = c => !!c && c.kind === 'print';
const isAiMark_ = m => !!m && m.kind === 'ai';
const isWordsMark_ = m => !!m && m.kind === 'words';
/* A people column by name: the tutors' cards and the students' (1040). */
const isTutorsCol_ = col => col === 'tutors';
const isStudentsCol_ = col => col === 'students';
/* A screen's host that is the screen you are on; the toast now on screen; a sign-in box, its name or its code (owner, 11 Nov). */
const isAtHost_ = h => !!h && h.id === 's-' + AT;
const isToast_ = el => !!el && el.id === 'toast';
const SIGN_IN_BOXES = ['in-name', 'in-pin'];
const isSignInBox_ = el => !!el && SIGN_IN_BOXES.indexOf(el.id) !== -1;
/* A tool laid on a figure (MEAS) rather than held on the pad: the ruler and the protractor. */
const MEASURE_TOOLS = ['ruler', 'protractor'];
const isMeasureTool_ = id => MEASURE_TOOLS.indexOf(id) !== -1;
/* A marker whose answer is tapped options: chosen as a set, or put in order. */
const CHOICE_MARKERS = ['choice', 'order'];
const isChoiceMarker_ = kind => CHOICE_MARKERS.indexOf(kind) !== -1;
/* A suggestion about a person — a message or a post — rather than a file (`suggestPeople_`, submit.js). */
const PEOPLE_SUGGESTS = ['message', 'post'];
const suggestPeople_ = kind => PEOPLE_SUGGESTS.indexOf(kind) !== -1;
/* THE CHIPS ANSWERING ONE FACET, in the order they were picked. */
const chipsOn_ = (fs, field) => (fs || []).filter(f => f && f.field === field);
/* A FIND SCREEN: a finder's column; before Find's files load, the library (stuff) is the one. */
const findIs_ = id => (typeof finderOf_ === 'function' ? !!finderOf_(id) : id === FIND_HOME_);
const FIND_HOME_ = 'stuff';
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
