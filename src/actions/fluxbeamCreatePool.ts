import { PublicKey } from "@solana/web3.js";
import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { createPoolFluxBeam } from "../tools";

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
          tokenA: "So11111111111111111111111111111111111111112",
          tokenAAmount: 1,
          tokenB: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenBAmount: 1000,
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
          tokenA: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenAAmount: 1000,
          tokenB: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
          tokenBAmount: 1000,
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
    [
      {
        input: {
          tokenA: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenAAmount: 1000,
          tokenB: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx",
          tokenBAmount: 1000,
        },
        output: {
          status: "error",
          message: "Balance is not enough to create pool",
        },
        explanation: "There isn't enough balance to create a new pool",
      },
    ],
  ],
  schema: z.object({
    tokenA: z.string().min(32, "Token A mint address is too short"),
    tokenAAmount: z.number().positive("Token A amount must be positive"),
    tokenB: z.string().min(32, "Token B mint address is too short"),
    tokenBAmount: z.number().positive("Token B amount must be positive"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    return await createFluxBeamPoolHandler(agent, input);
  },
};

// Modularized pool creation logic
const createFluxBeamPoolHandler = async (
  agent: SolanaAgentKit,
  input: Record<string, any>,
) => {
  try {
    const tx = await createPoolFluxBeam(
      agent,
      new PublicKey(input.tokenA),
      input.token_a_amount,
      new PublicKey(input.tokenB),
      input.token_b_amount,
    );
    return {
      status: "success",
      message: "Pool created successfully on FluxBeam",
      transaction: tx,
      token_a: input.tokenA,
      token_a_amount: input.tokenAAmount,
      token_b: input.tokenB,
      token_b_amount: input.tokenBAmount,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: `FluxBeam pool creation failed: ${error.message}`,
      error: error.message,
    };
  }
};

export default fluxbeamCreatePoolAction;
