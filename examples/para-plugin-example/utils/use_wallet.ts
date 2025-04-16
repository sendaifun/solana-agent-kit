import { solanaAgentWithPara } from "./init";
import ky from 'ky';

// The first parameter is bound automatically by the plugin system
export async function useWalletWeb(walletId: string) {
  try {
    if(!walletId){
      throw new Error("Provide `walletId` in the request body to use a wallet.");
    }
    const para = solanaAgentWithPara.methods.getParaInstance();
    const isLoggedIn = await para.isFullyLoggedIn();
    if(!isLoggedIn){
      throw new Error("Please login to Para to use a wallet.");
    }
    const userShare = await para.getUserShare();
    const session = await para.exportSession();
    // Make API request to initialize wallet
    await ky.post('/api/wallet/init', {
      json: {
        userShare,
        walletId,
        session
      }
    }).json();

    return {
      message: "Wallet used successfully.",
      walletId
    };
  } catch (error: any) {
    throw new Error(`use wallet failed ${error.message}`);
  }
}
