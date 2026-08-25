// Field Notes Institutional Workspace: full route map for all approved portal pages and role-based workspaces.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import {
  ApplicationSubmittedPage, ApplicationTrackerPage, ApplyPage, CalendarPage, EventsPage, JobDetailPage, JobsPage, OffersPage, PlacementPage, ProfilePage, SchedulePage, SeasonPage, SkillMapPage,
} from "./pages/StudentPages";
import {
  AcademicianDashboard, AcademicianEvents, AcademicianLearningAlignment, AcademicianProfile, AcademicianStudentMaps, CandidateReviewPage, InstitutionAlignment, InstitutionApplications, InstitutionDashboard, InstitutionInterviews, InstitutionPlacement, InstitutionReadiness, RecruiterCandidates, RecruiterDashboard, RecruiterInterviews, RecruiterOpportunities, RecruiterSkillRequirements,
} from "./pages/RolePages";
import { AssessmentCatalogPage, AssessmentResultsPage, AssessmentSessionPage, CareerGuidancePage, DevelopmentHubPage, SkillComparePage, SkillGapsPage } from "./pages/AssessmentPages";
import { CertificationsPage, DocumentVaultPage, LearningCatalogPage, LearningDetailPage, LearningProgressPage, PortfolioPage, PortfolioSettingsPage } from "./pages/LearningPages";
import { InternshipApplyPage, InternshipCompletionPage, InternshipDetailPage, InternshipEngagementPage, InternshipListPage, InternshipMatchesPage } from "./pages/InternshipPages";
import { AcademicianCollaborationPage, AcademicianOpportunitiesPage, AcademicianTrainingPage, CollaborationHubPage, InstitutionAnalyticsPage, InstitutionCurriculumPage, InstitutionIntegrationsPage, MentorshipPage, PolicyAnalyticsPage, RecruiterAssessmentBuilderPage, RecruiterAssessmentsPage, RecruiterCollaborationPage, RecruiterInternshipEngagementsPage, RecruiterInternshipPublishPage, RecruiterInternshipsPage, RecruiterIntegrationsPage, RecruiterMentorsPage, RecruiterAnalyticsPage } from "./pages/ExtendedRolePages";
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
    <Route path="/events" component={EventsPage} /><Route path="/calendar" component={CalendarPage} /><Route path="/season" component={SeasonPage} /><Route path="/applications/:id" component={ApplicationTrackerPage} /><Route path="/schedule" component={SchedulePage} /><Route path="/offers" component={OffersPage} /><Route path="/placement" component={PlacementPage} />
    <Route path="/profile">{() => <ProfilePage />}</Route><Route path="/profile/documents">{() => <ProfilePage section="documents" />}</Route><Route path="/profile/resumes">{() => <ProfilePage section="resumes" />}</Route><Route path="/profile/settings">{() => <ProfilePage section="settings" />}</Route>
    <Route path="/skill-map/industries">{() => <SkillMapPage focus="industries" />}</Route><Route path="/skill-map/roles">{() => <SkillMapPage focus="roles" />}</Route>
    <Route path="/development" component={DevelopmentHubPage} /><Route path="/assessment" component={AssessmentCatalogPage} /><Route path="/assessment/:id/results">{(params) => <AssessmentResultsPage id={params.id} />}</Route><Route path="/assessment/:id">{(params) => <AssessmentSessionPage id={params.id} />}</Route><Route path="/skill-gaps" component={SkillGapsPage} /><Route path="/skill-compare/:target" component={SkillComparePage} /><Route path="/career-guidance" component={CareerGuidancePage} />
    <Route path="/learning" component={LearningCatalogPage} /><Route path="/learning/progress" component={LearningProgressPage} /><Route path="/learning/:id">{(params) => <LearningDetailPage id={params.id} />}</Route><Route path="/certifications" component={CertificationsPage} /><Route path="/portfolio" component={PortfolioPage} /><Route path="/portfolio/settings" component={PortfolioSettingsPage} /><Route path="/documents" component={DocumentVaultPage} />
    <Route path="/internships" component={InternshipListPage} /><Route path="/internships/matches" component={InternshipMatchesPage} /><Route path="/internships/:id/apply">{(params) => <InternshipApplyPage id={params.id} />}</Route><Route path="/internships/:id/engagement/:record">{() => <InternshipEngagementPage />}</Route><Route path="/internships/:id/completion">{() => <InternshipCompletionPage />}</Route><Route path="/internships/:id">{(params) => <InternshipDetailPage id={params.id} />}</Route>
    <Route path="/collaboration" component={CompleteStudentCollaborationPage} /><Route path="/mentorship" component={MentorshipPage} />
    <Route path="/experiences" component={ExperienceListPage} /><Route path="/experiences/:id/apply">{(params) => <ExperienceApplyPage id={params.id} />}</Route><Route path="/experiences/:id/track">{(params) => <ExperienceTrackerPage id={params.id} />}</Route><Route path="/experiences/:id">{(params) => <ExperienceDetailPage id={params.id} />}</Route><Route path="/collaboration/guest-lectures" component={GuestLecturePage} /><Route path="/collaboration/innovation-challenges" component={InnovationChallengePage} />
    <Route path="/recruiter" component={RecruiterDashboard} /><Route path="/recruiter/opportunities" component={RecruiterOpportunities} /><Route path="/recruiter/experiences" component={RecruiterExperiencesPage} /><Route path="/recruiter/experiences/new" component={RecruiterExperiencePublishPage} /><Route path="/recruiter/jobs/new" component={RecruiterJobPublishPage} /><Route path="/recruiter/internships" component={RecruiterInternshipsPage} /><Route path="/recruiter/internships/new" component={RecruiterInternshipPublishPage} /><Route path="/recruiter/internships/:id/engagements" component={RecruiterInternshipEngagementsPage} /><Route path="/recruiter/mentors" component={RecruiterMentorsPage} /><Route path="/recruiter/assessments" component={RecruiterAssessmentsPage} /><Route path="/recruiter/assessments/new" component={RecruiterAssessmentBuilderPage} /><Route path="/recruiter/candidates" component={RecruiterCandidates} /><Route path="/recruiter/candidates/:id" component={CandidateReviewPage} /><Route path="/recruiter/shortlists" component={RecruiterCandidates} /><Route path="/recruiter/interviews" component={RecruiterInterviews} /><Route path="/recruiter/interviews/:id" component={RecruiterInterviewScorecardPage} /><Route path="/recruiter/skill-requirements" component={RecruiterSkillRequirements} /><Route path="/recruiter/collaboration" component={CompleteRecruiterCollaborationPage} /><Route path="/recruiter/collaboration/guest-lectures">{() => <RecruiterInitiativesPage kind="guest" />}</Route><Route path="/recruiter/collaboration/innovation-challenges">{() => <RecruiterInitiativesPage kind="challenge" />}</Route><Route path="/recruiter/analytics" component={RecruiterAnalyticsPage} /><Route path="/recruiter/integrations" component={RecruiterIntegrationsPage} />
    <Route path="/institution" component={InstitutionDashboard} /><Route path="/institution/readiness" component={InstitutionReadiness} /><Route path="/institution/applications" component={InstitutionApplications} /><Route path="/institution/interviews" component={InstitutionInterviews} /><Route path="/institution/placement-status" component={InstitutionPlacement} /><Route path="/institution/skill-alignment" component={InstitutionAlignment} /><Route path="/institution/curriculum" component={InstitutionCurriculumPage} /><Route path="/institution/analytics" component={InstitutionAnalyticsPage} /><Route path="/institution/integrations" component={InstitutionIntegrationsPage} /><Route path="/policy-analytics" component={PolicyAnalyticsPage} />
    <Route path="/academician" component={AcademicianDashboard} /><Route path="/academician/student-maps" component={AcademicianStudentMaps} /><Route path="/academician/learning-alignment" component={AcademicianLearningAlignment} /><Route path="/academician/opportunities" component={AcademicianOpportunitiesPage} /><Route path="/academician/training" component={AcademicianTrainingPage} /><Route path="/academician/events" component={AcademicianEvents} /><Route path="/academician/collaboration" component={CompleteAcademicianCollaborationPage} /><Route path="/academician/profile" component={AcademicianProfile} />
    <Route path="/404" component={NotFound} /><Route component={NotFound} />
  </Switch>;
}

function RequireAuthentication() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => { if (!loading && !user) setLocation("/sign-in"); }, [loading, setLocation, user]);
  if (loading) return <main className="auth-page"><p className="auth-muted">Restoring your secure session…</p></main>;
  if (!user) return null;
  return <PrivateRouter />;
}

function Router() {
  return <Switch>
    <Route path="/sign-in" component={SignInPage} />
    <Route><RequireAuthentication /></Route>
  </Switch>;
}

function App() { return <ErrorBoundary><AuthProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></AuthProvider></ErrorBoundary>; }

export default App;
