import {
  getWalletEnhancedTransactions,
  summarizeWalletIntelligence,
} from "./get_wallet_intelligence";

describe("summarizeWalletIntelligence", () => {
  it("extracts swaps, venues and signals from enhanced transactions", () => {
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

    expect(result.transactionsAnalyzed).toBe(2);
    expect(result.totalSwapCount).toBe(1);
    expect(result.topProtocols).toContain("JUPITER");
    expect(result.topProtocols).toContain("PUMP_AMM");
    expect(result.recentSwaps[0].dex).toBe("JUPITER");
    expect(result.recentSwaps[0].tokenIn.amount).toBeCloseTo(0.425);
    expect(result.recentSwaps[0].tokenOut.amount).toBeCloseTo(15.75350499);
    expect(result.lastActiveAt).toBe(1787933918);
    expect(result.signals.join(" ")).toContain("DEX swap");
  });

  it("resolves native (SOL) swap legs", () => {
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

    expect(result.recentSwaps[0].tokenIn.amount).toBeCloseTo(1);
    expect(result.recentSwaps[0].tokenOut.amount).toBeCloseTo(100);
  });

  it("handles an empty transaction list", () => {
    const result = summarizeWalletIntelligence("walletC", []);

    expect(result.transactionsAnalyzed).toBe(0);
    expect(result.totalSwapCount).toBe(0);
    expect(result.lastActiveAt).toBeNull();
    expect(result.signals.join(" ")).toContain("No DEX swaps");
  });
});

describe("getWalletEnhancedTransactions", () => {
  it("throws when HELIUS_API_KEY is missing", async () => {
    const agent = { config: {} } as any;

    await expect(
      getWalletEnhancedTransactions(agent, "walletD", 5),
    ).rejects.toThrow(/HELIUS_API_KEY/);
  });
});
