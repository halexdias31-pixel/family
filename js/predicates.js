/* @family. — predicates.js THE SHARED TESTS: pure one-line kind tests every file may call, loaded straight after core.js so none waits on Find. */
/* An item's kind, one rule each (1040); a missing item is never any kind. */
const isQ_ = x => !!x && x.kind === 'question';
const isContent_ = x => !!x && x.kind === 'content';
const isFight_ = x => !!x && x.kind === 'fight';
const isProject_ = x => !!x && x.kind === 'project';
const isShop_ = x => !!x && x.kind === 'shop';
const isPractical_ = x => !!x && x.kind === 'practical';
const isManuscript_ = x => !!x && x.kind === 'manuscript';
const isBoxer_ = x => !!x && x.kind === 'boxer';
const isBible_ = x => !!x && x.kind === 'bible';
const isWriting_ = x => !!x && x.kind === 'writing';
/* A basket line printed on paper, and a question's marking by AI or by its own words list (1040). */
const isPrint_ = c => !!c && c.kind === 'print';
const isAiMark_ = m => !!m && m.kind === 'ai';
const isWordsMark_ = m => !!m && m.kind === 'words';
/* A people column by name: the tutors' cards and the students' (1040). */
const isTutorsCol_ = col => col === 'tutors';
const isStudentsCol_ = col => col === 'students';
