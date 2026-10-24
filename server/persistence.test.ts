import express from "express";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test, vi } from "vitest";

// A fake Supabase REST endpoint for the app_state table: one JSON row, upserted by id.
const rows = new Map<string, unknown>();
const seen: { method: string; url: string; apikey?: string; authorization?: string }[] = [];
let fake: ReturnType<ReturnType<typeof express>["listen"]>;

beforeAll(async () => {
  const app = express().use(express.json({ limit: "5mb" }));
  app.use((req, _res, next) => { seen.push({ method: req.method, url: req.originalUrl, apikey: req.header("apikey"), authorization: req.header("authorization") }); next(); });
  app.get("/rest/v1/app_state", (req, res) => { const id = String(req.query.id).replace(/^eq\./, ""); res.json(rows.has(id) ? [{ data: rows.get(id) }] : []); });
  app.post("/rest/v1/app_state", (req, res) => { rows.set(req.body.id, req.body.data); res.status(201).end(); });
  fake = app.listen(0);
  await new Promise((resolve) => fake.once("listening", resolve));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "persist-test-"));
  fs.mkdirSync(path.join(dir, "server"));
  fs.copyFileSync(path.join(import.meta.dirname, "data_store.json"), path.join(dir, "server", "data_store.json"));
  process.chdir(dir);
  process.env.SUPABASE_URL = `http://127.0.0.1:${(fake.address() as AddressInfo).port}`;
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
});
afterAll(() => fake.close());

// Each call is a fresh server process, like a Render redeploy: new module state, wiped local disk.
async function boot() {
  vi.resetModules();
  fs.rmSync(path.join(process.cwd(), "server", "data_store.json"), { force: true });
  const api = await import("./api.js");
  await api.initDatabase();
  const server = express().use("/api", api.apiRouter).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  const post = (url: string, body: object) => fetch(base + url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { base, post, flush: api.flushDatabase, close: () => server.close() };
}

test("an account survives a restart with a wiped disk", async () => {
  const first = await boot();
  expect(rows.has("main")).toBe(true); // empty table was seeded on first boot
  expect((await first.post("/auth/register", { email: "keep@test.dev", password: "Passw0rdPassw0rd", displayName: "Keep Me" })).status).toBe(201);
  await first.flush();
  first.close();

  const second = await boot();
  expect((await second.post("/auth/login", { email: "keep@test.dev", password: "Passw0rdPassw0rd" })).status).toBe(200);
  await second.flush();
  second.close();

  // New-style secret keys go in the apikey header only; they are not JWTs.
  expect(seen.every((request) => request.apikey === "sb_secret_test" && request.authorization === undefined)).toBe(true);
});

test("/health touches Supabase so the free project never idles into a pause, but at most every few hours", async () => {
  const app = await boot();
  const pings = () => seen.filter((request) => request.method === "GET" && request.url.includes("select=updated_at")).length;
  const before = pings();
  for (let index = 0; index < 3; index += 1) {
    const res = await fetch(`${app.base}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  }
  expect(pings() - before).toBe(1);
  app.close();
});
