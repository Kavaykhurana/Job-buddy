# Job-buddy — Full Lifecycle UI Extension Plan

## Preservation contract

All existing routes, current top-navigation labels, page structure, paper-canvas visuals, Olive Ink rails, role dashboards, and original student/recruiter/institution/academician flows remain intact. The expanded solution is introduced through additional contextual routes and role-specific navigation entries; no existing feature is replaced or removed.

## New student capability families

| Family | New route concepts | Brief coverage |
|---|---|---|
| Skill Assessment | `/assessment`, `/assessment/:id`, `/assessment/:id/results`, `/skill-gaps`, `/skill-compare/:target` | Questionnaires, aptitude tests, technical/soft-skill results, strengths/gaps, and direct “my skills vs. requirements” comparison. |
| Mapping and guidance | `/skill-map/industries`, `/skill-map/roles`, `/skill-map/learning`, `/career-guidance` | Existing maps retained; career interests and demand context added. |
| Learning and credentials | `/learning`, `/learning/:id`, `/learning/progress`, `/certifications` | Training, certifications, industry-relevant programs, enrolment/progress, and credentials. |
| Portfolio and documents | `/portfolio`, `/portfolio/settings`, existing profile document/resume routes | Verified skills, certificates, projects, internships, achievements, evidence, and visibility. |
| Internships | `/internships`, `/internships/:id`, `/internships/:id/apply`, `/internships/matches`, `/internships/engagement/:id`, `/internships/completion/:id` | Centralized portal, matching, application, mentor, milestones, progress, feedback, reports, and completion. |
| Collaboration | `/collaboration`, `/collaboration/:id`, `/mentorship` | Mentorship, live projects, workshops, and research partnerships. |

## New industry/recruiter capability families

| Family | New route concepts | Brief coverage |
|---|---|---|
| Opportunity publishing | `/recruiter/jobs/new`, `/recruiter/internships`, `/recruiter/internships/new` | Job/internship postings with qualifications and skills. |
| Assessments | `/recruiter/assessments`, `/recruiter/assessments/new` | Industry-shared questionnaires, aptitude tests, versions, and criteria. |
| Internship management | `/recruiter/internships/:id/engagements`, `/recruiter/mentors` | Candidate matches, mentor assignment, milestone/progress review, feedback, completion. |
| Collaboration and analytics | `/recruiter/collaboration`, `/recruiter/analytics`, `/recruiter/integrations` | Mentorship/projects/workshops/research, recruitment outcomes, demand trends, provider links. |

## New academician and institution capability families

| Family | Main role | New route concepts | Brief coverage |
|---|---|---|---|
| Academic opportunities | Academician | `/academician/opportunities`, `/academician/training`, `/academician/fdps` | Faculty internships, industrial training, FDPs, consultancy, and research opportunities. |
| Academic collaboration | Academician | `/academician/collaboration` | Mentorship, workshops, live projects, research partnerships. |
| Curriculum/learning alignment | Institution and academician | Existing alignment plus `/institution/curriculum`, `/academician/learning-alignment` | Curriculum and industry skill demand comparison, learning alignment. |
| Analytics | Institution and industry | `/institution/analytics`, `/recruiter/analytics`, `/policy-analytics` | Readiness, outcomes, skill demand, governed reporting. |
| Integrations | Institution | `/institution/integrations` | Learning platforms, certification providers, institutional systems, sync state. |

## Navigation approach

The current primary navigation remains visible. To keep the top bar usable, new student capability families use one added **Development** entry that opens a context hub for Assessment, Skill Gaps, Learning, Certifications, Career Guidance, and Portfolio. Internship and Collaboration are added as compact top-level entries because they are lifecycle pillars. Existing Jobs, Events, Calendar, My Season, Schedule, Offers, My Placement, and Profile remain unchanged.

For role workspaces, current links remain and a small number of additional contextual entries are added: Industry adds Internships, Assessments, Collaboration, Analytics, and Integrations; Academician adds Opportunities, Training & FDPs, and Collaboration; Institution adds Curriculum, Analytics, and Integrations.

## Build sequence

1. Build assessment, assessment-result, strengths/gaps, direct comparison, and career-guidance pages.
2. Build learning/certification, portfolio, and extended-document pages.
3. Build student/industry internship discovery through completion pages.
4. Build opportunity posting, assessment authoring, mentor/recruitment scorecards, academician opportunities, and collaboration hubs.
5. Build analytics/integration/policy reporting routes and complete the final traceability audit.
