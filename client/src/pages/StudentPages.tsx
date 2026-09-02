// Field Notes Institutional Workspace: student screens use a calm top-nav workspace and explicit placement flows.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  Lock,
  MapPin,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
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
  getJobOpportunities,
  getJobOpportunityById,
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
import { getDeclaredSkills, isSkillMatched, saveDeclaredSkills } from "@/data/assessmentData";
import {
  JobOffer,
  PlacementStatusRecord,
  acceptJobOffer,
  declineJobOffer,
  downloadOfferLetter,
  getPlacementStatus,
  getStudentOffers,
} from "@/data/offerData";
import {
  ProfileDocumentItem,
  ProfileResumeItem,
  ProfileSettingsState,
  addProfileDocument,
  addProfileResume,
  deleteProfileDocument,
  deleteProfileResume,
  downloadProfileDocument,
  downloadProfileResume,
  getProfileDocuments,
  getProfileResumes,
  getProfileSettings,
  saveProfileSettings,
  setPrimaryResume,
} from "@/data/profileData";
import {
  ScheduleEvent,
  addCustomPreparationBlock,
  downloadCalendarEvent,
  getFormattedCurrentDate,
  getScheduleEvents,
  initialScheduleEvents,
  toggleEventCalendarStatus,
} from "@/data/scheduleData";
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
  const currentDateLabel = useMemo(() => getFormattedCurrentDate(), []);
  const todayEvents = useMemo(() => {
    const all = getScheduleEvents();
    return all.filter((e) => e.dayNumber === 2 || e.status === "Scheduled");
  }, []);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const topJobs = useMemo(() => {
    return getJobOpportunities().slice(0, 2).map((job) => {
      const fit = calculateJobSkillFit(job, userSkills);
      return { ...job, fit };
    });
  }, [userSkills]);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Student workspace"
        title="Placement readiness: Open"
        description="Two actions require attention · Batch 2028"
        meta={<span className="date-meta">{currentDateLabel}</span>}
      />
      <div className="stat-grid">
        <StatCard
          label="Applications"
          value={String(activeAppsCount).padStart(2, "0")}
          note={`${activeAppsCount} in active review`}
        />
        <StatCard label="Upcoming evaluations" value="01" note="This week" />
        <StatCard label="Offers pending" value="00" tone="ochre" note="No response due" />
        <StatCard label="Profile complete" value="85%" tone="olive" note="Academic records verified" />
      </div>
      <div className="dashboard-grid">
        <div className="stack-lg">
          <SectionCard title="Needs attention" aside={<StatusPill tone="ochre">2 items</StatusPill>}>
            <div className="attention-list">
              <div>
                <span className="attention-dot" />
                <p>
                  <b>Upload your semester 4 transcript.</b>
                  <small>Required before the Applied AI Capability Studio review.</small>
                </p>
                <Link href="/profile/documents">
                  Review documents <ChevronRight size={15} />
                </Link>
              </div>
              <div>
                <span className="attention-dot muted-dot" />
                <p>
                  <b>Confirm your evaluation attendance.</b>
                  <small>Candidate evaluation briefing · Thursday, 14:30.</small>
                </p>
                <Link href="/schedule">
                  View schedule <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Eligible for you" aside={<ActionLink href="/jobs">View all</ActionLink>}>
            <div className="eligible-list">
              {topJobs.map((item) => (
                <Link href={`/jobs/${item.id}`} key={item.id} className="eligible-row">
                  <div>
                    <StatusPill tone={item.fit.matchPercent >= 70 ? "olive" : "ochre"}>
                      {item.status}
                    </StatusPill>
                    <h3>{item.title}</h3>
                    <p>
                      {item.organization} · {item.location}
                    </p>
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
          <section className="skill-callout">
            <div>
              <span className="eyebrow">Skill map</span>
              <h2>Keep your evidence aligned to the next requirement.</h2>
              <p>Your current profile maps most strongly to applied systems and research operations.</p>
              <ActionLink href="/skill-map/industries">Open skill map</ActionLink>
            </div>
            <img src={studentSkillMap} alt="Abstract student skill mapping illustration" />
          </section>
        </div>
        <aside className="stack-lg">
          <SectionCard title="Your season" aside={<ActionLink href="/season">Full journey</ActionLink>}>
            <ol className="season-list">
              {applicationStages.map((stage, index) => (
                <li key={stage} className={index === 0 ? "season-current" : ""}>
                  <span />
                  <div>
                    <b>{stage}</b>
                    <small>
                      {index === 0
                        ? `${activeAppsCount} application${activeAppsCount === 1 ? "" : "s"}`
                        : "No activity"}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard title="Today's Schedule">
            {todayEvents.length > 0 ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {todayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "10px",
                      background: "var(--surface)",
                      border: "1px solid var(--rule)",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <b style={{ fontSize: "12px" }}>{ev.title}</b>
                      <StatusPill tone="olive">{ev.kind}</StatusPill>
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--slate)", display: "block", marginTop: "3px" }}>
                      ⏰ {ev.time} · {ev.location}
                    </span>
                  </div>
                ))}
                <Link href="/schedule" className="action-link" style={{ marginTop: "4px" }}>
                  View full schedule <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <EmptyPanel
                title="No events today"
                text="Check upcoming events and evaluations on your schedule."
                action={
                  <Link href="/schedule" className="small-outline">
                    Open schedule
                  </Link>
                }
              />
            )}
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function JobsPage() {
  const [query, setQuery] = useState("");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minFit, setMinFit] = useState<number>(0);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [jobsList, setJobsList] = useState<JobOpportunity[]>(getJobOpportunities);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
    setJobsList(getJobOpportunities());
  }, []);

  // Compute all available unique skills across job opportunities
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    jobsList.forEach((j) => {
      j.required.forEach((s) => skillSet.add(s));
      j.preferred.forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).sort();
  }, [jobsList]);

  const jobsWithMeta = useMemo(() => {
    return jobsList
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
  }, [jobsList, userSkills]);

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
  const all = getJobOpportunities();
  return getJobOpportunityById(id) ?? all.find((item) => item.id === id) ?? all[0];
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

          {(item.qualification || item.eligibility) && (
            <SectionCard title="Qualification & eligibility criteria">
              {item.qualification && (
                <div style={{ marginBottom: "12px" }}>
                  <b style={{ display: "block", marginBottom: "4px", fontSize: "13px" }}>Academic Qualification:</b>
                  <p className="body-copy" style={{ margin: 0 }}>{item.qualification}</p>
                </div>
              )}
              {item.eligibility && (
                <div>
                  <b style={{ display: "block", marginBottom: "4px", fontSize: "13px" }}>Eligibility Baseline:</b>
                  <p className="body-copy" style={{ margin: 0 }}>{item.eligibility}</p>
                </div>
              )}
            </SectionCard>
          )}

          {item.stages && (
            <SectionCard title="Selection sequence & evaluation stages">
              <p className="body-copy">{item.stages}</p>
            </SectionCard>
          )}

          {item.attachments && item.attachments.length > 0 && (
            <SectionCard title="Company brief & attached documents">
              <div className="uploaded-docs-list">
                {item.attachments.map((file: any, index: number) => (
                  <div className="uploaded-doc-item" key={file.id || index}>
                    <div className="doc-info">
                      <FileText size={16} />
                      <div>
                        <b>{file.name}</b>
                        <span>{file.size} · Published by hiring team</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => {
                        downloadAttachedFile(file);
                        toast.success(`Downloaded ${file.name}`);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
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

  const removeSupportingDoc = (docIdentifier?: string) => {
    if (!docIdentifier) return;
    setSupportingDocs((current) => current.filter((d) => (d.id || d.name) !== docIdentifier));
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
                        onClick={() => removeSupportingDoc(doc.id || doc.name)}
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
  const [scheduleEventsList, setScheduleEventsList] = useState<ScheduleEvent[]>(getScheduleEvents);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent>(() => {
    const list = getScheduleEvents();
    return list[0] || initialScheduleEvents[0];
  });

  useEffect(() => {
    setScheduleEventsList(getScheduleEvents());
  }, []);

  const handleAdd = (ev: ScheduleEvent) => {
    const res = toggleEventCalendarStatus(ev.id);
    setScheduleEventsList(getScheduleEvents());
    toast.success(
      res.isAdded
        ? `Added "${res.event.title}" to your schedule!`
        : `Removed "${res.event.title}" from your schedule.`
    );
  };

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Events"
        title="Relevant events & workshops"
        description="Evaluation briefings, recruiter clinics, and career workshops permitted to your batch."
        meta={<span className="date-meta">{getFormattedCurrentDate()}</span>}
      />
      <div className="event-layout">
        <div className="event-list">
          {scheduleEventsList.map((event) => (
            <article
              className={`event-row ${selectedEvent.id === event.id ? "event-row-active" : ""}`}
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              style={{ cursor: "pointer" }}
            >
              <div className="event-date">
                <b>{String(event.dayNumber).padStart(2, "0")}</b>
                <span>{event.month}</span>
              </div>
              <div className="event-info">
                <StatusPill
                  tone={
                    event.kind === "Evaluation" || event.kind === "Interview"
                      ? "ochre"
                      : event.kind === "Event"
                      ? "olive"
                      : "muted"
                  }
                >
                  {event.kind}
                </StatusPill>
                <h2>{event.title}</h2>
                <p>
                  ⏰ {event.time} · 📍 {event.location}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--slate)" }}>
                    {event.organizer}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={event.isAddedToMyCalendar ? "small-outline toggle-active" : "small-outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(event);
                }}
              >
                {event.isAddedToMyCalendar ? "✓ On Schedule" : "+ Add to Schedule"}
              </button>
            </article>
          ))}
        </div>
        <aside className="event-message-panel">
          <div className="event-message-mark">
            <MessageSquareText size={18} />
          </div>
          <span className="event-message-label">Event Briefing</span>
          <h3 style={{ margin: "6px 0 2px" }}>{selectedEvent.title}</h3>
          <p className="event-message-date" style={{ color: "var(--olive)", fontWeight: 700 }}>
            {selectedEvent.dayOfWeek}, {selectedEvent.date} · {selectedEvent.time}
          </p>
          <p style={{ fontSize: "11.5px", lineHeight: 1.5 }}>{selectedEvent.description}</p>
          {selectedEvent.preparationTips && (
            <div
              style={{
                margin: "10px 0",
                padding: "8px 10px",
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "6px",
                fontSize: "10.5px",
              }}
            >
              <b>Preparation:</b> {selectedEvent.preparationTips}
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Link href="/schedule" className="primary-button" style={{ flex: 1, textAlign: "center" }}>
              Open in Schedule <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function CalendarPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>(getScheduleEvents);
  const [selectedDayEvent, setSelectedDayEvent] = useState<ScheduleEvent | null>(() => {
    const list = getScheduleEvents();
    return list[0] || null;
  });

  useEffect(() => {
    setEvents(getScheduleEvents());
  }, []);

  const days = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Calendar"
        title="September 2026"
        description="A time-based view of your permitted events, evaluations, and application deadlines."
        meta={<span className="date-meta">{getFormattedCurrentDate()}</span>}
        action={
          <Link href="/schedule" className="small-outline">
            Open full schedule
          </Link>
        }
      />
      <SectionCard className="calendar-card">
        <div className="calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((day) => {
            const dayNum = day <= 30 ? day : day - 30;
            const isToday = day === 2; // 02 Sep
            const dayEvents = events.filter((e) => e.dayNumber === dayNum && day <= 30);
            return (
              <div
                className={`calendar-cell ${isToday ? "calendar-today" : ""}`}
                key={day}
                style={{ cursor: dayEvents.length > 0 ? "pointer" : "default" }}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDayEvent(dayEvents[0]);
                  }
                }}
              >
                <b>{dayNum}</b>
                {dayEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className={`calendar-chip ${
                      ev.kind === "Evaluation" || ev.kind === "Interview"
                        ? "ochre-chip"
                        : ev.kind === "Deadline"
                        ? "gray-chip"
                        : "olive-chip"
                    }`}
                  >
                    {ev.title.slice(0, 16)}...
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {selectedDayEvent && (
        <SectionCard
          title={`Selected Event: ${selectedDayEvent.title}`}
          aside={
            <StatusPill tone={selectedDayEvent.kind === "Event" ? "olive" : "ochre"}>
              {selectedDayEvent.kind}
            </StatusPill>
          }
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <p className="body-copy">{selectedDayEvent.description}</p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--slate)" }}>
              <span>📅 <b>Date:</b> {selectedDayEvent.date} ({selectedDayEvent.dayOfWeek})</span>
              <span>⏰ <b>Time:</b> {selectedDayEvent.time}</span>
              <span>📍 <b>Venue:</b> {selectedDayEvent.location}</span>
            </div>
            <div style={{ marginTop: "6px" }}>
              <Link href="/schedule" className="action-link">
                View in detailed schedule <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="legend-row">
        <span>
          <i className="legend-dot olive-dot" /> Event / Workshop
        </span>
        <span>
          <i className="legend-dot ochre-dot" /> Evaluation / Interview
        </span>
        <span>
          <i className="legend-dot gray-dot" /> Application Deadline
        </span>
      </div>
    </StudentLayout>
  );
}

export function SeasonPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [selectedStage, setSelectedStage] = useState<
    "all" | "Applied" | "Screening" | "Shortlisted" | "Interview" | "Offer"
  >("all");

  useEffect(() => {
    setApplications(getStudentApplications());
  }, []);

  const activeApps = applications.filter((app) => !app.isWithdrawn);
  const withdrawnApps = applications.filter((app) => app.isWithdrawn);

  const screeningCount = activeApps.filter(
    (a) => a.status === "Screening" || a.status === "Application received"
  ).length;
  const shortlistedCount = activeApps.filter((a) => a.status === "Shortlisted").length;
  const interviewCount = activeApps.filter((a) => a.status === "Interview").length;
  const offersCount = activeApps.filter((a) => a.status === "Offer").length;

  const handleStageClick = (
    stage: "Applied" | "Screening" | "Shortlisted" | "Interview" | "Offer"
  ) => {
    setSelectedStage((curr) => (curr === stage ? "all" : stage));
  };

  const filteredApplications = useMemo(() => {
    if (selectedStage === "all") return applications;
    if (selectedStage === "Applied") return activeApps;
    if (selectedStage === "Screening") {
      return activeApps.filter(
        (a) => a.status === "Screening" || a.status === "Application received"
      );
    }
    if (selectedStage === "Shortlisted") {
      return activeApps.filter((a) => a.status === "Shortlisted");
    }
    if (selectedStage === "Interview") {
      return activeApps.filter((a) => a.status === "Interview");
    }
    if (selectedStage === "Offer") {
      return activeApps.filter((a) => a.status === "Offer");
    }
    return applications;
  }, [applications, activeApps, selectedStage]);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="My season"
        title="Placement journey"
        description="Follow application movement from submission to offer. Click any stage (01–05) below to filter corresponding application records."
        meta={
          <StatusPill tone={activeApps.length > 0 ? "olive" : "muted"}>
            {activeApps.length} active application{activeApps.length === 1 ? "" : "s"}
          </StatusPill>
        }
      />
      <div className="season-layout">
        <SectionCard
          title="Journey summary"
          aside={
            selectedStage !== "all" && (
              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={() => setSelectedStage("all")}
              >
                Show All Stages ({applications.length})
              </button>
            )
          }
        >
          <div className="journey-steps">
            <button
              type="button"
              className={`journey-step journey-step-btn ${
                activeApps.length > 0 ? "journey-active" : ""
              } ${selectedStage === "Applied" ? "journey-selected" : ""}`}
              onClick={() => handleStageClick("Applied")}
              title="Click to filter applications in Applied stage"
            >
              <span>01</span>
              <b>Applied</b>
              <small>
                {applications.length} record{applications.length === 1 ? "" : "s"}
              </small>
            </button>

            <button
              type="button"
              className={`journey-step journey-step-btn ${
                screeningCount > 0 ? "journey-active" : ""
              } ${selectedStage === "Screening" ? "journey-selected" : ""}`}
              onClick={() => handleStageClick("Screening")}
              title="Click to filter applications in Screening stage"
            >
              <span>02</span>
              <b>Screening</b>
              <small>
                {screeningCount} record{screeningCount === 1 ? "" : "s"}
              </small>
            </button>

            <button
              type="button"
              className={`journey-step journey-step-btn ${
                shortlistedCount > 0 ? "journey-active" : ""
              } ${selectedStage === "Shortlisted" ? "journey-selected" : ""}`}
              onClick={() => handleStageClick("Shortlisted")}
              title="Click to filter applications in Shortlisted stage"
            >
              <span>03</span>
              <b>Shortlisted</b>
              <small>
                {shortlistedCount > 0 ? `${shortlistedCount} record(s)` : "No records"}
              </small>
            </button>

            <button
              type="button"
              className={`journey-step journey-step-btn ${
                interviewCount > 0 ? "journey-active" : ""
              } ${selectedStage === "Interview" ? "journey-selected" : ""}`}
              onClick={() => handleStageClick("Interview")}
              title="Click to filter applications in Interview stage"
            >
              <span>04</span>
              <b>Interview</b>
              <small>
                {interviewCount > 0 ? `${interviewCount} record(s)` : "No records"}
              </small>
            </button>

            <button
              type="button"
              className={`journey-step journey-step-btn ${
                offersCount > 0 ? "journey-active" : ""
              } ${selectedStage === "Offer" ? "journey-selected" : ""}`}
              onClick={() => handleStageClick("Offer")}
              title="Click to filter applications in Offers stage"
            >
              <span>05</span>
              <b>Offers</b>
              <small>{offersCount > 0 ? `${offersCount} offer(s)` : "No records"}</small>
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title={
            selectedStage === "all"
              ? "Application activity"
              : `Application activity · ${selectedStage} stage`
          }
          aside={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedStage !== "all" && (
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => setSelectedStage("all")}
                >
                  Clear filter
                </button>
              )}
              <span className="date-meta">
                {filteredApplications.length} MATCHING RECORDS
              </span>
            </div>
          }
        >
          <div className="activity-list">
            {filteredApplications.map((app) => (
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
                ) : app.status === "Shortlisted" ? (
                  <StatusPill tone="olive">Shortlisted</StatusPill>
                ) : app.status === "Interview" ? (
                  <StatusPill tone="olive">Interview scheduled</StatusPill>
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

            {filteredApplications.length === 0 && (
              <EmptyPanel
                title={
                  selectedStage === "all"
                    ? "No applications in placement season"
                    : `No applications currently in ${selectedStage} stage`
                }
                text={
                  selectedStage === "all"
                    ? "Explore approved job and internship opportunities to start your placement journey."
                    : "Try selecting a different stage from the journey summary above, or clear the filter."
                }
                action={
                  selectedStage === "all" ? (
                    <Link href="/jobs" className="small-outline">
                      Browse opportunities
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => setSelectedStage("all")}
                    >
                      Show all applications
                    </button>
                  )
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
  const [events, setEvents] = useState<ScheduleEvent[]>(getScheduleEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const list = getScheduleEvents();
    return list[0]?.id || "sch-01";
  });
  const [selectedKind, setSelectedKind] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("17:30 – 18:00");
  const [newDate, setNewDate] = useState("02 Sep 2026");

  const currentDateLabel = useMemo(() => getFormattedCurrentDate(), []);

  useEffect(() => {
    setEvents(getScheduleEvents());
  }, []);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  const filteredEvents = useMemo(() => {
    if (selectedKind === "All") return events;
    if (selectedKind === "Evaluations & Interviews") {
      return events.filter((e) => e.kind === "Evaluation" || e.kind === "Interview");
    }
    if (selectedKind === "Events & Workshops") {
      return events.filter((e) => e.kind === "Event" || e.kind === "Workshop");
    }
    if (selectedKind === "Deadlines") {
      return events.filter((e) => e.kind === "Deadline");
    }
    return events;
  }, [events, selectedKind]);

  const handleToggleSchedule = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      const res = toggleEventCalendarStatus(eventId);
      setEvents(getScheduleEvents());
      toast.success(
        res.isAdded
          ? `Added "${res.event.title}" to your personal calendar!`
          : `Removed "${res.event.title}" from your schedule.`
      );
    } catch {
      toast.error("Failed to update schedule status.");
    }
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const added = addCustomPreparationBlock(newTitle.trim(), newTime, newDate);
    setEvents(getScheduleEvents());
    setSelectedEventId(added.id);
    setNewTitle("");
    setShowAddModal(false);
    toast.success(`Preparation block "${added.title}" added to your schedule!`);
  };

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Schedule"
        title="Upcoming schedule & calendar"
        description="Evaluations, interviews, workshops, and application deadlines in one unified schedule. Click on any event to view full agendas, preparation tips, and session details."
        meta={<span className="date-meta">{currentDateLabel}</span>}
        action={
          <button
            type="button"
            className="small-outline"
            onClick={() => setShowAddModal(true)}
          >
            <CalendarPlus size={15} /> Add preparation block
          </button>
        }
      />

      {showAddModal && (
        <SectionCard
          title="Add Personal Schedule / Preparation Block"
          aside={
            <button
              type="button"
              className="text-button"
              onClick={() => setShowAddModal(false)}
            >
              <X size={15} />
            </button>
          }
        >
          <form onSubmit={handleAddCustomBlock} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Activity / Preparation Title *
                <input
                  style={{ width: "100%", marginTop: "4px" }}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. System Design Mock Interview, SQL Revision"
                  required
                />
              </label>
              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Date
                <input
                  style={{ width: "100%", marginTop: "4px" }}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. 02 Sep 2026"
                />
              </label>
              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Time & Duration
                <input
                  style={{ width: "100%", marginTop: "4px" }}
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 17:30 – 18:30"
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="primary-button">
                Save to Schedule
              </button>
              <button
                type="button"
                className="small-outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
        {["All", "Evaluations & Interviews", "Events & Workshops", "Deadlines"].map((kind) => (
          <button
            key={kind}
            type="button"
            className={selectedKind === kind ? "small-outline toggle-active" : "small-outline"}
            onClick={() => setSelectedKind(kind)}
            style={{ fontSize: "11px", padding: "6px 12px" }}
          >
            {kind}
          </button>
        ))}
      </div>

      <div className="tracker-layout">
        {/* Left Side: Schedule Timeline List */}
        <section className="stack-lg">
          <SectionCard
            title="Scheduled activities"
            aside={<span className="date-meta">{filteredEvents.length} ACTIVITIES</span>}
          >
            <div className="schedule-board" style={{ padding: 0, border: 0 }}>
              {filteredEvents.map((item) => {
                const isSelected = selectedEvent?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`schedule-line ${isSelected ? "schedule-line-selected" : ""}`}
                    onClick={() => setSelectedEventId(item.id)}
                    style={{
                      cursor: "pointer",
                      padding: "12px 14px",
                      background: isSelected ? "var(--olive-wash)" : "transparent",
                      borderLeft: isSelected ? "4px solid var(--olive)" : "4px solid transparent",
                      transition: "all 120ms ease",
                    }}
                  >
                    <div style={{ display: "grid", textAlign: "center", minWidth: "50px" }}>
                      <b style={{ fontSize: "13px", color: "var(--olive-deep)" }}>{item.dayNumber}</b>
                      <span style={{ fontSize: "9px", color: "var(--slate)", textTransform: "uppercase" }}>{item.month}</span>
                      <small style={{ fontSize: "8.5px", color: "var(--slate)" }}>{item.dayOfWeek.slice(0, 3)}</small>
                    </div>

                    <div
                      className="schedule-dot"
                      style={{
                        borderColor:
                          item.kind === "Evaluation" || item.kind === "Interview"
                            ? "var(--ochre)"
                            : item.kind === "Deadline"
                            ? "var(--slate)"
                            : "var(--olive)",
                      }}
                    />

                    <div className="schedule-main">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <b>{item.title}</b>
                        {item.isAddedToMyCalendar && (
                          <CheckCircle2 size={13} style={{ color: "var(--olive)" }} />
                        )}
                      </div>
                      <span>
                        ⏰ {item.time} ({item.duration}) · 📍 {item.location}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <StatusPill
                        tone={
                          item.kind === "Evaluation" || item.kind === "Interview"
                            ? "ochre"
                            : item.kind === "Event"
                            ? "olive"
                            : "muted"
                        }
                      >
                        {item.kind}
                      </StatusPill>
                      <button
                        type="button"
                        className="small-outline"
                        style={{ fontSize: "10px", padding: "4px 8px" }}
                        onClick={(e) => handleToggleSchedule(e, item.id)}
                        title={item.isAddedToMyCalendar ? "Remove from personal schedule" : "Add to personal schedule"}
                      >
                        {item.isAddedToMyCalendar ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </section>

        {/* Right Side: Selected Event Description Panel */}
        <aside className="stack-lg session-sticky-aside">
          {selectedEvent ? (
            <SectionCard
              title="Event & Session Details"
              aside={
                <StatusPill
                  tone={
                    selectedEvent.kind === "Evaluation" || selectedEvent.kind === "Interview"
                      ? "ochre"
                      : selectedEvent.kind === "Event"
                      ? "olive"
                      : "muted"
                  }
                >
                  {selectedEvent.kind}
                </StatusPill>
              }
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800 }}>
                    {selectedEvent.title}
                  </h3>
                  <div style={{ display: "grid", gap: "3px", fontSize: "11px", color: "var(--slate)" }}>
                    <span>📅 <b>Date:</b> {selectedEvent.dayOfWeek}, {selectedEvent.date}</span>
                    <span>⏰ <b>Time:</b> {selectedEvent.time} ({selectedEvent.duration})</span>
                    <span>🏛 <b>Host:</b> {selectedEvent.organizer}</span>
                    <span>📍 <b>Venue:</b> {selectedEvent.location}</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "10px" }}>
                  <b style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>
                    Description & Objectives:
                  </b>
                  <p className="body-copy" style={{ margin: 0, fontSize: "11.5px", lineHeight: 1.5 }}>
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "10px" }}>
                    <b style={{ display: "block", fontSize: "11px", marginBottom: "6px" }}>
                      Session Agenda:
                    </b>
                    <ul style={{ margin: "0 0 0 16px", padding: 0, fontSize: "11px", color: "var(--ink)" }}>
                      {selectedEvent.agenda.map((pt, i) => (
                        <li key={i} style={{ marginBottom: "3px" }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvent.preparationTips && (
                  <div
                    style={{
                      padding: "10px",
                      background: "var(--surface)",
                      border: "1px solid var(--rule)",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  >
                    <b style={{ color: "var(--olive-deep)", display: "block", marginBottom: "2px" }}>
                      💡 Preparation Checklist:
                    </b>
                    <span style={{ color: "var(--ink)" }}>{selectedEvent.preparationTips}</span>
                  </div>
                )}

                <div style={{ display: "grid", gap: "8px", borderTop: "1px solid var(--rule)", paddingTop: "12px" }}>
                  {selectedEvent.meetingLink && (
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="primary-button full-button"
                      style={{ textAlign: "center", justifyContent: "center" }}
                    >
                      <Globe size={13} /> Join Virtual Session Room
                    </a>
                  )}

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className={selectedEvent.isAddedToMyCalendar ? "small-outline toggle-active" : "small-outline"}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={(e) => handleToggleSchedule(e, selectedEvent.id)}
                    >
                      {selectedEvent.isAddedToMyCalendar ? "✓ On My Schedule" : "+ Add to Schedule"}
                    </button>
                    <button
                      type="button"
                      className="small-outline"
                      onClick={() => downloadCalendarEvent(selectedEvent)}
                      title="Download iCal file"
                    >
                      <Download size={13} /> .ICS
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Event Details">
              <p className="body-copy">Select any scheduled item on the left to view full event descriptions.</p>
            </SectionCard>
          )}

          <SectionCard title="Institutional sync">
            <p className="body-copy" style={{ fontSize: "11px" }}>
              Interview links and evaluation briefings synchronize directly with your department calendar and placement records.
            </p>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function OffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);

  useEffect(() => {
    setOffers(getStudentOffers());
  }, []);

  const handleAccept = (offerId: string, orgName: string) => {
    const res = acceptJobOffer(offerId);
    if (res.success) {
      setOffers(getStudentOffers());
      toast.success(`🎉 Congratulations! Offer from ${orgName} accepted!`, {
        description: "Your placement status has been updated to Placed in institutional records.",
      });
    }
  };

  const handleDecline = (offerId: string, orgName: string) => {
    const res = declineJobOffer(offerId);
    if (res.success) {
      setOffers(getStudentOffers());
      toast.info(`Offer from ${orgName} declined.`, {
        description: "Placement status remains open for other opportunities.",
      });
    }
  };

  const activeOffers = offers.filter((o) => o.status !== "Declined");

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Offers"
        title="Employment offer records"
        description="Review, download, accept, or decline official placement offers issued to you by verified recruitment partners."
        meta={
          <StatusPill tone={activeOffers.length > 0 ? "olive" : "muted"}>
            {offers.length} offer record{offers.length === 1 ? "" : "s"}
          </StatusPill>
        }
      />

      <div className="stack-lg">
        {offers.map((offer) => (
          <SectionCard
            key={offer.id}
            title={offer.jobTitle}
            aside={
              <StatusPill
                tone={
                  offer.status === "Accepted"
                    ? "olive"
                    : offer.status === "Pending Decision"
                    ? "ochre"
                    : "muted"
                }
              >
                {offer.status === "Accepted"
                  ? "Offer Accepted ✓"
                  : offer.status === "Pending Decision"
                  ? "Action Required · Pending Decision"
                  : "Offer Declined"}
              </StatusPill>
            }
          >
            <div style={{ display: "grid", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800 }}>
                    {offer.organization}
                  </h3>
                  <p style={{ margin: 0, color: "var(--slate)", fontSize: "12px" }}>
                    {offer.location} · {offer.roleType} · Issued {offer.issuedDate}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b style={{ display: "block", fontSize: "18px", color: "var(--olive)" }}>
                    {offer.ctc}
                  </b>
                  <small style={{ color: "var(--slate)", fontSize: "11px" }}>
                    Decision deadline: {offer.expiryDate}
                  </small>
                </div>
              </div>

              <p className="body-copy">{offer.summary}</p>

              <div>
                <span className="filter-group-title" style={{ marginBottom: "6px" }}>
                  Compensation & Package Benefits:
                </span>
                <ul style={{ margin: "4px 0 0 18px", padding: 0, fontSize: "11.5px", color: "var(--ink)" }}>
                  {offer.benefits.map((b) => (
                    <li key={b} style={{ marginBottom: "4px" }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--rule)",
                }}
              >
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => downloadOfferLetter(offer)}
                >
                  <Download size={14} /> Download Official Letter of Intent
                </button>

                {offer.status === "Pending Decision" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="small-outline"
                      style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      onClick={() => handleDecline(offer.id, offer.organization)}
                    >
                      Decline Offer
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => handleAccept(offer.id, offer.organization)}
                    >
                      Accept Offer & Confirm Placement
                    </button>
                  </div>
                )}

                {offer.status === "Accepted" && (
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--olive)" }}>
                    ✓ Accepted on {offer.acceptedAt || offer.issuedDate} · Record synced to institution
                  </span>
                )}
              </div>
            </div>
          </SectionCard>
        ))}

        {offers.length === 0 && (
          <SectionCard title="Current offer status">
            <EmptyPanel
              title="No offers pending"
              text="An offer will appear here when an authorised recruiter records it after the relevant recruitment stages."
              action={
                <Link href="/season" className="small-outline">
                  View placement journey
                </Link>
              }
            />
          </SectionCard>
        )}
      </div>

      <section className="quiet-rule" style={{ marginTop: "18px" }}>
        <p>
          Offer documents, acceptance responses, and placement-status updates are retained with the
          application record and institutional placement register.
        </p>
      </section>
    </StudentLayout>
  );
}

export function PlacementPage() {
  const [placement, setPlacement] = useState<PlacementStatusRecord>(getPlacementStatus);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);

  useEffect(() => {
    setPlacement(getPlacementStatus());
    setApplications(getStudentApplications());
    setOffers(getStudentOffers());
  }, []);

  const activeAppsCount = applications.filter((a) => !a.isWithdrawn).length;
  const shortlistsCount = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interview" || a.status === "Offer"
  ).length;
  const acceptedOffers = offers.filter((o) => o.status === "Accepted");
  const isPlaced = placement.status === "Placed" || acceptedOffers.length > 0;

  const handleDownloadPlacementCert = () => {
    const company = placement.placedCompany || (acceptedOffers[0]?.organization ?? "Northstar Systems");
    const role = placement.placedRole || (acceptedOffers[0]?.jobTitle ?? "Junior Applied AI Engineer");
    const ctc = placement.placedCtc || (acceptedOffers[0]?.ctc ?? "₹14,50,000 / annum");

    const content = `======================================================================
               INSTITUTIONAL PLACEMENT CONFIRMATION CERTIFICATE
======================================================================
Student: Anaya Sharma (STU-102417)
Batch: 2028 · Department: Computer Science & Engineering
Institution: SIH Partner Institution

PLACEMENT RECORD:
Company: ${company}
Designation: ${role}
Compensation (CTC): ${ctc}
Placement Status: VERIFIED & CONFIRMED
Date of Acceptance: ${placement.placedAt || "31 Aug 2026"}

Placement Officer Verification:
SIH Partner Institution University Placement Cell
Verification Hash: PLACEMENT-VERIFIED-${Math.floor(10000 + Math.random() * 90000)}
======================================================================`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Placement_Certificate_Anaya_Sharma_${company.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Institutional Placement Certificate!");
  };

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="My placement"
        title="Placement status & records"
        description="Your institution’s live placement window visibility, verified employment record, and batch statistics."
        meta={
          <StatusPill tone={isPlaced ? "olive" : "ochre"}>
            {isPlaced ? "Placed ✓" : "Open for placement"}
          </StatusPill>
        }
      />

      <div className="placement-layout">
        <SectionCard title="Current record">
          <div className="placement-status">
            <span>Placement window</span>
            <b>{placement.placementWindow}</b>
            <p>
              {placement.batch} · {placement.department}
            </p>
          </div>

          <div className="placement-figures">
            <StatCard label="Applications" value={String(activeAppsCount).padStart(2, "0")} />
            <StatCard label="Shortlists" value={String(shortlistsCount).padStart(2, "0")} />
            <StatCard label="Offers" value={String(offers.length).padStart(2, "0")} tone={offers.length > 0 ? "olive" : undefined} />
          </div>

          {isPlaced && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                background: "var(--olive-wash)",
                border: "1px solid var(--olive)",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} style={{ color: "var(--olive)" }} />
                <b style={{ fontSize: "13px", color: "var(--olive-deep)" }}>
                  Placement Confirmed at {placement.placedCompany || acceptedOffers[0]?.organization || "Northstar Systems"}
                </b>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: "11.5px", color: "var(--ink)" }}>
                Role: {placement.placedRole || acceptedOffers[0]?.jobTitle || "Junior Applied AI Engineer"} · Package: {placement.placedCtc || acceptedOffers[0]?.ctc || "₹14,50,000 / annum"}
              </p>
              <button
                type="button"
                className="small-outline"
                onClick={handleDownloadPlacementCert}
              >
                <Download size={13} /> Download Placement Certificate
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Placement record detail">
          <KeyValue label="Institution" value={placement.institution} />
          <KeyValue label="Academic program" value={placement.department} />
          <KeyValue label="Eligibility record" value="Verified & Current" />
          <KeyValue label="Academic evidence" value={placement.academicEvidence} />

          <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
            <Link href="/offers" className="primary-button full-button">
              View All Offer Records <ChevronRight size={16} />
            </Link>
            <Link href="/profile" className="small-outline full-button">
              Update Student Profile <ArrowRight size={16} />
            </Link>
          </div>
        </SectionCard>
      </div>
    </StudentLayout>
  );
}

