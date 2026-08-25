// Field Notes Institutional Workspace: concise account entry surface for the SIH Connect prototype.
import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { roleHome, type UserRole } from "@/data/portalData";
import { useAuth } from "@/contexts/AuthContext";
import sihConnectMark from "@/assets/sih-connect-mark.svg";
import "./AuthPages.css";

const roleChoices: { role: UserRole; label: string; note: string }[] = [
  { role: "student", label: "Student", note: "Skills, learning, internships, and placements" },
  { role: "recruiter", label: "Industry", note: "Opportunities, candidates, and recruitment" },
  { role: "institution", label: "Institution", note: "Readiness, outcomes, and curriculum alignment" },
  { role: "academician", label: "Academician", note: "Training, research, and collaboration" },
];

const defaultAccounts: Record<UserRole, { email: string; name: string }> = {
  student: { email: "anaya.sharma@example.edu", name: "Anaya Sharma" },
  recruiter: { email: "recruitment@quantum-systems.io", name: "Vikram Malhotra" },
  institution: { email: "dean.placements@apex-tech.edu", name: "Dr. Sunita Rao" },
  academician: { email: "prof.mehta@apex-tech.edu", name: "Prof. Arvind Mehta" },
};

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("anaya.sharma@example.edu");
  const [displayName, setDisplayName] = useState("Anaya Sharma");
  const [password, setPassword] = useState("password12345");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    if (!email || Object.values(defaultAccounts).some((acc) => acc.email === email)) {
      setEmail(defaultAccounts[newRole].email);
      setDisplayName(defaultAccounts[newRole].name);
    }
  }

  async function enterWorkspace() {
    setError(""); setSubmitting(true);
    try {
      const user = mode === "login" ? await login(email, password, role) : await register(displayName, email, password, role);
      const mappedRole: UserRole = user.roles.includes("RECRUITER") ? "recruiter" : user.roles.includes("INSTITUTION") ? "institution" : user.roles.includes("ACADEMICIAN") ? "academician" : role;
      setLocation(roleHome[mappedRole]);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Sign in could not be completed.");
    } finally { setSubmitting(false); }
  }

  return <main className="auth-page"><section className="auth-intro"><div className="auth-brand"><img src={sihConnectMark} alt="SIH Connect" /><span>SIH <em>Connect</em></span></div><div className="auth-copy"><p className="eyebrow">Placement evidence register</p><h1>Access the record behind placement progress.</h1><p>Review skill evidence, active opportunities, and accountable next steps within your assigned workspace.</p></div><div className="auth-benefits"><span><CheckCircle2 size={15} /> Secure access and session renewal</span><span><CheckCircle2 size={15} /> Placement and internship lifecycle</span><span><ShieldCheck size={15} /> Backend-enforced role-aware access</span></div></section><section className="auth-panel"><div><p className="eyebrow">{mode === "login" ? "Secure sign in" : "Student record registration"}</p><h2>{mode === "login" ? "Enter your workspace" : "Start your student record"}</h2><p className="auth-muted">{mode === "login" ? "Use the credentials issued for your SIH Connect access record." : "Registration creates a student account. Other roles are assigned by an authorised administrator."}</p></div><div className="auth-context"><span>Access context</span><b>{mode === "login" ? "Role record · placement cycle" : "Student record · evidence intake"}</b></div>{mode === "register" && <label className="auth-label">Full name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>}<label className="auth-label">Email or institutional ID<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@institution.edu" autoComplete="username" /></label><label className="auth-label">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters, including a letter and number" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{mode === "login" && <fieldset className="role-choice"><legend>Workspace preference</legend>{roleChoices.map((choice) => <label key={choice.role} className={role === choice.role ? "role-choice-active" : ""}><input type="radio" name="role" value={choice.role} checked={role === choice.role} onChange={() => handleRoleChange(choice.role)} /><span><b>{choice.label}</b><small>{choice.note}</small></span></label>)}</fieldset>}{error && <p className="auth-error" role="alert">{error}</p>}<button type="button" className="auth-submit" disabled={submitting} onClick={() => void enterWorkspace()}>{submitting ? "Verifying secure access…" : mode === "login" ? "Sign in securely" : "Create student account"} <ArrowRight size={16} /></button><button type="button" className="auth-mode-switch" onClick={() => { setMode((current) => current === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need a student account? Register" : "Already have an account? Sign in"}</button><p className="auth-footnote">Your password is verified by the Java backend; sessions use short-lived access tokens and a protected refresh session.</p></section></main>;
}
