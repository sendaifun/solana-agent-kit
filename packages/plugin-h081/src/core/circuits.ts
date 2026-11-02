// Proving artifacts for an agent process. The repository keeps them out of git (build/ and *.zkey are
// ignored), so the packages download the files the site ships from https://www.h081.xyz/circuits/ into
// H081_CIRCUITS_DIR on first use and check every file's sha256 against the pinned table (constants.ts) before
// it is written. The site's layout is flat (<name>.wasm, <name>.zkey, <name>.vkey.json); FlatDirProver reads
// it with the SDK's Prover unchanged.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type CircuitName, Prover } from "../sdk/prover.js";
import { AGENT_CIRCUITS, CIRCUITS_URL, CIRCUIT_HASHES } from "./constants.js";

export type ArtifactKind = "wasm" | "zkey" | "vkey";
export const ARTIFACT_FILE: Record<
  ArtifactKind,
  (name: CircuitName) => string
> = {
  wasm: (n) => `${n}.wasm`,
  zkey: (n) => `${n}.zkey`,
  vkey: (n) => `${n}.vkey.json`,
};
const KINDS: ArtifactKind[] = ["wasm", "zkey", "vkey"];

/** The SDK prover over a flat directory. */
export class FlatDirProver extends Prover {
  constructor(readonly dir: string) {
    super(dir);
  }

  override paths(name: CircuitName) {
    return {
      wasm: join(this.dir, ARTIFACT_FILE.wasm(name)),
      zkey: join(this.dir, ARTIFACT_FILE.zkey(name)),
      vkey: join(this.dir, ARTIFACT_FILE.vkey(name)),
    };
  }

  /** `witness` (used by tests on the full build tree) is not available on a flat directory. */
  override async witness(): Promise<void> {
    throw new Error("FlatDirProver has no witness calculator; use prove()");
  }
}

export const sha256Hex = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");

/** Circuits whose three files exist in `dir` (existence only; `verifyCircuits` checks hashes). */
export function missingCircuits(
  dir: string,
  names: CircuitName[] = AGENT_CIRCUITS,
): CircuitName[] {
  return names.filter((n) =>
    KINDS.some((k) => !existsSync(join(dir, ARTIFACT_FILE[k](n)))),
  );
}

/** Files in `dir` whose sha256 differs from the pinned table (missing files count as bad). */
export function verifyCircuits(
  dir: string,
  names: CircuitName[] = AGENT_CIRCUITS,
): string[] {
  const bad: string[] = [];
  for (const n of names) {
    for (const k of KINDS) {
      const file = join(dir, ARTIFACT_FILE[k](n));
      const want = CIRCUIT_HASHES[n][k];
      if (!existsSync(file) || sha256Hex(readFileSync(file)) !== want) {
        bad.push(file);
      }
    }
  }
  return bad;
}

export interface FetchOptions {
  dir: string;
  names?: CircuitName[];
  url?: string;
  fetch?: typeof fetch;
  /** re-download files that exist but whose hash is wrong (default true) */
  repair?: boolean;
  log?: (line: string) => void;
}

export interface FetchReport {
  fetched: string[];
  kept: string[];
  bytes: number;
}

/**
 * Downloads the artifacts of `names` that are missing (or corrupt, with `repair`) into `dir`, refusing any
 * file whose sha256 is not the pinned one. Writes go to a temporary name and are renamed only after the
 * hash matched, so a bad download never replaces a good file.
 */
export async function fetchCircuits(opts: FetchOptions): Promise<FetchReport> {
  const names = opts.names ?? AGENT_CIRCUITS;
  const base = (opts.url ?? CIRCUITS_URL).replace(/\/?$/, "/");
  const doFetch = opts.fetch ?? fetch;
  const log =
    opts.log ??
    (() => {
      // silent by default
    });
  mkdirSync(opts.dir, { recursive: true });
  const report: FetchReport = { fetched: [], kept: [], bytes: 0 };
  for (const n of names) {
    for (const k of KINDS) {
      const want = CIRCUIT_HASHES[n][k];
      if (!want) {
        throw new Error(
          `no pinned hash for ${n}.${k}; it cannot be fetched safely`,
        );
      }
      const file = join(opts.dir, ARTIFACT_FILE[k](n));
      if (existsSync(file)) {
        if (opts.repair === false || sha256Hex(readFileSync(file)) === want) {
          report.kept.push(file);
          continue;
        }
        log(`${file}: hash mismatch, downloading again`);
      }
      const url = base + ARTIFACT_FILE[k](n);
      log(`downloading ${url}`);
      const res = await doFetch(url);
      if (!res.ok) {
        throw new Error(`${url}: HTTP ${res.status}`);
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const got = sha256Hex(bytes);
      if (got !== want) {
        throw new Error(
          `${url}: sha256 ${got} does not match the pinned ${want}; refusing to use it`,
        );
      }
      const tmp = `${file}.part-${process.pid}`;
      writeFileSync(tmp, bytes);
      renameSync(tmp, file);
      report.fetched.push(file);
      report.bytes += bytes.length;
      log(`ok ${file} (${(bytes.length / 1e6).toFixed(1)} MB)`);
    }
  }
  return report;
}

/** Makes sure `names` are present (downloading what is missing) and returns a prover over `dir`. */
export async function ensureCircuits(
  opts: FetchOptions,
): Promise<FlatDirProver> {
  const names = opts.names ?? AGENT_CIRCUITS;
  if (missingCircuits(opts.dir, names).length) {
    await fetchCircuits({ ...opts, names, repair: opts.repair ?? true });
  }
  return new FlatDirProver(opts.dir);
}

/** Size on disk of the artifacts of `names` (0 for missing files). */
export function circuitsSize(
  dir: string,
  names: CircuitName[] = AGENT_CIRCUITS,
): number {
  let n = 0;
  for (const name of names) {
    for (const k of KINDS) {
      const f = join(dir, ARTIFACT_FILE[k](name));
      if (existsSync(f)) {
        n += statSync(f).size;
      }
    }
  }
  return n;
}
