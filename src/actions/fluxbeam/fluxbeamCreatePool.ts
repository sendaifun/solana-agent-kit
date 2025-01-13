import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { createPoolFluxBeam } from "../../tools";

const fluxbeamCreatePoolAction: Action = {
  name: "FLUXBEAM_CREATE_POOL",
  similes: [
    "create liquidity pool on fluxbeam",
    "add new pool to fluxbeam",
    "initialize fluxbeam pool",
    "setup trading pair on fluxbeam",
    "create token pair pool",
  ],
  description: `This tool allows you to create a new liquidity pool on FluxBeam DEX with two tokens.`,
  examples: [
    [
      {
        input: {
          token_a: "So11111111111111111111111111111111111111112",
          token_a_amount: 1,
          token_b: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_b_amount: 1000,
        },
        output: {
          status: "success",
          message: "Pool created successfully on FluxBeam",
          transaction:
            "4KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          token_a: "SOL",
          token_a_amount: 1,
          token_b: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_b_amount: 1000,
        },
        explanation: "Create a new SOL-USDC pool with 1 SOL and 1000 USDC",
      },
    ],
    [
      {
        input: {
          token_a: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_a_amount: 1000,
          token_b: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
          token_b_amount: 1000,
        },
        output: {
          status: "success",
          message: "Pool created successfully on FluxBeam",
          transaction:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          token_a: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_a_amount: 1000,
          token_b: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
          token_b_amount: 1000,
        },
        explanation: "Create a new USDC-USDT pool with 1000 USDC and 1000 USDT",
      },
    ],
  ],
  schema: z.object({
    token_a: z.string().min(32, "Invalid token_a mint address"),
    token_a_amount: z.number().positive("Token A amount must be positive"),
    token_b: z.string().min(32, "Invalid token_b mint address"),
    token_b_amount: z.number().positive("Token B amount must be positive"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tx = await createPoolFluxBeam(
        agent,
        new PublicKey(input.token_a),
        input.token_a_amount,
        new PublicKey(input.token_b),
        input.token_b_amount,
      );

      return {
        status: "success",
        message: "Pool created successfully on FluxBeam",
        transaction: tx,
        token_a: input.token_a,
        token_a_amount: input.token_a_amount,
        token_b: input.token_b,
        token_b_amount: input.token_b_amount,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `FluxBeam pool creation failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default fluxbeamCreatePoolAction;
