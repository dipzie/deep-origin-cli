export function getPermissions() {
  return {
    role: "free",
    canAudit: true,
    canReflect: true,
    canSync: true,

    // Restricted — Free Tier cannot access these:
    canDriftScan: false,
    canPredict: false,
    canFix: false,
    canAST: false,
    canEcosystemScan: false,
    canFounderOps: false,
  };
}
