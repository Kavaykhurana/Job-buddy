# SIH Connect — Account Access and Declared Skills Update

## Added user-facing capabilities

| Capability | Current prototype behavior |
|---|---|
| Sign-in | `/sign-in` presents a role-specific sign-in screen for Student, Industry, Institution, or Academician demonstration access. |
| Prototype session | Continuing from sign-in stores the selected role and account identifier in session storage, then opens the appropriate workspace. |
| Sign-out | The top-right account control now opens a workspace menu with a visible **Sign out** action that clears the prototype session and returns to sign-in. |
| Student-declared skills | Students can add and remove technical or soft skills in **Profile → Overview → Declared skills**. These values are retained in local storage for the prototype. |
| Mapping visibility | **Skill Map** displays the declared skills next to the role/industry/learning alignment results and explains that they are considered alongside verified evidence and assessment results. |

## Verification

The sign-in page, Profile declared-skills register, and Skill Map declared-evidence panel were verified at desktop and mobile breakpoints. The mobile view preserves a readable role selection, add/remove skill controls, and visible evidence context.

## Production note

The current account access is intentionally a prototype flow. Production sign-in, sign-out, session handling, and role permissions must use the approved identity provider and backend authorization services.
