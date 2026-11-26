/* @family. — resource.js ONE FILE, SPLIT. § */



/* ---------- ONE RESOURCE, AND NO SHEET FOR IT § */


/* A column name as a person would say it. § */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', document_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
  /* Inside a group already called "Library card", "library card" and "library pin" say the word twice and read as two different § */
  library_card: 'card number', library_pin: 'PIN',
  /* ---------- AND THE TWO EXAMS, IN THE WORDS THEY WERE ASKED FOR IN § */
  exam_small_date: 'small exam', exam_big_date: 'big exam',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');




/* THE WHOLE PAPER, READ FROM THE ROWS THAT ALREADY DRAW ITS QUESTIONS. § */


/* `openPaper_` AND `on('paper-read')` MOVED TO find.js, beside the note explaining why they came back. § */

