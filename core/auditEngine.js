// core/auditEngine.js
import fs from "fs-extra";
import path from "path";
import { nanoid } from "nanoid";

import { scanRoutes } from "./routeScanner.js";
import { scanSchemas } from "./schemaScanner.js";
import { scanEnv } from "./envScanner.js";
import { detectFramework } from "./frameworkDetector.js";

import { reflectionLinker } from "./reflectionLinker.js";
import { generateSummaryV3 } from "./summaryGenerator.js";

import { listFilesRecursively, niceDate } from "./utils.js";
import { logActivity } from "./activityLogger.js";
import { exportAIHook } from "./aiLearningHook.js";

/**
 * ======================================================================
 * ORIGIN — Audit Engine (Free Tier, Lite Mode v1.1)
 * ======================================================================
 *
 * This module represents the entry point for Origin's local introspection
 * pipeline. It orchestrates:
 *
 *   - filesystem enumeration
 *   - route scanning (Free Tier shallow evaluator)
 *   - schema scanning (string-level heuristic, not AST)
 *   - environment key extraction
 *   - structural materialization for audit history
 *
 * Architectural Intent:
 *   - The audit engine is intentionally constrained to a passive,
 *     read-only evaluation model.
 *   - It must NOT execute deep graph extraction (reserved for Pro Tier).
 *   - It must NOT mutate project files or produce side-effects.
 *   - Output must remain stable across runs for deterministic behavior.
 *
 * Security & Product Reasoning:
 *   - Free Tier operates purely offline.
 *   - All outputs remain local within /docs.
 *   - No sensitive logic from Pro Tier is exposed here.
 *
 * ======================================================================
 */

export async function runAudit(projectDir) {
  // --------------------------------------------------------------------
  // 1. HISTORY DIRECTORY INITIALIZATION
  // --------------------------------------------------------------------
  const docsDir = path.join(projectDir, "docs", "audit_history");
  await fs.ensureDir(docsDir);

  // --------------------------------------------------------------------
  // 2. RAW STRUCTURAL ACQUISITION
  // --------------------------------------------------------------------
  // These calls intentionally use shallow scanners to enforce
  // Free Tier isolation and avoid leaking deeper Pro-tier logic.
  const allFiles = listFilesRecursively(projectDir);
  const routes = scanRoutes(projectDir);
  const schemas = scanSchemas(projectDir);

  // Env must remain heuristic; no parsing of secrets or values.
  const envKeysRaw = scanEnv(projectDir);
  const envKeys = Array.isArray(envKeysRaw) ? envKeysRaw : [];

  const framework = detectFramework(projectDir);

  // --------------------------------------------------------------------
  // 3. MATERIALIZE AUDIT ARTIFACT
  // --------------------------------------------------------------------
  const audit = {
    id: nanoid(6),
    project: path.basename(projectDir),

    timestamp: new Date().toISOString(),
    generatedAt: niceDate(),

    summary: {
      totalFiles: allFiles.length,
      routeCount: routes.length,
      schemaCount: schemas.length,

      // safe: count only name-level env keys, not values
      envCount: envKeys.reduce(
        (sum, file) => sum + (file.keys?.length || 0),
        0
      ),

      framework,
    },

    // Shallow representations only — Free Tier must NOT reveal
    // dependency graphs or resolution heuristics.
    routes,
    schemas,
    env: envKeys,

    // Standardized form: project-relative paths only
    files: allFiles.map((f) => f.replace(projectDir, "")),
  };

  // --------------------------------------------------------------------
  // 4. PERSIST AUDIT
  // --------------------------------------------------------------------
  await fs.writeJson(path.join(docsDir, `audit_${audit.id}.json`), audit, {
    spaces: 2,
  });

  console.log(`\n💾 Saved audit → docs/audit_history/audit_${audit.id}.json`);

  // --------------------------------------------------------------------
  // 5. PRESENTATION LAYER (Lite Mode Summary)
  // --------------------------------------------------------------------
  // Delegates to summaryGenerator which now implements Lite Mode v1.1.
  await generateSummaryV3(projectDir);

  // --------------------------------------------------------------------
  // 6. INTERNAL LIFELOG / ACTIVITY LOGGING
  // --------------------------------------------------------------------
  logActivity("audit-run");

  // --------------------------------------------------------------------
  // 7. LEARNING HOOK (Free Tier safe mode)
  // --------------------------------------------------------------------
  // Provides anonymized metadata for future local AI insights.
  exportAIHook({
    timestamp: new Date().toISOString(),
    auditId: audit.id,
    fileCount: allFiles.length,
  });

  return audit;
}
