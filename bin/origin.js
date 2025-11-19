#!/usr/bin/env node
import { Command } from "commander";
import { runAudit } from "../core/auditEngine.js";
import os from "os";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load package.json manually (works in CLI ESM)
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);

const program = new Command();

program
  .name("origin")
  .description("🧠 Dipz Origin — Free Tier CLI")
  .version(pkg.version);

/**
 * ================================================================
 * ORIGIN — Founder Authentication (Triple Lock System)
 * ================================================================
 *
 * Recognizes the canonical dipz/solomobz founder instance.
 * This is a lore-based identity layer, not a security boundary.
 *
 * Unlock Conditions (ALL must match):
 *   1. System username === "solomobz"
 *   2. Hidden founder token file exists at ~/.origin_founder
 *   3. File content === "dipz-founder"
 *
 * Public users cannot trigger Founder Mode.
 * ================================================================
 */
function isFounderInstance() {
  try {
    const username = os.userInfo().username;
    const founderFile = path.join(os.homedir(), ".origin_founder");

    const fileExists = fs.existsSync(founderFile);
    const fileKey = fileExists
      ? fs.readFileSync(founderFile, "utf8").trim()
      : null;

    return username === "solomobz" && fileExists && fileKey === "dipz-founder";
  } catch {
    return false;
  }
}

/**
 * ================================================================
 * SAFE RUN WRAPPER
 * Prevents CLI crashes & ensures smooth UX.
 * ================================================================
 */
async function safe(fn, label) {
  try {
    console.log(label);
    await fn(process.cwd());
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

/**
 * ================================================================
 * AUDIT COMMAND — WOW UX (Lite Mode v1.1)
 * ================================================================
 */
program
  .command("audit")
  .description("Run project audit (Free Tier — Lite Mode v1.1)")
  .action(async () => {
    console.log("\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━".bold);
    console.log("🧠  Origin Audit Engine — Lite Mode v1.1".bold);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━".bold);

    const projectDir = process.cwd();

    try {
      console.log("📂 Preparing project context...");
      console.log("🔎 Scanning file topology...");

      const audit = await runAudit(projectDir);

      console.log("📘 Generating Lite Summary...");
      console.log("   → docs/ai/bridge_summary.md");

      // Lite Intelligence summary
      console.log("\n✨ Lite Intelligence Activated");
      console.log(
        `   Found ${audit.summary.totalFiles} file(s), ${audit.summary.routeCount} route(s), ${audit.summary.schemaCount} schema(s)`
      );
      console.log(`   Framework detected → ${audit.summary.framework}`);

      // UX Tip
      console.log("\n💡 Tip:");
      console.log("   Open docs/ai/bridge_summary.md to view insights.");
      console.log("   Try adding a component/page and audit again!");

      // Progression System
      console.log("\n🎮 Progression System:");
      if (audit.summary.totalFiles <= 5) {
        console.log("   Level 1 unlocked → Minimal Project Mode");
        console.log("   Add /src/components to unlock Level 2");
      } else if (audit.files.some((f) => f.includes("components"))) {
        console.log("   Level 2 unlocked → Component Awareness");
        console.log("   Add /src/pages to unlock Level 3");
      } else if (audit.files.some((f) => f.includes("pages"))) {
        console.log("   Level 3 unlocked → Page Awareness");
        console.log("   Add /src/features to unlock Level 4");
      }

      // Pro Tier Tease
      console.log("\n🔒 Pro Tier Preview:");
      console.log("   Architecture Maps      (Locked)");
      console.log("   Drift Timeline         (Locked)");
      console.log("   Dependency Graphs      (Locked)");
      console.log("   Feature Boundaries     (Locked)");
      console.log("   Origin Brain v2        (Locked)");

      console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━".bold
      );
      console.log("🏁 Audit complete\n".bold);
    } catch (err) {
      console.error("❌ Error during audit:", err.message);
    }
  });

/**
 * ================================================================
 * UNLOCK COMMAND — Founder Mode LORE SYSTEM
 * ================================================================
 */
program
  .command("unlock <token>")
  .description("Attempt to unlock privileged Origin commands")
  .action((token) => {
    console.log("\n");

    if (token !== "dipz") {
      console.log("🔒 Invalid unlock token.");
      console.log("Hint: only one token exists, and it isn't this.");
      return;
    }

    if (!isFounderInstance()) {
      console.log("🟣 Access Denied");
      console.log("“dipz” privilege token is restricted to Founder instances.");
      console.log("");
      return;
    }

    // Founder is recognized — secret lore reveals
    console.log("🟣 Founder Instance Detected");
    console.log("Initializing internal developer commands...");
    console.log("(This mode is not available publicly)\n");

    console.log("🔧 Internal kernel mapping loaded.");
    console.log("🧬 Developer pattern memory synchronized.\n");
  });

// Execute CLI
program.parse(process.argv);
