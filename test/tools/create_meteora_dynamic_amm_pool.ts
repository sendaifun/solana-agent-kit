import { SolanaAgentKit, createSolanaTools } from "../../src";
import { deploy_token } from "../../src/tools";
import BN from "bn.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import { METEORA_DYNAMIC_AMM_PROGRAM_ID } from "../../src/constants";

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
);

async function main() {
  console.log("<<< Test Create Meteora Dynamic AMM pool");

  const { mint: tokenAMint } = await deploy_token(
    agent,
    "token_a_mint",
    "www.example.com",
    "TOKEN_A",
    6,
    100_000,
  );
  const { mint: tokenBMint } = await deploy_token(
    agent,
    "token_b_mint",
    "www.example.com",
    "TOKEN_B",
    6,
    100_000,
  );

  // Delay for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const tokenAAmount = new BN(1000 * 10 ** 6);
  const tokenBAmount = new BN(5 * 10 ** 6);
  const params = {
    tradeFeeNumerator: 2500,
    activationPoint: null,
    hasAlphaVault: false,
    activationType: 0,
  };
  const txHash = await agent.meteoraCreateDynamicPool(
    tokenAMint,
    tokenBMint,
    tokenAAmount,
    tokenBAmount,
    params.tradeFeeNumerator,
    params.activationPoint,
    params.hasAlphaVault,
    params.activationType,
  );
  console.log(`Tx successfully ${txHash.toString()}`);

  const poolKey = deriveCustomizablePermissionlessConstantProductPoolAddress(
    tokenAMint,
    tokenBMint,
    METEORA_DYNAMIC_AMM_PROGRAM_ID,
  );
  const pool = await AmmImpl.create(agent.connection, poolKey);
  await pool.updateState();

  console.log(">>> Test Create Meteora Dynamic AMM Pool Passed");
}

main();

export { SolanaAgentKit, createSolanaTools };
