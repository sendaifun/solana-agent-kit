import axios from "axios";
import { SANCTUM_STAT_API_URI } from "../../constants";

/**
 * @param inputs: Array of mint addresses or symbols of the LST to get apy for registered in sanctum
 * @returns APY of the LST
 */

export async function get_apy(
  inputs: string[],
): Promise<{ apys: Record<string, number> }> {
  try {
    const client = axios.create({
      baseURL: SANCTUM_STAT_API_URI,
    });

    const response = await client.get("/v1/apy/latest", {
      params: {
        lst: inputs,
      },
      paramsSerializer: (params) => {
        return params.lst.map((value: string) => `lst=${value}`).join("&");
      },
    });

    const result = response.data.apys;

    return result;
  } catch (error: any) {
    throw new Error(`Failed to get apy: ${error.message}`);
  }
}
