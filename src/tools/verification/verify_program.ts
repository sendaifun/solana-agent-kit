import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { BN } from "@coral-xyz/anchor";
import axios from "axios";

export interface VerificationOptions {
  libName?: string | null;
  bpfFlag?: boolean | null;
  cargoArgs?: string[] | null;
  verifyProgramId?: PublicKey | null;
}

export interface VerificationResponse {
  verificationPda: string;
  status: "success" | "error";
  message: string;
  jobId?: string;
}

/**
 * Verifies a Solana program by signing a PDA and submitting to verification
 * @param agent SolanaAgentKit instance
 * @param programId Program ID to verify
 * @param repository GitHub repository URL
 * @param commitHash Git commit hash or branch
 * @param options Additional verification options including custom verify program ID
 * @returns Object containing verification PDA address and status
 */
export async function verifyProgram(
  agent: SolanaAgentKit,
  programId: string,
  repository: string,
  commitHash: string,
  options?: VerificationOptions,
): Promise<VerificationResponse> {
  try {
    // Validate program ID
    const programPubkey = new PublicKey(programId);
    if (!PublicKey.isOnCurve(programPubkey)) {
      throw new Error("Invalid program ID");
    }

    // Check if program exists
    const programInfo = await agent.connection.getAccountInfo(programPubkey);
    if (!programInfo) {
      throw new Error(`Program ${programId} does not exist`);
    }

    // Use provided verify program ID or default to OtterSec
    const verifyProgramId =
      options?.verifyProgramId ||
      new PublicKey("vfPD3zB5TipA61PJq5qWQwJqg4mZpkZwA4Z1YFRHy6m");

    // Find PDA for verification
    const [verificationPda, bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("verification"),
        programPubkey.toBuffer(),
        agent.wallet_address.toBuffer(),
      ],
      verifyProgramId,
    );

    // Create verification data
    const verificationData = {
      repository,
      commitHash,
      buildArgs: options?.cargoArgs || [],
      buildEnv: options?.bpfFlag ? "bpf" : "sbf",
      verifier: agent.wallet_address.toString(),
    };

    // Create verification instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: agent.wallet_address, isSigner: true, isWritable: true },
        { pubkey: verificationPda, isSigner: false, isWritable: true },
        { pubkey: programPubkey, isSigner: false, isWritable: false },
        { pubkey: agent.wallet_address, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: verifyProgramId,
      data: Buffer.concat([
        Buffer.from([0]), // Instruction discriminator for verify
        Buffer.from(JSON.stringify(verificationData)),
        new BN(bump).toArrayLike(Buffer, "le", 1),
      ]),
    });

    // Sign and send verification transaction
    const transaction = new Transaction().add(instruction);
    const signature = await agent.connection.sendTransaction(
      transaction,
      [agent.wallet],
      { preflightCommitment: "confirmed" },
    );
    await agent.connection.confirmTransaction(signature);

    // Submit verification job
    const verifyResponse = await axios.post("https://verify.osec.io/verify", {
      program_id: programId,
      repository,
      commit_hash: commitHash,
      lib_name: options?.libName,
      bpf_flag: options?.bpfFlag,
      cargo_args: options?.cargoArgs,
    });

    const jobId = verifyResponse.data.job_id;

    // Monitor verification status
    let attempts = 0;
    while (attempts < 30) {
      // 5 min timeout (10s intervals)
      const status = await axios.get(`https://verify.osec.io/jobs/${jobId}`);

      if (status.data.status === "completed") {
        return {
          status: "success",
          message: "Program verification successful",
          verificationPda: verificationPda.toString(),
          jobId,
        };
      } else if (status.data.status === "failed") {
        throw new Error(
          `Verification failed: ${status.data.error || "Unknown error"}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error("Verification timed out");
  } catch (error: any) {
    console.error("Full error details:", error);
    throw error;
  }
}

/**
 * Cancel an existing program verification
 * @param agent SolanaAgentKit instance
 * @param programId Program ID to cancel verification
 * @param verifyProgramId Optional custom verify program ID
 * @returns Transaction signature
 */
export async function cancelVerification(
  agent: SolanaAgentKit,
  programId: PublicKey,
  verifyProgramId?: PublicKey,
): Promise<string> {
  // Use provided verify program ID or default
  const verificationProgramId =
    verifyProgramId ||
    new PublicKey("vfPD3zB5TipA61PJq5qWQwJqg4mZpkZwA4Z1YFRHy6m");

  // Find the verification PDA
  const [verificationPda] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("verification"),
      programId.toBuffer(),
      agent.wallet_address.toBuffer(),
    ],
    verificationProgramId,
  );

  // Create cancel instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: agent.wallet_address, isSigner: true, isWritable: true },
      { pubkey: verificationPda, isSigner: false, isWritable: true },
      { pubkey: programId, isSigner: false, isWritable: false },
    ],
    programId: verificationProgramId,
    data: Buffer.from([1]),
  });

  // Send transaction
  const transaction = new Transaction().add(instruction);
  return await agent.connection.sendTransaction(transaction, [agent.wallet]);
}

/**
 * Check verification status for a program
 * @param programId Program ID to check
 * @returns Verification status from API
 */
export async function checkVerificationStatus(programId: string): Promise<{
  is_verified: boolean;
  message: string;
  on_chain_hash: string;
  executable_hash: string;
  repo_url: string;
  commit: string;
  last_verified_at: string | null;
}> {
  const response = await axios.get(
    `https://verify.osec.io/status/${programId}`,
  );
  return response.data;
}
