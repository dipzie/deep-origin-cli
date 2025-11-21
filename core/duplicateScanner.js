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
import fs from "fs-extra";
import path from "path";

/**
 * Duplicate Scanner — Balanced Lite Version
 * -----------------------------------------
 * ✔ Groups files by normalized component name
 * ✔ Detects copies (copy, copy 2, copy 3)
 * ✔ Detects case-sensitive duplicates (Card.tsx vs card.tsx)
 * ✔ Detects duplicates across folders
 * ✔ Preview = first 10 duplicates
 * ✔ Total = ALL duplicates
 */
export function scanDuplicates(root, { components = [] }) {
  const groups = {}; // normalizedName → list of file paths
  const preview = []; // Lite preview
  const allDuplicateFiles = []; // ALL duplicates for Pro count

  // Normalize file names for grouping
  const normalize = (name) =>
    name
      .toLowerCase()
      .replace(/\s*\(\d+\)/g, "") // removes (1), (2), etc
      .replace(/\s*copy\s*\d*/g, "") // removes "copy", "copy 2", etc
      .replace(/\.(tsx|ts|jsx|js)$/g, "") // removes extension
      .trim();

  // 1. Group files by normalized base name
  components.forEach((file) => {
    const base = path.basename(file);
    const key = normalize(base);

    if (!groups[key]) groups[key] = [];
    groups[key].push(file);
  });

  // 2. For each group with more than 1 file, mark as duplicates
  Object.values(groups).forEach((files) => {
    if (files.length > 1) {
      // Add ALL files to the full duplicate list (Pro)
      allDuplicateFiles.push(...files);

      // Add each to PREVIEW (Lite)
      files.forEach((f) => {
        preview.push(`Possible duplicate: ${f}`);
      });
    }
  });

  // 3. Lite preview limit
  const previewLimit = 10;

  return {
    preview: preview.slice(0, previewLimit),
    total: allDuplicateFiles.length, // ALWAYS full count
  };
}
