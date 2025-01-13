import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { multisig_transfer_from_treasury } from "../../tools";
import { PublicKey } from "@solana/web3.js";

const transferFromMultisigAction: Action = {
  name: "TRANSFER_FROM_MULTISIG_ACTION",
  similes: [
    "transfer from multisig",
    "transfer from squads multisig",
    "transfer SOL from 2-by-2 multisig",
    "transfer from 2-of-2 multisig account",
    "transfer from 2-of-2 multisig account on Solana",
  ],
  description: `Create a transaction to transfer funds from a 2-of-2 multisig account on Solana using Squads with the user and the agent, where both approvals will be required to run the transactions.`,
  examples: [
    [
      {
        input: {
          amount: 1,
          recipient: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        output: {
          status: "success",
          message: "Transaction added to 2-by-2 multisig account successfully",
          transaction: "4xKpN2...",
          amount: "1",
          recipient: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        explanation: "Transfer 1 SOL from 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().min(0, "Amount must be greater than 0"),
    recipient: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const multisig = await multisig_transfer_from_treasury(
      agent,
      input.amount as number,
      new PublicKey(input.recipient as string),
    );

    return {
      status: "success",
      message: "Transaction added to 2-by-2 multisig account successfully",
      transaction: multisig,
      amount: input.amount,
      recipient: input.recipient,
    };
  },
};

export default transferFromMultisigAction;
