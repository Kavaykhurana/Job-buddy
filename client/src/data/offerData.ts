// Scalable data models and persistent store for Student Offers and Placement Records
import { userLocalStorage as localStorage } from "@/lib/userStorage";
export interface JobOffer {
  id: string;
  applicationId?: string;
  jobTitle: string;
  organization: string;
  location: string;
  ctc: string; // e.g. "₹14,50,000 / annum"
  baseSalary?: string;
  roleType: string;
  issuedDate: string; // e.g. "28 Aug 2026"
  expiryDate: string; // e.g. "10 Sep 2026"
  status: "Pending Decision" | "Accepted" | "Declined";
  letterOfIntentUrl?: string;
  letterOfIntentFileName?: string;
  summary: string;
  benefits: string[];
  acceptedAt?: string;
}

export interface PlacementStatusRecord {
  placementWindow: "Open" | "Closed" | "Extended";
  status: "Open for placement" | "Placed" | "Opted out";
  placedOfferId?: string;
  placedCompany?: string;
  placedRole?: string;
  placedCtc?: string;
  batch: string;
  department: string;
  institution: string;
  academicEvidence: "Verified" | "Partially verified" | "Action required";
  placedAt?: string;
}

const OFFERS_STORAGE_KEY = "job-buddy-student-offers";
const PLACEMENT_STATUS_KEY = "job-buddy-placement-status";

export function getStudentOffers(): JobOffer[] {
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (!raw) {
      // Default initial offer for Northstar Systems Applied AI Capability Studio
      const defaultOffers: JobOffer[] = [
        {
          id: "offer-northstar-ai-01",
          applicationId: "app-ai-studio-01",
          jobTitle: "Junior Applied AI & Systems Engineer",
          organization: "Northstar Systems",
          location: "Hybrid · Bengaluru",
          ctc: "₹14,50,000 / annum (CTC)",
          baseSalary: "₹12,00,000 fixed + ₹2,50,000 variable performance bonus",
          roleType: "Full-time placement",
          issuedDate: "28 Aug 2026",
          expiryDate: "10 Sep 2026",
          status: "Pending Decision",
          letterOfIntentFileName: "Northstar_Systems_Letter_of_Intent_Anaya_Sharma.pdf",
          summary:
            "Following successful technical evaluation and panel briefing, Northstar Systems extends an official employment offer for the Applied AI & Engineering capability cohort.",
          benefits: [
            "Comprehensive Health & Term Insurance (₹10,00,000 coverage)",
            "Hybrid work allowance & modern workstation hardware kit",
            "Annual learning & certification budget (₹75,000)",
            "Performance retention bonus at Month 12",
          ],
        },
      ];
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(defaultOffers));
      return defaultOffers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudentOffers(offers: JobOffer[]): void {
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  } catch (err) {
    console.error("Failed to save offers:", err);
  }
}

export function getPlacementStatus(): PlacementStatusRecord {
  try {
    const raw = localStorage.getItem(PLACEMENT_STATUS_KEY);
    if (!raw) {
      const defaultRecord: PlacementStatusRecord = {
        placementWindow: "Open",
        status: "Open for placement",
        batch: "Batch 2028",
        department: "Computer Science & Engineering",
        institution: "Job-buddy Partner Institution",
        academicEvidence: "Partially verified",
      };
      localStorage.setItem(PLACEMENT_STATUS_KEY, JSON.stringify(defaultRecord));
      return defaultRecord;
    }
    return JSON.parse(raw);
  } catch {
    return {
      placementWindow: "Open",
      status: "Open for placement",
      batch: "Batch 2028",
      department: "Computer Science & Engineering",
      institution: "Job-buddy Partner Institution",
      academicEvidence: "Partially verified",
    };
  }
}

export function savePlacementStatus(record: PlacementStatusRecord): void {
  try {
    localStorage.setItem(PLACEMENT_STATUS_KEY, JSON.stringify(record));
  } catch (err) {
    console.error("Failed to save placement status:", err);
  }
}

export function acceptJobOffer(offerId: string): { success: boolean; offer?: JobOffer } {
  const offers = getStudentOffers();
  const offerIndex = offers.findIndex((o) => o.id === offerId);
  if (offerIndex < 0) return { success: false };

  const targetOffer = offers[offerIndex];
  const acceptedOffer: JobOffer = {
    ...targetOffer,
    status: "Accepted",
    acceptedAt: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  offers[offerIndex] = acceptedOffer;
  saveStudentOffers(offers);

  // Update placement status record
  const currentPlacement = getPlacementStatus();
  const updatedPlacement: PlacementStatusRecord = {
    ...currentPlacement,
    status: "Placed",
    placedOfferId: acceptedOffer.id,
    placedCompany: acceptedOffer.organization,
    placedRole: acceptedOffer.jobTitle,
    placedCtc: acceptedOffer.ctc,
    placedAt: acceptedOffer.acceptedAt,
  };
  savePlacementStatus(updatedPlacement);

  return { success: true, offer: acceptedOffer };
}

export function declineJobOffer(offerId: string): { success: boolean; offer?: JobOffer } {
  const offers = getStudentOffers();
  const offerIndex = offers.findIndex((o) => o.id === offerId);
  if (offerIndex < 0) return { success: false };

  const targetOffer = offers[offerIndex];
  const declinedOffer: JobOffer = {
    ...targetOffer,
    status: "Declined",
  };

  offers[offerIndex] = declinedOffer;
  saveStudentOffers(offers);

  // If this was the placed offer, revert status
  const currentPlacement = getPlacementStatus();
  if (currentPlacement.placedOfferId === offerId) {
    savePlacementStatus({
      ...currentPlacement,
      status: "Open for placement",
      placedOfferId: undefined,
      placedCompany: undefined,
      placedRole: undefined,
      placedCtc: undefined,
      placedAt: undefined,
    });
  }

  return { success: true, offer: declinedOffer };
}

export function downloadOfferLetter(offer: JobOffer): void {
  const content = `======================================================================
               JOB-BUDDY OFFICIAL LETTER OF INTENT & EMPLOYMENT OFFER
======================================================================

Date: ${offer.issuedDate}
Candidate Name: Anaya Sharma (STU-102417)
Batch: 2028 · Computer Science

Dear Anaya Sharma,

We are pleased to extend an official Letter of Intent for employment with ${offer.organization.toUpperCase()}.

1. POSITION & ROLE
   Job Title: ${offer.jobTitle}
   Role Type: ${offer.roleType}
   Location: ${offer.location}

2. COMPENSATION & BENEFITS
   Total CTC: ${offer.ctc}
   Breakdown: ${offer.baseSalary || offer.ctc}
   
   Included Benefits:
   ${offer.benefits.map((b, i) => `   ${i + 1}. ${b}`).join("\n")}

3. ACCEPTANCE & VERIFICATION
   Offer Status: ${offer.status.toUpperCase()}
   Valid Until: ${offer.expiryDate}
   Institutional Verification: Job-buddy Partner Institution Placement Cell

Authorized Signatory,
Campus Talent Acquisition & University Relations
${offer.organization}
======================================================================`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${offer.organization.replace(/\s+/g, "_")}_Offer_Letter_Anaya_Sharma.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
