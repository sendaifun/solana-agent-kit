import { SolanaAgentKit } from "../src";
import { PublicKey } from "@solana/web3.js";

const agent = new SolanaAgentKit(
  "your-wallet-private-key-as-base58", // Replace with your wallet private key
  "https://api.mainnet-beta.solana.com", // Replace with your RPC URL
  "your-openai-api-key" // Replace with your OpenAI API key
);

async function main() {
  const walletAddress = new PublicKey("your-wallet-public-key"); // Replace with your wallet public key

  // 1. Fetch Token Balances
  console.log("Fetching token balances...");
  const balances = await agent.getBalances(walletAddress);
  console.log("Token Balances:", balances);

  // 2. Fetch SOL Price from Pyth
  console.log("Fetching SOL price...");
  const priceFeedID = await agent.getPythPriceFeedID("SOL");
  const price = await agent.getPythPrice(priceFeedID);
  console.log("Price of SOL/USD:", price);

  // 3. Perform a Compressed Airdrop
  console.log("Performing compressed airdrop...");
  const airdropSignature = await agent.sendCompressedAirdrop(
    new PublicKey("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"), // Replace with token mint address
    1, // Amount to airdrop per recipient
    [
      new PublicKey("recipient-wallet-public-key-1"), // Replace with recipient wallet public key
    ],
    30_000 // Priority fee in lamports
  );
  console.log("Airdrop Signature:", airdropSignature);

  // 4. Swap Tokens Using Jupiter
  console.log("Swapping tokens...");
  const swapSignature = await agent.trade(
    new PublicKey("source-token-mint"), // Replace with source token mint
    1, // Amount to swap
    new PublicKey("target-token-mint"), // Replace with target token mint
    0.3 // Slippage tolerance
  );
  console.log("Swap Signature:", swapSignature);
}

main().catch((error) => {
  console.error("Error:", error);
});
