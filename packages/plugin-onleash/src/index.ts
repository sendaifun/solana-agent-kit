import type { Plugin, SolanaAgentKit } from "solana-agent-kit";
import deployProtectedMintAction from "./onleash/actions/deployProtectedMint";
import getPolicyAction from "./onleash/actions/getPolicy";
import protectedTransferAction from "./onleash/actions/protectedTransfer";
import updatePolicyAction from "./onleash/actions/updatePolicy";
import {
  deployProtectedMint,
  getPolicy,
  getOnleashClient,
  protectedTransfer,
  updatePolicy,
} from "./onleash/tools";

export {
  deployProtectedMint,
  getPolicy,
  getOnleashClient,
  protectedTransfer,
  updatePolicy,
};

const OnleashPlugin: Plugin = {
  name: "onleash",

  // Programmatic API — call agent.methods.onleash_deploy(...) etc.
  methods: {
    onleash_deploy: deployProtectedMint,
    onleash_update_policy: updatePolicy,
    onleash_get_policy: getPolicy,
    onleash_transfer: protectedTransfer,
  },

  // AI agent actions — exposed via createVercelAITools / createLangchainTools etc.
  actions: [
    deployProtectedMintAction,
    updatePolicyAction,
    getPolicyAction,
    protectedTransferAction,
  ],

  initialize(_agent: SolanaAgentKit): void {
    // No setup required — OnleashClient is instantiated per-call using the agent's connection + wallet.
  },
};

export default OnleashPlugin;
