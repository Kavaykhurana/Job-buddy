// Field Notes Institutional Workspace: scoped client-side data for static UI demonstration only.
import { userLocalStorage as localStorage } from "@/lib/userStorage";
export type UserRole = "student" | "recruiter" | "institution" | "academician";

export const roleHome: Record<UserRole, string> = {
  student: "/",
  recruiter: "/recruiter",
  institution: "/institution",
  academician: "/academician",
};

export const roleNavigation: Record<UserRole, { label: string; href: string }[]> = {
  student: [
    { label: "Home", href: "/" },
    { label: "Jobs", href: "/jobs" },
    { label: "Assessment", href: "/assessment" },
    { label: "Skill Map", href: "/skill-map/industries" },
    { label: "Learning", href: "/learning" },
    { label: "Internships", href: "/internships" },
    { label: "Experiences", href: "/experiences" },
    { label: "Collaboration", href: "/collaboration" },
    { label: "My Season", href: "/season" },
    { label: "Offers", href: "/offers" },
    { label: "Placement", href: "/placement" },
    { label: "Profile", href: "/profile" },
    { label: "Events", href: "/events" },
    { label: "Calendar", href: "/calendar" },
    { label: "Schedule", href: "/schedule" },
  ],
  recruiter: [
    { label: "Overview", href: "/recruiter" },
    { label: "Opportunities", href: "/recruiter/opportunities" },
    { label: "Experiences", href: "/recruiter/experiences" },
    { label: "Internships", href: "/recruiter/internships" },
    { label: "Assessments", href: "/recruiter/assessments" },
    { label: "Candidates", href: "/recruiter/candidates" },
    { label: "Interviews", href: "/recruiter/interviews" },
    { label: "Skill Requirements", href: "/recruiter/skill-requirements" },
    { label: "Collaboration", href: "/recruiter/collaboration" },
    { label: "Analytics", href: "/recruiter/analytics" },
    { label: "Integrations", href: "/recruiter/integrations" },
  ],
  institution: [
    { label: "Overview", href: "/institution" },
    { label: "Student Readiness", href: "/institution/readiness" },
    { label: "Applications", href: "/institution/applications" },
    { label: "Interviews", href: "/institution/interviews" },
    { label: "Placement Status", href: "/institution/placement-status" },
    { label: "Skill Alignment", href: "/institution/skill-alignment" },
    { label: "Curriculum", href: "/institution/curriculum" },
    { label: "Analytics", href: "/institution/analytics" },
    { label: "Integrations", href: "/institution/integrations" },
    { label: "Policy Analytics", href: "/policy-analytics" },
  ],
  academician: [
    { label: "Overview", href: "/academician" },
    { label: "Student Skill Maps", href: "/academician/student-maps" },
    { label: "Learning Alignment", href: "/academician/learning-alignment" },
    { label: "Opportunities", href: "/academician/opportunities" },
    { label: "Training & FDPs", href: "/academician/training" },
    { label: "Events", href: "/academician/events" },
    { label: "Collaboration", href: "/academician/collaboration" },
    { label: "Profile", href: "/academician/profile" },
  ],
};

export const opportunities = [
  {
    id: "ai-studio",
    title: "Applied AI Capability Studio",
    organization: "Northstar Systems",
    location: "Hybrid · Bengaluru",
    date: "Closes 30 Aug",
    match: 84,
    status: "Eligible",
    required: ["Python", "Data Analysis", "Communication"],
    preferred: ["SQL", "Machine Learning"],
    type: "Structured opportunity",
    summary:
      "Support a cross-functional team by evaluating data-led workflows and presenting evidence-backed recommendations.",
  },
  {
    id: "research-analyst",
    title: "Research Operations Associate",
    organization: "Mosaic Health Labs",
    location: "On campus · Chandigarh",
    date: "Closes 02 Sep",
    match: 72,
    status: "Eligible",
    required: ["Research", "Documentation", "Teamwork"],
    preferred: ["Excel", "Presentation"],
    type: "Structured opportunity",
    summary:
      "Contribute to evidence review, structured documentation, and stakeholder-ready progress reports.",
  },
  {
    id: "product-review",
    title: "Digital Product Review Cohort",
    organization: "Tern & Co.",
    location: "Remote",
    date: "Closes 06 Sep",
    match: 61,
    status: "Review profile",
    required: ["Product Thinking", "Writing", "User Research"],
    preferred: ["Figma", "Analytics"],
    type: "Structured opportunity",
    summary:
      "Review product briefs, map user needs, and prepare concise evidence notes for a product team.",
  },
];

