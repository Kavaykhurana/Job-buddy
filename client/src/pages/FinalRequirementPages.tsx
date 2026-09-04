// Field Notes Institutional Workspace: explicit named opportunity and collaboration types required by the final SIH brief.
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, Lightbulb, Milestone, Presentation, Rocket, Send, UsersRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { KeyValue, Notice, PageHeader, ProgressBar, SectionCard, StatusPill, Timeline } from "@/components/Ui";
import { userLocalStorage as localStorage } from "@/lib/userStorage";
import "./FinalRequirementPages.css";

function StudentLayout({ children }: { children: React.ReactNode }) { return <AppShell role="student">{children}</AppShell>; }
function RecruiterLayout({ children }: { children: React.ReactNode }) { return <AppShell role="recruiter">{children}</AppShell>; }
function AcademicianLayout({ children }: { children: React.ReactNode }) { return <AppShell role="academician">{children}</AppShell>; }

const experiences = [
  { id: "data-apprenticeship", type: "Apprenticeship", title: "Data Practice Apprenticeship", org: "Northstar Systems", mode: "Hybrid · Bengaluru", match: 82, duration: "12 weeks", required: ["Python", "Data analysis", "Communication"], summary: "A structured work-and-learning pathway with a supervisor, competency milestones, and completion evidence." },
  { id: "evidence-project", type: "Industry project", title: "Evidence Workflow Improvement Project", org: "Tern & Co.", mode: "Remote · Team project", match: 71, duration: "6 weeks", required: ["Research writing", "Documentation", "User research"], summary: "Work with an industry brief, team deliverables, review milestones, and a verified project outcome." },
];

function getExperience(id: string) { return experiences.find((item) => item.id === id) ?? experiences[0]; }

