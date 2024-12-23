import { TipLink } from "@tiplink/api";
import {
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  getMint
} from "@solana/spl-token";
import { SolanaAgentKit } from "../index";

/**
 * Creates a TipLink and transfers the specified amount of SOL to the TipLink.
 * @param {SolanaAgentKit} agent - Instance of SolanaAgentKit, contains wallet and connection details.
 * @param {number} amountSol - The amount of SOL (in whole numbers) to transfer to the TipLink.
 * @returns {Promise<{url: string, signature: string}>}
 * - url: The generated TipLink URL for the recipient to claim funds.
 * - signature: The transaction signature of the SOL transfer.
 */
export async function create_TipLink(
  agent: SolanaAgentKit,
  amount: number,
  splmintAddress?:PublicKey,
): Promise<{
  url: string,
  signature: string;
}> {
  try {
    // Create a new TipLink
    const tiplink = await TipLink.create();
    if(!splmintAddress){
      const tiplink = await TipLink.create();

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet_address,
          toPubkey: tiplink.keypair.publicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );
  
      const signature = await sendAndConfirmTransaction(
        agent.connection,
        transaction,
        [agent.wallet],
        { commitment: "confirmed" },
      );
      if(signature===null){
        throw "Unable to find tiplink's Public key"
      }
      return{
        url: tiplink.url.toString(),
        signature,
      };
    }else{
      const fromAta = await getAssociatedTokenAddress(splmintAddress, agent.wallet_address);
      const toAta = await getAssociatedTokenAddress(splmintAddress,tiplink.keypair.publicKey);
      
      // Get mint info to determine decimals
      const mintInfo = await getMint(agent.connection, splmintAddress);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet_address,
          adjustedAmount
        )
      );

      const signature = await sendAndConfirmTransaction(
        agent.connection,
        transaction,
        [agent.wallet]
      );
      return  {
        url: tiplink.url.toString(),
        signature,
      };
    } 
  } catch (error: any) {
    throw new Error(`Failed to create TipLink: ${error.message}`);
  }
}


