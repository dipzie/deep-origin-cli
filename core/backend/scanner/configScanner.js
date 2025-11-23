// core/backend/scanner/configScanner.js
import fs from "fs";
import path from "path";

/*
 * CONFIG SCANNER (Lite Mode)
 *
 * Detects backend config files:
 *   - env files (.env, .env.local, .env.example)
 *   - config folders (config/, configs/)
 *   - database config (db.js, database.js, ormconfig.js)
 *   - security config (jwt.js, auth.js, rate-limit, cors)
 *   - prisma schema
 *
 * Returns:
 * {
 *   preview: [...],
 *   total: number,
 *   proLocked: number,
 *   categories: { env:[], db:[], security:[], app:[] }
 * }
 */

export function scanBackendConfig(root) {
  const files = getAllFiles(root);
  const configFiles = [];

  const categories = {
    env: [],
    db: [],
    security: [],
    app: [],
  };

  for (const file of files) {
    const name = path.basename(file).toLowerCase();

    // -------------------------
    // ENV CONFIG
    // -------------------------
    if (
      name === ".env" ||
      name === ".env.local" ||
      name === ".env.example" ||
      name === ".env.production"
    ) {
      configFiles.push(file);
      categories.env.push(file);
      continue;
    }

    // -------------------------
    // CONFIG FOLDER
    // -------------------------
    if (file.includes("/config/") || file.includes("/configs/")) {
      configFiles.push(file);
      categories.app.push(file);
      continue;
    }

    // -------------------------
    // DATABASE CONFIG
    // -------------------------
    if (
      name === "db.js" ||
      name === "database.js" ||
      name === "ormconfig.js" ||
      name === "ormconfig.ts" ||
      name.includes("prisma")
    ) {
      configFiles.push(file);
      categories.db.push(file);
      continue;
    }

    // -------------------------
    // SECURITY CONFIG
    // -------------------------
    if (
      name.includes("jwt") ||
      name.includes("auth") ||
      name.includes("cors") ||
      name.includes("rate")
    ) {
      configFiles.push(file);
      categories.security.push(file);
      continue;
    }
  }

  const preview = configFiles.slice(0, 10);
  const total = configFiles.length;
  const proLocked = Math.max(total - 10, 0);

  return {
    preview,
    total,
    proLocked,
    categories,
  };
}

/*
 * Recursively get all files
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (fs.statSync(full).isDirectory()) {
      if (
        ["node_modules", "dist", "build", ".git", ".next", ".turbo"].includes(
          item
        )
      )
        continue;

      getAllFiles(full, fileList);
    } else {
      fileList.push(full);
    }
  }

  return fileList;
}
