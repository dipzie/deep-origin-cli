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

const EXT = [".tsx", ".jsx", ".ts", ".js"];

export function scanPages(root) {
  const pagesDir = path.join(root, "src", "pages");
  const results = [];

  if (!fs.existsSync(pagesDir)) return results;

  const items = fs.readdirSync(pagesDir);
  for (const item of items) {
    const full = path.join(pagesDir, item);
    const stat = fs.statSync(full);

    if (!stat.isFile()) continue;

    const ext = path.extname(item);
    if (EXT.includes(ext)) {
      results.push("/src/pages/" + item);
    }
  }

  return results;
}