export function getPortalOpportunities(): typeof opportunities {
  try {
    const posted = loadRecruiterPostedJobs();
    const converted = posted.map((p) => ({
      id: p.id,
      title: p.title,
      organization: p.organization || "Northstar Systems",
      location: p.location || `${p.mode} · Bengaluru`,
      date: "Closes 18 Sep",
      match: 80,
      status: p.status === "Closed" ? "Closed" : "Eligible",
      required: p.requiredSkills ? p.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean) : ["Communication"],
      preferred: p.preferredSkills ? p.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      type: "Structured opportunity",
      summary: p.summary || p.eligibility || "Support placement workflows and technical execution.",
    }));
    const postedIds = new Set(converted.map((c) => c.id));
    return [...converted, ...opportunities.filter((o) => !postedIds.has(o.id))];
  } catch {
    return opportunities;
  }
}

export const applicationStages = ["Applied", "Shortlisted", "Attended", "Rejected", "Offers"];

export interface JobAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt?: string;
  content?: string;
}

export interface JobDraft {
  id: string;
  title: string;
  organization?: string;
  mode: string;
  location?: string;
  requiredSkills: string;
  preferredSkills: string;
  qualification: string;
  eligibility: string;
  stages: string;
  summary?: string;
  attachments?: JobAttachment[];
  updatedAt: string;
}

export type RecruiterPostedJob = {
  id: string;
  title: string;
  organization?: string;
  mode: string;
  location?: string;
  requiredSkills: string;
  preferredSkills: string;
  qualification: string;
  eligibility: string;
  stages: string;
  status: "Open" | "Draft" | "Closed" | "Review";
  postedAt: string;
  attachments?: JobAttachment[];
  summary?: string;
};

const INITIAL_DRAFTS: JobDraft[] = [
  {
    id: "draft-research-ops",
    title: "Research Operations Associate",
    organization: "Mosaic Health Labs",
    mode: "On campus",
    location: "Chandigarh",
    requiredSkills: "Research, Documentation, Teamwork",
    preferredSkills: "Excel, Presentation",
    qualification: "Degree in Health Sciences, Biotechnology, or relevant field",
    eligibility: "Minimum 65% aggregate; strong documentation & ethical research coursework.",
    stages: "Screening · Technical Discussion · Offer",
    summary: "Contribute to evidence review, structured documentation, and stakeholder-ready progress reports.",
    attachments: [
      {
        id: "att-seed-1",
        name: "Research_Ops_Job_Specification.pdf",
        size: "245 KB",
        type: "application/pdf",
        uploadedAt: "24 Aug 2026",
      },
    ],
    updatedAt: "24 Aug 2026",
  },
];

export function loadRecruiterJobDrafts(): JobDraft[] {
  try {
    const stored = localStorage.getItem("job-buddy-recruiter-job-drafts");
    if (!stored) {
      localStorage.setItem("job-buddy-recruiter-job-drafts", JSON.stringify(INITIAL_DRAFTS));
      return INITIAL_DRAFTS;
    }
    return JSON.parse(stored) as JobDraft[];
  } catch {
    return INITIAL_DRAFTS;
  }
}

export function saveRecruiterJobDraft(draft: JobDraft): JobDraft[] {
  const current = loadRecruiterJobDrafts();
  const existingIdx = current.findIndex((d) => d.id === draft.id);
  let next: JobDraft[];
  if (existingIdx !== -1) {
    next = [...current];
    next[existingIdx] = { ...draft, updatedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) };
  } else {
    next = [{ ...draft, updatedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }, ...current];
  }
  localStorage.setItem("job-buddy-recruiter-job-drafts", JSON.stringify(next));
  return next;
}

