import { readFileSync } from "fs";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const { default: DefiPlugin } = await import("./dist/index.js");

const keyData = JSON.parse(readFileSync("/tmp/test-sak-wallet.json", "utf-8"));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keyData));
const _wallet = keypair.publicKey.toBase58();
const connection = new Connection("https://api.mainnet-beta.solana.com");
const _balance = await connection.getBalance(keypair.publicKey);

// Proper agent mock with signAndSendTransaction (what SAK's signOrSendTX expects)
const agent = {
  wallet: {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.sign([keypair]);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => tx.sign([keypair]));
      return txs;
    },
    signAndSendTransaction: async (tx) => {
      tx.sign([keypair]);
      const sig = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
        maxRetries: 3,
      });
      return { signature: sig };
    },
  },
  connection,
  config: {},
};

const actions = DefiPlugin.actions.filter((a) => a.name.startsWith("LAVARAGE"));

const getAction = (name) => actions.find((a) => a.name === name);
let _passed = 0,
  failed = 0;

async function test(name, fn) {
  process.stdout.write(`${name}... `);
  try {
    const result = await fn();
    if (result.status === "error") {
      failed++;
    } else {
      _passed++;
    }
    return result;
  } catch (_e) {
    failed++;
    return null;
  }
}

// === READ TESTS ===
const tokenResult = await test("LIST_TOKENS (BTC)", () =>
  getAction("LAVARAGE_LIST_TOKENS").handler(agent, { search: "BTC" }));

await test("GET_MAX_LEVERAGE (SOL/USDC)", () =>
  getAction("LAVARAGE_GET_MAX_LEVERAGE").handler(agent, {
    search: "SOL",
    quoteCurrency: "USDC",
  }));

const offerKey = tokenResult?.tokens?.find(
  (t) => t.quoteSymbol === "USDC",
)?.offerPublicKey;

if (offerKey) {
  await test("GET_QUOTE (2x, $2 USDC)", () =>
    getAction("LAVARAGE_GET_QUOTE").handler(agent, {
      offerPublicKey: offerKey,
      collateralAmount: "2000000",
      leverage: 2,
    }));
}

await test("GET_POSITIONS", () =>
  getAction("LAVARAGE_GET_POSITIONS").handler(agent, { status: "ALL" }));

await test("TRADE_HISTORY", () =>
  getAction("LAVARAGE_TRADE_HISTORY").handler(agent, { limit: 3 }));

// === LIVE TRADE TEST ===
if (offerKey) {
  const openResult = await test("OPEN_POSITION (2x long cbBTC/USDC, $2)", () =>
    getAction("LAVARAGE_OPEN_POSITION").handler(agent, {
      offerPublicKey: offerKey,
      collateralAmount: "2000000",
      leverage: 2,
      slippageBps: 100,
    }));

  if (openResult?.signature) {
    await new Promise((r) => setTimeout(r, 8000));

    const posResult = await test("GET_POSITIONS (verify)", () =>
      getAction("LAVARAGE_GET_POSITIONS").handler(agent, { status: "OPEN" }));

    if (posResult?.positions?.length > 0) {
      const p = posResult.positions[0];

      await test("CLOSE_POSITION", () =>
        getAction("LAVARAGE_CLOSE_POSITION").handler(agent, {
          positionAddress: p.address,
          slippageBps: 100,
        }));
    }
  }
}
process.exit(failed > 0 ? 1 : 0);
