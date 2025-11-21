/*
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
 *  The full scanning engine is available ONLY in Origin Pro.
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
import { scanNextPages } from "./nextPageScanner.js";
import { scanFeatures } from "./featureScanner.js";

import { detectUISystem } from "./uiScanner.js";
import { detectAdvancedUI } from "./uiDetectorAdvanced.js";

import { scanRouting } from "./routingDetector.js";

import { generateStructureHints } from "./hintEngine.js";
import { generateSummary, computeHealthScore } from "./summaryGenerator.js";

import { scanComponentRelationships } from "./relationshipScanner.js";
import { scanDuplicates } from "./duplicateScanner.js";
import { scanDeadFiles } from "./deadFileScanner.js";
import { scanUnusedDependencies } from "./unusedDepsScanner.js";

/* ============================================================
   FILTER BRIDGE/HISTORY FILES
   ============================================================ */
function filterBridgeFiles(files = []) {
  if (!Array.isArray(files)) return [];
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

/* ============================================================
   UNIVERSAL SECTION PRINTER
   Supports:
   - Simple arrays
   - { preview, total }
   ============================================================ */
function printSection(title, data, limit = 10) {
  if (!data) return;

  let items = [];
  let total = 0;

  // Format A: array
  if (Array.isArray(data)) {
    items = data;
    total = data.length;
  }

  // Format B: { preview: [], total: N }
  else if (typeof data === "object" && data.preview) {
    items = data.preview;
    total = data.total || data.preview.length;
  }

  if (total === 0) return;

  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white(`  ${title}`)));
  console.log(pc.cyan("────────────────────────────────────────"));

  items.slice(0, limit).forEach((i) => console.log("• " + i));

  if (total > limit) {
    console.log(pc.magenta(`+${total - limit} more (Pro)`));
  }

  console.log("");
}

/* ============================================================
   HINTS PRINTER (Lite)
   ============================================================ */
function printHints(title, hints, limit = 6) {
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white(`  ${title}`)));
  console.log(pc.cyan("────────────────────────────────────────"));

  if (!hints || hints.length === 0) {
    console.log("No structural issues detected.\n");
    return;
  }

  const items = Array.isArray(hints) ? hints : hints.hints;

  items.slice(0, limit).forEach((h) => console.log(pc.yellow("⚠ " + h)));

  if (items.length > limit) {
    console.log(pc.magenta(`+${items.length - limit} more (Pro)`));
  }

  console.log("");
}

/* ============================================================
   MODULE 5 — EXPERIENCE ENGINE
   ============================================================ */
function getArchitecture(framework) {
  if (framework.includes("Next.js")) return "Fullstack";
  return "Frontend";
}

function getFrameworkBadge(framework) {
  if (framework.includes("Next")) return "⚡ Next.js";
  if (framework.includes("React")) return "⚛️ React";
  if (framework.includes("Vite")) return "⚡ Vite";
  return "📦 Unknown";
}

function evaluateUXQuality(meta) {
  if (!meta) return "Clean structure.";

  if (meta.totalScore <= 2) return "Very clean — minimal structural issues.";
  if (meta.totalScore <= 6) return "Clean — a few minor issues found.";
  if (meta.totalScore <= 12) return "Structure needs light cleanup.";

  return "Several issues detected — consider reorganizing.";
}

function generateSmartTip(meta) {
  if (!meta) return "Tip: Project looks stable.";

  if (meta.deepNesting > 0)
    return "Tip: Flatten deep folder nesting to improve maintainability.";

  if (meta.mixedExt)
    return "Tip: Avoid mixing JS and TS files to keep consistency.";

  if (meta.emptyFolders > 0)
    return "Tip: Remove empty folders to reduce noise.";

  return "Tip: Structure is stable — no major adjustments needed.";
}

function motivationLine() {
  return "You're building momentum — keep going! 🚀";
}

/* ============================================================
   MAIN AUDIT ENGINE
   ============================================================ */
