## A qualification says where it was studied, not which exam board set it

**Asked for as *"subject, level, grade and institution such as the name of school, NOT EXAM
BOARD"*.** Each level on the qualification shelf now has:
- **Level** and **Grade**, side by side;
- **School, college or uni**, as a full-width free-text box;
- **Completed**.

`OPTION_FOR` no longer gives `qual_N_board` the exam-board list. On the card a qualification reads
`Maths A-Level grade B at Hill Top School (2019)`.

**The storage slot is still called `board`.** Renaming it inside the packed `quals` cell would strand
every qualification already saved. A value typed before this change still shows, for example
`at Edexcel`, until the tutor replaces it.

Several levels under one subject was already how the shelf works: **Add a level** under the subject.
