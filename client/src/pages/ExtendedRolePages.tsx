// Field Notes Institutional Workspace: expanded role-specific lifecycle experiences for collaboration, publishing, integrations, and analytics.
import { useState } from "react";
import { Activity, ArrowRight, BarChart3, BookOpenCheck, BriefcaseBusiness, Check, CheckCircle2, CircleDashed, DatabaseZap, ExternalLink, FileQuestion, FileSpreadsheet, Handshake, Link2, MessageSquareText, Network, Plus, Presentation, ShieldCheck, UsersRound, Wrench, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ActionLink, KeyValue, Notice, PageHeader, ProgressBar, SectionCard, StatCard, StatusPill } from "@/components/Ui";
import { userLocalStorage as localStorage } from "@/lib/userStorage";
import "./ExtendedRolePages.css";

function StudentLayout({ children }: { children: React.ReactNode }) { return <AppShell role="student">{children}</AppShell>; }
function RecruiterLayout({ children }: { children: React.ReactNode }) { return <AppShell role="recruiter">{children}</AppShell>; }
function InstitutionLayout({ children }: { children: React.ReactNode }) { return <AppShell role="institution">{children}</AppShell>; }
function AcademicianLayout({ children }: { children: React.ReactNode }) { return <AppShell role="academician">{children}</AppShell>; }

const integrationRows = [
  { name: "LearnSphere", type: "Learning platform", state: "Connected", detail: "Last sync 26 Aug · 09:10" },
  { name: "CredVerify", type: "Certification provider", state: "Connected", detail: "Last sync 26 Aug · 08:40" },
  { name: "Institution record system", type: "Institutional database", state: "Review", detail: "Mapping review required" },
];

export function CollaborationHubPage() { return <StudentLayout><PageHeader eyebrow="Collaboration" title="Industry and academic collaboration" description="Participate in approved mentorship, live projects, workshops, and research partnerships linked to your profile and role." meta={<StatusPill>2 visible initiatives</StatusPill>} /><div className="collaboration-grid"><section className="stack-lg"><SectionCard title="Visible initiatives"><div className="initiative-list"><article><Handshake size={19} /><div><StatusPill>Mentorship</StatusPill><h3>Applied systems mentorship circle</h3><p>Monthly mentor sessions for students building evidence in data and analytical work.</p></div><Link href="/mentorship" className="action-link">Open <ArrowRight size={15} /></Link></article><article><Presentation size={19} /><div><StatusPill tone="muted">Workshop</StatusPill><h3>Evidence-led review workshop</h3><p>Practice documenting work and communicating findings for industry review.</p></div><button className="small-outline" onClick={() => toast("Workshop registration is available in the connected collaboration workflow.")}>Register</button></article><article><UsersRound size={19} /><div><StatusPill tone="ochre">Research partnership</StatusPill><h3>Health-data research partnership</h3><p>View an approved collaborative research initiative with faculty and industry stakeholders.</p></div><button className="small-outline" onClick={() => toast("Initiative visibility follows participant permissions.")}>View context</button></article></div></SectionCard></section><aside className="stack-lg"><SectionCard title="How collaboration connects"><p className="body-copy">Initiatives can reference skill evidence, learning progress, projects, mentorship sessions, deliverables, feedback, and selected portfolio items.</p><Link href="/portfolio" className="action-link">Open portfolio <ArrowRight size={15} /></Link></SectionCard><SectionCard title="Your next session"><KeyValue label="Mentorship" value="29 Aug · 16:00" /><KeyValue label="Format" value="Online" /><Link href="/mentorship" className="primary-button full-button">Open mentorship</Link></SectionCard></aside></div></StudentLayout>; }

