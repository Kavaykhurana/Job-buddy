// Field Notes Institutional Workspace: distinct recruiter, institution, and academician screens within the approved scope.
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FilePenLine,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { ActionLink, KeyValue, Notice, PageHeader, ProgressBar, ScheduleLine, SectionCard, StatCard, StatusPill, Timeline } from "@/components/Ui";
import {
  candidateTimeline,
  candidates as defaultCandidates,
  companyRoleRequirements,
  getCandidateById,
  type CandidateRecord,
  type JobDraft,
  type RecruiterPostedJob,
  loadCandidates,
  loadCompanyRoleRequirements,
  loadRecruiterJobDrafts,
  loadRecruiterPostedJobs,
  loadScreeningNotes,
  roleRequirements,
  saveCandidate,
  saveCompanyRoleRequirements,
  saveScreeningNote,
  scheduleItems,
  toggleCandidateShortlist,
  updateCandidateStage,
  opportunities as initialOpportunities,
} from "@/data/portalData";
import { getScheduleEvents, scheduleInterviewForCandidate, type ScheduleEvent } from "@/data/scheduleData";
import { api } from "@/lib/api";
import { userLocalStorage as localStorage } from "@/lib/userStorage";
import recruiterMatchField from "@/assets/recruiter-match-field.svg";
import institutionReadiness from "@/assets/institution-readiness.svg";
import academicianLearningMap from "@/assets/academician-learning-map.svg";
import "./RecruiterSelection.css";
import "./CompanyRoleRequirements.css";
import "./AcademicianStudentMaps.css";
import "./InstitutionOverview.css";

function RecruiterLayout({ children }: { children: React.ReactNode }) { return <AppShell role="recruiter">{children}</AppShell>; }
function InstitutionLayout({ children }: { children: React.ReactNode }) { return <AppShell role="institution">{children}</AppShell>; }
function AcademicianLayout({ children }: { children: React.ReactNode }) { return <AppShell role="academician">{children}</AppShell>; }

export interface RecruiterOpportunityItem {
  id: string;
  title: string;
  organization?: string;
  mode: string;
  requiredSkills: string;
  preferredSkills?: string;
  status: "Open" | "Draft review" | "Draft" | string;
  eligibleCandidates: string;
  isDraft: boolean;
  draftId?: string;
  stages?: string;
  qualification?: string;
  eligibility?: string;
  summary?: string;
  attachments?: any[];
}

const northstarRequirements = ["Python", "Data Analysis", "Communication"];

function getCompanyEligibility(candidate: CandidateRecord) {
  const program = /Computer Science|Information Technology/.test(candidate.program);
  const fit = candidate.score >= 70;
  const matchedSkills = northstarRequirements.filter((skill) =>
    candidate.skills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())
  );
  const skills = matchedSkills.length === northstarRequirements.length;
  return {
    program,
    fit,
    skills,
    matchedSkills,
    decision: (program && fit && skills ? "Eligible" : "Needs review") as "Eligible" | "Needs review",
  };
}

