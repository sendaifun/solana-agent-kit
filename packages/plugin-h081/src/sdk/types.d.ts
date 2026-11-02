// Ambient declarations for the untyped proving libraries, limited to what this package uses.
declare module "circomlibjs" {
  export function buildPoseidon(): Promise<unknown>;
}

declare module "snarkjs" {
  export const groth16: {
    fullProve(
      input: unknown,
      wasm: string,
      zkey: string,
    ): Promise<{
      proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] };
      publicSignals: string[];
    }>;
    verify(
      vkey: unknown,
      publicSignals: string[],
      proof: unknown,
    ): Promise<boolean>;
  };
}
