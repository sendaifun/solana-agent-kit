import assert from "node:assert/strict";
import {
  getWalletEnhancedTransactions,
  summarizeWalletIntelligence,
} from "./get_wallet_intelligence";

async function main() {
  // 1. extracts swaps, venues and signals from enhanced transactions
  {
    const txs = [
      {
        source: "JUPITER",
        signature: "sig1",
        timestamp: 1787933918,
        events: {
          swap: {
            tokenInputs: [
              {
                mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                rawTokenAmount: { tokenAmount: "425000", decimals: 6 },
              },
            ],
            tokenOutputs: [
              {
                mint: "6sXzcNzDk8x4Atcee6vv25iw5bLyg8mLJRtVhwM8Kgan",
                rawTokenAmount: { tokenAmount: "15753504990", decimals: 6 },
              },
            ],
          },
        },
      },
      {
        source: "PUMP_AMM",
        signature: "sig2",
        timestamp: 1787933815,
      },
    ];

    const result = summarizeWalletIntelligence("walletA", txs);

    assert.equal(result.transactionsAnalyzed, 2);
    assert.equal(result.totalSwapCount, 1);
    assert.ok(result.topProtocols.includes("JUPITER"));
    assert.ok(result.topProtocols.includes("PUMP_AMM"));
    assert.equal(result.recentSwaps[0].dex, "JUPITER");
    assert.ok(Math.abs(result.recentSwaps[0].tokenIn.amount - 0.425) < 1e-9);
    assert.ok(
      Math.abs(result.recentSwaps[0].tokenOut.amount - 15753.50499) < 1e-6,
    );
    assert.equal(result.lastActiveAt, 1787933918);
    assert.ok(result.signals.join(" ").includes("DEX swap"));
    process.stdout.write("ok 1 - extracts swaps, venues and signals\n");
  }

  // 2. resolves native (SOL) swap legs
  {
    const txs = [
      {
        source: "RAYDIUM",
        signature: "sigNative",
        timestamp: 1787933918,
        events: {
          swap: {
            nativeInput: { amount: 1000000000 },
            tokenOutputs: [
              {
                mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                rawTokenAmount: { tokenAmount: "100000000", decimals: 6 },
              },
            ],
          },
        },
      },
    ];

    const result = summarizeWalletIntelligence("walletB", txs);

    assert.ok(Math.abs(result.recentSwaps[0].tokenIn.amount - 1) < 1e-9);
    assert.ok(Math.abs(result.recentSwaps[0].tokenOut.amount - 100) < 1e-9);
    process.stdout.write("ok 2 - resolves native (SOL) swap legs\n");
  }

  // 3. handles an empty transaction list
  {
    const result = summarizeWalletIntelligence("walletC", []);

    assert.equal(result.transactionsAnalyzed, 0);
    assert.equal(result.totalSwapCount, 0);
    assert.equal(result.lastActiveAt, null);
    assert.ok(result.signals.join(" ").includes("No DEX swaps"));
    process.stdout.write("ok 3 - handles an empty transaction list\n");
  }

  // 4. throws when HELIUS_API_KEY is missing
  await assert.rejects(
    getWalletEnhancedTransactions({ config: {} } as any, "walletD", 5),
    /HELIUS_API_KEY/,
  );
  process.stdout.write("ok 4 - throws when HELIUS_API_KEY is missing\n");

  process.stdout.write("\nget_wallet_intelligence: 4 tests passed\n");
}

main().catch((e) => {
  console.error("TESTS FAILED:", e);
  process.exit(1);
});
