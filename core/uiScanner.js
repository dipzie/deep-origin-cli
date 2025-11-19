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
  const pkgPath = path.join(root, "package.json");
  if (!fs.existsSync(pkgPath)) return [];
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const detected = [];

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const has = (name) => deps && deps[name];

  // Existing libraries
  if (has("@mui/material")) detected.push("Material UI");
  if (has("antd")) detected.push("Ant Design");
  if (has("@chakra-ui/react")) detected.push("Chakra UI");
  if (has("@mantine/core")) detected.push("Mantine");
  if (has("@radix-ui/react-dropdown-menu")) detected.push("Radix UI");
  if (has("primereact")) detected.push("PrimeReact");
  if (has("@headlessui/react")) detected.push("Headless UI");
  if (has("bootstrap")) detected.push("Bootstrap React");
  if (has("styled-components")) detected.push("Styled Components");
  if (has("@emotion/react")) detected.push("Emotion");
  if (has("@vanilla-extract/css")) detected.push("Vanilla Extract");

  // Tailwind
  if (fs.existsSync(path.join(root, "tailwind.config.js")))
    detected.push("TailwindCSS");

  // Shadcn
  if (fs.existsSync(path.join(root, "src/components/ui")))
    detected.push("Shadcn UI");

  // DaisyUI via tailwind plugin
  const twPath = path.join(root, "tailwind.config.js");
  if (fs.existsSync(twPath)) {
    const tw = fs.readFileSync(twPath, "utf8");
    if (tw.includes("daisyui")) detected.push("DaisyUI");
  }

  // Small additions
  if (has("flowbite")) detected.push("Flowbite");
  if (has("lucide-react")) detected.push("Lucide Icons");
  if (has("@heroicons/react")) detected.push("Heroicons");
  if (has("recharts")) detected.push("Recharts");
  if (has("zustand")) detected.push("Zustand (State)");

  return detected;
}
