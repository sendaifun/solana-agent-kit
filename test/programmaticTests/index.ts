import BlinksPlugin from "@solana-agent-kit/plugin-blinks";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import MiscPlugin from "@solana-agent-kit/plugin-misc";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { SolanaAgentKit } from "solana-agent-kit";

export default async function (agentKit: SolanaAgentKit) {
  const agent = agentKit
    .use(TokenPlugin)
    .use(NFTPlugin)
    .use(DefiPlugin)
    .use(MiscPlugin)
    .use(BlinksPlugin);

  // Test a method
  console.log("Testing Token Plugin...");
  const tokenData = await agent.methods.getAsset(
    agent,
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  );
  console.log("USDC Token Data:", tokenData);

  console.log("Testing NFT Plugin...");
  // Add your NFT plugin test here

  console.log("Testing DeFi Plugin...");
  // Add your DeFi plugin test here

  console.log("Testing Misc Plugin...");
  // Add your misc plugin test here

  console.log("Testing Blinks Plugin...");
  // Add your blinks plugin test here
}
