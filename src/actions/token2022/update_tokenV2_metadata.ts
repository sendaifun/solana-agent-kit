import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { updateTokenV2Metadata } from "../../tools";
import { Action } from "../../types";

export const updateV2TokenMetadataAction: Action = {
  name: "UPDATE_TOKEN_V2_METADATA_ACTION",
  similes: [
    "update token2022 metadata",
    "modify token2022 information",
    "update token2022 fields",
    "change token v2 details",
    "modify token v2 metadata",
    "change token v2 details",
    "update token v2 details",
    "update token v2 uri",
    "update token v2 symbol",
    "update token v2 name",
    "update token v2 authority",
    "change token v2 uri",
    "change token v2 symbol",
    "change token v2 name",
    "change token v2 authority",
    "change token v2 update authority",
  ],
  description: `Updates the metadata of a token v2 (token2022) token. Can update name, symbol, URI, 
                and update authority. All fields are optional. 
                Requires current update authority permission.`,
  examples: [
    [
      {
        input: {
          mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
          newName: "New Token Name",
          newSymbol: "NTN",
          newUri: "https://arweave.net/18UYSsjnaunsn",
          newUpdateAuthority: "NewAuthorityAddress123",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation:
          "Update all metadata fields and authority for a token v2 mint",
      },
    ],
    [
      {
        input: {
          mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
          newName: "New Token Name",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Update the name for a token v2 mint",
      },
    ],
    [
      {
        input: {
          mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
          newSymbol: "NTN",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Update the symbol for a token v2 mint",
      },
    ],
    [
      {
        input: {
          mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
          newUri: "https://arweave.net/newmetadata.json",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Update the uri for a token v2 token mint",
      },
    ],
    [
      {
        input: {
          mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
          newUpdateAuthority: "qzqkVLHzHxVTyYH9StYyHKgvHYrHF9kUZB7",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Change the updateAuthority for a token v2 mint",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    newName: z.string().optional(),
    newSymbol: z.string().optional(),
    newUri: z.string().optional(),
    newUpdateAuthority: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const signature = await updateTokenV2Metadata(
      agent,
      new PublicKey(input.mint),
      input.newName,
      input.newSymbol,
      input.newUri,
      input.newUpdateAuthority
        ? new PublicKey(input.newUpdateAuthority)
        : undefined,
    );
    return {
      status: "success",
      signature,
    };
  },
};

export default updateV2TokenMetadataAction;
