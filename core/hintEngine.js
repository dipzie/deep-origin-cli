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

import path from "path";

export function generateStructureHints(root) {
  const hints = [];

  /* ----------------------------------------------
     1. Deep Folder Nesting Detection (1 hint)
     ---------------------------------------------- */
  function checkNested(dir, depth = 0) {
    if (depth >= 4) return dir; // trigger
    if (!dir || !fs.existsSync(dir)) return null;

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        const res = checkNested(full, depth + 1);
        if (res) return res;
      }
    }
    return null;
  }

  const nested = checkNested(root);
  if (nested) hints.push(`Deep nesting detected → ${nested.replace(root, "")}`);

  /* ----------------------------------------------
     2. Page placed in /src/pages but looks like component
     ---------------------------------------------- */
  const pagesDir = path.join(root, "src/pages");
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir);

    const wrong = pages.find(
      (p) =>
        p.toLowerCase().includes("button") ||
        p.toLowerCase().includes("card") ||
        p.toLowerCase().includes("modal")
    );

    if (wrong)
      hints.push(
        `/src/pages/${wrong} looks like a Component — move to /src/components`
      );
  }

  return hints;
}
