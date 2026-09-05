// Three scenarios, one wallet. Run with `npm run demo` (devnet, needs an
// airdrop) or `npm run demo:dry` (no network beyond a blockhash).
//
//   1. AUTO_SIGN  in-policy transfer to an allowlisted recipient -> session key signs
//   2. ESCALATE   over-threshold transfer -> unsigned tx goes to the human (QR), no signature here
//   3. REJECT     transfer to a blocklisted recipient -> no signature is ever produced
//
// Scenario 3 is the point of the whole design: a prompt-injected agent asking
// to drain the wallet gets a policy error, not a signature.

import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  type PublicKey,
} from "@solana/web3.js";
import { ColdstarEscalation, ColdstarRejected } from "@coldstar/agent-signer";
import { ALLOWED_RECIPIENT, BLOCKED_RECIPIENT, RPC_URL, makeWallet, session } from "./wallet.js";

const DRY = process.argv.includes("--dry-run");
const wallet = makeWallet();
const agent = new SolanaAgentKit(wallet, RPC_URL, {}).use(TokenPlugin);
const connection = new Connection(RPC_URL, "confirmed");

console.log(`session wallet  ${session.publicKey.toBase58()}`);
console.log(`allowed         ${ALLOWED_RECIPIENT.toBase58()}`);
console.log(`blocked         ${BLOCKED_RECIPIENT.toBase58()}`);
console.log(`mode            ${DRY ? "dry-run (verdicts only)" : "devnet (broadcasts AUTO_SIGN)"}\n`);

async function transferTx(to: PublicKey, sol: number): Promise<Transaction> {
  const { blockhash } = await connection.getLatestBlockhash();
  return new Transaction({ feePayer: session.publicKey, recentBlockhash: blockhash }).add(
    SystemProgram.transfer({ fromPubkey: session.publicKey, toPubkey: to, lamports: Math.round(sol * LAMPORTS_PER_SOL) }),
  );
}

async function ensureFunded(): Promise<boolean> {
  const bal = await connection.getBalance(session.publicKey);
  if (bal >= 0.05 * LAMPORTS_PER_SOL) return true;
  try {
    console.log("  requesting a devnet airdrop for the session wallet...");
    const sig = await connection.requestAirdrop(session.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    return true;
  } catch (e) {
    console.log(`  airdrop failed (${(e as Error).message.split("\n")[0]}); falling back to a dry verdict for scenario 1`);
    return false;
  }
}

async function scenario(n: number, title: string, run: () => Promise<void>) {
  console.log(`\n── ${n}. ${title}`);
  try {
    await run();
  } catch (e) {
    if (e instanceof ColdstarRejected) {
      console.log(`  -> ${e.name}: ${e.reason}`);
      console.log("  -> no signature was produced. This is the compromised-agent guardrail.");
    } else if (e instanceof ColdstarEscalation) {
      console.log(`  -> ${e.name}: waiting for a human on the air-gapped side (payload ${e.unsignedTxBase64.length} chars b64)`);
    } else {
      throw e;
    }
  }
}

await scenario(1, "AUTO_SIGN — 0.01 SOL to an allowlisted recipient", async () => {
  if (DRY || !(await ensureFunded())) {
    const v = wallet.verdict(await transferTx(ALLOWED_RECIPIENT, 0.01));
    console.log(`  -> verdict ${v.decision} (${v.reason})`);
    return;
  }
  // The same call any Solana Agent Kit tool makes; the wallet gates it.
  const sig = await agent.methods.transfer(agent, ALLOWED_RECIPIENT, 0.01);
  console.log(`  -> signed by the session key and broadcast: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
});

await scenario(2, "ESCALATE — 0.5 SOL, above the escalate threshold", async () => {
  // Built the way an agent tool would build it; policy decides before signing.
  await wallet.signTransaction(await transferTx(ALLOWED_RECIPIENT, 0.5));
});

await scenario(3, "REJECT — 0.001 SOL to a blocklisted recipient (the injected-agent case)", async () => {
  await wallet.signTransaction(await transferTx(BLOCKED_RECIPIENT, 0.001));
});

console.log("\ndone.");
