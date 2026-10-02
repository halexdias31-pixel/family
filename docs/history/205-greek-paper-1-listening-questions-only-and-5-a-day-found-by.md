## Greek Paper 1 (Listening), questions only, and 5-a-day found by month and day

**Asked for as "i added another greek paper … i dont care that we dont have the audio at the
moment … but at least we can do questions".** `tools/greek/write.py` writes both Edexcel 1GK0
listening papers: Foundation June 2019 and Higher November 2020. That is 78 questions and 50 marks
each, asserted against the cover. **Every `answer` is empty on purpose.** A listening answer is a
fact about a recording nobody here has heard, and neither mark scheme is in Drive. Each paper
carries one paper-scoped preamble saying the recording is not in the app. It is marked
`placeholder: True`, so `check-library.js` lists it until it is replaced. The Higher cover says
June 2020, but that series was cancelled and the paper was sat in November, so it has no
`exam_date`. `Greek` joined `VOCAB.subject` and a `Languages` row in `SUBJECT_BUCKET`.

**5-a-day** was reported as "mad on the finder". The Paper question drew seven letter ranges over
214 days. It now has three questions straight after Type, which only 5-a-day rows answer, so the
coverage rule hides them everywhere else:
- **`fiveLevel`**: Foundation, Foundation Plus, Higher or Higher Plus. It is skipped while only the
  Foundation books exist.
- **`fiveMonth`**: the month, read off the paper id (`P-CBM-5AD-F-0601`).
- **`fiveDay`**: the day, grouped into weeks, labelled `8 August`, and held behind Month.

A facet may now declare `orderOf`, because month names sorted alphabetically put August first.
