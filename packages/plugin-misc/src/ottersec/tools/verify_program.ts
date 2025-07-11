import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";
import { VerifyProgramParamType } from "../types";

/**
 * @name        verify_program
 * @description Verify a Solana program
 * @param       verifyParams
 */

export async function verify_program(verifyParams: VerifyProgramParamType) {
  try {
    const response = await fetch(
      OSEC_ENDPOINT_URI + OSEC_ROUTER.VERIFY_PROGRAM,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyParams),
      }
    );

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    throw error;
  }
}
