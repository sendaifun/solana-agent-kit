/**
 * `@solana-agent-kit/plugin-vdm-nexus/tools` — optional helpers for
 * exposing Nexus actions to LangChain and the Vercel AI SDK.
 *
 * The SendAI core package (`solana-agent-kit`) already ships
 * `createLangchainTools` and `createVercelAITools` — they generate tool
 * objects from any Action[] array. These wrappers are thin convenience
 * functions that filter to the Nexus action subset, so callers who only
 * want signed-inference tools (and not the full token / NFT surface)
 * can mount the Nexus tools standalone alongside their own toolkits.
 *
 * The langchain / vercel-ai-sdk packages are NOT direct dependencies of
 * this plugin — they're resolved transitively from `solana-agent-kit`'s
 * optional peers. If a caller's project doesn't have them installed,
 * the imports below will fail to resolve at runtime and the caller
 * should use the underlying `agent.actions` array with their own
 * tool-generation pipeline.
 */

import type { SolanaAgentKit } from "solana-agent-kit";

const NEXUS_ACTION_NAMES = new Set([
  "NEXUS_CHAT",
  "NEXUS_VERIFY_RECEIPT",
  "NEXUS_GET_DEPOSIT_ADDRESS",
]);

/**
 * Return only the Nexus actions registered on the agent. Useful when
 * the agent has multiple plugins and the caller wants to mount the
 * Nexus tools in a standalone LangChain / Vercel AI SDK toolkit.
 */
export function getNexusActions(agent: SolanaAgentKit) {
  return agent.actions.filter((a) => NEXUS_ACTION_NAMES.has(a.name));
}

/**
 * Build a LangChain tool array for just the Nexus actions.
 *
 * Internally delegates to `createLangchainTools` from `solana-agent-kit`.
 * Requires `@langchain/core` to be installed in the host project (it's
 * an optional peer of `solana-agent-kit`).
 *
 * @example
 * ```ts
 * import { createNexusLangchainTools } from "@solana-agent-kit/plugin-vdm-nexus/tools";
 * const tools = createNexusLangchainTools(agent);
 * ```
 */
export async function createNexusLangchainTools(agent: SolanaAgentKit) {
  const { createLangchainTools } = (await import("solana-agent-kit")) as {
    createLangchainTools: (
      agent: SolanaAgentKit,
      actions: SolanaAgentKit["actions"],
    ) => unknown[];
  };
  return createLangchainTools(agent, getNexusActions(agent));
}

/**
 * Build a Vercel AI SDK tool object for just the Nexus actions.
 *
 * Internally delegates to `createVercelAITools` from `solana-agent-kit`.
 * Requires `ai` (the Vercel AI SDK) to be installed in the host project
 * (it's an optional peer of `solana-agent-kit`).
 *
 * @example
 * ```ts
 * import { createNexusVercelAITools } from "@solana-agent-kit/plugin-vdm-nexus/tools";
 * const tools = createNexusVercelAITools(agent);
 * ```
 */
export async function createNexusVercelAITools(agent: SolanaAgentKit) {
  const { createVercelAITools } = (await import("solana-agent-kit")) as {
    createVercelAITools: (
      agent: SolanaAgentKit,
      actions: SolanaAgentKit["actions"],
    ) => unknown;
  };
  return createVercelAITools(agent, getNexusActions(agent));
}
