import express from "express";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";

// A fake Gemini REST endpoint: records each request and answers in the mode the test picks.
type Mode = "ok" | "busy" | "blocked" | "rejectsThinking" | "badRequest" | "hang" | "stall" | "primaryOverloaded" | "primaryUnknown";
let mode: Mode = "ok";
const calls: { url: string; key?: string; body: { systemInstruction: { parts: { text: string }[] }; contents: { role: string; parts: { text: string }[] }[]; generationConfig: { thinkingConfig?: { thinkingBudget?: number } } } }[] = [];
const sse = (chunk: object) => `data: ${JSON.stringify(chunk)}\r\n\r\n`;

let base = "";
let closeAll = () => {};
const password = "Passw0rdPassw0rd";

beforeAll(async () => {
  const gemini = express().use(express.json({ limit: "1mb" }));
  gemini.post(/.*/, (req, res) => {
    calls.push({ url: req.originalUrl, key: req.header("x-goog-api-key"), body: req.body });
    if (mode === "busy") return res.status(429).json({ error: { message: "Resource exhausted" } });
    const primary = req.originalUrl.includes("/gemini-test-model:");
    if (mode === "primaryOverloaded" && primary) return res.status(503).json({ error: { code: 503, message: "This model is currently experiencing high demand.", status: "UNAVAILABLE" } });
    if (mode === "primaryUnknown" && primary) return res.status(404).json({ error: { code: 404, message: "models/gemini-test-model is not found.", status: "NOT_FOUND" } });
    if (mode === "rejectsThinking" && req.body.generationConfig?.thinkingConfig) return res.status(400).json({ error: { message: "Thinking budget is not supported by this model." } });
    if (mode === "badRequest") return res.status(400).json({ error: { message: "API key not valid." } });
    if (mode === "hang") return; // never answers
    if (mode === "stall") { res.setHeader("Content-Type", "text/event-stream"); res.write(sse({ candidates: [{ content: { parts: [{ text: "Partial answer" }] } }] })); return; } // then goes quiet
    res.setHeader("Content-Type", "text/event-stream");
    if (mode === "blocked") { res.write(sse({ promptFeedback: { blockReason: "SAFETY" } })); return res.end(); }
    res.write(sse({ candidates: [{ content: { role: "model", parts: [{ text: "planning…", thought: true }] } }] }));
    res.write(sse({ candidates: [{ content: { role: "model", parts: [{ text: "Open **Jobs**, " }] } }] }));
    res.write(sse({ candidates: [{ content: { role: "model", parts: [{ text: "then [apply](/jobs/ai-studio/apply)." }] }, finishReason: "STOP" }] }));
    res.end();
  });
  const fake = gemini.listen(0);
  await new Promise((resolve) => fake.once("listening", resolve));

  // api.ts resolves its data file from cwd at import time: run against a copy of the real seed, never the tracked file.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "assistant-test-"));
  fs.mkdirSync(path.join(dir, "server"));
  fs.copyFileSync(path.join(import.meta.dirname, "data_store.json"), path.join(dir, "server", "data_store.json"));
  process.chdir(dir);
  process.env.GEMINI_API_BASE_URL = `http://127.0.0.1:${(fake.address() as AddressInfo).port}/v1beta`;
  process.env.GEMINI_MODEL = "gemini-test-model";
  process.env.GEMINI_FALLBACK_MODELS = "gemini-test-fallback";
  const { apiRouter } = await import("./api.js");
  const server = express().use("/api", apiRouter).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  closeAll = () => { server.close(); fake.close(); };
});
afterAll(() => closeAll());
beforeEach(() => { mode = "ok"; calls.length = 0; process.env.GEMINI_API_KEY = "test-gemini-key"; delete process.env.GEMINI_TIMEOUT_MS; });

const authed = (token: string) => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });
const register = async (email: string) => (await (await fetch(`${base}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, displayName: "Riya Verma" }) })).json()).accessToken as string;
const chat = (token: string, body: object) => fetch(`${base}/assistant/chat`, { method: "POST", headers: authed(token), body: JSON.stringify(body), signal: AbortSignal.timeout(5_000) });
const events = async (res: Response) => (await res.text()).trim().split("\n").map((line) => JSON.parse(line) as { type: string; text?: string; detail?: string });
const ask = (text: string) => ({ messages: [{ role: "user", text }], page: "/jobs" });

let student = "";
beforeAll(async () => {
  student = await register("riya@test.dev");
  await fetch(`${base}/profile/skills`, { method: "POST", headers: authed(student), body: JSON.stringify({ skill: "Tableau" }) });
});

test("without a Gemini key the assistant reports itself disabled and refuses to chat", async () => {
  delete process.env.GEMINI_API_KEY;
  expect(await (await fetch(`${base}/assistant/status`, { headers: authed(student) })).json()).toEqual({ enabled: false });
  expect((await chat(student, ask("hi"))).status).toBe(503);
  expect(calls).toHaveLength(0);
});

test("the assistant needs a signed-in user", async () => {
  expect((await fetch(`${base}/assistant/status`)).status).toBe(401);
  expect((await fetch(`${base}/assistant/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ask("hi")) })).status).toBe(401);
});

test("streams Gemini's reply as NDJSON deltas and drops thought parts", async () => {
  expect(await (await fetch(`${base}/assistant/status`, { headers: authed(student) })).json()).toEqual({ enabled: true });
  const res = await chat(student, ask("How do I apply?"));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toMatch(/application\/x-ndjson/);
  const stream = await events(res);
  expect(stream.at(-1)).toEqual({ type: "done" });
  expect(stream.filter((event) => event.type === "delta").map((event) => event.text).join("")).toBe("Open **Jobs**, then [apply](/jobs/ai-studio/apply).");
});

