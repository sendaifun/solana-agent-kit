import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import { SolanaAgentKit } from "../../agent";
import { BN } from "@coral-xyz/anchor";

export interface VerificationOptions {
  libName?: string;
  bpfFlag?: boolean;
  cargoArgs?: string[];
  verifyProgramId?: PublicKey;
}

export interface VerificationResponse {
  verificationPda: string;
  status: "success" | "error";
  message: string;
  jobId?: string;
}

/**
 * Verify a Solana program using various verification services
 * @param agent SolanaAgentKit instance
 * @param programId Program ID to verify
 * @param repository GitHub repository URL
 * @param commitHash Commit hash to verify defaults to the latest commit
 * @param options Additional verification options
 * @returns Object containing Verification PDA Address and Verification Status
 */
export async function verifyProgram(
  agent: SolanaAgentKit,
  programId: string,
  repository: string,
  commitHash?: string,
  options?: VerificationOptions,
): Promise<VerificationResponse> {
  try {
    //validate Program ID
    if (!PublicKey.isOnCurve(programId)) {
      throw new Error("Invalid Program ID");
    }

    //validate Repository
    if (!repository) {
      throw new Error("Invalid Repository");
    }

    //validate Commit Hash
    if (commitHash && !/^[a-f0-9]{40}$/.test(commitHash)) {
      throw new Error("Invalid Commit Hash");
    }

    if (!commitHash) {
      const latestCommit = await fetchLatestCommit(repository);
      commitHash = latestCommit.sha;
    }

    //using the provided verifyProgramId or default to OtterSec
    const verifyProgramId =
      options?.verifyProgramId ||
      new PublicKey("vfPD3zB5TipA61PJq5qWQwJqg4mZpkZwA4Z1YFRHy6m");

    //Find PDA for Verification
    const [verificationPda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("verification"),
        verifyProgramId.toBuffer(),
        agent.wallet_address.toBuffer(),
      ],
      verifyProgramId,
    );

    //creating the verification Data
    const verificationData = {
      repository: repository,
      commitHash: commitHash,
      buildArgs: options?.cargoArgs || [],
      buildEnv: options?.bpfFlag ? "bpf" : "sbf",
      verifier: agent.wallet_address.toString(),
    };

    //create Verification Instruction
    const verificationInstruction = new TransactionInstruction({
      keys: [
        { pubkey: agent.wallet_address, isSigner: true, isWritable: true },
        { pubkey: verificationPda, isSigner: false, isWritable: true },
        {
          pubkey: new PublicKey(programId),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: verifyProgramId,
      data: Buffer.concat([
        Buffer.from([0]),
        Buffer.from(JSON.stringify(verificationData)),
        new BN(bump).toArrayLike(Buffer, "le", 1),
      ]),
    });

    //send the verification instruction
    const transaction = new Transaction().add(verificationInstruction);
    const signature = await agent.connection.sendTransaction(
      transaction,
      [agent.wallet],
      {
        preflightCommitment: "confirmed",
      },
    );
    await agent.connection.confirmTransaction(signature);

    //submit the verification result to the verification service
    const verificationResult = await verifyOsec(
      repository,
      programId,
      commitHash,
      options?.libName,
      options?.bpfFlag,
      options?.cargoArgs,
    );

    const jobID = verificationResult.jobId;

    //Monitor the verification result
    const verificationStatus = await monitorVerification(
      jobID!,
      verificationPda,
    );

    return verificationStatus;
  } catch (error: any) {
    throw new Error(`Program verification failed: ${error.message}`);
  }
}

/**
 * Get the verification status of a program
 * @param programId Program ID to verify
 * @returns Object containing Verification Status
 */
export async function getProgramVerificationStatus(programId: string): Promise<{
  is_verified: boolean;
  message: string;
  on_chain_hash: string;
  executable_hash: string;
  repo_url: string;
  commit: string;
  last_verified_at: string | null;
}> {
  try {
    const response = await axios.get(
      `https://verify.osec.io/status/${programId}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      `Failed to get program verification status: ${error.message}`,
    );
  }
}

async function verifyOsec(
  repository: string,
  programId: string,
  commitHash: string,
  lib_name?: string,
  bpf_flag?: boolean,
  cargo_args?: string[],
): Promise<VerificationResponse> {
  try {
    const response = await axios.post(`https://verify.osec.io/verify`, {
      program_id: programId,
      repository: repository,
      commit_hash: commitHash,
      lib_name: lib_name,
      bpf_flag: bpf_flag,
      cargo_args: cargo_args,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`OSEC verification failed: ${error.message}`);
  }
}

async function monitorVerification(
  jobID: string,
  verificationPda: PublicKey,
): Promise<VerificationResponse> {
  try {
    // Monitor verification status
    let attempts = 0;
    while (attempts < 30) {
      // 5 min timeout (10s intervals)
      const status = await axios.get(`https://verify.osec.io/jobs/${jobID}`);

      if (status.data.status === "completed") {
        return {
          status: "success",
          message: "Program verification successful",
          verificationPda: verificationPda.toString(),
          jobId: jobID,
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

async function fetchLatestCommit(repository: string): Promise<{ sha: string }> {
  const _ = repository.split("/");
  const owner = _[_.length - 2];
  const repo = _[_.length - 1];

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
  );

  const data = await response.json();

  if (!data || !data.length || data.status !== 200) {
    throw new Error(
      "Failed to fetch latest commit , try to provide the commitHash",
    );
  }

  return { sha: data[0].sha };
}
