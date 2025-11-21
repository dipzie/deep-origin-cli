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
  const results = [];

  const pagesDir = path.join(root, "src", "pages");
  const srcDir = path.join(root, "src");

  function isPageFile(file) {
    return EXT.includes(path.extname(file));
  }

  // Scan /src/pages recursively
  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (isPageFile(item)) {
        const rel = full.replace(root, "").replace(/\\/g, "/");
        results.push(rel);
      }
    }
  }

  walk(pagesDir);

  // Balanced: detect page-like files outside /pages
  // Example: DashboardPage.tsx, LoginPage.tsx
  function detectExtraPages(dir) {
    if (!fs.existsSync(dir)) return [];

    const items = fs.readdirSync(dir);
    const extra = [];

    const pagePattern = /(Page|page)\.(tsx|jsx|ts|js)$/;

    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) continue; // avoid folders
      if (pagePattern.test(item)) {
        extra.push(full.replace(root, "").replace(/\\/g, "/"));
      }
    }

    return extra;
  }
  const extraPages = detectExtraPages(srcDir);

  return [...new Set([...results, ...extraPages])];
}