test("the key travels in a header, the model is configurable, and the prompt is grounded in the user's own data", async () => {
  await (await chat(student, { messages: [{ role: "user", text: "Hi" }, { role: "model", text: "Hello!" }, { role: "user", text: "Which jobs fit me?" }], page: "/skill-gaps" })).text();
  const [call] = calls;
  expect(call.key).toBe("test-gemini-key");
  expect(call.url).toBe("/v1beta/models/gemini-test-model:streamGenerateContent?alt=sse");
  expect(call.url).not.toContain("test-gemini-key");
  expect(call.body.contents.map((item) => item.role)).toEqual(["user", "model", "user"]);
  const prompt = call.body.systemInstruction.parts[0].text;
  expect(prompt).toContain("Roles: STUDENT");
  expect(prompt).toContain("Current page: /skill-gaps");
  expect(prompt).toContain("Applied AI Capability Studio"); // a seeded open job
  expect(prompt).toContain("Tableau"); // this student's declared skill
  // Recruiter-only data and other workspaces' guides stay out of a student's prompt.
  expect(prompt).not.toContain("\"candidates\"");
  expect(prompt).not.toContain("Recruiter workspace:");
});

test("asks Gemini for a small thinking budget so answers come back in seconds", async () => {
  await (await chat(student, ask("hi"))).text();
  expect(calls[0].body.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 512 });
});

test("a model that rejects the thinking budget is retried once without it", async () => {
  mode = "rejectsThinking";
  const res = await chat(student, ask("hi"));
  expect(res.status).toBe(200);
  expect((await events(res)).at(-1)).toEqual({ type: "done" });
  expect(calls.map((call) => Boolean(call.body.generationConfig.thinkingConfig))).toEqual([true, false]);
});

test("any other bad request is not retried and stays a generic 502", async () => {
  mode = "badRequest";
  const res = await chat(student, ask("hi"));
  expect(res.status).toBe(502);
  expect(JSON.stringify(await res.json())).not.toMatch(/API key/);
  expect(calls).toHaveLength(1);
});

test("a Gemini that never answers gives a 504 after the timeout instead of hanging", async () => {
  mode = "hang";
  process.env.GEMINI_TIMEOUT_MS = "300";
  const started = Date.now();
  const res = await chat(student, ask("hi"));
  expect(res.status).toBe(504);
  expect((await res.json()).detail).toMatch(/took too long/);
  expect(Date.now() - started).toBeLessThan(3_000);
});

test("a reply that goes quiet midway ends with an error event after the timeout", async () => {
  mode = "stall";
  process.env.GEMINI_TIMEOUT_MS = "300";
  const stream = await events(await chat(student, ask("hi")));
  expect(stream[0]).toEqual({ type: "delta", text: "Partial answer" });
  expect(stream.at(-1)).toEqual({ type: "error", detail: "The assistant stopped responding. Try again." });
});

test("an overloaded or unknown primary model hands the request to the fallback model", async () => {
  for (const failing of ["primaryOverloaded", "primaryUnknown"] as const) {
    mode = failing;
    calls.length = 0;
    const res = await chat(student, ask("hi"));
    expect(res.status).toBe(200);
    expect((await events(res)).at(-1)).toEqual({ type: "done" });
    expect(calls.map((call) => call.url.split("/models/")[1].split(":")[0])).toEqual(["gemini-test-model", "gemini-test-fallback"]);
  }
});

test("when every model is busy the user gets the busy message after trying each once", async () => {
  mode = "busy";
  const res = await chat(student, ask("hi"));
  expect(res.status).toBe(503);
  expect(calls).toHaveLength(2);
});

test("an upstream quota error becomes a friendly 503 without leaking provider details", async () => {
  mode = "busy";
  const res = await chat(student, ask("hi"));
  expect(res.status).toBe(503);
  const body = await res.json();
  expect(body.detail).toMatch(/busy/);
  expect(JSON.stringify(body)).not.toMatch(/Resource exhausted|test-gemini-key/);
});

test("a blocked prompt still gets a polite reply instead of an empty bubble", async () => {
  mode = "blocked";
  const stream = await events(await chat(student, ask("something unsafe")));
  expect(stream[0].type).toBe("delta");
  expect(stream[0].text).toMatch(/can't help with that/);
  expect(stream.at(-1)).toEqual({ type: "done" });
});

test("rejects conversations that do not end with the user or are oversized", async () => {
  expect((await chat(student, { messages: [{ role: "model", text: "Hello" }] })).status).toBe(400);
  expect((await chat(student, { messages: [] })).status).toBe(400);
  expect((await chat(student, { messages: Array.from({ length: 21 }, () => ({ role: "user", text: "hi" })) })).status).toBe(400);
  expect((await chat(student, { messages: [{ role: "user", text: "x".repeat(4_001) }] })).status).toBe(400);
  expect(calls).toHaveLength(0);
});

test("each user gets a bounded number of messages per window", async () => {
  const { takeAssistantQuota } = await import("./assistant.js");
  const start = 1_000_000;
  for (let index = 0; index < 20; index += 1) expect(takeAssistantQuota("usr_quota", start + index)).toBe(true);
  expect(takeAssistantQuota("usr_quota", start + 21)).toBe(false);
  expect(takeAssistantQuota("usr_other", start + 21)).toBe(true);
  expect(takeAssistantQuota("usr_quota", start + 10 * 60_000 + 1)).toBe(true); // window slid past the first message
});
