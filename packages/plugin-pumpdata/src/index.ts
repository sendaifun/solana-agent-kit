import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

// pumpdata.fun actions
import pumpdataGetBaseRateAction from "./pumpdata/actions/getBaseRate";
import pumpdataGetDeployerAction from "./pumpdata/actions/getDeployer";
import pumpdataGetLaunchAction from "./pumpdata/actions/getLaunch";
import pumpdataGetSimilarAction from "./pumpdata/actions/getSimilar";
import pumpdataGetStatsAction from "./pumpdata/actions/getStats";
import pumpdataGetWalletsAction from "./pumpdata/actions/getWallets";

// pumpdata.fun tools
import {
  pumpdataGetBaseRate,
  pumpdataGetDeployer,
  pumpdataGetLaunch,
  pumpdataGetSimilar,
  pumpdataGetStats,
  pumpdataGetWallets,
} from "./pumpdata/tools";

export * from "./pumpdata/types";
export {
  PumpDataApiError,
  createAgentPaymentSigner,
  createPumpDataPaymentFetch,
} from "./pumpdata/tools";

// Define and export the plugin
const PumpDataPlugin = {
  name: "pumpdata",

  // Combine all tools
  methods: {
    pumpdataGetStats,
    pumpdataGetLaunch,
    pumpdataGetWallets,
    pumpdataGetDeployer,
    pumpdataGetSimilar,
    pumpdataGetBaseRate,
  },

  // Combine all actions
  actions: [
    pumpdataGetStatsAction,
    pumpdataGetLaunchAction,
    pumpdataGetWalletsAction,
    pumpdataGetDeployerAction,
    pumpdataGetSimilarAction,
    pumpdataGetBaseRateAction,
  ],

  // Initialize function
  initialize: function (_agent: SolanaAgentKit): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName as keyof typeof this.methods] = method as any;
      }
    });
  },
} satisfies Plugin;

export default PumpDataPlugin;
