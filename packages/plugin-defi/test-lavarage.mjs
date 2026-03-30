import { readFileSync } from "fs";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const { default: DefiPlugin } = await import("./dist/index.js");

const keyData = JSON.parse(readFileSync("/tmp/test-sak-wallet.json", "utf-8"));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keyData));
const wallet = keypair.publicKey.toBase58();
const connection = new Connection("https://api.mainnet-beta.solana.com");

console.log(`Wallet: ${wallet}`);
const balance = await connection.getBalance(keypair.publicKey);
console.log(`SOL Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL\n`);

// Proper agent mock with signAndSendTransaction (what SAK's signOrSendTX expects)
const agent = {
  wallet: {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => { tx.sign([keypair]); return tx; },
    signAllTransactions: async (txs) => { txs.forEach(tx => tx.sign([keypair])); return txs; },
    signAndSendTransaction: async (tx) => {
      tx.sign([keypair]);
      const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 3 });
      return { signature: sig };
    },
  },
  connection,
  config: {},
};

const actions = DefiPlugin.actions.filter((a) => a.name.startsWith("LAVARAGE"));
console.log(`${actions.length} Lavarage actions loaded\n`);

const getAction = (name) => actions.find((a) => a.name === name);
let passed = 0, failed = 0;

async function test(name, fn) {
  process.stdout.write(`${name}... `);
  try {
    const result = await fn();
    if (result.status === "error") {
      console.log(`FAIL: ${result.message}`);
      failed++;
    } else {
      console.log("PASS");
      passed++;
    }
    return result;
  } catch (e) {
    console.log(`FAIL: ${e.message}`);
    failed++;
    return null;
  }
}

// === READ TESTS ===
const tokenResult = await test("LIST_TOKENS (BTC)", () =>
  getAction("LAVARAGE_LIST_TOKENS").handler(agent, { search: "BTC" })
);
if (tokenResult?.tokens?.length > 0)
  console.log(`  → Found: ${tokenResult.tokens.map(t => `${t.symbol}/${t.quoteSymbol}`).join(", ")}\n`);

await test("GET_MAX_LEVERAGE (SOL/USDC)", () =>
  getAction("LAVARAGE_GET_MAX_LEVERAGE").handler(agent, { search: "SOL", quoteCurrency: "USDC" })
);

let offerKey = tokenResult?.tokens?.find(t => t.quoteSymbol === "USDC")?.offerPublicKey;
if (offerKey)
  console.log(`  → Using offer: ${offerKey.slice(0,12)}...\n`);

if (offerKey) {
  const quoteResult = await test("GET_QUOTE (2x, $2 USDC)", () =>
    getAction("LAVARAGE_GET_QUOTE").handler(agent, { offerPublicKey: offerKey, collateralAmount: "2000000", leverage: 2 })
  );
  if (quoteResult?.quote)
    console.log(`  → In: ${quoteResult.quote.inAmount} → Out: ${quoteResult.quote.outAmount}\n`);
}

await test("GET_POSITIONS", () =>
  getAction("LAVARAGE_GET_POSITIONS").handler(agent, { status: "ALL" })
);

await test("TRADE_HISTORY", () =>
  getAction("LAVARAGE_TRADE_HISTORY").handler(agent, { limit: 3 })
);

// === LIVE TRADE TEST ===
if (offerKey) {
  console.log("\n=== LIVE TRADE TEST ===");

  const openResult = await test("OPEN_POSITION (2x long cbBTC/USDC, $2)", () =>
    getAction("LAVARAGE_OPEN_POSITION").handler(agent, {
      offerPublicKey: offerKey,
      collateralAmount: "2000000",
      leverage: 2,
      slippageBps: 100,
    })
  );

  if (openResult?.signature) {
    console.log(`  → TX: ${openResult.signature}\n`);
    console.log("  Waiting 8s for position to appear...");
    await new Promise(r => setTimeout(r, 8000));

    const posResult = await test("GET_POSITIONS (verify)", () =>
      getAction("LAVARAGE_GET_POSITIONS").handler(agent, { status: "OPEN" })
    );

    if (posResult?.positions?.length > 0) {
      const p = posResult.positions[0];
      console.log(`  → ${p.side} ${p.baseTokenSymbol ?? "?"}/${p.quoteTokenSymbol ?? "?"} ${p.leverage}x\n`);

      const closeResult = await test("CLOSE_POSITION", () =>
        getAction("LAVARAGE_CLOSE_POSITION").handler(agent, { positionAddress: p.address, slippageBps: 100 })
      );
      if (closeResult?.signature)
        console.log(`  → Close TX: ${closeResult.signature}\n`);
    }
  }
}

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
