import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";
import { GetVerifiedProgramsParams } from "../types";

/**
 * @name        get_verified_programs
 * @description Get list of all verified programs
 * @param       pageParams
 */

export async function get_verified_programs(
  pageParams: GetVerifiedProgramsParams
) {
  try {
    const { page } = pageParams;
    const response = await fetch(
      OSEC_ENDPOINT_URI + OSEC_ROUTER.GET_VERIFIED_PROGRAM + page
    );

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
