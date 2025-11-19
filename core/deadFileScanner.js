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

import fs from "fs";
import path from "path";
import { pickStablePreview } from "./hashUtils.js";

export function scanDeadFiles(root, { allFiles, project }) {
  // LITE heuristic-based unused file detection
  const unused = allFiles.filter((f) => {
    return (
      f.includes("Old") ||
      f.includes("unused") ||
      f.includes("deprecated") ||
      f.includes("backup")
    );
  });

  return pickStablePreview(unused, 5, project, "DEAD_LITE");
}
