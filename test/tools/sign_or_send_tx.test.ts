/**
 * Regression tests for signOrSendTX / KeypairWallet transaction detection.
 *
 * 1. A VersionedTransaction built with a different copy of @solana/web3.js
 *    (as happens when a plugin and core resolve separate copies) must be
 *    treated as a transaction, not as an instruction list.
 * 2. An array of transactions must return one signature per transaction.
 *
 * No network calls; nothing is sent on-chain.
 *
 * Run: npx tsx test/tools/sign_or_send_tx.test.ts
 */
import { createRequire } from "node:module";
import * as path from "node:path";
import * as web3 from "@solana/web3.js";
import {
  KeypairWallet,
  SolanaAgentKit,
  isTransaction,
  isVersionedTransaction,
  signOrSendTX,
} from "solana-agent-kit";

// Load a second, separate instance of @solana/web3.js by bypassing the
// require cache, so its classes fail `instanceof` against core's copy.
function loadForeignWeb3(): typeof web3 {
  const req = createRequire(__filename);
  const entry = req.resolve("@solana/web3.js");
  const cached = Object.keys(req.cache).filter((k) =>
    k.startsWith(path.dirname(entry)),
  );
  const saved = cached.map((k) => [k, req.cache[k]] as const);
  for (const k of cached) delete req.cache[k];
  const foreign = req(entry) as typeof web3;
  for (const [k, v] of saved) req.cache[k] = v;
  return foreign;
}

function assert(cond: unknown, msg: string) {
  if (!cond) {
    throw new Error(`✗ ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

async function main() {
  const rpc = "http://127.0.0.1:1"; // never contacted
  const payer = web3.Keypair.generate();
  const foreign = loadForeignWeb3();

  assert(
    foreign.VersionedTransaction !== web3.VersionedTransaction,
    "test setup: second web3.js instance loaded",
  );

  const message = new foreign.TransactionMessage({
    payerKey: new foreign.PublicKey(payer.publicKey.toBase58()),
    recentBlockhash: foreign.Keypair.generate().publicKey.toBase58(),
    instructions: [
      foreign.SystemProgram.transfer({
        fromPubkey: new foreign.PublicKey(payer.publicKey.toBase58()),
        toPubkey: foreign.Keypair.generate().publicKey,
        lamports: 1,
      }),
    ],
  }).compileToV0Message();
  const foreignTx = new foreign.VersionedTransaction(message);

  assert(
    !(foreignTx instanceof web3.VersionedTransaction),
    "test setup: instanceof fails across instances",
  );
  assert(isTransaction(foreignTx), "isTransaction detects foreign tx");
  assert(
    isVersionedTransaction(foreignTx as unknown as web3.VersionedTransaction),
    "isVersionedTransaction detects foreign tx",
  );
  assert(
    !isTransaction(
      web3.SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payer.publicKey,
        lamports: 1,
      }),
    ),
    "isTransaction rejects a TransactionInstruction",
  );

  // signOnly: foreign tx must be signed by the wallet, not rebuilt as instructions
  const signOnlyAgent = new SolanaAgentKit(new KeypairWallet(payer, rpc), rpc, {
    signOnly: true,
  });
  const signed = (await signOrSendTX(
    signOnlyAgent,
    foreignTx as unknown as web3.VersionedTransaction,
  )) as web3.VersionedTransaction;
  assert(signed === (foreignTx as unknown), "signOnly returns the same tx");
  assert(
    signed.signatures[0].some((b) => b !== 0),
    "foreign tx carries the payer signature",
  );

  // send path with several transactions: one signature per tx
  const sent: string[] = [];
  const mockWallet = new KeypairWallet(payer, rpc);
  mockWallet.signAndSendTransaction = async () => {
    const sig = `sig${sent.length + 1}`;
    sent.push(sig);
    return { signature: sig };
  };
  const sendAgent = new SolanaAgentKit(mockWallet, rpc, {});
  const legacy = () => {
    const tx = new web3.Transaction();
    tx.feePayer = payer.publicKey;
    return tx;
  };
  const sigs = await signOrSendTX(sendAgent, [legacy(), legacy()]);
  assert(
    Array.isArray(sigs) && sigs.length === 2 && sigs[1] === "sig2",
    "array of transactions returns one signature per tx",
  );

  console.log("\n✓ All signOrSendTX tests passed");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