export function deleteRecruiterJobDraft(id: string): JobDraft[] {
  const current = loadRecruiterJobDrafts();
  const next = current.filter((d) => d.id !== id);
  localStorage.setItem("job-buddy-recruiter-job-drafts", JSON.stringify(next));
  return next;
}

export function getRecruiterJobDraft(id: string): JobDraft | undefined {
  const drafts = loadRecruiterJobDrafts();
  return drafts.find((d) => d.id === id);
}

export function loadRecruiterPostedJobs(): RecruiterPostedJob[] {
  try {
    const stored = localStorage.getItem("job-buddy-recruiter-posted-jobs");
    return stored ? (JSON.parse(stored) as RecruiterPostedJob[]) : [];
  } catch {
    return [];
  }
}

export function saveRecruiterPostedJob(job: RecruiterPostedJob): RecruiterPostedJob[] {
  const jobs = [job, ...loadRecruiterPostedJobs().filter((j) => j.id !== job.id)];
  localStorage.setItem("job-buddy-recruiter-posted-jobs", JSON.stringify(jobs));
  return jobs;
}

export interface CandidateRecord {
  id: string;
  name: string;
  email?: string;
  program: string;
  score: number;
  eligibility: "Eligible" | "Review" | "Needs review";
  stage: "Screening" | "Shortlisted" | "Interview Scheduled" | "Interviewed" | "Offer Extended" | "Rejected";
  skills: string[];
  shortlisted?: boolean;
  appliedDate?: string;
  opportunityTitle?: string;
  avatar?: string;
  interviewDetails?: {
    date: string;
    time: string;
    mode: string;
    location: string;
    evaluators: string;
    meetingLink?: string;
    notes?: string;
  };
}

export const initialCandidates: CandidateRecord[] = [
  {
    id: "anaya-01",
    name: "Anaya Sharma",
    email: "anaya.sharma@example.edu",
    program: "Computer Science · Batch 2028",
    score: 84,
    eligibility: "Eligible",
    stage: "Screening",
    skills: ["Python", "SQL", "Communication"],
    shortlisted: false,
    appliedDate: "20 Aug · 10:42",
    opportunityTitle: "Applied AI Capability Studio",
    avatar: "AS",
  },
  {
    id: "kabir-02",
    name: "Kabir Mehta",
    email: "kabir.mehta@example.edu",
    program: "Information Technology · Batch 2028",
    score: 79,
    eligibility: "Eligible",
    stage: "Shortlisted",
    skills: ["Python", "Data Analysis", "Communication"],
    shortlisted: true,
    appliedDate: "21 Aug · 11:15",
    opportunityTitle: "Applied AI Capability Studio",
    avatar: "KM",
  },
  {
    id: "rhea-03",
    name: "Rhea Nair",
    email: "rhea.nair@example.edu",
    program: "Computer Science · Batch 2027",
    score: 74,
    eligibility: "Review",
    stage: "Screening",
    skills: ["SQL", "Documentation", "Teamwork"],
    shortlisted: false,
    appliedDate: "22 Aug · 16:30",
    opportunityTitle: "Research Operations Associate",
    avatar: "RN",
  },
];

const CANDIDATES_STORAGE_KEY = "job-buddy-candidates-register";

export function loadCandidates(): CandidateRecord[] {
  try {
    const raw = localStorage.getItem(CANDIDATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(initialCandidates));
      return initialCandidates;
    }
    return JSON.parse(raw) as CandidateRecord[];
  } catch {
    return initialCandidates;
  }
}

export function saveCandidate(candidate: CandidateRecord): CandidateRecord[] {
  const all = loadCandidates();
  const index = all.findIndex((c) => c.id === candidate.id);
  let updated: CandidateRecord[];
  if (index !== -1) {
    updated = [...all];
    updated[index] = candidate;
  } else {
    updated = [candidate, ...all];
  }
  localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getCandidateById(id: string): CandidateRecord | undefined {
  const all = loadCandidates();
  return all.find((c) => c.id === id) || initialCandidates.find((c) => c.id === id);
}

export function updateCandidateStage(id: string, stage: CandidateRecord["stage"], interviewDetails?: CandidateRecord["interviewDetails"]): CandidateRecord | null {
  const all = loadCandidates();
  const candidate = all.find((c) => c.id === id);
  if (!candidate) return null;
  candidate.stage = stage;
  if (stage === "Shortlisted") candidate.shortlisted = true;
  if (interviewDetails) candidate.interviewDetails = interviewDetails;
  localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(all));
  return candidate;
}

