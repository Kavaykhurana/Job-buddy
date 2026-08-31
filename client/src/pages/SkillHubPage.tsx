// Field Notes Institutional Workspace: dedicated Skill Intelligence page connecting skills to relevant learning courses, assessments, and job requirements.
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { KeyValue, Notice, PageHeader, SectionCard, StatusPill } from "@/components/Ui";
import { assessmentCatalog, getDeclaredSkills, isSkillMatched } from "@/data/assessmentData";
import { jobOpportunities } from "@/data/jobData";

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="student">{children}</AppShell>;
}

// Learning catalog registry for skill mapping
export interface LearningProgram {
  id: string;
  title: string;
  type: string;
  provider: string;
  duration: string;
  fit: string;
  skills: string[];
  state: "Recommended" | "Available";
  courses: Array<{ platform: string; href: string }>;
}

export const allLearningPrograms: LearningProgram[] = [
  {
    id: "sql-evidence",
    title: "SQL evidence workshop",
    type: "Workshop",
    provider: "Data Practice Network",
    duration: "3 guided sessions",
    fit: "Addresses a preferred industry requirement and relational query modeling",
    skills: ["SQL", "Data Analysis", "Database", "Analytics"],
    state: "Recommended",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/data-analysis-sql" },
      { platform: "Udemy", href: "https://www.udemy.com/course/sql-for-data-analytics/" },
    ],
  },
  {
    id: "analytical-findings",
    title: "Communicating analytical findings",
    type: "Certification program",
    provider: "Industry Council",
    duration: "2 guided sessions + assessment",
    fit: "Strengthens research operations and stakeholder narrative alignment",
    skills: ["Communication", "Presentation", "Writing", "Teamwork"],
    state: "Recommended",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/data-storytelling" },
      { platform: "Udemy", href: "https://www.udemy.com/course/storytelling_with_data_v/" },
    ],
  },
  {
    id: "research-writing",
    title: "Evidence-led research writing",
    type: "Training",
    provider: "Research Practice Network",
    duration: "4 guided sessions",
    fit: "Builds a stronger research-operation and reproducible evidence signal",
    skills: ["Research Writing", "Documentation", "Research", "Communication"],
    state: "Available",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/academic-writing-capstone" },
      { platform: "Udemy", href: "https://www.udemy.com/course/research-paper-writing-start-to-finish/" },
    ],
  },
  {
    id: "python-systems",
    title: "Python for Applied Systems & Software Architecture",
    type: "Industry Course",
    provider: "Open Source Tech Alliance",
    duration: "5 guided modules",
    fit: "Builds production Python foundations, algorithmic design, and data structures",
    skills: ["Python", "Algorithms", "Data Structures", "Git", "Software Engineering"],
    state: "Recommended",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/specializations/python" },
      { platform: "Udemy", href: "https://www.udemy.com/course/complete-python-bootcamp/" },
    ],
  },
  {
    id: "machine-learning-studio",
    title: "Applied Machine Learning & Statistical Modeling",
    type: "Certification",
    provider: "Applied AI Capability Studio",
    duration: "6 weeks · Self-paced + review",
    fit: "Develops baseline AI/ML pipeline mastery, feature engineering, and validation",
    skills: ["Machine Learning", "Python", "Data Analysis", "Statistics", "Deep Learning"],
    state: "Recommended",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/machine-learning" },
      { platform: "Fast.ai", href: "https://course.fast.ai/" },
    ],
  },
  {
    id: "product-user-research",
    title: "Digital Product Thinking & User Research Mastery",
    type: "Workshop",
    provider: "Tern & Co. Product Lab",
    duration: "3 interactive sessions",
    fit: "Covers user interview synthesis, telemetry mapping, and product briefs",
    skills: ["Product Thinking", "User Research", "Writing", "Figma", "Analytics"],
    state: "Available",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/uva-darden-digital-product-management" },
      { platform: "Udemy", href: "https://www.udemy.com/course/user-experience-design-fundamentals/" },
    ],
  },
];

