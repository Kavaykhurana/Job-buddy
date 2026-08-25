// Field Notes Institutional Workspace: compact, evidence-led UI primitives for all scoped portal views.
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3 } from "lucide-react";
import { Link } from "wouter";

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      <div className="header-action">{meta}{action}</div>
    </div>
  );
}

export function StatCard({ label, value, note, tone = "default" }: { label: string; value: string | number; note?: string; tone?: "default" | "olive" | "ochre" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

export function SectionCard({ title, aside, children, className = "" }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || aside) && <div className="section-card-head"><h2>{title}</h2><div>{aside}</div></div>}
      {children}
    </section>
  );
}

export function StatusPill({ children, tone = "olive" }: { children: ReactNode; tone?: "olive" | "ochre" | "muted" | "ink" }) {
  return <span className={`status-pill pill-${tone}`}>{children}</span>;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="action-link">{children} <ArrowRight size={15} /></Link>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="progress-wrap">{label && <div className="progress-label"><span>{label}</span><b>{value}%</b></div>}<div className="progress-track"><div className="progress-fill" style={{ width: `${value}%` }} /></div></div>;
}

export function EmptyPanel({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty-panel"><CheckCircle2 size={20} /><div><h3>{title}</h3><p>{text}</p></div>{action && <div>{action}</div>}</div>;
}

export function Notice({ title, text, tone = "olive" }: { title: string; text: string; tone?: "olive" | "ochre" }) {
  const Icon = tone === "ochre" ? CircleAlert : CheckCircle2;
  return <div className={`notice notice-${tone}`}><Icon size={17} /><div><b>{title}</b><span>{text}</span></div></div>;
}

export function ScheduleLine({ time, title, meta, kind }: { time: string; title: string; meta: string; kind: string }) {
  return <div className="schedule-line"><div className="schedule-time">{time}</div><div className="schedule-dot" /><div className="schedule-main"><b>{title}</b><span>{meta}</span></div><StatusPill tone="muted">{kind}</StatusPill></div>;
}

export function Timeline({ items }: { items: { label: string; date: string; state: string }[] }) {
  return <ol className="timeline">{items.map((item) => <li key={item.label} className={`timeline-${item.state}`}><span className="timeline-marker" /><div><b>{item.label}</b><small>{item.date}</small></div></li>)}</ol>;
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return <div className="key-value"><span>{label}</span><b>{value}</b></div>;
}

export function TimeNote({ children }: { children: ReactNode }) {
  return <span className="time-note"><Clock3 size={14} />{children}</span>;
}
