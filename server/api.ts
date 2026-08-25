import { Router, json, urlencoded } from "express";
import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";

export const apiRouter = Router();
apiRouter.use(json());
apiRouter.use(urlencoded({ extended: true }));

// Path to data store file for persistence
const DB_FILE = path.resolve(process.cwd(), "server", "data_store.json");

// Initial Seed Data
const initialData = {
  users: [
    { id: "usr_student", email: "anaya.sharma@example.edu", displayName: "Anaya Sharma", roles: ["STUDENT"] },
    { id: "usr_recruiter", email: "recruitment@quantum-systems.io", displayName: "Vikram Malhotra", roles: ["RECRUITER"] },
    { id: "usr_institution", email: "dean.placements@apex-tech.edu", displayName: "Dr. Sunita Rao", roles: ["INSTITUTION"] },
    { id: "usr_academician", email: "prof.mehta@apex-tech.edu", displayName: "Prof. Arvind Mehta", roles: ["ACADEMICIAN"] },
  ],
  jobs: [
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
      summary: "Support a cross-functional team by evaluating data-led workflows and presenting evidence-backed recommendations.",
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
      summary: "Contribute to evidence review, structured documentation, and stakeholder-ready progress reports.",
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
      summary: "Review product briefs, map user needs, and prepare concise evidence notes for a product team.",
    },
  ],
  internships: [
    {
      id: "data-practice",
      title: "Data Practice Internship",
      org: "Northstar Systems",
      mode: "Hybrid · Bengaluru",
      match: 84,
      status: "Recommended",
      close: "Closes 30 Aug",
      interest: "Applied systems",
      required: ["Python", "Data analysis", "Communication"],
      preferred: ["SQL", "Data cleaning"],
      summary: "Participate in data operations, practice evidence documentation, and work with an industry mentor.",
    },
    {
      id: "clinical-support",
      title: "Clinical Data Support Internship",
      org: "Mosaic Health Labs",
      mode: "On campus · Chandigarh",
      match: 72,
      status: "Eligible",
      close: "Closes 02 Sep",
      interest: "Research operations",
      required: ["Documentation", "Research", "Data entry"],
      preferred: ["Excel", "Presentation"],
      summary: "Support health research records, verify entry accuracy, and prepare structured review notes.",
    },
    {
      id: "product-observation",
      title: "Product Observation Internship",
      org: "Tern & Co.",
      mode: "Remote",
      match: 63,
      status: "Build evidence",
      close: "Closes 08 Sep",
      interest: "Digital product",
      required: ["User research", "Writing"],
      preferred: ["Analytics"],
      summary: "Observe product workflows, summarise user needs, and prepare a concise evidence-backed review.",
    },
  ],
  experiences: [
    {
      id: "data-apprenticeship",
      type: "Apprenticeship",
      title: "Data Practice Apprenticeship",
      org: "Northstar Systems",
      mode: "Hybrid · Bengaluru",
      match: 84,
      duration: "12 weeks",
      required: ["Python", "Data analysis", "Communication"],
      summary: "A guided work-learning pathway with assigned industry supervisors, milestones, and feedback.",
    },
    {
      id: "evidence-project",
      type: "Industry project",
      title: "Evidence Workflow Improvement Project",
      org: "Tern & Co.",
      mode: "Remote · Team project",
      match: 71,
      duration: "6 weeks",
      required: ["Research writing", "Documentation", "User research"],
      summary: "Work with an industry brief, team deliverables, review milestones, and a verified project outcome.",
    },
  ],
  applications: [
    {
      id: "app-1",
      jobId: "ai-studio",
      jobTitle: "Applied AI Capability Studio",
      organization: "Northstar Systems",
      studentName: "Anaya Sharma",
      studentEmail: "anaya.sharma@example.edu",
      stage: "Screening",
      appliedAt: "20 Aug · 10:42",
      statement: "Strong analytical and python background suitable for applied systems evaluation.",
    },
    {
      id: "app-2",
      jobId: "research-analyst",
      jobTitle: "Research Operations Associate",
      organization: "Mosaic Health Labs",
      studentName: "Anaya Sharma",
      studentEmail: "anaya.sharma@example.edu",
      stage: "Submitted",
      appliedAt: "21 Aug · 14:15",
      statement: "Demonstrated coursework in research methodology and documentation.",
    },
  ],
  candidates: [
    { id: "anaya-01", name: "Anaya Sharma", program: "Computer Science · Batch 2028", score: 84, eligibility: "Eligible", stage: "Screening", skills: ["Python", "SQL", "Communication"], shortlisted: false },
    { id: "kabir-02", name: "Kabir Mehta", program: "Information Technology · Batch 2028", score: 79, eligibility: "Eligible", stage: "Screening", skills: ["Python", "Data Analysis", "Communication"], shortlisted: true },
    { id: "rhea-03", name: "Rhea Nair", program: "Computer Science · Batch 2027", score: 74, eligibility: "Review", stage: "Screening", skills: ["SQL", "Documentation", "Teamwork"], shortlisted: false },
  ],
  companyRequirements: [
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
  ],
  profile: {
    displayName: "Anaya Sharma",
    email: "anaya.sharma@example.edu",
    phone: "+91 98123 45510",
    program: "Computer Science · Batch 2028",
    declaredSkills: ["Python", "Data analysis", "Research writing", "SQL", "User research", "Presentation"],
    documents: [
      { id: "doc-1", title: "Semester 3 academic record", verified: true },
      { id: "doc-2", title: "Semester 4 academic record", verified: false },
      { id: "doc-3", title: "Identity proof", verified: true },
      { id: "doc-4", title: "Skill evidence note", verified: true },
    ],
  },
  curriculumNotes: [
    { id: "curr-1", program: "Computer Science", note: "Add applied SQL evidence workshops to close current high-demand industry requirement gap.", createdBy: "Dean Office", createdAt: "24 Aug 2026" },
  ],
  initiatives: [
    { id: "init-1", kind: "mentorship", title: "Applied systems mentorship circle", org: "Northstar Systems", mentor: "Neeraj Patel", participants: 18 },
    { id: "init-2", kind: "guest", title: "From skill evidence to industry decisions", org: "Northstar Systems", speaker: "Vikram Malhotra", date: "03 Sep" },
    { id: "init-3", kind: "challenge", title: "Transparent evidence for early-career readiness", org: "Industry Council", status: "Open", participants: 18 },
  ],
};

