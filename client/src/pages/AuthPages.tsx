import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { roleHome, type UserRole } from "@/data/portalData";
import { useAuth } from "@/contexts/AuthContext";
import sihConnectMark from "@/assets/sih-connect-mark.svg";
import "./AuthPages.css";

function homeFor(roles: string[]): UserRole {
  if (roles.includes("RECRUITER")) return "recruiter";
  if (roles.includes("INSTITUTION")) return "institution";
  if (roles.includes("ACADEMICIAN")) return "academician";
  return "student";
}

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function enterWorkspace() {
    setError(""); setSubmitting(true);
    try {
      const user = mode === "login" ? await login(email, password) : await register(displayName, email, password);
      setLocation(roleHome[homeFor(user.roles)]);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Sign in could not be completed.");
    } finally { setSubmitting(false); }
  }

  return <main className="auth-page"><section className="auth-intro"><div className="auth-brand"><img src={sihConnectMark} alt="SIH Connect" /><span>SIH <em>Connect</em></span></div><div className="auth-copy"><p className="eyebrow">Placement evidence register</p><h1>Access your assigned workspace.</h1><p>Review verified skill evidence, active opportunities, and accountable next steps.</p></div><div className="auth-benefits"><span><CheckCircle2 size={15} /> Secure account access</span><span><CheckCircle2 size={15} /> Short-lived access sessions</span><span><ShieldCheck size={15} /> Server-enforced permissions</span></div></section><section className="auth-panel"><div><p className="eyebrow">{mode === "login" ? "Sign in" : "Student registration"}</p><h2>{mode === "login" ? "Enter your workspace" : "Create your student account"}</h2><p className="auth-muted">Only an authorised administrator can assign staff and recruiter roles.</p></div>{mode === "register" && <label className="auth-label">Full name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required /></label>}<label className="auth-label">Email or institutional ID<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@institution.edu" autoComplete="username" required /></label><label className="auth-label">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="12+ characters, including a letter and number" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button type="button" className="auth-submit" disabled={submitting} onClick={() => void enterWorkspace()}>{submitting ? "Verifying…" : mode === "login" ? "Sign in" : "Create student account"} <ArrowRight size={16} /></button><button type="button" className="auth-mode-switch" onClick={() => { setMode((current) => current === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need a student account? Register" : "Already have an account? Sign in"}</button></section></main>;
}