const profileTabs = ["overview", "documents", "resumes", "settings"] as const;

export function ProfilePage({ section = "overview" }: { section?: typeof profileTabs[number] }) {
  return (
    <StudentLayout>
      <div className="profile-hero">
        <div className="profile-avatar">AS</div>
        <div>
          <h1>Anaya Sharma</h1>
          <p>STU-102417 · Computer Science · Batch 2028</p>
        </div>
        <div className="profile-availability">
          <StatusPill>Open for placement</StatusPill>
          <StatusPill tone="muted">Profile visibility: Recruiters</StatusPill>
        </div>
      </div>
      <nav className="subnav">
        {profileTabs.map((tab) => (
          <Link
            key={tab}
            href={tab === "overview" ? "/profile" : `/profile/${tab}`}
            className={tab === section ? "subnav-link subnav-active" : "subnav-link"}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </nav>
      {section === "overview" && <ProfileOverview />}
      {section === "documents" && <ProfileDocuments />}
      {section === "resumes" && <ProfileResumes />}
      {section === "settings" && <ProfileSettings />}
    </StudentLayout>
  );
}

function declaredSkillsFromStorage(): string[] {
  return getDeclaredSkills();
}

type ProfessionalLinks = {
  linkedin: string;
  github: string;
  portfolio: string;
  leetcode: string;
  codechef: string;
  codeforces: string;
};

const professionalLinkFields: { key: keyof ProfessionalLinks; label: string; placeholder: string }[] = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-name" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/your-handle" },
  { key: "portfolio", label: "Portfolio", placeholder: "https://your-portfolio.example" },
  { key: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/your-handle" },
  { key: "codechef", label: "CodeChef", placeholder: "https://codechef.com/users/your-handle" },
  { key: "codeforces", label: "Codeforces", placeholder: "https://codeforces.com/profile/your-handle" },
];

function professionalLinksFromStorage(): ProfessionalLinks {
  const defaults: ProfessionalLinks = {
    linkedin: "https://linkedin.com/in/anaya-sharma",
    github: "https://github.com/anaya-sharma",
    portfolio: "https://anaya-sharma.dev",
    leetcode: "https://leetcode.com/anaya_sharma",
    codechef: "",
    codeforces: "",
  };
  try {
    const stored = localStorage.getItem("sih-connect-professional-links");
    return stored ? { ...defaults, ...(JSON.parse(stored) as Partial<ProfessionalLinks>) } : defaults;
  } catch {
    return defaults;
  }
}

function sanitizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

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
    const rawSkills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const skills = Array.from(new Set(rawSkills));

    // Format all link URLs
    const formattedLinks: ProfessionalLinks = {
      linkedin: sanitizeUrl(links.linkedin),
      github: sanitizeUrl(links.github),
      portfolio: sanitizeUrl(links.portfolio),
      leetcode: sanitizeUrl(links.leetcode),
      codechef: sanitizeUrl(links.codechef),
      codeforces: sanitizeUrl(links.codeforces),
    };

    saveDeclaredSkills(skills);
    localStorage.setItem("sih-connect-professional-links", JSON.stringify(formattedLinks));
    setLinks(formattedLinks);
    setSkillsInput(skills.join(", "));

    try {
      await api.profile.update({ declaredSkills: skills });
    } catch {}

    toast.success("Professional links and declared skills saved to profile!");
  }

  return (
    <div className="profile-stack">
      <SectionCard>
        <div className="completion-banner">
          <div>
            <b>Profile 85% complete</b>
            <ProgressBar value={85} />
            <p>Verified: Academic records, contact details, declared skills, and resume.</p>
          </div>
          <Link href="/profile/documents" className="primary-button">
            Review documents
          </Link>
        </div>
      </SectionCard>

      <div className="academic-grid">
        <StatCard label="CGPA" value="8.14" note="Current record" />
        <StatCard label="Backlogs" value="0" note="No active record" />
        <StatCard label="10th %" value="91.2" />
        <StatCard label="12th %" value="88.6" />
      </div>

      <SectionCard title="Contact details">
        <div className="form-grid">
          <label>
            Mobile number (10 digits)
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "var(--surface-muted, #f1f3f5)",
                  border: "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9812345510"
                style={{ flex: 1 }}
              />
            </div>
            <small
              style={{
                color: phone.length === 10 ? "#2b8a3e" : "#e03131",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              {phone.length}/10 digits {phone.length === 10 ? "✓" : "(must be exactly 10 digits)"}
            </small>
          </label>
          <label>
            Personal email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anaya.sharma@example.edu"
            />
          </label>
        </div>
        <div className="section-actions">
          <button type="button" className="small-outline" onClick={() => void handleSaveContactDetails()}>
            Save changes
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Links & skills"
        aside={
          <Link href="/skill-map/roles" className="action-link">
            See skill map <ArrowRight size={15} />
          </Link>
        }
      >
        <form
          className="links-skills-form"
          onSubmit={(event) => {
            event.preventDefault();
            void saveLinksAndSkills();
          }}
        >
          <p className="declared-skills-copy">
            Add professional portfolio links and declared skills. Formatted links are verified for recruiters and matching algorithms.
          </p>
          <div className="professional-links-grid">
            {professionalLinkFields.map((field) => (
              <label key={field.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{field.label}</span>
                  {links[field.key] && (
                    <a
                      href={sanitizeUrl(links[field.key])}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "10px", color: "var(--olive)", display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                      <Globe size={11} /> Open
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={links[field.key]}
                  onChange={(event) =>
                    setLinks((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                />
              </label>
            ))}
          </div>

          <label className="top-skills-field">
            Top declared skills (comma separated)
            <textarea
              value={skillsInput}
              onChange={(event) => setSkillsInput(event.target.value)}
              placeholder="Python, Data analysis, Research writing, Communication, SQL"
              rows={3}
            />
            <small>Comma-separated skills will automatically sync across Jobs, Internships, Assessments, and Skill Map.</small>
          </label>

          <div className="links-skills-actions">
            <span>Saved skills immediately recalculate fit scores across placement opportunities.</span>
            <button type="submit" className="primary-button">
              Save links & skills
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Assessment-calculated skills"
        aside={
          <Link href="/assessment" className="action-link">
            {assessment ? "Retake quiz" : "Take quiz"} <ArrowRight size={15} />
          </Link>
        }
      >
        {assessment ? (
          <div className="assessment-profile-scores">
            {(["Technical", "Soft skills", "Other skills"] as const).map((category) => (
              <article key={category}>
                <span>{category}</span>
                <b>{assessment.categoryScores[category]}%</b>
                <small>
                  {assessment.categoryScores[category] >= 80
                    ? "Strong answer signal"
                    : assessment.categoryScores[category] >= 60
                    ? "Current answer signal"
                    : "Targeted practice needed"}
                </small>
              </article>
            ))}
            <p>
              Calculated from your latest scored quiz ({assessment.overall}% overall). These signals are considered alongside declared and verified evidence.
            </p>
          </div>
        ) : (
          <div className="assessment-empty">
            <p>
              No knowledge quiz has been completed yet. Take the assessment to calculate technical, soft, and other skill signals from your answers.
            </p>
            <Link href="/assessment/industry-readiness" className="small-outline">
              Start knowledge quiz <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ProfileDocuments() {
  const [docs, setDocs] = useState<ProfileDocumentItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<ProfileDocumentItem["category"]>("Academic Record");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState<string | undefined>(undefined);
  const [uploadedFileSize, setUploadedFileSize] = useState("210 KB");

  useEffect(() => {
    setDocs(getProfileDocuments());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${Math.round(file.size / 1024)} KB`);
      const reader = new FileReader();
      reader.onload = () => setUploadedFileData(reader.result as string);
      reader.readAsDataURL(file);
      if (!newDocTitle.trim()) {
        setNewDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleAddDoc = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc = addProfileDocument({
      title: newDocTitle.trim(),
      category: newDocCategory,
      fileName: uploadedFileName || `${newDocTitle.trim().replace(/\s+/g, "_")}.pdf`,
      fileSize: uploadedFileSize,
      fileDataUrl: uploadedFileData,
      verified: true,
    });

    setDocs(getProfileDocuments());
    setNewDocTitle("");
    setUploadedFileName("");
    setUploadedFileData(undefined);
    setShowUpload(false);

    try {
      await api.profile.addDocument(newDoc.title);
    } catch {}

    toast.success(`Uploaded and registered: ${newDoc.title}`);
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    deleteProfileDocument(id);
    setDocs(getProfileDocuments());
    try {
      await api.profile.deleteDocument(id);
    } catch {}
    toast.info(`Removed document "${title}".`);
  };

  return (
    <div className="profile-stack">
      <SectionCard
        title="Academic and supporting documents"
        aside={
          <button
            type="button"
            className="small-outline"
            onClick={() => setShowUpload((c) => !c)}
          >
            {showUpload ? "Cancel" : "Upload document"}
          </button>
        }
      >
        {showUpload && (
          <form
            onSubmit={handleAddDoc}
            style={{
              marginBottom: "1.25rem",
              padding: "1rem",
              background: "var(--surface)",
              borderRadius: "8px",
              border: "1px solid var(--rule)",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Document title or description *
                <input
                  style={{ width: "100%", marginTop: "4px" }}
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Semester 5 Marksheet, AWS Certification, Identity Proof"
                  required
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                  Category
                  <select
                    style={{ width: "100%", marginTop: "4px" }}
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                  >
                    <option value="Academic Record">Academic Record</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Skill Evidence">Skill Evidence</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                  Select File from Device *
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    style={{ width: "100%", marginTop: "4px", fontSize: "11px" }}
                  />
                </label>
              </div>

              {uploadedFileName && (
                <small style={{ color: "var(--olive)", fontWeight: 600 }}>
                  ✓ Selected: {uploadedFileName} ({uploadedFileSize})
                </small>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <button type="submit" className="primary-button">
                  Upload & Register Document
                </button>
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="document-list">
          {docs.map((doc) => (
            <div key={doc.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto auto", gap: "10px", alignItems: "center" }}>
              <FileText size={18} style={{ color: "var(--olive)" }} />
              <div>
                <b>{doc.title}</b>
                <span>
                  {doc.category} · {doc.fileName} · {doc.fileSize} · {doc.uploadedAt}
                </span>
              </div>
              <StatusPill tone={doc.verified ? "olive" : "ochre"}>
                {doc.verified ? "Verified" : "Pending Review"}
              </StatusPill>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => downloadProfileDocument(doc)}
                  title="Download document"
                >
                  <Download size={13} />
                </button>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => void handleDeleteDoc(doc.id, doc.title)}
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {docs.length === 0 && (
            <EmptyPanel
              title="No documents uploaded"
              text="Upload your academic records, marksheets, and certifications to verify your profile."
            />
          )}
        </div>
      </SectionCard>

      <Notice
        title="Access and privacy"
        text="Documents are visible only according to your consent, application selection, and role-based institutional access rules."
      />
    </div>
  );
}

function ProfileResumes() {
  const [resumes, setResumes] = useState<ProfileResumeItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState("200 KB");

  useEffect(() => {
    setResumes(getProfileResumes());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${Math.round(file.size / 1024)} KB`);
      const reader = new FileReader();
      reader.onload = () => setFileData(reader.result as string);
      reader.readAsDataURL(file);
      if (!resumeTitle.trim()) {
        setResumeTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleAddResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTitle.trim()) return;

    addProfileResume(
      resumeTitle.trim(),
      fileName || `${resumeTitle.trim().replace(/\s+/g, "_")}.pdf`,
      fileSize,
      fileData
    );

    setResumes(getProfileResumes());
    setResumeTitle("");
    setFileName("");
    setFileData(undefined);
    setShowUploadModal(false);

    toast.success(`Uploaded new resume: ${resumeTitle.trim()}`);
  };

  const handleSetPrimary = (id: string, title: string) => {
    setPrimaryResume(id);
    setResumes(getProfileResumes());
    toast.success(`"${title}" is now your primary resume.`);
  };

  const handleDelete = (id: string, title: string) => {
    deleteProfileResume(id);
    setResumes(getProfileResumes());
    toast.info(`Deleted resume "${title}".`);
  };

  return (
    <div className="profile-stack">
      <SectionCard
        title="Resume versions"
        aside={
          <button
            type="button"
            className="small-outline"
            onClick={() => setShowUploadModal((c) => !c)}
          >
            {showUploadModal ? "Cancel" : "Upload new version"}
          </button>
        }
      >
        {showUploadModal && (
          <form
            onSubmit={handleAddResume}
            style={{
              marginBottom: "16px",
              padding: "14px",
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Resume Version Label *
                <input
                  style={{ width: "100%", marginTop: "4px" }}
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g. Technical Systems Resume, Data Science Focused Resume"
                  required
                />
              </label>

              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Select Resume File from Device *
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ width: "100%", marginTop: "4px", fontSize: "11px" }}
                />
              </label>

              {fileName && (
                <small style={{ color: "var(--olive)", fontWeight: 600 }}>
                  ✓ Selected: {fileName} ({fileSize})
                </small>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button type="submit" className="primary-button">
                  Upload Resume Version
                </button>
                <button
                  type="button"
                  className="small-outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="stack-md">
          {resumes.map((res) => (
            <div
              key={res.id}
              className="attached-file-row"
              style={{
                borderLeft: res.isPrimary ? "4px solid var(--olive)" : undefined,
              }}
            >
              <div className="attached-file-info">
                <FileText size={22} style={{ color: res.isPrimary ? "var(--olive)" : "var(--slate)" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <b>{res.title}</b>
                    {res.isPrimary && <StatusPill tone="olive">Primary</StatusPill>}
                  </div>
                  <span>
                    {res.fileName} · {res.fileSize} · Uploaded {res.uploadedAt} · Used in {res.usedInAppsCount} application(s)
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {!res.isPrimary && (
                  <button
                    type="button"
                    className="small-outline"
                    onClick={() => handleSetPrimary(res.id, res.title)}
                    title="Make this the default resume"
                  >
                    Make Primary
                  </button>
                )}
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => downloadProfileResume(res)}
                  style={{ padding: "6px 10px", fontSize: "11px" }}
                  title="Download resume"
                >
                  <Download size={13} /> Download
                </button>
                {!res.isPrimary && (
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => handleDelete(res.id, res.title)}
                    title="Delete resume version"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Application usage rules">
        <p className="body-copy">
          Your primary resume is automatically pre-selected when applying for opportunities. Selecting a tailored resume during application attaches that snapshot permanently to the specific application record.
        </p>
      </SectionCard>
    </div>
  );
}

function ProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettingsState>(getProfileSettings);

  const toggleSetting = (key: keyof ProfileSettingsState, label: string) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveProfileSettings(updated);
    toast.success(`${label} preference updated.`);
  };

  const handleExportData = () => {
    const exportData = {
      student: "Anaya Sharma",
      studentId: "STU-102417",
      institution: "SIH Partner Institution",
      batch: "Batch 2028",
      program: "Computer Science & Engineering",
      cgpa: "8.14",
      declaredSkills: getDeclaredSkills(),
      contact: {
        phone: localStorage.getItem("sih-connect-profile-phone") || "9812345510",
        email: localStorage.getItem("sih-connect-profile-email") || "anaya.sharma@example.edu",
        links: JSON.parse(localStorage.getItem("sih-connect-professional-links") || "{}"),
      },
      documents: getProfileDocuments(),
      resumes: getProfileResumes(),
      applications: getStudentApplications(),
      offers: getStudentOffers(),
      placement: getPlacementStatus(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SIH_Connect_Student_Profile_Export_Anaya_Sharma.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Student profile data exported successfully!");
  };

  const PreferenceToggle = ({
    enabled,
    onToggle,
    label,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      className={`preference-toggle ${enabled ? "is-on" : "is-off"}`}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
    >
      <span>{enabled ? "On" : "Off"}</span>
      <i />
    </button>
  );

  return (
    <div className="profile-stack">
      <SectionCard title="Profile preferences">
        <div className="setting-row">
          <div>
            <b>Recruiter profile visibility</b>
            <span>Authorised recruiters may view approved profile evidence and skill match data.</span>
          </div>
          <PreferenceToggle
            enabled={settings.recruiterProfileVisibility}
            onToggle={() =>
              toggleSetting("recruiterProfileVisibility", "Recruiter profile visibility")
            }
            label="Toggle recruiter profile visibility"
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Institution & mentor visibility</b>
            <span>Allow department faculty advisors and career mentors to access verified academic records.</span>
          </div>
          <PreferenceToggle
            enabled={settings.institutionProfileVisibility}
            onToggle={() =>
              toggleSetting("institutionProfileVisibility", "Institution visibility")
            }
            label="Toggle institution profile visibility"
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Application & recruitment notifications</b>
            <span>Receive instant updates when your stage moves from Screening to Interview or Offer.</span>
          </div>
          <PreferenceToggle
            enabled={settings.applicationNotifications}
            onToggle={() =>
              toggleSetting("applicationNotifications", "Application notifications")
            }
            label="Toggle application notifications"
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Email alerts & deadline warnings</b>
            <span>Receive alerts for opportunities closing within 7 days.</span>
          </div>
          <PreferenceToggle
            enabled={settings.emailAlerts}
            onToggle={() => toggleSetting("emailAlerts", "Email alerts")}
            label="Toggle email alerts"
          />
        </div>
      </SectionCard>

      <SectionCard title="Data Privacy, Consent & Export">
        <p className="body-copy">
          Consent, access logs, and student data retention are managed under institutional privacy policies. You can export a full copy of your portfolio, application snapshots, and credentials.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            className="small-outline"
            onClick={handleExportData}
          >
            <Download size={14} /> Export My Complete Profile Data (JSON)
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

export function SkillMapPage({ focus = "industries" }: { focus?: "industries" | "roles" }) {
  const labels = { industries: "Industry alignment", roles: "Role alignment" };
  const scoredContent = focus === "industries" ? studentSkillMaps.industries : studentSkillMaps.roles;
  const declaredSkills = declaredSkillsFromStorage();
  const assessment = loadLatestAssessmentResult();
  const skillComparison = focus === "industries" ? [{ skill: "Python", target: "Core applied-systems requirement", current: "Verified coursework evidence", state: "Aligned" }, { skill: "Data analysis", target: "Core applied-systems requirement", current: "Declared + assessment signal", state: "Aligned" }, { skill: "SQL", target: "Preferred requirement", current: "Learning gap identified", state: "Developing" }, { skill: "Presentation", target: "Supporting communication requirement", current: "Evidence not yet attached", state: "Build evidence" }] : [{ skill: "Python", target: "Data-operations role requirement", current: "Verified coursework evidence", state: "Aligned" }, { skill: "Research writing", target: "Research-operations role requirement", current: "Verified project evidence", state: "Aligned" }, { skill: "SQL", target: "Preferred data-operations requirement", current: "Learning gap identified", state: "Developing" }, { skill: "User research", target: "Product-review role requirement", current: "No project evidence yet", state: "Build evidence" }];

  return <StudentLayout><PageHeader eyebrow="Skill map" title={labels[focus]} description="A transparent view of how your verified profile evidence, declared skills, and answer-calculated assessment signals compare with published requirements." /><div className="skill-map-layout"><section className="map-main"><nav className="subnav"><Link href="/skill-map/industries" className={focus === "industries" ? "subnav-link subnav-active" : "subnav-link"}>Industries</Link><Link href="/skill-map/roles" className={focus === "roles" ? "subnav-link subnav-active" : "subnav-link"}>Job roles</Link></nav><SectionCard title="Skill-by-skill comparison" aside={<Link href="/portfolio" className="action-link">Review portfolio <ArrowRight size={15} /></Link>}><div className="skill-comparison-list"><div className="skill-comparison-head"><span>Skill</span><span>Target requirement</span><span>Your current evidence</span><span>Position</span></div>{skillComparison.map((item) => <div className="skill-comparison-row" key={item.skill}><b>{item.skill}</b><span>{item.target}</span><span>{item.current}</span><i className={item.state === "Aligned" ? "comparison-aligned" : item.state === "Developing" ? "comparison-developing" : "comparison-build"}>{item.state}</i></div>)}</div><p className="skill-comparison-note">Use this comparison to decide which portfolio evidence to review, improve, or add before pursuing a pathway.</p></SectionCard><SectionCard title={labels[focus]} aside={<StatusPill>Evidence-led analysis</StatusPill>}><div className="map-list map-analysis-list">{scoredContent.map((item) => <article key={item.title} className="map-analysis-card"><div className="map-analysis-overview"><div><span className="analysis-label">{focus === "industries" ? "Industry pathway" : "Role pathway"}</span><h3>{item.title}</h3><p>{item.note}</p></div><div className="map-score"><b>{item.score}%</b><span>current alignment</span><ProgressBar value={item.score} /></div></div><div className="map-analysis-evidence"><span>Evidence basis</span><p>{item.evidence}</p></div><div className="map-analysis-grid"><div><span>Current strengths</span><div className="analysis-chip-row">{item.strengths.map((strength) => <i key={strength}>{strength}</i>)}</div></div><div><span>Priority gaps</span><div className="analysis-chip-row analysis-gap-row">{item.gaps.map((gap) => <i key={gap}>{gap}</i>)}</div></div></div><div className="map-analysis-next"><span>Recommended next action</span><p>{item.nextAction}</p></div></article>)}</div></SectionCard></section><aside className="map-aside"><img src={studentSkillMap} alt="Abstract student skill mapping illustration" /><SectionCard title="Declared profile evidence"><div className="skill-map-evidence"><span>These self-declared skills are included alongside verified evidence and answer-calculated assessment signals when the matching service calculates alignment.</span><div className="declared-skill-list">{declaredSkills.map((skill) => <span key={skill} className="declared-skill">{skill}<button type="button">×</button></span>)}</div><Link href="/profile" className="action-link">Update declared skills <ArrowRight size={15} /></Link></div></SectionCard><SectionCard title="Latest quiz signals">{assessment ? <div className="quiz-map-signals">{(["Technical", "Soft skills", "Other skills"] as const).map((category) => <div key={category}><span>{category}</span><b>{assessment.categoryScores[category]}%</b></div>)}<Link href={`/assessment/${assessment.assessmentId}/results`} className="action-link">Review calculated result <ArrowRight size={15} /></Link></div> : <div className="skill-map-evidence"><span>Complete the knowledge quiz to add answer-calculated technical, soft, and other skill signals.</span><Link href="/assessment/industry-readiness" className="action-link">Start quiz <ArrowRight size={15} /></Link></div>}</SectionCard><SectionCard title="How this is calculated"><p className="body-copy">Scores compare verified skills, declared profile evidence, academic evidence, answer-calculated quiz signals, published requirements, and industry demand. They do not replace eligibility decisions.</p><Link href="/portfolio" className="action-link">Review portfolio evidence <ArrowRight size={15} /></Link></SectionCard></aside></div></StudentLayout>;
}
