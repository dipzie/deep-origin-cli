import fs from "fs-extra";
import path from "path";

export function detectFramework(projectDir) {
  const pkgFile = path.join(projectDir, "package.json");

  if (!fs.existsSync(pkgFile)) return "Unknown / Custom Stack";

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));

    if (pkg.dependencies?.next) return "Next.js";
    if (pkg.dependencies?.react) return "React";
    if (pkg.dependencies?.express) return "Express.js";

    return "Unknown / Custom Stack";
  } catch {
    return "Unknown / Custom Stack";
  }
}
