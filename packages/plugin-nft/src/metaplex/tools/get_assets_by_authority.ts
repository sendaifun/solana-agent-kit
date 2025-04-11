import {
  GetAssetsByAuthorityRpcInput,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import { SolanaAgentKit } from "solana-agent-kit";
import { initUmi } from "../../utils";

/**
 * Fetch assets by authority using the Metaplex DAS API
 * @param agent SolanaAgentKit instance
 * @param params Parameters for fetching assets by authority
 * @returns List of assets associated with the given authority
 */
export async function get_assets_by_authority(
  agent: SolanaAgentKit,
  params: GetAssetsByAuthorityRpcInput,
) {
  const umi = initUmi(agent).use(dasApi());
  return await umi.rpc.getAssetsByAuthority(params);
}
