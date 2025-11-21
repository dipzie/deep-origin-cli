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

// Files that are NOT components
const EXCLUDE = [
  "page.tsx",
  "page.jsx",
  "layout.tsx",
  "layout.jsx",
  "_app.tsx",
  "_app.jsx",
];

// Directories commonly containing components
const COMPONENT_DIRS = [
  "components",
  "src/components",
  "app/components",
  "app/(site)/components",
  "app/(dashboard)/components",
  "app/ui",
  "components/ui",
  "src/ui",
];

/**
 * ComponentScanner v7 — Next.js Optimized
 * ----------------------------------------
 * Detects components through:
 *  - known folders
 *  - PascalCase file names
 *  - nested “components” folders in App Router
 *  - UI folders (*ui, *components)
 *  - co-located components
 */
export function scanComponents(root) {
  const results = new Set();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
        continue;
      }

      const ext = path.extname(name);
      if (!EXT.includes(ext)) continue;

      const base = path.basename(name);

      // ignore route handlers
      if (EXCLUDE.includes(base)) continue;

      // Detect PascalCase
      const isPascal = /^[A-Z][A-Za-z0-9]*(\.|$)/.test(base);

      // Detect if in a component folder
      const isInComponentFolder =
        full.includes("/components/") ||
        full.includes("\\components\\") ||
        full.includes("/ui/") ||
        full.includes("\\ui\\");

      // Only accept valid component signals
      if (isPascal || isInComponentFolder) {
        results.add(full.replace(root, "").replace(/\\/g, "/"));
      }
    }
  }

  /* ----------------------------------------
     1. Walk base component directories first
  ----------------------------------------- */
  for (const dirName of COMPONENT_DIRS) {
    const dir = path.join(root, dirName);
    if (fs.existsSync(dir)) walk(dir);
  }

  /* ----------------------------------------------------
     2. Full scan under /app to catch colocated components
  ------------------------------------------------------ */
  const appDir = path.join(root, "app");
  if (fs.existsSync(appDir)) walk(appDir);

  /* ----------------------------------------------------
     3. Full scan under /src for CRA/Vite co-located comps
  ------------------------------------------------------ */
  const srcDir = path.join(root, "src");
  if (fs.existsSync(srcDir)) walk(srcDir);

  if (results.size === 0) {
    return [
      "(No components found — add files in /components or /src/components)",
    ];
  }

  return [...results];
}
