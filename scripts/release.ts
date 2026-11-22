// Bumps the published libraries to a shared version, then commits and tags the release.
// Publishing is a separate step (`pnpm -r publish`) so the release commit can be reviewed first.
//
// Usage: pnpm release <patch|minor|major|x.y.z>

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const LIBS = ["navmesh", "phaser-navmesh"] as const;
const USAGE = "Usage: pnpm release <patch|minor|major|x.y.z>";

interface Manifest {
  name: string;
  path: string;
  pkg: { version: string; [key: string]: unknown };
}

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function nextVersion(version: string, bump: string): string {
  const [major, minor, patch] = version.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  if (/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(bump)) return bump;
  fail(`Invalid version "${bump}". ${USAGE}`);
}

const bump = process.argv[2];
if (!bump) fail(USAGE);

if (run("git", ["status", "--porcelain"]))
  fail("Working tree is not clean. Commit or stash first.");

const manifests: Manifest[] = LIBS.map((name) => {
  const path = `packages/${name}/package.json`;
  return { name, path, pkg: JSON.parse(readFileSync(path, "utf8")) };
});

const versions = new Set(manifests.map((m) => m.pkg.version));
if (versions.size !== 1) fail(`Libraries are on different versions: ${[...versions].join(", ")}`);
const [current] = versions;
const next = nextVersion(current, bump);

for (const { path, pkg } of manifests) {
  pkg.version = next;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
}

const tags = LIBS.map((name) => `${name}@${next}`);
run("git", ["add", ...manifests.map((m) => m.path)]);
run("git", ["commit", "-m", `Publish\n\n${tags.map((t) => ` - ${t}`).join("\n")}`]);
for (const tag of tags) run("git", ["tag", tag, "-m", tag]);

console.log(`Bumped ${LIBS.join(", ")} from ${current} to ${next}, committed and tagged.`);
console.log("Next steps:");
console.log("  git push --follow-tags");
console.log("  pnpm -r publish");