export function ExperienceListPage() { return <StudentLayout><PageHeader eyebrow="Experience opportunities" title="Projects and apprenticeships" description="Discover industry projects and apprenticeship pathways that match your current skills, interests, and readiness evidence." meta={<StatusPill>2 visible experiences</StatusPill>} /><div className="experience-list">{experiences.map((item) => <article className="experience-card" key={item.id}><div className="experience-type"><div><StatusPill tone={item.type === "Apprenticeship" ? "ochre" : "olive"}>{item.type}</StatusPill><h2>{item.title}</h2><p>{item.org} · {item.mode} · {item.duration}</p></div></div><p className="body-copy">{item.summary}</p><div className="tag-row">{item.required.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div><div className="experience-card-footer"><div><b>{item.match}%</b><span>profile fit</span></div><Link href={`/experiences/${item.id}`} className="small-outline">Review experience <ArrowRight size={15} /></Link></div></article>)}</div><Notice title="Unified opportunity lifecycle" text="Projects and apprenticeships use the same transparent profile match, application, selection, milestone, feedback, and completion record principles as internships and placements." /></StudentLayout>; }

export function ExperienceDetailPage({ id = "data-apprenticeship" }: { id?: string }) { const item = getExperience(id); return <StudentLayout><Link href="/experiences" className="back-link"><ArrowLeft size={16} /> Experience opportunities</Link><PageHeader eyebrow={item.type} title={item.title} description={`${item.org} · ${item.mode} · ${item.duration}`} meta={<StatusPill>{item.match}% profile fit</StatusPill>} /><div className="experience-detail-grid"><section className="stack-lg"><SectionCard title="Experience context"><p className="experience-lead">{item.summary}</p><div className="tag-row"><StatusPill tone="muted">Career-interest aligned</StatusPill><span className="skill-tag">Mentor/supervisor context</span><span className="skill-tag">Completion evidence eligible</span></div></SectionCard><SectionCard title="Required skill evidence"><div className="experience-requirements">{item.required.map((skill, index) => <div key={skill}><b>{skill}</b><span>Required by industry</span><StatusPill tone={index < 2 ? "olive" : "muted"}>{index < 2 ? "Verified / current" : "Current"}</StatusPill></div>)}</div></SectionCard><SectionCard title="Lifecycle"><Timeline items={[{ label: "Application and eligibility review", date: "Profile, documents, and fit recorded", state: "complete" }, { label: item.type === "Apprenticeship" ? "Selection and supervisor assignment" : "Selection and team assignment", date: "Industry decision with recorded criteria", state: "future" }, { label: item.type === "Apprenticeship" ? "Competency milestones" : "Project deliverables", date: "Progress and feedback records", state: "future" }, { label: "Completion and verified outcome", date: "Selected evidence can join your portfolio", state: "future" }]} /></SectionCard></section><aside className="stack-lg"><SectionCard title="Your fit"><div className="experience-fit"><b>{item.match}%</b><span>skills, interest, and eligibility fit</span><ProgressBar value={item.match} /></div><KeyValue label="Opportunity type" value={item.type} /><KeyValue label="Duration" value={item.duration} /><Link href={`/experiences/${item.id}/apply`} className="primary-button full-button">Apply to {item.type.toLowerCase()} <ArrowRight size={15} /></Link></SectionCard><SectionCard title="Build a stronger application"><Link href="/skill-gaps" className="action-link">Review skill gaps <ArrowRight size={15} /></Link><Link href="/portfolio" className="action-link">Review portfolio evidence <ArrowRight size={15} /></Link></SectionCard></aside></div></StudentLayout>; }

export function ExperienceApplyPage({ id = "data-apprenticeship" }: { id?: string }) { const item = getExperience(id); const [, setLocation] = useLocation(); const [note, setNote] = useState(""); return <StudentLayout><Link href={`/experiences/${item.id}`} className="back-link"><ArrowLeft size={16} /> Experience detail</Link><PageHeader eyebrow={`${item.type} application`} title={`Apply to ${item.title}`} description="Submit your profile evidence, documents, and concise statement for selection." meta={<StatusPill>Eligibility reviewed</StatusPill>} /><div className="experience-apply-grid"><section className="application-form"><section><h2>Experience application profile</h2><div className="experience-profile-row"><UsersRound size={18} /><div><b>Anaya Sharma</b><span>{item.match}% profile fit · Current academic record and selected portfolio evidence</span></div><StatusPill>Eligible</StatusPill></div></section><section><h2>Supporting evidence</h2><div className="experience-doc-row"><FileText size={18} /><div><b>Resume, verified skills, and selected portfolio evidence</b><span>Current documents and shareable profile evidence are included in the application snapshot.</span></div><Link href="/documents" className="small-outline">Review</Link></div></section><section><h2>Application statement</h2><textarea rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain how your current evidence and interests support this experience." /></section><div className="form-footer"><span><CheckCircle2 size={16} /> The application record retains the selected requirements, profile snapshot, and evidence state.</span><button className="primary-button" onClick={() => setLocation(`/experiences/${item.id}/track`)}>Submit application <Send size={15} /></button></div></section><aside className="stack-lg"><SectionCard title="Application context"><KeyValue label="Organisation" value={item.org} /><KeyValue label="Type" value={item.type} /><KeyValue label="Duration" value={item.duration} /><KeyValue label="Current fit" value={`${item.match}%`} /></SectionCard><Notice title="What happens next" text="Selection, supervisor/team assignment, milestones, feedback, and verified completion are tracked in the experience record." /></aside></div></StudentLayout>; }

export function ExperienceTrackerPage({ id = "data-apprenticeship" }: { id?: string }) { const item = getExperience(id); return <StudentLayout><Link href={`/experiences/${item.id}`} className="back-link"><ArrowLeft size={16} /> Experience detail</Link><PageHeader eyebrow={`${item.type} tracker`} title={item.title} description={`${item.org} · Application submitted today`} meta={<StatusPill tone="ochre">Selection review</StatusPill>} /><div className="experience-tracker-grid"><SectionCard title="Experience record"><Timeline items={[{ label: "Application submitted", date: "Profile, evidence, and eligibility snapshot recorded", state: "complete" }, { label: "Industry screening", date: "Current stage", state: "current" }, { label: item.type === "Apprenticeship" ? "Supervisor assignment" : "Team and brief assignment", date: "Not started", state: "future" }, { label: item.type === "Apprenticeship" ? "Competency milestones" : "Project deliverables", date: "Not started", state: "future" }, { label: "Feedback and completion", date: "No outcome recorded", state: "future" }]} /></SectionCard><aside className="stack-lg"><SectionCard title="Tracking context"><KeyValue label="Type" value={item.type} /><KeyValue label="Match" value={`${item.match}%`} /><KeyValue label="Evidence" value="Resume + portfolio" /><KeyValue label="Next action" value="Industry review" /></SectionCard><Link href="/season" className="small-outline full-button">Open placement journey</Link></aside></div></StudentLayout>; }

export function RecruiterExperiencesPage() { return <RecruiterLayout><PageHeader eyebrow="Industry experiences" title="Projects and apprenticeships" description="Publish and manage industry projects and apprenticeship pathways with requirements, selection, milestones, and completion outcomes." action={<Link href="/recruiter/experiences/new" className="primary-button">Create experience <ArrowRight size={15} /></Link>} /><SectionCard title="Published experience opportunities"><div className="experience-manager-list"><article><div><StatusPill tone="ochre">Apprenticeship</StatusPill><h3>Data Practice Apprenticeship</h3><p>Required skills published · 12 visible candidates · 2 supervisor places</p></div><StatusPill>Open</StatusPill><Link href="/recruiter/experiences/data-apprenticeship" className="small-outline">Manage</Link></article><article><div><StatusPill>Industry project</StatusPill><h3>Evidence Workflow Improvement Project</h3><p>Team brief draft · Project milestones and deliverable evidence configured</p></div><StatusPill tone="muted">Draft</StatusPill><button className="small-outline" onClick={() => toast("Project publishing opens in the connected industry workflow.")}>Open draft</button></article></div></SectionCard><Notice title="Experience lifecycle" text="Industry projects and apprenticeships support published skills and qualifications, matching, direct application, selection, supervisor/team assignment, milestones, feedback, and verified completion evidence." /></RecruiterLayout>; }

export function RecruiterExperiencePublishPage() { const [type, setType] = useState("Apprenticeship"); return <RecruiterLayout><Link href="/recruiter/experiences" className="back-link">← Industry experiences</Link><PageHeader eyebrow="Experience publishing" title="Create a project or apprenticeship" description="Publish an industry experience with required skills, qualifications, capacity, supervisor/team context, milestones, and outcome evidence." meta={<StatusPill>Draft</StatusPill>} /><div className="experience-publish-grid"><section className="stack-lg"><SectionCard title="Experience definition"><div className="experience-publish-form"><label>Experience type<select value={type} onChange={(event) => setType(event.target.value)}><option>Apprenticeship</option><option>Industry project</option></select></label><label>Title<input defaultValue={type === "Apprenticeship" ? "Data Practice Apprenticeship" : "Evidence Workflow Improvement Project"} /></label><label>Required skills<input defaultValue="Python, Data analysis, Communication" /></label><label>Qualification and eligibility<input defaultValue="Current undergraduate program with verified profile evidence" /></label><label>{type === "Apprenticeship" ? "Supervisor capacity" : "Project team capacity"}<input defaultValue={type === "Apprenticeship" ? "2 supervisor places" : "4 team places"} /></label><label>{type === "Apprenticeship" ? "Competency milestones" : "Project milestones and deliverables"}<textarea rows={4} defaultValue="Onboarding, evidence review, guided work, feedback, final outcome, completion record." /></label></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Publish review"><KeyValue label="Type" value={type} /><KeyValue label="Requirement version" value="Draft 0.1" /><KeyValue label="Application path" value="Direct student application" /><button className="primary-button full-button" onClick={() => toast.success("Experience publishing is ready for the connected industry workflow.")}>Save and publish <ArrowRight size={15} /></button></SectionCard><Notice title="Record integrity" text="Requirement versions, applicant snapshots, selection criteria, mentorship/team assignments, feedback, and outcomes remain independently traceable." /></aside></div></RecruiterLayout>; }

export function GuestLecturePage() { return <StudentLayout><PageHeader eyebrow="Guest lectures" title="Industry guest lectures" description="Attend approved guest lectures that bring current industry practice, role context, and career insight into the academic experience." meta={<StatusPill>1 upcoming lecture</StatusPill>} /><div className="initiative-detail-grid"><section className="stack-lg"><SectionCard title="Upcoming guest lecture"><div className="guest-lecture-card"><Presentation size={25} /><div><StatusPill>Guest lecture</StatusPill><h2>From skill evidence to industry decisions</h2><p>Northstar Systems · Neeraj Patel · 03 Sep, 15:00 · Institution auditorium + online access</p><span>Topics: role requirements, transparent skill evidence, early-career pathways, and questions from students.</span></div><button className="primary-button" onClick={() => toast.success("Lecture registration is ready for the connected event workflow.")}>Register to attend</button></div></SectionCard><SectionCard title="Participation record"><div className="initiative-steps"><div><CheckCircle2 size={16} /><span>Register or mark attendance</span><StatusPill tone="ochre">Open</StatusPill></div><div><FileText size={16} /><span>Access slides, notes, and approved resources</span><StatusPill tone="muted">After session</StatusPill></div><div><Lightbulb size={16} /><span>Add relevant learning actions to your development plan</span><StatusPill tone="muted">Optional</StatusPill></div></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Lecture context"><KeyValue label="Industry" value="Applied systems" /><KeyValue label="Format" value="Hybrid" /><KeyValue label="Audience" value="Eligible students" /><Link href="/career-guidance" className="action-link">Open career guidance <ArrowRight size={15} /></Link></SectionCard></aside></div></StudentLayout>; }

export function InnovationChallengePage() { return <StudentLayout><PageHeader eyebrow="Innovation challenges" title="Industry innovation challenge" description="Join an industry challenge, form a permitted team, develop an evidence-backed solution, and track milestone feedback and recognition." meta={<StatusPill tone="ochre">Registration open</StatusPill>} /><div className="initiative-detail-grid"><section className="stack-lg"><SectionCard title="Current challenge"><div className="challenge-card"><Lightbulb size={25} /><div><StatusPill tone="ochre">Innovation challenge</StatusPill><h2>Transparent evidence for early-career readiness</h2><p>Industry Council · Team-based challenge · Registration closes 08 Sep · Final review 28 Sep</p><span>Develop a concise workflow or prototype that helps students understand and improve evidence of industry-ready skills.</span></div><button className="primary-button" onClick={() => toast.success("Challenge registration is ready for the connected initiative workflow.")}>Register team interest</button></div></SectionCard><SectionCard title="Challenge milestones"><div className="initiative-steps"><div><Milestone size={16} /><span>Register, confirm eligibility, and form a permitted team</span><StatusPill tone="ochre">Open</StatusPill></div><div><Milestone size={16} /><span>Submit concept note and receive industry feedback</span><StatusPill tone="muted">Upcoming</StatusPill></div><div><Milestone size={16} /><span>Build and submit final prototype/deliverable</span><StatusPill tone="muted">Upcoming</StatusPill></div><div><CheckCircle2 size={16} /><span>Review outcome and add verified achievement if awarded</span><StatusPill tone="muted">Pending</StatusPill></div></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Challenge fit"><KeyValue label="Interest alignment" value="Digital product" /><KeyValue label="Suggested skills" value="Research, communication" /><KeyValue label="Recognition" value="Verified achievement eligible" /><Link href="/portfolio" className="action-link">Open portfolio <ArrowRight size={15} /></Link></SectionCard></aside></div></StudentLayout>; }

export function RecruiterInitiativesPage({ kind = "guest" }: { kind?: "guest" | "challenge" }) { const isGuest = kind === "guest"; return <RecruiterLayout><PageHeader eyebrow={isGuest ? "Guest lectures" : "Innovation challenges"} title={isGuest ? "Industry guest lecture program" : "Industry innovation challenge program"} description={isGuest ? "Publish guest lectures with speaker, audience, schedule, materials, registration, and participation records." : "Publish innovation challenges with criteria, participant eligibility, milestones, feedback, deliverables, review, and recognition."} action={<button className="primary-button" onClick={() => toast("Initiative publishing is ready for the connected collaboration workflow.")}>{isGuest ? "Create guest lecture" : "Create challenge"} <ArrowRight size={15} /></button>} /><SectionCard title={isGuest ? "Published guest lecture" : "Published innovation challenge"}><div className="initiative-manager"><div><StatusPill tone={isGuest ? "olive" : "ochre"}>{isGuest ? "Guest lecture" : "Innovation challenge"}</StatusPill><h3>{isGuest ? "From skill evidence to industry decisions" : "Transparent evidence for early-career readiness"}</h3><p>{isGuest ? "03 Sep · Hybrid · 88 registrations · Speaker and materials confirmed" : "Registration open · 18 expressions of interest · Concept note milestone pending"}</p></div><StatusPill>{isGuest ? "Published" : "Open"}</StatusPill><button className="small-outline">Manage</button></div></SectionCard><Notice title="Collaboration traceability" text={isGuest ? "Speaker, partner organisation, session context, registration, attendance, materials, participation, and feedback can be retained with the initiative." : "Partner organisation, criteria, participants, teams, milestones, deliverables, feedback, reviewers, awards, and verification can be retained with the initiative."} /></RecruiterLayout>; }

export function CompleteStudentCollaborationPage() { return <StudentLayout><PageHeader eyebrow="Collaboration" title="Industry and academic collaboration" description="Participate in approved mentorship, live projects, workshops, guest lectures, innovation challenges, and research partnerships." meta={<StatusPill>6 initiative types</StatusPill>} /><div className="collaboration-grid"><section className="stack-lg"><SectionCard title="Visible initiatives"><div className="initiative-list"><article><UsersRound size={19} /><div><StatusPill>Mentorship</StatusPill><h3>Applied systems mentorship circle</h3><p>Monthly mentor sessions for students building evidence in data and analytical work.</p></div><Link href="/mentorship" className="action-link">Open <ArrowRight size={15} /></Link></article><article><Rocket size={19} /><div><StatusPill tone="muted">Live industry project</StatusPill><h3>Evidence review project studio</h3><p>Work from an industry brief, team deliverables, milestones, and feedback.</p></div><Link href="/experiences/evidence-project" className="action-link">Review <ArrowRight size={15} /></Link></article><article><Presentation size={19} /><div><StatusPill tone="muted">Workshop</StatusPill><h3>Evidence-led review workshop</h3><p>Practice documenting work and communicating findings for industry review.</p></div><button className="small-outline" onClick={() => toast("Workshop registration is available in the connected collaboration workflow.")}>Register</button></article><article><Presentation size={19} /><div><StatusPill>Guest lecture</StatusPill><h3>From skill evidence to industry decisions</h3><p>Attend an industry guest lecture with registration, attendance, materials, and participation context.</p></div><Link href="/collaboration/guest-lectures" className="action-link">View lecture <ArrowRight size={15} /></Link></article><article><Lightbulb size={19} /><div><StatusPill tone="ochre">Innovation challenge</StatusPill><h3>Transparent evidence for early-career readiness</h3><p>Form a team, submit milestone deliverables, receive feedback, and record verified recognition.</p></div><Link href="/collaboration/innovation-challenges" className="action-link">Open challenge <ArrowRight size={15} /></Link></article><article><UsersRound size={19} /><div><StatusPill tone="ochre">Research partnership</StatusPill><h3>Health-data research partnership</h3><p>View a collaborative research initiative with faculty and industry stakeholders.</p></div><button className="small-outline" onClick={() => toast("Initiative visibility follows participant permissions.")}>View context</button></article></div></SectionCard></section><aside className="stack-lg"><SectionCard title="How collaboration connects"><p className="body-copy">Initiatives can reference skill evidence, learning progress, projects, mentorship sessions, deliverables, feedback, certificates, and selected portfolio items.</p><Link href="/portfolio" className="action-link">Open portfolio <ArrowRight size={15} /></Link></SectionCard><SectionCard title="Your next session"><KeyValue label="Mentorship" value="29 Aug · 16:00" /><KeyValue label="Format" value="Online" /><Link href="/mentorship" className="primary-button full-button">Open mentorship</Link></SectionCard></aside></div></StudentLayout>; }

export function CompleteRecruiterCollaborationPage() { return <RecruiterLayout><PageHeader eyebrow="Industry collaboration" title="Mentorship, projects, lectures, challenges, and research" description="Coordinate all approved industry–academia initiative types, participants, events, milestones, deliverables, feedback, and outcomes." action={<button className="primary-button" onClick={() => toast("Initiative creation is ready for the connected collaboration workflow.")}>Create initiative <ArrowRight size={15} /></button>} /><div className="collaboration-grid"><SectionCard title="Active initiatives"><div className="initiative-list"><article><UsersRound size={19} /><div><StatusPill>Mentorship</StatusPill><h3>Applied systems mentorship circle</h3><p>2 mentors · 18 student participants · 6 sessions scheduled.</p></div><button className="small-outline">Manage</button></article><article><Rocket size={19} /><div><StatusPill tone="muted">Live industry project</StatusPill><h3>Evidence review project studio</h3><p>4 team places · Project brief, milestones, and deliverable evidence configured.</p></div><Link href="/recruiter/experiences" className="small-outline">Manage</Link></article><article><Presentation size={19} /><div><StatusPill tone="muted">Workshop</StatusPill><h3>Evidence-led review workshop</h3><p>Partner institution · 42 registered participants · feedback template issued.</p></div><button className="small-outline">Manage</button></article><article><Presentation size={19} /><div><StatusPill>Guest lecture</StatusPill><h3>From skill evidence to industry decisions</h3><p>Speaker, audience, registration, attendance, materials, and feedback available.</p></div><Link href="/recruiter/collaboration/guest-lectures" className="small-outline">Manage</Link></article><article><Lightbulb size={19} /><div><StatusPill tone="ochre">Innovation challenge</StatusPill><h3>Transparent evidence for early-career readiness</h3><p>Team eligibility, milestones, reviews, deliverables, awards, and verification configured.</p></div><Link href="/recruiter/collaboration/innovation-challenges" className="small-outline">Manage</Link></article><article><UsersRound size={19} /><div><StatusPill tone="ochre">Research partnership</StatusPill><h3>Health-data research partnership</h3><p>Partner organisations, participants, deliverables, and milestone review pending.</p></div><button className="small-outline">Manage</button></article></div></SectionCard><SectionCard title="Initiative evidence"><p className="body-copy">Each collaboration type preserves organisation roles, participant records, event/session details, project milestones, deliverables, feedback, documents, and outcomes in the connected workflow.</p></SectionCard></div></RecruiterLayout>; }

interface CollabInitiativeItem {
  id: string;
  type: string;
  title: string;
  partner: string;
  description: string;
  participants: string;
  milestone: string;
  nextDate: string;
  details: string[];
}

const academicianCollabInitiatives: Record<string, CollabInitiativeItem> = {
  mentorship: {
    id: "mentorship",
    type: "Mentorship",
    title: "Applied systems mentorship circle",
    partner: "Northstar Systems",
    description: "Academic mentor for 8 computer science undergraduates focusing on relational schema modeling, data pipelines, and industry work sample presentation.",
    participants: "8 assigned students (Anaya Sharma, Kabir Mehta, et al.)",
    milestone: "Session 3 of 6 Completed",
    nextDate: "29 Aug · 16:00 – 16:45",
    details: [
      "Review student project repository documentation and SQL query samples",
      "Provide written feedback on industry readiness scorecards",
      "Clear students for campus recruiter technical interviews",
    ],
  },
  project: {
    id: "project",
    type: "Live industry project",
    title: "Evidence review project studio",
    partner: "Tern & Co.",
    description: "Multi-disciplinary student project studio developing automated portfolio evidence validation tooling for campus placement offices.",
    participants: "4 students in active sprint team",
    milestone: "Milestone 2 of 4: Prototype Schema Review",
    nextDate: "04 Sep 2026",
    details: [
      "Validate technical implementation against project requirements",
      "Verify student team commit history and code quality standards",
      "Submit milestone sign-off for industry sponsor review",
    ],
  },
  workshop: {
    id: "workshop",
    type: "Workshop",
    title: "Evidence-led review workshop",
    partner: "Apex Tech & Industry Council",
    description: "Faculty-led practical workshop on documenting applied engineering work samples, writing technical design documents, and presenting to recruiters.",
    participants: "42 registered student participants",
    milestone: "Materials Distributed · Ready to Host",
    nextDate: "02 Sep 2026 · 11:00",
    details: [
      "Host live walkthrough of student portfolio case studies",
      "Distribute industry assessment rubrics and evaluation criteria",
      "Record attendance for placement cell credential verification",
    ],
  },
  research: {
    id: "research",
    type: "Research partnership",
    title: "Health-data research partnership",
    partner: "Mosaic Health Labs",
    description: "Joint applied research initiative between Computer Science faculty and health-informatics industry researchers analyzing privacy-preserving medical ML pipelines.",
    participants: "Faculty Lead + 3 Student Research Fellows",
    milestone: "Deliverable 1 Approval Required",
    nextDate: "08 Sep 2026",
    details: [
      "Review research data governance and ethical clearance filings",
      "Approve student co-author contributions to conference submission",
      "Verify lab milestone completion for institutional research grant",
    ],
  },
};

const COLLAB_NOTES_PREFIX = "sih_acad_collab_notes_";

export function CompleteAcademicianCollaborationPage() {
  const [activeInitiative, setActiveInitiative] = useState<CollabInitiativeItem | null>(null);
  const [noteText, setNoteText] = useState("");

  const handleOpenInitiative = (key: string) => {
    const item = academicianCollabInitiatives[key];
    if (item) {
      setActiveInitiative(item);
      try {
        const saved = localStorage.getItem(COLLAB_NOTES_PREFIX + item.id);
        setNoteText(saved || "");
      } catch {
        setNoteText("");
      }
    }
  };

  const handleSaveNote = () => {
    if (!activeInitiative) return;
    try {
      localStorage.setItem(COLLAB_NOTES_PREFIX + activeInitiative.id, noteText);
      toast.success(`Collaboration notes saved for ${activeInitiative.title}.`);
    } catch {
      toast.error("Could not save notes.");
    }
  };

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Academic collaboration"
        title="Industry collaboration portfolio"
        description="Coordinate academic participation across mentorship, live projects, workshops, guest lectures, innovation challenges, and research partnerships."
        meta={<StatusPill tone="olive">6 Initiatives Visible</StatusPill>}
      />
      <SectionCard title="Your collaboration work">
        <div className="initiative-list">
          <article>
            <UsersRound size={19} />
            <div>
              <StatusPill>Mentorship</StatusPill>
              <h3>Applied systems mentorship circle</h3>
              <p>Academic mentor for 8 students · feedback reviews current.</p>
            </div>
            <button className="small-outline" onClick={() => handleOpenInitiative("mentorship")}>
              Open
            </button>
          </article>
          <article>
            <Rocket size={19} />
            <div>
              <StatusPill tone="muted">Live industry project</StatusPill>
              <h3>Evidence review project studio</h3>
              <p>Industry brief · milestone 2 of 4 · deliverable review scheduled.</p>
            </div>
            <button className="small-outline" onClick={() => handleOpenInitiative("project")}>
              Open
            </button>
          </article>
          <article>
            <Presentation size={19} />
            <div>
              <StatusPill tone="muted">Workshop</StatusPill>
              <h3>Evidence-led review workshop</h3>
              <p>Academic facilitator · participant outcomes and feedback collection current.</p>
            </div>
            <button className="small-outline" onClick={() => handleOpenInitiative("workshop")}>
              Open
            </button>
          </article>
          <article>
            <Presentation size={19} />
            <div>
              <StatusPill>Guest lecture</StatusPill>
              <h3>From skill evidence to industry decisions</h3>
              <p>Coordinate academic context, student registration, participation, materials, and follow-up learning actions.</p>
            </div>
            <Link href="/collaboration/guest-lectures" className="small-outline">
              Open
            </Link>
          </article>
          <article>
            <Lightbulb size={19} />
            <div>
              <StatusPill tone="ochre">Innovation challenge</StatusPill>
              <h3>Transparent evidence for early-career readiness</h3>
              <p>Review team eligibility, challenge milestones, academic guidance, deliverables, and verified outcomes.</p>
            </div>
            <Link href="/collaboration/innovation-challenges" className="small-outline">
              Open
            </Link>
          </article>
          <article>
            <UsersRound size={19} />
            <div>
              <StatusPill tone="ochre">Research partnership</StatusPill>
              <h3>Health-data research partnership</h3>
              <p>Partner institution and industry · research deliverable approval required.</p>
            </div>
            <button className="small-outline" onClick={() => handleOpenInitiative("research")}>
              Open
            </button>
          </article>
        </div>
      </SectionCard>

      {/* Collaboration Initiative Modal */}
      {activeInitiative && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setActiveInitiative(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="collab-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Academic Collaboration Context</span>
                <h2 id="collab-modal-title" className="student-review-title">{activeInitiative.title}</h2>
                <span className="student-review-meta">{activeInitiative.type} · Partner: {activeInitiative.partner}</span>
              </div>
              <button className="student-review-close" onClick={() => setActiveInitiative(null)} aria-label="Close collaboration review">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Initiative Type</span>
                  <strong className="student-review-stat-value text-olive" style={{ fontSize: "13px" }}>{activeInitiative.type}</strong>
                  <span className="student-review-stat-note">Approved program</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Participants</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px" }}>{activeInitiative.participants.split(" ")[0]} Active</strong>
                  <span className="student-review-stat-note">Assigned cohort</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Next Scheduled</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "12.5px" }}>{activeInitiative.nextDate.split(" · ")[0]}</strong>
                  <span className="student-review-stat-note">Calendar target</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Current State</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px" }}>Active</strong>
                  <span className="student-review-stat-note">Institutional clearance</span>
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Initiative Scope & Objectives</h4>
                <p className="student-review-section-desc" style={{ color: "var(--ink)", fontSize: "12.5px", lineHeight: 1.5 }}>
                  {activeInitiative.description}
                </p>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">
                  <Check size={13} className="text-olive" /> Faculty Advisor Responsibilities
                </h4>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--ink)" }}>
                  {activeInitiative.details.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Academic Advisor Observations & Log</h4>
                <textarea
                  className="review-notes-input"
                  placeholder="Record student progress, evaluation sign-offs, or partner communications..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <div className="student-review-notes-actions">
                  <button className="primary-button" onClick={handleSaveNote}>
                    Save Initiative Note
                  </button>
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setActiveInitiative(null)}>Back to Collaboration</button>
              <button className="primary-button" onClick={() => { handleSaveNote(); setActiveInitiative(null); }}>
                Confirm & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}
