/** Regression checks for the protected invitation surface and requested zoom behavior. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import postcss from "postcss";

const root = path.resolve(import.meta.dirname, "..");
const protectedPaths = [
  "src/themes",
  "src/components/templates",
  "src/components/InvitationPreview.tsx",
  "src/components/IframePreview.tsx",
  "src/components/layout/DesktopInvitationWrapper.tsx",
  "src/components/system/ZoomLock.tsx",
  "src/app/[slug]",
  "src/app/demo",
  "src/app/(marketing)/preview",
  "src/components/GuestPassSection.tsx",
  "src/components/LiveMomentsDock.tsx",
  "src/data/defaultData.ts",
  "public/assets",
  "src/lib/packageLimits.ts",
];
const diff = execFileSync(
  "git",
  ["diff", "04a52ec", "--name-only", "--", ...protectedPaths],
  { cwd: root, encoding: "utf8" },
);
// Owner-requested marketing catalogue fix, reviewed in PR10 and merged at this
// immutable revision. Only this entry gets a new baseline; invitation routes keep
// the original baseline above, including every other path under /preview.
const catalogueEntry = "src/app/(marketing)/preview/page.tsx";
const catalogueReview = "253e333333c91f237c44c66f97655c5fdc57338c";
const changedProtected = diff.trim().split("\n").filter(Boolean);
assert.deepEqual(
  changedProtected.filter((file) => file !== catalogueEntry),
  [],
  "Protected preview/theme/assets/zoom/package files changed",
);
assert.equal(
  fs.readFileSync(path.join(root, catalogueEntry), "utf8"),
  execFileSync("git", ["show", `${catalogueReview}:${catalogueEntry}`], {
    cwd: root, encoding: "utf8",
  }),
  "Catalogue entry changed beyond reviewed PR10 baseline",
);
const before = execFileSync("git", ["show", "04a52ec:src/app/layout.tsx"], {
  cwd: root,
  encoding: "utf8",
});
const after = fs
  .readFileSync(path.join(root, "src/app/layout.tsx"), "utf8")
  .replace("import '../styles/product.css';\n", "");
assert.equal(
  after,
  before,
  "Root layout changed beyond the scoped stylesheet import",
);
for (const stylesheet of [
  "src/styles/product.css",
  "src/components/landing/marketing.css",
]) {
  const css = postcss.parse(
    fs.readFileSync(path.join(root, stylesheet), "utf8"),
  );
  css.walkRules((rule) =>
    assert.ok(
      rule.selector.includes(".rh-product"),
      `Unscoped selector in ${stylesheet}: ${rule.selector}`,
    ),
  );
  css.walkDecls((decl) =>
    assert.notEqual(
      decl.prop,
      "font-family",
      "Do not replace the established font",
    ),
  );
}

const compiled = buildSync({
  entryPoints: [path.join(root, "src/components/system/ZoomLock.tsx")],
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["react"],
  write: false,
}).outputFiles[0].text;
const mod = { exports: {} };
new Function("require", "module", "exports", compiled)(
  createRequire(import.meta.url),
  mod,
  mod.exports,
);
const doc = new EventTarget(),
  win = new EventTarget();
const release = mod.exports.lockZoom(doc, win);
function check(target, type, props, prevented) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, props);
  target.dispatchEvent(event);
  assert.equal(
    event.defaultPrevented,
    prevented,
    `${type} ${JSON.stringify(props)}`,
  );
}
for (const type of ["gesturestart", "gesturechange", "gestureend"])
  check(doc, type, {}, true);
check(doc, "touchmove", { touches: [{}, {}] }, true);
check(doc, "touchmove", { touches: [{}], scale: 1.2 }, true);
check(doc, "touchmove", { touches: [{}], scale: 1 }, false);
check(win, "wheel", { ctrlKey: true }, true);
check(win, "wheel", { metaKey: true }, true);
check(win, "wheel", { ctrlKey: false, metaKey: false }, false);
check(win, "keydown", { ctrlKey: true, key: "+" }, true);
check(win, "keydown", { metaKey: true, key: "-" }, true);
check(win, "keydown", { ctrlKey: true, key: "c" }, false);
check(win, "keydown", { key: "ArrowDown" }, false);
release();
check(doc, "gesturestart", {}, false);
check(win, "wheel", { ctrlKey: true }, false);
console.log(
  "PASS: protected invitation files and reviewed catalogue unchanged; font/viewport unchanged; product CSS scoped; zoom prevention, normal scroll/keys and listener cleanup verified.",
);
console.log(
  "Limit: synthetic EventTarget checks do not replace pinch testing on physical iOS/Android devices.",
);
