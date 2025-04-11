import BlinksPlugin from "@solana-agent-kit/plugin-blinks";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import MiscPlugin from "@solana-agent-kit/plugin-misc";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";
import aiTests from "./agentTests";
import programmaticTests from "./programmaticTests";
import { chooseMode, rl } from "./utils";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();

async function main() {
  const mode = await chooseMode();

  const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SOLANA_PRIVATE_KEY as string),
  );
  const wallet = new KeypairWallet(keyPair, process.env.RPC_URL as string);

  // Initialize agent with your test wallet
  const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  })
    // Load all plugins
    .use(TokenPlugin)
    .use(NFTPlugin)
    .use(DefiPlugin)
    .use(MiscPlugin)
    .use(BlinksPlugin);

  if (mode === "agent") {
    await aiTests(agent);
  } else {
    await programmaticTests(agent);
  }

  rl.close();
}

main()
  .then(() => console.log("All tests completed successfully!"))
  .catch((error) => {
    console.error("Error during tests:", error);
    process.exit(1);
  });
