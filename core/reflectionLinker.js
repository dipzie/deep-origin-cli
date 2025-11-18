import fs from "fs-extra";
import path from "path";

export function getLatestReflection(projectDir) {
  const file = path.join(projectDir, "docs", "ai", "latest_reflection.json");
  if (!fs.existsSync(file)) return null;

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export async function reflectionLinker(projectDir) {
  const aiDir = path.join(projectDir, "docs", "ai");
  await fs.ensureDir(aiDir);

  const linksFile = path.join(aiDir, "reflection_links.json");

  let data = { links: [] };
  if (fs.existsSync(linksFile)) {
    data = JSON.parse(fs.readFileSync(linksFile, "utf8"));
  }

  const latest = getLatestReflection(projectDir);
  if (latest) {
    data.links.push({
      time: new Date().toISOString(),
      reflection: latest.reflection || "No text",
    });
  }

  await fs.writeJson(linksFile, data, { spaces: 2 });
}
