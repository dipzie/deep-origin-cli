import fs from "fs-extra";
import path from "path";

export async function evaluateFlowState(projectDir) {
  const aiDir = path.join(projectDir, "docs", "ai");
  await fs.ensureDir(aiDir);

  const hour = new Date().getHours();

  // Simple heuristic
  const mode = hour >= 20 || hour <= 2 ? "FLOW" : "REFLECTION";

  const result = {
    mode,
    hour,
    time: new Date().toISOString(),
  };

  await fs.writeJson(path.join(aiDir, "flow_state.json"), result, {
    spaces: 2,
  });

  return result;
}
