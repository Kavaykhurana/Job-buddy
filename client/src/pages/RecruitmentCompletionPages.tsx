// Field Notes Institutional Workspace: explicit job publishing and evaluator feedback records for the complete placement lifecycle.
import { useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, FilePenLine, Plus, Save, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { KeyValue, Notice, PageHeader, ProgressBar, SectionCard, StatusPill } from "@/components/Ui";
import { saveRecruiterPostedJob } from "@/data/portalData";
import { api } from "@/lib/api";
import "./RecruitmentCompletionPages.css";
import "./RecruiterPostJob.css";
import "./RecruiterAssessmentScorecard.css";

function RecruiterLayout({ children }: { children: React.ReactNode }) { return <AppShell role="recruiter">{children}</AppShell>; }

type JobDraft = { title: string; mode: string; requiredSkills: string; preferredSkills: string; qualification: string; eligibility: string; stages: string };
const jobPublishSteps = ["Context", "Requirements", "Qualifications", "Selection", "Publish"];
const initialJobDraft: JobDraft = { title: "", mode: "Hybrid", requiredSkills: "", preferredSkills: "", qualification: "", eligibility: "", stages: "Screening · Interview · Offer" };
export function RecruiterJobPublishPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<JobDraft>(initialJobDraft);
  const [, setLocation] = useLocation();
  const update = (field: keyof JobDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const nextStep = () => setStep((current) => Math.min(5, current + 1));
  const publish = async () => {
    if (!draft.title.trim() || !draft.requiredSkills.trim() || !draft.qualification.trim()) {
      toast.error("Add a title, required skills, and qualification requirement before posting.");
      return;
    }
    const newJob = {
      ...draft,
      id: `posted-job-${Date.now()}`,
      status: "Open" as const,
      postedAt: "Just now",
    };
    saveRecruiterPostedJob(newJob);
    try {
      await api.jobs.create({
        id: newJob.id,
        title: draft.title,
        location: draft.mode,
        requiredSkills: draft.requiredSkills,
        preferredSkills: draft.preferredSkills,
        summary: draft.eligibility || draft.qualification,
      });
    } catch {}
    toast.success(`${draft.title} is now posted and visible in Opportunity records.`);
    setLocation("/recruiter/opportunities");
  };
  const cardTitle = step === 1 ? "Job opportunity context" : step === 2 ? "Required and preferred skills" : step === 3 ? "Qualification and eligibility" : step === 4 ? "Recruitment stages" : "Publish review";
  return <RecruiterLayout><Link href="/recruiter/opportunities" className="back-link">← Published requirements</Link><PageHeader eyebrow="Job publishing" title="Create a placement opportunity" description="Define qualifications, required skills, eligibility, selection stages, and visibility for a new industry job opportunity." meta={<StatusPill>Draft</StatusPill>} /><div className="publish-layout"><section className="stack-lg"><SectionCard title="Publishing steps"><div className="publish-steps">{jobPublishSteps.map((label, index) => <button type="button" key={label} onClick={() => setStep(index + 1)} className={step === index + 1 ? "publish-step active-step" : "publish-step"}><span>0{index + 1}</span>{label}</button>)}</div></SectionCard><SectionCard title={cardTitle}>{step === 1 && <div className="publish-form"><label>Opportunity title<input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Junior Data Analyst" /></label><label>Delivery mode<select value={draft.mode} onChange={(event) => update("mode", event.target.value)}><option>Hybrid</option><option>On campus</option><option>Remote</option></select></label></div>}{step === 2 && <div className="publish-form"><label>Required skills<input value={draft.requiredSkills} onChange={(event) => update("requiredSkills", event.target.value)} placeholder="Python, Data analysis, Communication" /></label><label>Preferred skills<input value={draft.preferredSkills} onChange={(event) => update("preferredSkills", event.target.value)} placeholder="SQL, Machine learning" /></label></div>}{step === 3 && <div className="publish-form"><label>Qualification requirement<input value={draft.qualification} onChange={(event) => update("qualification", event.target.value)} placeholder="Computer Science or relevant program" /></label><label>Eligibility rules<textarea rows={5} value={draft.eligibility} onChange={(event) => update("eligibility", event.target.value)} placeholder="Minimum qualifying result, academic evidence, and required skill criteria." /></label></div>}{step === 4 && <div className="publish-form"><label>Selection stages<textarea rows={4} value={draft.stages} onChange={(event) => update("stages", event.target.value)} placeholder="Screening · Interview · Offer" /></label><p className="publish-helper">Students will see the approved stage sequence alongside the role requirements before applying.</p></div>}{step === 5 && <div className="job-publish-review"><StatusPill>Ready to publish</StatusPill><h3>{draft.title || "Untitled opportunity"}</h3><KeyValue label="Mode" value={draft.mode} /><KeyValue label="Required skills" value={draft.requiredSkills || "Not set"} /><KeyValue label="Preferred skills" value={draft.preferredSkills || "Not set"} /><KeyValue label="Qualification" value={draft.qualification || "Not set"} /><KeyValue label="Stages" value={draft.stages || "Not set"} /></div>}</SectionCard></section><aside className="stack-lg"><SectionCard title="Publish controls"><KeyValue label="Current step" value={`${step} of 5`} /><KeyValue label="Requirement version" value="Draft 0.1" /><KeyValue label="Selection stages" value={draft.stages || "Not set"} /><div className="job-publish-actions">{step > 1 && <button type="button" className="small-outline full-button" onClick={() => setStep((current) => current - 1)}>Back</button>}<button type="button" className="small-outline full-button" onClick={() => toast.success("Draft retained in this recruiter workspace.")}><Save size={15} /> Save draft</button><button type="button" className="primary-button full-button" onClick={step === 5 ? () => void publish() : nextStep}>{step === 5 ? "Post job" : "Save and continue"} <ArrowRight size={15} /></button></div></SectionCard><Notice title="Match transparency" text="Students see the published required and preferred skills against their own evidence before they apply; recruiters retain the requirement version used for screening." /></aside></div></RecruiterLayout>;
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
    localStorage.setItem("sih-connect-recruiter-scorecard-anaya", JSON.stringify({ categoryScores, overall, feedback, recommendation, savedAt: new Date().toISOString() }));
    try {
      await api.candidates.saveScorecard("anaya-01", overall, recommendation);
    } catch {}
    toast.success(`Assessment saved: ${overall}% overall · ${recommendation}.`);
  };
  return <RecruiterLayout><Link href="/recruiter/interviews" className="back-link">← Interviews</Link><PageHeader eyebrow="Interview assessment" title="Anaya Sharma · Applied AI Capability Studio" description="Use the same Technical, Soft skills, and Other skills structure as the current knowledge assessment, scored from observed interview responses." meta={<StatusPill>{overall}% overall signal</StatusPill>} /><div className="scorecard-layout"><section className="stack-lg"><SectionCard title="Assessment category signals" aside={<span className="date-meta">1–5 OBSERVED RESPONSE SCALE</span>}><div className="recruiter-assessment-summary">{recruiterAssessmentCategories.map((category) => <div key={category}><span>{category}</span><b>{categoryScores[category]}%</b><small>{recruiterScoreBand(categoryScores[category])}</small><ProgressBar value={categoryScores[category]} /></div>)}</div></SectionCard>{recruiterAssessmentCategories.map((category) => <SectionCard key={category} title={category} aside={<StatusPill tone={categoryScores[category] >= 70 ? "olive" : "ochre"}>{categoryScores[category]}% · {recruiterScoreBand(categoryScores[category])}</StatusPill>}><div className="assessment-score-dimensions">{recruiterAssessmentDimensions.filter((dimension) => dimension.category === category).map((dimension) => <div key={dimension.id}><div><b>{dimension.label}</b><span>{dimension.prompt}</span></div><div className="score-buttons">{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${dimension.label}: ${score} out of 5`} className={scores[dimension.id] === score ? "selected-score" : ""} onClick={() => setScores((current) => ({ ...current, [dimension.id]: score }))}>{score}</button>)}</div><b className="assessment-score-value">{scores[dimension.id]} / 5</b></div>)}</div></SectionCard>)}<SectionCard title="Evaluator evidence note"><textarea rows={5} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Record observed evidence, concerns, limitations, and a next action for the candidate." /><p className="assessment-evidence-note">Record observable evidence, rather than assumptions. The note is saved with the category signals and recommendation.</p></SectionCard></section><aside className="stack-lg"><SectionCard title="Assessment record"><KeyValue label="Assessment format" value="Technical · Soft · Other" /><KeyValue label="Candidate fit" value="84%" /><KeyValue label="Overall interview signal" value={`${overall}% · ${recruiterScoreBand(overall)}`} /><KeyValue label="Stage" value="Interview" /></SectionCard><SectionCard title="Recommendation"><div className="recommendation-options">{(["Recommend offer", "Keep in review", "Do not progress"] as const).map((option) => <button type="button" key={option} className={recommendation === option ? "recommendation-option selected-recommendation" : "recommendation-option"} onClick={() => setRecommendation(option)}>{option}</button>)}</div><button type="button" className="primary-button full-button" onClick={() => void saveAssessment()}><Save size={15} /> Save assessment</button></SectionCard><Notice title="Decision traceability" text="Technical, soft-skill, and other-skill signals are calculated from observed response scores. The evidence note, recommendation, total, and saved time remain together in the assessment record." /></aside></div></RecruiterLayout>;
}
