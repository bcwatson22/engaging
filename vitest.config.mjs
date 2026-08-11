import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: "./src/tests/coverage",
      exclude: [
        ".next/**",
        "*.*",
        "src/data/types/**",
        "src/queries/**",
        // build entry points — a single call each, with nothing to assert
        "src/scripts/**",
      ],
    },
  },
});
