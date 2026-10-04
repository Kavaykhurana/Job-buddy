// Scalable data models and persistent storage for Profile Documents, Resumes, and Settings
import { getDeclaredSkills, saveDeclaredSkills } from "./assessmentData";
import { userLocalStorage as localStorage } from "@/lib/userStorage";

export interface ProfileDocumentItem {
  id: string;
  title: string;
  category: "Academic Record" | "Identity Proof" | "Certificate" | "Skill Evidence" | "Other";
  fileName: string;
  fileSize: string;
  fileDataUrl?: string;
  uploadedAt: string;
  verified: boolean;
}

export interface ProfileResumeItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileDataUrl?: string;
  uploadedAt: string;
  isPrimary: boolean;
  usedInAppsCount: number;
}

export interface ProfileSettingsState {
  recruiterProfileVisibility: boolean;
  institutionProfileVisibility: boolean;
  applicationNotifications: boolean;
  emailAlerts: boolean;
  publicPortfolioLink: boolean;
  placementStatusConsent: boolean;
}

const PROFILE_DOCS_KEY = "job-buddy-profile-documents";
const PROFILE_RESUMES_KEY = "job-buddy-profile-resumes";
const PROFILE_SETTINGS_KEY = "job-buddy-profile-settings";

export function getProfileDocuments(): ProfileDocumentItem[] {
  try {
    const raw = localStorage.getItem(PROFILE_DOCS_KEY);
    if (!raw) {
      const defaults: ProfileDocumentItem[] = [
        {
          id: "doc-1",
          title: "Semester 3 academic record",
          category: "Academic Record",
          fileName: "Semester_3_Official_Marksheet.pdf",
          fileSize: "184 KB",
          uploadedAt: "15 Aug 2026",
          verified: true,
        },
        {
          id: "doc-2",
          title: "Semester 4 academic record",
          category: "Academic Record",
          fileName: "Semester_4_Transcript_Provisional.pdf",
          fileSize: "245 KB",
          uploadedAt: "24 Aug 2026",
          verified: false,
        },
        {
          id: "doc-3",
          title: "Government Identity proof",
          category: "Identity Proof",
          fileName: "National_Identity_Card_AS.pdf",
          fileSize: "120 KB",
          uploadedAt: "10 Aug 2026",
          verified: true,
        },
        {
          id: "doc-4",
          title: "Skill evidence note & project brief",
          category: "Skill Evidence",
          fileName: "Data_Analysis_Coursework_Brief.pdf",
          fileSize: "310 KB",
          uploadedAt: "20 Aug 2026",
          verified: true,
        },
      ];
      localStorage.setItem(PROFILE_DOCS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProfileDocuments(docs: ProfileDocumentItem[]): void {
  try {
    localStorage.setItem(PROFILE_DOCS_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error("Failed to save profile documents:", err);
  }
}

export function addProfileDocument(doc: Omit<ProfileDocumentItem, "id" | "uploadedAt">): ProfileDocumentItem {
  const docs = getProfileDocuments();
  const newDoc: ProfileDocumentItem = {
    ...doc,
    id: `doc-${Date.now()}`,
    uploadedAt: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
  const updated = [newDoc, ...docs];
  saveProfileDocuments(updated);
  return newDoc;
}

export function deleteProfileDocument(id: string): void {
  const docs = getProfileDocuments();
  saveProfileDocuments(docs.filter((d) => d.id !== id));
}

export function downloadProfileDocument(doc: ProfileDocumentItem): void {
  if (doc.fileDataUrl) {
    const a = document.createElement("a");
    a.href = doc.fileDataUrl;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const content = `JOB BUDDY VERIFIED PROFILE DOCUMENT\n\nTitle: ${doc.title}\nCategory: ${doc.category}\nFile: ${doc.fileName}\nUploaded: ${doc.uploadedAt}\nVerification Status: ${doc.verified ? "VERIFIED" : "PENDING REVIEW"}\nStudent: Anaya Sharma (STU-102417)`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function getProfileResumes(): ProfileResumeItem[] {
  try {
    const raw = localStorage.getItem(PROFILE_RESUMES_KEY);
    if (!raw) {
      const defaults: ProfileResumeItem[] = [
        {
          id: "res-1",
          title: "Primary Engineering & Systems Resume",
          fileName: "Anaya_Sharma_Technical_Resume.pdf",
          fileSize: "195 KB",
          uploadedAt: "18 Aug 2026",
          isPrimary: true,
          usedInAppsCount: 2,
        },
        {
          id: "res-2",
          title: "Data Analysis & Research Focus Resume",
          fileName: "Anaya_Sharma_Data_Analyst_Resume.pdf",
          fileSize: "210 KB",
          uploadedAt: "25 Aug 2026",
          isPrimary: false,
          usedInAppsCount: 1,
        },
      ];
      localStorage.setItem(PROFILE_RESUMES_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProfileResumes(resumes: ProfileResumeItem[]): void {
  try {
    localStorage.setItem(PROFILE_RESUMES_KEY, JSON.stringify(resumes));
  } catch (err) {
    console.error("Failed to save resumes:", err);
  }
}

export function addProfileResume(
  title: string,
  fileName: string,
  fileSize = "200 KB",
  fileDataUrl?: string
): ProfileResumeItem {
  const resumes = getProfileResumes();
  const newResume: ProfileResumeItem = {
    id: `res-${Date.now()}`,
    title,
    fileName,
    fileSize,
    fileDataUrl,
    uploadedAt: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    isPrimary: resumes.length === 0,
    usedInAppsCount: 0,
  };
  const updated = [newResume, ...resumes];
  saveProfileResumes(updated);
  return newResume;
}

export function setPrimaryResume(id: string): void {
  const resumes = getProfileResumes();
  const updated = resumes.map((r) => ({
    ...r,
    isPrimary: r.id === id,
  }));
  saveProfileResumes(updated);
}

export function deleteProfileResume(id: string): void {
  const resumes = getProfileResumes();
  const filtered = resumes.filter((r) => r.id !== id);
  // Ensure at least one resume is primary if any exist
  if (filtered.length > 0 && !filtered.some((r) => r.isPrimary)) {
    filtered[0].isPrimary = true;
  }
  saveProfileResumes(filtered);
}

export function downloadProfileResume(resume: ProfileResumeItem): void {
  if (resume.fileDataUrl) {
    const a = document.createElement("a");
    a.href = resume.fileDataUrl;
    a.download = resume.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const content = `======================================================================\n                          ANAYA SHARMA - RESUME\n======================================================================\nEmail: anaya.sharma@example.edu | Phone: +91 9812345510\nInstitution: SIH Partner Institution | Batch: 2028 | Major: Computer Science\nCGPA: 8.14 | 10th: 91.2% | 12th: 88.6%\n\nTECHNICAL SKILLS:\nPython, SQL, Data Analysis, Research Writing, Communication, Git, Machine Learning\n\nACADEMIC PROJECTS:\n1. Predictive Telemetry Data Pipeline (Python, Pandas, SQL)\n2. Healthcare Clinical Research Operations Framework (Evidence Synthesizer)\n\nCERTIFICATIONS & AWARDS:\n- Data Foundations Certificate (Industry Council)\n- SQL Evidence & Data Querying Credential\n======================================================================`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.fileName.replace(/\.[^/.]+$/, "") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function getProfileSettings(): ProfileSettingsState {
  try {
    const raw = localStorage.getItem(PROFILE_SETTINGS_KEY);
    if (!raw) {
      const defaults: ProfileSettingsState = {
        recruiterProfileVisibility: true,
        institutionProfileVisibility: true,
        applicationNotifications: true,
        emailAlerts: true,
        publicPortfolioLink: false,
        placementStatusConsent: true,
      };
      localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return {
      recruiterProfileVisibility: true,
      institutionProfileVisibility: true,
      applicationNotifications: true,
      emailAlerts: true,
      publicPortfolioLink: false,
      placementStatusConsent: true,
    };
  }
}

export function saveProfileSettings(settings: ProfileSettingsState): void {
  try {
    localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}
