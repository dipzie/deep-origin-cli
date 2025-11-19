/*//core/relationshipScanner.js
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
/*
 * ─────────────────────────────────────────────────────────────
 *                       ORIGIN LITE MODE
 *                       INTERNAL MODULE
 * ─────────────────────────────────────────────────────────────
 */

import fs from "fs-extra";
import path from "path";
import { pickStablePreview } from "./hashUtils.js";

const IMPORT_REGEX = /import\s+.*?from\s+['"](.*)['"]/g;

export function scanComponentRelationships(root, { components = [], project }) {
  // Prevent crash if invalid input
  if (!Array.isArray(components)) components = [];

  const results = [];

  for (const comp of components) {
    const absPath = path.join(root, comp);

    if (!fs.existsSync(absPath)) continue;

    const content = fs.readFileSync(absPath, "utf8");

    let match;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];

      if (importPath.startsWith("./") || importPath.startsWith("../")) {
        const resolved = path
          .resolve(path.dirname(absPath), importPath)
          .replace(root, "");

        results.push({
          from: comp,
          to: resolved,
        });
      }
    }
  }

  const relAsStrings = results.map((r) => `${r.from} → ${r.to}`);

  const preview = pickStablePreview(relAsStrings, 3, project, "REL_LITE");

  return {
    preview,
    total: results.length,
  };
}
