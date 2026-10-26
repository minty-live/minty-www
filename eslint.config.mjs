// Flat config (ESLint 9; `next lint` and .eslintrc are gone in Next 16). The same rule set the
// old `"extends": "next/core-web-vitals"` gave, plus Next's TypeScript rules - what the three app
// frontends get through @minty/shared/eslint, which this site does not depend on.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
  ]),
]);
