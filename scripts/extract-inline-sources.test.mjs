import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  lstat,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";

import { extractInlineSources } from "./extract-inline-sources.mjs";

const temporaryDirectories = [];
const canonicalTemporaryDirectory = await realpath(tmpdir());
const extractorScript = fileURLToPath(
  new URL("./extract-inline-sources.mjs", import.meta.url),
);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function makeFixture(sourceMap) {
  const directory = await mkdtemp(
    path.join(canonicalTemporaryDirectory, "inline-sources-test-"),
  );
  temporaryDirectories.push(directory);

  const inputPath = path.join(directory, "bundle.js");
  const outputDirectory = path.join(directory, "sources");
  const encodedMap = Buffer.from(JSON.stringify(sourceMap)).toString("base64");

  await writeFile(
    inputPath,
    `console.log("bundle");\n//# sourceMappingURL=data:application/json;base64,${encodedMap}\n`,
  );

  return { directory, inputPath, outputDirectory };
}

test("extracts inline source contents into their relative source paths", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts", "src/lib/value.ts"],
    sourcesContent: ["export const main = true;\n", "export const value = 42;\n"],
  });

  const extracted = await extractInlineSources(
    fixture.inputPath,
    fixture.outputDirectory,
  );

  assert.deepEqual(
    extracted.map(({ source }) => source),
    ["src/main.ts", "src/lib/value.ts"],
  );
  assert.equal(
    await readFile(path.join(fixture.outputDirectory, "src/main.ts"), "utf8"),
    "export const main = true;\n",
  );
  assert.equal(
    await readFile(
      path.join(fixture.outputDirectory, "src/lib/value.ts"),
      "utf8",
    ),
    "export const value = 42;\n",
  );
});

test("creates the output directory with owner-only permissions", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["main"],
  });

  await extractInlineSources(fixture.inputPath, fixture.outputDirectory);

  const outputStats = await lstat(fixture.outputDirectory);
  assert.equal(outputStats.mode & 0o777, 0o700);
});

test("rejects an existing output directory before writing", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["main"],
  });

  await mkdir(fixture.outputDirectory);

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /output directory already exists/i,
  );
  await assert.rejects(
    readFile(path.join(fixture.outputDirectory, "src/main.ts")),
    { code: "ENOENT" },
  );
});

test("rejects a bundle without an inline source map at the end", async () => {
  const directory = await mkdtemp(
    path.join(canonicalTemporaryDirectory, "inline-sources-test-"),
  );
  temporaryDirectories.push(directory);
  const inputPath = path.join(directory, "bundle.js");

  await writeFile(inputPath, "console.log('no source map');\n");

  await assert.rejects(
    extractInlineSources(inputPath, path.join(directory, "sources")),
    /inline source map/i,
  );
});

test("rejects a source map without sourcesContent", async () => {
  const fixture = await makeFixture({ version: 3, sources: ["src/main.ts"] });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /sourcesContent/,
  );
});

test("rejects different sources and sourcesContent counts", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts", "src/other.ts"],
    sourcesContent: ["main"],
  });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /same length/i,
  );
});

for (const [label, source] of [
  ["POSIX absolute paths", "/tmp/escape.ts"],
  ["Windows absolute paths", "C:\\temp\\escape.ts"],
  ["UNC paths", "\\\\server\\share\\escape.ts"],
  ["parent traversal", "src/../../escape.ts"],
]) {
  test(`rejects ${label}`, async () => {
    const fixture = await makeFixture({
      version: 3,
      sources: [source],
      sourcesContent: ["escape"],
    });

    await assert.rejects(
      extractInlineSources(fixture.inputPath, fixture.outputDirectory),
      /unsafe source path/i,
    );
  });
}

test("validates every source path before writing any file", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/safe.ts", "../escape.ts"],
    sourcesContent: ["safe", "escape"],
  });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /unsafe source path/i,
  );
  await assert.rejects(
    readFile(path.join(fixture.outputDirectory, "src/safe.ts")),
    { code: "ENOENT" },
  );
});

test("rejects ancestor and descendant source paths before writing any file", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/entry", "src/entry/child.ts"],
    sourcesContent: ["entry", "child"],
  });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /conflicting source paths/i,
  );
  await assert.rejects(
    readFile(path.join(fixture.outputDirectory, "src/entry")),
    { code: "ENOENT" },
  );
});

