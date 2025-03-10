import path from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  test: {
    include: ["**/*.eval.?(c|m)[jt]s"],
    reporters: ["langsmith/vitest/reporter"],
    setupFiles: ["dotenv/config"],
  },
  plugins: [
    tsconfigPaths(),
    nodePolyfills({
      include: ["crypto", "stream", "util"],
    }),
  ],
  // ... existing config ...
  resolve: {
    alias: {
      "@cks-systems/manifest-sdk": path.resolve(
        __dirname,
        "node_modules/@cks-systems/manifest-sdk/dist/cjs/index.js",
      ),
    },
    mainFields: ["browser", "module", "main"],
  },
});
