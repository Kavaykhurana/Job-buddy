import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, ChevronDown, ExternalLink, LogOut, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { loadStudentNotifications, markAllNotificationsAsRead, markNotificationAsRead, roleHome, roleNavigation, type StudentNotification, type UserRole } from "@/data/portalData";
import { useAuth } from "@/contexts/AuthContext";
import sihConnectMark from "@/assets/sih-connect-mark.svg";
import "./AppShell.css";
import "./FieldNotesRefinement.css";

const roleLabel: Record<UserRole, string> = { student: "Student view", recruiter: "Recruiter view", institution: "Institution view", academician: "Academician view" };
const portalRoleFor: Record<UserRole, "STUDENT" | "RECRUITER" | "INSTITUTION" | "ACADEMICIAN"> = { student: "STUDENT", recruiter: "RECRUITER", institution: "INSTITUTION", academician: "ACADEMICIAN" };
const extensionLabels: Record<UserRole, string[]> = {
  student: ["Events", "Calendar", "Schedule"],
  recruiter: ["Internships", "Assessments", "Collaboration", "Analytics", "Integrations"],
  institution: ["Curriculum", "Analytics", "Integrations", "Policy Analytics"],
  academician: ["Opportunities", "Training & FDPs", "Collaboration"],
};

export function AppShell({ role = "student", children }: { role?: UserRole; children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, signOut: endSession } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>(loadStudentNotifications);

  useEffect(() => {
    setNotifications(loadStudentNotifications());
  }, [location, isNotificationsOpen]);

  const availableRoles = (Object.keys(portalRoleFor) as UserRole[]).filter((candidate) => user?.roles.includes(portalRoleFor[candidate]) || user?.roles.includes("ADMIN"));
  const hasAccess = Boolean(user && (user.roles.includes(portalRoleFor[role]) || user.roles.includes("ADMIN")));

  useEffect(() => {
    if (user && !hasAccess) setLocation(roleHome[availableRoles[0] || "student"]);
  }, [availableRoles, hasAccess, setLocation, user]);

  const nav = roleNavigation[role];
  const extensionNav = nav.filter((item) => extensionLabels[role].includes(item.label));
  const primaryNav = nav.filter((item) => !extensionLabels[role].includes(item.label));
  const roleInitials = role === "student" ? "AS" : role === "recruiter" ? "NP" : role === "institution" ? "IC" : "DR";
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!hasAccess) return null;

  async function signOut() {
    await endSession();
    setIsAccountOpen(false);
    setLocation("/sign-in");
  }

  const handleRead = (id: string, link?: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications([...updated]);
    if (link) {
      setIsNotificationsOpen(false);
      setLocation(link);
    }
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications([...updated]);
  };

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
            <select className="role-select" aria-label="Switch workspace" value={role} onChange={(event) => setLocation(roleHome[event.target.value as UserRole])} disabled={availableRoles.length < 2}>
              {availableRoles.map((candidate) => <option key={candidate} value={candidate}>{roleLabel[candidate]}</option>)}
            </select>
            <div className="notification-menu" style={{ position: "relative" }}>
              <button
                className="icon-button"
                aria-label="Notifications"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setIsAccountOpen(false);
                }}
                style={{ position: "relative" }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "var(--ochre)",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: 800,
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div
                  className="notification-dropdown"
                  style={{
                    position: "absolute",
                    zIndex: 50,
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "320px",
                    padding: "10px",
                    border: "1px solid var(--rule)",
                    borderRadius: "10px",
                    background: "var(--surface)",
                    boxShadow: "0 16px 35px rgb(31 41 31 / 12%)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid var(--rule)", marginBottom: "8px" }}>
                    <b style={{ fontSize: "12px", color: "var(--ink)" }}>Notifications ({notifications.length})</b>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{ background: "none", border: "none", color: "var(--olive)", fontSize: "10px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: "var(--slate)", fontSize: "11px", textAlign: "center", margin: "16px 0" }}>No notifications right now.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleRead(n.id, n.link)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "6px",
                            background: n.read ? "transparent" : "var(--olive-wash)",
                            border: "1px solid var(--rule)",
                            cursor: n.link ? "pointer" : "default",
                            display: "grid",
                            gap: "3px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 700, fontSize: "11px", color: "var(--ink)" }}>{n.title}</span>
                            <span style={{ fontSize: "9px", color: "var(--slate)" }}>{n.timestamp}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "10.5px", color: "var(--slate)", lineHeight: 1.4 }}>{n.message}</p>
                          {n.link && (
                            <span style={{ fontSize: "9.5px", color: "var(--olive)", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                              View details <ExternalLink size={10} />
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="account-menu">
              <button className="avatar-button" onClick={() => { setIsAccountOpen((open) => !open); setIsNotificationsOpen(false); }} aria-label={`${roleLabel[role]} account menu`} aria-expanded={isAccountOpen}><span>{roleInitials}</span><ChevronDown size={13} /></button>
              {isAccountOpen && <div className="account-dropdown"><div className="account-summary"><b>{user?.displayName || roleLabel[role]}</b><span>{user?.email || roleLabel[role]}</span></div><button type="button" onClick={() => { setIsAccountOpen(false); setLocation(role === "student" ? "/profile" : roleHome[role]); }}><UserRound size={14} /> View workspace</button><button type="button" className="account-signout" onClick={() => void signOut()}><LogOut size={14} /> Sign out</button></div>}
            </div>
          </div>
        </div>
      </header>
      <main className={`workspace workspace-${role}`}>{children}</main>
      <button className="feedback-button" onClick={() => window.alert("Feedback capture is ready for the connected platform workflow.")}>Feedback</button>
    </div>
  );
}
