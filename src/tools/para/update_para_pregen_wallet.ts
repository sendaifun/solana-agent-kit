import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";


export async function updateParaPregenWallet(email: string,walletId:string){
  try {
   
    if (!email) {
        throw new Error("Provide `email` in the request body to create a pre-generated wallet.");
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      throw new Error("Set PARA_API_KEY in the environment before using this handler.");
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);
    
    const walletExists = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (walletExists) {
      throw new Error("A pre-generated wallet already exists for this user. Consider using that wallet or choose a different email.");
    }

     await para.updatePregenWalletIdentifier({
      walletId: walletId,
      newPregenIdentifier: email,
      newPregenIdentifierType: "EMAIL",
    });
  

  
   


    return{
      message: "Pre-generated wallet updated successfully.",
     walletId,
        email
    };
  } catch (error: any) {
    throw new Error(`Error updating pre-generated wallet: ${error.message}`);
  }
}