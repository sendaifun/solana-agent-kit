import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { createV2Token, ExtensionConfig } from "../../tools";
import { Action } from "../../types";
import { AccountState, ExtensionType } from "@solana/spl-token";

const ExtensionTypeMap: Record<number, string> = {
  [ExtensionType.MetadataPointer]: "MetadataPointer",
  [ExtensionType.TransferFeeConfig]: "TransferFeeConfig",
  [ExtensionType.InterestBearingConfig]: "InterestBearingConfig",
  [ExtensionType.DefaultAccountState]: "DefaultAccountState",
  [ExtensionType.PermanentDelegate]: "PermanentDelegate",
  [ExtensionType.NonTransferable]: "NonTransferable",
  // Add more if needed
};

//since its parsing the extension inputs as  {
//   "type": 10,
//   "owner": "Cd8JNmh6iBHJR2RXKJMLe5NRqYmpkYco7anoar1DWFyy",
//   "interestRate": 0.1
// },
// {
//   "type": 7,
//   "feeBasisPoints": 500,
//   "maxFee": 5000,
//   "transferFeeConfigAuthority": "Cd8JNmh6iBHJR2RXKJMLe5NRqYmpkYco7anoar1DWFyy",
//   "withdrawWithheldAuthority": "Cd8JNmh6iBHJR2RXKJMLe5NRqYmpkYco7anoar1DWFyy"
// }, this function below is a workaround

function transformExtensions(rawExtensions: any[]): any[] {
  return rawExtensions.map((ext) => ({
    type: ExtensionTypeMap[ext.type] || "UnknownExtension",
    cfg: ext.cfg,
  }));
}

const ExtensionConfigSchema = z.object({
  type: z.nativeEnum(ExtensionType), // Ensure ExtensionType is a valid enum or string union
  cfg: z.record(z.any()), // Allows for dynamic configuration objects
});

const CreateV2TokenAction: Action = {
  name: "CREATE_TOKEN_V2_ACTION",
  similes: ["create token v2", "mint new token v2", "initialize token v2"],
  description: "Creates a new Token v2 (2022) token with extensions",
  examples: [
    [
      {
        input: {
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000000"),
          decimals: 9,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.TransferFeeConfig,
              cfg: {
                feeBasisPoints: 500,
                maxFee: BigInt(5_000),
                transfer_fee_config_authority:
                  "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
                withdraw_withheld_authority:
                  "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
              },
            },
            {
              type: ExtensionType.InterestBearingConfig,
              cfg: {
                rate: 0.05, // 5% interest rate
              },
            },
          ],
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          mintAuthority: "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
          freezeAuthority: "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create v2 token with metadata pointer extension, 5% transfer fees (500 basis points), and 5% interest-bearing mint extension configuration",
      },
    ],
    [
      {
        input: {
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000"),
          decimals: 6,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.InterestBearingConfig,
              cfg: {
                rate: 0.05, // 5% interest rate
              },
            },
          ],
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          mintAuthority: "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
          freezeAuthority: "null",
          description: "My token description",
          imagePath: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create v2 token with metadata pointer and 5% interest-bearing mint extension, with no freeze authority set",
      },
    ],
    [
      {
        input: {
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000"),
          decimals: 9,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.PermanentDelegate,
              cfg: {
                address: "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM", // 5% interest rate
              },
            },
          ],
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          description: "A white polar bear with a yellow snow jacket",
          metadataUri: "https://...",
          imageUri: "https://arweave.com",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create v2 token with metadata pointer extenison and permanent delegate authority extension set",
      },
    ],
    [
      {
        input: {
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000000"),
          decimals: 6,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.NonTransferable,
              cfg: {},
            },
          ],
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          mintAuthority: "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create new v2 token with metadata pointer extension and non-transferable token extension",
      },
    ],
    [
      {
        input: {
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000000"),
          decimals: 9,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.DefaultAccountState,
              cfg: { state: AccountState.Frozen },
            },
          ],
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create token with metadata pointer extension and default account state extension as frozen ",
      },
    ],
    [
      {
        input: {
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000000"),
          freezeAuthority: null,
          decimals: 6,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.MintCloseAuthority,
              cfg: {},
            },
          ],
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create v2 token with metadata pointer extension and mint close authority extension, with no freeze authority",
      },
    ],
    [
      {
        input: {
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000"),
          mintAuthority: "EPjFW...",
          freezeAuthority: null,
          decimals: 9,
          extensions: [
            {
              type: ExtensionType.MetadataPointer,
              cfg: {},
            },
            {
              type: ExtensionType.MemoTransfer,
              cfg: {},
            },
          ],
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create v2 token with metadata pointer extension and memo transfer extension, with freeze authority set as null",
      },
    ],
    [
      {
        input: {
          owner: "6F9TPJdxmq4cqMjXjVPwZqCrhZHhXRSbHcbFZsnJuAYb",
          name: "My Token V2",
          symbol: "MTK2",
          totalSupply: BigInt("1000000"),
          mintAuthority: "EPjFW...",
          freezeAuthority: null,
          decimals: 6,
          extensions: [],
          description: "My token description",
          metadataUri: "https://...",
        },
        output: {
          status: "success",
          signature:
            "25CzVFQ2pZUSqYhq57SPeshjk7GnWYfsozRB7LsVH3yxTEwpjB768oTUt6HXD8Jn943hhT61vnqL19YyDRzN26Q6",
        },
        explanation:
          "Create token with metadata pointer extension and immutable owner extension, with no freeze authority",
      },
    ],
  ],

  //Create a new v2 token with name PROFESSORDOOM with symbol PDOOM with a total supply of 10000000 and mint the total Supply to my wallet add "this is the unofficial Professor doom token" as the description and the imagePath is "/test/mfdoom.jpeg", give the token an interest bearing mint extension with a rate of 0.10 and a transfer fee config extension with fee basis points of 500, a max fee of 5000 and let the transfer fee config authority and the withdraw withheld authority be my wallet address.

  schema: z.object({
    name: z.string(),
    symbol: z.string(),
    totalSupply: z.number(),
    decimals: z.number().optional(),
    mintTotalSupply: z.boolean().optional(),
    extensions: z.array(ExtensionConfigSchema),
    owner: z.string(),
    mintAuthority: z.string().optional(),
    freezeAuthority: z.string().nullable().optional(),
    description: z.string().optional(),
    metadataUri: z.string().optional(),
    imagePath: z.string().optional(),
    imageUri: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    // console.log(JSON.stringify({ input }));
    const parsedInput = {
      ...input,
      extensions: transformExtensions(input.extensions),
    };

    const signature = await createV2Token(
      agent,
      input.name,
      input.symbol,
      BigInt(input.totalSupply),
      input.decimals,
      input.mintTotalSupply,
      parsedInput.extensions,
      new PublicKey(input.owner) ?? undefined,
      new PublicKey(input.mintAuthority) ?? undefined,
      input.freezeAuthority ? new PublicKey(input.freezeAuthority) : null,
      input.description ?? undefined,
      input.metadataUri ?? undefined,
      input.imagePath ?? undefined,
      input.imageUri ?? undefined,
    );
    return {
      status: "success",
      signature,
    };
  },
};

export default CreateV2TokenAction;
