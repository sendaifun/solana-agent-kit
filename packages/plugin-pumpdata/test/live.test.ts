import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Keypair } from "@solana/web3.js";
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";
import {
  PUMPDATA_BASE_URL,
  PUMPDATA_PRICES_USD,
  SOLANA_MAINNET_CAIP2,
  USDC_MAINNET_MINT,
} from "../src";
import { pumpdataGetStats } from "../src/pumpdata/tools";

// Live checks against pumpdata.fun, run with PUMPDATA_LIVE=1.
// They never pay: the free call goes through the plugin (which never pays for
// it), and each paid endpoint is called with plain fetch to read its 402 offer.

const live = process.env.PUMPDATA_LIVE === "1";
const MINT = "D27Lb9LA6D4dFpogGoXMXvZYkRsZ7UuctxAFpFQ3pump";
const ADDRESS = "7ufmve7ZSFCzuNcKRunYrGtyb2Ka1MXzkWwf7jZhVsmL";

const paidCalls: Array<{
  call: keyof typeof PUMPDATA_PRICES_USD;
  path: string;
  init?: RequestInit;
}> = [
  { call: "launch", path: `/launch/${MINT}` },
  {
    call: "wallets",
    path: "/wallets",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: [ADDRESS] }),
    },
  },
  { call: "deployer", path: `/deployer/${ADDRESS}` },
  { call: "similar", path: `/similar/${MINT}` },
  {
    call: "baserate",
    path: "/baserate?band=15k-28k&from=2026-10-16T00:00:00Z&to=2026-10-17T00:00:00Z&venue=any",
  },
];

describe("pumpdata.fun live", { skip: !live && "set PUMPDATA_LIVE=1" }, () => {
  it("free /stats.json answers 200 through the plugin", async () => {
    const agent = new SolanaAgentKit(
      new KeypairWallet(Keypair.generate(), "http://127.0.0.1:1"),
      "http://127.0.0.1:1",
      {},
    );
    const result = await pumpdataGetStats(agent);
    assert.equal(typeof result.data.summary, "string");
    assert.equal(result.priceUsd, 0);
    console.log(`  GET /stats.json -> 200, day ${result.data.day}`);
  });

  for (const { call, path, init } of paidCalls) {
    it(`unpaid ${call} answers 402 at its listed price`, async () => {
      const response = await fetch(`${PUMPDATA_BASE_URL}${path}`, init);
      assert.equal(response.status, 402);
      const header = response.headers.get("payment-required");
      assert.ok(header, "PAYMENT-REQUIRED header present");
      const offer = JSON.parse(Buffer.from(header, "base64").toString());
      assert.equal(offer.x402Version, 2);
      const accept = offer.accepts[0];
      assert.equal(accept.scheme, "exact");
      assert.equal(accept.network, SOLANA_MAINNET_CAIP2);
      assert.equal(accept.asset, USDC_MAINNET_MINT);
      assert.ok(accept.extra?.feePayer, "facilitator fee payer named");
      const usd = Number(accept.amount) / 1e6;
      assert.equal(usd, PUMPDATA_PRICES_USD[call]);
      console.log(
        `  ${init?.method ?? "GET"} ${path.split("?")[0]} -> 402, ${accept.amount} USDC base units ($${usd})`,
      );
    });
  }
});
