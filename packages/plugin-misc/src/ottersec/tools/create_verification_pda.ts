import { sendTx, SolanaAgentKit } from "solana-agent-kit";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { OTTER_SEC_PROGRAM_ID, PDA_INITIALIZE_SEED } from "../constants";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CreateVerifyPdaParam } from "../types";
import OTTER_SEC_IDL from "../constants/idl.json";

/**
 * @name        create_verification_pda
 * @description Generate a PDA for program verification
 * @param       agent
 * @param       programId
 * @param       verifyParams
 */

export async function create_verification_pda(
  agent: SolanaAgentKit,
  programId: string,
  verifyParams: CreateVerifyPdaParam
) {
  try {
    const provider = new AnchorProvider(agent.connection, agent.wallet, {});
    const program = new Program(OTTER_SEC_IDL as Idl, provider);
    const [pda, _] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(PDA_INITIALIZE_SEED),
        agent.wallet.publicKey.toBuffer(),
        new PublicKey(programId).toBuffer(),
      ],
      new PublicKey(OTTER_SEC_PROGRAM_ID)
    );
    const accounts = {
      buildParams: pda,
      authority: agent.wallet.publicKey,
      programAddress: new PublicKey(programId),
      systemProgram: SystemProgram.programId,
    };
    const instruction = await program.methods
      .initialize({
        ...verifyParams,
        deploySlot: new BN(verifyParams.deploySlot),
      })
      .accounts(accounts)
      .instruction();
    const signature = await sendTx(agent, [instruction]);

    return {
      signature,
      pda: pda.toBase58(),
    };
  } catch (error) {
    throw error;
  }
}
