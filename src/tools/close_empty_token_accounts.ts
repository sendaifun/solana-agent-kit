import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import {
  AccountLayout,
  createCloseAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Close Empty SPL Token accounts of the agent
 * @param agent SolanaAgentKit instance
 * @returns transaction signature and total number of accounts closed
 */
export async function closeEmptyTokenAccounts(
  agent: SolanaAgentKit,
): Promise<{ signature: string; size: number }> {
  try {
    const spl_token = await create_close_instruction(agent, TOKEN_PROGRAM_ID);
    const token_2022 = await create_close_instruction(
      agent,
      TOKEN_2022_PROGRAM_ID,
    );
    const transaction = new Transaction();

    spl_token.forEach((instruction) => transaction.add(instruction));
    token_2022.forEach((instruction) => transaction.add(instruction));

    const signature = await agent.connection.sendTransaction(transaction, [
      agent.wallet,
    ]);
    const size = spl_token.length + token_2022.length;
    return {
      signature,
      size,
    };
  } catch (error) {
    throw new Error(`Error closing empty token accounts: ${error}`);
  }
}

/**
 * creates the close instuctions of a spl token account
 * @param agnet SolanaAgentKit instance
 * @param token_program Token Program Id
 * @returns close instuction array
 */

async function create_close_instruction(
  agent: SolanaAgentKit,
  token_program: PublicKey,
): Promise<TransactionInstruction[]> {
  const instructions = [];

  const ata_accounts = await agent.connection.getTokenAccountsByOwner(
    agent.wallet_address,
    { programId: token_program },
    "confirmed",
  );

  const tokens = ata_accounts.value;
  const size = tokens.length > 25 ? 24 : tokens.length; // closing 24 accounts in a single transaction

  const accountExceptions = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  ];

  for (let i = 0; i < size; i++) {
    const token_data = AccountLayout.decode(tokens[i].account.data);
    if (
      token_data.amount === BigInt(0) &&
      !accountExceptions.includes(token_data.mint.toString())
    ) {
      const closeInstruction = createCloseAccountInstruction(
        ata_accounts.value[i].pubkey,
        agent.wallet_address,
        agent.wallet_address,
        [],
        token_program,
      );

      instructions.push(closeInstruction);
    }
  }

  return instructions;
}
