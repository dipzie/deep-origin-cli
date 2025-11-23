/* ============================================================
   ORIGIN LITE MODE — AUDIT ENGINE (FINAL PATCHED VERSION)
   Fully synced with:
   - backendSummaryEngine (Balanced Mode)
   - fullstackSummaryEngine
   - FE Lite Engine (Module 5)
   ============================================================ */

import fs from "fs-extra";
import path from "path";
import pc from "picocolors";

/* ============================================================
   FRONTEND IMPORTS
   ============================================================ */
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
   BACKEND + FULLSTACK IMPORTS
   ============================================================ */
import { generateBackendSummary } from "./backend/backendSummaryEngine.js";
import { generateFullstackSummary } from "./fullstack/fullstackSummaryEngine.js";

/* ============================================================
   FILTER SAFE FILES
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
      !f.includes("bridge_summary.md")
  );
}

/* ============================================================
   PREVIEW SECTION PRINTER
   ============================================================ */
function printSection(title, data, limit = 10) {
  if (!data) return;

  let items = [];
  let total = 0;

  if (Array.isArray(data)) {
    items = data;
    total = data.length;
  } else if (data && typeof data === "object" && data.preview) {
    items = data.preview;
    total = data.total || items.length;
  } else return;

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
   HINTS PRINTER
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
   EXPERIENCE ENGINE (Module 5)
   ============================================================ */
function getFrameworkBadge(framework) {
  if (framework.includes("Next")) return "⚡ Next.js";
  if (framework.includes("React")) return "⚛️ React";
  if (framework.includes("Vite")) return "⚡ Vite";
  return "📦 Unknown";
}

function evaluateUXQuality(meta) {
  if (!meta) return "Clean structure.";
  if (meta.totalScore <= 2) return "Very clean — minimal issues.";
  if (meta.totalScore <= 6) return "Clean — minor issues.";
  if (meta.totalScore <= 12) return "Needs light cleanup.";
  return "Several structural issues detected.";
}

function generateSmartTip(meta) {
  if (!meta) return "Tip: Project looks stable.";
  if (meta.deepNesting > 0) return "Tip: Flatten deep folder nesting.";
  if (meta.mixedExt) return "Tip: Avoid mixing JS and TS.";
  if (meta.emptyFolders > 0) return "Tip: Remove empty folders.";
  return "Tip: Structure is stable — no major changes needed.";
}

function motivationLine() {
  return "You're building momentum — keep going! 🚀";
}

/* ============================================================
   FRONTEND DETECTOR
   ============================================================ */
function safeHasFrontend(root) {
  const fePaths = [
    "src",
    "src/pages",
    "src/components",
    "pages",
    "components",
    "app",
  ];
  return fePaths.some((p) => fs.existsSync(path.join(root, p)));
}

/* ============================================================
   MAIN AUDIT ENGINE (FINAL)
   ============================================================ */
export async function runAudit(root) {
  console.log(pc.cyan(pc.bold("\n✨ Origin Lite Mode Audit\n")));
  console.log(pc.dim("Preparing project…\n"));

  const project = path.basename(root);
  const files = await collectFiles(root);

  console.log(pc.green("✔ Project loaded"));
  console.log(pc.dim("Scanning FE structure...\n"));

  /* ---------------- FRONTEND SCAN ---------------- */
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

  /* ---------------- FE SECONDARY SCANNERS ---------------- */
  const rel = scanComponentRelationships(root, { components, project });
  const relationships = rel.preview || [];
  const relationshipsTotal = rel.total || 0;

  const duplicates = scanDuplicates(root, { components, project });
  const deadFiles = scanDeadFiles(root, {
    allFiles: Array.isArray(files) ? files : [],
    project,
  });
  const unusedDeps = scanUnusedDependencies(root, { project });

  const filteredFiles = filterBridgeFiles(files);

  console.log(pc.green("✔ FE scanning done\n"));

  /* ---------------- FE HISTORY SAVE ---------------- */
  const summary = generateSummary({
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
      frontend: summary,
      timestamp: new Date().toISOString(),
    },
    { spaces: 2 }
  );

  /* ---------------- HEALTH ---------------- */
  const health = computeHealthScore({ features, ui, hints });

  /* ============================================================
     BACKEND + FULLSTACK
     ============================================================ */
  console.log(pc.cyan("\nPreparing backend scan...\n"));

  const frontendSummary = {
    framework,
    pages,
    components,
    features,
    ui,
    hints,
    meta,
    health,
  };

  const backendSummary = generateBackendSummary(root);

  console.log(pc.green("✔ Backend scan complete"));
  console.log(pc.dim("Determining project mode...\n"));

  let MODE = "FRONTEND";

  const hasFrontend = safeHasFrontend(root);
  const hasBackend =
    backendSummary &&
    (backendSummary.backendInfo.routes > 0 ||
      backendSummary.backendInfo.controllers > 0 ||
      backendSummary.backendInfo.models > 0);

  if (hasFrontend && hasBackend) {
    MODE = "FULLSTACK";
    console.log(pc.magenta("🟣 Fullstack project detected\n"));
  } else if (!hasFrontend && hasBackend) {
    MODE = "BACKEND";
    console.log(pc.blue("🟦 Backend project detected — Lite Mode\n"));
  } else {
    MODE = "FRONTEND";
    console.log(pc.green("🟩 Frontend Mode active\n"));
  }

  /* ============================================================
     SUMMARY WRITER
     ============================================================ */
  let finalBridgeSummary = "";

  /* ---------------- BACKEND ONLY ---------------- */
  if (MODE === "BACKEND") {
    finalBridgeSummary = backendSummary.summaryText;

    fs.writeFileSync(
      path.join(root, "docs/ai/bridge_summary.md"),
      finalBridgeSummary
    );

    console.log(pc.green("📄 backend bridge_summary.md updated\n"));
  } else if (MODE === "FULLSTACK") {

  /* ---------------- FULLSTACK ---------------- */
    const fullstackSummary = generateFullstackSummary({
      frontend: frontendSummary,
      backend: backendSummary,
      root,
    });

    finalBridgeSummary = fullstackSummary;

    fs.writeFileSync(
      path.join(root, "docs/ai/bridge_summary.md"),
      finalBridgeSummary
    );

    console.log(pc.green("📄 fullstack bridge_summary.md updated\n"));
  } else {

  /* ---------------- FRONTEND ONLY ---------------- */
    finalBridgeSummary = summary;
    fs.writeFileSync(path.join(root, "docs/ai/bridge_summary.md"), summary);

    console.log(pc.green("📄 frontend bridge_summary.md updated\n"));
  }

  /* ============================================================
     TERMINAL OUTPUT (FE/BE/FS)
     ============================================================ */
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  PROJECT OVERVIEW")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.white(`Project:      `) + pc.green(project));
  console.log(pc.white(`Files:        `) + pc.green(filteredFiles.length));
  console.log(pc.white(`Framework:    `) + pc.green(framework));
  console.log(pc.white(`Health:       `) + pc.green(`${health}%`));
  console.log("");

  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  EXPERIENCE")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(`Architecture: ${MODE}`);
  console.log(`Framework Badge: ${getFrameworkBadge(framework)}`);
  console.log(`UX Quality: ${evaluateUXQuality(meta)}`);
  console.log(generateSmartTip(meta));
  console.log("");

  /* ---------------- FRONTEND OUTPUT HIDDEN IN BE ---------------- */
  if (MODE !== "BACKEND") {
    printSection("PAGES (Preview)", pages);
    printSection("FEATURES (Preview)", features);
    printSection("ROUTING (Preview)", routing);

    console.log(pc.cyan("────────────────────────────────────────"));
    console.log(pc.bold(pc.white("  UI SYSTEM")));
    console.log(pc.cyan("────────────────────────────────────────"));
    if (ui.length > 0) ui.forEach((u) => console.log("• " + u));
    else console.log("None detected");
    console.log("");

    printSection("COMPONENTS (Preview)", components);
    printSection("COMPONENT RELATIONSHIPS (Preview)", relationships);

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
  }

  /* ---------------- BACKEND OUTPUT BLOCK ---------------- */
  if (MODE === "BACKEND" || MODE === "FULLSTACK") {
    console.log(pc.cyan("────────────────────────────────────────"));
    console.log(pc.bold(pc.white("  BACKEND SUMMARY (Lite)")));
    console.log(pc.cyan("────────────────────────────────────────"));

    console.log(`Framework: ${backendSummary.backendInfo.framework}`);
    console.log(`Routes: ${backendSummary.backendInfo.routes}`);
    console.log(`Controllers: ${backendSummary.backendInfo.controllers}`);
    console.log(`Services: ${backendSummary.backendInfo.services}`);
    console.log(`Models: ${backendSummary.backendInfo.models}`);
    console.log(`Config Files: ${backendSummary.backendInfo.configFiles}`);
    console.log(`Health: ${backendSummary.backendInfo.health}%\n`);

    console.log(
      pc.dim("Full backend & fullstack report → docs/ai/bridge_summary.md\n")
    );
  }

  /* ============================================================
     MOTIVATION
     ============================================================ */
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(pc.bold(pc.white("  MOTIVATION")));
  console.log(pc.cyan("────────────────────────────────────────"));
  console.log(motivationLine());
  console.log("");

  console.log(pc.green("✨ Audit complete — great progress!\n"));

  return finalBridgeSummary;
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

export default runAudit;
