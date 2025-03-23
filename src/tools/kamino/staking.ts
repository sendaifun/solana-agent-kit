import { SolanaAgentKit } from "../../index";
import { getStakingYieldsApi } from "./common/kaminoApi";

export async function getStakingYields(agent: SolanaAgentKit) {
  try {
    const yields = await getStakingYieldsApi();
    return { yields };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching staking yields: ${error}`);
  }
}
