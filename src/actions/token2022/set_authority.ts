import { AuthorityType } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { setAuthority } from "../../tools/token2022/token_minting_controls";
import { Action } from "../../types";

// Mapping from string to AuthorityType
const authorityTypeMap: Record<string, AuthorityType> = {
  MintTokens: AuthorityType.MintTokens,
  FreezeAccount: AuthorityType.FreezeAccount,
  TransferFeeConfig: AuthorityType.TransferFeeConfig,
  WithheldWithdraw: AuthorityType.WithheldWithdraw,
  CloseMint: AuthorityType.CloseMint,
  InterestRate: AuthorityType.InterestRate,
  PermanentDelegate: AuthorityType.PermanentDelegate,
  TransferHookProgramId: AuthorityType.TransferHookProgramId,
  MetadataPointer: AuthorityType.MetadataPointer,
  GroupPointer: AuthorityType.GroupPointer,
  GroupMemberPointer: AuthorityType.GroupMemberPointer,
};
// Set Authority Action
const SetAuthorityAction: Action = {
  name: "SET_AUTHORITY_ACTION",
  similes: [
    "set mint tokens authority",
    "change the mint tokens authority",
    "set freeze account authority",
    "update freeze account authority",
    "set authority of type mint tokens",
    "set authority of type freeze account",
    "update mint authority",
    "set transfer fee config authority",
    "update transfer fee config authority",
    "change the transfer fee config authority",
    "set authority of type transfer fee config",
    "set withheld withdraw authority",
    "update withheld withdraw authority",
    "update authority of type withheld withdraw",
    "set close mint authority",
    "update close mint authority",
    "set interest rate authority",
    "update interest rate authority",
    "set authority of type interest rate",
    "update interest rate configuration",
    "set permanent delegate authority",
    "change the permanent delegate",
    "set confidential transfer mint authority",
    "update confidential transfer mint authority",
    "modify authority of type confidential transfer mint",
    "set transfer hook program ID authority",
    "update transfer hook program ID authority",
    "change authority of type transfer hook program ID",
    "set metadata pointer authority",
    "update metadata pointer authority",
    "modify authority of type metadata pointer",
    "set group pointer authority",
    "update group pointer authority",
    "update authority of type group pointer",
    "set group member pointer authority",
    "update group member pointer authority",
    "change authority of type group member pointer",
  ],
  description: "Sets a new authority for a token mint",
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeMqzqkVLHzHxVTyYH9SGGkZwyTDt1v",
          authority: "MintTokens",
          newAuthority: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Sets a authority of type MintTokens to a mint",
      },
    ],
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeMqzqkVLHzHxVTyYH9SGGkZwyTDt1v",
          authority: "FreezeAccount",
          newAuthority: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Sets an authority of type FreezeAccount to a mint",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    authorityType: z.enum(
      Object.keys(authorityTypeMap) as [keyof typeof authorityTypeMap],
    ),
    newAuthority: z.string().nullable(),
  }),
  //set the mint authority of the token mint with address <insert address> to <new authority> of type FreezeAccount

  // set the mint token authority of the token mint with address <insert address> to <new authority>

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    // console.log(JSON.stringify({ input }));

    // Convert authorityType string to corresponding enum value
    const authorityType = authorityTypeMap[input.authorityType];
    if (authorityType === undefined) {
      throw new Error(`Invalid authority type: ${input.authorityType}`);
    }
    const signature = await setAuthority(
      agent,
      new PublicKey(input.mint),
      authorityType,
      input.newAuthority ? new PublicKey(input.newAuthority) : null,
    );
    return {
      status: "success",
      signature,
    };
  },
};

export default SetAuthorityAction;
