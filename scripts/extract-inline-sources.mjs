#!/usr/bin/env node

import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INLINE_SOURCE_MAP_PATTERN =
  /\/\/[#@]\s*sourceMappingURL=data:application\/json(?:;[^,]*)?;base64,([A-Za-z0-9+/=]+)\s*$/;

function safeRelativePath(source) {
  if (typeof source !== "string" || source.length === 0 || source.includes("\0")) {
    throw new Error(`Unsafe source path: ${String(source)}`);
  }
  if (source.includes("\\")) {
    throw new Error(
      `Unsafe source path; only POSIX-style source paths are supported: ${source}`,
    );
  }

  const segments = source.split("/");

  if (
    path.posix.isAbsolute(source) ||
    path.win32.isAbsolute(source) ||
    segments.includes("..")
  ) {
    throw new Error(`Unsafe source path: ${source}`);
  }

  const normalized = path.posix.normalize(source);
  if (normalized === "." || normalized === "") {
    throw new Error(`Unsafe source path: ${source}`);
  }

  return normalized;
}

function assertNoSourcePathConflicts(extracted) {
  const shortestFirst = extracted
    .map(({ source, relativePath }) => ({
      source,
      foldedPath: relativePath.toLowerCase(),
    }))
    .sort((left, right) => {
      const depthDifference =
        left.foldedPath.split("/").length - right.foldedPath.split("/").length;
      return depthDifference || left.foldedPath.localeCompare(right.foldedPath);
    });
  const seen = new Map();

  for (const candidate of shortestFirst) {
    const segments = candidate.foldedPath.split("/");
    for (let length = 1; length <= segments.length; length += 1) {
      const possibleConflict = segments.slice(0, length).join("/");
      const conflictingSource = seen.get(possibleConflict);
      if (conflictingSource) {
        throw new Error(
          `Conflicting source paths: ${conflictingSource} and ${candidate.source}`,
        );
      }
    }
    seen.set(candidate.foldedPath, candidate.source);
  }
}

function outputPathWithin(outputRoot, relativePath) {
  const outputPath = path.resolve(outputRoot, ...relativePath.split("/"));
  const relative = path.relative(outputRoot, outputPath);

  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error(`Unsafe source path: ${relativePath}`);
  }

  return outputPath;
}