export async function runAudit(root) {
  console.log(pc.cyan(pc.bold("\n✨ Origin Lite Mode Audit\n")));
  console.log(pc.dim("Preparing project…\n"));

  const project = path.basename(root);
  const files = await collectFiles(root);

  console.log(pc.green("✔ Project loaded"));
  console.log(pc.dim("Scanning framework, components, pages, features...\n"));

  /* ------------------ Base Predictors ------------------ */
  const framework = detectFramework(root) || "Unknown";

  const pages = framework.includes("Next.js")
    ? scanNextPages(root)
    : scanPages(root);

  const components = scanComponents(root) || [];
  const features = scanFeatures(root) || [];
  const routing = scanRouting(root) || [];

  const uiBasic = detectUISystem(root) || [];
  const uiAdvanced = detectAdvancedUI(root) || [];
  const ui = [...new Set([...uiBasic, ...uiAdvanced])];

  const { hints, meta } = generateStructureHints(root);

  /* ------------------ Secondary Scanners ------------------ */
  const rel = scanComponentRelationships(root, { components, project });
  const relationships = rel.preview || [];
  const relationshipsTotal = rel.total || 0;

  const duplicates = scanDuplicates(root, { components, project });
  const deadFiles = scanDeadFiles(root, {
    allFiles: Array.isArray(files) ? files : [],
    project,
  });
  const unusedDeps = scanUnusedDependencies(root, { project });

  console.log(pc.green("✔ Base scanning complete\n"));

  const filteredFiles = filterBridgeFiles(files);

  /* ============================================================
     SUMMARY + HISTORY
     ============================================================ */
  const summary = generateSummary({
    project,
    files: filteredFiles,
    framework,
    components,
    pages,
    features,
    ui,
    hints,
    meta, // MODULE 5
    relationships,
    relationshipsTotal,
    duplicates,
    deadFiles,
    unusedDeps,
    timestamp: new Date().toISOString(),
  });

  fs.ensureDirSync(path.join(root, "docs/ai"));
  fs.writeFileSync(path.join(root, "docs/ai/bridge_summary.md"), summary);

  const id = Date.now().toString();

  fs.ensureDirSync(path.join(root, "docs/audit_history"));
  fs.writeJsonSync(
    path.join(root, "docs/audit_history", `audit_${id}.json`),
    {
      project,
      files: filteredFiles,
      framework,
      components,
      pages,
      features,
      ui,
      hints,
      meta,
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

  /* ============================================================
     HEALTH SCORE
     ============================================================ */
  const health = computeHealthScore({
    features,
    ui,
    hints,
  });

  /* ============================================================
     OUTPUT (Dynamic + Lite-Safe)
     ============================================================ */

  // Overview
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  PROJECT OVERVIEW")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.white(`Project:      `) + pc.green(project));
  console.log(pc.white(`Files:        `) + pc.green(filteredFiles.length));
  console.log(pc.white(`Framework:    `) + pc.green(framework));
  console.log(pc.white(`Health:       `) + pc.green(`${health}%`));
  console.log("");

  /* ---------------- EXPERIENCE BLOCK (Module 5) ---------------- */
  const architecture = getArchitecture(framework);

  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  EXPERIENCE")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(`Architecture: ${architecture}`);
  console.log(`Framework Badge: ${getFrameworkBadge(framework)}`);
  console.log(`UX Quality: ${evaluateUXQuality(meta)}`);
  console.log(generateSmartTip(meta));
  console.log("");

  /* ---------------- PREVIEW SECTIONS ---------------- */
  printSection("PAGES (Preview)", pages);
  printSection("FEATURES (Preview)", features);
  printSection("ROUTING (Preview)", routing);

  // UI SYSTEM
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  UI SYSTEM")));
  console.log(pc.cyan("────────────────────────────────────────"));
  if (ui.length > 0) ui.forEach((u) => console.log("• " + u));
  else console.log("None detected");
  console.log("");

  printSection("COMPONENTS (Preview)", components);
  printSection("COMPONENT RELATIONSHIPS (Preview)", relationships);

  // Extra Pro counter for relationships
  if (relationshipsTotal > relationships.length) {
    console.log(
      pc.magenta(`+${relationshipsTotal - relationships.length} more (Pro)`)
    );
    console.log("");
  }

  printSection("POSSIBLE DUPLICATES (Preview)", duplicates);
  printSection("DEAD FILES (Preview)", deadFiles);
  printSection("UNUSED DEPENDENCIES (Preview)", unusedDeps);

  printHints("STRUCTURE HINTS (Lite)", hints);

  /* ---------------- MOTIVATION (Module 5) ---------------- */
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  MOTIVATION")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(motivationLine());
  console.log("");

  console.log(pc.green("✨ Audit complete — great progress!\n"));

  return summary;
}

/* ============================================================
   FILE SCANNER
   ============================================================ */
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
    if (!fs.existsSync(dir)) return;

    for (const item of fs.readdirSync(dir)) {
      if (IGNORE.includes(item)) continue;

      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else list.push(full.replace(root, ""));
    }
  }

  walk(root);
  return list;
}
