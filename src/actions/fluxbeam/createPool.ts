import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { fluxBeamCreatePool } from "../../tools";

const fluxbeamCreatePoolAction: Action = {
  name: "FLUXBEAM_CREATE_POOL_ACTION",
  similes: [
    "create fluxbeam liquidity pool",
    "start fluxbeam pool",
    "initialize pool",
    "create new fluxbeam trading pool",
    "setup fluxbeam token pool",
    "add new pool to fluxbeam",
    "create token pair pool on fluxbeam",
  ],
  description: `Creates a new liquidity pool on Fluxbeam with two tokens.
  Specify the token addresses and initial amounts to provide liquidity.`,
  examples: [
    [
      {
        input: {
          token_a: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_a_amount: 5,
          token_b: "So11111111111111111111111111111111111111112",
          token_b_amount: 5000,
        },
        output: {
          status: "success",
          message: "Pool created successfully on FluxBeam",
          transaction:
            "4KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          token_a: "SOL",
          token_a_amount: 5,
          token_b: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_b_amount: 5000,
        },
        explanation: "Create a new USDC-SOL pool with 5 SOL and 5000 USDC",
      },
    ],
    [
      {
        input: {
          tokenA: "USDC",
          tokenAamount: 5,
          tokenB: "SOL",
          tokenBamount: 5000,
        },
        output: {
          status: "success",
          message: "Pool created successfully on FluxBeam",
          transaction:
            "4KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          tokenA: "SOL",
          tokenAamount: 5,
          tokenB: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenBamount: 5000,
        },
        explanation: "Create a new USDC-SOL pool with 5 SOL and 5000 USDC",
      },
    ],
    [
      {
        input: {
          token_a: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_a_amount: 5,
          token_b: "So11111111111111111111111111111111111111112",
          token_b_amount: 5000,
        },
        output: {
          status: "success",
          message: "Pool created successfully on FluxBeam",
          transaction:
            "4KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          token_a: "SOL",
          token_a_amount: 5,
          token_b: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          token_b_amount: 5000,
        },
        explanation: "Create a new USDC-SOL pool with 5 SOL and 5000 USDC",
      },
    ],
  ],
  schema: z.object({
    tokenA: z.string(),
    tokenAamount: z.number().positive("Token A amount must be positive"),
    tokenB: z.string(),
    tokenBamount: z.number().positive("Token B amount must be positive"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await fluxBeamCreatePool(
        agent,
        new PublicKey(input.tokenA),
        input.token_a_amount,
        new PublicKey(input.tokenB),
        input.token_b_amount,
      );

      return {
        status: "success",
        message: "Pool created successfully on FluxBeam",
        tx: txSignature,
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
