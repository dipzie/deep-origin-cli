import fs from "fs-extra";
import path from "path";

export function scanEnv(projectDir) {
  const files = fs.readdirSync(projectDir).filter((f) => f.startsWith(".env"));

  const result = [];

  for (const file of files) {
    const full = path.join(projectDir, file);
    const content = fs.readFileSync(full, "utf8");

    const keys = content
      .split("\n")
      .map((line) => line.split("=")[0])
      .filter((k) => k);

    result.push({
      file,
      keys,
    });
  }

  return result;
}
