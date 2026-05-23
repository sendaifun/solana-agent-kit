import axios from "redaxios";
import { BLUEPRINT_API_BASE } from "../constants";

/**
 * Get Blueprint validator information including APY, vote success,
 * active stake, commission, and infrastructure details.
 *
 * @returns Validator profile data
 */
export async function blueprintGetValidator(): Promise<Record<string, any>> {
  const response = await axios.get(
    `${BLUEPRINT_API_BASE}/api/v1/validator`,
  );

  return response.data;
}
