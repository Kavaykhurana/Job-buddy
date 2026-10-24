// Field Notes Institutional Workspace: full route map for all approved portal pages and role-based workspaces.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AssistantWidget } from "./components/AssistantWidget";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import {
  ApplicationSubmittedPage, ApplicationTrackerPage, ApplyPage, CalendarPage, EventsPage, JobDetailPage, JobsPage, OffersPage, PlacementPage, ProfilePage, SchedulePage, SeasonPage, SkillMapPage,
} from "./pages/StudentPages";
import {
  AcademicianDashboard, AcademicianEvents, AcademicianLearningAlignment, AcademicianProfile, AcademicianStudentMaps, CandidateReviewPage, InstitutionAlignment, InstitutionApplications, InstitutionDashboard, InstitutionInterviews, InstitutionPlacement, InstitutionReadiness, RecruiterCandidates, RecruiterDashboard, RecruiterInterviews, RecruiterOpportunities, RecruiterShortlists, RecruiterSkillRequirements,
} from "./pages/RolePages";
import { AssessmentCatalogPage, AssessmentResultsPage, AssessmentSessionPage, CareerGuidancePage, DevelopmentHubPage, SkillComparePage, SkillGapsPage } from "./pages/AssessmentPages";
import { SkillHubPage } from "./pages/SkillHubPage";
import { CertificationsPage, DocumentVaultPage, LearningCatalogPage, LearningDetailPage, LearningProgressPage, PortfolioPage, PortfolioSettingsPage } from "./pages/LearningPages";
import { InternshipApplyPage, InternshipCompletionPage, InternshipDetailPage, InternshipEngagementPage, InternshipListPage, InternshipMatchesPage } from "./pages/InternshipPages";
import { AcademicianOpportunitiesPage, AcademicianTrainingPage, CollaborationHubPage, InstitutionAnalyticsPage, InstitutionCurriculumPage, InstitutionIntegrationsPage, MentorshipPage, PolicyAnalyticsPage, RecruiterAssessmentBuilderPage, RecruiterAssessmentsPage, RecruiterCollaborationPage, RecruiterInternshipEngagementsPage, RecruiterInternshipPublishPage, RecruiterInternshipsPage, RecruiterIntegrationsPage, RecruiterMentorsPage, RecruiterAnalyticsPage } from "./pages/ExtendedRolePages";
import { RecruiterInterviewScorecardPage, RecruiterJobPublishPage } from "./pages/RecruitmentCompletionPages";
import { CompleteAcademicianCollaborationPage, CompleteRecruiterCollaborationPage, CompleteStudentCollaborationPage, ExperienceApplyPage, ExperienceDetailPage, ExperienceListPage, ExperienceTrackerPage, GuestLecturePage, InnovationChallengePage, RecruiterExperiencePublishPage, RecruiterExperiencesPage, RecruiterInitiativesPage } from "./pages/FinalRequirementPages";
import SignInPage from "./pages/AuthPages";

