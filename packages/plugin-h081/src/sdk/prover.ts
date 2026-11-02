import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
// Groth16 proving and verification via snarkjs. Proofs are formatted for
// the generated Solidity verifiers (note the swapped G2 coordinates).
import * as snarkjs from "snarkjs";

export type CircuitName =
  | "transact"
  | "grant"
  | "spend"
  | "disclose"
  | "delegate"
  | "stream";

export interface SolidityProof {
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

export interface ProofResult {
  proof: SolidityProof;
  publicSignals: bigint[];
  raw: { proof: unknown; publicSignals: string[] };
}

export type CircuitInput = Record<
  string,
  | bigint
  | number
  | string
  | (bigint | number | string)[]
  | (bigint | number | string)[][]
>;

// Resolved lazily: a CommonJS bundle has no import.meta.dirname, and a consumer that passes its own directory
// (or overrides `paths`, as integrations/core/circuits.ts does) must not fail at load time because of it.
const defaultBuildDir = () =>
  resolve(import.meta.dirname ?? process.cwd(), "..", "build", "circuits");

export class Prover {
  constructor(protected readonly buildDir: string = defaultBuildDir()) {}

  paths(name: CircuitName) {
    const dir = join(this.buildDir, name);
    return {
      wasm: join(dir, `${name}_js`, `${name}.wasm`),
      zkey: join(dir, `${name}.zkey`),
      vkey: join(dir, `${name}.vkey.json`),
    };
  }

  /** Only computes the witness. Throws if the inputs violate a constraint. */
  async witness(name: CircuitName, input: CircuitInput): Promise<void> {
    const { wasm } = this.paths(name);
    const { default: wc } = await import(
      join(this.buildDir, name, `${name}_js`, "witness_calculator.js").replace(
        /\\/g,
        "/",
      )
    );
    const calc = await wc(readFileSync(wasm));
    await calc.calculateWitness(stringify(input), true);
  }

  async prove(name: CircuitName, input: CircuitInput): Promise<ProofResult> {
    const { wasm, zkey } = this.paths(name);
    if (!existsSync(zkey)) {
      throw new Error(
        `missing proving key for ${name}; run npm run circuits:setup`,
      );
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      stringify(input),
      wasm,
      zkey,
    );
    return {
      proof: {
        a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
        b: [
          [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
          [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
        ],
        c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
      },
      publicSignals: publicSignals.map((s: string) => BigInt(s)),
      raw: { proof, publicSignals },
    };
  }

  async verify(name: CircuitName, result: ProofResult): Promise<boolean> {
    const vkey = JSON.parse(readFileSync(this.paths(name).vkey, "utf8"));
    return snarkjs.groth16.verify(
      vkey,
      result.raw.publicSignals,
      result.raw.proof as never,
    );
  }
}

function stringify(input: CircuitInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = Array.isArray(v)
      ? v.map((x) => (Array.isArray(x) ? x.map(String) : String(x)))
      : String(v);
  }
  return out;
}
