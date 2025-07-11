import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";
import { GetProgramVerificationStatusParams } from "../types";

/**
 * @name        get_program_verification_status
 * @description Get program verification status
 * @param       verificationStatusParams
 */

export async function get_program_verification_status(
  verificationStatusParams: GetProgramVerificationStatusParams
) {
  const { address } = verificationStatusParams;
  try {
    const response = await fetch(
      OSEC_ENDPOINT_URI + OSEC_ROUTER.GET_PROGRAM_VERIFICATION_STATUS + address
    );

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
