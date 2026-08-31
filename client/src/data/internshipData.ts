// Scalable internship opportunities, dynamic fit calculation, persistent applications, engagement logs, and completion records
import { getDeclaredSkills, isSkillMatched } from "./assessmentData";
import { downloadAttachedFile, AttachedFile } from "./applicationData";

export interface InternshipMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: "Complete" | "In progress" | "Upcoming";
  completedDate?: string;
}

export interface InternshipMentor {
  name: string;
  role: string;
  organization: string;
  status: string;
}

export interface InternshipOpportunity {
  id: string;
  title: string;
  org: string;
  mode: string;
  deliveryMode: "hybrid" | "on-campus" | "remote";
  location: string;
  close: string; // "Closes 04 Sep 2026"
  closeDate: string; // "2026-09-04"
  interest: string;
  status: "Eligible" | "Review profile" | "Closed";
  required: string[];
  preferred: string[];
  summary: string;
  duration: string; // e.g. "8 weeks · Full-time"
  stipend?: string;
  mentors: InternshipMentor[];
  milestones: InternshipMilestone[];
}

export interface InternshipApplication {
  id: string;
  internshipId: string;
  internshipTitle: string;
  internshipOrg: string;
  appliedAt: string; // ISO date string
  status: "Application Under Review" | "Selected" | "Engagement Active" | "Completed" | "Withdrawn";
  note: string;
  resumeFileName?: string;
  resumeDataUrl?: string;
  attachedFiles: AttachedFile[];
  skillFitScore: number;
}

export interface InternshipWorkLog {
  id: string;
  date: string;
  hours: string;
  summary: string;
  blockers?: string;
  milestoneId?: string;
}

export interface InternshipEngagementState {
  internshipId: string;
  milestones: InternshipMilestone[];
  progressPercent: number;
  workLogs: InternshipWorkLog[];
  reportUploaded?: boolean;
  reportFileName?: string;
  reportFileDataUrl?: string;
  reportUploadedAt?: string;
  certificateIssued?: boolean;
  certificateId?: string;
  certificateDate?: string;
}

