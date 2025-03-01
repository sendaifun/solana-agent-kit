import { AuthorityType } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { revokeAuthority } from "../../tools/token2022/token_minting_controls";
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
// Revoke Authority Action
const revokeAuthorityAction: Action = {
  name: "REVOKE_AUTHORITY_ACTION",
  similes: [
    "remove authority",
    "revoke mint tokens authority",
    "revoke the mint tokens authority",
    "remove the mint tokens authority",
    "revoke freeze account authority",
    "remove freeze account authority",
    "revoke authority of type mint tokens",
    "remove authority of type mint tokens",
    "revoke authority of type freeze account",
    "revoke transfer fee config authority",
    "revoke the transfer fee config authority",
    "revoke authority of type transfer fee config",
    "revoke withheld withdraw authority",
    "revoke authority of type withheld withdraw",
    "revoke close mint authority",
    "remove close mint authority",
    "revoke interest rate authority",
    "remove interest rate authority",
    "revoke authority of type interest rate",
    "revoke permanent delegate authority",
    "remove permanent delegate authority",
    "revoke the permanent delegate",
    "revoke confidential transfer mint authority",
    "remove confidential transfer mint authority",
    "revoke authority of type confidential transfer mint",
    "revoke transfer hook program ID authority",
    "revoke transfer hook program ID authority",
    "revoke authority of type transfer hook program ID",
    "revoke metadata pointer authority",
    "modify authority of type metadata pointer",
    "revoke group pointer authority",
    "revoke authority of type group pointer",
    "revoke group member pointer authority",
    "remove group member pointer authority",
    "revoke authority of type group member pointer",
  ],
  description: "Revokes an authority from a token mint by setting it to null",
  examples: [
    [
      {
        input: {
          mint: "So11111111111111111111111111111111111111112",
          authority: "MintTokens",
        },
        output: {
          status: "success",
          signature:
            "tZ9m1PYiKTerTsPUuFSeNa9FmRTwkx74je5GXmtGveBuZu7U5PnihSeLJ3TBTVqHixCqKyUuCjwnC4sNLNE8Zvz",
        },
        explanation: "Revoke mint authority of type MintTokens from token mint",
      },
    ],
    [
      {
        input: {
          mint: "So11111111111111111111111111111111111111112",
          authority: "MintTokens",
        },
        output: {
          status: "success",
          signature:
            "tZ9m1PYiKTerTsPUuFSeNa9FmRTwkx74je5GXmtGveBuZu7U5PnihSeLJ3TBTVqHixCqKyUuCjwnC4sNLNE8Zvz",
        },
        explanation: "Revoke mint authority from token mint",
      },
    ],
  ],
  schema: z.object({
    owner: z.string(),
    mint: z.string(),
    authorityType: z.enum(
      Object.keys(authorityTypeMap) as [keyof typeof authorityTypeMap],
    ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    // Convert authorityType string to corresponding enum value
    const authorityType = authorityTypeMap[input.authorityType];
    if (authorityType === undefined) {
      throw new Error(`Invalid authority type: ${input.authorityType}`);
    }
    const signature = await revokeAuthority(
      agent,
      new PublicKey(input.mint),
      authorityType,
    );
    return {
      status: "success",
      signature,
    };
  },
};

export default revokeAuthorityAction;
