// core/backend/scanner/serviceScanner.js
import fs from "fs";
import path from "path";

/*
 * SERVICE SCANNER (Lite Mode)
 *
 * Detects backend service files using:
 *  - filename patterns (*service.js / *Service.ts)
 *  - folder patterns (services/)
 *  - NestJS decorators (@Injectable)
 *
 * Returns:
 *  {
 *    preview: [...],
 *    total: number,
 *    proLocked: number,
 *    all: [...full list]
 *  }
 */

export function scanBackendServices(root) {
  const services = [];
  const files = getAllFiles(root);

  for (const file of files) {
    const ext = path.extname(file);
    if (![".js", ".ts"].includes(ext)) continue;

    const filename = path.basename(file).toLowerCase();

    // ------------------------------------
    // FILENAME PATTERNS
    // ------------------------------------
    if (
      filename.includes("service") ||
      filename.endsWith("service.js") ||
      filename.endsWith("service.ts")
    ) {
      services.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }

    // ------------------------------------
    // FOLDER PATTERN (services/)
    // ------------------------------------
    if (file.includes("/services/")) {
      services.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }

    // ------------------------------------
    // NESTJS SERVICES (@Injectable())
    // ------------------------------------
    const content = fs.readFileSync(file, "utf8");

    if (content.includes("@Injectable(")) {
      services.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }
  }

  const preview = services.slice(0, 10);
  const total = services.length;
  const proLocked = Math.max(total - 10, 0);

  return {
    preview,
    total,
    proLocked,
    all: services,
  };
}

/*
 * Recursively collect all files
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      if (
        ["node_modules", "dist", "build", ".git", ".next", ".turbo"].includes(
          file
        )
      ) {
        continue;
      }
      getAllFiles(full, fileList);
    } else {
      fileList.push(full);
    }
  }

  return fileList;
}
