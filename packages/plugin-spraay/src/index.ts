/**
 * 💧 Spraay Plugin for Solana Agent Kit
 *
 * Adds batch payment capabilities to any Solana AI agent.
 * Send SOL or any SPL token to up to 1000 wallets in one call.
 *
 * Gateway: https://gateway-solana.spraay.app
 * x402 payment: $0.01 USDC per batch request
 *
 * @see https://spraay.app
 * @see https://github.com/plagtech/spraay-solana-gateway
 */

import { type Action, type Plugin, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";

const GATEWAY_URL = "https://gateway-solana.spraay.app";

// ── Actions ──

const batchSendSOLAction: Action = {
  name: "SPRAAY_BATCH_SEND_SOL",
  description:
    "Batch send SOL to multiple Solana wallets in a single request using Spraay. " +
    "Supports up to 1000 recipients. Auto-chunks into multiple transactions. " +
    "Requires x402 payment ($0.01 USDC per request).",
  similes: [
    "send SOL to multiple wallets",
    "batch transfer SOL",
    "airdrop SOL to addresses",
    "mass send SOL",
    "distribute SOL to recipients",
  ],
  schema: z.object({
    recipients: z
      .array(
        z.object({
          address: z.string().describe("Solana wallet address (base58)"),
          amount: z.number().positive().describe("Amount of SOL to send"),
        })
      )
      .min(1)
      .max(1000)
      .describe("Array of recipients with address and SOL amount"),
  }),
  handler: async (agent: SolanaAgentKit, params: any) => {
    const { recipients } = params;

    const response = await fetch(`${GATEWAY_URL}/solana/batch-send-sol`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients }),
    });

    if (response.status === 402) {
      const paymentInfo = await response.json();
      return {
        success: false,
        error: "x402 payment required",
        paymentInfo,
        instructions:
          "Send USDC on Solana to the payTo address, then retry with payment proof in X-PAYMENT header.",
      };
    }

    const data = await response.json();
    return data;
  },
};

const batchSendTokenAction: Action = {
  name: "SPRAAY_BATCH_SEND_TOKEN",
  description:
    "Batch send any SPL token (USDC, BONK, WIF, JUP, etc.) to multiple Solana wallets " +
    "using Spraay. Provide the token mint address. Auto-creates token accounts for recipients. " +
    "Supports up to 1000 recipients. Requires x402 payment ($0.01 USDC per request).",
  similes: [
    "send tokens to multiple wallets",
    "batch transfer SPL tokens",
    "airdrop tokens to addresses",
    "mass send USDC",
    "distribute BONK to recipients",
  ],
  schema: z.object({
    mint: z.string().describe("SPL token mint address (base58)"),
    recipients: z
      .array(
        z.object({
          address: z.string().describe("Solana wallet address (base58)"),
          amount: z
            .number()
            .positive()
            .describe("Amount of tokens to send (human-readable units)"),
        })
      )
      .min(1)
      .max(1000)
      .describe("Array of recipients with address and token amount"),
  }),
  handler: async (agent: SolanaAgentKit, params: any) => {
    const { mint, recipients } = params;

    const response = await fetch(`${GATEWAY_URL}/solana/batch-send-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint, recipients }),
    });

    if (response.status === 402) {
      const paymentInfo = await response.json();
      return {
        success: false,
        error: "x402 payment required",
        paymentInfo,
        instructions:
          "Send USDC on Solana to the payTo address, then retry with payment proof in X-PAYMENT header.",
      };
    }

    const data = await response.json();
    return data;
  },
};

const spraayQuoteAction: Action = {
  name: "SPRAAY_BATCH_QUOTE",
  description:
    "Get a cost estimate for a Spraay batch send on Solana. " +
    "Returns estimated network fees, number of transactions, and timing. " +
    "Requires x402 payment ($0.001 USDC).",
  similes: [
    "estimate batch send cost",
    "quote for batch transfer",
    "how much will batch send cost",
    "spraay quote",
  ],
  schema: z.object({
    recipients: z.number().positive().describe("Number of recipients"),
    token: z
      .string()
      .optional()
      .describe("Token symbol (SOL, USDC, BONK, etc.). Defaults to SOL."),
  }),
  handler: async (agent: SolanaAgentKit, params: any) => {
    const queryParams = new URLSearchParams({
      recipients: String(params.recipients),
    });
    if (params.token) queryParams.set("token", params.token);

    const response = await fetch(
      `${GATEWAY_URL}/solana/quote?${queryParams}`
    );

    if (response.status === 402) {
      const paymentInfo = await response.json();
      return {
        success: false,
        error: "x402 payment required",
        paymentInfo,
      };
    }

    const data = await response.json();
    return data;
  },
};

// ── Plugin ──

const SpraayPlugin: Plugin = {
  name: "spraay",
  methods: {},
  actions: [batchSendSOLAction, batchSendTokenAction, spraayQuoteAction],
};

export default SpraayPlugin;