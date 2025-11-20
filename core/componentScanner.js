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

const VALID_EXT = [".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte"];

export function scanComponents(root) {
  const results = [];

  const componentDirs = ["src/components", "src/Components", "src/component"];

  for (const dirName of componentDirs) {
    const dir = path.join(root, dirName);
    if (!fs.existsSync(dir)) continue;
    walk(dir);
  }

  function walk(current) {
    const items = fs.readdirSync(current);

    for (const item of items) {
      const full = path.join(current, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(full);
        if (VALID_EXT.includes(ext)) {
          results.push(full.replace(root, "").replace(/\\/g, "/"));
        }
      }
    }
  }

  // Always return ARRAY
  return [...new Set(results)];
}
