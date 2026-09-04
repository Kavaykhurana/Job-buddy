// Field Notes Institutional Workspace: assessment-to-gap-to-mapping lifecycle with scalable quiz engines, dynamic skill matching, overtime countdown timers, attempt history tracking, and comprehensive result breakdowns.
import { useEffect, useMemo, useState } from "react";
import "./AssessmentPages.css";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Filter,
  Gauge,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  ActionLink,
  EmptyPanel,
  KeyValue,
  Notice,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatCard,
  StatusPill,
} from "@/components/Ui";
import {
  AssessmentDefinition,
  AssessmentHistoryRecord,
  AssessmentSnapshot,
  QuizQuestion,
  SkillCategory,
  assessmentCatalog,
  calculateQuizResult,
  getAssessmentHistories,
  getAssessmentHistory,
  getDeclaredSkills,
  getAssessmentSkillMatches,
  isSkillMatched,
  loadAssessmentResult,
  loadBestAssessmentResult,
  quizCategories,
  sampleRandomQuestionsForAssessment,
  saveAssessmentAttempt,
} from "@/data/assessmentData";

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="student">{children}</AppShell>;
}

// Re-export for compatibility with other student pages
export type { SkillCategory, QuizQuestion, AssessmentSnapshot };
export function loadLatestAssessmentResult(): AssessmentSnapshot | null {
  return loadAssessmentResult();
}

function scoreBand(score: number) {
  return score >= 80 ? "Strong" : score >= 60 ? "Current" : "Developing";
}

// Format seconds into MM:SS or +MM:SS (when overtime)
function formatTimer(seconds: number): { text: string; isOvertime: boolean } {
  if (seconds >= 0) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      text: `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
      isOvertime: false,
    };
  }
  const positive = Math.abs(seconds);
  const mins = Math.floor(positive / 60);
  const secs = positive % 60;
  return {
    text: `+${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
    isOvertime: true,
  };
}

// Format duration taken into human readable string
function formatTimeSpent(seconds?: number): string {
  if (seconds === undefined || seconds === null || seconds <= 0) return "Under 1 min";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}

