// The COLD side of the demo: sign the policy with the root key.
//
// In production this runs on the air-gapped Coldstar device and the root secret
// never touches a networked machine. Here, for a devnet demo, a throwaway root
// keypair is generated into .root.json on this machine so you can watch the
// whole flow. Do not confuse the two.
//
//   npm run sign-policy        # writes envelope.json for the current session key
//
// The online side (src/wallet.ts) then refuses to run unless envelope.json
// verifies against the root it was signed with and names the session key it
// actually holds.

import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Keypair } from "@solana/web3.js";
import { signPolicyEnvelope, parsePolicy } from "@coldstar/agent-signer";
import { ALLOWED_RECIPIENT, BLOCKED_RECIPIENT, session } from "./wallet.js";

function rootKeypair(): Keypair {
  if (existsSync(".root.json")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(".root.json", "utf8"))));
  }
  const kp = Keypair.generate();
  writeFileSync(".root.json", JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
  console.log(`generated a DEMO root key -> .root.json (${kp.publicKey.toBase58()}). In production this file lives on the air-gapped device only.`);
  return kp;
}

const root = rootKeypair();
const raw = readFileSync(new URL("../coldstar.policy.json", import.meta.url), "utf8")
  .replaceAll("$ALLOWED_RECIPIENT", ALLOWED_RECIPIENT.toBase58())
  .replaceAll("$BLOCKED_RECIPIENT", BLOCKED_RECIPIENT.toBase58());
const policy = parsePolicy(JSON.parse(raw));

const envelope = signPolicyEnvelope({
  rootSecretKey: root.secretKey,
  policy,
  sessionPubkey: session.publicKey.toBase58(),
  expiresAt: new Date(Date.now() + 24 * 3_600_000), // short grants are the point
});
writeFileSync("envelope.json", JSON.stringify(envelope, null, 2) + "\n");
console.log(`envelope.json written: root ${envelope.rootPubkey} authorises session ${envelope.sessionPubkey} until ${envelope.expiresAt}`);
console.log("The root key is not needed again until the policy changes or the grant expires.");
