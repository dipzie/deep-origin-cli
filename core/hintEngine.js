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

/*
 * STRUCTURE HINT ENGINE — Lite Mode
 * Shows EXACT 1 helpful hint per category (Lite)
 */

import fs from "fs-extra";
import path from "path";

const USER_DIRS = ["src", "public", "app", "components", "features"];

export function generateStructureHints(root) {
  const hints = [];

  /* ----------------------------------------------
     1. Deep Folder Nesting (Lite → 1 hint only)
     ---------------------------------------------- */
  function scanUserFolders() {
    for (const dirName of USER_DIRS) {
      const dir = path.join(root, dirName);
      if (!fs.existsSync(dir)) continue;

      const nested = checkNested(dir, 0);
      if (nested) return nested.replace(root, "");
    }
    return null;
  }

  function checkNested(dir, depth) {
    if (depth >= 4) return dir;
    if (!fs.existsSync(dir)) return null;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        const bad = checkNested(full, depth + 1);
        if (bad) return bad;
      }
    }
    return null;
  }

  const nested = scanUserFolders();
  if (nested) {
    hints.push(`Deep nesting detected → ${nested}`);
  }

  /* ----------------------------------------------
     2. Component Misplaced Inside /src/pages
     ---------------------------------------------- */
  const pagesDir = path.join(root, "src/pages");
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir);

    const suspiciousWords = [
      "button",
      "card",
      "modal",
      "badge",
      "avatar",
      "dropdown",
      "loader",
    ];

    const wrong = pages.find((page) => {
      const lower = page.toLowerCase();
      return suspiciousWords.some((w) => lower.includes(w));
    });

    if (wrong) {
      hints.push(
        `/src/pages/${wrong} looks like a Component — move to /src/components (Lite)`
      );
    }
  }

  return hints;
}
