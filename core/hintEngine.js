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

export function generateStructureHints(root) {
  const hints = [];

  const deepPaths = [];

  function walk(dir) {
    const items = fs.readdirSync(dir);
    for (const i of items) {
      const full = path.join(dir, i);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);

      const depth = full.replace(root, "").split("/").length;
      if (depth > 6) deepPaths.push(full);
    }
  }

  walk(path.join(root, "src"));

  if (deepPaths.length > 0) {
    hints.push("Deep nesting detected — flattening may improve clarity.");
  }

  return hints;
}
