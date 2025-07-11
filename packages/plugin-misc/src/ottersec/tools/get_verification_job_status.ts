import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";
import { GetVerificationJobStatusParams } from "../types";

/**
 * @name        get_verification_job_status
 * @description Get status of an async verification job
 * @param       jobStatusParams
 */

export async function get_verification_job_status(
  jobStatusParams: GetVerificationJobStatusParams
) {
  try {
    const { job_id } = jobStatusParams;
    const response = await fetch(
      OSEC_ENDPOINT_URI + OSEC_ROUTER.GET_VERIFICATION_JOB_STATUS + job_id
    );

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