export function toggleCandidateShortlist(id: string, explicitState?: boolean): { candidate: CandidateRecord | null; shortlisted: boolean } {
  const all = loadCandidates();
  const candidate = all.find((c) => c.id === id);
  if (!candidate) return { candidate: null, shortlisted: false };
  const nextState = explicitState !== undefined ? explicitState : !candidate.shortlisted;
  candidate.shortlisted = nextState;
  if (nextState && candidate.stage === "Screening") {
    candidate.stage = "Shortlisted";
  } else if (!nextState && candidate.stage === "Shortlisted") {
    candidate.stage = "Screening";
  }
  localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(all));
  return { candidate, shortlisted: nextState };
}

export interface ScreeningNote {
  id: string;
  candidateId: string;
  author: string;
  note: string;
  decision?: string;
  createdAt: string;
}

const SCREENING_NOTES_KEY = "job-buddy-recruiter-screening-notes";

export function loadScreeningNotes(candidateId?: string): ScreeningNote[] {
  try {
    const raw = localStorage.getItem(SCREENING_NOTES_KEY);
    const notes: ScreeningNote[] = raw ? JSON.parse(raw) : [];
    if (candidateId) {
      return notes.filter((n) => n.candidateId === candidateId);
    }
    return notes;
  } catch {
    return [];
  }
}

export function saveScreeningNote(candidateId: string, note: string, decision?: string, author = "Vikram Malhotra (Lead Recruiter)"): ScreeningNote {
  const all = loadScreeningNotes();
  const newNote: ScreeningNote = {
    id: `note-${Date.now()}`,
    candidateId,
    author,
    note,
    decision,
    createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  };
  const updated = [newNote, ...all];
  localStorage.setItem(SCREENING_NOTES_KEY, JSON.stringify(updated));
  return newNote;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "interview" | "event" | "application" | "system";
  link?: string;
  read: boolean;
}

const STUDENT_NOTIFICATIONS_KEY = "job-buddy-student-notifications";

const INITIAL_STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif-01",
    title: "Application Received · Applied AI Studio",
    message: "Northstar Systems verified your eligibility baseline and moved your application to Recruiter Screening.",
    timestamp: "20 Aug · 11:03",
    type: "application",
    link: "/applications/app-1",
    read: true,
  },
  {
    id: "notif-02",
    title: "Event Reminder: Skill Evidence Clinic",
    message: "Clinic starts tomorrow at 10:00 AM IST on Google Meet. Bring your recent project evidence.",
    timestamp: "25 Aug · 15:30",
    type: "event",
    link: "/events",
    read: false,
  },
];

export function loadStudentNotifications(): StudentNotification[] {
  try {
    const raw = localStorage.getItem(STUDENT_NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STUDENT_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_STUDENT_NOTIFICATIONS));
      return INITIAL_STUDENT_NOTIFICATIONS;
    }
    return JSON.parse(raw) as StudentNotification[];
  } catch {
    return INITIAL_STUDENT_NOTIFICATIONS;
  }
}

export function addStudentNotification(notif: Omit<StudentNotification, "id" | "timestamp" | "read">): StudentNotification {
  const all = loadStudentNotifications();
  const newNotif: StudentNotification = {
    id: `notif-${Date.now()}`,
    ...notif,
    timestamp: "Just now",
    read: false,
  };
  const updated = [newNotif, ...all];
  localStorage.setItem(STUDENT_NOTIFICATIONS_KEY, JSON.stringify(updated));
  return newNotif;
}

export function markNotificationAsRead(id: string): StudentNotification[] {
  const all = loadStudentNotifications();
  const target = all.find((n) => n.id === id);
  if (target) target.read = true;
  localStorage.setItem(STUDENT_NOTIFICATIONS_KEY, JSON.stringify(all));
  return all;
}

