import { crewpayFetch } from "./client";

/**
 * Preview a CrewPay launch without a key, wallet or any transaction.
 * Returns the KOL crew Autohire would pick, the fee map (launching agent receives 15% of creator fees),
 * estimated costs and the next calls.
 * @param name - Coin name
 * @param ticker - Coin ticker
 * @param description - Optional description used to match the crew
 */
export async function previewCrewpayLaunch(
  name: string,
  ticker: string,
  description?: string,
): Promise<any> {
  const params = new URLSearchParams({ name, ticker });
  if (description) {
    params.set("description", description);
  }
  return crewpayFetch(`/api/agent/quickstart?${params.toString()}`);
}
