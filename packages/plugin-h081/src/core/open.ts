// Opening a bank from the environment: config, the agent key, the shielded account secret, and a prover
// that downloads a circuit's artifacts (hash-checked) the first time that circuit is needed.
import type { Connection, Keypair } from "@solana/web3.js";
import type { CircuitInput, CircuitName, ProofResult } from "../sdk/prover.js";
import { H081Bank } from "./bank.js";
import { FlatDirProver, fetchCircuits, missingCircuits } from "./circuits.js";
import { type H081Config, configFromEnv } from "./constants.js";
import { type AccountSource, accountSkFromEnv, loadKeypair } from "./keys.js";

/** FlatDirProver that fetches a circuit's files on first use. */
export class AutoFetchProver extends FlatDirProver {
  private readonly inflight = new Map<CircuitName, Promise<void>>();

  constructor(
    dir: string,
    private readonly url: string,
    private readonly fetchImpl?: typeof fetch,
    private readonly log?: (line: string) => void,
  ) {
    super(dir);
  }

  ensure(name: CircuitName): Promise<void> {
    if (missingCircuits(this.dir, [name]).length === 0) {
      return Promise.resolve();
    }
    let p = this.inflight.get(name);
    if (!p) {
      p = fetchCircuits({
        dir: this.dir,
        names: [name],
        url: this.url,
        fetch: this.fetchImpl,
        log: this.log,
      })
        .then(() => undefined)
        .finally(() => this.inflight.delete(name));
      this.inflight.set(name, p);
    }
    return p;
  }

  override async prove(
    name: CircuitName,
    input: CircuitInput,
  ): Promise<ProofResult> {
    await this.ensure(name);
    return super.prove(name, input);
  }

  override async verify(
    name: CircuitName,
    result: ProofResult,
  ): Promise<boolean> {
    await this.ensure(name);
    return super.verify(name, result);
  }
}

export interface OpenOptions {
  env?: NodeJS.ProcessEnv;
  /** the agent key; default: from the environment (keys.ts) */
  signer?: Keypair;
  config?: H081Config;
  /** an existing connection (default: one to config.rpcUrl) */
  connection?: Connection;
  fetch?: typeof fetch;
  log?: (line: string) => void;
  /** circuits to download before returning (default none: each is fetched when first needed) */
  prefetch?: CircuitName[];
  skipClusterCheck?: boolean;
}

export interface Opened {
  bank: H081Bank;
  config: H081Config;
  /** false only with H081_ACCOUNT_SK */
  accountDerived: boolean;
  /** `seed` (default), `signature` (H081_DERIVE_ACCOUNT=1) or `env` (H081_ACCOUNT_SK) */
  accountSource: AccountSource;
}

/** Config + key + account + prover from the environment, then H081Bank.open. Sends nothing. */
export async function openFromEnv(opts: OpenOptions = {}): Promise<Opened> {
  const env = opts.env ?? process.env;
  const config = opts.config ?? configFromEnv(env);
  const signer = opts.signer ?? loadKeypair(env);
  const { sk, derived, source, derivation } = accountSkFromEnv(signer, env);
  const prover = new AutoFetchProver(
    config.circuitsDir,
    config.circuitsUrl,
    opts.fetch,
    opts.log,
  );
  for (const name of opts.prefetch ?? []) {
    await prover.ensure(name);
  }
  const bank = await H081Bank.open({
    config,
    signer,
    accountSk: sk,
    derivation,
    accountSource: source,
    connection: opts.connection,
    prover,
    fetch: opts.fetch,
    log: opts.log,
    skipClusterCheck: opts.skipClusterCheck,
  });
  return { bank, config, accountDerived: derived, accountSource: source };
}
