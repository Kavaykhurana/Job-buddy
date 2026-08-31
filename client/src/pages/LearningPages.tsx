// Field Notes Institutional Workspace: learning, credential, portfolio, and document evidence flows with reactive progress, enrollment, and certification sync.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Award,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  FileLock2,
  Filter,
  FolderKey,
  GraduationCap,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";
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
import { getDeclaredSkills, isSkillMatched } from "@/data/assessmentData";
import {
  addStudentCertificate,
  cancelProgramEnrollment,
  CourseEnrollment,
  enrollInProgram,
  getStoredCertificates,
  getStoredEnrollments,
  initialLearningPrograms,
  LearningProgram,
  removeStudentCertificate,
  StudentCertificate,
  toggleModuleProgress,
} from "@/data/learningData";
import "./LearningPages.css";
import "./JobsAndApplications.css";

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="student">{children}</AppShell>;
}

export function LearningCatalogPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>({});

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
    setEnrollments(getStoredEnrollments());
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    initialLearningPrograms.forEach((p) => p.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedSkills([]);
  };

  const filteredPrograms = useMemo(() => {
    return initialLearningPrograms.filter((program) => {
      // 1. Query search
      if (query.trim()) {
        const searchable = `${program.title} ${program.provider} ${program.type} ${program.fit} ${program.summary} ${program.skills.join(" ")}`.toLowerCase();
        if (!searchable.includes(query.trim().toLowerCase())) return false;
      }

      // 2. Category filter
      const isEnrolled = !!enrollments[program.id] && enrollments[program.id].status === "Active";
      if (selectedCategory === "enrolled" && !isEnrolled) return false;
      if (selectedCategory === "recommended" && program.state !== "Recommended") return false;
      if (selectedCategory === "workshop" && program.type !== "Workshop") return false;
      if (selectedCategory === "certification" && program.type !== "Certification program") return false;

      // 3. Skills filter
      if (selectedSkills.length > 0) {
        const matchesSkills = selectedSkills.some((s) =>
          program.skills.some((ps) => ps.toLowerCase() === s.toLowerCase())
        );
        if (!matchesSkills) return false;
      }

      return true;
    });
  }, [query, selectedCategory, selectedSkills, enrollments]);

  const activeFilterCount =
    (query ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    selectedSkills.length;

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Learning & credentials"
        title="Programs aligned to your gaps"
        description="Search training, certification, and industry-relevant learning recommendations linked to your assessment results and current requirements."
        meta={
          <span className="date-meta">
            {filteredPrograms.length} PROGRAM{filteredPrograms.length === 1 ? "" : "S"} AVAILABLE
          </span>
        }
      />

      {/* Profile Skills Context Indicator */}
      {userSkills.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div className="tag-row" style={{ alignItems: "center", marginTop: 0 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>
              Your verified profile skills:
            </span>
            {userSkills.map((s) => (
              <span key={s} className="skill-tag skill-tag-matched">
                <Check size={11} className="skill-tag-matched-icon" /> {s}
              </span>
            ))}
            <Link href="/profile" className="action-link" style={{ marginLeft: "8px" }}>
              Edit profile skills <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="catalogue-filters" style={{ flexWrap: "wrap", gap: "8px" }}>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All Programs ({initialLearningPrograms.length})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedCategory === "recommended" ? "active" : ""}`}
          onClick={() => setSelectedCategory("recommended")}
        >
          <Sparkles size={13} /> Gap-Aligned Recommendations
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedCategory === "enrolled" ? "active" : ""}`}
          onClick={() => setSelectedCategory("enrolled")}
        >
          <BookOpenCheck size={13} /> My Active Enrolments (
          {Object.values(enrollments).filter((e) => e.status === "Active").length})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedCategory === "certification" ? "active" : ""}`}
          onClick={() => setSelectedCategory("certification")}
        >
          <Award size={13} /> Certifications
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedCategory === "workshop" ? "active" : ""}`}
          onClick={() => setSelectedCategory("workshop")}
        >
          Workshops
        </button>
      </div>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="active-filters-bar" style={{ marginTop: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--slate)" }}>
            Active filters ({activeFilterCount}):
          </span>
          {query && (
            <span className="active-filter-chip">
              Search: "{query}"
              <button type="button" onClick={() => setQuery("")}>
                <X size={12} />
              </button>
            </span>
          )}
          {selectedCategory !== "all" && (
            <span className="active-filter-chip">
              Category: {selectedCategory}
              <button type="button" onClick={() => setSelectedCategory("all")}>
                <X size={12} />
              </button>
            </span>
          )}
          {selectedSkills.map((s) => (
            <span key={s} className="active-filter-chip">
              Skill: {s}
              <button type="button" onClick={() => toggleSkill(s)}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button type="button" className="clear-all-filters-btn" onClick={resetFilters}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Learning Layout */}
      <div className="jobs-layout" style={{ marginTop: "16px" }}>
        <aside className="filter-rail">
          <div className="filter-title">
            <Filter size={16} /> Filter Learning
          </div>

          <div className="filter-group">
            <label className="filter-group-title" htmlFor="learning-search-input">
              Keyword search
            </label>
            <input
              id="learning-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Skill, topic, provider"
            />
          </div>

          <div className="filter-group">
            <span className="filter-group-title">Filter by Skills</span>
            <div className="filter-skills-grid">
              {allSkills.map((skill) => {
                const isActive = selectedSkills.includes(skill);
                const isProfile = isSkillMatched(skill, userSkills);
                return (
                  <button
                    key={skill}
                    type="button"
                    className={`filter-skill-pill ${isActive ? "active" : ""}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {isActive && <Check size={10} />}
                    {skill} {isProfile && "★"}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={resetFilters}
            style={{ marginTop: "12px", width: "100%", textAlign: "center" }}
          >
            Reset all filters
          </button>
        </aside>

        <div className="job-results">
          <div className="search-strip">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs, workshops, certifications, or targeted skills"
            />
            {query ? (
              <button type="button" className="search-clear" onClick={() => setQuery("")}>
                <X size={15} />
              </button>
            ) : (
              <span className="search-summary">
                {filteredPrograms.length} program{filteredPrograms.length === 1 ? "" : "s"} available
              </span>
            )}
          </div>

          <div className="learning-catalog">
            {filteredPrograms.map((program) => {
              const enrollment = enrollments[program.id];
              const isEnrolled = enrollment && enrollment.status === "Active";
              const isCompleted = enrollment && enrollment.status === "Completed";

              return (
                <SectionCard
                  key={program.id}
                  title={program.title}
                  aside={
                    isCompleted ? (
                      <StatusPill tone="olive">Completed (100%)</StatusPill>
                    ) : isEnrolled ? (
                      <StatusPill tone="ochre">Enrolled ({enrollment.progressPercent}%)</StatusPill>
                    ) : (
                      <StatusPill tone={program.state === "Recommended" ? "ochre" : "muted"}>
                        {program.state}
                      </StatusPill>
                    )
                  }
                >
                  <div className="program-body">
                    <div className="program-icon">
                      {isCompleted ? (
                        <Award size={20} />
                      ) : isEnrolled ? (
                        <BookOpenCheck size={20} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>
                    <div>
                      <p className="program-meta">
                        {program.type} · {program.provider} · {program.duration}
                      </p>
                      <p className="body-copy">{program.fit}</p>
                      <div className="tag-row">
                        {program.skills.map((skill) => {
                          const matches = isSkillMatched(skill, userSkills);
                          return (
                            <span
                              key={skill}
                              className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}
                              title={
                                matches
                                  ? `Verified in your profile: ${skill}`
                                  : `Gap skill targeted by this program: ${skill}`
                              }
                            >
                              {matches && <Check size={11} className="skill-tag-matched-icon" />}
                              {skill} {!matches && "(gap)"}
                            </span>
                          );
                        })}
                      </div>
                      <div className="course-links">
                        {program.courses.map((course) => (
                          <a
                            key={course.platform}
                            href={course.href}
                            target="_blank"
                            rel="noreferrer"
                            className="course-platform-link"
                          >
                            {course.platform} {course.rating && `(${course.rating})`}{" "}
                            <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Link href={`/learning/${program.id}`} className="small-outline">
                        Review program <ChevronRight size={15} />
                      </Link>
                      {isEnrolled && (
                        <Link
                          href="/learning/progress"
                          className="small-outline"
                          style={{ borderColor: "var(--olive)", color: "var(--olive-deep)" }}
                        >
                          Track progress <ChevronRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </SectionCard>
              );
            })}

            {filteredPrograms.length === 0 && (
              <EmptyPanel
                title="No learning programs match your search"
                text="Try clearing your keywords or selecting different skill filters."
                action={
                  <button type="button" className="small-outline" onClick={resetFilters}>
                    Reset filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="learning-bottom-grid">
        <SectionCard title="Learning progress">
          <p className="body-copy">
            Track module completions, live evidence benchmarks, and cancel or resume active courses.
          </p>
          <Link href="/learning/progress" className="action-link">
            Open progress tracker <ChevronRight size={15} />
          </Link>
        </SectionCard>
        <SectionCard title="Credentials & Certificates">
          <p className="body-copy">
            Upload new certificates, view provider credentials, and sync verified skills directly to
            your profile.
          </p>
          <Link href="/certifications" className="action-link">
            Open certifications hub <ChevronRight size={15} />
          </Link>
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

export function LearningDetailPage({ id = "sql-evidence" }: { id?: string }) {
  const program =
    initialLearningPrograms.find((item) => item.id === id) ?? initialLearningPrograms[0];
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    const enrollments = getStoredEnrollments();
    setEnrollment(enrollments[program.id] || null);
    setUserSkills(getDeclaredSkills());
  }, [program.id]);

  const handleEnroll = () => {
    const newEnrollment = enrollInProgram(program.id);
    setEnrollment(newEnrollment);
    toast.success(`Enrolled in ${program.title}!`, {
      description: "You can now track module progress on the Learning Progress page.",
    });
  };

  const handleDrop = () => {
    cancelProgramEnrollment(program.id);
    setEnrollment(null);
    toast.info(`Cancelled enrollment in ${program.title}.`);
  };

  const isEnrolled = enrollment && enrollment.status === "Active";
  const isCompleted = enrollment && enrollment.status === "Completed";

  return (
    <StudentLayout>
      <Link href="/learning" className="back-link">
        ← Learning & credentials
      </Link>
      <PageHeader
        eyebrow="Learning program"
        title={program.title}
        description={`${program.type} · ${program.provider} · ${program.duration}`}
        meta={
          isCompleted ? (
            <StatusPill tone="olive">Completed</StatusPill>
          ) : isEnrolled ? (
            <StatusPill tone="ochre">Enrolled ({enrollment.progressPercent}%)</StatusPill>
          ) : (
            <StatusPill tone={program.state === "Recommended" ? "ochre" : "muted"}>
              {program.state}
            </StatusPill>
          )
        }
      />

      <div className="learning-detail-grid">
        <section className="stack-lg">
          <SectionCard title="Why this is recommended">
            <p className="learning-lead">
              {program.fit}. This program is matched to build targeted evidence for your profile.
            </p>
            <div className="tag-row">
              {program.skills.map((skill) => {
                const matches = isSkillMatched(skill, userSkills);
                return (
                  <span
                    key={skill}
                    className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}
                  >
                    {matches && <Check size={11} className="skill-tag-matched-icon" />}
                    {skill}
                  </span>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Program curriculum & outline">
            <div className="module-list">
              {program.modules.map((m, idx) => (
                <article key={m.id}>
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{m.title}</b>
                    <p>{m.description}</p>
                  </div>
                  <StatusPill tone="muted">{m.duration}</StatusPill>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Enrollment Status">
            <KeyValue label="Provider" value={program.provider} />
            <KeyValue label="Format" value={program.type} />
            <KeyValue label="Estimated Time" value={program.duration} />
            <KeyValue
              label="Status"
              value={
                isCompleted
                  ? "Completed (100%)"
                  : isEnrolled
                  ? `Active (${enrollment.progressPercent}% complete)`
                  : "Not enrolled"
              }
            />

            <div className="course-links course-links-detail">
              {program.courses.map((course) => (
                <a
                  key={course.platform}
                  href={course.href}
                  target="_blank"
                  rel="noreferrer"
                  className="course-platform-link"
                >
                  Open on {course.platform} <ExternalLink size={12} />
                </a>
              ))}
            </div>

            {isEnrolled ? (
              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                <Link href="/learning/progress" className="primary-button full-button">
                  Open Progress Tracker <ChevronRight size={15} />
                </Link>
                <button
                  type="button"
                  className="small-outline full-button"
                  style={{ color: "#dc2626", borderColor: "#fecaca" }}
                  onClick={handleDrop}
                >
                  Cancel / Drop Course
                </button>
              </div>
            ) : isCompleted ? (
              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                <Link href="/certifications" className="primary-button full-button">
                  View Issued Certificate <Award size={15} />
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="primary-button full-button"
                onClick={handleEnroll}
              >
                Enroll in program
              </button>
            )}
          </SectionCard>

          <Notice
            title="Credential evidence"
            text="Completing all modules automatically generates an official credential and adds the acquired skills directly to your verified profile."
          />
        </aside>
      </div>
    </StudentLayout>
  );
}

export function LearningProgressPage() {
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>({});
  const [, setRefresh] = useState(0);

  useEffect(() => {
    setEnrollments(getStoredEnrollments());
  }, []);

  const activeEnrollments = useMemo(() => {
    return Object.values(enrollments).filter((e) => e.status === "Active");
  }, [enrollments]);

  const completedEnrollments = useMemo(() => {
    return Object.values(enrollments).filter((e) => e.status === "Completed");
  }, [enrollments]);

  const handleToggleModule = (program: LearningProgram, moduleId: string) => {
    const updated = toggleModuleProgress(program.id, moduleId, program.modules.length);
    const newEnrollments = { ...enrollments, [program.id]: updated };
    setEnrollments(newEnrollments);
    setRefresh((r) => r + 1);

    if (updated.status === "Completed") {
      toast.success(`🎉 Congratulations! You completed "${program.title}"!`, {
        description: `Your credential has been issued and skills (${program.skills.join(", ")}) were added to your profile.`,
      });
    } else {
      toast.success("Progress updated successfully.");
    }
  };

  const handleCancelCourse = (programId: string, programTitle: string) => {
    cancelProgramEnrollment(programId);
    const newEnrollments = { ...enrollments };
    delete newEnrollments[programId];
    setEnrollments(newEnrollments);
    toast.info(`Cancelled enrollment in "${programTitle}".`);
  };

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Learning progress"
        title="Your learning activity"
        description="Monitor active courses, check off completed modules, track overall completion, and cancel or drop enrolments."
        meta={
          <span className="date-meta">
            {activeEnrollments.length} ACTIVE ENROLMENT{activeEnrollments.length === 1 ? "" : "S"}
          </span>
        }
      />

      <div className="stack-lg">
        {/* Active Enrolments */}
        {activeEnrollments.map((enr) => {
          const program =
            initialLearningPrograms.find((p) => p.id === enr.programId) || initialLearningPrograms[0];

          return (
            <SectionCard
              key={enr.programId}
              title={program.title}
              aside={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusPill tone="ochre">Active · {enr.progressPercent}%</StatusPill>
                  <button
                    type="button"
                    className="small-outline"
                    style={{ color: "#dc2626", borderColor: "#fecaca", fontSize: "11px" }}
                    onClick={() => handleCancelCourse(program.id, program.title)}
                  >
                    Drop Course
                  </button>
                </div>
              }
            >
              <div className="progress-program">
                <div className="program-icon">
                  <BookOpenCheck size={20} />
                </div>
                <div>
                  <b>{program.title}</b>
                  <span>
                    {program.provider} · Enrolled on{" "}
                    {new Date(enr.enrolledAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <ProgressBar value={enr.progressPercent} label="Completion progress" />
                </div>
                <div style={{ textAlign: "right", minWidth: "90px" }}>
                  <b style={{ fontSize: "22px", color: "var(--olive)" }}>{enr.progressPercent}%</b>
                  <small style={{ display: "block", color: "var(--slate)", fontSize: "10px" }}>
                    {enr.completedModules.length} / {program.modules.length} modules
                  </small>
                </div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <span className="filter-group-title" style={{ marginBottom: "6px" }}>
                  Click to mark module completion:
                </span>
                <div className="module-progress-list">
                  {program.modules.map((mod) => {
                    const isDone = enr.completedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr auto",
                          cursor: "pointer",
                          padding: "10px 8px",
                          borderRadius: "6px",
                          background: isDone ? "var(--olive-wash)" : "transparent",
                          marginBottom: "4px",
                        }}
                        onClick={() => handleToggleModule(program, mod.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          style={{ cursor: "pointer", accentColor: "var(--olive-deep)" }}
                        />
                        <div>
                          <b style={{ fontSize: "12px", color: isDone ? "var(--olive-deep)" : "var(--ink)" }}>
                            {mod.title}
                          </b>
                          <p style={{ margin: "2px 0 0", color: "var(--slate)", fontSize: "10.5px" }}>
                            {mod.description} · <span style={{ fontWeight: 600 }}>{mod.duration}</span>
                          </p>
                        </div>
                        <StatusPill tone={isDone ? "olive" : "muted"}>
                          {isDone ? "Completed" : "Mark Done"}
                        </StatusPill>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          );
        })}

        {activeEnrollments.length === 0 && (
          <EmptyPanel
            title="No active course enrolments"
            text="Explore the learning catalogue and enrol in gap-aligned programs to begin building verifiable skill evidence."
            action={
              <Link href="/learning" className="small-outline">
                Browse programs
              </Link>
            }
          />
        )}

        {/* Completed Learning */}
        <SectionCard title="Completed Credentials & Evidence">
          {completedEnrollments.length > 0 ? (
            <div className="stack-md">
              {completedEnrollments.map((enr) => {
                const program =
                  initialLearningPrograms.find((p) => p.id === enr.programId) || initialLearningPrograms[0];

                return (
                  <div key={enr.programId} className="attached-file-row">
                    <div className="attached-file-info">
                      <Award size={20} style={{ color: "var(--olive)" }} />
                      <div>
                        <b>{program.title}</b>
                        <span>
                          Issued by {program.provider} · 100% completed · Credential ID:{" "}
                          {enr.certificateId || "CERT-VERIFIED"}
                        </span>
                      </div>
                    </div>
                    <Link href="/certifications" className="small-outline">
                      View Certificate <ChevronRight size={13} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-panel">
              <Award size={20} />
              <div>
                <h3>No completed credentials yet</h3>
                <p>
                  Complete all modules of an enrolled program to receive an official verified
                  credential.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

export function CertificationsPage() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [skillsStr, setSkillsStr] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [uploadedDocName, setUploadedDocName] = useState("");
  const [uploadedDocData, setUploadedDocData] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCertificates(getStoredCertificates());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedDocData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      toast.error("Please enter a certification title and issuing provider.");
      return;
    }

    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const generatedId = credentialId.trim() || `CERT-${Date.now().toString().slice(-6)}`;

    const newCert = addStudentCertificate({
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate || new Date().toISOString().slice(0, 10),
      credentialId: generatedId,
      skills: skills.length > 0 ? skills : ["Verified Skill"],
      verified: true,
      documentName: uploadedDocName || undefined,
      documentDataUrl: uploadedDocData,
    });

    setCertificates(getStoredCertificates());
    setShowAddModal(false);
    setTitle("");
    setIssuer("");
    setSkillsStr("");
    setCredentialId("");
    setUploadedDocName("");
    setUploadedDocData(undefined);

    toast.success(`Certificate "${newCert.title}" added!`, {
      description:
        skills.length > 0
          ? `Skills (${skills.join(", ")}) were automatically added to your profile!`
          : "Your credential is now verified on your profile.",
    });
  };

  const handleRemove = (id: string, certTitle: string) => {
    removeStudentCertificate(id);
    setCertificates(getStoredCertificates());
    toast.info(`Removed certificate "${certTitle}".`);
  };

  const handleDownload = (cert: StudentCertificate) => {
    if (cert.documentDataUrl) {
      const a = document.createElement("a");
      a.href = cert.documentDataUrl;
      a.download = cert.documentName || `${cert.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate official verification blob
      const content = `SIH CONNECT VERIFIED CREDENTIAL CERTIFICATE\n\nTitle: ${cert.title}\nIssuer: ${cert.issuer}\nIssue Date: ${cert.issueDate}\nCredential ID: ${cert.credentialId}\nVerified Skills: ${cert.skills.join(", ")}\nVerification Hash: ${Math.random().toString(36).substring(2, 15)}\nStatus: Official Verified Record`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.title.replace(/\s+/g, "_")}_Credential.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success(`Downloaded credential for "${cert.title}".`);
  };

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Certifications"
        title="Credentials and verification"
        description="Manage provider-issued credentials. Adding a certificate automatically verifies and adds its skills to your student profile."
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} /> Add Certificate
          </button>
        }
      />

      {/* Add Certificate Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Add New Certification
              </h3>
              <button
                type="button"
                className="file-remove-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCertificate} style={{ display: "grid", gap: "12px" }}>
              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                Certificate Name *
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                Issuing Organization / Provider *
                <input
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services, DeepLearning.AI, Coursera"
                  required
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                  Issue Date
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                  Credential ID (optional)
                  <input
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    placeholder="e.g. AWS-94821"
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                Certified Skills (comma separated — will sync to your profile)
                <input
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, Data Analysis"
                />
              </label>

              <label style={{ display: "grid", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                Upload Certificate Proof (PDF or Image)
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  style={{ fontSize: "11px" }}
                />
              </label>

              {uploadedDocName && (
                <div style={{ fontSize: "11px", color: "var(--olive)" }}>
                  ✓ Attached: {uploadedDocName}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save & Sync to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Grid */}
      <div className="credential-grid">
        {certificates.map((cert) => (
          <SectionCard
            key={cert.id}
            title={cert.title}
            aside={<StatusPill tone="olive">Verified</StatusPill>}
          >
            <div className="credential-card">
              <Award size={24} />
              <div>
                <p>
                  {cert.issuer} · Issued {cert.issueDate}
                  {cert.expiryDate && ` · Valid until ${cert.expiryDate}`}
                </p>
                <b>Credential ID: {cert.credentialId}</b>
                <div className="tag-row" style={{ marginTop: "6px" }}>
                  {cert.skills.map((s) => (
                    <span key={s} className="skill-tag skill-tag-matched">
                      <Check size={10} className="skill-tag-matched-icon" /> {s}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => handleDownload(cert)}
                  title="Download credential"
                >
                  <Download size={13} /> Download
                </button>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => handleRemove(cert.id, cert.title)}
                  title="Remove credential"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </SectionCard>
        ))}

        {certificates.length === 0 && (
          <EmptyPanel
            title="No credentials on record"
            text="Add certificates from training programs or external certifications to verify your skills."
            action={
              <button
                type="button"
                className="small-outline"
                onClick={() => setShowAddModal(true)}
              >
                Add your first certificate
              </button>
            }
          />
        )}
      </div>
    </StudentLayout>
  );
}

export function PortfolioPage() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setCertificates(getStoredCertificates());
    setUserSkills(getDeclaredSkills());
  }, []);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Digital portfolio"
        title="Verified employability evidence"
        description="Show selected skills, certifications, projects, internships, and achievements in a role-appropriate portfolio view."
        action={
          <Link href="/portfolio/settings" className="small-outline">
            Portfolio settings
          </Link>
        }
      />
      <div className="portfolio-hero">
        <div>
          <div className="portfolio-mark">AS</div>
          <h2>Anaya Sharma</h2>
          <p>Evidence-led profile for applied systems and research operations.</p>
          <StatusPill>Recruiter-visible portfolio</StatusPill>
        </div>
        <div className="portfolio-evidence-count">
          <b>{String(userSkills.length + certificates.length).padStart(2, "0")}</b>
          <span>verified evidence items</span>
          <Link href="/documents" className="action-link">
            Manage evidence <ChevronRight size={15} />
          </Link>
        </div>
      </div>
      <div className="portfolio-grid">
        <SectionCard title="Verified skills">
          <div className="portfolio-items">
            {userSkills.map((skill) => (
              <div key={skill}>
                <ShieldCheck size={17} />
                <span>{skill} · Verified</span>
                <StatusPill>Verified</StatusPill>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Credentials & Certificates">
          <div className="portfolio-items">
            {certificates.map((cert) => (
              <div key={cert.id}>
                <Award size={17} />
                <span>
                  {cert.title} ({cert.issuer})
                </span>
                <StatusPill>Verified</StatusPill>
              </div>
            ))}
            <Link href="/certifications" className="action-link" style={{ marginTop: "8px" }}>
              View all credentials <ChevronRight size={15} />
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="Projects & achievements">
          <div className="portfolio-items">
            <div>
              <Trophy size={17} />
              <span>Research documentation project</span>
              <StatusPill>Verified</StatusPill>
            </div>
            <div>
              <Trophy size={17} />
              <span>Data analysis coursework evidence</span>
              <StatusPill tone="muted">Current</StatusPill>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Internship evidence">
          <div className="empty-panel">
            <FileCheck2 size={20} />
            <div>
              <h3>Data Practice & Applied Systems Internship</h3>
              <p>Mentor verified · Report submitted · 42% progress</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

export function PortfolioSettingsPage() {
  return (
    <StudentLayout>
      <Link href="/portfolio" className="back-link">
        ← Portfolio
      </Link>
      <PageHeader
        eyebrow="Portfolio settings"
        title="Evidence visibility and sharing"
        description="Control who may view your verified profile evidence while keeping application-only documents private."
      />
      <div className="portfolio-settings-grid">
        <section className="stack-lg">
          <SectionCard title="Portfolio visibility">
            <div className="visibility-row">
              <div>
                <b>Recruiter-visible portfolio</b>
                <span>Authorised recruiters can view the selected evidence items.</span>
              </div>
              <button
                type="button"
                className="toggle-on"
                onClick={(event) => event.currentTarget.classList.toggle("toggle-off")}
              >
                On
              </button>
            </div>
            <div className="visibility-row">
              <div>
                <b>Institution-visible portfolio</b>
                <span>Authorised institution users can view the selected evidence items.</span>
              </div>
              <button
                type="button"
                className="toggle-on"
                onClick={(event) => event.currentTarget.classList.toggle("toggle-off")}
              >
                On
              </button>
            </div>
            <div className="visibility-row">
              <div>
                <b>Public portfolio link</b>
                <span>A public link is disabled by default and is separate from application documents.</span>
              </div>
              <button
                type="button"
                className="toggle-on toggle-off"
                onClick={(event) => event.currentTarget.classList.toggle("toggle-off")}
              >
                Off
              </button>
            </div>
          </SectionCard>
          <SectionCard title="Evidence selection">
            <div className="evidence-selection">
              <div>
                <CheckCircle2 size={16} />
                <span>Verified skills</span>
                <StatusPill>Included</StatusPill>
              </div>
              <div>
                <CheckCircle2 size={16} />
                <span>Provider certificates</span>
                <StatusPill>Included</StatusPill>
              </div>
              <div>
                <CheckCircle2 size={16} />
                <span>Projects & achievements</span>
                <StatusPill>Included</StatusPill>
              </div>
              <div>
                <FileLock2 size={16} />
                <span>Academic records and application documents</span>
                <StatusPill tone="muted">Private</StatusPill>
              </div>
            </div>
          </SectionCard>
        </section>
        <aside className="stack-lg">
          <SectionCard title="Shareable link">
            <KeyValue label="Portfolio ID" value="sih-connect/anaya-sharma" />
            <button
              type="button"
              className="small-outline full-button"
              onClick={() => {
                navigator.clipboard?.writeText("https://sih-connect.edu/portfolio/anaya-sharma");
                toast.success("Shareable portfolio link copied to clipboard!");
              }}
            >
              Copy link <Link2 size={15} />
            </button>
          </SectionCard>
          <Notice
            title="Privacy boundary"
            text="Portfolio content is separate from private academic records, application documents, and recruitment notes."
          />
        </aside>
      </div>
    </StudentLayout>
  );
}

export function DocumentVaultPage() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);

  useEffect(() => {
    setCertificates(getStoredCertificates());
  }, []);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Secure documents"
        title="Document register"
        description="Manage resumes, certificates, internship reports, academic records, and portfolio evidence with access and verification context."
        action={
          <Link href="/certifications" className="small-outline">
            Upload credential <Upload size={15} />
          </Link>
        }
      />
      <SectionCard title="Current document records">
        <div className="document-vault-list">
          <article>
            <FileLock2 size={18} />
            <div>
              <b>Anaya_Sharma_resume.pdf</b>
              <span>Resume · Application-visible · Updated 18 Aug</span>
            </div>
            <StatusPill>Current</StatusPill>
            <button type="button" className="small-outline">Access log</button>
          </article>
          {certificates.map((cert) => (
            <article key={cert.id}>
              <FileCheck2 size={18} />
              <div>
                <b>{cert.documentName || `${cert.title.replace(/\s+/g, "_")}.pdf`}</b>
                <span>
                  Certificate · {cert.issuer} · Verified Credential ID: {cert.credentialId}
                </span>
              </div>
              <StatusPill>Verified</StatusPill>
              <Link href="/certifications" className="small-outline">View</Link>
            </article>
          ))}
          <article>
            <FolderKey size={18} />
            <div>
              <b>Semester_4_academic_record.pdf</b>
              <span>Academic record · Restricted · Upload required</span>
            </div>
            <StatusPill tone="ochre">Action required</StatusPill>
            <Link href="/profile/documents" className="small-outline">Attach</Link>
          </article>
          <article>
            <FileCheck2 size={18} />
            <div>
              <b>Internship_completion_report.pdf</b>
              <span>Internship report · Data Practice & Applied Systems</span>
            </div>
            <StatusPill tone="ochre">In progress</StatusPill>
            <Link href="/internships/data-practice/completion" className="small-outline">Details</Link>
          </article>
        </div>
      </SectionCard>
      <Notice
        title="Security context"
        text="The document register records type, visibility, verification, document version, retention, and access context."
      />
    </StudentLayout>
  );
}
