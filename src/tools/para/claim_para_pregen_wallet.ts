import { Para as ParaServer , Environment } from "@getpara/server-sdk";
import type { SolanaAgentKit } from "../../index";
import { Keypair,Connection } from "@solana/web3.js";
import bs58 from "bs58";


export async function claimParaPregenWallet(agent: SolanaAgentKit,email: string){
  try {
   
    if (!email) {
        throw new Error("Provide `email` in the request body to create a pre-generated wallet.");
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      throw new Error("Set PARA_API_KEY in the environment before using this handler.");
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    
   
   const recoverySecret = await para.claimPregenWallets({
    pregenIdentifier: email as string,
    pregenIdentifierType: "EMAIL"
   });
   agent.wallet = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY as string));
   agent.wallet_address = agent.wallet.publicKey;
   agent.connection = new Connection(process.env.RPC_URL as string);
   if ((agent as any).userShareMap) {
    (agent as any).userShareMap.delete(email);
  }
    return {
      message: "Pre-generated wallet claimed successfully.",
      address: recoverySecret,
      email: email
    };
  } catch (error: any) {
    throw new Error(`claim pregen wallet failed ${error.message}`);
  }
}