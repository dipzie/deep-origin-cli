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

import path from "path";
import { pickStablePreview } from "./hashUtils.js";

export function scanDuplicates(root, { components = [], project }) {
  if (!Array.isArray(components)) components = [];

  const map = new Map();

  for (const comp of components) {
    const base = path.basename(comp).toLowerCase();
    if (!map.has(base)) map.set(base, []);
    map.get(base).push(comp);
  }

  const duplicates = [];

  for (const [name, files] of map) {
    if (files.length > 1) {
      duplicates.push(`Possible duplicate: ${files[0]}`);
    }
  }

  return {
    preview: pickStablePreview(duplicates, 3, project, "DUP"),
    total: duplicates.length,
  };
}
