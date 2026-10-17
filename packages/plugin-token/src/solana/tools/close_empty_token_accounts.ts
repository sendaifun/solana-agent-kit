import {
  AccountLayout,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import {
  type PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Close Empty SPL Token accounts of the agent
 * @param agent SolanaAgentKit instance
 * @returns transaction signature and total number of accounts closed
 */
export async function closeEmptyTokenAccounts(agent: SolanaAgentKit) {
  try {
    const spl_token = await create_close_instruction(agent, TOKEN_PROGRAM_ID);
    const token_2022 = await create_close_instruction(
      agent,
      TOKEN_2022_PROGRAM_ID,
    );
    const transaction = new Transaction();

    if (spl_token.length === 0 && token_2022.length === 0) {
      return {
        signature: "",
        size: 0,
      };
    }

    const MAX_INSTRUCTIONS = 40; // 40 instructions can be processed in a single transaction without failing

    const splCount = Math.min(MAX_INSTRUCTIONS, spl_token.length);
    for (let i = 0; i < splCount; i++) {
      transaction.add(spl_token[i]);
    }

    const remainingSlots = MAX_INSTRUCTIONS - splCount;
    const token2022Count = Math.min(remainingSlots, token_2022.length);
    for (let i = 0; i < token2022Count; i++) {
      transaction.add(token_2022[i]);
    }

    const size = splCount + token2022Count;

    if (agent.config.signOnly) {
      return {
        signedTransaction: (await signOrSendTX(
          agent,
          transaction,
        )) as Transaction,
        size,
      };
    }

    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signature = (await signOrSendTX(agent, transaction)) as string;

    return { signature, size };
  } catch (error) {
    throw new Error(`Error closing empty token accounts: ${error}`);
  }
}

/**
 * creates the close instructions of a spl token account
 * @param agnet SolanaAgentKit instance
 * @param token_program Token Program Id
 * @returns close instruction array
 */

async function create_close_instruction(
  agent: SolanaAgentKit,
  token_program: PublicKey,
): Promise<TransactionInstruction[]> {
  const instructions = [];

  const ata_accounts = await agent.connection.getTokenAccountsByOwner(
    agent.wallet.publicKey,
    { programId: token_program },
    "confirmed",
  );

  const tokens = ata_accounts.value;

  const accountExceptions = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  ];

  for (let i = 0; i < tokens.length; i++) {
    const token_data = AccountLayout.decode(tokens[i].account.data);
    if (
      token_data.amount === BigInt(0) &&
      !accountExceptions.includes(token_data.mint.toString())
    ) {
      const closeInstruction = createCloseAccountInstruction(
        ata_accounts.value[i].pubkey,
        agent.wallet.publicKey,
        agent.wallet.publicKey,
        [],
        token_program,
      );

      instructions.push(closeInstruction);
    }
  }

  return instructions;
}
