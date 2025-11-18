import fs from "fs-extra";
import path from "path";

export function logActivity(action, meta = {}) {
  const dir = path.join(process.cwd(), "docs", "activity");
  fs.ensureDirSync(dir);

  const file = path.join(dir, "activity_log.json");

  let logs = [];
  if (fs.existsSync(file)) {
    logs = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  logs.push({
    action,
    meta,
    time: new Date().toISOString(),
  });

  fs.writeJsonSync(file, logs, { spaces: 2 });
}
