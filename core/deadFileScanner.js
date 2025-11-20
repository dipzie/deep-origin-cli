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
import { pickStablePreview } from "./hashUtils.js";

export function scanDeadFiles(root, { project }) {
  // Scan entire src folder for filename patterns
  const unused = [];
  const SRC = path.join(root, "src");

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        const filename = full.toLowerCase();

        if (
          filename.includes("old") ||
          filename.includes("unused") ||
          filename.includes("deprecated") ||
          filename.includes("backup")
        ) {
          unused.push(full.replace(root, "").replace(/\\/g, "/"));
        }
      }
    }
  }

  walk(SRC);

  const preview = pickStablePreview(unused, 5, project, "DEAD_LITE");

  return {
    preview,
    total: unused.length,
  };
}
