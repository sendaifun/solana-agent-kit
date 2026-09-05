// Builds the ColdstarWallet the agent will hold.
//
// The agent gets a SESSION key bounded by a policy. The root key is not in
// this process, this repo, or this machine's environment: on Coldstar it lives
// as an encrypted keyfile on an air-gapped device and signs the policy, not
// transactions. Here, for a devnet demo, the session key is a throwaway
// Keypair persisted to .session.json so airdrops survive across runs.

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import qrcode from "qrcode-terminal";
import {
  ColdstarWallet,
  FileSpendLedger,
  type EscalationHandler,
  type Policy,
  type Verdict,
} from "@coldstar/agent-signer";

export const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";
if (/mainnet/i.test(RPC_URL)) {
  throw new Error("This example is devnet-only. Refusing to run against a mainnet RPC.");
}

function sessionKeypair(): Keypair {
  if (process.env.COLDSTAR_SESSION_KEY) {
    return Keypair.fromSecretKey(bs58.decode(process.env.COLDSTAR_SESSION_KEY));
  }
  if (existsSync(".session.json")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(".session.json", "utf8"))));
  }
  const kp = Keypair.generate();
  writeFileSync(".session.json", JSON.stringify(Array.from(kp.secretKey)));
  console.log(`generated a devnet session key -> .session.json (${kp.publicKey.toBase58()})`);
  return kp;
}

export const session = sessionKeypair();

export const ALLOWED_RECIPIENT = new PublicKey(
  process.env.ALLOWED_RECIPIENT ?? Keypair.generate().publicKey.toBase58(),
);
export const BLOCKED_RECIPIENT = new PublicKey(
  process.env.BLOCKED_RECIPIENT ?? Keypair.generate().publicKey.toBase58(),
);

/** coldstar.policy.json with $ENV placeholders filled in. */
export function loadPolicy(): Policy {
  const raw = readFileSync(new URL("../coldstar.policy.json", import.meta.url), "utf8")
    .replaceAll("$ALLOWED_RECIPIENT", ALLOWED_RECIPIENT.toBase58())
    .replaceAll("$BLOCKED_RECIPIENT", BLOCKED_RECIPIENT.toBase58());
  return JSON.parse(raw) as Policy;
}

/**
 * The air-gap hand-off, simulated. In production this is where the unsigned
 * transaction crosses to the offline Coldstar device by QR for a human to
 * approve. Here we print the QR and decline, so the caller sees the
 * ColdstarEscalation carrying the same payload.
 */
export const printQrAndDecline: EscalationHandler = async (tx, reason) => {
  const bytes =
    "version" in tx
      ? tx.serialize()
      : tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  console.log(`\n  ESCALATE: ${reason}`);
  console.log("  Unsigned transaction for the air-gapped device (scan with Coldstar):\n");
  qrcode.generate(Buffer.from(bytes).toString("base64"), { small: true }, (q) =>
    console.log(q.split("\n").map((l) => "  " + l).join("\n")),
  );
  return null; // nobody approved it in this demo
};

export function logDecision(v: Verdict): void {
  const amt = v.intent ? `${v.intent.outSol} SOL` : "unparsed";
  console.log(`  [policy] ${v.decision.padEnd(9)} ${amt.padEnd(12)} ${v.reason}`);
}

export function makeWallet(): ColdstarWallet {
  return new ColdstarWallet({
    policy: loadPolicy(),
    session,
    rpcUrl: RPC_URL,
    onEscalate: printQrAndDecline,
    onDecision: logDecision,
    // The daily cap survives restarts: a crashing-and-relaunching agent does not get a fresh 0.
    ledger: new FileSpendLedger(".coldstar-ledger.json"),
    // Off-chain message signing stays off: SIWS / order signatures can authorise
    // things the transaction policy never sees.
    allowMessageSigning: false,
  });
}
