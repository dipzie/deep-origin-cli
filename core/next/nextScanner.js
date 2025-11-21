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

const VALID_PAGE_EXT = [".tsx", ".ts", ".jsx", ".js"];

/* ===================================================================
   Utility: check if path exists
   =================================================================== */
function exists(p) {
  return fs.existsSync(p);
}

/* ===================================================================
   Utility: recursive walk
   =================================================================== */
function walk(dir, cb) {
  if (!exists(dir)) return;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      cb(full);
      walk(full, cb);
    }
  }
}

/* ===================================================================
   Utility: get files in folder
   =================================================================== */
function listFiles(dir) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .map((f) => path.join(dir, f))
    .filter((f) => exists(f) && fs.statSync(f).isFile());
}

/* ===================================================================
   1. Detect App Router
   =================================================================== */
function detectAppRouter(root) {
  const appDir = path.join(root, "app");
  if (!exists(appDir)) return false;

  // requires page.tsx or layout.tsx
  const hasLayout = VALID_PAGE_EXT.some((ext) =>
    exists(path.join(appDir, "layout" + ext))
  );
  const hasPage = VALID_PAGE_EXT.some((ext) =>
    exists(path.join(appDir, "page" + ext))
  );

  return hasLayout || hasPage;
}

/* ===================================================================
   2. Detect Pages Router
   =================================================================== */
function detectPagesRouter(root) {
  const pagesDir = path.join(root, "pages");
  if (!exists(pagesDir)) return false;

  const hasIndex = VALID_PAGE_EXT.some((ext) =>
    exists(path.join(pagesDir, "index" + ext))
  );

  return hasIndex;
}

/* ===================================================================
   3. Detect Route Groups ( (auth) / (dashboard) )
   =================================================================== */
function detectRouteGroups(appDir) {
  const groups = [];

  if (!exists(appDir)) return groups;

  for (const item of fs.readdirSync(appDir)) {
    if (item.startsWith("(") && item.endsWith(")")) {
      groups.push(item);
    }
  }

  return groups;
}

/* ===================================================================
   4. Detect Dynamic Routes ([id], [...slug])
   =================================================================== */
function detectDynamicRoutes(appDir) {
  const dynamic = [];

  if (!exists(appDir)) return dynamic;

  walk(appDir, (folder) => {
    const base = path.basename(folder);
    if (
      base.startsWith("[") &&
      base.endsWith("]") // covers [id], [...slug], [[...id]]
    ) {
      dynamic.push(folder.replace(appDir, ""));
    }
  });

  return dynamic;
}

/* ===================================================================
   5. Detect Layouts across tree
   =================================================================== */
function detectLayouts(appDir) {
  const layouts = [];

  if (!exists(appDir)) return layouts;

  walk(appDir, (folder) => {
    for (const ext of VALID_PAGE_EXT) {
      const f = path.join(folder, "layout" + ext);
      if (exists(f)) {
        layouts.push(f.replace(appDir, ""));
      }
    }
  });

  return layouts;
}

/* ===================================================================
   6. Detect API Routes (App Router style)
   =================================================================== */
function detectApiRoutes(appDir) {
  const apiRoutes = [];

  if (!exists(appDir)) return apiRoutes;

  const apiRoot = path.join(appDir, "api");
  if (!exists(apiRoot)) return apiRoutes;

  walk(apiRoot, (folder) => {
    const routeFile = VALID_PAGE_EXT.map((ext) =>
      path.join(folder, "route" + ext)
    ).find((f) => exists(f));

    if (routeFile) {
      apiRoutes.push(routeFile.replace(appDir, ""));
    }
  });

  return apiRoutes;
}

/* ===================================================================
   7. Detect Next.js Middlewares
   =================================================================== */
function detectMiddleware(root) {
  for (const ext of VALID_PAGE_EXT) {
    const f = path.join(root, "middleware" + ext);
    if (exists(f)) return f.replace(root, "");
  }
  return null;
}

/* ===================================================================
   8. Detect Pages Router pages
   =================================================================== */
function detectPagesRouterPages(pagesDir) {
  const pages = [];

  if (!exists(pagesDir)) return pages;

  walk(pagesDir, (folder) => {
    for (const ext of VALID_PAGE_EXT) {
      const pageCandidate = path.join(folder, "index" + ext);
      if (exists(pageCandidate)) {
        pages.push(pageCandidate.replace(pagesDir, ""));
      }
    }
    // also collect *.tsx at root pages
    for (const file of listFiles(folder)) {
      const base = path.basename(file);
      if (VALID_PAGE_EXT.includes(path.extname(base))) {
        pages.push(file.replace(pagesDir, ""));
      }
    }
  });

  return [...new Set(pages)];
}

/* ===================================================================
   MAIN EXPORT — Full Next.js scan
   =================================================================== */

export function scanNextJS(root) {
  const appDir = path.join(root, "app");
  const pagesDir = path.join(root, "pages");

  const isAppRouter = detectAppRouter(root);
  const isPagesRouter = detectPagesRouter(root);

  /* Gather all Next.js data */
  const routeGroups = detectRouteGroups(appDir);
  const dynamicRoutes = detectDynamicRoutes(appDir);
  const layouts = detectLayouts(appDir);
  const apiRoutes = detectApiRoutes(appDir);
  const middleware = detectMiddleware(root);
  const pagesRouterPages = detectPagesRouterPages(pagesDir);

  return {
    detected: isAppRouter || isPagesRouter,
    isAppRouter,
    isPagesRouter,
    groups: routeGroups,
    dynamic: dynamicRoutes,
    layouts,
    api: apiRoutes,
    middleware,
    pagesRouterPages,
  };
}
