/** Run after build. Starts its own server and disposable SQLite DB; never uses production data. */
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { createHash, randomBytes } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
const root = path.resolve(import.meta.dirname, "..");
const folder = await mkdtemp(path.join(tmpdir(), "ruanghadir-access-qa-"));
const url = `file:${path.join(folder, "qa.db")}`;
const db = createClient({ url });
const password = `Qa-${randomBytes(16).toString("hex")}`;
let server;
try {
  for (const name of (await readdir(path.join(root, "migrations")))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const sql = await readFile(path.join(root, "migrations", name), "utf8");
    for (const statement of sql
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean)) {
      try {
        await db.execute(statement);
      } catch (error) {
        if (!/duplicate column|already exists/i.test(String(error)))
          throw error;
      }
    }
  }
  for (const role of ["admin", "existing"]) {
    await db.execute({
      sql: "INSERT INTO users (id,full_name,couple_groom,couple_bride,active_slug,email,password_hash,no_wa,package_id,payment_status,registered_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      args: [
        `qa-${role}`,
        `QA ${role}`,
        "Rian",
        "Salsa",
        `qa-${role}`,
        `${role}@example.test`,
        createHash("sha256").update(password).digest("hex"),
        "081234567890",
        "free",
        "success",
        "2026-11-24",
      ],
    });
  }
  const listener = createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/next/dist/bin/next"),
      "start",
      "-H",
      "127.0.0.1",
      "-p",
      String(port),
    ],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        TURSO_DATABASE_URL: url,
        VITE_TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        VITE_TURSO_AUTH_TOKEN: "",
        SESSION_SECRET: randomBytes(32).toString("hex"),
        ADMIN_EMAILS: "admin@example.test",
      },
    },
  );
  let logs = "";
  server.stdout.on("data", (chunk) => (logs += chunk));
  server.stderr.on("data", (chunk) => (logs += chunk));
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await fetch(origin + "/api/auth/me");
      ready = true;
      break;
    } catch {
      await delay(100);
    }
  }
  assert.ok(ready, "isolated Next server must start");
  const request = async (route, body, cookie) => {
    const response = await fetch(origin + route, {
      method: body === undefined ? "GET" : "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  };
  const cookieOf = (response) =>
    response.headers
      .getSetCookie()
      .find((value) => value.startsWith("rh_session="))
      ?.split(";")[0];
  let result = await request("/api/admin/applications");
  assert.equal(result.response.status, 401);
  const input = {
    fullName: "QA applicant",
    coupleGroom: "Rian",
    coupleBride: "Salsa",
    email: "applicant@example.test",
    password,
    noWa: "081234567890",
    sosmed: "",
    activeSlug: "qa-new-couple",
    city: "Malang",
    referralSource: "Teman atau keluarga",
    eventDate: "",
  };
  for (const invalid of [
    { ...input, city: "" },
    { ...input, referralSource: "" },
    { ...input, eventDate: "not-a-date" },
  ]) {
    result = await request("/api/auth/register", invalid);
    assert.equal(result.response.status, 400);
  }
  result = await request("/api/auth/register", input);
  assert.equal(result.response.status, 202);
  assert.equal(result.data.accountStatus, "pending");
  assert.ok(
    !cookieOf(result.response) || cookieOf(result.response) === "rh_session=",
  );
  assert.equal(result.data.user, undefined);
  result = await request("/api/auth/login", { email: input.email, password });
  assert.equal(result.response.status, 403);
  assert.equal(result.data.accountStatus, "pending");
  assert.ok(
    !cookieOf(result.response) || cookieOf(result.response) === "rh_session=",
  );
  result = await request("/api/auth/login", {
    email: "existing@example.test",
    password,
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.data.user.accountStatus, "approved");
  const legacyCookie = cookieOf(result.response);
  result = await request("/api/admin/applications", undefined, legacyCookie);
  assert.equal(result.response.status, 403);
  result = await request("/api/auth/login", {
    email: "admin@example.test",
    password,
  });
  assert.equal(result.response.status, 200);
  const adminCookie = cookieOf(result.response);
  assert.ok(adminCookie);
  result = await request(
    "/api/admin/applications?status=pending",
    undefined,
    adminCookie,
  );
  assert.equal(result.response.status, 200);
  const applicant = result.data.applications.find(
    (user) => user.email === input.email,
  );
  assert.ok(applicant);
  assert.equal(applicant.application.city, "Malang");
  assert.equal(applicant.application.referralSource, input.referralSource);
  result = await request(
    `/api/admin/applications/${applicant.id}`,
    { action: "approve" },
    adminCookie,
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.accountStatus, "approved");
  assert.ok(result.data.whatsappUrl.startsWith("https://wa.me/628")); // Build a draft; never send it.
  result = await request("/api/auth/login", { email: input.email, password });
  assert.equal(result.response.status, 200);
  const applicantCookie = cookieOf(result.response);
  assert.ok(applicantCookie);
  result = await request("/api/auth/me", undefined, applicantCookie);
  assert.equal(result.response.status, 200);
  result = await request(
    `/api/admin/applications/${applicant.id}`,
    { action: "reject", note: "QA only" },
    adminCookie,
  );
  assert.equal(result.response.status, 200);
  result = await request("/api/auth/me", undefined, applicantCookie);
  assert.equal(result.response.status, 401);
  result = await request("/api/auth/login", { email: input.email, password });
  assert.equal(result.response.status, 403);
  assert.equal(result.data.accountStatus, "rejected");
  result = await request(
    `/api/admin/applications/${applicant.id}`,
    { action: "reopen" },
    adminCookie,
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.accountStatus, "pending");
  const dashboard = await fetch(origin + "/dashboard", { redirect: "manual" });
  assert.equal(dashboard.status, 307);
  const html = await (await fetch(origin)).text();
  assert.match(html, /Daftar Akses Awal/);
  assert.ok(!html.includes("Rp0 selamanya"));
  console.log(
    "PASS: real isolated HTTP registration/validation, pending, existing approved account, admin permissions/approval, login/me, rejection/revocation/reopen, dashboard redirect and landing copy. No notification sent.",
  );
} finally {
  if (server && server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await stopped;
  }
  db.close();
  await rm(folder, { recursive: true, force: true });
}
