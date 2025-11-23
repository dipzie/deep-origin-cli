import { scanBackendMiddlewares } from "./core/backend/scanner/middlewareScanner.js";

console.log(scanBackendMiddlewares(process.cwd()));
