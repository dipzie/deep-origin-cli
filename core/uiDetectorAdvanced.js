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
 * detectAdvancedUI()
 * Lite-safe detector for:
 *  - Material UI
 *  - Chakra UI
 *  - Ant Design
 *  - Shadcn/UI
 *  - DaisyUI
 *  - Radix UI (Lite-safe)
 *
 * Returns: ["Material UI", "Shadcn", ...]
 */
export function detectAdvancedUI(root) {
  const result = [];

  const pkgPath = path.join(root, "package.json");
  if (!fs.existsSync(pkgPath)) return result;

  const pkg = fs.readJsonSync(pkgPath);

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  // Material UI
  if (deps["@mui/material"] || deps["@mui/system"]) {
    result.push("Material UI");
  }

  // Chakra
  if (deps["@chakra-ui/react"]) {
    result.push("Chakra UI");
  }

  // Ant Design
  if (deps["antd"]) {
    result.push("Ant Design");
  }

  // Shadcn (detected via imports)
  if (fs.existsSync(path.join(root, "components", "ui"))) {
    result.push("Shadcn/UI");
  }

  // DaisyUI (tailwind plugin)
  if (deps["daisyui"]) {
    result.push("DaisyUI");
  }

  // Radix UI
  if (Object.keys(deps).some((d) => d.startsWith("@radix-ui/"))) {
    result.push("Radix UI");
  }

  return result;
}
