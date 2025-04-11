import {
  GetAssetsByCreatorRpcInput,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import { SolanaAgentKit } from "solana-agent-kit";
import { initUmi } from "../../utils";

/**
 * Fetch assets by creator using the Metaplex DAS API
 * @param agent SolanaAgentKit instance
 * @param params Parameters for fetching assets by creator
 * @returns List of assets created by the specified creator
 */
export async function get_assets_by_creator(
  agent: SolanaAgentKit,
  params: GetAssetsByCreatorRpcInput,
) {
  const umi = initUmi(agent).use(dasApi());
  return await umi.rpc.getAssetsByCreator(params);
}
