import axios from "axios";
import { SANCTUM_STAT_API_URI } from "../../constants";

/**
 * @param inputs: Array of mint addresses or symbols of the LST to get price for registered in sanctum
 * @returns Price of the mints
 */

export async function sanctumGetLSTPrice(
  inputs: string[],
): Promise<{ mint: string; amount: number }[]> {
  try {
    const client = axios.create({
      baseURL: SANCTUM_STAT_API_URI,
    });

    const response = await client.get("/v1/sol-value/current", {
      params: {
        lst: inputs,
      },
      paramsSerializer: (params) => {
        return params.lst.map((value: string) => `lst=${value}`).join("&");
      },
    });

    const result = response.data.solValues;

    return result;
  } catch (error: any) {
    throw new Error(`Failed to get price: ${error.message}`);
  }
}
