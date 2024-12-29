import { SolanaAgentKit } from "../index";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SOLANA_RPC_URL } from "../../constants";
import { createSolanaTools } from "./tools";

export interface SolanaAgentOption {
  llm: BaseChatModel;
  private_key?: string;
  rpc_url?: string;
}

/**
 * createSolAgent - Create a React Agent Compiled Graph from the Langchain and SolanaAgentKit.
 * - Validate the input options and create a new SolanaAgent instance.
 * @param {SolanaAgentOption} options - Configuration options for the SolanaAgent instance.
 * @returns {CompiledStateGraph} A new CompiledStateGraph instance.
 */
export function createSolAgent(options: SolanaAgentOption) {
  validateSolAgentOption(options);
  const kit = new SolanaAgentKit(options.private_key!, options.rpc_url);
  const tools = createSolanaTools(kit);
  return createReactAgent({
    llm: options.llm,
    tools: tools,
  });
}

/**
 * Validate all the optional field
 * validate all the field for existence in the option if not there check in env variable  and send in the object
 * if not their throw error
 * @param {SolanaAgentOption} option - Configuration options for the SolanaAgent instance.
 * @returns {void} void
 */
function validateSolAgentOption(option: SolanaAgentOption): void {
  if (!option.private_key) {
    if (process.env.SOLANA_PRIVATE_KEY) {
      option.private_key = process.env.SOLANA_PRIVATE_KEY;
    }
    if (!option.private_key) {
      throw new Error(
        "A Solana private key is required to create a SolanaAgent instance.",
      );
    }
  }
  if (!option.rpc_url) {
    if (process.env.SOLANA_RPC_URL) {
      option.rpc_url = process.env.SOLANA_RPC_URL || SOLANA_RPC_URL;
    }
    if (!option.rpc_url) {
      throw new Error(
        "A Solana RPC URL is required to create a SolanaAgent instance.",
      );
    }
  }
}
