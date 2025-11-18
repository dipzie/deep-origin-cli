import fs from "fs-extra";
import path from "path";

export async function generateRhythmSummary(projectDir) {
  const aiDir = path.join(projectDir, "docs", "ai");
  await fs.ensureDir(aiDir);

  const file = path.join(aiDir, "rhythm_summary.json");
  let data = { hours: Array(24).fill(0) };

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  const hour = new Date().getHours();
  data.hours[hour]++;

  await fs.writeJson(file, data, { spaces: 2 });
  return data;
}