export function markAllNotificationsAsRead(): StudentNotification[] {
  const all = loadStudentNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(STUDENT_NOTIFICATIONS_KEY, JSON.stringify(all));
  return all;
}

export const events = [
  { title: "Skill evidence clinic", type: "Profile support", day: "26", month: "AUG", time: "11:00–12:00", place: "Online", company: "Northstar Systems", messageSubject: "Bring one recent analysis artefact", messageDate: "24 Aug · 09:15", message: "Please bring one concise analysis, notebook, or evidence note. We will review how to make the outcome clearer for a recruiter-facing profile." },
  { title: "Candidate evaluation briefing", type: "Evaluation", day: "28", month: "AUG", time: "14:30–15:15", place: "Seminar room 4", company: "Mosaic Health Labs", messageSubject: "Evaluation process and preparation", messageDate: "23 Aug · 16:40", message: "This briefing explains the evaluation sequence, expected documentation, and how research evidence will be discussed. Attendance is recommended for eligible candidates." },
  { title: "Recruitment process Q&A", type: "Recruitment", day: "03", month: "SEP", time: "16:00–16:45", place: "Online", company: "Tern & Co.", messageSubject: "Product review cohort questions", messageDate: "22 Aug · 11:30", message: "Ask about the product-review cohort, portfolio expectations, and the kind of user-research evidence the team values during initial screening." },
];

export const scheduleItems = [
  { time: "10:00", title: "Skill evidence clinic", meta: "Online · 45 min", kind: "Event" },
  { time: "14:30", title: "Candidate evaluation briefing", meta: "Seminar room 4 · 45 min", kind: "Evaluation" },
  { time: "17:00", title: "Application document check", meta: "Submission deadline", kind: "Deadline" },
];

export const candidates = initialCandidates;

export const candidateTimeline = [
  { label: "Application submitted", date: "20 Aug · 10:42", state: "complete" },
  { label: "Eligibility verified", date: "20 Aug · 11:03", state: "complete" },
  { label: "Recruiter screening", date: "Awaiting decision", state: "current" },
  { label: "Interview", date: "Not scheduled", state: "future" },
];

export const roleRequirements = [
  { role: "Applied AI Capability Studio", skill: "Python", level: "Advanced", importance: "Required", demand: "High" },
  { role: "Applied AI Capability Studio", skill: "Data Analysis", level: "Intermediate", importance: "Required", demand: "High" },
  { role: "Applied AI Capability Studio", skill: "Communication", level: "Intermediate", importance: "Required", demand: "Medium" },
  { role: "Applied AI Capability Studio", skill: "SQL", level: "Intermediate", importance: "Preferred", demand: "High" },
];

export const initialCompanyRoleRequirements = [
  {
    company: "Northstar Systems",
    industry: "Applied systems and data operations",
    roles: [
      { title: "Applied AI Capability Studio", demand: "High", updated: "22 Aug 2026", eligible: "08", requirements: [{ skill: "Python", level: "Advanced", importance: "Required" }, { skill: "Data Analysis", level: "Intermediate", importance: "Required" }, { skill: "Communication", level: "Intermediate", importance: "Required" }, { skill: "SQL", level: "Intermediate", importance: "Preferred" }] },
      { title: "Data Operations Associate", demand: "High", updated: "24 Aug 2026", eligible: "11", requirements: [{ skill: "SQL", level: "Intermediate", importance: "Required" }, { skill: "Spreadsheet analysis", level: "Advanced", importance: "Required" }, { skill: "Data quality review", level: "Intermediate", importance: "Required" }, { skill: "Python", level: "Developing", importance: "Preferred" }] },
    ],
  },
  {
    company: "Mosaic Health Labs",
    industry: "Health research and operations",
    roles: [
      { title: "Research Operations Associate", demand: "Medium", updated: "23 Aug 2026", eligible: "06", requirements: [{ skill: "Research", level: "Intermediate", importance: "Required" }, { skill: "Documentation", level: "Advanced", importance: "Required" }, { skill: "Teamwork", level: "Intermediate", importance: "Required" }, { skill: "Presentation", level: "Developing", importance: "Preferred" }] },
      { title: "Clinical Data Support Intern", demand: "Medium", updated: "23 Aug 2026", eligible: "09", requirements: [{ skill: "Data entry", level: "Intermediate", importance: "Required" }, { skill: "Excel", level: "Intermediate", importance: "Required" }, { skill: "Confidentiality awareness", level: "Intermediate", importance: "Required" }, { skill: "Research writing", level: "Developing", importance: "Preferred" }] },
    ],
  },
];

