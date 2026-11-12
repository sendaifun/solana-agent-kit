/**
 * SODAX cross-chain swap tests (read-only; no wallet or API key required).
 *
 * Run: npx tsx test/tools/sodax_swap.test.ts
 */

import { getSodaxTokens, getSodaxQuote, buildSodaxIntent } from "../../packages/plugin-defi/src/sodax/tools";

const NATIVE_SOL = "11111111111111111111111111111111";
const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const DUMMY_SOL_ADDR = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

async function testGetTokens() {
  console.log("\n=== getSodaxTokens ===");
  const tokens = await getSodaxTokens();
  const chains = Object.keys(tokens);
  console.log("Chains:", chains.join(", "));
  console.assert(chains.includes("solana"), "Missing solana chain");
  console.assert(chains.includes("0x2105.base"), "Missing base chain");
  const sol = tokens.solana?.find((t) => t.symbol === "SOL");
  console.assert(sol !== undefined, "SOL token not found");
  console.assert(sol?.decimals === 9, "SOL decimals should be 9");
  console.log("SOL address:", sol?.address);
  console.log("Solana token count:", tokens.solana?.length);
  console.log("✓ getSodaxTokens OK");
}

async function testGetQuoteSolanaToUsdc() {
  console.log("\n=== getSodaxQuote: SOL → USDC (Solana) ===");
  const quote = await getSodaxQuote({
    tokenSrc: NATIVE_SOL,
    tokenSrcChainKey: "solana",
    tokenDst: SOLANA_USDC,
    tokenDstChainKey: "solana",
    amount: "1000000000", // 1 SOL
  });
  console.log("quotedAmount:", quote.quotedAmount, "(USDC, 6 dec)");
  console.assert(Number(quote.quotedAmount) > 0, "quotedAmount should be > 0");
  console.log("✓ getSodaxQuote Solana OK");
  return quote;
}

async function testGetQuoteSolToUsdcOnBase() {
  console.log("\n=== getSodaxQuote: SOL → USDC (Base) ===");
  const quote = await getSodaxQuote({
    tokenSrc: NATIVE_SOL,
    tokenSrcChainKey: "solana",
    tokenDst: BASE_USDC,
    tokenDstChainKey: "0x2105.base",
    amount: "1000000000", // 1 SOL
  });
  console.log("quotedAmount:", quote.quotedAmount, "(USDC on Base, 6 dec)");
  console.assert(Number(quote.quotedAmount) > 0, "quotedAmount should be > 0");
  console.log("✓ getSodaxQuote Base OK");
  return quote;
}

async function testBuildIntent() {
  console.log("\n=== buildSodaxIntent: SOL → USDC (Solana, unsigned) ===");
  const { tx, intent, relayData } = await buildSodaxIntent({
    srcChainKey: "solana",
    dstChainKey: "solana",
    inputTokenAddress: NATIVE_SOL,
    outputTokenAddress: SOLANA_USDC,
    inputAmount: "100000000", // 0.1 SOL — above minimum
    srcAddress: DUMMY_SOL_ADDR,
    dstAddress: DUMMY_SOL_ADDR,
  });

  // instanceof may fail across module boundaries; check shape instead
  console.assert(tx && typeof tx.message === "object" && tx.version === 0, "tx must be VersionedTransaction v0");
  console.assert(tx.version === 0, "must be v0 transaction");

  const feePayer = tx.message.staticAccountKeys[0].toBase58();
  console.assert(feePayer === DUMMY_SOL_ADDR, `feePayer should be ${DUMMY_SOL_ADDR}, got ${feePayer}`);
  console.log("feePayer:", feePayer);
  console.log("blockhash:", tx.message.recentBlockhash);
  console.log("staticAccountKeys:", tx.message.staticAccountKeys.length);

  console.assert(typeof intent.intentId === "string", "intent.intentId must be string");
  console.log("intent.inputToken:", intent.inputToken);
  console.log("intent.outputToken:", intent.outputToken);
  console.log("intent.intentId:", intent.intentId);

  console.assert(typeof relayData === "string" && relayData.startsWith("0x"), "relayData must be 0x hex string");
  console.log("relayData (first 42 chars):", relayData.slice(0, 42));

  console.log("✓ buildSodaxIntent OK — unsigned VersionedTransaction verified");
}

async function main() {
  console.log("SODAX plugin test — read-only, no wallet required");
  try {
    await testGetTokens();
    await testGetQuoteSolanaToUsdc();
    await testGetQuoteSolToUsdcOnBase();
    await testBuildIntent();
    console.log("\n✓ All SODAX tests passed");
  } catch (e: any) {
    console.error("\n✗ Test failed:", e.message);
    process.exit(1);
  }
}

main();
