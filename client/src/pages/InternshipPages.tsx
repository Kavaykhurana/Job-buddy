// Field Notes Institutional Workspace: centralized internship discovery, dynamic profile matching, persistent application tracking, milestone engagement logs, and verified completion reports.
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Handshake,
  MapPin,
  MessageSquareText,
  Milestone,
  Paperclip,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
  UserRoundCheck,
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
  Timeline,
} from "@/components/Ui";
import { getDeclaredSkills, isSkillMatched } from "@/data/assessmentData";
import { AttachedFile, downloadAttachedFile } from "@/data/applicationData";
import {
  addInternshipWorkLog,
  applyToInternship,
  calculateInternshipSkillFit,
  getInternshipApplications,
  getInternshipDeadlineInfo,
  getInternshipEngagement,
  InternshipApplication,
  internshipOpportunities,
  InternshipOpportunity,
  toggleInternshipMilestone,
  uploadInternshipReport,
} from "@/data/internshipData";
import "./InternshipPages.css";
import "./JobsAndApplications.css";

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="student">{children}</AppShell>;
}

function getInternship(id: string): InternshipOpportunity {
  return (
    internshipOpportunities.find((item) => item.id === id) ??
    internshipOpportunities[0]
  );
}

export function InternshipListPage() {
  const [query, setQuery] = useState("");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minFit, setMinFit] = useState<number>(0);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
    setApplications(getInternshipApplications());
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    internshipOpportunities.forEach((i) => {
      i.required.forEach((s) => set.add(s));
      i.preferred.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, []);

  const internshipsWithMeta = useMemo(() => {
    return internshipOpportunities
      .map((item) => {
        const skillFit = calculateInternshipSkillFit(item, userSkills);
        const deadline = getInternshipDeadlineInfo(item.closeDate);
        const isRecommended = skillFit.matchPercent >= 70;
        const isTopMatch = skillFit.matchPercent >= 88;
        const app = applications.find((a) => a.internshipId === item.id);
        return {
          ...item,
          skillFit,
          deadline,
          isRecommended,
          isTopMatch,
          application: app,
        };
      })
      .sort((a, b) => b.skillFit.matchPercent - a.skillFit.matchPercent);
  }, [userSkills, applications]);

  const recommendedCount = internshipsWithMeta.filter((i) => i.isRecommended).length;
  const closingSoonCount = internshipsWithMeta.filter((i) => i.deadline.isUrgent).length;
  const eligibleCount = internshipsWithMeta.filter((i) => i.status === "Eligible").length;
  const appliedCount = internshipsWithMeta.filter((i) => !!i.application).length;

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

  const filteredInternships = useMemo(() => {
    return internshipsWithMeta.filter((item) => {
      // 1. Keyword search
      if (query.trim()) {
        const searchable = `${item.title} ${item.org} ${item.location} ${item.mode} ${item.interest} ${item.summary} ${item.required.join(" ")} ${item.preferred.join(" ")}`.toLowerCase();
        if (!searchable.includes(query.trim().toLowerCase())) return false;
      }

      // 2. Quick filters
      if (selectedQuickFilters.includes("recommended") && !item.isRecommended) return false;
      if (selectedQuickFilters.includes("closingSoon") && !item.deadline.isUrgent) return false;
      if (selectedQuickFilters.includes("eligible") && item.status !== "Eligible") return false;
      if (selectedQuickFilters.includes("applied") && !item.application) return false;

      // 3. Delivery modes
      if (
        selectedDeliveryModes.length > 0 &&
        !selectedDeliveryModes.includes(item.deliveryMode)
      ) {
        return false;
      }

      // 4. Skills multi-filter
      if (selectedSkills.length > 0) {
        const matchesSkills = selectedSkills.every(
          (s) => item.required.includes(s) || item.preferred.includes(s)
        );
        if (!matchesSkills) return false;
      }

      // 5. Min Fit
      if (minFit > 0 && item.skillFit.matchPercent < minFit) {
        return false;
      }

      return true;
    });
  }, [
    internshipsWithMeta,
    query,
    selectedQuickFilters,
    selectedDeliveryModes,
    selectedSkills,
    minFit,
  ]);

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedQuickFilters.length +
    selectedDeliveryModes.length +
    selectedSkills.length +
    (minFit > 0 ? 1 : 0);

  return (
    <StudentLayout>
      <PageHeader
        eyebrow="Internships"
        title="Industry internship opportunities"
        description="Explore centralized internship opportunities with dynamically calculated profile fit, skill requirements, and verified milestone completion."
        meta={
          <span className="date-meta">
            {filteredInternships.length} VISIBLE OPPORTUNIT{filteredInternships.length === 1 ? "Y" : "IES"} ·{" "}
            {closingSoonCount} CLOSING SOON
          </span>
        }
      />

      {/* Profile Skills Indicator Strip */}
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
              Edit profile skills <ChevronRight size={13} />
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
          All Internships ({internshipsWithMeta.length})
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("recommended") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("recommended")}
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
        >
          <CheckCircle2 size={13} /> Eligible ({eligibleCount})
          {selectedQuickFilters.includes("eligible") && " ✓"}
        </button>
        <button
          type="button"
          className={`catalogue-filter-btn ${
            selectedQuickFilters.includes("applied") ? "toggle-active" : ""
          }`}
          onClick={() => toggleQuickFilter("applied")}
        >
          <BriefcaseBusiness size={13} /> My Applications ({appliedCount})
          {selectedQuickFilters.includes("applied") && " ✓"}
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
          {selectedQuickFilters.map((qf) => (
            <span key={qf} className="active-filter-chip">
              {qf === "recommended" && "Recommended (≥70%)"}
              {qf === "closingSoon" && "🔥 Closing Soon (≤7 Days)"}
              {qf === "eligible" && "Eligible"}
              {qf === "applied" && "Applied"}
              <button type="button" onClick={() => toggleQuickFilter(qf)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedDeliveryModes.map((dm) => (
            <span key={dm} className="active-filter-chip">
              Mode: {dm === "on-campus" ? "On campus" : dm.charAt(0).toUpperCase() + dm.slice(1)}
              <button type="button" onClick={() => toggleDeliveryMode(dm)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedSkills.map((sk) => (
            <span key={sk} className="active-filter-chip">
              Skill: {sk}
              <button type="button" onClick={() => toggleSkill(sk)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {minFit > 0 && (
            <span className="active-filter-chip">
              Min Fit: ≥{minFit}%
              <button type="button" onClick={() => setMinFit(0)}>
                <X size={12} />
              </button>
            </span>
          )}
          <button type="button" className="clear-all-filters-btn" onClick={resetAllFilters}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Internship Layout */}
      <div className="jobs-layout" style={{ marginTop: "16px" }}>
        <aside className="filter-rail">
          <div className="filter-title">
            <Filter size={16} /> Filter Internships
          </div>

          <div className="filter-group">
            <label className="filter-group-title" htmlFor="internship-filter-search">
              Keyword search
            </label>
            <input
              id="internship-filter-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Role, organization, skill, city"
            />
          </div>

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
                checked={selectedQuickFilters.includes("applied")}
                onChange={() => toggleQuickFilter("applied")}
              />
              My submitted applications
            </label>
          </div>

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

          <div className="filter-group">
            <label className="filter-group-title" htmlFor="internship-min-fit">
              Minimum Skill Fit
            </label>
            <select
              id="internship-min-fit"
              value={minFit}
              onChange={(e) => setMinFit(Number(e.target.value))}
            >
              <option value={0}>Any profile fit</option>
              <option value={50}>At least 50% fit</option>
              <option value={70}>At least 70% fit</option>
              <option value={85}>At least 85% fit</option>
            </select>
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
            onClick={resetAllFilters}
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search internships by role, organization, location, or skill"
            />
            {query ? (
              <button
                type="button"
                className="search-clear"
                onClick={() => setQuery("")}
              >
                <X size={15} />
              </button>
            ) : (
              <span className="search-summary">
                {filteredInternships.length} result{filteredInternships.length === 1 ? "" : "s"} available
              </span>
            )}
            <SlidersHorizontal size={17} />
          </div>

          <div className="internship-toolbar">
            <div>
              <BriefcaseBusiness size={16} />
              <span>Ranked dynamically by verified profile skills and requirements</span>
            </div>
            <Link href="/internships/matches" className="small-outline">
              View best matches <ArrowRight size={15} />
            </Link>
          </div>

          <div className="internship-list">
            {filteredInternships.map((internship) => (
              <article key={internship.id} className="internship-card">
                <div className="internship-card-main">
                  <div className="job-meta">
                    <StatusPill
                      tone={
                        internship.application
                          ? "olive"
                          : internship.skillFit.matchPercent >= 70
                          ? "ochre"
                          : "muted"
                      }
                    >
                      {internship.application ? "Applied" : internship.isRecommended ? "Recommended" : internship.status}
                    </StatusPill>
                    <span>{internship.interest}</span>
                    {internship.deadline.isUrgent && (
                      <span className="deadline-urgent-chip">
                        🔥 {internship.deadline.badgeText}
                      </span>
                    )}
                  </div>
                  <h2>{internship.title}</h2>
                  <p>
                    {internship.org} · {internship.mode}
                    {internship.stipend && <span> · {internship.stipend}</span>}
                  </p>
                  <div className="tag-row">
                    {internship.required.map((skill) => {
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
                    {internship.preferred.map((skill) => {
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

                <div className="internship-card-side">
                  <b>{internship.skillFit.matchPercent}%</b>
                  <span>profile fit</span>
                  <small className={internship.deadline.isUrgent ? "deadline-urgent-text" : ""}>
                    {internship.deadline.isUrgent
                      ? `🔥 ${internship.deadline.badgeText}`
                      : internship.close}
                  </small>
                  {internship.application ? (
                    <Link
                      href={`/internships/${internship.id}/engagement/recorded`}
                      className="small-outline"
                      style={{ borderColor: "var(--olive)", color: "var(--olive-deep)" }}
                    >
                      Track Activity
                    </Link>
                  ) : (
                    <Link href={`/internships/${internship.id}`} className="small-outline">
                      Review
                    </Link>
                  )}
                </div>
              </article>
            ))}

            {filteredInternships.length === 0 && (
              <SectionCard title="No internships found">
                <div className="internship-empty-search">
                  <p>
                    No visible internship matches your selected filters. Try adjusting your keyword
                    or skill filters.
                  </p>
                  <button type="button" className="small-outline" onClick={resetAllFilters}>
                    Clear all filters
                  </button>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      <Notice
        title="Match explanation"
        text="Internship ranking dynamically evaluates verified profile skills, assessment signals, required/preferred criteria, and deadline urgency."
      />
    </StudentLayout>
  );
}

export function InternshipMatchesPage() {
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const rankedInternships = useMemo(() => {
    return internshipOpportunities
      .map((item) => {
        const skillFit = calculateInternshipSkillFit(item, userSkills);
        return {
          ...item,
          skillFit,
        };
      })
      .sort((a, b) => b.skillFit.matchPercent - a.skillFit.matchPercent);
  }, [userSkills]);

  return (
    <StudentLayout>
      <Link href="/internships" className="back-link">
        <ArrowLeft size={16} /> All internships
      </Link>
      <PageHeader
        eyebrow="Internship matching"
        title="Recommended internships"
        description="Your match ranking dynamically calculates how verified profile skills, career interests, and internship requirements fit together."
      />
      <div className="match-layout">
        <section className="stack-lg">
          <SectionCard title="Top ranked matches">
            <div className="internship-match-list">
              {rankedInternships.map((internship, index) => (
                <article key={internship.id}>
                  <span className="match-rank">0{index + 1}</span>
                  <div>
                    <StatusPill tone={index === 0 ? "ochre" : "olive"}>
                      {index === 0 ? "Best match" : "Strong match"}
                    </StatusPill>
                    <h3>{internship.title}</h3>
                    <p>
                      {internship.org} · {internship.interest} · {internship.mode}
                    </p>
                    <small>
                      {internship.skillFit.matchedRequired.length} of {internship.required.length} required
                      skills matched ({internship.skillFit.matchedRequired.join(", ") || "developing"}).
                    </small>
                  </div>
                  <div className="match-percent">
                    <b>{internship.skillFit.matchPercent}%</b>
                    <ProgressBar value={internship.skillFit.matchPercent} />
                  </div>
                  <Link href={`/internships/${internship.id}`} className="action-link">
                    Review <ArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>
        <aside className="stack-lg">
          <SectionCard title="What informs the match">
            <KeyValue label="Verified skills" value={String(userSkills.length)} />
            <KeyValue label="Assessment signal" value="Active & Synced" />
            <KeyValue label="Career interests" value="Applied systems" />
            <KeyValue label="Eligibility" value="Verified" />
            <Link href="/career-guidance" className="action-link">
              Open career guidance <ArrowRight size={15} />
            </Link>
          </SectionCard>
          <SectionCard title="Improve your match score">
            <p className="body-copy">
              Enrol in gap-aligned learning workshops or certifications to verify missing skills and
              increase your match fit percentage.
            </p>
            <Link href="/learning" className="small-outline full-button">
              Browse learning programs
            </Link>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function InternshipDetailPage({ id = "data-practice" }: { id?: string }) {
  const item = getInternship(id);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
    setApplications(getInternshipApplications());
  }, []);

  const fit = useMemo(() => calculateInternshipSkillFit(item, userSkills), [item, userSkills]);
  const deadline = useMemo(() => getInternshipDeadlineInfo(item.closeDate), [item.closeDate]);
  const application = applications.find((a) => a.internshipId === item.id);

  return (
    <StudentLayout>
      <Link href="/internships" className="back-link">
        <ArrowLeft size={16} /> Internship opportunities
      </Link>
      <PageHeader
        eyebrow="Internship opportunity"
        title={item.title}
        description={`${item.org} · ${item.mode} · ${item.duration}`}
        meta={
          application ? (
            <StatusPill tone="olive">Applied ({application.status})</StatusPill>
          ) : (
            <StatusPill tone={fit.matchPercent >= 70 ? "ochre" : "olive"}>
              {fit.matchPercent >= 70 ? "Recommended" : item.status}
            </StatusPill>
          )
        }
      />
      <div className="internship-detail-layout">
        <section className="stack-lg">
          <SectionCard title="Internship context">
            <p className="internship-lead">{item.summary}</p>
            <div className="tag-row">
              <StatusPill>{item.interest}</StatusPill>
              {item.stipend && <span className="skill-tag">{item.stipend}</span>}
              <span className="skill-tag">Mentor-supported</span>
              <span className="skill-tag">Completion certificate eligible</span>
            </div>
          </SectionCard>

          <SectionCard title="Required skill evidence">
            <div className="internship-requirements">
              {item.required.map((skill) => {
                const matches = isSkillMatched(skill, userSkills);
                return (
                  <div key={skill}>
                    <b>{skill}</b>
                    <span>Required</span>
                    <StatusPill tone={matches ? "olive" : "muted"}>
                      {matches ? "Verified in profile" : "Gap skill"}
                    </StatusPill>
                  </div>
                );
              })}
              {item.preferred.map((skill) => {
                const matches = isSkillMatched(skill, userSkills);
                return (
                  <div key={skill}>
                    <b>{skill}</b>
                    <span>Preferred</span>
                    <StatusPill tone={matches ? "olive" : "ochre"}>
                      {matches ? "Verified in profile" : "Developing"}
                    </StatusPill>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Lifecycle once selected">
            <Timeline
              items={[
                {
                  label: "Apply and eligibility check",
                  date: application ? "Application submitted" : "Profile, documents, and fit are recorded",
                  state: application ? "complete" : "future",
                },
                {
                  label: "Industry selection & mentor assignment",
                  date: `${item.mentors[0].name} (${item.mentors[0].role})`,
                  state: application ? "complete" : "future",
                },
                {
                  label: "Engagement & milestone progress",
                  date: "Weekly progress logs, milestone checkoffs",
                  state: application ? "current" : "future",
                },
                {
                  label: "Completion & certificate",
                  date: "Report upload & verifiable completion certificate",
                  state: "future",
                },
              ]}
            />
          </SectionCard>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Your match & fit">
            <div className="internship-fit">
              <b>{fit.matchPercent}%</b>
              <span>calculated profile fit</span>
              <ProgressBar value={fit.matchPercent} />
            </div>
            <KeyValue label="Career interest" value={item.interest} />
            <KeyValue
              label="Application window"
              value={deadline.isUrgent ? `🔥 ${deadline.badgeText}` : item.close.replace("Closes ", "")}
            />
            {item.stipend && <KeyValue label="Stipend" value={item.stipend} />}

            {application ? (
              <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
                <Link
                  href={`/internships/${item.id}/engagement/recorded`}
                  className="primary-button full-button"
                >
                  Track Engagement Logs <ChevronRight size={15} />
                </Link>
                <Link
                  href={`/internships/${item.id}/completion`}
                  className="small-outline full-button"
                >
                  View Completion & Certificate
                </Link>
              </div>
            ) : (
              <Link
                href={`/internships/${item.id}/apply`}
                className="primary-button full-button"
                style={{ marginTop: "14px" }}
              >
                Apply to internship <ArrowRight size={16} />
              </Link>
            )}
          </SectionCard>

          <SectionCard title="Assigned mentors">
            {item.mentors.map((m) => (
              <div key={m.name} className="mentor-card">
                <UserRoundCheck size={18} />
                <div>
                  <b>{m.name}</b>
                  <span>
                    {m.role} · {m.organization}
                  </span>
                </div>
                <StatusPill tone="olive">{m.status}</StatusPill>
              </div>
            ))}
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function InternshipApplyPage({ id = "data-practice" }: { id?: string }) {
  const item = getInternship(id);
  const [, setLocation] = useLocation();
  const [note, setNote] = useState("");
  const [resumeName, setResumeName] = useState("Anaya_Sharma_Technical_Resume.pdf");
  const [resumeData, setResumeData] = useState<string | undefined>(undefined);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([
    { name: "Semester_4_Transcript.pdf", size: "245 KB", type: "application/pdf" },
  ]);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    setUserSkills(getDeclaredSkills());
  }, []);

  const fit = useMemo(() => calculateInternshipSkillFit(item, userSkills), [item, userSkills]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      const reader = new FileReader();
      reader.onload = () => setResumeData(reader.result as string);
      reader.readAsDataURL(file);
      toast.success(`Attached custom resume: ${file.name}`);
    }
  };

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: AttachedFile[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              size: `${Math.round(file.size / 1024)} KB`,
              type: file.type || "document",
              dataUrl: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
      toast.success(`Attached ${files.length} document(s).`);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleSubmit = () => {
    applyToInternship(
      item,
      note || "Application submitted with verified profile evidence.",
      { name: resumeName, dataUrl: resumeData },
      attachedFiles,
      fit.matchPercent
    );

    toast.success(`Application to ${item.title} submitted successfully!`, {
      description: "Your documents and profile match have been recorded with the recruiter and mentor.",
    });

    setLocation(`/internships/${item.id}/engagement/recorded`);
  };

  return (
    <StudentLayout>
      <Link href={`/internships/${item.id}`} className="back-link">
        <ArrowLeft size={16} /> Internship detail
      </Link>
      <PageHeader
        eyebrow="Internship application"
        title={`Apply to ${item.title}`}
        description="Submit your application with profile evidence, device documents, and an internship-specific statement."
        meta={<StatusPill tone="olive">Eligibility verified</StatusPill>}
      />
      <div className="internship-apply-layout">
        <section className="application-form">
          <section>
            <h2>Profile and interest match</h2>
            <div className="internship-profile-preview">
              <UserRoundCheck size={20} />
              <div>
                <b>Anaya Sharma</b>
                <span>
                  {item.interest} alignment · {fit.matchPercent}% calculated internship fit
                </span>
              </div>
              <StatusPill tone="olive">Eligible</StatusPill>
            </div>
          </section>

          {/* Primary Resume Upload */}
          <section style={{ marginTop: "16px" }}>
            <h2>Primary Resume Attachment</h2>
            <div className="attached-file-row">
              <div className="attached-file-info">
                <FileText size={20} style={{ color: "var(--olive)" }} />
                <div>
                  <b>{resumeName}</b>
                  <span>Selected as primary application resume</span>
                </div>
              </div>
              <label className="small-outline" style={{ cursor: "pointer", margin: 0 }}>
                Upload Custom Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={handleResumeUpload}
                />
              </label>
            </div>
          </section>

          {/* Supporting Documents Upload */}
          <section style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h2 style={{ margin: 0 }}>Supporting Documents & Portfolio Evidence</h2>
              <label className="small-outline" style={{ cursor: "pointer", margin: 0 }}>
                <Plus size={13} /> Attach File
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  style={{ display: "none" }}
                  onChange={handleMultiFileUpload}
                />
              </label>
            </div>

            <div className="attached-files-list">
              {attachedFiles.map((file) => (
                <div key={file.name} className="attached-file-row">
                  <div className="attached-file-info">
                    <Paperclip size={16} />
                    <div>
                      <b>{file.name}</b>
                      <span>{file.size}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => handleRemoveFile(file.name)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: "16px" }}>
            <h2>Internship Statement & Note</h2>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="State how your skill evidence and career interest connect to this internship."
            />
          </section>

          <div className="form-footer" style={{ marginTop: "20px" }}>
            <span>
              <CheckCircle2 size={16} /> Application, resume, uploaded documents, and fit score are
              saved together.
            </span>
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Submit internship application <Send size={15} />
            </button>
          </div>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Application context">
            <KeyValue label="Organisation" value={item.org} />
            <KeyValue label="Calculated Fit" value={`${fit.matchPercent}%`} />
            <KeyValue label="Interest alignment" value={item.interest} />
            <KeyValue label="Duration" value={item.duration} />
            <KeyValue label="Mentor support" value="Assigned upon selection" />
          </SectionCard>
          <Notice
            title="What happens next"
            text="Recruiter screening is followed by mentor onboarding, progress logging, and verifiable completion certification."
          />
        </aside>
      </div>
    </StudentLayout>
  );
}

export function InternshipEngagementPage({ id = "data-practice" }: { id?: string }) {
  const item = getInternship(id);
  const [engagement, setEngagement] = useState(getInternshipEngagement(item.id));
  const [workLogText, setWorkLogText] = useState("");
  const [hoursText, setHoursText] = useState("4 hrs");
  const [blockersText, setBlockersText] = useState("");

  useEffect(() => {
    setEngagement(getInternshipEngagement(item.id));
  }, [item.id]);

  const handleToggleMilestone = (milestoneId: string) => {
    const updated = toggleInternshipMilestone(item.id, milestoneId);
    setEngagement(updated);
    toast.success("Milestone status updated.");
  };

  const handleSaveWorkLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLogText.trim()) {
      toast.error("Please enter a summary of work completed.");
      return;
    }

    const updated = addInternshipWorkLog(item.id, workLogText.trim(), hoursText, blockersText);
    setEngagement(updated);
    setWorkLogText("");
    setBlockersText("");
    toast.success("Progress update saved successfully!", {
      description: "Your update has been recorded in the engagement log for mentor review.",
    });
  };

  return (
    <StudentLayout>
      <Link href="/internships" className="back-link">
        <ArrowLeft size={16} /> All internships
      </Link>
      <PageHeader
        eyebrow="Internship engagement"
        title={item.title}
        description={`${item.org} · Active engagement · ${item.duration}`}
        meta={<StatusPill tone="olive">Active Engagement</StatusPill>}
      />
      <div className="engagement-grid">
        <section className="stack-lg">
          <SectionCard title="Progress against milestones">
            <div className="engagement-progress">
              <div>
                <b>{engagement.progressPercent}%</b>
                <span>overall milestone completion</span>
              </div>
              <ProgressBar value={engagement.progressPercent} label="Current engagement" />
            </div>

            <div className="milestone-list">
              {engagement.milestones.map((m) => {
                const isComplete = m.status === "Complete";
                return (
                  <article
                    key={m.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleToggleMilestone(m.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isComplete}
                      onChange={() => {}}
                      style={{ cursor: "pointer", accentColor: "var(--olive-deep)" }}
                    />
                    <div>
                      <b>{m.title}</b>
                      <span>
                        {isComplete
                          ? `Completed on ${m.completedDate || m.dueDate}`
                          : `Due ${m.dueDate} · Click to mark complete`}
                      </span>
                    </div>
                    <StatusPill tone={isComplete ? "olive" : "ochre"}>
                      {isComplete ? "Complete" : "In progress"}
                    </StatusPill>
                  </article>
                );
              })}
            </div>
          </SectionCard>

          {/* Record Progress Update Form */}
          <SectionCard title="Record Progress Update">
            <form onSubmit={handleSaveWorkLog} style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                  Work Summary *
                  <input
                    value={workLogText}
                    onChange={(e) => setWorkLogText(e.target.value)}
                    placeholder="e.g. Implemented telemetry cleanup pipeline and verified dataset"
                    required
                  />
                </label>
                <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                  Hours
                  <input
                    value={hoursText}
                    onChange={(e) => setHoursText(e.target.value)}
                    placeholder="e.g. 5 hrs"
                  />
                </label>
              </div>

              <label style={{ fontSize: "11.5px", fontWeight: 700 }}>
                Blockers or Mentor Questions (optional)
                <input
                  value={blockersText}
                  onChange={(e) => setBlockersText(e.target.value)}
                  placeholder="e.g. Awaiting database credential rotation from infra team"
                />
              </label>

              <div className="section-actions" style={{ marginTop: "4px" }}>
                <button type="submit" className="primary-button">
                  Save progress update
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Work Log History */}
          <SectionCard title="Logged Engagement Updates">
            {engagement.workLogs.length > 0 ? (
              <div className="stack-md">
                {engagement.workLogs.map((log) => (
                  <div key={log.id} className="attached-file-row">
                    <div className="attached-file-info">
                      <Milestone size={18} style={{ color: "var(--olive)" }} />
                      <div>
                        <b>{log.summary}</b>
                        <span>
                          Recorded on {log.date} · {log.hours}
                          {log.blockers && ` · Note: ${log.blockers}`}
                        </span>
                      </div>
                    </div>
                    <StatusPill tone="olive">Recorded</StatusPill>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-copy">No progress updates recorded yet. Submit your first update above.</p>
            )}
          </SectionCard>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Assigned mentors">
            {item.mentors.map((m) => (
              <div key={m.name} className="mentor-card">
                <UserRoundCheck size={19} />
                <div>
                  <b>{m.name}</b>
                  <span>
                    {m.role} · {m.organization}
                  </span>
                </div>
                <StatusPill tone="olive">{m.status}</StatusPill>
              </div>
            ))}
            <Link href="/mentorship" className="action-link">
              Open mentorship <ArrowRight size={15} />
            </Link>
          </SectionCard>

          <SectionCard title="Completion & Evidence">
            <p className="body-copy">
              Upload your final internship report and view issued certificate records.
            </p>
            <Link
              href={`/internships/${item.id}/completion`}
              className="primary-button full-button"
            >
              View completion record <ArrowRight size={15} />
            </Link>
          </SectionCard>
        </aside>
      </div>
    </StudentLayout>
  );
}

export function InternshipCompletionPage({ id = "data-practice" }: { id?: string }) {
  const item = getInternship(id);
  const [engagement, setEngagement] = useState(getInternshipEngagement(item.id));
  const [showCertModal, setShowCertModal] = useState(false);
  const [uploadedReportName, setUploadedReportName] = useState(
    engagement.reportFileName || "Data_Practice_Internship_Final_Report.pdf"
  );
  const [uploadedReportData, setUploadedReportData] = useState<string | undefined>(
    engagement.reportFileDataUrl
  );

  useEffect(() => {
    setEngagement(getInternshipEngagement(item.id));
  }, [item.id]);

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedReportName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedReportData(dataUrl);
        const updated = uploadInternshipReport(item.id, file.name, dataUrl);
        setEngagement(updated);
        toast.success(`Uploaded "${file.name}"!`, {
          description: "Internship report verified. Official certificate is now issued.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadReport = () => {
    if (uploadedReportData) {
      const a = document.createElement("a");
      a.href = uploadedReportData;
      a.download = uploadedReportName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `JOB BUDDY INTERNSHIP REPORT RECEIPT\n\nInternship: ${item.title}\nOrganization: ${item.org}\nAuthor: Anaya Sharma\nStatus: Locally recorded; mentor verification pending\nDate: 2026-08-31`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/\s+/g, "_")}_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success("Downloaded internship report.");
  };

  const handleDownloadCertificate = () => {
    const certId = engagement.certificateId || "CERT-INT-NORTHSTAR-8819";
    const certContent = `JOB BUDDY INTERNSHIP COMPLETION DRAFT\n\n=======================================================\nStudent: ANAYA SHARMA\nProgram: ${item.title.toUpperCase()}\nOrganization: ${item.org.toUpperCase()}\n\nRecorded: ${engagement.certificateDate || "31 Aug 2026"}\nReference ID: ${certId}\nIndustry Mentor: ${item.mentors[0].name} (${item.mentors[0].organization})\nStatus: Draft record — institutional and mentor verification pending\n=======================================================`;

    const blob = new Blob([certContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, "_")}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Downloaded internship completion draft.");
  };

  const isReportUploaded = !!engagement.reportUploaded || !!uploadedReportData;

  return (
    <StudentLayout>
      <Link href={`/internships/${item.id}/engagement/recorded`} className="back-link">
        <ArrowLeft size={16} /> Internship engagement
      </Link>
      <PageHeader
        eyebrow="Internship completion"
        title="Completion record"
        description={`${item.title} · ${item.org}`}
        meta={
          isReportUploaded ? (
            <StatusPill tone="olive">Completed & Verified</StatusPill>
          ) : (
            <StatusPill tone="ochre">Report pending</StatusPill>
          )
        }
      />
      <div className="completion-record-grid">
        <section className="stack-lg">
          <SectionCard title="Completion checklist">
            <div className="completion-check-list">
              <div>
                <CheckCircle2 size={17} />
                <span>Required milestones</span>
                <StatusPill tone="olive">Complete</StatusPill>
              </div>
              <div>
                <CheckCircle2 size={17} />
                <span>Mentor feedback & evaluation</span>
                <StatusPill tone="olive">Recorded</StatusPill>
              </div>
              <div>
                <FileText size={17} />
                <span>Internship final report</span>
                <StatusPill tone={isReportUploaded ? "olive" : "ochre"}>
                  {isReportUploaded ? "Uploaded & Verified" : "Awaiting upload"}
                </StatusPill>
              </div>
              <div>
                <ClipboardCheck size={17} />
                <span>Completion certificate issuance</span>
                <StatusPill tone={isReportUploaded ? "olive" : "muted"}>
                  {isReportUploaded ? "Issued" : "Pending report"}
                </StatusPill>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Mentor feedback summary">
            <div className="feedback-summary">
              <Star size={18} />
              <div>
                <b>Strong evidence practice and dependable progress updates.</b>
                <p>
                  Industry mentor feedback from {item.mentors[0].name} is retained with the
                  engagement record and can be selected for portfolio evidence after completion.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <aside className="stack-lg">
          <SectionCard title="Completion evidence">
            {/* Upload Report Button / Card */}
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <label className="primary-button full-button" style={{ cursor: "pointer", textAlign: "center" }}>
                <Upload size={15} /> {isReportUploaded ? "Replace Internship Report" : "Upload Internship Report"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={handleReportUpload}
                />
              </label>

              {isReportUploaded && (
                <button
                  type="button"
                  className="small-outline full-button"
                  onClick={handleDownloadReport}
                >
                  <Download size={14} /> Download Submitted Report
                </button>
              )}
            </div>

            {/* View Certificate Status Button */}
            <button
              type="button"
              className="small-outline full-button"
              onClick={() => setShowCertModal(true)}
            >
              <Award size={15} /> View Certificate Status
            </button>
          </SectionCard>

          <Notice
            title="Portfolio readiness"
            text="After report upload and certificate issuance, this completion record and verified mentor achievements are automatically synced to your digital portfolio."
          />
        </aside>
      </div>

      {/* Certificate Status Modal */}
      {showCertModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
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
              maxWidth: "540px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={22} style={{ color: "var(--olive)" }} />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                  Internship Completion Certificate
                </h3>
              </div>
              <button
                type="button"
                className="file-remove-btn"
                onClick={() => setShowCertModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: "18px",
                border: "2px dashed var(--olive)",
                borderRadius: "10px",
                background: "var(--olive-wash)",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--olive-deep)",
                  letterSpacing: "0.06em",
                }}
              >
                Internship completion record (verification pending)
              </span>
              <h2 style={{ margin: "8px 0 4px", fontSize: "18px" }}>
                {item.title}
              </h2>
              <p style={{ margin: "0 0 10px", color: "var(--slate)", fontSize: "12px" }}>
                Awarded to <b>Anaya Sharma</b> by <b>{item.org}</b>
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--olive-deep)",
                }}
              >
                <span>ID: {engagement.certificateId || "CERT-INT-NORTHSTAR-8819"}</span>
                <span>·</span>
                <span>Issued: {engagement.certificateDate || "31 Aug 2026"}</span>
              </div>
            </div>

            <div className="stack-md">
              <KeyValue label="Host Organization" value={item.org} />
              <KeyValue label="Lead Mentor Signoff" value={item.mentors[0].name} />
              <KeyValue label="Verification Status" value="Pending institutional review" />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="small-outline"
                onClick={() => setShowCertModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleDownloadCertificate}
              >
                <Download size={15} /> Download Official Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
