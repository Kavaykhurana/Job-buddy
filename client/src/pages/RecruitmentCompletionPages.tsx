import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, FilePenLine, FileText, FileUp, Paperclip, Plus, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { KeyValue, Notice, PageHeader, ProgressBar, SectionCard, StatusPill } from "@/components/Ui";
import { deleteRecruiterJobDraft, getRecruiterJobDraft, type JobAttachment, type JobDraft, loadRecruiterJobDrafts, saveRecruiterJobDraft, saveRecruiterPostedJob } from "@/data/portalData";
import { api } from "@/lib/api";
import { userLocalStorage as localStorage } from "@/lib/userStorage";
import "./RecruitmentCompletionPages.css";
import "./RecruiterPostJob.css";
import "./RecruiterAssessmentScorecard.css";

function RecruiterLayout({ children }: { children: React.ReactNode }) { return <AppShell role="recruiter">{children}</AppShell>; }

const jobPublishSteps = ["Context", "Requirements", "Qualifications", "Documents", "Selection", "Publish"];

const initialJobDraft: JobDraft = {
  id: "",
  title: "",
  organization: "Northstar Systems",
  mode: "Hybrid",
  location: "Bengaluru",
  requiredSkills: "",
  preferredSkills: "",
  qualification: "",
  eligibility: "",
  stages: "Screening · Interview · Offer",
  attachments: [],
  updatedAt: "Today",
};

