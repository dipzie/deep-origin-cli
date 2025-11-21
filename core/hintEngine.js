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
 *  The full scanning engine is available ONLY in Origin Pro.
 *
 *  © Dipz Origin — Protected Internal Logic
 * ─────────────────────────────────────────────────────────────
 */

import fs from "fs-extra";
import path from "path";

/**
 * generateStructureHints(root)
 *
 * Lite Mode structural scanner.
 * Provides shallow-safe hints and returns:
 *  - hints[] (text for CLI)
 *  - meta: { deepNesting, emptyFolders, mixedExt, totalScore }
 *
 * Meta is used by Module 5 (Experience Quality Engine)
 */

export function generateStructureHints(root) {
  const hints = [];

  // Module 5 scoring metadata
  let meta = {
    deepNesting: 0,
    emptyFolders: 0,
    mixedExt: false,
    totalScore: 0, // higher means worse
  };

  const srcDir = path.join(root, "src");
  const compDir = path.join(root, "components");

  /* ============================================================
     HELPERS
     ============================================================ */
  function walk(dir, cb) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        cb(full);
        walk(full, cb);
      }
    }
  }

  function listFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .map((x) => path.join(dir, x))
      .filter((full) => fs.existsSync(full) && fs.statSync(full).isFile());
  }

  /* ============================================================
     1. Deep nesting detection
     ============================================================ */
  function detectDeepNesting(baseDir) {
    if (!fs.existsSync(baseDir)) return;

    function traverse(dir, depth) {
      if (depth >= 4) return dir;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
          const bad = traverse(full, depth + 1);
          if (bad) return bad;
        }
      }
    }

    const result = traverse(baseDir, 0);
    if (result) {
      meta.deepNesting++;
      meta.totalScore += 5;
      hints.push(`Deep nesting detected → ${result.replace(root, "")}`);
    }
  }

  detectDeepNesting(srcDir);
  detectDeepNesting(compDir);

  /* ============================================================
     2. Missing index.tsx/js in component folders
     ============================================================ */
  if (fs.existsSync(compDir)) {
    for (const folder of fs.readdirSync(compDir)) {
      const full = path.join(compDir, folder);
      if (fs.statSync(full).isDirectory()) {
        const hasIndex =
          fs.existsSync(path.join(full, "index.ts")) ||
          fs.existsSync(path.join(full, "index.tsx")) ||
          fs.existsSync(path.join(full, "index.js")) ||
          fs.existsSync(path.join(full, "index.jsx"));

        if (!hasIndex) {
          hints.push(
            `Missing index file in component folder → /components/${folder}`
          );
          meta.totalScore += 2;
        }
      }
    }
  }

  /* ============================================================
     3. JS + TS mixture detection
     ============================================================ */
  let hasJS = false,
    hasTS = false;

  function scanForExt(dir) {
    if (!fs.existsSync(dir)) return;

    walk(dir, (folder) => {
      for (const file of listFiles(folder)) {
        if (file.endsWith(".js") || file.endsWith(".jsx")) hasJS = true;
        if (file.endsWith(".ts") || file.endsWith(".tsx")) hasTS = true;
      }
    });
  }

  scanForExt(srcDir);
  scanForExt(compDir);

  if (hasJS && hasTS) {
    hints.push(
      "Mixed JS and TS detected — consider standardizing for maintainability"
    );
    meta.mixedExt = true;
    meta.totalScore += 3;
  }

  /* ============================================================
     4. Empty folders
     ============================================================ */
  function detectEmptyFolders(dir) {
    if (!fs.existsSync(dir)) return;

    walk(dir, (folder) => {
      const inside = fs.readdirSync(folder);
      if (inside.length === 0) {
        hints.push(`Empty folder detected → ${folder.replace(root, "")}`);
        meta.emptyFolders++;
        meta.totalScore += 1;
      }
    });
  }

  detectEmptyFolders(srcDir);
  detectEmptyFolders(compDir);

  /* ============================================================
     5. Detect duplicate-like files
     ============================================================ */
  walk(srcDir, (folder) => {
    for (const file of listFiles(folder)) {
      if (file.toLowerCase().includes("copy")) {
        hints.push(
          `Duplicate-like file "${path.basename(
            file
          )}" found — consider refactoring`
        );
        meta.totalScore += 1;
      }
    }
  });

  /* ============================================================
     6. Asset files placed incorrectly
     ============================================================ */
  const allowedAssetDirs = ["assets", "public"];

  walk(srcDir, (folder) => {
    for (const file of listFiles(folder)) {
      if (file.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
        if (!allowedAssetDirs.some((a) => folder.includes(a))) {
          hints.push(`Asset found outside /assets → ${file.replace(root, "")}`);
          meta.totalScore += 1;
        }
      }
    }
  });

  /* ============================================================
     7. Empty component files
     ============================================================ */
  if (fs.existsSync(compDir)) {
    walk(compDir, (folder) => {
      for (const file of listFiles(folder)) {
        if ([".ts", ".tsx", ".js", ".jsx"].includes(path.extname(file))) {
          const size = fs.statSync(file).size;
          if (size < 10) {
            hints.push(
              `Empty component file → ${file.replace(
                root,
                ""
              )} (remove or implement)`
            );
            meta.totalScore += 2;
          }
        }
      }
    });
  }

  return { hints, meta };
}