test("rejects case-folded source path collisions before writing any file", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/Main.ts", "src/main.ts"],
    sourcesContent: ["upper", "lower"],
  });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /conflicting source paths/i,
  );
  await assert.rejects(
    readFile(path.join(fixture.outputDirectory, "src/Main.ts")),
    { code: "ENOENT" },
  );
});

test("supports only POSIX-style source paths", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src\\main.ts"],
    sourcesContent: ["main"],
  });

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /POSIX-style/i,
  );
});

test("rejects a pre-existing output directory before considering nested symlinks", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["linked/escape.ts"],
    sourcesContent: ["escape"],
  });
  const outsideDirectory = path.join(fixture.directory, "outside");

  await mkdir(fixture.outputDirectory, { recursive: true });
  await mkdir(outsideDirectory);
  await symlink(outsideDirectory, path.join(fixture.outputDirectory, "linked"));

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /output directory already exists/i,
  );
  await assert.rejects(readFile(path.join(outsideDirectory, "escape.ts")), {
    code: "ENOENT",
  });
});

test("rejects a symlink used as the output directory parent", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["main"],
  });
  const outsideDirectory = path.join(fixture.directory, "outside");
  const linkedParent = path.join(fixture.directory, "linked-parent");
  const outputDirectory = path.join(linkedParent, "sources");

  await mkdir(outsideDirectory);
  await symlink(outsideDirectory, linkedParent);

  await assert.rejects(
    extractInlineSources(fixture.inputPath, outputDirectory),
    /symbolic link/i,
  );
  await assert.rejects(
    readFile(path.join(outsideDirectory, "sources/src/main.ts")),
    { code: "ENOENT" },
  );
});

test("rejects a symlink in an earlier output ancestor before creating anything", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["main"],
  });
  const parentDirectory = path.join(fixture.directory, "parent");
  const outsideDirectory = path.join(fixture.directory, "outside");
  const linkedAncestor = path.join(parentDirectory, "linked");
  const nestedDirectory = path.join(outsideDirectory, "nested");
  const outputDirectory = path.join(linkedAncestor, "nested", "out");

  await mkdir(parentDirectory);
  await mkdir(nestedDirectory, { recursive: true });
  await symlink(outsideDirectory, linkedAncestor);

  await assert.rejects(
    extractInlineSources(fixture.inputPath, outputDirectory),
    /symbolic link/i,
  );
  await assert.rejects(lstat(path.join(nestedDirectory, "out")), {
    code: "ENOENT",
  });
});

test("rejects a non-directory in an earlier output ancestor", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["main"],
  });
  const parentDirectory = path.join(fixture.directory, "parent");
  const blockingFile = path.join(parentDirectory, "blocker");
  const outputDirectory = path.join(blockingFile, "nested", "out");

  await mkdir(parentDirectory);
  await writeFile(blockingFile, "do not replace");

  await assert.rejects(
    extractInlineSources(fixture.inputPath, outputDirectory),
    /output ancestor is not a directory/i,
  );
  assert.equal(await readFile(blockingFile, "utf8"), "do not replace");
});

test("does not overwrite an existing file by default", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["new content"],
  });
  const outputPath = path.join(fixture.outputDirectory, "src/main.ts");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, "original content");

  await assert.rejects(
    extractInlineSources(fixture.inputPath, fixture.outputDirectory),
    /already exists/i,
  );
  assert.equal(await readFile(outputPath, "utf8"), "original content");
});

test("runs as a CLI and reports extracted source names", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["export const main = true;"],
  });

  const result = spawnSync(
    process.execPath,
    [extractorScript, fixture.inputPath, fixture.outputDirectory],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    count: 1,
    sources: ["src/main.ts"],
  });
});

test("CLI usage states the local threat boundary", () => {
  const result = spawnSync(process.execPath, [extractorScript], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /caller-controlled private local temporary directory/i,
  );
  assert.match(
    result.stderr,
    /does not isolate against a malicious local process.*concurrently replace ancestor directories/i,
  );
  assert.match(result.stderr, /does not provide an atomic TOCTOU guarantee/i);
});

test("runs as a CLI when the script path is a symbolic link", async () => {
  const fixture = await makeFixture({
    version: 3,
    sources: ["src/main.ts"],
    sourcesContent: ["export const main = true;"],
  });
  const linkedScript = path.join(fixture.directory, "extract-sources.mjs");
  await symlink(extractorScript, linkedScript);

  const result = spawnSync(
    process.execPath,
    [linkedScript, fixture.inputPath, fixture.outputDirectory],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    count: 1,
    sources: ["src/main.ts"],
  });
});
