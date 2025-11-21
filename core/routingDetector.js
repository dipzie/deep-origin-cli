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

const VALID_EXT = [".tsx", ".jsx", ".ts", ".js"];

export function scanRouting(root) {
  const results = [];

  /* ============================================================
     1. Next.js App Router
     ============================================================ */
  const appDir = path.join(root, "app");
  if (fs.existsSync(appDir)) {
    walk(appDir, (file) => {
      const base = path.basename(file);
      if (
        base === "page.tsx" ||
        base === "page.jsx" ||
        base === "page.js" ||
        base === "page.ts"
      ) {
        results.push("Next App: " + file.replace(root, "").replace(/\\/g, "/"));
      }
    });
  }

  /* ============================================================
     2. Next.js Pages Router
     ============================================================ */
  const pagesDir = path.join(root, "pages");
  if (fs.existsSync(pagesDir)) {
    walk(pagesDir, (file) => {
      if (file.includes("/pages/api/")) return; // exclude API
      const ext = path.extname(file);
      if (VALID_EXT.includes(ext)) {
        results.push(
          "Next Pages: " + file.replace(root, "").replace(/\\/g, "/")
        );
      }
    });
  }

  /* ============================================================
     3. React Router (react-router-dom)
     ============================================================ */
  const srcDir = path.join(root, "src");
  if (fs.existsSync(srcDir)) {
    walk(srcDir, (file) => {
      const ext = path.extname(file);
      if (!VALID_EXT.includes(ext)) return;

      const content = safeRead(file);
      if (
        content.includes("react-router") ||
        content.includes("react-router-dom")
      ) {
        const match =
          content.match(/path=["'`](.*?)["'`]/) ||
          content.match(/to=["'`](.*?)["'`]/);

        if (match && match[1]) {
          results.push("React Route: " + match[1]);
        }
      }
    });
  }

  /* ============================================================
     4. Basic Vite/CRA heuristic
     ============================================================ */
  const appJS = path.join(srcDir, "App.tsx");
  const appJS2 = path.join(srcDir, "App.jsx");

  [appJS, appJS2].forEach((f) => {
    if (fs.existsSync(f)) {
      const content = safeRead(f);
      if (content.includes("react-router")) {
        results.push("React Router detected in App component");
      }
    }
  });

  /* ============================================================
     Fallback
     ============================================================ */
  if (results.length === 0) {
    return [
      "(No routing detected — add routes in /app, /pages, or React Router)",
    ];
  }

  return [...new Set(results)];
}

/* ============================================================
   File Walker
   ============================================================ */
function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

/* ============================================================
   Safe file read
   ============================================================ */
function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}
