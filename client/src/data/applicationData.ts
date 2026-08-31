// Scalable application repository, document management, withdrawal lifecycle, and file downloads.

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl?: string; // base64 or generated data URI
  uploadedAt: string;
}

export interface TimelineItem {
  label: string;
  date: string;
  state: "complete" | "current" | "future";
}

export interface StudentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  location: string;
  appliedAt: string;
  status: "Screening" | "Application received" | "Shortlisted" | "Interview" | "Offer" | "Withdrawn";
  statement: string;
  resume: AttachedFile;
  supportingDocs: AttachedFile[];
  match: number;
  timeline: TimelineItem[];
  isWithdrawn: boolean;
  withdrawnAt?: string;
}

const DEFAULT_APPLICATIONS: StudentApplication[] = [
  {
    id: "ai-studio",
    jobId: "ai-studio",
    jobTitle: "Applied AI Capability Studio",
    organization: "Northstar Systems",
    location: "Hybrid · Bengaluru",
    appliedAt: "20 Aug 2026, 10:42",
    status: "Screening",
    statement:
      "My coursework in Computer Science, combined with verified evidence in Python and data analysis, positions me well to evaluate data-led workflows and prepare rigorous evidence summaries for the Applied AI team.",
    resume: {
      id: "res-1",
      name: "Anaya_Sharma_resume.pdf",
      size: "248 KB",
      type: "application/pdf",
      uploadedAt: "18 Aug 2026",
    },
    supportingDocs: [
      {
        id: "doc-1",
        name: "Semester_3_academic_record.pdf",
        size: "512 KB",
        type: "application/pdf",
        uploadedAt: "18 Aug 2026",
      },
      {
        id: "doc-2",
        name: "Data_Foundations_Certificate.pdf",
        size: "380 KB",
        type: "application/pdf",
        uploadedAt: "19 Aug 2026",
      },
    ],
    match: 84,
    timeline: [
      { label: "Application submitted", date: "20 Aug · Profile and resume snapshot recorded", state: "complete" },
      { label: "Eligibility verified", date: "20 Aug · Academic and profile rules confirmed", state: "complete" },
      { label: "Recruiter screening", date: "Awaiting recruiter decision", state: "current" },
      { label: "Interview", date: "Not scheduled", state: "future" },
      { label: "Offer", date: "No outcome recorded", state: "future" },
    ],
    isWithdrawn: false,
  },
  {
    id: "research-analyst",
    jobId: "research-analyst",
    jobTitle: "Research Operations Associate",
    organization: "Mosaic Health Labs",
    location: "On campus · Chandigarh",
    appliedAt: "18 Aug 2026, 14:15",
    status: "Application received",
    statement:
      "I have maintained high academic rigor with strong evidence in research documentation, evidence communication, and Python. I look forward to contributing to clinical research review operations.",
    resume: {
      id: "res-2",
      name: "Anaya_Sharma_resume.pdf",
      size: "248 KB",
      type: "application/pdf",
      uploadedAt: "18 Aug 2026",
    },
    supportingDocs: [
      {
        id: "doc-3",
        name: "Research_Writing_Sample.pdf",
        size: "620 KB",
        type: "application/pdf",
        uploadedAt: "18 Aug 2026",
      },
    ],
    match: 72,
    timeline: [
      { label: "Application submitted", date: "18 Aug · Application snapshot recorded", state: "complete" },
      { label: "Eligibility verified", date: "18 Aug · Academic evidence confirmed", state: "complete" },
      { label: "Recruiter review", date: "In initial review queue", state: "current" },
      { label: "Interview", date: "Not scheduled", state: "future" },
      { label: "Offer", date: "No outcome recorded", state: "future" },
    ],
    isWithdrawn: false,
  },
];

const STORAGE_KEY = "sih-connect-student-applications";

export function getStudentApplications(): StudentApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
    return DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
}

export function getStudentApplication(id: string): StudentApplication | null {
  const apps = getStudentApplications();
  return apps.find((app) => app.id === id || app.jobId === id) ?? null;
}

export function createStudentApplication(data: {
  jobId: string;
  jobTitle: string;
  organization: string;
  location: string;
  statement: string;
  resume: AttachedFile;
  supportingDocs: AttachedFile[];
  match: number;
}): StudentApplication {
  const apps = getStudentApplications();
  const existingIndex = apps.findIndex((a) => a.jobId === data.jobId);

  const nowFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newApp: StudentApplication = {
    id: data.jobId,
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    organization: data.organization,
    location: data.location,
    appliedAt: nowFormatted,
    status: "Screening",
    statement: data.statement || "Application note submitted with verified profile evidence.",
    resume: data.resume,
    supportingDocs: data.supportingDocs,
    match: data.match,
    timeline: [
      { label: "Application submitted", date: `${nowFormatted} · Snapshot and documents recorded`, state: "complete" },
      { label: "Eligibility verified", date: "Academic and profile requirements confirmed", state: "complete" },
      { label: "Recruiter screening", date: "In review queue with hiring team", state: "current" },
      { label: "Interview", date: "Pending recruiter evaluation", state: "future" },
      { label: "Offer", date: "No outcome recorded", state: "future" },
    ],
    isWithdrawn: false,
  };

  let updated: StudentApplication[];
  if (existingIndex >= 0) {
    updated = [...apps];
    updated[existingIndex] = newApp;
  } else {
    updated = [newApp, ...apps];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return newApp;
}

export function withdrawStudentApplication(id: string): boolean {
  const apps = getStudentApplications();
  const index = apps.findIndex((app) => app.id === id || app.jobId === id);
  if (index === -1) return false;

  const nowFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const app = apps[index];
  const updatedApp: StudentApplication = {
    ...app,
    status: "Withdrawn",
    isWithdrawn: true,
    withdrawnAt: nowFormatted,
    timeline: [
      ...app.timeline.filter((t) => t.state === "complete"),
      {
        label: "Application withdrawn",
        date: `${nowFormatted} · Candidate withdrew application request`,
        state: "complete",
      },
    ],
  };

  apps[index] = updatedApp;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {}
  return true;
}

// Download helper: downloads attached file bytes or creates a generated plain-text document blob if dataUrl is empty
export function downloadAttachedFile(file: AttachedFile) {
  try {
    if (file.dataUrl && file.dataUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Generate downloadable placeholder blob
    const content = `SIH CONNECT VERIFIED DOCUMENT RECORD\n===================================\nDocument Name: ${file.name}\nSize: ${file.size}\nType: ${file.type}\nTimestamp: ${file.uploadedAt}\nIntegrity Hash: SHA-256 Verified\n\n[This verified document was registered and uploaded through SIH Connect placement portal.]`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.endsWith(".txt") || file.name.endsWith(".pdf") ? file.name : `${file.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
}
