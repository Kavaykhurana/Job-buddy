import express from "express";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";

let base = "";
let close = () => {};
const password = "Passw0rdPassw0rd";
const seedFile = path.join(import.meta.dirname, "data_store.json");

beforeAll(async () => {
  // api.ts resolves its data file from cwd at import time: run against a copy of the real seed, never the tracked file.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-test-"));
  fs.mkdirSync(path.join(dir, "server"));
  fs.copyFileSync(seedFile, path.join(dir, "server", "data_store.json"));
  process.chdir(dir);
  process.env.APP_BOOTSTRAP_ADMIN_EMAIL = "admin@test.dev";
  process.env.APP_BOOTSTRAP_ADMIN_PASSWORD = password;
  const { apiRouter } = await import("./api.js");
  const server = express().use("/api", apiRouter).listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  close = () => server.close();
});
afterAll(() => close());

const call = async (method: string, url: string, token: string, body?: unknown) => {
  const res = await fetch(base + url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(2_000) });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};
const session = async (url: string, body: object) => (await (await fetch(base + url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json()).accessToken as string;

let student = "";
let admin = "";
beforeAll(async () => {
  student = await session("/auth/register", { email: "s@test.dev", password, displayName: "Stu Dent" });
  admin = await session("/auth/login", { email: "admin@test.dev", password });
});

test("empty PUT bodies get a 400 instead of hanging", async () => {
  expect((await call("PUT", "/profile", student, {})).status).toBe(400);
});

test("validation errors name the failing field", async () => {
  const res = await call("POST", "/curriculum/notes", admin, { program: "Computer Science", note: "ok" });
  expect(res.status).toBe(400);
  expect(res.body.detail).toMatch(/^note: /);
});

test("every job the client lists exists in the server seed, so students can apply", async () => {
  const clientIds = Array.from(fs.readFileSync(path.join(import.meta.dirname, "../client/src/data/jobData.ts"), "utf8").matchAll(/^\s+id: "([^"]+)"/gm), (m) => m[1]);
  expect(clientIds.length).toBeGreaterThan(0);
  for (const jobId of clientIds) {
    const res = await call("POST", "/applications", student, { jobId, statement: "I built three data pipelines in Python for coursework." });
    expect([jobId, res.status]).toEqual([jobId, 201]);
  }
});

test("a role added in the UI can then take requirements", async () => {
  const roles = await call("POST", "/requirements/roles", admin, { companyIndex: 0, title: "Data Analyst", demand: "High" });
  expect(roles.status).toBe(201);
  const roleIndex = roles.body[0].roles.length - 1;
  const added = await call("PUT", "/requirements", admin, { companyIndex: 0, roleIndex, requirement: { skill: "SQL", level: "Intermediate", importance: "Required" } });
  expect(added.status).toBe(200);
});

test("an admin can use every workspace, including student-only endpoints", async () => {
  expect((await call("GET", "/profile", admin)).status).toBe(200);
  expect((await call("GET", "/curriculum/notes", admin)).status).toBe(200);
  expect((await call("GET", "/candidates", admin)).status).toBe(200);
});

test("a student still cannot use another workspace's endpoints", async () => {
  expect((await call("GET", "/candidates", student)).status).toBe(403);
  expect((await call("GET", "/curriculum/notes", student)).status).toBe(403);
});

test("demo sign-in is off by default and never yields an admin", async () => {
  const demo = (role: string) => fetch(`${base}/auth/demo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
  delete process.env.DEMO_LOGINS;
  expect((await demo("RECRUITER")).status).toBe(404);
  process.env.DEMO_LOGINS = "true";
  try {
    for (const role of ["STUDENT", "RECRUITER", "INSTITUTION", "ACADEMICIAN"]) {
      const res = await demo(role);
      expect(res.status).toBe(200);
      expect((await res.json()).user.roles).toEqual([role]);
    }
    expect((await demo("ADMIN")).status).toBe(400);
  } finally { delete process.env.DEMO_LOGINS; }
});

test("deleting a document that only exists in the browser succeeds", async () => {
  expect((await call("DELETE", "/profile/documents/doc-1", student)).status).toBe(204);
});

test("partial job update keeps untouched fields such as preferred skills", async () => {
  const job = { id: "t1", title: "Test role", organization: "Org", location: "Pune", date: "Closes 1 Jan", required: ["Python"], preferred: ["SQL"], type: "Structured", summary: "A long enough summary." };
  expect((await call("POST", "/jobs", admin, job)).status).toBe(201);
  const updated = await call("PUT", "/jobs/t1", admin, { title: "Renamed role" });
  expect(updated.body).toMatchObject({ title: "Renamed role", preferred: ["SQL"] });
  expect((await call("PUT", "/jobs/t1", admin, {})).status).toBe(400);
});
