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
 * Origin Lite — Feature Scanner (SAFE)
 * Always returns an ARRAY of feature folder names.
 */

import fs from "fs-extra";
import path from "path";

export function scanFeatures(root) {
  const base = path.join(root, "src", "features");
  if (!fs.existsSync(base)) return [];

  const featureDirs = fs.readdirSync(base).filter((item) => {
    const full = path.join(base, item);
    return (
      fs.existsSync(full) &&
      fs.statSync(full).isDirectory() &&
      !["utils", "helpers", "common", "shared"].includes(item)
    );
  });

  const results = [];

  for (const feature of featureDirs) {
    const full = path.join(base, feature);

    // Detect Balanced Feature Structure
    const hasPages = fs.existsSync(path.join(full, "pages"));
    const hasComponents = fs.existsSync(path.join(full, "components"));
    const hasHooks = fs.existsSync(path.join(full, "hooks"));
    const hasServices = fs.existsSync(path.join(full, "services"));
    const hasStore = fs.existsSync(path.join(full, "store"));

    results.push({
      name: feature,
      pages: hasPages,
      components: hasComponents,
      hooks: hasHooks,
      services: hasServices,
      store: hasStore,
    });
  }

  // Return just feature names to Lite Mode
  return results.map((f) => f.name);
}