export const internshipOpportunities: InternshipOpportunity[] = [
  {
    id: "data-practice",
    title: "Data Practice & Applied Systems Internship",
    org: "Northstar Systems",
    mode: "Hybrid · Bengaluru",
    deliveryMode: "hybrid",
    location: "Bengaluru",
    close: "Closes 04 Sep 2026",
    closeDate: "2026-09-04",
    interest: "Applied systems",
    status: "Eligible",
    required: ["Python", "Data Analysis", "Communication"],
    preferred: ["SQL", "Machine Learning"],
    summary:
      "Work with structured enterprise datasets, clean telemetry streams, design baseline predictive notebooks, and author verified analytical evidence briefs.",
    duration: "8 weeks · Hybrid",
    stipend: "₹35,000 / month",
    mentors: [
      { name: "Neeraj Patel", role: "Principal Data Engineer", organization: "Northstar Systems", status: "Assigned" },
      { name: "Dr. Meera Iyer", role: "Academic Mentor", organization: "SIH Partner Institution", status: "Assigned" },
    ],
    milestones: [
      { id: "m1", title: "Orientation and Data Access Provisioning", dueDate: "06 Sep", status: "Complete", completedDate: "06 Sep" },
      { id: "m2", title: "Telemetry Pipeline Evidence & Review Note", dueDate: "20 Sep", status: "In progress" },
      { id: "m3", title: "Final Capstone Report, Reflection & Presentation", dueDate: "28 Oct", status: "Upcoming" },
    ],
  },
  {
    id: "research-ops",
    title: "Research Operations & Evidence Associate",
    org: "Mosaic Health Labs",
    mode: "On campus · Chandigarh",
    deliveryMode: "on-campus",
    location: "Chandigarh",
    close: "Closes 02 Sep 2026",
    closeDate: "2026-09-02",
    interest: "Research operations",
    status: "Eligible",
    required: ["Research Writing", "Documentation", "Communication"],
    preferred: ["Data Analysis", "Python", "Presentation"],
    summary:
      "Contribute to systematic evidence reviews, audit protocol compliance, structure experimental trials, and prepare stakeholder-ready research reports.",
    duration: "10 weeks · On campus",
    stipend: "₹28,000 / month",
    mentors: [
      { name: "Dr. Alok Verma", role: "Lead Research Scientist", organization: "Mosaic Health Labs", status: "Assigned" },
      { name: "Prof. S. Natarajan", role: "Faculty Advisor", organization: "SIH Partner Institution", status: "Assigned" },
    ],
    milestones: [
      { id: "m1", title: "Protocol Synthesis & Baseline Review", dueDate: "08 Sep", status: "In progress" },
      { id: "m2", title: "Trial Telemetry Audit & Documentation", dueDate: "28 Sep", status: "Upcoming" },
      { id: "m3", title: "Comprehensive Clinical Evidence Report", dueDate: "25 Oct", status: "Upcoming" },
    ],
  },
  {
    id: "product-observation",
    title: "Digital Product Strategy & User Research Cohort",
    org: "Tern & Co.",
    mode: "Remote",
    deliveryMode: "remote",
    location: "Remote",
    close: "Closes 06 Sep 2026",
    closeDate: "2026-09-06",
    interest: "Digital product",
    status: "Eligible",
    required: ["Product Thinking", "Writing", "User Research"],
    preferred: ["Data Analysis", "Figma", "Analytics"],
    summary:
      "Observe product design sprints, translate user interview findings into functional user stories, and formulate UX telemetry evidence briefs.",
    duration: "6 weeks · Remote",
    stipend: "₹30,000 / month",
    mentors: [
      { name: "Tara Menon", role: "Director of Product", organization: "Tern & Co.", status: "Assigned" },
    ],
    milestones: [
      { id: "m1", title: "User Journey Friction Discovery", dueDate: "10 Sep", status: "Upcoming" },
      { id: "m2", title: "Product Requirement Brief & Prototyping", dueDate: "26 Sep", status: "Upcoming" },
      { id: "m3", title: "Final Evaluation & Presentation", dueDate: "18 Oct", status: "Upcoming" },
    ],
  },
  {
    id: "cloud-systems",
    title: "Cloud Infrastructure & Platform Engineering Internship",
    org: "Apex Cloud Technologies",
    mode: "Hybrid · Hyderabad",
    deliveryMode: "hybrid",
    location: "Hyderabad",
    close: "Closes 12 Sep 2026",
    closeDate: "2026-09-12",
    interest: "Cloud systems",
    status: "Eligible",
    required: ["Python", "Git", "System Design"],
    preferred: ["Docker", "Linux", "SQL"],
    summary:
      "Assist platform engineering teams in deploying containerized microservices, setting up monitoring dashboards, and automating CI/CD pipelines.",
    duration: "12 weeks · Hybrid",
    stipend: "₹40,000 / month",
    mentors: [
      { name: "Karthik Raghavan", role: "Staff DevOps Architect", organization: "Apex Cloud", status: "Assigned" },
    ],
    milestones: [
      { id: "m1", title: "Infrastructure Setup & Security Scoping", dueDate: "15 Sep", status: "Upcoming" },
      { id: "m2", title: "Microservice Containerization & Testing", dueDate: "10 Oct", status: "Upcoming" },
      { id: "m3", title: "CI/CD Deployment Benchmark", dueDate: "05 Nov", status: "Upcoming" },
    ],
  },
];

const INTERNSHIP_APPS_KEY = "sih-connect-internship-applications";
const INTERNSHIP_ENGAGEMENT_KEY = "sih-connect-internship-engagement";

/**
 * Calculates a dynamic, weighted profile skill fit percentage for an internship.
 * Required skills carry a weight of 2.5x, while preferred skills carry 1.0x.
 */