export function DevelopmentHubPage() {
  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Development"
        title="Build evidence for the next opportunity"
        description="Assess your current profile, understand gaps, and act on learning or career recommendations linked to industry requirements."
        meta={<StatusPill>Profile signal current</StatusPill>}
      />
      <div className="development-grid">
        <section className="stack-lg">
          <SectionCard title="Your development route">
            <div className="development-route">
              <Link href="/assessment">
                <span>01</span>
                <div>
                  <b>Skill assessment</b>
                  <p>Complete industry-shared questionnaires and aptitude checks.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/skill-gaps">
                <span>02</span>
                <div>
                  <b>Strengths and gaps</b>
                  <p>Compare technical and soft skills against published requirements.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/skill-compare/applied-systems">
                <span>03</span>
                <div>
                  <b>Skills versus requirements</b>
                  <p>See exactly where your evidence matches a target role or organisation.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/career-guidance">
                <span>04</span>
                <div>
                  <b>Mapping outcomes</b>
                  <p>Use skills, interests, and demand to choose the next action.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/learning">
                <span>05</span>
                <div>
                  <b>Learning & certifications</b>
                  <p>Build relevant evidence through industry-linked programs and credentials.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="/portfolio">
                <span>06</span>
                <div>
                  <b>Digital portfolio</b>
                  <p>Control verified skills, projects, certificates, and achievement visibility.</p>
                </div>
                <ArrowRight size={17} />
              </Link>
            </div>
          </SectionCard>
          <SectionCard title="Current development signal">
            <div className="signal-summary">
              <div>
                <b>78%</b>
                <span>profile evidence coverage</span>
              </div>
              <ProgressBar value={78} label="Current evidence" />
            </div>
            <div className="tag-row">
              <StatusPill>2 strengths verified</StatusPill>
              <StatusPill tone="ochre">3 targeted gaps</StatusPill>
              <StatusPill tone="muted">1 assessment recommended</StatusPill>
            </div>
          </SectionCard>
        </section>
        <aside className="stack-lg">
          <SectionCard title="Recommended next action">
            <div className="recommendation-note">
              <BrainCircuit size={21} />
              <div>
                <b>Complete the Industry readiness questionnaire.</b>
                <p>It will refresh your strengths, skill gaps, and role/industry mappings against the latest requirement version.</p>
                <div className="card-actions-stack">
                  <Link href="/assessment/industry-readiness" className="primary-button full-button">
                    Start assessment <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Evidence basis">
            <p className="body-copy">
              Assessments preserve their source, version, response record, and scoring context. They update the skill profile without overwriting earlier evidence.
            </p>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

type CatalogueFilter = "all" | "recommended" | "completed" | "mastered90";

export function AssessmentCatalogPage() {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [filter, setFilter] = useState<CatalogueFilter>("all");
  const [histories, setHistories] = useState<Record<string, AssessmentHistoryRecord>>({});

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
    setHistories(getAssessmentHistories());
  }, []);

  // Compute matched assessments and dynamic recommendation/completion status
  const assessmentsWithMeta = useMemo(() => {
    return assessmentCatalog.map((item) => {
      const matchedSkills = getAssessmentSkillMatches(item.skills, userSkills);
      const isRecommended = matchedSkills.length > 0;
      const history = histories[item.id] ?? getAssessmentHistory(item.id);
      const hasCompleted = Boolean(history && history.attemptsCount > 0);
      const isMastered = Boolean(history && history.bestScore >= 90);

      return {
        ...item,
        matchedSkills,
        isRecommended,
        history,
        hasCompleted,
        isMastered,
        status: isRecommended ? "Recommended" : "Available",
      };
    }).sort((a, b) => {
      // Sort recommended ones to the top, then by number of matched skills descending
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return b.matchedSkills.length - a.matchedSkills.length;
    });
  }, [userSkills, histories]);

  const recommendedCount = assessmentsWithMeta.filter((a) => a.isRecommended).length;
  const completedCount = assessmentsWithMeta.filter((a) => a.hasCompleted).length;
  const masteredCount = assessmentsWithMeta.filter((a) => a.isMastered).length;

  const filteredAssessments = useMemo(() => {
    switch (filter) {
      case "recommended":
        return assessmentsWithMeta.filter((a) => a.isRecommended);
      case "completed":
        return assessmentsWithMeta.filter((a) => a.hasCompleted);
      case "mastered90":
        return assessmentsWithMeta.filter((a) => a.isMastered);
      case "all":
      default:
        return assessmentsWithMeta;
    }
  }, [assessmentsWithMeta, filter]);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Skill assessment"
        title="Industry-shared assessments"
        description="Choose a questionnaire or aptitude test to refresh technical skills, soft skills, and industry-aligned readiness evidence based on your profile skills."
        meta={
          <span className="date-meta">
            {assessmentsWithMeta.length} AVAILABLE · {completedCount} COMPLETED
          </span>
        }
      />

      {userSkills.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div className="tag-row" style={{ alignItems: "center", marginTop: 0 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>
              Matching against your profile skills:
            </span>
            {userSkills.map((s) => (
              <span key={s} className="skill-tag skill-tag-matched">
                <Check size={11} className="skill-tag-matched-icon" /> {s}
              </span>
            ))}
            <Link href="/profile" className="action-link" style={{ marginLeft: "8px" }}>
              Edit profile skills <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Catalogue Filter Tabs */}
      <div className="catalogue-filters">
        <button
          type="button"
          className={`catalogue-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Assessments ({assessmentsWithMeta.length})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${filter === "recommended" ? "active" : ""}`}
          onClick={() => setFilter("recommended")}
        >
          <Sparkles size={13} /> Recommended ({recommendedCount})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          <CheckCircle2 size={13} /> Completed Before ({completedCount})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${filter === "mastered90" ? "active" : ""}`}
          onClick={() => setFilter("mastered90")}
        >
          <Trophy size={13} /> 90%+ Mastered ({masteredCount})
        </button>
      </div>

      <div className="assessment-catalog">
        {filteredAssessments.map((assessment) => (
          <SectionCard
            key={assessment.id}
            title={assessment.title}
            aside={
              <div className="assessment-badge-group">
                {assessment.hasCompleted && (
                  <span className="previous-attempt-badge" title="Previously completed by you">
                    <CheckCircle2 size={12} /> Best: {assessment.history?.bestScore}%
                  </span>
                )}
                {assessment.isMastered && (
                  <span className="mastery-badge" title="Scored 90% or higher">
                    <Trophy size={11} /> Mastered
                  </span>
                )}
                {assessment.isRecommended ? (
                  <StatusPill tone="ochre">
                    <Sparkles size={12} style={{ display: "inline", marginRight: "4px" }} />
                    Recommended ({assessment.matchedSkills.length} match{assessment.matchedSkills.length === 1 ? "" : "es"})
                  </StatusPill>
                ) : (
                  <StatusPill tone="muted">Available</StatusPill>
                )}
              </div>
            }
          >
            <div className="assessment-card-body">
              <div style={{ flex: 1 }}>
                <p className="assessment-provider">{assessment.provider}</p>
                <p className="body-copy">{assessment.note}</p>
                <div className="tag-row">
                  <span className="skill-tag">{assessment.format}</span>
                  <span className="skill-tag">
                    <Clock3 size={11} style={{ display: "inline", marginRight: "3px" }} />
                    {assessment.duration}
                  </span>
                  {assessment.skills.map((skill) => {
                    const matches = isSkillMatched(skill, userSkills);
                    return (
                      <span
                        key={skill}
                        className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}
                        title={matches ? `Matches your profile skill "${skill}"` : undefined}
                      >
                        {matches && <Check size={11} className="skill-tag-matched-icon" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="assessment-card-actions">
                {assessment.hasCompleted && (
                  <Link
                    href={`/assessment/${assessment.id}/results`}
                    className="small-outline"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    View best result ({assessment.history?.bestScore}%) <ArrowRight size={14} />
                  </Link>
                )}
                <Link
                  href={`/assessment/${assessment.id}`}
                  className={assessment.hasCompleted ? "primary-button" : "small-outline"}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {assessment.hasCompleted ? "Retake assessment" : "Open assessment"} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </SectionCard>
        ))}

        {filteredAssessments.length === 0 && (
          <EmptyPanel
            title={
              filter === "mastered90"
                ? "No assessments mastered with 90%+ yet"
                : filter === "completed"
                ? "No completed assessments yet"
                : "No assessments found"
            }
            text={
              filter === "mastered90"
                ? "Take assessments from the catalogue to score 90% or higher and build mastery evidence."
                : filter === "completed"
                ? "Select any assessment below to complete your first quiz and calculate your skill signals."
                : "Try resetting your filter to view all available assessments."
            }
            action={
              <button type="button" className="small-outline" onClick={() => setFilter("all")}>
                View all assessments
              </button>
            }
          />
        )}
      </div>

      <Notice
        title="Assessment integrity"
        text="Each assessment preserves its version, randomized question pool snapshot, response record, and scoring context so later skill mappings remain explainable."
      />
    </StudentLayout>
  );
}

export function AssessmentSessionPage({ id = "industry-readiness" }: { id?: string }) {
  const item = assessmentCatalog.find((assessment) => assessment.id === id) ?? assessmentCatalog[0];
  const [, setLocation] = useLocation();

  // Load or sample randomized questions for this specific assessment attempt
  const [questions] = useState<QuizQuestion[]>(() => {
    try {
      const sessionKey = `sih-connect-quiz-questions-${item.id}`;
      const existing = sessionStorage.getItem(sessionKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const sampled = sampleRandomQuestionsForAssessment(item.id, 8);
      sessionStorage.setItem(sessionKey, JSON.stringify(sampled));
      return sampled;
    } catch {
      return sampleRandomQuestionsForAssessment(item.id, 8);
    }
  });

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const initialDurationSeconds = item.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDurationSeconds);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Timer countdown / count-up effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timerInfo = formatTimer(secondsRemaining);
  const completed = questions.filter((question) => answers[question.id] !== undefined).length;
  const totalQuestions = questions.length;
  const completionPercentage = totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0;
  const isAllAnswered = completed === totalQuestions;

  const handleSubmit = () => {
    const result = calculateQuizResult(item.id, answers, questions, timeSpentSeconds);
    saveAssessmentAttempt(result);
    try {
      sessionStorage.removeItem(`sih-connect-quiz-questions-${item.id}`);
    } catch {}

    if (isAllAnswered) {
      toast.success(`Quiz scored: ${result.overall}% overall skill signal.`);
    } else {
      const unansweredCount = totalQuestions - completed;
      toast.success(
        `Quiz scored: ${result.overall}% overall skill signal (${unansweredCount} unanswered counted as 0%).`
      );
    }
    setLocation(`/assessment/${item.id}/results`);
  };

  return (
    <StudentLayout>
      <Link href="/assessment" className="back-link">
        <ArrowLeft size={16} /> Assessment catalogue
      </Link>

      <PageHeader
        eyebrow="Knowledge assessment"
        title={item.title}
        description={`${item.provider} · Allocated: ${item.duration} · Answer questions to calculate technical, soft, and other skill signals.`}
        meta={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className={`quiz-timer ${timerInfo.isOvertime ? "quiz-timer-overtime" : ""}`}>
              <Clock3 size={15} />
              <span>{timerInfo.isOvertime ? `Overtime: ${timerInfo.text}` : `Time remaining: ${timerInfo.text}`}</span>
            </div>
            <StatusPill>{timerInfo.isOvertime ? "Overtime (Active)" : "Quiz in progress"}</StatusPill>
          </div>
        }
      />

      <div className="assessment-session-layout">
        <section className="stack-lg">
          <SectionCard
            title="Quiz progress"
            aside={
              <span className="date-meta">
                {completed} / {totalQuestions} ANSWERED ({completionPercentage}%)
              </span>
            }
          >
            <ProgressBar value={completionPercentage} label="Completion" />
          </SectionCard>

          {questions.map((question, index) => (
            <SectionCard
              key={question.id}
              title={`${String(index + 1).padStart(2, "0")} · ${question.category}`}
              aside={
                <StatusPill tone={answers[question.id] !== undefined ? "olive" : "muted"}>
                  {answers[question.id] !== undefined ? "Answered" : "Unanswered"}
                </StatusPill>
              }
            >
              <div className="question-block">
                <p>{question.prompt}</p>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      className={answers[question.id] === optionIndex ? "quiz-option-selected" : ""}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="tag-row">
                  {question.tags.map((tag) => (
                    <span key={tag} className="skill-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </SectionCard>
          ))}

          {/* Secondary full submit action bar at bottom of questions list */}
          <div className="bottom-submit-bar">
            <div>
              <p>
                <b>{completed} of {totalQuestions}</b> questions answered ({completionPercentage}%).
                {!isAllAnswered && " You can calculate results now; unanswered questions will be marked 0%."}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={handleSubmit}
              style={{ minWidth: "180px" }}
            >
              Calculate results <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Sticky sidebar */}
        <aside className="session-sticky-aside">
          <SectionCard title="Assessment session">
            <KeyValue label="Assessment" value={item.title.split(" ")[0]} />
            <KeyValue
              label="Timer status"
              value={
                <span style={{ color: timerInfo.isOvertime ? "#dc2626" : "var(--olive)", fontWeight: 800 }}>
                  {timerInfo.text} {timerInfo.isOvertime && "(Overtime)"}
                </span>
              }
            />
            <KeyValue label="Questions answered" value={`${completed} / ${totalQuestions}`} />
            <KeyValue label="Completion" value={`${completionPercentage}%`} />
            <KeyValue label="Scoring" value="Correct-response based" />

            <div className="card-actions-stack">
              <button
                className="primary-button full-button"
                onClick={handleSubmit}
              >
                Calculate results <ArrowRight size={16} />
              </button>
            </div>
          </SectionCard>

          <Notice
            title="Integrity & scoring"
            text="You can submit and calculate results at any point. Your exact question snapshot and responses will be saved. Correct answers calculate your skill signals."
          />
        </aside>
      </div>
    </StudentLayout>
  );
}

export function AssessmentResultsPage({ id = "industry-readiness" }: { id?: string }) {
  const item = assessmentCatalog.find((assessment) => assessment.id === id) ?? assessmentCatalog[0];
  const history = getAssessmentHistory(item.id);

  // Allow toggling between latest result and best result if available
  const [viewMode, setViewMode] = useState<"latest" | "best">("latest");

  const latestResult = loadAssessmentResult(item.id);
  const bestResult = loadBestAssessmentResult(item.id);

  const result = (viewMode === "best" && bestResult) ? bestResult : (latestResult ?? bestResult);
  const scores = result?.categoryScores ?? null;
  const userSkills = getDeclaredSkills();

  // Active filter for question breakdown
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const categories = [
    { key: "Technical" as SkillCategory, label: "Technical signal", note: "Knowledge and technical foundations" },
    { key: "Soft skills" as SkillCategory, label: "Soft-skill signal", note: "Communication and collaboration scenarios" },
    { key: "Other skills" as SkillCategory, label: "Other-skill signal", note: "Reasoning, ethics, and work planning" },
  ];

  const questions: QuizQuestion[] = result?.questions ?? [];
  const answers: Record<string, number> = result?.answers ?? {};

  // Count correct/incorrect/unanswered
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
  const unansweredCount = questions.filter((q) => answers[q.id] === undefined).length;
  const incorrectCount = totalQuestions - correctCount;

  // Filtered questions list
  const filteredQuestions = useMemo(() => {
    if (selectedFilter === "All") return questions;
    if (selectedFilter === "Incorrect") return questions.filter((q) => answers[q.id] !== q.correct);
    return questions.filter((q) => q.category === selectedFilter);
  }, [questions, answers, selectedFilter]);

  const handleStatCardClick = (categoryKey: string) => {
    setSelectedFilter((prev) => (prev === categoryKey ? "All" : categoryKey));
  };

  const timeSpentFormatted = formatTimeSpent(result?.timeSpentSeconds);
  const isOvertime = Boolean(result?.timeSpentSeconds && result.timeSpentSeconds > item.durationMinutes * 60);

  return (
    <StudentLayout>
      <Link href="/assessment" className="back-link">
        <ArrowLeft size={16} /> Back to assessment catalogue
      </Link>

      <PageHeader
        eyebrow="Calculated quiz result"
        title={item.title}
        description={
          scores
            ? `Completed ${new Date(result!.submittedAt).toLocaleDateString()} · Time taken: ${timeSpentFormatted} · ${correctCount} of ${totalQuestions} questions correct (${result!.overall}% overall signal).`
            : "No completed quiz result is available yet for this assessment. Complete the assessment to calculate your skill signals."
        }
        meta={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {history && history.attemptsCount > 1 && (
              <div style={{ display: "inline-flex", gap: "4px" }}>
                <button
                  type="button"
                  className={`review-filter-tab ${viewMode === "latest" ? "review-filter-tab-active" : ""}`}
                  onClick={() => setViewMode("latest")}
                  style={{ padding: "4px 8px", fontSize: "10px" }}
                >
                  Latest ({latestResult?.overall}%)
                </button>
                <button
                  type="button"
                  className={`review-filter-tab ${viewMode === "best" ? "review-filter-tab-active" : ""}`}
                  onClick={() => setViewMode("best")}
                  style={{ padding: "4px 8px", fontSize: "10px" }}
                >
                  Best ({bestResult?.overall}%)
                </button>
              </div>
            )}
            <StatusPill tone={scores ? "olive" : "ochre"}>
              {scores ? (viewMode === "best" ? "Viewing best attempt" : "Viewing latest attempt") : "Quiz not completed"}
            </StatusPill>
          </div>
        }
      />

      {scores && (
        <div className="stat-grid">
          {categories.map((category) => {
            const isSelected = selectedFilter === category.key;
            return (
              <div
                key={category.key}
                className={`stat-card stat-${scores[category.key] >= 70 ? "olive" : "ochre"} interactive-stat-card ${
                  isSelected ? "interactive-stat-card-selected" : ""
                }`}
                onClick={() => handleStatCardClick(category.key)}
                title={`Click to review ${category.label} questions`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span>{category.label}</span>
                  <StatusPill tone={isSelected ? "olive" : "muted"}>
                    {isSelected ? "Active filter" : "Click to view"}
                  </StatusPill>
                </div>
                <strong>{scores[category.key]}%</strong>
                <small>
                  {scoreBand(scores[category.key])} · {category.note}
                </small>
              </div>
            );
          })}

          <div
            className={`stat-card stat-olive interactive-stat-card ${selectedFilter === "All" ? "interactive-stat-card-selected" : ""}`}
            onClick={() => setSelectedFilter("All")}
            title="Click to view all questions"
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span>Overall signal</span>
              <StatusPill tone={selectedFilter === "All" ? "olive" : "muted"}>
                {selectedFilter === "All" ? "Active" : "Click to reset"}
              </StatusPill>
            </div>
            <strong>{result!.overall}%</strong>
            <small>
              {correctCount} of {totalQuestions} correct · Time: {timeSpentFormatted}
            </small>
          </div>
        </div>
      )}

      {scores ? (
        <div className="results-layout">
          <section className="stack-lg">
            {/* Strengths and Gaps */}
            <SectionCard title="Calculated strengths">
              <div className="strength-list">
                {categories
                  .filter((category) => scores[category.key] >= 67)
                  .map((category) => (
                    <article key={category.key}>
                      <CheckCircle2 size={17} />
                      <div>
                        <b>{category.label.replace(" signal", "")}</b>
                        <span>
                          {category.note}. Your quiz result is {scores[category.key]}%.
                        </span>
                      </div>
                      <StatusPill>{scoreBand(scores[category.key])}</StatusPill>
                    </article>
                  ))}
                {categories.every((category) => scores[category.key] < 67) && (
                  <p className="body-copy">
                    Repeat the quiz after targeted learning to establish your strongest evidence areas.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Highest-priority gaps">
              <div className="gap-list">
                {categories
                  .filter((category) => scores[category.key] < 67)
                  .map((category) => (
                    <article key={category.key}>
                      <Gauge size={17} />
                      <div>
                        <b>{category.label.replace(" signal", "")}</b>
                        <span>
                          {category.note}. Your quiz result is {scores[category.key]}%; build evidence before the next mapping refresh.
                        </span>
                      </div>
                      <StatusPill tone="ochre">Developing</StatusPill>
                    </article>
                  ))}
                {categories.every((category) => scores[category.key] >= 67) && (
                  <p className="body-copy">
                    Your current practice scores meet the expected baseline across all measured categories. Add independently reviewed evidence before treating this as a credential.
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Comprehensive Question Breakdown & Review */}
            <SectionCard
              title="Comprehensive question & answer review"
              aside={<span className="date-meta">SHOWING {filteredQuestions.length} OF {totalQuestions} QUESTIONS</span>}
            >
              <p className="body-copy" style={{ marginBottom: "10px" }}>
                Click category filters below or the skill cards above to inspect your practice answers. Results are calculated in this browser and are not a verified credential.
              </p>

              {/* Filter Tabs */}
              <div className="review-filter-tabs">
                <button
                  type="button"
                  className={`review-filter-tab ${selectedFilter === "All" ? "review-filter-tab-active" : ""}`}
                  onClick={() => setSelectedFilter("All")}
                >
                  <Filter size={13} /> All Questions ({totalQuestions})
                </button>
                {quizCategories.map((cat) => {
                  const catCount = questions.filter((q) => q.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`review-filter-tab ${selectedFilter === cat ? "review-filter-tab-active" : ""}`}
                      onClick={() => setSelectedFilter(cat)}
                    >
                      {cat} ({catCount})
                    </button>
                  );
                })}
                {incorrectCount > 0 && (
                  <button
                    type="button"
                    className={`review-filter-tab review-filter-tab-alert ${
                      selectedFilter === "Incorrect" ? "review-filter-tab-active" : ""
                    }`}
                    onClick={() => setSelectedFilter("Incorrect")}
                  >
                    <XCircle size={13} /> Incorrect / Unanswered ({incorrectCount})
                  </button>
                )}
              </div>

              {/* Question list */}
              <div className="questions-review-list">
                {filteredQuestions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isUnanswered = userAnswer === undefined;
                  const isCorrect = !isUnanswered && userAnswer === question.correct;

                  return (
                    <div
                      key={question.id}
                      className={`question-review-card ${
                        isCorrect
                          ? "question-review-card-correct"
                          : "question-review-card-incorrect"
                      }`}
                    >
                      <div className="question-review-head">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <b>Question {index + 1}</b>
                          <span className="skill-tag">{question.category}</span>
                        </div>
                        {isCorrect ? (
                          <StatusPill tone="olive">
                            <Check size={12} style={{ display: "inline", marginRight: "3px" }} /> Correct
                          </StatusPill>
                        ) : isUnanswered ? (
                          <StatusPill tone="ochre">
                            <XCircle size={12} style={{ display: "inline", marginRight: "3px" }} /> Unanswered (0%)
                          </StatusPill>
                        ) : (
                          <StatusPill tone="ochre">
                            <XCircle size={12} style={{ display: "inline", marginRight: "3px" }} /> Incorrect
                          </StatusPill>
                        )}
                      </div>

                      <p className="question-review-prompt">{question.prompt}</p>

                      {/* Options breakdown */}
                      <div className="review-options-grid">
                        {question.options.map((option, optIdx) => {
                          const isUserChoice = userAnswer === optIdx;
                          const isCorrectOption = question.correct === optIdx;

                          let optionClass = "review-option-neutral";
                          let badge = null;

                          if (isCorrectOption) {
                            optionClass = "review-option-correct";
                            badge = isUserChoice ? (
                              <StatusPill tone="olive">Your choice · Correct ✓</StatusPill>
                            ) : (
                              <StatusPill tone="olive">Correct answer ✓</StatusPill>
                            );
                          } else if (isUserChoice) {
                            optionClass = "review-option-user-wrong";
                            badge = <StatusPill tone="ochre">Your choice · Incorrect ✗</StatusPill>;
                          }

                          return (
                            <div key={option} className={`review-option-item ${optionClass}`}>
                              <span>{String.fromCharCode(65 + optIdx)}</span>
                              <span>{option}</span>
                              {badge}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="explanation-box">
                        <b>Explanation & learning basis:</b>
                        {question.explanation}
                      </div>

                      {/* Question tags */}
                      <div className="tag-row" style={{ marginTop: "10px" }}>
                        {question.tags.map((tag) => {
                          const matches = isSkillMatched(tag, userSkills);
                          return (
                            <span key={tag} className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}>
                              {matches && <Check size={11} className="skill-tag-matched-icon" />}
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredQuestions.length === 0 && (
                  <p className="body-copy" style={{ textAlign: "center", padding: "20px" }}>
                    No questions in this filter category.
                  </p>
                )}
              </div>
            </SectionCard>
          </section>

          {/* Sidebar */}
          <aside className="session-sticky-aside">
            <SectionCard title="Act on this result">
              <div className="card-actions-stack" style={{ marginTop: 0 }}>
                <Link href={`/assessment/${item.id}`} className="primary-button full-button">
                  <RotateCcw size={15} /> Retake this assessment
                </Link>
                <Link href="/assessment" className="small-outline full-button">
                  Browse other assessments <ArrowRight size={15} />
                </Link>
                <Link href="/profile" className="small-outline full-button">
                  View profile skills <ArrowRight size={15} />
                </Link>
                <Link href="/skill-gaps" className="small-outline full-button">
                  Review skill gaps <ArrowRight size={15} />
                </Link>
                <Link href="/skill-map/roles" className="small-outline full-button">
                  Open mapping outcomes <ArrowRight size={15} />
                </Link>
              </div>
            </SectionCard>

            <SectionCard title="Result record">
              <KeyValue label="Assessment" value={item.title.split(" ")[0]} />
              <KeyValue label="Provider" value={item.provider.split(" · ")[0]} />
              <KeyValue label="Time taken" value={`${timeSpentFormatted} ${isOvertime ? "(Overtime)" : ""}`} />
              <KeyValue label="Allocated time" value={item.duration} />
              <KeyValue label="Accuracy" value={`${correctCount} / ${totalQuestions} (${result!.overall}%)`} />
              {history && history.attemptsCount > 1 && (
                <KeyValue label="Best score record" value={`${history.bestScore}% (${history.attemptsCount} attempts)`} />
              )}
              <KeyValue label="Answer record" value="Stored locally" />
              <KeyValue label="Profile update" value="Calculated" />
            </SectionCard>
          </aside>
        </div>
      ) : (
        <Notice
          title="Complete the quiz first"
          text="Return to the assessment session, answer questions, and submit to calculate technical, soft, and other skill signals."
        />
      )}
    </StudentLayout>
  );
}

export function SkillGapsPage() {
  const latest = loadLatestAssessmentResult();
  const gaps = [
    { skill: "SQL evidence", kind: "Technical", you: "No verified evidence", requirement: "Preferred for Applied Systems", action: "SQL evidence workshop", priority: "High" },
    { skill: "Evidence-led presentation", kind: "Soft skill", you: "Developing", requirement: "Needed for research operations", action: "Analytical findings program", priority: "High" },
    { skill: "User research", kind: "Technical", you: "Developing", requirement: "Preferred for digital product", action: "Product research primer", priority: "Medium" },
  ];

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Strengths & gaps"
        title="Targeted skill gaps"
        description={
          latest
            ? `Your latest quiz recorded ${latest.categoryScores.Technical}% technical, ${latest.categoryScores["Soft skills"]}% soft-skill, and ${latest.categoryScores["Other skills"]}% other-skill signals. Combine these with verified evidence and current requirements.`
            : "Complete the knowledge quiz to add calculated technical, soft, and other skill signals to this evidence-led gap view."
        }
        meta={<StatusPill tone="ochre">3 actions</StatusPill>}
      />
      <SectionCard title="Current gap register">
        <div className="gap-table">
          <div className="table-head">
            <span>Skill</span>
            <span>Your evidence</span>
            <span>Industry requirement</span>
            <span>Next action</span>
          </div>
          {gaps.map((gap) => (
            <div className="gap-row" key={gap.skill}>
              <div>
                <b>{gap.skill}</b>
                <small>{gap.kind}</small>
              </div>
              <StatusPill tone="ochre">{gap.you}</StatusPill>
              <span>{gap.requirement}</span>
              <Link href="/learning" className="action-link">
                {gap.action} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="detail-layout">
        <SectionCard title="What is already strong">
          <div className="tag-row">
            <StatusPill>Data analysis</StatusPill>
            <StatusPill>Research writing</StatusPill>
            <StatusPill>Communication</StatusPill>
          </div>
          <p className="body-copy">
            Verified strengths are retained separately from answer-calculated quiz signals so you can see the evidence basis for each profile status.
          </p>
        </SectionCard>
        <SectionCard title="Compare directly">
          <p className="body-copy">
            Use a target comparison to see requirement-by-requirement evidence for a company, role, job, or internship.
          </p>
          <div className="card-actions-stack">
            <Link href="/skill-compare/applied-systems" className="primary-button full-button">
              Open comparison <ArrowRight size={15} />
            </Link>
          </div>
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

export function SkillComparePage() {
  const rows = [
    { skill: "Python", requirement: "Required · Advanced", yours: "Verified · Advanced", tone: "olive" as const },
    { skill: "Data analysis", requirement: "Required · Intermediate", yours: "Current · Intermediate", tone: "olive" as const },
    { skill: "Communication", requirement: "Required · Intermediate", yours: "Current · Intermediate", tone: "olive" as const },
    { skill: "SQL", requirement: "Preferred · Intermediate", yours: "No verified evidence", tone: "ochre" as const },
    { skill: "Machine learning", requirement: "Preferred · Developing", yours: "Developing evidence", tone: "muted" as const },
  ];

  return (
    <StudentLayout>
      <Link href="/skill-gaps" className="back-link">
        <ArrowLeft size={16} /> Strengths & gaps
      </Link>
      <PageHeader
        eyebrow="Direct comparison"
        title="Your skills vs. company requirements"
        description="Applied AI Capability Studio · Northstar Systems · Requirement version dated 22 Aug 2026."
        meta={<StatusPill>84% overall fit</StatusPill>}
      />
      <div className="comparison-hero">
        <div>
          <span className="eyebrow">Requirement context</span>
          <h2>See the evidence behind your compatibility score.</h2>
          <p>Each row compares the company’s published requirement with your verified, current, or developing skill evidence.</p>
        </div>
        <div className="comparison-score">
          <b>84%</b>
          <span>evidence-led fit</span>
          <ProgressBar value={84} />
        </div>
      </div>
      <SectionCard title="Requirement comparison">
        <div className="compare-table">
          <div className="table-head">
            <span>Company requirement</span>
            <span>Level / importance</span>
            <span>Your current evidence</span>
            <span>Status</span>
          </div>
          {rows.map((row) => (
            <div className="compare-row" key={row.skill}>
              <b>{row.skill}</b>
              <span>{row.requirement}</span>
              <span>{row.yours}</span>
              <StatusPill tone={row.tone}>
                {row.tone === "olive" ? "Aligned" : row.tone === "ochre" ? "Gap" : "Developing"}
              </StatusPill>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="comparison-actions">
        <Link href="/jobs/ai-studio" className="small-outline">
          Review opportunity
        </Link>
        <Link href="/learning" className="primary-button">
          Address gaps through learning <ArrowRight size={15} />
        </Link>
      </div>
    </StudentLayout>
  );
}

export function CareerGuidancePage() {
  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Career guidance"
        title="Guidance from skills, interests, and demand"
        description="Recommendations are explained from your profile evidence, declared interests, current skill demand, and available opportunities."
        meta={<StatusPill>Explainable mapping</StatusPill>}
      />
      <div className="guidance-layout">
        <section className="stack-lg">
          <SectionCard title="Your stated interests">
            <div className="interest-panel">
              <Compass size={19} />
              <div>
                <b>Applied systems, research operations, and digital product</b>
                <p>These interests are used alongside skill evidence and demand—not as an automated decision.</p>
              </div>
              <button
                className="small-outline"
                onClick={() => toast("Interest preferences are editable through the connected profile workflow.")}
              >
                Edit interests
              </button>
            </div>
          </SectionCard>
          <SectionCard title="Recommended directions">
            <div className="guidance-list">
              <article>
                <Target size={18} />
                <div>
                  <StatusPill>Strongest fit</StatusPill>
                  <h3>Applied systems</h3>
                  <p>Python and data-analysis evidence align with current high demand and 2 available opportunities.</p>
                </div>
                <Link href="/skill-compare/applied-systems" className="action-link">
                  Compare <ArrowRight size={15} />
                </Link>
              </article>
              <article>
                <Target size={18} />
                <div>
                  <StatusPill tone="muted">Developing fit</StatusPill>
                  <h3>Research operations</h3>
                  <p>Documentation evidence is positive; presentation and SQL evidence would improve readiness.</p>
                </div>
                <Link href="/learning" className="action-link">
                  Build evidence <ArrowRight size={15} />
                </Link>
              </article>
              <article>
                <Target size={18} />
                <div>
                  <StatusPill tone="ochre">Early signal</StatusPill>
                  <h3>Digital product</h3>
                  <p>Interest is present; user-research evidence is the next highest-priority gap.</p>
                </div>
                <Link href="/skill-gaps" className="action-link">
                  Review gaps <ArrowRight size={15} />
                </Link>
              </article>
            </div>
          </SectionCard>
        </section>
        <aside className="stack-lg">
          <SectionCard title="Recommendation inputs">
            <KeyValue label="Assessment results" value="Current" />
            <KeyValue label="Verified skills" value="6" />
            <KeyValue label="Declared interests" value="3" />
            <KeyValue label="Demand snapshot" value="22 Aug" />
          </SectionCard>
          <SectionCard title="Next action">
            <p className="body-copy">
              Complete a targeted learning program or open a relevant placement/internship opportunity from your mapped direction.
            </p>
            <div className="card-actions-stack">
              <Link href="/internships/matches" className="primary-button full-button">
                View matched internships <ArrowRight size={15} />
              </Link>
            </div>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}
