import axios from "axios";
import { SANCTUM_TRADE_API_URI } from "../../constants";

/**
 * @param mints Array of mint addresses or symbols of the LST to get tvl for registered in sanctum
 * @returns TVL of the LST
 */

export async function sanctumGetLSTTVL(
  inputs: string[],
): Promise<{ tvls: Record<string, string> }> {
  try {
    const client = axios.create({
      baseURL: SANCTUM_TRADE_API_URI,
    });

    const response = await client.get("/v1/tvl/current", {
      params: {
        lst: inputs,
      },
      paramsSerializer: (params) => {
        return params.lst.map((value: string) => `lst=${value}`).join("&");
      },
    });

    const result = response.data.tvls;

    return result;
  } catch (error: any) {
    throw new Error(`Failed to get tvl: ${error.message}`);
  }
}
