import { generateBackendHints } from "./core/backend/backendHintEngine.js";

console.log(
  generateBackendHints({
    routes: { preview: [], total: 0 },
    controllers: { all: [], total: 0 },
    services: { all: [], total: 0 },
    middlewares: { total: 0 },
    models: { models: [] },
    config: { categories: { env: [], db: [], security: [], app: [] } },
  })
);