function PrivateRouter() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/jobs" component={JobsPage} />
    <Route path="/jobs/:id/apply">{(params) => <ApplyPage id={params.id} />}</Route>
    <Route path="/jobs/:id/submitted">{(params) => <ApplicationSubmittedPage id={params.id} />}</Route>
    <Route path="/jobs/:id">{(params) => <JobDetailPage id={params.id} />}</Route>
    <Route path="/skills/:skillName">{(params) => <SkillHubPage skillName={params.skillName} />}</Route>
    <Route path="/skills">{() => <SkillHubPage />}</Route>
    <Route path="/events" component={EventsPage} /><Route path="/calendar" component={CalendarPage} /><Route path="/season" component={SeasonPage} /><Route path="/applications/:id">{(params) => <ApplicationTrackerPage id={params.id} />}</Route><Route path="/schedule" component={SchedulePage} /><Route path="/offers" component={OffersPage} /><Route path="/placement" component={PlacementPage} />
    <Route path="/profile">{() => <ProfilePage />}</Route><Route path="/profile/documents">{() => <ProfilePage section="documents" />}</Route><Route path="/profile/resumes">{() => <ProfilePage section="resumes" />}</Route><Route path="/profile/settings">{() => <ProfilePage section="settings" />}</Route>
    <Route path="/skill-map/industries">{() => <SkillMapPage focus="industries" />}</Route><Route path="/skill-map/roles">{() => <SkillMapPage focus="roles" />}</Route>
    <Route path="/development" component={DevelopmentHubPage} /><Route path="/assessment" component={AssessmentCatalogPage} /><Route path="/assessment/:id/results">{(params) => <AssessmentResultsPage id={params.id} />}</Route><Route path="/assessment/:id">{(params) => <AssessmentSessionPage id={params.id} />}</Route><Route path="/skill-gaps" component={SkillGapsPage} /><Route path="/skill-compare/:target" component={SkillComparePage} /><Route path="/career-guidance" component={CareerGuidancePage} />
    <Route path="/learning" component={LearningCatalogPage} /><Route path="/learning/progress" component={LearningProgressPage} /><Route path="/learning/:id">{(params) => <LearningDetailPage id={params.id} />}</Route><Route path="/certifications" component={CertificationsPage} /><Route path="/portfolio" component={PortfolioPage} /><Route path="/portfolio/settings" component={PortfolioSettingsPage} /><Route path="/documents" component={DocumentVaultPage} />
    <Route path="/internships" component={InternshipListPage} /><Route path="/internships/matches" component={InternshipMatchesPage} /><Route path="/internships/:id/apply">{(params) => <InternshipApplyPage id={params.id} />}</Route><Route path="/internships/:id/engagement/:record">{(params) => <InternshipEngagementPage id={params.id} />}</Route><Route path="/internships/:id/engagement">{(params) => <InternshipEngagementPage id={params.id} />}</Route><Route path="/internships/:id/completion">{(params) => <InternshipCompletionPage id={params.id} />}</Route><Route path="/internships/:id">{(params) => <InternshipDetailPage id={params.id} />}</Route>
    <Route path="/collaboration" component={CompleteStudentCollaborationPage} /><Route path="/mentorship" component={MentorshipPage} />
    <Route path="/experiences" component={ExperienceListPage} /><Route path="/experiences/:id/apply">{(params) => <ExperienceApplyPage id={params.id} />}</Route><Route path="/experiences/:id/track">{(params) => <ExperienceTrackerPage id={params.id} />}</Route><Route path="/experiences/:id">{(params) => <ExperienceDetailPage id={params.id} />}</Route><Route path="/collaboration/guest-lectures" component={GuestLecturePage} /><Route path="/collaboration/innovation-challenges" component={InnovationChallengePage} />
    <Route path="/recruiter" component={RecruiterDashboard} /><Route path="/recruiter/opportunities" component={RecruiterOpportunities} /><Route path="/recruiter/experiences" component={RecruiterExperiencesPage} /><Route path="/recruiter/experiences/new" component={RecruiterExperiencePublishPage} /><Route path="/recruiter/jobs/new" component={RecruiterJobPublishPage} /><Route path="/recruiter/internships" component={RecruiterInternshipsPage} /><Route path="/recruiter/internships/new" component={RecruiterInternshipPublishPage} /><Route path="/recruiter/internships/:id/engagements" component={RecruiterInternshipEngagementsPage} /><Route path="/recruiter/mentors" component={RecruiterMentorsPage} /><Route path="/recruiter/assessments" component={RecruiterAssessmentsPage} /><Route path="/recruiter/assessments/new" component={RecruiterAssessmentBuilderPage} /><Route path="/recruiter/candidates" component={RecruiterCandidates} /><Route path="/recruiter/candidates/:id">{(params) => <CandidateReviewPage id={params.id} />}</Route><Route path="/recruiter/shortlists" component={RecruiterShortlists} /><Route path="/recruiter/interviews" component={RecruiterInterviews} /><Route path="/recruiter/interviews/:id" component={RecruiterInterviewScorecardPage} /><Route path="/recruiter/skill-requirements" component={RecruiterSkillRequirements} /><Route path="/recruiter/collaboration" component={CompleteRecruiterCollaborationPage} /><Route path="/recruiter/collaboration/guest-lectures">{() => <RecruiterInitiativesPage kind="guest" />}</Route><Route path="/recruiter/collaboration/innovation-challenges">{() => <RecruiterInitiativesPage kind="challenge" />}</Route><Route path="/recruiter/analytics" component={RecruiterAnalyticsPage} /><Route path="/recruiter/integrations" component={RecruiterIntegrationsPage} />
    <Route path="/institution"><RoleGuard requiredRole="INSTITUTION"><InstitutionDashboard /></RoleGuard></Route><Route path="/institution/readiness"><RoleGuard requiredRole="INSTITUTION"><InstitutionReadiness /></RoleGuard></Route><Route path="/institution/applications"><RoleGuard requiredRole="INSTITUTION"><InstitutionApplications /></RoleGuard></Route><Route path="/institution/interviews"><RoleGuard requiredRole="INSTITUTION"><InstitutionInterviews /></RoleGuard></Route><Route path="/institution/placement-status"><RoleGuard requiredRole="INSTITUTION"><InstitutionPlacement /></RoleGuard></Route><Route path="/institution/skill-alignment"><RoleGuard requiredRole="INSTITUTION"><InstitutionAlignment /></RoleGuard></Route><Route path="/institution/curriculum"><RoleGuard requiredRole="INSTITUTION"><InstitutionCurriculumPage /></RoleGuard></Route><Route path="/institution/analytics"><RoleGuard requiredRole="INSTITUTION"><InstitutionAnalyticsPage /></RoleGuard></Route><Route path="/institution/integrations"><RoleGuard requiredRole="INSTITUTION"><InstitutionIntegrationsPage /></RoleGuard></Route><Route path="/policy-analytics"><RoleGuard requiredRole="INSTITUTION"><PolicyAnalyticsPage /></RoleGuard></Route>
    <Route path="/academician"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianDashboard /></RoleGuard></Route><Route path="/academician/student-maps"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianStudentMaps /></RoleGuard></Route><Route path="/academician/learning-alignment"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianLearningAlignment /></RoleGuard></Route><Route path="/academician/opportunities"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianOpportunitiesPage /></RoleGuard></Route><Route path="/academician/training"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianTrainingPage /></RoleGuard></Route><Route path="/academician/events"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianEvents /></RoleGuard></Route><Route path="/academician/collaboration"><RoleGuard requiredRole="ACADEMICIAN"><CompleteAcademicianCollaborationPage /></RoleGuard></Route><Route path="/academician/profile"><RoleGuard requiredRole="ACADEMICIAN"><AcademicianProfile /></RoleGuard></Route>
    <Route path="/404" component={NotFound} /><Route component={NotFound} />
  </Switch>;
}

// Checks that the authenticated user holds the required role; redirects to / otherwise.
// Placed here so institution and academician routes cannot be accessed by other roles via direct URL.
function RoleGuard({ requiredRole, children }: { requiredRole: string; children: ReactNode }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  // Admins may open every workspace, matching the workspace switcher in AppShell.
  const allowed = !user || user.roles.includes("ADMIN") || (user.roles as string[]).includes(requiredRole);
  useEffect(() => { if (!allowed) setLocation("/"); }, [allowed, setLocation]);
  if (!allowed) return null;
  return <>{children}</>;
}

function RequireAuthentication() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => { if (!loading && !user) setLocation("/sign-in"); }, [loading, setLocation, user]);
  if (loading) return <main className="auth-page"><p className="auth-muted">Restoring your secure session…</p></main>;
  if (!user) return null;
  return <><PrivateRouter /><AssistantWidget /></>;
}

function Router() {
  return <Switch>
    <Route path="/sign-in" component={SignInPage} />
    <Route><RequireAuthentication /></Route>
  </Switch>;
}

function App() { return <ErrorBoundary><AuthProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></AuthProvider></ErrorBoundary>; }

export default App;
