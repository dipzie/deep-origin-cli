/* //core/auditEngine.js
 * ─────────────────────────────────────────────────────────────
 *                       ORIGIN LITE MODE
 *                       INTERNAL MODULE
 * ─────────────────────────────────────────────────────────────
 *
 *  WARNING:
 *  This file is part of Origin Lite Mode’s internal scanning
 *  engine. It is not a public API and not designed for reuse,
 *  modification, or redistribution.
 *
 *  Changing, copying, or altering this file may cause:
 *    • auditEngine failure
 *    • incorrect scan results
 *    • unstable CLI behavior
 *    • loss of Lite Mode protections
 *    • invalid preview generation
 *
 *  The full, stable, and extended scanning engine is available
 *  ONLY in Origin Pro. Lite Mode contains intentionally limited
 *  and obfuscated logic for security and upgrade protection.
 *
 *  Proceed at your own risk. This module is NOT considered a
 *  stable API surface and may break without notice.
 *
 *  © Dipz Origin — Protected Internal Logic
 * ─────────────────────────────────────────────────────────────
 */

import fs from "fs-extra";
import path from "path";
import pc from "picocolors";

import { detectFramework } from "./frameworkDetector.js";
import { scanComponents } from "./componentScanner.js";
import { scanPages } from "./pageScanner.js";
import { scanFeatures } from "./featureScanner.js";
import { detectUISystem } from "./uiScanner.js";
import { generateStructureHints } from "./hintEngine.js";
import { generateSummary, computeHealthScore } from "./summaryGenerator.js";

import { scanComponentRelationships } from "./relationshipScanner.js";
import { scanDuplicates } from "./duplicateScanner.js";
import { scanDeadFiles } from "./deadFileScanner.js";
import { scanUnusedDependencies } from "./unusedDepsScanner.js";

// Filter files for bridge + clean history records
function filterBridgeFiles(files) {
  return files.filter(
    (f) =>
      !f.includes("node_modules") &&
      !f.includes(".git") &&
      !f.includes("dist") &&
      !f.includes("build") &&
      !f.includes(".next") &&
      !f.includes(".turbo") &&
      !f.includes("coverage") &&
      !f.includes("out") &&
      !f.includes(".cache") &&
      !f.includes("audit_history") &&
      !f.includes("bridge_summary.md") &&
      !f.includes("package-lock") &&
      !f.includes("yarn.lock") &&
      !f.includes("pnpm-lock")
  );
}

