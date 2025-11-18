import fs from "fs-extra";
import path from "path";

export function scanSchemas(projectDir) {
  const result = [];

  function walk(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const full = path.join(dir, item);

      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (item.includes("schema") || item.endsWith(".sql")) {
        result.push(full.replace(projectDir, ""));
      }
    }
  }

  walk(projectDir);
  return result;
}
