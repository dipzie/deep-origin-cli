import fs from "fs-extra";
import path from "path";

export function scanBackendUtils(root) {
  const utilsDir = path.join(root, "utils");

  if (!fs.existsSync(utilsDir)) {
    return { preview: [], total: 0, proLocked: 0 };
  }

  const files = fs.readdirSync(utilsDir).filter((f) => f.endsWith(".js"));

  return {
    preview: files,
    total: files.length,
    proLocked: Math.max(files.length - 2, 0),
  };
}
