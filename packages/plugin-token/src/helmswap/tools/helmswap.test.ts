import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { HelmswapApi, HelmswapApiError } from "./api";
import { HELMSWAP_SOL_MINT } from "./constants";
import { getHelmswapQuote } from "./quote";
import { tradeWithHelmswap } from "./trade";

const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USER = new PublicKey(new Uint8Array(32).fill(2));
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(handler: (input: string, init?: RequestInit) => any) {
  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.url;
    const result = await handler(url, init);
    if (result instanceof Response) {
      return result;
    }
    return new Response(JSON.stringify(result.body), {
      status: result.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

function sampleQuote(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    chain: "solana",
    dryRun: true,
    broadcast: false,
    quoteTicket: { sig: "ticket", quotedOutNet: "701353" },
    quote: {
      netOutAmount: "701353",
      minNetOutAmount: "697846",
      fee: { disclosed: true, feeBps: 25, amount: "25000" },
    },
    ...overrides,
  };
}

function unsignedSwapTx(): string {
  const message = new TransactionMessage({
    payerKey: USER,
    recentBlockhash: "11111111111111111111111111111111",
    instructions: [
      SystemProgram.transfer({
        fromPubkey: USER,
        toPubkey: USER,
        lamports: 1,
      }),
    ],
  }).compileToV0Message();
  return Buffer.from(new VersionedTransaction(message).serialize()).toString(
    "base64",
  );
}

function stubAgent(config: Record<string, unknown> = {}) {
  const signed: VersionedTransaction[] = [];
  const agent = {
    config: { signOnly: true, ...config },
    wallet: {
      publicKey: USER,
      signTransaction: async (tx: VersionedTransaction) => {
        signed.push(tx);
        return tx;
      },
    },
    connection: {},
    _signed: signed,
  };
  return agent as any;
}

test("quote request uses Solana params and base units", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  mockFetch(async (url, init) => {
    calls.push({ url, init });
    return { body: sampleQuote() };
  });

  const result = await getHelmswapQuote(
    stubAgent(),
    USDC,
    0.01,
    HELMSWAP_SOL_MINT,
    50,
  );

  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, "/api/v1/quote");
  assert.equal(url.searchParams.get("chain"), "solana");
  assert.equal(url.searchParams.get("inputMint"), HELMSWAP_SOL_MINT.toBase58());
  assert.equal(url.searchParams.get("outputMint"), USDC.toBase58());
  assert.equal(url.searchParams.get("amount"), "10000000");
  assert.equal(url.searchParams.get("slippageBps"), "50");
  assert.equal(
    calls[0].init?.headers && (calls[0].init.headers as any)["X-Helm-Key"],
    undefined,
  );
  assert.equal(result.expectedOut, "701353");
  assert.equal(result.minOut, "697846");
  assert.equal((result.fee as any).feeBps, 25);
  assert.equal("quoteTicket" in result, false);
});

test("API errors include status and code", async () => {
  mockFetch(async () => ({
    status: 429,
    body: { ok: false, error: "Too many requests", code: "RATE_LIMIT" },
  }));
  const api = new HelmswapApi();
  await assert.rejects(
    () => api.quote({ chain: "solana" }),
    (err: any) => {
      assert.equal(err instanceof HelmswapApiError, true);
      assert.equal(err.status, 429);
      assert.equal(err.code, "RATE_LIMIT");
      assert.match(err.message, /Too many requests/);
      return true;
    },
  );
});

test("tradeWithHelmswap requires an API key", async () => {
  await assert.rejects(
    () => tradeWithHelmswap(stubAgent(), USDC, 0.01),
    /HELMSWAP_API_KEY/,
  );
});

test("tradeWithHelmswap builds with the wallet as user and signs the returned tx", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const txB64 = unsignedSwapTx();
  mockFetch(async (url, init) => {
    calls.push({ url, init });
    if (url.includes("/api/v1/quote")) {
      return { body: sampleQuote() };
    }
    if (url.includes("/api/v1/build-tx")) {
      return { body: { ok: true, tx: { transactionBase64: txB64 } } };
    }
    return { status: 404, body: { error: "not found" } };
  });

  const agent = stubAgent({ HELMSWAP_API_KEY: "hsk_testkey" });
  const result = await tradeWithHelmswap(
    agent,
    USDC,
    0.01,
    HELMSWAP_SOL_MINT,
    50,
  );

  assert.equal(calls.length, 2);
  const quoteHeaders = calls[0].init?.headers as Record<string, string>;
  const buildHeaders = calls[1].init?.headers as Record<string, string>;
  assert.equal(quoteHeaders["X-Helm-Key"], "hsk_testkey");
  assert.equal(buildHeaders["X-Helm-Key"], "hsk_testkey");
  assert.equal(calls[1].init?.method, "POST");
  const body = JSON.parse(String(calls[1].init?.body));
  assert.equal(body.chain, "solana");
  assert.equal(body.inputMint, HELMSWAP_SOL_MINT.toBase58());
  assert.equal(body.outputMint, USDC.toBase58());
  assert.equal(body.amount, "10000000");
  assert.equal(body.user, USER.toBase58());
  assert.equal(body.quoteTicket.sig, "ticket");
  assert.equal(body.slippageBps, 50);
  assert.equal(agent._signed.length, 1);
  assert.equal(result.expectedOut, "701353");
  assert.equal(result.minOut, "697846");
  assert.equal(result.transaction, agent._signed[0]);
});

test("tradeWithHelmswap refuses a quote that is not buildable", async () => {
  mockFetch(async () => ({
    body: sampleQuote({
      priceImpact: {
        buildable: false,
        warning: "Price impact is too high",
        priceImpactPct: 20,
      },
    }),
  }));

  await assert.rejects(
    () =>
      tradeWithHelmswap(
        stubAgent({ HELMSWAP_API_KEY: "hsk_testkey" }),
        USDC,
        0.01,
      ),
    /Price impact is too high/,
  );
});
