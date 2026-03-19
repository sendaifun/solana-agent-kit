/**
 * Byreal DEX integration test
 *
 * Usage:
 *   npx tsx test/tools/byreal_test.ts
 *
 * Environment (in test/.env):
 *   RPC_URL              - Solana mainnet RPC (required)
 *   SOLANA_PRIVATE_KEY   - Base58 private key (optional — only needed for TX tests)
 *
 * No OPENAI_API_KEY needed — this is a programmatic test, not an AI agent test.
 */

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";

// Import tool functions directly from source — avoids generic type issues with agent.methods
import { byrealListPools } from "../../packages/plugin-defi/src/byreal/tools/byreal_list_pools";
import { byrealGetPoolDetail } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_pool_detail";
import { byrealListTokens } from "../../packages/plugin-defi/src/byreal/tools/byreal_list_tokens";
import { byrealGetTokenPrices } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_token_prices";
import { byrealGetOverview } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_overview";
import { byrealListPositions } from "../../packages/plugin-defi/src/byreal/tools/byreal_list_positions";
import { byrealGetSwapQuote } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_swap_quote";
import { byrealGetTopPositions } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_top_positions";
import { byrealGetKlines } from "../../packages/plugin-defi/src/byreal/tools/byreal_get_klines";
import { byrealSwap } from "../../packages/plugin-defi/src/byreal/tools/byreal_swap";
import { byrealOpenPosition } from "../../packages/plugin-defi/src/byreal/tools/byreal_open_position";
import { byrealClosePosition } from "../../packages/plugin-defi/src/byreal/tools/byreal_close_position";
import { byrealClaimFees } from "../../packages/plugin-defi/src/byreal/tools/byreal_claim_fees";
import { byrealCopyPosition } from "../../packages/plugin-defi/src/byreal/tools/byreal_copy_position";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

// ============================================
// Helpers
// ============================================

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

let passed = 0;
let failed = 0;
let skipped = 0;

function header(title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(60));
}

function ok(name: string, detail?: string) {
  passed++;
  console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, err: unknown) {
  failed++;
  const msg = err instanceof Error ? err.message : String(err);
  console.log(`  ❌ ${name} — ${msg}`);
}

function skip(name: string, reason: string) {
  skipped++;
  console.log(`  ⏭️  ${name} — skipped (${reason})`);
}

function createAgent(): SolanaAgentKit {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("Error: RPC_URL is required in test/.env");
    process.exit(1);
  }

  // Use real keypair if available, otherwise generate a throwaway one (read-only tests)
  let keypair: Keypair;
  if (process.env.SOLANA_PRIVATE_KEY) {
    keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.SOLANA_PRIVATE_KEY),
    );
  } else {
    keypair = Keypair.generate();
    console.log(
      "⚠️  No SOLANA_PRIVATE_KEY set — using random keypair (TX tests will be skipped)\n",
    );
  }

  const wallet = new KeypairWallet(keypair, rpcUrl);
  return new SolanaAgentKit(wallet, rpcUrl, {});
}

// ============================================
// Query Tests (no signing, no SOL needed)
// ============================================

async function testListPools(agent: SolanaAgentKit) {
  const name = "byrealListPools";
  try {
    const result = await byrealListPools(agent, {
      page: 1,
      pageSize: 5,
      sortField: "tvl",
      sortType: "desc",
    });
    if (result.items && result.items.length > 0) {
      const top = result.items[0];
      ok(
        name,
        `${result.total} pools total, top: ${top.pair} (TVL $${Math.round(top.tvl_usd).toLocaleString()})`,
      );
      return top.id; // return pool address for downstream tests
    }
    ok(name, `${result.total} pools (page empty)`);
    return undefined;
  } catch (e) {
    fail(name, e);
    return undefined;
  }
}

async function testGetPoolDetail(agent: SolanaAgentKit, poolAddress: string) {
  const name = "byrealGetPoolDetail";
  try {
    const detail = await byrealGetPoolDetail(agent, poolAddress);
    ok(
      name,
      `${detail.pair} | APR ${detail.apr.toFixed(2)}% | Fee ${detail.fee_rate_bps}bps | TVL $${Math.round(detail.tvl_usd).toLocaleString()}`,
    );
    return detail;
  } catch (e) {
    fail(name, e);
    return undefined;
  }
}

async function testListTokens(agent: SolanaAgentKit) {
  const name = "byrealListTokens";
  try {
    const result = await byrealListTokens(agent, {
      pageSize: 5,
      searchKey: "SOL",
    });
    if (result.items && result.items.length > 0) {
      const symbols = result.items.map((t) => t.symbol).join(", ");
      ok(name, `found ${result.total} tokens matching "SOL": ${symbols}`);
    } else {
      ok(name, "0 results for search 'SOL'");
    }
  } catch (e) {
    fail(name, e);
  }
}

