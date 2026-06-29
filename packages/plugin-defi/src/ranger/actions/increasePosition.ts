import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base64js from "base64-js";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { RANGER_SOR_API_BASE } from "../index";

export const increasePositionSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  size: z.number().positive(),
  collateral: z.number().positive(),
  size_denomination: z.string(),
  collateral_denomination: z.literal("USDC"),
  adjustment_type: z.literal("Increase"),
  target_venues: z.array(z.enum(["Jupiter", "Flash", "Drift"])).optional(),
  slippage_bps: z.number().int().optional(),
  priority_fee_micro_lamports: z.number().int().optional(),
  expected_price: z.number().optional(),
});

export type IncreasePositionInput = z.infer<typeof increasePositionSchema>;

interface IncreasePositionContext {
  apiKey: string;
}

export const increasePositionAction: Action = {
  name: "INCREASE_POSITION",
  similes: ["open position", "increase position", "long perp", "short perp"],
  description: "Open or increase a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          size: 1.0,
          collateral: 10.0,
          size_denomination: "SOL",
          collateral_denomination: "USDC",
          adjustment_type: "Increase",
        },
        output: { message: "...", meta: { venues: [] } },
        explanation: "Open a long SOL position.",
      },
    ],
  ],
  schema: increasePositionSchema,
  handler: async (
    agent: SolanaAgentKit,
    input: IncreasePositionInput,
    { apiKey }: IncreasePositionContext,
  ) => {
    const response = await fetch(
      `${RANGER_SOR_API_BASE}/v1/increase_position`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Increase position request failed: ${error.message}`);
    }
    const data = await response.json();
    const messageBase64 = data.message;
    const messageBytes = base64js.toByteArray(messageBase64);
    const transactionMessage = TransactionMessage.deserialize(messageBytes);
    const transaction = new VersionedTransaction(transactionMessage);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.message.recentBlockhash = blockhash;
    const signature = await agent.wallet.signAndSendTransaction(
      transaction,
      agent.connection,
    );
    return { signature, meta: data.meta };
  },
};
