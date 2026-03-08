import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      include: ["src/modules/**/*.ts", "src/core/**/*.ts", "src/infrastructure/**/*.ts", "src/lib/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.spec.ts", "**/types/**", "**/index.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
