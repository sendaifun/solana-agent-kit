import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  routers: {
    client: {
      vite: {
        plugins: [
          nodePolyfills({
            // Enable node built-in modules polyfills
            protocolImports: true,
            exclude: ["stream"],
          }),
        ],
      },
    },
  },
  vite: {
    ssr: {
      // Force Vite to process this dependency instead of externalizing it
      noExternal: ["@solana-agent-kit/plugin-token"],
    },
    // You might still need optimizeDeps for the browser build
    optimizeDeps: {
      exclude: [".vinxi"],
      esbuildOptions: {
        // define: {
        //   global: "globalThis",
        // },
        loader: {
          ".json": "json",
        },
      },
    },
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
