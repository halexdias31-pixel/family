/* @family. — predicates.js PURE KIND TESTS, loaded right after core.js so none waits on Find. § */
/* A missing item is never any kind. */
const isQ_ = x => !!x && x.kind === 'question';
const isContent_ = x => !!x && x.kind === 'content';
const isFight_ = x => !!x && x.kind === 'fight';
const isProject_ = x => !!x && x.kind === 'project';
const isShop_ = x => !!x && x.kind === 'shop';
const isPractical_ = x => !!x && x.kind === 'practical';
const isManuscript_ = x => !!x && x.kind === 'manuscript';
/* ONE PEOPLE KIND: boxers and historical figures are both `people`. § */
const isPerson_ = x => !!x && x.kind === 'people';
const isBoxer_ = x => isPerson_(x) && x.boxKind === 'Fighters';
const isBible_ = x => !!x && x.kind === 'bible';
const isWriting_ = x => !!x && x.kind === 'writing';
const isMeCard_ = x => !!x && x.kind === 'me';
/* Library rows that are not a question part. */
const isPreamble_ = r => !!r && r.kind === 'preamble';
const isDocument_ = r => !!r && r.kind === 'document';
/* A pointer that holds still: mouse or stylus. */
const isCheckbox_ = el => !!el && el.type === 'checkbox';
const isSteadyPointer_ = c => !!c && (c.type === 'mouse' || c.type === 'pen');
const isPenPointer_ = c => !!c && c.type === 'pen';
const isTouchPointer_ = c => !!c && c.type === 'touch';
/* A hidden field holds no typing. */
const isFileBox_ = el => !!el && el.type === 'file';
const isHiddenBox_ = el => !!el && el.type === 'hidden';