async function statsIfPresent(targetPath) {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function rejectSymlink(stats, targetPath) {
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing to follow symbolic link: ${targetPath}`);
  }
}

async function assertDirectoryAncestorsSafe(directoryPath) {
  const ancestors = [];
  let currentPath = directoryPath;

  while (true) {
    ancestors.push(currentPath);
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) break;
    currentPath = parentPath;
  }

  for (const ancestorPath of ancestors.reverse()) {
    const stats = await lstat(ancestorPath);
    rejectSymlink(stats, ancestorPath);
    if (!stats.isDirectory()) {
      throw new Error(`Output ancestor is not a directory: ${ancestorPath}`);
    }
  }
}

async function assertOutputRootSafe(outputRoot) {
  const parentPath = path.dirname(outputRoot);
  await assertDirectoryAncestorsSafe(parentPath);

  const rootStats = await lstat(outputRoot);
  rejectSymlink(rootStats, outputRoot);
  if (!rootStats.isDirectory()) {
    throw new Error(`Output path is not a directory: ${outputRoot}`);
  }
}

async function prepareOutputRoot(outputRoot) {
  const parentPath = path.dirname(outputRoot);
  await assertDirectoryAncestorsSafe(parentPath);

  const existingRootStats = await statsIfPresent(outputRoot);
  if (existingRootStats) {
    rejectSymlink(existingRootStats, outputRoot);
    throw new Error(`Output directory already exists: ${outputRoot}`);
  }

  await mkdir(outputRoot, { mode: 0o700 });
  await assertOutputRootSafe(outputRoot);
}

async function assertSafeOutput(outputRoot, outputPath) {
  const relative = path.relative(outputRoot, outputPath);
  const segments = relative.split(path.sep);
  let currentPath = outputRoot;

  await assertOutputRootSafe(outputRoot);

  for (let index = 0; index < segments.length; index += 1) {
    currentPath = path.join(currentPath, segments[index]);

    const stats = await statsIfPresent(currentPath);
    if (!stats) return;
    rejectSymlink(stats, currentPath);
    if (index === segments.length - 1) {
      throw new Error(`Output file already exists: ${currentPath}`);
    }
    if (!stats.isDirectory()) {
      throw new Error(`Output parent is not a directory: ${currentPath}`);
    }
  }
}

async function ensureSafeParentDirectories(outputRoot, outputPath) {
  const relativeParent = path.relative(outputRoot, path.dirname(outputPath));
  const segments = relativeParent === "" ? [] : relativeParent.split(path.sep);
  let currentPath = outputRoot;

  for (const segment of segments) {
    currentPath = path.join(currentPath, segment);
    let stats = await statsIfPresent(currentPath);
    if (!stats) {
      await mkdir(currentPath);
      stats = await lstat(currentPath);
    }
    rejectSymlink(stats, currentPath);
    if (!stats.isDirectory()) {
      throw new Error(`Output parent is not a directory: ${currentPath}`);
    }
  }
}

/**
 * Extracts the text embedded in a bundle's trailing inline source map.
 *
 * Security boundary: `outputDirectory` must not exist and must be located in a
 * caller-controlled private local temporary directory. Existing ancestors are
 * checked for symbolic links and non-directories. This does not isolate against
 * a malicious local process with permission to concurrently replace ancestor
 * directories, and does not provide an atomic TOCTOU guarantee.
 */
export async function extractInlineSources(inputPath, outputDirectory) {
  const bundle = await readFile(inputPath, "utf8");
  const match = bundle.match(INLINE_SOURCE_MAP_PATTERN);
  if (!match) {
    throw new Error("Bundle does not end with an inline source map");
  }

  const sourceMap = JSON.parse(
    Buffer.from(match[1], "base64").toString("utf8"),
  );
  if (!Array.isArray(sourceMap.sources)) {
    throw new Error("Source map is missing sources");
  }
  if (!Array.isArray(sourceMap.sourcesContent)) {
    throw new Error("Source map is missing sourcesContent");
  }
  if (sourceMap.sources.length !== sourceMap.sourcesContent.length) {
    throw new Error("sources and sourcesContent must have the same length");
  }

  const outputRoot = path.resolve(outputDirectory);
  const extracted = sourceMap.sources.map((source, index) => {
    const relativePath = safeRelativePath(source);
    const outputPath = outputPathWithin(outputRoot, relativePath);
    const content = sourceMap.sourcesContent[index];

    if (typeof content !== "string") {
      throw new Error(`sourcesContent must contain text for: ${source}`);
    }

    return { source, relativePath, outputPath, content };
  });
  assertNoSourcePathConflicts(extracted);

  await prepareOutputRoot(outputRoot);
  await Promise.all(
    extracted.map(({ outputPath }) => assertSafeOutput(outputRoot, outputPath)),
  );
  for (const { outputPath } of extracted) {
    await ensureSafeParentDirectories(outputRoot, outputPath);
  }
  await Promise.all(
    extracted.map(({ outputPath }) => assertSafeOutput(outputRoot, outputPath)),
  );

  for (const { outputPath, content } of extracted) {
    await assertSafeOutput(outputRoot, outputPath);
    await writeFile(outputPath, content, { flag: "wx" });
  }

  return extracted.map(({ source, outputPath }) => ({ source, outputPath }));
}

async function runCli(args) {
  const unknownOptions = args.filter((argument) => argument.startsWith("--"));
  const positionalArguments = args.filter((argument) => !argument.startsWith("--"));

  if (unknownOptions.length > 0 || positionalArguments.length !== 2) {
    throw new Error(
      "Usage: node scripts/extract-inline-sources.mjs <bundle.js> <output-directory>\n" +
        "Safety: <output-directory> must not exist and must be inside a " +
        "caller-controlled private local temporary directory. This rejects " +
        "existing symbolic-link ancestors but does not isolate against a " +
        "malicious local process with permission to concurrently replace " +
        "ancestor directories, and does not provide an atomic TOCTOU guarantee.",
    );
  }

  const extracted = await extractInlineSources(
    positionalArguments[0],
    positionalArguments[1],
  );

  process.stdout.write(
    `${JSON.stringify({
      count: extracted.length,
      sources: extracted.map(({ source }) => source),
    })}\n`,
  );
}

async function isCliEntryPoint() {
  if (!process.argv[1]) return false;
  try {
    return (
      (await realpath(process.argv[1])) ===
      (await realpath(fileURLToPath(import.meta.url)))
    );
  } catch {
    return false;
  }
}

if (await isCliEntryPoint()) {
  try {
    await runCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  }
}
