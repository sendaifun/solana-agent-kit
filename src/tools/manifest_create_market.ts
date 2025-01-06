import { ManifestClient } from "@cks-systems/manifest-sdk";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

export async function manifestCreateMarket(
  agent: SolanaAgentKit,
  baseMint: PublicKey,
  quoteMint: PublicKey,
): Promise<string[]> {
  const marketKeypair: Keypair = Keypair.generate();
  const FIXED_MANIFEST_HEADER_SIZE: number = 256;
  const createAccountIx: TransactionInstruction = SystemProgram.createAccount({
    fromPubkey: agent.wallet.publicKey,
    newAccountPubkey: marketKeypair.publicKey,
    space: FIXED_MANIFEST_HEADER_SIZE,
    lamports: await agent.connection.getMinimumBalanceForRentExemption(
      FIXED_MANIFEST_HEADER_SIZE,
    ),
    programId: new PublicKey("MNFSTqtC93rEfYHB6hF82sKdZpUDFWkViLByLd1k1Ms"),
  });
  const createMarketIx = ManifestClient["createMarketIx"](
    agent.wallet.publicKey,
    baseMint,
    quoteMint,
    marketKeypair.publicKey,
  );

  const tx: Transaction = new Transaction();
  tx.add(createAccountIx);
  tx.add(createMarketIx);
  const signature = await sendAndConfirmTransaction(agent.connection, tx, [
    agent.wallet,
    marketKeypair,
  ]);
  return [signature, marketKeypair.publicKey.toBase58()];
}
