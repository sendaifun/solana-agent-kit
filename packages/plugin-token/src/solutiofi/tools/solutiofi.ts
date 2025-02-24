import SolutioFi from "@solutiofi/sdk";
import { signOrSendTX, type SolanaAgentKit } from "solana-agent-kit";
import type {
  InputAssetStruct,
  TargetTokenStruct,
  PriorityFee,
} from "../types";

let solutiofiClient: SolutioFi | null = null;

/**
 * Initialize the SolutioFi client
 * @param agent The SolanaAgentKit instance
 */
async function initClient(agent: SolanaAgentKit) {
  if (!agent.config.SOLUTIOFI_API_KEY) {
    throw new Error("SolutioFi API key not found in config");
  }

  if (!solutiofiClient) {
    solutiofiClient = new SolutioFi({
      apiKey: agent.config.SOLUTIOFI_API_KEY,
    });
    await solutiofiClient.authenticate();
  }

  return solutiofiClient;
}

/**
 * Close token accounts
 * @param agent SolanaAgentKit instance
 * @param mints Array of mint addresses to close
 */
export async function closeAccounts(agent: SolanaAgentKit, mints: string[]) {
  try {
    const client = await initClient(agent);
    const signaturesOrTxs: Awaited<ReturnType<typeof signOrSendTX>>[] = [];
    const versionedTxns = await client.close(
      agent.wallet.publicKey.toString(),
      mints,
    );
    for (const transaction of versionedTxns) {
      try {
        const { blockhash } = await agent.connection.getLatestBlockhash();
        transaction.message.recentBlockhash = blockhash;
        const signatureOrTx = await signOrSendTX(agent, transaction);
        signaturesOrTxs.push(signatureOrTx);
      } catch (error) {
        continue;
      }
    }

    return signaturesOrTxs;
  } catch (e) {
    throw new Error(`Failed to close accounts: ${e}`);
  }
}

/**
 * Burns tokens using SolutioFi
 * @param agent SolanaAgentKit instance
 * @param mints Array of mint addresses for the tokens to burn
 * @returns Array of versioned transactions
 */
export async function burnTokens(agent: SolanaAgentKit, mints: string[]) {
  try {
    const client = await initClient(agent);
    const signaturesOrTxs: Awaited<ReturnType<typeof signOrSendTX>>[] = [];

    const versionedTxns = await client.burn(
      agent.wallet.publicKey.toString(),
      mints,
    );
    for (const transaction of versionedTxns) {
      try {
        const { blockhash } = await agent.connection.getLatestBlockhash();
        transaction.message.recentBlockhash = blockhash;
        const signatureOrTx = await signOrSendTX(agent, transaction);
        signaturesOrTxs.push(signatureOrTx);
      } catch (error) {
        continue;
      }
    }
    return signaturesOrTxs;
  } catch (e) {
    throw new Error(`Failed to burn tokens: ${e}`);
  }
}

/**
 * Merge multiple tokens into one
 * @param agent SolanaAgentKit instance
 * @param inputAssets Array of input assets to merge
 * @param outputMint Output token mint address
 * @param priorityFee Transaction priority level
 */
export async function mergeTokens(
  agent: SolanaAgentKit,
  inputAssets: InputAssetStruct[],
  outputMint: string,
  priorityFee: PriorityFee,
) {
  try {
    const client = await initClient(agent);
    const signaturesOrTxs: Awaited<ReturnType<typeof signOrSendTX>>[] = [];
    const swapData = await client.merge(
      agent.wallet.publicKey.toString(),
      inputAssets,
      outputMint,
      priorityFee,
    );

    for (const txn of swapData.transactions) {
      try {
        const { blockhash } = await agent.connection.getLatestBlockhash();
        txn.transaction.message.recentBlockhash = blockhash;
        const signatureOrTx = await signOrSendTX(agent, txn.transaction);
        signaturesOrTxs.push(signatureOrTx);
      } catch (error) {
        continue;
      }
    }
    return signaturesOrTxs;
  } catch (e) {
    throw new Error(`Failed to merge tokens: ${e}`);
  }
}

/**
 * Split a token into multiple tokens
 * @param agent SolanaAgentKit instance
 * @param inputAsset Input asset to spread
 * @param targetTokens Array of target tokens and their allocations
 * @param priorityFee Transaction priority level
 */
export async function spreadToken(
  agent: SolanaAgentKit,
  inputAsset: InputAssetStruct,
  targetTokens: TargetTokenStruct[],
  priorityFee: PriorityFee,
) {
  try {
    const client = await initClient(agent);
    const signaturesOrTxs: Awaited<ReturnType<typeof signOrSendTX>>[] = [];
    const swapData = await client.spread(
      agent.wallet.publicKey.toString(),
      inputAsset,
      targetTokens,
      priorityFee,
    );

    for (const txn of swapData.transactions) {
      try {
        const { blockhash } = await agent.connection.getLatestBlockhash();
        txn.transaction.message.recentBlockhash = blockhash;
        const signatureOrTx = await signOrSendTX(agent, txn.transaction);
        signaturesOrTxs.push(signatureOrTx);
      } catch (error) {
        continue;
      }
    }
    return signaturesOrTxs;
  } catch (e) {
    throw new Error(`Failed to spread token: ${e}`);
  }
}