export function MentorshipPage() { return <StudentLayout><PageHeader eyebrow="Industry mentorship" title="Applied systems mentorship circle" description="A structured mentor relationship with goals, scheduled sessions, notes, and relevant evidence." meta={<StatusPill>Active</StatusPill>} /><div className="mentorship-layout"><section className="stack-lg"><SectionCard title="Mentorship goals"><div className="goal-list"><div><CheckCircle2 size={16} /><span>Strengthen SQL evidence for target opportunities.</span><StatusPill tone="ochre">In progress</StatusPill></div><div><CheckCircle2 size={16} /><span>Prepare a concise data-analysis work sample.</span><StatusPill tone="muted">Planned</StatusPill></div></div></SectionCard><SectionCard title="Session record"><div className="session-record"><span>29 AUG</span><div><b>Evidence review and feedback</b><p>Online · 16:00–16:30 · Mentor: Neeraj Patel</p></div><button className="small-outline" onClick={() => toast("Session notes open in the connected mentorship workflow.")}>Open notes</button></div></SectionCard><SectionCard title="Mentor feedback"><div className="feedback-summary"><MessageSquareText size={18} /><div><b>Focus on clear SQL evidence and a concise explanation of your analytical choices.</b><p>Feedback can be linked to the learning plan and selected portfolio evidence.</p></div></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Mentor"><KeyValue label="Industry mentor" value="Neeraj Patel" /><KeyValue label="Organisation" value="Northstar Systems" /><KeyValue label="Next review" value="29 Aug" /></SectionCard><Link href="/learning/sql-evidence" className="primary-button full-button">Open related learning <ArrowRight size={15} /></Link></aside></div></StudentLayout>; }

export function RecruiterInternshipsPage() { return <RecruiterLayout><PageHeader eyebrow="Industry internship portal" title="Internship opportunities" description="Publish and manage internship requirements, candidate matches, mentor assignments, and completion outcomes." action={<Link href="/recruiter/internships/new" className="primary-button">Post internship <Plus size={15} /></Link>} /><SectionCard title="Published internships"><div className="role-table"><div className="table-head"><span>Internship</span><span>Published state</span><span>Matched candidates</span><span>Mentor capacity</span><span /></div><div className="role-table-row"><div><b>Data Practice Internship</b><span>Hybrid · Bengaluru · Required skills published</span></div><StatusPill>Open</StatusPill><span>12 candidates</span><span>2 assigned</span><Link href="/recruiter/internships/data-practice/engagements" className="small-outline">Manage</Link></div><div className="role-table-row"><div><b>Research Operations Internship</b><span>On campus · Requirement draft prepared</span></div><StatusPill tone="muted">Draft</StatusPill><span>Not visible</span><span>Not assigned</span><button className="small-outline" onClick={() => toast("Internship draft opens in the connected publishing workflow.")}>Open draft</button></div></div></SectionCard><Notice title="Industry requirement context" text="An internship posting uses required skills, preferred skills, qualifications, eligibility, capacity, mentor availability, and application dates." /></RecruiterLayout>; }

export function RecruiterInternshipPublishPage() { const [step, setStep] = useState(1); return <RecruiterLayout><Link href="/recruiter/internships" className="back-link">← Internship opportunities</Link><PageHeader eyebrow="Internship publishing" title="Post an internship opportunity" description="Create the industry requirement and lifecycle settings that support matching, selection, mentor feedback, and completion records." meta={<StatusPill>Draft</StatusPill>} /><div className="publish-layout"><section className="stack-lg"><SectionCard title="Draft progress"><div className="publish-steps">{["Context", "Requirements", "Eligibility", "Mentors", "Publish"].map((label, index) => <button key={label} onClick={() => setStep(index + 1)} className={step === index + 1 ? "publish-step active-step" : "publish-step"}><span>0{index + 1}</span>{label}</button>)}</div></SectionCard><SectionCard title={step === 1 ? "Internship context" : step === 2 ? "Skills and qualifications" : step === 3 ? "Eligibility rules" : step === 4 ? "Mentor and milestones" : "Publish review"}><div className="publish-form"><label>Title<input defaultValue="Data Practice Internship" /></label><label>Delivery mode<select defaultValue="Hybrid"><option>Hybrid</option><option>On campus</option><option>Remote</option></select></label><label>Required skills<input defaultValue="Python, Data analysis, Communication" /></label><label>Preferred skills<input defaultValue="SQL" /></label><label>Minimum qualification<input defaultValue="Current undergraduate program" /></label><label>Mentor capacity<input defaultValue="2 industry mentors" /></label></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Publishing controls"><KeyValue label="Current step" value={`${step} of 5`} /><KeyValue label="Requirement version" value="Draft 0.1" /><button className="primary-button full-button" onClick={() => toast.success("Internship publishing is ready for the connected role-authorized workflow.")}>Save and continue <ArrowRight size={15} /></button></SectionCard><Notice title="Matching basis" text="Published skills, qualifications, availability, career interests, and mentor capacity become part of the internship matching and engagement process." /></aside></div></RecruiterLayout>; }

export function RecruiterInternshipEngagementsPage() { return <RecruiterLayout><PageHeader eyebrow="Internship engagements" title="Data Practice Internship" description="Review selected candidates, assigned mentors, milestones, progress, feedback, and completion status." /><div className="engagement-manager-grid"><SectionCard title="Active engagements"><div className="engagement-manager-list"><article><div><b>Anaya Sharma</b><span>Selected · 42% milestone completion</span></div><ProgressBar value={42} /><StatusPill>Active</StatusPill><button className="small-outline" onClick={() => toast("Engagement review opens in the connected internship workflow.")}>Review</button></article><article><div><b>Kabir Mehta</b><span>Selected · Mentor assignment pending</span></div><ProgressBar value={18} /><StatusPill tone="ochre">Action required</StatusPill><button className="small-outline" onClick={() => toast("Mentor assignment is ready for the connected workflow.")}>Assign mentor</button></article></div></SectionCard><SectionCard title="Mentor capacity"><div className="mentor-card"><UsersRound size={19} /><div><b>Neeraj Patel</b><span>Industry mentor · 1 / 2 active engagements</span></div><StatusPill>Available</StatusPill></div><Link href="/recruiter/mentors" className="action-link">Manage mentors <ArrowRight size={15} /></Link></SectionCard></div></RecruiterLayout>; }

export function RecruiterMentorsPage() { return <RecruiterLayout><PageHeader eyebrow="Industry mentorship" title="Mentor assignments" description="Manage eligible mentors, capacity, mentorship sessions, feedback, and internship engagement associations." action={<button className="primary-button" onClick={() => toast("Mentor invitation is ready for the connected workflow.")}>Invite mentor <Plus size={15} /></button>} /><SectionCard title="Mentor register"><div className="role-table"><div className="table-head"><span>Mentor</span><span>Role</span><span>Active engagements</span><span>Availability</span><span /></div><div className="role-table-row"><div><b>Neeraj Patel</b><span>Northstar Systems</span></div><span>Data Practice Lead</span><span>1 / 2</span><StatusPill>Available</StatusPill><button className="small-outline">View sessions</button></div><div className="role-table-row"><div><b>Jaya Thomas</b><span>Northstar Systems</span></div><span>Research Operations</span><span>2 / 2</span><StatusPill tone="ochre">At capacity</StatusPill><button className="small-outline">View sessions</button></div></div></SectionCard></RecruiterLayout>; }

export function RecruiterAssessmentsPage() { return <RecruiterLayout><PageHeader eyebrow="Industry assessments" title="Assessment catalogue" description="Publish industry-shared questionnaires and aptitude tests with versioned skill criteria and reviewable evidence." action={<Link href="/recruiter/assessments/new" className="primary-button">Create assessment <Plus size={15} /></Link>} /><SectionCard title="Published assessment records"><div className="role-table"><div className="table-head"><span>Assessment</span><span>Format</span><span>Version</span><span>Respondents</span><span /></div><div className="role-table-row"><div><b>Analytical aptitude check</b><span>Northstar Systems · Current role readiness</span></div><span>Aptitude</span><span>1.4</span><span>24</span><button className="small-outline">Review</button></div><div className="role-table-row"><div><b>Industry readiness questionnaire</b><span>Industry Council · Shared assessment</span></div><span>Technical + soft skills</span><span>2.1</span><span>126</span><button className="small-outline">Review</button></div></div></SectionCard><Notice title="Assessment governance" text="Questions, section definitions, skills, scoring, versions, evaluator criteria, and student answer history remain traceable to their source." /></RecruiterLayout>; }

import { api } from "@/lib/api";

export function RecruiterAssessmentBuilderPage() {
  const [title, setTitle] = useState("Analytical aptitude check");
  const [type, setType] = useState("Aptitude");
  const [skills, setSkills] = useState("Reasoning, Data analysis, Decision making");
  const [guidance, setGuidance] = useState("Use a transparent, evidence-led score that can be explained in the student result view.");

  const handleSaveAssessment = async () => {
    toast.success(`Assessment '${title}' published and released for student access.`);
  };

  return <RecruiterLayout><Link href="/recruiter/assessments" className="back-link">← Assessments</Link><PageHeader eyebrow="Assessment builder" title="Create an industry-shared assessment" description="Define a versioned questionnaire or aptitude test with skill mappings and publish controls." meta={<StatusPill>Draft 0.1</StatusPill>} /><div className="publish-layout"><section className="stack-lg"><SectionCard title="Assessment definition"><div className="publish-form"><label>Assessment title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>Assessment type<select value={type} onChange={(e) => setType(e.target.value)}><option>Aptitude</option><option>Technical questionnaire</option><option>Soft-skill questionnaire</option></select></label><label>Mapped skills<input value={skills} onChange={(e) => setSkills(e.target.value)} /></label><label>Scoring guidance<textarea rows={4} value={guidance} onChange={(e) => setGuidance(e.target.value)} /></label></div></SectionCard><SectionCard title="Question section"><div className="assessment-question-preview"><FileQuestion size={18} /><div><b>Data interpretation</b><span>Maps to analytical reasoning and data analysis.</span></div><button className="small-outline" onClick={() => toast.info("Question editor is ready.")}>Edit question</button></div></SectionCard></section><aside className="stack-lg"><SectionCard title="Release controls"><KeyValue label="Version" value="0.1 draft" /><KeyValue label="Target audience" value="Eligible students" /><KeyValue label="Skills mapped" value="3" /><button className="primary-button full-button" onClick={() => void handleSaveAssessment()}>Save and release</button></SectionCard></aside></div></RecruiterLayout>;
}

export function RecruiterCollaborationPage() {
  const [initiatives, setInitiatives] = useState([
    { id: "1", type: "Mentorship", title: "Applied systems mentorship circle", detail: "2 industry mentors · 18 student participants · 6 sessions scheduled.", tone: "olive" },
    { id: "2", type: "Workshop", title: "Evidence-led review workshop", detail: "Partner institution · 42 registered participants · deliverable template issued.", tone: "muted" },
    { id: "3", type: "Research partnership", title: "Health-data research partnership", detail: "2 organisations · 4 academic participants · milestone review pending.", tone: "ochre" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Workshop");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = { id: String(Date.now()), type: newType, title: newTitle.trim(), detail: "New collaboration initiative created.", tone: "olive" };
    try {
      await api.initiatives.create({ title: item.title, kind: item.type, org: "Northstar Systems" });
      setInitiatives((curr) => [item, ...curr]);
      setNewTitle("");
      setShowForm(false);
      toast.success(`Created initiative: ${item.title}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The initiative could not be created.");
    }
  };

  return <RecruiterLayout><PageHeader eyebrow="Industry collaboration" title="Mentorship, workshops, projects, and research" description="Coordinate approved industry–academia initiatives, partners, participants, events, feedback, and deliverables." action={<button className="primary-button" onClick={() => setShowForm((c) => !c)}>{showForm ? "Cancel" : "Create initiative"} <Plus size={15} /></button>} /><div className="collaboration-grid">
    <SectionCard title="Active initiatives">
      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: "1.25rem", padding: "1rem", background: "var(--card-bg, #f8f9fa)", borderRadius: "8px", border: "1px solid var(--border-color, #e5e7eb)" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Initiative title</label>
          <input style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Cloud Architecture Bootcamp" required />
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Type</label>
          <select style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }} value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option>Mentorship</option>
            <option>Workshop</option>
            <option>Research partnership</option>
            <option>Guest lecture</option>
          </select>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="primary-button">Publish initiative</button>
            <button type="button" className="small-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="initiative-list">{initiatives.map((item) => <article key={item.id}><Handshake size={19} /><div><StatusPill tone={item.tone as any}>{item.type}</StatusPill><h3>{item.title}</h3><p>{item.detail}</p></div><button className="small-outline" onClick={() => toast.info(`Managing ${item.title}`)}>Manage</button></article>)}</div>
    </SectionCard><SectionCard title="Initiative evidence"><p className="body-copy">Initiatives keep partner roles, participant records, sessions/events, project milestones, deliverables, documents, and feedback within the governed collaboration workflow.</p></SectionCard></div></RecruiterLayout>;
}

export function RecruiterAnalyticsPage() { return <RecruiterLayout><PageHeader eyebrow="Industry analytics" title="Recruitment outcomes and skill demand" description="Monitor candidate compatibility, screening funnel, engagement outcomes, and current skill-demand signals." /><div className="stat-grid"><StatCard label="Qualified candidates" value="18" tone="olive" note="Current opportunity pool" /><StatCard label="Shortlisted" value="04" note="22% funnel conversion" /><StatCard label="Interview to offer" value="50%" tone="ochre" note="Current period" /><StatCard label="High-demand skills" value="06" note="Across published requirements" /></div><div className="analytics-grid"><SectionCard title="Recruitment funnel"><div className="funnel-list"><div><span>Visible candidates</span><b>18</b><ProgressBar value={100} /></div><div><span>Eligible candidates</span><b>12</b><ProgressBar value={67} /></div><div><span>Shortlisted</span><b>4</b><ProgressBar value={22} /></div><div><span>Offers issued</span><b>2</b><ProgressBar value={11} /></div></div></SectionCard><SectionCard title="Skill demand signal"><div className="demand-list"><div><span>Python</span><b>High</b></div><div><span>Data analysis</span><b>High</b></div><div><span>SQL</span><b>High</b></div><div><span>Communication</span><b>Medium</b></div></div></SectionCard></div></RecruiterLayout>; }

export function RecruiterIntegrationsPage() { return <RecruiterLayout><PageHeader eyebrow="Integrations" title="Provider connections" description="Review approved learning, certification, and record-service connections used by industry workflows." /><IntegrationPanel role="industry" /></RecruiterLayout>; }

const ACAD_OPP_STORAGE_KEY = "job_buddy_acad_opp_submissions";

interface AcademicOpportunityItem {
  id: string;
  type: string;
  title: string;
  partner: string;
  mode: string;
  skills: string;
  description: string;
}

const academicOpportunitiesList: AcademicOpportunityItem[] = [
  {
    id: "opp-01",
    type: "Faculty internship",
    title: "Applied Systems Faculty Immersion",
    partner: "Northstar Systems",
    mode: "6 weeks · Hybrid",
    skills: "Data practice and industry review",
    description: "Immersive faculty residency working directly with senior software architects and ML infrastructure teams on enterprise data pipelines and student internship alignment.",
  },
  {
    id: "opp-02",
    type: "Collaborative research",
    title: "Health-data research collaboration",
    partner: "Mosaic Health Labs",
    mode: "Research partnership · 6 months",
    skills: "Clinical informatics, data governance",
    description: "Joint research initiative investigating ethical AI screening algorithms and patient privacy compliance, with funded student research fellowship allocations.",
  },
  {
    id: "opp-03",
    type: "Consultancy",
    title: "Evidence workflow consultation",
    partner: "Tern & Co.",
    mode: "Advisory opportunity · Remote",
    skills: "Curriculum mapping, technical validation",
    description: "Consultancy role advising enterprise tech recruiters on verifying undergraduate portfolio credentials, capstone projects, and GitHub repository contributions.",
  },
];

export function AcademicianOpportunitiesPage() {
  const [selectedOpp, setSelectedOpp] = useState<AcademicOpportunityItem | null>(null);
  const [semester, setSemester] = useState("Fall 2026");
  const [proposalPitch, setProposalPitch] = useState("");
  const [submissions, setSubmissions] = useState<Record<string, { date: string; pitch: string; semester: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem(ACAD_OPP_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const handleOpenProposal = (opp: AcademicOpportunityItem) => {
    setSelectedOpp(opp);
    const existing = submissions[opp.id];
    setProposalPitch(existing ? existing.pitch : "");
    setSemester(existing ? existing.semester : "Fall 2026");
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const updated = {
      ...submissions,
      [selectedOpp.id]: { date, pitch: proposalPitch.trim(), semester },
    };
    setSubmissions(updated);
    try {
      localStorage.setItem(ACAD_OPP_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast.success(`Proposal submitted for ${selectedOpp.title}!`);
    setSelectedOpp(null);
  };

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Academician opportunities"
        title="Industry-facing academic opportunities"
        description="Discover faculty internships, consultancy, collaborative research, and other approved opportunities linked to your academic profile."
        meta={<StatusPill tone="olive">3 Opportunities Available</StatusPill>}
      />
      <SectionCard title="Available opportunities">
        <div className="initiative-list">
          {academicOpportunitiesList.map((opp) => {
            const submission = submissions[opp.id];
            return (
              <article key={opp.id}>
                {opp.type === "Faculty internship" ? (
                  <BriefcaseBusiness size={19} />
                ) : opp.type === "Collaborative research" ? (
                  <Network size={19} />
                ) : (
                  <Presentation size={19} />
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <StatusPill tone={opp.type === "Collaborative research" ? "ochre" : opp.type === "Consultancy" ? "muted" : "olive"}>
                      {opp.type}
                    </StatusPill>
                    {submission && (
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--olive)", background: "var(--olive-wash)", padding: "2px 8px", borderRadius: "4px" }}>
                        Proposal Submitted · {submission.date}
                      </span>
                    )}
                  </div>
                  <h3>{opp.title}</h3>
                  <p>{opp.partner} · {opp.mode} · Skills: {opp.skills}</p>
                </div>
                <button className="small-outline" onClick={() => handleOpenProposal(opp)}>
                  {submission ? "Review proposal" : opp.type === "Collaborative research" ? "Collaborate" : "Apply"}
                </button>
              </article>
            );
          })}
        </div>
      </SectionCard>

      {/* Opportunity Proposal Modal */}
      {selectedOpp && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOpp(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="opp-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">{selectedOpp.type} Application</span>
                <h2 id="opp-modal-title" className="student-review-title">{selectedOpp.title}</h2>
                <span className="student-review-meta">{selectedOpp.partner} · {selectedOpp.mode}</span>
              </div>
              <button className="student-review-close" onClick={() => setSelectedOpp(null)} aria-label="Close proposal modal">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal}>
              <div className="student-review-body">
                <div className="student-review-section">
                  <h4 className="student-review-section-title">Opportunity Scope</h4>
                  <p className="student-review-section-desc" style={{ color: "var(--ink)", fontSize: "12.5px", lineHeight: 1.5 }}>
                    {selectedOpp.description}
                  </p>
                </div>

                <div className="student-review-section">
                  <h4 className="student-review-section-title">Proposed Term & Availability</h4>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Fall 2026">Fall Semester 2026 (Aug – Dec)</option>
                    <option value="Spring 2027">Spring Semester 2027 (Jan – May)</option>
                    <option value="Summer 2027">Summer Immersion 2027 (June – July)</option>
                  </select>
                </div>

                <div className="student-review-section">
                  <h4 className="student-review-section-title">Faculty Statement & Teaching/Research Alignment</h4>
                  <textarea
                    className="review-notes-input"
                    rows={4}
                    placeholder="Describe how this industry collaboration connects to your academic department, student projects, or active curriculum modules..."
                    value={proposalPitch}
                    onChange={(e) => setProposalPitch(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="student-review-footer">
                <button type="button" className="small-outline" onClick={() => setSelectedOpp(null)}>Cancel</button>
                <button type="submit" className="primary-button">
                  {submissions[selectedOpp.id] ? "Update Proposal" : "Submit Formal Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}

const ACAD_TRAINING_STORAGE_KEY = "job_buddy_acad_training_enrolled";

interface TrainingModuleItem {
  id: string;
  title: string;
  category: "Industrial training" | "Faculty Development Program";
  provider: string;
  sessions: string;
  description: string;
  statusTone: "olive" | "ochre";
  statusText: string;
  modules: { title: string; duration: string; completed: boolean }[];
}

const trainingProgramsList: TrainingModuleItem[] = [
  {
    id: "training-applied-sys",
    title: "Applied systems industrial training",
    category: "Industrial training",
    provider: "Northstar Systems",
    sessions: "4 guided sessions",
    description: "Industry data practice, continuous integration standards, and cloud workflow review methods aligned with technical hiring criteria.",
    statusTone: "olive",
    statusText: "Open",
    modules: [
      { title: "Module 1: Enterprise Microservices & Data Pipelines", duration: "90 min", completed: true },
      { title: "Module 2: Evaluating Automated Unit & Integration Tests", duration: "90 min", completed: true },
      { title: "Module 3: Code Review Standards & Security Compliance", duration: "120 min", completed: false },
      { title: "Module 4: Student Capstone Rubrics & Industry Alignment", duration: "60 min", completed: false },
    ],
  },
  {
    id: "training-curriculum-fdp",
    title: "Evidence-led curriculum design FDP",
    category: "Faculty Development Program",
    provider: "Industry Council",
    sessions: "5 interactive workshops",
    description: "Align departmental teaching outcomes, laboratory assignments, and project assessment rubrics to current industry skill demand.",
    statusTone: "ochre",
    statusText: "Recommended",
    modules: [
      { title: "Workshop 1: Backward Design from Industry Job Roles", duration: "2 hours", completed: true },
      { title: "Workshop 2: Designing Real-World Laboratory Problem Sets", duration: "2 hours", completed: false },
      { title: "Workshop 3: Industry Portfolio & Repository Review Rubrics", duration: "2 hours", completed: false },
      { title: "Workshop 4: Integrating Git and Cloud Sandboxes in Classrooms", duration: "2 hours", completed: false },
      { title: "Workshop 5: Capstone Institutional Accreditation Outcomes", duration: "2 hours", completed: false },
    ],
  },
];

export function AcademicianTrainingPage() {
  const [selectedProgram, setSelectedProgram] = useState<TrainingModuleItem | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ACAD_TRAINING_STORAGE_KEY) || "[]");
    } catch {
      return ["training-applied-sys"];
    }
  });

  const handleEnrollToggle = (program: TrainingModuleItem) => {
    setEnrolledIds((prev) => {
      const isEnrolled = prev.includes(program.id);
      const updated = isEnrolled ? prev.filter((id) => id !== program.id) : [...prev, program.id];
      try {
        localStorage.setItem(ACAD_TRAINING_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      if (isEnrolled) {
        toast(`Withdrawn from ${program.title}.`);
      } else {
        toast.success(`Enrolled in ${program.title}!`);
      }
      return updated;
    });
  };

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Industrial training & FDPs"
        title="Professional development opportunities"
        description="Track industrial training and Faculty Development Program opportunities, enrolment, completion, and related evidence."
        meta={<StatusPill tone="olive">{enrolledIds.length} Programs Active</StatusPill>}
      />
      <div className="training-grid">
        {trainingProgramsList.map((prog) => {
          const isEnrolled = enrolledIds.includes(prog.id);
          return (
            <SectionCard key={prog.id} title={prog.category}>
              <div className="training-card">
                {prog.category === "Industrial training" ? <BookOpenCheck size={20} /> : <Presentation size={20} />}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <StatusPill tone={prog.statusTone}>{prog.statusText}</StatusPill>
                    {isEnrolled && <StatusPill tone="olive">Enrolled</StatusPill>}
                  </div>
                  <h3>{prog.title}</h3>
                  <p>{prog.provider} · {prog.sessions} · {prog.description}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isEnrolled && (
                    <button className="small-outline" onClick={() => setSelectedProgram(prog)}>
                      View syllabus
                    </button>
                  )}
                  <button
                    className={isEnrolled ? "small-outline" : "primary-button"}
                    onClick={() => handleEnrollToggle(prog)}
                  >
                    {isEnrolled ? "Enrolled" : "Enroll"}
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard title="Training evidence & credential records">
        <p className="body-copy">
          Enrolment, progress, certifications, documents, and completion outcomes can be connected to your academic profile and institutional curriculum-alignment records.
        </p>
      </SectionCard>

      {/* Training Syllabus Modal */}
      {selectedProgram && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedProgram(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="training-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">{selectedProgram.category}</span>
                <h2 id="training-modal-title" className="student-review-title">{selectedProgram.title}</h2>
                <span className="student-review-meta">{selectedProgram.provider} · {selectedProgram.sessions}</span>
              </div>
              <button className="student-review-close" onClick={() => setSelectedProgram(null)} aria-label="Close training syllabus">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-section">
                <h4 className="student-review-section-title">Program Description</h4>
                <p className="student-review-section-desc" style={{ color: "var(--ink)", fontSize: "12.5px", lineHeight: 1.5 }}>
                  {selectedProgram.description}
                </p>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Curriculum Modules & Attendance Tracking</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {selectedProgram.modules.map((mod, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        background: "var(--muted)",
                        fontSize: "12px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--ink)", display: "block" }}>{mod.title}</strong>
                        <span style={{ color: "var(--slate)", fontSize: "11px" }}>Duration: {mod.duration}</span>
                      </div>
                      <StatusPill tone={mod.completed ? "olive" : "muted"}>
                        {mod.completed ? "Completed" : "Scheduled"}
                      </StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedProgram(null)}>Close</button>
              <button className="primary-button" onClick={() => { toast.success("Course materials and virtual meeting links sent to faculty email."); setSelectedProgram(null); }}>
                Access Course Materials
              </button>
            </div>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}

export function AcademicianCollaborationPage() { return <AcademicianLayout><PageHeader eyebrow="Academic collaboration" title="Mentorship, projects, workshops, and research" description="Coordinate academic participation in industry mentorship, live projects, workshops, and research partnerships." /><SectionCard title="Your collaboration work"><div className="initiative-list"><article><Handshake size={19} /><div><StatusPill>Mentorship</StatusPill><h3>Applied systems mentorship circle</h3><p>Academic mentor for 8 students · 1 upcoming session · feedback reviews current.</p></div><button className="small-outline" onClick={() => toast.info("Opening mentorship session room.")}>Open</button></article><article><UsersRound size={19} /><div><StatusPill tone="muted">Live project</StatusPill><h3>Evidence review project studio</h3><p>Industry partner + faculty team · milestone 2 of 4 · deliverable review scheduled.</p></div><button className="small-outline" onClick={() => toast.info("Opening live project review.")}>Open</button></article><article><Network size={19} /><div><StatusPill tone="ochre">Research partnership</StatusPill><h3>Health-data research partnership</h3><p>Partner institution and industry · research deliverable approval required.</p></div><button className="small-outline" onClick={() => toast.info("Opening research deliverables.")}>Open</button></article></div></SectionCard></AcademicianLayout>; }

export function InstitutionCurriculumPage() {
  const [notes, setNotes] = useState([
    { id: "1", text: "Add applied SQL evidence work and stakeholder communication practice to strengthen alignment with current role requirements.", date: "24 Aug" }
  ]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item = { id: String(Date.now()), text: newNote.trim(), date: "Just now" };
    try {
      await api.curriculum.addNote("Computer Science", item.text);
      setNotes((curr) => [item, ...curr]);
      setNewNote("");
      setShowNoteForm(false);
      toast.success("Curriculum review note recorded and synced to database.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The curriculum note could not be saved.");
    }
  };

  return <InstitutionLayout><PageHeader eyebrow="Curriculum alignment" title="Academic program vs. industry demand" description="Compare the current program skill coverage with industry roles, requirements, internships, and learning opportunities." action={<button className="primary-button" onClick={() => setShowNoteForm((c) => !c)}>{showNoteForm ? "Cancel" : "Add review note"}</button>} /><div className="curriculum-grid"><SectionCard title="Computer Science curriculum alignment"><div className="curriculum-row"><div><b>Python and data analysis</b><span>Strong curriculum coverage · High industry demand</span></div><ProgressBar value={82} label="Alignment" /></div><div className="curriculum-row"><div><b>SQL evidence</b><span>Partial curriculum coverage · High industry demand</span></div><ProgressBar value={58} label="Alignment" /></div><div className="curriculum-row"><div><b>Evidence-led communication</b><span>Partial curriculum coverage · Medium industry demand</span></div><ProgressBar value={61} label="Alignment" /></div></SectionCard><aside className="stack-lg">
    <SectionCard title="Action notes & recommendations">
      {showNoteForm && (
        <form onSubmit={handleAddNote} style={{ marginBottom: "1rem" }}>
          <textarea rows={3} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter curriculum review note..." required />
          <button type="submit" className="primary-button full-button">Save note</button>
        </form>
      )}
      {notes.map((n) => (
        <div key={n.id} style={{ padding: "0.75rem", background: "var(--card-bg, #f8f9fa)", borderRadius: "6px", marginBottom: "0.5rem", border: "1px solid var(--border-color, #e5e7eb)" }}>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>{n.text}</p>
          <small style={{ color: "#666" }}>{n.date}</small>
        </div>
      ))}
    </SectionCard>
    <SectionCard title="Evidence source"><KeyValue label="Industry roles" value="12 mapped" /><KeyValue label="Skill demand snapshot" value="22 Aug" /><KeyValue label="Learning programs" value="8 relevant" /></SectionCard></aside></div></InstitutionLayout>;
}

export function InstitutionAnalyticsPage() { return <InstitutionLayout><PageHeader eyebrow="Institution analytics" title="Readiness, outcomes, and skill demand" description="Use governed operational reporting for skill development, internship participation, placement progress, and industry demand trends." /><div className="stat-grid"><StatCard label="Readiness baseline" value="78%" tone="olive" note="Verified evidence coverage" /><StatCard label="Internship participation" value="46" note="Current reporting period" /><StatCard label="Placement outcomes" value="18" tone="ochre" note="Verified offers" /><StatCard label="Skill gaps flagged" value="31" note="Across active cohort" /></div><div className="analytics-grid"><SectionCard title="Outcome trend"><div className="trend-bars"><div><span>Skill evidence complete</span><i style={{ width: "78%" }} /><b>78%</b></div><div><span>Internship completion</span><i style={{ width: "64%" }} /><b>64%</b></div><div><span>Placement-ready</span><i style={{ width: "71%" }} /><b>71%</b></div></div></SectionCard><SectionCard title="Reporting paths"><Link href="/policy-analytics" className="report-link"><BarChart3 size={18} /><div><b>Policy-ready aggregates</b><span>Privacy-safe reporting for authorised policy stakeholders.</span></div><ArrowRight size={16} /></Link><Link href="/institution/curriculum" className="report-link"><Activity size={18} /><div><b>Curriculum alignment</b><span>Compare academic skill coverage and industry demand.</span></div><ArrowRight size={16} /></Link></SectionCard></div></InstitutionLayout>; }

export function InstitutionIntegrationsPage() { return <InstitutionLayout><PageHeader eyebrow="Institution integrations" title="Learning, credential, and record-system connections" description="Govern approved learning platforms, certification providers, and institutional data sources with connection and sync status." /><IntegrationPanel role="institution" /></InstitutionLayout>; }

export function PolicyAnalyticsPage() { return <InstitutionLayout><PageHeader eyebrow="Governed policy analytics" title="Aggregate placement and skill intelligence" description="Privacy-preserving reporting for authorised institutional and policymaker analysis. Individual student records are not exposed in this view." meta={<StatusPill>Aggregate only</StatusPill>} /><div className="stat-grid"><StatCard label="Institutions reporting" value="12" note="Current period" /><StatCard label="Readiness average" value="74%" tone="olive" note="Aggregate cohort evidence" /><StatCard label="Internship completion" value="64%" note="Aggregate outcome" /><StatCard label="Top skill demand" value="Data analysis" tone="ochre" note="Industry reports" /></div><div className="analytics-grid"><SectionCard title="Regional skill demand"><div className="demand-list"><div><span>Data analysis</span><b>High</b></div><div><span>Python</span><b>High</b></div><div><span>SQL</span><b>High</b></div><div><span>Communication</span><b>Medium</b></div></div></SectionCard><SectionCard title="Data protections"><div className="governance-list"><div><ShieldCheck size={16} /><span>Aggregate cohort thresholds applied.</span></div><div><ShieldCheck size={16} /><span>Organisation-scoped access is enforced by the connected backend.</span></div><div><ShieldCheck size={16} /><span>Exports are audit logged and permission checked.</span></div></div></SectionCard></div></InstitutionLayout>; }

interface IntegrationRowItem {
  id: string;
  name: string;
  type: string;
  state: "Connected" | "Review" | "Paused";
  detail: string;
  endpointUrl: string;
}

const defaultIntegrationRows: IntegrationRowItem[] = [
  { id: "int-01", name: "LearnSphere", type: "Learning platform", state: "Connected", detail: "Last sync 26 Aug · 09:10", endpointUrl: "https://api.learnsphere.edu/v2/sync" },
  { id: "int-02", name: "CredVerify", type: "Certification provider", state: "Connected", detail: "Last sync 26 Aug · 08:40", endpointUrl: "https://verify.credentials.org/api/v1" },
  { id: "int-03", name: "Institution record system", type: "Institutional database", state: "Review", detail: "Mapping review required", endpointUrl: "https://sis.apex-tech.edu/api/records" },
];

function IntegrationPanel({ role }: { role: "industry" | "institution" }) {
  const storageKey = `job_buddy_integrations_list_${role}`;
  const [integrations, setIntegrations] = useState<IntegrationRowItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultIntegrationRows;
    } catch {
      return defaultIntegrationRows;
    }
  });
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationRowItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProvider, setNewProvider] = useState("Canvas LMS");
  const [newType, setNewType] = useState("Learning platform");
  const [newUrl, setNewUrl] = useState("");

  const saveIntegrations = (updated: IntegrationRowItem[]) => {
    setIntegrations(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const handleManualSync = (id: string) => {
    const updated: IntegrationRowItem[] = integrations.map((item) =>
      item.id === id ? { ...item, detail: "Last sync: Just now · Active" } : item
    );
    saveIntegrations(updated);
    toast.success("Synchronization triggered successfully!");
    if (selectedIntegration && selectedIntegration.id === id) {
      setSelectedIntegration({ ...selectedIntegration, detail: "Last sync: Just now · Active" });
    }
  };

  const handleToggleState = (id: string) => {
    const updated: IntegrationRowItem[] = integrations.map((item) => {
      if (item.id === id) {
        const nextState: "Connected" | "Paused" = item.state === "Connected" ? "Paused" : "Connected";
        return { ...item, state: nextState };
      }
      return item;
    });
    saveIntegrations(updated);
    toast("Integration connection state updated.");
    if (selectedIntegration && selectedIntegration.id === id) {
      const nextState: "Connected" | "Paused" = selectedIntegration.state === "Connected" ? "Paused" : "Connected";
      setSelectedIntegration({ ...selectedIntegration, state: nextState });
    }
  };

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const item: IntegrationRowItem = {
      id: `int-${Date.now()}`,
      name: newProvider,
      type: newType,
      state: "Connected",
      detail: "Last sync: Just now",
      endpointUrl: newUrl || `https://${newProvider.toLowerCase().replace(/\s+/g, "")}.edu/api`,
    };
    const updated = [...integrations, item];
    saveIntegrations(updated);
    setIsAddOpen(false);
    setNewUrl("");
    toast.success(`Successfully connected ${newProvider}!`);
  };

  return (
    <SectionCard
      title="Connection register"
      aside={
        <button className="primary-button" onClick={() => setIsAddOpen(true)}>
          Add connection <Plus size={15} />
        </button>
      }
    >
      <div className="integration-list">
        {integrations.map((item) => (
          <article key={item.id}>
            <DatabaseZap size={18} />
            <div>
              <b>{item.name}</b>
              <span>{item.type} · {item.detail}</span>
            </div>
            <StatusPill tone={item.state === "Connected" ? "olive" : item.state === "Review" ? "ochre" : "muted"}>
              {item.state}
            </StatusPill>
            <button className="small-outline" onClick={() => setSelectedIntegration(item)}>
              Manage
            </button>
          </article>
        ))}
      </div>
      <Notice
        title="Integration controls"
        text={`Authorised ${role} users can review provider status, mapping, recent synchronization, failures, retry state, and governed external identifiers.`}
      />

      {/* Manage Integration Modal */}
      {selectedIntegration && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedIntegration(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="manage-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Provider Configuration</span>
                <h2 id="manage-modal-title" className="student-review-title">{selectedIntegration.name}</h2>
                <span className="student-review-meta">{selectedIntegration.type} · Status: {selectedIntegration.state}</span>
              </div>
              <button className="student-review-close" onClick={() => setSelectedIntegration(null)} aria-label="Close manage dialog">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-section">
                <h4 className="student-review-section-title">Connection Endpoint</h4>
                <div style={{ padding: "8px 12px", background: "var(--muted)", borderRadius: "6px", fontFamily: "monospace", fontSize: "11.5px", color: "var(--ink)" }}>
                  {selectedIntegration.endpointUrl}
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Status & Sync Health</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
                  <span>{selectedIntegration.detail}</span>
                  <StatusPill tone={selectedIntegration.state === "Connected" ? "olive" : "ochre"}>
                    {selectedIntegration.state}
                  </StatusPill>
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Integration Actions</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  <button className="primary-button" onClick={() => handleManualSync(selectedIntegration.id)}>
                    Trigger Manual Sync
                  </button>
                  <button className="small-outline" onClick={() => handleToggleState(selectedIntegration.id)}>
                    {selectedIntegration.state === "Connected" ? "Pause Sync" : "Resume Sync"}
                  </button>
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedIntegration(null)}>Done</button>
              <button
                className="small-outline"
                style={{ color: "#d9534f", borderColor: "#d9534f" }}
                onClick={() => {
                  saveIntegrations(integrations.filter((i) => i.id !== selectedIntegration.id));
                  setSelectedIntegration(null);
                  toast("Integration connection removed.");
                }}
              >
                Disconnect Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Connection Modal */}
      {isAddOpen && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Connect New Provider</span>
                <h2 id="add-modal-title" className="student-review-title">Register Institutional Connection</h2>
                <span className="student-review-meta">LMS, Certification, or Database Source</span>
              </div>
              <button className="student-review-close" onClick={() => setIsAddOpen(false)} aria-label="Close add dialog">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddConnection}>
              <div className="student-review-body">
                <div className="student-review-section">
                  <h4 className="student-review-section-title">Select Provider</h4>
                  <select
                    value={newProvider}
                    onChange={(e) => {
                      setNewProvider(e.target.value);
                      if (e.target.value === "Canvas LMS" || e.target.value === "Moodle") setNewType("Learning platform");
                      else if (e.target.value === "Coursera Campus" || e.target.value === "Credly") setNewType("Certification provider");
                      else setNewType("Institutional database");
                    }}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Canvas LMS">Canvas LMS</option>
                    <option value="Moodle">Moodle Campus</option>
                    <option value="Coursera Campus">Coursera for Campus</option>
                    <option value="Credly">Credly Badging</option>
                    <option value="GitHub Campus">GitHub Campus Program</option>
                    <option value="Workday Student">Workday Student Records</option>
                  </select>
                </div>

                <div className="student-review-section">
                  <h4 className="student-review-section-title">API Endpoint / Base URL</h4>
                  <input
                    type="url"
                    placeholder="https://canvas.apex-tech.edu/api/v1"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", fontSize: "12px", marginTop: "4px" }}
                    required
                  />
                </div>
              </div>

              <div className="student-review-footer">
                <button type="button" className="small-outline" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button">Connect Provider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
