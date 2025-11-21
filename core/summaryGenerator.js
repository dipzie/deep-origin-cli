/*
 * ─────────────────────────────────────────────────────────────
 *                       ORIGIN LITE MODE
 *                       INTERNAL MODULE
 * ─────────────────────────────────────────────────────────────
 *
 *  WARNING:
 *  This file is part of Origin Lite Mode’s internal scanning
 *  engine. It is not a public API and not designed for reuse,
 *  modification, or redistribution.
 *
 *  Changing, copying, or altering this file may cause:
 *    • auditEngine failure
 *    • incorrect scan results
 *    • unstable CLI behavior
 *    • loss of Lite Mode protections
 *    • invalid preview generation
 *
 *  The full, stable, and extended scanning engine is available
 *  ONLY in Origin Pro. Lite Mode contains intentionally limited
 *  and obfuscated logic for security and upgrade protection.
 *
 *  Proceed at your own risk. This module is NOT considered a
 *  stable API surface and may break without notice.
 *
 *  © Dipz Origin — Protected Internal Logic
 * ─────────────────────────────────────────────────────────────
 */

import pc from "picocolors";

/*
 * summaryGenerator.js
 * Upgraded for Module 5 (Experience Engine)
 *
 * This version adds:
 * - Experience section (Architecture, UX Quality, Tip)
 * - Framework badge
 * - Motivation section at bottom
 * - Pro counters preserved for all previews
 */

export function generateSummary({
  project,
  files,
  framework,
  components,
  pages,
  features,
  ui,
  hints,
  meta, // Module 5 metadata
  relationships,
  relationshipsTotal,
  duplicates,
  deadFiles,
  unusedDeps,
  timestamp,
}) {
  const uiFormatted = ui.length ? ui.map((u) => `- ${u}`).join("\n") : "None";

  const hintsFormatted =
    hints.length > 0 ? hints.map((h) => `- ${h}`).join("\n") : "None";

  /* ============================================================
     MODULE 5 — EXPERIENCE ENGINE HELPERS
     ============================================================ */
  const architecture = framework.includes("Next.js") ? "Fullstack" : "Frontend";

  function getFrameworkBadge(framework) {
    if (framework.includes("Next")) return "⚡ Next.js";
    if (framework.includes("React")) return "⚛️ React";
    if (framework.includes("Vite")) return "⚡ Vite";
    return "📦 Unknown";
  }

  function evaluateUXQuality(meta) {
    if (!meta) return "Clean structure.";
    if (meta.totalScore <= 2) return "Very clean — minimal structural issues.";
    if (meta.totalScore <= 6) return "Clean — a few minor issues found.";
    if (meta.totalScore <= 12) return "Structure needs light cleanup.";
    return "Several issues detected — consider reorganizing.";
  }

  function generateSmartTip(meta) {
    if (!meta) return "Tip: No structural issues detected.";

    if (meta.deepNesting > 0)
      return "Tip: Flatten deep folder nesting to improve maintainability.";

    if (meta.mixedExt)
      return "Tip: Avoid mixing JS and TS files to keep consistency.";

    if (meta.emptyFolders > 0)
      return "Tip: Remove empty folders to reduce noise.";

    return "Tip: Project structure is stable — no major adjustments needed.";
  }

  const motivation = "Keep going — your structure is evolving! 🚀";

  /* ============================================================
     MARKDOWN OUTPUT (FINAL, CLEAN, LITE-SAFE)
     ============================================================ */

  return `
# Origin Lite Summary

Generated: **${timestamp}**

## Overview
- **Project:** ${project}
- **Files Scanned:** ${files.length}
- **Framework:** ${framework}

## Experience
- **Architecture:** ${architecture}
- **Framework Badge:** ${getFrameworkBadge(framework)}
- **UX Quality:** ${evaluateUXQuality(meta)}
- **${generateSmartTip(meta)}

---

## Components (Preview)
${components.slice(0, 10).join("\n") || "None"}
${components.length > 10 ? `+${components.length - 10} more (Pro)` : ""}

## Pages (Preview)
${pages.slice(0, 10).join("\n") || "None"}
${pages.length > 10 ? `+${pages.length - 10} more (Pro)` : ""}

## Features (Preview)
${features.slice(0, 10).join("\n") || "None"}
${features.length > 10 ? `+${features.length - 10} more (Pro)` : ""}

## UI System
${uiFormatted}

## Component Relationships (Preview)
${
  relationships
    .slice(0, 3)
    .map((r) => `- ${r}`)
    .join("\n") || "None"
}
${relationshipsTotal > 3 ? `+${relationshipsTotal - 3} more (Pro)` : ""}

## Possible Duplicates (Preview)
${duplicates.preview.slice(0, 3).join("\n") || "None"}
${duplicates.total > 3 ? `+${duplicates.total - 3} more (Pro)` : ""}

## Dead Files (Preview)
${deadFiles.preview.slice(0, 5).join("\n") || "None"}
${deadFiles.total > 5 ? `+${deadFiles.total - 5} more (Pro)` : ""}

## Unused Dependencies (Preview)
${unusedDeps.preview.slice(0, 3).join("\n") || "None"}
${unusedDeps.total > 3 ? `+${unusedDeps.total - 3} more (Pro)` : ""}

## Structure Hints (Lite)
${hintsFormatted}

---

## Motivation
${motivation}

---
_Generated by Origin Lite Mode_

`;
}

/* ---------------- HEALTH SCORE (Lite Mode) ---------------- */
export function computeHealthScore({ features, ui, hints }) {
  let score = 100;

  if (hints.length > 0) score -= Math.min(hints.length * 5, 40);
  if (features.length === 0) score -= 20;
  if (ui.length === 0) score -= 10;

  return Math.max(40, score);
}
