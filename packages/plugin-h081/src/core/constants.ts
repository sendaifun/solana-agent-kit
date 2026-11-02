// Mainnet addresses and fixed values of the H081 Capital bank, copied from docs/MAINNET-RUNBOOK.md (never
// from transaction history), plus the configuration both agent integrations read from the environment.
//
// Every id can be overridden through the environment (another cluster, a rehearsal validator); the defaults
// are mainnet. The RPC default is the public mainnet endpoint: no private RPC key is ever embedded.
import { homedir } from "node:os";
import { join } from "node:path";
import { PublicKey } from "@solana/web3.js";
import type { CircuitName } from "../sdk/prover.js";
import { LOCALNET_LOAN_PROGRAM_ID } from "../sdk/solana/lender.js";
import { LOCALNET_POOL_PROGRAM_ID } from "../sdk/solana/program.js";
import { LOCALNET_CAPACITY_STAKE_PROGRAM_ID } from "../sdk/solana/token.js";

export const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";

/** docs/MAINNET-RUNBOOK.md section 0 and Phase 2. */
export const MAINNET = {
  cluster: "mainnet-beta",
  programs: {
    pool: "E16DKmtrYtYGp7guSso25Pvq8gzKunnUULU28RmRmDGM",
    loan: "8JBd7epQXxdcKRMaWM1S5PC7nsQKoZq3uCetpiJ684g4",
    safety: "HmzKNPn8LaRyjmggt2uT95B7KvphtoVXQkeVc2HHARTt",
    capacity: "CH1rrfFyJMVn158UHL2fLpKTtoLJojrz5f68toMQdQKU",
  },
  accounts: {
    usdgVault: "FaRG7DV8e7XF3RyoZrBb3h1oLiFFWFFCuYDSXsDoyyzG",
    loanRegistry: "5MMWdQWZB3JWTCZXZsEGSLWegi9bk9iSitT9avdLo4Kt",
    safetyPool: "91QLL95oPgJF8yjWeKb41yMs5Z48UPd9mTXMH7xppoQA",
    capacityConfig: "7QuqMc95ry9sjeem5gsS4SNQzoQfoHqVwSvAcSFq8uKS",
  },
  usdg: {
    mint: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
    symbol: "USDG",
    decimals: 6,
    tokenProgram: "Token-2022",
  },
  h081: {
    mint: "EgqxxR7zowzaLEm24oep5qqBieLVAWYX78LhgeqAJAo",
    symbol: "H081",
    decimals: 6,
    tokenProgram: "SPL Token",
  },
  /** stream_loan fee::TREASURY: the Squads treasury vault that receives origination and relay fees. */
  loanTreasury: "EGvxic665gsar6K3YsnuUH4qPTnv1Rb2rMu2F3GpkZGq",
  /** The treasury's USDG token account (the relayer's fee account for USDG). */
  treasuryUsdgAccount: "DxpmCZYAoDKpHmA5vWuopUrf3UVuGnPvditVrN9xDwDo",
  relayer: "https://h081-relayer.vercel.app",
  /** Deposit caps as initialized on chain; the chain is the source of truth (H081Bank.caps reads it). */
  caps: { perDeposit: 1_000_000_000n, total: 10_000_000_000n },
  /** capacity_stake caps for H081 (base units, 6 decimals). */
  stakeCaps: { perStake: 100_000_000_000n, total: 1_000_000_000_000n },
} as const;

export const NOTICE =
  "H081 Capital is live on Solana mainnet; it is not audited yet; use at your own risk.";

/** The public download location of the proving artifacts the site ships (flat layout: <name>.wasm/.zkey/.vkey.json). */
export const CIRCUITS_URL = "https://www.h081.xyz/circuits/";

/**
 * sha256 of every artifact. zkey and vkey hashes are the ceremony's (docs/CEREMONY.md, 2026-10-31); the wasm
 * hashes were computed from the files the site ships (stipend-site/public/circuits) when this package was
 * written. A download whose hash differs is refused.
 */
export const CIRCUIT_HASHES: Record<
  CircuitName,
  { wasm: string; zkey: string; vkey: string }
