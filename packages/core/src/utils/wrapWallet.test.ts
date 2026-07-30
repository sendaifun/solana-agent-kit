/**
 * Unit tests for wrapWallet / beforeSign.
 * Run from packages/core:
 *   npx tsx --test src/utils/wrapWallet.test.ts
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import type { BaseWallet } from "../types/wallet";
import { type BeforeSignContext, wrapWallet } from "./wrapWallet";

function mockWallet(publicKey: PublicKey): BaseWallet & {
  signCalls: number;
  sendCalls: number;
} {
  const state = { signCalls: 0, sendCalls: 0 };
  const wallet: BaseWallet & {
    signCalls: number;
    sendCalls: number;
  } = {
    get publicKey() {
      return publicKey;
    },
    get signCalls() {
      return state.signCalls;
    },
    get sendCalls() {
      return state.sendCalls;
    },
    async signTransaction(tx) {
      state.signCalls += 1;
      return tx;
    },
    async signAllTransactions(txs) {
      state.signCalls += txs.length;
      return txs;
    },
    async signAndSendTransaction(_tx) {
      state.signCalls += 1;
      state.sendCalls += 1;
      return { signature: "mock-sig" };
    },
    async sendTransaction(_tx) {
      state.sendCalls += 1;
      return "mock-send";
    },
    async signMessage(message) {
      return message;
    },
  };
  return wallet;
}

function dummyTx(from: PublicKey): Transaction {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: from,
      lamports: 1,
    }),
  );
  tx.feePayer = from;
  tx.recentBlockhash = Keypair.generate().publicKey.toBase58().slice(0, 32);
  // recentBlockhash must be valid base58 32-byte - use a real one from a dummy blockhash pattern
  // web3.js accepts any string for unit tests that never serialize to chain
  tx.recentBlockhash = "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N";
  return tx;
}

test("beforeSign is invoked on signTransaction with mode=sign", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const seen: BeforeSignContext[] = [];
  const wrapped = wrapWallet(inner, (ctx) => {
    seen.push(ctx);
  });
  const tx = dummyTx(kp.publicKey);
  await wrapped.signTransaction(tx);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].mode, "sign");
  assert.equal(seen[0].publicKey.toBase58(), kp.publicKey.toBase58());
  assert.equal(inner.signCalls, 1);
});

test("beforeSign throw aborts signAndSend (inner wallet never called)", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const wrapped = wrapWallet(inner, () => {
    throw new Error("policy refuse");
  });
  const tx = dummyTx(kp.publicKey);
  await assert.rejects(
    () => wrapped.signAndSendTransaction(tx),
    /policy refuse/,
  );
  assert.equal(inner.signCalls, 0);
  assert.equal(inner.sendCalls, 0);
});

test("beforeSign throw aborts signAll before any sign", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  let calls = 0;
  const wrapped = wrapWallet(inner, () => {
    calls += 1;
    throw new Error("blocked");
  });
  const txs = [dummyTx(kp.publicKey), dummyTx(kp.publicKey)];
  await assert.rejects(() => wrapped.signAllTransactions(txs), /blocked/);
  assert.equal(calls, 1);
  assert.equal(inner.signCalls, 0);
});

test("sendTransaction path is guarded when present", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const modes: string[] = [];
  const wrapped = wrapWallet(inner, (ctx) => {
    modes.push(ctx.mode);
  });
  assert.ok(wrapped.sendTransaction);
  await wrapped.sendTransaction!(dummyTx(kp.publicKey));
  assert.deepEqual(modes, ["send"]);
  assert.equal(inner.sendCalls, 1);
});

test("signMessage is not guarded (not a spend path)", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  let hookCalls = 0;
  const wrapped = wrapWallet(inner, () => {
    hookCalls += 1;
  });
  const msg = new Uint8Array([1, 2, 3]);
  const out = await wrapped.signMessage(msg);
  assert.deepEqual(out, msg);
  assert.equal(hookCalls, 0);
});

test("async beforeSign reject aborts sign", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const wrapped = wrapWallet(inner, async () => {
    throw new Error("async refuse");
  });
  await assert.rejects(
    () => wrapped.signTransaction(dummyTx(kp.publicKey)),
    /async refuse/,
  );
  assert.equal(inner.signCalls, 0);
});

test("VersionedTransaction is accepted by the guard", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  let mode = "";
  const wrapped = wrapWallet(inner, (ctx) => {
    mode = ctx.mode;
  });
  const msg = new TransactionMessage({
    payerKey: kp.publicKey,
    recentBlockhash: "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
    instructions: [
      SystemProgram.transfer({
        fromPubkey: kp.publicKey,
        toPubkey: kp.publicKey,
        lamports: 1,
      }),
    ],
  }).compileToV0Message();
  const vtx = new VersionedTransaction(msg);
  await wrapped.signTransaction(vtx);
  assert.equal(mode, "sign");
  assert.equal(inner.signCalls, 1);
});

test("SolanaAgentKit constructor wires beforeSign onto agent.wallet", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const agent = new SolanaAgentKit(inner, "http://127.0.0.1:8899", {
    beforeSign: () => {
      throw new Error("constructor-wired refuse");
    },
  });
  await assert.rejects(
    () => agent.wallet.signAndSendTransaction(dummyTx(kp.publicKey)),
    /constructor-wired refuse/,
  );
  assert.equal(inner.signCalls, 0);
});

test("SolanaAgentKit without beforeSign leaves wallet unwrapped", async () => {
  const kp = Keypair.generate();
  const inner = mockWallet(kp.publicKey);
  const agent = new SolanaAgentKit(inner, "http://127.0.0.1:8899", {});
  assert.equal(agent.wallet, inner);
  await agent.wallet.signTransaction(dummyTx(kp.publicKey));
  assert.equal(inner.signCalls, 1);
});
