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

const IGNORE = ["node_modules", ".git", "dist", "build", ".next", ".turbo"];

export function scanDeadFiles(root, { project }) {
  const all = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (IGNORE.includes(item)) continue;

      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else all.push(full.replace(root, ""));
    }
  }

  walk(root);

  const dead = all.filter((f) => {
    return (
      f.toLowerCase().includes("old") ||
      f.toLowerCase().includes("unused") ||
      f.toLowerCase().includes("deprecated") ||
      f.toLowerCase().includes("backup")
    );
  });

  const preview = pickStablePreview(dead, 5, project, "DEAD_LITE");

  return {
    preview,
    total: dead.length,
  };
}
