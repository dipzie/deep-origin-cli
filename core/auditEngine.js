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

export async function runAudit(projectDir) {
  const docsDir = path.join(projectDir, "docs", "audit_history");
  await fs.ensureDir(docsDir);

  const allFiles = listFilesRecursively(projectDir);
  const routes = scanRoutes(projectDir);
  const schemas = scanSchemas(projectDir);
  const envKeys = Array.isArray(scanEnv(projectDir)) ? scanEnv(projectDir) : [];
  const framework = detectFramework(projectDir);

  const audit = {
    id: nanoid(6),
    project: path.basename(projectDir),
    timestamp: new Date().toISOString(),
    generatedAt: niceDate(),
    summary: {
      totalFiles: allFiles.length,
      routeCount: routes.length,
      schemaCount: schemas.length,
      envCount: envKeys.reduce((sum, f) => sum + (f.keys?.length || 0), 0),
      framework,
    },
    routes,
    schemas,
    env: envKeys,
    files: allFiles.map((f) => f.replace(projectDir, "")),
  };

  await fs.writeJson(path.join(docsDir, `audit_${audit.id}.json`), audit, {
    spaces: 2,
  });

  console.log(`\n💾 Saved audit → docs/audit_history/audit_${audit.id}.json`);
  await generateSummaryV3(projectDir);

  logActivity("audit-run");
  exportAIHook({
    timestamp: new Date().toISOString(),
    auditId: audit.id,
    fileCount: allFiles.length,
  });

  return audit;
}
