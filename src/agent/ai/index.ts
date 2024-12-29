import { SolanaAgentKit } from "../index";
import { LanguageModel, generateText } from "ai";
import { SOLANA_RPC_URL } from "../../constants";
import { createSolanaTools } from "./tools";
import { LanguageModelV1 } from "@ai-sdk/provider";

export interface SolanaAgentOption {
  llm: LanguageModel | LanguageModelV1;
  private_key?: string;
  rpc_url?: string;
  maxSteps?: number;
  system?: string;
  prompt: string;
}

/**
 * createSolAgent - Create a React Agent Compiled Graph from the Langchain and SolanaAgentKit.
 * - Validate the input options and create a new SolanaAgent instance.
 * @param {SolanaAgentOption} options - Configuration options for the SolanaAgent instance.
 */
export function createSolAgent(options: SolanaAgentOption): Promise<any> {
  validateSolAgentOption(options);
  const kit = new SolanaAgentKit(options.private_key!, options.rpc_url);
  const tools = createSolanaTools(kit);
  return generateText({
    model: options.llm,
    tools: tools,
    system: options.system!,
    prompt: options.prompt,
    maxSteps: options.maxSteps || 10,
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
    option.rpc_url =
      process.env.SOLANA_RPC_URL || process.env.RPC_URL || SOLANA_RPC_URL;
    if (!option.rpc_url) {
      throw new Error(
        "A Solana RPC URL is required to create a SolanaAgent instance.",
      );
    }
  }
}
