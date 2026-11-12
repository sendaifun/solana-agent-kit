import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { sodaxSwap } from "../tools";

const sodaxCrossChainSwapAction: Action = {
  name: "SODAX_CROSS_CHAIN_SWAP",
  description:
    "Execute a cross-chain token swap via SODAX from a Solana source address to any supported destination chain (Solana, Ethereum, Base, Arbitrum, BNB Chain, Sonic, Optimism, Polygon, and more). " +
    "Builds an intent transaction, signs and submits it on Solana via the agent wallet, hands it off to the SODAX relay network, and polls until a solver fills the order. " +
    "For cross-chain destinations (EVM chains), a destination address on the target chain is required.",
  similes: [
    "swap tokens cross-chain with sodax",
    "sodax cross-chain swap",
    "bridge and swap via sodax",
    "swap sol to usdc on base",
    "swap solana tokens to ethereum",
    "cross-chain swap from solana",
    "sodax swap",
    "swap tokens across chains sodax",
    "send tokens to another chain via sodax",
  ],
  examples: [
    [
      {
        input: {
          srcChainKey: "solana",
          dstChainKey: "solana",
          inputTokenAddress: "11111111111111111111111111111111",
          outputTokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: "1000000000",
          dstAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        },
        output: {
          status: "success",
          result: {
            status: "solved",
            txHash: "5J7oAKz...",
            dstIntentTxHash: "0x...",
          },
          message: "SODAX swap completed successfully",
        },
        explanation: "Swap 1 SOL to USDC on Solana via SODAX",
      },
    ],
    [
      {
        input: {
          srcChainKey: "solana",
          dstChainKey: "0x2105.base",
          inputTokenAddress: "11111111111111111111111111111111",
          outputTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          inputAmount: "1000000000",
          dstAddress: "0x23C279e58ddF1018C3B9D0C224534fA2a83fb1d2",
          slippageBps: 100,
        },
        output: {
          status: "success",
          result: {
            status: "solved",
            txHash: "5J7oAKz...",
            dstIntentTxHash: "0x...",
            fillTxHash: "0x...",
          },
          message: "SODAX swap completed successfully",
        },
        explanation:
          "Swap 1 SOL from Solana to USDC on Base via SODAX cross-chain",
      },
    ],
  ],
  schema: z.object({
    srcChainKey: z
      .string()
      .describe(
        'Source chain key. Currently only "solana" is supported as source.',
      ),
    dstChainKey: z
      .string()
      .describe(
        'Destination chain key (e.g., "solana", "0x2105.base", "ethereum", "0xa4b1.arbitrum", "0x38.bsc", "sonic", "0xa.optimism", "0x89.polygon")',
      ),
    inputTokenAddress: z
      .string()
      .describe(
        "Source token mint address on Solana (e.g., 11111111111111111111111111111111 for native SOL, EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v for USDC)",
      ),
    outputTokenAddress: z
      .string()
      .describe(
        "Destination token address on the target chain. For EVM chains, use the ERC-20 contract address.",
      ),
    inputAmount: z
      .string()
      .describe(
        "Input amount in the source token's smallest unit (e.g., lamports for SOL — 1 SOL = 1000000000)",
      ),
    dstAddress: z
      .string()
      .describe(
        "Recipient address on the destination chain. Required for EVM destinations (0x…). For same-chain Solana swaps, use the agent wallet address if the recipient is the same.",
      ),
    slippageBps: z
      .number()
      .int()
      .min(1)
      .max(5000)
      .optional()
      .describe(
        "Slippage tolerance in basis points (e.g., 100 = 1%). Defaults to 100.",
      ),
    pollTimeoutMs: z
      .number()
      .int()
      .optional()
      .describe(
        "Maximum milliseconds to wait for the swap to be filled by a solver. Defaults to 480000 (8 minutes).",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const apiKey = agent.config?.SODAX_API_KEY as string | undefined;
      const srcAddress = agent.wallet.publicKey.toBase58();

      const result = await sodaxSwap(
        agent,
        {
          srcChainKey: input.srcChainKey,
          dstChainKey: input.dstChainKey,
          inputTokenAddress: input.inputTokenAddress,
          outputTokenAddress: input.outputTokenAddress,
          inputAmount: input.inputAmount,
          slippageBps: input.slippageBps,
          srcAddress,
          dstAddress: input.dstAddress,
          pollTimeoutMs: input.pollTimeoutMs,
        },
        apiKey,
      );

      if (result.status === "solved") {
        return {
          status: "success",
          result,
          message: "SODAX swap completed successfully",
        };
      }
      if (result.status === "timeout") {
        return {
          status: "success",
          result,
          message: `SODAX swap submitted (txHash: ${result.txHash}) but solver fill timed out. Check https://sodaxscan.com for status.`,
        };
      }
      return {
        status: "error",
        result,
        message: `SODAX swap failed: ${result.userMessage ?? "unknown error"}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to execute SODAX cross-chain swap: ${error.message}`,
      };
    }
  },
};

export default sodaxCrossChainSwapAction;
