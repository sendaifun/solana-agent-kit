/**
 * Updates the metadata of a Token-2022 token, including name, symbol, URI, and update authority.
 * When changing the update authority, requires NEW_UPDATE_AUTHORITY_PRIVATE_KEY in the .env file
 * containing the base58-encoded private key of the new authority.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance for transaction handling
 * @param {PublicKey} mint - The public key of the token mint to update
 * @param {string} [newName] - New name for the token. If not provided or unchanged, name update is skipped
 * @param {string} [newUri] - New URI for the token metadata. If not provided or unchanged, URI update is skipped
 * @param {string} [newSymbol] - New symbol for the token. If not provided or unchanged, symbol update is skipped
 * @param {PublicKey} [newUpdateAuthority] - Public key of the new update authority. When provided:
 *   - if the current update authority is not the wallet address, we need to pass base58-encoded private key of the current update authority as CURRENT_UPDATE_AUTHORITY_PRIVATE_KEY in the .env
 *   - The private key must correspond to this public key
 *   - Transaction will be signed by both the current and new authority
 *
 * @returns {Promise<string>} The transaction signature
 *
 * @throws {Error} If update authority is not defined for the token
 * @throws {Error} If NEW_UPDATE_AUTHORITY_PRIVATE_KEY is not set in environment variables when changing authority
 * @throws {Error} If the provided private key is invalid
 * @throws {Error} If the transaction fails
 */

import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  createUpdateFieldInstruction,
  createUpdateAuthorityInstruction,
  pack,
} from "@solana/spl-token-metadata";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { bs58 } from "@switchboard-xyz/common";
import { SolanaAgentKit } from "../../agent";
import { sendTx } from "../../utils/send_tx";
import { getTokenMintMetadata } from "../../utils/tokenMetadata";

export async function updateTokenV2Metadata(
  agent: SolanaAgentKit,
  mint: PublicKey,
  newName?: string,
  newUri?: string,
  newSymbol?: string,
  newUpdateAuthority?: PublicKey,
) {
  try {
    const metadata = await getTokenMintMetadata(agent, mint);
    // Early validation of updateAuthority
    if (!metadata.updateAuthority) {
      throw new Error("Update authority is not defined for this token");
    }

    const currentUpdateAuthority = new PublicKey(metadata.updateAuthority);

    // Check if we're the current authority
    const isWalletCurrentAuthority = currentUpdateAuthority.equals(
      agent.wallet_address,
    );

    // If we're not the current authority, we need the current authority's keypair
    let currentUpdateAuthorityKeypair: Keypair | undefined;

    if (!isWalletCurrentAuthority) {
      // Get the new update authority from environment variable, we do this because we have to sign the transaction with the new authority that is being updated.
      const currentUpdateAuthoritySecret =
        process.env.CURRENT_UPDATE_AUTHORITY_PRIVATE_KEY;
      if (!currentUpdateAuthoritySecret) {
        throw new Error(
          "NEW_UPDATE_AUTHORITY_PRIVATE_KEY is not set in environment variables",
        );
      }

      try {
        currentUpdateAuthorityKeypair = Keypair.fromSecretKey(
          bs58.decode(currentUpdateAuthoritySecret),
        );
      } catch (error: any) {
        throw new Error(
          `Invalid new update authority private key: ${error.message}`,
        );
      }
    }

    const instructions: TransactionInstruction[] = [];

    if (newName && newName !== metadata.name) {
      instructions.push(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
          ),
          data: Buffer.from(newName),
        }),
      );
      instructions.push(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: new PublicKey(currentUpdateAuthority),
          field: "name",
          value: newName,
        }),
      );
    }

    if (newSymbol && newSymbol !== metadata.symbol) {
      instructions.push(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: new PublicKey(currentUpdateAuthority),
          field: "symbol",
          value: newSymbol,
        }),
      );
    }

    if (newUri && newUri !== metadata.uri) {
      instructions.push(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: new PublicKey(currentUpdateAuthority),
          field: "uri",
          value: newUri,
        }),
      );
    }

    if (
      newUpdateAuthority &&
      newUpdateAuthority.toString() !== metadata.updateAuthority.toString()
    ) {
      const args = {
        metadata: mint,
        newAuthority: newUpdateAuthority,
        oldAuthority: new PublicKey(currentUpdateAuthority),
        programId: TOKEN_2022_PROGRAM_ID,
      };

      instructions.push(createUpdateAuthorityInstruction(args));
    }

    const oldMetadataLength =
      pack({
        additionalMetadata: metadata?.additionalMetadata || [],
        mint: PublicKey.default,
        symbol: metadata.symbol,
        name: metadata.name,
        uri: metadata.uri,
      }).length + 4;

    const newMetadataLength =
      pack({
        additionalMetadata: [],
        mint: PublicKey.default,
        symbol: newSymbol ?? metadata.symbol,
        name: newName ?? metadata.name,
        uri: newUri ?? metadata.uri,
      }).length + 4;

    const mintLamports =
      await agent.connection.getMinimumBalanceForRentExemption(
        newMetadataLength - oldMetadataLength,
      );
    if (mintLamports > 0) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: agent.wallet_address,
          toPubkey: new PublicKey(mint),
          lamports: mintLamports,
        }),
      );
    }

    // Sign transaction with the appropriate keypair(s)
    let signature: string;
    if (currentUpdateAuthorityKeypair) {
      // If we're not the current authority, we need both signatures
      signature = await sendTx(agent, instructions, [
        currentUpdateAuthorityKeypair,
      ]);
    } else {
      // If we are the current authority, we only need the wallet signature
      signature = await sendTx(agent, instructions);
    }

    return signature;
  } catch (error) {
    throw Error(
      `failed to update metadata for token v2 (token2022) asset: ${error}`,
    );
  }
}
