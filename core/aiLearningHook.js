import fs from "fs-extra";
import path from "path";

/**
 * Free Tier AI Hook
 * Only stores basic facts for AI awareness.
 */
export function exportAIHook(data) {
  const dir = path.join(process.cwd(), "docs", "ai");
  fs.ensureDirSync(dir);

  fs.writeJsonSync(path.join(dir, "ai_hook.json"), data, { spaces: 2 });
}
