import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_tokens_by_market_cap } from "../tools/fetch_tokens_by_market_cap";

const fetchTokensByMarketCapAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKENS_BY_MARKET_CAP",
  description: "Market-cap-based token filter",
  similes: ["Fetch tokens by market cap", "Get tokens by market cap"],
  examples: [
    [
      {
        input: {
          min: "10",
          max: "30",
          sort: "asc",
          limit: 5,
        },
        output: {
          success: true,
          data: [
            [
              {
                signature:
                  "KQiz5hvsRsw2BuveDdqXGU45HyTbacssH8xizdjvsyhkUAjuGF7gKWSuU8FSdQAnucuSvp7RVBHQgEp4P6hhQNq",
                mint_pubkey: "HA2qrjLXJzveKNkb7TLLrWP6tbYn6DZgWEdY9Rpgpump",
                initial_buy_account_pubkey:
                  "FYExPCWzyu2fn7bL8B2NQY7Dpagm7uMPxV3LP47xZn6P",
                initial_buy_token_account_pubkey:
                  "BDrTzBgdeTJ1viLMsCwmK4rE9SSk6gySmcbQ4NMJbrao",
                creator_pubkey: "FYExPCWzyu2fn7bL8B2NQY7Dpagm7uMPxV3LP47xZn6P",
                creator_token_account_pubkey:
                  "BDrTzBgdeTJ1viLMsCwmK4rE9SSk6gySmcbQ4NMJbrao",
                initial_buy_amount: 20834951.423962,
                initial_buy_sol_amount: 0.594059405,
                bondingcurve_pubkey:
                  "F6iMGrJxBaCHYmjREFcpM47AJnfXF1JXk8TXtw7rsbkh",
                market_cap: 29.077243581132898,
                name: "HOPCAT",
                symbol: "HOPCAT",
                uri: "https://ipfs.io/ipfs/bafkreigkfwyuctvdyjwb76ynbhur7fsos2qqseghctmfar6jmtkdx34xou",
                timestamp: "2025-06-24T11:03:31.551Z",
              },
              {
                signature:
                  "3VEAne5tHrUjSv6E9ve7Fa4xT8L5xvM66SnJfsPqaNVQkQMBHR9TN3FU4nRrdG61QYcQc5r6JBvdMb53pEySSy9d",
                mint_pubkey: "7LhNb32f5Qhx9WkA7fEFkJuWvVaA5LdjviywQWS6pump",
                initial_buy_account_pubkey:
                  "9Fz1uZtfxk6eLFNaSp2Mm2GKhuRXnQJ3wmbW1whQTnzU",
                initial_buy_token_account_pubkey:
                  "Do9kLsDPYuk3Jy3dASTfioMcq7eFVWKwaejt955SYPkG",
                creator_pubkey: "9Fz1uZtfxk6eLFNaSp2Mm2GKhuRXnQJ3wmbW1whQTnzU",
                creator_token_account_pubkey:
                  "Do9kLsDPYuk3Jy3dASTfioMcq7eFVWKwaejt955SYPkG",
                initial_buy_amount: 18627255.199148,
                initial_buy_sol_amount: 0.530000096,
                bondingcurve_pubkey:
                  "2yuBKR1BALvNYxEEXm8HBQtgC1t2Ea8ffijcxBzSFtmu",
                market_cap: 28.955604407031714,
                name: "Spectral Cat",
                symbol: "sCAT",
                uri: "https://ipfs.io/ipfs/QmPe9BNyHm31nfPPKAhG8N1MQEEVzX6xrPXMCGd2PdatTg",
                timestamp: "2025-06-24T11:03:39.869Z",
              },
              {
                signature:
                  "3NrvwCeEoXR6CjUEps4YSozzSKuLJbkG5BXxVq58RotnG5z18X8afnZFzNGEAtmi6tHUVqhFYTpuGDabAxfms73p",
                mint_pubkey: "DioTa9ZX2BzCgD8j6gTviC8eGDa7kKYctYnAFE9Ppump",
                initial_buy_account_pubkey:
                  "4UN7QYqFLmHmpgVvWtW64jKauDSgtbHXvTWoTiefuBPG",
                initial_buy_token_account_pubkey:
                  "JA3x4hWGY5gaxUSihYeBsMFhQRFpBKj1UmLQscHE9Kvq",
                creator_pubkey: "4UN7QYqFLmHmpgVvWtW64jKauDSgtbHXvTWoTiefuBPG",
                creator_token_account_pubkey:
                  "JA3x4hWGY5gaxUSihYeBsMFhQRFpBKj1UmLQscHE9Kvq",
                initial_buy_amount: 24229032.226263,
                initial_buy_sol_amount: 0.693069306,
                bondingcurve_pubkey:
                  "8ccmkxGi6hoMez4R4Wxuaqg81GRzwfZoHq4Ej8yRagGG",
                market_cap: 29.265750339326477,
                name: "$SPCX",
                symbol: "$SPCX",
                uri: "https://ipfs.io/ipfs/bafkreicdbqc4oplsn77bze5577vchzlbmlqwt5z7o5bkamj56smqxhydey",
                timestamp: "2025-06-24T11:03:41.196Z",
              },
              {
                signature:
                  "2RNG8rfn38qD2cVLYv7PZkJQwHGyUP7CaTVVXz7U59v1eZrMTHLRJUBJrWgEtSoseAp5BXQKdPWKAjpu5Lx2RcdB",
                mint_pubkey: "CX9w9kFsaURc5dvUPdLSkNyP8neT1K5wf65HcYb4pump",
                initial_buy_account_pubkey:
                  "GnumacUV3rPRVRfX5poA8JNaBSsPMcAEgm4fq5Arwdtx",
                initial_buy_token_account_pubkey:
                  "4QNoJNo3QqbbDKcgHyjjo6h4Mq32kRCuRQWQovwzGAuP",
                creator_pubkey: "GnumacUV3rPRVRfX5poA8JNaBSsPMcAEgm4fq5Arwdtx",
                creator_token_account_pubkey:
                  "4QNoJNo3QqbbDKcgHyjjo6h4Mq32kRCuRQWQovwzGAuP",
                initial_buy_amount: 34281150.129545,
                initial_buy_sol_amount: 0.990099009,
                bondingcurve_pubkey:
                  "f5mRJF2eYPF58aY2ebVj3SDKNQPsxqjz2msbUWzt4ca",
                market_cap: 29.834925026021196,
                name: "Solthumb - Crypto & Memecoin",
                symbol: "SOLTHUMB",
                uri: "https://ipfs.io/ipfs/bafkreibw4p3i6cmbkum2czi32c2yurztoilk2yy2mcg4bcm7sf72qfzyti",
                timestamp: "2025-06-24T11:03:46.065Z",
              },
              {
                signature:
                  "3NdEx1C8AiChoF3uTJnXTeaotDjmQfHGhGVx3vXU47GMJHyMrZ144U9HjZ18KssNrJtbQ8zv98CUpxvC38wR4rap",
                mint_pubkey: "9zf1sAyBrJMag2uBg1XxRTWBLK8xhZcVrjWocUhRpump",
                initial_buy_account_pubkey:
                  "314BmmZuTEV5t13YiA4Qndjbh7WJpHY1JeeAt8gcmWAj",
                initial_buy_token_account_pubkey:
                  "2Rep17R3sKmVDzvMNYkZVQo2PbRorqTvJ2Qotu3UJDyq",
                creator_pubkey: "314BmmZuTEV5t13YiA4Qndjbh7WJpHY1JeeAt8gcmWAj",
                creator_token_account_pubkey:
                  "2Rep17R3sKmVDzvMNYkZVQo2PbRorqTvJ2Qotu3UJDyq",
                initial_buy_amount: 1413219.49808,
                initial_buy_sol_amount: 0.039564304,
                bondingcurve_pubkey:
                  "579yCB6PXEyCBWZJqUSQ9io96BXixaEhe2pzbVmYTKdz",
                market_cap: 28.03278731167217,
                name: "Coin Not Found",
                symbol: "$404",
                uri: "https://ipfs.io/ipfs/QmehmtdULLQBGPFqeUWtAtX6LgMdhBzX9U3Gosz3gFPUjC",
                timestamp: "2025-06-24T11:04:00.972Z",
              },
            ],
          ],
        },
        explanation: "Filtered token list by market cap successfully fetched",
      },
    ],
  ],
  schema: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
    sort: z.union([z.literal("asc"), z.literal("desc")]).optional(),
    limit: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { min, max, sort, limit } = input;

      const result = await fetch_tokens_by_market_cap(min, max, sort, limit);

      return {
        status: "success",
        data: result,
        message: "Token list filtered by market cap successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list filtered by market cap ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKENS_BY_MARKET_CAP_FALIED",
      };
    }
  },
};

export default fetchTokensByMarketCapAction;
