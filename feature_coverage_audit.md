# Job Buddy Frontend — Strict Final-Scope Audit

## Audit result

The current frontend **does not yet cover every approved feature as a complete, user-operable workflow**. It covers the full base orientation and the majority of the approved placement, recruitment, and skill-mapping interface, but several supporting capabilities are either only represented visually or are not yet exposed through a dedicated screen.

The existing visual set has **not been changed** as part of this audit.

## Coverage by approved feature

| Approved feature | Current interface evidence | Coverage status | Audit note |
|---|---|---|---|
| Home dashboard and visible summary areas | `/` | Complete UI | Includes application, evaluation, offer, profile, attention, journey, schedule, eligible-opportunity, and feedback surfaces. |
| Top navigation: Home, Jobs, Events, Calendar, My Season, Schedule, Offers, My Placement, Profile | Persistent top navigation | Complete UI | All approved student navigation items have a dedicated route. |
| Jobs: search and filtering | `/jobs` | Partial | Text search and eligibility filtering work. Delivery mode and some requested filters are displayed but not connected to results in the static frontend. |
| Opportunity detail and published requirements | `/jobs/:id` | Complete UI | Shows organisation, opportunity context, required/preferred skills, eligibility state, and profile signal. |
| Student skill versus company-required skills | `/jobs/:id` | Complete UI | The **Skill requirements** table compares required/preferred company skills with the student’s evidence state: Verified, Current, or Developing. This is present, but nested under Jobs → Review rather than exposed as a top navigation item. |
| Direct student application | `/jobs/:id/apply` and `/jobs/:id/submitted` | Complete UI / static data | Dedicated application form, document selection area, eligibility summary, confirmation state, and application snapshot explanation are present. File attachment and submission are not connected to the existing backend yet. |
| Application tracking | `/season`, `/applications/:id` | Complete UI | Includes current stage, structured stage history, eligibility, skill compatibility, and application record context. |
| Candidate shortlisting | `/recruiter/candidates`, `/recruiter/candidates/:id`, `/recruiter/shortlists` | Partial | Dedicated screening, checklist, recruiter note, shortlist, and next-step UI exists. Shortlisting displays feedback but does not persist a state change without the backend connection. |
| Interviews and recruitment management | `/recruiter/interviews`, candidate review | Partial | Schedule, evaluators, recruitment note, candidate progression, and stage context are visible. A dedicated post-interview feedback/scoring form is not yet implemented. |
| Industry skill requirements | `/recruiter/skill-requirements` | Complete UI | Shows role-linked skills, level, required/preferred status, demand signal, and eligible-candidate count. |
| Skill mapping to industries | `/skill-map/industries` | Complete UI | Dedicated evidence-led industry-alignment screen. |
| Skill mapping to job roles | `/skill-map/roles` | Complete UI | Dedicated role-alignment screen. |
| Skill mapping to learning programs | `/skill-map/learning` | Complete UI | Dedicated learning-alignment screen with gap-focused program options. |
| Student academic and eligibility information | `/profile`, `/profile/documents`, recruiter candidate review | Complete UI | Academic measures, document state, eligibility checklist, and profile evidence are represented. |
| Student skill profile data | `/profile`, `/profile/experience`, skill-map routes | Complete UI | Skills, evidence, current/developing state, and role/industry alignment are represented. |
| Skill questionnaire and aptitude-test input | None | Missing UI | The final scope requires assessment input as a support capability. The current frontend has no assessment/questionnaire or aptitude-test screen. |
| Opportunity requirements | `/jobs/:id`, `/recruiter/skill-requirements` | Complete UI | Student and recruiter perspectives are both represented. |
| Eligibility and compatibility review | Job detail and `/recruiter/candidates/:id` | Complete UI | Explicit eligibility checks and a compatibility score are present. |
| Application documents and portfolio references | `/profile/documents`, `/profile/resumes`, `/jobs/:id/apply` | Partial | Document and resume interfaces exist. A dedicated portfolio-reference/visibility surface is not currently exposed. |
| Application and recruitment history | `/applications/:id`, recruiter candidate review | Complete UI | Student and recruiter both see stage history; the screen is backed by demonstration data until integration. |
| Calendar and schedule integration | `/calendar`, `/schedule`, `/events` | Complete UI | Dedicated screens are present, with schedule details and event contexts. |
| Offers and placement status | `/offers`, `/placement` | Complete UI | Dedicated surfaces exist. The offers screen correctly shows an empty state when no offer is recorded. |
| Notification and reminder access | Header notification control | Partial | The control is visible, but there is no notification-center page or activity drawer yet. |
| Role-aware interfaces | Student, recruiter, institution, academician routes | Complete UI | Each role has its own dashboard/navigation patterns appropriate to the approved scope. Authentication and real permission enforcement require backend integration. |
| Audit and privacy controls | `/profile/settings` | Partial | Privacy explanation and control are represented, but access history, consent history, and data-request interfaces are not exposed as dedicated UI flows. |

## Exact answer on skill mapping

The student-versus-company comparison **is implemented**, in two connected ways. First, the student sees each company’s required and preferred skills against their own evidence on the opportunity-detail screen. Second, a recruiter sees published skill requirements and a candidate’s compatibility score, evidence, and eligibility checklist. The three finalized mapping destinations—industries, job roles, and learning programs—also have separate student screens.

The comparison is not yet a single standalone “Skills I have vs. Skills the company requires” dashboard in the top menu. It is currently located under the relevant opportunity, which is valid for the final scope but less immediately discoverable.

## Items that require implementation before claiming full functional coverage

1. A dedicated skill-questionnaire and aptitude-test flow, including questions, submission, results, and profile-update context.
2. A dedicated post-interview evaluation screen for evaluator feedback, technical/soft-skill scoring, recommendation, and recorded outcome.
3. Real backend integration for search filters, applications, document upload, shortlisting, interview management, notifications, role access, and all state persistence.
4. A notification-center experience and a portfolio-reference/visibility surface if those support capabilities must be operated directly by users.
5. Optional but useful: a directly linked “company requirement comparison” entry from Jobs or Profile, without creating a new unapproved module.

## Scope protection

No excluded modules—career guidance, industry internships, live projects, apprenticeships, a standalone entry-level-job/placement category, faculty internships, industrial training, or FDPs—are present in the frontend.

## Render verification evidence

The following student routes were rendered successfully in the desktop review with no surfaced TypeScript or route-rendering errors: Home, Jobs, opportunity detail, direct application, application confirmation, My Season, application tracker, Profile, Events, Calendar, Schedule, Offers, My Placement, Profile Documents, Profile Resumes, and Profile Experience.

The profile Settings and all three student skill-mapping routes also rendered successfully. The recruiter workspace rendered successfully for Overview, Opportunity Requirements, Candidate List, Candidate Review, Shortlists, Interviews, and Industry Skill Requirements. The institution workspace rendered successfully for Overview, Student Readiness, Applications, Interviews, and Placement Status.

The final desktop review rendered all 38 non-fallback prototype routes, including Institution Skill Alignment and all Academician routes. The current project also passed `pnpm check` with no TypeScript errors.
