# SIH Connect — Design Blueprint

## Reference orientation as ground truth

The supplied placement-portal screenshots are the structural reference: a calm top navigation bar; a wide but contained desktop workspace; an information-dense student home dashboard; compact statistic cards; a placement journey; schedule and offer surfaces; and an editable profile area with tabs, progress, academic details, contacts, and skill links. The implementation will preserve this **orientation and usability model** while using original branding, copy, spacing rhythm, card proportions, and an olive/off-white design system. It will not reproduce the reference visual identity, content, or exact layout.

## Chosen approach — Field Notes Institutional Workspace

### Design movement

Contemporary institutional software with **editorial utility**: a quieter blend of university registry systems, linear workspaces, and paper-led information design. It uses the supplied warm-light theme as an input but shifts the primary action color to a deep olive rather than blue.

### Core principles

1. **Operational clarity first.** Every section answers a placement task: discover, apply, track, schedule, review, or map skills.
2. **Document-like calm.** Warm off-white canvas, white working surfaces, hairline borders, and deliberately restrained elevation make dense information easy to scan.
3. **Role-specific context.** Student, recruiter, institution, and academician workspaces share a navigation grammar but carry different metrics, actions, and data density.
4. **Evidence over decoration.** Status, eligibility, skill alignment, and recruitment stages use compact labels, progress indicators, and structured tables rather than ornamental graphics.

### Color philosophy

The base is **paper off-white** (`#F5F4EE`) with white cards, warm graphite typography, and a distinctive **olive ink** (`#415642`) as the ownable primary color. A muted eucalyptus tint supports secondary surfaces; one warm ochre accent signals review-required or pending states. Color is semantic and sparse—never decorative noise.

### Layout paradigm

The application uses a persistent, full-width top utility bar with a contained content rail below. On desktop, pages adopt an asymmetric operational layout: a broad primary work column for tables/forms and a narrower context column for journey, schedule, status, or filters. On smaller screens, the menu becomes horizontally scrollable and contextual panels stack beneath the main work area.

### Signature elements

1. **Olive underlines and hairline rails** identify active navigation, section states, and current process stages.
2. **Field-note panels** combine small uppercase metadata, clear numerical values, and softly tinted status strips.
3. **Threaded progress trails** make application, interview, and skill-matching lifecycle state visible without heavy charts.

### Interaction philosophy

Interactions are deliberate and administrative. Hover effects are limited to subtle surface shifts, links, and compact action affordances. Forms remain visibly structured; application and screening actions require clear confirmation. Demonstration controls show contained in-app feedback only—no unscoped features or invented workflows.

### Animation

Motion is subtle and functional: 140–180ms opacity/transform transitions, no bouncy effects, no full-page animated backgrounds. Content groups may ease upward a few pixels when first viewed; progress and tab indicators animate only on state changes. The implementation respects reduced-motion preferences.

### Typography system

**Manrope** is used for clear, compact UI labels and navigation; **Source Serif 4** is reserved for short contextual notes and empty-state explanations. Manrope weights 500–750 establish hierarchy. Large display type is avoided in favor of administrative scale: 26–30px page headers, 18–20px section headings, 13–15px operational body text.

### Brand essence

**SIH Connect is the role-aware workspace that helps institutions turn student skill evidence into transparent placement progress.**

Personality: **measured, supportive, accountable**.

### Brand voice

The voice is concise, factual, and action-led. Headlines name the current work; microcopy explains the next step without marketing language.

- “Review the opportunities your current profile qualifies for.”
- “Your skill map is current. Two role requirements need attention.”

### Wordmark and logo

The logo is an abstract, text-free **interlocking field mark**: three vertical olive segments joined by a small ochre bridge, representing institution, learner, and industry alignment. The wordmark “SIH Connect” is set in Manrope 700 with wide but controlled letter spacing. The mark is used at a clearly visible 32px scale in the header and as the favicon.

### Signature brand color

**Olive Ink — `#415642`**.

## Design-system specification

| Token | Value | Intended use |
|---|---|---|
| Canvas | `#F5F4EE` | Page background |
| Surface | `#FFFFFF` | Cards, tables, input surfaces |
| Olive Ink | `#415642` | Primary actions, active navigation, positive status |
| Olive Wash | `#E8EEE4` | Selected states and secondary surfaces |
| Graphite | `#252824` | Primary text |
| Warm Slate | `#68706A` | Secondary text |
| Rule | `#DFE1D8` | Hairline borders and separators |
| Ochre Note | `#B77A20` | Pending/review-required accent only |
| Radius | `8px` / `12px` | Controls / cards |
| Spacing unit | `4px` | All composition spacing |

## Information architecture and scope guardrails

### Student navigation

Home, Jobs, Events, Calendar, My Season, Schedule, Offers, My Placement, Profile.

### Student flows

1. Jobs list → filter rail → opportunity detail → direct application → submission confirmation → application tracker.
2. Home or My Season → application detail → status history → interview detail → offer detail, when applicable.
3. Profile → overview → academic details / documents / resumes / experience / settings.
4. Profile → skill map → industry, role, and learning-program alignment panels.
5. Calendar or Schedule → schedule detail for evaluations, interviews, events, and deadlines.

### Recruiter navigation and flows

Recruiter Dashboard, Opportunities, Candidates, Shortlists, Interviews, Skill Requirements. The recruiter workspace supports the approved candidate shortlisting and interview/recruitment-management scope only.

### Institution navigation and flows

Institution Dashboard, Student Readiness, Applications, Interviews, Placement Status, Skill Alignment. It monitors only the approved placement and skill-mapping workflows.

### Academician navigation and flows

Academic Dashboard, Student Skill Maps, Learning Alignment, Events, Profile. It supports visibility into student skills and learning-program alignment without adding excluded faculty-internship, industrial-training, or FDP modules.

### Explicit exclusions

No standalone career-guidance module, industry-internship module, live-project module, apprenticeship module, standalone entry-level-job/placement category, faculty-internship module, industrial-training module, or FDP module will be added.

## Implementation reminder

Every page, component, and stylesheet will include a short comment referring to this “Field Notes Institutional Workspace” design system so implementation decisions remain aligned with the chosen philosophy.

## Style Decisions

- Every major page carries an olive or role-context hairline rail through the page-intro composition, together with uppercase metadata, a structured status strip, or a threaded progress trail.
- Role workspaces keep the shared top navigation and paper-card grammar while differentiating operational emphasis: student journey trails, recruiter screening rails, institution readiness/reporting rails, and academician learning-alignment rails.
- Generated imagery remains limited to muted paper diagrams, institutional linework, evidence maps, and olive/ochre schematic details. No generic corporate figures, decorative gradients, or unrelated lifestyle imagery are used.
- Dashboard lead copy names the student's current placement state or immediate work rather than using generic greetings; supporting text identifies the next accountable action.
- Auth pages use the same Field Notes grammar as the dashboards: restrained administrative headline scale, an olive hairline rail, uppercase access metadata, and one compact context strip.
- Account-entry copy names role access, skill evidence, and placement progress directly; the interlocking field mark remains a legible Olive Ink brand signature on sparse pages.
