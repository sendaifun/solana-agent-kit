import { SolanaAgentKit } from "../../agent";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  dasApi,
  SearchAssetsRpcInput,
} from "@metaplex-foundation/digital-asset-standard-api";

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
  const umi = createUmi(agent.connection.rpcEndpoint).use(dasApi());
  return await umi.rpc.searchAssets(params);
}
