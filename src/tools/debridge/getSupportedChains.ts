import { DEBRIDGE_API } from "../../constants";
import { SupportedChainsResponse } from "../../types";

/**
 * Get list of supported chains and their configurations
 * @returns List of supported chains with their configurations
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSupportedChains(): Promise<SupportedChainsResponse> {
  const response = await fetch(`${DEBRIDGE_API}/supported-chains-info`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch supported chains: ${response.statusText}`);
  }

  const data = await response.json();
  
  if ('error' in data) {
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}
