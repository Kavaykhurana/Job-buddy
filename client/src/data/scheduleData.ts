// Scalable Schedule and Calendar Data Engine
export interface ScheduleEvent {
  id: string;
  title: string;
  kind: "Evaluation" | "Event" | "Interview" | "Deadline" | "Workshop";
  date: string; // "02 Sep 2026"
  dayNumber: number;
  dayOfWeek: string; // "Wednesday"
  month: string; // "SEP"
  time: string; // "10:00 – 11:00"
  duration: string; // "60 min"
  location: string;
  organizer: string;
  description: string;
  agenda: string[];
  preparationTips: string;
  meetingLink?: string;
  status: "Scheduled" | "Completed" | "Upcoming";
  isAddedToMyCalendar?: boolean;
}

const SCHEDULE_STORAGE_KEY = "sih-connect-student-schedule-events";

export const initialScheduleEvents: ScheduleEvent[] = [
  {
    id: "sch-01",
    title: "Skill Evidence & Profile Review Clinic",
    kind: "Event",
    date: "02 Sep 2026",
    dayNumber: 2,
    dayOfWeek: "Wednesday",
    month: "SEP",
    time: "10:00 – 11:00",
    duration: "60 min",
    location: "Online (Virtual Session Room)",
    organizer: "Northstar Systems & University Placement Cell",
    description:
      "Interactive session with Northstar Systems campus recruiters. Recruiters will review how to structure declared and verified skill evidence, project portfolios, and repository links for maximum impact during recruiter screening.",
    agenda: [
      "Overview of institutional skill alignment standards and weightings",
      "Live walkthrough of high-performing student evidence portfolios",
      "Direct Q&A with Senior Technical Recruiter on common screening mistakes",
    ],
    preparationTips:
      "Have your latest project repo link, profile declared skills, and resume ready for live feedback.",
    meetingLink: "https://meet.google.com/sih-skill-clinic",
    status: "Scheduled",
    isAddedToMyCalendar: true,
  },
  {
    id: "sch-02",
    title: "Candidate Evaluation & Screening Briefing",
    kind: "Evaluation",
    date: "03 Sep 2026",
    dayNumber: 3,
    dayOfWeek: "Thursday",
    month: "SEP",
    time: "14:30 – 15:15",
    duration: "45 min",
    location: "Placement Cell · Seminar Room 4 (Hybrid)",
    organizer: "Mosaic Health Labs",
    description:
      "Mandatory briefing for students shortlisted or eligible for the Mosaic Health Data & Clinical Research Operations cohort. Explains the multi-stage technical evaluation rubric, timeline, and candidate expectations.",
    agenda: [
      "Evaluation format and stage progression breakdown",
      "Scoring criteria across Technical & Analytical dimensions",
      "Document verification guidelines and timetable",
    ],
    preparationTips:
      "Verify that your Semester 3 & 4 transcripts are uploaded in Profile Documents prior to attending.",
    meetingLink: "https://meet.google.com/mosaic-eval-brief",
    status: "Upcoming",
    isAddedToMyCalendar: true,
  },
  {
    id: "sch-03",
    title: "Northstar Systems Technical Panel Interview",
    kind: "Interview",
    date: "04 Sep 2026",
    dayNumber: 4,
    dayOfWeek: "Friday",
    month: "SEP",
    time: "11:30 – 12:30",
    duration: "60 min",
    location: "Online (Interview Room 1)",
    organizer: "Northstar Systems Talent Acquisition",
    description:
      "1-on-1 technical systems panel discussion with Lead Applied AI Engineers. Focuses on applied Python data structures, telemetry pipeline architectures, and project contributions.",
    agenda: [
      "Architecture walkthrough of candidate portfolio project",
      "Core applied Python & SQL problem-solving session",
      "Candidate questions regarding engineering team culture and tools",
    ],
    preparationTips:
      "Test your camera and microphone beforehand. Review your predictive telemetry project code.",
    meetingLink: "https://meet.google.com/northstar-interview-panel",
    status: "Upcoming",
    isAddedToMyCalendar: true,
  },
  {
    id: "sch-04",
    title: "Tern & Co. Product Review Cohort Q&A",
    kind: "Event",
    date: "07 Sep 2026",
    dayNumber: 7,
    dayOfWeek: "Monday",
    month: "SEP",
    time: "16:00 – 16:45",
    duration: "45 min",
    location: "Online (Webinar Room)",
    organizer: "Tern & Co.",
    description:
      "Open information and Q&A session on the product analytics and user-research cohort. Recruiters explain day-to-day responsibilities, mentorship support, and conversion to full-time.",
    agenda: [
      "Cohort overview and product operations roadmap",
      "Portfolio case-study expectations",
      "Live audience Q&A with Product Managers",
    ],
    preparationTips:
      "Prepare questions regarding portfolio evidence expectations for product analyst roles.",
    meetingLink: "https://meet.google.com/tern-cohort-qa",
    status: "Upcoming",
    isAddedToMyCalendar: false,
  },
  {
    id: "sch-05",
    title: "Phase-1 Placement Application Cutoff",
    kind: "Deadline",
    date: "10 Sep 2026",
    dayNumber: 10,
    dayOfWeek: "Thursday",
    month: "SEP",
    time: "23:59",
    duration: "Deadline",
    location: "SIH-Connect Portal Submission",
    organizer: "University Central Placement Cell",
    description:
      "Final deadline for applying to Phase-1 enterprise placement drives and early-access internship opportunities across partner recruiters.",
    agenda: [
      "Profile verification lock",
      "Recruiter screening batch generation",
      "Shortlist publication for initial interview rounds",
    ],
    preparationTips:
      "Ensure all declared skills, primary resume, and marksheet documents are finalized.",
    status: "Upcoming",
    isAddedToMyCalendar: true,
  },
];

