import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";
import { GetProgramBuildLogParams } from "../types";

/**
 * @name        get_program_build_log
 * @description Get build logs for a solana program
 * @param       buildLogParams
 */

export async function get_program_build_log(
  buildLogParams: GetProgramBuildLogParams
) {
  try {
    const { address } = buildLogParams;
    const response = await fetch(
      OSEC_ENDPOINT_URI + OSEC_ROUTER.GET_PROGRAM_BUILD_LOG + address
    );

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
