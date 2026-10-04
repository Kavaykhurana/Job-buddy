# Job-buddy API Architecture

## Technology baseline

The backend is a **Java 21** Maven service built with **Spring Boot 4.1.1**, the current stable Spring Boot release when this module was created. Spring Boot 4.1.1 supports Java 17 through Java 26 and Maven 3.6.3 or later, making Java 21 and Maven suitable for this build. [1] [2]

| Layer | Decision | Reason |
|---|---|---|
| HTTP API | Spring Web MVC + Spring Security | Mature servlet-based REST API with explicit authorization rules. |
| Persistence | PostgreSQL 16 + Spring Data JPA + Flyway | Relational integrity, transactional workflow state, indexed queries, repeatable migrations. |
| Authentication | Short-lived HMAC-SHA256 JWT access tokens | Fast, stateless validation for protected requests. |
| Session continuity | Rotating, database-backed refresh tokens | Logout, token revocation, rotation, and compromise response remain possible. |
| Password storage | BCrypt via Spring Security | Adaptive one-way password hashing; tune the work factor against the deployment hardware. [3] |
| Runtime | OCI container, non-root user, Java 21 JRE | Portable self-managed deployment with an unprivileged process. |

## Domain and PostgreSQL model

The schema provides the system-of-record foundation for the approved role workflows while keeping placement, internship, project, and apprenticeship opportunities in one extensible model. The current HTTP implementation coverage is stated explicitly below; a table existing in PostgreSQL does not imply that its user-facing REST workflow is already exposed.

| Aggregate | Main tables | Responsibility |
|---|---|---|
| Identity | `users`, `user_roles`, `refresh_tokens`, `audit_events` | Password hash, verified account state, roles, rotating sessions, security audit trail. |
| Organisation | `organizations`, `organization_memberships` | Industry and institution tenancy; recruiter/academician membership boundaries. |
| Student evidence | `student_profiles`, `skills`, `student_skills`, `documents` | Academic profile, declared and verified skills, portfolio/document metadata. |
| Opportunities | `opportunities`, `opportunity_skill_requirements` | Jobs, internships, projects, apprenticeships, eligibility rules, and role requirements. |
| Recruitment | `applications`, `application_stage_history`, `interview_scorecards`, `offers` | Student applications, controlled stage transitions, interviewer evidence, and offers. |
| Assessment and mapping | `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_answers`, `skill_scores` | Answer-derived technical, soft, and other skill signals. |
| Engagement | `events`, `schedules`, `internship_records`, `internship_milestones`, `mentor_feedback` | Events, schedule records, internship monitoring, feedback, and completion. |

## Authorization rules

The API holds five system roles: `STUDENT`, `RECRUITER`, `INSTITUTION`, `ACADEMICIAN`, and `ADMIN`. A user may have more than one role, but every endpoint applies both a role check and record-level ownership/organisation verification.

| Actor | Permitted ownership boundary |
|---|---|
| Student | Own profile, own skills/documents, own attempts, own applications, own schedule. |
| Recruiter | Opportunities, requirements, application reviews, interviews, and offers for organisations where they are an active member. |
| Institution | Student records and aggregate analytics only for its own organisation. |
| Academician | Assigned student evidence, learning alignment, and academic collaboration records within their institution. |
| Admin | Explicit platform governance, account role assignment, and audit access. |

## Token and security lifecycle

1. A successful password login returns a 15-minute signed access token and a 7-day refresh token.
2. Refresh tokens are stored only as SHA-256 hashes. A refresh request rotates the token and revokes the prior record.
3. Logout revokes the active refresh token. Password changes and administrator disablement revoke all user refresh tokens.
4. JWT claims contain immutable user ID, email, roles, issued-at, expiry, issuer, and token ID. They never contain passwords, profile evidence, or personally sensitive attributes.
5. CORS uses an allow-list configured by environment variable, not a wildcard. Spring Security requires deliberate CORS support for a cross-origin browser client. [4]

## API contract outline

| Endpoint group | Examples | Access |
|---|---|---|
| Authentication | `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`; `GET /api/v1/auth/me` | Public except `me` and `logout`. Registration can create only student accounts. |
| Profile | `GET/PUT /api/v1/me/profile` | Student; own record only. |
| Opportunities | `GET /api/v1/opportunities`, `GET /api/v1/opportunities/{id}`, `POST /api/v1/recruiter/opportunities` | Read authenticated; write recruiter within own organisation. |
| Applications | `POST /api/v1/opportunities/{id}/applications`, `GET /api/v1/me/applications`, `PATCH /api/v1/recruiter/applications/{id}/stage` | Student owns application; recruiter owns the opportunity. |

## Current API implementation coverage

| Status | Scope |
|---|---|
| Implemented and verified | Registration and login, access/refresh/logout session lifecycle, `/auth/me`, student profile read/update, opportunity listing/detail, student application creation/listing, recruiter opportunity creation/publishing, recruiter application-stage management, and administrator role/organisation/membership provisioning. |
| Schema-ready, not yet exposed as complete REST workflows | Declared and verified skills, documents, assessment question delivery/scoring, scorecards, offers, events, schedules, internship milestones, mentor feedback, notifications, portfolio visibility, and institution analytics. |

> The React prototype still displays these wider lifecycle journeys with local demonstration state. They need their corresponding API controllers, service logic, authorization tests, and frontend API adapters before they can be described as database-backed production workflows.

## Current frontend technology inventory

The existing portal remains a React 19 + TypeScript 5.6 single-page application. It uses Vite 7 and pnpm for builds, Wouter for routing, Tailwind CSS 4 with shadcn/Radix primitives for the interface, Lucide React for icons, Sonner for notifications, React Hook Form and Zod utilities for forms/validation, Axios as the HTTP client dependency, and Vitest/Prettier for test/format tooling. The Java backend is added as a separate Maven module; it does not replace the frontend stack.

## References

[1] [Spring Boot project page](https://spring.io/projects/spring-boot/)

[2] [Spring Boot 4.1.1 system requirements](https://docs.spring.io/spring-boot/system-requirements.html)

[3] [Spring Security password storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)

[4] [Spring Security CORS guidance](https://docs.spring.io/spring-security/reference/reactive/integrations/cors.html)
