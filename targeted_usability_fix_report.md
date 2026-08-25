# SIH Connect — Targeted Usability Fix Report

## Completed targeted fixes

| Reported issue | Repair applied | Verification status |
|---|---|---|
| Dark mode resets after refresh | The shared top navigation now reads and toggles the persisted `ThemeContext` value instead of maintaining a separate local theme state. The global provider already stores the selected theme in local storage. | Code path and TypeScript check passed. |
| One-way preference controls | The profile controls are now accessible on/off switches with an explicit state label, visible thumb, `role="switch"`, and `aria-checked` state. | Desktop render verified. |
| Opportunity search, delivery mode, and reset do not affect results | Search now covers role, organisation, location, status, type, required, and preferred skills. Eligibility and delivery mode are state-bound filters; Reset restores every filter. The result summary updates with the visible count. | Code path and desktop render verified. |
| Crowded highlighted navigation / More presentation | The primary rail has compact spacing, an increased desktop rail width, and a defined More separator/control. The workspace switcher hides earlier at constrained desktop widths instead of colliding with navigation. | Desktop render verified. |
| Application tracker’s action area is not professional | The oversized withdrawal outline is now a quiet confirmation action with supporting text and an intentional confirmation state. The timeline card shrinks to its content and carries a clear next-checkpoint strip. | Desktop render verified. |
| Profile Experience presentation | Evidence rows now include aligned badges, evidence tags, a portfolio action, marker states, and non-stretching status pills. | Desktop render verified. |

## Final validation

The updated Profile Settings, Profile Experience, Opportunities, and Application Tracker views were rendered at both desktop and mobile breakpoints. The refreshed navigation retained the established portal structure, while the targeted refinements remained legible at the small-screen breakpoint. The project also passed TypeScript validation and a production `pnpm build`.

The production bundler retained an existing non-blocking advisory about a client bundle above 500 kB after minification. It does not affect the delivered prototype; route-level code splitting remains a future performance enhancement.
