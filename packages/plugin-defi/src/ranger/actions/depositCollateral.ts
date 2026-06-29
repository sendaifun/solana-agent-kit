import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base64js from "base64-js";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { RANGER_SOR_API_BASE } from "../index";

export const depositCollateralSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  collateral: z.number().positive(),
  collateral_denomination: z.literal("USDC"),
  adjustment_type: z.enum([
    "DepositCollateralFlash",
    "DepositCollateralJupiter",
    "DepositCollateralDrift",
  ]),
});

export type DepositCollateralInput = z.infer<typeof depositCollateralSchema>;

interface DepositCollateralContext {
  apiKey: string;
}

export const depositCollateralAction: Action = {
  name: "DEPOSIT_COLLATERAL",
  similes: ["deposit collateral", "add margin", "add funds"],
  description:
    "Deposit collateral to a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          collateral: 100.0,
          collateral_denomination: "USDC",
          adjustment_type: "DepositCollateralFlash",
        },
        output: { signature: "...", meta: { venues: [] } },
        explanation:
          "Deposit 100 USDC collateral to a long SOL position via Flash.",
      },
    ],
  ],
  schema: depositCollateralSchema,
  handler: async (
    agent: SolanaAgentKit,
    input: DepositCollateralInput,
    { apiKey }: DepositCollateralContext,
  ) => {
    const response = await fetch(
      `${RANGER_SOR_API_BASE}/v1/deposit_collateral`,
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
      throw new Error(`Deposit collateral request failed: ${error.message}`);
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
