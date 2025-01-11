import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { z } from "zod";
import { delegateVotingPower } from "../../tools";
import { SolanaAgentKit } from "../../agent";

const delegateVotingPowerAction: Action = {
  name: "DELEGATE_GOVERNANCE_VOTING",
  similes: [
    "delegate governance votes",
    "assign voting delegate",
    "transfer voting rights",
    "set voting delegate",
    "delegate dao voting power",
  ],
  description: `Delegate voting power to another wallet in a governance realm.
   
    Inputs ( input is a JSON string ):
    realm: string, eg "7nxQB..." (required) - The public key of the realm
    governingTokenMint: string, eg "8x2dR..." (required) - The mint of the governing token
    delegate: string, eg "9aUn5..." (required) - The wallet address to delegate voting power to`,

  examples: [
    [
      {
        input: {
          realm: "7nxQB1nGrqk8WKXeFDR6ZUaQtYjV7HMsAGWgwtGHwmQU",
          governingTokenMint: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          delegate: "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
        },
        output: {
          status: "success",
          message: "Successfully delegated voting power",
          signature: "2GjfL3N9E4cHp7WhDZRkx7oF2J9m3Sf5hT6zRHcVWUjp",
        },
        explanation: "Delegate governance voting power to another wallet",
      },
    ],
  ],

  schema: z.object({
    realm: z.string().min(32, "Invalid realm address"),
    governingTokenMint: z
      .string()
      .min(32, "Invalid governing token mint address"),
    delegate: z.string().min(32, "Invalid delegate wallet address"),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await delegateVotingPower(
        agent,
        new PublicKey(input.realm),
        new PublicKey(input.governingTokenMint),
        new PublicKey(input.delegate),
      );

      return {
        status: "success",
        message: "Successfully delegated voting power",
        signature,
      };
    } catch (error: any) {
      let errorMessage = error.message;

      // Handle specific error cases with user-friendly messages
      if (error.message.includes("Account not found")) {
        errorMessage =
          "No token owner record found - you need to deposit tokens first";
      } else if (error.message.includes("Invalid delegate")) {
        errorMessage = "The provided delegate address is invalid";
      }

      return {
        status: "error",
        message: errorMessage,
      };
    }
  },
};

export default delegateVotingPowerAction;
