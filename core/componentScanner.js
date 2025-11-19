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

const EXT = [".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte"];

export function scanComponents(root) {
  const results = [];
  const dirs = ["src/components", "src/Components", "src/component"];

  dirs.forEach((dirName) => {
    const dir = path.join(root, dirName);
    if (!fs.existsSync(dir)) return;

    walk(dir);
  });

  function walk(d) {
    const items = fs.readdirSync(d);
    for (const item of items) {
      const full = path.join(d, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else {
        const ext = path.extname(full);
        if (EXT.includes(ext)) {
          const name = full.replace(root, "").replace(/\\/g, "/");
          results.push(name);
        }
      }
    }
  }

  return [...new Set(results)];
}