async function testGetTokenPrices(agent: SolanaAgentKit) {
  const name = "byrealGetTokenPrices";
  try {
    const prices = await byrealGetTokenPrices(agent, [SOL_MINT, USDC_MINT]);
    const solPrice = prices[SOL_MINT];
    const usdcPrice = prices[USDC_MINT];
    ok(name, `SOL=$${solPrice ?? "N/A"}, USDC=$${usdcPrice ?? "N/A"}`);
  } catch (e) {
    fail(name, e);
  }
}

async function testGetOverview(agent: SolanaAgentKit) {
  const name = "byrealGetOverview";
  try {
    const overview = await byrealGetOverview(agent);
    ok(
      name,
      `TVL $${Math.round(overview.tvl).toLocaleString()} | 24h Vol $${Math.round(overview.volume_24h_usd).toLocaleString()} | 24h Fee $${Math.round(overview.fee_24h_usd).toLocaleString()}`,
    );
  } catch (e) {
    fail(name, e);
  }
}

async function testListPositions(agent: SolanaAgentKit) {
  const name = "byrealListPositions";
  try {
    const result = await byrealListPositions(agent, {});
    ok(name, `${result.total} positions for wallet`);
  } catch (e) {
    fail(name, e);
  }
}

async function testGetSwapQuote(agent: SolanaAgentKit) {
  const name = "byrealGetSwapQuote";
  try {
    // Quote: 0.01 SOL → USDC
    const quote = await byrealGetSwapQuote(
      agent,
      SOL_MINT,
      USDC_MINT,
      "10000000", // 0.01 SOL in lamports
      "in",
      200,
    );
    ok(
      name,
      `${quote.inAmount} lamports → ${quote.outAmount} USDC-raw | router: ${quote.routerType} | impact: ${quote.priceImpactPct ?? "N/A"}`,
    );
  } catch (e) {
    fail(name, e);
  }
}

async function testGetTopPositions(agent: SolanaAgentKit, poolAddress: string) {
  const name = "byrealGetTopPositions";
  try {
    const result = await byrealGetTopPositions(agent, {
      poolAddress,
      page: 1,
      pageSize: 3,
      sortField: "liquidity",
      sortType: "desc",
    });
    if (result.positions.length > 0) {
      const top = result.positions[0];
      ok(
        name,
        `${result.total} total | #1: $${top.liquidityUsd} liquidity, earned $${top.earnedUsd}`,
      );
    } else {
      ok(name, "0 top positions");
    }
  } catch (e) {
    fail(name, e);
  }
}

async function testGetKlines(
  agent: SolanaAgentKit,
  poolAddress: string,
  tokenAddress: string,
) {
  const name = "byrealGetKlines";
  try {
    const klines = await byrealGetKlines(agent, {
      poolAddress,
      tokenAddress,
      klineType: "1h",
    });
    if (klines.length > 0) {
      const last = klines[klines.length - 1];
      ok(
        name,
        `${klines.length} candles | last: O=${last.open} H=${last.high} L=${last.low} C=${last.close}`,
      );
    } else {
      ok(name, "0 candles returned");
    }
  } catch (e) {
    fail(name, e);
  }
}

// ============================================
// Transaction Tests (need real wallet + SOL)
// ============================================

async function testSwap(agent: SolanaAgentKit) {
  const name = "byrealSwap";
  const hasKey = !!process.env.SOLANA_PRIVATE_KEY;
  if (!hasKey) {
    skip(name, "no SOLANA_PRIVATE_KEY");
    return;
  }

  try {
    // executeSwap signs + submits via backend — this costs real SOL
    const result = await byrealSwap(
      agent,
      SOL_MINT,
      USDC_MINT,
      "10000000", // 0.01 SOL
      200,
    );
    if (result && result.signatures) {
      ok(
        name,
        `confirmed=${result.confirmed} | sigs: ${result.signatures.join(", ")}`,
      );
    } else {
      ok(name, `result: ${JSON.stringify(result).slice(0, 120)}`);
    }
  } catch (e) {
    fail(name, e);
  }
}