export const companyRoleRequirements = initialCompanyRoleRequirements;

const COMPANY_ROLE_REQUIREMENTS_KEY = "job-buddy-company-role-requirements";

export function loadCompanyRoleRequirements(): typeof initialCompanyRoleRequirements {
  try {
    const raw = localStorage.getItem(COMPANY_ROLE_REQUIREMENTS_KEY);
    if (!raw) {
      localStorage.setItem(COMPANY_ROLE_REQUIREMENTS_KEY, JSON.stringify(initialCompanyRoleRequirements));
      return initialCompanyRoleRequirements;
    }
    return JSON.parse(raw);
  } catch {
    return initialCompanyRoleRequirements;
  }
}

export function saveCompanyRoleRequirements(data: typeof initialCompanyRoleRequirements): void {
  try {
    localStorage.setItem(COMPANY_ROLE_REQUIREMENTS_KEY, JSON.stringify(data));
  } catch {}
}

export const studentSkillMaps = {
  industries: [
    { title: "Applied systems", score: 86, note: "Strong evidence in Python and data analysis.", evidence: "Declared Python and data-analysis skills, current coursework, and the latest assessment signal.", strengths: ["Python and data analysis", "Structured problem framing"], gaps: ["SQL evidence", "Applied project outcome"], nextAction: "Complete the SQL evidence workshop and attach one concise analysis project to your portfolio." },
    { title: "Research operations", score: 74, note: "Good documentation and structured research fit.", evidence: "Verified research-documentation project, declared research writing, and a current communication signal.", strengths: ["Research writing", "Documentation discipline"], gaps: ["Presentation evidence", "Domain-specific research sample"], nextAction: "Publish a short evidence review and practise presenting its recommendation in a three-minute summary." },
    { title: "Digital product", score: 61, note: "Build user-research evidence to improve alignment.", evidence: "Transferable research and communication signals are present, but product-specific evidence is limited.", strengths: ["Structured research", "Written communication"], gaps: ["User research artefact", "Product metrics exposure"], nextAction: "Create a small user-research case study with findings, a prioritised recommendation, and one measurable outcome." },
  ],
  roles: [
    { title: "Data operations associate", score: 84, note: "2 core skills verified; 1 developing.", evidence: "Python and data-analysis evidence maps to the role baseline; communication remains a developing supporting signal.", strengths: ["Python", "Data analysis"], gaps: ["SQL portfolio evidence", "Communicating insights"], nextAction: "Add a SQL analysis sample and present the result as a short stakeholder-ready note." },
    { title: "Research operations associate", score: 72, note: "Skill fit is positive; strengthen presentation evidence.", evidence: "Your research documentation project directly supports the role, while visible presentation evidence is not yet recorded.", strengths: ["Evidence review", "Documentation"], gaps: ["Presentation example", "Operational research tools"], nextAction: "Convert your completed research project into a two-slide briefing and add one operational research tool to your learning plan." },
    { title: "Product review associate", score: 61, note: "Build a concise user-research project sample.", evidence: "The role can use your research foundation, but the profile does not yet demonstrate product discovery or metrics work.", strengths: ["Research thinking", "Clear writing"], gaps: ["User interview synthesis", "Product measurement"], nextAction: "Complete one user-interview synthesis exercise and document the resulting product recommendation in your portfolio." },
  ],
  learning: [
    { title: "SQL evidence workshop", note: "Addresses an opportunity-preferred skill", time: "3 guided sessions" },
    { title: "Communicating analytical findings", note: "Strengthens role presentation expectations", time: "2 guided sessions" },
    { title: "Evidence-led research writing", note: "Supports research operations alignment", time: "4 guided sessions" },
  ],
};
