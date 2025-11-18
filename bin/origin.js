#!/usr/bin/env node
import { Command } from "commander";
import { runAudit } from "../core/auditEngine.js";
// import { runInit } from "../core/initEngine.js";
import { generateAssistantTip } from "../core/assistantGuide.js";
import { evaluateFlowState } from "../core/flowEngine.js";

const program = new Command();

program
  .name("origin")
  .description("🧠 Dipz Origin — Free Tier CLI")
  .version("1.0.0");

// SAFE RUN WRAPPER
async function safe(fn, label) {
  try {
    console.log(label);
    await fn(process.cwd());
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// AUDIT
program
  .command("audit")
  .description("Run project audit (Free Tier)")
  .action(async () => {
    await safe(runAudit, "📊 Running Origin Audit…");
    const tip = await generateAssistantTip(process.cwd());
    console.log(`💡 Assistant: ${tip}`);

    const flow = await evaluateFlowState(process.cwd());
    console.log(`🌊 Flow Mode: ${flow.mode}`);
  });

program.parse(process.argv);
