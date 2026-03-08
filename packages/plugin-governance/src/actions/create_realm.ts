import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { governanceCreateRealm } from "../tools/create_realm";

const governanceCreateRealmAction: Action = {
  name: "GOVERNANCE_CREATE_REALM_ACTION",
  similes: [
    "create a new realm",
    "start a dao on realms",
    "initialize a realm",
    "spl governance create realm",
    "realms setup",
  ],
  description: `Create a new Realm in SPL Governance (Realms). 
  Specify the program ID, name of the realm, and community mint.`,
  examples: [
    [
      {
        input: {
          programId: "GovER5Lthv3pLBZVvH7y3XmsabB3dB9K6P5xS8Xv",
          name: "My Awesome DAO",
          communityMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        },
        output: {
          status: "success",
          message: "Realm created successfully",
          transaction: "5KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Create a new DAO realm named 'My Awesome DAO' using USDC as community mint",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().describe("SPL Governance program ID"),
    name: z.string().describe("Name of the realm"),
    communityMint: z.string().describe("Community token mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await governanceCreateRealm(
        agent,
        new PublicKey(input.programId),
        input.name,
        new PublicKey(input.communityMint),
      );

      return {
        status: "success",
        message: "Realm created successfully",
        transaction: txSignature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Governance create realm failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default governanceCreateRealmAction;
