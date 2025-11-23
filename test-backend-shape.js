import { generateBackendSummary } from "./core/backend/backendSummaryEngine.js";

const summary = generateBackendSummary(process.cwd());

console.log("ROUTES:", summary.routes);
console.log("CONTROLLERS:", summary.controllers);
console.log("SERVICES:", summary.services);
console.log("MIDDLEWARE:", summary.middleware);
console.log("MODELS:", summary.models);
console.log("UTILS:", summary.utils);
console.log("CONFIG:", summary.config);