function loadDatabase(): typeof initialData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return JSON.parse(JSON.stringify(initialData));
}

function saveDatabase(data: typeof initialData) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving data_store.json:", err);
  }
}

let db = loadDatabase();

// Helper to persist on changes
function updateDb<T>(updater: (current: typeof initialData) => T): T {
  const result = updater(db);
  saveDatabase(db);
  return result;
}

// -----------------------------------------------------------------------------
// 1. AUTH ENDPOINTS
// -----------------------------------------------------------------------------
apiRouter.post("/auth/login", (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const user = db.users.find((u) => u.email === email) || {
    id: "usr_" + Math.random().toString(36).slice(2, 9),
    email: email || "user@example.edu",
    displayName: (email || "User").split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    roles: role ? [role.toUpperCase()] : ["STUDENT"],
  };
  return res.json({
    accessToken: "jwt_token_" + Date.now(),
    accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    user,
  });
});

apiRouter.post("/auth/register", (req: Request, res: Response) => {
  const { displayName, email, password, role } = req.body;
  const newUser = {
    id: "usr_" + Math.random().toString(36).slice(2, 9),
    email: email || "user@example.edu",
    displayName: displayName || "User",
    roles: role ? [role.toUpperCase()] : ["STUDENT"],
  };
  updateDb((state) => {
    state.users.push(newUser);
  });
  return res.json({
    accessToken: "jwt_token_" + Date.now(),
    accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    user: newUser,
  });
});

apiRouter.get("/auth/me", (req: Request, res: Response) => {
  return res.json(db.users[0]);
});

apiRouter.post("/auth/refresh", (req: Request, res: Response) => {
  return res.json({
    accessToken: "jwt_refreshed_" + Date.now(),
    accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    user: db.users[0],
  });
});

apiRouter.post("/auth/logout", (_req: Request, res: Response) => {
  return res.status(204).end();
});

// -----------------------------------------------------------------------------
// 2. JOBS / OPPORTUNITIES (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/jobs", (_req: Request, res: Response) => {
  return res.json(db.jobs);
});

apiRouter.get("/jobs/:id", (req: Request, res: Response) => {
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ detail: "Job opportunity not found" });
  return res.json(job);
});

apiRouter.post("/jobs", (req: Request, res: Response) => {
  const newJob = {
    id: req.body.id || `job-${Date.now()}`,
    title: req.body.title || "Untitled Opportunity",
    organization: req.body.organization || "Company Partner",
    location: req.body.location || req.body.mode || "Hybrid",
    date: req.body.date || "Closes 30 Sep",
    match: req.body.match || 75,
    status: req.body.status || "Open",
    required: Array.isArray(req.body.required) ? req.body.required : (req.body.requiredSkills || "Python, Communication").split(",").map((s: string) => s.trim()),
    preferred: Array.isArray(req.body.preferred) ? req.body.preferred : (req.body.preferredSkills || "SQL").split(",").map((s: string) => s.trim()),
    type: req.body.type || "Structured opportunity",
    summary: req.body.summary || req.body.eligibility || "Role requirements published.",
  };
  updateDb((state) => {
    state.jobs.unshift(newJob);
  });
  return res.status(201).json(newJob);
});

