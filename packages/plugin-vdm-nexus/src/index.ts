/**
 * `@solana-agent-kit/plugin-vdm-nexus` — Solana Agent Kit plugin for
 * signed inference via VDM Nexus.
 *
 * Three actions:
 *
 *   • NEXUS_CHAT                — pay-per-call signed inference via x402
 *   • NEXUS_VERIFY_RECEIPT      — five-check SIR v2 verification
 *   • NEXUS_GET_DEPOSIT_ADDRESS — on-chain top-up destination lookup
 *
 * Two methods exposed on the agent's methods registry (for direct
 * programmatic use without going through the action-handler shape):
 *
 *   • nexusChat               → returns the raw x402 result object
 *   • nexusVerifyReceipt      → returns the raw verifier result
 *   • nexusGetDepositAddress  → returns the raw deposit-address record
 *
 * Plugin construction follows the standard SendAI factory pattern: import
 * the default export and `.use(VdmNexusPlugin)` on the agent. Configure
 * via the optional `configure({ ... })` helper before the `.use(...)`
 * call, or rely on env-var defaults.
 *
 * See https://docs.vdmnexus.com/docs/spec/sir-v2 for the receipt spec.
 */

import type { SolanaAgentKit } from "solana-agent-kit";
import {
  type NexusChatInput,
  NexusChatSchema,
  buildNexusChatAction,
} from "./actions/nexus-chat.js";
import {
  type NexusDepositAddressResponse,
  type NexusGetDepositAddressInput,
  NexusGetDepositAddressSchema,
  buildNexusGetDepositAddressAction,
} from "./actions/nexus-get-deposit-address.js";
import {
  type NexusVerifyReceiptInput,
  NexusVerifyReceiptSchema,
  buildNexusVerifyReceiptAction,
} from "./actions/nexus-verify-receipt.js";
import {
  DEFAULT_ENDPOINT,
  type ResolvedConfig,
  type VdmNexusPluginConfig,
  resolveConfig,
} from "./config.js";

// Re-export schemas and types for callers that want to type their inputs.
export {
  NexusChatSchema,
  NexusVerifyReceiptSchema,
  NexusGetDepositAddressSchema,
  DEFAULT_ENDPOINT,
};
export type {
  VdmNexusPluginConfig,
  NexusChatInput,
  NexusVerifyReceiptInput,
  NexusGetDepositAddressInput,
  NexusDepositAddressResponse,
};

/**
 * Live config — module-scoped because the SendAI plugin object is a
 * singleton consumed by the `Plugin` interface. Mutated by
 * `configure(...)` before the plugin is registered with the agent.
 *
 * This mirrors the configuration shape used by other ecosystem plugins
 * that expose a `configure` hook (e.g. `@solana-agent-kit/plugin-defi`
 * for its Drift / Manifest integrations).
 */
let liveConfig: ResolvedConfig = resolveConfig();

/**
 * Configure the plugin before registering it with `SolanaAgentKit.use()`.
 *
 * @example
 * ```ts
 * import VdmNexusPlugin, { configure } from "@solana-agent-kit/plugin-vdm-nexus";
 *
 * configure({
 *   endpoint: "https://nexus.vdmnexus.com/api/v1",
 *   signerSecretKey: process.env.SOLANA_PRIVATE_KEY!,
 * });
 *
 * const agent = new SolanaAgentKit(wallet, rpcUrl, {}).use(VdmNexusPlugin);
 * ```
 */
export function configure(config: VdmNexusPluginConfig): void {
  liveConfig = resolveConfig(config);
}

/**
 * Get the currently active resolved config (post-defaults). Exposed for
 * tests and for callers that need to introspect the live endpoint.
 */
export function getConfig(): Readonly<ResolvedConfig> {
  return liveConfig;
}

const VdmNexusPlugin = {
  name: "vdm_nexus",

  methods: {
    /**
     * Pay-per-call signed inference. Settles a USDC payment inline via
     * x402 on Solana (or Base) and returns the OpenAI response plus the
     * signed receipt. Throws on any handshake / network failure (use
     * the action wrapper if you want non-throwing error shapes).
     */
    nexusChat: async (
      agent: SolanaAgentKit,
      args: NexusChatInput,
    ): Promise<Record<string, unknown>> => {
      const handler = buildNexusChatAction(liveConfig).handler;
      return handler(agent, args as Record<string, unknown>);
    },

    /**
     * Verify a Signed Inference Receipt end-to-end. Pure client-side
     * check plus on-chain RPC lookup; does not consume USDC.
     */
    nexusVerifyReceipt: async (
      agent: SolanaAgentKit,
      args: NexusVerifyReceiptInput,
    ): Promise<Record<string, unknown>> => {
      const handler = buildNexusVerifyReceiptAction(liveConfig).handler;
      return handler(agent, args as Record<string, unknown>);
    },

    /**
     * Look up the USDC deposit address for prepaid credit top-ups.
     * Per-call x402 settlement (nexusChat) does NOT require this.
     */
    nexusGetDepositAddress: async (
      agent: SolanaAgentKit,
      args: NexusGetDepositAddressInput = {},
    ): Promise<Record<string, unknown>> => {
      const handler = buildNexusGetDepositAddressAction(liveConfig).handler;
      return handler(agent, args as Record<string, unknown>);
    },
  },

  actions: [
    buildNexusChatAction(liveConfig),
    buildNexusVerifyReceiptAction(liveConfig),
    buildNexusGetDepositAddressAction(liveConfig),
  ],

  /**
   * Refresh actions against the latest config when the plugin is
   * registered with the agent. This lets callers `configure(...)`
   * after import but before `agent.use(VdmNexusPlugin)` and still get
   * the updated config on the action handlers.
   */
  initialize(_agent: SolanaAgentKit): void {
    VdmNexusPlugin.actions[0] = buildNexusChatAction(liveConfig);
    VdmNexusPlugin.actions[1] = buildNexusVerifyReceiptAction(liveConfig);
    VdmNexusPlugin.actions[2] = buildNexusGetDepositAddressAction(liveConfig);
  },
};

export default VdmNexusPlugin;
