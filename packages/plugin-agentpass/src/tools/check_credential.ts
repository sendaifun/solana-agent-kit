import type { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";

const AGENTPASS_API = process.env.AGENTPASS_API_URL || "https://api.agentpass.space";
const PROGRAM_ID = new PublicKey("7HuhmDEqdMn39DqzCFyxmjMQPbJvdtrDGLZm9bxgUzBw");

/**
 * Check if an agent has a specific credential, both off-chain and on-chain.
 */
export async function check_credential(
  agent: SolanaAgentKit,
  input: {
    passport_id: string;
    credential_type?: string;
    credential_hash?: string;
  }
): Promise<{
  has_credential: boolean;
  credentials: Array<{
    type: string;
    issuer: string;
    anchored_onchain: boolean;
  }>;
  error?: string;
}> {
  const { passport_id, credential_type, credential_hash } = input;

  // 1. Check credentials via AgentPass API
  let credentials: any[] = [];
  try {
    const url = new URL(`${AGENTPASS_API}/v1/passports/${passport_id}/credentials`);
    if (credential_type) url.searchParams.set("type", credential_type);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      credentials = data.credentials ?? data ?? [];
    }
  } catch (err: any) {
    return { has_credential: false, credentials: [], error: `API error: ${err.message}` };
  }

  // 2. For each credential, check if anchored on-chain
  const results = await Promise.all(
    credentials.map(async (cred: any) => {
      let anchored = false;

      try {
        // Compute credential hash
        const hash = credential_hash
          ? Buffer.from(credential_hash, "hex")
          : createHash("sha256").update(JSON.stringify(cred)).digest();

        const [passportPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("passport"), Buffer.from(passport_id)],
          PROGRAM_ID
        );

        const [credentialPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("credential"), passportPda.toBuffer(), hash],
          PROGRAM_ID
        );

        const accountInfo = await agent.connection.getAccountInfo(credentialPda);
        anchored = accountInfo !== null;
      } catch {
        // On-chain check failed, that's ok
      }

      return {
        type: cred.type || cred.credential_type || "unknown",
        issuer: cred.issuer || "unknown",
        anchored_onchain: anchored,
      };
    })
  );

  return {
    has_credential: results.length > 0,
    credentials: results,
  };
}
