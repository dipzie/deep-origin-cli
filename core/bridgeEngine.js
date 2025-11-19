//core/bridgeEngine.js
import fs from "fs-extra";
import path from "path";

/**
 * ======================================================================
 * ORIGIN — AI Bridge Engine (Free Tier, Lite Mode v1.1)
 * ======================================================================
 *
 * This module is responsible for generating a stable, minimalistic
 * "bridge.json" artifact used by the Presentation Layer. The intention is
 * to provide a reduced, non-sensitive structural snapshot of the project,
 * suitable for Free Tier users without exposing internal heuristics.
 *
 * INTERNAL ARCHITECTURE NOTES (IMPORTANT):
 * ----------------------------------------------------------------------
 * - This engine MUST remain read-only — do not mutate project files.
 * - This module intentionally implements a shallow structural map.
 * - All advanced graph extraction, dependency resolution, route topology
 *   evaluation, feature boundary analysis, etc. belong to the Pro Tier
 *   backend system and MUST NOT leak into Free Tier.
 * - Keep output predictable and deterministic for downstream consumers.
 *
 * Lite Mode purpose:
 *   - Provide minimal intelligence.
 *   - Support tiny projects with fallback heuristics.
 *   - Inform summaryGenerator without revealing deeper logic.
 *
 * ======================================================================
 */

export async function generateBridge(projectDir) {
  const aiDir = path.join(projectDir, "docs", "ai");
  await fs.ensureDir(aiDir);

  // Collect structural metadata
  const structure = collectStructure(projectDir);

  // Construct a minimal bridge artifact
  const bridge = {
    id: generateId(),
    project: path.basename(projectDir),
    timestamp: new Date().toISOString(),

    // minimal metadata for lite mode
    summary: {
      totalFiles: structure.files.length,
      totalFolders: structure.folders.length,
      hasComponents: structure.components.length > 0,
      hasPages: structure.pages.length > 0,
      hasFeatures: structure.features.length > 0,
    },

    // intentionally shallow — Free Tier MUST NOT reveal deep relations
    structure: {
      files: structure.files,
      folders: structure.folders,
      components: structure.components,
      pages: structure.pages,
      features: structure.features,
    },

    // reserved for future Free Tier expansions (safe to ignore)
    meta: {
      bundler: detectBundler(projectDir),
      framework: detectFramework(projectDir),
      liteMode: true,
    },
  };

  await fs.writeFile(
    path.join(aiDir, "bridge.json"),
    JSON.stringify(bridge, null, 2)
  );

  return bridge;
}

/**
 * ======================================================================
 * STRUCTURE COLLECTION (Lite Mode)
 * ----------------------------------------------------------------------
 * Shallow project walker. This intentionally avoids:
 *    - dependency graph parsing
 *    - AST analysis
 *    - semantic inference
 *
 * The purpose is to capture ONLY surface topology, which is safe for
 * public distribution and suitable for tiny projects.
 * ======================================================================
 */
function collectStructure(projectDir) {
  const srcDir = path.join(projectDir, "src");

  const files = [];
  const folders = [];
  const components = [];
  const pages = [];
  const features = [];

  if (!fs.existsSync(srcDir)) {
    return { files, folders, components, pages, features };
  }

  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = full.replace(projectDir + "/", "");
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        folders.push(rel);

        if (rel.includes("components")) {
          components.push(rel);
        }
        if (rel.includes("pages")) {
          pages.push(rel);
        }
        if (rel.includes("features")) {
          features.push(rel);
        }

        walk(full);
      } else {
        files.push(rel);

        // surface-level component detection (safe)
        if (name.endsWith(".jsx") || name.endsWith(".tsx")) {
          if (rel.includes("/components/")) components.push(rel);
          if (rel.includes("/pages/")) pages.push(rel);
          if (rel.includes("/features/")) features.push(rel);
        }
      }
    }
  };

  walk(srcDir);

  return { files, folders, components, pages, features };
}

/**
 * ======================================================================
 * FRAMEWORK DETECTION (Lite Mode Heuristic)
 * ----------------------------------------------------------------------
 * This intentionally uses simplistic pattern checking to avoid leaking
 * Pro-tier framework fingerprinting logic.
 * ======================================================================
 */
function detectFramework(projectDir) {
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return "Unknown";

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps?.react) return "React";
    if (deps?.next) return "Next.js";
    if (deps?.vue) return "Vue";
    if (deps?.svelte) return "Svelte";

    return "JavaScript";
  } catch {
    return "Unknown";
  }
}

/**
 * ======================================================================
 * BUNDLER DETECTION (Lite Mode)
 * ======================================================================
 */
function detectBundler(projectDir) {
  if (fs.existsSync(path.join(projectDir, "vite.config.js"))) return "Vite";
  if (fs.existsSync(path.join(projectDir, "webpack.config.js")))
    return "Webpack";
  if (fs.existsSync(path.join(projectDir, "rollup.config.js"))) return "Rollup";
  return "Unknown";
}

/**
 * ======================================================================
 * UTILITY — Random ID generator
 * (Used to uniquely tag bridge artifacts)
 * ======================================================================
 */
function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * ======================================================================
 * BACKWARD COMPATIBILITY WRAPPER
 * (Used by auditEngine.js)
 * ======================================================================
 */
export async function generateBridgeV3(projectDir) {
  return generateBridge(projectDir);
}
