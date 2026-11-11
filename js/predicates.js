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
/* A basket line printed on paper, and a question's marking by AI or by its own words list (1040). */
const isPrint_ = c => !!c && c.kind === 'print';
const isAiMark_ = m => !!m && m.kind === 'ai';
const isWordsMark_ = m => !!m && m.kind === 'words';
/* A people column by name: the tutors' cards and the students' (1040). */
const isTutorsCol_ = col => col === 'tutors';
const isStudentsCol_ = col => col === 'students';