> = {
  transact: {
    wasm: "de160ea92a067a0f4f7560ffde5635d0f742e2c66940a7cd6595848931db56e2",
    zkey: "19115cc60b47b8ba71a8bd2ec0eb7d1973801df78d5eee52550c1daca8ca940f",
    vkey: "ea4def715d6fe7c4dd834ee973f491d80fac913b7c0a10e2a505faa0091259bb",
  },
  grant: {
    wasm: "a2e32611c206db1049062ef45eb169dd2110ba534b1e3eba313b4be7861fa50f",
    zkey: "8c1df0b58d1bdb69a60097479fa49d344af5ccbd8c21d6b625c60eeca1584200",
    vkey: "dc97feab01ec6a7678a8bafd2f3ad93fc8ed816056e009b50f3baed2575a5b28",
  },
  spend: {
    wasm: "1a874146da088a1b9143a98fb17538bf38b5aee151abec1aa2da204f6cb71a39",
    zkey: "0e5cbe9f896a611717df1c65104f2ea53ee2ae282c3a98837f564a62250651e9",
    vkey: "f019991fb96969eb5cfd5251f63899e0b273e6992910873413c296f6ac305f88",
  },
  disclose: {
    wasm: "39202583b825ac05b97fca0410c251effa813056ec1571cfac5ae160dab0fb69",
    zkey: "9ac5fc252f76779e07eee9f3e98ce430aabe8ccdb74891c99d338035625c1b24",
    vkey: "c34de1a64c403bc5f37372efbae8fe9ed82a2afd85f7ab20246d959b3e84b1b4",
  },
  delegate: {
    // the site does not ship delegate.wasm/.zkey; the ceremony hashes are kept for completeness
    wasm: "",
    zkey: "41056c1c7e2030e3229ece87d9eaf3cf9edf353a92b5c56627aaa8e2a725fef9",
    vkey: "e748f78f4c5296d1e5371cbf79bacd819a4a111160629c0377fbdb74a8f530e0",
  },
  stream: {
    wasm: "2f2fe9faa58c033eb8af1a424f34adcc48f335f142680de7317f93541f1590f4",
    zkey: "f2b821af10ccd92e2d97fded94e44037328b036ecf82162497e34746522f30fb",
    vkey: "4be743351074631c1ac3a243d4a7471b475f0e1e0cd564f21c4827486c8ade8d",
  },
};

/** Circuits an agent needs: deposit/withdraw (transact); pledge + lender proof (grant, stream). */
export const AGENT_CIRCUITS: CircuitName[] = ["transact", "grant", "stream"];
export const BANK_CIRCUITS: CircuitName[] = ["transact"];

/** Label the shielded account secret is derived from (an ed25519 signature of it by the agent's Solana key). */
export const DERIVE_LABEL = "h081/agent-account/v1";

/** SOL the signer should hold before a deposit: buffer rent (~0.0072, refunded when the buffer closes) plus fees. */
export const DEPOSIT_SOL_MIN = 0.02;

export interface H081Config {
  cluster: string;
  rpcUrl: string;
  /** undefined = no relayer: the signer sends withdrawals itself */
  relayerUrl?: string;
  circuitsDir: string;
  circuitsUrl: string;
  poolProgramId: PublicKey;
  loanProgramId: PublicKey;
  capacityProgramId: PublicKey;
  safetyProgramId: PublicKey;
  usdgMint: PublicKey;
  stakeMint: PublicKey;
  loanTreasury: PublicKey;
  decimals: number;
  /** operator ceiling per deposit, below the program cap (base units) */
  maxDeposit?: bigint;
}

export const ENV_VARS = {
  H081_SOLANA_KEYPAIR:
    "path to a Solana keypair JSON file (the agent key: pays fees, holds USDG, derives the shielded account)",
  H081_SOLANA_KEY:
    "the same key as a base58 secret (or a JSON byte array); H081_SOLANA_KEYPAIR wins when both are set",
  H081_ACCOUNT_SK:
    "optional shielded account secret (decimal or 0x hex field element); default: derived from the Solana key's secret seed",
  H081_DERIVE_ACCOUNT:
    "optional; 1 = derive the account from the key's signature over the label instead (one such signature then equals the key)",
  H081_RPC_URL:
    "Solana RPC (default https://api.mainnet-beta.solana.com; the public RPC rate-limits history scans); only its host is ever reported",
  H081_RELAYER_URL:
    "relayer for withdrawals (default https://h081-relayer.vercel.app; empty = the signer sends directly, relayed withdrawals are not attempted)",
  H081_CIRCUITS_DIR:
    "where proving artifacts are stored (default ~/.h081/circuits)",
  H081_CIRCUITS_URL:
    "where they are downloaded from (default https://www.h081.xyz/circuits/)",
  H081_POOL_PROGRAM_ID: "stipend_pool program id (default mainnet E16DK…)",
  H081_LOAN_PROGRAM_ID: "stream_loan program id (default mainnet 8JBd7…)",
  H081_CAPACITY_PROGRAM_ID:
    "capacity_stake program id (default mainnet CH1rr…)",
  H081_SAFETY_PROGRAM_ID: "safety_pool program id (default mainnet HmzKN…)",
  H081_USDG_MINT: "bank asset mint (default USDG 2u1tsz…)",
  H081_STAKE_MINT: "staking asset mint (default H081 Egqxx…)",
  H081_LOAN_TREASURY: "stream_loan fee treasury owner (default EGvxic…)",
  H081_MAX_DEPOSIT:
    "optional operator ceiling per deposit in base units, below the program cap",
} as const;

