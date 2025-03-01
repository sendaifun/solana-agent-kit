import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { submitFeeClaim } from "../../tools";
import { Action } from "../../types";

// Fee Claim Action
const SubmitFeeClaimAction: Action = {
  name: "SUBMIT_FEE_CLAIM_ACTION",
  similes: [
    "claim all the fees from the token mint",
    "claim fees from mint",
    "collect fees from mint",
    "withdraw fees from mint",
  ],
  description: `Claims accumulated token fees. 
  If no payer is provided, then our wallet address is the payer, 
  `,
  examples: [
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
          payer: "JANiiyQqkoH5RqQAhZzQTE4aDWbWobaXv9V9pnxqSGjy",
        },
        output: {
          status: "success",
          signature:
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
        },
        explanation: "Claim accumulated fees for a token mint",
      },
    ],
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
        },
        output: {
          status: "success",
          signature:
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
        },
        explanation: "Claim accumulated fees for a token mint wi",
      },
    ],
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
          payer: "JANiiyQqkoH5RqQAhZzQTE4aDWbWobaXv9V9pnxqSGjy",
        },
        output: {
          status: "success",
          signature:
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
        },
        explanation: "Claim accumulated fees for a token mint",
      },
    ],
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
        },
        output: {
          status: "success",
          signature:
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
        },
        explanation: "Claim accumulated fees for a token mint",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    payer: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await submitFeeClaim(
        agent,
        new PublicKey(input.mint),
        new PublicKey(input.payer),
      );
      return {
        status: "success",
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to claim fees: ${error.message}`,
      };
    }
  },
};

export default SubmitFeeClaimAction;
