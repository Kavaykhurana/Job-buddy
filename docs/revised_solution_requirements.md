# Revised SIH Solution Brief — Requirements Baseline

## Authority and scope change

This document records the user’s newest instruction: the solution must support the **complete lifecycle of skill development, internships, and placements**, and every point in the revised brief must be accounted for. The existing UI orientation, olive/off-white visual system, top navigation, and current screens must be preserved; the requirement is to **extend**, not replace, that setup.

This revised brief supersedes the earlier restricted frontend scope where it conflicts. It explicitly brings back capabilities that were previously excluded from the first frontend milestone.

## A. Skill development lifecycle

| ID | Requirement | Required user outcome |
|---|---|---|
| SD-01 | Skill assessment through questionnaires and aptitude tests | A student can complete an industry-shared questionnaire or aptitude test. |
| SD-02 | Technical and soft-skill profiling | The system presents a current, evidence-based skill profile. |
| SD-03 | Strength and skill-gap identification | A student can see strengths and gaps against current industry requirements. |
| SD-04 | Personalized learning and certification recommendations | A student can receive relevant learning, certification, and training recommendations. |
| SD-05 | Career guidance | A student can receive guidance based on skills, interests, and industry demand. |
| SD-06 | Digital portfolio | A student can publish verified skills, certificates, projects, and achievements through a portfolio. |
| SD-07 | Industry-shared assessment inputs | Industry can define or contribute relevant skills, questionnaires, and assessment expectations. |
| SD-08 | Skill Mapping | From assessment results, the platform recommends relevant industries, job roles, and skill-development programs aligned to industry requirements. |

## B. Internship lifecycle

| ID | Requirement | Required user outcome |
|---|---|---|
| IN-01 | Centralized internship portal | Industries can publish internship opportunities with required skills. |
| IN-02 | Internship matching | Students can be matched using their skill profile and career interests. |
| IN-03 | Internship application and tracking | Students can apply, see lifecycle status, and access related records. |
| IN-04 | Academician internships and industrial training | Academicians can discover/apply for relevant industry training opportunities. |
| IN-05 | Faculty Development Programs | Academicians can access and track FDP opportunities. |
| IN-06 | Progress and mentor feedback | Participants and mentors can record or review progress and feedback. |
| IN-07 | Internship completion | Completion records, reports, certificates, and outcomes are retained. |

## C. Placement lifecycle

| ID | Requirement | Required user outcome |
|---|---|---|
| PL-01 | Industry job portal | Industries can publish job opportunities with required qualifications and skills. |
| PL-02 | Placement recommendation engine | Students can see relevant placement opportunities. |
| PL-03 | Candidate shortlisting | Recruiters can shortlist based on compatibility and eligibility. |
| PL-04 | Application tracking and recruitment management | Students and recruiters can manage application stages and recruitment work. |
| PL-05 | Institution and industry dashboards | Institutions and industries can monitor readiness, recruitment outcomes, and skill-demand trends. |

## D. Platform-wide features

| ID | Requirement | Required user outcome |
|---|---|---|
| PF-01 | Role-based access | Students, academicians, industries, and institutions receive role-specific workspaces and controls. |
| PF-02 | Secure document management | Resumes, certificates, internship reports, and academic records are securely uploaded, managed, and selectively shared. |
| PF-03 | Collaboration | Industry mentorship, live projects, workshops, and research partnerships can be coordinated. |
| PF-04 | External integrations | Learning platforms, certification providers, and institutional databases can synchronize relevant records. |
| PF-05 | Comprehensive analytics | Institutions, industries, and policymakers can use governed analytics for data-driven decisions. |

## Revised Skill Assessment and Mapping flow

The following flow is explicitly required as an addition to the current frontend:

1. **Assessment catalogue.** A student selects an industry-shared questionnaire or aptitude test.
2. **Assessment session.** The student answers question sections, saves progress where permitted, and submits.
3. **Results and profile update.** The platform presents technical and soft-skill results, strengths, and gaps against industry requirements.
4. **Skill comparison.** A student can directly compare “skills I have” with “skills this industry/role requires,” including evidence level and gap severity.
5. **Mapping outcomes.** The system recommends industries, job roles, learning programs, certifications, and relevant internship/placement opportunities.
6. **Action routing.** The student can open an opportunity, learning program, certification, or portfolio-evidence action from the relevant recommendation.

## Preservation rule

The current Job-buddy design language remains unchanged: persistent top navigation, warm off-white canvas, Olive Ink rails, evidence-led data panels, role-aware workspaces, and restrained institution-oriented interaction design. New features must follow this grammar and must not become a separate visual product.
