import { SolanaAgentKit, createSolanaTools } from "../../src";
import { deploy_token } from "../../src/tools";

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
);

async function main() {
  console.log("<<< Test Create Meteora DLMM pool");

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

  const binStep = 20;
  const initialPrice = 0.25;
  const priceRoundingUp = true;
  const feeBps = 20;
  const activationType = 1; // timestamp
  const hasAlphaVault = false;
  const activationPoint = undefined;

  const txHash = await agent.meteoraCreateDlmmPool(
    tokenAMint,
    tokenBMint,
    binStep,
    initialPrice,
    priceRoundingUp,
    feeBps,
    activationType,
    hasAlphaVault,
    activationPoint,
  );
  console.log(`Tx successfully ${txHash.toString()}`);

  console.log(">>> Test Create Meteora DLMM Pool Passed");
}

main();

export { SolanaAgentKit, createSolanaTools };
