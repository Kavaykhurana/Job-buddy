// Scalable data models and persistent storage for Learning, Enrollments, Progress, and Certifications
import { getDeclaredSkills, saveDeclaredSkills } from "./assessmentData";

export interface LearningCourseLink {
  platform: string;
  href: string;
  rating?: string;
  duration?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed?: boolean;
}

export interface LearningProgram {
  id: string;
  title: string;
  type: "Workshop" | "Certification program" | "Training" | "Course";
  provider: string;
  duration: string;
  fit: string;
  skills: string[];
  state: "Recommended" | "Available" | "Enrolled";
  summary: string;
  courses: LearningCourseLink[];
  modules: LearningModule[];
}

export interface CourseEnrollment {
  programId: string;
  enrolledAt: string; // ISO date string
  progressPercent: number;
  completedModules: string[]; // module ids
  status: "Active" | "Completed" | "Dropped";
  completedAt?: string;
  certificateId?: string;
}

export interface StudentCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  skills: string[];
  verificationUrl?: string;
  verified: boolean;
  programId?: string;
  documentName?: string;
  documentDataUrl?: string;
}

export const initialLearningPrograms: LearningProgram[] = [
  {
    id: "sql-evidence",
    title: "SQL Evidence & Data Querying Workshop",
    type: "Workshop",
    provider: "Data Practice Network",
    duration: "3 guided sessions (4.5 hrs)",
    fit: "Addresses high-demand database query requirements for analytics and backend roles",
    skills: ["SQL", "Data Analysis", "Database Design"],
    state: "Recommended",
    summary:
      "Master relational data extraction, advanced window functions, query optimization, and verifiable analytical evidence notebooks.",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/data-analysis-sql", rating: "4.8 ★", duration: "12 hrs" },
      { platform: "Udemy", href: "https://www.udemy.com/course/sql-for-data-analytics/", rating: "4.7 ★", duration: "9 hrs" },
      { platform: "edX", href: "https://www.edx.org/course/databases-sql", rating: "4.6 ★", duration: "8 hrs" },
    ],
    modules: [
      { id: "sql-m1", title: "Foundation and Relational Baseline", description: "Write structured SELECT, JOINs, aggregations, and subqueries.", duration: "45 min" },
      { id: "sql-m2", title: "Guided Analytical Queries & Window Functions", description: "Apply window partitions, ranking, CTEs, and cohort analysis.", duration: "60 min" },
      { id: "sql-m3", title: "Completion Evidence & Practical Benchmark", description: "Execute complex business queries and generate reproducible evidence.", duration: "45 min" },
    ],
  },
  {
    id: "analytical-findings",
    title: "Communicating Analytical Findings & Visualizations",
    type: "Certification program",
    provider: "Industry Council",
    duration: "2 guided sessions + assessment",
    fit: "Strengthens evidence-based reporting and cross-functional technical presentation",
    skills: ["Communication", "Presentation", "Data Analysis"],
    state: "Recommended",
    summary:
      "Bridge complex technical analysis and executive decision making with clear narrative structures, actionable visualizations, and executive summaries.",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/data-storytelling", rating: "4.9 ★", duration: "10 hrs" },
      { platform: "Udemy", href: "https://www.udemy.com/course/storytelling_with_data_v/", rating: "4.8 ★", duration: "6 hrs" },
    ],
    modules: [
      { id: "comm-m1", title: "Narrative Framing & Audience Scoping", description: "Structure technical insights for mixed stakeholder audiences.", duration: "45 min" },
      { id: "comm-m2", title: "Evidence Visuals & Dashboard Communication", description: "Design high-clarity charts, decision trees, and callouts.", duration: "60 min" },
      { id: "comm-m3", title: "Executive Presentation Benchmark", description: "Deliver a 5-minute technical findings briefing with QA readiness.", duration: "45 min" },
    ],
  },
  {
    id: "research-writing",
    title: "Evidence-Led Technical & Research Writing",
    type: "Training",
    provider: "Research Practice Network",
    duration: "4 guided sessions",
    fit: "Builds a rigorous documentation signal for research operations and engineering briefs",
    skills: ["Research Writing", "Documentation", "Critical Thinking"],
    state: "Available",
    summary:
      "Formulate hypothesis statements, structure reproducible methodologies, document system architectures, and author peer-reviewable reports.",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/academic-writing-capstone", rating: "4.7 ★", duration: "14 hrs" },
      { platform: "Udemy", href: "https://www.udemy.com/course/research-paper-writing-start-to-finish/", rating: "4.6 ★", duration: "8 hrs" },
    ],
    modules: [
      { id: "rw-m1", title: "Problem Definition & Literature Synthesis", description: "Frame unambiguous problem scopes and cite prior art cleanly.", duration: "45 min" },
      { id: "rw-m2", title: "Methodology & Architecture Documentation", description: "Document experimental pipelines and architectural boundaries.", duration: "60 min" },
      { id: "rw-m3", title: "Results Verification & Review Submission", description: "Format tables, error margins, and reproducible benchmark summaries.", duration: "45 min" },
    ],
  },
  {
    id: "python-deep-dive",
    title: "Applied Python & System Automation",
    type: "Certification program",
    provider: "Open Source Academy",
    duration: "4 modules + capstone",
    fit: "Core foundational skill for backend development, data engineering, and automation",
    skills: ["Python", "Git", "System Design"],
    state: "Recommended",
    summary:
      "Write clean, idiomatic Python with object-oriented paradigms, concurrency, unit testing, and automated deployment pipelines.",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/python-crash-course", rating: "4.8 ★", duration: "16 hrs" },
      { platform: "edX", href: "https://www.edx.org/course/programming-for-everybody-python", rating: "4.7 ★", duration: "12 hrs" },
    ],
    modules: [
      { id: "py-m1", title: "Idiomatic Python & Clean Code Structure", description: "Master generators, decorators, typing, and standard libraries.", duration: "60 min" },
      { id: "py-m2", title: "Async IO & Concurrent Pipelines", description: "Design fast non-blocking data workflows and HTTP services.", duration: "60 min" },
      { id: "py-m3", title: "Testing, Packaging & CI/CD", description: "Build pytest suites, type-check with mypy, and package modules.", duration: "60 min" },
    ],
  },
  {
    id: "product-thinking",
    title: "Digital Product Thinking & User Research",
    type: "Workshop",
    provider: "Product Guild",
    duration: "3 workshops",
    fit: "Key for product management, UX analysis, and software product cohorts",
    skills: ["Product Thinking", "User Research", "Writing"],
    state: "Available",
    summary:
      "Conduct user interviews, map telemetry into product requirements (PRDs), and design hypothesis-driven feature roadmaps.",
    courses: [
      { platform: "Coursera", href: "https://www.coursera.org/learn/uva-darden-digital-product-management", rating: "4.7 ★", duration: "10 hrs" },
      { platform: "Udemy", href: "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-the-job/", rating: "4.6 ★", duration: "13 hrs" },
    ],
    modules: [
      { id: "pt-m1", title: "Problem Discovery & Persona Mapping", description: "Identify friction points and articulate user personas.", duration: "45 min" },
      { id: "pt-m2", title: "Specifying PRDs & Acceptance Criteria", description: "Write unambiguous user stories and KPI benchmarks.", duration: "60 min" },
      { id: "pt-m3", title: "Feature Experimentation & Launch Review", description: "Formulate A/B hypotheses and evaluate rollout telemetry.", duration: "45 min" },
    ],
  },
];

