/** Actual auth-provider contract checks, with isolated HTTP responses and no real accounts. */
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";
import { act, create } from "react-test-renderer";
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const compiled = (
  await build({
    entryPoints: [path.join(root, "src/hooks/useAuth.tsx")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    external: ["react"],
    jsx: "automatic",
    plugins: [
      {
        name: "isolated-account-data",
        setup(builder) {
          builder.onResolve({ filter: /\/lib\/api$/ }, () => ({
            path: "api",
            namespace: "test",
          }));
          builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({
            contents:
              'export const checkEmailExists=async()=>false; export const checkSlugExists=async()=>false; const disabled=async()=>{throw Error("Admin API disabled in isolated auth test")}; export const updateTransactionStatus=disabled,updateUserPaymentStatus=disabled,updateUserPackage=disabled,deleteUser=disabled,getAllUsers=disabled,getAllTransactions=disabled;',
            loader: "js",
          }));
        },
      },
    ],
  })
).outputFiles[0].text;
const mod = { exports: {} };
new Function("require", "module", "exports", compiled)(
  require,
  mod,
  mod.exports,
);
const { AuthProvider, useAuth } = mod.exports;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const saved = new Map([
  [
    "saas_current_user",
    JSON.stringify({ id: "stale-user", paymentStatus: "success" }),
  ],
]);
globalThis.localStorage = {
  setItem: (k, v) => saved.set(k, v),
  getItem: (k) => saved.get(k) || null,
  removeItem: (k) => saved.delete(k),
};
let auth, requestBody;
let response = { status: 401, body: {} };
globalThis.fetch = async (_url, init) => {
  requestBody = init?.body && JSON.parse(init.body);
  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    json: async () => response.body,
  };
};
function Probe() {
  auth = useAuth();
  return null;
}
let renderer;
await act(async () => {
  renderer = create(
    React.createElement(AuthProvider, null, React.createElement(Probe)),
  );
});
assert.equal(
  auth.currentUser,
  null,
  "a cached user must not grant dashboard access",
);
assert.equal(auth.isReady, true);
response = {
  status: 202,
  body: {
    success: true,
    accountStatus: "pending",
    application: { fullName: "Test applicant", email: "test@example.test" },
  },
};
await act(async () => {
  await auth.register({
    email: "test@example.test",
    city: "Malang",
    referralSource: "Teman atau keluarga",
    eventDate: "",
  });
});
assert.equal(auth.currentUser, null);
assert.equal(auth.application.accountStatus, "pending");
assert.equal(requestBody.city, "Malang");
assert.equal(requestBody.eventDate, "");
assert.equal(saved.has("saas_current_user"), false);
response = {
  status: 403,
  body: {
    accountStatus: "rejected",
    error: "Belum disetujui",
    application: { email: "test@example.test" },
  },
};
await act(async () => {
  await auth.login("test@example.test", "test-password");
});
assert.equal(auth.application.accountStatus, "rejected");
assert.equal(auth.currentUser, null);
response = {
  status: 200,
  body: {
    user: {
      id: "approved-user",
      accountStatus: "approved",
      email: "approved@example.test",
    },
  },
};
await act(async () => {
  await auth.login("approved@example.test", "test-password");
});
assert.equal(auth.currentUser.id, "approved-user");
assert.equal(auth.application, null);
response = { status: 401, body: {} };
await act(async () => {
  await auth.refreshUser();
});
assert.equal(auth.currentUser, null, "revoked account loses client access");
response = {
  status: 403,
  body: {
    accountStatus: "pending",
    application: { email: "google@example.test" },
  },
};
await act(async () => {
  await auth.loginWithGoogle("test-only-credential");
});
assert.equal(auth.currentUser, null);
assert.equal(auth.application.accountStatus, "pending");
response = {
  status: 200,
  body: {
    needsSignup: true,
    email: "google@example.test",
    name: "Google sample",
    signupToken: "test-only-token",
  },
};
let google;
await act(async () => {
  google = await auth.loginWithGoogle("test-only-credential");
});
assert.equal(google.unverifiedEmail, "google@example.test");
assert.equal(auth.currentUser, null);
response = { status: 201, body: { user: { id: "legacy-instant-user" } } };
await act(async () => {
  await auth.register({ email: "test@example.test" });
});
assert.equal(
  auth.currentUser,
  null,
  "old instant-registration contract must fail closed",
);
assert.ok(auth.error);
response = {
  status: 200,
  body: { user: { id: "bad-server-response", accountStatus: "pending" } },
};
await act(async () => {
  await auth.login("pending@example.test", "test-password");
});
assert.equal(auth.currentUser, null);
globalThis.fetch = async () => {
  throw Error("offline");
};
await act(async () => {
  await auth.refreshUser();
});
assert.equal(auth.currentUser, null);
await act(async () => {
  renderer.unmount();
});
console.log(
  "PASS: cached, pending, rejected, approved, revoked, Google signup/pending, offline and old-server auth contracts; no registration dashboard session.",
);
