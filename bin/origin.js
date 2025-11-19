#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";

import { runAudit } from "../core/auditEngine.js";

// Dynamically read version
const pkgPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "package.json"
);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const VERSION = pkg.version;

const program = new Command();

program
  .name("origin")
  .description("🧠 Deep Origin — Lite Mode CLI")
  .version(VERSION);

// SAFE WRAPPER
async function safe(fn, label) {
  try {
    console.log(label);
    await fn(process.cwd());
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

program
  .command("audit")
  .description("Run Lite Mode Project Audit")
  .action(async () => {
    await safe(runAudit, "📊 Running Origin Lite Audit…");
  });

program.parse();
