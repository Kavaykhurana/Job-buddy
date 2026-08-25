// Field Notes Institutional Workspace: persistent top navigation and role-aware workspace shell.
import type { ReactNode } from "react";
import { useState } from "react";
import { Bell, ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { roleHome, roleNavigation, type UserRole } from "@/data/portalData";
import { useAuth } from "@/contexts/AuthContext";
import sihConnectMark from "@/assets/sih-connect-mark.svg";
import "./AppShell.css";
import "./FieldNotesRefinement.css";

const roleLabel: Record<UserRole, string> = { student: "Student view", recruiter: "Recruiter view", institution: "Institution view", academician: "Academician view" };
const extensionLabels: Record<UserRole, string[]> = {
  student: ["Events", "Calendar", "Schedule"],
  recruiter: ["Internships", "Assessments", "Collaboration", "Analytics", "Integrations"],
  institution: ["Curriculum", "Analytics", "Integrations"],
  academician: ["Opportunities", "Training & FDPs", "Collaboration"],
};

export function AppShell({ role = "student", children }: { role?: UserRole; children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, signOut: endSession } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const nav = roleNavigation[role];
  const extensionNav = nav.filter((item) => extensionLabels[role].includes(item.label));
  const primaryNav = nav.filter((item) => !extensionLabels[role].includes(item.label));
  const roleInitials = role === "student" ? "AS" : role === "recruiter" ? "NP" : role === "institution" ? "IC" : "DR";

  async function signOut() {
    await endSession();
    setIsAccountOpen(false);
    setLocation("/sign-in");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href={roleHome[role]} className="brand-lockup" aria-label="SIH Connect home">
            <img src={sihConnectMark} alt="SIH Connect mark" className="brand-mark" />
            <span>SIH <em>Connect</em></span>
          </Link>
          <nav className="topnav" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const active = item.href === "/" ? location === "/" : location === item.href || location.startsWith(`${item.href}/`);
              return <Link key={item.href} href={item.href} className={active ? "nav-link nav-active" : "nav-link"}>{item.label}</Link>;
            })}
          </nav>
          {extensionNav.length > 0 && <div className="more-nav more-nav-root"><button type="button" className={extensionNav.some((item) => location === item.href || location.startsWith(`${item.href}/`)) ? "more-nav-trigger nav-active" : "more-nav-trigger"} aria-expanded={isMoreOpen} aria-controls={`more-menu-${role}`} onClick={() => setIsMoreOpen((open) => !open)}>More <ChevronDown size={13} /></button>{isMoreOpen && <div id={`more-menu-${role}`} className="more-nav-menu">{extensionNav.map((item) => { const active = location === item.href || location.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={active ? "more-active" : ""} onClick={() => setIsMoreOpen(false)}>{item.label}</Link>; })}</div>}</div>}
          <div className="top-actions">
            <select className="role-select" aria-label="Switch workspace" value={role} onChange={(event) => setLocation(roleHome[event.target.value as UserRole])}>
              <option value="student">Student</option><option value="recruiter">Recruiter</option><option value="institution">Institution</option><option value="academician">Academician</option>
            </select>
            <button className="icon-button" aria-label="Notifications"><Bell size={16} /></button>
            <div className="account-menu"><button className="avatar-button" onClick={() => setIsAccountOpen((open) => !open)} aria-label={`${roleLabel[role]} account menu`} aria-expanded={isAccountOpen}><span>{roleInitials}</span><ChevronDown size={13} /></button>{isAccountOpen && <div className="account-dropdown"><div className="account-summary"><b>{user?.displayName || roleLabel[role]}</b><span>{user?.email || roleLabel[role]}</span></div><button type="button" onClick={() => { setIsAccountOpen(false); setLocation(role === "student" ? "/profile" : roleHome[role]); }}><UserRound size={14} /> View workspace</button><button type="button" className="account-signout" onClick={() => void signOut()}><LogOut size={14} /> Sign out</button></div>}</div>
          </div>
        </div>
      </header>
      <main className={`workspace workspace-${role}`}>{children}</main>
      <button className="feedback-button" onClick={() => window.alert("Feedback capture is ready for the connected platform workflow.")}>Feedback</button>
    </div>
  );
}
