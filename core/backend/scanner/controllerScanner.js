// core/backend/scanner/controllerScanner.js
import fs from "fs";
import path from "path";

/*
 * CONTROLLER SCANNER (Lite Mode)
 *
 * Detects controller files using:
 *  - filename patterns (*controller.js / *Controller.ts)
 *  - folder patterns (controllers/)
 *  - NestJS controller decorators (@Controller)
 *
 * Returns:
 *  {
 *    preview: [...],
 *    total: number,
 *    proLocked: number,
 *    all: [...full list]
 *  }
 */

export function scanBackendControllers(root) {
  const controllers = [];
  const files = getAllFiles(root);

  for (const file of files) {
    const ext = path.extname(file);
    if (![".js", ".ts"].includes(ext)) continue;

    const filename = path.basename(file).toLowerCase();

    // ------------------------------------
    // FILENAME PATTERNS
    // ------------------------------------
    if (
      filename.includes("controller") ||
      filename.endsWith("controller.js") ||
      filename.endsWith("controller.ts")
    ) {
      controllers.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }

    // ------------------------------------
    // FOLDER PATTERN (controllers/)
    // ------------------------------------
    if (file.includes("/controllers/")) {
      controllers.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }

    // ------------------------------------
    // NESTJS DECORATORS (@Controller)
    // ------------------------------------
    const content = fs.readFileSync(file, "utf8");

    if (content.includes("@Controller(")) {
      controllers.push(file.replace(root, "").replace(/^\//, ""));
      continue;
    }
  }

  // Build preview dataset
  const preview = controllers.slice(0, 10);
  const total = controllers.length;
  const proLocked = Math.max(total - 10, 0);

  return {
    preview,
    total,
    proLocked,
    all: controllers,
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
