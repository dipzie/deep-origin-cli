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

export function detectFramework(root) {
  const pkgPath = path.join(root, "package.json");
  if (!fs.existsSync(pkgPath)) return "Unknown";

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};

  // ----------------------------
  //  NEXT.JS (App or Pages Router)
  // ----------------------------
  if (deps["next"]) {
    const appDir = path.join(root, "app");
    const pagesDir = path.join(root, "pages");

    if (fs.existsSync(appDir)) {
      return "Next.js (App Router)";
    }
    if (fs.existsSync(pagesDir)) {
      return "Next.js (Pages Router)";
    }
    return "Next.js";
  }

  // ----------------------------
  //  REACT (Create React App)
  // ----------------------------
  if (deps["react"] && deps["react-dom"] && deps["react-scripts"]) {
    const publicIndex = path.join(root, "public", "index.html");
    const srcIndex = path.join(root, "src", "index.js");

    if (fs.existsSync(publicIndex) || fs.existsSync(srcIndex)) {
      return "React (CRA)";
    }
  }

  // ----------------------------
  //  REACT (Vite)
  // ----------------------------
  const viteConfig = path.join(root, "vite.config.js");
  const viteTSConfig = path.join(root, "vite.config.ts");

  if (fs.existsSync(viteConfig) || fs.existsSync(viteTSConfig)) {
    if (deps["react"] || deps["@vitejs/plugin-react"]) {
      return "React (Vite)";
    }
  }

  // ----------------------------
  //  VUE (Vite)
  // ----------------------------
  if (
    (deps["vue"] || devDeps["@vitejs/plugin-vue"]) &&
    (fs.existsSync(viteConfig) || fs.existsSync(viteTSConfig))
  ) {
    return "Vue 3 (Vite)";
  }

  // ----------------------------
  //  SVELTEKIT
  // ----------------------------
  if (
    deps["@sveltejs/kit"] ||
    fs.existsSync(path.join(root, "svelte.config.js"))
  ) {
    return "SvelteKit";
  }

  // ----------------------------
  //  FALLBACK REACT
  // ----------------------------
  if (deps["react"] && deps["react-dom"]) {
    return "React";
  }

  return "Unknown";
}
