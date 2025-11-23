import { detectBackendFramework } from "./core/backend/frameworkDetector.js";

const result = detectBackendFramework(process.cwd());
console.log("Detected Backend Framework:", result);
