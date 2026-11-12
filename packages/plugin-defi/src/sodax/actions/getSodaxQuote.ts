import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getSodaxQuote } from "../tools";

const getSodaxQuoteAction: Action = {
  name: "SODAX_GET_QUOTE",
  description:
    "Get a firm quote from SODAX for swapping tokens, including cross-chain swaps. Returns the expected output amount for the given input.",
  similes: [
    "get sodax quote",
    "sodax swap quote",
    "how much will i get from sodax",
    "sodax cross-chain quote",
    "sodax price quote",
    "estimate sodax swap output",
  ],
  examples: [
    [
      {
        input: {
          tokenSrc: "11111111111111111111111111111111",
          tokenSrcChainKey: "solana",
          tokenDst: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenDstChainKey: "solana",
          amount: "1000000000",
        },
        output: {
          status: "success",
          quote: {
            quotedAmount: "147000000",
            quoteType: "exact_input",
          },
          message: "Quote: 1 SOL → ~147 USDC on Solana",
        },
        explanation: "Get a quote for swapping 1 SOL to USDC on Solana",
      },
    ],
    [
      {
        input: {
          tokenSrc: "11111111111111111111111111111111",
          tokenSrcChainKey: "solana",
          tokenDst: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          tokenDstChainKey: "0x2105.base",
          amount: "1000000000",
        },
        output: {
          status: "success",
          quote: {
            quotedAmount: "146000000",
            quoteType: "exact_input",
          },
          message: "Quote: 1 SOL → ~146 USDC on Base",
        },
        explanation: "Get a quote for swapping 1 SOL to USDC on Base",
      },
    ],
  ],
  schema: z.object({
    tokenSrc: z.string().describe("Source token address on the source chain"),
    tokenSrcChainKey: z.string().describe('Source chain key (e.g., "solana")'),
    tokenDst: z
      .string()
      .describe("Destination token address on the destination chain"),
    tokenDstChainKey: z
      .string()
      .describe(
        'Destination chain key (e.g., "solana", "0x2105.base", "ethereum")',
      ),
    amount: z
      .string()
      .describe(
        "Input amount in the source token's smallest unit (e.g., lamports for SOL)",
      ),
    quoteType: z
      .enum(["exact_input", "exact_output"])
      .optional()
      .describe('Quote type: "exact_input" (default) or "exact_output"'),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const apiKey = agent.config?.SODAX_API_KEY as string | undefined;
      const quote = await getSodaxQuote(
        {
          tokenSrc: input.tokenSrc,
          tokenSrcChainKey: input.tokenSrcChainKey,
          tokenDst: input.tokenDst,
          tokenDstChainKey: input.tokenDstChainKey,
          amount: input.amount,
          quoteType: input.quoteType ?? "exact_input",
        },
        apiKey,
      );
      return {
        status: "success",
        quote,
        message: `SODAX quote received: ${input.amount} (${input.tokenSrcChainKey}) → ${quote.quotedAmount} (${input.tokenDstChainKey}), in base units of each token`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get SODAX quote: ${error.message}`,
      };
    }
  },
};

export default getSodaxQuoteAction;
