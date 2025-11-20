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

/*
 * Stable preview selector based on project + salt hashing
 */

import crypto from "crypto";

export function pickStablePreview(items, limit, project, salt) {
  if (!Array.isArray(items)) return [];

  const sorted = [...items].sort();

  const seeded = sorted.map((item) => {
    const hash = crypto
      .createHash("sha256")
      .update(project + item + salt)
      .digest("hex");

    return { item, score: parseInt(hash.slice(0, 8), 16) };
  });

  const final = seeded
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.item);

  return final;
}
