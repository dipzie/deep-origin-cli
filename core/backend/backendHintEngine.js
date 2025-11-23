/*
 * ============================================================
 *   ORIGIN LITE MODE — BACKEND HINT ENGINE (SAFE VERSION)
 *   Generates structural hints based on backend folder state.
 *
 *   Output shape:
 *     {
 *        preview: [ ... up to 4 ],
 *        total: number,
 *        proLocked: number
 *     }
 *
 *   Lite Mode — No AST, No dynamic imports, No heavy analysis.
 * ============================================================
 */

import fs from "fs-extra";
import path from "path";

function capPreview(list, cap = 4) {
  if (!Array.isArray(list)) return { preview: [], total: 0, proLocked: 0 };

  return {
    preview: list.slice(0, cap),
    total: list.length,
    proLocked: Math.max(list.length - cap, 0),
  };
}

export function scanBackendHints(root, backend) {
  const hints = [];

  const { routes, controllers, services, models } = backend;

  /* ------------------------------------------------------------
     1. Missing essential backend parts
  ------------------------------------------------------------ */
  if (routes.total === 0) hints.push("No API routes detected.");
  if (controllers.total === 0)
    hints.push("No controllers found — backend logic may be incomplete.");
  if (models.total === 0)
    hints.push("No models detected — no persistence layer found.");

  /* ------------------------------------------------------------
     2. Controller exists but no matching route file uses it
  ------------------------------------------------------------ */
  if (controllers.preview.length > 0 && routes.total === 0) {
    hints.push("Controllers exist but no route handlers are mapped.");
  }

  /* ------------------------------------------------------------
     3. Model files exist but no service uses them
     (Lite approximation: if models > services, warn)
  ------------------------------------------------------------ */
  if (models.total > 0 && services.total === 0) {
    hints.push(
      "Models detected but no services using them — consider adding a service layer."
    );
  }

  /* ------------------------------------------------------------
     4. Empty backend folders
  ------------------------------------------------------------ */
  const backendDirs = [
    "routes",
    "controllers",
    "services",
    "models",
    "middleware",
    "utils",
  ];
  backendDirs.forEach((dir) => {
    const p = path.join(root, dir);
    if (fs.existsSync(p)) {
      const items = fs.readdirSync(p).filter((f) => !f.startsWith("."));
      if (items.length === 0) {
        hints.push(
          `Folder "${dir}" is empty — consider removing or populating it.`
        );
      }
    }
  });

  /* ------------------------------------------------------------
     5. Missing .env file
  ------------------------------------------------------------ */
  if (!fs.existsSync(path.join(root, ".env"))) {
    hints.push("Missing .env file — recommended for environment security.");
  }

  /* ------------------------------------------------------------
     6. Deprecated patterns (Lite)
  ------------------------------------------------------------ */
  const checkDeprecated = ["old", "deprecated", "backup"];
  backendDirs.forEach((dir) => {
    const p = path.join(root, dir);
    if (!fs.existsSync(p)) return;

    for (const f of fs.readdirSync(p)) {
      const lower = f.toLowerCase();
      if (checkDeprecated.some((x) => lower.includes(x))) {
        hints.push(`Deprecated/old file detected → ${dir}/${f}`);
      }
    }
  });

  /* ------------------------------------------------------------
     Return normalized hint block
  ------------------------------------------------------------ */
  return capPreview(hints, 4);
}

export default scanBackendHints;
