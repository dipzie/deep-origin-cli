import fs from "fs-extra";
import path from "path";

export async function updateLearning(projectDir, auditData) {
  const dir = path.join(projectDir, "docs", "learning");
  await fs.ensureDir(dir);

  const file = path.join(dir, "learning.json");

  let data = {
    version: "1.0",
    totalAudits: 0,
    lastAudit: null,
  };

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  data.totalAudits++;
  data.lastAudit = auditData.timestamp;

  await fs.writeJson(file, data, { spaces: 2 });
}