export function calculateInternshipSkillFit(
  internship: InternshipOpportunity,
  userSkills?: string[]
): {
  matchPercent: number;
  matchedRequired: string[];
  matchedPreferred: string[];
  missingRequired: string[];
  totalSkillsCount: number;
} {
  const declared = userSkills || getDeclaredSkills();
  const matchedRequired = internship.required.filter((s) => isSkillMatched(s, declared));
  const matchedPreferred = internship.preferred.filter((s) => isSkillMatched(s, declared));
  const missingRequired = internship.required.filter((s) => !isSkillMatched(s, declared));

  const totalRequiredWeight = internship.required.length * 2.5;
  const totalPreferredWeight = internship.preferred.length * 1.0;
  const totalMaxScore = totalRequiredWeight + totalPreferredWeight;

  const earnedRequiredScore = matchedRequired.length * 2.5;
  const earnedPreferredScore = matchedPreferred.length * 1.0;
  const earnedTotalScore = earnedRequiredScore + earnedPreferredScore;

  let matchPercent = 45; // baseline minimum institutional participation score
  if (totalMaxScore > 0) {
    const rawPercent = Math.round((earnedTotalScore / totalMaxScore) * 100);
    // Smooth to a realistic range (45% - 98%)
    matchPercent = Math.min(98, Math.max(45, rawPercent));
  }

  return {
    matchPercent,
    matchedRequired,
    matchedPreferred,
    missingRequired,
    totalSkillsCount: internship.required.length + internship.preferred.length,
  };
}

/**
 * Calculates deadline urgency info relative to 2026-08-31 / system date.
 */
