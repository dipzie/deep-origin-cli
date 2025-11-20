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

/*
 * Component Relationship Scanner (Lite)
 * Scans import statements inside components.
 */

import fs from "fs-extra";
import path from "path";
import { pickStablePreview } from "./hashUtils.js";

const IMPORT_REGEX = /import\s+.*?from\s+['"](.*)['"]/g;

export function scanComponentRelationships(root, { components = [], project }) {
  if (!Array.isArray(components)) components = [];

  const results = [];

  for (const comp of components) {
    const abs = path.join(root, comp);
    if (!fs.existsSync(abs)) continue;

    const content = fs.readFileSync(abs, "utf8");
    let match;

    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];

      if (importPath.startsWith("./") || importPath.startsWith("../")) {
        const resolved = path
          .resolve(path.dirname(abs), importPath)
          .replace(root, "");

        results.push(`${comp} → ${resolved}`);
      }
    }
  }

  return {
    preview: pickStablePreview(results, 3, project, "REL"),
    total: results.length,
  };
}