const ENROLLMENTS_STORAGE_KEY = "sih-connect-learning-enrollments";
const CERTIFICATES_STORAGE_KEY = "sih-connect-certifications";

export function getStoredEnrollments(): Record<string, CourseEnrollment> {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    if (!raw) {
      // Default active enrollment in SQL Evidence workshop
      const defaultState: Record<string, CourseEnrollment> = {
        "sql-evidence": {
          programId: "sql-evidence",
          enrolledAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          progressPercent: 33,
          completedModules: ["sql-m1"],
          status: "Active",
        },
      };
      localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveEnrollments(enrollments: Record<string, CourseEnrollment>): void {
  try {
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(enrollments));
  } catch (err) {
    console.error("Failed to save enrollments:", err);
  }
}

export function enrollInProgram(programId: string): CourseEnrollment {
  const enrollments = getStoredEnrollments();
  const existing = enrollments[programId];
  if (existing && existing.status === "Active") {
    return existing;
  }
  const newEnrollment: CourseEnrollment = {
    programId,
    enrolledAt: new Date().toISOString(),
    progressPercent: 0,
    completedModules: [],
    status: "Active",
  };
  enrollments[programId] = newEnrollment;
  saveEnrollments(enrollments);
  return newEnrollment;
}

export function cancelProgramEnrollment(programId: string): void {
  const enrollments = getStoredEnrollments();
  if (enrollments[programId]) {
    delete enrollments[programId];
    saveEnrollments(enrollments);
  }
}

export function toggleModuleProgress(
  programId: string,
  moduleId: string,
  totalModulesCount: number
): CourseEnrollment {
  const enrollments = getStoredEnrollments();
  const current = enrollments[programId] || {
    programId,
    enrolledAt: new Date().toISOString(),
    progressPercent: 0,
    completedModules: [],
    status: "Active",
  };

  const isCompleted = current.completedModules.includes(moduleId);
  let updatedModules: string[];
  if (isCompleted) {
    updatedModules = current.completedModules.filter((id) => id !== moduleId);
  } else {
    updatedModules = [...current.completedModules, moduleId];
  }

  const progressPercent = totalModulesCount > 0
    ? Math.round((updatedModules.length / totalModulesCount) * 100)
    : 0;

  const isAllComplete = progressPercent >= 100;
  const status = isAllComplete ? "Completed" : "Active";

  const updated: CourseEnrollment = {
    ...current,
    completedModules: updatedModules,
    progressPercent,
    status,
    completedAt: isAllComplete ? (current.completedAt || new Date().toISOString()) : undefined,
  };

  enrollments[programId] = updated;
  saveEnrollments(enrollments);

  // If completed, automatically issue a certificate and add skills to profile!
  if (isAllComplete && !current.certificateId) {
    const program = initialLearningPrograms.find((p) => p.id === programId);
    if (program) {
      const certId = `CERT-${programId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      updated.certificateId = certId;
      enrollments[programId] = updated;
      saveEnrollments(enrollments);

      // Add to certificates store
      addStudentCertificate({
        id: certId,
        title: `${program.title} Credential`,
        issuer: program.provider,
        issueDate: new Date().toISOString().slice(0, 10),
        credentialId: certId,
        skills: program.skills,
        verified: true,
        programId: program.id,
      });
    }
  }

  return updated;
}

export function getStoredCertificates(): StudentCertificate[] {
  try {
    const raw = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
    if (!raw) {
      const defaults: StudentCertificate[] = [
        {
          id: "cert-df-0142",
          title: "Data Foundations Certificate",
          issuer: "Industry Council",
          issueDate: "2026-07-12",
          expiryDate: "2028-07-12",
          credentialId: "IC-DF-2026-0142",
          skills: ["Data Analysis", "Python"],
          verified: true,
        },
      ];
      localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCertificates(certs: StudentCertificate[]): void {
  try {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(certs));
  } catch (err) {
    console.error("Failed to save certificates:", err);
  }
}

export function addStudentCertificate(cert: Omit<StudentCertificate, "id"> & { id?: string }): StudentCertificate {
  const certs = getStoredCertificates();
  const id = cert.id || `cert-${Date.now()}`;
  const fullCert: StudentCertificate = {
    ...cert,
    id,
    verified: cert.verified ?? true,
  };

  // Prepend new certificate
  const updated = [fullCert, ...certs.filter((c) => c.id !== id)];
  saveCertificates(updated);

  // Synchronize certified skills into profile declared skills!
  if (cert.skills && cert.skills.length > 0) {
    const declaredSkills = getDeclaredSkills();
    let hasNewSkills = false;
    const updatedSkills = [...declaredSkills];

    cert.skills.forEach((skill) => {
      const cleanSkill = skill.trim();
      if (
        cleanSkill &&
        !updatedSkills.some((s) => s.toLowerCase() === cleanSkill.toLowerCase())
      ) {
        updatedSkills.push(cleanSkill);
        hasNewSkills = true;
      }
    });

    if (hasNewSkills) {
      saveDeclaredSkills(updatedSkills);
    }
  }

  return fullCert;
}

export function removeStudentCertificate(id: string): void {
  const certs = getStoredCertificates();
  const filtered = certs.filter((c) => c.id !== id);
  saveCertificates(filtered);
}
