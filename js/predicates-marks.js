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
const SIGN_IN_BOXES = ['in-name'];
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