const key = (
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: string,
): PublicKey => {
  const v = env[name]?.trim();
  try {
    return new PublicKey(v || fallback);
  } catch {
    throw new Error(`${name}: ${v} is not a Solana public key`);
  }
};

/** Configuration from the environment; every value has a mainnet default except the agent key. */
export function configFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): H081Config {
  const relayerRaw = env.H081_RELAYER_URL;
  const relayerUrl =
    relayerRaw === undefined ? MAINNET.relayer : relayerRaw.trim() || undefined;
  const maxDepositRaw = env.H081_MAX_DEPOSIT?.trim();
  if (
    maxDepositRaw !== undefined &&
    maxDepositRaw !== "" &&
    !/^\d+$/.test(maxDepositRaw)
  ) {
    throw new Error("H081_MAX_DEPOSIT must be an integer in base units");
  }
  return {
    cluster: env.H081_CLUSTER?.trim() || MAINNET.cluster,
    rpcUrl: env.H081_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com",
    relayerUrl,
    circuitsDir:
      env.H081_CIRCUITS_DIR?.trim() || join(homedir(), ".h081", "circuits"),
    circuitsUrl: env.H081_CIRCUITS_URL?.trim() || CIRCUITS_URL,
    poolProgramId: key(env, "H081_POOL_PROGRAM_ID", MAINNET.programs.pool),
    loanProgramId: key(env, "H081_LOAN_PROGRAM_ID", MAINNET.programs.loan),
    capacityProgramId: key(
      env,
      "H081_CAPACITY_PROGRAM_ID",
      MAINNET.programs.capacity,
    ),
    safetyProgramId: key(
      env,
      "H081_SAFETY_PROGRAM_ID",
      MAINNET.programs.safety,
    ),
    usdgMint: key(env, "H081_USDG_MINT", MAINNET.usdg.mint),
    stakeMint: key(env, "H081_STAKE_MINT", MAINNET.h081.mint),
    loanTreasury: key(env, "H081_LOAN_TREASURY", MAINNET.loanTreasury),
    decimals: MAINNET.usdg.decimals,
    maxDeposit: maxDepositRaw ? BigInt(maxDepositRaw) : undefined,
  };
}

/** Solana's own public endpoints: no API key in the URL. */
export const PUBLIC_RPC_HOSTS = new Set([
  "api.mainnet-beta.solana.com",
  "api.devnet.solana.com",
  "api.testnet.solana.com",
]);

/**
 * The host of an RPC URL, for logs, errors and tool results. Private RPC URLs carry their API key in the path
 * or query (…/v2/<key>, ?api-key=…), which must never reach a model transcript; only the host is reported.
 */
export function rpcHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url
      .replace(/[?#].*$/, "")
      .replace(/^([a-z][a-z0-9+.-]*:\/\/[^/]+).*$/i, "$1");
  }
}

/** True when every program id in `cfg` is the mainnet one. */
export function isMainnetConfig(cfg: H081Config): boolean {
  return (
    cfg.poolProgramId.toBase58() === MAINNET.programs.pool &&
    cfg.loanProgramId.toBase58() === MAINNET.programs.loan &&
    cfg.capacityProgramId.toBase58() === MAINNET.programs.capacity &&
    cfg.usdgMint.toBase58() === MAINNET.usdg.mint
  );
}

/**
 * Refuses a cluster/id mismatch before anything is signed: mainnet with a localnet program id, or a cluster
 * that is not mainnet with the mainnet ids (a rehearsal validator must be given its own ids explicitly).
 */
export function checkCluster(cfg: H081Config, genesis: string): void {
  const localnet = [
    LOCALNET_POOL_PROGRAM_ID,
    LOCALNET_LOAN_PROGRAM_ID,
    LOCALNET_CAPACITY_STAKE_PROGRAM_ID,
  ].map((k) => k.toBase58());
  const ids = [cfg.poolProgramId, cfg.loanProgramId, cfg.capacityProgramId].map(
    (k) => k.toBase58(),
  );
  if (genesis === MAINNET_GENESIS) {
    const bad = ids.find((id) => localnet.includes(id));
    if (bad) {
      throw new Error(
        `${bad} is a localnet program id; the RPC ${rpcHost(cfg.rpcUrl)} is mainnet-beta`,
      );
    }
  } else if (isMainnetConfig(cfg)) {
    throw new Error(
      `the RPC ${rpcHost(cfg.rpcUrl)} is not mainnet-beta (genesis ${genesis}) but the program ids are the mainnet ones; set H081_*_PROGRAM_ID and H081_USDG_MINT for that cluster`,
    );
  }
}
