import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import claimCreatorFee from "../tools/claimCreatorFee";

const claimCreatorFeeAction: Action = {
  name: "CLAIM_PUMPFUN_CREATOR_FEE",
  similes: [
    "claim pumpfun creator fee",
    "collect pumpfun fee",
    "get pumpfun creator earnings",
  ],
  description: "Claim the creator fee from a Pump.fun token.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully claimed creator fee on Pump.fun",
        },
        explanation: "Claim the creator fee for a token on Pump.fun",
      },
    ],
  ],
  schema: z.object({}), // No specific input needed for claiming fee beyond agent context
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await claimCreatorFee(agent);

      if ("signedTransaction" in result) {
        return {
          status: "success",
          transaction: result.signedTransaction,
          message: "Successfully prepared transaction to claim creator fee on Pump.fun. Please sign and send.",
        };
      } else if ("txHash" in result) {
        return {
          status: "success",
          signature: result.txHash,
          message: "Successfully claimed creator fee on Pump.fun",
        };
      } else {
        // Should not happen based on current claimCreatorFee tool implementation
        return {
            status: "error",
            message: "Claim creator fee action did not return a transaction or a hash."
        }
      }
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to claim creator fee: ${error.message}`,
      };
    }
  },
};

export default claimCreatorFeeAction;
