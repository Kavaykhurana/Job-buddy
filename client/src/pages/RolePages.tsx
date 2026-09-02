// Field Notes Institutional Workspace: distinct recruiter, institution, and academician screens within the approved scope.
import { useEffect, useState } from "react";
import {
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
import recruiterMatchField from "@/assets/recruiter-match-field.svg";
import institutionReadiness from "@/assets/institution-readiness.svg";
import academicianLearningMap from "@/assets/academician-learning-map.svg";
import "./RecruiterSelection.css";
import "./CompanyRoleRequirements.css";

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
    meetingLink: "https://meet.google.com/sih-interview-room",
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
                placeholder="https://meet.google.com/sih-interview-room"
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
    setReqData(updated);
    saveCompanyRoleRequirements(updated);
    setNewSkill("");
    setShowAddForm(false);
    try {
      await api.requirements.addRequirement(companyIndex, roleIndex, requirement);
    } catch {}
    toast.success(`Added ${requirement.skill} requirement to ${role.title}.`);
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

export function InstitutionDashboard() { return <InstitutionLayout><PageHeader eyebrow="Institution workspace" title="Placement readiness overview" description="Monitor the approved student, application, interview, placement-status, and skill-alignment records for your institution." meta={<StatusPill>Batch 2028</StatusPill>} /><div className="stat-grid"><StatCard label="Placement-ready" value="142" tone="olive" note="Verified profile evidence" /><StatCard label="Active applications" value="186" note="Across approved opportunities" /><StatCard label="Interviews scheduled" value="24" note="This week" /><StatCard label="Offers recorded" value="18" tone="ochre" note="Current reporting period" /></div><div className="dashboard-grid"><div className="stack-lg"><SectionCard title="Readiness watch" aside={<ActionLink href="/institution/readiness">View student readiness</ActionLink>}><div className="readiness-summary"><div><b>78%</b><span>profiles above placement-readiness baseline</span></div><ProgressBar value={78} label="Current readiness" /></div><div className="readiness-notes"><span><i /> 31 profiles need academic-document completion.</span><span><i className="ochre-dot" /> 18 students have active application reviews.</span></div></SectionCard><SectionCard title="Placement activity"><div className="activity-list"><article><div><b>Candidate evaluation briefing</b><span>28 Aug · 24 students visible · 2 recruiters assigned</span></div><StatusPill>Scheduled</StatusPill><Link href="/institution/interviews" className="action-link">Review <ArrowRight size={15} /></Link></article><div><b>Applied AI Capability Studio</b><span>8 students currently eligible for recruiter review</span></div><StatusPill tone="ochre">Screening</StatusPill><Link href="/institution/applications" className="action-link">Review <ArrowRight size={15} /></Link></div></SectionCard></div><aside className="stack-lg"><SectionCard title="Placement status"><KeyValue label="Open placement window" value="Yes" /><KeyValue label="Current batch" value="2028" /><KeyValue label="Evidence verification" value="81% complete" /><Link href="/institution/placement-status" className="action-link">Open records <ArrowRight size={15} /></Link></SectionCard><img className="role-illustration" src={institutionReadiness} alt="Abstract institution readiness illustration" /></aside></div></InstitutionLayout>; }

export function InstitutionReadiness() { return <InstitutionLayout><PageHeader eyebrow="Student readiness" title="Readiness and skill evidence" description="View student readiness, evidence completion, and skill-alignment signals without changing their profile records." /><SectionCard title="Readiness cohort"><div className="readiness-table"><div className="table-head"><span>Student</span><span>Profile</span><span>Skill fit</span><span>Academic evidence</span><span /></div>{defaultCandidates.map((candidate) => <div className="candidate-row" key={candidate.id}><div><b>{candidate.name}</b><span>{candidate.program}</span></div><span>78% complete</span><div className="candidate-fit"><b>{candidate.score}%</b><ProgressBar value={candidate.score} /></div><StatusPill tone={candidate.eligibility === "Eligible" ? "olive" : "ochre"}>{candidate.eligibility === "Eligible" ? "Current" : "Review"}</StatusPill><button className="small-outline" onClick={() => toast("Institution profile view is permission-gated in the connected platform.")}>View context</button></div>)}</div></SectionCard></InstitutionLayout>; }

export function InstitutionApplications() { return <InstitutionLayout><PageHeader eyebrow="Applications" title="Approved application visibility" description="Monitor application stages, eligibility outcomes, and recruiter activity for institution-supported students." /><SectionCard title="Application records"><div className="candidate-table"><div className="table-head"><span>Student</span><span>Opportunity</span><span>Eligibility</span><span>Stage</span><span /></div>{defaultCandidates.map((candidate, index) => <div className="candidate-row" key={candidate.id}><div><b>{candidate.name}</b><span>{candidate.program}</span></div><span>{index === 0 ? "Applied AI Capability Studio" : "Research Operations Associate"}</span><StatusPill>Eligible</StatusPill><StatusPill tone={index === 0 ? "ochre" : "muted"}>{index === 0 ? "Screening" : "Submitted"}</StatusPill><button className="small-outline" onClick={() => toast("Application context is available to authorised institution users.")}>View context</button></div>)}</div></SectionCard></InstitutionLayout>; }

export function InstitutionInterviews() { return <InstitutionLayout><PageHeader eyebrow="Interviews" title="Interview and evaluation visibility" description="View scheduled evaluations, participating candidates, and recorded outcomes permitted to the institution." /><SectionCard title="This week"><div className="interview-list"><article><div className="interview-time"><b>28</b><span>AUG</span></div><div><StatusPill>Scheduled</StatusPill><h3>Applied AI Capability Studio</h3><p>14:30–15:15 · 2 candidates · Recruiter-managed evaluation</p></div><button className="small-outline" onClick={() => toast("Interview context opens with role-based access.")}>View context</button></article></div></SectionCard></InstitutionLayout>; }

export function InstitutionPlacement() { return <InstitutionLayout><PageHeader eyebrow="Placement status" title="Placement reporting record" description="A controlled summary of placement-window status and offer outcomes visible to the institution." /><div className="placement-layout"><SectionCard title="Current reporting period"><div className="placement-status"><span>Placement window</span><b>Open</b><p>Batch 2028 · Current reporting period</p></div><div className="placement-figures"><StatCard label="Applications" value="186" /><StatCard label="Shortlists" value="44" /><StatCard label="Offers" value="18" /></div></SectionCard><SectionCard title="Reporting controls"><KeyValue label="Record visibility" value="Institution authorised" /><KeyValue label="Offer verification" value="17 / 18 verified" /><KeyValue label="Last refreshed" value="26 Aug, 09:00" /><button className="small-outline full-button" onClick={() => toast("Placement report export is ready for the authorised workflow.")}>Export current report</button></SectionCard></div></InstitutionLayout>; }

export function InstitutionAlignment() { return <InstitutionLayout><PageHeader eyebrow="Skill alignment" title="Institution-to-industry alignment" description="Review the current relationship between student evidence, role requirements, and industry skill demand." /><div className="detail-layout"><SectionCard title="Current alignment"><div className="map-list"><article><div><h3>Applied systems</h3><p>Strong institution-level evidence in Python and data analysis.</p></div><div className="map-score"><b>82%</b><ProgressBar value={82} /></div></article><article><div><h3>Research operations</h3><p>Evidence present; writing and presentation skill remains a development area.</p></div><div className="map-score"><b>71%</b><ProgressBar value={71} /></div></article><article><div><h3>Digital product</h3><p>Evidence coverage requires more user-research work samples.</p></div><div className="map-score"><b>58%</b><ProgressBar value={58} /></div></article></div></SectionCard><aside className="stack-lg"><img className="role-illustration" src={institutionReadiness} alt="Abstract institution and industry alignment illustration" /><SectionCard title="Data basis"><p className="body-copy">This view uses verified student profiles, role skill requirements, and current demand records. It is not a career-guidance module.</p></SectionCard></aside></div></InstitutionLayout>; }

export function AcademicianDashboard() { return <AcademicianLayout><PageHeader eyebrow="Academician workspace" title="Student evidence and learning alignment" description="Review the approved student skill-map and learning-alignment context for your academic scope." meta={<StatusPill>Computer Science · Batch 2028</StatusPill>} /><div className="stat-grid"><StatCard label="Students in scope" value="64" note="Assigned academic context" /><StatCard label="Current skill maps" value="53" tone="olive" note="Evidence-led records" /><StatCard label="Learning alignment notes" value="11" tone="ochre" note="Review-ready" /><StatCard label="Upcoming events" value="03" note="This week" /></div><div className="dashboard-grid"><div className="stack-lg"><SectionCard title="Student skill-map review" aside={<ActionLink href="/academician/student-maps">Open maps</ActionLink>}><div className="activity-list"><article><div><b>Applied systems alignment</b><span>Python and data analysis coverage is strong across current evidence.</span></div><StatusPill>82%</StatusPill><Link href="/academician/student-maps" className="action-link">Review <ArrowRight size={15} /></Link></article><article><div><b>Research operations alignment</b><span>Presentation evidence is the leading development signal.</span></div><StatusPill tone="ochre">71%</StatusPill><Link href="/academician/learning-alignment" className="action-link">Review <ArrowRight size={15} /></Link></article></div></SectionCard><SectionCard title="Events in your academic scope"><ScheduleLine time="11:00" title="Skill evidence clinic" meta="Student profile support · Online" kind="Event" /><ScheduleLine time="14:30" title="Candidate evaluation briefing" meta="Placement office · Seminar room 4" kind="Evaluation" /></SectionCard></div><aside className="stack-lg"><img className="role-illustration" src={academicianLearningMap} alt="Abstract academician learning alignment illustration" /><SectionCard title="Academic role"><p className="body-copy">This workspace supports evidence and learning alignment. It does not include excluded faculty-internship, industrial-training, or FDP modules.</p><Link href="/academician/profile" className="action-link">Open profile <ArrowRight size={15} /></Link></SectionCard></aside></div></AcademicianLayout>; }

export function AcademicianStudentMaps() { return <AcademicianLayout><PageHeader eyebrow="Student skill maps" title="Evidence-led student alignment" description="Review aggregate and student-level alignment notes within the authorised academic context." /><SectionCard title="Student alignment list"><div className="readiness-table"><div className="table-head"><span>Student</span><span>Industry alignment</span><span>Role alignment</span><span>Evidence status</span><span /></div>{defaultCandidates.map((candidate) => <div className="candidate-row" key={candidate.id}><div><b>{candidate.name}</b><span>{candidate.program}</span></div><span>{candidate.score > 80 ? "Applied systems" : "Research operations"}</span><div className="candidate-fit"><b>{candidate.score}%</b><ProgressBar value={candidate.score} /></div><StatusPill>{candidate.eligibility === "Eligible" ? "Current" : "Developing"}</StatusPill><button className="small-outline" onClick={() => toast("Student evidence is available under academic role permissions.")}>Review</button></div>)}</div></SectionCard></AcademicianLayout>; }

export function AcademicianLearningAlignment() { return <AcademicianLayout><PageHeader eyebrow="Learning alignment" title="Programs matched to skill evidence" description="Review selected learning-program alignment without adding a separate career-guidance module." /><div className="detail-layout"><SectionCard title="Priority learning alignment"><div className="learning-list"><article><div className="book-mark"><GraduationCap size={18} /></div><div><h3>SQL evidence workshop</h3><p>Addresses a preferred industry skill in the current role requirements.</p><small>3 guided sessions</small></div><button className="small-outline" onClick={() => toast("Learning alignment detail is ready for authorised review.")}>Review</button></article><article><div className="book-mark"><FileCheck2 size={18} /></div><div><h3>Communicating analytical findings</h3><p>Strengthens presentation evidence for research operations alignment.</p><small>2 guided sessions</small></div><button className="small-outline" onClick={() => toast("Learning alignment detail is ready for authorised review.")}>Review</button></article></div></SectionCard><aside className="stack-lg"><img className="role-illustration" src={academicianLearningMap} alt="Abstract curriculum and industry skills illustration" /><SectionCard title="Alignment method"><p className="body-copy">Programs are mapped against verified skills, role requirements, industry demand, and known evidence gaps.</p></SectionCard></aside></div></AcademicianLayout>; }

export function AcademicianEvents() { return <AcademicianLayout><PageHeader eyebrow="Events" title="Academic-scope events" description="Events, evaluations, and placement activities currently visible to your role." /><SectionCard title="Upcoming"><ScheduleLine time="11:00" title="Skill evidence clinic" meta="Online · Student profile support" kind="Event" /><ScheduleLine time="14:30" title="Candidate evaluation briefing" meta="Seminar room 4 · Placement activity" kind="Evaluation" /><ScheduleLine time="16:00" title="Recruitment process Q&A" meta="Online · Student information session" kind="Event" /></SectionCard></AcademicianLayout>; }

export function AcademicianProfile() { return <AcademicianLayout><PageHeader eyebrow="Profile" title="Dr. Meera Iyer" description="Faculty advisor · Computer Science · Authorised academic workspace" /><div className="profile-stack"><SectionCard title="Academic context"><KeyValue label="Department" value="Computer Science" /><KeyValue label="Assigned student scope" value="64 students" /><KeyValue label="Learning-alignment visibility" value="Enabled" /><KeyValue label="Placement activity visibility" value="Authorised" /></SectionCard><SectionCard title="Workspace preferences"><div className="setting-row"><div><b>Student evidence updates</b><span>Receive a notice when an assigned student’s profile evidence changes.</span></div><button className="toggle-on" onClick={(event) => event.currentTarget.classList.toggle("toggle-off")}>On</button></div><div className="setting-row"><div><b>Event updates</b><span>Receive notices for visible placement and evaluation events.</span></div><button className="toggle-on" onClick={(event) => event.currentTarget.classList.toggle("toggle-off")}>On</button></div></SectionCard></div></AcademicianLayout>; }
