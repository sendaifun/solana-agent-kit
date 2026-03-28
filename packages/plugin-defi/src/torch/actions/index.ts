import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import {
  torchListTokens,
  torchGetToken,
  torchBuyToken,
  torchSellToken,
  torchStarToken,
  torchCreateToken,
  torchGetMessages,
  torchConfirm,
  torchGetLendingInfo,
  torchGetLoanPosition,
  torchBorrowToken,
  torchRepayLoan,
  torchLiquidateLoan,
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
    "List tokens on Torch Market - a fair-launch DAO launchpad on Solana with bonding curves, community treasuries, and democratic governance. Filter by status (bonding, complete, migrated) and sort by newest, volume, or marketcap.",
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
    sort: z.enum(["newest", "volume", "marketcap"]).optional().describe("Sort order"),
    limit: z.number().positive().max(100).optional().describe("Number of tokens to return"),
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
    "Get detailed information about a specific token on Torch Market, including price, progress, treasury state, vote counts, and creator SAID verification status.",
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
    "Buy tokens on Torch Market bonding curve. Specify amount in SOL. 10% of tokens go to community treasury, 90% to you. 1% protocol fee on buys. On your FIRST buy of a token you must include a vote ('burn' or 'return') for how the treasury should be handled at graduation. You can optionally include a message (max 500 chars) which will be bundled as an on-chain SPL Memo -- skin-in-the-game communication.",
  examples: [
    [
      {
        input: { mint: "ABC123...", amountSol: 0.1, vote: "burn" },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Bought tokens for 0.1 SOL (voted: burn)",
        },
        explanation: "First buy requires a vote -- vote burn to reduce supply at graduation",
      },
    ],
    [
      {
        input: { mint: "ABC123...", amountSol: 0.05, message: "Bullish on this project!" },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Bought tokens for 0.05 SOL with message",
        },
        explanation: "Subsequent buy with an on-chain message bundled in",
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
    vote: z
      .enum(["burn", "return"])
      .optional()
      .describe(
        "Treasury vote -- REQUIRED on first buy. 'burn' = destroy treasury tokens (deflationary), 'return' = add to Raydium LP",
      ),
    message: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Optional message to bundle as on-chain SPL Memo (max 500 chars). Skin-in-the-game: every message has a provable trade behind it.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const lamports = Math.floor(input.amountSol * 1e9);
      const bps = input.slippagePercent ? Math.floor(input.slippagePercent * 100) : 100;
      const signature = await torchBuyToken(
        agent,
        input.mint,
        lamports,
        bps,
        input.vote,
        input.message,
      );
      const parts = [`Bought tokens for ${input.amountSol} SOL`];
      if (input.vote) parts.push(`(voted: ${input.vote})`);
      if (input.message) parts.push("with message");
      return {
        status: "success",
        signature,
        message: parts.join(" "),
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
  similes: ["sell token on torch", "sell torch token", "exit torch position"],
  description:
    "Sell tokens back to Torch Market bonding curve. No sell fees. Specify amount in tokens. You can optionally include a message (max 500 chars) which will be bundled as an on-chain SPL Memo -- skin-in-the-game communication.",
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
    [
      {
        input: { mint: "ABC123...", amountTokens: 500000, message: "Taking profits, gl everyone" },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Sold 500K tokens with message",
        },
        explanation: "Sell tokens with an on-chain message bundled in",
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
    message: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Optional message to bundle as on-chain SPL Memo (max 500 chars). Skin-in-the-game: every message has a provable trade behind it.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const baseUnits = Math.floor(input.amountTokens * 1e6);
      const bps = input.slippagePercent ? Math.floor(input.slippagePercent * 100) : 100;
      const signature = await torchSellToken(agent, input.mint, baseUnits, bps, input.message);
      const parts = [`Sold ${input.amountTokens.toLocaleString()} tokens`];
      if (input.message) parts.push("with message");
      return {
        status: "success",
        signature,
        message: parts.join(" "),
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Sell failed: ${error.message}`,
      };
    }
  },
};

export const torchStarTokenAction: Action = {
  name: "TORCH_STAR_TOKEN",
  similes: ["star torch token", "support torch token", "like token on torch"],
  description:
    "Star a token on Torch Market to signal sybil-resistant support (costs 0.05 SOL). When tokens reach 2000 stars, creators receive the accumulated ~100 SOL.",
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

export const torchCreateTokenAction: Action = {
  name: "TORCH_CREATE_TOKEN",
  similes: [
    "create token on torch",
    "launch token on torch",
    "create my own token",
    "make a torch token",
    "deploy token to torch market",
  ],
  description:
    "Launch a new community on Torch Market with automatic bonding curve, community treasury, governance vote, and Raydium migration. Every token is a DAO seed. You need to provide a metadata_uri pointing to a JSON file with name, symbol, description, and image URL.",
  examples: [
    [
      {
        input: {
          name: "My Agent Token",
          symbol: "MAT",
          metadataUri: "https://arweave.net/abc123",
        },
        output: {
          status: "success",
          signature: "5xKp...",
          mint: "NEW_MINT_ADDRESS",
          message: "Created token My Agent Token ($MAT)",
        },
        explanation: "Create a new token with bonding curve",
      },
    ],
  ],
  schema: z.object({
    name: z.string().max(32).describe("Token name (max 32 characters)"),
    symbol: z.string().max(10).describe("Token symbol (max 10 characters)"),
    metadataUri: z
      .string()
      .url()
      .describe("URI pointing to token metadata JSON with name, symbol, description, and image"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await torchCreateToken(agent, input.name, input.symbol, input.metadataUri);
      return {
        status: "success",
        signature: result.signature,
        mint: result.mint,
        message: `Created token ${input.name} ($${input.symbol})`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Create token failed: ${error.message}`,
      };
    }
  },
};

export const torchGetMessagesAction: Action = {
  name: "TORCH_GET_MESSAGES",
  similes: [
    "get torch messages",
    "read torch messages",
    "see messages on torch",
    "what are agents saying on torch",
    "read token chat",
  ],
  description:
    "Get messages from a token's page on Torch Market. Messages are bundled with trades, so every message has a provable buy or sell behind it. Use this to read what agents and humans are saying and verify their positions.",
  examples: [
    [
      {
        input: { mint: "ABC123...", limit: 20 },
        output: {
          status: "success",
          messages: [{ memo: "Hello from an AI!", sender: "5xKp...", timestamp: 1234567890 }],
          count: 1,
        },
        explanation: "Read the last 20 messages on a token's page",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    limit: z
      .number()
      .positive()
      .max(100)
      .optional()
      .describe("Number of messages to return (default 50, max 100)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const messages = await torchGetMessages(agent, input.mint, input.limit);
      return {
        status: "success",
        messages,
        count: messages.length,
        message: `Found ${messages.length} messages`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get messages: ${error.message}`,
      };
    }
  },
};

export const torchConfirmAction: Action = {
  name: "TORCH_CONFIRM",
  similes: [
    "confirm torch transaction",
    "report torch transaction",
    "torch reputation",
    "said reputation torch",
  ],
  description:
    "Report a successful Torch Market transaction to SAID Protocol for reputation. Call this after any confirmed transaction to build your trust score: token launch (+15), trade (+5), governance vote (+10). Requires SAID registration.",
  examples: [
    [
      {
        input: { signature: "5xKp..." },
        output: {
          status: "success",
          event_type: "trade_complete",
          feedback_sent: true,
          message: "Transaction confirmed, +5 reputation",
        },
        explanation: "Confirm a trade for SAID reputation points",
      },
    ],
  ],
  schema: z.object({
    signature: z.string().describe("Transaction signature to confirm"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await torchConfirm(agent, input.signature);
      const points: Record<string, number> = {
        token_launch: 15,
        trade_complete: 5,
        governance_vote: 10,
      };
      const earned = points[result.event_type] || 0;
      return {
        status: "success",
        confirmed: result.confirmed,
        event_type: result.event_type,
        feedback_sent: result.feedback_sent,
        message: `Transaction confirmed, +${earned} reputation`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Confirm failed: ${error.message}`,
      };
    }
  },
};

// ============================================================================
// Treasury Lending Actions
// ============================================================================

export const torchGetLendingInfoAction: Action = {
  name: "TORCH_GET_LENDING_INFO",
  similes: [
    "torch lending info",
    "check torch lending",
    "is lending enabled on torch",
    "torch treasury lending rates",
  ],
  description:
    "Get lending state for a migrated Torch token. Returns interest rates, LTV limits, utilization, and active loan count. Lending is always enabled on migrated tokens.",
  examples: [
    [
      {
        input: { mint: "ABC123..." },
        output: {
          status: "success",
          interest_rate_bps: 200,
          max_ltv_bps: 5000,
          active_loans: 3,
        },
        explanation: "Get current lending rates and utilization",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const info = await torchGetLendingInfo(agent, input.mint);
      return {
        status: "success",
        ...info,
        message: `Lending active: ${info.interest_rate_bps / 100}% per epoch, ${info.active_loans} loans, ${(info.total_sol_lent / 1e9).toFixed(2)} SOL lent`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get lending info: ${error.message}`,
      };
    }
  },
};

export const torchGetLoanAction: Action = {
  name: "TORCH_GET_LOAN",
  similes: [
    "torch loan position",
    "check my torch loan",
    "torch loan health",
    "am I liquidatable on torch",
  ],
  description:
    "Get loan position details for a wallet on a Torch token. Shows collateral locked, SOL owed, accrued interest, current LTV, and health status (healthy/at_risk/liquidatable/none).",
  examples: [
    [
      {
        input: { mint: "ABC123..." },
        output: {
          status: "success",
          health: "healthy",
          current_ltv_bps: 4020,
          total_owed: 1005000000,
        },
        explanation: "Check your loan position health",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    wallet: z.string().optional().describe("Wallet to check (defaults to your wallet)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const position = await torchGetLoanPosition(agent, input.mint, input.wallet);
      if (position.health === "none") {
        return {
          status: "success",
          ...position,
          message: "No active loan position",
        };
      }
      return {
        status: "success",
        ...position,
        message: `Loan: ${(position.total_owed / 1e9).toFixed(4)} SOL owed, LTV ${(position.current_ltv_bps / 100).toFixed(1)}%, ${position.health}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get loan position: ${error.message}`,
      };
    }
  },
};

export const torchBorrowAction: Action = {
  name: "TORCH_BORROW",
  similes: [
    "borrow sol on torch",
    "torch treasury borrow",
    "lock tokens borrow sol",
    "leverage torch tokens",
  ],
  description:
    "Borrow SOL from a Torch token's treasury using tokens as collateral. Lock tokens in the collateral vault and receive SOL up to 50% of collateral value (max LTV). Token must be migrated and lending must be enabled. Note: 1% Token-2022 fee applies on collateral deposit.",
  examples: [
    [
      {
        input: { mint: "ABC123...", collateralTokens: 50000, solToBorrow: 1 },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Borrowed 1 SOL with 50000 tokens as collateral",
        },
        explanation: "Lock 50,000 tokens and borrow 1 SOL",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    collateralTokens: z
      .number()
      .min(0)
      .describe(
        "Tokens to lock as collateral (in whole tokens, not base units). Can be 0 if adding debt to existing position.",
      ),
    solToBorrow: z.number().min(0).describe("SOL to borrow. Can be 0 if just adding collateral."),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const collateralBaseUnits = Math.floor(input.collateralTokens * 1e6);
      const borrowLamports = Math.floor(input.solToBorrow * 1e9);
      const signature = await torchBorrowToken(
        agent,
        input.mint,
        collateralBaseUnits,
        borrowLamports,
      );
      return {
        status: "success",
        signature,
        message: `Borrowed ${input.solToBorrow} SOL with ${input.collateralTokens.toLocaleString()} tokens as collateral`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Borrow failed: ${error.message}`,
      };
    }
  },
};

export const torchRepayAction: Action = {
  name: "TORCH_REPAY",
  similes: [
    "repay torch loan",
    "pay back torch borrow",
    "close torch loan",
    "return borrowed sol torch",
  ],
  description:
    "Repay borrowed SOL on Torch Market. Interest is paid first, then principal. If you repay the full amount owed, all collateral tokens are returned to your wallet. Partial repay reduces debt but collateral stays locked.",
  examples: [
    [
      {
        input: { mint: "ABC123...", solAmount: 1.05 },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Repaid 1.05 SOL",
        },
        explanation: "Repay 1.05 SOL of borrowed debt",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    solAmount: z.number().positive().describe("SOL to repay"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const lamports = Math.floor(input.solAmount * 1e9);
      const signature = await torchRepayLoan(agent, input.mint, lamports);
      return {
        status: "success",
        signature,
        message: `Repaid ${input.solAmount} SOL`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Repay failed: ${error.message}`,
      };
    }
  },
};

export const torchLiquidateAction: Action = {
  name: "TORCH_LIQUIDATE",
  similes: ["liquidate torch loan", "torch liquidation", "liquidate underwater position torch"],
  description:
    "Liquidate an underwater loan position on Torch Market. Permissionless -- anyone can call when a borrower's LTV exceeds 65%. You pay SOL to the treasury and receive collateral tokens at a 10% bonus (profitable keeper operation).",
  examples: [
    [
      {
        input: { mint: "ABC123...", borrower: "BORROWER_WALLET..." },
        output: {
          status: "success",
          signature: "5xKp...",
          message: "Liquidated position, received collateral + 10% bonus",
        },
        explanation: "Liquidate an underwater loan for profit",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().describe("Token mint address"),
    borrower: z.string().describe("Wallet address of the borrower to liquidate"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await torchLiquidateLoan(agent, input.mint, input.borrower);
      return {
        status: "success",
        signature,
        message: "Liquidated position, received collateral + 10% bonus",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Liquidation failed: ${error.message}`,
      };
    }
  },
};
