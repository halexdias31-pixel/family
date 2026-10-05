## The quizzes were deleted, and the question card kept their option styling under its own name

The owner: "completely delete the quizes part i dont give a shit about that. delete all quizes shit. completely made up bullshit."

The recap quizzes were written for the site rather than taken from any exam paper, which is exactly
what the owner objected to: a learner could not tell them from real questions. Deleted outright —
`data/quizzes.json`, the generators in `tools/quiz_*.py` and `quizwrite.py`, the kind in Find, the
card, the print sheet, `check-quizzes.js`, the `quizzes` key in `doGet`, and their CSS.

The one thing kept: the question card's multiple-choice options had borrowed the quizzes' classes
(`.quiz-opts`/`.quiz-opt`). They are renamed `.qp-opts`/`.qp-opt`, not deleted, so a
multiple-choice past-paper question still draws its options.

Backend changed (`doGet` no longer sends `quizzes`), so the four stamps were bumped together.
