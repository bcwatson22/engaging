import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reportsDirectory: "./src/tests/unit/coverage",
      // include: ["./src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "./.next/**/*.*",
        "./*.*",
        "./src/data/types/**/*.*",
        "./src/queries/**/*.*",
      ],
    },
  },
});
