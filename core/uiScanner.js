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

export function detectUISystem(root) {
  const results = [];

  /* ------------------------------------------------------------------
     Helper: scan deps from package.json
  ------------------------------------------------------------------ */
  let pkg = {};
  try {
    pkg = fs.readJsonSync(path.join(root, "package.json"));
  } catch {
    pkg = {};
  }

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const has = (name) => {
    return deps && deps[name];
  };

  /* ------------------------------------------------------------------
     1. TailwindCSS
  ------------------------------------------------------------------ */
  if (has("tailwindcss")) results.push("TailwindCSS");
  if (fs.existsSync(path.join(root, "tailwind.config.js")))
    results.push("TailwindCSS");
  if (fs.existsSync(path.join(root, "tailwind.config.cjs")))
    results.push("TailwindCSS");

  /* ------------------------------------------------------------------
     2. Shadcn UI
  ------------------------------------------------------------------ */
  if (
    has("class-variance-authority") ||
    fs.existsSync(path.join(root, "components.json"))
  ) {
    results.push("Shadcn UI");
  }

  /* ------------------------------------------------------------------
     3. Radix UI
  ------------------------------------------------------------------ */
  if (has("@radix-ui/react-dropdown-menu")) results.push("Radix UI");
  if (has("@radix-ui/react-dialog")) results.push("Radix UI");
  if (has("@radix-ui/react-hover-card")) results.push("Radix UI");

  /* ------------------------------------------------------------------
     4. Material UI
  ------------------------------------------------------------------ */
  if (has("@mui/material") || has("@material-ui/core"))
    results.push("Material UI");

  /* ------------------------------------------------------------------
     5. Bootstrap
  ------------------------------------------------------------------ */
  if (has("bootstrap")) results.push("Bootstrap");

  /* ------------------------------------------------------------------
     6. Ant Design
  ------------------------------------------------------------------ */
  if (has("antd")) results.push("Ant Design");

  /* ------------------------------------------------------------------
     7. Chakra UI
  ------------------------------------------------------------------ */
  if (has("@chakra-ui/react")) results.push("Chakra UI");

  /* ------------------------------------------------------------------
     8. Styled Components
  ------------------------------------------------------------------ */
  if (has("styled-components")) results.push("Styled Components");

  /* ------------------------------------------------------------------
     9. Emotion
  ------------------------------------------------------------------ */
  if (has("@emotion/react") || has("@emotion/styled")) results.push("Emotion");

  /* ------------------------------------------------------------------
     10. Vanilla Extract
  ------------------------------------------------------------------ */
  if (has("@vanilla-extract/css")) results.push("Vanilla Extract");

  /* ------------------------------------------------------------------
     11. DaisyUI
  ------------------------------------------------------------------ */
  if (has("daisyui")) results.push("DaisyUI");

  /* ------------------------------------------------------------------
     12. Flowbite
  ------------------------------------------------------------------ */
  if (has("flowbite") || has("flowbite-react")) results.push("Flowbite");

  /* ------------------------------------------------------------------
     Final (unique + sorted)
  ------------------------------------------------------------------ */
  return [...new Set(results)];
}
