import { Para as ParaServer , Environment } from "@getpara/server-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import type{ SolanaAgentKit } from "../../index";
import { Keypair, PublicKey, Transaction, VersionedTransaction, SendOptions, Signer } from "@solana/web3.js";

// Create a wrapper class that extends ParaSolanaWeb3Signer and implements necessary properties
class ParaSolanaWeb3SignerAdapter extends ParaSolanaWeb3Signer {
  // Add required properties from Keypair
  public publicKey: PublicKey;
  public secretKey: Uint8Array = new Uint8Array(64); // Dummy secretKey
  
  constructor(para: ParaServer, connection: any) {
    super(para, connection);
    // Convert address to PublicKey if it exists
    this.publicKey = this.sender ? new PublicKey(this.sender) : new PublicKey("11111111111111111111111111111111");
  }
}

export async function useParaPregenWallet( agent: SolanaAgentKit,userShare: string){
  try {
   
    if (!userShare) {
        throw new Error("Provide `userShare` in the request body to create a pre-generated wallet.");
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      throw new Error("Set PARA_API_KEY in the environment before using this handler.");
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    
    
    await para.setUserShare(userShare);
   
    // Create the Para Solana Signer with our adapter
    const solanaSigner = new ParaSolanaWeb3SignerAdapter(para, agent.connection);
   
    // Convert address to PublicKey and set wallet properties
    agent.wallet_address = solanaSigner.publicKey;
    agent.wallet = solanaSigner as unknown as Keypair;
    
   
    
    // Type assertion for Connection with monkey-patched sendTransaction
    const connection = agent.connection as any;
    
    // Override the sendTransaction method to use our custom signer
    connection.sendTransaction = async function(
      transaction: Transaction | VersionedTransaction,
      signersOrOptions?: Signer[] | SendOptions,
      options?: SendOptions
    ): Promise<string> {
      try {
        if ('feePayer' in transaction && !transaction.feePayer) {
          transaction.feePayer = solanaSigner.publicKey;
        }
        // Use the Para signer to sign and send the transaction directly
        // This returns the transaction signature
        return await solanaSigner.sendTransaction(transaction as any, options);
      } catch (error) {
        console.error("Error in sendTransaction:", error);
        throw error;
      }
    };

    return {
      message: "Pre-generated wallet used successfully.",
      address: solanaSigner.address,
   
      
    };
  } catch (error: any) {
    throw new Error(`use pregen wallet failed ${error.message}`);
  }
}