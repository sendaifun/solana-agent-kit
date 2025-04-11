import {
  SearchAssetsRpcInput,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import { SolanaAgentKit } from "solana-agent-kit";
import { initUmi } from "../../utils";

/**
 * Search for assets using the Metaplex DAS API
 * @param agent SolanaAgentKit instance
 * @param params Parameters for searching assets
 * @returns List of assets matching the search criteria
 */
export async function search_assets(
  agent: SolanaAgentKit,
  params: SearchAssetsRpcInput,
) {
  const umi = initUmi(agent).use(dasApi());
  return await umi.rpc.searchAssets(params);
}
