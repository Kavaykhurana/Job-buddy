// Job-buddy Assistant: floating help chat for signed-in users. Replies stream from /api/v1/assistant/chat; Gemini and its key live on the server.
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { RotateCcw, Send, Sparkles, Square, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, streamRequest, type PortalRole } from "@/lib/authApi";
import "./AssistantWidget.css";

type Message = { id: string; role: "user" | "model"; text: string; error?: boolean };
type Workspace = Exclude<PortalRole, "ADMIN">;
type StreamEvent = { type: "delta"; text: string } | { type: "done" } | { type: "error"; detail: string };

// The server accepts at most 20 messages; older turns are dropped first.
const HISTORY_LIMIT = 20;
const WORKSPACES: Workspace[] = ["STUDENT", "RECRUITER", "INSTITUTION", "ACADEMICIAN"];
const suggestions: Record<Workspace, string[]> = {
  STUDENT: ["Which open jobs fit my skills best?", "How do I apply for a job?", "What should I learn next to close my skill gaps?", "Where can I track my applications?"],
  RECRUITER: ["How do I post a new job?", "How many applications do my jobs have?", "How do I shortlist a candidate?", "Help me write a summary for a data analyst role"],
  INSTITUTION: ["How do I check student readiness?", "Where do I add curriculum notes?", "Which skills are employers asking for?"],
  ACADEMICIAN: ["How do I view student skill maps?", "Where are training and FDP opportunities?", "Suggest a guest lecture topic aligned with industry demand"],
};

function workspaceFor(path: string, roles: PortalRole[]): Workspace {
  const fromPath: Workspace = path.startsWith("/recruiter") ? "RECRUITER" : path.startsWith("/institution") || path.startsWith("/policy-analytics") ? "INSTITUTION" : path.startsWith("/academician") ? "ACADEMICIAN" : "STUDENT";
  if (roles.includes("ADMIN") || roles.includes(fromPath)) return fromPath;
  return WORKSPACES.find((role) => roles.includes(role)) ?? "STUDENT";
}

/** Conversation as the API expects it: no failed replies, no leading model turn, consecutive same-role turns merged. */
function toHistory(messages: Message[]) {
  const history: { role: Message["role"]; text: string }[] = [];
  for (const message of messages) {
    if (message.error || !message.text.trim()) continue;
    const previous = history[history.length - 1];
    if (previous?.role === message.role) previous.text = `${previous.text}\n\n${message.text}`;
    else history.push({ role: message.role, text: message.text });
  }
  const recent = history.slice(-HISTORY_LIMIT);
  while (recent[0]?.role === "model") recent.shift();
  return recent;
}

// Minimal Markdown for replies (bold, code, links, lists, headings), rendered as React nodes, never as HTML.
function renderInline(text: string, onNavigate: () => void): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = match.index;
    if (match[1]) nodes.push(<strong key={key}>{match[1]}</strong>);
    else if (match[2]) nodes.push(<code key={key}>{match[2]}</code>);
    else if (match[4].startsWith("/") && !match[4].startsWith("//")) nodes.push(<Link key={key} href={match[4]} onClick={onNavigate}>{match[3]}</Link>);
    else if (match[4].startsWith("https://")) nodes.push(<a key={key} href={match[4]} target="_blank" rel="noopener noreferrer">{match[3]}</a>);
    else nodes.push(match[3]);
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdown(text: string, onNavigate: () => void): ReactNode[] {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushParagraph = () => { if (paragraph.length) blocks.push(<p key={blocks.length}>{renderInline(paragraph.join("\n"), onNavigate)}</p>); paragraph = []; };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item, index) => <li key={index}>{renderInline(item, onNavigate)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (!line.trim()) { flushParagraph(); flushList(); }
    else if (heading) { flushParagraph(); flushList(); blocks.push(<p key={blocks.length} className="assistant-heading">{renderInline(heading[1], onNavigate)}</p>); }
    else { flushList(); paragraph.push(line); }
  }
  flushParagraph(); flushList();
  return blocks;
}

