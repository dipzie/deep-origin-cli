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

import crypto from "crypto";

/**
 * Create a stable hash based on project path + item key + secret
 * This ensures PREVIEW ITEMS NEVER CHANGE even if items change/deleted.
 */
export function stableHash(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Pick a stable preview list.
 * - items: array of items
 * - count: number of previews to show
 * - project: project name / root path
 * - salt: name of the scanner (unique per feature)
 */
export function pickStablePreview(items, count, project, salt) {
  if (!items.length) return [];

  const previews = new Set();

  // We generate many hash seeds to guarantee enough entropy
  let counter = 0;
  while (previews.size < Math.min(count, items.length)) {
    const hash = stableHash(`${project}:${salt}:${counter}`);
    const index = parseInt(hash.slice(0, 8), 16) % items.length;
    previews.add(items[index]);
    counter++;
  }

  return [...previews];
}