export function getScheduleEvents(): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(initialScheduleEvents));
      return initialScheduleEvents;
    }
    return JSON.parse(raw);
  } catch {
    return initialScheduleEvents;
  }
}

export function saveScheduleEvents(events: ScheduleEvent[]): void {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save schedule events:", err);
  }
}

export function toggleEventCalendarStatus(id: string): { event: ScheduleEvent; isAdded: boolean } {
  const events = getScheduleEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Event not found");

  const current = events[index];
  const updatedEvent: ScheduleEvent = {
    ...current,
    isAddedToMyCalendar: !current.isAddedToMyCalendar,
  };
  events[index] = updatedEvent;
  saveScheduleEvents(events);
  return { event: updatedEvent, isAdded: !!updatedEvent.isAddedToMyCalendar };
}

export function addCustomPreparationBlock(title: string, time = "17:30 – 18:00", date = "02 Sep 2026"): ScheduleEvent {
  const events = getScheduleEvents();
  const newEvent: ScheduleEvent = {
    id: `custom-${Date.now()}`,
    title,
    kind: "Event",
    date,
    dayNumber: 2,
    dayOfWeek: "Wednesday",
    month: "SEP",
    time,
    duration: "30 min",
    location: "Personal Workspace",
    organizer: "Self-scheduled preparation",
    description:
      "Dedicated focus session for reviewing application materials, practicing coding problems, and preparing interview talking points.",
    agenda: [
      "Review job requirements and required skills",
      "Review past project architecture & codebase",
      "Prepare questions for recruiters/evaluators",
    ],
    preparationTips: "Set aside uninterrupted time in a quiet environment.",
    status: "Scheduled",
    isAddedToMyCalendar: true,
  };
  const updated = [newEvent, ...events];
  saveScheduleEvents(updated);
  return newEvent;
}

export function getFormattedCurrentDate(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year = now.getFullYear();
  return `${dayName}, ${day} ${month} ${year} · IST`;
}

import { addStudentNotification, updateCandidateStage } from "./portalData";

export function scheduleInterviewForCandidate(params: {
  candidateId: string;
  candidateName: string;
  opportunityTitle?: string;
  organization?: string;
  date: string; // e.g. "05 Sep 2026"
  time: string; // e.g. "14:00 – 15:00"
  duration?: string; // e.g. "45 min"
  mode?: string;
  location?: string;
  meetingLink?: string;
  evaluators?: string;
  notes?: string;
  agenda?: string[];
}): ScheduleEvent {
  const events = getScheduleEvents();
  const org = params.organization || "Northstar Systems";
  const role = params.opportunityTitle || "Applied AI Capability Studio";
  const duration = params.duration || "45 min";
  const mode = params.mode || "Online";
  const loc = params.location || (mode === "Online" ? (params.meetingLink || "Online (Google Meet · Candidate Room)") : "Placement Cell · Interview Room 2");
  
  // Parse date components safely
  let dayNumber = 5;
  let dayOfWeek = "Friday";
  let month = "SEP";
  try {
    const parts = params.date.split(/[\s-]+/);
    if (parts.length >= 2) {
      const parsedNum = parseInt(parts[0], 10);
      if (!isNaN(parsedNum)) dayNumber = parsedNum;
      month = parts[1].substring(0, 3).toUpperCase();
    }
  } catch {}

  const newEvent: ScheduleEvent = {
    id: `interview-${Date.now()}`,
    title: `${org} Interview · ${role}`,
    kind: "Interview",
    date: params.date,
    dayNumber,
    dayOfWeek,
    month,
    time: params.time,
    duration,
    location: loc,
    organizer: `${org} Talent Acquisition`,
    description: `Structured technical and candidate competency interview with ${org} recruiters and evaluators (${params.evaluators || "Recruitment Panel"}).`,
    agenda: params.agenda && params.agenda.length > 0 ? params.agenda : [
      "Candidate introduction & technical evidence walkthrough",
      "Scenario discussion & role alignment evaluation",
      "Candidate questions and next steps",
    ],
    preparationTips: params.notes || "Ensure your resume and declared skill projects are accessible for live discussion.",
    meetingLink: params.meetingLink || (mode === "Online" ? "https://meet.google.com/sih-interview-room" : undefined),
    status: "Scheduled",
    isAddedToMyCalendar: true,
  };

  const updatedEvents = [newEvent, ...events];
  saveScheduleEvents(updatedEvents);

  // 1. Dispatch notification to Candidate/Student perspective
  addStudentNotification({
    title: `Interview Invitation · ${org}`,
    message: `You have been scheduled for an interview for "${role}" on ${params.date} at ${params.time}. Evaluator: ${params.evaluators || "Panel"}.`,
    type: "interview",
    link: "/calendar",
  });

  // 2. Update candidate stage in recruiter register
  updateCandidateStage(params.candidateId, "Interview Scheduled", {
    date: params.date,
    time: params.time,
    mode,
    location: loc,
    evaluators: params.evaluators || "Evaluation Panel",
    meetingLink: newEvent.meetingLink,
    notes: params.notes,
  });

  return newEvent;
}

export function downloadCalendarEvent(event: ScheduleEvent): void {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SIH Connect//Student Schedule//EN
BEGIN:VEVENT
UID:${event.id}@sih-connect.edu
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}
LOCATION:${event.location}
ORGANIZER;CN="${event.organizer}":mailto:placement@sih-connect.edu
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


