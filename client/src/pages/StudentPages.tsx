// Field Notes Institutional Workspace: student screens use a calm top-nav workspace and explicit placement flows.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Filter,
  MapPin,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserRound,
  X,
  XCircle,
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
  ScheduleLine,
  SectionCard,
  StatCard,
  StatusPill,
  Timeline,
} from "@/components/Ui";
import {
  applicationStages,
  events,
  opportunities,
  scheduleItems,
  studentSkillMaps,
} from "@/data/portalData";
import { api } from "@/lib/api";
import { loadLatestAssessmentResult } from "./AssessmentPages";
import studentSkillMap from "@/assets/student-skill-map.svg";
import {
  calculateJobSkillFit,
  getJobDeadlineInfo,
  JobOpportunity,
  jobOpportunities,
} from "@/data/jobData";
import {
  AttachedFile,
  createStudentApplication,
  downloadAttachedFile,
  getStudentApplication,
  getStudentApplications,
  StudentApplication,
  withdrawStudentApplication,
} from "@/data/applicationData";
import { getDeclaredSkills, isSkillMatched } from "@/data/assessmentData";
import "./EventCompanyMessages.css";
import "./ProfileSkills.css";
import "./ScheduleAdd.css";
import "./SkillMapComparison.css";
import "./JobsAndApplications.css";

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="student">{children}</AppShell>;
}

