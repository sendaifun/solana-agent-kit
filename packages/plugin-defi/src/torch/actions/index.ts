import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import {
  torchListTokens,
  torchGetToken,
  torchBuyToken,
  torchSellToken,
  torchVoteToken,
  torchStarToken,
} from "../tools";

export const torchListTokensAction: Action = {
  name: "TORCH_LIST_TOKENS",
  similes: [
    "list torch tokens",
    "browse torch market",
    "find bonding curve tokens",
    "show torch launchpad tokens",
    "what tokens are on torch market",
  ],
  description:
    "List tokens on Torch Market - a fair-launch platform with bonding curves and community treasuries. Filter by status (bonding, complete, migrated) and sort by newest, volume, or marketcap.",
  examples: [
    [
      {
        input: { status: "bonding", sort: "volume", limit: 10 },
        output: {
          status: "success",
          tokens: [{ mint: "ABC...", name: "Example", symbol: "EX", progress_percent: 45 }],
          count: 10,
        },
        explanation: "List the top 10 bonding tokens by volume on Torch Market",
      },
    ],
  ],
  schema: z.object({
    status: z
      .enum(["bonding", "complete", "migrated", "all"])
      .optional()
      .describe("Filter by token status"),
    sort: z
      .enum(["newest", "volume", "marketcap"])
      .optional()
      .describe("Sort order"),
    limit: z
      .number()
      .positive()
      .max(100)
      .optional()
      .describe("Number of tokens to return"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tokens = await torchListTokens(agent, input.status, input.sort, input.limit);
      return {
        status: "success",
        tokens,
        count: tokens.length,
        message: `Found ${tokens.length} tokens on Torch Market`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list tokens: ${error.message}`,
      };
    }
  },
};

export const torchGetTokenAction: Action = {
  name: "TORCH_GET_TOKEN",
  similes: [
    "get torch token info",
    "torch token details",
    "check torch token",
    "lookup token on torch",
  ],
  description:
    "Get detailed information about a specific token on Torch Market, including price, progress, treasury state, and vote counts.",
  examples: [
    [
      {
        input: { mint: "ABC123..." },
        output: {
          status: "success",
          token: { name: "Example", symbol: "EX", progress_percent: 45, votes_burn: 100 },
        },
        explanation: "Get details for a specific Torch token",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const token = await torchGetToken(agent, input.mint);
      return {
        status: "success",
        token,
        message: `${token.name} (${token.symbol}) - ${token.progress_percent.toFixed(1)}% complete`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token: ${error.message}`,
      };
    }
  },
};

export const torchBuyTokenAction: Action = {
  name: "TORCH_BUY_TOKEN",
  similes: [
    "buy token on torch",
    "purchase torch token",
    "buy on torch market",
    "invest in torch token",
  ],
  description:
    "Buy tokens on Torch Market bonding curve. Specify amount in SOL. 10% of tokens go to community treasury, 90% to you. 1% protocol fee on buys.",
  examples: [
    [
      {
        input: { mint: "ABC123...", amountSol: 0.1 },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Bought tokens for 0.1 SOL",
        },
        explanation: "Buy tokens with 0.1 SOL on Torch Market",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    amountSol: z.number().positive().describe("Amount of SOL to spend"),
    slippagePercent: z
      .number()
      .positive()
      .max(50)
      .optional()
      .describe("Slippage tolerance as percentage (default 1%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const lamports = Math.floor(input.amountSol * 1e9);
      const bps = input.slippagePercent ? Math.floor(input.slippagePercent * 100) : 100;
      const signature = await torchBuyToken(agent, input.mint, lamports, bps);
      return {
        status: "success",
        signature,
        message: `Bought tokens for ${input.amountSol} SOL`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Buy failed: ${error.message}`,
      };
    }
  },
};

export const torchSellTokenAction: Action = {
  name: "TORCH_SELL_TOKEN",
  similes: [
    "sell token on torch",
    "sell torch token",
    "exit torch position",
  ],
  description:
    "Sell tokens back to Torch Market bonding curve. No sell fees. Specify amount in tokens.",
  examples: [
    [
      {
        input: { mint: "ABC123...", amountTokens: 1000000 },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Sold 1M tokens",
        },
        explanation: "Sell 1M tokens back to the bonding curve",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    amountTokens: z.number().positive().describe("Amount of tokens to sell"),
    slippagePercent: z
      .number()
      .positive()
      .max(50)
      .optional()
      .describe("Slippage tolerance as percentage (default 1%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const baseUnits = Math.floor(input.amountTokens * 1e6);
      const bps = input.slippagePercent ? Math.floor(input.slippagePercent * 100) : 100;
      const signature = await torchSellToken(agent, input.mint, baseUnits, bps);
      return {
        status: "success",
        signature,
        message: `Sold ${input.amountTokens.toLocaleString()} tokens`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Sell failed: ${error.message}`,
      };
    }
  },
};

export const torchVoteTokenAction: Action = {
  name: "TORCH_VOTE_TOKEN",
  similes: [
    "vote on torch token",
    "torch treasury vote",
    "vote burn torch",
    "vote return torch",
  ],
  description:
    "Vote on treasury outcome for a graduated Torch token. After reaching 200 SOL, holders vote: 'burn' destroys treasury tokens (reducing supply), 'return' gives them to the creator. You must hold the token to vote.",
  examples: [
    [
      {
        input: { mint: "ABC123...", vote: "burn" },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Voted to burn treasury tokens",
        },
        explanation: "Vote to burn the community treasury tokens",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    vote: z
      .enum(["burn", "return"])
      .describe("'burn' = destroy treasury tokens, 'return' = give to creator"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await torchVoteToken(agent, input.mint, input.vote);
      const desc = input.vote === "burn" ? "burn treasury tokens" : "return tokens to creator";
      return {
        status: "success",
        signature,
        vote: input.vote,
        message: `Voted to ${desc}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Vote failed: ${error.message}`,
      };
    }
  },
};

export const torchStarTokenAction: Action = {
  name: "TORCH_STAR_TOKEN",
  similes: [
    "star torch token",
    "support torch token",
    "like token on torch",
  ],
  description:
    "Star a token on Torch Market to show support (costs 0.05 SOL). When tokens reach the star threshold, creators receive rewards.",
  examples: [
    [
      {
        input: { mint: "ABC123..." },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Starred token for 0.05 SOL",
        },
        explanation: "Star a token to show support",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address to star"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await torchStarToken(agent, input.mint);
      return {
        status: "success",
        signature,
        cost: 0.05,
        message: "Starred token (cost: 0.05 SOL)",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Star failed: ${error.message}`,
      };
    }
  },
};