async function testOpenPosition(agent: SolanaAgentKit) {
  const name = "byrealOpenPosition";
  const hasKey = !!process.env.SOLANA_PRIVATE_KEY;
  if (!hasKey) {
    skip(name, "no SOLANA_PRIVATE_KEY");
    return;
  }

  try {
    // Open a $10 USD position in the top pool
    // priceLower/priceUpper will be auto-aligned to tick spacing by the SDK
    const result = await byrealOpenPosition(
      agent,
      "9GTj99g9tbz9U6UYDsX6YeRTgUnkYG6GTnHv3qLa5aXq", // SOL/USDC pool
      "50",
      "200",
      {
        amountUsd: 1,
        slippageBps: 300,
      },
    );
    if (typeof result === "string") {
      ok(name, `tx signature: ${result}`);
    } else {
      ok(name, `signed tx returned (signOnly mode)`);
    }
  } catch (e) {
    fail(name, e);
  }
}

async function testClosePosition(agent: SolanaAgentKit, nftMint: string) {
  const name = "byrealClosePosition";
  const hasKey = !!process.env.SOLANA_PRIVATE_KEY;
  if (!hasKey) {
    skip(name, "no SOLANA_PRIVATE_KEY");
    return;
  }

  try {
    const result = await byrealClosePosition(agent, nftMint, 300);
    if (typeof result === "string") {
      ok(name, `tx signature: ${result}`);
    } else {
      ok(name, `signed tx returned (signOnly mode)`);
    }
  } catch (e) {
    fail(name, e);
  }
}

async function testClaimFees(agent: SolanaAgentKit, nftMints: string[]) {
  const name = "byrealClaimFees";
  const hasKey = !!process.env.SOLANA_PRIVATE_KEY;
  if (!hasKey) {
    skip(name, "no SOLANA_PRIVATE_KEY");
    return;
  }

  try {
    const result = await byrealClaimFees(agent, nftMints);
    ok(name, `result: ${JSON.stringify(result).slice(0, 120)}`);
  } catch (e) {
    fail(name, e);
  }
}

async function testCopyPosition(
  agent: SolanaAgentKit,
  sourcePositionAddress: string,
) {
  const name = "byrealCopyPosition";
  const hasKey = !!process.env.SOLANA_PRIVATE_KEY;
  if (!hasKey) {
    skip(name, "no SOLANA_PRIVATE_KEY");
    return;
  }

  try {
    const result = await byrealCopyPosition(
      agent,
      sourcePositionAddress,
      1,
      300,
    );
    ok(name, `signature: ${result.signature} | confirmed: ${result.confirmed}`);
  } catch (e) {
    fail(name, e);
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log("🔷 Byreal DEX Integration Test\n");

  const agent = createAgent();
  console.log(`Wallet: ${agent.wallet.publicKey.toBase58()}`);

  // --- Query tests ---
  header("1. Query Tests (read-only, no SOL needed)");

  const poolAddress = await testListPools(agent);
  let poolDetail: any;
  if (poolAddress) {
    poolDetail = await testGetPoolDetail(agent, poolAddress);
  } else {
    skip("byrealGetPoolDetail", "no pool from list");
  }

  await testListTokens(agent);
  await testGetTokenPrices(agent);
  await testGetOverview(agent);
  await testListPositions(agent);
  await testGetSwapQuote(agent);

  if (poolAddress) {
    await testGetTopPositions(agent, poolAddress);
  } else {
    skip("byrealGetTopPositions", "no pool from list");
  }

  if (poolAddress && poolDetail?.token_a?.mint) {
    await testGetKlines(agent, poolAddress, poolDetail.token_a.mint);
  } else {
    skip("byrealGetKlines", "no pool/token from list");
  }

  // --- Transaction tests ---
  header("2. Transaction Tests (need wallet + SOL)");

  // ⚠️ Uncomment to run — each costs real SOL / requires real positions

  // await testSwap(agent);
  skip("byrealSwap", "uncomment to enable — costs ~0.01 SOL");

  // await testOpenPosition(agent);
  skip("byrealOpenPosition", "uncomment to enable — costs ~$1 + gas");

  // Replace with your actual NFT mint address of a position to close:
  // await testClosePosition(agent, "YOUR_NFT_MINT_ADDRESS");
  skip("byrealClosePosition", "uncomment + fill nftMint to enable");

  // Replace with your actual NFT mint addresses of positions with unclaimed fees:
  // await testClaimFees(agent, ["NFT_MINT_1", "NFT_MINT_2"]);
  skip("byrealClaimFees", "uncomment + fill nftMints to enable");

  // Replace with the position address you want to copy (from testGetTopPositions output):
  // await testCopyPosition(agent, "BV3y5XW3nkVmkJ5mj2yaTdHuZRwfE86D8tEw8iRHqypM");
  skip(
    "byrealCopyPosition",
    "uncomment + fill sourcePositionAddress to enable",
  );

  // --- Summary ---
  header("Summary");
  console.log(`  Passed:  ${passed}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
