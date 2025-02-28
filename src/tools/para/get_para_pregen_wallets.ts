import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import type { WalletEntity } from "@getpara/server-sdk";


export async function getParaPregenWallets(email:string) {
  try {
   
  
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      throw new Error("Set PARA_API_KEY in the environment before using this handler.");
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    
    const listAllPregenWallets = await para.getPregenWallets({pregenIdentifier:email,pregenIdentifierType:"EMAIL"});

  
   


    return{
      listAllPregenWallets
    };
  } catch (error: any) {
    throw new Error(`list all pregen wallets failed ${error.message}`);
  }
}