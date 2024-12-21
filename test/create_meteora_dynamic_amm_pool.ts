import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { SolanaAgentKit } from "../src";
import { createMeteoraDynamicAMMPool, deploy_token } from "../src/tools";
import BN from "bn.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import { METEORA_DYNAMIC_AMM_PROGRAM_ID } from "../src/constants";

export async function test_create_meteora_dynamic_amm_pool() {
  console.log("<<< Test Create Meteora Dynamic AMM pool");
  const solanaKit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL,
    process.env.OPENAI_API_KEY!
  );

  const { mint: tokenAMint } = await deploy_token(solanaKit, "token_a_mint", "www.example.com", "TOKEN_A", 6, 100_000);
  const { mint: tokenBMint } = await deploy_token(solanaKit, "token_b_mint", "www.example.com", "TOKEN_B", 6, 100_000);

  // Delay for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  const tokenAAmount = new BN(1000);
  const tokenBAmount = new BN(5);
  const params = {
    tradeFeeNumerator: 250,
    activationPoint: null,
    hasAlphaVault: false,
    activationType: 0,
    padding: Array(90).fill(0)
  };
  const txHash = await createMeteoraDynamicAMMPool(solanaKit, tokenAMint, tokenBMint, tokenAAmount, tokenBAmount, params);
  console.log(`Tx successfully ${txHash.toString()}`);

  const poolKey = deriveCustomizablePermissionlessConstantProductPoolAddress(
    tokenAMint, tokenBMint, METEORA_DYNAMIC_AMM_PROGRAM_ID
  );
  const pool = await AmmImpl.create(solanaKit.connection, poolKey);
  await pool.updateState();

  console.log(">>> Test Create Meteora Dynamic AMM Pool Passed");
}