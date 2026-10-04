# Job-buddy — Answer-Driven Skill Assessment

## Quiz design

The Assessment workflow now uses a nine-question, answer-checked knowledge quiz rather than self-confidence ratings. It evaluates three scored categories:

| Category | Measured through | Example evidence areas |
|---|---|---|
| Technical | Data quality, SQL, and Python multiple-choice questions | Data analysis, SQL, Python, structured data |
| Soft skills | Communication, collaboration, and feedback scenarios | Research writing, professional communication, teamwork |
| Other skills | Reasoning, evidence ethics, prioritisation, and learning-agility scenarios | Decision making, work planning, evidence practice |

Each category score is calculated as the percentage of correct answers in that category. The overall signal is the equally weighted mean of the three category scores. A quiz cannot be submitted until every question has an answer.

## Student-visible result path

1. The student opens **Assessment** and starts a knowledge quiz.
2. The student chooses one response for each scenario.
3. Submission calculates Technical, Soft skills, and Other skills signals, then stores the answer record and result for the prototype.
4. Results display calculated category scores, answer-based strengths, and targeted gaps.
5. Profile and Skill Map explicitly show the latest quiz signals alongside self-declared and verified evidence.

## Verification

Desktop and mobile checks confirmed that the nine-question quiz is legible, required-answer progress is visible, the calculated-results empty state accurately directs students to complete the quiz, and Profile/Skill Map clearly explain where answer-calculated signals appear.

## Production note

The current quiz result uses browser-local prototype storage. Production assessment delivery must persist question versions, responses, scoring versions, access controls, and calculated signals in the approved backend/database.
