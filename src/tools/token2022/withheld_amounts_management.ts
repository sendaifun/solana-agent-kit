import { SolanaAgentKit } from "../../agent";
import {
  createAssociatedTokenAccountInstruction,
  createHarvestWithheldTokensToMintInstruction,
  createWithdrawWithheldTokensFromAccountsInstruction,
  createWithdrawWithheldTokensFromMintInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TransactionInstruction } from "@solana/web3.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { sendTx } from "../../utils/send_tx";
import {
  accountExists,
  getAssociatedTokenPDA,
} from "../../utils/tokenMetadata";

/**
 * Returns array of transactions needed to claim all withheld tokens for a given mint
 * @agent SolanaAgentKit instance
 * @param mint
 * @param payer
 * @param authority
 * @param srcAccounts
 */
export async function claimWithheldTokens(
  agent: SolanaAgentKit,
  mint: PublicKey,
  authority: PublicKey,
  srcAccounts: PublicKey[],
  payer?: PublicKey,
): Promise<string[]> {
  try {
    const signatures: string[] = [];

    //Get destination account
    const dstAcc = await getAssociatedTokenPDA(
      mint,
      payer || agent.wallet_address,
      TOKEN_2022_PROGRAM_ID,
    );

    if (!(await accountExists(agent, dstAcc))) {
      const instructions: TransactionInstruction[] = [];

      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 42_000 }),
        createAssociatedTokenAccountInstruction(
          payer || agent.wallet_address,
          dstAcc,
          payer || agent.wallet_address,
          mint,
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      //Withdraw from mint account too
      instructions.push(
        createWithdrawWithheldTokensFromMintInstruction(
          mint,
          dstAcc,
          payer || agent.wallet_address,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      // Sign and send the transaction
      const signature = await sendTx(agent, instructions);

      signatures.push(signature);
    } else {
      const instructions: TransactionInstruction[] = [];
      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 }),
        createWithdrawWithheldTokensFromMintInstruction(
          mint,
          dstAcc,
          agent.wallet_address,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );
      // Sign and send the transaction
      const signature = await sendTx(agent, instructions);

      signatures.push(signature);
    }

    for (let i = 0; i < srcAccounts.length; i += 30) {
      const instructions: TransactionInstruction[] = [];
      instructions.push(
        createWithdrawWithheldTokensFromAccountsInstruction(
          mint,
          dstAcc,
          authority,
          [],
          srcAccounts.slice(i, i + 30),
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      // Sign and send the transaction
      const signature = await sendTx(agent, instructions);

      signatures.push(signature);
    }
    return signatures;
  } catch (error: any) {
    throw new Error(`Failed to claim withheld tokens: ${error.message}`);
  }
}

/**
 * Claims withheld tokens from the mint account
 * @agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param payer
 * @returns Transaction signature
 */
export async function claimWithheldTokensFromMint(
  agent: SolanaAgentKit,
  mint: PublicKey,
  payer?: PublicKey,
) {
  try {
    //get destination acc
    const dstAcc = await getAssociatedTokenPDA(
      mint,
      payer || agent.wallet_address,
      TOKEN_2022_PROGRAM_ID,
    );
    const instructions: TransactionInstruction[] = [];

    if (!(await accountExists(agent, dstAcc))) {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 42_000 }),
        createAssociatedTokenAccountInstruction(
          payer || agent.wallet_address,
          dstAcc,
          payer || agent.wallet_address,
          mint,
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    } else {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 }),
      );
    }

    //Withdraw from mint account too
    instructions.push(
      createWithdrawWithheldTokensFromMintInstruction(
        mint,
        dstAcc,
        payer || agent.wallet_address,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    // Sign and send the transaction
    const signature = await sendTx(agent, instructions);

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to claim tokens from mint: ${error.message}`);
  }
}

/**
 * Harvests withheld tokens to mint (permissionless)
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param srcAccounts Source accounts to harvest from
 * @returns Array of transaction signatures
 */
export async function claimWithheldTokensToMint(
  agent: SolanaAgentKit,
  mint: PublicKey,
  srcAccounts: PublicKey[],
) {
  try {
    const signatures = [];

    for (let i = 0; i < srcAccounts.length; i += 30) {
      const instructions: TransactionInstruction[] = [];

      instructions.push(
        createHarvestWithheldTokensToMintInstruction(
          mint,
          srcAccounts.slice(i, i + 30),
        ),
      );

      // Sign and send the transaction
      const signature = await sendTx(agent, instructions);

      signatures.push(signature);
    }
    return signatures;
  } catch (error: any) {
    throw new Error(`Failed to harvest tokens to mint: ${error.message}`);
  }
}
