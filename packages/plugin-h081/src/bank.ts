// One H081Bank per SolanaAgentKit instance, opened on first use. The agent's own connection is used unless
// H081_RPC_URL names another RPC (never a private key embedded here; the agent brings its RPC).
import type { SolanaAgentKit } from "solana-agent-kit";
import { configFromEnv } from "./core/constants.js";
import { openFromEnv } from "./core/open.js";
import type { BankLike } from "./core/operations.js";
import { signerFromAgent } from "./signer.js";

export type AgentLike = Pick<SolanaAgentKit, "wallet" | "connection">;
export type BankProvider = (agent: AgentLike) => Promise<BankLike>;

const banks = new WeakMap<object, Promise<BankLike>>();
let provider: BankProvider = defaultProvider;

async function defaultProvider(agent: AgentLike): Promise<BankLike> {
  const env = process.env;
  const config = configFromEnv(env);
  const signer = signerFromAgent(agent, env);
  // the agent's own connection unless H081_RPC_URL names another RPC
  const useAgentRpc = !env.H081_RPC_URL?.trim() && Boolean(agent.connection);
  const { bank } = await openFromEnv({
    env,
    signer,
    config: useAgentRpc
      ? { ...config, rpcUrl: agent.connection.rpcEndpoint }
      : config,
    connection: useAgentRpc ? agent.connection : undefined,
    log: (line) => process.stderr.write(`h081: ${line}\n`),
  });
  return bank;
}

/** The bank for `agent` (opened once; a failed open is retried on the next call). */
export function bankFor(agent: AgentLike): Promise<BankLike> {
  let p = banks.get(agent);
  if (!p) {
    p = provider(agent).catch((e) => {
      banks.delete(agent);
      throw e;
    });
    banks.set(agent, p);
  }
  return p;
}

/** Replaces how banks are opened (tests pass a mock); returns the previous provider. */
export function setBankProvider(next: BankProvider | undefined): BankProvider {
  const prev = provider;
  provider = next ?? defaultProvider;
  return prev;
}

/** Forgets the bank opened for `agent`. */
export function resetBank(agent: AgentLike): void {
  banks.delete(agent);
}
