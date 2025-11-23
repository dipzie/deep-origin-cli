// core/backend/scanner/modelScanner.js
import fs from "fs";
import path from "path";

/*
 * MODEL SCANNER (Lite Mode)
 *
 * Detects database models via:
 *  - Prisma (schema.prisma)
 *  - Mongoose (mongoose.model)
 *  - Sequelize (sequelize.define)
 *  - TypeORM/Drizzle (Entity decorator)
 *  - Folder patterns (models/, entities/)
 *
 * Returns:
 * {
 *   preview: [...],
 *   total: number,
 *   proLocked: number,
 *   models: [...list of model names],
 *   connector: "Prisma" | "Mongoose" | "Sequelize" | "TypeORM" | "Unknown"
 * }
 */

export function scanBackendModels(root) {
  const files = getAllFiles(root);
  const models = [];
  let connector = "Unknown";

  // ----------------------------
  // 1. PRISMA
  // ----------------------------
  const prismaSchema = findFile(root, "schema.prisma");
  if (prismaSchema) {
    connector = "Prisma";

    const schemaContent = fs.readFileSync(prismaSchema, "utf8");
    const modelMatches = [
      ...schemaContent.matchAll(/model\s+([A-Za-z0-9_]+)/g),
    ];

    modelMatches.forEach((m) => models.push(m[1]));
  }

  // ----------------------------
  // 2. MONGOOSE
  // ----------------------------
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    if (content.includes("mongoose.model(")) {
      connector = connector === "Unknown" ? "Mongoose" : connector;

      const mongooseMatches = [
        ...content.matchAll(/mongoose\.model\(["'`](.*?)["'`]/g),
      ];

      mongooseMatches.forEach((m) => models.push(m[1]));
    }
  }

  // ----------------------------
  // 3. SEQUELIZE
  // ----------------------------
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    if (content.includes("sequelize.define(")) {
      connector = connector === "Unknown" ? "Sequelize" : connector;

      const seqMatches = [
        ...content.matchAll(/sequelize\.define\(["'`](.*?)["'`]/g),
      ];

      seqMatches.forEach((m) => models.push(m[1]));
    }
  }

  // ----------------------------
  // 4. TYPEORM / DRIZZLE (Lite-safe)
  // ----------------------------
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    if (content.includes("@Entity(")) {
      connector = connector === "Unknown" ? "TypeORM" : connector;

      const entityMatches = [
        ...content.matchAll(/export class ([A-Za-z0-9_]+)/g),
      ];

      entityMatches.forEach((m) => models.push(m[1]));
    }
  }

  // ----------------------------
  // 5. FOLDER PATTERN DETECTION
  // Only push file names, not model names
  // ----------------------------
  for (const file of files) {
    if (file.includes("/models/") || file.includes("/entities/")) {
      const name = path.basename(file).replace(path.extname(file), "");
      if (!models.includes(name)) models.push(name);
    }
  }

  // Build preview result
  const preview = models.slice(0, 10);
  const total = models.length;
  const proLocked = Math.max(total - 10, 0);

  return {
    preview,
    total,
    proLocked,
    models,
    connector,
  };
}

/*
 * Recursively find file
 */
function findFile(root, name) {
  const files = getAllFiles(root);
  return files.find((f) => f.endsWith(name)) || null;
}

/*
 * Collect all files
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
