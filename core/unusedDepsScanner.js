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

export function scanUnusedDependencies(root, { project }) {
  const pkgPath = path.join(root, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return { preview: [], total: 0 };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const allDeps = Object.keys(pkg.dependencies || {}).concat(
    Object.keys(pkg.devDependencies || {})
  );

  // Files to scan
  const srcDir = path.join(root, "src");
  const used = new Set();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else {
        const content = fs.readFileSync(full, "utf8");
        allDeps.forEach((dep) => {
          if (content.includes(dep)) used.add(dep);
        });
      }
    }
  }

  walk(srcDir);

  const unused = allDeps.filter((d) => !used.has(d));

  const preview = pickStablePreview(unused, 3, project, "UNUSED_DEPS");

  return {
    preview,
    total: unused.length,
  };
}
