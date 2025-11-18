import fs from "fs-extra";
import path from "path";

export function scanRoutes(projectDir) {
  const routes = [];

  function walk(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const full = path.join(dir, item);

      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (item === "route.js" || item === "index.js") {
        routes.push(full.replace(projectDir, ""));
      }
    }
  }

  walk(path.join(projectDir));
  return routes;
}
