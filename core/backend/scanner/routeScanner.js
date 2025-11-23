import fs from "fs-extra";
import path from "path";

export function scanBackendRoutes(root) {
  const routesDir = path.join(root, "routes");

  if (!fs.existsSync(routesDir)) {
    return { preview: [], total: 0, proLocked: 0 };
  }

  const preview = [];

  for (const file of fs.readdirSync(routesDir)) {
    if (!file.endsWith(".js")) continue;

    const full = path.join(routesDir, file);
    const content = fs.readFileSync(full, "utf8");

    const patterns = [
      { method: "GET", regex: /\.get\(['"`](.*?)['"`]/g },
      { method: "POST", regex: /\.post\(['"`](.*?)['"`]/g },
      { method: "PUT", regex: /\.put\(['"`](.*?)['"`]/g },
      { method: "DELETE", regex: /\.delete\(['"`](.*?)['"`]/g },
      { method: "PATCH", regex: /\.patch\(['"`](.*?)['"`]/g },
    ];

    for (const { method, regex } of patterns) {
      let match;
      while ((match = regex.exec(content))) {
        preview.push(`${method} ${match[1]} → ${file}`);
      }
    }
  }

  return {
    preview,
    total: preview.length,
    proLocked: Math.max(preview.length - 2, 0),
  };
}
