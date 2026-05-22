import { SolanaAgentKit } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";
import { create_verification_pda } from "./create_verification_pda";

/**
 * @name        automated_verify_program
 * @description Automatically verify a Solana program by fetching metadata from GitHub and Solana
 * @param       agent
 * @param       programId
 * @param       repoUrl
 */
export async function automated_verify_program(
  agent: SolanaAgentKit,
  programId: string,
  repoUrl: string
) {
  try {
    // 1. Fetch latest commit hash from GitHub
    // Example: https://github.com/owner/repo -> api.github.com/repos/owner/repo/commits
    const repoPath = repoUrl.replace("https://github.com/", "");
    const githubResponse = await fetch(`https://api.github.com/repos/${repoPath}/commits/main`);
    const githubData = await githubResponse.json();
    const commitHash = githubData.sha;

    // 2. Fetch deployment slot from Solana
    const programPubkey = new PublicKey(programId);
    const accountInfo = await agent.connection.getParsedAccountInfo(programPubkey);
    if (!accountInfo.value) throw new Error("Program not found");
    
    // @ts-ignore
    const programDataAddress = accountInfo.value.data.parsed.info.programData;
    const programDataInfo = await agent.connection.getParsedAccountInfo(new PublicKey(programDataAddress));
    // @ts-ignore
    const deploySlot = programDataInfo.value.data.parsed.info.slot;

    // 3. Call the existing PDA creation tool
    // We'll use some sensible defaults for version and args
    const result = await create_verification_pda(agent, programId, {
      version: "0.1.0", // Default or could be fetched from Cargo.toml
      gitUrl: repoUrl,
      commit: commitHash,
      args: [], // Default empty args
      deploySlot: Number(deploySlot),
    });

    return result;
  } catch (error: any) {
    throw new Error(`Automated verification failed: ${error.message}`);
  }
}
