import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import Vybes tools
import {
  launchTokenOnVybes,
  generateVybesLogo,
  createVybesPrediction,
  getVybesEarnings,
} from "./vybes/tools";

// Import Vybes actions
import vybesLaunchAction from "./vybes/actions/launchToken";
import vybesLogoAction from "./vybes/actions/generateLogo";
import vybesPredictionAction from "./vybes/actions/createPrediction";

// Define and export the plugin
const VybesPlugin = {
  name: "vybes",

  // Combine all tools
  methods: {
    launchTokenOnVybes,
    generateVybesLogo,
    createVybesPrediction,
    getVybesEarnings,
  },

  // Combine all actions
  actions: [
    vybesLaunchAction,
    vybesLogoAction,
    vybesPredictionAction,
  ],

  // Initialize function
  initialize: function (): void {
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

// Default export for convenience
export default VybesPlugin;

// Re-export tools and types
export {
  launchTokenOnVybes,
  generateVybesLogo,
  createVybesPrediction,
  getVybesEarnings,
} from "./vybes/tools";

export type {
  LaunchTokenParams,
  LaunchTokenResult,
  GenerateLogoParams,
  GenerateLogoResult,
  VybesLogoStyle,
  CreatePredictionParams,
  CreatePredictionResult,
  VybesTemplateType,
  VybesDuration,
  VybesEarnings,
} from "./vybes/tools";

export { vybesLaunchAction } from "./vybes/actions/launchToken";
export { vybesLogoAction } from "./vybes/actions/generateLogo";
export { vybesPredictionAction } from "./vybes/actions/createPrediction";
