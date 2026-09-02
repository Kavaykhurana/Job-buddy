// Scalable job and internship opportunities data, dynamic skill fit calculation, and urgency tracking.
import { getDeclaredSkills, isSkillMatched } from "./assessmentData";
import { loadRecruiterPostedJobs } from "./portalData";

export interface JobOpportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  deliveryMode: "hybrid" | "on-campus" | "remote";
  date: string; // e.g. "Closes 06 Sep 2026"
  closeDate: string; // ISO date e.g. "2026-09-06"
  status: "Eligible" | "Review profile" | "Closed";
  required: string[];
  preferred: string[];
  type: string;
  summary: string;
  salary?: string;
  department?: string;
}

export const jobOpportunities: JobOpportunity[] = [
  {
    id: "ai-studio",
    title: "Applied AI Capability Studio",
    organization: "Northstar Systems",
    location: "Hybrid · Bengaluru",
    deliveryMode: "hybrid",
    date: "Closes 04 Sep 2026",
    closeDate: "2026-09-04",
    status: "Eligible",
    required: ["Python", "Data Analysis", "Communication"],
    preferred: ["SQL", "Machine Learning"],
    type: "Structured opportunity",
    summary:
      "Support a cross-functional team by evaluating data-led workflows, designing baseline ML models, and presenting evidence-backed recommendations to engineering leads.",
    salary: "₹12,00,000 – ₹15,00,000 / year",
    department: "Applied AI & Engineering",
  },
  {
    id: "research-analyst",
    title: "Research Operations Associate",
    organization: "Mosaic Health Labs",
    location: "On campus · Chandigarh",
    deliveryMode: "on-campus",
    date: "Closes 02 Sep 2026",
    closeDate: "2026-09-02",
    status: "Eligible",
    required: ["Research Writing", "Documentation", "Communication"],
    preferred: ["Data Analysis", "Python", "Presentation"],
    type: "Structured opportunity",
    summary:
      "Contribute to clinical evidence review, reproducible data pipelines, structured documentation, and stakeholder-ready progress reports for healthcare innovation.",
    salary: "₹9,50,000 – ₹11,00,000 / year",
    department: "Clinical Research Ops",
  },
  {
    id: "product-review",
    title: "Digital Product Review Cohort",
    organization: "Tern & Co.",
    location: "Remote",
    deliveryMode: "remote",
    date: "Closes 06 Sep 2026",
    closeDate: "2026-09-06",
    status: "Eligible",
    required: ["Product Thinking", "Writing", "User Research"],
    preferred: ["Data Analysis", "Figma", "Analytics"],
    type: "Structured opportunity",
    summary:
      "Review product briefs, map user interaction telemetry, formulate hypothesis statements, and prepare concise evidence notes for multi-disciplinary product squads.",
    salary: "₹10,00,000 – ₹13,00,000 / year",
    department: "Product Strategy",
  },
  {
    id: "software-systems-eng",
    title: "Software Systems & Cloud Engineer",
    organization: "Apex Cloud Technologies",
    location: "Hybrid · Hyderabad",
    deliveryMode: "hybrid",
    date: "Closes 12 Sep 2026",
    closeDate: "2026-09-12",
    status: "Eligible",
    required: ["Python", "JavaScript", "React", "Git"],
    preferred: ["Docker", "SQL", "Linux", "System Design"],
    type: "Full-time placement",
    summary:
      "Build resilient microservices, scale event-driven API workflows, implement modern React frontend dashboards, and maintain containerized cloud architectures.",
    salary: "₹14,00,000 – ₹18,00,000 / year",
    department: "Platform Engineering",
  },
  {
    id: "data-infrastructure-assoc",
    title: "Data Infrastructure & Analytics Engineer",
    organization: "Quant Data Labs",
    location: "On campus · Pune",
    deliveryMode: "on-campus",
    date: "Closes 03 Sep 2026",
    closeDate: "2026-09-03",
    status: "Eligible",
    required: ["SQL", "Data Analysis", "Python"],
    preferred: ["Statistics", "Docker", "Critical Thinking"],
    type: "Full-time placement",
    summary:
      "Develop analytical query models, optimize ETL transformations across relational and distributed warehouses, and build automated verification checks for high-throughput metrics.",
    salary: "₹11,50,000 – ₹14,00,000 / year",
    department: "Data Engineering",
  },
];