apiRouter.put("/jobs/:id", (req: Request, res: Response) => {
  const updated = updateDb((state) => {
    const idx = state.jobs.findIndex((j) => j.id === req.params.id);
    if (idx !== -1) {
      state.jobs[idx] = { ...state.jobs[idx], ...req.body };
      return state.jobs[idx];
    }
    return null;
  });
  if (!updated) return res.status(404).json({ detail: "Job not found" });
  return res.json(updated);
});

apiRouter.delete("/jobs/:id", (req: Request, res: Response) => {
  const deleted = updateDb((state) => {
    const idx = state.jobs.findIndex((j) => j.id === req.params.id);
    if (idx !== -1) {
      return state.jobs.splice(idx, 1)[0];
    }
    return null;
  });
  if (!deleted) return res.status(404).json({ detail: "Job not found" });
  return res.json({ success: true, deleted });
});

// -----------------------------------------------------------------------------
// 3. APPLICATIONS (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/applications", (_req: Request, res: Response) => {
  return res.json(db.applications);
});

apiRouter.post("/applications", (req: Request, res: Response) => {
  const newApp = {
    id: `app-${Date.now()}`,
    jobId: req.body.jobId || "ai-studio",
    jobTitle: req.body.jobTitle || "Applied AI Capability Studio",
    organization: req.body.organization || "Northstar Systems",
    studentName: req.body.studentName || db.profile.displayName,
    studentEmail: req.body.studentEmail || db.profile.email,
    stage: "Submitted",
    appliedAt: "Just now",
    statement: req.body.statement || "",
  };
  updateDb((state) => {
    state.applications.unshift(newApp);
  });
  return res.status(201).json(newApp);
});

apiRouter.patch("/applications/:id", (req: Request, res: Response) => {
  const updated = updateDb((state) => {
    const app = state.applications.find((a) => a.id === req.params.id);
    if (app) {
      if (req.body.stage) app.stage = req.body.stage;
      return app;
    }
    return null;
  });
  if (!updated) return res.status(404).json({ detail: "Application not found" });
  return res.json(updated);
});

// -----------------------------------------------------------------------------
// 4. INTERNSHIPS (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/internships", (_req: Request, res: Response) => {
  return res.json(db.internships);
});

apiRouter.post("/internships", (req: Request, res: Response) => {
  const newInternship = {
    id: req.body.id || `internship-${Date.now()}`,
    title: req.body.title || "New Internship Opportunity",
    org: req.body.org || "Industry Partner",
    mode: req.body.mode || "Hybrid",
    match: req.body.match || 75,
    status: req.body.status || "Open",
    close: req.body.close || "Closes 30 Sep",
    interest: req.body.interest || "Applied systems",
    required: Array.isArray(req.body.required) ? req.body.required : ["Python", "Communication"],
    preferred: Array.isArray(req.body.preferred) ? req.body.preferred : ["SQL"],
    summary: req.body.summary || "Internship requirements published.",
  };
  updateDb((state) => {
    state.internships.unshift(newInternship);
  });
  return res.status(201).json(newInternship);
});

apiRouter.delete("/internships/:id", (req: Request, res: Response) => {
  const deleted = updateDb((state) => {
    const idx = state.internships.findIndex((i) => i.id === req.params.id);
    if (idx !== -1) return state.internships.splice(idx, 1)[0];
    return null;
  });
  if (!deleted) return res.status(404).json({ detail: "Internship not found" });
  return res.json({ success: true, deleted });
});

// -----------------------------------------------------------------------------
// 5. EXPERIENCES (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/experiences", (_req: Request, res: Response) => {
  return res.json(db.experiences);
});

apiRouter.post("/experiences", (req: Request, res: Response) => {
  const newExp = {
    id: req.body.id || `exp-${Date.now()}`,
    type: req.body.type || "Industry project",
    title: req.body.title || "New Experience Project",
    org: req.body.org || "Partner Organisation",
    mode: req.body.mode || "Remote",
    match: req.body.match || 75,
    duration: req.body.duration || "8 weeks",
    required: Array.isArray(req.body.required) ? req.body.required : ["Research", "Documentation"],
    summary: req.body.summary || "Structured industry experience brief.",
  };
  updateDb((state) => {
    state.experiences.unshift(newExp);
  });
  return res.status(201).json(newExp);
});

// -----------------------------------------------------------------------------
// 6. CANDIDATES & SHORTLISTS (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/candidates", (_req: Request, res: Response) => {
  return res.json(db.candidates);
});

