import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base64js from "base64-js";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { RANGER_SOR_API_BASE } from "../index";

export const withdrawBalanceSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  amount: z.number().positive(),
  sub_account_id: z.number().int().optional(),
  adjustment_type: z.literal("WithdrawBalanceDrift"),
});

export type WithdrawBalanceInput = z.infer<typeof withdrawBalanceSchema>;

interface WithdrawBalanceContext {
  apiKey: string;
}

export const withdrawBalanceAction: Action = {
  name: "WITHDRAW_BALANCE",
  similes: ["withdraw balance", "withdraw funds", "withdraw drift"],
  description:
    "Withdraw available balance from a Drift account using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "USDC",
          amount: 100.0,
          sub_account_id: 0,
          adjustment_type: "WithdrawBalanceDrift",
        },
        output: {
          signature: "...",
          meta: { venue: "Drift", amount: 100.0, symbol: "USDC" },
        },
        explanation: "Withdraw 100 USDC from Drift.",
      },
    ],
  ],
  schema: withdrawBalanceSchema,
  handler: async (
    agent: SolanaAgentKit,
    input: WithdrawBalanceInput,
    { apiKey }: WithdrawBalanceContext,
  ) => {
    const response = await fetch(`${RANGER_SOR_API_BASE}/v1/withdraw_balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Withdraw balance request failed: ${error.message}`);
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