// Calculate dynamic skill fit percentage based on matching user's declared profile skills
export function calculateJobSkillFit(
  job: JobOpportunity,
  userSkills: string[]
): {
  matchPercent: number;
  matchedRequired: string[];
  matchedPreferred: string[];
  missingRequired: string[];
  missingPreferred: string[];
} {
  const matchedRequired = job.required.filter((skill) => isSkillMatched(skill, userSkills));
  const matchedPreferred = job.preferred.filter((skill) => isSkillMatched(skill, userSkills));
  const missingRequired = job.required.filter((skill) => !isSkillMatched(skill, userSkills));
  const missingPreferred = job.preferred.filter((skill) => !isSkillMatched(skill, userSkills));

  const totalReq = job.required.length;
  const totalPref = job.preferred.length;

  if (totalReq === 0 && totalPref === 0) {
    return { matchPercent: 80, matchedRequired, matchedPreferred, missingRequired, missingPreferred };
  }

  // Weighted calculation: required skills have 2.5x weight of preferred skills
  const reqWeight = 2.5;
  const prefWeight = 1.0;
  const maxScore = totalReq * reqWeight + totalPref * prefWeight;
  const earnedScore = matchedRequired.length * reqWeight + matchedPreferred.length * prefWeight;

  let matchPercent = Math.round((earnedScore / maxScore) * 100);

  // If all required skills match, ensure score is at least 75%
  if (matchedRequired.length === totalReq && totalReq > 0) {
    matchPercent = Math.max(75, matchPercent);
  }

  // Minimum floor 20%
  matchPercent = Math.min(100, Math.max(20, matchPercent));

  return {
    matchPercent,
    matchedRequired,
    matchedPreferred,
    missingRequired,
    missingPreferred,
  };
}

// Calculate days remaining until job deadline relative to 2026-08-31 (or current runtime date)
export function getJobDeadlineInfo(closeDateStr: string): {
  daysLeft: number;
  isUrgent: boolean;
  isClosed: boolean;
  badgeText: string;
} {
  const referenceDate = new Date(2026, 7, 31); // 31 Aug 2026 in project scenario
  const targetDate = new Date(closeDateStr);

  const diffTime = targetDate.getTime() - referenceDate.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      isUrgent: false,
      isClosed: true,
      badgeText: "Closed",
    };
  }

  if (daysLeft === 0) {
    return {
      daysLeft: 0,
      isUrgent: true,
      isClosed: false,
      badgeText: "Closes today!",
    };
  }

  if (daysLeft <= 7) {
    return {
      daysLeft,
      isUrgent: true,
      isClosed: false,
      badgeText: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left!`,
    };
  }

  return {
    daysLeft,
    isUrgent: false,
    isClosed: false,
    badgeText: `Closes in ${daysLeft} days`,
  };
}

export function getJobOpportunities(): JobOpportunity[] {
  const postedJobs = loadRecruiterPostedJobs();
  const convertedPosted: JobOpportunity[] = postedJobs.map((job) => {
    const rawMode = (job.mode || "").toLowerCase();
    const deliveryMode: "hybrid" | "on-campus" | "remote" =
      rawMode.includes("remote") ? "remote"
      : rawMode.includes("campus") ? "on-campus"
      : "hybrid";

    const reqSkills = job.requiredSkills
      ? job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Communication"];
    const prefSkills = job.preferredSkills
      ? job.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      id: job.id,
      title: job.title,
      organization: job.organization || "Northstar Systems",
      location: job.location || (deliveryMode === "remote" ? "Remote" : `${job.mode || "Hybrid"} · Bengaluru`),
      deliveryMode,
      date: "Closes 18 Sep 2026",
      closeDate: "2026-09-18",
      status: (job.status === "Closed" ? "Closed" : "Eligible") as "Eligible" | "Review profile" | "Closed",
      required: reqSkills,
      preferred: prefSkills,
      type: "Published placement drive",
      summary: job.summary || job.eligibility || "Newly published industry role requirement with verified selection criteria.",
      salary: "₹12,00,000 – ₹16,00,000 / year",
      department: "Engineering & Applied Systems",
    };
  });

  const postedIds = new Set(convertedPosted.map((j) => j.id));
  const filteredDefault = jobOpportunities.filter((j) => !postedIds.has(j.id));
  return [...convertedPosted, ...filteredDefault];
}

export function getJobOpportunityById(id: string): JobOpportunity | undefined {
  return getJobOpportunities().find((j) => j.id === id);
}