export function AssistantWidget() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ enabled: boolean }>("/assistant/status").then((status) => { if (active) setEnabled(status.enabled); }).catch(() => { if (active) setEnabled(false); });
    return () => { active = false; abortRef.current?.abort(); };
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages, open]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }, [draft, open]);

  if (!enabled || !user) return null;

  const workspace = workspaceFor(location, user.roles);
  const firstName = user.displayName.split(/\s+/)[0];
  const closeOnSmallScreens = () => { if (window.matchMedia("(max-width: 640px)").matches) setOpen(false); };
  const patchReply = (id: string, update: (message: Message) => Message) => setMessages((current) => current.map((message) => message.id === id ? update(message) : message));

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: question };
    const replyId = crypto.randomUUID();
    const history = toHistory([...messages, userMessage]);
    setMessages((current) => [...current, userMessage, { id: replyId, role: "model", text: "" }]);
    setDraft("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await streamRequest("/assistant/chat", { messages: history, page: location }, controller.signal);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      const handle = (line: string) => {
        if (!line.trim()) return;
        let event: StreamEvent;
        try { event = JSON.parse(line) as StreamEvent; } catch { return; }
        if (event.type === "delta") patchReply(replyId, (message) => ({ ...message, text: message.text + event.text }));
        else if (event.type === "error") throw new Error(event.detail);
        else finished = true;
      };
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(handle);
      }
      handle(buffer + decoder.decode());
      if (!finished) throw new Error("The reply was cut off. Try again.");
    } catch (error) {
      if (controller.signal.aborted) {
        setMessages((current) => current.filter((message) => message.id !== replyId || message.text.trim()));
      } else {
        const detail = error instanceof Error && error.message ? error.message : "Something went wrong. Try again.";
        patchReply(replyId, (message) => ({ ...message, error: true, text: message.text.trim() ? `${message.text}\n\n${detail}` : detail }));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) { event.preventDefault(); void send(draft); }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft); }
  }
  function reset() { abortRef.current?.abort(); setMessages([]); setDraft(""); inputRef.current?.focus(); }

  if (!open) {
    return <button type="button" className="assistant-launcher" onClick={() => setOpen(true)} aria-label="Open Job-buddy Assistant"><Sparkles size={18} /><span>Ask Job-buddy</span></button>;
  }

  return (
    <section className="assistant-panel" role="dialog" aria-label="Job-buddy Assistant" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <header className="assistant-header">
        <span className="assistant-avatar" aria-hidden="true"><Sparkles size={15} /></span>
        <div className="assistant-title"><b>Job-buddy Assistant</b><span>Powered by Gemini · can make mistakes</span></div>
        {messages.length > 0 && <button type="button" className="assistant-icon-button" onClick={reset} aria-label="Start a new chat" title="New chat"><RotateCcw size={15} /></button>}
        <button type="button" className="assistant-icon-button" onClick={() => setOpen(false)} aria-label="Close assistant" title="Close"><X size={16} /></button>
      </header>

      <div className="assistant-messages" ref={listRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="assistant-empty">
            <p>Hi {firstName}! I can find the right page, explain how things work, and give advice based on your skills, applications and listings.</p>
            <div className="assistant-suggestions">{suggestions[workspace].map((suggestion) => <button type="button" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>
          </div>
        ) : messages.map((message) => (
          <div key={message.id} className={`assistant-message assistant-${message.role}${message.error ? " assistant-error" : ""}`}>
            {message.role === "user" ? <p>{message.text}</p> : message.text ? renderMarkdown(message.text, closeOnSmallScreens) : <span className="assistant-typing" aria-label="Assistant is typing"><i /><i /><i /></span>}
          </div>
        ))}
      </div>

      <form className="assistant-composer" onSubmit={onSubmit}>
        <textarea ref={inputRef} rows={1} value={draft} maxLength={4000} placeholder="Ask about jobs, skills or this page…" aria-label="Message the assistant" onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} />
        {busy
          ? <button type="button" className="assistant-send" onClick={() => abortRef.current?.abort()} aria-label="Stop generating" title="Stop"><Square size={14} /></button>
          : <button type="submit" className="assistant-send" disabled={!draft.trim()} aria-label="Send message" title="Send"><Send size={15} /></button>}
      </form>
    </section>
  );
}
