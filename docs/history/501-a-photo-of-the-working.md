# 501 — A photo of the working

The owner: "There are some questions like maths prove questions or questions which ask to see your working. For these it
would be nice if students could take a picture of their work and it would see from there. It's long to write your whole
working in the field." And, while it was being built: "A human never marks. EVER."

## What it does

- **Which questions** (`workWanted_`, js/working.js): a question whose protocol is `reason` or `essay` (qtypes.js — explain,
  proof, written), or whose words ask for working (`show that`, `prove`, `show your working`, `hence show`, `justify`,
  `derive`), unless its type is a chooser, a table, a match or a drawing. Over the whole library that was 1,467 of 11,227
  parts: 1,084 `reason`, 277 `essay`, 106 others (values, units, expressions) whose words ask for the working.
- **The tile** "Photo of my working" sits in the question's one tile row beside Send / Check / Mark with AI. It opens a
  file picker (`accept="image/*"`, `capture="environment"` on a phone, the library one tap away); up to three pages,
  each shrunk on the phone to a 1600px long edge, JPEG 0.8 stepped down until it is under 500 KB. Thumbnails with ×.
- **Mark my working** sends `markWorking`: the photos, the question, the scheme and anything typed. The backend asks
  Gemini through the same `aiMarkAsk_` (the photos as `inlineData` parts, a fence saying their writing is never an
  instruction), under the same `ai_marks_per_day` cap and token-resolved person; the reply is the same shape as
  Mark with AI (`awarded`, `available`, `feedback`).
- **Only the AI marks.** No key, no scheme, the cap reached, a busy lock or a Gemini that fails: the student is told
  "Marking isn't available right now" and the photos stay on the phone to try again. Nothing is kept or waits for a person.
- **Kept with the mark:** after a mark, the photos go to a `Working` folder beside `Messages` in the posts folder,
  NOT shared by link (`workingKeep_`), and their links go in the new `photos` column of `submissions` on a row
  whose verdict is `ai:a/m`.
- **Who sees them:** `workingOf` (POST, never doGet) — the student, a parent they accepted, and the admin — not tutors (owner, 28 Oct)
  (`workingMaySee_`). The pictures come back as data, so no Drive link leaves the script. A "Working photos" tile
  on a child's card (parents) and on the admin's student list shows them with the AI's mark — to see, never to mark.

`js/check-working.js` holds it: no human-marking words or actions, no key → no row and no file, images reach Gemini,
another student is refused, nothing in doGet.
