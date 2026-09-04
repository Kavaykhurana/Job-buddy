// Type-safe REST API client. All requests use the authenticated session client.
import { apiRequest } from "./authApi";

export interface Job {
  id: string;
  title: string;
  organization: string;
  location: string;
  date: string;
  match: number;
  status: string;
  required: string[];
  preferred: string[];
  type: string;
  summary: string;
}

export interface Internship {
  id: string;
  title: string;
  org: string;
  mode: string;
  match: number;
  status: string;
  close: string;
  interest: string;
  required: string[];
  preferred: string[];
  summary: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  studentName: string;
  studentEmail: string;
  stage: string;
  appliedAt: string;
  statement: string;
}

export interface Candidate {
  id: string;
  name: string;
  program: string;
  score: number;
  eligibility: string;
  stage: string;
  skills: string[];
  shortlisted?: boolean;
}

export interface UserProfile {
  displayName: string;
  email: string;
  phone?: string;
  program: string;
  declaredSkills: string[];
  documents: { id: string; title: string; verified: boolean }[];
}

export interface SkillRequirement {
  skill: string;
  level: string;
  importance: string;
}

export interface CompanyRoleRequirement {
  company: string;
  industry: string;
  roles: {
    title: string;
    demand: string;
    updated: string;
    eligible: string;
    requirements: SkillRequirement[];
  }[];
}

export interface CurriculumNote {
  id: string;
  program: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Initiative {
  id: string;
  kind: string;
  title: string;
  org: string;
  speaker?: string;
  mentor?: string;
  date?: string;
  status?: string;
  participants: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith("/api/v1") ? endpoint.slice("/api/v1".length) : endpoint;
  return apiRequest<T>(path.startsWith("/") ? path : `/${path}`, options);
}

export const api = {
  // Jobs CRUD
  jobs: {
    list: () => request<Job[]>("/jobs"),
    get: (id: string) => request<Job>(`/jobs/${id}`),
    create: (data: Partial<Job> & { requiredSkills?: string; preferredSkills?: string }) =>
      request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Job>) =>
      request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/jobs/${id}`, { method: "DELETE" }),
  },

  // Applications CRUD
  applications: {
    list: () => request<Application[]>("/applications"),
    submit: (data: { jobId: string; statement: string }) =>
      request<Application>("/applications", { method: "POST", body: JSON.stringify(data) }),
    updateStage: (id: string, stage: string) =>
      request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) }),
  },

  // Internships CRUD
  internships: {
    list: () => request<Internship[]>("/internships"),
    create: (data: Partial<Internship>) =>
      request<Internship>("/internships", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/internships/${id}`, { method: "DELETE" }),
  },

  // Candidates & Evaluations CRUD
  candidates: {
    list: () => request<Candidate[]>("/candidates"),
    toggleShortlist: (id: string, shortlisted?: boolean) =>
      request<{ success: boolean; candidate: Candidate }>(`/candidates/${id}/shortlist`, {
        method: "POST",
        body: JSON.stringify({ shortlisted }),
      }),
    saveScorecard: (id: string, score: number, stage?: string) =>
      request<{ success: boolean; candidate: Candidate }>(`/candidates/${id}/scorecard`, {
        method: "POST",
        body: JSON.stringify({ score, stage }),
      }),
  },

  // Profile & Skills CRUD
  profile: {
    get: () => request<UserProfile>("/profile"),
    update: (data: Partial<UserProfile>) =>
      request<UserProfile>("/profile", { method: "PUT", body: JSON.stringify(data) }),
    addSkill: (skill: string) =>
      request<string[]>("/profile/skills", { method: "POST", body: JSON.stringify({ skill }) }),
    deleteSkill: (skill: string) =>
      request<string[]>(`/profile/skills/${encodeURIComponent(skill)}`, { method: "DELETE" }),
    addDocument: (title: string) =>
      request<{ id: string; title: string; verified: boolean }>("/profile/documents", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    deleteDocument: (id: string) =>
      request<{ success: boolean }>(`/profile/documents/${id}`, { method: "DELETE" }),
  },

  // Requirements CRUD
  requirements: {
    get: () => request<CompanyRoleRequirement[]>("/requirements"),
    addRequirement: (companyIndex: number, roleIndex: number, requirement: SkillRequirement) =>
      request<CompanyRoleRequirement[]>("/requirements", {
        method: "PUT",
        body: JSON.stringify({ companyIndex, roleIndex, requirement }),
      }),
  },

  // Curriculum Notes CRUD
  curriculum: {
    getNotes: () => request<CurriculumNote[]>("/curriculum/notes"),
    addNote: (program: string, note: string) =>
      request<CurriculumNote>("/curriculum/notes", { method: "POST", body: JSON.stringify({ program, note }) }),
  },

  // Initiatives CRUD
  initiatives: {
    list: () => request<Initiative[]>("/initiatives"),
    create: (data: Partial<Initiative>) =>
      request<Initiative>("/initiatives", { method: "POST", body: JSON.stringify(data) }),
  },
};
