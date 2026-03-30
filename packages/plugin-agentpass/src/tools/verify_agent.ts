import type { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

const AGENTPASS_API = process.env.AGENTPASS_API_URL || "https://api.agentpass.space";
const PROGRAM_ID = new PublicKey("7HuhmDEqdMn39DqzCFyxmjMQPbJvdtrDGLZm9bxgUzBw");

/**
 * Verify an agent's identity via AgentPass.
 * Checks both off-chain (AgentPass API) and on-chain (Solana program) records.
 */
export async function verify_agent(
  agent: SolanaAgentKit,
  input: { passport_id: string; check_onchain?: boolean }
): Promise<{
  verified: boolean;
  passport_id: string;
  name?: string;
  email?: string;
  onchain_bound?: boolean;
  credential_count?: number;
  error?: string;
}> {
  const { passport_id, check_onchain = true } = input;

  // 1. Verify via AgentPass API
  let passport: any;
  try {
    const res = await fetch(`${AGENTPASS_API}/v1/passports/${passport_id}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { verified: false, passport_id, error: `Passport not found (${res.status})` };
    }
    const data = await res.json();
    passport = data.passport ?? data;
  } catch (err: any) {
    return { verified: false, passport_id, error: `API error: ${err.message}` };
  }

  if (passport.status && passport.status !== "active") {
    return { verified: false, passport_id, error: `Passport status: ${passport.status}` };
  }

  const result: any = {
    verified: true,
    passport_id,
    name: passport.name,
    email: passport.email,
  };

  // 2. Check on-chain binding if requested
  if (check_onchain) {
    try {
      const [passportPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("passport"), Buffer.from(passport_id)],
        PROGRAM_ID
      );

      const accountInfo = await agent.connection.getAccountInfo(passportPda);
      if (accountInfo) {
        result.onchain_bound = true;
        // Parse credential_count from account data (offset after passport_id string + authority pubkey)
        // Simplified: just mark as bound
      } else {
        result.onchain_bound = false;
      }
    } catch {
      result.onchain_bound = false;
    }
  }

  return result;
}
