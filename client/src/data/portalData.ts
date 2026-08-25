// Field Notes Institutional Workspace: scoped client-side data for static UI demonstration only.
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

export const applicationStages = ["Applied", "Shortlisted", "Attended", "Rejected", "Offers"];

export type RecruiterPostedJob = { id: string; title: string; mode: string; requiredSkills: string; preferredSkills: string; qualification: string; eligibility: string; stages: string; status: "Open"; postedAt: string };
export function loadRecruiterPostedJobs(): RecruiterPostedJob[] { try { const stored = localStorage.getItem("sih-connect-recruiter-posted-jobs"); return stored ? JSON.parse(stored) as RecruiterPostedJob[] : []; } catch { return []; } }
export function saveRecruiterPostedJob(job: RecruiterPostedJob) { const jobs = [job, ...loadRecruiterPostedJobs()]; localStorage.setItem("sih-connect-recruiter-posted-jobs", JSON.stringify(jobs)); return jobs; }

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

export const candidates = [
  { id: "anaya-01", name: "Anaya Sharma", program: "Computer Science · Batch 2028", score: 84, eligibility: "Eligible", stage: "Screening", skills: ["Python", "SQL", "Communication"] },
  { id: "kabir-02", name: "Kabir Mehta", program: "Information Technology · Batch 2028", score: 79, eligibility: "Eligible", stage: "Screening", skills: ["Python", "Data Analysis", "Communication"] },
  { id: "rhea-03", name: "Rhea Nair", program: "Computer Science · Batch 2027", score: 74, eligibility: "Review", stage: "Screening", skills: ["SQL", "Documentation", "Teamwork"] },
];

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

export const companyRoleRequirements = [
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
