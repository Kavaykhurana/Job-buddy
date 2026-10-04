import express from "express";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";

let base = "";
let close = () => {};
const password = "Passw0rdPassw0rd";

beforeAll(async () => {
  // api.ts resolves its data file from cwd at import time; keep test writes out of the tracked data_store.json.
  process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "api-test-")));
  process.env.APP_BOOTSTRAP_ADMIN_EMAIL = "admin@test.dev";
  process.env.APP_BOOTSTRAP_ADMIN_PASSWORD = password;
  const { apiRouter } = await import("./api.js");
  const server = express().use("/api", apiRouter).listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  close = () => server.close();
});
afterAll(() => close());

const call = async (method: string, url: string, token: string, body: unknown) => {
  const res = await fetch(base + url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(2_000) });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};
const login = async (path: string, body: object) => (await (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json()).accessToken as string;

test("empty PUT bodies get a 400 instead of hanging", async () => {
  const student = await login("/auth/register", { email: "s@test.dev", password, displayName: "Stu Dent" });
  expect((await call("PUT", "/profile", student, {})).status).toBe(400);
});

test("partial job update keeps untouched fields such as preferred skills", async () => {
  const admin = await login("/auth/login", { email: "admin@test.dev", password });
  const job = { id: "t1", title: "Test role", organization: "Org", location: "Pune", date: "Closes 1 Jan", required: ["Python"], preferred: ["SQL"], type: "Structured", summary: "A long enough summary." };
  expect((await call("POST", "/jobs", admin, job)).status).toBe(201);
  const updated = await call("PUT", "/jobs/t1", admin, { title: "Renamed role" });
  expect(updated.body).toMatchObject({ title: "Renamed role", preferred: ["SQL"] });
  expect((await call("PUT", "/jobs/t1", admin, {})).status).toBe(400);
});