export function StudentHome() {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const applications = getStudentApplications();
  const activeAppsCount = applications.filter((a) => !a.isWithdrawn).length;

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const topJobs = useMemo(() => {
    return jobOpportunities.slice(0, 2).map((job) => {
      const fit = calculateJobSkillFit(job, userSkills);
      return { ...job, fit };
    });
  }, [userSkills]);

  return <StudentLayout><PageHeader eyebrow="Student workspace" title="Placement readiness: Open" description="Two actions require attention · Batch 2028" meta={<span className="date-meta">MON, 26 AUG · IST</span>} />
    <div className="stat-grid">
      <StatCard label="Applications" value={String(activeAppsCount).padStart(2, "0")} note={`${activeAppsCount} in active review`} />
      <StatCard label="Upcoming evaluations" value="01" note="This week" />
      <StatCard label="Offers pending" value="00" tone="ochre" note="No response due" />
      <StatCard label="Profile complete" value="78%" tone="olive" note="Academic records verified" />
    </div>
    <div className="dashboard-grid">
      <div className="stack-lg">
        <SectionCard title="Needs attention" aside={<StatusPill tone="ochre">2 items</StatusPill>}><div className="attention-list"><div><span className="attention-dot" /><p><b>Upload your semester 4 transcript.</b><small>Required before the Applied AI Capability Studio review.</small></p><Link href="/profile/documents">Review documents <ChevronRight size={15} /></Link></div><div><span className="attention-dot muted-dot" /><p><b>Confirm your evaluation attendance.</b><small>Candidate evaluation briefing · Thursday, 14:30.</small></p><Link href="/schedule">View schedule <ChevronRight size={15} /></Link></div></div></SectionCard>
        <SectionCard title="Eligible for you" aside={<ActionLink href="/jobs">View all</ActionLink>}>
          <div className="eligible-list">
            {topJobs.map((item) => (
              <Link href={`/jobs/${item.id}`} key={item.id} className="eligible-row">
                <div>
                  <StatusPill tone={item.fit.matchPercent >= 70 ? "olive" : "ochre"}>{item.status}</StatusPill>
                  <h3>{item.title}</h3>
                  <p>{item.organization} · {item.location}</p>
                </div>
                <div className="fit-score">
                  <b>{item.fit.matchPercent}%</b>
                  <span>skill fit</span>
                </div>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </SectionCard>
        <section className="skill-callout"><div><span className="eyebrow">Skill map</span><h2>Keep your evidence aligned to the next requirement.</h2><p>Your current profile maps most strongly to applied systems and research operations.</p><ActionLink href="/skill-map/industries">Open skill map</ActionLink></div><img src={studentSkillMap} alt="Abstract student skill mapping illustration" /></section>
      </div>
      <aside className="stack-lg">
        <SectionCard title="Your season" aside={<ActionLink href="/season">Full journey</ActionLink>}><ol className="season-list">{applicationStages.map((stage, index) => <li key={stage} className={index === 0 ? "season-current" : ""}><span /><div><b>{stage}</b><small>{index === 0 ? `${activeAppsCount} application${activeAppsCount === 1 ? "" : "s"}` : "No activity"}</small></div></li>)}</ol></SectionCard>
        <SectionCard title="Today"><EmptyPanel title="One scheduled item" text="Skill evidence clinic at 10:00 · Online." action={<Link href="/schedule" className="small-outline">Open schedule</Link>} /></SectionCard>
      </aside>
    </div>
  </StudentLayout>;
}

export function JobsPage() {
  const [query, setQuery] = useState("");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minFit, setMinFit] = useState<number>(0);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  // Compute all available unique skills across job opportunities
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    jobOpportunities.forEach((j) => {
      j.required.forEach((s) => skillSet.add(s));
      j.preferred.forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).sort();
  }, []);

  const jobsWithMeta = useMemo(() => {
    return jobOpportunities
      .map((item) => {
        const skillFit = calculateJobSkillFit(item, userSkills);
        const deadline = getJobDeadlineInfo(item.closeDate);
        const isRecommended = skillFit.matchPercent >= 70;
        const isTopMatch = skillFit.matchPercent >= 90;
        return {
          ...item,
          skillFit,
          deadline,
          isRecommended,
          isTopMatch,
        };
      })
      .sort((a, b) => b.skillFit.matchPercent - a.skillFit.matchPercent);
  }, [userSkills]);

  const recommendedCount = jobsWithMeta.filter((j) => j.isRecommended).length;
  const closingSoonCount = jobsWithMeta.filter((j) => j.deadline.isUrgent).length;
  const eligibleCount = jobsWithMeta.filter((j) => j.status === "Eligible").length;
  const topMatchCount = jobsWithMeta.filter((j) => j.isTopMatch).length;

  const toggleQuickFilter = (key: string) => {
    setSelectedQuickFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const toggleDeliveryMode = (mode: string) => {
    setSelectedDeliveryModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const resetAllFilters = () => {
    setQuery("");
    setSelectedQuickFilters([]);
    setSelectedDeliveryModes([]);
    setSelectedSkills([]);
    setMinFit(0);
  };

  // Simultaneous multi-filter application
  const filtered = useMemo(() => {
    return jobsWithMeta.filter((item) => {
      // 1. Keyword search
      if (query.trim()) {
        const searchable = `${item.title} ${item.organization} ${item.location} ${item.status} ${item.type} ${item.required.join(" ")} ${item.preferred.join(" ")} ${item.summary}`.toLowerCase();
        if (!searchable.includes(query.trim().toLowerCase())) return false;
      }

      // 2. Multi-selected quick filters (AND condition: must satisfy all active quick filters)
      if (selectedQuickFilters.includes("recommended") && !item.isRecommended) return false;
      if (selectedQuickFilters.includes("closingSoon") && !item.deadline.isUrgent) return false;
      if (selectedQuickFilters.includes("eligible") && item.status !== "Eligible") return false;
      if (selectedQuickFilters.includes("topMatch") && !item.isTopMatch) return false;

      // 3. Multi-selected delivery modes (OR condition within delivery mode: matches any selected delivery mode)
      if (selectedDeliveryModes.length > 0 && !selectedDeliveryModes.includes(item.deliveryMode)) {
        return false;
      }

      // 4. Multi-selected skills (AND condition: opportunity must cover all selected skills)
      if (selectedSkills.length > 0) {
        const hasAllSelectedSkills = selectedSkills.every(
          (s) => item.required.includes(s) || item.preferred.includes(s)
        );
        if (!hasAllSelectedSkills) return false;
      }

      // 5. Minimum skill fit threshold
      if (minFit > 0 && item.skillFit.matchPercent < minFit) {
        return false;
      }

      return true;
    });
  }, [jobsWithMeta, query, selectedQuickFilters, selectedDeliveryModes, selectedSkills, minFit]);

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedQuickFilters.length +
    selectedDeliveryModes.length +
    selectedSkills.length +
    (minFit > 0 ? 1 : 0);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Opportunities"
        title="Browse placement opportunities"
        description="Review industry jobs and placement opportunities dynamically matched to your profile skills and closing deadlines."
        meta={
          <span className="date-meta">
            {filtered.length} MATCHING RECORD{filtered.length === 1 ? "" : "S"} · {closingSoonCount} CLOSING SOON
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

      {/* Multi-Select Quick Filter Tabs */}
      <div className="catalogue-filters" style={{ flexWrap: "wrap", gap: "8px" }}>
        <button
          type="button"
          className={`catalogue-filter-btn ${selectedQuickFilters.length === 0 ? "active" : ""}`}
          onClick={() => setSelectedQuickFilters([])}
        >
          All Opportunities ({jobsWithMeta.length})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("recommended") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("recommended")}
          title="Toggle Recommended filter (can combine with others)"
        >
          <Sparkles size={13} /> Recommended (≥70% Fit) ({recommendedCount})
          {selectedQuickFilters.includes("recommended") && " ✓"}
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("closingSoon") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("closingSoon")}
          title="Toggle Closing Soon filter (can combine with others)"
        >
          <span
            style={{
              color: selectedQuickFilters.includes("closingSoon") ? "white" : "#dc2626",
              fontWeight: 800,
            }}
          >
            🔥
          </span>{" "}
          Closing Soon (≤7 Days) ({closingSoonCount})
          {selectedQuickFilters.includes("closingSoon") && " ✓"}
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("eligible") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("eligible")}
          title="Toggle Eligible filter (can combine with others)"
        >
          <CheckCircle2 size={13} /> Eligible ({eligibleCount})
          {selectedQuickFilters.includes("eligible") && " ✓"}
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("topMatch") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("topMatch")}
          title="Toggle Top Match (≥90%) filter (can combine with others)"
        >
          ★ Top Match (≥90%) ({topMatchCount})
          {selectedQuickFilters.includes("topMatch") && " ✓"}
        </button>
      </div>

      {/* Active Multi-Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="active-filters-bar">
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--slate)" }}>
            Active filters ({activeFilterCount}):
          </span>

          {query && (
            <span className="active-filter-chip">
              Search: "{query}"
              <button type="button" onClick={() => setQuery("")} aria-label="Clear query filter">
                <X size={12} />
              </button>
            </span>
          )}

          {selectedQuickFilters.map((qf) => (
            <span key={qf} className="active-filter-chip">
              {qf === "recommended" && "Recommended (≥70%)"}
              {qf === "closingSoon" && "🔥 Closing Soon (≤7 Days)"}
              {qf === "eligible" && "Eligible Only"}
              {qf === "topMatch" && "★ Top Match (≥90%)"}
              <button
                type="button"
                onClick={() => toggleQuickFilter(qf)}
                aria-label={`Remove ${qf} filter`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {selectedDeliveryModes.map((dm) => (
            <span key={dm} className="active-filter-chip">
              Mode: {dm === "on-campus" ? "On campus" : dm.charAt(0).toUpperCase() + dm.slice(1)}
              <button
                type="button"
                onClick={() => toggleDeliveryMode(dm)}
                aria-label={`Remove ${dm} filter`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {selectedSkills.map((sk) => (
            <span key={sk} className="active-filter-chip">
              Skill: {sk}
              <button
                type="button"
                onClick={() => toggleSkill(sk)}
                aria-label={`Remove ${sk} skill filter`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {minFit > 0 && (
            <span className="active-filter-chip">
              Min Fit: ≥{minFit}%
              <button
                type="button"
                onClick={() => setMinFit(0)}
                aria-label="Remove min fit filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            className="clear-all-filters-btn"
            onClick={resetAllFilters}
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="jobs-layout">
        <aside className="filter-rail">
          <div className="filter-title">
            <Filter size={16} /> Filter opportunities
          </div>

          {/* Keyword Search */}
          <div className="filter-group">
            <label className="filter-group-title" htmlFor="filter-search-input">
              Keyword search
            </label>
            <input
              id="filter-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Role, skill, organisation"
            />
          </div>

          {/* Quick Filter Multi-Select Checkboxes */}
          <div className="filter-group">
            <span className="filter-group-title">Status & Readiness</span>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedQuickFilters.includes("recommended")}
                onChange={() => toggleQuickFilter("recommended")}
              />
              Recommended (≥70% Fit)
            </label>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedQuickFilters.includes("closingSoon")}
                onChange={() => toggleQuickFilter("closingSoon")}
              />
              Closing Soon (≤7 Days)
            </label>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedQuickFilters.includes("eligible")}
                onChange={() => toggleQuickFilter("eligible")}
              />
              Eligible for application
            </label>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedQuickFilters.includes("topMatch")}
                onChange={() => toggleQuickFilter("topMatch")}
              />
              Top Match (≥90% Fit)
            </label>
          </div>

          {/* Delivery Mode Multi-Select Checkboxes */}
          <div className="filter-group">
            <span className="filter-group-title">Delivery Mode</span>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedDeliveryModes.includes("hybrid")}
                onChange={() => toggleDeliveryMode("hybrid")}
              />
              Hybrid
            </label>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedDeliveryModes.includes("on-campus")}
                onChange={() => toggleDeliveryMode("on-campus")}
              />
              On campus
            </label>
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedDeliveryModes.includes("remote")}
                onChange={() => toggleDeliveryMode("remote")}
              />
              Remote
            </label>
          </div>

          {/* Minimum Skill Fit Filter */}
          <div className="filter-group">
            <label className="filter-group-title" htmlFor="filter-min-fit-select">
              Minimum Skill Fit
            </label>
            <select
              id="filter-min-fit-select"
              value={minFit}
              onChange={(e) => setMinFit(Number(e.target.value))}
            >
              <option value={0}>Any skill fit</option>
              <option value={50}>At least 50% match</option>
              <option value={70}>At least 70% match</option>
              <option value={85}>At least 85% match</option>
            </select>
          </div>

          {/* Required / Preferred Skills Multi-Select Pills */}
          <div className="filter-group">
            <span className="filter-group-title">Filter by Skills</span>
            <div className="filter-skills-grid">
              {availableSkills.map((skill) => {
                const isActive = selectedSkills.includes(skill);
                const isProfileSkill = isSkillMatched(skill, userSkills);
                return (
                  <button
                    key={skill}
                    type="button"
                    className={`filter-skill-pill ${isActive ? "active" : ""}`}
                    onClick={() => toggleSkill(skill)}
                    title={
                      isProfileSkill
                        ? `Skill in your profile: ${skill}`
                        : `Filter by ${skill}`
                    }
                  >
                    {isActive && <Check size={10} />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="text-button"
            onClick={resetAllFilters}
            style={{ marginTop: "12px", width: "100%", textAlign: "center" }}
          >
            Reset all filters
          </button>
        </aside>

        <div className="job-results">
          <div className="search-strip" aria-live="polite">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search opportunities"
              placeholder="Search roles, skills, organisations, or locations"
            />
            {query ? (
              <button
                type="button"
                className="search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="search-summary">
                {filtered.length} result{filtered.length === 1 ? "" : "s"} available
              </span>
            )}
            <SlidersHorizontal size={17} />
          </div>

          {filtered.map((item) => (
            <article key={item.id} className="job-card">
              <div className="job-card-main">
                <div className="job-meta">
                  <StatusPill tone={item.skillFit.matchPercent >= 70 ? "olive" : "ochre"}>
                    {item.isRecommended ? "Recommended" : item.status}
                  </StatusPill>
                  <span>{item.type}</span>
                  {item.deadline.isUrgent && (
                    <span className="deadline-urgent-chip">
                      🔥 {item.deadline.badgeText}
                    </span>
                  )}
                </div>
                <h2>{item.title}</h2>
                <p>
                  {item.organization} · {item.location}
                  {item.salary && <span> · {item.salary}</span>}
                </p>
                <div className="tag-row">
                  {item.required.map((skill) => {
                    const matches = isSkillMatched(skill, userSkills);
                    const isFilterSelected = selectedSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}
                        style={{
                          outline: isFilterSelected ? "2px solid var(--olive-deep)" : undefined,
                        }}
                        title={
                          matches
                            ? `Matches your profile skill "${skill}"`
                            : `Required skill: ${skill}`
                        }
                      >
                        {matches && <Check size={11} className="skill-tag-matched-icon" />}
                        {skill}
                      </span>
                    );
                  })}
                  {item.preferred.map((skill) => {
                    const matches = isSkillMatched(skill, userSkills);
                    const isFilterSelected = selectedSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`skill-tag ${matches ? "skill-tag-matched" : ""}`}
                        style={{
                          opacity: matches ? 1 : 0.85,
                          outline: isFilterSelected ? "2px solid var(--olive-deep)" : undefined,
                        }}
                        title={
                          matches
                            ? `Matches your profile skill "${skill}"`
                            : `Preferred skill: ${skill}`
                        }
                      >
                        {matches && <Check size={11} className="skill-tag-matched-icon" />}
                        {skill} (pref)
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="job-card-side">
                <b>{item.skillFit.matchPercent}%</b>
                <span>skill fit</span>
                <small className={item.deadline.isUrgent ? "deadline-urgent-text" : ""}>
                  {item.deadline.isUrgent ? `🔥 ${item.deadline.badgeText}` : item.date}
                </small>
                <Link href={`/jobs/${item.id}`} className="small-outline">
                  Review
                </Link>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <EmptyPanel
              title="No opportunities match all selected filters"
              text="You have combined multiple specific filters. Try adjusting or clearing some filters to expand your results."
              action={
                <button
                  type="button"
                  className="small-outline"
                  onClick={resetAllFilters}
                >
                  Reset all filters
                </button>
              }
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

function useOpportunity(id: string) {
  return jobOpportunities.find((item) => item.id === id) ?? jobOpportunities[0];
}

export function JobDetailPage({ id = "ai-studio" }: { id?: string }) {
  const item = useOpportunity(id);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const fit = useMemo(() => calculateJobSkillFit(item, userSkills), [item, userSkills]);
  const deadline = useMemo(() => getJobDeadlineInfo(item.closeDate), [item.closeDate]);

  return (
    <StudentLayout>
      <Link href="/jobs" className="back-link">
        <ArrowLeft size={16} /> All opportunities
      </Link>
      <div className="detail-layout">
        <article className="detail-main">
          <div className="job-meta">
            <StatusPill tone={fit.matchPercent >= 70 ? "olive" : "ochre"}>{item.status}</StatusPill>
            <span>{item.type}</span>
            {deadline.isUrgent && (
              <span className="deadline-urgent-chip">🔥 {deadline.badgeText}</span>
            )}
          </div>
          <h1>{item.title}</h1>
          <p className="detail-org">
            {item.organization} <span>·</span> {item.location}
            {item.salary && <span>· {item.salary}</span>}
          </p>
          <p className="lead-copy">{item.summary}</p>

          <SectionCard title="What you will contribute">
            <p className="body-copy">
              Work from structured briefs, prepare concise evidence notes, and participate in a transparent review process. The opportunity is visible because your current academic and skill records meet the published baseline.
            </p>
          </SectionCard>

          <SectionCard
            title="Skill requirements & learning alignment"
            aside={<span className="date-meta">CLICK ANY SKILL FOR COURSES & ASSESSMENTS</span>}
          >
            <div className="requirement-table">
              <div className="table-head">
                <span>Skill</span>
                <span>Requirement</span>
                <span>Your evidence</span>
              </div>
              {item.required.map((skill) => {
                const isVerified = isSkillMatched(skill, userSkills);
                return (
                  <div className="table-row" key={skill}>
                    <span>
                      <Link
                        href={`/skills/${encodeURIComponent(skill)}`}
                        className="skill-requirement-link"
                        title={`Click to view learning courses and assessments for ${skill}`}
                      >
                        <b>{skill}</b> <ExternalLink size={11} />
                      </Link>
                    </span>
                    <span>
                      <StatusPill tone="ink">Required</StatusPill>
                    </span>
                    <span className={isVerified ? "verified" : "pending"}>
                      {isVerified ? (
                        <>
                          <Check size={15} /> Verified in profile
                        </>
                      ) : (
                        <Link
                          href={`/skills/${encodeURIComponent(skill)}`}
                          className="action-link"
                          style={{ fontSize: "11px" }}
                        >
                          Developing · View courses & quizzes <ArrowRight size={11} />
                        </Link>
                      )}
                    </span>
                  </div>
                );
              })}

              {item.preferred.map((skill) => {
                const isVerified = isSkillMatched(skill, userSkills);
                return (
                  <div className="table-row" key={skill}>
                    <span>
                      <Link
                        href={`/skills/${encodeURIComponent(skill)}`}
                        className="skill-requirement-link"
                        title={`Click to view learning courses and assessments for ${skill}`}
                      >
                        <b>{skill}</b> <ExternalLink size={11} />
                      </Link>
                    </span>
                    <span>
                      <StatusPill tone="muted">Preferred</StatusPill>
                    </span>
                    <span className={isVerified ? "verified" : "pending"}>
                      {isVerified ? (
                        <>
                          <Check size={15} /> Verified in profile
                        </>
                      ) : (
                        <Link
                          href={`/skills/${encodeURIComponent(skill)}`}
                          className="action-link"
                          style={{ fontSize: "11px" }}
                        >
                          Developing · View courses & quizzes <ArrowRight size={11} />
                        </Link>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </article>

        <aside className="detail-side session-sticky-aside">
          <SectionCard title="Application window">
            <KeyValue
              label="Deadline"
              value={
                <span className={deadline.isUrgent ? "deadline-urgent-text" : ""}>
                  {item.date.replace("Closes ", "")} {deadline.isUrgent && `(${deadline.badgeText})`}
                </span>
              }
            />
            <KeyValue label="Profile fit" value={`${fit.matchPercent}%`} />
            <KeyValue label="Documents" value="Resume + profile + attachments" />
            <div className="card-actions-stack">
              <Link href={`/jobs/${item.id}/apply`} className="primary-button full-button">
                Apply directly <ArrowRight size={16} />
              </Link>
            </div>
            <p className="fine-print">Application eligibility is checked and recorded when you submit.</p>
          </SectionCard>

          <SectionCard title="Your profile signal">
            <ProgressBar value={fit.matchPercent} label="Skill fit" />
            <p className="body-copy small-copy" style={{ marginTop: "10px" }}>
              {fit.matchedRequired.length} of {item.required.length} required skills verified in your profile.
            </p>
            <Link href="/profile" className="action-link">
              Review & edit profile skills <ArrowRight size={15} />
            </Link>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function ApplyPage({ id = "ai-studio" }: { id?: string }) {
  const item = useOpportunity(id);
  const [, setLocation] = useLocation();
  const [statement, setStatement] = useState("");
  const [userSkills] = useState<string[]>(() => getDeclaredSkills());
  const fit = useMemo(() => calculateJobSkillFit(item, userSkills), [item, userSkills]);

  // Real device Resume attachment state
  const [resume, setResume] = useState<AttachedFile>({
    id: "res-primary",
    name: "Anaya_Sharma_resume.pdf",
    size: "248 KB",
    type: "application/pdf",
    uploadedAt: "18 Aug 2026",
  });
  const [isCustomResume, setIsCustomResume] = useState(false);

  // Real device Supporting Documents attachments state
  const [supportingDocs, setSupportingDocs] = useState<AttachedFile[]>([
    {
      id: "doc-sem3",
      name: "Semester_3_academic_record.pdf",
      size: "512 KB",
      type: "application/pdf",
      uploadedAt: "18 Aug 2026",
    },
  ]);

  // Handle resume file upload from device
  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      setResume({
        id: `res-${Date.now()}`,
        name: file.name,
        size: sizeFormatted,
        type: file.type || "application/pdf",
        dataUrl,
        uploadedAt: "Just now",
      });
      setIsCustomResume(true);
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  // Handle supporting documents upload from device
  const handleSupportingDocsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newDocs: AttachedFile[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const sizeFormatted =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const newDoc: AttachedFile = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: sizeFormatted,
          type: file.type || "application/pdf",
          dataUrl,
          uploadedAt: "Just now",
        };
        setSupportingDocs((current) => [...current, newDoc]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} supporting document(s) attached from device.`);
  };

  const removeSupportingDoc = (docId: string) => {
    setSupportingDocs((current) => current.filter((d) => d.id !== docId));
    toast("Attachment removed.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Persist full application snapshot into application repository
    createStudentApplication({
      jobId: item.id,
      jobTitle: item.title,
      organization: item.organization,
      location: item.location,
      statement: statement.trim(),
      resume,
      supportingDocs,
      match: fit.matchPercent,
    });

    try {
      await api.applications.submit({
        jobId: item.id,
        jobTitle: item.title,
        organization: item.organization,
        statement,
      });
    } catch {}

    toast.success(`Application for ${item.title} submitted and saved to your placement season!`);
    setLocation(`/jobs/${item.id}/submitted`);
  };

  return (
    <StudentLayout>
      <Link href={`/jobs/${item.id}`} className="back-link">
        <ArrowLeft size={16} /> Opportunity details
      </Link>
      <div className="application-layout">
        <div>
          <PageHeader
            eyebrow="Direct application"
            title={`Apply to ${item.title}`}
            description="Submit the required resume, supporting files, and evidence statement for this opportunity."
          />
          <form className="application-form" onSubmit={handleSubmit}>
            {/* Profile context */}
            <section>
              <h2>Application profile</h2>
              <div className="readonly-profile">
                <UserRound size={18} />
                <div>
                  <b>Anaya Sharma</b>
                  <span>Computer Science · Batch 2028 · 78% profile complete</span>
                </div>
                <StatusPill tone="olive">Eligible ({fit.matchPercent}% fit)</StatusPill>
              </div>
            </section>

            {/* Resume Upload & Selection */}
            <section>
              <h2>Resume selection</h2>
              <div className="document-choice" style={{ marginBottom: "10px" }}>
                <FileText size={20} />
                <div style={{ flex: 1 }}>
                  <b>{resume.name}</b>
                  <span>
                    {resume.size} · Uploaded {resume.uploadedAt} {isCustomResume && "· Custom device upload"}
                  </span>
                </div>
                <label className="small-outline" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Upload size={13} /> {isCustomResume ? "Replace file" : "Upload other resume"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </section>

            {/* Additional Supporting Documents Upload */}
            <section>
              <h2>Supporting documents & certificates</h2>
              <div className="upload-zone" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Upload size={18} />
                  <div>
                    <b>Attach supporting files from device</b>
                    <span>Transcripts, certificates, project PDFs, or research samples.</span>
                  </div>
                </div>
                <label className="primary-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Plus size={14} /> Browse device files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={handleSupportingDocsUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* List of attached files */}
              {supportingDocs.length > 0 && (
                <div className="attached-files-list">
                  {supportingDocs.map((doc) => (
                    <div key={doc.id} className="attached-file-row">
                      <div className="attached-file-info">
                        <Paperclip size={16} style={{ color: "var(--olive)" }} />
                        <div>
                          <b>{doc.name}</b>
                          <span>{doc.size} · {doc.uploadedAt}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={() => removeSupportingDoc(doc.id)}
                        title="Remove file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Candidate Statement Note */}
            <section>
              <h2>Application note</h2>
              <label className="full-label">
                Explain, briefly, how your current skill evidence supports this opportunity.
                <textarea
                  value={statement}
                  onChange={(event) => setStatement(event.target.value)}
                  placeholder="Write a concise evidence-led note describing your relevant project work, coursework, or verified skills."
                  rows={5}
                />
              </label>
            </section>

            <div className="form-footer">
              <span>
                <CheckCircle2 size={16} /> Eligibility snapshot and uploaded documents will be recorded upon submission.
              </span>
              <button className="primary-button" type="submit">
                Submit application <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>

        <aside className="application-summary session-sticky-aside">
          <SectionCard title="Before you submit">
            <KeyValue label="Opportunity" value={item.title.split(" ")[0]} />
            <KeyValue label="Organisation" value={item.organization} />
            <KeyValue label="Window" value={item.date.replace("Closes ", "")} />
            <KeyValue label="Calculated fit" value={`${fit.matchPercent}%`} />
            <KeyValue label="Resume" value={resume.name} />
            <KeyValue label="Supporting files" value={`${supportingDocs.length} attached`} />
            <Notice
              title="Profile & document snapshot"
              text="Your resume, attached supporting documents, profile evidence, and application note are retained permanently with this application."
            />
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function ApplicationSubmittedPage({ id = "ai-studio" }: { id?: string }) {
  const item = useOpportunity(id);
  return (
    <StudentLayout>
      <div className="confirmation-screen">
        <div className="confirmation-mark">
          <CheckCircle2 size={34} />
        </div>
        <span className="eyebrow">Application submitted</span>
        <h1>Your application is now recorded in your placement journey.</h1>
        <p>
          Your current profile, attached device documents, eligibility snapshot, and evidence note have been recorded for <b>{item.title}</b>.
        </p>
        <div className="confirmation-actions">
          <Link href="/season" className="primary-button">
            Track in placement season <ArrowRight size={16} />
          </Link>
          <Link href="/jobs" className="small-outline">
            Browse other opportunities
          </Link>
        </div>
        <div className="confirmation-note">
          <span>Next stage</span>
          <b>Recruiter screening</b>
          <p>You can track stages, review submitted documents, or manage your application in the placement season.</p>
        </div>
      </div>
    </StudentLayout>
  );
}

export function EventsPage() {
  const [selectedCompany, setSelectedCompany] = useState(events[0]);
  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Events"
        title="Relevant events"
        description="Evaluation, recruitment, and profile-support events you are permitted to view."
      />
      <div className="event-layout">
        <div className="event-list">
          {events.map((event) => (
            <article className="event-row" key={event.title}>
              <div className="event-date">
                <b>{event.day}</b>
                <span>{event.month}</span>
              </div>
              <div className="event-info">
                <StatusPill tone="muted">{event.type}</StatusPill>
                <h2>{event.title}</h2>
                <p>
                  {event.time} · {event.place}
                </p>
                <button
                  type="button"
                  className={
                    selectedCompany.company === event.company
                      ? "event-company-link event-company-active"
                      : "event-company-link"
                  }
                  onClick={() => setSelectedCompany(event)}
                >
                  {event.company}
                  <MessageSquareText size={14} />
                </button>
              </div>
              <button
                className="small-outline"
                onClick={() => toast("Event is added to your schedule.")}
              >
                Add to schedule
              </button>
            </article>
          ))}
        </div>
        <aside className="event-message-panel">
          <div className="event-message-mark">
            <MessageSquareText size={18} />
          </div>
          <span className="event-message-label">Company message</span>
          <button
            type="button"
            className="event-message-company"
            onClick={() => setSelectedCompany(selectedCompany)}
          >
            {selectedCompany.company}
          </button>
          <h3>{selectedCompany.messageSubject}</h3>
          <p className="event-message-date">{selectedCompany.messageDate}</p>
          <p>{selectedCompany.message}</p>
          <Link href="/calendar" className="action-link">
            Open calendar <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Calendar"
        title="August 2026"
        description="A time-based view of your permitted events, evaluations, and application deadlines."
        action={
          <button
            className="small-outline"
            onClick={() => toast("Month control is ready for the connected calendar source.")}
          >
            Today
          </button>
        }
      />
      <SectionCard className="calendar-card">
        <div className="calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((day) => (
            <div className={`calendar-cell ${day === 26 ? "calendar-today" : ""}`} key={day}>
              <b>{day <= 31 ? day : day - 31}</b>
              {day === 26 && <span className="calendar-chip olive-chip">Skill clinic · 10:00</span>}
              {day === 28 && <span className="calendar-chip ochre-chip">Evaluation · 14:30</span>}
              {day === 30 && <span className="calendar-chip gray-chip">Application close</span>}
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="legend-row">
        <span>
          <i className="legend-dot olive-dot" /> Event
        </span>
        <span>
          <i className="legend-dot ochre-dot" /> Evaluation
        </span>
        <span>
          <i className="legend-dot gray-dot" /> Deadline
        </span>
      </div>
    </StudentLayout>
  );
}

export function SeasonPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);

  useEffect(() => {
    setApplications(getStudentApplications());
  }, []);

  const activeApps = applications.filter((app) => !app.isWithdrawn);
  const withdrawnApps = applications.filter((app) => app.isWithdrawn);

  const screeningCount = activeApps.filter((a) => a.status === "Screening" || a.status === "Application received").length;
  const shortlistedCount = activeApps.filter((a) => a.status === "Shortlisted").length;
  const interviewCount = activeApps.filter((a) => a.status === "Interview").length;
  const offersCount = activeApps.filter((a) => a.status === "Offer").length;

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="My season"
        title="Placement journey"
        description="Follow application movement from submission to offer without losing the supporting record."
        meta={<StatusPill tone={activeApps.length > 0 ? "olive" : "muted"}>{activeApps.length} active application{activeApps.length === 1 ? "" : "s"}</StatusPill>}
      />
      <div className="season-layout">
        <SectionCard title="Journey summary">
          <div className="journey-steps">
            <div className={`journey-step ${activeApps.length > 0 ? "journey-active" : ""}`}>
              <span>01</span>
              <b>Applied</b>
              <small>{applications.length} record{applications.length === 1 ? "" : "s"}</small>
            </div>
            <div className={`journey-step ${screeningCount > 0 ? "journey-active" : ""}`}>
              <span>02</span>
              <b>Screening</b>
              <small>{screeningCount} record{screeningCount === 1 ? "" : "s"}</small>
            </div>
            <div className={`journey-step ${shortlistedCount > 0 ? "journey-active" : ""}`}>
              <span>03</span>
              <b>Shortlisted</b>
              <small>{shortlistedCount > 0 ? `${shortlistedCount} record(s)` : "No records"}</small>
            </div>
            <div className={`journey-step ${interviewCount > 0 ? "journey-active" : ""}`}>
              <span>04</span>
              <b>Interview</b>
              <small>{interviewCount > 0 ? `${interviewCount} record(s)` : "No records"}</small>
            </div>
            <div className={`journey-step ${offersCount > 0 ? "journey-active" : ""}`}>
              <span>05</span>
              <b>Offers</b>
              <small>{offersCount > 0 ? `${offersCount} offer(s)` : "No records"}</small>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Application activity"
          aside={
            <span className="date-meta">
              {activeApps.length} ACTIVE · {withdrawnApps.length} WITHDRAWN
            </span>
          }
        >
          <div className="activity-list">
            {applications.map((app) => (
              <article key={app.id}>
                <div>
                  <b>{app.jobTitle}</b>
                  <span>
                    {app.organization} · {app.location} · Submitted {app.appliedAt}
                  </span>
                </div>
                {app.isWithdrawn ? (
                  <StatusPill tone="muted">Withdrawn</StatusPill>
                ) : app.status === "Screening" ? (
                  <StatusPill tone="ochre">Screening</StatusPill>
                ) : app.status === "Offer" ? (
                  <StatusPill tone="olive">Offer extended</StatusPill>
                ) : (
                  <StatusPill>{app.status}</StatusPill>
                )}
                <Link href={`/applications/${app.id}`} className="action-link">
                  Track <ArrowRight size={15} />
                </Link>
              </article>
            ))}

            {applications.length === 0 && (
              <EmptyPanel
                title="No applications in placement season"
                text="Explore approved job and internship opportunities to start your placement journey."
                action={
                  <Link href="/jobs" className="small-outline">
                    Browse opportunities
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

export function ApplicationTrackerPage({ id = "ai-studio" }: { id?: string }) {
  const [app, setApp] = useState<StudentApplication | null>(() => getStudentApplication(id));
  const [withdrawArmed, setWithdrawArmed] = useState(false);

  useEffect(() => {
    const loaded = getStudentApplication(id);
    if (loaded) setApp(loaded);
  }, [id]);

  const handleWithdraw = () => {
    if (!app) return;
    if (withdrawArmed) {
      withdrawStudentApplication(app.id);
      const updated = getStudentApplication(app.id);
      setApp(updated);
      setWithdrawArmed(false);
      toast.success(`Application for "${app.jobTitle}" has been withdrawn successfully.`);
    } else {
      setWithdrawArmed(true);
    }
  };

  if (!app) {
    return (
      <StudentLayout>
        <Link href="/season" className="back-link">
          <ArrowLeft size={16} /> My season
        </Link>
        <Notice title="Application not found" text="The requested application record could not be found in your season." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Link href="/season" className="back-link">
        <ArrowLeft size={16} /> My season
      </Link>
      <PageHeader
        eyebrow="Application tracker"
        title={app.jobTitle}
        description={`${app.organization} · ${app.location} · Submitted ${app.appliedAt}`}
        meta={
          <StatusPill tone={app.isWithdrawn ? "muted" : app.status === "Screening" ? "ochre" : "olive"}>
            {app.isWithdrawn ? "Withdrawn by candidate" : `Recruiter ${app.status.toLowerCase()}`}
          </StatusPill>
        }
      />

      {app.isWithdrawn && (
        <div className="withdrawn-banner">
          <XCircle size={17} />
          <div>
            <b>This application was withdrawn on {app.withdrawnAt || app.appliedAt}.</b> No further screening or recruitment actions will take place for this submission.
          </div>
        </div>
      )}

      <div className="tracker-layout">
        <section className="stack-lg">
          {/* Timeline */}
          <SectionCard title="Application lifecycle history">
            <Timeline items={app.timeline} />
            <div className="tracker-status-note" style={{ marginTop: "14px" }}>
              <b>Status checkpoint</b>
              <span>
                {app.isWithdrawn
                  ? "Application was withdrawn by you. Your submission snapshot and documents remain archived for auditability."
                  : "Recruiter screening is actively underway. Your application record and attached documents remain accessible."}
              </span>
            </div>
          </SectionCard>

          {/* Candidate statement */}
          <SectionCard title="Submitted candidate note">
            <p className="body-copy" style={{ fontStyle: "italic", whiteSpace: "pre-wrap" }}>
              "{app.statement}"
            </p>
          </SectionCard>

          {/* Uploaded documents and resume with working downloads */}
          <SectionCard
            title="Attached documents & verified evidence"
            aside={<span className="date-meta">{app.supportingDocs.length + 1} ATTACHED FILE(S)</span>}
          >
            <p className="body-copy" style={{ marginBottom: "14px" }}>
              Download the exact resume and supporting documents that were attached during submission:
            </p>

            {/* Resume download card */}
            <div className="document-download-card">
              <div className="document-download-info">
                <FileText size={22} style={{ color: "var(--olive)" }} />
                <div>
                  <b>{app.resume.name}</b>
                  <span>Primary candidate resume · {app.resume.size} · Uploaded {app.resume.uploadedAt}</span>
                </div>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => downloadAttachedFile(app.resume)}
                style={{ fontSize: "11px", padding: "7px 12px" }}
              >
                <Download size={13} /> Download Resume
              </button>
            </div>

            {/* Supporting documents download cards */}
            {app.supportingDocs.map((doc) => (
              <div key={doc.id} className="document-download-card">
                <div className="document-download-info">
                  <Paperclip size={20} style={{ color: "var(--slate)" }} />
                  <div>
                    <b>{doc.name}</b>
                    <span>Supporting document · {doc.size} · Uploaded {doc.uploadedAt}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => downloadAttachedFile(doc)}
                  style={{ fontSize: "11px", padding: "7px 12px" }}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            ))}
          </SectionCard>
        </section>

        {/* Aside */}
        <aside className="stack-lg session-sticky-aside">
          <SectionCard title="Application record">
            <KeyValue label="Eligibility" value="Eligible" />
            <KeyValue label="Skill compatibility" value={`${app.match}%`} />
            <KeyValue label="Resume" value="Attached & verified" />
            <KeyValue label="Supporting files" value={`${app.supportingDocs.length} file(s)`} />
            <KeyValue label="Current stage" value={app.status} />

            {!app.isWithdrawn ? (
              <div className="card-actions-stack">
                <button
                  className={withdrawArmed ? "withdraw-button withdraw-confirm full-button" : "withdraw-button full-button"}
                  onClick={handleWithdraw}
                >
                  {withdrawArmed ? "Confirm withdrawal" : "Withdraw application"}
                </button>
                <p className="withdraw-help" style={{ textAlign: "center", margin: "4px 0 0" }}>
                  {withdrawArmed ? "Click again to confirm immediate withdrawal." : "Withdrawing will notify the recruitment team."}
                </p>
              </div>
            ) : (
              <div style={{ marginTop: "14px" }}>
                <StatusPill tone="muted">Application Withdrawn</StatusPill>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Need help or corrections?">
            <p className="body-copy">
              Contact your institution placement cell if any academic verification detail requires an update.
            </p>
            <div className="card-actions-stack">
              <Link href="/profile/documents" className="action-link">
                Review institution documents <ArrowRight size={15} />
              </Link>
            </div>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function SchedulePage() {
 const [scheduleAdded, setScheduleAdded] = useState(false); return <StudentLayout><PageHeader eyebrow="Schedule" title="Upcoming schedule" description="Evaluations, events, and time-bound application activities in one operational view." meta={<span className="date-meta">THIS WEEK</span>} action={<button type="button" className={scheduleAdded ? "small-outline schedule-add-button schedule-add-complete" : "small-outline schedule-add-button"} onClick={() => { if (scheduleAdded) { toast("This preparation block is already on your schedule."); return; } setScheduleAdded(true); toast.success("Preparation block added to your schedule."); }}><CalendarPlus size={15} /> {scheduleAdded ? "Added to schedule" : "Add to schedule"}</button>} /><div className="schedule-board">{scheduleItems.map((item) => <ScheduleLine key={item.time} {...item} />)}{scheduleAdded && <div className="schedule-added-item"><CheckCircle2 size={16} /><div><b>Application preparation block</b><span>17:30 · 30 min · Personal schedule item</span></div><StatusPill>Added</StatusPill></div>}</div><Notice title="Schedule context" text="Evaluation and interview details appear only when they are scheduled and visible to your role." /></StudentLayout>; }

export function OffersPage() { return <StudentLayout><PageHeader eyebrow="Offers" title="Offer records" description="Review offers that have been issued to you through an approved recruitment workflow." /><SectionCard title="Current offer status"><EmptyPanel title="No offers pending" text="An offer will appear here when an authorised recruiter records it after the relevant recruitment stages." action={<Link href="/season" className="small-outline">View placement journey</Link>} /></SectionCard><section className="quiet-rule"><p>Offer documents, acceptance responses, and placement-status updates are retained with the application record.</p></section></StudentLayout>; }

export function PlacementPage() { return <StudentLayout><PageHeader eyebrow="My placement" title="Placement status" description="Your institution’s current placement visibility and record status." meta={<StatusPill>Open for placement</StatusPill>} /><div className="placement-layout"><SectionCard title="Current record"><div className="placement-status"><span>Placement window</span><b>Open</b><p>Batch 2028 · Computer Science</p></div><div className="placement-figures"><StatCard label="Applications" value="02" /><StatCard label="Shortlists" value="00" /><StatCard label="Offers" value="00" /></div></SectionCard><SectionCard title="Placement record detail"><KeyValue label="Institution" value="SIH Partner Institution" /><KeyValue label="Academic program" value="Computer Science" /><KeyValue label="Eligibility record" value="Current" /><KeyValue label="Academic evidence" value="Partially verified" /><Link href="/profile" className="primary-button">Complete profile <ArrowRight size={16} /></Link></SectionCard></div></StudentLayout>; }

const profileTabs = ["overview", "documents", "resumes", "settings"] as const;
export function ProfilePage({ section = "overview" }: { section?: typeof profileTabs[number] }) { return <StudentLayout><div className="profile-hero"><div className="profile-avatar">AS</div><div><h1>Anaya Sharma</h1><p>STU-102417 · Computer Science · Batch 2028</p></div><div className="profile-availability"><StatusPill>Open for placement</StatusPill><StatusPill tone="muted">Profile visibility: Recruiters</StatusPill></div></div><nav className="subnav">{profileTabs.map((tab) => <Link key={tab} href={tab === "overview" ? "/profile" : `/profile/${tab}`} className={tab === section ? "subnav-link subnav-active" : "subnav-link"}>{tab[0].toUpperCase() + tab.slice(1)}</Link>)}</nav>{section === "overview" && <ProfileOverview />}{section === "documents" && <ProfileDocuments />}{section === "resumes" && <ProfileResumes />}{section === "settings" && <ProfileSettings />}</StudentLayout>; }

function declaredSkillsFromStorage() { try { const stored = localStorage.getItem("sih-connect-declared-skills"); return stored ? JSON.parse(stored) as string[] : ["Python", "Data analysis", "Research writing", "Communication"]; } catch { return ["Python", "Data analysis", "Research writing", "Communication"]; } }
type ProfessionalLinks = { linkedin: string; github: string; portfolio: string; leetcode: string; codechef: string; codeforces: string };
const professionalLinkFields: { key: keyof ProfessionalLinks; label: string; placeholder: string }[] = [{ key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-name" }, { key: "github", label: "GitHub", placeholder: "https://github.com/your-handle" }, { key: "portfolio", label: "Portfolio", placeholder: "https://your-portfolio.example" }, { key: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/your-handle" }, { key: "codechef", label: "CodeChef", placeholder: "https://codechef.com/users/your-handle" }, { key: "codeforces", label: "Codeforces", placeholder: "https://codeforces.com/profile/your-handle" }];
function professionalLinksFromStorage(): ProfessionalLinks { const defaults: ProfessionalLinks = { linkedin: "", github: "", portfolio: "", leetcode: "", codechef: "", codeforces: "" }; try { const stored = localStorage.getItem("sih-connect-professional-links"); return stored ? { ...defaults, ...JSON.parse(stored) as Partial<ProfessionalLinks> } : defaults; } catch { return defaults; } }
function ProfileOverview() {
  const [skillsInput, setSkillsInput] = useState(() => declaredSkillsFromStorage().join(", "));
  const [links, setLinks] = useState<ProfessionalLinks>(professionalLinksFromStorage);
  const [phone, setPhone] = useState(() => {
    try {
      const stored = localStorage.getItem("sih-connect-profile-phone");
      return stored ? stored.replace(/\D/g, "").slice(-10) : "9812345510";
    } catch {
      return "9812345510";
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("sih-connect-profile-email") || "anaya.sharma@example.edu";
    } catch {
      return "anaya.sharma@example.edu";
    }
  });
  const assessment = loadLatestAssessmentResult();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleSaveContactDetails = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      localStorage.setItem("sih-connect-profile-phone", phone);
      localStorage.setItem("sih-connect-profile-email", email);
      await api.profile.update({ phone: `+91 ${phone}`, email });
      toast.success("Contact details updated and saved successfully!");
    } catch {
      toast.success("Contact details saved locally.");
    }
  };

  async function saveLinksAndSkills() {
    const skills = Array.from(new Set(skillsInput.split(",").map((skill) => skill.trim()).filter(Boolean)));
    localStorage.setItem("sih-connect-declared-skills", JSON.stringify(skills));
    localStorage.setItem("sih-connect-professional-links", JSON.stringify(links));
    setSkillsInput(skills.join(", "));
    try {
      await api.profile.update({ declaredSkills: skills });
    } catch {}
    toast.success("Professional links and declared skills saved to profile.");
  }
  return <div className="profile-stack"><SectionCard><div className="completion-banner"><div><b>Profile 78% complete</b><ProgressBar value={78} /><p>Missing: Semester 4 academic record.</p></div><Link href="/profile/documents" className="primary-button">Complete profile</Link></div></SectionCard><div className="academic-grid"><StatCard label="CGPA" value="8.14" note="Current record" /><StatCard label="Backlogs" value="0" note="No active record" /><StatCard label="10th %" value="91.2" /><StatCard label="12th %" value="88.6" /></div><SectionCard title="Contact details"><div className="form-grid"><label>Mobile number (10 digits)<div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ padding: "0.5rem 0.75rem", background: "var(--surface-muted, #f1f3f5)", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: "6px", fontSize: "0.9rem", color: "#555" }}>+91</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phone} onChange={handlePhoneChange} placeholder="9812345510" style={{ flex: 1 }} /></div><small style={{ color: phone.length === 10 ? "#2b8a3e" : "#e03131", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{phone.length}/10 digits {phone.length === 10 ? "✓" : "(must be exactly 10 digits)"}</small></label><label>Personal email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anaya.sharma@example.edu" /></label></div><div className="section-actions"><button type="button" className="small-outline" onClick={() => void handleSaveContactDetails()}>Save changes</button></div></SectionCard><SectionCard title="Links & skills" aside={<Link href="/skill-map/roles" className="action-link">See skill map <ArrowRight size={15} /></Link>}><form className="links-skills-form" onSubmit={(event) => { event.preventDefault(); void saveLinksAndSkills(); }}><p className="declared-skills-copy">Add professional evidence links and the skills you currently know. These inputs support a clearer profile review; declared skills remain part of your skill-map comparison.</p><div className="professional-links-grid">{professionalLinkFields.map((field) => <label key={field.key}>{field.label}<input type="url" value={links[field.key]} onChange={(event) => setLinks((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} /></label>)}</div><label className="top-skills-field">Top skills<textarea value={skillsInput} onChange={(event) => setSkillsInput(event.target.value)} placeholder="Python, Data analysis, Research writing, Communication" rows={4} /><small>Comma-separated, for example: Python, React, SQL.</small></label><div className="links-skills-actions"><span>Saved skills appear in your mapping evidence after you select Save.</span><button type="submit" className="small-outline">Save links & skills</button></div></form></SectionCard><SectionCard title="Assessment-calculated skills" aside={<Link href="/assessment" className="action-link">{assessment ? "Retake quiz" : "Take quiz"} <ArrowRight size={15} /></Link>}>{assessment ? <div className="assessment-profile-scores">{(["Technical", "Soft skills", "Other skills"] as const).map((category) => <article key={category}><span>{category}</span><b>{assessment.categoryScores[category]}%</b><small>{assessment.categoryScores[category] >= 80 ? "Strong answer signal" : assessment.categoryScores[category] >= 60 ? "Current answer signal" : "Targeted practice needed"}</small></article>)}<p>Calculated from your latest scored quiz. These signals are considered alongside declared and verified evidence.</p></div> : <div className="assessment-empty"><p>No knowledge quiz has been completed yet. Take the assessment to calculate technical, soft, and other skill signals from your answers.</p><Link href="/assessment/industry-readiness" className="small-outline">Start knowledge quiz <ArrowRight size={15} /></Link></div>}</SectionCard></div>;
}

function ProfileDocuments() {
  const [docs, setDocs] = useState([
    { id: "1", title: "Semester 3 academic record", verified: true },
    { id: "2", title: "Semester 4 academic record", verified: false },
    { id: "3", title: "Identity proof", verified: true },
    { id: "4", title: "Skill evidence note", verified: true },
  ]);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const handleAddDoc = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newDocTitle.trim()) return;
    const newDoc = { id: String(Date.now()), title: newDocTitle.trim(), verified: true };
    setDocs((curr) => [...curr, newDoc]);
    setNewDocTitle("");
    setShowUpload(false);
    try {
      await api.profile.addDocument(newDoc.title);
    } catch {}
    toast.success(`Uploaded and registered: ${newDoc.title}`);
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    setDocs((curr) => curr.filter((d) => d.id !== id));
    try {
      await api.profile.deleteDocument(id);
    } catch {}
    toast(`${title} removed.`);
  };

  return <div className="profile-stack"><SectionCard title="Academic and supporting documents" aside={<button className="small-outline" onClick={() => setShowUpload((c) => !c)}>{showUpload ? "Cancel" : "Upload document"}</button>}>
    {showUpload && (
      <form onSubmit={handleAddDoc} style={{ marginBottom: "1.25rem", padding: "1rem", background: "var(--card-bg, #f8f9fa)", borderRadius: "8px", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Document title or description</label>
        <input style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }} value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} placeholder="e.g. Semester 5 Marksheet, AWS Certification, Project Report" required />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" className="primary-button">Upload & Verify</button>
          <button type="button" className="small-outline" onClick={() => setShowUpload(false)}>Cancel</button>
        </div>
      </form>
    )}
    <div className="document-list">{docs.map((doc) => <div key={doc.id}><FileText size={18} /><div><b>{doc.title}</b><span>{doc.verified ? "Verified document" : "Required · Verification pending"}</span></div><StatusPill tone={doc.verified ? "olive" : "ochre"}>{doc.verified ? "Verified" : "Action required"}</StatusPill><button type="button" className="text-button" onClick={() => void handleDeleteDoc(doc.id, doc.title)}>Delete</button></div>)}</div>
  </SectionCard><Notice title="Access and privacy" text="Documents are visible only according to your consent, application selection, and role-based access rules." /></div>;
}

function ProfileResumes() { return <div className="profile-stack"><SectionCard title="Resume versions" aside={<button className="small-outline" onClick={() => toast.success("New resume version uploaded successfully.")}>Upload new version</button>}><div className="resume-card"><FileText size={24} /><div><b>Anaya_Sharma_resume.pdf</b><span>Primary resume · Updated 18 Aug · Used in 2 applications</span></div><StatusPill>Primary</StatusPill><button className="icon-text" onClick={() => toast.success("Resume downloaded.")}><Download size={16} /> Download</button></div></SectionCard><SectionCard title="Application use"><p className="body-copy">Selecting a different resume during an application keeps the submitted version attached to that application record.</p></SectionCard></div>; }
function ProfileSettings() { const [profileVisible, setProfileVisible] = useState(true); const [notificationsEnabled, setNotificationsEnabled] = useState(true); const PreferenceToggle = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => <button type="button" className={`preference-toggle ${enabled ? "is-on" : "is-off"}`} role="switch" aria-checked={enabled} aria-label={label} onClick={onToggle}><span>{enabled ? "On" : "Off"}</span><i /></button>; return <div className="profile-stack"><SectionCard title="Profile preferences"><div className="setting-row"><div><b>Recruiter profile visibility</b><span>Authorised recruiters may view approved profile evidence.</span></div><PreferenceToggle enabled={profileVisible} onToggle={() => setProfileVisible((current) => !current)} label="Toggle recruiter profile visibility" /></div><div className="setting-row"><div><b>Application notifications</b><span>Receive updates when a recruitment stage changes.</span></div><PreferenceToggle enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled((current) => !current)} label="Toggle application notifications" /></div></SectionCard><SectionCard title="Privacy controls"><p className="body-copy">Consent, access history, and data requests are handled through the connected institutional privacy workflow.</p><button className="small-outline" onClick={() => toast.success("Privacy preferences updated.")}>View privacy options</button></SectionCard></div>; }

export function SkillMapPage({ focus = "industries" }: { focus?: "industries" | "roles" }) {
  const labels = { industries: "Industry alignment", roles: "Role alignment" };
  const scoredContent = focus === "industries" ? studentSkillMaps.industries : studentSkillMaps.roles;
  const declaredSkills = declaredSkillsFromStorage();
  const assessment = loadLatestAssessmentResult();
  const skillComparison = focus === "industries" ? [{ skill: "Python", target: "Core applied-systems requirement", current: "Verified coursework evidence", state: "Aligned" }, { skill: "Data analysis", target: "Core applied-systems requirement", current: "Declared + assessment signal", state: "Aligned" }, { skill: "SQL", target: "Preferred requirement", current: "Learning gap identified", state: "Developing" }, { skill: "Presentation", target: "Supporting communication requirement", current: "Evidence not yet attached", state: "Build evidence" }] : [{ skill: "Python", target: "Data-operations role requirement", current: "Verified coursework evidence", state: "Aligned" }, { skill: "Research writing", target: "Research-operations role requirement", current: "Verified project evidence", state: "Aligned" }, { skill: "SQL", target: "Preferred data-operations requirement", current: "Learning gap identified", state: "Developing" }, { skill: "User research", target: "Product-review role requirement", current: "No project evidence yet", state: "Build evidence" }];

  return <StudentLayout><PageHeader eyebrow="Skill map" title={labels[focus]} description="A transparent view of how your verified profile evidence, declared skills, and answer-calculated assessment signals compare with published requirements." /><div className="skill-map-layout"><section className="map-main"><nav className="subnav"><Link href="/skill-map/industries" className={focus === "industries" ? "subnav-link subnav-active" : "subnav-link"}>Industries</Link><Link href="/skill-map/roles" className={focus === "roles" ? "subnav-link subnav-active" : "subnav-link"}>Job roles</Link></nav><SectionCard title="Skill-by-skill comparison" aside={<Link href="/portfolio" className="action-link">Review portfolio <ArrowRight size={15} /></Link>}><div className="skill-comparison-list"><div className="skill-comparison-head"><span>Skill</span><span>Target requirement</span><span>Your current evidence</span><span>Position</span></div>{skillComparison.map((item) => <div className="skill-comparison-row" key={item.skill}><b>{item.skill}</b><span>{item.target}</span><span>{item.current}</span><i className={item.state === "Aligned" ? "comparison-aligned" : item.state === "Developing" ? "comparison-developing" : "comparison-build"}>{item.state}</i></div>)}</div><p className="skill-comparison-note">Use this comparison to decide which portfolio evidence to review, improve, or add before pursuing a pathway.</p></SectionCard><SectionCard title={labels[focus]} aside={<StatusPill>Evidence-led analysis</StatusPill>}><div className="map-list map-analysis-list">{scoredContent.map((item) => <article key={item.title} className="map-analysis-card"><div className="map-analysis-overview"><div><span className="analysis-label">{focus === "industries" ? "Industry pathway" : "Role pathway"}</span><h3>{item.title}</h3><p>{item.note}</p></div><div className="map-score"><b>{item.score}%</b><span>current alignment</span><ProgressBar value={item.score} /></div></div><div className="map-analysis-evidence"><span>Evidence basis</span><p>{item.evidence}</p></div><div className="map-analysis-grid"><div><span>Current strengths</span><div className="analysis-chip-row">{item.strengths.map((strength) => <i key={strength}>{strength}</i>)}</div></div><div><span>Priority gaps</span><div className="analysis-chip-row analysis-gap-row">{item.gaps.map((gap) => <i key={gap}>{gap}</i>)}</div></div></div><div className="map-analysis-next"><span>Recommended next action</span><p>{item.nextAction}</p></div></article>)}</div></SectionCard></section><aside className="map-aside"><img src={studentSkillMap} alt="Abstract student skill mapping illustration" /><SectionCard title="Declared profile evidence"><div className="skill-map-evidence"><span>These self-declared skills are included alongside verified evidence and answer-calculated assessment signals when the matching service calculates alignment.</span><div className="declared-skill-list">{declaredSkills.map((skill) => <span key={skill} className="declared-skill">{skill}<button type="button">×</button></span>)}</div><Link href="/profile" className="action-link">Update declared skills <ArrowRight size={15} /></Link></div></SectionCard><SectionCard title="Latest quiz signals">{assessment ? <div className="quiz-map-signals">{(["Technical", "Soft skills", "Other skills"] as const).map((category) => <div key={category}><span>{category}</span><b>{assessment.categoryScores[category]}%</b></div>)}<Link href={`/assessment/${assessment.assessmentId}/results`} className="action-link">Review calculated result <ArrowRight size={15} /></Link></div> : <div className="skill-map-evidence"><span>Complete the knowledge quiz to add answer-calculated technical, soft, and other skill signals.</span><Link href="/assessment/industry-readiness" className="action-link">Start quiz <ArrowRight size={15} /></Link></div>}</SectionCard><SectionCard title="How this is calculated"><p className="body-copy">Scores compare verified skills, declared profile evidence, academic evidence, answer-calculated quiz signals, published requirements, and industry demand. They do not replace eligibility decisions.</p><Link href="/portfolio" className="action-link">Review portfolio evidence <ArrowRight size={15} /></Link></SectionCard></aside></div></StudentLayout>;
}