export function getInternshipDeadlineInfo(closeDateStr: string) {
  const projectNow = new Date("2026-08-31T00:00:00Z").getTime();
  const targetDate = new Date(closeDateStr + "T23:59:59Z").getTime();
  const diffDays = Math.ceil((targetDate - projectNow) / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays >= 0 && diffDays <= 7;
  const isPast = diffDays < 0;

  let badgeText = "";
  if (isPast) {
    badgeText = "Application closed";
  } else if (diffDays === 0) {
    badgeText = "Closes today!";
  } else if (diffDays === 1) {
    badgeText = "1 day left!";
  } else {
    badgeText = `${diffDays} days left!`;
  }

  return {
    diffDays,
    isUrgent,
    isPast,
    badgeText,
  };
}

export function getInternshipApplications(): InternshipApplication[] {
  try {
    const raw = localStorage.getItem(INTERNSHIP_APPS_KEY);
    if (!raw) {
      // Default: 1 application for Data Practice Internship
      const defaultApps: InternshipApplication[] = [
        {
          id: "app-data-practice-01",
          internshipId: "data-practice",
          internshipTitle: "Data Practice & Applied Systems Internship",
          internshipOrg: "Northstar Systems",
          appliedAt: "2026-08-20T10:30:00Z",
          status: "Selected",
          note: "Applied systems alignment with verified Python and Data analysis skills.",
          resumeFileName: "Anaya_Sharma_Technical_Resume.pdf",
          attachedFiles: [
            { name: "Semester_4_Transcript.pdf", size: "245 KB", type: "application/pdf" },
          ],
          skillFitScore: 88,
        },
      ];
      localStorage.setItem(INTERNSHIP_APPS_KEY, JSON.stringify(defaultApps));
      return defaultApps;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInternshipApplications(apps: InternshipApplication[]): void {
  try {
    localStorage.setItem(INTERNSHIP_APPS_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error("Failed to save internship applications:", err);
  }
}

export function applyToInternship(
  internship: InternshipOpportunity,
  note: string,
  resumeFile?: { name: string; dataUrl?: string },
  attachedFiles: AttachedFile[] = [],
  skillFitScore = 85
): InternshipApplication {
  const apps = getInternshipApplications();
  const existingIndex = apps.findIndex((a) => a.internshipId === internship.id);

  const newApp: InternshipApplication = {
    id: `iapp-${internship.id}-${Date.now()}`,
    internshipId: internship.id,
    internshipTitle: internship.title,
    internshipOrg: internship.org,
    appliedAt: new Date().toISOString(),
    status: "Selected",
    note,
    resumeFileName: resumeFile?.name || "Anaya_Sharma_Technical_Resume.pdf",
    resumeDataUrl: resumeFile?.dataUrl,
    attachedFiles,
    skillFitScore,
  };

  let updated: InternshipApplication[];
  if (existingIndex >= 0) {
    updated = [...apps];
    updated[existingIndex] = newApp;
  } else {
    updated = [newApp, ...apps];
  }

  saveInternshipApplications(updated);
  return newApp;
}

export function getInternshipEngagement(internshipId: string): InternshipEngagementState {
  try {
    const raw = localStorage.getItem(INTERNSHIP_ENGAGEMENT_KEY);
    const store: Record<string, InternshipEngagementState> = raw ? JSON.parse(raw) : {};

    if (store[internshipId]) {
      return store[internshipId];
    }

    const internship = internshipOpportunities.find((i) => i.id === internshipId) || internshipOpportunities[0];
    const defaultEngagement: InternshipEngagementState = {
      internshipId,
      milestones: internship.milestones,
      progressPercent: 42,
      workLogs: [
        {
          id: "log-1",
          date: "2026-08-25",
          hours: "6 hrs",
          summary: "Configured sandbox environment, verified dataset checksums, and established baseline telemetry queries.",
          milestoneId: "m1",
        },
      ],
      reportUploaded: false,
      certificateIssued: false,
    };

    store[internshipId] = defaultEngagement;
    localStorage.setItem(INTERNSHIP_ENGAGEMENT_KEY, JSON.stringify(store));
    return defaultEngagement;
  } catch {
    const internship = internshipOpportunities.find((i) => i.id === internshipId) || internshipOpportunities[0];
    return {
      internshipId,
      milestones: internship.milestones,
      progressPercent: 42,
      workLogs: [],
      reportUploaded: false,
      certificateIssued: false,
    };
  }
}

export function saveInternshipEngagement(engagement: InternshipEngagementState): void {
  try {
    const raw = localStorage.getItem(INTERNSHIP_ENGAGEMENT_KEY);
    const store: Record<string, InternshipEngagementState> = raw ? JSON.parse(raw) : {};
    store[engagement.internshipId] = engagement;
    localStorage.setItem(INTERNSHIP_ENGAGEMENT_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to save internship engagement:", err);
  }
}

export function addInternshipWorkLog(
  internshipId: string,
  summary: string,
  hours = "4 hrs",
  blockers = ""
): InternshipEngagementState {
  const engagement = getInternshipEngagement(internshipId);
  const newLog: InternshipWorkLog = {
    id: `log-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    hours,
    summary,
    blockers: blockers.trim() || undefined,
  };

  const updatedLogs = [newLog, ...engagement.workLogs];
  const updatedEngagement: InternshipEngagementState = {
    ...engagement,
    workLogs: updatedLogs,
  };

  saveInternshipEngagement(updatedEngagement);
  return updatedEngagement;
}

export function toggleInternshipMilestone(
  internshipId: string,
  milestoneId: string
): InternshipEngagementState {
  const engagement = getInternshipEngagement(internshipId);
  const updatedMilestones = engagement.milestones.map((m) => {
    if (m.id === milestoneId) {
      const isComplete = m.status === "Complete";
      return {
        ...m,
        status: isComplete ? ("In progress" as const) : ("Complete" as const),
        completedDate: isComplete ? undefined : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      };
    }
    return m;
  });

  const completeCount = updatedMilestones.filter((m) => m.status === "Complete").length;
  const progressPercent = Math.round((completeCount / updatedMilestones.length) * 100);

  const updatedEngagement: InternshipEngagementState = {
    ...engagement,
    milestones: updatedMilestones,
    progressPercent,
  };

  saveInternshipEngagement(updatedEngagement);
  return updatedEngagement;
}

export function uploadInternshipReport(
  internshipId: string,
  fileName: string,
  fileDataUrl?: string
): InternshipEngagementState {
  const engagement = getInternshipEngagement(internshipId);
  const updated: InternshipEngagementState = {
    ...engagement,
    reportUploaded: true,
    reportFileName: fileName,
    reportFileDataUrl: fileDataUrl,
    reportUploadedAt: new Date().toISOString(),
    certificateIssued: true,
    certificateId: `CERT-INT-${internshipId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    certificateDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  };

  saveInternshipEngagement(updated);
  return updated;
}
