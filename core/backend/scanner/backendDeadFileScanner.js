/*
 * ============================================================
 *   ORIGIN LITE MODE — BACKEND DEAD FILE SCANNER (SAFE)
 *   Detects unused backend files in controllers, routes, etc.
 *   Returns normalized preview-cap structure:
 *
 *   {
 *     preview: [...],
 *     total: number,
 *     proLocked: number
 *   }
 *
 *   Lite Mode: preview cap = 3
 * ============================================================
 */

import fs from "fs-extra";
import path from "path";

/* ------------------------------------------------------------
   Utility: Cap preview list
------------------------------------------------------------ */
function previewCap(list, cap = 3) {
  if (!Array.isArray(list)) return { preview: [], total: 0, proLocked: 0 };

  const total = list.length;
  const preview = list.slice(0, cap);
  const proLocked = Math.max(0, total - cap);

  return { preview, total, proLocked };
}

/* ------------------------------------------------------------
   Utility: Recursively gather all backend files
------------------------------------------------------------ */
function walk(dir, ignore = []) {
  const results = [];

  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    if (ignore.includes(file)) continue;

    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results.push(...walk(full, ignore));
    } else {
      if (
        file.endsWith(".js") ||
        file.endsWith(".ts") ||
        file.endsWith(".mjs")
      ) {
        results.push(full);
      }
    }
  }
  return results;
}

/* ------------------------------------------------------------
   MAIN SCANNER
------------------------------------------------------------ */
export function scanBackendDeadFiles(root) {
  const ignoreDirs = [
    "node_modules",
    ".git",
    "docs",
    "audit_history",
    "ai",
    "bridge_summary.md",
  ];

  const backendDirs = [
    "controllers",
    "routes",
    "services",
    "models",
    "middleware",
    "utils",
  ];

  const allFiles = [];
  for (const dir of backendDirs) {
    const scanPath = path.join(root, dir);
    if (fs.existsSync(scanPath)) {
      allFiles.push(...walk(scanPath, ignoreDirs));
    }
  }

  if (allFiles.length === 0) {
    return { preview: [], total: 0, proLocked: 0 };
  }

  // Lite Mode: "Dead files" = files containing "old" or "backup"
  const dead = allFiles.filter((f) => {
    const name = path.basename(f).toLowerCase();
    return (
      name.includes("old") ||
      name.includes("backup") ||
      name.includes("unused") ||
      name.includes("deprecated")
    );
  });

  return previewCap(dead, 3);
}

export default scanBackendDeadFiles;
