import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { transfer } from "../../tools";

const transferAction: Action = {
  name: "TRANSFER",
  similes: [
    "send tokens",
    "transfer funds",
    "send money",
    "send sol",
    "transfer tokens",
  ],
  description: `Transfer tokens or SOL to another address (also called as wallet address).`,
  examples: [
    [
      {
        input: {
          to: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          amount: 1,
        },
        output: {
          status: "success",
          message: "Transfer completed successfully",
          amount: 1,
          recipient: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          token: "SOL",
          transaction:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Transfer 1 SOL to the recipient address",
      },
    ],
    [
      {
        input: {
          to: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          amount: 100,
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          message: "Transfer completed successfully",
          amount: 100,
          recipient: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          transaction:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Transfer 100 USDC tokens to the recipient address",
      },
    ],
  ],
  schema: z.object({
    to: z.string().min(32, "Invalid Solana address"),
    amount: z.number().positive("Amount must be positive"),
    mint: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const recipient = new PublicKey(input.to);
    const mintAddress = input.mint ? new PublicKey(input.mint) : undefined;

    const tx = await transfer(agent, recipient, input.amount, mintAddress);

    return {
      status: "success",
      message: "Transfer completed successfully",
      amount: input.amount,
      recipient: input.to,
      token: input.mint || "SOL",
      transaction: tx,
    };
  },
};

export default transferAction;