export function RecruiterDashboard() {
  const [candidatesList, setCandidatesList] = useState<CandidateRecord[]>(loadCandidates);
  const [scheduleEventsList, setScheduleEventsList] = useState<ScheduleEvent[]>(getScheduleEvents);

  useEffect(() => {
    setCandidatesList(loadCandidates());
    setScheduleEventsList(getScheduleEvents());
  }, []);

  const visibleCount = candidatesList.length;
  const awaitingCount = candidatesList.filter((c) => c.stage === "Screening").length;
  const shortlistedCount = candidatesList.filter((c) => c.shortlisted || c.stage === "Shortlisted").length;
  const interviewEvents = scheduleEventsList.filter((e) => e.kind === "Interview" || e.kind === "Evaluation");

  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Northstar Systems · Recruiter workspace"
        title="Candidate review, at a glance"
        description="Review the approved candidate pool, screening queue, and scheduled recruitment activity."
        meta={<StatusPill>Placement window open</StatusPill>}
      />
      <div className="stat-grid">
        <StatCard label="Visible candidates" value={String(visibleCount).padStart(2, "0")} note="For active opportunity" />
        <StatCard label="Awaiting screening" value={String(awaitingCount).padStart(2, "0")} tone="ochre" note="Action required" />
        <StatCard label="Shortlisted" value={String(shortlistedCount).padStart(2, "0")} tone="olive" note="Ready for next stage" />
        <StatCard label="Interviews & Briefings" value={String(interviewEvents.length).padStart(2, "0")} note="Evaluators assigned" />
      </div>
      <div className="dashboard-grid">
        <div className="stack-lg">
          <SectionCard title="Screening queue" aside={<ActionLink href="/recruiter/candidates">Review candidates</ActionLink>}>
            <div className="activity-list">
              {candidatesList.map((candidate) => (
                <article key={candidate.id}>
                  <div>
                    <b>{candidate.name}</b>
                    <span>{candidate.program} · {candidate.score}% skill compatibility</span>
                  </div>
                  <StatusPill tone={candidate.stage === "Shortlisted" ? "olive" : candidate.stage === "Interview Scheduled" ? "ink" : candidate.eligibility === "Eligible" ? "olive" : "ochre"}>
                    {candidate.stage || candidate.eligibility}
                  </StatusPill>
                  <Link href={`/recruiter/candidates/${candidate.id}`} className="action-link">
                    Review <ArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Published opportunity requirement">
            <div className="recruiter-requirement">
              <div>
                <StatusPill>Open</StatusPill>
                <h3>Applied AI Capability Studio</h3>
                <p>{candidatesList.filter((c) => c.eligibility === "Eligible").length} approved candidates meet the published eligibility baseline.</p>
              </div>
              <Link href="/recruiter/skill-requirements" className="small-outline">View requirements</Link>
            </div>
          </SectionCard>
        </div>
        <aside className="stack-lg">
          <SectionCard title="Today’s recruiting schedule">
            {interviewEvents.length > 0 ? (
              interviewEvents.slice(0, 3).map((event) => (
                <ScheduleLine
                  key={event.id}
                  time={event.time.split("–")[0].trim() || event.time}
                  title={event.title}
                  meta={`${event.organizer} · ${event.duration}`}
                  kind={event.kind}
                />
              ))
            ) : (
              <>
                <ScheduleLine time="14:30" title="Candidate evaluation briefing" meta="2 evaluators · 45 min" kind="Evaluation" />
                <ScheduleLine time="16:15" title="Selection review" meta="Northstar Systems · 30 min" kind="Review" />
              </>
            )}
          </SectionCard>
          <SectionCard title="Recruitment controls">
            <p className="body-copy">Company eligibility criteria, shortlist decisions, and next-stage actions are managed together in Candidate selection.</p>
            <Link href="/recruiter/candidates" className="action-link">Open candidate selection <ArrowRight size={15} /></Link>
          </SectionCard>
        </aside>
      </div>
    </RecruiterLayout>
  );
}

export function RecruiterOpportunities() {
  const [postedJobs, setPostedJobs] = useState<RecruiterPostedJob[]>(loadRecruiterPostedJobs);
  const [drafts, setDrafts] = useState<JobDraft[]>(loadRecruiterJobDrafts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "draft" | "closing">("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setPostedJobs(loadRecruiterPostedJobs());
    setDrafts(loadRecruiterJobDrafts());
  }, []);

  // Built-in opportunities
  const defaultList: RecruiterOpportunityItem[] = [
    {
      id: "ai-studio",
      title: "Applied AI Capability Studio",
      organization: "Northstar Systems",
      mode: "Hybrid · Bengaluru",
      requiredSkills: "Python, Data Analysis, Communication",
      preferredSkills: "SQL, Machine Learning",
      status: "Open",
      eligibleCandidates: "08 / 18 visible",
      isDraft: false,
      draftId: undefined,
      stages: "Screening · Technical Panel · Offer",
      qualification: "Computer Science, IT, or related Engineering discipline",
      eligibility: "Minimum 70% assessment score; verified Python & Data analysis evidence.",
      summary: "Support a cross-functional team by evaluating data-led workflows and presenting evidence-backed recommendations.",
      attachments: [
        {
          id: "att-seed-ai",
          name: "Applied_AI_Capability_Studio_JD.pdf",
          size: "320 KB",
          type: "application/pdf",
          uploadedAt: "20 Aug 2026",
        },
      ],
    },
  ];

  // Combine posted jobs, default opportunities, and drafts
  const allOpportunities: RecruiterOpportunityItem[] = [
    ...postedJobs.map((job) => ({
      ...job,
      eligibleCandidates: "Newly posted",
      isDraft: false,
      draftId: undefined,
    })),
    ...defaultList,
    ...drafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      organization: draft.organization || "Mosaic Health Labs",
      mode: `${draft.mode} · ${draft.location || "On campus"}`,
      requiredSkills: draft.requiredSkills,
      preferredSkills: draft.preferredSkills,
      status: "Draft review" as const,
      eligibleCandidates: "Not visible",
      isDraft: true,
      draftId: draft.id,
      stages: draft.stages,
      qualification: draft.qualification,
      eligibility: draft.eligibility,
      summary: draft.summary || "Draft role requirements prepared.",
      attachments: draft.attachments || [],
    })),
  ];

  // Search and filter logic
  const filteredOpportunities = allOpportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.requiredSkills && item.requiredSkills.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.organization && item.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.mode && item.mode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "open") return item.status === "Open";
    if (filter === "draft") return item.isDraft || item.status === "Draft review" || item.status === "Draft";
    if (filter === "closing") return item.status === "Open";
    return true;
  });

  const filterTabs = [
    { key: "all", label: `All opportunities · ${allOpportunities.length}` },
    { key: "open", label: `Open / Published · ${allOpportunities.filter((o) => o.status === "Open").length}` },
    { key: "draft", label: `Drafts · ${allOpportunities.filter((o) => o.isDraft || o.status === "Draft review").length}` },
  ] as const;

  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Recruiter opportunities"
        title="Published requirements"
        description="Define and review opportunity requirements, attached briefs/PDFs, and selection criteria that determine candidate eligibility."
        action={
          <Link href="/recruiter/jobs/new" className="primary-button">
            Post job <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="candidate-toolbar recruiter-selection-toolbar" style={{ marginBottom: "14px" }}>
        <div style={{ flex: 1, maxWidth: "420px" }}>
          <Search size={16} />
          <input
            placeholder="Search by title, required skills, company, or mode"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="selection-filters">
          {filterTabs.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={filter === item.key ? "small-outline active-selection-filter" : "small-outline"}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="Opportunity records" aside={<StatusPill>{filteredOpportunities.length} opportunities visible</StatusPill>}>
        <div className="opportunity-table">
          <div className="table-head">
            <span>Opportunity</span>
            <span>Status</span>
            <span>Attached Documents</span>
            <span>Eligible candidates</span>
            <span>Actions</span>
          </div>
          {filteredOpportunities.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--slate)", fontSize: "12px" }}>
              No matching opportunity records found.
            </div>
          ) : (
            filteredOpportunities.map((job) => (
              <div className="table-row" key={job.id} style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1.3fr) minmax(100px, .7fr) minmax(130px, .9fr) minmax(110px, .8fr) minmax(140px, .9fr)", gap: "10px", alignItems: "center" }}>
                <div>
                  <b>{job.title}</b>
                  <span style={{ fontSize: "10.5px", color: "var(--slate)" }}>
                    {job.organization ? `${job.organization} · ` : ""}
                    {job.mode} {job.requiredSkills ? `· ${job.requiredSkills}` : ""}
                  </span>
                </div>
                <StatusPill tone={job.status === "Open" ? "olive" : "muted"}>{job.status}</StatusPill>
                <div>
                  {job.attachments && job.attachments.length > 0 ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", color: "var(--olive)", fontWeight: 700 }}>
                      <FileText size={13} /> {job.attachments.length} file(s)
                    </span>
                  ) : (
                    <span style={{ fontSize: "10.5px", color: "var(--slate)" }}>None</span>
                  )}
                </div>
                <span style={{ fontSize: "11px", color: "var(--slate)" }}>{job.eligibleCandidates}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {job.isDraft ? (
                    <button
                      type="button"
                      className="primary-button"
                      style={{ fontSize: "10px", padding: "4px 9px", minHeight: "28px" }}
                      onClick={() => setLocation(`/recruiter/jobs/new?draft=${job.draftId || job.id}`)}
                    >
                      <FilePenLine size={12} /> Open draft
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="small-outline"
                        style={{ fontSize: "10px", padding: "4px 9px", minHeight: "28px" }}
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye size={12} /> View post
                      </button>
                      <Link href="/recruiter/skill-requirements" className="action-link" style={{ fontSize: "11px" }}>
                        Requirements <ArrowRight size={13} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {/* View Post Modal */}
      {selectedJob && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              padding: "24px",
              border: "1px solid var(--rule)",
              boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
              display: "grid",
              gap: "14px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <StatusPill tone={selectedJob.status === "Open" ? "olive" : "muted"}>{selectedJob.status}</StatusPill>
                <h2 style={{ margin: "6px 0 2px", fontSize: "18px", color: "var(--ink)" }}>{selectedJob.title}</h2>
                <span style={{ fontSize: "11px", color: "var(--slate)" }}>
                  {selectedJob.organization || "Northstar Systems"} · {selectedJob.mode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate)" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: "12px", color: "var(--slate)", lineHeight: 1.5 }}>
              {selectedJob.summary || "Structured institutional opportunity requirement."}
            </p>

            <div style={{ display: "grid", gap: "8px", borderTop: "1px solid var(--rule)", paddingTop: "12px" }}>
              <KeyValue label="Required Skills" value={selectedJob.requiredSkills || "Python, Communication"} />
              <KeyValue label="Preferred Skills" value={selectedJob.preferredSkills || "SQL"} />
              <KeyValue label="Qualifications" value={selectedJob.qualification || "Computer Science or related degree"} />
              <KeyValue label="Selection Stages" value={selectedJob.stages || "Screening · Interview · Offer"} />
            </div>

            {selectedJob.attachments && selectedJob.attachments.length > 0 && (
              <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "12px", display: "grid", gap: "6px" }}>
                <b style={{ fontSize: "11.5px", color: "var(--ink)" }}>Attached Documents & Briefs:</b>
                {selectedJob.attachments.map((att: any) => (
                  <div
                    key={att.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "var(--olive-wash)",
                      borderRadius: "6px",
                      border: "1px solid var(--rule)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileText size={15} style={{ color: "var(--olive)" }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>{att.name}</span>
                      <span style={{ fontSize: "9.5px", color: "var(--slate)" }}>({att.size})</span>
                    </div>
                    <button
                      type="button"
                      className="small-outline"
                      style={{ fontSize: "9.5px", padding: "2px 7px" }}
                      onClick={() => toast.success(`Downloading "${att.name}"...`)}
                    >
                      <Download size={11} /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="button" className="primary-button" onClick={() => setSelectedJob(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Notice
        title="Lifecycle context"
        text="Industry job postings include requirement versions, qualifications, eligibility, skill criteria, attached briefs, published selection stages, screening, interview evaluation, offer, and recorded outcomes."
      />
    </RecruiterLayout>
  );
}

export function RecruiterCandidates() {
  const [candidatesList, setCandidatesList] = useState<CandidateRecord[]>(loadCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "eligible" | "shortlisted" | "review" | "interviewed">("all");

  useEffect(() => {
    setCandidatesList(loadCandidates());
  }, []);

  const shortlistedCount = candidatesList.filter((c) => c.shortlisted || c.stage === "Shortlisted").length;

  const filteredCandidates = candidatesList.filter((candidate) => {
    const eligibility = getCompanyEligibility(candidate);
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      candidate.stage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "eligible") return eligibility.decision === "Eligible";
    if (filter === "shortlisted") return candidate.shortlisted || candidate.stage === "Shortlisted";
    if (filter === "review") return eligibility.decision !== "Eligible";
    if (filter === "interviewed") return candidate.stage === "Interview Scheduled" || candidate.stage === "Interviewed";
    return true;
  });

  const filters = [
    { key: "all", label: `All candidates · ${candidatesList.length}` },
    { key: "eligible", label: `Eligible now · ${candidatesList.filter((c) => getCompanyEligibility(c).decision === "Eligible").length}` },
    { key: "shortlisted", label: `Shortlisted · ${shortlistedCount}` },
    { key: "review", label: `Needs review · ${candidatesList.filter((c) => getCompanyEligibility(c).decision !== "Eligible").length}` },
    { key: "interviewed", label: `Interviews · ${candidatesList.filter((c) => c.stage === "Interview Scheduled" || c.stage === "Interviewed").length}` },
  ] as const;

  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Candidate selection"
        title="Candidates & shortlist"
        description="Apply Northstar Systems' company criteria, compare candidate evidence, and manage recruitment decisions from one workspace."
        meta={<span className="date-meta">{shortlistedCount} SHORTLISTED · 3 COMPANY CRITERIA</span>}
      />
      <SectionCard title="Northstar Systems · eligibility criteria" aside={<Link href="/recruiter/skill-requirements" className="action-link">View requirement set <ArrowRight size={14} /></Link>}>
        <div className="company-criteria">
          <div>
            <b>Academic programme</b>
            <span>Computer Science, IT, or a related programme</span>
          </div>
          <div>
            <b>Compatibility threshold</b>
            <span>70% company-requirement fit or higher</span>
          </div>
          <div>
            <b>Required evidence</b>
            <span>Python, Data Analysis, and Communication</span>
          </div>
        </div>
      </SectionCard>

      <div className="candidate-toolbar recruiter-selection-toolbar">
        <div>
          <Search size={16} />
          <input
            placeholder="Search by candidate name, branch, or skills"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="selection-filters">
          {filters.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={filter === item.key ? "small-outline active-selection-filter" : "small-outline"}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="Selection register" aside={<StatusPill>{filteredCandidates.length} visible</StatusPill>}>
        <div className="recruiter-selection-table">
          <div className="selection-table-head">
            <span>Candidate</span>
            <span>Company eligibility</span>
            <span>Compatibility</span>
            <span>Selection status</span>
            <span>Actions</span>
          </div>
          {filteredCandidates.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--slate)", fontSize: "12px" }}>
              No candidates matching the current search query or filter.
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const eligibility = getCompanyEligibility(candidate);
              const isShortlisted = candidate.shortlisted || candidate.stage === "Shortlisted";
              return (
                <div className="selection-table-row" key={candidate.id}>
                  <div>
                    <b>{candidate.name}</b>
                    <span>{candidate.program}</span>
                  </div>
                  <div className="eligibility-signals">
                    <span className={eligibility.program ? "criterion-pass" : "criterion-review"}>
                      Programme {eligibility.program ? "✓" : "!"}
                    </span>
                    <span className={eligibility.fit ? "criterion-pass" : "criterion-review"}>
                      Fit {eligibility.fit ? "✓" : "!"}
                    </span>
                    <span className={eligibility.skills ? "criterion-pass" : "criterion-review"}>
                      Skills {eligibility.matchedSkills.length}/3
                    </span>
                  </div>
                  <div className="candidate-fit">
                    <b>{candidate.score}%</b>
                    <ProgressBar value={candidate.score} />
                  </div>
                  <StatusPill
                    tone={
                      isShortlisted
                        ? "olive"
                        : candidate.stage === "Interview Scheduled"
                        ? "ink"
                        : eligibility.decision === "Eligible"
                        ? "muted"
                        : "ochre"
                    }
                  >
                    {candidate.stage || (isShortlisted ? "Shortlisted" : eligibility.decision)}
                  </StatusPill>
                  <div className="selection-row-actions">
                    <Link href={`/recruiter/candidates/${candidate.id}`} className="action-link">
                      Review <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
      <Notice
        title="Decision basis"
        text="Eligibility is shown against Northstar Systems' published programme, fit, and required-skill criteria. Candidate shortlisting and interview scheduling are performed from each candidate's review record."
      />
    </RecruiterLayout>
  );
}

export function CandidateReviewPage({ id: propId }: { id?: string }) {
  const [location] = useLocation();
  const routeCandidateId = propId || (location.startsWith("/recruiter/candidates/") ? location.replace("/recruiter/candidates/", "").split("?")[0] : undefined);
  const activeId = routeCandidateId || "anaya-01";

  const [candidate, setCandidate] = useState<CandidateRecord>(() => getCandidateById(activeId) || defaultCandidates[0]);
  const [screeningNotesList, setScreeningNotesList] = useState(() => loadScreeningNotes(activeId));
  const [newNote, setNewNote] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Schedule Interview Form State
  const [interviewForm, setInterviewForm] = useState({
    date: "05 Sep 2026",
    time: "14:00 – 15:00",
    mode: "Online",
    location: "Online (Google Meet · Interview Room)",
    evaluators: "Vikram Malhotra (Lead Recruiter), N. Patel",
    meetingLink: "https://meet.google.com/job-buddy-interview-room",
    notes: "Please review your Python and SQL data pipeline evidence beforehand.",
  });

  useEffect(() => {
    const found = getCandidateById(activeId);
    if (found) {
      setCandidate(found);
    }
    setScreeningNotesList(loadScreeningNotes(activeId));
  }, [activeId]);

  const eligibility = getCompanyEligibility(candidate);
  const isShortlisted = candidate.shortlisted || candidate.stage === "Shortlisted";

  const handleToggleShortlist = () => {
    const res = toggleCandidateShortlist(candidate.id);
    if (res.candidate) {
      setCandidate({ ...res.candidate });
      toast.success(res.shortlisted ? `${candidate.name} is now shortlisted for next stage.` : `${candidate.name} removed from shortlist.`);
    }
  };

  const handleSaveScreeningNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note before saving.");
      return;
    }
    const saved = saveScreeningNote(candidate.id, newNote.trim(), eligibility.decision);
    setScreeningNotesList(loadScreeningNotes(candidate.id));
    setNewNote("");
    toast.success("Screening note recorded and saved to candidate history.");
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInterviewForCandidate({
      candidateId: candidate.id,
      candidateName: candidate.name,
      opportunityTitle: candidate.opportunityTitle || "Applied AI Capability Studio",
      organization: "Northstar Systems",
      date: interviewForm.date,
      time: interviewForm.time,
      mode: interviewForm.mode,
      location: interviewForm.location,
      meetingLink: interviewForm.meetingLink,
      evaluators: interviewForm.evaluators,
      notes: interviewForm.notes,
    });

    const updated = getCandidateById(candidate.id);
    if (updated) setCandidate({ ...updated });
    setIsScheduling(false);
    toast.success(`Interview scheduled with ${candidate.name}! Calendar event and notification sent to candidate perspective.`);
  };

  const candidateInitials = candidate.avatar || candidate.name.split(" ").map((n) => n[0]).join("");

  return (
    <RecruiterLayout>
      <Link href="/recruiter/candidates" className="back-link">← Candidate selection</Link>
      <PageHeader
        eyebrow="Candidate screening"
        title={candidate.name}
        description={`${candidate.program} · Applied to ${candidate.opportunityTitle || "Applied AI Capability Studio"}`}
        meta={
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <StatusPill tone={eligibility.decision === "Eligible" ? "olive" : "ochre"}>
              {eligibility.decision}
            </StatusPill>
            {candidate.stage && (
              <StatusPill tone={candidate.stage === "Interview Scheduled" ? "ink" : candidate.stage === "Shortlisted" ? "olive" : "muted"}>
                {candidate.stage}
              </StatusPill>
            )}
          </div>
        }
      />
      <div className="candidate-review-layout">
        <section className="stack-lg">
          <SectionCard title="Compatibility overview">
            <div className="candidate-summary">
              <div className="candidate-large-avatar">{candidateInitials}</div>
              <div>
                <b>{candidate.score}% skill compatibility</b>
                <p>Published opportunity: {candidate.opportunityTitle || "Applied AI Capability Studio"}</p>
                <div className="tag-row">
                  {candidate.skills.map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ProgressBar value={candidate.score} label="Evidence-linked fit" />
          </SectionCard>

          <SectionCard title="Northstar Systems eligibility criteria">
            <div className="check-list">
              <div>
                <Check size={16} />
                <span>Programme: Computer Science, IT, or related discipline.</span>
                <StatusPill tone={eligibility.program ? "olive" : "ochre"}>
                  {eligibility.program ? "Meets" : "Review"}
                </StatusPill>
              </div>
              <div>
                <Check size={16} />
                <span>Company fit threshold: 70% or higher.</span>
                <StatusPill tone={eligibility.fit ? "olive" : "ochre"}>
                  {candidate.score}%
                </StatusPill>
              </div>
              <div>
                <Check size={16} />
                <span>Required skills: Python, Data Analysis, and Communication.</span>
                <StatusPill tone={eligibility.skills ? "olive" : "ochre"}>
                  {eligibility.matchedSkills.length}/3 evidenced
                </StatusPill>
              </div>
              <div>
                <ClipboardCheck size={16} />
                <span>
                  Recruiter screening note:{" "}
                  {screeningNotesList.length > 0
                    ? `${screeningNotesList.length} note(s) recorded`
                    : "Not yet recorded"}
                </span>
                <StatusPill tone={screeningNotesList.length > 0 ? "olive" : "ochre"}>
                  {screeningNotesList.length > 0 ? "Recorded" : "Pending"}
                </StatusPill>
              </div>
            </div>
          </SectionCard>

          {/* Persistent Screening Notes */}
          <SectionCard title="Recruiter screening notes">
            <textarea
              rows={3}
              placeholder="Record the criteria and concise rationale for your screening decision..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="section-actions" style={{ marginTop: "8px" }}>
              <button type="button" className="primary-button" onClick={handleSaveScreeningNote}>
                Save screening note
              </button>
            </div>

            {screeningNotesList.length > 0 && (
              <div style={{ marginTop: "14px", display: "grid", gap: "8px", borderTop: "1px solid var(--rule)", paddingTop: "12px" }}>
                <b style={{ fontSize: "11px", color: "var(--ink)" }}>Recorded Notes History ({screeningNotesList.length})</b>
                {screeningNotesList.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px 11px",
                      background: "var(--surface)",
                      border: "1px solid var(--rule)",
                      borderRadius: "6px",
                      display: "grid",
                      gap: "3px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--ink)" }}>{n.author}</span>
                      <span style={{ fontSize: "9px", color: "var(--slate)" }}>{n.createdAt}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--slate)", lineHeight: 1.45 }}>{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Scheduled Interview Details if available */}
          {candidate.interviewDetails && (
            <SectionCard title="Scheduled interview details" aside={<StatusPill tone="olive">Confirmed</StatusPill>}>
              <div style={{ display: "grid", gap: "8px" }}>
                <KeyValue label="Date & Time" value={`${candidate.interviewDetails.date} · ${candidate.interviewDetails.time}`} />
                <KeyValue label="Mode & Location" value={`${candidate.interviewDetails.mode} · ${candidate.interviewDetails.location}`} />
                <KeyValue label="Evaluators" value={candidate.interviewDetails.evaluators} />
                {candidate.interviewDetails.meetingLink && (
                  <KeyValue
                    label="Meeting Room"
                    value={
                      <a href={candidate.interviewDetails.meetingLink} target="_blank" rel="noreferrer" style={{ color: "var(--olive)", fontWeight: 700, textDecoration: "underline" }}>
                        Open Video Link
                      </a>
                    }
                  />
                )}
                <div style={{ marginTop: "8px" }}>
                  <Link href={`/recruiter/interviews/anaya-scorecard`} className="small-outline">
                    Open evaluator scorecard <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </SectionCard>
          )}
        </section>

        <aside className="stack-lg">
          <SectionCard title="Recruitment actions">
            <div style={{ display: "grid", gap: "8px" }}>
              <button
                type="button"
                className={isShortlisted ? "small-outline full-button" : "primary-button full-button"}
                onClick={handleToggleShortlist}
              >
                <UserCheck size={15} />
                {isShortlisted ? "Remove from shortlist" : "Shortlist candidate"}
              </button>

              <button
                type="button"
                className="primary-button full-button"
                onClick={() => setIsScheduling(true)}
              >
                <Calendar size={15} /> Schedule interview
              </button>

              <button
                type="button"
                className="text-button full-button"
                onClick={() => {
                  updateCandidateStage(candidate.id, "Screening");
                  setCandidate((prev) => ({ ...prev, stage: "Screening" }));
                  toast("Candidate is kept in screening for further review.");
                }}
              >
                Keep in screening
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Application history">
            <Timeline items={candidateTimeline} />
          </SectionCard>
        </aside>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduling && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsScheduling(false)}
        >
          <form
            onSubmit={handleScheduleInterview}
            style={{
              background: "var(--surface)",
              borderRadius: "10px",
              maxWidth: "540px",
              width: "100%",
              padding: "24px",
              border: "1px solid var(--rule)",
              boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
              display: "grid",
              gap: "12px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="date-meta">RECRUITMENT EVALUATION</span>
                <h2 style={{ margin: "4px 0 0", fontSize: "17px", color: "var(--ink)" }}>
                  Schedule interview with {candidate.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduling(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate)" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--slate)" }}>
              Scheduling automatically places the event on the candidate&apos;s personal calendar and sends a notification alert to their portal view.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
                Interview Date
                <input
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  placeholder="e.g. 05 Sep 2026"
                  required
                />
              </label>
              <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
                Time slot
                <input
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  placeholder="e.g. 14:00 – 15:00"
                  required
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
                Delivery Mode
                <select
                  value={interviewForm.mode}
                  onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                >
                  <option>Online</option>
                  <option>On campus</option>
                  <option>Hybrid</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
                Location / Room
                <input
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                  placeholder="e.g. Online (Google Meet) or Room 4"
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
              Assigned Evaluators
              <input
                value={interviewForm.evaluators}
                onChange={(e) => setInterviewForm({ ...interviewForm, evaluators: e.target.value })}
                placeholder="e.g. Vikram Malhotra, Lead AI Engineer"
                required
              />
            </label>

            <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
              Video Meeting Link (if online)
              <input
                value={interviewForm.meetingLink}
                onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/job-buddy-interview-room"
              />
            </label>

            <label style={{ display: "grid", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
              Preparation Instructions for Candidate
              <textarea
                rows={2}
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                placeholder="Instructions on what project or evidence to prepare..."
              />
            </label>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                type="button"
                className="small-outline"
                onClick={() => setIsScheduling(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Confirm & Schedule Interview
              </button>
            </div>
          </form>
        </div>
      )}
    </RecruiterLayout>
  );
}

export function RecruiterShortlists() {
  const [candidatesList] = useState<CandidateRecord[]>(loadCandidates);
  const shortlisted = candidatesList.filter((c) => c.shortlisted || c.stage === "Shortlisted");
  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Shortlists"
        title="Candidates moved forward"
        description="Review selected candidates before scheduling or recording interviews."
      />
      <div className="shortlist-grid">
        {shortlisted.length === 0 ? (
          <SectionCard title="Shortlist register">
            <p className="body-copy">No candidates currently shortlisted. You can review and shortlist candidates from Candidate Selection.</p>
            <Link href="/recruiter/candidates" className="primary-button" style={{ display: "inline-block", marginTop: "8px" }}>
              Go to Candidate Selection
            </Link>
          </SectionCard>
        ) : (
          shortlisted.map((candidate) => (
            <SectionCard key={candidate.id} title={candidate.name} aside={<StatusPill tone="olive">{candidate.stage}</StatusPill>}>
              <p className="body-copy">{candidate.program}</p>
              <ProgressBar value={candidate.score} label="Skill compatibility" />
              <div className="section-actions">
                <Link href={`/recruiter/candidates/${candidate.id}`} className="small-outline">Review record</Link>
                <Link href={`/recruiter/candidates/${candidate.id}`} className="primary-button">Schedule interview</Link>
              </div>
            </SectionCard>
          ))
        )}
      </div>
    </RecruiterLayout>
  );
}

export function RecruiterInterviews() {
  const [scheduleEventsList] = useState<ScheduleEvent[]>(getScheduleEvents);
  const interviews = scheduleEventsList.filter((e) => e.kind === "Interview" || e.kind === "Evaluation");

  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Interviews"
        title="Interview management"
        description="Manage scheduled interviews, evaluators, feedback, and candidate progression."
        action={
          <Link href="/recruiter/candidates" className="primary-button">
            Schedule interview <ArrowRight size={16} />
          </Link>
        }
      />
      <SectionCard title="Scheduled interviews">
        <div className="interview-list">
          {interviews.map((event) => (
            <article key={event.id}>
              <div className="interview-time">
                <b>{String(event.dayNumber).padStart(2, "0")}</b>
                <span>{event.month}</span>
              </div>
              <div>
                <StatusPill tone="olive">{event.status || "Scheduled"}</StatusPill>
                <h3>{event.title}</h3>
                <p>{event.time} · {event.location} · {event.organizer}</p>
              </div>
              <Link href="/recruiter/interviews/anaya-scorecard" className="small-outline">
                Open scorecard
              </Link>
            </article>
          ))}
        </div>
      </SectionCard>
      <Notice title="Decision traceability" text="Interview score, evaluator feedback, recommendation, and candidate stage are recorded separately for auditability." />
    </RecruiterLayout>
  );
}

export function RecruiterSkillRequirements() {
  const [reqData, setReqData] = useState(loadCompanyRoleRequirements);
  const [companyIndex, setCompanyIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState("Intermediate");
  const [newImportance, setNewImportance] = useState("Required");
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDemand, setNewRoleDemand] = useState("High");
  const [candidatesList] = useState<CandidateRecord[]>(loadCandidates);

  useEffect(() => {
    setReqData(loadCompanyRoleRequirements());
  }, []);

  const company = reqData[companyIndex] || reqData[0] || companyRoleRequirements[0];
  const role = company.roles[roleIndex] || company.roles[0];
  const selectCompany = (index: number) => {
    setCompanyIndex(index);
    setRoleIndex(0);
  };

  // Compute dynamic eligible candidate count based on required skills
  const requiredSkillsList = (role?.requirements || [])
    .filter((r: any) => r.importance === "Required")
    .map((r: any) => r.skill.toLowerCase());

  const dynamicEligibleCount = candidatesList.filter((candidate) => {
    if (requiredSkillsList.length === 0) return true;
    return requiredSkillsList.every((req) =>
      candidate.skills.some((s) => s.toLowerCase().includes(req) || req.includes(s.toLowerCase()))
    );
  }).length;

  const handleAddRequirement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSkill.trim()) return;
    const requirement = { skill: newSkill.trim(), level: newLevel, importance: newImportance };
    const updated = JSON.parse(JSON.stringify(reqData)) as typeof reqData;
    updated[companyIndex].roles[roleIndex].requirements.push(requirement);
    updated[companyIndex].roles[roleIndex].updated = "Just now";
    try {
      await api.requirements.addRequirement(companyIndex, roleIndex, requirement);
      setReqData(updated);
      saveCompanyRoleRequirements(updated);
      setNewSkill("");
      setShowAddForm(false);
      toast.success(`Added ${requirement.skill} requirement to ${role.title}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The requirement could not be saved.");
    }
  };

  const handleDeleteRequirement = (skillIndex: number) => {
    const updated = JSON.parse(JSON.stringify(reqData)) as typeof reqData;
    const removed = updated[companyIndex].roles[roleIndex].requirements.splice(skillIndex, 1);
    updated[companyIndex].roles[roleIndex].updated = "Just now";
    setReqData(updated);
    saveCompanyRoleRequirements(updated);
    toast.success(`Removed requirement "${removed[0]?.skill}".`);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;
    const newRoleObj = {
      title: newRoleTitle.trim(),
      demand: newRoleDemand,
      updated: "Just now",
      eligible: String(candidatesList.length),
      requirements: [{ skill: "Communication", level: "Intermediate", importance: "Required" }],
    };
    const updated = JSON.parse(JSON.stringify(reqData)) as typeof reqData;
    updated[companyIndex].roles.push(newRoleObj);
    setReqData(updated);
    saveCompanyRoleRequirements(updated);
    setRoleIndex(updated[companyIndex].roles.length - 1);
    setNewRoleTitle("");
    setShowAddRoleForm(false);
    toast.success(`New role "${newRoleTitle}" added to ${company.company}.`);
  };

  return (
    <RecruiterLayout>
      <PageHeader
        eyebrow="Industry skill requirements"
        title={`${company.company} · ${role.title}`}
        description="Keep each company’s roles distinct so candidates are screened against the correct requirements, level expectations, and demand context."
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="small-outline"
              onClick={() => {
                setShowAddRoleForm((c) => !c);
                setShowAddForm(false);
              }}
            >
              {showAddRoleForm ? "Cancel" : "+ Add role offer"}
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setShowAddForm((c) => !c);
                setShowAddRoleForm(false);
              }}
            >
              {showAddForm ? "Cancel" : "+ Add skill requirement"}
            </button>
          </div>
        }
      />

      {showAddRoleForm && (
        <SectionCard title={`Add a new role offer for ${company.company}`}>
          <form className="publish-form" onSubmit={handleAddRole}>
            <label>
              Role Title
              <input
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="e.g. Cloud Infrastructure Architect, AI Research Fellow"
                required
              />
            </label>
            <label>
              Industry Demand Level
              <select value={newRoleDemand} onChange={(e) => setNewRoleDemand(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Emerging</option>
              </select>
            </label>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="primary-button">Create role</button>
              <button type="button" className="small-outline" onClick={() => setShowAddRoleForm(false)}>Cancel</button>
            </div>
          </form>
        </SectionCard>
      )}

      {showAddForm && (
        <SectionCard title={`Add requirement for ${role.title}`}>
          <form className="publish-form" onSubmit={handleAddRequirement}>
            <label>
              Skill name
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. AWS, Docker, React, Machine Learning"
                required
              />
            </label>
            <label>
              Expected level
              <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
                <option>Developing</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>
              Requirement importance
              <select value={newImportance} onChange={(e) => setNewImportance(e.target.value)}>
                <option>Required</option>
                <option>Preferred</option>
              </select>
            </label>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="primary-button">Save requirement</button>
              <button type="button" className="small-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard title="Company offers" aside={<span className="date-meta">{company.industry}</span>}>
        <div className="company-role-picker">
          <div className="company-role-group">
            <span>Company</span>
            <div>
              {reqData.map((item, index) => (
                <button
                  type="button"
                  key={item.company}
                  onClick={() => selectCompany(index)}
                  className={companyIndex === index ? "company-role-button active-company-role" : "company-role-button"}
                >
                  {item.company}
                </button>
              ))}
            </div>
          </div>
          <div className="company-role-group">
            <span>Role offered by {company.company}</span>
            <div>
              {company.roles.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => setRoleIndex(index)}
                  className={roleIndex === index ? "company-role-button active-company-role" : "company-role-button"}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="detail-layout">
        <SectionCard title={`${role.title} · published skills`}>
          <div className="requirement-table">
            <div className="table-head">
              <span>Skill</span>
              <span>Level</span>
              <span>Importance</span>
              <span style={{ textAlign: "right" }}>Action</span>
            </div>
            {role.requirements.map((requirement, idx) => (
              <div className="table-row" key={`${requirement.skill}-${idx}`} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", alignItems: "center" }}>
                <b>{requirement.skill}</b>
                <span>{requirement.level}</span>
                <StatusPill tone={requirement.importance === "Required" ? "ink" : "muted"}>
                  {requirement.importance}
                </StatusPill>
                <button
                  type="button"
                  onClick={() => handleDeleteRequirement(idx)}
                  className="text-button"
                  style={{ color: "var(--slate)", padding: "4px" }}
                  title={`Remove ${requirement.skill}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
        <aside className="stack-lg">
          <SectionCard title="Role demand context">
            <KeyValue label="Company" value={company.company} />
            <KeyValue label="Industry demand" value={role.demand} />
            <KeyValue label="Last updated" value={role.updated} />
            <KeyValue label="Eligible candidates" value={`${String(dynamicEligibleCount).padStart(2, "0")} matching candidates`} />
          </SectionCard>
        </aside>
      </div>

      <Notice
        title="Role-specific screening"
        text="Company offers remain separate: changing the role updates the published skills, level, importance, demand signal, and eligible-candidate context used for that offer."
      />
    </RecruiterLayout>
  );
}

// Per-candidate application records for the Institution workspace.
// Separate from defaultCandidates (shared with Recruiter) to avoid coupling.
const institutionAppRecords: Record<string, { opportunity: string; stage: string; eligibility: string }> = {
  "anaya-01": { opportunity: "Applied AI Capability Studio", stage: "Screening", eligibility: "Eligible" },
  "kabir-02": { opportunity: "Applied AI Capability Studio", stage: "Screening", eligibility: "Eligible" },
  "rhea-03": { opportunity: "Research Operations Associate", stage: "Submitted", eligibility: "Review" },
};

export function InstitutionDashboard() {
  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Institution workspace"
        title="Placement readiness overview"
        description="Monitor the approved student, application, interview, placement-status, and skill-alignment records for your institution."
        meta={<StatusPill>Batch 2028</StatusPill>}
      />
      <div className="stat-grid">
        <StatCard label="Placement-ready" value="142" tone="olive" note="Verified profile evidence" />
        <StatCard label="Active applications" value="186" note="Across approved opportunities" />
        <StatCard label="Interviews scheduled" value="24" note="This week" />
        <StatCard label="Offers recorded" value="18" tone="ochre" note="Current reporting period" />
      </div>
      <div className="dashboard-grid">
        <div className="stack-lg">
          <SectionCard title="Readiness watch" aside={<ActionLink href="/institution/readiness">View student readiness</ActionLink>}>
            <div className="readiness-summary">
              <div className="readiness-headline">
                <strong className="readiness-headline-stat">78%</strong>
                <span className="readiness-headline-label">profiles above placement-readiness baseline</span>
              </div>
              <ProgressBar value={78} label="Current readiness" />
            </div>
            <div className="readiness-notes">
              <div className="readiness-note-item">
                <span className="readiness-note-dot" />
                <span>31 profiles need academic-document completion.</span>
              </div>
              <div className="readiness-note-item">
                <span className="readiness-note-dot ochre" />
                <span>18 students have active application reviews.</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Placement activity">
            <div className="activity-list">
              <article>
                <div>
                  <b>Candidate evaluation briefing</b>
                  <span>28 Aug · 24 students visible · 2 recruiters assigned</span>
                </div>
                <StatusPill>Scheduled</StatusPill>
                <Link href="/institution/interviews" className="action-link">Review <ArrowRight size={15} /></Link>
              </article>
              <article>
                <div>
                  <b>Applied AI Capability Studio</b>
                  <span>8 students currently eligible for recruiter review</span>
                </div>
                <StatusPill tone="ochre">Screening</StatusPill>
                <Link href="/institution/applications" className="action-link">Review <ArrowRight size={15} /></Link>
              </article>
            </div>
          </SectionCard>
        </div>

        <aside className="stack-lg">
          <SectionCard title="Placement status">
            <div className="placement-status-card-body">
              <KeyValue label="Open placement window" value="Yes" />
              <KeyValue label="Current batch" value="2028" />
              <KeyValue label="Evidence verification" value="81% complete" />
            </div>
            <div className="placement-status-action">
              <Link href="/institution/placement-status" className="action-link">Open records <ArrowRight size={15} /></Link>
            </div>
          </SectionCard>
          <img className="role-illustration" src={institutionReadiness} alt="Abstract institution readiness illustration" />
        </aside>
      </div>
    </InstitutionLayout>
  );
}

const INST_READINESS_NOTES_PREFIX = "job_buddy_inst_readiness_notes_";

export function InstitutionReadiness() {
  const [candidatesList] = useState<CandidateRecord[]>(defaultCandidates);
  const [selectedStudent, setSelectedStudent] = useState<CandidateRecord | null>(null);
  const [advisorNote, setAdvisorNote] = useState("");

  // When a student is selected, load existing note from localStorage
  useEffect(() => {
    if (selectedStudent) {
      try {
        const saved = localStorage.getItem(INST_READINESS_NOTES_PREFIX + selectedStudent.id);
        setAdvisorNote(saved || "");
      } catch {
        setAdvisorNote("");
      }
    }
  }, [selectedStudent]);

  // Handle ESC to close modal
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedStudent(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSaveNote() {
    if (!selectedStudent) return;
    try {
      localStorage.setItem(INST_READINESS_NOTES_PREFIX + selectedStudent.id, advisorNote);
      toast(`Institutional readiness note saved for ${selectedStudent.name}.`);
    } catch {
      toast.error("Could not save note to local storage.");
    }
  }

  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Student readiness"
        title="Readiness and skill evidence"
        description="View student readiness, evidence completion, and skill-alignment signals without changing their profile records."
        meta={<StatusPill>Batch 2028 · Institutional record</StatusPill>}
      />

      <SectionCard title="Readiness cohort">
        <div className="readiness-cohort-card">
          <div className="readiness-cohort-table-wrap">
            <div className="readiness-cohort-table">
              <div className="readiness-cohort-head">
                <span>Student</span>
                <span>Profile</span>
                <span>Skill fit</span>
                <span>Academic evidence</span>
                <span>Action</span>
              </div>

              {candidatesList.map((candidate) => (
                <div className="readiness-cohort-row" key={candidate.id}>
                  <div className="readiness-student-cell">
                    <strong className="readiness-student-name">{candidate.name}</strong>
                    <span className="readiness-student-meta">{candidate.program}</span>
                  </div>

                  <div className="readiness-profile-cell">
                    <strong className="readiness-profile-pct">78% complete</strong>
                    <span className="readiness-profile-note">Verified profile record</span>
                  </div>

                  <div className="readiness-fit-cell">
                    <div className="readiness-fit-score">
                      <strong className="readiness-fit-pct">{candidate.score}%</strong>
                      <span className="readiness-fit-label">{candidate.score >= 80 ? "High fit" : "Moderate fit"}</span>
                    </div>
                    <ProgressBar value={candidate.score} label="Role skill fit" />
                  </div>

                  <div className="readiness-evidence-cell">
                    <StatusPill tone={candidate.eligibility === "Eligible" ? "olive" : "ochre"}>
                      {candidate.eligibility === "Eligible" ? "Current" : "Review"}
                    </StatusPill>
                    <span className="readiness-evidence-meta">
                      {candidate.eligibility === "Eligible" ? "Documents verified" : "Pending review"}
                    </span>
                  </div>

                  <div className="readiness-action-cell">
                    <button
                      className="small-outline"
                      onClick={() => setSelectedStudent(candidate)}
                    >
                      View context
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Student Readiness Context Modal */}
      {selectedStudent && (
        <div
          className="student-review-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
        >
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="readiness-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Institutional Student Record</span>
                <h2 id="readiness-modal-title" className="student-review-title">{selectedStudent.name}</h2>
                <span className="student-review-meta">{selectedStudent.program}</span>
              </div>
              <button
                className="student-review-close"
                aria-label="Close readiness review"
                onClick={() => setSelectedStudent(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              {/* Key Metrics */}
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Overall Skill Fit</span>
                  <strong className="student-review-stat-value text-olive">{selectedStudent.score}%</strong>
                  <span className="student-review-stat-note">Against cohort criteria</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Profile Evidence</span>
                  <strong className="student-review-stat-value">78%</strong>
                  <span className="student-review-stat-note">Verified documents</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Academic Evidence</span>
                  <strong className="student-review-stat-value">
                    {selectedStudent.eligibility === "Eligible" ? "Current" : "Review"}
                  </strong>
                  <span className="student-review-stat-note">Institutional audit</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Target Track</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px", marginTop: "2px" }}>
                    {selectedStudent.opportunityTitle || "Applied Systems Track"}
                  </strong>
                  <span className="student-review-stat-note">Current role alignment</span>
                </div>
              </div>

              {/* Section 1: Verified Capabilities */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">
                  <Check size={13} className="text-olive" /> Verified Capabilities & Demonstrated Skills
                </h4>
                <div className="student-review-skills-list">
                  {selectedStudent.skills.map((skill) => (
                    <span key={skill} className="student-skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 2: Institutional Academic & Degree Records */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Institutional Academic Records & Verification Status</h4>
                <div className="learning-syllabus-list">
                  <div className="learning-syllabus-item">
                    <span className="learning-syllabus-num">01</span>
                    <div>
                      <strong>Degree & Academic Standing</strong>
                      <p>Full-time enrollment verified · Department of Computer Science · On track for 2028 graduation.</p>
                    </div>
                  </div>
                  <div className="learning-syllabus-item">
                    <span className="learning-syllabus-num">02</span>
                    <div>
                      <strong>Transcripts & Prerequisite Compliance</strong>
                      <p>Semester 1–4 grade records verified with no active disciplinary or administrative holds.</p>
                    </div>
                  </div>
                  <div className="learning-syllabus-item">
                    <span className="learning-syllabus-num">03</span>
                    <div>
                      <strong>Placement Cell Clearance</strong>
                      <p>Authorised for active campus recruitment drives, industry interviews, and recruiter visibility.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Institutional Advisor Notes */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Institutional Advisor Readiness Notes</h4>
                <p className="student-review-section-desc">
                  Record official institutional observations or readiness flags for this student's placement file.
                </p>
                <textarea
                  className="review-notes-input"
                  placeholder="e.g. Student has completed advanced database certification. Ready for high-volume technical screening rounds."
                  value={advisorNote}
                  onChange={(e) => setAdvisorNote(e.target.value)}
                  rows={3}
                />
                <div className="student-review-notes-actions">
                  <button className="primary-button" onClick={handleSaveNote}>
                    Save Institutional Note
                  </button>
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedStudent(null)}>
                Back to Student Readiness
              </button>
              <span className="record-id-meta" style={{ fontSize: "11px", color: "var(--slate)" }}>
                Student ID: {selectedStudent.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </InstitutionLayout>
  );
}

const INST_APP_NOTES_PREFIX = "job_buddy_inst_app_notes_";

export function InstitutionApplications() {
  const [candidatesList] = useState<CandidateRecord[]>(defaultCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<{ candidate: CandidateRecord; appRec: { opportunity: string; stage: string; eligibility: string } } | null>(null);
  const [advisorNote, setAdvisorNote] = useState("");

  useEffect(() => {
    if (selectedCandidate) {
      try {
        const saved = localStorage.getItem(INST_APP_NOTES_PREFIX + selectedCandidate.candidate.id);
        setAdvisorNote(saved || "");
      } catch {
        setAdvisorNote("");
      }
    }
  }, [selectedCandidate]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedCandidate(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSaveNote() {
    if (!selectedCandidate) return;
    try {
      localStorage.setItem(INST_APP_NOTES_PREFIX + selectedCandidate.candidate.id, advisorNote);
      toast(`Application review note saved for ${selectedCandidate.candidate.name}.`);
    } catch {
      toast.error("Could not save note to local storage.");
    }
  }

  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Applications"
        title="Approved application visibility"
        description="Monitor application stages, eligibility outcomes, and recruiter activity for institution-supported students."
        meta={<StatusPill>3 Active Applications</StatusPill>}
      />

      <SectionCard title="Application records">
        <div className="institution-apps-card">
          <div className="institution-apps-table-wrap">
            <div className="institution-apps-table">
              <div className="institution-apps-head">
                <span>Student</span>
                <span>Opportunity</span>
                <span>Eligibility</span>
                <span>Stage</span>
                <span>Action</span>
              </div>

              {candidatesList.map((candidate) => {
                const appRec = institutionAppRecords[candidate.id] || { opportunity: "—", stage: "Submitted", eligibility: "Review" };
                return (
                  <div className="institution-apps-row" key={candidate.id}>
                    <div className="app-student-cell">
                      <strong className="app-student-name">{candidate.name}</strong>
                      <span className="app-student-meta">{candidate.program}</span>
                    </div>

                    <div className="app-opportunity-cell">
                      <strong className="app-opportunity-title">{appRec.opportunity}</strong>
                      <span className="app-opportunity-meta">Placement-approved requirement</span>
                    </div>

                    <div className="app-eligibility-cell">
                      <StatusPill tone={appRec.eligibility === "Eligible" ? "olive" : "ochre"}>
                        {appRec.eligibility}
                      </StatusPill>
                      <span className="app-eligibility-note">
                        {appRec.eligibility === "Eligible" ? "Verified fit" : "Review needed"}
                      </span>
                    </div>

                    <div className="app-stage-cell">
                      <StatusPill tone={appRec.stage === "Screening" ? "ochre" : "muted"}>
                        {appRec.stage}
                      </StatusPill>
                      <span className="app-stage-note">Active candidate funnel</span>
                    </div>

                    <div className="app-action-cell">
                      <button
                        className="small-outline"
                        onClick={() => setSelectedCandidate({ candidate, appRec })}
                      >
                        View context
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Application Context Modal */}
      {selectedCandidate && (
        <div
          className="student-review-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCandidate(null);
          }}
        >
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Approved Application Context</span>
                <h2 id="app-modal-title" className="student-review-title">{selectedCandidate.candidate.name}</h2>
                <span className="student-review-meta">{selectedCandidate.candidate.program} · {selectedCandidate.appRec.opportunity}</span>
              </div>
              <button
                className="student-review-close"
                aria-label="Close application review"
                onClick={() => setSelectedCandidate(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              {/* Key Metrics */}
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Application Stage</span>
                  <strong className="student-review-stat-value text-olive">{selectedCandidate.appRec.stage}</strong>
                  <span className="student-review-stat-note">Current recruitment status</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Eligibility Outcome</span>
                  <strong className="student-review-stat-value">{selectedCandidate.appRec.eligibility}</strong>
                  <span className="student-review-stat-note">Criteria verified</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Capability Fit</span>
                  <strong className="student-review-stat-value">{selectedCandidate.candidate.score}%</strong>
                  <span className="student-review-stat-note">Scorecard match</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Institutional Status</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px", marginTop: "2px" }}>Endorsed</strong>
                  <span className="student-review-stat-note">Placement cell clearance</span>
                </div>
              </div>

              {/* Section 1: Opportunity Context */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Target Opportunity Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "11.5px" }}>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Opportunity</span>
                    <strong style={{ color: "var(--ink)", fontSize: "13px" }}>{selectedCandidate.appRec.opportunity}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Workplace Mode</span>
                    <strong style={{ color: "var(--ink)", fontSize: "13px" }}>Full-Time Graduate Role</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Application Tracking</span>
                    <span style={{ color: "var(--ink)" }}>Managed via Job Buddy Recruiter Portal</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Recruiter Reviewer</span>
                    <span style={{ color: "var(--ink)" }}>Assigned Talent Assessment Team</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Verified Capabilities */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">
                  <Check size={13} className="text-olive" /> Verified Student Skills Matched to Requirement
                </h4>
                <div className="student-review-skills-list">
                  {selectedCandidate.candidate.skills.map((skill) => (
                    <span key={skill} className="student-skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 3: Institutional Notes */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Institutional Placement Notes</h4>
                <p className="student-review-section-desc">
                  Record official institutional feedback, interview readiness observations, or company communications.
                </p>
                <textarea
                  className="review-notes-input"
                  placeholder="e.g. Candidate attended mock interview round. Resume endorsed by Department Head for screening."
                  value={advisorNote}
                  onChange={(e) => setAdvisorNote(e.target.value)}
                  rows={3}
                />
                <div className="student-review-notes-actions">
                  <button className="primary-button" onClick={handleSaveNote}>
                    Save Application Note
                  </button>
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedCandidate(null)}>
                Back to Applications
              </button>
              <span className="record-id-meta" style={{ fontSize: "11px", color: "var(--slate)" }}>
                Candidate ID: {selectedCandidate.candidate.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </InstitutionLayout>
  );
}

const INST_INTERVIEW_NOTES_PREFIX = "job_buddy_inst_interview_notes_";

interface InstitutionInterviewItem {
  id: string;
  day: string;
  month: string;
  time: string;
  duration: string;
  title: string;
  organizer: string;
  formatMode: string;
  location: string;
  candidateSummary: string;
  candidates: { name: string; program: string; slot: string; fit: number }[];
  status: "Scheduled" | "Completed" | "Upcoming";
  agenda: string;
}

const initialInstitutionInterviews: InstitutionInterviewItem[] = [
  {
    id: "inst-int-01",
    day: "28",
    month: "AUG",
    time: "14:30 – 15:15",
    duration: "45 min",
    title: "Applied AI Capability Studio",
    organizer: "Northstar Systems · Technical Recruiter Panel",
    formatMode: "Hybrid Evaluation",
    location: "Online & Seminar Room 4 (Placement Cell)",
    candidateSummary: "2 candidates visible",
    candidates: [
      { name: "Anaya Sharma", program: "Computer Science · Batch 2028", slot: "14:30 – 14:50", fit: 84 },
      { name: "Kabir Mehta", program: "Information Technology · Batch 2028", slot: "14:55 – 15:15", fit: 79 },
    ],
    status: "Scheduled",
    agenda: "Technical architecture evaluation, SQL data query analysis, and practical capability verification.",
  },
  {
    id: "inst-int-02",
    day: "30",
    month: "AUG",
    time: "11:00 – 11:45",
    duration: "45 min",
    title: "Research Operations Associate",
    organizer: "Mosaic Health Labs · Talent Acquisition",
    formatMode: "Online Session",
    location: "Virtual Assessment Room · Google Meet",
    candidateSummary: "1 candidate visible",
    candidates: [
      { name: "Rhea Nair", program: "Computer Science · Batch 2027", slot: "11:00 – 11:45", fit: 74 },
    ],
    status: "Scheduled",
    agenda: "Analytical documentation review, data presentation assessment, and institutional fit interview.",
  },
  {
    id: "inst-int-03",
    day: "02",
    month: "SEP",
    time: "10:00 – 11:00",
    duration: "60 min",
    title: "Graduate Intake Candidate Briefing",
    organizer: "Apex Tech Placement Cell & Industry Council",
    formatMode: "On Campus",
    location: "Auditorium Hall B · Campus Placement Office",
    candidateSummary: "64 students in scope",
    candidates: [
      { name: "Batch 2028 Cohort", program: "All Placement-Eligible Students", slot: "10:00 – 11:00", fit: 78 },
    ],
    status: "Upcoming",
    agenda: "Official candidate briefing on recruiter expectations, skill verification criteria, and interview scheduling protocols.",
  },
];

export function InstitutionInterviews() {
  const [interviewList] = useState<InstitutionInterviewItem[]>(initialInstitutionInterviews);
  const [selectedInterview, setSelectedInterview] = useState<InstitutionInterviewItem | null>(null);
  const [advisorNote, setAdvisorNote] = useState("");

  useEffect(() => {
    if (selectedInterview) {
      try {
        const saved = localStorage.getItem(INST_INTERVIEW_NOTES_PREFIX + selectedInterview.id);
        setAdvisorNote(saved || "");
      } catch {
        setAdvisorNote("");
      }
    }
  }, [selectedInterview]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedInterview(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSaveNote() {
    if (!selectedInterview) return;
    try {
      localStorage.setItem(INST_INTERVIEW_NOTES_PREFIX + selectedInterview.id, advisorNote);
      toast(`Interview log note saved for ${selectedInterview.title}.`);
    } catch {
      toast.error("Could not save note to local storage.");
    }
  }

  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Interviews"
        title="Interview and evaluation visibility"
        description="View scheduled evaluations, participating candidates, and recorded outcomes permitted to the institution."
        meta={<StatusPill>3 Active Schedules</StatusPill>}
      />

      <SectionCard title="Scheduled evaluations & interviews">
        <div className="institution-interviews-card">
          <div className="institution-interviews-table-wrap">
            <div className="institution-interviews-table">
              <div className="institution-interviews-head">
                <span>Date & Time</span>
                <span>Evaluation</span>
                <span>Format & Location</span>
                <span>Cohort Scope</span>
                <span>Action</span>
              </div>

              {interviewList.map((item) => (
                <div className="institution-interviews-row" key={item.id}>
                  <div className="interview-date-cell">
                    <div className="interview-date-badge">
                      <span className="interview-date-day">{item.day}</span>
                      <span className="interview-date-month">{item.month}</span>
                    </div>
                    <div className="interview-date-time">{item.time}</div>
                  </div>

                  <div className="interview-eval-cell">
                    <strong className="interview-eval-title">{item.title}</strong>
                    <span className="interview-eval-organizer">{item.organizer}</span>
                  </div>

                  <div className="interview-format-cell">
                    <span className="interview-format-mode">{item.formatMode}</span>
                    <span className="interview-format-loc">{item.location}</span>
                  </div>

                  <div className="interview-status-cell">
                    <StatusPill tone={item.status === "Scheduled" ? "olive" : "ochre"}>
                      {item.status}
                    </StatusPill>
                    <span className="interview-status-note">{item.candidateSummary}</span>
                  </div>

                  <div className="interview-action-cell">
                    <button
                      className="small-outline"
                      onClick={() => setSelectedInterview(item)}
                    >
                      View context
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Interview Context Modal */}
      {selectedInterview && (
        <div
          className="student-review-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInterview(null);
          }}
        >
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="interview-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Institutional Evaluation Record</span>
                <h2 id="interview-modal-title" className="student-review-title">{selectedInterview.title}</h2>
                <span className="student-review-meta">{selectedInterview.organizer} · {selectedInterview.day} {selectedInterview.month} 2026</span>
              </div>
              <button
                className="student-review-close"
                aria-label="Close interview review"
                onClick={() => setSelectedInterview(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              {/* Key Metrics */}
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Evaluation State</span>
                  <strong className="student-review-stat-value text-olive">{selectedInterview.status}</strong>
                  <span className="student-review-stat-note">{selectedInterview.duration} session</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Format Mode</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "14px", marginTop: "2px" }}>
                    {selectedInterview.formatMode}
                  </strong>
                  <span className="student-review-stat-note">Recruiter-managed</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Candidate Scope</span>
                  <strong className="student-review-stat-value">{selectedInterview.candidates.length}</strong>
                  <span className="student-review-stat-note">Institutional students</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Access Level</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "14px", marginTop: "2px" }}>
                    Authorised
                  </strong>
                  <span className="student-review-stat-note">Placement cell record</span>
                </div>
              </div>

              {/* Section 1: Session Logistics */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Schedule & Logistics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "11.5px" }}>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Time & Date</span>
                    <strong style={{ color: "var(--ink)" }}>{selectedInterview.day} {selectedInterview.month} 2026 · {selectedInterview.time}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Location / Connection</span>
                    <strong style={{ color: "var(--ink)" }}>{selectedInterview.location}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Evaluation Agenda</span>
                    <span style={{ color: "var(--ink)", lineHeight: 1.4 }}>{selectedInterview.agenda}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Participating Students */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">
                  <Check size={13} className="text-olive" /> Participating Institutional Students
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedInterview.candidates.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "var(--muted)",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--ink)", display: "block" }}>{c.name}</strong>
                        <span style={{ color: "var(--slate)", fontSize: "10.5px" }}>{c.program}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "var(--olive)", fontWeight: 700, display: "block" }}>{c.slot}</span>
                        <span style={{ color: "var(--slate)", fontSize: "10px" }}>Fit score: {c.fit}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Institutional Advisor Notes */}
              <div className="student-review-section">
                <h4 className="student-review-section-title">Placement Cell Session Notes</h4>
                <p className="student-review-section-desc">
                  Record logistical arrangements, candidate attendance verification, or feedback for the company recruiter.
                </p>
                <textarea
                  className="review-notes-input"
                  placeholder="e.g. Seminar Room 4 audiovisual equipment tested. Students briefed on technical portfolio presentation."
                  value={advisorNote}
                  onChange={(e) => setAdvisorNote(e.target.value)}
                  rows={3}
                />
                <div className="student-review-notes-actions">
                  <button className="primary-button" onClick={handleSaveNote}>
                    Save Session Note
                  </button>
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedInterview(null)}>
                Back to Interviews
              </button>
              <span className="record-id-meta" style={{ fontSize: "11px", color: "var(--slate)" }}>
                Session ID: {selectedInterview.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </InstitutionLayout>
  );
}

const PLACEMENT_EXPORT_LOG_KEY = "job_buddy_inst_placement_exports";

interface PlacementOfferItem {
  id: string;
  studentName: string;
  program: string;
  company: string;
  role: string;
  packageCTC: string;
  status: "Verified" | "Pending Audit";
  offerDate: string;
}

const samplePlacementOffers: PlacementOfferItem[] = [
  { id: "off-01", studentName: "Anaya Sharma", program: "Computer Science", company: "Northstar Systems", role: "Graduate AI Engineer", packageCTC: "16.5 LPA", status: "Verified", offerDate: "24 Aug 2026" },
  { id: "off-02", studentName: "Kabir Mehta", program: "Information Technology", company: "Northstar Systems", role: "Cloud Data Associate", packageCTC: "14.0 LPA", status: "Verified", offerDate: "25 Aug 2026" },
  { id: "off-03", studentName: "Rhea Nair", program: "Computer Science", company: "Mosaic Health Labs", role: "Health Informatics Analyst", packageCTC: "12.8 LPA", status: "Verified", offerDate: "25 Aug 2026" },
  { id: "off-04", studentName: "Devansh Rastogi", program: "Computer Science", company: "Tern & Co.", role: "Associate Software Engineer", packageCTC: "11.5 LPA", status: "Pending Audit", offerDate: "26 Aug 2026" },
];

interface PlacementShortlistItem {
  id: string;
  studentName: string;
  program: string;
  company: string;
  role: string;
  status: "Shortlisted" | "Interview Scheduled";
  shortlistDate: string;
}

const samplePlacementShortlists: PlacementShortlistItem[] = [
  { id: "sh-01", studentName: "Kabir Mehta", program: "Information Technology", company: "Northstar Systems", role: "Applied AI Capability Studio", status: "Shortlisted", shortlistDate: "21 Aug 2026" },
  { id: "sh-02", studentName: "Anaya Sharma", program: "Computer Science", company: "Northstar Systems", role: "Applied AI Capability Studio", status: "Interview Scheduled", shortlistDate: "21 Aug 2026" },
  { id: "sh-03", studentName: "Rhea Nair", program: "Computer Science", company: "Mosaic Health Labs", role: "Research Operations Associate", status: "Shortlisted", shortlistDate: "22 Aug 2026" },
  { id: "sh-04", studentName: "Devansh Rastogi", program: "Computer Science", company: "Tern & Co.", role: "Digital Product Review Cohort", status: "Shortlisted", shortlistDate: "23 Aug 2026" },
];

export function InstitutionPlacement() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "offers" | "shortlists">("all");
  const [exportFormat, setExportFormat] = useState<"csv" | "summary">("csv");
  const [lastExported, setLastExported] = useState<string | null>(() => {
    try {
      const logs = JSON.parse(localStorage.getItem(PLACEMENT_EXPORT_LOG_KEY) || "[]");
      return logs.length > 0 ? logs[logs.length - 1].timestamp : null;
    } catch {
      return null;
    }
  });

  const handleDownloadReport = () => {
    const timestamp = new Date().toLocaleString();

    if (exportFormat === "csv") {
      const headers = "Record Type,Student Name,Department,Company,Target Role,Package (CTC),Verification Status,Date\n";
      let csvRows = "";

      if (exportScope === "offers") {
        csvRows = samplePlacementOffers.map(
          (o) => `"Offer","${o.studentName}","${o.program}","${o.company}","${o.role}","${o.packageCTC}","${o.status}","${o.offerDate}"`
        ).join("\n");
      } else if (exportScope === "shortlists") {
        csvRows = samplePlacementShortlists.map(
          (s) => `"Shortlist","${s.studentName}","${s.program}","${s.company}","${s.role}","Under Evaluation","${s.status}","${s.shortlistDate}"`
        ).join("\n");
      } else {
        // "all" scope: includes both offers and shortlists
        const offerRows = samplePlacementOffers.map(
          (o) => `"Offer","${o.studentName}","${o.program}","${o.company}","${o.role}","${o.packageCTC}","${o.status}","${o.offerDate}"`
        );
        const shortlistRows = samplePlacementShortlists.map(
          (s) => `"Shortlist","${s.studentName}","${s.program}","${s.company}","${s.role}","Under Evaluation","${s.status}","${s.shortlistDate}"`
        );
        csvRows = [...offerRows, ...shortlistRows].join("\n");
      }

      const blob = new Blob([headers + csvRows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Job_Buddy_Placement_Report_${exportScope}_Batch2028.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // "summary" format: generate detailed audit summary text report
      let summaryText = `================================================================================
JOB BUDDY — INSTITUTIONAL PLACEMENT AUDIT SUMMARY REPORT
Governed Institutional Placement Office · Batch 2028
================================================================================

[REPORT METADATA]
Export Timestamp     : ${timestamp}
Selected Data Scope  : ${exportScope === "all" ? "All (Applications, Shortlists & Offers)" : exportScope === "offers" ? "Offers" : "Shortlists"}
Reporting Window     : Active · Batch 2028 Academic Cycle
Authorisation Level  : Institution Authorised Audit Log
File Name            : Job_Buddy_Placement_Audit_Summary_${exportScope}_Batch2028.txt

--------------------------------------------------------------------------------
1. SCOPE & COHORT OVERVIEW
--------------------------------------------------------------------------------
Batch Scope          : Batch 2028 (Computer Science & Engineering, Information Technology)
Total Cohort In Scope: 64 Students
Placement Window     : Open
Reporting Controls   : Privacy-Governed Extraction (Authorised Access Only)
`;

      if (exportScope === "offers") {
        summaryText += `
Total Offers In Window : 18 Offers
Offers In Export Scope : 4 Sample Audited Records
Offer Verification Rate: 94.4% (17 of 18 verified by institution)

--------------------------------------------------------------------------------
2. COMPENSATION & HIRING METRICS (OFFERS SCOPE)
--------------------------------------------------------------------------------
Highest Package (CTC)  : 16.5 LPA (Northstar Systems · Graduate AI Engineer)
Lowest Package (CTC)   : 11.5 LPA (Tern & Co. · Associate Software Engineer)
Average Package (CTC)  : 13.7 LPA
Partner Organizations  : Northstar Systems (2 offers), Mosaic Health Labs (1 offer), Tern & Co. (1 offer)
Department Distribution: Computer Science (3), Information Technology (1)

--------------------------------------------------------------------------------
3. AUDITED OFFER RECORDS (${samplePlacementOffers.length} RECORDS INCLUDED)
--------------------------------------------------------------------------------
${samplePlacementOffers.map((o, idx) => `[${idx + 1}] ${o.studentName} (${o.program})
    Company: ${o.company} | Role: ${o.role}
    Package: ${o.packageCTC} | Status: ${o.status} | Date: ${o.offerDate}`).join("\n\n")}
`;
      } else if (exportScope === "shortlists") {
        summaryText += `
Total Shortlists In Window : 44 Shortlists
Shortlists In Export Scope : 4 Sample Audited Records
Interview Readiness        : 100% Meeting Published Eligibility Criteria

--------------------------------------------------------------------------------
2. SHORTLIST PIPELINE METRICS (SHORTLISTS SCOPE)
--------------------------------------------------------------------------------
Active Pipeline Roles  : Applied AI Capability Studio, Research Operations Associate, Digital Product Review
Partner Organizations  : Northstar Systems (2), Mosaic Health Labs (1), Tern & Co. (1)
Department Distribution: Computer Science (3), Information Technology (1)
Interview Status       : 1 Interview Scheduled, 3 Screening Shortlisted

--------------------------------------------------------------------------------
3. AUDITED SHORTLIST RECORDS (${samplePlacementShortlists.length} RECORDS INCLUDED)
--------------------------------------------------------------------------------
${samplePlacementShortlists.map((s, idx) => `[${idx + 1}] ${s.studentName} (${s.program})
    Company: ${s.company} | Target Role: ${s.role}
    Compensation: Under Evaluation | Status: ${s.status} | Shortlisted Date: ${s.shortlistDate}`).join("\n\n")}
`;
      } else {
        // "all" scope
        summaryText += `
Total Applications in Scope : 186
Total Shortlisted Candidates: 44
Total Offers Extended       : 18
Verified Offers             : 17 / 18
Total Records in Export     : ${samplePlacementOffers.length + samplePlacementShortlists.length} Audited Sample Records (4 Offers + 4 Shortlists)

--------------------------------------------------------------------------------
2. FULL FUNNEL CONVERSION METRICS (ALL SCOPE)
--------------------------------------------------------------------------------
Application-to-Shortlist Conversion : 23.7% (44 shortlisted from 186 applications)
Shortlist-to-Offer Conversion       : 40.9% (18 offers from 44 shortlists)
Application-to-Offer Conversion     : 9.7% (18 offers from 186 applications)
Offer Verification Compliance       : 94.4% (17 verified offers)
Active Recruitment Partners         : Northstar Systems, Mosaic Health Labs, Tern & Co.

--------------------------------------------------------------------------------
3. AUDITED PLACEMENT RECORDS (${samplePlacementOffers.length + samplePlacementShortlists.length} RECORDS INCLUDED)
--------------------------------------------------------------------------------
--- OFFERS SECTION (${samplePlacementOffers.length} Records) ---
${samplePlacementOffers.map((o, idx) => `[Offer ${idx + 1}] ${o.studentName} (${o.program})
    Company: ${o.company} | Role: ${o.role}
    Package: ${o.packageCTC} | Status: ${o.status} | Date: ${o.offerDate}`).join("\n\n")}

--- SHORTLISTS SECTION (${samplePlacementShortlists.length} Records) ---
${samplePlacementShortlists.map((s, idx) => `[Shortlist ${idx + 1}] ${s.studentName} (${s.program})
    Company: ${s.company} | Target Role: ${s.role}
    Compensation: Under Evaluation | Status: ${s.status} | Shortlisted Date: ${s.shortlistDate}`).join("\n\n")}
`;
      }

      summaryText += `
--------------------------------------------------------------------------------
4. GOVERNANCE & AUDIT COMPLIANCE
--------------------------------------------------------------------------------
- Exported under Institutional Authority for Job Buddy Placement Governance.
- Records reflect verified candidate credentials and authorised offer details.
- Logged in localStorage [${PLACEMENT_EXPORT_LOG_KEY}].
- Sign-off: University Placement Cell Directorate · Batch 2028.
================================================================================
END OF AUDIT SUMMARY
================================================================================
`;

      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Job_Buddy_Placement_Audit_Summary_${exportScope}_Batch2028.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    try {
      const existing = JSON.parse(localStorage.getItem(PLACEMENT_EXPORT_LOG_KEY) || "[]");
      existing.push({ timestamp, scope: exportScope, format: exportFormat });
      localStorage.setItem(PLACEMENT_EXPORT_LOG_KEY, JSON.stringify(existing));
    } catch {}

    setLastExported(timestamp);
    setIsExportModalOpen(false);
    toast.success(`Placement report exported successfully (${exportFormat.toUpperCase()}).`);
  };

  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Placement status"
        title="Placement reporting record"
        description="A controlled summary of placement-window status and offer outcomes visible to the institution."
        meta={<StatusPill tone="olive">Batch 2028 · Window Active</StatusPill>}
      />
      <div className="placement-layout">
        <SectionCard title="Current reporting period">
          <div className="placement-status">
            <span>Placement window</span>
            <b>Open</b>
            <p>Batch 2028 · Current reporting period</p>
          </div>
          <div className="placement-figures">
            <StatCard label="Applications" value="186" />
            <StatCard label="Shortlists" value="44" />
            <StatCard label="Offers" value="18" />
          </div>
        </SectionCard>
        <SectionCard title="Reporting controls">
          <KeyValue label="Record visibility" value="Institution authorised" />
          <KeyValue label="Offer verification" value="17 / 18 verified" />
          <KeyValue label="Last refreshed" value="26 Aug, 09:00" />
          {lastExported && <KeyValue label="Last export" value={lastExported} />}
          <button
            className="primary-button full-button"
            onClick={() => setIsExportModalOpen(true)}
            style={{ marginTop: "12px" }}
          >
            Export current report
          </button>
        </SectionCard>
      </div>

      {/* Verified Offers Table Preview */}
      <SectionCard title="Verified offer sample & audit status">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {samplePlacementOffers.map((offer) => (
            <div
              key={offer.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                fontSize: "12px",
              }}
            >
              <div>
                <strong style={{ color: "var(--ink)", display: "block", fontSize: "13px" }}>{offer.studentName}</strong>
                <span style={{ color: "var(--slate)" }}>{offer.program} · {offer.company} ({offer.role})</span>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>{offer.packageCTC}</strong>
                  <span style={{ color: "var(--slate)", fontSize: "10.5px" }}>{offer.offerDate}</span>
                </div>
                <StatusPill tone={offer.status === "Verified" ? "olive" : "ochre"}>{offer.status}</StatusPill>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Export Report Modal */}
      {isExportModalOpen && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsExportModalOpen(false); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="export-modal-title" style={{ maxWidth: "540px" }}>
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Institutional Reporting</span>
                <h2 id="export-modal-title" className="student-review-title">Export Placement Records</h2>
                <span className="student-review-meta">Batch 2028 · Governed Data Extraction</span>
              </div>
              <button className="student-review-close" onClick={() => setIsExportModalOpen(false)} aria-label="Close export dialog">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-section">
                <h4 className="student-review-section-title">Data Scope</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "6px" }}>
                  {(["all", "offers", "shortlists"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setExportScope(s)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        border: exportScope === s ? "2px solid var(--olive)" : "1px solid var(--rule)",
                        background: exportScope === s ? "var(--olive-wash)" : "var(--surface)",
                        color: exportScope === s ? "var(--olive)" : "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {s === "all" ? "All (186)" : s === "offers" ? "Offers (18)" : "Shortlists (44)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Output Format</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                  {(["csv", "summary"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        border: exportFormat === fmt ? "2px solid var(--olive)" : "1px solid var(--rule)",
                        background: exportFormat === fmt ? "var(--olive-wash)" : "var(--surface)",
                        color: exportFormat === fmt ? "var(--olive)" : "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {fmt === "csv" ? "CSV Spreadsheet (.csv)" : "Audit Summary"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Governed Institutional Compliance</h4>
                <p className="student-review-section-desc">
                  Exports are privacy-controlled and recorded in the institutional audit log. Only verified candidate credentials and authorised offer details are included.
                </p>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setIsExportModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={handleDownloadReport}>
                Download & Log Export
              </button>
            </div>
          </div>
        </div>
      )}
    </InstitutionLayout>
  );
}

interface AlignmentTrackItem {
  id: string;
  title: string;
  evidenceDesc: string;
  score: number;
  studentsInScope: number;
  benchmarkStudents: number;
  strongCompetencies: string[];
  growthAreas: string[];
  curriculumAdvice: string;
}

const alignmentTracks: AlignmentTrackItem[] = [
  {
    id: "app-sys",
    title: "Applied systems",
    evidenceDesc: "Strong institution-level evidence in Python and data analysis.",
    score: 82,
    studentsInScope: 64,
    benchmarkStudents: 53,
    strongCompetencies: ["Python scripting", "SQL relational modeling", "Data wrangling"],
    growthAreas: ["System architecture diagrams", "Scalability benchmarks"],
    curriculumAdvice: "Introduce production-grade microservices and containerized workflows in semester 6 lab sessions.",
  },
  {
    id: "res-ops",
    title: "Research operations",
    evidenceDesc: "Evidence present; writing and presentation skill remains a development area.",
    score: 71,
    studentsInScope: 64,
    benchmarkStudents: 45,
    strongCompetencies: ["Literature search", "Methodology documentation", "Data synthesis"],
    growthAreas: ["Executive technical writing", "Live oral pitch presentation"],
    curriculumAdvice: "Incorporate peer-reviewed capstone presentations with industry mentor evaluation rubrics.",
  },
  {
    id: "dig-prod",
    title: "Digital product",
    evidenceDesc: "Evidence coverage requires more user-research work samples.",
    score: 58,
    studentsInScope: 64,
    benchmarkStudents: 37,
    strongCompetencies: ["User persona definition", "Figma wireframing"],
    growthAreas: ["Usability testing methodologies", "Telemetry metrics analysis"],
    curriculumAdvice: "Partner with industry design sprint mentors to provide live product review cohorts.",
  },
];

export function InstitutionAlignment() {
  const [selectedTrack, setSelectedTrack] = useState<AlignmentTrackItem | null>(null);

  return (
    <InstitutionLayout>
      <PageHeader
        eyebrow="Skill alignment"
        title="Institution-to-industry alignment"
        description="Review the current relationship between student evidence, role requirements, and industry skill demand."
        meta={<StatusPill tone="olive">3 Tracks Mapped</StatusPill>}
      />
      <div className="detail-layout">
        <SectionCard title="Current alignment">
          <div className="map-list">
            {alignmentTracks.map((track) => (
              <article key={track.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>{track.title}</h3>
                  <p style={{ margin: "4px 0 0", color: "var(--slate)", fontSize: "11.5px" }}>{track.evidenceDesc}</p>
                </div>
                <div className="map-score" style={{ minWidth: "110px" }}>
                  <b>{track.score}%</b>
                  <ProgressBar value={track.score} />
                </div>
                <button
                  className="small-outline"
                  onClick={() => setSelectedTrack(track)}
                >
                  Inspect track
                </button>
              </article>
            ))}
          </div>
        </SectionCard>

        <aside className="stack-lg">
          <img className="role-illustration" src={institutionReadiness} alt="Abstract institution and industry alignment illustration" />
          <SectionCard title="Data basis">
            <p className="body-copy">This view uses verified student profiles, role skill requirements, and current demand records. It is not a career-guidance module.</p>
          </SectionCard>
        </aside>
      </div>

      {/* Alignment Track Detail Modal */}
      {selectedTrack && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTrack(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="track-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Industry Skill Alignment Track</span>
                <h2 id="track-modal-title" className="student-review-title">{selectedTrack.title} Track</h2>
                <span className="student-review-meta">{selectedTrack.benchmarkStudents} of {selectedTrack.studentsInScope} students meeting benchmark</span>
              </div>
              <button className="student-review-close" onClick={() => setSelectedTrack(null)} aria-label="Close track review">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Alignment Score</span>
                  <strong className="student-review-stat-value text-olive">{selectedTrack.score}%</strong>
                  <span className="student-review-stat-note">Industry standard match</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Benchmark Met</span>
                  <strong className="student-review-stat-value">{selectedTrack.benchmarkStudents}</strong>
                  <span className="student-review-stat-note">Students verified</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Cohort Scope</span>
                  <strong className="student-review-stat-value">{selectedTrack.studentsInScope}</strong>
                  <span className="student-review-stat-note">Computer Science 2028</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Curriculum Signal</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px", marginTop: "2px" }}>
                    {selectedTrack.score >= 75 ? "Healthy" : "Needs Review"}
                  </strong>
                  <span className="student-review-stat-note">Faculty advisory</span>
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">
                  <Check size={13} className="text-olive" /> Strong Student Competencies
                </h4>
                <div className="student-review-skills-list">
                  {selectedTrack.strongCompetencies.map((c) => (
                    <span key={c} className="student-skill-badge">{c}</span>
                  ))}
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Primary Development & Growth Areas</h4>
                <div className="student-review-skills-list">
                  {selectedTrack.growthAreas.map((g) => (
                    <span key={g} className="student-skill-badge" style={{ borderColor: "var(--ochre)", color: "var(--ochre)" }}>{g}</span>
                  ))}
                </div>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Curriculum Advisory Recommendation</h4>
                <p className="student-review-section-desc" style={{ color: "var(--ink)", fontSize: "12px", lineHeight: 1.5 }}>
                  {selectedTrack.curriculumAdvice}
                </p>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedTrack(null)}>Back to Alignment</button>
              <Link href="/institution/curriculum" className="primary-button" onClick={() => setSelectedTrack(null)}>
                Open Curriculum Alignment <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </InstitutionLayout>
  );
}

const ACAD_PREFS_KEY = "job_buddy_acad_prefs";
export function loadAcadPrefs(): { evidenceUpdates: boolean; eventUpdates: boolean } {
  try {
    const raw = localStorage.getItem(ACAD_PREFS_KEY);
    return raw ? JSON.parse(raw) : { evidenceUpdates: true, eventUpdates: true };
  } catch {
    return { evidenceUpdates: true, eventUpdates: true };
  }
}

export function AcademicianDashboard() {
  const [prefs] = useState<{ evidenceUpdates: boolean; eventUpdates: boolean }>(loadAcadPrefs);

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Academician workspace"
        title="Student evidence and learning alignment"
        description="Review the approved student skill-map and learning-alignment context for your academic scope."
        meta={<StatusPill>Computer Science · Batch 2028</StatusPill>}
      />

      <div className="stat-grid">
        <StatCard label="Students in scope" value="64" note="Assigned academic context" />
        <StatCard
          label="Current skill maps"
          value={prefs.evidenceUpdates ? "53" : "Muted"}
          tone={prefs.evidenceUpdates ? "olive" : undefined}
          note={prefs.evidenceUpdates ? "Evidence-led records" : "Evidence alerts muted in profile"}
        />
        <StatCard label="Learning alignment notes" value="11" tone="ochre" note="Review-ready" />
        <StatCard
          label="Upcoming events"
          value={prefs.eventUpdates ? "03" : "Muted"}
          note={prefs.eventUpdates ? "This week" : "Event notices muted in profile"}
        />
      </div>

      <div className="dashboard-grid">
        <div className="stack-lg">
          <SectionCard
            title="Student skill-map review"
            aside={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {!prefs.evidenceUpdates && <StatusPill tone="muted">Alerts Muted</StatusPill>}
                <ActionLink href="/academician/student-maps">Open maps</ActionLink>
              </div>
            }
          >
            {!prefs.evidenceUpdates ? (
              <div style={{ padding: "14px 16px", background: "var(--muted)", borderRadius: "8px", border: "1px dashed var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--ink)" }}>Student evidence updates are currently muted</strong>
                  <span style={{ fontSize: "11px", color: "var(--slate)" }}>Real-time evidence change alerts are suppressed according to your profile preferences.</span>
                </div>
                <Link href="/academician/profile" className="action-link" style={{ fontSize: "12px" }}>
                  Manage preferences →
                </Link>
              </div>
            ) : (
              <div className="activity-list">
                <article>
                  <div>
                    <b>Applied systems alignment</b>
                    <span>Python and data analysis coverage is strong across current evidence.</span>
                  </div>
                  <StatusPill>82%</StatusPill>
                  <Link href="/academician/student-maps" className="action-link">
                    Review <ArrowRight size={15} />
                  </Link>
                </article>
                <article>
                  <div>
                    <b>Research operations alignment</b>
                    <span>Presentation evidence is the leading development signal.</span>
                  </div>
                  <StatusPill tone="ochre">71%</StatusPill>
                  <Link href="/academician/learning-alignment" className="action-link">
                    Review <ArrowRight size={15} />
                  </Link>
                </article>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Events in your academic scope"
            aside={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {!prefs.eventUpdates && <StatusPill tone="muted">Alerts Muted</StatusPill>}
                <ActionLink href="/academician/events">All events</ActionLink>
              </div>
            }
          >
            {!prefs.eventUpdates ? (
              <div style={{ padding: "14px 16px", background: "var(--muted)", borderRadius: "8px", border: "1px dashed var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--ink)" }}>Placement and evaluation event alerts are muted</strong>
                  <span style={{ fontSize: "11px", color: "var(--slate)" }}>Automated event notifications are hidden based on your profile preferences.</span>
                </div>
                <Link href="/academician/profile" className="action-link" style={{ fontSize: "12px" }}>
                  Manage preferences →
                </Link>
              </div>
            ) : (
              <div>
                <ScheduleLine time="11:00" title="Skill evidence clinic" meta="Student profile support · Online" kind="Event" />
                <ScheduleLine time="14:30" title="Candidate evaluation briefing" meta="Placement office · Seminar room 4" kind="Evaluation" />
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="stack-lg">
          <img className="role-illustration" src={academicianLearningMap} alt="Abstract academician learning alignment illustration" />
          <SectionCard title="Academic role">
            <p className="body-copy">
              This workspace provides student evidence review, learning alignment, academic collaboration, industrial training, and Faculty Development Program opportunities for your academic role.
            </p>
            <Link href="/academician/profile" className="action-link">
              Open profile <ArrowRight size={15} />
            </Link>
          </SectionCard>
        </aside>
      </div>
    </AcademicianLayout>
  );
}

export function AcademicianStudentMaps() {
  const [candidatesList, setCandidatesList] = useState<CandidateRecord[]>(loadCandidates);
  const [selectedStudent, setSelectedStudent] = useState<CandidateRecord | null>(null);
  const [studentNote, setStudentNote] = useState("");

  useEffect(() => {
    setCandidatesList(loadCandidates());
  }, []);

  // Sync saved note for the selected student from local storage
  useEffect(() => {
    if (selectedStudent) {
      try {
        const savedNote = localStorage.getItem(`job_buddy_acad_note_${selectedStudent.id}`);
        setStudentNote(savedNote || "");
      } catch {
        setStudentNote("");
      }
    }
  }, [selectedStudent]);

  // Handle saving academic observation note
  const handleSaveNote = () => {
    if (!selectedStudent) return;
    try {
      localStorage.setItem(`job_buddy_acad_note_${selectedStudent.id}`, studentNote);
      toast.success(`Academic observation saved for ${selectedStudent.name}`);
    } catch {
      toast.error("Unable to save note to local storage");
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStudent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Student skill maps"
        title="Evidence-led student alignment"
        description="Review aggregate and student-level alignment notes within the authorised academic context."
      />

      <SectionCard title="Student alignment list">
        <div className="student-maps-table-wrap">
          <div className="student-maps-table">
            <div className="student-maps-head">
              <span>Student</span>
              <span>Industry alignment</span>
              <span>Role alignment</span>
              <span>Evidence status</span>
              <span style={{ textAlign: "right" }}>Action</span>
            </div>

            {candidatesList.map((candidate) => {
              const programParts = (candidate.program || "").split(" · ");
              const department = programParts[0] || candidate.program || "Computer Science";
              const batch = programParts[1] || "Batch 2028";
              const isHighScorer = candidate.score >= 80;
              const industryTrack = isHighScorer ? "Applied systems" : "Research operations";
              const industryScore = isHighScorer ? 86 : 74;
              const roleTrack = candidate.opportunityTitle || (isHighScorer ? "Applied AI Capability Studio" : "Research Operations Associate");
              const isCurrent = candidate.eligibility === "Eligible";

              return (
                <div className="student-maps-row" key={candidate.id}>
                  {/* Column 1: Prominent student name with secondary department & batch */}
                  <div className="student-info-cell">
                    <b className="student-name">{candidate.name}</b>
                    <span className="student-meta">{department} · {batch}</span>
                  </div>

                  {/* Column 2: Industry Alignment */}
                  <div className="alignment-cell" data-label="Industry alignment">
                    <span className="alignment-track">{industryTrack}</span>
                    <span className="alignment-sub">{industryScore}% track alignment</span>
                  </div>

                  {/* Column 3: Role Alignment */}
                  <div className="alignment-cell" data-label="Role alignment">
                    <span className="alignment-track">{roleTrack}</span>
                    <span className="alignment-sub">{candidate.score}% role fit</span>
                  </div>

                  {/* Column 4: Evidence Status (Pill + % + Progress Bar grouped) */}
                  <div className="evidence-status-cell">
                    <div className="evidence-status-header">
                      <StatusPill tone={isCurrent ? "olive" : "ochre"}>
                        {isCurrent ? "Current" : "Developing"}
                      </StatusPill>
                      <span className="evidence-percentage">{candidate.score}%</span>
                    </div>
                    <ProgressBar value={candidate.score} />
                  </div>

                  {/* Column 5: Review Action */}
                  <div className="student-maps-action">
                    <button
                      type="button"
                      className="student-review-btn"
                      onClick={() => setSelectedStudent(candidate)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Dynamic Student Review Detail Modal */}
      {selectedStudent && (
        <div
          className="student-review-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
        >
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="student-review-heading">
            {/* Modal Header */}
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Academician Review · Student Evidence Record</span>
                <h2 id="student-review-heading" className="student-review-title">{selectedStudent.name}</h2>
                <span className="student-review-meta">
                  {selectedStudent.program} · {selectedStudent.email || `${selectedStudent.id}@apex-tech.edu`}
                </span>
              </div>
              <button
                type="button"
                className="student-review-close"
                aria-label="Close review"
                onClick={() => setSelectedStudent(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="student-review-body">
              {/* Stat Grid */}
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Evidence Score</span>
                  <strong className="student-review-stat-value" style={{ color: "var(--olive)" }}>
                    {selectedStudent.score}%
                  </strong>
                  <span className="student-review-stat-note">Overall composite</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Evidence Status</span>
                  <div style={{ marginTop: "3px" }}>
                    <StatusPill tone={selectedStudent.eligibility === "Eligible" ? "olive" : "ochre"}>
                      {selectedStudent.eligibility === "Eligible" ? "Current" : "Developing"}
                    </StatusPill>
                  </div>
                  <span className="student-review-stat-note">{selectedStudent.stage} stage</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Industry Track</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "14px", marginTop: "2px" }}>
                    {selectedStudent.score >= 80 ? "Applied systems" : "Research operations"}
                  </strong>
                  <span className="student-review-stat-note">
                    {selectedStudent.score >= 80 ? "86% alignment" : "74% alignment"}
                  </span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Role Target</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px", marginTop: "2px" }}>
                    {selectedStudent.opportunityTitle || (selectedStudent.score >= 80 ? "Applied AI Studio" : "Research Operations")}
                  </strong>
                  <span className="student-review-stat-note">{selectedStudent.score}% role fit</span>
                </div>
              </div>

              {/* Section 1: Verified Capabilities & Academic Context */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <Check size={14} style={{ color: "var(--olive)" }} />
                  Verified Skills & Demonstrated Capabilities
                </h3>
                <div className="student-review-skills-list">
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    selectedStudent.skills.map((skill) => (
                      <span className="student-skill-badge" key={skill}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--slate)" }}>No verified skills recorded.</span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px", fontSize: "11.5px" }}>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Department Scope</span>
                    <b>{(selectedStudent.program || "").split(" · ")[0] || selectedStudent.program}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Academic Cohort</span>
                    <b>{(selectedStudent.program || "").split(" · ")[1] || "Batch 2028"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Associated Opportunity</span>
                    <b>{selectedStudent.opportunityTitle || "Institutional Placement Cohort"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--slate)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Application Record</span>
                    <b>{selectedStudent.appliedDate || "Current Evaluation Term"}</b>
                  </div>
                </div>
              </div>

              {/* Section 2: Learning Alignment Recommendations */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <GraduationCap size={14} style={{ color: "var(--olive)" }} />
                  Curriculum & Learning Alignment Recommendation
                </h3>
                <p style={{ margin: 0, fontSize: "11.5px", color: "var(--slate)", lineHeight: 1.55 }}>
                  {selectedStudent.score >= 80
                    ? "Student exhibits high proficiency in computational foundations. Recommended action: Complete the SQL evidence workshop to reinforce database pipeline artifacts for applied systems evaluation."
                    : "Student exhibits sound analytical writing discipline. Recommended action: Complete the 'Communicating analytical findings' clinic to bolster presentation and verbal briefing evidence."}
                </p>
              </div>

              {/* Section 3: Data Boundaries & Unavailable Backend Evidence Notice */}
              <div className="student-review-notice-box">
                <b>Institutional Data Scope Notice</b>
                <p>
                  Official semester marksheets, proctored exam telemetry, and uploaded project dossiers are not stored in the client-side data register. Full archival artifacts require connected institutional SIS/LMS backend API integration.
                </p>
              </div>

              {/* Section 4: Faculty Advisor Observation Notes */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <FilePenLine size={14} style={{ color: "var(--olive)" }} />
                  Faculty Advisor Observations
                </h3>
                <div className="student-review-notes-area">
                  <textarea
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder={`Record academic feedback, advising notes, or skill remediation advice for ${selectedStudent.name}...`}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: "6px 14px", fontSize: "11px" }}
                      onClick={handleSaveNote}
                    >
                      Save Observation
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="student-review-footer">
              <button
                type="button"
                className="small-outline"
                onClick={() => setSelectedStudent(null)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ArrowLeft size={13} /> Back to Student List
              </button>
              <span style={{ fontSize: "10.5px", color: "var(--slate)" }}>
                Student Record ID: {selectedStudent.id} · Academician Authorised
              </span>
            </div>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}

interface LearningAlignmentProgram {
  id: string;
  title: string;
  type: string;
  provider: string;
  duration: string;
  fit: string;
  industryTrack: string;
  targetRole: string;
  skills: string[];
  recommendedStudents: Array<{ name: string; program: string; gap: string }>;
  curriculumRationale: string;
  syllabusHighlights: string[];
}

const academicLearningPrograms: LearningAlignmentProgram[] = [
  {
    id: "sql-evidence",
    title: "SQL evidence workshop",
    type: "Guided Workshop",
    provider: "Data Practice Network",
    duration: "3 guided sessions",
    fit: "Addresses high-priority industry requirements in database pipeline modeling and schema analysis.",
    industryTrack: "Applied systems and data operations",
    targetRole: "Applied AI Capability Studio · Data Operations Associate",
    skills: ["SQL", "Data Analysis", "Database Schemas", "Query Optimization"],
    recommendedStudents: [
      { name: "Anaya Sharma", program: "Computer Science · Batch 2028", gap: "Declared Python proficiency; SQL portfolio sample needed for offer stage" },
      { name: "Kabir Mehta", program: "Information Technology · Batch 2028", gap: "Strong analytical baseline; relational query evidence developing" },
    ],
    curriculumRationale: "Mapped against current role requirements from Northstar Systems and Mosaic Health Labs, which designate SQL as a required or preferred core competency for 2028 graduates.",
    syllabusHighlights: [
      "Session 1: Relational Modeling & Complex Joins under Production Constraints",
      "Session 2: Analytical Aggregations, Window Functions, and Query Performance",
      "Session 3: Capstone Evidence Artifact – Exporting Verified Query Dossiers to Student Portfolio",
    ],
  },
  {
    id: "analytical-findings",
    title: "Communicating analytical findings",
    type: "Executive Clinic & Assessment",
    provider: "Industry Council Academic Committee",
    duration: "2 guided sessions + assessment",
    fit: "Strengthens presentation evidence, stakeholder briefing skills, and technical storytelling.",
    industryTrack: "Research operations and applied analytics",
    targetRole: "Research Operations Associate · Analytics Briefing Lead",
    skills: ["Technical Presentation", "Stakeholder Briefing", "Analytical Writing", "Visualization"],
    recommendedStudents: [
      { name: "Rhea Nair", program: "Computer Science · Batch 2027", gap: "Solid written documentation; oral briefing evidence required for partner interviews" },
      { name: "Anaya Sharma", program: "Computer Science · Batch 2028", gap: "Supporting communication signal flagged for multi-stakeholder project review" },
    ],
    curriculumRationale: "Directly addresses the presentation gap identified in the Academician Student Skill Map for students transitioning from raw analysis to recruiter-facing briefings.",
    syllabusHighlights: [
      "Session 1: Translating Technical Data Models into Executive Summaries",
      "Session 2: Live Oral Briefing Simulation with Recruiter Rubric Rubrics",
      "Assessment: 3-minute recorded walkthrough verified by Faculty Reviewer",
    ],
  },
  {
    id: "research-writing",
    title: "Evidence-led research writing",
    type: "Faculty-Supported Lab",
    provider: "Research Practice Network",
    duration: "4 guided sessions",
    fit: "Builds structured research documentation discipline, literature synthesis, and methodology tracking.",
    industryTrack: "Health research and operations",
    targetRole: "Research Operations Associate · Clinical Data Support",
    skills: ["Research Methodology", "Documentation Discipline", "Literature Synthesis", "Ethics & Confidentiality"],
    recommendedStudents: [
      { name: "Rhea Nair", program: "Computer Science · Batch 2027", gap: "Directly matches thesis and clinical documentation requirements" },
      { name: "Kabir Mehta", program: "Information Technology · Batch 2028", gap: "Expands cross-disciplinary research evidence base" },
    ],
    curriculumRationale: "Aligned with Mosaic Health Labs research partnership guidelines where reproducible documentation and confidentiality protocols are required.",
    syllabusHighlights: [
      "Session 1: Systematic Literature Synthesis and Problem Formulation",
      "Session 2: Research Protocol Documentation & Data Provenance Standards",
      "Session 3: Ethical Compliance and Confidentiality in Health-Data Contexts",
      "Session 4: Final Peer-Reviewed Artifact Submission",
    ],
  },
];

export function AcademicianLearningAlignment() {
  const [selectedProgram, setSelectedProgram] = useState<LearningAlignmentProgram | null>(null);
  const [programNote, setProgramNote] = useState("");
  const [endorsedPrograms, setEndorsedPrograms] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("job_buddy_acad_learning_endorsements");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Load saved note when selected program changes
  useEffect(() => {
    if (selectedProgram) {
      try {
        const saved = localStorage.getItem(`job_buddy_acad_learning_note_${selectedProgram.id}`);
        setProgramNote(saved || "");
      } catch {
        setProgramNote("");
      }
    }
  }, [selectedProgram]);

  // Handle saving curriculum note
  const handleSaveNote = () => {
    if (!selectedProgram) return;
    try {
      localStorage.setItem(`job_buddy_acad_learning_note_${selectedProgram.id}`, programNote);
      toast.success(`Curriculum note saved for ${selectedProgram.title}`);
    } catch {
      toast.error("Unable to save note to local storage");
    }
  };

  // Toggle program endorsement
  const handleToggleEndorsement = () => {
    if (!selectedProgram) return;
    const nextState = !endorsedPrograms[selectedProgram.id];
    const updated = { ...endorsedPrograms, [selectedProgram.id]: nextState };
    setEndorsedPrograms(updated);
    try {
      localStorage.setItem("job_buddy_acad_learning_endorsements", JSON.stringify(updated));
    } catch {}
    if (nextState) {
      toast.success(`Endorsed '${selectedProgram.title}' for Computer Science Batch 2028 scope.`);
    } else {
      toast.info(`Endorsement removed for '${selectedProgram.title}'.`);
    }
  };

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProgram(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Learning alignment"
        title="Programs matched to skill evidence"
        description="Review selected learning-program alignment without adding a separate career-guidance module."
      />

      <div className="detail-layout">
        <SectionCard title="Priority learning alignment">
          <div className="learning-list">
            {academicLearningPrograms.map((prog, idx) => {
              const isEndorsed = Boolean(endorsedPrograms[prog.id]);
              return (
                <article key={prog.id}>
                  <div className="book-mark">
                    {idx === 0 ? <GraduationCap size={18} /> : idx === 1 ? <FileCheck2 size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3>{prog.title}</h3>
                      {isEndorsed && <StatusPill tone="olive">Endorsed</StatusPill>}
                    </div>
                    <p>{prog.fit}</p>
                    <small>{prog.duration} · {prog.provider}</small>
                  </div>
                  <button
                    type="button"
                    className="small-outline"
                    onClick={() => setSelectedProgram(prog)}
                  >
                    Review
                  </button>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <aside className="stack-lg">
          <img className="role-illustration" src={academicianLearningMap} alt="Abstract curriculum and industry skills illustration" />
          <SectionCard title="Alignment method">
            <p className="body-copy">
              Programs are mapped against verified skills, role requirements, industry demand, and known evidence gaps.
            </p>
          </SectionCard>
          <SectionCard title="Academic scope">
            <KeyValue label="Department" value="Computer Science" />
            <KeyValue label="Active cohort" value="Batch 2028 (64 students)" />
            <KeyValue label="Programs mapped" value={`${academicLearningPrograms.length} priority programs`} />
          </SectionCard>
        </aside>
      </div>

      {/* Review Modal for Selected Learning Alignment Program */}
      {selectedProgram && (
        <div
          className="student-review-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProgram(null);
          }}
        >
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="learning-review-heading">
            {/* Modal Header */}
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Academician Review · Learning Alignment Program</span>
                <h2 id="learning-review-heading" className="student-review-title">{selectedProgram.title}</h2>
                <span className="student-review-meta">
                  {selectedProgram.type} · {selectedProgram.provider} · {selectedProgram.duration}
                </span>
              </div>
              <button
                type="button"
                className="student-review-close"
                aria-label="Close review"
                onClick={() => setSelectedProgram(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="student-review-body">
              {/* Stat Grid */}
              <div className="student-review-stat-grid">
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Duration</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "14px" }}>
                    {selectedProgram.duration}
                  </strong>
                  <span className="student-review-stat-note">{selectedProgram.type}</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Industry Track</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px" }}>
                    {selectedProgram.industryTrack.split(" and ")[0]}
                  </strong>
                  <span className="student-review-stat-note">High demand signal</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Target Role</span>
                  <strong className="student-review-stat-value" style={{ fontSize: "13px" }}>
                    {selectedProgram.targetRole.split(" · ")[0]}
                  </strong>
                  <span className="student-review-stat-note">Industry mapped</span>
                </div>
                <div className="student-review-stat">
                  <span className="student-review-stat-label">Endorsement</span>
                  <div style={{ marginTop: "3px" }}>
                    <StatusPill tone={endorsedPrograms[selectedProgram.id] ? "olive" : "ochre"}>
                      {endorsedPrograms[selectedProgram.id] ? "Endorsed" : "Pending Review"}
                    </StatusPill>
                  </div>
                  <span className="student-review-stat-note">Cohort scope</span>
                </div>
              </div>

              {/* Endorsement Callout Box */}
              <div className="learning-endorse-box">
                <div>
                  <b style={{ fontSize: "12px", color: "var(--olive-deep)" }}>Cohort Curriculum Endorsement</b>
                  <p>
                    {endorsedPrograms[selectedProgram.id]
                      ? "This program is currently endorsed for your assigned students (Computer Science · Batch 2028). Recommended students will see this program prioritized."
                      : "Endorse this learning alignment program so assigned students with corresponding evidence gaps are guided toward it."}
                  </p>
                </div>
                <button
                  type="button"
                  className={endorsedPrograms[selectedProgram.id] ? "small-outline" : "primary-button"}
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  onClick={handleToggleEndorsement}
                >
                  {endorsedPrograms[selectedProgram.id] ? "Remove Endorsement" : "Endorse Program"}
                </button>
              </div>

              {/* Section 1: Alignment Rationale */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <Check size={14} style={{ color: "var(--olive)" }} />
                  Alignment Rationale & Industry Demand
                </h3>
                <p style={{ margin: 0, fontSize: "11.5px", color: "var(--slate)", lineHeight: 1.55 }}>
                  {selectedProgram.curriculumRationale}
                </p>
              </div>

              {/* Section 2: Core Competencies & Skills Covered */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <GraduationCap size={14} style={{ color: "var(--olive)" }} />
                  Target Competencies & Skills Covered
                </h3>
                <div className="student-review-skills-list">
                  {selectedProgram.skills.map((skill) => (
                    <span className="student-skill-badge" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 3: Recommended Students in Academic Scope */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <UsersRound size={14} style={{ color: "var(--olive)" }} />
                  Recommended Students in Your Academic Scope
                </h3>
                <div className="learning-student-list">
                  {selectedProgram.recommendedStudents.map((stud) => (
                    <div className="learning-student-item" key={stud.name}>
                      <div>
                        <b>{stud.name}</b>
                        <span> · {stud.program}</span>
                      </div>
                      <div className="learning-student-gap">
                        {stud.gap}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Syllabus & Module Breakdown */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <FileText size={14} style={{ color: "var(--olive)" }} />
                  Syllabus & Learning Outcomes
                </h3>
                <div className="learning-syllabus-list">
                  {selectedProgram.syllabusHighlights.map((session, i) => (
                    <div className="learning-syllabus-item" key={i}>
                      <span>Part {i + 1}:</span>
                      <div>{session}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Faculty Advisor Alignment Notes */}
              <div className="student-review-section">
                <h3 className="student-review-section-title">
                  <FilePenLine size={14} style={{ color: "var(--olive)" }} />
                  Faculty Curriculum Notes & Observations
                </h3>
                <div className="student-review-notes-area">
                  <textarea
                    value={programNote}
                    onChange={(e) => setProgramNote(e.target.value)}
                    placeholder={`Record curriculum integration notes, prerequisite advisories, or scheduling feedback for ${selectedProgram.title}...`}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: "6px 14px", fontSize: "11px" }}
                      onClick={handleSaveNote}
                    >
                      Save Curriculum Note
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="student-review-footer">
              <button
                type="button"
                className="small-outline"
                onClick={() => setSelectedProgram(null)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ArrowLeft size={13} /> Back to Learning Alignment
              </button>
              <span style={{ fontSize: "10.5px", color: "var(--slate)" }}>
                Program ID: {selectedProgram.id} · Academician Authorised
              </span>
            </div>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}

interface AcademicianEventItem {
  id: string;
  time: string;
  title: string;
  meta: string;
  kind: string;
  location: string;
  description: string;
  agenda: string[];
  meetingLink?: string;
}

const academicianEventList: AcademicianEventItem[] = [
  {
    id: "acad-ev-01",
    time: "11:00 – 12:00",
    title: "Skill evidence clinic",
    meta: "Online · Student profile support",
    kind: "Event",
    location: "Google Meet Virtual Session",
    description: "Faculty advisory session helping Batch 2028 Computer Science students structure their GitHub repositories, technical blogs, and portfolio evidence for recruiter visibility.",
    agenda: ["Repository documentation standards", "Evaluating student portfolio submissions", "Q&A with student candidates"],
    meetingLink: "https://meet.google.com/job-buddy-faculty-clinic",
  },
  {
    id: "acad-ev-02",
    time: "14:30 – 15:15",
    title: "Candidate evaluation briefing",
    meta: "Seminar room 4 · Placement activity",
    kind: "Evaluation",
    location: "Placement Office · Seminar Room 4 (Hybrid)",
    description: "Coordination briefing between faculty advisors and the campus recruitment committee regarding technical screening benchmarks for Applied AI and Data roles.",
    agenda: ["Review of recruiter technical scorecard criteria", "Faculty input on student academic standing", "Scheduling interview slot allocations"],
    meetingLink: "https://meet.google.com/job-buddy-eval-briefing",
  },
  {
    id: "acad-ev-03",
    time: "16:00 – 17:00",
    title: "Recruitment process Q&A",
    meta: "Online · Student information session",
    kind: "Event",
    location: "Virtual Auditorium · Live Webinar",
    description: "Open Q&A for prospective graduates addressing company requirements, institutional sponsorship clearance, and interview etiquette.",
    agenda: ["Key placement calendar dates", "Company eligibility criteria breakdown", "Open floor student questions"],
    meetingLink: "https://meet.google.com/job-buddy-recruitment-qa",
  },
];

const ACAD_CALENDAR_KEY = "job_buddy_acad_calendar_events";

export function AcademicianEvents() {
  const [selectedEvent, setSelectedEvent] = useState<AcademicianEventItem | null>(null);
  const [savedEvents, setSavedEvents] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ACAD_CALENDAR_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const toggleCalendarEvent = (eventId: string) => {
    setSavedEvents((prev) => {
      const exists = prev.includes(eventId);
      const updated = exists ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem(ACAD_CALENDAR_KEY, JSON.stringify(updated));
      } catch {}
      if (exists) {
        toast("Removed from your academic calendar.");
      } else {
        toast.success("Added to your academic calendar!");
      }
      return updated;
    });
  };

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Events"
        title="Academic-scope events"
        description="Events, evaluations, and placement activities currently visible to your role."
        meta={<StatusPill tone="olive">3 Upcoming Sessions</StatusPill>}
      />
      <SectionCard title="Upcoming academic sessions & briefings">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {academicianEventList.map((ev) => {
            const isSaved = savedEvents.includes(ev.id);
            return (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--olive)", minWidth: "90px" }}>{ev.time}</span>
                  <div>
                    <strong style={{ display: "block", fontSize: "13.5px", color: "var(--ink)" }}>{ev.title}</strong>
                    <span style={{ fontSize: "11px", color: "var(--slate)" }}>{ev.meta}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <StatusPill tone={ev.kind === "Evaluation" ? "ochre" : "muted"}>{ev.kind}</StatusPill>
                  {isSaved && <StatusPill tone="olive">In Calendar</StatusPill>}
                  <button className="small-outline" onClick={() => setSelectedEvent(ev)}>
                    View briefing
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Event Briefing Modal */}
      {selectedEvent && (
        <div className="student-review-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null); }}>
          <div className="student-review-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <div className="student-review-header">
              <div className="student-review-title-group">
                <span className="student-review-eyebrow">Academic Scope Briefing</span>
                <h2 id="event-modal-title" className="student-review-title">{selectedEvent.title}</h2>
                <span className="student-review-meta">{selectedEvent.time} · {selectedEvent.location}</span>
              </div>
              <button className="student-review-close" onClick={() => setSelectedEvent(null)} aria-label="Close event briefing">
                <X size={16} />
              </button>
            </div>

            <div className="student-review-body">
              <div className="student-review-section">
                <h4 className="student-review-section-title">Session Purpose</h4>
                <p className="student-review-section-desc" style={{ color: "var(--ink)", fontSize: "12.5px", lineHeight: 1.5 }}>
                  {selectedEvent.description}
                </p>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Agenda & Discussion Points</h4>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--ink)" }}>
                  {selectedEvent.agenda.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="student-review-section">
                <h4 className="student-review-section-title">Connection & Location</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--muted)", borderRadius: "6px", fontSize: "12px" }}>
                  <span>{selectedEvent.location}</span>
                  {selectedEvent.meetingLink && (
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                      style={{ fontSize: "11px", fontWeight: 700 }}
                    >
                      Join Virtual Room <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="student-review-footer">
              <button className="small-outline" onClick={() => setSelectedEvent(null)}>Back to Events</button>
              <button
                className={savedEvents.includes(selectedEvent.id) ? "small-outline" : "primary-button"}
                onClick={() => toggleCalendarEvent(selectedEvent.id)}
              >
                {savedEvents.includes(selectedEvent.id) ? "Remove from Calendar" : "Add to Academic Calendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AcademicianLayout>
  );
}

export function AcademicianProfile() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<{ evidenceUpdates: boolean; eventUpdates: boolean }>(loadAcadPrefs);

  function togglePref(key: "evidenceUpdates" | "eventUpdates") {
    setPrefs((current) => {
      const nextVal = !current[key];
      const updated = { ...current, [key]: nextVal };
      try {
        localStorage.setItem(ACAD_PREFS_KEY, JSON.stringify(updated));
      } catch {}
      if (key === "evidenceUpdates") {
        if (nextVal) {
          toast.success("Student evidence update alerts enabled on your dashboard.");
        } else {
          toast("Student evidence update alerts muted across your dashboard.");
        }
      } else {
        if (nextVal) {
          toast.success("Placement and evaluation event alerts enabled on your dashboard.");
        } else {
          toast("Placement and evaluation event alerts muted across your dashboard.");
        }
      }
      return updated;
    });
  }

  const displayName = user?.displayName || "Prof. Arvind Mehta";

  return (
    <AcademicianLayout>
      <PageHeader
        eyebrow="Profile"
        title={displayName}
        description="Faculty advisor · Computer Science · Authorised academic workspace"
      />
      <div className="profile-stack">
        <SectionCard title="Academic context">
          <KeyValue label="Department" value="Computer Science" />
          <KeyValue label="Assigned student scope" value="64 students" />
          <KeyValue label="Learning-alignment visibility" value="Enabled" />
          <KeyValue label="Placement activity visibility" value="Authorised" />
        </SectionCard>
        <SectionCard
          title="Workspace preferences"
          aside={
            <StatusPill tone={prefs.evidenceUpdates && prefs.eventUpdates ? "olive" : "ochre"}>
              {prefs.evidenceUpdates && prefs.eventUpdates ? "All notices active" : "Selective muting active"}
            </StatusPill>
          }
        >
          <div className="setting-row">
            <div>
              <b>Student evidence updates</b>
              <span>Receive a notice when an assigned student's profile evidence changes.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <StatusPill tone={prefs.evidenceUpdates ? "olive" : "muted"}>
                {prefs.evidenceUpdates ? "Active" : "Muted"}
              </StatusPill>
              <button
                className={prefs.evidenceUpdates ? "toggle-on" : "toggle-off"}
                onClick={() => togglePref("evidenceUpdates")}
              >
                {prefs.evidenceUpdates ? "On" : "Off"}
              </button>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <b>Event updates</b>
              <span>Receive notices for visible placement and evaluation events.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <StatusPill tone={prefs.eventUpdates ? "olive" : "muted"}>
                {prefs.eventUpdates ? "Active" : "Muted"}
              </StatusPill>
              <button
                className={prefs.eventUpdates ? "toggle-on" : "toggle-off"}
                onClick={() => togglePref("eventUpdates")}
              >
                {prefs.eventUpdates ? "On" : "Off"}
              </button>
            </div>
          </div>

          {(!prefs.evidenceUpdates || !prefs.eventUpdates) && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                background: "var(--muted)",
                borderRadius: "6px",
                fontSize: "12px",
                border: "1px dashed var(--rule)",
                color: "var(--ink)",
                lineHeight: 1.5,
              }}
            >
              <b>Notice:</b>{" "}
              {!prefs.evidenceUpdates && !prefs.eventUpdates
                ? "Both student evidence update notices and event briefing alerts are currently muted across your dashboard."
                : !prefs.evidenceUpdates
                ? "Student evidence update notices are currently muted across your dashboard."
                : "Event briefing alerts are currently muted across your dashboard."}
            </div>
          )}
        </SectionCard>
      </div>
    </AcademicianLayout>
  );
}