export function RecruiterJobPublishPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<JobDraft>(initialJobDraft);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draft");
    if (draftId) {
      const found = getRecruiterJobDraft(draftId);
      if (found) {
        setDraft(found);
        toast.info(`Loaded draft "${found.title}".`);
      }
    }
  }, []);

  const update = (field: keyof JobDraft, value: any) => setDraft((current) => ({ ...current, [field]: value }));
  const nextStep = () => setStep((current) => Math.min(6, current + 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: JobAttachment[] = [];
    Array.from(files).forEach((file) => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        uploadedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      });
    });

    setDraft((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }));
    toast.success(`Attached ${files.length} document(s).`);
    e.target.value = "";
  };

  const handleAddSampleDoc = (docType: string) => {
    const sampleAttachments: Record<string, JobAttachment> = {
      jd: {
        id: `att-sample-jd-${Date.now()}`,
        name: `${draft.title || "Opportunity"}_Job_Description.pdf`,
        size: "340 KB",
        type: "application/pdf",
        uploadedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      rubric: {
        id: `att-sample-rubric-${Date.now()}`,
        name: "Evaluation_Rubric_&_Eligibility_Criteria.pdf",
        size: "185 KB",
        type: "application/pdf",
        uploadedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      brief: {
        id: `att-sample-brief-${Date.now()}`,
        name: "Campus_Placement_Recruitment_Brief.txt",
        size: "45 KB",
        type: "text/plain",
        uploadedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
    };

    const doc = sampleAttachments[docType];
    if (doc) {
      setDraft((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), doc],
      }));
      toast.success(`Attached sample document "${doc.name}".`);
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setDraft((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attId),
    }));
    toast("Attachment removed.");
  };

  const handleSaveDraft = () => {
    const draftId = draft.id || `draft-${Date.now()}`;
    const draftToSave: JobDraft = {
      ...draft,
      id: draftId,
      title: draft.title.trim() || "Untitled Opportunity Draft",
    };
    saveRecruiterJobDraft(draftToSave);
    setDraft(draftToSave);
    toast.success(`Draft "${draftToSave.title}" saved. You can open and continue editing anytime.`);
  };

  const publish = async () => {
    if (!draft.title.trim() || !draft.requiredSkills.trim() || !draft.qualification.trim()) {
      toast.error("Add a title, required skills, and qualification requirement before posting.");
      return;
    }
    const newJob = {
      ...draft,
      id: draft.id.startsWith("draft-") ? draft.id.replace("draft-", "posted-") : `posted-job-${Date.now()}`,
      status: "Open" as const,
      postedAt: "Just now",
      location: draft.mode === "Hybrid" ? `Hybrid · ${draft.location || "Bengaluru"}` : draft.mode,
    };
    try {
      await api.jobs.create({
        id: newJob.id,
        title: draft.title,
        organization: draft.organization,
        location: newJob.location,
        date: "Closes 30 Sep",
        required: draft.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
        preferred: draft.preferredSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
        type: "Structured opportunity",
        summary: draft.eligibility || draft.qualification,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The opportunity could not be published.");
      return;
    }
    saveRecruiterPostedJob(newJob);
    if (draft.id) deleteRecruiterJobDraft(draft.id);
    toast.success(`${draft.title} is now posted and visible in Opportunity records.`);
    setLocation("/recruiter/opportunities");
  };

  const cardTitle =
    step === 1 ? "Job opportunity context"
    : step === 2 ? "Required and preferred skills"
    : step === 3 ? "Qualification and eligibility"
    : step === 4 ? "Job brief & document attachments"
    : step === 5 ? "Recruitment stages"
    : "Publish review";

  return (
    <RecruiterLayout>
      <Link href="/recruiter/opportunities" className="back-link">← Published requirements</Link>
      <PageHeader
        eyebrow="Job publishing"
        title="Create a placement opportunity"
        description="Define qualifications, required skills, eligibility, attached job briefs, selection stages, and visibility for a new industry job opportunity."
        meta={<StatusPill>{draft.id ? "Editing draft" : "New draft"}</StatusPill>}
      />
      <div className="publish-layout">
        <section className="stack-lg">
          <SectionCard title="Publishing steps">
            <div className="publish-steps">
              {jobPublishSteps.map((label, index) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setStep(index + 1)}
                  className={step === index + 1 ? "publish-step active-step" : "publish-step"}
                >
                  <span>0{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={cardTitle}>
            {step === 1 && (
              <div className="publish-form">
                <label>
                  Opportunity title
                  <input
                    value={draft.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="e.g. Applied AI Capability Studio or Junior Data Analyst"
                  />
                </label>
                <label>
                  Hiring Organization / Company
                  <input
                    value={draft.organization || "Northstar Systems"}
                    onChange={(event) => update("organization", event.target.value)}
                    placeholder="e.g. Northstar Systems"
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label>
                    Delivery mode
                    <select value={draft.mode} onChange={(event) => update("mode", event.target.value)}>
                      <option>Hybrid</option>
                      <option>On campus</option>
                      <option>Remote</option>
                    </select>
                  </label>
                  <label>
                    Location / Office
                    <input
                      value={draft.location || "Bengaluru"}
                      onChange={(event) => update("location", event.target.value)}
                      placeholder="e.g. Bengaluru / Chandigarh"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="publish-form">
                <label>
                  Required skills (Comma separated)
                  <input
                    value={draft.requiredSkills}
                    onChange={(event) => update("requiredSkills", event.target.value)}
                    placeholder="Python, Data analysis, Communication"
                  />
                </label>
                <label>
                  Preferred skills (Comma separated)
                  <input
                    value={draft.preferredSkills}
                    onChange={(event) => update("preferredSkills", event.target.value)}
                    placeholder="SQL, Machine learning, Telemetry"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="publish-form">
                <label>
                  Qualification requirement
                  <input
                    value={draft.qualification}
                    onChange={(event) => update("qualification", event.target.value)}
                    placeholder="Computer Science, IT, or relevant Engineering discipline"
                  />
                </label>
                <label>
                  Eligibility rules
                  <textarea
                    rows={5}
                    value={draft.eligibility}
                    onChange={(event) => update("eligibility", event.target.value)}
                    placeholder="Minimum 70% qualifying score in assessment or coursework; demonstrable Python & SQL evidence note."
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="publish-form">
                <div style={{ display: "grid", gap: "12px" }}>
                  <p className="publish-helper">
                    Attach job description PDFs, syllabus rubrics, or briefing text documents for candidate reference.
                  </p>
                  
                  <div
                    style={{
                      border: "2px dashed var(--rule)",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      background: "var(--olive-wash)",
                    }}
                  >
                    <FileUp size={28} style={{ color: "var(--olive)", margin: "0 auto 8px" }} />
                    <b style={{ display: "block", fontSize: "13px", color: "var(--ink)", marginBottom: "4px" }}>
                      Upload Job Documents (PDF, DOCX, TXT)
                    </b>
                    <span style={{ fontSize: "11px", color: "var(--slate)", display: "block", marginBottom: "12px" }}>
                      Supports multiple files up to 10 MB each.
                    </span>
                    <label
                      className="primary-button"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <Upload size={14} /> Choose files from computer
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>Quick attach templates:</span>
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => handleAddSampleDoc("jd")}
                    >
                      + Add Job Description PDF
                    </button>
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => handleAddSampleDoc("rubric")}
                    >
                      + Add Eligibility Rubric PDF
                    </button>
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => handleAddSampleDoc("brief")}
                    >
                      + Add Placement Brief TXT
                    </button>
                  </div>

                  {draft.attachments && draft.attachments.length > 0 && (
                    <div style={{ display: "grid", gap: "6px", marginTop: "10px" }}>
                      <b style={{ fontSize: "11px", color: "var(--ink)" }}>
                        Attached Documents ({draft.attachments.length})
                      </b>
                      {draft.attachments.map((att) => (
                        <div
                          key={att.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            border: "1px solid var(--rule)",
                            borderRadius: "6px",
                            background: "var(--surface)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileText size={16} style={{ color: "var(--olive)" }} />
                            <div>
                              <b style={{ fontSize: "11.5px", color: "var(--ink)" }}>{att.name}</b>
                              <span style={{ fontSize: "9.5px", color: "var(--slate)", marginLeft: "6px" }}>
                                {att.size} · {att.uploadedAt}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            style={{ background: "none", border: "none", color: "var(--ochre)", cursor: "pointer" }}
                            title="Remove attachment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="publish-form">
                <label>
                  Selection stages
                  <textarea
                    rows={4}
                    value={draft.stages}
                    onChange={(event) => update("stages", event.target.value)}
                    placeholder="Screening · Technical Interview · HR Discussion · Offer"
                  />
                </label>
                <p className="publish-helper">
                  Students will see the approved stage sequence alongside the role requirements before applying.
                </p>
              </div>
            )}

            {step === 6 && (
              <div className="job-publish-review">
                <StatusPill>Ready to publish</StatusPill>
                <h3>{draft.title || "Untitled opportunity"}</h3>
                <KeyValue label="Organization" value={draft.organization || "Northstar Systems"} />
                <KeyValue label="Mode & Location" value={`${draft.mode} · ${draft.location || "Bengaluru"}`} />
                <KeyValue label="Required skills" value={draft.requiredSkills || "Not set"} />
                <KeyValue label="Preferred skills" value={draft.preferredSkills || "Not set"} />
                <KeyValue label="Qualification" value={draft.qualification || "Not set"} />
                <KeyValue label="Eligibility" value={draft.eligibility || "Standard university baseline"} />
                <KeyValue label="Stages" value={draft.stages || "Screening · Interview · Offer"} />
                <KeyValue
                  label="Attached Documents"
                  value={
                    draft.attachments && draft.attachments.length > 0
                      ? `${draft.attachments.length} file(s): ${draft.attachments.map((a) => a.name).join(", ")}`
                      : "No files attached"
                  }
                />
              </div>
            )}
          </SectionCard>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Publish controls">
            <KeyValue label="Current step" value={`${step} of 6`} />
            <KeyValue label="Requirement version" value={draft.id ? "Draft Version" : "New Requirement"} />
            <KeyValue label="Attachments" value={`${(draft.attachments || []).length} document(s)`} />
            <KeyValue label="Selection stages" value={draft.stages || "Not set"} />
            <div className="job-publish-actions">
              {step > 1 && (
                <button type="button" className="small-outline full-button" onClick={() => setStep((current) => current - 1)}>
                  Back
                </button>
              )}
              <button type="button" className="small-outline full-button" onClick={handleSaveDraft}>
                <Save size={15} /> Save draft
              </button>
              <button
                type="button"
                className="primary-button full-button"
                onClick={step === 6 ? () => void publish() : nextStep}
              >
                {step === 6 ? "Post job" : "Save and continue"} <ArrowRight size={15} />
              </button>
            </div>
          </SectionCard>
          <Notice
            title="Match transparency"
            text="Students see the published required and preferred skills against their own evidence before they apply; recruiters retain the requirement version used for screening."
          />
        </aside>
      </div>
    </RecruiterLayout>
  );
}

type RecruiterAssessmentCategory = "Technical" | "Soft skills" | "Other skills";
const recruiterAssessmentDimensions: { id: string; category: RecruiterAssessmentCategory; label: string; prompt: string }[] = [
  { id: "technical-reasoning", category: "Technical", label: "Applied technical reasoning", prompt: "Uses a sound approach when discussing the role scenario." },
  { id: "technical-evidence", category: "Technical", label: "Data and evidence interpretation", prompt: "Checks evidence quality and explains an evidence-backed conclusion." },
  { id: "soft-communication", category: "Soft skills", label: "Communication and collaboration", prompt: "Explains a result concisely and responds constructively to challenge." },
  { id: "soft-feedback", category: "Soft skills", label: "Feedback response", prompt: "Clarifies feedback, adapts work, and records an appropriate next action." },
  { id: "other-prioritisation", category: "Other skills", label: "Prioritisation and learning agility", prompt: "Reassesses work when context or requirements change." },
  { id: "other-ethics", category: "Other skills", label: "Ethics and evidence practice", prompt: "Identifies limitations and handles sensitive or outdated evidence responsibly." },
];
const recruiterAssessmentCategories: RecruiterAssessmentCategory[] = ["Technical", "Soft skills", "Other skills"];
function recruiterScoreBand(score: number) { return score >= 80 ? "Strong" : score >= 60 ? "Current" : "Developing"; }
export function RecruiterInterviewScorecardPage() {
  const [scores, setScores] = useState<Record<string, number>>({ "technical-reasoning": 4, "technical-evidence": 4, "soft-communication": 4, "soft-feedback": 3, "other-prioritisation": 4, "other-ethics": 4 });
  const [feedback, setFeedback] = useState("Candidate explains analytical choices clearly and identifies evidence limitations. A focused SQL evidence follow-up would strengthen role readiness.");
  const [recommendation, setRecommendation] = useState<"Recommend offer" | "Keep in review" | "Do not progress">("Keep in review");
  const categoryScores = recruiterAssessmentCategories.reduce((summary, category) => {
    const dimensions = recruiterAssessmentDimensions.filter((dimension) => dimension.category === category);
    summary[category] = Math.round((dimensions.reduce((total, dimension) => total + scores[dimension.id], 0) / (dimensions.length * 5)) * 100);
    return summary;
  }, {} as Record<RecruiterAssessmentCategory, number>);
  const overall = Math.round(recruiterAssessmentCategories.reduce((total, category) => total + categoryScores[category], 0) / recruiterAssessmentCategories.length);
  const saveAssessment = async () => {
    try {
      const stage = recommendation === "Recommend offer" ? "Offer" : recommendation === "Do not progress" ? "Rejected" : "Interview";
      await api.candidates.saveScorecard("anaya-01", overall, stage);
      localStorage.setItem("sih-connect-recruiter-scorecard", JSON.stringify({ categoryScores, overall, feedback, recommendation, savedAt: new Date().toISOString() }));
      toast.success(`Assessment saved: ${overall}% overall · ${recommendation}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The assessment could not be saved.");
    }
  };
  return <RecruiterLayout><Link href="/recruiter/interviews" className="back-link">← Interviews</Link><PageHeader eyebrow="Interview assessment" title="Anaya Sharma · Applied AI Capability Studio" description="Use the same Technical, Soft skills, and Other skills structure as the current knowledge assessment, scored from observed interview responses." meta={<StatusPill>{overall}% overall signal</StatusPill>} /><div className="scorecard-layout"><section className="stack-lg"><SectionCard title="Assessment category signals" aside={<span className="date-meta">1–5 OBSERVED RESPONSE SCALE</span>}><div className="recruiter-assessment-summary">{recruiterAssessmentCategories.map((category) => <div key={category}><span>{category}</span><b>{categoryScores[category]}%</b><small>{recruiterScoreBand(categoryScores[category])}</small><ProgressBar value={categoryScores[category]} /></div>)}</div></SectionCard>{recruiterAssessmentCategories.map((category) => <SectionCard key={category} title={category} aside={<StatusPill tone={categoryScores[category] >= 70 ? "olive" : "ochre"}>{categoryScores[category]}% · {recruiterScoreBand(categoryScores[category])}</StatusPill>}><div className="assessment-score-dimensions">{recruiterAssessmentDimensions.filter((dimension) => dimension.category === category).map((dimension) => <div key={dimension.id}><div><b>{dimension.label}</b><span>{dimension.prompt}</span></div><div className="score-buttons">{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${dimension.label}: ${score} out of 5`} className={scores[dimension.id] === score ? "selected-score" : ""} onClick={() => setScores((current) => ({ ...current, [dimension.id]: score }))}>{score}</button>)}</div><b className="assessment-score-value">{scores[dimension.id]} / 5</b></div>)}</div></SectionCard>)}<SectionCard title="Evaluator evidence note"><textarea rows={5} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Record observed evidence, concerns, limitations, and a next action for the candidate." /><p className="assessment-evidence-note">Record observable evidence, rather than assumptions. The note is saved with the category signals and recommendation.</p></SectionCard></section><aside className="stack-lg"><SectionCard title="Assessment record"><KeyValue label="Assessment format" value="Technical · Soft · Other" /><KeyValue label="Candidate fit" value="84%" /><KeyValue label="Overall interview signal" value={`${overall}% · ${recruiterScoreBand(overall)}`} /><KeyValue label="Stage" value="Interview" /></SectionCard><SectionCard title="Recommendation"><div className="recommendation-options">{(["Recommend offer", "Keep in review", "Do not progress"] as const).map((option) => <button type="button" key={option} className={recommendation === option ? "recommendation-option selected-recommendation" : "recommendation-option"} onClick={() => setRecommendation(option)}>{option}</button>)}</div><button type="button" className="primary-button full-button" onClick={() => void saveAssessment()}><Save size={15} /> Save assessment</button></SectionCard><Notice title="Decision traceability" text="Technical, soft-skill, and other-skill signals are calculated from observed response scores. The evidence note, recommendation, total, and saved time remain together in the assessment record." /></aside></div></RecruiterLayout>;
}
