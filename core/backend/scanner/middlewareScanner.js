import fs from "fs-extra";
import path from "path";

export function scanBackendMiddlewares(root) {
  const dir = path.join(root, "middleware");

  if (!fs.existsSync(dir)) {
    return { preview: [], total: 0, proLocked: 0 };
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));

  return {
    preview: files,
    total: files.length,
    proLocked: Math.max(files.length - 2, 0),
  };
}
