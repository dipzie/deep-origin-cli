// backend/frameworkDetector.js
import fs from "fs";
import path from "path";

/*
 * Detects backend framework based on:
 * - package.json dependencies
 * - folder patterns
 * - file signatures
 *
 * Frameworks covered:
 *  - Express
 *  - Fastify
 *  - NestJS
 *  - Hono
 *  - Koa
 */

export function detectBackendFramework(root) {
  const pkgPath = path.join(root, "package.json");

  let dependencies = {};
  let devDependencies = {};

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      dependencies = pkg.dependencies || {};
      devDependencies = pkg.devDependencies || {};
    } catch (err) {
      // Ignore JSON parsing issues — silently fallback
    }
  }

  const allDeps = {
    ...dependencies,
    ...devDependencies,
  };

  // Utility: Quick dep check
  const has = (dep) => Object.keys(allDeps).includes(dep);

  // -----------------------------
  // 1. DETECT EXPRESS
  // -----------------------------
  if (has("express")) {
    const appJs = findFile(root, ["app.js", "server.js", "index.js"]);
    if (appJs) return "Express";
  }

  // -----------------------------
  // 2. DETECT FASTIFY
  // -----------------------------
  if (has("fastify")) {
    const fastifyFiles = findFile(root, ["fastify.js", "fastify.ts"]);
    return "Fastify";
  }

  // -----------------------------
  // 3. DETECT NESTJS
  // -----------------------------
  if (has("@nestjs/common") || has("@nestjs/core")) {
    const nestFiles = findFile(root, ["main.ts", "app.module.ts"]);
    if (nestFiles) return "NestJS";
  }

  // -----------------------------
  // 4. DETECT HONO
  // -----------------------------
  if (has("hono")) {
    const honoFiles = findFile(root, ["server.ts", "server.js"]);
    return "Hono";
  }

  // -----------------------------
  // 5. DETECT KOA
  // -----------------------------
  if (has("koa")) {
    const koaFiles = findFile(root, ["koa.js", "server.js"]);
    return "Koa";
  }

  // -----------------------------
  // 6. If none match, detect manually
  // -----------------------------
  const controllerFolder = path.join(root, "controllers");
  const routeFolder = path.join(root, "routes");

  if (fs.existsSync(controllerFolder) || fs.existsSync(routeFolder)) {
    return "Node (Custom Backend)";
  }

  return "Unknown Backend";
}

/*
 * Recursively search for any file name match
 */
function findFile(root, filenames) {
  function walk(dir) {
    if (!fs.existsSync(dir)) return null;

    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        const res = walk(full);
        if (res) return res;
      } else {
        if (filenames.includes(item)) return full;
      }
    }
    return null;
  }

  return walk(root);
}
