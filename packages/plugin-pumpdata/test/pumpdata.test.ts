import assert from "node:assert/strict";
import { createPublicKey, randomBytes, verify } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";
import PumpDataPlugin, {
  PUMPDATA_BASE_URL,
  PumpDataApiError,
  SOLANA_MAINNET_CAIP2,
  USDC_MAINNET_MINT,
  createAgentPaymentSigner,
} from "../src";
import {
  pumpdataGetBaseRate,
  pumpdataGetLaunch,
  pumpdataGetSimilar,
  pumpdataGetStats,
  pumpdataGetWallets,
} from "../src/pumpdata/tools";

// All HTTP below is mocked. The wallet is a keypair generated for the test,
// never funded; what it signs goes only to the mock and is never sent.

const RPC_URL = "http://rpc.test";
const MINT = "D27Lb9LA6D4dFpogGoXMXvZYkRsZ7UuctxAFpFQ3pump";
const PAY_TO = "BrYj2PMe2YLpEYnUkUDm5B5age2zTp3chWJr2hoAmG5S";
const FEE_PAYER = Keypair.generate().publicKey.toBase58();
const BLOCKHASH = new PublicKey(randomBytes(32)).toBase58();
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

interface Call {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

type Route = (call: Call) => Response | undefined;

let calls: Call[] = [];
let route: Route;
const realFetch = globalThis.fetch;

function offer(amount: string, network: string = SOLANA_MAINNET_CAIP2) {
  return {
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: { url: `${PUMPDATA_BASE_URL}/launch/${MINT}` },
    accepts: [
      {
        scheme: "exact",
        network,
        amount,
        asset: USDC_MAINNET_MINT,
        payTo: PAY_TO,
        maxTimeoutSeconds: 120,
        extra: { name: "USDC", feePayer: FEE_PAYER },
      },
    ],
  };
}

function paymentRequired(amount: string, network?: string): Response {
  const body = offer(amount, network);
  return new Response(JSON.stringify(body), {
    status: 402,
    headers: {
      "content-type": "application/json",
      "payment-required": Buffer.from(JSON.stringify(body)).toString("base64"),
    },
  });
}

function json(status: number, body: unknown, headers = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function receiptHeader(): Record<string, string> {
  const receipt = {
    success: true,
    transaction: "5Pay1111111111111111111111111111111111111111",
    network: SOLANA_MAINNET_CAIP2,
    payer: "payer",
  };
  return {
    "payment-response": Buffer.from(JSON.stringify(receipt)).toString("base64"),
  };
}

// A USDC mint account as getAccountInfo returns it: 82 bytes, 6 decimals.
function mintAccount(): Response {
  const data = Buffer.alloc(82);
  data[44] = 6;
  data[45] = 1;
  return rpcResult({
    context: { slot: 1 },
    value: {
      data: [data.toString("base64"), "base64"],
      executable: false,
      lamports: 1461600,
      owner: TOKEN_PROGRAM,
      rentEpoch: 0,
      space: 82,
    },
  });
}

let rpcId: unknown = 0;
function rpcResult(result: unknown): Response {
  return json(200, { jsonrpc: "2.0", id: rpcId, result });
}

function rpcRoute(call: Call): Response | undefined {
  if (!call.url.startsWith(RPC_URL)) {
    return undefined;
  }
  const request = JSON.parse(call.body);
  rpcId = request.id;
  if (request.method === "getAccountInfo") {
    return mintAccount();
  }
  if (request.method === "getLatestBlockhash") {
    return rpcResult({
      context: { slot: 1 },
      value: { blockhash: BLOCKHASH, lastValidBlockHeight: 100 },
    });
  }
  throw new Error(`unexpected RPC method ${request.method}`);
}

function apiCalls(): Call[] {
  return calls.filter((call) => call.url.startsWith(PUMPDATA_BASE_URL));
}

function makeAgent() {
  const keypair = Keypair.generate();
  const wallet = new KeypairWallet(keypair, RPC_URL);
  let signed = 0;
  const signTransaction = wallet.signTransaction.bind(wallet);
  wallet.signTransaction = async (tx) => {
    signed++;
    return signTransaction(tx);
  };
  const agent = new SolanaAgentKit(wallet, RPC_URL, {});
  return { agent, keypair, signedCount: () => signed };
}

function verifyEd25519(
  message: Uint8Array,
  signature: Uint8Array,
  key: PublicKey,
) {
  const spki = Buffer.concat([
    Buffer.from("302a300506032b6570032100", "hex"),
    key.toBuffer(),
  ]);
  return verify(
    null,
    message,
    createPublicKey({ key: spki, format: "der", type: "spki" }),
    signature,
  );
}

beforeEach(() => {
  calls = [];
  route = () => undefined;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const call: Call = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: await request.text(),
    };
    calls.push(call);
    const response = rpcRoute(call) ?? route(call);
    if (!response) {
      throw new Error(`unexpected request ${call.method} ${call.url}`);
    }
    return response;
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("plugin shape", () => {
  it("registers six methods and six actions", () => {
    assert.equal(PumpDataPlugin.name, "pumpdata");
    assert.deepEqual(Object.keys(PumpDataPlugin.methods).sort(), [
      "pumpdataGetBaseRate",
      "pumpdataGetDeployer",
      "pumpdataGetLaunch",
      "pumpdataGetSimilar",
      "pumpdataGetStats",
      "pumpdataGetWallets",
    ]);
    assert.deepEqual(
      PumpDataPlugin.actions.map((action) => action.name).sort(),
      [
        "PUMPDATA_GET_BASE_RATE",
        "PUMPDATA_GET_DEPLOYER",
        "PUMPDATA_GET_LAUNCH",
        "PUMPDATA_GET_SIMILAR",
        "PUMPDATA_GET_STATS",
        "PUMPDATA_GET_WALLETS",
      ],
    );
  });

  it("loads into an agent with .use()", () => {
    const { agent } = makeAgent();
    const withPlugin = agent.use(PumpDataPlugin);
    assert.equal(typeof withPlugin.methods.pumpdataGetLaunch, "function");
    assert.equal(withPlugin.actions.length, 6);
  });
});

describe("free stats", () => {
  it("fetches /stats.json without paying", async () => {
    const { agent, signedCount } = makeAgent();
    route = (call) =>
      call.url === `${PUMPDATA_BASE_URL}/stats.json`
        ? json(200, { day: "2026-10-19", summary: "51,283 coins launched." })
        : undefined;

    const result = await pumpdataGetStats(agent);
    assert.equal(result.data.day, "2026-10-19");
    assert.equal(result.priceUsd, 0);
    assert.equal(apiCalls().length, 1);
    assert.equal(apiCalls()[0].headers.get("payment-signature"), null);
    assert.equal(signedCount(), 0);
  });

  it("asks for a past day by date", async () => {
    const { agent } = makeAgent();
    route = (call) =>
      call.url === `${PUMPDATA_BASE_URL}/stats/2026-10-16.json`
        ? json(200, { day: "2026-10-16" })
        : undefined;
    const result = await pumpdataGetStats(agent, "2026-10-16");
    assert.equal(result.data.day, "2026-10-16");
    await assert.rejects(pumpdataGetStats(agent, "16 Oct"), /YYYY-MM-DD/);
  });

  it("never pays if the free call answers 402", async () => {
    const { agent, signedCount } = makeAgent();
    route = () => paymentRequired("5000");
    await assert.rejects(pumpdataGetStats(agent), PumpDataApiError);
    assert.equal(signedCount(), 0);
    assert.equal(apiCalls().length, 1);
  });

  it("the action quotes the answer's own summary", async () => {
    const { agent } = makeAgent();
    route = () =>
      json(200, { summary: "51,283 coins launched; 1,022 graduated." });
    const action = PumpDataPlugin.actions.find(
      (a) => a.name === "PUMPDATA_GET_STATS",
    )!;
    const result = await action.handler(agent, {});
    assert.equal(result.status, "success");
    assert.equal(result.summary, "51,283 coins launched; 1,022 graduated.");
    assert.equal(result.paidUsd, 0);
  });
});

describe("paid calls over x402", () => {
  it("answers the 402 by paying with the agent's wallet and retrying", async () => {
    const { agent, keypair, signedCount } = makeAgent();
    route = (call) => {
      if (call.url !== `${PUMPDATA_BASE_URL}/launch/${MINT}`) {
        return undefined;
      }
      if (!call.headers.get("payment-signature")) {
        return paymentRequired("5000");
      }
      return json(
        200,
        {
          mint: MINT,
          summary: "A deployer with 14 launches and 1 graduation.",
        },
        { "x-data-as-of": "2026-10-19T18:01:00Z", ...receiptHeader() },
      );
    };

    const result = await pumpdataGetLaunch(agent, MINT);

    // Two requests: unpaid, then paid.
    const [unpaid, paid] = apiCalls();
    assert.equal(apiCalls().length, 2);
    assert.equal(unpaid.headers.get("payment-signature"), null);
    assert.equal(signedCount(), 1);

    // The PAYMENT-SIGNATURE header is an x402 v2 payload for the offer.
    const header = paid.headers.get("payment-signature")!;
    const payload = JSON.parse(Buffer.from(header, "base64").toString());
    assert.equal(payload.x402Version, 2);
    assert.equal(payload.accepted.amount, "5000");
    assert.equal(payload.accepted.payTo, PAY_TO);

    // The transaction: facilitator pays the fee, the agent signs the transfer.
    const tx = VersionedTransaction.deserialize(
      Buffer.from(payload.payload.transaction, "base64"),
    );
    const keys = tx.message.staticAccountKeys.map((k) => k.toBase58());
    assert.equal(keys[0], FEE_PAYER);
    assert.equal(tx.message.recentBlockhash, BLOCKHASH);
    const agentIndex = keys.indexOf(keypair.publicKey.toBase58());
    assert.ok(
      agentIndex > 0 && agentIndex < tx.message.header.numRequiredSignatures,
    );
    assert.ok(
      verifyEd25519(
        tx.message.serialize(),
        tx.signatures[agentIndex],
        keypair.publicKey,
      ),
      "the agent's signature verifies",
    );
    // The fee payer's slot is left for the facilitator.
    assert.ok(tx.signatures[0].every((byte) => byte === 0));

    // transferChecked of 5000 base units (0.005 USDC, 6 decimals).
    const transfer = tx.message.compiledInstructions.find(
      (ix) => keys[ix.programIdIndex] === TOKEN_PROGRAM,
    )!;
    const data = Buffer.from(transfer.data);
    assert.equal(data[0], 12);
    assert.equal(data.readBigUInt64LE(1), 5000n);
    assert.equal(data[9], 6);

    assert.equal(result.data.mint, MINT);
    assert.equal(result.dataAsOf, "2026-10-19T18:01:00Z");
    assert.equal(result.payment?.success, true);
    assert.equal(result.priceUsd, 0.005);
  });

  it("refuses an offer above the call's listed price without signing", async () => {
    const { agent, signedCount } = makeAgent();
    route = () => paymentRequired("20000"); // $0.02 for a $0.005 call

    await assert.rejects(pumpdataGetLaunch(agent, MINT), /could not be paid/);
    assert.equal(signedCount(), 0);
    assert.equal(apiCalls().length, 1);
  });

  it("refuses an offer on another network", async () => {
    const { agent, signedCount } = makeAgent();
    route = () =>
      paymentRequired("5000", "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1");
    await assert.rejects(pumpdataGetLaunch(agent, MINT), /could not be paid/);
    assert.equal(signedCount(), 0);
  });

  it("reports a refused payment (402 after paying) as an error", async () => {
    const { agent } = makeAgent();
    route = (call) =>
      call.headers.get("payment-signature")
        ? json(402, { error: "payment_invalid", reason: "insufficient_funds" })
        : paymentRequired("5000");
    await assert.rejects(pumpdataGetLaunch(agent, MINT), (error: any) => {
      assert.ok(error instanceof PumpDataApiError);
      assert.equal(error.status, 402);
      assert.match(error.message, /payment_invalid: insufficient_funds/);
      return true;
    });
    // One unpaid request, one paid; no second payment.
    assert.equal(apiCalls().length, 2);
  });

  it("maps a 404 to an error that says nothing was charged", async () => {
    const { agent, signedCount } = makeAgent();
    route = () => json(404, { error: "not_found" });
    await assert.rejects(pumpdataGetLaunch(agent, MINT), (error: any) => {
      assert.ok(error instanceof PumpDataApiError);
      assert.equal(error.status, 404);
      assert.match(error.message, /Nothing was charged/);
      return true;
    });
    assert.equal(signedCount(), 0);
  });

  it("posts up to 50 wallets with the mint, capped at $0.01", async () => {
    const { agent } = makeAgent();
    const addresses = [Keypair.generate().publicKey.toBase58()];
    route = (call) => {
      if (call.url !== `${PUMPDATA_BASE_URL}/wallets`) return undefined;
      if (!call.headers.get("payment-signature")) {
        return paymentRequired("10000");
      }
      return json(
        200,
        { [addresses[0]]: { class: "new", pnl_sol: 0, coins: 0 } },
        receiptHeader(),
      );
    };

    const result = await pumpdataGetWallets(agent, addresses, MINT);
    const [unpaid, paid] = apiCalls();
    assert.equal(unpaid.method, "POST");
    assert.deepEqual(JSON.parse(unpaid.body), { addresses, mint: MINT });
    assert.deepEqual(JSON.parse(paid.body), { addresses, mint: MINT });
    assert.equal(result.data[addresses[0]].class, "new");
    assert.equal(result.priceUsd, 0.01);

    await assert.rejects(
      pumpdataGetWallets(agent, new Array(51).fill(addresses[0])),
      /1 to 50/,
    );
  });

  it("builds the similar and baserate queries", async () => {
    const { agent } = makeAgent();
    const seen: string[] = [];
    route = (call) => {
      seen.push(call.url);
      return call.headers.get("payment-signature")
        ? json(200, {}, receiptHeader())
        : paymentRequired("5000");
    };
    await pumpdataGetSimilar(agent, MINT, 5);
    await pumpdataGetBaseRate(agent, {
      band: "15k-28k",
      from: "2026-10-16T00:00:00Z",
      to: "2026-10-17T00:00:00Z",
    });
    assert.ok(seen.includes(`${PUMPDATA_BASE_URL}/similar/${MINT}?limit=5`));
    assert.ok(
      seen.includes(
        `${PUMPDATA_BASE_URL}/baserate?band=15k-28k&from=2026-10-16T00%3A00%3A00Z&to=2026-10-17T00%3A00%3A00Z&venue=any`,
      ),
    );
    await assert.rejects(pumpdataGetSimilar(agent, MINT, 26), /1 to 25/);
  });

  it("actions return status error instead of throwing", async () => {
    const { agent } = makeAgent();
    route = () => json(400, { error: "bad_request", detail: "band" });
    const action = PumpDataPlugin.actions.find(
      (a) => a.name === "PUMPDATA_GET_LAUNCH",
    )!;
    const result = await action.handler(agent, { mint: MINT });
    assert.equal(result.status, "error");
    assert.match(result.message, /400/);
  });

  it("action schemas reject malformed input", () => {
    const launch = PumpDataPlugin.actions.find(
      (a) => a.name === "PUMPDATA_GET_LAUNCH",
    )!;
    assert.equal(
      launch.schema.safeParse({ mint: "not-an-address!" }).success,
      false,
    );
    assert.equal(launch.schema.safeParse({ mint: MINT }).success, true);
    const wallets = PumpDataPlugin.actions.find(
      (a) => a.name === "PUMPDATA_GET_WALLETS",
    )!;
    assert.equal(wallets.schema.safeParse({ addresses: [] }).success, false);
  });
});

describe("payment signer", () => {
  it("refuses a wallet that changes the transaction while signing", async () => {
    const { agent } = makeAgent();
    agent.wallet.signTransaction = async (tx: any) => {
      tx.message.recentBlockhash = new PublicKey(randomBytes(32)).toBase58();
      return tx;
    };
    route = () => paymentRequired("5000");
    await assert.rejects(pumpdataGetLaunch(agent, MINT), /changed the payment/);
  });

  it("signs as the agent's own address", () => {
    const { agent, keypair } = makeAgent();
    const signer = createAgentPaymentSigner(agent);
    assert.equal(signer.address, keypair.publicKey.toBase58());
  });
});
