import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base64js from "base64-js";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { RANGER_SOR_API_BASE } from "../index";

export const withdrawCollateralSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  collateral: z.number().positive(),
  collateral_denomination: z.literal("USDC"),
  adjustment_type: z.enum([
    "WithdrawCollateralFlash",
    "WithdrawCollateralJupiter",
    "WithdrawCollateralDrift",
  ]),
});

export type WithdrawCollateralInput = z.infer<typeof withdrawCollateralSchema>;

interface WithdrawCollateralContext {
  apiKey: string;
}

export const withdrawCollateralAction: Action = {
  name: "WITHDRAW_COLLATERAL",
  similes: ["withdraw collateral", "remove margin", "remove funds"],
  description:
    "Withdraw collateral from a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          collateral: 50.0,
          collateral_denomination: "USDC",
          adjustment_type: "WithdrawCollateralFlash",
        },
        output: { signature: "...", meta: { venues: [] } },
        explanation:
          "Withdraw 50 USDC collateral from a long SOL position via Flash.",
      },
    ],
  ],
  schema: withdrawCollateralSchema,
  handler: async (
    agent: SolanaAgentKit,
    input: WithdrawCollateralInput,
    { apiKey }: WithdrawCollateralContext,
  ) => {
    const response = await fetch(
      `${RANGER_SOR_API_BASE}/v1/withdraw_collateral`,
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
      throw new Error(`Withdraw collateral request failed: ${error.message}`);
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
