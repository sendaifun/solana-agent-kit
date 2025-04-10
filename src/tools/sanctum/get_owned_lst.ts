import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SolanaAgentKit } from "../../index";
import axios from "axios";
import { SANCTUM_STAT_API_URI } from "../../constants";

export async function get_owned_lst(
  agent: SolanaAgentKit,
): Promise<{ mint: string; amount: number }[]> {
  try {
    const [tokenAccountData] = await Promise.all([
      agent.connection.getParsedTokenAccountsByOwner(agent.wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      }),
    ]);

    const removedZeroBalance = tokenAccountData.value.filter(
      (v) => v.account.data.parsed.info.tokenAmount.uiAmount !== 0,
    );

    const tokens = await Promise.all(
      removedZeroBalance.map(async (v) => {
        return {
          mint: v.account.data.parsed.info.mint as string,
          amount: v.account.data.parsed.info.tokenAmount.uiAmount as number,
          decimals: v.account.data.parsed.info.tokenAmount.decimals as number,
        };
      }),
    );

    const lsts = tokens.filter((token) => {
      return token.decimals === 9;
    });

    const addresses = lsts.map((token) => token.mint);

    const client = axios.create({
      baseURL: SANCTUM_STAT_API_URI,
    });

    const response = await client.get("/v1/sol-value/current", {
      params: {
        lst: addresses,
      },
      paramsSerializer: (params) => {
        return params.lst.map((value: string) => `lst=${value}`).join("&");
      },
    });

    const result = Object.keys(response.data.solValues);

    const lstsWithValue = await Promise.all(
      lsts
        .map((lst) => {
          if (result.includes(lst.mint)) {
            return {
              mint: lst.mint,
              amount: lst.amount,
            };
          }
          return null;
        })
        .filter((lst) => lst !== null),
    );

    return lstsWithValue;
  } catch (error: any) {
    throw new Error(`Failed to get owned lst: ${error.message}`);
  }
}
