import fs from "fs-extra";
import path from "path";

export function listFilesRecursively(dir) {
  const result = [];

  function walk(current) {
    const items = fs.readdirSync(current);

    for (const item of items) {
      const full = path.join(current, item);

      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else {
        result.push(full);
      }
    }
  }

  walk(dir);
  return result;
}

export function niceDate() {
  const d = new Date();
  return d.toISOString().replace("T", " ").slice(0, 19);
}
