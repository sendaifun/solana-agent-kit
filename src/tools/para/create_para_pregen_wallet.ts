import {
  Para as ParaServer,
  Environment,
  WalletType,
} from "@getpara/server-sdk";

export async function createParaPregenWallet(email: string) {
  try {
    if (!email) {
      throw new Error(
        "Provide `email` in the request body to create a pre-generated wallet.",
      );
    }

    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      throw new Error(
        "Set PARA_API_KEY in the environment before using this handler.",
      );
    }

    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    const walletExists = await para.hasPregenWallet({
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (walletExists) {
      throw new Error(
        "A pre-generated wallet already exists for this user. Consider using that wallet or choose a different email.",
      );
    }

    const wallet = await para.createPregenWallet({
      type: WalletType.SOLANA,
      pregenIdentifier: email,
      pregenIdentifierType: "EMAIL",
    });
    if (!wallet) {
      throw new Error(
        "Failed to create pre-generated wallet. Check your Para configuration and try again.",
      );
    }
    const userShare = await para.getUserShare();
    if (!userShare) {
      throw new Error("Failed to get user share");
    }

    return {
      message: "Pre-generated wallet created successfully.",
      address: wallet.address,
      email,
      walletId: wallet.id,
      userShare,
    };
  } catch (error: any) {
    throw new Error(`create pregen wallet failed ${error.message}`);
  }
}