export async function runAudit(root) {
  console.log(pc.cyan(pc.bold("\n✨ Origin Lite Mode Audit\n")));
  console.log(pc.dim("Preparing project…\n"));

  const project = path.basename(root);
  const files = await collectFiles(root);

  console.log(pc.green("✔ Project loaded"));
  console.log(pc.dim("Scanning framework, components, pages, features...\n"));

  const framework = detectFramework(root);
  const components = scanComponents(root);
  const pages = scanPages(root);
  const features = scanFeatures(root);
  const ui = detectUISystem(root);
  const hints = generateStructureHints(root);

  // NEW Scanners
  const rel = scanComponentRelationships(root, { components, project });
  const relationships = rel.preview;
  const relationshipsTotal = rel.total;

  const duplicates = scanDuplicates(root, { components, project });
  const deadFiles = scanDeadFiles(root, { project });
  const unusedDeps = scanUnusedDependencies(root, { project });

  console.log(pc.green("✔ Base scanning complete\n"));

  const backendExists =
    fs.existsSync(path.join(root, "src", "backend")) ||
    fs.existsSync(path.join(root, "server")) ||
    fs.existsSync(path.join(root, "api")) ||
    fs.existsSync(path.join(root, "backend"));

  // CLEAN file list for bridge + history
  const filteredFiles = filterBridgeFiles(files);

  // Markdown summary file
  const summary = generateSummary({
    project,
    files: filteredFiles,
    framework,
    components,
    pages,
    features,
    ui,
    hints,
    backendExists,
    relationships,
    relationshipsTotal,
    duplicates,
    deadFiles,
    unusedDeps,
    timestamp: new Date().toISOString(),
  });

  // Save bridge summary
  fs.ensureDirSync(path.join(root, "docs/ai"));
  const out = path.join(root, "docs/ai/bridge_summary.md");
  fs.writeFileSync(out, summary);
  console.log(pc.green(`📄 Summary saved → docs/ai/bridge_summary.md`));

  // Save audit history
  const historyDir = path.join(root, "docs/audit_history");
  fs.ensureDirSync(historyDir);

  const id = Date.now().toString();
  const historyFile = path.join(historyDir, `audit_${id}.json`);

  fs.writeJsonSync(
    historyFile,
    {
      project,
      files: filteredFiles,
      framework,
      components,
      pages,
      features,
      ui,
      hints,
      relationships,
      relationshipsTotal,
      duplicates,
      deadFiles,
      unusedDeps,
      timestamp: new Date().toISOString(),
    },
    { spaces: 2 }
  );

  console.log(
    pc.green(`📦 History saved → docs/audit_history/audit_${id}.json\n`)
  );

  // HEALTH SCORE
  const health = computeHealthScore({ features, ui, hints, framework });

  // ======================
  // CLEAN CONSOLE OUTPUT
  // ======================
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  PROJECT OVERVIEW")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.white(`Project:      `) + pc.green(project));
  console.log(
    pc.white(`Files:        `) + pc.green(filteredFiles.length.toString())
  );
  console.log(pc.white(`Framework:    `) + pc.green(framework));
  console.log(pc.white(`Health:       `) + pc.green(`${health}%`));
  console.log("");

  // PAGES
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  PAGES (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  pages.slice(0, 10).forEach((p) => console.log("• " + p));
  if (pages.length > 10)
    console.log(pc.magenta(`+${pages.length - 10} more (Pro)`));
  console.log("");

  // FEATURES
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  FEATURES (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  features.slice(0, 10).forEach((f) => console.log("• " + f));
  if (features.length > 10)
    console.log(pc.magenta(`+${features.length - 10} more (Pro)`));
  console.log("");

  // UI SYSTEM
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  UI SYSTEM")));
  console.log(pc.cyan("────────────────────────────────────────"));
  if (ui.length) ui.forEach((u) => console.log("• " + u));
  else console.log("None detected");
  console.log("");

  // RELATIONSHIPS
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  COMPONENT RELATIONSHIPS (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));

  relationships.forEach((line) => console.log("• " + line));
  if (relationshipsTotal > relationships.length)
    console.log(
      pc.magenta(`+${relationshipsTotal - relationships.length} more (Pro)`)
    );
  console.log("");

  // DUPLICATES
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  POSSIBLE DUPLICATES (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  duplicates.forEach((d) => console.log("• " + d));
  if (duplicates.total > duplicates.preview.length)
    console.log(
      pc.magenta(`+${duplicates.total - duplicates.preview.length} more (Pro)`)
    );
  console.log("");

  // DEAD FILES
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  DEAD FILES (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  deadFiles.preview.forEach((d) => console.log("• " + d));
  if (deadFiles.total > deadFiles.preview.length)
    console.log(
      pc.magenta(`+${deadFiles.total - deadFiles.preview.length} more (Pro)`)
    );
  console.log("");

  // UNUSED DEPS
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  UNUSED DEPENDENCIES (Preview)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  unusedDeps.preview.forEach((d) => console.log("• " + d));
  if (unusedDeps.total > unusedDeps.preview.length)
    console.log(
      pc.magenta(`+${unusedDeps.total - unusedDeps.preview.length} more (Pro)`)
    );
  console.log("");

  // STRUCTURE HINTS
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  STRUCTURE HINTS (Lite)")));
  console.log(pc.cyan("────────────────────────────────────────"));
  if (hints.length) hints.forEach((h) => console.log(pc.yellow("⚠ " + h)));
  else console.log("No structural issues detected.");
  console.log("");

  // END
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  FRIENDLY SUMMARY")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(
    `Looks like a ${framework} project with${
      features.length ? " modular features." : " basic structure."
    }\n`
  );

  console.log(pc.green("✨ Audit complete — great progress!\n"));

  return summary;
}

// ======================================================
// FILE SCANNER (IGNORES NODE_MODULES, GIT, DIST, ETC.)
// ======================================================
async function collectFiles(root) {
  const list = [];

  const IGNORE = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".turbo",
    "coverage",
    "out",
    ".cache",
    ".vscode",
  ];

  function walk(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      if (IGNORE.includes(item)) continue;

      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        list.push(full.replace(root, ""));
      }
    }
  }

  walk(root);
  return list;
}
