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

/**
 * Next.js Page Scanner
 * Detects App Router and Pages Router structures:
 *
 *  - /app/page.tsx
 *  - /app/dashboard/page.tsx
 *  - /pages/index.tsx
 *  - /pages/about.tsx
 */
export function scanNextPages(root) {
  const results = [];

  const appRouter = path.join(root, "app");
  const pagesRouter = path.join(root, "pages");

  /* ============================================================
     Scan Next.js App Router (/app)
     ============================================================ */
  if (fs.existsSync(appRouter)) {
    walk(appRouter, (file) => {
      const ext = path.extname(file);
      const base = path.basename(file);

      const isPage =
        base === "page.tsx" ||
        base === "page.jsx" ||
        base === "page.js" ||
        base === "page.ts";

      if (isPage) {
        results.push(file.replace(root, "").replace(/\\/g, "/"));
      }
    });
  }

  /* ============================================================
     Scan Next.js Pages Router (/pages)
     ============================================================ */
  if (fs.existsSync(pagesRouter)) {
    walk(pagesRouter, (file) => {
      const ext = path.extname(file);
      if (!EXT.includes(ext)) return;

      // Must be /pages/*.tsx, but NOT API routes like pages/api/*
      if (file.includes("/pages/api/")) return;

      results.push(file.replace(root, "").replace(/\\/g, "/"));
    });
  }

  if (results.length === 0) {
    return ["(No Next.js pages detected — add files in /app or /pages)"];
  }

  return [...new Set(results)];
}

/* ============================================================
   DIRECTORY WALKER
   ============================================================ */
function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}