export function SkillHubPage({ skillName }: { skillName?: string }) {
  const decodedSkill = decodeURIComponent(skillName || "Python").trim();
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const isVerifiedInProfile = isSkillMatched(decodedSkill, userSkills);

  // Filter matching learning courses
  const matchingCourses = useMemo(() => {
    const directMatches = allLearningPrograms.filter((program) =>
      program.skills.some((s) => isSkillMatched(s, [decodedSkill]))
    );
    if (directMatches.length > 0) return directMatches;
    // Fallback: return top recommended programs
    return allLearningPrograms.slice(0, 3);
  }, [decodedSkill]);

  // Filter matching assessments
  const matchingAssessments = useMemo(() => {
    const direct = assessmentCatalog.filter((a) =>
      a.skills.some((s) => isSkillMatched(s, [decodedSkill]))
    );
    if (direct.length > 0) return direct;
    return assessmentCatalog.slice(0, 3);
  }, [decodedSkill]);

  // Filter matching jobs
  const matchingJobs = useMemo(() => {
    return jobOpportunities.filter(
      (j) =>
        j.required.some((s) => isSkillMatched(s, [decodedSkill])) ||
        j.preferred.some((s) => isSkillMatched(s, [decodedSkill]))
    );
  }, [decodedSkill]);

  return (
    <StudentLayout>
      <Link href="/jobs" className="back-link">
        <ArrowLeft size={16} /> Back to opportunities
      </Link>

      <PageHeader
        eyebrow="Skill Intelligence Hub"
        title={decodedSkill}
        description={`Explore verified learning programs, practice assessments, and industry jobs requiring ${decodedSkill}.`}
        meta={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isVerifiedInProfile ? (
              <StatusPill tone="olive">
                <Check size={12} style={{ display: "inline", marginRight: "3px" }} /> In your profile
              </StatusPill>
            ) : (
              <StatusPill tone="ochre">Gap · Practice needed</StatusPill>
            )}
          </div>
        }
      />

      <div className="development-grid">
        <section className="stack-lg">
          {/* Section 1: Relevant Learning Courses */}
          <SectionCard
            title={`Relevant Courses & Workshops (${matchingCourses.length})`}
            aside={
              <Link href="/learning" className="action-link">
                All learning <ArrowRight size={14} />
              </Link>
            }
          >
            <p className="body-copy" style={{ marginBottom: "14px" }}>
              Enrol in industry-approved training programs to build verifiable evidence for <b>{decodedSkill}</b>.
            </p>
            <div className="learning-catalog" style={{ display: "grid", gap: "12px" }}>
              {matchingCourses.map((program) => (
                <div
                  key={program.id}
                  style={{
                    padding: "14px",
                    border: "1px solid var(--rule)",
                    borderRadius: "9px",
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <span className="eyebrow" style={{ fontSize: "9px", marginBottom: "3px" }}>
                        {program.type} · {program.provider}
                      </span>
                      <h3 style={{ margin: "3px 0 6px", fontSize: "14px", fontWeight: 800 }}>{program.title}</h3>
                      <p className="body-copy" style={{ margin: "0 0 10px", fontSize: "11px" }}>
                        {program.fit}
                      </p>
                      <div className="tag-row" style={{ marginTop: "6px" }}>
                        {program.skills.map((s) => (
                          <span
                            key={s}
                            className={`skill-tag ${isSkillMatched(s, [decodedSkill]) ? "skill-tag-matched" : ""}`}
                          >
                            {isSkillMatched(s, [decodedSkill]) && <Check size={11} className="skill-tag-matched-icon" />}
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="course-links" style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                        {program.courses.map((course) => (
                          <a
                            key={course.platform}
                            href={course.href}
                            target="_blank"
                            rel="noreferrer"
                            className="course-platform-link"
                            style={{ fontSize: "10px", padding: "4px 8px" }}
                          >
                            {course.platform} <ExternalLink size={11} />
                          </a>
                        ))}
                      </div>
                    </div>
                    <Link href={`/learning/${program.id}`} className="small-outline" style={{ whiteSpace: "nowrap" }}>
                      Review program <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Section 2: Relevant Assessments */}
          <SectionCard
            title={`Assessments Covering ${decodedSkill} (${matchingAssessments.length})`}
            aside={
              <Link href="/assessment" className="action-link">
                All assessments <ArrowRight size={14} />
              </Link>
            }
          >
            <p className="body-copy" style={{ marginBottom: "14px" }}>
              Take standardized scenario questionnaires to calculate your verified score signal for <b>{decodedSkill}</b>.
            </p>
            <div className="assessment-catalog" style={{ display: "grid", gap: "12px" }}>
              {matchingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    padding: "14px",
                    border: "1px solid var(--rule)",
                    borderRadius: "9px",
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <span className="eyebrow" style={{ fontSize: "9px", marginBottom: "3px" }}>
                        {assessment.provider} · {assessment.duration}
                      </span>
                      <h3 style={{ margin: "3px 0 6px", fontSize: "14px", fontWeight: 800 }}>{assessment.title}</h3>
                      <p className="body-copy" style={{ margin: "0 0 10px", fontSize: "11px" }}>
                        {assessment.note}
                      </p>
                      <div className="tag-row" style={{ marginTop: "6px" }}>
                        {assessment.skills.map((s) => (
                          <span
                            key={s}
                            className={`skill-tag ${isSkillMatched(s, [decodedSkill]) ? "skill-tag-matched" : ""}`}
                          >
                            {isSkillMatched(s, [decodedSkill]) && <Check size={11} className="skill-tag-matched-icon" />}
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/assessment/${assessment.id}`} className="primary-button" style={{ whiteSpace: "nowrap" }}>
                      Take quiz <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        {/* Sidebar: Matching Opportunities & Quick Actions */}
        <aside className="session-sticky-aside">
          <SectionCard title="Target opportunities">
            <p className="body-copy" style={{ fontSize: "11px", marginBottom: "10px" }}>
              {matchingJobs.length} active placement opportunities require or prefer <b>{decodedSkill}</b>:
            </p>
            <div style={{ display: "grid", gap: "9px" }}>
              {matchingJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  style={{
                    padding: "10px",
                    border: "1px solid var(--rule)",
                    borderRadius: "7px",
                    display: "block",
                    background: "var(--surface)",
                  }}
                >
                  <b style={{ fontSize: "12px", display: "block", color: "var(--ink)" }}>{job.title}</b>
                  <span style={{ fontSize: "10px", color: "var(--slate)" }}>{job.organization} · {job.location}</span>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Skill evidence actions">
            <div className="card-actions-stack" style={{ marginTop: 0 }}>
              <Link href="/profile" className="small-outline full-button">
                Update profile skills <ArrowRight size={14} />
              </Link>
              <Link href="/skill-gaps" className="small-outline full-button">
                View skill gaps register <ArrowRight size={14} />
              </Link>
              <Link href="/portfolio" className="primary-button full-button">
                View digital portfolio <ArrowRight size={14} />
              </Link>
            </div>
          </SectionCard>

          <Notice
            title="Explainable mapping"
            text={`Completing courses or assessments for ${decodedSkill} directly updates your candidate compatibility scores across all matching recruiters.`}
          />
        </aside>
      </div>
    </StudentLayout>
  );
}
