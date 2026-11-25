/* A basket line printed on paper (a part's marking method is the engine's: `markSchemeOf_`, find-marking.js). */
const isPrint_ = c => !!c && c.kind === 'print';
/* A people column by name: the tutors' cards and the students' (1040). */
const isTutorsCol_ = col => col === 'tutors';
const isStudentsCol_ = col => col === 'students';
/* A screen's host that is the screen you are on; the toast now on screen; a sign-in box, its name or its code (owner, 11 Nov). */
const isAtHost_ = h => !!h && h.id === 's-' + AT;
const isToast_ = el => !!el && el.id === 'toast';
const SIGN_IN_BOXES = ['in-name'];
const isSignInBox_ = el => !!el && SIGN_IN_BOXES.indexOf(el.id) !== -1;
/* A tool that floats over the page (`measOpen_`) rather than held on the pad: the ruler and the protractor. */
const MEASURE_TOOLS = ['measure', 'ruler', 'protractor'];
const isMeasureTool_ = id => MEASURE_TOOLS.indexOf(id) !== -1;
/* A marker whose answer is tapped options: chosen as a set, or put in order. */
const CHOICE_MARKERS = ['choice', 'order'];
const isChoiceMarker_ = kind => CHOICE_MARKERS.indexOf(kind) !== -1;
/* THE CHIPS ANSWERING ONE FACET, in the order they were picked. */
const chipsOn_ = (fs, field) => (fs || []).filter(f => f && f.field === field);
/* A FIND SCREEN: a finder's column; before Find's files load, the library (stuff) is the one. */
const findIs_ = id => (typeof finderOf_ === 'function' ? !!finderOf_(id) : id === FIND_HOME_);
const FIND_HOME_ = 'stuff';