apiRouter.post("/candidates/:id/shortlist", (req: Request, res: Response) => {
  const candidate = updateDb((state) => {
    const c = state.candidates.find((item) => item.id === req.params.id);
    if (c) {
      c.shortlisted = req.body.shortlisted !== undefined ? req.body.shortlisted : !c.shortlisted;
      return c;
    }
    return null;
  });
  if (!candidate) return res.status(404).json({ detail: "Candidate not found" });
  return res.json({ success: true, candidate });
});

apiRouter.post("/candidates/:id/scorecard", (req: Request, res: Response) => {
  const candidate = updateDb((state) => {
    const c = state.candidates.find((item) => item.id === req.params.id);
    if (c) {
      c.score = req.body.score || c.score;
      c.stage = req.body.stage || "Interviewed";
      return c;
    }
    return null;
  });
  if (!candidate) return res.status(404).json({ detail: "Candidate not found" });
  return res.json({ success: true, candidate, scorecard: req.body });
});

// -----------------------------------------------------------------------------
// 7. COMPANY SKILL REQUIREMENTS (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/requirements", (_req: Request, res: Response) => {
  return res.json(db.companyRequirements);
});

apiRouter.put("/requirements", (req: Request, res: Response) => {
  const { companyIndex = 0, roleIndex = 0, requirement } = req.body;
  updateDb((state) => {
    if (state.companyRequirements[companyIndex]?.roles[roleIndex]) {
      if (requirement && requirement.skill) {
        state.companyRequirements[companyIndex].roles[roleIndex].requirements.push(requirement);
      }
    }
  });
  return res.json(db.companyRequirements);
});

// -----------------------------------------------------------------------------
// 8. PROFILE, SKILLS & DOCUMENTS (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/profile", (_req: Request, res: Response) => {
  return res.json(db.profile);
});

apiRouter.put("/profile", (req: Request, res: Response) => {
  const updated = updateDb((state) => {
    state.profile = { ...state.profile, ...req.body };
    return state.profile;
  });
  return res.json(updated);
});

apiRouter.post("/profile/skills", (req: Request, res: Response) => {
  const { skill } = req.body;
  if (!skill || typeof skill !== "string") return res.status(400).json({ detail: "Skill name is required" });
  updateDb((state) => {
    if (!state.profile.declaredSkills.includes(skill.trim())) {
      state.profile.declaredSkills.push(skill.trim());
    }
  });
  return res.json(db.profile.declaredSkills);
});

apiRouter.delete("/profile/skills/:skill", (req: Request, res: Response) => {
  const skillToDelete = decodeURIComponent(req.params.skill);
  updateDb((state) => {
    state.profile.declaredSkills = state.profile.declaredSkills.filter(
      (s) => s.toLowerCase() !== skillToDelete.toLowerCase()
    );
  });
  return res.json(db.profile.declaredSkills);
});

apiRouter.post("/profile/documents", (req: Request, res: Response) => {
  const newDoc = {
    id: `doc-${Date.now()}`,
    title: req.body.title || "Attached Document",
    verified: false,
  };
  updateDb((state) => {
    state.profile.documents.push(newDoc);
  });
  return res.status(201).json(newDoc);
});

apiRouter.delete("/profile/documents/:id", (req: Request, res: Response) => {
  updateDb((state) => {
    state.profile.documents = state.profile.documents.filter((d) => d.id !== req.params.id);
  });
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// 9. CURRICULUM NOTES & COLLABORATION INITIATIVES (CRUD)
// -----------------------------------------------------------------------------
apiRouter.get("/curriculum/notes", (_req: Request, res: Response) => {
  return res.json(db.curriculumNotes);
});

apiRouter.post("/curriculum/notes", (req: Request, res: Response) => {
  const note = {
    id: `curr-${Date.now()}`,
    program: req.body.program || "Computer Science",
    note: req.body.note || "Curriculum review note recorded.",
    createdBy: req.body.createdBy || "Academic Reviewer",
    createdAt: "Just now",
  };
  updateDb((state) => {
    state.curriculumNotes.unshift(note);
  });
  return res.status(201).json(note);
});

apiRouter.get("/initiatives", (_req: Request, res: Response) => {
  return res.json(db.initiatives);
});

apiRouter.post("/initiatives", (req: Request, res: Response) => {
  const initiative = {
    id: `init-${Date.now()}`,
    kind: req.body.kind || "workshop",
    title: req.body.title || "New Collaboration Initiative",
    org: req.body.org || "Northstar Systems",
    speaker: req.body.speaker || "Industry Lead",
    date: req.body.date || "Upcoming",
    status: "Published",
    participants: 1,
  };
  updateDb((state) => {
    state.initiatives.unshift(initiative);
  });
  return res.status(201).json(initiative);
});
